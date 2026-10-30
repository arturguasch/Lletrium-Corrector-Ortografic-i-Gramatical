
const BG_GDOCS_ENGINE = {
  loading: null,
  preloadedLanguages: new Set(),
  checkCount: 0,
  activeChecks: 0,
  lastCheck: null
};


const GDOCS_OFFSCREEN = {
  creating: null,
  available: typeof chrome !== "undefined" && !!chrome.offscreen?.createDocument,
  eagerPreloadStarted: false,
  eagerPreloadLanguage: "",
  eagerPreloadAt: 0,
  eagerPreloadResult: null,
  lifecycleRevision: 0,
  shutdown: null
};
const GDOCS_PROGRESS_ROUTES = new Map();
const FRAME_REVIEW_CARD_ROUTES = new Map();
const TEMPORARY_DISMISSALS = new Map();
const TEMPORARY_DISMISSAL_QUEUES = new Map();
const temporaryDismissalStorageKey = tabId => `correctorTemporaryDismissals:${tabId}`;

async function getTemporaryDismissals(tabId) {
  const key = temporaryDismissalStorageKey(tabId);
  try {
    if (chrome.storage.session) {
      const stored = await chrome.storage.session.get(key);
      const values = Array.isArray(stored[key]) ? stored[key] : [];
      TEMPORARY_DISMISSALS.set(tabId, new Set(values));
      return values;
    }
  } catch (_) {}
  return [...(TEMPORARY_DISMISSALS.get(tabId) || [])];
}

function updateTemporaryDismissals(tabId, update, removeStored = false) {
  const previous = TEMPORARY_DISMISSAL_QUEUES.get(tabId) || Promise.resolve();
  const pending = previous.catch(() => {}).then(async () => {
    const current = await getTemporaryDismissals(tabId);
    const next = [...new Set(update(current))].slice(-500);
    TEMPORARY_DISMISSALS.set(tabId, new Set(next));
    try { await chrome.storage.session?.set({ [temporaryDismissalStorageKey(tabId)]: next }); } catch (_) {}
    if (removeStored) {
      TEMPORARY_DISMISSALS.delete(tabId);
      try { await chrome.storage.session?.remove(temporaryDismissalStorageKey(tabId)); } catch (_) {}
    }
    return next;
  });
  const settled = pending.catch(() => {}).finally(() => {
    if (TEMPORARY_DISMISSAL_QUEUES.get(tabId) === settled) TEMPORARY_DISMISSAL_QUEUES.delete(tabId);
  });
  TEMPORARY_DISMISSAL_QUEUES.set(tabId, settled);
  return pending;
}

async function clearTemporaryDismissals(tabId, notifyFrames = true) {
  await updateTemporaryDismissals(tabId, () => [], !notifyFrames);
  if (notifyFrames) chrome.tabs.sendMessage(tabId, { type: "CL_TEMPORARY_DISMISSALS_CLEARED" }).catch(() => {});
}

chrome.tabs.onRemoved.addListener(tabId => { clearTemporaryDismissals(tabId, false); });
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo?.url || changeInfo?.status === "loading") clearTemporaryDismissals(tabId);
});
let extensionEngineLifecycleQueue = Promise.resolve();
let factoryResetInProgress = false;

function defaultReadiness(language = "ca-ES") {
  return {
    phase: "cold",
    percent: 0,
    message: "Motor encara no inicialitzat",
    language,
    loaded: false,
    engineAvailable: false,
    offscreenOpen: false,
    cacheRestored: false,
    cacheSaved: false,
    cacheSavePending: false
  };
}

async function hasOffscreenDocument(path = "src/offscreen.html") {
  if (!chrome.offscreen?.hasDocument) return false;
  try {
    return await chrome.offscreen.hasDocument();
  } catch (_) {
    return false;
  }
}

async function isCorrectionEnabled() {
  try {
    const settings = await chrome.storage.sync.get({ enabled: true });
    return settings.enabled !== false;
  } catch (_) {
    return true;
  }
}

async function stopEngineForDisabledExtension() {
  GDOCS_OFFSCREEN.lifecycleRevision += 1;
  GDOCS_OFFSCREEN.eagerPreloadStarted = false;
  GDOCS_OFFSCREEN.eagerPreloadLanguage = "";
  GDOCS_OFFSCREEN.eagerPreloadResult = null;
  BG_GDOCS_ENGINE.preloadedLanguages.clear();
  BG_GDOCS_ENGINE.loading = null;
  GDOCS_PROGRESS_ROUTES.clear();
  const shutdown = resetGdocsOffscreenDocument("extension-disabled");
  GDOCS_OFFSCREEN.shutdown = shutdown;
  try {
    return await shutdown;
  } finally {
    if (GDOCS_OFFSCREEN.shutdown === shutdown) GDOCS_OFFSCREEN.shutdown = null;
  }
}

async function ensureGdocsOffscreenDocument() {
  if (!chrome.offscreen?.createDocument) throw new Error("Offscreen API no disponible");
  if (await hasOffscreenDocument()) return true;
  if (!GDOCS_OFFSCREEN.creating) {
    const createWithReason = async reason => chrome.offscreen.createDocument({
      url: "src/offscreen.html",
      reasons: [reason],
      justification: "Mantenir el motor complet del corrector català fora de Google Docs sense bloquejar la pàgina."
    });

    GDOCS_OFFSCREEN.creating = (async () => {
      try {
        await createWithReason("WORKERS");
      } catch (error) {
        try {
          await createWithReason("DOM_PARSER");
        } catch (fallbackError) {
          throw new Error(`No he pogut obrir offscreen document: ${error?.message || error}; fallback: ${fallbackError?.message || fallbackError}`);
        }
      }
    })().finally(() => {
      GDOCS_OFFSCREEN.creating = null;
    });
  }
  await GDOCS_OFFSCREEN.creating;
  return true;
}

function sendMessageWithTimeout(payload, timeoutMs) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("Timeout esperant resposta del motor offscreen"));
    }, timeoutMs);

    chrome.runtime.sendMessage(payload, response => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const lastError = chrome.runtime.lastError;
      if (lastError) reject(new Error(lastError.message));
      else resolve(response);
    });
  });
}

function googleDocsTimeoutForMode(mode, manualMs = 50000) {
  if (mode === "manual") return manualMs;
  if (mode === "panel") return 24000;
  if (mode === "scroll") return 12000;
  if (mode === "queued") return 18000;
  return 20000;
}

