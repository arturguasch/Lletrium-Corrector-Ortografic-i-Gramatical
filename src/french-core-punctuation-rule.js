/* French DoublePunctuationRule adapter based on LanguageTool Core (LGPL-2.1-or-later).
 * Proof ZIP only; mirrors the upstream rule's handling of adjacent `..` and `,,`.
 */
(() => {
  "use strict";

  function findMatches(rows) {
    const issues = [];
    const tokens = (rows || []).filter(row => row && typeof row.token === "string");
    let dotCount = 0;
    let commaCount = 0;
    let firstPunctuation = null;

    for (let i = 0; i < tokens.length; i++) {
      const current = tokens[i];
      const token = current.token;
      const next = tokens[i + 1]?.token ?? null;
      const previousPrevious = i > 1 ? tokens[i - 2].token : null;
      const adjacent = i > 0 && tokens[i - 1].end === current.start;

      if (token === "." && adjacent && tokens[i - 1].token === ".") {
        dotCount++;
        commaCount = 0;
        firstPunctuation ??= tokens[i - 1];
      } else if (token === "," && adjacent && tokens[i - 1].token === ",") {
        commaCount++;
        dotCount = 0;
        firstPunctuation ??= tokens[i - 1];
      } else if (token === "." || token === ",") {
        dotCount = 1;
        commaCount = 1;
        firstPunctuation = current;
      } else {
        dotCount = 0;
        commaCount = 0;
        firstPunctuation = null;
      }

      if (token === "." && dotCount === 2 && next !== "." && next !== "…"
          && next !== "/" && next !== "\\"
          && previousPrevious !== "?" && previousPrevious !== "!"
          && previousPrevious !== "…" && previousPrevious !== ".") {
        issues.push({
          id: `DOUBLE_PUNCTUATION:${firstPunctuation.start}:${current.end}`,
          ruleId: "DOUBLE_PUNCTUATION",
          category: "grammar", severity: "warning",
          message: "Deux points consécutifs.", shortMessage: "Ponctuation doublée",
          text: firstPunctuation.token + current.token,
          start: firstPunctuation.start, end: current.end,
          replacementStart: firstPunctuation.start, replacementEnd: current.end,
          suggestions: [".", "…"], _family: "language-tool-core-rule"
        });
        dotCount = 0;
        firstPunctuation = null;
      } else if (token === "," && commaCount === 2 && next !== ",") {
        issues.push({
          id: `DOUBLE_PUNCTUATION:${firstPunctuation.start}:${current.end}`,
          ruleId: "DOUBLE_PUNCTUATION",
          category: "grammar", severity: "warning",
          message: "Deux virgules consécutives.", shortMessage: "Ponctuation doublée",
          text: firstPunctuation.token + current.token,
          start: firstPunctuation.start, end: current.end,
          replacementStart: firstPunctuation.start, replacementEnd: current.end,
          suggestions: [","], _family: "language-tool-core-rule"
        });
        commaCount = 0;
        firstPunctuation = null;
      }
    }
    return issues;
  }

  globalThis.CorrectorFrenchCorePunctuationRule = Object.freeze({ findMatches });
})();
