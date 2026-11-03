# Lletrium! language data packs 1.0.0

These files contain static, pre-compressed language resources used by Lletrium! 1.0.0. They contain no executable JavaScript, rule interpreter, or remotely supplied correction rules. The extension supplies the runtime and all correction logic.

## Files

- `ca-ES.pack`: shared Catalan lexical and morphology data for Central Catalan, Valencian, and Balearic profiles.
- `es-ES.pack`: Spanish morphology data.
- `en-US.pack`: American English tokenizer, tagger, chunker, spelling, and synthesis models.

The extension verifies the package SHA-256 and each embedded resource hash before storing the package in IndexedDB. The source package builder records the exact resource paths and bytes.

## Third-party notices

The `licenses/` directory contains the applicable third-party notices and license texts. These data files retain their upstream licensing and attribution; the repository’s top-level project license does not replace those terms.
