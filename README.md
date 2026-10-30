# Lletrium! Corrector ortogràfic i gramatical

Lletrium és una extensió de navegador que revisa ortografia i gramàtica localment. La versió 1.0.0 inclou perfils per a català central, valencià i balear, espanyol general (`es-ES`) i anglès americà (`en-US`).

El motor funciona al dispositiu i no envia el text a un servei de correcció remot. Hi ha adaptacions específiques per a Google Docs, Google Slides i altres editors compatibles; la cobertura depèn de l’estructura de cada editor.

## Instal·lació

Descarrega el ZIP instal·lable de la pàgina de [releases](https://github.com/arturguasch/Lletrium-Corrector-Ortografic-i-Gramatical/releases), descomprimeix-lo en una carpeta permanent i carrega la carpeta amb `manifest.json` des de `chrome://extensions` amb el mode de desenvolupador activat.

Aquest repositori és el paquet de fonts complementari de la versió 1.0.0. Inclou el codi runtime, el motor, recursos, generadors i les fonts de tercers rellevants per revisar-ne la procedència. No afirma una reconstrucció bit a bit de l’extensió amb una sola ordre; consulta [SOURCE-CONTENTS.md](build/extension/SOURCE-CONTENTS.md) per veure’n l’abast.

## Privacitat i incidències

- [Política de privacitat](https://arturguasch.github.io/Lletrium-Corrector-Ortografic-i-Gramatical/index.html#privacy)
- [Reportar un error](https://github.com/arturguasch/Lletrium-Corrector-Ortografic-i-Gramatical/issues)

## Llicència

El codi original de Lletrium i les adaptacions locals identificades a [LICENSING.md](LICENSING.md) es distribueixen sota **GNU GPL v3 o qualsevol versió posterior**. Aquesta llicència no relicencia automàticament els fitxers originals de tercers: els snapshots, diccionaris, models i altres recursos mantenen les seves condicions i avisos. Llegeix [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) abans de reutilitzar qualsevol component.

La GPL permet l’ús comercial si es compleixen les seves condicions; no prohibeix vendre el programa. El nom i la marca Lletrium no queden concedits per aquesta llicència.
