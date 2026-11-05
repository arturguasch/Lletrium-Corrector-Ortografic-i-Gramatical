# Lletrium! language packs

This branch-ready set contains static language packs for compatible Lletrium builds. French is pinned to extension version 1.0.1; earlier extension versions without the French descriptor will not be offered that pack.

The extension contains the language engine and correction logic. These packages contain static resources only. The extension verifies the pinned package hash, format, resource inventory, and per-resource hashes before storing a package locally. Installed packs work offline.

Do not replace bytes at an existing versioned URL. Publish a new pack version and update the catalog and matching extension descriptor together. Third-party notices and license texts are in `licenses/`. French resource provenance and pending authorship details are documented under `licenses/french-data/`.
