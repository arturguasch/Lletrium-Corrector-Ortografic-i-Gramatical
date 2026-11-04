# Lletrium! language packs

This proof set contains version 1.0.1 static language packs and a catalog for compatible Lletrium builds. It omits legacy root-level copies; do not use it to replace production contents until compatibility with older clients is checked.

The extension contains the language engine and correction logic. These packages contain static resources only. The extension verifies the pinned package hash, format, resource inventory, and per-resource hashes before storing a package locally. Installed packs work offline.

Do not replace bytes at an existing versioned URL. Publish a new pack version and update the catalog and matching extension descriptor together. Third-party notices and license texts are in `licenses/`.
