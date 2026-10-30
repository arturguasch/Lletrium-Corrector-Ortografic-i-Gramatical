# Índice POS catalán: conversión del FSA 3.3

`ca-central.bin.gz` es la transcodificación local de las entradas del recurso Morfologik `ca-ES.dict` de `org.softcatala:catalan-pos-dict:3.3`, dependencia usada por el snapshot fijado de LanguageTool. El exportador recorre el FSA con `morfologik-stemming` 2.2.0 `DictionaryLookup` y conserva forma, lema, etiqueta y orden de lecturas por forma. No reutiliza el índice léxico de la extensión 9.6.93.

## Recuentos y hashes

- JAR upstream: SHA-256 `e5f32aadd1852e8e442810611d89906c06369a94d2a62c1a142eb3e8f5bda2f1`.
- FSA `ca-ES.dict`: SHA-256 `7c0b26c77dd844d06a77c013c199419f330387d924eade178d1dd2027c2afa3b`.
- Entradas exportadas: 1.350.513.
- Índice: 1.040.639 formas, 231.997 lemas, 620 etiquetas, 1.350.513 lecturas.
- Datos descomprimidos: SHA-256 `3706e0763a85d9e6011dd418f491a9a9d3e811913290c84a80955a3edcbd766f`.
- Recurso gzip: SHA-256 `cbbe4cd0027f986fa38f1328f1025315dba902029a28a8ce867bfc9b46d86b8c`.

El índice conserva el orden de inserción que devuelve `DictionaryLookup` para cada forma; no ordena lecturas por lema/etiqueta. Ese orden es observable por etapas posteriores de LanguageTool y el cotejo diferencial confirma que evita divergencias de secuencia en los fixtures actuales.

El manifiesto contiene los hashes de la entrada FSA, `ca-ES.info`, tabla de etiquetas, export TSV, y el índice codificado. El cargador valida cabecera, longitudes, límites, recuentos e integridad del payload antes de habilitar búsquedas.

## Perfil central

Se conserva el diccionario `ca-ES` completo en almacenamiento, incluidas las lecturas cuya etiqueta comienza por `0`. El `CatalanTagger` de LanguageTool elimina esas lecturas en la variante estándar `ca-ES`; la reconstrucción aplica el mismo filtro al producir lecturas para catalán central. No se aplica el tratamiento valenciano que quita el prefijo y conserva la lectura.

## Reproducción

Desde la raíz del proyecto y con el Java 17/Morfologik classpath usado por el oráculo:

```powershell
.\analysis\reference-oracle\export-pos-fsa.ps1 -JavaHome 'RUTA-AL-JDK-17'
node --max-old-space-size=4096 engine-src/tools/build-capos-index.mjs
node engine-src/build.mjs
```

La aplicación final sólo empaqueta el índice compacto y lo usa offline; Java sólo se requiere durante la generación de recursos. El POM del artefacto declara GPL-2.0 o LGPL-2.1. Esta distribución selecciona la opción LGPL-2.1 para los datos derivados y conserva ambas alternativas y los avisos originales en el paquete de fuentes. El manifiesto registra el artefacto, los hashes y la opción elegida.
