/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourcePath = resolve(root, "analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/en/src/main/resources/org/languagetool/resource/en/compounds.txt");
const bytes = await readFile(sourcePath);
const sourceSha256 = createHash("sha256").update(bytes).digest("hex");
if (sourceSha256 !== "be0a491fba8bf0b8c8c4d5e4b5b3f8c6cc4bef6264c69dc3a5d918691fc1657d") throw new Error("Pinned LanguageTool en compounds.txt changed; audit dash-rule semantics before rebuilding.");
const entries = [];
for (let line of bytes.toString("utf8").split(/\r?\n/u)) {
  line = line.trim();
  if (!line || line.startsWith("#")) continue;
  line = line.split(/\s+/u, 1)[0]; // The source contains trailing editorial notes after some active entries.
  if (/[+?]$/u.test(line)) continue;
  if (/[*$]$/u.test(line)) line = line.slice(0, -1);
  if (!line.includes("-") || /\s/u.test(line)) throw new Error(`Unexpected English dash compound: ${line}`);
  entries.push(line.toLocaleLowerCase("en-US"));
}
const unique = [...new Set(entries)].sort();
if (unique.length < 5000) throw new Error(`Incomplete en dash compounds table: ${unique.length}`);
const output = { schemaVersion: 1, profile: "en-US", source: "LanguageTool 6.9-SNAPSHOT AbstractDashRule", sourceSha256, count: unique.length, compounds: unique };
const outputPath = resolve(root, "engine-src/resources/en-US/en-dash-compounds.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output)}\n`);
console.log(JSON.stringify({ output: "engine-src/resources/en-US/en-dash-compounds.json", compounds: unique.length, sourceSha256 }));
