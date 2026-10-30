/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { access, readFile, readdir, stat } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { performance } from "node:perf_hooks";

const root = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const staged = resolve(root, "build/extension");
const zipPath = resolve(root, "build/releases/Corrector-Catala-1.0.0.zip");
const enginePath = resolve(staged, "src/language-engine.js");
const engineSource = await readFile(enginePath, "utf8");
const memoryBefore = process.memoryUsage();
const evalStart = performance.now();
globalThis.chrome = { runtime: { getURL: path => `https://fixture.invalid/${String(path).replace(/^\/+/, "")}` } };
globalThis.fetch = async url => {
  const pathname = decodeURIComponent(new URL(url).pathname).replace(/^\/+/, "");
  const candidate = pathname.startsWith("analysis/") ? resolve(root, pathname) : resolve(staged, pathname);
  try {
    await access(candidate);
    return new Response(await readFile(candidate), { status: 200 });
  } catch {
    return new Response("not found", { status: 404 });
  }
};
vm.runInThisContext(engineSource, { filename: relative(root, enginePath) });
const bundleEvalMs = performance.now() - evalStart;

const engine = globalThis.CorrectorLocalEngine;
const preloadStart = performance.now();
await engine.preload(["es-ES"]);
const preloadMs = performance.now() - preloadStart;
globalThis.gc?.();
const memoryReady = process.memoryUsage();

const seed = "La economía española analiza los cambios sociales y políticos de cada período. ";
const targetLength = 1000;
const text = seed.repeat(Math.ceil(targetLength / seed.length)).slice(0, targetLength);
const iterations = 40;
for (let i = 0; i < 5; i++) engine.checkText(text, { language: "es-ES" });
const samples = [];
let issueCount = 0;
for (let i = 0; i < iterations; i++) {
  const start = performance.now();
  issueCount += engine.checkText(text, { language: "es-ES" }).length;
  samples.push(performance.now() - start);
}
samples.sort((a, b) => a - b);
const percentile = p => samples[Math.min(samples.length - 1, Math.ceil(p * samples.length) - 1)];

const sumFiles = async dir => {
  let total = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) total += await sumFiles(path);
    else total += (await stat(path)).size;
  }
  return total;
};
const spanishResources = await sumFiles(resolve(staged, "build/resources/es-ES"));
const zipBytes = (await stat(zipPath)).size;
const result = {
  benchmark: "es-ES local runtime in Node.js V8 (proxy, not Chrome worker telemetry)",
  generatedAt: new Date().toISOString(),
  bundleEvalMs: Number(bundleEvalMs.toFixed(2)),
  preloadMs: Number(preloadMs.toFixed(2)),
  readyTotalMs: Number((bundleEvalMs + preloadMs).toFixed(2)),
  memoryBytes: {
    before: { heapUsed: memoryBefore.heapUsed, rss: memoryBefore.rss },
    ready: { heapUsed: memoryReady.heapUsed, rss: memoryReady.rss },
    delta: { heapUsed: memoryReady.heapUsed - memoryBefore.heapUsed, rss: memoryReady.rss - memoryBefore.rss }
  },
  throughput: {
    inputChars: text.length,
    iterations,
    warmupIterations: 5,
    meanMsPer1000Chars: Number((samples.reduce((sum, value) => sum + value, 0) / samples.length).toFixed(2)),
    p50MsPer1000Chars: Number(percentile(0.5).toFixed(2)),
    p95MsPer1000Chars: Number(percentile(0.95).toFixed(2)),
    issueCountAcrossMeasuredRuns: issueCount
  },
  package: {
    spanishResourceTreeBytes: spanishResources,
    installerZipBytes: zipBytes,
    installerZipMiB: Number((zipBytes / 1024 / 1024).toFixed(2))
  }
};
console.log(JSON.stringify(result, null, 2));
