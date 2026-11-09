import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import "../modules/en-xml-disambiguation.js";

const root = resolve(import.meta.dirname, "../..");
const sourcePath = resolve(root, "engine-src/build-inputs/reference-oracle/outputs/en-US-disambiguation.json");
const xmlPath = resolve(root, "references/languagetool-en-US/languagetool-language-modules/en/src/main/resources/org/languagetool/resource/en/disambiguation.xml");
const outputPath = resolve(root, "engine-src/resources/en-US/en-disambiguation-rules.json");
const source = JSON.parse(await readFile(sourcePath, "utf8"));
const xml = await readFile(xmlPath, "utf8");
const expectedHash = "61b02a3b577c03e7a1197968238404f56915fcb862096fbf745ab3b3c77f7edc";
if (source.language !== "en-US" || source.resourceSha256 !== expectedHash || source.ruleCount !== 1018
    || source.rules?.length !== source.ruleCount || createHash("sha256").update(xml).digest("hex") !== expectedHash) {
  throw new Error("English disambiguation inventory differs from pinned LanguageTool.");
}

const unificationDefinitions = Object.create(null);
for (const section of xml.matchAll(/<unification\s+feature="([^"]+)"[^>]*>([\s\S]*?)<\/unification>/gu)) {
  const equivalences = Object.create(null);
  for (const match of section[2].matchAll(/<equivalence\s+type="([^"]+)"[^>]*>([\s\S]*?)<\/equivalence>/gu)) {
    const tags = [...match[2].matchAll(/<token\s+postag="([^"]+)"\s+postag_regexp="yes"\s*\/>/gu)].map(token => token[1]);
    if (!tags.length) throw new Error(`Empty LanguageTool English unification type: ${section[1]}/${match[1]}`);
    equivalences[match[1]] = tags.join("|");
  }
  if (!Object.keys(equivalences).length) throw new Error(`Empty LanguageTool English unification feature: ${section[1]}`);
  unificationDefinitions[section[1]] = equivalences;
}

const validateRule = globalThis.CorrectorEnglishXmlDisambiguator?.validateRule;
if (typeof validateRule !== "function") throw new Error("The English XML runtime validator is unavailable.");
const rules = [];
const excluded = [];
for (const rule of source.rules) {
  try { validateRule(rule, unificationDefinitions); rules.push(rule); }
  catch { excluded.push(rule); }
}
if (rules.length !== 1018 || excluded.length !== 0) throw new Error(`Unexpected English disambiguation runtime result: ${rules.length} supported, ${excluded.length} excluded.`);
const resource = {
  schemaVersion: 1,
  language: "en-US",
  source: "LanguageTool 6.9-SNAPSHOT en/disambiguation.xml",
  sourceSha256: expectedHash,
  upstreamRuleCount: source.ruleCount,
  supportedRuleCount: rules.length,
  excludedRuleCount: excluded.length,
  excludedRules: excluded.map(rule => ({ id: rule.id, action: rule.action, filterClass: rule.filterClass || null })),
  unificationDefinitions,
  englishWordTags: {},
  englishWordTagsSha256: "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a",
  rules
};
await writeFile(outputPath, `${JSON.stringify(resource)}\n`, "utf8");
console.log(`English disambiguation resource: ${rules.length}/${source.ruleCount} rules supported; ${excluded.length} explicitly inventoried.`);
