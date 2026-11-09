import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourcePath = resolve(root, "references/languagetool-es-ES/languagetool-language-modules/es/src/main/resources/org/languagetool/rules/es/wrongWordInContext.txt");
const source = await readFile(sourcePath, "utf8");
const sourceSha256 = createHash("sha256").update(source).digest("hex");
const expectedSha256 = "0f0472a6364601e60825088ac73cb4959500a26ce5b3fdf0185f21d1d873a7a5";
if (sourceSha256 !== expectedSha256) throw new Error(`Unexpected LanguageTool wrongWordInContext.txt hash: ${sourceSha256}`);
const entries = [];
for (const [lineNumber, raw] of source.split(/\r?\n/u).entries()) {
  if (!raw.trim() || raw.startsWith("#")) continue;
  const columns = raw.split("\t");
  if (columns.length < 6 || columns.length > 8) throw new Error(`Unsupported wrong-word context row ${lineNumber + 1}`);
  entries.push({ words: columns.slice(0, 2), replacements: columns.slice(2, 4), contexts: columns.slice(4, 6), explanations: [columns[6] || "", columns[7] || ""] });
}
const resource = { schemaVersion: 1, language: "es-ES", source: "LanguageTool es/wrongWordInContext.txt", sourceSha256, entryCount: entries.length, entries };
await writeFile(resolve(root, "engine-src/resources/es-ES/es-wrong-word-context.json"), `${JSON.stringify(resource)}\n`, "utf8");
console.log(JSON.stringify({ sourceSha256, entries: entries.length }));
