/* Spanish SimpleReplaceVerbsRule, using the local es-ES tagger and synthesizer. */
(() => {
  "use strict";

  const ENDINGS = "a|aba|abais|aban|abas|ad|ada|adas|ado|ados|amos|an|ando|ar|ara|arais|aran|aras|are|areis|aremos|aren|ares|aron|ará|arán|arás|aré|aréis|aría|aríais|aríamos|arían|arías|as|ase|aseis|asen|ases|aste|asteis|e|emos|en|es|o|ábamos|áis|áramos|áremos|ásemos|é|éis|ó|arse|arme|arte|arlos|arles|arlas|arnos|aros";
  const ENDING_PATTERNS = [new RegExp("^(.+?)(" + ENDINGS + ")$", "u"), new RegExp("^(.+)(" + ENDINGS + ")$", "u")];

  function createDataIndex(resource) {
    if (resource?.schemaVersion !== 1 || resource.language !== "es-ES"
        || !Array.isArray(resource.verbEntries) || resource.verbEntryCount !== resource.verbEntries.length) {
      throw new Error("El recurso SimpleReplaceVerbs es-ES no coincide con LanguageTool.");
    }
    const byInfinitive = new Map();
    for (const entry of resource.verbEntries) for (const form of entry.wrongForms) byInfinitive.set(form.toLocaleLowerCase("es"), entry.suggestions);
    return Object.freeze({ byInfinitive, entryCount: resource.verbEntryCount, formCount: resource.verbFormCount });
  }

  function inferInfinitive(word, byInfinitive) {
    for (const pattern of ENDING_PATTERNS) {
      const match = pattern.exec(word);
      if (!match) continue;
      let lexeme = match[1];
      if (/^[eéiï]/u.test(match[2])) {
        if (lexeme.endsWith("c")) lexeme = lexeme.slice(0, -1) + "z";
        else if (lexeme.endsWith("qu")) lexeme = lexeme.slice(0, -2) + "c";
        else if (lexeme.endsWith("g")) lexeme = lexeme.slice(0, -1) + "j";
        else if (lexeme.endsWith("gü")) lexeme = lexeme.slice(0, -2) + "gu";
        else if (lexeme.endsWith("gu")) lexeme = lexeme.slice(0, -2) + "g";
      }
      const infinitive = lexeme + "ar";
      if (byInfinitive.has(infinitive)) return { infinitive, desinence: match[2] };
    }
    return null;
  }

  function findMatches(sentenceSegments, data, { morphology, synthesizer, shadowedIssues = [] } = {}) {
    if (!data?.byInfinitive || !morphology || !synthesizer) throw new Error("Cal carregar les dades, la morfologia i la síntesi de SimpleReplaceVerbs es-ES.");
    const matches = [];
    for (const sentence of sentenceSegments || []) {
      for (const token of sentence.tokens || []) {
        if (token.kind !== "word" || token.isImmunized || token.immunized || token.ignoredBySpeller
            || token.readings?.some(reading => reading.tag)) continue;
        const candidate = inferInfinitive(token.text.toLocaleLowerCase("es"), data.byInfinitive);
        if (!candidate) continue;
        const replacementInfinitives = data.byInfinitive.get(candidate.infinitive);
        const verbReadings = globalThis.CorrectorSpanishTagger.tagToken({
          text: "am" + candidate.desinence, kind: "word"
        }, morphology).readings.filter(reading => reading.tag);
        if (!verbReadings.length) continue;
        const suggestions = [];
        for (const replacement of replacementInfinitives) {
          if (replacement.startsWith("(")) {
            suggestions.push(replacement);
            continue;
          }
          const parts = replacement.split(" ");
          for (const reading of verbReadings) {
            const targetTag = parts[0] === "haver" ? "VA" + reading.tag.slice(2) : reading.tag;
            for (let suggestion of synthesizer.synthesize(parts[0], targetTag) || []) {
              for (const tail of parts.slice(1)) suggestion += " " + tail;
              if (!suggestions.includes(suggestion)) suggestions.push(suggestion);
            }
          }
        }
        const cased = applyCase(suggestions, token.text);
        if (!cased.length) continue;
        const start = token.start, end = token.end;
        const ruleId = "ES_SIMPLE_REPLACE_VERBS_" + candidate.infinitive.toLocaleUpperCase("es");
        matches.push({
          id: ruleId + ":" + start + ":" + end, ruleId, category: "spelling", severity: "warning",
          message: "Verbo incorrecto: $match", shortMessage: "Verbo incorrecto", text: token.text,
          start, end, replacementStart: start, replacementEnd: end, suggestions: cased,
          rule: "ES_SIMPLE_REPLACE_VERBS", _family: "simple-replace"
        });
      }
    }
    return matches.filter(issue => !shadowedIssues.some(existing => existing.start === issue.start && existing.end === issue.end
      && existing.suggestions?.some(suggestion => issue.suggestions.includes(suggestion))));
  }

  function applyCase(values, original) {
    const initialUpper = /^\p{Lu}/u.test(original);
    const result = [];
    for (const item of values) {
      let value = item;
      if (initialUpper) value = value.replace(/^\p{Ll}/u, char => char.toLocaleUpperCase("es"));
      if (value !== original && !result.includes(value)) result.push(value);
    }
    return result;
  }

  globalThis.CorrectorSpanishSimpleReplaceVerbs = Object.freeze({ createDataIndex, inferInfinitive, findMatches });
})();
