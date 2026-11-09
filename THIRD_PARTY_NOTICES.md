# Avisos i inventari de components de tercers

Aquest inventari acompanya el paquet de fonts de Lletrium 1.0.0. El codi original cobert per la GPL està delimitat a [LICENSING.md](LICENSING.md); aquest fitxer identifica materials de tercers que mantenen els seus avisos i condicions. Les còpies de llicència completes es troben a `build/extension/licenses/` i a les carpetes upstream indicades.

## Mapa de procedència

| Component | Ubicació al paquet de fonts | Llicència/tractament |
| --- | --- | --- |
| LanguageTool català | `references/languagetool-ca-central/`, `references/languagetool-audit/` i recursos derivats a `build/extension/` i `engine-src/` | Les còpies upstream conserven LGPL i els avisos originals. Les adaptacions locals es descriuen al bloc LanguageTool del registre instal·lable i a `LICENSING.md`. |
| LanguageTool castellà | `references/languagetool-es-ES/` i `analysis/reference-oracle/languagetool/` | Codi i regles upstream amb els avisos LGPL corresponents. Recursos empaquetats segons els manifests de `es-ES`. |
| LanguageTool anglès | `references/languagetool-en-US/` i `analysis/reference-oracle/languagetool/` | Codi/regles upstream sota LGPL segons els fitxers originals. Els avisos de Moby/WordNet són separats. |
| Softcatalà / `catalan-dict-tools` | `references/softcatala-dict-tools/`, `references/softcatala-audit/`, `licenses/softcatala/`, `licenses/catalan-dict-tools/` i recursos catalans indicats als manifests | Es conserven GPL-2.0-or-later i LGPL-2.1-or-later quan l’origen ofereix la llicència dual; els recursos distribuïts seleccionen LGPL on així ho indiquen els manifests. |
| Diccionari POS català 3.3 | `analysis/reference-oracle/artifacts/catalan-pos-dict-3.3/`, `engine-src/resources/central/`, `engine-src/resources/synthesis/` i els recursos corresponents a `build/extension/build/resources/` | GPL-2.0 o LGPL-2.1 segons el POM upstream; aquesta distribució conserva la selecció LGPL registrada als manifests. |
| Diccionari POS castellà 2.5 | `analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/` i recursos `es-ES` | LGPL-2.1, amb fonts, POM i avisos inclosos. |
| Diccionari POS anglès 0.6 | `analysis/reference-oracle/artifacts/english-pos-dict-0.6/` i recursos `en-US` | LGPL-2.1 per al codi/dades segons els avisos upstream; els materials Moby/WordNet tenen les seves condicions pròpies. |
| Models OpenNLP | `analysis/reference-oracle/artifacts/opennlp-*-models-1.5.jar` i els recursos anglesos derivats | Apache-2.0; còpia de la llicència i NOTICE a `build/extension/licenses/opennlp/`. |
| Morfologik | `analysis/reference-oracle/src/Speller.java`, `analysis/reference-oracle/src/HMatrix.java` i `engine-src/modules/ca-morfologik-speller.js` | BSD-3-Clause; còpia i atribució a `build/extension/licenses/morfologik/COPYING.txt`. |

## Dades i resultats d’anàlisi

- `analysis/reference-oracle/outputs/ca-disambiguation-inventory.json`, `ca-pattern-rule-candidates.json`, `ca-pattern-rules-balear.json.gz` i `ca-pattern-rules-valencia.json.gz` són inventaris/dades generats a partir de regles LanguageTool; no són codi original GPL de Lletrium.
- Els fitxers `*-oracle-*.json` contenen sortides de LanguageTool. Els fitxers `*comparison.json`, `*performance.json`, `*-local*.json` i `analysis/reference-oracle/corpus/` són resultats o materials de prova; no són programari i la GPL de codi no concedeix automàticament drets sobre els textos que contenen.

## Regles d’interpretació

1. Les carpetes `references/` i els artefactes originals sota `analysis/reference-oracle/artifacts/` són materials de referència de tercers; no queden sota la GPL de Lletrium només per estar dins del mateix ZIP.
2. Les dades generades o adaptades conserven la llicència que indiquen el seu manifest, l’artefacte font i `build/extension/licenses/THIRD_PARTY_NOTICES.md`.
3. Els avisos upstream, copyright, POMs, metadades i llicències de cada component s’han de conservar quan se’n copiï o redistribueixi el contingut.
4. La GPL de Lletrium no concedeix cap llicència sobre el nom o la marca de LanguageTool, Softcatalà, OpenNLP, Morfologik ni Lletrium.

Per a qualsevol fitxer no cobert clarament per aquest mapa, no n’infereixis la llicència només per la carpeta on apareix: consulta el seu avís individual, el manifest de recurs i els fitxers de llicència upstream abans de reutilitzar-lo.
