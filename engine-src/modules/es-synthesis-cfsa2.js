/* Experimental es-ES synthesis adapter over the same lossless Morfologik CFSA2 reader. */
(() => {
  "use strict";
  const Base = globalThis.CorrectorSpanishSynthesizer;
  const sha256 = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), byte => byte.toString(16).padStart(2, "0")).join("");

  class SpanishSynthesizerCfsa2 {
    constructor(dictionary, manifest, tags = []) {
      if (!Base || !(dictionary instanceof globalThis.CorrectorCatalanCfsa2Dictionary)
          || manifest?.schema !== 1 || manifest?.format !== "CFSA2"
          || manifest?.profile !== "es-ES LanguageTool 6.9-SNAPSHOT / spanish-pos-dict 2.5") {
        throw new Error("El diccionario de síntesis CFSA2 no corresponde al perfil es-ES.");
      }
      this.dictionary = dictionary;
      this.manifest = manifest;
      this.tags = tags;
      this.lookupCache = new Map();
      this.synthesisCache = new Map();
    }

    lookup(key) {
      const normalized = String(key).normalize("NFC");
      if (this.lookupCache.has(normalized)) return this.lookupCache.get(normalized).slice();
      const value = this.dictionary.lookup(normalized).map(({ lemma }) => lemma);
      if (this.lookupCache.size >= 12000) this.lookupCache.delete(this.lookupCache.keys().next().value);
      this.lookupCache.set(normalized, value);
      return value.slice();
    }

    synthesize(token, posTag, posTagRegExp = false) {
      const cacheKey = `${String(token?.lemma ?? token).normalize("NFC")}\u0000${String(posTag ?? "")}\u0000${posTagRegExp ? 1 : 0}`;
      if (this.synthesisCache.has(cacheKey)) return this.synthesisCache.get(cacheKey).slice();
      const value = Base.prototype.synthesize.call(this, token, posTag, posTagRegExp);
      if (this.synthesisCache.size >= 12000) this.synthesisCache.delete(this.synthesisCache.keys().next().value);
      this.synthesisCache.set(cacheKey, value);
      return value?.slice() ?? value;
    }

    getStats() {
      return { keys: this.manifest.keys, forms: this.manifest.forms, rawBytes: this.manifest.rawBytes,
        compressedBytes: this.manifest.compressedBytes, profile: "es-ES", storage: "morfologik-cfsa2" };
    }

    static async load({ baseUrl, fetcher = globalThis.fetch } = {}) {
      const base = baseUrl || globalThis.chrome?.runtime?.getURL("build/resources/es-ES/");
      if (!base) throw new Error("Se debe indicar baseUrl para cargar los recursos de síntesis española.");
      const manifestResponse = await fetcher(new URL("synthesis-manifest.json", base));
      if (!manifestResponse.ok) throw new Error(`No se pudo cargar el manifiesto de síntesis español (${manifestResponse.status}).`);
      const manifest = await manifestResponse.json();
      if (manifest?.profile !== "es-ES LanguageTool 6.9-SNAPSHOT / spanish-pos-dict 2.5" || manifest.format !== "CFSA2") {
        throw new Error("El manifiesto no corresponde a la síntesis independiente es-ES CFSA2.");
      }
      const [dataResponse, tagsResponse] = await Promise.all([
        fetcher(new URL(manifest.dataFile, base)), fetcher(new URL("es-ES-tags.txt", base)),
      ]);
      if (!dataResponse.ok || !tagsResponse.ok || typeof DecompressionStream !== "function" || !globalThis.crypto?.subtle) {
        throw new Error("No se pudieron cargar los recursos locales CFSA2 de síntesis española.");
      }
      const compressed = new Uint8Array(await dataResponse.arrayBuffer());
      if (compressed.byteLength !== manifest.compressedBytes || await sha256(compressed) !== manifest.compressedSha256) {
        throw new Error("El diccionario de síntesis CFSA2 español comprimido no coincide con el manifiesto.");
      }
      const raw = new Uint8Array(await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());
      if (raw.byteLength !== manifest.rawBytes || await sha256(raw) !== manifest.rawSha256) {
        throw new Error("El diccionario de síntesis CFSA2 español está truncado o su hash no coincide.");
      }
      const dictionary = new globalThis.CorrectorCatalanCfsa2Dictionary(raw, { separator: "_", encoding: "utf-8", encoderType: "SUFFIX" });
      return new SpanishSynthesizerCfsa2(dictionary, manifest, (await tagsResponse.text()).split(/\r?\n/u).filter(Boolean));
    }
  }

  Object.setPrototypeOf(SpanishSynthesizerCfsa2.prototype, Base.prototype);
  globalThis.CorrectorSpanishSynthesizer = SpanishSynthesizerCfsa2;
})();
