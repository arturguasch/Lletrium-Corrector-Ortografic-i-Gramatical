import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const lt = resolve(root, "analysis/reference-oracle/languagetool/languagetool-master");
const spanish = resolve(lt, "languagetool-language-modules/es/src/main/resources/org/languagetool/resource/es");
const globalPath = resolve(lt, "languagetool-core/src/main/resources/org/languagetool/resource/spelling_global.txt");
const multiwordPath = resolve(spanish, "multiwords.txt");
const sourceFiles = { "es/hunspell/spelling.txt": resolve(spanish, "hunspell/spelling.txt"), "es/hunspell/ignore.txt": resolve(spanish, "hunspell/ignore.txt"), "es/hunspell/prohibit.txt": resolve(spanish, "hunspell/prohibit.txt"), "spelling_global.txt": globalPath, "es/multiwords.txt": multiwordPath };
const sourceTexts = Object.fromEntries(await Promise.all(Object.entries(sourceFiles).map(async ([name, path]) => [name, await readFile(path, "utf8")])));
const expectedHashes = { "es/hunspell/spelling.txt": "b767c65a6f8ca830bb7bc1c7944695ff40c6d133e11f31e03e3f4ee09194bcd8", "es/hunspell/ignore.txt": "d1721c849ce8bc7287bde94954d1cb3b67575b8ff16d07923ee1c4e2a886017a", "es/hunspell/prohibit.txt": "08bcc37896c36d64e7e1b066a304c0749d01ce974a116cbb0599639738081563", "spelling_global.txt": "98198e0ecbb5e14e32cbee42a4be8b6982c3bb34311bf9ea1f5c12fab4a65634", "es/multiwords.txt": "52cee88c075bb2f23f70897ec48c0e86baf5360394d2e9a1b2ecf4aeac1dbc26" };
const sourceHashes = Object.fromEntries(Object.entries(sourceTexts).map(([name, text]) => [name, createHash("sha256").update(text).digest("hex")]));
for (const [name, expected] of Object.entries(expectedHashes)) if (sourceHashes[name] !== expected) throw new Error(`Spanish LanguageTool spelling source changed: ${name}`);
function lines(text) { return [...new Set(text.split(/\r?\n/u).map(line => line.split("#", 1)[0].trim()).filter(Boolean))]; }
const multiwords = lines(sourceTexts["es/multiwords.txt"]).map(line => line.split(/[\t;]/u)[0].trim());
const globalEntries = lines(sourceTexts["spelling_global.txt"]);
const globalEntryIndexes = new Map(globalEntries.map((value, index) => [value, -(index + 1)]));
const acceptedWords = [...new Set([...lines(sourceTexts["es/hunspell/spelling.txt"],), ...globalEntries, ...multiwords])];
const resource = {
  schemaVersion: 1,
  profile: "es-ES",
  sourceHashes,
  acceptedWordsReferenceFormat: "es-multiword-index-v1",
  // Keep the original word order: it feeds the spelling suggestion trie.
  // Negative indexes refer losslessly to the shared globalEntries table.
  acceptedWords: acceptedWords.map(value => globalEntryIndexes.get(value) ?? value),
  ignoreWords: lines(sourceTexts["es/hunspell/ignore.txt"]),
  prohibitedWords: lines(sourceTexts["es/hunspell/prohibit.txt"])
};
const out = resolve(root, "engine-src/resources/es-ES/es-spelling-data.json");
await writeFile(out, `${JSON.stringify(resource)}\n`, "utf8");
console.log(JSON.stringify({ output: out, acceptedWords: resource.acceptedWords.length, sharedReferences: resource.acceptedWords.filter(value => typeof value === "number").length, ignoredWords: resource.ignoreWords.length, prohibitedWords: resource.prohibitedWords.length, sourceHashes }, null, 2));
