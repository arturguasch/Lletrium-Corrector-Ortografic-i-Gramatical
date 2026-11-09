# Motor lingüístic local

`engine-src/` conté els mòduls i generadors del motor compartit de correcció. El processament lingüístic s'executa localment al navegador. Les fonts de comparació de LanguageTool i Softcatalà es conserven a `references/`.

## Perfils

- Català central (`ca-ES`), valencià (`ca-ES-valencia`) i balear (`ca-ES-balear`), amb recursos compartits i ajustos de perfil.
- Castellà (`es-ES`) i anglès americà (`en-US`) amb pipelines locals.
- El perfil francès té adaptadors font a `engine-src/modules/french/` i recursos a `engine-src/resources/fr/`. `engine-src/build.mjs` els copia al runtime de `build/extension/`; el perfil continua separat del pipeline compartit i aquesta còpia no implica que les dades tinguin drets resolts. La font upstream seleccionada és a `references/languagetool-fr/`. La procedència i els termes de redistribució dels recursos francesos continuen pendents segons `build/extension/licenses/french-data/RESOURCE-MAP.md`.

## API del motor

- `preload()` prepara els recursos locals del perfil.
- `tokenize()`, `segmentSentences()` i `tagText()` exposen les etapes lèxiques i morfològiques.
- `checkText()` i `checkBatch()` retornen incidències amb offsets UTF-16, missatges i suggeriments.
- `getDiagnostics()` i `getPerformanceDiagnostics()` exposen l'estat i les mètriques del motor.

## Construcció

Requereix Node.js 20 o posterior. Des de l'arrel del projecte:

```powershell
node engine-src/build.mjs
```

El procés genera `build/language-engine.js`, `build/engine-build.json` i els recursos dels pipelines que gestiona; també actualitza les còpies runtime de Català, Castellà, Anglès i els mòduls/recursos francesos dins `build/extension/`. Els fitxers font francesos es mantenen a `engine-src/modules/french/` i `engine-src/resources/fr/`; el generador no declara el francès com a perfil general ni altera la seva situació legal pendent. El build principal és reconstruïble des del ZIP sense `analysis/`: les entrades generades mínimes que encara necessita són a `engine-src/build-inputs/`, i les fonts upstream són a `references/`. Les eines auxiliars de comparació amb oracles de desenvolupament no formen part del build principal.

## Llicències

El codi original, les adaptacions i les dades de tercers poden tenir termes diferents. El ZIP font GPL delimita aquest abast a `LICENSING.md` i `THIRD_PARTY_NOTICES.md`, i conserva els avisos upstream aplicables.
