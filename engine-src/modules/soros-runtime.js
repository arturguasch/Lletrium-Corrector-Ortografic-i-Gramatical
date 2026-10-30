/* Small interpreter for LanguageTool's local .sor number morphology files. */
(() => {
  "use strict";
  function reference(source, offset, groupCount) {
    let end = offset + 1;
    while (end < source.length && /\d/u.test(source[end])) end++;
    for (let stop = end; stop > offset + 1; stop--) {
      const index = Number(source.slice(offset + 1, stop));
      if (index > 0 && index < groupCount) return {index, end: stop};
    }
    return {index: Number(source[offset + 1]), end: offset + 2};
  }
  const capture = (match, index) => index >= 0 && index < match.length ? match[index] || "" : "";
  function closeParen(source, start) {
    let depth = 1;
    for (let index = start + 1; index < source.length; index++) {
      if (source[index] === "\\") { index++; continue; }
      if (source[index] === "(") depth++;
      else if (source[index] === ")" && --depth === 0) return index;
    }
    return -1;
  }
  class SorosProgram {
    constructor(source, name, locale = null) {
      this.name = name; this.rules = [];
      let section = "";
      for (const rawLine of source.split(/\r?\n/u)) {
        const macro = rawLine.match(/^\s*==\s*(.*?)\s*==\s*$/u);
        if (macro) { section = macro[1]; continue; }
        const commentStart = rawLine.search(/(?<!\\)#/u);
        const comment = commentStart < 0 ? "" : rawLine.slice(commentStart + 1);
        const supportedLocales = [...comment.matchAll(/\[:([a-z]{2}-[A-Z]{2}):\]/gu)].map(match => match[1]);
        if (locale && supportedLocales.length && !supportedLocales.includes(locale)) continue;
        const line = (commentStart < 0 ? rawLine : rawLine.slice(0, commentStart)).trim();
        if (!line) continue;
        const parts = line.match(/^("(?:[^"\\]|\\.)*"|\S+)\s*(.*?)\s*$/u);
        if (!parts) continue;
        let expression = parts[1].startsWith('"') ? parts[1].slice(1, -1).replaceAll('\\"', '"') : parts[1];
        expression = expression.replaceAll("\\#", "#");
        const anchoredStart = expression.startsWith("^");
        const anchoredEnd = expression.endsWith("$") && !expression.endsWith("\\$");
        if (section) expression = `${section} ${expression}`;
        const body = expression.replace(/^\^/u, "").replace(/(?<!\\)\$$/u, "");
        let replacement = parts[2] || "";
        if (replacement.startsWith('"') && replacement.endsWith('"')) replacement = replacement.slice(1, -1).replaceAll('\\"', '"');
        try { this.rules.push({pattern: new RegExp(`^(?:${body})$`, "u"), anchoredStart, anchoredEnd, replacement}); }
        catch (error) { throw new Error(`Invalid ${name}.sor rule ${expression}: ${error.message}`); }
      }
      if (!this.rules.length) throw new Error(`${name}.sor has no executable rules.`);
    }
    runInner(input, begin, end, depth = 0) {
      if (depth > 100) throw new Error(`${this.name}.sor recursion limit exceeded.`);
      const value = String(input);
      const leadingZeros = value.match(/^([a-z][-a-z]* )?0+(0|[1-9]\d*)$/u);
      if (leadingZeros) return this.runInner((leadingZeros[1] || "") + leadingZeros[2], begin, end, depth + 1);
      for (const rule of this.rules) {
        if (rule.anchoredStart && !begin || rule.anchoredEnd && !end) continue;
        const matched = value.match(rule.pattern);
        if (matched) return this.expand(rule.replacement, matched, begin, end, depth + 1);
      }
      return "";
    }
    expand(template, matched, begin, end, depth) {
      let output = "";
      for (let index = 0; index < template.length;) {
        const char = template[index];
        if (char === "\\" && index + 1 < template.length) {
          if (template[index + 1] === "n") { output += "\n"; index += 2; continue; }
          if (template[index + 1] === "|") { index += 2; continue; }
          if (/\d/u.test(template[index + 1])) { const ref = reference(template, index, matched.length); output += capture(matched, ref.index); index = ref.end; continue; }
          output += template[index + 1]; index += 2; continue;
        }
        if (char === "$") {
          if (template[index + 1] === "(") {
            const close = closeParen(template, index + 1);
            if (close < 0) throw new Error(`Unclosed ${this.name}.sor recursive call.`);
            let expression = template.slice(index + 2, close);
            const explicitBegin = expression.startsWith("|"); let explicitEnd = expression.endsWith("|");
            if (explicitBegin) expression = expression.slice(1);
            if (explicitEnd && expression) expression = expression.slice(0, -1);
            const input = this.expand(expression, matched, begin, end, depth);
            const callBegin = explicitBegin || index === 0 && begin;
            const callEnd = explicitEnd || close === template.length - 1 && end;
            const outerBegin = template[index - 1] === "|", outerEnd = template[close + 1] === "|";
            output += this.runInner(input, callBegin || outerBegin, callEnd || outerEnd, depth + 1);
            index = close + 1; if (template[index] === "|") index++; continue;
          }
          if (/\d/u.test(template[index + 1] || "")) {
            const ref = reference(template, index, matched.length); let callStart = index, callEnd = ref.end;
            if (template[index - 1] === "|") callStart--;
            if (template[ref.end] === "|") callEnd++;
            const callBegin = template[index - 1] === "|" || callStart === 0 && begin;
            const callFinish = template[ref.end] === "|" || callEnd === template.length && end;
            output += this.runInner(capture(matched, ref.index), callBegin, callFinish, depth + 1);
            index = ref.end + (template[ref.end] === "|" ? 1 : 0); continue;
          }
        }
        if (char === "[") {
          let nesting = 1, close = index + 1;
          for (; close < template.length && nesting; close++) { if (template[close] === "[") nesting++; else if (template[close] === "]") nesting--; }
          if (!nesting) { const optional = this.expand(template.slice(index + 1, close - 1), matched, begin, end, depth); if (optional) output += optional; index = close; continue; }
        }
        if (char === "|") { index++; continue; }
        output += char; index++;
      }
      return output;
    }
  }
  globalThis.CorrectorSorosRuntime = Object.freeze({SorosProgram});
})();
