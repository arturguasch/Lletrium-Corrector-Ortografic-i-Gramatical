import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const source = resolve(root, "analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/en/src/main/resources/org/languagetool/resource/en");
const expectedHashes = {
  "added.txt": "ac48758904839439ff46c2b893cd7c6e80237d6a5bf073f591ab6c175835a7a2",
  "added_custom.txt": "30c7602fe9a69730e194dbe5f5b332fba6adf00f49af85d8c5358055c17d339b",
  "removed.txt": "d34555d63c6a7c97cce1e48feef71e960acd2cf003d2863460c78a3d9da75b0c",
  "removed_custom.txt": "b840a31465a40eaf6401e4262db9d9980cd81246e7ef23357cbc54bb6e8da31c"
};
const sourceHashes = {};
const entries = { additions: [], removals: [] };
for (const [name, target] of [["added.txt", "additions"], ["added_custom.txt", "additions"], ["removed.txt", "removals"], ["removed_custom.txt", "removals"]]) {
  const bytes = await readFile(resolve(source, name));
  const hash = createHash("sha256").update(bytes).digest("hex");
  if (hash !== expectedHashes[name]) throw new Error(`Pinned English ${name} hash mismatch: ${hash}`);
  sourceHashes[name] = hash;
  for (const [index, raw] of bytes.toString("utf8").split(/\r?\n/u).entries()) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const fields = line.split("#", 1)[0].trim().split("\t");
    if (fields.length !== 3 || fields.some(field => !field)) throw new Error(`${name}:${index + 1}: expected form, lemma and POS tag separated by tabs`);
    entries[target].push({ form: fields[0], lemma: fields[1], tag: fields[2] });
  }
}
const data = { schemaVersion: 1, profile: "en-US", source: "LanguageTool 6.9-SNAPSHOT English BaseTagger manual additions/removals", sourceHashes, ...entries };
const output = resolve(root, "engine-src/resources/en-US/en-manual-tags.json");
const encoded = `${JSON.stringify(data)}\n`;
await writeFile(output, encoded, "utf8");
const manifestPath = resolve(root, "engine-src/resources/en-US/manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
manifest.manualTags = { file: "en-manual-tags.json", sha256: createHash("sha256").update(encoded).digest("hex"), additions: entries.additions.length, removals: entries.removals.length, sourceHashes };
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output, additions: entries.additions.length, removals: entries.removals.length, sourceHashes }, null, 2));
