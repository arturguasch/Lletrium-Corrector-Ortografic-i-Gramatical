import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-synthesis.js", "es-spelling.js", "es-chunker.js", "es-xml-disambiguation.js", "es-text.js", "es-sentences.js", "es-structural-rules.js", "ca-java-case-regex.js", "es-pattern-rule-matcher.js", "es-pipeline.js"]) vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
const metadata = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-phase3-pattern-examples-metadata.json"), "utf8"));
const oracle = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-phase3-pattern-examples-isolated-oracle.json"), "utf8"));
const candidates = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json"), "utf8"));
const enabled = new Set(candidates.rules.filter(rule => rule.filterClass === "org.languagetool.rules.es.DateCheckFilter").map(rule => rule.fullId));
const ids = new Set([...enabled].map(id => id.slice(0, id.indexOf("["))));
const resourceDir = resolve(root, "engine-src/resources/es-ES");
const fetcher = async url => {
  const name = new URL(url).pathname.split("/").at(-1);
  const file = name === "es-pattern-rule-candidates.json" ? resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json") : resolve(resourceDir, name);
  return new Response(await readFile(file), { status: 200 });
};
const pipeline = await globalThis.CorrectorSpanishPipeline.load({ baseUrl: "https://fixture.invalid/resources/es-ES/", fetcher });
const cases = metadata.cases.filter(item => enabled.has(item.rule)), mismatches = [];
for (const item of cases) {
  const expected = oracle.matches.filter(match => `${match.ruleId}[${match.subId}]` === item.rule && match.from >= item.start && match.to <= item.end)
    .map(match => ({ from: match.from - item.start, to: match.to - item.start, suggestions: match.suggestions, message: match.message }));
  const actual = pipeline.analyzeText(item.text).issues.filter(issue => ids.has(issue.ruleId) && issue.rule === item.rule)
    .map(issue => ({ from: issue.start, to: issue.end, suggestions: issue.suggestions, message: issue.message }));
  const normalize = values => values.map(({ from, to, suggestions, message }) =>
    [from, to, suggestions, String(message || "").replace(/<\/?suggestion>/gu, "")]);
  if (JSON.stringify(normalize(expected)) !== JSON.stringify(normalize(actual))) mismatches.push({ rule: item.rule, kind: item.kind, text: item.text, expected, actual });
}
const summary = { rules: enabled.size, cases: cases.length, incorrect: cases.filter(item => item.kind === "incorrect").length,
  correct: cases.filter(item => item.kind === "correct").length, exactCases: cases.length - mismatches.length,
  exactRate: cases.length ? (cases.length - mismatches.length) / cases.length : 1, differences: mismatches };
console.log(JSON.stringify(summary, null, 2));
if (mismatches.length) process.exitCode = 1;
