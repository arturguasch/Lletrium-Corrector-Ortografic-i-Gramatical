/* SpanishWordTokenizer behavior from LanguageTool (LGPL-2.1), with UTF-16 ranges. */
(() => {
  "use strict";

  const WORD_CHAR = "§©@€£\\$_\\p{L}\\d·\\-\\u0300-\\u036F\\u00A8\\u2070-\\u209F°%‰‱&\\uFFFD\\u00AC";
  const WORD_RUN = new RegExp(`[${WORD_CHAR}]+|[^${WORD_CHAR}]`, "gu");
  const WORD_ONLY = new RegExp(`^[${WORD_CHAR}]+$`, "u");
  const EMAIL = /(?<!:)@?\b[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\b/gu;
  const PROTOCOLS = new Set(["http", "https", "ws", "wss", "ftp", "ftps", "sftp", "file", "mailto", "tel", "sms", "git", "ssh", "data", "magnet", "smb", "slack", "spotify"]);
  const URL_TAIL = /^[a-zA-ZÄÖÜäöü0-9/%$-_.+!*'(),?#~]+$/u;
  const URL_DOMAIN_LABEL = /^[a-zA-Z0-9][a-zA-Z0-9-]+$/u;
  const ORDINAL_SUFFIX = /^(?:º|ª|o|a|er|os|as)$/iu;
  const KNOWN_HYPHENATED = new Set(["mers-cov", "mcgraw-hill", "sars-cov-2", "sars-cov", "ph-metre", "ph-metres"]);

  function makeToken(text, start, end, kind) { return { text, start, end, kind }; }

  function collapseRanges(tokens, ranges) {
    if (!ranges.length) return tokens;
    const output = [];
    let tokenIndex = 0, cursor = 0;
    for (const range of ranges) {
      while (tokenIndex < tokens.length && cursor + tokens[tokenIndex].text.length <= range.start) {
        output.push(tokens[tokenIndex]);
        cursor += tokens[tokenIndex++].text.length;
      }
      let endIndex = tokenIndex, covered = cursor;
      while (endIndex < tokens.length && covered < range.end) covered += tokens[endIndex++].text.length;
      if (covered < range.end) continue;
      const start = tokens[tokenIndex].start, end = tokens[endIndex - 1].end;
      output.push(makeToken(range.text, start, end, "word"));
      cursor = covered;
      tokenIndex = endIndex;
    }
    output.push(...tokens.slice(tokenIndex));
    return output;
  }

  function joinEmails(tokens) {
    const text = tokens.map(token => token.text).join("");
    if (!text.includes("@")) return tokens;
    const ranges = [...text.matchAll(EMAIL)].map(match => ({ start: match.index, end: match.index + match[0].length, text: match[0] }));
    return collapseRanges(tokens, ranges).map(token => ranges.some(range => range.start === token.start && range.end === token.end)
      ? { ...token, isUrl: true } : token);
  }

  function urlStartsAt(index, tokens) {
    const token = tokens[index].text;
    if (PROTOCOLS.has(token.toLowerCase()) && tokens[index + 1]?.text === ":" && tokens[index + 2]?.text === "/" && tokens[index + 3]?.text === "/") return true;
    if (token === "www" && tokens[index + 1]?.text === ".") return true;
    if (!URL_DOMAIN_LABEL.test(token)) return false;
    let cursor = index, labels = 1, finalLabel = token;
    while (tokens[cursor + 1]?.text === "." && URL_DOMAIN_LABEL.test(tokens[cursor + 2]?.text || "")) {
      finalLabel = tokens[cursor + 2].text;
      labels++;
      cursor += 2;
    }
    // Accept bare host names as well as hosts followed by a path. Requiring a
    // multi-letter TLD prevents decimal/version strings and single-letter
    // abbreviations from being consumed as URLs.
    const lowerTld = finalLabel.toLocaleLowerCase("en");
    const upperTld = finalLabel.toLocaleUpperCase("en");
    const tldHasDomainCasing = finalLabel === lowerTld || finalLabel === upperTld;
    return labels >= 2 && /\p{L}/u.test(finalLabel) && [...finalLabel].length >= 2 && tldHasDomainCasing;
  }

  function joinUrls(tokens) {
    const output = [];
    for (let index = 0; index < tokens.length;) {
      if (!urlStartsAt(index, tokens)) { output.push(tokens[index++]); continue; }
      const startIndex = index, start = tokens[index].start;
      let endIndex = index + (tokens[index + 1]?.text === "." ? 2 : 1);
      while (endIndex < tokens.length) {
        const token = tokens[endIndex].text;
        if (/^\s+$/u.test(token) || [")", "]", "}", "<", ">", '"', "'"].includes(token)) break;
        if ([".", ",", ";", ":", "!", "?"].includes(token) && !tokens[endIndex + 1]) break;
        if (!URL_TAIL.test(token) && !/^[:/]$/u.test(token)) break;
        endIndex++;
      }
      while (endIndex > startIndex + 1 && [".", ",", ";", ":", "!", "?"].includes(tokens[endIndex - 1].text)) endIndex--;
      if (endIndex <= startIndex) { output.push(tokens[index++]); continue; }
      const parts = tokens.slice(startIndex, endIndex), text = parts.map(token => token.text).join("");
      output.push({ ...makeToken(text, start, parts.at(-1).end, "word"), isUrl: true });
      index = endIndex;
    }
    return output;
  }

  function splitHyphenated(token, morphology) {
    const value = token.text;
    if (!value.includes("-") || token.isUrl) return [token];
    const lookup = value.replace(/\u00AD/gu, "").replace(/’/gu, "'");
    const known = morphology && globalThis.CorrectorSpanishTagger
      ? globalThis.CorrectorSpanishTagger.tagToken({ text: lookup, kind: "word" }, morphology).readings.some(reading => reading.tag != null)
      : morphology ? morphology.lookup(lookup).length > 0 : false;
    if (known || KNOWN_HYPHENATED.has(value.toLocaleLowerCase("es"))) return [token];
    const output = [];
    let start = token.start;
    for (const part of value.split(/(-)/u).filter(Boolean)) {
      output.push(makeToken(part, start, start + part.length, "word"));
      start += part.length;
    }
    return output;
  }

  function mergeAdjacentNumericParts(tokens, sourceText) {
    const output = [];
    for (let index = 0; index < tokens.length;) {
      const first = tokens[index];
      if (!/^\d+$/u.test(first.text)) {
        output.push(first);
        index++;
        continue;
      }

      let endIndex = index, end = first.end, mergedSeparator = false;
      while ([".", ","].includes(tokens[endIndex + 1]?.text)
          && tokens[endIndex + 1].start === end
          && /^\d+(?:[\p{L}%‰‱]+[0-9²³]*)?$/u.test(tokens[endIndex + 2]?.text || "")
          && tokens[endIndex + 2].start === tokens[endIndex + 1].end) {
        mergedSeparator = true;
        endIndex += 2;
        end = tokens[endIndex].end;
        // Match LanguageTool's non-overlapping digit-separator-digit
        // preprocessing: a one-digit middle component ends the numeric run.
        if (!/^\d{2,}$/u.test(tokens[endIndex].text)) break;
      }

      const ordinal = !mergedSeparator && tokens[endIndex + 1]?.text === "."
        && tokens[endIndex + 1].start === end && ORDINAL_SUFFIX.test(tokens[endIndex + 2]?.text || "")
        && tokens[endIndex + 2].start === tokens[endIndex + 1].end;
      if (mergedSeparator || ordinal) {
        const last = ordinal ? tokens[endIndex + 2] : tokens[endIndex];
        output.push(makeToken(sourceText.slice(first.start, last.end), first.start, last.end, "word"));
        index = ordinal ? endIndex + 3 : endIndex + 1;
        continue;
      }
      output.push(first);
      index++;
    }
    return output;
  }

  function tokenize(text, morphology) {
    if (typeof text !== "string") throw new TypeError("El texto que se va a tokenizar debe ser una cadena.");
    const normalizedHyphens = text.replace(/[\u2010\u2011]/gu, "-");
    const tokens = [];
    for (const match of normalizedHyphens.matchAll(WORD_RUN)) {
      const value = match[0], start = match.index, end = start + value.length;
      if (tokens.length && value.length === 1 && value.codePointAt(0) >= 0xFE00 && value.codePointAt(0) <= 0xFE0F) {
        tokens.at(-1).text += value;
        tokens.at(-1).end = end;
        continue;
      }
      tokens.push(makeToken(value, start, end, /^\s+$/u.test(value) ? "space" : WORD_ONLY.test(value) ? "word" : "punctuation"));
    }

    // Mark e-mail addresses and host names before splitting unknown hyphenated
    // compounds; otherwise a domain such as `mail-archive.com` is reduced to
    // ordinary words and grammar rules can treat its labels as Spanish verbs.
    const urlAwareTokens = joinUrls(joinEmails(tokens));

    // LanguageTool protects every digit-separator-digit pair before tokenizing,
    // so complete dotted/comma-separated numeric runs (dates, decimals,
    // versions, identifiers) remain one lexical token. Keep an adjacent unit
    // suffix in that token too, as the protected marker is word-character text.
    const merged = [];
    for (let index = 0; index < urlAwareTokens.length;) {
      const first = urlAwareTokens[index], dotOrComma = urlAwareTokens[index + 1], tail = urlAwareTokens[index + 2];
      if (/^\d+$/u.test(first.text)) {
        let endIndex = index, end = first.end, hasNumericSeparator = false;
        while ([".", ","].includes(urlAwareTokens[endIndex + 1]?.text)
            && urlAwareTokens[endIndex + 1].start === end
            && /^\d+(?:[\p{L}%‰‱]+[0-9²³]*)?$/u.test(urlAwareTokens[endIndex + 2]?.text || "")
            && urlAwareTokens[endIndex + 2].start === urlAwareTokens[endIndex + 1].end) {
          hasNumericSeparator = true;
          endIndex += 2;
          end = urlAwareTokens[endIndex].end;
          // The upstream decimal preprocessor uses non-overlapping matches
          // of digit-separator-digit. A one-digit middle component has already
          // consumed its only digit, so another separator stays punctuation.
          // Units, percentages and exponents also end the numeric run.
          if (!/^\d{2,}$/u.test(urlAwareTokens[endIndex].text)) break;
        }
        if (hasNumericSeparator) {
          merged.push(makeToken(normalizedHyphens.slice(first.start, end), first.start, end, "word"));
          index = endIndex + 1;
          continue;
        }
      }
      const ordinal = /^\d+$/u.test(first.text) && dotOrComma?.text === "." && dotOrComma.start === first.end
        && ORDINAL_SUFFIX.test(tail?.text || "") && tail.start === dotOrComma.end;
      if (ordinal) {
        merged.push(makeToken(normalizedHyphens.slice(first.start, tail.end), first.start, tail.end, "word"));
        index += 3;
        continue;
      }
      merged.push(...(first.kind === "word" ? splitHyphenated(first, morphology) : [first]));
      index++;
    }
    // Splitting an unknown hyphenated compound can expose a decimal run that
    // was hidden inside the original word token (e.g. "1981-1.989"). Apply
    // LanguageTool's numeric protection once more after that split.
    return joinUrls(joinEmails(mergeAdjacentNumericParts(merged, normalizedHyphens)));
  }

  globalThis.CorrectorSpanishText = Object.freeze({ tokenize });
})();
