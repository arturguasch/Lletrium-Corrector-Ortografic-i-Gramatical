/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const lt = resolve(root, "analysis/reference-oracle/languagetool/languagetool-master");
const spanishDir = resolve(lt, "languagetool-language-modules/es/src/main/resources/org/languagetool/resource/es");
const multiwordsPath = resolve(spanishDir, "multiwords.txt");
const globalPath = resolve(lt, "languagetool-core/src/main/resources/org/languagetool/resource/spelling_global.txt");
const multiwordsText = await readFile(multiwordsPath, "utf8"), globalText = await readFile(globalPath, "utf8");
const multiwords = [], globalEntries = [];
for (const raw of multiwordsText.split(/\r?\n/u)) {
  const line = raw.split("#", 1)[0].trim();
  if (!line) continue;
  const parts = line.split(/[\t;]/u).map(value => value.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) throw new Error(`Malformed Spanish multiword row: ${raw}`);
  multiwords.push([parts[0], parts[1]]);
}
for (const raw of globalText.split(/\r?\n/u)) {
  const phrase = raw.split("#", 1)[0].trim();
  // LanguageTool's SpanishHybridDisambiguator applies the global chunker to
  // both single-token proper-name entries and multiword names. Keeping only
  // phrases breaks the NP reading that Spanish PatternRules use to distinguish
  // unknown names (e.g. Yuval) from misspelled words.
  if (phrase) globalEntries.push(phrase);
}
const manifest = {
  schema: 1,
  profile: "es-ES",
  multiwords,
  globalEntries,
  sourceHashes: {
    "es/multiwords.txt": createHash("sha256").update(multiwordsText).digest("hex"),
    "spelling_global.txt": createHash("sha256").update(globalText).digest("hex")
  },
  behavior: {
    spanish: { allowFirstCapitalized: true, allowAllUppercase: true, allowTitlecase: false },
    global: { allowFirstCapitalized: false, allowAllUppercase: true, allowTitlecase: false, defaultTag: "NPCN000" },
    maxTokens: 20,
    maxMatchesPerStart: "all; prefer longest span during resolution"
  }
};
const out = resolve(root, "engine-src/resources/es-ES/es-multiword.json");
await writeFile(out, `${JSON.stringify(manifest)}\n`);
console.log(JSON.stringify({ output: out, SpanishEntries: multiwords.length, globalEntries: globalEntries.length, sourceHashes: manifest.sourceHashes }, null, 2));
