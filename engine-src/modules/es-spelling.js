/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Local es-ES spell-check adapter over the pinned Morfologik POS FSA. */
(() => {
  "use strict";

  const ALPHABET = [..."abcdefghijklmnopqrstuvwxyzñáéíóúü"];
  const removeSuggestion = new Set(["abu", "abue", "abus", "anarco", "arbi", "arqui", "bibe", "biblio", "bolche", "cami", "capi", "celu", "chiqui", "chuche", "compu", "confi", "copi", "deco", "deli", "depa", "facu", "frigo", "gili", "hospi", "inge", "joputa", "lesbi", "mani", "mari", "munipa", "pandi", "pasti", "pelu", "peni", "pisci", "piti", "prefe", "prosti", "prota", "psico", "publi", "puti", "quillo", "refri", "regu", "repe", "resi", "ridi", "rotu", "sado", "soco", "sufi", "tatu", "tranqui", "ulti", "urba", "vice", "ñero"]);
  const PREFIX_WITH_WHITESPACE = new Set(["ultra", "eco", "tele", "anti", "auto", "ex", "extra", "macro", "mega", "meta", "micro", "multi", "mono", "mini", "post", "retro", "semi", "super", "hiper", "trans", "re", "g", "l", "m"]);
  const PRONOUNS = new Set(["me", "te", "se", "nos", "os", "lo", "le", "la", "los", "las"]);
  const FINAL_PARTICLES = new Set(["que", "cual"]);
  function createDataIndex(resource) {
    if (resource?.schemaVersion !== 1 || resource.profile !== "es-ES" || !Array.isArray(resource.acceptedWords) || !Array.isArray(resource.ignoreWords) || !Array.isArray(resource.prohibitedWords)) throw new Error("El recurso ortográfico no corresponde al perfil es-ES.");
    const normalizeSet = values => new Set(values.map(value => String(value).normalize("NFC").toLocaleLowerCase("es")));
    const accepted = normalizeSet(resource.acceptedWords), acceptedTrie = { next: new Map(), word: null };
    for (const word of accepted) {
      let node = acceptedTrie;
      for (const character of word) {
        if (!node.next.has(character)) node.next.set(character, { next: new Map(), word: null });
        node = node.next.get(character);
      }
      node.word = word;
    }
    return { accepted, acceptedTrie, ignored: normalizeSet(resource.ignoreWords), prohibited: normalizeSet(resource.prohibitedWords), sourceHashes: resource.sourceHashes };
  }

  function isAllUpper(value) { return value !== value.toLocaleLowerCase("es") && value === value.toLocaleUpperCase("es"); }
  function isMixedCase(value) { return value !== value.toLocaleLowerCase("es") && value !== value.toLocaleUpperCase("es") && /[\p{Ll}][\p{Lu}]|[\p{Lu}].*[\p{Ll}].*[\p{Lu}]/u.test(value); }
  function correctCase(source, candidate) {
    if (isAllUpper(source)) return candidate.toLocaleUpperCase("es");
    if (/^\p{Lu}/u.test(source)) return candidate.charAt(0).toLocaleUpperCase("es") + candidate.slice(1);
    return candidate;
  }

  function exact(word, morphology, spellData = null) {
    const value = String(word ?? "").normalize("NFC");
    if (!value) return false;
    const folded = value.toLocaleLowerCase("es");
    if (spellData?.prohibited.has(folded)) return false;
    if (spellData?.ignored.has(folded) || spellData?.accepted.has(folded)) return true;
    if (morphology.hasForm(value)) return true;
    const flags = morphology.manifest.spellerFlags || {};
    if (flags.convertCase && !isMixedCase(value) && morphology.hasForm(value.toLocaleLowerCase("es"))) return true;
    if (flags.convertCase && isAllUpper(value)) {
      const lower = value.toLocaleLowerCase("es"), title = lower.charAt(0).toLocaleUpperCase("es") + lower.slice(1);
      if (morphology.hasForm(title)) return true;
    }
    return false;
  }

  function isMisspelled(word, morphology, { personalWords = null, spellData = null } = {}) {
    const value = String(word ?? "").normalize("NFC");
    if (!value) return false;
    const flags = morphology.manifest.spellerFlags || {};
    if (flags.ignorePunctuation && !/[\p{L}\p{Nl}]/u.test(value)) return false;
    if (flags.ignoreNumbers && /\p{Nd}/u.test(value)) return false;
    const folded = value.toLocaleLowerCase("es");
    if (personalWords?.has(folded) || spellData?.ignored.has(folded)) return false;
    if (spellData?.prohibited.has(folded)) return true;
    if (exact(value, morphology, spellData)) return false;
    return true;
  }

  function candidatesAtDistanceOne(word, morphology, spellData = null) {
    const chars = [...word], values = new Set();
    for (let index = 0; index < chars.length; index++) {
      values.add(chars.slice(0, index).concat(chars.slice(index + 1)).join(""));
      if (index + 1 < chars.length) {
        const swapped = [...chars]; [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
        values.add(swapped.join(""));
      }
      for (const letter of ALPHABET) if (letter !== chars[index]) values.add(chars.slice(0, index).concat(letter, chars.slice(index + 1)).join(""));
    }
    for (let index = 0; index <= chars.length; index++) for (const letter of ALPHABET) values.add(chars.slice(0, index).concat(letter, chars.slice(index)).join(""));
    const results = [];
    for (const value of values) if (value.length >= 2 && !spellData?.prohibited.has(value) && (morphology.hasForm(value) || spellData?.accepted.has(value))) results.push(value);
    return results;
  }

  function frequencyScore(word, morphology) {
    const firstReading = morphology.lookup(word, { lowercaseFallback: false })[0];
    const finalFrequencyCode = firstReading?.tag?.at(-1) || "A";
    return finalFrequencyCode.charCodeAt(0) - 65;
  }

  function damerauDistanceAtMost(source, candidate, maxDistance, equivalent = (a, b) => a === b) {
    const a = [...source], b = [...candidate];
    if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
    let previousPrevious = null, previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let row = 1; row <= a.length; row++) {
      const current = [row]; let minimum = row;
      for (let column = 1; column <= b.length; column++) {
        let cost = Math.min(previous[column] + 1, current[column - 1] + 1, previous[column - 1] + (equivalent(a[row - 1], b[column - 1]) ? 0 : 1));
        if (row > 1 && column > 1 && a[row - 1] === b[column - 2] && a[row - 2] === b[column - 1] && previousPrevious) cost = Math.min(cost, previousPrevious[column - 2] + 1);
        current[column] = cost; minimum = Math.min(minimum, cost);
      }
      if (minimum > maxDistance) return maxDistance + 1;
      previousPrevious = previous; previous = current;
    }
    return previous[b.length];
  }

  function acceptedTrieMatches(source, root, maxDistance, equivalent, limit = 12000) {
    if (!root || maxDistance < 0) return [];
    const target = [...source], found = [], initialRow = Array.from({ length: target.length + 1 }, (_, index) => index);
    const visit = (node, previousRow, previousPreviousRow, previousCharacter) => {
      if (found.length >= limit) return;
      for (const [character, child] of node.next) {
        const currentRow = [previousRow[0] + 1];
        let minimum = currentRow[0];
        for (let column = 1; column <= target.length; column++) {
          let cost = Math.min(previousRow[column] + 1, currentRow[column - 1] + 1,
            previousRow[column - 1] + (equivalent(target[column - 1], character) ? 0 : 1));
          if (previousCharacter && column > 1 && previousPreviousRow
            && equivalent(character, target[column - 2]) && equivalent(previousCharacter, target[column - 1])) {
            cost = Math.min(cost, previousPreviousRow[column - 2] + 1);
          }
          currentRow[column] = cost;
          minimum = Math.min(minimum, cost);
        }
        if (child.word && currentRow[target.length] <= maxDistance) found.push(child.word);
        if (minimum <= maxDistance) visit(child, currentRow, previousRow, character);
        if (found.length >= limit) return;
      }
    };
    visit(root, initialRow, null, "");
    return found;
  }

  function runOnWordCandidates(word, morphology, spellData) {
    const results = [];
    for (let index = 1; index < word.length; index++) {
      const left = word.slice(0, index), right = word.slice(index);
      if (exact(left, morphology, spellData) && exact(right, morphology, spellData)) results.push(`${left} ${right}`);
    }
    return results;
  }

  function collectCandidates(word, morphology, spellData, maxDistance) {
    const candidates = typeof morphology.suggestForms === "function"
      ? morphology.suggestForms(word, { maxDistance })
      : candidatesAtDistanceOne(word, morphology, spellData);
    if (spellData?.acceptedTrie) {
      const acceptedCandidates = new Set();
      const queries = [
        { text: word, cost: 0 },
        ...(morphology.getReplacementQueries?.(word, 14) || []).map(text => ({ text, cost: 0 })),
        ...(morphology.getEditReplacementQueries?.(word, 64) || [])
      ];
      const equivalent = morphology.areEquivalentSuggestionChars?.bind(morphology) || ((a, b) => a === b);
      for (const query of queries) {
        for (const candidate of acceptedTrieMatches(query.text, spellData.acceptedTrie, maxDistance - query.cost, equivalent)) acceptedCandidates.add(candidate);
      }
      candidates.push(...acceptedCandidates);
    }
    candidates.push(...runOnWordCandidates(word, morphology, spellData));
    return [...new Set(candidates)];
  }

  function morfologikSuggestionDistance(source, candidate, limit, morphology) {
    const equivalent = morphology.areEquivalentSuggestionChars?.bind(morphology);
    let best = damerauDistanceAtMost(source, candidate, limit, equivalent);
    if (typeof morphology.getReplacementQueries === "function") {
      for (const query of morphology.getReplacementQueries(source, 15)) {
        const remaining = Math.min(limit, best);
        if (remaining < 0) continue;
        const distance = damerauDistanceAtMost(query, candidate, remaining, equivalent);
        if (distance < best) best = distance;
      }
    }
    if (typeof morphology.getEditReplacementQueries === "function") {
      for (const query of morphology.getEditReplacementQueries(source)) {
        const remaining = Math.min(limit - query.cost, best - query.cost);
        if (remaining < 0) continue;
        const distance = damerauDistanceAtMost(query.text, candidate, remaining, equivalent) + query.cost;
        if (distance < best) best = distance;
      }
    }
    return best;
  }

  function orderSpanishSuggestions(source, candidates, morphology, limit, spellData = null) {
    const original = source.toLocaleLowerCase("es"), initial = original[0] || "";
    const distanceCache = new Map();
    const casePreference = value => {
      if (isAllUpper(source)) return value === value.toLocaleUpperCase("es") ? 0 : 1;
      if (/^\p{Lu}/u.test(source)) return /^\p{Lu}/u.test(value) ? 0 : 1;
      return value === value.toLocaleLowerCase("es") ? 0 : 1;
    };
    const uniqueCandidates = new Map();
    for (const value of candidates) {
      const lower = value.toLocaleLowerCase("es"), existing = uniqueCandidates.get(lower);
      if (!existing || casePreference(value) < casePreference(existing)) uniqueCandidates.set(lower, value);
    }
    const suggestionDistance = value => {
      if (!distanceCache.has(value)) distanceCache.set(value, morfologikSuggestionDistance(original, value.toLocaleLowerCase("es"), 3, morphology));
      return distanceCache.get(value);
    };
    return [...uniqueCandidates.values()].filter(value => !removeSuggestion.has(value.toLocaleLowerCase("es")) && !spellData?.prohibited.has(value.toLocaleLowerCase("es")))
      .filter(value => {
        const parts = value.toLocaleLowerCase("es").split(" ");
        if (parts.length !== 2) return true;
        if (parts[1] === "s" || PREFIX_WITH_WHITESPACE.has(parts[0])) return false;
        return true;
      })
      .sort((a, b) => {
        const la = a.toLocaleLowerCase("es"), lb = b.toLocaleLowerCase("es");
        const distance = suggestionDistance(la) - suggestionDistance(lb);
        if (distance) return distance;
        const phraseRank = value => {
          const parts = value.split(" ");
          if (parts.length !== 2) return 0;
          if (FINAL_PARTICLES.has(parts[1])) return -2;
          if (PRONOUNS.has(parts[0]) && morphology.lookup(parts[1], { lowercaseFallback: false }).some(reading => reading.tag.slice(0, -1).startsWith("V"))) return -1;
          return 1;
        };
        const pa = phraseRank(la), pb = phraseRank(lb);
        if (pa !== pb) return pa - pb;
        const fa = frequencyScore(la, morphology), fb = frequencyScore(lb, morphology);
        if (fa !== fb) return fb - fa;
        const prefixA = la.startsWith(initial), prefixB = lb.startsWith(initial);
        return Number(prefixB) - Number(prefixA) || la.localeCompare(lb, "es");
      })
      .slice(0, limit)
      .map(value => correctCase(source, value));
  }

  function suggest(word, morphology, { limit = 8, spellData = null } = {}) {
    const value = String(word ?? "").normalize("NFC");
    if (!value || [...value].length > 32 || isMixedCase(value)) return [];
    const lower = value.toLocaleLowerCase("es");
    let candidates = collectCandidates(lower, morphology, spellData, 1);
    // LanguageTool retries with a wider Oflazer search only when distance-one
    // spelling and run-on candidates produce nothing (unless full results are requested).
    if (!candidates.length && lower.length >= 3) candidates = collectCandidates(lower, morphology, spellData, 2);
    if (!candidates.length) {
      const folded = lower.normalize("NFD").replace(/\p{M}/gu, "");
      if (folded !== lower) candidates = typeof morphology.suggestForms === "function" ? morphology.suggestForms(folded, { maxDistance: 2 }) : candidatesAtDistanceOne(folded, morphology, spellData);
    }
    return orderSpanishSuggestions(value, [...new Set(candidates)], morphology, limit, spellData);
  }

  globalThis.CorrectorSpanishSpelling = Object.freeze({ exact, isMisspelled, suggest, orderSpanishSuggestions, isMixedCase, createDataIndex });
})();
