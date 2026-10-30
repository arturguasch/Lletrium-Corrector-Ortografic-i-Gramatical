# LanguageTool pattern runtime

Original Catalan grammar, filters, pronoun table and numeric rules: Jaume Ortolà i Font, Daniel Naber and LanguageTool contributors, according to the file. The Soros interpreter derives from the implementation by László Németh, available under LGPL/BSD alternatives; this adaptation uses the LGPL option. Covered LanguageTool code adaptations are distributed under LGPL-2.1-or-later. The audited source snapshots are in `references/languagetool-ca-central/` and `references/languagetool-audit/`; input hashes are in `references/upstream.lock.json`, selected rules in `config/lt-central-rule-selection.json`, and the generated bundle in `src/dictionaries/central/lt-pattern-rules.json`. Adaptations by this project, 2026.

The Valencian-only `CA_WORD_COHERENCY_VALENCIA` behavior and word pairs follow LanguageTool's `WordCoherencyValencianRule`, `AbstractWordCoherencyRule` and `coherency-valencia.txt` (LGPL-2.1-or-later). The implementation is in `src/language-engine.js`; the pair source hash is recorded beside the runtime rule.

The spelling, multitoken and morphology data derived from `org.softcatala:catalan-pos-dict:3.3` retain the upstream dual GPL-2.0/LGPL-2.1 terms; this distribution selects LGPL-2.1 for those data. The source artifact, files, hashes and license choice are recorded in `references/upstream.lock.json`, the resource manifests and `licenses/THIRD_PARTY_NOTICES.md`. The JavaScript spelling trie is a local implementation using Softcatalà equivalence and replacement data; see `licenses/softcatala/` and `licenses/catalan-dict-tools/`.

All execution is local. The original remote rewrite service is replaced by conservative local rules, without claiming equivalent coverage.
