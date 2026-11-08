# Fase 6 — coteig inicial del francès

Data: 5 de novembre de 2026. Estat: **tancada tècnicament per al candidat experimental**.

## Mètode i abast

- Oracle local: LanguageTool `6.9-SNAPSHOT`, les mateixes fonts i diccionaris locals, regles per defecte i servei de regles remotes desactivat.
- Corpus controlat: 32 frases curtes/mitjanes. A les 28 inicials s’hi han afegit casos de repetició d’expressions, incloent-hi llindars d’una i dues coincidències anteriors.
- Perfils comparats separadament: `fr-FR`, `fr-CA`, `fr-CH`, `fr-BE`; el mateix pipeline francès candidat s’invoca amb cada perfil.
- L’informe reproduïble de deteccions, offsets, missatges, suggeriments, temps i errors és `phase-6-batch-comparison.json`; l’ordre i el conjunt de frases són al comparador `compare-java-js-rule-batch.mjs`.

## Correccions fetes amb evidència del coteig

1. **No activar regles fora del comportament per defecte de LanguageTool.** El generador exclou les regles `picky` i les que tenen `default=off/temp_off`; les 71 regles amb `min_prev_matches` ja s’inclouen després de portar el transformador de coincidències prèvies al runtime compartit. El bundle passa de 5.319 a **5.390 regles**; 1.276 regles `picky` i una regla que depèn del servei remot d’IA continuen fora del perfil estàndard. Les exclusions i motius complets són al JSON de cobertura.
2. **Excepcions XML conserven la seva sensibilitat pròpia.** El compilador feia heretar a una excepció la sensibilitat inferida del patró pare. Això provocava que `les` no exclogués `Les` quan el patró contenia `\\p{Lu}`. Ara cada excepció es compila amb les seves pròpies opcions de majúscules. En `Les Etats Unis sont loin.`, el candidat ara marca `Etats`, proposa `États` i ja no mostra una llista absurda de noms propis.
3. **Missatge ortogràfic francès.** La revisió local d’ortografia adopta l’ID i missatge de LanguageTool `FR_SPELLING_RULE` / `Faute de frappe possible trouvée.`. El cas `Etats` ara coincideix amb l’oracle en span, missatge i suggeriments.
4. **Menys feina repetida per revisió.** `LtPatternRuntime` guarda en caches febles les branques del primer token i els `chunks` requerits per regla. A més, si l’índex de tokens demostra que una regla no pot començar enlloc del text, el runtime ara la salta abans de preparar chunks i antipatrons. El filtre és conservador: quan no pot decidir retorna `null` i es conserva l’execució antiga. És una optimització general del matcher, no una excepció francesa.
5. **Regles de repetició de text (`min_prev_matches`).** LanguageTool les executa com a transformador de nivell de text: agrupa per ID, filtra solapaments del mateix grup, compta coincidències anteriors i aplica `distance_tokens` (per defecte, 60 × el llindar). El runtime ara aplica aquesta semàntica als grups, prefixos i offsets de Lletrium; el filtre usa cerca binària sobre els inicis de token, en lloc de tornar a recórrer totes les files per cada coincidència. El lot dirigit afegeix tres avisos coincidents amb LanguageTool i no introdueix errors runtime.
6. **Prioritat entre avisos solapats.** El pipeline francès només suprimia solapaments entre subregles del mateix grup; LanguageTool aplica després `CleanOverlappingFilter` a tots els avisos. Ara el candidat aplica el mateix criteri de prioritat, longitud i ordre per als conflictes, amb les prioritats franceses verificades a `French.java`. Això elimina avisos redundants sense descartar deteccions no solapades; el cas `TRAIT_UNION_INVERSION_8` sobre el nom «rendez-vous» queda resolt a favor de `TRAIT_UNION`.

## Resultat mesurat

