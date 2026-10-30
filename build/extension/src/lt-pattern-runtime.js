/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* LanguageTool-compatible pattern subset. See licenses/languagetool-runtime/NOTICE.md.
 * Filter adaptations: upstream LGPL-2.1-or-later; local adaptation GPL-3.0-or-later under LGPL-2.1 section 3, upstream Daniel Naber / Jaume Ortolà.
 */
(() => {
  'use strict';
  const normal = s => String(s ?? '').normalize('NFC').replace(/[’ʼ]/gu, "'");
  const upperFirst = s => s ? s.replace(/\p{L}/u,c=>c.toLocaleUpperCase('ca')) : s;
  const unique = xs => [...new Set(xs)];
  class LtPatternRuntime {
    constructor({ dictionary, synthesisExclusions = [], chunkRules = [], posRules = [], contextRules = [], dependencyRules = [], filterResources = {}, services = {}, maxSteps = 100000, now = () => new Date() } = {}) {
      this.dictionary = dictionary;
      this.synthesisExclusions = new Set(synthesisExclusions);
      this.maxSteps = maxSteps;
      this.chunkRules = chunkRules;
      this.posRules = posRules;
      this.contextRules = contextRules;
      this.filterResources = filterResources;
      this.services = services;
      this.dependencyRules = dependencyRules;
      this.now = now;
      this.regexps = new Map();
      this.diagnostics = [];
    }
    re(pattern, sensitive = true) {
      const key = `${sensitive}:${pattern}`;
      if (!this.regexps.has(key)) {
        // Java-only expressions must be rejected, never silently approximated.
        this.regexps.set(key, this.expression(pattern, sensitive, true));
      }
      return this.regexps.get(key);
    }
    expression(pattern, sensitive = true, whole = false, global = false) {
      let flags = sensitive ? 'u' : 'iu';
      pattern = pattern.replace(/^\(\?([iuUs]+)\)/u, (_, f) => {
        if (f.includes('i') && !flags.includes('i')) flags += 'i';
        if (f.includes('s')) flags += 's';
        return '';
      });
      pattern = pattern.replace(/\\Q([\s\S]*?)\\E/gu, (_, literal) => literal.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'));
      if (/\\[QEGZ]|\+\+|\*\+|\?\+|\[\^?[^\]]*&&/u.test(pattern)) throw Error(`Unsupported Java regexp: ${pattern}`);
      // Java flags without ':' affect the remainder of their enclosing group.
      // ECMAScript modifier groups express that same scope without global flags.
      let converted='', depth=0, classDepth=0; const closers=new Map();
      for(let i=0;i<pattern.length;i++){
        const char=pattern[i];
        if(char==='\\'){
          const next=pattern[++i];
          converted += /[!%,— =]/u.test(next) || next==='-'&&!classDepth ? next : '\\'+next; continue;
        }
        if(char==='['){
          if(classDepth&&pattern[i+1]==='^')throw Error('Unsupported nested negated character class');
          if(!classDepth)converted+='[';classDepth++;continue;
        }
        if(char===']'&&classDepth){classDepth--;if(!classDepth)converted+=']';continue;}
        if(classDepth){converted+=char==='-'&&pattern[i+1]===']'?'\\-':char;continue;}
        if(char==='('){
          const modifier=pattern.slice(i).match(/^\(\?([imsuU-]+)([:)])/u);
          if(modifier){
            const settings=modifier[1].replace(/[uU]/gu,'').replace(/-$/u,'');
            i+=modifier[0].length-1;
            if(modifier[2]===')'){
              if(settings){converted+='(?'+settings+':';closers.set(depth,(closers.get(depth)||0)+1);}continue;
            }
            converted+=settings?'(?'+settings+':':'(?:';depth++;continue;
          }
          depth++;
        }
        if(char===')'){converted+=')'.repeat(closers.get(depth)||0);closers.delete(depth);depth--;}
        converted+=char;
      }
      converted+=')'.repeat(closers.get(0)||0);pattern=converted;
      pattern = pattern.replaceAll('\\p{IsPunctuation}', '\\p{P}');
      return new RegExp(whole ? `^(?:${pattern})$` : pattern, flags + (global ? 'g' : ''));
    }
    branches(spec) {
      if (spec.or) return spec.or.flatMap(s => this.branches(s));
      if (!spec.and) return [spec];
      return spec.and.reduce((products, item) => products.flatMap(product => this.branches(item).map(s => [...product, s])), [[]])
        .map(items => ({ ...items[0], conjuncts: items.slice(1) }));
    }
    synthesize(lemma, tag, options) {
      if(options?.regexp&&['enterar','sentar','conseguir','alcançar'].includes(lemma))return [];
      let tail='';if(tag.startsWith('V')&&lemma?.includes(' ')){const cut=lemma.indexOf(' ');tail=lemma.slice(cut);lemma=lemma.slice(0,cut);}
      const lookup=target=>{const matcher=this.re(target);return this.dictionary.synthesize(lemma,target,options).filter(form=>this.dictionary.lookup(form,{lowercaseFallback:false}).some(r=>r.lemma===lemma&&matcher.test(r.tag)&&!this.synthesisExclusions.has([form,r.lemma,r.tag].join('\t'))));};
      let forms=lookup(tag);
      if(!forms.length&&/^V.*[CVBXYZ0123456]$/u.test(tag)){
        const target=tag.slice(0,-1)+'[0CXY12]',matcher=this.re(target);
        forms=this.dictionary.synthesize(lemma,target,{regexp:true}).filter(form=>this.dictionary.lookup(form,{lowercaseFallback:false}).some(r=>r.lemma===lemma&&matcher.test(r.tag)&&!this.synthesisExclusions.has([form,r.lemma,r.tag].join('\t'))));
      }
      return forms.map(form=>form+tail);
    }
    validate(rule) {
      const keys = (object, allowed) => { for (const key of Object.keys(object)) if (!allowed.includes(key)) throw Error('Unsupported attribute: ' + key); };
      const token = (spec, exception = false) => {
        if (spec.and || spec.or) {
          keys(spec, [spec.and ? 'and' : 'or']);
          const items = spec.and || spec.or;
          if (!Array.isArray(items) || !items.length) throw Error('Empty token combinator');
          items.forEach(s => token(s, exception)); return;
        }
        keys(spec, ['text','regexp','postag','postagRegexp','inflected','caseSensitive','negate','negatePos','min','max','skip','scope','exceptions','chunk','spaceBefore','reference']);
        if (exception && ['min','max','skip','exceptions'].some(k => k in spec)) throw Error('Unsupported exception structure');
        if (!exception && spec.scope) throw Error('Scope belongs to exceptions');
        if (spec.scope && !['current','previous','next'].includes(spec.scope)) throw Error('Unsupported exception scope');
        const min = spec.min ?? 1, max = spec.max ?? 1, skip = spec.skip ?? 0;
        if (![min,max,skip].every(Number.isInteger) || min < 0 || (max !== -1 && max < min) || max > 127 || skip < -1 || skip > 127) throw Error('Unsupported repetition or skip');
        if (spec.regexp) this.re((spec.text || '').replace('{reference}',''), !!spec.caseSensitive);
        if (spec.postagRegexp) this.re(spec.postag || '');
        for (const ex of spec.exceptions || []) token(ex, true);
        if (spec.reference) {
          keys(spec.reference,['no','postag','postagRegexp','postagReplace','regexpMatch','regexpReplace','caseConversion','literal','includeSkipped','setPos']);
          if (!Number.isInteger(spec.reference.no) || spec.reference.no<0) throw Error('Invalid token reference');
          if(spec.reference.regexpMatch)this.expression(spec.reference.regexpMatch);
        }
      };
      keys(rule, ['format','id','category','pattern','unify','marker','antipatterns','equivalences','filter','examples','message','suggestions','rawPos','regexp','minPrevMatches','distanceTokens','repetitionGroup','goalSpecific']);
      if(rule.regexp){
        keys(rule.regexp,['source','mark','caseSensitive']);this.expression(rule.regexp.source,rule.regexp.caseSensitive);
        if(!Number.isInteger(rule.regexp.mark)||rule.regexp.mark<0||rule.filter)throw Error('Unsupported regexp marker or filter');
        if([rule.message,...rule.suggestions].flat().some(p=>typeof p!=='string'))throw Error('Regexp suggestions use numbered capture strings');
        return;
      }
      if(rule.minPrevMatches!=null&&(!Number.isInteger(rule.minPrevMatches)||rule.minPrevMatches<1||!Number.isInteger(rule.distanceTokens)||rule.distanceTokens<1))throw Error('Invalid repetition threshold');
      const pattern = p => {
        if (!p.pattern?.length) throw Error('Empty pattern');
        p.pattern.forEach(spec => token(spec));
        for (const group of p.unify || []) {
          keys(group, ['tokens','features','negate']);
          if (!group.tokens.every(i => Number.isInteger(i) && i >= 0 && i < p.pattern.length)) throw Error('Invalid unification reference');
          for (const f of group.features) if (!rule.equivalences?.[f]) throw Error('Undefined feature: ' + f);
        }
        if (p.marker && (!Number.isInteger(p.marker.start) || !Number.isInteger(p.marker.end) || p.marker.start < 0 || p.marker.end > p.pattern.length || p.marker.end <= p.marker.start)) throw Error('Invalid marker');
      };
      pattern(rule);
      for (const anti of rule.antipatterns || []) { keys(anti,['pattern','unify','marker','rawPos']); pattern(anti); }
      for (const equivalents of Object.values(rule.equivalences || {})) Object.values(equivalents).forEach(spec => token(spec));
      for (const parts of [rule.message || [], ...(rule.suggestions || [])]) for (const part of parts) if (typeof part !== 'string') {
        keys(part,['no','postag','postagRegexp','postagReplace','regexpMatch','regexpReplace','caseConversion','literal','includeSkipped','setPos']);
        if (!Number.isInteger(part.no) || part.no < 1 || part.no > rule.pattern.length) throw Error('Invalid match reference');
        if (part.literal != null && !part.postag) throw Error('Literal lemma needs a synthesis tag');
        if (part.caseConversion && !['alllower','allupper','firstupper','firstlower','startupper','startlower','preserve'].includes(part.caseConversion)) throw Error('Unsupported case conversion');
        if (part.includeSkipped && !['none','all','following'].includes(part.includeSkipped)) throw Error('Unsupported skipped-token range');
        if (part.postagRegexp) this.re(part.postag);
        if (part.regexpMatch) this.re(part.regexpMatch);
      }
      if (rule.filter) {
        keys(rule.filter,['name','args']);
        const schemas = {
          ...globalThis.CorrectorLtCatalanFilters?.schemas,
          AdvancedSynthesizerFilter:['lemmaFrom','lemmaSelect','postagFrom','postagSelect','postagReplace','newLemma'],
          RemoveSuggestionsFilter:['removeSuggestionsRegexp'], AdaptSuggestionsFilter:['none'],
          WhitespaceCheckFilter:['whitespaceChar','position'], ApostropheTypeFilter:['wordFrom','hasTypographicalApostrophe'],
          CheckPostagsInSuggestionFilter:['PostagsList'], ConvertToSentenceCaseFilter:['startFrom'], AddCommasFilter:['suggestSemicolon'],
          DiacriticsCheckFilter:['postag','form','gendernumberFrom'], NewYearDateFilter:['year','month','day'], DateCheckFilter:['weekDay','date','year','month','day'],
          SynthesizeWithDAFilter:['lemmaFrom','lemmaSelect','synthAllForms','prepositionFrom'],
          SynthesizeWithAnyDeterminerFilter:['lemmaSelect','synthAllForms'],
          LocalCatalanRewriteFilter:[], TextToNumberFilter:['ignore'], OblidarseSugestionsFilter:[]
        };
        const allowed = schemas[rule.filter.name];
        if (!allowed) throw Error('Unsupported filter: ' + rule.filter.name);
        keys(rule.filter.args,allowed);
        const required = rule.filter.name === 'AdvancedSynthesizerFilter' ? allowed.slice(0,4) : rule.filter.name === 'DiacriticsCheckFilter' ? allowed.slice(0,2) : rule.filter.name === 'DateCheckFilter' ? ['weekDay'] : ['AddCommasFilter','AdaptSuggestionsFilter','ConvertToSentenceCaseFilter'].includes(rule.filter.name) ? [] : allowed;
        const optionalAware=rule.filter.name in (globalThis.CorrectorLtCatalanFilters?.schemas||{})?(globalThis.CorrectorLtCatalanFilters.required[rule.filter.name]||[]):rule.filter.name==='SynthesizeWithDAFilter'?['lemmaFrom','lemmaSelect']:rule.filter.name==='SynthesizeWithAnyDeterminerFilter'?['lemmaSelect']:rule.filter.name==='TextToNumberFilter'?[]:required;
        if (optionalAware.some(k => rule.filter.args[k] == null)) throw Error('Missing filter argument');
      }
    }
    readings(row) {
      const entries = row?.ltReadings || row?.analysis?.readings || [];
      if(!row?.ltReadings&&row?.analysis?.lexical===false&&!entries.some(r=>r.tag==='UNKNOWN'))return [...entries,{tag:'UNKNOWN',lemma:null}];
      return entries.length ? entries : [{ tag: 'UNKNOWN', lemma: null }];
    }
    fits(row, reading, spec) {
      if (!row) return false;
      if (spec.chunk && !(row.chunks || row.analysis?.chunks || []).includes(spec.chunk)) return false;
      if (spec.spaceBefore != null && spec.spaceBefore !== !!row.whitespaceBefore) return false;
      const value = spec.inflected ? reading.lemma : row.token;
      let textMatch = spec.text == null || (spec.regexp
        ? value != null && this.re(spec.text, !!spec.caseSensitive).test(normal(value).replaceAll('\u00ad',''))
        : value != null && (spec.caseSensitive ? normal(value) === normal(spec.text) : normal(value).toLocaleLowerCase('ca') === normal(spec.text).toLocaleLowerCase('ca')));
      if (spec.negate) textMatch = !textMatch;
      let posMatch = !spec.postag || (spec.postagRegexp ? this.re(spec.postag).test(reading.tag || 'UNKNOWN') : reading.tag === spec.postag);
      if (spec.negatePos) posMatch = !posMatch;
      return textMatch && posMatch;
    }
    any(row, spec) { return this.readings(row).some(r => this.fits(row, r, spec)); }
    candidates(rows, index, spec, captures = [], matchStart = captures.flat()[0]?.index ?? index) {
      const row = rows[index];
      if (!row) return [];
      if (spec.reference) {
        const reference=spec.reference,source=rows[matchStart+reference.no];if(!source)return [];
        const slot={row:source,index:matchStart+reference.no,readings:this.readings(source)};
        if(reference.setPos){
          const tags=slot.readings.filter(r=>this.re(reference.postag).test(r.tag||'')).map(r=>reference.postagReplace?r.tag.replace(this.re(reference.postag),reference.postagReplace):r.tag);
          spec={...spec,text:spec.text?.replace('{reference}','')||undefined,postag:tags.join('|'),postagRegexp:true};
        }else{
          const values=this.render([{...reference,no:1}],{captures:[[slot]],rows},this.text);
          const matched=values.find(value=>this.readings(row).some(r=>this.fits(row,r,{...spec,text:(spec.text||'{reference}').replace('{reference}',value)})));
          if(matched==null)return [];
          spec={...spec,text:(spec.text||'{reference}').replace('{reference}',matched)};
        }
      }
      if (spec.conjuncts?.some(s => !this.candidates(rows, index, s, captures,matchStart).length)) return [];
      for (const ex of spec.exceptions || []) {
        const where = ex.scope === 'previous' ? index - 1 : index;
        if (ex.scope !== 'next' && rows[where]?.sentence === row.sentence && this.any(rows[where], ex)) return [];
        if (ex.scope === 'next' && !(spec.skip > 0 || spec.skip === -1) && rows[index + 1]?.sentence === row.sentence && this.any(rows[index + 1], ex)) return [];
      }
      return this.readings(row).filter(r => this.fits(row, r, spec));
    }
    tick() { if (++this.steps > this.maxSteps) throw Error('Pattern search budget exceeded'); }
    unify(group, captures, rule) {
      const slots = group.tokens.flatMap(i => captures[i]);
      if (slots.length < 2) return !group.negate;
      // A single reading must satisfy all features together. Do not assemble
      // gender from one reading and number from another reading of a token.
      const solve = (i, domains) => {
        this.tick();
        if (i === slots.length) return true;
        for (const reading of slots[i].readings) {
          const next = {};
          let valid = true;
          for (const feature of group.features) {
            const equivalences = rule.equivalences?.[feature];
            if (!equivalences) throw Error(`Undefined unification feature: ${feature}`);
            const values = Object.entries(equivalences).filter(([,spec]) => this.fits(slots[i].row, reading, spec)).map(([type]) => type);
            next[feature] = domains[feature] ? values.filter(v => domains[feature].includes(v)) : values;
            if (!next[feature].length) { valid = false; break; }
          }
          if (valid && solve(i + 1, next)) return true;
        }
        return false;
      };
      const compatible = solve(0, {});
      return group.negate ? !compatible : compatible;
    }
    unifyAll(groups, captures, rule) {
      if (groups.some(g => g.negate && !this.unify(g, captures, rule))) return false;
      const positive = groups.filter(g => !g.negate);
      const indices = unique(positive.flatMap(g => g.tokens));
      const slots = indices.flatMap(i => captures[i].map(slot => ({...slot, part:i})));
      const solve = (index, domains) => {
        this.tick();
        if (index === slots.length) return true;
        const slot = slots[index];
        for (const reading of slot.readings) {
          const next = domains.map(d => ({...d})); let valid = true;
          for (let gi = 0; gi < positive.length; gi++) {
            const group = positive[gi]; if (!group.tokens.includes(slot.part)) continue;
            for (const feature of group.features) {
              const values = Object.entries(rule.equivalences[feature]).filter(([, spec]) => this.fits(slot.row, reading, spec)).map(([type]) => type);
              next[gi][feature] = next[gi][feature] ? values.filter(v => next[gi][feature].includes(v)) : values;
              if (!next[gi][feature].length) valid = false;
            }
          }
          if (valid && solve(index + 1, next)) return true;
        }
        return false;
      };
      return solve(0, positive.map(() => ({})));
    }
    match(rows, start, rule) {
      const originalRows=rows;
      if(rule.rawPos)rows=rows.map(row=>({...row,ltReadings:row.rawReadings||this.readings(row)}));
      const found = [];
      const sentence = rows[start]?.sentence;
      const walk = (part, cursor, captures) => {
        // Java selects the first complete match from a given starting token.
        // In particular, skip must not attach a second, more distant participle
        // after an earlier candidate already completed the same pattern.
        if(found.length)return;
        this.tick();
        if (part === rule.pattern.length) {
          if (this.unifyAll(rule.unify || [], captures, rule)) found.push({ captures:captures.map(c=>c.map(s=>({...s,row:originalRows[s.index]}))), start, end: cursor, rows:originalRows, marker:rule.marker });
          return;
        }
        for (const spec of this.branches(rule.pattern[part])) {
        const min = spec.min ?? 1, max = spec.max === -1 ? rows.length - cursor : spec.max ?? 1;
        const consumed = [];
        for (let count = 0; count <= max; count++) {
          if (count >= min) {
            const after = cursor + count;
            if (!count || part === rule.pattern.length - 1) walk(part + 1, after, [...captures, consumed.slice()]);
            else {
              const skip = spec.skip === -1 ? rows.length - after : spec.skip || 0;
              for (let gap = 0; gap <= skip; gap++) {
                if (gap && (rows[after + gap - 1]?.sentence !== sentence || /^[.!?]$/u.test(rows[after + gap - 1].token))) break;
                // scope=next vetoes the skipped region AND the next candidate.
                const exceptions = [spec,...(spec.conjuncts || [])].flatMap(s => s.exceptions || []).filter(e => e.scope === 'next');
                if ((spec.skip > 0 || spec.skip === -1) && rows[after + gap]?.sentence === sentence && exceptions.some(e => this.any(rows[after + gap], e))) break;
                walk(part + 1, after + gap, [...captures, consumed.slice()]);
              }
            }
          }
          if (count === max || rows[cursor + count]?.sentence !== sentence) break;
          const readings = this.candidates(rows, cursor + count, spec, captures,start);
          if (!readings.length) break;
          consumed.push({ row: rows[cursor + count], index: cursor + count, readings });
        }
        }
      };
      walk(0, start, []);
      return found;
    }
    captureText(capture, text) {
      return capture.length ? text.slice(capture[0].row.start, capture.at(-1).row.end) : '';
    }
    convertCase(value, mode, sample = '') {
      if (mode === 'alllower') return value.toLocaleLowerCase('ca');
      if (mode === 'allupper') return value.toLocaleUpperCase('ca');
      if (mode === 'firstupper') return upperFirst(value.toLocaleLowerCase('ca'));
      if (mode === 'startupper') return upperFirst(value);
      if (mode === 'firstlower' || mode === 'startlower') return value ? value[0].toLocaleLowerCase('ca') + value.slice(1) : value;
      if (mode === 'preserve' && /^\p{Lu}/u.test(sample)) return /^\p{Lu}+$/u.test(sample) ? value.toLocaleUpperCase('ca') : upperFirst(value);
      return value;
    }
    render(parts, match, text) {
      let alternatives = [''];
      let removedOptional=false;
      for (const part of parts || []) {
        let values;
        if (typeof part === 'string') values = [part.replace(/\\(\d+)/gu, (_, n) => this.captureText(match.captures[Number(n) - 1] || [], text)||'\u0001').replace(/ \u0001(?=[ ,:;.!?]|$)/gu,'').replace(/^\u0001 /u,'').replaceAll('\u0001','')];
        else {
          const cap = match.captures[part.no - 1] || [];
          if(!cap.length){removedOptional=true;continue;}
          const surface = this.captureText(cap, text);
          values = [surface];
          if (part.postag) {
            values = [];
            if(part.postag.startsWith('_spell_number_'))values=[globalThis.CorrectorLtCatalanFilters.spellNumber(surface,part.postag.includes('feminine'))];
            else {
              const readings=cap[0]?this.readings(cap[0].row):[],re=part.postagRegexp?this.re(part.postag):null;
              const tags=part.postagRegexp?readings.filter(r=>re.test(r.tag||'')).map(r=>r.tag):[];
              let targets=part.postag;
              if(part.postagReplace!=null){
                const priority=(a,b)=>{if(a==='VMIP2P00'&&b==='VMIS3S00')return 150;if(b==='VMIP2P00'&&a==='VMIS3S00')return -150;if(a.length>4&&b.length>4){if(a[2]==='I'&&b[2]!=='I')return 100;if(b[2]==='I'&&a[2]!=='I')return -100;if(a[4]==='3'&&b[4]==='1')return 50;if(b[4]==='3'&&a[4]==='1')return -50;}return 0;};
                const selected=part.literal&&tags.length?[tags.slice().sort(priority).at(-1)]:(tags.length?tags:[part.postag]);
                targets=selected.map(tag=>tag.replace(re||this.re(part.postag),part.postagReplace)).join('|');
              }
              else if(tags.length)targets=tags.at(-1);
              const lemmas=part.literal?[part.literal]:unique(readings.map(r=>r.lemma).filter(Boolean));
              for(const lemma of lemmas)values.push(...this.synthesize(lemma,targets,{regexp:!!part.postagRegexp}));
            }
          }
          if (part.regexpMatch) values = values.map(v => normal(v).replace(this.expression(part.regexpMatch,true,false,true), part.regexpReplace || ''));
          values = unique(values.map(v => this.convertCase(v, part.caseConversion, surface)));
          if (part.includeSkipped && part.includeSkipped !== 'none' && cap.length) {
            const next = match.captures.slice(part.no).flat()[0];
            let skipped = next ? text.slice(cap.at(-1).row.end, next.row.start).trimEnd() : '';
            if (part.includeSkipped === 'following') {skipped = skipped.trimStart();values=[''];}
            values = values.map(v => v + skipped);
          }
        }
        if(values.length===1&&values[0]===''){removedOptional=true;continue;}
        alternatives = alternatives.flatMap(a => values.map(b => { this.tick();if(removedOptional){if((!a||a.endsWith(' '))&&b.startsWith(' '))b=b.slice(1);else if(a.endsWith(' ')&&/^[,.;:!?]/u.test(b))a=a.slice(0,-1);}return a + b; }));
        removedOptional=false;
      }
      return unique(removedOptional?alternatives.map(s=>s.endsWith(' ')?s.slice(0,-1):s):alternatives);
    }
    filter(filter, match, suggestions, markerStart, text) {
      const args = Object.fromEntries(Object.entries(filter.args).map(([key,value]) => [key,String(value).replace(/\\(\d+)/gu,(_,n) => this.captureText(match.captures[Number(n)-1] || [],text))]));
      const resolve = value => {
        const first=match.captures.flat()[0], marked=match.captures.slice(markerStart).flat()[0];
        const index = String(value).startsWith('marker') ? marked.index + Number(String(value).slice(6) || 0) : first.index + Number(value) - 1;
        const row=match.rows[index];
        if (!row || index < first.index || index >= match.end) throw Error(`Filter reference unavailable: ${value}`);
        return {row,index,readings:this.readings(row)};
      };
      const marker = match.marker || {start:0,end:match.captures.length};
      const marked = match.captures.slice(marker.start,marker.end).flat();
      const from = marked[0].row.start, to = marked.at(-1).row.end, original = text.slice(from,to);
      if(filter.name in (globalThis.CorrectorLtCatalanFilters?.schemas||{})){
        if(!globalThis.CorrectorLtCatalanFilters.apply)throw Error('Catalan filter implementation unavailable');
        return globalThis.CorrectorLtCatalanFilters.apply(this,filter.name,{args,match,suggestions,resolve,marked,from,to,original,text});
      }
      if (filter.name === 'SynthesizeWithDAFilter'||filter.name === 'SynthesizeWithAnyDeterminerFilter') return this.determinerFilter(filter.name,args,match,resolve,suggestions,marked,text);
      if (filter.name === 'LocalCatalanRewriteFilter') return this.localRewrite(match,marked,text);
      if (filter.name === 'TextToNumberFilter') {const value=this.textToNumber(marked);return value==null?[]:[...suggestions,value];}
      if (filter.name === 'OblidarseSugestionsFilter') return this.oblidarseFilter(match,marked,suggestions,text);
      if (filter.name === 'RemoveSuggestionsFilter') return suggestions.filter(s => !this.re(args.removeSuggestionsRegexp).test(s));
      if (filter.name === 'DiacriticsCheckFilter') {
        const records=this.filterResources.confusionPairs?.[args.form.toLocaleLowerCase('ca')] || [];
        if(!records.some(r=>this.re(args.postag).test(r.tag)))return [];
        const patterns={MS:'NC[MC][SN]000|A..[MC][SN].|V.P..SM.',FS:'NC[FC][SN]000|A..[FC][SN].|V.P..SF.',MP:'NC[MC][PN]000|A..[MC][PN].|V.P..PM.',FP:'NC[FC][PN]000|A..[FC][PN].|V.P..PF.',CP:'NC[MFC][PN]000|A..[MFC][PN].|V.P..P..',CS:'NC[MFC][SN]000|A..[MFC][SN].|V.P..S..'};
        if(args.gendernumberFrom){
          const readings=resolve(args.gendernumberFrom).readings;
          const value=Object.keys(patterns).find(key=>readings.some(r=>this.re('[NAPD].+'+key+'.*|V.P..'+key[1]+(key[0]==='C'?'.':key[0])+'.').test(r.tag||'')));
          if(!value||!this.re(patterns[value]).test(records[0].tag))return [];
        }
        let replacement=records[0].replacement;
        if(!this.dictionary.lookup(replacement).length)return [];
        replacement=this.convertCase(replacement,'preserve',args.form);
        const accent=s=>s.normalize('NFD')!==s;
        const message=accent(replacement)&&!accent(args.form)?match.message:match.message.replace("s'escriu amb accent","s'escriu d'una altra manera");
        return {suggestions:suggestions.map(s=>s.replaceAll('{suggestion}',replacement).replaceAll('{Suggestion}',upperFirst(replacement)).replaceAll('{SUGGESTION}',replacement.toLocaleUpperCase('ca'))),message};
      }
      if(filter.name==='NewYearDateFilter'||filter.name==='DateCheckFilter')return this.dateFilter(filter.name,args,match,resolve,suggestions);
      if (filter.name === 'AdaptSuggestionsFilter') return suggestions.map(s => this.adaptSuggestion(s,original));
      if (filter.name === 'WhitespaceCheckFilter') return resolve(args.position).row.whitespaceBefore === args.whitespaceChar ? [] : suggestions;
      if (filter.name === 'ApostropheTypeFilter') return /’/u.test(resolve(args.wordFrom).row.token) === (args.hasTypographicalApostrophe.toLowerCase() === 'true') ? suggestions : [];
      if (filter.name === 'CheckPostagsInSuggestionFilter') return suggestions.filter(s => {
        const words=s.split(/\s+/u), tags=args.PostagsList.split(',');
        if (words.length!==tags.length) throw Error('Suggestion token/POS count mismatch');
        return words.every((word,i)=>this.dictionary.lookup(word).some(r=>this.re(tags[i]).test(r.tag)));
      });
      if (filter.name === 'ConvertToSentenceCaseFilter') {
        if(args.startFrom!=null&&args.startFrom!=='marker')throw Error('Unsupported sentence case start position');
        const values = marked.map(slot => {
          const lower = slot.row.token.toLocaleLowerCase('ca'), readings = this.readings(slot.row);
          if (readings.some(r=>!r.lemma || r.tag==='UNKNOWN')) return upperFirst(lower);
          if (readings.some(r=>r.lemma.split(' ')[0]===r.lemma.split(' ')[0].toLocaleLowerCase('ca'))) return lower;
          if (readings.some(r=>/^\p{Lu}/u.test(r.lemma))) return upperFirst(lower);
          return slot.row.token;
        });
        let first = false, replacement='';
        marked.forEach((slot,i)=>{
          let value=values[i];
          if (match.rows[slot.index+1]?.token==='.') { if(value.length===1)value=value.toLocaleUpperCase('ca');else if(value==='corp')value='Corp'; }
          if(!first&&!/^\p{P}+$/u.test(slot.row.token)&&slot.row.token){first=true;value=upperFirst(value);}
          if(i&&slot.row.whitespaceBefore)replacement+=' ';
          replacement+=value;
        });
        return replacement===original ? [] : [replacement];
      }
      if (filter.name === 'AddCommasFilter') {
        const first=marked[0], last=marked.at(-1), before=match.rows[first.index-1], after=match.rows[last.index+1];
        const punctuation=s=>!!s&&/^[\p{P}\p{S}]+$/u.test(s);
        const beforeOK=!before||before.sentence!==first.row.sentence||punctuation(before.token)||/^\p{Lu}/u.test(first.row.token);
        const afterOK=!!after&&punctuation(after.token)&&!(after.whitespaceBefore&&/^[«“"‘'„¿¡]$/u.test(after.token));
        if(beforeOK&&afterOK)return [];
        if(args.suggestSemicolon?.toLowerCase()==='true'&&before?.token===','&&!afterOK)return {start:before.start,end:to,suggestions:['; '+original+',',', '+original+',']};
        if(beforeOK)return {start:last.row.start,end:to,suggestions:[last.row.token+',']};
        const start=from-(first.row.whitespaceBefore?1:0);
        if(afterOK)return {start,end:first.row.end,suggestions:[', '+first.row.token]};
        return {start,end:to,suggestions:[', '+original+',']};
      }
      if (filter.name !== 'AdvancedSynthesizerFilter') throw Error(`Unsupported filter: ${filter.name}`);
      const lemmaSlot = resolve(args.lemmaFrom), tagSlot = resolve(args.postagFrom);
      const a = lemmaSlot.readings.find(r => this.re(args.lemmaSelect).test(r.tag || ''))||lemmaSlot.readings[0];
      const b = tagSlot.readings.find(r => this.re(args.postagSelect).test(r.tag || ''))||tagSlot.readings[0];
      if (!a || !b) return [];
      const newLemma=args.newLemma?.startsWith('_') ? this.filterResources.nounToVerb?.[a.lemma.toLocaleLowerCase('ca')] : args.newLemma || a.lemma;
      if(!newLemma)return [];
      let tag = b.tag;
      if (args.postagReplace != null) {
        const am = this.re(args.lemmaSelect).exec(a.tag), bm = this.re(args.postagSelect).exec(b.tag);
        tag = args.postagReplace;
        for (const [kind, groups] of [['a', am], ['b', bm]]) for (let i = 1; i < groups.length; i++) {
          if (groups[i] != null) tag = tag.replaceAll('\\' + kind + i, groups[i]);
        }
        if (/\\[ab]\d/u.test(tag)) throw Error('Undefined filter capture');
      }
      const forms = this.synthesize(newLemma, tag, { regexp: true });
      if (!forms.length) return suggestions.filter(s => !/\{suggestion\}/iu.test(s));
      const out = [];
      let placeholder = false;
      for (const suggestion of suggestions) for (const form of forms) {
        placeholder ||= /\{(?:suggestion|Suggestion|SUGGESTION)\}/u.test(suggestion);
        const value = this.convertCase(form,'preserve',lemmaSlot.row.token);
        out.push(suggestion.replaceAll('{suggestion}', value).replaceAll('{Suggestion}', upperFirst(value)).replaceAll('{SUGGESTION}', value.toLocaleUpperCase('ca')));
      }
      if (!placeholder) out.push(...forms);
      return unique(out.map(value=>this.adaptSuggestion(value,'')));
    }
    oblidarseFilter(match,marked,suggestions,text) {
      const rows=match.rows,start=marked[0].index;
      const pronoun=this.readings(rows[start+1]).find(r=>/^P/u.test(r.tag||''));
      const originalVerb=this.readings(rows[start+2]).find(r=>/^V/u.test(r.tag||''));
      if(!pronoun||!originalVerb)return [];
      const person=pronoun.tag[2]+pronoun.tag[4];
      let main=start+2;
      while(main<rows.length&&rows[main].sentence===rows[start].sentence&&!this.readings(rows[main]).some(r=>['oblidar','descuidar','passar'].includes(r.lemma)))main++;
      if(main>=rows.length||rows[main].sentence!==rows[start].sentence)return [];
      const lemma=originalVerb.lemma==='passar'?'descuidar':originalVerb.lemma;
      const forms=this.synthesize(lemma,originalVerb.tag.slice(0,4)+person+originalVerb.tag.slice(6),{regexp:false});
      if(!forms.length)return [];
      let verb=forms[0];
      for(let i=start+3;i<=main;i++)verb+=rows[i].whitespaceBefore+rows[i].token.replaceAll('passar','descuidar').replaceAll('passat','descuidat').replaceAll('passant','descuidant');
      const following=rows[main+1];
      let word=following&&this.readings(following).some(r=>/^(?:D|V.N|P[DI]|NC)/u.test(r.tag||''))?following.token:'';
      if(following&&['com','de',"d'",'que'].includes(following.token.toLowerCase()))word=following.token;
      const vowel=/^h?[aeiouàèéíòóú]/iu.test(verb),en=!word;
      const consonant=en?{'1S':"me'n ",'2S':"te'n ",'3S':"se'n ",'1P':'ens en ','2P':'us en ','3P':"se'n "}:{'1S':'em ','2S':'et ','3S':'es ','1P':'ens ','2P':'us ','3P':'es '};
      const vowels=en?{'1S':"me n'",'2S':"te n'",'3S':"se n'",'1P':"ens n'",'2P':"us n'",'3P':"se n'"}:{'1S':"m'",'2S':"t'",'3S':"s'",'1P':'ens ','2P':'us ','3P':"s'"};
      const prefix=(vowel?vowels:consonant)[person];if(prefix==null)return [];
      let value=prefix+verb,extra=0;
      if(['el','els'].includes(word.toLowerCase())){value+=' d'+word.toLowerCase();extra=word.length+1;}
      else if(word&&!['de',"d'",'que'].includes(word.toLowerCase())){const apostrophe=/^h?[aeiouàèéíòóú]/iu.test(word);value+=apostrophe?" d'":' de';extra=apostrophe?1:0;}
      return {start:rows[start].start,end:rows[main].end+extra,message:match.message.replaceAll('passar','descuidar'),suggestions:unique([this.convertCase(value,'preserve',rows[start].token),...suggestions.map(s=>this.adaptSuggestion(s+(extra===1?' ':''),rows[start].token))])};
    }
    determinerPrefix(form,genderNumber,preposition='') {
      const patterns=this.filterResources.apostrophePatterns;
      if(!patterns)throw Error('Missing apostrophation resources');
      genderNumber=genderNumber.replace(/^C/u,'M').replace(/N$/u,'S');
      const test=name=>this.re(patterns[name],false).test(form);
      const apostrophe=!test('pHacAspirada')&&(genderNumber==='MS'?test('pMascYes')&&!test('pMascNo'):genderNumber==='FS'?test('pFemYes')&&!test('pFemNo'):false);
      const article=apostrophe?"l'":({MS:'el ',FS:'la ',MP:'els ',FP:'les '})[genderNumber];
      const prep=preposition.slice(0,1).toLowerCase();
      if(!article)throw Error('Invalid determiner gender/number');
      if(!prep)return article;
      if(!['a','d','p'].includes(prep))throw Error('Unsupported determiner preposition');
      if(apostrophe)return ({a:'a ',d:'de ',p:'per '})[prep]+article;
      if(genderNumber[0]==='M')return ({a:'al',d:'del',p:'pel'})[prep]+(genderNumber[1]==='P'?'s ':' ');
      return ({a:'a ',d:'de ',p:'per '})[prep]+article;
    }
    determinerFilter(name,args,match,resolve,suggestions,marked,text) {
      const slot=name==='SynthesizeWithDAFilter'?resolve(args.lemmaFrom):marked[0];
      const row=slot.row,selected=this.readings(row).find(r=>this.re(args.lemmaSelect).test(r.tag||''));
      if(!selected)throw Error('No reading matching determiner lemmaSelect');
      let first=slot.index,prep='',determiner=null,between='';
      if(name==='SynthesizeWithAnyDeterminerFilter'){
        for(let i=slot.index-1;i>=0&&match.rows[i].sentence===row.sentence;i--){
          const previous=match.rows[i],reading=this.readings(previous).find(r=>/^D/u.test(r.tag||''));
          if(!determiner&&reading){determiner={row:previous,reading};first=i;if(!reading.tag.startsWith('DA'))break;continue;}
          if(/^[«“"‘„]$/u.test(previous.token)){between=previous.token;continue;}
          if(['a','de','per','pe'].includes(previous.token.toLowerCase())){prep=previous.token;first=i;}break;
        }
      }else if(args.prepositionFrom){prep=/^\d+$/u.test(args.prepositionFrom)?resolve(args.prepositionFrom).row.token:args.prepositionFrom;}
      const patterns={MS:'(N|A.).[MC][SN].*|V.P.*SM.',FS:'(N|A.).[FC][SN].*|V.P.*SF.',MP:'(N|A.).[MC][PN].*|V.P.*PM.',FP:'(N|A.).[FC][PN].*|V.P.*PF.'};
      const forms=this.synthesize(selected.lemma,args.lemmaSelect,{regexp:true});
      const candidates=[{form:row.token,tag:selected.tag}];
      for(const form of forms){
        if(args.synthAllForms?.toLowerCase()!=='true'&&form.toLowerCase()!==row.token.toLowerCase())continue;
        for(const reading of this.dictionary.lookup(form))if(reading.lemma===selected.lemma&&this.re(args.lemmaSelect).test(reading.tag)&&!candidates.some(c=>c.tag===reading.tag&&(name==='SynthesizeWithAnyDeterminerFilter'||c.form===form)))candidates.push({form,tag:reading.tag});
      }
      const out=[];
      for(const candidate of candidates)for(const [gn,regex]of Object.entries(patterns)){
        if(!this.re(regex).test(candidate.tag))continue;
        const form=this.convertCase(candidate.form,'preserve',row.token);
        const prefixes=determiner&&!determiner.reading.tag.startsWith('DA')?
          this.synthesize(determiner.reading.lemma,determiner.reading.tag.slice(0,2)+'.[C'+gn[0]+']'+gn[1]+'.',{regexp:true}).map(p=>p+' '):[this.determinerPrefix(candidate.form,gn,prep)];
        for(const prefix of prefixes){let value=(name==='SynthesizeWithDAFilter'?prefix:this.convertCase(prefix,'preserve',match.rows[first].token))+between+form;
          const beginning=name==='SynthesizeWithDAFilter'?marked[0].index:first;
          if(beginning===0||match.rows[beginning-1].sentenceStart||match.rows[beginning-1].sentence!==row.sentence)value=upperFirst(value);out.push(value);}
      }
      return name==='SynthesizeWithDAFilter'?unique([...suggestions,...out]):{start:match.rows[first].start,end:marked.at(-1).row.end,suggestions:unique(out)};
    }
    textToNumber(marked) {
      const names=['zero','un','dos','tres','quatre','cinc','sis','set','vuit','nou','deu','onze','dotze','tretze','catorze','quinze','setze','disset','divuit','dinou'];
      const numbers=Object.fromEntries(names.map((n,i)=>[n,i]));Object.assign(numbers,{u:1,una:1,dues:2,mig:0.5,vint:20,trenta:30,quaranta:40,cinquanta:50,seixanta:60,setanta:70,vuitanta:80,noranta:90});
      const multipliers={cent:100,cents:100,mil:1000,milió:1e6,milions:1e6,bilió:1e13,bilions:1e13,trilió:1e19,trilions:1e19};
      let total=0,current=0,decimal=0,zeros=0,inDecimal=false,percent=false;
      for(let i=0;i<marked.length;i++){
        const word=marked[i].row.token.toLowerCase();
        if(word==='cent'&&marked[i-1]?.row.token.toLowerCase()==='per'){percent=true;break;}
        if(['coma','comma'].includes(word)){inDecimal=true;continue;}
        for(const part of word.split('-')){
          if(part in numbers){if(inDecimal){decimal=Math.fround(decimal+numbers[part]/10**(zeros+String(numbers[part]).length));zeros++;}else current=Math.fround(current+numbers[part]);}
          else if(!inDecimal&&part in multipliers){total=Math.fround(total+Math.fround((current||1)*multipliers[part]));current=0;}
          else if(!['i','de','per'].includes(part))return null;
        }
      }
      const value=Math.fround(Math.fround(total+current)+decimal);
      let formatted=String(value);
      if(!Number.isInteger(value))for(let digits=1;digits<=9;digits++){const candidate=Number(value.toPrecision(digits));if(Math.fround(candidate)===value){formatted=String(candidate);break;}}
      return formatted.replace('.',',')+(percent?'\u202f%':'');
    }
    localRewrite(match,marked,text) {
      const rows=match.rows,first=marked[0],last=marked.at(-1),sentence=first.row.sentence;
      const same=rows.map((row,index)=>({row,index})).filter(s=>s.row.sentence===sentence);
      const finite=slots=>slots.flatMap(s=>this.readings(s.row).filter(r=>/^V.[IS][A-Z][123][SP]/u.test(r.tag||'')).map(reading=>({...s,reading}))).filter(s=>!s.reading.lemma?.startsWith('_'));
      const before=finite(same.filter(s=>s.index<first.index)),after=finite(same.filter(s=>s.index>last.index));
      const inf=marked.find(s=>this.readings(s.row).some(r=>/^V.N/u.test(r.tag||'')));
      const causal=/^(?:en|al|a\s+l)\s+no\b/iu.test(text.slice(first.row.start,last.row.end).replaceAll("'",''));
      const ger=causal?null:marked.find(s=>this.readings(s.row).some(r=>/^V.G/u.test(r.tag||'')));
      const root=causal?inf:ger;if(!root)return [];
      const reading=this.readings(root.row).find(r=>new RegExp(causal?'^V.N':'^V.G','u').test(r.tag||''));if(!reading?.lemma)return [];
      const controller=causal?(before.at(-1)||after[0]):before.at(-1);if(!controller)return [];
      const persons=unique(finite([controller]).map(s=>s.reading.tag.slice(4,6)));
      // Lexical ambiguity must not silently choose a person. Require a unique finite reading.
      if(persons.length!==1)return [];
      const person=persons[0],next=rows[controller.index+1],periphrastic=controller.reading.lemma==='anar'&&next&&this.readings(next).some(r=>/^V.N/u.test(r.tag||''));
      if(causal){
        const present=['IP','IF'].includes(controller.reading.tag.slice(2,4))&&!periphrastic;
        const participle=this.readings(rows[root.index+1]).filter(r=>/^V.P/u.test(r.tag||''));
        const agreement=reading.lemma==='venir'?unique(participle.map(r=>r.tag[5]).filter(n=>/[SP]/u.test(n))):[];
        const targets=agreement.length===1?['3'+agreement[0]]:unique(['3S',person]);
        const forms=targets.flatMap(p=>this.synthesize(reading.lemma,'V.[I]'+(present?'P':'I')+p+'.*',{regexp:true}));
        const prefix=before.length?'perquè no ':'com que no ';
        // Local rewrites follow the modern spelling already used by the extension.
        return {start:first.row.start,end:root.row.end,suggestions:unique(forms.map(f=>this.convertCase(prefix+(f==='vénen'?'venen':f),'preserve',text.slice(first.row.start,root.row.end))))};
      }
      const temporal=same.slice(same.findIndex(s=>s.index===root.index)+1,same.findIndex(s=>s.index===root.index)+13).map(s=>s.row.token.toLowerCase()).join(' ');
      const passive=['ser','ésser'].includes(reading.lemma)&&this.readings(rows[root.index+1]).some(r=>/^V.P/u.test(r.tag||''));
      const temporalCue=/(?:^|[^\p{L}])(?:després|posteriorment|endemà|següent|propera?|pròxima?|vinent)(?!\p{L})|més tard|cap d(?:e|['’])/u.test(temporal);
      const outcomeRelations={presentar:['aprovar','acceptar','rebutjar','denegar'],proposar:['aprovar','acceptar','rebutjar'],sol·licitar:['concedir','denegar','aprovar']};
      const main=this.readings(next).find(r=>/^V.N/u.test(r.tag||''))?.lemma||controller.reading.lemma;
      const outcome=this.readings(rows[root.index+1]).find(r=>/^V.P/u.test(r.tag||''))?.lemma;
      const originalPassivePattern=passive&&match.rule?.id==='GERUNDI_POSTERIORITAT_6'&&outcomeRelations[main]?.includes(outcome);
      if(!temporalCue&&!originalPassivePattern)return [];
      const preceding=rows[root.index-1];if(preceding?.token!==',')return [];
      const classes=this.filterResources.verbClasses?.[reading.lemma]||'';
      // An impersonal event clause has no overt subject to inherit. A following
      // determiner + noun supplies the new clause's subject and agreement.
      if(!passive&&controller.reading.lemma==='haver'&&/intr|abs/u.test(classes)&&!classes.includes('vtr')){
        const following=same.filter(s=>s.index>root.index&&!/^[.!?]$/u.test(s.row.token));
        const head=following.findIndex((s,i)=>!this.readings(following[i-1]?.row).some(r=>/^S/u.test(r.tag))&&!s.row.chunks?.includes('PTime')&&this.readings(s.row).some(r=>/^D/u.test(r.tag))&&this.readings(following[i+1]?.row).some(r=>/^NC/u.test(r.tag)));
        if(head<0)return [];
        const noun=following[head+1],numbers=unique(this.readings(noun.row).filter(r=>/^NC.[SP]/u.test(r.tag)).map(r=>r.tag[3]));if(numbers.length!==1)return [];
        let last=head+1;
        while(last+1<following.length&&!following[last+1].row.chunks?.includes('PTime')&&!/^\s+(?:al cap|després|posteriorment|més tard|l['’]endemà)/iu.test(text.slice(following[last].row.end))&&this.readings(following[last+1].row).some(r=>/^(?:A|N|SPS|DA)/u.test(r.tag)))last++;
        const subject=text.slice(following[head].row.start,following[last].row.end);
        const beforeTime=text.slice(root.row.end,following[head].row.start).trim(),afterTime=text.slice(following[last].row.end,following.at(-1).row.end).trim();
        if(!subject||/[,:;]/u.test(subject)||!temporalCue)return [];
        const conjugated=numbers[0]==='P'?'van '+reading.lemma:'va '+reading.lemma;
        return {start:preceding.start,end:following.at(-1).row.end,suggestions:[', i '+subject+' '+conjugated+(beforeTime?' '+beforeTime:'')+(afterTime?' '+afterTime:'')]};
      }
      if(!passive){
        // A following noun phrase may introduce a different subject ("morint els passatgers").
        // Leave this construction unresolved until subject attachment is available.
        const following=rows.slice(root.index+1,root.index+12);
        const boundary=following.findIndex(r=>/^[,.;!?]$/u.test(r.token));
        const prefix=boundary<0?following:following.slice(0,boundary);
        const transitiveObject=classes.includes('vtr');
        if(!transitiveObject&&prefix.some((r,i)=>!r.chunks?.includes('PTime')&&!this.readings(prefix[i-1]).some(x=>/^S/u.test(x.tag||''))&&this.readings(r).some(x=>/^D/u.test(x.tag||''))&&this.readings(prefix[i+1]).some(x=>/^NC/u.test(x.tag||''))))return [];
      }
      // Only rewrite an independent comma clause; progressive uses remain untouched.
      if(preceding?.token!==',')return [];
      let target=person;
      if(passive){const numbers=unique(this.readings(rows[root.index+1]).filter(r=>/^V.P/u.test(r.tag||'')).map(r=>r.tag[5]).filter(n=>/[SP]/u.test(n)));if(numbers.length!==1)return [];target='3'+numbers[0];}
      const auxiliaries={'1S':'vaig','2S':'vas','3S':'va','1P':'vam','2P':'vau','3P':'van'};
      let verb;
      if(periphrastic)verb=auxiliaries[target]+' '+(passive?'ser':reading.lemma);
      else {const tag=(passive?'VS':controller.reading.tag.slice(0,2))+controller.reading.tag.slice(2,4)+target+'.*';const forms=this.synthesize(passive?'ser':reading.lemma,tag,{regexp:true});if(forms.length!==1)return [];verb=forms[0];}
      let end=root.row.end,clitic=rows[root.index+1]?.token;
      if(/^-(?:se|la|lo|les|los)$/u.test(clitic||'')){end=rows[root.index+1].end;const pronoun={'-se':'es','-la':'la','-lo':'el','-les':'les','-los':'els'}[clitic];verb=pronoun+' '+verb;}
      return {start:preceding.start,end,suggestions:[' i '+verb]};
    }
    adaptSuggestion(value, original) {
      const boundary = '(?<![\\p{L}\\p{N}_])', end = '(?![\\p{L}\\p{N}_])';
      const replace=(pattern,replacement,flags='gu')=>{value=value.replace(new RegExp(boundary+pattern,flags),replacement);};
      const capitalized=/^\p{Lu}/u.test(value);
      value=value.replaceAll('gens traça','gens de traça').replaceAll('gens facilitat','gens de facilitat');
      replace('([Aa]|[DdPp]e)r? e(ls?)'+end,'$1$2');
      replace("([Dd])[' ]+(els?)"+end,'$1$2');
      replace("([LDNSTMldnstm]['’]) ",'$1');
      const consonant='([^1haeiouáàèéíòóúA-ZÀÈÉÍÒÓÚ“«"])';
      replace("([mtlsn])['’]"+consonant,'e$1 $2');
      if(!value.includes('en el')&&!value.includes('-se'))replace('e?([mtsldn])e? (h[aeio]|h?[aeiouàèéíòóú][a-zàèéíòóúïüç])',"$1'$2",'giu');
      replace('(l)a ([aeoàúèéí][^ ])',"$1'$2",'giu');
      replace("([mts]e) (['’])",'$1$2','giu');
      replace("s'e(ns|ls)"+end,"se'$1",'giu');
      replace('(de|a)l (h?[aeoàúèéí][^ ])',"$1 l'$2",'giu');
      replace("([MTLSN])['’]"+consonant,(_,a,b)=>'E'+a.toLowerCase()+' '+b);
      replace("([Dd])['’]"+consonant,'$1e $2');
      replace("(a|de|pe) (ls?)(?!['’])"+end,'$1$2','giu');
      if(capitalized)value=upperFirst(value);
      value=value.replaceAll(' ,',',');
      if(original&&original===original.toLocaleUpperCase('ca')&&/\p{L}/u.test(original))return value.toLocaleUpperCase('ca');
      return /^\p{Lu}/u.test(original)&&!/[\p{Lu}\p{Lt}]/u.test(original.slice(1))?upperFirst(value.toLocaleLowerCase('ca')):value;
    }
    dateFilter(name,args,match,resolve,suggestions) {
      // Date filters use logical capture references, corrected for optional tokens and skips.
      if(name==='DateCheckFilter')resolve=value=>{const slot=match.captures[Number(value)-1]?.[0];if(!slot)throw Error('Missing date capture '+value);return slot;};
      const months=['gen','febr','març','abr','maig','juny','jul','ag','set','oct','nov','des'];
      const monthNumber=s=>/^\d+$/u.test(s)?Number(s):months.findIndex(prefix=>s.toLocaleLowerCase('ca').startsWith(prefix))+1;
      const valid=(year,month,day)=>{const d=new Date(0);d.setUTCFullYear(year,month-1,day);d.setUTCHours(0,0,0,0);return d.getUTCFullYear()===year&&d.getUTCMonth()===month-1&&d.getUTCDate()===day?d:null;};
      const current=this.now(),currentYear=current.getFullYear();
      if(name==='NewYearDateFilter'){
        const year=Number(args.year),month=monthNumber(args.month.replaceAll('\u00ad','')),day=Number(args.day.match(/^\d+/u)?.[0]||0);
        if(!valid(year,month,day)||current.getMonth()!==0||month===12||year+1!==currentYear)return [];
        return {suggestions,message:match.message.replaceAll('{year}',String(year)).replaceAll('{realYear}',String(currentYear)),allowNoSuggestions:true};
      }
      const weekdays=['diumenge','dilluns','dimarts','dimecres','dijous','divendres','dissabte'],short=['dg','dl','dt','dc','dj','dv','ds'];
      const week=resolve(args.weekDay),weekText=week.row.token.replaceAll('\u00ad','').toLocaleLowerCase('ca');
      const expected=weekdays.includes(weekText)?weekdays.indexOf(weekText):short.indexOf(weekText);if(expected<0)return [];
      let daySlot,monthText,yearText,dayText,yearSlot;
      if(args.date&&Number(args.date)>-1){daySlot=resolve(args.date);[yearText,monthText,dayText]=daySlot.row.token.split('-');yearSlot=daySlot;}
      else{daySlot=resolve(args.day);dayText=daySlot.row.token;monthText=resolve(args.month).row.token;yearSlot=args.year&&Number(args.year)>-1?resolve(args.year):null;yearText=yearSlot?.row.token;}
      const day=Number(dayText.match(/^\d+/u)?.[0]||0),month=monthNumber(monthText),year=yearText==null?currentYear:Number(yearText);
      const date=valid(year,month,day);if(!date||date.getUTCDay()===expected)return [];
      if(yearSlot&&valid(currentYear,month,day)?.getUTCDay()===expected){return {start:yearSlot.row.start,end:yearSlot.row.end,suggestions:[args.date?currentYear+'-'+monthText+'-'+dayText:String(currentYear)],message:'Aquesta data no és correcta. ¿Us referiu a l\'any "'+currentYear+'"?'};}
      const start=Math.min(week.row.start,daySlot.row.start),end=Math.max(week.row.end,daySlot.row.end),original=this.text.slice(start,end);
      const replace=(slot,value)=>original.slice(0,slot.row.start-start)+value+original.slice(slot.row.end-start);
      const replacements=[replace(week,this.convertCase(weekdays[date.getUTCDay()],'preserve',week.row.token))];
      let corrected=null;
      for(let difference=1;difference<7&&corrected==null;difference++)for(const candidate of [day-difference,day+difference])if(candidate>0&&candidate<32&&valid(year,month,candidate)?.getUTCDay()===expected){corrected=candidate;break;}
      if(corrected!=null)replacements.push(replace(daySlot,args.date?yearText+'-'+monthText+'-'+corrected:String(corrected)));
      return {start,end,suggestions:replacements,message:match.message.replaceAll('{realDay}',weekdays[date.getUTCDay()]).replaceAll('{day}',weekdays[expected]).replaceAll('{currentYear}',String(currentYear))};
    }
    productiveReadings(word) {
      const lower=normal(word).toLocaleLowerCase('ca'),lookup=form=>this.dictionary.lookup(form,{lowercaseFallback:false});
      if(lower.endsWith('ment')&&lookup(lower.slice(0,-4)).some(r=>/^(?:VMP00SF.|A[QO].[FC]S.)$/u.test(r.tag)))return [{tag:'RG',lemma:lower}];
      const auto=lower.match(/^(auto)(.*[aeiouàéèíòóïü].+[aeiouàéèíòóïü].*)$/u);
      if(auto)return lookup(auto[2]).filter(r=>r.tag.startsWith('V')&&r.lemma!=='nòmer').map(r=>({...r,lemma:'auto'+r.lemma}));
      const prefixes=this.filterResources.adjectivePrefixes;
      const valid=stem=>prefixes&&!prefixes.NO_ALTRES_PREFIXOS.includes(stem+'o')&&(prefixes.ALTRES_PREFIXOS.includes(stem+'o')||lookup(stem+'a').some(r=>r.tag==='AQ0FS0'));
      for(const pattern of [/^(.*)o-(.*)$/u,/^(.*)o-(.*)o-(.*)$/u]){
        const match=lower.match(pattern);if(!match||!match.slice(1,-1).every(valid))continue;
        const reading=lookup(match.at(-1)).find(r=>r.tag.startsWith('A'));
        if(reading)return [{...reading,lemma:match.slice(1,-1).join('o-')+'o-'+reading.lemma}];
      }
      if(/[ŀĿ]/u.test(word))return lookup(lower.replaceAll('ŀ','l·'));
      return [];
    }
    tokenizeOriginal(text, tokenRows) {
      const profile=this.filterResources.tokenizer;if(!profile)return tokenRows;
      let source=text.replace(/[‐‑]/gu,'-').replaceAll('ʼ','’');
      const substitutions=[
        [/([aeiouàéèíóòúïüAEIOUÀÈÉÍÒÓÚÏÜ])l[.•⋅∙\uF0D7]l([aeiouàéèíóòúïü])/gu,'$1xxELA_GEMINADAxx$2'],
        [/([AEIOUÀÈÉÍÒÓÚÏÜ])L[.•⋅∙\uF0D7]L([AEIOUÀÈÉÍÒÓÚÏÜ])/gu,'$1xxELA_GEMINADA_UPPERCASExx$2'],
        [/([\p{L}])'([\p{L}"‘“«])/giu,'$1xxCA_APOS_RECTExx$2'],[/([dl])'(\d[\d\s.,]?)/giu,'$1xxCA_APOS_RECTExx$2'],
        [/([\p{L}])’([\p{L}"‘“«])/giu,'$1xxCA_APOS_RODOxx$2'],[/([dl])’(\d[\d\s.,]?)/giu,'$1xxCA_APOS_RODOxx$2'],
        [/(\d)\.(\d)/gu,'$1xxCA_DECIMALPOINTxx$2'],[/(\d),(\d)/gu,'$1xxCA_DECIMALCOMMAxx$2'],
        [/(\d{4}) /gu,'$1xxCA_SPACE0xx'],[/(\d) (\d\d\d) (\d\d\d)/gu,'$1xxCA_SPACExx$2xxCA_SPACExx$3'],[/(\d) (\d\d\d)/gu,'$1xxCA_SPACExx$2']
      ];
      for(const [pattern,value]of substitutions)source=source.replace(pattern,value);source=source.replaceAll('xxCA_SPACE0xx',' ');
      const restore={xxCA_APOS_RECTExx:"'",xxCA_APOS_RODOxx:'’',xxCA_HYPHENxx:'-',xxCA_DECIMALPOINTxx:'.',xxCA_DECIMALCOMMAxx:',',xxCA_SPACExx:' ',xxELA_GEMINADAxx:'l.l',xxELA_GEMINADA_UPPERCASExx:'L.L'};
      const pieces=[],known=word=>this.dictionary.lookup(normal(word).replaceAll('\u00AD','')).length>0||this.productiveReadings(word).length>0;
      const add=word=>{
        if(!word)return;
        if(!word.includes('-')&&!/['’]$/u.test(word)||known(word)||['mers-cov','mcgraw-hill','sars-cov-2','sars-cov','ph-metre','ph-metres'].includes(word.toLowerCase())||known(word.replaceAll('l-l','l·l'))){pieces.push(word);return;}
        if(/['’]$/u.test(word)&&word.length>1){add(word.slice(0,-1));pieces.push(word.slice(-1));return;}
        const proper=word.match(/^([\p{L}]+)(-)([Ll]['’])([\p{L}]+)$/u);if(proper){proper.slice(1).forEach(add);return;}
        word.split(/(-)/u).filter(Boolean).forEach(w=>pieces.push(w));
      };
      const regex=this.expression('['+profile.wordCharacters+']+|[^'+profile.wordCharacters+']',true,false,true);
      for(const token of source.match(regex)||[]){
        let value=token;for(const [key,replacement]of Object.entries(restore))value=value.replaceAll(key,replacement);
        if(value.length===1&&/[\uFE00-\uFE0F]/u.test(value)&&pieces.length){pieces[pieces.length-1]+=value;continue;}
        while(value.length>1&&value.startsWith('-')){pieces.push('-');value=value.slice(1);}
        let trailing=0;while(value.length>1&&value.endsWith('-')){value=value.slice(0,-1);trailing++;}
        let matched=false;
        if(/['’\-]/u.test(value))for(const pattern of profile.patterns){const match=this.re(pattern,false).exec(value);if(match){match.slice(1).filter(v=>v!=null).forEach(add);matched=true;break;}}
        else {const lower=value.toLowerCase(),cut=['al','als'].includes(lower)?1:['del','dels','pel','pels','can'].includes(lower)?2:0;if(cut){pieces.push(value.slice(0,cut),value.slice(cut));matched=true;}}
        if(!matched)add(value);while(trailing--)pieces.push('-');
      }
      const original=new Map(tokenRows.map(row=>[row.start+':'+row.end,row]));let offset=0;
      return pieces.flatMap(piece=>{
        const start=offset;offset+=piece.length;if(/^\s+$/u.test(piece))return [];
        const previous=original.get(start+':'+offset);if(previous)return [{...previous,token:text.slice(start,offset)}];
        const readings=[...this.dictionary.lookup(normal(piece)),...this.productiveReadings(piece)];return [{token:text.slice(start,offset),start,end:offset,analysis:{readings,lexical:readings.length>0}}];
      });
    }
    sentenceBoundaries(text) {
      if(!this.filterResources.sentenceRules?.length)return null;
      if(!this.srxRules)this.srxRules=this.filterResources.sentenceRules.map(rule=>({...rule,beforeRe:this.expression(rule.before+'$',true,false),afterRe:this.expression('^'+rule.after,true,false)}));
      const boundaries=[];let begin=0;
      for(let position=1;position<text.length;position++){
        if(!/[\s\u2029>]/u.test(text[position-1])&&!/[<\r\n]/u.test(text[position]))continue;
        const before=text.slice(begin,position),after=text.slice(position);
        const rule=this.srxRules.find(r=>r.beforeRe.test(before)&&r.afterRe.test(after));
        if(rule?.break){boundaries.push(position);begin=position;}
      }
      return boundaries;
    }
    run(text, tokenRows, rules, analysisOnly=false) {
      this.text=text;
      this.diagnostics = [];
      tokenRows=this.tokenizeOriginal(text,tokenRows);
      const boundaries=this.sentenceBoundaries(text);
      let sentence = 0;
      const expanded=this.filterResources.tokenizer?tokenRows:tokenRows.flatMap(row=>{
        const lower=row.token.toLowerCase(),cut=['al','als'].includes(lower)?1:['del','dels','pel','pels','can'].includes(lower)?2:0;
        if(!cut)return [row];
        return [row.token.slice(0,cut),row.token.slice(cut)].map((token,i)=>({token,start:row.start+(i?cut:0),end:i?row.end:row.start+cut,analysis:{readings:this.dictionary.lookup(token)}}));
      });
      const rows=[];
      expanded.forEach((row,i)=>{
        if(boundaries)sentence=boundaries.filter(position=>position<=row.start).length;
        const starts=!i||rows.at(-1)?.sentence!==sentence;
        if(starts)rows.push({token:'',start:row.start,end:row.start,sentence,whitespaceBefore:'',sentenceStart:true,analysis:{readings:[{lemma:null,tag:'SENT_START'}]}});
        const value={...row,sentence,whitespaceBefore:text.slice(i?expanded[i-1].end:0,row.start)};rows.push(value);
        // LT context starts with lexical tags, not the legacy suffix/case guesses.
        // The complete original analysis remains available on value.analysis.
        if(this.contextRules.length&&row.analysis?.lexical===false)value.ltReadings=[{tag:'UNKNOWN',lemma:null}];
        if(this.contextRules.length){
          const lower=normal(row.token).toLocaleLowerCase('ca'),exact=this.dictionary.lookup(row.token,{lowercaseFallback:false});
          const capitalized=row.token!==lower&&!/\p{Ll}.*\p{Lu}/u.test(row.token);
          const lexical=[...exact,...(capitalized?this.dictionary.lookup(lower,{lowercaseFallback:false}):[])];
          if(!lexical.length)lexical.push(...this.productiveReadings(row.token));
          if(lexical.length)value.ltReadings=lexical.filter((reading,j,list)=>list.findIndex(r=>r.tag===reading.tag&&r.lemma===reading.lemma)===j);
        }
        if(!boundaries&&/^[.!?]$/u.test(row.token))sentence++;
      });
      if(boundaries)rows.forEach((row,i)=>{if(!row.sentenceStart&&(!rows[i+1]||rows[i+1].sentence!==row.sentence)){row.ltReadings=[...this.readings(row),{tag:'SENT_END',lemma:null}];if(!rows[i+1]||/\r?\n\s*\r?\n/u.test(text.slice(row.end,rows[i+1].start)))row.ltReadings.push({tag:'PARA_END',lemma:null});}});
      if(this.filterResources.verbEndings)this.annotateIncorrectVerbs(rows);
      if(this.filterResources.multiwordTags)this.annotateMultiwords(rows);
      rows.forEach(row=>{row.rawReadings=this.readings(row).map(r=>({...r}));});
      if(this.contextRules.length)this.annotateContext(rows);
      else {
        if(this.posRules.length)this.annotatePos(rows);
        if(this.chunkRules.length)this.annotateChunks(rows);
      }
      if(analysisOnly)return rows;
      const output = [];
      for (const rule of rules) {
        this.steps = 0;
        const pending = [];
        try {
          this.validate(rule);
          if(rule.regexp){output.push(...this.runRegexp(text,rule,boundaries));continue;}
          const requiredChunks = new Set();
          const collect = spec => { if(spec.chunk)requiredChunks.add(spec.chunk); (spec.and || spec.or || []).forEach(collect); (spec.exceptions || []).forEach(collect); };
          [rule,...(rule.antipatterns || [])].forEach(p => p.pattern.forEach(collect));
          if (requiredChunks.size && !rows.some(r => r.chunks || r.analysis?.chunks)) throw Error('Missing LanguageTool chunk annotations: ' + [...requiredChunks].join(','));
          const antipatterns = [];
          for (const anti of rule.antipatterns || []) for (let i = 0; i < rows.length; i++) antipatterns.push(...this.match(rows, i, { ...anti, equivalences: rule.equivalences }));
          for (let i = 0; i < rows.length; i++) for (const match of this.match(rows, i, rule)) {
            const flat = match.captures.flat();
            if (!flat.length) continue;
            if (antipatterns.some(a => {const scope=(a.marker ? a.captures.slice(a.marker.start,a.marker.end) : a.captures).flat();return scope.length&&flat.some(f=>f.index>=scope[0].index&&f.index<=scope.at(-1).index);})) continue;
            const marker = rule.marker || { start: 0, end: rule.pattern.length };
            const marked = match.captures.slice(marker.start, marker.end).flat();
            if (!marked.length) continue;
            if(marked.some(s=>s.row.immunized))continue;
            let start = marked[0].row.start, end = marked.at(-1).row.end;
            let message = this.render(rule.message, match, text)[0] || 'Possible error gramatical.';
            match.message=message;
            match.rule=rule;
            let allowNoSuggestions=false;
            let suggestions = (rule.suggestions || []).flatMap(parts => this.render(parts, match, text));
            const firstSuggestion=rule.suggestions?.[0]?.[0];
            const explicitCase=(typeof firstSuggestion==='object'||typeof firstSuggestion==='string'&&/^\\\d/u.test(firstSuggestion))&&rule.suggestions.some(parts=>parts.some(part=>typeof part==='object'&&part.caseConversion&&part.caseConversion!=='preserve'));
            if(!explicitCase&&/^\p{Lu}/u.test(text.slice(start,end)))suggestions=suggestions.map(upperFirst);
            if (rule.filter) {
              const filtered=this.filter(rule.filter, match, suggestions, marker.start, text);
              if(Array.isArray(filtered))suggestions=filtered;
              else { suggestions=filtered.suggestions;start=filtered.start ?? start;end=filtered.end ?? end;message=filtered.message ?? message;allowNoSuggestions=!!filtered.allowNoSuggestions; }
            }
            const original = text.slice(start, end);
            suggestions = unique(suggestions).filter(s => typeof s==='string' && s !== original && !/\{(?:suggestion|Suggestion|SUGGESTION)\}/u.test(s));
            if (!suggestions.length&&!allowNoSuggestions) continue;
            const style=['TYPOGRAPHY_OPTIONS','PREFERABLE_EXPRESSIONS','STYLE_OPTIONAL'].includes(rule.category)||rule.filter?.name==='LocalCatalanRewriteFilter';
            pending.push({ ruleId: 'CA_LT_XML_' + rule.id, start, end, text: original, suggestions, message, category: rule.category, meta: { engine: 'lt-xml-v1', sourceRule: rule.id, qualityCategory: style?'style':'grammar', qualityRisk: style?'review':'safe' } });
          }
          const seen = new Set();
          for (const issue of pending) {if(pending.some(other=>other!==issue&&other.start<=issue.start&&other.end>=issue.end&&(other.start<issue.start||other.end>issue.end)))continue;const key = JSON.stringify([issue.start, issue.end, issue.suggestions]); if (!seen.has(key)) { seen.add(key); output.push(issue); } }
        } catch (error) {
          this.diagnostics.push({ ruleId: rule.id, error: String(error.message) });
        }
      }
      const repeated=new Map();
      for(const rule of rules.filter(r=>r.minPrevMatches)){
        const group=rule.repetitionGroup||rule.id;if(repeated.has(group))continue;
        const ids=new Set(rules.filter(r=>(r.repetitionGroup||r.id)===group).map(r=>'CA_LT_XML_'+r.id));
        const hits=output.filter(h=>ids.has(h.ruleId)).sort((a,b)=>a.start-b.start||b.end-a.end),seen=new Set(),positions=[];
        for(const hit of hits){
          const position=rows.filter(row=>!row.sentenceStart&&row.start<hit.start).length;
          const key=hit.start+':'+hit.end;if(seen.has(key)){hit.repetitionRejected=true;continue;}seen.add(key);
          const spec=rules.find(r=>'CA_LT_XML_'+r.id===hit.ruleId),minimum=spec.minPrevMatches;
          hit.repetitionRejected=positions.length<minimum||position-positions[positions.length-minimum]>=spec.distanceTokens;positions.push(position);
        }
        repeated.set(group,true);
      }
      return output.filter(hit=>!hit.repetitionRejected).map(hit=>{delete hit.repetitionRejected;return hit;});
    }
    runRegexp(text,rule,boundaries) {
      const base=this.expression(rule.regexp.source,rule.regexp.caseSensitive,false,true),regexp=new RegExp(base.source,base.flags+'d'),output=[];
      const limits=[0,...(boundaries||[]),text.length];
      for(let i=0;i<limits.length-1;i++){
        regexp.lastIndex=0;const segment=text.slice(limits[i],limits[i+1]);let match;
        while((match=regexp.exec(segment))){
          if(!match[0].length){regexp.lastIndex++;continue;}
          const range=match.indices[rule.regexp.mark];if(!range)throw Error('Invalid regexp capture marker');
          const render=parts=>parts.join('').replace(/\\(\d+)/gu,(_,n)=>match[Number(n)]||'');
          const start=limits[i]+range[0],end=limits[i]+range[1],suggestions=unique(rule.suggestions.map(render)).filter(s=>s!==text.slice(start,end));
          if(suggestions.length)output.push({ruleId:'CA_LT_XML_'+rule.id,start,end,text:text.slice(start,end),suggestions,message:render(rule.message),category:rule.category,meta:{engine:'lt-xml-v1',sourceRule:rule.id,sourceKind:'regexp',qualityCategory:'style',qualityRisk:'review'}});
        }
      }
      return output;
    }
    annotateMultiwords(rows) {
      if(!this.multiwordTrie){
        const entries=new Map(this.filterResources.multiwordTags.map(([form,tag])=>[normal(form),tag]));
        for(const [form,tag]of [...entries])for(const variant of [upperFirst(form),form.toLocaleUpperCase('ca')])if(!entries.has(variant))entries.set(variant,tag);
        const root={children:new Map()};
        for(const [form,tag]of entries){let node=root;for(const char of form){if(!node.children.has(char))node.children.set(char,{children:new Map()});node=node.children.get(char);}node.value={tag,lemma:form};}
        this.multiwordTrie=root;
      }
      for(let i=0;i<rows.length;i++){
        if(rows[i].sentenceStart)continue;
        let node=this.multiwordTrie,best=null;
        for(let j=i;j<rows.length&&j-i<20&&rows[j].sentence===rows[i].sentence;j++){
          const part=(j>i&&rows[j].whitespaceBefore?' ':'')+normal(rows[j].token);
          for(const char of part){node=node?.children.get(char);if(!node)break;}
          if(!node)break;if(node.value)best={...node.value,end:j};
        }
        if(!best)continue;
        if(best.end===i){
          if(best.tag==='NPCN000'&&this.readings(rows[i]).some(r=>r.tag&&r.tag!=='UNKNOWN'))continue;
          rows[i].ltReadings=[...this.readings(rows[i]),{tag:best.tag,lemma:best.lemma}];
        }else for(let j=i;j<=best.end;j++){
          const tag=j>i&&best.tag.startsWith('NC')?'AQ0'+best.tag.slice(2,4)+'0':best.tag;
          rows[j].ltReadings=[{tag,lemma:best.lemma},...this.readings(rows[j]).filter(r=>['SENT_END','PARA_END'].includes(r.tag))];
        }
      }
    }
    annotateContext(rows) {
      // Dictionary readings remain untouched; only this contextual view changes.
      rows.forEach(row=>{row.chunks=[...(row.chunks||row.analysis?.chunks||[])];});
      for(const contextualRule of this.contextRules){
        this.steps=0;
        try{
          const {action,contextFilter,...rule}=contextualRule;
          const matches=rows.flatMap((_,i)=>this.match(rows,i,rule));
          if(!matches.length)continue;
          const anti=(rule.antipatterns||[]).flatMap(p=>rows.flatMap((_,i)=>this.match(rows,i,{...p,equivalences:rule.equivalences})));
          for(const match of matches){
            const flat=match.captures.flat();
            if(contextFilter&&!contextFilter.positions.every((position,i)=>{
              const word=match.captures[position-1]?.[0]?.row.token;if(!word)return false;
              const tags=this.filterResources.englishPos?.[word]||this.filterResources.englishPos?.[word.toLowerCase()]||[];
              return contextFilter.postags?tags.some(tag=>this.re(contextFilter.postags[i]).test(tag)):tags.length>0;
            }))continue;
            if(anti.some(a=>(a.marker?a.captures.slice(a.marker.start,a.marker.end):a.captures).flat().some(s=>flat.some(f=>f.index===s.index))))continue;
            const marker=rule.marker||{start:0,end:match.captures.length},marked=match.captures.slice(marker.start,marker.end).flat();
            if(!marked.length)continue;
            if(action.words.length&&action.words.length!==marked.length)continue;
            const keep=(row,values,force=false)=>{if(values.length||force)row.ltReadings=[...(values.length?values:[{tag:'UNKNOWN',lemma:null}]),...this.readings(row).filter(r=>['SENT_END','PARA_END'].includes(r.tag)&&!values.some(v=>v.tag===r.tag))];};
            if(action.type==='addchunk'){marked.forEach((s,i)=>{const tag=action.words[i].tag;if(!s.row.chunks.includes(tag))s.row.chunks.push(tag);});continue;}
            if(action.type==='immunize'||action.type==='ignore_spelling'){marked.forEach(s=>{s.row[action.type==='immunize'?'immunized':'ignoreSpelling']=true;});continue;}
            if(action.type==='filterall'){
              match.captures.slice(marker.start,marker.end).forEach((capture,i)=>{const spec=rule.pattern[marker.start+i];if(spec.postag)capture.forEach(s=>keep(s.row,this.readings(s.row).filter(r=>spec.postagRegexp?this.re(spec.postag).test(r.tag||''):r.tag===spec.postag)));});continue;
            }
            if(action.type==='unify'){
              // Retain each reading only if it participates in a complete assignment.
              for(const s of marked){const values=s.readings.filter(r=>this.unifyAll(rule.unify||[],match.captures.map(c=>c.map(x=>x===s?{...x,readings:[r]}:x)),rule));keep(s.row,values);}continue;
            }
            if(action.words.length){
              marked.forEach((s,i)=>{const w=action.words[i],current=this.readings(s.row),value={tag:w.tag||null,lemma:w.lemma??(w.token||s.row.token)};
                if(action.type==='remove')keep(s.row,current.filter(r=>!(w.tag==null||r.tag===w.tag)||!(w.lemma==null||r.lemma===w.lemma)),true);
                else if(action.type==='add')keep(s.row,current.some(r=>r.tag===value.tag&&r.lemma===value.lemma)?current:[...current.filter(r=>r.tag!=='UNKNOWN'),value]);
                else keep(s.row,[value]);
              });continue;
            }
            const row=marked[0].row,current=this.readings(row),m=action.match;
            if(action.type==='remove'){keep(row,current.filter(r=>!this.re(action.postag).test(r.tag||'')),true);continue;}
            if(m){
              let values=m.postag?current.filter(r=>m.postagRegexp?this.re(m.postag).test(r.tag||''):r.tag===m.postag):current;
              if(!values.length&&m.postag&&!m.postagRegexp)values=[{lemma:current[0]?.lemma,tag:m.postag}];
              if(m.postagReplace)values=values.map(r=>({...r,tag:r.tag.replace(this.re(m.postag),m.postagReplace)}));
              if(m.literal)values=values.map(r=>({...r,lemma:m.literal}));keep(row,values);continue;
            }
            if(action.type==='filter'){keep(row,current.filter(r=>this.re(action.postag).test(r.tag||'')));continue;}
            keep(row,[{tag:action.postag||null,lemma:current.find(r=>r.tag===action.postag)?.lemma??current[0]?.lemma}]);
          }
        }catch(error){this.diagnostics.push({ruleId:contextualRule.id,phase:'context',error:error.message});}
      }
    }
    annotatePos(rows) {
      for(const rule of this.posRules){
        this.steps=0;
        try{
          const anti=(rule.antipatterns||[]).flatMap(p=>rows.flatMap((_,i)=>this.match(rows,i,{...p,equivalences:rule.equivalences})));
          const updates=[];
          for(const match of rows.flatMap((_,i)=>this.match(rows,i,rule))){
            const flat=match.captures.flat();
            if(anti.some(a=>(a.marker?a.captures.slice(a.marker.start,a.marker.end):a.captures).flat().some(s=>flat.some(f=>f.index===s.index))))continue;
            const marker=rule.marker||{start:0,end:match.captures.length};
            match.captures.slice(marker.start,marker.end).forEach((capture,i)=>capture.forEach(slot=>updates.push([slot.row,rule.annotation[i]])));
          }
          for(const [row,tag]of updates)if(!this.readings(row).some(r=>r.tag===tag))row.ltReadings=[...this.readings(row),{lemma:row.token,tag}];
        }catch(error){this.diagnostics.push({ruleId:rule.id,phase:'pos',error:error.message});}
      }
    }
    annotateChunks(rows) {
      rows.forEach(row=>{row.chunks=[...(row.chunks||row.analysis?.chunks||[])];});
      for(const annotationRule of this.chunkRules){
        this.steps=0;
        try{
          const antiMatches=(annotationRule.antipatterns||[]).flatMap(anti=>rows.flatMap((_,i)=>this.match(rows,i,{...anti,equivalences:annotationRule.equivalences})));
          const matches=rows.flatMap((_,i)=>this.match(rows,i,annotationRule));
          const updates=[];
          for(const match of matches){
            const flat=match.captures.flat();
            if(antiMatches.some(a=>(a.marker?a.captures.slice(a.marker.start,a.marker.end):a.captures).flat().some(s=>flat.some(f=>s.index===f.index))))continue;
            const marker=annotationRule.marker||{start:0,end:match.captures.length};
            match.captures.slice(marker.start,marker.end).forEach((capture,i)=>capture.forEach(slot=>updates.push([slot.row,annotationRule.annotation[i]])));
          }
          for(const [row,chunk]of updates)if(!row.chunks.includes(chunk))row.chunks.push(chunk);
        }catch(error){this.diagnostics.push({ruleId:annotationRule.id,phase:'chunk',error:error.message});}
      }
    }
    annotateIncorrectVerbs(rows) {
      const {verbEndings,wrongVerbs}=this.filterResources, wrong=new Set(wrongVerbs);
      for(const row of rows){
        if(this.dictionary.lookup(row.token).length)continue;
        const lower=normal(row.token).toLocaleLowerCase('ca');let readings=[];
        if(lower.startsWith('en')){
          readings=this.dictionary.lookup(lower.slice(2)).filter(r=>r.tag.startsWith('V')&&['enfotre','enriure'].includes('en'+r.lemma)).map(r=>({...r,lemma:'en'+r.lemma}));
        }
        for(const prefix of ['(.+?)','(.+)']){
          if(readings.length)break;
          const match=this.re(prefix+'('+verbEndings+')',false).exec(lower);if(!match)continue;
          const base=match[1];let ending=match[2],adjusted=base;
          if(/^[eéiï]/u.test(ending)){
            for(const [suffix,replacement]of [['gü','gu'],['gu','g'],['qu','c'],['c','ç'],['g','j']])if(base.endsWith(suffix)){adjusted=base.slice(0,-suffix.length)+replacement;break;}
          }
          if(ending.startsWith('ï'))ending='i'+ending.slice(1);
          const candidates=[[adjusted+'ar','cant'+ending]];
          for(const lex of unique([base,adjusted])){candidates.push([lex+'ir','serv'+ending]);if(lex.endsWith('g'))candidates.push([lex+'uir','serv'+ending]);}
          candidates.push([base+'èixer','con'+ending],[base+'èixer','desmer'+ending]);
          for(const [lemma,sample]of candidates){if(!wrong.has(lemma))continue;readings=this.dictionary.lookup(sample).filter(r=>r.tag.startsWith('V')).map(r=>({...r,lemma}));if(readings.length)break;}
        }
        if(readings.length){row.ltReadings=readings;row.chunks=unique([...(row.chunks||[]),'_incorrect_verb_']);}
      }
    }
  }
  globalThis.CorrectorLtPatternRuntime = LtPatternRuntime;
})();
