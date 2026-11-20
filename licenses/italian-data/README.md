# Italian language-pack provenance and notices

The Italian pack is versioned as `it/1.0.2` and is offered only to compatible Lletrium 1.0.2+ builds. It contains resources derived from multiple upstream projects. Their copyrights and terms remain with their respective authors.

## Identified upstream components

- LanguageTool Italian grammar rules and Italian disambiguation/SRX resources: LanguageTool project, LGPL-2.1-or-later by project default where no resource-specific exception was found. The grammar XML carries its own LGPL notice. Preserve the upstream copyright and LGPL notices.
- Morph-it! Italian POS/morphology, synthesis and tag data: Morph-it! v0.4.8, distributed under dual LGPL / CC BY-SA 2.0 terms. The filtered source records match the LanguageTool POS, synthesis and tag resources exactly (505,005 records; no missing or extra records). This project selects the LGPL route for these identified derived resources and retains upstream attribution.
- Italian spelling resources: this pack reuses LanguageTool's published Morfologik resources byte-for-byte (`it_IT.dict`, `it_IT.info`, `spelling.txt`, and `ignore.txt`; see the pinned LanguageTool source tree and the reproducible comparison report in the development project). Lletrium does not rebuild the Hunspell dictionary. LanguageTool identifies Italian Writing Aids 3.3.1 as the upstream dictionary family; the preserved upstream notices identify GPL-3.0 and its contributors. The exact Italian Writing Aids 3.3.1 OXT source is preserved in the development/source materials. We have not independently reproduced LanguageTool's upstream `.aff`/`.dic`-to-Morfologik build, so we do not claim that independent conversion was performed by Lletrium.
- Morfologik format/reader code follows the separate Morfologik notices in `../morfologik/`; do not confuse the reader implementation license with the Italian word-list license.

## Provenance status

Known sources, versions and hashes are recorded in `analysis/italian-adaptation/phase7-provenance-audit.md` and `italian-languagetool-speller-reuse.json` in the development project. The pack's direct reuse of LanguageTool's compiled spelling resources is byte-for-byte verified; Morph-it! record correspondence is exact. The upstream source-to-binary build recipe is not independently reproduced. The maintainers are open to receiving corrections, authorship details, or further source/build details from the relevant authors. No unknown author is represented as a Lletrium contributor.

This notice records the current attribution findings; it does not claim that unresolved source correspondence has been independently cleared. Retain this notice with the pack and update it when the upstream author or reproducible source chain is confirmed.

## Upstream references

- LanguageTool: https://github.com/languagetool-org/languagetool
- Morph-it!: https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it
- LibreOffice dictionaries: https://github.com/LibreOffice/dictionaries/tree/master/it_IT
- Italian Writing Aids 3.3.1: https://extensions.openoffice.org/en/project/italian-dictionary-thesaurus-hyphenation-patterns
