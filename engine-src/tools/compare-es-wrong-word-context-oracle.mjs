import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-synthesis.js", "es-spelling.js", "es-chunker.js", "es-xml-disambiguation.js", "es-text.js", "es-sentences.js", "es-structural-rules.js", "es-simple-replace.js", "es-simple-replace-verbs.js", "es-wrong-word-context.js", "es-compounds.js", "ca-java-case-regex.js", "es-pattern-rule-matcher.js", "es-pipeline.js"]) vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
const dir = resolve(root, "engine-src/resources/es-ES");
const posManifest = JSON.parse(await readFile(resolve(dir, "manifest.json"), "utf8"));
const pos = gunzipSync(await readFile(resolve(dir, posManifest.dataFile)));
const synthesisManifest = JSON.parse(await readFile(resolve(dir, "synthesis-manifest.json"), "utf8"));
const synthesis = gunzipSync(await readFile(resolve(dir, synthesisManifest.dataFile)));
const corpus = (await readFile(resolve(root, "analysis/reference-oracle/corpus/spanish-wrong-word-context.txt"), "utf8")).replace(/\r/gu, "").split("\n").filter(Boolean);
const oracle = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-wrong-word-context-oracle.json"), "utf8"));
const expected = oracle.matches.filter(match => match.ruleId.startsWith("SPANISH_WRONG_WORD_IN_CONTEXT_"))
  .map(match => ({ start: match.from, end: match.to, text: match.matchedText, suggestions: match.suggestions }));
const morphology = new globalThis.CorrectorSpanishMorphology(pos.buffer.slice(pos.byteOffset, pos.byteOffset + pos.byteLength), posManifest);
morphology.configureManualTags(JSON.parse(await readFile(resolve(dir, "es-manual-tags.json"), "utf8")));
const synthesizer = new globalThis.CorrectorSpanishSynthesizer(synthesis.buffer.slice(synthesis.byteOffset, synthesis.byteOffset + synthesis.byteLength), synthesisManifest);
await globalThis.CorrectorSpanishXmlDisambiguator.load({ url: "es-disambiguation-rules.json", fetcher: async () => ({ ok: true, json: async () => JSON.parse(await readFile(resolve(dir, "es-disambiguation-rules.json"), "utf8")) }) });
const pipeline = await globalThis.CorrectorSpanishPipeline.load({
  baseUrl: "https://fixture.invalid/resources/es-ES/",
  fetcher: async url => {
    const name = new URL(url).pathname.split("/").at(-1);
    const bytes = name === "es-pattern-rule-candidates.json"
      ? await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json"))
      : await readFile(resolve(dir, name));
    return new Response(bytes, { status: 200 });
  }
});
let offset = 0;
const actual = [];
for (const line of corpus) {
  for (const issue of pipeline.analyzeText(line).issues.filter(issue => issue.ruleId === "SPANISH_WRONG_WORD_IN_CONTEXT")) {
    actual.push({ start: offset + issue.start, end: offset + issue.end, text: issue.text, suggestions: issue.suggestions });
  }
  offset += line.length + 1;
}
const key = item => JSON.stringify([item.start, item.end, item.text, item.suggestions]);
const actualKeys = new Set(actual.map(key));
const expectedKeys = new Set(expected.map(key));
const missing = expected.filter(item => !actualKeys.has(key(item)));
const extra = actual.filter(item => !expectedKeys.has(key(item)));
const summary = { corpusLines: corpus.length, oracleIssues: expected.length, localIssues: actual.length,
  exactRangeTextAndSuggestions: expected.length - missing.length, missing, extra, fullParity: missing.length === 0 && extra.length === 0 };
console.log(JSON.stringify(summary, null, 2));
if (missing.length || extra.length) process.exitCode = 1;
