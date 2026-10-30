/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Local structural checks for the independent Spanish es-ES pipeline. */
(() => {
  "use strict";

  const INVISIBLE_SPACE = /[\u200B\uFEFF\u2060]/u;
  const TOKENS_WITHOUT_SPACE = /[\p{L}\p{M}\p{N}_]+|[.,!?…/\\]|[^\s]/gu;
  const SENTENCE_OPENERS = new Set(["\"", "'", "„", "»", "«", "“", "‘", "¡", "¿"]);
  const LIST_ITEM_MARKERS = new Set(["-", "–", "—", "•", "●", "◦", "▪", "‣", "*"]);
  const SENTENCE_CLOSERS = new Set(["\"", "'", "”", "»", "’", "“", "«"]);
  const SENTENCE_START_EXCEPTIONS = new Set(["n", "w", "x86", "ⓒ", "ø", "cc", "pH", "heylogin"]);
  const ALLOWED_REPEATED_NAMES = new Set(["Phi", "Li", "Xiao", "Duran", "Wagga", "Abdullah", "Nwe", "Pago", "Cao"]);
  const LOWERCASE_ROMAN_OR_LETTER = /^(?:[a-z]|(?:m{0,4}(?:c[md]|d?c{0,3})(?:x[cl]|l?x{0,3})(?:i[xv]|v?i{0,3})))$/u;
  const QUOTES = new Set(["'", "\"", "’", "”", "“", "«", "»"]);
  const RIGHT_BRACKETS = new Set([")", "]", "}"]);
  const BRACKET_PAIRS = new Map([["[", "]"], ["(", ")"], ["{", "}"], ["“", "”"], ["«", "»"], ["‘", "’"]]);
  const BRACKET_CLOSERS = new Map([...BRACKET_PAIRS].map(([open, close]) => [close, open]));
  const SPANISH_OPENERS = new Set(["¿", "¡", "‘", "“", "«"]);
  const DIRECTIONAL_QUOTE_OPENERS = new Set(["‘", "“", "«"]);
  const QUOTE_OPENING_CONTEXT = new Set(["(", "[", "{", "¿", "¡", "—", "–", "-"]);
  const PUNCTUATION_REQUIRING_NO_PRECEDING_SPACE = new Set(["?", "!", ":", ";", "’", "”", "»"]);

  function isOpeningQuote(tokens, index) {
    const previous = tokens[index - 1];
    if (!previous || previous.kind === "space") return true;
    // Directional opening quotes are frequently mistyped where a closing
    // quote belongs (for example, word‘ followed by a space). Treating that
    // glyph as a new opener cascades into false unpaired-quote and spacing
    // alerts, and can hide the more precise LanguageTool PatternRule.
    return QUOTE_OPENING_CONTEXT.has(previous.text);
  }

  function checkRepeatedWhitespace(text) {
    const issues = [];
    const re = /[^\S\r\n\t]+/gu;
    let match;
    while ((match = re.exec(text))) {
      const value = match[0];
      if (value.length < 2 || INVISIBLE_SPACE.test(value) || value.includes("\u00AD")) continue;
      issues.push({
        ruleId: "WHITESPACE_RULE",
        category: "TYPOGRAPHY",
        start: match.index,
        end: match.index + value.length,
        message: "Posible error tipográfico: múltiples espacios en blanco",
        suggestions: [value[0]]
      });
    }
    return issues;
  }

  function checkDoublePunctuation(text) {
    const tokens = [...text.matchAll(TOKENS_WITHOUT_SPACE)];
    const issues = [];
    let dotCount = 0;
    let commaCount = 0;
    let secondPosition = 0;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i][0];
      const next = tokens[i + 1]?.[0] ?? null;
      const previousPrevious = tokens[i - 2]?.[0] ?? null;
      if (token === ".") {
        dotCount++;
        commaCount = 0;
        secondPosition = tokens[i].index;
      } else if (token === ",") {
        commaCount++;
        dotCount = 0;
        secondPosition = tokens[i].index;
      }

      if (dotCount === 2 && next !== "." && next !== "…" && token !== "/" && next !== "/"
          && token !== "\\" && next !== "\\" && previousPrevious !== "?" && previousPrevious !== "!"
          && previousPrevious !== "…" && previousPrevious !== ".") {
        issues.push({
          ruleId: "DOUBLE_PUNCTUATION", category: "PUNCTUATION",
          start: Math.max(0, secondPosition - 1), end: secondPosition + 1,
          message: "Dos puntos consecutivos", suggestions: [".", "…"]
        });
        dotCount = 0;
      } else if (commaCount === 2 && next !== ",") {
        issues.push({
          ruleId: "DOUBLE_PUNCTUATION", category: "PUNCTUATION",
          start: Math.max(0, secondPosition - 1), end: secondPosition + 1,
          message: "Dos comas consecutivas", suggestions: [","]
        });
        commaCount = 0;
      }
      if (token !== "." && token !== ",") {
        dotCount = 0;
        commaCount = 0;
      }
    }
    return issues;
  }

  function checkCommaAndParenthesisWhitespace(text) {
    const tokens = globalThis.CorrectorSpanishText.tokenize(text);
    const issues = [];
    const commasAlreadyMarked = new Set();
    let previous = "", previousPrevious = "", previousWhitespace = false;
    for (let i = 0; i < tokens.length; i++) {
      const current = tokens[i], token = current.text;
      const whitespace = current.kind === "space" && !/[\r\n\u2028\u2029]/u.test(token);
      let message = "", suggestion = "", start = 0;
      if (whitespace && previous === "(") {
        const markdownTaskGap = i + 1 < tokens.length && token === " " && tokens[i + 1].text === "]" && previousPrevious === "[";
        if (!markdownTaskGap) {
          message = "No se deja un espacio después de un paréntesis izquierdo.";
          suggestion = previous;
          start = tokens[i - 1].start;
        }
      } else if (!whitespace && previous === "," && !commasAlreadyMarked.has(tokens[i - 1]?.start)
          && !QUOTES.has(token) && token !== "-" && token !== ","
          && !/\d/u.test(previousPrevious) && !/\d/u.test(token) && previousPrevious !== ",") {
        message = "Deje un espacio después de coma.";
        suggestion = `, ${token}`;
        start = tokens[i - 1].start;
      } else if (!whitespace && previousWhitespace) {
        if (RIGHT_BRACKETS.has(token)) {
          const markdownTaskGap = token === "]" && previous === " " && previousPrevious === "[";
          if (!markdownTaskGap) {
            message = "No se deja un espacio antes de un paréntesis derecho.";
            suggestion = token;
          }
        } else if (token === ",") {
          if (tokens[i + 1]?.text !== ",") {
            message = "Se deja un espacio después de coma y nunca antes del signo ortográfico.";
            suggestion = tokens[i + 1] && tokens[i + 1].kind !== "space" ? ", " : ",";
          }
        } else if (token === ".") {
          const next = tokens[i + 1], afterNext = tokens[i + 2];
          // Treat a period as sentence punctuation across line breaks. Do not
          // interpret the first word on the next line as a file extension
          // (for example, the next test case or paragraph beginning with a
          // three-letter word).
          const horizontalGap = next?.kind === "space" && !/[\r\n\u2028\u2029]/u.test(next.text);
          const nextVisible = horizontalGap ? afterNext : next;
          const previousVisible = tokens[i - 2];
          const isProperNoun = previousVisible?.readings?.some(reading => /^NP/u.test(reading.tag || "")) ?? false;
          const domainOrExtension = /^(?:com|org|net|int|edu|gov|mil|[a-z]{2})$/iu.test(nextVisible?.text || "")
            || /^(?:[a-z]{3,4}|ai|mp[34])(?:-.+)?$/iu.test(nextVisible?.text || "");
          const decimalOrEllipsis = /^[.\d]/u.test(next?.text || "");
          const shellCommand = next?.text === "/" && /^[a-z]+$/iu.test(afterNext?.text || "");
          if (!domainOrExtension && !isProperNoun && !decimalOrEllipsis && !shellCommand) {
            message = "No se deja un espacio antes del punto.";
            suggestion = ".";
          }
        }
        if (message) start = tokens[i - 1].start;
      }
      if (message) {
        issues.push({
          ruleId: "COMMA_PARENTHESIS_WHITESPACE",
          category: "TYPOGRAPHY",
          start,
          end: current.end,
          message,
          suggestions: [suggestion]
        });
        if (token === ",") commasAlreadyMarked.add(current.start);
      }
      previousPrevious = previous;
      previous = token;
      previousWhitespace = whitespace;
    }
    return issues;
  }

  function checkSentenceStart(text, segments = []) {
    const issues = [];
    let previousLastToken = "";
    let previousWasNumberedList = false;
    const sentenceChecks = [];
    for (const segment of segments) {
      let cursor = 0;
      for (const boundary of segment.text.matchAll(/(?<!\.)\.\.(?!\.)[ \u00A0]+(?=["'«“¿¡]*\p{Ll})/gu)) {
        const end = boundary.index + boundary[0].length;
        sentenceChecks.push({ text: segment.text.slice(cursor, end), start: segment.start + cursor, checkSingleToken: false });
        cursor = end;
      }
      sentenceChecks.push({ text: segment.text.slice(cursor), start: segment.start + cursor,
        checkSingleToken: cursor > 0 || segment.start > 0 });
    }
    for (const segment of sentenceChecks) {
      const tokens = globalThis.CorrectorSpanishText.tokenize(segment.text).filter(token => token.kind !== "space");
      if (!tokens.length || (tokens.length < 2 && !segment.checkSingleToken)) continue;
      let index = 0;
      while (index < tokens.length && SENTENCE_OPENERS.has(tokens[index].text)) index++;
      // List markers and leading dashes are punctuation, not words. Google
      // Docs can isolate the marker from its following text in a visual chunk,
      // so classify it structurally without requiring a preserved space.
      while (index < tokens.length && LIST_ITEM_MARKERS.has(tokens[index].text)) index++;
      const candidate = tokens[index];
      if (!candidate || candidate.kind !== "word" || !candidate.text) {
        let lastIndex = tokens.length - 1;
        while (lastIndex > 0 && SENTENCE_CLOSERS.has(tokens[lastIndex].text)) lastIndex--;
        previousLastToken = tokens[lastIndex]?.text ?? previousLastToken;
        previousWasNumberedList = /^\s*\d+\.\s/u.test(segment.text);
        continue;
      }
      const next = tokens[index + 1]?.text ?? "";
      let lastIndex = tokens.length - 1;
      while (lastIndex > 0 && SENTENCE_CLOSERS.has(tokens[lastIndex].text)) lastIndex--;
      const last = tokens[lastIndex]?.text ?? "";
      const first = [...candidate.text][0];
      const lower = /\p{Ll}/u.test(first || "") && first?.toLocaleLowerCase("es") === first;
      const hasDigit = /\d/u.test(candidate.text);
      const camelCase = /\p{Ll}\p{Lu}|\p{Lu}.*\p{Ll}.*\p{Lu}/u.test(candidate.text);
      const isUrlOrEmail = /^(?:https?:\/\/|www\.|[^\s@]+@[^\s@]+\.[^\s@]+$)/iu.test(candidate.text);
      const listMarker = LOWERCASE_ROMAN_OR_LETTER.test(candidate.text) && [".", ")"].includes(next);
      const continuation = [",", ";"].includes(previousLastToken)
        || !/[.?!…]/u.test(previousLastToken) && previousLastToken !== "";
      const suppress = previousWasNumberedList || continuation || hasDigit || isUrlOrEmail || listMarker
        || SENTENCE_START_EXCEPTIONS.has(candidate.text) || /^[a-z][A-Z]/u.test(candidate.text) || camelCase;
      if (lower && !suppress) {
        const capitalized = first.toLocaleUpperCase("es") + candidate.text.slice(first.length);
        issues.push({
          ruleId: "UPPERCASE_SENTENCE_START",
          category: "CASING",
          start: segment.start + candidate.start,
          end: segment.start + candidate.end,
          message: "Esta frase no empieza con mayúscula.",
          suggestions: [capitalized]
        });
      }
      previousLastToken = last;
      previousWasNumberedList = /^\s*\d+\.\s/u.test(segment.text);
    }
    return issues;
  }

  function checkRepeatedWords(segments = []) {
    const issues = [];
    for (const segment of segments) {
      const tokens = (segment.tokens || []).filter(token => token.kind !== "space");
      let previous = null;
      for (const token of tokens) {
        const value = token.text ?? "";
        if (token.isImmunized || token.immunized) { previous = null; continue; }
        const isEmoji = /^(?=.*\p{Extended_Pictographic})[\p{Extended_Pictographic}\p{Emoji_Modifier}\uFE0F\u200D]+$/u.test(value);
        const numeric = /^[\d\s]+$/u.test(value);
        const isWord = !isEmoji && !numeric && (value.length !== 1 || /^\p{L}$/u.test(value));
        if (isWord && previous && previous.text.toLocaleLowerCase("es") === value.toLocaleLowerCase("es")
            && !ALLOWED_REPEATED_NAMES.has(value)
            && !token.readings?.some(reading => reading.tag === "_allow_repeat")
            && !previous.readings?.some(reading => reading.tag === "_allow_repeat")) {
          issues.push({
            ruleId: "SPANISH_WORD_REPEAT_RULE",
            category: "MISC",
            start: previous.start,
            end: token.end,
            message: "Posible error: repetición de una palabra",
            suggestions: [previous.text]
          });
        }
        previous = isWord ? token : null;
      }
    }
    return issues;
  }

  function checkUnpairedBrackets(segments = []) {
    const issues = [];
    const symmetric = new Set(["\"", "'"]);
    const apostrophes = new Set(["'", "’"]);
    const visible = tokens => tokens.filter(token => token.kind !== "space");
    const isListMarkerClose = (segmentText, tokens, index) => {
      const previous = tokens[index - 1]?.text ?? "";
      if (/^(?:\d+|[a-z])$/iu.test(previous)) return true;
      // LanguageTool exempts list markers such as "1.)" and "XII.)".
      return /(?:^|\s)(?:\d+|[ivxlcdm]+|[a-z])\.$/iu.test(segmentText.slice(0, tokens[index].start));
    };
    const stack = [];
    for (const [segmentIndex, segment] of segments.entries()) {
      const allTokens = globalThis.CorrectorSpanishText.tokenize(segment.text);
      const tokens = visible(allTokens);
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i], value = token.text;
        const previousToken = tokens[i - 1];
        const degreeMark = (at) => /[º°]/u.test(tokens[at]?.text ?? "");
        // A quote-shaped inch mark after an angular measurement is not a
        // quotation delimiter. Check before the symmetric-quote stack branch
        // below; placing this exemption after that branch leaves it unreachable.
        if ((value === "\"" || value === "'") && token.start === previousToken?.end
            && /^(?:\d[\d., ]+\d|\d{1,2})$/u.test(previousToken?.text ?? "")
            && (degreeMark(i - 2) || degreeMark(i - 4))) continue;
        if (value === "\"") {
          if (stack.at(-1)?.value === value) stack.pop();
          else stack.push({ value, expected: value, token, segment, segmentIndex });
          continue;
        }
        if (value === "'") {
          const allTokenIndex = allTokens.findIndex(item => item.start === token.start);
          const previous = allTokens[allTokenIndex - 1];
          if (stack.at(-1)?.value === value) { stack.pop(); continue; }
          // A single quote separated from the preceding word opens a quote;
          // an apostrophe attached to a word continues through the lexical
          // exception path below.
          if (!previous || previous.kind === "space") {
            stack.push({ value, expected: value, token, segment, segmentIndex });
            continue;
          }
        }
        if (BRACKET_PAIRS.has(value)) {
          const allTokenIndex = allTokens.findIndex(item => item.start === token.start);
          if (DIRECTIONAL_QUOTE_OPENERS.has(value) && !isOpeningQuote(allTokens, allTokenIndex)) {
            // A directional opening glyph after a word is functioning as a
            // mistaken closing quote. Let the dedicated quote rule diagnose
            // its shape instead of opening a spurious nested quote here.
            if (stack.at(-1)?.value === value) stack.pop();
            continue;
          }
          if (symmetric.has(value) && stack.at(-1)?.value === value) stack.pop();
          else stack.push({ value, expected: BRACKET_PAIRS.get(value), token, segment, segmentIndex });
          continue;
        }
        const opening = BRACKET_CLOSERS.get(value);
        if (!opening && !symmetric.has(value)) continue;
        if (symmetric.has(value) && stack.at(-1)?.value === value) { stack.pop(); continue; }
        if (opening && stack.at(-1)?.value === opening) { stack.pop(); continue; }

        // Straight and typographic apostrophes commonly occur in names and
        // contractions; LanguageTool exempts these when the preceding token
        // has a noun/adjective reading.
        if (apostrophes.has(value) && /\p{L}$/u.test(tokens[i - 1]?.text ?? "")
            && !stack.some(item => item.value === (opening || value))) continue;
        if (value === ")" && isListMarkerClose(segment.text, tokens, i)) continue;
        if (value === "»" && i === 1) continue;
        issues.push({
          ruleId: "ES_UNPAIRED_BRACKETS", category: "PUNCTUATION",
          start: segment.start + token.start, end: segment.start + token.end,
          message: `Símbolo desparejado: Parece que falta un ‘${opening || value}’.`,
          suggestions: [opening ? `${opening}${value}` : `${value}${value}`, ""]
        });
      }
    }
    // LanguageTool keeps one bracket stack across sentence segments. This is
    // essential for quotes containing sentence punctuation (e.g. "Thanks!"
    // followed by more text) and for a quote opened before a sentence break.
    for (const item of stack) {
      const sentenceEnded = /[.!?…]\s*$/u.test(item.segment.text);
      if (!sentenceEnded && item.segmentIndex === segments.length - 1) continue;
      issues.push({
        ruleId: "ES_UNPAIRED_BRACKETS", category: "PUNCTUATION",
        start: item.segment.start + item.token.start, end: item.segment.start + item.token.end,
        message: `Símbolo desparejado: Parece que falta un ‘${item.expected}’.`,
        suggestions: [`${item.value}${item.expected}`, ""]
      });
    }
    return issues;
  }

  function checkIncorrectSpaces(text) {
    const tokens = globalThis.CorrectorSpanishText.tokenize(text);
    const issues = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i], next = tokens[i + 1], previous = tokens[i - 1];
      if (!next || token.kind !== "punctuation" || !SPANISH_OPENERS.has(token.text)
          || next.kind !== "space" || /[\r\n\u2028\u2029]/u.test(next.text)) continue;
      if (DIRECTIONAL_QUOTE_OPENERS.has(token.text) && !isOpeningQuote(tokens, i)) continue;
      const following = tokens[i + 2];
      if (!following || following.kind === "space") continue;
      issues.push({
        ruleId: "INCORRECT_SPACES", category: "TYPOGRAPHY",
        start: token.start, end: following.end,
        message: "Sobra un espacio.", suggestions: [`${token.text}${following.text}`]
      });
    }
    for (let i = 0; i < tokens.length; i++) {
      const space = tokens[i], punctuation = tokens[i + 1], previous = tokens[i - 1];
      if (space.kind !== "space" || /[\r\n\u2028\u2029]/u.test(space.text) || !punctuation
          || punctuation.kind !== "punctuation" || !PUNCTUATION_REQUIRING_NO_PRECEDING_SPACE.has(punctuation.text)
          || !previous || previous.kind === "space") continue;
      // Dashes and a punctuation mark quoted as data are intentionally left alone.
      if (previous.kind === "punctuation" && ["-", "–", "—"].includes(previous.text)) continue;
      if (previous.kind === "punctuation" && QUOTES.has(previous.text)
          && tokens[i + 2]?.text === previous.text) continue;
      issues.push({
        ruleId: "INCORRECT_SPACES", category: "TYPOGRAPHY",
        start: previous.start, end: punctuation.end,
        message: "Sobra un espacio.", suggestions: [`${previous.text}${punctuation.text}`]
      });
    }
    return issues;
  }

  function checkSpanishOpeningMarks(segments = []) {
    const issues = [];
    for (const segment of segments) {
      const tokens = globalThis.CorrectorSpanishText.tokenize(segment.text).filter(token => token.kind !== "space");
      let first = 0, last = tokens.length - 1;
      while (first < tokens.length && SENTENCE_OPENERS.has(tokens[first].text) && !["¿", "¡"].includes(tokens[first].text)) first++;
      while (last >= first && SENTENCE_CLOSERS.has(tokens[last].text)) last--;
      const opener = tokens[first]?.text;
      const ending = tokens[last];
      if (!["¿", "¡"].includes(opener) || !ending || ![".", ":"].includes(ending.text)) continue;
      const closing = opener === "¿" ? "?" : "!";
      if (tokens.slice(first + 1, last).some(token => token.text === closing)) continue;
      const replacement = opener === "¿" ? "?" : "!";
      issues.push({
        ruleId: "ES_INITIAL_QUESTION_MARK", category: "PUNCTUATION",
        start: segment.start + ending.start, end: segment.start + ending.end,
        message: opener === "¿" ? "Símbolo de interrogación desparejado." : "Símbolo de exclamación desparejado.",
        suggestions: [replacement]
      });
    }
    return issues;
  }

  function checkCapitalizationAfterQuestionMark(segments = []) {
    const issues = [];
    for (const segment of segments) {
      const tokens = globalThis.CorrectorSpanishText.tokenize(segment.text).filter(token => token.kind !== "space");
      for (let i = 0; i + 1 < tokens.length; i++) {
        const punctuation = tokens[i], following = tokens[i + 1];
        if (!["?", "!"].includes(punctuation.text) || following.kind !== "word"
            || !/^\p{Ll}/u.test(following.text) || /^(?:https?:\/\/|www\.|[^\s@]+@[^\s@]+\.[^\s@]+$)/iu.test(following.text)
            || tokens[i - 1]?.text === "(" || /^(?:Yahoo|\d+)$/iu.test(tokens[i - 1]?.text ?? "")) continue;
        const first = [...following.text][0];
        const capitalized = first.toLocaleUpperCase("es") + following.text.slice(first.length);
        issues.push({
          ruleId: "CAPITALIZATION_AFTER_QUESTION_MARK", category: "CASING",
          start: segment.start + punctuation.start, end: segment.start + following.end,
          message: "Posible error de puntuación o mayúsculas.",
          suggestions: [`${punctuation.text} ${capitalized}`, `${punctuation.text}, ${following.text}`]
        });
      }
    }
    return issues;
  }

  function checkText(text, { sentenceSegments = [] } = {}) {
    if (typeof text !== "string") throw new TypeError("El texto castellano debe ser una cadena.");
    return [...checkRepeatedWhitespace(text), ...checkIncorrectSpaces(text), ...checkCommaAndParenthesisWhitespace(text), ...checkDoublePunctuation(text), ...checkUnpairedBrackets(sentenceSegments), ...checkSpanishOpeningMarks(sentenceSegments), ...checkCapitalizationAfterQuestionMark(sentenceSegments), ...checkSentenceStart(text, sentenceSegments), ...checkRepeatedWords(sentenceSegments)]
      .sort((a, b) => a.start - b.start || a.end - b.end || a.ruleId.localeCompare(b.ruleId));
  }

  globalThis.CorrectorSpanishStructuralRules = Object.freeze({ checkText });
})();
