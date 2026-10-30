import { readFile, writeFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourceRoot = resolve(root, "analysis/reference-oracle/outputs");
const basePath = resolve(sourceRoot, "ca-pattern-rule-candidates.json");
const baseText = await readFile(basePath, "utf8");
const base = JSON.parse(baseText);
const baseById = new Map(base.rules.map(rule => [rule.fullId, rule]));
const profileDefinitions = [
  { id: "valencian", language: "ca-ES-valencia", file: "ca-pattern-rules-valencia.json.gz", grammarHash: "6a765748ad295530980a2132e078aaa37dd879432b1420e1907c4673cc36fe7b" },
  { id: "balearic", language: "ca-ES-balear", file: "ca-pattern-rules-balear.json.gz", grammarHash: "53304f4142bb5ee2b870ce391f84b7e4eb2abc29ddb0a275fa4f57dc6f799b09" }
];
const sharedUniversalRuleIds = new Set(["AMANEIXER", "COLOREJAR", "LLARGARIA"]);

const profiles = {};
for (const definition of profileDefinitions) {
  const bytes = await readFile(resolve(sourceRoot, definition.file));
  const inventory = JSON.parse(gunzipSync(bytes).toString("utf8"));
  if (inventory.language !== definition.language) throw new Error(`Unexpected LanguageTool profile inventory: ${definition.language}`);
  if (inventory.ruleSourceHashes["/org/languagetool/rules/ca/grammar.xml"] !== "53304f4142bb5ee2b870ce391f84b7e4eb2abc29ddb0a275fa4f57dc6f799b09") {
    throw new Error(`Shared Catalan grammar hash differs for ${definition.language}`);
  }
  if (definition.id === "valencian"
      && inventory.ruleSourceHashes["/org/languagetool/rules/ca/ca-ES-valencia/grammar.xml"] !== definition.grammarHash) {
    throw new Error("Valencian grammar source hash differs from the reviewed snapshot.");
  }

  const byId = new Map();
  for (const rule of inventory.rules) {
    if (!byId.has(rule.fullId)) byId.set(rule.fullId, []);
    byId.get(rule.fullId).push(rule);
  }
  const disabled = [];
  const additions = [];
  const registrationOrder = {};
  for (const [fullId, baseRule] of baseById) {
    const candidates = byId.get(fullId);
    if (!candidates?.length) {
      disabled.push(fullId);
      continue;
    }
    const matchingPattern = candidates.find(rule => JSON.stringify(rule.pattern) === JSON.stringify(baseRule.pattern));
    const selected = matchingPattern || candidates[0];
    registrationOrder[fullId] = selected.registrationOrder;
  }
  for (const [fullId, candidates] of byId) {
    if (baseById.has(fullId)) continue;
    const selected = candidates[0];
    // The dialect profiles do not need a region-specific gazetteer. These
    // patterns are local municipality names, not grammar or dialect rules.
    if (selected.id === "MUNICIPIS_VALENCIA") continue;
    // These three LanguageTool Valencian XML rules were already adopted as
    // shared Catalan rules; do not register a second profile-specific copy.
    if (sharedUniversalRuleIds.has(selected.id)) {
      const matchingPattern = candidates.find(rule => JSON.stringify(rule.pattern) === JSON.stringify(baseById.get(fullId)?.pattern));
      registrationOrder[fullId] = (matchingPattern || selected).registrationOrder;
      continue;
    }
    additions.push(selected);
    registrationOrder[fullId] = selected.registrationOrder;
  }
  profiles[definition.id] = {
    language: definition.language,
    source: "LanguageTool 6.9-SNAPSHOT active profile PatternRules",
    inventorySha256: createHash("sha256").update(bytes).digest("hex"),
    sharedGrammarXmlSha256: inventory.ruleSourceHashes["/org/languagetool/rules/ca/grammar.xml"],
    profileGrammarXmlSha256: inventory.ruleSourceHashes["/org/languagetool/rules/ca/ca-ES-valencia/grammar.xml"] || null,
    activePatternRuleCount: inventory.activePatternRuleCount,
    disabled,
    additions,
    registrationOrder
  };
}

const resource = {
  schemaVersion: 1,
  source: "LanguageTool ValencianCatalan and BalearicCatalan profile deltas; municipality rules excluded",
  baseInventorySha256: createHash("sha256").update(baseText).digest("hex"),
  profiles
};
const outputPath = resolve(root, "engine-src/resources/ca-dialect-profile-overrides.json");
await writeFile(outputPath, `${JSON.stringify(resource)}\n`, "utf8");
console.log(JSON.stringify(Object.fromEntries(Object.entries(profiles).map(([id, value]) => [id, {
  activePatternRuleCount: value.activePatternRuleCount,
  disabled: value.disabled.length,
  additions: value.additions.length
}])), null, 2));
