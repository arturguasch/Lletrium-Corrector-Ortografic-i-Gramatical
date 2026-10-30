# Components i dades de tercers — versió 1.0.0

Aquest inventari correspon als fitxers inclosos a l'extensió. Les llicències completes i els avisos d'origen estan a les subcarpetes de `licenses/`. El paquet `Corrector-Catala-1.0.0-source.zip` acompanya la mateixa versió amb el codi runtime, els recursos exactes, els scripts de construcció/paquetització i les fonts upstream catalanes pertinents; s'ha d'oferir al mateix lloc de descàrrega que l'extensió.

Els camins `references/`, `engine-src/` i `analysis/` d'aquest inventari i dels avisos detallats corresponen a l'arrel del ZIP de fonts complementari. Els camins `licenses/` i `build/resources/` corresponen al ZIP instal·lable.

El ZIP de fonts no conté el snapshot multilingüe complet de LanguageTool. Inclou les fonts pertinents, els recursos exportats i els generadors necessaris per a les llengües que incorpora l'extensió.

## LanguageTool

- **Regles i recursos catalans:** `src/lt-pattern-runtime.js`, `src/lt-catalan-filters.js`, parts identificades de `src/language-engine.js` i `build/resources/ca-filter-data.json`, `ca-table-rules.json`, `ca-pattern-rule-candidates.json`, `ca-dialect-pattern-rules.json`, `ca-dialect-profile-overrides.json` i `ca-multitoken-candidates.json`. Són adaptacions o dades derivades de LanguageTool i de recursos catalans de Softcatalà. Aplica LGPL-2.1-or-later a les adaptacions cobertes; els avisos originals i la llicència són a `licenses/languagetool-runtime/`.
- **Procedència fixada:** `references/upstream.lock.json` del projecte identifica els arxius de referència incorporats i els seus SHA-256. Els ZIP font utilitzats no identifiquen un commit immutable; per això els hashes, i no una etiqueta de branca actual, fixen les còpies auditades.
- **Atribució:** Jaume Ortolà i Font, Daniel Naber, László Németh i contribuïdors de LanguageTool, segons el component. Consulteu `licenses/languagetool-runtime/NOTICE.md`.
- **Ports de codi de LanguageTool:** els mòduls locals de desambiguació i cerca ortogràfica multitoken són adaptacions de classes de LanguageTool; s'hi aplica l'avís LGPL indicat al repositori de referència i a `licenses/languagetool-runtime/`.
- **Coherència valenciana:** `CA_WORD_COHERENCY_VALENCIA` segueix el comportament de `WordCoherencyValencianRule` i `AbstractWordCoherencyRule` de LanguageTool. Les parelles lèxiques provenen de `coherency-valencia.txt`; l'implementació i les dades s'identifiquen com a derivades a `licenses/languagetool-runtime/NOTICE.md`.
- **Perfil castellà `es-ES`:** `build/resources/es-ES/es-ES-pos-fsa.bin.gz` i `es-ES-synthesis-fsa.bin.gz` deriven de `org.softcatala:spanish-pos-dict:2.5` (LGPL-2.1); `es-disambiguation-rules.json` deriva de les regles castellanes de LanguageTool 6.9-SNAPSHOT (LGPL-2.1); el mapa POS anglès local que requereix `IsEnglishWordFilter` deriva de `org.languagetool:english-pos-dict:0.6` (LGPL-2.1). Es conserva `build/resources/es-ES/LICENSE-LGPL-2.1.txt`; el paquet de fonts ha d'oferir els scripts, dades exactes, avisos i fonts necessaris per reconstruir aquestes derivacions.
- **Perfil anglès americà `en-US`:** les regles adaptades i les dades de `build/resources/en-US/` provenen del mòdul anglès de LanguageTool 6.9-SNAPSHOT i de `org.languagetool:english-pos-dict:0.6`. El POM del mòdul anglès declara LGPL-2.1 per al codi i avisa que alguns recursos tenen llicències pròpies. Les fonts del mòdul, el POM i l'artefacte/dades originals del diccionari es lliuren al ZIP de fonts sota `references/languagetool-en-US/` i `analysis/reference-oracle/artifacts/english-pos-dict-0.6/`. Preserveu els avisos del recurs de POS a `licenses/languagetool-runtime/english-pos-readme.txt` (Moby/WordNet) i els metadades `.info`; no s'ha d'interpretar la declaració LGPL del POM com si substituís les condicions de les fonts de dades.

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

Les còpies antigues del producte van contenir `catalan.aff` i `catalan.dic` proporcionats per l'usuari. **Aquests dos fitxers no formen part de la versió 1.0.0 ni del seu ZIP d'extensió.** La llista de formes activa de la versió 1.0.0 es va reconstruir a partir del diccionari etiquetat de LanguageTool/Softcatalà, que té els avisos de llicència indicats més amunt. Es conserva `catalan-hunspell-provenance.txt` com a registre històric d'aquella procedència; no és una declaració que els fitxers Hunspell siguin dins d'aquest llançament.

## Avisos històrics no actius

`licenses/hunspell-en-us.txt` es conserva per no esborrar historial de llicències. La versió 1.0.0 no empaqueta un diccionari Hunspell anglès ni el carrega al motor català.

## Procedència dels components originals del producte

El desenvolupador declara que la resta del codi del producte és treball original creat durant aquest projecte amb assistència de ChatGPT. Entre OpenAI i l'usuari, els termes d'OpenAI assignen a l'usuari els drets sobre les sortides, en la mesura que ho permeti la llei aplicable; això no cobreix ni canvia els drets sobre codi, dades o altres materials de tercers que s'hagin proporcionat com a entrada o s'hagin incorporat al producte. Aquest llançament no imposa una llicència global al codi original. Les parts identificades de LanguageTool, Softcatalà/catalan-dict-tools i Morfologik mantenen els avisos i termes propis indicats en aquest inventari.

