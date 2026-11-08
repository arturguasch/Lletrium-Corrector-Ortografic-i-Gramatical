# Components i dades de tercers - runtime 1.0.1 (extensio instal·lable)

Aquest inventari descriu els components de tercers inclosos en el paquet Lletrium! 1.0.1. Les llicències completes i els avisos de procedència són a licenses/. Els paquets binaris .pack es publiquen separadament a la branca language-packs i queden fora del ZIP instal·lable.

Els camins build/resources/ i licenses/ indicats en aquest inventari són relatius al directori principal dins del ZIP. Les referències a engine-src/, references/ i analysis/ apunten al ZIP font GPL, no a fitxers inclosos en aquest paquet instal·lable.

La documentacio de fonts, eines de reconstruccio i copies upstream pertinents s'inclou al ZIP font GPL, no en aquest paquet instal·lable.

## LanguageTool

- **Regles i recursos catalans:** `src/lt-pattern-runtime.js`, `src/lt-catalan-filters.js`, parts identificades de `src/language-engine.js` i `build/resources/ca-filter-data.json`, `ca-table-rules.json`, `ca-pattern-rule-candidates.json`, `ca-dialect-pattern-rules.json`, `ca-dialect-profile-overrides.json` i `ca-multitoken-candidates.json`. Són adaptacions o dades derivades de LanguageTool i de recursos catalans de Softcatalà. Aplica LGPL-2.1-or-later a les adaptacions cobertes; els avisos originals i la llicència són a `licenses/languagetool-runtime/`.
- **Procedència fixada:** `references/upstream.lock.json` del projecte identifica els arxius de referència incorporats i els seus SHA-256. Els ZIP font utilitzats no identifiquen un commit immutable; per això els hashes, i no una etiqueta de branca actual, fixen les còpies auditades.
- **Atribució:** Jaume Ortolà i Font, Daniel Naber, László Németh i contribuïdors de LanguageTool, segons el component. Consulteu `licenses/languagetool-runtime/NOTICE.md`.
- **Ports de codi de LanguageTool:** els mòduls locals de desambiguació i cerca ortogràfica multitoken són adaptacions de classes de LanguageTool; s'hi aplica l'avís LGPL indicat al repositori de referència i a `licenses/languagetool-runtime/`.
- **Coherència valenciana:** `CA_WORD_COHERENCY_VALENCIA` segueix el comportament de `WordCoherencyValencianRule` i `AbstractWordCoherencyRule` de LanguageTool. Les parelles lèxiques provenen de `coherency-valencia.txt`; l'implementació i les dades s'identifiquen com a derivades a `licenses/languagetool-runtime/NOTICE.md`.
- **Perfil castellà `es-ES`:** `build/resources/es-ES/es-ES-pos-fsa.bin.gz` i `es-ES-synthesis-fsa.bin.gz` deriven de `org.softcatala:spanish-pos-dict:2.5` (LGPL-2.1); `es-disambiguation-rules.json` deriva de les regles castellanes de LanguageTool 6.9-SNAPSHOT (LGPL-2.1); el mapa POS anglès local que requereix `IsEnglishWordFilter` deriva de `org.languagetool:english-pos-dict:0.6` (LGPL-2.1). Es conserva `build/resources/es-ES/LICENSE-LGPL-2.1.txt`; el paquet de fonts ha d'oferir els scripts, dades exactes, avisos i fonts necessaris per reconstruir aquestes derivacions.
- **Perfil anglès americà `en-US`:** les regles adaptades i les dades de `build/resources/en-US/` provenen del mòdul anglès de LanguageTool 6.9-SNAPSHOT i de `org.languagetool:english-pos-dict:0.6`. El POM del mòdul anglès declara LGPL-2.1 per al codi i avisa que alguns recursos tenen llicències pròpies. Les fonts del mòdul, el POM i l'artefacte/dades originals del diccionari es lliuren al ZIP de fonts sota `references/languagetool-en-US/` i `analysis/reference-oracle/artifacts/english-pos-dict-0.6/`. Preserveu els avisos del recurs de POS a `licenses/languagetool-runtime/english-pos-readme.txt` (Moby/WordNet) i els metadades `.info`; no s'ha d'interpretar la declaració LGPL del POM com si substituís les condicions de les fonts de dades.

### Suport francès (runtime 1.0.1; dades distribuïdes a part)

El runtime 1.0.1 inclou adaptacions de regles franceses i recursos locals de suport. El paquet lèxic .pack es distribueix separadament a la branca language-packs; no s’inclou en aquest ZIP font. Els avisos i l’estat de cada font són a licenses/french-data/RESOURCE-MAP.md.

