/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Safe, source-verified subset of LanguageTool's ordered en-US XML disambiguation rules. */
(() => {
  "use strict";

  let rules = [];
  let englishWordTags = {};
  let excludedRuleIds = [];
  let unificationDefinitions = {};
  let unificationRegexps = new Map();
  const EXPECTED_SOURCE_HASH = "61b02a3b577c03e7a1197968238404f56915fcb862096fbf745ab3b3c77f7edc";
  const EXPECTED_ENGLISH_TAGS_HASH = "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a";
  const analysis = Object.freeze({
    record(token, stage, operation, detail) {
      (token.contextTrace ||= []).push({ stage, operation, ...detail });
    },
    replaceReadings(token, readings) {
      token.contextualReadings = readings;
      token.readings = readings;
    },
    addChunkTag(token, tag) {
      token.chunkTags ||= [];
      if (!token.chunkTags.includes(tag)) token.chunkTags.push(tag);
    }
  });
  const SUPPORTED_ACTIONS = new Set(["ADD", "FILTER", "FILTERALL", "REMOVE", "REPLACE", "ADDCHUNK", "IMMUNIZE", "IGNORE_SPELLING", "UNIFY"]);
  const compiledPosTagRegexps = new WeakMap();
  const compiledSurfaceRegexps = new WeakMap();
  const compiledChunkRegexps = new WeakMap();
  const compiledPartialFilterRegexps = new Map();
  const JAVASCRIPT_REGEX_ESCAPES = new Set(["\\", ".", "^", "$", "|", "?", "*", "+", "(", ")", "[", "]", "{", "}", "-", "/"]);
  const MAX_SURFACE_MATCH_LENGTH = 250;

  function compilePortablePosTagRegexp(expression) {
    if (typeof expression !== "string" || !expression || !/^[A-Za-z0-9_:,;.*+?()[\]{}|^$!\\<>\-'`]+$/u.test(expression)) {
      throw new Error("Unsupported POS regular expression");
    }
    // PatternToken.PosToken and the action filters compile POS independently
    // of the surface case flag. Internal lowercase tags must stay distinct.
    return new RegExp(`^(?:${expression})$`, "u");
  }

  function translateJavaDot(expression) {
    let translated = "";
    let inCharacterClass = false;
    let nestedCharacterClassDepth = 0;
    for (let index = 0; index < expression.length; index++) {
      const char = expression[index];
      if (char === "\\" && expression[index + 1] === "=") {
        translated += "=";
        index++;
      } else if (char === "\\" && index + 1 < expression.length) {
        const escaped = expression[++index];
        translated += escaped === "-" && !inCharacterClass ? "-"
          : /[A-Za-z0-9]/u.test(escaped) || JAVASCRIPT_REGEX_ESCAPES.has(escaped) ? `\\${escaped}` : escaped;
      } else if (char === "[" && !inCharacterClass) {
        inCharacterClass = true;
        translated += char;
      } else if (char === "[" && inCharacterClass) {
        nestedCharacterClassDepth++;
      } else if (char === "]" && inCharacterClass && nestedCharacterClassDepth > 0) {
        nestedCharacterClassDepth--;
      } else if (char === "]" && inCharacterClass) {
        inCharacterClass = false;
        translated += char;
      } else if (char === "." && !inCharacterClass) {
        // Java StringMatcher's ANY_CODE_POINT excludes all Java line terminators.
        translated += "[^\\n\\r\\u0085\\u2028\\u2029]";
      } else {
        translated += char;
      }
    }
    return translated;
  }

  function splitTopLevelAlternatives(expression) {
    const alternatives = [];
    let start = 0, depth = 0, inCharacterClass = false, escaped = false;
    for (let index = 0; index < expression.length; index++) {
      const char = expression[index];
      if (escaped) { escaped = false; continue; }
      if (char === "\\") { escaped = true; continue; }
      if (char === "[" && !inCharacterClass) { inCharacterClass = true; continue; }
      if (char === "]" && inCharacterClass) { inCharacterClass = false; continue; }
      if (inCharacterClass) continue;
      if (char === "(") depth++;
      else if (char === ")") depth--;
      else if (char === "|" && depth === 0) { alternatives.push(expression.slice(start, index)); start = index + 1; }
    }
    alternatives.push(expression.slice(start));
    return alternatives;
  }

  function portableSurfaceAlternativeModes(expression, caseSensitive) {
    return splitTopLevelAlternatives(expression).map(branch => {
      const hasInlineDisable = branch.includes("(?-i)");
      if (hasInlineDisable && (!branch.startsWith("(?-i)") || branch.indexOf("(?-i)", 1) >= 0)) return null;
      let source = hasInlineDisable ? branch.slice(5) : branch;
      const inlineFlags = /^\(\?([iu]+)\)/u.exec(source);
      if (inlineFlags) source = source.slice(inlineFlags[0].length);
      if (/\(\?(?:[imsUdx-]|<)/u.test(source)) return null;
      return { source, sensitive: Boolean(caseSensitive || hasInlineDisable) };
    });
  }

  function compilePortableSurfaceRegexp(expression, caseSensitive = false) {
    if (typeof expression !== "string" || !expression || expression.length > 50000
        || /\\(?:A|Z|z|G|Q|E|h|H|R|X|e|c|s|S|w|W|b|B|v|[1-9])/u.test(expression)
        || /\\x\{/u.test(expression) || /&&/u.test(expression)
        || /(?:[*+?]|\{[0-9]+(?:,[0-9]*)?\})\+/u.test(expression)
        || /\\p\{(?:Is|In|java)/iu.test(expression)) {
      throw new Error("Unsupported Java-specific surface regular expression");
    }
    try {
      const alternatives = portableSurfaceAlternativeModes(expression, caseSensitive);
      if (!alternatives?.length || alternatives.some(item => !item)) throw new Error("Unsupported inline regex mode");
      return alternatives.map(alternative => new RegExp(`^(?:${translateJavaDot(alternative.source)})$`, alternative.sensitive ? "u" : "iu"));
    } catch {
      throw new Error("Invalid or nonportable surface regular expression");
    }
  }

  function validatePatternToken(token, ruleId, { andMember = false, allowSkipNext = false, allowVariableOccurrence = false } = {}) {
    const supportedOccurrence = token.minOccurrence === 1 && token.maxOccurrence === 1
      || allowVariableOccurrence && (token.minOccurrence === 0 || token.minOccurrence === 1)
        && Number.isInteger(token.maxOccurrence) && token.maxOccurrence >= 1 && token.maxOccurrence <= 16;
    if (!supportedOccurrence || (!allowSkipNext && token.skipNext)
        || (andMember && (token.andGroup?.length || token.previousExceptions?.length))
        || token.orGroup?.length
        || hasUnification(token) && !isSupportedUnificationToken(token)
        || token.phraseName || (typeof token.whitespaceConstrained !== "boolean"
          && !token.matchesWithoutWhitespace && !token.matchesWithWhitespace)
        || typeof token.textConstrained !== "boolean"
        || (token.textConstrained && (typeof token.text !== "string" || !token.text.length))
        || (token.chunkTag != null && (typeof token.chunkTag !== "string" || !token.chunkTag))
        || (andMember && !token.textConstrained && !token.posTag && !token.chunkTag)) {
      throw new Error(`Unsupported compiled pattern in ${ruleId}`);
    }
    if (allowSkipNext && token.skipNext && (!Number.isInteger(token.skipNext) || token.skipNext < -1)) {
      throw new Error(`Unsupported skip-next distance in ${ruleId}`);
    }
    if (token.posTagRegexp) {
      try { compiledPosTagRegexps.set(token, compilePortablePosTagRegexp(token.posTag, token.caseSensitive)); }
      catch { throw new Error(`Unsupported POS regular expression in ${ruleId}`); }
    }
    if (token.textConstrained && token.regexp && !token.referenceElement) {
      try { compiledSurfaceRegexps.set(token, compilePortableSurfaceRegexp(token.text, token.caseSensitive)); }
      catch { throw new Error(`Unsupported surface regular expression in ${ruleId}`); }
    }
    if (token.chunkTag?.endsWith("[regex]")) {
      try { compiledChunkRegexps.set(token, compilePortablePosTagRegexp(token.chunkTag.slice(0, -7))); }
      catch { throw new Error(`Unsupported chunk expression in ${ruleId}`); }
    }
    for (const child of token.exceptions || []) {
      if (child.exceptions?.length || child.previousExceptions?.length || child.andGroup?.length || child.orGroup?.length) {
        throw new Error(`Unsupported nested exception condition in ${ruleId}`);
      }
      validatePatternToken(child, ruleId);
    }
    for (const child of token.previousExceptions || []) {
      if (child.exceptions?.length || child.previousExceptions?.length || child.andGroup?.length || child.orGroup?.length) {
        throw new Error(`Unsupported nested previous-exception condition in ${ruleId}`);
      }
      validatePatternToken(child, ruleId);
    }
    for (const child of token.andGroup || []) validatePatternToken(child, ruleId, { andMember: true });
  }

  function hasUnification(token) {
    return Boolean(token.unified || token.unificationFeatures || token.unificationNegated || token.unificationNeutral);
  }

  function isSupportedUnificationToken(token) {
    if (!token.unified) return false;
    if (token.unificationNeutral) return true;
    const features = token.unificationFeatures;
    return Boolean(features && Object.keys(features).length > 0
      && Object.entries(features).every(([feature, types]) => unificationDefinitions[feature]
        && Array.isArray(types) && types.every(type => typeof type === "string" && unificationDefinitions[feature][type])));
  }

  function isSupportedSelfReplacementCapture(rule, actionStart) {
    const match = rule?.match;
    return rule?.action === "REPLACE" && !rule.newReadings?.length
      && match && Number.isInteger(match.tokenRef)
      && (match.tokenRef === actionStart || match.tokenRef === actionStart + 1)
      && match.posTagRegexp && match.posTag && !match.lemma
      && match.caseConversion === "NONE" && match.includeSkipped === "NONE"
      && !match.regexMatch && !match.regexReplace && !match.posTagReplace
      && !match.setPos && !match.suppressMisspelled;
  }

  function assertRule(rule) {
    if (!SUPPORTED_ACTIONS.has(rule.action) || rule.filterClass && !isSupportedEnglishFilter(rule)
        || !Number.isInteger(rule.startPositionCorrection) || !Number.isInteger(rule.endPositionCorrection)) {
      throw new Error(`Unsupported compiled LanguageTool rule: ${rule.id}`);
    }
    if (!Array.isArray(rule.pattern) || !rule.pattern.length) throw new Error(`Empty rule pattern: ${rule.id}`);
    const span = actionSpan(rule);
    if (rule.match && !isSupportedSelfReplacementCapture(rule, span.start)) {
      throw new Error(`Unsupported <match> capture in ${rule.id}`);
    }
    const hasExplicitMarker = rule.pattern.some(token => token.insideMarker);
    if (span.start < 0 || span.end > rule.pattern.length || span.end <= span.start
        || (hasExplicitMarker && rule.pattern.some((token, index) => token.insideMarker !== (index >= span.start && index < span.end)))) {
      throw new Error(`Invalid marker/action span in ${rule.id}`);
    }
    if (rule.action === "FILTER" || rule.action === "REMOVE") {
      if (rule.action === "FILTER" && !rule.disambiguatedPos) throw new Error(`FILTER rule has no target POS: ${rule.id}`);
      if (rule.disambiguatedPos && !/^[A-Z0-9_]+$/u.test(rule.disambiguatedPos)) {
        try { compilePortablePosTagRegexp(rule.disambiguatedPos); }
        catch { throw new Error(`Unsupported ${rule.action} POS expression in ${rule.id}`); }
      }
    }
    if (rule.action === "FILTERALL" && !rule.pattern.slice(span.start, span.end)
        .every(token => token.posTag || token.textConstrained)) {
      throw new Error(`Unsupported FILTERALL pattern in ${rule.id}`);
    }
    if (rule.pattern.some((token, index) => token.sentenceStart
        && (index !== 0 || token.textConstrained || token.text || token.posTag !== "SENT_START"))) {
      throw new Error(`Unsupported sentence-start pattern in ${rule.id}`);
    }
    for (const [index, token] of rule.pattern.entries()) {
      validatePatternToken(token, rule.id, { allowSkipNext: true, allowVariableOccurrence: true });
      if (token.referenceElement) {
        const ref = token.match;
        if (!ref || !Number.isInteger(ref.tokenRef) || ref.tokenRef < 0 || ref.tokenRef > index
            || ref.caseConversion !== "NONE" || ref.includeSkipped !== "NONE" || ref.posTag !== ""
            || ref.posTagRegexp || ref.lemma || !token.textConstrained
            || (token.regexp ? token.text !== `\\${ref.tokenRef}` : !token.text.includes(`\\${ref.tokenRef}`))
            || token.minOccurrence !== 1 || token.maxOccurrence !== 1 || token.skipNext
            || rule.pattern[ref.tokenRef]?.minOccurrence !== 1 || rule.pattern[ref.tokenRef]?.maxOccurrence !== 1
            || rule.pattern[ref.tokenRef]?.skipNext) {
          throw new Error(`Unsupported token reference in ${rule.id}`);
        }
      }
    }
    for (const antiPattern of rule.antiPatterns || []) {
      if (!Array.isArray(antiPattern.pattern) || !antiPattern.pattern.length) {
        throw new Error(`Empty antipattern in ${rule.id}`);
      }
      for (const [index, token] of antiPattern.pattern.entries()) {
        if (token.sentenceStart
            && (index !== 0 || token.textConstrained || token.text || token.posTag !== "SENT_START")) {
          throw new Error(`Unsupported antipattern sentence-start pattern in ${rule.id}`);
        }
        validatePatternToken(token, `${rule.id}:${antiPattern.id}`, { allowSkipNext: true, allowVariableOccurrence: true });
      }
    }
    if (rule.action === "REPLACE" && !rule.newReadings?.length && !rule.match
        && (!rule.disambiguatedPos || !/^[A-Za-z0-9_:$'`]+$/u.test(rule.disambiguatedPos))) {
      throw new Error(`Unsupported POS-only REPLACE target in ${rule.id}`);
    }
  }

  function parseEnglishFilterArguments(rule) {
    if (!new Set(["org.languagetool.rules.IsEnglishWordFilter", "org.languagetool.rules.en.NoDisambiguationEnglishPartialPosTagFilter"]).has(rule.filterClass)
        || typeof rule.filterArguments !== "string") return null;
    const args = Object.fromEntries(rule.filterArguments.trim().split(/\s+/u).map(part => {
      const separator = part.indexOf(":");
      return separator > 0 ? [part.slice(0, separator), part.slice(separator + 1)] : [part, ""];
    }));
    if (rule.filterClass === "org.languagetool.rules.en.NoDisambiguationEnglishPartialPosTagFilter") {
      if (Object.keys(args).sort().join(",") !== "no,postag_regexp,regexp"
          || !/^[1-9][0-9]*$/u.test(args.no) || Number(args.no) > rule.pattern.length
          || !args.regexp || !args.postag_regexp || args.regexp.length > 1000) return null;
      try { new RegExp(`^(?:${args.regexp})$`, "u"); new RegExp(`^(?:${args.postag_regexp})$`, "u"); }
      catch { return null; }
      return { type: "partial-pos", position: Number(args.no), regexp: args.regexp, postagRegexp: args.postag_regexp };
    }
    const positions = args.formPositions?.split(",") || [];
    if (!positions.length || positions.some(position => !/^[1-9][0-9]*$/u.test(position)
        || Number(position) > rule.pattern.length)
        || args.postags != null && args.postags.split(",").length !== positions.length
        || Object.keys(args).some(key => key !== "formPositions" && key !== "postags")) return null;
    return { type: "english-word", positions: positions.map(Number), postags: args.postags?.split(",") || null };
  }

  function isSupportedEnglishFilter(rule) {
    const parsed = parseEnglishFilterArguments(rule);
    if (!parsed) return false;
    return !parsed.postags || parsed.postags.every(tag => {
      try { new RegExp(`^(?:${tag})$`, "u"); return true; }
      catch { return false; }
    });
  }

  function englishFilterMatches(rule, patternPositions, lexical, morphology = null) {
    const args = parseEnglishFilterArguments(rule);
    if (!args) return false;
    if (args.type === "partial-pos") {
      const matchedPosition = patternPositions[args.position - 1];
      if (!Number.isInteger(matchedPosition) || !lexical[matchedPosition]) return false;
      let expression = compiledPartialFilterRegexps.get(rule.id);
      if (!expression) { expression = new RegExp(`^(?:${args.regexp})$`, "u"); compiledPartialFilterRegexps.set(rule.id, expression); }
      const match = expression.exec(String(lexical[matchedPosition].token.text ?? ""));
      if (!match) return false;
      if (!morphology) return false;
      const fragmentReadings = globalThis.CorrectorEnglishTagger?.tagToken(match[1], morphology);
      const tagExpression = new RegExp(`^(?:${args.postagRegexp})$`, "u");
      return Boolean(fragmentReadings?.readings.some(reading => reading.tag != null && tagExpression.test(reading.tag)));
    }
    for (let index = 0; index < args.positions.length; index++) {
      const matchedPosition = patternPositions[args.positions[index] - 1];
      if (!Number.isInteger(matchedPosition) || !lexical[matchedPosition]) return false;
      // IsEnglishWordFilter calls EnglishTagger on the matched surface form.
      // Mirror EnglishTagger's case policy: direct readings, lowercase
      // readings except for mixed-case forms, then its initial-cap fallback
      // for otherwise unknown all-uppercase forms.
      const word = String(lexical[matchedPosition].token.text ?? "").replaceAll("’", "'");
      const lowerWord = word.toLocaleLowerCase("en-US");
      const isAllUpper = !/[a-z]/u.test(word);
      const isCapitalized = /^[A-Z][^A-Z]*$/u.test(word);
      const isMixedCase = !isAllUpper && !isCapitalized && /[A-Z]/u.test(word);
      const tags = [...(englishWordTags[word] || [])];
      if (word !== lowerWord && !isMixedCase) tags.push(...(englishWordTags[lowerWord] || []));
      if (!tags.length && isAllUpper && /[A-Z]/u.test(word)) {
        const firstCapitalized = lowerWord[0].toLocaleUpperCase("en-US") + lowerWord.slice(1);
        tags.push(...(englishWordTags[firstCapitalized] || []));
      }
      if (!tags.length) return false;
      if (args.postags && !new RegExp(`^(?:${args.postags[index]})$`, "u").test(tags.join("\n"))) {
        if (!tags.some(tag => new RegExp(`^(?:${args.postags[index]})$`, "u").test(tag))) return false;
      }
    }
    return true;
  }

  // LanguageTool's position corrections select the marked token range. The
  // matcher evaluates the full pattern as context, then actions affect this span.
  function actionSpan(rule) {
    return {
      start: rule.startPositionCorrection,
      end: rule.pattern.length + rule.endPositionCorrection
    };
  }

  async function load({ url, fetcher = globalThis.fetch } = {}) {
    const resourceUrl = url || globalThis.chrome?.runtime?.getURL("build/resources/en-US/en-disambiguation-rules.json");
    if (!resourceUrl) throw new Error("An en-US disambiguation resource URL is required outside the extension.");
    const response = await fetcher(resourceUrl);
    if (!response.ok) throw new Error(`Could not load en-US XML disambiguation (${response.status}).`);
    const resource = await response.json();
    if (resource?.schemaVersion !== 1 || resource.language !== "en-US"
        || resource.sourceSha256 !== EXPECTED_SOURCE_HASH || !Array.isArray(resource.rules)
        || resource.upstreamRuleCount !== 1018 || resource.supportedRuleCount !== 1018
        || resource.excludedRuleCount !== 0 || resource.supportedRuleCount !== resource.rules.length
        || !Array.isArray(resource.excludedRules) || resource.excludedRules.length !== resource.excludedRuleCount
        || typeof resource.unificationDefinitions !== "object"
        || !resource.unificationDefinitions || resource.englishWordTagsSha256 !== EXPECTED_ENGLISH_TAGS_HASH
        || !resource.englishWordTags || typeof resource.englishWordTags !== "object") {
      throw new Error("The en-US XML disambiguation resource is incompatible or unverified.");
    }
    for (const [word, tags] of Object.entries(resource.englishWordTags)) {
      if (!/^[A-Za-z]+(?:'[A-Za-z]+)?$/u.test(word) || !Array.isArray(tags)
          || tags.some(tag => typeof tag !== "string" || !/^[A-Za-z0-9_:$]+$/u.test(tag))) {
        throw new Error("Diccionari POS anglès incompatible.");
      }
    }
    const definitions = resource.unificationDefinitions;
    const compiledDefinitions = new Map();
    for (const [feature, equivalences] of Object.entries(definitions)) {
      if (!equivalences || typeof equivalences !== "object" || !Object.keys(equivalences).length) {
        throw new Error(`Empty English unification definition: ${feature}`);
      }
      const compiled = new Map();
      for (const [type, expression] of Object.entries(equivalences)) {
        if (typeof expression !== "string") throw new Error(`Invalid English unification definition: ${feature}/${type}`);
        compiled.set(type, compilePortablePosTagRegexp(expression));
      }
      compiledDefinitions.set(feature, compiled);
    }
    unificationDefinitions = definitions;
    unificationRegexps = compiledDefinitions;
    englishWordTags = resource.englishWordTags;
    excludedRuleIds = resource.excludedRules.map(rule => rule.id);
    for (const rule of resource.rules) assertRule(rule);
    rules = resource.rules;
    return { loadedRules: rules.length, upstreamRules: resource.upstreamRuleCount, sourceSha256: resource.sourceSha256 };
  }

  function isSpace(token) { return token.kind === "space" || /^\s+$/u.test(token.text || ""); }

  function matchesPatternReading(pattern, token, reading) {
    let surfaceMatches = true;
    if (pattern.textConstrained) {
      const surface = String(pattern.inflected && reading.lemma != null ? reading.lemma : token.text ?? "");
      const expected = String(pattern.text);
      if (surface.length > MAX_SURFACE_MATCH_LENGTH) return false;
      if (pattern.regexp) {
        const regexp = compiledSurfaceRegexps.get(pattern);
        if (!regexp || !regexp.some(candidate => candidate.test(surface))) return false;
      } else {
        const equal = pattern.caseSensitive
          ? surface === expected
          : surface.toLocaleLowerCase("es") === expected.toLocaleLowerCase("es");
        surfaceMatches = equal;
      }
    } else if (pattern.negated && !pattern.chunkTag) {
      // PatternToken.isMatched() returns false for negation without a string matcher.
      return false;
    }
    if (pattern.textConstrained && surfaceMatches === Boolean(pattern.negated)) return false;

    let posMatches = true;
    if (pattern.posTag != null) {
      if (reading.tag == null) {
        // LanguageTool exposes an untagged token as the synthetic UNKNOWN POS
        // when evaluating POS regular expressions too. This matters in
        // exceptions such as NN.*|VBP|CD|UNKNOWN: treating null as a failed
        // regex lets a disambiguation rule overwrite possessive ambiguity
        // and later causes PatternRule antipatterns to suppress valid matches.
        const regexp = compiledPosTagRegexps.get(pattern);
        posMatches = pattern.posTag === "UNKNOWN" || Boolean(regexp?.test("UNKNOWN"));
      } else {
        const regexp = compiledPosTagRegexps.get(pattern);
        posMatches = reading.tag != null && (regexp ? regexp.test(reading.tag) : reading.tag === pattern.posTag);
      }
    }
    if (posMatches === Boolean(pattern.posTagNegated)) return false;
    if (typeof pattern.whitespaceConstrained === "boolean") {
      if (pattern.whitespaceConstrained
          && Boolean(pattern.whitespaceBeforeRequired) !== Boolean(token.whitespaceBefore)) return false;
    } else {
      if (pattern.matchesWithWhitespace && !pattern.matchesWithoutWhitespace && !token.whitespaceBefore) return false;
      if (pattern.matchesWithoutWhitespace && !pattern.matchesWithWhitespace && token.whitespaceBefore) return false;
    }
    return true;
  }

  function matchesPatternToken(pattern, token) {
    const readings = token.contextualReadings?.length ? token.contextualReadings : [{ lemma: null, tag: null }];
    if (!readings.some(reading => matchesPatternReading(pattern, token, reading))) return false;
    // Exceptions belong to each candidate test. Applying them only after a
    // skip window has selected its first match prevents Java's forward search
    // from reaching later admissible candidates.
    if (exceptionMatchesReadings(pattern.exceptions, token)) return false;
    if (pattern.chunkTag && matchesChunkTag(pattern, token) === Boolean(pattern.negated)) return false;
    return (pattern.andGroup || []).every(member => matchesPatternToken(member, token));
  }

  function matchesChunkTag(pattern, token) {
    const expression = compiledChunkRegexps.get(pattern);
    return (token.chunkTags || []).some(tag => expression ? expression.test(tag) : tag === pattern.chunkTag);
  }

  function resolveReferencePattern(pattern, patternOffset, candidateIndex, patternPositions, lexical) {
    if (!pattern.referenceElement) return pattern;
    const referenceOffset = pattern.match?.tokenRef;
    const referencePosition = referenceOffset === patternOffset ? candidateIndex : patternPositions[referenceOffset];
    if (!Number.isInteger(referencePosition) || !lexical[referencePosition]) return null;
    const placeholder = `\\${referenceOffset}`;
    if (!pattern.text.includes(placeholder)) return null;
    const text = pattern.regexp ? lexical[referencePosition].token.text
      : pattern.text.split(placeholder).join(lexical[referencePosition].token.text);
    return { ...pattern, text, regexp: false, referenceElement: false };
  }

  function exceptionMatchesReadings(exceptions, token, nextScope = false) {
    return (exceptions || []).some(exception => {
      if (Boolean(exception.hasNextException) !== nextScope) return false;
      const readings = token.contextualReadings?.length ? token.contextualReadings : [{ lemma: null, tag: null }];
      return readings.some(reading => matchesPatternReading(exception, token, reading))
        && (!exception.chunkTag || matchesChunkTag(exception, token) !== Boolean(exception.negated));
    });
  }

  function hasRuleException(rule, lexical, patternPositions) {
    for (let offset = 0; offset < rule.pattern.length; offset++) {
      const pattern = rule.pattern[offset];
      const tokenIndex = patternPositions[offset];
      if (!Number.isInteger(tokenIndex)) continue;
      const token = lexical[tokenIndex].token;
      const sources = [pattern, ...(pattern.andGroup || [])];
      if (sources.some(source => exceptionMatchesReadings(source.exceptions, token, false))) return true;
      const previousIndex = tokenIndex - 1;
      if (previousIndex >= 0 && sources.some(source => exceptionMatchesReadings(source.previousExceptions, lexical[previousIndex].token))) return true;
      const nextIndex = tokenIndex + 1;
      if (nextIndex < lexical.length
          && sources.some(source => exceptionMatchesReadings(source.exceptions, lexical[nextIndex].token, true))) return true;
    }
    return false;
  }

  function unificationCandidates(pattern, token) {
    const features = pattern.unificationFeatures || {};
    const readings = token.contextualReadings?.length ? token.contextualReadings : [{ lemma: null, tag: null }];
    const candidates = [];
    for (const reading of readings) {
      if (!matchesPatternReading(pattern, token, reading) || reading.tag == null) continue;
      const values = {};
      let valid = true;
      for (const [feature, declaredTypes] of Object.entries(features)) {
        const equivalences = unificationRegexps.get(feature);
        if (!equivalences) { valid = false; break; }
        const types = Array.isArray(declaredTypes) && declaredTypes.length
          ? declaredTypes
          : [...equivalences.keys()];
        values[feature] = types.filter(type => equivalences.get(type)?.test(reading.tag));
        if (!values[feature].length) { valid = false; break; }
      }
      if (valid) candidates.push({ ...values, reading });
    }
    return candidates;
  }

  function hasCoherentUnification(candidatesByToken, featureNames) {
    function search(index, commonValues) {
      if (index === candidatesByToken.length) return true;
      for (const candidate of candidatesByToken[index]) {
        const nextCommon = {};
        let compatible = true;
        for (const feature of featureNames) {
          const existing = commonValues[feature];
          const values = candidate[feature];
          nextCommon[feature] = existing == null ? values : existing.filter(value => values.includes(value));
          if (!nextCommon[feature].length) { compatible = false; break; }
        }
        if (compatible && search(index + 1, nextCommon)) return true;
      }
      return false;
    }
    return candidatesByToken.length >= 2 && search(0, {});
  }

  function matchesRuleUnification(rule, lexical, patternPositions, patternEnds) {
    return matchesPatternUnification(rule.pattern, lexical, patternPositions, patternEnds);
  }

  function matchesPatternUnification(patternTokens, lexical, patternPositions, patternEnds) {
    const unifiedOffsets = [];
    const candidatesByToken = [];
    let featureNames = null;
    let hasCandidates = true;
    for (let offset = 0; offset < patternTokens.length; offset++) {
      const pattern = patternTokens[offset];
      if (!pattern.unified && !pattern.unificationNeutral) continue;
      if (!Number.isInteger(patternPositions[offset])) continue;
      unifiedOffsets.push(offset);
      if (pattern.unificationNeutral) continue;
      const features = Object.keys(pattern.unificationFeatures || {}).sort();
      if (featureNames == null) featureNames = features;
      if (features.join(",") !== featureNames.join(",")) return false;
      const firstIndex = patternPositions[offset];
      const lastIndex = patternEnds[offset] ?? firstIndex;
      for (let tokenIndex = firstIndex; tokenIndex <= lastIndex; tokenIndex++) {
        const candidates = unificationCandidates(pattern, lexical[tokenIndex].token);
        if (!candidates.length) { hasCandidates = false; break; }
        candidatesByToken.push(candidates);
      }
      if (!hasCandidates) break;
    }
    if (unifiedOffsets.length === 0) return true;
    const coherent = hasCandidates && hasCoherentUnification(candidatesByToken, featureNames || []);
    // In LT XML, negate="yes" on the closing element negates the result of
    // the complete unification group, rather than the element's POS matcher.
    return unifiedOffsets.some(offset => patternTokens[offset].unificationNegated) ? !coherent : coherent;
  }

  function getUnificationReadingSets(rule, lexical, patternPositions, patternEnds) {
    const groups = [];
    let featureNames = null;
    for (let offset = 0; offset < rule.pattern.length; offset++) {
      const pattern = rule.pattern[offset];
      if (!pattern.unified || pattern.unificationNeutral) continue;
      const signature = Object.keys(pattern.unificationFeatures || {}).sort();
      if (featureNames == null) featureNames = signature;
      if (signature.join(",") !== featureNames.join(",")) return null;
      const group = [];
      const first = patternPositions[offset];
      const last = patternEnds[offset] ?? first;
      for (let tokenIndex = first; tokenIndex <= last; tokenIndex++) {
        const token = lexical[tokenIndex].token;
        const candidates = unificationCandidates(pattern, token);
        if (!candidates.length) return null;
        group.push({ token, candidates });
      }
      groups.push(group);
    }
    if (groups.length < 2 || !featureNames?.length) return null;
    const selected = new Map();
    for (const group of groups) for (const entry of group) selected.set(entry.token, new Set());
    function search(groupIndex, common, chosen) {
      if (groupIndex === groups.length) {
        for (const choice of chosen) selected.get(choice.token).add(choice.reading);
        return;
      }
      for (const entry of groups[groupIndex]) {
        for (const candidate of entry.candidates) {
          const nextCommon = {};
          let compatible = true;
          for (const feature of featureNames) {
            const values = candidate[feature] || [];
            nextCommon[feature] = common[feature] == null ? values : common[feature].filter(value => values.includes(value));
            if (!nextCommon[feature].length) { compatible = false; break; }
          }
          if (compatible) search(groupIndex + 1, nextCommon, [...chosen, { token: entry.token, reading: candidate.reading }]);
        }
      }
    }
    search(0, {}, []);
    if ([...selected.values()].some(readings => readings.size === 0)) return null;
    return selected;
  }

  function equalReading(a, b) {
    return a.token === b.token && a.lemma === b.lemma && a.tag === b.tag;
  }

  function materializeReading(spec, token) {
    const surface = spec.token == null || spec.token === "" ? token.text : spec.token;
    return {
      token: surface,
      lemma: spec.lemma == null ? surface : spec.lemma,
      tag: spec.tag == null ? null : spec.tag,
      source: "languagetool-xml"
    };
  }

  function record(token, operation, ruleId, extra = {}) {
    analysis.record(token, "languagetool-xml", operation, { ruleId, ...extra });
  }

  function applyAction(rule, matchedTokens, matchedPattern, unifiedReadings = null) {
    const { action, id } = rule;
    if (action === "UNIFY") {
      if (!unifiedReadings) return;
      for (const token of matchedTokens) {
        const keep = unifiedReadings.get(token);
        if (!keep) continue;
        const before = token.contextualReadings.length;
        analysis.replaceReadings(token, token.contextualReadings.filter(reading => keep.has(reading)));
        if (before !== token.contextualReadings.length) {
          record(token, action, id, { removed: before - token.contextualReadings.length });
        }
      }
      return;
    }
    if (action === "REPLACE" && rule.match) {
      const token = matchedTokens[0];
      const expression = compilePortablePosTagRegexp(rule.match.posTag);
      const retained = token.contextualReadings.filter(reading => reading.tag != null && expression.test(reading.tag));
      if (retained.length) {
        const removed = token.contextualReadings.length - retained.length;
        analysis.replaceReadings(token, retained);
        record(token, action, id, { removed, capturedFrom: rule.match.tokenRef });
      }
      return;
    }
    if (action === "REPLACE" && !rule.newReadings?.length && !rule.match) {
      // Mirror LT's POS-only synthesis path: keep the surface, prefer the
      // lemma of the last existing reading with this POS, then fall back to
      // the first reading's lemma. Match-element synthesis stays gated off.
      const token = matchedTokens[0];
      let lemma = null;
      for (const reading of token.contextualReadings) {
        if (reading.tag === rule.disambiguatedPos && reading.lemma != null) lemma = reading.lemma;
      }
      if (!lemma) lemma = token.contextualReadings[0]?.lemma ?? null;
      const reading = { token: token.text, lemma, tag: rule.disambiguatedPos, source: "languagetool-xml" };
      analysis.replaceReadings(token, [reading]);
      record(token, action, id, { lemma: reading.lemma, tag: reading.tag });
      return;
    }
    if (action === "ADD" || action === "REPLACE" || action === "ADDCHUNK") {
      // LanguageTool leaves the sentence unchanged when an explicit reading
      // list does not cover the marked action span exactly.
      if (!Array.isArray(rule.newReadings) || rule.newReadings.length !== matchedTokens.length) return;
      for (let i = 0; i < matchedTokens.length; i++) {
        const token = matchedTokens[i];
        const spec = rule.newReadings[i];
        if (action === "ADD") {
          const reading = materializeReading(spec, token);
          if (!token.contextualReadings.some(existing => equalReading(existing, reading))) {
            const unknownIndex = token.contextualReadings.findLastIndex(existing => existing.tag == null);
            if (unknownIndex >= 0 && reading.tag != null) token.contextualReadings.splice(unknownIndex, 1);
            token.contextualReadings.push(reading);
            token.readings = token.contextualReadings;
            record(token, action, id, { lemma: reading.lemma, tag: reading.tag });
          }
        } else if (action === "REPLACE") {
          const reading = materializeReading(spec, token);
          analysis.replaceReadings(token, [reading]);
          record(token, action, id, { lemma: reading.lemma, tag: reading.tag });
        } else if (spec.tag && !token.chunkTags.includes(spec.tag)) {
          analysis.addChunkTag(token, spec.tag);
          record(token, action, id, { tag: spec.tag });
        }
      }
      return;
    }

    if (action === "REMOVE") {
      if (rule.newReadings?.length) {
        if (rule.newReadings.length !== matchedTokens.length) return;
        for (let i = 0; i < matchedTokens.length; i++) {
          const token = matchedTokens[i];
          const spec = rule.newReadings[i];
          const target = {
            token: spec.token == null || spec.token === "" ? token.text : spec.token,
            lemma: spec.lemma,
            tag: spec.tag
          };
          const before = token.contextualReadings.length;
          token.contextualReadings = token.contextualReadings.filter(reading => !(
            reading.token === target.token
            && (target.lemma == null || reading.lemma === target.lemma)
            && (target.tag == null || reading.tag === target.tag)
            && !(token.modelProperName && reading.tag === "NNP")
          ));
          if (before > 0 && token.contextualReadings.length === 0) {
            token.contextualReadings.push({ token: token.text, lemma: null, tag: null, source: "languagetool-xml" });
          }
          token.readings = token.contextualReadings;
          if (token.preDisambiguationShared) token.preDisambiguationReadings = token.contextualReadings;
          if (before !== token.contextualReadings.length) record(token, action, id, { removed: before - token.contextualReadings.length });
        }
      } else {
        const token = matchedTokens[0];
        const before = token.contextualReadings.length;
        const expression = compilePortablePosTagRegexp(rule.disambiguatedPos);
        token.contextualReadings = token.contextualReadings.filter(reading => reading.tag == null
          || !expression.test(reading.tag) || token.modelProperName && reading.tag === "NNP");
        if (before > 0 && token.contextualReadings.length === 0) {
          token.contextualReadings.push({ token: token.text, lemma: null, tag: null, source: "languagetool-xml" });
        }
        token.readings = token.contextualReadings;
        if (token.preDisambiguationShared) token.preDisambiguationReadings = token.contextualReadings;
        if (before !== token.contextualReadings.length) record(token, action, id, { removed: before - token.contextualReadings.length });
      }
      return;
    }

    if (action === "FILTER") {
      // LanguageTool only applies FILTER when at least one existing reading
      // matches disambiguatedPos. In that branch it retains matching readings;
      // synthesis fallback is therefore unreachable and is intentionally not
      // approximated here.
      const token = matchedTokens[0];
      const expression = compilePortablePosTagRegexp(rule.disambiguatedPos);
      const retained = token.contextualReadings.filter(reading => reading.tag != null
        && (expression.test(reading.tag) || token.modelProperName && reading.tag === "NNP"));
      if (retained.length) {
        const before = token.contextualReadings.length;
        analysis.replaceReadings(token, retained);
        if (before !== retained.length) record(token, action, id, { removed: before - retained.length });
      }
      return;
    }

    if (action === "FILTERALL") {
      // Each POS expression has already been proven present by the matched pattern,
      // so LanguageTool's synthesizer fallback cannot be reached.
      for (let i = 0; i < matchedTokens.length; i++) {
        const token = matchedTokens[i];
        const pattern = matchedPattern[i];
        // A text-only pattern element carries no POS restriction for the
        // FILTERALL synthesizer; it cannot narrow the existing analyses.
        if (!pattern.posTag) continue;
        const regexp = compiledPosTagRegexps.get(pattern);
        const retained = token.contextualReadings.filter(reading => reading.tag != null
          && (regexp ? regexp.test(reading.tag) : reading.tag === pattern.posTag));
        if (!retained.length) continue;
        const before = token.contextualReadings.length;
        analysis.replaceReadings(token, retained);
        if (before !== retained.length) record(token, action, id, { removed: before - retained.length });
      }
      return;
    }

    if (action === "IMMUNIZE" || action === "IGNORE_SPELLING") {
      for (const token of matchedTokens) {
        const key = action === "IMMUNIZE" ? "immunized" : "ignoredBySpeller";
        if (!token[key]) {
          token[key] = true;
          record(token, action, id, { value: true });
        }
      }
    }
  }

  function hasOverlappingAntiPattern(rule, lexical, ruleStart, ruleEnd, trace = null) {
    for (const antiPattern of rule.antiPatterns || []) {
      const pattern = antiPattern.pattern;
      for (let start = 0; start <= ruleEnd && start < lexical.length; start++) {
        const failureTrace = trace ? [] : null;
        const found = matchSequenceAt(pattern, lexical, start, failureTrace);
        if (trace && failureTrace.length && trace.length < 100) trace.push({ id: antiPattern.id, failed: failureTrace[0] });
        if (found) {
          const overlaps = found.start <= ruleEnd && found.end >= ruleStart;
          if (trace && trace.length < 100) trace.push({ id: antiPattern.id, start: found.start, end: found.end, overlaps });
          if (overlaps) return true;
        }
      }
    }
    return false;
  }

  function isAttributivePluralNoun(rule, lexical, matchedPositions) {
    // VBZNNS_NNS normally reads an -s form as a third-person verb before a
    // singular noun. Protect plural nouns used attributively inside a larger
    // determiner-led noun phrase (e.g. “a new services industry group”).
    // The upstream anti-pattern only spans a short, two-word compound; this
    // structural check covers longer noun compounds without lexical lists.
    if (!/^VBZNNS_NNS\[\d+\]$/u.test(rule.id)) return false;
    const index = matchedPositions[0];
    if (!Number.isInteger(index)) return false;
    const isNp = token => (token.chunkTags || []).some(tag => /^(?:B|I|E)-NP(?:-|$)/u.test(tag));
    const isBegin = token => (token.chunkTags || []).some(tag => /^B-NP(?:-|$)/u.test(tag));
    const isEnd = token => (token.chunkTags || []).some(tag => /^E-NP(?:-|$)/u.test(tag));
    const readings = token => token.contextualReadings || token.readings || [];
    const isDeterminer = token => readings(token).some(reading => /^(?:DT|PRP\$)$/u.test(reading.tag || ""));
    const isNoun = token => readings(token).some(reading => /^NN/u.test(reading.tag || ""));
    if (!isNp(lexical[index].token) || isEnd(lexical[index].token)) return false;
    let begin = index;
    while (begin > 0 && isNp(lexical[begin - 1].token) && !isBegin(lexical[begin].token)) begin--;
    if (!lexical.slice(begin, index).some(row => isDeterminer(row.token))) return false;
    let sawFollowingNoun = false;
    for (let cursor = index + 1; cursor < lexical.length && isNp(lexical[cursor].token); cursor++) {
      if (isNoun(lexical[cursor].token)) sawFollowingNoun = true;
      if (isEnd(lexical[cursor].token)) return sawFollowingNoun;
    }
    return false;
  }

  function matchSequenceAt(pattern, lexical, start, trace = null) {
    const positions = new Array(pattern.length).fill(null);
    const ends = new Array(pattern.length).fill(null);
    const optionalCount = pattern.filter(token => token.minOccurrence === 0).length;
    let skipShiftTotal = 0;
    let skippedOptionalCount = 0;
    let previousSkip = 0;
    for (let offset = 0; offset < pattern.length; offset++) {
      const patternToken = pattern[offset];
      const nextPosition = start + offset + skipShiftTotal - skippedOptionalCount;
      const remainingPattern = pattern.length - offset;
      if (previousSkip + nextPosition >= lexical.length || previousSkip < 0) {
        previousSkip = lexical.length - (nextPosition + 1);
      }
      const maxPosition = Math.min(nextPosition + previousSkip, lexical.length - remainingPattern + optionalCount);
      let found = null;
      let wasSkipped = false;
      let previousScopeNextExceptionSeen = false;
      for (let candidate = nextPosition; candidate <= maxPosition; candidate++) {
        if (previousScopeNextExceptionSeen) continue;
        // LT evaluates XML antipatterns through PatternRuleMatcher, which
        // rejects immunized tokens before testing readings. The main
        // disambiguation matcher does not use that veto, so keep it local to
        // this anti-pattern search.
        if (lexical[candidate].token.immunized) continue;
        if (offset > 0 && previousSkip !== 0
            && exceptionMatchesReadings(pattern[offset - 1].exceptions, lexical[candidate].token, true)) {
          previousScopeNextExceptionSeen = true;
          continue;
        }
        const currentMatches = matchesPatternToken(patternToken, lexical[candidate].token);
        if (patternToken.minOccurrence === 0) {
          for (let nextOffset = offset + 1; nextOffset < pattern.length; nextOffset++) {
            if (matchesPatternToken(pattern[nextOffset], lexical[candidate].token)) {
              wasSkipped = true;
              skippedOptionalCount++;
              break;
            }
            if (pattern[nextOffset].minOccurrence > 0) break;
          }
          if (wasSkipped) break;
        }
        if (!currentMatches) continue;
        found = candidate;
        let lastFound = candidate;
        for (let repeat = 1; repeat < patternToken.maxOccurrence
            && candidate + repeat < lexical.length - (pattern.length - offset - 1); repeat++) {
          const repeatedCandidate = candidate + repeat;
          if (previousSkip !== 0
              && exceptionMatchesReadings(pattern[offset - 1]?.exceptions, lexical[repeatedCandidate].token, true)) {
            previousScopeNextExceptionSeen = true;
            break;
          }
          if (!matchesPatternToken(patternToken, lexical[repeatedCandidate].token)) break;
          lastFound = repeatedCandidate;
        }
        ends[offset] = lastFound;
        skipShiftTotal += lastFound - nextPosition;
        previousSkip = patternToken.skipNext || 0;
        break;
      }
      if (wasSkipped) continue;
      if (found == null) {
        if (trace) {
          const actual = lexical[nextPosition]?.token;
          trace.push({ start, offset, expected: { text: patternToken.text, posTag: patternToken.posTag,
            textConstrained: patternToken.textConstrained }, actual: actual ? { text: actual.text,
            tags: (actual.contextualReadings || []).map(reading => reading.tag) } : null });
        }
        return null;
      }
      positions[offset] = found;
      if (ends[offset] == null) ends[offset] = found;
    }
    if (!matchesPatternUnification(pattern, lexical, positions, ends)) return null;
    const firstMatched = positions.findIndex(Number.isInteger);
    const lastMatched = positions.findLastIndex(Number.isInteger);
    if (firstMatched < 0 || hasRuleException({ pattern }, lexical, positions)) return null;
    return { start: positions[firstMatched], end: ends[lastMatched] };
  }

  function disambiguate(tokens, { traceMatches = false, traceRuleIds = null, morphology = null } = {}) {
    // LanguageTool runs each sentence with an artificial SENT_START token at index 0.
    // Keep it in the matching window so leading wildcard PatternTokens behave like upstream.
    const sentenceStart = {
      text: "",
      kind: "sentence-start",
      whitespaceBefore: false,
      contextualReadings: [{ token: "", lemma: null, tag: "SENT_START" }],
      readings: [{ token: "", lemma: null, tag: "SENT_START" }],
      chunkTags: [],
      contextTrace: [],
      immunized: false,
      ignoredBySpeller: false
    };
    const lexical = [{ token: sentenceStart, index: -1 }, ...tokens.map((token, index) => ({ token, index }))]
      .filter(row => !isSpace(row.token));
    let matches = 0;
    const matchedRuleIds = traceMatches ? [] : null;
    const rejectedRuleEvents = traceMatches ? [] : null;
    const traceIds = traceMatches && Array.isArray(traceRuleIds) ? new Set(traceRuleIds) : null;
    const tracedRuleEvents = traceIds?.size ? [] : null;
    for (const rule of rules) {
      const pattern = rule.pattern;
      const optionalCount = pattern.filter(token => token.minOccurrence === 0).length;
      for (let start = 0; start < lexical.length; start++) {
        const patternPositions = new Array(pattern.length).fill(null);
        const patternEnds = new Array(pattern.length).fill(null);
        let skipShiftTotal = 0;
        let skippedOptionalCount = 0;
        let previousSkip = 0;
        let matched = true;
        for (let offset = 0; offset < pattern.length; offset++) {
          const patternToken = pattern[offset];
          const nextPosition = start + offset + skipShiftTotal - skippedOptionalCount;
          const remainingPattern = pattern.length - offset;
          if (previousSkip + nextPosition >= lexical.length || previousSkip < 0) {
            previousSkip = lexical.length - (nextPosition + 1);
          }
          const maxPosition = Math.min(
            nextPosition + previousSkip,
            lexical.length - remainingPattern + optionalCount
          );
          let found = null;
          let wasSkipped = false;
          let previousScopeNextExceptionSeen = false;
          for (let candidate = nextPosition; candidate <= maxPosition; candidate++) {
            if (previousScopeNextExceptionSeen) continue;
            if (offset > 0 && previousSkip !== 0
                && exceptionMatchesReadings(pattern[offset - 1].exceptions, lexical[candidate].token, true)) {
              // LT carries this veto across the remaining candidate positions
              // for the current pattern element while scanning a skip window.
              previousScopeNextExceptionSeen = true;
              continue;
            }
            const resolvedPattern = resolveReferencePattern(patternToken, offset, candidate, patternPositions, lexical);
            const currentMatches = Boolean(resolvedPattern && matchesPatternToken(resolvedPattern, lexical[candidate].token));
            if (patternToken.minOccurrence === 0) {
              for (let nextOffset = offset + 1; nextOffset < pattern.length; nextOffset++) {
                if (matchesPatternToken(pattern[nextOffset], lexical[candidate].token)) {
                  wasSkipped = true;
                  skippedOptionalCount++;
                  break;
                }
                if (pattern[nextOffset].minOccurrence > 0) break;
              }
              if (wasSkipped) break;
            }
            if (!currentMatches) continue;
            found = candidate;
            let lastFound = candidate;
            const maximumOccurrences = patternToken.maxOccurrence;
            for (let repeat = 1; repeat < maximumOccurrences
                && candidate + repeat < lexical.length - (pattern.length - offset - 1); repeat++) {
              const repeatedCandidate = candidate + repeat;
              // Match LanguageTool's skipMaxTokens behavior: greedily consume
              // repeated occurrences up to max, without backtracking when a
              // repeated token could also satisfy the following pattern token.
              if (previousScopeNextExceptionSeen) break;
              if (offset > 0 && previousSkip !== 0
                  && exceptionMatchesReadings(pattern[offset - 1].exceptions, lexical[repeatedCandidate].token, true)) {
                previousScopeNextExceptionSeen = true;
                break;
              }
              if (!matchesPatternToken(patternToken, lexical[repeatedCandidate].token)) break;
              lastFound = repeatedCandidate;
            }
            patternEnds[offset] = lastFound;
            const skipShift = lastFound - nextPosition;
            skipShiftTotal += skipShift;
            previousSkip = patternToken.skipNext || 0;
            break;
          }
          if (wasSkipped) continue;
          if (found == null) {
            matched = false;
            break;
          }
          patternPositions[offset] = found;
          if (patternEnds[offset] == null) patternEnds[offset] = found;
        }
        const lastMatchedPattern = patternPositions.findLastIndex(Number.isInteger);
        const unifiedReadings = rule.action === "UNIFY" && matched
          ? getUnificationReadingSets(rule, lexical, patternPositions, patternEnds)
          : null;
        const unificationMatches = rule.action === "UNIFY"
          ? matched && unifiedReadings != null
          : matchesRuleUnification(rule, lexical, patternPositions, patternEnds);
        const exceptionBlocked = matched && unificationMatches && hasRuleException(rule, lexical, patternPositions);
        const antiTrace = traceIds?.has(rule.id) ? [] : null;
        const antiPatternBlocked = matched && unificationMatches && !exceptionBlocked
          && hasOverlappingAntiPattern(rule, lexical, patternPositions[0], patternEnds[lastMatchedPattern], antiTrace);
        const attributiveNounBlocked = matched && unificationMatches && !exceptionBlocked && !antiPatternBlocked
          && isAttributivePluralNoun(rule, lexical, patternPositions);
        if (tracedRuleEvents && tracedRuleEvents.length < 100 && traceIds.has(rule.id)) {
          tracedRuleEvents.push({ id: rule.id, start, positions: [...patternPositions], ends: [...patternEnds], matched, unificationMatches,
            exceptionBlocked, antiPatternBlocked, attributiveNounBlocked,
            antiMatches: antiTrace,
            reason: !matched ? "pattern" : !unificationMatches ? "unification"
              : exceptionBlocked ? "exception" : antiPatternBlocked ? "antipattern"
                : attributiveNounBlocked ? "attributive-noun-compound" : "applied" });
        }
        if (!matched || !unificationMatches || exceptionBlocked || antiPatternBlocked || attributiveNounBlocked) {
          if (rejectedRuleEvents && /^verb_reflexiu(?:_simple)?\[/.test(rule.id)
              && patternPositions.some(Number.isInteger)) {
            rejectedRuleEvents.push({ id: rule.id, positions: patternPositions, reason: !matched ? "pattern" : !unificationMatches ? "unification" : exceptionBlocked ? "exception" : "antipattern" });
          }
          continue;
        }
        if (rule.filterClass && !englishFilterMatches(rule, patternPositions, lexical, morphology)) continue;
        const span = actionSpan(rule);
        const actionStart = patternPositions[span.start];
        const lastActionPattern = patternPositions.findLastIndex((position, index) => index < span.end && index >= span.start
          && Number.isInteger(position));
        const actionEnd = patternEnds[lastActionPattern] + 1;
        const matchedTokens = lexical.slice(actionStart, actionEnd).map(row => row.token);
        const matchedPattern = pattern.slice(span.start, span.end);
        applyAction(rule, matchedTokens, matchedPattern, unifiedReadings);
        matches++;
        if (matchedRuleIds) matchedRuleIds.push(rule.id);
      }
    }
    return { tokens, matches, loadedRules: rules.length,
      ...(matchedRuleIds ? { matchedRuleIds, rejectedRuleEvents } : {}),
      ...(tracedRuleEvents ? { tracedRuleEvents } : {}) };
  }

  function clear() { rules = []; englishWordTags = {}; excludedRuleIds = []; }

  function validateRule(rule, definitions = unificationDefinitions) {
    const previous = unificationDefinitions;
    unificationDefinitions = definitions || {};
    try { assertRule(rule); return true; }
    finally { unificationDefinitions = previous; }
  }
  function getDiagnostics() { return { profile: "en-US", sourceSha256: EXPECTED_SOURCE_HASH, loadedRules: rules.length, upstreamRules: 1018, excludedByPortabilityGate: excludedRuleIds.length, excludedRuleIds: [...excludedRuleIds] }; }

  globalThis.CorrectorEnglishXmlDisambiguator = Object.freeze({ load, disambiguate, clear, validateRule, getDiagnostics });
})();
