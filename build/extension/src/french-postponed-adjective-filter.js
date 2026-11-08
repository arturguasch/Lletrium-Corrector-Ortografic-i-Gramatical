/*
 * LanguageTool, a natural language style checker
 * Copyright (C) 2020 Jaume Ortolà i Font
 *
 * This library is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or (at
 * your option) any later version.
 *
 * This French-specific adaptation is proof-only. The complete LGPL text and
 * adaptation scope are recorded in licenses/languagetool-runtime/.
 */
(() => {
  'use strict';
  const compile = pattern => new RegExp(`^(?:${pattern})$`, 'u');

  function apply(rt, { match, markerStart }) {
    const rows = match.rows;
    const marked = match.captures.slice(markerStart).flat();
    const i = marked[0]?.index;
    if (!Number.isInteger(i) || !rows[i]) return [];
    const sameSentence = (a, b) => rows[a]?.sentence === rows[b]?.sentence;
    const token = n => rows[n]?.token || '';
    const determinerContext = n => n >= 0 && matchesRaw(n, '(P\\+)?D .*') && matchesRaw(n + 1, '[NZ] .*');
    const matchesRaw = (n, pattern) => {
      if (!rows[n]) return false;
      const re = compile(pattern);
      return rt.readings(rows[n]).some(reading => re.test(reading.tag || 'UNKNOWN'));
    };
    const matches = (n, pattern) => {
      if (!rows[n]) return false;
      const re = compile(pattern), ignoreNounReading = determinerContext(n);
      return rt.readings(rows[n]).some(item => !(ignoreNounReading && /^[NZ] /u.test(item.tag || '')) && re.test(item.tag || 'UNKNOWN'));
    };
    const reading = (n, pattern) => {
      if (!rows[n]) return null;
      const re = compile(pattern);
      return rt.readings(rows[n]).find(item => re.test(item.tag || 'UNKNOWN')) || null;
    };
    const P = {
      NOM: '[NZ] .*', NOM_MS: '[NZ] m s', NOM_FS: '[NZ] f s', NOM_MP: '[NZ] m p', NOM_MN: '[NZ] m sp', NOM_FP: '[NZ] f p', NOM_CS: '[NZ] e s', NOM_CP: '[NZ] e sp',
      NOM_DET: '[NZ] .*|(P\\+)?D .*', GN: '_GN_.*', GN_MS: '_GN_MS', GN_FS: '_GN_FS', GN_MP: '_GN_MP', GN_FP: '_GN_FP', GN_CS: '_GN_[MF]S', GN_CP: '_GN_[MF]P', GN_MN: '_GN_M[SP]', GN_FN: '_GN_F[SP]',
      DET: '(P\\+)?D .*', DET_CS: '(P\\+)?D e s', DET_MS: '(P\\+)?D m s', DET_FS: '(P\\+)?D f s', DET_MP: '(P\\+)?D m p', DET_FP: '(P\\+)?D f p', DET_CP: '(P\\+)?D e p',
      GN_MS_TAG: '[NZ] [me] (s|sp)|J [me] (s|sp)|V ppa m s|(P\\+)?D m (s|sp)', GN_FS_TAG: '[NZ] [fe] (s|sp)|J [fe] (s|sp)|V ppa f s|(P\\+)?D f (s|sp)',
      GN_MP_TAG: '[NZ] [me] (p|sp)|J [me] (p|sp)|V ppa m p|(P\\+)?D m (p|sp)', GN_FP_TAG: '[NZ] [fe] (p|sp)|J [fe] (p|sp)|V ppa f p|(P\\+)?D f (p|sp)',
      GN_CP_TAG: '[NZ] [fme] (p|sp)|J [fme] (p|sp)|(P\\+)?D [fme] (p|sp)', GN_CS_TAG: '[NZ] [fme] (s|sp)|J [fme] (s|sp)|(P\\+)?D [fme] (s|sp)',
      GN_MN_TAG: '[NZ] [me] (s|p|sp)|J [me] (s|p|sp)|(P\\+)?D [me] (s|p|sp)', GN_FN_TAG: '[NZ] [fe] (s|p|sp)|J [fe] (s|p|sp)|(P\\+)?D [fe] (s|p|sp)',
      ADJ: 'J .*|V ppa .*|PX.*', ADJ_MS: 'J [me] (s|sp)|V ppa m s', ADJ_FS: 'J [fe] (s|sp)|V ppa f s', ADJ_MP: 'J [me] (p|sp)|V ppa m p', ADJ_FP: 'J [fe] (p|sp)|V ppa f p', ADJ_CP: 'J e (p|sp)', ADJ_CS: 'J e (s|sp)', ADJ_MN: 'J m sp', ADJ_FN: 'J f sp', ADJ_S: 'J .* (s|sp)|V ppa . s', ADJ_P: 'J .* (p|sp)|V ppa . p', ADJ_M: 'J [me] .*|V ppa [me] .*', ADJ_F: 'J [fe] .*|V ppa [fe] .*',
      ADV: 'A', CONJ: 'C .*', PUNCT: '_PUNCT', KEEP: 'Y|J .*|N .*|D .*|P.*|V ppa .*|M nonfin|UNKNOWN|Z.*|V.* inf|V ppr', PREP: 'P.*', VERB: 'V.* (inf|ind|sub|con|ppr|imp).*', INF: 'V.* inf', GV: '_GV_'
    };
    const exact = (n, regexp) => new RegExp(`^(?:${regexp})$`, 'u').test(token(n));
    const adjPatterns = { CS: P.ADJ_CS, CP: P.ADJ_CP, MN: P.ADJ_MN, FN: P.ADJ_FN, MS: P.ADJ_MS, FS: P.ADJ_FS, MP: P.ADJ_MP, FP: P.ADJ_FP };
    const subst = { CS: P.GN_CS_TAG, CP: P.GN_CP_TAG, MN: P.GN_MN_TAG, FN: P.GN_FN_TAG, MS: P.GN_MS_TAG, FS: P.GN_FS_TAG, MP: P.GN_MP_TAG, FP: P.GN_FP_TAG };
    const gn = { CS: P.GN_CS, CP: P.GN_CP, MN: P.GN_MN, FN: P.GN_FN, MS: P.GN_MS, FS: P.GN_FS, MP: P.GN_MP, FP: P.GN_FP };
    let isPlural = true, isPrevNoun = false, canBeMS = false, canBeFS = false, canBeMP = false, canBeFP = false, canBeP = false;
    const newLevel = () => ({ n: { MS: 0, FS: 0, MP: 0, MN: 0, FP: 0, CS: 0, CP: 0 }, d: { MS: 0, FS: 0, MP: 0, FP: 0 }, nt: 0 });
    const levels = Array.from({ length: 4 }, newLevel);
    let level = 0, adverbAppeared = false, conjunctionAppeared = false, punctuationAppeared = false, infinitiveAppeared = false;
    const init = () => { adverbAppeared = conjunctionAppeared = punctuationAppeared = infinitiveAppeared = false; };
    const update = n => {
      conjunctionAppeared ||= matches(n, P.CONJ);
      if (token(n) === 'com') return;
      if (matches(n, `${P.NOM}|${P.ADJ}`)) { init(); return; }
      adverbAppeared ||= matches(n, P.ADV);
      punctuationAppeared ||= matches(n, P.PUNCT) || token(n) === ',';
      infinitiveAppeared ||= matches(n, P.INF);
    };
    const prepTokens = /^(?:d'|de|des|du|à|au|aux|en|dans|sur|entre|par|pour|avec|sans|contre|comme)$/u;
    const coord = /^(?:et|ou|ni)$/u;
    const stopCount = /^[;:()[\]–—―‒]$/u;
    const keep = n => {
      if (prepTokens.test(token(n)) || token(n) === '.') return true;
      if ((adverbAppeared && conjunctionAppeared) || (adverbAppeared && punctuationAppeared) || (conjunctionAppeared && punctuationAppeared) || (punctuationAppeared && matches(n, P.PUNCT)) || (infinitiveAppeared && coord.test(token(n))) || (infinitiveAppeared && adverbAppeared)) return false;
      return (matches(n, P.KEEP) || /^[,]|^(?:et|ou|ni)$/u.test(token(n)) || matches(n, 'A')) && !stopCount.test(token(n)) && (!matches(n, P.GV) || matches(n, P.GN));
    };
    let j = 1;
    while (i - j >= 0 && sameSentence(i, i - j) && keep(i - j) && level < 4) {
      const n = i - j, l = levels[level];
      if (!isPrevNoun) {
        if (matches(n, P.NOM) || (n - 1 >= 0 && !matches(n, P.NOM) && matches(n, P.ADJ) && matches(n - 1, P.DET))) {
          for (const [key, pattern] of [['MS',P.GN_MS],['FS',P.GN_FS],['MP',P.GN_MP],['FP',P.GN_FP]]) if (matches(n, pattern)) { l.n[key]++; if(key==='MS')canBeMS=true;else if(key==='FS')canBeFS=true;else if(key==='MP')canBeMP=true;else canBeFP=true; }
        }
        if (!matches(n, P.GN)) {
          for (const [key, pattern] of [['MS',P.NOM_MS],['FS',P.NOM_FS],['MP',P.NOM_MP],['MN',P.NOM_MN],['FP',P.NOM_FP],['CS',P.NOM_CS],['CP',P.NOM_CP]]) if (matches(n, pattern)) {
            l.n[key]++; if (key === 'MN') canBeMS = canBeMP = true; else if (key === 'CS') canBeMS = canBeFS = true; else if (key === 'CP') canBeFP = canBeMP = true; else if (key === 'MS') canBeMS = true; else if (key === 'FS') canBeFS = true; else if (key === 'MP') canBeMP = true; else canBeFP = true; break;
          }
        }
      }
      const noun = matches(n, P.NOM); if (noun) l.nt++; isPrevNoun = noun;
      if (matches(n, P.DET_CS)) { if (matches(n + 1, P.NOM_MS)) { l.d.MS++; canBeMS = true; } if (matches(n + 1, P.NOM_FS)) { l.d.FS++; canBeFS = true; } }
      if (matches(n, P.DET_CP)) { if (matches(n + 1, P.NOM_MP)) { l.d.MS++; canBeMP = true; } if (matches(n + 1, P.NOM_FP)) { l.d.FS++; canBeFP = true; } }
      if (!matches(n, P.ADV)) for (const [key, pattern] of [['MS',P.DET_MS],['FS',P.DET_FS],['MP',P.DET_MP],['FP',P.DET_FP]]) if (matches(n, pattern)) { l.d[key]++; if (key === 'MS') canBeMS = true; else if (key === 'FS') canBeFS = true; else if (key === 'MP') canBeMP = true; else canBeFP = true; }
      if (n - 1 >= 0 && matches(n, P.PREP) && prepTokens.test(token(n)) && !matches(n, P.CONJ) && !coord.test(token(n - 1)) && !matches(n + 1, P.ADV)) level++;
      else if (token(n).toLocaleLowerCase('fr') === "d'" && token(n + 1).toLocaleLowerCase('fr') === 'environ') level++;
      if (coord.test(token(n)) && n - 1 >= 0 && token(n + 1) && matches(n - 1, P.DET) && token(n + 1) === 'plus') j++;
      update(i - j); j++;
    }
    level = Math.min(level + 1, 4);
    let nTotal = 0, dTotal = 0;
    for (let k = 0; k < level; k++) {
      const l = levels[k], n = Object.values(l.n).reduce((a,b)=>a+b,0), d = Object.values(l.d).reduce((a,b)=>a+b,0);
      nTotal += n; dTotal += d;
      if (matches(i, P.ADJ_MP) && (n > 1 || d > 1) && (l.n.MS+l.n.MN+l.n.MP+l.n.CS+l.n.CP+l.d.MS+l.d.MP > 0) && l.n.FS+l.n.FP <= l.nt) return [];
      if (matches(i, P.ADJ_FP) && (n > 1 || d > 1) && ((l.n.MS+l.n.MP+l.n.MN+l.d.MS+l.d.MP === 0) || (l.nt > 0 && l.n.FS+l.n.FP >= l.nt))) return [];
      if (n + d > 0) { isPlural = isPlural && d > 1 && level > 1; canBeP ||= n > 1; }
    }
    isPlural ||= (i - 2 >= 0 && levels[0].n.MP + levels[0].n.FP + levels[0].n.CP > 0 && token(i - 2) === ',');
    if (!nTotal && !dTotal) return [];
    const adjective = Object.keys(adjPatterns).find(key => matches(i, adjPatterns[key]));
    if (!adjective) return [];
    let j2 = 1, keepCount = true;
    while (i - j2 >= 0 && sameSentence(i, i - j2) && keepCount) {
      const n = i - j2;
      if (matches(n, P.NOM_DET) && matches(n, gn[adjective])) return [];
      if (!matches(n, P.GN) && matches(n, subst[adjective])) return [];
      keepCount = !matches(n, P.NOM_DET); j2++;
    }
    const prev = i - 1, prev2 = i - 2, prev3 = i - 3;
    const requiredPrevious = (matches(prev, P.NOM) && !matches(prev, subst[adjective])) || (matches(prev, P.GN) && !matches(prev, gn[adjective])) || (matches(prev, P.ADJ) && !matches(prev, adjPatterns[adjective])) || (i > 2 && matches(prev, P.ADV) && !matches(prev2, P.VERB) && !matches(prev2, P.PREP)) || (i > 3 && matches(prev, P.ADV) && matches(prev2, P.ADV) && !matches(prev3, P.VERB) && !matches(prev3, P.PREP));
    if (!requiredPrevious) return [];
    const singularAllowed = isPlural && matches(i, P.ADJ_S);
    if (!singularAllowed) {
      j2 = 1; init();
      while (i - j2 >= 0 && sameSentence(i, i - j2) && keep(i - j2) && (level > 1 || j2 < 4)) {
        const n = i - j2;
        if ((!matches(n, P.GN) && matches(n, P.NOM_DET) && matches(n, subst[adjective])) || matches(n, gn[adjective])) return [];
        if (coord.test(token(n)) && n - 1 >= 0 && matches(n - 1, P.DET) && token(n + 1) === 'plus') j2++;
        update(n); j2++;
      }
    }
    const sourceReading = reading(i, adjPatterns[adjective]);
    if (!sourceReading?.lemma) return [];
    let suggestions = [];
    const synth = pattern => rt.synthesize(sourceReading.lemma, pattern, { regexp: true });
    if (adjective === 'CS') suggestions = synth('J e p');
    if (!suggestions.length && adjective === 'CP') suggestions = synth('J e s');
    if (!suggestions.length && isPlural && matches(i, P.ADJ_P)) suggestions = synth('J . p|V ppa . p');
    if (!suggestions.length) {
      if (canBeMS && !isPlural) suggestions.push(...synth('J [me] sp?|V ppa m s'));
      if (canBeFS && !isPlural) suggestions.push(...synth('J [fe] sp?|V ppa f s'));
      if (canBeMP) suggestions.push(...synth('J [me] s?p|V ppa m p'));
      if (canBeFP) suggestions.push(...synth('J [fe] s?p|V ppa f p'));
      if (canBeMS && (isPlural || canBeP)) suggestions.push(...synth('J [me] s?p|V ppa m p'));
      if (canBeFS && !canBeMS && (isPlural || canBeP)) suggestions.push(...synth('J [fe] s?p|V ppa f p'));
    }
    suggestions = [...new Set(suggestions)].filter(form => form.toLocaleLowerCase('fr') !== token(i).toLocaleLowerCase('fr'));
    return suggestions;
  }

  globalThis.CorrectorFrenchPostponedAdjectiveFilter = Object.freeze({ apply });
})();
