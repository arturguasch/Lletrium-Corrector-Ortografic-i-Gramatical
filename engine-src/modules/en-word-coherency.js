/* Offline document-level port of LanguageTool's English WordCoherencyRule. */
(() => {
  "use strict";

  class EnglishWordCoherency {
    constructor(resource) {
      if (resource?.schemaVersion !== 1 || resource.profile !== "en-US"
          || resource.source !== "LanguageTool 6.9-SNAPSHOT WordCoherencyRule"
          || resource.entryCount !== 2479 || resource.pairs?.length !== 2479
          || resource.sourceSha256 !== "7892dccc45b0470f77f4b60d27e95cd91879885f48c0eb55a3885a2a2ba08b6a") {
        throw new Error("The en-US word-coherency table is incomplete or has drifted.");
      }
      this.words = new Map();
      for (const [left, right] of resource.pairs) {
        for (const [word, other] of [[left, right], [right, left]]) {
          if (!this.words.has(word)) this.words.set(word, new Set());
          this.words.get(word).add(other);
        }
      }
    }

    check(sentences) {
      const issues = [];
      const shouldNotAppear = new Map();
      for (const sentence of sentences) {
        for (const token of sentence.tokens) {
          if (token.kind === "space" || !Number.isInteger(token.start) || !Number.isInteger(token.end)) continue;
          const readings = token.lexicalReadings || token.readings || [];
          if (!readings.length) continue;
          const baseforms = new Set(readings.map(reading => reading.lemma).filter(Boolean));
          if (!baseforms.size) baseforms.add(token.text);
          let matched = false;
          for (const baseform of baseforms) {
            const other = shouldNotAppear.get(baseform);
            if (other) {
              let replacement = token.text.replace(new RegExp(escapeRegex(baseform), "iu"), other);
              if (/^\p{Lu}/u.test(token.text)) replacement = upperFirst(replacement);
              if (replacement.toLocaleLowerCase("en-US") !== token.text.toLocaleLowerCase("en-US")) {
                issues.push({ id: `EN_WORD_COHERENCY:${token.start}:${token.end}`,
                  ruleId: "EN_WORD_COHERENCY", category: "misc", severity: "warning",
                  message: `Do not mix variants of the same word ('${baseform}' and '${other}') within a single text.`,
                  text: token.text, start: token.start, end: token.end,
                  replacementStart: token.start, replacementEnd: token.end, suggestions: [replacement] });
              }
              matched = true;
              break;
            }
            for (const variant of this.words.get(baseform) || []) shouldNotAppear.set(variant, baseform);
          }
          if (matched) continue;
        }
      }
      return issues;
    }

    static async load({ url, fetcher = globalThis.fetch } = {}) {
      if (!url || typeof fetcher !== "function") throw new Error("An en-US word-coherency resource URL and fetcher are required.");
      const response = await fetcher(url);
      if (!response.ok) throw new Error(`Could not load en-US word-coherency table (${response.status}).`);
      return new EnglishWordCoherency(await response.json());
    }
  }

  function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"); }
  function upperFirst(value) { const first = [...value][0]; return first ? first.toLocaleUpperCase("en-US") + value.slice(first.length) : value; }
  globalThis.CorrectorEnglishWordCoherency = EnglishWordCoherency;
})();
