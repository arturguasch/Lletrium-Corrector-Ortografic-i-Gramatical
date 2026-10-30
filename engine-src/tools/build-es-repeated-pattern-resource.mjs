/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const inventoryPath = resolve(root, "analysis/reference-oracle/outputs/spanish-repeated-pattern-inventory.json.gz");
const outputPath = resolve(root, "engine-src/resources/es-ES/es-repeated-pattern-rules.json");
const inventoryBytes = await readFile(inventoryPath);
const inventory = JSON.parse(gunzipSync(inventoryBytes).toString("utf8"));
const expectedStyleHash = "e45426d2d1070d89ca43b906a31052d11d45582f8cfd79b77abe848e24aa8abe";
if (inventory.schemaVersion !== 1 || inventory.language !== "es-ES"
    || inventory.activeRepeatedPatternGroupCount !== 13 || inventory.repeatedPatternRules?.length !== 13
    || inventory.ruleSourceHashes?.["/org/languagetool/rules/es/style.xml"] !== expectedStyleHash) {
  throw new Error("LanguageTool Spanish repeated-pattern inventory does not match the pinned style.xml snapshot.");
}
const groups = inventory.repeatedPatternRules.map(group => {
  if (!group.id || !Array.isArray(group.rules) || !group.rules.length) throw new Error("Malformed LanguageTool repeated-pattern group.");
  return {
    id: group.id,
    rules: group.rules.map(rule => {
      if (rule.id !== group.id || !Number.isInteger(rule.minPrevMatches) || rule.minPrevMatches < 1
          || !Array.isArray(rule.pattern) || !rule.pattern.length) throw new Error(`Malformed repeated PatternRule ${rule.fullId}.`);
      return rule;
    })
  };
});
const payload = {
  schemaVersion: 1,
  profile: "es-ES",
  source: "LanguageTool 6.9-SNAPSHOT RepeatedPatternRuleTransformer",
  sourceSha256: createHash("sha256").update(inventoryBytes).digest("hex"),
  styleXmlSha256: expectedStyleHash,
  groupCount: groups.length,
  ruleCount: groups.reduce((sum, group) => sum + group.rules.length, 0),
  groups
};
await writeFile(outputPath, `${JSON.stringify(payload)}\n`, "utf8");
console.log(`Built es-ES repeated PatternRules: ${payload.groupCount} groups, ${payload.ruleCount} member rules.`);
