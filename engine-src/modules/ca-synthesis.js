/* Exact Softcatala 3.3 synthesis lookup with LanguageTool Catalan-variant fallbacks. */
(() => {
  "use strict";
  let bytes, keysOffsets, valuesOffsets, keysStart, valuesStart, tags=[], promise;
  const decoder = new TextDecoder("utf8");
  const tagCache=new Map(), lookupCache=new Map();
  async function load() {
    if(!promise) promise=(async()=>{
      const base=chrome.runtime.getURL("build/resources/synthesis/");
      const manifest=await (await fetch(base+"resource-index.json")).json();
      const response=await fetch(base+"ca-synthesis.bin.gz");
      const raw=await new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
      const digest=await crypto.subtle.digest("SHA-256",raw);
      if(manifest.schemaVersion!==1||manifest.language!=="ca-ES"||raw.byteLength!==manifest.rawBytes
        ||Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("")!==manifest.rawSha256)throw new Error("Invalid synthesis resource.");
      bytes=new Uint8Array(raw); const header=new DataView(raw);
      if(decoder.decode(bytes.slice(0,8))!=="CACSYNT1")throw new Error("Invalid synthesis header.");
      const n=header.getUint32(8,true);keysOffsets=new Uint32Array(raw,20,n+1);valuesOffsets=new Uint32Array(raw,20+(n+1)*4,n+1);
      keysStart=20+(n+1)*8; valuesStart=keysStart+header.getUint32(12,true);
      if(valuesStart+header.getUint32(16,true)!==raw.byteLength)throw new Error("Invalid synthesis ranges.");
      tags=manifest.possibleTags;return {keys:n,rows:manifest.rows};
    })();
    return promise;
  }
  function lookup(lemma,tag) {
    const key=`${lemma}|${tag}`;
    if(lookupCache.has(key))return lookupCache.get(key);
    let lo=0,hi=keysOffsets.length-2,result=[];
    while(lo<=hi){const m=(lo+hi)>>>1,word=decoder.decode(bytes.subarray(keysStart+keysOffsets[m],keysStart+keysOffsets[m+1]));
      if(word===key){result=decoder.decode(bytes.subarray(valuesStart+valuesOffsets[m],valuesStart+valuesOffsets[m+1])).split("\n");break;}
      if(word<key)lo=m+1;else hi=m-1;
    }
    if(lookupCache.size>10000)lookupCache.clear();lookupCache.set(key,result);return result;
  }
  function selectedTags(expression){if(!tagCache.has(expression)){const r=CorrectorJavaCaseRegex.compile(expression,true);tagCache.set(expression,tags.filter(tag=>r.test(tag)));}return tagCache.get(expression);}
  const CENTRAL_VERB_ENDINGS="[0CXY12]";
  // LanguageTool's CatalanSynthesizer uses one ending set per variant:
  // central [0CXY12], Valencian [0VXZ13567], and Balearic [0BYZ1247].
  // The inclusive product merges these sets so rules can synthesize a valid
  // form when its source reading belongs to any supported variety.
  const INCLUSIVE_VERB_ENDINGS="[0CXY12VXZ13567BYZ1247]";
  const VERB_ENDINGS_BY_PROFILE={central:CENTRAL_VERB_ENDINGS,valencian:"[0VXZ13567]",balearic:"[0BYZ1247]",inclusive:INCLUSIVE_VERB_ENDINGS};
  function synthesize(reading,expression,regexp=false,localeProfile="inclusive"){
    if(!reading?.lemma||!expression||expression.startsWith("_spell_number_"))return [];
    if(regexp&&["enterar","sentar","conseguir","alcançar"].includes(reading.lemma))return [];
    let lemma=reading.lemma,after="";
    if(expression.startsWith("V")&&lemma.includes(" ")){const i=lemma.indexOf(" ");after=lemma.slice(i+1);lemma=lemma.slice(0,i);}
    let result=selectedTags(expression).flatMap(tag=>lookup(lemma,tag));
    if(!result.length&&expression.startsWith("V")&&(!regexp||/^V.*[CVBXYZ0123456]$/u.test(expression))&&!["enterar","sentar","conseguir","alcançar"].includes(reading.lemma))result=selectedTags(expression.slice(0,-1)+(VERB_ENDINGS_BY_PROFILE[localeProfile]||CENTRAL_VERB_ENDINGS)).flatMap(tag=>lookup(lemma,tag));
    return after?result.map(value=>value+" "+after):result;
  }
  function targetPosTag(values,fallback=""){
    const compare=(a,b)=>{if(a.length>4&&b.length>4){if(a.includes("3S")&&b==="1S")return 150;if(a.includes("1S")&&b.includes("3S"))return -150;
      if(a==="VMIP2P00"&&b==="VMIS3S00")return 150;if(b==="VMIP2P00"&&a==="VMIS3S00")return -150;
      if(a[2]==="I"&&b[2]!=="I")return 100;if(b[2]==="I"&&a[2]!=="I")return -100;if(a[4]==="3"&&b[4]==="1")return 50;if(b[4]==="3"&&a[4]==="1")return -50;}return 0;};
    return values.slice().sort(compare).at(-1)??fallback;
  }
  globalThis.CorrectorCatalanSynthesis=Object.freeze({load,lookup,synthesize,targetPosTag,getPossibleTags:()=>tags});
})();
