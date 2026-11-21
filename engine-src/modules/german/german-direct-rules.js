/* Local adapters for LanguageTool German Java rule families. */
(() => {
  "use strict";

  const PROFILES = new Set(["de-DE", "de-AT", "de-CH"]);
  const sortIssues = issues => issues.sort((a, b) => a.start - b.start || a.end - b.end || a.ruleId.localeCompare(b.ruleId));
  const dataCache = new WeakMap();
  const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const compileData = data => {
    if (!data || typeof data !== "object") return null;
    if (dataCache.has(data)) return dataCache.get(data);
    const compiled = {
      replacements: (data.replacements || []).map(item => ({ ...item,
        regex: new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(item.phrase)}(?![\\p{L}\\p{N}])`, "giu") })),
      oldSpellings: (data.oldSpellings || []).map(item => ({ ...item,
        regex: new RegExp(`(?<![\\p{L}])${escapeRegex(item.old)}(?![\\p{L}])`, "giu") })),
      synonyms: (data.synonyms || []).map(item => ({ ...item, tagRegex: item.tag ? new RegExp(item.tag, "u") : null })),
      coherencyByForm: new Map(),
      wrongWords: (data.wrongWords || []).map(item => {
        const javaPattern = value => String(value || "").replaceAll("(?i)", "").replaceAll("(?-i)", "");
        try { return { ...item, word1Regex: new RegExp(`^(?:${javaPattern(item.word1)})$`, "iu"),
          word2Regex: new RegExp(`^(?:${javaPattern(item.word2)})$`, "iu"),
          context1Regex: new RegExp(javaPattern(item.context1), "iu"), context2Regex: new RegExp(javaPattern(item.context2), "iu"),
          match1Regex: new RegExp(javaPattern(item.match1), "iu"), match2Regex: new RegExp(javaPattern(item.match2), "iu") }; }
        catch { return null; }
      }).filter(Boolean)
    };
    for (const group of data.coherency || []) for (const form of group) compiled.coherencyByForm.set(String(form).toLocaleLowerCase("de"), group);
    dataCache.set(data, compiled);
    return compiled;
  };

  function check({ profile, text, rows, morphology, sentenceTokenizer, runtime, compoundAnalyzer, speller, data, checkLevel }) {
    if (!PROFILES.has(profile)) throw new Error(`Unsupported German profile: ${profile}`);
    const issues = [];
    const add = (ruleId, start, end, message, suggestions = [], category = "grammar") => {
      if (!(Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end > start && end <= text.length)) return;
      issues.push({ id: `${ruleId}:${profile}:${start}:${end}`, ruleId, category, severity: "warning", language: profile,
        message, shortMessage: category === "style" ? "Stil" : "Grammatik", text: text.slice(start, end), start, end,
        replacementStart: start, replacementEnd: end, suggestions: [...new Set(suggestions)] });
    };
    const readingTags = row => (row?.ltReadings || []).map(reading => String(reading.tag || ""));
    const readingForms = row => row?.ltReadings || [];
    const features = tag => {
      const parts = String(tag || "").split(":");
      return { pos: parts[0] || "", case: parts.find(part => ["NOM", "AKK", "DAT", "GEN"].includes(part)) || "",
        number: parts.find(part => ["SIN", "PLU"].includes(part)) || "",
        gender: parts.find(part => ["FEM", "MAS", "NEU"].includes(part)) || "",
        person: parts.find(part => ["1", "2", "3"].includes(part)) || "" };
    };
    const compatible = (left, right, keys = ["case", "number", "gender"]) => keys.every(key => !left[key] || !right[key] || left[key] === right[key]);
    const synthesize = (lemma, tag) => {
      try { return runtime?.dictionary?.synthesize?.(lemma, tag) || []; } catch { return []; }
    };
    const targetVerbForms = (row, wanted) => {
      const output = [];
      for (const reading of readingForms(row)) {
        if (!String(reading.tag || "").startsWith("VER:")) continue;
        const tags = [wanted.person, wanted.number].filter(Boolean);
        output.push(...synthesize(reading.lemma, `VER:${tags.join(":")}:PRÄ:NON`));
        output.push(...synthesize(reading.lemma, `VER:${tags.join(":")}:PRÄ:SFT`));
      }
      return [...new Set(output)].filter(Boolean);
    };
    const firstChar = value => [...String(value)][0] || "";
    const upperFirst = value => String(value).replace(/^\p{Ll}/u, char => char.toLocaleUpperCase("de"));
    const caseSuggestion = (original, suggestion) => original === original.toLocaleUpperCase("de")
      ? suggestion.toLocaleUpperCase("de") : /^\p{Lu}/u.test(firstChar(original)) ? upperFirst(suggestion) : suggestion;
    const synthesizeAgreementToken = (row, target, kind, determinerKind = "DEF") => {
      const tags = readingTags(row);
      if (tags.some(tag => {
        const current = features(tag);
        return ["case", "number", "gender"].every(key => !target[key] || !current[key] || current[key] === target[key]);
      })) return row.token;
      const lemma = readingForms(row).map(reading => String(reading.lemma || "")).find(Boolean);
      if (!lemma) return null;
      const { case: grammaticalCase, number, gender } = target;
      const articleKinds = kind === "article"
        ? [...new Set(tags.filter(tag => tag.startsWith("ART:")).map(tag => tag.split(":")[1]).filter(Boolean))]
        : [];
      const candidates = kind === "article" ? (articleKinds.length ? articleKinds : [determinerKind])
        .map(articleKind => `ART:${articleKind}:${grammaticalCase}:${number}:${gender}`)
        : kind === "adjective" ? [`ADJ:${grammaticalCase}:${number}:${gender}:GRU:${determinerKind}`, `ADJ:${grammaticalCase}:${number}:${gender}:GRU:IND`]
          : [`SUB:${grammaticalCase}:${number}:${gender}`];
      for (const targetTag of candidates) {
        const form = synthesize(lemma, targetTag).find(Boolean);
        if (form) return caseSuggestion(row.token, form);
      }
      return null;
    };

    // GermanCommaWhitespaceRule / COMMA_PARENTHESIS_WHITESPACE.
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "," && i > 0 && /\s/u.test(text[i - 1]) && !/\n/u.test(text[i - 1])) {
        let start = i - 1;
        while (start > 0 && /[\t \f\v\u00a0]/u.test(text[start - 1])) start--;
        add("COMMA_PARENTHESIS_WHITESPACE", start, i + 1, "Vor einem Komma steht kein Leerzeichen.", [","]);
      } else if (text[i] === "(" && /\s/u.test(text[i + 1] || "")) {
        let end = i + 1;
        while (/[\t \f\v\u00a0]/u.test(text[end] || "")) end++;
        add("COMMA_PARENTHESIS_WHITESPACE", i, end, "Nach einer öffnenden Klammer steht kein Leerzeichen.", ["("]);
      } else if (text[i] === ")" && /\s/u.test(text[i - 1] || "")) {
        let start = i - 1;
        while (start > 0 && /[\t \f\v\u00a0]/u.test(text[start - 1])) start--;
        add("COMMA_PARENTHESIS_WHITESPACE", start, i + 1, "Vor einer schließenden Klammer steht kein Leerzeichen.", [")"]);
      }
    }

    // Double punctuation and repeated whitespace.
    for (const match of text.matchAll(/([.!?])\1+/gu)) {
      const suggestion = match[1];
      add("DE_DOUBLE_PUNCTUATION", match.index, match.index + match[0].length,
        suggestion === "." ? "Zwei aufeinander folgende Punkte. Ein Satz endet nur mit einem Punkt." : "Doppeltes Satzzeichen.", [suggestion]);
    }
    for (const match of text.matchAll(/[\t \f\v\u00a0]{2,}/gu)) {
      add("WHITESPACE_RULE", match.index, match.index + match[0].length, "Mehrere Leerzeichen hintereinander.", [" "]);
    }

    // Missing space after sentence punctuation (SentenceWhitespaceRule).
    for (const match of text.matchAll(/([.!?])([\p{Lu}\p{Ll}])/gu)) {
      const boundary = match.index + 1;
      if (match[1] === "." && /(?:z\s*\.\s*B|u\s*\.\s*a|d\s*\.\s*h|bzw)\.$/iu.test(text.slice(Math.max(0, match.index - 12), boundary))) continue;
      add("DE_SENTENCE_WHITESPACE", boundary, boundary + 1, "Zwischen zwei Sätzen fehlt ein Leerzeichen.", [` ${match[2]}`]);
    }

    // Sentence-initial capitalization.
    const sentenceStarts = new Set(sentenceTokenizer.segment(text).map(sentence =>
      rows.find(item => item.start >= sentence.start && item.end <= sentence.end && /\p{L}/u.test(item.token))?.start).filter(Number.isInteger));
    for (const sentence of sentenceTokenizer.segment(text)) {
      const row = rows.find(item => item.start >= sentence.start && item.end <= sentence.end && /\p{L}/u.test(item.token));
      if (!row || !/\p{Ll}/u.test(firstChar(row.token))) continue;
      const corrected = upperFirst(row.token);
      add("UPPERCASE_SENTENCE_START", row.start, row.end, "Am Satzanfang wird großgeschrieben.", [corrected]);
    }
    for (const match of text.matchAll(/[.!?][”’"»)]*\s+([\p{Ll}])/gu)) {
      const punctuation = match[0].search(/[.!?]/u) + match.index;
      const before = text.slice(Math.max(0, punctuation - 18), punctuation + 1);
      if (/(?:\b(?:z\s*\.\s*B|u\s*\.\s*a|d\s*\.\s*h|bzw)\.|(?:\b[A-ZÄÖÜ]\.){1,3})$/iu.test(before)) continue;
      const offset = match.index + match[0].lastIndexOf(match[1]);
      const row = rows.find(item => item.start <= offset && item.end > offset);
      if (row && !sentenceStarts.has(row.start)) add("UPPERCASE_SENTENCE_START", row.start, row.end,
        "Am Satzanfang wird großgeschrieben.", [upperFirst(row.token)]);
    }

    // German compound dash rule: reject spaces after a hyphen before a new uppercase component.
    for (let i = 1; i < rows.length; i++) {
      const left = rows[i - 1], right = rows[i];
      if (!left.token.endsWith("-") || left.token === "-" || left.token.includes("--") || left.token.includes("–-")) continue;
      if (!right.whitespaceBefore || !/^\p{Lu}/u.test(firstChar(right.token)) || /^(?:UND|ODER|BZW)$/u.test(right.token)) continue;
      add("DE_DASH", left.start, right.end,
        "Möglicherweise wurde nach dem Bindestrich ein überflüssiges Leerzeichen eingefügt.", [left.token + right.token]);
    }

    // LanguageTool's compound rule uses a curated list, not productive concatenation.
    const compoundRuleId = profile === "de-CH" ? "DE_CH_COMPOUNDS" : "DE_COMPOUNDS";
    const compoundEntries = data?.compounds?.[profile] || [];
    const compoundsByPhrase = new Map(compoundEntries.map(entry => [entry.phrase.toLocaleLowerCase("de"), entry]));
    const compoundMatch = (start, end) => {
      const slice = rows.slice(start, end + 1);
      if (slice.some(row => /[.!?;:,()[\]{}]/u.test(row.token))) return null;
      for (let index = 1; index < slice.length; index++) {
        if (!slice[index].whitespaceBefore && !slice[index - 1].token.endsWith("-")) return null;
      }
      const original = text.slice(slice[0].start, slice.at(-1).end).trim().replace(/\s+/gu, " ");
      const normalized = original.replace(/\s*-\s*/gu, " ").toLocaleLowerCase("de");
      const entry = compoundsByPhrase.get(normalized);
      return entry ? { entry, original, start: slice[0].start, end: slice.at(-1).end } : null;
    };
    for (let start = 0; start < rows.length; start++) {
      let match = null;
      for (let end = Math.min(rows.length - 1, start + 4); end > start; end--) {
        match = compoundMatch(start, end);
        if (match) break;
      }
      if (!match) continue;
      const parts = match.original.replace(/-/gu, " ").split(/\s+/u);
      const suggestions = [];
      if (match.entry.dashed) suggestions.push(parts.join("-"));
      if (match.entry.joined && !/^[A-ZÄÖÜ]+$/u.test(parts.join(" "))) {
        suggestions.push(parts.map((part, index) => index && match.entry.lowerJoined
          ? part[0].toLocaleLowerCase("de") + part.slice(1) : part).join(""));
      }
      const validSuggestions = suggestions.filter((suggestion, index) => suggestion !== match.original
        && suggestions.indexOf(suggestion) === index);
      if (!validSuggestions.length) continue;
      add(compoundRuleId, match.start, match.end,
        "Möglicherweise muss dieses zusammengesetzte Wort zusammengeschrieben oder mit Bindestrich geschrieben werden.", validSuggestions);
      start = rows.findIndex(row => row.end === match.end);
    }

    // WIEDER/WIDER in the separable verb widerspiegeln.
    let sawSpiegeln = false, sawWider = false;
    for (const row of rows) {
      if (/[.!?;]/u.test(row.token)) { sawSpiegeln = false; sawWider = false; continue; }
      if (readingForms(row).some(reading => reading.lemma === "spiegeln")) sawSpiegeln = true;
      else if (row.token.toLocaleLowerCase("de") === "wider" && sawSpiegeln) sawWider = true;
      else if (row.token.toLocaleLowerCase("de") === "wieder" && sawSpiegeln && !sawWider) {
        add("DE_WIEDER_VS_WIDER", row.start, row.end, "‚wider‘ in ‚widerspiegeln‘ wird mit i geschrieben.", [row.token === "Wieder" ? "Wider" : "wider"]);
        sawSpiegeln = false; sawWider = false;
      }
    }

    // Repeated beginnings of adjacent sentences, with the common German alternatives.
    let previousBeginning = null;
    let beginningRun = 0;
    const alternativeBeginning = new Map([["dann", ["danach", "schließlich"]], ["auch", ["ferner", "zudem"]],
      ["außerdem", ["ferner", "zudem"]], ["danach", ["anschließend", "später"]]]);
    for (const sentence of sentenceTokenizer.segment(text)) {
      const row = rows.find(item => item.start >= sentence.start && item.end <= sentence.end && /\p{L}/u.test(item.token));
      if (!row) continue;
      const current = row.token.toLocaleLowerCase("de");
      beginningRun = previousBeginning?.word === current ? beginningRun + 1 : 1;
      if (beginningRun === 3) {
        add("GERMAN_WORD_REPEAT_BEGINNING_RULE", row.start, row.end,
          "Drei aufeinanderfolgende Sätze beginnen mit demselben Wort. Evtl. können Sie den Satz umformulieren, zum Beispiel, indem Sie ein Synonym nutzen.",
          alternativeBeginning.get(current) || [], "style");
      }
      previousBeginning = { word: current, row };
    }

    // Document-level consistency for compounds written with and without a hyphen.
    const compoundForms = new Map();
    for (const row of rows) {
      const lemmaSet = new Set(readingForms(row).map(reading => String(reading.lemma || "")).filter(Boolean));
      let lemma = lemmaSet.size === 1 ? [...lemmaSet][0] : row.token;
      if (row.token.includes("-") && !lemma.includes("-")) {
        const hyphenAt = row.token.indexOf("-");
        lemma = `${lemma.slice(0, hyphenAt)}-${lemma.slice(hyphenAt)}`;
      }
      const key = lemma.replaceAll("-", "").toLocaleLowerCase("de");
      if (!key || /^\d+$/u.test(key)) continue;
      const prior = compoundForms.get(key);
      if (prior && prior.text.toLocaleLowerCase("de") !== lemma.toLocaleLowerCase("de")
          && (prior.text.includes("-") || lemma.includes("-"))) {
        const suggestion = row.token.replaceAll("-", "").toLocaleLowerCase("de") === prior.text.replaceAll("-", "").toLocaleLowerCase("de") ? [prior.text] : [];
        add("DE_COMPOUND_COHERENCY", row.start, row.end,
          `Uneinheitliche Verwendung von Bindestrichen: ${row.token} und ${prior.text}.`, suggestion, "style");
      } else if (!prior) compoundForms.set(key, { text: lemma, start: row.start });
    }

    // LanguageTool's German long-sentence default is forty words.
    for (const sentence of sentenceTokenizer.segment(text)) {
      const words = rows.filter(row => row.start >= sentence.start && row.end <= sentence.end && /\p{L}/u.test(row.token));
      if (words.length > 40) add("TOO_LONG_SENTENCE_DE", words[0].start, words.at(-1).end,
        "Dieser Satz ist sehr lang.", [], "style");
    }

    if (checkLevel === "PICKY") {
      for (const match of text.matchAll(/[^\n]+(?:\n(?![\t \f\v]*\n)[^\n]+)*/gu)) {
        const paragraph = match[0], paragraphStart = match.index;
        const sentences = sentenceTokenizer.segment(paragraph);
        if (sentences.length < 2 || !paragraph.trim()) continue;
        const lastWord = [...rows].reverse().find(row => row.start >= paragraphStart && row.end <= paragraphStart + paragraph.length && /\p{L}/u.test(row.token));
        if (!lastWord) continue;
        const tail = paragraph.slice(lastWord.end - paragraphStart).trim();
        if (/[.!?:;,]$/u.test(tail) || /[.!?:;,][”’"»)]$/u.test(tail)) continue;
        add("PUNCTUATION_PARAGRAPH_END", lastWord.start, lastWord.end,
          "Am Ende eines Absatzes fehlt ein Satzzeichen.", [".", "!", "?", ":", ",", ";"]);
      }
    }

    // Offer metric equivalents for common imperial measurements.
    const unitConversions = [
      { re: "Meilen pro Stunde", metric: "km/h", factor: 1.609344 }, { re: "Fuß", metric: "m", factor: 0.3048 },
      { re: "Zoll", metric: "cm", factor: 2.54 }, { re: "Meilen", metric: "km", factor: 1.609344 },
      { re: "Meile", metric: "km", factor: 1.609344 }, { re: "Yard", metric: "m", factor: 0.9144 },
      { re: "Pfund", metric: "kg", factor: 0.45359237 }
    ];
    for (const unit of unitConversions) {
      const regex = new RegExp(`(?<![\\p{L}])([0-9]+(?:[.,][0-9]+)?)\\s+(${unit.re})(?![\\p{L}])`, "giu");
      for (const match of text.matchAll(regex)) {
        if (/\([^)]*(?:m|cm|km|kg)\)/iu.test(text.slice(match.index, match.index + match[0].length + 18))) continue;
        const value = Number(match[1].replace(",", "."));
        const converted = (Math.round(value * unit.factor * 100) / 100).toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        add("EINHEITEN_METRISCH", match.index, match.index + match[0].length,
          "Wollen Sie eine Umwandlung ins metrische System automatisch hinzufügen?", [`${match[0]} (${converted} ${unit.metric})`], "style");
      }
    }

    // Consistent capitalization of the German informal pronouns across one document.
    const duForms = new Set(["du", "dir", "dich", "dein", "deine", "deines", "deins", "deiner", "deinen", "deinem",
      "euch", "euer", "eure", "euere", "euren", "eueren", "euern", "eurer", "euerer", "eurem", "euerem", "eures", "eueres"]);
    let firstDuCase = null;
    for (const row of rows) {
      if (!duForms.has(row.token.toLocaleLowerCase("de")) || sentenceStarts.has(row.start)) continue;
      const uppercase = /^\p{Lu}/u.test(firstChar(row.token));
      if (firstDuCase == null) { firstDuCase = uppercase; continue; }
      if (uppercase === firstDuCase || row.token === row.token.toLocaleUpperCase("de")) continue;
      const suggestion = uppercase ? row.token.replace(/^\p{Lu}/u, char => char.toLocaleLowerCase("de")) : upperFirst(row.token);
      add("DE_DU_UPPER_LOWER", row.start, row.end, "Die Anredepronomen sollten einheitlich groß- oder kleingeschrieben werden.", [suggestion]);
    }

    // Bracket balance. Keep the opening symbol as the LanguageTool match.
    const opens = new Map([["(", ")"], ["[", "]"], ["{", "}"]]);
    const closes = new Set(opens.values()), stack = [];
    for (const match of text.matchAll(/[()[\]{}]/gu)) {
      const symbol = match[0];
      if (opens.has(symbol)) stack.push({ symbol, close: opens.get(symbol), start: match.index });
      else if (closes.has(symbol)) {
        const top = stack.at(-1);
        if (top?.close === symbol) stack.pop();
        else add("UNPAIRED_BRACKETS", match.index, match.index + 1, "Nicht zusammengehörige Klammer.", []);
      }
    }
    for (const item of stack) add("UNPAIRED_BRACKETS", item.start, item.start + 1, "Nicht zusammengehörige Klammer.", [item.close]);

    // German quote pairs, including the common low/high and guillemet forms.
    const quotePairs = new Map([["„", "“"], ["‚", "‘"], ["»", "«"], ["›", "‹"]]);
    const quoteCloses = new Map([...quotePairs].map(([open, close]) => [close, open]));
    const quoteStacks = new Map([...quotePairs.keys()].map(open => [open, []]));
    for (const match of text.matchAll(/[„“‚‘»«›‹]/gu)) {
      const symbol = match[0];
      if (quotePairs.has(symbol)) quoteStacks.get(symbol).push({ symbol, close: quotePairs.get(symbol), start: match.index });
      else if (quoteCloses.has(symbol)) {
        const stack = quoteStacks.get(quoteCloses.get(symbol));
        if (stack.length) stack.pop();
        else add("DE_UNPAIRED_QUOTES", match.index, match.index + 1, "Nicht zusammengehörendes Anführungszeichen.", []);
      }
    }
    for (const stack of quoteStacks.values()) for (const item of stack)
      add("DE_UNPAIRED_QUOTES", item.start, item.start + 1, "Nicht zusammengehörendes Anführungszeichen.", [item.close]);

    // Adjacent repeated words, while avoiding common German determiner/pronoun sequences.
    for (let i = 1; i < rows.length; i++) {
      const previous = rows[i - 1], current = rows[i];
      if (previous.token.toLocaleLowerCase("de") !== current.token.toLocaleLowerCase("de") || !/\p{L}/u.test(current.token)) continue;
      const word = current.token.toLocaleLowerCase("de");
      if (["die", "das", "der", "sie", "ihr", "in"].includes(word)) continue;
      add("GERMAN_WORD_REPEAT_RULE", previous.start, current.end, "Ein Wort kommt doppelt vor.", [current.token]);
    }

    // Compound infinitives with zu when the upstream German spelling dictionary accepts the joined form.
    for (let i = 1; i + 1 < rows.length; i++) {
      const left = rows[i - 1], zu = rows[i], verb = rows[i + 1];
      if (zu.token.toLocaleLowerCase("de") !== "zu" || !readingTags(verb).some(tag => tag.includes(":INF:"))) continue;
      if (!readingTags(left).some(tag => tag.startsWith("ADJ:") || tag.startsWith("ADV:"))) continue;
      const joined = `${left.token}zu${verb.token}`;
      if (!speller || speller.isMisspelled(joined)) continue;
      add("COMPOUND_INFINITIV_RULE", left.start, verb.end, "Der erweiterte Infinitiv mit ‚zu‘ wird hier zusammengeschrieben.", [joined]);
    }

    // LanguageTool's resource-driven replacement, old spelling, coherency, and context-confusion families.
    const directData = compileData(data);
    if (directData) {
      for (const item of directData.replacements) {
        item.regex.lastIndex = 0;
        for (const match of text.matchAll(item.regex)) {
          const suggestions = item.suggestions.map(suggestion => caseSuggestion(match[0], suggestion));
          add("DE_SIMPLE_REPLACE", match.index, match.index + match[0].length,
            item.message || `Meinten Sie vielleicht ${suggestions.join(" oder ")}?`, suggestions, "style");
        }
      }
      for (const item of directData.oldSpellings) {
        item.regex.lastIndex = 0;
        for (const match of text.matchAll(item.regex)) {
          const before = text.slice(Math.max(0, match.index - 45), match.index + match[0].length + 45);
          if (/Schloß\s+(?:Holte|Neuhaus|Ricklingen|Rötteln|Nauses|Winnenden|berg)\b|Bell Telephone|Telephone Company|American Telephone|England Telephone|Mobile Telephone|Cordless Telephone|Telephone Line|World Telephone|Hans Joachim Blaß|kurz fassen/iu.test(before)) continue;
          if (profile === "de-AT" && /geschoß/iu.test(match[0])) continue;
          const suggestion = caseSuggestion(match[0], item.current);
          add("OLD_SPELLING_RULE", match.index, match.index + match[0].length,
            "Diese Schreibweise war nur in der alten Rechtschreibung korrekt.", [suggestion], "spelling");
        }
      }
      const coherencySeen = new Map();
      for (const row of rows) {
        const group = directData.coherencyByForm.get(row.token.toLocaleLowerCase("de"))
          || readingForms(row).map(reading => directData.coherencyByForm.get(String(reading.lemma || "").toLocaleLowerCase("de"))).find(Boolean);
        if (!group) continue;
        const previous = coherencySeen.get(group);
        if (previous && previous.toLocaleLowerCase("de") !== row.token.toLocaleLowerCase("de")) {
          add("DE_WORD_COHERENCY", row.start, row.end,
            `'${previous}' und '${row.token}' sollten nicht gleichzeitig benutzt werden.`, [previous], "style");
        } else if (!previous) coherencySeen.set(group, row.token);
      }
      const sentenceRanges = sentenceTokenizer.segment(text);
      const sentenceIndex = row => sentenceRanges.findIndex(item => item.start <= row.start && item.end >= row.end);
      const repeatedSeen = new Map();
      for (const row of rows) {
        const currentSentence = sentenceIndex(row);
        if (currentSentence < 0 || (/^\p{Lu}/u.test(firstChar(row.token)) && !sentenceStarts.has(row.start))
            || row.token === row.token.toLocaleUpperCase("de")) continue;
        for (const reading of readingForms(row)) {
          const lemma = String(reading.lemma || "").toLocaleLowerCase("de");
          const ruleData = directData.synonyms.find(item => item.lemma.toLocaleLowerCase("de") === lemma
            && (!item.tagRegex || item.tagRegex.test(String(reading.tag || ""))));
          if (!ruleData) continue;
          const priorSentence = repeatedSeen.get(lemma);
          if (priorSentence != null && currentSentence > priorSentence && currentSentence - priorSentence <= 3) {
            const suggestions = ruleData.suggestions.flatMap(value => {
              const forms = synthesize(value, String(reading.tag || ""));
              return forms.length ? forms : [value];
            });
            add("DE_REPEATEDWORDS", row.start, row.end,
              "Dieses Wort kommt in einem nahe gelegenen vorherigen Satz bereits vor. Verwenden Sie ein Synonym, um Ihren Text abwechslungsreicher zu gestalten.",
              suggestions.slice(0, 5), "style");
            break;
          }
          repeatedSeen.set(lemma, currentSentence);
        }
      }
      for (const row of rows) {
        const sentence = sentenceRanges.find(item => item.start <= row.start && item.end >= row.end);
        if (!sentence) continue;
        const sentenceText = text.slice(sentence.start, sentence.end);
        for (const item of directData.wrongWords) {
          const match1 = item.word1Regex.test(row.token), match2 = item.word2Regex.test(row.token);
          let target = null;
          if (match1 && item.context2Regex.test(sentenceText)) target = item.match1Regex.test(row.token) ? row.token.replace(item.match1Regex, item.match2) : null;
          else if (match2 && item.context1Regex.test(sentenceText)) target = item.match2Regex.test(row.token) ? row.token.replace(item.match2Regex, item.match1) : null;
          if (!target || target.toLocaleLowerCase("de") === row.token.toLocaleLowerCase("de")) continue;
          add("GERMAN_WRONG_WORD_IN_CONTEXT", row.start, row.end,
            `Mögliche Wortverwechslung: Meinten Sie '${target}' anstatt '${row.token}'?`, [target]);
          break;
        }
      }
    }

    // Case of substantivized infinitives: article + lower-case infinitive with a noun reading.
    for (let i = 1; i < rows.length; i++) {
      const article = rows[i - 1], word = rows[i];
      if (!/^das$/iu.test(article.token) || !/^\p{Ll}[\p{Ll}ß]*en$/u.test(word.token)) continue;
      if (!morphology.lookup(upperFirst(word.token)).some(reading => String(reading.tag || "").startsWith("SUB:"))) continue;
      if (!readingTags(word).some(tag => tag.startsWith("VER:") && /:INF:/u.test(tag))) continue;
      add("DE_CASE", word.start, word.end, "Substantivierte Verben werden großgeschrieben.", [upperFirst(word.token)]);
    }

    // Agreement of determiners/adjectives with a nearby noun, using upstream morphology.
    for (let i = 1; i < rows.length; i++) {
      const noun = rows[i], nounFeatures = readingTags(noun).filter(tag => tag.startsWith("SUB:")).map(features);
      if (!nounFeatures.length) continue;
      const phraseRows = rows.slice(Math.max(0, i - 2), i);
      if (!phraseRows.length || phraseRows.some(row => /[.!?;:,()\[\]{}]/u.test(row.token))) continue;
      const determiner = [...phraseRows].reverse().find(row => readingTags(row).some(tag => /^(?:ART:|PRO:POS:)/u.test(tag)));
      const adjective = [...phraseRows].reverse().find(row => readingTags(row).some(tag => tag.startsWith("ADJ:")));
      if (!determiner && !adjective) continue;
      if (determiner && rows.slice(rows.indexOf(determiner) + 1, i)
        .some(row => !readingTags(row).some(tag => tag.startsWith("ADJ:")))) continue;
      if (!determiner && !sentenceStarts.has(adjective.start)) continue;
      const groups = [
        ...(determiner ? [readingTags(determiner).filter(tag => /^(?:ART:|PRO:POS:)/u.test(tag)).map(features).filter(item => item.case)] : []),
        ...(adjective ? [readingTags(adjective).filter(tag => tag.startsWith("ADJ:")).map(features).filter(item => item.case)] : []),
        nounFeatures
      ];
      let possible = groups[0] || [];
      for (const group of groups.slice(1)) possible = possible.flatMap(left => group.filter(right => compatible(left, right)));
      if (possible.length) continue;
      const start = determiner?.start ?? adjective.start;
      const phraseStartIndex = determiner ? rows.indexOf(determiner) : rows.indexOf(adjective);
      const previous = phraseStartIndex > 0 ? rows[phraseStartIndex - 1]?.token.toLocaleLowerCase("de") : "";
      const dativePrepositions = new Set(["aus", "bei", "mit", "nach", "seit", "von", "zu"]);
      const dativeRequired = dativePrepositions.has(previous);
      const targets = nounFeatures.filter(target => target.case && target.number && target.gender)
        .map(target => dativeRequired ? { ...target, case: "DAT" } : target);
      const twoWayPrepositions = new Set(["an", "auf", "hinter", "in", "neben", "über", "unter", "vor", "zwischen"]);
      const staticLocationVerbs = new Set(["bleiben", "hängen", "liegen", "sitzen", "stehen"]);
      const locationSentence = sentenceTokenizer.segment(text).find(sentence => sentence.start <= noun.start && sentence.end >= noun.end);
      const staticLocation = twoWayPrepositions.has(previous) && locationSentence
        && rows.some(row => row.start >= locationSentence.start && row.end <= locationSentence.end
          && readingForms(row).some(reading => staticLocationVerbs.has(String(reading.lemma || "").toLocaleLowerCase("de"))));
      if (staticLocation) targets.sort((a, b) => Number(b.case === "DAT") - Number(a.case === "DAT"));
      const suggestions = [];
      for (const target of targets) {
        const forms = [
          ...(determiner ? [synthesizeAgreementToken(determiner, target, "article")] : []),
          ...(adjective ? [synthesizeAgreementToken(adjective, target, "adjective")] : []),
          synthesizeAgreementToken(noun, target, "noun")
        ];
        if (forms.some(form => !form)) continue;
        const replacement = forms.join(" ");
        if (replacement !== text.slice(start, noun.end)) suggestions.push(replacement);
      }
      add(determiner ? "DE_AGREEMENT" : "DE_AGREEMENT2", start, noun.end,
        "Artikel, Adjektiv und Substantiv stimmen grammatisch nicht überein.", suggestions);
    }

    // Person/number agreement with a nearby personal-pronoun or nominative-noun subject.
    const subjectPronouns = new Map([["ich", [{ person: "1", number: "SIN" }]], ["du", [{ person: "2", number: "SIN" }]],
      ["er", [{ person: "3", number: "SIN" }]], ["sie", [{ person: "2", number: "PLU" }, { person: "3", number: "SIN" }, { person: "3", number: "PLU" }]],
      ["es", [{ person: "3", number: "SIN" }]], ["wir", [{ person: "1", number: "PLU" }]],
      ["ihr", [{ person: "2", number: "PLU" }]]]);
    for (let i = 1; i < rows.length; i++) {
      const verb = rows[i], verbTags = readingTags(verb);
      if (verbTags.some(tag => /:INF:|:PA[12]:/u.test(tag))) continue;
      const verbFeatures = verbTags.filter(tag => /^VER:[123]:(?:SIN|PLU):/u.test(tag)).map(features);
      if (!verbFeatures.length) continue;
      let priorStart = i - 1;
      while (priorStart >= 0 && !/[.!?;:,]/u.test(rows[priorStart].token)) priorStart--;
      const prior = rows.slice(Math.max(priorStart + 1, i - 5), i);
      if (priorStart >= 0 && rows[priorStart].token === ","
          && prior.some(row => readingTags(row).some(tag => tag.startsWith("PRO:REL:")))) continue;
      const clauseLead = priorStart >= 0 && rows[priorStart].token === "," ? rows[priorStart + 1] : null;
      if (clauseLead && /^(?:der|die|das|welche[rsmn]?|welcher|welches)$/iu.test(clauseLead.token)) {
        const relativeNumbers = readingTags(clauseLead).filter(tag => tag.startsWith("PRO:") && tag.includes(":NOM:")).map(features);
        if (relativeNumbers.some(subject => verbFeatures.some(verb => compatible({ person: "3", number: subject.number }, verb, ["person", "number"])))) continue;
      }
      const candidate = [...prior].reverse().find(row => {
        if (!readingTags(row).some(tag => tag.startsWith("SUB:NOM:") || tag.startsWith("PRO:PER:NOM:"))) return false;
        const rowIndex = rows.indexOf(row);
        const previousWord = rows[rowIndex - 1]?.token.toLocaleLowerCase("de") || "";
        return !new Set(["des", "dem", "eines", "einem", "einer"]).has(previousWord);
      });
      if (!candidate) continue;
      const pronounFeatures = subjectPronouns.get(candidate.token.toLocaleLowerCase("de"));
      const subjectFeatures = pronounFeatures ||
        readingTags(candidate).filter(tag => tag.startsWith("SUB:NOM:")).map(features).filter(item => item.number)
          .map(item => ({ person: "3", number: item.number }));
      // LanguageTool's DE_SUBJECT_VERB_AGREEMENT only checks the ist/sind and
      // war/waren pairs; broader verb-person checks belong to other rules.
      if (!pronounFeatures && !readingForms(verb).some(reading => reading.lemma === "sein")) continue;
      if (!subjectFeatures.length || subjectFeatures.some(subject => verbFeatures.some(v => compatible(subject, v, ["person", "number"])))) continue;
      const ruleId = pronounFeatures ? "DE_VERBAGREEMENT" : "DE_SUBJECT_VERB_AGREEMENT";
      const suggestions = subjectFeatures.flatMap(subject => targetVerbForms(verb, subject)).slice(0, 5);
      add(ruleId, verb.start, verb.end, "Subjekt und Verb stimmen nicht in Person und Numerus überein.", suggestions);
    }

    // Conservative ports of LanguageTool's relative-clause comma rules.
    // Require a morphologically supported antecedent and relative-pronoun reading.
    const relativeForm = /^(?:d(?:e[mnr]|ie|as|e(?:n|r|ss)en)|welche[mrs]?|wessen|was)$/iu;
    const hasRelativeReading = row => relativeForm.test(row.token)
      && readingTags(row).some(tag => /^PRO:(?:REL|DEM|IND):/u.test(tag));
    const finiteVerb = row => readingTags(row).some(tag => /^VER:(?:(?:MOD|AUX):)?[123]:(?:SIN|PLU):/u.test(tag));
    const subject = row => {
      const tags = readingTags(row);
      if (tags.some(tag => /^PRO:PER:NOM:/u.test(tag))) return true;
      return tags.some(tag => /^SUB:NOM:/u.test(tag)) && !tags.some(tag => /^SUB:AKK:/u.test(tag));
    };
    const nounBefore = (pronounIndex, allowComma = false) => {
      let passedComma = false;
      for (let at = pronounIndex - 1; at >= Math.max(0, pronounIndex - 9); at--) {
        if (rows[at].token === "," && allowComma && !passedComma) { passedComma = true; continue; }
        if (/[.!?;:,()[\]{}]/u.test(rows[at].token)) return false;
        if (readingTags(rows[at]).some(tag => /^PRO:REL:/u.test(tag))) return false;
        if (readingTags(rows[at]).some(tag => /^(?:SUB|EIG|PRO:(?:DEM|IND)):/u.test(tag))) return true;
      }
      return false;
    };
    for (let i = 1; i < rows.length; i++) {
      const previous = rows[i - 1];
      const beforeComma = previous.token === "," || /,\s*$/u.test(text.slice(Math.max(0, rows[i].start - 4), rows[i].start));
      if (!hasRelativeReading(rows[i]) || !nounBefore(i, beforeComma)) continue;
      const precedingPreposition = rows[i - 1]?.ltReadings?.some(reading => String(reading.tag || "").startsWith("PRP:")) || false;
      const nextNoun = rows.slice(i + 1, i + 4).findIndex(row => readingTags(row).some(tag => /^(?:SUB|EIG):/u.test(tag)));
      const articleLike = readingTags(rows[i]).some(tag => /^(?:ART:|PRO:DEM:)/u.test(tag));
      const nominalPhrase = nextNoun === 0 || nextNoun > 0 && rows.slice(i + 1, i + 1 + nextNoun)
        .every(row => readingTags(row).some(tag => tag.startsWith("ADJ:")));
      if (!beforeComma && articleLike && nominalPhrase) continue;
      if (!beforeComma && precedingPreposition && articleLike
          && ["von", "mit", "für", "zu", "bei", "nach", "aus", "an", "auf", "in", "über", "unter", "vor", "hinter", "neben", "zwischen"].includes(previous.token.toLocaleLowerCase("de"))) continue;
      if (precedingPreposition && ["von", "mit", "für", "zu", "bei", "nach", "aus", "an", "auf", "in", "über", "unter", "vor", "hinter", "neben", "zwischen"].includes(previous.token.toLocaleLowerCase("de"))
          && rows[i + 1] && readingTags(rows[i + 1]).some(tag => /^(?:ART:|PRO:POS:)/u.test(tag))
          && nextNoun >= 0) continue;
      if (!beforeComma) {
        let end = i + 1;
        while (end < rows.length && !/[.!?;:,()[\]{}]/u.test(rows[end].token)) end++;
        if (rows.slice(i + 1, end).some(finiteVerb)) {
          add("COMMA_IN_FRONT_RELATIVE_CLAUSE", rows[i].start, rows[i].end,
            "Vor einem Relativsatz steht ein Komma.", [`${rows[i - 1].token}, ${rows[i].token}`]);
        }
        continue;
      }
      // In a comma-delimited relative clause, detect a following subject + finite verb
      // with no closing comma. Requiring both avoids treating the relative verb itself as main-clause text.
      let relativeVerb = -1;
      for (let at = i + 1; at < rows.length && !/[.!?;:,()[\]{}]/u.test(rows[at].token); at++) {
        if (finiteVerb(rows[at])) { relativeVerb = at; break; }
      }
      if (relativeVerb < 0) continue;
      if (finiteVerb(rows[relativeVerb + 1])) {
        const mainVerb = rows[relativeVerb + 1];
        add("COMMA_BEHIND_RELATIVE_CLAUSE", rows[relativeVerb].start, mainVerb.end,
          "Nach einem Relativsatz steht ein Komma.", [`${rows[relativeVerb].token}, ${mainVerb.token}`]);
        continue;
      }
      for (let at = relativeVerb + 1; at + 1 < rows.length && !/[.!?;:,()[\]{}]/u.test(rows[at].token); at++) {
        if (!subject(rows[at]) || !finiteVerb(rows[at + 1])) continue;
        add("COMMA_BEHIND_RELATIVE_CLAUSE", rows[at].start, rows[at + 1].end,
          "Nach einem Relativsatz steht ein Komma.", [`${rows[at].token}, ${rows[at + 1].token}`]);
        break;
      }
    }

    return sortIssues(issues);
  }

  globalThis.CorrectorGermanDirectRules = Object.freeze({ check });
})();
