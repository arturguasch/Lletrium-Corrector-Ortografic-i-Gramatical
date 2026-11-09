import { copyFile, cp, mkdir, readFile, readdir, rm, writeFile, access } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isSupportedDisambiguationRule } from "./tools/disambiguation-rule-gate.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const englishSrxBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-english-srx.mjs")], { encoding: "utf8" });
if (englishSrxBuild.status !== 0) throw new Error(englishSrxBuild.stderr || englishSrxBuild.stdout || "Could not build the English SRX resource.");
const englishDisambiguationBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-en-disambiguation.mjs")], { encoding: "utf8" });
if (englishDisambiguationBuild.status !== 0) throw new Error(englishDisambiguationBuild.stderr || englishDisambiguationBuild.stdout || "Could not build the English disambiguation resource.");
const englishMultiwordBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-en-multiword-resources.mjs")], { encoding: "utf8" });
if (englishMultiwordBuild.status !== 0) throw new Error(englishMultiwordBuild.stderr || englishMultiwordBuild.stdout || "Could not build the English multiword resource.");
const englishPatternBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-en-pattern-resources.mjs")], { encoding: "utf8" });
if (englishPatternBuild.status !== 0) throw new Error(englishPatternBuild.stderr || englishPatternBuild.stdout || "Could not build English PatternRule resources.");
const englishSpecificCaseBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-en-specific-case.mjs")], { encoding: "utf8" });
if (englishSpecificCaseBuild.status !== 0) throw new Error(englishSpecificCaseBuild.stderr || englishSpecificCaseBuild.stdout || "Could not build English specific-case resource.");
const englishSimpleReplaceBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-en-simple-replace.mjs")], { encoding: "utf8" });
if (englishSimpleReplaceBuild.status !== 0) throw new Error(englishSimpleReplaceBuild.stderr || englishSimpleReplaceBuild.stdout || "Could not build English simple-replace resources.");
const englishManualTagsBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-en-manual-tags.mjs")], { encoding: "utf8" });
if (englishManualTagsBuild.status !== 0) throw new Error(englishManualTagsBuild.stderr || englishManualTagsBuild.stdout || "Could not build English manual-tag resource.");
const englishWordCoherencyBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-en-word-coherency.mjs")], { encoding: "utf8" });
if (englishWordCoherencyBuild.status !== 0) throw new Error(englishWordCoherencyBuild.stderr || englishWordCoherencyBuild.stdout || "Could not build English word-coherency resource.");
const englishSynonymsBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-en-synonyms.mjs")], { encoding: "utf8" });
if (englishSynonymsBuild.status !== 0) throw new Error(englishSynonymsBuild.stderr || englishSynonymsBuild.stdout || "Could not build English synonym resource.");
const englishCompoundsBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-en-compounds.mjs")], { encoding: "utf8" });
if (englishCompoundsBuild.status !== 0) throw new Error(englishCompoundsBuild.stderr || englishCompoundsBuild.stdout || "Could not build English compounds resource.");
const englishWrongWordBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-en-wrong-word-context.mjs")], { encoding: "utf8" });
if (englishWrongWordBuild.status !== 0) throw new Error(englishWrongWordBuild.stderr || englishWrongWordBuild.stdout || "Could not build English wrong-word context resource.");
const englishContractionsBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-en-contractions.mjs")], { encoding: "utf8" });
if (englishContractionsBuild.status !== 0) throw new Error(englishContractionsBuild.stderr || englishContractionsBuild.stdout || "Could not build English contraction resource.");
const englishRulePrioritiesBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-en-rule-priorities.mjs")], { encoding: "utf8" });
if (englishRulePrioritiesBuild.status !== 0) throw new Error(englishRulePrioritiesBuild.stderr || englishRulePrioritiesBuild.stdout || "Could not build English rule-priority resource.");
const englishDashCompoundsBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-en-dash-compounds.mjs")], { encoding: "utf8" });
if (englishDashCompoundsBuild.status !== 0) throw new Error(englishDashCompoundsBuild.stderr || englishDashCompoundsBuild.stdout || "Could not build English dash-compound resource.");
const spanishContextBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-es-wrong-word-context.mjs")], { encoding: "utf8" });
if (spanishContextBuild.status !== 0) throw new Error(spanishContextBuild.stderr || spanishContextBuild.stdout || "Could not build Spanish context-confusion resource.");
const spanishCompoundsBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-es-compounds.mjs")], { encoding: "utf8" });
if (spanishCompoundsBuild.status !== 0) throw new Error(spanishCompoundsBuild.stderr || spanishCompoundsBuild.stdout || "Could not build Spanish compound resource.");
const spanishSynonymsBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-es-synonyms.mjs")], { encoding: "utf8" });
if (spanishSynonymsBuild.status !== 0) throw new Error(spanishSynonymsBuild.stderr || spanishSynonymsBuild.stdout || "Could not build Spanish synonym resource.");
const spanishConfusionPairsBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-es-confusion-pairs.mjs")], { encoding: "utf8" });
if (spanishConfusionPairsBuild.status !== 0) throw new Error(spanishConfusionPairsBuild.stderr || spanishConfusionPairsBuild.stdout || "Could not build Spanish confusion-pairs resource.");
const spanishRepeatedPatternsBuild = spawnSync(process.execPath, [resolve(root, "engine-src/tools/build-es-repeated-pattern-resource.mjs")], { encoding: "utf8" });
if (spanishRepeatedPatternsBuild.status !== 0) throw new Error(spanishRepeatedPatternsBuild.stderr || spanishRepeatedPatternsBuild.stdout || "Could not build Spanish repeated-pattern resource.");
const spanishFilterSpellerVerify = spawnSync(process.execPath, [resolve(root, "engine-src/tools/verify-es-filter-speller-source.mjs")], { encoding: "utf8" });
if (spanishFilterSpellerVerify.status !== 0) throw new Error(spanishFilterSpellerVerify.stderr || spanishFilterSpellerVerify.stdout || "Spanish LanguageTool filter-speller source does not match the pinned profile.");
const sourceFiles = [
  "engine-src/modules/ca-cfsa2-dictionary.js",
  "engine-src/modules/en-morphology.js",
  "engine-src/modules/en-tagger.js",
  "engine-src/modules/en-synthesis.js",
  "engine-src/modules/soros-runtime.js",
  "engine-src/modules/en-open-nlp.js",
  "engine-src/modules/en-multiwords.js",
  "engine-src/modules/en-xml-disambiguation.js",
  "engine-src/modules/en-spelling.js",
  "engine-src/modules/en-pattern-rule-matcher.js",
  "engine-src/modules/en-avs-an.js",
  "engine-src/modules/en-specific-case.js",
  "engine-src/modules/en-simple-replace.js",
  "engine-src/modules/en-word-coherency.js",
  "engine-src/modules/en-repetitions.js",
  "engine-src/modules/en-compounds.js",
  "engine-src/modules/en-wrong-word-context.js",
  "engine-src/modules/en-contractions.js",
  "engine-src/modules/en-dash-rule.js",
  "engine-src/modules/en-unit-conversion.js",
  "engine-src/modules/en-structural-rules.js",
  "engine-src/modules/en-regex-rules.js",
  "engine-src/modules/en-text.js",
  "engine-src/modules/en-sentences.js",
  "engine-src/modules/en-pipeline.js",
  "engine-src/modules/ca-morphology.js",
  "engine-src/modules/es-morphology.js",
  "engine-src/modules/es-tagger.js",
  "engine-src/modules/es-synthesis.js",
  "engine-src/modules/es-spelling.js",
  "engine-src/modules/es-filter-morfologik-speller.js",
  "engine-src/modules/es-chunker.js",
  "engine-src/modules/es-xml-disambiguation.js",
  "engine-src/modules/es-text.js",
  "engine-src/modules/es-sentences.js",
  "engine-src/modules/es-structural-rules.js",
  "engine-src/modules/es-simple-replace.js",
  "engine-src/modules/es-simple-replace-verbs.js",
  "engine-src/modules/es-wrong-word-context.js",
  "engine-src/modules/es-compounds.js",
  "engine-src/modules/es-word-repeat.js",
  "engine-src/modules/es-word-repeat-beginning.js",
  "engine-src/modules/es-question-mark-rule.js",
  "engine-src/modules/es-long-sentence-rule.js",
  "engine-src/modules/es-long-paragraph-rule.js",
  "engine-src/modules/es-repeated-words.js",
  "engine-src/modules/ca-java-case-regex.js",
  "engine-src/modules/es-pattern-rule-matcher.js",
  "engine-src/modules/es-pipeline.js",
  "engine-src/modules/ca-soros.js",
  "engine-src/modules/ca-synthesis.js",
  "engine-src/modules/ca-morfologik-speller.js",
  "engine-src/modules/ca-multitoken-speller.js",
  "engine-src/modules/ca-rule-filters.js",
  "engine-src/modules/ca-sentences.js",
  "engine-src/modules/ca-text.js",
  "engine-src/modules/ca-tagger.js",
  "engine-src/modules/ca-chunker.js",
  "engine-src/modules/ca-analysis.js",
  "engine-src/modules/ca-xml-disambiguation.js",
  "engine-src/modules/ca-multitoken-disambiguation.js",
  "engine-src/modules/ca-simple-replace-matcher.js",
  "engine-src/modules/ca-table-rule-matcher.js",
  "engine-src/modules/ca-pattern-rule-matcher.js",
  "engine-src/modules/ca-spelling-lexicon.js",
  "engine-src/language-engine.js"
].map(path => resolve(root, path));
const output = resolve(root, "build/language-engine.js");
const manifestPath = resolve(root, "build/engine-build.json");
const stagedExtension = resolve(root, "build/extension");
const sourceText = (await Promise.all(sourceFiles.map(path => readFile(path, "utf8"))))
  .map((contents, index) => `/* Source: ${sourceFiles[index].replace(`${root}\\`, "").replaceAll("\\", "/")} */\n${contents}`)
  .join("\n");
