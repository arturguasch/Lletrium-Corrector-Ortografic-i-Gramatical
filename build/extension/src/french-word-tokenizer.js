/* French tokenization adapter based on the pinned LanguageTool tokenizer contract.
 * It uses the French POS data to decide whether an unknown hyphenated form is
 * one lexical token or should be split, as LanguageTool does.
 */
(() => {
  "use strict";

  const WORD_CHARS = "§©@€£\\$_\\p{L}\\d\\-\\u0300-\\u036F\\u00A8\\u2070-\\u209F°%‰‱&\\uFFFD\\u00AD\\u00AC";
  const TOKEN_PATTERN = new RegExp(`[${WORD_CHARS}]+|[^${WORD_CHARS}]`, "gu");
  const APOS = "['’]";
  const ELISION = "[cçj n m t s l d]".replaceAll(" ", "");
  const CLITIC = "-ce|-t-elle|-t-elles|-elle|-elles|-en|-il|-t-il|-ils|-t-ils|-je|-la|-le|-les|-leur|-lui|-moi|-nous|-on|-t-on|-toi|-tu|-vous|-vs|-y";
  const TOKEN_PATTERNS = [
    new RegExp("^(c['’]te?|m['’]as-tu-vu|c['’]est-à-dire|add-on|add-ons|rendez-vous|garde-à-vous|chez-eux|chez-moi|chez-nous|chez-soi|chez-toi|chez-vous)$", "iu"),
    new RegExp(`^(${ELISION}${APOS}|qu${APOS}|jusqu${APOS}|lorsqu${APOS}|puisqu${APOS}|quoiqu${APOS})([^-]*)(${CLITIC})$`, "iu"),
    new RegExp(`^(${ELISION}${APOS}|qu${APOS}|jusqu${APOS}|lorsqu${APOS}|puisqu${APOS}|quoiqu${APOS})([^'’\\-].*)$`, "iu"),
    new RegExp(`^([^-\\d]+)(${CLITIC})(${CLITIC})$`, "iu"),
    new RegExp(`^([^\\-]*)(-t|-m)(${APOS}en|${APOS}y)$`, "iu"),
    new RegExp("^(.*)(-t-elle|-t-elles|-t-il|-t-ils|-t-on)$", "iu"),
    new RegExp(`^(.*)(${CLITIC})$`, "iu"),
  ];
  const DO_NOT_SPLIT = new Set([
    "mers-cov", "mcgraw-hill", "sars-cov-2", "sars-cov", "ph-metre", "ph-metres", "anti-ivg", "anti-uv",
    "anti-vih", "al-qaïda", "c'est-à-dire", "add-on", "add-ons", "rendez-vous", "garde-à-vous", "chez-eux",
    "chez-moi", "chez-nous", "chez-soi", "chez-toi", "chez-vous", "m'as-tu-vu",
  ]);
  const REPLACEMENTS = [
    [/([\p{L}])'([\p{L}1"‘“«])/giu, "$1xxFR_APOS_TYPEWxx$2"],
    [/([\p{L}])’([\p{L}1"‘“«])/gu, "$1xxFR_APOS_TYPOGxx$2"],
    [/([\p{L}])-([\p{L}])-([\p{L}])/giu, "$1xxFR_HYPHENxx$2xxFR_HYPHENxx$3"],
    [/([\p{L}])-([\p{L}\d])/giu, "$1xxFR_HYPHENxx$2"],
    [/([\d])\.([\d])/gu, "$1xxFR_DECIMALPOINTxx$2"],
    [/([\d]),([\d])/gu, "$1xxFR_DECIMALCOMMAxx$2"],
    [/([\d]) ([\d][\d][\d]) ([\d][\d][\d])\b/gu, "$1xxFR_SPACExx$2xxFR_SPACExx$3"],
    [/([\d]{4}) /gu, "$1xxFR_SPACE0xx"],
    [/([\d]) ([\d][\d][\d])\b/gu, "$1xxFR_SPACExx$2"],
  ];
  const RESTORE = Object.freeze({
    xxFR_APOS_TYPEWxx: "'", xxFR_APOS_TYPOGxx: "’", xxFR_HYPHENxx: "-",
    xxFR_DECIMALPOINTxx: ".", xxFR_DECIMALCOMMAxx: ",", xxFR_SPACExx: " ",
  });

  class FrenchWordTokenizer {
    constructor(morphology) { this.morphology = morphology; }

    tokenize(input) {
      let text = String(input ?? "").replace(/[‐‑]/gu, "-");
      for (const [pattern, replacement] of REPLACEMENTS) text = text.replace(pattern, replacement);
      text = text.replaceAll("xxFR_SPACE0xx", " ");
      const tokens = [];
      for (const match of text.matchAll(TOKEN_PATTERN)) {
        let token = match[0].replace(/xxFR_APOS_TYPEWxx|xxFR_APOS_TYPOGxx|xxFR_HYPHENxx|xxFR_DECIMALPOINTxx|xxFR_DECIMALCOMMAxx|xxFR_SPACExx/gu, value => RESTORE[value]);
        if (token.length === 1 && token.codePointAt(0) >= 0xFE00 && token.codePointAt(0) <= 0xFE0F) {
          if (tokens.length) tokens[tokens.length - 1] += token;
          else tokens.push(token);
          continue;
        }
        if (token.length === 1 && !new RegExp(`[${WORD_CHARS}]`, "u").test(token)) { tokens.push(token); continue; }
        while (token.length > 1 && token.startsWith("-")) { tokens.push("-"); token = token.slice(1); }
        let trailingHyphens = 0;
        while (token.length > 1 && token.endsWith("-")) { token = token.slice(0, -1); trailingHyphens++; }
        const matchPattern = TOKEN_PATTERNS.find(pattern => pattern.test(token));
        if (matchPattern) {
          const groups = token.match(matchPattern).slice(1).filter(value => value !== undefined);
          for (const group of groups) tokens.push(...this.#wordsToAdd(group));
        } else tokens.push(...this.#wordsToAdd(token));
        while (trailingHyphens-- > 0) tokens.push("-");
      }
      return joinEmails(tokens);
    }

    tokenizeRows(input) {
      const text = String(input ?? "");
      const tokens = this.tokenize(text);
      const rows = [];
      let offset = 0;
      const comparable = value => value.normalize("NFC").replace(/[‐‑]/gu, "-");
      for (const token of tokens) {
        const expected = comparable(token);
        let end = offset;
        while (end < text.length) {
          const codePoint = text.codePointAt(end);
          end += codePoint > 0xFFFF ? 2 : 1;
          const source = text.slice(offset, end);
          const value = comparable(source);
          if (value === expected) break;
          // NFC can compose only after the following combining mark has been
          // consumed, so a partial grapheme need not prefix the normalized token.
          if (value.length > expected.length + 8) {
            throw new Error(`French tokenizer offset mismatch at UTF-16 ${offset}: ${JSON.stringify(token)}.`);
          }
        }
        if (comparable(text.slice(offset, end)) !== expected) {
          throw new Error(`French tokenizer could not map token to original text at UTF-16 ${offset}: ${JSON.stringify(token)}.`);
        }
        const start = offset;
        offset = end;
        if (/^\s+$/u.test(token)) continue;
        const tagged = this.morphology?.tagWord(token);
        const readings = (tagged?.readings || []).map(item => ({ lemma: item.lemma, tag: item.tag || "UNKNOWN" }));
        // FrenchTagger marks apostrophe style as chunk metadata. A number of
        // French XML patterns inspect this distinction, so preserve the
        // original character style even though both variants share readings.
        const chunks = token.includes("’") ? ["containsTypographicApostrophe"]
          : token.includes("'") ? ["containsTypewriterApostrophe"] : [];
        rows.push({
          token: text.slice(start, end), start, end,
          chunks,
          analysis: { lexical: !!tagged?.known, readings },
          ltReadings: readings.length ? readings : [{ lemma: null, tag: "UNKNOWN" }]
        });
      }
      if (offset !== text.length) throw new Error(`French tokenizer left ${text.length - offset} UTF-16 code units unmapped.`);
      return rows;
    }

    #wordsToAdd(value) {
      if (!value) return [];
      if (!value.includes("-")) return [value];
      const normalized = value.replace(/\u00AD/gu, "").replaceAll("’", "'");
      if (this.morphology?.lookup(normalized).length || DO_NOT_SPLIT.has(value.toLocaleLowerCase("fr"))) return [value];
      return value.split(/(-)/u).filter(Boolean);
    }
  }

  function joinEmails(tokens) {
    if (!tokens.some(token => token.includes("@"))) return tokens;
    const text = tokens.join("");
    const pattern = /(?<!:)@?\b[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:\[[0-9]{1,3}(?:\.[0-9]{1,3}){3}\]|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})\b/gu;
    const matches = [...text.matchAll(pattern)];
    if (!matches.length) return tokens;
    const result = [];
    let tokenIndex = 0, position = 0;
    for (const match of matches) {
      const start = match.index, end = start + match[0].length;
      while (tokenIndex < tokens.length && position + tokens[tokenIndex].length <= start) {
        result.push(tokens[tokenIndex]);
        position += tokens[tokenIndex++].length;
      }
      if (position < start) {
        result.push(text.slice(position, start));
        while (tokenIndex < tokens.length && position + tokens[tokenIndex].length <= start) position += tokens[tokenIndex++].length;
      }
      result.push(match[0]);
      while (tokenIndex < tokens.length && position < end) position += tokens[tokenIndex++].length;
    }
    while (tokenIndex < tokens.length) result.push(tokens[tokenIndex++]);
    return result;
  }

  globalThis.CorrectorFrenchWordTokenizer = FrenchWordTokenizer;
})();
