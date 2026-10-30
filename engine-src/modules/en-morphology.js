/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Independent en-US lookup over LanguageTool's pinned EnglishTagger dictionary. */
(() => {
  "use strict";
  const normalize = value => String(value ?? "").normalize("NFC");

  class EnglishMorphology {
    constructor(entries, manifest, manualTags) {
      if (!entries || typeof entries !== "object" || Array.isArray(entries)
          || manifest?.schemaVersion !== 1 || manifest.profile !== "en-US"
          || manualTags?.schemaVersion !== 1 || manualTags.profile !== "en-US"
          || manualTags.source !== "LanguageTool 6.9-SNAPSHOT English BaseTagger manual additions/removals") {
        throw new Error("English POS entries do not belong to the independent en-US profile.");
      }
      this.entries = new Map(Object.entries(entries));
      this.manualAdditions = new Map();
      this.manualRemovals = new Map();
      for (const [rows, target] of [[manualTags.additions, this.manualAdditions], [manualTags.removals, this.manualRemovals]]) {
        for (const item of rows || []) {
          if (!item.form || !item.lemma || !item.tag) throw new Error("The en-US manual POS overlay contains an invalid row.");
          const key = `${item.lemma}\0${item.tag}`;
          const list = target.get(item.form) || [];
          if (!list.some(value => `${value[0]}\0${value[1]}` === key)) list.push([item.lemma, item.tag]);
          target.set(item.form, list);
        }
      }
      this.manifest = manifest;
    }

    lookup(form, { lowercaseFallback = true } = {}) {
      const value = normalize(form);
      const exact = this.entries.get(value) || [];
      const selected = exact.length || !lowercaseFallback ? exact : this.entries.get(value.toLocaleLowerCase("en")) || [];
      const additions = this.manualAdditions.get(value) || [];
      const removals = new Set((this.manualRemovals.get(value) || []).map(([lemma, tag]) => `${lemma}\0${tag}`));
      const output = [];
      for (const [lemma, tag] of [...additions, ...selected]) {
        const key = `${lemma}\0${tag}`;
        if (removals.has(key) || output.some(reading => `${reading.lemma}\0${reading.tag}` === key)) continue;
        output.push({ form: value, lemma, tag });
      }
      return output;
    }

    hasForm(form) { return (this.entries.get(normalize(form)) || []).length > 0; }

    getStats() {
      return { forms: this.manifest.posIndex.forms, readings: this.manifest.posIndex.entries,
        compressedBytes: this.manifest.posIndex.compressedBytes, profile: "en-US", storage: "LanguageTool English POS dictionary" };
    }

    static async load({ baseUrl, fetcher = globalThis.fetch } = {}) {
      const base = baseUrl || globalThis.chrome?.runtime?.getURL("build/resources/en-US/");
      if (!base) throw new Error("An en-US resource base URL is required outside the extension.");
      const manifestResponse = await fetcher(new URL("manifest.json", base));
      if (!manifestResponse.ok) throw new Error(`Could not load the en-US resource manifest (${manifestResponse.status}).`);
      const manifest = await manifestResponse.json();
      if (manifest?.profile !== "en-US" || manifest.source !== "LanguageTool 6.9-SNAPSHOT / english-pos-dict 0.6") throw new Error("The resources are not the pinned independent en-US profile.");
      const resource = manifest.posIndex, manualResource = manifest.manualTags;
      const response = await fetcher(new URL(resource.file, base));
      const manualResponse = await fetcher(new URL(manualResource?.file || "en-manual-tags.json", base));
      if (!response.ok || !manualResponse.ok || typeof DecompressionStream !== "function" || !globalThis.crypto?.subtle) throw new Error("Could not load or verify the local en-US POS entries.");
      const [bytes, manualBytes] = await Promise.all([
        new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer(), manualResponse.arrayBuffer()
      ]);
      const posBytes = new Uint8Array(bytes), overlayBytes = new Uint8Array(manualBytes);
      if (posBytes.byteLength !== resource.rawBytes) throw new Error("The en-US POS resource has an invalid length.");
      const [posDigest, manualDigest] = await Promise.all([
        globalThis.crypto.subtle.digest("SHA-256", posBytes), globalThis.crypto.subtle.digest("SHA-256", overlayBytes)
      ]);
      const hex = digest => Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
      if (hex(posDigest) !== resource.rawSha256 || hex(manualDigest) !== manualResource?.sha256) throw new Error("The en-US POS resources do not match their manifest hashes.");
      const entries = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(posBytes));
      const manualTags = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(overlayBytes));
      if (manualTags.additions?.length !== manualResource.additions || manualTags.removals?.length !== manualResource.removals
          || JSON.stringify(manualTags.sourceHashes) !== JSON.stringify(manualResource.sourceHashes)) throw new Error("The en-US manual POS overlay differs from its manifest.");
      return new EnglishMorphology(entries, manifest, manualTags);
    }
  }
  globalThis.CorrectorEnglishMorphology = EnglishMorphology;
})();