const resourceSource = resolve(root, "engine-src/resources/central");
const resourceOutput = resolve(root, "build/resources/central");
const posManifest = JSON.parse(await readFile(resolve(resourceSource, "manifest.json"), "utf8"));
const srxSource = resolve(root, "engine-src/resources/ca-srx.json");
const wrongVerbSource = resolve(root, "references/languagetool-ca-central/src/main/resources/org/languagetool/rules/ca/replace_verbs.txt");
const taggerResourceDir = resolve(root, "references/languagetool-ca-central/src/main/resources/org/languagetool/resource/ca");
const globalChunkerSource = resolve(root, "references/languagetool-audit/languagetool-core/src/main/resources/org/languagetool/resource/spelling_global.txt");
const catalanChunkerSource = resolve(root, "references/languagetool-ca-central/src/main/resources/org/languagetool/resource/ca/multiwords.txt");
const catalanHyphenatedSource = resolve(root, "references/languagetool-ca-central/src/main/resources/org/languagetool/resource/ca/hyphenated_words.txt");
const disambiguationInventorySource = resolve(root, "engine-src/build-inputs/reference-oracle/outputs/ca-disambiguation-inventory.json");
const patternRuleCandidatesSource = resolve(root, "engine-src/build-inputs/reference-oracle/outputs/ca-pattern-rule-candidates.json");
const disambiguationXmlSource = resolve(root, "references/languagetool-ca-central/src/main/resources/org/languagetool/resource/ca/disambiguation.xml");
const multitokenWordsSource = resolve(root, "engine-src/resources/central/ca-spelling-multitoken-words.txt");
const spellingWordsSource = resolve(root, "engine-src/resources/central/ca-spelling-words.txt");
const caSpellingListSource = resolve(root, "references/languagetool-ca-central/src/main/resources/org/languagetool/resource/ca/spelling.txt");
const caSpellingSpecialSource = resolve(root, "references/languagetool-ca-central/src/main/resources/org/languagetool/resource/ca/spelling-special.txt");
const globalSpellingListSource = resolve(root, "references/languagetool-audit/languagetool-core/src/main/resources/org/languagetool/resource/spelling_global.txt");
const caProhibitSource = resolve(root, "references/languagetool-ca-central/src/main/resources/org/languagetool/resource/ca/hunspell/prohibit.txt");
const spellingInfoSource = resolve(root, "engine-src/build-inputs/reference-oracle/artifacts/catalan-pos-dict-3.3/extracted/org/languagetool/resource/ca/ca-ES_spelling.info");
const multiwordReplaceSource = resolve(root, "references/languagetool-ca-central/src/main/resources/org/languagetool/rules/ca/replace_multiwords.txt");

await mkdir(dirname(output), { recursive: true });
await writeFile(output, sourceText, "utf8");
await mkdir(resourceOutput, { recursive: true });
const spanishResourceSource = resolve(root, "engine-src/resources/es-ES");
const spanishResourceOutput = resolve(root, "build/resources/es-ES");
await mkdir(spanishResourceOutput, { recursive: true });
const spanishPosManifest = JSON.parse(await readFile(resolve(spanishResourceSource, "manifest.json"), "utf8"));
if (spanishPosManifest.schema !== 1 || spanishPosManifest.format !== "CACFSA1" || spanishPosManifest.profile !== "es-ES LanguageTool 6.9-SNAPSHOT / spanish-pos-dict 2.5") throw new Error("Spanish POS FSA resource manifest is not the pinned independent es-ES profile.");
const spanishPosGraph = await readFile(resolve(spanishResourceSource, spanishPosManifest.dataFile));
if (createHash("sha256").update(spanishPosGraph).digest("hex") !== spanishPosManifest.compressedSha256) throw new Error("Spanish POS FSA gzip hash mismatch.");
const spanishMultiword = JSON.parse(await readFile(resolve(spanishResourceSource, "es-multiword.json"), "utf8"));
if (spanishMultiword?.schema !== 1 || spanishMultiword.profile !== "es-ES" || spanishMultiword.sourceHashes?.["es/multiwords.txt"] !== "52cee88c075bb2f23f70897ec48c0e86baf5360394d2e9a1b2ecf4aeac1dbc26" || spanishMultiword.sourceHashes?.["spelling_global.txt"] !== "98198e0ecbb5e14e32cbee42a4be8b6982c3bb34311bf9ea1f5c12fab4a65634") throw new Error("Spanish multiword resources differ from the pinned LanguageTool sources.");
const spanishMultitokenSpeller = JSON.parse(await readFile(resolve(spanishResourceSource, "es-multitoken-speller.json"), "utf8"));
if (spanishMultitokenSpeller?.schemaVersion !== 1 || spanishMultitokenSpeller.profile !== "es-ES"
    || spanishMultitokenSpeller.sourceHashes?.["es/multiwords.txt"] !== spanishMultiword.sourceHashes["es/multiwords.txt"]
    || spanishMultitokenSpeller.sourceHashes?.["spelling_global.txt"] !== spanishMultiword.sourceHashes["spelling_global.txt"]
    || spanishMultitokenSpeller.sourceHashes?.["es/hyphenated_words.txt"] !== "6088c25b42a82cc2cd325e43ea39999fac20da5af262cc951bad0661531317e1"
    || spanishMultitokenSpeller.entriesReferenceFormat !== "es-multiword-index-v1"
    || spanishMultitokenSpeller.entries?.length !== 38425
    || !spanishMultitokenSpeller.entries.every(value => typeof value === "string" || Number.isSafeInteger(value) && value !== 0)) throw new Error("Spanish multitoken spelling resource differs from the pinned LanguageTool sources.");
const spanishDisambiguation = JSON.parse(await readFile(resolve(spanishResourceSource, "es-disambiguation-rules.json"), "utf8"));
if (spanishDisambiguation?.schemaVersion !== 1 || spanishDisambiguation.language !== "es-ES" || spanishDisambiguation.sourceSha256 !== "a997ec038fb422f9502886be4c792542010d83e6bf28e82408bab23503949f54" || spanishDisambiguation.supportedRuleCount !== spanishDisambiguation.rules?.length || spanishDisambiguation.supportedRuleCount !== 733 || spanishDisambiguation.upstreamRuleCount !== 733 || spanishDisambiguation.englishWordTagsSha256 !== "44222a02ee55f5e6796cce8cdd8ba83d89fcda199ffa510f89affa5860e654fa" || Object.keys(spanishDisambiguation.englishWordTags || {}).length !== 203189) throw new Error("Spanish LanguageTool disambiguation resource differs from the pinned es-ES snapshot.");
const spanishSpellingData = JSON.parse(await readFile(resolve(spanishResourceSource, "es-spelling-data.json"), "utf8"));
if (spanishSpellingData?.schemaVersion !== 1 || spanishSpellingData.profile !== "es-ES"
    || spanishSpellingData.sourceHashes?.["es/hunspell/spelling.txt"] !== "b767c65a6f8ca830bb7bc1c7944695ff40c6d133e11f31e03e3f4ee09194bcd8"
    || spanishSpellingData.sourceHashes?.["es/hunspell/prohibit.txt"] !== "08bcc37896c36d64e7e1b066a304c0749d01ce974a116cbb0599639738081563"
    || spanishSpellingData.acceptedWordsReferenceFormat !== "es-multiword-index-v1"
    || spanishSpellingData.acceptedWords?.length !== 47278
    || !spanishSpellingData.acceptedWords.every(value => typeof value === "string" || Number.isSafeInteger(value) && value < 0)) throw new Error("Spanish LanguageTool spelling lists differ from the pinned es-ES snapshot.");
const spanishManualTags = JSON.parse(await readFile(resolve(spanishResourceSource, "es-manual-tags.json"), "utf8"));
if (spanishManualTags?.schemaVersion !== 1 || spanishManualTags.profile !== "es-ES"
    || spanishManualTags.sourceHashes?.["added.txt"] !== "683a17d2a9518e25675706190045198f0fbe5a07f00ab4f6f1b553254212006a"
    || spanishManualTags.sourceHashes?.["removed.txt"] !== "366590275f6a2f58da431f4ce088d871b945648030fdc4a43cabcc1be5802fb9"
    || spanishManualTags.additions?.length !== 5376 || spanishManualTags.removals?.length !== 18) throw new Error("Spanish LanguageTool manual POS tags differ from the pinned es-ES snapshot.");
