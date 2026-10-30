import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const source = resolve(root, "analysis/reference-oracle/languagetool/languagetool-master/languagetool-core/src/main/resources/org/languagetool/resource/segment.srx");
const outputDir = resolve(process.argv[2] || resolve(root, "engine-src/resources/es-ES"));
const xml = await readFile(source, "utf8");
const sourceSha256 = createHash("sha256").update(xml).digest("hex");
const languageRule = /<languagerule\s+languagerulename="Spanish">([\s\S]*?)<\/languagerule>/u.exec(xml)?.[1];
if (!languageRule) throw new Error("Spanish SRX rule group is missing from LanguageTool segment.srx");

function xmlText(value) {
  return value.replace(/&lt;/gu, "<").replace(/&gt;/gu, ">")
    .replace(/&quot;/gu, '"').replace(/&apos;/gu, "'").replace(/&amp;/gu, "&");
}

const rules = [];
for (const match of languageRule.matchAll(/<rule\s+break="(yes|no)">([\s\S]*?)<\/rule>/gu)) {
  const body = match[2];
  const before = /<beforebreak>([\s\S]*?)<\/beforebreak>/u.exec(body)?.[1];
  const after = /<afterbreak>([\s\S]*?)<\/afterbreak>/u.exec(body)?.[1] ?? "";
  if (before == null) throw new Error(`Spanish SRX rule ${rules.length} has no beforebreak expression`);
  rules.push({ break: match[1], before: xmlText(before.trim()), after: xmlText(after.trim()) });
}
if (rules.length < 40) throw new Error(`Unexpectedly small Spanish SRX rule set: ${rules.length}`);
const resource = { schemaVersion: 1, languageCode: "es-ES", languageRule: "Spanish", sourceSha256, rules };
await mkdir(outputDir, { recursive: true });
await writeFile(resolve(outputDir, "es-srx.json"), `${JSON.stringify(resource)}\n`);
console.log(JSON.stringify({ languageCode: resource.languageCode, sourceSha256, ruleCount: rules.length, output: resolve(outputDir, "es-srx.json") }, null, 2));
