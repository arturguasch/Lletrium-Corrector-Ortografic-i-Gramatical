/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { loadLocalEngine } from "../../build/extension/tests/local-engine-harness.mjs";

const corpusPath = "analysis/reference-oracle/corpus/en-US-phase5-independent-prose.txt";
const corpus = await readFile(corpusPath, "utf8");
const inputSha256 = createHash("sha256").update(corpus).digest("hex");
const engine = await loadLocalEngine("1.0.0");
assert.equal((await engine.preload(["en-US"])).ready, true);

const normalize = (issue, text, oracle = false) => {
  const start = oracle ? issue.from : issue.start;
  const end = oracle ? issue.to : issue.end;
  return {
    ruleId: String(issue.baseRuleId ?? issue.ruleId ?? issue.rule ?? "").replace(/\[\d+\]$/u, ""),
    start,
    end,
    text: String(issue.matchedText ?? text.slice(start, end)),
    suggestions: (issue.suggestions || []).map(String)
  };
};
const key = issue => JSON.stringify([issue.ruleId, issue.start, issue.end, issue.text, issue.suggestions]);
const span = issue => `${issue.start}:${issue.end}`;
const isSpelling = issue => /MORFOLOGIK_RULE_EN_US/u.test(issue.ruleId);
const report = (expected, actual) => {
  const expectedKeys = new Set(expected.map(key));
  const actualKeys = new Set(actual.map(key));
  const expectedSpans = new Set(expected.map(span));
  const sameSpanAnyRule = actual.filter(issue => expectedSpans.has(span(issue))).length;
  return {
    oracleIssues: expected.length,
    localIssues: actual.length,
    exactIssues: actual.filter(issue => expectedKeys.has(key(issue))).length,
    oracleOnly: expected.filter(issue => !actualKeys.has(key(issue))),
    localOnly: actual.filter(issue => !expectedKeys.has(key(issue))),
    sameSpanAnyRule
  };
};

const result = {
  schemaVersion: 1,
  profile: "en-US",
  oracle: "LanguageTool 6.9-SNAPSHOT JLanguageTool over the complete text (WholeDocument)",
  corpus: corpusPath,
  inputSha256,
  chars: corpus.length,
  paragraphs: corpus.split(/\r?\n\s*\r?\n/u).filter(Boolean).length,
  levels: {}
};
for (const level of ["DEFAULT", "PICKY"]) {
  const oraclePath = `analysis/reference-oracle/outputs/en-US-phase5-independent-prose-oracle-${level.toLowerCase()}.json`;
  const oracle = JSON.parse(await readFile(oraclePath, "utf8"));
  assert.equal(oracle.inputSha256, inputSha256, `${level} oracle must match this exact corpus`);
  const expected = oracle.matches.map(issue => normalize(issue, corpus, true));
  const actual = engine.checkText(corpus, { language: "en-US", checkLevel: level }).map(issue => normalize(issue, corpus));
  const grammar = report(expected.filter(issue => !isSpelling(issue)), actual.filter(issue => !isSpelling(issue)));
  const spelling = report(expected.filter(isSpelling), actual.filter(isSpelling));
  result.levels[level] = {
    allRules: report(expected, actual),
    grammarAndStyle: { oracleIssues: grammar.oracleIssues, localIssues: grammar.localIssues,
      exactIssues: grammar.exactIssues, oracleOnly: grammar.oracleOnly.length,
      localOnly: grammar.localOnly.length, sameSpanAnyRule: grammar.sameSpanAnyRule,
      oracleOnlyExamples: grammar.oracleOnly.slice(0, 12), localOnlyExamples: grammar.localOnly.slice(0, 12) },
    spelling: { oracleIssues: spelling.oracleIssues, localIssues: spelling.localIssues,
      exactIssues: spelling.exactIssues, oracleOnly: spelling.oracleOnly.length,
      localOnly: spelling.localOnly.length, sameSpanAnyRule: spelling.sameSpanAnyRule,
      oracleOnlyExamples: spelling.oracleOnly.slice(0, 12), localOnlyExamples: spelling.localOnly.slice(0, 12) }
  };
}
const outputPath = "analysis/reference-oracle/outputs/en-US-phase5-independent-prose-comparison.json";
await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output: outputPath, profile: result.profile, chars: result.chars, paragraphs: result.paragraphs,
  inputSha256, levels: Object.fromEntries(Object.entries(result.levels).map(([level, value]) => [level, {
    grammarAndStyle: { oracle: value.grammarAndStyle.oracleIssues, local: value.grammarAndStyle.localIssues,
      exact: value.grammarAndStyle.exactIssues, oracleOnly: value.grammarAndStyle.oracleOnly,
      localOnly: value.grammarAndStyle.localOnly },
    spelling: { oracle: value.spelling.oracleIssues, local: value.spelling.localIssues,
      exact: value.spelling.exactIssues, oracleOnly: value.spelling.oracleOnly,
      localOnly: value.spelling.localOnly }
  }])) }, null, 2));
