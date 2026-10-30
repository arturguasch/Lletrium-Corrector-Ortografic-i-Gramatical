/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
(() => {
  const STATE = {
    loadPromise: null,
    loadedLanguages: new Set(),
    bootErrors: [],
    cancelledBatchRequests: new Set(),
    status: {
      phase: "cold",
      ready: false,
      loadedLanguages: [],
      engineAvailable: false,
      checks: 0,
      batches: 0,
      chunkedChecks: 0,
      chunks: 0,
      totalChars: 0,
      totalIssues: 0,
      totalCheckMs: 0,
      maxCheckMs: 0,
      lastMetrics: null,
      slowItemMetrics: [],
      optionMismatches: [],
      startedAt: Date.now(),
      lastRequest: null,
      lastError: "",
      bootContext: null
    }
  };

  function now() {
    return Date.now();
  }

  function plainError(error) {
    return String(error?.message || error || "Error desconegut");
  }

  function setStatus(patch) {
    STATE.status = {
      ...STATE.status,
      ...patch,
      updatedAt: now(),
      loadedLanguages: Array.from(STATE.loadedLanguages),
      engineAvailable: !!globalThis.CorrectorLocalEngine?.checkText
    };
  }

  function recordBootError(stage, error) {
    const entry = {
      stage,
      error: plainError(error),
      at: now()
    };
    STATE.bootErrors.push(entry);
    if (STATE.bootErrors.length > 8) STATE.bootErrors.shift();
    setStatus({ lastError: entry.error, bootErrors: STATE.bootErrors.slice() });
  }

  function installWorkerEngineShims() {
    try {
      globalThis.window = globalThis;
      globalThis.self = globalThis;
      if (!globalThis.location && globalThis.self?.location) globalThis.location = globalThis.self.location;
      if (!globalThis.navigator) globalThis.navigator = { userAgent: "CorrectorLocalEngineWorker" };
      const existingChrome = globalThis.chrome || {};
      const existingRuntime = existingChrome.runtime || {};
      globalThis.chrome = {
        ...existingChrome,
        runtime: {
          ...existingRuntime,
          getURL(path) {
            if (typeof existingRuntime.getURL === "function") {
              try { return existingRuntime.getURL(path); } catch (_) {}
            }
            // Dedicated workers do not expose chrome.runtime in every Chrome
            // context. Resolve extension assets from the extension root, not
            // relative to /src/engine-worker.js (which would yield
            // /src/build/resources/... for engine resource paths).
            const value = String(path || "").replace(/^\/+/, "");
            return new URL(value, new URL("/", self.location.href)).href;
          },
          getManifest() {
            if (typeof existingRuntime.getManifest === "function") {
              try { return existingRuntime.getManifest(); } catch (_) {}
            }
            return { version: "1.0.0", version_name: "1.0.0", manifest_version: 3, name: "Lletrium!" };
          }
        }
      };
      setStatus({
        bootContext: {
          hasWindow: !!globalThis.window,
          hasChromeRuntime: !!globalThis.chrome?.runtime,
          hasGetURL: typeof globalThis.chrome?.runtime?.getURL === "function",
          hasGetManifest: typeof globalThis.chrome?.runtime?.getManifest === "function",
          hasIndexedDB: typeof indexedDB !== "undefined",
          href: String(self.location?.href || "")
        }
      });
    } catch (error) {
      recordBootError("install-shims", error);
      throw error;
    }
  }

  function getEngine() {
    const engine = globalThis.CorrectorLocalEngine;
    if (!engine?.checkText) throw new Error("CorrectorLocalEngine no disponible dins el worker");
    return engine;
  }

  async function ensureEngineLoaded() {
    if (globalThis.CorrectorLocalEngine?.checkText) {
      setStatus({ phase: "engine-ready", ready: true });
      return getEngine();
    }
    if (!STATE.loadPromise) {
      setStatus({ phase: "loading-script", ready: false, lastError: "" });
      STATE.loadPromise = Promise.resolve().then(() => {
        installWorkerEngineShims();
        importScripts("language-engine.js");
        const engine = getEngine();
        setStatus({ phase: "engine-ready", ready: true, lastError: "" });
        return engine;
      }).catch(error => {
        STATE.loadPromise = null;
        recordBootError("load-language-engine", error);
        setStatus({ phase: "error", ready: false, lastError: plainError(error) });
        throw error;
      });
    }
    return STATE.loadPromise;
  }

  async function preload(language = "ca") {
    const started = now();
    const engine = await ensureEngineLoaded();
    if (engine.preload && !STATE.loadedLanguages.has(language)) {
      setStatus({ phase: "preloading", ready: false, language });
      await engine.preload([language]);
      STATE.loadedLanguages.add(language);
    }
    setStatus({
      phase: "ready-full",
      ready: true,
      language,
      preloadDurationMs: now() - started,
      lastError: ""
    });
    return {
      ok: true,
      language,
      durationMs: now() - started,
      status: STATE.status,
      loadStatus: engine.getLoadStatus?.() || null
    };
  }

  function serializableIssues(issues) {
    return (Array.isArray(issues) ? issues : []).map(issue => ({ ...issue }));
  }

  function shouldChunkText(text, payload = {}) {
    const maxChars = Number(payload.chunkMaxChars || payload.options?.chunkMaxChars || 0) || 4200;
    if (payload.disableChunking || payload.options?.disableChunking) return false;
    return String(text || "").length > maxChars;
  }

  function splitTextIntoChunks(text, payload = {}) {
    const source = String(text || "");
    const maxChars = Number(payload.chunkMaxChars || payload.options?.chunkMaxChars || 0) || 4200;
    const hardMax = Math.max(maxChars + 1200, Number(payload.chunkHardMaxChars || payload.options?.chunkHardMaxChars || 0) || 6200);
    const chunks = [];
    let start = 0;

    const push = end => {
      const safeEnd = Math.max(start + 1, Math.min(source.length, end));
      const raw = source.slice(start, safeEnd);
      const trimLeft = raw.match(/^\s*/u)?.[0]?.length || 0;
      const trimRight = raw.match(/\s*$/u)?.[0]?.length || 0;
      const chunkStart = start + trimLeft;
      const chunkEnd = safeEnd - trimRight;
      if (chunkEnd > chunkStart) chunks.push({ id: String(chunks.length), start: chunkStart, end: chunkEnd, text: source.slice(chunkStart, chunkEnd) });
      start = safeEnd;
    };

    while (start < source.length) {
      const remaining = source.length - start;
      if (remaining <= hardMax) {
        push(source.length);
        break;
      }
      const target = start + maxChars;
      const windowEnd = Math.min(source.length, start + hardMax);
      const windowText = source.slice(start, windowEnd);
      const relativeTarget = target - start;
      let split = -1;
      const boundaries = [/\n{2,}/gu, /[.!?]\s+/gu, /[;:]\s+/gu, /,\s+/gu, /\s+/gu];
      for (const re of boundaries) {
        let match;
        while ((match = re.exec(windowText))) {
          const candidate = match.index + match[0].length;
          if (candidate < Math.max(600, relativeTarget - 900)) continue;
          if (candidate > Math.min(windowText.length, relativeTarget + 900)) break;
          split = candidate;
        }
        if (split > 0) break;
      }
      if (split <= 0) split = relativeTarget;
      push(start + split);
    }

    return chunks.length ? chunks : [{ id: "0", start: 0, end: source.length, text: source }];
  }

  function shiftIssues(issues, baseOffset) {
    return serializableIssues(issues).map(issue => ({
      ...issue,
      start: Number(issue.start || 0) + baseOffset,
      end: Number(issue.end || 0) + baseOffset,
      id: issue.id ? `${issue.id}@${baseOffset}` : issue.id
    }));
  }

  function recordMetrics(metrics) {
    STATE.status.totalChars += metrics.chars || 0;
    STATE.status.totalIssues += metrics.issues || 0;
    STATE.status.totalCheckMs += metrics.durationMs || 0;
    STATE.status.maxCheckMs = Math.max(STATE.status.maxCheckMs || 0, metrics.durationMs || 0);
    STATE.status.lastMetrics = metrics;
  }

  function getEngineStageTotals() {
    try {
      const totals = globalThis.CorrectorLocalEngine?.getPerformanceDiagnostics?.()?.stageTotalsMs;
      return totals && typeof totals === "object" ? totals : null;
    } catch (_) { return null; }
  }

  function diffEngineStageTotals(before, after) {
    if (!before || !after) return null;
    const delta = {};
    for (const [name, value] of Object.entries(after)) {
      const elapsed = Number(value) - Number(before[name] || 0);
      if (Number.isFinite(elapsed) && elapsed >= 0) delta[name] = Math.round(elapsed * 100) / 100;
    }
    return delta;
  }

  function summarizeOptions(options = {}) {
    return {
      mode: String(options.mode || ""),
      fast: !!options.fast,
      ultraFast: !!options.ultraFast,
      skipSpelling: !!options.skipSpelling,
      deadlineMs: Number(options.deadlineMs || 0),
      background: !!options.background,
      language: options.language || "ca"
    };
  }

  function recordSlowItemMetric(entry = {}) {
    if (Number(entry.durationMs || 0) < 500) return;
    STATE.status.slowItemMetrics.push({
      at: now(),
      ...entry,
      sample: String(entry.sample || "").replace(/\s+/g, " ").trim().slice(0, 220)
    });
    if (STATE.status.slowItemMetrics.length > 36) STATE.status.slowItemMetrics.shift();
  }

  async function checkText(payload = {}) {
    const started = now();
    const language = payload.language || payload.options?.language || "ca";
    await preload(language);
    const engine = getEngine();
    const text = String(payload.text || "");
    const options = {
      ...(payload.options || {}),
      language
    };
    const optionSummary = summarizeOptions(options);
    let issues;
    let chunkMetrics = null;
    if (shouldChunkText(text, payload)) {
      const chunks = splitTextIntoChunks(text, payload);
      const chunkResults = [];
      issues = [];
      for (const chunk of chunks) {
        const chunkStarted = now();
        const chunkIssues = shiftIssues(engine.checkText(chunk.text, { ...options, chunked: true, baseOffset: chunk.start }) || [], chunk.start);
        issues.push(...chunkIssues);
        chunkResults.push({
          id: chunk.id,
          start: chunk.start,
          end: chunk.end,
          chars: chunk.text.length,
          issues: chunkIssues.length,
          durationMs: now() - chunkStarted
        });
      }
      STATE.status.chunkedChecks += 1;
      STATE.status.chunks += chunks.length;
      chunkMetrics = {
        strategy: "paragraph-window",
        chunks: chunks.length,
        chunkMaxChars: Number(payload.chunkMaxChars || payload.options?.chunkMaxChars || 0) || 4200,
        chunkHardMaxChars: Number(payload.chunkHardMaxChars || payload.options?.chunkHardMaxChars || 0) || 6200,
        items: chunkResults
      };
    } else {
      issues = serializableIssues(engine.checkText(text, options) || []);
    }
    const durationMs = now() - started;
    const metrics = {
      type: "CHECK_TEXT",
      chunked: !!chunkMetrics,
      chars: text.length,
      issues: issues.length,
      durationMs,
      options: optionSummary,
      jobId: payload.jobId || "",
      revision: payload.revision || 0,
      chunkMetrics
    };
    recordSlowItemMetric({
      type: "CHECK_TEXT",
      durationMs,
      chars: text.length,
      issues: issues.length,
      jobId: payload.jobId || "",
      revision: payload.revision || 0,
      options: optionSummary,
      sample: text
    });
    if (!payload.disableStatusIncrement) {
      recordMetrics(metrics);
      STATE.status.checks += 1;
    }
    setStatus({
      phase: "ready-full",
      ready: true,
      lastRequest: metrics,
      lastError: ""
    });
    return {
      ok: true,
      issues,
      engineIssues: issues.length,
      durationMs,
      options: optionSummary,
      chunked: !!chunkMetrics,
      chunkMetrics,
      engineDiagnostics: globalThis.CorrectorLocalEngine?.getPerformanceDiagnostics?.() || null,
      workerStatus: STATE.status
    };
  }

  async function checkBatch(payload = {}, requestId = "", emitProgress = () => {}) {
    const started = now();
    const language = payload.language || payload.options?.language || "ca";
    const traceEnabled = payload.tracePerformance === true;
    const loadStarted = now();
    await preload(language);
    const preloadMs = now() - loadStarted;
    const engine = getEngine();
    const options = {
      ...(payload.options || {}),
      language
    };
    const optionSummary = summarizeOptions(options);
    const items = (Array.isArray(payload.items) ? payload.items : [])
      .map((item, index) => ({
        id: String(item?.id ?? index),
        text: String(item?.text || "")
      }))
      .filter(item => item.text);
    const results = [];
    const batchChunkMetrics = [];
    const itemTrace = traceEnabled ? [] : null;
    let engineMs = 0;
    let yieldMs = 0;
    const cancellationToken = String(requestId || payload.requestId || "");
    for (const item of items) {
      if (STATE.cancelledBatchRequests.has(cancellationToken)) break;
      const itemStarted = now();
      let itemEngineMs = 0;
      let itemStageMs = null;
      let issues;
      let chunkMetrics = null;
      if (shouldChunkText(item.text, payload)) {
        const engineStarted = now();
        const stagesBefore = traceEnabled ? getEngineStageTotals() : null;
        const response = await checkText({
          ...payload,
          text: item.text,
          disableStatusIncrement: true
        });
        issues = response.issues || [];
        chunkMetrics = response.chunkMetrics || null;
        itemEngineMs = Math.max(0, now() - engineStarted);
        itemStageMs = traceEnabled ? diffEngineStageTotals(stagesBefore, getEngineStageTotals()) : null;
      } else {
        const engineStarted = now();
        const stagesBefore = traceEnabled ? getEngineStageTotals() : null;
        issues = serializableIssues(engine.checkText(item.text, options) || []);
        itemEngineMs = Math.max(0, now() - engineStarted);
        itemStageMs = traceEnabled ? diffEngineStageTotals(stagesBefore, getEngineStageTotals()) : null;
      }
      engineMs += itemEngineMs;
      if (chunkMetrics) batchChunkMetrics.push({ id: item.id, ...chunkMetrics });
      recordSlowItemMetric({
        type: "CHECK_BATCH_ITEM",
        durationMs: now() - itemStarted,
        id: item.id,
        chars: item.text.length,
        issues: issues.length,
        jobId: payload.jobId || "",
        revision: payload.revision || 0,
        options: optionSummary,
        sample: item.text
      });
      results.push({
        id: item.id,
        issues,
        engineIssues: issues.length,
        durationMs: now() - itemStarted,
        options: optionSummary,
        chunked: !!chunkMetrics,
        chunkMetrics
      });
      if (itemTrace) itemTrace.push({ id: item.id, chars: item.text.length, engineMs: itemEngineMs, totalMs: now() - itemStarted, issues: issues.length, chunked: !!chunkMetrics, chunks: Number(chunkMetrics?.chunks || 0), stageMs: itemStageMs });
      emitProgress(results[results.length - 1]);
      // Yield between chunks so a newer viewport can cancel the remaining lane.
      const yieldStarted = now();
      await new Promise(resolve => setTimeout(resolve, 0));
      yieldMs += now() - yieldStarted;
      if (STATE.cancelledBatchRequests.has(cancellationToken)) break;
    }
    const issueCount = results.reduce((sum, item) => sum + item.issues.length, 0);
    const completedIds = new Set(results.map(item => String(item.id)));
    const pendingIds = items.filter(item => !completedIds.has(String(item.id))).map(item => item.id);
    STATE.cancelledBatchRequests.delete(cancellationToken);
    const durationMs = now() - started;
    const workerTrace = traceEnabled ? {
      version: 1,
      requestId: String(requestId || ""),
      language: String(language),
      inputItems: items.length,
      inputChars: items.reduce((sum, item) => sum + item.text.length, 0),
      preloadMs,
      engineMs,
      workerOverheadMs: Math.max(0, durationMs - preloadMs - engineMs - yieldMs),
      yieldMs,
      durationMs,
      completedItems: results.length,
      pendingItems: pendingIds.length,
      chunkedItems: batchChunkMetrics.length,
      chunkCount: batchChunkMetrics.reduce((sum, item) => sum + Number(item.chunks || 0), 0),
      itemTrace
    } : null;
    const metrics = {
      type: "CHECK_BATCH",
      items: items.length,
      chars: items.reduce((sum, item) => sum + item.text.length, 0),
      issues: issueCount,
      durationMs,
      options: optionSummary,
      itemMetrics: results.map(item => ({
        id: item.id,
        durationMs: item.durationMs,
        chars: String(items.find(source => String(source.id) === String(item.id))?.text || "").length,
        issues: item.engineIssues || 0,
        options: item.options || optionSummary,
        sample: String(items.find(source => String(source.id) === String(item.id))?.text || "").replace(/\s+/g, " ").trim().slice(0, 180)
      })),
      chunkedItems: batchChunkMetrics.length,
      chunkMetrics: batchChunkMetrics,
      jobId: payload.jobId || "",
      revision: payload.revision || 0
    };
    recordMetrics(metrics);
    STATE.status.batches += 1;
    STATE.status.checks += items.length;
    setStatus({
      phase: "ready-full",
      ready: true,
      lastRequest: metrics,
      lastError: ""
    });
    return {
      ok: true,
      results,
      pendingIds,
      partial: pendingIds.length > 0,
      durationMs,
      options: optionSummary,
      itemMetrics: metrics.itemMetrics,
      chunkedItems: batchChunkMetrics.length,
      chunkMetrics: batchChunkMetrics,
      workerTrace,
      engineDiagnostics: globalThis.CorrectorLocalEngine?.getPerformanceDiagnostics?.() || null,
      workerStatus: STATE.status
    };
  }

  function diagnostics() {
    const engine = globalThis.CorrectorLocalEngine || null;
    return {
      ok: true,
      status: STATE.status,
      bootErrors: STATE.bootErrors.slice(),
      engineAvailable: !!engine?.checkText,
      loadedLanguages: Array.from(STATE.loadedLanguages),
      engineDiagnostics: engine?.getDiagnostics?.() || null,
      loadStatus: engine?.getLoadStatus?.() || null
    };
  }

  async function handle(message, context = {}) {
    const type = String(message?.type || "");
    const payload = message?.payload || {};
    if (type === "PING") return { ok: true, status: STATE.status };
    if (type === "PRELOAD") return preload(payload.language || "ca");
    if (type === "CHECK_TEXT") return checkText(payload);
    if (type === "CHECK_BATCH") return checkBatch(payload, message.id || "", context.emitProgress);
    if (type === "GET_STATUS") return { ok: true, status: STATE.status };
    if (type === "GET_DIAGNOSTICS") return diagnostics();
    if (type === "CLEAR_CACHE") {
      STATE.loadedLanguages.clear();
      STATE.loadPromise = null;
      setStatus({ phase: "cold", ready: false, lastError: "" });
      return { ok: true, status: STATE.status };
    }
    throw new Error(`Tipus de missatge no suportat: ${type}`);
  }

  self.onmessage = event => {
    const request = event.data || {};
    const id = request.id || "";
    if (request.type === "CANCEL_BATCH") {
      const token = String(request.payload?.requestId || "");
      if (token) {
        STATE.cancelledBatchRequests.add(token);
        setTimeout(() => STATE.cancelledBatchRequests.delete(token), 30000);
      }
      return;
    }
    handle(request, {
      emitProgress: result => self.postMessage({ id, type: "CHECK_BATCH_PROGRESS", result })
    }).then(result => {
      self.postMessage({ id, ok: true, result });
    }).catch(error => {
      setStatus({ phase: "error", ready: false, lastError: plainError(error) });
      self.postMessage({ id, ok: false, error: plainError(error), status: STATE.status });
    });
  };

  setStatus({ phase: "cold", ready: false });
})();
