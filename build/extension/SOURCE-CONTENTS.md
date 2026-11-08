# Contingut del paquet font — Lletrium! 1.0.1

Aquest ZIP conté el runtime 1.0.1 preparat per carregar, el motor i scripts font, els avisos de llicència i materials de referència necessaris per estudiar les adaptacions incloses. Carrega `build/extension` a `chrome://extensions` amb el mode de desenvolupador activat.

## Inclòs

- Extensió 1.0.1: `build/extension/` (manifest, interfície, adaptadors, regles, recursos runtime i avisos).
- Codi i eines de construcció: `engine-src/`.
- Referències de LanguageTool/Softcatalà, manifests de recursos i artefactes d’auditoria seleccionats: `references/` i `analysis/`.
- La pàgina de projecte i privacitat: `index.html`.
- GPL-3.0-or-later per al codi propi identificat i avisos complets de tercers disponibles al paquet.

## No inclòs

- Els paquets de llengua binaris `.pack`; es publiquen a la branca GitHub `language-packs` i es descarreguen des de l’extensió.
- El directori `dev-only` i el receptor local que permet proves amb el gestor HTML local. Aquest codi només forma part del ZIP de proves.
- Historials, captures o corpus que no siguin necessaris per compilar o executar el runtime, excepte els inventaris de procedència que s’indiquen als avisos.

La build del navegador s’inclou perquè es pugui carregar directament. La reconstrucció dels recursos requereix Node.js 20 o posterior: `node engine-src/build.mjs` des de l’arrel extreta.

## Estat de llicències del francès

Les adaptacions de regles de LanguageTool conserven els avisos LGPL que els corresponen. Tanmateix, `build/extension/licenses/french-data/RESOURCE-MAP.md` identifica fonts de dades amb drets/termes o lineage encara pendents. El paquet `.pack` és extern i no està inclòs aquí; la seva publicació a GitHub no és una certificació de clearance. Reviseu aquest mapa abans de redistribuir o actualitzar dades franceses.
