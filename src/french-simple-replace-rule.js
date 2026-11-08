/* French SimpleReplaceRule adapter for the proof-only French profile. */
(() => {
  "use strict";

  const RESOURCE_PATH = "build/resources/fr/fr-simple-replace.json";
  const SOURCE_HASHES = Object.freeze({
    "fr/replace.txt": "0aa0f938d87952d58882934a9e72f93b668cd0ff240c19f814f053a9c563e9c7",
    "fr/replace_custom.txt": "5746fe9aedececf1874ec080035c043e490c3f8cff4aa175ed0dc5007e6b27b3"
  });

  function createDataIndex(resource) {
    if (resource?.schemaVersion !== 1 || resource.language !== "fr"
        || resource.sourceHashes?.["fr/replace.txt"] !== SOURCE_HASHES["fr/replace.txt"]
        || resource.sourceHashes?.["fr/replace_custom.txt"] !== SOURCE_HASHES["fr/replace_custom.txt"]
        || !Array.isArray(resource.entries) || resource.entryCount !== resource.entries.length) {
      throw new Error("French SimpleReplace data do not match the pinned LanguageTool snapshot.");
    }
    const byExactForm = new Map();
    const byLowerForm = new Map();
    let formCount = 0;
    for (const entry of resource.entries) {
      if (!Array.isArray(entry.wrongForms) || !entry.wrongForms.length
          || !Array.isArray(entry.suggestions) || !entry.suggestions.length
          || entry.wrongForms.some(form => typeof form !== "string" || !form)
          || entry.suggestions.some(value => typeof value !== "string" || !value)) {
        throw new Error("Invalid French SimpleReplace entry.");
      }
      for (const form of entry.wrongForms) {
        const key = form;
        // LanguageTool's loader uses Map.put, so a later source entry wins.
        byExactForm.set(form, entry.suggestions);
        byLowerForm.set(key, entry.suggestions);
        formCount++;
      }
    }
    if (resource.formCount !== formCount) throw new Error("French SimpleReplace form count is invalid.");
    return Object.freeze({ byExactForm, byLowerForm, entryCount: resource.entryCount, formCount });
  }

  async function load({ url, fetcher = globalThis.fetch } = {}) {
    const resourceUrl = url || globalThis.chrome?.runtime?.getURL(RESOURCE_PATH);
    if (!resourceUrl || typeof fetcher !== "function") throw new Error("A French SimpleReplace resource URL and fetcher are required.");
    const response = await fetcher(resourceUrl);
    if (!response.ok) throw new Error(`French SimpleReplace resource is unavailable (${response.status}).`);
    return createDataIndex(await response.json());
  }

  function findMatches(rows, data, lexicalData, personalWords = [], shadowedIssues = []) {
    if (!data?.byExactForm || !data?.byLowerForm || !lexicalData) throw new Error("French SimpleReplace data and lexical resources must be loaded first.");
    const personal = new Set((Array.isArray(personalWords) ? personalWords : []).map(word => String(word).trim().toLocaleLowerCase("fr")).filter(Boolean));
    const issues = [];
    for (const token of rows || []) {
      if (!token || token.isImmunized || token.immunized || token.ignoredBySpeller || !/^\p{L}+$/u.test(token.token)) continue;
      const lower = token.token.toLocaleLowerCase("fr");
      // Match LanguageTool's ignoreTaggedWords and isIgnoredBySpeller defaults.
      if (token.analysis?.lexical || token.ltReadings?.some(reading => reading.tag && reading.tag !== "UNKNOWN")
          || lexicalData.ignoredSet?.has(lower) || personal.has(lower)) continue;
      const replacements = data.byExactForm.get(token.token) || data.byLowerForm.get(lower);
      if (!replacements) continue;
      const allUppercase = token.token !== lower && token.token === token.token.toLocaleUpperCase("fr");
      const startsUppercase = /^\p{Lu}/u.test(token.token);
      const suggestions = [];
      for (const source of replacements) {
        let suggestion = allUppercase ? source.toLocaleUpperCase("fr") : source;
        if (!allUppercase && startsUppercase) suggestion = suggestion.replace(/^\p{Ll}/u, first => first.toLocaleUpperCase("fr"));
        if (suggestion !== token.token && !suggestions.includes(suggestion)) suggestions.push(suggestion);
      }
      if (!suggestions.length) continue;
      const { start, end } = token;
      issues.push({
        id: `FR_SIMPLE_REPLACE_SIMPLE_${token.token.toLocaleUpperCase("fr")}:${start}:${end}`,
        ruleId: `FR_SIMPLE_REPLACE_SIMPLE_${token.token.toLocaleUpperCase("fr")}`,
        category: "spelling", severity: "warning",
        message: `Vouliez-vous dire « ${suggestions[0]} » ?`, shortMessage: "Mot incorrect",
        text: token.token, start, end, replacementStart: start, replacementEnd: end,
        suggestions, rule: "FR_SIMPLE_REPLACE_SIMPLE", _family: "simple-replace"
      });
    }
    return issues.filter(issue => !shadowedIssues.some(existing => existing.start === issue.start && existing.end === issue.end
      && existing.suggestions?.some(suggestion => issue.suggestions.includes(suggestion))));
  }

  globalThis.CorrectorFrenchSimpleReplaceRule = Object.freeze({ RESOURCE_PATH, SOURCE_HASHES, createDataIndex, load, findMatches });
})();