const spanishSimpleReplace = JSON.parse(await readFile(resolve(spanishResourceSource, "es-simple-replace.json"), "utf8"));
if (spanishSimpleReplace?.schemaVersion !== 1 || spanishSimpleReplace.language !== "es-ES"
    || spanishSimpleReplace.sourceHashes?.["es/replace.txt"] !== "cf0c742753478ff30ad03367f8ea01525acab39913b1752b37d06a6cd5179bb2"
    || spanishSimpleReplace.sourceHashes?.["es/replace_custom.txt"] !== "5746fe9aedececf1874ec080035c043e490c3f8cff4aa175ed0dc5007e6b27b3"
    || spanishSimpleReplace.sourceHashes?.["es/replace_verbs.txt"] !== "1580320fb5a81889b32970a63f1075cc57cbac5ee4b8375379c5eb514fef80df"
    || spanishSimpleReplace.entryCount !== 246 || spanishSimpleReplace.formCount !== 300 || spanishSimpleReplace.entries?.length !== 246) throw new Error("Spanish LanguageTool simple-replacement data differs from the pinned es-ES snapshot.");
const spanishWrongWordContextPath = resolve(root, "engine-src/resources/es-ES/es-wrong-word-context.json");
const spanishWrongWordContext = JSON.parse(await readFile(spanishWrongWordContextPath, "utf8"));
if (spanishWrongWordContext?.schemaVersion !== 1 || spanishWrongWordContext.language !== "es-ES"
    || spanishWrongWordContext.sourceSha256 !== "0f0472a6364601e60825088ac73cb4959500a26ce5b3fdf0185f21d1d873a7a5"
    || spanishWrongWordContext.entryCount !== 3 || spanishWrongWordContext.entries?.length !== 3) throw new Error("Spanish LanguageTool context-confusion data differs from the pinned es-ES snapshot.");
const spanishCompounds = JSON.parse(await readFile(resolve(spanishResourceSource, "es-compounds.json"), "utf8"));
if (spanishCompounds?.schemaVersion !== 1 || spanishCompounds.language !== "es-ES"
    || spanishCompounds.sourceSha256 !== "25918e9cd40a23a5db5746b885b454cdbfc88d55797eccaadbb577c194bbc939"
    || spanishCompounds.entryCount !== 461 || spanishCompounds.entries?.length !== 461) throw new Error("Spanish LanguageTool compound data differs from the pinned es-ES snapshot.");
const spanishSynonyms = JSON.parse(await readFile(resolve(spanishResourceSource, "es-synonyms.json"), "utf8"));
if (spanishSynonyms?.schemaVersion !== 1 || spanishSynonyms.language !== "es-ES"
    || spanishSynonyms.sourceSha256 !== "9d5201f80c303bde34ef956c5211c58163fce247db15f5d3dd8051cd12aeaba8"
    || spanishSynonyms.entryCount !== 24 || spanishSynonyms.entries?.length !== 24) throw new Error("Spanish LanguageTool synonym data differs from the pinned es-ES snapshot.");
const spanishConfusionPairs = JSON.parse(await readFile(resolve(spanishResourceSource, "es-confusion-pairs.json"), "utf8"));
if (spanishConfusionPairs?.schemaVersion !== 1 || spanishConfusionPairs.profile !== "es-ES"
    || spanishConfusionPairs.sourceSha256 !== "1fd1fe134e54961e7a6ed8272c5f99874440841298a0e33b66595705d236ef6a"
    || spanishConfusionPairs.rowCount !== 1008 || Object.values(spanishConfusionPairs.pairs || {}).reduce((sum, rows) => sum + rows.length, 0) !== 1008) throw new Error("Spanish LanguageTool confusion-pairs data differs from the pinned es-ES snapshot.");
const spanishSynthesisManifest = JSON.parse(await readFile(resolve(spanishResourceSource, "synthesis-manifest.json"), "utf8"));
if (spanishSynthesisManifest.schema !== 1 || spanishSynthesisManifest.format !== "CACFSA1" || spanishSynthesisManifest.profile !== spanishPosManifest.profile) throw new Error("Spanish synthesis FSA manifest is not the pinned es-ES profile.");
const spanishSynthesisGraph = await readFile(resolve(spanishResourceSource, spanishSynthesisManifest.dataFile));
if (createHash("sha256").update(spanishSynthesisGraph).digest("hex") !== spanishSynthesisManifest.compressedSha256) throw new Error("Spanish synthesis FSA gzip hash mismatch.");
for (const name of [spanishPosManifest.dataFile, "synthesis-manifest.json", spanishSynthesisManifest.dataFile, "es-ES-tags.txt", "es-srx.json", "es-multiword.json", "es-multitoken-speller.json", "es-disambiguation-rules.json", "es-spelling-data.json", "es-filter-speller-metadata.json", "es-manual-tags.json", "es-simple-replace.json", "es-wrong-word-context.json", "es-compounds.json", "es-synonyms.json", "es-confusion-pairs.json", "es-repeated-pattern-rules.json", "LICENSE-LGPL-2.1.txt"]) await copyFile(resolve(spanishResourceSource, name), resolve(spanishResourceOutput, name));
await copyFile(resolve(spanishResourceSource, "manifest.json"), resolve(spanishResourceOutput, "resource-index.json"));
const spanishRepeatedPatterns = JSON.parse(await readFile(resolve(spanishResourceSource, "es-repeated-pattern-rules.json"), "utf8"));
if (spanishRepeatedPatterns?.schemaVersion !== 1 || spanishRepeatedPatterns.profile !== "es-ES"
    || spanishRepeatedPatterns.source !== "LanguageTool 6.9-SNAPSHOT RepeatedPatternRuleTransformer"
    || spanishRepeatedPatterns.styleXmlSha256 !== "e45426d2d1070d89ca43b906a31052d11d45582f8cfd79b77abe848e24aa8abe"
    || spanishRepeatedPatterns.groupCount !== 13 || spanishRepeatedPatterns.groups?.length !== 13
    || spanishRepeatedPatterns.ruleCount !== spanishRepeatedPatterns.groups.reduce((sum, group) => sum + group.rules.length, 0)) throw new Error("Spanish repeated-pattern rules differ from the pinned LanguageTool style.xml snapshot.");
await copyFile(resolve(spanishResourceSource, "es-srx.json"), resolve(spanishResourceOutput, "es-srx.json"));
const spanishPatternRulesPath = resolve(root, "engine-src/build-inputs/reference-oracle/outputs/spanish-pattern-rule-candidates.json");
const spanishPatternRulesBytes = await readFile(spanishPatternRulesPath);
const spanishPatternRules = JSON.parse(spanishPatternRulesBytes.toString("utf8"));
if (spanishPatternRules?.schemaVersion !== 1 || spanishPatternRules.language !== "es-ES"
    || spanishPatternRules.sourceSha256 !== "433fd750aadd6bf6b3b1d14bb583b649c4767710bd68ca9658d59407d53c2805"
    || spanishPatternRules.grammarXmlSha256 !== "75c4100470a0d0543af9723b112f8f9b0821dd0df578804dad58f29c70759d91"
    || spanishPatternRules.activeRuleCount !== 1591 || spanishPatternRules.runtimeRuleCount !== 1591 || spanishPatternRules.rules?.length !== 1591) {
  throw new Error("The Spanish PatternRule candidates do not match the pinned LanguageTool es-ES inventory.");
}
await copyFile(spanishPatternRulesPath, resolve(spanishResourceOutput, "es-pattern-rule-candidates.json"));
const englishResourceSource = resolve(root, "engine-src/resources/en-US");
const englishResourceOutput = resolve(root, "build/resources/en-US");
await rm(englishResourceOutput, { recursive: true, force: true });
await mkdir(englishResourceOutput, { recursive: true });
const englishManifest = JSON.parse(await readFile(resolve(englishResourceSource, "manifest.json"), "utf8"));
if (englishManifest?.schemaVersion !== 1 || englishManifest.profile !== "en-US"
    || englishManifest.source !== "LanguageTool 6.9-SNAPSHOT / english-pos-dict 0.6"
    || englishManifest.sourceJar?.sha256 !== "2a3e96b49854e5275f8eb7a1bb5b3b85b82f687fed272f3043882ccc0b1634b1"
    || englishManifest.soros?.file !== "en-US-en.sor" || englishManifest.soros?.sha256 !== "ad78ab088ceb4a5b1858020facd818ac1df5433cead09e784833047691333d11"
    || englishManifest.soros?.romanFile !== "Roman.sor" || englishManifest.soros?.romanSha256 !== "11002fdb8c7039c1a71a5ba8f3a2b405548e993f8668066363d6e1fea58ca4b1"
    || englishManifest.posDictionary?.entries !== 259353 || englishManifest.synthesisDictionary?.entries !== 259332
    || englishManifest.manualTags?.file !== "en-manual-tags.json" || englishManifest.manualTags?.additions !== 442 || englishManifest.manualTags?.removals !== 27
    || englishManifest.spelling?.locale !== "en_US" || englishManifest.spelling?.format !== "CFSA2"
    || englishManifest.spelling?.dataFile !== "en-US-spelling-cfsa2.bin.gz"
    || englishManifest.spelling?.sourceSha256 !== "9ca20ca1dd0bda6d6484331ab72459ffe49bd2624e506c63b1b47651c28451d2"
    || englishManifest.spelling?.compressedBytes !== 607289
    || englishManifest.openNlp?.format !== "GIS1" || Object.keys(englishManifest.openNlp?.models || {}).length !== 3) throw new Error("The English lexical resources do not match the pinned en-US profile.");
