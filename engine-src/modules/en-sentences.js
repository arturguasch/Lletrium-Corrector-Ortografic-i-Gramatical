/* English SRX segmentation exported from LanguageTool's segment.srx. */
(() => {
  "use strict";
  function compileJavaRegex(source, flags = "") {
    let pattern = String(source ?? "");
    const inline = pattern.match(/^\(\?([idmsux-]+)\)/u);
    if (inline) {
      if (inline[1].includes("x") || inline[1].includes("-")) throw new Error(`Unsupported English SRX flags: ${inline[1]}`);
      if (inline[1].includes("i")) flags += "i";
      if (inline[1].includes("s")) flags += "s";
      if (inline[1].includes("m")) flags += "m";
      pattern = pattern.slice(inline[0].length);
    }
    pattern = pattern.replace(/\\-/gu, "-");
    return new RegExp(pattern, [...new Set((flags + "u").split(""))].join(""));
  }

  class EnglishSentenceTokenizer {
    constructor(resource) {
      if (resource?.schemaVersion !== 1 || resource.languageCode !== "en-US" || resource.languageRule !== "English") throw new Error("SRX data does not belong to en-US.");
      this.rules = resource.rules.map((rule, index) => ({
        split: rule.break === "yes", before: compileJavaRegex(rule.before, "g"),
        after: rule.after ? compileJavaRegex(rule.after) : null, source: `English[${index}]`
      }));
      this.sourceSha256 = resource.sourceSha256;
    }

    segment(text) {
      if (typeof text !== "string") throw new TypeError("Text to segment must be a string.");
      if (!text) return [];
      const events = new Map();
      const noBreakBoundaries = new Set();
      for (let order = 0; order < this.rules.length; order++) {
        const rule = this.rules[order]; rule.before.lastIndex = 0;
        let match;
        while ((match = rule.before.exec(text))) {
          const boundary = match.index + match[0].length;
          if (boundary <= 0 || boundary >= text.length) { if (!match[0].length) rule.before.lastIndex++; continue; }
          if (rule.after) { const after = rule.after.exec(text.slice(boundary)); if (!after || after.index !== 0) continue; }
          // SRX no-break rules can end before trailing whitespace, while the
          // matching break rule consumes that whitespace. Keep those offsets
          // so the no-break decision can veto the adjacent break event below.
          if (!rule.split) noBreakBoundaries.add(boundary);
          const previous = events.get(boundary);
          if (rule.split && (!previous || order < previous.order)) {
            events.set(boundary, { boundary, order, split: true, rule: rule.source });
          }
          if (!match[0].length) rule.before.lastIndex++;
        }
      }
      // LanguageTool configures the English tokenizer so that two or more
      // line breaks mark a paragraph boundary. Do not let a no-break SRX rule
      // that matches whitespace inside that blank-line separator veto the
      // sentence boundary after it (for example, "First sentence.\n\nNext
      // paragraph.").
      const paragraphBoundaries = new Set();
      const paragraphSeparator = /(?:\r?\n[\t \f\v]*){2,}/gu;
      let paragraphMatch;
      while ((paragraphMatch = paragraphSeparator.exec(text))) {
        const boundary = paragraphMatch.index + paragraphMatch[0].length;
        if (boundary > 0 && boundary < text.length) {
          paragraphBoundaries.add(boundary);
          const previous = events.get(boundary);
          if (!previous || !previous.split) {
            events.set(boundary, { boundary, order: -1, split: true, rule: "paragraph-break" });
          }
        }
        if (!paragraphMatch[0].length) paragraphSeparator.lastIndex++;
      }
      const segments = []; let start = 0;
      for (const event of [...events.values()].sort((a, b) => a.boundary - b.boundary || a.order - b.order)) {
        if (!event.split || event.boundary <= start) continue;
        // LanguageTool's SRX engine lets a no-break rule veto the adjacent
        // break even if the former stops just before whitespace consumed by
        // the latter. This matters for quoted ellipses followed by lowercase
        // continuation and avoids inventing a sentence boundary mid-quote.
        let noBreakVeto = !paragraphBoundaries.has(event.boundary) && noBreakBoundaries.has(event.boundary);
        for (let boundary = event.boundary - 1; !paragraphBoundaries.has(event.boundary) && !noBreakVeto && boundary >= start
            && /^\s$/u.test(text[boundary]); boundary--) {
          noBreakVeto = noBreakBoundaries.has(boundary);
        }
        if (noBreakVeto) continue;
        // SRX can mistake an internal dot in a dotted initialism for the end
        // of a sentence (for example it splits C.O.P.D after C.O.P.). Keep
        // the acronym in one sentence when the next uppercase initial
        // continues the same dotted sequence; a final dot before whitespace
        // or lowercase text remains a normal sentence boundary.
        const beforeBoundary = text.slice(start, event.boundary);
        const afterBoundary = text.slice(event.boundary);
        if (/(?:^|[^\p{L}\p{N}])(?:\p{Lu}\.){2,}$/u.test(beforeBoundary)
            && /^\p{Lu}/u.test(afterBoundary)) continue;
        segments.push({ text: text.slice(start, event.boundary), start, end: event.boundary, boundaryRule: event.rule });
        start = event.boundary;
      }
      if (start < text.length) segments.push({ text: text.slice(start), start, end: text.length, boundaryRule: null });
      return segments;
    }

    static async load({ baseUrl, fetcher = globalThis.fetch } = {}) {
      const url = baseUrl ? new URL("en-srx.json", baseUrl) : globalThis.chrome?.runtime?.getURL("build/resources/en-US/en-srx.json");
      if (!url) throw new Error("An en-US SRX URL is required outside the extension.");
      const response = await fetcher(url);
      if (!response.ok) throw new Error(`Could not load en-US SRX rules (${response.status}).`);
      return new EnglishSentenceTokenizer(await response.json());
    }
  }
  globalThis.CorrectorEnglishSentenceTokenizer = EnglishSentenceTokenizer;
})();
