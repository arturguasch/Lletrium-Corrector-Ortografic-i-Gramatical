# Fase 7 — revisió de llicències i release francès

Data: 5 de novembre de 2026 (revisió ampliada de fonts primàries)  
Estat: **tancada administrativament per decisió del projecte**. Progrés del pla: 100% segons l’abast decidit; aquesta fase pesa 5%. La revisió ha identificat, però no eliminat, incerteses de redistribució.

## Decisió actual

Per decisió del projecte, es mantenen els recursos francesos actuals als paquets de prova; no se n’exclouen per aquesta auditoria. L’autoria individual no identificada queda com **pendent d’identificació** i s’actualitzarà si l’autor/a o LanguageTool n’aporta la informació. `fr.sor` conserva també la seva atribució coneguda a Olivier Ronez per a les dades regionals belgues/suïsses; el que hi queda pendent és fixar la lineage exacta del fitxer local.

La revisió de llicència del codi no resol automàticament els drets de cada fitxer de dades. El repositori de LanguageTool publica el projecte sota LGPL-2.1, però el seu POM adverteix que els recursos poden tenir llicències diferents. S’apliquen les llicències explícites per fitxer/artefacte i no s’infereixen permisos per proximitat.

### Criteri d’autoria pendent

Per decisió del projecte, quan no s’hagi identificat una autoria individual, els avisos indicaran **«Autoria pendent d’identificació; recurs procedent del snapshot de LanguageTool identificat en aquest document»**. Aquesta etiqueta descriu l’estat de l’atribució, però no és una llicència ni concedeix permís de redistribució. El tancament d’aquesta fase és administratiu i reflecteix la decisió de conservar els recursos, no una conclusió que tots els drets de redistribució estiguin acreditats.

## Resultat per als recursos distribuïbles

