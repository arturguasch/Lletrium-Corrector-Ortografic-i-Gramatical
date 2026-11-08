/* Experimental drop-in morphology adapter over the locally implemented CFSA2 reader. */
(() => {
  "use strict";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const normalize = value => String(value ?? "").normalize("NFC").replace(/[’ʼ]/gu, "'");

  class CatalanMorphologyCfsa2 {
    constructor(buffer, manifest) {
      if (!(buffer instanceof ArrayBuffer) && !ArrayBuffer.isView(buffer)) throw new TypeError("El diccionari POS CFSA2 ha de ser un buffer binari.");
      if (manifest?.schema !== 1 || manifest?.language !== "ca-ES" || !manifest?.dictionaries?.analysis) throw new Error("Manifest CFSA2 català invàlid.");
      if (typeof globalThis.CorrectorCatalanCfsa2Dictionary !== "function") throw new Error("No s'ha carregat el lector CFSA2.");
      const descriptor = manifest.dictionaries.analysis;
      const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      if (bytes.byteLength !== descriptor.sourceBytes) throw new Error("La mida del diccionari POS CFSA2 no coincideix amb el manifest.");
      this.manifest = descriptor;
      this.dictionary = new globalThis.CorrectorCatalanCfsa2Dictionary(bytes, {
        separator: descriptor.separator,
        encoding: descriptor.encoding,
        encoderType: descriptor.encoder,
      });
      this.rawBytes = bytes.byteLength;
    }

    lookup(form, { lowercaseFallback = true } = {}) {
      const normalized = normalize(form);
      const exact = this.dictionary.lookup(normalized);
      if (exact.length || !lowercaseFallback) return exact;
      const lower = normalized.toLocaleLowerCase("ca");
      return lower === normalized ? exact : this.dictionary.lookup(lower);
    }

    getStats() {
      return { ...this.manifest.counts, rawBytes: this.rawBytes, profile: this.manifest.profile, format: "CFSA2" };
    }

    static async load({ baseUrl, fetcher = globalThis.fetch } = {}) {
      const base = baseUrl || globalThis.chrome?.runtime?.getURL("build/resources/central-cfsa2/");
      if (!base) throw new Error("Cal indicar baseUrl per carregar els recursos fora de l'extensió.");
      const manifestResponse = await fetcher(new URL("resource-index.json", base));
      if (!manifestResponse.ok) throw new Error(`No s'ha pogut carregar el manifest CFSA2 (${manifestResponse.status}).`);
      const manifest = await manifestResponse.json();
      const descriptor = manifest?.dictionaries?.analysis;
      if (manifest?.schema !== 1 || manifest?.language !== "ca-ES" || !descriptor?.file) throw new Error("Manifest CFSA2 català invàlid.");
      const response = await fetcher(new URL(descriptor.file, base));
      if (!response.ok) throw new Error(`No s'ha pogut carregar el diccionari POS CFSA2 (${response.status}).`);
      if (typeof DecompressionStream !== "function") throw new Error("Aquest runtime no pot descomprimir el diccionari CFSA2.");
      const compressed = new Uint8Array(await response.arrayBuffer());
      const compressedHash = await crypto.subtle.digest("SHA-256", compressed);
      const compressedSha256 = Array.from(new Uint8Array(compressedHash), byte => byte.toString(16).padStart(2, "0")).join("");
      if (compressed.byteLength !== descriptor.compressedBytes || compressedSha256 !== descriptor.compressedSha256) throw new Error("El diccionari CFSA2 comprimit no coincideix amb el manifest.");
      const raw = new Uint8Array(await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());
      if (raw.byteLength !== descriptor.sourceBytes) throw new Error("El diccionari CFSA2 descomprimit no coincideix amb la mida declarada.");
      const rawHash = await crypto.subtle.digest("SHA-256", raw);
      const rawSha256 = Array.from(new Uint8Array(rawHash), byte => byte.toString(16).padStart(2, "0")).join("");
      if (rawSha256 !== descriptor.sourceSha256) throw new Error("El hash del diccionari CFSA2 no coincideix amb el manifest.");
      return new CatalanMorphologyCfsa2(raw.buffer, manifest);
    }
  }

  globalThis.CorrectorCatalanMorphologyCfsa2 = CatalanMorphologyCfsa2;
})();
