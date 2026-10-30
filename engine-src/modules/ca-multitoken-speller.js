/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Local port of LanguageTool's dictionary-backed MultitokenSpeller. */
(() => {
  "use strict";
  const RESOURCE_PATH = "build/resources/ca-multitoken-candidates.txt.gz";
  let index = null;
  let promise = null;
  let findAdditionalSuggestions = () => [];
  const suggestionCache = new Map();
  const normalize = value => value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("ca").replace(/-/gu, " ");
  const parts = value => value.split(" ").filter(Boolean);
  const distance = (left, right) => {
    const a = [...left], b = [...right];
    if (Math.abs(a.length - b.length) > 3) return Math.abs(a.length - b.length);
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const current = [i];
      for (let j = 1; j <= b.length; j++) {
        const substitution = a[i - 1] === b[j - 1] || a[i - 1] === "y" && b[j - 1] === "i"
          || a[i - 1] === "i" && b[j - 1] === "y" || a[i - 1] === "b" && b[j - 1] === "v"
          || a[i - 1] === "v" && b[j - 1] === "b" || a[i - 1] === "s" && b[j - 1] === "z"
          || a[i - 1] === "z" && b[j - 1] === "s" ? 0 : 1;
        current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + substitution);
      }
      previous = current;
    }
    let result = previous[b.length];
    const anagram = a.length === b.length && a.slice().sort().join("") === b.slice().sort().join("");
    if (result > 1 && anagram) result--;
    if (result > 0 && anagram) result = 1;
    return result;
  };
  async function load() {
    if (index) return { loaded: true, entries: index.count };
    if (!promise) promise = (async () => {
      const [response, metadataResponse] = await Promise.all([RESOURCE_PATH, "build/resources/ca-multitoken-candidates.json"].map(path => fetch(chrome.runtime.getURL(path))));
      if (!response.ok) throw new Error("Cannot load the LanguageTool multitoken spelling candidates.");
      if (!metadataResponse.ok) throw new Error("Cannot load the LanguageTool multitoken spelling manifest.");
      const metadata = await metadataResponse.json();
      const raw = await new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
      const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", raw)), byte => byte.toString(16).padStart(2, "0")).join("");
      if (digest !== metadata.sha256) throw new Error("Invalid multitoken spelling candidate resource hash.");
      const values = new TextDecoder("utf-8", { fatal: true }).decode(raw).split("\n").filter(Boolean);
      const byFirst = new Map(), compact = new Map();
      for (const value of values) {
        const key = normalize(value);
        if (!key.includes(" ")) continue;
        const first = key[0], length = key.length;
        let lengths = byFirst.get(first); if (!lengths) byFirst.set(first, lengths = new Map());
        let entries = lengths.get(length); if (!entries) lengths.set(length, entries = new Map());
        let forms = entries.get(key); if (!forms) entries.set(key, forms = []);
        if (!forms.includes(value)) forms.push(value);
        const noSpaces = key.replaceAll(" ", "");
        let exact = compact.get(noSpaces); if (!exact) compact.set(noSpaces, exact = []);
        if (!exact.includes(value)) exact.push(value);
      }
      index = { byFirst, compact, count: values.length };
      return { loaded: true, entries: values.length };
    })().catch(error => { promise = null; throw error; });
    return promise;
  }
  function stopSearching(candidates, original) {
    for (const candidate of candidates) if (candidate === original) return true;
    for (const candidate of candidates) if (candidate === candidate.toLocaleLowerCase("ca")
        && candidate.replace(/(^|\s)\p{L}/gu, part => part.toLocaleUpperCase("ca")) === original) return true;
    return false;
  }
  function maxEditDistance(candidate, word) {
    const wordParts = parts(word), candidateParts = parts(candidate);
    let correct = 0;
    if (wordParts.length === candidateParts.length && wordParts.length > 1) {
      for (let i = 0; i < wordParts.length; i++) if (wordParts[i] === candidateParts[i]) correct += wordParts[i].length;
    }
    const correctLength = word.length - correct;
    let firstWrong = 0;
    if (wordParts.length === candidateParts.length && wordParts.length === 2) {
      for (let i = 0; i < 2; i++) if (wordParts[i][0] !== candidateParts[i][0]) {
        firstWrong += "sbvziy".includes(wordParts[i][0]) && "sbvziy".includes(candidateParts[i][0]) ? 0.2 : 1;
      }
    }
    if (correctLength <= 7) return Math.trunc(2 - firstWrong);
    return Math.trunc(2 + 0.25 * (correctLength - 7) - 0.6 * firstWrong);
  }
  function suggestions(original, { allUppercase = false } = {}) {
    if (!index) throw new Error("Multitoken spelling resource is not loaded.");
    let input = String(original).replace(/[\p{Zs}]+/gu, " ").replace(/- | -/gu, "-");
    const letters = [...input].filter(char => /\p{L}/u.test(char)).length;
    if (input.length > 50 || letters < 2) return [];
    const key = normalize(input), noSpaces = key.replaceAll(" ", "");
    const cacheKey = `${allUppercase ? 1 : 0}\u0000${key}`;
    if (suggestionCache.has(cacheKey)) return suggestionCache.get(cacheKey).slice();
    const weighted = [];
    const exact = [...(index.compact.get(noSpaces) || [])];
    if (exact.length) {
      if (stopSearching(exact, input)) { suggestionCache.set(cacheKey, []); return []; }
      for (const value of exact) weighted.push({ value, weight: 0 });
    }
    const first = key[0], groups = index.byFirst.get(first);
    if (!weighted.length && groups) {
      const queryParts = parts(key);
      for (let length = Math.max(0, input.length - 3); length <= input.length + 3; length++) {
        const candidatesByKey = groups.get(length) || new Map();
        for (const [candidateKey, candidates] of candidatesByKey) {
          if (stopSearching(candidates, input)) return [];
          const candidateParts = parts(candidateKey);
          const distances = candidateParts.length === queryParts.length && candidateParts.length > 1
            ? candidateParts.map((part, i) => distance(part, queryParts[i])) : [distance(candidateKey, key)];
          const total = distances.reduce((sum, value) => sum + value, 0);
          if (total < 1) {
            for (const value of candidates) weighted.push({ value, weight: 0 });
            if (weighted.length >= 2) break;
            continue;
          }
          if (candidateKey.length < 7) continue;
          if (candidateParts.length === queryParts.length && candidateParts.length > 1
              && distances.some((value, i) => value > (queryParts[i].length > 5 && candidateParts[i].length > 4 ? 2 : 1))) continue;
          if (total <= maxEditDistance(candidateKey, key)) for (const value of candidates) weighted.push({ value, weight: total });
        }
        if (weighted.length >= 2) break;
      }
    }
    for (const candidate of findAdditionalSuggestions(input)) {
      if (candidate.word === input) { suggestionCache.set(cacheKey, []); return []; }
      weighted.push({ value: candidate.word, weight: candidate.distance });
    }
    if (!weighted.length) { suggestionCache.set(cacheKey, []); return []; }
    weighted.sort((a, b) => a.weight - b.weight);
    const best = weighted[0].weight, output = [];
    for (const row of weighted) if (row.weight - best < 1 && !output.includes(row.value)) output.push(row.value);
    const result = allUppercase && input.length > 4
      ? [...new Set(output.map(value => value.toLocaleUpperCase("ca")))].filter(value => value !== input)
      : output.filter(value => value !== input);
    suggestionCache.set(cacheKey, result);
    if (suggestionCache.size > 2000) suggestionCache.delete(suggestionCache.keys().next().value);
    return result.slice();
  }
  function configure(options = {}) { findAdditionalSuggestions = options.findAdditionalSuggestions || (() => []); suggestionCache.clear(); }
  globalThis.CorrectorCatalanMultitokenSpeller = Object.freeze({ load, suggestions, configure });
})();
