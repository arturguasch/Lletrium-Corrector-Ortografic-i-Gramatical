import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-text.js"]) vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
const resourceDir = resolve(root, "engine-src/resources/es-ES"), manifest = JSON.parse(await readFile(resolve(resourceDir, "manifest.json"), "utf8"));
const bytes = gunzipSync(await readFile(resolve(resourceDir, manifest.dataFile)));
const morphology = new globalThis.CorrectorSpanishMorphology(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), manifest);
const manualTags = JSON.parse(await readFile(resolve(resourceDir, "es-manual-tags.json"), "utf8"));
morphology.configureManualTags(manualTags);
const oracle = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-tagger-oracle.json"), "utf8"));
const differences = [];
const input = await readFile(resolve(root, "analysis/reference-oracle/corpus/spanish-phase2-tokenizer.txt"), "utf8");
const actualTokens = globalThis.CorrectorSpanishText.tokenize(input, morphology);
if (oracle.length !== actualTokens.length) differences.push({ reason: "token-count", expected: oracle.length, actual: actualTokens.length });
for (let index = 0; index < Math.min(oracle.length, actualTokens.length); index++) {
  const expected = oracle[index], token = actualTokens[index];
  if (expected.text !== token.text || expected.start !== token.start || expected.end !== token.end) differences.push({ token: expected.text, reason: "token-boundary", expectedRange: [expected.start, expected.end], actualText: token.text, actualRange: [token.start, token.end] });
  const actual = globalThis.CorrectorSpanishTagger.tagToken(token, morphology, { previousText: actualTokens[index - 1]?.text ?? "", nextText: actualTokens[index + 1]?.text ?? "" });
  const expectedReadings = expected.readings.map(reading => `${reading.lemma ?? ""}\t${reading.tag ?? ""}`);
  const actualReadings = actual.readings.map(reading => `${reading.lemma ?? ""}\t${reading.tag ?? ""}`);
  if (JSON.stringify(expectedReadings) !== JSON.stringify(actualReadings)) differences.push({ token: expected.text, expected: expectedReadings, actual: actualReadings });
}
const litoReadings = globalThis.CorrectorSpanishTagger.tagToken({ text: "lito", kind: "word" }, morphology).readings.map(reading => `${reading.lemma}\t${reading.tag}`);
if (!litoReadings.includes("lito\tNCMS000")) differences.push({ token: "lito", reason: "missing-manual-masculine-reading", readings: litoReadings });
const removedSurfaceReadings = globalThis.CorrectorSpanishTagger.tagToken({ text: "paradógico", kind: "word" }, morphology).readings;
const rawDerivedReadings = globalThis.CorrectorSpanishTagger.tagToken({ text: "paradógicamente", kind: "word" }, morphology).readings;
if (removedSurfaceReadings.some(reading => reading.tag) || !rawDerivedReadings.some(reading => reading.tag === "RG")) {
  differences.push({ token: "paradógicamente", reason: "overlay-removal-vs-raw-fsa-derived-tag", removedSurfaceReadings, rawDerivedReadings });
}
const mixedCaseExpectations = [["TICs", true], ["MixedCase", true], ["mixedCase", true], ["TIC", false], ["Mixedcase", false], ["texto", false]];
for (const [text, expected] of mixedCaseExpectations) {
  const actual = globalThis.CorrectorSpanishTagger.isMixedCase(text);
  if (actual !== expected) differences.push({ token: text, reason: "languagetool-mixed-case-classification", expected, actual });
}
const acronymPluralReadings = globalThis.CorrectorSpanishTagger.tagToken({ text: "TICs", kind: "word" }, morphology).readings;
if (acronymPluralReadings.some(reading => reading.tag === "NCMP000")) {
  differences.push({ token: "TICs", reason: "mixed-case-acronym-must-not-use-lowercase-fallback", readings: acronymPluralReadings });
}
console.log(JSON.stringify({ checkedTokens: oracle.length, exactDifferences: differences.length, manualTags: morphology.getStats().manualTags, litoReadings, removedSurfaceReadings, rawDerivedReadings, mixedCaseExpectations, acronymPluralReadings, differences }, null, 2));
