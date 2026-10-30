import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourcePath = resolve(root, "analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/en/src/main/java/org/languagetool/language/English.java");
const bytes = await readFile(sourcePath);
const sourceSha256 = createHash("sha256").update(bytes).digest("hex");
if (sourceSha256 !== "f90350bf9571ba6b754ce455015ce50905de895d9d915eecd4ea21559d09fb7f") throw new Error("Pinned LanguageTool English.java changed; audit en-US rule priorities before rebuilding.");
const source = bytes.toString("utf8");
const priorities = {};
for (const match of source.matchAll(/id2prio\.put\("([^"]+)",\s*(-?\d+)\s*\)/gu)) priorities[match[1]] = Number(match[2]);
if (Object.keys(priorities).length < 300) throw new Error(`Incomplete English priority map: ${Object.keys(priorities).length}`);
const output = { schemaVersion: 1, profile: "en-US", source: "LanguageTool 6.9-SNAPSHOT English#getPriorityForId/getPriorityMap", sourceSha256, priorities };
const outputPath = resolve(root, "engine-src/resources/en-US/en-rule-priorities.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ output: "engine-src/resources/en-US/en-rule-priorities.json", priorities: Object.keys(priorities).length, sourceSha256 }));
