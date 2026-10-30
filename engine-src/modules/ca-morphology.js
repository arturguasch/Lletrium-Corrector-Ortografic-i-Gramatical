/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Read-only POS index adapter. Data format CACPOS1; source and filters in resource manifest. */
(() => {
  "use strict";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const normalize = value => String(value ?? "").normalize("NFC").replace(/[’ʼ]/gu, "'");

  class CatalanMorphology {
    constructor(buffer, manifest) {
      if (!(buffer instanceof ArrayBuffer)) throw new TypeError("El diccionari POS ha de ser un ArrayBuffer.");
      if (manifest?.schema !== 1 || manifest?.format !== "CACPOS1") throw new Error("Format del diccionari POS desconegut.");
      if (buffer.byteLength !== manifest.rawBytes || decoder.decode(new Uint8Array(buffer, 0, 8)) !== "CACPOS1\0") {
        throw new Error("La mida o la capçalera del diccionari POS no coincideix amb el manifest.");
      }
      this.buffer = buffer;
      this.manifest = manifest;
      this.sections = {};
      for (const [name, section] of Object.entries(manifest.sections)) {
        const width = section.type === "u32" ? 4 : section.type === "bytes" ? 1 : 0;
        if (!width || section.offset < 8 || section.offset + section.length * width > buffer.byteLength || (width === 4 && section.offset % 4)) {
          throw new Error(`Secció POS invàlida: ${name}`);
        }
        this.sections[name] = width === 4
          ? new Uint32Array(buffer, section.offset, section.length)
          : new Uint8Array(buffer, section.offset, section.length);
      }
      this.validateSections();
    }

    validateSections() {
      const required = ["formsOffsets", "formsBytes", "lemmasOffsets", "lemmasBytes", "tagsOffsets", "tagsBytes", "formReadingOffsets", "readings", "lemmaReadingOffsets", "lemmaReadingIds"];
      for (const name of required) if (!this.sections[name]) throw new Error(`Falta la secció POS ${name}`);
      if (this.sections.formsOffsets.length !== this.manifest.counts.forms + 1 || this.sections.formReadingOffsets.length !== this.manifest.counts.forms + 1) {
        throw new Error("Recompte de formes POS incompatible amb el manifest.");
      }
      if (this.sections.lemmasOffsets.length !== this.manifest.counts.lemmas + 1 || this.sections.lemmaReadingOffsets.length !== this.manifest.counts.lemmas + 1) {
        throw new Error("Recompte de lemes POS incompatible amb el manifest.");
      }
      if (this.sections.readings.length !== this.manifest.counts.readings * 2) throw new Error("Recompte de lectures POS incompatible amb el manifest.");
      if (this.sections.lemmaReadingIds.length !== this.manifest.counts.readings) throw new Error("Recompte de lectures inverses POS incompatible amb el manifest.");
      if (this.sections.formReadingOffsets[this.sections.formReadingOffsets.length - 1] !== this.manifest.counts.readings || this.sections.lemmaReadingOffsets[this.sections.lemmaReadingOffsets.length - 1] !== this.manifest.counts.readings) {
        throw new Error("Els índexs de lectures POS no cobreixen les lectures declarades.");
      }
    }

    string(table, id) {
      const offsets = this.sections[`${table}Offsets`];
      const bytes = this.sections[`${table}Bytes`];
      if (!offsets || !bytes || id < 0 || id >= offsets.length - 1) return "";
      return decoder.decode(bytes.subarray(offsets[id], offsets[id + 1]));
    }

    findForm(value) {
      const target = normalize(value);
      const offsets = this.sections.formsOffsets;
      let low = 0, high = offsets.length - 2;
      while (low <= high) {
        const middle = (low + high) >>> 1;
        const candidate = this.string("forms", middle);
        if (candidate === target) return middle;
        if (candidate < target) low = middle + 1;
        else high = middle - 1;
      }
      return -1;
    }

    lookup(form, { lowercaseFallback = true } = {}) {
      const normalized = normalize(form);
      let id = this.findForm(normalized);
      if (id < 0 && lowercaseFallback) id = this.findForm(normalized.toLocaleLowerCase("ca"));
      if (id < 0) return [];
      const rows = this.sections.readings;
      const ranges = this.sections.formReadingOffsets;
      const result = [];
      for (let row = ranges[id]; row < ranges[id + 1]; row++) {
        const lemmaId = rows[row * 2];
        const tagId = rows[row * 2 + 1];
        result.push({ form: this.string("forms", id), lemma: this.string("lemmas", lemmaId), tag: this.string("tags", tagId) });
      }
      return result;
    }

    getStats() {
      return { ...this.manifest.counts, rawBytes: this.buffer.byteLength, profile: this.manifest.profile };
    }

    static async load({ baseUrl, fetcher = globalThis.fetch } = {}) {
      const base = baseUrl || globalThis.chrome?.runtime?.getURL("build/resources/central/");
      if (!base) throw new Error("Cal indicar baseUrl per carregar els recursos fora de l'extensió.");
      const manifestResponse = await fetcher(new URL("manifest.json", base));
      if (!manifestResponse.ok) throw new Error(`No s'ha pogut carregar el manifest POS (${manifestResponse.status}).`);
      const manifest = await manifestResponse.json();
      const dataResponse = await fetcher(new URL(manifest.dataFile, base));
      if (!dataResponse.ok) throw new Error(`No s'ha pogut carregar el diccionari POS (${dataResponse.status}).`);
      if (typeof DecompressionStream !== "function") throw new Error("Aquest runtime no pot descomprimir els recursos POS.");

      const expected = Number(manifest.rawBytes);
      if (!Number.isSafeInteger(expected) || expected <= 8) throw new Error("Mida declarada del diccionari POS invàlida.");
      const bytes = new Uint8Array(expected);
      const reader = dataResponse.body.pipeThrough(new DecompressionStream("gzip")).getReader();
      let offset = 0;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (offset + value.byteLength > expected) throw new Error("El diccionari POS descomprimit supera la mida declarada.");
          bytes.set(value, offset);
          offset += value.byteLength;
        }
      } finally {
        reader.releaseLock();
      }
      if (offset !== expected) throw new Error("El diccionari POS està truncat.");
      if (!globalThis.crypto?.subtle) throw new Error("WebCrypto no està disponible per verificar el diccionari POS.");
      const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes.buffer);
      const actualHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
      if (actualHash !== manifest.rawSha256) throw new Error("El hash SHA-256 del diccionari POS no coincideix.");
      return new CatalanMorphology(bytes.buffer, manifest);
    }
  }

  globalThis.CorrectorCatalanMorphology = CatalanMorphology;
})();
