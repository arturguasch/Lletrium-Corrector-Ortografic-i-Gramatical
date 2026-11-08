/* Experimental drop-in Catalan synthesizer over the CFSA2 source dictionary. */
(() => {
  "use strict";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let dictionary, tags = [], overlayByKey = new Map(), manifest, promise;
  const tagCache = new Map();
  const lookupCache = new Map();

  async function readVerifiedGzip(base, descriptor, fetcher, rawHashField) {
    const response = await fetcher(new URL(descriptor.file, base));
    if (!response.ok) throw new Error(`No s'ha pogut carregar el recurs CFSA2 ${descriptor.id} (${response.status}).`);
    const compressed = new Uint8Array(await response.arrayBuffer());
    const compressedHash = await crypto.subtle.digest("SHA-256", compressed);
    const compressedSha256 = Array.from(new Uint8Array(compressedHash), byte => byte.toString(16).padStart(2, "0")).join("");
    if (compressed.byteLength !== descriptor.compressedBytes || compressedSha256 !== descriptor.compressedSha256) throw new Error(`El recurs CFSA2 ${descriptor.id} comprimit no coincideix amb el manifest.`);
    const raw = new Uint8Array(await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());
    const expectedBytes = descriptor.sourceBytes ?? descriptor.rawBytes;
    if (raw.byteLength !== expectedBytes) throw new Error(`El recurs CFSA2 ${descriptor.id} descomprimit no coincideix amb la mida declarada.`);
    const rawHash = await crypto.subtle.digest("SHA-256", raw);
    const actualRawHash = Array.from(new Uint8Array(rawHash), byte => byte.toString(16).padStart(2, "0")).join("");
    if (actualRawHash !== descriptor[rawHashField]) throw new Error(`El hash del recurs CFSA2 ${descriptor.id} no coincideix amb el manifest.`);
    return raw;
  }

  async function load({ baseUrl, fetcher = globalThis.fetch } = {}) {
    if (!promise) promise = (async () => {
      const base = baseUrl || globalThis.chrome?.runtime?.getURL("build/resources/central-cfsa2/");
      if (!base) throw new Error("Cal indicar baseUrl per carregar els recursos fora de l'extensió.");
      if (typeof DecompressionStream !== "function" || !globalThis.crypto?.subtle) throw new Error("Aquest runtime no admet la verificació i descompressió dels recursos CFSA2.");
      const response = await fetcher(new URL("resource-index.json", base));
      if (!response.ok) throw new Error(`No s'ha pogut carregar el manifest CFSA2 (${response.status}).`);
      const nextManifest = await response.json();
      if (nextManifest?.schema !== 1 || nextManifest?.language !== "ca-ES" || !nextManifest.dictionaries?.synthesis) throw new Error("Manifest CFSA2 de síntesi invàlid.");
      const descriptor = nextManifest.dictionaries.synthesis;
      const overlayDescriptor = nextManifest.resources?.find(resource => resource.id === "synthesis-overlays");
      if (!overlayDescriptor || !Array.isArray(overlayDescriptor.possibleTags)) throw new Error("Falten els overlays o les etiquetes de síntesi CFSA2.");
      const [raw, overlayRaw] = await Promise.all([
        readVerifiedGzip(base, descriptor, fetcher, "sourceSha256"),
        readVerifiedGzip(base, overlayDescriptor, fetcher, "rawSha256"),
      ]);
      const nextDictionary = new globalThis.CorrectorCatalanCfsa2Dictionary(raw, {
        separator: descriptor.separator,
        encoding: descriptor.encoding,
        encoderType: descriptor.encoder,
      });
      const overlayObject = JSON.parse(decoder.decode(overlayRaw));
      if (overlayObject?.schema !== 1 || !Array.isArray(overlayObject.rows)) throw new Error("Fitxer d'overlays de síntesi invàlid.");
      const nextOverlayByKey = new Map();
      for (const row of overlayObject.rows) {
        if (!row || !["add", "remove"].includes(row.action) || typeof row.key !== "string" || typeof row.form !== "string") throw new Error("Fila d'overlay de síntesi invàlida.");
        let rows = nextOverlayByKey.get(row.key);
        if (!rows) nextOverlayByKey.set(row.key, rows = []);
        rows.push(row);
      }
      dictionary = nextDictionary;
      overlayByKey = nextOverlayByKey;
      tags = overlayDescriptor.possibleTags.slice();
      manifest = nextManifest;
      return { keys: descriptor.counts?.keys ?? null, rows: descriptor.counts?.rows ?? null };
    })();
    return promise;
  }

  function lookup(lemma, tag) {
    const key = `${lemma}|${tag}`;
    if (lookupCache.has(key)) return lookupCache.get(key);
    if (!dictionary) throw new Error("El diccionari de síntesi CFSA2 encara no s'ha carregat.");
    const result = dictionary.lookup(key).map(row => row.lemma);
    for (const row of overlayByKey.get(key) || []) {
      if (row.action === "add") result.push(row.form);
      else {
        for (let index = result.length - 1; index >= 0; index--) if (result[index] === row.form) result.splice(index, 1);
      }
    }
    lookupCache.set(key, result);
    if (lookupCache.size > 10000) lookupCache.clear();
    return result;
  }

  function selectedTags(expression) {
    if (!tagCache.has(expression)) {
      const regexp = CorrectorJavaCaseRegex.compile(expression, true);
      tagCache.set(expression, tags.filter(tag => regexp.test(tag)));
    }
    return tagCache.get(expression);
  }

  const CENTRAL_VERB_ENDINGS = "[0CXY12]";
  const INCLUSIVE_VERB_ENDINGS = "[0CXY12VXZ13567BYZ1247]";
  const VERB_ENDINGS_BY_PROFILE = { central: CENTRAL_VERB_ENDINGS, valencian: "[0VXZ13567]", balearic: "[0BYZ1247]", inclusive: INCLUSIVE_VERB_ENDINGS };

  function synthesize(reading, expression, regexp = false, localeProfile = "inclusive") {
    if (!reading?.lemma || !expression || expression.startsWith("_spell_number_")) return [];
    if (regexp && ["enterar", "sentar", "conseguir", "alcançar"].includes(reading.lemma)) return [];
    let lemma = reading.lemma, after = "";
    if (expression.startsWith("V") && lemma.includes(" ")) {
      const index = lemma.indexOf(" ");
      after = lemma.slice(index + 1);
      lemma = lemma.slice(0, index);
    }
    let result = selectedTags(expression).flatMap(tag => lookup(lemma, tag));
    if (!result.length && expression.startsWith("V") && (!regexp || /^V.*[CVBXYZ0123456]$/u.test(expression))
        && !["enterar", "sentar", "conseguir", "alcançar"].includes(reading.lemma)) {
      result = selectedTags(expression.slice(0, -1) + (VERB_ENDINGS_BY_PROFILE[localeProfile] || CENTRAL_VERB_ENDINGS)).flatMap(tag => lookup(lemma, tag));
    }
    return after ? result.map(value => `${value} ${after}`) : result;
  }

  function targetPosTag(values, fallback = "") {
    const compare = (a, b) => {
      if (a.length > 4 && b.length > 4) {
        if (a.includes("3S") && b === "1S") return 150;
        if (a.includes("1S") && b.includes("3S")) return -150;
        if (a === "VMIP2P00" && b === "VMIS3S00") return 150;
        if (b === "VMIP2P00" && a === "VMIS3S00") return -150;
        if (a[2] === "I" && b[2] !== "I") return 100;
        if (b[2] === "I" && a[2] !== "I") return -100;
        if (a[4] === "3" && b[4] === "1") return 50;
        if (b[4] === "3" && a[4] === "1") return -50;
      }
      return 0;
    };
    return values.slice().sort(compare).at(-1) ?? fallback;
  }

  globalThis.CorrectorCatalanSynthesisCfsa2 = Object.freeze({ load, lookup, synthesize, targetPosTag, getPossibleTags: () => tags });
})();
