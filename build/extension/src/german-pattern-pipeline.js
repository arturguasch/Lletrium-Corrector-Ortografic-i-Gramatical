/* German LanguageTool rule pipeline used by the extension worker. */
(() => {
  "use strict";

  const PROFILES = Object.freeze(["de-DE", "de-AT", "de-CH"]);
  const RULES_URL = "src/dictionaries/german/german-pattern-rule-candidates.json.gz";
  const REGEX_URL = "src/dictionaries/german/german-regex-rules.json.gz";
  const DISAMBIGUATION_URL = "src/dictionaries/german/german-disambiguation-rules.json.gz";
  const DIRECT_RULE_DATA_URL = "src/dictionaries/german/german-direct-rule-data.json.gz";
  const GERMAN_FILTER_NAMES = Object.freeze({
    "org.languagetool.rules.de.DateCheckFilter": "GermanDateCheckFilter",
    "org.languagetool.rules.de.YMDDateCheckFilter": "GermanYMDDateCheckFilter",
    "org.languagetool.rules.de.FutureDateFilter": "GermanFutureDateFilter",
    "org.languagetool.rules.de.NewYearDateFilter": "GermanNewYearDateFilter",
    "org.languagetool.rules.de.YMDNewYearDateFilter": "GermanYMDNewYearDateFilter",
    "org.languagetool.rules.DateRangeChecker": "GermanDateRangeChecker",
    "org.languagetool.rules.de.GermanNumberInWordFilter": "GermanNumberInWordFilter",
    "org.languagetool.rules.de.InsertCommaFilter": "GermanInsertCommaFilter",
    "org.languagetool.rules.de.PotentialCompoundFilter": "GermanPotentialCompoundFilter",
    "org.languagetool.rules.de.CompoundCheckFilter": "GermanCompoundCheckFilter",
    "org.languagetool.rules.de.RemoveUnknownCompoundsFilter": "GermanRemoveUnknownCompoundsFilter",
    "org.languagetool.rules.de.ValidWordFilter": "GermanValidWordFilter",
    "org.languagetool.rules.spelling.multitoken.MultitokenSpellerFilter": "GermanMultitokenSpellerFilter"
  });
  const SRX_URL = "src/dictionaries/german/german-srx.json";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let englishMorphologyPromise = null;
  async function loadEnglishMorphology(fetcher) {
    if (!globalThis.CorrectorEnglishMorphology?.load) throw new Error("The local English POS tagger required by German disambiguation is unavailable.");
    if (!englishMorphologyPromise) {
      const baseUrl = globalThis.chrome?.runtime?.getURL?.("build/resources/fr/en-pos/")
        || (globalThis.location?.href ? new URL("/build/resources/fr/en-pos/", globalThis.location.href).href : null);
      if (!baseUrl) throw new Error("The local en-US POS resources are unavailable for German disambiguation.");
      englishMorphologyPromise = globalThis.CorrectorEnglishMorphology.load({ baseUrl, fetcher }).catch(error => {
        englishMorphologyPromise = null;
        throw error;
      });
    }
    return englishMorphologyPromise;
  }
  const TOKENIZING_CHARACTERS = new Set(Array.from(
    " \u00a0\u115f\u1160\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u200c\u200d\u200e\u200f\u2028\u2029\u202a\u202b\u202c\u202d\u202e\u202f\u205f\u2060\u2061\u2062\u2063\u206a\u206b\u206c\u206d\u206e\u206f\u3000\u3164\ufeff\uffa0\ufff9\ufffa\ufffb¦‖∣|,.;()[]{}=*#∗+×·÷<>!?:~/\\\"'«»„”“‘’`´‛′›‹…¿¡‼⁇⁈⁉™®\u203d\u00b6\uffeb\u2e2e\u2012\u2013\u2014\u2015\u2500\u3161✓●○◆➢■□★❏➔↵❖▪❑•⮚≥→⇾⇉⇒⇨⇛¹²³⁰ⁱ⁴⁵⁶⁷⁸⁹\t\n\r\u000b_‚"
  ));
  const EMAIL = /(?<!:)@?\b[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:\[[0-9]{1,3}(?:\.[0-9]{1,3}){3}\]|(?:[a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})\b/gu;
  const URL_PATTERN = /\b(?:https?|wss?|ftps?|sftp|file|mailto|tel|sms|git|ssh|data|magnet|smb|slack|spotify):\/\/[^\s<>"“”]+|\bwww\.[^\s<>"“”]+|\b(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z]{2,}\/[^\s<>"“”]*/giu;

  function requireProfile(profile) {
    if (!PROFILES.includes(profile)) throw new Error(`Unsupported German profile: ${profile}`);
    return profile;
  }

  async function gunzip(bytes) {
    if (typeof DecompressionStream !== "function") throw new Error("This runtime cannot read the compact German rule data.");
    const input = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    return new Uint8Array(await new Response(new Blob([input]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());
  }

  async function fetchJson(url, fetcher) {
    const response = await fetcher(new URL(url, globalThis.chrome?.runtime?.getURL("/") || new URL("/", location.href)));
    if (!response.ok) throw new Error(`German rule resource is unavailable (${response.status}): ${url}`);
    const bytes = url.endsWith(".gz") ? await gunzip(await response.arrayBuffer()) : new Uint8Array(await response.arrayBuffer());
    return JSON.parse(decoder.decode(bytes));
  }

  async function readPackedBytes(relativePath, reader) {
    const value = await reader(`build/resources/de/${relativePath}`);
    if (!value) throw new Error(`German language-pack resource is missing: ${relativePath}`);
    let bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
    if (bytes[0] === 0x1f && bytes[1] === 0x8b) bytes = await gunzip(bytes);
    return bytes;
  }

  function parseInfo(text) {
    const values = Object.create(null);
    for (const line of String(text).split(/\r?\n/u)) {
      const row = line.trim(), equals = row.indexOf("=");
      if (row && !row.startsWith("#") && equals > 0) values[row.slice(0, equals).trim()] = row.slice(equals + 1).trim();
    }
    return values;
  }

  function parseReplacementPairs(value) {
    const pairs = Object.create(null);
    for (const entry of String(value || "").split(/\s*,\s*/u).filter(Boolean)) {
      const match = entry.match(/^(\S+)\s+(\S+)$/u);
      if (!match) throw new Error(`Invalid German Morfologik replacement pair: ${entry}`);
      (pairs[match[1]] ||= []).push(match[2]);
    }
    return pairs;
  }

  function parseGermanCompoundPairs(text) {
    const pairs = new Map();
    for (const line of String(text).split(/\r?\n/u)) {
      const value = line.replace(/#.*$/u, "").trim();
      if (!value) continue;
      const parts = value.split(";");
      if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) throw new Error("German addedCompound.txt has an invalid row.");
      const first = parts[0].trim().toLocaleLowerCase("de"), second = parts[1].trim().toLocaleLowerCase("de");
      if (!pairs.has(first)) pairs.set(first, new Set());
      pairs.get(first).add(second);
    }
    return pairs;
  }

  function isGermanMixedCase(value) {
    const chars = [...String(value)];
    const letters = chars.filter(character => /\p{L}/u.test(character));
    if (!letters.length) return false;
    const upper = character => character === character.toLocaleUpperCase("de");
    const lower = character => character === character.toLocaleLowerCase("de");
    const allUpper = letters.every(upper), allLower = letters.every(lower);
    const capitalized = /\p{Lu}/u.test(chars[0] || "")
      && chars.slice(1).every(character => !/\p{L}/u.test(character) || lower(character));
    return !allUpper && !allLower && !capitalized;
  }

  function buildProfileRules(bundle, profile) {
    if (bundle?.schemaVersion !== 1 || bundle.kind !== "lletrium-german-pattern-rules"
        || !bundle.profiles?.includes(profile) || !Array.isArray(bundle.commonRules)
        || !Array.isArray(bundle.profileRules?.[profile])) throw new Error(`German PatternRule bundle is incompatible with ${profile}.`);
    const definitions = bundle.unificationDefinitions || {};
    const rawRules = [...bundle.commonRules, ...bundle.profileRules[profile]];
    const expected = bundle.profileRuleCounts?.[profile];
    if (!Number.isSafeInteger(expected) || rawRules.length !== expected) throw new Error(`German PatternRule count mismatch for ${profile}: ${rawRules.length}/${expected}.`);
    const rules = [], inactiveRules = [];
    for (const rule of rawRules) {
      const converted = convertPatternRule(rule, definitions);
      if (converted) rules.push(...converted);
      else inactiveRules.push({ id: rule.fullId || rule.id, reason: rule.filterClass && !GERMAN_FILTER_NAMES[rule.filterClass]
        ? `unconnected-filter:${rule.filterClass}` : "unconnected-unification" });
    }
    return { rules, inactiveRules };
  }

  function convertPatternToken(source) {
    if (!source || source.phraseName || source.orGroup?.length) throw new Error("German PatternRule contains an unexpanded phrase or OR token.");
    if (source.regexp && /^\\([1-9])$/u.test(source.text || "") && !source.pos && !source.andGroup?.length) {
      return { reference: { no: Number(source.text.slice(1)) - 1 } };
    }
    const token = {};
    if (source.text && source.text.length || source.regexp) token.text = source.text;
    if (source.regexp) token.regexp = true;
    if (source.caseSensitive) token.caseSensitive = true;
    if (source.pos) { token.postag = source.pos; token.postagRegexp = Boolean(source.posRegexp); }
    if (source.pos === "SENT_START" && !source.text) token.postag = "SENT_START", token.postagRegexp = false;
    if (source.inflected) token.inflected = true;
    if (source.negated) token.negate = true;
    if (source.posNegated) token.negatePos = true;
    if (source.minOccurrence !== 1) token.min = source.minOccurrence;
    if (source.maxOccurrence !== 1) token.max = source.maxOccurrence;
    if (source.skipNext) token.skip = source.skipNext;
    if (source.whitespaceTest) token.spaceBefore = Boolean(source.whitespaceBefore);
    if (source.chunkTag) token.chunk = source.chunkTag;
    if (source.andGroup?.length) return { and: [token, ...source.andGroup.map(convertPatternToken)] };
    const exceptions = [
      ...(source.exceptions || []).map(exception => ({ ...convertPatternToken(exception), ...(source.exceptionsScopeNext ? { scope: "next" } : {}) })),
      ...(source.previousExceptions || []).map(exception => ({ ...convertPatternToken(exception), scope: "previous" }))
    ];
    if (exceptions.length) token.exceptions = exceptions;
    if (source.reference) {
      const reference = source.reference;
      token.reference = {
        no: reference.tokenRef,
        ...(reference.posTag ? { postag: reference.posTag, postagRegexp: Boolean(reference.posRegexp) } : {}),
        ...(reference.posTagReplace ? { postagReplace: reference.posTagReplace } : {}),
        ...(reference.regexMatch ? { regexpMatch: reference.regexMatch } : {}),
        ...(reference.regexReplace ? { regexpReplace: reference.regexReplace } : {}),
        ...(reference.caseConversion && reference.caseConversion !== "NONE" ? { caseConversion: reference.caseConversion.toLowerCase() } : {}),
        ...(reference.includeSkipped && reference.includeSkipped !== "NONE" ? { includeSkipped: reference.includeSkipped.toLowerCase() } : {}),
        ...(reference.staticLemma ? { literal: reference.staticLemma } : {}),
        ...(reference.setsPos ? { setPos: true } : {})
      };
    }
    return token;
  }

  function sourceMarker(pattern, rule) {
    const marked = pattern.map((token, index) => token.insideMarker ? index : -1).filter(index => index >= 0);
    if (marked.length) {
      const start = marked[0], end = marked.at(-1) + 1;
      if (marked.length !== end - start) throw new Error(`Non-contiguous LanguageTool marker in ${rule.fullId}.`);
      return { start, end };
    }
    const start = rule.startPositionCorrection ?? 0;
    const end = pattern.length + (rule.endPositionCorrection ?? 0);
    return start === 0 && end === pattern.length ? null : { start, end };
  }

  function convertMatchReferences(template, references = []) {
    let referenceIndex = 0;
    const parts = [];
    let cursor = 0, match;
    const expression = /\\([0-9]+)/gu;
    while ((match = expression.exec(template))) {
      if (match.index > cursor) parts.push(template.slice(cursor, match.index));
      const source = references[referenceIndex++];
      if (!source) parts.push(match[0]);
      else parts.push({ no: source.tokenRef + 1,
        ...(source.posTag ? { postag: source.posTag, postagRegexp: Boolean(source.posRegexp) } : {}),
        ...(source.posTagReplace ? { postagReplace: source.posTagReplace } : {}),
        ...(source.regexMatch ? { regexpMatch: source.regexMatch } : {}),
        ...(source.regexReplace ? { regexpReplace: source.regexReplace } : {}),
        ...(source.caseConversion && source.caseConversion !== "NONE" ? { caseConversion: source.caseConversion.toLowerCase() } : {}),
        ...(source.includeSkipped && source.includeSkipped !== "NONE" ? { includeSkipped: source.includeSkipped.toLowerCase() } : {}),
        ...(source.staticLemma ? { literal: source.staticLemma } : {}),
        ...(source.setsPos ? { setPos: true } : {}) });
      cursor = expression.lastIndex;
    }
    if (cursor < template.length) parts.push(template.slice(cursor));
    return parts.length ? parts : [""];
  }

  function extractSuggestions(template, references = []) {
    const suggestions = [];
    let referenceIndex = 0;
    const message = String(template || "").replace(/<suggestion>([\s\S]*?)<\/suggestion>/gu, (_whole, body) => {
      const refs = [];
      for (const _match of body.matchAll(/\\[0-9]+/gu)) if (references[referenceIndex]) refs.push(references[referenceIndex++]);
      else referenceIndex++;
      suggestions.push(convertMatchReferences(body, refs));
      return "";
    });
    return { message, suggestions };
  }

  function expandOrPatterns(pattern) {
    let variants = [{ pattern: [], choices: [] }];
    for (const token of pattern) {
      if (token.phraseName) throw new Error("German PatternRule contains an unexpanded phrase token.");
      const alternatives = [token, ...(token.orGroup || [])];
      variants = variants.flatMap(variant => alternatives.map((alternative, choice) => ({
        pattern: [...variant.pattern, { ...alternative, orGroup: [] }],
        choices: [...variant.choices, choice]
      })));
    }
    return variants;
  }

  function parseFilterArguments(value, ruleId) {
    const args = Object.create(null), input = String(value || "");
    const expression = /([A-Za-z][A-Za-z0-9]*):([^\s]+)/gu;
    let cursor = 0, match;
    while ((match = expression.exec(input))) {
      if (input.slice(cursor, match.index).trim()) throw new Error(`Malformed German filter arguments in ${ruleId}.`);
      if (Object.hasOwn(args, match[1])) throw new Error(`Duplicate German filter argument ${match[1]} in ${ruleId}.`);
      args[match[1]] = match[2]; cursor = expression.lastIndex;
    }
    if (input.slice(cursor).trim()) throw new Error(`Malformed German filter arguments in ${ruleId}.`);
    return args;
  }

  function convertPatternRule(source, unificationDefinitions) {
    const filterName = source.filterClass ? GERMAN_FILTER_NAMES[source.filterClass] : null;
    if (source.filterClass && !filterName || source.testUnification) return null;
    const { message, suggestions: inlineSuggestions } = extractSuggestions(source.message, source.suggestionMatches || []);
    const extraSuggestions = extractSuggestions(source.suggestionsOutMsg, source.suggestionMatchesOutMsg || []).suggestions;
    const categoryId = source.categoryId;
    const category = source.matchType === "Hint" || ["STYLE", "COLLOQUIALISMS", "REDUNDANCY", "GENDER_NEUTRALITY"].includes(categoryId)
      ? "style" : ["TYPOS", "MULTITOKEN_SPELLING", "CASING", "COMPOUNDING", "PROPER_NOUNS", "EMPFOHLENE_RECHTSCHREIBUNG"].includes(categoryId)
        ? "spelling" : ["PUNCTUATION", "TYPOGRAPHY", "HILFESTELLUNG_KOMMASETZUNG"].includes(categoryId) ? "typography" : "grammar";
    return expandOrPatterns(source.pattern).map((variant, index, all) => {
      const pattern = variant.pattern.map(convertPatternToken);
      const marker = sourceMarker(variant.pattern, source);
      const toAntiPattern = anti => ({ pattern: anti.pattern.map(convertPatternToken), ...(sourceMarker(anti.pattern, anti) ? { marker: sourceMarker(anti.pattern, anti) } : {}) });
      const rule = { format: "lt-xml-v1", id: `${source.fullId || `${source.id}[${source.subId || 1}]`}${all.length > 1 ? `:OR${index + 1}` : ""}`,
        category, pattern, ...(marker ? { marker } : {}),
        ...(source.antiPatterns?.length ? { antipatterns: source.antiPatterns.map(toAntiPattern) } : {}),
        ...(filterName ? { filter: { name: filterName, args: parseFilterArguments(source.filterArguments, source.fullId || source.id) } } : {}),
        message: [message.replace(/<\/?suggestion>/gu, "")], suggestions: [...inlineSuggestions, ...extraSuggestions],
        ruleIdPrefix: "DE_LT_XML_", ruleGroupId: source.id,
        qualityCategory: category === "style" ? "style" : "grammar",
        examples: (source.examples || []).map(example => ({ text: example.example || "", corrections: example.correction ? [example.correction] : [], type: example.correction ? "incorrect" : "correct" })) };
      if (source.minPrevMatches) { rule.minPrevMatches = source.minPrevMatches; rule.distanceTokens = source.distanceTokens; rule.repetitionGroup = source.ruleGroupId || source.id; }
      if (source.unificationDefinitions) rule.equivalences = unificationDefinitions;
      return rule;
    });
  }

  function buildProfileRegexRules(bundle, profile) {
    if (bundle?.schemaVersion !== 1 || bundle.kind !== "lletrium-german-regex-rules"
        || !bundle.profiles?.includes(profile) || !Array.isArray(bundle.commonRules)
        || !Array.isArray(bundle.profileRules?.[profile])) throw new Error(`German RegexPatternRule bundle is incompatible with ${profile}.`);
    const rules = [...bundle.commonRules, ...bundle.profileRules[profile]];
    const expected = bundle.profileRuleCounts?.[profile];
    if (!Number.isSafeInteger(expected) || rules.length !== expected) throw new Error(`German RegexPatternRule count mismatch for ${profile}: ${rules.length}/${expected}.`);
    return rules;
  }

  function compileRegex(source, caseSensitive = true) {
    if (!globalThis.CorrectorJavaCaseRegex?.compile) throw new Error("The LanguageTool-compatible regex compiler is unavailable.");
    // German's upstream regex inventory has one embedded Java case-insensitive
    // ASCII range inside a lookahead. Java's (?i)[a-z] is equivalent to this
    // explicit range (without UNICODE_CASE); normalize it locally so we do not
    // change the shared regex compiler used by other languages.
    const normalized = String(source).replace(/\(\?i\)\[a-z\]/gu, "[A-Za-z]");
    const expression = globalThis.CorrectorJavaCaseRegex.compile(normalized, caseSensitive, true);
    return new RegExp(expression.source, `${expression.flags}d`);
  }

  function renderRegexRule(template, matches, match, locale) {
    let index = 0;
    return String(template || "").replace(/\\([0-9])/gu, (_reference, group) => {
      const spec = matches[index++] || {};
      let value = match[Number(group)] || "";
      if (spec.regexReplace != null) {
        const expression = compileRegex(spec.regexMatch || "", true);
        value = value.replace(new RegExp(expression.source, expression.flags.replace("g", "").replace("d", "")), spec.regexReplace);
        if (spec.caseConversion === "STARTUPPER") value = value.replace(/^\p{L}/u, character => character.toLocaleUpperCase(locale));
        else if (spec.caseConversion === "ALLUPPER") value = value.toLocaleUpperCase(locale);
        else if (spec.caseConversion === "ALLLOWER") value = value.toLocaleLowerCase(locale);
      }
      return value;
    });
  }

  class GermanSentenceTokenizer {
    constructor(resource) {
      if (resource?.schemaVersion !== 1 || resource.languageCode !== "de" || !Array.isArray(resource.rules)
          || resource.rules.length !== resource.ruleCount) throw new Error("German SRX data is incompatible.");
      if (!globalThis.CorrectorJavaCaseRegex?.compile) throw new Error("German SRX requires the LanguageTool-compatible regex compiler.");
      this.sourceSha256 = resource.sourceSha256;
      this.rules = resource.rules.map(rule => {
        const before = globalThis.CorrectorJavaCaseRegex.compile(rule.before, true);
        return { split: rule.break === "yes", before: new RegExp(before.source, `${before.flags.replace("g", "")}g`),
          after: rule.after ? globalThis.CorrectorJavaCaseRegex.compile(`^${rule.after}`, true) : null };
      });
    }

    segment(text) {
      if (typeof text !== "string") throw new TypeError("German sentence input must be a string.");
      if (!text) return [];
      const events = new Map(), noBreaks = new Set();
      for (let order = 0; order < this.rules.length; order++) {
        const rule = this.rules[order]; rule.before.lastIndex = 0; let match;
        while ((match = rule.before.exec(text))) {
          const boundary = match.index + match[0].length;
          if (!match[0].length) rule.before.lastIndex = Math.max(rule.before.lastIndex, match.index + 1);
          if (boundary <= 0 || boundary >= text.length || rule.after && !rule.after.test(text.slice(boundary))) continue;
          if (!rule.split) noBreaks.add(boundary);
          else {
            const previous = events.get(boundary);
            if (!previous || order < previous.order) events.set(boundary, { boundary, order });
          }
        }
      }
      const paragraphs = new Set();
      for (const match of text.matchAll(/(?:\r?\n[\t \f\v]*){2,}/gu)) {
        const boundary = match.index + match[0].length;
        if (boundary > 0 && boundary < text.length) { paragraphs.add(boundary); events.set(boundary, { boundary, order: -1 }); }
      }
      const output = []; let start = 0;
      for (const event of [...events.values()].sort((a, b) => a.boundary - b.boundary || a.order - b.order)) {
        if (event.boundary <= start) continue;
        let veto = !paragraphs.has(event.boundary) && noBreaks.has(event.boundary);
        for (let at = event.boundary - 1; !paragraphs.has(event.boundary) && !veto && at >= start && /^\s$/u.test(text[at]); at--) veto = noBreaks.has(at);
        if (veto) continue;
        output.push({ text: text.slice(start, event.boundary), start, end: event.boundary }); start = event.boundary;
      }
      if (start < text.length) output.push({ text: text.slice(start), start, end: text.length });
      // SRX resources may intentionally omit boundaries used in ordinary prose.
      // Recover a boundary before an uppercase sentence start, unless it is a common abbreviation.
      const recovered = [];
      for (const sentence of output) {
        const boundaries = [];
        const slice = text.slice(sentence.start, sentence.end);
        for (const match of slice.matchAll(/[.!?][”’"»)]*\s+(?=\p{Lu})/gu)) {
          const boundary = sentence.start + match.index + match[0].length;
          const preceding = text.slice(Math.max(sentence.start, boundary - 28), boundary);
          if (/(?:\b(?:z\s*\.\s*B|u\s*\.\s*a|d\s*\.\s*h|bzw)\.|(?:\b[A-ZÄÖÜ]\.){1,3})\s*$/iu.test(preceding)) continue;
          if ([...events.keys()].some(existing => Math.abs(existing - boundary) <= 2)) continue;
          boundaries.push(boundary);
        }
        let partStart = sentence.start;
        for (const boundary of boundaries) {
          if (boundary > partStart && boundary < sentence.end) {
            recovered.push({ text: text.slice(partStart, boundary), start: partStart, end: boundary });
            partStart = boundary;
          }
        }
        if (partStart < sentence.end) recovered.push({ text: text.slice(partStart, sentence.end), start: partStart, end: sentence.end });
      }
      return recovered;
    }
  }

  class GermanMorphology {
    constructor(dictionary, profile) {
      this.dictionary = dictionary;
      this.profile = requireProfile(profile);
      this.lookupCount = 0;
    }

    lookup(value, options = {}) {
      const token = String(value ?? "").normalize("NFC");
      if (!token) return [];
      this.lookupCount++;
      const lower = token.toLocaleLowerCase("de");
      const mixedCase = /\p{Ll}/u.test(token) && /\p{Lu}/u.test(token.slice(1));
      const candidates = [token];
      if (!options.lowercaseFallback && token !== lower && !mixedCase) candidates.push(lower);
      if (!options.lowercaseFallback && !mixedCase && token === lower) candidates.push(token[0].toLocaleUpperCase("de") + token.slice(1));
      let readings = [];
      for (const candidate of candidates) {
        try { readings.push(...this.dictionary.lookup(candidate)); }
        catch (error) { if (!/not representable|no representable|caràcter no representable/iu.test(String(error?.message))) throw error; }
        if (readings.length) break;
      }
      if (!readings.length && this.profile === "de-CH" && token.includes("ss")) {
        const swissLookup = token.replaceAll("ss", "ß");
        if (swissLookup !== token) {
          try { readings = this.dictionary.lookup(swissLookup).map(reading => ({ ...reading, token })); }
          catch (error) { if (!/not representable|no representable|caràcter no representable/iu.test(String(error?.message))) throw error; }
        }
      }
      const seen = new Set();
      return readings.filter(reading => {
        const key = `${reading.lemma ?? ""}\0${reading.tag ?? "UNKNOWN"}`;
        if (seen.has(key)) return false;
        seen.add(key); return true;
      });
    }
  }

  class GermanCompoundAnalyzer {
    constructor(morphology, { minimumPartLength = 3, maximumParts = 10 } = {}) {
      this.morphology = morphology;
      this.minimumPartLength = minimumPartLength;
      this.maximumParts = maximumParts;
      this.cache = new Map();
      this.lookups = 0;
      this.linkElements = ["", "s", "es", "n", "en", "er", "e"];
    }

    split(value) {
      const word = String(value ?? "").normalize("NFC");
      const lower = word.toLocaleLowerCase("de");
      if (!/^[\p{L}]+$/u.test(lower) || lower.length < this.minimumPartLength * 2) return null;
      if (this.cache.has(lower)) return this.cache.get(lower)?.map(part => ({ ...part })) || null;
      const failed = new Set();
      const find = (position, partCount) => {
        if (position === lower.length) return partCount >= 2 ? [] : null;
        if (partCount >= this.maximumParts) return null;
        const state = `${position}:${partCount}`;
        if (failed.has(state)) return null;
        for (let end = lower.length; end - position >= this.minimumPartLength; end--) {
          const part = lower.slice(position, end);
          // POS dictionaries contain consonant clusters such as "str" as
          // abbreviations; those must not turn misspellings into compounds.
          if (!/[aeiouyäöü]/u.test(part)) continue;
          this.lookups++;
          if (!this.morphology.lookup(part).length) continue;
          if (end === lower.length) {
            if (partCount >= 1) return [{ text: part, link: "" }];
            continue;
          }
          for (const link of this.linkElements) {
            if (link && !lower.startsWith(link, end)) continue;
            const next = end + link.length;
            if (lower.length - next < this.minimumPartLength) continue;
            const tail = find(next, partCount + 1);
            if (tail) return [{ text: part, link }, ...tail];
          }
        }
        failed.add(state);
        return null;
      };
      const parts = find(0, 0);
      if (this.cache.size >= 4096) this.cache.delete(this.cache.keys().next().value);
      this.cache.set(lower, parts ? parts.map(part => ({ ...part })) : null);
      return parts;
    }

    isKnownCompound(value) { return Boolean(this.split(value)); }
  }

  class GermanWordTokenizer {
    constructor(profile, morphology) {
      this.profile = requireProfile(profile);
      this.morphology = morphology;
    }

    tokenize(text) {
      const tokens = []; let current = "";
      for (let index = 0; index < text.length; index++) {
        const character = text[index];
        if (TOKENIZING_CHARACTERS.has(character)) {
          if (current) tokens.push(current), current = "";
          tokens.push(character);
        } else current += character;
      }
      if (current) tokens.push(current);
      const joined = tokens.join("");
      const spans = []; let offset = 0;
      for (const token of tokens) { spans.push({ token, start: offset, end: offset + token.length }); offset += token.length; }
      EMAIL.lastIndex = 0; URL_PATTERN.lastIndex = 0;
      const ranges = [...joined.matchAll(EMAIL)].map(match => ({ start: match.index, end: match.index + match[0].length, value: match[0] }))
        .concat([...joined.matchAll(URL_PATTERN)].map(match => {
          let value = match[0];
          while (/[.,;:!?]$/u.test(value)) value = value.slice(0, -1);
          return { start: match.index, end: match.index + value.length, value };
        })).filter(range => range.end > range.start).sort((a, b) => a.start - b.start || b.end - a.end);
      const output = []; let tokenIndex = 0, rangeIndex = 0;
      while (tokenIndex < spans.length) {
        const range = ranges[rangeIndex];
        if (!range || spans[tokenIndex].start !== range.start) { output.push(spans[tokenIndex++].token); continue; }
        output.push(range.value);
        while (tokenIndex < spans.length && spans[tokenIndex].end <= range.end) tokenIndex++;
        rangeIndex++;
      }
      return output;
    }

    tokenizeRows(text) {
      const rows = []; let offset = 0;
      for (const token of this.tokenize(text)) {
        const start = offset, end = start + token.length; offset = end;
        if (/^\s+$/u.test(token)) continue;
        const readings = this.morphology.lookup(token).map(reading => ({ lemma: reading.lemma, tag: reading.tag || "UNKNOWN" }));
        rows.push({ token, start, end, whitespaceBefore: text.slice(rows.at(-1)?.end || 0, start), ltReadings: readings.length ? readings : [{ lemma: null, tag: "UNKNOWN" }] });
      }
      if (offset !== text.length) throw new Error(`German WordTokenizer offset mismatch: ${offset}/${text.length}.`);
      return rows;
    }
  }

  class GermanRegexRules {
    constructor(rules, locale = "de") {
      this.rules = rules.map(rule => {
        if (rule.filterClass) throw new Error(`Unsupported German RegexPatternRule filter: ${rule.filterClass}`);
        return { ...rule, regex: compileRegex(rule.pattern, rule.caseSensitive) };
      });
      this.locale = locale;
    }

    check(sentences, { checkLevel = "DEFAULT", ruleIds = null } = {}) {
      const issues = [];
      for (const sentence of sentences) for (const rule of this.rules) {
        if (rule.picky && checkLevel !== "PICKY" || ruleIds && !ruleIds.has(rule.id) && !ruleIds.has(rule.fullId)) continue;
        rule.regex.lastIndex = 0;
        for (const match of sentence.text.matchAll(rule.regex)) {
          const range = match.indices?.[rule.markGroup ?? 0];
          if (!range || range[1] <= range[0]) continue;
          const start = sentence.start + range[0], end = sentence.start + range[1];
          const message = renderRegexRule(rule.message, rule.matches, match, this.locale);
          const output = renderRegexRule(rule.suggestionsOutMsg, rule.matchesOutMsg, match, this.locale);
          const suggestions = [...(message + output).matchAll(/<suggestion>(.*?)<\/suggestion>/gu)].map(value => value[1]);
          issues.push({ id: `${rule.fullId}:${start}:${end}`, ruleId: rule.id,
            category: rule.category === "STYLE" ? "style" : "typography", severity: "Other",
            start, end, replacementStart: start, replacementEnd: end, text: sentence.text.slice(range[0], range[1]),
            message: message.replace(/<\/?suggestion>/gu, ""), shortMessage: rule.shortMessage, suggestions,
            _languagePriority: rule.priority, _registrationOrder: rule.registrationOrder,
            _picky: rule.picky, _includedAllAtOnce: rule.includedAllAtOnce });
        }
      }
      return issues;
    }
  }

  class GermanPatternPipeline {
    constructor({ profile, morphology, tokenizer, sentenceTokenizer, rules, regexRules, runtime, speller = null,
      disambiguation = null, directRuleData = null, inactiveRules = [] }) {
      this.profile = requireProfile(profile);
      this.morphology = morphology;
      this.tokenizer = tokenizer;
      this.sentenceTokenizer = sentenceTokenizer;
      this.rules = rules;
      this.regexRules = new GermanRegexRules(regexRules);
      this.runtime = runtime;
      this.speller = speller;
      this.compoundAnalyzer = new GermanCompoundAnalyzer(morphology);
      this.disambiguation = disambiguation;
      this.directRuleData = directRuleData;
      this.inactiveRules = inactiveRules;
      this.checkCount = 0;
      this.ruleGate = { loadedPatternRules: rules.length, loadedRegexRules: regexRules.length };
    }

    static async loadRuleBundles(profile, { fetcher = globalThis.fetch?.bind(globalThis) } = {}) {
      requireProfile(profile);
      if (typeof fetcher !== "function") throw new Error("A fetch implementation is required to load German rule bundles.");
      const [patternBundle, regexBundle, sentenceResource, disambiguation, directRuleData] = await Promise.all([
        fetchJson(RULES_URL, fetcher), fetchJson(REGEX_URL, fetcher), fetchJson(SRX_URL, fetcher), fetchJson(DISAMBIGUATION_URL, fetcher),
        fetchJson(DIRECT_RULE_DATA_URL, fetcher)
      ]);
      if (directRuleData?.schemaVersion !== 1 || !Array.isArray(directRuleData.replacements)
          || !Array.isArray(directRuleData.coherency) || !Array.isArray(directRuleData.wrongWords)
          || !Array.isArray(directRuleData.synonyms) || !Array.isArray(directRuleData.oldSpellings)
          || !directRuleData.compounds || !["de-DE", "de-AT", "de-CH"].every(profile => Array.isArray(directRuleData.compounds[profile]))) throw new Error("German direct-rule data bundle is incompatible.");
      if (disambiguation?.schemaVersion !== 1 || disambiguation.kind !== "lletrium-german-context-disambiguation-candidate"
          || disambiguation.status !== "proof-only-not-activated" || disambiguation.language !== "de-DE"
          || !disambiguation.profiles?.includes(profile)
          || disambiguation.sourceRuleCount !== disambiguation.convertedRuleCount + disambiguation.excludedRuleCount
          || disambiguation.convertedRuleCount !== disambiguation.rules?.length
          || disambiguation.excludedRuleCount !== disambiguation.exclusions?.length) {
        throw new Error(`German disambiguation candidate is incompatible or incomplete for ${profile}.`);
      }
      const { rules, inactiveRules } = buildProfileRules(patternBundle, profile);
      const regexRules = buildProfileRegexRules(regexBundle, profile);
      if (regexRules.length !== regexBundle.profileRuleCounts[profile]) throw new Error(`German RegexPatternRule bundle is incomplete for ${profile}.`);
      return { patternBundle, regexBundle, sentenceResource, disambiguation, directRuleData, rules, regexRules, inactiveRules };
    }

    static async load(profile, { fetcher = globalThis.fetch?.bind(globalThis), resourceReader = globalThis.LletriumLanguagePacks?.readResource?.bind(globalThis.LletriumLanguagePacks) } = {}) {
      requireProfile(profile);
      if (typeof resourceReader !== "function") throw new Error("The German language-pack resource reader is unavailable.");
      const variant = profile === "de-CH" ? "de_CH" : profile === "de-AT" ? "de_AT" : "de_DE";
      const [bundles, posBytes, posInfoText, synthesisBytes, synthesisInfoText, tagText, spellingBytes, spellingInfoText, addedCompoundBytes, multiwordBytes, englishMorphology] = await Promise.all([
        this.loadRuleBundles(profile, { fetcher }),
        readPackedBytes("german.dict.gz", resourceReader),
        readPackedBytes("german.info", resourceReader).then(bytes => decoder.decode(bytes)),
        readPackedBytes("german_synth.dict.gz", resourceReader),
        readPackedBytes("german_synth.info", resourceReader).then(bytes => decoder.decode(bytes)),
        readPackedBytes("german_tags.txt.gz", resourceReader).then(bytes => decoder.decode(bytes)),
        readPackedBytes(`hunspell/${variant}.dict.gz`, resourceReader),
        readPackedBytes(`hunspell/${variant}.info`, resourceReader).then(bytes => decoder.decode(bytes)),
        readPackedBytes("addedCompound.txt.gz", resourceReader),
        readPackedBytes("multitoken-suggest.txt.gz", resourceReader),
        loadEnglishMorphology(fetcher)
      ]);
      const Reader = globalThis.CorrectorCatalanCfsa2Dictionary;
      if (typeof Reader !== "function") throw new Error("The shared CFSA2 reader is unavailable.");
      const posInfo = parseInfo(posInfoText), synthesisInfo = parseInfo(synthesisInfoText), spellingInfo = parseInfo(spellingInfoText);
      const checkDictionaryInfo = (info, separator, label) => {
        if (info["fsa.dict.separator"] !== separator || info["fsa.dict.encoding"]?.toLowerCase().replaceAll("-", "") !== "utf8" || info["fsa.dict.encoder"] !== "SUFFIX") {
          throw new Error(`${label} Morfologik metadata is incompatible.`);
        }
      };
      checkDictionaryInfo(posInfo, "_", "German POS");
      checkDictionaryInfo(synthesisInfo, "_", "German synthesis");
      checkDictionaryInfo(spellingInfo, "+", `German ${profile} spelling`);
      if (spellingInfo["fsa.dict.frequency-included"] !== "true"
          || spellingInfo["fsa.dict.speller.ignore-diacritics"] !== "false") {
        throw new Error(`German ${profile} spelling flags differ from the verified Hunspell resource contract.`);
      }
      const posDictionary = new Reader(posBytes, { separator: "_", encoding: "utf-8", encoderType: "SUFFIX" });
      const synthesisDictionary = new Reader(synthesisBytes, { separator: "_", encoding: "utf-8", encoderType: "SUFFIX" });
      const tags = tagText.split(/\r?\n/u).filter(Boolean);
      if (tags.length < 2000) throw new Error(`German synthesis tag inventory is incomplete: ${tags.length}.`);
      const Speller = globalThis.CorrectorEnglishSpeller;
      if (typeof Speller !== "function") throw new Error("The shared CFSA2 spelling runtime is unavailable.");
      // LanguageTool's German Hunspell CFSA2 graph marks word completion with
      // a separator arc followed by frequency data. The shared English
      // speller's CFSA2 exact() path only accepts final/terminal arcs, so keep
      // this format-specific membership check in the German adapter.
      class GermanSpeller extends Speller {
        exact(word) {
          if (!this.cfsa2) return super.exact(word);
          const match = this.cfsa2.match(this.codec.encode(String(word)));
          return Boolean(match && (this.cfsa2.isFinal(match.lastArc) || this.cfsa2.isTerminal(match.lastArc)
            || match.node >= 0 && this.cfsa2.findArc(match.node, this.manifest.separator) !== 0));
        }
        suggest(word, limit = 8) {
          return this.findSimilarWords(String(word ?? ""), 2).slice(0, limit);
        }
      }
      const spellingProfile = { "de-DE": "de_DE", "de-AT": "de_AT", "de-CH": "de_CH" }[profile];
      const replacementPairs = parseReplacementPairs(spellingInfo["fsa.dict.speller.replacement-pairs"]);
      const speller = new GermanSpeller(spellingBytes.buffer.slice(spellingBytes.byteOffset, spellingBytes.byteOffset + spellingBytes.byteLength), {
        schema: 1, format: "CFSA2", profile: `LanguageTool 6.9-SNAPSHOT / German Hunspell ${spellingProfile}`,
        locale: "de", separator: "+".codePointAt(0), encoding: "utf-8", sequenceEncoder: "SUFFIX", frequencyIncluded: true,
        replacementPairs, equivalentChars: {}, spellerFlags: {
          ignorePunctuation: true, ignoreNumbers: true, ignoreCamelCase: true, ignoreAllUppercase: true,
          ignoreDiacritics: false, convertCase: true, supportRunOnWords: false
        }
      });
      const pipeline = this.create({ profile, bundles, posDictionary, synthesisDictionary, speller, englishMorphology, disambiguation: bundles.disambiguation,
        directRuleData: bundles.directRuleData,
        germanResources: {
          allowedCompoundPairs: parseGermanCompoundPairs(decoder.decode(addedCompoundBytes)),
          multiwordSpeller: globalThis.CorrectorGermanPatternFilters.createMultiwordSpeller(decoder.decode(multiwordBytes))
        } });
      pipeline.tags = tags;
      pipeline.posInfo = posInfo; pipeline.synthesisInfo = synthesisInfo; pipeline.spellingInfo = spellingInfo;
      pipeline.spellingBytes = spellingBytes;
      return pipeline;
    }

    static create({ profile, bundles, posDictionary, synthesisDictionary = null, runtime = null, speller = null, englishMorphology = null,
      disambiguation = null, directRuleData = bundles.directRuleData || null, germanResources = {} }) {
      const locale = requireProfile(profile);
      const morphology = new GermanMorphology(posDictionary, locale);
      const tokenizer = new GermanWordTokenizer(locale, morphology);
      const sentenceTokenizer = new GermanSentenceTokenizer(bundles.sentenceResource);
      const DictionaryRuntime = globalThis.CorrectorLtPatternRuntime;
      if (!runtime && !DictionaryRuntime) throw new Error("The shared LanguageTool PatternRule runtime is unavailable.");
      const patternFilters = globalThis.CorrectorGermanPatternFilters;
      if (!patternFilters?.apply) throw new Error("The German LanguageTool filter adapters are unavailable.");
      const synthesizer = synthesisDictionary ? {
        synthesize: (lemmaValue, tag) => {
          const lemma = String(lemmaValue?.lemma ?? lemmaValue?.text ?? lemmaValue ?? "");
          return lemma && tag ? synthesisDictionary.lookup(`${lemma}|${tag}`).map(reading => reading.lemma) : [];
        }
      } : null;
      const pipelineRuntime = runtime || new DictionaryRuntime({
        dictionary: { lookup: (word, options) => morphology.lookup(word, options), synthesize: synthesizer?.synthesize || (() => []) },
        locale: "de", contextRules: disambiguation?.rules || [],
        filterResources: { tokenizer: { externalTokenRows: true, tokenize: text => tokenizer.tokenize(text) }, sentenceTokenizer, englishMorphology },
        services: { patternFilters }
      });
      pipelineRuntime.services = { ...(pipelineRuntime.services || {}), patternFilters };
      pipelineRuntime.filterResources = { ...(pipelineRuntime.filterResources || {}),
        tokenizer: { externalTokenRows: true, tokenize: text => tokenizer.tokenize(text) }, sentenceTokenizer, englishMorphology };
      for (const rule of bundles.rules) pipelineRuntime.validate(rule);
      const pipeline = new GermanPatternPipeline({ profile: locale, morphology, tokenizer, sentenceTokenizer,
        rules: bundles.rules, regexRules: bundles.regexRules, runtime: pipelineRuntime, speller, disambiguation,
        directRuleData, inactiveRules: bundles.inactiveRules });
      pipelineRuntime.filterResources.german = { ...germanResources, profile: locale, morphology, tokenizer, speller, compoundAnalyzer: pipeline.compoundAnalyzer };
      return pipeline;
    }

    tokenizeRows(text) { return this.tokenizer.tokenizeRows(String(text)); }

    analyzeText(text, options = {}) {
      if (typeof text !== "string") throw new TypeError("German review input must be a string.");
      const rows = this.tokenizeRows(text);
      const directRows = rows.map(row => ({ ...row, ltReadings: (row.ltReadings || []).map(reading => ({ ...reading })) }));
      const level = options.checkLevel === "PICKY" ? "PICKY" : "DEFAULT";
      const rules = level === "PICKY" ? this.rules : this.rules.filter(rule => !rule.picky);
      const issues = this.runtime.run(text, rows, rules).map(issue => {
        const localized = { ...issue, language: this.profile,
          category: issue.meta?.qualityCategory === "style" ? "style" : issue.category || "grammar",
          severity: issue.severity || "warning" };
        // The upstream OBJECT_AGREEMENT XML template references token positions
        // before optional captures are removed. Preserve its exact German
        // accusative correction from the marked phrase instead of leaking the
        // misaligned generic backreferences (for example, ".en . .").
        if (/^OBJECT_AGREEMENT(?:\b|\[)/u.test(String(issue.meta?.sourceRule || ""))) {
          const parts = String(issue.text || "").split(/(\s+)/u);
          if (/^[sdmk]?ein$/iu.test(parts[0] || "")) {
            parts[0] += "en";
            localized.ruleId = "OBJECT_AGREEMENT";
            localized.suggestions = [parts.join("")];
          }
        }
        return localized;
      });
      issues.push(...this.regexRules.check(this.sentenceTokenizer.segment(text), { checkLevel: level }));
      if (globalThis.CorrectorGermanDirectRules?.check) {
        issues.push(...globalThis.CorrectorGermanDirectRules.check({ profile: this.profile, text, rows: directRows,
          morphology: this.morphology, sentenceTokenizer: this.sentenceTokenizer, runtime: this.runtime,
          compoundAnalyzer: this.compoundAnalyzer, speller: this.speller, data: this.directRuleData, checkLevel: level }));
      }
      if (options.skipSpelling !== true && this.speller) {
        const personalWords = new Set((Array.isArray(options.personalWords) ? options.personalWords : [])
          .map(word => String(word).trim().toLocaleLowerCase("de")).filter(Boolean));
        for (const row of rows) {
          if (!/\p{L}/u.test(row.token) || isGermanMixedCase(row.token)
              || row.token.toLocaleLowerCase("de") === "ß"
              || row.analysis?.lexical || !this.speller.isMisspelled(row.token, { personalWords })
              || this.compoundAnalyzer.isKnownCompound(row.token)) continue;
          if (issues.some(issue => issue.start < row.end && issue.end > row.start)) continue;
          const spellingRuleId = { "de-DE": "GERMAN_SPELLER_RULE", "de-AT": "AUSTRIAN_GERMAN_SPELLER_RULE", "de-CH": "SWISS_GERMAN_SPELLER_RULE" }[this.profile];
          issues.push({ id: `${spellingRuleId}:${this.profile}:${row.start}:${row.end}`, ruleId: spellingRuleId,
            category: "spelling", severity: "warning", language: this.profile,
            message: "Möglicher Rechtschreibfehler.", shortMessage: "Rechtschreibung", text: row.token,
            start: row.start, end: row.end, replacementStart: row.start, replacementEnd: row.end,
            suggestions: this.speller.suggest(row.token, 8) });
        }
      }
      const sourceRuleOf = issue => String(issue.meta?.sourceRule || issue.ruleId || "");
      const sentenceSpans = this.sentenceTokenizer.segment(text);
      const sameSpanIssue = (issue, ruleId) => issues.some(other => other !== issue && other.ruleId === ruleId
        && issue.start < other.end && issue.end > other.start);
      const filteredIssues = issues.filter(issue => {
        const sourceRule = sourceRuleOf(issue);
        // These XML variants duplicate the more precise direct German adapters.
        if (/^KLEIN_NACH_PUNKT(?:\[|$)/u.test(sourceRule) && sameSpanIssue(issue, "DE_SENTENCE_WHITESPACE")) return false;
        if (/^SUBJECT_VERB_AGREEMENT(?:\[|$)/u.test(sourceRule) && sameSpanIssue(issue, "DE_SUBJECT_VERB_AGREEMENT")) return false;
        const sentence = sentenceSpans.find(item => issue.start >= item.start && issue.start < item.end);
        if (!sentence) return true;
        const sentenceText = text.slice(sentence.start, sentence.end);
        const localStart = issue.start - sentence.start;
        if (/^KOMMA_INFINITIVGRUPPEN(?:\[|$)/u.test(sourceRule)
            && /,\s*um\b[^.!?]{0,100}\bzu\b/iu.test(sentenceText)) return false;
        if (/^PRP_DAT_AKK(?:\[|$)/u.test(sourceRule)) {
          const prepIndex = rows.findIndex(row => row.start <= issue.start && row.end >= issue.end
            && /^(?:in|an|auf|unter|über|vor|hinter|neben|zwischen|gegen|für)$/iu.test(row.token));
          if (prepIndex >= 0 && rows.slice(prepIndex + 1, prepIndex + 5).some(row =>
            row.ltReadings?.some(reading => /^(?:SUB|PRO):(?:AKK|DAT):/u.test(String(reading.tag || ""))))) return false;
        }
        // Avoid comma insertions that repeat an adjacent word or contradict the
        // direct missing-relative-comma diagnosis in the same sentence.
        if (/^KOMMA_ZWISCHEN_HAUPT_UND_NEBENSATZ(?:_2)?(?:\[|$)/u.test(sourceRule)) {
          if (/\b([\p{L}]+)\s+\1\b/iu.test(sentenceText)) return false;
          if (text.slice(issue.start, issue.end).includes(",")) return false;
            if (/^\s*,/u.test(text.slice(issue.end, issue.end + 3))) return false;
          if (issues.some(other => other !== issue && other.ruleId === "COMMA_IN_FRONT_RELATIVE_CLAUSE"
              && other.start >= sentence.start && other.end <= sentence.end)) return false;
          if (/^[\p{L}]+$/u.test(text.slice(issue.start, issue.end))
              && /,\s*$/u.test(text.slice(Math.max(sentence.start, issue.start - 3), issue.start))) return false;
        }
        if (/^SUBJUNKTION_KOMMA(?:_2)?(?:\[|$)/u.test(sourceRule)) {
          if (/,[\t \u00a0]*$/u.test(text.slice(Math.max(sentence.start, issue.start - 3), issue.start))) return false;
          if (/^SUBJUNKTION_KOMMA_2(?:\[|$)/u.test(sourceRule) && localStart < 5
              && sentenceText.slice(0, 80).includes(",")) return false;
        }
        if (issue.ruleId === "COMMA_IN_FRONT_RELATIVE_CLAUSE"
            && /,\s*$/u.test(text.slice(Math.max(sentence.start, issue.start - 3), issue.start))) return false;
        if (issue.ruleId === "COMMA_BEHIND_RELATIVE_CLAUSE"
            && /^\s*,/u.test(text.slice(issue.end, issue.end + 3))) return false;
        return true;
      });
      this.checkCount++;
      return { profile: this.profile, textLengthUtf16: text.length, issues: filteredIssues, stats: this.getDiagnostics() };
    }

    getDiagnostics() {
      return { status: "phase-3-pattern-pipeline", profile: this.profile,
        loadedPatternRules: this.rules.length, loadedRegexRules: this.regexRules.rules.length,
        inactivePatternRules: this.inactiveRules.length,
        inactivePatternRulesByReason: this.inactiveRules.reduce((counts, item) => (counts[item.reason] = (counts[item.reason] || 0) + 1, counts), {}),
        supportedProfiles: [...PROFILES], sentenceRules: this.sentenceTokenizer.rules.length,
        disambiguationRulesLoaded: this.disambiguation?.rules?.length || 0,
        disambiguationRulesUpstream: this.disambiguation?.sourceRuleCount || 0,
        disambiguationRulesExcluded: this.disambiguation?.excludedRuleCount || 0,
        disambiguationExclusionsByReason: this.disambiguation?.exclusionsByReason || {},
        checks: this.checkCount, morphology: { lookupCount: this.morphology.lookupCount },
        spelling: this.speller ? { profile: this.speller.manifest.profile, format: this.speller.manifest.format } : null,
        compounds: { strategy: "POS-dictionary-segmentation", lookups: this.compoundAnalyzer.lookups },
        runtimeErrors: this.runtime.diagnostics.slice(-50) };
    }
  }

  globalThis.CorrectorGermanPatternPipeline = Object.freeze({ GermanPatternPipeline, GermanWordTokenizer, GermanSentenceTokenizer, GermanMorphology, GermanCompoundAnalyzer, GermanRegexRules });
})();
