/* SRX 2.0 sentence segmentation for ca-ES_two from the locked LanguageTool source. */
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
    flags = [...new Set((flags + "u").split(""))].join("");
    return new RegExp(pattern, flags);
  }

  class CatalanSentenceTokenizer {
    constructor(resource) {
      if (resource?.schemaVersion !== 1 || resource?.languageCode !== "ca-ES_two") throw new Error("Recurs SRX ca-ES_two incompatible.");
      this.rules = [];
      for (const group of resource.groups || []) {
        for (const [index, rule] of (group.rules || []).entries()) {
          try {
            this.rules.push({
              break: rule.break === "yes",
              before: compileJavaRegex(rule.before, "g"),
              after: rule.after ? compileJavaRegex(rule.after) : null,
              source: `${group.name}[${index}]`
            });
          } catch (cause) {
            const error = new Error(`No es pot compilar la regla SRX ${group.name}[${index}]: ${cause.message}`);
            error.code = "SRX_PATTERN_UNSUPPORTED";
            error.cause = cause;
            throw error;
          }
        }
      }
      this.sourceSha256 = resource.sourceSha256;
    }

    segment(text) {
      if (typeof text !== "string") throw new TypeError("El text per segmentar ha de ser una cadena.");
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
      const resourceUrl = url || globalThis.chrome?.runtime?.getURL("build/resources/ca-srx.json");
      if (!resourceUrl) throw new Error("Cal indicar URL del recurs SRX fora de l'extensió.");
      const response = await fetcher(resourceUrl);
      if (!response.ok) throw new Error(`No s'ha pogut carregar el recurs SRX (${response.status}).`);
      return new CatalanSentenceTokenizer(await response.json());
    }
  }

  globalThis.CorrectorCatalanSentenceTokenizer = CatalanSentenceTokenizer;
})();