async function resetGdocsOffscreenDocument(reason = "reset") {
  GDOCS_OFFSCREEN.creating = null;
  GDOCS_OFFSCREEN.eagerPreloadStarted = false;
  if (!chrome.offscreen?.closeDocument) {
    return { ok: false, error: "Offscreen closeDocument no disponible", reason };
  }
  try {
    if (await hasOffscreenDocument()) await chrome.offscreen.closeDocument();
    return { ok: true, reason };
  } catch (error) {
    return { ok: false, error: String(error?.message || error), reason };
  }
}

function deleteIndexedDb(dbName) {
  return new Promise(resolve => {
    if (typeof indexedDB === "undefined" || !indexedDB.deleteDatabase) {
      resolve({ ok: false, dbName, error: "IndexedDB no disponible" });
      return;
    }
    const started = Date.now();
    const request = indexedDB.deleteDatabase(dbName);
    request.onsuccess = () => resolve({ ok: true, dbName, durationMs: Date.now() - started });
    request.onerror = () => resolve({ ok: false, dbName, durationMs: Date.now() - started, error: String(request.error?.message || request.error || "deleteDatabase error") });
    request.onblocked = () => resolve({ ok: false, dbName, durationMs: Date.now() - started, blocked: true, error: "La base de dades encara esta oberta en algun context" });
  });
}

async function getGdocsOffscreenDiagnostics() {
  if (!await hasOffscreenDocument()) {
    return { ok: true, offscreenOpen: false };
  }
  try {
    const response = await sendMessageWithTimeout({ type: "OFFSCREEN_GDOCS_DIAGNOSTICS" }, 4000);
    return { offscreenOpen: true, ...response };
  } catch (error) {
    return { ok: false, offscreenOpen: true, error: String(error?.message || error) };
  }
}

async function getGdocsOffscreenReadiness(language = "ca-ES") {
  if (!await hasOffscreenDocument()) {
    return { ok: true, offscreenOpen: false, readiness: defaultReadiness(language) };
  }
  try {
    const response = await sendMessageWithTimeout({ type: "OFFSCREEN_GDOCS_READINESS", language }, 1200);
    return { offscreenOpen: true, ...response };
  } catch (error) {
    return {
      ok: false,
      offscreenOpen: true,
      error: String(error?.message || error),
      readiness: {
        ...defaultReadiness(language),
        offscreenOpen: true,
        phase: "readiness-timeout",
        percent: 40,
        message: "Motor ocupat carregant recursos"
      }
    };
  }
}

async function getEngineReadiness(language = "ca-ES") {
  const offscreenOpen = await hasOffscreenDocument();
  if (!offscreenOpen) {
    return {
      ok: true,
      readiness: {
        ...defaultReadiness(language),
        offscreenOpen,
        percent: GDOCS_OFFSCREEN.eagerPreloadStarted ? 15 : 0,
        phase: GDOCS_OFFSCREEN.eagerPreloadStarted ? "preload-started" : "cold",
        message: GDOCS_OFFSCREEN.eagerPreloadStarted ? "Precarrega iniciada; offscreen pendent" : "Motor encara no obert"
      },
      background: {
        eagerPreloadStarted: !!GDOCS_OFFSCREEN.eagerPreloadStarted,
        eagerPreloadAt: GDOCS_OFFSCREEN.eagerPreloadAt || 0,
        eagerPreloadResult: GDOCS_OFFSCREEN.eagerPreloadResult
      }
    };
  }
  const offscreen = await getGdocsOffscreenReadiness(language);
  const readiness = offscreen?.readiness || defaultReadiness(language);
  return {
    ok: offscreen?.ok !== false,
    readiness: {
      ...readiness,
      language,
      offscreenOpen: true,
      percent: Math.max(0, Math.min(100, Math.round(Number(readiness.percent || 0))))
    },
    offscreen,
    background: {
      eagerPreloadStarted: !!GDOCS_OFFSCREEN.eagerPreloadStarted,
      eagerPreloadAt: GDOCS_OFFSCREEN.eagerPreloadAt || 0,
      eagerPreloadResult: GDOCS_OFFSCREEN.eagerPreloadResult,
      lastCheck: BG_GDOCS_ENGINE.lastCheck,
      activeChecks: BG_GDOCS_ENGINE.activeChecks
    }
  };
}

async function runColdStartDiagnostics(language = "ca-ES") {
  const started = Date.now();
  const before = await getGdocsOffscreenDiagnostics();
  const reset = await resetGdocsOffscreenDocument("cold-start-diagnostics");
  BG_GDOCS_ENGINE.preloadedLanguages.clear();
  BG_GDOCS_ENGINE.loading = null;
  const cacheDelete = await deleteIndexedDb("corrector-local-engine-cache");
  const preloadStarted = Date.now();
  const preload = await preloadGoogleDocsFullEngine(language, { keepAlive: false }).catch(error => ({
    ok: false,
    transport: "cold-start-preload-failed",
    durationMs: Date.now() - preloadStarted,
    error: String(error?.message || error)
  }));
  const after = await getGdocsOffscreenDiagnostics();
  return {
    ok: !!preload.ok,
    language,
    totalMs: Date.now() - started,
    reset,
    cacheDelete,
    preload,
    before,
    after,
    background: {
      engineLoadedInServiceWorker: !!globalThis.CorrectorLocalEngine?.checkText,
      preloadedLanguages: Array.from(BG_GDOCS_ENGINE.preloadedLanguages || []),
      lastCheck: BG_GDOCS_ENGINE.lastCheck,
      offscreenAvailable: !!chrome.offscreen?.createDocument,
      eagerPreloadStarted: !!GDOCS_OFFSCREEN.eagerPreloadStarted
    }
  };
}

async function checkTextInOffscreen(text, language, mode, options = {}) {
  await ensureGdocsOffscreenDocument();
  const response = await sendMessageWithTimeout({
    type: "OFFSCREEN_GDOCS_CHECK",
    text,
    language,
    mode,
    jobId: options.jobId,
    fast: !!options.fast,
    ultraFast: !!options.ultraFast,
    budgetMs: options.budgetMs || 0,
    tracePerformance: !!options.tracePerformance,
    source: options.source || "google-docs"
  }, googleDocsTimeoutForMode(mode));
  if (!response?.ok) throw new Error(response?.error || "L'offscreen document no ha retornat resultat");
  return response;
}

