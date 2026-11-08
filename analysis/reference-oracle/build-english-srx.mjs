import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const packagedSource = resolve(root, 'references/languagetool-es-ES/languagetool-core/src/main/resources/org/languagetool/resource/segment.srx');
const checkoutSource = resolve(root, 'analysis/reference-oracle/languagetool/languagetool-master/languagetool-core/src/main/resources/org/languagetool/resource/segment.srx');
const source = existsSync(packagedSource) ? packagedSource : checkoutSource;
const xml = await readFile(source, 'utf8');
const languageRule = /<languagerule\s+languagerulename="English">([\s\S]*?)<\/languagerule>/u.exec(xml)?.[1];
if (!languageRule) throw new Error('English SRX language rules are missing from the pinned LanguageTool source.');
const decodeXml = value => value.replace(/&lt;/gu, '<').replace(/&gt;/gu, '>').replace(/&quot;/gu, '"').replace(/&apos;/gu, "'").replace(/&amp;/gu, '&');
const rules = [];
for (const match of languageRule.matchAll(/<rule\s+break="(yes|no)">([\s\S]*?)<\/rule>/gu)) {
  const before = /<beforebreak>([\s\S]*?)<\/beforebreak>/u.exec(match[2])?.[1];
  const after = /<afterbreak>([\s\S]*?)<\/afterbreak>/u.exec(match[2])?.[1] ?? '';
  if (before == null) throw new Error(`English SRX rule ${rules.length} has no beforebreak expression.`);
  rules.push({ break: match[1], before: decodeXml(before.trim()), after: decodeXml(after.trim()) });
}
if (rules.length < 20) throw new Error(`Unexpectedly small English SRX rule inventory: ${rules.length}`);
const result = { schemaVersion: 1, languageCode: 'en-US', languageRule: 'English', sourceSha256: createHash('sha256').update(xml).digest('hex'), ruleCount: rules.length, rules };
const output = resolve(root, 'engine-src/resources/en-US/en-srx.json');
await writeFile(output, `${JSON.stringify(result)}\n`);
console.log(JSON.stringify({ output, languageCode: result.languageCode, ruleCount: rules.length, sourceSha256: result.sourceSha256 }));
