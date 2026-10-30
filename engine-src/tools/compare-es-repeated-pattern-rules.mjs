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
const [oracle, defaultOracle, text] = await Promise.all([
  readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-repeated-patterns-oracle.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-repeated-patterns-default-oracle.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "analysis/reference-oracle/corpus/spanish-repeated-patterns.txt"), "utf8")
]);
const fetcher = async url => {
  const name = new URL(url).pathname.split("/").at(-1);
  const path = name === "es-pattern-rule-candidates.json"
    ? resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json")
    : resolve(root, "engine-src/resources/es-ES", name);
  return new Response(await readFile(path), { status: 200 });
};
const pipeline = await globalThis.CorrectorSpanishPipeline.load({ baseUrl: "https://fixture.invalid/resources/es-ES/", fetcher });
const ids = new Set(JSON.parse(await readFile(resolve(root, "engine-src/resources/es-ES/es-repeated-pattern-rules.json"), "utf8")).groups.map(group => group.id));
const expected = oracle.matches.filter(match => ids.has(match.ruleId))
  .map(match => ({ rule: match.ruleId, start: match.from, end: match.to, suggestions: match.suggestions }));
const actual = pipeline.analyzeText(text, { checkLevel: "PICKY" }).issues.filter(issue => ids.has(issue.ruleId))
  .map(issue => ({ rule: issue.ruleId, start: issue.start, end: issue.end, suggestions: issue.suggestions }));
const defaultExpected = defaultOracle.matches.filter(match => ids.has(match.ruleId)).length;
const defaultActual = pipeline.analyzeText(text, { checkLevel: "DEFAULT" }).issues.filter(issue => ids.has(issue.ruleId)).length;
const signature = list => JSON.stringify(list.map(item => [item.rule, item.start, item.end, item.suggestions]));
const expectedSorted = [...expected].sort((a, b) => a.rule.localeCompare(b.rule) || a.start - b.start);
const actualSorted = [...actual].sort((a, b) => a.rule.localeCompare(b.rule) || a.start - b.start);
const pickyExact = signature(expectedSorted) === signature(actualSorted);
const okay = pickyExact && defaultExpected === 0 && defaultActual === 0;
console.log(JSON.stringify({ checkLevel: "PICKY", groups: ids.size, corpusSentences: text.split(/[.!?]+/u).filter(value => value.trim()).length,
  oracleIssues: expected.length, localIssues: actual.length, exact: pickyExact,
  defaultOracleIssues: defaultExpected, defaultLocalIssues: defaultActual, okay, expected, actual }, null, 2));
if (!okay) process.exitCode = 1;
