/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Spanish context-confusion rules ported from LanguageTool's LGPL data/class. */
(() => {
  "use strict";

  const RESOURCE_PATH = "build/resources/es-ES/es-wrong-word-context.json";
  const SOURCE_SHA256 = "0f0472a6364601e60825088ac73cb4959500a26ce5b3fdf0185f21d1d873a7a5";

  function compile(source, boundary = false) {
    if (typeof source !== "string") throw new Error("Expresión contextual inválida.");
    let flags = "u";
    let body = source;
    if (body.startsWith("(?i)")) { flags += "i"; body = body.slice(4); }
    if (body.startsWith("(?-i)")) body = body.slice(5);
    // LT wraps its configured regexes in Java \b boundaries. Runtime inputs
    // are already individual tokens/lemmas, so anchoring is equivalent and
    // avoids JavaScript's ASCII-only \b behavior for accented Spanish.
    return new RegExp(boundary ? `^(?:${body})$` : body, flags);
  }

  function createDataIndex(resource) {
    if (resource?.schemaVersion !== 1 || resource.language !== "es-ES"
        || resource.sourceSha256 !== SOURCE_SHA256 || !Array.isArray(resource.entries)
        || resource.entryCount !== resource.entries.length || resource.entryCount !== 3) {
      throw new Error("El recurso de confusiones contextuales no coincide con el snapshot verificado de LanguageTool.");
    }
    const entries = resource.entries.map((entry, index) => {
      if (!Array.isArray(entry.words) || !Array.isArray(entry.replacements) || !Array.isArray(entry.contexts)
          || entry.words.length !== 2 || entry.replacements.length !== 2 || entry.contexts.length !== 2) throw new Error(`Fila contextual inválida: ${index}`);
      return Object.freeze({
        words: entry.words.map(value => compile(value, true)),
        replacements: entry.replacements,
        contexts: entry.contexts.map(value => compile(value, true)),
        explanations: entry.explanations || ["", ""]
      });
    });
    return Object.freeze({ entries, entryCount: resource.entryCount, sourceSha256: resource.sourceSha256 });
  }

  async function load({ url, fetcher = globalThis.fetch } = {}) {
    const resourceUrl = url || globalThis.chrome?.runtime?.getURL(RESOURCE_PATH);
    if (!resourceUrl) throw new Error("Cal indicar l'URL del recurs de confusions contextuals es-ES.");
    const response = await fetcher(resourceUrl);
    if (!response.ok) throw new Error(`No s'ha pogut carregar el recurs de confusions contextuals (${response.status}).`);
    return createDataIndex(await response.json());
  }

  function preserveCase(replacement, original) {
    if (original && original === original.toLocaleUpperCase("es")) return replacement.toLocaleUpperCase("es");
    if (original && original === original.toLocaleLowerCase("es")) return replacement.toLocaleLowerCase("es");
    if (/^\p{Lu}/u.test(original)) return replacement.replace(/^\p{Ll}/u, letter => letter.toLocaleUpperCase("es"));
    return replacement;
  }

  function findMatches(sentences, data) {
    if (!data?.entries) throw new Error("Cal carregar primer les dades de confusions contextuals es-ES.");
    const issues = [];
    const emitted = new Set();
    for (const sentence of sentences || []) {
      const tokens = (sentence.tokens || []).filter(token => token.kind !== "space");
      for (let row = 0; row < data.entries.length; row++) {
        const entry = data.entries[row];
        // LanguageTool's optimization short-circuits only on sufficiently long
        // literal prefixes; for these short rules doing the complete token scan
        // is clearer and prevents false negatives from regex alternations.
        const matches = [-1, -1];
        for (let i = 0; i < tokens.length && (matches[0] < 0 || matches[1] < 0); i++) {
          const token = tokens[i];
          if (/^(?:https?|ftps?|wss?|file|mailto):\/\//iu.test(token.text) || /^www\./iu.test(token.text)) continue;
          for (let side = 0; side < 2; side++) if (matches[side] < 0 && entry.words[side].test(token.text)) matches[side] = i;
        }
        if ((matches[0] >= 0) === (matches[1] >= 0)) continue;
        const found = matches[0] >= 0 ? 0 : 1;
        const missing = 1 - found;
        const token = tokens[matches[found]];
        if (token.readings?.some(reading => reading.tag === "IS_URL")) continue;
        let foundContext = false, missingContext = false;
        for (const candidate of tokens) {
          for (const reading of candidate.lexicalReadings || candidate.preDisambiguationReadings || candidate.readings || []) {
            const lemma = reading.lemma;
            if (typeof lemma !== "string" || !lemma) continue;
            if (!foundContext && entry.contexts[found].test(lemma)) foundContext = true;
            if (!missingContext && entry.contexts[missing].test(lemma)) missingContext = true;
            if (foundContext && missingContext) break;
          }
          if (foundContext && missingContext) break;
        }
        if (!missingContext || foundContext) continue;
        const oldFragment = entry.replacements[found];
        const newFragment = entry.replacements[missing];
        const replaced = token.text.replace(new RegExp(oldFragment, "iu"), newFragment);
        if (replaced === token.text) continue;
        const suggestion = preserveCase(replaced, token.text);
        const start = token.start, end = start + token.text.length;
        const duplicateKey = `${start}:${end}:${suggestion}`;
        if (emitted.has(duplicateKey)) continue;
        emitted.add(duplicateKey);
        const wrongExplanation = entry.explanations[found] || "";
        const suggestionExplanation = entry.explanations[missing] || "";
        const message = wrongExplanation && suggestionExplanation
          ? `¿Quería decir «${suggestion}» (${suggestionExplanation}) en vez de «${token.text}» (${wrongExplanation})?`
          : `¿Quería decir «${suggestion}» en vez de «${token.text}»?`;
        issues.push({
          id: `SPANISH_WRONG_WORD_IN_CONTEXT_${token.text}_${suggestion}:${start}:${end}`,
          ruleId: "SPANISH_WRONG_WORD_IN_CONTEXT", category: "confused_words", severity: "warning",
          message, shortMessage: "Posible confusión", text: token.text, start, end,
          replacementStart: start, replacementEnd: end, suggestions: [suggestion], rule: "SPANISH_WRONG_WORD_IN_CONTEXT",
          _family: "wrong-word-context", _sourceRow: row
        });
      }
    }
    return issues;
  }

  globalThis.CorrectorSpanishWrongWordContext = Object.freeze({ RESOURCE_PATH, SOURCE_SHA256, createDataIndex, load, findMatches });
})();
