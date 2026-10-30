import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const artifactDir = resolve(root, "analysis/reference-oracle/artifacts/spanish-pos-dict-2.5");
const outDir = resolve(root, "engine-src/resources/es-ES");
const graph = await readFile(resolve(artifactDir, "es-ES-graph.bin"));
const dictionary = await readFile(resolve(artifactDir, "extracted/org/languagetool/resource/es/es-ES.dict"));
const graphMeta = JSON.parse(await readFile(resolve(artifactDir, "es-ES-graph-metadata.json"), "utf8"));
const hash = createHash("sha256").update(graph).digest("hex");
const expectedGraphHash = "80032b6167b6f365f3d2b4efe02c9444c473fbb85558ef75d69966749f26b4df";
if (hash !== expectedGraphHash) throw new Error(`Unexpected Spanish POS FSA graph hash: ${hash}`);
if (createHash("sha256").update(dictionary).digest("hex") !== "a3026f6457f2bf7bbf501f7d1c10a3a54bcdb10c8387da107532c934d75a39d3") throw new Error("Spanish POS source dictionary hash mismatch.");
if (graph.toString("ascii", 0, 4) !== "CFAS") throw new Error("Spanish POS FSA graph has an invalid header.");
const nodes = graph.readUInt32LE(4), arcs = graph.readUInt32LE(8);
if (graph.length !== 12 + (nodes + 1) * 4 + arcs * 12) throw new Error("Spanish POS FSA graph has invalid dimensions.");
const compressed = gzipSync(graph, { level: 9, mtime: 0 });
const manifest = {
  schema: 1,
  format: "CACFSA1",
  profile: "es-ES LanguageTool 6.9-SNAPSHOT / spanish-pos-dict 2.5",
  dataFile: "es-ES-pos-fsa.bin.gz",
  rawBytes: graph.length,
  compressedBytes: compressed.length,
  rawSha256: hash,
  compressedSha256: createHash("sha256").update(compressed).digest("hex"),
  nodes,
  arcs,
  forms: 3454910,
  lemmas: 131373,
  readings: 3703832,
  separator: graphMeta.separator,
  frequencyIncluded: true,
  ignoreDiacritics: true,
  spellerFlags: graphMeta.spellerFlags,
  equivalentChars: graphMeta.equivalentChars,
  replacementPairs: graphMeta.replacementPairs,
  inputConversion: graphMeta.inputConversion,
  outputConversion: graphMeta.outputConversion,
  sequenceEncoder: "SUFFIX (Morfologik TrimSuffixEncoder 2.2.0)",
  sources: [
    { path: "org.softcatala:spanish-pos-dict:2.5!/org/languagetool/resource/es/es-ES.dict", sha256: "a3026f6457f2bf7bbf501f7d1c10a3a54bcdb10c8387da107532c934d75a39d3" },
    { path: "Morfologik 2.2.0 DictionaryLookup FSA export", sha256: hash }
  ],
  license: "LGPL-2.1; preserve spanish-pos-dict notices and source availability obligations."
};
const synthGraph = await readFile(resolve(artifactDir, "es-ES-synth-graph.bin"));
const synthHash = createHash("sha256").update(synthGraph).digest("hex");
if (synthHash !== "64987ff80873ed0608f83196373138a2bab14296de6feaf5dd4cdcb48a5044b4") throw new Error(`Unexpected Spanish synthesis FSA graph hash: ${synthHash}`);
const synthDict = await readFile(resolve(artifactDir, "extracted/org/languagetool/resource/es/es-ES_synth.dict"));
if (createHash("sha256").update(synthDict).digest("hex") !== "25665f3ab9690f8c15e7c6efddf2973bd887545b79e43f08545554813a3c4c95") throw new Error("Spanish synthesis dictionary source hash mismatch.");
const synthView = new DataView(synthGraph.buffer, synthGraph.byteOffset, synthGraph.byteLength), synthNodes = synthView.getUint32(4, true), synthArcs = synthView.getUint32(8, true);
if (synthGraph.toString("ascii", 0, 4) !== "CFAS" || synthGraph.length !== 12 + (synthNodes + 1) * 4 + synthArcs * 12) throw new Error("Spanish synthesis FSA graph has invalid dimensions.");
const synthCompressed = gzipSync(synthGraph, { level: 9, mtime: 0 });
const synthManifest = { ...manifest, dataFile: "es-ES-synthesis-fsa.bin.gz", rawBytes: synthGraph.length, compressedBytes: synthCompressed.length, rawSha256: synthHash, compressedSha256: createHash("sha256").update(synthCompressed).digest("hex"), nodes: synthNodes, arcs: synthArcs, separator: 95, forms: 0, lemmas: 0, readings: 0, dictionary: "es-ES_synth.dict", sources: [{ path: "org.softcatala:spanish-pos-dict:2.5!/org/languagetool/resource/es/es-ES_synth.dict", sha256: "25665f3ab9690f8c15e7c6efddf2973bd887545b79e43f08545554813a3c4c95" }, { path: "Morfologik 2.2.0 DictionaryLookup FSA export", sha256: synthHash }] };
delete synthManifest.sequenceEncoder;
await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, manifest.dataFile), compressed);
await writeFile(resolve(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(resolve(outDir, synthManifest.dataFile), synthCompressed);
await writeFile(resolve(outDir, "synthesis-manifest.json"), `${JSON.stringify(synthManifest, null, 2)}\n`);
await writeFile(resolve(outDir, "es-ES-tags.txt"), await readFile(resolve(artifactDir, "extracted/org/languagetool/resource/es/es-ES_tags.txt")));
console.log(JSON.stringify({ pos: { ...manifest, dataFile: resolve(outDir, manifest.dataFile) }, synthesis: synthManifest }, null, 2));
