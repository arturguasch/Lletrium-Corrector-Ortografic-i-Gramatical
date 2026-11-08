/* French XML rule candidate pipeline. Proof ZIP only; not enabled as a UI profile. */
(() => {
  "use strict";

  const RULES_URL = "src/dictionaries/french/french-pattern-rule-candidates.json";
  // LanguageTool's Canadian, Swiss and Belgian subclasses disable this one
  // regionalism rule. Keep a shared French base and apply only source-backed
  // per-profile overrides instead of duplicating the 6k-rule bundle.
  const PROFILE_DISABLED_RULES = Object.freeze({
    "fr-FR": Object.freeze([]),
    "fr-CA": Object.freeze(["DOUBLER_UNE_CLASSE"]),
    "fr-CH": Object.freeze(["DOUBLER_UNE_CLASSE"]),
    "fr-BE": Object.freeze(["DOUBLER_UNE_CLASSE"])
  });

// Priorities copied from LanguageTool's French.getPriorityForId(). They are
// used only when two notices overlap, matching LT's CleanOverlappingFilter.
const FRENCH_RULE_PRIORITIES = Object.freeze({
  A_INFINITIF: 100,
  SONT_SON: 100,
  TRAIT_UNION: 100,
  R_VAVOIR_VINF: 10,
  EST_CE_QUE: 20
});

function frenchRulePriority(issue) {
  const id = issue.meta?.ruleGroupId || issue.meta?.sourceRule || issue.ruleId || "";
  if (Object.hasOwn(FRENCH_RULE_PRIORITIES, id)) return FRENCH_RULE_PRIORITIES[id];
  if (id.startsWith("FR_COMPOUNDS")) return 500;
  if (["CAT_TYPOGRAPHIE", "CAT_TOURS_CRITIQUES", "CAT_HOMONYMES_PARONYMES"].includes(issue.category)) return 20;
  if (id.startsWith("FR_SIMPLE_REPLACE")) return 150;
  return 0;
}

function cleanFrenchOverlaps(issues) {
  const ordered = issues.map((issue, order) => ({ issue, order }))
    .sort((a, b) => a.issue.start - b.issue.start || a.issue.end - b.issue.end || a.order - b.order);
  const kept = [];
  let previous = null;
  for (const current of ordered) {
    if (!previous) { previous = current; continue; }
    if (current.issue.start >= previous.issue.end) {
      kept.push(previous.issue);
      previous = current;
      continue;
    }
    const currentPriority = frenchRulePriority(current.issue);
    const previousPriority = frenchRulePriority(previous.issue);
    const currentLength = current.issue.end - current.issue.start;
    const previousLength = previous.issue.end - previous.issue.start;
    if (currentPriority > previousPriority
      || (currentPriority === previousPriority && currentLength > previousLength)
      || (currentPriority === previousPriority && currentLength === previousLength && current.order > previous.order)) {
      previous = current;
    }
  }
  if (previous) kept.push(previous.issue);
  return kept;
}

  class FrenchPatternPipeline {
    constructor({ lexicalData, tokenizer, sentenceTokenizer, rules, runtime, simpleReplaceData, repeatedWordsData, compoundsData, disambiguationData }) {
      this.lexicalData = lexicalData;
      this.tokenizer = tokenizer;
      this.sentenceTokenizer = sentenceTokenizer;
      this.speller = lexicalData.createSpeller();
      this.rules = rules;
      this.runtime = runtime;
      this.simpleReplaceData = simpleReplaceData;
      this.repeatedWordsData = repeatedWordsData;
      this.compoundsData = compoundsData;
      this.disambiguationData = disambiguationData;
      this.checkCount = 0;
    }

    static async load({ fetcher = globalThis.fetch?.bind(globalThis) } = {}) {
      if (typeof fetcher !== "function") throw new Error("A fetch implementation is required to load French rules.");
      const runtimeType = globalThis.CorrectorLtPatternRuntime;
      const lexicalType = globalThis.CorrectorFrenchLexicalData?.FrenchLexicalData;
      const tokenizerType = globalThis.CorrectorFrenchWordTokenizer;
      const sentenceTokenizerType = globalThis.CorrectorFrenchSentenceTokenizer;
      const whitespaceRule = globalThis.CorrectorFrenchWhitespaceRule;
      const commaWhitespaceRule = globalThis.CorrectorFrenchCommaWhitespaceRule;
      const simpleReplaceRule = globalThis.CorrectorFrenchSimpleReplaceRule;
      const corePunctuationRule = globalThis.CorrectorFrenchCorePunctuationRule;
      const uppercaseSentenceRule = globalThis.CorrectorFrenchUppercaseSentenceRule;
      const repeatedWordsRule = globalThis.CorrectorFrenchRepeatedWordsRule;
      const compoundsRule = globalThis.CorrectorFrenchCompoundsRule;
      const englishMorphologyType = globalThis.CorrectorEnglishMorphology;
      if (!runtimeType || !lexicalType || !tokenizerType || !sentenceTokenizerType || !whitespaceRule || !commaWhitespaceRule || !simpleReplaceRule || !corePunctuationRule || !uppercaseSentenceRule || !repeatedWordsRule || !compoundsRule) throw new Error("French proof runtime components are unavailable.");
      if (!englishMorphologyType || !globalThis.CorrectorEnglishTagger?.tagToken) throw new Error("The pinned English POS adapter required by French disambiguation is unavailable.");
      const [lexicalData, englishMorphology, response, sentenceResponse, simpleReplaceData, repeatedWordsData, compoundsData, disambiguationResponse, chunkerResponse] = await Promise.all([
        lexicalType.load({ fetcher }),
        englishMorphologyType.load({ baseUrl: globalThis.chrome.runtime.getURL("build/resources/fr/en-pos/"), fetcher }),
        fetcher(new URL(RULES_URL, globalThis.chrome?.runtime?.getURL("/") || new URL("/", location.href))),
        fetcher(globalThis.chrome.runtime.getURL("build/resources/fr/fr-srx.json")),
        simpleReplaceRule.load({ fetcher }),
        repeatedWordsRule.load({ fetcher }),
        compoundsRule.load({ fetcher }),
        fetcher(globalThis.chrome.runtime.getURL("build/resources/fr/fr-disambiguation-rules.json")),
        fetcher(globalThis.chrome.runtime.getURL("build/resources/fr/fr-hybrid-chunker.json"))
      ]);
      if (!response.ok) throw new Error(`French rule candidate bundle is unavailable (${response.status}).`);
      if (!sentenceResponse.ok) throw new Error(`French sentence rules are unavailable (${sentenceResponse.status}).`);
      if (!disambiguationResponse.ok) throw new Error(`French disambiguation rules are unavailable (${disambiguationResponse.status}).`);
      if (!chunkerResponse.ok) throw new Error(`French hybrid chunker resource is unavailable (${chunkerResponse.status}).`);
      const [bundle, disambiguationData, chunkerData] = await Promise.all([response.json(), disambiguationResponse.json(), chunkerResponse.json()]);
      const sentenceResource = await sentenceResponse.json();
      if (bundle.kind !== "lletrium-french-rule-candidate" || bundle.status !== "proof-only-not-activated" || !Array.isArray(bundle.rules)) {
        throw new Error("French rule candidate bundle has an unsupported descriptor.");
      }
      if (disambiguationData.kind !== "lletrium-french-context-disambiguation-candidate"
          || disambiguationData.status !== "proof-only-not-activated" || disambiguationData.language !== "fr-FR"
          || disambiguationData.sourceSha256 !== "d65c0691d8daf44f164d15d6cea80a86a7ea37c6a143e6787787c7f5d6195013"
          || disambiguationData.convertedRuleCount !== disambiguationData.rules?.length) {
        throw new Error("French disambiguation candidate bundle is incompatible or incomplete.");
      }
      if (chunkerData.kind !== "lletrium-french-hybrid-chunker-candidate"
          || chunkerData.status !== "proof-only-not-activated" || chunkerData.language !== "fr-FR"
          || chunkerData.sources?.multiwords?.sha256 !== "8ab8c070d0eb2e139b62cce023e9bb619fe652cbad82b7c319c24fa77081a2e4"
          || chunkerData.sources?.global?.sha256 !== "98198e0ecbb5e14e32cbee42a4be8b6982c3bb34311bf9ea1f5c12fab4a65634"
          || !Array.isArray(chunkerData.multiwords) || !Array.isArray(chunkerData.globalForms)) {
        throw new Error("French hybrid chunker candidate bundle is incompatible or incomplete.");
      }
      const tokenizer = new tokenizerType(lexicalData);
      const validationIds = new Set(['CET_CE_1','CET_CE_2','CE_CET','MA_VOYELLE','MON_NFS','VIEUX_1','VIEUX_2','VIEUX_3','VIEUX_4','VIEUX_5']);
      const frenchSuggestionValidationRules = bundle.rules
        .filter(rule => rule.category === 'CAT_ELISION' || validationIds.has(rule.id))
        .filter(rule => rule.filter?.name !== 'WordWithDeterminerFilter')
        .map(rule => { const copy={...rule};delete copy.filter;return copy; });
      const runtime = new runtimeType({
        dictionary: lexicalData,
        locale: "fr",
        // Keep the external rows (with their original UTF-16 offsets) while
        // also exposing the same tokenizer to suggestion filters, which must
        // tokenize candidate replacements before consulting the speller.
        contextRules: disambiguationData.rules,
        filterResources: { tokenizer: Object.assign(tokenizer, { externalTokenRows: true }), speller: lexicalData.createSpeller(), multiwords: lexicalData.multiwords, frenchChunker: chunkerData, frenchSuggestionValidationRules, englishMorphology }
      });
      const sentenceTokenizer = new sentenceTokenizerType(sentenceResource, runtime);
      runtime.filterResources.sentenceTokenizer = sentenceTokenizer;
      // Validate/compile the pinned candidate once during preload, rather than
      // on the first keystroke. The runtime also caches validation by object.
      for (const rule of bundle.rules) runtime.validate(rule);
      return new FrenchPatternPipeline({ lexicalData, tokenizer, sentenceTokenizer, rules: bundle.rules, runtime, simpleReplaceData, repeatedWordsData, compoundsData, disambiguationData });
    }

    analyzeText(text, options = {}) {
      if (typeof text !== "string") throw new TypeError("French review input must be a string.");
      const rows = this.tokenizer.tokenizeRows(text);
      const profile = PROFILE_DISABLED_RULES[options.language] ? options.language : "fr-FR";
      const disabledRules = new Set(PROFILE_DISABLED_RULES[profile]);
      const profileRules = disabledRules.size
        ? this.rules.filter(rule => !disabledRules.has(rule.id))
        : this.rules;
      const raw = this.runtime.run(text, rows, profileRules);
      // LanguageTool applies SameRuleGroupFilter after pattern matching. The
      // XML compiler keeps sub-rule IDs for execution, so compare their shared
      // upstream group ID here and suppress only overlapping sibling matches.
      const orderedMatches = raw.map((issue, order) => ({ issue, order }))
        .sort((a, b) => a.issue.start - b.issue.start || a.order - b.order);
      const suppressedGroupMatches = new Set();
      for (let index = 0; index < orderedMatches.length - 1; index++) {
        const current = orderedMatches[index].issue;
        const groupId = current.meta?.ruleGroupId;
        if (!groupId) continue;
        while (index < orderedMatches.length - 1) {
          const next = orderedMatches[index + 1].issue;
          if (next.meta?.ruleGroupId !== groupId || current.start > next.end || current.end < next.start) break;
          suppressedGroupMatches.add(next);
          index++;
        }
      }
      if (suppressedGroupMatches.size) {
        for (let index = raw.length - 1; index >= 0; index--) {
          if (suppressedGroupMatches.has(raw[index])) raw.splice(index, 1);
        }
      }
      const ignoredSpellingSpans = new Set((this.runtime.lastAnalysisRows || [])
        .filter(row => row.ignoreSpelling && row.end > row.start)
        .map(row => `${row.start}:${row.end}`));
      raw.push(...globalThis.CorrectorFrenchWhitespaceRule.checkFrenchWhitespace(text, rows));
      raw.push(...globalThis.CorrectorFrenchCommaWhitespaceRule.findMatches(text, rows));
      raw.push(...globalThis.CorrectorFrenchCorePunctuationRule.findMatches(rows));
      if (typeof this.sentenceTokenizer?.segment === "function") {
        raw.push(...globalThis.CorrectorFrenchUnpairedBracketsRule.findMatches(text, rows, this.sentenceTokenizer));
        raw.push(...globalThis.CorrectorFrenchLongSentenceRule.findMatches(text, rows, this.sentenceTokenizer));
        raw.push(...globalThis.CorrectorFrenchLongParagraphRule.findMatches(text, rows));
        raw.push(...globalThis.CorrectorFrenchUppercaseSentenceRule.findMatches(text, this.tokenizer, this.sentenceTokenizer));
        raw.push(...globalThis.CorrectorFrenchRepeatedWordsRule.findMatches(text, rows, this.sentenceTokenizer, this.repeatedWordsData.byLemma, this.lexicalData));
        raw.push(...globalThis.CorrectorFrenchCompoundsRule.findMatches(text, rows, this.sentenceTokenizer, this.compoundsData, this.lexicalData));
      }
      raw.push(...globalThis.CorrectorFrenchSimpleReplaceRule.findMatches(rows, this.simpleReplaceData, this.lexicalData,
        options.personalWords, raw));
      if (options.skipSpelling !== true) {
        const personalWords = new Set((Array.isArray(options.personalWords) ? options.personalWords : [])
          .map(word => String(word).trim().toLocaleLowerCase("fr"))
          .filter(Boolean));
        const grammarRanges = raw.map(issue => [issue.start, issue.end]);
        for (const row of rows) {
          if (ignoredSpellingSpans.has(`${row.start}:${row.end}`)) continue;
          // The French spelling list is narrower than the morphology lexicon
          // for some inflected/capitalized forms (e.g. sentence-initial Je).
          // Accept a positive local morphological lookup to avoid false alarms.
          if (row.analysis?.lexical || !/\p{L}/u.test(row.token) || !this.speller.isMisspelled(row.token, { personalWords })) continue;
          // Avoid duplicate spelling cards where a rule already covers this
          // word and offers a more useful contextual correction.
          if (grammarRanges.some(([start, end]) => start < row.end && end > row.start)) continue;
          raw.push({
            id: `FR_SPELLING_RULE:${row.start}:${row.end}`,
            ruleId: "FR_SPELLING_RULE",
            category: "spelling",
            severity: "warning",
            message: "Faute de frappe possible trouvée.",
            shortMessage: "Orthographe",
            text: text.slice(row.start, row.end),
            start: row.start,
            end: row.end,
            replacementStart: row.start,
            replacementEnd: row.end,
            suggestions: this.speller.suggest(row.token, 10)
          });
        }
      }
      this.checkCount++;
      return {
        profile,
        textLengthUtf16: text.length,
        issues: cleanFrenchOverlaps(raw).map(issue => ({
          ...issue,
          language: "fr",
          severity: "warning",
          category: issue.category === "spelling" ? "spelling"
            : issue.meta?.qualityCategory === "style" ? "style"
              : issue.category === "typography" ? "typography" : "grammar"
        })),
        stats: this.getDiagnostics()
      };
    }

    getDiagnostics() {
      return {
        status: "proof-only-not-activated",
        profile: "fr-base-candidate",
        activeStages: ["languagetool-french-srx-segmentation", "languagetool-french-whitespace-default", "languagetool-core-sentence-whitespace-conservative", "languagetool-core-comma-parenthesis-whitespace", "languagetool-core-double-punctuation", "languagetool-core-unpaired-brackets", "languagetool-core-long-sentence-40-words", "languagetool-core-long-paragraph-220-words-explicit-boundaries-only", "languagetool-core-uppercase-sentence-start", "languagetool-french-repeated-words-style", "languagetool-french-compound-words", "languagetool-french-simple-replace", "languagetool-french-java-compiled-xml-disambiguation-candidate", "languagetool-french-xml-pattern-rules", "languagetool-french-local-spelling"],
        rulesLoaded: this.rules.length,
        disambiguationRulesLoaded: this.disambiguationData?.convertedRuleCount || 0,
        disambiguationRulesUpstream: this.disambiguationData?.sourceRuleCount || 0,
        disambiguationRulesExcluded: this.disambiguationData?.excludedRuleCount || 0,
        disambiguationExclusionsByReason: this.disambiguationData?.exclusionsByReason || {},
        checks: this.checkCount,
        runtimeErrors: this.runtime.diagnostics.slice(-100),
        lexical: this.lexicalData.getStats(),
        spelling: this.speller.getDiagnostics()
      };
    }
  }

  globalThis.CorrectorFrenchPatternPipeline = Object.freeze({ FrenchPatternPipeline });
})();
