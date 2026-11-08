(() => {
  "use strict";

  const MANAGER_PROTOCOL = 1;
  const ENGINE_API_VERSION = 1;
  const CATALOG_SCHEMA = 1;
  const BASE = "https://raw.githubusercontent.com/arturguasch/Lletrium-Corrector-Ortografic-i-Gramatical/language-packs/";
  const PORT_NAME = "lletrium-language-manager";
  const PACKS = new Map((globalThis.LletriumPackDescriptors || []).map(item => [item.id, item]));
  const MAX_IDS = PACKS.size;
  const uiLanguageManagerPorts = new Set();
  let operationQueue = Promise.resolve();
  const inFlight = new Map();

  // Prefer profile declarations in the pack catalog so newly added variants
  // do not need another hard-coded language branch in the installer.
  function packIdForProfile(profile) {
    const value = String(profile || "");
    const declared = [...PACKS.values()].find(pack => Array.isArray(pack.profiles) && pack.profiles.includes(value));
    if (declared) return declared.id;
    return value.startsWith("ca-") ? "ca" : value === "es-ES" ? "es" : value === "en-US" ? "en" : value.startsWith("fr-") ? "fr" : "";
  }
  function defaultProfileForPack(packId) {
    const pack = PACKS.get(packId);
    if (pack?.defaultProfile && (!Array.isArray(pack.profiles) || pack.profiles.includes(pack.defaultProfile))) return pack.defaultProfile;
    if (Array.isArray(pack?.profiles) && pack.profiles.length) return pack.profiles[0];
    return packId === "ca" ? "ca-ES" : packId === "es" ? "es-ES" : packId === "en" ? "en-US" : packId === "fr" ? "fr-FR" : "";
  }

  const fail = (code, message) => Object.assign(new Error(message), { code });
  const validSender = sender => {
    try {
      const url = new URL(sender?.url || "");
      return url.origin === "https://arturguasch.github.io" && url.pathname.startsWith("/Lletrium-Corrector-Ortografic-i-Gramatical/");
    } catch (_) { return false; }
  };
  const hash = async bytes => [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map(x => x.toString(16).padStart(2, "0")).join("");
  const runtime = () => {
    const api = globalThis.LletriumLanguagePacks;
    if (!api) throw fail("STORAGE_ERROR", "El magatzem d’idiomes no està preparat.");
    return api;
  };
  const list = () => runtime().listPacks();
  const requestId = message => {
    const id = message?.requestId;
    if (id === undefined) return "";
    if (typeof id !== "string" || id.length < 8 || id.length > 128 || !/^[a-zA-Z0-9._:-]+$/.test(id)) throw fail("INVALID_REQUEST", "L’identificador de l’operació no és vàlid.");
    return id;
  };
  function operationSignature(type, ids) {
    const sorted = [...ids].sort();
    return `${type}:${sorted.join(",")}` + (type === "ADD" ? ":" + sorted.map(id => {
      const spec = PACKS.get(id);
      return [spec?.version, spec?.schema, spec?.engineApiVersion, spec?.resourceSetId, spec?.sha256].join("/");
    }).join(",") : "");
  }
  function validateProtocol(message, required = false) {
    const range = message?.managerProtocol;
    if (range === undefined && !required) return false;
    if (!range || !Number.isInteger(range.min) || !Number.isInteger(range.max) || range.min < 1 || range.max < range.min || range.min > MANAGER_PROTOCOL || range.max < MANAGER_PROTOCOL) {
      throw fail("PROTOCOL_MISMATCH", "La versió del gestor no és compatible amb aquesta extensió.");
    }
    return true;
  }
  function validateIds(value, allowEmpty = false, allowUnknown = false) {
    if (!Array.isArray(value) || value.length > (allowUnknown ? 128 : MAX_IDS) || (!allowEmpty && !value.length)) throw fail("INVALID_REQUEST", "La selecció d’idiomes no és vàlida.");
    if (value.some(id => typeof id !== "string" || !/^[a-z0-9-]{1,32}$/.test(id)) || new Set(value).size !== value.length) throw fail("INVALID_REQUEST", "La selecció d’idiomes conté valors invàlids o duplicats.");
    const unknown = value.find(id => !PACKS.has(id));
    if (unknown && !allowUnknown) throw fail("UNSUPPORTED_LANGUAGE", `L’idioma «${unknown}» no és compatible amb aquesta extensió.`);
    return value;
  }
  async function getManagerInfo(message) {
    validateProtocol(message, true);
    const api = runtime();
    const [packs, settings] = await Promise.all([list(), chrome.storage.sync.get({ uiLanguage: "ca", enabledLanguageProfiles: {} })]);
    const supportedPacks = [...PACKS.values()].map(pack => ({
      id: pack.id, file: pack.file, schemas: [pack.schema], acceptedVersions: [pack.version], engineApiVersion: pack.engineApiVersion,
      resourceSetId: pack.resourceSetId, capabilities: pack.capabilities, channel: pack.channel, labels: pack.labels, flag: pack.flag,
      profiles: pack.profiles || [], defaultProfile: defaultProfileForPack(pack.id)
    }));
    const installedPacks = packs.map(pack => {
      const spec = PACKS.get(pack.id);
      const compatible = runtime().isPackCompatible(pack, spec);
      return { id: pack.id, packVersion: String(pack.version || ""), engineApiVersion: pack.engineApiVersion ?? null, resourceSetId: pack.resourceSetId || "", state: compatible ? "compatible" : "incompatible" };
    });
    return {
      ok: true,
      managerProtocol: { min: MANAGER_PROTOCOL, max: MANAGER_PROTOCOL, selected: MANAGER_PROTOCOL },
      extensionVersion: chrome.runtime.getManifest().version,
      channel: "stable",
      catalogSchema: CATALOG_SCHEMA,
      supportedPackSchemas: [...new Set([...PACKS.values()].map(pack => pack.schema))],
      engineApiVersion: ENGINE_API_VERSION,
      capabilities: ["language-variant-selection-v1", "language-pack-manager-v1", "immutable-pack-revisions-v1", "indexeddb-candidate-activation-v1"],
      supportedPacks, installed: packs.map(pack => pack.id), installedPacks,
      enabledLanguageProfiles: settings.enabledLanguageProfiles,
      uiLanguage: ["ca", "es", "en", "fr"].includes(settings.uiLanguage) ? settings.uiLanguage : "ca"
    };
  }
  async function readBounded(response, spec, report) {
    if (!response.body?.getReader) {
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength !== spec.size) throw fail("INTEGRITY_ERROR", "La mida del paquet rebut no és correcta.");
      report(0.68);
      return bytes;
    }
    const reader = response.body.getReader(), chunks = [];
    let length = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > spec.size) { await reader.cancel(); throw fail("INTEGRITY_ERROR", "El paquet supera la mida autoritzada."); }
        chunks.push(value);
        report(Math.min(0.68, 0.68 * length / spec.size));
      }
    } finally { try { reader.releaseLock(); } catch (_) {} }
    if (length !== spec.size) throw fail("INTEGRITY_ERROR", "La mida del paquet rebut no és correcta.");
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return bytes;
  }
  async function downloadPack(spec, report) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120000);
    try {
      const url = new URL(spec.path, BASE);
      if (url.origin !== new URL(BASE).origin || !url.pathname.includes(`/packs/${spec.id}/${spec.version}/`)) throw fail("PACK_NOT_FOUND", "La ruta del paquet no està autoritzada.");
      let response;
      try { response = await fetch(url, { cache: "no-store", credentials: "omit", redirect: "error", signal: controller.signal }); }
      catch (error) { throw fail("NETWORK_ERROR", error?.name === "AbortError" ? "La descàrrega del paquet ha superat el temps d’espera." : "No s’ha pogut connectar amb el repositori d’idiomes."); }
      if (response.status === 404) throw fail("PACK_NOT_FOUND", "Aquest paquet encara no està publicat.");
      if (!response.ok) throw fail("NETWORK_ERROR", `No s’ha pogut obtenir el paquet (HTTP ${response.status}).`);
      const bytes = await readBounded(response, spec, report);
      if (await hash(bytes) !== spec.sha256) throw fail("INTEGRITY_ERROR", "El paquet rebut no coincideix amb la revisió autoritzada.");
      if (new TextDecoder().decode(bytes.subarray(0, 8)) !== "LLTRPK1\n" || bytes.byteLength < 12) throw fail("INTEGRITY_ERROR", "El format del paquet no és vàlid.");
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const headerLength = view.getUint32(8, true), bodyStart = 12 + headerLength;
      if (!headerLength || bodyStart > bytes.byteLength || headerLength > 1024 * 1024) throw fail("INTEGRITY_ERROR", "La capçalera del paquet no és vàlida.");
      let manifest;
      try { manifest = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(12, bodyStart))); }
      catch (_) { throw fail("INTEGRITY_ERROR", "La descripció interna del paquet no és vàlida."); }
      if (manifest.schema !== spec.schema || manifest.packId !== spec.id || manifest.version !== spec.version || manifest.engineApiVersion !== spec.engineApiVersion) throw fail("INCOMPATIBLE_ENGINE", "Aquest paquet no és compatible amb el motor d’aquesta extensió.");
      if (!Array.isArray(manifest.files) || manifest.files.length !== spec.files.length) throw fail("INTEGRITY_ERROR", "L’inventari del paquet no és vàlid.");
      const expected = new Set(spec.files), seen = new Set(), files = [];
      let priorEnd = 0;
      for (const [index, entry] of manifest.files.entries()) {
        if (!entry || typeof entry.path !== "string" || !expected.has(entry.path) || seen.has(entry.path) || !Number.isSafeInteger(entry.offset) || !Number.isSafeInteger(entry.length) || entry.offset !== priorEnd || entry.length < 1 || !/^[a-f0-9]{64}$/.test(entry.sha256 || "")) throw fail("INTEGRITY_ERROR", "L’inventari del paquet conté rutes o intervals invàlids.");
        const start = bodyStart + entry.offset, end = start + entry.length;
        if (!Number.isSafeInteger(end) || end > bytes.byteLength) throw fail("INTEGRITY_ERROR", "El contingut del paquet queda fora dels seus límits.");
        const part = bytes.slice(start, end);
        if (await hash(part) !== entry.sha256) throw fail("INTEGRITY_ERROR", "La verificació d’un recurs d’idioma ha fallat.");
        seen.add(entry.path); priorEnd += entry.length;
        files.push({ path: entry.path, bytes: part.buffer });
        report(0.68 + 0.24 * ((index + 1) / manifest.files.length));
      }
      if (seen.size !== expected.size || bodyStart + priorEnd !== bytes.byteLength) throw fail("INTEGRITY_ERROR", "El paquet omet recursos o conté dades no declarades.");
      return { manifest, files };
    } finally { clearTimeout(timer); }
  }
  async function bumpPackRevision() {
    const { installedLanguagePacksRevision = 0 } = await chrome.storage.local.get({ installedLanguagePacksRevision: 0 });
    await chrome.storage.local.set({ installedLanguagePacksRevision: Number(installedLanguagePacksRevision || 0) + 1 });
  }
  async function installOne(id, report) {
    const spec = PACKS.get(id);
    if (!spec || spec.channel !== "stable") throw fail("UNSUPPORTED_LANGUAGE", "Aquest idioma no està disponible en aquest canal.");
    const api = runtime();
    const previousPacks = await list();
    const previous = previousPacks.find(pack => pack.id === id);
    // An immutable revision must never overwrite itself while it is active.
    if (api.isPackCompatible(previous, spec)) {
      report(1);
      return { previousVersion: previous.version, changed: false };
    }
    if (previous?.version === spec.version) throw fail("INCOMPATIBLE_ENGINE", "La revisió desada és inconsistent. Elimina aquest idioma i torna’l a afegir.");
    const downloaded = await downloadPack(spec, report);
    try {
      await api.stagePack({ id, version: spec.version, schema: spec.schema, engineApiVersion: spec.engineApiVersion, resourceSetId: spec.resourceSetId, channel: spec.channel, size: spec.size, sha256: spec.sha256, files: spec.files }, downloaded.files);
      await api.activatePack(id, spec.version);
      report(1);
      return { previousVersion: previous?.version || null, changed: true };
    } catch (error) {
      try { await api.restoreActive(id, previous?.version || null); await bumpPackRevision(); } catch (_) {}
      try { await globalThis.LletriumRefreshEngineAfterLanguagePackChange?.(); } catch (_) {}
      try { await api.discardRevision(id, spec.version); } catch (_) {}
      throw error;
    }
  }
  async function removeOne(id, report) {
    const removed = await runtime().removePack(id);
    report(1);
    return { removed };
  }
  async function runMutation(message, report) {
    const modern = validateProtocol(message, false);
    const type = message?.type;
    const ids = validateIds(message?.ids, false, type === "REMOVE");
    const id = requestId(message);
    if (type !== "ADD" && type !== "REMOVE") throw fail("INVALID_REQUEST", "Acció no admesa.");
    if (modern && !id) throw fail("INVALID_REQUEST", "Falta l’identificador de l’operació.");
    if (type === "ADD") {
      const unsupported = ids.find(packId => !PACKS.get(packId)?.channel || PACKS.get(packId).channel !== "stable");
      if (unsupported) throw fail("UNSUPPORTED_LANGUAGE", "Aquest idioma no està disponible al canal estable.");
    }
    const signature = operationSignature(type, ids);
    if (id) {
      const current = inFlight.get(id);
      if (current) {
        if (current.signature !== signature) throw fail("REQUEST_ID_REUSED", "Aquest identificador ja s’ha utilitzat per a una altra operació.");
        return current.promise;
      }
    }
    const work = operationQueue.catch(() => {}).then(async () => {
      // Check persisted IDs inside the same queue that executes mutations.
      const previous = id ? await runtime().getOperation(id) : null;
      if (previous) {
        if (previous.signature !== signature) throw fail("REQUEST_ID_REUSED", "Aquest identificador ja s’ha utilitzat per a una altra operació.");
        if (previous.state === "complete") return previous.result;
        if (previous.state === "failed") throw fail(previous.errorCode || "OPERATION_FAILED", previous.error || "L’operació anterior ha fallat.");
        const interrupted = { ...previous, state: "failed", errorCode: "OPERATION_INTERRUPTED", error: "L’operació es va interrompre. Revisa els idiomes instal·lats i torna-ho a provar.", installed: (await list()).map(pack => pack.id), completedAt: Date.now() };
        await runtime().saveOperation(interrupted);
        throw fail(interrupted.errorCode, interrupted.error);
      }
      if (id) await runtime().saveOperation({ requestId: id, signature, type, ids, state: "running", startedAt: Date.now() });
      globalThis.LletriumPackMutationActive = true;
      const previousVersions = new Map();
      const previousSettings = await chrome.storage.sync.get({ language: "ca-ES" });
      let changed = false;
      try {
        for (const [index, packId] of ids.entries()) {
          const packProgress = percent => report(((index + percent) / ids.length) * 100);
          if (type === "ADD") { const state = await installOne(packId, packProgress); if (state.changed) previousVersions.set(packId, state.previousVersion); changed ||= state.changed; }
          else { const state = await removeOne(packId, packProgress); changed ||= state.removed; }
        }
        {
          const installedNow = (await list()).map(pack => pack.id);
          const settings = await chrome.storage.sync.get({ language: "ca-ES", enabledLanguageProfiles: {} });
          const lang = String(settings.language || "ca-ES");
          const selected = packIdForProfile(lang);
          if (!installedNow.includes(selected) && installedNow.length) {
            const fallback = [...PACKS.keys()].find(value => installedNow.includes(value));
            const preferred = settings.enabledLanguageProfiles[fallback]?.find(profile => PACKS.get(fallback)?.profiles?.includes(profile));
            const fallbackProfile = preferred || defaultProfileForPack(fallback);
            if (fallbackProfile) await chrome.storage.sync.set({ language: fallbackProfile });
          }
        }
        if (changed) await bumpPackRevision();
        const refresh = changed ? await globalThis.LletriumRefreshEngineAfterLanguagePackChange?.() || { ok: false, skipped: "refresh-unavailable", error: "El gestor del motor no respon." } : { ok: true, unchanged: true };
        if (type === "ADD" && refresh.ok !== true && !refresh.skipped) {
          throw fail("ENGINE_RELOAD_FAILED", refresh.error || "El motor no ha confirmat la càrrega dels idiomes.");
        }
        if (type === "ADD") for (const packId of ids) await runtime().pruneInactiveRevisions(packId, PACKS.get(packId).version).catch(() => {});
        const engineState = refresh.ok === true || refresh.unchanged ? "ready" : "deferred";
        const installed = (await list()).map(pack => pack.id);
        const result = { ok: true, installed, engineReady: engineState === "ready", engineState, message: engineState === "ready" ? "Els idiomes estan preparats." : "Els paquets s’han desat. El motor s’actualitzarà quan el perfil actiu estigui disponible." };
        if (id) await runtime().saveOperation({ requestId: id, signature, type, ids, state: "complete", result, completedAt: Date.now() });
        return result;
      } catch (error) {
        if (changed) {
          if (type === "ADD") {
            for (const [packId, version] of previousVersions) {
              await runtime().restoreActive(packId, version);
              if (version !== PACKS.get(packId).version) await runtime().discardRevision(packId, PACKS.get(packId).version);
            }
            await chrome.storage.sync.set({ language: previousSettings.language });
          }
          await bumpPackRevision();
          try { await globalThis.LletriumRefreshEngineAfterLanguagePackChange?.(); } catch (_) {}
        }
        if (error?.name === "QuotaExceededError" || error?.name === "UnknownError") { error.code = "STORAGE_ERROR"; error.message = "No hi ha prou espai disponible per desar els paquets d’idioma."; }
        error.installed = (await list().catch(() => [])).map(pack => pack.id);
        if (id) await runtime().saveOperation({ requestId: id, signature, type, ids, state: "failed", errorCode: error.code || "OPERATION_FAILED", error: String(error.message || error), installed: error.installed, completedAt: Date.now() }).catch(() => {});
        throw error;
      } finally { globalThis.LletriumPackMutationActive = false; }
    });
    operationQueue = work.catch(() => {});
    if (id) {
      inFlight.set(id, { signature, promise: work });
      work.finally(() => inFlight.delete(id)).catch(() => {});
    }
    return work;
  }
  async function handle(message, report = () => {}) {
    if (!message || typeof message !== "object" || Array.isArray(message)) throw fail("INVALID_REQUEST", "La petició no és vàlida.");
    if (message.type === "GET_MANAGER_INFO") return getManagerInfo(message);
    if (message.type === "GET_OPERATION_STATUS") {
      validateProtocol(message, true);
      const id = requestId(message);
      if (!id) throw fail("INVALID_REQUEST", "Falta l’identificador de l’operació.");
      const record = await runtime().getOperation(id);
      if (record?.type === "ADD" && Array.isArray(record.ids) && record.signature !== operationSignature(record.type, record.ids)) {
        return { ok: true, operation: { requestId: id, state: "failed", errorCode: "OPERATION_VERSION_CHANGED", error: "L’extensió s’ha actualitzat durant l’operació. Torna a obrir el gestor d’idiomes.", installed: (await list()).map(pack => pack.id) } };
      }
      return { ok: true, operation: record ? { requestId: id, state: record.state, result: record.result, errorCode: record.errorCode, error: record.error, installed: record.installed } : null };
    }
    if (message.type === "LIST") {
      const [packs, settings] = await Promise.all([list(), chrome.storage.sync.get({ uiLanguage: "ca", enabledLanguageProfiles: {} })]);
      return { ok: true, installed: packs.map(pack => pack.id), uiLanguage: ["ca", "es", "en", "fr"].includes(settings.uiLanguage) ? settings.uiLanguage : "ca" };
    }
    if (message.type === "SET_PROFILES") {
      validateProtocol(message, false);
      const requested = message.profiles;
      if (!requested || typeof requested !== "object" || Array.isArray(requested)) throw fail("INVALID_REQUEST", "Invalid language variants.");
      const clean = {};
      for (const [id, profiles] of Object.entries(requested)) {
        const spec = PACKS.get(id);
        if (!spec || !Array.isArray(spec.profiles) || !Array.isArray(profiles) || !profiles.length || profiles.length > spec.profiles.length || profiles.some(profile => !spec.profiles.includes(profile))) throw fail("INVALID_REQUEST", "Invalid language variants.");
        clean[id] = [...new Set(profiles)];
      }
      const work = operationQueue.catch(() => {}).then(async () => {
      const settings = await chrome.storage.sync.get({ enabledLanguageProfiles: {}, language: "ca-ES" });
      const enabledLanguageProfiles = { ...settings.enabledLanguageProfiles, ...clean };
      const selectedPack = packIdForProfile(settings.language);
      const patch = { enabledLanguageProfiles };
      if (clean[selectedPack] && !clean[selectedPack].includes(settings.language)) patch.language = clean[selectedPack][0];
      await chrome.storage.sync.set(patch);
      return { ok: true, enabledLanguageProfiles };
      });
      operationQueue = work.catch(() => {});
      return work;
    }
    if (message.type === "SET_UI_LANGUAGE") {
      validateProtocol(message, false);
      if (!["ca", "es", "en", "fr"].includes(message.language)) throw fail("INVALID_REQUEST", "L’idioma de la interfície no és vàlid.");
      await chrome.storage.sync.set({ uiLanguage: message.language });
      return { ok: true, uiLanguage: message.language };
    }
    if (message.type === "ADD" || message.type === "REMOVE") return runMutation(message, report);
    throw fail("INVALID_REQUEST", "Acció no admesa.");
  }
  async function handleOpenPopup(sender) {

    if (typeof chrome.action?.openPopup === "function") {
      const options = Number.isInteger(sender.tab?.windowId) ? { windowId: sender.tab.windowId } : undefined;
      try { await (options ? chrome.action.openPopup(options) : chrome.action.openPopup()); return; } catch (_) {}
    }
    throw new Error("Chrome no ha pogut obrir el popup en aquesta finestra.");
  }
  function sendError(sendResponse, error) {
    const response = { ok: false, code: error?.code || "OPERATION_FAILED", error: String(error?.message || error) };
    if (Array.isArray(error?.installed)) response.installed = error.installed;
    else list().then(packs => sendResponse({ ...response, installed: packs.map(pack => pack.id) })).catch(() => sendResponse(response));
    if (Array.isArray(error?.installed)) sendResponse(response);
  }

  function receiveManagerMessage(message, sender, sendResponse) {
    if (message?.type === "OPEN_POPUP") {
      handleOpenPopup(sender).then(() => sendResponse({ ok: true })).catch(error => sendResponse({ ok: false, code: "POPUP_OPEN_FAILED", error: String(error?.message || error) }));
      return true;
    }
    handle(message).then(sendResponse).catch(error => sendError(sendResponse, error));
    return true;
  }
  function receiveManagerPort(port) {
    port.onMessage.addListener(message => { if (message?.type === "PING") { try { port.postMessage({ type: "PONG" }); } catch (_) {} return; }
      if (message?.type === "SUBSCRIBE_UI_LANGUAGE") {
        uiLanguageManagerPorts.add(port);
        chrome.storage.sync.get({ uiLanguage: "ca", enabledLanguageProfiles: {} }).then(settings => {
          try { port.postMessage({ type: "UI_LANGUAGE_CHANGED", language: settings.uiLanguage }); } catch (_) {}
        }).catch(() => {});
        return;
      }
      handle(message, percent => { try { port.postMessage({ type: "PROGRESS", percent }); } catch (_) {} })
        .then(result => { try { port.postMessage({ type: "RESULT", result }); } catch (_) {} })
        .catch(error => { try { port.postMessage({ type: "ERROR", code: error.code || "OPERATION_FAILED", error: String(error?.message || error), installed: error.installed }); } catch (_) {} });
    });
    port.onDisconnect.addListener(() => uiLanguageManagerPorts.delete(port));
  }
  chrome.runtime.onMessageExternal.addListener((message, sender, reply) => {
    if (!validSender(sender)) { reply({ok:false,code:"UNAUTHORIZED_SENDER",error:"Origen no autoritzat."}); return false; }
    return receiveManagerMessage(message, sender, reply);
  });
  chrome.runtime.onConnectExternal.addListener(port => {
    if (port.name !== PORT_NAME || !validSender(port.sender)) { port.disconnect(); return; }
    receiveManagerPort(port);
  });
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync" || !changes.uiLanguage) return;
    const language = changes.uiLanguage.newValue;
    if (!["ca", "es", "en", "fr"].includes(language)) return;
    for (const port of uiLanguageManagerPorts) {
      try { port.postMessage({ type: "UI_LANGUAGE_CHANGED", language }); }
      catch (_) { uiLanguageManagerPorts.delete(port); }
    }
  });
})();

