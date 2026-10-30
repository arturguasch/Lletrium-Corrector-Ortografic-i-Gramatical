/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
for (const name of ["es-morphology.js", "es-spelling.js"]) vm.runInThisContext(await readFile(resolve(root, "engine-src/modules", name), "utf8"));
const resourceDir = resolve(root, "engine-src/resources/es-ES"), manifest = JSON.parse(await readFile(resolve(resourceDir, "manifest.json"), "utf8"));
const bytes = gunzipSync(await readFile(resolve(resourceDir, manifest.dataFile)));
const morphology = new globalThis.CorrectorSpanishMorphology(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), manifest);
const spelling = globalThis.CorrectorSpanishSpelling;
const spellingData = spelling.createDataIndex(JSON.parse(await readFile(resolve(resourceDir, "es-spelling-data.json"), "utf8")));
const known = ["casa", "rápida", "hablar", "España", "rápidamente", "Ahmedabad", "inbound"].filter(word => spelling.isMisspelled(word, morphology, { spellData: spellingData }));
const misspellings = ["cassa", "hablarr", "rápidaa", "mispeling", "aquél"].filter(word => !spelling.isMisspelled(word, morphology, { spellData: spellingData }));
const suggestions = Object.fromEntries(["cassa", "hablarr", "rápidaa", "ke", "biba"].map(word => [word, spelling.suggest(word, morphology, { spellData: spellingData })]));
const equivalentPairs = [["b", "v"], ["i", "y"], ["g", "j"]];
const equivalentPairFailures = equivalentPairs.filter(([left, right]) => !morphology.areEquivalentSuggestionChars(left, right));
const okay = !known.length && !misspellings.length && !equivalentPairFailures.length
  && suggestions.cassa.includes("casa") && suggestions.hablarr.includes("hablar") && suggestions.ke.includes("que");
console.log(JSON.stringify({ knownIncorrectlyFlagged: known, misspellingsMissed: misspellings, additionalAcceptedWords: spellingData.accepted.size, ignoredWords: spellingData.ignored.size, prohibitedWords: spellingData.prohibited.size, equivalentPairFailures, suggestions, okay }, null, 2));
if (!okay) throw new Error("Spanish spelling smoke verification failed.");
