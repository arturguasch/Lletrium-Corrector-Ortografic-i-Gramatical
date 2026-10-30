// nDet[6] removes the Balearic determiner reading of standalone "sa". It is
// required to keep central-Catalan analyses from interpreting that form as a
// central article; retaining the rule does not enable Balearic suggestions.
const CENTRAL_PROFILE_EXCLUSIONS = new Set();
const SUPPORTED_ACTIONS = new Set(["ADD", "FILTER", "FILTERALL", "REMOVE", "REPLACE", "ADDCHUNK", "IMMUNIZE", "IGNORE_SPELLING", "UNIFY"]);
// LanguageTool resources also use lowercase internal POS markers such as
// _english_ignore_ and _reflexiu; these are literal tag identifiers.
const POS_TAG = /^[A-Za-z0-9_:]+$/u;
const LITERAL_POS_TAG = /^[A-Za-z0-9_:|]+$/u;
const JAVASCRIPT_REGEX_ESCAPES = new Set(["\\", ".", "^", "$", "|", "?", "*", "+", "(", ")", "[", "]", "{", "}", "-", "/"]);
// These names are the only language-specific part of the generic feature
// gate: Catalan uses nombre/genere; Spanish uses numero/genero.
const SUPPORTED_UNIFICATION_FEATURES = new Set(["nombre", "genere", "numero", "genero", "persona"]);

function isSupportedUnification(token) {
  if (!token?.unified
      || !isSupportedOccurrenceRange(token, 1, 3) || token.skipNext && !isSupportedSkipNext(token.skipNext)) return false;
  if (token.unificationNeutral) return true;
  const features = token.unificationFeatures;
  return Boolean(features && Object.keys(features).length > 0
    && Object.entries(features).every(([feature, types]) => SUPPORTED_UNIFICATION_FEATURES.has(feature)
      && Array.isArray(types) && types.every(type => typeof type === "string")));
}

function isSupportedReference(token, index, pattern) {
  const ref = token?.match;
  return Boolean(token?.referenceElement && ref && Number.isInteger(ref.tokenRef)
    && ref.tokenRef >= 0 && ref.tokenRef <= index && ref.caseConversion === "NONE"
    && ref.includeSkipped === "NONE" && ref.posTag === "" && !ref.posTagRegexp && !ref.lemma
    && token.textConstrained && typeof token.text === "string"
    && (token.regexp ? token.text === `\\${ref.tokenRef}` : token.text.includes(`\\${ref.tokenRef}`))
    && token.minOccurrence === 1 && token.maxOccurrence === 1 && !token.skipNext
    && pattern[ref.tokenRef]?.minOccurrence === 1 && pattern[ref.tokenRef]?.maxOccurrence === 1
    && !pattern[ref.tokenRef]?.skipNext);
}

function isSupportedSelfReplacementCapture(rule, actionStart) {
  const match = rule?.match;
  return rule?.action === "REPLACE" && !rule.newReadings?.length
    // LanguageTool's compiled `no` reference is one-based, while marker
    // corrections are zero-based. Depending on whether the match is expressed
    // against the marker or full pattern, the same marked token is represented
    // by either value at this boundary.
    && match && Number.isInteger(match.tokenRef)
    && (match.tokenRef === actionStart || match.tokenRef === actionStart + 1)
    && match.posTagRegexp && isPortablePosTagRegexp(match.posTag)
    && !match.lemma && match.caseConversion === "NONE"
    && match.includeSkipped === "NONE" && !match.regexMatch && !match.regexReplace
    && !match.posTagReplace && !match.setPos && !match.suppressMisspelled;
}

function isPortablePosTagRegexp(expression) {
  if (typeof expression !== "string" || !expression || !/^[A-Za-z0-9_:,.*+?()[\]{}|^$\\<>-]+$/u.test(expression)) return false;
  try { new RegExp(`^(?:${expression})$`, "iu"); return true; }
  catch { return false; }
}

