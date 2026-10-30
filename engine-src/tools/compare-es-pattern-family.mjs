/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const cliArgs = process.argv.slice(2);
const checkLevelArg = cliArgs.find(value => value.startsWith("--check-level="));
const oracleFileArg = cliArgs.find(value => value.startsWith("--oracle-file="));
const checkLevel = checkLevelArg?.slice("--check-level=".length) || "DEFAULT";
const oracleFile = oracleFileArg?.slice("--oracle-file=".length)
  || "analysis/reference-oracle/outputs/spanish-phase3-pattern-examples-isolated-oracle.json";
const selectors = cliArgs.filter(value => !value.startsWith("--check-level=") && !value.startsWith("--oracle-file="));
if (!selectors.length) throw new Error("Indica prefijos de IDs o categorías, por ejemplo: AGREEMENT o category:DIACRITICS");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-synthesis.js", "es-spelling.js", "es-filter-morfologik-speller.js", "es-chunker.js", "es-xml-disambiguation.js", "es-text.js", "es-sentences.js", "es-structural-rules.js", "es-simple-replace.js", "es-simple-replace-verbs.js", "es-wrong-word-context.js", "es-compounds.js", "es-word-repeat.js", "es-word-repeat-beginning.js", "es-repeated-words.js", "es-question-mark-rule.js", "ca-java-case-regex.js", "es-pattern-rule-matcher.js", "es-pipeline.js"]) {
  vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
}
const [metadata, oracle, candidates] = await Promise.all([
  readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-phase3-pattern-examples-metadata.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, oracleFile), "utf8").then(JSON.parse),
  readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json"), "utf8").then(JSON.parse)
]);
const selectedCandidates = candidates.rules.filter(rule => selectors.some(selector => selector.startsWith("category:")
  ? rule.categoryId === selector.slice("category:".length)
  : selector.startsWith("filter:") ? rule.filterClass === selector.slice("filter:".length)
  : rule.id.startsWith(selector)));
const selectedRules = new Set(selectedCandidates.map(rule => rule.id));
const selectedFullIds = new Set(selectedCandidates.map(rule => rule.fullId));
const fullId = match => `${match.ruleId}[${match.subId}]`;
const oracleMatches = oracle.matches.filter(match => selectedFullIds.has(fullId(match)));
const caseOf = match => metadata.cases.find(item => match.from >= item.start && match.to <= item.end)
  || metadata.cases.find(item => match.from >= item.start && match.from < item.end);
const cases = new Map();
for (const match of oracleMatches) { const item = caseOf(match); if (item) cases.set(item.index, item); }
for (const item of metadata.cases) if (selectedFullIds.has(item.rule)) cases.set(item.index, item);
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
  if (!item || !cases.has(item.index)) continue;
  const list = expectedByCase.get(item.index) || [];
  list.push({ id: fullId(match), start: match.from - item.start, end: match.to - item.start, suggestions: match.suggestions });
  expectedByCase.set(item.index, list);
}
const signature = issue => JSON.stringify([issue.id, issue.start, issue.end, issue.suggestions]);
const misses = [], extras = [];
let exactRanges = 0, exactIssueCount = 0, oracleIssueCount = 0;
const orderedCases = [...cases.values()].sort((a, b) => a.index - b.index);
let combinedText = "";
const sentenceSegments = [];
const caseOffsets = new Map();
for (const item of orderedCases) {
  if (combinedText) combinedText += "\n\n";
  caseOffsets.set(item.index, combinedText.length);
  const offset = combinedText.length;
  for (const sentence of pipeline.sentenceTokenizer.segment(item.text)) {
    sentenceSegments.push({ ...sentence, start: sentence.start + offset, end: sentence.end + offset });
  }
  combinedText += item.text;
}
// Match LanguageTool's real arbitration order: analyze every rule first, then
// retain this family for reporting. Restricting rules before arbitration can
// manufacture family-only warnings that the full engine suppresses.
const combinedIssues = pipeline.analyzeText(combinedText, { sentenceSegments, checkLevel }).issues
  .filter(issue => issue.rule && selectedFullIds.has(issue.rule));
for (const item of orderedCases) {
  const expected = expectedByCase.get(item.index) || [];
  const offset = caseOffsets.get(item.index);
  const local = combinedIssues.filter(issue => issue.start >= offset && issue.end <= offset + item.text.length)
    .map(issue => ({ id: issue.rule, start: issue.start - offset, end: issue.end - offset, suggestions: issue.suggestions }));
  const expectedSet = new Set(expected.map(signature)), localSet = new Set(local.map(signature));
  for (const issue of expected) {
    oracleIssueCount++;
    const sameRange = local.some(candidate => candidate.id === issue.id && candidate.start === issue.start && candidate.end === issue.end);
    if (sameRange) exactRanges++;
    if (localSet.has(signature(issue))) exactIssueCount++;
    else {
      const sameRangeIssue = local.find(candidate => candidate.id === issue.id && candidate.start === issue.start && candidate.end === issue.end) ?? null;
      misses.push({ kind: sameRangeIssue ? "suggestion-difference" : "missing-range", text: item.text, ...issue, local: sameRangeIssue });
    }
  }
  for (const issue of local) if (!expectedSet.has(signature(issue))) {
    const sameRangeExpected = expected.some(candidate => candidate.id === issue.id && candidate.start === issue.start && candidate.end === issue.end);
    extras.push({ kind: sameRangeExpected ? "suggestion-difference" : "extra-range", text: item.text, ...issue });
  }
}
const summarize = entries => Object.values(entries.reduce((summary, entry) => {
  const key = `${entry.kind}\t${entry.id}`;
  const value = summary[key] || { kind: entry.kind, id: entry.id, count: 0, examples: [] };
  value.count++;
  if (value.examples.length < 3) value.examples.push(entry.text);
  summary[key] = value;
  return summary;
}, {})).sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
console.log(JSON.stringify({ selectors, checkLevel, oracleFile, rules: selectedFullIds.size, cases: cases.size, oracleIssues: oracleIssueCount,
  exactRanges, exactIssues: exactIssueCount, missingOrDifferent: misses.length, localOnlyOrDifferent: extras.length,
  differenceGroups: { oracleSide: summarize(misses), localSide: summarize(extras) },
  misses: misses.slice(0, 12), extras: extras.slice(0, 12) }, null, 2));
