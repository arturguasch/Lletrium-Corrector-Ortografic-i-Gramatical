import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-synthesis.js", "es-spelling.js", "es-chunker.js", "es-xml-disambiguation.js", "es-text.js", "es-sentences.js", "es-structural-rules.js", "es-simple-replace.js", "es-simple-replace-verbs.js", "es-wrong-word-context.js", "es-compounds.js", "ca-java-case-regex.js", "es-pattern-rule-matcher.js", "es-pipeline.js"]) vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
const examples = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-rule-examples.json"), "utf8"));
const metadata = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-phase3-multitoken-filter-metadata.json"), "utf8"));
const oracle = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-phase3-multitoken-filter-oracle.json"), "utf8"));
const candidateResource = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json"), "utf8"));
const enabled = new Set(candidateResource.rules.filter(rule => rule.filterClass === "org.languagetool.rules.spelling.multitoken.MultitokenSpellerFilter").map(rule => rule.fullId));
const resources = resolve(root, "engine-src/resources/es-ES");
const fetcher = async url => {
  const name = new URL(url).pathname.split("/").at(-1);
  const file = name === "es-pattern-rule-candidates.json" ? resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json") : resolve(resources, name);
  return new Response(await readFile(file), { status: 200 });
};
const pipeline = await globalThis.CorrectorSpanishPipeline.load({ baseUrl: "https://fixture.invalid/resources/es-ES/", fetcher });
const decode = value => value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/giu, (whole, entity) => entity[0] === "#"
  ? String.fromCodePoint(entity[1]?.toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10))
  : ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" })[entity.toLowerCase()] ?? whole);
const cases = metadata.cases.filter(item => enabled.has(item.rule));
const oracleFor = item => oracle.matches.filter(match => match.ruleId.startsWith("ES_MULTITOKEN_SPELLING_") && match.from >= item.start && match.to <= item.end)
  .map(match => ({ from: match.from - item.start, to: match.to - item.start, suggestions: match.suggestions }));
const localFor = item => {
  const analyzed = pipeline.analyzeText(item.text);
  return {
    matches: analyzed.issues.filter(issue => issue.ruleId.startsWith("ES_MULTITOKEN_SPELLING_"))
      .map(issue => ({ from: issue.start, to: issue.end, rule: issue.rule, suggestions: issue.suggestions })),
    misspelledTokens: analyzed.sentences.flatMap(sentence => sentence.tokens)
      .filter(token => token.misspelled).map(token => ({ from: token.start, to: token.end, text: token.text }))
  };
};
const diffs = [], shadowedBySpelling = [], resultCases = [];
for (const item of cases) {
  const expected = oracleFor(item), local = localFor(item), actual = local.matches;
  const signature = list => JSON.stringify(list.map(({ from, to, suggestions }) => [from, to, suggestions]));
  // The oracle snapshot contains final post-overlap matches. A spelling issue
  // on one component may therefore replace the lower-level multitoken result.
  const oracleSpelling = oracle.matches.filter(match => match.ruleId === "MORFOLOGIK_RULE_ES"
    && match.from < item.end && match.to > item.start)
    .map(match => ({ rule: match.ruleId, from: match.from - item.start, to: match.to - item.start, suggestions: match.suggestions }));
  const shadowed = expected.length === 0 && actual.length > 0 && oracleSpelling.length > 0
    && local.misspelledTokens.some(token => oracleSpelling.some(match => token.from < match.to && token.to > match.from));
  const same = signature(expected) === signature(actual);
  const result = { rule: item.rule, kind: item.kind, text: item.text, expected, actual, oracleSpelling,
    misspelledTokens: local.misspelledTokens, exactVisibleResult: same, spellingOverlapCandidate: shadowed };
  resultCases.push(result);
  if (shadowed) shadowedBySpelling.push(result);
  else if (!same) diffs.push(result);
}
const unresolvedCases = diffs.length + shadowedBySpelling.length;
const summary = { rules: enabled.size, cases: cases.length, incorrect: cases.filter(x => x.kind === "incorrect").length,
  correct: cases.filter(x => x.kind === "correct").length, exactVisibleCases: cases.length - diffs.length - shadowedBySpelling.length,
  spellingOverlapCandidates: shadowedBySpelling.length, unresolvedCases,
  diagnosedCases: cases.length - diffs.length, diagnosisRate: cases.length ? (cases.length - diffs.length) / cases.length : 1,
  differences: diffs, spellingOverlapDetails: shadowedBySpelling.map(({ rule, text, actual, oracleSpelling, misspelledTokens }) => ({
    rule, text, localMultitoken: actual.map(({ from, to, suggestions }) => ({ from, to, suggestions })),
    oracleSpelling: oracleSpelling.map(({ from, to }) => ({ from, to })), misspelledTokens
  })) };
console.log(JSON.stringify(summary, null, 2));
// A spelling overlap explains a candidate but is not full end-to-end parity:
// analyzeText exposes the misspelled token but does not yet emit its final
// MORFOLOGIK_RULE_ES issue for CleanOverlappingFilter arbitration.
if (unresolvedCases) process.exitCode = 1;