async function checkTextBatchInOffscreen(items, language, mode, options = {}) {
  await ensureGdocsOffscreenDocument();
  const response = await sendMessageWithTimeout({
    type: "OFFSCREEN_GDOCS_CHECK_BATCH",
    items,
    language,
    mode,
    jobId: options.jobId,
    requestId: options.requestId || "",
    fast: !!options.fast,
    ultraFast: !!options.ultraFast,
    budgetMs: options.budgetMs || 0,
    tracePerformance: !!options.tracePerformance,
    source: options.source || "google-docs"
  }, googleDocsTimeoutForMode(mode));
  if (!response?.ok) throw new Error(response?.error || "L'offscreen document no ha retornat resultat");
  return response;
}

const checkGoogleDocsInOffscreen = checkTextInOffscreen;
const checkGoogleDocsBatchInOffscreen = checkTextBatchInOffscreen;

async function ensureBackgroundCorrectorEngine() {
  globalThis.window = globalThis;
  if (globalThis.CorrectorLocalEngine?.checkText) return globalThis.CorrectorLocalEngine;
  if (!BG_GDOCS_ENGINE.loading) {
    BG_GDOCS_ENGINE.loading = import(chrome.runtime.getURL("src/language-engine.js")).then(() => {
      if (!globalThis.CorrectorLocalEngine?.checkText) {
        throw new Error("El motor no s'ha carregat al background service worker");
      }
      return globalThis.CorrectorLocalEngine;
    }).catch(error => {
      BG_GDOCS_ENGINE.loading = null;
      throw error;
    });
  }
  return BG_GDOCS_ENGINE.loading;
}

function runTinyCatalanFallback(text) {
  const source = String(text || "");
  const results = [];
  const add = (start, end, ruleId, suggestions, message) => {
    if (start < 0 || end <= start) return;
    results.push({
      start,
      end,
      text: source.slice(start, end),
      ruleId,
      type: ruleId.includes("SPELL") || ruleId.includes("FAST") ? "spelling" : "grammar",
      color: ruleId.includes("SPELL") || ruleId.includes("FAST") ? "red" : "yellow",
      message: message || "Possible error.",
      suggestions: suggestions || []
    });
  };
  const exact = [
    [/\baixo\b/giu, ["això"], "CA_FAST_AIXO"],
    [/\bperque\b/giu, ["perquè"], "CA_FAST_PERQUE"],
    [/\brapid\b/giu, ["ràpid"], "CA_FAST_RAPID"],
    [/\balgu\b/giu, ["algú"], "CA_FAST_ALGU"],
    [/\bberitat\b/giu, ["veritat"], "CA_FAST_BERITAT"],
    [/\bfalz\b/giu, ["fals"], "CA_FAST_FALZ"],
    [/\bqem\b/giu, ["que em"], "CA_FAST_QEM"],
    [/\bhem dius\b/giu, ["em dius"], "CA_FAST_HEM_EM"],
    [/\btinc que\b/giu, ["he de"], "CA_FAST_TENIR_QUE"]
  ];
  for (const [re, suggestions, ruleId] of exact) {
    let m;
    while ((m = re.exec(source))) add(m.index, m.index + m[0].length, ruleId, suggestions, "Correcció ràpida de català.");
  }
  // No fem capitalització al fallback mínim: en Google Docs una marca d'una sola lletra
  // és molt fàcil de seleccionar malament i trenca la substitució. La farà el motor complet.
  return results.slice(0, 80);
}


async function preloadGoogleDocsFullEngine(language = "ca-ES", options = {}) {
  const started = Date.now();
  const keepAlive = !!options.keepAlive;
  const timeoutMs = keepAlive ? 35000 : 60000;
  if (GDOCS_OFFSCREEN.shutdown) await GDOCS_OFFSCREEN.shutdown.catch(() => {});
  if (!await isCorrectionEnabled()) {
    return { ok: false, transport: "preload-skipped-disabled", durationMs: Date.now() - started, error: "El corrector està desactivat" };
  }
  const lifecycleRevision = GDOCS_OFFSCREEN.lifecycleRevision;
  try {
    await ensureGdocsOffscreenDocument();
    if (lifecycleRevision !== GDOCS_OFFSCREEN.lifecycleRevision || !await isCorrectionEnabled()) {
      if (!await isCorrectionEnabled()) await resetGdocsOffscreenDocument("preload-cancelled-disabled");
      return { ok: false, transport: "preload-cancelled-disabled", durationMs: Date.now() - started, error: "El corrector s'ha desactivat durant la càrrega" };
    }
    const response = await sendMessageWithTimeout({
      type: "OFFSCREEN_GDOCS_PRELOAD",
      language
    }, timeoutMs);
    if (!response?.ok) throw new Error(response?.error || "No s'ha pogut preescalfar l'offscreen");
    return {
      ok: true,
      transport: response.transport || "offscreen-preload",
      durationMs: Date.now() - started,
      readiness: response.readiness || null
    };
  } catch (offscreenError) {
    if (keepAlive) {
      return {
        ok: false,
        transport: "keepalive-timeout-no-reset",
        durationMs: Date.now() - started,
        error: String(offscreenError?.message || offscreenError)
      };
    }
    const engine = await ensureBackgroundCorrectorEngine();
    if (engine.preload && !BG_GDOCS_ENGINE.preloadedLanguages.has(language)) {
      await engine.preload([language]);
      BG_GDOCS_ENGINE.preloadedLanguages.add(language);
    }
    return {
      ok: true,
      transport: "background-preload",
      durationMs: Date.now() - started,
      offscreenError: String(offscreenError?.message || offscreenError)
    };
  }
}


async function eagerPreloadGoogleDocsEngine() {
  if (factoryResetInProgress) return;
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS).catch(() => DEFAULT_SETTINGS);
  if (factoryResetInProgress) return;
  if (settings.enabled === false || settings.alwaysPreloadEngine === false) return;
  const language = settings.language === "ca" ? "ca-ES" : settings.language === "es" ? "es-ES" : settings.language === "en" ? "en-US" : settings.language || "ca-ES";
  if (GDOCS_OFFSCREEN.eagerPreloadStarted && GDOCS_OFFSCREEN.eagerPreloadLanguage === language
      && await hasOffscreenDocument()) return;
  GDOCS_OFFSCREEN.eagerPreloadStarted = true;
  GDOCS_OFFSCREEN.eagerPreloadLanguage = language;
  GDOCS_OFFSCREEN.eagerPreloadAt = Date.now();
  preloadGoogleDocsFullEngine(language).then(result => {
    if (GDOCS_OFFSCREEN.eagerPreloadLanguage !== language) return;
    GDOCS_OFFSCREEN.eagerPreloadResult = {
      ok: !!result.ok,
      transport: result.transport || "",
      durationMs: result.durationMs || 0,
      at: Date.now(),
      percent: result.readiness?.percent || 0
    };
  }).catch(error => {
    if (GDOCS_OFFSCREEN.eagerPreloadLanguage !== language) return;
    GDOCS_OFFSCREEN.eagerPreloadResult = {
      ok: false,
      error: String(error?.message || error),
      at: Date.now()
    };
    GDOCS_OFFSCREEN.eagerPreloadStarted = false;
  });
}

