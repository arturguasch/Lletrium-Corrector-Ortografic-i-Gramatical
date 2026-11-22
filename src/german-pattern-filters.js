/* German LanguageTool RuleFilter adapters used by the extension worker. */
(() => {
  "use strict";

  const schemas = Object.freeze({
    GermanDateCheckFilter: { args: ["year", "month", "day", "weekDay", "date"], required: ["weekDay"] },
    GermanYMDDateCheckFilter: { args: ["date", "weekDay"], required: ["date", "weekDay"] },
    GermanFutureDateFilter: { args: ["year", "month", "day"], required: ["year", "month", "day"] },
    GermanNewYearDateFilter: { args: ["year", "month", "day"], required: ["year", "month", "day"] },
    GermanYMDNewYearDateFilter: { args: ["date"], required: ["date"] },
    GermanDateRangeChecker: { args: ["x", "y"], required: ["x", "y"] },
    GermanNumberInWordFilter: { args: ["word"], required: ["word"] },
    GermanCompoundCheckFilter: { args: ["part1", "part2"], required: ["part1", "part2"] },
    GermanInsertCommaFilter: { args: ["fake"], required: ["fake"] },
    GermanPotentialCompoundFilter: { args: ["part1", "part2"], required: ["part1", "part2"] },
    GermanRemoveUnknownCompoundsFilter: { args: ["part1", "part2"], required: ["part1", "part2"] },
    GermanValidWordFilter: { args: ["word1", "word2"], required: ["word1", "word2"] },
    GermanMultitokenSpellerFilter: { args: ["none", "keepSpaces"], required: [] }
  });

  const months = ["januar", "februar", "märz", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "dezember"];
  const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const clean = value => String(value ?? "").replace(/[\u00ad\p{P}]/gu, "").toLocaleLowerCase("de");
  const monthNumber = value => {
    const input = clean(value);
    if (/^\d{1,2}$/u.test(input)) return Number(input);
    if (input.startsWith("jän")) return 1;
    const index = months.findIndex(month => month.startsWith(input.slice(0, Math.min(3, input.length))));
    return index < 0 ? 0 : index + 1;
  };
  const validDate = (year, month, day) => {
    if (![year, month, day].every(Number.isInteger)) return null;
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(0, 0, 0, 0);
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
  };
  const dateParts = args => {
    if (args.date != null) {
      const match = String(args.date).match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/u);
      if (!match) return null;
      return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
    }
    const day = String(args.day ?? "").match(/^\d+/u)?.[0];
    const month = monthNumber(args.month);
    const year = args.year == null || args.year === "" ? new Date().getFullYear() : Number(args.year);
    if (!day || !month || !Number.isInteger(year)) return null;
    return { year, month, day: Number(day) };
  };
  const germanSpeller = runtime => runtime.filterResources?.german?.speller;
  const known = (runtime, word) => {
    const speller = germanSpeller(runtime);
    return Boolean(speller && !speller.isMisspelled(word));
  };
  const upperFirst = value => String(value).replace(/^\p{Ll}/u, letter => letter.toLocaleUpperCase("de"));

  function normalizeMultiwordKey(value) {
    return String(value).toLocaleLowerCase("de").normalize("NFD").replace(/\p{M}/gu, "").replaceAll("-", " ");
  }

  function splitMultiword(value) { return String(value).trim().split(/\s+/u).filter(Boolean); }

  function levenshtein(left, right) {
    if (left.replaceAll(" ", "") === right.replaceAll(" ", "")) return 0;
    const previous = Array.from({ length: right.length + 1 }, (_value, index) => index);
    for (let i = 1; i <= left.length; i++) {
      let diagonal = previous[0]; previous[0] = i;
      for (let j = 1; j <= right.length; j++) {
        const old = previous[j];
        previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
        diagonal = old;
      }
    }
    let distance = previous[right.length];
    const normalized = value => value.replaceAll("y", "i").replaceAll("ko", "co").replaceAll("ka", "ca");
    distance = Math.min(distance, normalized(left) === left && normalized(right) === right ? distance : levenshteinBasic(normalized(left), normalized(right)));
    if (distance > 1 && [...left].sort().join("") === [...right].sort().join("")) distance--;
    if (distance > 0 && left.length === right.length && [...left].sort().join("") === [...right].sort().join("")) distance = 1;
    return distance;
  }

  function levenshteinBasic(left, right) {
    const previous = Array.from({ length: right.length + 1 }, (_value, index) => index);
    for (let i = 1; i <= left.length; i++) {
      let diagonal = previous[0]; previous[0] = i;
      for (let j = 1; j <= right.length; j++) {
        const old = previous[j]; previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1)); diagonal = old;
      }
    }
    return previous[right.length];
  }

  function createMultiwordSpeller(text) {
    const byFirstCharacter = new Map(), byNoSpaces = new Map(), partsByKey = new Map();
    const add = (map, key, value) => { const list = map.get(key) || []; if (!list.includes(value)) list.push(value); map.set(key, list); };
    for (const rawLine of String(text).split(/\r?\n/u)) {
      if (!rawLine || rawLine.startsWith("#")) continue;
      const line = rawLine.split("#", 1)[0].trim(); if (!line) continue;
      const formTag = line.split("/"), form = formTag[0]; if (!form) continue;
      const forms = [form], tags = formTag[1] || "";
      for (const [tag, suffix] of [["E", "e"], ["S", "s"], ["N", "n"]]) if (tags.includes(tag)) forms.push(form + suffix);
      for (const candidate of forms) {
        const key = normalizeMultiwordKey(candidate); if (!key.includes(" ")) continue;
        const first = key[0];
        if (!partsByKey.has(key)) partsByKey.set(key, splitMultiword(key));
        add(byFirstCharacter, first, { key, candidate }); add(byNoSpaces, key.replaceAll(" ", ""), candidate);
      }
    }
    const isException = (original, candidate) => original.slice(0, -1) === candidate && (original.endsWith("s") || original.endsWith("-"));
    const stop = (candidates, original) => candidates.some(candidate => isException(original, candidate) || candidate === original
      || candidate === candidate.toLocaleLowerCase("de") && upperFirst(candidate) === original);
    const suggestions = (input, tokensAcceptedBySpeller, speller) => {
      const original = String(input).replace(/\p{Zs}+/gu, " ").replace(/- /gu, "-").replace(/ -/gu, "-");
      const key = normalizeMultiwordKey(original), keyNoSpaces = key.replaceAll(" ", ""), weighted = [];
      if (/[\r\n]/u.test(original)) return [];
      const exactKeys = byNoSpaces.get(keyNoSpaces) || [];
      if (exactKeys.length) {
        if (stop(exactKeys, original)) return [];
        exactKeys.forEach(candidate => weighted.push({ candidate, weight: 0 }));
      }
      const first = key[0], candidates = byFirstCharacter.get(first) || [];
      if (!weighted.length) {
        const inputParts = splitMultiword(key), minLength = original.length - 3, maxLength = original.length + 3;
        for (const item of candidates) {
          if (item.key.length < minLength || item.key.length > maxLength) continue;
          const candidateList = byNoSpaces.get(item.key.replaceAll(" ", "")) || [item.candidate];
          if (stop(candidateList, original)) return [];
          const candidateParts = partsByKey.get(item.key);
          const distances = candidateParts.length === inputParts.length && inputParts.length > 1
            ? candidateParts.map((part, index) => levenshtein(part, inputParts[index])) : [levenshtein(item.key, key)];
          const total = distances.reduce((sum, value) => sum + value, 0);
          if (total < 1) { candidateList.forEach(candidate => weighted.push({ candidate, weight: 0 })); if (weighted.length === 2) break; continue; }
          if (item.key.length < 7 || distances.some((distance, index) => distance > (inputParts[index]?.length > 5 && candidateParts[index]?.length > 4 ? 2 : 1))) continue;
          const correct = candidateParts.length === inputParts.length && candidateParts.length > 1
            ? candidateParts.reduce((sum, part, index) => sum + (part === inputParts[index] ? part.length : 0), 0) : 0;
          const firstDistance = candidateParts.length === 2 && inputParts.length === 2
            ? candidateParts.reduce((sum, part, index) => sum + (part[0] === inputParts[index][0] ? 0 : ("sz".includes(part[0]) && "sz".includes(inputParts[index][0]) || "bv".includes(part[0]) && "bv".includes(inputParts[index][0]) ? 0.2 : "iy".includes(part[0]) && "iy".includes(inputParts[index][0]) ? 0 : 1)), 0) : 0;
          const maxDistance = correct + (correct <= 7 ? 2 - firstDistance : 2 + 0.25 * (correct - 7) - 0.6 * firstDistance);
          if (total <= maxDistance) candidateList.forEach(candidate => weighted.push({ candidate, weight: total }));
        }
      }
      if (!weighted.length) return [];
      weighted.sort((a, b) => a.weight - b.weight);
      const firstWeight = weighted[0].weight;
      if (tokensAcceptedBySpeller && weighted[0].candidate.toLocaleUpperCase("de") === original) return [];
      if (tokensAcceptedBySpeller && firstWeight > 1) return [];
      return [...new Set(weighted.filter(item => item.weight - firstWeight < 1).map(item => item.candidate))];
    };
    return Object.freeze({ suggestions });
  }

  function dateFilter(runtime, name, args, match, suggestions) {
    const parts = dateParts(args);
    if (!parts) return null;
    const date = validDate(parts.year, parts.month, parts.day);
    if (!date) return null;
    const now = runtime.now(), currentYear = now.getFullYear();
    if (name === "GermanFutureDateFilter") return date.getTime() > Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) ? suggestions : null;
    if (name === "GermanNewYearDateFilter" || name === "GermanYMDNewYearDateFilter") {
      if (now.getMonth() !== 0 || parts.month === 12 || parts.year + 1 !== currentYear) return null;
      return { suggestions, message: match.message.replaceAll("{year}", String(parts.year)).replaceAll("{realYear}", String(currentYear)), allowNoSuggestions: true };
    }
    if (name === "GermanDateCheckFilter" || name === "GermanYMDDateCheckFilter") {
      const expectedText = clean(args.weekDay);
      const expected = expectedText ? weekdays.findIndex(day => clean(day).startsWith(expectedText)) : -1;
      const expectedShort = ["so", "mo", "di", "mi", "do", "fr", "sa"].findIndex(prefix => expectedText.startsWith(prefix));
      const wanted = expected >= 0 ? expected : expectedShort;
      if (wanted < 0 || date.getUTCDay() === wanted) return null;
      const claimed = weekdays[wanted];
      return { suggestions, message: match.message.replaceAll("{realDay}", weekdays[date.getUTCDay()])
        .replaceAll("{day}", claimed).replaceAll("{currentYear}", String(currentYear)), allowNoSuggestions: true };
    }
    return null;
  }

  function apply(name, context) {
    const { args, match, suggestions } = context;
    if (name === "GermanInsertCommaFilter") {
      const morphology = this.filterResources?.german?.morphology;
      const hasTag = (word, prefix) => morphology?.lookup(word).some(reading => String(reading.tag || "").startsWith(prefix)) || false;
      const output = [];
      for (const replacement of suggestions) {
        const parts = replacement.trim().split(/\s+/u);
        if (parts.length === 2) { output.push(`${parts[0]}, ${parts[1]}`); continue; }
        if (parts.length === 3) {
          if (hasTag(parts[0], "VER:") && hasTag(parts[1], "PRO:PER:")) output.push(`${parts[0]}, ${parts[1]} ${parts[2]}`);
          else if (/^[Ss]agt?$/u.test(parts[0]) && parts[1] === "mal" && hasTag(parts[2], "VER:")) output.push(`${parts[0]} ${parts[1]}, ${parts[2]}`);
          else if (hasTag(parts[0], "VER:") && hasTag(parts[1], "ADV:") && hasTag(parts[2], "VER:")) output.push(`${parts[0]}, ${parts[1]} ${parts[2]}`);
          continue;
        }
        if (parts.length < 4 || parts.length > 7) continue;
        const tags = parts.map(word => morphology?.lookup(word).map(reading => reading.tag || "") || []);
        const tagged = (index, prefix) => tags[index]?.some(tag => tag.startsWith(prefix));
        const patternPosition = match.marker?.start ?? 0;
        if (patternPosition > 2 && !(patternPosition === 3 && (match.rows?.[1]?.ltReadings || []).some(reading => String(reading.tag || "").startsWith("ADV:")))) continue;
        if (parts.length === 5 && tagged(0,"VER:") && tagged(1,"ART:") && tagged(2,"SUB:") && tagged(3,"SUB:") && tagged(4,"VER:")) output.push(parts.join(" ") + ",");
        else if (parts.length === 4 && tagged(0,"VER:") && /^(?:der|die|das|seine|ihre|deine|unsere|meine|folgender|dieser)$/iu.test(parts[1])) output.push(`${parts[0]}, ${parts.slice(1).join(" ")}`);
        else if (tagged(0,"VER:") && tagged(1,"PRO:POS:") && tagged(2,"SUB:")) output.push(`${parts[0]}, ${parts.slice(1).join(" ")}`);
        else if (tagged(0,"VER:") && tagged(1,"PRO:PER:") && tagged(2,"ADV:INR")) output.push(`${parts[0]} ${parts[1]}, ${parts.slice(2).join(" ")}`);
        else if (tagged(0,"VER:") && tagged(1,"PRO:POS:") && tagged(2,"ADJ:")) output.push(`${parts[0]}, ${parts.slice(1).join(" ")}`);
        else if (/^(?:denke|dachte|glaube|schätze|vermute|behaupte)$/iu.test(parts[0]) && tagged(1,"PRO:DEM:") && tagged(2,"SUB:")) output.push(`${parts[0]}, ${parts.slice(1).join(" ")}`);
        else if (/^(?:bei|für|mit)$/iu.test(parts[1]) && /^(?:dir|dich|euer|euch)$/iu.test(parts[2]) && tagged(3,"VER:")) output.push(`${parts[0]}, ${parts.slice(1).join(" ")}`);
      }
      return { suggestions: [...new Set(output)] };
    }
    if (name === "GermanDateRangeChecker") {
      const x = Number(args.x), y = Number(args.y);
      return Number.isFinite(x) && Number.isFinite(y) && x >= y ? suggestions : null;
    }
    if (name === "GermanMultitokenSpellerFilter") {
      const speller = germanSpeller(this), tokenizer = this.filterResources?.german?.tokenizer;
      const multiword = this.filterResources?.german?.multiwordSpeller;
      const original = context.original;
      const letters = [...original].filter(character => /\p{L}/u.test(character)).length;
      if (!multiword || !speller || original.length > 50 || letters < 2) return null;
      const tokens = tokenizer?.tokenize(original).filter(token => /\p{L}/u.test(token)) || splitMultiword(original);
      let accepted = tokens.length > 0 && tokens.every(token => !speller.isMisspelled(token));
      if (tokens.length === 2) {
        const [first, second] = tokens;
        if (!first || !second) return null;
        const left = first.slice(0, -1), right = first.slice(-1) + second;
        if (!speller.isMisspelled(left) && !speller.isMisspelled(right)) return null;
        const mergeLeft = first + second[0], mergeRight = second.slice(1);
        if (!speller.isMisspelled(mergeLeft) && !speller.isMisspelled(mergeRight)) return null;
      }
      let replacements = multiword.suggestions(original, accepted, speller);
      if (!replacements.length) return null;
      if (original.length > 4 && /\p{L}/u.test(original) && original === original.toLocaleUpperCase("de")) {
        replacements = [...new Set(replacements.map(value => value.toLocaleUpperCase("de")).filter(value => value !== original))];
      } else {
        const firstSlot = match.captures.flat()[0], sentenceTokenizer = this.filterResources?.sentenceTokenizer;
        const segment = sentenceTokenizer?.segment(context.text).find(item => item.start <= firstSlot.row.start && item.end >= firstSlot.row.end);
        const prior = (match.rows || []).filter(row => segment && row.start >= segment.start && row.end <= firstSlot.row.start);
        const atSentenceStart = segment ? !prior.some(row => /\p{L}/u.test(row.token)) : !context.text.slice(0, firstSlot.row.start).trim();
        if (atSentenceStart) replacements = [...new Set(replacements.map(value => value === value.toLocaleLowerCase("de") ? upperFirst(value) : value).filter(value => value !== original))];
      }
      return replacements.length ? { suggestions: replacements } : null;
    }
    if (["GermanDateCheckFilter", "GermanYMDDateCheckFilter", "GermanFutureDateFilter", "GermanNewYearDateFilter", "GermanYMDNewYearDateFilter"].includes(name)) {
      return dateFilter(this, name, args, match, suggestions);
    }
    const speller = germanSpeller(this);
    if (!speller) return null;
    if (name === "GermanNumberInWordFilter") {
      const word = String(args.word ?? ""), replacements = [];
      const zeroToO = word.replaceAll("0", "o"), withoutDigits = word.replace(/[0-9]/gu, "");
      if (zeroToO !== word && known(this, zeroToO)) replacements.push(zeroToO);
      if (known(this, withoutDigits) && !replacements.includes(withoutDigits)) replacements.push(withoutDigits);
      if (!replacements.length) replacements.push(...speller.suggest(withoutDigits));
      return replacements.length ? { suggestions: [...new Set(replacements)] } : null;
    }
    if (name === "GermanPotentialCompoundFilter") {
      const first = String(args.part1 ?? ""), second = String(args.part2 ?? "");
      if (!first || !second) return null;
      const joinCase = value => /[\p{Lu}]/u.test(value.slice(1)) || value === value.toLocaleUpperCase("de") ? value : upperFirst(value.toLocaleLowerCase("de"));
      const compound = joinCase(first) + (/[\p{Lu}]/u.test(second.slice(1)) || second === second.toLocaleUpperCase("de") ? second : second.toLocaleLowerCase("de"));
      const hyphenated = joinCase(first) + "-" + upperFirst(second.toLocaleLowerCase("de"));
      const replacements = known(this, compound) ? (compound.length > 20 ? [hyphenated, compound] : [compound]) : [hyphenated];
      return { suggestions: replacements };
    }
    if (name === "GermanRemoveUnknownCompoundsFilter") {
      return known(this, String(args.part1 ?? "") + String(args.part2 ?? "").toLocaleLowerCase("de")) ? suggestions : null;
    }
    if (name === "GermanCompoundCheckFilter") {
      const pairs = this.filterResources?.german?.allowedCompoundPairs;
      const first = String(args.part1 ?? "").toLocaleLowerCase("de"), second = String(args.part2 ?? "").toLocaleLowerCase("de");
      return pairs?.get(first)?.has(second) ? suggestions : null;
    }
    if (name === "GermanValidWordFilter") {
      const first = String(args.word1 ?? ""), second = String(args.word2 ?? "");
      return !known(this, first + second) && !known(this, first + second.toLocaleLowerCase("de")) ? suggestions : null;
    }
    return undefined;
  }

  globalThis.CorrectorGermanPatternFilters = Object.freeze({ schemas, apply, createMultiwordSpeller });
})();
