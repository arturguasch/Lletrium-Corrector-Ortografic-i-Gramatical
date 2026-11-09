import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourcePath = resolve(root, "references/languagetool-en-US/languagetool-language-modules/en/src/main/resources/org/languagetool/rules/en/synonyms.txt");
const source = await readFile(sourcePath);
const sourceSha256 = createHash("sha256").update(source).digest("hex");
if (sourceSha256 !== "1278b27a6e5462766a0608a3698a1fbf672372f27841fb9e031ec7108866a6f5") throw new Error(`LanguageTool English synonyms source changed: ${sourceSha256}`);
const entries = [];
for (const raw of source.toString("utf8").split(/\r?\n/u)) {
  const line = raw.replace(/#.*$/u, "").trim();
  if (!line) continue;
  const parts = line.split("=");
  if (parts.length === 1) {
    const synonyms = parts[0].split(";").filter(Boolean);
    for (const word of synonyms) entries.push({ word, postag: null, chunk: null, synonyms: synonyms.filter(item => item !== word) });
  } else if (parts.length === 2) {
    const [key, value] = parts;
    const [word, postag, chunk] = key.split("/");
    const synonyms = value.split(";").filter(Boolean);
    if (!word || !synonyms.length) throw new Error(`Invalid English synonym row: ${raw}`);
    entries.push({ word, postag: postag || null, chunk: chunk || null, synonyms });
  } else throw new Error(`Invalid English synonym row: ${raw}`);
}
const output = { schemaVersion: 1, profile: "en-US", source: "LanguageTool 6.9-SNAPSHOT EnglishRepeatedWordsRule",
  entryCount: entries.length, sourceSha256, entries };
const outputPath = resolve(root, "engine-src/resources/en-US/en-synonyms.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output: "engine-src/resources/en-US/en-synonyms.json", entryCount: entries.length, sourceSha256 }));
