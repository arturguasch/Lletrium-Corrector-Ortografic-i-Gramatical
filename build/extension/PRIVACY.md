# Privacitat — Lletrium! 1.0.1 (paquet de proves)

**Responsable:** Artur Guasch Capella · **Contacte de privacitat:** [upfcalendarexporter@gmail.com](mailto:upfcalendarexporter@gmail.com). Aquest fitxer descriu el comportament tècnic de la versió 1.0.1; completa també els camps de privacitat que demani la Chrome Web Store.

## Dades tractades

Quan s'utilitza el corrector, l'extensió llegeix el text dels camps editables compatibles de la pàgina activa. A Google Docs també llegeix el text i la geometria que l'editor exposa per poder situar els avisos. Aquest contingut pot incloure dades personals o comunicacions de l'usuari.

La correcció i la generació de suggeriments s'executen localment al navegador. La versió 1.0.1 no envia el text revisat ni els suggeriments a un servidor del desenvolupador ni a un servei de correcció remot.

En instal·lar l'extensió o quan l'usuari afegeix un idioma, Lletrium! descarrega del repositori públic de GitHub només els paquets lingüístics seleccionats. GitHub pot rebre les dades tècniques habituals d'una connexió web, com ara l'adreça IP i la petició del fitxer. L'extensió no inclou el text revisat, el contingut del document ni l'historial de navegació en aquestes peticions. Els paquets descarregats es desen localment a IndexedDB i funcionen sense connexió.

## Emmagatzematge

- Les preferències de l'extensió (com ara l'estat d'activació, l'idioma i els llocs exclosos) es desen a `chrome.storage.sync`; Chrome pot sincronitzar-les entre els dispositius de l'usuari si aquest té activada la sincronització.
- El diccionari personal es desa a `chrome.storage.local` al dispositiu i se separa per perfil de correcció (català central, valencià, balear o castellà). No es sincronitza automàticament; l'usuari el pot exportar i importar des de la configuració.
- Els paquets d'idioma seleccionats es desen a IndexedDB de l'origen de l'extensió. El reinici de fàbrica de Lletrium! els elimina.
- Per accelerar Google Docs, `chrome.storage.local` conserva una memòria cau limitada a 240 entrades durant un màxim de 21 dies. Cada entrada desa els suggeriments, la data i una clau compacta calculada a partir de la regla, el fragment marcat i fins a 80 caràcters de context a cada costat. La clau no és una anonimització criptogràfica: algú amb accés a les dades locals podria provar fragments probables. La memòria cau no desa el text complet del document ni el fragment original com a camp de text pla.
- L'usuari pot esborrar les dades de l'extensió des de la configuració de Chrome o desinstal·lant-la.

## Compartició i ús

El desenvolupador no rep ni comparteix el contingut llegit per l'extensió. Les peticions a GitHub només serveixen per obtenir els paquets lingüístics seleccionats; GitHub les tracta segons la seva pròpia política de privacitat. Les dades de preferències sincronitzades són gestionades per Chrome segons la configuració i les polítiques del compte de l'usuari. L'extensió no usa el contingut per a publicitat, perfilatge ni entrenament de models.

La lectura només serveix per detectar incidències lingüístiques i mostrar o aplicar suggeriments dins l'editor. L'extensió tracta les dades d'acord amb la política de dades d'usuari de Chrome Web Store i les seves restriccions d'ús limitat.

**Ús limitat:** el contingut de les pàgines s'utilitza únicament per oferir la correcció i els suggeriments que l'usuari demana dins l'editor. No es ven, no es transfereix a tercers ni s'utilitza per a publicitat, perfilatge o cap finalitat aliena a aquesta funció.

## Abast i contacte

La revisió s'activa quan l'usuari visita una pàgina amb un camp editable compatible. L'extensió necessita accés als llocs on funciona aquesta característica. Per consultes o sol·licituds de privacitat, escriu a [upfcalendarexporter@gmail.com](mailto:upfcalendarexporter@gmail.com).