| Recursos/font | Evidència primària observada | Estat de fase 7 | Acció necessària |
|---|---|---|---|
| `grammar.xml`, `style.xml`, `remote-rule-filters.xml`, `disambiguation.xml` | Els mateixos fitxers upstream inclouen avís LGPL-2.1-or-later; les sortides JSON són conversions modificades. | Llicència identificada; cal conservar avisos i atribució a la distribució del codi. | Incloure els notices corresponents al ZIP de fonts i identificar les conversions com a modificades. |
| `french-pos-dict:0.7` (`french.dict`, síntesi i tags) | El `LICENSE` del repositori oficial `languagetool-org/french-pos-dict` identifica l’origen de Morphy, l’extensió de korrekturen.de i CC BY-SA 4.0. El POM/notice de l’artefacte local fixa la versió utilitzada. | Llicència identificada per al payload del diccionari. | Distribuir l’atribució, l’avís CC BY-SA 4.0, l’origen i la indicació de transformacions amb els bytes exactes. |
| `spelling.txt`, `spelling_custom.txt`, `ignore.txt`, `prohibit.txt` | `README_fr.txt` inclòs amb el recurs identifica Dicollecte 6.4.1, MPL 2.0 i els principals col·laboradors. | Llicència identificada per aquests fitxers. | Incloure la MPL 2.0 i atribució Dicollecte al pack i al notice; verificar que el contingut distribuït coincideix amb els hashes inventariats. |
| `fr.sor` | `FrenchSynthesizer` el carrega com a dades Soros. El README oficial de Numbertext declara LGPL-3.0-or-later o Modified BSD per a les dades Soros (excepte serbi) i atribueix el francès belga/suís a Olivier Ronez. L’upstream identifica `data/fr.sor`, però el snapshot local no té Git history i no s’ha pogut fixar la revisió exacta del payload. | **Família de llicència i atribució identificades; lineage/versionat exacte pendent.** No s'hereta CC BY-SA de `french-pos-dict` ni MPL de Hunspell. | Fixar el fitxer local a una revisió upstream/hash verificable abans d’escollir i documentar l’opció BSD o LGPL al pack. |
| `multiwords.txt`, `hyphenated_words.txt`, Core `spelling_global.txt` → `multitoken_words.txt.gz` | Tots tres són consumits per les taules del chunker/speller; els hashes són al manifest generat. Autoria individual no identificada; s’atribueixen al snapshot de LanguageTool com a procedència, sense afirmar-ne autoria ni termes de reutilització. | **Bloqueig de redistribució.** | Obtenir confirmació de LanguageTool per escrit o retirar/substituir les fonts afectades i cotejar els comportaments que les consumeixen. |
| `compounds.txt` | El codi `CompoundRule` el consumeix; la nota MPL del diccionari Hunspell no el cobreix explícitament. Autoria individual no identificada; procedència registrada al snapshot de LanguageTool. No forma part dels onze recursos del `.pack` actual. | No bloqueja aquest `.pack` perquè no s’hi distribueix; sí que bloquejaria un futur release que l’inclogués. | Mantenir fora de `branch-ready` fins a documentar-ne els termes. |
| `replace.txt` i `replace_custom.txt` → `fr-simple-replace.json` | La regla candidata combina els dos fitxers; els comentaris descriuen el format però no indiquen llicència. Autoria individual no identificada; procedència registrada al snapshot de LanguageTool. La LGPL de `SimpleReplaceRule.java` cobreix el codi, no demostra per si sola els termes de les llistes. | **Bloqueig de redistribució del runtime** mentre no es documenti el grant aplicable a tots dos fitxers. | Confirmació upstream o excloure/substituir les llistes i cotejar l’impacte. |
| `compounds.txt` → `fr-compounds.json` | La regla francesa candidata carrega 1.372 entrades actives. Sense avís propi; la llicència del `CompoundRule.java` no cobreix automàticament aquestes dades. | **Bloqueig de redistribució del runtime**, encara que no sigui al `.pack`. | Confirmació upstream o excloure/substituir i cotejar l’impacte. |
| `segment.srx` del Core → `fr-srx.json` | La documentació oficial confirma que `segment.srx` conté les regles de segmentació de LanguageTool; autoria individual no identificada al fitxer. `segment-license.txt` és MIT per a la biblioteca Java separada `net.loomchild:segment`, no prova una llicència MIT per a les dades SRX. Una referència downstream diu LGPL, però no és font primària. | **Permís de les dades SRX no concloent.** La conversió s’inclou a l’extensió de prova. | Demanar/obtenir una confirmació upstream o identificar un grant explícit que cobreixi el fitxer i conservar el notice de transformació. |
| `fr-hybrid-chunker.json` | El candidat el carrega. Deriva de `multiwords.txt` i `spelling_global.txt`; hereta els mateixos dubtes sobre les dades. | **Bloqueig** per les fonts que incorpora. | Resoldre les dues fonts o treure el chunker del runtime abans de publicar. |
| `synonyms.txt` | `FrenchPatternPipeline.load()` el carrega mitjançant `FrenchRepeatedWordsRule`; la regla el consulta quan s’executa el pipeline francès experimental. No s’ha localitzat una llicència individual per a aquestes dades. | **Font activa del candidat de prova; autoria/llicència pendents.** Es conserva perquè el projecte ha decidit mantenir els recursos francesos. | Mantenir al ZIP de prova; documentar autoria pendent i reobrir la revisió abans de redistribuir-lo com a paquet d’idioma. |
| Dependència POS anglesa | El codi del filtre francès pot fer servir la morfologia anglesa. El POM de l’artefacte POS anglès declara LGPL; la distribució de la dada principal té notice conegut, però les llistes manuals upstream requereixen una revisió d’abast. El pack francès no duplica el payload anglès. | No s’ha demostrat que sigui un fitxer francès pendent; és una dependència entre paquets i un risc funcional/licensing independent. | Confirmar si el filtre és habilitat quan hi ha instal·lat en-US i reutilitzar només el paquet/notice existent; no copiar overrides al pack francès sense el seu mapa. |

Hashes complets, consumidors i localitzacions: `inventory.json` i `distribution-scope.md`. Els recursos `synonyms.txt` no són consumits pel pipeline actual i queden fora del pack; no cal resoldre’ls per a aquest release.

## Fets completats en aquesta fase

