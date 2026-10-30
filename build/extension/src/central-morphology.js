/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
/* Compact lookup of packaged Softcatalà POS data. No network service or Node dependency. */
(() => {
  'use strict';
  const decoder = new TextDecoder('utf-8', {fatal: true});
  const normalize = value => String(value || '').normalize('NFC').replace(/[’ʼ]/gu, "'");
  class CentralMorphology {
    constructor(buffer, manifest) {
      if (!(buffer instanceof ArrayBuffer)) throw new TypeError('Expected ArrayBuffer');
      if (manifest.schema !== 1 || manifest.format !== 'CACPOS1') throw new Error('Unsupported POS format');
      if (buffer.byteLength !== manifest.rawBytes) throw new Error('POS byte length mismatch');
      if (decoder.decode(new Uint8Array(buffer,0,8)) !== 'CACPOS1\0') throw new Error('Invalid POS magic');
      this.buffer = buffer;
      this.manifest = manifest;
      this.sections = {};
      for (const [key,section] of Object.entries(manifest.sections)) {
        const elementBytes = section.type === 'u32' ? 4 : 1;
        if (section.offset < 8 || section.offset + section.length * elementBytes > buffer.byteLength || (elementBytes === 4 && section.offset % 4)) throw new Error('Invalid section: ' + key);
        this.sections[key] = section.type === 'u32' ? new Uint32Array(buffer,section.offset,section.length) : new Uint8Array(buffer,section.offset,section.length);
      }
    }
    word(table, id) {
      const offsets=this.sections[table+'Offsets'], bytes=this.sections[table+'Bytes'];
      if (id < 0 || id >= offsets.length-1) return '';
      return decoder.decode(bytes.subarray(offsets[id],offsets[id+1]));
    }
    find(table, value) {
      const target=normalize(value); let lo=0,hi=this.sections[table+'Offsets'].length-2;
      while(lo<=hi){const mid=(lo+hi)>>>1,w=this.word(table,mid);if(w===target)return mid;if(w<target)lo=mid+1;else hi=mid-1;}return -1;
    }
    reading(id, formId) {
      const rows=this.sections.readings;
      return {form:this.word('forms',formId),lemma:this.word('lemmas',rows[id*2]),tag:this.word('tags',rows[id*2+1]),source:'softcatala-central'};
    }
    lookup(value, {lowercaseFallback=true}={}) {
      const word=normalize(value);let id=this.find('forms',word);
      if(id<0&&lowercaseFallback)id=this.find('forms',word.toLocaleLowerCase('ca'));
      if(id<0)return [];
      const ranges=this.sections.formReadingOffsets,out=[];
      for(let row=ranges[id];row<ranges[id+1];row++)out.push(this.reading(row,id));return out;
    }
    formIdForReading(row) {
      const ranges=this.sections.formReadingOffsets;let lo=0,hi=ranges.length-2;
      while(lo<=hi){const mid=(lo+hi)>>>1;if(row<ranges[mid])hi=mid-1;else if(row>=ranges[mid+1])lo=mid+1;else return mid;}throw new Error('Invalid reading index');
    }
    synthesize(lemma, tag, {regexp=false}={}) {
      const id=this.find('lemmas',lemma);if(id<0)return [];
      const matcher=regexp?new RegExp('^(?:'+tag+')$','u'):null;
      const offsets=this.sections.lemmaReadingOffsets,indices=this.sections.lemmaReadingIds,result=new Set();
      for(let i=offsets[id];i<offsets[id+1];i++){const row=indices[i],rowTag=this.word('tags',this.sections.readings[row*2+1]);if(matcher?matcher.test(rowTag):rowTag===tag)result.add(this.word('forms',this.formIdForReading(row)));}return [...result];
    }
    getStats(){return {...this.manifest.counts,indexBytes:this.buffer.byteLength,profile:this.manifest.profile};}
    static async load({baseUrl,fetcher=globalThis.fetch}={}) {
      const base=baseUrl||globalThis.chrome?.runtime?.getURL('src/dictionaries/central/');
      if(!base)throw new Error('Provide baseUrl outside extension');
      const meta=await fetcher(new URL('manifest.json',base));if(!meta.ok)throw new Error('POS manifest load failed');const manifest=await meta.json();
      const data=await fetcher(new URL(manifest.dataFile,base));if(!data.ok)throw new Error('POS data load failed');
      if(typeof DecompressionStream!=='function')throw new Error('Gzip decompression unavailable');
      const bytes=new Uint8Array(manifest.rawBytes);
      const reader=data.body.pipeThrough(new DecompressionStream('gzip')).getReader();
      let written=0;
      try {while(true){const chunk=await reader.read();if(chunk.done)break;if(written+chunk.value.byteLength>bytes.length)throw new Error('POS decompression overflow');bytes.set(chunk.value,written);written+=chunk.value.byteLength;}}
      finally {reader.releaseLock();}
      if(written!==bytes.length)throw new Error('POS decompression truncated');
      const buffer=bytes.buffer;
      const digest=await globalThis.crypto.subtle.digest('SHA-256',buffer);
      const hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
      if(hash!==manifest.rawSha256)throw new Error('POS checksum mismatch');return new CentralMorphology(buffer,manifest);
    }
  }
  globalThis.CorrectorCentralMorphology = CentralMorphology;
})();
