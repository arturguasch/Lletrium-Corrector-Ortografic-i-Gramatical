/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* LanguageTool LongParagraphRule, kept in the independent es-ES profile. */
(() => {
  "use strict";

  const NON_WORD = /^[.?!…:;,~’'"„“”»«‚‘›‹()\[\]\-–—*×∗·+÷/=]$/u;

  function findMatches(sentences, sourceText, options = {}) {
    if (String(options.checkLevel || "DEFAULT").toUpperCase() !== "PICKY") return [];
    const maxWords = Number.isInteger(options.maxWords) && options.maxWords > 0 ? options.maxWords : 220;
    const text = String(sourceText ?? "");
    const tokens = (sentences || []).flatMap(sentence => sentence.tokens || [])
      .filter(token => token.kind !== "space" && token.kind !== "sentence-start" && !NON_WORD.test(String(token.text ?? "")))
      .sort((left, right) => left.start - right.start);
    const paragraphRanges = [];
    const separators = /(?:\r\n\r\n|\n\r\n\r|\n\n)+/gu;
    let paragraphStart = 0, separator;
    while ((separator = separators.exec(text))) {
      paragraphRanges.push({ start: paragraphStart, end: separator.index, isFinal: false });
      paragraphStart = separator.index + separator[0].length;
    }
    paragraphRanges.push({ start: paragraphStart, end: text.length, isFinal: true });

    const issues = [];
    for (const paragraph of paragraphRanges) {
      const paragraphTokens = tokens.filter(token => token.start >= paragraph.start && token.end <= paragraph.end);
      const wordCount = paragraphTokens.length;
      // Tools.isParagraphEnd() also returns true for the final analyzed
      // sentence, so its paragraph-end branch (+5 words) is the active path
      // for completed editor text.
      const threshold = maxWords + 5;
      const content = text.slice(paragraph.start, paragraph.end).replace(/(?:\r?\n)+$/u, "");
      if (wordCount <= threshold || /\r?\n/u.test(content)) continue;
      const first = paragraphTokens[maxWords - 2], second = paragraphTokens[maxWords - 1];
      if (!first || !second || first.start >= second.end) continue;
      const start = first.start, end = second.end;
      const message = `El párrafo tiene más de ${maxWords} palabras. Considere la posibilidad de revisarlo.`;
      issues.push({
        id: `TOO_LONG_PARAGRAPH:${start}:${end}`,
        ruleId: "TOO_LONG_PARAGRAPH",
        category: "style",
        severity: "warning",
        message,
        shortMessage: "",
        text: text.slice(start, end),
        start,
        end,
        replacementStart: start,
        replacementEnd: end,
        suggestions: [],
        rule: "TOO_LONG_PARAGRAPH",
        _picky: true,
        _family: "long-paragraph"
      });
    }
    return issues;
  }

  globalThis.CorrectorSpanishLongParagraphRule = Object.freeze({ findMatches });
})();
