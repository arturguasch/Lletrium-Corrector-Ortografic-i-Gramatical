/* Catalan adapter for the shared LanguageTool .sor interpreter. */
(() => {
  "use strict";
  let cardinal, roman, promise;
  const decoder = new TextDecoder("utf-8");
  const sha256 = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    value => value.toString(16).padStart(2, "0")).join("");
  async function readSoros(base, manifest, file, sourceKey) {
    const response = await fetch(base + file);
    if (!response.ok) throw new Error(`Could not load local ${file} (${response.status}).`);
    const bytes = await response.arrayBuffer();
    const expected = manifest.sourceHashes?.[sourceKey];
    if (!expected || await sha256(bytes) !== expected) throw new Error(`Invalid LanguageTool ${file} resource.`);
    return decoder.decode(bytes);
  }
  async function load() {
    if (!promise) promise = (async () => {
      if (!globalThis.CorrectorSorosRuntime?.SorosProgram) throw new Error("The shared local .sor runtime is unavailable.");
      const base = chrome.runtime.getURL("build/resources/synthesis/");
      const manifest = await (await fetch(base + "resource-index.json")).json();
      const [caSource, romanSource] = await Promise.all([
        readSoros(base, manifest, "ca.sor", "caSoros"), readSoros(base, manifest, "Roman.sor", "romanSoros")
      ]);
      cardinal = new globalThis.CorrectorSorosRuntime.SorosProgram(caSource, "ca");
      roman = new globalThis.CorrectorSorosRuntime.SorosProgram(romanSource, "Roman");
      return {loaded: true, caSourceHash: manifest.sourceHashes.caSoros, romanSourceHash: manifest.sourceHashes.romanSoros,
        caRules: cardinal.rules.length, romanRules: roman.rules.length};
    })().catch(error => { promise = null; throw error; });
    return promise;
  }
  function spellNumber(input, tag) {
    if (!cardinal || !roman) throw new Error("Local Soros numberers have not been loaded.");
    if (tag === "_spell_number_") return cardinal.runInner(input, true, true, 0);
    if (tag === "_spell_number_:feminine") return cardinal.runInner(`feminine ${input}`, true, true, 0);
    if (tag === "_spell_number_:Roman") return roman.runInner(input, true, true, 0);
    return null;
  }
  globalThis.CorrectorCatalanSoros = Object.freeze({load, spellNumber});
})();
