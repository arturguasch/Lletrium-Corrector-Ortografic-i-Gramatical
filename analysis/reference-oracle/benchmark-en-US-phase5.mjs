import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { loadLocalEngine } from "../../build/phase5-extension/tests/local-engine-harness.mjs";

const root = resolve(".");
const outputPath = "analysis/reference-oracle/outputs/en-US-phase5-performance.json";
const percentile = (values, p) => values[Math.min(values.length - 1, Math.ceil(values.length * p) - 1)];
const round = value => Number(value.toFixed(2));
const sumTree = async dir => {
  let total = 0;
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, item.name);
    total += item.isDirectory() ? await sumTree(path) : (await stat(path)).size;
  }
  return total;
};

const memoryBefore = process.memoryUsage();
const loadStarted = performance.now();
const engine = await loadLocalEngine("1.0.0");
const bundleEvaluationMs = performance.now() - loadStarted;
globalThis.gc?.();
const memoryAfterBundle = process.memoryUsage();
const preloadStarted = performance.now();
const preload = await engine.preload(["en-US"]);
const preloadMs = performance.now() - preloadStarted;
if (preload.ready !== true || preload.profile !== "en-US") throw new Error("en-US did not reach ready state");
globalThis.gc?.();
const memoryAfterPreload = process.memoryUsage();

const sentenceBank = [
  "The research team published a clear summary of the results, including the limits of the study. ",
  "Readers can compare each proposal with the evidence and decide which trade-offs matter most. ",
  "A second review found that the new process reduced delays without changing the final decision. ",
  "The report explains how the system works and describes the steps required to reproduce it. ",
  "Several participants asked for a shorter guide, but they also wanted the examples to remain precise. ",
  "We will measure the next release with the same documents so that improvements remain comparable. ",
  "The quik review identified a small number of errors, while the broader analysis stayed consistent. "
];
const buildText = length => {
  let text = "";
  for (let i = 0; text.length < length; i++) text += sentenceBank[i % sentenceBank.length];
  return text.slice(0, length);
};
const scenarios = [
  { chars: 1000, iterations: 10 },
  { chars: 5000, iterations: 5 },
  { chars: 15000, iterations: 3 }
];
const throughput = [];
for (const scenario of scenarios) {
  const text = buildText(scenario.chars);
  engine.checkText(text, { language: "en-US" });
  const samples = [];
  let issueCount = 0;
  for (let i = 0; i < scenario.iterations; i++) {
    const started = performance.now();
    issueCount += engine.checkText(text, { language: "en-US" }).length;
    samples.push(performance.now() - started);
  }
  samples.sort((a, b) => a - b);
  throughput.push({
    inputChars: text.length,
    iterations: scenario.iterations,
    warmupIterations: 1,
    medianMs: round(percentile(samples, 0.5)),
    p95Ms: round(percentile(samples, 0.95)),
    meanMs: round(samples.reduce((sum, value) => sum + value, 0) / samples.length),
    meanMsPer1000Chars: round(samples.reduce((sum, value) => sum + value, 0) / samples.length * 1000 / text.length),
    issueCountAcrossMeasuredRuns: issueCount
  });
}
globalThis.gc?.();
const memoryAfterChecks = process.memoryUsage();
const resourceTreeBytes = await sumTree(resolve(root, "build/phase5-extension/build/resources/en-US"));
const installerZipBytes = (await stat(resolve(root, "build/releases/Corrector-Catala-1.0.0.zip"))).size;
const buildMetadata = JSON.parse(await readFile(resolve(root, "build/phase5-extension/build/engine-build.json"), "utf8"));
const result = {
  schemaVersion: 1,
  profile: "en-US",
  generatedAt: new Date().toISOString(),
  benchmark: "Local JavaScript engine in Node.js V8; process heap/RSS and single-thread latency are proxies, not Chrome worker telemetry.",
  environment: { node: process.version, platform: process.platform, arch: process.arch, buildBytes: buildMetadata.bytes },
  startup: { bundleEvaluationMs: round(bundleEvaluationMs), preloadMs: round(preloadMs), readyTotalMs: round(bundleEvaluationMs + preloadMs) },
  memoryBytes: {
    before: { heapUsed: memoryBefore.heapUsed, rss: memoryBefore.rss },
    afterBundle: { heapUsed: memoryAfterBundle.heapUsed, rss: memoryAfterBundle.rss },
    afterPreload: { heapUsed: memoryAfterPreload.heapUsed, rss: memoryAfterPreload.rss },
    afterChecks: { heapUsed: memoryAfterChecks.heapUsed, rss: memoryAfterChecks.rss },
    preloadDelta: { heapUsed: memoryAfterPreload.heapUsed - memoryBefore.heapUsed, rss: memoryAfterPreload.rss - memoryBefore.rss },
    checksDelta: { heapUsed: memoryAfterChecks.heapUsed - memoryAfterPreload.heapUsed, rss: memoryAfterChecks.rss - memoryAfterPreload.rss }
  },
  throughput,
  package: { englishResourceTreeBytes: resourceTreeBytes, installerZipBytes, installerZipMiB: round(installerZipBytes / 1024 / 1024) },
  limitations: ["Node V8 is not Chrome's extension worker; browser startup/first-paint observations are recorded separately from user diagnostics.", "Small sample counts make p95 a coarse upper-tail estimate, especially at 15,000 characters."]
};
await mkdir(resolve(root, "analysis/reference-oracle/outputs"), { recursive: true });
await writeFile(resolve(root, outputPath), `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output: outputPath, ...result }, null, 2));
