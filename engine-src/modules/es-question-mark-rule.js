/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* QuestionMarkRule behavior ported from LanguageTool (upstream LGPL-2.1-or-later; local adaptation GPL-3.0-or-later under LGPL-2.1 section 3). */
(() => {
  "use strict";

  function readings(token) {
    return token?.contextualReadings || token?.readings || [];
  }

  function hasTag(token, predicate) {
    return readings(token).some(reading => predicate(String(reading.tag || "")));
  }

  function punctuation(token) {
    return token?.kind === "punctuation" || /^\p{P}+$/u.test(String(token?.text ?? ""));
  }

  function hasTokenAtPos(mark, tokens) {
    for (let index = tokens.length - 1; index > 0; index--) {
      if (tokens[index].text !== mark) continue;
      const next = tokens[index + 1];
      if (next && !next.whitespaceBefore && !punctuation(next) && next.kind !== "space") continue;
      return index;
    }
    return -1;
  }

  function findMatches(sentences) {
    const issues = [];
    for (const sentence of sentences || []) {
      const tokens = (sentence.tokens || []).filter(token => token.kind !== "space");
      const questionAt = hasTokenAtPos("?", tokens);
      const exclamationAt = hasTokenAtPos("!", tokens);
      if (questionAt <= 0 && exclamationAt <= 0) continue;

      let hasQuestionOpener = false;
      let hasExclamationOpener = false;
      let firstToken = null;
      for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index];
        if (!firstToken && !punctuation(token)) firstToken = token;
        if (token.text === "¿" && index < questionAt) hasQuestionOpener = true;
        else if (token.text === "¡" && index < exclamationAt) hasExclamationOpener = true;

        if (!token.isSentenceEnd
            && ((token.text === "?" && index > questionAt) || (token.text === "!" && index > exclamationAt))) {
          firstToken = null;
        }

        // LanguageTool resets the candidate to the start of an embedded
        // interrogative clause after a comma when its POS pattern identifies
        // an interrogative pronoun/determiner or its introductory connector.
        if (index > 1 && index + 2 < tokens.length) {
          const previousIsComma = tokens[index - 1]?.text === ",";
          const currentCC = hasTag(token, tag => tag === "CC");
          const currentPrep = hasTag(token, tag => tag === "SPS00");
          const currentInterrogative = hasTag(token, tag => tag.startsWith("PT") || tag.startsWith("DT"));
          const nextPrep = hasTag(tokens[index + 1], tag => tag === "SPS00");
          const nextInterrogative = hasTag(tokens[index + 1], tag => tag.startsWith("PT") || tag.startsWith("DT"));
          const followingInterrogative = hasTag(tokens[index + 2], tag => tag.startsWith("PT") || tag.startsWith("DT"));
          if (previousIsComma && (currentCC && nextPrep && followingInterrogative
              || currentPrep && nextInterrogative
              || currentCC && nextInterrogative
              || currentInterrogative
              || currentCC && ["no", "sí"].includes(tokens[index + 1]?.text))) firstToken = token;
        }
        if (index > 1 && tokens[index - 1]?.text === "," && ["no", "sí", "eh"].includes(token.text)) firstToken = token;
      }

      if (!firstToken || hasTag(firstToken, tag => tag === "_english_ignore_")) continue;
      let opener = "";
      if (questionAt > 0 && exclamationAt > 0) {
        // LT deliberately leaves mixed ¡¿…?! sequences alone.
        continue;
      } else if (questionAt > 0 && !hasQuestionOpener) opener = "¿";
      else if (exclamationAt > 0 && !hasExclamationOpener) opener = "¡";
      if (!opener) continue;

      const start = firstToken.start, end = firstToken.end;
      const suggestion = opener + firstToken.text;
      issues.push({
        id: `ES_QUESTION_MARK:${start}:${end}`,
        ruleId: "ES_QUESTION_MARK",
        category: "TYPOGRAPHY",
        severity: "warning",
        message: `Símbolo desparejado: Parece que falta un '${opener}'`,
        text: firstToken.text,
        start,
        end,
        replacementStart: start,
        replacementEnd: end,
        suggestions: [suggestion],
        rule: "ES_QUESTION_MARK",
        _family: "spanish-question-mark"
      });
    }
    return issues;
  }

  globalThis.CorrectorSpanishQuestionMarkRule = Object.freeze({ findMatches });
})();
