/* Local ports of LanguageTool's punctuation/whitespace core rules for en-US. */
(() => {
  "use strict";
  function issue(ruleId, text, start, end, message, suggestions, shortMessage = "") {
    return { id: `${ruleId}:${start}:${end}`, ruleId, category: "typography", severity: "warning",
      message, ...(shortMessage ? { shortMessage } : {}), text: text.slice(start, end), start, end,
      replacementStart: start, replacementEnd: end, suggestions };
  }
  class EnglishStructuralRules {
    checkUnpairedBrackets(sentences) {
      const issues = [];
      const tokens = sentences.flatMap(sentence => sentence.tokens.filter(token => token.kind !== "space"));
      const fullText = sentences.map(sentence => sentence.text).join("");
      const opens = new Map([["(", ")"], ["[", "]"], ["{", "}"]]);
      const closes = new Set(opens.values());
      const stack = [];
      const add = (token, missing) => issues.push({ id: `EN_UNPAIRED_BRACKETS:${token.start}:${token.end}`,
        ruleId: "EN_UNPAIRED_BRACKETS", category: "punctuation", severity: "warning",
        message: `Unpaired symbol: '${missing}' seems to be missing`, text: token.text,
        start: token.start, end: token.end, replacementStart: token.start, replacementEnd: token.end, suggestions: [] });
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i], value = token.text;
        if (opens.has(value)) {
          // GenericUnpairedBracketsRule treats bracket pairs as non-symmetric
          // delimiters: unlike quotes, an opening bracket is valid directly
          // next to a word (e.g. "Island(text)").
          stack.push(token);
        } else if (closes.has(value)) {
          const expectedOpen = [...opens].find(([, close]) => close === value)?.[0];
          if (stack.at(-1)?.text === expectedOpen) stack.pop();
          else {
            const smiley = value === ")" && tokens[i - 1]?.text === "-"
              && [":", ";"].includes(tokens[i - 2]?.text) && !token.whitespaceBefore;
            const previous = tokens[i - 1];
            const listMarker = value === ")" && /^[a-zA-Z]$/u.test(previous?.text || "")
              && (previous.start === 0 || fullText[previous.start - 1] === "\n");
            if (!smiley && !listMarker) add(token, expectedOpen);
          }
        }
      }
      for (const token of stack) {
        const sentence = sentences.find(item => token.start >= item.start && token.start < item.end);
        if (sentence && /[.!?]\s*$/u.test(sentence.text)) add(token, opens.get(token.text));
      }
      return issues;
    }

    checkUnpairedQuotes(sentences) {
      const issues = [];
      const starts = ["“", '"', "'", "‘"], ends = ["”", '"', "'", "’"];
      const open = [];
      let lastApostrophe = null, wasInch = false;
      // GenericUnpairedQuotesRule uses Java's ASCII POSIX Punct, plus these dashes.
      const punctuation = value => /^[!#$%&()*+,\-./:;<=>?@[\]\\^`{|}~…–—]$/u.test(value || "");
      const corresponding = value => starts.includes(value) ? ends[starts.indexOf(value)] : starts[ends.indexOf(value)];
      const add = (token, missing) => issues.push({ id: `EN_UNPAIRED_QUOTES:${token.start}:${token.end}`,
        ruleId: "EN_UNPAIRED_QUOTES", category: "punctuation", severity: "warning",
        message: `Unpaired symbol: '${missing}' seems to be missing`, text: token.text,
        start: token.start, end: token.end, replacementStart: token.start, replacementEnd: token.end, suggestions: [] });
      const removeInner = index => {
        while (open.length - 1 > index) { const token = open.pop(); add(token, corresponding(token.text)); }
      };
      // Retain nesting/apostrophe state across sentences, but evaluate whitespace
      // and neighboring symbols within each sentence, as the Java rule does.
      for (const sentence of sentences) {
        const tokens = sentence.tokens.filter(token => token.kind !== "space");
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i], value = token.text, previous = tokens[i - 1], next = tokens[i + 1];
          const startIndex = starts.indexOf(value), endIndex = ends.indexOf(value);
          if (startIndex < 0 && endIndex < 0) continue;
          const pairIndex = startIndex >= 0 ? startIndex : endIndex;
          const symmetric = starts[pairIndex] === ends[pairIndex];
          const notQuote = (!previous || token.whitespaceBefore) && (!next || next.whitespaceBefore)
            || symmetric && previous && next && !token.whitespaceBefore && !next.whitespaceBefore
              && punctuation(previous.text) && next.text !== "." && punctuation(next.text);
          let startSymbolBefore = true;
          for (let j = i - 1; j >= 0; j--) {
            if (value !== tokens[j].text && starts.includes(tokens[j].text)) {
              if (j === 0 || tokens[j].whitespaceBefore) break;
            } else { startSymbolBefore = false; break; }
          }
          const opening = startIndex >= 0 && !notQuote && (!ends.includes(value)
            || !previous || token.whitespaceBefore || next && !next.whitespaceBefore
              && (!/^[?.!,]$/u.test(next.text) && punctuation(previous?.text) || previous?.text.endsWith("-"))
            || startSymbolBefore);
          const index = open.findIndex(item => item.text === (opening ? value : corresponding(value)));
          const closing = endIndex >= 0 && !(notQuote && (!symmetric || index < 0));
          if (!opening && !closing) continue;
          if (token.readings?.some(reading => ["_apostrophe_contraction_", "POS", "NNP"].includes(reading.tag))) {
            lastApostrophe = value;
            continue;
          }
          if (opening) {
            if (value === '"') wasInch = false;
            if (lastApostrophe === value) lastApostrophe = null;
            if (index >= 0) removeInner(index - 1);
            open.push(token);
          } else {
            const inchSymbol = value === '"', inch = inchSymbol && /\d"/u.test(sentence.text);
            if (index >= 0) {
              removeInner(index);
              open.splice(index, 1);
              if (lastApostrophe === corresponding(value)) lastApostrophe = null;
              if (inch) wasInch = true;
            } else if (!inch && (!inchSymbol || !wasInch)) {
              if (lastApostrophe !== value) add(token, corresponding(value));
              else lastApostrophe = null;
            } else wasInch = false;
          }
        }
      }
      removeInner(-1);
      return issues;
    }

    checkParagraphEndPunctuation(text, segments) {
      const issues = [];
      const paragraphs = [];
      const separator = /(?:\r?\n)[\t \u00A0]*(?:\r?\n)+/gu;
      let start = 0, match;
      while ((match = separator.exec(text))) { paragraphs.push({ text: text.slice(start, match.index), start }); start = match.index + match[0].length; }
      paragraphs.push({ text: text.slice(start), start });
      for (const entry of paragraphs) {
        const paragraph = entry.text;
        const start = entry.start, end = start + paragraph.length;
        const localSegments = segments.filter(item => item.start < end && item.end > start);
        if (localSegments.length < 2) continue;
        const trimmed = paragraph.trim();
        if (!trimmed || /^[\d.]+$/u.test(trimmed)) continue;
        const last = paragraph.match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?(?=\s*$)/u);
        if (!last) continue;
        const token = last[0], tokenStart = start + last.index;
        if (token.length > 30 && /^(?:https?|ftp)/iu.test(token)) continue;
        issues.push({ id: `PUNCTUATION_PARAGRAPH_END:${tokenStart}:${tokenStart + token.length}`,
          ruleId: "PUNCTUATION_PARAGRAPH_END", category: "punctuation", severity: "warning",
          message: "Please add a punctuation mark at the end of paragraph.", text: token,
          start: tokenStart, end: tokenStart + token.length, replacementStart: tokenStart, replacementEnd: tokenStart + token.length,
          suggestions: [".", "!", "?", ":", ",", ";"].map(mark => token + mark) });
      }
      return issues;
    }

    checkLongSentences(sentences, { checkLevel = "DEFAULT", maxWords = 40 } = {}) {
      if (checkLevel !== "PICKY") return [];
      const issues = [];
      const openingQuotes = new Set(["\"", "“", "„", "«", "(", "[", "{", "—"]);
      const closingQuotes = new Set(["\"", "”", "“", "»", ")", "]", "}", "—"]);
      const isWord = token => /^[\p{L}\p{N}]/u.test(String(token?.text || ""));
      for (const sentence of sentences || []) {
        const tokens = sentence.tokens || [];
        if (tokens.length < maxWords || /[?!.]["“”„»«]/u.test(sentence.text)) continue;
        let count = 0, quote = null, first = null, shouldReport = false;
        for (const token of tokens) {
          if (token.kind === "space") continue;
          const value = String(token.text || "");
          if (!quote && openingQuotes.has(value)) quote = value;
          else if (quote && closingQuotes.has(value) && (value === "—" || value === "\"" || value === "”" && ["“", "„", "«"].includes(quote)
              || value === ")" && quote === "(" || value === "]" && quote === "[" || value === "}" && quote === "{")) quote = null;
          if ([":", ";", "\n", "\r\n", "\n\r"].includes(value)) break;
          if (!quote && isWord(token)) {
            if (!first) first = token;
            if (count === maxWords) { shouldReport = true; break; }
            count++;
          }
        }
        if (!shouldReport || !first) continue;
        let last = null;
        for (let i = tokens.length - 1; i >= 0; i--) {
          if (isWord(tokens[i])) {
            last = tokens[i + 1] && /^[.!?]$/u.test(tokens[i + 1].text) ? tokens[i + 1] : tokens[i];
            break;
          }
        }
        if (!last) continue;
        const start = first.start, end = last.end;
        issues.push({ id: `TOO_LONG_SENTENCE:${start}:${end}`, ruleId: "TOO_LONG_SENTENCE", category: "style", severity: "hint",
          message: `This sentence is over ${maxWords} words long. Consider splitting it up, as shorter sentences make the text easier to read.`,
          shortMessage: "", text: sentence.text.slice(start - sentence.start, end - sentence.start), start, end,
          replacementStart: start, replacementEnd: end, suggestions: [], _picky: true });
      }
      return issues;
    }

    checkSentenceWhitespace(text, segments) {
      const issues = [];
      const sentenceEnd = /[.!?…]$/u;
      const lineBreak = /[\r\n\u2028\u2029]/u;
      const onlySpaces = value => value.length > 0 && /^ +$/u.test(value);
      for (let i = 0; i < segments.length; i++) {
        const current = segments[i], previous = segments[i - 1];
        if (!previous || !sentenceEnd.test(previous.text.trimEnd())) continue;
        const previousWhitespace = previous.text.slice(previous.text.trimEnd().length);
        const currentWhitespace = current.text.match(/^\s*/u)?.[0] || "";
        if (lineBreak.test(previousWhitespace) || lineBreak.test(currentWhitespace)) continue;
        const nextToken = current.text.slice(currentWhitespace.length).match(/^(?:["'“”‘’«»„¿¡([{]*)([^\s]+)/u)?.[0];
        if (!nextToken) continue;
        const tokenStart = current.start + currentWhitespace.length;
        if (!previousWhitespace && !currentWhitespace) {
          const firstWord = nextToken;
          issues.push({ id: `SENTENCE_WHITESPACE:${tokenStart}:${tokenStart + firstWord.length}`, ruleId: "SENTENCE_WHITESPACE",
            category: "typography", severity: "warning", message: "Add a space between sentences.", text: firstWord,
            start: tokenStart, end: tokenStart + firstWord.length, replacementStart: tokenStart, replacementEnd: tokenStart + firstWord.length,
            suggestions: [` ${firstWord}`] });
        } else if (onlySpaces(previousWhitespace + currentWhitespace)
            && previousWhitespace.length + currentWhitespace.length > 2) {
          const start = previous.end - previousWhitespace.length;
          const end = current.start + currentWhitespace.length;
          issues.push({ id: `SENTENCE_WHITESPACE:${start}:${end}`, ruleId: "SENTENCE_WHITESPACE", category: "typography",
            severity: "warning", message: "Possible typo: you repeated a whitespace", text: text.slice(start, end), start, end,
            replacementStart: start, replacementEnd: end, suggestions: [" "] });
        }
      }
      return issues;
    }

    checkUppercaseSentenceStart(text, segments) {
      const issues = [];
      const exceptions = new Set(["n", "w", "n/a", "w/o", "x86", "ⓒ", "ø", "cc", "pH", "heylogin"]);
      const numeral = /^(?:[a-z]|m{0,4}(?:c[md]|d?c{0,3})(?:x[cl]|l?x{0,3})(?:i[xv]|v?i{0,3}))$/iu;
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (/^\s*(?:[a-z]|m{0,4}(?:c[md]|d?c{0,3})(?:x[cl]|l?x{0,3})(?:i[xv]|v?i{0,3}))[.)]\s+/iu.test(segment.text)) continue;
        const prefix = segment.text.match(/^\s*/u)?.[0] || "";
        const afterPrefix = segment.text.slice(prefix.length);
        // LanguageTool checks the first non-quote token. If that token is an
        // ellipsis, it is not a lowercase sentence starter; don't skip it and
        // then report the following word as though it were the first token.
        if (afterPrefix.startsWith("…") || afterPrefix.startsWith("...")) continue;
        const previousSegment = i > 0 ? segments[i - 1].text.trim() : "";
        // SRX can split a leading standalone ellipsis into its own segment,
        // or split an ellipsis used mid-sentence. Java keeps those contexts
        // attached when deciding which token is the sentence starter.
        if (/^(?:…|\.\.\.)$/u.test(previousSegment)
            || /[\p{L}\p{N}]…$/u.test(previousSegment)) continue;
        const token = afterPrefix.match(/^(?:["'„«»‘’“”¡¿]+)?([\p{L}\p{N}ⓒø][\p{L}\p{M}\p{N}_'’/-]*)/u);
        if (!token) continue;
        const leadingQuotes = token[0].length - token[1].length;
        const word = token[1];
        const start = segment.start + prefix.length + leadingQuotes;
        const rest = afterPrefix.slice(token[0].length).trimStart();
        const remainingSentence = afterPrefix.slice(leadingQuotes);
        const beginsUrlOrEmail = /^(?:https?:\/\/|www\.)\S+|^[\w.+-]+@[\w.-]+(?::|\/|\b)|^[\w.-]+\.(?:com|org|net|int|edu|gov|mil|[a-z]{2})(?=\/|\b|$)/iu.test(remainingSentence);
        if (!/^\p{Ll}/u.test(word) || /^[a-z][A-Z]/u.test(word)
            || exceptions.has(word) || /^[\p{L}]+[A-Z][\p{L}]*$/u.test(word)
            || /\p{N}/u.test(word) || beginsUrlOrEmail
            || (i === 0 && !rest) || numeral.test(word) && /^[.)]$/u.test(rest[0] || "")) continue;
        const previousText = i > 0 ? segments[i - 1].text.trimEnd() : "";
        if (i > 0 && !/[.!?…]$/u.test(previousText)) continue;
        const replacement = word[0].toLocaleUpperCase("en-US") + word.slice(1);
        issues.push({ id: `UPPERCASE_SENTENCE_START:${start}:${start + word.length}`, ruleId: "UPPERCASE_SENTENCE_START",
          category: "typography", severity: "warning", message: "This sentence does not start with an uppercase letter.",
          text: word, start, end: start + word.length, replacementStart: start, replacementEnd: start + word.length,
          suggestions: [replacement] });
      }
      return issues;
    }

    checkCommaWhitespace(sentences) {
      if (sentences.length > 1) return sentences.flatMap(sentence => this.checkCommaWhitespace([sentence]));
      const issues = [];
      const tokens = sentences.flatMap(sentence => sentence.tokens);
      let previous = "", previousPrevious = "", previousWasWhitespace = false;
      const isSpace = token => token.kind === "space" && token.text !== "\u200B";
      const isQuote = value => value.length === 1 && "'\"’””“«»".includes(value);
      const isDigit = value => /\p{N}/u.test(value);
      const containsDigit = value => /\p{N}/u.test(value);
      const isFileExtension = value => /^(?:[a-z]{3,4}|[A-Z]{3,4}|ai|mp[34]|MP[34])(?:-.+)?$/u.test(value);
      const isDomain = value => /^(?:com|org|net|int|edu|gov|mil|[a-z]{2})$/iu.test(value);
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const value = token.text;
        const whitespace = isSpace(token) || value === "\u00A0";
        let message = "", replacement = "", alternatives = null;
        if (whitespace && previous === "(") {
          message = "Don't put a space after the opening parenthesis.";
          replacement = previous;
        } else if (whitespace && isQuote(previous) && previousPrevious === " ") {
          message = "Don't put a space on both sides of a quote symbol.";
          replacement = previous;
          alternatives = [`${replacement} `, ` ${replacement}`];
        } else if (!whitespace && previous === "," && !isQuote(value) && value !== "-" && value !== ","
            && !containsDigit(previousPrevious) && !containsDigit(value) && previousPrevious !== ",") {
          message = "Put a space after the comma.";
          replacement = `, ${value}`;
        } else if (previousWasWhitespace) {
          if (value === ")") {
            message = "Don't put a space before the closing parenthesis.";
            replacement = value;
          } else if (value === "]" && previous === " " && tokens[i - 2]?.text === "[") {
            message = ""; // The core rule exempts Markdown checkboxes: [ ]
          } else if (value === ",") {
            if (tokens[i + 1]?.text !== ",") {
              message = "Put a space after the comma, but not before the comma.";
              replacement = tokens[i + 1] && !isSpace(tokens[i + 1]) ? ", " : ",";
            }
          } else if (value === "." && !isDomain(tokens[i + 1]?.text || "")
              && !isFileExtension(tokens[i + 1]?.text || "")
              && !token.readings?.some(reading => reading.tag === "NNP" || reading.tag === "NNPS")) {
            if (!tokens[i + 1] || (!isDigit(tokens[i + 1].text) && tokens[i + 1].text !== "."
                && !(tokens[i + 1].text === "/" && /^[a-z]+$/iu.test(tokens[i + 2]?.text || "")))) {
              message = "Don't put a space before the full stop.";
              replacement = ".";
            }
          }
        }
        if (message && i > 0) {
          let startTokenIndex = i - 1;
          if (alternatives) startTokenIndex = i - 2;
          const start = tokens[startTokenIndex]?.start;
          const end = token.end;
          if (Number.isInteger(start) && Number.isInteger(end)) {
            const suggestionList = alternatives || [replacement];
            const original = tokens.slice(startTokenIndex, i + 1).map(item => item.text).join("");
            // CommaWhitespaceRule avoids emitting a no-op replacement whose range
            // and replacement text are identical.
            if (alternatives || original !== replacement) {
              issues.push({ id: `COMMA_PARENTHESIS_WHITESPACE:${start}:${end}`, ruleId: "COMMA_PARENTHESIS_WHITESPACE",
                category: "typography", severity: "warning", message, text: original, start, end,
                replacementStart: start, replacementEnd: end, suggestions: suggestionList });
            }
          }
        }
        previousPrevious = previous;
        previous = value;
        previousWasWhitespace = whitespace;
      }
      return issues;
    }

    findConsecutiveSpacesPattern(text, sentenceSegments = []) {
      const issues = [];
      const pattern = /[A-Za-zéèëêïîìáàâçôòüûùäöüß,.;\d]([\u00A0 ]{2})[A-Za-zéèëêïîìáàâçôòüûùäöüß,.;\d]/gu;
      const sentenceBoundaries = new Set(sentenceSegments.slice(1).map(segment => segment.start));
      for (const match of text.matchAll(pattern)) {
        const start = match.index + match[0].indexOf(match[1]);
        const end = start + match[1].length;
        if ([...sentenceBoundaries].some(boundary => boundary > start && boundary < end)) continue;
        issues.push({ id: `CONSECUTIVE_SPACES:${start}:${end}`, ruleId: "CONSECUTIVE_SPACES",
          category: "typography", severity: "warning",
          message: "It seems like there are too many consecutive spaces here.", text: match[1], start, end,
          replacementStart: start, replacementEnd: end, suggestions: [" "], _languagePriority: 0,
          _registrationOrder: Number.MAX_SAFE_INTEGER });
      }
      return issues;
    }
    check(text, sentenceSegments = []) {
      const issues = [];
      // DoublePunctuationRule: exactly two adjacent periods or commas; ellipses,
      // paths continuing with a slash, and punctuation after ?/!/ellipsis are exempt.
      const doublePunctuation = /(?<![?!…\.])\.{2}(?![.…/\\])|,{2}(?!,)/gu;
      for (const match of text.matchAll(doublePunctuation)) {
        const token = match[0];
        const period = token[0] === ".";
        issues.push(issue("DOUBLE_PUNCTUATION", text, match.index, match.index + 2,
          period ? "Two consecutive dots" : "Two consecutive commas",
          period ? [".", "…"] : [","], period ? "Two consecutive dots" : "Two consecutive commas"));
      }
      // MultipleWhitespaceRule excludes line breaks, tabs and invisible joiners.
      const repeatedWhitespace = /[\p{Zs}\u00A0]{2,}/gu;
      const sentenceBoundaries = new Set(sentenceSegments.slice(1).map(segment => segment.start));
      for (const match of text.matchAll(repeatedWhitespace)) {
        if (match[0] === "  " && [...sentenceBoundaries].some(boundary => boundary > match.index && boundary < match.index + 2)) continue;
        const first = [...match[0]][0];
        issues.push(issue("WHITESPACE_RULE", text, match.index, match.index + match[0].length,
          "Possible typo: you repeated a whitespace", [first]));
      }
      return issues;
    }
  }
  globalThis.CorrectorEnglishStructuralRules = EnglishStructuralRules;
})();
