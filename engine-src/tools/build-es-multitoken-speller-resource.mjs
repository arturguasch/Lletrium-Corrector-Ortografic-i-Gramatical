import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const lt = resolve(root, "analysis/reference-oracle/languagetool/languagetool-master");
const base = "languagetool-language-modules/es/src/main/resources/org/languagetool/resource/es";
const sources = {
  "es/multiwords.txt": resolve(lt, `${base}/multiwords.txt`),
  "spelling_global.txt": resolve(lt, "languagetool-core/src/main/resources/org/languagetool/resource/spelling_global.txt"),
  "es/hyphenated_words.txt": resolve(lt, `${base}/hyphenated_words.txt`)
};
const expected = {
  "es/multiwords.txt": "52cee88c075bb2f23f70897ec48c0e86baf5360394d2e9a1b2ecf4aeac1dbc26",
  "spelling_global.txt": "98198e0ecbb5e14e32cbee42a4be8b6982c3bb34311bf9ea1f5c12fab4a65634",
  "es/hyphenated_words.txt": "6088c25b42a82cc2cd325e43ea39999fac20da5af262cc951bad0661531317e1"
};
const entries = new Set(), sourceHashes = {};
for (const [name, path] of Object.entries(sources)) {
  const text = await readFile(path, "utf8");
  sourceHashes[name] = createHash("sha256").update(text).digest("hex");
  if (expected[name] && sourceHashes[name] !== expected[name]) throw new Error(`Unexpected LanguageTool source hash for ${name}`);
  for (const raw of text.split(/\r?\n/u)) {
    const line = raw.split("#", 1)[0].trim();
    if (!line) continue;
    if (name === "es/multiwords.txt") {
      const parts = line.split(/[\t;]/u).map(part => part.trim());
      if (parts.length === 2 && parts.every(Boolean)
          && (/^N/u.test(parts[1]) || parts[1] === "_Latin_" || parts[1] === "LOC_ADV")) entries.add(parts[0]);
    } else if (/\s/u.test(line) || name.endsWith("hyphenated_words.txt")) entries.add(line);
  }
}
const resource = { schemaVersion: 1, profile: "es-ES", sourceHashes, entries: [...entries] };
const out = resolve(root, "engine-src/resources/es-ES/es-multitoken-speller.json");
await writeFile(out, `${JSON.stringify(resource)}\n`);
console.log(JSON.stringify({ output: out, entries: entries.size, sourceHashes }, null, 2));
