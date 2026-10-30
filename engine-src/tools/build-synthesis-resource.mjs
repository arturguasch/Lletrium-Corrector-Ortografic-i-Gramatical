/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../", import.meta.url));
const hash = value => createHash("sha256").update(value).digest("hex");
const fsadir = "analysis/reference-oracle/artifacts/catalan-pos-dict-3.3/";
const resourceDir = "references/languagetool-ca-central/src/main/resources/org/languagetool/resource/ca/";
const sorosSource = await readFile(root + resourceDir + "ca.sor", "utf8");
const sorosOracle = await readFile(root + "analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/ca/src/main/resources/org/languagetool/resource/ca/ca.sor", "utf8");
if (sorosSource !== sorosOracle) throw new Error("Catalan Soros source differs from the locked LanguageTool snapshot.");
const romanSorosSource = await readFile(root + "analysis/reference-oracle/languagetool/languagetool-master/languagetool-core/src/main/resources/org/languagetool/resource/Roman.sor", "utf8");
const romanSorosHash = hash(romanSorosSource);
if (romanSorosHash !== "11002fdb8c7039c1a71a5ba8f3a2b405548e993f8668066363d6e1fea58ca4b1") throw new Error(`Unexpected LanguageTool Roman.sor source: ${romanSorosHash}`);
const text = await readFile(root + fsadir + "ca-ES-synth-entries.tsv", "utf8");
const mapping = new Map();
let rows = 0;
for (const line of text.split("\n")) {
  if (!line) continue;
  const [key, form] = line.split("\t");
  if (!key || form == null) throw new Error("Invalid exported synthesis row.");
  const forms = mapping.get(key) || []; forms.push(form); mapping.set(key, forms); rows++;
}
if (rows !== 1350376) throw new Error("Unexpected synthesis FSA size.");
const sourceHashes = { export: hash(text), caSoros: hash(sorosSource), romanSoros: romanSorosHash };
const tagExport = await readFile(root + fsadir + "ca-ES-synthesis-tags.json", "utf8");
const possibleTags = JSON.parse(tagExport).possibleTags;
sourceHashes.possibleTags = hash(tagExport);
for (const [name, remove] of [["added.txt", false], ["removed.txt", true], ["do-not-synthesize.txt", true]]) {
  const contents = await readFile(root + resourceDir + name, "utf8"); sourceHashes[name] = hash(contents);
  for (const line of contents.split(/\r?\n/u)) {
    if (!line.trim() || line.startsWith("#")) continue;
    const [form, lemma, tag] = line.trim().split("\t");
    if (tag == null) throw new Error(`Invalid manual synthesis row: ${name}`);
    const key = `${lemma}|${tag}`;
    const forms = mapping.get(key) || [];
    if (remove) mapping.set(key, forms.filter(value=>value!==form));
    else { forms.push(form); mapping.set(key, forms); if (!possibleTags.includes(tag)) throw new Error("Missing exported synthesis tag: "+tag); }
  }
}
const keys = [...mapping.keys()].filter(key=>mapping.get(key).length).sort();
const keyBuffers = keys.map(key=>Buffer.from(key));
const formBuffers = keys.map(key=>Buffer.from(mapping.get(key).join("\n")));
const keysBytes = Buffer.concat(keyBuffers), formsBytes = Buffer.concat(formBuffers);
const header = Buffer.alloc(20 + (keys.length + 1) * 8);
header.write("CACSYNT1"); header.writeUInt32LE(keys.length, 8); header.writeUInt32LE(keysBytes.length, 12); header.writeUInt32LE(formsBytes.length, 16);
let keyOffset=0, formOffset=0;
for (let i=0;i<=keys.length;i++) {
  header.writeUInt32LE(keyOffset,20+i*4); header.writeUInt32LE(formOffset,20+(keys.length+1)*4+i*4);
  if(i<keys.length){keyOffset+=keyBuffers[i].length;formOffset+=formBuffers[i].length;}
}
const raw = Buffer.concat([header,keysBytes,formsBytes]);
await mkdir(root + "engine-src/resources/synthesis", {recursive:true});
await writeFile(root+"engine-src/resources/synthesis/ca.sor", sorosSource, "utf8");
await writeFile(root+"engine-src/resources/synthesis/Roman.sor", romanSorosSource, "utf8");
await writeFile(root+"engine-src/resources/synthesis/ca-synthesis.bin.gz",gzipSync(raw,{level:9}));
await writeFile(root+"engine-src/resources/synthesis/manifest.json",JSON.stringify({schemaVersion:1,language:"ca-ES",format:"CACSYNT1",rows,keys:keys.length,rawBytes:raw.length,rawSha256:hash(raw),sourceHashes,possibleTags},null,2));
console.log(JSON.stringify({rows,keys:keys.length,rawBytes:raw.length,sourceHashes}));