const englishManualTagsBytes = await readFile(resolve(englishResourceSource, englishManifest.manualTags?.file || "en-manual-tags.json"));
const englishManualTags = JSON.parse(englishManualTagsBytes.toString("utf8"));
if (createHash("sha256").update(englishManualTagsBytes).digest("hex") !== englishManifest.manualTags?.sha256
    || englishManualTags?.profile !== "en-US" || englishManualTags.additions?.length !== 442 || englishManualTags.removals?.length !== 27
    || englishManualTags.sourceHashes?.["added.txt"] !== "ac48758904839439ff46c2b893cd7c6e80237d6a5bf073f591ab6c175835a7a2"
    || englishManualTags.sourceHashes?.["removed.txt"] !== "d34555d63c6a7c97cce1e48feef71e960acd2cf003d2863460c78a3d9da75b0c") {
  throw new Error("The en-US manual POS tag overlay does not match the pinned LanguageTool source.");
}
for (const name of [englishManifest.pos.dataFile, englishManifest.posDictionary.file, englishManifest.synthesisDictionary.file,
  englishManifest.spelling.dataFile,
  "en-US-english_tags.txt", "en-US-en.sor", "en-US-det_a.txt", "en-US-det_an.txt", "en-srx.json",
  "en-specific-case.json",
  "en-simple-replace.json",
  "en-word-coherency.json", "en-synonyms.json", "en-compounds.json", "en-wrong-word-context.json",
  "en-contractions.json",
  "en-rule-priorities.json",
  "en-dash-compounds.json",
  ...Object.values(englishManifest.openNlp.models).map(model => model.file),
  englishManifest.openNlp.tokenizerAbbreviations.file, englishManifest.openNlp.posNgramWords.file,
  englishManifest.openNlp.posTagDictionary.file, englishManifest.manualTags.file, "en-disambiguation-rules.json", "en-multiwords.json"]) {
  await copyFile(resolve(englishResourceSource, name), resolve(englishResourceOutput, name));
}
const englishRuntimeManifest = { ...englishManifest };
delete englishRuntimeManifest.posIndex;
delete englishRuntimeManifest.synthesis;
delete englishRuntimeManifest.synthesisIndex;
await writeFile(resolve(englishResourceOutput, "resource-index.json"), `${JSON.stringify(englishRuntimeManifest, null, 2)}\n`, "utf8");
const englishPatternCandidatesBytes = await readFile(resolve(root, "engine-src/build-inputs/reference-oracle/outputs/en-US-pattern-rule-candidates.json"));
const englishPatternCandidatesGzip = gzipSync(englishPatternCandidatesBytes, { level: 9, mtime: 0 });
await writeFile(resolve(englishResourceOutput, "en-pattern-rule-candidates.json.gz"), englishPatternCandidatesGzip);
await rm(resolve(englishResourceOutput, "en-pattern-rule-candidates.json"), { force: true });
await copyFile(resolve(root, "engine-src/build-inputs/reference-oracle/outputs/en-US-repeated-pattern-rules.json"), resolve(englishResourceOutput, "en-repeated-pattern-rules.json"));
await copyFile(resolve(root, "engine-src/build-inputs/reference-oracle/outputs/en-US-regex-rules.json"), resolve(englishResourceOutput, "en-regex-rules.json"));
const englishAdverbMap = JSON.parse(await readFile(resolve(root, "engine-src/resources/en-US-adverb-to-adjective.json"), "utf8"));
if (englishAdverbMap?.schemaVersion !== 1 || englishAdverbMap.profile !== "en-US"
    || englishAdverbMap.sourceSha256 !== "d1b53f4cd0d8fc91413d866a6a4dd3c7aa96682e43cc1a18256801685d42ae78"
    || englishAdverbMap.count !== 503 || Object.keys(englishAdverbMap.mappings || {}).length !== 503) {
  throw new Error("The packaged en-US AdverbFilter map is incomplete or differs from LanguageTool.");
}
await copyFile(resolve(root, "engine-src/resources/en-US-adverb-to-adjective.json"), resolve(englishResourceOutput, "en-US-adverb-to-adjective.json"));
const englishPatternCandidates = JSON.parse(englishPatternCandidatesBytes.toString("utf8"));
if (englishPatternCandidates.runtimeRuleCount !== 5798 || englishPatternCandidates.rules?.length !== 5798) {
  throw new Error("The packaged English PatternRule inventory is incomplete.");
}
await copyFile(resolve(root, "engine-src/resources/synthesis/Roman.sor"), resolve(englishResourceOutput, englishManifest.soros.romanFile));
await copyFile(resolve(root, "engine-src/resources/ca-filter-data.json"), resolve(root, "build/resources/ca-filter-data.json"));
const multitokenCandidateSources = await Promise.all([catalanChunkerSource, globalChunkerSource, catalanHyphenatedSource].map(path => readFile(path, "utf8")));
const multitokenCandidateSet = new Set();
const multitokenSpellerExceptions = new Set(["San Juan", "Copa América", "Colección Jumex", "Banco Santander", "San Marcos", "Santa Ana", "San Joaquín", "Naguib Mahfouz", "Rosalía", "Aristide Maillol", "Alexia Putellas", "Mónica Randall", "Vicente Blasco Ibáñez", "Copa Sudamericana", "Série A", "Banco Sabadell"]);
for (let sourceIndex = 0; sourceIndex < multitokenCandidateSources.length; sourceIndex++) {
  const isCatalanMultiwords = sourceIndex === 0;
  for (const raw of multitokenCandidateSources[sourceIndex].split(/\r?\n/u)) {
    const line = raw.split("#", 1)[0].trim();
    if (!line) continue;
    const fields = line.split(/[\t;]/u), form = fields[0].trim(), tag = fields[1]?.trim();
    if (!form || isCatalanMultiwords && tag && !tag.startsWith("N") && tag !== "_Latin_") continue;
    if (multitokenSpellerExceptions.has(form) || !/\s/u.test(form) && !form.includes("-")) continue;
    multitokenCandidateSet.add(form);
  }
}
const multitokenCandidateText = `${[...multitokenCandidateSet].sort((a, b) => a.localeCompare(b, "und")).join("\n")}\n`;
const multitokenCandidateBytes = Buffer.from(multitokenCandidateText, "utf8");
const multitokenCandidateHash = createHash("sha256").update(multitokenCandidateBytes).digest("hex");
await writeFile(resolve(root, "build/resources/ca-multitoken-candidates.txt.gz"), gzipSync(multitokenCandidateBytes, { level: 9 }));
await writeFile(resolve(root, "build/resources/ca-multitoken-candidates.json"), JSON.stringify({ source: "LanguageTool Catalan multiwords.txt, spelling_global.txt and hyphenated_words.txt", sha256: multitokenCandidateHash, entries: multitokenCandidateSet.size }));
const spellerGraph = await readFile(resolve(root, "engine-src/resources/ca-speller-graph.bin"));
const spellerMetadata = JSON.parse(await readFile(resolve(root, "engine-src/resources/ca-speller-metadata.json"), "utf8"));
spellerMetadata.graphSha256 = createHash("sha256").update(spellerGraph).digest("hex");
const spellingOverlayGraph = await readFile(resolve(root, "engine-src/resources/ca-spelling-overlay-graph.bin"));
const spellingOverlayGraphSha256 = createHash("sha256").update(spellingOverlayGraph).digest("hex");
if (spellingOverlayGraphSha256 !== "1ed33eaf0d1f27b131e1031bd3c3569adb7c5f6c83dc29247f4432c4e99ba0e5") {
  throw new Error(`Unexpected LanguageTool plain-text spelling FSA: ${spellingOverlayGraphSha256}`);
}
spellerMetadata.spellingOverlayGraphSha256 = spellingOverlayGraphSha256;
const multitokenSpellerSource = resolve(root, "engine-src/build-inputs/reference-oracle/artifacts/catalan-pos-dict-3.3/extracted/org/languagetool/resource/ca/ca-ES_spelling_multitoken.dict");
const multitokenSpellerSourceSha256 = createHash("sha256").update(await readFile(multitokenSpellerSource)).digest("hex");
if (multitokenSpellerSourceSha256 !== "08f66266d060ac5fc04da32a66f077f74a5016e9118ef75fba9bcd64b2a829f7") {
  throw new Error(`Unexpected LanguageTool Morfologik multitoken dictionary: ${multitokenSpellerSourceSha256}`);
}
const multitokenSpellerGraph = await readFile(resolve(root, "engine-src/resources/ca-speller-multitoken-graph.bin"));
const multitokenSpellerGraphSha256 = createHash("sha256").update(multitokenSpellerGraph).digest("hex");
if (multitokenSpellerGraphSha256 !== "b09f8a3f6e6bc1d227f257065518f542f7b261935547fcb48722a8276daca7d8") {
  throw new Error(`Unexpected exported LanguageTool Morfologik multitoken graph: ${multitokenSpellerGraphSha256}`);
}
const multitokenSpellerMetadata = JSON.parse(await readFile(resolve(root, "engine-src/resources/ca-speller-multitoken-metadata.json"), "utf8"));
multitokenSpellerMetadata.graphSha256 = multitokenSpellerGraphSha256;
multitokenSpellerMetadata.sourceDictionarySha256 = multitokenSpellerSourceSha256;
const spellingMultiwordsText = await readFile(catalanChunkerSource, "utf8");
const spellingMultiwordsSha256 = createHash("sha256").update(spellingMultiwordsText).digest("hex");
if (spellingMultiwordsSha256 !== "c4d7fdf74d543d4318de1bc1a11161b7f59921594cfb915fd4bc057798a97955") {
  throw new Error(`Unexpected LanguageTool Catalan multiwords source: ${spellingMultiwordsSha256}`);
}
spellerMetadata.spellingOverlayGraphSources = { multiwordsTxtSha256: spellingMultiwordsSha256 };
const caProhibitText = await readFile(caProhibitSource, "utf8");
const caProhibitHash = createHash("sha256").update(caProhibitText).digest("hex");
const caProhibitOracleText = await readFile(caProhibitSource, "utf8");
const expectedCaProhibitHash = "2c2b703a3e36edcb6ef475649eff453677a3c2a996e9d7dfd05983944ec8d9df";
if (caProhibitHash !== expectedCaProhibitHash || caProhibitText !== caProhibitOracleText) throw new Error("Catalan prohibited-word list differs from the locked LanguageTool source.");
spellerMetadata.prohibitedWords = [...new Set(caProhibitText.split(/\r?\n/u).map(line => line.split("#", 1)[0].trim()).filter(Boolean))];
spellerMetadata.prohibitedWordsSha256 = caProhibitHash;
await writeFile(resolve(root, "build/resources/ca-speller-graph.bin.gz"), gzipSync(spellerGraph));
await writeFile(resolve(root, "build/resources/ca-spelling-overlay-graph.bin.gz"), gzipSync(spellingOverlayGraph));
await writeFile(resolve(root, "build/resources/ca-speller-metadata.json"), JSON.stringify(spellerMetadata));
await writeFile(resolve(root, "build/resources/ca-speller-multitoken-metadata.json"), JSON.stringify(multitokenSpellerMetadata));
await writeFile(resolve(root, "build/resources/ca-speller-multitoken-graph.bin.gz"), gzipSync(multitokenSpellerGraph));
await mkdir(resolve(root, "build/resources/synthesis"), { recursive: true });
for (const name of ["ca-synthesis.bin.gz", "ca.sor", "Roman.sor"]) await copyFile(resolve(root, "engine-src/resources/synthesis", name), resolve(root, "build/resources/synthesis", name));
await copyFile(resolve(root, "engine-src/resources/synthesis/manifest.json"), resolve(root, "build/resources/synthesis/resource-index.json"));
const tableSources = {
  compounds: "references/languagetool-ca-central/src/main/resources/org/languagetool/resource/ca/compounds.txt",
  checkCase: "references/languagetool-ca-central/src/main/resources/org/languagetool/rules/ca/check_case.txt",
  balearic: "references/languagetool-audit/languagetool-language-modules/ca/src/main/resources/org/languagetool/rules/ca/replace_balearic.txt",
  simple: "references/languagetool-ca-central/src/main/resources/org/languagetool/rules/ca/replace.txt",
  custom: "references/languagetool-ca-central/src/main/resources/org/languagetool/rules/ca/replace_custom.txt",
  anglicism: "references/languagetool-ca-central/src/main/resources/org/languagetool/rules/ca/replace_anglicism.txt",
  verbs: "references/languagetool-ca-central/src/main/resources/org/languagetool/rules/ca/replace_verbs.txt"
};
const tableResources = {};
for (const [name, path] of Object.entries(tableSources)) {
  const text = await readFile(resolve(root, path), "utf8");
  const sourceHash = createHash("sha256").update(text).digest("hex");
  if (name === "balearic") {
    // The general LanguageTool checkout owns this regional resource; the
    // curated ca-ES subtree intentionally does not duplicate it.
    if (sourceHash !== "47c8e31274ac09684d6106ceddffe9bdaae046f7a9aaff99c26db3c5fc786080") {
      throw new Error(`Unexpected LanguageTool Balearic replacement source hash: ${sourceHash}`);
    }
  } else {
    const oraclePath = name === "compounds" ? "resource/ca/compounds.txt" : "rules/ca/" + path.split("/").at(-1);
    const oracleText = await readFile(resolve(root, "references/languagetool-ca-central/src/main/resources/org/languagetool", oraclePath), "utf8");
    if (text !== oracleText) throw new Error(`Table resource differs from locked LanguageTool source: ${name}`);
  }
  tableResources[name] = { text, sha256: sourceHash };
}
await writeFile(resolve(root, "build/resources/ca-table-rules.json"), JSON.stringify({ schemaVersion: 1, language: "ca-ES", ...tableResources }), "utf8");
const checkCaseEntries = new Set(tableResources.checkCase.text.split(/\r?\n/u)
  .map(raw => raw.trim().split("#", 1)[0].trim().split("=", 1)[0].trim())
  .filter(Boolean).map(value => value.replace(/\s+/gu, " ").replace(/[’‘]/gu, "'").toLocaleLowerCase("ca")));
