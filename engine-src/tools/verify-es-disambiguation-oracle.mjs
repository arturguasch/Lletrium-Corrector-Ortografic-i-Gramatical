import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-tagger.js", "es-synthesis.js", "es-spelling.js", "es-chunker.js", "es-xml-disambiguation.js", "es-text.js", "es-sentences.js", "es-structural-rules.js", "ca-java-case-regex.js", "es-pattern-rule-matcher.js", "es-pipeline.js"]) vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
const dir = resolve(root, "engine-src/resources/es-ES");
const posManifest = JSON.parse(await readFile(resolve(dir, "manifest.json"), "utf8"));
const posBytes = gunzipSync(await readFile(resolve(dir, posManifest.dataFile)));
const synthManifest = JSON.parse(await readFile(resolve(dir, "synthesis-manifest.json"), "utf8"));
const synthBytes = gunzipSync(await readFile(resolve(dir, synthManifest.dataFile)));
const [srx, multiword, multitokenSpellerData, disambiguation, spellResource, oracle] = await Promise.all([
  "es-srx.json", "es-multiword.json", "es-multitoken-speller.json", "es-disambiguation-rules.json", "es-spelling-data.json"
].map(name => readFile(resolve(dir, name), "utf8").then(JSON.parse)).concat([
  readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-phase2-tokenizer-oracle.json"), "utf8").then(JSON.parse)
]));
const morphology = new globalThis.CorrectorSpanishMorphology(posBytes.buffer.slice(posBytes.byteOffset, posBytes.byteOffset + posBytes.byteLength), posManifest);
const synthesizer = new globalThis.CorrectorSpanishSynthesizer(synthBytes.buffer.slice(synthBytes.byteOffset, synthBytes.byteOffset + synthBytes.byteLength), synthManifest);
const spellingData = globalThis.CorrectorSpanishSpelling.createDataIndex(spellResource);
const patternRules = JSON.parse(await readFile(resolve(root, "analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json"), "utf8"));
const repeatedPatternRules = JSON.parse(await readFile(resolve(root, "engine-src/resources/es-ES/es-repeated-pattern-rules.json"), "utf8"));
await globalThis.CorrectorSpanishXmlDisambiguator.load({ url: "es-disambiguation-rules.json", fetcher: async () => ({ ok: true, json: async () => disambiguation }) });
await globalThis.CorrectorSpanishPatternRuleMatcher.load({ url: "es-pattern-rule-candidates.json", fetcher: async url => ({ ok: true, json: async () => String(url).includes("repeated-pattern") ? repeatedPatternRules : patternRules }) });
const pipeline = new globalThis.CorrectorSpanishPipeline({ morphology, tagger: globalThis.CorrectorSpanishTagger, synthesizer, sentenceTokenizer: new globalThis.CorrectorSpanishSentenceTokenizer(srx), chunker: new globalThis.CorrectorSpanishChunker(multiword), disambiguator: globalThis.CorrectorSpanishXmlDisambiguator, spellingData, multitokenSpellerData });
const input = await readFile(resolve(root, "analysis/reference-oracle/corpus/spanish-phase2-tokenizer.txt"), "utf8");
const actual = pipeline.analyzeText(input, { traceDisambiguation: true });
const differences = [];
let expectedTokens = 0, actualTokens = 0, matchedRules = 0;
for (let sentenceIndex = 0; sentenceIndex < Math.max(oracle.analysis.length, actual.sentences.length); sentenceIndex++) {
  const expected = oracle.analysis[sentenceIndex]?.postDisambiguationTokens?.filter(token => !token.whitespace && token.text !== "") || [];
  const got = actual.sentences[sentenceIndex]?.tokens?.filter(token => token.kind !== "space") || [];
  expectedTokens += expected.length; actualTokens += got.length; matchedRules += actual.sentences[sentenceIndex]?.disambiguationStats?.matches || 0;
  if (expected.length !== got.length) differences.push({ sentenceIndex, reason: "token-count", expected: expected.length, actual: got.length });
  for (let i = 0; i < Math.min(expected.length, got.length); i++) {
    const exp = expected[i], act = got[i];
    const expReadings = exp.readings.map(reading => `${reading.lemma ?? ""}\t${reading.pos ?? ""}`);
    const actReadings = (act.contextualReadings || []).map(reading => `${reading.lemma ?? ""}\t${reading.tag ?? ""}`);
    if (exp.text !== act.text || JSON.stringify(expReadings) !== JSON.stringify(actReadings)) differences.push({ sentenceIndex, token: exp.text, actualToken: act.text, expected: expReadings, actual: actReadings });
  }
}
console.log(JSON.stringify({ profile: "es-ES", sentences: actual.sentences.length, upstreamDisambiguationRules: disambiguation.upstreamRuleCount, locallyLoadedRules: disambiguation.supportedRuleCount, excludedRules: disambiguation.excludedRuleCount, matchedRulesInCorpus: matchedRules, matchedRuleIds: actual.sentences.flatMap(sentence => sentence.disambiguationStats.matchedRuleIds || []), abbreviationChunks: actual.sentences[2]?.chunkStats.matches.filter(match => match.lemma.includes("EE")), abbreviationTokens: actual.sentences[2]?.tokens.filter(token => ["EE", "UU"].includes(token.text)).map(token => ({text:token.text,known:token.known,readings:token.contextualReadings})), expectedTokens, actualTokens, exactReadingDifferences: differences.length, differences: differences.slice(0, 12) }, null, 2));