- Els binaris `build/resources/fr/french.dict.gz`, `french_synth.dict.gz` i `french_tags.txt` deriven de `org.languagetool:french-pos-dict:0.7`. El POM inclòs a l’artefacte declara CC BY-SA 4.0 i indica que les dades es basen originalment en Morphy. Cal conservar aquesta atribució i la llicència CC BY-SA en qualsevol redistribució d’aquestes dades.
- Les llistes `spelling.txt`, `spelling_custom.txt`, `ignore.txt` i `prohibit.txt` provenen del lèxic francès Hunspell de Dicollecte, versió 6.4.1, amb avís MPL 2.0 i atribucions dels contribuïdors reproduïdes a `licenses/french-data/README_fr.txt`.
- El segmentador experimental de frases franceses i les 83 regles SRX de `build/resources/fr/fr-srx.json` deriven del recurs `segment.srx` de LanguageTool Core (LGPL-2.1-or-later per al component adaptat). El SHA-256 font i els detalls de l’adaptador consten a `licenses/languagetool-runtime/NOTICE.md`. Són patrons interpretats localment i s’exclouen dels paquets remots d’idioma.
- Les 30 formes de `build/resources/fr/fr-simple-replace.json` deriven de `replace.txt` i `replace_custom.txt` de LanguageTool; l’adaptador `src/french-simple-replace-rule.js` segueix `SimpleReplaceRule` (Copyright 2020 Jaume Ortolà) i `AbstractSimpleReplaceRule` / `SimpleReplaceDataLoader` sota LGPL-2.1-or-later. Els hashes i els detalls de l’adaptació consten a `licenses/languagetool-runtime/NOTICE.md`.
- `src/french-core-punctuation-rule.js` adapta de manera limitada `DoublePunctuationRule` de LanguageTool Core (Copyright 2005 Daniel Naber; LGPL-2.1-or-later): tracta `..` i `,,`, amb les exclusions documentades a `licenses/languagetool-runtime/NOTICE.md`. Les proves dirigides són a `analysis/french-adaptation/smoke-core-punctuation.mjs`; no és una afirmació de paritat completa.
- `src/french-comma-whitespace-rule.js` adapta un subconjunt de `CommaWhitespaceRule` de LanguageTool Core (Copyright 2005 Daniel Naber; LGPL-2.1-or-later), instanciat en francès amb comprovació d’espais a les cometes desactivada. Inclou parèntesis i comes; omet deliberadament el punt final perquè la branca original depèn de POS i detecció de dominis/extensions. Detalls i fixtures: `licenses/languagetool-runtime/NOTICE.md` i `analysis/french-adaptation/smoke-comma-whitespace.mjs`.
- `src/french-uppercase-sentence-rule.js` adapta de manera prudent `UppercaseSentenceStartRule` de LanguageTool Core (LGPL-2.1-or-later). Empra la segmentació SRX i el tokenizer locals; no replica el context POS/immunization de Java ni declara paritat completa. Detalls i casos dirigits: `licenses/languagetool-runtime/NOTICE.md` i `analysis/french-adaptation/smoke-candidate.mjs`.
- `src/french-whitespace-rule.js` adapta de manera conservadora `SentenceWhitespaceRule` de LanguageTool Core (Copyright 2014 Daniel Naber; LGPL-2.1-or-later) per a una manca d’espai entre una puntuació final i una paraula següent en majúscula. Les limitacions i els casos de prova són a `licenses/languagetool-runtime/NOTICE.md` i `analysis/french-adaptation/smoke-whitespace-rule.mjs`.
- src/french-repeated-words-rule.js adapta FrenchRepeatedWordsRule i AbstractRepeatedWordsRule de LanguageTool (Copyright 2021 Daniel Naber; LGPL-2.1-or-later). El runtime del ZIP inclou build/resources/fr/synonyms.txt, però no consta la llicència específica del recurs. La inclusió documenta la situació actual del candidat i no constitueix una autorització de redistribució.
- src/french-compounds-rule.js adapta CompoundRule i AbstractCompoundRule de LanguageTool (Copyright 2006 Daniel Naber; LGPL-2.1-or-later). build/resources/fr/fr-compounds.json conté 1.372 entrades derivades de compounds.txt, amb font/hash indicats a licenses/french-data/RESOURCE-MAP.md; els termes específics del recurs continuen pendents. La seva inclusió en el candidat no confirma drets de redistribució.
- `src/french-unpaired-brackets-rule.js` adapta la configuració francesa de `GenericUnpairedBracketsRule` de LanguageTool Core (Copyright 2009 Daniel Naber; LGPL-2.1-or-later), limitada als parells `[]`, `()` i `{}`. La implementació és experimental i no afirma paritat completa amb la pila/tokenització Java.
- `src/french-long-sentence-rule.js` adapta `LongSentenceRule` de LanguageTool Core (Copyright 2014 Daniel Naber; LGPL-2.1-or-later) al llindar francès de 40 paraules. És experimental i no afirma equivalència completa amb la classificació Java de tokens ni amb totes les excepcions.
- `src/french-long-paragraph-rule.js` adapta `LongParagraphRule` de LanguageTool Core (Copyright 2020 Daniel Naber; LGPL-2.1-or-later) al llindar de 220 paraules, només quan els límits són línies en blanc explícites. No afirma paritat amb els límits de paràgraf específics dels editors.
- licenses/french-data/README_lexique.txt identifica el lèxic Dicollecte amb MPL 2.0. També s’hi inclou el POM original de french-pos-dict:0.7 com a evidència de llicència i procedència. Els fitxers de regles font grammar.xml, style.xml i disambiguation.xml inclouen avisos explícits LGPL-2.1-or-later; les seves còpies derivades conserven aquesta atribució. Altres dades franceses —en particular multiwords.txt, spelling_global.txt, compounds.txt, hyphenated_words.txt i synonyms.txt— tenen termes o procedència encara no resolts. L’avís genèric del POM no substitueix aquesta comprovació.
- El mapa per recurs, les transformacions i les limitacions per a una possible publicació són a `licenses/french-data/RESOURCE-MAP.md`. El text oficial de MPL 2.0 és a <https://mozilla.org/MPL/2.0/>.
- Les adaptacions de codi de regles/filtres franceses mantenen els avisos LGPL-2.1-or-later detallats a `licenses/languagetool-runtime/NOTICE.md`.

