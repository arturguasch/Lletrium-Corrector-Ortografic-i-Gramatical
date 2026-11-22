import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

export async function verifyReleaseDictionaryLayout(extension, packs) {
  const readJson = async path => JSON.parse(await readFile(join(extension, path), "utf8"));
  const caDir = "build/resources/central-cfsa2";
  const esDir = "build/resources/es-ES";
  const ca = await readJson(`${caDir}/resource-index.json`);
  const es = await readJson(`${esDir}/synthesis-manifest.json`);
  const engine = await readFile(join(extension, "src/language-engine.js"), "utf8");
  if (!engine.includes("/* Source: engine-src/modules/ca-compact-runtime.js */")
      || !engine.includes("/* Source: engine-src/modules/es-synthesis-cfsa2.js */")
      || es.format !== "CFSA2") {
    throw new Error("Rebuild the compact Catalan and Spanish engine before packaging.");
  }
  for (const [id, directory, resources] of [
    ["ca", caDir, [ca.dictionaries?.analysis, ca.dictionaries?.synthesis]],
    ["es", esDir, [es]]
  ]) {
    const pack = packs.find(item => item.id === id);
    if (!resources.every(resource => resource?.file || resource?.dataFile)
        || !resources.every(resource => pack?.files.includes(`${directory}/${resource.file || resource.dataFile}`))) {
      throw new Error(`The ${id} engine manifests point outside the pinned language pack.`);
    }
  }
  const overlays = ca.resources?.find(resource => resource.id === "synthesis-overlays");
  if (!overlays?.file) throw new Error("The Catalan synthesis overlay is missing from its manifest.");
  await access(join(extension, caDir, overlays.file));
}
