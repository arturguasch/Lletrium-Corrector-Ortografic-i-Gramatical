/* Conservative adapter for LanguageTool Core's French CommaWhitespaceRule.
 * Proof ZIP only. Implements comma/parenthesis spacing and the French default
 * full-stop branch, using the same domain/file-extension/number exceptions.
 */
(() => {
  "use strict";

  const QUOTES = new Set(["'", '"', "’", "”", "“", "«", "»"]);
  const DOMAIN = /^(?:com|org|net|int|edu|gov|mil|[a-z]{2})$/iu;
  const FILE_EXTENSION = /^(?:[a-z]{3,4}|[A-Z]{3,4}|ai|mp[34]|MP[34])(?:-.+)?$/u;
  const hasDigit = value => /\d/u.test(value || "");
  const isQuote = value => value?.length === 1 && QUOTES.has(value);
  const makeIssue = (ruleId, message, start, end, text, suggestion) => ({
    id: `${ruleId}:${start}:${end}`, ruleId,
    category: "grammar", severity: "warning", message,
    shortMessage: "Espacement", text, start, end,
    replacementStart: start, replacementEnd: end,
    suggestions: [suggestion], meta: { qualityCategory: "style" }, _family: "language-tool-core-rule"
  });

  function findMatches(text, rows) {
    const issues = [];
    const tokens = (rows || []).filter(row => row && typeof row.token === "string");
    for (let i = 0; i < tokens.length; i++) {
      const current = tokens[i];
      const previous = tokens[i - 1];
      const previousPrevious = tokens[i - 2];
      const next = tokens[i + 1];
      if (!previous) continue;
      const beforeGap = text.slice(previous.end, current.start);
      const afterGap = next ? text.slice(current.end, next.start) : "";
      const beforeWhitespace = /\s/u.test(beforeGap);
      const afterWhitespace = /\s/u.test(afterGap);

      if (beforeGap && previous.token === "(") {
        issues.push(makeIssue("COMMA_PARENTHESIS_WHITESPACE", "Ne placez pas d'espace après une parenthèse ouvrante.",
          previous.start, current.start, text.slice(previous.start, current.start), "("));
      } else if (beforeWhitespace && current.token === ")") {
        issues.push(makeIssue("COMMA_PARENTHESIS_WHITESPACE", "Ne placez pas d'espace avant une parenthèse fermante.",
          previous.end, current.end, text.slice(previous.end, current.end), ")"));
      } else if (current.token === "," && beforeWhitespace && !(next?.token === ",")) {
        const suggestion = `,${afterWhitespace ? "" : " "}`;
        issues.push(makeIssue("COMMA_PARENTHESIS_WHITESPACE", "Insérez une espace après la virgule et non avant.",
          previous.end, current.end, text.slice(previous.end, current.end), suggestion));
      } else if (!beforeGap && previous.token === "," && !isQuote(current.token)
          && current.token !== "-" && current.token !== ","
          && !hasDigit(previousPrevious?.token) && !hasDigit(current.token)
          && previousPrevious?.token !== ",") {
        issues.push(makeIssue("COMMA_PARENTHESIS_WHITESPACE", "Insérez une espace après la virgule.",
          previous.start, current.end, text.slice(previous.start, current.end), `, ${current.token}`));
      } else if (beforeWhitespace && current.token === "."
          && !DOMAIN.test(next?.token || "") && !FILE_EXTENSION.test(next?.token || "")) {
        // Match Core's exclusions for decimal/ellipsis starts and shell paths.
        // French tags are not NP-prefixed; upstream checks the current token
        // (the punctuation itself) in isProperNoun(), so it does not suppress
        // this case based on the preceding French word.
        const nextStartsNumberOrDot = /^[.\p{N}]/u.test(next?.token || "");
        const shellPath = next?.token === "/" && /^[A-Za-z]+$/u.test(tokens[i + 2]?.token || "");
        if (!nextStartsNumberOrDot && !shellPath) {
          issues.push(makeIssue("COMMA_PARENTHESIS_WHITESPACE", "Ne placez pas d'espace avant le point.",
            previous.end, current.end, text.slice(previous.end, current.end), "."));
        }
      }
    }
    return issues;
  }

  globalThis.CorrectorFrenchCommaWhitespaceRule = Object.freeze({ findMatches });
})();
