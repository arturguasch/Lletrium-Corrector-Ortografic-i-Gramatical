import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const input = resolve(process.argv[2] || resolve(root, "analysis/reference-oracle/artifacts/catalan-pos-dict-3.3/ca-ES-fsa-entries.tsv"));
const outDir = resolve(process.argv[3] || resolve(root, "engine-src/resources/central"));
const tsv = await readFile(input, "utf8");
const expectedExportSha256 = "354404658743c78a15ae61fffdf468217174c617456a0518e36e74413e3f3482";
const actualExportSha256 = createHash("sha256").update(tsv).digest("hex");
if (actualExportSha256 !== expectedExportSha256) throw new Error(`FSA export hash mismatch: ${actualExportSha256}`);
const byForm = new Map();
const lemmas = new Set();
const tags = new Set();
let sourceRows = 0;
for (const line of tsv.split(/\r?\n/u)) {
  if (!line) continue;
  const first = line.indexOf("\t");
  const second = line.indexOf("\t", first + 1);
  if (first <= 0 || second <= first + 1 || line.indexOf("\t", second + 1) !== -1) throw new Error(`Malformed Morfologik TSV row ${sourceRows + 1}`);
  const form = line.slice(0, first);
  const lemma = line.slice(first + 1, second);
  const tag = line.slice(second + 1);
  if (!lemma || !tag) throw new Error(`Empty lemma/tag at TSV row ${sourceRows + 1}`);
  let readings = byForm.get(form);
  if (!readings) byForm.set(form, readings = []);
  readings.push([lemma, tag]);
  lemmas.add(lemma);
  tags.add(tag);
  sourceRows++;
}
if (sourceRows !== 1350513) throw new Error(`Unexpected number of FSA entries: ${sourceRows}`);

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

const formTable = stringTable(forms);
const lemmaTable = stringTable(lemmaList);
const tagTable = stringTable(tagList);
const formReadingOffsets = Buffer.alloc((forms.length + 1) * 4);
const lemmaReadingOffsets = Buffer.alloc((lemmaList.length + 1) * 4);
const readings = [];
const lemmaReadingIds = Array.from({ length: lemmaList.length }, () => []);
for (let formIndex = 0; formIndex < forms.length; formIndex++) {
  formReadingOffsets.writeUInt32LE(readings.length, formIndex * 4);
  const unique = new Map();
  for (const [lemma, tag] of byForm.get(forms[formIndex])) unique.set(`${lemma}\0${tag}`, [lemma, tag]);
  // DictionaryLookup order is the tagger's reading order in LanguageTool.
  // Preserve source insertion order per form; sorting by lemma/tag changes which
  // reading downstream stages see first, despite leaving the reading set intact.
  const rows = [...unique.values()];
  for (const [lemma, tag] of rows) {
    const readingId = readings.length;
    const lemmaId = lemmaIds.get(lemma);
    readings.push([lemmaId, tagIds.get(tag)]);
    lemmaReadingIds[lemmaId].push(readingId);
  }
}
formReadingOffsets.writeUInt32LE(readings.length, forms.length * 4);
let reverseOffset = 0;
for (let lemmaIndex = 0; lemmaIndex < lemmaList.length; lemmaIndex++) {
  lemmaReadingOffsets.writeUInt32LE(reverseOffset, lemmaIndex * 4);
  reverseOffset += lemmaReadingIds[lemmaIndex].length;
}
lemmaReadingOffsets.writeUInt32LE(readings.length, lemmaList.length * 4);
const lemmaReadingBuffer = Buffer.alloc(readings.length * 4);
let reverseIndex = 0;
for (const rows of lemmaReadingIds) for (const readingId of rows) lemmaReadingBuffer.writeUInt32LE(readingId, reverseIndex++ * 4);

const readingsBuffer = Buffer.alloc(readings.length * 8);
for (let index = 0; index < readings.length; index++) {
  readingsBuffer.writeUInt32LE(readings[index][0], index * 8);
  readingsBuffer.writeUInt32LE(readings[index][1], index * 8 + 4);
}
const sections = [
  ["formsOffsets", formTable.offsets, "u32", forms.length + 1],
  ["formsBytes", formTable.bytes, "bytes", formTable.bytes.length],
  ["lemmasOffsets", lemmaTable.offsets, "u32", lemmaList.length + 1],
  ["lemmasBytes", lemmaTable.bytes, "bytes", lemmaTable.bytes.length],
  ["tagsOffsets", tagTable.offsets, "u32", tagList.length + 1],
  ["tagsBytes", tagTable.bytes, "bytes", tagTable.bytes.length],
  ["formReadingOffsets", formReadingOffsets, "u32", forms.length + 1],
  ["readings", readingsBuffer, "u32", readings.length * 2],
  ["lemmaReadingOffsets", lemmaReadingOffsets, "u32", lemmaList.length + 1],
  ["lemmaReadingIds", lemmaReadingBuffer, "u32", readings.length]
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
const tsvSha256 = actualExportSha256;
const rawSha256 = createHash("sha256").update(raw).digest("hex");
const compressedSha256 = createHash("sha256").update(compressed).digest("hex");
const manifest = {
  schema: 1,
  format: "CACPOS1",
  profile: "ca-ES-fsa-3.3; ca central filtering at runtime",
  dataFile: "ca-central.bin.gz",
  rawBytes: raw.length,
  compressedBytes: compressed.length,
  rawSha256,
  compressedSha256,
  counts: { forms: forms.length, lemmas: lemmaList.length, tags: tagList.length, readings: readings.length, sourceRows, duplicateReadingsRemoved: sourceRows - readings.length },
  sections: sectionManifest,
  sources: [
    { path: "org.softcatala:catalan-pos-dict:3.3!/org/languagetool/resource/ca/ca-ES.dict", sha256: "7c0b26c77dd844d06a77c013c199419f330387d924eade178d1dd2027c2afa3b" },
    { path: "org.softcatala:catalan-pos-dict:3.3!/org/languagetool/resource/ca/ca-ES.info", sha256: "e663a6b7a69064555a3121fa7fe1479db0d7d283687d48a7ac2ecd5021526efc" },
    { path: "org.softcatala:catalan-pos-dict:3.3!/org/languagetool/resource/ca/ca-ES_tags.txt", sha256: "7f865a4d6c77c1b8788f46d60e8f9fef0eb0357f1b21dca6b11cbbab6a15e9a7" },
    { path: "Morfologik 2.2.0 DictionaryLookup iterator export", sha256: tsvSha256 }
  ],
  sourceJar: { file: "catalan-pos-dict-3.3.jar", sha256: "e5f32aadd1852e8e442810611d89906c06369a94d2a62c1a142eb3e8f5bda2f1" },
  centralProfilePolicy: "Preserve all FSA entries in storage; CatalanTagger ca-ES removes readings whose POS tag begins with 0 during tagging.",
  license: "GPL-2.0 OR LGPL-2.1 as declared by catalan-pos-dict 3.3; preserve upstream notices."
};
await writeFile(resolve(outDir, "ca-central.bin.gz"), compressed);
await writeFile(resolve(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ forms: forms.length, lemmas: lemmaList.length, tags: tagList.length, readings: readings.length, sourceRows, rawBytes: raw.length, compressedBytes: compressed.length, rawSha256, compressedSha256 }, null, 2));