| Perfil | Casos | LT | Lletrium | Diferències informades | Errors runtime | Mediana per frase (LT → Lletrium) |
|---|---:|---:|---:|---:|---:|---:|
| fr-FR | 32 | 26 | 26 | 15 | 0 | 27,48 → 168,84 ms |
| fr-CA | 32 | 26 | 26 | 15 | 0 | 32,74 → 139,55 ms |
| fr-CH | 32 | 26 | 26 | 15 | 0 | 35,73 → 137,52 ms |
| fr-BE | 32 | 26 | 26 | 15 | 0 | 31,11 → 133,16 ms |

Per perfil, les **15 diferències informades són àlies d’identificador, no discrepàncies de correcció**: 14 pertanyen al mateix grup XML de LanguageTool i tenen el mateix tram, missatge, categoria i suggeriments; l’altra és l’adaptador de compostos i té el mateix contingut de correcció. Després de resoldre els solapaments, el candidat i l’oracle retornen **26 avisos cadascun** en tots quatre perfils. No queda cap avís candidat extra ni cap avís de l’oracle sense parella al corpus. Això és paritat en aquest corpus concret, no cobertura de totes les regles ni garantia de paritat general.

La passada ràpida del runtime ha baixat la mediana del comparador Java/JS entre un **27% i un 36%** segons el perfil, sense canviar avisos ni suggeriments. Aquestes xifres continuen sent comparació de processos diferents, no temps de producte.

## Mesura al navegador i decisió

- `benchmark-worker.mjs` executa les fonts exactes del ZIP i el `.pack` francès dins d’un DedicatedWorker de Chrome aïllat. Són 5 textos representatius, 5 repeticions calentes per text, càrrega de recursos local i cap accés a dades d’usuari. És un worker de navegador reproduïble, no una extensió MV3 instal·lada ni una mesura a l’ordinador de l’usuari.
- Mesura final després de l’optimització: preload **738,7 ms**; primera revisió 874 ms i següents 333–497 ms; 25 revisions calentes, mediana **349,1 ms**, p95 **410,9 ms**, total 8.926 ms. El recompte d’avisos per text es manté entre 0 i 4.
- Decisió per al candidat experimental: acceptable per continuar a fase 7 sota un límit provisional de **450 ms p95** en aquest corpus curt i preload inferior a 1 s. La latència no es declara equivalent a LanguageTool Java; el francès encara no s’activa ni es publica. La validació MV3/UI queda fora d’aquest coteig i no altera els resultats lingüístics de la fase.
- La paritat es limita als 32 casos i famílies exercitades; no s’extrapola als 5.390 patrons. Les 15 diferències per perfil són àlies d’identificador amb mateix rang, missatge, categoria i suggeriments; errors runtime 0 i cap avís sense parella.

## Criteri de tancament

Fase tancada per al candidat local experimental: coteig reproduïble als quatre perfils, solapaments resolts segons LanguageTool, errors runtime zero i mesura en worker de navegador sota el límit provisional. No implica cobertura de totes les regles, validació visual amb l’extensió instal·lada ni autorització de distribució.

## Artefacte de prova sincronitzat

Després de l’optimització s’ha regenerat `build/releases/proves reducció.zip`. `prepare-proof-release.mjs` ha passat les comprovacions de protocol, IndexedDB a Chrome i coincidència de les **158 entrades** amb les fonts. Mida: **10.962.314 bytes**; SHA-256: `3d8ef7fa8749a5d90faaf0bb6e5e5025caeea2944d7377e6cbbd0cbd4a5818`. No conté cap `.pack` francès; el paquet és experimental i no autoritza publicar les dades franceses.

El pla queda al **100% administratiu** després del tancament de la fase 7 per decisió del projecte. Aquest percentatge reflecteix el tancament amb els recursos conservats i l’autoria pendent; no equival a una verificació completa dels drets de redistribució. Vegeu `phase-7-license-release.md` i `distribution-scope.md` abans de publicar o distribuir el francès.
