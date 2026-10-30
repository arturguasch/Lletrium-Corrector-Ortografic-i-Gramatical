import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const bundle = await readFile(resolve(root, "build/extension/src/language-engine.js"), "utf8");
const stagedRoot = resolve(root, "build/extension");
globalThis.chrome = { runtime: { getURL: path => `https://fixture.invalid/${String(path).replace(/^\/+/, "")}` } };
globalThis.fetch = async url => {
  const pathname = decodeURIComponent(new URL(url).pathname).replace(/^\/+/, "");
  const candidate = pathname.startsWith("analysis/") ? resolve(root, pathname) : resolve(stagedRoot, pathname);
  try {
    await access(candidate);
    return new Response(await readFile(candidate), { status: 200 });
  }
  catch { return new Response("not found", { status: 404 }); }
};
vm.runInThisContext(bundle, { filename: relative(root, "build/extension/src/language-engine.js") });

const engine = globalThis.CorrectorLocalEngine;
assert.equal(engine.normalizeOptions({ language: "es-ES" }).language, "es-ES");
await engine.preload(["es-ES"]);
const spanishIssues = engine.checkText("La casa es rapida.", { language: "es-ES" });
const spanishSpelling = spanishIssues.find(issue => issue.ruleId === "MORFOLOGIK_RULE_ES");
assert(spanishSpelling?.language === "es-ES" && spanishSpelling.suggestions.includes("rápida"), `es-ES facade should dispatch to independent Spanish spelling and return Spanish-marked issues: ${JSON.stringify(spanishIssues)}`);
assert.equal("La casa es rapida.".slice(spanishSpelling.start, spanishSpelling.end), spanishSpelling.text, "Issue offsets must select exactly the Spanish text to replace");
assert.equal("La casa es rapida.".slice(0, spanishSpelling.start) + spanishSpelling.suggestions[0] + "La casa es rapida.".slice(spanishSpelling.end), "La casa es rápida.", "The first spelling suggestion must apply without changing neighboring text");
const batch = engine.checkBatch([{ id: "es", text: "La casa es rapida." }], { language: "es-ES" });
assert(batch[0].issues.some(issue => issue.language === "es-ES" && issue.suggestions.includes("rápida")), "es-ES batch checks should dispatch through the same profile");
assert.equal(engine.getLoadStatus().profiles["es-ES"].ready, true, "Spanish readiness should be tracked separately");
assert.equal(engine.getLoadStatus().profiles["ca-ES"].ready, false, "Loading Spanish must not mark Catalan ready");
assert.throws(() => engine.checkText("La casa es rapida.", { language: "ca-ES" }), error => error.code === "ENGINE_NOT_PRELOADED", "A Catalan request must not silently fall through to the loaded Spanish profile");
engine.clearCache();
await engine.preload(["es-ES"]);
const reloadedIssue = engine.checkText("La casa es rapida.", { language: "es-ES" }).find(issue => issue.ruleId === "MORFOLOGIK_RULE_ES");
assert(reloadedIssue?.suggestions.includes("rápida"), "The independent Spanish profile should be able to initialize and check again after an engine reset");

console.log(JSON.stringify({ ok: true, profiles: engine.getLoadStatus().profiles, spanishIssueCount: spanishIssues.length, spanishSpelling, batchItems: batch.length, replacementRangeExact: true, catalanFallback: false, engineResetReload: true }, null, 2));
