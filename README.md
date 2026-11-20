# Lletrium! language packs

This branch-ready set contains static language packs for compatible Lletrium builds. French, German, and Italian are pinned to extension version 1.0.2. Older extension versions without matching descriptors will not be offered those packs.

The extension contains the language engine and correction logic. These packages contain static resources only. The extension verifies the pinned package hash, format, resource inventory, and per-resource hashes before storing a package locally. Installed packs work offline.

Do not replace bytes at an existing versioned URL. Publish a new pack version and update the catalog and matching extension descriptor together. Third-party notices and license texts are in licenses/. German notices, provenance and rebuildable source exports are under licenses/german-data/.
