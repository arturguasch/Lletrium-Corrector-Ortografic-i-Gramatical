import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-synthesis.js", "es-spelling.js", "es-filter-morfologik-speller.js", "es-chunker.js", "es-xml-disambiguation.js", "es-text.js", "es-sentences.js", "es-structural-rules.js", "es-simple-replace.js", "es-simple-replace-verbs.js", "es-wrong-word-context.js", "es-compounds.js", "ca-java-case-regex.js", "es-pattern-rule-matcher.js", "es-pipeline.js"]) {
  vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
}
const metadata = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-phase3-pattern-examples-metadata.json"), "utf8"));
const oracle = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-phase3-pattern-examples-isolated-oracle.json"), "utf8"));
const candidateResource = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json"), "utf8"));
// The pipeline's loader is now the authoritative portability gate: it reports
// 1,591 loaded rules, zero held-out filters, and zero held-out synthesis rules.
// Keep this aggregate comparison in sync by including every exported rule;
// a second, stale filter allowlist here silently hid rules from the oracle run.
const enabled = new Set(candidateResource.rules.map(rule => rule.fullId));
const corpus = await readFile(resolve(root, "analysis/reference-oracle/corpus/spanish-phase3-pattern-examples.txt"), "utf8");
const resources = resolve(root, "engine-src/resources/es-ES");
const fetcher = async url => {
  const name = new URL(url).pathname.split("/").at(-1);
  const file = name === "es-pattern-rule-candidates.json"
    ? resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json") : resolve(resources, name);
  return new Response(await readFile(file), { status: 200 });
};
const pipeline = await globalThis.CorrectorSpanishPipeline.load({ baseUrl: "https://fixture.invalid/resources/es-ES/", fetcher });
// The oracle checks each source example independently (isolated lines). Keep
// those boundaries in the local pipeline too, while preserving original corpus
// offsets so cross-engine ranges remain directly comparable.
const sentenceSegments = [];
for (const item of metadata.cases) {
  for (const sentence of pipeline.sentenceTokenizer.segment(item.text)) {
    sentenceSegments.push({ ...sentence, start: sentence.start + item.start, end: sentence.end + item.start });
  }
}
const localIssues = pipeline.analyzeText(corpus, { sentenceSegments }).issues.filter(issue => issue.rule && enabled.has(issue.rule));
const fullId = match => `${match.ruleId}[${match.subId}]`;
const oracleIssues = oracle.matches.filter(match => enabled.has(fullId(match)));
const signature = (id, start, end, suggestions) => JSON.stringify([id, start, end, suggestions]);
const oracleSet = new Set(oracleIssues.map(match => signature(fullId(match), match.from, match.to, match.suggestions)));
const localSet = new Set(localIssues.map(issue => signature(issue.rule, issue.start, issue.end, issue.suggestions)));
const missing = [...oracleSet].filter(value => !localSet.has(value));
const extra = [...localSet].filter(value => !oracleSet.has(value));
const parse = value => { const [rule, start, end, suggestions] = JSON.parse(value); return { rule, start, end, suggestions }; };
// Keep strict LanguageTool rule-ID parity, but report user-visible parity
// separately: competing subrules can select different IDs for the same mark
// and exact same suggestions after overlap arbitration.
const visibleSignature = (start, end, suggestions) => JSON.stringify([start, end, suggestions]);
const oracleVisibleSet = new Set(oracleIssues.map(match => visibleSignature(match.from, match.to, match.suggestions)));
const localVisibleSet = new Set(localIssues.map(issue => visibleSignature(issue.start, issue.end, issue.suggestions)));
const visibleMissing = [...oracleVisibleSet].filter(value => !localVisibleSet.has(value));
const visibleExtra = [...localVisibleSet].filter(value => !oracleVisibleSet.has(value));
const describeVisibleDifference = value => {
  const [start, end, suggestions] = JSON.parse(value);
  const example = caseOf(start, end);
  return { start, end, suggestions, caseKind: example?.kind ?? "unmapped", caseText: example?.text ?? null };
};
const ruleIdOnlyDifferences = missing.map(value => parse(value)).filter(issue => localVisibleSet.has(visibleSignature(issue.start, issue.end, issue.suggestions))).length;
const cases = metadata.cases.filter(item => enabled.has(item.rule));
const caseOf = (start, end) => cases.find(item => start >= item.start && end <= item.end)
  || cases.find(item => start >= item.start && start < item.end);
