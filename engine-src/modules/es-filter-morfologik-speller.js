/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Spanish Morfologik 2.2 suggestion source used by LanguageTool FindSuggestionsFilter.
 * The FSA/HMatrix search follows the upstream Oflazer implementation in
 * analysis/reference-oracle/src/Speller.java. This profile loads only its own
 * es-ES graph and metadata. */
(() => {
  "use strict";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const encoder = new TextEncoder();
  let graph = null, metadata = null, loadPromise = null;
  const characterCache = new Map(), frequencyCache = new Map(), suggestionCache = new Map();
  const one = new Map(), two = new Map(), rest = new Map();

  async function load({ baseUrl, fetcher = globalThis.fetch } = {}) {
    if (!loadPromise) loadPromise = (async () => {
      if (!baseUrl) throw new Error("Falta la URL del grafo Morfologik español.");
      const [manifestResponse, metadataResponse] = await Promise.all([
        fetcher(new URL("manifest.json", baseUrl)),
        fetcher(new URL("es-filter-speller-metadata.json", baseUrl))
      ]);
      if (![manifestResponse, metadataResponse].every(response => response.ok)) throw new Error("No se pudo cargar el grafo Morfologik es-ES.");
      const manifest = await manifestResponse.json();
      metadata = await metadataResponse.json();
      if (manifest?.schema !== 1 || !String(manifest.profile).startsWith("es-ES")
          || manifest.rawSha256 !== "80032b6167b6f365f3d2b4efe02c9444c473fbb85558ef75d69966749f26b4df"
          || manifest.compressedSha256 !== "fb973f39c26ec1c56551fccaa09bcfe6965ec7af9ce8b2a5f1d1a8f454faf1cc") {
        throw new Error("El grafo de sugerencias no pertenece a la fuente es-ES fijada.");
      }
      const graphResponse = await fetcher(new URL(manifest.dataFile, baseUrl));
      if (!graphResponse.ok) throw new Error("No se pudo cargar el grafo de formas es-ES.");
      const compressed = await graphResponse.arrayBuffer();
      const raw = await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
      const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", raw)), byte => byte.toString(16).padStart(2, "0")).join("");
      if (digest !== manifest.rawSha256 || raw.byteLength !== manifest.rawBytes) throw new Error("Hash o tamaño incorrecto del grafo Morfologik es-ES.");
      const ints = new Uint32Array(raw);
      if (ints[0] !== 0x53414643 || raw.byteLength !== 12 + (ints[1] + 1) * 4 + ints[2] * 12) throw new Error("Estructura FSA es-ES inválida.");
      graph = { offsets: ints.subarray(3, 4 + ints[1]), arcs: ints.subarray(4 + ints[1]), nodes: ints[1], arcCount: ints[2] };
      for (const [key, values] of Object.entries(metadata.replacementPairs || {})) for (const target of values) {
        if (target.length <= 2) {
          const map = target.length === 1 ? one : two;
          (map.get(target) || map.set(target, []).get(target)).push({ source: key.replace(/^\^|\$$/gu, ""), start: key.startsWith("^"), end: key.endsWith("$") });
        } else (rest.get(key) || rest.set(key, []).get(key)).push(target);
      }
      return Object.freeze({ nodes: graph.nodes, arcs: graph.arcCount, sha256: digest, findSimilarWords, findSimilarWordCandidates });
    })();
    return loadPromise;
  }

  function getArc(node, label) { for (let arc = graph.offsets[node]; arc < graph.offsets[node + 1]; arc++) if (graph.arcs[arc * 3] === label) return arc; return -1; }
  const next = arc => graph.arcs[arc * 3 + 2];
  const terminal = arc => Boolean(graph.arcs[arc * 3 + 1] & 2);
  const final = arc => Boolean(graph.arcs[arc * 3 + 1] & 1);
  function exact(word) {
    const bytes = encoder.encode(String(word)); let node = 0, last = -1;
    for (let index = 0; index < bytes.length; index++) {
      last = getArc(node, bytes[index]); if (last < 0) return false;
      if (terminal(last)) node = -1; else node = next(last);
      if (node < 0 && index !== bytes.length - 1) return false;
    }
    return last >= 0 && (final(last) || node >= 0 && getArc(node, metadata.separator) >= 0);
  }
  function frequency(node) {
    if (frequencyCache.has(node)) return frequencyCache.get(node);
    let result = 0, arc = getArc(node, metadata.separator);
    if (arc >= 0 && !final(arc) && !terminal(arc)) {
      let current = next(arc);
      while (current >= 0) {
        arc = graph.offsets[current]; if (arc >= graph.offsets[current + 1]) break;
        if (final(arc)) { result = graph.arcs[arc * 3] - 65; break; }
        if (terminal(arc)) break; current = next(arc);
      }
    }
    frequencyCache.set(node, result); return result;
  }
  function characters(node) {
    if (characterCache.has(node)) return characterCache.get(node);
    const output = [];
    function visit(current, bytes, required) {
      for (let arc = graph.offsets[current]; arc < graph.offsets[current + 1]; arc++) {
        const label = graph.arcs[arc * 3], buffer = [...bytes, label]; let count = required;
        if (!bytes.length) { if (label < 128) count = 1; else if (label >= 194 && label < 224) count = 2; else if (label >= 224 && label < 240) count = 3; else if (label >= 240 && label < 245) count = 4; else continue; }
        if (buffer.length < count) { if (!terminal(arc)) visit(next(arc), buffer, count); continue; }
        try {
          const character = decoder.decode(new Uint8Array(buffer))[0], target = terminal(arc) ? -1 : next(arc);
          const separator = target >= 0 ? getArc(target, metadata.separator) : -1;
          output.push({ character, target, terminal: terminal(arc), final: final(arc) || separator >= 0 && !terminal(separator), frequency: target < 0 ? 0 : frequency(target) });
        } catch { /* Ignore invalid UTF-8 paths, as Morfologik's decoder does. */ }
      }
    }
    visit(node, [], 0); characterCache.set(node, output); return output;
  }
  function replaceVariants(value, from = 0, depth = 0) {
    if (depth > 6) return [value];
    let best = 120, key = "", length = 0;
    for (const candidate of rest.keys()) {
      const start = candidate.startsWith("^"), end = candidate.endsWith("$"), bare = candidate.replace(/^\^|\$$/gu, "");
      const index = start ? (from > 0 ? -1 : value.startsWith(bare) ? 0 : -1)
        : end ? (value.length - bare.length >= from && value.endsWith(bare) ? value.length - bare.length : -1)
          : value.indexOf(candidate, from);
      if (index >= 0 && (index < best || index === best && bare.length >= length)) { best = index; key = candidate; length = bare.length; }
    }
    if (best >= 120) return [value];
    const output = replaceVariants(value, best + length, depth + 1);
    for (const target of rest.get(key)) {
      const index = value.indexOf(target, Math.max(0, from - target.length + 1));
      if (target.length > length && index >= 0 && (index === best || index === best - target.length + 1)) continue;
      output.push(...replaceVariants(value.slice(0, best) + target + value.slice(best + length), best + target.length, depth + 1));
    }
    return output;
  }
  function searchQueries(word) {
    let normalized = String(word);
    for (const [from, to] of Object.entries(metadata.inputConversion || {})) normalized = normalized.replaceAll(from, to);
    const queries = rest.size && normalized.length > 1 ? replaceVariants(normalized) : [normalized];
    const output = []; let index = 1;
    for (const query of queries) { index++; if (index > 15 || query.length < 4 && index > 2) break; output.push(query); }
    return output.length ? output : [normalized];
  }
  function equivalent(left, right) {
    if (left === right || metadata.equivalentChars[left]?.includes(right)) return true;
    const a = left.normalize("NFD")[0], b = right.normalize("NFD")[0];
    return a === b || /\p{L}/u.test(a) && a.toLowerCase() === b.toLowerCase();
  }
  function dictionaryForm(value) {
    if (exact(value)) return true;
    const characters = [...value];
    const capitalized = characters.length > 0 && /\p{Uppercase}/u.test(characters[0])
      && !characters.slice(1).some(char => /\p{L}/u.test(char) && /\p{Uppercase}/u.test(char));
    return capitalized && exact(value.toLocaleLowerCase("es"));
  }
  function runOnCandidates(original) {
    let word = String(original);
    for (const [from, to] of Object.entries(metadata.inputConversion || {})) word = word.replaceAll(from, to);
    if (!word || dictionaryForm(word)) return [];
    const output = [];
    for (let split = 1; split < word.length; split++) {
      const prefix = word.slice(0, split), suffix = word.slice(split);
      const suffixKnown = dictionaryForm(suffix) || /^\p{Uppercase}/u.test(suffix) && exact(suffix.toLocaleLowerCase("es"));
      if (!suffixKnown) continue;
      if (dictionaryForm(prefix)) output.push(`${prefix} ${suffix}`);
      else if (/^\p{Uppercase}/u.test(prefix) && dictionaryForm(prefix.toLocaleLowerCase("es"))) output.push(`${prefix} ${suffix}`);
    }
    return output;
  }
  function findSimilarWordCandidates(original, maxEditDistance = 1) {
    if (!graph) throw new Error("El grafo Morfologik es-ES aún no está cargado.");
    maxEditDistance = Math.max(1, Math.min(3, Number.isInteger(maxEditDistance) ? maxEditDistance : 1));
    const cacheKey = `${maxEditDistance}:${original}`;
    if (suggestionCache.has(cacheKey)) return suggestionCache.get(cacheKey).map(item => ({ ...item }));
    let word = String(original);
    for (const [from, to] of Object.entries(metadata.inputConversion || {})) word = word.replaceAll(from, to);
    const bandRadius = maxEditDistance, results = [], matrix = new Int32Array(122 * (2 * bandRadius + 3)); matrix.fill(0);
    for (let index = 0; index < 121 - bandRadius; index++) { matrix[index] = maxEditDistance + 1; matrix[matrix.length - index - 1] = maxEditDistance + 1; }
    for (let index = 0; index <= bandRadius + 1; index++) { matrix[(bandRadius + 1 - index) * 122] = index; matrix[(bandRadius + 1 + index) * 122 + index] = index; }
    const get = (i, j) => matrix[(j - i + bandRadius + 1) * 122 + j], set = (i, j, value) => { matrix[(j - i + bandRadius + 1) * 122 + j] = value; };
    let processed = "", candidate = [], distance = maxEditDistance;
    const add = (form, d, node) => results.push({ word: form, distance: d, score: d * 26 + 25 - frequency(node) });
    function edit(i, j, wordIndex, candidateIndex) {
      let value;
      if (equivalent(processed[wordIndex], candidate[candidateIndex])) value = get(i, j);
      else if (wordIndex > 0 && candidateIndex > 0 && processed[wordIndex] === candidate[candidateIndex - 1] && processed[wordIndex - 1] === candidate[candidateIndex]) value = 1 + Math.min(get(i - 1, j - 1), get(i + 1, j), get(i, j + 1));
      else value = 1 + Math.min(get(i, j), get(i + 1, j), get(i, j + 1));
      set(i + 1, j + 1, value); return value;
    }
    function patternMatches(pattern, wordIndex) { return (!pattern.start || wordIndex === 0) && processed.startsWith(pattern.source, wordIndex) && (!pattern.end || wordIndex + pattern.source.length === processed.length); }
    function walk(node, depth, wordIndex, candidateIndex, minLookback = -1, lastSource = null, lastTarget = "") {
      for (const arc of characters(node)) {
        candidate[candidateIndex] = arc.character; let length = 0;
        if (candidateIndex > 0 && wordIndex > 0) {
          const pair = candidate[candidateIndex - 1] + candidate[candidateIndex];
          for (const p of two.get(pair) || []) {
            if (p.source.length === 2 && wordIndex < processed.length && candidate[candidateIndex - 1] === processed[wordIndex - 1] && candidate[candidateIndex] === processed[wordIndex]) break;
            if (patternMatches(p, wordIndex - 1)) { if (wordIndex - 1 < minLookback && lastSource && p.source.length === 1 && p.source === lastTarget && pair === lastSource) continue; length = p.source.length; break; }
          }
        }
        const isEnd = arc.final && Math.abs(processed.length - 1 - wordIndex) <= distance;
        const canContinue = !arc.terminal && arc.character !== String.fromCharCode(metadata.separator);
        if (length > 0) {
          let d = get(depth - 1, depth - 1);
          if (isEnd) { d += Math.abs(processed.length - 1 - (wordIndex + length - 2)); if (d <= distance) results.push({ word: candidate.slice(0, candidateIndex + 1).join(""), distance: d, score: d * 26 + 25 - arc.frequency }); }
          if (canContinue) { const previous = get(depth, depth); set(depth, depth, get(depth - 1, depth - 1)); walk(arc.target, Math.max(0, depth), wordIndex + length - 1, candidateIndex + 1, minLookback, lastSource, lastTarget); set(depth, depth, previous); }
        }
        length = 0;
        for (const p of one.get(arc.character) || []) if (patternMatches(p, wordIndex)) { length = p.source.length; break; }
        if (length > 0) {
          let d = get(depth, depth);
          if (isEnd) { d += Math.abs(processed.length - 1 - (wordIndex + length - 1)); if (d <= distance) results.push({ word: candidate.slice(0, candidateIndex + 1).join(""), distance: d, score: d * 26 + 25 - arc.frequency }); }
          if (canContinue) walk(arc.target, depth, wordIndex + length, candidateIndex + 1, wordIndex + length, processed.slice(wordIndex, wordIndex + length), arc.character);
        }
        let cutoff = distance + 1, lower = Math.max(0, depth - distance), upper = Math.min(processed.length - 1 - (wordIndex - depth), depth + distance);
        for (let i = lower, wi = wordIndex + lower - depth; i <= upper; i++, wi++) cutoff = Math.min(cutoff, edit(i, depth, wi, candidateIndex));
        if (cutoff <= distance) {
          if (isEnd) { const d = edit(processed.length - 1 - (wordIndex - depth), depth, processed.length - 1, candidateIndex); if (d <= distance) results.push({ word: candidate.slice(0, candidateIndex + 1).join(""), distance: d, score: d * 26 + 25 - arc.frequency }); }
          if (canContinue) walk(arc.target, depth + 1, wordIndex + 1, candidateIndex + 1, minLookback, lastSource, lastTarget);
        }
      }
    }
    if (word.length > 0 && word.length < 120) {
      const queries = rest.size && word.length > 1 ? replaceVariants(word) : [word];
      if (rest.size && word.length > 1) for (const query of queries) {
        const forms = exact(query) ? [query] : [query.toLocaleLowerCase("es"), query.toLocaleUpperCase("es"), query.length > 1 ? query[0].toLocaleUpperCase("es") + query.slice(1).toLocaleLowerCase("es") : ""];
        for (const form of forms) if (form && exact(form)) { let node = 0; for (const byte of encoder.encode(form)) node = next(getArc(node, byte)); add(form, 0, node); }
      }
      let index = 1;
      for (const query of queries) { index++; if (index > 15 || query.length < 4 && index > 2) break; processed = query; candidate = []; distance = query.length <= 1 ? query.length - 1 : maxEditDistance; walk(0, 0, 0, 0); }
    }
    for (const value of runOnCandidates(original)) results.push({ word: value, distance: 1, score: 51 });
    results.sort((a, b) => a.score - b.score);
    const seen = new Set(), output = [];
    for (const item of results) {
      let value = item.word;
      for (const [from, to] of Object.entries(metadata.outputConversion || {})) value = value.replaceAll(from, to);
      if (value !== String(original) && !seen.has(value)) { seen.add(value); output.push({ word: value, distance: item.distance, weight: item.score }); }
    }
    if (suggestionCache.size > 10000) suggestionCache.clear();
    suggestionCache.set(cacheKey, output);
    return output.map(item => ({ ...item }));
  }
  const findSimilarWords = (word, maxEditDistance = 1) => findSimilarWordCandidates(word, maxEditDistance).map(item => item.word);
  globalThis.CorrectorSpanishFilterSpeller = Object.freeze({ load, findSimilarWords, findSimilarWordCandidates });
})();
