# Fase 0 — Abast real del candidat i decisió de distribució

Data de revisió: 5 de novembre de 2026  
Snapshot LanguageTool: 6.9-SNAPSHOT, SHA-256 del snapshot `59ba721dab736ae1681e00023ce61f2f228295cf337e67a0101e68ea56ada9e3`  
Àmbit revisat: només els recursos francesos presents o carregats pel candidat de `build/releases/proves reducció`. L’inventari complet de fonts continua a `inventory.json`; aquest document delimita què arriba al runtime i quina evidència permetria redistribuir-ho.

## Decisió de fase

**Fase 0 tancada per a l’abast i la traçabilitat; cap pack francès queda autoritzat per publicar encara.** Els recursos sense llicència/procedència prou clara s’exclouen explícitament de qualsevol pack públic fins a resoldre’ls. El ZIP és un candidat local de prova, no un artefacte publicable. Això tanca la decisió d’abast sense fingir que hi ha autorització per redistribuir cada fitxer.

El codi i les regles convertides es consideren separadament de les dades. El POM francès diu explícitament que la LGPL del mòdul cobreix el codi font i que els recursos poden tenir llicències diferents; per això no s’estén la LGPL a tots els XML o llistes només perquè siguin dins del mòdul.

## Mapa de recursos efectivament carregats

| Component del candidat | Font concreta / evidència fixada | Consumidor i ús | Llicència/procedència observada | Decisió per a distribució |
|---|---|---|---|---|
| Regles de gramàtica i estil convertides | `rules/fr/{grammar.xml,style.xml,remote-rule-filters.xml}`; hashes `5fa75d…be934`, `b9b26c…fc565`, `31d2ee…c96ee`; es generen a `src/dictionaries/french/french-pattern-rule-candidates.json` | `FrenchPatternPipeline` carrega el bundle de regles | Cada XML porta avís propi LGPL-2.1-or-later. El POM recorda correctament que altres recursos poden tenir llicències diferents | **Aptes condicionalment** amb els avisos LGPL i atribucions originals preservats i la conversió identificada com a modificació. |
| Desambiguació convertida | `resource/fr/disambiguation.xml`, SHA `d65c06…95013`; sortida `fr-disambiguation-rules.json` | Pipeline contextual, filtres de regles i classificació POS | El mateix XML porta avís propi LGPL-2.1-or-later | **Apta condicionalment** amb l’avís LGPL i la conversió identificada com a modificació. |
| Regles de substitució | `rules/fr/replace.txt`, SHA `0aa0f9…3e9c7`; sortida `fr-simple-replace.json` | `FrenchSimpleReplaceRule` | Descriptor de la sortida diu que la implementació Java és LGPL-2.1-or-later; això no prova per si sol la llicència del fitxer de dades `replace.txt` | **Bloquejades per al pack públic** fins a aclarir dades/font. |
| Diccionari morfològic, síntesi i tags | Artefacte `french-pos-dict:0.7`; JAR SHA complet registrat a `inventory.json`; POM incrustat declara CC BY-SA 4.0 i indica dades basades originalment en Morphy; fitxers `french.dict.gz`, `french.info`, `french_synth.dict.gz`, `french_synth.info`, `french_tags.txt` | `FrenchLexicalData` carrega CFSA2, metadades i tags | CC BY-SA 4.0 per al payload del JAR; autoria/distribució LanguageTool, origen declarat a Morphy. Cal preservar notices i fixar la forma final | **Aptes condicionalment** amb atribució CC BY-SA 4.0 i Morphy, transformacions identificades i hash del JAR. No publicar abans de fixar el notice final. |
| Fitxer `.sor` | `resource/fr/fr.sor`, SHA `cdfc3e…f2a048` | El runtime carrega aquestes dades Soros | El README oficial de Numbertext cobreix els programes Soros (excepte serbi) amb LGPL-3.0-or-later o Modified BSD i atribueix el francès belga/suís a Olivier Ronez. El payload local conté formes regionals concordants, però el snapshot de LanguageTool no conserva historial i no s’ha comparat byte a byte amb una revisió upstream. Vegeu `licenses/NOTICE-numbertext-fr-sor.md`. | **Bloquejat fins a documentar la lineage exacta del fitxer i incloure el notice.** |
| Llistes Hunspell | `spelling.txt`, `spelling_custom.txt`, `ignore.txt`, `prohibit.txt`; hashes al `french-lexical-runtime.js` i a `inventory.json` | `FrenchLexicalData` per ortografia, excepcions i paraules prohibides | README upstream identifica Dicollecte 6.4.1 i MPL 2.0; preserva autoria i README/avís | **Aptes condicionalment** amb avís MPL 2.0 i atribució Dicollecte al pack. Els quatre hashes coincideixen amb les fonts inventariades. |
| Paraules compostes | `resource/fr/compounds.txt`, SHA `f7095d…9ec27`; sortida `fr-compounds.json` | `FrenchCompoundsRule` | El fitxer és consumit; els termes específics no queden coberts per la nota del README del lèxic Hunspell | **Exclòs provisionalment del pack públic** fins a resoldre llicència/procedència. |
| Mots múltiples i guionets | `multiwords.txt` SHA `8ab8c0…a2e4` i `hyphenated_words.txt` SHA `3624d3…f3c3`; generen `multitoken_words.txt.gz` i dades del chunker | Tokenització, speller multitoken i filtres contextuals; el pipeline prova també `fr-hybrid-chunker.json` | Sense concessió pròpia prou explícita en l’evidència registrada; no es pressuposa que la MPL del diccionari Hunspell s’hi apliqui | **Exclosos provisionalment del pack públic** fins a resoldre termes. `fr-hybrid-chunker.json` és prova i incorpora també `spelling_global.txt`, no activat com a funció final. |
| Paraules comunes, confusions, tagset i altres llistes | `common_words.txt`, `confusion_sets.txt`, `tagset.txt`, `added*.txt`, `removed*.txt`; referències/hashes a `inventory.json` | Algunes poden alimentar regles o generació; no s’ha demostrat que totes arribin al runtime final del candidat | No s’hereta la llicència de Hunspell ni del codi del mòdul. El seu ús efectiu s’ha de confirmar contra els loaders de LanguageTool abans de seleccionar-les | **Fora de l’abast de distribució actual**; no empaquetar fins a demostrar consumidor i termes. |
| Sinònims | `rules/fr/synonyms.txt`, SHA `384bf8…fd4db`; hi ha una còpia a `build/resources/fr/synonyms.txt` | No apareix carregat pel `FrenchPatternPipeline` actual | Procedència coneguda; termes de redistribució pendents | **No és dependència activa del candidat actual; no incloure al pack.** |
| Segmentació SRX | `languagetool-core/.../segment.srx`, SHA `2166e2…6cbbe`; sortida `fr-srx.json` | Segmentador de frases del pipeline francès | El fitxer no conté avís propi; el POM adverteix que les llicències dels recursos poden diferir de la del codi | **Bloquejat per al pack públic** fins a confirmar els termes aplicables al Core SRX. Proof-only. |
| Morfologia anglesa usada per filtres francesos | `english-pos-dict:0.6`, JAR SHA `2a3e96…1634b`; CFSA2 `en-US-pos-cfsa2.bin.gz` i `en-manual-tags.json` amb hashes de quatre fitxers `added/removed*.txt` | Nou filtre francès `IsEnglishWordFilter` depèn del tagger anglès; `EnglishMorphology.load()` es crida durant la càrrega del pipeline | POM de `english-pos-dict` declara LGPL-2.1. Els overrides manuals provenen del mòdul anglès i necessiten la mateixa comprovació de recursos que qualsevol altra llista LanguageTool | **Dependència real, no prescindible sense canviar el comportament.** Bloquejada per al pack francès fins a validar notices dels overrides i decidir si es comparteix/depen del pack en-US ja instal·lat. |
| Codi de runtime/adaptadors | Adaptadors JS del candidat i codi del pipeline; fonts versionades al ZIP de prova | Lectura de dades i execució de regles | Codi de Lletrium i codi adaptat de LanguageTool: aplicar els avisos LGPL corresponents a les parts derivades; no barrejar-ho amb la llicència dels recursos | La distribució de codi es resol al paquet de fonts/avisos; no autoritza per si sola redistribuir cap dada de la taula anterior. |