El paquet francès està representat a la branca externa language-packs per decisió del projecte. Això no resol els punts pendents del mapa de procedència: diversos recursos encara no tenen una llicència de redistribució confirmada. No tracteu el catàleg, el POM del mòdul ni una atribució pendent com a prova de permís. Aquest ZIP ho documenta de manera transparent, però no declara que les dades franceses estiguin legalment aclarides.

## Apache OpenNLP

Els models de tokenització, etiquetatge POS i chunking provenen dels artefactes `edu.washington.cs.knowitall:opennlp-{tokenize,postag,chunk}-models:1.5`, que LanguageTool identifica amb Apache License 2.0. El producte distribueix els models serialitzats derivats a `build/resources/en-US/`; el ZIP de fonts incorpora els JARs/POMs exactes i el manifest fixa els hashes. L'eina `org.apache.opennlp:opennlp-tools:1.9.5` s'utilitza per a l'oracle local, no s'empaqueta com a runtime Java. Les còpies Apache-2.0 i NOTICE de l'artefacte estan a `licenses/opennlp/Apache-2.0.txt` i `licenses/opennlp/NOTICE.txt`.

## Morfologik

`engine-src/modules/ca-morfologik-speller.js` és una adaptació local de l'algorisme `Speller`/`HMatrix` de Morfologik 2.2.0. El codi font de referència identifica l'avís BSD de tres clàusules de Dawid Weiss i Marcin Milkowski; el binari distribueix la implementació JavaScript adaptada. Aquesta distribució conserva el copyright, les condicions i la renúncia de garanties a `licenses/morfologik/COPYING.txt`.

## Diccionaris catalans de Softcatalà

- Els antics fitxers d'entrada de `src/dictionaries/v5/` i `src/dictionaries/catalan-source/` es conserven al projecte per a reconstrucció i auditoria, però s'han exclòs del ZIP instal·lable perquè el runtime actual no els carrega. Els recursos derivats que sí que s'empaqueten, com els binaris morfològics de `build/resources/central/`, provenen de diccionaris de LanguageTool/catalan-dict-tools. El projecte d'origen declara les dades sota llicència dual **LGPL-2.1-or-later o GPL-2.0-or-later**. Aquesta distribució selecciona l'opció LGPL-2.1-or-later per als recursos derivats quan l'avís d'origen ho permet.
- `build/resources/central/ca-central.bin.gz` i `build/resources/synthesis/ca-synthesis.bin.gz` són recursos derivats de `org.softcatala:catalan-pos-dict:3.3`, la dependència exacta del snapshot de LanguageTool usat aquí. El seu POM declara GPL-2.0 i LGPL-2.1 com a alternatives; aquesta distribució selecciona LGPL-2.1 per a les dades del diccionari. Els manifests dels dos recursos registren ara aquesta elecció i els hashes d'origen.
- Els recursos `build/resources/ca-spelling-words.txt.gz` i `ca-spelling-multitoken-words.txt.gz` també es deriven dels FSA `ca-ES_spelling.dict` i `ca-ES_spelling_multitoken.dict` de `catalan-pos-dict:3.3`; els manifests de construcció identifiquen l'artefacte i seleccionen LGPL-2.1 per a aquestes dades.
- Els avisos de Softcatalà, les còpies de les dues llicències i la documentació d'origen són a `licenses/softcatala/` i `licenses/catalan-dict-tools/`.
- La morfologia central `build/resources/central/ca-central.bin.gz` s'ha generat des de les fonts i els recursos enumerats a `build/resources/central/manifest.json`; les freqüències del corrector provenen de `catalan-pos-dict` 3.3, amb llicència dual GPL-2.0/LGPL-2.1. Vegeu també `licenses/languagetool-runtime/NOTICE.md`.

