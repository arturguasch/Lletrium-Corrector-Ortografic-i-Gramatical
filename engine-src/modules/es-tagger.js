/* Spanish lexical tagging, ported from LanguageTool's SpanishTagger (LGPL-2.1). */
(() => {
  "use strict";

  const ADJ_PART_FEM_SING = /^(?:VMP00SF|A[QO].[FC]S.)$/u;
  const VERB = /^V.+$/u;
  const ADJ_OR_VERB_PARTICIPLE = /^(?:AQ.*|V.P.*)$/u;
  const ADJ_PREFIX_TAG = /^(?:AQ.MS.|AQ.CS.|AQ.MN.)$/u;
  const EXCLUDED_ADJ_PREFIXES = new Set(["anti", "pre", "ex", "pro", "afro", "ultra", "super", "súper"]);
  const EMOJI_ONLY = /^(?=.*\p{Extended_Pictographic})[\p{Extended_Pictographic}\p{Emoji_Modifier}\uFE0F\u200D]+$/u;

  function isMixedCase(value) {
    const text = String(value ?? "");
    const characters = [...text];
    const letters = characters.filter(character => /\p{L}/u.test(character));
    const allUppercase = letters.every(character => character === character.toLocaleUpperCase("es"));
    const notAllLowercase = letters.some(character => character !== character.toLocaleLowerCase("es"));
    const first = characters[0] ?? "";
    const capitalizedWord = /\p{Lu}/u.test(first)
      && characters.slice(1).every(character => !/\p{L}/u.test(character) || character === character.toLocaleLowerCase("es"));
    // Match LanguageTool StringTools.isMixedCase: a word is mixed unless it
    // is all-uppercase or an ordinary capitalized word. This includes acronym
    // plurals such as TICs, whose lowercase fallback would invent a noun POS.
    return !allUppercase && !capitalizedWord && notAllLowercase;
  }

  function readingsFor(form, morphology, { rawFsa = false } = {}) {
    const frequencyIncluded = morphology.manifest?.frequencyIncluded === true;
    // SpanishTagger.additionalTags queries DictionaryLookup directly, so its
    // productive -mente/prefix analyses see the raw FSA before BaseTagger's
    // added/removed overlays are applied to the surface word.
    const lookup = rawFsa && typeof morphology.lookupFsa === "function"
      ? morphology.lookupFsa(form) : morphology.lookup(form, { lowercaseFallback: false });
    return lookup.map(reading => ({
      ...reading,
      tag: frequencyIncluded && reading.source !== "languagetool-manual-addition" && reading.tag?.length > 1 ? reading.tag.slice(0, -1) : reading.tag
    }));
  }

  function additionalReadings(word, morphology) {
    const lower = word.toLocaleLowerCase("es"), result = [];
    const add = (tag, lemma) => result.push({ token: word, lemma, tag, source: "languagetool-spanish-derived-tag" });
    if (lower.endsWith("mente")) {
      const adjective = lower.slice(0, -5);
      if (readingsFor(adjective, morphology, { rawFsa: true }).some(reading => ADJ_PART_FEM_SING.test(reading.tag))) {
        add("RG", lower);
        return result;
      }
    }

    const prefixedVerb = /^(auto)([^r].+)$/iu.exec(word) || /^(autor)(r.+)$/iu.exec(word);
    if (prefixedVerb) {
      const prefix = prefixedVerb[1].toLocaleLowerCase("es"), base = prefixedVerb[2].toLocaleLowerCase("es");
      for (const reading of readingsFor(base, morphology, { rawFsa: true })) if (VERB.test(reading.tag)) add(reading.tag, prefix + reading.lemma);
      return result;
    }

    const superPrefix = /^(super)(.*[aeiouáéíóúü].+[aeiouáéíóúü].*)$/iu.exec(word);
    if (superPrefix) {
      const prefix = superPrefix[1].toLocaleLowerCase("es"), base = superPrefix[2].toLocaleLowerCase("es");
      for (const reading of readingsFor(base, morphology, { rawFsa: true })) {
        if (ADJ_OR_VERB_PARTICIPLE.test(reading.tag)) add(reading.tag, prefix + reading.lemma);
      }
      return result;
    }

    const hyphenated = /^(.+)-(.+)$/u.exec(word);
    if (hyphenated) {
      const prefix = hyphenated[1].toLocaleLowerCase("es"), base = hyphenated[2].toLocaleLowerCase("es");
      if (EXCLUDED_ADJ_PREFIXES.has(prefix)) return result;
      const prefixIsAdjective = readingsFor(prefix, morphology, { rawFsa: true }).some(reading => ADJ_PREFIX_TAG.test(reading.tag));
      if (prefixIsAdjective) {
        const baseAdjective = readingsFor(base, morphology, { rawFsa: true }).find(reading => reading.tag.startsWith("AQ"));
        if (baseAdjective) add(baseAdjective.tag, `${prefix}-${baseAdjective.lemma}`);
      }
    }
    return result;
  }

  function tagToken(token, morphology, context = {}) {
    const original = String(token?.text ?? token ?? "");
    let normalized = original.normalize("NFC");
    const previous = String(context.previousText ?? ""), next = String(context.nextText ?? "");
    const hasTypographicApostrophe = normalized.includes("’")
      && (normalized.length > 1 || ["l", "d"].includes(previous.toLocaleLowerCase("es")) || next.toLocaleLowerCase("es") === "s");
    if (hasTypographicApostrophe) normalized = normalized.replace(/’/gu, "'");
    const lower = normalized.toLocaleLowerCase("es"), allUpper = normalized !== lower && normalized === normalized.toLocaleUpperCase("es");
    const mixedCase = isMixedCase(normalized), candidates = [], seen = new Set();
    const add = (query, lookup) => {
      for (const reading of readingsFor(query, morphology)) {
        const key = `${reading.lemma}\0${reading.tag}`;
        if (seen.has(key)) continue;
        seen.add(key);
        candidates.push({ token: normalized, lemma: reading.lemma, tag: reading.tag, source: "softcatala-spanish-pos", lookup });
      }
    };
    add(normalized, "surface");
    if (normalized !== lower && !mixedCase) add(lower, "lowercase");
    if (allUpper) {
      const title = lower.charAt(0).toLocaleUpperCase("es") + lower.slice(1);
      add(title, "initial-capital");
    }
    if (!candidates.length && !mixedCase) candidates.push(...additionalReadings(normalized, morphology));
    if (!candidates.length && EMOJI_ONLY.test(normalized)) candidates.push({ token: normalized, lemma: "_emoji_", tag: "_emoji_", source: "languagetool-emoji" });
    if (!candidates.length) candidates.push({ token: normalized, lemma: null, tag: null, source: "unknown" });
    const result = {
      text: normalized,
      start: Number.isInteger(token?.start) ? token.start : null,
      end: Number.isInteger(token?.end) ? token.end : null,
      kind: token?.kind || "word",
      known: candidates[0].source !== "unknown",
      readings: candidates
    };
    if (hasTypographicApostrophe) result.typographicApostrophe = true;
    return result;
  }

  function tagTokens(tokens, morphology) {
    if (!Array.isArray(tokens)) throw new TypeError("Los tokens deben ser una lista.");
    return tokens.map((token, index) => tagToken(token, morphology, {
      previousText: tokens[index - 1]?.text ?? "",
      nextText: tokens[index + 1]?.text ?? ""
    }));
  }

  globalThis.CorrectorSpanishTagger = Object.freeze({ tagToken, tagTokens, isMixedCase, additionalReadings });
})();
