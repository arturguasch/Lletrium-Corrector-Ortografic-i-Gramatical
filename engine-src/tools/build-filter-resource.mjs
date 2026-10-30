/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const base=resolve('analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/ca/src/main');
const sources={};
async function source(path){const text=await readFile(resolve(base,path),'utf8');sources[path]=createHash('sha256').update(text).digest('hex');return text;}
function patterns(text,names){return Object.fromEntries(names.map(name=>{
  const match=text.match(new RegExp('\\b'+name+'\\s*=\\s*(?:Pattern\\.)?compile\\(([\\s\\S]*?);'));
  if(!match)throw new Error('Missing source pattern '+name);
  const literals=[...match[1].matchAll(/"(?:\\.|[^"\\])*"/gu)];
  if(!literals.length)throw new Error('Empty source pattern '+name);
  return [name,{source:literals.map(m=>JSON.parse(m[0])).join(''),flags:match[1].slice(literals.at(-1).index+literals.at(-1)[0].length)}];
}));}
const helper=await source('java/org/languagetool/rules/ca/ApostophationHelper.java');
const apostrophation=Object.fromEntries(Object.entries(patterns(helper,['pMascYes','pMascNo','pFemYes','pFemNo','pHacAspirada'])).map(([key,value])=>[key,value.source]));
const prepDet=Object.fromEntries([...helper.matchAll(/prepDet\.put\(("(?:\\.|[^"\\])*"),\s*("(?:\\.|[^"\\])*")\)/gu)].map(m=>[JSON.parse(m[1]),JSON.parse(m[2])]));
const adaptation=patterns(await source('java/org/languagetool/language/Catalan.java'),['CA_CONTRACTIONS','CA_CONTRACTIONS2',...Array.from({length:9},(_,i)=>'CA_APOSTROPHES'+(i+1)),'CA_REMOVE_SPACES']);
const confusions={};
for(const raw of (await source('resources/org/languagetool/rules/ca/confusion_pairs.txt')).split(/\r?\n/u)){
  const line=raw.trim();if(!line||line.startsWith('#'))continue;
  const [wrong,form,tag]=line.split(';');if(!wrong||!form||!tag)throw new Error('Invalid confusion pair: '+line);
  (confusions[wrong]??=[]).push({form,tag});
}
const pronounSource=await source('java/org/languagetool/rules/ca/PronomsFeblesHelper.java');
const pronounBody=pronounSource.match(/String\[\] pronomsFebles\s*=\s*\{([\s\S]*?)\};/u)[1].replace(/\/\/[^\n]*/gu,'');
const pronouns=[...pronounBody.matchAll(/"(?:\\.|[^"\\])*"/gu)].map(m=>JSON.parse(m[0]));
if(pronouns.length%7)throw new Error('Invalid pronoun table');
const pronounMaps=Object.fromEntries(['incorrectOrders','reflexivePronoun','dativePronoun'].map(name=>[name,Object.fromEntries([...pronounSource.matchAll(new RegExp(name+'\\.put\\(("(?:\\\\.|[^"\\\\])*"),\\s*("(?:\\\\.|[^"\\\\])*")\\)','gu'))].map(m=>[JSON.parse(m[1]),JSON.parse(m[2])]))]));
const verbsSource=await source('java/org/languagetool/rules/ca/VerbsHelper.java');
const verbDicendi=[...verbsSource.match(/lVerbsDicendi\s*=\s*Arrays.asList\(([\s\S]*?)\);/u)[1].matchAll(/"(?:\\.|[^"\\])*"/gu)].map(m=>JSON.parse(m[0]));
const nounToVerbSource=await source('java/org/languagetool/rules/ca/NounToVerbHelper.java');
const nounToVerb=Object.fromEntries(nounToVerbSource.split(/\r?\n/u).filter(line=>!line.trim().startsWith('//')).flatMap(line=>[...line.matchAll(/Map\.entry\("((?:\\.|[^"\\])*)",\s*"((?:\\.|[^"\\])*)"\)/gu)].map(m=>[JSON.parse('"'+m[1]+'"'),JSON.parse('"'+m[2]+'"')])));
const verbClassifierText=await source('resources/org/languagetool/resource/ca/verbs_classification.txt');
const verbClassification={};
for(const raw of verbClassifierText.split(/\r?\n/u)){
  const line=raw.split('#',1)[0].trim();if(!line)continue;
  const split=line.indexOf('=');if(split<1)throw new Error('Invalid verb-classification record: '+line);
  const lemma=line.slice(0,split).trim(),classes=line.slice(split+1).trim();
  if(!lemma||!classes)throw new Error('Invalid verb-classification lemma: '+lemma);
  // VerbClassifier loads rows into a HashMap; later duplicate rows replace
  // earlier values, so preserve that behavior rather than merging classes.
  verbClassification[lemma]=classes;
}
await writeFile(resolve('engine-src/resources/ca-filter-data.json'),JSON.stringify({schemaVersion:1,sources,apostrophation,prepDet,adaptation,confusions,pronouns,pronounMaps,verbDicendi,nounToVerb,verbClassification}));
const catalanSpellerSource=await source('java/org/languagetool/rules/ca/MorfologikCatalanSpellerRule.java');
const spellingPronounBody=catalanSpellerSource.match(/PronomsDarrere\s*=\s*Arrays\.asList\(([\s\S]*?)\);/u)?.[1];
if(!spellingPronounBody)throw new Error('Missing MorfologikCatalanSpellerRule.PronomsDarrere');
const spellingPronounsAfter=[...spellingPronounBody.matchAll(/"(?:\\.|[^"\\])*"/gu)].map(m=>JSON.parse(m[0]));
if(spellingPronounsAfter.length<100)throw new Error('Incomplete speller pronoun suffix list');
const filterResourcePath=resolve('engine-src/resources/ca-filter-data.json');
const filterResource=JSON.parse(await readFile(filterResourcePath,'utf8'));
filterResource.sources=sources;
filterResource.spellerPronounsAfter=spellingPronounsAfter;
await writeFile(filterResourcePath,JSON.stringify(filterResource));
