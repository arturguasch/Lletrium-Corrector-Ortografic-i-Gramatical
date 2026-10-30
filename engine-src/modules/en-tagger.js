/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* LanguageTool EnglishTagger lookup order and casing behavior, isolated to en-US. */
(() => {
  "use strict";
  function isMixedCase(value) {
    const chars = [...value], letters = chars.filter(char => /\p{L}/u.test(char));
    const allUpper = letters.every(char => char === char.toLocaleUpperCase("en"));
    const notAllLower = letters.some(char => char !== char.toLocaleLowerCase("en"));
    const initialUpper = /\p{Lu}/u.test(chars[0] || "")
      && chars.slice(1).every(char => !/\p{L}/u.test(char) || char === char.toLocaleLowerCase("en"));
    return !allUpper && !initialUpper && notAllLower;
  }

  function tagToken(token, morphology) {
    const original = String(token?.text ?? token ?? "");
    const normalized = original.normalize("NFC");
    const lookupText = normalized.length > 1 ? normalized.replaceAll("’", "'") : normalized;
    const lower = lookupText.toLocaleLowerCase("en"), mixed = isMixedCase(lookupText);
    const allUpper = lookupText !== lower && lookupText === lookupText.toLocaleUpperCase("en");
    const readings = [], seen = new Set();
    const add = (query, lookup) => {
      for (const reading of morphology.lookup(query, { lowercaseFallback: false })) {
        const key = `${reading.lemma}\0${reading.tag}`;
        if (seen.has(key)) continue;
        seen.add(key);
        readings.push({ token: lookupText, lemma: reading.lemma, tag: reading.tag, source: "languagetool-english-pos", lookup });
      }
    };
    add(lookupText, "surface");
    if (lookupText !== lower && !mixed) add(lower, "lowercase");
    if (!readings.length && allUpper) add(lower.charAt(0).toLocaleUpperCase("en") + lower.slice(1), "initial-capital");
    if (!readings.length && lower.endsWith("in'")) {
      const gerund = lookupText.slice(0, -1) + (allUpper ? "G" : "g");
      add(gerund, "gerund-spelling");
      if (lookupText !== lower && !mixed) add(gerund.toLocaleLowerCase("en"), "gerund-lowercase");
    }
    if (!readings.length) readings.push({ token: lookupText, lemma: null, tag: null, source: "unknown" });
    return { text: lookupText, start: Number.isInteger(token?.start) ? token.start : null,
      end: Number.isInteger(token?.end) ? token.end : null, kind: token?.kind || "word",
      known: readings[0].tag != null, readings, ...(lookupText !== normalized ? { typographicApostrophe: true } : {}) };
  }

  function tagTokens(tokens, morphology) {
    return tokens.map(token => tagToken(token, morphology));
  }
  globalThis.CorrectorEnglishTagger = Object.freeze({ tagToken, tagTokens, isMixedCase });
})();
