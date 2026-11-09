import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourcePath = resolve(root, "references/languagetool-en-US/languagetool-language-modules/en/src/main/resources/org/languagetool/rules/en/wrongWordInContext.txt");
const source = await readFile(sourcePath);
const sourceSha256 = createHash("sha256").update(source).digest("hex");
if (sourceSha256 !== "784ac0287d6a31cb142cb6c12de25b700099c3b4ecc02be4231ef0e278b5e87d") throw new Error(`LanguageTool wrongWordInContext source changed: ${sourceSha256}`);
const entries = source.toString("utf8").split(/\r?\n/u).filter(line => line.trim() && !line.startsWith("#")).map(line => {
  const [word1, word2, match1, match2, context1, context2, explanation1 = "", explanation2 = ""] = line.split("\t");
  if (![word1, word2, match1, match2, context1, context2].every(Boolean)) throw new Error(`Invalid wrong-word row: ${line}`);
  return { word1, word2, match1, match2, context1, context2, explanation1, explanation2 };
});
if (entries.length !== 11) throw new Error(`Expected 11 English wrong-word entries, found ${entries.length}.`);
const output = { schemaVersion: 1, profile: "en-US", source: "LanguageTool 6.9-SNAPSHOT EnglishWrongWordInContextRule",
  sourceSha256, entryCount: entries.length, entries };
const outputPath = resolve(root, "engine-src/resources/en-US/en-wrong-word-context.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output: "engine-src/resources/en-US/en-wrong-word-context.json", entryCount: entries.length, sourceSha256 }));
