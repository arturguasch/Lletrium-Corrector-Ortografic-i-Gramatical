import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourceDir = resolve(root, "analysis/reference-oracle/artifacts/catalan-pos-dict-3.3/extracted/org/languagetool/resource/ca");
const outputDir = resolve(root, "analysis/catalan-reduction/candidate-resources");
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const specs = [
  { id: "analysis", filename: "ca-ES.dict", output: "ca-analysis.cfsa2.gz", info: "ca-ES.info" },
  { id: "synthesis", filename: "ca-ES_synth.dict", output: "ca-synthesis.cfsa2.gz", info: "ca-ES_synth.info" },
];
const [morphologyIndex, synthesisManifest] = await Promise.all([
  readFile(resolve(root, "build/extension/build/resources/central/resource-index.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "engine-src/resources/synthesis/manifest.json"), "utf8").then(JSON.parse),
]);
await mkdir(outputDir, { recursive: true });
await rm(resolve(outputDir, "manifest.json"), { force: true });
const resources = [];
for (const spec of specs) {
  const [source, info] = await Promise.all([
    readFile(resolve(sourceDir, spec.filename)),
    readFile(resolve(sourceDir, spec.info), "utf8"),
  ]);
  const compressed = gzipSync(source, { level: 9, mtime: 0 });
  const flags = source.length >= 8 ? source.readUInt16BE(5) : -1;
  const labelsLength = source[7];
  const metadata = {
    id: spec.id,
    file: spec.output,
    source: `org.softcatala:catalan-pos-dict:3.3!/org/languagetool/resource/ca/${spec.filename}`,
    sourceSha256: digest(source),
    rawSha256: digest(source),
    sourceBytes: source.length,
    compressedSha256: digest(compressed),
    compressedBytes: compressed.length,
    format: "CFSA2",
    version: source[4],
    flags,
    labelMapBytes: labelsLength,
    arcBytes: source.length - 8 - labelsLength,
    separator: /fsa\.dict\.separator=(.)/u.exec(info)?.[1] ?? null,
    encoding: /fsa\.dict\.encoding=(.+)/u.exec(info)?.[1]?.trim() ?? null,
    encoder: /fsa\.dict\.encoder=(.+)/u.exec(info)?.[1]?.trim() ?? null,
    counts: spec.id === "analysis" ? morphologyIndex.counts : { rows: synthesisManifest.rows, keys: synthesisManifest.keys },
    profile: spec.id === "analysis" ? morphologyIndex.profile : "ca-ES; compact synthesis dictionary plus ordered LanguageTool overrides",
    licenseChoice: "LGPL-2.1-or-later for the dictionary data, matching the current release notices",
  };
  if (source.subarray(0, 5).toString("hex") !== "5c667361c6" || flags !== 7 || metadata.separator !== "_" || metadata.encoding?.toLowerCase() !== "utf-8" || metadata.encoder !== "SUFFIX") {
    throw new Error(`Unexpected CFSA2 source metadata for ${spec.filename}: ${JSON.stringify(metadata)}`);
  }
  await writeFile(resolve(outputDir, spec.output), compressed);
  resources.push(metadata);
}
const resourceSource = resolve(root, "references/languagetool-ca-central/src/main/resources/org/languagetool/resource/ca");
const tagPath = resolve(root, "analysis/reference-oracle/artifacts/catalan-pos-dict-3.3/ca-ES-synthesis-tags.json");
const overlaySpecs = [
  { action: "add", filename: "added.txt" },
  { action: "remove", filename: "removed.txt" },
  { action: "remove", filename: "do-not-synthesize.txt" },
];
const overlayRows = [];
const overlaySources = [];
for (const spec of overlaySpecs) {
  const source = await readFile(resolve(resourceSource, spec.filename));
  overlaySources.push({ file: spec.filename, action: spec.action, sha256: digest(source), bytes: source.length });
  for (const line of source.toString("utf8").split(/\r?\n/u)) {
    if (!line.trim() || line.startsWith("#")) continue;
    const [form, lemma, tag] = line.trim().split("\t");
    if (!form || !lemma || !tag) throw new Error(`Invalid ${spec.filename} row: ${line}`);
    overlayRows.push({ action: spec.action, key: `${lemma}|${tag}`, form });
  }
}
const tagBytes = await readFile(tagPath);
const tagObject = JSON.parse(tagBytes.toString("utf8"));
const overlayRaw = Buffer.from(JSON.stringify({ schema: 1, rows: overlayRows }));
const overlayGzip = gzipSync(overlayRaw, { level: 9, mtime: 0 });
await writeFile(resolve(outputDir, "ca-synthesis-overlays.json.gz"), overlayGzip);
resources.push({
  id: "synthesis-overlays",
  file: "ca-synthesis-overlays.json.gz",
  source: "LanguageTool Catalan 6.9-SNAPSHOT added.txt, removed.txt, do-not-synthesize.txt",
  sources: overlaySources,
  possibleTagsSource: "catalan-pos-dict:3.3!/org/languagetool/resource/ca/ca-ES_tags.txt and Java synthesis-tag export",
  possibleTagsSha256: digest(tagBytes),
  possibleTags: tagObject.possibleTags,
  rows: overlayRows.length,
  rawBytes: overlayRaw.length,
  rawSha256: digest(overlayRaw),
  compressedBytes: overlayGzip.length,
  compressedSha256: digest(overlayGzip),
  applicationOrder: ["base dictionary", "add", "remove", "remove"],
  licenseChoice: "LGPL-2.1-or-later, matching the current release notices",
});
const manifest = {
  schema: 1,
  purpose: "experimental only; not included in the stable extension build",
  language: "ca-ES",
  dictionaries: Object.fromEntries(resources.filter(resource => resource.id === "analysis" || resource.id === "synthesis").map(resource => [resource.id, resource])),
  resources,
};
await writeFile(resolve(outputDir, "resource-index.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ outputDir, resources }, null, 2));