await copyFile(resolve(resourceSource, "manifest.json"), resolve(resourceOutput, "resource-index.json"));
await copyFile(resolve(resourceSource, "ca-central.bin.gz"), resolve(resourceOutput, "ca-central.bin.gz"));
await copyFile(srxSource, resolve(root, "build/resources/ca-srx.json"));
const [globalChunkerText, catalanChunkerText] = await Promise.all([
  readFile(globalChunkerSource, "utf8"), readFile(catalanChunkerSource, "utf8")
]);
const chunkerHashes = {
  spelling_global: createHash("sha256").update(globalChunkerText).digest("hex"),
  ca_multiwords: createHash("sha256").update(catalanChunkerText).digest("hex")
};
const expectedChunkerHashes = {
  spelling_global: "98198e0ecbb5e14e32cbee42a4be8b6982c3bb34311bf9ea1f5c12fab4a65634",
  ca_multiwords: "c4d7fdf74d543d4318de1bc1a11161b7f59921594cfb915fd4bc057798a97955"
};
for (const [name, expectedHash] of Object.entries(expectedChunkerHashes)) {
  if (chunkerHashes[name] !== expectedHash) throw new Error(`Unexpected LanguageTool chunker resource hash: ${name} ${chunkerHashes[name]}`);
}
function parseChunkerLines(text, filename, separatorPattern, defaultTag = null) {
  let separator = separatorPattern;
  const rows = [];
  for (const [index, raw] of text.split(/\r?\n/u).entries()) {
    let line = raw.trim();
    if (!line || line.startsWith("#")) {
      if (line.startsWith("#separatorRegExp=")) separator = new RegExp(line.slice("#separatorRegExp=".length), "u");
      continue;
    }
    line = line.split("#", 1)[0].trim();
    if (!line) continue;
    const fields = separator ? line.split(separator) : [line];
    if (fields.length !== (defaultTag == null ? 2 : 1)) throw new Error(`Invalid chunker record in ${filename}:${index + 1}`);
    const phrase = fields[0].trim();
    const tag = defaultTag ?? fields[1].trim();
    if (!phrase || !tag) throw new Error(`Empty chunker record in ${filename}:${index + 1}`);
    rows.push([phrase, tag]);
  }
  return rows;
}
const chunkerResource = {
  schemaVersion: 1,
  sourceHashes: chunkerHashes,
  globalEntries: parseChunkerLines(globalChunkerText, "spelling_global.txt", null, "NPCN000"),
  catalanEntries: parseChunkerLines(catalanChunkerText, "multiwords.txt", /[\t;]/u)
};
await writeFile(resolve(root, "build/resources/ca-chunker-data.json"), `${JSON.stringify(chunkerResource)}\n`, "utf8");
const wrongVerbText = await readFile(wrongVerbSource, "utf8");
const incorrectVerbInfinitives = [...new Set(wrongVerbText.split(/\r?\n/u)
  .map(line => line.split("#", 1)[0].trim())
  .filter(Boolean)
  .flatMap(line => line.split("=", 1)[0].split("|").map(word => word.trim().normalize("NFC")))
  .filter(Boolean))].sort();
const manualNames = ["added.txt", "added_custom.txt", "removed.txt", "removed_custom.txt"];
const manualTexts = await Promise.all(manualNames.map(name => readFile(resolve(taggerResourceDir, name), "utf8")));
function parseManualTagger(text, filename) {
  const rows = [];
  for (const [index, raw] of text.split(/\r?\n/u).entries()) {
    let line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    line = line.split("#", 1)[0].trim();
    if (!line) continue;
    const fields = line.split("\t");
    if (fields.length !== 3) throw new Error(`Invalid manual tagger record in ${filename}:${index + 1}`);
    rows.push([fields[0], fields[1], fields[2].trim()]);
  }
  return rows;
}
const manualAdditions = [...parseManualTagger(manualTexts[0], manualNames[0]), ...parseManualTagger(manualTexts[1], manualNames[1])];
const manualRemovals = [...parseManualTagger(manualTexts[2], manualNames[2]), ...parseManualTagger(manualTexts[3], manualNames[3])];
const sourceHashes = Object.fromEntries([
  ["replace_verbs.txt", wrongVerbText], ...manualNames.map((name, index) => [name, manualTexts[index]])
].map(([name, contents]) => [name, createHash("sha256").update(contents).digest("hex")]));
const expectedTaggerHashes = {
  "replace_verbs.txt": "d81b96c1661a73f2748906e8acdfe8b41b22fd8a82d201006683b3012c5fc39e",
  "added.txt": "3d451827c553d430cc55663a83be96f7e54d29166965e9f308694266ff0f1bdf",
  "added_custom.txt": "30c7602fe9a69730e194dbe5f5b332fba6adf00f49af85d8c5358055c17d339b",
  "removed.txt": "57ef9acd7a410d28645c99c9f15b5fcd543d538c094df4f0029b5cb068e6ab2f",
  "removed_custom.txt": "b840a31465a40eaf6401e4262db9d9980cd81246e7ef23357cbc54bb6e8da31c"
};
for (const [name, expectedHash] of Object.entries(expectedTaggerHashes)) {
  if (sourceHashes[name] !== expectedHash) throw new Error(`Unexpected LanguageTool Catalan tagger resource hash: ${name} ${sourceHashes[name]}`);
}
const taggerResource = { schemaVersion: 1, source: "LanguageTool Catalan manual tagger additions/removals and replace_verbs.txt", sourceHashes, incorrectVerbInfinitives, manualAdditions, manualRemovals };
await writeFile(resolve(root, "build/resources/ca-tagger-data.json"), `${JSON.stringify({
  ...taggerResource
}, null, 2)}\n`, "utf8");

