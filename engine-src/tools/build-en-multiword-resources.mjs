import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const englishPath = resolve(root, "analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/en/src/main/resources/org/languagetool/resource/en/multiwords.txt");
const globalPath = resolve(root, "analysis/reference-oracle/languagetool/languagetool-master/languagetool-core/src/main/resources/org/languagetool/resource/spelling_global.txt");
const outputPath = resolve(root, "engine-src/resources/en-US/en-multiwords.json");
const [englishBytes, globalBytes] = await Promise.all([readFile(englishPath), readFile(globalPath)]);
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const sourceHashes = { "en/multiwords.txt": hash(englishBytes), "spelling_global.txt": hash(globalBytes) };
if (sourceHashes["en/multiwords.txt"] !== "969a01138b389c71500606bed85f2330426a4bb8ae30c31215afc124bce6bd17"
    || sourceHashes["spelling_global.txt"] !== "98198e0ecbb5e14e32cbee42a4be8b6982c3bb34311bf9ea1f5c12fab4a65634") {
  throw new Error("Pinned LanguageTool English/global multiword sources changed.");
}

const globalEntries = [];
for (const raw of globalBytes.toString("utf8").split(/\r?\n/u)) {
  let line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  line = line.split("#", 1)[0].trim();
  if (!line) continue;
  if (line.includes("\t")) throw new Error(`Unexpected global multiword row: ${raw}`);
  globalEntries.push(line.replace(/\s+/gu, " "));
}

const englishEntries = [];
for (const raw of englishBytes.toString("utf8").split(/\r?\n/u)) {
  let line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  line = line.split("#", 1)[0].trim();
  if (!line) continue;
  const columns = line.split("\t");
  if (columns.length !== 2 || !columns[0] || !columns[1]?.trim() || /[\r\n]/u.test(columns[1])) {
    throw new Error(`Malformed English multiword row: ${raw}`);
  }
  englishEntries.push({ form: columns[0].replace(/\s+/gu, " "), tag: columns[1] });
}

const resource = { schemaVersion: 1, profile: "en-US", source: "LanguageTool 6.9-SNAPSHOT EnglishHybridDisambiguator",
  sourceHashes, counts: { globalEntries: globalEntries.length, englishEntries: englishEntries.length }, globalEntries, englishEntries };
await writeFile(outputPath, `${JSON.stringify(resource)}\n`, "utf8");
console.log(`English multiword resources: ${globalEntries.length} global and ${englishEntries.length} English entries.`);
