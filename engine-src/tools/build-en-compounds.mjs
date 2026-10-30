/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourcePath = resolve(root, "analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/en/src/main/resources/org/languagetool/resource/en/compounds.txt");
const source = await readFile(sourcePath);
const sourceSha256 = createHash("sha256").update(source).digest("hex");
if (sourceSha256 !== "be0a491fba8bf0b8c8c4d5e4b5b3f8c6cc4bef6264c69dc3a5d918691fc1657d") throw new Error(`LanguageTool en-US compounds source changed: ${sourceSha256}`);
const rows = new Map();
for (const raw of source.toString("utf8").split(/\r?\n/u)) {
  let line = raw.replace(/#.*$/u, "").trim();
  if (!line || line.startsWith("#")) continue;
  let marker = "";
  if (/[+*?$]$/u.test(line)) marker = line.at(-1), line = line.slice(0, -1);
  const form = line.replaceAll("-", " ").trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-US");
  const terms = form.split(" ");
  if (terms.length < 2 || terms.length > 5) throw new Error(`Invalid LanguageTool compound: ${raw}`);
  const flags = { allowJoined: marker !== "*", allowHyphen: marker !== "+" && marker !== "?", lowercaseJoined: marker === "?" || marker === "$" };
  const existing = rows.get(form);
  if (existing) for (const key of Object.keys(flags)) existing[key] ||= flags[key];
  else rows.set(form, { form, terms, ...flags });
}
const entries = [...rows.values()];
const output = { schemaVersion: 1, profile: "en-US", source: "LanguageTool 6.9-SNAPSHOT CompoundRuleData", sourceSha256,
  sourceEntryCount: 8908, entryCount: entries.length, entries };
if (source.toString("utf8").split(/\r?\n/u).filter(line => line.trim() && !line.startsWith("#")).length !== output.sourceEntryCount) throw new Error("The English compounds source line count changed.");
const outputPath = resolve(root, "engine-src/resources/en-US/en-compounds.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output)}\n`, "utf8");
console.log(JSON.stringify({ output: "engine-src/resources/en-US/en-compounds.json", sourceEntryCount: output.sourceEntryCount,
  entryCount: entries.length, sourceSha256 }));
