import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);
const enginePath = new URL("build/extension/src/language-engine.js", root);
const harnessPath = new URL("build/extension/tests/local-engine-harness.mjs", root);
const outputPath = new URL("analysis/reference-oracle/outputs/phase6-delta-smoke.json", root);
const inputPath = new URL("analysis/reference-oracle/corpus/phase6-filter-parity.txt", root);
const javaDefaultPath = new URL("analysis/reference-oracle/outputs/phase6-filter-parity-default-java.json", root);
const javaPickyPath = new URL("analysis/reference-oracle/outputs/phase6-filter-parity-java.json", root);
const { loadLocalEngine } = await import(harnessPath.href);
const engine = await loadLocalEngine("9.6.93");
await engine.preload(["ca"]);

const checks = [];
const numberCases = [
  ["1", "_spell_number_", "un"],
  ["11", "_spell_number_", "onze"],
  ["21", "_spell_number_", "vint-i-un"],
  ["21", "_spell_number_:feminine", "vint-i-una"],
  ["22", "_spell_number_:feminine", "vint-i-dues"],
  ["242", "_spell_number_:feminine", "dues-centes quaranta-dues"],
  ["2251241", "_spell_number_:feminine", "dos milions dues-centes cinquanta-una mil dues-centes quaranta-una"],
  ["14", "_spell_number_:Roman", "XIV"]
];
for (const [number, tag, expected] of numberCases) {
  const actual = globalThis.CorrectorCatalanSoros.spellNumber(number, tag);
  assert.equal(actual, expected, `${tag} for ${number}`);
  checks.push({ synthesizerTag: tag, number, suggestion: actual });
}

function expectRuleSuggestion(text, expected, ruleId) {
  const issues = engine.matchPatternRules(text);
  const issue = issues.find(candidate => candidate.ruleId === ruleId && candidate.suggestions.includes(expected));
  assert.ok(issue, `${ruleId}: ${JSON.stringify(text)} must suggest ${JSON.stringify(expected)}`);
  checks.push({ text, ruleId, span: [issue.start, issue.end], matchedText: issue.text, suggestion: expected });
}

expectRuleSuggestion("Obtingué 80 o 90 mil vots.", "vuitanta mil o noranta mil", "NOMBRES_NO_LLETRES");
expectRuleSuggestion("Obtingué 90 mil vots.", "noranta mil", "NOMBRES_NO_LLETRES");
expectRuleSuggestion("El nou papa es diu Lleó 14.", "XIV", "REIS_PAPES_NOMBRES_ROMANS");

const inputText = await readFile(inputPath, "utf8");
const javaDefault = JSON.parse(await readFile(javaDefaultPath, "utf8"));
assert.equal(javaDefault.runtimeConfiguration.checkLevel, "DEFAULT");
const inputSha256 = createHash("sha256").update(inputText).digest("hex");
assert.equal(javaDefault.inputSha256, inputSha256, "DEFAULT Java oracle input hash");
const localDefault = engine.checkText(inputText, { language: "ca", skipSpelling: true })
  .map(issue => ({ ruleId: issue.ruleId, from: issue.start, to: issue.end, text: issue.text, suggestions: issue.suggestions }));
const expectedDefault = javaDefault.matches.map(issue => ({
  ruleId: issue.baseRuleId, from: issue.from, to: issue.to, text: issue.matchedText, suggestions: issue.suggestions
}));
assert.deepEqual(localDefault, expectedDefault, "DEFAULT Java/local alerts, spans and suggestions");

const javaPicky = JSON.parse(await readFile(javaPickyPath, "utf8"));
assert.equal(javaPicky.runtimeConfiguration.checkLevel, "PICKY");
assert.equal(javaPicky.inputSha256, inputSha256, "PICKY Java oracle input hash");
const javaSpellout = javaPicky.matches.filter(issue => issue.baseRuleId === "SPELLOUT_NUMBERS");
assert.equal(javaSpellout.length, 2, "LanguageTool PICKY examples for both number-filter genders");

function expectNumberFilter(number, gender, expected, start) {
  const issue = { start, end: start + number.length, text: number, message: "test", suggestions: [] };
  const context = {
    text: inputText,
    words: [{ text: number, start, end: start + number.length, kind: "word" }],
    positions: [[0]]
  };
  const rule = {
    fullId: `PHASE6_SPELLOUT_${gender}`,
    filterClass: "org.languagetool.rules.ca.CatalanNumberSpellerFilter",
    filterArguments: `number_to_spell:\\1 gender:${gender}`
  };
  const actual = globalThis.CorrectorCatalanRuleFilters.apply(rule, issue, context);
  assert.deepEqual(actual?.suggestions, [expected], `${rule.fullId} expected ${expected}`);
  const expectedJava = javaSpellout.find(row => row.from === start && row.matchedText === number);
  assert.ok(expectedJava, `Missing Java PICKY filter output for ${number}`);
  assert.equal(actual.start, expectedJava.from, `${rule.fullId} span start`);
  assert.equal(actual.end, expectedJava.to, `${rule.fullId} span end`);
  assert.deepEqual(actual.suggestions, expectedJava.suggestions, `${rule.fullId} Java suggestions`);
  checks.push({ filter: rule.fullId, number, suggestion: expected });
}

expectNumberFilter("24", "masculine", "Vint-i-quatre", 0);
expectNumberFilter("22", "feminine", "Vint-i-dues", 9);
checks.push({ javaDefaultComparison: "passed", alerts: localDefault.length, matchedSpansAndSuggestions: true });

const [engineBytes, manifestBytes] = await Promise.all([
  readFile(enginePath),
  readFile(new URL("build/extension/build/resources/synthesis/manifest.json", root))
]);
const report = {
  schemaVersion: 1,
  scope: "phase6 delta only; no corpus-wide parity claim",
  passed: true,
  oracle: "LanguageTool 6.9-SNAPSHOT; direct JLanguageTool.check at DEFAULT and PICKY",
  inputSha256,
  defaultOracleMatches: javaDefault.matches.length,
  pickyOracleMatches: javaPicky.matches.length,
  checks,
  stagedEngineSha256: createHash("sha256").update(engineBytes).digest("hex"),
  stagedSynthesisManifestSha256: createHash("sha256").update(manifestBytes).digest("hex"),
  localOnly: true
};
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
