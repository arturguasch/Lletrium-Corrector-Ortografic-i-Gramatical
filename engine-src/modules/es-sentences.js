/* Spanish SRX 2.0 rules from LanguageTool segment.srx (LGPL-2.1). */
(() => {
  "use strict";

  function compileJavaRegex(source, flags = "") {
    let pattern = String(source ?? "");
    const inline = pattern.match(/^\(\?([idmsux-]+)\)/u);
    if (inline) {
      if (inline[1].includes("x") || inline[1].includes("-")) throw new Error(`Unsupported SRX Java regex flags: ${inline[1]}`);
      if (inline[1].includes("i")) flags += "i";
      if (inline[1].includes("s")) flags += "s";
      if (inline[1].includes("m")) flags += "m";
      pattern = pattern.slice(inline[0].length);
    }
    // Java permits escaping '-' outside character classes; ECMAScript rejects
    // that identity escape in Unicode mode although it has the same meaning.
    pattern = pattern.replace(/\\-/gu, "-");
    flags = [...new Set((flags + "u").split(""))].join("");
    return new RegExp(pattern, flags);
  }

  class SpanishSentenceTokenizer {
    constructor(resource) {
      if (resource?.schemaVersion !== 1 || resource?.languageCode !== "es-ES" || resource?.languageRule !== "Spanish") {
        throw new Error("El recurso SRX no pertenece al perfil independiente es-ES.");
      }
      this.rules = [];
      for (const [index, rule] of (resource.rules || []).entries()) {
        try {
          this.rules.push({ break: rule.break === "yes", before: compileJavaRegex(rule.before, "g"), after: rule.after ? compileJavaRegex(rule.after) : null, source: `Spanish[${index}]` });
        } catch (cause) {
          const error = new Error(`No se puede compilar la regla SRX Spanish[${index}]: ${cause.message}`);
          error.code = "SRX_PATTERN_UNSUPPORTED";
          error.cause = cause;
          throw error;
        }
      }
      this.sourceSha256 = resource.sourceSha256;
    }

    segment(text) {
      if (typeof text !== "string") throw new TypeError("El texto que se va a segmentar debe ser una cadena.");
      if (!text) return [];
      const events = new Map();
      for (let order = 0; order < this.rules.length; order++) {
        const rule = this.rules[order];
        rule.before.lastIndex = 0;
        let match;
        while ((match = rule.before.exec(text))) {
          const boundary = match.index + match[0].length;
          if (boundary <= 0 || boundary >= text.length) {
            if (!match[0].length) rule.before.lastIndex++;
            continue;
          }
          if (rule.after) {
            const after = rule.after.exec(text.slice(boundary));
            if (!after || after.index !== 0) continue;
          }
          const previous = events.get(boundary);
          if (!previous || order < previous.order) events.set(boundary, { boundary, order, split: rule.break, rule: rule.source });
          if (!match[0].length) rule.before.lastIndex++;
        }
      }
      const segments = [];
      let start = 0;
      for (const event of [...events.values()].sort((a, b) => a.boundary - b.boundary || a.order - b.order)) {
        if (!event.split || event.boundary <= start) continue;
        segments.push({ text: text.slice(start, event.boundary), start, end: event.boundary, boundaryRule: event.rule });
        start = event.boundary;
      }
      if (start < text.length) segments.push({ text: text.slice(start), start, end: text.length, boundaryRule: null });
      return segments;
    }

    static async load({ url, fetcher = globalThis.fetch } = {}) {
      const resourceUrl = url || globalThis.chrome?.runtime?.getURL("build/resources/es-ES/es-srx.json");
      if (!resourceUrl) throw new Error("Se debe indicar URL del recurso SRX fuera de la extensión.");
      const response = await fetcher(resourceUrl);
      if (!response.ok) throw new Error(`No se pudo cargar el recurso SRX español (${response.status}).`);
      return new SpanishSentenceTokenizer(await response.json());
    }
  }

  globalThis.CorrectorSpanishSentenceTokenizer = SpanishSentenceTokenizer;
})();
