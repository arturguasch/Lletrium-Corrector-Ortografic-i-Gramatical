/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Lexical tagger stage: preserve every central-profile dictionary reading. */
(() => {
  "use strict";

  function isMixedCase(word) {
    const lower = word.toLocaleLowerCase("ca");
    const upper = word.toLocaleUpperCase("ca");
    const title = lower.charAt(0).toLocaleUpperCase("ca") + lower.slice(1);
    return word !== lower && word !== upper && word !== title;
  }

  const PREFIXES = ["greco", "sino", "italo", "franco", "gal·lo", "luso", "germano", "hispano", "anglo", "àrabo", "austro", "belgo"];
  const NON_PREFIXES = ["grego", "xineso", "italiano", "franceso", "portugueso", "angleso", "espanyolo", "alemanyo", "arabo", "austríaco", "bèlgico"];
  const ALL_UPPERCASE_EXCEPTIONS = new Set(["ARNAU", "CRISTIAN", "TOMÀS"]);
  const ADJ_OR_PARTICIPLE_FS = /^(?:VMP00SF.|A[QO].[FC]S.)$/u;
  const VERB_ENDINGS = "a|ada|ades|am|ant|ar|ara|aran|arem|aren|ares|areu|aria|arien|aries|arà|aràs|aré|aríem|aríeu|assen|asses|assin|assis|at|ats|au|ava|aven|aves|e|ec|ega|eguda|egudes|eguem|eguen|eguera|egueren|egueres|egues|eguessen|eguesses|eguessin|eguessis|egueu|egui|eguin|eguis|egut|eguts|egué|eguérem|eguéreu|egués|eguéssem|eguésseu|eguéssim|eguéssiu|eguí|eix|eixem|eixen|eixent|eixeran|eixerem|eixeren|eixeres|eixereu|eixeria|eixerien|eixeries|eixerà|eixeràs|eixeré|eixeríem|eixeríeu|eixes|eixessen|eixesses|eixessin|eixessis|eixeu|eixi|eixia|eixien|eixies|eixin|eixis|eixo|eixé|eixérem|eixéreu|eixés|eixéssem|eixésseu|eixéssim|eixéssiu|eixí|eixíem|eixíeu|em|en|es|esc|esca|escuda|escudes|escut|escuts|esquem|esquen|esquera|esqueren|esqueres|esques|esquessen|esquesses|esquessin|esquessis|esqueu|esqui|esquin|esquis|esqué|esquérem|esquéreu|esqués|esquéssem|esquésseu|esquéssim|esquéssiu|esquí|essen|esses|essin|essis|eu|i|ia|ida|ides|ien|ies|iguem|igueu|im|in|int|ir|ira|iran|irem|iren|ires|ireu|iria|irien|iries|irà|iràs|iré|iríem|iríeu|is|isc|isca|isquen|isques|issen|isses|issin|issis|it|its|iu|ix|ixen|ixes|o|à|àrem|àreu|às|àssem|àsseu|àssim|àssiu|àvem|àveu|èixer|éixer|és|éssem|ésseu|éssim|éssiu|í|íem|íeu|írem|íreu|ís|íssem|ísseu|íssim|íssiu|ïs";
  const INCORRECT_VERB_PATTERNS = [new RegExp(`^(.+?)(${VERB_ENDINGS})$`, "iu"), new RegExp(`^(.+)(${VERB_ENDINGS})$`, "iu")];
  let incorrectVerbInfinitives = new Set();
  let manualAdditions = new Map();
  let manualRemovals = new Map();

  function lookupWord(form, morphology, options) {
    const additions = manualAdditions.get(form) || [];
    const removals = manualRemovals.get(form) || new Set();
    return [...additions, ...morphology.lookup(form, options)]
      .filter(reading => !removals.has(`${reading.lemma}\u0000${reading.tag}`));
  }

  function additionalLexicalReadings(word, lower, morphology, localeProfile = "central") {
    const output = [];
    const add = (tag, lemma, source) => output.push({ token: word, lemma, tag, source });

    if (lower.endsWith("ment")) {
      const base = lower.slice(0, -4);
      if (lookupWord(base, morphology).some(reading => ADJ_OR_PARTICIPLE_FS.test(reading.tag))) {
        add("RG", lower, "languagetool-additional-adverb");
        return output;
      }
    }

    const prefixedVerb = /^(auto)(.*[aeiouàéèíòóïü].+[aeiouàéèíòóïü].*)$/iu.exec(word);
    if (prefixedVerb) {
      const prefix = prefixedVerb[1].toLocaleLowerCase("ca");
      const base = prefixedVerb[2].normalize("NFC").toLocaleLowerCase("ca");
      for (const reading of lookupWord(base, morphology)) {
        if (reading.lemma !== "nòmer" && /^V/u.test(reading.tag)) add(reading.tag, prefix + reading.lemma, "languagetool-additional-prefixed-verb");
      }
      return output;
    }

    const addCompound = (first, second, third = null) => {
      const stem = first.toLocaleLowerCase("ca");
      const firstFormIsAdjective = lookupWord(`${stem}a`, morphology).some(reading => reading.tag === "AQ0FS0");
      const allowedPrefix = PREFIXES.includes(`${stem}o`) && !NON_PREFIXES.includes(`${stem}o`);
      if (!firstFormIsAdjective && !allowedPrefix) return false;
      if (third == null) {
        for (const reading of lookupWord(second.toLocaleLowerCase("ca"), morphology)) {
          if (reading.tag.startsWith("A")) add(reading.tag, `${stem}o-${reading.lemma}`, "languagetool-additional-compound-adjective");
        }
      } else {
        const middle = second.toLocaleLowerCase("ca");
        const middleIsAdjective = lookupWord(`${middle}a`, morphology).some(reading => reading.tag === "AQ0FS0")
          || (PREFIXES.includes(`${middle}o`) && !NON_PREFIXES.includes(`${middle}o`));
        if (!middleIsAdjective) return false;
        for (const reading of lookupWord(third.toLocaleLowerCase("ca"), morphology)) {
          if (reading.tag.startsWith("A")) add(reading.tag, `${stem}o-${middle}o-${reading.lemma}`, "languagetool-additional-compound-adjective");
        }
      }
      return output.length > 0;
    };

    const triple = /^(.*)o-(.*)o-(.+)$/iu.exec(word);
    if (triple && addCompound(triple[1], triple[2], triple[3])) return output;
    const compound = /^(.*)o-(.+)$/iu.exec(word);
    if (compound && addCompound(compound[1], compound[2])) return output;

    if (word.includes("\u0140") || word.includes("\u013f")) {
      const canonical = lower.replace(/\u0140/gu, "l·").replace(/\u013f/gu, "l·");
      for (const reading of lookupWord(canonical, morphology)) add(reading.tag, reading.lemma, "languagetool-deprecated-ela-geminada");
    }

    // LanguageTool's Valencian tagger derives masculine -iste readings from
    // the invariant/common -ista lexical entry. This is a lexical fallback,
    // not a spelling exception: only run it for otherwise unknown forms.
    if (!output.length && localeProfile === "valencian" && lower.endsWith("iste")) {
      const base = `${lower.slice(0, -1)}a`;
      for (const reading of lookupWord(base, morphology)) {
        if (reading.tag === "NCCS000") add("NCMS000", base, "languagetool-valencian-iste-noun");
        else if (reading.tag === "AQ0CS0") add("AQ0MS0", base, "languagetool-valencian-iste-adjective");
      }
    }
    return output;
  }

  function adjustLexemeForSoftVowel(lexeme) {
    if (lexeme.endsWith("c")) return lexeme.slice(0, -1) + "ç";
    if (lexeme.endsWith("qu")) return lexeme.slice(0, -2) + "c";
    if (lexeme.endsWith("g")) return lexeme.slice(0, -1) + "j";
    if (lexeme.endsWith("gü")) return lexeme.slice(0, -2) + "gu";
    if (lexeme.endsWith("gu")) return lexeme.slice(0, -2) + "g";
    return lexeme;
  }

  function verbReadingsFromForm(token, infinitive, conjugated, morphology) {
    if (!incorrectVerbInfinitives.has(infinitive)) return [];
    return lookupWord(conjugated, morphology).filter(reading => reading.tag.startsWith("V"))
      .map(reading => ({ token, lemma: infinitive, tag: reading.tag, source: "languagetool-incorrect-verb", lookup: conjugated }));
  }

  function incorrectVerbReadings(original, lower, morphology) {
    if (lower.startsWith("en")) {
      const readings = lookupWord(lower.slice(2), morphology).filter(reading => reading.tag.startsWith("V"));
      const candidates = readings.map(reading => ({ lemma: `en${reading.lemma}`, tag: reading.tag }));
      const selected = candidates.filter(reading => ["enfotre", "enriure"].includes(reading.lemma));
      if (selected.length) return selected.map(reading => ({ token: original, lemma: reading.lemma, tag: reading.tag, source: "languagetool-incorrect-verb", lookup: lower.slice(2) }));
    }
    for (const pattern of INCORRECT_VERB_PATTERNS) {
      const match = pattern.exec(lower);
      if (!match) continue;
      const base = match[1];
      let ending = match[2];
      const candidates = [base];
      let adjusted = base;
      if (/^[eéiï]/iu.test(ending)) {
        adjusted = adjustLexemeForSoftVowel(base);
        if (!candidates.includes(adjusted)) candidates.push(adjusted);
      }
      if (ending.startsWith("ï")) ending = `i${ending.slice(1)}`;
      let found = verbReadingsFromForm(original, `${adjusted}ar`, `cant${ending}`, morphology);
      for (const lexeme of candidates) {
        if (!found.length) found = verbReadingsFromForm(original, `${lexeme}ir`, `serv${ending}`, morphology);
        if (!found.length && lexeme.endsWith("g")) found = verbReadingsFromForm(original, `${lexeme}uir`, `serv${ending}`, morphology);
      }
      if (!found.length) {
        const eixer = `${base}èixer`;
        found = verbReadingsFromForm(original, eixer, `con${ending}`, morphology);
        if (!found.length) found = verbReadingsFromForm(original, eixer, `desmer${ending}`, morphology);
      }
      if (found.length) return found;
    }
    return [];
  }

  function tagToken(token, morphology, localeProfile = "central") {
    const original = String(token.text ?? token);
    const normalized = original.normalize("NFC").replace(/’/gu, "'");
    const lower = normalized.toLocaleLowerCase("ca");
    const isUpper = normalized === normalized.toLocaleUpperCase("ca") && normalized !== lower;
    const candidates = [];
    const seen = new Set();
    const add = (query, via) => {
      for (const reading of lookupWord(query, morphology, { lowercaseFallback: false })) {
        const key = `${reading.lemma}\u0000${reading.tag}`;
        if (seen.has(key)) continue;
        seen.add(key);
        candidates.push({ token: normalized, lemma: reading.lemma, tag: reading.tag, source: "softcatala-pos", lookup: via });
      }
    };

    add(normalized, "surface");
    if (normalized !== lower && !isMixedCase(normalized)) add(lower, "lowercase");
    if (isUpper && (!candidates.length || ALL_UPPERCASE_EXCEPTIONS.has(normalized))) {
      const title = lower.charAt(0).toLocaleUpperCase("ca") + lower.slice(1);
      add(title, "initial-capital");
    }
    if (!candidates.length && !isMixedCase(normalized)) {
      for (const reading of additionalLexicalReadings(normalized, lower, morphology, localeProfile)) {
        const key = `${reading.lemma}\u0000${reading.tag}`;
        if (seen.has(key)) continue;
        seen.add(key);
        candidates.push({ token: original, lemma: reading.lemma, tag: reading.tag, source: reading.source, lookup: "derived-from-lexicon" });
      }
    }
    // Mirror StringTools.isEmoji: it accepts non-BMP symbols only when the
    // whole token is not made solely of letters, digits, punctuation or spaces.
    const hasSupplementaryCodePoint = original.length !== [...original].length;
    if (!candidates.length && hasSupplementaryCodePoint && !/^[\p{L}\p{N}\p{P}\p{Zs}]+$/u.test(original)) {
      candidates.push({ token: normalized, lemma: "_emoji_", tag: "_emoji_", source: "languagetool-emoji", lookup: "unicode-property" });
    }
    // LanguageTool strips the leading 0 from Valencian POS tags, but discards
    // them for both ca-ES and ca-ES-balear: BalearicCatalan inherits the
    // central CatalanTagger. The public `ca` profile is inclusive and keeps
    // them beside central readings; only the explicit Valencian profile
    // mirrors INSTANCE_VAL's normalization.
    const keepValencianReadings = localeProfile === "valencian" || localeProfile === "inclusive";
    for (let index = candidates.length - 1; index >= 0; index--) {
      if (!candidates[index].tag?.startsWith("0")) continue;
      if (keepValencianReadings) candidates[index] = { ...candidates[index], tag: candidates[index].tag.slice(1), source: `${candidates[index].source}-regional` };
      else candidates.splice(index, 1);
    }
    if (!candidates.length) candidates.push(...incorrectVerbReadings(normalized, lower, morphology));
    if (!candidates.length) candidates.push({ token: normalized, lemma: null, tag: null, source: "unknown", lookup: "none" });
    const result = {
      // LT normalizes the lookup form to NFC and curly apostrophes to ASCII,
      // while retaining the original Unicode normalization on the surface.
      text: original.replace(/’/gu, "'"),
      start: Number.isInteger(token.start) ? token.start : null,
      end: Number.isInteger(token.end) ? token.end : null,
      kind: token.kind || "word",
      known: candidates[0].source !== "unknown",
      readings: candidates
    };
    if (original.length > 1 && original.includes("’")) result.typographicApostrophe = true;
    return result;
  }

  function tagTokens(tokens, morphology, localeProfile = "central") {
    if (!Array.isArray(tokens)) throw new TypeError("Els tokens han de ser una llista.");
    const tagged = tokens.map(token => tagToken(token, morphology, localeProfile));
    // LanguageTool exposes its URL reading on the final domain label while
    // preserving punctuation tokenization (e.g. `example . cat`). Add that
    // contextual reading only for contiguous domain-shaped triples; this
    // avoids merging acronyms or changing token offsets.
    for (let index = 0; index + 2 < tagged.length; index++) {
      const [label, dot, suffix] = tagged.slice(index, index + 3);
      if (label.kind !== "word" || dot.text !== "." || suffix.kind !== "word"
          || label.end !== dot.start || dot.end !== suffix.start
          || !/^[A-Za-z0-9][A-Za-z0-9-]+$/u.test(label.text)
          || !/^[a-z0-9][a-z0-9-]+$/u.test(suffix.text)) continue;
      if (/^\p{Lu}+$/u.test(label.text) && /^\p{Lu}+$/u.test(suffix.text)) continue;
      for (const token of [label, dot, suffix]) {
        const key = `${token.text}\u0000${token.lemma}\u0000_IS_URL`;
        if (!token.readings.some(reading => `${token.text}\u0000${reading.lemma}\u0000${reading.tag}` === key)) {
          token.readings.push({ token: token.text, lemma: token.lemma, tag: "_IS_URL", source: "languagetool-url-context", lookup: "domain-suffix" });
        }
      }
    }
    return tagged;
  }

  async function loadResources({ url, fetcher = globalThis.fetch } = {}) {
    const resourceUrl = url || globalThis.chrome?.runtime?.getURL("build/resources/ca-tagger-data.json");
    if (!resourceUrl) throw new Error("Cal indicar URL del recurs del tagger fora de l'extensió.");
    const response = await fetcher(resourceUrl);
    if (!response.ok) throw new Error(`No s'ha pogut carregar el recurs del tagger (${response.status}).`);
    const resource = await response.json();
    if (resource?.schemaVersion !== 1 || !Array.isArray(resource.incorrectVerbInfinitives)
        || !Array.isArray(resource.manualAdditions) || !Array.isArray(resource.manualRemovals)) {
      throw new Error("Recurs del tagger incompatible.");
    }
    incorrectVerbInfinitives = new Set(resource.incorrectVerbInfinitives);
    manualAdditions = new Map();
    for (const [form, lemma, tag] of resource.manualAdditions) {
      if (typeof form !== "string" || typeof lemma !== "string" || typeof tag !== "string") throw new Error("Lectura manual d'afegit invàlida.");
      const rows = manualAdditions.get(form) || [];
      rows.push({ form, lemma, tag });
      manualAdditions.set(form, rows);
    }
    manualRemovals = new Map();
    for (const [form, lemma, tag] of resource.manualRemovals) {
      if (typeof form !== "string" || typeof lemma !== "string" || typeof tag !== "string") throw new Error("Lectura manual d'eliminació invàlida.");
      const rows = manualRemovals.get(form) || new Set();
      rows.add(`${lemma}\u0000${tag}`);
      manualRemovals.set(form, rows);
    }
    return {
      wrongVerbInfinitiveCount: incorrectVerbInfinitives.size,
      manualAdditionForms: manualAdditions.size,
      manualRemovalForms: manualRemovals.size,
      sourceHashes: resource.sourceHashes
    };
  }

  globalThis.CorrectorCatalanTagger = Object.freeze({ tagToken, tagTokens, isMixedCase, additionalLexicalReadings, loadResources });
})();
