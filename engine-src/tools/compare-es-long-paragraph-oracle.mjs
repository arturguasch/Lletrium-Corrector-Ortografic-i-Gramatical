/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-synthesis.js", "es-spelling.js", "es-filter-morfologik-speller.js", "es-chunker.js", "es-xml-disambiguation.js", "es-text.js", "es-sentences.js", "es-structural-rules.js", "es-simple-replace.js", "es-simple-replace-verbs.js", "es-wrong-word-context.js", "es-compounds.js", "es-word-repeat.js", "es-word-repeat-beginning.js", "es-question-mark-rule.js", "es-long-sentence-rule.js", "es-long-paragraph-rule.js", "es-repeated-words.js", "ca-java-case-regex.js", "es-pattern-rule-matcher.js", "es-pipeline.js"]) {
  vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
}
const [oracle, fixture, sourceText] = await Promise.all([
  readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-long-paragraph-oracle.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-long-paragraph-cases.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "analysis/reference-oracle/corpus/spanish-long-paragraph.txt"), "utf8")
]);
const fetcher = async url => {
  const name = new URL(url).pathname.split("/").at(-1);
  const path = name === "es-pattern-rule-candidates.json"
    ? resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json")
    : resolve(root, "engine-src/resources/es-ES", name);
  return new Response(await readFile(path), { status: 200 });
};
const pipeline = await globalThis.CorrectorSpanishPipeline.load({ baseUrl: "https://fixture.invalid/resources/es-ES/", fetcher });
const result = pipeline.analyzeText(sourceText, { checkLevel: "PICKY" });
const actual = result.issues.filter(issue => issue.ruleId === "TOO_LONG_PARAGRAPH");
const direct = globalThis.CorrectorSpanishLongParagraphRule.findMatches(result.sentences, sourceText, { checkLevel: "PICKY" });
const expected = oracle.matches.filter(match => match.ruleId === "TOO_LONG_PARAGRAPH");
const signatures = values => values.map(value => JSON.stringify([
  value.from ?? value.start, value.to ?? value.end, value.message, value.suggestions || []
])).sort();
const expectedRanges = expected.map(value => `${value.from}:${value.to}`).sort();
const actualRanges = actual.map(value => `${value.start}:${value.end}`).sort();
const expectedSignatures = signatures(expected), actualSignatures = signatures(actual);
const defaultIssues = pipeline.analyzeText(sourceText, { checkLevel: "DEFAULT" }).issues
  .filter(issue => issue.ruleId === "TOO_LONG_PARAGRAPH");
const report = { checkLevel: "PICKY", cases: fixture.cases.length, oracleIssues: expected.length,
  expectedRanges, actualRanges, directModuleRanges: direct.map(issue => `${issue.start}:${issue.end}`),
  otherPipelineIssues: result.issues.filter(issue => issue.ruleId !== "TOO_LONG_PARAGRAPH")
    .map(issue => ({ ruleId: issue.ruleId, start: issue.start, end: issue.end, text: issue.text })), defaultIssues: defaultIssues.length,
  exactRanges: expectedRanges.filter((value, index) => value === actualRanges[index]).length,
  exactMessagesAndSuggestions: expectedSignatures.filter((value, index) => value === actualSignatures[index]).length,
  okay: JSON.stringify(expectedRanges) === JSON.stringify(actualRanges)
    && JSON.stringify(expectedSignatures) === JSON.stringify(actualSignatures) && defaultIssues.length === 0 };
console.log(JSON.stringify(report, null, 2));
if (!report.okay) process.exitCode = 1;
