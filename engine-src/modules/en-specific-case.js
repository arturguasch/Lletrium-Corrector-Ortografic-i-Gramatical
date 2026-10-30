/* Local en-US port of LanguageTool's table-driven EnglishSpecificCaseRule. */
(() => {
  "use strict";

  let entriesByLowercase = null;
  let maxWordCount = 0;

  function isAllUppercase(value) {
    const letters = [...value].filter(char => /[\p{Lu}\p{Ll}\p{Lt}]/u.test(char));
    return letters.length > 0 && letters.every(char => char === char.toLocaleUpperCase("en-US"));
  }

  function allWordsCapitalized(value) {
    return value.split(" ").every(word => {
      const first = [...word][0];
      return Boolean(first && first === first.toLocaleUpperCase("en-US"));
    });
  }

  class EnglishSpecificCaseRule {
    constructor(entries) {
      if (!Array.isArray(entries) || entries.length !== 5540 || entries.some(value => typeof value !== "string" || !value.trim())) {
        throw new Error("The en-US specific-case table is incomplete.");
      }
      entriesByLowercase = new Map();
      for (const phrase of entries) {
        const normalized = phrase.toLocaleLowerCase("en-US");
        entriesByLowercase.set(normalized, phrase);
        maxWordCount = Math.max(maxWordCount, phrase.split(" ").length);
      }
    }

    check(tokens) {
      if (!entriesByLowercase) throw new Error("The en-US specific-case table is not loaded.");
      const words = tokens.filter(token => token.kind !== "space");
      const issues = [];
      for (let start = 0; start < words.length; start++) {
        const parts = [];
        for (let end = start; end < words.length && parts.length < maxWordCount; end++) {
          parts.push(words[end].text);
          const current = parts.join(" ");
          const desired = entriesByLowercase.get(current.toLocaleLowerCase("en-US"));
          if (!desired || isAllUppercase(current) || current === desired) continue;
          const startsSentence = words[start].sentenceStart === true;
          if (startsSentence && !/^\p{Lu}/u.test(desired)) continue;
          issues.push({
            id: `EN_SPECIFIC_CASE:${words[start].start}:${words[end].end}`,
            ruleId: "EN_SPECIFIC_CASE",
            category: "casing",
            severity: "warning",
            message: allWordsCapitalized(desired)
              ? "If the term is a proper noun, use initial capitals."
              : "If the term is a proper noun, use the suggested capitalization.",
            shortMessage: "Proper noun",
            text: "",
            start: words[start].start,
            end: words[end].end,
            replacementStart: words[start].start,
            replacementEnd: words[end].end,
            suggestions: [desired]
          });
        }
      }
      return issues;
    }

    static async load({ url, fetcher = globalThis.fetch } = {}) {
      if (!url || typeof fetcher !== "function") throw new Error("An en-US specific-case resource URL and fetcher are required.");
      const response = await fetcher(url);
      if (!response.ok) throw new Error(`Could not load the en-US specific-case table (${response.status}).`);
      const resource = await response.json();
      if (resource?.schemaVersion !== 1 || resource.profile !== "en-US"
          || resource.source !== "LanguageTool 6.9-SNAPSHOT EnglishSpecificCaseRule"
          || resource.sourceSha256 !== "aa82462f1dcdee4afa873e818911aab45b88f8edda0b830b295b3c416cfce53f"
          || resource.entryCount !== 5540 || resource.entries?.length !== 5540) {
        throw new Error("The en-US specific-case table does not match the pinned LanguageTool source.");
      }
      return new EnglishSpecificCaseRule(resource.entries);
    }
  }

  globalThis.CorrectorEnglishSpecificCase = EnglishSpecificCaseRule;
})();