try {
  chrome.runtime?.onStartup?.addListener?.(() => setTimeout(eagerPreloadGoogleDocsEngine, 250));
  chrome.runtime?.onInstalled?.addListener?.(() => setTimeout(eagerPreloadGoogleDocsEngine, 250));
  setTimeout(eagerPreloadGoogleDocsEngine, 500);
} catch (_) {}

chrome.storage?.onChanged?.addListener?.((changes, area) => {
  if (factoryResetInProgress) return;
  if (area !== "sync") return;
  const enabledChanged = Object.prototype.hasOwnProperty.call(changes, "enabled");
  const languageChanged = Object.prototype.hasOwnProperty.call(changes, "language");
  if (!enabledChanged && !languageChanged) return;
  extensionEngineLifecycleQueue = extensionEngineLifecycleQueue.catch(() => {}).then(async () => {
    const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS).catch(() => DEFAULT_SETTINGS);
    if (settings.enabled === false) {
      if (enabledChanged) await stopEngineForDisabledExtension();
      return;
    }
    if (enabledChanged) GDOCS_OFFSCREEN.lifecycleRevision += 1;
    if (settings.alwaysPreloadEngine !== false && (enabledChanged || languageChanged)) await eagerPreloadGoogleDocsEngine();
  });
});

async function checkGoogleDocsInBackground(message) {
  const started = Date.now();
  const text = String(message.text || "");
  const language = message.language || "ca-ES";
  const mode = message.mode || "post-scroll-light";
  const fast = !!message.fast;
  const ultraFast = !!message.ultraFast;
  const source = message.source || "google-docs";
  const budgetMs = Number(message.budgetMs || 0);
  const perItemDeadlineMs = ultraFast ? 180 : fast ? 420 : 0;
  BG_GDOCS_ENGINE.activeChecks += 1;

  const finish = response => {
    BG_GDOCS_ENGINE.checkCount += 1;
    BG_GDOCS_ENGINE.lastCheck = {
      ok: !!response.ok,
      durationMs: response.durationMs ?? (Date.now() - started),
      chars: text.length,
      issues: Array.isArray(response.issues) ? response.issues.length : 0,
      mode,
      fullEngine: !!response.fullEngine,
      transport: response.transport || "unknown",
      chunked: !!response.chunked,
      chunkedItems: response.chunkedItems || 0,
      chunkMetrics: response.chunkMetrics || null,
      splitBatch: !!response.splitBatch,
      poolSize: response.poolSize || 1,
      lanes: response.lanes || [],
      slowBatches: response.slowBatches || [],
      ruleSummary: response.ruleSummary || [],
      workerStatus: response.workerStatus || null,
      error: response.error || response.engineError || null
    };
    return response;
  };

  try {
    if (!await isCorrectionEnabled()) {
      return finish({ ok: false, transport: "check-skipped-disabled", error: "El corrector està desactivat" });
    }
    // Via principal: document ocult persistent. Això manté el diccionari carregat i evita
    // que el service worker es reiniciï enmig d'una sessió llarga de Google Docs.
    const offscreen = await checkGoogleDocsInOffscreen(text, language, mode, { jobId: message.jobId, fast, ultraFast, budgetMs });
    return finish({
      ok: true,
      transport: offscreen.transport || "offscreen-full-engine",
      issues: Array.isArray(offscreen.issues) ? offscreen.issues : [],
      engineIssues: Array.isArray(offscreen.issues) ? offscreen.issues.length : 0,
      durationMs: offscreen.durationMs ?? (Date.now() - started),
      fullEngine: true,
      tinyFallbackIssues: 0,
      offscreen: true,
      chunked: !!offscreen.chunked,
      chunkMetrics: offscreen.chunkMetrics || null,
      workerStatus: offscreen.workerStatus || null
    });
  } catch (offscreenError) {
    if (!await isCorrectionEnabled()) {
      return finish({ ok: false, transport: "check-cancelled-disabled", error: "El corrector s'ha desactivat durant la comprovació" });
    }
    try {
      // Fallback general, encara amb motor complet. No hi ha cap llista manual d'errors.
      const engine = await ensureBackgroundCorrectorEngine();
      if (engine.preload && !BG_GDOCS_ENGINE.preloadedLanguages.has(language)) {
        await engine.preload([language]);
        BG_GDOCS_ENGINE.preloadedLanguages.add(language);
      }
      const issues = engine.checkText
        ? engine.checkText(text, {
            language,
            mode: ultraFast ? "gdocs-background-ultra-fast" : fast ? "gdocs-background-fast" : "gdocs-background-full",
            interactive: false,
            fast,
            ultraFast,
            deadlineMs: perItemDeadlineMs,
            background: true,
            source
          }) || []
        : [];
      return finish({
        ok: true,
        transport: "background-full-engine",
        issues,
        engineIssues: issues.length,
        tinyFallbackIssues: 0,
        durationMs: Date.now() - started,
        fullEngine: true,
        offscreenError: String(offscreenError?.message || offscreenError)
      });
    } catch (engineError) {
      return finish({
        ok: false,
        transport: "full-engine-unavailable",
        issues: [],
        engineIssues: 0,
        tinyFallbackIssues: 0,
        durationMs: Date.now() - started,
        engineError: String(engineError?.message || engineError),
        offscreenError: String(offscreenError?.message || offscreenError),
        fullEngine: false
      });
    }
  } finally {
    BG_GDOCS_ENGINE.activeChecks = Math.max(0, BG_GDOCS_ENGINE.activeChecks - 1);
  }
}

