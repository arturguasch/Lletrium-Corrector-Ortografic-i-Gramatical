/* Spanish CompoundRule table and runtime, derived from LanguageTool (LGPL-2.1-or-later). */
(() => {
  "use strict";

  const RESOURCE_PATH = "build/resources/es-ES/es-compounds.json";
  const SOURCE_SHA256 = "25918e9cd40a23a5db5746b885b454cdbfc88d55797eccaadbb577c194bbc939";

  function createDataIndex(resource) {
    if (resource?.schemaVersion !== 1 || resource.language !== "es-ES" || resource.sourceSha256 !== SOURCE_SHA256
        || resource.entryCount !== 461 || resource.entries?.length !== 461) throw new Error("El recurso ES_COMPOUNDS no coincide con el snapshot verificado de LanguageTool.");
    const byForm = new Map();
    const firstWords = new Set();
    for (const entry of resource.entries) {
      if (typeof entry.form !== "string" || !Array.isArray(entry.terms) || entry.terms.length < 2 || entry.terms.length > 5) throw new Error("Entrada de ES_COMPOUNDS inválida.");
      const previous = byForm.get(entry.form);
      byForm.set(entry.form, previous ? Object.freeze({
        ...previous,
        allowJoined: previous.allowJoined || entry.allowJoined,
        allowHyphen: previous.allowHyphen || entry.allowHyphen,
        lowercaseJoined: previous.lowercaseJoined || entry.lowercaseJoined
      }) : entry);
      firstWords.add(entry.terms[0]);
    }
    return Object.freeze({ byForm, firstWords, entryCount: resource.entryCount, sourceSha256: resource.sourceSha256 });
  }

  async function load({ url, fetcher = globalThis.fetch } = {}) {
    const resourceUrl = url || globalThis.chrome?.runtime?.getURL(RESOURCE_PATH);
    if (!resourceUrl) throw new Error("Cal indicar l'URL del recurs ES_COMPOUNDS.");
    const response = await fetcher(resourceUrl);
    if (!response.ok) throw new Error(`No s'ha pogut carregar ES_COMPOUNDS (${response.status}).`);
    return createDataIndex(await response.json());
  }

  function normalize(value) {
    return String(value ?? "").trim().replace(/\s+-\s+/gu, " ").replaceAll("-", " ").replace(/\s+/gu, " ").toLocaleLowerCase("es");
  }

  function isCorrectSpell(form, morphology) {
    // AbstractCompoundRule delegates to isCorrectSpell(); Spanish's override
    // defines it as "tagger has a reading", so known joined/hyphenated forms
    // remain eligible as suggestions.
    return globalThis.CorrectorSpanishTagger.tagToken({ text: form, kind: "word" }, morphology).known;
  }

  function findMatches(sentences, data, morphology) {
    if (!data?.byForm || !morphology) throw new Error("Cal carregar les dades i el tagger per executar ES_COMPOUNDS.");
    const results = [];
    const emittedStarts = new Map();
    for (const sentence of sentences || []) {
      const tokens = (sentence.tokens || []).filter(token => token.kind !== "space");
      let occupiedThrough = -1;
      for (let startIndex = 0; startIndex < tokens.length; startIndex++) {
        if (startIndex <= occupiedThrough) continue;
        if (tokens[startIndex].kind !== "word" || !data.firstWords.has(tokens[startIndex].text.toLocaleLowerCase("es"))) continue;
        const endLimit = Math.min(tokens.length, startIndex + 5);
        let best = null;
        for (let endIndex = startIndex + 1; endIndex < endLimit; endIndex++) {
          const slice = tokens.slice(startIndex, endIndex + 1);
          if (slice.some(token => token.kind !== "word" && token.text !== "-")) break;
          let original = "";
          for (const token of slice) {
            if (original && token.whitespaceBefore) original += " ";
            original += token.text;
          }
          const form = normalize(original);
          const entry = data.byForm.get(form);
          if (!entry) continue;
          if (entry.allowHyphen && !original.includes(" ") && original.includes("-")) continue;
          const parts = original.split(/\s+/u);
          const replacements = [];
          if (entry.allowHyphen) replacements.push(original.replace(/\s+/gu, "-").replace(/--+/gu, "-"));
          const allUpper = parts.every(part => part === part.toLocaleUpperCase("es"));
          if (entry.allowJoined && !allUpper) {
            const joinedParts = original.replaceAll("-", " ").split(/\s+/u);
            const joined = joinedParts.map((part, index) => entry.lowercaseJoined && index > 0
              ? part.replace(/^\p{Lu}/u, first => first.toLocaleLowerCase("es")) : part).join("");
            replacements.push(joined);
          }
          // Upstream explicitly requires a hyphen when the first compound
          // component is one character (for example, `e-mail`), even if the
          // joined spelling happens to be present in the local POS dictionary.
          if (original.split(/\s+/u)[0]?.length === 1) {
            replacements.length = 0;
            if (entry.allowHyphen) replacements.push(original.replace(/\s+/gu, "-").replace(/--+/gu, "-"));
          }
          const valid = [...new Set(replacements)].filter(value => value !== original && isCorrectSpell(value, morphology));
          if (valid.length) {
            // In technical names led by an uppercase acronym, a numeric tail
            // belongs to the compound (`SARS CoV 2`). Do not extend ordinary
            // prefixed forms such as `anti COVID 19` or `pos COVID 19`.
            if (/^(?=.*\p{Lu})[\p{Lu}\p{N}]{2,}$/u.test(tokens[startIndex].text)) {
              for (let longerEnd = endIndex + 1; longerEnd < endLimit; longerEnd++) {
                const longerSlice = tokens.slice(startIndex, longerEnd + 1);
                if (longerSlice.some(token => token.kind !== "word" && token.text !== "-")) break;
                const longerOriginal = longerSlice.map((token, index) => `${index && token.whitespaceBefore ? " " : ""}${token.text}`).join("");
                const longerEntry = data.byForm.get(normalize(longerOriginal));
                if (!longerEntry || !longerEntry.terms.some(term => /^\d+$/u.test(term)) || !longerEntry.allowHyphen) continue;
                const suggestion = longerOriginal.replace(/\s+/gu, "-").replace(/--+/gu, "-");
                if (suggestion !== longerOriginal && isCorrectSpell(suggestion, morphology)) {
                  best = { entry: longerEntry, original: longerOriginal, tokens: longerSlice, startIndex, endIndex: longerEnd,
                    replacements: [suggestion] };
                  break;
                }
              }
            }
            if (!best) best = { entry, original, tokens: slice, startIndex, endIndex, replacements: valid };
            break;
          }
        }
        if (!best) continue;
        const start = best.tokens[0].start, end = best.tokens.at(-1).end;
        const previous = emittedStarts.get(start);
        if (previous && previous.end >= end) continue;
        const entry = best.entry;
        const message = best.replacements.length === 1
          ? entry.allowHyphen && best.replacements[0].includes("-") ? "Se escribe con un guion." : "Se escribe junto sin espacio ni guion."
          : "Se escribe junto o con un guion.";
        const issue = { id: `ES_COMPOUNDS_${entry.form.replaceAll(" ", "_")}:${start}:${end}`, ruleId: "ES_COMPOUNDS", category: "spelling", severity: "warning",
          message, shortMessage: "Error de palabra compuesta", text: best.original, start, end, replacementStart: start, replacementEnd: end,
          suggestions: best.replacements, rule: "ES_COMPOUNDS", _family: "compounds" };
        if (previous) results.splice(results.indexOf(previous), 1);
        results.push(issue);
        emittedStarts.set(start, issue);
        occupiedThrough = best.endIndex;
      }
    }
    return results;
  }

  globalThis.CorrectorSpanishCompounds = Object.freeze({ RESOURCE_PATH, SOURCE_SHA256, createDataIndex, load, findMatches });
})();
