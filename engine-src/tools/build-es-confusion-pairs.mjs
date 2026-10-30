import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const root = process.cwd();
const source = resolve(root, "analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/es/src/main/resources/org/languagetool/rules/es/confusion_pairs.txt");
const output = resolve(root, "engine-src/resources/es-ES/es-confusion-pairs.json");
const expectedHash = "1fd1fe134e54961e7a6ed8272c5f99874440841298a0e33b66595705d236ef6a";
const sourceText = await readFile(source, "utf8");
const sourceSha256 = createHash("sha256").update(sourceText).digest("hex");
if (sourceSha256 !== expectedHash) throw new Error(`LanguageTool confusion-pairs source changed: ${sourceSha256}`);
const pairs = {};
for (const [lineIndex, raw] of sourceText.split(/\r?\n/u).entries()) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  const fields = line.split(";");
  if (fields.length !== 3 || fields.some(field => !field)) throw new Error(`Invalid confusion-pairs row ${lineIndex + 1}`);
  const [form, replacement, tag] = fields;
  const key = form.toLocaleLowerCase("es");
  (pairs[key] ||= []).push({ form, replacement, tag });
}
const rowCount = Object.values(pairs).reduce((sum, rows) => sum + rows.length, 0);
if (rowCount !== 1008) throw new Error(`Expected 1008 LanguageTool confusion-pairs rows; found ${rowCount}`);
const resource = { schemaVersion: 1, profile: "es-ES", sourceSha256, rowCount, pairs };
await writeFile(output, `${JSON.stringify(resource)}\n`);
console.log(JSON.stringify({ output: output.replace(`${root}\\`, ""), sourceSha256, rowCount, formCount: Object.keys(pairs).length }));