const multitokenWordsText = await readFile(multitokenWordsSource, "utf8");
const multitokenWords = multitokenWordsText.split(/\r?\n/u).filter(Boolean);
const multitokenSourceSha256 = createHash("sha256").update(multitokenWordsText).digest("hex");
const expectedMultitokenSourceSha256 = "d7e08edd6ee93024c9719194bef8abf69413f7db11519ed6547f1868c62ef6d6";
if (multitokenSourceSha256 !== expectedMultitokenSourceSha256) {
  throw new Error(`Unexpected Softcatalà 3.3 multitoken FSA export hash: ${multitokenSourceSha256}`);
}
if (multitokenWords.length !== 857576) throw new Error(`Unexpected Softcatalà 3.3 multitoken entry count: ${multitokenWords.length}`);
for (let index = 1; index < multitokenWords.length; index++) {
  if (multitokenWords[index - 1] >= multitokenWords[index]) throw new Error(`Unsorted or duplicate multitoken entry at ${index}`);
}
const multitokenWordsGzip = gzipSync(Buffer.from(multitokenWordsText, "utf8"), { level: 9 });
const multitokenWordsResourcePath = resolve(root, "build/resources/ca-spelling-multitoken-words.txt.gz");
await writeFile(multitokenWordsResourcePath, multitokenWordsGzip);
const multitokenResource = {
  sourceArtifact: "org.softcatala:catalan-pos-dict:3.3",
  license: "GPL-2.0 OR LGPL-2.1 as declared by catalan-pos-dict 3.3; this distribution selects LGPL-2.1 for dictionary-derived data.",
  sourceArtifactSha256: "e5f32aadd1852e8e442810611d89906c06369a94d2a62c1a142eb3e8f5bda2f1",
  sourceFsa: "ca-ES_spelling_multitoken.dict",
  sourceFsaSha256: "08f66266d060ac5fc04da32a66f077f74a5016e9118ef75fba9bcd64b2a829f7",
  sourceSha256: multitokenSourceSha256,
  entries: multitokenWords.length,
  rawBytes: Buffer.byteLength(multitokenWordsText, "utf8"),
  compressedBytes: multitokenWordsGzip.byteLength
};

const spellingWordsText = await readFile(spellingWordsSource, "utf8");
const spellingWords = spellingWordsText.split("\n");
if (spellingWords.at(-1) === "") spellingWords.pop();
const spellingSourceSha256 = createHash("sha256").update(spellingWordsText).digest("hex");
if (spellingSourceSha256 !== "9ba9231b8d84237309fc4183b2921204ec22b3ccdadc6337efec6b4629b2d730" || spellingWords.length !== 1262334) {
  throw new Error(`Unexpected Softcatalà 3.3 spelling FSA export: ${spellingSourceSha256}/${spellingWords.length}`);
}
for (let index = 1; index < spellingWords.length; index++) {
  if (spellingWords[index - 1] >= spellingWords[index]) throw new Error(`Unsorted or duplicate spelling entry at ${index}`);
}
const spellingWordsGzip = gzipSync(Buffer.from(spellingWordsText, "utf8"), { level: 9 });
const spellingWordsResourcePath = resolve(root, "build/resources/ca-spelling-words.txt.gz");
await writeFile(spellingWordsResourcePath, spellingWordsGzip);
const spellingResource = {
  sourceArtifact: "org.softcatala:catalan-pos-dict:3.3",
  license: "GPL-2.0 OR LGPL-2.1 as declared by catalan-pos-dict 3.3; this distribution selects LGPL-2.1 for dictionary-derived data.",
  sourceArtifactSha256: "e5f32aadd1852e8e442810611d89906c06369a94d2a62c1a142eb3e8f5bda2f1",
  sourceFsa: "ca-ES_spelling.dict",
  sourceFsaSha256: "4705147c22e4d687bc903baffed42a149f4d4cf6b96aa9c204c187f4dbdae18e",
  sourceSha256: spellingSourceSha256,
  entries: spellingWords.length,
  rawBytes: Buffer.byteLength(spellingWordsText, "utf8"),
  compressedBytes: spellingWordsGzip.byteLength
};
const spellingOverlaySources = await Promise.all([caSpellingListSource, caSpellingSpecialSource, globalSpellingListSource].map(path => readFile(path, "utf8")));
const spellingOverlayHashes = Object.fromEntries(["ca-spelling.txt", "ca-spelling-special.txt", "spelling_global.txt"].map((name, index) => [name, createHash("sha256").update(spellingOverlaySources[index]).digest("hex")]));
const expectedSpellingOverlayHashes = {
  "ca-spelling.txt": "8559fe4b2d059688ab4637c3fc76d2f32fd709fa5a9ba9fc6444867e853b16f4",
  "ca-spelling-special.txt": "7567275cac5fd31617808fc393b3881f92a1761aa4361086c93c8580cc627adb",
  "spelling_global.txt": "98198e0ecbb5e14e32cbee42a4be8b6982c3bb34311bf9ea1f5c12fab4a65634"
};
for (const [name, expectedHash] of Object.entries(expectedSpellingOverlayHashes)) {
  if (spellingOverlayHashes[name] !== expectedHash) throw new Error(`Unexpected LanguageTool spelling overlay source hash: ${name} ${spellingOverlayHashes[name]}`);
}
function parseSpellingOverlay(text, includePhrases = false) {
  const result = new Set();
  for (const raw of text.split(/\r?\n/u)) {
    const word = raw.split("#", 1)[0].trim().normalize("NFC");
    if (word && (includePhrases || !/\s/u.test(word))) result.add(word);
  }
  return result;
}
const spellingOverlayWords = [...new Set(spellingOverlaySources.flatMap(text => [...parseSpellingOverlay(text)]))].sort();
const spellingOverlayText = `${spellingOverlayWords.join("\n")}\n`;
const spellingOverlayGzip = gzipSync(Buffer.from(spellingOverlayText, "utf8"), { level: 9 });
await writeFile(resolve(root, "build/resources/ca-spelling-overlays.txt.gz"), spellingOverlayGzip);
await rm(resolve(root, "build/resources/ca-spelling-suggestions.txt.gz"), { force: true });
await writeFile(resolve(root, "build/resources/ca-speller-metadata.json"), JSON.stringify(spellerMetadata));
const spellingInfoText = await readFile(spellingInfoSource, "utf8");
const spellingInfoSha256 = createHash("sha256").update(spellingInfoText).digest("hex");
if (spellingInfoSha256 !== "ef1967dc5b18616cc4ab0bd355d51036f817ee1e58236c035dac740e50e060b3") {
  throw new Error(`Unexpected Softcatalà spelling metadata hash: ${spellingInfoSha256}`);
}
spellingResource.overlayEntries = spellingOverlayWords.length;
spellingResource.overlaySha256 = createHash("sha256").update(spellingOverlayText).digest("hex");
spellingResource.overlayCompressedBytes = spellingOverlayGzip.byteLength;
spellingResource.overlaySources = spellingOverlayHashes;
spellingResource.metadataSha256 = spellingInfoSha256;

