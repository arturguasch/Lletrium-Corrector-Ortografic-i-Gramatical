import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-synthesis.js", "es-spelling.js", "es-filter-morfologik-speller.js", "es-chunker.js", "es-xml-disambiguation.js", "es-text.js", "es-sentences.js", "es-structural-rules.js", "es-simple-replace.js", "es-simple-replace-verbs.js", "es-wrong-word-context.js", "es-compounds.js", "es-word-repeat.js", "es-word-repeat-beginning.js", "es-question-mark-rule.js", "es-long-sentence-rule.js", "es-long-paragraph-rule.js", "es-repeated-words.js", "ca-java-case-regex.js", "es-pattern-rule-matcher.js", "es-pipeline.js"]) {
  vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
}
const [metadata, oracle, candidates, corpus] = await Promise.all([
  readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-phase3-pattern-examples-metadata.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-phase3-pattern-examples-isolated-oracle.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "analysis/reference-oracle/corpus/spanish-phase3-pattern-examples.txt"), "utf8")
]);
const findRules = new Set(candidates.rules.filter(rule => rule.filterClass === "org.languagetool.rules.es.FindSuggestionsFilter").map(rule => rule.fullId));
const fullId = match => `${match.ruleId}[${match.subId}]`;
const oracleMatches = oracle.matches.filter(match => findRules.has(fullId(match)));
const caseOf = match => metadata.cases.find(item => match.from >= item.start && match.to <= item.end)
  || metadata.cases.find(item => match.from >= item.start && match.from < item.end);
// Include every positive and negative example belonging to these rules. Using
// only cases with an oracle issue verifies recall but cannot detect false
// positives on examples where LanguageTool stays silent.
const selected = metadata.cases.filter(item => findRules.has(item.rule));
const selectedIndexes = new Set(selected.map(item => item.index));
const resources = resolve(root, "engine-src/resources/es-ES");
const fetcher = async url => {
  const name = new URL(url).pathname.split("/").at(-1);
  const file = name === "es-pattern-rule-candidates.json"
    ? resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json") : resolve(resources, name);
  return new Response(await readFile(file), { status: 200 });
};
const pipeline = await globalThis.CorrectorSpanishPipeline.load({ baseUrl: "https://fixture.invalid/resources/es-ES/", fetcher });
const expectedByCase = new Map();
for (const match of oracleMatches) {
  const item = caseOf(match);
  if (!item || !selectedIndexes.has(item.index)) continue;
  const list = expectedByCase.get(item.index) || [];
  list.push({ id: fullId(match), start: match.from - item.start, end: match.to - item.start, suggestions: match.suggestions });
  expectedByCase.set(item.index, list);
}
const differences = [];
let compared = 0;
let exactRange = 0;
let exactSuggestions = 0;
const ruleStats = new Map();
for (const item of selected) {
  const local = pipeline.analyzeText(item.text).issues
    .filter(issue => issue.rule && findRules.has(issue.rule))
    .map(issue => ({ id: issue.rule, start: issue.start, end: issue.end, suggestions: issue.suggestions }));
  const expected = expectedByCase.get(item.index) || [];
  const signature = issue => JSON.stringify([issue.id, issue.start, issue.end, issue.suggestions]);
  const localSet = new Set(local.map(signature));
  const expectedSet = new Set(expected.map(signature));
  for (const issue of expected) {
    compared++;
    const stat = ruleStats.get(issue.id) || { oracle: 0, exact: 0, different: 0 };
    stat.oracle++;
    const sameRange = local.find(candidate => candidate.id === issue.id && candidate.start === issue.start && candidate.end === issue.end);
    if (sameRange) exactRange++;
    if (sameRange && JSON.stringify(sameRange.suggestions) === JSON.stringify(issue.suggestions)) exactSuggestions++;
    if (localSet.has(signature(issue))) stat.exact++;
    else {
      stat.different++;
      differences.push({ kind: "oracle-only-or-different", text: item.text, ...issue,
        local: local.find(candidate => candidate.id === issue.id && candidate.start === issue.start && candidate.end === issue.end) ?? null });
    }
    ruleStats.set(issue.id, stat);
  }
  for (const issue of local) if (!expectedSet.has(signature(issue))) differences.push({ kind: "local-only-or-different", text: item.text, ...issue });
}
const counts = new Map();
for (const match of oracleMatches) counts.set(fullId(match), (counts.get(fullId(match)) || 0) + 1);
const quoteSensitiveIds = new Set(["MI_TILDE[1]", "TE_TILDE2[5]", "CONTINUA[6]"]);
const quoteSensitiveCorrectCases = metadata.cases.filter(item => item.kind === "correct" && quoteSensitiveIds.has(item.rule));
const quoteSensitiveFalsePositives = quoteSensitiveCorrectCases.flatMap(item => pipeline.analyzeText(item.text).issues
  .filter(issue => issue.rule === item.rule).map(issue => ({ rule: issue.rule, text: item.text, start: issue.start, end: issue.end })));
console.log(JSON.stringify({ filterRules: findRules.size, cases: selected.length, oracleIssues: compared,
  exactRanges: exactRange, exactSuggestionLists: exactSuggestions,
  exactIssues: compared - differences.filter(item => item.kind === "oracle-only-or-different").length,
  differences: differences.length, byRule: Object.fromEntries(counts), perRule: Object.fromEntries(ruleStats),
  findSuggestionsWindowProbe: pipeline.analyzeText("Ella se ira mañana.").issues.filter(issue => issue.rule === "SE[4]"),
  quotedPunctuationProbe: (() => { const result = pipeline.analyzeText("Nos identificamos con una sucesión “continua” en el tiempo.", { traceDisambiguation: true });
    return { falsePositive: result.issues.filter(issue => issue.rule === "CONTINUA[6]"),
      quoteTags: result.sentences[0].tokens.filter(token => /^[“”]$/u.test(token.text)).map(token => ({ text: token.text, whitespaceBefore: token.whitespaceBefore, tags: token.readings.map(reading => reading.tag) })),
      matchedQuoteRules: result.sentences[0].disambiguationStats.matchedRuleIds?.filter(id => /QM|PUNCT1/.test(id)) }; })(),
  quotedPronounProbes: ["Uno de ellos reconoce a mi «guía»", "se te \"compensará\"", "Se te \"regresará\"."].map(text => ({ text,
    issues: pipeline.analyzeText(text).issues.filter(issue => ["MI_TILDE[1]", "TE_TILDE2[5]"].includes(issue.rule)).map(issue => issue.rule) })),
  quoteSensitiveCorrectExamples: { cases: quoteSensitiveCorrectCases.length, falsePositives: quoteSensitiveFalsePositives.length, samples: quoteSensitiveFalsePositives.slice(0, 5) },
  samples: differences.filter(item => ["SE[4]", "PREP_VERB[4]", "PREP_VERB[6]", "HABER_DE_INFINITIVO[2]"].includes(item.id)).slice(0, 20) }, null, 2));
