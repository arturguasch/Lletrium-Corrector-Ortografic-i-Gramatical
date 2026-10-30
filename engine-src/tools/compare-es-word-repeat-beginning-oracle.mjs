import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-synthesis.js", "es-spelling.js", "es-chunker.js", "es-xml-disambiguation.js", "es-text.js", "es-sentences.js", "es-structural-rules.js", "es-simple-replace.js", "es-simple-replace-verbs.js", "es-wrong-word-context.js", "es-compounds.js", "es-word-repeat.js", "es-word-repeat-beginning.js", "ca-java-case-regex.js", "es-pattern-rule-matcher.js", "es-pipeline.js"]) vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
const resources = resolve(root, "engine-src/resources/es-ES");
const posManifest = JSON.parse(await readFile(resolve(resources, "manifest.json"), "utf8"));
const posBytes = gunzipSync(await readFile(resolve(resources, posManifest.dataFile)));
const synthesisManifest = JSON.parse(await readFile(resolve(resources, "synthesis-manifest.json"), "utf8"));
const synthesisBytes = gunzipSync(await readFile(resolve(resources, synthesisManifest.dataFile)));
const corpus = (await readFile(resolve(root, "analysis/reference-oracle/corpus/spanish-word-repeat-beginning.txt"), "utf8")).replace(/\r/gu, "").trimEnd();
const lines = corpus.split("\n");
const oracle = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-word-repeat-beginning-oracle.json"), "utf8"));
const expected = oracle.matches.filter(match => match.ruleId === "SPANISH_WORD_REPEAT_BEGINNING_RULE").map(match => ({ start: match.from, end: match.to, text: match.matchedText, suggestions: match.suggestions }));
const morphology = new globalThis.CorrectorSpanishMorphology(posBytes.buffer.slice(posBytes.byteOffset, posBytes.byteOffset + posBytes.byteLength), posManifest);
morphology.configureManualTags(JSON.parse(await readFile(resolve(resources, "es-manual-tags.json"), "utf8")));
const synthesizer = new globalThis.CorrectorSpanishSynthesizer(synthesisBytes.buffer.slice(synthesisBytes.byteOffset, synthesisBytes.byteOffset + synthesisBytes.byteLength), synthesisManifest);
await globalThis.CorrectorSpanishXmlDisambiguator.load({ url: "es-disambiguation-rules.json", fetcher: async () => ({ ok: true, json: async () => JSON.parse(await readFile(resolve(resources, "es-disambiguation-rules.json"), "utf8")) }) });
const pipeline = await globalThis.CorrectorSpanishPipeline.load({
  baseUrl: "https://fixture.invalid/resources/es-ES/",
  fetcher: async url => {
    const name = new URL(url).pathname.split("/").at(-1);
    const bytes = name === "es-pattern-rule-candidates.json"
      ? await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json"))
      : await readFile(resolve(resources, name));
    return new Response(bytes, { status: 200 });
  }
});
const actual = [];
let offset = 0;
for (const line of lines) {
  const defaultIssues = pipeline.analyzeText(line).issues.filter(issue => issue.ruleId === "SPANISH_WORD_REPEAT_BEGINNING_RULE");
  assert.equal(defaultIssues.length, 0, `Picky repeat rule leaked into DEFAULT: ${line}`);
  for (const issue of pipeline.analyzeText(line, { checkLevel: "PICKY" }).issues.filter(issue => issue.ruleId === "SPANISH_WORD_REPEAT_BEGINNING_RULE")) {
    actual.push({ start: offset + issue.start, end: offset + issue.end, text: issue.text, suggestions: issue.suggestions });
  }
  offset += line.length + 1;
}
const key = item => JSON.stringify([item.start, item.end, item.text, item.suggestions]);
const expectedKeys = new Set(expected.map(key)), actualKeys = new Set(actual.map(key));
const missing = expected.filter(item => !actualKeys.has(key(item)));
const extra = actual.filter(item => !expectedKeys.has(key(item)));
const result = { oracleCases: lines.length, oracleIssues: expected.length, localIssues: actual.length, exactRangeTextAndSuggestions: expected.length - missing.length, defaultLevelLeaks: 0, missing, extra, fullParity: missing.length === 0 && extra.length === 0 };
console.log(JSON.stringify(result, null, 2));
if (!result.fullParity) process.exitCode = 1;