async function checkGoogleDocsBatchInBackground(message) {
  const started = Date.now();
  const language = message.language || "ca-ES";
  const mode = message.mode || "post-scroll-light";
  const fast = !!message.fast;
  const ultraFast = !!message.ultraFast;
  const source = message.source || "google-docs";
  const budgetMs = Number(message.budgetMs || 0);
  const perItemDeadlineMs = ultraFast ? 180 : fast ? 420 : 0;
  BG_GDOCS_ENGINE.activeChecks += 1;
  const items = (Array.isArray(message.items) ? message.items : [])
    .map((item, index) => ({
      id: String(item?.id ?? index),
      text: String(item?.text || "")
    }))
    .filter(item => item.text);

  const finish = response => {
    const issueCount = (response.results || []).reduce((sum, item) => sum + (Array.isArray(item.issues) ? item.issues.length : 0), 0);
    BG_GDOCS_ENGINE.checkCount += items.length || 1;
    BG_GDOCS_ENGINE.lastCheck = {
      ok: !!response.ok,
      durationMs: response.durationMs ?? (Date.now() - started),
      batch: true,
      items: items.length,
      chars: items.reduce((sum, item) => sum + item.text.length, 0),
      issues: issueCount,
      mode,
      budgetMs,
      fast,
      ultraFast,
      fullEngine: !!response.fullEngine,
      transport: response.transport || "unknown",
      chunked: !!response.chunked,
      chunkedItems: response.chunkedItems || 0,
      chunkMetrics: response.chunkMetrics || null,
      workerStatus: response.workerStatus || null,
      itemMetrics: response.itemMetrics || null,
      engineDiagnostics: response.engineDiagnostics || null,
      error: response.error || response.engineError || null
    };
    return response;
  };

  try {
    if (!await isCorrectionEnabled()) {
      return finish({
        ok: false,
        transport: "check-skipped-disabled",
        error: "El corrector està desactivat",
        results: items.map(item => ({ id: item.id, issues: [], engineIssues: 0 }))
      });
    }
    if (!items.length) {
      return finish({
        ok: true,
        transport: "background-empty-batch",
        results: [],
        durationMs: Date.now() - started,
        fullEngine: true
      });
    }

    const offscreen = await checkGoogleDocsBatchInOffscreen(items, language, mode, {
      jobId: message.jobId,
      requestId: message.requestId || "",
      fast,
      ultraFast,
      budgetMs,
      tracePerformance: !!message.tracePerformance
    });
    return finish({
      ok: true,
      transport: offscreen.transport || "offscreen-full-engine-batch",
      results: Array.isArray(offscreen.results) ? offscreen.results : [],
      pendingIds: Array.isArray(offscreen.pendingIds) ? offscreen.pendingIds : [],
      durationMs: offscreen.durationMs ?? (Date.now() - started),
      fullEngine: true,
      offscreen: true,
      fast: !!offscreen.fast,
      ultraFast: !!offscreen.ultraFast,
      budgetMs: offscreen.budgetMs || budgetMs,
      partial: !!offscreen.partial,
      cancelled: !!offscreen.cancelled,
      chunkedItems: offscreen.chunkedItems || 0,
      chunkMetrics: offscreen.chunkMetrics || [],
      splitBatch: !!offscreen.splitBatch,
      poolSize: offscreen.poolSize || 1,
      lanes: offscreen.lanes || [],
      itemMetrics: offscreen.itemMetrics || [],
      engineDiagnostics: offscreen.engineDiagnostics || null,
      slowBatches: offscreen.slowBatches || [],
      ruleSummary: offscreen.ruleSummary || [],
      workerStatus: offscreen.workerStatus || null,
      workerTrace: offscreen.workerTrace || null
    });
  } catch (offscreenError) {
    if (!await isCorrectionEnabled()) {
      return finish({
        ok: false,
        transport: "check-cancelled-disabled",
        error: "El corrector s'ha desactivat durant la comprovació",
        results: items.map(item => ({ id: item.id, issues: [], engineIssues: 0 }))
      });
    }
    try {
      const engine = await ensureBackgroundCorrectorEngine();
      if (engine.preload && !BG_GDOCS_ENGINE.preloadedLanguages.has(language)) {
        await engine.preload([language]);
        BG_GDOCS_ENGINE.preloadedLanguages.add(language);
      }
      const results = [];
      let stoppedByBudget = false;
      for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
        const item = items[itemIndex];
        if (budgetMs && Date.now() - started > budgetMs && results.length) {
          stoppedByBudget = true;
          break;
        }
        const issues = engine.checkText
          ? engine.checkText(item.text, {
              language,
              mode: ultraFast ? "gdocs-background-ultra-fast" : fast ? "gdocs-background-fast" : "gdocs-background-full",
              interactive: false,
              fast,
              ultraFast,
              deadlineMs: perItemDeadlineMs,
              background: true,
              source
            }) || []
          : [];
        results.push({ id: item.id, issues, engineIssues: issues.length });
        if (itemIndex % 4 === 3) {
          if (globalThis.scheduler?.yield) await globalThis.scheduler.yield();
          else await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      const doneIds = new Set(results.map(item => String(item.id)));
      const pendingIds = items.filter(item => !doneIds.has(String(item.id))).map(item => item.id);
      return finish({
        ok: true,
        transport: "background-full-engine-batch",
        results,
        pendingIds,
        durationMs: Date.now() - started,
        fullEngine: true,
        partial: stoppedByBudget || pendingIds.length > 0,
        offscreenError: String(offscreenError?.message || offscreenError)
      });
    } catch (engineError) {
      return finish({
        ok: false,
        transport: "full-engine-unavailable",
        results: items.map(item => ({ id: item.id, issues: [], engineIssues: 0 })),
        durationMs: Date.now() - started,
        engineError: String(engineError?.message || engineError),
        offscreenError: String(offscreenError?.message || offscreenError),
        fullEngine: false
      });
    }
  } finally {
    BG_GDOCS_ENGINE.activeChecks = Math.max(0, BG_GDOCS_ENGINE.activeChecks - 1);
  }
}

async function checkNormalTextInBackground(message) {
  const started = Date.now();
  const text = String(message.text || "");
  const language = message.language || "ca-ES";
  const mode = message.mode || "normal-page";
  const fast = message.fast !== false;
  const ultraFast = !!message.ultraFast;
  const source = message.source || "normal-page";
  const budgetMs = Number(message.budgetMs || 1200);
  const perItemDeadlineMs = ultraFast ? 180 : fast ? 420 : 0;
  BG_GDOCS_ENGINE.activeChecks += 1;

  const finish = response => {
    BG_GDOCS_ENGINE.checkCount += 1;
    BG_GDOCS_ENGINE.lastCheck = {
      ok: !!response.ok,
      durationMs: response.durationMs ?? (Date.now() - started),
      chars: text.length,
      issues: Array.isArray(response.issues) ? response.issues.length : 0,
      mode,
      fullEngine: !!response.fullEngine,
      transport: response.transport || "unknown",
      source,
      chunked: !!response.chunked,
      chunkedItems: response.chunkedItems || 0,
      chunkMetrics: response.chunkMetrics || null,
      workerStatus: response.workerStatus || null,
      error: response.error || response.engineError || null
    };
    return response;
  };

  try {
    if (!await isCorrectionEnabled()) {
      return finish({ ok: false, transport: "check-skipped-disabled", error: "El corrector està desactivat" });
    }
    if (!text) {
      return finish({ ok: true, transport: "background-empty-normal", issues: [], durationMs: Date.now() - started, fullEngine: true });
    }
    const offscreen = await checkTextInOffscreen(text, language, mode, {
      jobId: message.jobId,
      fast,
      ultraFast,
      budgetMs,
      source
    });
    return finish({
      ok: true,
      transport: offscreen.transport || "offscreen-full-engine",
      issues: Array.isArray(offscreen.issues) ? offscreen.issues : [],
      engineIssues: Array.isArray(offscreen.issues) ? offscreen.issues.length : 0,
      durationMs: offscreen.durationMs ?? (Date.now() - started),
      fullEngine: true,
      offscreen: true,
      cancelled: !!offscreen.cancelled,
      chunked: !!offscreen.chunked,
      chunkMetrics: offscreen.chunkMetrics || null,
      workerStatus: offscreen.workerStatus || null
    });
  } catch (offscreenError) {
    if (!await isCorrectionEnabled()) {
      return finish({ ok: false, transport: "check-cancelled-disabled", error: "El corrector s'ha desactivat durant la comprovació" });
    }
    try {
      const engine = await ensureBackgroundCorrectorEngine();
      if (engine.preload && !BG_GDOCS_ENGINE.preloadedLanguages.has(language)) {
        await engine.preload([language]);
        BG_GDOCS_ENGINE.preloadedLanguages.add(language);
      }
      const issues = engine.checkText
        ? engine.checkText(text, {
            language,
            mode: fast ? "normal-background-fast" : "normal-background-full",
            interactive: false,
            fast,
            ultraFast,
            deadlineMs: perItemDeadlineMs,
            background: true,
            source
          }) || []
        : [];
      return finish({
        ok: true,
        transport: "background-full-engine",
        issues,
        engineIssues: issues.length,
        durationMs: Date.now() - started,
        fullEngine: true,
        offscreenError: String(offscreenError?.message || offscreenError)
      });
    } catch (engineError) {
      return finish({
        ok: false,
        transport: "normal-full-engine-unavailable",
        issues: [],
        engineIssues: 0,
        durationMs: Date.now() - started,
        engineError: String(engineError?.message || engineError),
        offscreenError: String(offscreenError?.message || offscreenError),
        fullEngine: false
      });
    }
  } finally {
    BG_GDOCS_ENGINE.activeChecks = Math.max(0, BG_GDOCS_ENGINE.activeChecks - 1);
  }
}


const DEFAULT_SETTINGS = {
  enabled: true,
  language: "ca-ES",
  uiLanguage: "ca",
  theme: "system",
  googleDocsMode: "auto",
  showReviewButton: true,
  showDebugBadge: true,
  gdocsHideNative: true,
  gdocsPreferOwnPopup: true,
  alwaysPreloadEngine: true,
  excludedSites: [],
  disabledEditorGroups: []
};

function detectInitialUiLanguage() {
  let locale = "";
  try { locale = String(chrome.i18n?.getUILanguage?.() || ""); } catch (_) {}
  const primary = locale.trim().replaceAll("_", "-").split("-")[0].toLowerCase();
  return ["ca", "es", "en"].includes(primary) ? primary : "en";
}

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.sync.get(null);
  const current = { ...DEFAULT_SETTINGS, ...stored };
  if (!["ca", "es", "en"].includes(stored.uiLanguage)) current.uiLanguage = detectInitialUiLanguage();
  await chrome.storage.sync.remove(["debounceMs", "maxTextLength"]);
  if (current.language === "ca") current.language = "ca-ES";
  if (current.language === "es") current.language = "es-ES";
  if (current.language === "en") current.language = "en-US";
  await chrome.storage.sync.set({ ...DEFAULT_SETTINGS, ...current });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "CL_OPEN_ACTION_POPUP") {
    if (!sender?.tab?.id) { sendResponse({ ok: false, error: "Missing tab context" }); return false; }
    const openFallback = () => chrome.tabs.create({ url: chrome.runtime.getURL("src/popup.html"), active: true });
    if (typeof chrome.action?.openPopup === "function") {
      const options = Number.isInteger(sender.tab.windowId) ? { windowId: sender.tab.windowId } : undefined;
      Promise.resolve(options ? chrome.action.openPopup(options) : chrome.action.openPopup())
        .then(() => sendResponse({ ok: true, mode: "action-popup" }))
        .catch(() => openFallback().then(() => sendResponse({ ok: true, mode: "popup-tab" }))
          .catch(error => sendResponse({ ok: false, error: String(error?.message || error) })));
    } else {
      openFallback().then(() => sendResponse({ ok: true, mode: "popup-tab" }))
        .catch(error => sendResponse({ ok: false, error: String(error?.message || error) }));
    }
    return true;
  }

  if (message?.type === "RESET_EXTENSION_TO_FACTORY_DEFAULTS") {
    resetExtensionToFactoryDefaults().then(sendResponse).catch(error => sendResponse({
      ok: false,
      error: String(error?.message || error)
    }));
    return true;
  }

  if (message?.type === "GET_SETTINGS") {
    chrome.storage.sync.get(DEFAULT_SETTINGS).then(sendResponse);
    return true;
  }

  if (message?.type === "CL_GET_TEMPORARY_DISMISSALS") {
    const tabId = sender?.tab?.id;
    if (!Number.isInteger(tabId)) { sendResponse({ ok: false, keys: [] }); return false; }
    getTemporaryDismissals(tabId).then(keys => sendResponse({ ok: true, keys }))
      .catch(() => sendResponse({ ok: false, keys: [] }));
    return true;
  }

  if (message?.type === "CL_ADD_TEMPORARY_DISMISSAL") {
    const tabId = sender?.tab?.id;
    const issueKey = String(message.issueKey || "");
    if (!Number.isInteger(tabId) || issueKey.length > 2000 || !issueKey.includes("|")) {
      sendResponse({ ok: false }); return false;
    }
    updateTemporaryDismissals(tabId, values => [...values, issueKey]).then(() => {
      chrome.tabs.sendMessage(tabId, { type: "CL_TEMPORARY_DISMISSAL_ADDED", issueKey }).catch(() => {});
      sendResponse({ ok: true });
    }).catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (message?.type === "CL_CLEAR_TEMPORARY_DISMISSALS") {
    const tabId = sender?.tab?.id;
    if (!Number.isInteger(tabId)) { sendResponse({ ok: false }); return false; }
    const groupPrefix = message.groupPrefix;
    if (groupPrefix !== undefined && (typeof groupPrefix !== "string"
      || groupPrefix.length > 1800 || !groupPrefix.includes("|"))) {
      sendResponse({ ok: false }); return false;
    }
    const requestedKeys = Array.isArray(message.issueKeys)
      ? [...new Set(message.issueKeys.filter(key => typeof key === "string" && key.length <= 2000))]
      : null;
    let removedGroupKeys = [];
    const clear = typeof groupPrefix === "string"
      ? updateTemporaryDismissals(tabId, values => {
          removedGroupKeys = values.filter(key => key.startsWith(groupPrefix));
          return values.filter(key => !key.startsWith(groupPrefix));
        }).then(() => {
          chrome.tabs.sendMessage(tabId, {
            type: "CL_TEMPORARY_DISMISSALS_REMOVED", issueKeys: removedGroupKeys, groupPrefix
          }).catch(() => {});
        })
      : requestedKeys
      ? updateTemporaryDismissals(tabId, values => {
          const removed = new Set(requestedKeys);
          return values.filter(key => !removed.has(key));
        }).then(() => {
          chrome.tabs.sendMessage(tabId, { type: "CL_TEMPORARY_DISMISSALS_REMOVED", issueKeys: requestedKeys }).catch(() => {});
        })
      : clearTemporaryDismissals(tabId);
    clear.then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (message?.type === "SET_SETTINGS") {
    chrome.storage.sync.set(message.payload || {}).then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message?.type === "CL_LOAD_ENGINE_SCRIPT") {
    const tabId = sender?.tab?.id;
    const frameId = typeof sender?.frameId === "number" ? sender.frameId : 0;
    if (!tabId) {
      sendResponse({ ok: false, error: "No tab id" });
      return false;
    }

    chrome.scripting.executeScript({
      target: { tabId, frameIds: [frameId] },
      files: ["src/language-engine.js"]
    }).then(() => {
      sendResponse({ ok: true });
    }).catch(error => {
      sendResponse({ ok: false, error: String(error?.message || error) });
    });
    return true;
  }

  if (message?.type === "CL_FRAME_REVIEW_CARD_OPEN") {
    const tabId = sender?.tab?.id;
    const childFrameId = sender?.frameId;
    const cardId = String(message.cardId || "");
    if (!Number.isInteger(tabId) || !Number.isInteger(childFrameId) || childFrameId <= 0
      || message.parentFrameId !== 0 || !cardId || !message.issue || !message.rect) {
      sendResponse({ ok: false, error: "Invalid frame review card route" });
      return false;
    }
    const route = { tabId, childFrameId, parentFrameId: 0 };
    FRAME_REVIEW_CARD_ROUTES.set(cardId, route);
    chrome.tabs.sendMessage(tabId, { ...message, type: "CL_FRAME_REVIEW_CARD_OPEN", childFrameId }, { frameId: 0 })
      .then(() => sendResponse({ ok: true }))
      .catch(error => {
        FRAME_REVIEW_CARD_ROUTES.delete(cardId);
        sendResponse({ ok: false, error: String(error?.message || error) });
      });
    return true;
  }

  if (message?.type === "CL_FRAME_REVIEW_CARD_ACTION" || message?.type === "CL_FRAME_REVIEW_CARD_CLOSE") {
    const tabId = sender?.tab?.id;
    const cardId = String(message.cardId || "");
    const route = FRAME_REVIEW_CARD_ROUTES.get(cardId);
    if (!route || route.tabId !== tabId || sender?.frameId !== route.parentFrameId) {
      sendResponse({ ok: false, stale: true });
      return false;
    }
    if (message.type === "CL_FRAME_REVIEW_CARD_CLOSE") FRAME_REVIEW_CARD_ROUTES.delete(cardId);
    chrome.tabs.sendMessage(tabId, { ...message, type: message.type, childFrameId: route.childFrameId }, { frameId: route.childFrameId })
      .then(() => sendResponse({ ok: true }))
      .catch(error => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  }

  if (message?.type === "CL_FRAME_REVIEW_CARD_POSITION") {
    const tabId = sender?.tab?.id;
    const cardId = String(message.cardId || "");
    const route = FRAME_REVIEW_CARD_ROUTES.get(cardId);
    if (!route || route.tabId !== tabId || sender?.frameId !== route.childFrameId || !message.rect) {
      sendResponse({ ok: false, stale: true });
      return false;
    }
    chrome.tabs.sendMessage(tabId, { ...message, type: "CL_FRAME_REVIEW_CARD_POSITION" }, { frameId: route.parentFrameId })
      .then(() => sendResponse({ ok: true }))
      .catch(error => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  }

  if (message?.type === "CL_FRAME_REVIEW_CARD_ACTION_RESULT") {
    const tabId = sender?.tab?.id;
    const cardId = String(message.cardId || "");
    const route = FRAME_REVIEW_CARD_ROUTES.get(cardId);
    if (!route || route.tabId !== tabId || sender?.frameId !== route.childFrameId) {
      sendResponse({ ok: false, stale: true });
      return false;
    }
    if (message.action !== "suggest") FRAME_REVIEW_CARD_ROUTES.delete(cardId);
    chrome.tabs.sendMessage(tabId, { ...message, type: "CL_FRAME_REVIEW_CARD_ACTION_RESULT" }, { frameId: route.parentFrameId })
      .then(() => sendResponse({ ok: true }))
      .catch(error => sendResponse({ ok: false, error: String(error?.message || error) }));
    return true;
  }

  if (message?.type === "GDOCS_PRELOAD_ENGINE") {
    preloadGoogleDocsFullEngine(message.language || "ca-ES", { keepAlive: !!message.keepAlive }).then(sendResponse).catch(error => {
      sendResponse({ ok: false, error: String(error?.message || error), transport: "preload-failed" });
    });
    return true;
  }

  if (message?.type === "CL_ENGINE_READINESS") {
    getEngineReadiness(message.language || "ca-ES").then(sendResponse).catch(error => {
      sendResponse({
        ok: false,
        error: String(error?.message || error),
        readiness: defaultReadiness(message.language || "ca-ES")
      });
    });
    return true;
  }

  if (message?.type === "CL_FORCE_PRELOAD_ENGINE") {
    preloadGoogleDocsFullEngine(message.language || "ca-ES", { keepAlive: !!message.keepAlive }).then(async preload => {
      const readiness = await getEngineReadiness(message.language || "ca-ES").catch(() => null);
      sendResponse({ ok: !!preload.ok, preload, ...(readiness || {}) });
    }).catch(error => {
      sendResponse({ ok: false, error: String(error?.message || error), transport: "force-preload-failed" });
    });
    return true;
  }

  if (message?.type === "GDOCS_RESET_OFFSCREEN") {
    resetGdocsOffscreenDocument(message.reason || "content-timeout").then(sendResponse).catch(error => {
      sendResponse({ ok: false, error: String(error?.message || error), reason: message.reason || "" });
    });
    return true;
  }

  if (message?.type === "CL_COLD_START_DIAGNOSTICS") {
    runColdStartDiagnostics(message.language || "ca-ES").then(sendResponse).catch(error => {
      sendResponse({ ok: false, error: String(error?.message || error), type: "CL_COLD_START_DIAGNOSTICS" });
    });
    return true;
  }

  if (message?.type === "CL_ENGINE_DIAGNOSTICS_FULL") {
    (async () => {
      const offscreen = await getGdocsOffscreenDiagnostics();
      const backgroundEngine = globalThis.CorrectorLocalEngine?.getDiagnostics?.() || null;
      const readiness = await getEngineReadiness("ca").catch(() => null);
      sendResponse({
        ok: true,
        extensionId: chrome.runtime.id,
        manifest: chrome.runtime.getManifest(),
        readiness: readiness?.readiness || null,
        background: {
          engineLoadedInServiceWorker: !!globalThis.CorrectorLocalEngine?.checkText,
          preloadedLanguages: Array.from(BG_GDOCS_ENGINE.preloadedLanguages || []),
          lastCheck: BG_GDOCS_ENGINE.lastCheck,
          checkCount: BG_GDOCS_ENGINE.checkCount,
          activeChecks: BG_GDOCS_ENGINE.activeChecks,
          offscreenAvailable: !!chrome.offscreen?.createDocument,
          offscreenOpen: await hasOffscreenDocument(),
          eagerPreloadStarted: !!GDOCS_OFFSCREEN.eagerPreloadStarted,
          engineDiagnostics: backgroundEngine
        },
        offscreen
      });
    })().catch(error => {
      sendResponse({ ok: false, error: String(error?.message || error), type: "CL_ENGINE_DIAGNOSTICS_FULL" });
    });
    return true;
  }

  if (message?.type === "GDOCS_CHECK_TEXT") {
    checkGoogleDocsInBackground(message).then(sendResponse).catch(error => {
      sendResponse({ ok: false, error: String(error?.message || error), transport: "background-service-worker" });
    });
    return true;
  }

  if (message?.type === "NORMAL_CHECK_TEXT") {
    checkNormalTextInBackground(message).then(sendResponse).catch(error => {
      sendResponse({ ok: false, error: String(error?.message || error), transport: "normal-background-service-worker" });
    });
    return true;
  }

  if (message?.type === "OFFSCREEN_GDOCS_CHECK_BATCH_PROGRESS") {
    const route = GDOCS_PROGRESS_ROUTES.get(String(message.requestId || ""));
    if (route && String(route.jobId) === String(message.jobId)) {
      Promise.resolve().then(() => chrome.tabs.sendMessage(route.tabId, message, { frameId: route.frameId }))
        .then(() => sendResponse({ ok: true }))
        .catch(() => sendResponse({ ok: false }));
      return true;
    }
    sendResponse({ ok: false, stale: true });
    return false;
  }

  if (message?.type === "GDOCS_CANCEL_TEXT_BATCH") {
    const requestId = String(message.requestId || "");
    const route = GDOCS_PROGRESS_ROUTES.get(requestId);
    if (route && String(route.jobId) === String(message.jobId || "")
      && route.tabId === sender?.tab?.id
      && route.frameId === (Number.isInteger(sender?.frameId) ? sender.frameId : 0)) {
      sendMessageWithTimeout({ type: "OFFSCREEN_GDOCS_CANCEL_BATCH", requestId }, 1500).catch(() => {});
      sendResponse({ ok: true, cancelled: true });
      return false;
    }
    sendResponse({ ok: true, cancelled: false });
    return false;
  }

  if (message?.type === "GDOCS_CHECK_TEXT_BATCH") {
    const requestId = String(message.requestId || "");
    const tabId = sender?.tab?.id;
    if (requestId && Number.isInteger(tabId)) {
      GDOCS_PROGRESS_ROUTES.set(requestId, {
        tabId,
        frameId: Number.isInteger(sender?.frameId) ? sender.frameId : 0,
        jobId: String(message.jobId || "")
      });
    }
    checkGoogleDocsBatchInBackground(message).then(sendResponse).catch(error => {
      sendResponse({ ok: false, error: String(error?.message || error), transport: "background-service-worker-batch" });
    }).finally(() => {
      if (requestId) GDOCS_PROGRESS_ROUTES.delete(requestId);
    });
    return true;
  }

  if (message?.type === "GDOCS_DIAGNOSTICS") {
    sendResponse({
      ok: true,
      extensionId: chrome.runtime.id,
      manifest: chrome.runtime.getManifest(),
      googleDocsApi: "removed",
      backgroundGdocsEngine: BG_GDOCS_ENGINE.lastCheck,
      backgroundPreloadedLanguages: Array.from(BG_GDOCS_ENGINE.preloadedLanguages || []),
      offscreenAvailable: !!chrome.offscreen?.createDocument,
      eagerPreloadStarted: !!GDOCS_OFFSCREEN.eagerPreloadStarted
    });
    return true;
  }
});

async function resetExtensionToFactoryDefaults() {
  if (factoryResetInProgress) return { ok: false, error: "Ja s’està restablint l’extensió." };
  factoryResetInProgress = true;
  try {
    await extensionEngineLifecycleQueue.catch(() => {});
    const stopped = await stopEngineForDisabledExtension();
    if (!stopped.ok) throw new Error(stopped.error || "No s’ha pogut aturar el motor.");

    const cache = await deleteIndexedDb("corrector-local-engine-cache");
    if (!cache.ok) throw new Error(cache.error || "No s’ha pogut esborrar la memòria cau del motor.");
    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();
    if (chrome.storage.session?.clear) await chrome.storage.session.clear();
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
    return { ok: true };
  } catch (error) {
    factoryResetInProgress = false;
    throw error;
  }
}
