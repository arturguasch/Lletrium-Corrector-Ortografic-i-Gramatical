/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Local en-US port of LanguageTool's CompoundRule. */
(() => {
  "use strict";
  const SOURCE_SHA256 = "be0a491fba8bf0b8c8c4d5e4b5b3f8c6cc4bef6264c69dc3a5d918691fc1657d";
  const normalize = value => String(value ?? "").trim().replace(/\s+-\s+/gu, " ").replaceAll("-", " ").replace(/\s+/gu, " ").toLocaleLowerCase("en-US");
  const allUpper = value => /\p{Lu}/u.test(value) && value === value.toLocaleUpperCase("en-US");
  const uncapitalize = value => { const chars = [...value]; return chars.length ? chars[0].toLocaleLowerCase("en-US") + chars.slice(1).join("") : value; };
  const letters = value => /[\p{L}\p{N}]/u.test(value);

  function createDataIndex(data) {
    if (data?.schemaVersion !== 1 || data.profile !== "en-US" || data.sourceSha256 !== SOURCE_SHA256
        || data.sourceEntryCount !== 8908 || data.entryCount !== data.entries?.length) throw new Error("The en-US CompoundRule inventory is incomplete or has drifted.");
    const byForm = new Map(), firstWords = new Set();
    for (const entry of data.entries) {
      if (!entry?.form || byForm.has(entry.form) || !Array.isArray(entry.terms) || entry.terms.length < 2 || entry.terms.length > 5) throw new Error("Invalid or duplicate en-US compound entry.");
      byForm.set(entry.form, Object.freeze(entry));
      if (!entry.terms[0].includes("\\d")) firstWords.add(entry.terms[0]);
    }
    return Object.freeze({ byForm, firstWords, entryCount: data.entryCount, sourceSha256: SOURCE_SHA256 });
  }

  function isAntiPattern(tokens, startIndex, endIndex) {
    const words = tokens.map(token => String(token.text || "").toLocaleLowerCase("en-US"));
    const slice = words.slice(startIndex, endIndex + 1), phrase = slice.join(" ");
    const at = (i, ...forms) => forms.includes(words[i] || "");
    const context = words.slice(Math.max(0, startIndex - 5), Math.min(words.length, endIndex + 6)).join(" ");
    return /^(?:we|you|they|i|he|she|it) well$/u.test(phrase) && /^(?:receive|received|receives|receiving)$/u.test(words[endIndex + 1] || "")
      || /^how well$/u.test(phrase) && /^\p{L}+ing$/u.test(words[endIndex + 1] || "")
      || at(startIndex - 1, "and", "&") && slice[0] === "co"
      || /\bpower off key\b/u.test(phrase)
      || /\bsee saw seen\b/u.test(phrase)
      || /\bforward looking (?:at|for|to|into)\b/u.test(phrase)
      || /\bstore front doors?\b/u.test(context)
      || /\bfrom surface to surface\b/u.test(context)
      || /\b(?:senior|junior) year end\b/u.test(context)
      || /\bunder investment banking\b/u.test(phrase)
      || /\bspring cleans? (?:up|the|my|our|his|her)\b/u.test(context)
      || /\bseries? a\b/u.test(phrase)
      || /\bhard time \p{L}+ing\b/u.test(context)
      || /\bfirst ever green\b/u.test(phrase)
      || /\.(?:com|io|de|nl|co|net|org|es)\b/u.test(phrase)
      || /['’`´‘] re\b/u.test(context);
  }

  function findMatches(sentences, text, data, speller) {
    if (!data?.byForm || !speller) throw new Error("The en-US CompoundRule needs its local resource and spellchecker.");
    const issues = [];
    for (const sentence of sentences || []) {
      const tokens = (sentence.tokens || []).filter(token => token.kind !== "space");
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].kind !== "word" || !data.firstWords.has(normalize(tokens[i].text).split(" ")[0])) continue;
        let match = null;
        for (let j = Math.min(tokens.length - 1, i + 4); j > i; j--) {
          const range = tokens.slice(i, j + 1);
          if (range.some(token => token.kind !== "word" && token.text !== "-")) continue;
          const start = range[0].start, end = range.at(-1).end;
          const original = text.slice(start, end), form = normalize(original), entry = data.byForm.get(form);
          if (!entry || form.split(" ").length > 5 || isAntiPattern(tokens, i, j)) continue;
          const hyphenatedInput = !original.includes(" ") && original.includes("-");
          if (entry.allowHyphen && hyphenatedInput) continue;
          const replacements = [];
          let message = "";
          if (entry.allowHyphen || form.includes("\\d") && entry.allowHyphen) {
            replacements.push(original.replace(/\s+/gu, "-").replace(/--+/gu, "-"));
            message = "This word is normally spelled with a hyphen.";
          }
          if (entry.allowJoined && !original.split(" ").some(part => part !== "-" && allUpper(part))) {
            const joined = original.replaceAll("-", " ").split(/\s+/u).map((part, index) => entry.lowercaseJoined && index > 0 ? uncapitalize(part) : part).join("");
            replacements.push(joined);
            message = "This word is normally spelled as one.";
          }
          if (original.split(/\s+/u)[0]?.length === 1) {
            replacements.length = 0;
            replacements.push(original.replace(/\s+/gu, "-").replace(/--+/gu, "-"));
            message = "This word is normally spelled with a hyphen.";
          }
          // CompoundRule's source inventory is itself the authority for these
          // joined/hyphenated forms. Filtering them through Morfologik drops
          // valid variants (for example, a hyphenated form absent from the
          // standalone spelling FSA).
          const suggestions = [...new Set(replacements)].filter(value => value !== original);
          if (!suggestions.length) continue;
          if (suggestions.length === 2) message = "This expression is normally spelled as one or with a hyphen.";
          const ruleId = `EN_COMPOUNDS_${form.replaceAll(" ", "_").toLocaleUpperCase("en-US").replace(/[^A-Z0-9_]/gu, "_")}`;
          match = { id: `${ruleId}:${start}:${end}`, ruleId, category: "misc", severity: "warning", message, shortMessage: "Compound",
            text: original, start, end, replacementStart: start, replacementEnd: end, suggestions, _languagePriority: 2 };
          break;
        }
        if (match) issues.push(match);
      }
    }
    return issues;
  }

  async function load({ url, fetcher = globalThis.fetch } = {}) {
    const resourceUrl = url || globalThis.chrome?.runtime?.getURL("build/resources/en-US/en-compounds.json");
    if (!resourceUrl) throw new Error("An en-US compounds resource URL is required outside the extension.");
    const response = await fetcher(resourceUrl);
    if (!response.ok) throw new Error(`Could not load en-US compounds (${response.status}).`);
    return createDataIndex(await response.json());
  }
  globalThis.CorrectorEnglishCompounds = Object.freeze({ SOURCE_SHA256, createDataIndex, findMatches, load });
})();
