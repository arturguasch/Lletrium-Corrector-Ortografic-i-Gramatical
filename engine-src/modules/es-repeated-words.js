/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* SpanishRepeatedWordsRule behavior ported from LanguageTool (upstream LGPL-2.1-or-later; local adaptation GPL-3.0-or-later under LGPL-2.1 section 3). */
(() => {
  "use strict";

  const MESSAGE = "Esta palabra ya ha aparecido en una de las frases inmediatamente anteriores. Puede usar un sinónimo para hacer más interesante el texto, excepto si la repetición es intencionada.";
  const SHORT_MESSAGE = "Estilo: palabra repetida";
  const MAX_WORD_DISTANCE = 150;
  const LOWERCASE = /\p{Ll}/u;
  const UPPERCASE = /\p{Lu}/u;

  function createDataIndex(resource) {
    if (resource?.schemaVersion !== 1 || resource.language !== "es-ES" || resource.sourceSha256 !== "9d5201f80c303bde34ef956c5211c58163fce247db15f5d3dd8051cd12aeaba8" || !Array.isArray(resource.entries) || resource.entryCount !== resource.entries.length) throw new Error("El diccionario de sinónimos no es el recurso fijado de LanguageTool es-ES.");
    const byLemma = new Map();
    for (const row of resource.entries) {
      if (!row || typeof row.word !== "string" || !row.word || !Array.isArray(row.synonyms) || !row.synonyms.length || byLemma.has(row.word)) throw new Error("Entrada no válida o repetida en el diccionario de sinónimos es-ES.");
      if (row.postag != null && typeof row.postag !== "string" || row.chunk != null && typeof row.chunk !== "string") throw new Error(`Restricción POS/chunk no válida para ${row.word}.`);
      byLemma.set(row.word, Object.freeze({ synonyms: Object.freeze([...row.synonyms]), postag: row.postag || null, chunk: row.chunk || null }));
    }
    return Object.freeze({ entryCount: byLemma.size, byLemma });
  }

  function adjustedPosRegex(postag) {
    if (postag.includes("CN")) return postag.replace("CN", "..");
    if (postag.includes("MS")) return postag.replace("MS", "[MC][SN]");
    if (postag.includes("FS")) return postag.replace("FS", "[FC][SN]");
    if (postag.includes("MP")) return postag.replace("MP", "[MC][PN]");
    if (postag.includes("FP")) return postag.replace("FP", "[FC][PN]");
    if (postag.includes("CS")) return postag.replace("CS", "[MC][SN]");
    if (postag.includes("CP")) return postag.replace("CP", "[MC][PN]");
    if (postag.includes("MN")) return postag.replace("MN", "[MC][SPN]");
    if (postag.includes("FN")) return postag.replace("FN", "[FC][SPN]");
    return postag;
  }

  function regexMatches(expression, value) {
    try { return new RegExp(`^(?:${expression})$`, "u").test(value); }
    catch { return false; }
  }

  function isPunctuation(token) {
    return token?.kind === "punctuation" || /^\p{P}+$/u.test(String(token?.text ?? ""));
  }

  function isCapitalized(value) {
    const chars = [...value];
    return chars.length > 0 && UPPERCASE.test(chars[0]) && chars.slice(1).some(char => LOWERCASE.test(char));
  }

  function isAllUppercase(value) {
    return value !== value.toLocaleLowerCase("es") && value === value.toLocaleUpperCase("es");
  }

  function isProperOrForeign(token) {
    return (token.contextualReadings || token.readings || []).some(reading => String(reading.tag || "").startsWith("NP") || reading.tag === "_english_ignore_");
  }

  function applyAntipatternImmunization(tokens) {
    const immunized = new Set();
    const markPair = index => { immunized.add(index); immunized.add(index + 1); };
    for (let index = 0; index + 1 < tokens.length; index++) {
      const first = String(tokens[index].text ?? "");
      const second = String(tokens[index + 1].text ?? "");
      const lowerFirst = first.toLocaleLowerCase("es"), lowerSecond = second.toLocaleLowerCase("es");
      // The five Spanish anti-patterns in SpanishRepeatedWordsRule.
      if (lowerFirst === "también" || lowerSecond === "también"
          || ["antes", "después"].includes(first) && ["de", "del"].includes(second)
          || ["tema", "TEMA"].includes(first) && (/^\d+$/u.test(second) || /^[IXVC]+$/u.test(second))
          || lowerFirst === "así" && lowerSecond === "que") markPair(index);
    }
    return immunized;
  }

  function titleCase(value) {
    const first = [...value][0];
    return first ? first.toLocaleUpperCase("es") + value.slice(first.length) : value;
  }

  function findMatches(sentences, data, { morphology, synthesizer, checkLevel = "DEFAULT" } = {}) {
    if (checkLevel !== "PICKY" || !data?.byLemma || !synthesizer) return [];
    const issues = [];
    const wordsLastSeen = new Map();
    let wordNumber = 0;

    for (const sentence of sentences || []) {
      const tokens = (sentence.tokens || []).filter(token => token.kind !== "space");
      const last = tokens.at(-1)?.text;
      if (![".", "!", "?"].includes(last)) continue;
      const immunized = applyAntipatternImmunization(tokens);
      const lemmasInSentence = new Set();
      let sentenceStart = true;

      for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index], surface = String(token.text ?? "");
        if (token.isImmunized || token.immunized || immunized.has(index)) continue;
        if (surface) wordNumber++;
        const capitalized = isCapitalized(surface), allUppercase = isAllUppercase(surface);
        const exception = !surface || allUppercase || capitalized && !sentenceStart || isProperOrForeign(token);
        if (sentenceStart && surface && !isPunctuation(token)) sentenceStart = false;
        if (exception) continue;

        const tokenReadings = token.contextualReadings || token.readings || [];
        for (const reading of tokenReadings) {
          const lemma = reading.lemma;
          const entry = typeof lemma === "string" ? data.byLemma.get(lemma) : null;
          const lastSeen = typeof lemma === "string" ? wordsLastSeen.get(lemma) : null;
          if (!entry || lastSeen == null || lemmasInSentence.has(lemma) || wordNumber - lastSeen > MAX_WORD_DISTANCE) continue;
          if (entry.postag && !regexMatches(entry.postag, String(reading.tag || ""))) continue;
          if (entry.chunk && !regexMatches(entry.chunk, (token.chunkTags || []).join(" "))) continue;

          const suggestions = [];
          for (const replacementLemma of entry.synonyms) {
            let forms = synthesizer.synthesize({ text: surface, lemma: replacementLemma }, adjustedPosRegex(String(reading.tag || "")), true);
            if (!forms?.length) forms = [replacementLemma];
            for (let form of forms) {
              if (allUppercase) form = form.toLocaleUpperCase("es");
              else if (capitalized) form = titleCase(form);
              if (!suggestions.includes(form)) suggestions.push(form);
            }
          }
          issues.push({
            id: `ES_REPEATEDWORDS:${token.start}:${token.end}`,
            ruleId: "ES_REPEATEDWORDS",
            category: "REPETITIONS_STYLE",
            severity: "hint",
            message: MESSAGE,
            shortMessage: SHORT_MESSAGE,
            text: surface,
            start: token.start,
            end: token.end,
            replacementStart: token.start,
            replacementEnd: token.end,
            suggestions,
            rule: "ES_REPEATEDWORDS",
            _family: "repeated-words-synonyms",
            _picky: true
          });
          break;
        }

        for (const reading of tokenReadings) {
          const lemma = reading.lemma;
          if (typeof lemma === "string" && data.byLemma.has(lemma)) {
            wordsLastSeen.set(lemma, wordNumber);
            lemmasInSentence.add(lemma);
          }
        }
      }
    }
    return issues;
  }

  globalThis.CorrectorSpanishRepeatedWords = Object.freeze({ createDataIndex, findMatches });
})();
