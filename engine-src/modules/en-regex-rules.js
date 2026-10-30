/* Local port of LanguageTool RegexPatternRule and RegexAntiPatternFilter. */
(() => {
  "use strict";
  function compile(source, caseSensitive = true) {
    // Java accepts quantified quantifiers; repeating a greedy star remains a star.
    source = source.replace(/([*+?])\{\d+(?:,\d*)?\}/gu, "$1")
      .replace(/\\w/gu, "[\\p{L}\\p{M}\\p{N}\\p{Pc}]").replace(/\\d/gu, "\\p{Nd}");
    const regex = globalThis.CorrectorJavaCaseRegex.compile(source, caseSensitive, true);
    return new RegExp(regex.source, `${regex.flags}d`);
  }
  function render(template, specs, match) {
    let index = 0;
    return template.replace(/\\([0-9])/gu, (_reference, group) => {
      const spec = specs[index++] || {};
      let value = match[Number(group)] || "";
      if (spec.regexReplace != null) {
        const regex = compile(spec.regexMatch, true);
        regex.lastIndex = 0;
        value = value.replace(new RegExp(regex.source, regex.flags.replace("g", "")), spec.regexReplace);
        if (spec.caseConversion === "STARTUPPER") value = value.charAt(0).toLocaleUpperCase("en-US") + value.slice(1);
        else if (spec.caseConversion === "ALLUPPER") value = value.toLocaleUpperCase("en-US");
        else if (spec.caseConversion === "ALLLOWER") value = value.toLocaleLowerCase("en-US");
      }
      return value;
    });
  }
  class EnglishRegexRules {
    constructor(resource) {
      if (resource?.schemaVersion !== 1 || resource.profile !== "en-US" || resource.rules?.length !== 11)
        throw new Error("The en-US compiled RegexPatternRule inventory is incomplete.");
      this.rules = resource.rules.map(rule => {
        if (rule.filterClass && rule.filterClass !== "org.languagetool.rules.patterns.RegexAntiPatternFilter")
          throw new Error(`Unsupported English regex filter: ${rule.filterClass}`);
        const antipatterns = rule.filterArguments?.replace(/^antipatterns:/u, "").split("|").map(value => compile(value));
        return { ...rule, regex: compile(rule.pattern, rule.caseSensitive), antipatterns };
      });
    }
    check(sentences, { checkLevel = "DEFAULT", ruleIds } = {}) {
      const issues = [];
      for (const sentence of sentences) {
        if (sentence.text.length > 2000) continue;
        for (const rule of this.rules) {
          if (rule.picky && checkLevel !== "PICKY" || ruleIds && !ruleIds.has(rule.id) && !ruleIds.has(rule.fullId)) continue;
          rule.regex.lastIndex = 0;
          for (const match of sentence.text.matchAll(rule.regex)) {
            const range = match.indices[rule.markGroup];
            if (!range || range[1] <= range[0]) continue;
            const [from, to] = range;
            if (rule.antipatterns?.some(regex => {
              regex.lastIndex = 0;
              return [...sentence.text.matchAll(regex)].some(anti => anti.index <= to && anti.index + anti[0].length >= to
                || anti.index <= from && anti.index + anti[0].length >= from);
            })) continue;
            const message = render(rule.message, rule.matches, match);
            const output = render(rule.suggestionsOutMsg, rule.matchesOutMsg, match);
            const suggestions = [...(message + output).matchAll(/<suggestion>(.*?)<\/suggestion>/gu)].map(value => value[1]);
            const start = sentence.start + from, end = sentence.start + to;
            issues.push({ id: `${rule.fullId}:${start}:${end}`, ruleId: rule.id,
            // RegexPatternRule creates RuleMatches with the upstream default Other.
            // Preserve it even for STYLE categories so the LT match type controls color.
            category: rule.category === "STYLE" ? "style" : "typography", severity: "Other",
              start, end, replacementStart: start, replacementEnd: end, text: sentence.text.slice(from, to),
              message: message.replace(/<\/?suggestion>/gu, ""), shortMessage: rule.shortMessage, suggestions,
              _languagePriority: rule.priority, _registrationOrder: rule.registrationOrder,
              _picky: rule.picky, _includedAllAtOnce: rule.includedAllAtOnce });
          }
        }
      }
      return issues;
    }
    static async load({ baseUrl, fetcher }) {
      const response = await fetcher(new URL("en-regex-rules.json", baseUrl));
      if (!response.ok) throw new Error(`Could not load English regex rules (${response.status}).`);
      return new EnglishRegexRules(await response.json());
    }
  }
  globalThis.CorrectorEnglishRegexRules = EnglishRegexRules;
})();
