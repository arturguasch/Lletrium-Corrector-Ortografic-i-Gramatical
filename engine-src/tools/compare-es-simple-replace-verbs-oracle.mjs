/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-synthesis.js", "es-text.js", "es-simple-replace.js", "es-simple-replace-verbs.js"]) vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
const dir = resolve(root, "engine-src/resources/es-ES");
const posManifest = JSON.parse(await readFile(resolve(dir, "manifest.json"), "utf8"));
const posBytes = gunzipSync(await readFile(resolve(dir, posManifest.dataFile)));
const synthManifest = JSON.parse(await readFile(resolve(dir, "synthesis-manifest.json"), "utf8"));
const synthBytes = gunzipSync(await readFile(resolve(dir, synthManifest.dataFile)));
const morphology = new globalThis.CorrectorSpanishMorphology(posBytes.buffer.slice(posBytes.byteOffset, posBytes.byteOffset + posBytes.byteLength), posManifest);
const synthesizer = new globalThis.CorrectorSpanishSynthesizer(synthBytes.buffer.slice(synthBytes.byteOffset, synthBytes.byteOffset + synthBytes.byteLength), synthManifest);
const resource = JSON.parse(await readFile(resolve(dir, "es-simple-replace.json"), "utf8"));
const simpleData = globalThis.CorrectorSpanishSimpleReplace.createDataIndex(resource);
const verbData = globalThis.CorrectorSpanishSimpleReplaceVerbs.createDataIndex(resource);
const rawLines = (await readFile(resolve(root, "analysis/reference-oracle/corpus/spanish-simple-replace-verbs-probe.txt"), "utf8")).split("\n").filter(Boolean);
const oracle = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-simple-replace-verbs-probe.json"), "utf8"));
let offset = 0;
const segments = [];
for (const rawLine of rawLines) {
  const line = rawLine.replace(/\r$/u, "");
  const tokens = globalThis.CorrectorSpanishText.tokenize(line, morphology).map((token, index, all) => {
    if (token.kind !== "word") return { ...token, start: token.start + offset, end: token.end + offset, readings: [] };
    const tagged = globalThis.CorrectorSpanishTagger.tagToken(token, morphology, { previousText: all[index - 1]?.text ?? "", nextText: all[index + 1]?.text ?? "" });
    return { ...tagged, start: tagged.start + offset, end: tagged.end + offset };
  });
  segments.push({ text: line, start: offset, tokens });
  offset += rawLine.length + 1;
}
const simpleShadows = globalThis.CorrectorSpanishSimpleReplace.findMatches(segments, simpleData);
const local = globalThis.CorrectorSpanishSimpleReplaceVerbs.findMatches(segments, verbData, { morphology, synthesizer, shadowedIssues: simpleShadows });
const reference = oracle.matches.filter(match => match.baseRuleId.startsWith("ES_SIMPLE_REPLACE_VERBS_"))
  .map(match => ({ start: match.from, end: match.to, text: match.matchedText, suggestions: match.suggestions }));
const actual = local.map(match => ({ start: match.start, end: match.end, text: match.text, suggestions: match.suggestions }));
const key = item => JSON.stringify([item.start, item.end, item.text, item.suggestions]);
const expectedKeys = new Set(reference.map(key)), actualKeys = new Set(actual.map(key));
const missing = reference.filter(item => !actualKeys.has(key(item)));
const extra = actual.filter(item => !expectedKeys.has(key(item)));
const summary = { corpusForms: rawLines.length, languageToolVerbIssues: reference.length, localIssues: actual.length,
  exactRangeTextAndSuggestions: reference.length - missing.length, missing, extra, fullParity: !missing.length && !extra.length };
console.log(JSON.stringify(summary, null, 2));
if (missing.length || extra.length) process.exitCode = 1;
