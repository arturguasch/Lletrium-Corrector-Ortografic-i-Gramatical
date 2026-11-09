/* Conservative proof-only adapter for LanguageTool Core's French LongParagraphRule. */
(() => {
  "use strict";

  const DEFAULT_MAX_WORDS = 220;
  const RULE_ID = "TOO_LONG_PARAGRAPH";

  function findMatches(text, rows, maxWords = DEFAULT_MAX_WORDS) {
    if (typeof text !== "string" || !Array.isArray(rows)) {
      throw new Error("French long-paragraph rule is missing its text or tokens.");
    }
    const issues = [];
    const addParagraph = (start, end, closed) => {
      if (start >= end) return;
      const paragraph = text.slice(start, end);
      // LanguageTool deliberately suppresses paragraphs containing manual line
      // breaks. Here a blank line is the only reliable paragraph boundary.
      if (/\r?\n/u.test(paragraph)) return;
      const words = rows.filter(row => row.start >= start && row.end <= end && /^[\p{L}\p{N}]/u.test(row.token));
      const limit = closed ? maxWords + 5 : maxWords;
      if (words.length <= limit || words.length <= maxWords) return;
      const markedStart = words[maxWords - 2];
      const markedEnd = words[maxWords - 1];
      if (!markedStart || !markedEnd) return;
      issues.push({
        id: `${RULE_ID}:${markedStart.start}:${markedEnd.end}`,
        ruleId: RULE_ID,
        category: "style",
        severity: "warning",
        message: `Ce paragraphe contient plus de ${maxWords} mots à la position marquée, pensez à le raccourcir.`,
        shortMessage: "Paragraphe long",
        text: text.slice(markedStart.start, markedEnd.end),
        start: markedStart.start,
        end: markedEnd.end,
        replacementStart: markedStart.start,
        replacementEnd: markedEnd.end,
        suggestions: [],
        rule: RULE_ID,
        _family: "style",
        meta: { qualityCategory: "style" }
      });
    };

    const boundary = /(?:\r?\n){2,}/gu;
    let start = 0;
    for (const match of text.matchAll(boundary)) {
      addParagraph(start, match.index, true);
      start = match.index + match[0].length;
    }
    addParagraph(start, text.length, false);
    return issues;
  }

  globalThis.CorrectorFrenchLongParagraphRule = Object.freeze({ findMatches, ruleId: RULE_ID, defaultMaxWords: DEFAULT_MAX_WORDS });
})();
