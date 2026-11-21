/* Italian XML/spelling pipeline. Its large dictionary resources are read from
 * the user-installed, versioned language pack in IndexedDB. */
(() => {
  "use strict";

  const BASE = "build/resources/it-IT/";
  const FILES = Object.freeze({
    pos: "it-pos-cfsa2.bin.gz",
    tags: "it-tags.txt.gz",
    rules: "it-pattern-rules.json.gz",
    disambiguation: "it-disambiguation-rules.json.gz",
    srx: "it-srx.json",
    spelling: "it-spelling-cfsa2.dict.gz",
    spellingInfo: "it-spelling.info.gz",
    synthesis: "it-synthesis-cfsa2.dict.gz",
    synthesisInfo: "it-synthesis.info.gz",
    spellingWords: "spelling.txt.gz",
    ignoredWords: "ignore.txt.gz"
  });
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const LT_DELIMITERS = new Set(Array.from(" \u00A0\u115f\u1160\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u200c\u200d\u200e\u200f\u2028\u2029\u202a\u202b\u202c\u202d\u202e\u202f\u205f\u2060\u2061\u2062\u2063\u206a\u206b\u206c\u206d\u206e\u206f\u3000\u3164\ufeff\uffa0\ufff9\ufffa\ufffb¦‖∣|,.;()[]{}=*#∗+×·÷<>!?:~/\\\"'«»„”“‘’`´‛′›‹…¿¡‼⁇⁈⁉™®\u203d\u00b6\uffeb\u2e2e\u2012\u2013\u2014\u2015\u2500\u3161✓●○◆➢■□★❏➔↵❖▪❑•⮚≥→⇾⇉⇒⇨⇛¹²³⁰ⁱ⁴⁵⁶⁷⁸⁹\t\n\r\u000b"));
  const LT_PROTOCOLS = new Set(["http", "https", "ws", "wss", "ftp", "ftps", "sftp", "file", "mailto", "tel", "sms", "git", "ssh", "data", "magnet", "smb", "slack", "spotify"]);
  // Keep the upstream character class literally: `$-_` is a deliberate
  // character range in the LanguageTool regex and includes `:`, `=`, etc.
  const LT_URL_CHARS = /^[a-zA-ZÄÖÜäöü0-9/%$-_.+!*'(),?#~]+$/u;
  const LT_DOMAIN_CHARS = /^[a-zA-Z0-9][a-zA-Z0-9-]+$/u;
  const LT_EMAIL = /(?<!:)@?\b[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:\[[0-9]{1,3}(?:\.[0-9]{1,3}){3}\]|(?:[a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})\b/g;

  function isMixedCase(word) {
    const characters = [...String(word ?? "")];
    const letters = characters.filter(character => /\p{L}/u.test(character));
    if (!letters.length) return false;
    const lower = character => character === character.toLocaleLowerCase("it");
    const upper = character => character === character.toLocaleUpperCase("it");
    const allUpper = letters.every(upper), allLower = letters.every(lower);
    const capitalized = /\p{Lu}/u.test(characters[0] || "") && characters.slice(1).every(character => !/\p{L}/u.test(character) || lower(character));
    // Mirrors LanguageTool StringTools.isMixedCase: ordinary Titlecase and
    // all-uppercase forms get lowercase fallback; internal case mixtures do not.
    return !allUpper && !capitalized && !allLower;
  }

  function parseInfo(text) {
    const values = Object.create(null);
    for (const line of String(text).split(/\r?\n/u)) {
      const row = line.trim(), equals = row.indexOf("=");
      if (row && !row.startsWith("#") && equals > 0) values[row.slice(0, equals).trim()] = row.slice(equals + 1).trim();
    }
    return values;
  }

  class ItalianWordTokenizer {
    tokenize(text) {
      const tokens = [];
      let current = "";
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (LT_DELIMITERS.has(char)) {
          if (current) tokens.push(current), current = "";
          tokens.push(char);
        } else current += char;
      }
      if (current) tokens.push(current);
      return this.#joinSpecial(tokens);
    }

    #joinSpecial(tokens) {
      // Port the shared LanguageTool WordTokenizer contract: first join email
      // matches over the original token stream, then join recognized URLs.
      const text = tokens.join("");
      const spans = [];
      let offset = 0;
      for (const token of tokens) { spans.push({ token, start: offset, end: offset + token.length }); offset += token.length; }
      const emails = [];
      if (text.includes("@")) {
        LT_EMAIL.lastIndex = 0;
        let match;
        while ((match = LT_EMAIL.exec(text))) {
          emails.push({ start: match.index, end: match.index + match[0].length, value: match[0] });
          if (!match[0].length) LT_EMAIL.lastIndex++;
        }
      }
      const emailJoined = [];
      let tokenIndex = 0, emailIndex = 0;
      while (tokenIndex < spans.length) {
        const email = emails[emailIndex];
        if (!email || spans[tokenIndex].start !== email.start) {
          emailJoined.push(spans[tokenIndex++].token);
          continue;
        }
        emailJoined.push(email.value);
        while (tokenIndex < spans.length && spans[tokenIndex].end <= email.end) tokenIndex++;
        emailIndex++;
      }

      const joined = [];
      let inUrl = false, url = "", urlQuote = null;
      const isWhitespace = token => /^\s+$/u.test(token);
      const startsUrl = i => {
        const token = emailJoined[i];
        if (LT_PROTOCOLS.has(token) && i + 3 < emailJoined.length && emailJoined[i + 1] === ":" && emailJoined[i + 2] === "/" && emailJoined[i + 3] === "/") return true;
        if (i + 1 < emailJoined.length && token === "www" && emailJoined[i + 1] === ".") return true;
        if (i + 3 < emailJoined.length && emailJoined[i + 1] === "." && emailJoined[i + 3] === "/" && LT_DOMAIN_CHARS.test(token) && LT_DOMAIN_CHARS.test(emailJoined[i + 2])) return true;
        return i + 5 < emailJoined.length && emailJoined[i + 1] === "." && emailJoined[i + 3] === "." && emailJoined[i + 5] === "/" && LT_DOMAIN_CHARS.test(token) && LT_DOMAIN_CHARS.test(emailJoined[i + 2]) && LT_DOMAIN_CHARS.test(emailJoined[i + 4]);
      };
      const endsUrl = (i, quote) => {
        const token = emailJoined[i];
        if (isWhitespace(token) || token === ")" || token === "]") return true;
        if (i + 1 < emailJoined.length) {
          const next = emailJoined[i + 1];
          return ((isWhitespace(next) || ['"', "»", "«", "‘", "’", "“", "”", "'", "."].includes(next)) && ([".", ",", ";", ":", "!", "?"].includes(token) || token === quote)) || !LT_URL_CHARS.test(token);
        }
        return !LT_URL_CHARS.test(token) || token === "." || token === quote;
      };
      for (let i = 0; i < emailJoined.length; i++) {
        const token = emailJoined[i];
        if (startsUrl(i) && !inUrl) {
          inUrl = true;
          if (i > 0) urlQuote = emailJoined[i - 1];
          url += token;
        } else if (inUrl && endsUrl(i, urlQuote)) {
          inUrl = false; urlQuote = null;
          joined.push(url, token); url = "";
        } else if (inUrl) url += token;
        else joined.push(token);
      }
      if (url) joined.push(url);
      return joined;
    }

    tokenizeRows(text, morphology) {
      const rows = []; let offset = 0;
      for (const token of this.tokenize(text)) {
        const start = offset, end = start + token.length; offset = end;
        if (/^\s+$/u.test(token)) continue;
        let readings = [];
        const addReadings = query => {
          try { readings.push(...morphology.lookup(query).map(reading => ({ lemma: reading.lemma, tag: reading.tag || "UNKNOWN" }))); }
          catch { /* tokens outside ISO-8859-15 are unknown to this dictionary */ }
        };
        const lower = token.toLocaleLowerCase("it");
        addReadings(token);
        if (token !== lower && !isMixedCase(token)) addReadings(lower);
        if (!readings.length && token === lower && token) {
          const title = token.charAt(0).toLocaleUpperCase("it") + token.slice(1);
          if (title !== token) addReadings(title);
        }
        const seen = new Set();
        readings = readings.filter(reading => {
          const key = `${reading.lemma ?? ""}\0${reading.tag}`;
          if (seen.has(key)) return false;
          seen.add(key); return true;
        });
        rows.push({ token, start, end, whitespaceBefore: text.slice(rows.at(-1)?.end || 0, start), ltReadings: readings.length ? readings : [{ lemma: null, tag: "UNKNOWN" }] });
      }
      if (offset !== text.length) throw new Error(`Italian WordTokenizer offset mismatch: ${offset}/${text.length}.`);
      return rows;
    }
  }

  class ItalianSentenceTokenizer {
    constructor(resource, runtime) {
      if (resource?.schemaVersion !== 1 || resource.languageCode !== "it-IT" || resource.italianRules !== 17 || resource.ruleCount !== 32 || !Array.isArray(resource.groups)) throw new Error("Italian SRX resource schema or profile is unsupported.");
      if (!runtime?.expression) throw new Error("Italian SRX requires the shared Java-compatible regex compiler.");
      this.sourceSha256 = resource.sourceSha256;
      this.groups = resource.groups.map(group => ({ name: group.name, rules: group.rules.map((rule, index) => ({
        split: rule.break === "yes", before: runtime.expression(rule.before, true, false, true),
        after: rule.after ? runtime.expression(rule.after, true, false) : null, source: `${group.name}[${index}]`
      })) }));
      this.ruleCount = this.groups.reduce((sum, group) => sum + group.rules.length, 0);
      if (this.ruleCount !== resource.ruleCount) throw new Error("Italian SRX rule count does not match its descriptor.");
    }

    segment(text) {
      if (typeof text !== "string") throw new TypeError("Text to segment must be a string.");
      if (!text) return [];
      const rules = this.groups.flatMap(group => group.rules), events = new Map(), noBreaks = new Set();
      for (let order = 0; order < rules.length; order++) {
        const rule = rules[order]; rule.before.lastIndex = 0; let match;
        while ((match = rule.before.exec(text))) {
          const boundary = match.index + match[0].length;
          if (!match[0].length) rule.before.lastIndex = Math.max(rule.before.lastIndex, match.index + 1);
          if (boundary <= 0 || boundary >= text.length) continue;
          if (rule.after) { const after = rule.after.exec(text.slice(boundary)); if (!after || after.index !== 0) continue; }
          if (!rule.split) noBreaks.add(boundary);
          const previous = events.get(boundary);
          if (rule.split && (!previous || order < previous.order)) events.set(boundary, { boundary, order, split: true });
        }
      }
      const paragraphs = new Set();
      for (const match of text.matchAll(/(?:\r?\n[\t \f\v]*){2,}/gu)) {
        const boundary = match.index + match[0].length;
        if (boundary > 0 && boundary < text.length) { paragraphs.add(boundary); events.set(boundary, { boundary, order: -1, split: true }); }
      }
      const output = []; let start = 0;
      for (const event of [...events.values()].sort((a, b) => a.boundary - b.boundary || a.order - b.order)) {
        if (!event.split || event.boundary <= start) continue;
        let veto = !paragraphs.has(event.boundary) && noBreaks.has(event.boundary);
        for (let at = event.boundary - 1; !paragraphs.has(event.boundary) && !veto && at >= start && /^\s$/u.test(text[at]); at--) veto = noBreaks.has(at);
        if (veto) continue;
        output.push({ text: text.slice(start, event.boundary), start, end: event.boundary }); start = event.boundary;
      }
      if (start < text.length) output.push({ text: text.slice(start), start, end: text.length });
      return output;
    }
  }

  async function fetchBytes(path) {
    const stored = await globalThis.LletriumLanguagePacks?.readResource(`${BASE}${path}`);
    if (!stored) throw new Error(`Italian resource ${path} is missing from the installed it-IT language pack.`);
    let bytes = stored instanceof Uint8Array ? stored : new Uint8Array(stored);
    if (path.endsWith(".gz")) {
      if (typeof DecompressionStream !== "function") throw new Error("This runtime cannot read the compact Italian resources.");
      bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());
    }
    return bytes;
  }

  async function fetchJson(path) { return decoder.decode(await fetchBytes(path)); }

  class ItalianSynthesizer {
    constructor(dictionary, tags, runtime) {
      this.dictionary = dictionary;
      this.tags = tags;
      this.runtime = runtime;
      this.cache = new Map();
    }

    synthesize(lemmaValue, tagValue, options = {}) {
      let lemma = String(lemmaValue?.lemma ?? lemmaValue?.text ?? lemmaValue ?? "").normalize("NFC");
      const tag = String(tagValue ?? "");
      if (!lemma || !tag) return [];
      let tail = "";
      if (tag.startsWith("V") && lemma.includes(" ")) {
        const split = lemma.indexOf(" ");
        tail = lemma.slice(split);
        lemma = lemma.slice(0, split);
      }
      const cacheKey = `${lemma}\u0000${tag}\u0000${Boolean(options.regexp)}`;
      if (this.cache.has(cacheKey)) return [...this.cache.get(cacheKey)];
      let tags;
      if (options.regexp) {
        const expression = this.runtime.expression(tag, true, false, true);
        tags = this.tags.filter(value => { expression.lastIndex = 0; return expression.test(value); });
      } else tags = [tag];
      const forms = [], seen = new Set();
      for (const candidateTag of tags) {
        for (const reading of this.dictionary.lookup(`${lemma}|${candidateTag}`)) {
          const form = `${reading.lemma}${tail}`;
          if (!seen.has(form)) { seen.add(form); forms.push(form); }
        }
      }
      this.cache.set(cacheKey, forms);
      if (this.cache.size > 10000) this.cache.clear();
      return [...forms];
    }
  }

  // Port of LanguageTool WordRepeatRule plus ItalianWordRepeatRule.ignore().
  // Keep this language-specific exception list on top of one reusable detector.
  function findItalianRepeatedWordIssues(rows = []) {
    const ignoredPairs = new Set(["così", "passo", "piano", "via", "Phi", "Li", "Xiao", "Duran", "Wagga", "Abdullah", "Nwe", "Pago", "Cao"]);
    const issues = [];
    let previous = null;
    for (const row of rows) {
      const token = String(row.token ?? "");
      const emoji = /^(?=.*\p{Extended_Pictographic})[\p{Extended_Pictographic}\p{Emoji_Modifier}\uFE0F\u200D]+$/u.test(token);
      const word = token.length > 0 && !emoji && !/^\p{N}+$/u.test(token)
        && (token.length !== 1 || /^\p{L}$/u.test(token));
      if (!word) { previous = null; continue; }
      if (previous && previous.token.toLocaleLowerCase("it") === token.toLocaleLowerCase("it")
          && !(previous.token === token && ignoredPairs.has(token))) {
        issues.push({
          id: `ITALIAN_WORD_REPEAT_RULE:${previous.start}:${row.end}`,
          ruleId: "ITALIAN_WORD_REPEAT_RULE",
          category: "style",
          severity: "warning",
          message: "Possibile errore di battitura: parola ripetuta",
          shortMessage: "Ripetizione",
          text: token,
          start: previous.start,
          end: row.end,
          replacementStart: previous.start,
          replacementEnd: row.end,
          suggestions: [previous.token],
          language: "it-IT"
        });
      }
      previous = row;
    }
    return issues;
  }

  // Local adapters for the shared Java rules registered by Italian.java.
  // These keep offsets in JavaScript UTF-16 units, like LT's RuleMatch offsets.
  function structuralIssue(ruleId, text, start, end, message, suggestions, category = "typography") {
    return {
      id: `${ruleId}:${start}:${end}`, ruleId, category, severity: "warning", message,
      text: text.slice(start, end), start, end, replacementStart: start,
      replacementEnd: end, suggestions
    };
  }

  function findItalianStructuralIssues(text, sentenceTokenizer) {
    const issues = [];
    const add = (...args) => issues.push(structuralIssue(...args));

    // WhitespaceBeforePunctuationRule: the Italian profile flags a space
    // before ':' and ';', and before '%' when preceded by a number. LT has a
    // specific exemption for spaced numeric labels such as " : 0".
    for (const match of text.matchAll(/[\p{Zs}\u00a0]+(?=[:;%])/gu)) {
      const whitespaceStart = match.index;
      const punctuationAt = whitespaceStart + match[0].length;
      const punctuation = text[punctuationAt];
      if (punctuation === "%") {
        if (!/\p{N}/u.test(text.slice(0, whitespaceStart).slice(-1))) continue;
      } else if (punctuation === ":" && /^\s+\p{N}/u.test(text.slice(punctuationAt + 1))) continue;
      const end = punctuationAt + 1;
      add("WHITESPACE_PUNCTUATION", text, whitespaceStart, end,
        punctuation === ":" ? "Non inserire uno spazio prima dei due punti." : punctuation === ";"
          ? "Non inserire uno spazio prima del punto e virgola." : "Non inserire uno spazio prima del simbolo percentuale.",
        [punctuation]);
    }

    // CommaWhitespaceRule: mirror its punctuation/parenthesis branches, using
    // local character context where LT uses analyzed tokens. In particular,
    // "(word" is valid: it flags whitespace after '(' rather than its absence.
    // Decimal numbers and the upstream [ ] checkbox idiom are left alone.
    const isQuote = value => value.length === 1 && (value === String.fromCharCode(34) || value === String.fromCharCode(39) || /[\p{Pi}\p{Pf}«»„]/u.test(value));
    const isDigit = value => /\p{N}/u.test(value || "");
    for (const match of text.matchAll(/[\p{Zs}\u00a0]+[,.)]/gu)) {
      const start = match.index, end = start + match[0].length;
      const punctuation = text[end - 1], previous = text[start - 1] || "";
      if (punctuation === ",") {
        const after = text.slice(end).match(/^\s*([^\s]*)/u)?.[1] || "";
        if ((isDigit(previous) && isDigit(after[0] || "")) || previous === ",") continue;
        add("COMMA_PARENTHESIS_WHITESPACE", text, start, end,
          "Non inserire uno spazio prima della virgola.", [punctuation]);
      } else if (punctuation === ")") {
        add("COMMA_PARENTHESIS_WHITESPACE", text, start, end,
          "Non inserire uno spazio prima della parentesi di chiusura.", [punctuation]);
      } else {
        const tail = text.slice(end);
        const nextToken = tail.match(/^([^\s]*)/u)?.[1] || "";
        const isDomainOrExtension = /^(?:com|org|net|int|edu|gov|mil|[a-z]{2})\b/iu.test(nextToken)
          || /^(?:[a-z]{3,4}|ai|mp[34])(?:-.+)?$/iu.test(nextToken);
        const isNumberOrEllipsis = /^[\p{N}.]/u.test(nextToken);
        const isCommand = /^\/[a-z]+/iu.test(tail);
        if (!isDomainOrExtension && !isNumberOrEllipsis && !isCommand) {
          add("COMMA_PARENTHESIS_WHITESPACE", text, start, end,
            "Non inserire uno spazio prima del punto.", [punctuation]);
        }
      }
    }
    for (const match of text.matchAll(/\([\p{Zs}\u00a0]+/gu)) {
      const start = match.index + 1, end = start + match[0].length - 1;
      add("COMMA_PARENTHESIS_WHITESPACE", text, start, end,
        "Non inserire uno spazio dopo la parentesi di apertura.", [""]);
    }
    for (const match of text.matchAll(/,(\S)/gu)) {
      const next = match[1], start = match.index, end = start + match[0].length;
      const previousToken = text.slice(0, start).match(/\S+$/u)?.[0] || "";
      const nextToken = text.slice(start + 1).match(/^\S+/u)?.[0] || next;
      if (isQuote(next) || next === "-" || next === "," || /\p{N}/u.test(previousToken + nextToken)) continue;
      add("COMMA_PARENTHESIS_WHITESPACE", text, start, end,
        "Inserisci uno spazio dopo la virgola.", [", " + next]);
    }
    // The default Java constructor enables quote checks: when a quote is
    // isolated by whitespace on both sides, offer either side as a correction.
    for (const match of text.matchAll(/[\p{Zs}\u00a0]+(["'’”“«»„])[\p{Zs}\u00a0]+/gu)) {
      const start = match.index, end = start + match[0].length;
      const replacement = text.slice(start, end).trim();
      add("COMMA_PARENTHESIS_WHITESPACE", text, start, end,
        "Controlla gli spazi intorno alle virgolette.", [replacement + " ", " " + replacement]);
    }

    // DoublePunctuationRule, matching LT's two-dot/two-comma scope and its
    // ellipsis, path, and preceding ?/!/ellipsis exclusions.
    for (const match of text.matchAll(/(?<![?!…\.])\.{2}(?![.…/\\])|,{2}(?!,)/gu)) {
      const token = match[0], start = match.index;
      const isDots = token[0] === ".";
      add("DOUBLE_PUNCTUATION", text, start, start + 2,
        isDots ? "Due punti consecutivi." : "Due virgole consecutive.", isDots ? [".", "…"] : [","] , "punctuation");
    }

    // MultipleWhitespaceRule: collapse repeated horizontal whitespace but
    // leave line breaks, tabs, and invisible joiners untouched as upstream does.
    for (const match of text.matchAll(/[\p{Zs}\u00a0]{2,}/gu)) {
      const raw = match[0];
      if (/[\u200b\u200c\u200d\u2060\ufeff]/u.test(raw)) continue;
      add("WHITESPACE_RULE", text, match.index, match.index + raw.length,
        "Possibile errore: hai ripetuto uno spazio.", [String.fromCodePoint(raw.codePointAt(0))]);
    }

    // GenericUnpairedBracketsRule configured by Italian.java: [], (), {}, and
    // the paired Italian guillemets « ». Keep this conservative and exempt the
    // conventional single-character list markers "a)" / "1)".
    const opens = new Map([["[", "]"], ["(", ")"], ["{", "}"], ["«", "»"]]);
    const closes = new Map([...opens].map(([open, close]) => [close, open]));
    const stack = [];
    const rows = [...text.matchAll(/[()[\]{}«»]/gu)];
    for (const match of rows) {
      const token = match[0], start = match.index, end = start + token.length;
      if (opens.has(token)) { stack.push({ token, start, end }); continue; }
      const expected = closes.get(token);
      const top = stack.at(-1);
      if (top?.token === expected) { stack.pop(); continue; }
      const before = text.slice(0, start).match(/(?:^|\s)(?:[\p{L}\p{N}])[ \t]*$/u);
      if (token === ")" && before) continue;
      add("UNPAIRED_BRACKETS", text, start, end, `Simbolo senza coppia: sembra mancare «${expected}».`, [], "punctuation");
    }
    for (const item of stack) {
      const missing = opens.get(item.token);
      add("UNPAIRED_BRACKETS", text, item.start, item.end, `Simbolo senza coppia: sembra mancare «${missing}».`, [], "punctuation");
    }

    // UppercaseSentenceStartRule: check the first lexical token of each SRX
    // sentence, skipping quotations and list markers. Retain LT's published
    // exceptions and avoid treating mixed-case brands/acronyms as errors.
    const exceptions = new Set(["n", "w", "x86", "ⓒ", "ø", "cc", "pH", "heylogin"]);
    const segments = sentenceTokenizer.segment(text);
    const onlySingleWord = segments.length === 1 && !/[.!?…]/u.test(text) && !/\s+\p{L}/u.test(text.trim());
    if (!onlySingleWord) {
      for (const segment of segments) {
        const body = segment.text;
        const listPrefix = body.match(/^\s*(?:(?:[-*•▪])|(?:\d+[.)])|(?:[\p{L}][.)]))\s+/u);
        if (listPrefix) continue;
        const token = body.match(/^\s*[\p{Ps}"'“”‘’„«»¿¡]*([\p{L}][\p{L}\p{M}'’\-]*)/u);
        if (!token) continue;
        const word = token[1], start = segment.start + token.index + token[0].lastIndexOf(word);
        const letters = [...word].filter(char => /\p{L}/u.test(char));
        if (!letters.length || exceptions.has(word) || /\p{N}/u.test(word)) continue;
        if (letters.some(char => char !== char.toLocaleLowerCase("it"))) continue;
        const replacement = word[0].toLocaleUpperCase("it") + word.slice(1);
        add("UPPERCASE_SENTENCE_START", text, start, start + word.length,
          "La frase dovrebbe iniziare con una lettera maiuscola.", [replacement], "typography");
      }
    }

    return issues;
  }

  class ItalianPatternPipeline {
    constructor({ morphology, synthesizer, speller, tokenizer, sentenceTokenizer, tags, rules, disambiguation, spellingSet, ignoredSet, runtime }) {
      this.morphology = morphology;
      this.synthesizer = synthesizer;
      this.speller = speller;
      this.tokenizer = tokenizer;
      this.sentenceTokenizer = sentenceTokenizer;
      this.tags = tags;
      this.rules = rules;
      this.disambiguation = disambiguation;
      this.spellingSet = spellingSet;
      this.ignoredSet = ignoredSet;
      this.runtime = runtime;
      this.checkCount = 0;
    }

    static async load() {
      if (!globalThis.LletriumLanguagePacks?.readResource) throw new Error("The language-pack storage runtime is unavailable.");
      const Reader = globalThis.CorrectorCatalanCfsa2Dictionary;
      const Runtime = globalThis.CorrectorLtPatternRuntime;
      if (!Reader || !Runtime) throw new Error("The shared CFSA2 reader or LanguageTool pattern runtime is unavailable.");
      const [posBytes, tagsText, rulesText, disambiguationText, srx, spellingBytes, spellingInfoText, synthesisBytes, synthesisInfoText, spellingWordsText, ignoredWordsText] = await Promise.all([
        fetchBytes(FILES.pos),
        fetchJson(FILES.tags), fetchJson(FILES.rules), fetchJson(FILES.disambiguation),
        fetchJson(FILES.srx), fetchBytes(FILES.spelling), fetchJson(FILES.spellingInfo),
        fetchBytes(FILES.synthesis), fetchJson(FILES.synthesisInfo),
        fetchJson(FILES.spellingWords), fetchJson(FILES.ignoredWords)
      ]);
      const morphology = new Reader(posBytes, { separator: "_", encoding: "iso-8859-15", encoderType: "SUFFIX" });
      const spellingInfo = parseInfo(spellingInfoText);
      if (spellingInfo["fsa.dict.separator"] !== "+" || spellingInfo["fsa.dict.encoding"] !== "ISO-8859-15" || spellingInfo["fsa.dict.encoder"] !== "SUFFIX") throw new Error("Italian Morfologik spelling metadata is incompatible.");
      const synthesisInfo = parseInfo(synthesisInfoText);
      if (synthesisInfo["fsa.dict.separator"] !== "_" || synthesisInfo["fsa.dict.encoding"] !== "utf-8" || synthesisInfo["fsa.dict.encoder"] !== "SUFFIX") throw new Error("Italian Morfologik synthesis metadata is incompatible.");
      const synthesizerDictionary = new Reader(synthesisBytes.buffer.slice(synthesisBytes.byteOffset, synthesisBytes.byteOffset + synthesisBytes.byteLength), {
        separator: "_", encoding: "utf-8", encoderType: "SUFFIX"
      });
      const speller = new globalThis.CorrectorEnglishSpeller(spellingBytes.buffer.slice(spellingBytes.byteOffset, spellingBytes.byteOffset + spellingBytes.byteLength), {
        schema: 1, format: "CFSA2", profile: "LanguageTool 6.9-SNAPSHOT / Italian Hunspell it_IT", locale: "it",
        separator: "+".codePointAt(0), encoding: "ISO-8859-15", sequenceEncoder: "SUFFIX", frequencyIncluded: false,
        replacementPairs: {}, equivalentChars: {}, spellerFlags: { ignorePunctuation: false, ignoreNumbers: false, ignoreCamelCase: false, ignoreAllUppercase: false, ignoreDiacritics: false, convertCase: true, supportRunOnWords: true }
      });
      const spellingSet = new Set(spellingWordsText.split(/\r?\n/u).map(word => word.trim().toLocaleLowerCase("it")).filter(Boolean));
      const ignoredSet = new Set(ignoredWordsText.split(/\r?\n/u).map(word => word.trim().toLocaleLowerCase("it")).filter(Boolean));
      const tags = tagsText.split(/\r?\n/u).filter(Boolean);
      const rules = JSON.parse(rulesText).map(rule => ({ ...rule, ruleIdPrefix: "IT_LT_XML_" }));
      const disambiguation = JSON.parse(disambiguationText);
      if (!Array.isArray(rules) || rules.length !== 86) throw new Error("Italian rule inventory is incomplete.");
      if (disambiguation.language !== "it-IT" || disambiguation.rules?.length !== 3) throw new Error("Italian disambiguation bundle is incompatible.");
      // ISO-8859-15 cannot encode every character a page may contain (emoji,
      // mathematical symbols, newer Unicode punctuation). Such tokens are
      // simply unknown to this dictionary; they must not abort a whole review.
      const safeLookup = token => {
        try { return morphology.lookup(token); }
        catch (error) {
          if (/not representable|no representable|caràcter no representable/iu.test(String(error?.message))) return [];
          throw error;
        }
      };
      const runtime = new Runtime({ dictionary: { lookup: safeLookup, synthesize: (lemma, tag, options) => synthesizer.synthesize(lemma, tag, options) }, locale: "it", contextRules: disambiguation.rules });
      const synthesizer = new ItalianSynthesizer(synthesizerDictionary, tags, runtime);
      const tokenizer = new ItalianWordTokenizer();
      const sentenceTokenizer = new ItalianSentenceTokenizer(JSON.parse(srx), runtime);
      runtime.filterResources = { ...(runtime.filterResources || {}), tokenizer: { externalTokenRows: true, tokenize: text => tokenizer.tokenize(text) }, sentenceTokenizer };
      for (const rule of rules) runtime.validate(rule);
      return new ItalianPatternPipeline({ morphology, synthesizer, speller, tokenizer, sentenceTokenizer, tags, rules, disambiguation, spellingSet, ignoredSet, runtime });
    }

    tokenizeRows(text) { return this.tokenizer.tokenizeRows(String(text), this.morphology); }

    spellingSuggestions(word, limit = 8) {
      const value = String(word), letters = [...value].filter(char => /\p{L}/u.test(char));
      const allUpper = letters.length > 0 && letters.every(char => char === char.toLocaleUpperCase("it"));
      if (allUpper) return [];
      // Italian Hunspell must prioritize exact dictionary forms recovered by
      // adding an omitted stress accent (e.g. citta -> città). The generic FSA
      // fuzzy walk can miss these because the compact suffix graph does not
      // expose every accented path as a simple character transition.
      const lower = value.toLocaleLowerCase("it"), accentOptions = { a: ["à"], e: ["è", "é"], i: ["ì"], o: ["ò"], u: ["ù"] };
      const accentCandidates = [];
      for (let index = 0; index < lower.length; index++) {
        for (const accented of accentOptions[lower[index]] || []) {
          const candidate = lower.slice(0, index) + accented + lower.slice(index + 1);
          if (!this.speller.exact(candidate)) continue;
          const cased = /^\p{Lu}/u.test(value) ? candidate[0].toLocaleUpperCase("it") + candidate.slice(1) : candidate;
          if (cased !== value && !accentCandidates.includes(cased)) accentCandidates.push(cased);
        }
      }

      const orderCaseVariants = candidates => {
        const lowercase = new Set(candidates.filter(candidate => candidate === candidate.toLocaleLowerCase("it")));
        return candidates.filter(candidate => !(candidate !== candidate.toLocaleLowerCase("it") &&
          !/^\p{Lu}/u.test(value) && lowercase.has(candidate.toLocaleLowerCase("it"))));
      };
      // Traverse the compact FSA with an incremental edit-distance row. The
      // shared English helper's byte-oriented fuzzy walk was incomplete for
      // ISO-8859-15 dictionaries (it missed common Italian insertions such as
      // "acqua" for "acua"). This keeps the upstream FSA and avoids expanding
      // the dictionary into a large runtime word list.
      const fuzzy = maxDistance => {
        const source = [...value.normalize("NFC").toLocaleLowerCase("it")], found = new Map();
        const initial = Int16Array.from({ length: source.length + 1 }, (_, index) => index);
        const visit = (node, prefix, previousRow, beforePreviousRow, previousChar) => {
          if (prefix.length > source.length + maxDistance || node < 0) return;
          for (const arc of this.speller.characterTransitions(node)) {
            // Morfologik's speller searches case-insensitively and converts
            // the selected result back to the input's casing. Compare the
            // compact FSA in lowercase while retaining its original spelling
            // for the returned replacement.
            const candidateChar = arc.char.toLocaleLowerCase("it"), row = new Int16Array(source.length + 1);
            row[0] = previousRow[0] + 1;
            let minimum = row[0];
            for (let index = 1; index <= source.length; index++) {
              const substitution = previousRow[index - 1] + (source[index - 1] === candidateChar ? 0 : 1);
              row[index] = Math.min(previousRow[index] + 1, row[index - 1] + 1, substitution);
              if (beforePreviousRow && index > 1 && candidateChar === source[index - 2] && previousChar === source[index - 1]) {
                row[index] = Math.min(row[index], beforePreviousRow[index - 2] + 1);
              }
              if (row[index] < minimum) minimum = row[index];
            }
            const nextPrefix = prefix + arc.char;
            if (arc.final && row[source.length] > 0 && row[source.length] <= maxDistance) {
              const prior = found.get(nextPrefix);
              if (prior == null || row[source.length] < prior) found.set(nextPrefix, row[source.length]);
            }
            if (!arc.terminal && arc.target >= 0 && minimum <= maxDistance) {
              visit(arc.target, nextPrefix, row, previousRow, candidateChar);
            }
          }
        };
        visit(this.speller.root, "", initial, null, "");
        return [...found].map(([candidate, distance]) => ({ candidate, distance }))
          .sort((a, b) => a.distance - b.distance || (a.candidate < b.candidate ? -1 : a.candidate > b.candidate ? 1 : 0))
          .map(item => item.candidate);
      };
      let suggestions = [...accentCandidates, ...orderCaseVariants(fuzzy(1))];
      // Match LanguageTool's speller1 -> speller2 -> speller3 fallback: broaden
      // the edit distance only when the closer search yields no useful result.
      if (!suggestions.length && value.length >= 3) suggestions = orderCaseVariants(fuzzy(2));
      if (!suggestions.length && value.length >= 5) suggestions = orderCaseVariants(fuzzy(3));
      return suggestions.slice(0, limit);
    }

    analyzeText(text, options = {}) {
      if (typeof text !== "string") throw new TypeError("Italian review input must be a string.");
      const rows = this.tokenizeRows(text);
      const issues = [...this.runtime.run(text, rows, this.rules).map(issue => ({
        ...issue,
        language: "it-IT",
        category: issue.meta?.qualityCategory === "style" ? "style" : issue.category || "grammar",
        severity: issue.severity || "warning"
      })), ...findItalianRepeatedWordIssues(rows), ...findItalianStructuralIssues(text, this.sentenceTokenizer)];
      if (options.skipSpelling !== true) {
        const personal = new Set((options.personalWords || []).map(word => String(word).trim().toLocaleLowerCase("it")));
        for (const row of rows) {
          const word = row.token;
          const letters = [...word].filter(char => /\p{L}/u.test(char));
          const allUpper = letters.length > 0 && letters.every(char => char === char.toLocaleUpperCase("it"));
          if (!/\p{L}/u.test(word) || allUpper || personal.has(word.toLocaleLowerCase("it")) || this.ignoredSet.has(word.toLocaleLowerCase("it"))) continue;
          if (this.spellingSet.has(word.toLocaleLowerCase("it")) || !this.speller.isMisspelled(word)) continue;
          if (issues.some(issue => issue.start < row.end && issue.end > row.start)) continue;
          issues.push({ id: `IT_SPELLING:${row.start}:${row.end}`, ruleId: "IT_SPELLING", category: "spelling", severity: "warning",
            message: "Possibile errore ortografico.", shortMessage: "Ortografia", text: word, start: row.start, end: row.end,
            replacementStart: row.start, replacementEnd: row.end, suggestions: this.spellingSuggestions(word, 8) });
        }
      }
      if (options.skipSpelling === true) {
        this.checkCount++;
        return { profile: "it-IT", textLengthUtf16: text.length, issues, stats: this.getDiagnostics() };
      }
      this.checkCount++;
      return { profile: "it-IT", textLengthUtf16: text.length, issues, stats: this.getDiagnostics() };
    }

    getDiagnostics() {
      return { status: "proof-only-incomplete", profile: "it-IT", rulesLoaded: this.rules.length,
        disambiguationRulesLoaded: this.disambiguation.rules.length, spelling: "Morfologik-CFSA2-ISO-8859-15", tokenizer: "LanguageTool-WordTokenizer", sentenceRules: this.sentenceTokenizer.ruleCount, checks: this.checkCount,
        synthesis: "Morfologik-CFSA2-UTF-8", runtimeErrors: this.runtime.diagnostics.slice(-50), morphology: this.morphology.getStats?.() || null };
    }
  }

  globalThis.CorrectorItalianPatternPipeline = Object.freeze({ ItalianPatternPipeline, findItalianRepeatedWordIssues });
})();
