# Notice — French Soros number spelling data

The French `fr.sor` data consumed by LanguageTool's `FrenchSynthesizer` is in
Soros format, the number-to-words data format used by the Numbertext project.
The Numbertext project states that language data (Soros programs) is licensed
under **LGPL-3.0-or-later or Modified BSD (dual license)**, except Serbian.

- Upstream project: <https://github.com/Numbertext/libnumbertext>
- Upstream data path: `data/fr.sor`
- Upstream license and attribution: repository `README.md` and `COPYING`
- Copyright stated upstream: 2009–2021 László Németh et al.
- French (Belgian and Swiss) data attribution stated upstream: Olivier Ronez
- LanguageTool consumer: `FrenchSynthesizer` loads `/fr/fr.sor`
- Local LanguageTool payload SHA-256: `cdfc3e44a23f648958b981571c8ae0c7b4d174c58cd050f4cb90063406f2a048`
- Content signal: the pinned file contains the Belgian/Swiss forms `septante`, `huitante` and `nonante`, matching the dialect scope and named French contributor in Numbertext's README.

The upstream README expressly covers Numbertext Soros language data under the
dual license and attributes French (Belgian and Swiss) data to Olivier Ronez.
The local LanguageTool snapshot contains the regional forms, but its checkout
does not include Git history and the exact bytes have not been compared against
an upstream Numbertext revision. Therefore the project-level license and
attribution are verified, while exact file lineage/version is still
unconfirmed. Keep `fr.sor` out of public packs until that last link is
documented; do not describe the content signal alone as proof of byte identity.
If later included, retain this notice and mark any transformation.

The BSD option requires retaining the copyright notice, conditions, and
disclaimer in source redistributions, and reproducing them in binary
redistributions. The LGPL option requires its applicable notices and terms.
This file is a release-preparation record, not legal advice.
