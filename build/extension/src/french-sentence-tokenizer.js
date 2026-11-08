/* French SRX segmentation adapter based on the pinned LanguageTool segment.srx. */
(() => {
  'use strict';

  class FrenchSentenceTokenizer {
    constructor(resource, runtime) {
      if (resource?.schemaVersion !== 1 || resource.languageCode !== 'fr-FR'
          || resource.ruleCount !== 83 || !Array.isArray(resource.groups)) {
        throw new Error('French SRX resource schema or profile is unsupported.');
      }
      if (!runtime?.expression) throw new Error('French SRX requires the shared Java-compatible regex compiler.');
      this.sourceSha256 = resource.sourceSha256;
      this.groups = resource.groups.map(group => ({
        name: group.name,
        rules: group.rules.map((rule, index) => ({
          split: rule.break === 'yes',
          before: runtime.expression(rule.before, true, false, true),
          after: rule.after ? runtime.expression(rule.after, true, false) : null,
          source: `${group.name}[${index}]`
        }))
      }));
      this.ruleCount = this.groups.reduce((sum, group) => sum + group.rules.length, 0);
      if (this.ruleCount !== resource.ruleCount) throw new Error('French SRX rule count does not match its descriptor.');
    }

    segment(text) {
      if (typeof text !== 'string') throw new TypeError('Text to segment must be a string.');
      if (!text) return [];
      const rules = this.groups.flatMap(group => group.rules);
      const events = new Map();
      const noBreakBoundaries = new Set();
      for (let order = 0; order < rules.length; order++) {
        const rule = rules[order];
        rule.before.lastIndex = 0;
        let match;
        while ((match = rule.before.exec(text))) {
          const boundary = match.index + match[0].length;
          // ECMAScript global regexps do not advance after an empty match.
          // Advance before any early continue (notably when the SRX `after`
          // condition fails), or a valid empty-before rule can loop forever.
          if (!match[0].length) rule.before.lastIndex = Math.max(rule.before.lastIndex, match.index + 1);
          if (boundary <= 0 || boundary >= text.length) {
            continue;
          }
          if (rule.after) {
            const after = rule.after.exec(text.slice(boundary));
            if (!after || after.index !== 0) continue;
          }
          if (!rule.split) noBreakBoundaries.add(boundary);
          const previous = events.get(boundary);
          if (rule.split && (!previous || order < previous.order)) {
            events.set(boundary, { boundary, order, split: true, rule: rule.source });
          }
        }
      }

      // Match LanguageTool's default two-line-break paragraph mode. A blank
      // paragraph is an unconditional boundary even when a nearby no-break
      // rule also sees whitespace in the separator.
      const paragraphBoundaries = new Set();
      const paragraphSeparator = /(?:\r?\n[\t \f\v]*){2,}/gu;
      let paragraph;
      while ((paragraph = paragraphSeparator.exec(text))) {
        const boundary = paragraph.index + paragraph[0].length;
        if (boundary > 0 && boundary < text.length) {
          paragraphBoundaries.add(boundary);
          const previous = events.get(boundary);
          if (!previous || !previous.split) events.set(boundary, { boundary, order: -1, split: true, rule: 'paragraph-break' });
        }
        if (!paragraph[0].length) paragraphSeparator.lastIndex++;
      }

      const segments = [];
      let start = 0;
      for (const event of [...events.values()].sort((a, b) => a.boundary - b.boundary || a.order - b.order)) {
        if (!event.split || event.boundary <= start) continue;
        let veto = !paragraphBoundaries.has(event.boundary) && noBreakBoundaries.has(event.boundary);
        for (let boundary = event.boundary - 1; !paragraphBoundaries.has(event.boundary) && !veto
            && boundary >= start && /^\s$/u.test(text[boundary]); boundary--) {
          veto = noBreakBoundaries.has(boundary);
        }
        if (veto) continue;
        segments.push({ text: text.slice(start, event.boundary), start, end: event.boundary, boundaryRule: event.rule });
        start = event.boundary;
      }
      if (start < text.length) segments.push({ text: text.slice(start), start, end: text.length, boundaryRule: null });
      return segments;
    }

    static async load({ fetcher = globalThis.fetch?.bind(globalThis), runtime = globalThis.CorrectorLtPatternRuntime } = {}) {
      if (typeof fetcher !== 'function') throw new Error('A fetch implementation is required to load French SRX rules.');
      const url = globalThis.chrome?.runtime?.getURL('build/resources/fr/fr-srx.json');
      if (!url) throw new Error('French SRX is available only in the proof extension package.');
      const response = await fetcher(url);
      if (!response.ok) throw new Error(`French SRX resource is unavailable (${response.status}).`);
      return new FrenchSentenceTokenizer(await response.json(), runtime);
    }
  }

  globalThis.CorrectorFrenchSentenceTokenizer = FrenchSentenceTokenizer;
})();
