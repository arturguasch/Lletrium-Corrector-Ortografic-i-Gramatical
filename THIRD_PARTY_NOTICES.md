# Avisos i inventari de components de tercers

Aquest inventari acompanya el paquet de fonts de Lletrium 1.0.2. El codi original cobert per la GPL està delimitat a [LICENSING.md](LICENSING.md); aquest fitxer identifica materials de tercers que mantenen els seus avisos i condicions. Les còpies de llicència completes es troben a `build/extension/licenses/` i a les carpetes upstream indicades.

## Mapa de procedència

| Component | Ubicació al paquet de fonts | Llicència/tractament |
| --- | --- | --- |
| LanguageTool català | `references/languagetool-ca-central/`, `references/languagetool-audit/` i recursos derivats a `build/extension/` i `engine-src/` | Les còpies upstream conserven LGPL i els avisos originals. Les adaptacions locals es descriuen al bloc LanguageTool del registre instal·lable i a `LICENSING.md`. |
| LanguageTool castellà | `references/languagetool-es-ES/` | Codi i regles upstream amb els avisos LGPL corresponents. Recursos empaquetats segons els manifests de `es-ES`. |
| LanguageTool anglès | `references/languagetool-en-US/` | Codi/regles upstream sota LGPL segons els fitxers originals. Els avisos de Moby/WordNet són separats. |
| Softcatalà / `catalan-dict-tools` | `references/softcatala-dict-tools/`, `references/softcatala-audit/`, `licenses/softcatala/`, `licenses/catalan-dict-tools/` i recursos catalans indicats als manifests | Es conserven GPL-2.0-or-later i LGPL-2.1-or-later quan l’origen ofereix la llicència dual; els recursos distribuïts seleccionen LGPL on així ho indiquen els manifests. |
| Diccionari POS català 3.3 | `engine-src/resources/central/`, `engine-src/resources/synthesis/` i els recursos corresponents a `build/extension/build/resources/` | GPL-2.0 o LGPL-2.1 segons el POM upstream; aquesta distribució conserva la selecció LGPL registrada als manifests. Les còpies d’auditoria no incloses no es presenten com a contingut del ZIP. |
| Diccionari POS castellà 2.5 | Recursos `es-ES` i avisos de llicència corresponents | LGPL-2.1 segons els avisos upstream; els artefactes d’auditoria i les còpies de treball no formen part d’aquest ZIP. |
| Diccionari POS anglès 0.6 | Recursos `en-US` i `build/extension/licenses/languagetool-runtime/english-pos-readme.txt` | LGPL-2.1 per al codi/dades segons els avisos upstream; els materials Moby/WordNet tenen les seves condicions pròpies. Les còpies d’auditoria no incloses no es presenten com a contingut del ZIP. |
| Models OpenNLP | Recursos anglesos derivats i avisos a `build/extension/licenses/opennlp/` | Apache-2.0; còpia de la llicència i NOTICE al paquet. |
| Morfologik | `engine-src/modules/ca-morfologik-speller.js` | BSD-3-Clause; còpia i atribució a `build/extension/licenses/morfologik/COPYING.txt`. |
| Paquets italià i alemany | Paquets `.pack` versionats a la branca externa `language-packs` | Els avisos per recurs, les còpies de llicències i la procedència es mantenen a `language-packs/licenses/italian-data/` i `language-packs/licenses/german-data/`. El paquet alemany combina diverses llicències; no té una llicència global. |

## Materials d’auditoria no distribuïts

- `analysis/` i els seus inventaris, dades generades, sortides d’oracles, comparacions, resultats i corpus s’exclouen del ZIP públic de fonts. No són contingut cobert per la GPL del paquet, i la GPL no concedeix automàticament drets per reutilitzar textos o dades que no s’hi distribueixen.

## Regles d’interpretació

1. Les carpetes de referència que sí que apareixen a `references/` són materials de tercers; no queden sota la GPL de Lletrium només per estar dins del mateix ZIP. Els artefactes locals d’auditoria sota `analysis/` s’exclouen del ZIP.
2. Les dades generades o adaptades conserven la llicència que indiquen el seu manifest, l’artefacte font i `build/extension/licenses/THIRD_PARTY_NOTICES.md`.
3. Els avisos upstream, copyright, POMs, metadades i llicències de cada component s’han de conservar quan se’n copiï o redistribueixi el contingut.
4. La GPL de Lletrium no concedeix cap llicència sobre el nom o la marca de LanguageTool, Softcatalà, OpenNLP, Morfologik ni Lletrium.

Per a qualsevol fitxer no cobert clarament per aquest mapa, no n’infereixis la llicència només per la carpeta on apareix: consulta el seu avís individual, el manifest de recurs i els fitxers de llicència upstream abans de reutilitzar-lo.
