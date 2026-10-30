/* SpanishWordRepeatRule behavior ported from LanguageTool (LGPL-2.1-or-later). */
(() => {
  "use strict";

  const ALLOWED_REPEATS = new Set(["Phi", "Li", "Xiao", "Duran", "Wagga", "Abdullah", "Nwe", "Pago", "Cao"]);
  const EMOJI = /\p{Extended_Pictographic}/u;
  const NUMBER = /^[\p{N}\p{Zs}]+$/u;

  function isWord(token) {
    const value = String(token?.text ?? "");
    if (!value || EMOJI.test(value) || NUMBER.test(value)) return false;
    if (value.length === 1 && !/^\p{L}$/u.test(value)) return false;
    return true;
  }

  function allowsRepeat(token) {
    return (token?.contextualReadings || token?.readings || []).some(reading => reading.tag === "_allow_repeat");
  }

  function findMatches(sentences) {
    const issues = [];
    for (const sentence of sentences || []) {
      const tokens = (sentence.tokens || []).filter(token => token.kind !== "space");
      let previous = null;
      for (let index = 0; index < tokens.length; index++) {
        const current = tokens[index];
        if (current.isImmunized || current.immunized) { previous = null; continue; }
        if (isWord(current) && previous && previous.text.toLocaleLowerCase("es") === current.text.toLocaleLowerCase("es")
            && !ALLOWED_REPEATS.has(current.text) && !allowsRepeat(previous) && !allowsRepeat(current)) {
          const start = previous.start, end = current.end;
          issues.push({
            id: `SPANISH_WORD_REPEAT_RULE:${start}:${end}`, ruleId: "SPANISH_WORD_REPEAT_RULE",
            category: "duplication", severity: "warning", message: "Posible error: repetición de una palabra", shortMessage: "Repetición de una palabra",
            text: sentence.text.slice(previous.start - sentence.start, current.end - sentence.start), start, end,
            replacementStart: start, replacementEnd: end, suggestions: [previous.text], rule: "SPANISH_WORD_REPEAT_RULE",
            _family: "word-repeat"
          });
        }
        previous = current;
      }
    }
    return issues;
  }

  globalThis.CorrectorSpanishWordRepeat = Object.freeze({ findMatches });
})();
