/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourcePath = resolve(root, "analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/es/src/main/resources/org/languagetool/resource/es/compounds.txt");
const source = await readFile(sourcePath, "utf8");
const sourceSha256 = createHash("sha256").update(source).digest("hex");
const expectedSha256 = "25918e9cd40a23a5db5746b885b454cdbfc88d55797eccaadbb577c194bbc939";
if (sourceSha256 !== expectedSha256) throw new Error(`Unexpected LanguageTool Spanish compounds hash: ${sourceSha256}`);
const entries = [];
for (const [lineNumber, raw] of source.split(/\r?\n/u).entries()) {
  let line = raw.replace(/#.*$/u, "").trim();
  if (!line) continue;
  const flag = /[+*?$]$/u.test(line) ? line.at(-1) : "";
  if (flag) line = line.slice(0, -1);
  const normalized = line.replaceAll("-", " ").replace(/\s+/gu, " ").trim().toLocaleLowerCase("es");
  const terms = normalized.split(" ");
  if (terms.length < 2 || terms.length > 5) throw new Error(`Invalid compound row ${lineNumber + 1}: ${line}`);
  entries.push({ form: normalized, terms, allowJoined: flag !== "*", allowHyphen: flag !== "+" && flag !== "?", lowercaseJoined: flag === "?" || flag === "$" });
}
const resource = { schemaVersion: 1, language: "es-ES", source: "LanguageTool es/compounds.txt", sourceSha256, entryCount: entries.length, entries };
await writeFile(resolve(root, "engine-src/resources/es-ES/es-compounds.json"), `${JSON.stringify(resource)}\n`, "utf8");
console.log(JSON.stringify({ sourceSha256, entries: entries.length }));
