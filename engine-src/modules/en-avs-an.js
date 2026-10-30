/* Local en-US port of LanguageTool's data-driven AvsAnRule. */
(() => {
  "use strict";

  const CLEANUP = /[^αa-zA-Z0-9.;,:']/gu;
  const DELIMITER = /^[-"“'‘()[\]]+$/u;
  const DASH_OR_QUOTE = /[-']/u;
  const AN_PREFIX = /^(?:unidentif|uni[mn])[a-z]+$/iu;
  const AN_EXCEPTION_PREFIX = /^(?:eu|one|uni|u[rst][aeiou])[a-z]*$/iu;

  function loadSet(source) {
    const set = new Set();
    for (const line of String(source).split(/\r?\n/u)) {
      const value = line.trim();
      if (!value || value.startsWith("#")) continue;
      set.add(value.startsWith("*") ? value.slice(1) : value.toLocaleLowerCase("en-US"));
    }
    return set;
  }

  class EnglishAvsAnRule {
    constructor(wordsRequiringA, wordsRequiringAn) {
      this.wordsRequiringA = wordsRequiringA;
      this.wordsRequiringAn = wordsRequiringAn;
    }

    getCorrectDeterminer(word) {
      let firstPart = DASH_OR_QUOTE.test(word) ? word.split(DASH_OR_QUOTE)[0] : word;
      firstPart = firstPart.replace(CLEANUP, "");
      if (!firstPart) return null;
      let determiner = null;
      const lower = firstPart.toLocaleLowerCase("en-US");
      if (this.wordsRequiringA.has(lower) || this.wordsRequiringA.has(firstPart)) determiner = "a";
      if (this.wordsRequiringAn.has(lower) || this.wordsRequiringAn.has(firstPart)) {
        if (determiner === "a") return "either";
        determiner = "an";
      }
      if (determiner) return determiner;
      if (isAllUppercase(firstPart) || isMixedCase(firstPart)) return null;
      if (AN_PREFIX.test(word)) return "an";
      if (/^[aeiou]/iu.test(firstPart) && !AN_EXCEPTION_PREFIX.test(word)) return "an";
      return "a";
    }

    check(tokens) {
      const words = tokens.filter(token => token.kind !== "space");
      const issues = [];
      let determinerIndex = -1;
      for (let index = 0; index < words.length; index++) {
        const current = words[index], previous = determinerIndex >= 0 ? words[determinerIndex] : null;
        if (previous && (previous.text === "a" || previous.text === "an"
            || determinerIndex === 0 && /^(?:a|an)$/iu.test(previous.text))) {
          // Only a following lexical word determines the article sound; a
          // trailing ellipsis or punctuation is an unfinished construction.
          if (current.kind !== "word") {
            const next = words[index + 1];
            if (!(next?.kind === "word" && next.text.length > 1 && DELIMITER.test(current.text))) determinerIndex = -1;
            continue;
          }
          const expected = this.getCorrectDeterminer(current.text);
          const found = previous.text.toLocaleLowerCase("en-US");
          if (expected && expected !== "either" && expected !== found) {
            const replacement = expected === "an" ? "an" : "a";
            const replacementWithCase = previous.sentenceStart && /^\p{Lu}/u.test(previous.text)
              ? replacement[0].toLocaleUpperCase("en-US") + replacement.slice(1) : replacement;
            const prefix = expected === "an" ? "starts with a vowel sound, e.g. 'an article', 'an hour'."
              : "doesn't start with a vowel sound, e.g. 'a sentence', 'a university'.";
            issues.push({
              id: `EN_A_VS_AN:${previous.start}:${current.end}`,
              ruleId: "EN_A_VS_AN", category: "grammar", severity: "warning",
              message: `Use ${replacementWithCase} instead of '${previous.text}' if the following word ${prefix}`,
              shortMessage: "Wrong article", text: "",
              // LanguageTool's RuleMatch marks only the article (from/to),
              // while its suggested-replacement range may independently
              // include the following token. Keep the visible issue range
              // narrow so it does not underline the noun or punctuation.
              start: previous.start, end: previous.end,
              replacementStart: previous.start, replacementEnd: previous.end,
              suggestions: [replacementWithCase]
            });
          }
        }

        const isDeterminer = current.readings?.some(reading => reading.tag === "DT");
        if (isDeterminer) determinerIndex = index;
        else if (!(index + 1 < words.length && words[index + 1].text.length > 1 && DELIMITER.test(current.text))) determinerIndex = -1;
      }
      return issues;
    }

    static async load({ baseUrl, fetcher = globalThis.fetch } = {}) {
      if (!baseUrl || typeof fetcher !== "function") throw new Error("English article data needs a resource base URL and fetcher.");
      const [aResponse, anResponse] = await Promise.all([
        fetcher(new URL("en-US-det_a.txt", baseUrl)), fetcher(new URL("en-US-det_an.txt", baseUrl))
      ]);
      if (!aResponse.ok || !anResponse.ok) throw new Error("Could not load the en-US article exception tables.");
      const [aText, anText] = await Promise.all([aResponse.text(), anResponse.text()]);
      if (await sha256(aText) !== "658248ca07325973372506c99460c2563bf63281cf887de247d1bc60c545c18d"
          || await sha256(anText) !== "2f4d8329de649f1a5b3f6d9b116d8396b34f2efcf2d1b61cfa8056e16d42a952") {
        throw new Error("The en-US article tables do not match the pinned LanguageTool source.");
      }
      return new EnglishAvsAnRule(loadSet(aText), loadSet(anText));
    }
  }

  function isAllUppercase(value) {
    const letters = [...value].filter(char => /[\p{Lu}\p{Ll}\p{Lt}]/u.test(char));
    return letters.length > 0 && letters.every(char => char === char.toLocaleUpperCase("en-US"));
  }

  function isMixedCase(value) {
    return /\p{Lu}/u.test(value) && /\p{Ll}/u.test(value);
  }

  async function sha256(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
  }

  globalThis.CorrectorEnglishAvsAn = EnglishAvsAnRule;
})();
