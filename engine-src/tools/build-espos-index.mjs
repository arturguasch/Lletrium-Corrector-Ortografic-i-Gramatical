import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const input = resolve(process.argv[2] || resolve(root, "analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/es-ES-tagged-entries.tsv"));
const outDir = resolve(process.argv[3] || resolve(root, "analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/expanded-pos-index"));
const sourceJar = resolve(root, "analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/spanish-pos-dict-2.5.jar");
const licensePath = resolve(root, "analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/LGPL-2.1.txt");
const dictPath = resolve(root, "analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/extracted/org/languagetool/resource/es/es-ES.dict");
const sourceHash = "1854fbf764cdda5bf61ef186ebdc4cb264f5eaeb0f7514bb1322188f55ae6f3c";
const jarHash = "f5cf2f9939c0fd17dd0cad75a8fd05893c7a0c035bbf159b5dc8f81740271b9a";
const dictHash = "a3026f6457f2bf7bbf501f7d1c10a3a54bcdb10c8387da107532c934d75a39d3";
if (createHash("sha256").update(await readFile(sourceJar)).digest("hex") !== jarHash) throw new Error("Spanish POS artifact JAR hash mismatch");
if (createHash("sha256").update(await readFile(dictPath)).digest("hex") !== dictHash) throw new Error("Spanish POS dictionary source hash mismatch");
const tsv = await readFile(input, "utf8");
const actualHash = createHash("sha256").update(tsv).digest("hex");
if (actualHash !== sourceHash) throw new Error(`Spanish POS export hash mismatch: ${actualHash}`);

const byForm = new Map();
const lemmas = new Set();
const tags = new Set();
let sourceRows = 0;
for (const line of tsv.split(/\r?\n/u)) {
  if (!line) continue;
  const first = line.indexOf("\t");
  const second = line.indexOf("\t", first + 1);
  if (first <= 0 || second <= first + 1 || line.indexOf("\t", second + 1) !== -1) throw new Error(`Malformed Spanish Morfologik TSV row ${sourceRows + 1}`);
  const form = line.slice(0, first), lemma = line.slice(first + 1, second), tag = line.slice(second + 1);
  if (!lemma || !tag) throw new Error(`Empty Spanish lemma/tag at TSV row ${sourceRows + 1}`);
  let readings = byForm.get(form);
  if (!readings) byForm.set(form, readings = []);
  readings.push([lemma, tag]);
  lemmas.add(lemma);
  tags.add(tag);
  sourceRows++;
}
if (sourceRows !== 3703832) throw new Error(`Unexpected Spanish Morfologik row count: ${sourceRows}`);

const forms = [...byForm.keys()].sort();
const lemmaList = [...lemmas].sort();
const tagList = [...tags].sort();
const lemmaIds = new Map(lemmaList.map((value, index) => [value, index]));
const tagIds = new Map(tagList.map((value, index) => [value, index]));

function stringTable(values) {
  const offsets = Buffer.alloc((values.length + 1) * 4);
  const encoded = values.map(value => Buffer.from(value, "utf8"));
  let total = 0;
  for (let index = 0; index < encoded.length; index++) {
    offsets.writeUInt32LE(total, index * 4);
    total += encoded[index].length;
  }
  offsets.writeUInt32LE(total, values.length * 4);
  return { offsets, bytes: Buffer.concat(encoded, total) };
}

const formTable = stringTable(forms), lemmaTable = stringTable(lemmaList), tagTable = stringTable(tagList);
const formReadingOffsets = Buffer.alloc((forms.length + 1) * 4);
const lemmaReadingOffsets = Buffer.alloc((lemmaList.length + 1) * 4);
const readings = [];
const lemmaReadingIds = Array.from({ length: lemmaList.length }, () => []);
for (let formIndex = 0; formIndex < forms.length; formIndex++) {
  formReadingOffsets.writeUInt32LE(readings.length, formIndex * 4);
  const seen = new Set();
  for (const [lemma, tag] of byForm.get(forms[formIndex])) {
    const pair = `${lemma}\0${tag}`;
    if (seen.has(pair)) continue;
    seen.add(pair);
    const readingId = readings.length, lemmaId = lemmaIds.get(lemma);
    readings.push([lemmaId, tagIds.get(tag)]);
    lemmaReadingIds[lemmaId].push(readingId);
  }
}
formReadingOffsets.writeUInt32LE(readings.length, forms.length * 4);
let reverseOffset = 0;
for (let index = 0; index < lemmaList.length; index++) {
  lemmaReadingOffsets.writeUInt32LE(reverseOffset, index * 4);
  reverseOffset += lemmaReadingIds[index].length;
}
lemmaReadingOffsets.writeUInt32LE(readings.length, lemmaList.length * 4);
const reverseBuffer = Buffer.alloc(readings.length * 4);
let reverseIndex = 0;
for (const rows of lemmaReadingIds) for (const readingId of rows) reverseBuffer.writeUInt32LE(readingId, reverseIndex++ * 4);
const readingsBuffer = Buffer.alloc(readings.length * 8);
for (let index = 0; index < readings.length; index++) {
  readingsBuffer.writeUInt32LE(readings[index][0], index * 8);
  readingsBuffer.writeUInt32LE(readings[index][1], index * 8 + 4);
}

