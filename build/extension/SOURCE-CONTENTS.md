# Source package contents (Lletrium! 1.0.2)

This package includes the loadable extension under `build/extension/`, the shared engine source and generators under `engine-src/`, selected upstream references under `references/`, and license/provenance notices. The development-only `analysis/` workspace and its comparison oracles are not included.

The Catalan, Spanish, American English, French, Italian, and German runtime source is included. The shared engine inputs represented in `engine-src/` can be rebuilt with `node engine-src/build.mjs` (Node.js 20+). Italian and German worker pipelines are maintained under `engine-src/modules/` and staged into the extension by that build. Their larger language data is maintained separately in the versioned `language-packs` branch. The German `de-DE`, `de-AT`, and `de-CH` profiles use the versioned German pack from the same branch; local German rules and adapters are rebuilt from `engine-src/resources/german/` and `engine-src/modules/german/`.

The French adapters and rule resources are under `engine-src/modules/french/` and `engine-src/resources/fr/`; their selected upstream source is preserved under `references/languagetool-fr/`. French provenance and license limits remain documented under `build/extension/licenses/french-data/`.

Language `.pack` archives are external to this source ZIP and are maintained in the `language-packs` GitHub branch. The extension descriptors pin each versioned path and SHA-256 value. Italian and German are published as pack version 1.0.2; the Catalan, Spanish, English, and French packs retain their current catalog versions. Per-resource notices and source provenance for the external packs are maintained alongside them in `language-packs/licenses/`.
