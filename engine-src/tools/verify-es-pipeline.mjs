/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-synthesis.js", "es-spelling.js", "es-filter-morfologik-speller.js", "es-chunker.js", "es-xml-disambiguation.js", "es-text.js", "es-sentences.js", "es-structural-rules.js", "es-simple-replace.js", "es-simple-replace-verbs.js", "es-wrong-word-context.js", "es-compounds.js", "es-word-repeat.js", "es-word-repeat-beginning.js", "es-question-mark-rule.js", "es-long-sentence-rule.js", "es-long-paragraph-rule.js", "es-repeated-words.js", "ca-java-case-regex.js", "es-pattern-rule-matcher.js", "es-pipeline.js"]) vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
const dir = resolve(root, "engine-src/resources/es-ES");
const posManifest = JSON.parse(await readFile(resolve(dir, "manifest.json"), "utf8"));
const pos = gunzipSync(await readFile(resolve(dir, posManifest.dataFile)));
const synthesisManifest = JSON.parse(await readFile(resolve(dir, "synthesis-manifest.json"), "utf8"));
const synthesis = gunzipSync(await readFile(resolve(dir, synthesisManifest.dataFile)));
const multiword = JSON.parse(await readFile(resolve(dir, "es-multiword.json"), "utf8"));
const multitokenSpellerData = JSON.parse(await readFile(resolve(dir, "es-multitoken-speller.json"), "utf8"));
const disambiguation = JSON.parse(await readFile(resolve(dir, "es-disambiguation-rules.json"), "utf8"));
const patternRules = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json"), "utf8"));
const repeatedPatternRules = JSON.parse(await readFile(resolve(root, "engine-src/resources/es-ES/es-repeated-pattern-rules.json"), "utf8"));
const spellingData = globalThis.CorrectorSpanishSpelling.createDataIndex(JSON.parse(await readFile(resolve(dir, "es-spelling-data.json"), "utf8")));
const simpleReplaceData = globalThis.CorrectorSpanishSimpleReplace.createDataIndex(JSON.parse(await readFile(resolve(dir, "es-simple-replace.json"), "utf8")));
const simpleReplaceResource = JSON.parse(await readFile(resolve(dir, "es-simple-replace.json"), "utf8"));
const simpleReplaceVerbData = globalThis.CorrectorSpanishSimpleReplaceVerbs.createDataIndex(simpleReplaceResource);
const wrongWordContextData = globalThis.CorrectorSpanishWrongWordContext.createDataIndex(JSON.parse(await readFile(resolve(dir, "es-wrong-word-context.json"), "utf8")));
const compoundsData = globalThis.CorrectorSpanishCompounds.createDataIndex(JSON.parse(await readFile(resolve(dir, "es-compounds.json"), "utf8")));
const srx = JSON.parse(await readFile(resolve(dir, "es-srx.json"), "utf8"));
const morphology = new globalThis.CorrectorSpanishMorphology(pos.buffer.slice(pos.byteOffset, pos.byteOffset + pos.byteLength), posManifest);
const synthesizer = new globalThis.CorrectorSpanishSynthesizer(synthesis.buffer.slice(synthesis.byteOffset, synthesis.byteOffset + synthesis.byteLength), synthesisManifest);
await globalThis.CorrectorSpanishXmlDisambiguator.load({ url: "es-disambiguation-rules.json", fetcher: async () => ({ ok: true, json: async () => disambiguation }) });
const patternRuleDiagnostics = await globalThis.CorrectorSpanishPatternRuleMatcher.load({ url: "es-pattern-rule-candidates.json", fetcher: async url => ({ ok: true, json: async () => String(url).includes("repeated-pattern") ? repeatedPatternRules : patternRules }) });
const pipeline = new globalThis.CorrectorSpanishPipeline({ morphology, tagger: globalThis.CorrectorSpanishTagger, synthesizer, sentenceTokenizer: new globalThis.CorrectorSpanishSentenceTokenizer(srx), chunker: new globalThis.CorrectorSpanishChunker(multiword), disambiguator: globalThis.CorrectorSpanishXmlDisambiguator, spellingData, multitokenSpellerData, simpleReplaceData, simpleReplaceVerbData, wrongWordContextData, compoundsData });
const result = pipeline.analyzeText("La casa es rapida. A pesar de todo, New York aparece.");
const tokens = result.sentences.flatMap(sentence => sentence.tokens);
const rapid = tokens.find(token => token.text === "rapida");
const chunks = tokens.flatMap(token => token.chunksStart);
const loadedPipeline = await globalThis.CorrectorSpanishPipeline.load({
  baseUrl: "https://fixture.invalid/resources/es-ES/",
  fetcher: async url => {
    const name = new URL(url).pathname.split("/").at(-1);
    const bytes = name === "es-pattern-rule-candidates.json" ? await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json")) : await readFile(resolve(dir, name));
    return new Response(bytes, { status: 200 });
  }
});
const loadedResult = loadedPipeline.analyzeText("La casa es rapida.");
const domainExample = loadedPipeline.analyzeText("Archivo de la lista de correo en mail-archive.com");
const domainToken = domainExample.sentences.flatMap(sentence => sentence.tokens).find(token => token.text === "mail-archive.com");
const domainProtectionOkay = domainToken?.isUrl === true && domainToken.readings.some(reading => reading.tag === "IS_URL")
  && !domainExample.issues.some(issue => issue.rule === "SUBJUNTIVO_PASADO2[2]");
