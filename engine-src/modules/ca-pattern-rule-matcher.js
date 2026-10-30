/* Conservative literal-only runtime for the audited LanguageTool PatternRule subset. */
(() => {
  "use strict";

  const RESOURCE_PATH = "build/resources/ca-pattern-rule-candidates.json";
  const EXPECTED_GRAMMAR_HASH = "53304f4142bb5ee2b870ce391f84b7e4eb2abc29ddb0a275fa4f57dc6f799b09";
  let rules = [];
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
  let activeLocaleProfile = "inclusive";
  let dialectProfileOverrides = {};
  const baseRegistrationOrder = new WeakMap();
  let configuredRuleProfile = "";

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
        || rule.withComplexPhrase || rule.filterClass && !globalThis.CorrectorCatalanRuleFilters.supports(rule)
        || /<match\b/u.test(rule.message || "") || /<match\b/u.test(rule.shortMessage || "")
        || /<match\b/u.test(rule.suggestionsOutMsg || "")) {
      throw new Error(`Unsupported LanguageTool literal rule: ${rule?.fullId || "unknown"}`);
    }
    for (const token of rule.pattern) {
      const minOccurrence = token.minOccurrence ?? 1;
      const maxOccurrence = token.maxOccurrence ?? 1;
      if (typeof token.text !== "string" || !Number.isInteger(minOccurrence) || !Number.isInteger(maxOccurrence)
          || minOccurrence < 0 || (maxOccurrence !== -1 && maxOccurrence < minOccurrence)
          || !Number.isInteger(token.skipNext) || token.skipNext < -1 || token.phraseName != null
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
        if (!resourceUrl) throw new Error("Cal indicar la URL del recurs PatternRule fora de l'extensió.");
        const response = await fetcher(resourceUrl);
        if (!response.ok) throw new Error(`No s'ha pogut carregar el recurs PatternRule (${response.status}).`);
        const resource = await response.json();
        if (resource?.schemaVersion !== 1 || resource.language !== "ca-ES"
            || resource.grammarXmlSha256 !== EXPECTED_GRAMMAR_HASH
            || !Number.isInteger(resource.activeRuleCount) || resource.activeRuleCount > resource.rules?.length
            || (resource.runtimeRuleCount != null && resource.runtimeRuleCount !== resource.rules?.length)
            || !Array.isArray(resource.rules)) {
          throw new Error("Recurs PatternRule incompatible o no verificat.");
        }
        for (const rule of resource.rules) assertLiteralRule(rule);
        const dialectResponse = await fetcher(globalThis.chrome?.runtime?.getURL("build/resources/ca-dialect-pattern-rules.json"));
        if (!dialectResponse.ok) throw new Error("No s'han pogut carregar les regles dialectals catalanes.");
        const dialectResource = await dialectResponse.json();
        if (dialectResource?.schemaVersion !== 1 || dialectResource.language !== "ca"
            || dialectResource.grammarXmlSha256 !== "6a765748ad295530980a2132e078aaa37dd879432b1420e1907c4673cc36fe7b"
            || dialectResource.sharedGrammarXmlSha256 !== resource.grammarXmlSha256
            || !Array.isArray(dialectResource.rules)
            || dialectResource.rules.some(rule => !["AMANEIXER", "COLOREJAR", "LLARGARIA"].includes(rule.id))) {
          throw new Error("Recurs de regles dialectals incompatible o no verificat.");
        }
        for (const rule of dialectResource.rules) assertLiteralRule(rule);
        const profilesResponse = await fetcher(globalThis.chrome?.runtime?.getURL("build/resources/ca-dialect-profile-overrides.json"));
        if (!profilesResponse.ok) throw new Error("No s'han pogut carregar els perfils dialectals.");
        const profilesResource = await profilesResponse.json();
        if (profilesResource?.schemaVersion !== 1
            || profilesResource.baseInventorySha256 !== "e544d5b2d7f7b10d79396ef0ba090c7f0af88e18126715ece4bdf40de9a87faa"
            || !profilesResource.profiles?.valencian || !profilesResource.profiles?.balearic) {
          throw new Error("Recurs de perfils dialectals incompatible o no verificat.");
        }
        for (const [profile, expected] of Object.entries({ valencian: [64, 29], balearic: [33, 12] })) {
          const data = profilesResource.profiles[profile];
          if (data.disabled?.length !== expected[0] || data.additions?.length !== expected[1]
              || data.sharedGrammarXmlSha256 !== resource.grammarXmlSha256
              || !data.registrationOrder || typeof data.registrationOrder !== "object") {
            throw new Error(`Delta de regles dialectals invàlid per al perfil ${profile}.`);
          }
          for (const rule of data.additions) assertLiteralRule(rule);
        }
        dialectProfileOverrides = Object.fromEntries(Object.entries(profilesResource.profiles).map(([profile, data]) => [profile, {
          ...data,
          disabled: new Set(data.disabled)
        }]));
        rules = [...resource.rules, ...dialectResource.rules];
        for (const [profile, data] of Object.entries(dialectProfileOverrides)) {
          for (const sourceRule of data.additions) rules.push({ ...sourceRule, _dialectProfile: profile });
        }
        for (const rule of rules) baseRegistrationOrder.set(rule, rule.registrationOrder);
        unificationDefinitions = Object.fromEntries(Object.entries(resource.unificationDefinitions || {}).map(([feature, types]) => [feature,
          Object.fromEntries(Object.entries(types).map(([type, expression]) => [type, compilePosRegex(expression)]))]));
        caseInsensitiveByFirst = new Map();
        caseSensitiveByFirst = new Map();
        lemmaInsensitiveByFirst = new Map();
        lemmaSensitiveByFirst = new Map();
        exactPosFirst = new Map();
        posRegexFirst = new Map();
        unconstrainedFirst = [];
        surfaceRegexFirst = [];
        surfaceRegexInsensitive = [];
        surfaceRegexByPrefix = new Map();
        posRegexCache = new Map();
        for (const rule of rules) {
          const first = rule.pattern[0];
          if (first.minOccurrence === 0 || first.negated || first.posNegated) {
            unconstrainedFirst.push(rule);
          } else if (first.regexp) {
            const entry = { regex: compileSurfaceRegex(first.text, first.caseSensitive), inflected: first.inflected, rules: [rule], caseSensitive: first.caseSensitive };
            const prefix = safeRegexPrefix(first);
            if (prefix == null) surfaceRegexFirst.push(entry);
            else if (first.caseSensitive) {
              const key = `s:${prefix}`;
              if (!surfaceRegexByPrefix.has(key)) surfaceRegexByPrefix.set(key, []);
              surfaceRegexByPrefix.get(key).push(entry);
            } else {
              const key = `i:${prefix.toUpperCase()}`;
              if (!surfaceRegexByPrefix.has(key)) surfaceRegexByPrefix.set(key, []);
              surfaceRegexByPrefix.get(key).push(entry);
              surfaceRegexInsensitive.push(entry);
            }
          } else if (first.text && first.inflected) {
            const index = first.caseSensitive ? lemmaSensitiveByFirst : lemmaInsensitiveByFirst;
            const key = first.caseSensitive ? first.text : first.text.toLocaleLowerCase("ca");
            addToIndex(index, key, rule);
            // PatternToken.getTestToken() falls back to the surface form when
            // an analyzed reading has no lemma. Index inflected literals by
            // surface too, or unknown base forms can never reach the matcher.
            const surfaceIndex = first.caseSensitive ? caseSensitiveByFirst : caseInsensitiveByFirst;
            addToIndex(surfaceIndex, key, rule);
          } else if (first.text) {
            const index = first.caseSensitive ? caseSensitiveByFirst : caseInsensitiveByFirst;
            const key = first.caseSensitive ? first.text : first.text.toLocaleLowerCase("ca");
            addToIndex(index, key, rule);
          } else if (first.posRegexp) {
            const key = first.pos;
            if (!posRegexFirst.has(key)) posRegexFirst.set(key, { regex: compilePosRegex(key), rules: [] });
            posRegexFirst.get(key).rules.push(rule);
          } else if (first.pos == null) {
            // An unconstrained <token/> matches any analyzed token in LT.
            // Keep this small fallback list separate from indexed literals/POS.
            unconstrainedFirst.push(rule);
          } else {
            addToIndex(exactPosFirst, first.pos, rule);
          }
        }
        configuredRuleProfile = "central";
        return {
          loadedRules: rules.length,
          dialectRules: dialectResource.rules.length,
          dialectProfiles: Object.fromEntries(Object.entries(dialectProfileOverrides).map(([profile, data]) => [profile, { enabled: data.additions.length, disabled: data.disabled.size }])),
          grammarXmlSha256: resource.grammarXmlSha256,
          dialectGrammarXmlSha256: dialectResource.grammarXmlSha256,
          posRegexes: posRegexFirst.size,
          surfaceRegexes: surfaceRegexFirst.length
        };
      })().catch(error => { loadPromise = null; throw error; });
    }
    return loadPromise;
  }

  function equalSurface(actual, expected, caseSensitive) {
    return caseSensitive ? actual === expected
      : actual.toLocaleLowerCase("ca") === expected.toLocaleLowerCase("ca");
  }

  function tokenReadings(token, rawPos = false) {
    const readings = rawPos ? token.preDisambiguationReadings || token.lexicalReadings : token.readings;
    return readings?.length ? readings : [{ lemma: null, tag: null }];
  }

  function matchesTokenPattern(pattern, actual, rawPos = false) {
    if (pattern.whitespaceTest && Boolean(actual.whitespaceBefore) !== Boolean(pattern.whitespaceBefore)) return false;
    const mainMatch = tokenReadings(actual, rawPos).some(reading => matchesReading(pattern, actual, reading));
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
      && readings.some(reading => matchesReading(exception, actual, reading)));
  }

  function matchesScopeNextException(patternToken, actual, rawPos = false) {
    return (patternToken.exceptions || []).some(exception => exception.exceptionsScopeNext
      && tokenReadings(actual, rawPos).some(reading => matchesReading(exception, actual, reading)));
  }

  function matchesReading(pattern, actual, reading) {
      if (pattern.whitespaceTest && Boolean(actual.whitespaceBefore) !== Boolean(pattern.whitespaceBefore)) return false;
      const testText = pattern.inflected && reading.lemma != null ? reading.lemma : String(actual.text);
      let surfaceMatches = true;
      if (pattern.text) surfaceMatches = pattern.regexp
        ? testText.length <= 250 && compileSurfaceRegex(pattern.text, pattern.caseSensitive).test(testText)
        : equalSurface(testText, pattern.text, pattern.caseSensitive);
      if (!surfaceMatches !== Boolean(pattern.negated && !pattern.chunkTag)) return false;
      if (pattern.pos == null) return true;
      const noTag = !/\r|\n/u.test(actual.text) && (actual.readings || []).every(row => row.tag == null || ["SENT_END", "PARAGRAPH_END"].includes(row.tag));
      const acceptsUnknown = pattern.posRegexp ? compilePosRegex(pattern.pos).test("UNKNOWN") : pattern.pos === "UNKNOWN";
      const posMatches = acceptsUnknown && noTag || (reading.tag != null && (pattern.posRegexp
        ? compilePosRegex(pattern.pos).test(reading.tag) : reading.tag === pattern.pos));
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

  function matchSequenceAt(pattern, words, start, rawPos = false, checkImmunity = true) {
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
            && matchesReading(exception, next, tokenReadings(next, rawPos)[0]))) veto = true;
        if (veto || !matchesTokenPattern(element, actual, rawPos)) return false;
        const previous = words[index - 1];
        return !previous || !(element.previousExceptions || []).some(exception => tokenReadings(previous, rawPos)
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
        const matchedPositions = matchSequenceAt(pattern, words, start, rawPos, false);
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
    const surface = String(token.text);
    const found = new Set([
      ...unconstrainedFirst,
      ...(caseInsensitiveByFirst.get(surface.toLocaleLowerCase("ca")) || []),
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
        for (const rule of lemmaInsensitiveByFirst.get(lemma.toLocaleLowerCase("ca")) || []) found.add(rule);
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
    return decodeEntities(String(message || "").replace(/<\/?[A-Za-z][^>]*\/?\s*>/gu, ""));
  }

  function isAllUppercase(text) {
    const letters = [...text].filter(char => /[\p{Lu}\p{Ll}\p{Lt}]/u.test(char));
    return letters.length > 0 && letters.every(char => char === char.toLocaleUpperCase("ca"));
  }

  function isCapitalizedWord(text) {
    const chars = [...text];
    return chars.length > 0 && chars[0] === chars[0].toLocaleUpperCase("ca")
      && chars.slice(1).every(char => !/\p{L}/u.test(char) || char === char.toLocaleLowerCase("ca"));
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
        const readings = spec.staticLemma != null ? [{token:spec.staticLemma,lemma:spec.staticLemma,tag:spec.posTag}] : sourceReadings;
        let tag = spec.posTag;
        const numberTag = ["_spell_number_", "_spell_number_:feminine", "_spell_number_:Roman"].includes(spec.posTag);
        if (spec.posRegexp && !numberTag) {
          const expression = globalThis.CorrectorJavaCaseRegex.compile(spec.posTag,true);
          const matches = sourceReadings.map(row=>row.tag).filter(value=>value!=null&&expression.test(value));
          tag = globalThis.CorrectorCatalanSynthesis.targetPosTag(matches,tag);
          if (spec.posTagReplace != null) {
            const replacementExpression=globalThis.CorrectorJavaCaseRegex.compile(spec.posTag,true,true);
            const values=spec.staticLemma != null?[tag]:matches.length?matches:[tag];
            tag=values.map(value=>value.replace(replacementExpression,spec.posTagReplace)).join("|");
          }
        }
        let forms=[];
        if(numberTag){
          // MatchState applies regexp_match/regexp_replace to the token surface
          // before invoking the special synthesizer tags.
          let numberInput=String(token.text);
          if(spec.regexMatch!=null){
            const expression=globalThis.CorrectorJavaCaseRegex.compile(spec.regexMatch,true,true);
            const replacement=(spec.regexReplace||"").replace(/\$0(?!\d)/gu,()=>"$&");
            numberInput=numberInput.replace(expression,replacement);
          }
          const value=globalThis.CorrectorCatalanSoros.spellNumber(numberInput,spec.posTag);
          if(value!=null)forms.push(value);
        }
        else {
          let oneForm=false;
          if(spec.posRegexp)for(const row of readings)if(row.lemma==null){if(row.tag==null||["SENT_START","SENT_END","PARAGRAPH_END"].includes(row.tag)){forms.push(spec.staticLemma??token.text);oneForm=true;}else oneForm=false;}
          if(!oneForm)forms.push(...readings.flatMap(row=>globalThis.CorrectorCatalanSynthesis.synthesize(row,tag,Boolean(spec.posRegexp),activeLocaleProfile)));
        }
        forms=[...new Set(forms)].sort();if(!forms.length&&spec.posRegexp)forms=["("+(spec.staticLemma??token.text)+")"];
        forms=forms.map(value=>{
          const conversion=spec.caseConversion||"NONE";
          if(conversion==="ALLLOWER"||conversion==="FIRSTUPPER")value=value.toLocaleLowerCase("ca");
          if(conversion==="ALLUPPER"||conversion==="PRESERVE"&&isAllUppercase(token.text))value=value.toLocaleUpperCase("ca");
          if(conversion==="STARTLOWER")value=value.slice(0,1).toLocaleLowerCase("ca")+value.slice(1);
          if(["STARTUPPER","FIRSTUPPER"].includes(conversion)||conversion==="PRESERVE"&&/^\p{Lu}/u.test(token.text))value=value.slice(0,1).toLocaleUpperCase("ca")+value.slice(1);
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
      if (conversion === "ALLLOWER" || conversion === "FIRSTUPPER") value = value.toLocaleLowerCase("ca");
      if (conversion === "ALLUPPER") value = value.toLocaleUpperCase("ca");
      if (conversion === "STARTLOWER") value = value.slice(0, 1).toLocaleLowerCase("ca") + value.slice(1);
      if (["STARTUPPER", "FIRSTUPPER"].includes(conversion) || conversion === "PRESERVE" && /^\p{Lu}/u.test(token.text)) {
        value = conversion === "PRESERVE" && isAllUppercase(token.text) ? value.toLocaleUpperCase("ca")
          : value.slice(0, 1).toLocaleUpperCase("ca") + value.slice(1);
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
        const upper = value.toLocaleUpperCase("ca");
        if (matchedText !== upper) value = upper;
      } else if (rule.adjustSuggestionCase && preserveSuggestionCase && matchedTextHasLetters && startsWithUppercase) {
        const first = [...value][0];
        if (first) value = first.toLocaleUpperCase("ca") + value.slice(first.length);
      }
      if (!/[\\$]\d/u.test(value) && !suggestions.includes(value)) suggestions.push(value);
      return _whole;
    });
    return { message: plainRuleMessage(rawMessage), suggestions,
      suppressed: rawMessage.includes("<pleasespellme/>") && !suggestions.length };
  }

  function adaptCatalanSuggestions(suggestions, matchedText, sentenceHasTypographicApostrophe, filterClass = null) {
    const adapted = [];
    for (const original of suggestions) {
      let value = original;
      // Keep both e/è alternatives for LanguageTool's Catalan spelling
      // suppression filter: that filter checks each suggestion against the
      // lexical resource and must be allowed to select the accepted form.
      // Other rule families retain the upstream-compatible legacy pruning.
      if (filterClass !== "org.languagetool.rules.ca.CatalanSuppressMisspelledSuggestionsFilter" && value !== "després") {
        const generalAccentVariant = value.replace(/é/g, "è").replace(/É/g, "È");
        if (generalAccentVariant !== value && suggestions.includes(generalAccentVariant)) continue;
      }
      if (sentenceHasTypographicApostrophe && value.length > 1) value = value.replace(/'/g, "’");
      if (matchedText.length > 2 && matchedText.endsWith("'") && !value.endsWith("'") && !value.endsWith("’")) value += " ";
      value = globalThis.CorrectorCatalanMorfologikSpeller?.normalizeLegacyDiacritics?.([value])[0] || value;
      if (!adapted.includes(value)) adapted.push(value);
    }
    return adapted;
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

  const inclusiveLocaleOnlyRules = new Set(["VOCABULARI_BALEAR", "VOCABULARI_VALENCIA", "MUNICIPIS_VALENCIA"]);
  function activateRuleProfile(profile) {
    if (configuredRuleProfile === profile) return;
    const overrides = dialectProfileOverrides[profile];
    for (const rule of rules) {
      const order = overrides?.registrationOrder?.[rule.fullId];
      rule.registrationOrder = Number.isInteger(order) ? order : baseRegistrationOrder.get(rule);
    }
    configuredRuleProfile = profile;
  }
  function findMatches(tokens, sourceText = "", { arbitrate = true, ruleIds = null, skipFilters = false, includeOtherFamilies = true, includeAllFamilies = false, checkLevel = "DEFAULT", localeProfile = "central" } = {}) {
    if (!rules.length) throw new Error("Cal carregar primer els recursos PatternRule.");
    activeLocaleProfile = localeProfile;
    activateRuleProfile(localeProfile);
    const startOffset = tokens[0]?.start ?? tokens.find(token => token.kind !== "space")?.start ?? 0;
    const sentenceStart = {
      text: "",
      kind: "sentence-start",
      start: startOffset,
      end: startOffset,
      readings: [{ token: "", lemma: null, tag: "SENT_START" }],
      contextualReadings: [{ token: "", lemma: null, tag: "SENT_START" }],
      lexicalReadings: [{ token: "", lemma: null, tag: "SENT_START" }],
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
        if (rule._dialectProfile && rule._dialectProfile !== localeProfile) continue;
        if (dialectProfileOverrides[localeProfile]?.disabled.has(rule.fullId)) continue;
        // These LanguageTool rules enforce central forms or regional
        // localization. They are preferences, not pan-Catalan grammar.
        if (localeProfile === "inclusive" && (rule.categoryId === "REGIONAL_NON_VERBS"
            || rule.categoryId === "REGIONAL_VERBS" || inclusiveLocaleOnlyRules.has(rule.id))) continue;
        if (ruleIds && !ruleIds.has(rule.id)) continue;
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
        const matchEnd = (markerPositions.at(-1) || last).end;
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
        const output = formatOutput(rule, fullMatchText, startsWithUppercase, allUppercase, matchedPositions, words);
        if (output.suppressed) continue;
        const sentenceHasTypographicApostrophe = sourceText.slice(words[0].start, words.at(-1).end).includes("’");
        const finalSuggestions = adaptCatalanSuggestions(output.suggestions, matchedText, sentenceHasTypographicApostrophe, rule.filterClass);
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
          _family: "pattern"
        };
        if (rule.filterClass && !skipFilters) issue = globalThis.CorrectorCatalanRuleFilters.apply(rule, issue, {words, positions: matchedPositions, text: sourceText, localeProfile});
        if (issue) found.push({...issue, _from: issue.start, _to: issue.end, text: sourceText.slice(issue.start,issue.end)});
      }
    }
    if (includeOtherFamilies) {
      found.push(...globalThis.CorrectorCatalanSimpleReplaceMatcher.findMatches(tokens, sourceText));
      found.push(...globalThis.CorrectorCatalanTableRuleMatcher.findMatches(tokens, sourceText, { localeProfile }));
    }
    if (!arbitrate) return found;
    return arbitrateMatches(found, sourceText, { checkLevel, includeAllFamilies });
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
      .map(({ _ruleId, _from, _to, _priority, _picky, _includedAllAtOnce, _registrationOrder, _family, _outputPortable, ...issue }) => {
      const range = trimMatchEnds(issue.start, issue.end, issue.suggestions, sourceText);
      // Catalan.adjustCatalanMatch expands a deletion over the following space
      // when the match is at a word boundary, so accepting the empty
      // replacement cannot leave a doubled space.
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

  globalThis.CorrectorCatalanPatternRuleMatcher = Object.freeze({ load, findMatches, arbitrateMatches,
    configureLexicalLookup: lookup => { lexicalLookup = lookup; }, getRuleCount: () => rules.length });
})();