## Soros

La implementació local de Soros i les regles numèriques adaptades s'atribueixen a László Németh. L'origen permet LGPL/BSD dual; aquesta adaptació escull l'opció LGPL i conserva l'avís a `src/language-engine.js` i `licenses/languagetool-runtime/NOTICE.md`.

## Fitxers de diccionari Hunspell de versions anteriors

Les còpies antigues del producte van contenir `catalan.aff` i `catalan.dic` proporcionats per l'usuari. **Aquests dos fitxers no formen part del runtime 1.0.1 ni del seu ZIP d'extensió.** La llista de formes activa del runtime es va reconstruir a partir del diccionari etiquetat de LanguageTool/Softcatalà, que té els avisos de llicència indicats més amunt. Es conserva `catalan-hunspell-provenance.txt` com a registre històric d'aquella procedència; no és una declaració que els fitxers Hunspell siguin dins d'aquest llançament.

## Avisos històrics no actius

`licenses/hunspell-en-us.txt` es conserva per no esborrar historial de llicències. El runtime actual no empaqueta un diccionari Hunspell anglès ni el carrega al motor català.

## Procedència dels components originals del producte

El desenvolupador declara que la resta del codi del producte és treball original creat durant aquest projecte amb assistència de ChatGPT. Entre OpenAI i l'usuari, els termes d'OpenAI assignen a l'usuari els drets sobre les sortides, en la mesura que ho permeti la llei aplicable; això no cobreix ni canvia els drets sobre codi, dades o altres materials de tercers que s'hagin proporcionat com a entrada o s'hagin incorporat al producte. Aquest llançament no imposa una llicència global al codi original. Les parts identificades de LanguageTool, Softcatalà/catalan-dict-tools i Morfologik mantenen els avisos i termes propis indicats en aquest inventari.

## Recursos CFSA2 del candidat de reducció

El paquet candidat de reducció inclou `build/resources/central-cfsa2/ca-analysis.cfsa2.gz` i `ca-synthesis.cfsa2.gz`, còpies GZIP dels diccionaris CFSA2 originals `ca-ES.dict` i `ca-ES_synth.dict` distribuïts a `org.softcatala:catalan-pos-dict:3.3` (LanguageTool). Aquest artefacte declara l'opció LGPL-2.1-or-later de la llicència dual GPL-2.0-or-later/LGPL-2.1-or-later, d'acord amb l'origen i els avisos de `licenses/softcatala/`.

`ca-synthesis-overlays.json.gz` conserva, en ordre, les operacions de `added.txt`, `removed.txt` i `do-not-synthesize.txt` de LanguageTool 6.9-SNAPSHOT. Són dades derivades dels recursos catalans de LanguageTool i se'ls aplica l'opció LGPL-2.1-or-later indicada pels avisos locals de `licenses/languagetool-runtime/`.

`src/language-engine.js` del candidat incorpora una implementació local JavaScript del lector del format binari Morfologik CFSA2 i de la descodificació SUFFIX. No inclou ni executa codi Java ni un JAR de Morfologik. Es conserva `licenses/morfologik/COPYING.txt` amb l'avís BSD de tres clàusules de l'origen tècnic emprat per documentar el format i el comportament.


## Paquets de dades externs

Els paquets `.pack` de català, espanyol, anglès i francès es publiquen a `language-packs`; cap fitxer `.pack` està inclòs en aquest ZIP. Cada paquet ha de conservar els seus avisos de llicència. El mapa francès `licenses/french-data/RESOURCE-MAP.md` identifica fonts de dades amb llicències o lineage pendents; la seva presència en una branca pública no acredita els drets de redistribució. Consulteu també `licenses/french-data/RELEASE-STATUS.md`.




### French resource provenance and attribution

Some French resource sources or authorship details have not yet been identified or verified. We welcome verifiable corrections and will add accurate provenance and credits when confirmed. Please contact us through [GitHub Issues](https://github.com/arturguasch/Lletrium-Corrector-Ortografic-i-Gramatical/issues). This invitation does not itself confirm redistribution rights; see the French resource map and release status.
