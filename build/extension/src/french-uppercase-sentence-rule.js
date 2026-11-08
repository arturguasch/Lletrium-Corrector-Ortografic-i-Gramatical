/* Conservative French adapter for LanguageTool Core's UppercaseSentenceStartRule.
 * Uses the pinned French SRX segmenter and local tokenizer; proof ZIP only.
 */
(() => {
  "use strict";

  const EXCEPTIONS = new Set(["n", "w", "x86", "ⓒ", "ø", "cc", "pH", "heylogin"]);
  const OPENING_QUOTES = new Set(["'", '"', "‘", "“", "«"]);
  const CLOSING_QUOTES = /[\s\u00a0'"’”»)}\]]+$/u;
  const NUMBERED_ITEM = /^(?:[a-z]|m{0,4}(?:c[md]|d?c{0,3})(?:x[cl]|l?x{0,3})(?:i[xv]|v?i{0,3}))$/iu;

  function isUrlOrEmail(token) {
    return /^(?:(?:https?|ftp):\/\/|www\.)/iu.test(token)
      || /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(token);
  }

  function segmentStartsWithUrlOrEmail(text) {
    const prefix = text.trimStart().replace(/^["'‘“«([{]+/u, "").trimStart();
    return /^(?:(?:https?|ftp):\/\/|www\.)/iu.test(prefix)
      || /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(prefix.split(/\s/u, 1)[0] || "");
  }

  function findMatches(text, tokenizer, sentenceTokenizer) {
    const segments = sentenceTokenizer.segment(text);
    const issues = [];
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (segmentStartsWithUrlOrEmail(segment.text)) continue;
      const rows = tokenizer.tokenizeRows(segment.text);
      if (rows.length === 0) continue;
      const previousTail = i > 0 ? segments[i - 1].text.replace(CLOSING_QUOTES, "").trimEnd() : "";
      const previousIsContinuation = /[;,]$/u.test(previousTail);
      const previousEndsSentence = /[.?!…]$/u.test(previousTail);
      const previousIsNumberedItem = i > 0 && /(?:^|\n)\d+\.\s/u.test(segments[i - 1].text);
      const lastToken = rows[rows.length - 1]?.token || "";
      const currentEndsSentence = /[.?!…]$/u.test(lastToken);
      if (previousIsContinuation || previousIsNumberedItem || (!previousEndsSentence && !currentEndsSentence)) continue;
      let tokenIndex = OPENING_QUOTES.has(rows[0].token) ? 1 : 0;
      const row = rows[tokenIndex];
      if (!row || /\d/u.test(row.token) || isUrlOrEmail(row.token)) continue;
      if (tokenIndex + 1 < rows.length && NUMBERED_ITEM.test(row.token)
          && [".", ")"].includes(rows[tokenIndex + 1].token)) continue;
      if (!/^\p{Ll}/u.test(row.token) || /^[\p{Ll}][\p{Lu}]/u.test(row.token)
          || EXCEPTIONS.has(row.token) || isUrlOrEmail(row.token)) continue;

      const firstChar = [...row.token][0];
      const replacement = firstChar.toLocaleUpperCase("fr-FR") + row.token.slice(firstChar.length);
      if (replacement === row.token) continue;
      const start = segment.start + row.start;
      const end = segment.start + row.end;
      issues.push({
        id: `UPPERCASE_SENTENCE_START:${start}:${end}`, ruleId: "UPPERCASE_SENTENCE_START",
        category: "typography", severity: "warning",
        message: "Cette phrase ne commence pas par une majuscule.", shortMessage: "Majuscules",
        text: row.token, start, end, replacementStart: start, replacementEnd: end,
        suggestions: [replacement], _family: "language-tool-core-rule"
      });
    }
    return issues;
  }

  globalThis.CorrectorFrenchUppercaseSentenceRule = Object.freeze({ findMatches });
})();
