/* French FindSuggestionsFilter adapter based on LanguageTool's LGPL filter.
 * This is proof-ZIP-only and intentionally uses the locally loaded Morfologik
 * speller, French morphology and synthesizer; it does not enable a UI profile.
 */
(() => {
  'use strict';
  const MAX = 10;
  const ENDS_IN_VOWEL = /[aeioué]$/u;
  const CLEAN_PREFIX = /^[smntl]'|^(nous|vous|le|la|les|me|te|se|leur|en|y) /u;
  const unique = values => [...new Set(values)];
  const upperFirst = value => value ? value.replace(/\p{L}/u, char => char.toLocaleUpperCase('fr')) : value;
  const suggestionCaches = new WeakMap();

  function makeWrong(word) {
    const replacements = [['a','ä'],['e','ë'],['i','ï'],['o','ö'],['u','ù'],['á','ä'],['é','ë'],['í','ï'],['ó','ö'],['ú','ù'],['à','ä'],['è','ë'],['ì','i'],['ò','ö'],['ï','ì'],['ü','ù']];
    for (const [from,to] of replacements) if (word.includes(from)) return word.replaceAll(from,to);
    return word + '-';
  }
  function levenshteinDamerau(a,b) {
    const x=[...a],y=[...b],d=Array.from({length:x.length+1},(_,i)=>Array(y.length+1).fill(0));
    for(let i=0;i<=x.length;i++)d[i][0]=i;
    for(let j=0;j<=y.length;j++)d[0][j]=j;
    for(let i=1;i<=x.length;i++)for(let j=1;j<=y.length;j++){
      const cost=x[i-1]===y[j-1]?0:1;
      d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+cost);
      if(i>1&&j>1&&x[i-1]===y[j-2]&&x[i-2]===y[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);
    }
    return d[x.length][y.length];
  }
  function apply(runtime,{args,match,suggestions,markerStart,text}) {
    if(!args.wordFrom||!args.desiredPostag)throw Error('FindSuggestionsFilter requires wordFrom and desiredPostag');
    const capture=match.captures.flat();
    const marker=match.marker||{start:0,end:match.captures.length};
    const marked=match.captures.slice(marker.start,marker.end).flat();
    if(!capture.length||!marked.length)return [];
    let token, tagged=false;
    if(args.wordFrom==='inmarker'){
      token=text.slice(marked[0].row.start,marked.at(-1).row.end).replaceAll(' ','');
    } else {
      let slot;
      if(/^marker(?:-?\d+)?$/u.test(args.wordFrom)){
        const offset=Number(args.wordFrom.slice(6))||0;
        slot=marked[offset];
      } else {
        const position=Number(args.wordFrom);
        if(!Number.isInteger(position)||position<1)throw Error(`Invalid FindSuggestionsFilter wordFrom: ${args.wordFrom}`);
        slot=match.captures[position-1]?.[0];
      }
      if(!slot)throw Error(`FindSuggestionsFilter wordFrom is outside the matched tokens: ${args.wordFrom}`);
      token=slot.row.token;
      tagged=runtime.readings(slot.row).some(reading=>reading.tag&&reading.tag!=='UNKNOWN');
    }
    const dictionary=runtime.dictionary,speller=runtime.filterResources.speller;
    if(!dictionary?.tagWord||!dictionary?.synthesize||!speller?.suggest)throw Error('French FindSuggestionsFilter requires French morphology, synthesis and local spelling resources');
    const mode=(args.Mode||'')==='diacritics';
    const originalTagged=dictionary.tagWord(token).readings;
    if(mode&&originalTagged.some(reading=>runtime.re(args.desiredPostag).test(reading.tag||'')))return null;
    const query=tagged?makeWrong(token):token;
    const words=[query];
    if(query.endsWith('s'))words.push(query.slice(0,-1));
    if(ENDS_IN_VOWEL.test(query))words.push(query+'s');
    let cache=suggestionCaches.get(speller);if(!cache){cache=new Map();suggestionCaches.set(speller,cache);}
    const cacheKey=`${tagged?'tagged':'plain'}\0${query}`;
    let spellingSuggestions=cache.get(cacheKey);
    if(!spellingSuggestions){spellingSuggestions=unique(words.flatMap(word=>speller.suggest(word,10)));if(cache.size>=10000)cache.delete(cache.keys().next().value);cache.set(cacheKey,spellingSuggestions);}
    // AbstractFindSuggestionsFilter compiles this regexp with UNICODE_CASE
    // only, then calls Matcher.matches(): full-string and case-sensitive.
    const removeRegexp=args.removeSuggestionsRegexp??args.RemoveSuggestionsRegexp;
    const removePattern=removeRegexp?runtime.expression(removeRegexp,true,true):null;
    const allUpper=token===token.toLocaleUpperCase('fr')&&/\p{L}/u.test(token);
    const capitalized=/^\p{Lu}/u.test(token);
    const replacements=[],synthesized=[],usedLemmas=new Set();
    let priorityPosition=0;
    const prepareCase=value=>allUpper?value.toLocaleUpperCase('fr'):capitalized?upperFirst(value):value;
    for(const suggestion of spellingSuggestions){
      const clean=suggestion.replace(CLEAN_PREFIX,'').split(' ')[0];
      const readings=dictionary.tagWord(clean).readings;
      for(const reading of readings){
        if(!reading.tag||reading.tag==='UNKNOWN')continue;
        let used=false;
        if(suggestion!==token&&runtime.re(args.desiredPostag).test(reading.tag)
          &&!replacements.includes(suggestion)&&!replacements.includes(suggestion.toLocaleLowerCase('fr'))
          &&(!mode||suggestion.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('fr')===token.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('fr'))
          &&(!removePattern||!removePattern.test(suggestion))){
          const replacement=prepareCase(suggestion);
          if(args.priorityPostag&&runtime.re(args.priorityPostag).test(reading.tag))replacements.splice(priorityPosition++,0,replacement);
          else replacements.push(replacement);
          used=true;
        }
        if(!used){
          if(!reading.lemma||usedLemmas.has(reading.lemma))continue;
          usedLemmas.add(reading.lemma);
          for(const value of dictionary.synthesize(reading.lemma,args.desiredPostag,true)||[]){
            const replacement=prepareCase(value);
            if(!removePattern||!removePattern.test(value))synthesized.push(replacement);
          }
        }
        if(replacements.length>=2*MAX)break;
      }
      if(replacements.length>=2*MAX)break;
    }
    let generated=replacements;
    if(!generated.length)generated=unique(synthesized).sort((a,b)=>{
      const da=levenshteinDamerau(token,a),db=levenshteinDamerau(token,b);
      return (da>4?8:da)-(db>4?8:db);
    });
    const finished=suggestions.filter(value=>!/(?:\{suggestion\}|\{Suggestion\}|\{SUGGESTION\})/u.test(value));
    const output=[];
    let usedTemplate=false;
    for(const template of suggestions){
      const marker=template.includes('{suggestion}')?'{suggestion}':template.includes('{Suggestion}')?'{Suggestion}':template.includes('{SUGGESTION}')?'{SUGGESTION}':null;
      if(!marker){if(!output.includes(template))output.push(template);continue;}
      usedTemplate=true;
      for(const replacement of generated){
        if(output.length>=MAX)break;
        const value=marker==='{suggestion}'?replacement:marker==='{Suggestion}'?template.replace(marker,upperFirst(replacement)):template.replace(marker,replacement.toLocaleUpperCase('fr'));
        if(!output.includes(value))output.push(value);
      }
    }
    if(!usedTemplate&&!replacements.length){
      for(const replacement of generated){if(output.length>=MAX)break;if(!output.includes(replacement))output.push(replacement);}
    } else if(!usedTemplate){
      for(const replacement of replacements){if(output.length>=MAX)break;if(!output.includes(replacement))output.push(replacement);}
    }
    const errorText=text.slice(marked[0].row.start,marked.at(-1).row.end);
    const final=unique(output).filter(value=>value!==errorText);
    if(mode&&!final.length&&!finished.length)return null;
    if(!final.length&&String(args.suppressMatch||'false').toLowerCase()==='true'&&!finished.length)return null;
    return {suggestions:final,allowNoSuggestions:true};
  }
  globalThis.CorrectorFrenchFindSuggestionsFilter=Object.freeze({apply});
})();