const sections = [
  ["formsOffsets", formTable.offsets, "u32", forms.length + 1], ["formsBytes", formTable.bytes, "bytes", formTable.bytes.length],
  ["lemmasOffsets", lemmaTable.offsets, "u32", lemmaList.length + 1], ["lemmasBytes", lemmaTable.bytes, "bytes", lemmaTable.bytes.length],
  ["tagsOffsets", tagTable.offsets, "u32", tagList.length + 1], ["tagsBytes", tagTable.bytes, "bytes", tagTable.bytes.length],
  ["formReadingOffsets", formReadingOffsets, "u32", forms.length + 1], ["readings", readingsBuffer, "u32", readings.length * 2],
  ["lemmaReadingOffsets", lemmaReadingOffsets, "u32", lemmaList.length + 1], ["lemmaReadingIds", reverseBuffer, "u32", readings.length]
];
let rawLength = 8;
const sectionManifest = {};
for (const [name, bytes, type, length] of sections) {
  if (type === "u32") rawLength = Math.ceil(rawLength / 4) * 4;
  sectionManifest[name] = { offset: rawLength, length, type };
  rawLength += bytes.length;
}
const raw = Buffer.alloc(rawLength);
raw.write("CACPOS1\0", 0, "ascii");
for (const [name, bytes] of sections) bytes.copy(raw, sectionManifest[name].offset);
const compressed = gzipSync(raw, { level: 9, mtime: 0 });
const manifest = {
  schema: 1,
  format: "CACPOS1",
  profile: "es-ES LanguageTool 6.9-SNAPSHOT / spanish-pos-dict 2.5",
  dataFile: "es-ES-pos.bin.gz",
  rawBytes: raw.length,
  compressedBytes: compressed.length,
  rawSha256: createHash("sha256").update(raw).digest("hex"),
  compressedSha256: createHash("sha256").update(compressed).digest("hex"),
  counts: { forms: forms.length, lemmas: lemmaList.length, tags: tagList.length, readings: readings.length, sourceRows, duplicateReadingsRemoved: sourceRows - readings.length },
  sections: sectionManifest,
  sources: [
    { path: "org.softcatala:spanish-pos-dict:2.5!/org/languagetool/resource/es/es-ES.dict", sha256: dictHash },
    { path: "Morfologik 2.2.0 DictionaryLookup iterator export", sha256: sourceHash },
    { path: "spanish-pos-dict-2.5.jar", sha256: jarHash }
  ],
  license: "LGPL-2.1; derived from spanish-pos-dict 2.5. Preserve upstream notices and source availability obligations."
};
await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, "es-ES-pos.bin.gz"), compressed);
await writeFile(resolve(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(resolve(outDir, "README.md"), "# Expanded Spanish POS oracle index\n\nThis 46 MB gzip index is retained only for export verification. The extension build uses the compact Morfologik FSA in `engine-src/resources/es-ES/` instead. It derives from Softcatalà's `spanish-pos-dict:2.5` (LGPL-2.1); preserve notices and comply with its redistribution terms.\n");
await writeFile(resolve(outDir, "LICENSE-LGPL-2.1.txt"), await readFile(licensePath));
console.log(JSON.stringify({ forms: forms.length, lemmas: lemmaList.length, tags: tagList.length, readings: readings.length, sourceRows, rawBytes: raw.length, compressedBytes: compressed.length, rawSha256: manifest.rawSha256, compressedSha256: manifest.compressedSha256 }, null, 2));
