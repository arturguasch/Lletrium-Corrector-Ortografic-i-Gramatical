/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-synthesis.js", "es-spelling.js", "es-chunker.js", "es-xml-disambiguation.js", "es-text.js", "es-sentences.js", "es-structural-rules.js", "ca-java-case-regex.js", "es-pattern-rule-matcher.js", "es-pipeline.js"]) {
  vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
}
const readJson = async path => JSON.parse(await readFile(resolve(root, path), "utf8"));
const [candidates, oracle] = await Promise.all([
  readJson("analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json"),
  readJson("analysis/reference-oracle/outputs/spanish-phase3-postponed-adjective-oracle.json")
]);
const ids = new Set(candidates.rules.filter(rule => rule.filterClass === "org.languagetool.rules.es.PostponedAdjectiveConcordanceFilter").map(rule => rule.fullId));
const corpus = await readFile(resolve(root, "analysis/reference-oracle/corpus/spanish-phase3-postponed-adjective.txt"), "utf8");
const fetcher = async url => {
  const name = new URL(url).pathname.split("/").at(-1);
  const file = name === "es-pattern-rule-candidates.json" ? resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json") : resolve(root, "engine-src/resources/es-ES", name);
  return new Response(await readFile(file), { status: 200 });
};
const pipeline = await globalThis.CorrectorSpanishPipeline.load({ baseUrl: "https://fixture.invalid/resources/es-ES/", fetcher });
const actual = pipeline.analyzeText(corpus).issues.filter(issue => issue.rule && ids.has(issue.rule))
  .map(issue => ({ rule: issue.rule, from: issue.start, to: issue.end, suggestions: issue.suggestions }));
const expected = oracle.matches.filter(match => ids.has(`${match.ruleId}[${match.subId}]`))
  .map(match => ({ rule: `${match.ruleId}[${match.subId}]`, from: match.from, to: match.to, suggestions: match.suggestions }));
const signature = issue => JSON.stringify([issue.rule, issue.from, issue.to, issue.suggestions]);
const expectedSet = new Set(expected.map(signature)), actualSet = new Set(actual.map(signature));
const summary = { rules: ids.size, oracleIssues: expected.length, localIssues: actual.length,
  exact: expected.filter(issue => actualSet.has(signature(issue))).length,
  missing: expected.filter(issue => !actualSet.has(signature(issue))),
  extra: actual.filter(issue => !expectedSet.has(signature(issue))) };
console.log(JSON.stringify(summary, null, 2));
if (summary.missing.length || summary.extra.length) process.exitCode = 1;
