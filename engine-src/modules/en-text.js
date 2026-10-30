/* LanguageTool EnglishWordTokenizer behavior with UTF-16 offsets for en-US. */
(() => {
  "use strict";
  const WORD_RUN = /[±§©@€£¥$\p{L}\d\-\u0300-\u036F\u00A8°%‰‱&\uFFFD\u00AD\u00AC，？'’]+|[^±§©@€£¥$\p{L}\d\-\u0300-\u036F\u00A8°%‰‱&\uFFFD\u00AD\u00AC，？'’]/gu;
  const CONTRACTIONS = [
    /^(fo['’]c['’]sle|rec['’][ds]|OK['’]d|cc['’][ds]|DJ['’][d]|[pd]m['’]d|rsvp['’]d)$/iu,
    /^(['’]?)(are|is|were|was|do|does|did|have|has|had|wo|would|ca|could|sha|should|must|ai|ought|might|need|may|am|dare|das|dass|hai|used|use)(n['’]t)$/iu,
    /^(.+)(['’]m|['’]re|['’]ll|['’]ve|['’]d|['’]s)(['’\-]?)$/iu,
    /^(['’]t)(was|were|is)$/iu
  ];
  const EMAIL = /(?<!:)@?\b[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@((\[[0-9]{1,3}(?:\.[0-9]{1,3}){3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\b/gu;
  // Match LanguageTool's URL joining policy: a bare domain is not enough. A
  // protocol, www prefix, or slash after the domain is required so filenames
  // and dotted identifiers remain available to grammar anti-patterns.
  const URL = /\b(?:https?|ftp|ftps|wss?|file|mailto):\/\/[^\s<>"“”]+|\bwww\.[^\s<>"“”]+|\b(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z]{2,}\/(?=[^\s<>"“”])[^\s<>"“”]*/giu;

  const token = (text, start, end, kind) => ({ text, start, end, kind });
  function collapseRanges(tokens, ranges) {
    if (!ranges.length) return tokens;
    const sorted = [...ranges].sort((a, b) => a.start - b.start || b.end - a.end), output = [];
    let ti = 0, ri = 0;
    while (ti < tokens.length) {
      const current = tokens[ti], range = sorted[ri];
      if (!range || current.end <= range.start) { output.push(current); ti++; continue; }
      if (current.start < range.start) { output.push(current); ti++; continue; }
      let endIndex = ti;
      while (endIndex < tokens.length && tokens[endIndex].end < range.end) endIndex++;
      if (endIndex >= tokens.length || tokens[endIndex].end !== range.end) { ri++; continue; }
      output.push({ ...token(range.text, range.start, range.end, "word"), isUrl: true });
      ti = endIndex + 1; ri++;
    }
    return output;
  }

  function joinAddressesAndUrls(tokens, source) {
    const ranges = [...source.matchAll(EMAIL)].map(match => ({ text: match[0], start: match.index, end: match.index + match[0].length }))
      .concat([...source.matchAll(URL)].map(match => {
        let text = match[0];
        while (/[.,;:!?]$/u.test(text)) text = text.slice(0, -1);
        return { text, start: match.index, end: match.index + text.length };
      })).filter(range => range.end > range.start).sort((a, b) => a.start - b.start);
    const nonOverlapping = [];
    for (const range of ranges) if (!nonOverlapping.length || range.start >= nonOverlapping.at(-1).end) nonOverlapping.push(range);
    return collapseRanges(tokens, nonOverlapping);
  }

  function splitHyphens(value, start, _morphology) {
    // LanguageTool's EnglishWordTokenizer always peels off leading/trailing
    // hyphens before tagging the remaining token. In particular, a trailing
    // hyphen must be its own token for rules such as EN_SPLIT_WORDS_HYPHEN.
    const output = [];
    let body = value, bodyStart = start;
    while (body.startsWith("-")) {
      output.push(token("-", bodyStart, bodyStart + 1, "punctuation"));
      body = body.slice(1);
      bodyStart++;
    }
    let trailingCount = 0;
    while (body.endsWith("-") && body.length) {
      body = body.slice(0, -1);
      trailingCount++;
    }
    if (body) output.push(token(body, bodyStart, bodyStart + body.length, "word"));
    for (let i = 0; i < trailingCount; i++) {
      const hyphenStart = bodyStart + body.length + i;
      output.push(token("-", hyphenStart, hyphenStart + 1, "punctuation"));
    }
    return output;
  }

  function splitContraction(value, start, morphology) {
    const misplacedUpperT = /^(.*)n(['’])T$/u.exec(value);
    if (misplacedUpperT) {
      const stem = misplacedUpperT[1], apostrophe = misplacedUpperT[2];
      return [token(stem, start, start + stem.length, "word"),
        token("n", start + stem.length, start + stem.length + 1, "word"),
        token(apostrophe, start + stem.length + 1, start + stem.length + 2, "punctuation"),
        token("T", start + value.length - 1, start + value.length, "word")];
    }
    // Keep malformed apostrophe forms tokenized like the raw English
    // tokenizer input. LanguageTool's raw-POS rules inspect the apostrophe
    // and the contraction ending as separate tokens (e.g. I'Ve, don'T,
    // We''ll). Normal contractions stay fused/split through the rules below.
    const doubledApostrophe = /(['’])\1/u.exec(value);
    if (doubledApostrophe) {
      const first = doubledApostrophe.index, afterPair = first + 2, output = [];
      if (first) output.push(token(value.slice(0, first), start, start + first, "word"));
      output.push(token(value[first], start + first, start + first + 1, "punctuation"));
      if (value.slice(0, first).endsWith("n") && afterPair < value.length) {
        output.push(token(value[first + 1], start + first + 1, start + first + 2, "punctuation"));
        output.push(token(value.slice(afterPair), start + afterPair, start + value.length, "word"));
      } else if (afterPair < value.length) {
        // LanguageTool keeps the second apostrophe attached to a contraction
        // or possessive tail; rules see [word, ', 's/’s].
        output.push(token(value.slice(first + 1), start + first + 1, start + value.length, "word"));
      }
      return output;
    }
    if (/['’](?:VE|Ve|vE|LL|Ll|lL)$/u.test(value)) {
      const output = []; let cursor = 0;
      for (const part of value.split(/(['’])/u).filter(Boolean)) {
        output.push(token(part, start + cursor, start + cursor + part.length,
          /^[’']$/u.test(part) ? "punctuation" : "word"));
        cursor += part.length;
      }
      return output;
    }
    const match = value.includes("'") || value.includes("’") ? CONTRACTIONS.map(pattern => pattern.exec(value)).find(Boolean) : null;
    if (!match) {
      if ((value.includes("'") || value.includes("’")) && !globalThis.CorrectorEnglishTagger.tagToken({ text: value, kind: "word" }, morphology).known) {
        const output = []; let cursor = 0;
        for (const part of value.split(/(['’])/u).filter(Boolean)) {
          output.push(token(part, start + cursor, start + cursor + part.length, /^[’']$/u.test(part) ? "punctuation" : "word"));
          cursor += part.length;
        }
        return output;
      }
      return [token(value, start, start + value.length, "word")];
    }
    const output = []; let searchFrom = 0;
    for (let group = 1; group < match.length; group++) {
      const part = match[group]; if (!part) continue;
      const index = value.indexOf(part, searchFrom); searchFrom = index + part.length;
      output.push(...splitHyphens(part, start + index, morphology));
    }
    return output.length ? output : [token(value, start, start + value.length, "word")];
  }

  function tokenize(text, morphology) {
    if (typeof text !== "string") throw new TypeError("Text to tokenize must be a string.");
    const raw = [];
    for (const match of text.matchAll(WORD_RUN)) {
      const value = match[0], start = match.index, end = start + value.length;
      if (raw.length && value.length === 1 && value.codePointAt(0) >= 0xFE00 && value.codePointAt(0) <= 0xFE0F) {
        raw.at(-1).text += value; raw.at(-1).end = end; continue;
      }
      // Keep all Unicode whitespace in the same matcher class. The token is
      // still sliced from the source so offsets and replacement text remain
      // exact (notably for NBSPs copied from web and office documents).
      if (/^\s+$/u.test(value)) raw.push(token(value, start, end, "space"));
      else if (/^[±§©@€£¥$\p{L}\d\-\u0300-\u036F\u00A8°%‰‱&\uFFFD\u00AD\u00AC，？'’]+$/u.test(value)) {
        raw.push(...splitContraction(value, start, morphology));
      } else raw.push(token(value, start, end, "punctuation"));
    }
    const joined = joinAddressesAndUrls(raw, text);
    const output = [];
    for (const item of joined) {
      if (item.kind !== "word" || item.isUrl || !item.text.includes("-")) { output.push(item); continue; }
      output.push(...splitHyphens(item.text, item.start, morphology));
    }
    return output;
  }
  globalThis.CorrectorEnglishText = Object.freeze({ tokenize });
})();
