/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getDisambiguationRuleBlockers } from "./disambiguation-rule-gate.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const inventoryPath = resolve(root, "analysis/reference-oracle/outputs/spanish-disambiguation-rules.json");
const englishTagsPath = resolve(root, "analysis/reference-oracle/outputs/english-wordtags.tsv");
const xmlPath = resolve(root, "analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/es/src/main/resources/org/languagetool/resource/es/disambiguation.xml");
const inventoryText = await readFile(inventoryPath, "utf8"), xmlText = await readFile(xmlPath, "utf8");
const englishTagsText = await readFile(englishTagsPath, "utf8");
const inventoryHash = createHash("sha256").update(inventoryText).digest("hex");
const xmlHash = createHash("sha256").update(xmlText).digest("hex");
const englishTagsHash = createHash("sha256").update(englishTagsText).digest("hex");
if (englishTagsHash !== "44222a02ee55f5e6796cce8cdd8ba83d89fcda199ffa510f89affa5860e654fa") {
  throw new Error("English POS tag snapshot differs from the reviewed LanguageTool resource.");
}
if (inventoryHash !== "a997ec038fb422f9502886be4c792542010d83e6bf28e82408bab23503949f54"
    || xmlHash !== "d2caa2b8613c0d6b0274586595064361845b34b03971770c803e39838ae77602") {
  throw new Error("Spanish LanguageTool disambiguation sources differ from the reviewed snapshot.");
}
const inventory = JSON.parse(inventoryText), definitions = {};
for (const [, feature, body] of xmlText.matchAll(/<unification\s+feature="([^"]+)"[^>]*>([\s\S]*?)<\/unification>/gu)) {
  if (definitions[feature]) throw new Error(`Duplicate Spanish unification feature: ${feature}`);
  const equivalences = {};
  for (const [, type, equivalenceBody] of body.matchAll(/<equivalence\s+type="([^"]+)"[^>]*>([\s\S]*?)<\/equivalence>/gu)) {
    const tokens = [...equivalenceBody.matchAll(/<token\b([^>]*)\/?\s*>/gu)];
    if (tokens.length !== 1) throw new Error(`Unsupported Spanish equivalence: ${feature}/${type}`);
    const attrs = Object.fromEntries([...tokens[0][1].matchAll(/([\w-]+)="([^"]*)"/gu)].map(([, name, value]) => [name, value]));
    if (attrs.postag_regexp !== "yes" || !attrs.postag || Object.keys(attrs).some(name => !["postag", "postag_regexp"].includes(name))) throw new Error(`Unsupported Spanish equivalence token: ${feature}/${type}`);
    equivalences[type] = attrs.postag;
  }
  if (!Object.keys(equivalences).length) throw new Error(`Empty Spanish unification feature: ${feature}`);
  definitions[feature] = equivalences;
}
const supported = inventory.rules.filter(rule => getDisambiguationRuleBlockers(rule).length === 0);
const filteredCounts = {};
for (const rule of inventory.rules) {
  const blockers = getDisambiguationRuleBlockers(rule);
  for (const blocker of blockers) filteredCounts[blocker] = (filteredCounts[blocker] || 0) + 1;
}
const resource = {
  schemaVersion: 1,
  language: "es-ES",
  source: inventory.resource,
  sourceSha256: inventoryHash,
  sourceXmlSha256: xmlHash,
  englishWordTagsSource: "LanguageTool EnglishTagger / english-pos-dict 0.6",
  englishWordTagsSha256: englishTagsHash,
  englishWordTags: Object.fromEntries(englishTagsText.trimEnd().split("\n").map(line => {
    const [word, tags] = line.split("\t");
    if (!/^[A-Za-z]+(?:'[A-Za-z]+)?$/u.test(word) || !tags || !tags.split("|").every(tag => /^[A-Za-z0-9_:$]+$/u.test(tag))) {
      throw new Error(`Invalid English POS dictionary row: ${word}`);
    }
    return [word, tags.split("|")];
  })),
  unificationDefinitions: definitions,
  upstreamRuleCount: inventory.ruleCount,
  supportedRuleCount: supported.length,
  excludedRuleCount: inventory.ruleCount - supported.length,
  exclusionCounts: filteredCounts,
  rules: supported
};
const out = resolve(root, "engine-src/resources/es-ES/es-disambiguation-rules.json");
await writeFile(out, `${JSON.stringify(resource)}\n`, "utf8");
console.log(JSON.stringify({ output: out, upstreamRules: inventory.ruleCount, supportedRules: supported.length, excludedRules: resource.excludedRuleCount, englishPosEntries: Object.keys(resource.englishWordTags).length, unificationFeatures: Object.keys(definitions), exclusionCounts: filteredCounts }, null, 2));