- S’ha contrastat l’avís del projecte LanguageTool amb els avisos dels recursos: no s’ha generalitzat LGPL a totes les dades.
- S’ha verificat al repositori oficial de `french-pos-dict` que el diccionari declara Morphy, l’extensió de korrekturen.de i CC BY-SA 4.0.
- S’ha verificat el README de Dicollecte 6.4.1 inclòs amb les dades que identifica MPL 2.0 i autoria.
- S’ha traçat `fr.sor`, les llistes multiword i les regles de substitució fins als seus consumidors perquè quedin distingits entre actius, inactius i no empaquetats.
- S’ha localitzat la font probable i la llicència dual del format Soros de `fr.sor` al projecte oficial Numbertext; manca només verificar que el payload concret del snapshot coincideix amb la versió/fitxer upstream i preparar el notice de distribució.
- S’ha ampliat la cerca de llicències als recursos efectivament carregats pel candidat: `replace.txt`, `compounds.txt`, `multiwords.txt`, `hyphenated_words.txt`, `spelling_global.txt` i `segment.srx`. No s’ha localitzat una concessió primària explícita per a aquests continguts. La llicència MIT del component `net.loomchild:segment` no cobreix automàticament el fitxer de dades `segment.srx`.
- S’ha determinat que `synonyms.txt` és present al ZIP però no és carregat pel pipeline candidat actual; s’ha marcat com a eliminable de la build de release fins que hi hagi necessitat/licència demostrada.
- S’ha verificat a la documentació oficial de LanguageTool que les regles SRX es mantenen al recurs `segment.srx`; això identifica l’origen i ús, però no substitueix una declaració de llicència específica del recurs.
- S’ha revisat també el contingut inicial dels fitxers upstream exactes: `multiwords.txt`, `hyphenated_words.txt`, `spelling_global.txt`, `compounds.txt`, `replace.txt` i `replace_custom.txt`. Els comentaris d’ús/format no són una concessió de llicència. La POM arrel de LanguageTool diu expressament que la LGPL fa referència al codi font i que els recursos poden tenir llicències diferents.
- Recompte consolidat d’aquesta cerca: **9 fonts actives del candidat** requereixen atribució o drets encara pendents abans de redistribuir el runtime francès: `fr.sor` (família de llicència coneguda, lineage exacta pendent), les dues llistes de reemplaçament (`replace.txt`, `replace_custom.txt`), `multiwords.txt`, `hyphenated_words.txt`, `spelling_global.txt`, `compounds.txt`, `segment.srx` i `synonyms.txt`. La cerca no ha trobat concessió específica per a les vuit últimes. Les sortides agregades (`multitoken_words`, `fr-hybrid-chunker`) no es compten com a fonts addicionals perquè deriven de les llistes anteriors. La dependència POS anglesa es manté com a revisió separada d’una dependència compartida.
- El `.pack` existent i el ZIP de proves es mantenen locals. Cap artefacte release estable ni catàleg de GitHub s’ha alterat.
- S’ha corregit el seguiment: la taula de fases dóna 15% a fase 6, per tant les fases 0–6 acrediten 95%, no 92%. La fase 7 pesa 5%.

## Estat final i riscos coneguts

- Els paquets de prova conserven els recursos; no s’ha fet cap exclusió ni s’ha regenerat el `.pack` en aquesta decisió.
- L’autoria de les fonts sense autor individual identificat queda pendent, no substituïda per un nom inventat. Si arriba confirmació, s’actualitzaran atribució, font i notice.
- Els termes de redistribució de `multiwords.txt`, `hyphenated_words.txt`, `spelling_global.txt`, `compounds.txt`, `replace.txt`, `replace_custom.txt`, `segment.srx` i `synonyms.txt` no han quedat confirmats en aquesta revisió. `fr.sor` té una llicència familiar i atribució documentades, però la lineage del payload local continua sense fixar.
- **Tancament de fase ≠ clearance legal:** el 100% és el tancament administratiu del pla segons la decisió del projecte; no afirma que l’autor desconegut hagi concedit permís ni que les llicències dels recursos pendents estiguin verificades.
- Abans de publicar aquests recursos a GitHub, distribuir el pack o activar-lo per a usuaris, reobrir la revisió i verificar els termes aplicables. Mantenir els fitxers dins del ZIP de prova no els converteix en lliures de redistribuir.

## Decisió del projecte

La decisió del projecte és mantenir els recursos i tancar administrativament el pla amb autoria pendent. No s’han retirat ni substituït. Si arriba informació d’autoria o de llicència, s’actualitzaran els avisos; si es vol redistribuir o publicar el pack, caldrà reobrir la comprovació dels drets. Aquest document registra una decisió d’abast, no és assessorament legal ni una afirmació que el permís ja existeixi.

## Fonts primàries consultades

- LanguageTool, repositori i llicència principal: <https://github.com/languagetool-org/languagetool>.
- LanguageTool, `segment.srx` del Core (sense avís de fitxer observat): <https://github.com/languagetool-org/languagetool/blob/master/languagetool-core/src/main/resources/org/languagetool/resource/segment.srx>; documentació oficial de segmentació: <https://dev.languagetool.org/customizing-sentence-segmentation-in-srx-rules>.
- LanguageTool, MIT de la biblioteca `net.loomchild:segment` (avís separat; no s’ha d’aplicar al SRX sense evidència): <https://github.com/languagetool-org/languagetool/blob/master/languagetool-standalone/src/main/resources/third-party-licenses/segment-license.txt>.
- `french-pos-dict`, repositori i `LICENSE`: <https://github.com/languagetool-org/french-pos-dict> i <https://github.com/languagetool-org/french-pos-dict/blob/master/LICENSE>.
- Llicència Dicollecte/Mozilla: el `README_fr.txt` de la versió 6.4.1 inclòs al mòdul francès LanguageTool; la font del projecte és <https://grammalecte.net/>.
- Numbertext, descripció i llicència dels programes de dades Soros: <https://github.com/Numbertext/libnumbertext> (README) i <https://github.com/Numbertext/libnumbertext/blob/master/COPYING>.
- Numbertext, ubicació upstream de `fr.sor`: <https://github.com/Numbertext/libnumbertext/tree/master/data>.

