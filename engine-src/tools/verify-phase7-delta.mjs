import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEngine } from "../../analysis/reference-oracle/load-local-engine.mjs";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const oracleRoot = join(root, "analysis/reference-oracle");
const baselinePath = join(oracleRoot, "outputs/phase5-upstream-speller-full-check-comparison.json");
const outputPath = join(oracleRoot, "outputs/phase7-delta-check.json");
const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const overlaps = baseline.rows.filter(row => row.localIssues.some(local =>
  row.javaIssues.some(java => local.start === java.start && local.end === java.end && local.ruleId !== java.ruleId)));
const texts = [...new Set(overlaps.map(row => row.sentence))];
assert.equal(texts.length, 9, "Expected the nine stored cross-family overlap cases from phase 5.");

const offsets = [];
let offset = 0;
for (const text of texts) {
  offsets.push(offset);
  offset += text.length + 1;
}
const corpus = texts.join("\n");
const tempRoot = mkdtempSync(join(tmpdir(), "ca-phase7-delta-"));
const inputPath = join(tempRoot, "overlap-cases.txt");
const javaOutputPath = join(tempRoot, "java-output.json");
writeFileSync(inputPath, corpus, "utf8");

try {
  const javaHome = process.env.JAVA_HOME;
  if (!javaHome) throw new Error("JAVA_HOME must point to the Java 17 JDK used by the local oracle.");
  const classpath = [
    join(oracleRoot, "classes"),
    join(oracleRoot, "languagetool/languagetool-master/languagetool-language-modules/ca/target/classes"),
    readFileSync(join(oracleRoot, "classpath.txt"), "utf8").trim()
  ].join(delimiter);
  const env = { ...process.env };
  delete env.CA_REMOTE_RULE_SERVER;
  delete env.CA_REMOTE_RULE_SERVER_TIMEOUT;
  delete env.MAX_SENTENCES_FIRST_SERVER;

  const javaMatches = {};
  for (const checkLevel of ["DEFAULT", "PICKY"]) {
    execFileSync(join(javaHome, "bin/java.exe"), [
      "-Dfile.encoding=UTF-8", "-cp", classpath, "ReferenceOracle",
      inputPath, javaOutputPath, checkLevel
    ], { stdio: "ignore", env });
    const result = JSON.parse(readFileSync(javaOutputPath, "utf8"));
    assert.equal(result.runtimeConfiguration.checkLevel, checkLevel);
    assert.equal(result.inputSha256, createHash("sha256").update(corpus).digest("hex"));
    javaMatches[checkLevel] = result.matches;
  }

  const context = await loadLocalEngine();
  const engine = context.CorrectorLocalEngine;
  const byLevel = {};
  const rows = texts.map((text, index) => {
    const start = offsets[index];
    const row = { text, results: {} };
    for (const checkLevel of ["DEFAULT", "PICKY"]) {
      const java = javaMatches[checkLevel]
        .filter(match => match.from >= start && match.to <= start + text.length)
        .map(match => ({
          ruleId: match.ruleId,
          start: match.from - start,
          end: match.to - start,
          suggestions: match.suggestions
        }));
      const local = engine.checkText(text, { checkLevel }).map(match => ({
        ruleId: match.ruleId,
        start: match.start,
        end: match.end,
        suggestions: match.suggestions
      }));
      const publicDefault = engine.checkText(text).map(match => ({
        ruleId: match.ruleId, start: match.start, end: match.end, suggestions: match.suggestions
      }));
      if (checkLevel === "DEFAULT") {
        assert.deepEqual(toPlain(publicDefault), toPlain(local), `Omitted checkLevel must use DEFAULT: ${text}`);
      }
      const outputSignature = values => values.map(match => ({ start: match.start, end: match.end, suggestions: [...match.suggestions] }));
      assert.equal(JSON.stringify(outputSignature(local)), JSON.stringify(outputSignature(java)), `${checkLevel} spelling/arbitration parity: ${text}`);
      row.results[checkLevel] = { java, local, exactSpanAndSuggestionParity: true };
      byLevel[checkLevel] = (byLevel[checkLevel] || 0) + local.length;
    }
    assert.equal(
      JSON.stringify(rowsSignature(row.results.DEFAULT.local)),
      JSON.stringify(rowsSignature(row.results.PICKY.local)),
      `PICKY must not change these non-picky overlap cases: ${text}`
    );
    return row;
  });

  const engineBytes = readFileSync(join(root, "build/language-engine.js"));
  const stagedBytes = readFileSync(join(root, "build/extension/src/language-engine.js"));
  const ruleIdAliases = rows.flatMap(row => ["DEFAULT", "PICKY"].flatMap(checkLevel => {
    const java = row.results[checkLevel].java;
    const local = row.results[checkLevel].local;
    return local.flatMap(localMatch => java.filter(javaMatch => localMatch.start === javaMatch.start
      && localMatch.end === javaMatch.end
      && JSON.stringify(localMatch.suggestions) === JSON.stringify(javaMatch.suggestions)
      && localMatch.ruleId !== javaMatch.ruleId).map(javaMatch => ({
      text: row.text, checkLevel, span: [localMatch.start, localMatch.end],
      localRuleId: localMatch.ruleId, javaRuleId: javaMatch.ruleId
    })));
  }));
  const report = {
    schemaVersion: 1,
    scope: "phase 7 delta; stored cross-family spelling/arbitration cases only",
    oracle: "LanguageTool 6.9-SNAPSHOT JLanguageTool.check at DEFAULT and PICKY",
    passed: true,
    checks: {
      crossFamilyCases: texts.length,
      exactSpanAndSuggestionMatchesPerLevel: rows.length,
      publicDefaultMatchesExplicitDefault: true,
      pickyPreservesNonPickyOverlapOutputs: true,
      sameSpanSuggestionRuleIdAliases: ruleIdAliases,
      defaultLocalIssues: byLevel.DEFAULT,
      pickyLocalIssues: byLevel.PICKY
    },
    inputSha256: createHash("sha256").update(corpus).digest("hex"),
    engineSha256: createHash("sha256").update(engineBytes).digest("hex"),
    stagedEngineSha256: createHash("sha256").update(stagedBytes).digest("hex"),
    engineAndStagedMatch: engineBytes.equals(stagedBytes),
    rows
  };
  assert.equal(report.engineAndStagedMatch, true, "Engine and staged extension bundles must be identical.");
  await import("node:fs/promises").then(({ writeFile }) => writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8"));
  console.log(JSON.stringify(report, null, 2));
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

function rowsSignature(values) {
  return values.map(match => ({ start: match.start, end: match.end, suggestions: [...match.suggestions] }));
}

function toPlain(value) { return JSON.parse(JSON.stringify(value)); }
