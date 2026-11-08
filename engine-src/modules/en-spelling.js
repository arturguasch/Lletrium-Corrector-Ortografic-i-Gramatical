/* Local en-US Morfologik spelling using the pinned LanguageTool dictionary FSA. */
(() => {
  "use strict";
  const encoder = new TextEncoder(), decoder = new TextDecoder("utf-8", { fatal: true });
  const codepointLength = first => first < 0x80 ? 1 : first >= 0xc2 && first < 0xe0 ? 2 : first < 0xf0 ? 3 : 4;

  class EnglishSpeller {
    constructor(buffer, manifest) {
      if (!(buffer instanceof ArrayBuffer) || manifest?.schema !== 1 || !["CFAS1", "CFSA2"].includes(manifest?.format)
          || manifest?.profile !== "en-US LanguageTool 6.9-SNAPSHOT / english-pos-dict 0.6"
          || !Number.isInteger(manifest.separator)) throw new Error("The spelling graph does not belong to the pinned English dictionaries.");
      this.cfsa2 = null;
      if (manifest.format === "CFSA2") {
        if (manifest.encoding !== "utf-8" || manifest.sequenceEncoder !== "SUFFIX"
            || !globalThis.CorrectorCatalanCfsa2Dictionary) throw new Error("The English CFSA2 spelling reader is unavailable or incompatible.");
        this.cfsa2 = new globalThis.CorrectorCatalanCfsa2Dictionary(buffer, {
          separator: String.fromCodePoint(manifest.separator), encoding: manifest.encoding, encoderType: manifest.sequenceEncoder
        });
        this.root = this.cfsa2.root;
      } else {
        const view = new DataView(buffer);
        if (decoder.decode(new Uint8Array(buffer, 0, 4)) !== "CFAS" || view.getUint32(4, true) !== manifest.nodes || view.getUint32(8, true) !== manifest.arcs || buffer.byteLength !== 12 + (manifest.nodes + 1) * 4 + manifest.arcs * 12) throw new Error("The en-US spelling FSA header or dimensions are invalid.");
        this.graph = { offsets: new Uint32Array(buffer, 12, manifest.nodes + 1), arcs: new Uint32Array(buffer, 12 + (manifest.nodes + 1) * 4, manifest.arcs * 3) };
        this.root = 0;
      }
      this.manifest = manifest; this.cache = new Map(); this.characterCache = new Map(); this.frequencyCache = new Map();
      this.one = new Map(); this.two = new Map(); this.rest = new Map();
      for (const [source, targets] of Object.entries(manifest.replacementPairs || {})) for (const target of targets) {
        if (target.length <= 2) {
          const map = target.length === 1 ? this.one : this.two;
          (map.get(target) || map.set(target, []).get(target)).push({source: source.replace(/^\^|\$$/gu, ""), start: source.startsWith("^"), end: source.endsWith("$")});
        } else (this.rest.get(source) || this.rest.set(source, []).get(source)).push(target);
      }
    }

    *outgoing(node) {
      if (this.cfsa2) { for (let arc = this.cfsa2.firstArc(node); arc !== 0; arc = this.cfsa2.nextArc(arc)) yield arc; return; }
      for (let arc = this.graph.offsets[node]; arc < this.graph.offsets[node + 1]; arc++) yield arc;
    }
    label(arc) { return this.cfsa2 ? this.cfsa2.arcLabel(arc) : this.graph.arcs[arc * 3]; }
    getArc(node, label) {
      if (this.cfsa2) { const arc = this.cfsa2.findArc(node, label); return arc === 0 ? -1 : arc; }
      for (let arc = this.graph.offsets[node]; arc < this.graph.offsets[node + 1]; arc++) if (this.label(arc) === label) return arc;
      return -1;
    }
    next(arc) { return this.cfsa2 ? (this.cfsa2.isTerminal(arc) ? -1 : this.cfsa2.destinationNode(arc)) : this.graph.arcs[arc * 3 + 2]; }
    terminal(arc) { return this.cfsa2 ? this.cfsa2.isTerminal(arc) : Boolean(this.graph.arcs[arc * 3 + 1] & 2); }
    final(arc) { return this.cfsa2 ? this.cfsa2.isFinal(arc) : Boolean(this.graph.arcs[arc * 3 + 1] & 1); }

    exact(word) {
      let node = this.root; const bytes = encoder.encode(String(word));
      let lastArc = -1;
      for (let index = 0; index < bytes.length; index++) {
        const arc = this.getArc(node, bytes[index]);
        if (arc < 0) return false;
        lastArc = arc;
        if (this.terminal(arc)) { if (index !== bytes.length - 1) return false; node = -1; }
        else node = this.next(arc);
      }
      // Morfologik can encode a final word as a terminal final character arc,
      // or as a separator arc followed by its frequency payload. Accept both.
      if (lastArc < 0) return false;
      // English en_US CFSA2 entries always store a word followed by its
      // separator and frequency payload. An FSA final arc can mark a longer
      // encoded key, so it is not sufficient evidence that the word is valid.
      return this.cfsa2
        ? node >= 0 && this.getArc(node, this.manifest.separator) >= 0
        : this.final(lastArc) || node >= 0 && this.getArc(node, this.manifest.separator) >= 0;
    }

    isMisspelled(word, { personalWords = null } = {}) {
      const value = String(word ?? "").normalize("NFC"), flags = this.manifest.spellerFlags;
      if (!value || personalWords?.has(value.toLocaleLowerCase("en"))) return false;
      const letters = [...value].filter(char => /[\p{L}\p{Nl}]/u.test(char));
      const alphabetic = [...value].length !== 1 || letters.length > 0;
      if (flags.ignorePunctuation && !alphabetic) return false;
      if (flags.ignoreNumbers && /\p{Nd}/u.test(value)) return false;
      const allUpper = letters.length > 0 && letters.every(char => char === char.toLocaleUpperCase("en"));
      const mixed = globalThis.CorrectorEnglishTagger.isMixedCase(value);
      if (flags.ignoreAllUppercase && alphabetic && allUpper) return false;
      if (this.exact(value)) return false;
      if (!flags.convertCase || mixed) return true;
      if (this.exact(value.toLocaleLowerCase("en"))) return false;
      const chars = [...value];
      if (allUpper && this.exact(chars[0] + chars.slice(1).join("").toLocaleLowerCase("en"))) return false;
      return true;
    }

    frequency(node) {
      if (this.frequencyCache.has(node)) return this.frequencyCache.get(node);
      if (this.manifest.frequencyIncluded === false) { this.frequencyCache.set(node, 0); return 0; }
      const separatorArc = this.getArc(node, this.manifest.separator);
      if (separatorArc < 0 || this.final(separatorArc) || this.terminal(separatorArc)) { this.frequencyCache.set(node, 0); return 0; }
      let current = this.next(separatorArc);
      let result = 0;
      while (current >= 0) {
        const arc = this.outgoing(current).next().value;
        if (arc == null) break;
        if (this.final(arc)) { result = Math.max(0, this.label(arc) - 65); break; }
        if (this.terminal(arc)) break;
        current = this.next(arc);
      }
      this.frequencyCache.set(node, result); return result;
    }

    characterTransitions(startNode) {
      if (this.characterCache.has(startNode)) return this.characterCache.get(startNode);
      const transitions = [];
      const walk = (node, bytes, firstArc) => {
        for (const arc of this.outgoing(node)) {
          const label = this.label(arc);
          if (!bytes.length && label === this.manifest.separator) continue;
          const sequence = [...bytes, label], length = codepointLength(sequence[0]);
          if (sequence.length < length) {
            if (!this.terminal(arc)) walk(this.next(arc), sequence, firstArc < 0 ? arc : firstArc);
            continue;
          }
          if (sequence.length !== length) continue;
          try {
            const char = decoder.decode(new Uint8Array(sequence));
            const target = this.terminal(arc) ? -1 : this.next(arc);
            transitions.push({ char, target, terminal: this.terminal(arc), final: this.cfsa2
              ? target >= 0 && this.getArc(target, this.manifest.separator) >= 0
              : this.final(arc) || target >= 0 && this.getArc(target, this.manifest.separator) >= 0,
              frequency: target >= 0 ? this.frequency(target) : 0 });
          } catch { /* invalid UTF-8 arc sequences cannot be dictionary characters */ }
        }
      };
      walk(startNode, [], -1);
      this.characterCache.set(startNode, transitions); return transitions;
    }

    replaceVariants(value, from = 0, depth = 0) {
      if (depth > 6) return [value];
      let best = 120, key = "", length = 0;
      for (const candidate of this.rest.keys()) {
        const start = candidate.startsWith("^"), end = candidate.endsWith("$"), bare = candidate.replace(/^\^|\$$/gu, "");
        const index = start ? (from > 0 ? -1 : value.startsWith(bare) ? 0 : -1)
          : end ? (value.length - bare.length >= from && value.endsWith(bare) ? value.length - bare.length : -1) : value.indexOf(candidate, from);
        if (index >= 0 && (index < best || index === best && bare.length >= length)) { best = index; key = candidate; length = bare.length; }
      }
      if (best >= 120) return [value];
      const output = this.replaceVariants(value, best + length, depth + 1);
      for (const target of this.rest.get(key)) {
        const index = value.indexOf(target, Math.max(0, from - target.length + 1));
        if (target.length > length && index >= 0 && (index === best || index === best - target.length + 1)) continue;
        output.push(...this.replaceVariants(value.slice(0, best) + target + value.slice(best + length), best + target.length, depth + 1));
      }
      return output;
    }

    findSimilarWordCandidates(original, maxDistance = 1) {
      const word = String(original ?? "").normalize("NFC"), max = Math.max(1, Math.min(3, Number.isInteger(maxDistance) ? maxDistance : 1));
      const cacheKey = `${max}:${word}`, cached = this.cache.get(cacheKey);
      if (cached) return cached.map(item => ({ ...item }));
      const band = max, results = [], matrix = new Int32Array(122 * (2 * band + 3)); matrix.fill(0);
      for (let i = 0; i < 121 - band; i++) { matrix[i] = max + 1; matrix[matrix.length - i - 1] = max + 1; }
      for (let i = 0; i <= band + 1; i++) { matrix[(band + 1 - i) * 122] = i; matrix[(band + 1 + i) * 122 + i] = i; }
      const get = (i, j) => matrix[(j - i + band + 1) * 122 + j], set = (i, j, value) => { matrix[(j - i + band + 1) * 122 + j] = value; };
      let processed = "", candidate = [], distance = max;
      const equivalent = (left, right) => {
        if (left === right || this.manifest.equivalentChars?.[left]?.includes(right)) return true;
        const a = left.normalize("NFD")[0], b = right.normalize("NFD")[0];
        return a === b || /\p{L}/u.test(a) && a.toLocaleLowerCase("en") === b.toLocaleLowerCase("en");
      };
      const edit = (i, j, wi, ci) => {
        let value;
        if (equivalent(processed[wi], candidate[ci])) value = get(i, j);
        else if (wi > 0 && ci > 0 && processed[wi] === candidate[ci - 1] && processed[wi - 1] === candidate[ci]) value = 1 + Math.min(get(i - 1, j - 1), get(i + 1, j), get(i, j + 1));
        else value = 1 + Math.min(get(i, j), get(i + 1, j), get(i, j + 1));
        set(i + 1, j + 1, value); return value;
      };
      const matches = (pattern, wi) => (!pattern.start || wi === 0) && processed.startsWith(pattern.source, wi) && (!pattern.end || wi + pattern.source.length === processed.length);
      const walk = (node, depth, wi, ci, minLookback = -1, lastSource = null, lastTarget = "") => {
        for (const arc of this.characterTransitions(node)) {
          candidate[ci] = arc.char; let length = 0;
          if (ci > 0 && wi > 0) {
            const pair = candidate[ci - 1] + candidate[ci];
            for (const pattern of this.two.get(pair) || []) {
              if (pattern.source.length === 2 && wi < processed.length && candidate[ci - 1] === processed[wi - 1] && candidate[ci] === processed[wi]) break;
              if (matches(pattern, wi - 1)) { if (wi - 1 < minLookback && lastSource && pattern.source.length === 1 && pattern.source === lastTarget && pair === lastSource) continue; length = pattern.source.length; break; }
            }
          }
          const isEnd = arc.final && Math.abs(processed.length - 1 - wi) <= distance;
          const canContinue = !arc.terminal && arc.char !== String.fromCharCode(this.manifest.separator);
          if (length > 0) {
            let d = get(depth - 1, depth - 1);
            if (isEnd) { d += Math.abs(processed.length - 1 - (wi + length - 2)); if (d <= distance) results.push({word: candidate.slice(0, ci + 1).join(""), distance: d, score: d * 26 + 25 - arc.frequency}); }
            if (canContinue) { const previous = get(depth, depth); set(depth, depth, get(depth - 1, depth - 1)); walk(arc.target, Math.max(0, depth), wi + length - 1, ci + 1, minLookback, lastSource, lastTarget); set(depth, depth, previous); }
          }
          length = 0;
          for (const pattern of this.one.get(arc.char) || []) if (matches(pattern, wi)) { length = pattern.source.length; break; }
          if (length > 0) {
            let d = get(depth, depth);
            if (isEnd) { d += Math.abs(processed.length - 1 - (wi + length - 1)); if (d <= distance) results.push({word: candidate.slice(0, ci + 1).join(""), distance: d, score: d * 26 + 25 - arc.frequency}); }
            if (canContinue) walk(arc.target, depth, wi + length, ci + 1, wi + length, processed.slice(wi, wi + length), arc.char);
          }
          let cutoff = distance + 1, lower = Math.max(0, depth - distance), upper = Math.min(processed.length - 1 - (wi - depth), depth + distance);
          for (let i = lower, wordIndex = wi + lower - depth; i <= upper; i++, wordIndex++) cutoff = Math.min(cutoff, edit(i, depth, wordIndex, ci));
          if (cutoff <= distance) {
            if (isEnd) { const d = edit(processed.length - 1 - (wi - depth), depth, processed.length - 1, ci); if (d <= distance) results.push({word: candidate.slice(0, ci + 1).join(""), distance: d, score: d * 26 + 25 - arc.frequency}); }
            if (canContinue) walk(arc.target, depth + 1, wi + 1, ci + 1, minLookback, lastSource, lastTarget);
          }
        }
      };
      const queries = this.rest.size && word.length > 1 ? this.replaceVariants(word) : [word];
      if (word.length > 0 && word.length < 120) {
        if (this.rest.size && word.length > 1) for (const query of queries) {
          const forms = this.exact(query) ? [query] : [query.toLocaleLowerCase("en"), query.toLocaleUpperCase("en"), query.length > 1 ? query[0].toLocaleUpperCase("en") + query.slice(1).toLocaleLowerCase("en") : ""];
          for (const form of forms) if (form && this.exact(form)) {
            let state = this.root; for (const byte of encoder.encode(form)) { const arc = this.getArc(state, byte); if (arc < 0 || this.terminal(arc)) { state = -1; break; } state = this.next(arc); }
            if (state >= 0) results.push({word: form, distance: 0, score: 25 - this.frequency(state)});
          }
        }
        let index = 1;
        for (const query of queries) { index++; if (index > 15 || query.length < 4 && index > 2) break; processed = query; candidate = []; distance = query.length <= 1 ? query.length - 1 : max; walk(this.root, 0, 0, 0); }
      }
      if (this.manifest.spellerFlags.supportRunOnWords && (!word || !this.exact(word))) for (let split = 1; split < word.length; split++) {
        const prefix = word.slice(0, split), suffix = word.slice(split);
        const prefixTitle = /^\p{Lu}/u.test(prefix) && this.exact(prefix.toLocaleLowerCase("en"));
        const suffixTitle = /^\p{Lu}/u.test(suffix) && this.exact(suffix.toLocaleLowerCase("en"));
        if ((this.exact(suffix) || suffixTitle) && (this.exact(prefix) || prefixTitle)) results.push({word: `${prefix} ${suffix}`, distance: 1, score: 51});
      }
      results.sort((a, b) => a.score - b.score);
      const seen = new Set(), output = [];
      for (const item of results) {
        let form = item.word;
        const letters = [...word].filter(char => /\p{L}/u.test(char)), allUpper = letters.length > 0 && letters.every(char => char === char.toLocaleUpperCase("en"));
        const mixed = globalThis.CorrectorEnglishTagger.isMixedCase(form);
        if (this.manifest.spellerFlags.convertCase && allUpper && !mixed) form = form.toLocaleUpperCase("en");
        else if (this.manifest.spellerFlags.convertCase && /^\p{Lu}/u.test(word) && !mixed) form = form[0].toLocaleUpperCase("en") + form.slice(1);
        if (form !== word && !seen.has(form)) { seen.add(form); output.push({word: form, distance: item.distance, weight: item.score}); }
      }
      this.cache.set(cacheKey, output);
      if (this.cache.size > 3000) this.cache.delete(this.cache.keys().next().value);
      return output.map(item => ({...item}));
    }

    suggest(word, limit = 5) {
      const value = String(word ?? "");
      return this.findSimilarWordCandidates(value, 1).map(item => item.word).slice(0, limit);
    }

    findSimilarWords(word, maxDistance = 1) {
      return this.findSimilarWordCandidates(word, maxDistance).map(item => item.word);
    }

    static async load({ baseUrl, fetcher = globalThis.fetch } = {}) {
      const base = baseUrl || globalThis.chrome?.runtime?.getURL("build/resources/en-US/");
      if (!base) throw new Error("An en-US resource base URL is required outside the extension.");
      const response = await fetcher(new URL("resource-index.json", base));
      if (!response.ok) throw new Error(`Could not load the en-US manifest (${response.status}).`);
      const manifest = await response.json(), data = { ...manifest.spelling, profile: manifest.spelling.profile || manifest.spellingProfile || "en-US LanguageTool 6.9-SNAPSHOT / english-pos-dict 0.6" };
      if (manifest.profile !== "en-US" || data?.locale !== "en_US") throw new Error("The spelling profile is not en-US.");
      return EnglishSpeller.loadGraph(base, fetcher, data, "en-US spelling");
    }

    static async loadFilterSpeller({ baseUrl, fetcher = globalThis.fetch } = {}) {
      const base = baseUrl || globalThis.chrome?.runtime?.getURL("build/resources/en-US/");
      if (!base) throw new Error("An en-US resource base URL is required outside the extension.");
      const response = await fetcher(new URL("resource-index.json", base));
      if (!response.ok) throw new Error(`Could not load the English filter manifest (${response.status}).`);
      const manifest = await response.json(), source = manifest.pos;
      if (manifest.profile !== "en-US" || source?.profile !== "en-US LanguageTool 6.9-SNAPSHOT / english-pos-dict 0.6"
          || source?.sourceSha256 !== "f2a0ea88cff225d1073321ad8ad795c9aa8eb08613f1d74a88895bfe9b992142") {
        throw new Error("The English filter graph is not the pinned LanguageTool dictionary.");
      }
      const data = { ...source, locale: "en_US", frequencyIncluded: false, replacementPairs: {}, spellerFlags: {
        ignorePunctuation: false, ignoreNumbers: false, ignoreCamelCase: false, ignoreAllUppercase: false,
        convertCase: false, supportRunOnWords: false
      } };
      return EnglishSpeller.loadGraph(base, fetcher, data, "English filter");
    }

    static async loadGraph(base, fetcher, data, label) {
      const graphResponse = await fetcher(new URL(data.dataFile, base));
      if (!graphResponse.ok || typeof DecompressionStream !== "function" || !globalThis.crypto?.subtle) throw new Error(`Could not load or verify the ${label} graph.`);
      const raw = new Uint8Array(await new Response(graphResponse.body.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());
      if (raw.byteLength !== data.rawBytes) throw new Error(`The ${label} graph has an invalid length.`);
      const digest = await crypto.subtle.digest("SHA-256", raw);
      const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
      if (hash !== data.rawSha256) throw new Error(`The ${label} graph hash does not match its manifest.`);
      return new EnglishSpeller(raw.buffer, { ...data, profile: data.profile || "en-US LanguageTool 6.9-SNAPSHOT / english-pos-dict 0.6" });
    }
  }
  globalThis.CorrectorEnglishSpeller = EnglishSpeller;
})();
