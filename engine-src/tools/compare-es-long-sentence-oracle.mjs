/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-synthesis.js", "es-spelling.js", "es-chunker.js", "es-xml-disambiguation.js", "es-text.js", "es-sentences.js", "es-structural-rules.js", "es-simple-replace.js", "es-simple-replace-verbs.js", "es-wrong-word-context.js", "es-compounds.js", "es-word-repeat.js", "es-word-repeat-beginning.js", "es-question-mark-rule.js", "es-long-sentence-rule.js", "es-repeated-words.js", "ca-java-case-regex.js", "es-pattern-rule-matcher.js", "es-pipeline.js"]) {
  vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
}
const [oracle, fixture] = await Promise.all([
  readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-long-sentence-oracle.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-long-sentence-cases.json"), "utf8").then(JSON.parse)
]);
const fetcher = async url => {
  const name = new URL(url).pathname.split("/").at(-1);
  const path = name === "es-pattern-rule-candidates.json"
    ? resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json")
    : resolve(root, "engine-src/resources/es-ES", name);
  return new Response(await readFile(path), { status: 200 });
};
const pipeline = await globalThis.CorrectorSpanishPipeline.load({ baseUrl: "https://fixture.invalid/resources/es-ES/", fetcher });
const expectedByCase = fixture.cases.map(item => oracle.matches
  .filter(match => match.ruleId === "TOO_LONG_SENTENCE" && match.from >= item.start && match.to <= item.end)
  .map(match => ({ start: match.from - item.start, end: match.to - item.start })));
const actualByCase = fixture.cases.map(item => {
  const sentences = pipeline.analyzeText(item.text, { checkLevel: "PICKY" }).sentences;
  return globalThis.CorrectorSpanishLongSentenceRule.findMatches(sentences, item.text, { checkLevel: "PICKY" })
    .map(issue => ({ start: issue.start, end: issue.end }));
});
const signature = value => `${value.start}:${value.end}`;
const mismatches = [];
for (let index = 0; index < fixture.cases.length; index++) {
  const expected = expectedByCase[index].map(signature).sort();
  const actual = actualByCase[index].map(signature).sort();
  if (JSON.stringify(expected) !== JSON.stringify(actual)) mismatches.push({ id: fixture.cases[index].id, text: fixture.cases[index].text, expected, actual });
}
const expectedIssues = expectedByCase.reduce((sum, values) => sum + values.length, 0);
console.log(JSON.stringify({ checkLevel: "PICKY", cases: fixture.cases.length, oracleIssues: expectedIssues,
  exactIssues: expectedIssues - mismatches.reduce((sum, item) => sum + Math.max(item.expected.length, item.actual.length), 0),
  mismatches, okay: mismatches.length === 0 }, null, 2));
if (mismatches.length) process.exitCode = 1;
