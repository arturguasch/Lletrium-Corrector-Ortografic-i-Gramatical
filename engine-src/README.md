# Motor lingüístic local

`engine-src/` conté els mòduls i generadors del motor de correcció. El processament lingüístic s'executa localment al navegador. Les fonts de comparació de LanguageTool i Softcatalà es conserven a `references/` i `analysis/reference-oracle/`.

## Perfils

- Català central (`ca-ES`), valencià (`ca-ES-valencia`) i balear (`ca-ES-balear`), amb recursos compartits i ajustos de perfil.
- Castellà (`es-ES`) i anglès americà (`en-US`) amb pipelines locals.

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

El procés genera `build/language-engine.js`, `build/engine-build.json` i els recursos locals; també actualitza les còpies compilades dins `build/extension/`.

## Llicències

El codi original, les adaptacions i les dades de tercers poden tenir termes diferents. El ZIP font GPL delimita aquest abast a `LICENSING.md` i `THIRD_PARTY_NOTICES.md`, i conserva els avisos upstream aplicables.