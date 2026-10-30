/* Local en-US ports of LanguageTool's Java repetition rules. */
(() => {
  "use strict";
  const ALLOWED_NAMES = new Set(["phi", "li", "xiao", "duran", "wagga", "abdullah", "nwe", "pago", "cao"]);
  const ALLOWED_REPEATS = new Set(["aye", "blah", "mau", "uh", "paw", "cha", "yum", "wop", "woop", "fnarr", "fnar", "ha", "omg", "boo", "tick", "twinkle", "ta", "la", "x", "hi", "ho", "heh", "jay", "walla", "sri", "hey", "hah", "oh", "ouh", "chop", "ring", "beep", "bleep", "yeah", "gout", "quack", "meow", "squawk", "whoa", "si", "honk", "brum", "chi", "santorio", "lapu", "chow", "shh", "yummy", "boom", "bye", "ah", "aah", "bang", "woof", "wink", "yes", "tsk", "hush", "ding", "choo", "miu", "tuk", "yadda", "doo", "sapiens", "tse", "no", "bora"]);
  const ADD_ADVERBS = ["Additionally", "Besides", "Furthermore", "Moreover", "Also"];
  // LanguageTool's source stores these in a HashSet; this preserves the
  // iteration order observed from the pinned 6.9-SNAPSHOT runtime.
  const ADD_SUGGESTION_ORDER = ["Besides", "Also", "Additionally", "Furthermore", "Moreover"];
  const CONTRAST_ADVERBS = ["Nevertheless", "Nonetheless", "Alternatively"];
  const EMPHASIS_ADVERBS = ["Undoubtedly", "Indeed", "Obviously", "Clearly", "Importantly", "Absolutely", "Definitely"];
  const EXPLAIN_ADVERBS = ["Particularly", "Especially", "Specifically"];
  const ADD_EXPRESSIONS = ["In addition", "As well as"];
  const CONTRAST_EXPRESSIONS = ["Even so", "On the other hand"];
  const START_EXCEPTIONS = new Set(["The", "A", "An", ":", "–", "-", "✔️", "➡️", "—", "⭐️", "⚠️"]);
  const PUNCTUATION = /^\p{P}+$/u;
  const asText = token => String(token?.text ?? "");
  const tokensOf = sentence => (sentence?.tokens || []).filter(token => token.kind !== "space");
  const isWord = token => {
    const value = asText(token);
    return Boolean(value) && !/\p{Extended_Pictographic}/u.test(value) && !/^[\p{N}\p{Zs}]+$/u.test(value)
      && (value.length !== 1 || /^\p{L}$/u.test(value));
  };
  const posMatches = (token, ...prefixes) => (token?.contextualReadings || token?.readings || []).some(reading => prefixes.some(prefix => String(reading.tag || "").startsWith(prefix)));
  const readingMatches = (token, expression) => (token?.contextualReadings || token?.readings || []).some(reading => new RegExp(`^(?:${expression})$`, "u").test(String(reading.tag || "")));
  const capitalized = value => { const chars = [...value]; return chars.length > 0 && /^\p{Lu}$/u.test(chars[0]) && chars.slice(1).some(char => /^\p{Ll}$/u.test(char)); };
  const allUpper = value => /\p{Lu}/u.test(value) && value === value.toLocaleUpperCase("en-US");
  const title = value => { const first = [...value][0]; return first ? first.toLocaleUpperCase("en-US") + value.slice(first.length) : value; };
  const lemmaSet = (token, lemma) => (token?.contextualReadings || token?.readings || []).some(reading => reading.lemma === lemma);

  class EnglishRepetitionRules {
    constructor(data) {
      if (data?.schemaVersion !== 1 || data.profile !== "en-US" || data.sourceSha256 !== "1278b27a6e5462766a0608a3698a1fbf672372f27841fb9e031ec7108866a6f5" || data.entryCount !== 25 || !Array.isArray(data.entries)) throw new Error("The en-US synonyms resource is incomplete or differs from the pinned LanguageTool source.");
      this.byLemma = new Map();
      for (const row of data.entries) {
        if (!row?.word || this.byLemma.has(row.word) || !Array.isArray(row.synonyms) || !row.synonyms.length) throw new Error("Invalid or duplicate en-US synonym entry.");
        this.byLemma.set(row.word, Object.freeze({ synonyms: Object.freeze([...row.synonyms]), postag: row.postag || null, chunk: row.chunk || null }));
      }
      if (this.byLemma.size !== data.entryCount) throw new Error("The en-US synonym index count is inconsistent.");
    }

    checkAdjacent(sentences) {
      const issues = [];
      for (const sentence of sentences || []) {
        const tokens = tokensOf(sentence);
        let previous = null;
        for (let i = 0; i < tokens.length; i++) {
          const current = tokens[i];
          if (current.isImmunized || current.immunized) { previous = null; continue; }
          if (previous && isWord(current) && previous.text.toLocaleLowerCase("en-US") === current.text.toLocaleLowerCase("en-US")
              && !this.ignoreAdjacent(tokens, i)) {
            const start = previous.start, end = current.end;
            issues.push({ id: `ENGLISH_WORD_REPEAT_RULE:${start}:${end}`, ruleId: "ENGLISH_WORD_REPEAT_RULE",
              category: "misc", severity: "warning", message: "Possible typo: you repeated a word.", shortMessage: "Word repetition",
              text: sentence.text.slice(start - sentence.start, end - sentence.start), start, end,
              replacementStart: start, replacementEnd: end, suggestions: [previous.text] });
          }
          previous = current;
        }
      }
      return issues;
    }

    ignoreAdjacent(tokens, index) {
      const prev = tokens[index - 1], current = tokens[index], next = tokens[index + 1];
      const value = asText(current).toLocaleLowerCase("en-US"), repeated = needle => asText(prev).toLocaleLowerCase("en-US") === needle && value === needle;
      const nextIs = (...values) => values.includes(asText(next).toLocaleLowerCase("en-US"));
      if ((repeated("did") || repeated("do") || repeated("does")) && nextIs("n't")) return true;
      if (repeated("her") && posMatches(tokens[index - 2], "VB", "VBP", "VBZ", "VBG", "VBD", "VBN") && posMatches(next, "NN", "NNS", "NN:U", "NN:UN", "NNP")) return true;
      if (repeated("had") && posMatches(tokens[index - 2], "PRP", "NN")) return true;
      if (repeated("that") && posMatches(next, "MD", "NN", "PRP$", "JJ", "VBZ", "VBD")) return true;
      if (repeated("can") && posMatches(prev, "NN")) return true;
      if (repeated("hip") && nextIs("hooray") || repeated("bam") && nextIs("bigelow") || repeated("wild") && nextIs("west")
          || repeated("far") && nextIs("away") || repeated("so") && nextIs("much", "many")) return true;
      if (repeated("s") && /^(?:['’`´‘])$/u.test(asText(tokens[index - 2]))) return true;
      const before3 = asText(tokens[index - 3]);
      const before2 = asText(tokens[index - 2]);
      if (repeated("in") && /^(?:log(?:ged|s)?|sign(?:ed|s)?)$/iu.test(before3) || repeated("in") && /^(?:log(?:ged|s)?|sign(?:ed|s)?)$/iu.test(before2)) return true;
      if (repeated("a") && before2 === "." || repeated("on") && before2 === ".") return true;
      if (prev && prev.text.toLocaleLowerCase("en-US") === current.text.toLocaleLowerCase("en-US")
          && (asText(next).toLocaleLowerCase("en-US") === value || asText(tokens[index - 2]).toLocaleLowerCase("en-US") === value)) return true;
      if (/^[a-z]$/iu.test(asText(current)) && /^[a-z]$/iu.test(asText(tokens[index - 2])) && /^[a-z]$/iu.test(asText(next))) return true;
      if (ALLOWED_NAMES.has(value) || ALLOWED_REPEATS.has(value)) return true;
      if (value === "wait" && index === 1) return true;
      if (value.endsWith("ay") && ((asText(prev) === "may" && asText(current) === "May") || (asText(prev) === "May" && asText(current) === "may")
          || asText(tokens[0]) === "May" && asText(tokens[1]) === "May")) return true;
      if (value.endsWith("ill") && ((asText(prev) === "will" && asText(current) === "Will") || (asText(prev) === "Will" && asText(current) === "will")
          || asText(tokens[0]) === "Will" && asText(tokens[1]) === "Will")) return true;
      return false;
    }

    checkBeginning(sentences) {
      const issues = [];
      let last = "", beforeLast = "", previousSentence = null;
      for (const sentence of sentences || []) {
        const tokens = tokensOf(sentence), start = asText(tokens[0]);
        if (tokens.length > 2 && start && start === last && !START_EXCEPTIONS.has(start)
            && !START_EXCEPTIONS.has(asText(tokens[1])) && !START_EXCEPTIONS.has(asText(tokens[2]))
            && previousSentence && /[.?!]$/u.test(String(previousSentence.text).trim())) {
          const adverb = [...ADD_ADVERBS, ...CONTRAST_ADVERBS, ...EMPHASIS_ADVERBS, ...EXPLAIN_ADVERBS].includes(start);
          const triple = beforeLast === start;
          if (adverb || triple) {
            const shortMessage = adverb ? "Two successive sentences begin with the same adverb." : "Three successive sentences begin with the same word.";
            const message = `${shortMessage} Consider rewording the sentence or use a thesaurus to find a synonym.`;
            const suggestions = this.beginningSuggestions(tokens[0]);
            issues.push({ id: `ENGLISH_WORD_REPEAT_BEGINNING_RULE:${tokens[0].start}:${tokens[0].end}`,
              ruleId: "ENGLISH_WORD_REPEAT_BEGINNING_RULE", category: "style", severity: "hint", message, shortMessage,
              text: start, start: tokens[0].start, end: tokens[0].end,
              replacementStart: tokens[0].start, replacementEnd: tokens[0].end, suggestions });
          }
        }
        beforeLast = last; last = start; previousSentence = sentence;
      }
      return issues;
    }

    beginningSuggestions(token) {
      const value = asText(token), readings = token?.contextualReadings || token?.readings || [];
      if (readings.some(reading => reading.tag === "PRP")) {
        const adapted = value === "I" ? value : value.toLocaleLowerCase("en-US");
        return [`Furthermore, ${adapted}`, `Likewise, ${adapted}`, `Not only that, but ${adapted}`];
      }
      if (ADD_ADVERBS.includes(value)) return [...ADD_SUGGESTION_ORDER.filter(item => item !== value), ...ADD_EXPRESSIONS];
      if (CONTRAST_ADVERBS.includes(value)) return [...CONTRAST_ADVERBS.filter(item => item !== value), ...CONTRAST_EXPRESSIONS];
      if (EMPHASIS_ADVERBS.includes(value)) return EMPHASIS_ADVERBS.filter(item => item !== value);
      if (EXPLAIN_ADVERBS.includes(value)) return EXPLAIN_ADVERBS.filter(item => item !== value);
      return [];
    }

    checkRepeatedSynonyms(sentences, { checkLevel = "DEFAULT", synthesizer } = {}) {
      if (checkLevel !== "PICKY") return [];
      const issues = [], lastSeen = new Map();
      let wordNumber = 0;
      for (const sentence of sentences || []) {
        const tokens = tokensOf(sentence);
        if (![".", "!", "?"].includes(asText(tokens.at(-1)))) continue;
        let sentenceStart = true;
        const lemmasInSentence = new Set();
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i], value = asText(token);
          if (token.isImmunized || token.immunized) continue;
          if (value) wordNumber++;
          const isCaps = capitalized(value), isUpper = allUpper(value);
          const exception = !value || isUpper || isCaps && !sentenceStart || posMatches(token, "NNP");
          if (sentenceStart && value && !PUNCTUATION.test(value)) sentenceStart = false;
          if (exception || this.isRepeatedWordAntiPattern(tokens, i)) continue;
          const readings = token.contextualReadings || token.readings || [];
          for (const reading of readings) {
            const lemma = reading.lemma, entry = this.byLemma.get(lemma), prior = lastSeen.get(lemma);
            if (!entry || prior == null || lemmasInSentence.has(lemma) || wordNumber - prior > 150) continue;
            if (entry.postag && !new RegExp(`^(?:${entry.postag})$`, "u").test(String(reading.tag || ""))) continue;
            if (entry.chunk && !new RegExp(`^(?:${entry.chunk})$`, "u").test((token.chunkTags || []).join(" "))) continue;
            const suggestions = [];
            for (const replacementLemma of entry.synonyms) {
              let forms = synthesizer.synthesize({ text: value, lemma: replacementLemma }, String(reading.tag || ""), true);
              if (!forms?.length) forms = [replacementLemma];
              for (let form of forms) {
                if (isUpper) form = form.toLocaleUpperCase("en-US");
                else if (isCaps) form = title(form);
                if (!suggestions.includes(form)) suggestions.push(form);
              }
            }
            issues.push({ id: `EN_REPEATEDWORDS_${lemma}:${token.start}:${token.end}`, ruleId: `EN_REPEATEDWORDS_${lemma.toLocaleUpperCase("en-US")}`,
              category: "style", severity: "hint", message: "This word has been used in one of the immediately preceding sentences. Using a synonym could make your text more interesting to read, unless the repetition is intentional.",
              shortMessage: "Style: repeated word", text: value, start: token.start, end: token.end,
              replacementStart: token.start, replacementEnd: token.end, suggestions, _picky: true });
            break;
          }
          for (const reading of readings) {
            const lemma = reading.lemma;
            if (this.byLemma.has(lemma)) { lastSeen.set(lemma, wordNumber); lemmasInSentence.add(lemma); }
          }
        }
      }
      return issues;
    }

    isRepeatedWordAntiPattern(tokens, i) {
      const w = tokens.map(asText), lower = w.map(word => word.toLocaleLowerCase("en-US"));
      const word = lower[i];
      const prev = (count = 1) => lower[i - count] || "", next = (count = 1) => lower[i + count] || "";
      if (word === "need" && next() === "to") return true;
      if (/^problems?$/u.test(word) && lower.slice(Math.max(0, i - 4), i).includes("solve")) return true;
      if (word === "problem" && (prev() === "no" && (i <= 1 || PUNCTUATION.test(prev(2))) || ["math", "word"].includes(prev()))) return true;
      if (word === "whole" && prev() === "a" && prev(2) === "as") return true;
      if (word === "often" && (prev() === "more" && next() === "than" && next(2) === "not" || next() === "times")) return true;
      if (/^(?:suggest|suggests|suggested|suggesting)$/u.test(word) && /^(?:details?|facts?|it|journals?|questions?|research|results?|study|studies|this|these|those|which)$/u.test(prev())) return true;
      if (word === "form" && ["in", "of", "with", "as", "to", "from", "into", "on", "and", "or"].includes(next())) return true;
      if (word === "form" && /^(?:bonds?|crystals?|ions?|rocks?|\w*valence)$/u.test(next())) return true;
      if (/^(?:bonds?|crystals?|ions?|rocks?|\w*valence)$/u.test(word) && prev() === "form") return true;
      if (word === "facts" && prev() === "interesting" || word === "things" && prev() === "interesting") return true;
      if (/^(?:hundreds?|thousands?|millions?)$/u.test(word) && prev() === "several") return true;
      if (word === "nice" && (prev() === "be" && prev(2) === "must" || prev() === "nice" || prev() === "to" && prev(2) === "nice")) return true;
      if (word === "day" && prev() === "nice") return true;
      if (word === "nice" && prev() === "and" && (tokens[i - 1]?.chunkTags || []).some(tag => tag.startsWith("JJ"))) return true;
      if (word === "proposed" && prev() !== "") return /^(?:the|a|an|my|your|his|her|its|our|their)$/u.test(prev()) && /^(?:deal|agreement|plan|rule|law|solution|method)$/u.test(next());
      if (/^(?:propose|proposes|proposed|proposing)$/u.test(word) && ["to", "marriage"].includes(next())) return true;
      if (word === "literally" && (prev() === "too" || prev() === "and" && prev(2) === "literally" || next() === "everything" || next() === "." || next() === "!" || next() === "?")) return true;
      if (word === "maybe" && posMatches(tokens[i - 1], "CC")) return true;
      return false;
    }

    static async load({ url, fetcher = globalThis.fetch } = {}) {
      const resourceUrl = url || globalThis.chrome?.runtime?.getURL("build/resources/en-US/en-synonyms.json");
      if (!resourceUrl) throw new Error("An en-US synonyms resource URL is required outside the extension.");
      const response = await fetcher(resourceUrl);
      if (!response.ok) throw new Error(`Could not load en-US synonyms (${response.status}).`);
      return new EnglishRepetitionRules(await response.json());
    }
  }
  globalThis.CorrectorEnglishRepetitions = EnglishRepetitionRules;
})();