const properNameExample = loadedPipeline.analyzeText("Esto también pasa en el Echo Show.");
const properNameExceptionOkay = !properNameExample.issues.some(issue => issue.rule === "ECHO_HECHO[1]")
  && properNameExample.sentences.flatMap(sentence => sentence.tokens).find(token => token.text === "Echo")?.readings.some(reading => /^NP/u.test(reading.tag || ""));
const spanishNameExample = loadedPipeline.analyzeText("Vivió en Echo Park.");
const spanishNameRuleParityOkay = spanishNameExample.issues.some(issue => issue.rule === "ECHO_HECHO[1]");
const patternExample = loadedPipeline.analyzeText("Vive a bajo.").issues.filter(issue => issue.ruleId === "ABAJO");
const findSuggestionExample = loadedPipeline.analyzeText("Las faltes que tiene este texto.").issues.find(issue => issue.rule === "SUBJUNTIVO_INCORRECTO[3]");
const findSuggestionApostropheCases = ["O’neill", "L’ALCOIA", "L’Alcoia", "Potser Est`n aquí.", "Potser Est` aquí."]
  .map(text => ({ text, issue: loadedPipeline.analyzeText(text).issues.find(issue => issue.rule?.startsWith("APOSTROFO_ACENTO[")) }));
const addCommasCases = ["Por lo tanto hablaremos de un tema importante.", "Y por otro lado no logró ganar."]
  .map(text => ({ text, issue: loadedPipeline.analyzeText(text).issues.find(issue => issue.rule?.startsWith("COMMA_")) }));
const multitokenSpellingCases = ["The Derk Knight Rises.", "Rocki Mountains National Park.", "Alexander Von Humboldt"]
  .map(text => ({ text, issue: loadedPipeline.analyzeText(text).issues.find(issue => issue.rule?.startsWith("ES_MULTITOKEN_SPELLING_")) }));
const advancedSynthesizerCases = ["Es de un media alta.", "La casa es bonito.", "vigésimo primera"]
  .map(text => ({ text, issues: loadedPipeline.analyzeText(text).issues.filter(issue => ["AGREEMENT_DET_GN", "AGREEMENT_ORDINALS", "CONCORDANCIAS_ATRIBUTO"].includes(issue.ruleId)) }));
const structuralResult = loadedPipeline.analyzeText("Uno  dos..");
const structuralIssues = structuralResult.issues.map(({ ruleId, start, end }) => ({ ruleId, start, end }));
const structuralRulesOkay = JSON.stringify(structuralIssues) === JSON.stringify([
  { ruleId: "WHITESPACE_RULE", start: 3, end: 5 },
  { ruleId: "DOUBLE_PUNCTUATION", start: 8, end: 10 }
]);
const simpleReplaceCases = ["La palabra satisfacido aparece.", "ERUPTAR es incorrecto.", "La casa satisfecha."]
  .map(text => ({ text, issues: loadedPipeline.analyzeText(text).issues.filter(issue => issue.rule === "ES_SIMPLE_REPLACE_SIMPLE") }));
