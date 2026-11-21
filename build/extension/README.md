# Lletrium! 1.0.2

Extensió de Chrome gratuïta i de codi obert per corregir textos localment. Els perfils disponibles depenen dels paquets d’idioma instal·lats: català central, valencià i balear; castellà; anglès americà; francès; italià; i alemany d’Alemanya, Àustria o Suïssa.

## Instal·lació

1. Descomprimeix `Instalable.zip` en una carpeta permanent.
2. Obre `chrome://extensions` i activa el mode de desenvolupador.
3. Tria **Carrega una extensió descomprimida** i selecciona la carpeta que conté `manifest.json`.
4. Obre **Gestionar idiomes** i descarrega els paquets que vulguis fer servir.

Els paquets es descarreguen des de la branca GitHub `language-packs`, es verifiquen amb els hashes fixats a l’extensió i es desen a IndexedDB. Després funcionen sense connexió. Els paquets italià i alemany són de la versió 1.0.2. L’alemany permet seleccionar els perfils d’Alemanya (`de-DE`), Àustria (`de-AT`) i Suïssa (`de-CH`).

Els menús i missatges de l’extensió es poden mostrar en català, castellà, anglès, francès, italià o alemany, independentment de l’idioma de correcció.

## Ús i privacitat

La revisió lingüística i els suggeriments s’executen localment al navegador. El text revisat no s’envia a GitHub ni a cap servei de correcció. GitHub rep les peticions dels paquets d’idioma seleccionats, sense el text revisat. Consulta [PRIVACY.md](PRIVACY.md) per als detalls.

El popup permet activar o desactivar la correcció, seleccionar un perfil instal·lat i gestionar el diccionari personal. La cobertura dels editors depèn de com exposen els seus camps de text.

## Llicències

Consulta `licenses/THIRD_PARTY_NOTICES.md` i les llicències completes de `licenses/`. Els `.pack` no s’inclouen en aquest ZIP; els avisos i la procedència per recurs dels paquets italià i alemany també es publiquen a `language-packs/licenses/italian-data/` i `language-packs/licenses/german-data/`.
