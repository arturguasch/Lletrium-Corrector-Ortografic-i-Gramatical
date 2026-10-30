/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Local port of Morfologik 2.2.0 Speller/HMatrix, using the original FSA arc order.
 * Upstream sources are preserved in analysis/reference-oracle/src/Speller.java.
 * This API is for FindSuggestionsFilter; public spelling remains gated. */
(() => {
  "use strict";
  let offsets,arcs,metadata,promise,baseGraph,overlayGraph,multitokenGraph,activeGraph='base';
  const prohibitedWords=new Set();
  const decoder=new TextDecoder('utf-8',{fatal:true}),encoder=new TextEncoder();
  const charCache=new Map(),frequencyCache=new Map(),suggestionCache=new Map();
  // The edit-distance walk compares the same small alphabet at every FSA
  // branch. Cache Unicode decomposition, never candidate acceptance or order.
  const equivalenceForms=new Map();
  // Direction matters: metadata can declare asymmetric equivalences.
  const equivalencePairs=new Map();
  let equivalencePairCount=0;
  function equivalenceForm(char){
    if(equivalenceForms.has(char))return equivalenceForms.get(char);
    const base=char.normalize('NFD')[0];
    const value={base,lower:base.toLowerCase(),letter:/\p{L}/u.test(base)};
    if(equivalenceForms.size>=512)equivalenceForms.clear();
    equivalenceForms.set(char,value);return value;
  }
  const one=new Map(),two=new Map(),rest=new Map();
  async function load(){if(!promise)promise=(async()=>{
    const [graphResponse,overlayResponse,multitokenResponse,metaResponse,multitokenMetaResponse]=await Promise.all(['ca-speller-graph.bin.gz','ca-spelling-overlay-graph.bin.gz','ca-speller-multitoken-graph.bin.gz','ca-speller-metadata.json','ca-speller-multitoken-metadata.json'].map(name=>fetch(chrome.runtime.getURL('build/resources/'+name))));
    if(!graphResponse.ok||!overlayResponse.ok||!multitokenResponse.ok||!metaResponse.ok||!multitokenMetaResponse.ok)throw new Error('Cannot load Morfologik graphs');
    metadata=await metaResponse.json();prohibitedWords.clear();for(const word of metadata.prohibitedWords||[])prohibitedWords.add(word);
    const multitokenMetadata=await multitokenMetaResponse.json();
    async function readGraph(response,expectedHash){
      const raw=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',raw)),b=>b.toString(16).padStart(2,'0')).join('');
      if(hash!==expectedHash)throw new Error('Invalid Morfologik graph hash');
      const ints=new Uint32Array(raw);if(ints[0]!==0x53414643||raw.byteLength!==12+(ints[1]+1)*4+ints[2]*12)throw new Error('Invalid graph ranges');
      return {offsets:ints.subarray(3,4+ints[1]),arcs:ints.subarray(4+ints[1]),nodes:ints[1],arcCount:ints[2]};
    }
    baseGraph=await readGraph(graphResponse,metadata.graphSha256);
    overlayGraph=await readGraph(overlayResponse,metadata.spellingOverlayGraphSha256);
    multitokenGraph=await readGraph(multitokenResponse,multitokenMetadata.graphSha256);
    offsets=baseGraph.offsets;arcs=baseGraph.arcs;
    for(const [key,values] of Object.entries(metadata.replacementPairs))for(const target of values){
      if(target.length<=2){const map=target.length===1?one:two;(map.get(target)||map.set(target,[]).get(target)).push({source:key.replace(/^\^|\$$/gu,''),start:key.startsWith('^'),end:key.endsWith('$')});}
      else(rest.get(key)||rest.set(key,[]).get(key)).push(target);
    }return {nodes:baseGraph.nodes,arcs:baseGraph.arcCount,overlayNodes:overlayGraph.nodes,overlayArcs:overlayGraph.arcCount,multitokenNodes:multitokenGraph.nodes,multitokenArcs:multitokenGraph.arcCount};
  })();return promise;}
  function inGraph(source,callback){
    const selected=source==='overlay'?overlayGraph:source==='multitoken'?multitokenGraph:baseGraph;
    if(!selected)throw new Error('Morfologik graph is not loaded');
    const previous={offsets,arcs,activeGraph};
    offsets=selected.offsets;arcs=selected.arcs;activeGraph=source;
    try{return callback();}finally{offsets=previous.offsets;arcs=previous.arcs;activeGraph=previous.activeGraph;}
  }
  function getArc(node,label){for(let a=offsets[node];a<offsets[node+1];a++)if(arcs[a*3]===label)return a;return -1;}
  function next(a){return arcs[a*3+2];}
  function terminal(a){return Boolean(arcs[a*3+1]&2);}
  function final(a){return Boolean(arcs[a*3+1]&1);}
  function exact(word){const lookupWord=activeGraph==='multitoken'?String(word).replace(/[\p{Zs}]+/gu,' ').replaceAll(' ','_'):String(word);const bytes=encoder.encode(lookupWord);let node=0,last=-1;for(let index=0;index<bytes.length;index++){const label=bytes[index];last=getArc(node,label);if(last<0)return false;if(terminal(last)){node=-1;}else node=next(last);if(node<0&&index!==bytes.length-1)return false;}return last>=0&&(final(last)||node>=0&&getArc(node,metadata.separator)>=0);}
  function isAllUppercase(value){return !/[\p{L}]/u.test(value)||![...value].some(char=>/\p{L}/u.test(char)&&/\p{Lowercase}/u.test(char));}
  function isNotAllLowercase(value){return [...value].some(char=>/\p{L}/u.test(char)&&/\p{Uppercase}/u.test(char));}
  function isNotCapitalizedWord(value){
    const chars=[...value];if(chars.length&&/[\p{Uppercase}]/u.test(chars[0]))return chars.slice(1).some(char=>/\p{L}/u.test(char)&&/\p{Uppercase}/u.test(char));
    return true;
  }
  function isMixedCase(value){return !isAllUppercase(value)&&isNotCapitalizedWord(value)&&isNotAllLowercase(value);}
  function isAlphabetic(value){return [...value].length!==1||/[\p{L}\p{Nl}]/u.test(value);}
  function isInDictionary(value,additionalLookup){return exact(value)||Boolean(additionalLookup&&additionalLookup(value));}
  function isProhibited(word){return prohibitedWords.has(String(word));}
  const legacyDiacritics=new Map([
    ["contrapèl","contrapel"],["Contrapèl","Contrapel"],["vés","ves"],["féu","feu"],
    ["desféu","desfeu"],["adéu","adeu"],["dóna","dona"],["dónes","dones"],
    ["sóc","soc"],["vénen","venen"],["véns","véns"],["fóra","fora"],
    ["Vés","Ves"],["Féu","Feu"],["Desféu","Desfeu"],["Adéu","Adeu"],
    ["Dóna","Dona"],["Dónes","Dones"],["Sóc","Soc"],["Vénen","Venen"],
    ["Véns","Vens"],["Fóra","Fora"]
  ]);
  function normalizeLegacyDiacritics(suggestions,{preferGeneralAccent=true}={}){
    const seen=new Set(),result=[];
    for(const suggestion of suggestions){
      const generalAccentVariant=suggestion.replace(/é/gu,'è').replace(/É/gu,'È');
      if(preferGeneralAccent&&suggestion.toLocaleLowerCase('ca')!=='després'&&generalAccentVariant!==suggestion&&suggestions.includes(generalAccentVariant))continue;
      const value=legacyDiacritics.get(suggestion)||suggestion;
      if(!seen.has(value)){seen.add(value);result.push(value);}
    }
    return result;
  }
  function isMisspelled(word,additionalLookup=null){
    if(!offsets||!word)return true;
    let value=word;for(const [from,to] of Object.entries(metadata.inputConversion||{}))value=value.replaceAll(from,to);
    const flags=metadata.spellerFlags||{};
    if(!value.length)return true;
    // Mirrors Morfologik 2.2.0 Speller.isMisspelled: punctuation policy,
    // numeric/camel-case exemptions, direct FSA lookup, then locale case
    // conversion only for non-mixed-case forms.
    if(flags.ignorePunctuation&&!isAlphabetic(value))return false;
    if(flags.ignoreNumbers&&/\p{Nd}/u.test(value))return false;
    if(flags.ignoreCamelCase&&value.length>0&&!isAllUppercase(value)&&isNotCapitalizedWord(value)
      &&/[\p{Uppercase}]/u.test([...value][0])&&(![...value][1]||/[\p{Lowercase}]/u.test([...value][1]))&&isNotAllLowercase(value))return false;
    if(flags.ignoreAllUppercase&&isAlphabetic(value)&&isAllUppercase(value))return false;
    if(isInDictionary(value,additionalLookup))return false;
    if(!flags.convertCase||isMixedCase(value))return true;
    if(isInDictionary(value.toLocaleLowerCase("ca"),additionalLookup))return false;
    if(isAllUppercase(value)&&isInDictionary([...value][0]+[...value].slice(1).join("").toLocaleLowerCase("ca"),additionalLookup))return false;
    return true;
  }
  function frequency(node){const cacheKey=`${activeGraph}:${node}`;if(frequencyCache.has(cacheKey))return frequencyCache.get(cacheKey);let result=0,a=getArc(node,metadata.separator);
    if(a>=0&&!final(a)&&!terminal(a)){let n=next(a);while(n>=0){a=offsets[n];if(a>=offsets[n+1])break;if(final(a)){result=arcs[a*3]-65;break;}if(terminal(a))break;n=next(a);}}
    frequencyCache.set(cacheKey,result);return result;}
  function getFrequencyActive(original){
    if(!offsets||!original)return 0;
    let word=String(original);for(const [from,to] of Object.entries(metadata.inputConversion||{}))word=word.replaceAll(from,to);
    const forms=[word,word.toLocaleLowerCase("ca")];
    for(const form of new Set(forms)){
      let node=0,valid=true;const bytes=encoder.encode(form);
      for(let index=0;index<bytes.length;index++){
        const arc=getArc(node,bytes[index]);if(arc<0){valid=false;break;}
        if(terminal(arc)){node=-1;if(index!==bytes.length-1)valid=false;}
        else node=next(arc);
        if(!valid)break;
      }
      if(valid&&node>=0&&getArc(node,metadata.separator)>=0)return frequency(node);
    }
    return 0;
  }
  function getFrequency(original){return inGraph('base',()=>getFrequencyActive(original));}
  function isDictionaryForm(value){
    if(exact(value))return true;
    return !isNotCapitalizedWord(value)&&exact(value.toLocaleLowerCase("ca"));
  }
  function runOnCandidates(original){
    let word=original;for(const [from,to] of Object.entries(metadata.inputConversion||{}))word=word.replaceAll(from,to);
    if(!word||isDictionaryForm(word))return [];
    const values=[];
    for(let split=1;split<word.length;split++){
      const prefix=word.slice(0,split),suffix=word.slice(split);
      const suffixIsDictionaryForm=isDictionaryForm(suffix);
      const suffixIsLowercaseVariant=!isNotCapitalizedWord(suffix)&&exact(suffix.toLocaleLowerCase("ca"));
      if(!suffixIsDictionaryForm&&!suffixIsLowercaseVariant)continue;
      if(isDictionaryForm(prefix))values.push(`${prefix} ${suffix}`);
      else if(/^\p{Uppercase}/u.test(prefix)&&isDictionaryForm(prefix.toLocaleLowerCase("ca")))values.push(`${prefix} ${suffix}`);
    }
    return values;
  }
  function characters(node){const cacheKey=`${activeGraph}:${node}`;if(charCache.has(cacheKey))return charCache.get(cacheKey);const output=[];
    function visit(n,bytes,required){for(let a=offsets[n];a<offsets[n+1];a++){const label=arcs[a*3],buffer=[...bytes,label];let count=required;
      if(!bytes.length){if(label<128)count=1;else if(label>=194&&label<224)count=2;else if(label>=224&&label<240)count=3;else if(label>=240&&label<245)count=4;else continue;}
      if(buffer.length<count){if(!terminal(a))visit(next(a),buffer,count);continue;}
      try{const char=decoder.decode(new Uint8Array(buffer))[0],target=terminal(a)?-1:next(a),separator=activeGraph!=='multitoken'&&target>=0?getArc(target,metadata.separator):-1;output.push({char,target,terminal:terminal(a),final:final(a)||separator>=0&&!terminal(separator),frequency:activeGraph==='multitoken'||target<0?0:frequency(target)});}catch{/* Invalid sequences are discarded by upstream CharsetDecoder. */}
    }}visit(node,[],0);charCache.set(cacheKey,output);return output;}
  function replacements(str,from=0,level=0){if(level>6)return [str];let index=120,key='',length=0;
    for(const candidate of rest.keys()){const start=candidate.startsWith('^'),end=candidate.endsWith('$'),bare=candidate.replace(/^\^|\$$/gu,'');let i=start?(from>0?-1:str.startsWith(bare)?0:-1):end?(str.length-bare.length>=from&&str.endsWith(bare)?str.length-bare.length:-1):str.indexOf(candidate,from);
      if(i>=0&&(i<index||i===index&&bare.length>=length)){index=i;key=candidate;length=bare.length;}}
    if(index>=120)return [str];const out=replacements(str,index+length,level+1);
    for(const target of rest.get(key)){const i=str.indexOf(target,Math.max(0,from-target.length+1));if(target.length>length&&i>=0&&(i===index||i===index-target.length+1))continue;out.push(...replacements(str.slice(0,index)+target+str.slice(index+length),index+target.length,level+1));}return out;
  }
  function getSuggestionSearchQueries(original){
    let word=String(original);for(const [from,to] of Object.entries(metadata.inputConversion||{}))word=word.replaceAll(from,to);
    const queries=rest.size&&word.length>1?replacements(word):[word],out=[];let index=1;
    for(const query of queries){index++;if(index>15||query.length<4&&index>2)break;out.push(query);}
    return out.length?out:[word];
  }
  function areEquivalentSuggestionChars(x,y){
    if(x===y)return true;
    let row=equivalencePairs.get(x);
    if(row?.has(y))return row.get(y);
    const a=equivalenceForm(x),b=equivalenceForm(y);
    const result=!!(metadata.equivalentChars[x]?.includes(y)||a.base===b.base||a.letter&&a.lower===b.lower);
    if(equivalencePairCount>=8192){equivalencePairs.clear();equivalencePairCount=0;row=null;}
    if(!row){row=new Map();equivalencePairs.set(x,row);}
    row.set(y,result);equivalencePairCount++;
    return result;
  }
  function findSimilarWordCandidatesActive(original,maxEditDistance=1){
    maxEditDistance=Math.max(1,Math.min(3,Number.isInteger(maxEditDistance)?maxEditDistance:1));
    const cacheKey=`${activeGraph}:${maxEditDistance}:${original}`;
    if(suggestionCache.has(cacheKey))return suggestionCache.get(cacheKey).map(item=>({...item}));if(!offsets)throw new Error('Speller is not loaded');
    let word=String(original);if(activeGraph==='multitoken')word=word.replace(/[\p{Zs}]+/gu,' ').replaceAll(' ','_');else for(const [from,to] of Object.entries(metadata.inputConversion))word=word.replaceAll(from,to);
    const bandRadius=maxEditDistance,results=[],matrix=new Int32Array(122*(2*bandRadius+3));matrix.fill(0);for(let i=0;i<121-bandRadius;i++){matrix[i]=maxEditDistance+1;matrix[matrix.length-i-1]=maxEditDistance+1;}
    for(let i=0;i<=bandRadius+1;i++){matrix[(bandRadius+1-i)*122]=i;matrix[(bandRadius+1+i)*122+i]=i;}
    // HMatrix stores the diagonal at row distance + 1 (there is one guard
    // row on either side of the usable band).
    const get=(i,j)=>matrix[(j-i+bandRadius+1)*122+j],set=(i,j,value)=>{matrix[(j-i+bandRadius+1)*122+j]=value;};
    let processed='',candidate=[],distance=maxEditDistance;
    const add=(form,d,node)=>results.push({word:form,distance:d,score:d*26+25-frequency(node)});
    function equal(x,y){return areEquivalentSuggestionChars(x,y);}
    function ed(i,j,wi,ci){let value;if(equal(processed[wi],candidate[ci]))value=get(i,j);else if(wi>0&&ci>0&&processed[wi]===candidate[ci-1]&&processed[wi-1]===candidate[ci])value=1+Math.min(get(i-1,j-1),get(i+1,j),get(i,j+1));else value=1+Math.min(get(i,j),get(i+1,j),get(i,j+1));set(i+1,j+1,value);return value;}
    function matches(pattern,wi){return (!pattern.start||wi===0)&&processed.startsWith(pattern.source,wi)&&(!pattern.end||wi+pattern.source.length===processed.length);}
    function walk(node,depth,wi,ci,minLookback=-1,lastSource=null,lastTarget=''){
      for(const arc of characters(node)){candidate[ci]=arc.char;let length=0;
        if(ci>0&&wi>0){const pair=candidate[ci-1]+candidate[ci];for(const p of two.get(pair)||[]){if(p.source.length===2&&wi<processed.length&&candidate[ci-1]===processed[wi-1]&&candidate[ci]===processed[wi])break;
          if(matches(p,wi-1)){if(wi-1<minLookback&&lastSource&&p.source.length===1&&p.source===lastTarget&&pair===lastSource)continue;length=p.source.length;break;}}}
        const isEnd=arc.final&&Math.abs(processed.length-1-wi)<=distance;
        const canContinue=!arc.terminal&&(activeGraph==='multitoken'||arc.char!==String.fromCharCode(metadata.separator));
        if(length>0){let d=get(depth-1,depth-1);if(isEnd){d+=Math.abs(processed.length-1-(wi+length-2));if(d<=distance)results.push({word:candidate.slice(0,ci+1).join(''),distance:d,score:d*26+25-arc.frequency});}
          if(canContinue){const x=get(depth,depth);set(depth,depth,get(depth-1,depth-1));walk(arc.target,Math.max(0,depth),wi+length-1,ci+1,minLookback,lastSource,lastTarget);set(depth,depth,x);}}
        length=0;for(const p of one.get(arc.char)||[])if(matches(p,wi)){length=p.source.length;break;}
        if(length>0){let d=get(depth,depth);if(isEnd){d+=Math.abs(processed.length-1-(wi+length-1));if(d<=distance)results.push({word:candidate.slice(0,ci+1).join(''),distance:d,score:d*26+25-arc.frequency});}
          if(canContinue)walk(arc.target,depth,wi+length,ci+1,wi+length,processed.slice(wi,wi+length),arc.char);}
        let cutoff=distance+1,l=Math.max(0,depth-distance),u=Math.min(processed.length-1-(wi-depth),depth+distance);
        for(let i=l,w=wi+l-depth;i<=u;i++,w++)cutoff=Math.min(cutoff,ed(i,depth,w,ci));
        if(cutoff<=distance){if(isEnd){const d=ed(processed.length-1-(wi-depth),depth,processed.length-1,ci);if(d<=distance)results.push({word:candidate.slice(0,ci+1).join(''),distance:d,score:d*26+25-arc.frequency});}
          if(canContinue)walk(arc.target,depth+1,wi+1,ci+1,minLookback,lastSource,lastTarget);}
      }
    }
    if(word.length>0&&word.length<120){const queries=activeGraph!=='multitoken'&&rest.size&&word.length>1?replacements(word):[word];if(activeGraph!=='multitoken'&&rest.size&&word.length>1)for(const query of queries){
      const forms=exact(query)?[query]:[query.toLowerCase(),query.toUpperCase(),query.length>1?query[0].toUpperCase()+query.slice(1).toLowerCase():''];for(const form of forms)if(form&&exact(form)){let n=0;for(const b of encoder.encode(form))n=next(getArc(n,b));add(form,0,n);}}
      let i=1;for(const query of queries){i++;if(i>15||query.length<4&&i>2)break;processed=query;candidate=[];distance=query.length<=1?query.length-1:maxEditDistance;walk(0,0,0,0);}}
    // Match MorfologikSpeller.replaceRunOnWordCandidates(): once both sides
    // of a fused form are dictionary entries, offer their split at edit
    // distance 1. This must participate in the same staged search; otherwise
    // callers incorrectly fall through to noisy distance-2/3 candidates.
    for(const value of runOnCandidates(original))results.push({word:value,distance:1,score:51});
    results.sort((a,b)=>a.score-b.score);const seen=new Set(),out=[];for(const item of results){let value=item.word;if(activeGraph==='multitoken')value=value.replaceAll('_',' ');else for(const [from,to] of Object.entries(metadata.outputConversion))value=value.replaceAll(from,to);if(value!==String(original)&&!seen.has(value)){seen.add(value);out.push({word:value,distance:item.distance,weight:item.score});}}
    if(suggestionCache.size>10000)suggestionCache.clear();suggestionCache.set(cacheKey,out);return out.map(item=>({...item}));
  }
  function findSimilarWordCandidates(original,maxEditDistance=1){return inGraph('base',()=>findSimilarWordCandidatesActive(original,maxEditDistance));}
  function findSimilarWordCandidatesInOverlay(original,maxEditDistance=1){return inGraph('overlay',()=>findSimilarWordCandidatesActive(original,maxEditDistance));}
  function findMultitokenSpellingCandidates(original){return inGraph('multitoken',()=>findSimilarWordCandidatesActive(original,1).filter(item=>item.distance===1));}
  function findSimilarWords(original,maxEditDistance=1){return findSimilarWordCandidates(original,maxEditDistance).map(item=>item.word);}
  globalThis.CorrectorCatalanMorfologikSpeller=Object.freeze({load,findSimilarWords,findSimilarWordCandidates,findSimilarWordCandidatesInOverlay,findMultitokenSpellingCandidates,isMisspelled,isProhibited,getFrequency,getSuggestionSearchQueries,areEquivalentSuggestionChars,normalizeLegacyDiacritics});
})();
