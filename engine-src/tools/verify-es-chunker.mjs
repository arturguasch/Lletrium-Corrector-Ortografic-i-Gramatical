/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
vm.runInThisContext(await readFile(resolve(root, "engine-src/modules/es-chunker.js"), "utf8"));
const resource = JSON.parse(await readFile(resolve(root, "engine-src/resources/es-ES/es-multiword.json"), "utf8"));
const chunker = new globalThis.CorrectorSpanishChunker(resource);
const tokens = "a pesar de New York EE. UU.".split(/(\s+)/u).filter(Boolean).map((text, index) => ({ text, kind: /^\s+$/u.test(text) ? "space" : "word", start: index, end: index + text.length }));
const result = chunker.disambiguate(tokens);
console.log(JSON.stringify({ ...chunker.counts, selectedMatches: result.selectedMatches, matches: result.matches.map(({ phrase, lemma, tag, kind }) => ({ phrase, lemma, tag, kind })) }, null, 2));
if (!result.selectedMatches) throw new Error("Spanish chunker did not match any known phrase in its smoke sample.");
