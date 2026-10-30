/* LanguageTool Spanish LongSentenceRule, kept in the independent es-ES profile. */
(() => {
  "use strict";

  const OPENING_QUOTES = ["\"", "“", "„", "«", "(", "[", "{", "—"];
  const CLOSING_QUOTES = ["\"", "”", "“", "»", ")", "]", "}", "—"];
  const SENTENCE_END = new Set(["?", "!", "."]);
  const QUOTED_SENTENCE_END = /[?!.]["“”„»«]/u;

  function findMatches(sentences, sourceText, options = {}) {
    if (String(options.checkLevel || "DEFAULT").toUpperCase() !== "PICKY") return [];
    const maxWords = Number.isInteger(options.maxWords) && options.maxWords > 0 ? options.maxWords : 60;
    const matches = [];
    for (const sentence of sentences || []) {
      const tokens = sentence.tokens || [];
      if (!tokens.length || QUOTED_SENTENCE_END.test(sentence.text || "")) continue;
      let quote = -1, counted = 0, firstWord = -1, tooLong = false;
      for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
        const token = tokens[tokenIndex];
        const value = String(token.text ?? "");
        if ([":", ";", "\n", "\r\n", "\n\r"].includes(value)) {
          counted = 0;
          continue;
        }
        if (quote === -1) {
          const opening = OPENING_QUOTES.indexOf(value);
          if (opening >= 0) quote = opening;
        } else if (CLOSING_QUOTES.indexOf(value) === quote) {
          quote = -1;
        }
        if (quote === -1 && /^[\p{L}\p{N}]/u.test(value)) {
          if (firstWord < 0) firstWord = tokenIndex;
          counted++;
          if (counted > maxWords) { tooLong = true; break; }
        }
      }
      if (!tooLong || firstWord < 0) continue;

      let lastWord = -1;
      for (let index = tokens.length - 1; index >= 0; index--) {
        if (!/^[\p{L}\p{N}]/u.test(String(tokens[index].text ?? ""))) continue;
        lastWord = index;
        break;
      }
      if (lastWord < 0) continue;
      const endToken = tokens[lastWord + 1] && SENTENCE_END.has(String(tokens[lastWord + 1].text))
        ? tokens[lastWord + 1] : tokens[lastWord];
      const start = tokens[firstWord].start, end = endToken.end;
      if (!Number.isInteger(start) || !Number.isInteger(end) || start >= end) continue;
      matches.push({
        id: `TOO_LONG_SENTENCE:${start}:${end}`,
        ruleId: "TOO_LONG_SENTENCE",
        category: "style",
        severity: "warning",
        message: `Esta frase tiene más de ${maxWords} palabras. Considere la posibilidad de revisarla.`,
        shortMessage: "Frase demasiado larga",
        text: String(sourceText ?? "").slice(start, end),
        start,
        end,
        replacementStart: start,
        replacementEnd: end,
        suggestions: [],
        rule: "TOO_LONG_SENTENCE",
        _picky: true,
        _family: "long-sentence"
      });
    }
    return matches;
  }

  globalThis.CorrectorSpanishLongSentenceRule = Object.freeze({ findMatches });
})();
