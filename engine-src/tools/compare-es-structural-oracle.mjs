/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-synthesis.js", "es-spelling.js", "es-filter-morfologik-speller.js", "es-chunker.js", "es-xml-disambiguation.js", "es-text.js", "es-sentences.js", "es-structural-rules.js", "es-simple-replace.js", "es-simple-replace-verbs.js", "es-wrong-word-context.js", "es-compounds.js", "ca-java-case-regex.js", "es-pattern-rule-matcher.js", "es-pipeline.js"]) {
  vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
}
const corpus = resolve(root, "analysis/reference-oracle/corpus/spanish-phase3-structural.txt");
const oracleFile = resolve(root, "analysis/reference-oracle/outputs/spanish-phase3-structural-oracle.json");
const text = await readFile(corpus, "utf8");
const oracle = JSON.parse(await readFile(oracleFile, "utf8"));
const patternRules = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json"), "utf8"));
const targetIds = new Set(["WHITESPACE_RULE", "DOUBLE_PUNCTUATION", "UPPERCASE_SENTENCE_START", "COMMA_PARENTHESIS_WHITESPACE", "SPANISH_WORD_REPEAT_RULE", "INCORRECT_SPACES", "ES_INITIAL_QUESTION_MARK", "CAPITALIZATION_AFTER_QUESTION_MARK"]);
const expected = oracle.matches.filter(match => targetIds.has(match.ruleId))
  .map(match => ({ ruleId: match.ruleId, start: match.from, end: match.to, suggestions: match.suggestions }));
const resourceDir = resolve(root, "engine-src/resources/es-ES");
const fetcher = async url => {
  const name = new URL(url).pathname.split("/").at(-1);
  if (name === "es-pattern-rule-candidates.json") return new Response(JSON.stringify(patternRules));
  const bytes = await readFile(resolve(resourceDir, name));
  return new Response(name.endsWith(".json") ? bytes.toString("utf8") : bytes);
};
const pipeline = await globalThis.CorrectorSpanishPipeline.load({ baseUrl: "https://fixture.invalid/resources/es-ES/", fetcher });
const actual = pipeline.analyzeText(text).issues.filter(issue => targetIds.has(issue.ruleId))
  .map(({ ruleId, start, end, suggestions }) => ({ ruleId, start, end, suggestions }));
const same = JSON.stringify(expected) === JSON.stringify(actual);
console.log(JSON.stringify({ corpus: "spanish-phase3-structural.txt", oracleRuleMatches: expected.length, localRuleMatches: actual.length, exactRangesAndSuggestions: same, expected, actual, okay: same }, null, 2));
if (!same) throw new Error("The structural Spanish rules differ from the LanguageTool oracle.");
