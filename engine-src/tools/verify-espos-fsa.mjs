/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const resources = resolve(root, "engine-src/resources/es-ES");
vm.runInThisContext(await readFile(resolve(root, "engine-src/modules/es-morphology.js"), "utf8"));
const manifest = JSON.parse(await readFile(resolve(resources, "manifest.json"), "utf8"));
const graph = gunzipSync(await readFile(resolve(resources, manifest.dataFile)));
const morphology = new globalThis.CorrectorSpanishMorphology(graph.buffer.slice(graph.byteOffset, graph.byteOffset + graph.byteLength), manifest);
const corpus = resolve(root, "analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/es-ES-tagged-entries.tsv");
const fixtureForms = ["casa", "casas", "habían", "rápidamente", "dámelo", "España", "español", "quien", "aún", "pingüino", "construcción", "ley", "leyes", "fácil", "fáciles", "cantábamos", "cantasteis", "dijéramos", "socioeconómico", "Madrid"];
const sampledForms = new Set(fixtureForms);
let distinctForms = 0, previousForm = "";
for await (const line of createInterface({ input: createReadStream(corpus), crlfDelay: Infinity })) {
  if (!line) continue;
  const form = line.slice(0, line.indexOf("\t"));
  if (form === previousForm) continue;
  previousForm = form;
  if (distinctForms++ % 1000 === 0) sampledForms.add(form);
}
const expected = new Map([...sampledForms].map(form => [form, []]));
for await (const line of createInterface({ input: createReadStream(corpus), crlfDelay: Infinity })) {
  if (!line) continue;
  const first = line.indexOf("\t"), second = line.indexOf("\t", first + 1), form = line.slice(0, first), readings = expected.get(form);
  if (readings) readings.push(`${line.slice(first + 1, second)}\t${line.slice(second + 1)}`);
}
const failures = [];
for (const form of sampledForms) {
  const want = expected.get(form) || [], got = morphology.lookup(form, { lowercaseFallback: false }).map(item => `${item.lemma}\t${item.tag}`);
  if (JSON.stringify(got) !== JSON.stringify(want)) failures.push({ form, expected: want, actual: got });
}
if (failures.length) throw new Error(`Spanish compact FSA lookup differs from Morfologik DictionaryLookup: ${JSON.stringify(failures)}`);
console.log(JSON.stringify({ checked: sampledForms.size, passed: sampledForms.size - failures.length, upstreamUniqueForms: distinctForms, oracle: "Morfologik DictionaryLookup TSV", ...morphology.getStats() }, null, 2));
