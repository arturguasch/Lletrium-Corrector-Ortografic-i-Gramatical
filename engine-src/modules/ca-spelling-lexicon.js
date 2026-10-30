/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Exact Softcatalà 3.3 spelling FSA plus LanguageTool acceptance overlays; diagnostic only. */
(() => {
  "use strict";

  const RESOURCE_PATH = "build/resources/ca-spelling-words.txt.gz";
  const OVERLAY_PATH = "build/resources/ca-spelling-overlays.txt.gz";
  const SOURCE_SHA256 = "9ba9231b8d84237309fc4183b2921204ec22b3ccdadc6337efec6b4629b2d730";
  const OVERLAY_SHA256 = "090ab31f13b474358aaefd3e7a9ad92c66eb26eb00ecfebfb26c82bd356405c4";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const apostropheTopPatterns = [
    { pattern: /^([lnts])[90]?(h?[aeiouàéèíòóú].*)$/iu, pos: /^V.[SI].*/u, capture: 2, separator: "'", add: "" },
    { pattern: /^(m)[90]?(h?[aeiouàéèíòóú].*)$/iu, pos: /^V.[SI].[123]S.*|^V.[SI].[23]P.*/u, capture: 2, separator: "'", add: "" },
    { pattern: /^([ld])[90]?(h?[aeiouàéèíòóú].{2,})$/iu, pos: /^V.[NG].*|^V.P..S..|^N..[SN].*|^A...[SN].|^PX..S...|^DD..S./u, capture: 2, separator: "'", add: "" },
    { pattern: /^(d)[90]?(h?[aeiouàéèíòóú].+)$/iu, pos: /^V.P..P..|^N..[PN].*|^A...[PN].|^PX..P...|^DD..P./u, capture: 2, separator: "'", add: "" },
    { pattern: /^(.+[aei])[90]?(l|ls|m|ns|n|t)$/iu, pos: /^V.[NGM].*/u, capture: 1, separator: "'", add: "" },
    { pattern: /^(.+e)[90]?(s)$/iu, pos: /^V.N.*/u, capture: 1, separator: "'", add: "" },
    { pattern: /^([\p{L}·]+n)(hi|ho|la|les|li|lo|los|me|ne|nos|se|te|vos)$/iu, pos: /^V.G.*/u, capture: 1, separator: "-", add: "t" },
    { pattern: /^([\p{L}·]+)[’']?(hi|ho|la|les|li|lo|los|me|ne|nos|se|te|vos)$/iu, pos: /^V.[NGM].*/u, capture: 1, separator: "-", add: "" }
  ];
  const splitParticles = new Set(["amb", "sota", "no", "en", "a", "el", "els", "al", "als", "pel", "pels", "del", "dels", "de", "per", "un", "uns", "una", "unes", "la", "les", "teu", "meu", "seu", "teus", "meus", "seus"]);
  const splitPrepositions = new Set(["amb", "en", "sota", "a", "al", "als", "pel", "pels", "dels", "del", "de", "per"]);
  const splitPrefixes = new Set(["pod", "ultra", "eco", "tele", "anti", "re", "des", "sen", "sem", "s", "avant", "auto", "ex", "extra", "macro", "mega", "meta", "micro", "multi", "mono", "mini", "post", "retro", "semi", "super", "trans", "pro", "g", "l", "m", "e", "pos", "acost"]);
  const invalidSplitSuffixes = new Set(["mi", "lis", "isme"]);
  const validSingleLetterSuffixes = new Set(["a", "o", "i"]);
  const initialPronouns = new Set(["em", "et", "es", "se", "ens", "us", "vos", "li", "hi", "ho", "el", "la", "els", "les"]);
  const ignoredSuggestionLemmas = ["enterar", "sentar", "conseguir", "alcançar", "entimar", "pisar"];
  const allowedSuggestionLemmas = ["enter", "sentir"];
  // Exact override in LanguageTool's MorfologikCatalanSpellerRule: when any
  // ranked candidate belongs to this family, replace the candidate list with
  // the rule's canonical Catalan alternatives.
  const inalambricForms = new Set([
    "inalàmbric", "inalàmbrica", "inalàmbrics", "inalàmbriques",
    "inalàmbricament", "inalàmbricamente"
  ]);
  const inalambricSuggestions = ["sense fils", "sense fil", "sense cables", "autònom"];
  let wordsText = "";
  let wordOffsets = null;
  let overlayWords = new Set();
  let alphabet = [];
  let loadPromise = null;

  async function load({ url, fetcher = globalThis.fetch } = {}) {
    if (!loadPromise) {
      loadPromise = (async () => {
        const resourceUrl = url || globalThis.chrome?.runtime?.getURL(RESOURCE_PATH);
        if (!resourceUrl) throw new Error("Cal indicar la URL del recurs ortogràfic fora de l'extensió.");
        const [response, overlayResponse] = await Promise.all([
          fetcher(resourceUrl),
          fetcher(globalThis.chrome?.runtime?.getURL(OVERLAY_PATH) || new URL(OVERLAY_PATH, resourceUrl))
        ]);
        if (!response.ok) throw new Error(`No s'ha pogut carregar el diccionari ortogràfic (${response.status}).`);
        if (!overlayResponse.ok) throw new Error(`No s'han pogut carregar les llistes ortogràfiques LanguageTool (${overlayResponse.status}).`);
        if (typeof DecompressionStream !== "function" || !globalThis.crypto?.subtle) {
          throw new Error("Aquest runtime no permet verificar i descomprimir el diccionari ortogràfic.");
        }
        const raw = await new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
        const digest = await globalThis.crypto.subtle.digest("SHA-256", raw);
        const actualHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
        if (actualHash !== SOURCE_SHA256) throw new Error("El hash del diccionari ortogràfic no coincideix amb Softcatalà 3.3.");
        const overlayRaw = await new Response(overlayResponse.body.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
        const overlayDigest = await globalThis.crypto.subtle.digest("SHA-256", overlayRaw);
        const overlayHash = Array.from(new Uint8Array(overlayDigest), byte => byte.toString(16).padStart(2, "0")).join("");
        if (overlayHash !== OVERLAY_SHA256) throw new Error("El hash de les llistes ortogràfiques LanguageTool no coincideix.");
        const overlayText = decoder.decode(overlayRaw);
        const overlayRows = overlayText.split("\n");
        if (overlayRows.at(-1) === "") overlayRows.pop();
        if (overlayRows.some((word, index) => !word || (index && overlayRows[index - 1] >= word))) {
          throw new Error("Les llistes ortogràfiques combinades són invàlides o no estan ordenades.");
        }
        overlayWords = new Set(overlayRows);
        wordsText = decoder.decode(raw);
        const offsets = new Uint32Array(1262335);
        let count = 0, previous = "", lineStart = 0;
        const characters = new Set();
        while (lineStart < wordsText.length) {
          const newline = wordsText.indexOf("\n", lineStart);
          const lineEnd = newline < 0 ? wordsText.length : newline;
          const word = wordsText.slice(lineStart, lineEnd);
          if (!word || (count && previous >= word)) throw new Error(`Llista ortogràfica desordenada o duplicada a l'entrada ${count}.`);
          for (const character of word.toLocaleLowerCase("ca")) {
            if (/[\p{L}\p{N}'’·.-]/u.test(character)) characters.add(character);
          }
          offsets[count++] = lineStart;
          previous = word;
          lineStart = lineEnd + 1;
        }
        if (count !== 1262334) throw new Error(`Recompte de formes del diccionari ortogràfic incompatible: ${count}.`);
        alphabet = [...characters];
        offsets[count] = wordsText.length;
        wordOffsets = offsets.subarray(0, count + 1);
        return { loadedForms: count, overlayEntries: overlayWords.size, sourceSha256: actualHash, overlaySha256: overlayHash, source: "Softcatalà 3.3 + LanguageTool spelling dictionaries" };
      })().catch(error => { loadPromise = null; throw error; });
    }
    return loadPromise;
  }

  function hasExact(value) {
    let low = 0, high = wordOffsets.length - 2;
    while (low <= high) {
      const middle = (low + high) >>> 1;
      const candidate = wordsText.slice(wordOffsets[middle], wordOffsets[middle + 1] - 1);
      if (candidate === value) return true;
      if (candidate < value) low = middle + 1;
      else high = middle - 1;
    }
    return false;
  }

  function isAccepted(surface) {
    if (!wordOffsets) throw new Error("Cal carregar primer el lèxic ortogràfic.");
    const value = String(surface).normalize("NFC").replace(/[’ʼ]/gu, "'");
    return hasExact(value) || hasExact(value.toLocaleLowerCase("ca"))
      || overlayWords.has(value) || overlayWords.has(value.toLocaleLowerCase("ca"));
  }

  function isOverlayAccepted(surface) {
    const value = String(surface).normalize("NFC").replace(/[’ʼ]/gu, "'");
    return overlayWords.has(value);
  }

  function matchCase(source, candidate) {
    const sourceLetters = [...source].filter(character => /\p{L}/u.test(character));
    const allUppercase = sourceLetters.length > 0 && sourceLetters.every(character => !/\p{Lowercase}/u.test(character));
    if (allUppercase) return candidate.toLocaleUpperCase("ca");
    if (/^\p{Uppercase}[\p{Lowercase}\p{M}]*$/u.test(source)) {
      const points = [...candidate];
      return points.length ? points[0].toLocaleUpperCase("ca") + points.slice(1).join("") : candidate;
    }
    return candidate;
  }

  function morfologikConvertCase(source, candidate) {
    const letters = [...source].filter(character => /\p{L}/u.test(character));
    const allUppercase = letters.length > 0 && letters.every(character => !/\p{Lowercase}/u.test(character));
    const startsUppercase = /^[\p{Uppercase}]/u.test(source);
    const candidateLetters = [...candidate].filter(character => /\p{L}/u.test(character));
    const candidateAllUppercase = candidateLetters.length > 0 && candidateLetters.every(character => !/\p{Lowercase}/u.test(character));
    const candidateCapitalized = /^[\p{Uppercase}]/u.test(candidate)
      && candidateLetters.slice(1).every(character => !/\p{Uppercase}/u.test(character));
    const candidateMixedCase = !candidateAllUppercase && !candidateCapitalized
      && candidateLetters.some(character => /\p{Uppercase}/u.test(character));
    if (allUppercase) {
      const upper = candidate.toLocaleUpperCase("ca");
      return upper === source || candidateMixedCase ? candidate : upper;
    }
    if (startsUppercase) {
      const chars = [...candidate];
      const capitalized = chars.length ? chars[0].toLocaleUpperCase("ca") + chars.slice(1).join("") : candidate;
      return capitalized === source || candidateMixedCase ? candidate : capitalized;
    }
    return candidate;
  }

  function adaptSentenceInitialSuggestion(token, candidate) {
    // MorfologikSpellerRule uppercases the first character of lowercase
    // suggestions for the first word of a sentence, independently of the
    // misspelling's own casing (which may be mixed or all caps).
    if (!token.sentenceStart || token.sentenceEnd || candidate !== candidate.toLocaleLowerCase("ca")) return candidate;
    const first = [...candidate][0];
    return first ? first.toLocaleUpperCase("ca") + [...candidate].slice(1).join("") : candidate;
  }

  function removeDiacritics(value) { return value.normalize("NFD").replace(/\p{M}/gu, ""); }

  function orderCatalanSuggestions(raw, word, analyzeWord) {
    const ordered = [];
    const rawValues = raw.map(item => item.value);
    const wordPlain = removeDiacritics(word).toLocaleLowerCase("ca");
    const lowercaseWord = word === word.toLocaleLowerCase("ca");
    const capitalized = value => /^\p{Uppercase}[\p{Lowercase}\p{M}]*$/u.test(value);
    const readings = value => analyzeWord ? analyzeWord(value) : [];
    const hasPos = (value, pattern) => readings(value).some(reading => typeof reading.tag === "string" && pattern.test(reading.tag));
    for (let index = 0; index < raw.length; index++) {
      let replacement = rawValues[index];
      if (inalambricForms.has(replacement.toLocaleLowerCase("ca"))) return inalambricSuggestions.slice();
      if (lowercaseWord && capitalized(replacement) && rawValues.includes(replacement.toLocaleLowerCase("ca"))) continue;
      if (index > 0 && ordered.length && lowercaseWord && capitalized(replacement)
        && ordered[0].value === ordered[0].value.toLocaleLowerCase("ca")
        && removeDiacritics(word).toLocaleLowerCase("ca") !== removeDiacritics(replacement).toLocaleLowerCase("ca")) continue;
      if (replacement.toLocaleLowerCase("ca") === "como") continue;
      const lexicalParts = replacement.split(/[ '-]/u).filter(Boolean);
      const ignored = lexicalParts.some(part => {
        const rows = readings(part);
        return rows.some(row => ignoredSuggestionLemmas.includes(row.lemma))
          && !rows.some(row => allowedSuggestionLemmas.includes(row.lemma));
      });
      if (ignored) continue;
      replacement = replacement.replace(/' /gu, "'");
      const parts = replacement.split(" ");
      let position = 0;
      while (position < ordered.length && removeDiacritics(ordered[position].value).toLocaleLowerCase("ca") === wordPlain) position++;
      if (parts.length === 2) {
        const [first, second] = parts;
        const firstLower = first.toLocaleLowerCase("ca"), secondLower = second.toLocaleLowerCase("ca");
        if (secondLower === "s" || splitPrefixes.has(firstLower) || invalidSplitSuffixes.has(secondLower)) continue;
        if ([...second].length === 1 && !validSingleLetterSuffixes.has(secondLower)) continue;
        const secondIsNoun = hasPos(second, /^(?:V.[NG].*|V.P.*|N.*|A.*|PX.*|DD..*)$/u);
        if ([...second].length > 1 && splitPrepositions.has(firstLower) && hasPos(second, /^V.[SI].*/u) && !secondIsNoun) continue;
        const firstRows = readings(first), secondRows = readings(second);
        // LanguageTool evaluates the Balearic verb match and the nominal/
        // symbol exclusions on the whole AnalyzedTokenReadings object. Do
        // not combine those predicates on one reading: a homograph may have
        // a Balearic verb reading alongside a valid central noun reading.
        const isBalear = rows => rows.some(row => typeof row.tag === "string" && /^V......B$/u.test(row.tag))
          && !rows.some(row => typeof row.tag === "string" && (row.tag.startsWith("N") || row.tag.startsWith("S")));
        if (isBalear(firstRows) || isBalear(secondRows)) continue;
        if ([...second].length > 1 && splitParticles.has(firstLower)) { ordered.splice(position, 0, { value: replacement, weight: raw[index].weight }); continue; }
        if ([...second].length > 1 && initialPronouns.has(firstLower) && hasPos(second, /^V.[SI].*/u)) {
          ordered.splice(position, 0, { value: replacement, weight: raw[index].weight }); continue;
        }
      }
      if (removeDiacritics(replacement).toLocaleLowerCase("ca") === wordPlain) {
        ordered.splice(position, 0, { value: replacement, weight: raw[index].weight }); continue;
      }
      const clean = replacement.replace(/['-]/gu, "");
      if (index > 1 && raw.length > 2 && clean.toLocaleLowerCase("ca") === word.toLocaleLowerCase("ca")) {
        ordered.splice(Math.max(position, position === 0 ? 1 : position), 0, { value: replacement, weight: raw[index].weight }); continue;
      }
      if (index === 1 && rawValues[0] && !rawValues[0].includes("-") && /(?:'n|'t)$/u.test(rawValues[0])) {
        ordered.unshift({ value: replacement, weight: raw[index].weight }); continue;
      }
      ordered.push({ value: replacement, weight: raw[index].weight });
    }
    const seen = new Set();
    const unique = ordered.filter(item => {
      if (seen.has(item.value)) return false;
      seen.add(item.value);
      return true;
    });
    let previousWeight = null, previousReplacement = "", filtered = [];
    for (const item of unique) {
      const value = item.value;
      const weight = item.weight;
      if (removeDiacritics(value).toLocaleLowerCase("ca") !== removeDiacritics(previousReplacement).toLocaleLowerCase("ca")) {
        if (weight != null && previousWeight != null && weight - previousWeight > 10) break;
        if (weight != null) previousWeight = weight;
      }
      filtered.push(value);
      previousReplacement = value;
    }
    return filtered;
  }

  function singleEditCandidates(surface, limit = 5) {
    const original = String(surface).normalize("NFC").replace(/[’ʼ]/gu, "'");
    const lower = original.toLocaleLowerCase("ca");
    const points = [...lower];
    const seen = new Set();
    const candidates = [];
    function consider(value) {
      if (!value || value === lower || seen.has(value) || !isAccepted(value)) return;
      seen.add(value);
      candidates.push(matchCase(original, value));
    }
    // Damerau-Levenshtein distance 1: deletion, substitution, insertion and
    // adjacent transposition. This is a diagnostic candidate probe, not LT's
    // weighted Morfologik ranking; no candidate is promoted to public output.
    for (let index = 0; index < points.length; index++) {
      consider(points.slice(0, index).concat(points.slice(index + 1)).join(""));
      if (index + 1 < points.length && points[index] !== points[index + 1]) {
        const swapped = points.slice();
        [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
        consider(swapped.join(""));
      }
      for (const character of alphabet) {
        if (character !== points[index]) {
          const substituted = points.slice();
          substituted[index] = character;
          consider(substituted.join(""));
        }
        if (candidates.length >= limit) break;
      }
      if (candidates.length >= limit) break;
    }
    for (let index = 0; candidates.length < limit && index <= points.length; index++) {
      for (const character of alphabet) {
        const inserted = points.slice();
        inserted.splice(index, 0, character);
        consider(inserted.join(""));
        if (candidates.length >= limit) break;
      }
    }
    // Run-on split proposals are common Morfologik candidates and need only
    // exact local lookup. Keep them after one-edit lexical candidates.
    for (let index = 2; candidates.length < limit && index <= points.length - 2; index++) {
      const left = points.slice(0, index).join("");
      const right = points.slice(index).join("");
      if (isAccepted(left) && isAccepted(right)) candidates.push(`${matchCase(original, left)} ${right}`);
    }
    return candidates.slice(0, limit);
  }

  function splitCamelCase(value) {
    const result = [];
    let part = "", previousUppercase = false;
    for (const character of value) {
      const uppercase = /\p{Uppercase}/u.test(character);
      if (uppercase && !previousUppercase && part) { result.push(part); part = ""; }
      part += character;
      previousUppercase = uppercase;
    }
    if (part) result.push(part);
    return result;
  }

  function additionalTopSuggestion(word, speller, analyzeWord, pronounSuffixes, transformPronounAfter) {
    if (!speller) return { value: "", exclusive: false };
    const parts = splitCamelCase(word);
    if (parts.length > 1 && [...parts[0]].length > 1
      && parts.every(part => !speller.isMisspelled(part, isOverlayAccepted))) return { value: parts.join(" "), exclusive: true };
    const digitMatch = /^(.*?)(\p{Nd}+)$/u.exec(word);
    if (digitMatch) {
      const [, lexicalPart, digits] = digitMatch;
      const readings = analyzeWord ? analyzeWord(lexicalPart) : [];
      const tagged = readings.some(reading => reading.tag != null && reading.source !== "unknown"
        && !["SENT_START", "SENT_END"].includes(reading.tag));
      const commonPart = new Set(["en", "de", "del", "al", "dels", "als", "a", "i", "o", "amb"]);
      if (tagged && ([...lexicalPart].length > 2 || commonPart.has(lexicalPart.toLocaleLowerCase("ca")))) {
        return { value: `${lexicalPart} ${digits}`, exclusive: true };
      }
    }
    if (analyzeWord) {
      for (const rule of apostropheTopPatterns) {
        const match = rule.pattern.exec(word);
        if (!match) continue;
        const lexicalCandidate = match[rule.capture] + rule.add;
        const readings = analyzeWord(lexicalCandidate);
        const hasExpectedPos = readings.some(reading => typeof reading.tag === "string" && rule.pos.test(reading.tag));
        const isFirstPersonSingularPresent = readings.some(reading => reading.tag === "VMIP1S0B");
        if (hasExpectedPos && (!isFirstPersonSingularPresent || ["fer", "ajust", "gran"].includes(lexicalCandidate.toLocaleLowerCase("ca")))) {
          return { value: `${match[1]}${rule.add}${rule.separator}${match[2]}`, exclusive: false };
        }
      }
      for (const pronouns of pronounSuffixes || []) {
        if (!word.toLocaleLowerCase("ca").endsWith(pronouns)) continue;
        let verb = word.toLocaleLowerCase("ca").slice(0, word.length - pronouns.length);
        let readings = analyzeWord(verb);
        if (readings.some(reading => typeof reading.tag === "string" && /^V.[NGM].*/u.test(reading.tag))) {
          return { value: verb + transformPronounAfter(pronouns, verb), exclusive: false };
        }
        if (verb.length < 5) return { value: "", exclusive: false };
        if (word.toLocaleLowerCase("ca").startsWith("d") || word.toLocaleLowerCase("ca").startsWith("l")) {
          const initial = verb[0];
          verb = verb.slice(1);
          readings = analyzeWord(verb);
          if (readings.some(reading => typeof reading.tag === "string" && /^V.N.*/u.test(reading.tag))) {
            return { value: `${initial}'${verb}${transformPronounAfter(pronouns, verb)}`, exclusive: false };
          }
        }
        return { value: "", exclusive: false };
      }
    }
    return { value: "", exclusive: false };
  }

  function isProtectedNonWord(text, token) {
    // A token immediately following a hash is part of a social tag, not prose.
    // This works across tokenizer splits such as #tag-name as well as (#tag).
    const prefix = text.slice(0, token.start);
    if (/(?:^|[^\p{L}\p{N}_])[#@][^\s]*$/u.test(prefix)) return true;

    // LanguageTool's tokenizer can expose numeric notation as word tokens.
    // Never feed digit-only coordinates, measurements, or formula fragments
    // to the word-level dictionary.
    if (!/\p{L}/u.test(token.text)) return true;

    // Preserve domain and file suffixes even when the tokenizer splits the dot
    // from the label (for example, "domini .org" or a trailing .txt).
    return text[token.start - 1] === "." && /^[a-z0-9]{1,8}$/iu.test(token.text);
  }

  function findContextualWordSplitIssues(text, tokens, speller, suggestionsForToken) {
    if (!speller?.getFrequency || !speller?.isMisspelled) return { issues: [], covered: new Set() };
    const words = tokens.filter(token => token.kind === "word" && !token.immunized && !token.ignoredBySpeller
      && !isProtectedNonWord(text, token));
    const isMisspelled = value => Boolean(speller.isProhibited?.(value))
      || speller.isMisspelled(value, candidate => overlayWords.has(candidate));
    const canBeSpellingError = token => speller.isProhibited?.(token.text)
      || !(token.readings || []).some(reading => reading.tag != null
        && !["SENT_START", "SENT_END", "PARAGRAPH_END"].includes(reading.tag));
    const frequency = value => speller.getFrequency(value);
    const covered = new Set();
    const issues = [];
    const capitalizeFirst = value => {
      const chars = [...value];
      return chars.length ? chars[0].toLocaleUpperCase("ca") + chars.slice(1).join("") : value;
    };

    for (let index = 0; index + 1 < words.length; index++) {
      const left = words[index], right = words[index + 1];
      if (!/^\s+$/u.test(text.slice(left.end, right.start))) continue;
      const leftBad = canBeSpellingError(left) && isMisspelled(left.text);
      const rightBad = canBeSpellingError(right) && isMisspelled(right.text);
      if (!leftBad && !rightBad) continue;
      const replacements = [];
      const rightLowFrequency = !/\p{Nd}/u.test(right.text) && frequency(right.text) < 21;
      const leftLowFrequency = !/\p{Nd}/u.test(left.text) && frequency(left.text) < 21;

      // Port the general boundary-recovery logic from MorfologikSpellerRule:
      // a character can have migrated across the space between two tokens.
      if (leftBad && rightLowFrequency) {
        const first = left.text.slice(0, -1);
        const second = left.text.slice(-1) + right.text;
        if (first.length > 1 && second.length > 2 && !isMisspelled(first) && !isMisspelled(second)
          && frequency(first) + frequency(second) > frequency(right.text)) replacements.push(`${first} ${second}`);

        const third = left.text + right.text[0];
        const fourth = right.text.slice(1);
        if (fourth.length > 2 && !isMisspelled(third) && !isMisspelled(fourth)
          && frequency(third) + frequency(fourth) > frequency(right.text)) replacements.push(`${third} ${fourth}`);

        const joined = left.text + right.text;
        if (right.text === right.text.toLocaleLowerCase("ca") && !isMisspelled(joined)
          && frequency(joined) >= frequency(right.text)) replacements.push(joined);
      }
      if (rightBad && leftLowFrequency) {
        const first = left.text.slice(0, -1);
        const second = left.text.slice(-1) + right.text;
        if (first.length > 1 && second.length > 2 && !isMisspelled(first) && !isMisspelled(second)
          && frequency(first) + frequency(second) > frequency(left.text)) replacements.push(`${first} ${second}`);

        const third = left.text + right.text[0];
        const fourth = right.text.slice(1);
        if (fourth.length > 2 && !isMisspelled(third) && !isMisspelled(fourth)
          && frequency(third) + frequency(fourth) > frequency(left.text)) replacements.push(`${third} ${fourth}`);

        const joined = left.text + right.text;
        if (right.text === right.text.toLocaleLowerCase("ca") && !isMisspelled(joined)
          && frequency(joined) >= frequency(left.text)) replacements.push(joined);
      }
      // Joining the neighboring token's ordinary suggestions is valid only
      // after a boundary-recovery candidate passes the same lexical and
      // frequency checks as LanguageTool's split-word path.
      if (!replacements.length) continue;
      const unique = [];
      for (const replacement of replacements) {
        const cased = leftBad && left.sentenceStart ? capitalizeFirst(replacement) : morfologikConvertCase(left.text, replacement);
        if (cased !== text.slice(left.start, right.end) && !unique.includes(cased)) unique.push(cased);
      }
      if (leftBad !== rightBad) {
        const changed = leftBad ? left : right;
        for (const word of suggestionsForToken(changed)) {
          const replacement = leftBad ? `${word} ${right.text}` : `${left.text} ${word}`;
          if (!unique.includes(replacement)) unique.push(replacement);
        }
      }
      if (!unique.length) continue;
      issues.push({
        id: `MORFOLOGIK_RULE_CA_ES:${left.start}:${right.end}`,
        ruleId: "MORFOLOGIK_RULE_CA_ES",
        category: "spelling",
        severity: "warning",
        message: "Possible error ortogràfic.",
        text: text.slice(left.start, right.end),
        start: left.start,
        end: right.end,
        suggestions: unique,
        shortMessage: "Error ortogràfic",
        replacementStart: left.start,
        replacementEnd: right.end
      });
      covered.add(left);
      covered.add(right);
      index++;
    }
    return { issues, covered };
  }

  function findNumericAndSymbolPrefixIssues(text, tokens, speller) {
    if (!speller?.isMisspelled) return { issues: [], covered: new Set() };
    const issues = [], covered = new Set();
    const prefixPattern = /^(\d[\.,\d]*|\P{L}+)(.*)$/u;
    const prefixExceptions = /^[\p{C}\-\\$%&]+(.*)$/u;
    for (const token of tokens) {
      if (token.kind !== "word" || token.immunized || token.ignoredBySpeller || isProtectedNonWord(text, token)) continue;
      if ((token.readings || []).some(reading => reading.tag != null
        && !["SENT_START", "SENT_END", "PARAGRAPH_END"].includes(reading.tag))) continue;
      const match = prefixPattern.exec(token.text);
      if (!match || !match[1] || !match[2] || prefixExceptions.test(token.text)) continue;
      if (!speller.isMisspelled(token.text, value => overlayWords.has(value))) continue;
      const suffixTokens = match[2].match(/[\p{L}\p{M}\p{N}]+/gu) || [];
      const suffixHasMisspelling = suffixTokens.some(value => speller.isMisspelled(value, candidate => overlayWords.has(candidate)));
      if (suffixHasMisspelling) continue;
      const suggestion = `${match[1]} ${match[2]}`;
      if (suggestion === token.text) continue;
      issues.push({
        id: `SOFTCATALA_SPELLING_DIAGNOSTIC:${token.start}:${token.end}`,
        ruleId: "SOFTCATALA_SPELLING_DIAGNOSTIC",
        category: "spelling",
        severity: "warning",
        message: "Possible error ortogràfic.",
        text: text.slice(token.start, token.end),
        start: token.start,
        end: token.end,
        suggestions: [suggestion],
        diagnosticOnly: true,
        suggestionMode: "morfologik-numeric-or-symbol-prefix"
      });
      covered.add(token);
    }
    return { issues, covered };
  }

  function inspect(text, tokens, speller = null, analyzeWord = null, pronounSuffixes = [], transformPronounAfter = () => "") {
    if (!wordOffsets) throw new Error("Cal carregar primer el lèxic ortogràfic.");
    // Suggestion filters can inspect the same candidate more than once (and
    // different misspellings often share candidates). Morphological readings
    // are deterministic for this inspection, so reuse them without changing
    // which candidates or suggestions are accepted.
    const analyzedWordReadings = new Map();
    const analyzeWordOnce = typeof analyzeWord === "function" ? surface => {
      const key = String(surface ?? "");
      if (!analyzedWordReadings.has(key)) {
        analyzedWordReadings.set(key, analyzeWord(key) || []);
      }
      return analyzedWordReadings.get(key);
    } : null;
    const candidatesFor = surface => {
      if (!speller) return { values: singleEditCandidates(surface), distance: null };
      if (!speller.findSimilarWordCandidates || !speller.findSimilarWordCandidatesInOverlay) {
        throw new Error("The local Morfologik speller must expose both weighted FSA candidate sources.");
      }
      // Match LanguageTool's staged Morfologik search: query larger edit
      // distances only when the preceding distance produced no candidates.
      for (const distance of [1, 2, 3]) {
        const values = speller.findSimilarWordCandidates(surface, distance)
          .filter(value => value.word !== surface);
        const merged = [...values];
        const seen = new Set(merged.map(value => value.word));
        const overlayValues = speller.findSimilarWordCandidatesInOverlay(surface, distance);
        for (const value of overlayValues) {
          if (!seen.has(value.word) && value.word.toLocaleLowerCase("ca") !== surface.toLocaleLowerCase("ca")) {
            seen.add(value.word);
            merged.push({ word: value.word, weight: value.weight ?? value.score ?? null });
          }
        }
        merged.sort((left, right) => (left.weight ?? Number.MAX_SAFE_INTEGER) - (right.weight ?? Number.MAX_SAFE_INTEGER));
        // Keep the complete upstream candidate set. Morfologik and the
        // Catalan ordering/filter stage operate on all candidates; truncating
        // here drops low-ranked but valid split suggestions before the
        // LanguageTool-compatible filters and weight cutoff can run.
        if (merged.length) return { values: merged, distance };
      }
      return { values: [], distance: 3 };
    };
    const suggestionsForToken = token => {
      const candidateSet = candidatesFor(token.text);
      const extraTop = additionalTopSuggestion(token.text, speller, analyzeWordOnce, pronounSuffixes, transformPronounAfter);
      const weighted = extraTop.value
        ? [{ value: extraTop.value, weight: null }, ...(extraTop.exclusive ? [] : candidateSet.values.map(item => ({ value: item.word, weight: item.weight })))]
        : candidateSet.values.map(item => ({ value: item.word, weight: item.weight }));
      const suggestions = [];
      for (const item of weighted) {
        // SpellingCheckRule.filterSuggestions() removes prohibited forms
        // before sentence-initial casing is applied to displayed results.
        if (speller?.isProhibited?.(item.value)) continue;
        const adapted = morfologikConvertCase(token.text, item.value);
        if (!suggestions.some(existing => existing.value === adapted)) suggestions.push({ value: adapted, weight: item.weight });
      }
      const ordered = orderCatalanSuggestions(suggestions, token.text, analyzeWordOnce);
      const displayed = [];
      for (const value of ordered) {
        const adapted = adaptSentenceInitialSuggestion(token, value);
        if (!displayed.includes(adapted)) displayed.push(adapted);
      }
      const normalized = speller?.normalizeLegacyDiacritics
        ? speller.normalizeLegacyDiacritics(displayed) : displayed;
      return { candidateSet, values: normalized };
    };
    const contextual = findContextualWordSplitIssues(text, tokens, speller, token => suggestionsForToken(token).values);
    const prefixIssues = findNumericAndSymbolPrefixIssues(text, tokens, speller);
    const singleWordIssues = tokens.filter(token => {
      if (contextual.covered.has(token) || prefixIssues.covered.has(token)) return false;
      if (token.kind !== "word" || token.immunized || token.ignoredBySpeller) return false;
      if (isProtectedNonWord(text, token)) return false;
      if ((token.readings || []).some(reading => reading.tag != null
        && !["SENT_START", "SENT_END", "PARAGRAPH_END"].includes(reading.tag))
        && !speller?.isProhibited?.(token.text)) return false;
      if (/^(?:https?|ftp|mailto):/iu.test(token.text) || /@|\.(?:com|org|net|cat|es|eu|io|edu|gov)$/iu.test(token.text)) return false;
      // With the local Morfologik adapter, route both the base FSA and LT
      // overlays through one case/punctuation policy. Do not short-circuit on
      // a lowercase list hit: Morfologik deliberately rejects mixed-case forms.
      return speller ? Boolean(speller.isProhibited?.(token.text))
        || speller.isMisspelled(token.text, value => overlayWords.has(value)) : !isAccepted(token.text);
    }).map(token => {
      const { candidateSet, values: orderedSuggestions } = suggestionsForToken(token);
      return {
        id: `SOFTCATALA_SPELLING_DIAGNOSTIC:${token.start}:${token.end}`,
        ruleId: "SOFTCATALA_SPELLING_DIAGNOSTIC",
        category: "spelling",
        severity: "warning",
        message: "La forma no es troba exactament al diccionari ortogràfic Softcatalà 3.3.",
        text: text.slice(token.start, token.end),
        start: token.start,
        end: token.end,
        suggestions: orderedSuggestions,
        diagnosticOnly: true,
        suggestionMode: speller ? `morfologik-fsa-distance-${candidateSet.distance}` : "unranked-single-edit-probe"
      };
    });
    return [...contextual.issues, ...prefixIssues.issues, ...singleWordIssues]
      .sort((left, right) => left.start - right.start || left.end - right.end);
  }

  function clear() { wordsText = ""; wordOffsets = null; overlayWords = new Set(); alphabet = []; loadPromise = null; }
  globalThis.CorrectorCatalanSpellingLexicon = Object.freeze({ load, isAccepted, isOverlayAccepted, inspect, clear });
})();
