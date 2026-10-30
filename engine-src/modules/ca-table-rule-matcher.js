/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* LanguageTool CompoundRule and SimpleReplaceBalearicRule table adapters.
 * These suggestions convert source forms to central Catalan. */
(() => {
  "use strict";
  let compounds = new Map(), replacements = new Map(), checkCaseForms = new Map(), checkCaseRegex = null, lexicalLookup = null, loadPromise;
  const simple = new Map(), anglicism = new Map();
  const verbs = new Map();
  const upperFirst = value => value.slice(0, 1).toLocaleUpperCase("ca") + value.slice(1);
  const lowerFirst = value => value.slice(0, 1).toLocaleLowerCase("ca") + value.slice(1);
  const allUpper = value => /\p{Lu}/u.test(value) && !/\p{Ll}/u.test(value);
  const normalizeCaseKey = value => value.replace(/\s+/gu, " ").replace(/[’‘]/gu, "'").toLocaleLowerCase("ca");
  const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const checkCasePattern = value => value.split(/(\s+)/u).map(part =>
    /^\s+$/u.test(part) ? "\\s+" : [...part].map(character => /[’']/u.test(character) ? "['’‘]" : escapeRegex(character)).join("")
  ).join("");
  const checkCaseRuleId = value => `CA_CHECKCASE_${value.toLocaleUpperCase("ca").trim().replaceAll(" ", "_").replaceAll("'", "_Q_").replace(/[^A-Z0-9\u00C0-\u00D6\u00D8-\u00DE]/gu, "_")}`;
  const normalizeCompound = value => value.trim().replaceAll(" - ", " ").replaceAll("-", " ").replace(/\s+/gu, " ");
  async function load() {
    if (!loadPromise) loadPromise = (async () => {
      const response = await fetch(chrome.runtime.getURL("build/resources/ca-table-rules.json"));
      if (!response.ok) throw new Error("Cannot load Catalan table rules.");
      const resource = await response.json();
      if (resource.schemaVersion !== 1 || resource.language !== "ca-ES") throw new Error("Invalid Catalan table rules.");
      for (let line of resource.compounds.text.split(/\r?\n/u)) {
        if (!line || line.startsWith("#")) continue;
        line = line.replace(/#.*$/u, "").trim().replaceAll("-", " ");
        const flag = /[+*?$]$/u.test(line) ? line.at(-1) : "";
        if (flag) line = line.slice(0, -1);
        compounds.set(line, { joined: flag !== "*", dash: !["+", "?"].includes(flag), lower: ["?", "$"].includes(flag) });
      }
      for (const raw of resource.checkCase.text.split(/\r?\n/u)) {
        let line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        line = line.split("#", 1)[0].trim();
        if (!line) continue;
        const canonical = line.split("=", 1)[0].trim();
        if (!canonical) continue;
        checkCaseForms.set(normalizeCaseKey(canonical), canonical);
      }
      const caseAlternatives = [...new Set(checkCaseForms.keys())]
        .sort((left, right) => right.length - left.length || left.localeCompare(right, "ca"))
        .map(checkCasePattern);
      checkCaseRegex = caseAlternatives.length
        ? new RegExp(`(?<![\\p{L}\\p{N}])(?:${caseAlternatives.join("|")})(?![\\p{L}\\p{N}])`, "giu")
        : null;
      for (const line of resource.balearic.text.split(/\r?\n/u)) {
        if (!line.trim() || line.startsWith("#")) continue;
        const [wrong, right] = line.split("=");
        if (!right || line.split("=").length !== 2) throw new Error("Invalid replacement row.");
        for (const form of wrong.split("|")) replacements.set(form, right.split("|"));
      }
      for (const name of ["simple", "custom", "anglicism"]) for (const raw of resource[name].text.split(/\r?\n/u)) {
        const line=raw.trim(); if(!line || line.startsWith("#")) continue;
        const separator=line.indexOf("="); if(separator<0) throw new Error("Invalid table row: "+line);
        const wrong=line.slice(0,separator), right=line.slice(separator+1);
        // SimpleReplaceAnglicism uses a tab-separated optional description,
        // while SimpleReplace tables use '#'. Keep metadata out of the actual
        // replacement strings, as LanguageTool's table loader does.
        const [value, tabMessage] = name==="anglicism" ? right.split("\t",2) : [right, undefined];
        const [forms, hashMessage]=value.split("#",2);
        const message=tabMessage??hashMessage;
        for(const form of wrong.split("|")) (name==="anglicism"?anglicism:simple).set(form,{suggestions:forms.split("|"),message});
      }
      for (const raw of resource.verbs.text.split(/\r?\n/u)) {
        const line = raw.split("#", 1)[0].trim();
        if (!line) continue;
        const separator = line.indexOf("=");
        if (separator < 0) throw new Error("Invalid replacement verb row: " + raw);
        const infinitives = line.slice(0, separator).split("|").map(value => value.trim().normalize("NFC"));
        const replacements = line.slice(separator + 1).split("#", 1)[0].trim().split("|").map(value => value.trim()).filter(Boolean);
        if (!replacements.length) continue;
        for (const infinitive of infinitives) verbs.set(infinitive, replacements);
      }
      return { compounds: compounds.size, replacements: replacements.size, checkCaseEntries: checkCaseForms.size };
    })().catch(error => { loadPromise = null; throw error; });
    return loadPromise;
  }
  function findCaseMatches(text, sentences) {
    if (!checkCaseRegex) throw new Error("LanguageTool check-case resource is not loaded.");
    const matches = [];
    for (const sentence of sentences) {
      const start = sentence.start ?? 0, end = sentence.end ?? start + sentence.text.length;
      const value = text.slice(start, end);
      checkCaseRegex.lastIndex = 0;
      let match;
      while ((match = checkCaseRegex.exec(value))) {
        const actual = match[0].replace(/\s+/gu, " ").replace(/[’‘]/gu, "'");
        const canonical = checkCaseForms.get(normalizeCaseKey(actual));
        if (!canonical || allUpper(actual) || actual === canonical) continue;
        const sentenceInitial = /^[\s\p{P}\p{S}\p{N}]*$/u.test(value.slice(0, match.index));
        if (sentenceInitial && actual === upperFirst(canonical)) continue;
        const suggestion = sentenceInitial ? upperFirst(canonical) : canonical;
        matches.push({
          id: `${checkCaseRuleId(canonical)}:${start + match.index}:${start + match.index + match[0].length}`,
          ruleId: checkCaseRuleId(canonical),
          category: "typography",
          // AbstractCheckCaseRule uses RuleMatch's default Other type.
          severity: "Other",
          message: "Majúscules i minúscules recomanades. Alguns llibres d'estil poden suggerir solucions diferents en alguns casos.",
          shortMessage: "Majúscules i minúscules",
          text: match[0],
          start: start + match.index,
          end: start + match.index + match[0].length,
          replacementStart: start + match.index,
          replacementEnd: start + match.index + match[0].length,
          suggestions: [suggestion],
          rule: "CA_CHECKCASE"
        });
      }
    }
    return matches;
  }
  function issue(rule, from, to, text, suggestions, priority, message) {
    return { id: `${rule}:${from}:${to}`, ruleId: rule, rule, category: "grammar", severity: "warning", message,
      text, start: from, end: to, replacementStart: from, replacementEnd: to, suggestions,
      _ruleId: rule, _from: from, _to: to, _priority: priority, _picky: false, _includedAllAtOnce: false,
      _registrationOrder: -2, _family: "table", _outputPortable: false };
  }
  function findMatches(tokens, text, { localeProfile = "central" } = {}) {
    if (!lexicalLookup || !compounds.size) throw new Error("Catalan table rules are not configured.");
    const words = tokens.filter(token => token.kind !== "space");
    const found = [];
    const sentinel={text:"",start:words[0]?.start||0,end:words[0]?.start||0,readings:[{tag:"SENT_START",lemma:null}],kind:"sentence-start"};
    const context=[sentinel,...words];
    const specificId=(prefix,form)=>prefix+"_"+form.toLocaleUpperCase("ca").replace(/[^\p{L}\p{N}]/gu,"_");
    for (const token of words) {
      if (!token.chunkTags?.includes("_incorrect_verb_") || token.immunized || token.ignoredBySpeller) continue;
      const reading = (token.readings || []).find(row => row.source === "languagetool-incorrect-verb" && /^V/u.test(row.tag || ""));
      const replacements = reading?.lemma ? verbs.get(reading.lemma) : null;
      if (!reading || !replacements) continue;
      let suggestions = replacements.flatMap(lemma => CorrectorCatalanSynthesis.synthesize({ lemma, tag: reading.tag }, reading.tag, false, localeProfile));
      suggestions = [...new Set(suggestions)].filter(value => value !== token.text);
      if (allUpper(token.text)) suggestions = suggestions.map(value => value.toLocaleUpperCase("ca"));
      else if (/^\p{Lu}/u.test(token.text)) suggestions = suggestions.map(upperFirst);
      if (suggestions.length) found.push(issue(specificId("CA_SIMPLE_REPLACE_VERBS", reading.lemma), token.start, token.end,
        token.text, suggestions, 28, "Verb incorrecte."));
    }
    for(let start=0;start<words.length;start++){
      const token=words[start];if(token.immunized||token.ignoredBySpeller)continue;
      const tagged=(token.readings||[]).some(r=>r.tag && !["SENT_END","PARAGRAPH_END"].includes(r.tag));
      const row=simple.get(token.text)||simple.get(token.text.toLowerCase());
      if(row&&!tagged){
        let match=issue(specificId("CA_SIMPLE_REPLACE_SIMPLE",token.text),token.start,token.end,token.text,row.suggestions.map(s=>allUpper(token.text)?s.toUpperCase():/^\p{Lu}/u.test(token.text)?upperFirst(s):s),30,row.message||"Paraula incorrecta");
        if(!match.suggestions.some(s=>["què","perquè","per què"].includes(s.toLowerCase())))match=CorrectorCatalanRuleFilters.convert(match,{lemmaSelect:"[NA].*"},context,text);
        if(match)found.push({...match,_from:match.start,_to:match.end,text:text.slice(match.start,match.end)});
      }
      if((token.readings||[]).some(r=>/^NP/u.test(r.tag||""))&&token.text.length>1)continue;
      let joined="",best=null;
      for(let end=start;end<Math.min(words.length,start+10);end++){
        if(end>start&&words[end].whitespaceBefore)joined+=" ";joined+=words[end].text;
        const entry=anglicism.get(joined.toLowerCase());if(entry)best={entry,end,joined};
      }
      if(!best)continue;
      const end=best.end;
      if(start>0&&(token.readings||[]).some(r=>r.tag==="_english_ignore_")&&(words[start-1].readings||[]).some(r=>r.tag==="_english_ignore_"))continue;
      if(end+1<words.length&&(words[end].readings||[]).some(r=>r.tag==="_english_ignore_")&&(words[end+1].readings||[]).some(r=>r.tag==="_english_ignore_"))continue;
      let match=issue(specificId("CA_SIMPLE_REPLACE_ANGLICISM",best.joined),token.start,words[end].end,text.slice(token.start,words[end].end),best.entry.suggestions.map(s=>allUpper(best.joined)?s.toUpperCase():/^\p{Lu}/u.test(best.joined)?upperFirst(s):s),65,best.entry.message||"Anglicisme innecessari");
      if(start===end)match=CorrectorCatalanRuleFilters.convert(match,{lemmaSelect:"[NA].*"},context,text);
      if(match)found.push({...match,_from:match.start,_to:match.end,text:text.slice(match.start,match.end)});
    }
    for (const token of localeProfile === "inclusive" || localeProfile === "balearic" ? [] : words) {
      if (token.immunized || token.ignoredBySpeller || (token.readings || []).some(row => /^NP/u.test(row.tag || "") || ["_english_ignore_", "_Latin_"].includes(row.tag))) continue;
      const forms = replacements.get(token.text) || replacements.get(token.text.toLocaleLowerCase("ca"));
      if (!forms) continue;
      let suggestions = forms.map(value => allUpper(token.text) ? value.toLocaleUpperCase("ca") : value).filter(value => value !== token.text);
      if (/^\p{Lu}/u.test(token.text)) suggestions = suggestions.map(upperFirst);
      if (suggestions.length) found.push(issue("CA_SIMPLE_REPLACE_BALEARIC", token.start, token.end, token.text, suggestions, 60,
        "Possible error ortogràfic (forma verbal vàlida en la varietat balear)."));
    }
    // AbstractCompoundRule keeps five tokens, prefers the longest match and
    // normalizes hyphens only for lookup. Suggestions retain original casing.
    for (let start = 0; start < words.length; start++) {
      if (words[start].immunized) continue;
      let original = "", best = null;
      for (let end = start; end < Math.min(words.length, start + 5); end++) {
        if (words[end].immunized) continue;
        if (end > start && words[end].whitespaceBefore) original += " ";
        original += words[end].text;
        const normalized = normalizeCompound(original);
        // Sentence-initial token is uncapitalized through the SENT_START queue.
        const key = start === 0 ? lowerFirst(normalized) : normalized;
        const digitKey = key.replace(/\d+/gu, "\\d+");
        const data = compounds.get(key) || compounds.get(digitKey);
        if (!data) continue;
        if (data.dash && !original.includes(" ")) { best = null; continue; }
        let suggestions = [];
        if (data.dash) suggestions.push(original.replaceAll(" ", "-"));
        const parts = original.split(" ");
        if (data.joined && !parts.some(allUpper)) suggestions.push(original.replaceAll("-", " ").split(" ").map((part, index) => index && data.lower ? lowerFirst(part) : part).join(""));
        if (key.split(" ")[0].length === 1) suggestions = [original.replaceAll(" ", "-")];
        suggestions = suggestions.map(value => value.replace(/--+/gu, "-")).filter(value => value !== text.slice(words[start].start, words[end].end)
          && lexicalLookup(value).some(row => row.tag != null));
        if (!suggestions.length) { best = null; continue; }
        const message = suggestions.length === 2 ? "S'escriu junt o amb guionet." : data.joined && !data.dash ? "S'escriu junt sense espai ni guionet." : "S'escriu amb un guionet.";
        best = issue("CA_COMPOUNDS", words[start].start, words[end].end, text.slice(words[start].start, words[end].end), suggestions, 50, message);
      }
      if (best) found.push(best);
    }
    return found;
  }
  globalThis.CorrectorCatalanTableRuleMatcher = Object.freeze({ load, findMatches, findCaseMatches, configureLexicalLookup: lookup => { lexicalLookup = lookup; } });
})();
