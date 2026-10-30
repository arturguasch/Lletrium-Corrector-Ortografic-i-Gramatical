/* Public facade for the local Catalan correction engine. */
(() => {
  "use strict";

  const API_VERSION = 1;
  const PRODUCT_LANGUAGE = "ca";
  const REFERENCE_LANGUAGE = "ca-ES";
  const DEFAULT_CHECK_LEVEL = "DEFAULT";
  const SUPPORTED_CHECK_LEVELS = new Set(["DEFAULT", "PICKY"]);
  const PARITY_SCOPE = "finite-regression-benchmark; not a claim of universal equivalence";
  const SPANISH_LANGUAGE = "es-ES";
  const ENGLISH_LANGUAGE = "en-US";
  const SUPPORTED_LANGUAGE_CODES = new Set([PRODUCT_LANGUAGE, REFERENCE_LANGUAGE, "ca-ES-valencia", "ca-ES-balear", SPANISH_LANGUAGE, ENGLISH_LANGUAGE]);

  class EngineError extends Error {
    constructor(code, message, details = {}) {
      super(message);
      this.name = "EngineError";
      this.code = code;
      this.stage = details.stage || "engine";
      this.language = details.language || PRODUCT_LANGUAGE;
      this.retryable = Boolean(details.retryable);
    }

    toJSON() {
      return {
        name: this.name,
        code: this.code,
        message: this.message,
        stage: this.stage,
        language: this.language,
        retryable: this.retryable
      };
    }
  }

  function createIssue(input = {}) {
    const start = Number(input.start);
    const end = Number(input.end);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end <= start) {
      throw new EngineError("INVALID_ISSUE_RANGE", "La incidencia debe tener un rango UTF-16 válido.", { stage: "result-model" });
    }

    const issue = {
      id: String(input.id || `${input.ruleId || "issue"}:${start}:${end}`),
      ruleId: String(input.ruleId || ""),
      category: String(input.category || "grammar"),
      severity: String(input.severity || "warning"),
      message: String(input.message || ""),
      text: input.text == null ? "" : String(input.text),
      start,
      end,
      suggestions: Array.isArray(input.suggestions) ? input.suggestions.map(String) : []
    };

    if (input.shortMessage != null) issue.shortMessage = String(input.shortMessage);
    const replacementStart = input.replacementStart == null ? start : Number(input.replacementStart);
    const replacementEnd = input.replacementEnd == null ? end : Number(input.replacementEnd);
    if (!Number.isInteger(replacementStart) || !Number.isInteger(replacementEnd) || replacementStart < 0 || replacementEnd < replacementStart) {
      throw new EngineError("INVALID_REPLACEMENT_RANGE", "El rango de sustitución UTF-16 no es válido.", { stage: "result-model" });
    }
    issue.replacementStart = replacementStart;
    issue.replacementEnd = replacementEnd;
    if (input.rule != null) issue.rule = String(input.rule);
    return issue;
  }

  function normalizeOptions(options = {}) {
    if (options == null || typeof options !== "object" || Array.isArray(options)) {
      throw new EngineError("INVALID_OPTIONS", "Las opciones del análisis deben ser un objeto.", { stage: "request-model" });
    }
    const requestedLanguage = String(options.language || PRODUCT_LANGUAGE);
    if (!SUPPORTED_LANGUAGE_CODES.has(requestedLanguage)) {
      throw new EngineError(
        "UNSUPPORTED_LANGUAGE",
        `El motor local no admet el perfil sol·licitat: ${requestedLanguage}.`,
        { stage: "language-profile", language: requestedLanguage }
      );
    }
    const checkLevel = options.checkLevel == null || options.checkLevel === ""
      ? DEFAULT_CHECK_LEVEL : String(options.checkLevel);
    if (!SUPPORTED_CHECK_LEVELS.has(checkLevel)) {
      throw new EngineError(
        "UNSUPPORTED_CHECK_LEVEL",
        `El nivel de revisión debe ser DEFAULT o PICKY; recibido: ${checkLevel}.`,
        { stage: "check-configuration", language: requestedLanguage }
      );
    }
    if (requestedLanguage === SPANISH_LANGUAGE) {
      return Object.freeze({ ...options, language: SPANISH_LANGUAGE, referenceLanguage: SPANISH_LANGUAGE, checkLevel });
    }
    if (requestedLanguage === ENGLISH_LANGUAGE) {
      return Object.freeze({ ...options, language: ENGLISH_LANGUAGE, referenceLanguage: ENGLISH_LANGUAGE, checkLevel });
    }
    const localeProfile = options.localeProfile == null
      ? ({ "ca": "inclusive", "ca-ES": "central", "ca-ES-valencia": "valencian", "ca-ES-balear": "balearic" }[requestedLanguage] || "central")
      : String(options.localeProfile);
    if (!new Set(["central", "inclusive", "valencian", "balearic"]).has(localeProfile)) {
      throw new EngineError("UNSUPPORTED_LOCALE_PROFILE", `El perfil dialectal ha de ser central, valencià o balear; rebut: ${localeProfile}.`, { stage: "language-profile", language: requestedLanguage });
    }
    return Object.freeze({ ...options, language: PRODUCT_LANGUAGE, referenceLanguage: REFERENCE_LANGUAGE, localeProfile, checkLevel });
  }

  // LanguageTool's Catalan pipeline trims unchanged whole-word prefixes and
  // suffixes from a match after rule arbitration (RuleMatch.trimMatchEnds).
  // Keep the location focused on the text that actually changes and apply
  // the same trim to every suggestion so replacement ranges remain valid.
  function trimUnchangedMatchEnds(text, issue) {
    let error = text.slice(issue.start, issue.end);
    let start = issue.start;
    let end = issue.end;
    let suggestions = [...(issue.suggestions || [])];
    if (!suggestions.length || !error || /^\s+$/u.test(error)) return issue;
    let changed = true;
    while (changed) {
      changed = false;
      const lastSpace = error.lastIndexOf(" ");
      if (lastSpace > 0) {
        const suffix = ` ${error.slice(lastSpace + 1)}`;
        if (suggestions.every(value => value.endsWith(suffix))) {
          suggestions = suggestions.map(value => value.slice(0, -suffix.length));
          end -= error.length - lastSpace;
          error = error.slice(0, lastSpace);
          changed = true;
        }
      }
      const firstSpace = error.indexOf(" ");
      if (firstSpace > 0) {
        const prefix = `${error.slice(0, firstSpace)} `;
        if (suggestions.every(value => value.startsWith(prefix))) {
          suggestions = suggestions.map(value => value.slice(prefix.length));
          start += prefix.length;
          error = error.slice(prefix.length);
          changed = true;
        }
      }
    }
    if (start === issue.start && end === issue.end) return issue;
    const replacementStart = issue.replacementStart === issue.start ? start : issue.replacementStart;
    const replacementEnd = issue.replacementEnd === issue.end ? end : issue.replacementEnd;
    return {
      ...issue,
      id: `${issue.ruleId}:${start}:${end}`,
      start,
      end,
      text: text.slice(start, end),
      replacementStart,
      replacementEnd,
      suggestions
    };
  }

  const status = {
    phase: "cold",
    ready: false,
    engineAvailable: true,
    implemented: false,
    apiVersion: API_VERSION,
    requestedLanguages: [],
    loadedLanguages: [],
    activeStages: [],
    missingStages: ["grammar-rules", "spelling"],
    lastError: null
  };
  let morphology = null;
  let resourcePromise = null;
  let spanishPipeline = null;
  let spanishResourcePromise = null;
  let englishPipeline = null;
  let englishResourcePromise = null;
  let englishLastError = null;
  let sentenceTokenizer = null;
  let completedChecks = 0;
  let completedBatches = 0;
  let totalCheckMs = 0;
  const checkStageTotalsMs = Object.create(null);
  const recentSlowChecks = [];

  function monotonicNow() {
    return globalThis.performance?.now ? globalThis.performance.now() : Date.now();
  }

  function cloneStatus() {
    return {
      ...status,
      requestedLanguages: [...new Set([...status.requestedLanguages, ...(englishResourcePromise || englishPipeline ? [ENGLISH_LANGUAGE] : [])])],
      loadedLanguages: status.loadedLanguages.slice(),
      activeStages: status.activeStages.slice(),
      missingStages: status.missingStages.slice(),
      lastError: status.lastError ? { ...status.lastError } : null
    };
  }

  function getPublicLoadStatus() {
    const catalan = cloneStatus();
    const spanishReady = !!spanishPipeline;
    const englishReady = !!englishPipeline;
    const anyReady = catalan.ready || spanishReady || englishReady;
    return {
      ...catalan,
      ready: anyReady,
      implemented: catalan.implemented || spanishReady || englishReady,
      phase: anyReady ? "ready" : catalan.phase,
      loadedLanguages: [...new Set([...catalan.loadedLanguages, ...(spanishPipeline ? [SPANISH_LANGUAGE] : []), ...(englishPipeline ? [ENGLISH_LANGUAGE] : [])])],
      activeStages: [...new Set([...catalan.activeStages, ...(spanishPipeline?.stages || []), ...(englishPipeline?.stages || [])])],
      profiles: {
        "ca-ES": { ready: catalan.ready, phase: catalan.phase, lastError: catalan.lastError },
        "es-ES": { ready: !!spanishPipeline, phase: spanishPipeline ? "ready" : spanishResourcePromise ? "loading-resources" : "cold" },
        "en-US": { ready: !!englishPipeline, phase: englishPipeline ? "ready" : englishResourcePromise ? "loading-resources" : englishLastError ? "error" : "cold", lastError: englishLastError ? { ...englishLastError } : null }
      }
    };
  }

  async function preload(languages = [PRODUCT_LANGUAGE]) {
    const requested = Array.isArray(languages) ? languages : [languages];
    const normalized = requested.map(language => normalizeOptions({ language }).language);
    if (normalized.includes(ENGLISH_LANGUAGE)) {
      if (!globalThis.CorrectorEnglishPipeline) throw new EngineError("ENGLISH_PIPELINE_UNAVAILABLE", "The local en-US pipeline is not included in the bundle.", { stage: "language-profile", language: ENGLISH_LANGUAGE });
      englishLastError = null;
      if (!englishPipeline) {
        if (!englishResourcePromise) {
          englishResourcePromise = globalThis.CorrectorEnglishPipeline.load().then(pipeline => {
            englishPipeline = pipeline;
            return pipeline;
          }).catch(error => {
            englishResourcePromise = null;
            const wrapped = new EngineError("ENGLISH_RESOURCE_LOAD_FAILED", `Could not load local en-US resources: ${error?.message || error}`, { stage: "resource-load", language: ENGLISH_LANGUAGE, retryable: true });
            englishLastError = wrapped.toJSON();
            throw wrapped;
          });
        }
        await englishResourcePromise;
      }
    }
    if (normalized.includes(SPANISH_LANGUAGE)) {
      if (!globalThis.CorrectorSpanishPipeline) throw new EngineError("SPANISH_PIPELINE_UNAVAILABLE", "El pipeline local es-ES no està inclòs al bundle.", { stage: "language-profile", language: SPANISH_LANGUAGE });
      if (!spanishPipeline) {
        if (!spanishResourcePromise) {
          spanishResourcePromise = globalThis.CorrectorSpanishPipeline.load().then(pipeline => {
            spanishPipeline = pipeline;
            return pipeline;
          }).catch(error => {
            spanishResourcePromise = null;
            throw new EngineError("SPANISH_RESOURCE_LOAD_FAILED", `No s'han pogut carregar els recursos locals es-ES: ${error?.message || error}`, { stage: "resource-load", language: SPANISH_LANGUAGE, retryable: true });
          });
        }
        await spanishResourcePromise;
      }
    }
    const catalanRequested = normalized.filter(language => language !== SPANISH_LANGUAGE && language !== ENGLISH_LANGUAGE);
    if (!catalanRequested.length) {
      const language = normalized.includes(ENGLISH_LANGUAGE) ? ENGLISH_LANGUAGE : SPANISH_LANGUAGE;
      const pipeline = language === ENGLISH_LANGUAGE ? englishPipeline : spanishPipeline;
      return { ok: true, language, ready: true, implemented: true, profile: language,
        status: getPublicLoadStatus(), diagnostics: pipeline.getDiagnostics(),
        morphology: pipeline.morphology.getStats() };
    }
    status.phase = "loading-resources";
    status.ready = false;
    status.requestedLanguages = [...new Set(normalized)];
    status.loadedLanguages = [];
    status.lastError = null;
    if (!resourcePromise) {
      resourcePromise = Promise.all([
        globalThis.CorrectorCatalanMorphology.load(),
        globalThis.CorrectorCatalanSentenceTokenizer.load(),
        globalThis.CorrectorCatalanTagger.loadResources(),
        globalThis.CorrectorCatalanChunker.load(),
        globalThis.CorrectorCatalanXmlDisambiguator.load(),
        globalThis.CorrectorCatalanMultitokenDisambiguator.load(),
        globalThis.CorrectorCatalanSimpleReplaceMatcher.load(),
        globalThis.CorrectorCatalanTableRuleMatcher.load(),
        globalThis.CorrectorCatalanPatternRuleMatcher.load(),
        globalThis.CorrectorCatalanSpellingLexicon.load(),
        globalThis.CorrectorCatalanSynthesis.load(),
        globalThis.CorrectorCatalanMorfologikSpeller.load(),
        globalThis.CorrectorCatalanRuleFilters.load(),
        globalThis.CorrectorCatalanMultitokenSpeller.load(),
        globalThis.CorrectorCatalanSoros.load()
      ]).then(([morphologyIndex, srxTokenizer, _taggerResources, _chunkerResources, xmlSubset, _multitokenDictionary, simpleReplacements, tableRuleData, patternRules, spellingLexicon]) => {
        morphology = morphologyIndex;
        globalThis.CorrectorCatalanRuleFilters.configure({
          lex: word => globalThis.CorrectorCatalanTagger.tagToken({ text: word, kind: "word" }, morphology).readings,
          analyze: tagText,
          multitoken: globalThis.CorrectorCatalanMultitokenSpeller
        });
        globalThis.CorrectorCatalanMultitokenSpeller.configure({
          findAdditionalSuggestions: word => globalThis.CorrectorCatalanMorfologikSpeller.findMultitokenSpellingCandidates(word)
        });
        globalThis.CorrectorCatalanPatternRuleMatcher.configureLexicalLookup(word => globalThis.CorrectorCatalanTagger.tagToken({ text: word, kind: "word" }, morphology).readings);
        globalThis.CorrectorCatalanTableRuleMatcher.configureLexicalLookup(word => globalThis.CorrectorCatalanTagger.tagToken({ text: word, kind: "word" }, morphology).readings);
        sentenceTokenizer = srxTokenizer;
        status.phase = "ready";
        status.loadedLanguages = [PRODUCT_LANGUAGE];
        status.activeStages = ["ca-srx-sentence-segmentation", "ca-tokenization", "softcatala-pos-lookup", "surface-form-tagger", "languagetool-derived-tagging", "contextual-reading-view", "global-multiword-chunker", "catalan-multiword-chunker", `languagetool-catalan-profile-xml:${xmlSubset.loadedRules}`, "softcatala-catalan-multitoken-disambiguation", "languagetool-morfologik-multitoken-suggestions", `languagetool-simple-replace-multiwords:${simpleReplacements.loadedEntries}`, `languagetool-literal-pattern-rules:${patternRules.loadedRules}`, `languagetool-valencian-grammar-rules:${patternRules.dialectRules}`, `languagetool-check-case:${tableRuleData.checkCaseEntries}`, "languagetool-trim-match-ends", `softcatala-3.3-spelling:${spellingLexicon.loadedForms}`, `languagetool-spelling-overlays:${spellingLexicon.overlayEntries}`, "languagetool-ca-soros-number-rules", "unified-local-issue-arbitration", "sentence-start-capitalization"];
        // Runtime availability and corpus-wide parity are separate. The API
        // can now run for Catalan while its remaining parity gaps stay
        // visible in diagnostics instead of hiding a usable check behind an
        // exception.
        status.missingStages = [];
        status.ready = true;
        status.implemented = true;
        return { morphology: morphologyIndex, srx: srxTokenizer };
      }).catch(cause => {
        resourcePromise = null;
        status.phase = "error";
        status.ready = false;
        const error = new EngineError("ENGINE_RESOURCE_LOAD_FAILED", `No s'han pogut carregar els recursos lingüístics: ${cause?.message || cause}`, { stage: "resource-load", retryable: true });
        status.lastError = error.toJSON();
        throw error;
      });
    }
    await resourcePromise;
    return { ok: true, language: PRODUCT_LANGUAGE, ready: true, implemented: true, status: cloneStatus(), morphology: morphology.getStats() };
  }

  function checkText(text, options = {}) {
    const normalized = normalizeOptions(options);
    if (typeof text !== "string") {
      throw new EngineError("INVALID_TEXT", "El texto que se va a revisar debe ser una cadena.", { stage: "request-model", language: normalized.language });
    }
    if (normalized.language === SPANISH_LANGUAGE) {
      if (!spanishPipeline) throw new EngineError("ENGINE_NOT_PRELOADED", "Cal executar preload(['es-ES']) abans de demanar anàlisi.", { stage: "resource-load", language: SPANISH_LANGUAGE, retryable: true });
      return spanishPipeline.analyzeText(text, normalized).issues.map(issue => ({ ...issue, language: SPANISH_LANGUAGE }));
    }
    if (normalized.language === ENGLISH_LANGUAGE) {
      if (!englishPipeline) throw new EngineError("ENGINE_NOT_PRELOADED", "Call preload(['en-US']) before requesting analysis.", { stage: "resource-load", language: ENGLISH_LANGUAGE, retryable: true });
      const issues = englishPipeline.analyzeText(text, normalized).issues.map(issue => ({ ...issue, language: ENGLISH_LANGUAGE }));
      completedChecks++;
      return issues;
    }
    if (!morphology) throw new EngineError("ENGINE_NOT_PRELOADED", "Cal executar preload(['ca']) abans de demanar anàlisi.", { stage: "resource-load", language: normalized.language, retryable: true });
    const started = monotonicNow();
    const skipSpelling = normalized.skipSpelling === true;
    const stageMs = Object.create(null);
    const candidates = inspectReviewCandidates(text, normalized, (name, durationMs) => {
      stageMs[name] = durationMs;
      checkStageTotalsMs[name] = (checkStageTotalsMs[name] || 0) + durationMs;
    });
    const normalizeStarted = monotonicNow();
    const issues = candidates
      .map(candidate => trimUnchangedMatchEnds(text, candidate))
      .filter(candidate => !skipSpelling || candidate.category !== "spelling")
      .map(candidate => {
        const spelling = candidate.category === "spelling";
        const ruleId = spelling ? "MORFOLOGIK_RULE_CA_ES" : candidate.ruleId;
        return createIssue({
          ...candidate,
          id: `${ruleId}:${candidate.start}:${candidate.end}`,
          ruleId,
          message: spelling ? "Possible error ortogràfic." : candidate.message,
          shortMessage: spelling ? "Error ortogràfic" : candidate.shortMessage
        });
      });
    stageMs.issueNormalization = Math.round((monotonicNow() - normalizeStarted) * 100) / 100;
    checkStageTotalsMs.issueNormalization = (checkStageTotalsMs.issueNormalization || 0) + stageMs.issueNormalization;
    completedChecks++;
    const durationMs = Math.round((monotonicNow() - started) * 100) / 100;
    totalCheckMs += durationMs;
    if (durationMs >= 250) {
      recentSlowChecks.push({ at: Date.now(), durationMs, chars: text.length, issues: issues.length, stages: stageMs });
      if (recentSlowChecks.length > 16) recentSlowChecks.shift();
    }
    return issues;
  }

  function checkBatch(items, options = {}) {
    const normalized = normalizeOptions(options);
    if (!Array.isArray(items)) {
      throw new EngineError("INVALID_BATCH", "El lote debe ser una lista de textos con identificador.", { stage: "request-model", language: normalized.language });
    }
    if (normalized.language !== SPANISH_LANGUAGE && normalized.language !== ENGLISH_LANGUAGE && !morphology) throw new EngineError("ENGINE_NOT_PRELOADED", "Cal executar preload(['ca']) abans de demanar anàlisi.", { stage: "resource-load", language: normalized.language, retryable: true });
    items.forEach((item, index) => {
      if (item == null || typeof item !== "object" || Array.isArray(item) || typeof item.text !== "string") {
        throw new EngineError("INVALID_BATCH_ITEM", `El elemento ${index} debe contener un texto y, opcionalmente, un identificador.`, { stage: "request-model", language: normalized.language });
      }
    });
    const results = items.map((item, index) => ({ id: String(item.id ?? index), issues: checkText(item.text, normalized) }));
    completedBatches++;
    return results;
  }

  function tokenize(text, language = PRODUCT_LANGUAGE) {
    if (language === ENGLISH_LANGUAGE) {
      if (!englishPipeline) throw new EngineError("ENGINE_NOT_PRELOADED", "Call preload(['en-US']) before tokenizing.", { stage: "resource-load", language: ENGLISH_LANGUAGE, retryable: true });
      return globalThis.CorrectorEnglishText.tokenize(text, englishPipeline.morphology);
    }
    if (!morphology) throw new EngineError("ENGINE_NOT_PRELOADED", "Cal executar preload(['ca']) abans de tokenitzar.", { stage: "resource-load", retryable: true });
    return globalThis.CorrectorCatalanText.tokenize(text, morphology);
  }

  function segmentSentences(text, language = PRODUCT_LANGUAGE) {
    if (language === ENGLISH_LANGUAGE) {
      if (!englishPipeline) throw new EngineError("ENGINE_NOT_PRELOADED", "Call preload(['en-US']) before segmenting sentences.", { stage: "resource-load", language: ENGLISH_LANGUAGE, retryable: true });
      return englishPipeline.sentenceTokenizer.segment(text);
    }
    if (!sentenceTokenizer) throw new EngineError("ENGINE_NOT_PRELOADED", "Cal executar preload(['ca']) abans de segmentar.", { stage: "resource-load", retryable: true });
    return sentenceTokenizer.segment(text);
  }

  // Share only identical analyses within one synchronous review. Separate
  // copies preserve the mutable reading views used by rule filters.
  let activeAnalysisCache = null;
  const analysisReuse = { hits: 0, misses: 0, cloneMs: 0 };
  function cloneAnalysis(value, seen = new WeakMap()) {
    if (value === null || typeof value !== "object") return value;
    if (seen.has(value)) return seen.get(value);
    const copy = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
    seen.set(value, copy);
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if ("value" in descriptor) descriptor.value = cloneAnalysis(descriptor.value, seen);
      Object.defineProperty(copy, key, descriptor);
    }
    if (!Object.isExtensible(value)) Object.preventExtensions(copy);
    return copy;
  }
  function tagText(text, localeProfile = "inclusive") {
    const scope = activeAnalysisCache;
    if (!scope || localeProfile === ENGLISH_LANGUAGE) return tagTextUncached(text, localeProfile);
    const key = JSON.stringify([localeProfile, text]);
    if (scope.entries.has(key)) {
      analysisReuse.hits++;
      const started = monotonicNow();
      const result = cloneAnalysis(scope.entries.get(key));
      analysisReuse.cloneMs += monotonicNow() - started;
      return result;
    }
    analysisReuse.misses++;
    const result = tagTextUncached(text, localeProfile);
    if (scope.entries.size < 256 && scope.chars + text.length <= 200000) {
      const started = monotonicNow();
      scope.entries.set(key, cloneAnalysis(result));
      analysisReuse.cloneMs += monotonicNow() - started;
      scope.chars += text.length;
    }
    return result;
  }

  function tagTextUncached(text, localeProfile = "inclusive") {
    if (localeProfile === ENGLISH_LANGUAGE) {
      if (!englishPipeline) throw new EngineError("ENGINE_NOT_PRELOADED", "Call preload(['en-US']) before tagging.", { stage: "resource-load", language: ENGLISH_LANGUAGE, retryable: true });
      return englishPipeline.sentenceTokenizer.segment(text).flatMap(sentence => {
        const tokens = globalThis.CorrectorEnglishText.tokenize(sentence.text, englishPipeline.morphology).map(token => ({
          ...token,
          start: token.start == null ? null : token.start + sentence.start,
          end: token.end == null ? null : token.end + sentence.start
        }));
        return globalThis.CorrectorEnglishTagger.tagTokens(tokens, englishPipeline.morphology);
      });
    }
    const sentences = segmentSentences(text);
    return sentences.flatMap(sentence => {
      const tokens = globalThis.CorrectorCatalanText.tokenize(sentence.text, morphology).map(token => ({
        ...token,
        start: token.start == null ? null : token.start + sentence.start,
        end: token.end == null ? null : token.end + sentence.start
      }));
      const lexical = globalThis.CorrectorCatalanTagger.tagTokens(tokens, morphology, localeProfile);
      const firstToken = lexical.findIndex(token => token.kind !== "space");
      const lastToken = lexical.findLastIndex(token => token.kind !== "space");
      if (lastToken >= 0) {
        const token = lexical[lastToken];
        const lemma = token.readings[0]?.lemma ?? null;
        token.readings.push({ token: token.text, lemma, tag: "SENT_END" });
      }
      const paragraphEnd = /\r?\n(?:[ \t]*\r?\n)+\s*$/u.test(sentence.text);
      const contextual = lexical.map((token, index) => globalThis.CorrectorCatalanAnalysis.createTokenAnalysis(token, {
        whitespaceBefore: index > 0 && lexical[index - 1].kind === "space",
        sentenceStart: index === firstToken,
        sentenceEnd: index === lastToken,
        paragraphEnd: paragraphEnd && index === lastToken
      }));
      const chunked = globalThis.CorrectorCatalanChunker.disambiguate(contextual).tokens;
      const xml = globalThis.CorrectorCatalanXmlDisambiguator.disambiguate(chunked).tokens;
      return globalThis.CorrectorCatalanMultitokenDisambiguator.disambiguate(xml);
    });
  }

  function matchPatternRules(text, options = {}) {
    const normalized = normalizeOptions(options);
    const { ruleIds = null } = options;
    if (typeof text !== "string") throw new EngineError("INVALID_TEXT", "El texto que se va a analizar debe ser una cadena.", { stage: "request-model" });
    return segmentSentences(text).flatMap(sentence => {
      const tokens = tagText(sentence.text, normalized.localeProfile).map(token => ({
        ...token,
        start: token.start == null ? null : token.start + sentence.start,
        end: token.end == null ? null : token.end + sentence.start
      }));
      return globalThis.CorrectorCatalanPatternRuleMatcher.findMatches(tokens, text, { ruleIds, checkLevel: normalized.checkLevel, localeProfile: normalized.localeProfile }).map(issue => ({
        ...issue,
        text: text.slice(issue.start, issue.end)
      }));
    }).sort((left, right) => left.start - right.start || left.end - right.end || left.ruleId.localeCompare(right.ruleId));
  }

  function matchUppercaseSentenceStart(text) {
    const sentences = segmentSentences(text);
    const exceptions = new Set(["n", "w", "x86", "ⓒ", "ø", "cc", "pH", "heylogin"]);
    const quotes = new Set(["\"", "'", "„", "»", "«", "“", "‘", "¡", "¿"]);
    const results = [];
    let previousLastToken = "";
    let previousWasNumberedList = false;
    for (const sentence of sentences) {
      const words = tokenize(sentence.text).filter(token => token.kind !== "space");
      if (!words.length) continue;
      // LanguageTool suppresses sentence-start casing for a document made of
      // one sentence and one token, avoiding a second alert for a lone typo.
      if (sentences.length === 1 && words.length === 1) return [];
      let startIndex = 0;
      if (quotes.has(words[0].text) && words.length > 1) startIndex = 1;
      const first = words[startIndex];
      const trailingQuote = new Set(["\"", "'", "„", "«", "»", "‘", "’", "“", "”"]);
      const lastToken = trailingQuote.has(words.at(-1).text) && words.length > 1
        ? words.at(-2).text : words.at(-1).text;
      const containsDigit = /\d/u.test(first.text);
      const romanOrLetterList = /^(?:[a-z]|m{0,4}(?:c[md]|d?c{0,3})(?:x[cl]|l?x{0,3})(?:i[xv]|v?i{0,3}))$/u.test(first.text)
        && words[startIndex + 1] && (words[startIndex + 1].text === "." || words[startIndex + 1].text === ")");
      const interruptedSentence = Boolean(previousLastToken)
        && !/[.?!…]$/u.test(previousLastToken) && !/[.?!…]$/u.test(lastToken);
      const inUrl = /^(?:https?|ftp|mailto):/iu.test(first.text) || /@|\.(?:com|org|net|cat|es|eu|io|edu|gov)$/iu.test(first.text);
      const protectedByPreviousText = previousLastToken === "," || previousLastToken === ";";
      const prevent = protectedByPreviousText || containsDigit || interruptedSentence || romanOrLetterList
        || previousWasNumberedList || inUrl || first.immunized;
      const mixedCase = /^\p{Ll}\p{L}*\p{Lu}/u.test(first.text);
      const camelCase = /\p{Ll}\p{L}*\p{Lu}\p{L}*/u.test(first.text);
      if (/^\p{Ll}/u.test(first.text) && !prevent && !mixedCase && !exceptions.has(first.text) && !camelCase) {
        const suggestion = first.text[0].toLocaleUpperCase("ca") + first.text.slice(1);
        results.push({
          id: `UPPERCASE_SENTENCE_START:${sentence.start + first.start}:${sentence.start + first.end}`,
          ruleId: "UPPERCASE_SENTENCE_START",
          category: "typography",
          // UppercaseSentenceStartRule inherits RuleMatch.Type.Other.
          severity: "Other",
          message: "Aquesta frase no comença amb majúscula.",
          shortMessage: "Majúscules i minúscules",
          text: first.text,
          start: sentence.start + first.start,
          end: sentence.start + first.end,
          replacementStart: sentence.start + first.start,
          replacementEnd: sentence.start + first.end,
          suggestions: [suggestion]
        });
      }
      if (sentence.text.trim()) previousLastToken = lastToken;
      previousWasNumberedList = /^\d+\. .*$/u.test(sentence.text) || /\n\d+\. /u.test(sentence.text);
    }
    return results;
  }

  function matchCheckCase(text) {
    return globalThis.CorrectorCatalanTableRuleMatcher.findCaseMatches(text, segmentSentences(text));
  }

  function matchCasing(text) {
    const checkCase = matchCheckCase(text);
    const sentenceStart = matchUppercaseSentenceStart(text).filter(candidate =>
      !checkCase.some(issue => issue.start < candidate.end && issue.end > candidate.start));
    return [...checkCase, ...sentenceStart]
      .sort((left, right) => left.start - right.start || left.end - right.end || left.ruleId.localeCompare(right.ruleId));
  }

  // LanguageTool's CA_WORD_COHERENCY_VALENCIA records the first spelling
  // used for each pair and flags later occurrences of its alternative.
  // Source: ca/coherency-valencia.txt (LanguageTool 6.9-SNAPSHOT), SHA-256
  // 6819062b15aeceef125db3d5aeb16053fdcad9255d67bc186ec97945b07b31e1.
  function matchValencianWordCoherency(text) {
    const pairs = [["aquest", "este"], ["aqueix", "eixe"]];
    const counterpart = new Map();
    for (const [left, right] of pairs) {
      counterpart.set(left, right);
      counterpart.set(right, left);
    }
    const shouldNotAppear = new Map();
    const found = [];
    for (const token of tagText(text, "valencian")) {
      if (token.kind !== "word") continue;
      const readings = (token.readings || []).filter(reading => counterpart.has(reading.lemma));
      if (!readings.length) continue;
      // Match LanguageTool's reading order: the first relevant lemma decides
      // whether this token establishes a spelling or conflicts with one.
      const reading = readings[0];
      const preferred = shouldNotAppear.get(reading.lemma);
      if (preferred) {
        const targetReadings = readings.filter(item => /^[VAND]/u.test(item.tag || ""));
        const suggestions = [...new Set(targetReadings.flatMap(item =>
          globalThis.CorrectorCatalanSynthesis.synthesize({ lemma: preferred, tag: item.tag }, item.tag, false, "valencian")))];
        if (suggestions.length) {
          const suggestion = /^\p{Lu}/u.test(token.text)
            ? suggestions[0].slice(0, 1).toLocaleUpperCase("ca") + suggestions[0].slice(1)
            : suggestions[0];
          found.push({
            id: `CA_WORD_COHERENCY_VALENCIA:${token.start}:${token.end}`,
            ruleId: "CA_WORD_COHERENCY_VALENCIA",
            rule: "CA_WORD_COHERENCY_VALENCIA",
            category: "style",
            severity: "warning",
            message: `No és coherent usar «${token.text}» i «${preferred}» dins d'un mateix text.`,
            shortMessage: "Coherència",
            text: token.text,
            start: token.start,
            end: token.end,
            replacementStart: token.start,
            replacementEnd: token.end,
            suggestions: [suggestion],
            _ruleId: "CA_WORD_COHERENCY_VALENCIA",
            _from: token.start,
            _to: token.end,
            _priority: -10,
            _picky: false,
            _includedAllAtOnce: false,
            _registrationOrder: Number.MAX_SAFE_INTEGER - 1,
            _family: "text-level",
            _outputPortable: true
          });
        }
      } else {
        const alternate = counterpart.get(reading.lemma);
        if (alternate) shouldNotAppear.set(alternate, reading.lemma);
      }
    }
    return found;
  }

  // Diagnostic view of the grammar candidate set; the public checker also
  // consumes these already-arbitrated family results.
  function inspectRuleFamilyMatches(text, options = {}) {
    const normalized = normalizeOptions(options);
    if (typeof text !== "string") throw new EngineError("INVALID_TEXT", "El texto que se va a analizar debe ser una cadena.", { stage: "request-model" });
    const grammarMatches = segmentSentences(text).flatMap(sentence => {
      const tokens = tagText(sentence.text, normalized.localeProfile).map(token => ({
        ...token,
        start: token.start == null ? null : token.start + sentence.start,
        end: token.end == null ? null : token.end + sentence.start
      }));
      return globalThis.CorrectorCatalanPatternRuleMatcher.findMatches(tokens, text, { includeAllFamilies: true, checkLevel: normalized.checkLevel, localeProfile: normalized.localeProfile }).map(issue => ({
        ...issue,
        text: text.slice(issue.start, issue.end)
      }));
    });
    return grammarMatches.sort((left, right) => left.start - right.start || left.end - right.end || left.ruleId.localeCompare(right.ruleId));
  }

  // Collect unarbitrated candidates from every rule family. LanguageTool
  // compares spelling and grammar together in CleanOverlappingFilter; keeping
  // this raw view avoids making one family win solely because it ran first.
  function inspectRawRuleFamilyMatches(text, options = {}) {
    const normalized = normalizeOptions(options);
    if (typeof text !== "string") throw new EngineError("INVALID_TEXT", "El texto que se va a analizar debe ser una cadena.", { stage: "request-model" });
    return segmentSentences(text).flatMap(sentence => {
      const tokens = tagText(sentence.text, normalized.localeProfile).map(token => ({
        ...token,
        start: token.start == null ? null : token.start + sentence.start,
        end: token.end == null ? null : token.end + sentence.start
      }));
      return globalThis.CorrectorCatalanPatternRuleMatcher.findMatches(tokens, text, {
        arbitrate: false,
        includeAllFamilies: true,
        checkLevel: normalized.checkLevel,
        localeProfile: normalized.localeProfile
      }).map(issue => ({ ...issue, text: text.slice(issue.start, issue.end) }));
    });
  }

  // Diagnostic subset of the unified check pipeline: add the text-level
  // sentence-start casing rule and let grammar alerts win overlapping spans.
  // Sentence context is evaluated over the full input, as in LanguageTool.
  function inspectTextLevelCandidates(text, options = {}) {
    const normalized = normalizeOptions(options);
    if (typeof text !== "string") throw new EngineError("INVALID_TEXT", "El texto que se va a analizar debe ser una cadena.", { stage: "request-model" });
    const grammarMatches = inspectRuleFamilyMatches(text, normalized);
    const caseMatches = matchCasing(text).filter(candidate =>
      !grammarMatches.some(issue => issue.start < candidate.end && issue.end > candidate.start));
    return [...grammarMatches, ...caseMatches]
      .sort((left, right) => left.start - right.start || left.end - right.end || left.ruleId.localeCompare(right.ruleId));
  }

  // Unified grammar, spelling, and sentence-start casing candidates under
  // the current local priority order. This is the source used by checkText;
  // it still reports parity gaps through getDiagnostics().
  function inspectReviewCandidates(text, options = {}, onStage = null) {
    const previous = activeAnalysisCache;
    activeAnalysisCache = { entries: new Map(), chars: 0 };
    try {
      return inspectReviewCandidatesWithAnalysisReuse(text, options, onStage);
    } finally {
      activeAnalysisCache = previous;
    }
  }

  function inspectReviewCandidatesWithAnalysisReuse(text, options = {}, onStage = null) {
    const normalized = normalizeOptions(options);
    if (typeof text !== "string") throw new EngineError("INVALID_TEXT", "El texto que se va a analizar debe ser una cadena.", { stage: "request-model" });
    const timed = (name, fn) => {
      const started = monotonicNow();
      const result = fn();
      onStage?.(name, Math.round((monotonicNow() - started) * 100) / 100);
      return result;
    };
    const ruleCandidates = timed("grammarRules", () => inspectRawRuleFamilyMatches(text, normalized));
    const spellingCandidates = timed("spelling", () => inspectSpelling(text, normalized.localeProfile)).map(candidate => ({
      ...candidate,
      id: `MORFOLOGIK_RULE_CA_ES:${candidate.start}:${candidate.end}`,
      ruleId: "MORFOLOGIK_RULE_CA_ES",
      rule: "MORFOLOGIK_RULE_CA_ES",
      message: "Possible error ortogràfic.",
      shortMessage: "Error ortogràfic",
      _ruleId: "MORFOLOGIK_RULE_CA_ES",
      _from: candidate.start,
      _to: candidate.end,
      _priority: -100,
      _picky: false,
      _includedAllAtOnce: false,
      _registrationOrder: Number.MAX_SAFE_INTEGER,
      _family: "spelling",
      _outputPortable: true
    }));
    const styleCandidates = normalized.localeProfile === "valencian"
      ? timed("valencianStyle", () => matchValencianWordCoherency(text)) : [];
    const selected = timed("arbitration", () => globalThis.CorrectorCatalanPatternRuleMatcher.arbitrateMatches(
      [...ruleCandidates, ...spellingCandidates, ...styleCandidates],
      text,
      { checkLevel: normalized.checkLevel, includeAllFamilies: true }
    ));
    const casing = timed("casing", () => matchCasing(text)).filter(candidate =>
      !selected.some(issue => issue.start < candidate.end && issue.end > candidate.start));
    return [...selected, ...casing]
      .sort((left, right) => left.start - right.start || left.end - right.end || left.ruleId.localeCompare(right.ruleId));
  }

  function matchSimpleReplaceRules(text, options = {}) {
    const normalized = normalizeOptions(options);
    if (typeof text !== "string") throw new EngineError("INVALID_TEXT", "El texto que se va a analizar debe ser una cadena.", { stage: "request-model" });
    return segmentSentences(text).flatMap(sentence => {
      const tokens = tagText(sentence.text, normalized.localeProfile).map(token => ({
        ...token,
        start: token.start == null ? null : token.start + sentence.start,
        end: token.end == null ? null : token.end + sentence.start
      }));
      return globalThis.CorrectorCatalanSimpleReplaceMatcher.findMatches(tokens, text).map(issue => ({
        ...issue,
        text: text.slice(issue.start, issue.end)
      }));
    }).sort((left, right) => left.start - right.start || left.end - right.end);
  }

  function inspectSpelling(text, localeProfile = "inclusive") {
    if (typeof text !== "string") throw new EngineError("INVALID_TEXT", "El texto que se va a analizar debe ser una cadena.", { stage: "request-model" });
    if (!morphology) throw new EngineError("ENGINE_NOT_PRELOADED", "Cal executar preload(['ca']) abans de demanar diagnòstic ortogràfic.", { stage: "resource-load", retryable: true });
    return globalThis.CorrectorCatalanSpellingLexicon.inspect(
      text,
      tagText(text, localeProfile),
      globalThis.CorrectorCatalanMorfologikSpeller,
      word => globalThis.CorrectorCatalanTagger.tagToken({ text: word, kind: "word" }, morphology, localeProfile).readings,
      globalThis.CorrectorCatalanRuleFilters.spellerPronounSuffixes(),
      (pronouns, verb) => globalThis.CorrectorCatalanRuleFilters.transformSpellerPronounAfter(pronouns, verb)
    );
  }

  function clearCache() {
    status.phase = "cold";
    status.ready = false;
    status.requestedLanguages = [];
    status.loadedLanguages = [];
    status.lastError = null;
    status.activeStages = [];
    status.missingStages = ["resources", "contextual-disambiguation", "grammar-rules", "spelling"];
    status.implemented = false;
    morphology = null;
    resourcePromise = null;
    sentenceTokenizer = null;
    spanishPipeline = null;
    spanishResourcePromise = null;
    englishPipeline = null;
    englishResourcePromise = null;
    englishLastError = null;
    globalThis.CorrectorCatalanChunker.clear();
    globalThis.CorrectorCatalanXmlDisambiguator.clear();
    globalThis.CorrectorCatalanMultitokenDisambiguator.clear();
    globalThis.CorrectorCatalanSpellingLexicon.clear();
    return cloneStatus();
  }

  const engine = Object.freeze({
    apiVersion: API_VERSION,
    languages: Object.freeze({ product: PRODUCT_LANGUAGE, reference: REFERENCE_LANGUAGE, spanish: SPANISH_LANGUAGE, english: ENGLISH_LANGUAGE }),
    EngineError,
    createIssue,
    normalizeOptions,
    preload,
    checkText,
    checkBatch,
    tokenize,
    segmentSentences,
    tagText,
    matchPatternRules,
    inspectRuleFamilyMatches,
    inspectTextLevelCandidates,
    inspectReviewCandidates,
    inspectSentenceStartCase: matchUppercaseSentenceStart,
    matchSimpleReplaceRules,
    inspectSpelling,
    clearCache,
    getLoadStatus: getPublicLoadStatus,
    getDiagnostics: () => ({
      apiVersion: API_VERSION,
      implemented: getPublicLoadStatus().implemented,
      parityComplete: status.ready && status.missingStages.length === 0,
      parityScope: PARITY_SCOPE,
      languages: { product: PRODUCT_LANGUAGE, reference: REFERENCE_LANGUAGE, spanish: SPANISH_LANGUAGE, english: ENGLISH_LANGUAGE },
      localeProfiles: { default: "central", available: ["central", "valencian", "balearic", "inclusive"] },
      checkLevels: { supported: [...SUPPORTED_CHECK_LEVELS], default: DEFAULT_CHECK_LEVEL },
      activeStages: status.activeStages.slice(),
      missingStages: status.missingStages.slice(),
      profiles: {
        "ca-ES": { ready: status.ready, phase: status.phase },
        "es-ES": { ready: !!spanishPipeline, phase: spanishPipeline ? "ready" : spanishResourcePromise ? "loading-resources" : "cold" },
        "en-US": { ready: !!englishPipeline, phase: englishPipeline ? "ready" : englishResourcePromise ? "loading-resources" : englishLastError ? "error" : "cold",
          diagnostics: englishPipeline?.getDiagnostics() || null, lastError: englishLastError ? { ...englishLastError } : null }
      },
      error: status.lastError ? { ...status.lastError } : null
    }),
    getPerformanceDiagnostics: () => ({
      implemented: true,
      checks: completedChecks,
      batches: completedBatches,
      totalCheckMs: Math.round(totalCheckMs * 100) / 100,
      averageCheckMs: completedChecks ? Math.round(totalCheckMs / completedChecks * 100) / 100 : 0,
      stageTotalsMs: { ...checkStageTotalsMs },
      analysisReuse: { ...analysisReuse },
      slowChecks: recentSlowChecks.slice(-12).map(item => ({ ...item, stages: { ...item.stages } }))
    })
  });

  Object.defineProperty(globalThis, "CorrectorLocalEngine", {
    configurable: true,
    enumerable: false,
    writable: false,
    value: engine
  });
})();
