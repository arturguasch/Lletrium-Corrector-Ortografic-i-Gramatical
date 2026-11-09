# Abast de les llicències

Aquest document és la guia d’abast del `LICENSE` situat a l’arrel d’aquest paquet. La presència del text GPL no canvia la llicència dels materials de tercers.

## Codi sota GPL-3.0-or-later

S’aplica al codi original de Lletrium creat per al projecte, inclosos els scripts i els adaptadors propis, excepte quan un fitxer o una entrada d’aquest inventari n’indica una altra llicència. També s’aplica a les adaptacions locals de codi LanguageTool publicades aquí sota GPL en virtut de l’opció de GPL de la secció 3 de LGPL-2.1, quan aquesta opció és aplicable ([text de LGPL-2.1, secció 3](https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html#SEC3)). Aquesta elecció no canvia la llicència de les còpies upstream ni dels recursos i dades de tercers. Es conserven els textos de llicència, atribucions i avisos de LanguageTool.

Els fitxers afectats són el codi font del motor (`engine-src/modules/`, `engine-src/tools/`, `engine-src/*.mjs`) i el codi runtime (`build/extension/src/`), llevat de contingut de tercers que s’identifica als avisos i manifests. Els fitxers JavaScript que incorporen regles, missatges o taules de dades derivades poden contenir material subjecte a les llicències de les dades d’origen encara que el codi executiu porti identificador GPL. Els fitxers agregats o generats, especialment `build/extension/src/language-engine.js`, s’han d’interpretar amb aquest inventari i les excepcions dels components incorporats; no se n’ha d’extreure una taula o dada i relicenciar-la com a codi original.

## Materials que conserven les llicències de tercers

| Material | Camins principals del paquet | Condicions que es mantenen |
| --- | --- | --- |
| Snapshots de LanguageTool | `references/languagetool-*`, `references/languagetool-audit/`, `analysis/reference-oracle/languagetool/` | LGPL i avisos upstream inclosos als snapshots. No s’aplica la GPL de Lletrium als fitxers upstream originals. |
| Recursos derivats de LanguageTool i etiquetatge castellà/anglès | `build/extension/build/resources/`, `engine-src/resources/` i els artefactes corresponents a `analysis/reference-oracle/artifacts/` | La llicència i procedència indicades als manifests i a `THIRD_PARTY_NOTICES.md`; es manté LGPL quan així ho declara l’origen. |
| Diccionaris i dades de Softcatalà | `references/softcatala-*`, `references/softcatala-audit/`, recursos catalans a `build/extension/build/resources/` i `engine-src/resources/`, i `analysis/reference-oracle/artifacts/catalan-pos-dict-3.3/` | Es preserva la llicència dual d’origen. Per als recursos derivats on s’ha seleccionat aquesta opció, es manté LGPL-2.1. |
| Models Apache OpenNLP | Recursos anglesos derivats i `analysis/reference-oracle/artifacts/opennlp-*-models-1.5.jar` | Apache-2.0 i els avisos NOTICE. |
| Morfologik | `analysis/reference-oracle/src/Speller.java`, `analysis/reference-oracle/src/HMatrix.java` i l’adaptació indicada als avisos | BSD-3-Clause i atribucions; el codi adaptat pot distribuir-se sota GPL quan ho permeten els termes BSD, preservant-ne els avisos. |
| Dades Moby/WordNet | Recursos POS anglesos i `licenses/languagetool-runtime/english-pos-readme.txt` | Es mantenen els avisos i condicions propis de les dades, independentment de la LGPL del codi LanguageTool. |

Els manifests de recursos (`manifest.json`, `*.manifest.json`) i `references/upstream.lock.json` fixen procedència, versions i hashes quan hi són disponibles. Si un manifest específic és més restrictiu o identifica una llicència diferent, prevalen aquell manifest i els avisos de l’origen per al recurs corresponent.

Els inventaris `analysis/reference-oracle/outputs/ca-*` deriven de regles/dades de LanguageTool; els resultats `*-oracle-*.json` són sortides de l’oracle LanguageTool. No s’identifiquen com a codi GPL de Lletrium. Les comparacions, resultats de rendiment i corpus són materials de prova, no codi: aquesta llicència de programari no concedeix automàticament drets per reutilitzar-ne el text. Els benchmarks independents i els seus resultats no formen part del ZIP públic de fonts 1.0.0 perquè no són necessaris per compilar ni executar l’extensió.

## Altres continguts

La GPL d’aquest paquet cobreix programari, no concedeix drets sobre la marca Lletrium i no converteix automàticament informes, corpus de prova, pàgines web, captures ni documentació en programari GPL. Aquests materials només es poden reutilitzar segons els avisos que els acompanyin i els drets que en corresponguin.

La carpeta local `analysis/extension-9.6.93/` i altres materials no enumerats no formen part d’aquest ZIP. Aquesta delimitació no és una declaració de llicència per a una còpia diferent o més àmplia del workspace.

La concessió GPL d’aquest paquet la fa Artur Guasch per al codi original del projecte i per a les adaptacions locals identificades que s’ofereixen sota aquesta opció. Les llicències dels components de tercers només es poden usar segons els seus termes; aquesta declaració no concedeix drets sobre cap marca ni substitueix assessorament legal.
