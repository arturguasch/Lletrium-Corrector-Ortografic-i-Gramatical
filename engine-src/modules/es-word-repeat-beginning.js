/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* SpanishWordRepeatBeginningRule behavior ported from LanguageTool (upstream LGPL-2.1-or-later; local adaptation GPL-3.0-or-later under LGPL-2.1 section 3). */
(() => {
  "use strict";

  const START_EXCEPTIONS = new Set(["el", "la", "los", "las", "punto", "artículo", "módulo", "parte", "sesión", "unidad", "tema", "n"]);
  const SENTENCE_EXCEPTIONS = ["por un", "por otro", "por otra", "por una"];
  const ADD_ADVERBS = ["Asimismo", "Igualmente", "Además", "También", "Adicionalmente"];
  // Java HashSet traversal order from the pinned LanguageTool oracle for this
  // fixed inventory; keep suggestions stable in the local UI.
  const ADD_SUGGESTION_ORDER = ["Adicionalmente", "Asimismo", "Además", "Igualmente", "También"];
  const CONTRAST_WORDS = new Set(["Pero", "Empero", "Mas"]);
  const EMPHASIS_ADVERBS = ["Obviamente", "Claramente", "Absolutamente", "Definitivamente"];
  const EXPLAIN_ADVERBS = ["Específicamente", "Concretamente", "Particularmente", "Precisamente"];
  const PERSONAL_PRONOUNS = new Set(["yo", "tú", "él", "ella", "nosotros", "nosostros", "nosotras", "vosotros", "vosotras", "ellos", "ellas", "usted", "ustedes"]);
  const SYMBOL_EXCEPTIONS = new Set([":", "–", "-", "✔️", "➡️", "—", "⭐️", "⚠️"]);

  function wordTokens(sentence) {
    return (sentence?.tokens || []).filter(token => token.kind !== "space");
  }

  function isException(token) {
    const value = String(token?.text ?? "");
    return SYMBOL_EXCEPTIONS.has(value) || /^\p{N}/u.test(value) || START_EXCEPTIONS.has(value.toLocaleLowerCase("es"));
  }

  function isAdverb(token) {
    const surface = String(token?.text ?? "");
    const readings = token?.contextualReadings || token?.readings || [];
    return readings.some(reading => reading.tag === "RG" || reading.tag === "LOC_ADV")
      || [...ADD_ADVERBS, ...CONTRAST_WORDS, ...EMPHASIS_ADVERBS, ...EXPLAIN_ADVERBS].some(value => value === surface);
  }

  function suggestionsFor(token) {
    const surface = String(token?.text ?? "");
    const lower = surface.toLocaleLowerCase("es");
    if (PERSONAL_PRONOUNS.has(lower)) return [`Además, ${lower}`, `Igualmente, ${lower}`, `No solo eso, sino que ${lower}`];
    if (ADD_ADVERBS.includes(surface)) return [...ADD_SUGGESTION_ORDER.filter(value => value !== surface), "Así mismo"];
    if (CONTRAST_WORDS.has(surface)) return ["Aun así", "Por otra parte", "Sin embargo"];
    if (EMPHASIS_ADVERBS.includes(surface)) return EMPHASIS_ADVERBS.filter(value => value !== surface);
    if (EXPLAIN_ADVERBS.includes(surface)) return EXPLAIN_ADVERBS.filter(value => value !== surface);
    return [];
  }

  function findMatches(sentences, { checkLevel = "DEFAULT" } = {}) {
    if (checkLevel !== "PICKY") return [];
    const issues = [];
    let previousStart = "";
    let beforePreviousStart = "";
    let previousSentence = null;

    for (const sentence of sentences || []) {
      const sentenceText = String(sentence?.text ?? "");
      const normalizedSentence = sentenceText.trimStart().toLocaleLowerCase("es");
      if (SENTENCE_EXCEPTIONS.some(prefix => normalizedSentence.startsWith(prefix))) {
        previousSentence = null;
        continue;
      }
      const tokens = wordTokens(sentence);
      const first = tokens[0];
      const lowerStart = String(first?.text ?? "").toLocaleLowerCase("es");
      // The Java rule counts the synthetic SENT_START token; this local token
      // array does not, so its `tokens.length > 3` is equivalent to >2 here.
      if (tokens.length > 2 && first?.kind === "word" && first.end > first.start
          && lowerStart && lowerStart === previousStart && !isException(first)
          && !isException(tokens[1]) && !isException(tokens[2]) && previousSentence
          && /[.?!]$/u.test(String(previousSentence.text ?? "").trim())) {
        const adverb = isAdverb(first);
        const tripleRepeat = beforePreviousStart === lowerStart;
        if (adverb || tripleRepeat) {
          const shortMessage = adverb
            ? "Dos frases consecutivas comienzan con el mismo elemento."
            : "Tres frases consecutivas comienzan con la misma palabra.";
          const message = `${shortMessage} Considere reescribir la frase o usar un sinónimo.`;
          const start = first.start, end = first.end;
          issues.push({
            id: `SPANISH_WORD_REPEAT_BEGINNING_RULE:${start}:${end}`,
            ruleId: "SPANISH_WORD_REPEAT_BEGINNING_RULE",
            category: "style",
            severity: "hint",
            message,
            shortMessage,
            text: sentenceText.slice(start - sentence.start, end - sentence.start),
            start,
            end,
            replacementStart: start,
            replacementEnd: end,
            suggestions: suggestionsFor(first),
            rule: "SPANISH_WORD_REPEAT_BEGINNING_RULE",
            _family: "word-repeat-beginning",
            _picky: true
          });
        }
      }
      beforePreviousStart = previousStart;
      previousStart = lowerStart;
      previousSentence = sentence;
    }
    return issues;
  }

  globalThis.CorrectorSpanishWordRepeatBeginning = Object.freeze({ findMatches });
})();
