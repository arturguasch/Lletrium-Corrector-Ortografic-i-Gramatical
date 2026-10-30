import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dir = resolve(root, "engine-src/resources/es-ES");
const hash = value => createHash("sha256").update(value).digest("hex");
const [manifest, metadataBytes, metadata] = await Promise.all([
  readFile(resolve(dir, "manifest.json"), "utf8").then(JSON.parse),
  readFile(resolve(dir, "es-filter-speller-metadata.json")),
  readFile(resolve(dir, "es-filter-speller-metadata.json"), "utf8").then(JSON.parse)
]);
if (manifest.schema !== 1 || manifest.profile !== "es-ES LanguageTool 6.9-SNAPSHOT / spanish-pos-dict 2.5"
    || manifest.rawSha256 !== "80032b6167b6f365f3d2b4efe02c9444c473fbb85558ef75d69966749f26b4df"
    || metadataBytes.length !== 628 || hash(metadataBytes) !== "dc9c5692ee6cf1a485d716064e4329d462cab3512f498062793af640c5f5c952"
    || !metadata.replacementPairs || !metadata.equivalentChars) {
  throw new Error("La fuente FSA y metadata del filtro es-ES no coincide con el snapshot de LanguageTool.");
}
console.log(JSON.stringify({ profile: "es-ES", nodes: manifest.nodes, arcs: manifest.arcs,
  graphSha256: manifest.rawSha256, metadataSha256: hash(metadataBytes), okay: true }));