// The ordinary parity signature omits explanations. Compare messages for
// marks whose range, matched text, and replacement list already align so the
// audit does not mistake an identical underline for full user-facing parity.
const messageKey = (start, end, text, suggestions) => JSON.stringify([start, end, text, suggestions || []]);
// LanguageTool serializes suggestion slots as markup; the local popup uses a
// separate suggestion button and displays the same text without these tags.
const normalizedMessage = message => String(message || "").replace(/<\/?suggestion>/gu, "");
const messagePairs = new Map();
const addMessageCandidate = (key, side, issue) => {
  const pair = messagePairs.get(key) || { oracle: [], local: [] };
  pair[side].push(issue);
  messagePairs.set(key, pair);
};
for (const match of oracleIssues) addMessageCandidate(messageKey(match.from, match.to, match.matchedText, match.suggestions), "oracle", match);
for (const issue of localIssues) addMessageCandidate(messageKey(issue.start, issue.end, issue.text, issue.suggestions), "local", issue);
const messageMismatches = [];
let comparableMessages = 0;
for (const [key, pair] of messagePairs) {
  const count = Math.min(pair.oracle.length, pair.local.length);
  const [start, end] = JSON.parse(key);
  const example = caseOf(start, end);
  for (let index = 0; index < count; index++) {
    comparableMessages++;
    const expected = pair.oracle[index], actual = pair.local[index];
    if (normalizedMessage(expected.message) === normalizedMessage(actual.message)) continue;
    messageMismatches.push({
      caseKind: example?.kind ?? "unmapped", caseText: example?.text ?? null,
      start, end, text: expected.matchedText, suggestions: expected.suggestions,
      oracleRule: fullId(expected), localRule: actual.rule,
      oracleMessage: expected.message || "", localMessage: actual.message || ""
    });
  }
}
const describeDifference = (value, direction) => {
  const issue = parse(value);
  const example = caseOf(issue.start, issue.end);
  return { direction, ...issue, caseKind: example?.kind ?? "unmapped", caseText: example?.text ?? null,
    expectedMarker: example ? [example.markerStart, example.markerEnd] : null,
    expectedSuggestions: example?.corrections ?? null };
};
const differences = [
  ...missing.map(value => describeDifference(value, "missing")),
  ...extra.map(value => describeDifference(value, "extra"))
];
const differencesByRule = new Map();
for (const issue of differences) {
  const key = `${issue.caseKind}:${issue.rule}`;
  const entry = differencesByRule.get(key) || { key, count: 0, samples: [] };
  entry.count++;
  if (entry.samples.length < 3) entry.samples.push(issue);
  differencesByRule.set(key, entry);
}
const byRange = matches => {
  const map = new Map();
  for (const match of matches) {
    const id = match.rule ? match.rule : fullId(match);
    const start = match.start ?? match.from;
    const end = match.end ?? match.to;
    const key = JSON.stringify([id, start, end]);
    map.set(key, match.suggestions || []);
  }
  return map;
};
const oracleRanges = byRange(oracleIssues);
const localRanges = byRange(localIssues);
const commonRanges = [...oracleRanges.keys()].filter(key => localRanges.has(key));
const exactSuggestionRanges = commonRanges.filter(key => JSON.stringify(oracleRanges.get(key)) === JSON.stringify(localRanges.get(key)));
const suggestionMismatchSamples = commonRanges.filter(key => JSON.stringify(oracleRanges.get(key)) !== JSON.stringify(localRanges.get(key)))
  .map(key => {
    const [rule, start, end] = JSON.parse(key);
    const example = caseOf(start, end);
    return { rule, start, end, oracle: oracleRanges.get(key), local: localRanges.get(key),
      caseKind: example?.kind ?? "unmapped", caseText: example?.text ?? null,
      expectedMarker: example ? [example.markerStart, example.markerEnd] : null,
      expectedSuggestions: example?.corrections ?? null };
  });
const suggestionMismatchRules = new Map();
for (const item of suggestionMismatchSamples) suggestionMismatchRules.set(item.rule, (suggestionMismatchRules.get(item.rule) || 0) + 1);
const result = {
  corpusCases: cases.length,
  incorrectCases: cases.filter(item => item.kind === "incorrect").length,
  correctCases: cases.filter(item => item.kind === "correct").length,
  supportedPatternRules: enabled.size,
  oracleIssues: oracleSet.size,
  localIssues: localSet.size,
  exactIssueParity: oracleSet.size - missing.length,
  missing: missing.length,
  extra: extra.length,
  exactIssueRate: oracleSet.size ? (oracleSet.size - missing.length) / oracleSet.size : 1,
  exactVisibleIssues: oracleVisibleSet.size - visibleMissing.length,
  visibleIssueRate: oracleVisibleSet.size ? (oracleVisibleSet.size - visibleMissing.length) / oracleVisibleSet.size : 1,
  visibleMissing: visibleMissing.length,
  visibleExtra: visibleExtra.length,
  comparableMessages,
  exactMessages: comparableMessages - messageMismatches.length,
  messageMismatches: messageMismatches.length,
  messageMismatchSamples: messageMismatches.slice(0, 20),
  visibleMissingSamples: visibleMissing.slice(0, 10).map(describeVisibleDifference),
  visibleExtraSamples: visibleExtra.slice(0, 10).map(describeVisibleDifference),
  ruleIdOnlyDifferences,
  oracleRuleRanges: oracleRanges.size,
  localRuleRanges: localRanges.size,
  exactRuleRangeMatches: commonRanges.length,
  missingRuleRanges: [...oracleRanges.keys()].filter(key => !localRanges.has(key)).length,
  extraRuleRanges: [...localRanges.keys()].filter(key => !oracleRanges.has(key)).length,
  exactSuggestionLists: exactSuggestionRanges.length,
  suggestionListMismatchesOnSameRange: commonRanges.length - exactSuggestionRanges.length,
  suggestionMismatchRules: [...suggestionMismatchRules].map(([rule, count]) => ({ rule, count })).sort((a, b) => b.count - a.count || a.rule.localeCompare(b.rule)),
  suggestionMismatchSamples: suggestionMismatchSamples.slice(0, 30),
  perRuleDifferences: [...differencesByRule.values()].sort((a, b) => b.count - a.count).slice(0, 40),
  missingSamples: missing.slice(0, 20).map(value => describeDifference(value, "missing")),
  extraSamples: extra.slice(0, 20).map(value => describeDifference(value, "extra")),
  okay: missing.length === 0 && extra.length === 0
};
const reportPath = resolve(root, "analysis/reference-oracle/outputs/spanish-phase3-pattern-examples-comparison-current.json");
await writeFile(reportPath, JSON.stringify(result, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ ...result, perRuleDifferences: result.perRuleDifferences.map(({ key, count }) => ({ key, count })),
  missingSamples: result.missingSamples.length, extraSamples: result.extraSamples.length,
  suggestionMismatchSamples: result.suggestionMismatchSamples.length, reportPath }, null, 2));
if (!result.okay) process.exitCode = 1;
