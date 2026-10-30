/* Case-sensitive offline port of LanguageTool's ContractionSpellingRule. */
(() => {
  "use strict";

  class EnglishContractionSpelling {
    constructor(resource) {
      if (resource?.schemaVersion !== 1 || resource.profile !== "en-US"
          || resource.source !== "LanguageTool 6.9-SNAPSHOT ContractionSpellingRule"
          || resource.entryCount !== 179 || resource.entries?.length !== 179
          || resource.sourceSha256 !== "8244e543b9743c5e53b830c3e788a7b50098960c73011c0252ee1cda79daebe0") {
        throw new Error("The en-US contraction-spelling table is incomplete or has drifted.");
      }
      this.entries = new Map(resource.entries.map(entry => [entry.wrong, entry.replacements]));
    }

    check(sentence) {
      const issues = [];
      for (const token of sentence.tokens) {
        if (token.kind === "space" || token.kind !== "word") continue;
        const suggestions = this.entries.get(token.text);
        if (!suggestions?.length) continue;
        const replacements = [...suggestions].filter(value => value !== token.text);
        if (!replacements.length) continue;
        issues.push({ id: `EN_CONTRACTION_SPELLING:${token.start}:${token.end}`,
          ruleId: "EN_CONTRACTION_SPELLING", category: "typos", severity: "warning",
          message: "Possible spelling mistake found.", shortMessage: "Spelling mistake",
          text: token.text, start: token.start, end: token.end,
          replacementStart: token.start, replacementEnd: token.end, suggestions: replacements });
      }
      return issues;
    }

    static async load({ url, fetcher = globalThis.fetch } = {}) {
      if (!url || typeof fetcher !== "function") throw new Error("An en-US contraction resource URL and fetcher are required.");
      const response = await fetcher(url);
      if (!response.ok) throw new Error(`Could not load en-US contractions (${response.status}).`);
      return new EnglishContractionSpelling(await response.json());
    }
  }
  globalThis.CorrectorEnglishContractionSpelling = EnglishContractionSpelling;
})();
