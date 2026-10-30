# Recursos morfológicos castellanos

Este índice deriva del recurso Morfologik `es-ES.dict` de `org.softcatala:spanish-pos-dict:2.5`, exportado mediante Morfologik 2.2.0 `DictionaryLookup`. Conserva formas, lemas, etiquetas y orden de lecturas; no contiene reglas catalanas.

El runtime también conserva las capas `added.txt` y `removed.txt` de LanguageTool, empaquetadas en `es-manual-tags.json`. `build-es-manual-tags.mjs` las genera desde el snapshot fuente fijado por SHA-256; el tagger aplica las lecturas añadidas antes del FSA y después elimina las lecturas declaradas por LanguageTool. Son 5.376 adiciones y 18 eliminaciones en el snapshot actual. Estas capas corrigen lecturas lingüísticas que no existen en el FSA base (por ejemplo, la lectura masculina de *lito*).

El artefacto original, el POM, la licencia y los hashes del diccionario están en `analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/`. Los recursos derivados de LanguageTool y Softcatalà declaran LGPL-2.1; conserva sus avisos y cumple las condiciones aplicables de la licencia al redistribuir.
