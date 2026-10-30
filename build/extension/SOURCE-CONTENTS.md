# Fuentes complementarias — Corrector local 1.0.0

Este archivo acompaña a `Corrector-Catala-1.0.0.zip`; no lo sustituye. El ZIP instalable contiene el código legible que ejecuta el navegador y los recursos exactos de esta versión. Este complemento añade el motor fuente, los scripts de construcción y los materiales upstream pertinentes para los perfiles de catalán, castellano e inglés americano que incluye el producto.

## Incluido

- La infraestructura de adaptadores incluye `src/editor-main-world.js`, puente propio para consultar el modelo CodeMirror 5 desde el content script aislado: lectura completa, offsets de los fragmentos visibles, escritura mediante la API del editor y limpieza de listeners. Se carga desde el manifiesto con los permisos de sitios existentes.

- El código runtime exacto de la extensión, sus recursos, configuración de producto y archivos de licencia.
- El motor local y sus scripts fuente de construcción y empaquetado.
- Para catalán: las fuentes pertinentes de LanguageTool, los datos de Softcatalà y `catalan-dict-tools`, los inventarios de reglas y los recursos morfológicos fuente o derivados incluidos en la extensión.
- Para castellano `es-ES`: el módulo fuente y los recursos españoles de LanguageTool 6.9-SNAPSHOT usados por el motor, el recurso SRX compartido, `EnglishTagger` y su diccionario POS, y el artefacto `spanish-pos-dict:2.5` con su POM, licencia, diccionarios y entradas binarias fuente de los recursos FSA.
- Para inglés americano `en-US`: el módulo completo `languagetool-language-modules/en/src/main` y su POM/COPYING, que permite revisar las reglas y recursos upstream adaptados; el JAR/POM y diccionarios extraídos de `english-pos-dict:0.6`; los tres artefactos/POMs Apache-2.0 de modelos OpenNLP; y las fuentes exactas del perfil, hashes y generadores. Se omite el resto del snapshot multilingüe de LanguageTool.
- La Fase 5 inglesa incluye además un corpus de prosa independiente, sus resultados de cotejo con LanguageTool DEFAULT/PICKY, el comparador y las mediciones locales de rendimiento; el benchmark documenta que Node V8 sirve como proxy y no como medición directa del worker de Chrome.
- Las explicaciones del perfil castellano traducidas al catalán y al inglés, con el inventario reproducible y el generador offline; los archivos upstream seleccionados de LanguageTool se guardan bajo `references/languagetool-es-ES/` para que queden separados del snapshot multilingüe.
- Los manifiestos y hashes de los recursos distribuidos, para identificar las versiones exactas de los materiales utilizados.
- Los fuentes de referencia `Speller.java` y `HMatrix.java` de Morfologik, junto con la adaptación JavaScript y los avisos BSD correspondientes.
- Los avisos, licencias y la política de privacidad de la versión 1.0.0.

## Omitido

Se omiten el snapshot multilingüe completo de LanguageTool, los módulos de idiomas que no distribuye la extensión, los corpus grandes de comparación y los diagnósticos históricos. No forman parte de los componentes de catalán o castellano incluidos en la versión 1.0.0.

El paquete permite revisar y modificar el código runtime distribuido y los componentes de terceros identificados. No afirma que todo el producto pueda reconstruirse de forma bit a bit con una única orden. El desarrollador declara que el resto del código es trabajo original creado durante este proyecto con asistencia de ChatGPT; esta declaración no cubre posibles materiales de terceros no identificados. Consulta `licenses/THIRD_PARTY_NOTICES.md` para los términos y la procedencia declarada.
