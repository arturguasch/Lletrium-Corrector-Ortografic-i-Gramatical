import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const inventoryPath = resolve(root, "analysis/reference-oracle/outputs/en-US-pattern-rules.json.gz");
const candidatePath = resolve(root, "analysis/reference-oracle/outputs/en-US-pattern-rule-candidates.json");
const repeatedPath = resolve(root, "analysis/reference-oracle/outputs/en-US-repeated-pattern-rules.json");
const inventoryBytes = await readFile(inventoryPath);
const inventory = JSON.parse(gunzipSync(inventoryBytes));
const inventorySha256 = createHash("sha256").update(inventoryBytes).digest("hex");
const supportedFilters = ["org.languagetool.rules.UnderlineSpacesFilter", "org.languagetool.rules.en.OrdinalSuffixFilter",
  "org.languagetool.rules.en.EnglishSuppressMisspelledSuggestionsFilter", "org.languagetool.rules.en.EnglishNumberInWordFilter",
  "org.languagetool.rules.en.DateCheckFilter", "org.languagetool.rules.en.NewYearDateFilter",
  "org.languagetool.rules.en.YMDNewYearDateFilter", "org.languagetool.rules.DateRangeChecker",
  "org.languagetool.rules.en.FindSuggestionsFilter", "org.languagetool.rules.en.AdverbFilter",
  "org.languagetool.rules.spelling.multitoken.MultitokenSpellerFilter"];
const expectedGrammarHash = "525966679e4dac23d70b5f7c09092b67b9aa20fcfbe70327b858e3fd06b63974";
const expectedStyleHash = "8ce7467ecb838255ede0be6e0fe32040b1598e96c2a0c8003ce1b8fcf26638cd";
if (inventory.language !== "en-US" || inventory.activePatternRuleCount !== 5798
    || inventory.ruleSourceHashes?.["/org/languagetool/rules/en/grammar.xml"] !== expectedGrammarHash
    || inventory.ruleSourceHashes?.["/org/languagetool/rules/en/style.xml"] !== expectedStyleHash
    || inventory.repeatedPatternRules?.length !== 2) {
  throw new Error("Pinned en-US PatternRule inventory or source hashes changed.");
}

const candidates = JSON.parse(await readFile(candidatePath, "utf8"));
if (candidates.language !== "en-US" || candidates.sourceSha256 !== inventorySha256
    || candidates.grammarXmlSha256 !== expectedGrammarHash
    || candidates.upstreamActiveRuleCount !== 5798 || candidates.heldOutByPortabilityGate !== 0
    || candidates.runtimeRuleCount !== candidates.rules?.length
    || candidates.runtimeRuleCount !== 5798
    || candidates.rules.some(rule => rule.outputPortable === false
      || rule.filterClass && !supportedFilters.includes(rule.filterClass))) {
  throw new Error("The en-US PatternRule candidate gate is stale or contains a nonportable filter/output.");
}

const repeatedRules = inventory.repeatedPatternRules.flatMap(group => group.rules);
if (repeatedRules.length !== 8 || repeatedRules.some(rule => rule.filterClass)) {
  throw new Error("The pinned English repeated-pattern inventory changed or requires unimplemented filters.");
}
const repeated = {
  schemaVersion: 1,
  profile: "en-US",
  source: "LanguageTool 6.9-SNAPSHOT PatternRule repeated groups",
  sourceSha256: inventorySha256,
  styleXmlSha256: expectedStyleHash,
  groupCount: inventory.repeatedPatternRules.length,
  groups: inventory.repeatedPatternRules
};
await writeFile(repeatedPath, `${JSON.stringify(repeated)}\n`, "utf8");
console.log(JSON.stringify({ profile: "en-US", inventoryRules: inventory.activePatternRuleCount,
  runtimeRules: candidates.runtimeRuleCount, repeatedGroups: repeated.groupCount,
  repeatedRules: repeatedRules.length, heldOutByGate: inventory.activePatternRuleCount - candidates.runtimeRuleCount,
  inventorySha256, grammarSha256: expectedGrammarHash, styleSha256: expectedStyleHash }));
