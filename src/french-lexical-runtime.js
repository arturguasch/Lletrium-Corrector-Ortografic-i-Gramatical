/* French lexical adapters over the pinned LanguageTool Morfologik payload.
 * This file is part of the proof candidate only. It does not expose a French
 * profile until the rule pipeline and pack descriptor are integrated.
 */
(() => {
  "use strict";

  const SOURCE = "LanguageTool 6.9-SNAPSHOT / french-pos-dict 0.7";
  const BASE = "build/resources/fr/";
  const FILES = Object.freeze({
    pos: { path: "french.dict.gz", gzip: true, bytes: 1137949, sha256: "ec8af90493eac0797e16755503dcaeeab1333204ca63896497a87c05baa3675a" },
    posInfo: { path: "french.info", gzip: false, bytes: 1013, sha256: "4270fa91f3ec08b91f26ff7d4298fa5253df003b24a0a3a9e0aef2836c3ece7f" },
    synthesis: { path: "french_synth.dict.gz", gzip: true, bytes: 649325, sha256: "b841cd7f12bbeaf64778a9b5c19077419225b88ebf6c4d150657bae9eb444f38" },
    synthesisInfo: { path: "french_synth.info", gzip: false, bytes: 94, sha256: "05dc81620a99bda944e44205082a47f811660918f577eca5fe270a1feea5d816" },
    tags: { path: "french_tags.txt", gzip: false, bytes: 3744, sha256: "44204d48d135e67086fb7ff879f346481b31585213e17d5d62faa1b6c2253058" },
    soros: { path: "fr.sor", gzip: false, bytes: 5345, sha256: "cdfc3e44a23f648958b981571c8ae0c7b4d174c58cd050f4cb90063406f2a048" },
    spelling: { path: "spelling.txt.gz", gzip: true, bytes: 454321, sha256: "5f3b8ab8cc2ae43f86bc5acb38a2a191af1854ad6a1b358c86d74cd37e7a4008" },
    spellingCustom: { path: "spelling_custom.txt.gz", gzip: true, bytes: 104, sha256: "450257ba28a2cde9f4e05dd2a4b52c0027dd49cb7d906519311451d98818752e" },
    ignore: { path: "ignore.txt.gz", gzip: true, bytes: 17915, sha256: "2502204c9b99266b83456a03f27bb99581b7119280ecf3b8d9705b18bdedb018" },
    prohibit: { path: "prohibit.txt.gz", gzip: true, bytes: 180, sha256: "95aaf021f6584cbcdb5d38d209711f4e233e3bd176fff863e14cf61bcb5dabf2" },
    multiwords: { path: "multitoken_words.txt.gz", gzip: true, bytes: 703422, sha256: "dfc0bc16dbb950ae54db4abffd344a623f52e12c3eb696b43f419efbfc381550" }
  });
  const encoder = new TextEncoder();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const normalize = value => String(value ?? "").normalize("NFC");
  const sha256 = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), b => b.toString(16).padStart(2, "0")).join("");
  const PREFIX_VERBS = /^(auto|auto-|re-|sur-)([^-].*[aeiouêàéèíòóïü].+[aeiouêàéèíòóïü].*)$/iu;
  const PREFIX_NOUN_ADJ_OPTIONAL_HYPHEN = /^(post-|sur-|mini-|méga-|demi-|péri-|anti-|géo-|nord-|sud-|néo-|ultra-|pro-|inter-|micro-|macro-|sous-|haut-|auto-|ré-|pré-|super-|vice-|hyper-|proto-|grand-|pseudo-)(.+)$/iu;
  const PREFIX_NOUN_ADJ_NO_HYPHEN = /^(mini|méga)([^-].*[aeiouêàéèíòóïü].+[aeiouêàéèíòóïü].*)$/iu;
  const VERB_TAG = /^V .+/u;
  const NOM_ADJ_TAG = /^(?:[NJ] .+|V ppa.*)$/u;
  const AMBIGUOUS_HYPHEN_CASE = new Set(["-Le", "-Les", "-La", "-Elle", "-Elles", "-On", "-Tu", "-Vous", "-Il", "-Ils", "-Ce"]);
  const EGREVES = new Set(["burkinabè", "koinè", "épistémè"]);
  const FRENCH_RUNON_PREFIXES = new Set("non en a le la les pour de du des un une mon ma mes ton ta tes son sa ses leur leurs ce cet".split(" "));

  function parseProperties(bytes) {
    const values = Object.create(null);
    for (const line of decoder.decode(bytes).split(/\r?\n/u)) {
      const row = line.trim();
      if (!row || row.startsWith("#")) continue;
      const at = row.indexOf("=");
      if (at > 0) values[row.slice(0, at).trim()] = row.slice(at + 1).trim();
    }
    return values;
  }

  async function fetchVerified(key, fetcher, baseUrl) {
    const spec = FILES[key];
    const base = baseUrl || globalThis.chrome?.runtime?.getURL(BASE) || new URL(BASE, globalThis.location?.href || "http://localhost/");
    const response = await fetcher(new URL(spec.path, base));
    if (!response.ok) throw new Error(`French resource ${spec.path} is unavailable (${response.status}).`);
    const delivered = new Uint8Array(await response.arrayBuffer());
    let bytes = delivered;
    if (spec.gzip) {
      if (typeof DecompressionStream !== "function") throw new Error("This runtime cannot read the compact French dictionaries.");
      bytes = new Uint8Array(await new Response(new Blob([delivered]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());
    }
    if (bytes.byteLength !== spec.bytes || await sha256(bytes) !== spec.sha256) throw new Error(`French resource integrity check failed: ${spec.path}.`);
    return bytes;
  }

  class FrenchLexicalData {
    constructor({ morphology, synthesisDictionary, tags, info, synthesisInfo, soros, spelling, spellingCustom, ignore, prohibit, multiwords }) {
      const Reader = globalThis.CorrectorCatalanCfsa2Dictionary;
      if (!Reader || !(morphology instanceof Reader) || !(synthesisDictionary instanceof Reader)) throw new Error("The shared CFSA2 reader is unavailable for French.");
      if (info["fsa.dict.separator"] !== "_" || info["fsa.dict.encoding"] !== "utf-8" || info["fsa.dict.encoder"] !== "SUFFIX"
          || synthesisInfo["fsa.dict.separator"] !== "_" || synthesisInfo["fsa.dict.encoding"] !== "utf-8" || synthesisInfo["fsa.dict.encoder"] !== "SUFFIX") {
        throw new Error("The French Morfologik dictionary properties differ from the supported CFSA2 contract.");
      }
      this.morphology = morphology;
      this.synthesisDictionary = synthesisDictionary;
      this.tags = tags;
      this.info = info;
      this.synthesisInfo = synthesisInfo;
      this.frequencyIncluded = info["fsa.dict.frequency-included"] === "true";
      this.sorosSource = decoder.decode(soros);
      this.spellingWords = this.#parseWordList(spelling).concat(this.#parseWordList(spellingCustom));
      this.spellingSet = new Set(this.spellingWords.map(word => word.toLocaleLowerCase("fr")));
      this.ignoredWords = this.#parseWordList(ignore).filter(word => !/\s/u.test(word));
      this.ignoredSet = new Set(this.ignoredWords.map(word => word.toLocaleLowerCase("fr")));
      this.prohibitedSet = new Set(this.#parseWordList(prohibit).map(word => word.toLocaleLowerCase("fr")));
      this.multiwords = this.#parseWordList(multiwords);
      this.readingCache = new Map();
      this.synthesisCache = new Map();
    }

    static async load({ baseUrl, fetcher = globalThis.fetch?.bind(globalThis) } = {}) {
      if (typeof fetcher !== "function") throw new Error("A fetch implementation is required to load French resources.");
      const items = await Promise.all(Object.keys(FILES).map(async key => [key, await fetchVerified(key, fetcher, baseUrl)]));
      const data = Object.fromEntries(items);
      const Reader = globalThis.CorrectorCatalanCfsa2Dictionary;
      const morphology = new Reader(data.pos, { separator: "_", encoding: "utf-8", encoderType: "SUFFIX" });
      const synthesisDictionary = new Reader(data.synthesis, { separator: "_", encoding: "utf-8", encoderType: "SUFFIX" });
      const tags = decoder.decode(data.tags).split(/\r?\n/u).filter(Boolean);
      return new FrenchLexicalData({ morphology, synthesisDictionary, tags, info: parseProperties(data.posInfo), synthesisInfo: parseProperties(data.synthesisInfo), soros: data.soros, spelling: data.spelling, spellingCustom: data.spellingCustom, ignore: data.ignore, prohibit: data.prohibit, multiwords: data.multiwords });
    }

    lookup(form) {
      const word = normalize(form).replaceAll("’", "'");
      if (!word) return [];
      if (this.readingCache.has(word)) return this.readingCache.get(word).map(item => ({ ...item }));
      const variants = [word];
      if (word !== word.toLocaleLowerCase("fr")) variants.push(word.toLocaleLowerCase("fr"));
      if (/oe/iu.test(word)) variants.push(word.replace(/oe/giu, match => match === "OE" ? "Œ" : match === "Oe" ? "Œ" : "œ"));
      const readings = [];
      const seen = new Set();
      for (const candidate of variants) {
        for (const reading of this.morphology.lookup(candidate)) {
          // Morfologik appends one frequency byte to POS tags when this
          // resource flag is enabled. LanguageTool strips it in MorfologikTagger
          // before XML pattern rules see the tag.
          const tag = this.frequencyIncluded && reading.tag?.length > 1 ? reading.tag.slice(0, -1) : reading.tag;
          const key = `${reading.lemma}\0${tag}`;
          if (!seen.has(key)) { seen.add(key); readings.push({ form: word, lemma: reading.lemma, tag }); }
        }
      }
      this.#remember(this.readingCache, word, readings);
      return readings.map(item => ({ ...item }));
    }

    tagWord(input) {
      const word = normalize(input).replaceAll("’", "'");
      let readings = this.lookup(word);
      const lower = word.toLocaleLowerCase("fr");
      const isUpper = word === word.toLocaleUpperCase("fr") && /\p{L}/u.test(word);
      const isCapitalized = /^\p{Lu}/u.test(word);
      const hyphenTitle = word.includes("-") && !AMBIGUOUS_HYPHEN_CASE.has(input) && word === lower.replace(/(^|[-])\p{L}/gu, value => value.toLocaleUpperCase("fr"));
      if ((isUpper || isCapitalized || hyphenTitle) && lower !== word) readings = this.#merge(readings, this.lookup(lower), word);
      if (!readings.length && isUpper) {
        const title = lower.replace(/^\p{L}/u, value => value.toLocaleUpperCase("fr"));
        readings = this.#merge(readings, this.lookup(title), word);
      }
      if (!readings.length) readings = this.#tagWithPrefix(word);
      return { text: word, known: readings.length > 0, readings: readings.length ? readings : [{ form: word, lemma: null, tag: null }] };
    }

    #merge(left, right, form) {
      const seen = new Set(left.map(item => `${item.lemma}\0${item.tag}`));
      for (const reading of right) {
        const key = `${reading.lemma}\0${reading.tag}`;
        if (!seen.has(key)) { seen.add(key); left.push({ ...reading, form }); }
      }
      return left;
    }

    #tagWithPrefix(word) {
      let match = word.match(PREFIX_VERBS);
      if (match) {
        const readings = this.lookup(match[2].toLocaleLowerCase("fr")).filter(item => VERB_TAG.test(item.tag || ""));
        if (readings.length) return readings.map(item => ({ form: word, lemma: `${match[1].toLocaleLowerCase("fr")}${item.lemma}`, tag: item.tag }));
      }
      for (const pattern of [PREFIX_NOUN_ADJ_OPTIONAL_HYPHEN, PREFIX_NOUN_ADJ_NO_HYPHEN]) {
        match = word.match(pattern);
        if (!match) continue;
        const readings = this.lookup(match[2].toLocaleLowerCase("fr")).filter(item => NOM_ADJ_TAG.test(item.tag || ""));
        if (readings.length) return readings.map(item => ({ form: word, lemma: `${match[1].toLocaleLowerCase("fr")}${item.lemma}`, tag: item.tag }));
      }
      return [];
    }

    synthesize(lemma, posTag, posTagRegExp = false) {
      const source = normalize(lemma);
      const key = `${source}\0${posTag}\0${posTagRegExp ? 1 : 0}`;
      if (this.synthesisCache.has(key)) return this.synthesisCache.get(key).slice();
      let tags;
      if (posTagRegExp) {
        let pattern;
        try { pattern = new RegExp(posTag); } catch { return []; }
        tags = this.tags.filter(tag => pattern.test(tag));
      } else tags = [String(posTag)];
      const forms = [];
      const seen = new Set();
      for (const tag of tags) for (const result of this.synthesisDictionary.lookup(`${source}|${tag}`)) {
        const form = result.lemma;
        const lower = form.toLocaleLowerCase("fr");
        if (lower.endsWith("è") && !EGREVES.has(lower)) continue;
        if (lower.startsWith("qq")) continue;
        if (!seen.has(form)) { seen.add(form); forms.push(form); }
      }
      this.#remember(this.synthesisCache, key, forms);
      return forms.slice();
    }

    #parseWordList(bytes) {
      return decoder.decode(bytes).split(/\r?\n/u).map(line => line.trim()).filter(line => line && !line.startsWith("#"));
    }

    createSpeller() {
      const Speller = globalThis.CorrectorEnglishSpeller;
      if (!Speller) throw new Error("The shared Morfologik suggestion search is unavailable.");
      const pairs = Object.create(null), equivalents = Object.create(null);
      const parsePairs = (key, destination) => {
        for (const entry of (this.info[key] || "").split(",")) {
          const [from, to] = entry.trim().split(/\s+/u);
          if (!from || !to) continue;
          (destination[from] ||= []).push(to);
        }
      };
      parsePairs("fsa.dict.speller.replacement-pairs", pairs);
      parsePairs("fsa.dict.speller.equivalent-chars", equivalents);
      const flags = {
        ignorePunctuation: this.info["fsa.dict.speller.ignore-punctuation"] === "true",
        ignoreNumbers: this.info["fsa.dict.speller.ignore-numbers"] === "true",
        ignoreCamelCase: this.info["fsa.dict.speller.ignore-camel-case"] === "true",
        ignoreAllUppercase: this.info["fsa.dict.speller.ignore-all-uppercase"] === "true",
        ignoreDiacritics: this.info["fsa.dict.speller.ignore-diacritics"] === "true",
        convertCase: this.info["fsa.dict.speller.convert-case"] === "true",
        supportRunOnWords: this.info["fsa.dict.speller.runon-words"] === "true"
      };
      const buffer = this.morphology.bytes.buffer.slice(this.morphology.bytes.byteOffset, this.morphology.bytes.byteOffset + this.morphology.bytes.byteLength);
      const search = new Speller(buffer, {
        schema: 1, format: "CFSA2", profile: `${SOURCE.split(" /")[0]} / french-pos-dict 0.7`, locale: "fr",
        separator: "_".codePointAt(0), encoding: "utf-8", sequenceEncoder: "SUFFIX",
        frequencyIncluded: this.frequencyIncluded, equivalentChars: equivalents, replacementPairs: pairs,
        spellerFlags: flags
      });
      const known = word => {
        const value = normalize(word), lower = value.toLocaleLowerCase("fr");
        if (value.includes(" ")) {
          const parts = value.trim().split(/\s+/u);
          return parts.length === 2 && FRENCH_RUNON_PREFIXES.has(parts[0].toLocaleLowerCase("fr")) && known(parts[1]);
        }
        if (this.spellingSet.has(lower) || search.exact(value)) return true;
        if (!flags.convertCase) return false;
        const letters = [...value].filter(char => /\p{L}/u.test(char));
        const allUpper = letters.length > 0 && letters.every(char => char === char.toLocaleUpperCase("fr"));
        const capitalized = /\p{Lu}/u.test([...value][0] || "")
          && [...value].slice(1).every(char => !/\p{L}/u.test(char) || char === char.toLocaleLowerCase("fr"));
        const mixed = !allUpper && !capitalized && letters.some(char => char !== char.toLocaleLowerCase("fr"));
        if (mixed) return false;
        return search.exact(lower) || allUpper && search.exact(value[0] + value.slice(1).toLocaleLowerCase("fr"));
      };
      const elisionCandidates = word => {
        const value = normalize(word).replaceAll("’", "'");
        const cases = [
          { pattern: /^([lntsmd])(h?[aeiouàéèíòóú].*[^è])$/iu, tags: [/^V .*(?:ind|sub)/u, /^V (?:.* )?inf$/u, /^[NJZ] .* (?:s|sp)$/u, /^V .*ppa.* s/u] },
          { pattern: /^(d)(h?[aeiouàéèíòóú].+)$/iu, tags: [/^[NJZ] .* (?:p|sp)$/u, /^V .*ppa.* p/u] },
          { pattern: /^(c)([eiéèê].*)$/iu, tags: [/^V .* 3 s/u] }
        ];
        for (const { pattern, tags } of cases) {
          const match = value.match(pattern);
          if (!match) continue;
          // Only split when the elided remainder is an exact lexical entry.
          // Fuzzy tails produced many false apostrophe suggestions for ordinary typos.
          const words = [match[2]];
          const output = [];
          for (const candidate of words) {
            if (!this.lookup(candidate).some(reading => tags.some(tag => tag.test(reading.tag || "")))) continue;
            const result = `${match[1]}'${candidate}`;
            if (!output.includes(result)) output.push(result);
          }
          if (output.length) return output;
        }
        return [];
      };
      const isMisspelled = (word, { personalWords = null } = {}) => {
        const value = normalize(word), lower = value.toLocaleLowerCase("fr");
        if (!value || /^(?:[cçjnmstld]|qu|jusqu|lorsqu|puisqu|quoiqu)['’]$/u.test(lower) || personalWords?.has(lower) || this.ignoredSet.has(lower)) return false;
        const letters = [...value].filter(char => /[\p{L}\p{Nl}]/u.test(char));
        const isAlphabetic = [...value].length !== 1 || letters.length > 0;
        if (flags.ignorePunctuation && !isAlphabetic) return false;
        if (flags.ignoreNumbers && /\p{Nd}/u.test(value)) return false;
        const allUpper = letters.length > 0 && letters.every(char => char === char.toLocaleUpperCase("fr"));
        if (flags.ignoreAllUppercase && isAlphabetic && allUpper) return false;
        if (this.prohibitedSet.has(lower)) return true;
        return !known(value);
      };
      const suggest = (word, limit = 10) => {
        const value = normalize(word), output = [], seen = new Set();
        if (!isMisspelled(value)) return output;
        for (const candidate of elisionCandidates(value)) {
          const key = candidate.toLocaleLowerCase("fr");
          if (!this.prohibitedSet.has(key) && !this.ignoredSet.has(key) && !seen.has(key)) { seen.add(key); output.push(candidate); }
        }
        for (const distance of [1, 2, 3]) {
          for (const item of search.findSimilarWordCandidates(value, distance)) {
            const candidate = item.word, key = candidate.toLocaleLowerCase("fr");
            const parts = candidate.trim().split(/\s+/u);
            const isFrenchRunOn = parts.length === 2 && FRENCH_RUNON_PREFIXES.has(parts[0].toLocaleLowerCase("fr")) && parts[1].length > 1;
            if (key !== value.toLocaleLowerCase("fr") && (!candidate.includes(" ") || isFrenchRunOn) && known(candidate) && !this.prohibitedSet.has(key) && !this.ignoredSet.has(key) && !seen.has(key)) {
              seen.add(key); output.push(candidate);
            }
          }
          if (output.length) break;
        }
        const preferred = output.filter(candidate => candidate.includes(" "));
        return [...preferred, ...output.filter(candidate => !candidate.includes(" "))].slice(0, limit);
      };
      return Object.freeze({ source: SOURCE, flags, isMisspelled, suggest, getDiagnostics: () => ({ source: SOURCE, supplementalEntries: this.spellingSet.size, ignoredSingleWordEntries: this.ignoredSet.size, prohibitedEntries: this.prohibitedSet.size, frenchElisionSuggestions: "morphology-filtered subset", morphology: this.morphology.getStats() }) });
    }

    #remember(cache, key, value) {
      if (cache.size >= 12000) cache.delete(cache.keys().next().value);
      cache.set(key, value.map(item => typeof item === "string" ? item : { ...item }));
    }

    getStats() {
      return { source: SOURCE, profileFamily: "fr", morphology: this.morphology.getStats(), synthesis: this.synthesisDictionary.getStats(), synthesisTags: this.tags.length, spellingOverlayEntries: this.spellingSet.size, ignoredSingleWordEntries: this.ignoredSet.size, prohibitedEntries: this.prohibitedSet.size };
    }
  }

  globalThis.CorrectorFrenchLexicalData = Object.freeze({ SOURCE, FILES, FrenchLexicalData });
})();
