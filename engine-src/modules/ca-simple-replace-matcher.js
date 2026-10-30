/* Literal replacement matcher for LanguageTool AbstractSimpleReplaceRule2 tables. */
(() => {
  "use strict";

  const RESOURCE_PATH = "build/resources/ca-simple-replace-multiwords.json";
  const EXPECTED_SOURCE_SHA256 = "150f014fd9c3085bdc69bc44dd7309f02e078a119ff79d9d334a39f974e0d750";
  let entries = [];
  let byWrongForm = new Map();
  let loadPromise = null;

  async function load({ url, fetcher = globalThis.fetch } = {}) {
    if (!loadPromise) {
      loadPromise = (async () => {
        const resourceUrl = url || globalThis.chrome?.runtime?.getURL(RESOURCE_PATH);
        if (!resourceUrl) throw new Error("Cal indicar la URL del recurs SimpleReplace fora de l'extensió.");
        const response = await fetcher(resourceUrl);
        if (!response.ok) throw new Error(`No s'ha pogut carregar el recurs SimpleReplace (${response.status}).`);
        const resource = await response.json();
        if (resource?.schemaVersion !== 1 || resource.language !== "ca-ES"
            || resource.sourceSha256 !== EXPECTED_SOURCE_SHA256
            || resource.entryCount !== resource.entries?.length || !Array.isArray(resource.entries)) {
          throw new Error("Recurs SimpleReplace incompatible o no verificat.");
        }
        entries = resource.entries;
        byWrongForm = new Map();
        for (const entry of entries) for (const form of entry.wrongForms) byWrongForm.set(form, entry);
        return { loadedEntries: entries.length, sourceSha256: resource.sourceSha256 };
      })().catch(error => { loadPromise = null; throw error; });
    }
    return loadPromise;
  }

  function findMatches(tokens, sourceText) {
    if (!entries.length) throw new Error("Cal carregar primer el recurs SimpleReplace.");
    const words = tokens.filter(token => token.kind !== "space");
    const matches = [];
    for (let start = 0; start < words.length; start++) {
      if (/^[\p{P}\p{S}\d]+$/u.test(words[start].text)) continue;
      const joined = [];
      let spaces = 0;
      let best = null;
      for (let end = start; end < words.length && end - start < 10; end++) {
        if (end > start) {
          const between = sourceText.slice(words[end - 1].end, words[end].start);
          if (!between) { /* Adjacent punctuation is appended once below. */ }
          else if (/^\s+$/u.test(between)) {
            joined.push(" ");
            spaces++;
          } else break;
        }
        if (end - start >= 10 || spaces + 1 > 10) break;
        joined.push(words[end].text);
        const key = joined.join("").toLocaleLowerCase("ca");
        const entry = byWrongForm.get(key);
        if (entry) best = { entry, start, end };
      }
      if (!best) continue;
      const { entry } = best;
      const from = words[best.start].start;
      const to = words[best.end].end;
      const matchedText = sourceText.slice(from, to);
      const replacements = entry.suggestions.slice();
      const allUppercase = !/[\p{Ll}]/u.test(matchedText) && /\p{Lu}/u.test(matchedText);
      const capitalized = /^\p{Lu}/u.test(matchedText);
      const sentenceStart = Boolean(words[best.start].sentenceStart);
      const camelCaseSuggestion = replacements.some(value => /^[\p{Ll}]+\p{Lu}[\p{L}\p{N}]+/u.test(value.split(/\s+/u)[0] || ""));
      const finalSuggestions = [];
      for (const replacement of replacements) {
        let value = replacement;
        if (allUppercase) value = value.toLocaleUpperCase("ca");
        else if (!camelCaseSuggestion && (sentenceStart || capitalized)) value = value.replace(/^\p{Ll}/u, first => first.toLocaleUpperCase("ca"));
        if (value !== matchedText && !finalSuggestions.includes(value)) finalSuggestions.push(value);
      }
      if (!finalSuggestions.length) continue;
      matches.push({
        id: `CA_SIMPLE_REPLACE_MULTIWORDS:${from}:${to}`,
        ruleId: "CA_SIMPLE_REPLACE_MULTIWORDS",
        category: "grammar",
        severity: "warning",
        message: entry.message || "Expressió incorrecta.",
        text: matchedText,
        start: from,
        end: to,
        replacementStart: from,
        replacementEnd: to,
        suggestions: finalSuggestions,
        rule: "CA_SIMPLE_REPLACE_MULTIWORDS",
        _ruleId: "CA_SIMPLE_REPLACE_MULTIWORDS",
        _from: from,
        _to: to,
        _priority: 70,
        _picky: false,
        _includedAllAtOnce: true,
        _registrationOrder: -1,
        _family: "simple-replace"
      });
    }
    return matches;
  }

  globalThis.CorrectorCatalanSimpleReplaceMatcher = Object.freeze({ load, findMatches, getEntryCount: () => entries.length });
})();
