/* Local, text-only en-US port of LanguageTool's WrongWordInContextRule. */
(() => {
  "use strict";
  const SOURCE_SHA256 = "784ac0287d6a31cb142cb6c12de25b700099c3b4ecc02be4231ef0e278b5e87d";
  const compile = expression => {
    const insensitive = expression.startsWith("(?i)");
    const source = insensitive ? expression.slice(4) : expression.startsWith("(?-i)") ? expression.slice(5) : expression;
    return new RegExp(`\\b(?:${source})\\b`, insensitive ? "iu" : "u");
  };
  const preserveCase = (replacement, model) => {
    if (/^\p{Lu}[\p{L}\p{M}]*$/u.test(model)) return replacement.toLocaleUpperCase("en-US");
    if (/^\p{Lu}[\p{Ll}\p{M}]+$/u.test(model)) return [...replacement].map((char, index) => index === 0 ? char.toLocaleUpperCase("en-US") : char).join("");
    return replacement;
  };
  const toId = value => value.toLocaleUpperCase("en-US").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/gu, "");

  function createIndex(data) {
    if (data?.schemaVersion !== 1 || data.profile !== "en-US" || data.sourceSha256 !== SOURCE_SHA256 || data.entryCount !== 11 || data.entries?.length !== 11) throw new Error("The en-US wrong-word context resource differs from its pinned LanguageTool source.");
    const entries = data.entries.map(row => ({ ...row,
      words: [compile(row.word1), compile(row.word2)],
      contexts: [compile(row.context1), compile(row.context2)]
    }));
    return Object.freeze({ entries, sourceSha256: SOURCE_SHA256 });
  }

  function check(sentences, data) {
    if (!data?.entries) throw new Error("The en-US wrong-word context inventory is not loaded.");
    const issues = [];
    for (const sentence of sentences || []) {
      const tokens = (sentence.tokens || []).filter(token => token.kind !== "space" && !token.isUrl && !token.ignoredBySpeller);
      for (const row of data.entries) {
        const found = [-1, -1], matched = ["", ""];
        for (let i = 0; i < tokens.length && (found[0] < 0 || found[1] < 0); i++) {
          const value = String(tokens[i].text || "");
          for (let word = 0; word < 2; word++) if (found[word] < 0) {
            const match = row.words[word].exec(value);
            if (match) found[word] = i, matched[word] = value;
          }
        }
        if ((found[0] >= 0) === (found[1] >= 0)) continue;
        const foundWord = found[0] >= 0 ? 0 : 1, otherWord = 1 - foundWord;
        const foundContext = tokens.some(token => row.contexts[foundWord].test(String(token.text || "")));
        const otherContext = tokens.some(token => row.contexts[otherWord].test(String(token.text || "")));
        if (!otherContext || foundContext) continue;
        const token = tokens[found[foundWord]], original = matched[foundWord];
        const matchPart = foundWord === 0 ? row.match1 : row.match2;
        const replacePart = foundWord === 0 ? row.match2 : row.match1;
        const replacement = preserveCase(original.replace(new RegExp(matchPart, "iu"), replacePart), original);
        const explanationSuggestion = foundWord === 0 ? row.explanation2 : row.explanation1;
        const explanationWrong = foundWord === 0 ? row.explanation1 : row.explanation2;
        const longMessage = `Possibly confused word: Did you mean <suggestion>${replacement}</suggestion> (= ${explanationSuggestion}) instead of '${original}' (= ${explanationWrong})?`;
        const message = explanationSuggestion && explanationWrong ? longMessage
          : `Possibly confused word: Did you mean <suggestion>${replacement}</suggestion> instead of '${original}'?`;
        const ruleId = toId(`ENGLISH_WRONG_WORD_IN_CONTEXT_${original}_${replacement}`);
        issues.push({ id: `${ruleId}:${token.start}:${token.end}`, ruleId, category: "confused_words", severity: "warning",
          message, shortMessage: "Possibly confused word", text: original, start: token.start, end: token.end,
          replacementStart: token.start, replacementEnd: token.end, suggestions: [replacement] });
      }
    }
    return issues;
  }

  async function load({ url, fetcher = globalThis.fetch } = {}) {
    const resourceUrl = url || globalThis.chrome?.runtime?.getURL("build/resources/en-US/en-wrong-word-context.json");
    if (!resourceUrl) throw new Error("An en-US wrong-word context URL is required outside the extension.");
    const response = await fetcher(resourceUrl);
    if (!response.ok) throw new Error(`Could not load en-US wrong-word contexts (${response.status}).`);
    return createIndex(await response.json());
  }
  globalThis.CorrectorEnglishWrongWordContext = Object.freeze({ SOURCE_SHA256, check, createIndex, load });
})();
