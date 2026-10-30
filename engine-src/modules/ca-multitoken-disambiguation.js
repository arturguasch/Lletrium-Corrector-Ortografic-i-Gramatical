/* Exact local port of LanguageTool's Catalan multitoken name disambiguator. */
(() => {
  "use strict";

  const WINDOW_FORWARD = 10;
  const WINDOW_BACKWARD = 6;
  const DICTIONARY_FIXES = new Set(["Santa María", "San Agustin"]);
  const RESOURCE_PATH = "build/resources/ca-spelling-multitoken-words.txt.gz";
  const EXPECTED_SOURCE_SHA256 = "d7e08edd6ee93024c9719194bef8abf69413f7db11519ed6547f1868c62ef6d6";
  const EXPECTED_WORD_COUNT = 857576;
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const encoder = new TextEncoder();
  let dictionaryBytes = null;
  let lineOffsets = null;
  let loadPromise = null;
  let suggestionBuckets = null;

  function isUppercaseFirst(text) {
    return /^\p{Lu}/u.test(text);
  }

  function isAllUppercase(text) {
    for (let index = 0; index < text.length; index++) {
      const char = text[index];
      if (/\p{L}/u.test(char) && char === char.toLocaleLowerCase("ca")) return false;
    }
    return true;
  }

  function isMixedCase(text) {
    if (isAllUppercase(text)) return false;
    const first = text[0] || "";
    if (/\p{Lu}/u.test(first)) {
      let capitalizedWord = true;
      for (let index = 1; index < text.length; index++) {
        const char = text[index];
        if (/\p{L}/u.test(char) && char !== char.toLocaleLowerCase("ca")) {
          capitalizedWord = false;
          break;
        }
      }
      if (capitalizedWord) return false;
    }
    for (let index = 0; index < text.length; index++) {
      const char = text[index];
      if (/\p{L}/u.test(char) && char !== char.toLocaleLowerCase("ca")) return true;
    }
    return false;
  }

  function compareLine(lineIndex, target) {
    const start = lineOffsets[lineIndex];
    let end = start;
    while (end < dictionaryBytes.length && dictionaryBytes[end] !== 10) end++;
    let index = 0;
    while (index < target.length && start + index < end) {
      const a = dictionaryBytes[start + index];
      const b = target[index];
      if (a !== b) return a < b ? -1 : 1;
      index++;
    }
    if (index === target.length && start + index === end) return 0;
    return index === target.length ? 1 : -1;
  }

  function inDictionary(text) {
    if (!dictionaryBytes || !lineOffsets || !text) return false;
    const target = encoder.encode(text);
    let low = 0;
    let high = lineOffsets.length - 1;
    while (low <= high) {
      const middle = (low + high) >>> 1;
      const comparison = compareLine(middle, target);
      if (comparison === 0) return true;
      if (comparison < 0) low = middle + 1;
      else high = middle - 1;
    }
    return false;
  }

  // Morfologik's spelling FSA uses exact UTF-8 lookup and its declared
  // convert-case fallbacks. Suggestions use edit distance; isMisspelled()
  // itself only checks these exact forms.
  function isMisspelled(text) {
    if (!text || text === "LanguageTool" || text === "LanguageTooler") return false;
    const first = [...text][0] || "";
    const hasAlphabeticFirst = /\p{L}/u.test(first);
    if (text.length === 1 && !hasAlphabeticFirst) return true;
    if (text.length > 0 && !hasAlphabeticFirst) return true;
    if (inDictionary(text)) return false;
    if (isMixedCase(text)) return true;
    const lower = text.toLocaleLowerCase("ca");
    if (inDictionary(lower)) return false;
    if (isAllUppercase(text)) {
      const [firstChar, ...tail] = [...lower];
      const initialUpper = firstChar.toLocaleUpperCase("ca") + tail.join("");
      if (inDictionary(initialUpper)) return false;
    }
    return true;
  }

  function getToAndForIndexes(tokens, startIndex) {
    let fromIndex = startIndex;
    while (fromIndex > 1 && (isUppercaseFirst(tokens[fromIndex - 1].text)
        || tokens[fromIndex - 1].kind === "space" || tokens[fromIndex - 1].text.length < 3)) {
      fromIndex--;
    }
    while (!isUppercaseFirst(tokens[fromIndex].text) && fromIndex < startIndex) fromIndex++;

    let toIndex = startIndex;
    while (toIndex < tokens.length - 1 && (isUppercaseFirst(tokens[toIndex + 1].text)
        || tokens[toIndex + 1].kind === "space" || tokens[toIndex + 1].text.length < 3)) {
      toIndex++;
    }
    while (!isUppercaseFirst(tokens[toIndex].text) && toIndex > startIndex) toIndex--;
    return [fromIndex, toIndex];
  }

  function isWhitespace(token) {
    return token.kind === "space" || /^\s+$/u.test(token.text);
  }

  function searchInDictionary(tokens, from, to, shrinkFrom) {
    let currentFrom = from;
    let currentTo = to;
    while (currentTo > currentFrom) {
      const textToCheck = tokens.slice(currentFrom, currentTo + 1).map(token => token.text).join("");
      if (DICTIONARY_FIXES.has(textToCheck)) return false;
      if (!textToCheck.endsWith(" ") && !textToCheck.startsWith(" ") && textToCheck && !isMisspelled(textToCheck)) {
        for (let index = currentFrom; index <= currentTo; index++) {
          const token = tokens[index];
          if (isWhitespace(token)) continue;
          const reading = { token: token.text, lemma: textToCheck, tag: "NPCNM00", source: "HybridDisamb" };
          if (!token.contextualReadings.some(existing => existing.lemma === reading.lemma && existing.tag === reading.tag)) {
            globalThis.CorrectorCatalanAnalysis.addReading(token, reading, "catalan-multitoken-disambiguator");
          }
        }
        return true;
      }
      if (shrinkFrom === "end") currentTo--;
      else if (shrinkFrom === "start") currentFrom++;
      else return false;
    }
    return false;
  }

  function disambiguate(tokens) {
    if (!Array.isArray(tokens)) throw new TypeError("Els tokens han de ser una llista.");
    if (!dictionaryBytes || !lineOffsets) throw new Error("El FSA multitoken no está cargado.");
    // LT includes SENT_START at index 0 and keeps whitespace tokens in this stage.
    const withSentenceStart = [{ text: "", kind: "sentence-start", contextualReadings: [], readings: [] }, ...tokens];
    for (let index = 1; index < withSentenceStart.length; index++) {
      const token = withSentenceStart[index];
      if (isWhitespace(token) || token.contextualReadings.some(reading => reading.tag != null && !["SENT_END", "PARAGRAPH_END"].includes(reading.tag)) || token.ignoredBySpeller) continue;

      const [from, to] = getToAndForIndexes(withSentenceStart, index);
      let found = searchInDictionary(withSentenceStart, from, to, "none");
      if (!found && isUppercaseFirst(token.text)) {
        found = searchInDictionary(withSentenceStart, index,
          Math.min(index + WINDOW_FORWARD, withSentenceStart.length - 1), "end");
      }
      if (!found) {
        searchInDictionary(withSentenceStart, Math.max(1, index - WINDOW_BACKWARD), index, "start");
      }
    }
    return tokens;
  }

  async function load({ url, fetcher = globalThis.fetch } = {}) {
    if (dictionaryBytes && lineOffsets) return { wordCount: lineOffsets.length, bytes: dictionaryBytes.byteLength };
    if (!loadPromise) {
      loadPromise = (async () => {
        const resourceUrl = url || globalThis.chrome?.runtime?.getURL(RESOURCE_PATH);
        if (!resourceUrl) throw new Error("Cal indicar URL del diccionari multitoken fora de l'extensió.");
        const response = await fetcher(resourceUrl);
        if (!response.ok) throw new Error(`No s'ha pogut carregar el FSA multitoken (${response.status}).`);
        if (typeof DecompressionStream !== "function") throw new Error("Aquest runtime no pot descomprimir el FSA multitoken.");
        if (!globalThis.crypto?.subtle) throw new Error("WebCrypto no està disponible per verificar el FSA multitoken.");
        const raw = new Uint8Array(await new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());
        const digest = await globalThis.crypto.subtle.digest("SHA-256", raw);
        const actual = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
        if (actual !== EXPECTED_SOURCE_SHA256) throw new Error("El lexicón multitoken no coincide con el FSA Softcatalà 3.3.");
        const offsets = [];
        let start = 0;
        for (let index = 0; index < raw.length; index++) {
          if (raw[index] === 10) {
            if (index > start) offsets.push(start);
            start = index + 1;
          }
        }
        if (start < raw.length) offsets.push(start);
        if (offsets.length !== EXPECTED_WORD_COUNT) throw new Error("Recuento inesperado de formas del diccionario multitoken.");
        for (let index = 1; index < offsets.length; index++) {
          if (compareRawLines(raw, offsets[index - 1], offsets[index]) >= 0) {
            throw new Error("El índice FSA multitoken no está ordenado o contiene duplicados.");
          }
        }
        dictionaryBytes = raw;
        lineOffsets = Int32Array.from(offsets);
        return { wordCount: lineOffsets.length, bytes: raw.byteLength };
      })().catch(error => {
        loadPromise = null;
        throw error;
      });
    }
    return loadPromise;
  }

  function compareRawLines(bytes, firstStart, secondStart) {
    let firstEnd = firstStart;
    let secondEnd = secondStart;
    while (firstEnd < bytes.length && bytes[firstEnd] !== 10) firstEnd++;
    while (secondEnd < bytes.length && bytes[secondEnd] !== 10) secondEnd++;
    let offset = 0;
    while (firstStart + offset < firstEnd && secondStart + offset < secondEnd) {
      const difference = bytes[firstStart + offset] - bytes[secondStart + offset];
      if (difference) return difference;
      offset++;
    }
    return (firstEnd - firstStart) - (secondEnd - secondStart);
  }

  function clear() {
    dictionaryBytes = null;
    lineOffsets = null;
    loadPromise = null;
    suggestionBuckets = null;
  }

  function getSuggestionCandidates(first, minLength, maxLength) {
    if (!dictionaryBytes || !lineOffsets) throw new Error("El FSA multitoken no está cargat.");
    if (!suggestionBuckets) {
      const buckets = new Map();
      for (let index = 0; index < lineOffsets.length; index++) {
        const start = lineOffsets[index];
        let end = start;
        while (end < dictionaryBytes.length && dictionaryBytes[end] !== 10) end++;
        const form = decoder.decode(dictionaryBytes.subarray(start, end));
        const key = form.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("ca").replace(/-/gu, " ");
        const bucketKey = `${key[0]}\u0000${key.length}`;
        let values = buckets.get(bucketKey);
        if (!values) buckets.set(bucketKey, values = []);
        values.push(index);
      }
      suggestionBuckets = buckets;
    }
    const values = [];
    for (let length = minLength; length <= maxLength; length++) {
      for (const index of suggestionBuckets.get(`${first}\u0000${length}`) || []) {
        const start = lineOffsets[index];
        let end = start;
        while (end < dictionaryBytes.length && dictionaryBytes[end] !== 10) end++;
        values.push(decoder.decode(dictionaryBytes.subarray(start, end)));
      }
    }
    return values;
  }

  globalThis.CorrectorCatalanMultitokenDisambiguator = Object.freeze({ load, disambiguate, clear, getSuggestionCandidates });
})();
