/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* LanguageTool's global then Catalan multiword taggers. */
(() => {
  "use strict";

  let globalEntries = [];
  let catalanEntries = [];

  const lower = value => value.toLocaleLowerCase("ca");
  const upperFirst = value => value.length ? value[0].toLocaleUpperCase("ca") + value.slice(1) : value;
  const allUpper = value => value.toLocaleUpperCase("ca");
  const isCamelCase = value => /^[a-z]+[A-Z][A-Za-z]+$/u.test(value);
  const EXPECTED_HASHES = Object.freeze({
    spelling_global: "98198e0ecbb5e14e32cbee42a4be8b6982c3bb34311bf9ea1f5c12fab4a65634",
    ca_multiwords: "c4d7fdf74d543d4318de1bc1a11161b7f59921594cfb915fd4bc057798a97955"
  });

  function expandEntries(rows, { firstCapitalized, allUppercase }) {
    const withSpaces = new Map();
    const withoutSpaces = new Map();
    for (const [phrase, tag] of rows) {
      const hasSpace = phrase.indexOf(" ") > 0;
      const target = hasSpace ? withSpaces : withoutSpaces;
      const variants = [phrase];
      if (allUppercase && !isCamelCase(phrase)) {
        const uppercase = allUpper(phrase);
        if (!target.has(uppercase) && phrase !== uppercase) variants.push(uppercase);
      }
      if (firstCapitalized) {
        const capitalized = upperFirst(phrase);
        if (!target.has(capitalized) && phrase !== capitalized) variants.push(capitalized);
      }
      for (const variant of variants) target.set(variant, { phrase: variant, lemma: phrase, tag, hasSpace });
    }
    const byFirst = new Map();
    for (const entry of [...withSpaces.values(), ...withoutSpaces.values()]) {
      const bucket = byFirst.get(entry.phrase[0]) || [];
      bucket.push(entry);
      byFirst.set(entry.phrase[0], bucket);
    }
    return byFirst;
  }

  function getCandidates(token, dictionary) {
    const text = token?.text || "";
    const exact = dictionary.get(text[0]) || [];
    return exact;
  }

  function matchPhrase(tokens, start, phrase, allowSpaces) {
    let current = "";
    let lastWasSpace = false;
    for (let index = start; index < tokens.length && index - start < 20; index++) {
      const token = tokens[index];
      const isSpace = token.kind === "space" || /^\s+$/u.test(token.text);
      if (isSpace) {
        if (!allowSpaces) return -1;
        if (current && !lastWasSpace) current += " ";
        lastWasSpace = true;
      } else {
        current += token.text;
        lastWasSpace = false;
      }
      if (current === phrase) return index;
      if (!phrase.startsWith(current)) return -1;
    }
    return -1;
  }

  function findMatches(tokens, dictionary) {
    const matches = [];
    for (let start = 0; start < tokens.length; start++) {
      if (!tokens[start].text) continue;
      for (const entry of getCandidates(tokens[start], dictionary)) {
        const end = matchPhrase(tokens, start, entry.phrase, entry.hasSpace);
        if (end >= start) matches.push({ start, end, ...entry });
      }
    }
    return matches;
  }

  function addBoundaryReading(token, reading, stage, isEnd = false) {
    const tag = isEnd ? `</${reading.tag}>` : `<${reading.tag}>`;
    globalThis.CorrectorCatalanAnalysis.addReading(token, { lemma: reading.lemma, tag, token: token.text, source: stage }, stage);
    globalThis.CorrectorCatalanAnalysis.addChunkTag(token, tag, stage);
  }

  function applyGlobal(tokens) {
    const matches = findMatches(tokens, globalEntries);
    for (const match of matches) {
      if (match.tag === "_NONE_") continue;
      const reading = { lemma: match.lemma, tag: match.tag };
      if (match.start === match.end) {
        // LanguageTool treats NPCN000 as a low-priority fallback for single
        // tokens: retain an existing lexical POS analysis instead of replacing
        // it with a proper-name guess. Multi-token entries still add boundaries.
        if (match.tag === "NPCN000" && tokens[match.start].contextualReadings.some(row => row.tag != null)) continue;
        globalThis.CorrectorCatalanAnalysis.addReading(tokens[match.start], { ...reading, token: tokens[match.start].text, source: "global-multiword" }, "global-multiword");
      } else {
        addBoundaryReading(tokens[match.start], reading, "global-multiword");
        addBoundaryReading(tokens[match.end], reading, "global-multiword", true);
      }
    }
    return { tokens, matchCount: matches.length };
  }

  function nextTag(tag) {
    if (tag.startsWith("NC")) return `AQ0${tag.substring(2, 4)}0`;
    return tag;
  }

  function stripPreviousTags(tokens) {
    for (let start = 0; start < tokens.length; start++) {
      if (tokens[start].kind === "space") continue;
      const starts = tokens[start].contextualReadings.filter(reading => reading.tag?.startsWith("<") && !reading.tag.startsWith("</"));
      let selected = null;
      for (const opening of starts) {
        const closeTag = `</${opening.tag.slice(1)}`;
        for (let end = start + 1; end < tokens.length; end++) {
          if (tokens[end].contextualReadings.some(reading => reading.tag === closeTag && reading.lemma === opening.lemma)) {
            if (!selected || end > selected.end || (end === selected.end && !opening.tag.includes("NPCN000"))) {
              selected = { end, opening };
            }
            break;
          }
        }
      }
      if (!selected) continue;
      const posTag = selected.opening.tag.slice(1, -1);
      for (let index = start; index <= selected.end; index++) {
        if (tokens[index].kind === "space" || /^\s+$/u.test(tokens[index].text)) continue;
        const tag = index === start ? posTag : nextTag(posTag);
        globalThis.CorrectorCatalanAnalysis.replaceReadings(tokens[index], [
          { token: tokens[index].text, lemma: selected.opening.lemma, tag, source: "catalan-multiword" }
        ], "catalan-multiword", "REMOVE_PREVIOUS_TAGS");
      }
      start = selected.end;
    }
  }

  function applyCatalan(tokens) {
    const allMatches = findMatches(tokens, catalanEntries);
    const byStart = new Map();
    for (const match of allMatches) {
      const matchesAtStart = byStart.get(match.start) || [];
      matchesAtStart.push(match);
      byStart.set(match.start, matchesAtStart);
    }
    const accepted = [];
    for (const candidates of byStart.values()) {
      candidates.sort((a, b) => (b.end - b.start) - (a.end - a.start));
      for (const candidate of candidates) {
        if (candidate.end === candidate.start && candidate.tag === "NPCN000") {
          const hasLexicalReading = tokens[candidate.start].contextualReadings.some(reading => reading.tag != null);
          if (hasLexicalReading) continue;
        }
        accepted.push(candidate);
      }
    }

    for (const match of accepted) {
      if (match.tag === "_NONE_") continue;
      const first = tokens[match.start];
      const last = tokens[match.end];
      const reading = { lemma: match.lemma, tag: match.tag, token: first.text, source: "catalan-multiword" };
      if (match.start === match.end) {
        globalThis.CorrectorCatalanAnalysis.addReading(first, reading, "catalan-multiword");
        continue;
      }
      addBoundaryReading(first, reading, "catalan-multiword");
      addBoundaryReading(last, reading, "catalan-multiword", true);
    }
    stripPreviousTags(tokens);
    return { tokens, matchCount: accepted.length };
  }

  async function load({ url, fetcher = globalThis.fetch } = {}) {
    const resourceUrl = url || globalThis.chrome?.runtime?.getURL("build/resources/ca-chunker-data.json");
    if (!resourceUrl) throw new Error("Cal indicar URL dels recursos de chunking fora de l'extensió.");
    const response = await fetcher(resourceUrl);
    if (!response.ok) throw new Error(`No s'ha pogut carregar el recurs de chunking (${response.status}).`);
    const resource = await response.json();
    if (resource?.schemaVersion !== 1 || !Array.isArray(resource.globalEntries) || !Array.isArray(resource.catalanEntries)) {
      throw new Error("Recurs de chunking incompatible.");
    }
    for (const [name, expected] of Object.entries(EXPECTED_HASHES)) {
      if (resource.sourceHashes?.[name] !== expected) throw new Error(`Hash de recurs de chunking invàlid: ${name}`);
    }
    globalEntries = expandEntries(resource.globalEntries, { firstCapitalized: false, allUppercase: true });
    catalanEntries = expandEntries(resource.catalanEntries, { firstCapitalized: true, allUppercase: true });
    return {
      globalEntries: resource.globalEntries.length,
      catalanEntries: resource.catalanEntries.length,
      sourceHashes: resource.sourceHashes
    };
  }

  function disambiguate(tokens) {
    const globalResult = applyGlobal(tokens);
    const afterGlobal = globalResult.tokens.map(globalThis.CorrectorCatalanAnalysis.snapshot);
    const catalanResult = applyCatalan(globalResult.tokens);
    return {
      tokens: catalanResult.tokens,
      globalTokens: afterGlobal,
      stages: {
        globalMultiwordChunker: { matches: globalResult.matchCount },
        catalanMultiwordChunker: { matches: catalanResult.matchCount }
      }
    };
  }

  function clear() {
    globalEntries = [];
    catalanEntries = [];
  }

  globalThis.CorrectorCatalanChunker = Object.freeze({ load, disambiguate, clear });
})();
