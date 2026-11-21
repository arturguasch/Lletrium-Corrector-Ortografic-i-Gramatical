# Lletrium! Corrector ortogràfic i gramatical

**Una extensió gratuïta i de codi obert per corregir text en temps real, amb una atenció especial al català.**

Vaig començar Lletrium perquè no trobava una extensió gratuïta que oferís aquest tipus de correcció del català mentre escrius dins dels editors web. Vull que el projecte continuï sent gratuït i obert, i que sigui útil tant per al català com per a altres llengües.

## Novetats de la versió 1.0.2

- S’hi afegeixen l’italià i l’alemany, amb els perfils regionals alemanys d’Alemanya, Àustria i Suïssa.
- La pàgina de gestió permet afegir paquets d’idioma per separat i seleccionar les variants dialectals disponibles.
- Els menús i missatges es poden mostrar en italià o alemany, a més dels idiomes d’interfície existents.
## Instal·lació

### Automàtica (recomanada)

Pots instal·lar **Lletrium!** directament des de la [Chrome Web Store](https://chromewebstore.google.com/detail/lletrium-corrector-ortogr/ecfanealnoplhjapaimncnhmogpijhkm?authuser=1&hl=es) amb un sol clic a **Afegir a Chrome**. Aquesta és l’opció recomanada per a la majoria d’usuaris.

### Manual (des del codi font)

Si vols provar o estudiar el codi font, descarrega el ZIP del repositori amb **Code → Download ZIP** i descomprimeix-lo. Carrega la carpeta [`build/extension`](https://github.com/arturguasch/Lletrium-Corrector-Ortografic-i-Gramatical/tree/main/build/extension), que conté `manifest.json`, des de la pàgina d’extensions de Chrome amb el mode de desenvolupador activat. El ZIP complementari de fonts GPL també inclou els recursos perquè puguis carregar aquesta carpeta directament. Si vols reconstruir els pipelines compartits, el source inclou els inputs necessaris per executar `node engine-src/build.mjs` amb Node.js 20 o posterior, sense haver de descarregar `analysis/`.

## Llengües

Actualment, Lletrium ofereix català central, valencià i balear; castellà; anglès americà; francès; italià; i alemany d’Alemanya, Àustria i Suïssa. Els paquets es trien des de la pàgina de gestió i funcionen localment després de descarregar-se.

Lletrium revisa el text localment al navegador. La compatibilitat depèn de l’editor; hi ha adaptacions per a Google Docs, Google Slides i altres editors web compatibles.

## Agraïments

Estic molt agraït a les persones i als projectes de programari lliure que han creat els codis, diccionaris, regles i altres recursos que han fet possible Lletrium. En particular, a **LanguageTool** i **Softcatalà**, i també als altres projectes i contribuïdors identificats als avisos de tercers.

Lletrium no està afiliat ni està avalat per aquests projectes. Cada component conserva els seus avisos i les condicions de llicència corresponents. Consulta els [avisos de tercers](https://github.com/arturguasch/Lletrium-Corrector-Ortografic-i-Gramatical/blob/main/build/extension/licenses/THIRD_PARTY_NOTICES.md) i la [carpeta de llicències](https://github.com/arturguasch/Lletrium-Corrector-Ortografic-i-Gramatical/tree/main/build/extension/licenses).

## Procedència de les dades franceses

Encara no hem pogut verificar la procedència exacta ni identificar l’autoria de tots els recursos francesos. Estem oberts a rebre informació verificable i a completar els crèdits quan la puguem confirmar. Si pots ajudar a identificar-ne la font o l’autoria, obre una [incidència a GitHub](https://github.com/arturguasch/Lletrium-Corrector-Ortografic-i-Gramatical/issues). Aquesta invitació no confirma per si mateixa els permisos de redistribució; consulta els avisos de tercers.
## Codi obert i privacitat

El codi propi de Lletrium es distribueix sota **GPL-3.0-or-later**. El paquet de fonts inclou el text complet de la llicència de Lletrium i la documentació dels components de tercers, que mantenen les seves pròpies llicències. Els avisos i les llicències dels recursos de l’extensió es poden consultar a la [carpeta de llicències](https://github.com/arturguasch/Lletrium-Corrector-Ortografic-i-Gramatical/tree/main/build/extension/licenses).

La revisió s’executa localment al navegador; consulta la [política de privacitat](https://arturguasch.github.io/Lletrium-Corrector-Ortografic-i-Gramatical/index.html#privacy).

## Contacte

Per informar d’un problema o proposar una millora, [obre una incidència a GitHub](https://github.com/arturguasch/Lletrium-Corrector-Ortografic-i-Gramatical/issues).


