/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Spanish SimpleReplaceRule table and runtime, derived from LanguageTool (upstream LGPL-2.1-or-later; local adaptation GPL-3.0-or-later under LGPL-2.1 section 3). */
(() => {
  "use strict";

  const RESOURCE_PATH = "build/resources/es-ES/es-simple-replace.json";
  const SOURCE_HASHES = Object.freeze({
    "es/replace.txt": "cf0c742753478ff30ad03367f8ea01525acab39913b1752b37d06a6cd5179bb2",
    "es/replace_custom.txt": "5746fe9aedececf1874ec080035c043e490c3f8cff4aa175ed0dc5007e6b27b3"
  });

  function createDataIndex(resource) {
    const sourceHashesMatch = resource?.sourceHashes
      && resource.sourceHashes["es/replace.txt"] === SOURCE_HASHES["es/replace.txt"]
      && resource.sourceHashes["es/replace_custom.txt"] === SOURCE_HASHES["es/replace_custom.txt"]
      && resource.sourceHashes["es/replace_verbs.txt"] === "1580320fb5a81889b32970a63f1075cc57cbac5ee4b8375379c5eb514fef80df";
    if (resource?.schemaVersion !== 1 || resource.language !== "es-ES"
        || !sourceHashesMatch
        || !Array.isArray(resource.entries) || resource.entryCount !== resource.entries.length) {
      throw new Error("El recurso SimpleReplace de es-ES no coincide con el snapshot verificado de LanguageTool.");
    }
    const byExactForm = new Map();
    const byLowerForm = new Map();
    for (const entry of resource.entries) {
      if (!Array.isArray(entry.wrongForms) || !Array.isArray(entry.suggestions) || !entry.suggestions.length) throw new Error("Entrada SimpleReplace de es-ES inválida.");
      for (const form of entry.wrongForms) {
        byExactForm.set(form, entry.suggestions);
        byLowerForm.set(form.toLocaleLowerCase("es"), entry.suggestions);
      }
    }
    return Object.freeze({ byExactForm, byLowerForm, entryCount: resource.entryCount, formCount: resource.formCount, sourceSha256: resource.sourceSha256 });
  }

  async function load({ url, fetcher = globalThis.fetch } = {}) {
    const resourceUrl = url || globalThis.chrome?.runtime?.getURL(RESOURCE_PATH);
    if (!resourceUrl) throw new Error("Cal indicar l'URL del recurs SimpleReplace es-ES.");
    const response = await fetcher(resourceUrl);
    if (!response.ok) throw new Error(`No s'ha pogut carregar SimpleReplace es-ES (${response.status}).`);
    return createDataIndex(await response.json());
  }

  function findMatches(sentenceSegments, data, shadowedIssues = []) {
    if (!data?.byExactForm || !data?.byLowerForm) throw new Error("Cal carregar primer les dades SimpleReplace es-ES.");
    const issues = [];
    for (const sentence of sentenceSegments || []) {
      const tokens = (sentence.tokens || []).filter(token => token.kind !== "space");
      for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (token.kind !== "word" || token.isImmunized || token.immunized || token.ignoredBySpeller) continue;
        // Spanish SimpleReplaceRule explicitly skips any token recognized by the POS tagger.
        if (token.readings?.some(reading => reading.tag)) continue;
        const lower = token.text.toLocaleLowerCase("es");
        const replacements = data.byExactForm.get(token.text) || data.byLowerForm.get(lower);
        if (!replacements) continue;
        const allUppercase = token.text !== lower && token.text === token.text.toLocaleUpperCase("es");
        const startsUppercase = /^\p{Lu}/u.test(token.text);
        const suggestions = [];
        for (const original of replacements) {
          let suggestion = allUppercase ? original.toLocaleUpperCase("es") : original;
          if (!allUppercase && startsUppercase) suggestion = suggestion.replace(/^\p{Ll}/u, first => first.toLocaleUpperCase("es"));
          if (suggestion !== token.text && !suggestions.includes(suggestion)) suggestions.push(suggestion);
        }
        if (!suggestions.length) continue;
        // Pipeline tokens already carry document-global UTF-16 offsets.
        const start = token.start, end = token.end;
        issues.push({
          id: `ES_SIMPLE_REPLACE_SIMPLE_${token.text.toLocaleUpperCase("es")}:${start}:${end}`,
          ruleId: `ES_SIMPLE_REPLACE_SIMPLE_${token.text.toLocaleUpperCase("es")}`,
          category: "spelling", severity: "warning", message: `¿Quería decir «${suggestions[0]}»?`,
          shortMessage: "Palabra incorrecta", text: token.text, start, end,
          replacementStart: start, replacementEnd: end, suggestions, rule: "ES_SIMPLE_REPLACE_SIMPLE",
          _family: "simple-replace"
        });
      }
    }
    return issues.filter(issue => !shadowedIssues.some(existing => existing.start === issue.start && existing.end === issue.end
      && existing.suggestions?.some(suggestion => issue.suggestions.includes(suggestion))));
  }

  globalThis.CorrectorSpanishSimpleReplace = Object.freeze({ RESOURCE_PATH, SOURCE_HASHES, createDataIndex, load, findMatches });
})();
