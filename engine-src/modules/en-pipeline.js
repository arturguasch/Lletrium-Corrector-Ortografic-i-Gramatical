/* Independent en-US lexical pipeline. Grammar is intentionally a later milestone. */
(() => {
  "use strict";
  class EnglishPipeline {
    constructor({ morphology, synthesizer, sentenceTokenizer, speller, filterSpeller, openNlp, disambiguator, multiwordChunker, patternRules, specificCaseRule, avsAnRule, simpleReplaceRule, wordCoherencyRule, repetitionRules, compoundData, wrongWordContext, contractionSpellingRule, dashRule, unitConversionRule, structuralRules, rulePriorities, regexRules }) {
      if (!(morphology instanceof globalThis.CorrectorEnglishMorphology)
          || !(synthesizer instanceof globalThis.CorrectorEnglishSynthesizer)
          || !(sentenceTokenizer instanceof globalThis.CorrectorEnglishSentenceTokenizer)
          || !(speller instanceof globalThis.CorrectorEnglishSpeller)
          || !(filterSpeller instanceof globalThis.CorrectorEnglishSpeller)
          || !(openNlp instanceof globalThis.CorrectorEnglishOpenNlp)
          || disambiguator !== globalThis.CorrectorEnglishXmlDisambiguator
          || !(multiwordChunker instanceof globalThis.CorrectorEnglishMultiwordChunker)
          || !(specificCaseRule instanceof globalThis.CorrectorEnglishSpecificCase)
          || !(avsAnRule instanceof globalThis.CorrectorEnglishAvsAn)
          || !(simpleReplaceRule instanceof globalThis.CorrectorEnglishSimpleReplace)
          || !(wordCoherencyRule instanceof globalThis.CorrectorEnglishWordCoherency)
          || !(repetitionRules instanceof globalThis.CorrectorEnglishRepetitions)
          || !compoundData?.byForm
          || !wrongWordContext?.entries
          || !(contractionSpellingRule instanceof globalThis.CorrectorEnglishContractionSpelling)
          || !(dashRule instanceof globalThis.CorrectorEnglishDashRule)
          || !(unitConversionRule instanceof globalThis.CorrectorEnglishUnitConversion.EnglishUnitConversion)
          || !(structuralRules instanceof globalThis.CorrectorEnglishStructuralRules)
          || rulePriorities?.profile !== "en-US" || !rulePriorities.priorities
          || patternRules !== globalThis.CorrectorEnglishPatternRuleMatcher) throw new Error("The local en-US pipeline is missing one or more lexical or grammar components.");
      this.morphology = morphology; this.synthesizer = synthesizer;
      this.sentenceTokenizer = sentenceTokenizer; this.speller = speller;
      this.filterSpeller = filterSpeller;
      this.openNlp = openNlp; this.disambiguator = disambiguator; this.multiwordChunker = multiwordChunker;
      this.patternRules = patternRules;
      this.regexRules = regexRules;
      this.specificCaseRule = specificCaseRule;
      this.avsAnRule = avsAnRule;
      this.simpleReplaceRule = simpleReplaceRule;
      this.wordCoherencyRule = wordCoherencyRule;
      this.repetitionRules = repetitionRules;
      this.compoundData = compoundData;
      this.wrongWordContext = wrongWordContext;
      this.contractionSpellingRule = contractionSpellingRule;
      this.dashRule = dashRule;
      this.unitConversionRule = unitConversionRule;
      this.structuralRules = structuralRules;
      this.rulePriorities = rulePriorities.priorities;
      this.patternRules.configureLexicalLookup(word => globalThis.CorrectorEnglishTagger.tagToken({ text: word, kind: "word" }, this.morphology).readings);
      this.patternRules.configureSynthesizer(this.synthesizer);
      this.patternRules.configureMultitokenSpeller({ schemaVersion: 1, profile: "en-US", entries: multiwordChunker.multitokenSpellerEntries });
      this.profile = "en-US";
      this.stages = ["en-US-SRX", "en-US-EnglishWordTokenizer", "english-pos-dictionary", "english-synthesis-dictionary", "en-US-LanguageTool-Soros-number-synthesis", "en-US-Morfologik-spelling", "OpenNLP-1.9.5-models-local", "OpenNLP-tokenizer-ONLPX1", "OpenNLP-POS-sequence-ONLPX1", "OpenNLP-chunker-sequence-ONLPX1", "EnglishChunkFilter", "LanguageTool-spelling_global-multiwords", "LanguageTool-en-multiwords", "en-US-LanguageTool-XML-disambiguation", "en-US-LanguageTool-PatternRule-portable", "en-US-EnglishSpecificCaseRule-local-table", "en-US-AvsAnRule-local-exception-tables", "en-US-SimpleReplaceRule-tables", "en-US-English-WordCoherency-document-rule", "en-US-LanguageTool-WordRepeat-and-WordRepeatBeginning-rules", "en-US-LanguageTool-RepeatedWords-PICKY-with-local-synonyms", "en-US-LanguageTool-CompoundRule-8908-source-entries", "en-US-EnglishWrongWordInContext-11-local-context-pairs", "en-US-ContractionSpellingRule-table", "en-US-EnglishDashRule-PICKY-compounds-table", "en-US-LanguageTool-punctuation-brackets-quotes-and-paragraph-end"];
    }

    analyzeText(text, options = {}) {
      if (typeof text !== "string") throw new TypeError("Text to analyze must be a string.");
      const segments = Array.isArray(options.sentenceSegments) ? options.sentenceSegments : this.sentenceTokenizer.segment(text);
      const sentences = [], issues = [];
      for (const segment of segments) {
        if (!Number.isInteger(segment.start) || !Number.isInteger(segment.end) || segment.start < 0 || segment.end > text.length || segment.end < segment.start) throw new Error("Invalid en-US sentence boundary.");
        const sentenceText = typeof segment.text === "string" ? segment.text : text.slice(segment.start, segment.end);
        const tokens = globalThis.CorrectorEnglishText.tokenize(sentenceText, this.morphology).map(token => ({
          ...token,
          start: token.start == null ? null : token.start + segment.start,
          end: token.end == null ? null : token.end + segment.start
        }));
        const tagged = globalThis.CorrectorEnglishTagger.tagTokens(tokens, this.morphology);
        // LanguageTool adds these structural readings in its AnalyzedSentence
        // layer before XML disambiguation. Keep them on the original punctuation
        // and final paragraph separator so boundary-sensitive rules can match.
        const lastWordOrPunctuation = [...tagged].reverse().find(token => token.kind !== "space");
        if (lastWordOrPunctuation && /^[.!?]+$/u.test(lastWordOrPunctuation.text)) {
          if (lastWordOrPunctuation.readings.some(reading => reading.tag != null)) {
            lastWordOrPunctuation.readings = lastWordOrPunctuation.readings.filter(reading => reading.tag != null);
          }
        }
        if (lastWordOrPunctuation && /^[.!?]+$/u.test(lastWordOrPunctuation.text)
            && !lastWordOrPunctuation.readings.some(reading => reading.tag === "SENT_END")) {
          const reading = { token: lastWordOrPunctuation.text,
            lemma: lastWordOrPunctuation.text === "." ? "." : null,
            tag: "SENT_END", source: "languagetool-sentence-boundary" };
          const punctuationTag = lastWordOrPunctuation.readings.findIndex(item => item.tag === "PCT");
          lastWordOrPunctuation.readings.splice(punctuationTag < 0 ? lastWordOrPunctuation.readings.length : punctuationTag, 0, reading);
        }
        // LanguageTool marks the final non-whitespace token of every analyzed
        // sentence with SENT_END, including examples that have no punctuation.
        if (lastWordOrPunctuation && !lastWordOrPunctuation.readings.some(reading => reading.tag === "SENT_END")) {
          lastWordOrPunctuation.readings.push({ token: lastWordOrPunctuation.text,
            lemma: lastWordOrPunctuation.readings[0]?.lemma ?? null,
            tag: "SENT_END", source: "languagetool-sentence-boundary" });
        }
        if (segment.end === text.length && /(?:\r?\n)$/u.test(text)) {
          const paragraphSeparator = [...tagged].reverse().find(token => token.kind === "space" && /\r?\n/u.test(token.text));
          if (paragraphSeparator && !paragraphSeparator.readings.some(reading => reading.tag === "PARA_END")) {
            paragraphSeparator.readings = [{ token: paragraphSeparator.text, lemma: null,
              tag: "PARA_END", source: "languagetool-paragraph-boundary" }];
          }
        }
        const modelTokens = this.openNlp.tagAndChunk(sentenceText.replaceAll("’", "'"), this.morphology);
        const modelTokensByRange = new Map(modelTokens.map(token => [`${token.start}:${token.end}`, token]));
        const modelChunks = new Map(modelTokens.map(token => [`${token.start}:${token.end}`, token.chunkTags]));
        // Preserve a model hint for proper-name-aware disambiguation rules.
        // Do not replace the lexical readings: spelling and PatternRules need
        // the full dictionary analysis set, while REMOVE/FILTER can protect
        // the model-selected NNP reading where LT's disambiguation requires it.
        const modelProperNameRanges = new Set();
        for (let index = 0; index < modelTokens.length; index++) {
          const current = modelTokens[index];
          if (current.posTag !== "NNP" || !/^\p{Lu}/u.test(current.text || "")) continue;
          const previous = modelTokens[index - 1], next = modelTokens[index + 1];
          if (previous?.posTag === "NNP" && /^\p{Lu}/u.test(previous.text || "")
              || next?.posTag === "NNP" && /^\p{Lu}/u.test(next.text || "")) {
            modelProperNameRanges.add(`${current.start}:${current.end}`);
          }
        }
        let previousEnd = segment.start;
        for (const token of tagged) {
          token.lexicalReadings = [...token.readings];
          token.preDisambiguationReadings = [...token.readings];
          token.contextualReadings = [...token.readings];
          const modelRange = `${token.start - segment.start}:${token.end - segment.start}`;
          const modelToken = modelTokensByRange.get(modelRange);
          token.modelPos = modelToken?.posTag || null;
          token.chunkTags = modelChunks.get(modelRange) || [];
          if (token.kind === "word" && modelProperNameRanges.has(modelRange)) {
            token.modelProperName = true;
          }
          token.contextTrace = [];
          token.immunized = false;
          token.ignoredBySpeller = false;
          token.whitespaceBefore = token.kind !== "space" && Number.isInteger(token.start) && token.start > previousEnd;
          if (token.kind !== "space" && Number.isInteger(token.end)) previousEnd = token.end;
        }
        const multiwordResult = this.multiwordChunker.apply(tagged);
        const contextual = this.disambiguator.disambiguate(multiwordResult.tokens, {
          morphology: this.morphology, traceMatches: options.traceDisambiguation === true,
          traceRuleIds: options.traceDisambiguationRuleIds
        });
        const sentenceEndToken = [...contextual.tokens].reverse().find(token => token.kind !== "space");
        if (sentenceEndToken && !sentenceEndToken.readings.some(reading => reading.tag === "SENT_END")) {
          const reading = { token: sentenceEndToken.text, lemma: sentenceEndToken.readings[0]?.lemma ?? null,
            tag: "SENT_END", source: "languagetool-sentence-boundary" };
          sentenceEndToken.readings.push(reading);
          sentenceEndToken.contextualReadings = [...sentenceEndToken.readings];
        }
        const sentenceIssues = [];
        for (const item of contextual.tokens) {
          if (item.kind !== "word" || item.isUrl || !/[\p{L}\p{Nl}]/u.test(item.text)) continue;
          if (item.ignoredBySpeller) continue;
          if (!this.speller.isMisspelled(item.text, { personalWords: options.personalWords })) continue;
          const issue = {
            id: `MORFOLOGIK_RULE_EN_US:${item.start}:${item.end}`,
            ruleId: "MORFOLOGIK_RULE_EN_US", category: "spelling", severity: "warning",
            message: "Possible spelling mistake found.", shortMessage: "Possible spelling mistake",
            text: item.text, start: item.start, end: item.end,
            replacementStart: item.start, replacementEnd: item.end,
            suggestions: this.speller.suggest(item.text, 5)
          };
          sentenceIssues.push(issue); issues.push(issue);
        }
        sentences.push({ text: sentenceText, start: segment.start, end: segment.end, tokens: contextual.tokens, modelTokens,
          multiwordSpans: multiwordResult.spans,
          disambiguationStats: { matches: contextual.matches, loadedRules: contextual.loadedRules,
            ...(contextual.matchedRuleIds ? { matchedRuleIds: contextual.matchedRuleIds } : {}),
            ...(contextual.tracedRuleEvents ? { tracedRuleEvents: contextual.tracedRuleEvents } : {}) }, issues: sentenceIssues });
      }
      const checkLevel = options.checkLevel || "DEFAULT";
      const filterContext = { morphology: this.morphology, speller: this.speller, filterSpeller: this.filterSpeller, now: options.now };
      const ruleIds = Array.isArray(options.patternRuleIds) ? new Set(options.patternRuleIds) : undefined;
      const patternResults = sentences.map(sentence => this.patternRules.findMatches(sentence.tokens, text, {
        checkLevel, filterContext, ruleIds, traceRuleIds: options.tracePatternRuleIds
      }));
      if (Array.isArray(options.tracePatternRuleIds) && options.tracePatternRuleIds.length) {
        for (let index = 0; index < sentences.length; index++) {
          sentences[index].patternRuleTrace = patternResults[index].traceDetails || [];
        }
      }
      const patternIssues = [
        ...patternResults.flatMap(result => result),
        ...(ruleIds ? [] : this.patternRules.findRepeatedPatternMatches(sentences, text, { checkLevel }))
      ];
      patternIssues.push(...this.regexRules.check(sentences, { checkLevel, ruleIds }));
      const javaIssues = ruleIds ? [] : sentences.flatMap(sentence => {
        const first = sentence.tokens.find(token => token.kind !== "space");
        if (first) first.sentenceStart = true;
        return [...this.specificCaseRule.check(sentence.tokens), ...this.avsAnRule.check(sentence.tokens),
          ...this.simpleReplaceRule.check(sentence.tokens, text, checkLevel, options.enabledRuleIds)].map(issue => ({
          ...issue, text: text.slice(issue.start, issue.end)
        }));
      });
      if (!ruleIds) javaIssues.push(...this.wordCoherencyRule.check(sentences));
      if (!ruleIds) {
        javaIssues.push(...this.repetitionRules.checkAdjacent(sentences));
        javaIssues.push(...this.repetitionRules.checkBeginning(sentences));
        javaIssues.push(...this.repetitionRules.checkRepeatedSynonyms(sentences, { checkLevel, synthesizer: this.synthesizer }));
        javaIssues.push(...globalThis.CorrectorEnglishCompounds.findMatches(sentences, text, this.compoundData, this.speller));
        javaIssues.push(...globalThis.CorrectorEnglishWrongWordContext.check(sentences, this.wrongWordContext));
      }
      if (!ruleIds) javaIssues.push(...sentences.flatMap(sentence => this.contractionSpellingRule.check(sentence)));
      if (!ruleIds && checkLevel === "PICKY") javaIssues.push(...this.dashRule.check(text));
      if (!ruleIds && checkLevel === "PICKY") javaIssues.push(...this.unitConversionRule.check(text));
      if (!ruleIds) javaIssues.push(...this.structuralRules.check(text, segments));
      if (!ruleIds) javaIssues.push(...this.structuralRules.checkCommaWhitespace(sentences));
      if (!ruleIds) javaIssues.push(...this.structuralRules.checkSentenceWhitespace(text, segments));
      if (!ruleIds) javaIssues.push(...this.structuralRules.checkUppercaseSentenceStart(text, segments));
      if (!ruleIds) javaIssues.push(...this.structuralRules.checkUnpairedBrackets(sentences));
      if (!ruleIds) javaIssues.push(...this.structuralRules.checkUnpairedQuotes(sentences));
      if (!ruleIds && checkLevel === "PICKY") javaIssues.push(...this.structuralRules.checkParagraphEndPunctuation(text, segments));
      if (!ruleIds && checkLevel === "PICKY") javaIssues.push(...this.structuralRules.checkLongSentences(sentences, { checkLevel }));
      const priority = issue => {
        const id = String(issue.ruleId || "");
        const explicit = this.rulePriorities[id]
          ?? (id.startsWith("EN_COMPOUNDS_") ? 2
            : id === "PRP_VBZ" ? -2
              : id.startsWith("CONFUSION_RULE_") ? -20
                : id === "EN_UPPER_CASE_NGRAM" ? -12
                  : id.startsWith("AI_SPELLING_RULE") || id.startsWith("EN_MULTITOKEN_SPELLING_") ? -9
                    : id.startsWith("EN_GB_SIMPLE_REPLACE") || id.startsWith("EN_US_SIMPLE_REPLACE") ? -5
                      : id.startsWith("EN_SIMPLE_REPLACE") && /GRAMMES?$/u.test(id) ? -49
                        : id === "EN_DIACRITICS_REPLACE_ORTHOGRAPHY" ? -1 : null);
        let value = explicit != null && explicit !== 0 ? explicit
          : Number.isFinite(issue._languagePriority) && issue._languagePriority !== 0 ? issue._languagePriority
            : /STYLE|REDUNDANCY|PLAIN_ENGLISH/u.test(id) ? -50 : explicit ?? issue._languagePriority ?? 0;
        if (issue._picky) value = -2147483648 + 10000 + value;
        return value;
      };
      const isPunctuationOnlyChange = issue => {
        const suggestion = issue.suggestions?.[0];
        const original = text.slice(issue.start, issue.end);
        if (typeof suggestion !== "string" || suggestion === original) return false;
        const lettersAndDigits = value => [...value].filter(character => /[\p{L}\p{N}]/u.test(character)).join("");
        return lettersAndDigits(original) === lettersAndDigits(suggestion);
      };
      // CleanOverlappingFilter arbitrates spelling and grammar together. Keeping
      // spelling outside this pass left lower-priority grammar marks on top of it.
      const spellingIssues = issues.splice(0);
      for (const sentence of sentences) sentence.issues = [];
      const ordered = [...spellingIssues, ...javaIssues, ...patternIssues].map((issue, index) => ({
        ...issue, _pipelineOrder: Number.isInteger(issue._registrationOrder) ? issue._registrationOrder + javaIssues.length + spellingIssues.length : index
      })).sort((left, right) => left.start - right.start || left.end - right.end || left._pipelineOrder - right._pipelineOrder);
      // SameRuleGroupFilter runs on all candidates before priority arbitration;
      // its overlap test includes touching endpoints, unlike CleanOverlappingFilter.
      const sameGroupFiltered = [];
      for (let index = 0; index < ordered.length; index++) {
        const current = ordered[index];
        while (index < ordered.length - 1 && current.ruleId === ordered[index + 1].ruleId
            && current.start <= ordered[index + 1].end && current.end >= ordered[index + 1].start) index++;
        sameGroupFiltered.push(current);
      }
      const clean = [];
      let previous = null;
      for (const current of sameGroupFiltered) {
        const duplicatesComma = previous && current.start === previous.end
          && previous.suggestions?.[0]?.endsWith(",") && current.suggestions?.[0]?.startsWith(", ");
        if (!previous || (current.start >= previous.end && !duplicatesComma)) {
          if (previous) clean.push(previous);
          previous = current;
          continue;
        }
        let currentPriority = priority(current), previousPriority = priority(previous);
        if (isPunctuationOnlyChange(current) && isPunctuationOnlyChange(previous)
            && Boolean(current._includedAllAtOnce) !== Boolean(previous._includedAllAtOnce)) {
          if (current._includedAllAtOnce && currentPriority < previousPriority) currentPriority = previousPriority + 1;
          else if (previous._includedAllAtOnce && previousPriority < currentPriority) previousPriority = currentPriority + 1;
        }
        if (currentPriority === previousPriority) {
          currentPriority = current.end - current.start;
          previousPriority = previous.end - previous.start;
        }
        if (currentPriority === previousPriority) currentPriority++;
        if (currentPriority > previousPriority) previous = current;
      }
      if (previous) clean.push(previous);
      for (const { _languagePriority, _picky, _includedAllAtOnce, _registrationOrder, _pipelineOrder, ...issue } of clean) {
        issues.push(issue);
        const sentence = sentences.find(item => issue.start < item.end && issue.end > item.start
          || issue.start === issue.end && issue.start >= item.start && issue.start <= item.end);
        if (sentence) sentence.issues.push(issue);
      }
      return { language: "en-US", profile: "en-US", text, stages: [...this.stages], sentences, issues };
    }

    getDiagnostics() {
      return { profile: this.profile, activeStages: [...this.stages], morphology: this.morphology.getStats(),
        synthesisEntries: this.synthesizer.manifest.synthesisIndex.entries,
        numberSynthesis: { source: this.synthesizer.manifest.soros.file, sourceSha256: this.synthesizer.manifest.soros.sha256,
          executableRules: this.synthesizer.numberProgram?.rules.length || 0,
          romanSource: this.synthesizer.manifest.soros.romanFile, romanSourceSha256: this.synthesizer.manifest.soros.romanSha256,
          romanRules: this.synthesizer.romanProgram?.rules.length || 0 },
        openNlp: this.openNlp.getDiagnostics(),
        spelling: { graphNodes: this.speller.manifest.nodes, graphArcs: this.speller.manifest.arcs,
          compressedBytes: this.speller.manifest.compressedBytes, sourceSha256: this.speller.manifest.sourceSha256 },
        disambiguation: this.disambiguator.getDiagnostics?.() || null,
        patternRules: this.patternRules.getDiagnostics(),
        regexRules: { loadedRules: this.regexRules.rules.length },
        multiwords: { ...this.multiwordChunker.counts, sourceHashes: this.multiwordChunker.sourceHashes } };
    }

    static async load(options = {}) {
      const baseUrl = options.baseUrl || globalThis.chrome?.runtime?.getURL("build/resources/en-US/");
      if (!baseUrl) throw new Error("An en-US resource base URL is required outside the extension.");
      // Native fetch is an instance method in Window and WorkerGlobalScope.
      // Passing globalThis.fetch through the pipeline and invoking it later as
      // a plain callback throws "Illegal invocation" in Chromium.
      const fetcher = options.fetcher || globalThis.fetch?.bind(globalThis);
      if (typeof fetcher !== "function") throw new Error("A fetch implementation is required to load en-US resources.");
      const fetchOptions = { baseUrl, fetcher };
      const [morphology, synthesizer, sentenceTokenizer, speller, filterSpeller, openNlp, disambiguationInfo, multiwordChunker, patternRuleInfo, specificCaseRule, avsAnRule, simpleReplaceRule, wordCoherencyRule, repetitionRules, compoundData, wrongWordContext, contractionSpellingRule, rulePriorities, dashRule, regexRules] = await Promise.all([
        globalThis.CorrectorEnglishMorphology.load(fetchOptions), globalThis.CorrectorEnglishSynthesizer.load(fetchOptions),
        globalThis.CorrectorEnglishSentenceTokenizer.load(fetchOptions), globalThis.CorrectorEnglishSpeller.load(fetchOptions),
        globalThis.CorrectorEnglishSpeller.loadFilterSpeller(fetchOptions),
        globalThis.CorrectorEnglishOpenNlp.load(fetchOptions),
        globalThis.CorrectorEnglishXmlDisambiguator.load({ url: new URL("en-disambiguation-rules.json", baseUrl), fetcher: fetchOptions.fetcher }),
        globalThis.CorrectorEnglishMultiwordChunker.load(fetchOptions),
        globalThis.CorrectorEnglishPatternRuleMatcher.load({ url: new URL("en-pattern-rule-candidates.json", baseUrl), fetcher: fetchOptions.fetcher }),
        globalThis.CorrectorEnglishSpecificCase.load({ url: new URL("en-specific-case.json", baseUrl), fetcher: fetchOptions.fetcher }),
        globalThis.CorrectorEnglishAvsAn.load({ baseUrl, fetcher: fetchOptions.fetcher }),
        globalThis.CorrectorEnglishSimpleReplace.load({ url: new URL("en-simple-replace.json", baseUrl), fetcher: fetchOptions.fetcher }),
        globalThis.CorrectorEnglishWordCoherency.load({ url: new URL("en-word-coherency.json", baseUrl), fetcher: fetchOptions.fetcher }),
        globalThis.CorrectorEnglishRepetitions.load({ url: new URL("en-synonyms.json", baseUrl), fetcher: fetchOptions.fetcher }),
        globalThis.CorrectorEnglishCompounds.load({ url: new URL("en-compounds.json", baseUrl), fetcher: fetchOptions.fetcher }),
        globalThis.CorrectorEnglishWrongWordContext.load({ url: new URL("en-wrong-word-context.json", baseUrl), fetcher: fetchOptions.fetcher }),
        globalThis.CorrectorEnglishContractionSpelling.load({ url: new URL("en-contractions.json", baseUrl), fetcher: fetchOptions.fetcher }),
        fetchOptions.fetcher(new URL("en-rule-priorities.json", baseUrl)).then(response => {
          if (!response.ok) throw new Error(`English rule-priority resource fetch failed: ${response.status}`);
          return response.json();
        }),
        globalThis.CorrectorEnglishDashRule.load({ url: new URL("en-dash-compounds.json", baseUrl), fetcher: fetchOptions.fetcher }),
        globalThis.CorrectorEnglishRegexRules.load(fetchOptions)
      ]);
      if (disambiguationInfo.loadedRules !== 1018 || disambiguationInfo.upstreamRules !== 1018) {
        throw new Error("The local en-US disambiguation inventory is incomplete or has drifted.");
      }
      if (patternRuleInfo.sourceRules !== 5798 || patternRuleInfo.loadedRules !== 5798
          || patternRuleInfo.excludedByPortabilityGate !== 0
          || patternRuleInfo.heldOutFilters !== 0 || patternRuleInfo.heldOutNumberSynthesis !== 0) {
        throw new Error("The local en-US PatternRule inventory is incomplete or contains an un-gated dependency.");
      }
      if (rulePriorities?.schemaVersion !== 1 || rulePriorities.profile !== "en-US"
          || rulePriorities.sourceSha256 !== "f90350bf9571ba6b754ce455015ce50905de895d9d915eecd4ea21559d09fb7f"
          || Object.keys(rulePriorities.priorities || {}).length < 300) throw new Error("The local en-US English priority resource is incomplete or has drifted.");
      return new EnglishPipeline({ morphology, synthesizer, sentenceTokenizer, speller, filterSpeller, openNlp,
        disambiguator: globalThis.CorrectorEnglishXmlDisambiguator, multiwordChunker,
        patternRules: globalThis.CorrectorEnglishPatternRuleMatcher, specificCaseRule, avsAnRule, simpleReplaceRule, wordCoherencyRule, repetitionRules, compoundData, wrongWordContext, contractionSpellingRule, dashRule, unitConversionRule: new globalThis.CorrectorEnglishUnitConversion.EnglishUnitConversion(), structuralRules: new globalThis.CorrectorEnglishStructuralRules(), rulePriorities, regexRules });
    }
  }
  globalThis.CorrectorEnglishPipeline = EnglishPipeline;
})();
