/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile, writeFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const corpusPath = resolve(root, "analysis/reference-oracle/corpus/spanish-spelling-ranking.txt");
const oraclePath = resolve(root, "analysis/reference-oracle/outputs/spanish-spelling-ranking-oracle.json");
const outputPath = resolve(root, "analysis/reference-oracle/outputs/spanish-spelling-ranking-comparison.json");
for (const name of ["es-morphology.js", "es-spelling.js"]) {
  vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
}
const resourceDir = resolve(root, "engine-src/resources/es-ES");
const manifest = JSON.parse(await readFile(resolve(resourceDir, "manifest.json"), "utf8"));
const compressed = await readFile(resolve(resourceDir, manifest.dataFile));
const bytes = gunzipSync(compressed);
const morphology = new globalThis.CorrectorSpanishMorphology(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), manifest);
const spelling = globalThis.CorrectorSpanishSpelling;
const spellData = spelling.createDataIndex(JSON.parse(await readFile(resolve(resourceDir, "es-spelling-data.json"), "utf8")));
const corpus = await readFile(corpusPath, "utf8");
const testedWords = [...corpus.matchAll(/contiene\s+(\S+)\s+como\s/gu)].map(match => match[1]);
const oracle = JSON.parse(await readFile(oraclePath, "utf8"));
const byWord = new Map(oracle.map(row => [row.word.toLocaleLowerCase("es"), row]));
const rows = testedWords.map(word => {
  const source = word.toLocaleLowerCase("es");
  const upstream = byWord.get(source) || null;
  const detected = spelling.isMisspelled(word, morphology, { spellData });
  const suggestions = detected ? spelling.suggest(word, morphology, { spellData }) : [];
  const expected = upstream?.suggestions || [];
  return {
    word,
    languageToolFlags: Boolean(upstream),
    localFlags: detected,
    languageToolSuggestions: expected.slice(0, 8),
    localSuggestions: suggestions,
    firstSuggestionMatches: Boolean(expected.length && suggestions[0] === expected[0]),
    expectedFirstInLocalTopFive: Boolean(expected.length && suggestions.slice(0, 5).includes(expected[0])),
    topEightOrderMatches: expected.slice(0, 8).join("\u0000") === suggestions.join("\u0000")
  };
});
const flagged = rows.filter(row => row.languageToolFlags);
const result = {
  schemaVersion: 1,
  source: "LanguageTool 6.9-SNAPSHOT JLanguageTool(es-ES), MORFOLOGIK_RULE_ES, default config",
  totalCorpusWords: rows.length,
  languageToolSpellingMatches: flagged.length,
  localFalseNegatives: rows.filter(row => row.languageToolFlags && !row.localFlags).map(row => row.word),
  localOnlyFlags: rows.filter(row => row.localFlags && !row.languageToolFlags).map(row => row.word),
  firstSuggestionMatches: flagged.filter(row => row.firstSuggestionMatches).length,
  expectedFirstInLocalTopFive: flagged.filter(row => row.expectedFirstInLocalTopFive).length,
  exactTopEightOrderMatches: flagged.filter(row => row.topEightOrderMatches).length,
  matches: rows
};
await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ ...result, matches: undefined, outputPath }, null, 2));