Els hashes abreujats d’aquesta taula són identificadors llegibles; els SHA-256 complets, mides i rutes es conserven a `inventory.json`, als manifests del candidat i als scripts de generació. El snapshot LanguageTool es fixa pel hash complet indicat a dalt.

## Exclusió i porta de distribució

1. `build/releases/proves reducció` continua sent un entorn local experimental. No pujar els seus recursos francesos a `language-packs` ni presentar-los com a pack publicable.
2. No es crea encara `fr.pack` a `build/releases/idiomes github/branch-ready`.
3. Per habilitar una fila bloquejada cal registrar font primària de termes, llicència/versionat, hash, atribució/notices, transformacions i contingut final exacte. Si no es pot documentar, no s’inclou.
4. La dependència `english-pos-dict` és explícita i necessària en el candidat actual. Abans de distribuir, resoldre els overrides i la política de dependència sense duplicar innecessàriament el paquet anglès.
5. No es retalla ni es substitueix silenciosament cap recurs per obtenir conformitat: qualsevol exclusió que canviï la qualitat o el comportament s’ha de registrar i cotejar en la fase corresponent abans d’activar el perfil.

## Evidència que tanca fase 0

- Snapshot de LanguageTool fixat per SHA-256; les fonts i JARs són presents a `analysis/reference-oracle/` i els seus hashes consten a `inventory.json`.
- Quatre perfils Java identificats, comptatges d’oracle guardats a `runtime-profile-rule-counts.json`, tokenizer i fixtures amb hashes registrats.
- Recursos carregats pel pipeline i allowlist externa comparats amb el contingut real del ZIP de prova; les dependències angleses identificades.
- Llicències amb evidència explícita separades de les inferides o pendents; els recursos dubtosos queden bloquejats del pack públic, no etiquetats per defecte com LGPL/MPL.
- Destinacions fixades: ZIP de proves per experimentació; `branch-ready` només rep dades després de la porta de llicència. Cap ZIP estable modificat.

**Criteri de reobertura:** si es decideix distribuir un recurs bloquejat, o canvia el snapshot, el manifest del candidat o el conjunt de loaders, reobrir la fase 0 per a aquell recurs abans de generar/publicar el pack.
