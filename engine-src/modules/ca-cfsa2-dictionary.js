/*
 * Compact CFSA2 reader for the Morfologik 2.2.0 dictionary subset shipped
 * with Softcatalà catalan-pos-dict 3.3. Traversal is implemented locally
 * against the documented on-disk format; see licenses/morfologik/COPYING.txt
 * for the format/runtime provenance and license notice.
 */
(() => {
  "use strict";

  const MAGIC = [0x5c, 0x66, 0x73, 0x61]; // "\\fsa"
  const VERSION_CFSA2 = 0xc6;
  const SUPPORTED_FLAGS = 0x0007; // FLEXIBLE | STOPBIT | NEXTBIT
  const BIT_TARGET_NEXT = 0x80;
  const BIT_LAST_ARC = 0x40;
  const BIT_FINAL_ARC = 0x20;
  const LABEL_MASK = 0x1f;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder("utf-8", { fatal: true });

  function fail(message) {
    throw new Error(`CFSA2: ${message}`);
  }

  class CatalanCfsa2Dictionary {
    constructor(input, { separator = "_", encoding = "utf-8", encoderType = "SUFFIX" } = {}) {
      const bytes = input instanceof Uint8Array
        ? input
        : input instanceof ArrayBuffer
          ? new Uint8Array(input)
          : ArrayBuffer.isView(input)
            ? new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
            : null;
      if (!bytes) throw new TypeError("El diccionari CFSA2 ha de ser un buffer binari.");
      if (bytes.length < 9) fail("fitxer massa curt.");
      for (let i = 0; i < MAGIC.length; i++) if (bytes[i] !== MAGIC[i]) fail("signatura incorrecta.");
      if (bytes[4] !== VERSION_CFSA2) fail(`versió no compatible (0x${bytes[4].toString(16)}).`);
      if (encoding.toLowerCase() !== "utf-8" || encoderType !== "SUFFIX") fail("només s'admeten UTF-8 i SUFFIX.");
      const separatorBytes = encoder.encode(separator);
      if (separatorBytes.length !== 1) fail("el separador ha de ser un byte UTF-8.");

      this.bytes = bytes;
      this.flags = (bytes[5] << 8) | bytes[6];
      if (this.flags !== SUPPORTED_FLAGS) fail(`flags no compatibles (0x${this.flags.toString(16)}).`);
      const labelsLength = bytes[7];
      this.arcsStart = 8 + labelsLength;
      if (labelsLength < 2 || this.arcsStart >= bytes.length) fail("taula de labels invàlida o sense arcs.");
      this.labels = bytes.subarray(8, this.arcsStart);
      this.arcs = bytes.subarray(this.arcsStart);
      this.separator = separatorBytes[0];
      this.root = this.destinationNode(this.firstArc(0));
      if (this.root <= 0 || this.root >= this.arcs.length) fail("node arrel fora dels límits.");
    }

    firstArc(node) {
      if (!Number.isInteger(node) || node < 0 || node >= this.arcs.length) fail("node fora dels límits.");
      return node;
    }

    arcHeader(arc) {
      if (!Number.isInteger(arc) || arc < 0 || arc >= this.arcs.length) fail("arc fora dels límits.");
      return this.arcs[arc];
    }

    nextArc(arc) {
      const header = this.arcHeader(arc);
      if (header & BIT_LAST_ARC) return 0;
      let cursor = arc + 1;
      if ((header & LABEL_MASK) === 0) cursor++;
      if (!(header & BIT_TARGET_NEXT)) cursor = this.skipVInt(cursor);
      if (cursor <= arc || cursor >= this.arcs.length) fail("següent arc fora dels límits.");
      return cursor;
    }

    arcLabel(arc) {
      const header = this.arcHeader(arc);
      const labelIndex = header & LABEL_MASK;
      if (labelIndex === 0) {
        if (arc + 1 >= this.arcs.length) fail("label estès truncat.");
        return this.arcs[arc + 1];
      }
      if (labelIndex >= this.labels.length) fail("índex de label fora dels límits.");
      return this.labels[labelIndex];
    }

    destinationNode(arc) {
      let header = this.arcHeader(arc);
      if (header & BIT_TARGET_NEXT) {
        let last = arc;
        while (!(this.arcHeader(last) & BIT_LAST_ARC)) last = this.nextArc(last);
        return this.skipArc(last);
      }
      const target = this.readVInt(arc + 1 + ((header & LABEL_MASK) === 0 ? 1 : 0));
      if (target < 0 || target >= this.arcs.length) fail("node de destinació fora dels límits.");
      return target;
    }

    isFinal(arc) {
      return Boolean(this.arcHeader(arc) & BIT_FINAL_ARC);
    }

    isTerminal(arc) {
      return this.destinationNode(arc) === 0;
    }

    findArc(node, label) {
      for (let arc = this.firstArc(node); arc !== 0; arc = this.nextArc(arc)) {
        const current = this.arcLabel(arc);
        if (current === label) return arc;
      }
      return 0;
    }

    match(bytes) {
      let node = this.root;
      let lastArc = 0;
      for (const label of bytes) {
        lastArc = this.findArc(node, label);
        if (!lastArc) return null;
        if (this.isTerminal(lastArc)) {
          if (label !== bytes[bytes.length - 1]) return null;
          node = 0;
        } else {
          node = this.destinationNode(lastArc);
        }
      }
      return { node, lastArc };
    }

    *sequencesFrom(node) {
      const stack = [{ arc: this.firstArc(node), depth: 0 }];
      const path = [];
      while (stack.length) {
        const frame = stack[stack.length - 1];
        if (frame.arc === 0) {
          stack.pop();
          continue;
        }
        const arc = frame.arc;
        frame.arc = this.nextArc(arc);
        const depth = frame.depth;
        path[depth] = this.arcLabel(arc);
        if (!this.isTerminal(arc)) stack.push({ arc: this.firstArc(this.destinationNode(arc)), depth: depth + 1 });
        if (this.isFinal(arc)) yield Uint8Array.from(path.slice(0, depth + 1));
      }
    }

    *lookupBytes(keyBytes) {
      if (!(keyBytes instanceof Uint8Array)) throw new TypeError("La clau ha de ser Uint8Array.");
      if (!keyBytes.length) return;
      const matched = this.match(keyBytes);
      // Morfologik's DictionaryLookup requires a complete key path whose last
      // arc is not final, then follows the separator arc to its output suffixes.
      if (!matched || !matched.node || this.isFinal(matched.lastArc)) return;
      const separatorArc = this.findArc(matched.node, this.separator);
      if (!separatorArc || this.isFinal(separatorArc) || this.isTerminal(separatorArc)) return;
      const suffixNode = this.destinationNode(separatorArc);
      for (const encoded of this.sequencesFrom(suffixNode)) {
        let delimiter = 1;
        while (delimiter < encoded.length && encoded[delimiter] !== this.separator) delimiter++;
        const hasTag = delimiter < encoded.length;
        if (!hasTag) delimiter = encoded.length;
        const trim = this.suffixTrim(encoded[0], keyBytes.length);
        if (trim < 0 || trim > keyBytes.length) fail("longitud SUFFIX invàlida.");
        const lemma = new Uint8Array(keyBytes.length - trim + delimiter - 1);
        lemma.set(keyBytes.subarray(0, keyBytes.length - trim), 0);
        lemma.set(encoded.subarray(1, delimiter), keyBytes.length - trim);
        const tag = hasTag ? encoded.subarray(delimiter + 1) : new Uint8Array(0);
        yield { lemma: decoder.decode(lemma), tag: decoder.decode(tag) };
      }
    }

    lookup(value) {
      const key = encoder.encode(String(value));
      return Array.from(this.lookupBytes(key), reading => ({ form: String(value), ...reading }));
    }

    *entries() {
      for (const keyBytes of this.sequencesFrom(this.root)) {
        // The physical dictionary stores form + separator + encoded output;
        // enumerating here is intentionally a generator to keep memory bounded.
        let separator = 0;
        while (separator < keyBytes.length && keyBytes[separator] !== this.separator) separator++;
        if (separator === keyBytes.length) continue;
        const formBytes = keyBytes.subarray(0, separator);
        const outputBytes = keyBytes.subarray(separator + 1);
        if (!outputBytes.length) continue;
        let delimiter = 1;
        while (delimiter < outputBytes.length && outputBytes[delimiter] !== this.separator) delimiter++;
        const hasTag = delimiter < outputBytes.length;
        if (!hasTag) delimiter = outputBytes.length;
        const trim = this.suffixTrim(outputBytes[0], formBytes.length);
        if (trim < 0 || trim > formBytes.length) fail("longitud SUFFIX invàlida en l'entrada.");
        const lemmaBytes = new Uint8Array(formBytes.length - trim + delimiter - 1);
        lemmaBytes.set(formBytes.subarray(0, formBytes.length - trim), 0);
        lemmaBytes.set(outputBytes.subarray(1, delimiter), formBytes.length - trim);
        yield { form: decoder.decode(formBytes), lemma: decoder.decode(lemmaBytes), tag: hasTag ? decoder.decode(outputBytes.subarray(delimiter + 1)) : "" };
      }
    }

    suffixTrim(marker, keyLength) {
      // Morfologik computes (signedByte - 'A') & 0xff. 255 is its sentinel
      // meaning “trim the entire lookup key”, not an invalid trim length.
      let trim = (marker - 0x41) & 0xff;
      if (trim === 0xff) trim = keyLength;
      if (trim > keyLength) fail("longitud SUFFIX invàlida.");
      return trim;
    }

    skipArc(arc) {
      const header = this.arcHeader(arc);
      let cursor = arc + 1 + ((header & LABEL_MASK) === 0 ? 1 : 0);
      if (!(header & BIT_TARGET_NEXT)) cursor = this.skipVInt(cursor);
      if (cursor > this.arcs.length) fail("arc truncat.");
      return cursor;
    }

    skipVInt(cursor) {
      let count = 0;
      while (cursor < this.arcs.length && (this.arcs[cursor++] & 0x80)) {
        if (++count > 4) fail("VInt massa llarg.");
      }
      if (cursor > this.arcs.length || (cursor === this.arcs.length && (this.arcs[cursor - 1] & 0x80))) fail("VInt truncat.");
      return cursor;
    }

    readVInt(cursor) {
      let value = 0;
      let shift = 0;
      let count = 0;
      while (cursor < this.arcs.length) {
        const byte = this.arcs[cursor++];
        value += (byte & 0x7f) * (2 ** shift);
        if (!(byte & 0x80)) return value;
        shift += 7;
        if (++count > 4) break;
      }
      fail("VInt de destinació invàlid o truncat.");
    }

    getStats() {
      return { format: "CFSA2", flags: this.flags, rawBytes: this.bytes.byteLength, rootNode: this.root };
    }
  }

  globalThis.CorrectorCatalanCfsa2Dictionary = CatalanCfsa2Dictionary;
})();
