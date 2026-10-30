/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Local adaptations of LanguageTool Catalan filters and VerbSynthesizer.
 * upstream LGPL-2.1-or-later; local adaptation GPL-3.0-or-later under LGPL-2.1 section 3. Upstream: Jaume Ortolà, Daniel Naber and contributors.
 * This module never performs network requests. See licenses/languagetool-runtime/NOTICE.md.
 */
(() => {
  'use strict';
  const uniq=values=>[...new Set(values)],vowel=s=>/^h?[aeiouàèéíòóú]/iu.test(s);
  const reflexive={'1S':'em','2S':'et','3S':'es','1P':'ens','2P':'us','3P':'es'};
  const dative={...reflexive,'3S':'li','3C':'li','3P':'els'};
  const pronounTag='P0.{6}|PP3CN000|PP3NN000|PP3..A00|PP[123]CP000|PP3CSD00';
  // Numeric subset of ca.sor. BigInt preserves all source-supported magnitudes.
  function spellNumber(input,feminine=false){
    const small=['zero','un','dos','tres','quatre','cinc','sis','set','vuit','nou','deu','onze','dotze','tretze','catorze','quinze','setze','disset','divuit','dinou'];
    const tens=['','','vint','trenta','quaranta','cinquanta','seixanta','setanta','vuitanta','noranta'];
    const integer=(n,top=false)=>{
      if(!n)return top?'zero':'';
      if(n<20n)return small[Number(n)];
      if(n<100n)return tens[Number(n/10n)]+(n%10n?(n<30n?'-i-':'-')+integer(n%10n):'');
      if(n<1000n)return (n/100n===1n?'cent':integer(n/100n)+'-cents')+(n%100n?' '+integer(n%100n):'');
      for(const [power,singular,plural]of [[24,'un quadrilió','quadrilions'],[18,'un trilió','trilions'],[12,'un bilió','bilions'],[6,'un milió','milions'],[3,'mil','mil']]){
        const base=10n**BigInt(power);if(n<base)continue;const q=n/base;
        if(q>=1000000n)return '';
        return (q===1n?singular:integer(q)+' '+plural)+(n%base?' '+integer(n%base):'');
      }return '';
    };
    if(!/^[-−]?\d+(?:[.,]\d*)?$/u.test(input))return '';
    const negative=/^[-−]/u.test(input),parts=input.replace(/^[-−]/u,'').split(/[.,]/u);
    let value=integer(BigInt(parts[0]),true);if(!value)return '';
    if(parts.length>1)value+=' coma'+[...parts[1]].map(d=>' '+small[Number(d)]).join('');
    if(feminine){const last=value.lastIndexOf('ili'),head=last<0?'':value.slice(0,last+3);let tail=last<0?value:value.slice(last+3);tail=tail.replace(/un(?!a)/gu,'una').replace(/dos/gu,'dues').replace(/cents/gu,'centes');value=head+tail;}
    return (negative?'menys ':'')+value;
  }
  function distance(a,b){
    const levenshtein=(a,b)=>{let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]!==b[j-1]));prev=next;}return prev[b.length];};
    if(a.replaceAll(' ','')===b.replaceAll(' ',''))return 0;
    const similar=s=>s.replaceAll('y','i').replaceAll('ko','co').replaceAll('ka','ca');let d=Math.min(levenshtein(a,b),levenshtein(similar(a),similar(b)));
    const anagram=[...a].sort().join('')===[...b].sort().join('');return anagram&&d>0&&a.length===b.length?1:anagram&&d>1?d-1:d;
  }
  class Pronouns {
    constructor(rt){this.rt=rt;this.table=rt.filterResources.pronounTable;}
    transform(input,position){
      if(!this.table)throw Error('Missing original pronoun table');
      input=input.toLocaleLowerCase('ca').trim().replaceAll('’',"'");
      input=this.rt.filterResources.incorrectPronounOrders[input]||input;
      const index=this.table.indexOf(input);if(index<0)return '';
      let value=this.table[Math.floor(index/7)*7+position];
      // Central realization of dative + accusative; lexical readings remain unchanged.
      const canonical=this.table[Math.floor(index/7)*7+6];
      if(position!==6&&canonical==='li el')value=["l'hi","l'hi","-l'hi","-l'hi"][position]||value;
      if(position!==6&&canonical==='li els')value=['els hi','els hi','-los-hi',"'ls-hi"][position]||value;
      if(position===0||position===1&&!value.endsWith("'"))value+=' ';
      return value;
    }
    normalized(input){return this.transform(input,6);}
    before(input,verb){const result=this.transform(input,vowel(verb)?1:0);return result==='es '&&/^(s|ce|ci)/iu.test(verb)?'se ':result;}
    after(input,verb){return this.transform(input,/[aei]$/iu.test(verb)?3:2);}
    apply(input,verb,after){return after?verb+this.after(input,verb):this.before(input,verb)+verb;}
    action(action,input,verb,person,after){
      const normalized=this.normalized(input),hasReflexive=normalized.split(' ').some(p=>['em','et','es','ens','us','vos'].includes(p));
      if(action==='None')return this.apply(input,verb,after);
      if(action==='removePronounReflexive')return this.apply(normalized.replace(/em|et|es|ens|us|vos/iu,'').trim(),verb,after);
      if(action==='addPronounEn'){const value=normalized.endsWith('hi')?normalized.replaceAll('hi','en hi'):(normalized+' en').trim(),pronoun=after?this.after(value,verb):this.before(value,verb);return pronoun?(after?verb+pronoun:pronoun+verb):'';}
      if(action==='addPronounDative')return this.apply(dative[person]||'',verb,after);
      if(action==='addPronounHi')return 'hi '+verb;
      if(action==='replaceEmEn')return ({em:'en ',"m'":"n'","m'hi":"n'hi "})[input.toLowerCase()]?({em:'en ',"m'":"n'","m'hi":"n'hi "})[input.toLowerCase()]+verb:'';
      if(action==='addPronounReflexiveImperative')return input?'':this.apply(reflexive[person==='3S'?'2S':person]||'',verb,true);
      if(action==='addPronounReflexiveHo')return this.apply((reflexive[person]||(hasReflexive?normalized:'es'))+' ho',verb,after);
      if(action==='addPronounReflexiveEn'){
        if(after)return this.apply(/[mts][e']|[e'][mts]|vos|us|ens|-nos|-vos/iu.test(input)?input+"'n":"-se'n",verb,true);
        return this.apply(input?'es '+normalized+' en':(reflexive[person]||'')+' en',verb,false);
      }
      if(action==='addPronounReflexiveHi')return this.action('addPronounReflexive','','hi '+verb,person,after);
      if(action==='addPronounReflexiveLes')return this.action('addPronounReflexive',normalized+' les',verb,person,after);
      if(action==='addPronounReflexive'){
        if(after){if(hasReflexive)return this.apply(input,verb,true);return /r$|re$/u.test(verb)?this.apply('-se',verb,true):verb;}
        return this.apply((hasReflexive?'':(reflexive[person]||'')+' ')+normalized,verb,false);
      }
      throw Error('Unsupported pronoun action: '+action);
    }
    fix(s){
      if(/d'[^aeiouh]/iu.test(s))s=s.replaceAll("d'",'de ');
      s=s.replace(/^(.*)\be([stm]) (h?[aeiouh].*)$/iu,"$1$2'$3");
      s=s.replace(/^([mts])'([^aeiouh].*)$/iu,'e$1 $2');
      return s.replace(/^(.*)(-[stm])e-(h[oi])$/iu,"$1$2'$3");
    }
    intransitive(s){return s.replaceAll("-se'l",'-se-li').replaceAll("se'l ",'se li ').replaceAll("l'",'li ').replaceAll('-lo','-li').replaceAll('-la','-li').replaceAll('la ','li ').replaceAll('el ','li ').replaceAll('ho','hi');}
  }
  class VerbGroup {
    constructor(rt,rows,start,backward=false){
      this.rt=rt;this.rows=rows;this.first=this.last=-1;this.beforeCount=this.afterCount=0;
      this.sentence=rows[start]?.sentence;if(this.sentence==null)return;
      if(this.read(start,'V.P.*')&&!this.chunk(start)&&!this.has(start,'_GV_')){this.first=this.last=start;return;}
      let i=start;
      if(backward){while(i>0&&!this.isVerb(i))i--;let found=false;while(i>0&&this.isVerb(i)){found=true;i--;}if(found)i++;}
      else while(i<rows.length&&!this.isVerb(i)&&rows[i].sentence===this.sentence)i++;
      if(!this.isVerb(i))return;
      this.first=this.last=i;
      while(this.multitoken(this.first-1)&&!this.read(this.first,'V.[IS].*'))this.first--;
      while(this.multitoken(this.last+1)&&!(this.read(this.first,'V.[IS].*')&&this.read(this.last+1,'V.[IS].*')))this.last++;
      let j=this.last+1;while(this.same(j)&&!rows[j].whitespaceBefore&&this.read(j,pronounTag)){this.afterCount++;j++;}
      j=this.first-1;let noSpace=0;
      while(this.same(j)&&!rows[j].sentenceStart&&this.read(j,pronounTag)){
        if(rows[j].whitespaceBefore||rows[j-1]?.sentenceStart||this.has(j-1,'_QM.*')){this.beforeCount+=noSpace+1;noSpace=0;}else noSpace++;j--;
      }
    }
    same(i){return this.rows[i]?.sentence===this.sentence;}
    read(i,pattern){return this.same(i)?this.rt.readings(this.rows[i]).find(r=>this.rt.re(pattern).test(r.tag||'')):null;}
    has(i,pattern){return !!this.read(i,pattern);}
    chunk(i){return this.same(i)&&this.rows[i].chunks?.includes('GV');}
    isVerb(i){return this.chunk(i)||this.has(i,'V.[^P].*')||this.has(i,'V.P.*')&&this.has(i,'_GV_');}
    multitoken(i){return this.chunk(i)||this.has(i,'_GV_');}
    get undefined(){return this.first<0||this.last<0;}
    get finiteTag(){return this.read(this.first,'V.[IS].*')?.tag||'';}
    get person(){return this.read(this.first,'V.[SIM].*')?.tag.slice(4,6)||'';}
    get periphrastic(){return this.read(this.first,'VA.*')?.lemma==='anar'&&this.has(this.first+1,'V.N.*');}
    get perfect(){return this.read(this.first,'VA.*')?.lemma==='haver'&&this.has(this.first+1,'V.P.*');}
    string(a,b){return this.rows.slice(a,b+1).map((r,i)=>(i&&r.whitespaceBefore?' ':'')+r.token).join('');}
    get before(){return this.string(this.first-this.beforeCount,this.first-1);}
    get after(){return this.string(this.last+1,this.last+this.afterCount);}
    get start(){return this.first-this.beforeCount;}
    get end(){return this.last+this.afterCount;}
    get casing(){return this.string(this.start,this.first);}
    synth(lemma,tag){
      if(this.undefined)return '';
      const adjusted=(l,t)=>l==='haver'?'VA'+t.slice(2):['ser','ésser'].includes(l)?'VS'+t.slice(2):t;
      const form=(l,t)=>{t=adjusted(l,t);return this.rt.synthesize(l,t,{regexp:true})[0]||this.rt.synthesize(l,t.slice(0,-1)+'[0CXY12]',{regexp:true})[0]||'';};
      if(this.first===this.last)return form(lemma,tag);
      let value='';
      for(let i=this.first;i<=this.last;i++){
        const reading=this.read(i,'V.*');
        if(i===this.first){value=form(reading?.lemma,tag);if(!value)return '';}
        else if(i===this.last){const last=form(lemma,reading?.tag||'');if(!last)return '';value+=(this.rows[i].whitespaceBefore?' ':'')+last;}
        else value+=(this.rows[i].whitespaceBefore?' ':'')+this.rows[i].token;
      }
      return this.rt.adaptSuggestion(value,'');
    }
  }
  const schemas={
    AdjustVerbSuggestionsFilter:['numberFromNextWords','actions','forceNumber','None'],
    AdjustPronounsFilter:['actions','newLemma','newOnlyLemma'],
    EnNoInfinitiuSuggestionFilter:[], PortarGerundiSuggestionsFilter:['newLemma'],
    AnarASuggestionsFilter:[], PortarTempsSuggestionsFilter:[],DonarTempsSuggestionsFilter:[],DonarseliBeFilter:[],
    PossessiusRedundantsFilter:[],ConvertToGenderAndNumberFilter:['lemmaSelect','gender','number','newLemma','keepOriginal'],
    PostponedAdjectiveConcordanceFilter:['addComma','key'], QueIniciFilter:['mode'],
    CatalanSuppressMisspelledSuggestionsFilter:['suppressMatch','SuppressPostag','FilterPostag'],
    FindSuggestionsFilter:['wordFrom','desiredPostag','priorityPostag','removeSuggestionsRegexp','suppressMatch','Mode'],FindSuggestionsEsFilter:[],
    MultitokenSpellerFilter:['requireRegexp','keepSpaces'],CatalanRemoteRewriteFilter:['suppressMatch'],
    SuppressIfAnyRuleMatchesFilter:['ruleIDs','fastOnly'],CatalanNumberSpellerFilter:['number_to_spell','gender'],CatalanNumberInWordFilter:['word']
  };
  const required={AdjustPronounsFilter:['actions'],FindSuggestionsFilter:['wordFrom','desiredPostag'],ConvertToGenderAndNumberFilter:['lemmaSelect'],CatalanSuppressMisspelledSuggestionsFilter:['suppressMatch'],SuppressIfAnyRuleMatchesFilter:['ruleIDs'],CatalanNumberSpellerFilter:['number_to_spell','gender'],CatalanNumberInWordFilter:['word']};
  function apply(rt,name,c){
    const {args,match,marked,from,to,original,text,suggestions}=c,rows=match.rows,p=new Pronouns(rt);
    const start=marked[0].index,read=(i,pattern)=>rows[i]?rt.readings(rows[i]).find(r=>rt.re(pattern).test(r.tag||'')):null;
    const synth=(lemma,tag)=>{const values=rt.synthesize(lemma,tag,{regexp:true});return values.length||!/^V.*[CVBXYZ0123456]$/u.test(tag)?values:rt.synthesize(lemma,tag.slice(0,-1)+'[0CXY12]',{regexp:true});};
    const result=(a,b,values)=>({start:rows[a]?.start??from,end:rows[b]?.end??to,suggestions:uniq(values.filter(v=>typeof v==='string'))});
    const preserve=(value,model=original)=>rt.convertCase(value,'preserve',model);
    if(name==='CatalanRemoteRewriteFilter')return rt.localRewrite(match,marked,text);
    if(name==='AdjustPronounsFilter'){
      const group=new VerbGroup(rt,rows,start);if(group.undefined)return [];
      let verb=group.string(group.first,group.last).toLocaleLowerCase('ca'),verb2=verb;
      const tag=group.read(group.first,'V.*')?.tag||'';
      if(args.newLemma)verb=group.synth(args.newLemma,tag);
      if(args.newOnlyLemma)verb2=group.synth(args.newOnlyLemma,tag);
      if(!verb)return [];
      const pr=group.before||group.after,values=[],actions=args.actions.split(',');
      for(const action of actions){let value;
        if(action==='removePronounEn')value=p.before(pr.replaceAll('en','').replaceAll("n'",'').replaceAll("'n",'').trim(),verb)+verb;
        else if(action==='replaceHiEn')value=p.action('addPronounEn',p.normalized(pr.replaceAll('hi','').trim()),verb,group.person,false);
        else if(action==='changeOnlyLemma')value=p.before(actions.includes('replaceHiEn')?pr.replaceAll('hi','').trim():pr,verb2)+verb2;
        else if(action==='addPronounReflexiveHi')value=p.action('addPronounReflexive',pr,'hi '+verb,group.person,false);
        else value=p.action(action,pr,verb,group.person,['addPronounEn','addPronounReflexive'].includes(action)?!group.finiteTag:false);
        if(value&&value.toLowerCase()!==group.string(group.start,group.end).toLowerCase())values.push(preserve(value,group.casing));
      }
      return result(group.start,group.end,values);
    }
    if(name==='AdjustVerbSuggestionsFilter'){
      const group=new VerbGroup(rt,rows,start);if(group.undefined||rows[group.last].end>to)return [];
      const values=[];let spanStart=group.start;
      for(let proposal of suggestions){
        proposal=proposal.toLowerCase();let action=(args.actions||'removePronounReflexive').split(',')[0],number=args.forceNumber||'',person='',intr=false;
        if(proposal.endsWith(' [intr]')){proposal=proposal.slice(0,-7);intr=true;}
        if(proposal.endsWith(' [3s]')){proposal=proposal.slice(0,-5);number='S';person='3';}
        if(proposal.startsWith('[datiu] ')){proposal=proposal.slice(8);action='addPronounDative';}
        let [lemma,...tail]=proposal.split(' ');const suffix=tail.join(' ');
        if(args.numberFromNextWords==='true'&&suffix){const tagged=rt.dictionary.lookup(tail[0]);number=tagged.some(r=>/^(?:N..|A...|D...)[SN]/u.test(r.tag||''))?'S':'P';}
        if(lemma.includes('haver-hi'))number='S';
        const endings=[["-se'n",'addPronounReflexiveEn'],['-se','addPronounReflexive'],["'s",'addPronounReflexive'],['-hi','addPronounHi'],["-s'ho",'addPronounReflexiveHo'],['-se-les','addPronounReflexiveLes'],["-s'hi",'addPronounReflexiveHi']];
        for(const [ending,target]of endings)if(lemma.endsWith(ending)){lemma=lemma.slice(0,-ending.length);action=target;break;}
        const tags=group.rt.readings(rows[group.first]).filter(r=>/^V/u.test(r.tag||'')).map(r=>{
          let tag=r.tag;if(tag[2]!=='P'&&number&&/[SP]/u.test(tag[5]))tag=tag.slice(0,5)+number+tag.slice(6);
          if(tag[2]!=='P'&&person&&/[123]/u.test(tag[4]))tag=tag.slice(0,4)+person+tag.slice(5);return tag;});
        const compare=(a,b)=>{
          if(a.includes('3S')&&b==='1S')return 150;if(a.includes('1S')&&b.includes('3S'))return -150;
          if(a==='VMIP2P00'&&b==='VMIS3S00')return 150;if(b==='VMIP2P00'&&a==='VMIS3S00')return -150;
          if(a[2]==='I'&&b[2]!=='I')return 100;if(b[2]==='I'&&a[2]!=='I')return -100;
          if(a[4]==='3'&&b[4]==='1')return 50;if(b[4]==='1'&&a[4]==='3')return -50;return 0;
        };
        const target=tags.sort(compare).at(-1);if(!target)continue;
        const verb=group.synth(lemma,target);if(!verb)continue;
        let value=p.action(action,(group.before||group.after).toLowerCase(),verb,action==='addPronounDative'?group.person:target.slice(4,6),group.afterCount>0||!group.finiteTag);
        if(intr)value=p.intransitive(value);value=p.fix(value);
        if(value)values.push(preserve((value+' '+suffix).trim().replace(/\bde (h?[aeiouàèéíòóú])/giu,"d'$1"),group.casing));
      }
      if(!values.length)return [];
      if(!group.beforeCount&&spanStart>1&&['de',"d'",'l',"l'",'el'].includes(rows[spanStart-1].token.toLowerCase())&&values.some(v=>vowel(v)!==vowel(group.string(group.first,group.last)))){
        const old=spanStart;spanStart--;if(spanStart>1&&['a','de','per','pe'].includes(rows[spanStart-1].token.toLowerCase()))spanStart--;
        const prefix=group.string(spanStart,old-1).toLowerCase()+(rows[old].whitespaceBefore?' ':'');
        for(let i=0;i<values.length;i++)values[i]=rt.adaptSuggestion(prefix+values[i],text.slice(rows[spanStart].start,to));
      }
      return result(spanStart,Math.max(group.end,marked.at(-1).index),values);
    }
    if(name==='EnNoInfinitiuSuggestionFilter'){
      const group=new VerbGroup(rt,rows,start);if(group.undefined||rows[group.last].end>to)return [];
      const after=new VerbGroup(rt,rows,Math.min(group.end+1,rows.length-1)),before=new VerbGroup(rt,rows,Math.max(group.first-1,0),true);
      const controller=after.finiteTag?after:before.finiteTag?before:null;if(!controller)return [];
      const tag=controller.finiteTag,prefix=['IP','IF'].includes(tag.slice(2,4))&&!controller.periphrastic?'VMIP':'VMII';
      const lemma=group.read(group.last,'V.*')?.lemma;if(!lemma)return [];
      const values=[];const initial=Math.max(0,group.first-(rows[group.first-2]?.token.toLowerCase()==='l'?3:2));
      for(const person of uniq(['3S',tag.slice(4,6)])){
        const verb=group.synth(lemma,prefix+person+tag.slice(6));if(!verb)continue;
        values.push(preserve((before.finiteTag?'perquè no ':'com que no ')+(group.after?p.before(group.after,verb):'')+verb,text.slice(rows[initial].start,rows[group.end].end)));
      }
      return result(initial,group.end,values);
    }
    if(name==='PortarGerundiSuggestionsFilter'||name==='AnarASuggestionsFilter'){
      const group=new VerbGroup(rt,rows,start);if(group.undefined||rows[group.last].end>to)return [];
      const first=group.first,second=first+(name==='AnarASuggestionsFilter'?2:1),a=read(first,name==='AnarASuggestionsFilter'?'V.IP.*':'V.[IS].*'),b=read(second,name==='AnarASuggestionsFilter'?'V.N.*':'V.G.*');
      if(!a||!b)return [];
      const lemma=args.newLemma||b.lemma,verbs=[];
      if(name==='AnarASuggestionsFilter'){verbs.push(...synth(lemma,'V[MS]IF'+a.tag.slice(4)),...synth(lemma,'V[MS]IP'+a.tag.slice(4)));}
      else {for(const auxiliary of synth('haver','VA'+a.tag.slice(2)))for(const participle of synth(lemma,'V.P..SM.*'))verbs.push(auxiliary+' '+participle);const simple=synth(lemma,'V.'+a.tag.slice(2));if(simple.length)verbs.push(simple[0]);}
      const values=verbs.map(v=>preserve(rt.adaptSuggestion(p.before(group.after||group.before,v)+v,''),rows[group.start].token));
      return result(group.start,second+group.afterCount,name==='AnarASuggestionsFilter'?[...suggestions.map(s=>rt.adaptSuggestion(s,'')),...values]:values);
    }
    if(name==='PortarTempsSuggestionsFilter'){
      const a=read(start,'V.*');if(!a)return [];
      const forms=synth('fer',a.tag.slice(0,4)+'[30][S0].'+a.tag.slice(7));if(!forms.length)return [];
      let index=start+1,value=forms[0];while(rows[index]?.chunks?.includes('PTime')){value+=(rows[index].whitespaceBefore?' ':'')+rows[index].token;index++;}
      const tail=rows[index];if(!tail||!rows[index+1])return [];let end=index;
      if(tail.token==='que')value+=' que';
      else if(read(index,'V.G.*')||tail.token==='sense'&&read(index+1,'V.N.*')){
        const negative=tail.token==='sense',group=new VerbGroup(rt,rows,index+(negative?1:0));if(group.undefined)return [];
        const b=read(group.first,negative?'V.N.*':'V.G.*'),verbs=synth(b.lemma,'V.I'+a.tag.slice(3));if(!verbs.length)return [];
        value+=' que '+(negative?'no ':'')+p.before(group.after,verbs[0])+verbs[0];end=group.end;
      }else if(['així','a','en','aquí','allí','allà','de'].includes(tail.token)||read(index,'AQ.*|VMP.*')){const verbs=synth('estar','V.I'+a.tag.slice(3));if(!verbs.length)return [];value+=' que '+verbs[0];end=index-1;}
      else return [];
      return result(start,end,[preserve(value,rows[start].token)]);
    }
    if(name==='DonarTempsSuggestionsFilter'){
      const pr=read(start,'P.*');if(!pr)return [];const person=pr.tag[2]+pr.tag[4];let main=start+1;
      while(rows[main]?.sentence===rows[start].sentence&&!rt.readings(rows[main]).some(r=>r.lemma==='donar'))main++;
      const a=read(main,'V.*');if(!a||!rows[main+1])return [];
      const values=[],forms=synth('haver','VA'+a.tag.slice(2));
      if(forms.length)values.push(preserve(('hi '+new VerbGroup(rt,rows,start+1).string(start+1,main-1)+' '+forms[0]+' temps').replace(/ +/gu,' ').replaceAll('de haver',"d'haver"),rows[start].token));
      const first=read(start+1,'V.*');if(!first)return result(start,main+1,values);
      const verbs=synth(main===start+1?'tenir':first.lemma,first.tag.slice(0,4)+person+first.tag.slice(6));
      if(verbs.length){let value=verbs[0];if(main>start+1){value+=' '+new VerbGroup(rt,rows,start+1).string(start+2,main-1);const last=synth('tenir',a.tag);if(!last.length)return result(start,main+1,values);value+=' '+last[0];}values.push(preserve((value.trim()+' temps').replace(/ +/gu,' '),rows[start].token));}
      return result(start,main+1,values);
    }
    if(name==='PossessiusRedundantsFilter'){
      let pos=start;while(rows[pos]?.sentence===rows[start].sentence&&!read(pos,'PX.*'))pos++;
      const px=read(pos,'PX.*');if(!px||!rows[pos+1]||pos<1)return [];
      const person=px.tag[2],number=px.tag[6];let verb=start-1;
      while(verb>0&&rows[verb].chunks?.includes('GV'))verb--;verb++;
      let found=false,any=false;
      for(const [initial,step]of [[verb-1,-1],[start+1,1]]){
        for(let i=initial;rows[i]?.sentence===rows[start].sentence&&read(i,'PP.*|P0.*');i+=step){
          any=true;const r=read(i,'P.*');if(r.tag[2]===person&&(number==='C'||r.tag[4]===number))found=true;
        }
      }
      const apostrophe=read(pos-1,'DA0[MF]S0')&&vowel(rows[pos+1].token);
      if(found)return apostrophe?result(pos-1,pos+1,["l'"+rows[pos+1].token]):result(pos,pos,['']);
      if(any||!rows[verb])return [];
      const token=rows[verb].token,pr=dative[person+number];if(!pr)return [];
      let value=read(verb,'VM[NG].*')?token+p.after(pr,token):preserve(p.before(pr,token),token)+token.toLowerCase();
      for(let i=verb+1;i<=pos-2;i++)value+=(rows[i].whitespaceBefore?' ':'')+rows[i].token.toLowerCase();
      if(apostrophe)value+=" l'"+rows[pos+1].token;
      else for(const i of [pos-1,pos+1])value+=(rows[i].whitespaceBefore?' ':'')+rows[i].token;
      return result(verb,pos+1,[value]);
    }
    if(name==='DonarseliBeFilter'){
      const group=new VerbGroup(rt,rows,start);if(group.undefined||rows[group.last].end>to)return [];
      const pi=group.afterCount===2?group.last+2:group.beforeCount>=2?group.first-(group.beforeCount-1):-1;
      const pr=read(pi,pronounTag),a=read(group.first,'V.*');if(!pr||!a)return [];
      let adv=group.end+1;while(rows[adv]?.sentence===rows[start].sentence&&!['bé','malament','mal','millor','pitjor','fatal'].includes(rows[adv].token.toLowerCase()))adv++;
      if(!rows[adv]||rows[adv].sentence!==rows[start].sentence)return [];
      const terminal=['mal','fatal'].includes(rows[adv].token.toLowerCase())?'malament':rows[adv].token;
      const mods=group.string(group.end+1,adv-1),after=read(adv+1,'V.N.*|D.*|PD.*');
      let left=group.start;const no=['no','mai'].includes(rows[left-1]?.token.toLowerCase());if(no){left--;if(rows[left-1]?.token.toLowerCase()==='mai')left--;}
      const negative=['malament','pitjor'].includes(terminal.toLowerCase()),cancel=no&&negative;
      let ami='';if(rows[left-2]?.token.toLowerCase()==='a'&&['mi','tu','ell','ella','nosaltres','vosaltres','ells','elles'].includes(rows[left-1]?.token.toLowerCase())){ami=group.string(left-2,left-1)+' ';left-=2;}
      let relative=rows[left-1]?.token.toLowerCase()==='qui',aqui=relative&&rows[left-2]?.token.toLowerCase()==='a';
      const q=rows[left-1]?.token.toLowerCase(),exception=['ja','ara','per','de','a','en'].includes(rows[left-2]?.token.toLowerCase());
      if(q==='que'&&(read(left-2,'DA.*')||rt.readings(rows[left-2]||{}).some(r=>['alumne','persona','estudiant','professor'].includes(r.lemma))))relative=true;
      let declarative=false;
      for(let i=left-2;i>0;i--){const reading=read(i,'V.*|RG.*|LOC_ADV');if(!reading)break;if(rt.filterResources.declarativeVerbs?.includes(reading.lemma?.toLowerCase())){declarative=true;break;}}
      if(!relative&&!exception&&['que','què'].includes(q)&&!(q==='que'&&declarative))left--;
      const prefix=group.string(left,group.start-1)+(left<group.start?' ':''),normal=prefix.replace(ami,''),traca=normal.replace(/^qu[eè] /iu,'en què ').replace(cancel?/\b(?:no|mai) /giu:/$^/u,'');
      const tag=a.tag.slice(0,4)+pr.tag[2]+pr.tag[4]+a.tag.slice(6),values=[];
      const consume=after&&['el','els'].includes(rows[adv+1].token.toLowerCase()),right=consume?' '+rows[adv+1].token:'';
      const add=(lemma,t,before,tail,pronoun='',back=false)=>{const v=group.synth(lemma,t);if(v)values.push(preserve(before+(pronoun?p.apply(pronoun,v,back):v)+tail,rows[left].token));};
      if(!relative){
        add('tenir',tag,traca+(negative&&!cancel?'no ':'')+(!prefix.toLowerCase().startsWith('qu')&&!after?'hi ':''),(!negative&&!cancel&&mods?' '+mods.replace(/\bmolt\b/gu,'molta').replace(/\bgens\b/gu,'gens de').replace(/\btan\b/gu,'tanta'):'')+' traça'+(after?(consume?(rows[adv+1].token.toLowerCase()==='el'?' per al':' per als'):' per a'):''));
        const normalized=['li',"'ls",'-li'].includes(rows[pi].token.toLowerCase())?'es':p.normalized(rows[pi].token);
        add('sortir',tag,traca+(negative&&!cancel?'no ':''),(after?(after.tag.startsWith('V')?' a':' en'):'')+right,normalized+' en',!group.beforeCount);
      }
      if(!aqui)add('fer',tag,normal+(!prefix.toLowerCase().startsWith('qu')&&!after&&!relative?'ho ':''),(mods?' '+mods:'')+' '+terminal+right);
      for(const lemma of ['anar','sortir'])add(lemma,a.tag,prefix,(mods?' '+mods:'')+' '+terminal+right,rows[pi].token,!group.beforeCount);
      return result(left,adv+(consume?1:0),values);
    }
    const known=word=>rt.services.isKnown?.(word)??rt.dictionary.lookup(word).length>0;
    const spell=word=>rt.services.spellingSuggestions?.(word)||[];
    if(name==='CatalanNumberInWordFilter'){
      const word=args.word,values=[],letter=word.replaceAll('0','o'),stripped=word.replace(/\d/gu,'');
      if(letter!==word&&known(letter))values.push(letter);if(stripped&&known(stripped))values.push(stripped);
      return values.length?uniq(values):spell(stripped);
    }
    if(name==='CatalanNumberSpellerFilter'){
      const value=spellNumber(args.number_to_spell.replaceAll('.',''),args.gender==='feminine');
      if(!value||value.replaceAll('-i-',' ').replaceAll('-',' ').split(' ').length>=4)return [];
      return [rows[start-1]?.sentenceStart?value[0].toUpperCase()+value.slice(1):value];
    }
    if(name==='MultitokenSpellerFilter'){
      if(original.length>50||[...original.matchAll(/\p{L}/gu)].length<2||marked.every(s=>s.row.ignoredBySpeller))return [];
      const source=rt.filterResources.multiwords;if(!source)throw Error('Missing original multiword lexicon');
      const normalized=s=>s.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/-/gu,' '),word=original.replace(/[\s\p{Z}]+/gu,' ').replace(/- | -/gu,'-'),key=normalized(word),parts=key.split(' ').filter(Boolean);
      if(!rt.multitokenIndex){
        const exact=new Map(),first=new Map();
        for(const candidate of source){const ckey=normalized(candidate),record={candidate,key:ckey,parts:ckey.split(' ').filter(Boolean)},joined=ckey.replaceAll(' ','');(exact.get(joined)||exact.set(joined,[]).get(joined)).push(record);(first.get(ckey[0])||first.set(ckey[0],[]).get(ckey[0])).push(record);}
        rt.multitokenIndex={exact,first};
      }
      if(parts.length===2&&!/^\p{Lu}/u.test(word.split(' ')[1]||'')){
        const [a,b]=word.split(' ');if(a&&b&&(known(a.slice(0,-1))&&known(a.slice(-1)+b)||known(a+b[0])&&known(b.slice(1))))return [];
      }
      let weighted=[];
      for(const {candidate}of rt.multitokenIndex.exact.get(key.replaceAll(' ',''))||[]){
        if(candidate===original||candidate===candidate.toLowerCase()&&candidate.replace(/\b\p{L}/gu,s=>s.toUpperCase())===original)return [];
        weighted.push([candidate,0]);
      }
      if(!weighted.length)for(const {candidate,key:ckey,parts:cp}of rt.multitokenIndex.first.get(key[0])||[]){
        if(Math.abs(ckey.length-word.length)>3)continue;
        if(candidate===original)return [];
        const distances=cp.length===parts.length&&parts.length>1?cp.map((s,i)=>distance(s,parts[i])):[distance(ckey,key)];const total=distances.reduce((a,b)=>a+b,0);
        if(total&&ckey.length<7||distances.some((d,i)=>d>(parts[i]?.length>5&&cp[i]?.length>4?2:1)))continue;
        const correct=cp.length===parts.length&&parts.length>1?cp.reduce((n,s,i)=>n+(s===parts[i]?s.length:0),0):0;
        const charCost=(a,b)=>a===b||a==='i'&&b==='y'||a==='y'&&b==='i'?0:['sz','zs','bv','vb'].includes(a+b)?0.2:1;
        const initial=cp.length===2&&parts.length===2?cp.reduce((n,s,i)=>n+charCost(s[0],parts[i][0]),0):0,len=key.length-correct,max=Math.trunc(len<=7?2-initial:2+0.25*(len-7)-0.6*initial);
        if(total<=max)weighted.push([candidate,total]);
      }
      if(!weighted.length)return [];const best=Math.min(...weighted.map(x=>x[1]));let values=uniq(weighted.filter(x=>x[1]===best).map(x=>x[0]));
      if(original.length>4&&original===original.toUpperCase())values=values.map(s=>s.toUpperCase());
      else if(rows.slice(0,start).filter(r=>r.sentence===rows[start].sentence).every(r=>!/[\p{L}\p{N}]/u.test(r.token)))values=values.map(s=>s===s.toLowerCase()?s[0].toUpperCase()+s.slice(1):s);
      return values.filter(s=>s!==original);
    }
    if(name==='FindSuggestionsFilter'){
      const row=args.wordFrom==='inmarker'?rows[start]:c.resolve(args.wordFrom)?.row;if(!row)return [];
      const word=args.wordFrom==='inmarker'?original:row.token,desired=rt.re(args.desiredPostag),priority=args.priorityPostag?rt.re(args.priorityPostag):null,diacritics=args.Mode==='diacritics';
      const normalize=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
      if(diacritics&&rt.dictionary.lookup(word).some(r=>desired.test(r.tag)))return [];
      const exclude=new Set(['enterar','sentar','conseguir','alcançar','liar','vore']);let values=[],prioritized=[];
      for(const candidate of spell(word.replace(/ /gu,'').replace(/l[.·•-]l/giu,'l·l'))){
        const readings=rt.dictionary.lookup(candidate);if(candidate===word||diacritics&&normalize(candidate)!==normalize(word))continue;
        if(readings.some(r=>exclude.has(r.lemma))&&!readings.some(r=>['enter','sentir'].includes(r.lemma)))continue;
        if(!readings.some(r=>desired.test(r.tag)))continue;
        if(args.removeSuggestionsRegexp&&rt.re(args.removeSuggestionsRegexp).test(candidate))continue;
        const value=preserve(candidate,word);if(priority&&readings.some(r=>priority.test(r.tag)))prioritized.push(value);else values.push(value);
        if(values.length+prioritized.length>=20)break;
      }
      values=uniq([...prioritized,...values]).slice(0,10);
      const templates=suggestions.filter(s=>/\{(?:suggestion|Suggestion|SUGGESTION)\}/u.test(s));
      const literal=suggestions.filter(s=>!templates.includes(s));
      if(!values.length&&!literal.length){if(diacritics||args.suppressMatch==='true')return [];return {suggestions:[],allowNoSuggestions:true};}
      if(templates.length)return uniq([...literal,...templates.flatMap(t=>values.map(v=>t.replaceAll('{suggestion}',v).replaceAll('{Suggestion}',v[0].toUpperCase()+v.slice(1)).replaceAll('{SUGGESTION}',v.toUpperCase())))]).slice(0,10);
      return uniq([...literal,...values]).slice(0,10);
    }
    if(name==='FindSuggestionsEsFilter'){
      const row=rows[start+1];if(!row)return [];const values=[];let es=false,accent=false;
      for(const candidate of spell(row.token)){
        const readings=rt.dictionary.lookup(candidate);
        if(readings.some(r=>rt.re('NP..[^0].*|NC.[SN].*|A...[SN].|V.P..S..|V.[NG].*|RG|PX..S...').test(r.tag))){accent=true;values.push(preserve('és '+candidate,rows[start].token));}
        if(!vowel(candidate)&&readings.some(r=>rt.re('V...3.*').test(r.tag))){es=true;values.push(preserve('es '+candidate.toLowerCase(),rows[start].token));}
      }
      if(rows[start].token.toLowerCase()==='és'&&accent&&!es)return [];
      const message=match.message+(accent?' "És" (del verb \'ser\') s\'escriu amb accent.':'')+(es?' "Es" (pronom) acompanya un verb en tercera persona.':'');
      return {...result(start,start+1,uniq(values).slice(0,20)),message};
    }
    if(name==='CatalanSuppressMisspelledSuggestionsFilter'){
      const valid=value=>{
        const analysis=rt.services.analyze?.(value);if(!analysis)return value.split(/\s+/u).every(known);
        rt.validationRuntime??=new globalThis.CorrectorLtPatternRuntime({dictionary:rt.dictionary,filterResources:rt.filterResources,contextRules:rt.contextRules,chunkRules:rt.chunkRules,posRules:rt.posRules,maxSteps:rt.maxSteps});
        const contextual=rt.validationRuntime.run(value,analysis,[],true);
        if(rt.validationRuntime.diagnostics.length||contextual.some(r=>r.chunks?.includes('_incorrect_verb_')))return false;
        return contextual.filter(r=>/[\p{L}\p{N}]/u.test(r.token)).every(r=>known(r.token)||r.ignoreSpelling||r.immunized||rt.validationRuntime.readings(r).some(a=>a.tag&&/^(?:N|A|V|RG|LOC_|_Latin_)/u.test(a.tag)&&!a.tag.startsWith('_incorrect_')));
      };
      const values=suggestions.filter(s=>valid(s)&&(!args.SuppressPostag||!rt.dictionary.lookup(s).some(r=>rt.re(args.SuppressPostag).test(r.tag)))&&(!args.FilterPostag||rt.dictionary.lookup(s).some(r=>rt.re(args.FilterPostag).test(r.tag))));
      return values.length?values:args.suppressMatch==='false'?{suggestions:[],allowNoSuggestions:true}:[];
    }
    if(name==='SuppressIfAnyRuleMatchesFilter'){
      const ids=args.ruleIDs.split(',').map(s=>s.trim()),rules=rt.dependencyRules.filter(r=>ids.some(id=>r.id===id||r.id.startsWith(id+'_')));
      for(const id of ids)if(!rules.some(r=>r.id===id||r.id.startsWith(id+'_')))throw Error('Missing suppression dependency: '+id);
      if(!rt.services.analyze)throw Error('Suppression requires local context analysis');
      const stack=rt.services.suppressionStack||[];if(stack.length>=4||stack.includes(match.rule?.id))throw Error('Cyclic suppression dependency');
      for(const suggestion of suggestions){
        const revised=text.slice(0,from)+suggestion+text.slice(to),targetEnd=from+suggestion.length;
        const child=new globalThis.CorrectorLtPatternRuntime({dictionary:rt.dictionary,synthesisExclusions:[...rt.synthesisExclusions],chunkRules:rt.chunkRules,posRules:rt.posRules,contextRules:rt.contextRules,dependencyRules:rt.dependencyRules,filterResources:rt.filterResources,services:{...rt.services,suppressionStack:[...stack,match.rule?.id]},maxSteps:rt.maxSteps});
        const hits=child.run(revised,rt.services.analyze(revised),rules);if(child.diagnostics.length)throw Error('Suppression dependency failed: '+child.diagnostics[0].error);
        if(hits.some(h=>h.end>from&&h.start<targetEnd))return [];
      }
      return suggestions;
    }
    if(name==='ConvertToGenderAndNumberFilter'){
      const split=r=>{const m=r?.tag?.match(/^(N.|A..|V.P..|D..|PX.)(.)(.)(.*)$/u);return m?{prefix:m[1],gender:m[1][0]==='V'?m[3]:m[2],number:m[1][0]==='V'?m[2]:m[3],suffix:m[4]}:null;};
      const originalReading=read(start,args.lemmaSelect),originalParts=split(originalReading),candidates=[];
      if(args.newLemma&&originalReading)candidates.push({...originalReading,lemma:args.newLemma,token:args.newLemma});
      else if(suggestions.length){
        for(const suggestion of suggestions){const [word,...tail]=suggestion.split(' '),rs=rt.dictionary.lookup(word),r=rs.find(r=>split(r));
          if(!r||rs.some(r=>rt.re('NP.*|AQ0CN0|SPS00|[CP].*').test(r.tag)))return suggestions;
          const sp=split(r),gender=args.gender||sp.gender,number=args.number||(originalParts?.number!=='N'?originalParts?.number:null)||sp.number;
          candidates.push({...r,token:suggestion,tail:tail.join(' '),tag:sp.prefix+(sp.prefix[0]==='V'?number+gender:gender+number)+sp.suffix});
        }
      }else if(originalReading)candidates.push(originalReading);
      let finalStart=start,finalEnd=start;const values=[];
      for(const candidate of candidates){
        const sp=split(candidate);if(!sp)continue;let genders=args.gender||sp.gender,numbers=args.number||sp.number;
        for(const index of [start-1,start+1]){const near=split(rt.readings(rows[index]||{}).find(r=>split(r)));if(!near)continue;if(genders==='C'&&/[MF]/u.test(near.gender))genders=near.gender;if(numbers==='N'&&/[SP]/u.test(near.number))numbers=near.number;}
        const prioritize=(s,preferred)=>s.includes(preferred)?preferred+s.replaceAll(preferred,''):s;
        genders=prioritize(genders,sp.gender);numbers=prioritize(numbers,sp.number);
        for(const gender of genders)for(const number of numbers){
          const inflect=r=>{const s=split(r);if(!s)return '';const g='['+gender+(s.prefix.startsWith('DA')?'':'C')+']',n='['+number+'N]';return synth(r.lemma,s.prefix+(s.prefix[0]==='V'?n+g:g+n)+s.suffix)[0]||'';};
          let value=args.keepOriginal==='true'?rows[start].token:inflect(candidate);if(!value)continue;if(candidate.tail)value+=' '+candidate.tail;
          let a=start,b=start,article=false,demonstrative=false,prep='',tot='',pending='',invalid=false;
          for(let i=start-1;i>0&&rows[i].sentence===rows[start].sentence;i--){
            if(['mes','las'].includes(rows[i].token.toLowerCase())||!read(i,'D.*')&&(read(i,'_GV_|_perfet|V.[^P].*')||rows[i].chunks?.includes('GV')))break;
            const r=rt.readings(rows[i]).find(r=>split(r)&&!r.tag.startsWith('N'));
            if(r){
              if(r.tag.startsWith('DA')){article=true;value=pending+value;pending='';a=i;continue;}
              if(article||demonstrative){if(r.lemma==='tot'){tot=inflect(r)+' ';a=i;}break;}
              let form=inflect(r);if(!form){invalid=true;break;}if(form==='bo')form='bon';value=form+(rows[i+1].whitespaceBefore?' ':'')+pending+value;pending='';a=i;
              if(r.tag.startsWith('DD'))demonstrative=true;
              else if(r.tag.startsWith('D')&&!r.tag.startsWith('DN')&&r.lemma!=='quant')break;
            }else if(read(i,'SPS00|LOC_PREP')){if(article&&['a','de','per','pe',"d'"].includes(rows[i].token.toLowerCase())){prep=rows[i].token.toLowerCase().replace(/^pe$/u,'per').replace(/^d'$/u,'de');a=i;}break;}
            else if(read(i,'_PUNCT_CONT|CC')){if(i===start-1||rows[i].token.toLowerCase()==='i'&&rows[i-1]?.token.toLowerCase()==='tot')break;pending=rows[i].token+' '+pending;}
            else if(read(i,'RG.*')&&rt.readings(rows[i-1]||{}).some(r=>split(r))&&rt.readings(rows[i+1]||{}).some(r=>split(r)))pending=rows[i].token+' '+pending;
            else break;
          }
          pending='';let coordination=false;
          for(let i=start+1;rows[i]?.sentence===rows[start].sentence;i++){
            if(['mes','las'].includes(rows[i].token.toLowerCase()))break;
            const r=rt.readings(rows[i]).find(r=>split(r)&&/^(?:A|V.P|PX)/u.test(r.tag));
            if(r&&!(coordination&&read(i,'NC.*'))){const form=inflect(r);if(!form){invalid=true;break;}value+=pending+' '+form;pending='';b=i;}
            else if(read(i,'RG.*'))pending+=' '+rows[i].token;
            else if(read(i,'CC')){coordination=true;pending+=' '+rows[i].token;}
            else if(read(i,'_PUNCT_CONT'))pending+=rows[i].token;else break;
          }
          if(article)value=rt.determinerPrefix(value,gender+number,prep)+value;else if(prep)value=prep+' '+value;
          value=preserve(tot+value,text.slice(rows[a].start,rows[b].end));
          if(invalid)continue;
          // RuleMatch has one span: do not combine proposals covering different text.
          if(values.length&&(a!==finalStart||b!==finalEnd))continue;
          finalStart=a;finalEnd=b;values.push(value);
        }
      }
      const span=text.slice(rows[finalStart].start,rows[finalEnd].end);if(values.includes(span))return [];
      return result(finalStart,finalEnd,values);
    }
    if(name==='PostponedAdjectiveConcordanceFilter'){
      const patterns={MS:'A..[MC][SN].*|V.P..SM.?|PX.MS.*',FS:'A..[FC][SN].*|V.P..SF.?|PX.FS.*',MP:'A..[MC][PN].*|V.P..PM.?|PX.MP.*',FP:'A..[FC][PN].*|V.P..PF.?|PX.FP.*',CS:'A..C[SN].*',CP:'A..C[PN].*'};
      const adj=['CS','CP','MS','FS','MP','FP'].find(gn=>read(start,patterns[gn]));if(!adj)return [];
      const levels=Array.from({length:4},()=>({n:{MS:0,FS:0,MP:0,MN:0,FP:0,CS:0,CP:0},d:{MS:0,FS:0,MP:0,FP:0},nt:0}));
      const candidates=new Set();let level=0,prevNoun=false,adverb=false,conj=false,punct=false;
      const preps=['de',"d'",'en','sobre','a','entre','per','pe','amb','sense','contra','com','envers'];
      const keep=i=>{
        if(preps.includes(rows[i].token)||rows[i].token==='.')return true;
        if(adverb&&(conj||punct)||conj&&punct||punct&&read(i,'_PUNCT'))return false;
        return !!(read(i,'A.*|N.*|D[NAIDP].*|SPS.*|.*LOC_ADV.*|V.P.*|_PUNCT.*|.*LOC_ADJ.*|PX.*|PI0.S000|UNKNOWN|RG_anteposat')||[',','i','o','ni'].includes(rows[i].token))&&![';',':'].includes(rows[i].token)&&(!read(i,'_GV_')||read(i,'_GN_.*'));
      };
      for(let i=start-1;i>0&&rows[i].sentence===rows[start].sentence&&level<4&&keep(i);i--){
        const l=levels[level],noun=!!read(i,'N.*');
        if(!prevNoun){
          const synthetic=read(i,'_GN_.*');
          if(synthetic&&(noun||read(i,'AQ.*|V.P.*|PX.*|.*LOC_ADJ.*')&&read(i-1,'D[NDA0IP].*'))){for(const gn of ['MS','FS','MP','FP'])if(read(i,'_GN_'+gn)){l.n[gn]++;candidates.add(gn);}}
          else if(!synthetic){const gn=['MS','FS','MP','MN','FP','CS','CP'].find(gn=>read(i,'N.'+gn+'.*'));if(gn){l.n[gn]++;if(gn==='MN'){candidates.add('MS');candidates.add('MP');}else if(gn[0]==='C'){candidates.add('M'+gn[1]);candidates.add('F'+gn[1]);}else candidates.add(gn);}}
        }
        if(noun)l.nt++;prevNoun=noun;
        for(const gn of ['MS','FS','MP','FP']){
          if(read(i,'D[NDA0IP]0'+gn+'0')&&!read(i,'R.|.*LOC_ADV.*')&&!(rt.readings(rows[i]).some(r=>r.lemma==='tot')&&rt.readings(rows[i+1]).some(r=>r.lemma==='el'))||gn[1]==='S'&&read(i,'D[NDA0IP]0CS0')&&read(i+1,'N.'+gn+'.*')){l.d[gn]++;candidates.add(gn);}
        }
        if(preps.includes(rows[i].token)&&!read(i,'C.|.*LOC_CONJ.*')&&!['i','o','ni'].includes(rows[i-1]?.token)&&!read(i+1,'R.|.*LOC_ADV.*'))level++;
        if(['i','o','ni'].includes(rows[i].token)&&read(i-1,'D[NDA0IP].*')&&rows[i+1].token==='més')i--;
        conj ||=!!read(i,'C.|.*LOC_CONJ.*');if(rows[i].token==='com')continue;
        if(read(i,'N.*|AQ.*|V.P.*|PX.*|.*LOC_ADJ.*')){adverb=conj=punct=false;continue;}
        adverb ||=!!read(i,'R.|.*LOC_ADV.*');punct ||=!!read(i,'_PUNCT')||rows[i].token===',';
      }
      let plural=true,canPlural=false,total=0;
      for(const l of levels){const n=Object.values(l.n).reduce((a,b)=>a+b,0),d=Object.values(l.d).reduce((a,b)=>a+b,0);total+=n+d;
        if(read(start,patterns.MP)&&(n>1||d>1)&&(l.n.MS+l.n.MN+l.n.MP+l.n.CS+l.n.CP+l.d.MS+l.d.MP)>0&&l.n.FS+l.n.FP<=l.nt)return [];
        if(read(start,patterns.FP)&&(n>1||d>1)&&(l.n.MS+l.n.MP+l.n.MN+l.d.MS+l.d.MP===0||l.nt>0&&l.n.FS+l.n.FP>=l.nt))return [];
        if(n+d){plural=plural&&d>1;canPlural ||=n>1;}
      }
      plural ||=rows[start-2]?.token===','&&(levels[0].n.MP+levels[0].n.FP+levels[0].n.CP>0);if(!total)return [];
      const compatible=(i,gn)=>read(i,'_GN_'+(gn[0]==='C'?'[MF]':gn[0])+gn[1])||!read(i,'_GN_.*')&&read(i,'N.['+(gn[0]==='C'?'FMC':gn[0]+'C')+']['+gn[1]+'N].*|A..['+(gn[0]==='C'?'FMC':gn[0]+'C')+']['+gn[1]+'N].*|V.P..'+gn[1]+gn[0]+'.?|PX.'+gn+'.*|D[NDA0I]0'+(gn[0]==='C'?'[FM]':gn[0])+gn[1]+'0');
      for(let i=start-1;i>0;i--){if(compatible(i,adj))return [];if(read(i,'N.*|D[NDA0I].*'))break;}
      if(!(read(start-1,'N.*|AQ.*|V.P.*|PX.*|.*LOC_ADJ.*')||read(start-1,'RG_anteposat')&&!read(start-2,'V.[^P].*|_GV_|SPS.*')||read(start-1,'.*LOC_ADV.*')&&read(start-2,'.*LOC_ADV.*')&&!read(start-3,'V.[^P].*|_GV_|SPS.*')))return [];
      if(!(plural&&read(start,'A...[SN].*|V.P..S..?|PX..S.*'))){adverb=conj=punct=false;for(let i=start-1;i>0&&rows[i].sentence===rows[start].sentence&&keep(i);i--){
        if(compatible(i,adj)&&read(i,'N.*|D[NDA0I].*|_GN_.*'))return [];
        if(['i','o','ni'].includes(rows[i].token)&&read(i-1,'D[NDA0IP].*')&&rows[i+1].token==='més')i--;
        conj ||=!!read(i,'C.|.*LOC_CONJ.*');if(rows[i].token==='com')continue;
        if(read(i,'N.*|AQ.*|V.P.*|PX.*|.*LOC_ADJ.*')){adverb=conj=punct=false;continue;}
        adverb ||=!!read(i,'R.|.*LOC_ADV.*');punct ||=!!read(i,'_PUNCT')||rows[i].token===',';
      }}
      const reading=read(start,'AQ.*|V.P.*|PX.*|.*LOC_ADJ.*');if(!reading)return [];let values=[];
      if(read(start,patterns.CS))values=synth(reading.lemma,'A..CP.');else if(read(start,patterns.CP))values=synth(reading.lemma,'A..CS.');
      if(!values.length&&plural&&read(start,'A...[PN].*|V.P..P..?|PX..P.*'))values=synth(reading.lemma,'A...P.|V.P..P..|PX..P.*');
      if(!values.length)for(const gn of candidates){if(plural&&gn[1]==='S')continue;values.push(...synth(reading.lemma,'A..'+gn+'.|V.P..'+gn[1]+gn[0]+'.|PX.'+gn+'.*'));}
      if(plural||canPlural){if(candidates.has('MS'))values.push(...synth(reading.lemma,'A..MP.|V.P..PM.|PX.MP.*'));if(candidates.has('FS')&&!candidates.has('MS'))values.push(...synth(reading.lemma,'A..FP.|V.P..PF.|PX.FP.*'));}
      values=uniq(values).filter(v=>v!==rows[start].token.toLowerCase());if(!values.length)return [];
      return args.addComma==='true'?{start:from-1,end:to,suggestions:[', '+rows[start].token,...values.map(v=>' '+v)]}:values;
    }
    if(name==='QueIniciFilter')return queFilter(rt,c,p,VerbGroup);
    throw Error('Unknown Catalan filter: '+name);
  }
  function queFilter(rt,c,p,Group){
    const {match,args,suggestions,marked}=c,rows=match.rows,sentence=marked[0].row.sentence;
    const set=(key,value)=>(rt.filterResources.queSets?.[key]||[]).includes(value),read=(i,re)=>rows[i]?.sentence===sentence?rt.readings(rows[i]).find(r=>rt.re(re).test(r.tag)):null;
    const lemma=(i,re='V.*')=>read(i,re)?.lemma,word=i=>rows[i]?.token.toLowerCase()||'';
    const sentenceIndices=rows.map((r,i)=>r.sentence===sentence?i:-1).filter(i=>i>=0),q=sentenceIndices.find(i=>['que','què'].includes(word(i)));if(q==null)return suggestions;
    const id=match.rule?.id||'',amb=/AMB_?ACCENT/u.test(id),sense=/SENSE_?ACCENT/u.test(id);if(!amb&&!sense)return suggestions;
    const question=sentenceIndices.find(i=>i>q&&word(i)==='?'),end=question??sentenceIndices.at(-1)+1;
    const core=word(end-2)===','&&set('CONFIRMATION_TAGS',word(end-1))?end-2:end;
    const groupAt=index=>{
      const group=new Group(rt,rows,index+1);if(group.undefined||group.first>=core)return null;
      const next=sentenceIndices.find(i=>i>index&&word(i)==='que');if(next<group.first)return null;
      if(next>group.first&&next<=group.last){group.last=next-1;while(group.last>=group.first&&!read(group.last,'V.*'))group.last--;if(group.last<group.first)return null;group.afterCount=0;}
      return group;
    };
    const group=groupAt(q);if(!group)return suggestions;
    const first=group.first,main=group.last,mainLemma=lemma(main),post=group.end+1;
    if(args.mode==='completive'&&!(word(main+1)==='que'&&set('COMPLETIVE_GAP_VERBS',mainLemma)))return suggestions;
    const pronouns=g=>uniq([...Array(g.beforeCount)].map((_,i)=>p.normalized(rows[g.first-g.beforeCount+i].token)).concat([...Array(g.afterCount)].map((_,i)=>p.normalized(rows[g.last+1+i].token))).flatMap(s=>s.split(' ')));
    const ps=pronouns(group),ho=ps.includes('ho'),acc=ps.some(s=>set('ACCUSATIVE_PRONOUNS',s)),dat=ps.some(s=>set('DATIVE_PRONOUNS',s)),onlyAcc=ps.some(s=>set('ACCUSATIVE_PRONOUNS',s)&&!set('DATIVE_PRONOUNS',s));
    const copular=l=>set('COPULAR_VERBS',l),intr=l=>{const classes=rt.filterResources.verbClasses?.[l]||'';return /intr|abs/u.test(classes)&&!classes.includes('vtr')&&!copular(l);};
    const subject=(index,g)=>{
      const singular=!!read(g.first,'V.[SI].3S.*'),plural=!!read(g.first,'V.[SI].[32]P.*');if(!singular&&!plural)return false;
      for(let i=index;i<Math.min(core,index+5);i++){
        if(['?',','].includes(word(i)))break;if(read(i,'NP.*'))return true;
        const noun=read(i,'NC.*');if(!noun)continue;
        if(set('NEVER_SUBJECT_NOUNS',noun.lemma)||!set('ANIMATE_SUBJECT_NOUNS',noun.lemma)&&!read(i,'NCCN000'))return false;
        return singular&&!!read(i,'NC.S.*')||plural&&!!read(i,'NC.P.*|NCCN000')||!read(i,'NC.[SP].*');
      }return false;
    };
    const argument=index=>{for(let i=index;i<core;i++){if(['?',','].includes(word(i)))return -1;if(!read(i,'R.|RG|RN'))return i;}return -1;};
    const gap=()=>{
      const emb=groupAt(main+1);if(!emb)return null;const l=lemma(emb.last),eps=pronouns(emb);
      if(eps.some(s=>set('ACCUSATIVE_PRONOUNS',s)&&!set('DATIVE_PRONOUNS',s)||s==='ho'||s==='en'))return false;
      const overt=rows.slice(main+2,emb.first).some((_,offset)=>read(main+2+offset,'PP[123].*|NP.*'));
      const content=argument(emb.end+1);
      if(copular(l)){if(content<0)return true;if(set('NEUTER_ATTRIBUTE_WORDS',word(content))||set('INTERROGATIVE_WORDS',word(content)))return true;return !read(content,'A.*|V.P.*|N.*|D.*|PI.*|PX.*|Z.*|SPS.*');}
      if(content<0)return !(overt&&intr(l));
      if(read(content,'D.*|N.*|PI.*|PX.*|PD.*|Z.*')&&!set('INTERROGATIVE_WORDS',word(content)))return subject(content,emb);
      return !intr(l);
    };
    let canSubject=subject(post,group),canObject=onlyAcc||!!read(post,'N.*')||!!read(post,'D.*')||set('INTERROGATIVE_WORDS',word(post));
    if(mainLemma==='veure'&&acc)canObject=true;
    const common=rows[post+1]?.chunks?.includes('PTime')||read(post+1,'_loc_unavegada|_data_concreta')||rt.readings(rows[post]||{}).some(r=>r.lemma==='tot');
    if(common){if(!onlyAcc)canObject=false;canSubject=false;}
    let temporal=false,det=false;
    for(let i=post;i<Math.min(core,post+4);i++){if(read(i,'D.*')){det=true;continue;}const n=read(i,'NC.*');temporal=!!n&&set('TEMPORAL_ADJUNCT_NOUNS',n.lemma)&&(det||set('WEEKDAY_NOUNS',n.lemma));break;}
    if(mainLemma==='fer'&&temporal)canObject=false;
    const last=core-1,another=word(last)==='això';let j=end-1;while(j>q&&read(j,'D.*|N.*|A.*|PP3.*|PX.*|PD.*'))j--;const dislocated=j<end-1&&j>q&&word(j)===',';
    canSubject=canSubject&&!another&&!dislocated;
    const nearQue=sentenceIndices.find(i=>i>main&&word(i)==='que');let queSubject=!!read(first,'V.[SI].3S.*')&&(nearQue>main&&nearQue<main+5||onlyAcc)&&(mainLemma==='fer'||lemma(main-1)==='fer');
    let queObject=false,saturated=false;
    if(read(main,'V.[SI].*')&&word(main+1)==='que'&&mainLemma!=='veure'){if(set('COMPLETIVE_GAP_VERBS',mainLemma)){saturated=gap()===false;queObject=!saturated;}else queObject=true;}
    const ferMal=()=>post<core&&!['cap','algun','alguna','un','una'].includes(word(post))&&(lemma(post,'N.*')==='mal'||lemma(post,'N.*')==='por'&&word(post+1)!=='que');
    let lexical=post;while(lexical<core&&['pas','gaire','més'].includes(word(lexical)))lexical++;
    const ferPolar=word(q)==='que'&&mainLemma==='fer'&&['por','mal'].includes(lemma(lexical,'N.*'))&&!(lemma(lexical,'N.*')==='por'&&word(lexical+1)==='que')&&(dat||rows.slice(lexical+1,Math.min(core,lexical+4)).some((_,k)=>read(lexical+1+k,'V.N.*'))||rows.slice(lexical+1,Math.min(core,lexical+5)).some((_,k)=>read(lexical+1+k,'D.*|N.*|NP.*|PI.*'))||rows.slice(Math.max(q,main-4),main).some((_,k)=>['voler','poder','deure','haver'].includes(lemma(Math.max(q,main-4)+k))));
    if(ferPolar||mainLemma==='fer'&&lemma(post,'N.*')==='por'&&word(post+1)==='que'){queSubject=false;canObject=true;}else if(mainLemma==='fer'&&ferMal()){queSubject=true;canObject=false;}
    let intransitive=intr(mainLemma)||mainLemma==='ser'&&p.transform(ps.join(' '),0).trim()==='hi';
    if(['passar','agradar'].includes(mainLemma)){intransitive=true;queSubject=!canObject;}else if(intransitive)queSubject=false;
    queSubject=queSubject&&!another;
    if(word(q)==='què'&&mainLemma==='fer'&&ferMal()){intransitive=false;queSubject=true;canObject=false;}
    let accent=queSubject||queObject||!intransitive&&(!canObject&&!ho||canSubject);
    if(saturated&&!queSubject)accent=false;
    if(set('SINO_LAST_WORDS',word(end-1))&&!queSubject&&!queObject)accent=false;
    return amb===accent?suggestions:[];
  }
  globalThis.CorrectorLtCatalanFilters={schemas,required,Pronouns,VerbGroup,uniq,vowel,spellNumber,distance,apply};
})();
