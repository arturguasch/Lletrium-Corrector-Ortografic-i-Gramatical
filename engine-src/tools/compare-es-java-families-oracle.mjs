/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const checkLevel = process.argv[2] || "DEFAULT";
const oraclePath = process.argv[3]
  || `analysis/reference-oracle/outputs/spanish-phase3-java-families-${checkLevel.toLowerCase()}-oracle.json`;
if (!new Set(["DEFAULT", "PICKY"]).has(checkLevel)) throw new Error("Check level must be DEFAULT or PICKY.");

for (const name of ["es-morphology.js", "es-tagger.js", "es-synthesis.js", "es-spelling.js",
  "es-filter-morfologik-speller.js", "es-chunker.js", "es-xml-disambiguation.js", "es-text.js",
  "es-sentences.js", "es-structural-rules.js", "es-simple-replace.js", "es-simple-replace-verbs.js",
  "es-wrong-word-context.js", "es-compounds.js", "es-word-repeat.js", "es-word-repeat-beginning.js",
  "es-repeated-words.js", "es-question-mark-rule.js", "es-long-sentence-rule.js", "es-long-paragraph-rule.js",
  "ca-java-case-regex.js", "es-pattern-rule-matcher.js", "es-pipeline.js"]) {
  vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
}

const [metadata, oracle, candidates] = await Promise.all([
  readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-phase3-java-families-metadata.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, oraclePath), "utf8").then(JSON.parse),
  readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json"), "utf8").then(JSON.parse),
]);
const resourceDir = resolve(root, "engine-src/resources/es-ES");
const fetcher = async url => {
  const name = new URL(url).pathname.split("/").at(-1);
  const path = name === "es-pattern-rule-candidates.json"
    ? resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json")
    : resolve(resourceDir, name);
  return new Response(await readFile(path), { status: 200 });
};
const pipeline = await globalThis.CorrectorSpanishPipeline.load({
  baseUrl: "https://fixture.invalid/resources/es-ES/", fetcher,
});
const cases = metadata.cases;
const caseFor = match => cases.find(item => match.from >= item.start && match.to <= item.end);
const canonicalRuleId = value => {
  if (/^ES_COMPOUNDS_/u.test(value)) return "ES_COMPOUNDS";
  if (/^ES_SIMPLE_REPLACE_SIMPLE_/u.test(value)) return "ES_SIMPLE_REPLACE_SIMPLE";
  if (/^ES_SIMPLE_REPLACE_VERBS_/u.test(value)) return "ES_SIMPLE_REPLACE_VERBS";
  if (/^SPANISH_WRONG_WORD_IN_CONTEXT_/u.test(value)) return "SPANISH_WRONG_WORD_IN_CONTEXT";
  if (/^ES_REPEATEDWORDS_/u.test(value)) return "ES_REPEATEDWORDS";
  return value;
};
const javaRuleFamilies = new Set([
  "ES_COMPOUNDS", "UPPERCASE_SENTENCE_START", "ES_QUESTION_MARK", "SPANISH_WORD_REPEAT_RULE",
  "WHITESPACE_RULE", "DOUBLE_PUNCTUATION", "COMMA_PARENTHESIS_WHITESPACE", "ES_UNPAIRED_BRACKETS",
  "ES_SIMPLE_REPLACE_SIMPLE", "ES_SIMPLE_REPLACE_VERBS", "SPANISH_WRONG_WORD_IN_CONTEXT",
  "SPANISH_WORD_REPEAT_BEGINNING_RULE", "ES_REPEATEDWORDS",
]);
const normalize = issue => ({
  rule: canonicalRuleId(issue.ruleId ?? issue.rule),
  start: issue.start,
  end: issue.end,
  text: issue.matchedText ?? issue.text,
  suggestions: issue.suggestions ?? [],
});
const key = issue => JSON.stringify([issue.rule, issue.start, issue.end, issue.text, issue.suggestions]);
const expectedByCase = new Map(cases.map(item => [item.index, []]));
for (const match of oracle.matches) {
  if (match.implementationClass.endsWith("PatternRule")
      || match.implementationClass.endsWith("MorfologikSpanishSpellerRule")) continue;
  const item = caseFor(match);
  if (!item) continue;
  expectedByCase.get(item.index).push(normalize({ ...match, start: match.from - item.start, end: match.to - item.start }));
}

const missing = [];
const extra = [];
let expectedCount = 0;
let localCount = 0;
for (const item of cases) {
  const expected = expectedByCase.get(item.index);
  const local = pipeline.analyzeText(item.text, { checkLevel }).issues.map(issue => normalize({
    ...issue,
    matchedText: issue.text ?? item.text.slice(issue.start, issue.end),
  })).filter(issue => javaRuleFamilies.has(issue.rule));
  expectedCount += expected.length;
  localCount += local.length;
  const remaining = new Map();
  for (const issue of local) remaining.set(key(issue), (remaining.get(key(issue)) || 0) + 1);
  for (const issue of expected) {
    const signature = key(issue);
    const count = remaining.get(signature) || 0;
    if (count) remaining.set(signature, count - 1);
    else missing.push({ source: item.source, sourceLine: item.sourceLine, caseText: item.text, ...issue,
      localSameRuleRange: local.find(candidate => candidate.rule === issue.rule && candidate.start === issue.start && candidate.end === issue.end) ?? null });
  }
  for (const issue of local) {
    const signature = key(issue);
    const count = remaining.get(signature) || 0;
    if (count > 0) {
      extra.push({ source: item.source, sourceLine: item.sourceLine, caseText: item.text, ...issue });
      remaining.set(signature, count - 1);
    }
  }
}

const summary = {
  checkLevel,
  sourceCases: cases.length,
  sourceFiles: new Set(cases.map(item => item.source)).size,
  oracleIssues: expectedCount,
  localIssues: localCount,
  exactIssues: expectedCount - missing.length,
  missing: missing.length,
  extra: extra.length,
  missingSamples: missing.slice(0, 15),
  extraSamples: extra.slice(0, 15),
  okay: missing.length === 0 && extra.length === 0,
};
console.log(JSON.stringify(summary, null, 2));
if (!summary.okay) process.exitCode = 1;
