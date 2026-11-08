/* Proof-only adapter for LanguageTool Core's LongSentenceRule (French threshold: 40). */
(() => {
  "use strict";

  const DEFAULT_MAX_WORDS = 40;
  const QUOTED_SENT_END = /[?!.]["“”„»«]/u;
  const openingQuotes = ["\"", "“", "„", "«", "(", "[", "{", "—"];
  const closingQuotes = ["\"", "”", "“", "»", ")", "]", "}", "—"];
  const ruleId = "TOO_LONG_SENTENCE";

  function findMatches(text, rows, sentenceTokenizer, maxWords = DEFAULT_MAX_WORDS) {
    if (typeof text !== "string" || !Array.isArray(rows) || typeof sentenceTokenizer?.segment !== "function") {
      throw new Error("French long-sentence rule is missing its text, tokens or sentence tokenizer.");
    }
    const issues = [];
    for (const sentence of sentenceTokenizer.segment(text)) {
      if (QUOTED_SENT_END.test(sentence.text)) continue;
      const tokens = rows.filter(row => row.start >= sentence.start && row.end <= sentence.end);
      if (tokens.length < maxWords) continue;

      let quoteIndex = -1;
      let clauseWords = 0;
      let tooLong = false;
      for (const row of tokens) {
        const token = row.token;
        if ([":", ";", "\n", "\r\n", "\n\r"].includes(token)) {
          clauseWords = 0;
          continue;
        }
        if (quoteIndex === -1 && openingQuotes.includes(token)) {
          quoteIndex = openingQuotes.indexOf(token);
        } else if (quoteIndex > -1 && closingQuotes.indexOf(token) === quoteIndex) {
          quoteIndex = -1;
        }
        if (quoteIndex === -1 && /^[\p{L}\p{N}]/u.test(token)) {
          clauseWords++;
          if (clauseWords > maxWords) {
            tooLong = true;
            break;
          }
        }
      }
      if (!tooLong) continue;

      const words = tokens.filter(row => /^[\p{L}\p{N}]/u.test(row.token));
      if (!words.length) continue;
      const lastWord = words.at(-1);
      const next = tokens.find(row => row.start >= lastWord.end);
      const end = next && /^[.!?]$/u.test(next.token) ? next.end : lastWord.end;
      issues.push({
        id: `${ruleId}:${words[0].start}:${end}`,
        ruleId,
        category: "style",
        severity: "warning",
        message: `Cette phrase contient plus de ${maxWords} mots. Divisez-la afin d’obtenir une phrase plus concise, et ainsi améliorer la lisibilité de votre texte.`,
        shortMessage: "Phrase longue",
        text: text.slice(words[0].start, end),
        start: words[0].start,
        end,
        replacementStart: words[0].start,
        replacementEnd: end,
        suggestions: [],
        rule: ruleId,
        _family: "style",
        meta: { qualityCategory: "style" }
      });
    }
    return issues;
  }

  globalThis.CorrectorFrenchLongSentenceRule = Object.freeze({ findMatches, ruleId, defaultMaxWords: DEFAULT_MAX_WORDS });
})();