const disambiguationInventoryText = await readFile(disambiguationInventorySource, "utf8");
const disambiguationInventory = JSON.parse(disambiguationInventoryText);
const disambiguationInventoryHash = createHash("sha256").update(disambiguationInventoryText).digest("hex");
const expectedDisambiguationInventoryHash = "76aad0e16cc3b6ac310939b60c2a251a5f27a414092f3ef3af34aa3bd578fe1b";
if (disambiguationInventoryHash !== expectedDisambiguationInventoryHash) {
  throw new Error(`Unexpected LanguageTool disambiguation inventory hash: ${disambiguationInventoryHash}`);
}
if (disambiguationInventory.schemaVersion !== 5) throw new Error("Unexpected LanguageTool disambiguation inventory schema.");
const disambiguationXmlText = await readFile(disambiguationXmlSource, "utf8");
const disambiguationXmlHash = createHash("sha256").update(disambiguationXmlText).digest("hex");
const expectedDisambiguationXmlHash = "6d20057ede6143a0687cade4d56b4a5b0d2a7a6bf18b5a175af2a8c5523fb2ed";
if (disambiguationXmlHash !== expectedDisambiguationXmlHash) {
  throw new Error(`Unexpected LanguageTool Catalan disambiguation XML hash: ${disambiguationXmlHash}`);
}
const unificationDefinitions = {};
for (const [, feature, body] of disambiguationXmlText.matchAll(/<unification\s+feature="([^"]+)"[^>]*>([\s\S]*?)<\/unification>/gu)) {
  if (unificationDefinitions[feature]) throw new Error(`Duplicate unification feature: ${feature}`);
  const equivalences = {};
  for (const [, type, equivalenceBody] of body.matchAll(/<equivalence\s+type="([^"]+)"[^>]*>([\s\S]*?)<\/equivalence>/gu)) {
    const tokens = [...equivalenceBody.matchAll(/<token\b([^>]*)\/?\s*>/gu)];
    if (tokens.length !== 1) throw new Error(`Unsupported equivalence definition: ${feature}/${type}`);
    const attrs = Object.fromEntries([...tokens[0][1].matchAll(/([\w-]+)="([^"]*)"/gu)].map(([, name, value]) => [name, value]));
    if (attrs.postag_regexp !== "yes" || !attrs.postag || Object.keys(attrs).some(name => !["postag", "postag_regexp"].includes(name))) {
      throw new Error(`Unsupported equivalence token: ${feature}/${type}`);
    }
    equivalences[type] = attrs.postag;
  }
  if (!Object.keys(equivalences).length) throw new Error(`Empty unification feature: ${feature}`);
  unificationDefinitions[feature] = equivalences;
}
if (Object.keys(unificationDefinitions).sort().join(",") !== "genere,nombre,persona") {
  throw new Error("Unexpected LanguageTool Catalan unification feature inventory.");
}
const supportedDisambiguationRules = disambiguationInventory.rules.filter(isSupportedDisambiguationRule);
const disambiguationResource = {
  schemaVersion: 1,
  language: disambiguationInventory.language,
  source: disambiguationInventory.resource,
  sourceSha256: disambiguationInventoryHash,
  unificationSourceSha256: disambiguationXmlHash,
  unificationDefinitions,
  upstreamRuleCount: disambiguationInventory.ruleCount,
  supportedRuleCount: supportedDisambiguationRules.length,
  rules: supportedDisambiguationRules
};
const disambiguationResourcePath = resolve(root, "build/resources/ca-disambiguation-rules.json");
await writeFile(disambiguationResourcePath, `${JSON.stringify(disambiguationResource)}\n`, "utf8");

const patternRuleCandidatesText = await readFile(patternRuleCandidatesSource, "utf8");
const patternRuleCandidates = JSON.parse(patternRuleCandidatesText);
if (patternRuleCandidates.schemaVersion !== 1 || patternRuleCandidates.language !== "ca-ES"
    || !Number.isInteger(patternRuleCandidates.activeRuleCount)
    || patternRuleCandidates.activeRuleCount > patternRuleCandidates.rules?.length
    || (patternRuleCandidates.runtimeRuleCount != null
      && patternRuleCandidates.runtimeRuleCount !== patternRuleCandidates.rules?.length)
    || !patternRuleCandidates.grammarXmlSha256 || !patternRuleCandidates.rules?.length) {
  throw new Error("LanguageTool PatternRule candidate resource is missing or invalid; run the structural audit first.");
}
const patternRuleCandidatesPath = resolve(root, "build/resources/ca-pattern-rule-candidates.json");
const dialectRulePath = resolve(root, "engine-src/resources/ca-dialect-pattern-rules.json");
const dialectProfilePath = resolve(root, "engine-src/resources/ca-dialect-profile-overrides.json");
const dialectRulesResource = JSON.parse(await readFile(dialectRulePath, "utf8"));
const expectedDialectRuleIds = ["AMANEIXER", "COLOREJAR", "LLARGARIA"];
if (dialectRulesResource.schemaVersion !== 1 || dialectRulesResource.language !== "ca"
    || dialectRulesResource.grammarXmlSha256 !== "6a765748ad295530980a2132e078aaa37dd879432b1420e1907c4673cc36fe7b"
    || dialectRulesResource.sharedGrammarXmlSha256 !== patternRuleCandidates.grammarXmlSha256
    || JSON.stringify(dialectRulesResource.rules?.map(rule => rule.id).sort()) !== JSON.stringify(expectedDialectRuleIds)
    || dialectRulesResource.rules.some(rule => rule.sourceFile !== "/org/languagetool/rules/ca/ca-ES-valencia/grammar.xml")) {
  throw new Error("LanguageTool Valencian rule resource is missing, unexpected, or not source-verified.");
}
await copyFile(dialectRulePath, resolve(root, "build/resources/ca-dialect-pattern-rules.json"));
const dialectProfilesResource = JSON.parse(await readFile(dialectProfilePath, "utf8"));
const expectedProfileCounts = { valencian: { disabled: 64, additions: 29 }, balearic: { disabled: 33, additions: 12 } };
if (dialectProfilesResource.schemaVersion !== 1
    || dialectProfilesResource.baseInventorySha256 !== createHash("sha256").update(patternRuleCandidatesText).digest("hex")
    || Object.keys(dialectProfilesResource.profiles || {}).sort().join(",") !== "balearic,valencian") {
  throw new Error("LanguageTool dialect profile overrides are missing or do not match the central inventory.");
}
for (const [profile, expected] of Object.entries(expectedProfileCounts)) {
  const data = dialectProfilesResource.profiles[profile];
  if (data.disabled?.length !== expected.disabled || data.additions?.length !== expected.additions
      || data.sharedGrammarXmlSha256 !== patternRuleCandidates.grammarXmlSha256
      || data.additions.some(rule => rule.id === "MUNICIPIS_VALENCIA")) {
    throw new Error(`Unexpected LanguageTool rule delta for ${profile}.`);
  }
}
await copyFile(dialectProfilePath, resolve(root, "build/resources/ca-dialect-profile-overrides.json"));
const combinedPatternCandidates = {
  ...patternRuleCandidates,
  activeRuleCount: patternRuleCandidates.activeRuleCount + dialectRulesResource.rules.length,
  runtimeRuleCount: patternRuleCandidates.runtimeRuleCount + dialectRulesResource.rules.length,
  rules: [...patternRuleCandidates.rules, ...dialectRulesResource.rules],
  dialectRuleCount: dialectRulesResource.rules.length,
  dialectGrammarXmlSha256: dialectRulesResource.grammarXmlSha256,
  dialectProfiles: Object.fromEntries(Object.entries(dialectProfilesResource.profiles).map(([profile, data]) => [profile, {
    language: data.language,
    activePatternRuleCount: data.activePatternRuleCount,
    disabledRuleCount: data.disabled.length,
    addedRuleCount: data.additions.length,
    inventorySha256: data.inventorySha256
  }]))
};
await writeFile(patternRuleCandidatesPath, `${JSON.stringify(combinedPatternCandidates)}\n`, "utf8");

// Keep LanguageTool's multiword table as data; the runtime applies the same
// case-insensitive longest-form scan instead of turning its rows into regexes.
const multiwordReplaceText = await readFile(multiwordReplaceSource, "utf8");
const multiwordReplaceHash = createHash("sha256").update(multiwordReplaceText).digest("hex");
const expectedMultiwordReplaceHash = "150f014fd9c3085bdc69bc44dd7309f02e078a119ff79d9d334a39f974e0d750";
if (multiwordReplaceHash !== expectedMultiwordReplaceHash) {
  throw new Error(`Unexpected LanguageTool multiword replacement source hash: ${multiwordReplaceHash}`);
}
const multiwordEntries = [];
for (const rawLine of multiwordReplaceText.split(/\r?\n/u)) {
  let line = rawLine.trim();
  if (!line || line.startsWith("#")) continue;
  line = line.split("#", 1)[0].trim();
  if (!line) continue;
  const columns = line.split("\t");
  if (columns.length > 2) throw new Error(`Unsupported multiword replacement row: ${rawLine}`);
  const [forms, suggestionText = ""] = columns[0].split("=", 2);
  if (!forms || suggestionText === undefined) throw new Error(`Malformed multiword replacement row: ${rawLine}`);
  multiwordEntries.push({
    wrongForms: forms.split("|").map(value => value.toLocaleLowerCase("ca")),
    suggestions: suggestionText.split("|"),
    message: columns[1] || null
  });
}
const multiwordReplaceResource = {
  schemaVersion: 1,
  language: "ca-ES",
  ruleId: "CA_SIMPLE_REPLACE_MULTIWORDS",
  languagePriority: 70,
  source: "LanguageTool ca/replace_multiwords.txt",
  sourceSha256: multiwordReplaceHash,
  entryCount: multiwordEntries.length,
  entries: multiwordEntries
};
const multiwordReplaceResourcePath = resolve(root, "build/resources/ca-simple-replace-multiwords.json");
await writeFile(multiwordReplaceResourcePath, `${JSON.stringify(multiwordReplaceResource)}\n`, "utf8");

const syntax = spawnSync(process.execPath, ["--check", output], { encoding: "utf8" });
if (syntax.status !== 0) {
  process.stderr.write(syntax.stderr || syntax.stdout || "No se pudo validar la sintaxis del artefacto.\n");
  process.exit(syntax.status || 1);
}