function translatePortableJavaDot(expression) {
  let translated = "";
  let inCharacterClass = false;
  let nestedCharacterClassDepth = 0;
  for (let index = 0; index < expression.length; index++) {
    const char = expression[index];
    if (char === "\\" && expression[index + 1] === "=") {
      // Java treats \\= as a literal equals sign; JavaScript rejects that
      // identity escape in Unicode mode, so normalize it to the same literal.
      translated += "=";
      index++;
    }
    else if (char === "\\" && index + 1 < expression.length) {
      const escaped = expression[++index];
      // Java regex permits escaping punctuation such as `\,`; JavaScript's
      // Unicode mode rejects identity escapes. Preserve the literal character.
      translated += /[A-Za-z0-9]/u.test(escaped) || JAVASCRIPT_REGEX_ESCAPES.has(escaped) ? `\\${escaped}` : escaped;
    }
    else if (char === "[" && !inCharacterClass) { inCharacterClass = true; translated += char; }
    else if (char === "[" && inCharacterClass) { nestedCharacterClassDepth++; }
    else if (char === "]" && inCharacterClass && nestedCharacterClassDepth > 0) { nestedCharacterClassDepth--; }
    else if (char === "]" && inCharacterClass) { inCharacterClass = false; translated += char; }
    else if (char === "." && !inCharacterClass) translated += "[^\\n\\r\\u0085\\u2028\\u2029]";
    else translated += char;
  }
  return translated;
}

