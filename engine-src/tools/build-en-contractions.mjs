import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const relative = "references/languagetool-en-US/languagetool-language-modules/en/src/main/resources/org/languagetool/rules/en/contractions.txt";
const bytes = await readFile(resolve(root, relative));
const sourceSha256 = createHash("sha256").update(bytes).digest("hex");
if (sourceSha256 !== "8244e543b9743c5e53b830c3e788a7b50098960c73011c0252ee1cda79daebe0") {
  throw new Error("LanguageTool English contraction source changed from the pinned snapshot.");
}
const entries = new Map();
for (const raw of bytes.toString("utf8").split(/\r?\n/u)) {
  if (!raw || raw.startsWith("#")) continue;
  const parts = raw.split("=");
  if (parts.length !== 2 || !parts[0] || !parts[1]) throw new Error(`Invalid contraction replacement: ${raw}`);
  entries.set(parts[0], parts[1].split("|"));
}
if (entries.size !== 179) throw new Error(`Expected 179 contraction forms, got ${entries.size}.`);
const output = { schemaVersion: 1, profile: "en-US", source: "LanguageTool 6.9-SNAPSHOT ContractionSpellingRule",
  sourceSha256, entryCount: entries.size, entries: [...entries].map(([wrong, replacements]) => ({ wrong, replacements })) };
const outputPath = resolve(root, "engine-src/resources/en-US/en-contractions.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output: "engine-src/resources/en-US/en-contractions.json", entryCount: entries.size, sourceSha256 }));