const verbReplacementCases = ["Yo erupto.", "Ella eruptaba.", "Debo logear.", "Ayer logeamos.", "Yo clickearé."]
  .map(text => ({ text, issues: loadedPipeline.analyzeText(text).issues.filter(issue => issue.rule === "ES_SIMPLE_REPLACE_VERBS") }));
const wrongWordContextCases = ["El dolor que le infringió fue enorme.", "Infligió una ley nueva.", "La vaca quedó sujeta al vehículo.", "Las bacas dan leche.", "Las vacas llevan equipaje."]
  .map(text => ({ text, issues: loadedPipeline.analyzeText(text).issues.filter(issue => issue.ruleId === "SPANISH_WRONG_WORD_IN_CONTEXT") }));
const wrongWordContextOkay = wrongWordContextData.entryCount === 3 && wrongWordContextCases.every(item => item.issues.length === 1);
const compoundsCases = ["Vivía en Guinea Conakri.", "Está al sud oeste.", "Un ex presidente llegó.", "SARS CoV 2", "anti COVID 19", "e mail", "e mails"]
  .map(text => ({ text, issues: loadedPipeline.analyzeText(text).issues.filter(issue => issue.ruleId === "ES_COMPOUNDS") }));
const compoundsOkay = compoundsData.entryCount === 461
  && compoundsCases[0].issues.some(issue => issue.suggestions.includes("Guinea-Conakri"))
  && compoundsCases[3].issues.some(issue => issue.text === "SARS CoV 2" && issue.suggestions[0] === "SARS-CoV-2")
  && compoundsCases[4].issues.some(issue => issue.text === "anti COVID" && issue.suggestions[0] === "anti-COVID")
  && compoundsCases[5].issues.some(issue => issue.text === "e mail" && JSON.stringify(issue.suggestions) === JSON.stringify(["e-mail"]))
  && compoundsCases[6].issues.some(issue => issue.text === "e mails" && JSON.stringify(issue.suggestions) === JSON.stringify(["e-mails"]));
const repeatedWordCases = ["El el perro corre.", "Esto es es raro.", "Phi Phi Islands.", "Pago Pago.", "muy muy lejos.", "2020 2020.", "😀 😀."]
  .map(text => ({ text, issues: loadedPipeline.analyzeText(text).issues.filter(issue => issue.ruleId === "SPANISH_WORD_REPEAT_RULE") }));
const repeatedWordOkay = JSON.stringify(repeatedWordCases.map(item => item.issues.map(issue => [issue.text, issue.suggestions])))
  === JSON.stringify([[ ["El el", ["El"]] ], [ ["es es", ["es"]] ], [], [], [], [], []]);
const repeatedBeginningDefault = loadedPipeline.analyzeText("También, juego a fútbol. También, juego a baloncesto.").issues.filter(issue => issue.ruleId === "SPANISH_WORD_REPEAT_BEGINNING_RULE");
const repeatedBeginningPicky = loadedPipeline.analyzeText("También, juego a fútbol. También, juego a baloncesto.", { checkLevel: "PICKY" }).issues.filter(issue => issue.ruleId === "SPANISH_WORD_REPEAT_BEGINNING_RULE");
const repeatedBeginningOkay = repeatedBeginningDefault.length === 0 && repeatedBeginningPicky.length === 1
  && repeatedBeginningPicky[0].text === "También" && repeatedBeginningPicky[0].suggestions.includes("Así mismo");
const questionMarkCases = ["Hola, cómo estás?", "Hola, ¿cómo estás?", "Qué irritante!", "¡Qué irritante!", "Hola, de qué me hablas?"]
  .map(text => ({ text, issues: loadedPipeline.analyzeText(text).issues.filter(issue => issue.ruleId === "ES_QUESTION_MARK") }));
const questionMarkOkay = JSON.stringify(questionMarkCases.map(item => item.issues.map(issue => [issue.text, issue.suggestions])))
  === JSON.stringify([[], [], [ ["Qué", ["¡Qué"]] ], [], [ ["de", ["¿de"]] ]]);
