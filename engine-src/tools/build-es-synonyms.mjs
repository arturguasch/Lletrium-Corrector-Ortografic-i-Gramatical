import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const source = resolve(root, "references/languagetool-es-ES/languagetool-language-modules/es/src/main/resources/org/languagetool/rules/es/synonyms.txt");
const output = resolve(root, "engine-src/resources/es-ES/es-synonyms.json");
const expectedHash = "9d5201f80c303bde34ef956c5211c58163fce247db15f5d3dd8051cd12aeaba8";
const sourceText = await readFile(source, "utf8");
const sourceSha256 = createHash("sha256").update(sourceText).digest("hex");
if (sourceSha256 !== expectedHash) throw new Error(`Spanish synonym source hash changed: ${sourceSha256}`);

const entries = [];
const seen = new Set();
const add = (word, synonyms, postag = null, chunk = null) => {
  if (!word || !synonyms.length) throw new Error(`Empty Spanish synonym entry: ${word}`);
  if (seen.has(word)) throw new Error(`Duplicate Spanish synonym key in LanguageTool source: ${word}`);
  seen.add(word);
  entries.push({ word, synonyms, ...(postag ? { postag } : {}), ...(chunk ? { chunk } : {}) });
};

for (const [lineNumber, rawLine] of sourceText.split(/\r?\n/u).entries()) {
  const line = rawLine.replace(/#.*$/u, "").trim();
  if (!line) continue;
  const parts = line.split("=");
  if (parts.length > 2) throw new Error(`Unexpected '=' in synonyms.txt line ${lineNumber + 1}`);
  if (parts.length === 2) {
    const [rawWord, rawSynonyms] = parts;
    const [word, postag, chunk] = rawWord.trim().split("/");
    add(word, rawSynonyms.split(";").map(value => value.trim()).filter(Boolean), postag || null, chunk || null);
  } else {
    const group = line.split(";").map(value => value.trim()).filter(Boolean);
    if (group.length < 2) throw new Error(`Invalid synonym group on line ${lineNumber + 1}`);
    for (const word of group) add(word, group.filter(value => value !== word));
  }
}

if (entries.length !== 24) throw new Error(`Expected 24 active es-ES synonym entries, found ${entries.length}`);
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify({ schemaVersion: 1, language: "es-ES", sourceSha256, entryCount: entries.length, entries }, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output, sourceSha256, entries: entries.length }));
