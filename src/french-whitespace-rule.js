/* French punctuation spacing adapter based on LanguageTool's FRENCH_WHITESPACE.
 * Proof ZIP only; the strict picky variant is intentionally not activated.
 */
(() => {
  "use strict";

  const NBSP = "\u00a0";
  const NNBSP = "\u202f";
  const URL_SCHEMES = /^(?:file|s?ftp|finger|git|gopher|hdl|https?|shttp|imap|mailto|mms|nntp|s?news(?:post|reply)?|prospero|rsync|rtspu|sips?|svn|svn\+ssh|telnet|wais)$/iu;

  function checkFrenchWhitespace(text, rows) {
    const issues = [];
    // Text-level counterpart of LanguageTool's shared MultipleWhitespaceRule.
    // Zs excludes tabs and line breaks; preserving the first code point also
    // keeps a user's NBSP/NNBSP choice when collapsing a run.
    for (const match of text.matchAll(/\p{Zs}{2,}/gu)) {
      const start = match.index;
      const whitespace = [...match[0]][0];
      issues.push({
        ruleId: "WHITESPACE_RULE",
        category: "typography",
        start,
        end: start + match[0].length,
        replacementStart: start,
        replacementEnd: start + match[0].length,
        text: match[0],
        message: "Une espace surnuméraire s'est glissée dans le texte.",
        shortMessage: "Espaces répétés",
        suggestions: [whitespace],
        meta: { qualityCategory: "style" }
      });
    }
    // Conservative counterpart of LanguageTool Core's SENTENCE_WHITESPACE:
    // catch a sentence boundary written as `Terminé.Suivant` when SRX cannot
    // expose it as two separate sentences. Requiring an uppercase next word
    // and excluding one-letter initials avoids the common French `M.Durand`
    // shape; digits/decimal tokens and line breaks are naturally excluded.
    for (let i = 1; i + 1 < rows.length; i++) {
      if (![".", "!", "?"].includes(rows[i].token)) continue;
      // Only report once at the end of a `?!` / `...` punctuation run.
      if ([".", "!", "?"].includes(rows[i + 1].token)) continue;
      let previousIndex = i - 1;
      while (previousIndex > 0 && [".", "!", "?"].includes(rows[previousIndex].token)) previousIndex--;
      const previous = rows[previousIndex];
      if (!/[\p{L}\p{N}]$/u.test(previous.token)) continue;
      const punctuation = rows[i];
      const next = rows[i + 1];
      if (text.slice(punctuation.end, next.start) !== "") continue;
      if (!/^\p{Lu}[\p{L}\p{M}'’\-]*$/u.test(next.token)) continue;
      if (/^\p{Lu}$/u.test(previous.token)) continue;
      const context = text.slice(Math.max(0, previous.start - 24), next.end);
      if (/(?:https?|ftp):\/\/|\bwww\./iu.test(context)) continue;
      issues.push({
        ruleId: "SENTENCE_WHITESPACE",
        category: "typography",
        start: next.start,
        end: next.end,
        replacementStart: next.start,
        replacementEnd: next.end,
        text: next.token,
        message: "Ajoutez une espace entre les phrases.",
        shortMessage: "Espace manquante",
        suggestions: [` ${next.token}`],
        meta: { qualityCategory: "style" }
      });
    }
    const compactCsv = /(?:[^;\s]+;){2,}[^;\s]+/u;
    const macAddress = /(?<![\p{L}\d])(?:[a-f\d]{2}:){5}[a-f\d]{2}(?![\p{L}\d])/iu;
    for (let i = 1; i < rows.length; i++) {
      const previous = rows[i - 1];
      const current = rows[i];
      const next = rows[i + 1];
      const gap = text.slice(previous.end, current.start);
      // The default LanguageTool rule accepts ordinary whitespace. The strict
      // NBSP-only variant is a separate picky rule and remains off by default.
      if (/\s/u.test(gap)) continue;
      if (["?", "!"].includes(current.token)
          && (["?", "!"].includes(previous.token) || ["?", "!"].includes(next?.token))) continue;
      if (current.token === ":" && (next?.token === ")" || next?.token === "-" && rows[i + 2]?.token === ")")) continue;
      if (current.token === ":" && /^\d{1,2}$/u.test(previous.token) && /^\d{1,2}$/u.test(next?.token || "")) continue;
      if (current.token === ":" && macAddress.test(text.slice(Math.max(0, previous.start - 24), Math.min(text.length, (next?.end || current.end) + 24)))) continue;
      if (current.token === ";" && compactCsv.test(text.slice(Math.max(0, previous.start - 20), Math.min(text.length, (next?.end || current.end) + 20)))) continue;

      let requiredSpace = null;
      if (current.token === "?" && previous.token !== "!") requiredSpace = NNBSP;
      else if (current.token === "!" && previous.token !== "?") requiredSpace = NNBSP;
      else if (current.token === ";") requiredSpace = NNBSP;
      else if (current.token === ":" && !URL_SCHEMES.test(previous.token)) requiredSpace = NBSP;

      if (requiredSpace) {
        issues.push({
          ruleId: "FRENCH_WHITESPACE",
          category: "typography",
          start: previous.start,
          end: current.end,
          replacementStart: previous.start,
          replacementEnd: current.end,
          text: text.slice(previous.start, current.end),
          message: current.token === ":"
            ? "Les deux-points sont précédés d'une espace insécable."
            : "Ce signe de ponctuation est précédé d'une espace fine insécable.",
          shortMessage: "Espace insécable",
          suggestions: [`${previous.token}${requiredSpace}${current.token}`],
          meta: { qualityCategory: "style" }
        });
      }

      if (current.token === "»" && previous.token !== "«") {
        // Handle the no-space opening and closing pair as one correction,
        // matching LT's paired-guillemet replacement behavior.
        const opening = rows[i - 2];
        if (opening?.token === "«" && !/\s/u.test(text.slice(opening.end, previous.start))) {
          issues.push({
            ruleId: "FRENCH_WHITESPACE",
            category: "typography",
            start: opening.start,
            end: current.end,
            replacementStart: opening.start,
            replacementEnd: current.end,
            text: text.slice(opening.start, current.end),
            message: "Les guillemets sont toujours accompagnés d'une espace insécable.",
            shortMessage: "Espace insécable",
            suggestions: [`«${NBSP}${text.slice(opening.end, previous.end)}${NBSP}»`],
            meta: { qualityCategory: "style" }
          });
        } else {
          issues.push({
            ruleId: "FRENCH_WHITESPACE",
            category: "typography",
            start: previous.start,
            end: current.end,
            replacementStart: previous.start,
            replacementEnd: current.end,
            text: text.slice(previous.start, current.end),
            message: "Le guillemet fermant est précédé d'une espace insécable.",
            shortMessage: "Espace insécable",
            suggestions: [`${previous.token}${NBSP}»`],
            meta: { qualityCategory: "style" }
          });
        }
      }

      if (previous.token === "«" && current.token !== "»") {
        if (next?.token === "»" && !/\s/u.test(text.slice(current.end, next.start))) continue;
        issues.push({
          ruleId: "FRENCH_WHITESPACE",
          category: "typography",
          start: previous.start,
          end: current.end,
          replacementStart: previous.start,
          replacementEnd: current.end,
          text: text.slice(previous.start, current.end),
          message: "Le guillemet ouvrant est suivi d'une espace insécable.",
          shortMessage: "Espace insécable",
          suggestions: [`«${NBSP}${current.token}`],
          meta: { qualityCategory: "style" }
        });
      }
    }
    return issues;
  }

  globalThis.CorrectorFrenchWhitespaceRule = Object.freeze({ checkFrenchWhitespace });
})();
