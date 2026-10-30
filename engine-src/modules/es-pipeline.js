/* Independent local lexical-analysis pipeline for Spanish (es-ES). */
(() => {
  "use strict";

  function continuationTagForSpanishChunk(tag) {
    // MultiWordChunker.getNextPosTag() uses adjective agreement tags for
    // noun chunks in Spanish (and keeps the same tag for other chunk types).
    return typeof tag === "string" && tag.startsWith("NC") ? `AQ0${tag.slice(2, 4)}0` : tag;
  }

  const SPANISH_RULE_PRIORITIES = new Map([
    // Spanish.java#getPriorityMap(): explicit rule priorities override the
    // PatternRule category/default priority in CleanOverlappingFilter.
    ["ES_SIMPLE_REPLACE_MULTIWORDS", 50], ["LOS_MAPUCHE", 50], ["TE_TILDE", 50], ["DE_TILDE", 50],
    ["PLURAL_SEPARADO", 50], ["PERSONAJES_FAMOSOS", 50], ["NO_SEPARADO", 40], ["PARTICIPIO_MS", 40],
    ["VERBO_MODAL_INFINITIVO", 40], ["EL_NO_TILDE", 40], ["SE_CREO", 35], ["POR_CIERTO", 30],
    ["DEGREE_CHAR", 30], ["LO_LOS", 30], ["ETCETERA", 30], ["P_EJ", 30], ["SE_CREO2", 25],
    ["AGREEMENT_ADJ_NOUN_AREA", 30], ["PRONOMBRE_SIN_VERBO", 25], ["AGREEMENT_DET_ABREV", 25],
    ["MUCHO_NF", 25], ["AGREEMENT_DET_NOUN_EXCEPTIONS", 25], ["TYPOGRAPHY", 20],
    ["MISSPELLING", 40], ["CONFUSIONS", 40], ["CONFUSIONS2", 50], ["INCORRECT_EXPRESSIONS", 40],
    ["DIACRITICS", 30], ["RARE_WORDS", 50],
    ["PRIMER_PRIMERA", 20], ["AGREEMENT_DET_NOUN", 15], ["AGREEMENT_DET_ADJ", 10],
    ["CONFUSION_ES_SE", 20], ["HALLA_HAYA", 10], ["VALLA_VAYA", 10], ["SI_AFIRMACION", 10],
    ["TE_TILDE2", 10], ["SEPARADO", 1], ["ES_SPLIT_WORDS", -10], ["U_NO", -10],
    ["EL_TILDE", -10], ["SINGLE_CHARACTER", -15], ["TOO_LONG_PARAGRAPH", -15], ["PREP_VERB", -20],
    ["SUBJUNTIVO_FUTURO", -30], ["SUBJUNTIVO_PASADO", -30], ["SUBJUNTIVO_PASADO2", -30],
    ["AGREEMENT_ADJ_NOUN", -30], ["AGREEMENT_PARTICIPLE_NOUN", -30], ["AGREEMENT_POSTPONED_ADJ", -30],
    ["MULTI_ADJ", -30], ["SUBJUNTIVO_INCORRECTO", -40], ["COMMA_SINO", -40], ["COMMA_SINO2", -40],
    ["VOSEO", -40], ["REPETITIONS_STYLE", -50], ["MORFOLOGIK_RULE_ES", -100],
    ["PHRASE_REPETITION", -150], ["SPANISH_WORD_REPEAT_RULE", -150],
    ["UPPERCASE_SENTENCE_START", -200], ["ES_QUESTION_MARK", -250],
    // Java-only rules not included in the PatternRule snapshot.
    ["ES_COMPOUNDS", 50], ["ES_SIMPLE_REPLACE_SIMPLE", 30],
    ["SPANISH_WORD_REPEAT_BEGINNING_RULE", -50], ["SPANISH_REPEATED_WORDS", -50],
    ["DOUBLE_PUNCTUATION", 0], ["ES_UNPAIRED_BRACKETS", 0], ["INCORRECT_SPACES", 20],
    ["ES_INITIAL_QUESTION_MARK", 0], ["CAPITALIZATION_AFTER_QUESTION_MARK", 0]
  ]);

  function overlapPriority(issue) {
    const ruleId = String(issue.ruleId || "");
    const idPriority = SPANISH_RULE_PRIORITIES.get(ruleId)
      ?? (ruleId.startsWith("ES_SIMPLE_REPLACE_SIMPLE_") ? 30
        : ruleId.startsWith("ES_COMPOUNDS") ? 50
          : ruleId.startsWith("ES_MULTITOKEN_SPELLING") ? -95
            : ruleId.startsWith("AI_ES_HYDRA_LEO") ? -101
              : ruleId.startsWith("AI_ES_GGEC") ? (ruleId === "AI_ES_GGEC_REPLACEMENT_OTHER" ? -300 : 0)
                : null);
    // Language.getRulePriority uses a non-zero ID override first, then the
    // PatternRule priority, and then the category fallback. Thus an exported
    // zero priority must not mask a non-zero category priority.
    let priority = idPriority != null && idPriority !== 0 ? idPriority
      : Number.isFinite(issue._priority) && issue._priority !== 0 ? issue._priority
        : SPANISH_RULE_PRIORITIES.get(String(issue.category || ""))
          ?? (issue.category === "spelling" ? 40 : /STYLE|REPETITION/u.test(String(issue.category || "")) ? -50 : idPriority ?? issue._priority ?? 0);
    return issue._picky ? priority - 2147473648 : priority;
  }

  function isPunctuationOnlySuggestion(issue, text) {
    const suggestion = issue.suggestions?.[0];
    if (typeof suggestion !== "string") return false;
    const original = text.slice(issue.start, issue.end);
    if (suggestion === original) return false;
    const keepLettersAndDigits = value => [...value].filter(character => /[\p{L}\p{N}]/u.test(character)).join("");
    return keepLettersAndDigits(original) === keepLettersAndDigits(suggestion);
  }

  function cleanOverlappingIssues(issues, text) {
    const ordered = [...issues].sort((left, right) => left.start - right.start || left.end - right.end
      || (left._registrationOrder ?? 0) - (right._registrationOrder ?? 0));
    const clean = [];
    let previous = null;
    for (const current of ordered) {
      if (!previous) { previous = current; continue; }
      let duplicateSuggestion = false;
      const currentSuggestion = current.suggestions?.[0], previousSuggestion = previous.suggestions?.[0];
      if (currentSuggestion && previousSuggestion && current.start === previous.end
          && previousSuggestion.endsWith(",") && currentSuggestion.startsWith(", ")) duplicateSuggestion = true;
      if (currentSuggestion?.includes(" ") && previousSuggestion?.includes(" ") && current.start === previous.end + 1) {
        const currentParts = currentSuggestion.split(" "), previousParts = previousSuggestion.split(" ");
        if (previousParts.length > 1 && currentParts.length > 1 && previousParts[1] === currentParts[0]) duplicateSuggestion = true;
      }
      if (current.start >= previous.end && !duplicateSuggestion) {
        clean.push(previous); previous = current; continue;
      }
      let currentPriority = overlapPriority(current), previousPriority = overlapPriority(previous);
      if (isPunctuationOnlySuggestion(current, text) && isPunctuationOnlySuggestion(previous, text)
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
    return clean;
  }

  class SpanishPipeline {
    constructor({ morphology, tagger, synthesizer, sentenceTokenizer, chunker, disambiguator, spellingData, filterSpeller = null, multitokenSpellerData, simpleReplaceData, simpleReplaceVerbData, wrongWordContextData, compoundsData, repeatedWordsData = null, confusionPairsData = null, structuralRules = globalThis.CorrectorSpanishStructuralRules, patternRules = globalThis.CorrectorSpanishPatternRuleMatcher, patternRuleDiagnostics = null }) {
      if (!(morphology instanceof globalThis.CorrectorSpanishMorphology) || !tagger || !globalThis.CorrectorSpanishSpelling || !(synthesizer instanceof globalThis.CorrectorSpanishSynthesizer) || !(sentenceTokenizer instanceof globalThis.CorrectorSpanishSentenceTokenizer) || !(chunker instanceof globalThis.CorrectorSpanishChunker) || !disambiguator || !structuralRules || !patternRules) throw new Error("Faltan componentes exclusivos del pipeline es-ES.");
      this.morphology = morphology;
      this.tagger = tagger;
      this.synthesizer = synthesizer;
      this.sentenceTokenizer = sentenceTokenizer;
      this.chunker = chunker;
      this.disambiguator = disambiguator;
      this.spellingData = spellingData;
      this.filterSpeller = filterSpeller;
      this.multitokenSpellerData = multitokenSpellerData;
      this.simpleReplaceData = simpleReplaceData;
      this.simpleReplaceVerbData = simpleReplaceVerbData;
      this.wrongWordContextData = wrongWordContextData;
      this.compoundsData = compoundsData;
      this.repeatedWordsData = repeatedWordsData;
      this.confusionPairsData = confusionPairsData;
      this.structuralRules = structuralRules;
      this.patternRules = patternRules;
      this.patternRuleDiagnostics = patternRuleDiagnostics;
      this.patternRules.configureLexicalLookup(word => this.tagger.tagToken({ text: word, kind: "word" }, this.morphology).readings);
      this.patternRules.configureSynthesizer(this.synthesizer);
      this.patternRules.configureMultitokenSpeller(this.multitokenSpellerData);
      this.profile = "es-ES";
    }

    analyzeText(text, options = {}) {
      if (typeof text !== "string") throw new TypeError("El texto que se va a analizar debe ser una cadena.");
      const inputSegments = Array.isArray(options.sentenceSegments) ? options.sentenceSegments : this.sentenceTokenizer.segment(text);
      const sentences = inputSegments.map((sentence, sentenceIndex) => {
        if (!Number.isInteger(sentence.start) || !Number.isInteger(sentence.end) || sentence.start < 0 || sentence.end > text.length || sentence.end < sentence.start) throw new Error("Frontera de oración forzada inválida.");
        sentence = { ...sentence, text: typeof sentence.text === "string" ? sentence.text : text.slice(sentence.start, sentence.end) };
        const nextText = String(inputSegments[sentenceIndex + 1]?.text ?? "");
        const paragraphEnd = sentenceIndex === inputSegments.length - 1
          || /(?:\n\n|\r\n\r\n|\n\r\n\r)$/u.test(sentence.text)
          || /^\n|^\r\n/u.test(nextText);
        const tokens = globalThis.CorrectorSpanishText.tokenize(sentence.text, this.morphology);
        let lastVisible = tokens.length - 1;
        while (lastVisible >= 0 && tokens[lastVisible].kind === "space") lastVisible--;
        const tagged = tokens.map((token, index) => {
          const sentenceEnd = index === lastVisible;
          const isParagraphEnd = sentenceEnd && paragraphEnd;
          if (token.kind !== "word" && token.kind !== "punctuation") return { ...token, known: false, readings: [], lexicalReadings: [], preDisambiguationReadings: [], contextualReadings: [], chunkTags: [], contextTrace: [], immunized: false, ignoredBySpeller: false };
          if (token.kind === "punctuation") {
            // Mirror Spanish disambiguation.xml: comma-like quotation and
            // opening punctuation receive _PUNCT_CONT (and later _QM_OPEN /
            // _QM_CLOSE where applicable), while _PUNCT is reserved for the
            // punctuation class in the PUNCT rule. Treating quotes as _PUNCT
            // falsely satisfied patterns such as SENT_START|_PUNCT inside a
            // quoted phrase.
            const continuousPunctuation = /^[,'"’“”«»¡¿]$/u.test(token.text);
            const punctuationTag = continuousPunctuation ? "_PUNCT_CONT" : "_PUNCT";
            const readings = [{ token: token.text, lemma: token.text, tag: punctuationTag, source: "languagetool-punctuation" }];
            const previous = tokens.slice(0, index).reverse().find(value => value.kind !== "space")?.text ?? "";
            const next = tokens.slice(index + 1).find(value => value.kind !== "space")?.text ?? "";
            const normalizedPrevious = previous.toLocaleLowerCase("es");
            const typographicApostrophe = token.text === "’"
              && (["l", "d"].includes(normalizedPrevious) || next.toLocaleLowerCase("es") === "s");
            return { ...token, ...(typographicApostrophe ? { typographicApostrophe: true } : {}), isSentenceEnd: sentenceEnd, isParagraphEnd, known: true, readings, lexicalReadings: readings, preDisambiguationReadings: readings, contextualReadings: readings, chunkTags: [], contextTrace: [], immunized: false, ignoredBySpeller: false };
          }
          if (token.isUrl || /^(?:https?|ftps?|wss?|file|mailto):\/\//iu.test(token.text) || /^www\./iu.test(token.text)) {
            const readings = [{ token: token.text, lemma: "IS_URL", tag: "IS_URL", source: "languagetool-url" }];
            return { ...token, isSentenceEnd: sentenceEnd, isParagraphEnd, known: true, readings, lexicalReadings: readings, preDisambiguationReadings: readings, contextualReadings: readings, chunkTags: [], contextTrace: [], immunized: false, ignoredBySpeller: false };
          }
          const tagged = /^\d+$/u.test(token.text)
            ? { ...token, known: true, readings: [{ lemma: "numeral", tag: "NCCN000", source: "languagetool-number" }, { lemma: "numeral", tag: "DN0CP0", source: "languagetool-number" }] }
            : this.tagger.tagToken(token, this.morphology, { previousText: tokens[index - 1]?.text ?? "", nextText: tokens[index + 1]?.text ?? "" });
          const spellingEligible = /^\p{L}[\p{L}\p{M}]*$/u.test(token.text);
          const misspelled = spellingEligible && globalThis.CorrectorSpanishSpelling.isMisspelled(token.text, this.morphology, { spellData: this.spellingData });
          const readings = tagged.readings.map(reading => ({ ...reading, token: reading.token ?? token.text }));
          return { ...tagged, isSentenceEnd: sentenceEnd, isParagraphEnd, readings, lexicalReadings: readings, preDisambiguationReadings: readings, contextualReadings: readings, chunkTags: [], contextTrace: [], immunized: false, ignoredBySpeller: false, misspelled, suggestions: misspelled ? globalThis.CorrectorSpanishSpelling.suggest(token.text, this.morphology, { spellData: this.spellingData }) : [] };
        });
        const chunked = this.chunker.disambiguate(tagged);
        for (const match of chunked.matches) {
          const anchor = chunked.tokens[match.start];
          if (!anchor.chunkTags.includes(match.tag)) anchor.chunkTags.push(match.tag);
          if (match.kind === "spanish" && match.end > match.start) {
            // SpanishHybridDisambiguator runs MultiWordChunker with
            // removePreviousTags=true. Once a multi-token Spanish expression
            // is recognized, its component words must not keep unrelated
            // lexical readings (e.g. `contra` as a preposition inside `por
            // contra`, or `estar` as an infinitive inside `cuarto de estar`).
            // The first token carries the expression POS; the rest carry the
            // continuation POS used by LanguageTool's ES/CA chunker.
            let first = true;
            for (let index = match.start; index <= match.end; index++) {
              const token = chunked.tokens[index];
              if (token.kind === "space") continue;
              const tag = first ? match.tag : continuationTagForSpanishChunk(match.tag);
              const compoundReading = { token: token.text, lemma: match.lemma, tag, source: "languagetool-multiword" };
              const sentenceEndReading = token.contextualReadings.find(reading => reading.tag === "SENT_END");
              token.contextualReadings = sentenceEndReading ? [compoundReading, sentenceEndReading] : [compoundReading];
              token.readings = token.contextualReadings;
              first = false;
            }
          } else {
            // Global spelling multiwords annotate tokens but do not use the
            // Spanish chunker's removePreviousTags pass.
            for (let index = match.start; index <= match.end; index++) {
              const token = chunked.tokens[index];
              if (token.kind === "space") continue;
              const compoundReading = { token: token.text, lemma: match.lemma, tag: match.tag, source: "languagetool-multiword" };
              if (!token.contextualReadings.some(reading => reading.lemma === compoundReading.lemma && reading.tag === compoundReading.tag)) token.contextualReadings.push(compoundReading);
              token.readings = token.contextualReadings;
            }
          }
        }
        // LanguageTool's disambiguation XML uses spacebefore constraints for
        // quote opening/closing and several clitic/phrase rules. Populate the
        // spacing signal before disambiguation so those rules see the same
        // token context as PatternRuleMatcher does later.
        let lexicalPreviousEnd = 0;
        for (const token of chunked.tokens) {
          if (token.kind === "space") continue;
          token.whitespaceBefore = Number.isInteger(token.start) && token.start > lexicalPreviousEnd;
          if (Number.isInteger(token.end)) lexicalPreviousEnd = token.end;
        }
        const contextual = this.disambiguator.disambiguate(chunked.tokens, { traceMatches: options.traceDisambiguation === true });
        for (const match of chunked.matches) if (match.tag.startsWith("NP")) {
          for (let index = match.start; index <= match.end; index++) {
            const token = contextual.tokens[index];
            if (token.known === false && /^\p{Lu}{2,}$/u.test(token.text)
                && !token.contextualReadings.some(reading => reading.tag === "_possible_NP")) {
              token.contextualReadings.push({ token: token.text, lemma: token.text, tag: "_possible_NP", source: "languagetool-capitalized-unknown" });
              token.readings = token.contextualReadings;
            }
          }
        }
        const finalTokens = contextual.tokens.map((token, index) => {
          const contextualReadings = [...(token.contextualReadings || [])];
          return { ...token,
            isSentenceEnd: index === lastVisible,
            isParagraphEnd: index === lastVisible && paragraphEnd,
            readings: contextualReadings,
            contextualReadings,
            lexicalReadings: token.lexicalReadings || token.preDisambiguationReadings || contextualReadings,
            preDisambiguationReadings: token.preDisambiguationReadings || token.lexicalReadings || contextualReadings,
            start: token.start == null ? null : token.start + sentence.start,
            end: token.end == null ? null : token.end + sentence.start
          };
        });
        let previousEnd = sentence.start;
        for (const token of finalTokens) {
          if (token.kind === "space") continue;
          token.whitespaceBefore = Number.isInteger(token.start) && token.start > previousEnd;
          if (Number.isInteger(token.end)) previousEnd = token.end;
        }
        return { ...sentence, chunkStats: chunked, disambiguationStats: { matches: contextual.matches, loadedRules: contextual.loadedRules, ...(contextual.matchedRuleIds ? { matchedRuleIds: contextual.matchedRuleIds } : {}) }, tokens: finalTokens };
      });
      const structuralIssues = this.structuralRules.checkText(text, { sentenceSegments: sentences });
      const spellingIssues = sentences.flatMap(sentence => sentence.tokens)
        .filter(token => token.kind === "word" && token.misspelled && !token.ignoredBySpeller && Number.isInteger(token.start) && Number.isInteger(token.end) && token.end > token.start)
        .map(token => ({
          id: `MORFOLOGIK_RULE_ES:${token.start}:${token.end}`,
          ruleId: "MORFOLOGIK_RULE_ES",
          category: "spelling",
          severity: "warning",
          shortMessage: "Error ortográfico",
          message: "Posible error ortográfico.",
          text: text.slice(token.start, token.end),
          start: token.start,
          end: token.end,
          replacementStart: token.start,
          replacementEnd: token.end,
          suggestions: Array.isArray(token.suggestions) ? token.suggestions : []
        }));
      const filterContext = { morphology: this.morphology, synthesizer: this.synthesizer, spellingData: this.spellingData, filterSpeller: this.filterSpeller, confusionPairs: this.confusionPairsData, now: options.now };
      const checkLevel = options.checkLevel || "DEFAULT";
      const patternIssues = [
        ...sentences.flatMap(sentence => this.patternRules.findMatches(sentence.tokens, text, { filterContext, checkLevel })),
        ...(this.patternRules.findRepeatedPatternMatches?.(sentences, text, { checkLevel }) ?? [])
      ];
      const simpleReplaceIssues = globalThis.CorrectorSpanishSimpleReplace?.findMatches(sentences, this.simpleReplaceData, patternIssues) ?? [];
      const simpleReplaceVerbIssues = globalThis.CorrectorSpanishSimpleReplaceVerbs?.findMatches(sentences, this.simpleReplaceVerbData, { morphology: this.morphology, synthesizer: this.synthesizer, shadowedIssues: [...patternIssues, ...simpleReplaceIssues] }) ?? [];
      const wrongWordContextIssues = globalThis.CorrectorSpanishWrongWordContext?.findMatches(sentences, this.wrongWordContextData) ?? [];
      const compoundsIssues = globalThis.CorrectorSpanishCompounds?.findMatches(sentences, this.compoundsData, this.morphology) ?? [];
      const wordRepeatIssues = globalThis.CorrectorSpanishWordRepeat?.findMatches(sentences) ?? [];
      const wordRepeatBeginningIssues = globalThis.CorrectorSpanishWordRepeatBeginning?.findMatches(sentences, { checkLevel: options.checkLevel || "DEFAULT" }) ?? [];
      const repeatedWordsIssues = globalThis.CorrectorSpanishRepeatedWords?.findMatches(sentences, this.repeatedWordsData, { morphology: this.morphology, synthesizer: this.synthesizer, checkLevel: options.checkLevel || "DEFAULT" }) ?? [];
      const questionMarkCandidates = globalThis.CorrectorSpanishQuestionMarkRule?.findMatches(sentences) ?? [];
      const longSentenceIssues = globalThis.CorrectorSpanishLongSentenceRule?.findMatches(sentences, text, { checkLevel: options.checkLevel || "DEFAULT" }) ?? [];
      const longParagraphIssues = globalThis.CorrectorSpanishLongParagraphRule?.findMatches(sentences, text, { checkLevel: options.checkLevel || "DEFAULT" }) ?? [];
      // Spanish.getPriorityForId() assigns ES_QUESTION_MARK -250, below
      // ordinary, spelling, style, and uppercase-start alerts. Port this
      // LanguageTool overlap policy so the punctuation hint cannot hide a
      // more informative correction on the same text.
      // JLanguageTool registers Language.getRelevantRules() (the specialized
      // Java rule families) before activateDefaultPatternRules(). Preserve
      // that order for equal-range/equal-priority tie breaking: PatternRules
      // should be considered after SimpleReplace, spelling and other built-in
      // rules, as in CleanOverlappingFilter's stable final tie resolution.
      const nonQuestionIssues = [...structuralIssues, ...simpleReplaceIssues, ...simpleReplaceVerbIssues, ...wrongWordContextIssues, ...compoundsIssues, ...wordRepeatIssues, ...wordRepeatBeginningIssues, ...repeatedWordsIssues, ...longSentenceIssues, ...longParagraphIssues, ...spellingIssues, ...patternIssues];
      const questionMarkIssues = questionMarkCandidates.filter(candidate => !nonQuestionIssues.some(issue => issue.start < candidate.end && issue.end > candidate.start));
      const combinedIssues = [...nonQuestionIssues, ...questionMarkIssues];
      // Distinct rule sources can emit the same exact correction. Keep the
      // richer issue so equivalent warnings do not appear twice.
      const issueKeys = new Map();
      const issues = [];
      for (const issue of combinedIssues) {
        const key = JSON.stringify([issue.ruleId, issue.start, issue.end, [...(issue.suggestions || [])].sort()]);
        const previousIndex = issueKeys.get(key);
        if (previousIndex == null) {
          issueKeys.set(key, issues.length);
          issues.push(issue);
        } else {
          const previous = issues[previousIndex];
          const score = candidate => Number(Boolean(candidate.text)) + Number(Boolean(candidate.rule)) + Number(Boolean(candidate.message)) + Number(Boolean(candidate.replacementStart != null));
          if (score(issue) > score(previous)) issues[previousIndex] = issue;
        }
      }
      const cleanedIssues = cleanOverlappingIssues(issues, text);
      return { profile: this.profile, textLengthUtf16: text.length, sentences, issues: cleanedIssues, stats: { ...this.morphology.getStats(), chunker: this.chunker.counts, patternRules: this.patternRuleDiagnostics ?? this.patternRules.getDiagnostics?.() ?? null } };
    }

    synthesize(lemma, tag, options) { return this.synthesizer.synthesize(lemma, tag, options); }

    getDiagnostics() {
      return {
        profile: this.profile,
        morphology: this.morphology.getStats?.() || null,
        chunker: this.chunker.counts || null,
        disambiguation: this.disambiguator.getDiagnostics?.() || null,
        patternRules: this.patternRuleDiagnostics ?? this.patternRules.getDiagnostics?.() ?? null,
        spelling: {
          words: Object.keys(this.spellingData || {}).length,
          filterSpellerLoaded: Boolean(this.filterSpeller),
          multitokenSpellerLoaded: Boolean(this.multitokenSpellerData)
        }
      };
    }

    static async load(options = {}) {
      const base = options.baseUrl || globalThis.chrome?.runtime?.getURL("build/resources/es-ES/");
      if (!base) throw new Error("Se debe indicar baseUrl para cargar el pipeline es-ES fuera de la extensión.");
      // Keep the browser receiver bound when passing the native fetch method
      // into resource loaders. Chromium rejects an unbound fetch callback.
      const fetcher = options.fetcher || globalThis.fetch?.bind(globalThis);
      if (typeof fetcher !== "function") throw new Error("Se necesita una implementación de fetch para cargar los recursos es-ES.");
      const [morphology, synthesizer, sentenceTokenizer, chunker, disambiguator, spellingResponse, filterSpeller, multitokenSpellerResponse, manualTagsResponse, simpleReplaceResponse, wrongWordContextResponse, compoundsResponse, synonymsResponse, confusionPairsResponse, patternRuleDiagnostics] = await Promise.all([
        globalThis.CorrectorSpanishMorphology.load({ baseUrl: base, fetcher }),
        globalThis.CorrectorSpanishSynthesizer.load({ baseUrl: base, fetcher }),
        globalThis.CorrectorSpanishSentenceTokenizer.load({ url: new URL("es-srx.json", base), fetcher }),
        globalThis.CorrectorSpanishChunker.load({ url: new URL("es-multiword.json", base), fetcher }),
        globalThis.CorrectorSpanishXmlDisambiguator.load({ url: new URL("es-disambiguation-rules.json", base), fetcher }),
        fetcher(new URL("es-spelling-data.json", base)),
        globalThis.CorrectorSpanishFilterSpeller?.load({ baseUrl: base, fetcher }) ?? Promise.resolve(null),
        fetcher(new URL("es-multitoken-speller.json", base)),
        fetcher(new URL("es-manual-tags.json", base)),
        fetcher(new URL("es-simple-replace.json", base)),
        fetcher(new URL("es-wrong-word-context.json", base)),
        fetcher(new URL("es-compounds.json", base)),
        fetcher(new URL("es-synonyms.json", base)),
        fetcher(new URL("es-confusion-pairs.json", base)),
        globalThis.CorrectorSpanishPatternRuleMatcher.load({ url: new URL("es-pattern-rule-candidates.json", base), fetcher })
      ]);
      if (!spellingResponse.ok) throw new Error(`No se pudo cargar el recurso ortográfico es-ES (${spellingResponse.status}).`);
      if (!multitokenSpellerResponse.ok) throw new Error(`No se pudo cargar el recurso multitérmino es-ES (${multitokenSpellerResponse.status}).`);
      if (!manualTagsResponse.ok) throw new Error(`No se pudo cargar el overlay POS manual es-ES (${manualTagsResponse.status}).`);
      if (!simpleReplaceResponse.ok) throw new Error(`No se pudo cargar SimpleReplace es-ES (${simpleReplaceResponse.status}).`);
      if (!wrongWordContextResponse.ok) throw new Error(`No se pudo cargar WrongWordInContext es-ES (${wrongWordContextResponse.status}).`);
      if (!compoundsResponse.ok) throw new Error(`No se pudo cargar ES_COMPOUNDS es-ES (${compoundsResponse.status}).`);
      if (!synonymsResponse.ok) throw new Error(`No se pudo cargar el diccionario de sinónimos es-ES (${synonymsResponse.status}).`);
      if (!confusionPairsResponse.ok) throw new Error(`No se pudo cargar el recurso de pares de confusión es-ES (${confusionPairsResponse.status}).`);
      morphology.configureManualTags(await manualTagsResponse.json());
      const spellingData = globalThis.CorrectorSpanishSpelling.createDataIndex(await spellingResponse.json());
      const multitokenSpellerData = await multitokenSpellerResponse.json();
      const simpleReplaceResource = await simpleReplaceResponse.json();
      const simpleReplaceData = globalThis.CorrectorSpanishSimpleReplace.createDataIndex(simpleReplaceResource);
      const simpleReplaceVerbData = globalThis.CorrectorSpanishSimpleReplaceVerbs.createDataIndex(simpleReplaceResource);
      const wrongWordContextData = globalThis.CorrectorSpanishWrongWordContext.createDataIndex(await wrongWordContextResponse.json());
      const compoundsData = globalThis.CorrectorSpanishCompounds.createDataIndex(await compoundsResponse.json());
      const synonymsResource = await synonymsResponse.json();
      const repeatedWordsData = globalThis.CorrectorSpanishRepeatedWords?.createDataIndex?.(synonymsResource) ?? null;
      const confusionPairsResource = await confusionPairsResponse.json();
      if (confusionPairsResource?.schemaVersion !== 1 || confusionPairsResource.profile !== "es-ES" || confusionPairsResource.rowCount !== 1008 || !confusionPairsResource.pairs) throw new Error("El recurso de pares de confusión no pertenece a la instantánea es-ES fijada.");
      return new SpanishPipeline({ morphology, tagger: globalThis.CorrectorSpanishTagger, synthesizer, sentenceTokenizer, chunker, disambiguator: globalThis.CorrectorSpanishXmlDisambiguator, spellingData, filterSpeller, multitokenSpellerData, simpleReplaceData, simpleReplaceVerbData, wrongWordContextData, compoundsData, repeatedWordsData, confusionPairsData: confusionPairsResource.pairs, patternRules: globalThis.CorrectorSpanishPatternRuleMatcher, patternRuleDiagnostics });
    }
  }

  globalThis.CorrectorSpanishPipeline = SpanishPipeline;
})();