const priorityCollisionCases = ["Juan , se va hacia su casa.", "Adiós,. le dije.", "Es así ?Siempre.", "Tres, cuatro, cinco,…etc.", "Mr Hill se fue ayer de viaje a Japón.", "La regla d'Hont.", "¿Te haz hecho daño?"]
  .map(text => ({ text, issues: loadedPipeline.analyzeText(text).issues }));
const priorityCollisionOkay = priorityCollisionCases[0].issues[0]?.ruleId === "COMMA_PARENTHESIS_WHITESPACE"
  && priorityCollisionCases[0].issues[0]?.suggestions[0] === ","
  && priorityCollisionCases[1].issues.some(issue => issue.ruleId === "COMMA_PARENTHESIS_WHITESPACE" && issue.suggestions[0] === ", .")
  && priorityCollisionCases[2].issues.some(issue => issue.ruleId === "ESPACIO_DESPUES_DE_PUNTO" && issue.suggestions[0] === "así? Siempre")
  && priorityCollisionCases[3].issues.some(issue => issue.ruleId === "ETCETERA" && issue.suggestions[0] === ", etc.")
  && priorityCollisionCases[4].issues.some(issue => issue.ruleId === "PUNTO_EN_ABREVIATURAS" && issue.suggestions[0] === "Mr.")
  && priorityCollisionCases[5].issues.some(issue => issue.rule === "DHONDT[1]" && issue.suggestions.includes("D'Hondt"))
  && priorityCollisionCases[6].issues.some(issue => issue.rule === "WRONG_IMPERATIVE[5]"
    && JSON.stringify(issue.suggestions) === JSON.stringify(["ha", "han", "hay", "has"]));
const repeatedSynonymDefault = loadedPipeline.analyzeText("Fue excelente. Fue un resultado excelente.").issues.filter(issue => issue.ruleId === "ES_REPEATEDWORDS");
const repeatedSynonymPicky = loadedPipeline.analyzeText("Fue excelente. Fue un resultado excelente.", { checkLevel: "PICKY" }).issues.filter(issue => issue.ruleId === "ES_REPEATEDWORDS");
const repeatedSynonymOkay = repeatedSynonymDefault.length === 0 && repeatedSynonymPicky.length === 1
  && repeatedSynonymPicky[0].text === "excelente" && JSON.stringify(repeatedSynonymPicky[0].suggestions.slice(0, 3)) === JSON.stringify(["magnífico", "fantástico", "maravilloso"]);
const simpleReplaceVerbDataOkay = simpleReplaceVerbData.entryCount > 0 && verbReplacementCases.some(test => test.issues.length > 0);
const simpleReplaceOkay = simpleReplaceData.entryCount === 246 && simpleReplaceData.formCount === 300
  && simpleReplaceCases[0].issues.some(issue => issue.suggestions[0] === "satisfecho")
  && simpleReplaceCases[1].issues.length === 0
  && simpleReplaceCases[2].issues.length === 0;
const catalanGlobals = Object.keys(globalThis).filter(name => /^CorrectorCatalan/u.test(name));
const loadedRules = result.sentences[0]?.disambiguationStats?.loadedRules;
const patternRuleAccountingOkay = patternRuleDiagnostics.loadedRules + patternRuleDiagnostics.heldOutFilters
  + patternRuleDiagnostics.heldOutNumberSynthesis === patternRuleDiagnostics.sourceRules;
const loadedRapid = loadedResult.sentences.flatMap(sentence => sentence.tokens).find(token => token.text === "rapida");
const patternRulesOkay = patternExample.some(issue => issue.suggestions.includes("abajo"))
  && loadedPipeline.analyzeText("Se vendía a bajo precio.").issues.every(issue => issue.ruleId !== "ABAJO");
const findSuggestionsFilterOkay = Boolean(findSuggestionExample?.suggestions.includes("faltas"))
  && !findSuggestionExample.suggestions.some(value => /\{suggestion\}/u.test(value))
  && JSON.stringify(findSuggestionApostropheCases.map(item => item.issue?.suggestions || [])) === JSON.stringify([
    ["O'Neill"], ["L'ALCOIÀ", "L'ALCORA"], ["L'Alcoià", "l'Alcoià", "L'Alcora", "l'Alcora"], ["Están", "Estén"], ["Está", "Esté"]
  ]);
