/* Conservative literal-only runtime for the audited LanguageTool PatternRule subset. */
(() => {
  "use strict";

  const RESOURCE_PATH = "build/resources/es-ES/es-pattern-rule-candidates.json";
  const EXPECTED_GRAMMAR_HASH = "75c4100470a0d0543af9723b112f8f9b0821dd0df578804dad58f29c70759d91";
  let rules = [];
  let repeatedRules = [];
  let repeatedRuleMetadata = new Map();
  let caseInsensitiveByFirst = new Map();
  let caseSensitiveByFirst = new Map();
  let lemmaInsensitiveByFirst = new Map();
  let lemmaSensitiveByFirst = new Map();
  let exactPosFirst = new Map();
  let posRegexFirst = new Map();
  let unconstrainedFirst = [];
  let surfaceRegexFirst = [];
  let surfaceRegexInsensitive = [];
  let surfaceRegexByPrefix = new Map();
  let posRegexCache = new Map();
  let compiledPosRegexes = new Map();
  let compiledSurfaceRegexes = new Map();
  let loadPromise = null;
  let unificationDefinitions = {};
  let lexicalLookup = null;
  let synthesizer = null;
  let activeLocaleProfile = "es-ES";
  const baseRegistrationOrder = new WeakMap();
  const FILTER_FIND_SUGGESTIONS = "org.languagetool.rules.es.FindSuggestionsFilter";
  const FILTER_ADD_COMMAS = "org.languagetool.rules.AddCommasFilter";
  const FILTER_MULTITOKEN_SPELLER = "org.languagetool.rules.spelling.multitoken.MultitokenSpellerFilter";
  const FILTER_ADVANCED_SYNTHESIZER = "org.languagetool.rules.es.AdvancedSynthesizerFilter";
  const FILTER_DATE_CHECK = "org.languagetool.rules.es.DateCheckFilter";
  const FILTER_ADAPT_SUGGESTIONS = "org.languagetool.rules.AdaptSuggestionsFilter";
  const FILTER_NEW_YEAR_DATE = "org.languagetool.rules.es.NewYearDateFilter";
  const FILTER_POSTPONED_ADJECTIVE = "org.languagetool.rules.es.PostponedAdjectiveConcordanceFilter";
  const FILTER_SUPPRESS_MISSPELLED = "org.languagetool.rules.es.SpanishSuppressMisspelledSuggestionsFilter";
  const FILTER_NUMBER_IN_WORD = "org.languagetool.rules.es.SpanishNumberInWordFilter";
  const FILTER_CONFUSION_CHECK = "org.languagetool.rules.es.ConfusionCheckFilter";
  const FILTER_APOSTROPHE_TYPE = "org.languagetool.rules.patterns.ApostropheTypeFilter";
  const supportedFilterClasses = new Set([FILTER_FIND_SUGGESTIONS, FILTER_ADD_COMMAS, FILTER_MULTITOKEN_SPELLER, FILTER_ADVANCED_SYNTHESIZER, FILTER_DATE_CHECK, FILTER_ADAPT_SUGGESTIONS, FILTER_NEW_YEAR_DATE, FILTER_POSTPONED_ADJECTIVE, FILTER_SUPPRESS_MISSPELLED, FILTER_NUMBER_IN_WORD, FILTER_CONFUSION_CHECK, FILTER_APOSTROPHE_TYPE]);
  let multitokenCandidates = [];
  let multitokenCandidatesByFirstLength = new Map();
  let multitokenCandidatesWithoutSpaces = new Map();
  let multitokenSuggestionCache = new Map();
  let configuredRuleProfile = "";
  let sourceRuleCount = 0;
  let heldOutFilterCount = 0;
  let heldOutNumberCount = 0;

  function compilePosRegex(source) {
    if (compiledPosRegexes.has(source)) return compiledPosRegexes.get(source);
    if (typeof source !== "string" || /\\[1-9]/u.test(source) || source.includes("\\Q") || source.includes("\\E")
        || source.includes("&&") || source.includes("(?>") || /(?:[*+?]|\{\d+(?:,\d*)?\})\+/u.test(source)) {
      throw new Error(`Non-portable LanguageTool POS regex: ${source}`);
    }
    try {
      const regex = globalThis.CorrectorJavaCaseRegex.compile(source, true);
      compiledPosRegexes.set(source, regex);
      return regex;
    }
    catch { throw new Error(`Invalid LanguageTool POS regex: ${source}`); }
  }

  // PatternRule's StringMatcher uses whole-token matches and caps input at
  // 250 UTF-16 code units. Accept only the common Java/JS regex intersection;
  // the audit applies the same portability gate before exporting rules.
  function compileSurfaceRegex(source, caseSensitive) {
    const key = `${caseSensitive ? "s" : "i"}:${source}`;
    if (compiledSurfaceRegexes.has(key)) return compiledSurfaceRegexes.get(key);
    const allowedProperties = new Set(["L", "Letter", "Lu", "Uppercase_Letter", "Ll", "Lowercase_Letter", "Lt", "Titlecase_Letter", "Lm", "Modifier_Letter", "Lo", "Other_Letter", "M", "Mark", "N", "Number", "Nd", "Decimal_Number", "P", "Punctuation", "Pc", "Connector_Punctuation", "Pd", "Dash_Punctuation", "Ps", "Open_Punctuation", "Pe", "Close_Punctuation", "Pi", "Initial_Punctuation", "Pf", "Final_Punctuation", "Po", "Other_Punctuation", "S", "Symbol", "Sc", "Currency_Symbol", "Z", "Separator", "C", "Other"]);
    if (typeof source !== "string" || /\\[1-9]/u.test(source) || /\\(?:Q|E|R|h|v|X|A|z|Z|k)/u.test(source)
        || source.includes("&&") || source.includes("(?>") || /\(\?<[^=!]/u.test(source)
        || /(?:[*+?]|\{\d+(?:,\d*)?\})\+/u.test(source)) {
      throw new Error(`Non-portable LanguageTool surface regex: ${source}`);
    }
    for (const [, property] of source.matchAll(/\\[pP]\{([^}]+)\}/gu)) {
      if (!allowedProperties.has(property)) throw new Error(`Non-portable LanguageTool surface regex property: ${property}`);
    }
    try {
      const regex = globalThis.CorrectorJavaCaseRegex.compile(source, caseSensitive);
      compiledSurfaceRegexes.set(key, regex);
      return regex;
    } catch { throw new Error(`Invalid LanguageTool surface regex: ${source}`); }
  }

  function addToIndex(index, key, rule) {
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(rule);
  }

  function portableSurfaceReference(token, patternLength) {
    const reference=token?.reference,index=reference?.tokenRef;
    return Number.isInteger(index)&&index>=0&&index<patternLength
      &&reference.caseConversion==="NONE"&&reference.inMessageOnly===true&&reference.includeSkipped==="NONE"
      &&!reference.checksSpelling&&!reference.setsPos&&reference.posTag==null&&reference.posTagReplace==null
      &&!reference.posRegexp&&reference.regexMatch==null&&reference.regexReplace==null&&reference.staticLemma==null
      &&token.text===`\\${index}`&&!token.regexp&&!token.inflected&&!token.negated;
  }

  function safeRegexPrefix(token) {
    // A plain ASCII literal at the beginning is a necessary condition for a
    // whole-token regex match. Keep alternations, escapes and Unicode prefixes
    // on the fallback path to avoid false negatives under Java/Unicode case
    // folding differences.
    const source = token.text.startsWith("^") ? token.text.slice(1) : token.text;
    if (source.includes("|") || !/^[A-Za-z0-9]/u.test(source)) return null;
    // The first character is a usable index key only if the regex requires
    // it. Optional or zero-length quantifiers on that atom must use fallback.
    if (/^(?:\?|\*|\{0(?:,|\}))/u.test(source.slice(1))) return null;
    return source[0];
  }

  function assertPortableException(exception, ruleId) {
    if (!exception || typeof exception.text !== "string" || (!exception.text && exception.pos == null)
        || exception.minOccurrence !== 1 || exception.maxOccurrence !== 1 || exception.skipNext !== 0
        || exception.phraseName != null || exception.reference != null
        || exception.unification != null || exception.unificationNegated || exception.unificationNeutral
        || exception.lastInUnification || exception.orGroup?.length
        || exception.exceptions?.length || exception.previousExceptions?.length
        ) {
      throw new Error(`Non-portable LanguageTool exception in rule ${ruleId}`);
    }
    if (exception.regexp) compileSurfaceRegex(exception.text, exception.caseSensitive);
    if (exception.posRegexp) compilePosRegex(exception.pos);
    for (const member of exception.andGroup || []) assertPortableException(member, ruleId);
  }

  function assertPortableAntiPattern(antiPattern, ruleId) {
    if (!Array.isArray(antiPattern?.pattern)) {
      throw new Error(`Empty LanguageTool anti-pattern in rule ${ruleId}`);
    }
    for (const token of antiPattern.pattern) {
      const minOccurrence = token.minOccurrence ?? 1;
      const maxOccurrence = token.maxOccurrence ?? 1;
      const reference = token.reference;
      const portableReference = reference == null || Number.isInteger(reference.tokenRef) && reference.tokenRef >= 0
        && reference.caseConversion === "NONE" && reference.inMessageOnly === true
        && reference.includeSkipped === "NONE" && !reference.checksSpelling && !reference.setsPos
        && reference.posTag == null && reference.posTagReplace == null && !reference.posRegexp
        && reference.regexMatch == null && reference.regexReplace == null && reference.staticLemma == null;
      if (typeof token.text !== "string"
          || !Number.isInteger(minOccurrence) || !Number.isInteger(maxOccurrence)
          || minOccurrence < 0 || (maxOccurrence !== -1 && maxOccurrence < minOccurrence)
          || !Number.isInteger(token.skipNext) || token.skipNext < -1
          || token.phraseName != null || !portableReference
          || token.orGroup?.length
          ) {
        throw new Error(`Non-portable LanguageTool anti-pattern in rule ${ruleId}`);
      }
      if (token.regexp) compileSurfaceRegex(token.text, token.caseSensitive);
      if (token.posRegexp) compilePosRegex(token.pos);
      for (const exception of token.exceptions || []) assertPortableException(exception, ruleId);
      for (const exception of token.previousExceptions || []) assertPortableException(exception, ruleId);
      for (const member of token.andGroup || []) assertPortableAntiPattern({ pattern: [member] }, ruleId);
    }
  }

  function assertLiteralRule(rule) {
    if (!rule || typeof rule.fullId !== "string" || !Array.isArray(rule.pattern) || !rule.pattern.length
        || rule.startPositionCorrection < 0
        || !Number.isInteger(rule.languagePriority) || !Number.isInteger(rule.registrationOrder)
        || rule.filterClass && !supportedFilterClasses.has(rule.filterClass)
        || /<match\b/u.test(rule.message || "") || /<match\b/u.test(rule.shortMessage || "")
        || /<match\b/u.test(rule.suggestionsOutMsg || "")) {
      throw new Error(`Unsupported LanguageTool literal rule: ${rule?.fullId || "unknown"}`);
    }
    for (const token of rule.pattern) {
      const minOccurrence = token.minOccurrence ?? 1;
      const maxOccurrence = token.maxOccurrence ?? 1;
      if (typeof token.text !== "string" || !Number.isInteger(minOccurrence) || !Number.isInteger(maxOccurrence)
          || minOccurrence < 0 || (maxOccurrence !== -1 && maxOccurrence < minOccurrence)
          || !Number.isInteger(token.skipNext) || token.skipNext < -1
          || token.reference != null && !portableSurfaceReference(token,rule.pattern.length)) {
        throw new Error(`Non-literal token in LanguageTool rule ${rule.fullId}`);
      }
      if (token.regexp) compileSurfaceRegex(token.text, token.caseSensitive);
      if (token.posRegexp) compilePosRegex(token.pos);
      for (const exception of token.exceptions || []) assertPortableException(exception, rule.fullId);
      for (const exception of token.previousExceptions || []) assertPortableException(exception, rule.fullId);
      for (const member of token.andGroup || []) assertPortableAntiPattern({ pattern: [member] }, rule.fullId);
    }
    for (const antiPattern of rule.antiPatterns || []) assertPortableAntiPattern(antiPattern, rule.fullId);
    if (rule.outputPortable !== false && !canFormatReferences(rule)) throw new Error(`Unsupported dynamic output in LanguageTool rule ${rule.fullId}`);
  }

  async function load({ url, fetcher = globalThis.fetch } = {}) {
    if (!loadPromise) {
      loadPromise = (async () => {
        const resourceUrl = url || globalThis.chrome?.runtime?.getURL(RESOURCE_PATH);
        if (!resourceUrl) throw new Error("Indica la URL del recurso PatternRule español fuera de la extensión.");
        let repeatedResourceUrl;
        try { repeatedResourceUrl = new URL("es-repeated-pattern-rules.json", resourceUrl); }
        catch { repeatedResourceUrl = "es-repeated-pattern-rules.json"; }
        const [response, repeatedResponse] = await Promise.all([
          fetcher(resourceUrl),
          fetcher(repeatedResourceUrl)
        ]);
        if (!response.ok) throw new Error(`No se pudo cargar el recurso PatternRule español (${response.status}).`);
        if (!repeatedResponse.ok) throw new Error(`No se pudo cargar el recurso de patrones repetidos es-ES (${repeatedResponse.status}).`);
        const [resource, repeatedResource] = await Promise.all([response.json(), repeatedResponse.json()]);
        if (resource?.schemaVersion !== 1 || resource.language !== "es-ES"
            || resource.grammarXmlSha256 !== EXPECTED_GRAMMAR_HASH
            || !Number.isInteger(resource.activeRuleCount) || !Array.isArray(resource.rules)
            || resource.activeRuleCount < resource.rules.length) {
          throw new Error("El recurso PatternRule no corresponde a la gramática es-ES fijada.");
        }
        const filterBlocked = resource.rules.filter(rule => Boolean(rule.filterClass) && !supportedFilterClasses.has(rule.filterClass));
        const numberOutputBlocked = resource.rules.filter(rule =>
          [...rule.suggestionMatches || [], ...rule.suggestionMatchesOutMsg || []].some(spec => spec.posTag?.startsWith("_spell_number_")));
        sourceRuleCount = resource.rules.length;
        heldOutFilterCount = filterBlocked.length;
        heldOutNumberCount = numberOutputBlocked.length;
        rules = resource.rules.filter(rule => (!rule.filterClass || supportedFilterClasses.has(rule.filterClass))
          && ![...rule.suggestionMatches || [], ...rule.suggestionMatchesOutMsg || []].some(spec => spec.posTag?.startsWith("_spell_number_")));
        if (repeatedResource?.schemaVersion !== 1 || repeatedResource.profile !== "es-ES"
            || repeatedResource.styleXmlSha256 !== "e45426d2d1070d89ca43b906a31052d11d45582f8cfd79b77abe848e24aa8abe"
            || repeatedResource.groupCount !== 13 || !Array.isArray(repeatedResource.groups)
            || repeatedResource.groups.length !== 13) throw new Error("El recurso de patrones repetidos no pertenece al perfil es-ES fijado.");
        repeatedRules = repeatedResource.groups.flatMap(group => group.rules);
        repeatedRuleMetadata = new Map(repeatedRules.map(rule => [rule.fullId, rule]));
        for (const rule of rules) assertLiteralRule(rule);
        for (const rule of repeatedRules) assertLiteralRule(rule);
        for (const rule of rules) baseRegistrationOrder.set(rule, rule.registrationOrder);
        unificationDefinitions = Object.fromEntries(Object.entries(resource.unificationDefinitions || {}).map(([feature, types]) => [feature,
          Object.fromEntries(Object.entries(types).map(([type, expression]) => [type, compilePosRegex(expression)]))]));
        caseInsensitiveByFirst = new Map(); caseSensitiveByFirst = new Map();
        lemmaInsensitiveByFirst = new Map(); lemmaSensitiveByFirst = new Map();
        exactPosFirst = new Map(); posRegexFirst = new Map(); unconstrainedFirst = [];
        surfaceRegexFirst = []; surfaceRegexInsensitive = []; surfaceRegexByPrefix = new Map(); posRegexCache = new Map();
        for (const rule of [...rules, ...repeatedRules]) {
          const first = rule.pattern[0];
          if (first.minOccurrence === 0 || first.negated || first.posNegated) unconstrainedFirst.push(rule);
          else if (first.regexp) {
            const entry = { regex: compileSurfaceRegex(first.text, first.caseSensitive), inflected: first.inflected, rules: [rule], caseSensitive: first.caseSensitive };
            const prefix = safeRegexPrefix(first);
            if (prefix == null) surfaceRegexFirst.push(entry);
            else {
              const key = `${first.caseSensitive ? "s" : "i"}:${first.caseSensitive ? prefix : prefix.toUpperCase()}`;
              if (!surfaceRegexByPrefix.has(key)) surfaceRegexByPrefix.set(key, []);
              surfaceRegexByPrefix.get(key).push(entry);
              if (!first.caseSensitive) surfaceRegexInsensitive.push(entry);
            }
          } else if (first.text && first.inflected) {
            addToIndex(first.caseSensitive ? lemmaSensitiveByFirst : lemmaInsensitiveByFirst,
              first.caseSensitive ? first.text : first.text.toLocaleLowerCase("es"), rule);
            addToIndex(first.caseSensitive ? caseSensitiveByFirst : caseInsensitiveByFirst,
              first.caseSensitive ? first.text : first.text.toLocaleLowerCase("es"), rule);
          } else if (first.text) {
            addToIndex(first.caseSensitive ? caseSensitiveByFirst : caseInsensitiveByFirst,
              first.caseSensitive ? first.text : first.text.toLocaleLowerCase("es"), rule);
          } else if (first.posRegexp) {
            if (!posRegexFirst.has(first.pos)) posRegexFirst.set(first.pos, { regex: compilePosRegex(first.pos), rules: [] });
            posRegexFirst.get(first.pos).rules.push(rule);
          } else if (first.pos == null) unconstrainedFirst.push(rule);
          else addToIndex(exactPosFirst, first.pos, rule);
        }
        configuredRuleProfile = "es-ES";
        return { loadedRules: rules.length, sourceRules: resource.rules.length,
          heldOutFilters: filterBlocked.length, heldOutNumberSynthesis: numberOutputBlocked.length,
          repeatedPatternGroups: repeatedResource.groupCount, repeatedPatternRules: repeatedRules.length,
          grammarXmlSha256: resource.grammarXmlSha256, posRegexes: posRegexFirst.size,
          surfaceRegexes: surfaceRegexFirst.length };
      })().catch(error => { loadPromise = null; throw error; });
    }
    return loadPromise;
  }
  function equalSurface(actual, expected, caseSensitive) {
    return caseSensitive ? actual === expected
      : actual.toLocaleLowerCase("es") === expected.toLocaleLowerCase("es");
  }

  function lexicalTokenReadings(token, rawPos = false) {
    const readings = rawPos ? token.preDisambiguationReadings || token.lexicalReadings : token.readings;
    return readings?.length ? readings : [{ lemma: null, tag: null }];
  }

  function tokenReadings(token, rawPos = false) {
    const result = lexicalTokenReadings(token, rawPos);
    // LanguageTool exposes sentence/paragraph boundaries as token readings
    // during pattern matching. Keep them out of lexical disambiguation and
    // synthesis, but make them visible to token exceptions too.
    const output = [...result];
    if (token.isSentenceEnd && !output.some(reading => reading.tag === "SENT_END")) {
      output.push({ token: token.text, lemma: null, tag: "SENT_END", source: "languagetool-sentence-boundary" });
    }
    if (token.isParagraphEnd && !output.some(reading => reading.tag === "PARA_END")) {
      output.push({ token: token.text, lemma: null, tag: "PARA_END", source: "languagetool-paragraph-boundary" });
    }
    return output;
  }

  function matchesTokenPattern(pattern, actual, rawPos = false, { allowProperNounFamily = false } = {}) {
    if (pattern.whitespaceTest && Boolean(actual.whitespaceBefore) !== Boolean(pattern.whitespaceBefore)) return false;
    const mainMatch = tokenReadings(actual, rawPos).some(reading => matchesReading(pattern, actual, reading, allowProperNounFamily, rawPos));
    if (!mainMatch) return false;
    if (pattern.chunkTag != null) {
      const regexp = pattern.chunkTag.endsWith("[regex]") ? compilePosRegex(pattern.chunkTag.slice(0, -7)) : null;
      const matchesChunk = (actual.chunkTags || []).some(tag => regexp ? regexp.test(tag) : tag === pattern.chunkTag);
      if (matchesChunk === Boolean(pattern.negated)) return false;
    }
    if (!(pattern.andGroup || []).every(member => matchesAndMember(member, actual, rawPos))) return false;
    return !(pattern.exceptions || []).some(exception => !exception.exceptionsScopeNext
      && tokenReadings(actual, rawPos).some(reading => matchesReading(exception, actual, reading)));
  }

  // PatternTokenMatcher evaluates AND members with isMatched() only. That
  // checks the member's surface, POS and whitespace predicates; exceptions,
  // chunk tags and sequence-level unification are not evaluated on members.
  function matchesAndMember(pattern, actual, rawPos = false) {
    if (pattern.whitespaceTest && Boolean(actual.whitespaceBefore) !== Boolean(pattern.whitespaceBefore)) return false;
    const readings = tokenReadings(actual, rawPos);
    if (!readings.some(reading => matchesReading(pattern, actual, reading))) return false;
    // AND members are predicates on the same token, but their own inline
    // exceptions still veto that predicate in LanguageTool. Ignoring them
    // lets ambiguous words satisfy contradictory gender/POS conditions (for
    // example _GN_FP and _GN_MP together), producing false positives.
    return !(pattern.exceptions || []).some(exception => !exception.exceptionsScopeNext
      && tokenReadings(actual, rawPos).some(reading => matchesReading(exception, actual, reading)));
  }

  function matchesScopeNextException(patternToken, actual, rawPos = false) {
    return (patternToken.exceptions || []).some(exception => exception.exceptionsScopeNext
      && tokenReadings(actual, rawPos).some(reading => matchesReading(exception, actual, reading)));
  }

  function matchesReading(pattern, actual, reading, allowProperNounFamily = false, rawPos = false) {
      if (pattern.whitespaceTest && Boolean(actual.whitespaceBefore) !== Boolean(pattern.whitespaceBefore)) return false;
      const actualText = actual.typographicApostrophe ? String(actual.text).replace(/’/gu, "'") : String(actual.text);
      const testText = pattern.inflected && reading.lemma != null ? reading.lemma : actualText;
      let surfaceMatches = true;
      if (pattern.text) surfaceMatches = pattern.regexp
        ? testText.length <= 250 && compileSurfaceRegex(pattern.text, pattern.caseSensitive).test(testText)
        : equalSurface(testText, pattern.text, pattern.caseSensitive);
      if (!surfaceMatches !== Boolean(pattern.negated && !pattern.chunkTag)) return false;
      if (pattern.pos == null) return true;
      // `_english_ignore_` is a local spelling-control sentinel, not a Spanish
      // POS tag. Keep the token eligible for upstream rules requiring UNKNOWN
      // (e.g. Spanish abbreviations) while still suppressing its spelling flag.
      const noTag = !/\r|\n/u.test(actual.text) && (actual.readings || []).every(row => row.tag == null || ["SENT_END", "PARAGRAPH_END", "_english_ignore_"].includes(row.tag));
      const acceptsUnknown = pattern.posRegexp ? compilePosRegex(pattern.pos).test("UNKNOWN") : pattern.pos === "UNKNOWN";
      const exactPosMatches = acceptsUnknown && noTag || (reading.tag != null && (pattern.posRegexp
        ? compilePosRegex(pattern.pos).test(reading.tag) : reading.tag === pattern.pos));
      // Anti-patterns often exclude an ambiguous proper-name reading (for
      // example the masculine proper-noun tag for a brand name). This
      // project can produce a common-gender NP tag for a multiword name;
      // preserve the upstream exception's semantic family without relaxing
      // exact POS matching for positive rules.
      const properNounFamilyMatches = allowProperNounFamily && /^NP/u.test(pattern.pos)
        && (actual.chunksStart || []).some(chunk => chunk.kind === "global" && /^NP/u.test(chunk.tag || ""))
        && tokenReadings(actual, rawPos).some(candidate => /^NP/u.test(candidate.tag || ""));
      const posMatches = exactPosMatches || properNounFamilyMatches;
      return (posMatches !== Boolean(pattern.posNegated)) && (pattern.text || !pattern.negated || pattern.chunkTag);
  }

  function matchesMappedExceptions(pattern, matchedPositions, words, rawPos = false) {
    for (let patternIndex = 0; patternIndex < pattern.length; patternIndex++) {
      const token = pattern[patternIndex];
      for (const wordIndex of matchedPositions[patternIndex] || []) {
        const actual = words[wordIndex];
        for (const exception of token.exceptions || []) {
          if (exception.exceptionsScopeNext) {
            const next = words[wordIndex + 1];
            if (next && tokenReadings(next, rawPos).some(reading => matchesReading(exception, next, reading))) return false;
          }
        }
        if (wordIndex > 0) {
          const previous = words[wordIndex - 1];
          if ((token.previousExceptions || []).some(exception => tokenReadings(previous, rawPos)
            .some(reading => matchesReading(exception, previous, reading)))) return false;
        }
        // Current-scope exceptions are checked against every reading even
        // when the main token matched only one ambiguous analysis.
        if ((token.exceptions || []).some(exception => !exception.exceptionsScopeNext
            && tokenReadings(actual, rawPos).some(reading => matchesReading(exception, actual, reading)))) return false;
      }
    }
    return true;
  }

  function matchSequenceAt(pattern, words, start, rawPos = false, checkImmunity = true, allowProperNounFamily = false) {
    const resolvedPattern = pattern.map(token => {
      if (!token.reference) return token;
      const referencePosition = start + token.reference.tokenRef;
      const referenceToken = words[referencePosition];
      if (!referenceToken) return null;
      const placeholder = `\\${token.reference.tokenRef}`;
      return { ...token, text: token.text.replaceAll(placeholder, referenceToken.text), reference: null };
    });
    if (resolvedPattern.some(token => token == null)) return null;
    pattern = resolvedPattern;
    const positions = [];
    const optionalCount = pattern.filter(token => token.minOccurrence === 0).length;
    let nextPosition = start;
    let previousSkip = 0;
    for (let offset = 0; offset < pattern.length; offset++) {
      const token = pattern[offset];
      if (previousSkip < 0 || nextPosition + previousSkip >= words.length) {
        previousSkip = words.length - nextPosition - 1;
      }
      const limit = Math.min(nextPosition + previousSkip, words.length - (pattern.length - offset) + optionalCount);
      let veto = false;
      const testAt = (element, index, previousElement) => {
        const actual = words[index];
        if (!actual || checkImmunity && actual.immunized) return false;
        if (previousSkip > 0 && previousElement && matchesScopeNextException(previousElement, actual, rawPos)) veto = true;
        // Upstream's no-skip lookahead tests the first reading only.
        const next = words[index + 1];
        if (previousSkip === 0 && next && (element.exceptions || []).some(exception => exception.exceptionsScopeNext
            && matchesReading(exception, next, lexicalTokenReadings(next, rawPos)[0]))) veto = true;
        if (veto || !matchesTokenPattern(element, actual, rawPos, { allowProperNounFamily })) return false;
        const previous = words[index - 1];
        return !previous || !(element.previousExceptions || []).some(exception => lexicalTokenReadings(previous, rawPos)
          .some(reading => matchesReading(exception, previous, reading)));
      };
      let found = false;
      for (let candidate = nextPosition; candidate <= limit; candidate++) {
        const currentMatches = testAt(token, candidate, pattern[offset - 1]);
        if (token.minOccurrence === 0) {
          for (let nextOffset = offset + 1; nextOffset < pattern.length; nextOffset++) {
            if (testAt(pattern[nextOffset], candidate, token)) {
              positions[offset] = [];
              found = true;
              break;
            }
            if (pattern[nextOffset].minOccurrence > 0) break;
          }
          if (found) break;
        }
        if (!currentMatches) continue;
        let last = candidate;
        const maximum = token.maxOccurrence === -1 ? words.length : token.maxOccurrence;
        for (let repeat = 1; repeat < maximum && candidate + repeat < words.length - (pattern.length - offset - 1); repeat++) {
          if (offset === 0 && token.minOccurrence === 0 && pattern[offset+1] && testAt(pattern[offset+1],candidate+repeat,token)) break;
          if (!testAt(token, candidate + repeat, pattern[offset - 1])) break;
          last = candidate + repeat;
        }
        positions[offset] = Array.from({ length: last - candidate + 1 }, (_value, index) => candidate + index);
        nextPosition = last + 1;
        previousSkip = token.skipNext || 0;
        found = true;
        break;
      }
      if (!found) return null;
    }
    return matchesUnification(pattern, positions, words, rawPos) ? positions : null;
  }

  function matchesUnification(pattern, positions, words, rawPos) {
    let candidateSets = [];
    function coherent(index = 0, common = {}) {
      if (index === candidateSets.length) return true;
      for (const candidate of candidateSets[index]) {
        const next = { ...common };
        let valid = true;
        for (const [feature, values] of Object.entries(candidate)) {
          next[feature] = common[feature] == null ? values : common[feature].filter(value => values.includes(value));
          if (!next[feature].length) { valid = false; break; }
        }
        if (valid && coherent(index + 1, next)) return true;
      }
      return false;
    }
    for (let index = 0; index < pattern.length; index++) {
      const token = pattern[index];
      if (token.unificationNeutral || token.unification == null) continue;
      for (const position of positions[index] || []) {
        candidateSets.push(tokenReadings(words[position], rawPos).filter(reading => reading.tag != null
          && matchesReading(token, words[position], reading)).flatMap(reading => {
          const values = {};
          for (const [feature, declared] of Object.entries(token.unification)) {
            const definitions = unificationDefinitions[feature] || {};
            const types = declared.length ? declared : Object.keys(definitions);
            values[feature] = types.filter(type => definitions[type]?.test(reading.tag));
            if (!values[feature].length) return [];
          }
          return [values];
        }));
      }
      if (token.lastInUnification) {
        if (coherent() === Boolean(token.unificationNegated)) return false;
        candidateSets = [];
      }
    }
    return !candidateSets.length || coherent();
  }

  function isSuppressedByAntiPattern(antiPatterns, words, positivePositions, rawPos = false) {
    if (!positivePositions.length) return false;
    const positiveStart = Math.min(...positivePositions);
    const positiveEnd = Math.max(...positivePositions);
    for (const antiPattern of antiPatterns || []) {
      const pattern = antiPattern.pattern;
      const finiteSpan = pattern.reduce((span, token) => span
        + Math.max(0, token.maxOccurrence === -1 ? 0 : token.maxOccurrence - 1)
        + (token.skipNext > 0 ? token.skipNext : 0), pattern.length);
      const hasUnboundedWindow = pattern.some(token => token.skipNext === -1 || token.maxOccurrence === -1);
      const minStart = hasUnboundedWindow ? 0 : Math.max(0, positiveStart - finiteSpan);
      for (let start = minStart; start <= positiveEnd; start++) {
        const matchedPositions = matchSequenceAt(pattern, words, start, rawPos, false, true);
        if (!matchedPositions) continue;
        const antiPositions = matchedPositions.flat();
        if (!antiPositions.length) continue;
        // LanguageTool's anti-pattern action immunizes the token span from its
        // first to last matched token. PatternRuleMatcher then reruns the
        // positive rule and rejects it if any of its matched tokens is immune.
        const marked = pattern.flatMap((token, index) => token.insideMarker ? matchedPositions[index] || [] : []);
        const immunePositions = marked.length ? marked : antiPositions;
        const antiStart = immunePositions[0];
        const antiEnd = immunePositions.at(-1);
        if (positivePositions.some(position => position >= antiStart && position <= antiEnd)) return true;
      }
    }
    return false;
  }

  function regexRulesForTag(tag) {
    const key = tag == null ? "\u0000" : tag;
    if (!posRegexCache.has(key)) {
      const found = [];
      if (tag != null) {
        for (const entry of posRegexFirst.values()) if (entry.regex.test(tag)) found.push(...entry.rules);
      }
      posRegexCache.set(key, found);
    }
    return posRegexCache.get(key);
  }

  function firstCandidates(token) {
    const surface = token.typographicApostrophe ? String(token.text).replace(/’/gu, "'") : String(token.text);
    const found = new Set([
      ...unconstrainedFirst,
      ...(caseInsensitiveByFirst.get(surface.toLocaleLowerCase("es")) || []),
      ...(caseSensitiveByFirst.get(surface) || [])
    ]);
    if (surfaceRegexFirst.length || surfaceRegexByPrefix.size) {
      const initial = [...surface];
      const isAsciiInitial = initial.length > 0 && initial[0].codePointAt(0) <= 0x7f;
      const regexEntries = [
        ...(surfaceRegexByPrefix.get(`s:${initial[0]}`) || []),
        ...(isAsciiInitial ? surfaceRegexByPrefix.get(`i:${initial[0].toUpperCase()}`) || [] : surfaceRegexInsensitive),
        ...surfaceRegexFirst
      ];
      for (const entry of regexEntries) {
        const inputs = entry.inflected
          ? [...tokenReadings(token), ...tokenReadings(token, true)].map(reading => reading.lemma == null ? surface : String(reading.lemma))
          : [surface];
        if (inputs.some(value => value.length <= 250 && entry.regex.test(value))) {
          for (const rule of entry.rules) found.add(rule);
        }
      }
    }
    const readings = [...tokenReadings(token), ...tokenReadings(token, true)];
    if ((token.readings || []).every(reading => reading.tag == null || ["SENT_END", "PARAGRAPH_END"].includes(reading.tag))) {
      for (const rule of exactPosFirst.get("UNKNOWN") || []) found.add(rule);
      for (const rule of regexRulesForTag("UNKNOWN")) found.add(rule);
    }
    for (const reading of readings) {
      if (reading.lemma != null) {
        const lemma = String(reading.lemma);
        for (const rule of lemmaInsensitiveByFirst.get(lemma.toLocaleLowerCase("es")) || []) found.add(rule);
        for (const rule of lemmaSensitiveByFirst.get(lemma) || []) found.add(rule);
      }
      for (const rule of exactPosFirst.get(reading.tag == null ? "UNKNOWN" : reading.tag) || []) found.add(rule);
      for (const rule of regexRulesForTag(reading.tag)) found.add(rule);
    }
    return [...found];
  }

  function decodeEntities(text) {
    return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/giu, (_whole, entity) => {
      if (entity[0] === "#") {
        const code = entity[1]?.toLowerCase() === "x" ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10);
        return Number.isFinite(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : _whole;
      }
      return ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" })[entity.toLowerCase()] ?? _whole;
    });
  }

  // LanguageTool messages use inline XML such as <suggestion> to identify
  // replacement text inside the explanation. The issue UI renders messages
  // as escaped plain text, so return the message's text content here rather
  // than exposing those XML tags to the user. Decode entities only after
  // removing markup; the UI still escapes the resulting text before display.
  function plainRuleMessage(message) {
    // A single <suggestion> containing a POS-based reference may expand to
    // several adjacent alternatives. LanguageTool presents those as a
    // comma-separated list; preserve that separator before removing markup.
    return decodeEntities(String(message || "")
      .replace(/<\/suggestion>\s*<suggestion>/gu, ", ")
      .replace(/<\/?[A-Za-z][^>]*\/?\s*>/gu, ""));
  }

  function isAllUppercase(text) {
    const letters = [...text].filter(char => /[\p{Lu}\p{Ll}\p{Lt}]/u.test(char));
    return letters.length > 0 && letters.every(char => char === char.toLocaleUpperCase("es"));
  }

  function isCapitalizedWord(text) {
    const chars = [...text];
    return chars.length > 0 && chars[0] === chars[0].toLocaleUpperCase("es")
      && chars.slice(1).every(char => !/\p{L}/u.test(char) || char === char.toLocaleLowerCase("es"));
  }

  function isMixedCase(text) {
    return [...text].some(char => /\p{Lu}/u.test(char))
      && [...text].some(char => /\p{Ll}/u.test(char));
  }

  function appendSkippedText(value, includeSkipped, patternIndex, positions, words) {
    if (includeSkipped === "NONE") return value;
    const selected = positions[patternIndex] || [];
    if (!selected.length) return includeSkipped === "FOLLOWING" ? "\uE002" : value;
    const start = selected.at(-1);
    let next = -1;
    for (let index = patternIndex + 1; index < positions.length && next < 0; index++) {
      next = (positions[index] || []).find(position => position > start) ?? -1;
    }
    if (next < 0) return includeSkipped === "FOLLOWING" ? "\uE002" : value;
    let skipped = "";
    for (let index = start + 1; index < next; index++) {
      if ((includeSkipped === "ALL" || index > start + 1) && words[index].whitespaceBefore) skipped += " ";
      skipped += words[index].text;
    }
    return includeSkipped === "FOLLOWING" ? (skipped || "\uE002") : value + skipped;
  }

  function formatReferencedMessage(template, specifications, positions, words) {
    let counter = 0;
    const variants = [];
    const previousSpecifications = new Map();
    const result = template.replace(/\\([1-9]\d*)/gu, (_whole, number) => {
      const index = Number(number) - 1;
      const spec = specifications[counter++] || previousSpecifications.get(index);
      if (spec) previousSpecifications.set(index, spec);
      // LanguageTool permits a reference just beyond the final explicit
      // pattern element; it resolves to the final matched token.
      const selected = positions[index]?.length ? positions[index]
        : index >= positions.length ? [...positions].reverse().find(values => values?.length) || [] : [];
      if (!selected.length) return "";
      const token = words[selected.at(-1)];
      if (spec?.posTag != null) {
        const sourceReadings = token.readings || [];
        let readings = spec.staticLemma != null ? [{token:spec.staticLemma,lemma:spec.staticLemma,tag:spec.posTag}] : sourceReadings;
        let targetTag = spec.posTag;
        if (spec.posRegexp) {
            const expression = globalThis.CorrectorJavaCaseRegex.compile(spec.posTag, true);
            const matchedTags = [...new Set(sourceReadings.map(row => row.tag).filter(value => value != null && expression.test(value)))];
            targetTag = synthesizer?.getTargetPosTag(matchedTags, targetTag) ?? targetTag;
          if (spec.posTagReplace != null) {
            const replacementExpression = globalThis.CorrectorJavaCaseRegex.compile(spec.posTag, true, true);
              const replaceFrom = spec.staticLemma != null ? [targetTag] : matchedTags.length ? matchedTags : [targetTag];
              targetTag = replaceFrom.map(value => value.replace(replacementExpression, spec.posTagReplace)).join("|");
          }
        }
          let forms = readings.flatMap(reading => synthesizer?.synthesize(reading, targetTag, Boolean(spec.posRegexp)) || []);
        if (!forms.length && spec.posRegexp) forms = ["(" + (spec.staticLemma ?? token.text) + ")"];
        // MatchState.toFinalString in LanguageTool collects synthesized forms
        // in a TreeSet before expanding the suggestion template. The sorted
        // order is observable to users and avoids tagger-reading order leaking
        // into otherwise equivalent suggestions.
        forms = [...new Set(forms)].sort();
        forms=forms.map(value=>{
          const conversion=spec.caseConversion||"NONE";
          if(conversion==="ALLLOWER"||conversion==="FIRSTUPPER")value=value.toLocaleLowerCase("es");
          if(conversion==="ALLUPPER"||conversion==="PRESERVE"&&isAllUppercase(token.text))value=value.toLocaleUpperCase("es");
          if(conversion==="STARTLOWER")value=value.slice(0,1).toLocaleLowerCase("es")+value.slice(1);
          if(["STARTUPPER","FIRSTUPPER"].includes(conversion)||conversion==="PRESERVE"&&/^\p{Lu}/u.test(token.text))value=value.slice(0,1).toLocaleUpperCase("es")+value.slice(1);
          if(spec.checksSpelling){const first=lexicalLookup(value)[0];if(first?.lemma==null&&first?.tag==null)value="<mistake/>";}return value;
        });
        forms=forms.map(value=>appendSkippedText(value,spec.includeSkipped,index,positions,words));
        const id=variants.push(forms)-1;return `\uE000${id}\uE001`;
      }
      let value = spec?.staticLemma ?? String(token.text);
      if (spec?.regexMatch != null) {
        const expression = globalThis.CorrectorJavaCaseRegex.compile(spec.regexMatch, true, true);
        const replacement = (spec.regexReplace || "").replace(/\$0(?!\d)/gu, () => "$&");
        value = value.replace(expression, replacement);
      }
      const conversion = spec?.caseConversion || "NONE";
      if (conversion === "ALLLOWER" || conversion === "FIRSTUPPER") value = value.toLocaleLowerCase("es");
      if (conversion === "ALLUPPER") value = value.toLocaleUpperCase("es");
      if (conversion === "STARTLOWER") value = value.slice(0, 1).toLocaleLowerCase("es") + value.slice(1);
      if (["STARTUPPER", "FIRSTUPPER"].includes(conversion) || conversion === "PRESERVE" && /^\p{Lu}/u.test(token.text)) {
        value = conversion === "PRESERVE" && isAllUppercase(token.text) ? value.toLocaleUpperCase("es")
          : value.slice(0, 1).toLocaleUpperCase("es") + value.slice(1);
      }
      if (spec?.checksSpelling) {
        if (!lexicalLookup) throw new Error("PatternRule lexical lookup is not configured.");
        const first = lexicalLookup(value)[0];
        if (first?.lemma == null && first?.tag == null) value = "<mistake/>";
      }
      value=appendSkippedText(value,spec?.includeSkipped||"NONE",index,positions,words);
      return value;
    });
    const expanded=result.replace(/<suggestion>([\s\S]*?)<\/suggestion>/giu,(_whole,body)=>{
      let values=[body];while(values.some(value=>/\uE000\d+\uE001/u.test(value))){values=values.flatMap(value=>{const m=value.match(/\uE000(\d+)\uE001/u);return m?variants[Number(m[1])].map(form=>value.replace(m[0],form)):[value];});}
      return values.map(value=>`<suggestion>${value.replace(/( )?\uE002( )?/gu, (_match, before, after) => before || after ? " " : "")}</suggestion>`).join("");
    }).replace(/\uE000(\d+)\uE001/gu,(_whole,id)=>variants[Number(id)][0]||"");
    return expanded.replace(/<suggestion><pleasespellme\/>[^<>()]*(?:\([^<>()]*\)|<mistake\/>)[^<>()]*<\/suggestion>/gu, "")
      .replaceAll("<suggestion><pleasespellme/>", "<suggestion>");
  }

  function canFormatReferences(rule) {
    if (/<match\b/u.test(rule.message || "") || /<match\b/u.test(rule.shortMessage || "")
        || /<match\b/u.test(rule.suggestionsOutMsg || "")) return false;
    return [...rule.suggestionMatches || [], ...rule.suggestionMatchesOutMsg || []].every(spec => {
      // In LanguageTool, setsPos needs an extra synthesizer POS correction
      // only for non-static lemmas. Static-lemma references already synthesize
      // from the selected/rewritten target tag, so this output operation is
      // portable through the local morphology resource.
      if (spec.posTag?.startsWith("_spell_number_")
          && !["_spell_number_", "_spell_number_:feminine", "_spell_number_:Roman"].includes(spec.posTag)) return false;
      if (spec.setsPos && spec.staticLemma == null || spec.tokenRef !== 0) return false;
      if (spec.regexMatch != null) {
        if (/\\(?:Q|E|R|h|v|X|A|z|Z|b|k)|&&/u.test(spec.regexMatch)) return false;
        try { globalThis.CorrectorJavaCaseRegex.compile(spec.regexMatch, true, true); } catch { return false; }
      }
      return true;
    });
  }

  // PatternRuleMatcher only applies its automatic suggestion capitalization
  // when the first replacement is not already a case-converting <match>.
  // This prevents a rule's explicit ALLLOWER/FIRSTUPPER/etc. from being
  // overwritten by the capitalization of the source token.
  function matchPreservesCase(specifications, template) {
    if (specifications?.length) {
      let suggestionStart = template.indexOf("<suggestion>") + "<suggestion>".length;
      if (template.includes("<pleasespellme/>")) suggestionStart += "<pleasespellme/>".length;
      for (const spec of specifications) {
        if (!spec.inMessageOnly && (spec.caseConversion || "NONE") !== "NONE"
            && template[suggestionStart] === "\\") return false;
      }
    }
    return true;
  }

  function formatOutput(rule, matchedText, startsWithUppercase, allUppercase, positions, words) {
    if (rule.outputPortable === false && !canFormatReferences(rule)) return { message: "", suggestions: [] };
    const rawMessage = formatReferencedMessage(rule.message || "", rule.suggestionMatches || [], positions, words);
    const outMessage = formatReferencedMessage(rule.suggestionsOutMsg || "", rule.suggestionMatchesOutMsg || [], positions, words);
    const preserveSuggestionCase = matchPreservesCase(rule.suggestionMatches, rule.message || "")
      && matchPreservesCase(rule.suggestionMatchesOutMsg, rule.suggestionsOutMsg || "");
    const suggestionMarkup = `${rawMessage}${outMessage}`;
    const suggestions = [];
    suggestionMarkup.replace(/<suggestion>([\s\S]*?)<\/suggestion>/giu, (_whole, suggestion) => {
      let value = decodeEntities(suggestion.replace(/<[^>]*>/gu, ""));
      const matchedTextHasLetters = /[\p{Lu}\p{Ll}\p{Lt}]/u.test(matchedText);
      if (rule.adjustSuggestionCase && preserveSuggestionCase && matchedTextHasLetters && allUppercase && !(isMixedCase(value) && !value.includes(" "))) {
        const upper = value.toLocaleUpperCase("es");
        if (matchedText !== upper) value = upper;
      } else if (rule.adjustSuggestionCase && preserveSuggestionCase && matchedTextHasLetters && startsWithUppercase) {
        const first = [...value][0];
        if (first) value = first.toLocaleUpperCase("es") + value.slice(first.length);
      }
      if (!/[\\$]\d/u.test(value) && !suggestions.includes(value)) suggestions.push(value);
      return _whole;
    });
    return { message: plainRuleMessage(rawMessage), suggestions,
      suppressed: rawMessage.includes("<pleasespellme/>") && !suggestions.length };
  }

  // Mirrors Spanish.adaptSuggestion in LanguageTool: avoid the ungrammatical
  // article contractions "a el" and "de el" in generated replacements.
  function adaptSpanishSuggestion(replacement) {
    return String(replacement).replace(/\b([Aa]|[Dd]e) e(l)\b/gu, "$1$2");
  }

  function adaptSpanishSuggestions(suggestions) { return [...new Set(suggestions.map(adaptSpanishSuggestion))]; }

  function parseFilterArguments(source) {
    const result = {};
    for (const item of String(source || "").trim().split(/\s+/u)) {
      const colon = item.indexOf(":");
      if (colon > 0) result[item.slice(0, colon)] = item.slice(colon + 1);
    }
    return result;
  }

  function misspelledSuggestion(value, context) {
    const parts = String(value).match(/[\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}\p{N}]+)*/gu) || [];
    const speller = globalThis.CorrectorSpanishSpelling, morphology = context?.morphology;
    return parts.some(part => speller?.isMisspelled(part, morphology, { spellData: context?.spellingData }) ?? false);
  }

  function applySpanishSuppressMisspelledFilter(rule, output, context) {
    const args = parseFilterArguments(rule.filterArguments);
    const suggestions = output.suggestions.filter(suggestion => !misspelledSuggestion(suggestion, context));
    if (!suggestions.length && String(args.suppressMatch || "true").toLowerCase() !== "false") return { suppressed: true };
    return { suggestions };
  }

  function applySpanishNumberInWordFilter(rule, output, matchedPositions, words, context) {
    const args = parseFilterArguments(rule.filterArguments);
    const reference = /^\\([1-9]\d*)$/u.exec(args.word || "");
    const matchPositions = reference ? matchedPositions[Number(reference[1]) - 1] || [] : [];
    const word = matchPositions.map(position => words[position]?.text || "").join("");
    const wordReplacingZeroO = word.replaceAll("0", "o");
    const wordWithoutDigits = word.replace(/[0-9]/gu, "");
    const speller = globalThis.CorrectorSpanishSpelling, morphology = context?.morphology;
    if (!speller || !morphology || !word) return { suppressed: true };
    const isMisspelled = value => speller.isMisspelled(value, morphology, { spellData: context?.spellingData });
    const suggestions = [];
    if (!isMisspelled(wordReplacingZeroO) && word !== wordReplacingZeroO) suggestions.push(wordReplacingZeroO);
    if (!isMisspelled(wordWithoutDigits)) suggestions.push(wordWithoutDigits);
    if (!suggestions.length) suggestions.push(...speller.suggest(wordWithoutDigits, morphology, { spellData: context?.spellingData }));
    const uniqueSuggestions = [...new Set(suggestions)].filter(value => value && value !== word);
    return uniqueSuggestions.length ? { suggestions: uniqueSuggestions } : { suppressed: true };
  }

  function applyApostropheTypeFilter(rule, matchedPositions, markerPositions, words) {
    const args = parseFilterArguments(rule.filterArguments);
    const wordFrom = args.wordFrom || "";
    const expectsTypographic = String(args.hasTypographicalApostrophe || "false").toLowerCase() === "true";
    let tokenIndex = -1;
    if (/^\d+$/u.test(wordFrom)) tokenIndex = matchedPositions[Number(wordFrom) - 1]?.[0] ?? -1;
    else if (wordFrom === "marker") {
      const matchStart = markerPositions[0]?.start ?? Infinity;
      const patternTokenPositions = matchedPositions.flat();
      const index = patternTokenPositions.findIndex(position => words[position]?.start >= matchStart);
      if (index >= 0) tokenIndex = patternTokenPositions[index + 1] ?? -1;
    }
    // LanguageTool keeps the match only when the token flag equals the argument.
    if (tokenIndex < 0 || Boolean(words[tokenIndex]?.typographicApostrophe) !== expectsTypographic) {
      return { suppressed: true };
    }
    return {};
  }

  function applySpanishConfusionCheckFilter(rule, output, matchedPositions, context) {
    const args = parseFilterArguments(rule.filterArguments), sourceForm = args.form || "";
    const reference = /^\\([1-9]\d*)$/u.exec(sourceForm);
    const sourcePosition = reference ? matchedPositions[Number(reference[1]) - 1]?.[0] : -1;
    const originalForm = sourcePosition == null || sourcePosition < 0 ? sourceForm : context.words?.[sourcePosition]?.text;
    const pairs = context.confusionPairs?.[String(originalForm || "").toLocaleLowerCase("es")];
    if (!originalForm || !pairs?.length) return { suppressed: true };
    const fullPosRegex = source => globalThis.CorrectorJavaCaseRegex.compile(`^(?:${source})$`, true);
    const postag = fullPosRegex(args.postag || ".*");
    if (!pairs.some(pair => postag.test(pair.tag))) return { suppressed: true };
    let desiredGenderNumber = null;
    if (args.gendernumberFrom) {
      const referenceIndex = Number(args.gendernumberFrom) - 1;
      const targetPosition = matchedPositions.flat()[referenceIndex];
      const target = targetPosition == null ? null : context.words?.[targetPosition];
      if (!target) return { suppressed: true };
      const sourceTags = (target.readings || []).map(reading => reading.tag).filter(Boolean);
      const genders = [
        ["MS", "[NAPD].+MS.*|V.P..SM"], ["MP", "[NAPD].+MP.*|V.P..PM"],
        ["FS", "[NAPD].+FS.*|V.P..SF"], ["FP", "[NAPD].+FP.*|V.P..PF"],
        ["CP", "[NAPD].+CP.*|V.P..P."], ["CS", "[NAPD].+CS.*|V.P..S."]
      ];
      desiredGenderNumber = genders.find(([, expression]) => {
        const regex = fullPosRegex(expression);
        return sourceTags.some(tag => regex.test(tag));
      })?.[0] || null;
      if (!desiredGenderNumber) return { suppressed: true };
      const genderNumberRegex = {
        MS: "NC[MC][SN]000|A..[MC][SN].|V.P..SM", FS: "NC[FC][SN]000|A..[FC][SN].|V.P..SF",
        MP: "NC[MC][PN]000|A..[MC][PN].|V.P..PM", FP: "NC[FC][PN]000|A..[FC][PN].|V.P..PF",
        CP: "NC[MFC][PN]000|A..[MFC][PN].|V.P..P.", CS: "NC[MFC][SN]000|A..[MFC][SN].|V.P..S."
      }[desiredGenderNumber];
      if (!fullPosRegex(genderNumberRegex).test(pairs[0].tag)) return { suppressed: true };
    }
    let replacement = pairs[0].replacement;
    const folded = String(originalForm).toLocaleLowerCase("es");
    const allUpper = originalForm !== folded && originalForm === originalForm.toLocaleUpperCase("es");
    const capitalized = /^\p{Lu}\p{Ll}*$/u.test(originalForm);
    if (allUpper) replacement = replacement.toLocaleUpperCase("es");
    else if (capitalized) replacement = replacement.slice(0, 1).toLocaleUpperCase("es") + replacement.slice(1);
    let suggestion = output.suggestions?.[0] || "";
    suggestion = suggestion.replaceAll("{suggestion}", replacement)
      .replaceAll("{Suggestion}", replacement.slice(0, 1).toLocaleUpperCase("es") + replacement.slice(1))
      .replaceAll("{SUGGESTION}", replacement.toLocaleUpperCase("es"));
    let message = output.message || "";
    if (!( /[áéíóúüñ]/iu.test(replacement) && !/[áéíóúüñ]/iu.test(folded) )) message = message.replaceAll("se escribe con tilde", "se escribe de otra manera");
    return { message, suggestions: suggestion ? [suggestion] : [] };
  }

  function applyFindSuggestionsFilter(rule, markedText, words, matchedPositions, markerPositions, output, context) {
    const args = parseFilterArguments(rule.filterArguments);
    // LanguageTool indexes the patternTokens window passed to the filter
    // (one-based), not the sentence token array. The window also includes any
    // skipped tokens between the first and last matched pattern elements.
    const consumedPositions = matchedPositions.flat();
    const windowStart = consumedPositions.length ? Math.min(...consumedPositions) : -1;
    const windowEnd = consumedPositions.length ? Math.max(...consumedPositions) : -1;
    const patternWindow = windowStart >= 0 ? words.slice(windowStart, windowEnd + 1) : [];
    let sourceWord = "";
    if (args.wordFrom === "inmarker") {
      sourceWord = markedText.replace(/\s+/gu, "");
    } else if (/^marker(?:-?\d+)?$/u.test(args.wordFrom || "")) {
      // RuleFilter.getPosition("marker[n]") resolves to the marked token
      // itself plus the optional signed offset. Use the marker token directly
      // so sentence-start sentinels and skipped pattern tokens cannot shift
      // the source word by one.
      const markerIndexes = markerPositions.map(token => words.indexOf(token)).filter(index => index >= 0);
      const markerStart = markerIndexes.length ? Math.min(...markerIndexes) : -1;
      const markerOffset = markerStart >= 0 ? markerStart - windowStart : -1;
      const suffix = String(args.wordFrom).slice("marker".length);
      const offset = suffix ? Number(suffix) : 0;
      const targetIndex = markerOffset >= 0 ? markerOffset + offset : -1;
      sourceWord = targetIndex >= 0 ? String(patternWindow[targetIndex]?.text ?? "") : "";
    } else {
      const sourcePosition = Number(args.wordFrom);
      sourceWord = Number.isInteger(sourcePosition) && sourcePosition >= 1
        ? String(patternWindow[sourcePosition - 1]?.text ?? "") : "";
    }
    const morphology = context?.morphology, spelling = globalThis.CorrectorSpanishSpelling;
    const tagger = globalThis.CorrectorSpanishTagger;
    // Spanish FindSuggestionsFilter does not override AbstractFindSuggestionsFilter.getSynthesizer(),
    // whose upstream default is null. Only direct spell candidates with a matching POS survive;
    // synthesized grammatical alternatives belong to AdvancedSynthesizerFilter instead.
    const synthesizer = null;
    const desiredPostag = args.desiredPostag;
    const desiredRegex = desiredPostag ? globalThis.CorrectorJavaCaseRegex.compile(desiredPostag, true) : null;
    const priorityRegex = args.priorityPostag ? globalThis.CorrectorJavaCaseRegex.compile(args.priorityPostag, true) : null;
    const originalReads = sourceWord && tagger && morphology
      ? tagger.tagToken({ text: sourceWord }, morphology).readings : [];
    const mode = args.Mode === "diacritics";
    if (mode && originalReads.some(reading => desiredRegex?.test(reading.tag))) return { suppressed: true, suggestions: [] };

    // FindSuggestionsFilter uses the Spanish Morfologik dictionary directly.
    // For regular words, keep the local low-distance ranker; for apostrophe
    // compounds, query the FSA so valid capitalization variants survive.
    // Keep a wider candidate window here: FindSuggestionsFilter applies POS,
    // accent and replacement constraints before its own ten-result cap.
    const ranked = sourceWord && context.filterSpeller
      ? context.filterSpeller.findSimilarWords(sourceWord, 1)
      : sourceWord && spelling && morphology
        ? spelling.suggest(sourceWord, morphology, { limit: 30, spellData: context.spellingData }) : [];
    const apostropheNormalized = value => value.toLocaleLowerCase("es").replace(/[’`]/gu, "'");
    let raw = ranked;
    if (sourceWord && morphology && /['’`]/u.test(sourceWord)) {
      const distanceOne = morphology.suggestForms(sourceWord, { maxDistance: 1, maxResults: 2048 });
      const apostropheOnlyCorrection = distanceOne.some(value => apostropheNormalized(value) === apostropheNormalized(sourceWord));
      raw = sourceWord.includes("`") || apostropheOnlyCorrection
        ? distanceOne : morphology.suggestForms(sourceWord, { maxDistance: 2, maxResults: 2048 });
      const caseVariants = new Map();
      for (const candidate of raw) {
        const key = candidate.toLocaleLowerCase("es");
        if (!caseVariants.has(key)) caseVariants.set(key, []);
        caseVariants.get(key).push(candidate);
      }
      raw = [...caseVariants.values()].flat();
    }
    const maxSuggestions = 10, direct = [], directSources = new Set(), synthesized = [], usedLemmas = new Set();
    const letters = [...sourceWord].filter(char => /\p{L}/u.test(char));
    const capitalized = Boolean(/^\p{Lu}/u.test(sourceWord) && letters.slice(1).every(char => /^\p{Ll}$/u.test(char)));
    const allUpper = sourceWord !== sourceWord.toLocaleLowerCase("es")
      && sourceWord === sourceWord.toLocaleUpperCase("es");
    const removeRegex = args.removeSuggestionsRegexp ? globalThis.CorrectorJavaCaseRegex.compile(args.removeSuggestionsRegexp, false) : null;
    const equalWithoutDiacritics = value => String(value).normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("es")
      === sourceWord.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("es");
    const convertCase = value => {
      if (allUpper) return value.toLocaleUpperCase("es");
      if (capitalized) return value ? [...value][0].toLocaleUpperCase("es") + [...value].slice(1).join("") : value;
      return value;
    };
    for (const suggestion of raw) {
      if (direct.length >= 20) break;
      const analyzed = tagger.tagToken({ text: suggestion }, morphology).readings;
      let used = false;
      for (const reading of analyzed) {
        if (suggestion !== sourceWord && desiredRegex?.test(reading.tag)
            && !directSources.has(suggestion) && !directSources.has(suggestion.toLocaleLowerCase("es"))
            && !(removeRegex && removeRegex.test(suggestion))
            && (!mode || equalWithoutDiacritics(suggestion))) {
          const value = convertCase(suggestion);
          if (priorityRegex?.test(reading.tag)) direct.unshift(value); else direct.push(value);
          directSources.add(suggestion);
          used = true;
          if (direct.length >= 20) break;
        }
      }
      if (!used && synthesizer && desiredPostag) for (const reading of analyzed) {
        if (!reading.lemma || usedLemmas.has(reading.lemma)) continue;
        usedLemmas.add(reading.lemma);
        for (const candidate of synthesizer.synthesize({ lemma: reading.lemma }, desiredPostag, true) || []) {
          if ((!removeRegex || !removeRegex.test(candidate)) && (!mode || equalWithoutDiacritics(candidate))) synthesized.push(convertCase(candidate));
        }
      }
    }

    const finished = output.suggestions.filter(value => !/[{](?:SUGGESTION|Suggestion|suggestion)[}]/u.test(value));
    if (args.suppressMatch?.toLowerCase() === "true" && direct.length + synthesized.length === 0 && !finished.length) {
      return { suppressed: true, suggestions: [] };
    }
    const replacements = direct.length ? direct : synthesized;
    const hasReplacementTemplate = output.suggestions.some(value => /\{(?:SUGGESTION|Suggestion|suggestion)\}/u.test(value));
    const suggestions = [];
    for (const template of output.suggestions) {
      const placeholder = /\{(suggestion|Suggestion|SUGGESTION)\}/u.exec(template);
      if (!placeholder) {
        if (!suggestions.includes(template)) suggestions.push(template);
        continue;
      }
      const replacementKey = placeholder[1];
      for (const replacement of replacements) {
        if (suggestions.length >= maxSuggestions) break;
        let value = replacement;
        if (replacementKey === "Suggestion") value = value ? [...value][0].toLocaleUpperCase("es") + [...value].slice(1).join("") : value;
        if (replacementKey === "SUGGESTION") value = value.toLocaleUpperCase("es");
        const expanded = template.replace(placeholder[0], value);
        if (!suggestions.includes(expanded)) suggestions.push(expanded);
      }
    }
    if (!hasReplacementTemplate) {
      for (const replacement of replacements) {
        if (suggestions.length >= maxSuggestions) break;
        if (!suggestions.includes(replacement)) suggestions.push(replacement);
      }
    }
    const errorText = markedText;
    return { suppressed: false, suggestions: suggestions.filter(value => value !== errorText).slice(0, maxSuggestions) };
  }

  function isPunctuationOrSymbol(token) {
    return Boolean(token && /^(?:\p{P}|\p{S})+$/u.test(token.text));
  }

  function isCapitalizedWord(token) {
    if (!token || !/^\p{Lu}/u.test(token.text)) return false;
    return [...token.text].filter((char, index) => index > 0 && /\p{L}/u.test(char))
      .every(char => /^\p{Ll}$/u.test(char));
  }

  function applyAddCommasFilter(rule, markedText, start, end, words) {
    const args = parseFilterArguments(rule.filterArguments);
    let from = 1;
    while (from < words.length && words[from].start < start) from++;
    let to = from;
    while (to < words.length && words[to].end < end) to++;
    const beforeOK = from === 1 || isPunctuationOrSymbol(words[from - 1]) || isCapitalizedWord(words[from]);
    const following = words[to + 1];
    const afterOK = Boolean(following && isPunctuationOrSymbol(following)
      && !(following.whitespaceBefore && /^[«“"‘'„¿¡]$/u.test(following.text)));
    if (beforeOK && afterOK) return { suppressed: true };
    if (args.suggestSemicolon?.toLowerCase() === "true" && words[from - 1]?.text === "," && !afterOK) {
      return { start: words[from - 1].start, end: words[to].end,
        suggestions: [`; ${markedText},`, `, ${markedText},`] };
    }
    if (beforeOK && !afterOK) return { start: words[to].start, end,
      suggestions: [`${words[to].text},`] };
    if (!beforeOK && afterOK) return { start: words[from].whitespaceBefore ? words[from].start - 1 : words[from].start,
      end: words[from].end, suggestions: [`, ${words[from].text}`] };
    return { start: words[from].whitespaceBefore ? words[from].start - 1 : words[from].start,
      end: words[to].end, suggestions: [`, ${markedText},`] };
  }

  function normalizeMultitokenKey(value) {
    return String(value).toLocaleLowerCase("es").normalize("NFD").replace(/\p{M}/gu, "").replace(/-/gu, " ").replace(/\s+/gu, " ").trim();
  }

  function editDistance(left, right, limit = Infinity) {
    if (Math.abs(left.length - right.length) > limit) return limit + 1;
    const row = Array.from({ length: right.length + 1 }, (_, index) => index <= limit ? index : limit + 1);
    for (let i = 1; i <= left.length; i++) {
      const from = Math.max(1, i - limit), to = Math.min(right.length, i + limit);
      let diagonal = row[from - 1]; row[0] = i <= limit ? i : limit + 1;
      let rowMinimum = row[0];
      for (let j = 1; j < from; j++) row[j] = limit + 1;
      for (let j = from; j <= to; j++) {
        const above = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
        rowMinimum = Math.min(rowMinimum, row[j]);
        diagonal = above;
      }
      for (let j = to + 1; j <= right.length; j++) row[j] = limit + 1;
      if (rowMinimum > limit) return limit + 1;
    }
    return row[right.length] <= limit ? row[right.length] : limit + 1;
  }

  function multitokenLevenshtein(left, right) {
    if (left.replace(/ /gu, "") === right.replace(/ /gu, "")) return 0;
    const anagram = left.length === right.length && [...left].sort().join("") === [...right].sort().join("");
    if (anagram) return 1;
    const normalizedLeft = left.replace(/y/gu, "i").replace(/ko/gu, "co").replace(/ka/gu, "ca");
    const normalizedRight = right.replace(/y/gu, "i").replace(/ko/gu, "co").replace(/ka/gu, "ca");
    return Math.min(editDistance(left, right), editDistance(normalizedLeft, normalizedRight));
  }

  function multitokenCorrectCharacterCount(candidate, original) {
    const expected = candidate.split(" "), actual = original.split(" ");
    if (expected.length !== actual.length || expected.length < 2) return 0;
    return expected.reduce((sum, part, index) => sum + (part === actual[index] ? part.length : 0), 0);
  }

  function multitokenFirstCharacterCost(candidate, original) {
    const expected = candidate.split(" "), actual = original.split(" ");
    if (expected.length !== 2 || actual.length !== 2) return 0;
    return expected.reduce((sum, part, index) => {
      const left = part[0], right = actual[index][0];
      if (left === right || (left === "i" && right === "y") || (left === "y" && right === "i")) return sum;
      if ((left === "s" && right === "z") || (left === "z" && right === "s")
          || (left === "b" && right === "v") || (left === "v" && right === "b")) return sum + 0.2;
      return sum + 1;
    }, 0);
  }

  function multitokenMaxEditDistance(candidate, original) {
    const correctLength = original.length - multitokenCorrectCharacterCount(candidate, original);
    const firstCharacterCost = multitokenFirstCharacterCost(candidate, original);
    return correctLength <= 7 ? Math.trunc(2 - firstCharacterCost)
      : Math.trunc(2 + 0.25 * (correctLength - 7) - 0.6 * firstCharacterCost);
  }

  function multitokenStopSearching(candidates, original) {
    if (candidates.some(candidate => candidate === original)) return true;
    return candidates.some(candidate => candidate === candidate.toLocaleLowerCase("es") && titleCaseMultitoken(candidate) === original);
  }

  // Proper-name particles stay lowercase in conventional Spanish casing and
  // in many borrowed surnames. Treating every word as a title word made
  // `Alexander von Humboldt` look equivalent to `Alexander Von Humboldt`,
  // suppressing the actual correction from the upstream multitoken rule.
  const lowercaseNameParticles = new Set([
    "a", "al", "da", "das", "de", "del", "der", "di", "do", "dos", "du", "la", "las", "le", "los",
    "of", "van", "von", "y", "e", "ibn", "bin", "l'", "d'"
  ]);

  function titleCaseMultitoken(value) {
    const parts = String(value).toLocaleLowerCase("es").split(/([ -])/u);
    let wordIndex = 0;
    return parts.map(part => {
      if (part === " " || part === "-") return part;
      if (wordIndex++ > 0 && lowercaseNameParticles.has(part)) return part;
      const firstLetter = part.search(/\p{L}/u);
      return firstLetter < 0 ? part : part.slice(0, firstLetter) + part[firstLetter].toLocaleUpperCase("es") + part.slice(firstLetter + 1);
    }).join("");
  }

  function sentenceStartToken(words) {
    let index = 1;
    while (index < words.length && isPunctuationOrSymbol(words[index])) index++;
    return index;
  }

  function applyMultitokenSpellerFilter(markedText, words, matchedPositions, context = {}) {
    const matchedTokens = matchedPositions.flat().map(index => words[index]).filter(Boolean);
    // LanguageTool suppresses only when every participating token is marked
    // ignored by spelling. A single ignored token (for example a particle in
    // a proper name) must not hide a valid multiword correction.
    if (!multitokenCandidates.length || (matchedTokens.length > 0 && matchedTokens.every(word => word.ignoredBySpeller))) return { suppressed: true };
    if ([...markedText].filter(char => /\p{L}/u.test(char)).length < 2 || markedText.length > 50) return { suppressed: true };
    const original = markedText.replace(/[\p{Zs}]+/gu, " ");
    const parts = original.split(" ");
    if (parts.length === 2) {
      if (isCapitalizedWord({ text: parts[1] })) {
        // Title-cased second token is more likely a pair of names than a run-on.
      } else if (!parts[0] || !parts[1]) return { suppressed: true };
      else {
        const speller = globalThis.CorrectorSpanishSpelling, morphology = context.morphology;
        const misspelled = value => !speller || !morphology || speller.isMisspelled(value, morphology, { spellData: context.spellingData });
        const leftSplit = parts[0].slice(0, -1), joined = parts[0].slice(-1) + parts[1];
        if (!misspelled(leftSplit) && !misspelled(joined)) return { suppressed: true };
        const joinedLeft = parts[0] + parts[1][0], rightSplit = parts[1].slice(1);
        if (!misspelled(joinedLeft) && !misspelled(rightSplit)) return { suppressed: true };
      }
    }
    const key = normalizeMultitokenKey(original), compact = key.replace(/ /gu, "");
    let suggestions = multitokenSuggestionCache.get(key);
    if (!suggestions) {
      const exact = multitokenCandidatesWithoutSpaces.get(compact) || [];
      if (exact.length && multitokenStopSearching(exact.map(entry => entry.value), original)) {
        multitokenSuggestionCache.set(key, []);
        return { suppressed: true };
      }
      let ranked = exact.map(entry => ({ value: entry.value, distance: 0 }));
      if (!ranked.length) {
        const parts = key.split(" "), length = original.replace(/- /gu, "-").replace(/ -/gu, "-").length;
        const bucket = multitokenCandidatesByFirstLength.get(key[0]) || new Map();
        for (let candidateLength = Math.max(1, length - 3); candidateLength <= length + 3; candidateLength++) for (const entry of bucket.get(candidateLength) || []) {
          if (multitokenStopSearching([entry.value], original)) {
            multitokenSuggestionCache.set(key, []);
            return { suppressed: true };
          }
          if (entry.key.length < 7) continue;
          const candidateParts = entry.parts;
          const distances = candidateParts.length === parts.length && parts.length > 1
            ? parts.map((part, i) => multitokenLevenshtein(part, candidateParts[i]))
            : [multitokenLevenshtein(key, entry.key)];
          const total = distances.reduce((sum, value) => sum + value, 0);
          if (total === 0) { ranked.push({ value: entry.value, distance: 0 }); continue; }
          if (distances.some((value, i) => value > (parts[i]?.length > 5 && candidateParts[i]?.length > 4 ? 2 : 1))) continue;
          if (total <= multitokenMaxEditDistance(entry.key, key)) ranked.push({ value: entry.value, distance: total });
        }
      }
      if (!ranked.length) { multitokenSuggestionCache.set(key, []); return { suppressed: true }; }
      const min = Math.min(...ranked.map(item => item.distance));
      suggestions = [...new Set(ranked.filter(item => item.distance === min).map(item => item.value))];
      if (multitokenSuggestionCache.size >= 5000) multitokenSuggestionCache.clear();
      multitokenSuggestionCache.set(key, suggestions);
    }
    suggestions = [...suggestions];
    if (!suggestions.length) return { suppressed: true };
    if (suggestions.some(value => titleCaseMultitoken(value) === original)) return { suppressed: true };
    if (original.length > 4 && isAllUppercase(original)) suggestions = [...new Set(suggestions.map(value => value.toLocaleUpperCase("es")))].filter(value => value !== original);
    else if (matchedPositions.flat()[0] === sentenceStartToken(words)) suggestions = [...new Set(suggestions.map(value => value === value.toLocaleLowerCase("es")
      ? value[0].toLocaleUpperCase("es") + value.slice(1) : value))].filter(value => value !== original);
    else suggestions = suggestions.filter(value => value !== original);
    return suggestions.length ? { suggestions } : { suppressed: true };
  }

  function configureMultitokenSpeller(resource) {
    if (resource?.schemaVersion !== 1 || resource.profile !== "es-ES" || !Array.isArray(resource.entries)) {
      throw new Error("El recurso del corrector multitérmino es-ES no corresponde al perfil fijado.");
    }
    multitokenCandidates = resource.entries.filter(value => typeof value === "string" && /\s|-./u.test(value))
      .map(value => { const key = normalizeMultitokenKey(value); return { value, key, parts: key.split(" ") }; })
      .filter(entry => entry.key.includes(" "));
    multitokenCandidatesWithoutSpaces = new Map();
    multitokenCandidatesByFirstLength = new Map(); multitokenSuggestionCache = new Map();
    for (const entry of multitokenCandidates) {
      const first = entry.key[0];
      if (!multitokenCandidatesByFirstLength.has(first)) multitokenCandidatesByFirstLength.set(first, new Map());
      const lengths = multitokenCandidatesByFirstLength.get(first);
      if (!lengths.has(entry.key.length)) lengths.set(entry.key.length, []);
      lengths.get(entry.key.length).push(entry);
      const compact = entry.key.replace(/ /gu, "");
      if (!multitokenCandidatesWithoutSpaces.has(compact)) multitokenCandidatesWithoutSpaces.set(compact, []);
      multitokenCandidatesWithoutSpaces.get(compact).push(entry);
    }
    return { entries: multitokenCandidates.length };
  }

  function applyAdvancedSynthesizerFilter(rule, output, words, matchedPositions, markerPositions, context) {
    const args = parseFilterArguments(rule.filterArguments);
    const resolvePosition = value => {
      if (String(value).startsWith("marker")) {
        const offset = Number(String(value).slice(6) || 0);
        const markerStart = markerPositions[0]?.start ?? -1;
        const positions = words.map((word, index) => ({ word, index })).filter(item => item.word.start >= markerStart);
        return positions[offset]?.index ?? -1;
      }
      const index = Number(value) - 1;
      return matchedPositions[index]?.[0] ?? -1;
    };
    const lemmaIndex = resolvePosition(args.lemmaFrom), tagIndex = resolvePosition(args.postagFrom);
    if (lemmaIndex < 0 || tagIndex < 0) return { suppressed: true };
    const lemmaRegex = globalThis.CorrectorJavaCaseRegex.compile(args.lemmaSelect, true);
    const tagRegex = globalThis.CorrectorJavaCaseRegex.compile(args.postagSelect, true);
    const selectReading = (index, regex) => {
      const readings = tokenReadings(words[index]);
      return readings.find(reading => regex.test(reading.tag || "UNKNOWN")) || readings[0] || null;
    };
    const lemmaReading = selectReading(lemmaIndex, lemmaRegex), tagReading = selectReading(tagIndex, tagRegex);
    if (!lemmaReading?.lemma || !tagReading?.tag) return { suppressed: true };
    let desiredTag = tagReading.tag;
    if (args.postagReplace) {
      const fromCaptures = new RegExp(args.lemmaSelect, "u").exec(lemmaReading.tag || "");
      const toCaptures = new RegExp(args.postagSelect, "u").exec(desiredTag);
      desiredTag = args.postagReplace.replace(/\\([ab])(\d+)/gu, (whole, source, number) =>
        (source === "a" ? fromCaptures : toCaptures)?.[Number(number)] ?? whole);
    }
    const synthesizer = context?.synthesizer;
    const forms = synthesizer?.synthesize({ lemma: lemmaReading.lemma }, desiredTag, true) || [];
    if (!forms.length) return {};
    const source = String(words[lemmaIndex].text || "");
    const letters = [...source].filter(char => /[\p{Lu}\p{Ll}\p{Lt}]/u.test(char));
    const capitalized = letters.length > 0 && letters[0] === letters[0].toLocaleUpperCase("es")
      && letters.slice(1).every(char => char === char.toLocaleLowerCase("es"));
    const allUpper = isAllUppercase(source);
    const templates = output.suggestions || [];
    const hasPlaceholder = templates.some(value => /\{(?:suggestion|Suggestion|SUGGESTION)\}/u.test(value));
    const values = [];
    for (let form of forms) {
      if (capitalized) form = [...form][0].toLocaleUpperCase("es") + [...form].slice(1).join("");
      if (allUpper) form = form.toLocaleUpperCase("es");
      if (hasPlaceholder) for (const template of templates) {
        const suggestion = template.replace(/\{suggestion\}/gu, form).replace(/\{Suggestion\}/gu,
          form ? [...form][0].toLocaleUpperCase("es") + [...form].slice(1).join("") : form)
          .replace(/\{SUGGESTION\}/gu, form.toLocaleUpperCase("es"));
        if (!values.includes(suggestion)) values.push(suggestion);
      }
      else if (!values.includes(form)) values.push(form);
    }
    return values.length ? { suggestions: values } : {};
  }

  function applyDateCheckFilter(rule, output, words, matchedPositions, sourceText, context = {}) {
    const args = parseFilterArguments(rule.filterArguments);
    const tokenAt = name => {
      const index = Number(args[name]);
      return Number.isInteger(index) && index > 0 ? matchedPositions[index - 1]?.[0] ?? -1 : -1;
    };
    const weekdayIndex = tokenAt("weekDay"), dayIndex = tokenAt("day"), monthIndex = tokenAt("month");
    const yearIndex = args.year ? tokenAt("year") : -1;
    if ([weekdayIndex, dayIndex, monthIndex].some(index => index < 0) || (args.year && yearIndex < 0)) return { suppressed: true };
    const weekdayToken = String(words[weekdayIndex].text).replace(/\u00ad/gu, "");
    const weekdayKey = weekdayToken.toLocaleLowerCase("es").normalize("NFD").replace(/\p{M}/gu, "");
    const weekdayNumber = ({ do: 0, domingo: 0, lu: 1, lunes: 1, ma: 2, martes: 2, mi: 3, miercoles: 3,
      ju: 4, jueves: 4, vi: 5, viernes: 5, sa: 6, sabado: 6 })[weekdayKey];
    if (weekdayNumber == null) return { suppressed: true };
    const rawDay = String(words[dayIndex].text), dayMatch = /^(\d+)/u.exec(rawDay);
    const day = dayMatch ? Number(dayMatch[1]) : NaN;
    const rawMonth = String(words[monthIndex].text).toLocaleLowerCase("es").normalize("NFD").replace(/\p{M}/gu, "").replace(/\.$/u, "");
    const monthNumber = /^\d+$/u.test(rawMonth) ? Number(rawMonth) : [
      ["en", 1], ["fe", 2], ["mar", 3], ["mzo", 3], ["ab", 4], ["may", 5], ["my", 5],
      ["jun", 6], ["jn", 6], ["jul", 7], ["jl", 7], ["ag", 8], ["se", 9], ["sep", 9], ["set", 9],
      ["oc", 10], ["no", 11], ["di", 12]
    ].find(([prefix]) => rawMonth.startsWith(prefix))?.[1];
    const year = yearIndex < 0 ? new Date().getFullYear() : Number(words[yearIndex].text);
    if (!Number.isInteger(day) || !Number.isInteger(monthNumber) || !Number.isInteger(year)
        || day < 1 || day > 31 || monthNumber < 1 || monthNumber > 12) return { suppressed: true };
    const dateFor = (d, m, y) => {
      const date = new Date(Date.UTC(y, m - 1, d));
      return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? date : null;
    };
    const date = dateFor(day, monthNumber, year);
    if (!date) return { suppressed: true };
    const actualWeekday = date.getUTCDay();
    const weekdayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    if (actualWeekday === weekdayNumber) return { suppressed: true };
    const preserveCase = (replacement, original) => {
      if (isAllUppercase(original)) return replacement.toLocaleUpperCase("es");
      if (isCapitalizedWord({ text: original })) return replacement[0].toLocaleUpperCase("es") + replacement.slice(1);
      return replacement;
    };
    let startIndex, endIndex, message, suggestions;
    const now = context.now instanceof Date ? context.now : new Date(context.now ?? Date.now());
    const currentYear = now.getFullYear();
    const currentYearDate = yearIndex < 0 ? null : dateFor(day, monthNumber, currentYear);
    if (yearIndex >= 0 && currentYearDate?.getUTCDay() === weekdayNumber) {
      startIndex = endIndex = yearIndex;
      message = 'Este fecha no es correcta. ¿Se refería al año "{currentYear}"?'.replace("{currentYear}", String(currentYear));
      suggestions = [String(currentYear)];
    } else {
      startIndex = Math.min(weekdayIndex, dayIndex); endIndex = Math.max(weekdayIndex, dayIndex);
      message = output.message.replace("{realDay}", weekdayNames[actualWeekday])
        .replace("{day}", weekdayNames[weekdayNumber]).replace("{currentYear}", String(currentYear));
      const start = words[startIndex].start, end = words[endIndex].end;
      const original = sourceText.slice(start, end);
      const weekdayStart = words[weekdayIndex].start - start, weekdayEnd = words[weekdayIndex].end - start;
      suggestions = [original.slice(0, weekdayStart) + preserveCase(weekdayNames[actualWeekday], weekdayToken) + original.slice(weekdayEnd)];
      for (let distance = 1; distance < 7; distance++) {
        let correctedDay = "";
        for (const candidate of [day - distance, day + distance]) {
          const candidateDate = dateFor(candidate, monthNumber, year);
          if (candidateDate?.getUTCDay() === weekdayNumber) { correctedDay = String(candidate); break; }
        }
        if (correctedDay) {
          const dayStart = words[dayIndex].start - start, dayEnd = words[dayIndex].end - start;
          suggestions.push(original.slice(0, dayStart) + correctedDay + original.slice(dayEnd));
          break;
        }
      }
    }
    const start = words[startIndex].start, end = words[endIndex].end;
    return { start, end, message, suggestions };
  }

  function applyNewYearDateFilter(rule, output, words, matchedPositions, context = {}) {
    const args = parseFilterArguments(rule.filterArguments);
    const tokenAt = name => {
      const reference = /^\\(\d+)$/u.exec(args[name] || "");
      return reference ? matchedPositions[Number(reference[1]) - 1]?.[0] ?? -1 : -1;
    };
    const yearIndex = tokenAt("year"), monthIndex = tokenAt("month"), dayIndex = tokenAt("day");
    if ([yearIndex, monthIndex, dayIndex].some(index => index < 0)) return { suppressed: true };
    const now = context.now instanceof Date ? context.now : new Date(context.now ?? Date.now());
    const currentYear = now.getFullYear();
    if (now.getMonth() !== 0) return { suppressed: true };
    const yearText = String(words[yearIndex].text), year = Number(yearText);
    const dayMatch = /^(\d+)/u.exec(String(words[dayIndex].text).replace(/\u00ad/gu, ""));
    const day = dayMatch ? Number(dayMatch[1]) : NaN;
    const monthText = String(words[monthIndex].text).replace(/\u00ad/gu, "").toLocaleLowerCase("es").normalize("NFD").replace(/\p{M}/gu, "").replace(/\.$/u, "");
    const month = /^\d+$/u.test(monthText) ? Number(monthText) : [
      ["en", 1], ["fe", 2], ["mar", 3], ["mzo", 3], ["ab", 4], ["may", 5], ["my", 5],
      ["jun", 6], ["jn", 6], ["jul", 7], ["jl", 7], ["ag", 8], ["se", 9], ["sep", 9], ["set", 9],
      ["oc", 10], ["no", 11], ["di", 12]
    ].find(([prefix]) => monthText.startsWith(prefix))?.[1];
    if (!Number.isInteger(year) || !Number.isInteger(day) || !Number.isInteger(month)
        || month === 12 || year + 1 !== currentYear || day < 1 || day > 31) return { suppressed: true };
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return { suppressed: true };
    return { message: output.message.replace("{year}", String(year)).replace("{realYear}", String(currentYear)),
      suggestions: output.suggestions.map(value => value.replaceAll("{realYear}", String(currentYear))) };
  }

  function applyPostponedAdjectiveFilter(rule, words, matchedPositions, markerPositions, context = {}) {
    const reject = () => ({ suppressed: true });
    const args = parseFilterArguments(rule.filterArguments), addComma = args.addComma?.toLowerCase() === "true";
    const adjectiveIndex = markerPositions.length ? words.indexOf(markerPositions[0]) : matchedPositions.flat().at(-1);
    const token = words[adjectiveIndex];
    if (!token) return reject("missing-adjective-token");
    const tags = value => (value?.readings || value?.contextualReadings || []).map(reading => reading.tag || "UNKNOWN");
    const posCache = new Map(), pos = (value, expression) => {
      let regex = posCache.get(expression);
      if (!regex) { try { regex = new RegExp(`^(?:${expression})$`, "u"); } catch { return false; } posCache.set(expression, regex); }
      return tags(value).some(tag => regex.test(tag));
    };
    const surfaceCache = new Map(), surface = (value, expression) => {
      let regex = surfaceCache.get(expression);
      if (!regex) { try { regex = new RegExp(`^(?:${expression})$`, "u"); } catch { return false; } surfaceCache.set(expression, regex); }
      return regex.test(String(value?.text ?? ""));
    };
    const P = {
      NOM: "N.*", NOM_MS: "N.MS.*|PI0MS000", NOM_FS: "N.FS.*|PI0FS000", NOM_MP: "N.MP.*", NOM_MN: "N.MN.*", NOM_FP: "N.FP.*", NOM_CS: "N.CS.*", NOM_CP: "N.CP.*",
      NOM_DET: "N.*|D[NDA0I].*|PI0[MF]S000", GN: "_GN_.*", GN_MS: "_GN_MS", GN_FS: "_GN_FS", GN_MP: "_GN_MP", GN_FP: "_GN_FP", GN_CS: "_GN_[MF]S", GN_CP: "_GN_[MF]P",
      DET: "D[NDA0IP].*", DET_CS: "D[NDA0IP]0CS0", DET_MS: "D[NDA0IP]0MS0", DET_FS: "D[NDA0IP]0FS0", DET_MP: "D[NDA0IP]0MP0", DET_FP: "D[NDA0IP]0FP0",
      GN_MS_ALL: "N.[MC][SN].*|A..[MC][SN].*|V.P..SM.?|PX.MS.*|D[NDA0I]0MS0|PI0MS000", GN_FS_ALL: "N.[FC][SN].*|A..[FC][SN].*|V.P..SF.?|PX.FS.*|D[NDA0I]0FS0|PI0FS000",
      GN_MP_ALL: "N.[MC][PN].*|A..[MC][PN].*|V.P..PM.?|PX.MP.*|D[NDA0I]0MP0", GN_FP_ALL: "N.[FC][PN].*|A..[FC][PN].*|V.P..PF.?|PX.FP.*|D[NDA0I]0FP0",
      GN_CP_ALL: "N.[FMC][PN].*|A..[FMC][PN].*|D[NDA0I]0[FM]P0", GN_CS_ALL: "N.[FMC][SN].*|A..[FMC][SN].*|D[NDA0I]0[FM]S0||PI0[MFC]S000",
      ADJ: "AQ.*|V.P.*|PX.*|.*LOC_ADJ.*", ADJ_MS: "A..[MC][SN].*|V.P..SM.?|PX.MS.*", ADJ_FS: "A..[FC][SN].*|V.P..SF.?|PX.FS.*",
      ADJ_MP: "A..[MC][PN].*|V.P..PM.?|PX.MP.*", ADJ_FP: "A..[FC][PN].*|V.P..PF.?|PX.FP.*", ADJ_CP: "A..C[PN].*", ADJ_CS: "A..C[SN].*",
      ADJ_S: "A...[SN].*|V.P..S..?|PX..S.*", ADJ_P: "A...[PN].*|V.P..P..?|PX..P.*", ADV: "R.|.*LOC_ADV.*", CONJ: "C.|.*LOC_CONJ.*", PUNCT: "_PUNCT",
      LOC_ADV: ".*LOC_ADV.*", ACCEPTED_ADV: "RG_before", KEEP: "A.*|N.*|D[NAIDP].*|SPS.*|SP:DA|.*LOC_ADV.*|V.P.*|_PUNCT.*|.*LOC_ADJ.*|PX.*|PI0.S000|UNKNOWN|V.N.{4}",
      STOP: ";|lo", PREP: "SP.*", VERB: "V.[^P].*|_GV_", GV: "_GV_"
    };
    const nounLevel = ["de", "del", "en", "sobre", "a", "entre", "por", "con", "sin", "contra", "para"].join("|");
    const coordination = "y|e|o|u|ni", countWords = ",|y|e|o|ni|u";
    const counts = () => Object.fromEntries(["nt", "nms", "nfs", "nmp", "nmn", "nfp", "ncs", "ncp", "dms", "dfs", "dmp", "dfp", "n", "d"].map(name => [name, [0, 0, 0, 0]]));
    const C = counts(); let level = 0, j = 1, previousNoun = false;
    let canMS = false, canFS = false, canMP = false, canFP = false, canPlural = false, isPlural = true;
    let adverbAppeared = false, conjunctionAppeared = false, punctuationAppeared = false;
    const resetApparitions = () => { adverbAppeared = false; conjunctionAppeared = false; punctuationAppeared = false; };
    const updateApparitions = value => {
      if (pos(value, P.NOM) || pos(value, P.ADJ)) { resetApparitions(); return; }
      adverbAppeared ||= pos(value, P.ADV); conjunctionAppeared ||= pos(value, P.CONJ);
      punctuationAppeared ||= pos(value, P.PUNCT) || value.text === ",";
    };
    const keepCounting = value => !((adverbAppeared && conjunctionAppeared) || (adverbAppeared && punctuationAppeared)
      || (conjunctionAppeared && punctuationAppeared) || (punctuationAppeared && pos(value, P.PUNCT)))
      && (pos(value, P.KEEP) || surface(value, countWords) || pos(value, P.ACCEPTED_ADV))
      && !surface(value, P.STOP) && (!pos(value, P.GV) || pos(value, P.GN));

    while (adjectiveIndex - j > 0 && keepCounting(words[adjectiveIndex - j]) && level < 4) {
      const current = words[adjectiveIndex - j], next = words[adjectiveIndex - j + 1], before = words[adjectiveIndex - j - 1];
      if (!previousNoun) {
        if (pos(current, P.NOM) || (adjectiveIndex - j - 1 > 0 && !pos(current, P.NOM) && pos(current, P.ADJ) && pos(before, P.DET))) {
          if (pos(current, P.GN_MS)) { C.nms[level]++; canMS = true; }
          if (pos(current, P.GN_FS)) { C.nfs[level]++; canFS = true; }
          if (pos(current, P.GN_MP)) { C.nmp[level]++; canMP = true; }
          if (pos(current, P.GN_FP)) { C.nfp[level]++; canFP = true; }
        }
        if (!pos(current, P.GN)) {
          if (pos(current, P.NOM_MS)) { C.nms[level]++; canMS = true; }
          else if (pos(current, P.NOM_FS)) { C.nfs[level]++; canFS = true; }
          else if (pos(current, P.NOM_MP)) { C.nmp[level]++; canMP = true; }
          else if (pos(current, P.NOM_MN)) { C.nmn[level]++; canMS = true; canMP = true; }
          else if (pos(current, P.NOM_FP)) { C.nfp[level]++; canFP = true; }
          else if (pos(current, P.NOM_CS)) { C.ncs[level]++; canMS = true; canFS = true; }
          else if (pos(current, P.NOM_CP)) { C.ncp[level]++; canFP = true; canMP = true; }
        }
      }
      if (pos(current, P.NOM)) { C.nt[level]++; previousNoun = true; } else previousNoun = false;
      if (pos(current, P.DET_CS)) {
        if (pos(next, P.NOM_MS)) { C.dms[level]++; canMS = true; }
        if (pos(next, P.NOM_FS)) { C.dfs[level]++; canFS = true; }
      }
      if (!pos(current, P.ADV)) {
        if (pos(current, P.DET_MS)) { C.dms[level]++; canMS = true; }
        if (pos(current, P.DET_FS)) { C.dfs[level]++; canFS = true; }
        if (pos(current, P.DET_MP)) { C.dmp[level]++; canMP = true; }
        if (pos(current, P.DET_FP)) { C.dfp[level]++; canFP = true; }
      }
      if (adjectiveIndex - j > 0 && surface(current, nounLevel) && !surface(before, coordination) && !pos(next, P.ADV)) level++;
      if (level > 0 && surface(current, coordination)) {
        let k = 1;
        while (k < 4 && adjectiveIndex - j - k > 0) {
          const preceding = words[adjectiveIndex - j - k];
          if (!(pos(preceding, P.KEEP) || surface(preceding, countWords) || pos(preceding, P.ACCEPTED_ADV)) || surface(preceding, P.STOP)) break;
          if (pos(preceding, P.PREP)) { j += k; break; }
          k++;
        }
      }
      updateApparitions(words[adjectiveIndex - j]); j++;
    }
    level = Math.min(4, level + 1);
    let nounTotal = 0, determinerTotal = 0;
    for (let group = 0; group < level; group++) {
      C.n[group] = C.nms[group] + C.nfs[group] + C.nmp[group] + C.nfp[group] + C.ncs[group] + C.ncp[group] + C.nmn[group];
      C.d[group] = C.dms[group] + C.dfs[group] + C.dmp[group] + C.dfp[group];
      nounTotal += C.n[group]; determinerTotal += C.d[group];
      if (pos(token, P.ADJ_MP) && (C.n[group] > 1 || C.d[group] > 1)
          && (C.nms[group] + C.nmn[group] + C.nmp[group] + C.ncs[group] + C.ncp[group] + C.dms[group] + C.dmp[group]) > 0
          && C.nfs[group] + C.nfp[group] <= C.nt[group]) return reject("plural-masculine-exception");
      if (pos(token, P.ADJ_FP) && (C.n[group] > 1 || C.d[group] > 1)
          && ((C.nms[group] + C.nmp[group] + C.nmn[group] + C.dms[group] + C.dmp[group]) === 0
            || (C.nt[group] > 0 && C.nfs[group] + C.nfp[group] >= C.nt[group]))) return reject("plural-feminine-exception");
      if (C.n[group] + C.d[group] > 0) { isPlural &&= C.d[group] > 1; canPlural ||= C.n[group] > 1; }
    }
    isPlural ||= adjectiveIndex - 2 > 0 && C.nmp[0] + C.nfp[0] + C.ncp[0] > 0 && words[adjectiveIndex - 2]?.text === ",";
    if (nounTotal === 0 && determinerTotal === 0) return reject("no-preceding-noun-or-determiner");
    let targetPos, adjectivePos, groupPos;
    if (pos(token, P.ADJ_CS)) [targetPos, adjectivePos, groupPos] = [P.GN_CS_ALL, P.ADJ_S, P.GN_CS];
    else if (pos(token, P.ADJ_CP)) [targetPos, adjectivePos, groupPos] = [P.GN_CP_ALL, P.ADJ_P, P.GN_CP];
    else if (pos(token, P.ADJ_MS)) [targetPos, adjectivePos, groupPos] = [P.GN_MS_ALL, P.ADJ_MS, P.GN_MS];
    else if (pos(token, P.ADJ_FS)) [targetPos, adjectivePos, groupPos] = [P.GN_FS_ALL, P.ADJ_FS, P.GN_FS];
    else if (pos(token, P.ADJ_MP)) [targetPos, adjectivePos, groupPos] = [P.GN_MP_ALL, P.ADJ_MP, P.GN_MP];
    else if (pos(token, P.ADJ_FP)) [targetPos, adjectivePos, groupPos] = [P.GN_FP_ALL, P.ADJ_FP, P.GN_FP];
    if (!targetPos) return reject("unknown-adjective-gender-number");
    j = 1; let continueSearch = true;
    while (adjectiveIndex - j > 0 && continueSearch) {
      const previous = words[adjectiveIndex - j];
      if ((pos(previous, P.NOM_DET) && pos(previous, groupPos)) || (!pos(previous, P.GN) && pos(previous, targetPos))) return reject("previous-agreeing-nominal");
      continueSearch = !pos(previous, P.NOM_DET); j++;
    }
    const prev = words[adjectiveIndex - 1], prev2 = words[adjectiveIndex - 2], prev3 = words[adjectiveIndex - 3];
    const necessary = (pos(prev, P.NOM) && !pos(prev, targetPos)) || (pos(prev, P.ADJ) && !pos(prev, groupPos))
      || (pos(prev, P.ADJ) && !pos(prev, adjectivePos))
      || (adjectiveIndex > 2 && pos(prev, P.ACCEPTED_ADV) && !pos(prev2, P.VERB) && !pos(prev2, P.PREP))
      || (adjectiveIndex > 3 && pos(prev, P.LOC_ADV) && pos(prev2, P.LOC_ADV) && !pos(prev3, P.VERB) && !pos(prev3, P.PREP));
    if (!necessary) return reject("adjacency-not-checkable");
    if (!(isPlural && pos(token, P.ADJ_S))) {
      j = 1; resetApparitions();
      while (adjectiveIndex - j > 0 && keepCounting(words[adjectiveIndex - j]) && (level > 1 || j < 4)) {
        const previous = words[adjectiveIndex - j];
        if ((!pos(previous, P.GN) && pos(previous, P.NOM_DET) && pos(previous, targetPos)) || pos(previous, groupPos)) return reject("previous-agreeing-adjective");
        updateApparitions(previous); j++;
      }
    }
    const synthesizer = context.synthesizer;
    if (!synthesizer) return reject("missing-synthesizer");
    const getReading = pattern => (token.readings || token.contextualReadings || []).find(reading => {
      try { return new RegExp(`^(?:${pattern})$`, "u").test(reading.tag || "UNKNOWN"); } catch { return false; }
    });
    const synthesize = (sourcePattern, targetPattern = sourcePattern) => {
      const reading = getReading(sourcePattern);
      return reading ? synthesizer.synthesize(reading, targetPattern, true) || [] : [];
    };
    let suggestions = [];
    if (pos(token, P.ADJ_CS)) suggestions = synthesize(P.ADJ_CS, "A..CP.");
    if (!suggestions.length && pos(token, P.ADJ_CP)) suggestions = synthesize(P.ADJ_CP, "A..CS.");
    if (!suggestions.length && isPlural) suggestions = synthesize(P.ADJ_P, "A...P.|V.P..P.|PX..P.*");
    if (!suggestions.length) {
      const reading = getReading(P.ADJ);
      if (reading) {
        if (canMS && !isPlural) suggestions.push(...(synthesizer.synthesize(reading, "A..MS.|V.P..SM|PX.MS.*", true) || []));
        if (canFS && !isPlural) suggestions.push(...(synthesizer.synthesize(reading, "A..FS.|V.P..SF|PX.FS.*", true) || []));
        if (canMP) suggestions.push(...(synthesizer.synthesize(reading, "A..MP.|V.P..PM|PX.MP.*", true) || []));
        if (canFP) suggestions.push(...(synthesizer.synthesize(reading, "A..FP.|V.P..PF|PX.FP.*", true) || []));
        if (canMS && (isPlural || canPlural)) suggestions.push(...(synthesizer.synthesize(reading, "A..MP.|V.P..PM|PX.MP.*", true) || []));
        if (canFS && !canMS && (isPlural || canPlural)) suggestions.push(...(synthesizer.synthesize(reading, "A..FP.|V.P..PF|PX.FP.*", true) || []));
      }
    }
    suggestions = [...new Set(suggestions)].filter(value => value !== token.text.toLocaleLowerCase("es"));
    if (!suggestions.length) return reject("no-synthesized-suggestions");
    if (addComma) return { start: Math.max(0, token.start - 1), suggestions: [`, ${token.text}`, ...suggestions.map(value => ` ${value}`)] };
    return { suggestions };
  }

  function trimMatchEnds(start, end, suggestions, text) {
    if (!suggestions.length) return { start, end, suggestions };
    let error = text.slice(start, end);
    let current = suggestions.slice();
    let changed = true;
    while (changed) {
      changed = false;
      const lastSpace = error.lastIndexOf(" ");
      if (lastSpace > 0) {
        const suffix = ` ${error.slice(lastSpace + 1)}`;
        if (current.every(value => value.endsWith(suffix))) {
          current = current.map(value => value.slice(0, -suffix.length));
          end -= error.length - lastSpace;
          error = error.slice(0, lastSpace);
          changed = true;
        }
      }
      const firstSpace = error.indexOf(" ");
      if (firstSpace > 0) {
        const prefix = `${error.slice(0, firstSpace)} `;
        if (current.every(value => value.startsWith(prefix))) {
          current = current.map(value => value.slice(prefix.length));
          const trimLength = firstSpace + 1;
          start += trimLength;
          error = error.slice(trimLength);
          changed = true;
        }
      }
    }
    return { start, end, suggestions: current };
  }

  function findMatches(tokens, sourceText = "", { arbitrate = true, ruleIds = null, includeAllFamilies = false, includeRepeatedRules = false, checkLevel = "DEFAULT", filterContext = null } = {}) {
    if (!rules.length) throw new Error("Cal carregar primer els recursos PatternRule.");
    activeLocaleProfile = "es-ES";
    const startOffset = tokens[0]?.start ?? tokens.find(token => token.kind !== "space")?.start ?? 0;
    const sentenceStart = {
      text: "",
      kind: "sentence-start",
      start: startOffset,
      end: startOffset,
      readings: [{ token: "", lemma: null, tag: "SENT_START" }],
      contextualReadings: [{ token: "", lemma: null, tag: "SENT_START" }],
      lexicalReadings: [{ token: "", lemma: null, tag: "SENT_START" }],
      preDisambiguationReadings: [{ token: "", lemma: null, tag: "SENT_START" }],
      chunkTags: [],
      whitespaceBefore: false
    };
    // PatternRuleMatcher receives the artificial SENT_START analysis even for
    // rules whose first element is an unconstrained <token/> wildcard.
    const words = [sentenceStart, ...tokens.filter(token => token.kind !== "space")];
    const found = [];
    for (let startIndex = 0; startIndex < words.length; startIndex++) {
      const firstSurface = String(words[startIndex].text);
      const possibleRules = firstCandidates(words[startIndex]);
      for (const rule of possibleRules) {
        if (ruleIds && !ruleIds.has(rule.id)) continue;
        if (rule.minPrevMatches > 0 && !includeRepeatedRules) continue;
        // LanguageTool excludes picky rules at DEFAULT. At PICKY they enter
        // the same candidate/arbitration pipeline; their priority adjustment
        // keeps them below ordinary rules when matches overlap.
        if (rule.picky && checkLevel !== "PICKY") continue;
        if (rule.sentStart && startIndex !== 0) continue;
        const pattern = rule.pattern;
        const minimumSpan = pattern.reduce((sum, token) => sum + (token.minOccurrence ?? 1), 0);
        if (startIndex + minimumSpan > words.length) continue;
        // PatternRuleMatcher scans the skip window established by the previous
        // pattern token. Repeated elements consume the longest run that still
        // allows the rest of the pattern to match.
        const matchedPositions = matchSequenceAt(pattern, words, startIndex, rule.interpretPosTagsPreDisambiguation);
        if (!matchedPositions) continue;
        const consumed = matchedPositions.flat();
        if (!consumed.length) continue;
        const first = words[consumed[0]];
        const last = words[consumed[consumed.length - 1]];
        const fullMatchText = sourceText.slice(first.start, last.end);
        const markerPositions = pattern.flatMap((token, index) => token.insideMarker
          ? (matchedPositions[index] || []).map(position => words[position]) : []);
        let matchStart = (markerPositions[0] || first).start;
        let matchEnd = (markerPositions.at(-1) || last).end;
        // PatternRuleMatcher.createRuleMatch drops zero-width spans. A local
        // candidate at a sentence boundary must follow the same contract.
        if (matchStart >= matchEnd) continue;
        // PatternRuleMatcher.createRuleMatch anchors comma-inserting
        // suggestions immediately after the preceding non-whitespace token.
        const firstMarkerPosition = markerPositions.length
          ? matchedPositions.flatMap((positions, index) => pattern[index].insideMarker ? positions : [])[0]
          : consumed[0];
        if (firstMarkerPosition >= 1 && (rule.message.includes('<suggestion>,')
            || rule.suggestionsOutMsg?.includes('<suggestion>,'))) {
          matchStart = words[firstMarkerPosition - 1].end;
        }
        // LanguageTool matches a PatternRule against pre-disambiguation POS
        // only when raw_pos is set, but its DisambiguationPatternRule-based
        // anti-pattern pass runs on the normally analyzed sentence. Reusing
        // raw_pos here hides contextual tags such as _possible_nompropi and
        // can let proper-name examples through.
        if (isSuppressedByAntiPattern(rule.antiPatterns, words, consumed)) continue;
        const matchedText = sourceText.slice(matchStart, matchEnd);
        // Match PatternRuleMatcher.createRuleMatch: startPositionCorrection
        // points at the token used as the case sample; it does not move the
        // marked issue range. endPositionCorrection is not used by the grammar
        // PatternRuleMatcher (it belongs to contextual disambiguation).
        let caseIndex = matchedPositions[rule.startPositionCorrection]?.[0] ?? consumed.at(-1);
        if (words[caseIndex]?.kind === "sentence-start" && caseIndex + 1 < words.length) caseIndex++;
        const caseToken = words[caseIndex];
        const startsWithUppercase = Boolean(rule.adjustSuggestionCase && caseToken
          && /^\p{Lu}/u.test(caseToken.text));
        const caseSpan = consumed.filter(position => position >= caseIndex).map(position => words[position]);
        const allUppercase = caseSpan.length > 0 && caseSpan.every(word => isAllUppercase(word.text))
          && caseSpan.some(word => /[\p{Lu}\p{Ll}\p{Lt}]/u.test(word.text));
        let output = formatOutput(rule, fullMatchText, startsWithUppercase, allUppercase, matchedPositions, words);
        if (rule.filterClass === FILTER_FIND_SUGGESTIONS) {
          const filtered = applyFindSuggestionsFilter(rule, matchedText, words, matchedPositions, markerPositions, output, filterContext || {});
          output = { ...output, ...filtered };
        } else if (rule.filterClass === FILTER_ADD_COMMAS) {
          const filtered = applyAddCommasFilter(rule, matchedText, matchStart, matchEnd, words);
          if (filtered.suppressed) continue;
          matchStart = filtered.start;
          output = { ...output, suggestions: filtered.suggestions };
        } else if (rule.filterClass === FILTER_MULTITOKEN_SPELLER) {
          const filtered = applyMultitokenSpellerFilter(matchedText, words, matchedPositions, filterContext || {});
          output = { ...output, ...filtered };
        } else if (rule.filterClass === FILTER_ADVANCED_SYNTHESIZER) {
          const filtered = applyAdvancedSynthesizerFilter(rule, output, words, matchedPositions, markerPositions, filterContext || {});
          output = { ...output, ...filtered };
        } else if (rule.filterClass === FILTER_DATE_CHECK) {
          const filtered = applyDateCheckFilter(rule, output, words, matchedPositions, sourceText, filterContext || {});
          if (filtered.suppressed) continue;
          matchStart = filtered.start;
          matchEnd = filtered.end;
          output = { ...output, ...filtered };
        } else if (rule.filterClass === FILTER_ADAPT_SUGGESTIONS) {
          output = { ...output, suggestions: output.suggestions.map(adaptSpanishSuggestion) };
        } else if (rule.filterClass === FILTER_NEW_YEAR_DATE) {
          const filtered = applyNewYearDateFilter(rule, output, words, matchedPositions, filterContext || {});
          if (filtered.suppressed) continue;
          output = { ...output, ...filtered };
        } else if (rule.filterClass === FILTER_POSTPONED_ADJECTIVE) {
          const filtered = applyPostponedAdjectiveFilter(rule, words, matchedPositions, markerPositions, filterContext || {});
          if (filtered.suppressed) continue;
          if (Number.isInteger(filtered.start)) matchStart = filtered.start;
          output = { ...output, ...filtered };
        } else if (rule.filterClass === FILTER_SUPPRESS_MISSPELLED) {
          const filtered = applySpanishSuppressMisspelledFilter(rule, output, filterContext || {});
          if (filtered.suppressed) continue;
          output = { ...output, ...filtered };
        } else if (rule.filterClass === FILTER_NUMBER_IN_WORD) {
          // SpanishNumberInWordFilter receives its source word through the
          // configured `word:\N` argument. That reference is independent of
          // the PatternRule marker span; many rules of this filter class do
          // not declare an explicit <marker>.
          const filtered = applySpanishNumberInWordFilter(rule, output, matchedPositions, words, filterContext || {});
          if (filtered.suppressed) continue;
          output = { ...output, ...filtered };
        } else if (rule.filterClass === FILTER_CONFUSION_CHECK) {
          const filtered = applySpanishConfusionCheckFilter(rule, output, matchedPositions, { ...(filterContext || {}), words });
          if (filtered.suppressed) continue;
          output = { ...output, ...filtered };
        } else if (rule.filterClass === FILTER_APOSTROPHE_TYPE) {
          const filtered = applyApostropheTypeFilter(rule, matchedPositions, markerPositions, words);
          if (filtered.suppressed) continue;
          output = { ...output, ...filtered };
        }
        if (output.suppressed) continue;
        const finalSuggestions = adaptSpanishSuggestions(output.suggestions);
        let issue = {
          id: `${rule.fullId}:${matchStart}:${matchEnd}`,
          ruleId: rule.id,
          category: rule.categoryId || "grammar",
          severity: rule.matchType || "warning",
          message: output.message,
          text: matchedText,
          start: matchStart,
          end: matchEnd,
          replacementStart: matchStart,
          replacementEnd: matchEnd,
          suggestions: finalSuggestions,
          shortMessage: rule.shortMessage || "",
          rule: rule.fullId,
          // Dynamic numbered references can be emitted by the local formatter
          // when their referenced Match operations are in the supported subset.
          _outputPortable: rule.outputPortable !== false || canFormatReferences(rule),
          _ruleId: rule.id,
          _from: matchStart,
          _to: matchEnd,
          _priority: rule.languagePriority,
          _picky: Boolean(rule.picky),
          _includedAllAtOnce: Boolean(rule.includedInErrorsCorrectedAllAtOnce),
          _registrationOrder: rule.registrationOrder,
          _suggestionFilterClass: rule.filterClass || "",
          _family: "pattern"
        };
        found.push({...issue, _from: issue.start, _to: issue.end, text: sourceText.slice(issue.start,issue.end)});
      }
    }
    if (!arbitrate) return found;
    return arbitrateMatches(found, sourceText, { checkLevel, includeAllFamilies });
  }

  function findRepeatedPatternMatches(sentences, sourceText, { checkLevel = "DEFAULT" } = {}) {
    if (!repeatedRules.length) return [];
    const ids = new Set(repeatedRules.map(rule => rule.id));
    const stateById = new Map();
    const output = [];
    let tokenOffset = 0;
    for (const sentence of sentences) {
      const candidates = findMatches(sentence.tokens, sourceText, {
        arbitrate: false, ruleIds: ids, includeRepeatedRules: true, checkLevel
      }).sort((left, right) => left._from - right._from || left._registrationOrder - right._registrationOrder);
      const sentenceMatches = [];
      for (let index = 0; index < candidates.length; index++) {
        const current = candidates[index];
        while (index < candidates.length - 1 && current._ruleId === candidates[index + 1]._ruleId
            && current._from <= candidates[index + 1]._to && current._to >= candidates[index + 1]._from) index++;
        sentenceMatches.push(current);
      }
      const visibleTokens = sentence.tokens.filter(token => token.kind !== "space");
      for (const match of sentenceMatches) {
        const rule = repeatedRuleMetadata.get(match.rule);
        if (!rule) continue;
        let fromToken = 0;
        while (fromToken < visibleTokens.length && visibleTokens[fromToken].start < match._from) fromToken++;
        fromToken += tokenOffset;
        let state = stateById.get(rule.id);
        if (!state) {
          state = { previousToken: 0, previousMatches: 0, distances: [] };
          stateById.set(rule.id, state);
        }
        state.distances.push(fromToken - state.previousToken);
        const maxDistance = rule.distanceTokens > 0 ? rule.distanceTokens : 60 * rule.minPrevMatches;
        const recentDistance = state.distances.slice(-rule.minPrevMatches).reduce((sum, distance) => sum + distance, 0);
        if (state.previousMatches >= rule.minPrevMatches && recentDistance < maxDistance) {
          output.push({ ...match, _family: "repeated-pattern" });
        }
        state.previousToken = fromToken;
        state.previousMatches++;
      }
      tokenOffset += visibleTokens.length;
    }
    return output;
  }

  // Shared LanguageTool-style post-filter for the pattern/simple/table groups
  // and spelling candidates. Keeping this as one operation lets the public
  // pipeline arbitrate families together instead of making grammar win by
  // construction whenever spans overlap.
  function arbitrateMatches(matches, sourceText = "", { checkLevel = "DEFAULT", includeAllFamilies = true } = {}) {
    const found = matches.slice();
    // A malformed numeral with whitespace next to a hyphen can also match a
    // normalized CA_COMPOUNDS entry (e.g. `vint -i-u`). LanguageTool's
    // numeric PatternRule handles these forms; the generic compound rule does
    // not emit a match. Keep the numeric correction when both candidates
    // cover the same range and produce the same replacement.
    const numericHyphenCorrections = found.filter(match => match._family === "pattern" && match.category === "NUMERALS"
      && /\s-|-\s/u.test(sourceText.slice(match._from, match._to)));
    const selected = found.filter(match => !(match._family === "table" && match.rule === "CA_COMPOUNDS"
      && numericHyphenCorrections.some(numeric => numeric._from === match._from && numeric._to === match._to
        && numeric.suggestions.some(suggestion => match.suggestions.includes(suggestion)))));
    found.length = 0;
    found.push(...selected);
    found.sort((left, right) => left._from - right._from || left._registrationOrder - right._registrationOrder);

    // Match LanguageTool's SameRuleGroupFilter: candidates are ordered by
    // start and registration order, then only adjacent overlapping matches
    // with the same base ID collapse.
    const sameGroupFiltered = [];
    for (let index = 0; index < found.length; index++) {
      const match = found[index];
      while (index < found.length - 1 && match._ruleId === found[index + 1]._ruleId
          && match._from <= found[index + 1]._to && match._to >= found[index + 1]._from) index++;
      sameGroupFiltered.push(match);
    }

    const priority = match => {
      if (match._picky && match._priority !== -2147483648) return -2147483648 + 10000 + match._priority;
      return match._priority;
    };
    const isPunctuationOnlyChange = match => {
      const suggestion = match.suggestions[0];
      return Boolean(suggestion && suggestion !== match.text
        && [...match.text].filter(char => /[\p{L}\p{N}]/u.test(char)).join("")
          === [...suggestion].filter(char => /[\p{L}\p{N}]/u.test(char)).join(""));
    };
    const duplicateSuggestion = (current, previous) => {
      const suggestion = current.suggestions[0] || "";
      const previousSuggestion = previous.suggestions[0] || "";
      if (!suggestion || !previousSuggestion) return false;
      if (current._from === previous._to && previousSuggestion.endsWith(",") && suggestion.startsWith(", ")) return true;
      if (suggestion.indexOf(" ") > 0 && previousSuggestion.indexOf(" ") > 0 && current._from === previous._to + 1) {
        const parts = suggestion.split(" ");
        const previousParts = previousSuggestion.split(" ");
        return previousParts.length > 1 && parts.length > 1 && previousParts[1] === parts[0];
      }
      return false;
    };
    // CleanOverlappingFilter: compare adjacent issues by upstream priority, length, then registration order.
    const kept = [];
    let previous = null;
    for (const current of sameGroupFiltered) {
      if (previous == null) {
        previous = current;
      } else if (current._from >= previous._to && !duplicateSuggestion(current, previous)) {
        kept.push(previous);
        previous = current;
      } else {
        let currentPriority = priority(current);
        let previousPriority = priority(previous);
        if (isPunctuationOnlyChange(current) && isPunctuationOnlyChange(previous)
            && current._includedAllAtOnce !== previous._includedAllAtOnce) {
          if (current._includedAllAtOnce && currentPriority < previousPriority) currentPriority = previousPriority + 1;
          else if (previous._includedAllAtOnce && previousPriority < currentPriority) previousPriority = currentPriority + 1;
        }
        if (currentPriority === previousPriority) {
          // When an exact-span tie pits an explicit PatternRule correction
          // against a broad dictionary-backed suggestion filter, keep the
          // explicit correction. This prevents a heuristic lookup from
          // replacing a precise lexical fix (for example D'Hondt).
          if (current._from === previous._from && current._to === previous._to
              && current.category === "MISSPELLING"
              && current._suggestionFilterClass === FILTER_FIND_SUGGESTIONS
              && previous.category !== "MISSPELLING"
              && previous._suggestionFilterClass !== FILTER_FIND_SUGGESTIONS) currentPriority--;
          else if (current._from === previous._from && current._to === previous._to
              && previous.category === "MISSPELLING"
              && previous._suggestionFilterClass === FILTER_FIND_SUGGESTIONS
              && current.category !== "MISSPELLING"
              && current._suggestionFilterClass !== FILTER_FIND_SUGGESTIONS) previousPriority--;
        }
        if (currentPriority === previousPriority) {
          currentPriority = current._to - current._from;
          previousPriority = previous._to - previous._from;
        }
        if (currentPriority === previousPriority) currentPriority++;
        if (currentPriority > previousPriority) previous = current;
      }
    }
    if (previous != null) kept.push(previous);
    const output = includeAllFamilies
      ? kept.filter(match => match._family !== "pattern" || match._outputPortable)
      : kept.filter(match => match._family === "pattern" && match._outputPortable);
    return output
      .map(({ _ruleId, _from, _to, _priority, _picky, _includedAllAtOnce, _registrationOrder, _suggestionFilterClass, _family, _outputPortable, ...issue }) => {
      const range = { start: issue.start, end: issue.end, suggestions: issue.suggestions };
      // Preserve the PatternRule marker span exactly; trimming common text from
      // both sides changes the range that LanguageTool exposes to the editor.
      if (range.suggestions.length === 1 && range.suggestions[0] === ""
          && (range.start === 0 || sourceText[range.start - 1] === " ")
          && sourceText[range.end] === " ") {
        range.end++;
      }
      return {
        ...issue,
        ...(includeAllFamilies ? { sourceFamily: _family } : {}),
        id: `${issue.rule}:${range.start}:${range.end}`,
        text: sourceText.slice(range.start, range.end),
        start: range.start,
        end: range.end,
        replacementStart: range.start,
        replacementEnd: range.end,
        suggestions: range.suggestions
      };
    });
  }

  globalThis.CorrectorSpanishPatternRuleMatcher = Object.freeze({ load, findMatches, findRepeatedPatternMatches, arbitrateMatches,
    configureLexicalLookup: lookup => { lexicalLookup = lookup; }, configureSynthesizer: instance => { synthesizer = instance; },
    configureMultitokenSpeller,
    getRuleCount: () => rules.length,
    getDiagnostics: () => ({ sourceRules: sourceRuleCount, loadedRules: rules.length, heldOutFilters: heldOutFilterCount, heldOutNumberSynthesis: heldOutNumberCount }) });
})();

