# Build inputs

This directory contains only the generated LanguageTool inventories and extracted Catalan spelling resources required by `engine-src/build.mjs`. It replaces selected inputs that were previously kept under the development-only `analysis/reference-oracle/` tree. It is not a second runtime resource directory: runtime outputs are generated into `engine-src/resources/` and `build/extension/`.

The retained inventories correspond to the pinned LanguageTool resources recorded under `references/`; their language-specific notices remain in `references/` and `build/extension/licenses/`. Full oracle corpora, comparison reports, JARs, and exploratory artifacts remain excluded because the runtime build does not consume them.
