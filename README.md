# Lletrium! Corrector ortogràfic i gramatical

**Extensió gratuïta i de codi obert per corregir text en temps real, amb una atenció especial al català.** Aquesta còpia del codi font correspon al runtime 1.0.1.

Vaig començar Lletrium! perquè no trobava una extensió gratuïta que corregís el català mentre escrius en editors web. El projecte vol continuar sent gratuït i obert, útil per a estudiants i per a qualsevol persona que vulgui escriure amb més confiança.

## Instal·lació

### Automàtica (recomanada)

Instal·la **Lletrium!** des de la [Chrome Web Store](https://chromewebstore.google.com/detail/lletrium-corrector-ortogr/ecfanealnoplhjapaimncnhmogpijhkm?authuser=1&hl=es).

### Manual (des d’aquest codi font)

Descomprimeix aquest ZIP. A Chrome, activa el mode de desenvolupador a `chrome://extensions` i carrega `build/extension` com a extensió desempaquetada. El motor, el codi runtime i les eines font són aquí mateix. Els paquets de dades `.pack` es publiquen a part a la branca `language-packs` i s’afegeixen des de la interfície de gestió d’idiomes; no són dins d’aquest ZIP.

Per reconstruir els recursos compilats, cal Node.js 20 o posterior i executar `node engine-src/build.mjs` des de l’arrel descomprimida. La build distribuïda a `build/extension` es pot carregar directament.

## Idiomes

El runtime 1.0.1 inclou suport per a català central, valencià i balear, espanyol, anglès americà i francès. Els paquets de dades s’obtenen per separat i després funcionen sense connexió. Les variants disponibles depenen dels paquets instal·lats i dels perfils compatibles amb la versió de l’extensió.

La revisió s’executa localment al navegador. La compatibilitat varia segons l’editor; hi ha adaptacions per a Google Docs, Google Slides i altres camps web compatibles.

## Llicències i agraïments

El codi original de Lletrium! identificat com a tal es distribueix sota **GPL-3.0-or-later**. Els components, les regles, les dades i els diccionaris de tercers mantenen les seves llicències i avisos propis. Consulta [`LICENSING.md`](LICENSING.md), [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) i `build/extension/licenses/` abans de reutilitzar o redistribuir materials.

Estic molt agraït a LanguageTool, Softcatalà i a les altres persones i projectes de programari lliure que han contribuït els recursos que fan possible Lletrium!. Lletrium! no està afiliat ni avalat per aquests projectes.

**Avís específic del francès:** encara no hem pogut verificar tota la procedència ni identificar l’autoria d’alguns recursos. Estem oberts a rebre informació verificable i actualitzarem els crèdits quan la puguem confirmar. Si pots ajudar, contacta’ns a través de [GitHub Issues](https://github.com/arturguasch/Lletrium-Corrector-Ortografic-i-Gramatical/issues). Aquesta invitació no confirma els permisos de redistribució; consulta el mapa de llicències i l’estat de publicació.

## Privacitat

La revisió s’executa localment al navegador; consulta la [política de privacitat](https://arturguasch.github.io/Lletrium-Corrector-Ortografic-i-Gramatical/index.html#privacy).

## Contacte

Per informar d’un problema o proposar una millora, [obre una incidència a GitHub](https://github.com/arturguasch/Lletrium-Corrector-Ortografic-i-Gramatical/issues).

## Novetats de la versió 1.0.1

- **Paquets d’idioma a la carta:** el paquet principal s’ha optimitzat; cada usuari pot afegir des de la pàgina de gestió allotjada a GitHub només els idiomes que vol. Un cop afegits, funcionen sense connexió.
- **Variants dialectals:** es poden seleccionar les variants disponibles d’un idioma.
- **Millores a Google Docs:** s’han corregit errors relacionats amb els subratllats de Lletrium! i la impressió dels documents.
- **Francès:** s’incorpora com a nou idioma de correcció, amb variants regionals disponibles.
