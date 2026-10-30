/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Independent Spanish es-ES POS index adapter; it never reads Catalan resources. */
(() => {
  "use strict";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const normalize = value => String(value ?? "").normalize("NFC");

  class SpanishMorphology {
    constructor(buffer, manifest) {
      if (!(buffer instanceof ArrayBuffer)) throw new TypeError("El diccionario morfológico español debe ser un ArrayBuffer.");
      if (manifest?.schema !== 1 || manifest?.format !== "CACFSA1" || manifest?.profile !== "es-ES LanguageTool 6.9-SNAPSHOT / spanish-pos-dict 2.5") {
        throw new Error("El índice morfológico no pertenece al perfil independiente es-ES.");
      }
      if (buffer.byteLength !== manifest.rawBytes || decoder.decode(new Uint8Array(buffer, 0, 4)) !== "CFAS") throw new Error("La cabecera o el tamaño del FSA español no coincide con el manifiesto.");
      const view = new DataView(buffer);
      if (view.getUint32(4, true) !== manifest.nodes || view.getUint32(8, true) !== manifest.arcs || buffer.byteLength !== 12 + (manifest.nodes + 1) * 4 + manifest.arcs * 12) throw new Error("Las dimensiones del FSA español no coinciden con el manifiesto.");
      this.graph = { offsets: new Uint32Array(buffer, 12, manifest.nodes + 1), arcs: new Uint32Array(buffer, 12 + (manifest.nodes + 1) * 4, manifest.arcs * 3) };
      this.manifest = manifest;
      this.exactCache = new Map();
      this.manualAdditions = new Map();
      this.manualRemovals = new Map();
      return;
    }

    configureManualTags(data) {
      if (data?.schemaVersion !== 1 || data.profile !== "es-ES" || !Array.isArray(data.additions) || !Array.isArray(data.removals)) {
        throw new Error("El overlay POS manual no pertenece al perfil independiente es-ES.");
      }
      const index = entries => {
        const map = new Map();
        for (const { form, lemma, tag } of entries) {
          if (typeof form !== "string" || typeof lemma !== "string" || typeof tag !== "string" || !form || !tag) throw new Error("Entrada POS manual inválida.");
          const readings = map.get(form) || [];
          readings.push({ form, lemma, tag });
          map.set(form, readings);
        }
        return map;
      };
      this.manualAdditions = index(data.additions);
      this.manualRemovals = index(data.removals);
      this.manualTagDiagnostics = { additions: data.additions.length, removals: data.removals.length, sourceHashes: data.sourceHashes };
    }

    lookup(form, { lowercaseFallback = true } = {}) {
      const normalized = normalize(form);
      const result = this.lookupWithManualTags(normalized);
      return result.length || !lowercaseFallback ? result : this.lookupWithManualTags(normalized.toLocaleLowerCase("es"));
    }

    lookupWithManualTags(form) {
      const result = [
        ...(this.manualAdditions.get(form) || []).map(reading => ({ ...reading, source: "languagetool-manual-addition" })),
        ...this.lookupFsa(form)
      ];
      const removals = new Set((this.manualRemovals.get(form) || []).map(reading => `${reading.lemma}\0${reading.tag}`));
      return result.filter(reading => {
        const exact = `${reading.lemma}\0${reading.tag}`;
        if (removals.has(exact)) return false;
        // LanguageTool's added/removed overlays use POS tags without the
        // trailing Morfologik frequency digit; normalize FSA tags before
        // applying a removal so the overlay targets the intended analysis.
        const normalizedTag = this.manifest.frequencyIncluded && reading.tag?.length > 1
          ? reading.tag.slice(0, -1) : reading.tag;
        return !removals.has(`${reading.lemma}\0${normalizedTag}`);
      });
    }

    lookupFsa(form) {
      if (!form || form.includes("_")) return [];
      const input = new TextEncoder().encode(form), { offsets, arcs } = this.graph;
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
      const separatorArc = findArc(node, 95);
      if (separatorArc < 0 || (arcs[separatorArc * 3 + 1] & 1)) return [];
      const start = arcs[separatorArc * 3 + 2], stack = [{ node: start, bytes: [] }], result = [];
      while (stack.length) {
        const state = stack.pop();
        for (let arc = offsets[state.node + 1] - 1; arc >= offsets[state.node]; arc--) {
          const label = arcs[arc * 3], flags = arcs[arc * 3 + 1], bytes = [...state.bytes, label];
          if (flags & 1) {
            const remove = (bytes[0] - 65) & 255, suffix = bytes.slice(1), keep = remove === 255 ? 0 : Math.max(0, input.length - remove);
            const decoded = new Uint8Array(keep + suffix.length);
            decoded.set(input.subarray(0, keep)); decoded.set(suffix, keep);
            const separator = decoded.indexOf(95);
            if (separator >= 0) result.push({ form, lemma: decoder.decode(decoded.subarray(0, separator)), tag: decoder.decode(decoded.subarray(separator + 1)) });
          }
          if (!(flags & 2)) stack.push({ node: arcs[arc * 3 + 2], bytes });
        }
      }
      return result;
    }

    hasForm(form) {
      const value = normalize(form);
      if (!value || value.includes("_")) return false;
      if (this.exactCache.has(value)) return this.exactCache.get(value);
      const input = new TextEncoder().encode(value), { offsets, arcs } = this.graph;
      let node = 0;
      for (const label of input) {
        let found = -1;
        for (let arc = offsets[node]; arc < offsets[node + 1]; arc++) if (arcs[arc * 3] === label) { found = arc; break; }
        if (found < 0 || (arcs[found * 3 + 1] & 2)) { this.exactCache.set(value, false); return false; }
        node = arcs[found * 3 + 2];
      }
      for (let arc = offsets[node]; arc < offsets[node + 1]; arc++) if (arcs[arc * 3] === this.manifest.separator) {
        this.exactCache.set(value, true);
        if (this.exactCache.size > 20000) this.exactCache.delete(this.exactCache.keys().next().value);
        return true;
      }
      this.exactCache.set(value, false);
      if (this.exactCache.size > 20000) this.exactCache.delete(this.exactCache.keys().next().value);
      return false;
    }

    areEquivalentSuggestionChars(left, right) {
      if (left === right) return true;
      if (this.manifest.equivalentChars?.[left]?.includes(right)) return true;
      if (this.manifest.ignoreDiacritics) {
        const strip = value => value.normalize("NFD").replace(/\p{M}/gu, "");
        if (strip(left).toLocaleLowerCase("es") === strip(right).toLocaleLowerCase("es")) return true;
      }
      return false;
    }

    getReplacementQueries(word, limit = 16) {
      const pairs = Object.entries(this.manifest.replacementPairs || {})
        .map(([rawSource, targets]) => ({
          source: rawSource.replace(/^\^|\$$/gu, ""),
          start: rawSource.startsWith("^"),
          end: rawSource.endsWith("$"),
          // Morfologik handles one and two character replacement targets inside
          // its Oflazer traversal. LanguageTool expands only longer targets here.
          targets: (targets || []).filter(target => [...target].length > 2)
        }))
        .filter(pair => pair.source && pair.targets.length);
      const result = [];
      const seen = new Set();
      const add = value => {
        if (value !== word && !seen.has(value) && result.length < limit) {
          seen.add(value);
          result.push(value);
        }
      };
      const visit = (current, fromIndex, level) => {
        if (result.length >= limit) return;
        if (level > 6) { add(current); return; }
        let selected = null;
        for (const pair of pairs) {
          if (pair.start && fromIndex > 0) continue;
          let index;
          if (pair.start) index = current.startsWith(pair.source) ? 0 : -1;
          else if (pair.end) {
            const expected = current.length - pair.source.length;
            index = expected >= fromIndex && current.startsWith(pair.source, expected) ? expected : -1;
          } else index = current.indexOf(pair.source, fromIndex);
          if (index < 0) continue;
          if (!selected || index < selected.index || (index === selected.index && pair.source.length >= selected.pair.source.length)) {
            selected = { index, pair };
          }
        }
        if (!selected) { add(current); return; }
        const { index, pair } = selected;
        visit(current, index + pair.source.length, level + 1);
        for (const target of pair.targets) {
          if (result.length >= limit) return;
          const nearbyTarget = current.indexOf(target, Math.max(0, fromIndex - target.length + 1));
          if (target.length > pair.source.length && nearbyTarget > -1
            && (nearbyTarget === index || nearbyTarget === index - target.length + 1)) continue;
          const replaced = current.slice(0, index) + target + current.slice(index + pair.source.length);
          visit(replaced, index + target.length, level + 1);
        }
      };
      visit(String(word), 0, 0);
      return result;
    }

    getEditReplacementQueries(word, limit = 64) {
      const result = new Map();
      for (const [rawSource, targets] of Object.entries(this.manifest.replacementPairs || {})) {
        const start = rawSource.startsWith("^");
        const end = rawSource.endsWith("$");
        const source = rawSource.replace(/^\^|\$$/gu, "");
        if (!source) continue;
        const positions = [];
        if (start) { if (word.startsWith(source)) positions.push(0); }
        else {
          let position = word.indexOf(source);
          while (position >= 0) { positions.push(position); position = word.indexOf(source, position + 1); }
        }
        for (const position of positions) {
          if (end && position + source.length !== word.length) continue;
          for (const target of targets || []) {
            if ([...target].length > 2) continue;
            const candidate = word.slice(0, position) + target + word.slice(position + source.length);
            if (candidate !== word) {
              // Exact transformed forms are zero-distance replacements. If the
              // transform itself is not a dictionary form, retain one edit for
              // the smaller Oflazer replacement search around that variant.
              const cost = this.hasForm(candidate) ? 0 : 1;
              if (!result.has(candidate) || cost < result.get(candidate)) result.set(candidate, cost);
            }
            if (result.size >= limit) return [...result].map(([text, cost]) => ({ text, cost }));
          }
        }
      }
      return [...result].map(([text, cost]) => ({ text, cost }));
    }

    suggestForms(word, { maxDistance = 2, maxResults = 12000 } = {}) {
      const target = [...normalize(word).toLocaleLowerCase("es")];
      if (!target.length || target.length > 32 || !Number.isInteger(maxDistance) || maxDistance < 1 || maxDistance > 3) return [];
      const { offsets, arcs } = this.graph, found = new Set();
      const decode = bytes => decoder.decode(Uint8Array.from(bytes));
      const original = target.join("");
      const queries = [
        { text: original, cost: 0 },
        ...this.getReplacementQueries(original, 14).map(text => ({ text, cost: 0 })),
        ...this.getEditReplacementQueries(original).map(({ text, cost }) => ({ text, cost }))
      ];
      for (const query of queries) {
        const searchTarget = [...query.text];
        const remainingDistance = maxDistance - query.cost;
        if (remainingDistance < 0 || Math.abs(searchTarget.length - target.length) > maxDistance) continue;
        const stack = [{ node: 0, form: "", pending: [], expected: 0, row: Array.from({ length: searchTarget.length + 1 }, (_, index) => index), previousRow: null, previousChar: "" }];
        while (stack.length && found.size < maxResults) {
        const state = stack.pop();
        for (let arc = offsets[state.node + 1] - 1; arc >= offsets[state.node]; arc--) {
          const label = arcs[arc * 3], flags = arcs[arc * 3 + 1], nextNode = arcs[arc * 3 + 2];
          if (label === this.manifest.separator) {
            if (!state.pending.length && state.form && state.row[searchTarget.length] <= remainingDistance) found.add(state.form);
            continue;
          }
          let pending, expected, form = state.form, row = state.row, previousRow = state.previousRow, previousChar = state.previousChar;
          if (!state.pending.length) {
            expected = label < 0x80 ? 1 : label >= 0xF0 ? 4 : label >= 0xE0 ? 3 : 2;
            pending = expected === 1 ? [] : [label];
            if (expected === 1) {
              const rawChar = String.fromCharCode(label), nextChar = rawChar.toLocaleLowerCase("es");
              const nextRow = [state.row[0] + 1];
              for (let column = 1; column <= searchTarget.length; column++) {
              let cost = Math.min(state.row[column] + 1, nextRow[column - 1] + 1, state.row[column - 1] + (this.areEquivalentSuggestionChars(searchTarget[column - 1], nextChar) ? 0 : 1));
              if (previousChar && column > 1 && nextChar === searchTarget[column - 2] && previousChar === searchTarget[column - 1] && state.previousRow) cost = Math.min(cost, state.previousRow[column - 2] + 1);
                nextRow[column] = cost;
              }
              if (Math.min(...nextRow) > remainingDistance || [...form, nextChar].length > searchTarget.length + remainingDistance) continue;
              form += rawChar; previousRow = state.row; row = nextRow; previousChar = nextChar; expected = 0;
            }
          } else {
            pending = [...state.pending, label]; expected = state.expected;
            if (pending.length === expected) {
              const rawChar = decode(pending), nextChar = rawChar.toLocaleLowerCase("es");
              const nextRow = [state.row[0] + 1];
              for (let column = 1; column <= searchTarget.length; column++) {
                let cost = Math.min(state.row[column] + 1, nextRow[column - 1] + 1, state.row[column - 1] + (this.areEquivalentSuggestionChars(searchTarget[column - 1], nextChar) ? 0 : 1));
                if (previousChar && column > 1 && nextChar === searchTarget[column - 2] && previousChar === searchTarget[column - 1] && state.previousRow) cost = Math.min(cost, state.previousRow[column - 2] + 1);
                nextRow[column] = cost;
              }
              if (Math.min(...nextRow) > remainingDistance || [...form, nextChar].length > searchTarget.length + remainingDistance) continue;
              form += rawChar; previousRow = state.row; row = nextRow; previousChar = nextChar; pending = []; expected = 0;
            }
          }
          if (flags & 2) continue;
          stack.push({ node: nextNode, form, pending, expected, row, previousRow, previousChar });
        }
        }
      }
      return [...found];
    }

    getStats() {
      return { forms: this.manifest.forms, lemmas: this.manifest.lemmas, readings: this.manifest.readings, rawBytes: this.manifest.rawBytes, compressedBytes: this.manifest.compressedBytes, profile: "es-ES", storage: "morfologik-fsa", ...(this.manualTagDiagnostics ? { manualTags: this.manualTagDiagnostics } : {}) };
    }

    static async load({ baseUrl, fetcher = globalThis.fetch } = {}) {
      const base = baseUrl || globalThis.chrome?.runtime?.getURL("build/resources/es-ES/");
      if (!base) throw new Error("Se debe indicar baseUrl para cargar los recursos españoles fuera de la extensión.");
      const manifestResponse = await fetcher(new URL("manifest.json", base));
      if (!manifestResponse.ok) throw new Error(`No se pudo cargar el manifiesto POS español (${manifestResponse.status}).`);
      const manifest = await manifestResponse.json();
      if (manifest?.profile !== "es-ES LanguageTool 6.9-SNAPSHOT / spanish-pos-dict 2.5" || manifest.format !== "CACFSA1") throw new Error("El manifiesto no corresponde al perfil español independiente.");
      const dataResponse = await fetcher(new URL(manifest.dataFile, base));
      if (!dataResponse.ok) throw new Error(`No se pudo cargar el diccionario POS español (${dataResponse.status}).`);
      if (typeof DecompressionStream !== "function") throw new Error("Este runtime no puede descomprimir los recursos POS españoles.");
      const expected = Number(manifest.rawBytes);
      if (!Number.isSafeInteger(expected) || expected <= 8) throw new Error("Tamaño declarado del diccionario POS español inválido.");
      const bytes = new Uint8Array(expected), reader = dataResponse.body.pipeThrough(new DecompressionStream("gzip")).getReader();
      let offset = 0;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (offset + value.byteLength > expected) throw new Error("El diccionario POS español descomprimido supera el tamaño declarado.");
          bytes.set(value, offset);
          offset += value.byteLength;
        }
      } finally { reader.releaseLock(); }
      if (offset !== expected) throw new Error("El diccionario POS español está truncado.");
      if (!globalThis.crypto?.subtle) throw new Error("WebCrypto no está disponible para verificar el índice español.");
      const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes.buffer);
      const actualHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
      if (actualHash !== manifest.rawSha256) throw new Error("El hash SHA-256 del índice POS español no coincide.");
      return new SpanishMorphology(bytes.buffer, manifest);
    }
  }

  globalThis.CorrectorSpanishMorphology = SpanishMorphology;
})();
