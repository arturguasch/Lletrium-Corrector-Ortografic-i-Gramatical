/* Proof-only adapter for LanguageTool's French CompoundRule. */
(() => {
  "use strict";

  const RESOURCE_URL = "build/resources/fr/fr-compounds.json";
  const SOURCE_SHA256 = "f7095d04e9e8a2ed077a9a33930f779a77ee6f7b003a6db3cf7953b52e79ec27";
  const DASHES = /--+/gu;
  const normalize = value => String(value ?? "").trim().replace(/\s+-\s+/gu, " ").replaceAll("-", " ").replace(/\s+/gu, " ").toLocaleLowerCase("fr");

  function createDataIndex(resource) {
    if (resource?.schemaVersion !== 1 || resource.language !== "fr-FR" || resource.sourceSha256 !== SOURCE_SHA256
        || resource.entryCount !== 1372 || resource.entries?.length !== 1372) throw new Error("French compound resource does not match the pinned LanguageTool snapshot.");
    const byForm = new Map();
    const firstWords = new Set();
    for (const entry of resource.entries) {
      if (typeof entry.form !== "string" || !Array.isArray(entry.terms) || entry.terms.length < 2 || entry.terms.length > 5) throw new Error("Invalid French compound entry.");
      const prior = byForm.get(entry.form);
      byForm.set(entry.form, prior ? Object.freeze({ ...prior, dash: prior.dash || entry.dash, joined: prior.joined || entry.joined, lowercaseMidWords: prior.lowercaseMidWords || entry.lowercaseMidWords }) : entry);
      firstWords.add(entry.terms[0]);
    }
    return Object.freeze({ byForm, firstWords, entryCount: resource.entryCount, sourceSha256: resource.sourceSha256 });
  }

  async function load({ fetcher = globalThis.fetch } = {}) {
    const url = globalThis.chrome?.runtime?.getURL(RESOURCE_URL) || new URL(`../${RESOURCE_URL}`, globalThis.location?.href || "http://localhost/");
    const response = await fetcher(url);
    if (!response.ok) throw new Error(`French compound data unavailable (${response.status}).`);
    return createDataIndex(await response.json());
  }

  function isCorrect(form, lexicalData) { return lexicalData.lookup(form).length > 0; }

  function findMatches(text, rows, sentenceTokenizer, data, lexicalData) {
    if (!data?.byForm || !lexicalData || typeof text !== "string") throw new Error("French compound rule is missing its data or lexical reader.");
    const results = [];
    for (const sentence of sentenceTokenizer.segment(text)) {
      const tokens = rows.filter(row => row.start >= sentence.start && row.end <= sentence.end);
      for (let start = 0; start < tokens.length; start++) {
        const first = tokens[start];
        if (!/^\p{L}[\p{L}\p{M}'’]*$/u.test(first.token) || !data.firstWords.has(first.token.toLocaleLowerCase("fr"))) continue;
        let matched = null;
        let raw = "";
        for (let end = start; end < Math.min(tokens.length, start + 5); end++) {
          const token = tokens[end];
          if (end > start && token.start > tokens[end - 1].end && !/^\s+$/u.test(text.slice(tokens[end - 1].end, token.start))) break;
          if (!/^\p{L}[\p{L}\p{M}'’]*$/u.test(token.token) && token.token !== "-") break;
          if (raw) raw += text.slice(tokens[end - 1].end, token.start);
          raw += token.token;
          const key = normalize(raw);
          const entry = data.byForm.get(key);
          if (!entry || end === start) continue;
          // LanguageTool suppresses a compound already correctly joined when
          // its data says a hyphen is required; this also prevents “videoclip”.
          if (entry.dash && !raw.includes(" ") && raw.includes("-")) break;
          matched = { entry, raw, start: first.start, end: token.end, endIndex: end };
        }
        if (!matched) continue;
        const { entry } = matched;
        const suggestions = [];
        if (entry.dash) suggestions.push(matched.raw.replace(/\s+/gu, "-").replace(DASHES, "-"));
        const allUpper = [...matched.raw].filter(char => /\p{L}/u.test(char)).every(char => char === char.toLocaleUpperCase("fr"));
        if (entry.joined && !allUpper) {
          const joined = matched.raw.replaceAll("-", " ").split(/\s+/u).map((part, i) => entry.lowercaseMidWords && i > 0 ? part.replace(/^\p{Lu}/u, ch => ch.toLocaleLowerCase("fr")) : part).join("");
          suggestions.push(joined);
        }
        const valid = [...new Set(suggestions)].filter(suggestion => suggestion !== matched.raw && isCorrect(suggestion, lexicalData));
        if (!valid.length) continue;
        const message = valid.length > 1 ? "Écrivez avec un mot seul ou avec trait d’union."
          : valid[0].includes("-") ? "Écrivez avec un trait d’union."
            : "Écrivez avec un mot seul sans espace ni trait d’union.";
        results.push({ id: `FR_COMPOUNDS_${entry.form.replaceAll(" ", "_")}:${matched.start}:${matched.end}`, ruleId: "FR_COMPOUNDS", category: "spelling", severity: "warning", message, shortMessage: "Erreur de trait d’union", text: text.slice(matched.start, matched.end), start: matched.start, end: matched.end, replacementStart: matched.start, replacementEnd: matched.end, suggestions: valid, rule: "FR_COMPOUNDS", _family: "compounds" });
        start = matched.endIndex;
      }
    }
    return results;
  }

  globalThis.CorrectorFrenchCompoundsRule = Object.freeze({ RESOURCE_URL, SOURCE_SHA256, createDataIndex, load, findMatches });
})();
