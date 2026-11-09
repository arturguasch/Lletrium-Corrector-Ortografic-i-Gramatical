import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourcePath = resolve(root, "references/languagetool-en-US/languagetool-language-modules/en/src/main/resources/org/languagetool/rules/en/coherency.txt");
const source = await readFile(sourcePath);
const sourceSha256 = createHash("sha256").update(source).digest("hex");
if (sourceSha256 !== "7892dccc45b0470f77f4b60d27e95cd91879885f48c0eb55a3885a2a2ba08b6a") {
  throw new Error("LanguageTool English coherency source changed from the pinned snapshot.");
}
const pairs = [];
for (const raw of source.toString("utf8").split(/\r?\n/u)) {
  if (!raw || raw.startsWith("#")) continue;
  const parts = raw.split(";");
  while (parts.length > 2 && parts.at(-1) === "") parts.pop(); // Java String.split drops trailing empty fields.
  if (parts.length !== 2 || !parts[0] || !parts[1]) throw new Error(`Invalid coherency entry: ${raw}`);
  pairs.push([parts[0], parts[1]]);
}
if (pairs.length !== 2479) throw new Error(`Expected 2479 coherency pairs, got ${pairs.length}.`);
const output = { schemaVersion: 1, profile: "en-US", source: "LanguageTool 6.9-SNAPSHOT WordCoherencyRule",
  entryCount: pairs.length, sourceSha256, pairs };
const outputPath = resolve(root, "engine-src/resources/en-US/en-word-coherency.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output: "engine-src/resources/en-US/en-word-coherency.json", entryCount: pairs.length, sourceSha256 }));
