/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Independent EnglishSynthesizer adapter over LanguageTool's pinned synthesis dictionary. */
(() => {
  "use strict";
  const EXCEPTIONS = new Set(["ne'er", "e'er", "o'er", "ol'", "ma'am", "n't", "informations"]);
  const isCapitalizedWord = value => /^\p{Lu}/u.test(value) && [...value].slice(1).every(char => !/\p{L}/u.test(char) || char === char.toLocaleLowerCase("en"));
  const lowerFirstIfCapitalized = value => isCapitalizedWord(value) ? value[0].toLocaleLowerCase("en") + value.slice(1) : value;

  function parseWordList(text) {
    return new Set(text.split(/\r?\n/u).map(line => line.trim()).filter(line => line && !line.startsWith("#"))
      .map(line => line.startsWith("*") ? line.slice(1) : line.toLocaleLowerCase("en")));
  }

  class EnglishSynthesizer {
    constructor(entries, tags, articleA, articleAn, manifest, numberProgram = null, romanProgram = null) {
      if (!entries || typeof entries !== "object" || !Array.isArray(tags) || manifest?.profile !== "en-US") throw new Error("English synthesis resources are invalid.");
      this.entries = new Map(Object.entries(entries));
      this.tags = tags;
      this.articleA = articleA;
      this.articleAn = articleAn;
      this.manifest = manifest;
      this.numberProgram = numberProgram;
      this.romanProgram = romanProgram;
    }

    suggestAorAn(word) {
      const value = String(word ?? "");
      let core = value.split(/[-']/u, 1)[0];
      if (core.toLocaleLowerCase("en") === "a") core = value;
      core = core.replace(/[^αa-zA-Z0-9.;,:']/gu, "");
      if (!core) return value;
      const lower = core.toLocaleLowerCase("en");
      const requiresA = this.articleA.has(lower) || this.articleA.has(core);
      const requiresAn = this.articleAn.has(lower) || this.articleAn.has(core);
      if (requiresA && !requiresAn) return `a ${lowerFirstIfCapitalized(value)}`;
      if (requiresAn && !requiresA) return `an ${lowerFirstIfCapitalized(value)}`;
      if (requiresA && requiresAn) return `a ${lowerFirstIfCapitalized(value)}`;
      if (value === value.toLocaleUpperCase("en") || globalThis.CorrectorEnglishTagger?.isMixedCase(value)) return value;
      const anPrefix = /^(?:unidentif|uni[mn])[a-z]+$/iu.test(value);
      const aException = /^(?:eu|one|uni|u[rst][aeiou])[a-z]*$/iu.test(value);
      const wantsAn = anPrefix || /^[aeiou]/iu.test(core) && !aException;
      return `${wantsAn ? "an" : "a"} ${lowerFirstIfCapitalized(value)}`;
    }

    getTargetPosTag(posTags, fallback = "") {
      return posTags?.length ? posTags.at(-1) : fallback;
    }

    synthesize(token, posTag, posTagRegExp = false) {
      const lemma = String(token?.lemma ?? token ?? "").normalize("NFC");
      const surface = String(token?.token ?? token?.text ?? lemma).normalize("NFC");
      const tag = String(posTag ?? "");
      if (tag.startsWith("_spell_number_")) return [this.spellNumber(surface, tag)].filter(Boolean);
      if (tag === "+DT") return [this.suggestAorAn(lemma), `the ${lowerFirstIfCapitalized(lemma)}`];
      if (tag === "+INDT") return [this.suggestAorAn(lemma)];
      let targetPattern = tag, determiner = "";
      if (posTagRegExp && tag.endsWith("\\+INDT")) {
        targetPattern = tag.slice(0, -"\\+INDT".length);
        determiner = `${this.suggestAorAn(lemma).split(" ", 1)[0]} `;
      } else if (posTagRegExp && tag.endsWith("\\+DT")) {
        targetPattern = tag.slice(0, -"\\+DT".length);
        determiner = "the ";
      }
      const tags = posTagRegExp ? this.tags.filter(value => {
        try { return new RegExp(`^(?:${targetPattern})$`, "u").test(value); } catch { return false; }
      }) : [tag];
      const values = [], seen = new Set();
      for (const currentTag of tags) {
        for (const form of this.entries.get(`${lemma}|${currentTag}`) || []) {
          if (form.startsWith("'") || EXCEPTIONS.has(form) || seen.has(form)) continue;
          seen.add(form); values.push(`${determiner}${form}`);
        }
      }
      return values;
    }

    spellNumber(value, tag = "_spell_number_") {
      if (tag === "_spell_number_") return this.numberProgram?.runInner(String(value), true, true, 0) || "";
      if (tag === "_spell_number_:feminine") return this.numberProgram?.runInner(`feminine ${value}`, true, true, 0) || "";
      if (tag === "_spell_number_:Roman") return this.romanProgram?.runInner(String(value), true, true, 0) || "";
      return "";
    }

    static async load({ baseUrl, fetcher = globalThis.fetch } = {}) {
      const base = baseUrl || globalThis.chrome?.runtime?.getURL("build/resources/en-US/");
      if (!base) throw new Error("An en-US resource base URL is required outside the extension.");
      const mr = await fetcher(new URL("manifest.json", base));
      if (!mr.ok) throw new Error(`Could not load the en-US manifest (${mr.status}).`);
      const manifest = await mr.json();
      if (manifest?.profile !== "en-US") throw new Error("Synthesis resources are not en-US.");
      if (manifest.soros?.file !== "en-US-en.sor" || manifest.soros?.sha256 !== "ad78ab088ceb4a5b1858020facd818ac1df5433cead09e784833047691333d11"
          || manifest.soros?.romanFile !== "Roman.sor" || manifest.soros?.romanSha256 !== "11002fdb8c7039c1a71a5ba8f3a2b405548e993f8668066363d6e1fea58ca4b1") throw new Error("The en-US number synthesizers are not the pinned LanguageTool resources.");
      const files = [manifest.synthesisIndex.file, "en-US-english_tags.txt", "en-US-det_a.txt", "en-US-det_an.txt", manifest.soros.file, manifest.soros.romanFile];
      const responses = await Promise.all(files.map(path => fetcher(new URL(path, base))));
      if (responses.some(response => !response.ok)) throw new Error("Could not load all local en-US synthesis resources.");
      const [compressed, tagsText, aText, anText, sorosBytes, romanBytes] = await Promise.all([responses[0].arrayBuffer(), responses[1].text(), responses[2].text(), responses[3].text(), responses[4].arrayBuffer(), responses[5].arrayBuffer()]);
      if (typeof DecompressionStream !== "function" || !globalThis.crypto?.subtle) throw new Error("This runtime cannot verify en-US synthesis resources.");
      const sorosHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", sorosBytes)), byte => byte.toString(16).padStart(2, "0")).join("");
      if (sorosHash !== manifest.soros.sha256) throw new Error("English number synthesis source hash mismatch.");
      const romanHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", romanBytes)), byte => byte.toString(16).padStart(2, "0")).join("");
      if (romanHash !== manifest.soros.romanSha256) throw new Error("English Roman numeral synthesis source hash mismatch.");
      if (!globalThis.CorrectorSorosRuntime?.SorosProgram) throw new Error("The shared LanguageTool .sor runtime is unavailable.");
      const numberProgram = new globalThis.CorrectorSorosRuntime.SorosProgram(new TextDecoder("utf-8", {fatal: true}).decode(sorosBytes), "en-US", "en-US");
      const romanProgram = new globalThis.CorrectorSorosRuntime.SorosProgram(new TextDecoder("utf-8", {fatal: true}).decode(romanBytes), "Roman");
      const payload = new Uint8Array(await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());
      if (payload.byteLength !== manifest.synthesisIndex.rawBytes) throw new Error("English synthesis data has an invalid length.");
      const digest = await crypto.subtle.digest("SHA-256", payload);
      const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
      if (hash !== manifest.synthesisIndex.rawSha256) throw new Error("English synthesis data hash mismatch.");
      const entries = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(payload));
      const tags = tagsText.split(/\r?\n/u).map(value => value.trim()).filter(Boolean);
      return new EnglishSynthesizer(entries, tags, parseWordList(aText), parseWordList(anText), manifest, numberProgram, romanProgram);
    }
  }
  globalThis.CorrectorEnglishSynthesizer = EnglishSynthesizer;
})();
