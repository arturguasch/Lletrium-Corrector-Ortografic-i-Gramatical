# Lletrium! 1.0.1

Extensió de Chrome gratuïta i de codi obert per corregir l'ortografia i la gramàtica en català, castellà, anglès americà i francès. La revisió es processa localment al navegador en editors web compatibles, amb una atenció especial al català i les seves variants.

## Instal·lació

1. Descomprimeix `Corrector-Catala-1.0.1.zip` en una carpeta permanent.
2. Obre `chrome://extensions` i activa el mode de desenvolupador.
3. Tria **Carrega una extensió descomprimida** i selecciona la carpeta que conté `manifest.json`.
4. Obre o torna a carregar les pàgines que vulguis revisar.
5. Des del popup, obre **Gestionar idiomes disponibles** per afegir els paquets lingüístics que vulguis fer servir.

Els recursos dels idiomes s'obtenen del catàleg de Lletrium! a GitHub quan els afegeixes. Després queden desats al navegador i funcionen sense connexió. Per actualitzar una instal·lació anterior, carrega aquesta carpeta a la mateixa extensió i torna a carregar les pestanyes obertes.

## Ús

El popup permet activar o desactivar el corrector i triar l'idioma del text que vols revisar. L'idioma dels menús i missatges es configura per separat. Les opcions disponibles depenen dels paquets instal·lats: el català inclou els perfils central, valencià i balear; també hi ha Español, English (United States) i Français amb les variants disponibles al paquet francès.

Lletrium! revisa camps de text compatibles en pàgines web, inclosos Google Docs, Google Slides, Gmail i Canva. En Google Docs, el resum mostra els avisos del text que s'ha revisat mentre et mous pel document. En altres editors, la cobertura depèn de com la pàgina exposa el seu camp de text.

En seleccionar un avís, pots aplicar un suggeriment, ignorar-lo o afegir una paraula al **Diccionari personal** perquè no torni a aparèixer com a possible error ortogràfic. Les regles gramaticals continuen actives. El diccionari es pot exportar i importar en format JSON. Des del popup també pots desactivar el corrector en webs concretes.

## Privacitat i límits

La revisió lingüística i la generació de suggeriments s'executen localment al navegador. El text revisat no s'envia a GitHub, al desenvolupador ni a cap servidor de correcció. Quan afegeixes un paquet d'idioma, el navegador es connecta a GitHub per obtenir els recursos seleccionats; aquesta petició no inclou el text que corregeixes. Les preferències poden sincronitzar-se mitjançant Chrome si tens activada la sincronització. Consulta [PRIVACY.md](PRIVACY.md) per al detall del tractament de dades.

La compatibilitat depèn de l'editor i de com aquest exposa els camps de text. Alguns editors amb models de document privats o marcs als quals Chrome no dona accés poden requerir una adaptació específica o tenir una cobertura limitada.

## Llicències

Consulta `licenses/THIRD_PARTY_NOTICES.md` i les llicències completes de `licenses/` per a la procedència dels components i recursos inclosos. La llicència del codi de Lletrium! i les condicions dels components de tercers són diferents; el paquet no assigna una llicència global als components originals.

La procedència o les condicions de redistribució d'alguns recursos francesos encara s'estan investigant. La informació disponible i les actualitzacions es documenten a `licenses/french-data/RESOURCE-MAP.md`.
