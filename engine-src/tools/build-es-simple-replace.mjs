/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourceRoot = resolve(root, "analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/es/src/main/resources/org/languagetool/rules/es");
const files = ["replace.txt", "replace_custom.txt"];
const entries = [];
const verbEntries = [];
const sources = {};
for (const name of [...files, "replace_verbs.txt"]) {
  const bytes = await readFile(resolve(sourceRoot, name));
  sources[`es/${name}`] = createHash("sha256").update(bytes).digest("hex");
  for (const [lineIndex, raw] of bytes.toString("utf8").replace(/^\uFEFF/u, "").split(/\r?\n/u).entries()) {
    if (!raw || raw.startsWith("#")) continue;
    const equals = raw.indexOf("=");
    if (equals <= 0 || equals === raw.length - 1 || raw.indexOf("=", equals + 1) >= 0) throw new Error(`Invalid LT simple-replace row ${name}:${lineIndex + 1}`);
    const wrongForms = raw.slice(0, equals).split("|");
    const suggestions = raw.slice(equals + 1).split("|");
    if (wrongForms.some(value => !value) || suggestions.some(value => !value)) throw new Error(`Empty LT simple-replace value ${name}:${lineIndex + 1}`);
    (name === "replace_verbs.txt" ? verbEntries : entries).push({ source: name, line: lineIndex + 1, wrongForms, suggestions });
  }
}
const sourceSha256 = createHash("sha256").update(JSON.stringify(sources)).digest("hex");
const output = {
  schemaVersion: 1,
  language: "es-ES",
  source: "LanguageTool 6.9-SNAPSHOT SimpleReplaceRule (LGPL-2.1-or-later)",
  sourceHashes: sources,
  sourceSha256,
  entryCount: entries.length,
  formCount: entries.reduce((sum, entry) => sum + entry.wrongForms.length, 0),
  verbEntryCount: verbEntries.length,
  verbFormCount: verbEntries.reduce((sum, entry) => sum + entry.wrongForms.length, 0),
  entries,
  verbEntries
};
await writeFile(resolve(root, "engine-src/resources/es-ES/es-simple-replace.json"), `${JSON.stringify(output)}\n`, "utf8");
console.log(JSON.stringify({ output: "engine-src/resources/es-ES/es-simple-replace.json", entries: output.entryCount, forms: output.formCount, sources, sourceSha256 }, null, 2));
