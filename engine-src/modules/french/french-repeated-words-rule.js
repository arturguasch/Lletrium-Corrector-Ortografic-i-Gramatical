/* Proof-only adapter for LanguageTool's French repeated-word style rule. */
(() => {
  "use strict";

  const DATA_URL = "build/resources/fr/synonyms.txt";
  const SOURCE_SHA256 = "384bf8e7a69a4e1bdc8509ebfda4372b9ab1a4bcb7df02893380aac2dfbfd4db";
  const MESSAGE = "Ce mot apparaît déjà dans l'une des phrases précédant immédiatement celle-ci. Utilisez un synonyme pour apporter plus de variété à votre texte, excepté si la répétition est intentionnelle.";
  const SHORT_MESSAGE = "Style : Mot répété";
  const MAX_WORD_DISTANCE = 150;
  const PUNCTUATION = /^\p{P}+$/u;

  function parseData(source) {
    const byLemma = new Map();
    for (const raw of String(source).split(/\r?\n/u)) {
      const line = raw.replace(/#.*$/u, "").trim();
      if (!line) continue;
      const separator = line.indexOf("=");
      if (separator < 0) continue;
      const [word, postag, chunk] = line.slice(0, separator).split("/");
      const synonyms = line.slice(separator + 1).split(";").map(value => value.trim()).filter(Boolean);
      if (!word || !synonyms.length) continue;
      byLemma.set(word, Object.freeze({ synonyms: Object.freeze(synonyms), postag: postag || null, chunk: chunk || null }));
    }
    return byLemma;
  }

  function anchoredRegexMatches(source, value) {
    try { return new RegExp(`^(?:${source})$`, "u").test(value); }
    catch { return false; }
  }

  function adjustedPostag(postag) {
    if (postag.endsWith("e sp")) return postag.replace("e sp", ". .*");
    if (postag.endsWith("m s")) return postag.replace("m s", "[me] sp?");
    if (postag.endsWith("f s")) return postag.replace("f s", "[fe] sp?");
    if (postag.endsWith("m p")) return postag.replace("m p", "[me] s?p");
    if (postag.endsWith("f p")) return postag.replace("f p", "[fe] s?p");
    if (postag.endsWith("e s")) return postag.replace("e s", "[me] sp?");
    if (postag.endsWith("e p")) return postag.replace("e p", "[me] s?p");
    if (postag.endsWith("m sp")) return postag.replace("m sp", "[me] s?p?");
    if (postag.endsWith("f sp")) return postag.replace("f sp", "[fe] s?p?");
    return postag;
  }

  function isCapitalized(value) {
    const chars = [...value];
    return chars.length > 1 && /^\p{Lu}$/u.test(chars[0]) && chars.slice(1).some(char => /^\p{Ll}$/u.test(char));
  }

  function isAllUppercase(value) {
    return value !== value.toLocaleLowerCase("fr") && value === value.toLocaleUpperCase("fr");
  }

  function titleCase(value) {
    const chars = [...value];
    return chars.length ? chars[0].toLocaleUpperCase("fr") + chars.slice(1).join("") : value;
  }

  function findMatches(text, rows, sentenceTokenizer, byLemma, lexicalData) {
    if (!byLemma?.size || typeof sentenceTokenizer?.segment !== "function") return [];
    const matches = [];
    const wordsLastSeen = new Map();
    let wordNumber = 0;

    for (const sentence of sentenceTokenizer.segment(text)) {
      const tokens = rows.filter(row => row.start >= sentence.start && row.end <= sentence.end);
      if (!tokens.length || ![".", "!", "?"].includes(tokens.at(-1).token)) continue;
      const lemmasInSentence = new Set();
      let sentenceStart = true;

      for (const token of tokens) {
        const surface = token.token;
        if (surface) wordNumber++;
        const capitalized = isCapitalized(surface);
        const allUppercase = isAllUppercase(surface);
        const isPunctuation = PUNCTUATION.test(surface);
        const readings = token.analysis?.readings || [];
        const exception = !surface || allUppercase || (capitalized && !sentenceStart)
          || readings.some(reading => String(reading.tag || "").startsWith("Z")) || isPunctuation;
        if (sentenceStart && surface && !isPunctuation) sentenceStart = false;
        if (exception) continue;

        for (const reading of readings) {
          const lemma = reading.lemma;
          const entry = typeof lemma === "string" ? byLemma.get(lemma) : null;
          const previousPosition = typeof lemma === "string" ? wordsLastSeen.get(lemma) : null;
          if (!entry || previousPosition == null || lemmasInSentence.has(lemma)
              || wordNumber - previousPosition > MAX_WORD_DISTANCE) continue;
          if (entry.postag && !anchoredRegexMatches(entry.postag, String(reading.tag || ""))) continue;
          // French source data includes chunk constraints, but the current
          // candidate tokenizer has no LT chunk tags; skip those entries rather
          // than silently dropping a required upstream filter.
          if (entry.chunk) continue;

          const suggestions = [];
          const tagPattern = adjustedPostag(String(reading.tag || ""));
          for (const replacementLemma of entry.synonyms) {
            let forms = lexicalData.synthesize(replacementLemma, tagPattern, true);
            if (!forms?.length) forms = [replacementLemma];
            for (let form of forms) {
              if (allUppercase) form = form.toLocaleUpperCase("fr");
              else if (capitalized) form = titleCase(form);
              if (!suggestions.includes(form)) suggestions.push(form);
            }
          }
          if (suggestions.length) {
            matches.push({
              ruleId: "FR_REPEATEDWORDS",
              category: "style",
              severity: "warning",
              message: MESSAGE,
              shortMessage: SHORT_MESSAGE,
              text: surface,
              start: token.start,
              end: token.end,
              replacementStart: token.start,
              replacementEnd: token.end,
              suggestions,
              meta: { qualityCategory: "style" }
            });
            break;
          }
        }

        for (const reading of readings) {
          const lemma = reading.lemma;
          if (typeof lemma === "string" && byLemma.has(lemma)) {
            wordsLastSeen.set(lemma, wordNumber);
            lemmasInSentence.add(lemma);
          }
        }
      }
    }
    return matches;
  }

  async function load({ fetcher = globalThis.fetch?.bind(globalThis) } = {}) {
    if (typeof fetcher !== "function") throw new Error("A fetch implementation is required to load French repeated-word data.");
    const url = globalThis.chrome?.runtime?.getURL(DATA_URL);
    if (!url) throw new Error("French repeated-word data are available only in the proof extension package.");
    const response = await fetcher(url);
    if (!response.ok) throw new Error(`French repeated-word data are unavailable (${response.status}).`);
    const byLemma = parseData(await response.text());
    if (!byLemma.size) throw new Error("French repeated-word data parsed to an empty index.");
    return Object.freeze({ byLemma, entryCount: byLemma.size, sourceSha256: SOURCE_SHA256 });
  }

  globalThis.CorrectorFrenchRepeatedWordsRule = Object.freeze({ load, parseData, findMatches, sourceSha256: SOURCE_SHA256 });
})();