const addCommasFilterOkay = JSON.stringify(addCommasCases.map(item => item.issue?.suggestions || []))
  === JSON.stringify([["tanto,"], [", por otro lado,"]]);
const multitokenSpellerFilterOkay = multitokenSpellingCases.every(item => item.issue?.suggestions.includes(
  item.text.startsWith("The Derk") ? "The Dark Knight Rises"
    : item.text.startsWith("Rocki") ? "Rocky Mountain National Park" : "Alexander von Humboldt"));
const allPatternRulesOkay = patternRulesOkay && findSuggestionsFilterOkay && addCommasFilterOkay && multitokenSpellerFilterOkay;
const allChecksOkay = result.profile === "es-ES" && rapid?.misspelled === true && rapid.suggestions.includes("rápida") && chunks.some(chunk => chunk.lemma === "a pesar de todo") && chunks.some(chunk => chunk.lemma === "New York") && loadedRules === disambiguation.supportedRuleCount && loadedRapid?.suggestions.includes("rápida") && structuralRulesOkay && allPatternRulesOkay && patternRuleAccountingOkay && simpleReplaceOkay && simpleReplaceVerbDataOkay && wrongWordContextOkay && compoundsOkay && repeatedWordOkay && repeatedBeginningOkay && questionMarkOkay && priorityCollisionOkay && repeatedSynonymOkay && domainProtectionOkay && properNameExceptionOkay && spanishNameRuleParityOkay && !catalanGlobals.length;
console.log(JSON.stringify({ profile: result.profile, tokens: tokens.length, misspelling: rapid && { text: rapid.text, suggestions: rapid.suggestions }, chunks: chunks.map(({ lemma, tag, kind }) => ({ lemma, tag, kind })), disambiguation: { loadedRules, upstreamRules: disambiguation.upstreamRuleCount, exclusions: disambiguation.excludedRuleCount }, patternRuleDiagnostics, patternRuleAccountingOkay, patternExample, findSuggestionExample, findSuggestionApostropheCases, findSuggestionsFilterOkay, addCommasCases, addCommasFilterOkay, multitokenSpellingCases, multitokenSpellerFilterOkay, advancedSynthesizerCases, patternRulesOkay: allPatternRulesOkay, structuralRuleIssues: structuralIssues, structuralRulesOkay, priorityCollisionCases, priorityCollisionOkay, domainExample: { token: domainToken, issues: domainExample.issues, okay: domainProtectionOkay }, properNameExample: { issues: properNameExample.issues, okay: properNameExceptionOkay }, spanishNameExample: { issues: spanishNameExample.issues, okay: spanishNameRuleParityOkay }, simpleReplace: { data: { entries: simpleReplaceData.entryCount, forms: simpleReplaceData.formCount }, cases: simpleReplaceCases, okay: simpleReplaceOkay }, simpleReplaceVerbs: { data: { entries: simpleReplaceVerbData.entryCount, forms: simpleReplaceVerbData.formCount }, cases: verbReplacementCases, okay: simpleReplaceVerbDataOkay }, wrongWordContext: { data: { entries: wrongWordContextData.entryCount }, cases: wrongWordContextCases, okay: wrongWordContextOkay }, compounds: { data: { entries: compoundsData.entryCount, uniqueForms: compoundsData.byForm.size }, cases: compoundsCases, okay: compoundsOkay }, repeatedWord: { cases: repeatedWordCases, okay: repeatedWordOkay }, repeatedWordBeginning: { defaultIssues: repeatedBeginningDefault.length, pickyIssues: repeatedBeginningPicky.length, okay: repeatedBeginningOkay }, questionMark: { cases: questionMarkCases, okay: questionMarkOkay }, repeatedWordSynonyms: { defaultIssues: repeatedSynonymDefault.length, pickyIssues: repeatedSynonymPicky.length, topSuggestions: repeatedSynonymPicky[0]?.suggestions.slice(0, 3), okay: repeatedSynonymOkay }, staticResourceLoad: { loaded: true, typoSuggestions: loadedRapid?.suggestions }, catalanModulesLoaded: catalanGlobals.length, okay: allChecksOkay }, null, 2));
if (!allChecksOkay) throw new Error("Independent Spanish pipeline verification failed.");
