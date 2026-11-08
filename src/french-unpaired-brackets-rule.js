/* Proof-only adapter for LanguageTool's French GenericUnpairedBracketsRule. */
(() => {
  "use strict";

  const pairs = new Map([["[", "]"], ["(", ")"], ["{", "}"]]);
  const reversePairs = new Map([...pairs].map(([open, close]) => [close, open]));
  const ruleId = "UNPAIRED_BRACKETS";

  function isListMarker(text, token, previous) {
    if (token !== ")" || !previous || !/^[a-z]$/iu.test(previous.token)) return false;
    const before = text[previous.start - 1];
    return previous.start === 0 || before === "\n" || before === "\r";
  }

  function findMatches(text, rows, sentenceTokenizer) {
    if (typeof text !== "string" || !Array.isArray(rows) || typeof sentenceTokenizer?.segment !== "function") {
      throw new Error("French unpaired-brackets rule is missing its text or tokenizer.");
    }
    const stack = [];
    const issues = [];
    const sentences = sentenceTokenizer.segment(text);
    const nonSpaceRows = rows.filter(row => row.token && !/^\s+$/u.test(row.token));
    const add = (row, missing) => issues.push({
      id: `${ruleId}:${row.start}:${row.end}`,
      ruleId,
      category: "grammar",
      severity: "warning",
      message: `Pas de correspondance fermante ou ouvrante pour le caractère « ${missing} »`,
      shortMessage: "Symbole sans paire",
      text: text.slice(row.start, row.end),
      start: row.start,
      end: row.end,
      replacementStart: row.start,
      replacementEnd: row.end,
      suggestions: [],
      rule: ruleId,
      _family: "punctuation"
    });

    for (let sentenceIndex = 0; sentenceIndex < sentences.length; sentenceIndex++) {
      const sentence = sentences[sentenceIndex];
      const tokens = nonSpaceRows.filter(row => row.start >= sentence.start && row.end <= sentence.end);
      for (let i = 0; i < tokens.length; i++) {
        const row = tokens[i];
        if (pairs.has(row.token)) {
          stack.push(row);
          continue;
        }
        if (!reversePairs.has(row.token)) continue;
        const expected = reversePairs.get(row.token);
        if (stack.at(-1)?.token === expected) {
          stack.pop();
          continue;
        }
        const previous = tokens[i - 1];
        const smiley = row.token === ")" && previous?.token === ":"
          && previous.end === row.start;
        const noseySmiley = row.token === ")" && previous?.token === "-"
          && tokens[i - 2]?.token === ":" && tokens[i - 2].end === previous.start;
        const romanEnumeration = row.token === ")" && previous
          && /^(?:\d{1,2}|[ivxlcdm]{1,8})$/iu.test(previous.token);
        if (!smiley && !noseySmiley && !romanEnumeration && !isListMarker(text, row.token, previous)) add(row, expected);
      }
    }

    const finalSentence = sentences.at(-1);
    for (const row of stack) {
      const sentence = sentences.find(item => row.start >= item.start && row.start < item.end);
      const sentenceEnded = sentence && /[.!?]\s*$/u.test(sentence.text);
      const laterSentenceExists = sentence && sentences.some(item => item.start >= sentence.end);
      if (sentenceEnded || laterSentenceExists) add(row, pairs.get(row.token));
    }
    return issues;
  }

  globalThis.CorrectorFrenchUnpairedBracketsRule = Object.freeze({ findMatches, ruleId });
})();
