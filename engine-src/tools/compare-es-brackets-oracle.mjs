import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-synthesis.js", "es-spelling.js", "es-filter-morfologik-speller.js", "es-chunker.js", "es-xml-disambiguation.js", "es-text.js", "es-sentences.js", "es-structural-rules.js", "es-simple-replace.js", "es-simple-replace-verbs.js", "es-wrong-word-context.js", "es-compounds.js", "ca-java-case-regex.js", "es-pattern-rule-matcher.js", "es-pipeline.js"]) {
  vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
}
const corpus = resolve(root, "analysis/reference-oracle/corpus/spanish-phase3-brackets.txt");
const oracleFile = resolve(root, "analysis/reference-oracle/outputs/spanish-phase3-brackets-oracle.json");
const [text, oracle, patternRules] = await Promise.all([
  readFile(corpus, "utf8"),
  readFile(oracleFile, "utf8").then(JSON.parse),
  readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json"), "utf8").then(JSON.parse)
]);
const targetIds = new Set(["ES_UNPAIRED_BRACKETS"]);
const expected = oracle.matches.filter(match => targetIds.has(match.ruleId))
  .map(match => ({ ruleId: match.ruleId, start: match.from, end: match.to, suggestions: match.suggestions }));
const resourceDir = resolve(root, "engine-src/resources/es-ES");
const fetcher = async url => {
  const name = new URL(url).pathname.split("/").at(-1);
  const file = name === "es-pattern-rule-candidates.json"
    ? resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json")
    : resolve(resourceDir, name);
  return new Response(await readFile(file), { status: 200 });
};
const pipeline = await globalThis.CorrectorSpanishPipeline.load({ baseUrl: "https://fixture.invalid/resources/es-ES/", fetcher });
const actual = pipeline.analyzeText(text).issues.filter(issue => targetIds.has(issue.ruleId))
  .map(({ ruleId, start, end, suggestions }) => ({ ruleId, start, end, suggestions }));
const same = JSON.stringify(expected) === JSON.stringify(actual);
console.log(JSON.stringify({ corpus: "spanish-phase3-brackets.txt", expected: expected.length, actual: actual.length, exactRangesAndSuggestions: same, expected, actual, okay: same }, null, 2));
if (!same) throw new Error("The Spanish unpaired-brackets rule differs from the LanguageTool oracle.");
