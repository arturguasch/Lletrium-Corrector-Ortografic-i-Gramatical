/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const resources = resolve(root, "engine-src/resources/es-ES");
for (const name of ["es-morphology.js", "es-tagger.js", "es-text.js", "es-sentences.js"]) vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
const manifest = JSON.parse(await readFile(resolve(resources, "manifest.json"), "utf8"));
const bytes = gunzipSync(await readFile(resolve(resources, manifest.dataFile)));
const morphology = new globalThis.CorrectorSpanishMorphology(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), manifest);
const oracle = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-phase2-tokenizer-oracle.json"), "utf8"));
const differences = [];
for (const sentence of oracle.analysis) {
  const expected = sentence.preDisambiguationTokens.filter(token => token.text).map(token => [token.text, token.startInSentence, token.endInSentence]);
  const actual = globalThis.CorrectorSpanishText.tokenize(sentence.text, morphology).map(token => [token.text, token.start, token.end]);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) differences.push({ sentence: sentence.text, expected, actual });
}
const inputText = await readFile(resolve(root, "analysis/reference-oracle/corpus/spanish-phase2-tokenizer.txt"), "utf8");
const srx = JSON.parse(await readFile(resolve(resources, "es-srx.json"), "utf8"));
const sentenceTokenizer = new globalThis.CorrectorSpanishSentenceTokenizer(srx);
const expectedSegments = oracle.analysis.map(sentence => sentence.text);
const actualSegments = sentenceTokenizer.segment(inputText).map(sentence => sentence.text);
const sentenceBoundariesMatch = JSON.stringify(actualSegments) === JSON.stringify(expectedSegments);
const urlCases = ["mail-archive.com", "https://mail-archive.com/help", "Contacta test@example.es", "example.co.uk.", "versión 3.14", "Ven.Como prefieras."];
const urlCaseResults = urlCases.map(text => ({ text, tokens: globalThis.CorrectorSpanishText.tokenize(text, morphology).map(token => ({ text: token.text, isUrl: token.isUrl === true })) }));
const expectedUrlCases = [
  [{ text: "mail-archive.com", isUrl: true }],
  [{ text: "https://mail-archive.com/help", isUrl: true }],
  [{ text: "Contacta", isUrl: false }, { text: " ", isUrl: false }, { text: "test@example.es", isUrl: true }],
  [{ text: "example.co.uk", isUrl: true }, { text: ".", isUrl: false }],
  [{ text: "versión", isUrl: false }, { text: " ", isUrl: false }, { text: "3.14", isUrl: false }],
  [{ text: "Ven", isUrl: false }, { text: ".", isUrl: false }, { text: "Como", isUrl: false }, { text: " ", isUrl: false }, { text: "prefieras", isUrl: false }, { text: ".", isUrl: false }]
];
const urlCasesMatch = JSON.stringify(urlCaseResults.map(result => result.tokens)) === JSON.stringify(expectedUrlCases);
console.log(JSON.stringify({ sentences: oracle.analysis.length, exactTokenMatches: oracle.analysis.length - differences.length, tokenizerDifferences: differences, sentenceBoundariesMatch, expectedSegments, actualSegments, urlCaseResults, urlCasesMatch }, null, 2));
if (!sentenceBoundariesMatch || differences.length || !urlCasesMatch) throw new Error("Spanish tokenizer verification failed.");
