# Corrector local 1.0.0

Extensió de Chrome per revisar text en català i castellà localment, amb perfils de correcció independents i recursos basats en LanguageTool i Softcatalà. Inclou adaptacions per a editors web i Google Docs.

## Instal·lació

1. Descomprimeix `Corrector-Catala-1.0.0.zip` en una carpeta permanent.
2. Obre `chrome://extensions` i activa el mode de desenvolupador.
3. Tria **Carrega una extensió descomprimida** i selecciona la carpeta descomprimida que conté `manifest.json`.
4. Obre o torna a carregar les pàgines que vulguis revisar.

Per actualitzar una instal·lació anterior, carrega aquesta carpeta a la mateixa extensió i torna a carregar les pestanyes obertes.

## Ús

El popup permet activar o apagar el corrector i mostra si el motor està preparat. Tria català central, valencià, balear o castellà d'Espanya al selector de llengua de correcció; l'idioma de la interfície es tria separadament. El botó de la pàgina mostra els avisos del text revisat; en Google Docs, el resum correspon al text visible mentre navegues pel document.

Des del popup pots obrir el **Diccionari personal** per afegir sigles i termes tècnics perquè no es marquin com a errors d'ortografia. Les regles gramaticals continuen actives. El diccionari es pot exportar i importar en format JSON. A **Configuració** també pots desactivar el corrector en llocs concrets.

La configuració, les exclusions de llocs, el diccionari i les eines avançades s’obren dins del mateix popup, sense obrir una pàgina separada.

## Privacitat i límits

La revisió lingüística s'executa localment al navegador. L'extensió no envia el text a un servei de correcció remot. Les preferències poden sincronitzar-se mitjançant Chrome i Google Docs conserva una memòria cau local limitada de suggeriments. Consulta [PRIVACY.md](PRIVACY.md) per al detall del tractament de dades. Els editors amb models de document privats o marcs als quals Chrome no dona accés poden requerir una adaptació específica.

## Llicències

Consulta `licenses/THIRD_PARTY_NOTICES.md` i les llicències completes de `licenses/` per a la procedència dels components i recursos inclosos. El paquet no assigna una llicència global als components originals del producte.
