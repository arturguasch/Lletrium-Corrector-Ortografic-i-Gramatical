/* Local central spelling candidates. Oflazer-style trie traversal with the
 * original Softcatala equivalences/replacements and Morfologik frequency scale.
 * See licenses/languagetool-runtime/NOTICE.md and lt-speller-manifest.json. */
(()=>{
 'use strict';
 class LtSpeller {
  constructor(buffer,dictionary,options={}){
   const view=new DataView(buffer);if(new TextDecoder().decode(new Uint8Array(buffer,0,4))!=='CLSP')throw Error('Invalid spelling index');
   const n=view.getUint32(4,true);if(buffer.byteLength!==8+15*n)throw Error('Spelling index length mismatch');
   this.child=new Uint32Array(buffer,8,n);this.sibling=new Uint32Array(buffer,8+4*n,n);this.terminal=new Uint32Array(buffer,8+8*n,n);this.labels=new Uint16Array(buffer,8+12*n,n);this.frequency=new Uint8Array(buffer,8+14*n,n);
   this.dictionary=dictionary;this.pairs=options.replacementPairs||[];this.equivalences=new Set((options.equivalentChars||[]).map(([a,b])=>a+b));this.cache=new Map();this.foldCache=new Map();
   this.shortPairs=this.pairs.filter(([,to])=>to.length<=2);this.rest=this.pairs.filter(([,to])=>to.length>2);
   this.shortByLast=new Map();this.pendingFirst=new Set();
   for(const pair of this.shortPairs){const char=pair[1].at(-1);if(!this.shortByLast.has(char))this.shortByLast.set(char,[]);this.shortByLast.get(char).push(pair);if(pair[1].length===2)this.pendingFirst.add(pair[1][0]);}
  }
  fold(char){if(!this.foldCache.has(char))this.foldCache.set(char,char.normalize('NFD')[0].toLowerCase());return this.foldCache.get(char);}
  equal(a,b){return a===b||this.equivalences.has(a+b)||this.fold(a)===this.fold(b);}
  expand(word,index=0,level=0){
   if(level>6||index>=word.length)return [word];
   let found=false,out=[],position=120,key='';
   for(const [from]of this.rest){const at=word.indexOf(from,index);if(at>=0&&(at<position||at===position&&from.length>=key.length)){position=at;key=from;}}
   for(const [from,to]of this.rest){if(from!==key)continue;const at=position;
    if(!found){out.push(...this.expand(word,at+from.length,level+1));found=true;}
    const existing=word.indexOf(to,Math.max(0,index-to.length+1));if(to.length>from.length&&existing>=0&&(existing===at||existing===at-to.length+1))continue;
    out.push(...this.expand(word.slice(0,at)+to+word.slice(at+from.length),at+to.length,level+1));if(out.length>256)break;
   }
   return found?out:[word];
  }
  findSimilarWords(word){
   if(this.cache.has(word))return this.cache.get(word);if(!word||word.length>=120)return [];
   const candidates=new Map();let sequence=0,steps=0;
   const add=(node,cost)=>{const id=this.terminal[node];if(!id)return;const candidate=this.dictionary.word('forms',id-1);if(candidate===word)return;const weight=26*cost+25-this.frequency[node];const prev=candidates.get(candidate);if(!prev||weight<prev.weight)candidates.set(candidate,{candidate,weight,sequence:sequence++});};
   const variants=this.expand(word).slice(0,14);
   for(let vi=0;vi<variants.length;vi++){
    const input=variants[vi],length=input.length,max=length<=1?0:1;if(length<4&&vi>0)break;
    const initial=Array.from({length:length+1},(_,i)=>i),history=[initial];
    const visit=(parent,prefix)=>{
     for(let node=this.child[parent];node;node=this.sibling[node]){
      if(++steps>500000)throw Error('Spelling candidate search budget exceeded');
      const char=String.fromCharCode(this.labels[node]),path=prefix+char,depth=path.length,prev=history[depth-1],row=[depth];
      for(let i=1;i<=length;i++){
       let value=Math.min(prev[i]+1,row[i-1]+1,prev[i-1]+(this.equal(input[i-1],char)?0:1));
       if(depth>1&&i>1&&input[i-1]===prefix.at(-1)&&input[i-2]===char)value=Math.min(value,history[depth-2][i-2]+1);
       for(const [from,to]of this.shortByLast.get(char)||[])if(depth>=to.length&&i>=from.length&&path.endsWith(to)&&input.slice(i-from.length,i)===from)value=Math.min(value,history[depth-to.length][i-from.length]);
       row.push(value);
      }
      history[depth]=row;if(row[length]<=max)add(node,row[length]);
      const min=Math.min(...row),pending=this.pendingFirst.has(char);
      if(min<=max||pending&&min===max+1)visit(node,path);
     }
    };
    visit(0,'');
   }
   const result=[...candidates.values()].sort((a,b)=>a.weight-b.weight||a.sequence-b.sequence).map(x=>x.candidate);
   if(this.cache.size>=512)this.cache.delete(this.cache.keys().next().value);this.cache.set(word,result);return result;
  }
  static async load({baseUrl,dictionary,options,fetcher=globalThis.fetch}){
   const response=await fetcher(new URL('lt-speller-manifest.json',baseUrl));if(!response.ok)throw Error('Spelling manifest load failed');const meta=await response.json();
   if(meta.schema!==1||meta.profile!=='ca-central')throw Error('Invalid spelling profile');const data=await fetcher(new URL('lt-speller.bin.gz',baseUrl));if(!data.ok)throw Error('Spelling index load failed');
   const buffer=await new Response(data.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();if(buffer.byteLength!==meta.rawBytes)throw Error('Spelling index size mismatch');
   const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(b=>b.toString(16).padStart(2,'0')).join('');if(hash!==meta.rawSha256)throw Error('Spelling index checksum mismatch');
   return new LtSpeller(buffer,dictionary,options);
  }
 }
 globalThis.CorrectorLtSpeller=LtSpeller;
})();
