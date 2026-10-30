/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Local Spanish/global multiword chunking from LanguageTool's two chunker resources. */
(() => {
  "use strict";
  const titleFirst = value => value ? value[0].toLocaleUpperCase("es") + value.slice(1) : value;
  const camel = value => /^[a-z]+[A-Z][A-Za-z]+$/u.test(value);

  function expandRows(rows, settings, defaultTag = null) {
    const byFirst = new Map(), seen = new Set();
    for (const row of rows) {
      const phrase = row[0], tag = defaultTag || row[1], variants = [phrase];
      if (settings.allowAllUppercase && !camel(phrase)) variants.push(phrase.toLocaleUpperCase("es"));
      if (settings.allowFirstCapitalized) variants.push(titleFirst(phrase));
      for (const variant of variants) {
        const key = `${variant}\0${tag}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const bucket = byFirst.get(variant[0]) || [];
        bucket.push({ phrase: variant, lemma: phrase, tag, hasSpace: phrase.includes(" ") });
        byFirst.set(variant[0], bucket);
      }
    }
    return byFirst;
  }

  function matchPhrase(tokens, start, entry) {
    let current = "", lastWasSpace = false;
    for (let index = start; index < tokens.length && index - start < 20; index++) {
      const token = tokens[index], isSpace = token.kind === "space" || /^\s+$/u.test(token.text);
      if (isSpace) {
        if (!entry.hasSpace) return -1;
        if (current && !lastWasSpace) current += " ";
        lastWasSpace = true;
      } else { current += token.text; lastWasSpace = false; }
      if (current === entry.phrase) return index;
      if (!entry.phrase.startsWith(current)) return -1;
    }
    return -1;
  }

  class SpanishChunker {
    constructor(resource) {
      if (resource?.schema !== 1 || resource?.profile !== "es-ES" || !Array.isArray(resource.multiwords) || !Array.isArray(resource.globalEntries)) throw new Error("Los recursos de chunking no pertenecen a es-ES.");
      this.spanish = expandRows(resource.multiwords, resource.behavior.spanish);
      this.global = expandRows(resource.globalEntries.map(phrase => [phrase]), resource.behavior.global, "NPCN000");
      this.counts = { spanishEntries: resource.multiwords.length, globalEntries: resource.globalEntries.length };
    }

    disambiguate(tokens) {
      const matches = [];
      for (let start = 0; start < tokens.length; start++) {
        if (!tokens[start].text) continue;
        for (const [kind, dictionary] of [["global", this.global], ["spanish", this.spanish]]) {
          for (const entry of dictionary.get(tokens[start].text[0]) || []) {
            const end = matchPhrase(tokens, start, entry);
            if (end >= start) matches.push({ start, end, kind, ...entry });
          }
        }
      }
      const selected = [];
      const byStart = new Map();
      for (const match of matches) {
        const bucket = byStart.get(match.start) || [];
        bucket.push(match);
        byStart.set(match.start, bucket);
      }
      for (let start = 0; start < tokens.length; start++) {
        const atStart = byStart.get(start) || [];
        atStart.sort((a, b) => (b.end - b.start) - (a.end - a.start) || (a.kind === "global" ? -1 : 1));
        if (atStart.length) selected.push(atStart[0]);
      }
      const output = tokens.map(token => ({ ...token, chunksStart: [], chunksEnd: [] }));
      for (const match of selected) {
        const chunk = { lemma: match.lemma, tag: match.tag, kind: match.kind, start: match.start, end: match.end };
        output[match.start].chunksStart.push(chunk);
        output[match.end].chunksEnd.push(chunk);
      }
      return { tokens: output, matches: selected, totalMatches: matches.length, selectedMatches: selected.length };
    }

    static async load({ url, fetcher = globalThis.fetch } = {}) {
      const resourceUrl = url || globalThis.chrome?.runtime?.getURL("build/resources/es-ES/es-multiword.json");
      if (!resourceUrl) throw new Error("Se debe indicar URL del recurso multiword es-ES.");
      const response = await fetcher(resourceUrl);
      if (!response.ok) throw new Error(`No se pudo cargar el recurso multiword es-ES (${response.status}).`);
      return new SpanishChunker(await response.json());
    }
  }
  globalThis.CorrectorSpanishChunker = SpanishChunker;
})();
