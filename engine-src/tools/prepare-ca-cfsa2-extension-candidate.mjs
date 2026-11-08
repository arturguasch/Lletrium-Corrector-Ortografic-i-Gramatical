import { cp, copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const candidateBase = resolve(root, "analysis/catalan-reduction");
const candidateExtension = resolve(candidateBase, "candidate-extension");
const originalExtension = resolve(root, "build/extension");
const replaceExisting = process.argv.includes("--rebuild");
if (!candidateExtension.startsWith(candidateBase + sep)) throw new Error("Candidate path escaped the isolated analysis directory.");
try {
  await stat(candidateExtension);
  if (!replaceExisting) throw new Error(`Candidate already exists; pass --rebuild to replace this isolated candidate: ${candidateExtension}`);
  await rm(candidateExtension, { recursive: true, force: true });
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

await cp(originalExtension, candidateExtension, { recursive: true, errorOnExist: true, force: false });
const buildSource = await readFile(resolve(root, "engine-src/build.mjs"), "utf8");
const sourceBlock = /const sourceFiles = \[([\s\S]*?)\]\.map\(path => resolve\(root, path\)\);/u.exec(buildSource)?.[1];
if (!sourceBlock) throw new Error("Could not find the canonical bundled source list in engine-src/build.mjs.");
const sourceFiles = [...sourceBlock.matchAll(/"([^"]+)"/gu)].map(match => match[1]);
if (!sourceFiles.includes("engine-src/modules/ca-morphology.js") || !sourceFiles.includes("engine-src/modules/ca-synthesis.js")) {
  throw new Error("The canonical build list has changed; candidate substitutions require review.");
}
const candidateSources = [];
for (const source of sourceFiles) {
  if (source === "engine-src/modules/ca-morphology.js") {
    candidateSources.push("engine-src/modules/ca-cfsa2-dictionary.js", "engine-src/modules/ca-morphology-cfsa2.js");
  } else if (source === "engine-src/modules/ca-synthesis.js") {
    candidateSources.push("engine-src/modules/ca-synthesis-cfsa2.js");
  } else if (source === "engine-src/language-engine.js") {
    candidateSources.push("analysis/catalan-reduction/generated/cfsa2-runtime-aliases.js", source);
  } else candidateSources.push(source);
}
const aliases = `/* Experimental CFSA2 candidate bridge; never used by the production build. */\n(() => {\n  globalThis.CorrectorCatalanMorphology = globalThis.CorrectorCatalanMorphologyCfsa2;\n  globalThis.CorrectorCatalanSynthesis = globalThis.CorrectorCatalanSynthesisCfsa2;\n})();\n`;
const generatedDir = resolve(candidateBase, "generated");
await mkdir(generatedDir, { recursive: true });
await writeFile(resolve(generatedDir, "cfsa2-runtime-aliases.js"), aliases, "utf8");
const candidateBundle = (await Promise.all(candidateSources.map(async source => {
  const contents = source === "analysis/catalan-reduction/generated/cfsa2-runtime-aliases.js"
    ? aliases
    : await readFile(resolve(root, source), "utf8");
  return `/* Source: ${source.replaceAll("\\", "/")} */\n${contents}`;
}))).join("\n");
await writeFile(resolve(candidateExtension, "src/language-engine.js"), candidateBundle, "utf8");

const packageResources = resolve(candidateExtension, "build/resources");
const candidateResources = resolve(candidateBase, "candidate-resources");
const candidateManifest = JSON.parse(await readFile(resolve(candidateResources, "resource-index.json"), "utf8"));
const compactDir = resolve(packageResources, "central-cfsa2");
await mkdir(compactDir, { recursive: true });
for (const resource of candidateManifest.resources) await copyFile(resolve(candidateResources, resource.file), resolve(compactDir, resource.file));
await copyFile(resolve(candidateResources, "resource-index.json"), resolve(compactDir, "resource-index.json"));

const centralDir = resolve(packageResources, "central");
const synthesisDir = resolve(packageResources, "synthesis");
await rm(centralDir, { recursive: true, force: true });
await rm(resolve(synthesisDir, "ca-synthesis.bin.gz"), { force: true });
const oldSynthesisManifest = JSON.parse(await readFile(resolve(synthesisDir, "resource-index.json"), "utf8"));
const sorosManifest = {
  schemaVersion: 1,
  language: "ca-ES",
  format: "CATALAN_SOROS_RESOURCES",
  sourceArtifact: "LanguageTool Catalan 6.9-SNAPSHOT Soros resources",
  sourceHashes: {
    caSoros: oldSynthesisManifest.sourceHashes.caSoros,
    romanSoros: oldSynthesisManifest.sourceHashes.romanSoros,
  },
  files: ["ca.sor", "Roman.sor"],
};
await writeFile(resolve(synthesisDir, "resource-index.json"), `${JSON.stringify(sorosManifest, null, 2)}\n`, "utf8");

const engineManifestPath = resolve(candidateExtension, "build/engine-build.json");
const engineManifest = JSON.parse(await readFile(engineManifestPath, "utf8"));
engineManifest.sources = candidateSources;
engineManifest.bytes = Buffer.byteLength(candidateBundle, "utf8");
engineManifest.morphology = {
  format: "CFSA2",
  sourceSha256: candidateManifest.dictionaries.analysis.sourceSha256,
  sourceBytes: candidateManifest.dictionaries.analysis.sourceBytes,
  compressedBytes: candidateManifest.dictionaries.analysis.compressedBytes,
  counts: candidateManifest.dictionaries.analysis.counts,
};
engineManifest.synthesisResource = {
  format: "CFSA2+ordered LanguageTool overlays",
  sourceSha256: candidateManifest.dictionaries.synthesis.sourceSha256,
  sourceBytes: candidateManifest.dictionaries.synthesis.sourceBytes,
  compressedBytes: candidateManifest.dictionaries.synthesis.compressedBytes,
  overlayBytes: candidateManifest.resources.find(resource => resource.id === "synthesis-overlays").compressedBytes,
  overlaySha256: candidateManifest.resources.find(resource => resource.id === "synthesis-overlays").compressedSha256,
  possibleTags: candidateManifest.resources.find(resource => resource.id === "synthesis-overlays").possibleTags.length,
};
engineManifest.resourceManifests = engineManifest.resourceManifests
  .filter(path => path !== "build/resources/central/resource-index.json" && path !== "build/resources/synthesis/ca-synthesis.bin.gz")
  .concat("build/resources/central-cfsa2/resource-index.json");
engineManifest.experimentalDataFormat = { format: "CFSA2", isolatedCandidate: true, productionBuildModified: false };
await writeFile(engineManifestPath, `${JSON.stringify(engineManifest, null, 2)}\n`, "utf8");

const syntaxCheck = await import("node:child_process").then(({ spawnSync }) => spawnSync(process.execPath, ["--check", resolve(candidateExtension, "src/language-engine.js")], { encoding: "utf8" }));
if (syntaxCheck.status !== 0) throw new Error(syntaxCheck.stderr || syntaxCheck.stdout || "Candidate bundle syntax check failed.");
console.log(JSON.stringify({ candidateExtension, sourceModules: candidateSources.length, bundleBytes: Buffer.byteLength(candidateBundle), candidateResources: candidateManifest.resources.map(resource => ({ file: resource.file, bytes: resource.compressedBytes })), removedProductionDataBytes: 0 }, null, 2));
