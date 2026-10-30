/* Local port of LanguageTool AbstractDashRule + EnglishDashRule. */
(() => {
  "use strict";
  const EXPECTED_HASH = "be0a491fba8bf0b8c8c4d5e4b5b3f8c6cc4bef6264c69dc3a5d918691fc1657d";
  class EnglishDashRule {
    constructor(data) {
      if (data?.schemaVersion !== 1 || data.profile !== "en-US" || data.sourceSha256 !== EXPECTED_HASH
          || !Array.isArray(data.compounds) || data.compounds.length !== data.count || data.count < 5000) {
        throw new Error("Pinned en-US dash-compound data is missing or incomplete.");
      }
      this.compounds = new Set(data.compounds);
    }
    check(text) {
      const issues = [];
      // This linear scan visits only dash-shaped word compounds. Dictionary lookup is O(1),
      // unlike testing thousands of source entries against every text position.
      const candidate = /[\p{L}\p{M}\p{N}]+(?: ?[–—] ?[\p{L}\p{M}\p{N}]+)+/gu;
      for (const match of text.matchAll(candidate)) {
        const value = match[0];
        const canonical = value.replace(/ ?[–—] ?/gu, "-").toLocaleLowerCase("en-US");
        if (!this.compounds.has(canonical)) continue;
        const start = match.index;
        const end = start + value.length;
        // AbstractDashRule rejects substrings inside a larger ASCII word.
        if ((start > 0 && /[A-Za-z]/u.test(text[start - 1])) || (end < text.length && /[A-Za-z]/u.test(text[end]))) continue;
        issues.push({ id: `EN_DASH_RULE:${start}:${end}`, ruleId: "EN_DASH_RULE", category: "typography",
          severity: "warning", message: "A dash was used instead of a hyphen.", text: value, start, end,
          replacementStart: start, replacementEnd: end,
          suggestions: [value.replace(/ ?[–—] ?/gu, "-")], _picky: true });
      }
      return issues;
    }
    static async load({ url, fetcher = globalThis.fetch } = {}) {
      const response = await fetcher(url);
      if (!response.ok) throw new Error(`English dash-rule resource fetch failed: ${response.status}`);
      return new EnglishDashRule(await response.json());
    }
  }
  globalThis.CorrectorEnglishDashRule = EnglishDashRule;
})();
