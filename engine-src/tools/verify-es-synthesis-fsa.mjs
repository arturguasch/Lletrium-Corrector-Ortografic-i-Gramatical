import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const resources = resolve(root, "engine-src/resources/es-ES");
vm.runInThisContext(await readFile(resolve(root, "engine-src/modules/es-synthesis.js"), "utf8"));
const manifest = JSON.parse(await readFile(resolve(resources, "synthesis-manifest.json"), "utf8"));
const graph = gunzipSync(await readFile(resolve(resources, manifest.dataFile)));
const synthesizer = new globalThis.CorrectorSpanishSynthesizer(graph.buffer.slice(graph.byteOffset, graph.byteOffset + graph.byteLength), manifest);
const tsvPath = resolve(root, "analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/es-ES-synthesis-entries.tsv");
const fixtureKeys = ["casa|NCFS000", "casa|NCFP000", "hablar|VMN0000", "hablar|VMIP1S0", "ser|VMIP1S0", "rápido|AQ0MS0", "bueno|AQ0MS0", "España|NP00000", "dormir|VMG0000:PP1CS000"];
// The source oracle is 163 MB. Sample every 1000th distinct sorted key to
// compare thousands of lemma/tag entries without loading that export into RAM.
const selectedKeys = new Set(fixtureKeys);
let uniqueKeys = 0, previousKey = "";
for await (const line of createInterface({ input: createReadStream(tsvPath), crlfDelay: Infinity })) {
  if (!line) continue;
  const split = line.indexOf("\t"), key = line.slice(0, split);
  if (key === previousKey) continue;
  previousKey = key;
  if (uniqueKeys++ % 1000 === 0) selectedKeys.add(key);
}
const expectedByKey = new Map([...selectedKeys].map(key => [key, []]));
for await (const line of createInterface({ input: createReadStream(tsvPath), crlfDelay: Infinity })) {
  if (!line) continue;
  const split = line.indexOf("\t"), key = line.slice(0, split), forms = expectedByKey.get(key);
  if (forms) forms.push(line.slice(split + 1));
}
const failures = [];
for (const [key, expected] of expectedByKey) {
  const actual = synthesizer.lookup(key);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) failures.push({ key, expected: expected.slice(0, 8), actual: actual.slice(0, 8), expectedCount: expected.length, actualCount: actual.length });
}
if (failures.length) throw new Error(`Spanish synthesis FSA differs from Morfologik DictionaryLookup: ${JSON.stringify(failures.slice(0, 8))}`);
console.log(JSON.stringify({ checked: expectedByKey.size, passed: expectedByKey.size, upstreamUniqueKeys: uniqueKeys, oracle: "Morfologik DictionaryLookup TSV", okay: true }, null, 2));
