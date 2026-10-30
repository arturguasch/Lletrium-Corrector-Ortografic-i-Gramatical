/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Offline en-US port of LanguageTool's SimpleReplaceRule/AmericanReplaceRule tables. */
(() => {
  "use strict";

  const MAX_TOKENS = 20;

  function hasLetters(value) { return /[\p{Lu}\p{Ll}\p{Lt}]/u.test(value); }
  function isAllUppercase(value) {
    const letters = [...value].filter(char => /[\p{Lu}\p{Ll}\p{Lt}]/u.test(char));
    return letters.length > 0 && letters.every(char => char === char.toLocaleUpperCase("en-US"));
  }
  function isCapitalized(value) {
    const chars = [...value];
    return chars.length > 0 && chars[0] === chars[0].toLocaleUpperCase("en-US")
      && chars.slice(1).every(char => !/\p{L}/u.test(char) || char === char.toLocaleLowerCase("en-US"));
  }
  function isCamelCase(value) {
    return /\p{Ll}/u.test(value) && /\p{Lu}/u.test([...value].slice(1).join(""));
  }
  function upperFirst(value) {
    const first = [...value][0];
    return first ? first.toLocaleUpperCase("en-US") + value.slice(first.length) : value;
  }
  function isPunctuationStart(token) {
    return /\p{N}/u.test(token) || /^[\p{P}\p{S}]+$/u.test(token) || !/[\p{L}\p{N}]/u.test(token);
  }
  function hasWhitespaceBefore(words, index, sourceText) {
    const token = words[index];
    if (typeof token.whitespaceBefore === "boolean") return token.whitespaceBefore;
    const previous = words[index - 1];
    return Boolean(previous && /[\s\p{Z}]/u.test(sourceText.slice(previous.end, token.start)));
  }

  class EnglishSimpleReplace {
    constructor(resource) {
      if (resource?.schemaVersion !== 1 || resource.profile !== "en-US"
          || resource.source !== "LanguageTool 6.9-SNAPSHOT AbstractSimpleReplaceRule2"
          || resource.groups?.length !== 6) throw new Error("The English simple-replace tables are incomplete.");
      this.groups = new Map();
      for (const group of resource.groups) {
        const expected = group.family === "EN_SIMPLE_REPLACE" ? 214
          : group.family === "EN_DIACRITICS_REPLACE_ORTHOGRAPHY" ? 1220
              : group.family === "EN_US_SIMPLE_REPLACE" ? 31
                : group.family === "EN_PLAIN_ENGLISH_REPLACE" ? 692
                  : group.family === "EN_REDUNDANCY_REPLACE" ? 706
                    : group.family === "PROFANITY" ? 529 : null;
        if (expected == null || group.entryCount !== expected || group.entries?.length !== expected) {
          throw new Error(`The ${group.family} table differs from the pinned LanguageTool inventory.`);
        }
        const expectedHashes = group.family === "EN_SIMPLE_REPLACE"
          ? { "replace.txt": "0441eed8b4143cae9e9ef2cc213da65eb3c9602f1f8dd970a90ac197488083a0",
            "replace_custom.txt": "5746fe9aedececf1874ec080035c043e490c3f8cff4aa175ed0dc5007e6b27b3" }
          : group.family === "EN_DIACRITICS_REPLACE_ORTHOGRAPHY"
            ? { "diacritics.txt": "116f50bf038c50dcdc425fb877a3b2ed3476d9afb337914f4fc13c08871a2a39" }
          : group.family === "EN_US_SIMPLE_REPLACE" ? { "en-US/replace.txt": "d58b75555cf1283b6cbf80c08e41ff77e0a745abf5f6a7abdbc28e09dbbb76b9" }
            : group.family === "EN_PLAIN_ENGLISH_REPLACE" ? { "wordiness.txt": "8aa69517b8aab6a8b75238ae6d95fcf46ba3c927de9e7338a2aa2fb5c3cac60a" }
              : group.family === "EN_REDUNDANCY_REPLACE" ? { "redundancies.txt": "83971b92ca0be865ed3dc05c1e62328a5887472a4e1478b20535d5cdcb1dc371" }
                : { "replace_profanity.txt": "3c4ce23d58640f39e9d9d0bc0b2e619541ecf3488b6ffbb4a9c82e3b38ba197b" };
        if (JSON.stringify(group.sourceHashes) !== JSON.stringify(expectedHashes)) throw new Error(`The ${group.family} source hashes are not pinned.`);
        const entries = new Map();
        for (const entry of group.entries) {
          if (!entry.wrong || !Array.isArray(entry.replacement)
              || (group.family === "PROFANITY" ? entry.replacement.length !== 0
                : !entry.replacement.length && !["EN_PLAIN_ENGLISH_REPLACE", "EN_REDUNDANCY_REPLACE"].includes(group.family))) throw new Error(`Invalid ${group.family} table entry.`);
          entries.set(entry.wrong, entry);
        }
        this.groups.set(group.family, entries);
      }
    }

    check(tokens, sourceText, checkLevel = "DEFAULT", enabledRuleIds = []) {
      const words = tokens.filter(token => token.kind !== "space");
      const results = [];
      const enabledRules = enabledRuleIds instanceof Set ? enabledRuleIds : new Set(Array.isArray(enabledRuleIds) ? enabledRuleIds : []);
      for (const [family, entries] of this.groups) {
        if (family === "PROFANITY" && checkLevel !== "PICKY") continue;
        if (["EN_PLAIN_ENGLISH_REPLACE", "EN_REDUNDANCY_REPLACE"].includes(family) && !enabledRules.has(family)) continue;
        const candidates = [];
        let sentenceStart = 0;
        while (sentenceStart < words.length && isPunctuationStart(words[sentenceStart].text)) sentenceStart++;
        for (let start = sentenceStart; start < words.length; start++) {
          const first = words[start];
          if (!first.text) continue;
          let concatenated = "";
          for (let end = start; end < words.length && end - start < MAX_TOKENS; end++) {
            if (end > start && hasWhitespaceBefore(words, end, sourceText)) break;
            concatenated += words[end].text;
            const entry = entries.get(concatenated.toLocaleLowerCase("en-US"));
            if (entry) candidates.push({ start, end, matched: concatenated, entry });
          }

          let phrase = "", spaces = 0;
          for (let end = start; end < words.length && end - start < MAX_TOKENS; end++) {
            if (end > start && hasWhitespaceBefore(words, end, sourceText)) { phrase += " "; spaces++; }
            phrase += words[end].text;
            if (spaces + 1 > 20) break;
            if (!spaces) continue;
            const entry = entries.get(phrase.toLocaleLowerCase("en-US"));
            if (entry) candidates.push({ start, end, matched: phrase, entry });
          }
        }

        candidates.sort((a, b) => a.start - b.start || b.end - a.end);
        const selected = [];
        for (const candidate of candidates) {
          if (selected.some(item => candidate.start >= item.start && candidate.end <= item.end)) continue;
          selected.push(candidate);
        }
        for (const match of selected) {
          const original = match.matched;
          const suggestions = match.entry.replacement;
          if (!suggestions.length) continue;
          if (family === "PROFANITY") {
            const start = words[match.start].start, end = words[match.end].end;
            results.push({ id: `PROFANITY:${start}:${end}`, ruleId: "PROFANITY", category: "style", severity: "warning",
              message: "This expression can be considered offensive.", shortMessage: "Profanity",
              text: sourceText.slice(start, end), start, end, replacementStart: start, replacementEnd: end, suggestions: [] });
            continue;
          }
          const camelSuggestion = suggestions.some(item => isCamelCase(item.split(" ")[0]));
          const allUpper = isAllUppercase(original);
          const capitalized = isCapitalized(original.split(" ")[0]);
          const atSentenceStart = match.start === sentenceStart;
          const adjusted = suggestions.map(value => {
            let finalValue = value;
            if (!camelSuggestion && (atSentenceStart || capitalized)) finalValue = upperFirst(finalValue);
            if (allUpper) finalValue = finalValue.toLocaleUpperCase("en-US");
            return finalValue;
          });
          if (adjusted.some(value => value === original)) continue;

          const start = words[match.start].start, end = words[match.end].end;
          const displayedSuggestions = [...new Set(adjusted)];
          const message = family === "EN_REDUNDANCY_REPLACE"
            ? `'${original}' is a redundancy. In some cases, it might be preferable to use ${displayedSuggestions.map(value => `“${value}”`).join(" or ")}.`
            : family === "EN_PLAIN_ENGLISH_REPLACE"
              ? `'${original}' is a wordy or complex expression. In some cases, it might be preferable to use ${displayedSuggestions.map(value => `“${value}”`).join(" or ")}.`
            : family === "EN_US_SIMPLE_REPLACE"
            ? `'${original}' is a common British expression. Consider using expressions more common to American English.`
            : family === "EN_DIACRITICS_REPLACE_ORTHOGRAPHY"
              ? `'${original}' is an imported foreign name or expression, which originally has a diacritic.`
              : match.entry.message || `Did you mean ${displayedSuggestions.map(value => `“${value}”`).join(", ")}?`;
          const category = family === "EN_US_SIMPLE_REPLACE" || family === "EN_PLAIN_ENGLISH_REPLACE" || family === "EN_REDUNDANCY_REPLACE" ? "style"
            : family === "EN_DIACRITICS_REPLACE_ORTHOGRAPHY" ? "spelling" : "misc";
          results.push({
            id: `${family}:${start}:${end}`, ruleId: family,
            category,
            severity: "warning", message,
            shortMessage: family === "EN_REDUNDANCY_REPLACE" ? "Redundancy"
              : family === "EN_PLAIN_ENGLISH_REPLACE" ? "Wordiness"
              : family === "EN_US_SIMPLE_REPLACE" ? "British word"
              : family === "EN_DIACRITICS_REPLACE_ORTHOGRAPHY" ? "The original word has a diacritic" : "Wrong word",
            text: sourceText.slice(start, end), start, end,
            replacementStart: start, replacementEnd: end, suggestions: displayedSuggestions,
            ...(family === "EN_DIACRITICS_REPLACE_ORTHOGRAPHY" ? { suggestionsSeparator: " or " } : {})
          });
        }
      }
      return results;
    }

    static async load({ url, fetcher = globalThis.fetch } = {}) {
      if (!url || typeof fetcher !== "function") throw new Error("An en-US simple-replace resource URL and fetcher are required.");
      const response = await fetcher(url);
      if (!response.ok) throw new Error(`Could not load en-US simple-replace tables (${response.status}).`);
      return new EnglishSimpleReplace(await response.json());
    }
  }

  globalThis.CorrectorEnglishSimpleReplace = EnglishSimpleReplace;
})();
