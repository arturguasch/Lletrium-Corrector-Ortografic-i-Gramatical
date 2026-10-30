/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-text.js", "es-simple-replace.js"]) vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
const dir = resolve(root, "engine-src/resources/es-ES");
const manifest = JSON.parse(await readFile(resolve(dir, "manifest.json"), "utf8"));
const gzip = await readFile(resolve(dir, manifest.dataFile));
const pos = gunzipSync(gzip);
const morphology = new globalThis.CorrectorSpanishMorphology(pos.buffer.slice(pos.byteOffset, pos.byteOffset + pos.byteLength), manifest);
const manualTags = JSON.parse(await readFile(resolve(dir, "es-manual-tags.json"), "utf8"));
morphology.configureManualTags(manualTags);
const data = globalThis.CorrectorSpanishSimpleReplace.createDataIndex(JSON.parse(await readFile(resolve(dir, "es-simple-replace.json"), "utf8")));
const lines = (await readFile(resolve(root, "analysis/reference-oracle/corpus/spanish-simple-replace-all-forms.txt"), "utf8")).replace(/\r/gu, "").split("\n").filter(Boolean);
const oracle = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-simple-replace-all-forms-oracle.json"), "utf8"));
let corpusOffset = 0;
const segments = [];
for (const line of lines) {
  const tokens = globalThis.CorrectorSpanishText.tokenize(line, morphology).map((token, index, all) => {
    if (token.kind !== "word") return { ...token, start: token.start + corpusOffset, end: token.end + corpusOffset, readings: [] };
    const tagged = globalThis.CorrectorSpanishTagger.tagToken(token, morphology, { previousText: all[index - 1]?.text ?? "", nextText: all[index + 1]?.text ?? "" });
    return { ...tagged, start: tagged.start + corpusOffset, end: tagged.end + corpusOffset };
  });
  segments.push({ text: line, start: corpusOffset, tokens });
  corpusOffset += line.length + 1;
}
const patternShadows = oracle.matches.filter(match => !match.baseRuleId.startsWith("ES_SIMPLE_REPLACE_SIMPLE_")
  && !match.baseRuleId.startsWith("ES_SIMPLE_REPLACE_VERBS_")
  && match.suggestions?.length).map(match => ({ start: match.from, end: match.to, suggestions: match.suggestions }));
const local = globalThis.CorrectorSpanishSimpleReplace.findMatches(segments, data, patternShadows);
const reference = oracle.matches.filter(match => match.baseRuleId.startsWith("ES_SIMPLE_REPLACE_SIMPLE_") && !match.baseRuleId.startsWith("ES_SIMPLE_REPLACE_VERBS_"))
  .map(match => ({ start: match.from, end: match.to, text: match.matchedText, suggestions: match.suggestions }));
const actual = local.map(match => ({ start: match.start, end: match.end, text: match.text, suggestions: match.suggestions }));
const key = item => JSON.stringify([item.start, item.end, item.text, item.suggestions]);
const expectedKeys = new Set(reference.map(key)), actualKeys = new Set(actual.map(key));
const missing = reference.filter(item => !actualKeys.has(key(item)));
const extra = actual.filter(item => !expectedKeys.has(key(item)));
const summary = { corpusForms: lines.length, languageToolSimpleReplaceIssues: reference.length, localIssues: actual.length,
  exactRangeTextAndSuggestions: reference.length - missing.length, missing: missing.slice(0, 30), extra: extra.slice(0, 30),
  fullParity: missing.length === 0 && extra.length === 0 };
console.log(JSON.stringify(summary, null, 2));
if (missing.length || extra.length) process.exitCode = 1;