function splitPortableTopLevelAlternatives(expression) {
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
  return splitPortableTopLevelAlternatives(expression).map(branch => {
    const hasInlineDisable = branch.includes("(?-i)");
    if (hasInlineDisable && (!branch.startsWith("(?-i)") || branch.indexOf("(?-i)", 1) >= 0)) return null;
    const source = hasInlineDisable ? branch.slice(5) : branch;
    if (/\(\?(?:[imsUdx-]|<)/u.test(source)) return null;
    return { source, sensitive: Boolean(caseSensitive || hasInlineDisable) };
  });
}

function isPortableSurfaceRegexp(expression, caseSensitive = false) {
  if (typeof expression !== "string" || !expression || expression.length > 50000
      || /\\(?:A|Z|z|G|Q|E|h|H|R|X|e|c|s|S|w|W|b|B|v|[1-9])/u.test(expression)
      || /\\x\{/u.test(expression) || /&&/u.test(expression)
      || /(?:[*+?]|\{[0-9]+(?:,[0-9]*)?\})\+/u.test(expression)
      || /\\p\{(?:Is|In|java)/iu.test(expression)) return false;
  const alternatives = portableSurfaceAlternativeModes(expression, caseSensitive);
  if (!alternatives?.length || alternatives.some(item => !item)) return false;
  try {
    for (const alternative of alternatives) new RegExp(`^(?:${translatePortableJavaDot(alternative.source)})$`, alternative.sensitive ? "u" : "iu");
    return true;
  }
  catch { return false; }
}

function hasPortableWhitespaceData(token) {
  return typeof token?.whitespaceConstrained === "boolean"
    || Boolean(token?.matchesWithoutWhitespace || token?.matchesWithWhitespace);
}

function isPortableLiteralPosTag(value) {
  // Without posTagRegexp, LanguageTool compares the POS value literally.
  // A pipe is data here, not a regular-expression alternation operator.
  return typeof value === "string" && LITERAL_POS_TAG.test(value);
}

function isSupportedException(token) {
  const sentenceStartException = token?.sentenceStart && !token.textConstrained && !token.text
    && token.posTag === "SENT_START" && !token.posTagRegexp;
  if (!token || token.hasPreviousException || token.sentenceStart && !sentenceStartException
      || (token.textConstrained && token.regexp && !isPortableSurfaceRegexp(token.text, token.caseSensitive))
      || token.minOccurrence !== 1 || token.maxOccurrence !== 1
      || token.skipNext || token.referenceElement || token.andGroup?.length || token.orGroup?.length
      || token.unified || token.unificationFeatures || token.unificationNegated || token.unificationNeutral
      || token.phraseName || token.previousExceptions?.length || token.exceptions?.length
      || token.chunkTag != null && (typeof token.chunkTag !== "string" || !token.chunkTag)
      ) return false;
  if (token.textConstrained && (typeof token.text !== "string" || !token.text.length)) return false;
  if (token.posTag && !(token.posTagRegexp ? isPortablePosTagRegexp(token.posTag) : isPortableLiteralPosTag(token.posTag))) return false;
  return Boolean(token.textConstrained || token.posTag || token.chunkTag);
}

function isSupportedSkipNext(value) {
  return Number.isInteger(value) && value >= -1;
}

function isSupportedOccurrenceRange(token, index, patternLength) {
  const validBounds = (token.minOccurrence === 0 || token.minOccurrence === 1)
    && Number.isInteger(token.maxOccurrence) && token.maxOccurrence >= 1 && token.maxOccurrence <= 16;
  return validBounds && !(token.minOccurrence === 0 && (index === 0 || index === patternLength - 1));
}

function isSupportedAndGroupMember(token) {
  if (!token || token.hasNextException || token.hasPreviousException || token.sentenceStart
      || (token.textConstrained && token.regexp && !isPortableSurfaceRegexp(token.text, token.caseSensitive))
      || token.minOccurrence !== 1 || token.maxOccurrence !== 1
      || token.skipNext || token.referenceElement
      || token.andGroup?.length || token.orGroup?.length
      || token.phraseName || !hasPortableWhitespaceData(token)) return false;
  if (token.textConstrained && (typeof token.text !== "string" || !token.text.length)) return false;
  if (token.posTag && !(token.posTagRegexp ? isPortablePosTagRegexp(token.posTag) : isPortableLiteralPosTag(token.posTag))) return false;
  if ((token.exceptions || []).some(exception => !isSupportedException(exception))) return false;
  if ((token.previousExceptions || []).some(exception => !isSupportedException(exception))) return false;
  return Boolean(token.textConstrained || token.posTag || token.chunkTag);
}

function isSupportedAntiPattern(antiPattern) {
  if (!Array.isArray(antiPattern?.pattern) || antiPattern.pattern.length === 0) return false;
  const validTokens = antiPattern.pattern.every((token, index) => {
    // Anti-patterns are vetoes for an otherwise valid primary match. Keep their
    // span deterministic until the matcher reproduces LanguageTool's optional /
    // repeated-token backtracking semantics exactly; overmatching here silently
    // suppresses unrelated disambiguation rules.
    if (!token || !isSupportedOccurrenceRange(token, index, antiPattern.pattern.length)
        || token.skipNext && !isSupportedSkipNext(token.skipNext)
        || token.referenceElement || token.orGroup?.length
        || token.chunkTag != null && (typeof token.chunkTag !== "string" || !token.chunkTag)
        || (token.unified || token.unificationFeatures || token.unificationNegated || token.unificationNeutral)
          && !isSupportedUnification(token)
        || token.phraseName || token.match || !hasPortableWhitespaceData(token)
        || token.textConstrained && (typeof token.text !== "string" || !token.text.length)
        || token.textConstrained && token.regexp && !isPortableSurfaceRegexp(token.text, token.caseSensitive)
        || token.posTagRegexp && !isPortablePosTagRegexp(token.posTag)
        || token.posTag && !token.posTagRegexp && !isPortableLiteralPosTag(token.posTag)
        || (token.exceptions || []).some(exception => !isSupportedException(exception))
        || (token.previousExceptions || []).some(exception => !isSupportedException(exception))
        || (token.andGroup || []).some(member => !isSupportedAndGroupMember(member))) return false;
    if (token.sentenceStart && (index !== 0 || token.textConstrained || token.text || token.posTag !== "SENT_START")) return false;
    return true;
  });
  if (!validTokens) return false;
  const unifiedTokens = antiPattern.pattern.filter(token => token.unified && !token.unificationNeutral);
  if (unifiedTokens.length > 0) {
    if (unifiedTokens.length < 2) return false;
    const signature = Object.keys(unifiedTokens[0].unificationFeatures || {}).sort().join(",");
    if (unifiedTokens.some(token => Object.keys(token.unificationFeatures || {}).sort().join(",") !== signature)) return false;
  }
  return true;
}

export function getDisambiguationRuleBlockers(rule) {
  const blockers = new Set();
  const add = code => blockers.add(code);
  // noVerbBalear removes ambiguous regional verb readings; it is needed
  // for central Catalan as well as for the upstream default pipeline.
  if (CENTRAL_PROFILE_EXCLUSIONS.has(rule.id)) add("central-profile-exclusion");
  if (!SUPPORTED_ACTIONS.has(rule.action)) add(`unsupported-action:${rule.action}`);
  if (rule.filterClass && !isSupportedEnglishWordFilter(rule)) add(`auxiliary-filter:${rule.filterClass}`);
  if (rule.antiPatterns?.length && !rule.antiPatterns.every(isSupportedAntiPattern)) add("anti-pattern");
  if (rule.match && !isSupportedSelfReplacementCapture(rule, rule.startPositionCorrection)) add("rule-level-match-capture");
  if (!Number.isInteger(rule.startPositionCorrection) || !Number.isInteger(rule.endPositionCorrection)) add("invalid-position-correction");
  if (!Array.isArray(rule.pattern) || rule.pattern.length === 0) add("empty-pattern");
  if (rule.disambiguatedPos && !POS_TAG.test(rule.disambiguatedPos)
      && !(["FILTER", "REMOVE"].includes(rule.action) && isPortablePosTagRegexp(rule.disambiguatedPos))) add("unsupported-disambiguated-pos");
  if (!Array.isArray(rule.pattern) || !rule.pattern.length) return [...blockers].sort();

  const actionStart = rule.startPositionCorrection;
  const actionEnd = rule.pattern.length + rule.endPositionCorrection;
  const hasExplicitMarker = rule.pattern.some(token => token.insideMarker);
  if (!Number.isInteger(actionStart) || !Number.isInteger(actionEnd)
      || actionStart < 0 || actionEnd > rule.pattern.length || actionEnd <= actionStart
      || (hasExplicitMarker && rule.pattern.some((token, index) => token.insideMarker !== (index >= actionStart && index < actionEnd)))) {
    add("marker-action-span");
  }

  for (const [index, token] of rule.pattern.entries()) {
    const at = `pattern[${index}]`;
    if (token.sentenceStart && (index !== 0 || token.textConstrained || token.text || token.posTag !== "SENT_START")) {
      add(`${at}:sentence-start`);
    }
    if (token.textConstrained && token.regexp && !token.referenceElement && !isPortableSurfaceRegexp(token.text, token.caseSensitive)) add(`${at}:nonportable-surface-regexp`);
    if (token.posTagRegexp && !isPortablePosTagRegexp(token.posTag)) add(`${at}:nonportable-pos-regexp`);
    if (token.textConstrained && (typeof token.text !== "string" || !token.text.length)) add(`${at}:empty-text-constraint`);
    if ((token.minOccurrence !== 1 || token.maxOccurrence !== 1)
        && !isSupportedOccurrenceRange(token, index, rule.pattern.length)) add(`${at}:occurrence-range`);
    if (token.skipNext && !isSupportedSkipNext(token.skipNext)) add(`${at}:skip-next`);
    if (token.chunkTag != null && (typeof token.chunkTag !== "string" || !token.chunkTag)) add(`${at}:chunk-tag`);
    if (token.referenceElement && !isSupportedReference(token, index, rule.pattern)) add(`${at}:reference-element`);
    if (token.orGroup?.length) add(`${at}:or-group`);
    if ((token.unified || token.unificationFeatures || token.unificationNegated || token.unificationNeutral)
        && !isSupportedUnification(token)) add(`${at}:unification`);
    if (token.phraseName) add(`${at}:phrase-name`);
    if (!hasPortableWhitespaceData(token)) add(`${at}:whitespace-metadata`);
    if (token.posTag && !token.posTagRegexp && !isPortableLiteralPosTag(token.posTag)) add(`${at}:invalid-pos-tag`);
    if ((token.exceptions || []).some(exception => !isSupportedException(exception))) add(`${at}:exception`);
    if ((token.previousExceptions || []).some(exception => !isSupportedException(exception))) add(`${at}:previous-exception`);
    if ((token.andGroup || []).some(member => !isSupportedAndGroupMember(member))) add(`${at}:and-group`);
  }

  const unificationTokens = rule.pattern.filter(token => token.unified && !token.unificationNeutral);
  if (unificationTokens.length > 0) {
    if (unificationTokens.length < 2) add("unification");
    else {
      const featureSignature = Object.keys(unificationTokens[0].unificationFeatures || {}).sort().join(",");
      if (unificationTokens.some(token => Object.keys(token.unificationFeatures || {}).sort().join(",") !== featureSignature)) add("unification");
    }
  }

  const actionLength = actionEnd - actionStart;
  if (rule.action === "UNIFY" && (rule.newReadings?.length
      || rule.pattern.slice(actionStart, actionEnd).some(token => !token.unified || token.unificationNeutral
        || token.unificationNegated || token.minOccurrence !== 1 || token.maxOccurrence !== 1 || token.skipNext))) {
    add("unify-action-span");
  }
  if (rule.action === "FILTERALL" && rule.pattern.slice(actionStart, actionEnd).some(token => token.skipNext
      || token.minOccurrence !== 1 || token.maxOccurrence !== 1)) add("filterall-variable-span");
  if (rule.action === "FILTER" && !isPortablePosTagRegexp(rule.disambiguatedPos)) add("filter-target-not-proven");
  if (rule.action === "FILTERALL" && !rule.pattern.slice(actionStart, actionEnd).every(token =>
    token.posTag ? isPortablePosTagRegexp(token.posTag) : token.textConstrained)) add("filterall-target-not-proven");
  if (rule.action === "REMOVE" && !rule.newReadings?.length && !rule.disambiguatedPos) add("remove-target-unspecified");
  // POS-only REPLACE is portable when the rule has no <match> capture: LT
  // replaces the first action token with one reading carrying disambiguatedPos.
  if (rule.action === "REPLACE" && !rule.newReadings?.length && rule.match
      && !isSupportedSelfReplacementCapture(rule, actionStart)) add("replace-match-capture-unimplemented");
  if (rule.action === "REPLACE" && !rule.newReadings?.length
      && !isSupportedSelfReplacementCapture(rule, actionStart)
      && (!rule.disambiguatedPos || !POS_TAG.test(rule.disambiguatedPos))) add("replace-pos-target-not-exact");
  return [...blockers].sort();
}

function isSupportedEnglishWordFilter(rule) {
  if (rule.filterClass !== "org.languagetool.rules.IsEnglishWordFilter" || typeof rule.filterArguments !== "string") return false;
  const args = Object.fromEntries(rule.filterArguments.trim().split(/\s+/u).map(part => {
    const separator = part.indexOf(":");
    return separator > 0 ? [part.slice(0, separator), part.slice(separator + 1)] : [part, ""];
  }));
  const positions = args.formPositions?.split(",") || [];
  if (!positions.length || positions.some(position => !/^[1-9][0-9]*$/u.test(position)
      || Number(position) > rule.pattern.length)) return false;
  if (args.postags != null) {
    const tags = args.postags.split(",");
    if (tags.length !== positions.length || tags.some(tag => !isPortablePosTagRegexp(tag))) return false;
  }
  return Object.keys(args).every(key => key === "formPositions" || key === "postags");
}

export function isSupportedDisambiguationRule(rule) {
  return getDisambiguationRuleBlockers(rule).length === 0;
}
