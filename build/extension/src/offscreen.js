/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
(() => {
  const STATE = {
    loading: null,
    loadedLanguages: new Set(),
    workerClient: null,
    workerLoading: null,
    workerLoadedLanguages: new Set(),
    directScriptLoading: null,
    currentJobId: "",
    currentRequestId: "",
    checkCount: 0,
    staleResponses: 0,
    workerFallbacks: 0,
    slowBatches: [],
    scheduler: {
      poolSize: 2,
      slowBatchThresholdMs: 1500,
      adaptiveBatchShrinkAtMs: 1800,
      lastSplitBatch: null,
      lastSlowBatchAt: 0
    },
    lastCheck: null,
    preloadStatus: {
      phase: "cold",
      percent: 0,
      message: "Motor encara no inicialitzat",
      language: "",
      startedAt: 0,
      finishedAt: 0,
      durationMs: 0,
      error: ""
    }
  };

  function setPreloadStatus(patch) {
    STATE.preloadStatus = {
      ...STATE.preloadStatus,
      ...patch,
      updatedAt: Date.now()
    };
  }

  function getCacheSaveStatus(engine, language) {
    const diagnostics = engine?.getLoadStatus?.() || null;
    const loadDiagnostics = diagnostics?.loadDiagnostics || {};
    const languageLoad = loadDiagnostics[`language:${language}`] || {};
    const compiledLoad = loadDiagnostics[`compiled-cache:${language}`] || {};
    const compiledSave = loadDiagnostics[`compiled-cache-save:${language}`] || {};
    return {
      diagnostics,
      languageLoad,
      compiledLoad,
      compiledSave,
      cacheRestored: compiledLoad.ok === true && languageLoad.compiledCache === true,
      cacheSaved: compiledSave.ok === true,
      cacheSavePending: !!languageLoad.loaded && languageLoad.compiledCache === false && compiledSave.ok !== true && compiledSave.ok !== false
    };
  }

  function ensureWorkerClient() {
    if (STATE.workerClient) return STATE.workerClient;
    if (!globalThis.CorrectorEngineWorkerClient) throw new Error("Client del worker no disponible");
    STATE.workerClient = new globalThis.CorrectorEngineWorkerClient({
      workerUrl: "src/engine-worker.js",
      poolSize: STATE.scheduler.poolSize,
      timeoutMs: 50000
    });
    return STATE.workerClient;
  }

  function rememberSlowBatch(entry) {
    const durationMs = Number(entry?.durationMs || 0);
    if (durationMs < STATE.scheduler.slowBatchThresholdMs) return;
    const item = {
      at: Date.now(),
      ...entry,
      textSamples: (Array.isArray(entry?.textSamples) ? entry.textSamples : []).slice(0, 8).map(text => String(text || "").slice(0, 220)),
      ruleIds: (Array.isArray(entry?.ruleIds) ? entry.ruleIds : []).slice(0, 16)
    };
    STATE.slowBatches.push(item);
    if (STATE.slowBatches.length > 30) STATE.slowBatches.shift();
    STATE.scheduler.lastSlowBatchAt = item.at;
  }

  function summarizeBatchIssues(results) {
    const ruleCounts = new Map();
    for (const result of Array.isArray(results) ? results : []) {
      for (const issue of Array.isArray(result?.issues) ? result.issues : []) {
        const id = String(issue?.ruleId || issue?.id || "UNKNOWN");
        ruleCounts.set(id, (ruleCounts.get(id) || 0) + 1);
      }
    }
    return Array.from(ruleCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([ruleId, count]) => ({ ruleId, count }));
  }

  function workerDiagnostics() {
    return STATE.workerClient?.getLocalDiagnostics?.() || {
      workerAlive: false,
      pending: 0,
      starts: 0,
      restarts: 0,
      requests: 0,
      resolved: 0,
      rejected: 0,
      timeouts: 0,
      staleResponses: 0
    };
  }

  function currentReadiness(language = "ca") {
    const engine = globalThis.CorrectorLocalEngine || null;
    const cache = getCacheSaveStatus(engine, language);
    const worker = workerDiagnostics();
    const loaded = STATE.loadedLanguages.has(language) || STATE.workerLoadedLanguages.has(language);
    let percent = Number(STATE.preloadStatus.percent || 0);
    let phase = STATE.preloadStatus.phase || "cold";
    let message = STATE.preloadStatus.message || "Motor encara no inicialitzat";

    if (STATE.workerLoading) {
      percent = Math.max(percent, 45);
      phase = "worker-loading-full";
      message = "Worker carregant recursos LanguageTool i diccionaris";
    } else if (STATE.workerLoadedLanguages.has(language)) {
      percent = 100;
      phase = "worker-ready-full";
      message = "Motor complet carregat dins el worker";
    } else if (!engine?.checkText && !worker.workerAlive) {
      percent = Math.max(percent, 5);
      phase = phase === "cold" ? "script-pending" : phase;
      message = "Script del motor pendent";
    } else if (STATE.loading) {
      percent = Math.max(percent, 45);
      phase = "loading-full";
      message = "Carregant recursos LanguageTool i diccionaris";
    } else if (loaded) {
      if (cache.cacheRestored || cache.cacheSaved) {
        percent = 100;
        phase = "ready-full";
        message = cache.cacheRestored ? "Motor complet restaurat de cache" : "Motor complet carregat i cache guardada";
      } else if (cache.cacheSavePending) {
        percent = Math.max(percent, 92);
        phase = "ready-saving-cache";
        message = "Motor complet usable; guardant cache en segon pla";
      } else {
        percent = Math.max(percent, 88);
        phase = "ready-full";
        message = "Motor complet usable";
      }
    } else {
      percent = Math.max(percent, 15);
      phase = "engine-ready";
      message = language === "es-ES" ? "Motor carregat; falta carregar castellà" : "Motor carregat; falta carregar català";
    }

    return {
      ...STATE.preloadStatus,
      phase,
      percent: Math.max(0, Math.min(100, Math.round(percent))),
      message,
      language,
      loaded,
      engineAvailable: !!engine?.checkText || !!worker.workerAlive,
      workerAvailable: !!worker.workerAlive,
      workerLoaded: STATE.workerLoadedLanguages.has(language),
      worker,
      cacheRestored: !!cache.cacheRestored,
      cacheSaved: !!cache.cacheSaved,
      cacheSavePending: !!cache.cacheSavePending,
      languageDurationMs: cache.languageLoad.durationMs,
      words: cache.languageLoad.words,
      compiledCache: cache.languageLoad.compiledCache === true,
      diagnostics: cache.diagnostics
    };
  }

  async function ensureDirectEngineScript() {
    if (!globalThis.CorrectorLocalEngine?.checkText) {
      if (!STATE.directScriptLoading) {
        STATE.directScriptLoading = new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = chrome.runtime.getURL("src/language-engine.js");
          script.onload = () => {
            if (globalThis.CorrectorLocalEngine?.checkText) resolve(globalThis.CorrectorLocalEngine);
            else reject(new Error("language-engine.js carregat sense checkText"));
          };
          script.onerror = () => reject(new Error("No he pogut carregar language-engine.js a l'offscreen"));
          document.documentElement.appendChild(script);
        }).catch(error => {
          STATE.directScriptLoading = null;
          throw error;
        });
      }
      await STATE.directScriptLoading;
    }
    return globalThis.CorrectorLocalEngine;
  }

  async function ensureEngine(language) {
    await ensureDirectEngineScript();
    if (globalThis.CorrectorLocalEngine.preload && !STATE.loadedLanguages.has(language)) {
      await globalThis.CorrectorLocalEngine.preload([language]);
      STATE.loadedLanguages.add(language);
    }
    return globalThis.CorrectorLocalEngine;
  }

  async function ensureWorkerTracked(language) {
    if (STATE.workerLoadedLanguages.has(language)) {
      setPreloadStatus(currentReadiness(language));
      return ensureWorkerClient();
    }
    if (STATE.workerLoading) {
      const activeLoad = STATE.workerLoading;
      try { await activeLoad; } catch (_) {}
      if (STATE.workerLoadedLanguages.has(language)) {
        setPreloadStatus(currentReadiness(language));
        return ensureWorkerClient();
      }
      // A different profile may have finished while this request was waiting.
      // Join any newer request, or fall through and start the requested one.
      if (STATE.workerLoading && STATE.workerLoading !== activeLoad) return ensureWorkerTracked(language);
    }

    const started = Date.now();
    setPreloadStatus({
      phase: "worker-loading-full",
      percent: 35,
      language,
      startedAt: started,
      finishedAt: 0,
      durationMs: 0,
      error: "",
      message: "Carregant el motor complet dins el worker"
    });

    const client = ensureWorkerClient();
    STATE.workerLoading = client.preload(language, { timeoutMs: 70000 }).then(result => {
      STATE.workerLoadedLanguages.add(language);
      setPreloadStatus({
        phase: "worker-ready-full",
        percent: 100,
        language,
        finishedAt: Date.now(),
        durationMs: Date.now() - started,
        error: "",
        message: "Motor complet usable dins el worker",
        workerStatus: result.workerStatus || result.status || null
      });
      return client;
    }).catch(error => {
      setPreloadStatus({
        phase: "worker-error",
        percent: 0,
        language,
        error: String(error?.message || error),
        durationMs: Date.now() - started
      });
      throw error;
    }).finally(() => {
      STATE.workerLoading = null;
    });

    return STATE.workerLoading;
  }

  async function ensureEngineTracked(language) {
    try {
      return await ensureWorkerTracked(language);
    } catch (workerError) {
      STATE.workerFallbacks += 1;
      setPreloadStatus({
        phase: "worker-fallback-direct",
        percent: 40,
        language,
        error: String(workerError?.message || workerError),
        message: "Worker no disponible; carregant motor directe"
      });
    }
    if (STATE.loadedLanguages.has(language)) {
      setPreloadStatus(currentReadiness(language));
      return globalThis.CorrectorLocalEngine;
    }
    if (STATE.loading) {
      await STATE.loading;
      setPreloadStatus(currentReadiness(language));
      return globalThis.CorrectorLocalEngine;
    }

    const started = Date.now();
    setPreloadStatus({
      phase: "loading-full",
      percent: 35,
      language,
      startedAt: started,
      finishedAt: 0,
      durationMs: 0,
      error: "",
      message: "Carregant recursos LanguageTool i diccionaris"
    });

    STATE.loading = ensureEngine(language).then(() => {
      const readiness = currentReadiness(language);
      setPreloadStatus({
        ...readiness,
        percent: readiness.percent >= 100 ? 100 : Math.max(readiness.percent, 92),
        phase: readiness.percent >= 100 ? readiness.phase : "ready-saving-cache",
        message: readiness.percent >= 100 ? readiness.message : "Motor complet usable; guardant cache en segon pla",
        finishedAt: Date.now(),
        durationMs: Date.now() - started,
        error: ""
      });
      return globalThis.CorrectorLocalEngine;
    }).catch(error => {
      setPreloadStatus({
        phase: "error",
        percent: 0,
        language,
        error: String(error?.message || error),
        durationMs: Date.now() - started
      });
      throw error;
    }).finally(() => {
      STATE.loading = null;
    });

    return STATE.loading;
  }

  function rememberJob(jobId) {
    const id = String(jobId || `${Date.now()}-${Math.random()}`);
    STATE.currentJobId = id;
    return id;
  }

  function isCurrentJob(jobId) {
    return String(jobId || "") === String(STATE.currentJobId || "");
  }

  function cooperativeYield() {
    if (globalThis.scheduler?.yield) return globalThis.scheduler.yield();
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  function engineOptionsForRequest({ language, fast, ultraFast, perItemDeadlineMs, source, mode }) {
    return {
      language,
      mode: ultraFast ? `${mode || "offscreen"}-ultra-fast` : fast ? `${mode || "offscreen"}-fast` : `${mode || "offscreen"}-full`,
      interactive: false,
      fast,
      ultraFast,
      deadlineMs: perItemDeadlineMs,
      background: true,
      source
    };
  }

  async function checkTextWithBestEngine(text, request) {
    const language = request.language || "ca";
    const jobId = request.jobId || "";
    const options = engineOptionsForRequest(request);
    try {
      const client = await ensureWorkerTracked(language);
      const response = await client.checkText(text, options, {
        jobId,
        timeoutMs: request.timeoutMs || 50000
      });
      return {
        ...response,
        issues: Array.isArray(response.issues) ? response.issues : [],
        transport: "offscreen-engine-worker",
        fullEngine: true,
        chunked: !!response.chunked,
        chunkMetrics: response.chunkMetrics || null,
        workerStatus: response.workerStatus || null
      };
    } catch (workerError) {
      STATE.workerFallbacks += 1;
      const engine = await ensureEngine(language);
      const started = Date.now();
      const issues = engine.checkText(text, options) || [];
      return {
        ok: true,
        transport: "offscreen-direct-fallback",
        fullEngine: true,
        issues,
        engineIssues: issues.length,
        durationMs: Date.now() - started,
        chunked: false,
        chunkMetrics: null,
        workerError: String(workerError?.message || workerError)
      };
    }
  }

  async function checkBatchWithBestEngine(items, request) {
    const language = request.language || "ca";
    const jobId = request.jobId || "";
    const options = engineOptionsForRequest(request);
    try {
      const client = await ensureWorkerTracked(language);
      const response = await client.checkBatch(items, options, {
        jobId,
        requestId: request.requestId || "",
        tracePerformance: !!request.tracePerformance,
        timeoutMs: request.timeoutMs || 50000,
        onItemResult: result => {
          if (!request.requestId || !isCurrentJob(jobId) || typeof chrome?.runtime?.sendMessage !== "function") return;
          try {
            Promise.resolve(chrome.runtime.sendMessage({
              type: "OFFSCREEN_GDOCS_CHECK_BATCH_PROGRESS",
              requestId: request.requestId,
              jobId,
              result
            })).catch(() => {});
          } catch (_) {}
        }
      });
      return {
        ...response,
        results: Array.isArray(response.results) ? response.results : [],
        pendingIds: Array.isArray(response.pendingIds) ? response.pendingIds : [],
        transport: "offscreen-engine-worker-batch",
        fullEngine: true,
        chunkedItems: response.chunkedItems || 0,
        chunkMetrics: response.chunkMetrics || [],
        workerTrace: response.workerTrace || null,
        workerStatus: response.workerStatus || null
      };
    } catch (workerError) {
      STATE.workerFallbacks += 1;
      const engine = await ensureEngine(language);
      const started = Date.now();
      const results = [];
      let stoppedByBudget = false;
      for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
        const item = items[itemIndex];
        if (!isCurrentJob(jobId)) break;
        if (request.budgetMs && Date.now() - started > request.budgetMs && results.length) {
          stoppedByBudget = true;
          break;
        }
        const issues = engine.checkText(item.text, options) || [];
        results.push({ id: item.id, issues, engineIssues: issues.length });
        if (itemIndex % 4 === 3) await cooperativeYield();
      }
      const doneIds = new Set(results.map(item => String(item.id)));
      const pendingIds = items.filter(item => !doneIds.has(String(item.id))).map(item => item.id);
      return {
        ok: true,
        transport: "offscreen-direct-fallback-batch",
        fullEngine: true,
        results,
        pendingIds,
        durationMs: Date.now() - started,
        partial: stoppedByBudget || pendingIds.length > 0,
        chunkedItems: 0,
        chunkMetrics: [],
        workerError: String(workerError?.message || workerError)
      };
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "OFFSCREEN_GDOCS_CANCEL_BATCH") {
      const requestId = String(message.requestId || "");
      try { STATE.workerClient?.cancelBatchRequest?.(requestId); } catch (_) {}
      if (STATE.currentRequestId === requestId) STATE.currentRequestId = "";
      sendResponse({ ok: true, cancelled: !!requestId });
      return false;
    }
    if (message?.type === "OFFSCREEN_GDOCS_READINESS") {
      try {
        sendResponse({
          ok: true,
          transport: "offscreen-readiness",
          loadedLanguages: Array.from(STATE.loadedLanguages),
          workerLoadedLanguages: Array.from(STATE.workerLoadedLanguages),
          checkCount: STATE.checkCount,
          currentJobId: STATE.currentJobId,
          staleResponses: STATE.staleResponses,
          workerFallbacks: STATE.workerFallbacks,
          slowBatches: STATE.slowBatches.slice(-20),
          scheduler: {
            ...STATE.scheduler,
            pool: workerDiagnostics()
          },
          worker: workerDiagnostics(),
          lastCheck: STATE.lastCheck,
          readiness: currentReadiness(message.language || "ca")
        });
      } catch (error) {
        sendResponse({ ok: false, transport: "offscreen-readiness", error: String(error?.message || error) });
      }
      return true;
    }

    if (message?.type === "OFFSCREEN_GDOCS_DIAGNOSTICS") {
      (async () => {
        const engine = globalThis.CorrectorLocalEngine || null;
        sendResponse({
          ok: true,
          transport: "offscreen-diagnostics",
          loadedLanguages: Array.from(STATE.loadedLanguages),
          workerLoadedLanguages: Array.from(STATE.workerLoadedLanguages),
          checkCount: STATE.checkCount,
          currentJobId: STATE.currentJobId,
          staleResponses: STATE.staleResponses,
          workerFallbacks: STATE.workerFallbacks,
          slowBatches: STATE.slowBatches.slice(-20),
          scheduler: {
            ...STATE.scheduler,
            pool: workerDiagnostics()
          },
          worker: workerDiagnostics(),
          lastCheck: STATE.lastCheck,
          engineAvailable: !!engine?.checkText,
          readiness: currentReadiness("ca"),
          engineDiagnostics: engine?.getDiagnostics?.() || null
        });
      })().catch(error => {
        sendResponse({ ok: false, transport: "offscreen-diagnostics", error: String(error?.message || error) });
      });
      return true;
    }

    if (message?.type === "OFFSCREEN_GDOCS_PRELOAD") {
      (async () => {
        const started = Date.now();
        const language = message.language || "ca";
        setPreloadStatus({
          phase: "preload-requested",
          percent: 25,
          language,
          startedAt: started,
          error: "",
          message: "Precarrega sol.licitada"
        });
        await ensureEngineTracked(language);
        sendResponse({
          ok: true,
          transport: "offscreen-preload",
          durationMs: Date.now() - started,
          readiness: currentReadiness(language)
        });
      })().catch(error => {
        sendResponse({ ok: false, transport: "offscreen-preload", error: String(error?.message || error) });
      });
      return true;
    }
    if (message?.type === "OFFSCREEN_GDOCS_CHECK_BATCH") {
      (async () => {
        const started = Date.now();
        const language = message.language || "ca";
        const previousRequestId = STATE.currentRequestId;
        if (previousRequestId && previousRequestId !== String(message.requestId || "")) {
          try { STATE.workerClient?.cancelBatchRequest?.(previousRequestId); } catch (_) {}
        }
        const jobId = rememberJob(message.jobId);
        STATE.currentRequestId = String(message.requestId || "");
        const fast = !!message.fast;
        const ultraFast = !!message.ultraFast;
        const source = message.source || "google-docs";
        const budgetMs = Number(message.budgetMs || 0);
        const perItemDeadlineMs = ultraFast ? 180 : fast ? 420 : 0;
        const items = (Array.isArray(message.items) ? message.items : [])
          .map((item, index) => ({
            id: String(item?.id ?? index),
            text: String(item?.text || "")
          }))
          .filter(item => item.text);
        const response = await checkBatchWithBestEngine(items, {
          language,
          jobId,
          fast,
          ultraFast,
          perItemDeadlineMs,
          source,
          mode: ultraFast ? "gdocs-offscreen-ultra-fast" : fast ? "gdocs-offscreen-fast" : "gdocs-offscreen-full",
          requestId: message.requestId || "",
          budgetMs,
          tracePerformance: !!message.tracePerformance,
          timeoutMs: message.mode === "manual" ? 50000 : message.mode === "panel" ? 24000 : 18000
        });
        if (!isCurrentJob(jobId)) {
          STATE.staleResponses += 1;
          if (STATE.currentRequestId === String(message.requestId || "")) STATE.currentRequestId = "";
          sendResponse({
            ok: true,
            cancelled: true,
            transport: "offscreen-cancelled-batch",
            fullEngine: true,
            results: [],
            pendingIds: items.map(pending => pending.id),
            durationMs: Date.now() - started
          });
          return;
        }
        const results = Array.isArray(response.results) ? response.results : [];
        if (STATE.currentRequestId === String(message.requestId || "")) STATE.currentRequestId = "";
        const issueCount = results.reduce((sum, item) => sum + item.issues.length, 0);
        const elapsedMs = Date.now() - started;
        const ruleSummary = summarizeBatchIssues(results);
        const doneIds = new Set(results.map(item => String(item.id)));
        const pendingIds = Array.isArray(response.pendingIds) && response.pendingIds.length
          ? response.pendingIds
          : items.filter(item => !doneIds.has(String(item.id))).map(item => item.id);
        rememberSlowBatch({
          source: "offscreen",
          jobId,
          mode: message.mode || "",
          transport: response.transport || "",
          durationMs: elapsedMs,
          engineDurationMs: response.durationMs || null,
          requestDurationMs: response.requestDurationMs || null,
          fast,
          ultraFast,
          budgetMs,
          itemMetrics: response.itemMetrics || [],
          engineDiagnostics: response.engineDiagnostics || null,
          items: items.length,
          resultItems: results.length,
          pendingItems: pendingIds.length,
          chars: items.reduce((sum, item) => sum + item.text.length, 0),
          splitBatch: !!response.splitBatch,
          poolSize: response.poolSize || workerDiagnostics().poolSize || 1,
          lanes: response.lanes || [],
          ruleIds: ruleSummary,
          textSamples: items.map(item => item.text)
        });
        STATE.checkCount += items.length || 1;
        STATE.lastCheck = {
          ok: true,
          batch: true,
          transport: response.transport,
          durationMs: elapsedMs,
          items: items.length,
          pendingItems: pendingIds.length,
          chars: items.reduce((sum, item) => sum + item.text.length, 0),
          issues: issueCount,
          language,
          fast,
          ultraFast,
          budgetMs,
          itemMetrics: response.itemMetrics || [],
          engineDiagnostics: response.engineDiagnostics || null,
          partial: !!response.partial || results.length < items.length,
          chunkedItems: response.chunkedItems || 0,
          chunkMetrics: response.chunkMetrics || [],
          splitBatch: !!response.splitBatch,
          poolSize: response.poolSize || workerDiagnostics().poolSize || 1,
          lanes: response.lanes || [],
          itemMetrics: response.itemMetrics || [],
          engineDiagnostics: response.engineDiagnostics || null,
          slowBatches: STATE.slowBatches.slice(-8),
          ruleSummary,
          workerFallbacks: STATE.workerFallbacks,
          workerStatus: response.workerStatus || null
        };
        sendResponse({
          ok: true,
          transport: response.transport || "offscreen-full-engine-batch",
          fullEngine: true,
          results,
          pendingIds,
          durationMs: elapsedMs,
          fast,
          ultraFast,
          budgetMs,
          partial: pendingIds.length > 0,
          chunkedItems: response.chunkedItems || 0,
          chunkMetrics: response.chunkMetrics || [],
          splitBatch: !!response.splitBatch,
          poolSize: response.poolSize || workerDiagnostics().poolSize || 1,
          lanes: response.lanes || [],
          slowBatches: STATE.slowBatches.slice(-8),
          ruleSummary,
          workerStatus: response.workerStatus || null,
          workerTrace: response.workerTrace || null,
          workerError: response.workerError || ""
        });
      })().catch(error => {
        STATE.lastCheck = {
          ok: false,
          batch: true,
          error: String(error?.message || error),
          at: Date.now()
        };
        sendResponse({
          ok: false,
          transport: "offscreen-full-engine-batch",
          error: String(error?.message || error)
        });
      });
      return true;
    }
    if (message?.type !== "OFFSCREEN_GDOCS_CHECK") return;
    (async () => {
      const started = Date.now();
      const text = String(message.text || "");
      const language = message.language || "ca";
      const jobId = rememberJob(message.jobId);
      const fast = !!message.fast;
      const ultraFast = !!message.ultraFast;
      const source = message.source || "google-docs";
      const perItemDeadlineMs = ultraFast ? 180 : fast ? 420 : 0;
      if (!isCurrentJob(jobId)) {
        sendResponse({ ok: true, cancelled: true, transport: "offscreen-cancelled", fullEngine: true, issues: [], durationMs: Date.now() - started });
        return;
      }
      const response = await checkTextWithBestEngine(text, {
        language,
        fast,
        ultraFast,
        perItemDeadlineMs,
        source,
        jobId,
        mode: ultraFast ? "gdocs-offscreen-ultra-fast" : fast ? "gdocs-offscreen-fast" : "gdocs-offscreen-full",
        timeoutMs: message.mode === "manual" ? 50000 : message.mode === "panel" ? 24000 : 18000
      });
      if (!isCurrentJob(jobId)) {
        STATE.staleResponses += 1;
        sendResponse({ ok: true, cancelled: true, transport: "offscreen-cancelled", fullEngine: true, issues: [], durationMs: Date.now() - started });
        return;
      }
      const issues = Array.isArray(response.issues) ? response.issues : [];
      STATE.checkCount += 1;
      STATE.lastCheck = {
        ok: true,
        transport: response.transport,
        durationMs: Date.now() - started,
        chars: text.length,
        issues: issues.length,
        language,
        fast,
        chunked: !!response.chunked,
        chunkMetrics: response.chunkMetrics || null,
        workerFallbacks: STATE.workerFallbacks,
        workerStatus: response.workerStatus || null
      };
      sendResponse({
        ok: true,
        transport: response.transport || "offscreen-full-engine",
        fullEngine: true,
        issues,
        engineIssues: issues.length,
        durationMs: Date.now() - started,
        chunked: !!response.chunked,
        chunkMetrics: response.chunkMetrics || null,
        workerStatus: response.workerStatus || null,
        workerError: response.workerError || ""
      });
    })().catch(error => {
      STATE.lastCheck = {
        ok: false,
        error: String(error?.message || error),
        at: Date.now()
      };
      sendResponse({
        ok: false,
        transport: "offscreen-full-engine",
        error: String(error?.message || error)
      });
    });
    return true;
  });
})();
