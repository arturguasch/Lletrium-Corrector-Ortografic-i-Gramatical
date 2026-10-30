/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const sourcePath = resolve(root, "analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/en/src/main/java/org/languagetool/rules/en/AdverbFilter.java");
const outputPath = resolve(root, "engine-src/resources/en-US-adverb-to-adjective.json");
const source = await readFile(sourcePath, "utf8");
const sourceSha256 = createHash("sha256").update(source).digest("hex");
const uncommented = source.replace(/\/\*[\s\S]*?\*\//gu, "").replace(/^\s*\/\/.*$/gmu, "");
const entries = new Map();
for (const [, adverb, adjective] of uncommented.matchAll(/put\("([^"\\]*)",\s*"([^"\\]*)"\)/gu)) {
  if (adverb) entries.set(adverb, adjective);
}
if (entries.size < 300 || !entries.has("well") || entries.get("well") !== "good" || entries.get("simply") !== "simple") {
  throw new Error(`Unexpected LanguageTool AdverbFilter source shape (${entries.size} entries).`);
}
const resource = {
  schemaVersion: 1,
  profile: "en-US",
  source: "LanguageTool 6.9-SNAPSHOT en.AdverbFilter.java",
  sourceSha256,
  count: entries.size,
  mappings: Object.fromEntries(entries)
};
await writeFile(outputPath, `${JSON.stringify(resource)}\n`, "utf8");
console.log(JSON.stringify({ output: "engine-src/resources/en-US-adverb-to-adjective.json", count: entries.size, sourceSha256 }));
