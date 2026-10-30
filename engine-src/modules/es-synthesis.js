/* Compact es-ES Morfologik synthesis adapter based on LanguageTool's SpanishSynthesizer. */
(() => {
  "use strict";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const encoder = new TextEncoder();
  const normalize = value => String(value ?? "").normalize("NFC");

  class SpanishSynthesizer {
    constructor(buffer, manifest, tags = []) {
      if (!(buffer instanceof ArrayBuffer) || manifest?.schema !== 1 || manifest?.format !== "CACFSA1" || manifest?.profile !== "es-ES LanguageTool 6.9-SNAPSHOT / spanish-pos-dict 2.5") throw new Error("El FSA de síntesis no pertenece al perfil independiente es-ES.");
      const view = new DataView(buffer);
      if (buffer.byteLength !== manifest.rawBytes || decoder.decode(new Uint8Array(buffer, 0, 4)) !== "CFAS" || view.getUint32(4, true) !== manifest.nodes || view.getUint32(8, true) !== manifest.arcs || buffer.byteLength !== 12 + (manifest.nodes + 1) * 4 + manifest.arcs * 12) throw new Error("El FSA de síntesis español tiene una cabecera o dimensiones incorrectas.");
      this.graph = { offsets: new Uint32Array(buffer, 12, manifest.nodes + 1), arcs: new Uint32Array(buffer, 12 + (manifest.nodes + 1) * 4, manifest.arcs * 3) };
      this.manifest = manifest;
      this.tags = tags;
    }

    lookup(key) {
      const input = encoder.encode(normalize(key)), { offsets, arcs } = this.graph;
      const findArc = (node, label) => {
        for (let arc = offsets[node]; arc < offsets[node + 1]; arc++) if (arcs[arc * 3] === label) return arc;
        return -1;
      };
      let node = 0;
      for (const label of input) {
        const arc = findArc(node, label);
        if (arc < 0 || (arcs[arc * 3 + 1] & 2)) return [];
        node = arcs[arc * 3 + 2];
      }
      const delimiterArc = findArc(node, this.manifest.separator);
      if (delimiterArc < 0 || (arcs[delimiterArc * 3 + 1] & 1)) return [];
      const stack = [{ node: arcs[delimiterArc * 3 + 2], bytes: [] }], forms = [];
      while (stack.length) {
        const state = stack.pop();
        if (state.arc != null) {
          const label = arcs[state.arc * 3], flags = arcs[state.arc * 3 + 1], bytes = [...state.bytes, label];
          if (flags & 1) {
            const removed = (bytes[0] - 65) & 255, keep = removed === 255 ? 0 : Math.max(0, input.length - removed);
            const decoded = new Uint8Array(keep + bytes.length - 1);
            decoded.set(input.subarray(0, keep)); decoded.set(bytes.slice(1), keep);
            forms.push(decoder.decode(decoded));
          }
          if (!(flags & 2)) stack.push({ node: arcs[state.arc * 3 + 2], bytes });
          continue;
        }
        for (let arc = offsets[state.node + 1] - 1; arc >= offsets[state.node]; arc--) stack.push({ arc, bytes: state.bytes });
      }
      return forms;
    }

    synthesize(token, posTag, posTagRegExp = false) {
      const rawLemma = normalize(token?.lemma ?? token), trailing = /^([^ ]+) (.+)$/u.exec(rawLemma);
      const verbLemma = String(posTag ?? "").startsWith("V") && trailing ? trailing[1] : rawLemma;
      const after = verbLemma === rawLemma ? "" : trailing[2];
      let tags;
      if (posTagRegExp) {
        let regex;
        try { regex = new RegExp(`^(?:${posTag})$`, "u"); }
        catch { return null; }
        tags = this.tags.filter(tag => regex.test(tag));
      } else tags = [String(posTag ?? "")];
      const output = [], seen = new Set();
      for (const tag of tags) for (const form of this.lookup(`${verbLemma}|${tag}`)) {
        const value = after ? `${form} ${after}` : form;
        if (!seen.has(value)) { seen.add(value); output.push(value); }
      }
      return output;
    }

    getTargetPosTag(posTags, fallback = "") {
      if (!posTags.length) return fallback;
      const values = posTags.slice();
      values.sort((left, right) => {
        if (left.length > 4 && right.length > 4) {
          if (left === "VMIP3S0" && right === "VMM02S0") return 150;
          if (left === "VMM02S0" && right === "VMIP3S0") return -150;
        }
        return 0;
      });
      return values.at(-1) ?? fallback;
    }

    static async load({ baseUrl, fetcher = globalThis.fetch } = {}) {
      const base = baseUrl || globalThis.chrome?.runtime?.getURL("build/resources/es-ES/");
      if (!base) throw new Error("Se debe indicar baseUrl para cargar los recursos de síntesis española.");
      const manifestResponse = await fetcher(new URL("synthesis-manifest.json", base));
      if (!manifestResponse.ok) throw new Error(`No se pudo cargar el manifiesto de síntesis español (${manifestResponse.status}).`);
      const manifest = await manifestResponse.json();
      if (manifest?.profile !== "es-ES LanguageTool 6.9-SNAPSHOT / spanish-pos-dict 2.5" || manifest?.format !== "CACFSA1") throw new Error("El manifiesto no corresponde a la síntesis independiente es-ES.");
      const [graphResponse, tagsResponse] = await Promise.all([fetcher(new URL(manifest.dataFile, base)), fetcher(new URL("es-ES-tags.txt", base))]);
      if (!graphResponse.ok || !tagsResponse.ok || typeof DecompressionStream !== "function" || !globalThis.crypto?.subtle) throw new Error("No se pudieron cargar los recursos locales de síntesis española.");
      const raw = new Uint8Array(manifest.rawBytes), reader = graphResponse.body.pipeThrough(new DecompressionStream("gzip")).getReader();
      let offset = 0;
      try { while (true) { const { value, done } = await reader.read(); if (done) break; if (offset + value.length > raw.length) throw new Error("El FSA de síntesis supera el tamaño declarado."); raw.set(value, offset); offset += value.length; } }
      finally { reader.releaseLock(); }
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", raw)), byte => byte.toString(16).padStart(2, "0")).join("");
      if (offset !== raw.length || hash !== manifest.rawSha256) throw new Error("El FSA de síntesis español está truncado o su hash no coincide.");
      return new SpanishSynthesizer(raw.buffer, manifest, (await tagsResponse.text()).split(/\r?\n/u).filter(Boolean));
    }
  }
  globalThis.CorrectorSpanishSynthesizer = SpanishSynthesizer;
})();
