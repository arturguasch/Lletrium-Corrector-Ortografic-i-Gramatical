import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourcePath = resolve(root, "references/languagetool-en-US/languagetool-language-modules/en/src/main/resources/org/languagetool/resource/en/specific_case.txt");
const outputPath = resolve(root, "engine-src/resources/en-US/en-specific-case.json");
const source = await readFile(sourcePath);
const entries = source.toString("utf8").split(/\r?\n/u)
  .map(line => line.trim()).filter(line => line && !line.startsWith("#"));
const sourceSha256 = createHash("sha256").update(source).digest("hex");
if (entries.length !== 5540 || sourceSha256 !== "aa82462f1dcdee4afa873e818911aab45b88f8edda0b830b295b3c416cfce53f") {
  throw new Error("LanguageTool en specific_case.txt changed; review it before updating the pin.");
}
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({ schemaVersion: 1, profile: "en-US",
  source: "LanguageTool 6.9-SNAPSHOT EnglishSpecificCaseRule", sourceSha256,
  entryCount: entries.length, entries }, null, 2)}\n`);
console.log(JSON.stringify({ output: "engine-src/resources/en-US/en-specific-case.json", entries: entries.length, sourceSha256 }));
