/* LanguageTool's global spelling and English chunker multiword passes. */
(() => {
  "use strict";
  const GLOBAL_HASH = "98198e0ecbb5e14e32cbee42a4be8b6982c3bb34311bf9ea1f5c12fab4a65634";
  const ENGLISH_HASH = "969a01138b389c71500606bed85f2330426a4bb8ae30c31215afc124bce6bd17";

  function variants(form) {
    const output = [form];
    const first = form[0]?.toLocaleUpperCase("en") + form.slice(1);
    if (first && !output.includes(first)) output.push(first);
    const allCaps = form.toLocaleUpperCase("en");
    if (!/^[a-z]+[A-Z][A-Za-z]+$/u.test(form) && !output.includes(allCaps)) output.push(allCaps);
    return output;
  }

  function makeTrie(entries) {
    const root = { next: new Map(), entry: null };
    const insert = (form, entry) => {
      let node = root;
      for (const char of form) {
        let next = node.next.get(char);
        if (!next) { next = { next: new Map(), entry: null }; node.next.set(char, next); }
        node = next;
      }
      node.entry = entry;
    };
    for (const [form, entry] of entries) for (const variant of variants(form)) insert(variant, entry);
    return root;
  }

  function scanLongest(tokens, start, trie) {
    let node = trie, best = null, tokenCount = 0;
    let pendingSpace = false;
    for (let index = start; index < tokens.length && tokenCount < 20; index++) {
      const token = tokens[index];
      if (token.kind === "space" || /^\s+$/u.test(token.text || "")) { pendingSpace = true; continue; }
      if (tokenCount && pendingSpace) {
        node = node.next.get(" ");
        if (!node) break;
      }
      for (const char of token.text) {
        node = node.next.get(char);
        if (!node) return best;
      }
      tokenCount++;
      pendingSpace = false;
      if (node.entry) best = { start, end: index, entry: node.entry };
    }
    return best;
  }

  class EnglishMultiwordChunker {
    constructor(resource) {
      if (resource?.schemaVersion !== 1 || resource.profile !== "en-US"
          || resource.sourceHashes?.["spelling_global.txt"] !== GLOBAL_HASH
          || resource.sourceHashes?.["en/multiwords.txt"] !== ENGLISH_HASH
          || resource.counts?.globalEntries !== resource.globalEntries?.length
          || resource.counts?.englishEntries !== resource.englishEntries?.length) {
        throw new Error("LanguageTool en-US multiword resources are missing or do not match their pinned sources.");
      }
      const global = new Map(resource.globalEntries.map(form => [form, { tag: "_NONE_", source: "spelling_global.txt" }]));
      const english = new Map(resource.englishEntries.map(item => [item.form, { tag: item.tag, source: "en/multiwords.txt" }]));
      this.multitokenSpellerEntries = [...new Set([...global.keys(), ...english.keys()])];
      this.globalTrie = makeTrie(global);
      this.englishTrie = makeTrie(english);
      this.counts = { globalSourceEntries: resource.counts.globalEntries, englishSourceEntries: resource.counts.englishEntries,
        globalUniqueForms: global.size, englishUniqueForms: english.size };
      this.sourceHashes = resource.sourceHashes;
    }

    apply(tokens) {
      const spans = [];
      for (const [pass, trie] of [["global", this.globalTrie], ["english", this.englishTrie]]) {
        for (let index = 0; index < tokens.length; index++) {
          if (tokens[index].kind === "space" || /^\s+$/u.test(tokens[index].text || "")) continue;
          const match = scanLongest(tokens, index, trie);
          if (!match) continue;
          const matched = tokens.slice(match.start, match.end + 1).filter(token => token.kind !== "space" && !/^\s+$/u.test(token.text || ""));
          if (pass === "global" || match.entry.tag === "_NONE_") {
            for (const token of matched) token.ignoredBySpeller = true;
          } else if (matched.length === 1) {
            const token = matched[0], reading = { token: token.text, lemma: match.entry.form, tag: match.entry.tag, source: "languagetool-english-multiword" };
            token.contextualReadings ||= [...(token.readings || [])];
            if (!token.contextualReadings.some(item => item.lemma === reading.lemma && item.tag === reading.tag)) token.contextualReadings.push(reading);
            token.readings = token.contextualReadings;
            token.known = true;
            token.ignoredBySpeller = true;
          } else {
            for (const token of matched) {
              const reading = { token: token.text, lemma: match.entry.form, tag: match.entry.tag, source: "languagetool-english-multiword" };
              token.contextualReadings = [reading];
              token.readings = token.contextualReadings;
              token.known = true;
              token.ignoredBySpeller = true;
              token.multiword = { form: match.entry.form, tag: match.entry.tag, start: match.start, end: match.end };
            }
          }
          spans.push({ pass, start: match.start, end: match.end, form: match.entry.form, tag: match.entry.tag });
        }
      }
      return { tokens, spans, counts: this.counts };
    }

    static async load({ baseUrl, fetcher = globalThis.fetch } = {}) {
      const base = baseUrl || globalThis.chrome?.runtime?.getURL("build/resources/en-US/");
      if (!base) throw new Error("An en-US resource base URL is required outside the extension.");
      const response = await fetcher(new URL("en-multiwords.json", base));
      if (!response.ok) throw new Error(`Could not load English multiword data (${response.status}).`);
      return new EnglishMultiwordChunker(await response.json());
    }
  }

  globalThis.CorrectorEnglishMultiwordChunker = EnglishMultiwordChunker;
})();
