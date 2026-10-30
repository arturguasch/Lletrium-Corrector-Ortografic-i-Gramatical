/* General local adapters for LanguageTool filters, before overlap arbitration. */
(() => {
  "use strict";
  let lex, analyze, data, promise, activeLocaleProfile = "inclusive";
  const suppressRecursionGuard = new Set();
  const supported=new Set(["AdaptSuggestionsFilter","AddCommasFilter","CatalanSuppressMisspelledSuggestionsFilter","SynthesizeWithDAFilter","SynthesizeWithAnyDeterminerFilter","ConvertToGenderAndNumberFilter","DiacriticsCheckFilter"]);
  const name=rule=>rule.filterClass?.split(".").at(-1);
  supported.add("FindSuggestionsFilter");
  supported.add("AdjustVerbSuggestionsFilter");
  supported.add("DonarseliBeFilter");
  supported.add("AdvancedSynthesizerFilter");
  supported.add("AdjustPronounsFilter");
  supported.add("CheckPostagsInSuggestionFilter");
  supported.add("ConvertToSentenceCaseFilter");
  supported.add("TextToNumberFilter");
  supported.add("AnarASuggestionsFilter");
  supported.add("PortarGerundiSuggestionsFilter");
  supported.add("DonarTempsSuggestionsFilter");
  supported.add("PossessiusRedundantsFilter");
  supported.add("PortarTempsSuggestionsFilter");
  supported.add("EnNoInfinitiuSuggestionFilter");
  supported.add("OblidarseSugestionsFilter");
  supported.add("DateCheckFilter");
  supported.add("NewYearDateFilter");
  supported.add("SuppressIfAnyRuleMatchesFilter");
  supported.add("MultitokenSpellerFilter");
  supported.add("CatalanNumberInWordFilter");
  supported.add("CatalanNumberSpellerFilter");
  supported.add("FindSuggestionsEsFilter");
  supported.add("PostponedAdjectiveConcordanceFilter");
  // LanguageTool keeps the original local match when its optional remote
  // rewrite service returns nothing. The offline extension follows that safe
  // fallback and retains the diagnostic without inventing a replacement.
  supported.add("CatalanRemoteRewriteFilter");
  let multitokenSpeller;
  const supports=rule=>name(rule)==="QueIniciFilter"
    ? ["QUE_INICIAL_AMBACCENT_VERB[1]","QUE_INICIAL_AMBACCENT_VERB[4]"].includes(rule.fullId)
    : name(rule)==="CatalanRemoteRewriteFilter"
      ? !/suppressMatch\s*:\s*true/iu.test(rule.filterArguments || "")
      : supported.has(name(rule));
  const regexCache=new Map();
  const re=expression=>{if(!regexCache.has(expression))regexCache.set(expression,CorrectorJavaCaseRegex.compile(expression,true));return regexCache.get(expression);};
  const tagged=(token,expression)=>token?.readings?.find(row=>row.tag!=null&&re(expression).test(row.tag));
  const has=(token,expression)=>Boolean(tagged(token,expression));
  const upperFirst=s=>s.replace(/[\p{L}\p{N}]/u,char=>char.toLocaleUpperCase("ca"));
  const allUpper=s=>/\p{Lu}/u.test(s)&&!/\p{Ll}/u.test(s);
  const preserve=(s,sample)=>!sample?s:/^\p{Lu}[^\p{Lu}\p{Lt}]*$/u.test(sample)?upperFirst(s.toLocaleLowerCase("ca")):allUpper(sample)?s.toLocaleUpperCase("ca"):s;
  const synth=(row,pos,regex=false)=>CorrectorCatalanSynthesis.synthesize(row,pos,regex,activeLocaleProfile);
  const unique=values=>[...new Set(values)];
  function spellCatalanNumber(input,feminine=false){
    const tag=feminine?"_spell_number_:feminine":"_spell_number_";
    return globalThis.CorrectorCatalanSoros.spellNumber(String(input),tag)||"";
  }
  function args(rule,pattern,positions=null,words=null){return Object.fromEntries((rule.filterArguments||"").split(/\s+/u).filter(Boolean).map(item=>{const i=item.indexOf(":");return [item.slice(0,i),item.slice(i+1).replace(/\\(\d+)/gu,(_,n)=>{
    const index=Number(n)-1,matched=positions?.[index];
    // Filter arguments refer to PatternRule elements, not to the flattened
    // token span. Optional elements can consume zero tokens and repeated
    // elements can consume several, so indexing the flat span shifts every
    // later reference and applies a filter to the wrong lexical form.
    if(Array.isArray(matched)&&words)return matched.map(tokenIndex=>words[tokenIndex]?.text||"").join(" ");
    return pattern[index]?.text||"";
  })];}));}
  function position(value,pattern,match){let index;if(value.startsWith("marker")){index=pattern.findIndex(t=>t.start>=match.start&&t.kind!=="sentence-start");index+=Number(value.slice(6)||0);}else index=Number(value)-1;if(!Number.isInteger(index)||index<0||index>=pattern.length)throw new Error("RuleFilter position out of bounds: "+value);return index;}
  async function load(){if(!promise)promise=(async()=>{const response=await fetch(chrome.runtime.getURL("build/resources/ca-filter-data.json"));data=await response.json();return {loaded:true};})();return promise;}
  function determiner(form,gn,prep=""){
    if(gn.startsWith("C"))gn="M"+gn[1];if(gn.endsWith("N"))gn=gn[0]+"S";
    let apos="";const tests=data.apostrophation;
    const test=id=>new RegExp(`^(?:${tests[id]})$`,"iu").test(form);
    if(!test("pHacAspirada")&&(gn==="MS"&&test("pMascYes")&&!test("pMascNo")||gn==="FS"&&test("pFemYes")&&!test("pFemNo")))apos="apos";
    return data.prepDet[(prep?prep[0].toLocaleLowerCase("ca"):"")+gn+apos]||"";
  }
  function adapt(s,sample){
    const capitalized=/^\p{Lu}[^\p{Lu}]*$/u.test(s);
    s=s.replaceAll("gens traça","gens de traça").replaceAll("gens facilitat","gens de facilitat");
    for(const [id,replacement] of [["CA_CONTRACTIONS","$1$2"],["CA_CONTRACTIONS2","$1$2"],["CA_APOSTROPHES1","$1"],["CA_APOSTROPHES2","e$1 $2"],["CA_APOSTROPHES3","$1'$2"],["CA_APOSTROPHES4","$1'$2"],["CA_APOSTROPHES5","$1$2"],["CA_APOSTROPHES6","se'$1"],["CA_APOSTROPHES7","$1 l'$2"],["CA_APOSTROPHES8",(_s,a,b)=>"E"+a.toLowerCase()+" "+b],["CA_APOSTROPHES9","$1e $2"],["CA_REMOVE_SPACES","$1$2"]]){
      if(id==="CA_APOSTROPHES3"&&(s.includes("en el")||s.includes("-se")))continue;
      const {source,flags}=data.adaptation[id];
      const boundary="(?:(?<![\\p{L}\\p{N}_])(?=[\\p{L}\\p{N}_])|(?<=[\\p{L}\\p{N}_])(?![\\p{L}\\p{N}_]))";
      s=s.replace(new RegExp(source.replaceAll("\\b",boundary),flags.includes("CASE_INSENSITIVE")?"giu":"gu"),replacement);
    }
    if(capitalized)s=upperFirst(s);return preserve(s.replaceAll(" ,",","),sample);
  }
  function split(row){const m=row?.tag?.match(/^(N.|A..|V.P..|D..|PX.)(.)(.)(.*)$/u);return m?{prefix:m[1],gender:m[1][0]==="V"?m[3]:m[2],number:m[1][0]==="V"?m[2]:m[3],suffix:m[4]}:null;}
  function flex(row,g,n){const bits=split(row);if(!bits)return "";if(bits.prefix[0]==="V")[g,n]=[n,g];const variants=synth(row,`${bits.prefix}[${g}${bits.prefix.startsWith("DA")?"":"C"}][${n}N]${bits.suffix}`,true);const tail=(row.token||"").split(" ").slice(1).join(" ");return variants.length?variants[0]+(tail?" "+tail:""):"";}
  function convert(match,a,words,text){
    let pos=words.findIndex((t,i)=>i>0&&t.start>=match.start);if(pos<0)return null;
    const orig=tagged(words[pos],a.lemmaSelect),origSplit=split(orig);let rows=[],suggestions=[];
    if(a.newLemma&&orig)rows=[{...orig,lemma:a.newLemma,token:words[pos].text}];
    else if(match.suggestions.length){
      for(const suggestion of match.suggestions){const [word,...rest]=suggestion.split(" ");const readings=lex(word),row=readings.find(r=>split(r));
        if(!row||readings.some(r=>r.tag&&re("NP.*|AQ0CN0|SPS00|[CP].*").test(r.tag))){suggestions=match.suggestions.slice();rows=[];break;}
        const bits=split(row),g=a.gender||bits.gender,n=a.number||(origSplit&&origSplit.number!=="N"?origSplit.number:bits.number);
        rows.push({...row,tag:bits.prefix+(bits.prefix[0]==="V"?n+g:g+n)+bits.suffix,token:rest.length?word+" "+rest.join(" "):row.lemma});
      }
    }else if(orig)rows=[{...orig,token:words[pos].text}];
    let from=pos,to=pos;
    for(const row of rows){const bits=split(row);if(!bits)continue;let genders=a.gender||bits.gender,numbers=a.number||bits.number;
      for(const feature of ["gender","number"]){let value=feature==="gender"?genders:numbers;const neutral=feature==="gender"?"C":"N",allowed=feature==="gender"?"FM":"SP";
        if(value===neutral){for(const neighbor of [words[pos-1],words[pos+1]]){const b=split(tagged(neighbor,"N.*|A.*|V.P.*|D.*|PX.*"));if(b&&allowed.includes(b[feature]))value=b[feature];}}
        const own=bits[feature];if(value.includes(own))value=own+value.replace(own,"");if(feature==="gender")genders=value;else numbers=value;
      }
      for(const g of genders)for(const n of numbers){from=pos;to=pos;let s=a.keepOriginal==="true"?row.token:flex(row,g,n),invalid=!s,addDet=false,demonstrative=false,prep="",conditional="",tot="";
        for(let i=pos-1;i>0;i--){const token=words[i];let r=tagged(token,"A..[MFC][SPN].*|V.P..[SPN][MFC].*|D..[MFC][SPN].*|PX.[MFC][SPN].*");
          if(!has(token,"D.*")&&(has(token,"_perfet|_GV_")||token.chunkTags?.includes("GV"))||["mes","las"].includes(token.text.toLowerCase()))r=null;
          if(r?.lemma){
            if(r.tag.startsWith("DA")){s=conditional+s;conditional="";addDet=true;from=i;}
            else if(!addDet&&!demonstrative){let v=flex({...r,token:token.text},g,n);if(!v)invalid=true;if(v==="bo")v="bon";s=v+(words[i+1].whitespaceBefore?" ":"")+conditional+s;conditional="";from=i;if(r.tag.startsWith("DD"))demonstrative=true;
              if(r.tag.startsWith("D")&&!r.tag.startsWith("DN")&&!demonstrative&&r.lemma.toLowerCase()!=="quant")break;
            }else{if(r.lemma==="tot"){const v=flex({...r,token:token.text},g,n);if(v){tot=v+" ";from=i;}}break;}
          }else if(has(token,"SPS00|LOC_PREP")){if(addDet){const v=token.text.toLowerCase().replace(/^pe$/u,"per").replace(/^d'$/u,"de");if(["a","de","per"].includes(v)){prep=v;from=i;}}break;}
          else if(has(token,"_PUNCT_CONT|CC")){if(pos-i===1||token.text.toLowerCase()==="i"&&words[i-1]?.text.toLowerCase()==="tot")break;conditional=token.text+" "+conditional;}
          else if(has(token,"RG.*")&&(i<=1||split(tagged(words[i-1],"N.*|A.*|V.P.*|D.*|PX.*")))&&(i>=words.length-1||split(tagged(words[i+1],"N.*|A.*|V.P.*|D.*|PX.*"))))conditional=token.text+" "+conditional;
          else break;
        }
        conditional="";let conjunction=false;
        for(let i=pos+1;i<words.length;i++){const token=words[i];if(["mes","las"].includes(token.text.toLowerCase()))break;
          let r=tagged(token,"A..[MFC][SPN].*|V.P..[SPN][MFC].*|PX.[MFC][SPN].*");if(conjunction&&has(token,"NC.*"))r=null;
          if(r){const v=flex({...r,token:token.text},g,n);if(!v)invalid=true;s+=conditional+" "+v;conditional="";to=i;}
          else if(has(token,"RG.*"))conditional+=" "+token.text;else if(has(token,"CC")){conjunction=true;conditional+=" "+token.text;}else if(has(token,"_PUNCT_CONT"))conditional+=token.text;else break;
        }
        if(addDet)s=determiner(s,g+n,prep)+s;else if(prep)s=prep+" "+s;s=tot+s;
        const span=text.slice(words[from].start,words[to].end),samples=span.split(" "),parts=s.split(" ");s=parts.length===samples.length?parts.map((v,i)=>preserve(v,samples[i])).join(" "):preserve(s,span);
        if(!invalid&&!(from===pos&&to===pos&&s===words[pos].text))suggestions.push(s);
      }
    }
    if(!suggestions.length||suggestions.includes(text.slice(words[from].start,words[to].end)))return null;
    return {...match,start:words[from].start,end:words[to].end,suggestions};
  }
  const gnPatterns={MS:"(N|A.).[MC][SN].*|V.P.*SM.",FS:"(N|A.).[FC][SN].*|V.P.*SF.",MP:"(N|A.).[MC][PN].*|V.P.*PM.",FP:"(N|A.).[FC][PN].*|V.P.*PF."};
  const pronounTag="P0.{6}|PP3CN000|PP3NN000|PP3..A00|PP[123]CP000|PP3CSD00";
  function transformPronoun(input,position){input=(input||"").toLowerCase().trim();input=data.pronounMaps.incorrectOrders[input]??input;const i=data.pronouns.indexOf(input);if(i<0)return "";const value=data.pronouns[Math.floor(i/7)*7+position];return position===0||position===1&&!value.endsWith("'")?value+" ":value;}
  const normalized=input=>transformPronoun(input,6);
  const before=(input,verb)=>/^h?[aeiouàèéíòóú]/iu.test(verb)?transformPronoun(input,1):transformPronoun(input,0)==="es "&&/^(?:s|ce|ci)/u.test(verb.toLowerCase())?"se ":transformPronoun(input,0);
  const after=(input,verb)=>transformPronoun(input,/[aei]$/iu.test(verb)?3:2);
  const reflexive=person=>data.pronounMaps.reflexivePronoun[person]||"";
  const reflexivePresent=input=>normalized(input).split(" ").some(value=>["em","et","es","ens","us","vos"].includes(value));
  function addReflexive(pronouns,verb,person,post){if(post){if(/([mts][e']|[e'][mts]|vos|us|ens|-nos|-vos)/u.test(pronouns))return verb+after(pronouns,verb);return /(?:r|re)$/u.test(verb)?verb+after("-se",verb):verb;}return before((reflexivePresent(pronouns)?"":reflexive(person)+" ")+normalized(pronouns),verb)+verb;}
  function verbModel(words,pos){
    const isVerb=i=>i>=0&&i<words.length&&(words[i].chunkTags?.includes("GV")||has(words[i],"V.[^P].*")||has(words[i],"V.P.*")&&has(words[i],"_GV_"));
    const multi=i=>i>=0&&i<words.length&&(words[i].chunkTags?.includes("GV")||has(words[i],"_GV_"));
    let first=pos,last=pos,beforeCount=0,afterCount=0;
    if(!(has(words[pos],"V.P.*")&&!has(words[pos],"_GV_")&&!words[pos].chunkTags?.includes("GV"))){
      while(first<words.length&&!isVerb(first))first++;if(first>=words.length)return null;last=first;
      for(let i=first-1;multi(i)&&!has(words[first],"V.[IS].*");i--)first=i;
      for(let i=last+1;multi(i)&&!(has(words[first],"V.[IS].*")&&has(words[i],"V.[IS].*"));i++)last=i;
      for(let i=last+1;i<words.length&&!words[i].whitespaceBefore&&has(words[i],pronounTag);i++)afterCount++;
      let adjacent=0;for(let i=first-1;i>0&&has(words[i],pronounTag);i--){if(words[i].whitespaceBefore||i===1||has(words[i-1],"_QM.*")){beforeCount+=adjacent+1;adjacent=0;}else adjacent++;}
    }
    const string=(from,to)=>words.slice(from,to+1).map((t,i)=>(i&&t.whitespaceBefore?" ":"")+t.text).join("");
    const adjust=(lemma,tag)=>lemma==="haver"?"VA"+tag.slice(2):lemma==="ser"?"VS"+tag.slice(2):tag;
    const generate=(lemma,tag)=>{let result="";for(let i=first;i<=last;i++){
      if(i>first&&words[i].whitespaceBefore)result+=" ";
      if(first===last||i===last)result+=synth({lemma,tag},adjust(lemma,first===last?tag:tagged(words[last],"V.*").tag))[0]||"";
      else if(i===first){const r=tagged(words[first],"V.*");result+=synth(r,adjust(r.lemma,tag))[0]||"";}else result+=words[i].text;
    }return adapt(result,"");};
    return {first,last,beforeCount,afterCount,string,generate,isIS:has(words[first],"V.[IS].*"),pronouns:beforeCount?string(first-beforeCount,first-1):afterCount?string(last+1,last+afterCount):"",sample:string(first-beforeCount,first),original:string(first,last)};
  }
  function adjustVerb(match,a,words){
    const pos=words.findIndex((t,i)=>i>0&&t.start>=match.start),v=verbModel(words,pos);if(!v||words[v.last].end>match.end)return null;
    const replacements=[];for(let suggestion of match.suggestions){suggestion=suggestion.toLowerCase();let action=(a.actions||"removePronounReflexive").split(",")[0],number="",person="",intr=false;
      if(suggestion.endsWith(" [intr]")){suggestion=suggestion.slice(0,-7);intr=true;}if(suggestion.endsWith(" [3s]")){suggestion=suggestion.slice(0,-5);number="S";person="3";}if(suggestion.startsWith("[datiu] ")){suggestion=suggestion.slice(8);action="addPronounDative";}
      let [lemma,...tail]=suggestion.split(" ");const ending=tail.join(" ");if(a.numberFromNextWords==="true"&&ending){const token=analyze(ending).find(t=>t.kind!=="space");number=token?.readings?.some(r=>r.tag?.includes("S"))?"S":"P";}if(lemma.includes("haver-hi"))number="S";if(a.forceNumber)number=a.forceNumber;
      for(const [suffix,newAction] of [["-se'n","addPronounReflexiveEn"],["-se","addPronounReflexive"],["'s","addPronounReflexive"],["-hi","addPronounHi"],["-s'ho","addPronounReflexiveHo"],["-se-les","addPronounReflexiveLes"],["-s'hi","addPronounReflexiveHi"]])if(lemma.endsWith(suffix)){lemma=lemma.slice(0,-suffix.length);action=newAction;break;}
      const tags=words[v.first].readings.filter(r=>r.tag?.startsWith("V")).map(r=>{let tag=r.tag;if(number&&tag[2]!=="P"&&/[SP]/u.test(tag[5]))tag=tag.slice(0,5)+number+tag.slice(6);if(person&&tag[2]!=="P"&&/[123]/u.test(tag[4]))tag=tag.slice(0,4)+person+tag.slice(5);return tag;});
      const tag=CorrectorCatalanSynthesis.targetPosTag(tags,"");if(!tag)continue;const verb=v.generate(lemma,tag),pronouns=v.pronouns.toLowerCase(),post=v.afterCount>0||!v.isIS,pn=action==="addPronounDative"?tagged(words[v.first],"V.[SIM].*")?.tag.slice(4,6)||"":tag.slice(4,6);let replacement="";
      const join=p=>post?verb+after(p,verb):before(p,verb)+verb;
      switch(action){
        case "None":replacement=join(pronouns);break;
        case "removePronounReflexive":replacement=join(normalized(pronouns).replace(/(?:em|et|es|ens|us|vos)/iu,"").trim());break;
        case "addPronounReflexive":replacement=addReflexive(pronouns,verb,pn,post);break;
        case "addPronounReflexiveLes":replacement=addReflexive(normalized(pronouns)+" les",verb,pn,post);break;
        case "addPronounReflexiveHi":replacement=addReflexive("","hi "+verb,pn,post);break;
        case "addPronounReflexiveEn":replacement=post?verb+after(/([mts][e']|[e'][mts]|vos|us|ens|-nos|-vos)/u.test(pronouns)?pronouns+"'n":"-se'n",verb):before(pronouns?"es "+normalized(pronouns)+" en":reflexive(pn)+" en",verb)+verb;break;
        case "addPronounEn":{const p=normalized(pronouns);const newPronoun=!v.isIS?after(p.endsWith("hi")?p.replaceAll("hi","en hi"):p+" en",verb):before(p.endsWith("hi")?p.replaceAll("hi","en hi"):p+" en",verb);if(newPronoun)replacement=v.isIS?newPronoun+verb:verb+newPronoun;break;}
        case "addPronounDative":replacement=join(data.pronounMaps.dativePronoun[pn]||"");break;
        case "addPronounReflexiveHo":{let p=reflexive(pn);if(!p&&["em","et","es","ens","us","vos"].includes(normalized(pronouns)))p=normalized(pronouns);replacement=join((p||"es")+" ho");break;}
        case "addPronounHi":replacement="hi "+verb;break;
        case "addPronounReflexiveImperative":if(!pronouns)replacement=verb+after(reflexive(pn),verb);break;
        case "replaceEmEn":replacement={em:"en "+verb,"m'":"n'"+verb,"m'hi":"n'hi "+verb}[pronouns]||"";break;
        default:throw new Error("Unsupported verb action "+action);
      }
      if(replacement){if(intr)for(const [from,to] of [["-se'l","-se-li"],["se'l ","se li "],["l'","li "],["-lo","-li"],["-la","-li"],["la ","li "],["el ","li "],["ho","hi"]])replacement=replacement.replaceAll(from,to);
        if(/d'[^aeiouh]/iu.test(replacement))replacement=replacement.replaceAll("d'","de ");replacement=replacement.replace(/^(.*)\be([stm]) (h?[aeiouh].*)$/iu,"$1$2'$3").replace(/^([mts])'([^aeiouh].*)$/iu,"e$1 $2").replace(/^(.*)(-[stm])e-(h[oi])$/iu,"$1$2'$3");replacements.push(preserve((replacement+" "+ending).trim(),v.sample));}
    }
    if(!replacements.length)return null;let start=v.first-v.beforeCount;
    if(!v.beforeCount&&start>1&&["de","d'","l","l'","el"].includes(words[start-1].text.toLowerCase())&&replacements.some(s=>/^h?[aeiouàèéíòóú]/iu.test(s)!==/^h?[aeiouàèéíòóú]/iu.test(v.original))){const count=start>2&&["a","de","per","pe"].includes(words[start-2].text.toLowerCase())?2:1;const prefix=v.string(start-count,start-1).toLowerCase()+(words[start].whitespaceBefore?" ":"");start-=count;for(let i=0;i<replacements.length;i++)replacements[i]=prefix+replacements[i];}
    return {...match,start:words[start].start,end:Math.max(match.end,words[v.last+v.afterCount].end),suggestions:unique(replacements)};
  }
  function adjustPronouns(match,a,words){
    const pos=words.findIndex((t,i)=>i>0&&t.start>=match.start),v=verbModel(words,pos);if(!v)return null;
    const firstTag=tagged(words[v.first],"V.*")?.tag;if(!firstTag)return null;
    let verb=v.original;if(a.newLemma)verb=v.generate(a.newLemma,firstTag);
    let verbOnly=a.newOnlyLemma?v.generate(a.newOnlyLemma,firstTag):verb;
    let pronouns=v.pronouns,from=v.first-v.beforeCount,to=v.last+v.afterCount;
    const pronounStart=v.beforeCount?v.first-v.beforeCount:v.first+1;
    const pronounEnd=v.beforeCount?v.first-1:v.last+v.afterCount;
    const alreadyHasEn=pronounStart<=pronounEnd&&words.slice(pronounStart,pronounEnd+1).some(token=>token.readings?.some(reading=>reading.lemma?.toLowerCase()==="en"&&reading.tag?.startsWith("PP")));
    const plainBefore=(input,word)=>{const value=transformPronoun(input,/^h?[aeiouàèéíòóú]/iu.test(word)?1:0);return value==="es "&&/^(?:s|ce|ci)/u.test(word.toLowerCase())?"se ":value;};
    const appendEn=(input,word,afterVerb)=>{let value=normalized(input);value=value.endsWith("hi")?value.replace("hi","en hi"):value+" en";return afterVerb?after(value,word):plainBefore(value,word);};
    const actions=(a.actions||"").split(","),replacements=[];
    for(const action of actions){let replacement="";
      switch(action){
        case "removePronounEn":{
          const value=pronouns.replaceAll("en","").replaceAll("n'","").replaceAll("'n","").trim();
          replacement=plainBefore(value,verb)+verb;break;
        }
        case "addPronounEn":{
          if(alreadyHasEn)break;
          const value=appendEn(pronouns,verb,!v.isIS);replacement=v.isIS?value+verb:verb+value;break;
        }
        case "removePronounReflexive":{
          const value=normalized(pronouns).replace(/(?:em|et|es|ens|us|vos)/iu,"").trim();
          replacement=plainBefore(value,verb)+verb;break;
        }
        case "replaceEmEn":
          replacement=pronouns.toLowerCase()==="em"?"en "+verb:pronouns.toLowerCase()==="m'"?"n'"+verb:pronouns.toLowerCase()==="m'hi"?"n'hi "+verb:"";break;
        case "replaceHiEn":{
          const value=appendEn(normalized(pronouns.replaceAll("hi","").trim()),verb,false);replacement=value+verb;break;
        }
        case "addPronounReflexive":
          replacement=addReflexive(pronouns,verb,firstTag.slice(4,6),!v.isIS);break;
        case "addPronounReflexiveHi":
          replacement=addReflexive(pronouns,"hi "+verb,firstTag.slice(4,6),false);break;
        case "addPronounReflexiveImperative":
          if(!pronouns){const value=after(reflexive(firstTag.slice(4,6)),verb);if(value)replacement=verb+value;}break;
        case "changeOnlyLemma":{
          if(actions.includes("replaceHiEn"))pronouns=pronouns.replaceAll("hi","").trim();
          replacement=plainBefore(pronouns,verbOnly)+verbOnly;break;
        }
        default:throw new Error("Unsupported AdjustPronounsFilter action: "+action);
      }
      const original=v.string(from,to);
      if(replacement&&replacement.toLocaleLowerCase("ca")!==original.toLocaleLowerCase("ca"))replacements.push(preserve(replacement,v.sample));
    }
    if(!replacements.length)return null;
    return {...match,start:words[from].start,end:words[to].end,suggestions:unique(replacements)};
  }
  function donarseli(match,words){
    const pos=words.findIndex((t,i)=>i>0&&t.start>=match.start),v=verbModel(words,pos);if(!v||words[v.last].end>match.end)return null;
    const relevant=v.afterCount===2?v.last+2:v.beforeCount>=2?v.first-(v.beforeCount-1):-1;if(relevant<1)return null;const pronoun=tagged(words[relevant],pronounTag);if(!pronoun)return null;
    const adverbFirst=v.last+v.afterCount+1;let adverbLast=adverbFirst;while(adverbLast<words.length&&!["bé","malament","mal","millor","pitjor","fatal"].includes(words[adverbLast].text.toLowerCase()))adverbLast++;if(adverbLast>=words.length)return null;
    let finalAdverb=words[adverbLast].text;if(["mal","fatal"].includes(finalAdverb.toLowerCase()))finalAdverb="malament";const nextWord=tagged(words[adverbLast+1],"V.N.*|D.*|PD.*");
    const init=v.first-v.beforeCount,lower=i=>words[i]?.text.toLowerCase(),isNo=init-1>0&&["no","mai"].includes(lower(init-1)),isMaiNo=isNo&&init-2>0&&lower(init-2)==="mai",bad=["malament","pitjor"].includes(finalAdverb.toLowerCase()),noBad=isNo&&bad,negative=bad&&!noBad;
    let left=Number(isNo)+Number(isMaiNo),aMi="",right=0,rightString="";
    if(init-left-2>0&&lower(init-left-2)==="a"&&["mi","tu","ell","ella","nosaltres","vosaltres","ells","elles"].includes(lower(init-left-1))){aMi=words[init-left-2].text+" "+words[init-left-1].text+" ";left+=2;}
    const dicendi=i=>{while(i>0){const r=tagged(words[i],"V.*|RG.*|LOC_ADV");if(!r)break;if(data.verbDicendi.includes(r.lemma?.toLowerCase()))return true;i--;}return false;};
    let isQue=init-left-1>0&&lower(init-left-1)==="que"&&!dicendi(init-left-2),isQueAccent=init-left-1>0&&lower(init-left-1)==="què",isElQue=false,isAQui=false;
    if(init-left-2>0&&["ja","ara","per","de","a","en"].includes(lower(init-left-2)))isQue=isQueAccent=false;
    if(init-left-1>0&&lower(init-left-1)==="qui"){isElQue=true;isAQui=init-left-2>0&&lower(init-left-2)==="a";}
    if(isQue&&init-left-2>0&&(has(words[init-left-2],"DA.*")||words[init-left-2].readings.some(r=>["alumne","persona","estudiant","professor"].includes(r.lemma)))){isElQue=true;isQue=false;}
    if(isQue)left++;if(isQueAccent)left++;const prefix=words.slice(init-left,init).map(t=>t.text+" ").join("");
    const verbTag=tagged(words[v.first],"V.*").tag,newTag=verbTag.slice(0,4)+pronoun.tag[2]+pronoun.tag[4]+verbTag.slice(6,8);
    let tracePrefix=prefix.replace(/què /iu,"en què ").replace(/que /iu,"en què ").replace(aMi,"");if(noBad)tracePrefix=tracePrefix.replace(/no /iu,"").replace(/mai /iu,"");
    let adverbs=v.string(adverbFirst,adverbLast-1);if(adverbs)adverbs=(words[adverbFirst].whitespaceBefore?" ":"")+adverbs;
    const traceAdverbs={" molt":" molta"," gens":" gens de"," tan":" tanta"}[adverbs.toLowerCase()]??adverbs;
    let trace=tracePrefix+(negative?"no ":"")+(!prefix.toLowerCase().startsWith("qu")&&!nextWord?"hi ":"")+v.generate("tenir",newTag)+(!noBad&&!negative?traceAdverbs:"")+" traça";
    if(nextWord){if(nextWord.token?.toLowerCase()==="el"||words[adverbLast+1].text.toLowerCase()==="el"){trace+=" per al";right=1;rightString=" el";}else if(words[adverbLast+1].text.toLowerCase()==="els"){trace+=" per als";right=1;rightString=" els";}else trace+=" per a";}
    const suggestions=[],caseSample=words[init-left].text;if(!isElQue)suggestions.push(preserve(trace,caseSample));
    if(!isAQui)suggestions.push(preserve(prefix.replace(aMi,"")+(!prefix.toLowerCase().startsWith("qu")&&!nextWord&&!isElQue?"ho ":"")+v.generate("fer",newTag)+adverbs+" "+finalAdverb+rightString,caseSample));
    let pronounText=words[relevant].text;if(["'ls","li","-li"].includes(pronounText.toLowerCase()))pronounText="es";const exitLemma=activeLocaleProfile==="valencian"?"eixir":"sortir",outVerb=v.generate(exitLemma,newTag),outPronoun=normalized(pronounText)+" en";
    let out=tracePrefix+(negative?"no ":"")+(v.beforeCount?before(outPronoun,words[v.first].text):"")+outVerb+(!v.beforeCount?after(outPronoun,words[v.first].text):"");if(nextWord)out+=nextWord.tag.startsWith("V")?" a":" en";out+=rightString;if(!isElQue)suggestions.push(preserve(out,caseSample));
    for(const lemma of ["anar",exitLemma]){const verb=v.generate(lemma,verbTag),p=words[relevant].text;const s=prefix+(v.beforeCount?before(p,verb):"")+verb+(!v.beforeCount?after(p,verb):"")+adverbs+" "+finalAdverb+rightString;suggestions.push(preserve(s,caseSample));}
    return {...match,start:words[init-left].start,end:words[adverbLast+right].end,suggestions};
  }
  function positionAt(words,offset){return words.findIndex((token,i)=>i>0&&token.start>=offset);}
  function anarASuggestions(match,words){
    const pos=positionAt(words,match.start),v=verbModel(words,pos);if(!v||words[v.last].end>match.end)return null;
    const first=v.first,finite=tagged(words[first],"V.IP.*"),infinitive=tagged(words[first+2],"V.N.*");
    if(!finite||!infinitive)return null;
    const forms=[...synth({lemma:infinitive.lemma,tag:finite.tag},`V[MS]IF${finite.tag.slice(4,8)}`,true),...synth({lemma:infinitive.lemma,tag:finite.tag},`V[MS]IP${finite.tag.slice(4,8)}`,true)];
    if(!forms.length)return null;
    const start=first-v.beforeCount,end=first+2+v.afterCount,sample=words[start]?.text||words[first].text;
    const pronouns=v.afterCount?v.pronouns:v.beforeCount?v.pronouns:"";
    const suggestions=[...match.suggestions,...forms.map(form=>preserve(adapt((pronouns?before(pronouns,form):"")+form,""),sample))];
    return {...match,start:words[start].start,end:words[end].end,suggestions:unique(suggestions)};
  }
  function portarGerundi(match,a,words){
    const pos=positionAt(words,match.start),v=verbModel(words,pos);if(!v||words[v.last].end>match.end)return null;
    const first=v.first,finite=tagged(words[first],"V.[IS].*"),gerund=tagged(words[first+1],"V.G.*");
    if(!finite||!gerund)return null;
    const lemma=a.newLemma||gerund.lemma;if(!lemma)return null;
    const auxiliaries=synth({lemma:"haver",tag:finite.tag},`VA${finite.tag.slice(2)}`,true);
    const participles=synth({lemma,tag:gerund.tag},"V.P..SM.",true);
    const forms=[];for(const auxiliary of auxiliaries)for(const participle of participles)forms.push(auxiliary+" "+participle);
    forms.push(...synth({lemma,tag:gerund.tag},`V.${finite.tag.slice(2)}`,true).slice(0,1));
    if(!forms.length)return null;
    const start=first-v.beforeCount,end=first+1+v.afterCount,sample=words[start]?.text||words[first].text;
    const pronouns=v.afterCount||v.beforeCount?v.pronouns:"";
    const suggestions=unique(forms.map(form=>preserve((pronouns?before(pronouns,form):"")+form,sample)));
    return {...match,start:words[start].start,end:words[end].end,suggestions};
  }
  function donarTemps(match,words){
    const pos=positionAt(words,match.start),pronoun=tagged(words[pos],"P.*");if(!pronoun)return null;
    const first=pos+1;let main=first;
    while(main<words.length&&words[main].sentence===words[pos].sentence&&!words[main].readings?.some(row=>row.lemma==="donar"))main++;
    const mainVerb=tagged(words[main],"V.*"),firstVerb=tagged(words[first],"V.*");if(!mainVerb||!words[main+1])return null;
    const person=pronoun.tag[2]+pronoun.tag[4],suggestions=[];
    const auxiliary=synth({lemma:"haver",tag:mainVerb.tag},`VA${mainVerb.tag.slice(2,8)}`)[0];
    if(auxiliary){let middle=words.slice(first,main).map((token,i)=>`${i&&token.whitespaceBefore?" ":""}${token.text}`).join("");let value=("hi "+middle+" "+auxiliary+" temps").replace(/ +/gu," ").replaceAll("de haver","d'haver");suggestions.push(preserve(value,words[pos].text));}
    if(firstVerb){const lemma=main===first?"tenir":firstVerb.lemma,tag=main===first?`${mainVerb.tag.slice(0,4)}${person}${mainVerb.tag.slice(6,8)}`:`${firstVerb.tag.slice(0,4)}${person}${firstVerb.tag.slice(6,8)}`;
      const verb=synth({lemma,tag:firstVerb.tag},tag)[0];if(verb){let value=verb;if(main>first){value+=" "+words.slice(first+1,main).map((token,i)=>`${i&&token.whitespaceBefore?" ":""}${token.text}`).join("");const final=synth({lemma:"tenir",tag:mainVerb.tag},mainVerb.tag)[0];if(!final)return suggestions.length?{...match,start:words[pos].start,end:words[main+1].end,suggestions}:null;value+=" "+final;}suggestions.push(preserve((value.trim()+" temps").replace(/ +/gu," "),words[pos].text));}}
    return suggestions.length?{...match,start:words[pos].start,end:words[main+1].end,suggestions:unique(suggestions)}:null;
  }
  function possessiusRedundants(match,words){
    const start=positionAt(words,match.start);if(start<1)return null;
    let pos=start;while(pos<words.length&&words[pos].sentence===words[start].sentence&&!has(words[pos],"PX.*"))pos++;
    const possessive=tagged(words[pos],"PX.*");if(!possessive||pos<1||!words[pos+1])return null;
    const person=possessive.tag[2],number=possessive.tag[6];let verb=start-1;
    while(verb>0&&words[verb].chunkTags?.includes("GV"))verb--;verb++;
    let found=false,any=false;
    for(const [initial,step] of [[verb-1,-1],[start+1,1]])for(let i=initial;words[i]?.sentence===words[start].sentence&&has(words[i],"PP.*|P0.*");i+=step){
      any=true;const row=tagged(words[i],"P.*");if(row&&row.tag[2]===person&&(number==="C"||row.tag[4]===number))found=true;
    }
    const det=tagged(words[pos-1],"DA0[MF]S0"),noun=words[pos+1],apos=Boolean(det&&["MS","FS"].some(gn=>determiner(noun.text,gn)==="l'"));
    if(found)return apos?{...match,start:words[pos-1].start,end:noun.end,suggestions:["l'"+noun.text]}:{...match,start:words[pos].start,end:words[pos].end,suggestions:[""]};
    if(any||!words[verb])return null;
    const dative=data.pronounMaps.dativePronoun[person+number];if(!dative)return null;
    const token=words[verb].text,tag=tagged(words[verb],"VM[NG].*");
    let value=tag?token+after(dative,token):preserve(before(dative,token),token)+token.toLowerCase();
    for(let i=verb+1;i<=pos-2;i++)value+=(words[i].whitespaceBefore?" ":"")+words[i].text.toLowerCase();
    if(apos)value+=" l'"+noun.text;
    else for(const i of [pos-1,pos+1])value+=(words[i].whitespaceBefore?" ":"")+words[i].text;
    return {...match,start:words[verb].start,end:noun.end,suggestions:[value]};
  }
  function portarTemps(match,words){
    const pos=positionAt(words,match.start),verb=tagged(words[pos],"V.*");if(!verb)return null;
    const form=synth({lemma:"fer",tag:verb.tag},`${verb.tag.slice(0,4)}[30][S0].${verb.tag.slice(7,8)}`,true)[0];if(!form)return null;
    let index=pos+1,value=form;while(index<words.length&&words[index].sentence===words[pos].sentence&&words[index].chunkTags?.includes("PTime")){if(words[index].whitespaceBefore)value+=" ";value+=words[index].text;index++;}
    const tail=words[index];if(!tail||!words[index+1]||tail.sentence!==words[pos].sentence)return null;
    let end=index;
    if(tail.text==="que")value+=" que";
    else if(has(tail,"V.G.*")){
      const group=verbModel(words,index),gerund=tagged(words[group?.first],"V.G.*");if(!group||!gerund)return null;
      const infinitive=synth({lemma:gerund.lemma,tag:gerund.tag},`V.I${verb.tag.slice(3,8)}`,true)[0];if(!infinitive)return null;
      value+=" que "+(group.pronouns?before(group.pronouns,infinitive):"")+infinitive;end=group.last+group.afterCount;
    }else if(tail.text==="sense"&&has(words[index+1],"V.N.*")){
      const group=verbModel(words,index+1),inf=tagged(words[group?.first],"V.N.*");if(!group||!inf)return null;
      const infinitive=synth({lemma:inf.lemma,tag:inf.tag},`V.I${verb.tag.slice(3,8)}`)[0];if(!infinitive)return null;
      value+=" que no "+(group.pronouns?before(group.pronouns,infinitive):"")+infinitive;end=group.last+group.afterCount;
    }else if(["així","a","en","aquí","allí","allà","de"].includes(tail.text.toLowerCase())||has(tail,"AQ.*|VMP.*")){
      const estar=synth({lemma:"estar",tag:verb.tag},`V.I${verb.tag.slice(3,8)}`,true)[0];if(!estar)return null;
      value+=" que "+estar;end=index-1;
    }else return null;
    return {...match,start:words[pos].start,end:words[end].end,suggestions:[preserve(value,words[pos].text)]};
  }
  function enNoInfinitiu(match,words){
    const pos=positionAt(words,match.start),group=verbModel(words,pos);if(!group||words[group.last].end>match.end)return null;
    const infinitive=tagged(words[group.first],"V.N.*");if(!infinitive)return null;
    const finiteAt=(from,step)=>{for(let i=from;i>0&&i<words.length&&words[i].sentence===words[group.first].sentence;i+=step){const row=tagged(words[i],"V.[IS].*");if(row)return {index:i,row};}return null;};
    const after=finiteAt(group.last+1,1),before=finiteAt(group.first-1,-1),controller=after||before;if(!controller)return null;
    const controllerModel=verbModel(words,controller.index),periphrastic=Boolean(controllerModel&&controllerModel.last>controllerModel.first);
    const tag=controller.row.tag,prefix=["IP","IF"].includes(tag.slice(2,4))&&!periphrastic?"VMIP":"VMII";
    const variants=unique(["3S",tag.slice(4,6)]),forms=variants.map(person=>synth({lemma:infinitive.lemma,tag:infinitive.tag},prefix+person+tag.slice(6))[0]).filter(Boolean);
    if(!forms.length)return null;
    let initial=Math.max(1,group.first-2);if(words[group.first-2]?.text.toLowerCase()==="l")initial=Math.max(1,group.first-3);
    const end=group.last+group.afterCount,original=words.slice(initial,end+1).map((token,i)=>`${i&&token.whitespaceBefore?" ":""}${token.text}`).join(""),sample=original;
    const suggestions=unique(forms.map(form=>preserve((before?"perquè no ":"com que no ")+(group.afterCount?beforePronouns(group.pronouns,form):"")+form,sample)));
    return suggestions.length?{...match,start:words[initial].start,end:words[end].end,suggestions}:null;
  }
  function beforePronouns(pronouns,verb){return before(pronouns,verb);}
  function oblidarse(match,words){
    const pos=positionAt(words,match.start);if(pos<1||!words[pos+1])return null;
    const pronoun=tagged(words[pos+1],"P.*");if(!pronoun)return null;
    const person=pronoun.tag[2]+pronoun.tag[4];let main=pos+2;
    while(main<words.length&&words[main].sentence===words[pos].sentence&&!words[main].readings?.some(row=>["oblidar","descuidar","passar"].includes(row.lemma)))main++;
    if(main>=words.length||words[main].sentence!==words[pos].sentence)return null;
    const verb=tagged(words[pos+2],"V.*");if(!verb)return null;
    let lemma=verb.lemma;if(lemma==="passar")lemma="descuidar";
    const tag=`${verb.tag.slice(0,4)}${person}${verb.tag.slice(6,8)}`;
    const newForm=synth({lemma,tag:verb.tag},tag)[0];if(!newForm)return null;
    let phrase=newForm;for(let i=pos+3;i<=main;i++)phrase+=(words[i].whitespaceBefore?" ":"")+words[i].text.replaceAll("passar","descuidar").replaceAll("passat","descuidat").replaceAll("passant","descuidant");
    const vowel=value=>/^h?[aeiouàèéíòóú]/iu.test(value||"");
    const afterToken=words[main+1],afterReading=tagged(afterToken,"D.*|V.N.*|P[DI].*|NC.*");
    let wordAfter=afterReading?afterToken.text:"";if(["com","de","d'","que"].includes(afterToken?.text.toLowerCase()))wordAfter=afterToken.text;
    const maps={
      enVowel:{"1S":"me n'","2S":"te n'","3S":"se n'","1P":"ens n'","2P":"us n'","3P":"se n'"},
      enConsonant:{"1S":"me'n ","2S":"te'n ","3S":"se'n ","1P":"ens en ","2P":"us en ","3P":"se'n "},
      vowel:{"1S":"m'","2S":"t'","3S":"s'","1P":"ens ","2P":"us ","3P":"s'"},
      consonant:{"1S":"em ","2S":"et ","3S":"es ","1P":"ens ","2P":"us ","3P":"es "}
    };
    const useEn=!wordAfter&&!["de","d'","que"].includes(wordAfter.toLowerCase()),prefix=maps[useEn?(vowel(phrase)?"enVowel":"enConsonant"):(vowel(phrase)?"vowel":"consonant")][person];if(!prefix)return null;
    let replacement=prefix+phrase,extra=0;
    if(["el","els"].includes(wordAfter.toLowerCase())){replacement+=" d"+wordAfter.toLowerCase();extra=wordAfter.length+1;}
    else if(wordAfter&&!["de","d'","que"].includes(wordAfter.toLowerCase())){const apostrophe=vowel(wordAfter);replacement+=apostrophe?" d'":" de";if(apostrophe)extra=1;}
    const sample=words[pos].text,suggestions=[preserve(replacement,sample)];
    for(const suggestion of match.suggestions||[])suggestions.push(adapt(suggestion+(extra===1?" ":""),sample));
    return {...match,start:words[pos].start,end:words[main].end+extra,suggestions:unique(suggestions),message:(match.message||"").replaceAll("passar","descuidar")};
  }
  function withDeterminer(match,a,words,pattern,any){
    let pos=any?words.findIndex((t,i)=>i>0&&t.start>=match.start):words.indexOf(pattern[position(a.lemmaFrom,pattern,match)]);if(pos<1)return null;
    const original=words[pos],row=tagged(original,a.lemmaSelect);if(!row)return null;
    let prep="",from=words.findIndex((t,i)=>i>0&&t.start>=match.start),type="",det=null,between="",second="";
    if(any){from=pos;for(let k=pos-1;k>0;k--){let done=true;if(!det){det=tagged(words[k],"D.*");if(det){second=det.tag.slice(3,5);type=det.tag.slice(0,2);done=type!=="DA";from=k;}}if(has(words[k],"_QM_OPEN")){between=words[k].text;done=false;}if(["a","de","per","pe"].includes(words[k].text)){prep=words[k].text[0];from=k;}if(done)break;}}
    else{if(a.prepositionFrom){prep=/^\d+$/u.test(a.prepositionFrom)?pattern[Number(a.prepositionFrom)-1]?.text[0]||"":a.prepositionFrom[0];}second=tagged(words[pos-1],"D.*")?.tag.slice(3,5)||"";}
    const potential=[{...row,token:original.text}];
    for(const tag of CorrectorCatalanSynthesis.getPossibleTags())if(re(a.lemmaSelect).test(tag))for(const form of synth(row,tag)){
      if(a.synthAllForms!=="true"&&form.toLowerCase()!==original.text.toLowerCase())continue;
      if(potential.some(r=>r.lemma===row.lemma&&r.tag===tag&&(!any?r.token===form:true)))continue;
      const v={lemma:row.lemma,tag,token:form};if(second&&(tag.includes(second)||tag.includes([...second].reverse().join(""))))potential.splice(1,0,v);else potential.push(v);
    }
    const suggestions=match.suggestions.slice();for(const r of potential)for(const [gn,expression] of Object.entries(gnPatterns))if(re(expression).test(r.tag)){
      if(!any||type==="DA"||!type){let s=determiner(r.token,gn,prep)+between+preserve(r.token,original.text);if(from===1)s=upperFirst(s);suggestions.push(s);}
      else for(const d of synth(det,`${type}.[C${gn[0]}]${gn[1]}.`,true))suggestions.push((from===1?upperFirst: v=>v)(preserve(d,words[from].text)+" "+between+preserve(r.token,original.text)));
    }
    return {...match,start:any?words[from].start:match.start,suggestions:unique(suggestions)};
  }
  function advancedSynthesizer(match,a,pattern){
    const index=value=>position(String(value),pattern,match),tagAt=(at,expression)=>{
      const token=pattern[at];if(!token)return null;
      return token.readings?.find(row=>row.tag!=null&&re(expression).test(row.tag))||token.readings?.[0]||null;
    };
    const lemmaAt=index(a.lemmaFrom),posAt=index(a.postagFrom),lemmaReading=tagAt(lemmaAt,a.lemmaSelect),posReading=tagAt(posAt,a.postagSelect);
    let lemma=lemmaReading?.lemma,originalTag=lemmaReading?.tag,tag=posReading?.tag;
    if(a.newLemma){lemma=a.newLemma.startsWith("_")?data.nounToVerb?.[String(lemma||"").toLowerCase()]||null:a.newLemma;}
    if(!lemma)return null;if(!tag)return match;
    if(a.postagReplace){
      const captures=(expression,value)=>re(expression).exec(value||"")||[];
      const oldCaptures=captures(a.lemmaSelect,originalTag),newCaptures=captures(a.postagSelect,tag);
      for(let i=1;i<oldCaptures.length;i++)if(oldCaptures[i]!=null)a.postagReplace=a.postagReplace.replaceAll("\\a"+i,oldCaptures[i]);
      for(let i=1;i<newCaptures.length;i++)if(newCaptures[i]!=null)a.postagReplace=a.postagReplace.replaceAll("\\b"+i,newCaptures[i]);
      tag=a.postagReplace;
    }
    const source=pattern[lemmaAt]?.text||"",title=/^\p{Lu}[\p{Ll}\p{M}\p{N}'’·-]*$/u.test(source),upper=allUpper(source);
    const forms=unique(synth({token:"",lemma,tag},tag,true));if(!forms.length)return match;
    let used=false;const suggestions=[];
    for(const old of match.suggestions||[])for(let form of forms){
      if(title)form=upperFirst(form);if(upper)form=form.toLocaleUpperCase("ca");
      if(/\{(?:suggestion|Suggestion|SUGGESTION)\}/u.test(old))used=true;
      const value=old.replaceAll("{suggestion}",form).replaceAll("{Suggestion}",upperFirst(form)).replaceAll("{SUGGESTION}",form.toLocaleUpperCase("ca"));
      if(!suggestions.includes(value))suggestions.push(value);
    }
    if(!used)suggestions.push(...forms);
    const adapted=unique(suggestions.map(value=>adapt(value,"")));
    const preferred=adapted.filter(value=>{
      const accentVariant=value.replace(/é/g,"è").replace(/É/g,"È");
      return value==="després"||accentVariant===value||!adapted.includes(accentVariant);
    });
    const startsUpper=/^\p{Lu}/u.test(match.text||"");
    return {...match,suggestions:startsUpper?preferred.map(upperFirst):preferred};
  }
  function checkPostagsInSuggestion(match,a){
    const expected=(a.PostagsList||"").split(",");
    if(!expected.length||expected.some(tag=>!tag))throw new Error("Invalid PostagsList for CheckPostagsInSuggestionFilter");
    const suggestions=match.suggestions.filter(value=>{
      const tokens=analyze(value).filter(token=>token.kind!=="space");
      if(tokens.length!==expected.length)throw new Error("Suggestion token count does not match PostagsList");
      return tokens.every((token,index)=>token.readings?.some(reading=>reading.tag&&re(expected[index]).test(reading.tag)));
    });
    return suggestions.length?{...match,suggestions}:null;
  }
  function convertToSentenceCase(match,pattern){
    let firstDone=false,replacement="",original="";
    for(let i=0;i<pattern.length;i++){
      const token=pattern[i];if(token.start<match.start||token.end>match.end)continue;
      let normalized=String(token.text).toLocaleLowerCase("ca");
      if(token.text.includes("’"))normalized=normalized.replaceAll("'","’");
      const readings=token.readings||[];
      let capitalized=false,lowercase=false,unknown=false;
      for(const reading of readings){
        if(reading.tag==null||reading.lemma==null){unknown=true;break;}
        const lemma=String(reading.lemma).split(" ")[0];
        if(/^\p{Lu}[\p{Ll}\p{M}\p{N}'’·-]*$/u.test(lemma))capitalized=true;
        if(lemma===lemma.toLocaleLowerCase("ca"))lowercase=true;
      }
      if(unknown)normalized=upperFirst(normalized);
      else if(lowercase)normalized=normalized;
      else if(capitalized)normalized=upperFirst(normalized);
      else normalized=token.text;
      if(pattern[i+1]?.text==="."){
        if(normalized.length===1)normalized=normalized.toLocaleUpperCase("ca");
        else if(normalized==="corp")normalized="Corp";
      }
      const isPunctuation=/^\p{P}+$/u.test(token.text);
      if(!firstDone&&!isPunctuation&&token.text){firstDone=true;replacement+=upperFirst(normalized);original+=token.text;}
      else{if(token.whitespaceBefore){replacement+=" ";original+=" ";}replacement+=normalized;original+=token.text;}
    }
    return replacement===original?null:{...match,suggestions:[replacement]};
  }
  const numberValues=Object.freeze({zero:0,mig:.5,un:1,u:1,una:1,dos:2,dues:2,tres:3,quatre:4,cinc:5,sis:6,set:7,vuit:8,huit:8,nou:9,deu:10,onze:11,dotze:12,tretze:13,catorze:14,quinze:15,setze:16,disset:17,desset:17,"dèsset":17,divuit:18,devuit:18,"díhuit":18,dinou:19,denou:19,"dènou":19,"dèneu":19,vint:20,trenta:30,quaranta:40,cinquanta:50,seixanta:60,setanta:70,vuitanta:80,huitanta:80,noranta:90});
  const numberMultipliers=Object.freeze({cent:100,cents:100,mil:1000,"milió":1e6,milions:1e6,"bilió":1e13,bilions:1e13,"trilió":1e19,trilions:1e19});
  function textToNumber(match,pattern){
    let total=Math.fround(0),current=Math.fround(0),decimalValue=Math.fround(0),addedZeros=0,percentage=false,decimal=false;
    for(let i=0;i<pattern.length;i++){
      const token=pattern[i];if(token.start<match.start||token.end>match.end)continue;
      const form=String(token.text).toLocaleLowerCase("ca");
      if(i>0&&form==="cent"&&String(pattern[i-1].text).toLocaleLowerCase("ca")==="per"){percentage=true;break;}
      if(form==="comma"||form==="coma"){decimal=true;continue;}
      for(const part of form.split("-")){
        if(!decimal){
          if(Object.hasOwn(numberValues,part))current=Math.fround(current+numberValues[part]);
          else if(Object.hasOwn(numberMultipliers,part)){if(current===0)current=1;total=Math.fround(total+Math.fround(current*numberMultipliers[part]));current=0;}
        }else if(Object.hasOwn(numberValues,part)){
          const zerosToAdd=String(numberValues[part]).length;decimalValue=Math.fround(decimalValue+Math.fround(numberValues[part]/Math.pow(10,addedZeros+zerosToAdd)));addedZeros++;
        }
      }
    }
    const value=Math.fround(Math.fround(total+current)+decimalValue);
    let suggestion=Number.isInteger(value)?String(value):String(value);
    if(percentage)suggestion+="\u202F%";
    suggestion=suggestion.replace(".",",");
    return {...match,suggestions:[...match.suggestions,suggestion]};
  }
  const catalanWeekdays=["diumenge","dilluns","dimarts","dimecres","dijous","divendres","dissabte"];
  const weekdayNumbers=Object.freeze({dg:0,diumenge:0,dl:1,dilluns:1,dt:2,dimarts:2,dc:3,dimecres:3,dj:4,dijous:4,dv:5,divendres:5,ds:6,dissabte:6});
  const monthPrefixes=["gen","febr","març","abr","maig","juny","jul","ag","set","oct","nov","des"];
  function referencePosition(positions,value){const index=Number(value)-1;if(!Number.isInteger(index)||index<0)return -1;return positions[index]?.[0]??-1;}
  function calendarDate(day,month,year){if(!Number.isInteger(day)||!Number.isInteger(month)||!Number.isInteger(year)||month<1||month>12)return null;
    const date=new Date(0);date.setHours(0,0,0,0);date.setFullYear(year,month-1,day);
    return date.getFullYear()===year&&date.getMonth()===month-1&&date.getDate()===day?date:null;
  }
  function dateParts(value){const parts=String(value||"").split("-");if(parts.length!==3)return null;const [year,month,day]=parts.map(Number);return {year,month,day};}
  function monthNumber(value){const form=String(value||"").toLocaleLowerCase("ca");if(/^\d+$/u.test(form))return Number(form);const index=monthPrefixes.findIndex(prefix=>form.startsWith(prefix));return index<0?0:index+1;}
  function dayNumber(value){const m=String(value||"").match(/^(\d+).*$/u);return m?Number(m[1]):0;}
  function renderWords(words,from,to,replaceAt=-1,replacement=""){let result="";for(let i=from;i<=to;i++){if(i>from&&words[i].whitespaceBefore)result+=" ";result+=i===replaceAt?replacement:words[i].text;}return result;}
  function dateCheck(match,a,words,positions){
    const weekdayPos=referencePosition(positions,a.weekDay),datePos=referencePosition(positions,a.date||"-1");
    let dayPos,monthPos,yearPos,dayText,monthText,yearText,fullDate=false;
    if(weekdayPos<0)return null;
    if(datePos>=0){const p=dateParts(words[datePos]?.text);if(!p)return null;({day:dayText,month:monthText,year:yearText}= {day:String(p.day),month:String(p.month),year:String(p.year)});dayPos=monthPos=yearPos=datePos;fullDate=true;}
    else{dayPos=referencePosition(positions,a.day);monthPos=referencePosition(positions,a.month);yearPos=referencePosition(positions,a.year||"-1");
      dayText=words[dayPos]?.text;monthText=words[monthPos]?.text;yearText=yearPos>=0?words[yearPos]?.text:null;}
    if(dayPos<0||monthPos<0)return null;
    const rawWeekday=String(words[weekdayPos]?.text||"").replaceAll("\u00ad","").toLocaleLowerCase("ca");
    const claimedDay=weekdayNumbers[rawWeekday];if(claimedDay==null)return null;
    const day=dayNumber(dayText),month=monthNumber(monthText),year=yearText==null?new Date().getFullYear():Number(yearText);
    const date=calendarDate(day,month,year);if(!date)return null;
    const actualDay=date.getDay();if(actualDay===claimedDay)return null;
    const currentYear=new Date().getFullYear(),currentYearDate=yearText==null?null:calendarDate(day,month,currentYear);
    if(yearPos>=0&&year!==currentYear&&currentYearDate&&currentYearDate.getDay()===claimedDay){
      return {...match,start:words[yearPos].start,end:words[yearPos].end,
        message:'Aquesta data no és correcta. ¿Us referiu a l\'any "'+currentYear+'"?',suggestions:[String(currentYear)]};
    }
    const fmt=s=>preserve(s,words[weekdayPos].text);
    const message=String(match.message||"").replaceAll("{realDay}",catalanWeekdays[actualDay]).replaceAll("{day}",catalanWeekdays[claimedDay]).replaceAll("{currentYear}",String(currentYear));
    const from=Math.min(weekdayPos,dayPos),to=Math.max(weekdayPos,dayPos);
    const suggestions=[renderWords(words,from,to,weekdayPos,fmt(catalanWeekdays[actualDay]))];
    let corrected="";for(let offset=1;offset<7&&!corrected;offset++)for(const candidate of [day-offset,day+offset]){if(candidate<1||candidate>31)continue;const candidateDate=calendarDate(candidate,month,year);if(candidateDate?.getDay()===claimedDay){corrected=String(candidate);break;}}
    if(corrected){const dayReplacement=fullDate?`${yearText}-${monthText}-${corrected}`:corrected;suggestions.push(renderWords(words,from,to,dayPos,dayReplacement));}
    return {...match,start:words[from].start,end:words[to].end,message,suggestions};
  }
  function newYearDate(match,a){
    const year=Number(a.year),month=monthNumber(a.month),day=dayNumber(a.day),currentYear=new Date().getFullYear();
    const date=calendarDate(day,month,year);
    if(!date||new Date().getMonth()!==0||month===12||year+1!==currentYear)return null;
    return {...match,message:String(match.message||"").replaceAll("{year}",String(year)).replaceAll("{realYear}",String(currentYear)),
      suggestions:(match.suggestions||[]).map(value=>String(value).replaceAll("{year}",String(year)).replaceAll("{realYear}",String(currentYear)))};
  }
  // Port of LanguageTool's PostponedAdjectiveConcordanceFilter. It examines
  // nearby nominal groups and their possible gender/number readings before
  // deciding whether a postposed adjective is actually discordant. Keep the
  // counters and scan state local: the upstream Java filter stores some state
  // on the filter instance, which is unsafe when checking multiple matches.
  function postponedAdjective(match,a,rule,positions,words,text){
    const P={
      noun:"N.*", nounMS:"N.MS.*", nounFS:"N.FS.*", nounMP:"N.MP.*", nounMN:"N.MN.*", nounFP:"N.FP.*", nounCS:"N.CS.*", nounCP:"N.CP.*",
      nounDet:"N.*|D[NDA0I].*", gn:"_GN_.*", gnMS:"_GN_MS", gnFS:"_GN_FS", gnMP:"_GN_MP", gnFP:"_GN_FP", gnCS:"_GN_[MF]S", gnCP:"_GN_[MF]P",
      det:"D[NDA0IP].*", detCS:"D[NDA0IP]0CS0", detMS:"D[NDA0IP]0MS0", detFS:"D[NDA0IP]0FS0", detMP:"D[NDA0IP]0MP0", detFP:"D[NDA0IP]0FP0",
      groupMS:"N.[MC][SN].*|A..[MC][SN].*|V.P..SM.?|PX.MS.*|D[NDA0I]0MS0|PI0MS000", groupFS:"N.[FC][SN].*|A..[FC][SN].*|V.P..SF.?|PX.FS.*|D[NDA0I]0FS0|PI0FS000",
      groupMP:"N.[MC][PN].*|A..[MC][PN].*|V.P..PM.?|PX.MP.*|D[NDA0I]0MP0", groupFP:"N.[FC][PN].*|A..[FC][PN].*|V.P..PF.?|PX.FP.*|D[NDA0I]0FP0",
      groupCP:"N.[FMC][PN].*|A..[FMC][PN].*|D[NDA0I]0[FM]P0", groupCS:"N.[FMC][SN].*|A..[FMC][SN].*|D[NDA0I]0[FM]S0",
      adj:"AQ.*|V.P.*|PX.*|.*LOC_ADJ.*", adjMS:"A..[MC][SN].*|V.P..SM.?|PX.MS.*", adjFS:"A..[FC][SN].*|V.P..SF.?|PX.FS.*",
      adjMP:"A..[MC][PN].*|V.P..PM.?|PX.MP.*", adjFP:"A..[FC][PN].*|V.P..PF.?|PX.FP.*", adjCP:"A..C[PN].*", adjCS:"A..C[SN].*",
      adjS:"A...[SN].*|V.P..S..?|PX..S.*", adjP:"A...[PN].*|V.P..P..?|PX..P.*", adv:"R.|.*LOC_ADV.*", conj:"C.|.*LOC_CONJ.*", punctuation:"_PUNCT",
      locAdv:".*LOC_ADV.*", acceptedAdverbs:"RG_anteposat", coordination:"i|o|ni", keep:"A.*|N.*|D[NAIDP].*|SPS.*|.*LOC_ADV.*|V.P.*|_PUNCT.*|.*LOC_ADJ.*|PX.*|PI0.S000|UNKNOWN",
      keep2:",|i|o|ni", stop:"[;:]", prep:"SPS.*", levelPrep:"de|d'|en|sobre|a|entre|per|pe|amb|sense|contra|com|envers", verb:"V.[^P].*|_GV_", gv:"_GV_"
    };
    const hasTag=(token,key)=>has(token,P[key]);
    const is=(token,expr)=>has(token,expr);
    const matches=(token,key)=>re(P[key]).test(token?.text||"");
    const candidatePattern=rule.pattern||[];
    let patternIndex=candidatePattern.findIndex(token=>token.insideMarker);
    if(patternIndex<0)patternIndex=0;
    const targetIndex=(positions[patternIndex]||[])[0];
    const i=Number.isInteger(targetIndex)?targetIndex:words.findIndex((token,index)=>index>0&&token.start===match.start);
    if(i<1||i>=words.length)return null;
    const arrays=()=>Array(4).fill(0),c={nt:arrays(),nMS:arrays(),nFS:arrays(),nMP:arrays(),nMN:arrays(),nFP:arrays(),nCS:arrays(),nCP:arrays(),dMS:arrays(),dFS:arrays(),dMP:arrays(),dFP:arrays(),n:arrays(),d:arrays()};
    let canMS=false,canFS=false,canMP=false,canFP=false,canP=false,isPlural=true,isPrevNoun=false,level=0,adverbSeen=false,conjunctionSeen=false,punctuationSeen=false;
    const init=()=>{adverbSeen=false;conjunctionSeen=false;punctuationSeen=false;};
    const update=(token)=>{conjunctionSeen ||= hasTag(token,"conj");if(token.text==="com")return;if(hasTag(token,"noun")||hasTag(token,"adj"))init();else{adverbSeen ||= hasTag(token,"adv");punctuationSeen ||= hasTag(token,"punctuation")||token.text===",";}};
    const keep=(token)=>{
      if(matches(token,"levelPrep"))return true;if(token.text===".")return true;
      if((adverbSeen&&conjunctionSeen)||(adverbSeen&&punctuationSeen)||(conjunctionSeen&&punctuationSeen)||(punctuationSeen&&hasTag(token,"punctuation")))return false;
      return (hasTag(token,"keep")||matches(token,"keep2")||hasTag(token,"acceptedAdverbs"))&&!matches(token,"stop")&&(!hasTag(token,"gv")||has(token,"_GN_.*"));
    };
    let j=1;init();
    while(i-j>0&&keep(words[i-j])&&level<4){const t=words[i-j],next=words[i-j+1],prior=words[i-j-1];
      if(!isPrevNoun){
        if(hasTag(t,"noun")||(i-j-1>0&&!hasTag(t,"noun")&&hasTag(t,"adj")&&hasTag(prior,"det"))){
          for(const [key,flag] of [["gnMS","MS"],["gnFS","FS"],["gnMP","MP"],["gnFP","FP"]])if(hasTag(t,key)){c[{MS:"nMS",FS:"nFS",MP:"nMP",FP:"nFP"}[flag]][level]++;({MS:()=>canMS=true,FS:()=>canFS=true,MP:()=>canMP=true,FP:()=>canFP=true}[flag])();}
        }
        if(!hasTag(t,"gn")){
          for(const [key,field] of [["nounMS","nMS"],["nounFS","nFS"],["nounMP","nMP"],["nounMN","nMN"],["nounFP","nFP"],["nounCS","nCS"],["nounCP","nCP"]])if(hasTag(t,key)){c[field][level]++;if(["nMS","nMN","nCS"].includes(field))canMS=true;if(["nFS","nCS"].includes(field))canFS=true;if(["nMP","nMN","nCP"].includes(field))canMP=true;if(["nFP","nCP"].includes(field))canFP=true;break;}
        }
      }
      if(hasTag(t,"noun")){c.nt[level]++;isPrevNoun=true;}else isPrevNoun=false;
      if(hasTag(t,"detCS")){if(hasTag(next,"nounMS")){c.dMS[level]++;canMS=true;}if(hasTag(next,"nounFS")){c.dFS[level]++;canFS=true;}}
      if(!hasTag(t,"adv")&&!(t.readings?.some(row=>row.lemma?.toLowerCase()==="tot")&&next?.readings?.some(row=>row.lemma?.toLowerCase()==="el"))){
        for(const [key,field,flag] of [["detMS","dMS","canMS"],["detFS","dFS","canFS"],["detMP","dMP","canMP"],["detFP","dFP","canFP"]])if(hasTag(t,key)){c[field][level]++;if(flag==="canMS")canMS=true;if(flag==="canFS")canFS=true;if(flag==="canMP")canMP=true;if(flag==="canFP")canFP=true;}
      }
      if(i-j-1>0&&matches(t,"levelPrep")&&!hasTag(t,"conj")&&!matches(prior,"coordination")&&!hasTag(next,"adv"))level++;
      if(matches(t,"coordination")&&i-j-1>0&&i-j+1<words.length&&hasTag(prior,"det")&&words[i-j+1].text==="més")j++;
      update(words[i-j]);j++;
    }
    level=Math.min(level+1,4);let totalN=0,totalD=0;
    for(let k=0;k<level;k++){
      c.n[k]=c.nMS[k]+c.nFS[k]+c.nMP[k]+c.nFP[k]+c.nCS[k]+c.nCP[k]+c.nMN[k];c.d[k]=c.dMS[k]+c.dFS[k]+c.dMP[k]+c.dFP[k];totalN+=c.n[k];totalD+=c.d[k];
      if(hasTag(words[i],"adjMP")&&(c.n[k]>1||c.d[k]>1)&&(c.nMS[k]+c.nMN[k]+c.nMP[k]+c.nCS[k]+c.nCP[k]+c.dMS[k]+c.dMP[k]>0)&&(c.nFS[k]+c.nFP[k]<=c.nt[k]))return null;
      if(hasTag(words[i],"adjFP")&&(c.n[k]>1||c.d[k]>1)&&((c.nMS[k]+c.nMP[k]+c.nMN[k]+c.dMS[k]+c.dMP[k]===0)||(c.nt[k]>0&&c.nFS[k]+c.nFP[k]>=c.nt[k])))return null;
      if(c.n[k]+c.d[k]>0){isPlural=isPlural&&c.d[k]>1;canP ||= c.n[k]>1;}
    }
    isPlural ||= i-2>0&&c.nMP[0]+c.nFP[0]+c.nCP[0]>0&&words[i-2].text===",";
    if(totalN===0&&totalD===0)return null;
    let subst=null,gn=null,adj=null;
    for(const [adjKey,groupKey,tagKey] of [["adjCS","groupCS","gnCS"],["adjCP","groupCP","gnCP"],["adjMS","groupMS","gnMS"],["adjFS","groupFS","gnFS"],["adjMP","groupMP","gnMP"],["adjFP","groupFP","gnFP"]])if(hasTag(words[i],adjKey)){subst=groupKey;adj=adjKey;gn=tagKey;break;}
    if(!subst)return null;
    for(j=1;i-j>0;){const t=words[i-j];if(hasTag(t,"nounDet")&&hasTag(t,gn)||!hasTag(t,"gn")&&hasTag(t,subst))return null;if(!hasTag(t,"nounDet"))break;j++;}
    const previous=words[i-1],beforePrevious=words[i-2];
    const necessary=(hasTag(previous,"noun")&&!hasTag(previous,subst))||(hasTag(previous,"adj")&&(!hasTag(previous,gn)||!hasTag(previous,adj)))||(i>2&&hasTag(previous,"acceptedAdverbs")&&!hasTag(beforePrevious,"verb")&&!hasTag(beforePrevious,"prep"))||(i>3&&hasTag(previous,"locAdv")&&hasTag(beforePrevious,"locAdv")&&!hasTag(words[i-3],"verb")&&!hasTag(words[i-3],"prep"));
    if(!necessary)return null;
    if(!(isPlural&&hasTag(words[i],"adjS"))){j=1;init();while(i-j>0&&keep(words[i-j])){const t=words[i-j];if(!hasTag(t,"gn")&&hasTag(t,"nounDet")&&hasTag(t,subst)||hasTag(t,gn))return null;if(matches(t,"coordination")&&i-j-1>0&&hasTag(words[i-j-1],"det")&&words[i-j+1]?.text==="més")j++;update(words[i-j]);j++;}}
    const rowFor=(token,expr)=>token?.readings?.find(row=>row.tag&&re(expr).test(row.tag));let row=rowFor(words[i],P.adjCS),suggestions=[];
    if(row)suggestions.push(...synth(row,"A..CP.",true));if(!suggestions.length){row=rowFor(words[i],P.adjCP);if(row)suggestions.push(...synth(row,"A..CS.",true));}
    if(!suggestions.length&&isPlural){row=rowFor(words[i],P.adjP);if(row)suggestions.push(...synth(row,"A...P.|V.P..P..|PX..P.*",true));}
    row=rowFor(words[i],P.adj);if(row&&!suggestions.length){for(const [enabled,tag] of [[canMS&&!isPlural,"A..MS.|V.P..SM.|PX.MS.*"],[canFS&&!isPlural,"A..FS.|V.P..SF.|PX.FS.*"],[canMP,"A..MP.|V.P..PM.|PX.MP.*"],[canFP,"A..FP.|V.P..PF.|PX.FP.*"],[canMS&&(isPlural||canP),"A..MP.|V.P..PM.|PX.MP.*"],[canFS&&!canMS&&(isPlural||canP),"A..FP.|V.P..PF.|PX.FP.*"]])if(enabled)suggestions.push(...synth(row,tag,true));}
    const normalized=words[i].text.toLocaleLowerCase("ca");suggestions=unique(suggestions.filter(s=>s.toLocaleLowerCase("ca")!==normalized));if(!suggestions.length)return null;
    const addComma=a.addComma?.toLowerCase()==="true";if(!addComma)return {...match,suggestions};
    return {...match,start:match.start-1,suggestions:unique([", "+words[i].text,...suggestions.map(s=>" "+s)])};
  }
  // Port of the central Question-initial que/què filter in LanguageTool. It
  // separates the outer question from its verb group and analyzes embedded
  // completives before deciding whether the wh-role is already saturated.
  function queInici(match,a,rule,positions,words){
    const animate=new Set("persona gent home dona noi noia nen nena nan senyor senyora senyoreta pare mare fill filla germà germana amic amiga professor professora mestre mestra metge metgessa doctor doctora alcalde alcaldessa rei reina policia nadó avi àvia tia tio oncle cosí cosina veí veïna client clienta jutge gos gossa gat gata criatura company companya merdós cabró imbècil idiota desgraciat malparit beneit individu paio tipus subjecte element marit muller xiquet".split(" "));
    const neverSubject=new Set("cop vegada volta mica miqueta moment instant dilluns dimarts dimecres dijous divendres dissabte diumenge dia nit matí tarda vespre hora temps setmana mes any".split(" "));
    const temporal=new Set("cop vegada volta moment instant dilluns dimarts dimecres dijous divendres dissabte diumenge dia nit matí tarda vespre hora temps setmana mes any".split(" "));
    const weekdays=new Set("dilluns dimarts dimecres dijous divendres dissabte diumenge".split(" "));
    const accusative=new Set("em et el la ens us les els".split(" ")),dative=new Set("em et li ens us els".split(" "));
    const interrogative=new Set("que què quin quina quins quines qui quant quants quanta quantes res".split(" "));
    const copular=new Set("ser ésser estar semblar parèixer".split(" "));
    const completiveGapVerbs=new Set("creure pensar dir opinar afirmar suposar imaginar saber considerar sospitar témer voler desitjar necessitar esperar preferir".split(" "));
    const finite=token=>has(token,"V.[SI].*"),anyVerb=token=>tagged(token,"V.*");
    const lemma=token=>anyVerb(token)?.lemma?.toLowerCase()||"";
    const hasLemma=(token,value)=>token?.readings?.some(row=>row.lemma?.toLowerCase()===value)||false;
    const surface=(token)=>String(token?.text||"").toLowerCase();
    const pos=positions.findIndex((_,index)=>rule.pattern[index]?.insideMarker);
    const queIndex=(positions[pos]||[])[0];if(!Number.isInteger(queIndex))return match;
    const que=words[queIndex];if(!que||!/^qu[eè]$/iu.test(que.text))return match;
    const question=words.findIndex((token,index)=>index>queIndex&&token.text==="?");if(question<0)return match;
    let coreEnd=question,lastCore=question-1;
    const confirmation=new Set("veritat oi eh no cert potser".split(" "));
    if(lastCore>queIndex&&words[lastCore-1]?.text===","&&confirmation.has(surface(words[lastCore])))coreEnd=lastCore-1;
    const lastWord=words.at(-2)?.text||"";
    const yesNoTail=["potser","oi"].includes(lastWord.toLowerCase())||lastWord==="què"&&words.at(-1)?.text==="o"||lastWord==="no"&&words.at(-1)?.text===",";
    const anotherSubject=lastWord==="això";
    let tail=words.length-2;while(tail>queIndex&&has(words[tail],"D.*|N.*|A.*|PP3.*|PX.*|PD.*"))tail--;
    const trailingDislocation=tail<words.length-2&&tail>queIndex&&words[tail].text===",";
    const verb=verbModel(words,queIndex+1);if(!verb)return match;
    const firstVerb=verb.first,mainVerb=verb.last,mainLemma=lemma(words[mainVerb]);if(!mainLemma)return match;
    if(a.mode==="completive"&&!(surface(words[mainVerb+1])==="que"&&completiveGapVerbs.has(mainLemma)))return match;
    const verb3s=has(words[firstVerb],"V.[SI].3S.*"),verb3p=has(words[firstVerb],"V.[SI].3P.*"),verb2p=has(words[firstVerb],"V.[SI].2P.*");
    const afterVerb=verb.last+verb.afterCount+1;
    const clitics=[];
    for(let i=firstVerb-verb.beforeCount;i<firstVerb;i++){const r=tagged(words[i],pronounTag);if(r)clitics.push(normalized(r.token).trim());}
    for(let i=mainVerb+1;i<=verb.last+verb.afterCount;i++){const r=tagged(words[i],pronounTag);if(r)clitics.push(normalized(r.token).trim());}
    const hasHo=clitics.includes("ho"),hasAcc=clitics.some(p=>accusative.has(p)),hasAccNotDat=clitics.some(p=>accusative.has(p)&&!dative.has(p)),hasDat=clitics.some(p=>dative.has(p));
    const postverbalCanBeSubject=(start,v3s,v3p,v2p)=>{
      for(let i=start;i<words.length&&i<=start+4;i++){
        const t=words[i],form=surface(t);if(["?",","].includes(form))break;
        if(has(t,"NP.*"))return true;
        const noun=tagged(t,"NC.*");if(!noun)continue;
        const nlemma=(noun.lemma||"").toLowerCase();if(neverSubject.has(nlemma))return false;
        if(!animate.has(nlemma)&&!has(t,"NCCN000"))return false;
        const singular=has(t,"NC.S.*"),plural=has(t,"NC.P.*|NCCN000");
        return (v3s&&singular)||((v3p||v2p)&&plural)||(!singular&&!plural);
      }
      return false;
    };
    let canSubject=(verb3s||verb3p||verb2p)&&afterVerb<words.length
      ?postverbalCanBeSubject(afterVerb,verb3s,verb3p,verb2p):false;
    let canObject=hasAccNotDat;
    if(afterVerb<words.length&&has(words[afterVerb],"N.*"))canObject=true;
    else if(afterVerb+1<words.length&&(has(words[afterVerb],"D.*")||interrogative.has(surface(words[afterVerb]))))canObject=true;
    if(mainLemma==="veure"&&hasAcc)canObject=true;
    let exceptionObject=false,exceptionSubject=false;
    if(afterVerb+1<words.length){const a1=words[afterVerb],a2=words[afterVerb+1];const common=a2.chunkTags?.includes("PTime")||has(a2,"_loc_unavegada|_data_concreta")||hasLemma(a1,"tot");exceptionObject=!hasAccNotDat&&common;exceptionSubject=common;}
    canObject=canObject&&!exceptionObject;
    if(mainLemma==="fer"){
      let time=false,determiner=false;
      for(let i=afterVerb;i<coreEnd&&i<=afterVerb+3;i++){
        if(has(words[i],"D.*")){determiner=true;continue;}
        const noun=tagged(words[i],"NC.*"),nlemma=(noun?.lemma||"").toLowerCase();time=Boolean(noun&&temporal.has(nlemma)&&(determiner||weekdays.has(nlemma)));break;
      }
      if(time)canObject=false;
    }
    canSubject=canSubject&&!exceptionSubject&&!anotherSubject&&!trailingDislocation;
    let queSubject=false,queObject=false,saturated=false;
    if(verb3s&&mainVerb>1){let nextQue=-1;for(let i=mainVerb+1;i<words.length;i++)if(surface(words[i])==="que"){nextQue=i;break;}
      const nearby=mainVerb<nextQue&&nextQue<mainVerb+5,previous=anyVerb(words[mainVerb-1]);
      queSubject=(nearby||hasAccNotDat)&&(mainLemma==="fer"||previous?.lemma?.toLowerCase()==="fer");
    }
    if(finite(words[mainVerb])&&surface(words[mainVerb+1])==="que"&&mainLemma!=="veure"){
      if(completiveGapVerbs.has(mainLemma)){
        const emb=verbModel(words,mainVerb+2);
        if(emb){
          const embLemma=lemma(words[emb.last]);
          const embeddedPronouns=[];
          for(let i=emb.first-emb.beforeCount;i<emb.first;i++){const r=tagged(words[i],pronounTag);if(r)embeddedPronouns.push(normalized(r.token).trim());}
          for(let i=emb.last+1;i<=emb.last+emb.afterCount;i++){const r=tagged(words[i],pronounTag);if(r)embeddedPronouns.push(normalized(r.token).trim());}
          if(embeddedPronouns.some(p=>(accusative.has(p)&&!dative.has(p))||p==="ho"||p==="en"))saturated=true;
          else{
            const overtSubject=words.slice(mainVerb+2,emb.first).some(t=>has(t,"PP[123].*|NP.*"));
            const embCopular=copular.has(embLemma);
            const embClasses=data.verbClassification?.[embLemma]||"";
            const embIntransitive=/\b(?:intr|abs)\b/u.test(embClasses)&&!/\bvtr\b/u.test(embClasses)&&!embCopular;
            let content=-1;
            for(let i=emb.last+emb.afterCount+1;i<coreEnd;i++){
              if(["?",","].includes(surface(words[i])))break;
              if(has(words[i],"R.|RG|RN"))continue;
              content=i;break;
            }
            let gap;
            if(embCopular){
              if(content<0)gap=true;
              else if(["això","allò","açò","ho","que","què","quin","quina","quins","quines","qui","quant","quants","quanta","quantes","res"].includes(surface(words[content])))gap=true;
              else if(has(words[content],"A.*|V.P.*|N.*|D.*|PI.*|PX.*|Z.*|SPS.*"))gap=false;
              else gap=true;
            }else if(content<0)gap=!(overtSubject&&embIntransitive);
            else if(has(words[content],"D.*|N.*|PI.*|PX.*|PD.*|Z.*")&&!interrogative.has(surface(words[content])))
              gap=postverbalCanBeSubject(content,has(words[emb.first],"V.[SI].3S.*"),has(words[emb.first],"V.[SI].3P.*"),has(words[emb.first],"V.[SI].2P.*"));
            else gap=!embIntransitive;
            if(gap===false)saturated=true;else queObject=true;
          }
        }else queObject=true;
      }else queObject=true;
    }
    const fer=mainLemma==="fer",firstLexical=()=>{for(let i=afterVerb;i<coreEnd;i++){if([",","?"].includes(surface(words[i])))break;if(["pas","gaire","més"].includes(surface(words[i])))continue;return i;}return -1;};
    const nounPos=firstLexical(),nounSurface=surface(words[nounPos]);
    const ferPorMal=fer&&nounPos>=0&&(hasLemma(words[nounPos],"por")||hasLemma(words[nounPos],"mal"))&&(
      hasDat||Array.from({length:4},(_,k)=>words.slice(nounPos+1,nounPos+4).some(t=>has(t,"V.N.*"))).some(Boolean)
      ||words.slice(nounPos+1,Math.min(coreEnd,nounPos+5)).some(t=>has(t,"D.*|N.*|NP.*|PI.*"))
      ||words.slice(Math.max(1,mainVerb-4),mainVerb).some(t=>["voler","poder","deure","haver"].includes(lemma(t)))
    );
    const ferPorQue=fer&&nounPos>=0&&hasLemma(words[nounPos],"por")&&surface(words[nounPos+1])==="que";
    const ferMal=fer&&nounPos>=0&&!new Set("cap algun alguna un una".split(" ")).has(nounSurface)&&(hasLemma(words[nounPos],"mal")||hasLemma(words[nounPos],"por")&&surface(words[nounPos+1])!=="que");
    if(!que.text.toLowerCase().startsWith("què")&&(ferPorMal||ferPorQue)){queSubject=false;canObject=true;}else if(ferMal){queSubject=true;canObject=false;}
    const classes=data.verbClassification?.[mainLemma]||"",intransitive=(/\b(?:intr|abs)\b/u.test(classes)&&!/\bvtr\b/u.test(classes)&&!copular.has(mainLemma))||(mainLemma==="ser"&&clitics.includes("hi"));
    let effectiveIntransitive=intransitive;if(["passar","agradar"].includes(mainLemma)){effectiveIntransitive=true;queSubject=!canObject;}else if(effectiveIntransitive)queSubject=false;
    queSubject=queSubject&&!anotherSubject;
    if(que.text.toLowerCase().startsWith("què")&&ferMal){effectiveIntransitive=false;queSubject=true;canObject=false;}
    let predicts=queSubject||queObject||(!effectiveIntransitive&&((!canObject&&!hasHo)||canSubject));
    if(saturated&&!queSubject)predicts=false;if(yesNoTail&&!queSubject&&!queObject)predicts=false;
    return predicts?match:null;
  }
  function suppressIfAnyRuleMatches(match,a,context){
    const ruleIds=new Set(String(a.ruleIDs||"").split(",").filter(Boolean));if(!ruleIds.size)return match;
    const originalText=String(context.text||""),start=match.start,end=match.end;
    const first=context.words.find(token=>token.kind!=="sentence-start")?.start??start;
    const last=context.words.at(-1)?.end??end;
    const sentenceText=originalText.slice(first,last);
    const recursionKey=JSON.stringify([String(a.ruleIDs),sentenceText,start-first,end-first,match.suggestions||[]]);
    if(suppressRecursionGuard.has(recursionKey))return match;
    suppressRecursionGuard.add(recursionKey);
    try{
    const locallyMatches=(tokens,text,offset)=>globalThis.CorrectorCatalanPatternRuleMatcher.findMatches(tokens,text,{arbitrate:false,ruleIds,skipFilters:false,includeOtherFamilies:false})
      .some(candidate=>{const from=candidate.start+offset,to=candidate.end+offset;return to>=start&&to<=end||end>=from&&end<=to;});
    for(const replacement of match.suggestions||[]){
      const singleToken=replacement.length===end-start&&!/\s/u.test(replacement);
      const tokenIndex=context.words.findIndex(token=>token.start===start&&token.end===end&&token.kind!=="sentence-start");
      const fastAvailable=singleToken&&tokenIndex>=0;
      if(fastAvailable){
        const taggedReadings=lex(replacement),fastTokens=context.words.map((token,index)=>{
          const copy={...token,start:token.start-first,end:token.end-first};
          if(index===tokenIndex)return {...copy,text:replacement,readings:taggedReadings,lexicalReadings:taggedReadings,contextualReadings:taggedReadings,chunkTags:[]};
          return copy;
        });
        if(locallyMatches(fastTokens,sentenceText,first))return null;
        if(a.fastOnly==="true")continue;
      }
      const changed=sentenceText.slice(0,start-first)+replacement+sentenceText.slice(end-first);
      if(locallyMatches(analyze(changed),changed,first))return null;
    }
    return match;
    }finally{suppressRecursionGuard.delete(recursionKey);}
  }
  function apply(rule,match,context){
    activeLocaleProfile=context.localeProfile||"inclusive";
    const {words,positions,text}=context,flat=positions.flat(),pattern=words.slice(flat[0],flat.at(-1)+1),a=args(rule,pattern,positions,words);
    switch(name(rule)){
      case "CatalanRemoteRewriteFilter":return match;
      case "PostponedAdjectiveConcordanceFilter":return postponedAdjective(match,a,rule,positions,words,text);
      case "QueIniciFilter":return queInici(match,a,rule,positions,words);
      case "AdjustVerbSuggestionsFilter":return adjustVerb(match,a,words);
      case "AdjustPronounsFilter":return adjustPronouns(match,a,words);
      case "DonarseliBeFilter":return donarseli(match,words);
      case "AdvancedSynthesizerFilter":return advancedSynthesizer(match,a,pattern);
      case "CheckPostagsInSuggestionFilter":return checkPostagsInSuggestion(match,a);
      case "ConvertToSentenceCaseFilter":return convertToSentenceCase(match,pattern);
      case "TextToNumberFilter":return textToNumber(match,pattern);
      case "AnarASuggestionsFilter":return anarASuggestions(match,words);
      case "PortarGerundiSuggestionsFilter":return portarGerundi(match,a,words);
      case "DonarTempsSuggestionsFilter":return donarTemps(match,words);
      case "PossessiusRedundantsFilter":return possessiusRedundants(match,words);
      case "PortarTempsSuggestionsFilter":return portarTemps(match,words);
      case "EnNoInfinitiuSuggestionFilter":return enNoInfinitiu(match,words);
      case "OblidarseSugestionsFilter":return oblidarse(match,words);
      case "DateCheckFilter":return dateCheck(match,a,words,positions);
      case "NewYearDateFilter":return newYearDate(match,a);
      case "SuppressIfAnyRuleMatchesFilter":return suppressIfAnyRuleMatches(match,a,context);
      case "MultitokenSpellerFilter":{
        const start=words.findIndex((token,index)=>index>0&&token.start===match.start&&token.kind!=="space");
        let end=start;while(end>=0&&end+1<words.length&&words[end].end<match.end)end++;
        if(start<0||words.slice(start,end+1).every(token=>token.ignoredBySpeller))return null;
        const allUppercase=allUpper(match.text);
        let suggestions=multitokenSpeller.suggestions(match.text,{allUppercase});
        if(!allUppercase){
          let firstWord=1;while(firstWord<words.length&&(/^[\p{P}\p{S}]+$/u.test(words[firstWord].text)||words[firstWord].kind!=="word"))firstWord++;
          if(start===firstWord)suggestions=suggestions.map(value=>/^\p{Ll}/u.test(value)?upperFirst(value):value);
        }
        return suggestions.length?{...match,suggestions:unique(suggestions.filter(value=>value!==match.text))}:null;
      }
      case "CatalanNumberInWordFilter":{
        const word=String(a.word||""),letter=word.replaceAll("0","o"),stripped=word.replace(/\d/gu,"");
        if(!word)return null;
        const suggestions=[];
        if(letter!==word&&!CorrectorCatalanMorfologikSpeller.isMisspelled(letter))suggestions.push(letter);
        if(stripped&&!CorrectorCatalanMorfologikSpeller.isMisspelled(stripped))suggestions.push(stripped);
        if(!suggestions.length&&stripped)suggestions.push(...CorrectorCatalanMorfologikSpeller.findSimilarWords(stripped));
        const filtered=unique(suggestions).filter(value=>value!==match.text);
        return filtered.length?{...match,suggestions:filtered}:null;
      }
      case "CatalanNumberSpellerFilter":{
        const number=String(a.number_to_spell||"").replaceAll(".","");
        let suggestion=spellCatalanNumber(number,a.gender==="feminine");
        if(!suggestion||suggestion.replaceAll("-i-"," ").replaceAll("-"," ").split(/\s+/u).length>=4)return null;
        const preceding=pattern.filter(token=>token.end<=match.start&&token.kind!=="space").at(-1);
        if(!preceding||preceding.kind==="sentence-start"||pattern.findIndex(token=>token.start===match.start&&token.kind!=="space")<=1)suggestion=upperFirst(suggestion);
        return {...match,suggestions:[suggestion]};
      }
      case "FindSuggestionsFilter":{
        let word=a.wordFrom==="inmarker"?match.text.replaceAll(" ","").replace(/(l)[.•⋅∙-](l)/giu,"$1·$2"):pattern[position(a.wordFrom,pattern,match)]?.text;
        if(!word)throw new Error("Unsupported FindSuggestions position: "+a.wordFrom);
        const plain=s=>s.normalize("NFD").replace(/\p{M}/gu,"").toLowerCase();
        const mode=a.Mode==="diacritics";if(mode&&lex(word).some(r=>r.tag&&re(a.desiredPostag).test(r.tag)))return null;
        const replacements=[];let priority=0;
        for(const s of CorrectorCatalanMorfologikSpeller.findSimilarWords(word)){
          const readings=lex(s);if(readings.some(r=>["enterar","sentar","conseguir","alcançar","liar","vore"].includes(r.lemma))&&!readings.some(r=>["enter","sentir"].includes(r.lemma)))continue;
          if(replacements.length>=20)break;
          if(s===word||!readings.some(r=>r.tag&&re(a.desiredPostag).test(r.tag))||replacements.includes(s)||replacements.includes(s.toLowerCase())||mode&&plain(s)!==plain(word)||a.removeSuggestionsRegexp&&re(a.removeSuggestionsRegexp).test(s))continue;
          const value=preserve(s,word);if(a.priorityPostag&&readings.some(r=>r.tag&&re(a.priorityPostag).test(r.tag)))replacements.splice(priority++,0,value);else replacements.push(value);
        }
        const finished=match.suggestions.some(s=>!s.toLowerCase().includes("{suggestion}"));if(!replacements.length&&!finished&&(mode||a.suppressMatch==="true"))return null;
        let used=false;const suggestions=[];for(const s of match.suggestions){if(/\{(?:suggestion|Suggestion|SUGGESTION)\}/u.test(s)){used=true;for(const replacement of replacements){if(suggestions.length>=10)break;const value=s.replaceAll("{suggestion}",replacement).replaceAll("{Suggestion}",upperFirst(replacement)).replaceAll("{SUGGESTION}",replacement.toUpperCase());if(!suggestions.includes(value))suggestions.push(value);}}else if(!suggestions.includes(s))suggestions.push(s);}
        if(!used)for(const s of replacements){if(suggestions.length>=10)break;if(!suggestions.includes(s))suggestions.push(s);}
        return {...match,suggestions:suggestions.filter(s=>s!==match.text)};
      }
      case "FindSuggestionsEsFilter":{
        // Port of LanguageTool's Catalan FindSuggestionsEsFilter. The rule
        // marks `es|és` as context and the following unknown token as the
        // misspelling; use the same local Morfologik candidate order, then
        // retain only candidate readings accepted by the upstream POS sets.
        const matched = positions.flatMap(row => row || []);
        const first = matched[0];
        const target = matched[1];
        if (!Number.isInteger(first) || !Number.isInteger(target)) return null;
        const prefix = words[first]?.text || "";
        const unknown = words[target]?.text || "";
        if (!unknown) return null;
        const nominal = re("NP..[^0].*|NC.[SN].*|A...[SN].|V.P..S..|V.[NG].*|RG|PX..S...");
        const finiteThirdPerson = re("V...3.*");
        const apostropheRequired = /^h?[aeiouàèéíòóú].*/iu;
        const replacements = [];
        let usedEsAccent = false;
        let usedEs = false;
        for (const candidate of CorrectorCatalanMorfologikSpeller.findSimilarWords(unknown)) {
          const readings = lex(candidate);
          if (readings.some(reading => reading.tag && nominal.test(reading.tag))) {
            replacements.push(`és ${candidate}`);
            usedEsAccent = true;
          }
          if (readings.some(reading => reading.tag && finiteThirdPerson.test(reading.tag))
              && !apostropheRequired.test(candidate)) {
            replacements.push(`es ${candidate.toLocaleLowerCase("ca")}`);
            usedEs = true;
          }
          if (replacements.length >= 20) break;
        }
        if (!replacements.length) return null;
        const initialUpper = Boolean(prefix && prefix[0].toLocaleUpperCase("ca") === prefix[0]);
        const suggestions = unique(replacements.map(value => initialUpper ? upperFirst(value) : value))
          .filter(value => value !== match.text).slice(0, 20);
        if (prefix.toLocaleLowerCase("ca") === "és" && usedEsAccent && !usedEs) return null;
        let message = match.message;
        if (usedEsAccent) message += " \"És\" (del verb 'ser') s'escriu amb accent.";
        if (usedEs) message += " \"Es\" (pronom) acompanya un verb en tercera persona.";
        return suggestions.length ? {...match, message, suggestions} : null;
      }
      case "AdaptSuggestionsFilter":return {...match,suggestions:match.suggestions.map(s=>adapt(s,match.text))};
      case "ConvertToGenderAndNumberFilter":return convert(match,a,words,text);
      case "SynthesizeWithDAFilter":return withDeterminer(match,a,words,pattern,false);
      case "SynthesizeWithAnyDeterminerFilter":return withDeterminer(match,a,words,pattern,true);
      case "CatalanSuppressMisspelledSuggestionsFilter":{
        const suggestions=match.suggestions.filter(s=>!analyze(s).some(t=>t.chunkTags?.includes("_incorrect_verb_")||t.kind==="word"&&!t.immunized&&!t.ignoredBySpeller&&!has(t,"(?!(?:SENT_END|PARAGRAPH_END)$).+")&&!CorrectorCatalanSpellingLexicon.isAccepted(t.text))
          &&(!a.SuppressPostag||!lex(s).some(r=>r.tag&&re(a.SuppressPostag).test(r.tag)))&&(!a.FilterPostag||lex(s).some(r=>r.tag&&re(a.FilterPostag).test(r.tag))));
        return !suggestions.length&&a.suppressMatch!=="false"?null:{...match,suggestions};
      }
      case "AddCommasFilter":{
        const from=words.findIndex((t,i)=>i>0&&t.start>=match.start);let to=from;while(to<words.length&&words[to].end<match.end)to++;
        const punct=s=>/^[\p{P}\p{S}]+$/u.test(s),before=from===1||punct(words[from-1].text)||/^\p{Lu}[^\p{Lu}]*$/u.test(words[from].text),next=words[to+1],after=next&&punct(next.text)&&!(next.whitespaceBefore&&/^[«“"‘'„¿¡]$/u.test(next.text));
        if(before&&after)return null;
        if(a.suggestSemicolon==="true"&&words[from-1].text===","&&!after)return {...match,start:words[from-1].start,end:words[to].end,suggestions:["; "+match.text+",",", "+match.text+","]};
        if(before)return {...match,start:words[to].start,suggestions:[words[to].text+","]};
        const start=words[from].start-(words[from].whitespaceBefore?1:0);return after?{...match,start,end:words[from].end,suggestions:[", "+words[from].text]}:{...match,start,end:words[to].end,suggestions:[", "+match.text+","]};
      }
      case "DiacriticsCheckFilter":{
        const form=a.form||"",rows=data.confusions[form.toLowerCase()];if(!rows||!rows.some(row=>re(a.postag).test(row.tag)))return null;
        if(a.gendernumberFrom){const token=pattern[Number(a.gendernumberFrom)-1];let desired=null;for(const gn of ["MS","MP","FS","FP","CP","CS"]){if(has(token,`[NAPD].+${gn}.*|V.P..${gn[1]}${gn[0]}.`)){desired=gn;break;}}
          if(!desired)return null;const patterns={...gnPatterns,CP:"NC[MFC][PN]000|A..[MFC][PN].|V.P..P..",CS:"NC[MFC][SN]000|A..[MFC][SN].|V.P..S.."};if(!re(patterns[desired]).test(rows[0].tag))return null;
        }
        const replacement=preserve(rows[0].form,form),diacritics=s=>s.normalize("NFD")!==s;return {...match,message:diacritics(replacement)&&!diacritics(form)?match.message:match.message.replace("s'escriu amb accent","s'escriu d'una altra manera"),suggestions:match.suggestions.map(s=>s.replaceAll("{suggestion}",replacement).replaceAll("{Suggestion}",upperFirst(replacement)).replaceAll("{SUGGESTION}",replacement.toUpperCase()))};
      }
      default:throw new Error("Unsupported filter: "+rule.filterClass);
    }
  }
  globalThis.CorrectorCatalanRuleFilters=Object.freeze({supports,load,apply,convert,adapt,determiner,
    spellerPronounSuffixes:()=>data?.spellerPronounsAfter?.slice()||[],
    transformSpellerPronounAfter:(input,verb)=>data?after(input,verb):"",
    configure:options=>{lex=options.lex;analyze=options.analyze;multitokenSpeller=options.multitoken;}});
})();
