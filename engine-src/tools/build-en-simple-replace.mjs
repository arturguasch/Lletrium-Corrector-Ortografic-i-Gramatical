import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourceRoot = resolve(root, "references/languagetool-en-US/languagetool-language-modules/en/src/main/resources/org/languagetool/rules/en");
const sources = [
  { profile: "en-US", family: "EN_SIMPLE_REPLACE", files: ["replace.txt", "replace_custom.txt"],
    hashes: ["0441eed8b4143cae9e9ef2cc213da65eb3c9602f1f8dd970a90ac197488083a0", "5746fe9aedececf1874ec080035c043e490c3f8cff4aa175ed0dc5007e6b27b3"] },
  { profile: "en-US", family: "EN_DIACRITICS_REPLACE_ORTHOGRAPHY", files: ["diacritics.txt"],
    hashes: ["116f50bf038c50dcdc425fb877a3b2ed3476d9afb337914f4fc13c08871a2a39"] },
  { profile: "en-US", family: "EN_US_SIMPLE_REPLACE", files: ["en-US/replace.txt"],
    hashes: ["d58b75555cf1283b6cbf80c08e41ff77e0a745abf5f6a7abdbc28e09dbbb76b9"] },
  { profile: "en-US", family: "EN_PLAIN_ENGLISH_REPLACE", files: ["wordiness.txt"],
    hashes: ["8aa69517b8aab6a8b75238ae6d95fcf46ba3c927de9e7338a2aa2fb5c3cac60a"] },
  { profile: "en-US", family: "EN_REDUNDANCY_REPLACE", files: ["redundancies.txt"],
    hashes: ["83971b92ca0be865ed3dc05c1e62328a5887472a4e1478b20535d5cdcb1dc371"] },
  { profile: "en-US", family: "PROFANITY", files: ["replace_profanity.txt"],
    hashes: ["3c4ce23d58640f39e9d9d0bc0b2e619541ecf3488b6ffbb4a9c82e3b38ba197b"] }
];
const groups = [];
for (const source of sources) {
  const entries = [];
  const sourceHashes = {};
  for (let index = 0; index < source.files.length; index++) {
    const relative = source.files[index];
    const bytes = await readFile(resolve(sourceRoot, relative));
    const hash = createHash("sha256").update(bytes).digest("hex");
    if (hash !== source.hashes[index]) throw new Error(`LanguageTool en-US replace source changed: ${relative}`);
    sourceHashes[relative] = hash;
    for (const rawLine of bytes.toString("utf8").split(/\r?\n/u)) {
      let line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      line = line.split("#", 1)[0].trim();
      if (!line) continue;
      const [pair, message = ""] = line.split("\t");
      if (source.family === "PROFANITY") {
        for (const wrong of pair.split("|")) entries.push({ wrong: wrong.toLocaleLowerCase("en-US"), replacement: [], message });
        continue;
      }
      const equals = pair.indexOf("=");
      if (equals < 1 || pair.indexOf("=", equals + 1) >= 0) throw new Error(`Invalid LanguageTool replace entry in ${relative}: ${line}`);
      const wrongForms = pair.slice(0, equals).split("|");
      const suggestions = pair.slice(equals + 1).split("|").filter(value => value !== "[OMIT]");
      if (wrongForms.some(value => !value) || suggestions.some(value => !value && source.family !== "EN_PLAIN_ENGLISH_REPLACE")) throw new Error(`Empty term in LanguageTool replace entry: ${line}`);
      for (const wrong of wrongForms) entries.push({ wrong: wrong.toLocaleLowerCase("en-US"), replacement: suggestions, message });
    }
  }
  groups.push({ family: source.family, entries, entryCount: entries.length, sourceHashes });
}

const output = { schemaVersion: 1, profile: "en-US", source: "LanguageTool 6.9-SNAPSHOT AbstractSimpleReplaceRule2",
  groups };
const outputPath = resolve(root, "engine-src/resources/en-US/en-simple-replace.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ output: "engine-src/resources/en-US/en-simple-replace.json",
  groups: groups.map(({ family, entryCount }) => ({ family, entryCount })) }));