await import(new URL("./modules/ca-sentences.js", import.meta.url));
const srxResource = JSON.parse(await readFile(srxSource, "utf8"));
const srxTokenizer = new globalThis.CorrectorCatalanSentenceTokenizer(srxResource);

const manifest = {
  schemaVersion: 1,
  apiVersion: 1,
  sources: sourceFiles.map(path => path.replace(`${root}\\`, "").replaceAll("\\", "/")),
  output: "build/language-engine.js",
  bytes: Buffer.byteLength(sourceText, "utf8"),
  runtime: "classic-script; browser globals only",
  linguisticPipelineImplemented: true,
  publicCheckApiImplemented: true,
  extensionWorkerIntegrated: false,
  parityComplete: true,
  parityScope: "finite-regression-benchmark; not a claim of universal equivalence",
  missingStages: [],
  activeStages: ["ca-srx-sentence-segmentation", "ca-tokenization", "softcatala-pos-lookup", "surface-form-tagger", "languagetool-derived-tagging", "contextual-reading-view", "global-multiword-chunker", "catalan-multiword-chunker", `languagetool-central-profile-xml:${supportedDisambiguationRules.length}`, "softcatala-catalan-multitoken-disambiguation", "languagetool-morfologik-multitoken-suggestions", `languagetool-check-case:${checkCaseEntries.size}`, "languagetool-trim-match-ends", "softcatala-3.3-spelling", "languagetool-spelling-overlays", "unified-local-issue-arbitration", "public-checkText-checkBatch"],
  sentenceRules: srxTokenizer.rules.length,
  sentenceRulesSha256: srxResource.sourceSha256,
  morphology: {
    sourceJarSha256: posManifest.sourceJar.sha256,
    rawSha256: posManifest.rawSha256,
    counts: posManifest.counts
  },
  taggerResource: {
    sourceHashes: taggerResource.sourceHashes,
    incorrectVerbInfinitives: taggerResource.incorrectVerbInfinitives.length,
    manualAdditionRows: taggerResource.manualAdditions.length,
    manualRemovalRows: taggerResource.manualRemovals.length
  },
  chunkerResource: {
    sourceHashes: chunkerHashes,
    globalEntries: chunkerResource.globalEntries.length,
    catalanEntries: chunkerResource.catalanEntries.length
  },
  multitokenResource,
  spellingResource,
  synthesisResource: JSON.parse(await readFile(resolve(root, "engine-src/resources/synthesis/manifest.json"), "utf8")),
  morfologikSpellerResource: { graphSha256: spellerMetadata.graphSha256, nodes: 317366, arcs: 804587, upstreamVersion: "2.2.0", prohibitedWords: spellerMetadata.prohibitedWords.length, prohibitedWordsSha256: caProhibitHash, purpose: "FindSuggestionsFilter" },
  morfologikMultitokenSpellerResource: { sourceDictionary: "org.softcatala:catalan-pos-dict:3.3!/org/languagetool/resource/ca/ca-ES_spelling_multitoken.dict", sourceDictionarySha256: multitokenSpellerSourceSha256, graphSha256: multitokenSpellerGraphSha256, nodes: 1758774, arcs: 2569902, compressedBytes: gzipSync(multitokenSpellerGraph).byteLength, maxEditDistance: 1, upstreamVersion: "LanguageTool 6.9-SNAPSHOT / Morfologik 2.2.0", purpose: "CatalanMultitokenSpeller.getAdditionalSuggestions" },
  filterResource: { sha256: createHash("sha256").update(await readFile(resolve(root, "engine-src/resources/ca-filter-data.json"))).digest("hex"), sources: JSON.parse(await readFile(resolve(root, "engine-src/resources/ca-filter-data.json"), "utf8")).sources },
  tableRuleResources: Object.fromEntries(Object.entries(tableResources).map(([name,resource])=>[name,resource.sha256])),
  disambiguationResource: {
    sourceSha256: disambiguationInventoryHash,
    upstreamRules: disambiguationInventory.ruleCount,
    supportedRules: supportedDisambiguationRules.length,
    excludedRules: disambiguationInventory.ruleCount - supportedDisambiguationRules.length
  },
  patternRuleResource: {
    grammarXmlSha256: patternRuleCandidates.grammarXmlSha256,
    inventorySha256: patternRuleCandidates.sourceSha256,
    candidateRules: patternRuleCandidates.rules.length,
    inclusiveDialectRules: dialectRulesResource.rules.map(rule => rule.id),
    dialectGrammarXmlSha256: dialectRulesResource.grammarXmlSha256,
    dialectProfiles: Object.fromEntries(Object.entries(dialectProfilesResource.profiles).map(([profile, data]) => [profile, {
      language: data.language,
      activePatternRuleCount: data.activePatternRuleCount,
      disabledRuleCount: data.disabled.length,
      addedRuleCount: data.additions.length,
      inventorySha256: data.inventorySha256
    }]))
  },
  simpleReplaceMultiwords: {
    sourceSha256: multiwordReplaceHash,
    entries: multiwordEntries.length
  },
  resourceManifests: ["build/resources/en-US/resource-index.json", "build/resources/en-US/en-srx.json", "build/resources/en-US/en-disambiguation-rules.json", "build/resources/en-US/en-multiwords.json", "build/resources/en-US/en-word-coherency.json", "build/resources/en-US/en-synonyms.json", "build/resources/en-US/en-compounds.json", "build/resources/en-US/en-wrong-word-context.json", "build/resources/en-US/en-contractions.json", "build/resources/en-US/en-pattern-rule-candidates.json.gz", "build/resources/en-US/en-repeated-pattern-rules.json", "build/resources/central/resource-index.json", "build/resources/es-ES/resource-index.json", "build/resources/es-ES/synthesis-manifest.json", "build/resources/es-ES/es-srx.json", "build/resources/es-ES/es-multiword.json", "build/resources/es-ES/es-multitoken-speller.json", "build/resources/es-ES/es-disambiguation-rules.json", "build/resources/es-ES/es-spelling-data.json", "build/resources/es-ES/es-manual-tags.json", "build/resources/es-ES/es-simple-replace.json", "build/resources/es-ES/es-wrong-word-context.json", "build/resources/es-ES/es-compounds.json", "build/resources/es-ES/es-synonyms.json", "build/resources/es-ES/es-confusion-pairs.json", "build/resources/es-ES/es-repeated-pattern-rules.json", "build/resources/ca-srx.json", "build/resources/ca-tagger-data.json", "build/resources/ca-chunker-data.json", "build/resources/ca-disambiguation-rules.json", "build/resources/ca-pattern-rule-candidates.json", "build/resources/ca-dialect-pattern-rules.json", "build/resources/ca-dialect-profile-overrides.json", "build/resources/ca-simple-replace-multiwords.json", "build/resources/ca-spelling-multitoken-words.txt.gz", "build/resources/ca-spelling-words.txt.gz", "build/resources/ca-spelling-overlays.txt.gz", "build/resources/synthesis/resource-index.json", "build/resources/synthesis/ca-synthesis.bin.gz", "build/resources/ca-speller-metadata.json", "build/resources/ca-speller-multitoken-metadata.json", "build/resources/ca-speller-multitoken-graph.bin.gz", "build/resources/ca-speller-graph.bin.gz", "build/resources/ca-spelling-overlay-graph.bin.gz", "build/resources/ca-filter-data.json", "build/resources/ca-table-rules.json"]
};
manifest.resourceManifests.push("build/resources/en-US/en-regex-rules.json");
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
await mkdir(resolve(stagedExtension, "src"), { recursive: true });
await mkdir(resolve(stagedExtension, "build"), { recursive: true });
await rm(resolve(stagedExtension, "build/resources/en-US"), { recursive: true, force: true });
for (const resourceRoot of [resolve(root, "build/resources"), resolve(stagedExtension, "build/resources")]) {
  for (const path of ["central/manifest.json", "en-US/manifest.json", "es-ES/manifest.json", "synthesis/manifest.json"]) {
    await rm(resolve(resourceRoot, path), { force: true });
  }
}
await copyFile(output, resolve(stagedExtension, "src/language-engine.js"));
await copyFile(manifestPath, resolve(stagedExtension, "build/engine-build.json"));
await cp(resolve(root, "build/resources"), resolve(stagedExtension, "build/resources"), { recursive: true, force: true });
// French adapters/resources are maintained as source under engine-src, but
// remain a distinct proof-stage runtime and do not change the shared engine's
// advertised profile set or the pending French data-rights status.
const frenchModuleSource = resolve(root, "engine-src/modules/french");
for (const name of await readdir(frenchModuleSource)) {
  if (!name.startsWith("french-") || !name.endsWith(".js")) continue;
  await copyFile(resolve(frenchModuleSource, name), resolve(stagedExtension, "src", name));
}
await cp(resolve(root, "engine-src/resources/fr"), resolve(stagedExtension, "build/resources/fr"), { recursive: true, force: true });
const frenchRuleCandidates = resolve(root, "engine-src/resources/fr/french-pattern-rule-candidates.json");
await mkdir(resolve(stagedExtension, "src/dictionaries/french"), { recursive: true });
await copyFile(frenchRuleCandidates, resolve(stagedExtension, "src/dictionaries/french/french-pattern-rule-candidates.json"));
process.stdout.write(`Engine build ready: ${manifest.output} (${manifest.bytes} bytes); staged extension refreshed.\n`);
