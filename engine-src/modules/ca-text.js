/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* CatalanWordTokenizer and WordTokenizer behavior ported from the locked LT snapshot. */
(() => {
  "use strict";

  const WORD_CHAR = "§©@€£\\$_\\p{L}0-9·\\-\\u0300-\\u036F\\u00A8\\u2070-\\u209F°%‰‱&\\uFFFD\\u00AD\\u00AC";
  const WORD_RUN = new RegExp(`[${WORD_CHAR}\\uE000-\\uE00A]+|[^${WORD_CHAR}\\uE000-\\uE00A]`, "gu");
  const WORD_ONLY = new RegExp(`^[${WORD_CHAR}\\uE000-\\uE00A]+$`, "u");
  const MARK = Object.freeze({
    straightApostrophe: "\uE000",
    curlyApostrophe: "\uE001",
    decimalPoint: "\uE002",
    decimalComma: "\uE003",
    groupedSpace: "\uE004",
    elaLower: "\uE005\uE006\uE007",
    elaUpper: "\uE008\uE009\uE00A"
  });
  const RESTORE = new Map([
    [MARK.straightApostrophe, "'"], [MARK.curlyApostrophe, "’"],
    [MARK.decimalPoint, "."], [MARK.decimalComma, ","], [MARK.groupedSpace, " "],
    [MARK.elaLower, "l.l"], [MARK.elaUpper, "L.L"]
  ]);
  const PF = "(['’]en|['’]hi|['’]ho|['’]l|['’]ls|['’]m|['’]n|['’]ns|['’]s|['’]t|-el|-els|-em|-en|-ens|-hi|-ho|-l|-la|-les|-li|-lo|-los|-m|-me|-n|-ne|-nos|-s|-se|-t|-te|-us|-vos)";
  const WORD_PATTERNS = [
    /^([lnmtsd]['’])([^'’\-]*)$/iu,
    /^(qui-sap-lo|qui-sap-la|qui-sap-los|qui-sap-les)|(Castella)(-)(la)$/iu,
    new RegExp(`^([lnmtsd]['’])(.{2,})${PF}${PF}${PF}$`, "iu"),
    new RegExp(`^(.{2,})${PF}${PF}${PF}$`, "iu"),
    new RegExp(`^([lnmtsd]['’])(.{2,})${PF}${PF}$`, "iu"),
    new RegExp(`^(.{2,})${PF}${PF}$`, "iu"),
    new RegExp(`^([lnmtsd]['’])(.{2,})${PF}$`, "iu"),
    new RegExp(`^(.+[^wo])${PF}$`, "iu"),
    /^([lnmtsd]['’])(.*)$/iu
  ];
  const HYPHEN_L = /^([\p{L}]+)(-)([Ll]['’])([\p{L}]+)$/iu;
  const COMPOUND_EXCEPTIONS = new Set(["mers-cov", "mcgraw-hill", "sars-cov-2", "sars-cov", "ph-metre", "ph-metres"]);
  const PROTOCOLS = new Set(["http", "https", "ws", "wss", "ftp", "ftps", "sftp", "file", "mailto", "tel", "sms", "git", "ssh", "data", "magnet", "smb", "slack", "spotify"]);
  // Keep the source regex's `$-_` range: it intentionally includes `:` and
  // the other ASCII punctuation between those code points, including URL `://`.
  const URL_CHARS = /^[a-zA-ZÄÖÜäöü0-9/%$-_.+!*'(),?#~]+$/u;
  const DOMAIN_CHARS = /^[a-zA-Z0-9][a-zA-Z0-9-]+$/u;
  const EMAIL = /(?<!:)@?\b[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\b/gu;

  function protect(text) {
    let value = text.replace(/[\u2010\u2011]/gu, "-").replace(/\u02BC/gu, "’");
    // Preserve mixed-case word-initial forms such as `Il•lustran` as one
    // token, matching LanguageTool's whole-token spelling pass. The captured
    // inner lowercase `l·l` stays lowercase when restored.
    value = value.replace(/([aeiouàéèíóòúïüAEIOUÀÈÉÍÒÓÚÏÜ])l[.\u2022\u22C5\u2219\uF0D7]l([aeiouàéèíòóúïü])/gu, `$1${MARK.elaLower}$2`);
    value = value.replace(/([AEIOUÀÈÉÍÒÓÚÏÜ])L[.\u2022\u22C5\u2219\uF0D7]L([AEIOUÀÈÉÍÒÓÚÏÜ])/gu, `$1${MARK.elaUpper}$2`);
    // Java's replaceAll consumes the letter following an apostrophe. Thus
    // adjacent apostrophes sharing that letter are not both protected.
    value = value.replace(/([\p{L}])'([\p{L}"‘“«])/gu, `$1${MARK.straightApostrophe}$2`);
    value = value.replace(/([\p{L}])’([\p{L}"‘“«])/gu, `$1${MARK.curlyApostrophe}$2`);
    value = value.replace(/([dDlL])'(?=\d[\d\s.,]?)/gu, `$1${MARK.straightApostrophe}`);
    value = value.replace(/([dDlL])’(?=\d[\d\s.,]?)/gu, `$1${MARK.curlyApostrophe}`);
    value = value.replace(/(?<=\d)\.(?=\d)/gu, MARK.decimalPoint);
    value = value.replace(/(?<=\d),(?=\d)/gu, MARK.decimalComma);
    value = value.replace(/(?<=\d)(?<!\d{4}) (?=\d{3})/gu, MARK.groupedSpace);
    return value;
  }

  function restore(value) {
    return value.replace(/[\uE000-\uE00A]+/gu, markerRun => {
      let output = markerRun;
      for (const [marker, visible] of RESTORE) output = output.replaceAll(marker, visible);
      return output;
    });
  }

  function baseTokens(text) {
    const tokens = [];
    for (const match of text.matchAll(WORD_RUN)) {
      const value = match[0];
      const point = value.codePointAt(0);
      if (tokens.length && value.length === 1 && point >= 0xFE00 && point <= 0xFE0F) {
        tokens[tokens.length - 1].text += value;
        tokens[tokens.length - 1].end += value.length;
      } else {
        tokens.push({ text: value, start: match.index, end: match.index + value.length });
      }
    }
    return tokens;
  }

  function lexicallyTagged(value, morphology) {
    const normalized = value.replace(/\u00AD/gu, "").replace(/’/gu, "'");
    if (globalThis.CorrectorCatalanTagger) {
      const tagged = globalThis.CorrectorCatalanTagger.tagToken({ text: normalized, kind: "word" }, morphology);
      return tagged.readings.some(reading => reading.tag != null);
    }
    return morphology.lookup(normalized).some(reading => !reading.tag.startsWith("0"));
  }

  function wordsToAdd(value, morphology) {
    if (!value) return [];
    if (!value.includes("-") && !value.endsWith("'") && !value.endsWith("’")) return [value];
    if (lexicallyTagged(value, morphology)) return [value];
    if (COMPOUND_EXCEPTIONS.has(value.toLocaleLowerCase("ca"))) return [value];
    const elaCorrection = value.replace(/l-l/gu, "l·l");
    if (elaCorrection !== value && lexicallyTagged(elaCorrection, morphology)) return [value];
    if ((value.endsWith("'") || value.endsWith("’")) && value.length > 1) {
      return [...wordsToAdd(value.slice(0, -1), morphology), value.slice(-1)];
    }
    const specialHyphenApostrophe = HYPHEN_L.exec(value);
    if (specialHyphenApostrophe) {
      return specialHyphenApostrophe.slice(1).filter(part => part != null).flatMap(part => wordsToAdd(part, morphology));
    }
    return value.split(/(-)/u).filter(Boolean);
  }

  function addParts(tokens, value, start, morphology) {
    let offset = start;
    for (const part of wordsToAdd(value, morphology)) {
      tokens.push({ text: part, start: offset, end: offset + part.length, kind: "word" });
      offset += part.length;
    }
  }

  function tokenizeWord(token, morphology) {
    let value = token.text;
    let prefixHyphens = 0;
    while (value.length > 1 && value.startsWith("-")) {
      prefixHyphens++;
      value = value.slice(1);
    }
    let suffixHyphens = 0;
    while (value.length > 1 && value.endsWith("-")) {
      suffixHyphens++;
      value = value.slice(0, -1);
    }
    const out = [];
    for (let index = 0; index < prefixHyphens; index++) out.push({ text: "-", start: token.start + index, end: token.start + index + 1, kind: "word" });
    const wordStart = token.start + prefixHyphens;

    let match = null;
    if (value.includes("'") || value.includes("’") || value.includes("-")) {
      for (const pattern of WORD_PATTERNS) {
        match = pattern.exec(value);
        if (match) break;
      }
    }
    const contractions = new Map([["al", 1], ["als", 1], ["del", 2], ["dels", 2], ["pel", 2], ["pels", 2], ["can", 2]]);
    const contractionAt = value.length <= 4 ? contractions.get(value.toLocaleLowerCase("ca")) : null;
    if (match) {
      let cursor = 0;
      for (const part of match.slice(1)) {
        if (part == null) continue;
        addParts(out, part, wordStart + cursor, morphology);
        cursor += part.length;
      }
    } else if (contractionAt) {
      out.push({ text: value.slice(0, contractionAt), start: wordStart, end: wordStart + contractionAt, kind: "word" });
      out.push({ text: value.slice(contractionAt), start: wordStart + contractionAt, end: wordStart + value.length, kind: "word" });
    } else {
      addParts(out, value, wordStart, morphology);
    }
    for (let index = 0; index < suffixHyphens; index++) {
      const start = token.end - suffixHyphens + index;
      out.push({ text: "-", start, end: start + 1, kind: "word" });
    }
    return out;
  }

  function urlStartsAt(index, tokens) {
    const token = tokens[index].text;
    if (PROTOCOLS.has(token) && tokens.length > index + 3 && tokens[index + 1].text === ":" && tokens[index + 2].text === "/" && tokens[index + 3].text === "/") return true;
    if (tokens.length > index + 1 && token === "www" && tokens[index + 1].text === ".") return true;
    if (tokens.length > index + 3 && tokens[index + 1].text === "." && tokens[index + 3].text === "/" && DOMAIN_CHARS.test(token) && DOMAIN_CHARS.test(tokens[index + 2].text)) return true;
    return tokens.length > index + 5 && tokens[index + 1].text === "." && tokens[index + 3].text === "." && tokens[index + 5].text === "/"
      && DOMAIN_CHARS.test(token) && DOMAIN_CHARS.test(tokens[index + 2].text) && DOMAIN_CHARS.test(tokens[index + 4].text);
  }

  function urlEndsAt(index, tokens, quote) {
    const token = tokens[index].text;
    if (/^\s+$/u.test(token) || token === ")" || token === "]") return true;
    if (tokens.length > index + 1) {
      const next = tokens[index + 1].text;
      if ((/^\s+$/u.test(next) || ['"', "»", "«", "‘", "’", "“", "”", "'", "."].includes(next))
          && ([".", ",", ";", ":", "!", "?"].includes(token) || token === quote)
        || !URL_CHARS.test(token)) return true;
    } else if (!URL_CHARS.test(token) || token === "." || token === quote) {
      return true;
    }
    return false;
  }

  function joinUrls(tokens) {
    const output = [];
    let active = null;
    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];
      if (!active && urlStartsAt(index, tokens)) {
        active = { text: token.text, start: token.start, end: token.end, quote: index > 0 ? tokens[index - 1].text : null };
      } else if (active && urlEndsAt(index, tokens, active.quote)) {
        output.push({ text: active.text, start: active.start, end: active.end, kind: "word" }, token);
        active = null;
      } else if (active) {
        active.text += token.text;
        active.end = token.end;
      } else {
        output.push(token);
      }
    }
    if (active) output.push({ text: active.text, start: active.start, end: active.end, kind: "word" });
    return output;
  }

  function joinEmails(tokens) {
    const text = tokens.map(token => token.text).join("");
    if (!text.includes("@")) return tokens;
    const ranges = [];
    for (const match of text.matchAll(EMAIL)) ranges.push({ start: match.index, end: match.index + match[0].length, text: match[0] });
    if (!ranges.length) return tokens;
    const output = [];
    let tokenIndex = 0;
    let position = 0;
    for (const range of ranges) {
      while (tokenIndex < tokens.length && position + tokens[tokenIndex].text.length <= range.start) {
        output.push(tokens[tokenIndex]);
        position += tokens[tokenIndex++].text.length;
      }
      let endIndex = tokenIndex;
      let covered = position;
      while (endIndex < tokens.length && covered < range.end) covered += tokens[endIndex++].text.length;
      if (covered >= range.end) {
        const startOffset = tokens[tokenIndex]?.start ?? 0;
        const endOffset = tokens[endIndex - 1]?.end ?? startOffset;
        output.push({ text: range.text, start: startOffset, end: endOffset, kind: "word" });
        position = covered;
        tokenIndex = endIndex;
      }
    }
    output.push(...tokens.slice(tokenIndex));
    return output;
  }

  function tokenize(text, morphology) {
    if (typeof text !== "string") throw new TypeError("El text per tokenitzar ha de ser una cadena.");
    const protectedText = protect(text);
    const raw = baseTokens(protectedText);
    let tokens = [];
    for (const token of raw) {
      const visible = { ...token, text: restore(token.text) };
      if (WORD_ONLY.test(token.text)) {
        tokens.push(...tokenizeWord(visible, morphology));
      } else {
        tokens.push({ ...visible, kind: /^\s+$/u.test(visible.text) ? "space" : "punctuation" });
      }
    }
    tokens = joinUrls(joinEmails(tokens));
    return tokens;
  }

  globalThis.CorrectorCatalanText = Object.freeze({ tokenize });
})();
