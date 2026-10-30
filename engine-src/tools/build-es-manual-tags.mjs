import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourceDir = resolve(root, "analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/es/src/main/resources/org/languagetool/resource/es");
const sourceHashes = {
  "added.txt": "683a17d2a9518e25675706190045198f0fbe5a07f00ab4f6f1b553254212006a",
  "removed.txt": "366590275f6a2f58da431f4ce088d871b945648030fdc4a43cabcc1be5802fb9"
};

function parseManualTagFile(source, name) {
  const entries = [];
  for (const [lineIndex, raw] of source.split(/\r?\n/u).entries()) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const fields = line.split("#", 1)[0].trim().split("\t");
    if (fields.length !== 3 || fields.some(field => !field)) {
      throw new Error(`${name}:${lineIndex + 1}: expected fullform, lemma and POS tag separated by tabs`);
    }
    entries.push({ form: fields[0], lemma: fields[1], tag: fields[2].trim() });
  }
  return entries;
}

const sources = {};
for (const name of Object.keys(sourceHashes)) {
  const bytes = await readFile(resolve(sourceDir, name));
  const actual = createHash("sha256").update(bytes).digest("hex");
  if (actual !== sourceHashes[name]) throw new Error(`Pinned LanguageTool Spanish ${name} hash mismatch: ${actual}`);
  sources[name] = parseManualTagFile(bytes.toString("utf8"), name);
}
const resource = {
  schemaVersion: 1,
  profile: "es-ES",
  source: "LanguageTool es-ES ManualTagger overlay; added.txt + removed.txt",
  sourceHashes,
  additions: sources["added.txt"],
  removals: sources["removed.txt"]
};
const out = resolve(root, "engine-src/resources/es-ES/es-manual-tags.json");
await writeFile(out, `${JSON.stringify(resource)}\n`, "utf8");
console.log(JSON.stringify({ output: out, additions: resource.additions.length, removals: resource.removals.length, bytes: Buffer.byteLength(JSON.stringify(resource)) }, null, 2));
