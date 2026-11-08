(() => {
  "use strict";

  const DB_NAME = "lletrium-language-packs";
  const DB_VERSION = 2;
  const PORT_NAME = "lletrium-language-resource";
  const CHUNK_BYTES = 48 * 1024;
  const EXTERNAL_RESOURCES = new Set([
    ...(globalThis.LletriumPackDescriptors || []).flatMap(pack => pack.files || []),
    "build/resources/ca-multitoken-candidates.txt.gz",
    "build/resources/ca-speller-graph.bin.gz",
    "build/resources/ca-speller-multitoken-graph.bin.gz",
    "build/resources/ca-spelling-multitoken-words.txt.gz",
    "build/resources/ca-spelling-overlay-graph.bin.gz",
    "build/resources/ca-spelling-overlays.txt.gz",
    "build/resources/ca-spelling-words.txt.gz",
    "build/resources/central-cfsa2/ca-analysis.cfsa2.gz",
    "build/resources/central-cfsa2/ca-synthesis.cfsa2.gz",
    "build/resources/en-US/en-US-chunker.gis.gz",
    "build/resources/en-US/en-US-pos-cfsa2.bin.gz",
    "build/resources/en-US/en-US-pos-fsa.bin.gz",
    "build/resources/en-US/en-US-pos-model.gis.gz",
    "build/resources/en-US/en-US-spelling-cfsa2.bin.gz",
    "build/resources/en-US/en-US-synthesis-cfsa2.bin.gz",
    "build/resources/en-US/en-US-tokenizer.gis.gz",
    "build/resources/es-ES/es-ES-pos-fsa.bin.gz",
    "build/resources/es-ES/es-ES-synthesis-cfsa2.dict.gz",
    "build/resources/fr/french.dict.gz",
    "build/resources/fr/french.info",
    "build/resources/fr/french_synth.dict.gz",
    "build/resources/fr/french_synth.info",
    "build/resources/fr/french_tags.txt",
    "build/resources/fr/fr.sor",
    "build/resources/fr/spelling.txt.gz",
    "build/resources/fr/spelling_custom.txt.gz",
    "build/resources/fr/ignore.txt.gz",
    "build/resources/fr/prohibit.txt.gz",
    "build/resources/fr/multitoken_words.txt.gz"
  ]);

  function isPackCompatible(pack, spec = (globalThis.LletriumPackDescriptors || []).find(item => item.id === pack?.id)) {
    return !!spec && !!pack && pack.version === spec.version && pack.engineApiVersion === spec.engineApiVersion
      && (pack.schema === undefined || pack.schema === spec.schema)
      && (pack.sha256 === undefined || pack.sha256 === spec.sha256)
      && (pack.resourceSetId === undefined || pack.resourceSetId === spec.resourceSetId)
      && Array.isArray(pack.files) && pack.files.length === spec.files.length
      && new Set(pack.files).size === pack.files.length && spec.files.every(path => pack.files.includes(path));
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      let blocked = false;
      request.onupgradeneeded = event => {
        const db = request.result;
        const tx = request.transaction;
        if (!db.objectStoreNames.contains("resources")) db.createObjectStore("resources", { keyPath: "path" });
        if (!db.objectStoreNames.contains("packs")) db.createObjectStore("packs", { keyPath: "id" });
        if (!db.objectStoreNames.contains("resourceVersions")) {
          const resources = db.createObjectStore("resourceVersions", { keyPath: ["packId", "version", "path"] });
          resources.createIndex("byRevision", ["packId", "version"], { unique: false });
        }
        if (!db.objectStoreNames.contains("revisions")) db.createObjectStore("revisions", { keyPath: ["id", "version"] });
        if (!db.objectStoreNames.contains("active")) db.createObjectStore("active", { keyPath: "id" });
        if (!db.objectStoreNames.contains("operations")) db.createObjectStore("operations", { keyPath: "requestId" });
        if (event.oldVersion < 2 && db.objectStoreNames.contains("packs")) {
          const cursor = tx.objectStore("packs").openCursor();
          cursor.onsuccess = event => {
            const item = event.target.result;
            if (!item) return;
            const pack = item.value;
            const version = String(pack.version || "1.0.0");
            const revision = { ...pack, version, state: "active", migratedFromLegacy: true };
            item.update(revision);
            tx.objectStore("revisions").put(revision);
            tx.objectStore("active").put({ id: pack.id, version, generation: 1 });
            item.continue();
          };
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        if (blocked) db.close(); else resolve(db);
      };
      request.onerror = () => reject(request.error || new Error("No s’ha pogut obrir l’emmagatzematge dels idiomes."));
      request.onblocked = () => { blocked = true; reject(new Error("Tanca les altres pàgines de Lletrium! i torna-ho a provar.")); };
    });
  }

  function requestResult(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Error llegint les dades d’idioma."));
    });
  }

  async function readResource(path) {
    if (!EXTERNAL_RESOURCES.has(path)) return null;
    const db = await openDatabase();
    try {
      const packs = await requestResult(db.transaction("packs", "readonly").objectStore("packs").getAll());
      const pack = packs.find(item => Array.isArray(item.files) && item.files.includes(path));
      let record = null;
      if (pack && !isPackCompatible(pack)) throw Object.assign(new Error("Aquest paquet no és compatible amb aquesta versió de Lletrium!. Torna a afegir aquest idioma."), { code: "INCOMPATIBLE_ENGINE" });
      if (pack) {
        const active = await requestResult(db.transaction("active", "readonly").objectStore("active").get(pack.id));
        if (active?.version === pack.version) record = await requestResult(db.transaction("resourceVersions", "readonly").objectStore("resourceVersions").get([pack.id, active.version, path]));
      }
      if (!record && pack?.migratedFromLegacy) record = await requestResult(db.transaction("resources", "readonly").objectStore("resources").get(path));
      if (!record?.bytes) return null;
      return record.bytes instanceof ArrayBuffer ? record.bytes : record.bytes.buffer.slice(record.bytes.byteOffset, record.bytes.byteOffset + record.bytes.byteLength);
    } finally { db.close(); }
  }

  async function listPacks() {
    const db = await openDatabase();
    try { return await requestResult(db.transaction("packs", "readonly").objectStore("packs").getAll()); }
    finally { db.close(); }
  }

  async function getOperation(requestId) {
    const db = await openDatabase();
    try { return await requestResult(db.transaction("operations", "readonly").objectStore("operations").get(requestId)) || null; }
    finally { db.close(); }
  }

  async function saveOperation(operation) {
    const db = await openDatabase();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction("operations", "readwrite");
        const store = tx.objectStore("operations");
        store.put(operation);
        const request = store.getAll();
        request.onsuccess = () => {
          const completed = request.result.filter(item => item.state === "complete" || item.state === "failed")
            .sort((a, b) => Number(b.completedAt || b.startedAt || 0) - Number(a.completedAt || a.startedAt || 0));
          for (const stale of completed.slice(50)) store.delete(stale.requestId);
        };
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error("No s’ha pogut registrar l’operació."));
        tx.onabort = () => reject(tx.error || new Error("S’ha cancel·lat el registre de l’operació."));
      });
    } finally { db.close(); }
  }

  async function storePack(pack, files) {
    const version = String(pack.version || "1.0.0");
    await stagePack({ ...pack, version }, files);
    await activatePack(pack.id, version);
  }

  async function stagePack(pack, files) {
    const db = await openDatabase();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(["resourceVersions", "revisions"], "readwrite");
        const resources = tx.objectStore("resourceVersions");
        for (const file of files) resources.put({ packId: pack.id, version: pack.version, path: file.path, bytes: file.bytes });
        tx.objectStore("revisions").put({ ...pack, state: "candidate", stagedAt: Date.now() });
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error("No s’ha pogut preparar la revisió candidata de l’idioma."));
        tx.onabort = () => reject(tx.error || new Error("S’ha cancel·lat la preparació de la revisió de l’idioma."));
      });
    } finally { db.close(); }
  }

  async function activatePack(id, version) {
    const db = await openDatabase();
    try {
      const revision = await requestResult(db.transaction("revisions", "readonly").objectStore("revisions").get([id, version]));
      if (!revision) throw new Error("La revisió candidata no existeix.");
      const previous = await requestResult(db.transaction("active", "readonly").objectStore("active").get(id));
      const generation = Number(previous?.generation || 0) + 1;
      await new Promise((resolve, reject) => {
        const tx = db.transaction(["active", "packs", "revisions"], "readwrite");
        tx.objectStore("active").put({ id, version, generation, activatedAt: Date.now() });
        tx.objectStore("packs").put({ ...revision, state: "active", generation, installedAt: Date.now() });
        tx.objectStore("revisions").put({ ...revision, state: "active", activatedAt: Date.now() });
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error("No s’ha pogut activar l’idioma."));
        tx.onabort = () => reject(tx.error || new Error("S’ha cancel·lat l’activació de l’idioma."));
      });
      return { previous: previous?.version || null, generation };
    } finally { db.close(); }
  }

  async function restoreActive(id, version) {
    const db = await openDatabase();
    try {
      const prior = version ? await requestResult(db.transaction("revisions", "readonly").objectStore("revisions").get([id, version])) : null;
      await new Promise((resolve, reject) => {
        const tx = db.transaction(["active", "packs"], "readwrite");
        if (prior) {
          const current = tx.objectStore("active").get(id);
          current.onsuccess = () => {
            const generation = Number(current.result?.generation || 0) + 1;
            tx.objectStore("active").put({ id, version, generation, activatedAt: Date.now() });
            tx.objectStore("packs").put({ ...prior, state: "active", generation, installedAt: Date.now() });
          };
        } else {
          tx.objectStore("active").delete(id);
          tx.objectStore("packs").delete(id);
        }
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error("No s’ha pogut recuperar la revisió anterior."));
        tx.onabort = () => reject(tx.error || new Error("S’ha cancel·lat la recuperació de l’idioma."));
      });
    } finally { db.close(); }
  }

  async function discardRevision(id, version) {
    const db = await openDatabase();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(["resourceVersions", "revisions"], "readwrite");
        const range = IDBKeyRange.only([id, version]);
        const cursor = tx.objectStore("resourceVersions").index("byRevision").openCursor(range);
        cursor.onsuccess = event => { const item = event.target.result; if (item) { item.delete(); item.continue(); } };
        tx.objectStore("revisions").delete([id, version]);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error("No s’ha pogut netejar la revisió temporal."));
        tx.onabort = () => reject(tx.error || new Error("S’ha cancel·lat la neteja de la revisió temporal."));
      });
    } finally { db.close(); }
  }

  async function pruneInactiveRevisions(id, keepVersion) {
    const db = await openDatabase();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(["resourceVersions", "revisions"], "readwrite");
        const revisions = tx.objectStore("revisions");
        const cursor = revisions.openCursor();
        cursor.onsuccess = event => {
          const item = event.target.result;
          if (!item) return;
          const version = String(item.value.version || "");
          if (item.value.id === id && version !== keepVersion && item.value.state !== "candidate") {
            const resources = tx.objectStore("resourceVersions").index("byRevision").openCursor(IDBKeyRange.only([id, version]));
            resources.onsuccess = resourceEvent => { const resource = resourceEvent.target.result; if (resource) { resource.delete(); resource.continue(); } };
            item.delete();
          }
          item.continue();
        };
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error("No s’han pogut netejar revisions antigues."));
        tx.onabort = () => reject(tx.error || new Error("S’ha cancel·lat la neteja de revisions antigues."));
      });
    } finally { db.close(); }
  }

  async function removePack(id) {
    const db = await openDatabase();
    try {
      const pack = await requestResult(db.transaction("packs", "readonly").objectStore("packs").get(id));
      if (!pack) return false;
      await new Promise((resolve, reject) => {
        const tx = db.transaction(["resources", "packs", "active", "resourceVersions", "revisions"], "readwrite");
        const resources = tx.objectStore("resources");
        for (const path of Array.isArray(pack.files) ? pack.files : []) resources.delete(path);
        tx.objectStore("packs").delete(id);
        tx.objectStore("active").delete(id);
        const cursor = tx.objectStore("revisions").openCursor();
        cursor.onsuccess = event => {
          const item = event.target.result;
          if (!item) return;
          if (item.value.id === id) {
            const version = item.value.version;
            const resourcesCursor = tx.objectStore("resourceVersions").index("byRevision").openCursor(IDBKeyRange.only([id, version]));
            resourcesCursor.onsuccess = resourceEvent => { const resource = resourceEvent.target.result; if (resource) { resource.delete(); resource.continue(); } };
            item.delete();
          }
          item.continue();
        };
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error("No s’han pogut eliminar les dades de l’idioma."));
        tx.onabort = () => reject(tx.error || new Error("S’ha cancel·lat l’eliminació de l’idioma."));
      });
      return true;
    } finally { db.close(); }
  }

  function pathForRequest(input) {
    try {
      const root = new URL(chrome.runtime.getURL("/"));
      const url = new URL(input instanceof Request ? input.url : String(input), root);
      if (url.protocol !== root.protocol || url.host !== root.host) return "";
      const path = decodeURIComponent(url.pathname.replace(/^\//, ""));
      return EXTERNAL_RESOURCES.has(path) ? path : "";
    } catch (_) { return ""; }
  }

  function bytesToBase64(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + 0x8000, bytes.length)));
    return btoa(binary);
  }

  function readFromBackground(path) {
    return new Promise((resolve, reject) => {
      let port;
      try { port = chrome.runtime.connect({ name: PORT_NAME }); }
      catch (error) { reject(error); return; }
      const chunks = [];
      let expected = 0;
      let received = 0;
      let settled = false;
      let timer = setTimeout(() => finish(new Error("Temps d’espera llegint les dades d’idioma.")), 90000);
      const finish = (error, bytes) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        try { port.disconnect(); } catch (_) {}
        if (error) reject(error); else resolve(bytes);
      };
      port.onMessage.addListener(message => {
        if (message?.type === "error") { finish(new Error(message.error || "Paquet d’idioma no instal·lat.")); return; }
        if (message?.type === "start") { expected = Number(message.chunks || 0); if (!Number.isInteger(expected) || expected < 1 || expected > 4096) finish(new Error("La transferència declara una mida invàlida.")); return; }
        if (message?.type === "chunk") {
          try {
            if (settled) return;
            if (message.index !== received || received >= expected) throw new Error("La transferència conté fragments duplicats o fora d’ordre.");
            const raw = atob(message.data || "");
            if (!raw.length || raw.length > CHUNK_BYTES) throw new Error("La mida del fragment no és vàlida.");
            const bytes = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
            chunks[Number(message.index)] = bytes;
            received += 1;
            clearTimeout(timer);
            timer = setTimeout(() => finish(new Error("Temps d’espera llegint les dades d’idioma.")), 90000);
          } catch (error) { finish(error); }
          return;
        }
        if (message?.type === "end") {
          if (received !== expected) { finish(new Error("La transferència de dades d’idioma ha quedat incompleta.")); return; }
          const length = chunks.reduce((sum, part) => sum + (part?.length || 0), 0);
          const bytes = new Uint8Array(length);
          let offset = 0;
          for (const part of chunks) { bytes.set(part, offset); offset += part.length; }
          finish(null, bytes.buffer);
        }
      });
      port.onDisconnect.addListener(() => {
        const error = chrome.runtime.lastError;
        if (received !== expected || !expected) finish(new Error(error?.message || "S’ha interromput la lectura del paquet."));
      });
      port.postMessage({ type: "read", path });
    });
  }

  if (typeof globalThis.fetch === "function" && !globalThis.fetch.__lletriumLanguagePackFetch) {
    const originalFetch = globalThis.fetch.bind(globalThis);
    const wrappedFetch = async (input, init) => {
      const path = pathForRequest(input);
      if (path) {
        try {
          const current = new URL(location.href), own = new URL(chrome.runtime.getURL("/"));
          const inExtensionOrigin = current.protocol === own.protocol && current.host === own.host;
          const bytes = inExtensionOrigin ? await readResource(path) : await readFromBackground(path);
          if (bytes) return new Response(bytes, { status: 200, headers: { "content-type": "application/octet-stream", "x-lletrium-language-resource": "installed" } });
          throw Object.assign(new Error("Aquest idioma no està instal·lat. Obre Lletrium! i afegeix-lo."), { code: "LANGUAGE_PACK_MISSING" });
        } catch (error) {
          console.warn("[Lletrium] No s’ha pogut llegir el paquet d’idioma desat", path, error);
          throw error;
        }
      }
      return originalFetch(input, init);
    };
    wrappedFetch.__lletriumLanguagePackFetch = true;
    globalThis.fetch = wrappedFetch;
  }

  if (globalThis.chrome?.runtime?.onConnect && !globalThis.__lletriumLanguagePackPortListener) {
    globalThis.__lletriumLanguagePackPortListener = true;
    chrome.runtime.onConnect.addListener(port => {
      if (port.name !== PORT_NAME) return;
      port.onMessage.addListener(async message => {
        if (message?.type !== "read" || !EXTERNAL_RESOURCES.has(message.path)) {
          port.postMessage({ type: "error", error: "Recurs d’idioma no vàlid." });
          return;
        }
        try {
          const buffer = await readResource(message.path);
          if (!buffer) throw new Error("Aquest idioma no està instal·lat. Obre Lletrium! i descarrega’l.");
          const bytes = new Uint8Array(buffer);
          const count = Math.ceil(bytes.length / CHUNK_BYTES);
          port.postMessage({ type: "start", chunks: count });
          for (let i = 0; i < count; i++) {
            const chunk = bytes.subarray(i * CHUNK_BYTES, Math.min((i + 1) * CHUNK_BYTES, bytes.length));
            port.postMessage({ type: "chunk", index: i, data: bytesToBase64(chunk) });
          }
          port.postMessage({ type: "end" });
        } catch (error) { port.postMessage({ type: "error", error: String(error?.message || error) }); }
      });
    });
  }

  globalThis.LletriumLanguagePacks = Object.freeze({ DB_NAME, DB_VERSION, EXTERNAL_RESOURCES, isPackCompatible, openDatabase, listPacks, getOperation, saveOperation, storePack, stagePack, activatePack, restoreActive, discardRevision, pruneInactiveRevisions, removePack, readResource });
})();
