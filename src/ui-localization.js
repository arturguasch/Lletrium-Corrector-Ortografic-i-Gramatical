(() => {
  const ca = {
    notice: "Avís",
    appTitle: "Lletrium!", actions: "Accions del corrector", supportProject: "Suport al projecte", supportBannerTitle: "Aquesta extensió és gratuïta", supportBannerText: "Si t’ha estalviat temps, qualsevol suport ajuda a cobrir les despeses de manteniment.", supportProjectLink: "Donar suport", reportIssue: "Reportar un error", reportIssueComingSoon: "L’enllaç per reportar errors arribarà més endavant.", popupAuthor: "Fet per: Artur Guasch", popupPrivacyNote: "La revisió es fa localment; el text no s’envia a cap servidor.", privacyPolicyLink: "Política de privacitat", version: "Versió {version}",
    enabled: "Corrector activat", disabled: "Corrector desactivat", galicianSoon: "Gallec — pròximament", basqueSoon: "Euskera — pròximament", unsupportedSiteMessage: "El corrector no pot revisar text en aquesta web. La resta de funcions continua disponible.", unsupportedExtensionStore: "Les botigues d’extensions bloquegen la revisió del corrector en aquestes pàgines.", msOnlineOfficeNotSupported: "Aquesta pàgina no conté un document obert per corregir.",
    interfaceLanguage: "Idioma dels menús i missatges", interfaceLanguageHelp: "Només canvia l’idioma de l’extensió, no el de correcció.", theme: "Aparença", preferences: "Preferències", catalan: "Català", spanishInterface: "Español", englishInterface: "English", darkMode: "Mode fosc", darkModeHelp: "Canvia l’aparença del corrector.", system: "Sistema", light: "Clar", dark: "Fosc",
    proofingLanguage: "Idioma del text que vols corregir", proofingLanguageHelp: "Tria l’idioma en què està escrit el text.", central: "Català central", valencian: "Català valencià", balearic: "Català balear", spanish: "Espanyol", english: "Anglès americà",
    spanishSoon: "Castellà — pròximament", englishSoon: "Anglès — pròximament", loading: "Carregant el motor…", ready: "Motor preparat", engineFailureHelp: "Prova de recarregar la pàgina. Si el problema continua, escriu a",
    engineOff: "Corrector desactivat · motor aturat", engineError: "No s’ha pogut carregar el motor", engineQueryError: "No s’ha pogut consultar el motor", genericEnglishSpelling: "Possible error ortogràfic en anglès.", genericEnglishGrammar: "Revisa aquesta construcció en anglès.",
    dictionary: "Diccionari personal", manageSites: "Desactivar en webs", dictionaryLanguage: "Idioma del diccionari", dictionaryForProfile: "Paraules guardades per a", settings: "Configuració", back: "Torna", dictionaryHelp: "Les paraules afegides deixen d’aparèixer com a errors d’ortografia. Es desen només en aquest dispositiu.",
    newWord: "Paraula nova", wordPlaceholder: "Paraula o sigla", add: "Afegir", searchDictionary: "Cerca al diccionari", export: "Exportar", import: "Importar",
    noWords: "Encara no hi ha paraules desades.", noMatches: "No hi ha coincidències.", remove: "Eliminar", siteSection: "Desactivar el corrector en webs concretes", checkingSite: "Comprovant lloc…",
    siteSectionHelp: "Indica en quines webs vols desactivar el corrector. A la resta, continuarà actiu.", siteAddressLabel: "Desactiva el corrector en una web", siteAddressPlaceholder: "exemple.cat o https://exemple.cat/pàgina", siteAddressHelp: "S’aplicarà a tot el domini i als seus subdominis.", siteUnavailable: "No es pot gestionar aquesta pàgina des del popup.", addSite: "Desactivar", currentPage: "Web oberta ara", disableHere: "Desactivar en aquesta web", enableHere: "Activar en aquesta web", siteActiveState: "Corrector activat en aquesta web.", siteDisabledState: "Corrector desactivat en aquesta web.", disabledSites: "Webs amb el corrector desactivat", noDisabledSites: "No has desactivat el corrector en cap web.", enableSiteForHost: "Activar el corrector a {host}", invalidSiteAddress: "Escriu un domini o un enllaç web vàlid (http o https).", siteAlreadyDisabled: "El corrector ja està desactivat a {host} o en un domini superior.", siteDisabled: "S’ha desactivat el corrector a {host} i als seus subdominis.",
    resetAllButton: "Reiniciar extensió per defecte", resetConfirmTitle: "Vols restablir l’extensió?", resetConfirmText: "S’esborraran les preferències, les webs on has desactivat el corrector i tot el diccionari personal. L’extensió tornarà a la configuració inicial.", cancel: "Cancel·lar", confirmReset: "Sí, restablir-ho tot", resetInProgress: "Esborrant dades…", resetRestarting: "Reiniciant l’extensió…", resetFailed: "No s’ha pogut restablir l’extensió",
    disableSite: "Desactivar el corrector", enableSite: "Activar", privacy: "Privacitat", privacyText: "La revisió s’executa localment. El text no s’envia a cap servei de correcció.",
    reviewButtonSection: "Botó de resum", showReviewButton: "Mostrar el botó lateral", showReviewButtonHelp: "Amaga el botó lateral o flotant. Els errors continuaran subratllats i els podràs corregir.",
    advanced: "Avançat · diagnòstics i proves", advancedEngineGroup: "Proves del motor", advancedPageGroup: "Analitzar una pàgina", advancedPageHelp: "Eines per trobar per què un camp editable no es corregeix.", advancedRecordingGroup: "Gravacions de la pàgina activa", advancedPerformanceGroup: "Rendiment", paintRecordingTitle: "Pintades i scroll", paintRecordingHelp: "Registra quan apareixen o desapareixen les marques mentre et mous pel document.", paintRecordingStart: "Gravar pintades", paintRecordingCopy: "Copiar gravació", paintRecordingStopped: "Aturat", readRecordingTitle: "Procés de lectura", readRecordingHelp: "Mesura les fases de lectura, anàlisi i revisió del document.", readRecordingStart: "Gravar procés de lectura", readRecordingCopy: "Copiar lectura", readRecordingStopped: "Gravació de lectura aturada", recordingStop: "Aturar gravació", recordingNeedsDocs: "Obre la pàgina que vols gravar i torna a obrir aquest menú.", paintRecordingActive: "Gravant pintades i scroll… ({count} esdeveniments)", paintRecordingStoppedCount: "Aturat · {count} esdeveniments", paintRecordingCopied: "Copiat. Enganxa la gravació aquí al xat.", readRecordingActive: "Registrant lectura… ({count} esdeveniments)", readRecordingStoppedCount: "Aturada · {count} esdeveniments", readRecordingCopied: "Lectura copiada; enganxa-la aquí.", engineErrorTestMode: "Simular error del motor", engineErrorTestModeHelp: "Mostra l’avís al botó lateral i al popup, però no atura el motor.", engineBadgeFailure: "El motor no funciona. Avís.", engineTestStatus: "Mode de prova actiu: es mostra una fallada simulada.", fullDiagnostics: "Diagnòstic complet", analyzeEditorPage: "Analitzar editor i camps", copyEditorAnalysis: "Copiar anàlisi", editorAnalysisHelp: "Fes clic primer al camp que falla. Mostra estructura i estat, sense incloure el text.", editorAnalysisNoTab: "Obre la pestanya que vols analitzar i torna-ho a provar.", editorAnalysisDone: "Anàlisi completada", editorAnalysisFields: "camps", editorAnalysisActive: "editors actius", editorAnalysisFailed: "Error en analitzar la pàgina.", editorAnalysisCopied: "Anàlisi copiada.", paragraphInteractionDiagnosticsHint: "Per detectar recàlculs: aplica un suggeriment, afegeix una paraula al diccionari o escriu fins que el text salti de línia. Espera 7 segons i genera el diagnòstic complet. Registra canvis de línies, marques i revisions, sense desar el text.", coldStart: "Prova d’inici fred", preload: "Preparar motor", copy: "Copiar",
    debounce: "Pausa abans de revisar (ms)", maxText: "Mida màxima del text", save: "Desar", spelling: "Ortografia", grammar: "Gramàtica", style: "Estil",
    close: "Tanca", noSuggestion: "Sense suggeriment automàtic.", applying: "Aplicant…", applyingCorrection: "Aplicant la correcció…", ignoreOnce: "Ignorar aquesta vegada",
    addToDictionary: "Afegir al diccionari", undo: "Desfer", goToIssue: "Ves a l’avís", moreSuggestions: "Més suggeriments", calculating: "Calculant…",
    contextualSuggestions: "Suggeriments contextuals", noMoreSuggestions: "Sense més suggeriments", suggestionsFailed: "No s’han pogut carregar",
    applyFailed: "No s’ha pogut aplicar. Torna-ho a provar.", reviewAgain: "Revisar de nou", reviewing: "Revisant el text visible…", analyze: "Analitzant…",
    reviewVisible: "Revisar text visible", reviewSelection: "Revisar text seleccionat", noIssues: "Cap avís al text visible.",
    docsScanHint: "Google Docs es revisa per fragments a mesura que navegues pel document.", issueCount: "{count} avisos al text visible",
    unableConfirmField: "No he pogut confirmar el canvi al camp.", editorRejected: "L’editor no ha acceptat la correcció.", unableConfirmEditor: "No he pogut confirmar la correcció dins l’editor.",
    genericSpelling: "Possible error ortogràfic.", genericGrammar: "Revisa aquesta construcció en català.",
    genericSpanishSpelling: "Possible error ortogràfic en castellà.", genericSpanishGrammar: "Revisa aquesta construcció en castellà.",
    spellingError: "Possible error ortogràfic.", capitalization: "Aquesta frase no comença amb majúscula.", inconsistent: "La forma no és coherent amb la resta del text.",
    selectIssueToGo: "Selecciona un avís per anar-hi.", suggestionsFor: "Suggeriments per a", issue: "l’avís", noIssuesReviewed: "Cap avís al text revisat.", notCheckedActive: "Encara no s’ha revisat el camp actiu.",
    noCompatibleField: "No hi ha cap camp de text compatible en aquesta pàgina.", reviewActiveField: "Revisar el camp actiu", reviewingField: "Revisant el camp…",
    disableCurrentDocument: "Desactivar en aquest document", enableCurrentDocument: "Reactivar en aquest document", currentDocumentDisabled: "El corrector està desactivat en aquest document.",
    docsDetectionLabel: "Detecció en aquest document", docsDetectionOn: "Activat", docsDetectionOff: "Apagat", docsToolbarEnable: "Activar el corrector en aquest document", docsToolbarDisable: "Desactivar el corrector en aquest document", openExtensionPopup: "Obre el popup de l’extensió",
    openSummary: "Obre el resum del corrector", reviewSummary: "Resum del corrector", closeSummary: "Tanca el resum", issueCountReviewed: "{count} avisos al text revisat", showMoreIssues: "Mostra {count} avisos més",
    applied: "Aplicada", suggestionApplied: "S’ha aplicat «{suggestion}». ",
    originalExplanation: "Explicació original de la regla", spellingAdded: "«{word}» s’ha afegit al diccionari.", duplicateWord: "Aquesta paraula ja és al diccionari.",
    wordAdded: "«{word}» s’ha afegit al diccionari.", wordRemoved: "«{word}» s’ha eliminat del diccionari.", unsupportedSiteExclusion: "Aquest tipus de pàgina no admet exclusions per lloc.",
    enable: "Activar", siteEnabled: "Corrector activat a {host}.", siteDisabled: "Corrector desactivat a {host}.", preferencesSaved: "Preferències desades.",
    runningColdStart: "Executant la prova d’inici fred…", collectingDiagnostics: "Recollint el diagnòstic…", diagnosticsFailed: "No s’ha pogut obtenir el diagnòstic",
    diagnosticsCopied: "Diagnòstic copiat.", diagnosticsCopyFailed: "No s’ha pogut copiar el diagnòstic.", dictionaryExported: "S’ha exportat el diccionari.",
    dictionaryImported: "S’han importat paraules. Total: {count}.", importFailed: "No s’ha pogut importar", settingsSaveFailed: "No s’ha pogut desar l’estat del corrector",
    alreadyThere: "Aquesta paraula ja és al diccionari.", issue_SINO_SI_NO: "Revisa si vols dir «sinó» (oposició) o «si no» (condició).",
    badgeIssues: "{count} avisos. Obre el resum del corrector.", badgeIssuesShort: "{count} avisos", badgeNoIssues: "Cap avís. Obre el resum del corrector.", badgeNoIssuesShort: "Corrector preparat", reviewingBadge: "Revisant el text visible.", reviewingBadgeShort: "Revisant…",
    replacementMarkChanged: "La marca ha canviat. Revisa el text i torna-ho a provar.", replacementInProgress: "Ja s’està aplicant una correcció.", tryingReplacement: "Aplicant «{suggestion}» a «{original}»…", rangeValidationFailed: "No he pogut validar el fragment. Torna a revisar el text.", issueTextChanged: "El text ha canviat des que es va detectar l’avís. Revisa’l de nou.", googleDocsApplyFailed: "Google Docs no ha confirmat la substitució.", googleDocsApplyError: "S’ha produït un error en aplicar la substitució.", replacementApplied: "S’ha substituït «{original}» per «{suggestion}».", selectionUnavailable: "No s’ha trobat cap selecció de text per revisar.",
    calculatingSuggestions: "Calculant suggeriments…", undo: "Desfer", dictionaryUndo: "«{word}» s’ha afegit al diccionari.", loadingMayTake: "Si el motor s’estava iniciant, la primera revisió pot trigar uns segons.", engineStillLoading: "El motor encara s’està carregant…", retryWithoutReload: "Pots esperar o tornar-ho a provar sense recarregar la pàgina.", analyzing: "Analitzant…", analyzingSelection: "Analitzant la selecció…", retryingReview: "Tornant-ho a provar…", visibleSuggestions: "{count} suggeriments detectats.", changeAppliedReviewAgain: "Canvi aplicat. Torna a revisar per trobar més errors.", noSavedReview: "Encara no hi ha cap revisió desada. Pots iniciar-ne una amb «Revisar de nou».", reviewInterrupted: "La revisió s’ha interromput: {error}. Pots tornar-ho a provar.", selectionReviewFailed: "No s’ha pogut completar la revisió de la selecció: {error}.", selectionReplaceUnavailable: "La substitució directa no està disponible per a seleccions sense marca visible.", copyDiagnostic: "Copiar diagnòstic", copyFullDiagnostic: "Copiar diagnòstic complet", latestReplacement: "Última substitució", noReplacementTried: "Encara no s’ha provat cap substitució.", diagnosticCopied: "Diagnòstic copiat.", diagnosticCopyManual: "No s’ha pogut copiar automàticament; selecciona el quadre de text.", importInvalidList: "El fitxer no conté una llista de paraules.", docsReadFailed: "No he pogut llegir el text de Google Docs. Torna a carregar el document amb l’extensió activada.",
  };
  const es = {
    notice: "Aviso",
    appTitle: "Lletrium!", actions: "Acciones del corrector", supportProject: "Apoyo al proyecto", supportBannerTitle: "Esta extensión es gratuita", supportBannerText: "Si te ha ahorrado tiempo, cualquier apoyo ayuda a cubrir los gastos de mantenimiento.", supportProjectLink: "Apoyar", reportIssue: "Informar de un error", reportIssueComingSoon: "El enlace para informar de errores estará disponible más adelante.", popupAuthor: "Creado por: Artur Guasch", popupPrivacyNote: "La revisión se procesa localmente; el texto no se envía a ningún servidor.", privacyPolicyLink: "Política de privacidad", version: "Versión {version}", enabled: "Corrector activado", disabled: "Corrector desactivado", galicianSoon: "Gallego — próximamente", basqueSoon: "Euskera — próximamente", unsupportedSiteMessage: "El corrector no puede revisar texto en esta web. El resto de funciones sigue disponible.", unsupportedExtensionStore: "Las tiendas de extensiones bloquean la revisión del corrector en estas páginas.", msOnlineOfficeNotSupported: "Esta página no contiene un documento abierto para corregir.",
    interfaceLanguage: "Idioma de los menús y mensajes", interfaceLanguageHelp: "Solo cambia el idioma de la extensión, no el de corrección.", theme: "Apariencia", preferences: "Preferencias", catalan: "Català", spanishInterface: "Español", englishInterface: "English", darkMode: "Modo oscuro", darkModeHelp: "Cambia la apariencia del corrector.", system: "Sistema", light: "Claro", dark: "Oscuro",
    proofingLanguage: "Idioma del texto que quieres corregir", proofingLanguageHelp: "Elige el idioma en que está escrito el texto.", central: "Catalán central", valencian: "Catalán valenciano", balearic: "Catalán balear", spanish: "Español", english: "Inglés estadounidense",
    spanishSoon: "Castellano — próximamente", englishSoon: "Inglés — próximamente", loading: "Cargando el motor…", ready: "Motor preparado", engineFailureHelp: "Prueba a recargar la página. Si el problema continúa, escribe a",
    engineOff: "Corrector desactivado · motor detenido", engineError: "No se ha podido cargar el motor", engineQueryError: "No se ha podido consultar el motor", genericEnglishSpelling: "Posible error ortográfico en inglés.", genericEnglishGrammar: "Revisa esta construcción en inglés.",
    dictionary: "Diccionario personal", manageSites: "Desactivar en webs", dictionaryLanguage: "Idioma del diccionario", dictionaryForProfile: "Palabras guardadas para", settings: "Configuración", back: "Volver", dictionaryHelp: "Las palabras añadidas dejarán de aparecer como errores ortográficos. Se guardan solo en este dispositivo.",
    newWord: "Palabra nueva", wordPlaceholder: "Palabra o sigla", add: "Añadir", searchDictionary: "Buscar en el diccionario", export: "Exportar", import: "Importar",
    noWords: "Todavía no hay palabras guardadas.", noMatches: "No hay coincidencias.", remove: "Eliminar", siteSection: "Desactivar el corrector en sitios concretos", checkingSite: "Comprobando sitio…",
    siteSectionHelp: "Indica en qué webs quieres desactivar el corrector. En las demás, seguirá activo.", siteAddressLabel: "Desactiva el corrector en una web", siteAddressPlaceholder: "ejemplo.es o https://ejemplo.es/página", siteAddressHelp: "Se aplicará a todo el dominio y sus subdominios.", siteUnavailable: "No se puede gestionar esta página desde el popup.", addSite: "Desactivar", currentPage: "Web abierta ahora", disableHere: "Desactivar en esta web", enableHere: "Activar en esta web", siteActiveState: "Corrector activado en esta web.", siteDisabledState: "Corrector desactivado en esta web.", disabledSites: "Webs con el corrector desactivado", noDisabledSites: "No has desactivado el corrector en ninguna web.", enableSiteForHost: "Activar el corrector en {host}", invalidSiteAddress: "Escribe un dominio o enlace web válido (http o https).", siteAlreadyDisabled: "El corrector ya está desactivado en {host} o en un dominio superior.", siteDisabled: "Se ha desactivado el corrector en {host} y sus subdominios.",
    resetAllButton: "Reiniciar extensión con los valores predeterminados", resetConfirmTitle: "¿Quieres restablecer la extensión?", resetConfirmText: "Se borrarán las preferencias, las webs donde has desactivado el corrector y todo el diccionario personal. La extensión volverá a su configuración inicial.", cancel: "Cancelar", confirmReset: "Sí, restablecer todo", resetInProgress: "Borrando datos…", resetRestarting: "Reiniciando la extensión…", resetFailed: "No se ha podido restablecer la extensión",
    disableSite: "Desactivar el corrector", enableSite: "Activar", privacy: "Privacidad", privacyText: "La revisión se ejecuta localmente. El texto no se envía a ningún servicio de corrección.",
    reviewButtonSection: "Botón de resumen", showReviewButton: "Mostrar el botón lateral", showReviewButtonHelp: "Oculta el botón lateral o flotante. Los errores seguirán subrayados y podrás corregirlos.",
    advanced: "Avanzado · diagnósticos y pruebas", advancedEngineGroup: "Pruebas del motor", advancedPageGroup: "Analizar una página", advancedPageHelp: "Herramientas para averiguar por qué no se corrige un campo editable.", advancedRecordingGroup: "Grabaciones para Google Docs", advancedPerformanceGroup: "Rendimiento", paintRecordingTitle: "Subrayados y desplazamiento", paintRecordingHelp: "Registra cuándo aparecen o desaparecen los avisos al moverte por el documento.", paintRecordingStart: "Grabar subrayados", paintRecordingCopy: "Copiar grabación", paintRecordingStopped: "Detenida", readRecordingTitle: "Proceso de lectura", readRecordingHelp: "Mide las fases de lectura, análisis y revisión del documento.", readRecordingStart: "Grabar proceso de lectura", readRecordingCopy: "Copiar lectura", readRecordingStopped: "Grabación de lectura detenida", recordingStop: "Detener grabación", recordingNeedsDocs: "Abre la página que quieres grabar y vuelve a abrir este menú.", paintRecordingActive: "Grabando subrayados y desplazamiento… ({count} eventos)", paintRecordingStoppedCount: "Detenida · {count} eventos", paintRecordingCopied: "Copiado. Pega la grabación aquí en el chat.", readRecordingActive: "Grabando lectura… ({count} eventos)", readRecordingStoppedCount: "Detenida · {count} eventos", readRecordingCopied: "Lectura copiada; pégala aquí.", engineErrorTestMode: "Simular error del motor", engineErrorTestModeHelp: "Muestra el aviso en el botón lateral y en el popup, pero no detiene el motor.", engineBadgeFailure: "El motor no funciona. Aviso.", engineTestStatus: "Modo de prueba activo: se muestra un fallo simulado.", fullDiagnostics: "Diagnóstico completo", analyzeEditorPage: "Analizar editor y campos", copyEditorAnalysis: "Copiar análisis", editorAnalysisHelp: "Haz clic primero en el campo que falla. Muestra estructura y estado, sin incluir el texto.", editorAnalysisNoTab: "Abre la pestaña que quieres analizar y vuelve a intentarlo.", editorAnalysisDone: "Análisis completado", editorAnalysisFields: "campos", editorAnalysisActive: "editores activos", editorAnalysisFailed: "Error al analizar la página.", editorAnalysisCopied: "Análisis copiado.", paragraphInteractionDiagnosticsHint: "Para detectar recálculos: aplica una sugerencia, añade una palabra al diccionario o escribe hasta que el texto salte de línea. Espera 7 segundos y genera el diagnóstico completo. Registra cambios de líneas, marcas y revisiones, sin guardar el texto.", coldStart: "Prueba de inicio en frío", preload: "Preparar motor", copy: "Copiar",
    debounce: "Pausa antes de revisar (ms)", maxText: "Tamaño máximo del texto", save: "Guardar", spelling: "Ortografía", grammar: "Gramática", style: "Estilo",
    close: "Cerrar", noSuggestion: "Sin sugerencia automática.", applying: "Aplicando…", applyingCorrection: "Aplicando la corrección…", ignoreOnce: "Ignorar esta vez",
    addToDictionary: "Añadir al diccionario", undo: "Deshacer", goToIssue: "Ir al aviso", moreSuggestions: "Más sugerencias", calculating: "Calculando…",
    contextualSuggestions: "Sugerencias contextuales", noMoreSuggestions: "No hay más sugerencias", suggestionsFailed: "No se han podido cargar",
    applyFailed: "No se ha podido aplicar. Inténtalo de nuevo.", reviewAgain: "Revisar de nuevo", reviewing: "Revisando el texto visible…", analyze: "Analizando…",
    reviewVisible: "Revisar texto visible", reviewSelection: "Revisar texto seleccionado", noIssues: "No hay avisos en el texto visible.",
    docsScanHint: "Google Docs se revisa por fragmentos a medida que navegas por el documento.", issueCount: "{count} avisos en el texto visible",
    unableConfirmField: "No he podido confirmar el cambio en el campo.", editorRejected: "El editor no ha aceptado la corrección.", unableConfirmEditor: "No he podido confirmar la corrección en el editor.",
    genericSpelling: "Posible error ortográfico.", genericGrammar: "Revisa esta construcción en catalán.", spellingError: "Posible error ortográfico.",
    genericSpanishSpelling: "Posible error ortográfico en castellano.", genericSpanishGrammar: "Revisa esta construcción en castellano.",
    capitalization: "La frase no empieza con mayúscula.", inconsistent: "La forma no es coherente con el resto del texto.", originalExplanation: "Explicación original de la regla",
    selectIssueToGo: "Selecciona un aviso para ir a él.", suggestionsFor: "Sugerencias para", issue: "el aviso", noIssuesReviewed: "No hay avisos en el texto revisado.", notCheckedActive: "Todavía no se ha revisado el campo activo.",
    noCompatibleField: "No hay ningún campo de texto compatible en esta página.", reviewActiveField: "Revisar el campo activo", reviewingField: "Revisando el campo…",
    disableCurrentDocument: "Desactivar en este documento", enableCurrentDocument: "Reactivar en este documento", currentDocumentDisabled: "El corrector está desactivado en este documento.",
    docsDetectionLabel: "Corrección en este documento", docsDetectionOn: "Activada", docsDetectionOff: "Apagada", docsToolbarEnable: "Activar el corrector en este documento", docsToolbarDisable: "Desactivar el corrector en este documento", openExtensionPopup: "Abrir el popup de la extensión",
    openSummary: "Abrir el resumen del corrector", reviewSummary: "Resumen del corrector", closeSummary: "Cerrar el resumen", issueCountReviewed: "{count} avisos en el texto revisado", showMoreIssues: "Mostrar {count} avisos más",
    applied: "Aplicada", suggestionApplied: "Se ha aplicado «{suggestion}». ",
    spellingAdded: "«{word}» se ha añadido al diccionario.", duplicateWord: "Esta palabra ya está en el diccionario.", wordAdded: "«{word}» se ha añadido al diccionario.", wordRemoved: "«{word}» se ha eliminado del diccionario.", unsupportedSiteExclusion: "Este tipo de página no admite exclusiones por sitio.",
    enable: "Activar", siteEnabled: "Corrector activado en {host}.", siteDisabled: "Corrector desactivado en {host}.", preferencesSaved: "Preferencias guardadas.",
    runningColdStart: "Ejecutando la prueba de inicio en frío…", collectingDiagnostics: "Recopilando el diagnóstico…", diagnosticsFailed: "No se ha podido obtener el diagnóstico",
    diagnosticsCopied: "Diagnóstico copiado.", diagnosticsCopyFailed: "No se ha podido copiar el diagnóstico.", dictionaryExported: "Se ha exportado el diccionario.",
    dictionaryImported: "Palabras importadas. Total: {count}.", importFailed: "No se ha podido importar", settingsSaveFailed: "No se ha podido guardar el estado del corrector",
    alreadyThere: "Esta palabra ya está en el diccionario.", issue_SINO_SI_NO: "Comprueba si quieres decir «sino» (oposición) o «si no» (condición).",
    badgeIssues: "{count} avisos. Abre el resumen del corrector.", badgeIssuesShort: "{count} avisos", badgeNoIssues: "No hay avisos. Abre el resumen del corrector.", badgeNoIssuesShort: "Corrector preparado", reviewingBadge: "Revisando el texto visible.", reviewingBadgeShort: "Revisando…",
    replacementMarkChanged: "La marca ha cambiado. Revisa el texto e inténtalo de nuevo.", replacementInProgress: "Ya se está aplicando una corrección.", tryingReplacement: "Aplicando «{suggestion}» a «{original}»…", rangeValidationFailed: "No se ha podido validar el fragmento. Vuelve a revisar el texto.", issueTextChanged: "El texto ha cambiado desde que se detectó el aviso. Vuelve a revisarlo.", googleDocsApplyFailed: "Google Docs no ha confirmado la sustitución.", googleDocsApplyError: "Se ha producido un error al aplicar la sustitución.", replacementApplied: "Se ha sustituido «{original}» por «{suggestion}».", selectionUnavailable: "No se ha encontrado una selección de texto para revisar.",
    calculatingSuggestions: "Calculando sugerencias…", undo: "Deshacer", dictionaryUndo: "«{word}» se ha añadido al diccionario.", loadingMayTake: "Si el motor se estaba iniciando, la primera revisión puede tardar unos segundos.", engineStillLoading: "El motor todavía se está cargando…", retryWithoutReload: "Puedes esperar o volver a intentarlo sin recargar la página.", analyzing: "Analizando…", analyzingSelection: "Analizando la selección…", retryingReview: "Volviendo a intentarlo…", visibleSuggestions: "{count} sugerencias detectadas.", changeAppliedReviewAgain: "Cambio aplicado. Vuelve a revisar para encontrar más errores.", noSavedReview: "Todavía no hay ninguna revisión guardada. Puedes iniciar una con «Revisar de nuevo».", reviewInterrupted: "La revisión se ha interrumpido: {error}. Puedes volver a intentarlo.", selectionReviewFailed: "No se ha podido completar la revisión de la selección: {error}.", selectionReplaceUnavailable: "La sustitución directa no está disponible para selecciones sin marca visible.", copyDiagnostic: "Copiar diagnóstico", copyFullDiagnostic: "Copiar diagnóstico completo", latestReplacement: "Última sustitución", noReplacementTried: "Todavía no se ha probado ninguna sustitución.", diagnosticCopied: "Diagnóstico copiado.", diagnosticCopyManual: "No se ha podido copiar automáticamente; selecciona el cuadro de texto.", importInvalidList: "El archivo no contiene una lista de palabras.", docsReadFailed: "No he podido leer el texto de Google Docs. Vuelve a cargar el documento con la extensión activada."
  };
  const en = {
    notice: "Notice",
    appTitle: "Lletrium!", actions: "Proofreader actions", supportProject: "Project support", supportBannerTitle: "This extension is free", supportBannerText: "If it has saved you time, any support helps cover maintenance costs.", supportProjectLink: "Support", reportIssue: "Report an issue", reportIssueComingSoon: "The issue reporting link will be available later.", popupAuthor: "Made by: Artur Guasch", popupPrivacyNote: "Proofreading runs locally; your text is not sent to a server.", privacyPolicyLink: "Privacy policy", version: "Version {version}", enabled: "Proofreader enabled", disabled: "Proofreader disabled", galicianSoon: "Galician — coming soon", basqueSoon: "Basque — coming soon", unsupportedSiteMessage: "The proofreader can’t check text on this website. The rest of the extension remains available.", unsupportedExtensionStore: "Browser extension stores block proofreading on their pages.", msOnlineOfficeNotSupported: "This page does not contain an open document to proofread.",
    interfaceLanguage: "Language for menus and messages", interfaceLanguageHelp: "Only changes the extension’s language, not the proofreading language.", theme: "Appearance", preferences: "Preferences", catalan: "Català", spanishInterface: "Español", englishInterface: "English", darkMode: "Dark mode", darkModeHelp: "Changes the proofreader’s appearance.", system: "System", light: "Light", dark: "Dark",
    proofingLanguage: "Language of the text to check", proofingLanguageHelp: "Choose the language the text is written in.", central: "Central Catalan", valencian: "Valencian Catalan", balearic: "Balearic Catalan", spanish: "Spanish", english: "American English",
    spanishSoon: "Spanish — coming soon", englishSoon: "English — coming soon", loading: "Loading the engine…", ready: "Engine ready", engineFailureHelp: "Try reloading the page. If the problem persists, email",
    engineOff: "Proofreader disabled · engine stopped", engineError: "The engine could not be loaded", engineQueryError: "Could not check the engine status", genericEnglishSpelling: "Possible spelling mistake in English.", genericEnglishGrammar: "Review this English construction.",
    dictionary: "Personal dictionary", manageSites: "Disable on websites", dictionaryLanguage: "Dictionary language", dictionaryForProfile: "Words saved for", settings: "Settings", back: "Back", dictionaryHelp: "Added words will no longer be marked as spelling mistakes. They are stored on this device only.",
    newWord: "New word", wordPlaceholder: "Word or acronym", add: "Add", searchDictionary: "Search dictionary", export: "Export", import: "Import",
    noWords: "No saved words yet.", noMatches: "No matches.", remove: "Remove", siteSection: "Disable proofreading on specific websites", checkingSite: "Checking site…",
    siteSectionHelp: "Choose the websites where you want proofreading disabled. It stays on everywhere else.", siteAddressLabel: "Disable proofreading on a website", siteAddressPlaceholder: "example.com or https://example.com/page", siteAddressHelp: "This applies to the whole domain and its subdomains.", siteUnavailable: "This page can’t be managed from the popup.", addSite: "Disable", currentPage: "Current website", disableHere: "Disable on this website", enableHere: "Enable on this website", siteActiveState: "Proofreading is enabled on this website.", siteDisabledState: "Proofreading is disabled on this website.", disabledSites: "Websites with proofreading disabled", noDisabledSites: "You haven’t disabled proofreading on any website.", enableSiteForHost: "Enable proofreading on {host}", invalidSiteAddress: "Enter a valid domain or web link (http or https).", siteAlreadyDisabled: "Proofreading is already disabled on {host} or a parent domain.", siteDisabled: "Proofreading is disabled on {host} and its subdomains.",
    resetAllButton: "Reset extension to defaults", resetConfirmTitle: "Reset the extension?", resetConfirmText: "This will erase your preferences, websites where proofreading is disabled, and your personal dictionary. The extension will return to its initial settings.", cancel: "Cancel", confirmReset: "Yes, reset everything", resetInProgress: "Erasing data…", resetRestarting: "Restarting extension…", resetFailed: "The extension could not be reset",
    disableSite: "Disable proofreading", enableSite: "Enable", privacy: "Privacy", privacyText: "Proofreading runs locally. Your text is not sent to a proofreading service.",
    reviewButtonSection: "Summary button", showReviewButton: "Show the side button", showReviewButtonHelp: "Hide the side or floating button. Errors will still be underlined and you can still correct them.",
    advanced: "Advanced · diagnostics and tests", advancedEngineGroup: "Engine checks", advancedPageGroup: "Inspect a page", advancedPageHelp: "Tools to find out why an editable field is not being checked.", advancedRecordingGroup: "Active page recordings", advancedPerformanceGroup: "Performance", paintRecordingTitle: "Highlights and scrolling", paintRecordingHelp: "Records when underlines appear or disappear as you move through the document.", paintRecordingStart: "Record highlights", paintRecordingCopy: "Copy recording", paintRecordingStopped: "Stopped", readRecordingTitle: "Reading pipeline", readRecordingHelp: "Measures the document reading, analysis, and checking stages.", readRecordingStart: "Record reading process", readRecordingCopy: "Copy recording", readRecordingStopped: "Reading recording stopped", recordingStop: "Stop recording", recordingNeedsDocs: "Open the page you want to record and reopen this menu.", paintRecordingActive: "Recording highlights and scrolling… ({count} events)", paintRecordingStoppedCount: "Stopped · {count} events", paintRecordingCopied: "Copied. Paste the recording here in chat.", readRecordingActive: "Recording reading… ({count} events)", readRecordingStoppedCount: "Stopped · {count} events", readRecordingCopied: "Reading data copied; paste it here.", engineErrorTestMode: "Simulate an engine error", engineErrorTestModeHelp: "Shows the warning on the side button and in the popup without stopping the engine.", engineBadgeFailure: "The engine is unavailable. Warning.", engineTestStatus: "Test mode is on: this is a simulated failure.", fullDiagnostics: "Full diagnostics", analyzeEditorPage: "Analyze editor and fields", copyEditorAnalysis: "Copy analysis", editorAnalysisHelp: "Click the field that is failing first. The report shows structure and state, without your text.", editorAnalysisNoTab: "Open the tab you want to analyze and try again.", editorAnalysisDone: "Analysis complete", editorAnalysisFields: "fields", editorAnalysisActive: "active editors", editorAnalysisFailed: "Page analysis failed.", editorAnalysisCopied: "Analysis copied.", paragraphInteractionDiagnosticsHint: "To detect reruns: apply a suggestion, add a word to the dictionary, or type until text wraps to a new line. Wait 7 seconds, then collect full diagnostics. It records line, highlight, and check changes without saving text.", coldStart: "Cold-start check", preload: "Prepare engine", copy: "Copy",
    debounce: "Pause before checking (ms)", maxText: "Maximum text length", save: "Save", spelling: "Spelling", grammar: "Grammar", style: "Style",
    close: "Close", noSuggestion: "No automatic suggestion.", applying: "Applying…", applyingCorrection: "Applying correction…", ignoreOnce: "Ignore once",
    addToDictionary: "Add to dictionary", undo: "Undo", goToIssue: "Go to issue", moreSuggestions: "More suggestions", calculating: "Calculating…",
    contextualSuggestions: "Contextual suggestions", noMoreSuggestions: "No more suggestions", suggestionsFailed: "Could not load suggestions",
    applyFailed: "Could not apply the correction. Try again.", reviewAgain: "Check again", reviewing: "Checking visible text…", analyze: "Checking…",
    reviewVisible: "Check visible text", reviewSelection: "Check selection", noIssues: "No issues in the visible text.",
    docsScanHint: "Google Docs is checked in sections as you move through the document.", issueCount: "{count} issues in the visible text",
    unableConfirmField: "Could not confirm the change in this field.", editorRejected: "The editor did not accept the correction.", unableConfirmEditor: "Could not confirm the correction in the editor.",
    genericSpelling: "Possible spelling mistake.", genericGrammar: "Review this Catalan construction.", spellingError: "Possible spelling mistake.",
    genericSpanishSpelling: "Possible spelling mistake in Spanish.", genericSpanishGrammar: "Review this Spanish construction.",
    capitalization: "This sentence does not start with a capital letter.", inconsistent: "This form is inconsistent with the rest of the text.", originalExplanation: "Original rule explanation",
    selectIssueToGo: "Select an issue to jump to it.", suggestionsFor: "Suggestions for", issue: "the issue", noIssuesReviewed: "No issues in the reviewed text.", notCheckedActive: "The active field has not been checked yet.",
    noCompatibleField: "There are no compatible text fields on this page.", reviewActiveField: "Check active field", reviewingField: "Checking the field…",
    disableCurrentDocument: "Disable on this document", enableCurrentDocument: "Enable on this document", currentDocumentDisabled: "The proofreader is disabled on this document.",
    docsDetectionLabel: "Check this document", docsDetectionOn: "On", docsDetectionOff: "Off", docsToolbarEnable: "Enable proofreading on this document", docsToolbarDisable: "Disable proofreading on this document", openExtensionPopup: "Open extension popup",
    openSummary: "Open the proofreader summary", reviewSummary: "Proofreader summary", closeSummary: "Close the summary", issueCountReviewed: "{count} issues in the reviewed text", showMoreIssues: "Show {count} more issues",
    applied: "Applied", suggestionApplied: "Applied “{suggestion}”. ",
    spellingAdded: "“{word}” was added to your dictionary.", duplicateWord: "This word is already in the dictionary.", wordAdded: "“{word}” was added to your dictionary.", wordRemoved: "“{word}” was removed from your dictionary.", unsupportedSiteExclusion: "This type of page does not support site exclusions.",
    enable: "Enable", siteEnabled: "Proofreader enabled on {host}.", siteDisabled: "Proofreader disabled on {host}.", preferencesSaved: "Preferences saved.",
    runningColdStart: "Running the cold-start check…", collectingDiagnostics: "Collecting diagnostics…", diagnosticsFailed: "Could not retrieve diagnostics",
    diagnosticsCopied: "Diagnostics copied.", diagnosticsCopyFailed: "Could not copy diagnostics.", dictionaryExported: "Dictionary exported.",
    dictionaryImported: "Words imported. Total: {count}.", importFailed: "Could not import", settingsSaveFailed: "Could not save the proofreader state",
    alreadyThere: "This word is already in the dictionary.", issue_SINO_SI_NO: "Check whether you mean ‘but’ (sinó) or ‘if not’ (si no).",
    badgeIssues: "{count} issues. Open the proofreader summary.", badgeIssuesShort: "{count} issues", badgeNoIssues: "No issues. Open the proofreader summary.", badgeNoIssuesShort: "Proofreader ready", reviewingBadge: "Checking visible text.", reviewingBadgeShort: "Checking…",
    replacementMarkChanged: "The mark has changed. Check the text and try again.", replacementInProgress: "A correction is already being applied.", tryingReplacement: "Applying ‘{suggestion}’ to ‘{original}’…", rangeValidationFailed: "Could not validate this text range. Check the text again.", issueTextChanged: "The text has changed since this issue was found. Check it again.", googleDocsApplyFailed: "Google Docs did not confirm the replacement.", googleDocsApplyError: "An error occurred while applying the replacement.", replacementApplied: "Replaced ‘{original}’ with ‘{suggestion}’.", selectionUnavailable: "No text selection was found to check.",
    calculatingSuggestions: "Calculating suggestions…", undo: "Undo", dictionaryUndo: "‘{word}’ was added to the dictionary.", loadingMayTake: "If the engine was starting up, the first check may take a few seconds.", engineStillLoading: "The engine is still loading…", retryWithoutReload: "You can wait or try again without reloading the page.", analyzing: "Checking…", analyzingSelection: "Checking the selection…", retryingReview: "Trying again…", visibleSuggestions: "{count} suggestions found.", changeAppliedReviewAgain: "Change applied. Check again to find more issues.", noSavedReview: "There is no saved check yet. Start one with ‘Check again’.", reviewInterrupted: "The check was interrupted: {error}. You can try again.", selectionReviewFailed: "The selected text could not be checked: {error}.", selectionReplaceUnavailable: "Direct replacement is unavailable for selections without a visible mark.", copyDiagnostic: "Copy diagnostics", copyFullDiagnostic: "Copy full diagnostics", latestReplacement: "Latest replacement", noReplacementTried: "No replacement has been tried yet.", diagnosticCopied: "Diagnostics copied.", diagnosticCopyManual: "Could not copy automatically; select the text box.", importInvalidList: "The file does not contain a word list.", docsReadFailed: "Could not read the Google Docs text. Reload the document with the extension enabled."
  };
  // LanguageTool's Catalan rules supply Catalan explanations. Translate the
  // common reusable messages locally so the UI can explain them without a
  // network service; rule-specific Catalan remains available as a fallback.
  const explanationTranslations = {
    es: {
      "Expressió incorrecta.": "Expresión incorrecta.",
      "Error de concordança.": "Error de concordancia.",
      "Val més usar una altra expressió.": "Es preferible usar otra expresión.",
      "Val més fer servir una altra expressió.": "Es preferible utilizar otra expresión.",
      "Possible error de concordança.": "Posible error de concordancia.",
      "Possible error de concordança o falta de concordança.": "Posible error de concordancia.",
      "Probablement cal usar el verb 'sentir' (percebre, tenir notícia). 'Escoltar' vol dir parar atenció, atendre o obeir.": "Probablemente corresponde usar el verbo «sentir» (percibir, tener noticia). «Escoltar» significa prestar atención, atender u obedecer.",
      "Paraula admesa només en alguns diccionaris.": "Palabra admitida solo en algunos diccionarios.",
      "Paraula només admesa per alguns diccionaris.": "Palabra admitida solo por algunos diccionarios.",
      "Construcció incorrecta.": "Construcción incorrecta.",
      "Possible confusió.": "Posible confusión.",
      "S'escriu junt.": "Se escribe junto.",
      "Si és un adjectiu o un nom, s'escriu amb accent.": "Si es un adjetivo o un sustantivo, lleva tilde.",
      "Cal apostrofar.": "Debe escribirse con apóstrofo.",
      "Possible error de traducció automàtica.": "Posible error de traducción automática.",
      "Possible error ortogràfic.": "Posible error ortográfico.",
      "Probablement hi falta el pronom 'en'.": "Probablemente falta el pronombre «en».",
      "Expressió preferible.": "Expresión preferible.",
      "Combinació incorrecta de pronoms febles.": "Combinación incorrecta de pronombres débiles.",
      "Podeu usar una altra expressió per a fer més natural la frase.": "Puedes usar otra expresión para que la frase suene más natural.",
      "Combinació col·loquial de pronoms febles.": "Combinación coloquial de pronombres débiles.",
      "Ús abusiu del v. 'realitzar'. Considereu una opció alternativa.": "Uso excesivo del verbo «realitzar». Considera una alternativa.",
      "Forma de pronom feble incorrecta.": "Forma incorrecta del pronombre débil.",
      "Reviseu la construcció de relatiu. És incorrecta si es pot substituir per algun dels suggeriments.": "Revisa la construcción de relativo. Es incorrecta si puede sustituirse por alguna de las sugerencias.",
      "És recomanable eliminar aquest possessiu redundant.": "Se recomienda eliminar este posesivo redundante.",
      "En aquest context, val més usar un altre verb.": "En este contexto, es preferible usar otro verbo.",
      "Aquesta expressió és un calc del castellà.": "Esta expresión es un calco del castellano.",
      "Aquesta locució s'escriu normalment entre comes.": "Esta locución suele escribirse entre comas.",
      "Possible falta de concordança.": "Posible falta de concordancia.",
      "Probablement hi falta una coma.": "Probablemente falta una coma.",
      "Apostrofació incorrecta.": "Uso incorrecto del apóstrofo.",
      "Si és una forma del v. 'diferenciar', s'escriu sense accent.": "Si es una forma del verbo «diferenciar», se escribe sin tilde.",
      "Hi falta un guionet.": "Falta un guion.",
      "S'escriu junt sense guionet.": "Se escribe junto, sin guion.",
      "Si és del verb 'haver', s'escriu amb hac.": "Si pertenece al verbo «haver», se escribe con h.",
      "Amb el sentit de 'quina cosa', s'escriu amb accent.": "Con el significado de «qué cosa», lleva tilde.",
      "Possible castellanisme.": "Posible castellanismo.",
      "Castellanisme.": "Castellanismo.",
      "Sobra un espai.": "Sobra un espacio.",
      "Forma secundària.": "Forma secundaria.",
      "Expressió redundant.": "Expresión redundante.",
      "Val més usar el v. 'fer'.": "Es preferible usar el verbo «fer» (hacer).",
      "Expressió incorrecta si equival a 'apoderar-se' o 'aconseguir'.": "Expresión incorrecta si significa «apoderarse» o «conseguir».",
      "No s'apostrofa.": "No se escribe con apóstrofo.",
      "Error d'ortografia.": "Error ortográfico.",
      "Calc del castellà.": "Calco del castellano.",
      "S'accentua si és del v. 'tenir'.": "Lleva tilde si pertenece al verbo «tenir» (tener).",
      "Paraula incorrecta.": "Palabra incorrecta.",
      "Probablement hi falta el pronom feble 'en'.": "Probablemente falta el pronombre débil «en».",
      "Hi falta un espai.": "Falta un espacio.",
      "Incorrecte com a perífrasi d'obligació.": "Es incorrecto como perífrasis de obligación.",
      "Hi falta un apòstrof.": "Falta un apóstrofo.",
      "Llenguatge col·loquial.": "Lenguaje coloquial.",
      "Perífrasi verbal incorrecta.": "Perífrasis verbal incorrecta.",
      "Aquest verb és transitiu i s'usa sense la preposició 'de'.": "Este verbo es transitivo y se usa sin la preposición «de».",
      "Els anys s'escriuen sense la preposició 'a'.": "Los años se escriben sin la preposición «a».",
      "No s'accentua si és un nom (període de 28-31 dies).": "No lleva tilde cuando es un sustantivo (periodo de 28 a 31 días).",
      "¿Volíeu dir __SUGGESTION_1__ ?": "¿Querías decir «{suggestion1}»?",
      "¿Volíeu dir __SUGGESTION_1__?": "¿Querías decir «{suggestion1}»?",
      "La preposició adequada és __SUGGESTION_1__.": "La preposición adecuada es «{suggestion1}».",
      "Probablement cal dir __SUGGESTION_1__ (complement indirecte). La forma \"els hi\" és col·loquial.": "Probablemente corresponde usar «{suggestion1}» (complemento indirecto). La forma «els hi» es coloquial.",
      "Aquesta frase no comença amb majúscula.": "La frase no empieza con mayúscula.",
      "No és coherent usar «{word}» i «{preferred}» dins d'un mateix text.": "No es coherente usar «{word}» y «{preferred}» en un mismo texto."
      ,"Només és correcte en el sentit de 'aparèixer' (DNV). Per a altres sentits useu altres expressions.": "Solo es correcta con el sentido de «aparecer». Para los demás sentidos, usa otras expresiones."
      ,"Paraula admesa només en alguns diccionaris, i només com a verb intransitiu.": "Palabra admitida solo en algunos diccionarios y únicamente como verbo intransitivo."
      ,"Si és nom, porta accent.": "Si es un sustantivo, lleva tilde."
      ,"Possible error d'ortografia.": "Posible error ortográfico."
      ,"Paraula admesa només en alguns diccionaris. Val més fer servir un verb alternatiu.": "Palabra admitida solo en algunos diccionarios. Es preferible usar otro verbo."
      ,"Construcció probablement incorrecta.": "Construcción probablemente incorrecta."
      ,"Expressió probablement incorrecta.": "Expresión probablemente incorrecta."
      ,"Forma preferible.": "Forma preferible."
      ,"En tipografia acurada, useu cometes tipogràfiques.": "En tipografía cuidada, usa comillas tipográficas."
      ,"Error ortogràfic.": "Error ortográfico."
      ,"Possible confusió o falta de concordança.": "Posible confusión o falta de concordancia."
      ,"Ús abusiu del v. '\\1'. Considereu una opció alternativa.": "Uso excesivo del verbo «\\1». Considera una alternativa."
      ,"Amb valor abstractiu val més usar una altra construcció.": "Con sentido abstracto, es preferible usar otra construcción."
      ,"En aquest cas, cal usar el verb 'fer'.": "En este caso, hay que usar el verbo «fer» (hacer)."
      ,"Probablement cal usar una altra expressió.": "Probablemente conviene usar otra expresión."
      ,"S'accentua quan és una afirmació.": "Lleva tilde cuando expresa una afirmación."
      ,"S'escriu sense guionet.": "Se escribe sin guion."
      ,"Hi falta un article.": "Falta un artículo."
      ,"Construcció dubtosa: gerundi de posterioritat. Proveu de reescriure la frase sense el gerundi.": "Construcción dudosa: gerundio de posterioridad. Prueba a reformular la frase sin el gerundio."
      ,"Val més usar 'prou'.": "Es preferible usar «prou»."
      ,"Si és un nom, s'escriu amb accent.": "Si es un sustantivo, lleva tilde."
      ,"Expressió inadequada.": "Expresión inadecuada."
      ,"Expressió incoherent.": "Expresión incoherente."
      ,"Combinació de pronoms febles incorrecta.": "Combinación incorrecta de pronombres débiles."
      ,"Useu accentuació general.": "Aplica las reglas generales de acentuación."
      ,"Hi falta un verb en condicional.": "Falta un verbo en condicional."
      ,"Expressió incorrecta si equival a 'guanyar'.": "Expresión incorrecta si significa «ganar»."
      ,"Podeu millorar la redacció usant una altra expressió.": "Puedes mejorar la redacción usando otra expresión."
      ,"Hi falta la preposició 'a'.": "Falta la preposición «a»."
      ,"El més probable és que calgui usar el pronom 'en', que substitueix un complement introduït per la preposició 'de'.": "Lo más probable es que haya que usar el pronombre «en», que sustituye un complemento introducido por la preposición «de»."
      ,"És preferible un altre ordre o una altra expressió.": "Es preferible otro orden u otra expresión."
      ,"El v. 'contactar' és intransitiu i el complement que l'acompanya s'introdueix amb la preposició 'amb'.": "El verbo «contactar» es intransitivo y su complemento se introduce con la preposición «amb»."
      ,"Dos articles seguits.": "Hay dos artículos seguidos."
      ,"Sobra la preposició 'a'.": "Sobra la preposición «a»."
      ,"En aquest context val més usar un altre verb.": "En este contexto, es preferible usar otro verbo."
      ,"Possible error de traductor automàtic.": "Posible error de traducción automática."
      ,"En aquest context cal dir __SUGGESTION_1__. ": "En este contexto, hay que decir «{suggestion1}»."
      ,"Val més dir __SUGGESTION_1__. ": "Es preferible decir «{suggestion1}»."
      ,"En aquest context val més evitar l'adjectiu \"__SUGGESTION_1__\".": "En este contexto, es preferible evitar el adjetivo «{suggestion1}»."
      ,"Aquest verb no és incoatiu.": "Este verbo no es incoativo."
      ,"Aquest verb no és pronominal. Probablement sobra un pronom.": "Este verbo no es pronominal. Probablemente sobra un pronombre."
      ,"Construcció redundant.": "Construcción redundante."
      ,"Sobra la preposició 'a'.": "Sobra la preposición «a»."
      ,"Falta un espai després del punt.": "Falta un espacio después del punto."
      ,"Els símbols no s'apostrofen.": "Los símbolos no llevan apóstrofo."
      ,"Considereu usar un sinònim per a evitar la repetició de \"\\1\" i \"\\2\".": "Considera usar sinónimos para evitar repetir «\\1» y «\\2»."
      ,"Feu més fluida la redacció prescindint del verb comodí 'procedir'.": "Mejora la fluidez omitiendo el verbo comodín «procedir»."
      ,"Val més usar una altra expressió més natural.": "Es preferible usar otra expresión más natural."
      ,"Expressió incorrecta. Useu els verbs 'caldre' o 'deure', o bé completeu la perífrasi 'haver de + infinitiu'.": "Expresión incorrecta. Usa los verbos «caldre» o «deure», o completa la perífrasis «haver de + infinitivo»."
      ,"Error tipogràfic.": "Error tipográfico."
      ,"Quan ens referim al dia de la setmana immediatament anterior o posterior, no s'usa l'article.": "Al referirse al día de la semana inmediatamente anterior o posterior, no se usa el artículo."
      ,"Aquest possessiu és probablement redundant. Val més eliminar-lo.": "Este posesivo probablemente es redundante. Es preferible eliminarlo."
      ,"És preferible evitar la perífrasi \"estar + gerundi\" per a fer més fluida la redacció.": "Es preferible evitar la perífrasis «estar + gerundio» para dar más fluidez al texto."
      ,"En texts formals eviteu l'article salat.": "En textos formales, evita el artículo salado."
      ,"Useu una altra expressió per a evitar el «'lo' neutre».": "Usa otra expresión para evitar el «lo» neutro."
      ,"Amb el sentit de 'per quina raó' s'escriu separat.": "Con el sentido de «por qué razón», se escribe separado."
      ,"Combinació impossible de pronom i verb.": "Combinación imposible de pronombre y verbo."
      ,"El pronom 'en' probablement és redundant.": "El pronombre «en» probablemente es redundante."
      ,"Eviteu aquest castellanisme.": "Evita este calco del castellano."
      ,"Combinació incorrecta de preposicions.": "Combinación incorrecta de preposiciones."
      ,"Confusió.": "Confusión."
      ,"Probablement hi falta la preposició 'a'.": "Probablemente falta la preposición «a»."
      ,"Construcció incorrecta: \"com + subjuntiu\" condicional.": "Construcción incorrecta: «com + subjuntivo» condicional."
      ,"El verb 'despertar-se', si no és transitiu, s'ha de fer pronominal.": "El verbo «despertar-se», si no es transitivo, debe usarse como pronominal."
      ,"És preferible usar una construcció amb un subjecte explícit.": "Es preferible usar una construcción con sujeto explícito."
      ,"Combinació impossible de preposicions.": "Combinación imposible de preposiciones."
      ,"Repetició probablement incorrecta.": "Probablemente hay una repetición incorrecta."
      ,"Amb sentit causal, val més usar una altra construcció.": "Con sentido causal, es preferible usar otra construcción."
      ,"Hi falta un infinitiu.": "Falta un infinitivo."
      ,"S'escriu amb guionet.": "Se escribe con guion."
      ,"En llenguatge formal, és preferible conjugar l'impersonal \"haver-hi\" en singular.": "En registros formales, es preferible conjugar en singular el impersonal «haver-hi»."
      ,"Verb incorrecte.": "Verbo incorrecto."
      ,"Cal evitar el «'lo' neutre».": "Hay que evitar el «lo» neutro."
      ,"No s'apostrofa davant de hac aspirada.": "No se usa apóstrofo delante de una h aspirada."
      ,"Aquesta expressió és redundant i un possible calc de l'anglès.": "Esta expresión es redundante y puede ser un calco del inglés."
      ,"S'escriu junt sense guionets.": "Se escribe junto y sin guiones."
      ,"Sembla més adequat el nom en plural.": "Parece más adecuado el sustantivo en plural."
      ,"Aquest verb és transitiu i cal eliminar la preposició 'a'.": "Este verbo es transitivo; hay que eliminar la preposición «a»."
      ,"Aquest verb és transitiu. Feu servir el pronom adequat.": "Este verbo es transitivo. Usa el pronombre adecuado."
      ,"Feu la redacció més fluida usant un altre verb.": "Mejora la fluidez del texto usando otro verbo."
      ,"Si equival a \"quina cosa\", cal escriure <suggestion>què</suggestion>.": "Si equivale a «qué cosa», hay que escribir «què»."
      ,"\"Recent\" no és un adverbi.": "«Recent» no es un adverbio."
      ,"Si és verb, cal dir \"reflectir\".": "Si es un verbo, debe usarse «reflectir»."
      ,"És preferible usar el verb \"continuar\" o construir la frase amb \"encara\".": "Es preferible usar el verbo «continuar» o construir la frase con «encara»."
      ,"Construcció incorrecta com a perífrasi d'obligació.": "Construcción incorrecta como perífrasis de obligación."
      ,"D'acord amb el Termcat, és preferible usar una altra expressió.": "Según el Termcat, es preferible usar otra expresión."
      ,"Probablement cal escriure <suggestion>com a</suggestion> ('en qualitat de', 'amb caràcter de', 'en funció de').": "Probablemente corresponde escribir «com a» («en calidad de», «con carácter de», «en función de»)."
      ,"Val més dir <suggestion>prou</suggestion>.": "Es preferible decir «prou»."
      ,"En aquest context cal dir <suggestion>altura</suggestion>.": "En este contexto, hay que decir «altura»."
      ,"Cal escriure <suggestion>tant</suggestion> en l'expressió \"tant... com...\".": "En la expresión «tant... com...», hay que escribir «tant»."
      ,"Si equival a \"quina cosa\", cal escriure <suggestion>què</suggestion>.": "Si equivale a «qué cosa», hay que escribir «què»."
      ,"El verb 'témer' no és pronominal. Useu una expressió alternativa.": "El verbo «témer» no es pronominal. Usa otra expresión."
      ,"En registres formals usem la forma verbal sense el prefix 'en-'. El pronom 'en' substitueix un complement que comença amb la preposició 'de'.": "En registros formales, se usa la forma verbal sin el prefijo «en-». El pronombre «en» sustituye un complemento introducido por «de»."
      ,"En llenguatge formal, és preferible conjugar l'impersonal \"haver-hi\" en singular.": "En registros formales, es preferible conjugar en singular el impersonal «haver-hi»."
      ,"Si és un pronom interrogatiu (=quina cosa), s'escriu amb accent. S'escriu sense accent si la resposta és \"sí\" o \"no\" (\"Que vindràs?\").": "Si es un pronombre interrogativo (equivale a «qué cosa»), lleva tilde. Se escribe sin tilde cuando la respuesta es «sí» o «no» («Que vindràs?»)."
      ,"Aquesta expressió és redundant. Escriviu __SUGGESTION_1__ o __SUGGESTION_2__. ": "Esta expresión es redundante. Escribe «{suggestion1}» o «{suggestion2}»."
      ,"En aquest cas val més evitar l'adjectiu \"\\2\".": "En este caso, es preferible evitar el adjetivo «\\2»."
      ,"En aquest cas val més evitar l'adjectiu \"\\1\".": "En este caso, es preferible evitar el adjetivo «\\1»."
      ,"En aquest context (\\1), \"sever\" pot ser un calc inapropiat de l'anglès.": "En este contexto (\\1), «sever» puede ser un calco inadecuado del inglés."
      ,"No useu com a pronominal aquest verb, o bé afegiu-hi el pronom 'en'.": "No uses este verbo como pronominal o añade el pronombre «en»."
      ,"\"Alumnat\" és un nom col·lectiu. No és correcte en aquest context.": "«Alumnat» es un sustantivo colectivo. No es correcto en este contexto."
      ,"\"Professorat\" és un nom col·lectiu. No és correcte en aquest context.": "«Professorat» es un sustantivo colectivo. No es correcto en este contexto."
      ,"Majúscules i minúscules recomanades.": "Uso recomendado de mayúsculas y minúsculas."
      ,"Si no indica moviment, val més fer servir una altra expressió: elimineu el verb anar i useu el present o el futur.": "Si no indica movimiento, es preferible otra expresión: elimina el verbo «anar» y usa el presente o el futuro."
      ,"Si és nom, cal accentuar-lo.": "Si es un sustantivo, lleva tilde."
      ,"Si és del v. 'saber', s'accentua.": "Si es una forma del verbo «saber», lleva tilde."
      ,"Aquesta locució s'escriu normalment entre comes. Feu servir un punt i coma per a començar una frase nova que contrasta amb l'anterior.": "Esta locución suele escribirse entre comas. Usa un punto y coma para iniciar una frase nueva que contraste con la anterior."
      ,"Expressió incorrecta amb el sentit de 'fermesa, zel'.": "Expresión incorrecta con el sentido de «firmeza, celo»."
      ,"S'accentua quan és del verb 'ser'.": "Lleva tilde cuando es una forma del verbo «ser»."
      ,"És preferible usar una altra expressió.": "Es preferible usar otra expresión."
      ,"¿Volíeu dir __SUGGESTION_1__? \"Seria\" és una forma del verb 'ser'.": "¿Querías decir «{suggestion1}»? «Seria» es una forma del verbo «ser»."
      ,"Expressió incorrecta amb valor de censura o èmfasi.": "Expresión incorrecta con valor de censura o énfasis."
      ,"Aquest verb és transitiu. Potser cal canviar el pronom.": "Este verbo es transitivo. Quizá haya que cambiar el pronombre."
      ,"Val més prescindir del pronom '\\3', especialment si no es refereix a persones.": "Es preferible prescindir del pronombre «\\3», especialmente si no se refiere a personas."
      ,"És preferible fer servir una altra expressió.": "Es preferible usar otra expresión."
      ,"Els anys s'escriuen sense punt.": "Los años se escriben sin punto."
      ,"Possible calc del castellà.": "Posible calco del castellano."
      ,"Si no indica moviment, la preposició adequada és __SUGGESTION_1__.": "Si no indica movimiento, la preposición adecuada es «{suggestion1}»."
      ,"Aquesta expressió és un castellanisme.": "Esta expresión es un calco del castellano."
      ,"Quantitat probablement incorrecta. Recordeu que un 'billion' en anglès correspon a 1.000 milions.": "Cantidad probablemente incorrecta. Recuerda que «billion» en inglés equivale a mil millones."
      ,"Probablement cal canviar la preposició.": "Probablemente hay que cambiar la preposición."
      ,"Paraula pròpia del llenguatge col·loquial. Només admesa per alguns diccionaris.": "Palabra propia del lenguaje coloquial. Admitida solo por algunos diccionarios."
      ,"Possible paraula mal partida.": "Posible división incorrecta de una palabra."
      ,"Forma col·loquial.": "Forma coloquial."
      ,"Probablement sobra la coma entre subjecte i predicat.": "Probablemente sobra la coma entre el sujeto y el predicado."
      ,"Pronom feble incorrecte.": "Pronombre débil incorrecto."
      ,"Possible confusió entre la lletra ela minúscula i la lletra i majúscula (nombres romans).": "Posible confusión entre la letra ele minúscula y la i mayúscula (números romanos)."
      ,"Si és un adjectiu i no un gerundi, cal dir __SUGGESTION_1__.": "Si es un adjetivo y no un gerundio, debe decirse «{suggestion1}»."
      ,"Possible error de picatge.": "Posible error de tecleo."
      ,"Temps verbal probablement incorrecte. ¿Volíeu dir __SUGGESTION_1__?": "Tiempo verbal probablemente incorrecto. ¿Querías decir «{suggestion1}»?"
      ,"En aquest context l'expressió adequada és __SUGGESTION_1__.": "En este contexto, la expresión adecuada es «{suggestion1}»."
      ,"Construcció incorrecta si equival a __SUGGESTION_1__.": "Construcción incorrecta si equivale a «{suggestion1}»."
      ,"Falta un espai després del punt i no abans.": "Falta un espacio después del punto, no antes."
      ,"Combinació impossible de pronoms i verb.": "Combinación imposible de pronombres y verbo."
      ,"Si és una forma del verb 'evidenciar', s'escriu sense accent.": "Si es una forma del verbo «evidenciar», se escribe sin tilde."
      ,"Si és conjunció, cal escriure __SUGGESTION_1__.": "Si es una conjunción, debe escribirse «{suggestion1}»."
      ,"Amb el sentit de 'finalitat, propòsit', \"fi\" és masculí.": "Con el sentido de «finalidad, propósito», «fi» es masculino."
      ,"Verb inadequat en aquesta expressió.": "Verbo inadecuado en esta expresión."
      ,"En aquesta frase el verb adequat és 'posar'.": "En esta frase, el verbo adecuado es «posar»."
      ,"Aquesta construcció d'infinitiu sense un verb principal és inadequada.": "Esta construcción de infinitivo sin un verbo principal es inadecuada."
      ,"S'escriu separat.": "Se escribe separado."
      ,"Si es refereix a un complement en plural, cal dir __SUGGESTION_1__.": "Si se refiere a un complemento en plural, debe decirse «{suggestion1}»."
      ,"El pronom adequat és \"li\".": "El pronombre adecuado es «li»."
      ,"Anglicisme innecessari. Considereu fer servir una altra expressió.": "Anglicismo innecesario. Considera usar otra expresión."
      ,"Amb el sentit de 'opinió' cal dir __SUGGESTION_1__.": "Con el sentido de «opinión», debe decirse «{suggestion1}»."
      ,"Ús pronominal incorrecte. Canvieu l'expressió o elimineu el pronom reflexiu.": "Uso pronominal incorrecto. Cambia la expresión o elimina el pronombre reflexivo."
      ,"La preposició adequada és 'per a'.": "La preposición adecuada es «per a»."
      ,"Probablement cal usar la preposició __SUGGESTION_1__.": "Probablemente hay que usar la preposición «{suggestion1}»."
      ,"Normalment s'escriu junt, sense guionet.": "Normalmente se escribe junto, sin guion."
      ,"Ordenació inadequada dels pronoms en un registre formal.": "Orden incorrecto de los pronombres en un registro formal."
      ,"En les expressions d'hores, usem el punt o els dos punts (sistema internacional).": "Para expresar las horas, se usa el punto o los dos puntos (sistema internacional)."
      ,"El plural de les sigles no es marca gràficament.": "El plural de las siglas no se marca gráficamente."
      ,"Probablement cal usar la conjunció adversativa __SUGGESTION_1__.": "Probablemente hay que usar la conjunción adversativa «{suggestion1}»."
      ,"Si és una afirmació, s'escriu amb accent.": "Si expresa una afirmación, lleva tilde."
      ,"És preferible escriure aquest nombre amb lletres.": "Es preferible escribir este número con letras."
      ,"Cal escriure __SUGGESTION_1__.": "Debe escribirse «{suggestion1}»."
      ,"En aquest context, val més usar un verb més precís.": "En este contexto, es preferible usar un verbo más preciso."
      ,"Aquesta paraula és usual en valencià, però no en altres varietats.": "Esta palabra es habitual en valenciano, pero no en las demás variedades."
      ,"Probablement cal escriure __SUGGESTION_1__ ('en qualitat de', 'amb caràcter de', 'en funció de').": "Probablemente corresponde escribir «{suggestion1}» («en calidad de», «con carácter de», «en función de»)."
      ,"Cal escriure __SUGGESTION_1__ en l'expressió \"tant... com...\".": "En la expresión «tant... com...», hay que escribir «{suggestion1}»."
    },
    en: {
      "Expressió incorrecta.": "Incorrect expression.",
      "Error de concordança.": "Agreement error.",
      "Val més usar una altra expressió.": "Another expression is preferable.",
      "Val més fer servir una altra expressió.": "Another expression is preferable.",
      "Possible error de concordança.": "Possible agreement error.",
      "Probablement cal usar el verb 'sentir' (percebre, tenir notícia). 'Escoltar' vol dir parar atenció, atendre o obeir.": "Use «sentir» (to perceive or hear about something) here. «Escoltar» means to pay attention, listen, or obey.",
      "Paraula admesa només en alguns diccionaris.": "This word is accepted by only some dictionaries.",
      "Paraula només admesa per alguns diccionaris.": "This word is accepted by only some dictionaries.",
      "Construcció incorrecta.": "Incorrect construction.",
      "Possible confusió.": "Possible confusion.",
      "S'escriu junt.": "Write this as one word.",
      "Si és un adjectiu o un nom, s'escriu amb accent.": "If it is an adjective or noun, it takes an accent mark.",
      "Cal apostrofar.": "Use an apostrophe.",
      "Possible error de traducció automàtica.": "Possible machine-translation error.",
      "Possible error ortogràfic.": "Possible spelling mistake.",
      "Probablement hi falta el pronom 'en'.": "The pronoun «en» is probably missing.",
      "Expressió preferible.": "Preferred expression.",
      "Combinació incorrecta de pronoms febles.": "Incorrect combination of weak pronouns.",
      "Podeu usar una altra expressió per a fer més natural la frase.": "You can use another expression to make the sentence sound more natural.",
      "Combinació col·loquial de pronoms febles.": "Colloquial combination of weak pronouns.",
      "Ús abusiu del v. 'realitzar'. Considereu una opció alternativa.": "The verb «realitzar» is overused here. Consider an alternative.",
      "Forma de pronom feble incorrecta.": "Incorrect form of a weak pronoun.",
      "Reviseu la construcció de relatiu. És incorrecta si es pot substituir per algun dels suggeriments.": "Review the relative clause. It is incorrect if one of the suggestions can replace it.",
      "És recomanable eliminar aquest possessiu redundant.": "Consider removing this redundant possessive.",
      "En aquest context, val més usar un altre verb.": "A different verb is preferable in this context.",
      "Aquesta expressió és un calc del castellà.": "This expression is calqued from Spanish.",
      "Aquesta locució s'escriu normalment entre comes.": "This phrase is usually set off with commas.",
      "Possible falta de concordança.": "Possible agreement error.",
      "Probablement hi falta una coma.": "A comma is probably missing.",
      "Apostrofació incorrecta.": "Incorrect apostrophe use.",
      "Si és una forma del v. 'diferenciar', s'escriu sense accent.": "If this is a form of «diferenciar», it is written without an accent mark.",
      "Hi falta un guionet.": "A hyphen is missing.",
      "S'escriu junt sense guionet.": "Write this as one word, without a hyphen.",
      "Si és del verb 'haver', s'escriu amb hac.": "If this is a form of «haver», it is written with h.",
      "Amb el sentit de 'quina cosa', s'escriu amb accent.": "When it means ‘what thing’, it takes an accent mark.",
      "Possible castellanisme.": "Possible Spanish calque.",
      "Castellanisme.": "Spanish calque.",
      "Sobra un espai.": "There is an extra space.",
      "Forma secundària.": "Secondary form.",
      "Expressió redundant.": "Redundant expression.",
      "Val més usar el v. 'fer'.": "Use «fer» (to do or make) here.",
      "Expressió incorrecta si equival a 'apoderar-se' o 'aconseguir'.": "This expression is incorrect when it means ‘to take possession of’ or ‘to obtain’.",
      "No s'apostrofa.": "Do not use an apostrophe here.",
      "Error d'ortografia.": "Spelling error.",
      "Calc del castellà.": "Spanish calque.",
      "S'accentua si és del v. 'tenir'.": "It takes an accent mark if it is a form of «tenir» (to have).",
      "Paraula incorrecta.": "Incorrect word.",
      "Probablement hi falta el pronom feble 'en'.": "The weak pronoun «en» is probably missing.",
      "Hi falta un espai.": "A space is missing.",
      "Incorrecte com a perífrasi d'obligació.": "Incorrect as an obligation construction.",
      "Hi falta un apòstrof.": "An apostrophe is missing.",
      "Llenguatge col·loquial.": "Colloquial language.",
      "Perífrasi verbal incorrecta.": "Incorrect verb construction.",
      "Aquest verb és transitiu i s'usa sense la preposició 'de'.": "This verb is transitive and is used without the preposition «de».",
      "Els anys s'escriuen sense la preposició 'a'.": "Years are written without the preposition ‘a’.",
      "No s'accentua si és un nom (període de 28-31 dies).": "It has no accent mark when used as a noun (a 28–31 day period).",
      "¿Volíeu dir __SUGGESTION_1__ ?": "Did you mean ‘{suggestion1}’?",
      "¿Volíeu dir __SUGGESTION_1__?": "Did you mean ‘{suggestion1}’?",
      "La preposició adequada és __SUGGESTION_1__.": "The correct preposition is ‘{suggestion1}’.",
      "Probablement cal dir __SUGGESTION_1__ (complement indirecte). La forma \"els hi\" és col·loquial.": "Use ‘{suggestion1}’ for the indirect object here. The form «els hi» is colloquial.",
      "Aquesta frase no comença amb majúscula.": "This sentence does not start with a capital letter."
      ,"Només és correcte en el sentit de 'aparèixer' (DNV). Per a altres sentits useu altres expressions.": "It is only correct with the meaning ‘to appear’. Use a different expression for other meanings."
      ,"Paraula admesa només en alguns diccionaris, i només com a verb intransitiu.": "This word is accepted by only some dictionaries, and only as an intransitive verb."
      ,"Si és nom, porta accent.": "If it is a noun, it takes an accent mark."
      ,"Possible error d'ortografia.": "Possible spelling mistake."
      ,"Paraula admesa només en alguns diccionaris. Val més fer servir un verb alternatiu.": "This word is accepted by only some dictionaries. Another verb is preferable."
      ,"Construcció probablement incorrecta.": "Probably incorrect construction."
      ,"Expressió probablement incorrecta.": "Probably incorrect expression."
      ,"Forma preferible.": "Preferred form."
      ,"En tipografia acurada, useu cometes tipogràfiques.": "Use typographic quotation marks in polished writing."
      ,"Error ortogràfic.": "Spelling error."
      ,"Possible confusió o falta de concordança.": "Possible confusion or agreement error."
      ,"Ús abusiu del v. '\\1'. Considereu una opció alternativa.": "The verb «\\1» is overused here. Consider an alternative."
      ,"Amb valor abstractiu val més usar una altra construcció.": "Use a different construction for an abstract meaning."
      ,"En aquest cas, cal usar el verb 'fer'.": "Use the verb «fer» (to do or make) here."
      ,"Probablement cal usar una altra expressió.": "Another expression is probably preferable."
      ,"S'accentua quan és una afirmació.": "It takes an accent mark when it expresses an assertion."
      ,"S'escriu sense guionet.": "Write it without a hyphen."
      ,"Hi falta un article.": "An article is missing."
      ,"Construcció dubtosa: gerundi de posterioritat. Proveu de reescriure la frase sense el gerundi.": "Questionable construction: a gerund describing a later action. Try rewriting the sentence without the gerund."
      ,"Val més usar 'prou'.": "Use «prou» here."
      ,"Si és un nom, s'escriu amb accent.": "If it is a noun, it takes an accent mark."
      ,"Expressió inadequada.": "Inappropriate expression."
      ,"Expressió incoherent.": "Inconsistent expression."
      ,"Combinació de pronoms febles incorrecta.": "Incorrect combination of weak pronouns."
      ,"Useu accentuació general.": "Use the general accentuation rules."
      ,"Hi falta un verb en condicional.": "A conditional verb is missing."
      ,"Expressió incorrecta si equival a 'guanyar'.": "Incorrect expression when it means ‘to win’."
      ,"Podeu millorar la redacció usant una altra expressió.": "You can improve the wording by using another expression."
      ,"Hi falta la preposició 'a'.": "The preposition «a» is missing."
      ,"El més probable és que calgui usar el pronom 'en', que substitueix un complement introduït per la preposició 'de'.": "The pronoun «en» is probably needed to replace a complement introduced by «de»."
      ,"És preferible un altre ordre o una altra expressió.": "A different word order or expression is preferable."
      ,"El v. 'contactar' és intransitiu i el complement que l'acompanya s'introdueix amb la preposició 'amb'.": "The verb «contactar» is intransitive; its complement is introduced by «amb»."
      ,"Dos articles seguits.": "Two articles appear in a row."
      ,"Sobra la preposició 'a'.": "The preposition «a» is unnecessary here."
      ,"En aquest context val més usar un altre verb.": "Use a different verb in this context."
      ,"Possible error de traductor automàtic.": "Possible machine-translation error."
      ,"En aquest context cal dir __SUGGESTION_1__. ": "Use ‘{suggestion1}’ in this context."
      ,"Val més dir __SUGGESTION_1__. ": "Use ‘{suggestion1}’ here."
      ,"En aquest context val més evitar l'adjectiu \"__SUGGESTION_1__\".": "Avoid the adjective ‘{suggestion1}’ in this context."
      ,"Aquest verb no és incoatiu.": "This verb is not inchoative."
      ,"Aquest verb no és pronominal. Probablement sobra un pronom.": "This verb is not pronominal. A pronoun is probably unnecessary."
      ,"Construcció redundant.": "Redundant construction."
      ,"Falta un espai després del punt.": "A space is missing after the full stop."
      ,"Els símbols no s'apostrofen.": "Symbols do not take an apostrophe."
      ,"Considereu usar un sinònim per a evitar la repetició de \"\\1\" i \"\\2\".": "Consider using synonyms to avoid repeating ‘\\1’ and ‘\\2’."
      ,"Feu més fluida la redacció prescindint del verb comodí 'procedir'.": "Improve the flow by omitting the filler verb ‘procedir’."
      ,"Val més usar una altra expressió més natural.": "Another, more natural expression is preferable."
      ,"Expressió incorrecta. Useu els verbs 'caldre' o 'deure', o bé completeu la perífrasi 'haver de + infinitiu'.": "Incorrect expression. Use the verbs ‘caldre’ or ‘deure’, or complete the ‘haver de + infinitive’ construction."
      ,"Error tipogràfic.": "Typographical error."
      ,"Quan ens referim al dia de la setmana immediatament anterior o posterior, no s'usa l'article.": "Do not use the article when referring to the immediately preceding or following day of the week."
      ,"Aquest possessiu és probablement redundant. Val més eliminar-lo.": "This possessive is probably redundant. It is better to remove it."
      ,"És preferible evitar la perífrasi \"estar + gerundi\" per a fer més fluida la redacció.": "Avoid the ‘estar + gerund’ construction to improve the flow of the text."
      ,"En texts formals eviteu l'article salat.": "Avoid the salat article in formal writing."
      ,"Useu una altra expressió per a evitar el «'lo' neutre».": "Use a different expression to avoid the neuter ‘lo’."
      ,"Amb el sentit de 'per quina raó' s'escriu separat.": "When it means ‘for what reason’, write it as two words."
      ,"Combinació impossible de pronom i verb.": "Impossible pronoun and verb combination."
      ,"El pronom 'en' probablement és redundant.": "The pronoun ‘en’ is probably redundant."
      ,"Eviteu aquest castellanisme.": "Avoid this Spanish calque."
      ,"Combinació incorrecta de preposicions.": "Incorrect combination of prepositions."
      ,"Confusió.": "Confusion."
      ,"Probablement hi falta la preposició 'a'.": "The preposition ‘a’ is probably missing."
      ,"Construcció incorrecta: \"com + subjuntiu\" condicional.": "Incorrect construction: conditional ‘com + subjunctive’."
      ,"El verb 'despertar-se', si no és transitiu, s'ha de fer pronominal.": "Use ‘despertar-se’ pronominally when it is not transitive."
      ,"És preferible usar una construcció amb un subjecte explícit.": "A construction with an explicit subject is preferable."
      ,"Combinació impossible de preposicions.": "Impossible combination of prepositions."
      ,"Repetició probablement incorrecta.": "Probably incorrect repetition."
      ,"Amb sentit causal, val més usar una altra construcció.": "Use a different construction for the causal meaning."
      ,"Hi falta un infinitiu.": "An infinitive is missing."
      ,"S'escriu amb guionet.": "Write it with a hyphen."
      ,"En llenguatge formal, és preferible conjugar l'impersonal \"haver-hi\" en singular.": "In formal writing, the impersonal ‘haver-hi’ is preferably conjugated in the singular."
      ,"Verb incorrecte.": "Incorrect verb."
      ,"Cal evitar el «'lo' neutre».": "Avoid the neuter ‘lo’."
      ,"No s'apostrofa davant de hac aspirada.": "Do not use an apostrophe before an aspirated h."
      ,"Aquesta expressió és redundant i un possible calc de l'anglès.": "This expression is redundant and may be calqued from English."
      ,"S'escriu junt sense guionets.": "Write it as one word, without hyphens."
      ,"Sembla més adequat el nom en plural.": "The plural noun seems more suitable."
      ,"Aquest verb és transitiu i cal eliminar la preposició 'a'.": "This verb is transitive; remove the preposition ‘a’."
      ,"Aquest verb és transitiu. Feu servir el pronom adequat.": "This verb is transitive. Use the appropriate pronoun."
      ,"Feu la redacció més fluida usant un altre verb.": "Improve the flow of the text by using a different verb."
      ,"Si equival a \"quina cosa\", cal escriure <suggestion>què</suggestion>.": "If it means ‘what thing’, write ‘què’."
      ,"\"Recent\" no és un adverbi.": "‘Recent’ is not an adverb."
      ,"Si és verb, cal dir \"reflectir\".": "If it is a verb, use ‘reflectir’."
      ,"És preferible usar el verb \"continuar\" o construir la frase amb \"encara\".": "Use the verb ‘continuar’ or rephrase the sentence with ‘encara’."
      ,"Construcció incorrecta com a perífrasi d'obligació.": "Incorrect construction as an obligation periphrasis."
      ,"D'acord amb el Termcat, és preferible usar una altra expressió.": "According to Termcat, a different expression is preferable."
      ,"Probablement cal escriure <suggestion>com a</suggestion> ('en qualitat de', 'amb caràcter de', 'en funció de').": "Write ‘com a’ here (‘in the capacity of’, ‘with the character of’, ‘as’)."
      ,"Val més dir <suggestion>prou</suggestion>.": "Use ‘prou’ here."
      ,"En aquest context cal dir <suggestion>altura</suggestion>.": "Use ‘altura’ in this context."
      ,"Cal escriure <suggestion>tant</suggestion> en l'expressió \"tant... com...\".": "In the ‘tant... com...’ expression, write ‘tant’."
      ,"El verb 'témer' no és pronominal. Useu una expressió alternativa.": "The verb ‘témer’ is not pronominal. Use a different expression."
      ,"En registres formals usem la forma verbal sense el prefix 'en-'. El pronom 'en' substitueix un complement que comença amb la preposició 'de'.": "In formal registers, use the verb without the prefix ‘en-’. The pronoun ‘en’ replaces a complement introduced by ‘de’."
      ,"Si és un pronom interrogatiu (=quina cosa), s'escriu amb accent. S'escriu sense accent si la resposta és \"sí\" o \"no\" (\"Que vindràs?\").": "As an interrogative pronoun (meaning ‘what thing’), it takes an accent. It has no accent when the answer is ‘yes’ or ‘no’ (‘Que vindràs?’)."
      ,"Aquesta expressió és redundant. Escriviu __SUGGESTION_1__ o __SUGGESTION_2__. ": "This expression is redundant. Write ‘{suggestion1}’ or ‘{suggestion2}’."
      ,"En aquest cas val més evitar l'adjectiu \"\\2\".": "Avoid the adjective ‘\\2’ in this case."
      ,"En aquest cas val més evitar l'adjectiu \"\\1\".": "Avoid the adjective ‘\\1’ in this case."
      ,"En aquest context (\\1), \"sever\" pot ser un calc inapropiat de l'anglès.": "In this context (\\1), ‘sever’ may be an unsuitable calque from English."
      ,"No useu com a pronominal aquest verb, o bé afegiu-hi el pronom 'en'.": "Do not use this verb pronominally, or add the pronoun ‘en’."
      ,"\"Alumnat\" és un nom col·lectiu. No és correcte en aquest context.": "‘Alumnat’ is a collective noun. It is incorrect in this context."
      ,"\"Professorat\" és un nom col·lectiu. No és correcte en aquest context.": "‘Professorat’ is a collective noun. It is incorrect in this context."
      ,"Majúscules i minúscules recomanades.": "Recommended use of uppercase and lowercase letters."
      ,"Si no indica moviment, val més fer servir una altra expressió: elimineu el verb anar i useu el present o el futur.": "If it does not indicate movement, use a different expression: omit the verb ‘anar’ and use the present or future tense."
      ,"Si és nom, cal accentuar-lo.": "If it is a noun, it takes an accent mark."
      ,"Si és del v. 'saber', s'accentua.": "If it is a form of ‘saber’, it takes an accent mark."
      ,"Aquesta locució s'escriu normalment entre comes. Feu servir un punt i coma per a començar una frase nova que contrasta amb l'anterior.": "This phrase is usually set off by commas. Use a semicolon to start a new sentence that contrasts with the previous one."
      ,"Expressió incorrecta amb el sentit de 'fermesa, zel'.": "Incorrect expression when it means ‘firmness, zeal’."
      ,"S'accentua quan és del verb 'ser'.": "It takes an accent mark when it is a form of ‘ser’."
      ,"És preferible usar una altra expressió.": "A different expression is preferable."
      ,"¿Volíeu dir __SUGGESTION_1__? \"Seria\" és una forma del verb 'ser'.": "Did you mean ‘{suggestion1}’? ‘Seria’ is a form of the verb ‘ser’."
      ,"Expressió incorrecta amb valor de censura o èmfasi.": "Incorrect expression when used to express disapproval or emphasis."
      ,"Aquest verb és transitiu. Potser cal canviar el pronom.": "This verb is transitive. The pronoun may need changing."
      ,"Val més prescindir del pronom '\\3', especialment si no es refereix a persones.": "Omit the pronoun ‘\\3’, especially if it does not refer to people."
      ,"És preferible fer servir una altra expressió.": "A different expression is preferable."
      ,"Els anys s'escriuen sense punt.": "Years are written without a full stop."
      ,"Possible calc del castellà.": "Possible calque from Spanish."
      ,"Si no indica moviment, la preposició adequada és __SUGGESTION_1__.": "If it does not indicate movement, the correct preposition is ‘{suggestion1}’."
      ,"Aquesta expressió és un castellanisme.": "This expression is a Spanish calque."
      ,"Quantitat probablement incorrecta. Recordeu que un 'billion' en anglès correspon a 1.000 milions.": "Probably incorrect quantity. Remember that English ‘billion’ means one thousand million."
      ,"Probablement cal canviar la preposició.": "The preposition probably needs changing."
      ,"Paraula pròpia del llenguatge col·loquial. Només admesa per alguns diccionaris.": "Colloquial word. Accepted by only some dictionaries."
      ,"Possible paraula mal partida.": "The word may be incorrectly split."
      ,"Forma col·loquial.": "Colloquial form."
      ,"Probablement sobra la coma entre subjecte i predicat.": "The comma between the subject and predicate is probably unnecessary."
      ,"Pronom feble incorrecte.": "Incorrect weak pronoun."
      ,"Possible confusió entre la lletra ela minúscula i la lletra i majúscula (nombres romans).": "Possible confusion between lowercase ‘l’ and uppercase ‘I’ (Roman numerals)."
      ,"Si és un adjectiu i no un gerundi, cal dir __SUGGESTION_1__.": "If it is an adjective rather than a gerund, use ‘{suggestion1}’."
      ,"Possible error de picatge.": "Possible typing error."
      ,"Temps verbal probablement incorrecte. ¿Volíeu dir __SUGGESTION_1__?": "Probably incorrect verb tense. Did you mean ‘{suggestion1}’?"
      ,"En aquest context l'expressió adequada és __SUGGESTION_1__.": "The correct expression in this context is ‘{suggestion1}’."
      ,"Construcció incorrecta si equival a __SUGGESTION_1__.": "Incorrect construction if it means ‘{suggestion1}’."
      ,"Falta un espai després del punt i no abans.": "A space is missing after the full stop, not before it."
      ,"Combinació impossible de pronoms i verb.": "Impossible combination of pronouns and verb."
      ,"Si és una forma del verb 'evidenciar', s'escriu sense accent.": "If it is a form of ‘evidenciar’, it is written without an accent mark."
      ,"Si és conjunció, cal escriure __SUGGESTION_1__.": "If it is a conjunction, write ‘{suggestion1}’."
      ,"Amb el sentit de 'finalitat, propòsit', \"fi\" és masculí.": "‘Fi’ is masculine when it means ‘purpose’ or ‘aim’."
      ,"Verb inadequat en aquesta expressió.": "Unsuitable verb in this expression."
      ,"En aquesta frase el verb adequat és 'posar'.": "The appropriate verb in this sentence is ‘posar’."
      ,"Aquesta construcció d'infinitiu sense un verb principal és inadequada.": "This infinitive construction without a main verb is unsuitable."
      ,"S'escriu separat.": "Write it as separate words."
      ,"Si es refereix a un complement en plural, cal dir __SUGGESTION_1__.": "If it refers to a plural complement, use ‘{suggestion1}’."
      ,"El pronom adequat és \"li\".": "The correct pronoun is ‘li’."
      ,"Anglicisme innecessari. Considereu fer servir una altra expressió.": "Unnecessary anglicism. Consider using a different expression."
      ,"Amb el sentit de 'opinió' cal dir __SUGGESTION_1__.": "When it means ‘opinion’, use ‘{suggestion1}’."
      ,"Ús pronominal incorrecte. Canvieu l'expressió o elimineu el pronom reflexiu.": "Incorrect pronominal use. Rephrase or remove the reflexive pronoun."
      ,"La preposició adequada és 'per a'.": "The correct preposition is ‘per a’."
      ,"Probablement cal usar la preposició __SUGGESTION_1__.": "The preposition ‘{suggestion1}’ is probably needed."
      ,"Normalment s'escriu junt, sense guionet.": "It is usually written as one word, without a hyphen."
      ,"Ordenació inadequada dels pronoms en un registre formal.": "Unsuitable pronoun order in a formal register."
      ,"En les expressions d'hores, usem el punt o els dos punts (sistema internacional).": "Use a full stop or a colon to write times (international standard)."
      ,"El plural de les sigles no es marca gràficament.": "The plural of an initialism is not marked in writing."
      ,"Probablement cal usar la conjunció adversativa __SUGGESTION_1__.": "The adversative conjunction ‘{suggestion1}’ is probably needed."
      ,"Si és una afirmació, s'escriu amb accent.": "If it expresses an assertion, it takes an accent mark."
      ,"És preferible escriure aquest nombre amb lletres.": "It is preferable to write this number out in words."
      ,"Cal escriure __SUGGESTION_1__.": "Write ‘{suggestion1}’."
      ,"En aquest context, val més usar un verb més precís.": "Use a more precise verb in this context."
      ,"Aquesta paraula és usual en valencià, però no en altres varietats.": "This word is common in Valencian, but not in other varieties."
      ,"Probablement cal escriure __SUGGESTION_1__ ('en qualitat de', 'amb caràcter de', 'en funció de').": "Write «{suggestion1}» here (‘in the capacity of’, ‘with the character of’, ‘as’)."
      ,"Cal escriure __SUGGESTION_1__ en l'expressió \"tant... com...\".": "In the ‘tant... com...’ expression, write ‘{suggestion1}’."
    }
  };

  const sharedExplanationTranslations = {
    "Aquesta expressió és redundant. Escriviu __SUGGESTION_1__ o __SUGGESTION_2__. ": ["Esta expresión es redundante. Escribe «{suggestion1}» o «{suggestion2}».", "This expression is redundant. Write ‘{suggestion1}’ or ‘{suggestion2}’."],
    "En una loc. distributiva (\"és tant físic com estètic\") hauria de ser __SUGGESTION_1__. Correcte en una loc. comparativa (\"és tan covard com oportunista\").": ["En una locución distributiva («és tant físic com estètic»), debe ser «{suggestion1}». Es correcto en una locución comparativa («és tan covard com oportunista»).", "In a distributive phrase (‘és tant físic com estètic’), use ‘{suggestion1}’. The other form is correct in a comparative phrase (‘és tan covard com oportunista’)."],
    "Si equival a \"quina cosa\", cal escriure __SUGGESTION_1__.": ["Si equivale a «qué cosa», debe escribirse «{suggestion1}».", "If it means ‘what thing’, write ‘{suggestion1}’."],
    "Expressió incorrecta": ["Expresión incorrecta.", "Incorrect expression."],
    "Useu el guió llarg, d'acord amb les opcions actives.": ["Usa la raya, de acuerdo con las opciones activas.", "Use an em dash, according to the enabled options."],
    "S'accentua quan és nom.": ["Lleva tilde cuando es un sustantivo.", "It takes an accent mark when it is a noun."],
    "Possible error ortogràfic. S'espera un verb abans del pronom.": ["Posible error ortográfico. Se espera un verbo antes del pronombre.", "Possible spelling error. A verb is expected before the pronoun."],
    "Incorrecte en el sentit de 'donar suport'.": ["Incorrecto con el sentido de «dar apoyo».", "Incorrect when used to mean ‘to support’."],
    "Amb el sentit de 'superfície, terra, terreny', s'escriu amb accent.": ["Con el sentido de «superficie, tierra, terreno», se escribe con tilde.", "When it means ‘surface, ground, land’, it takes an accent mark."],
    "¿Volíeu dir __SUGGESTION_1__? \"Sostens\" és una forma del verb 'sostenir'.": ["¿Querías decir «{suggestion1}»? «Sostens» es una forma del verbo «sostenir».", "Did you mean ‘{suggestion1}’? ‘Sostens’ is a form of the verb ‘sostenir’."],
    "En el sentit d'adreça d'internet és masculí. Femení si correspon a Universitat Ramon Llull.": ["En el sentido de dirección de internet, es masculino. Es femenino si se refiere a la Universitat Ramon Llull.", "It is masculine when it means an internet address, and feminine when it refers to Universitat Ramon Llull."],
    "En el sentit de 'posar fi a' val més fer servir una altra expressió.": ["Con el sentido de «poner fin a», es preferible usar otra expresión.", "Use a different expression when you mean ‘to put an end to’."],
    "En el sentit de 'eliminar' val més fer servir una altra expressió.": ["Con el sentido de «eliminar», es preferible usar otra expresión.", "Use a different expression when you mean ‘to eliminate’."],
    "Useu una altra construcció per a evitar la repetició del verb 'acabar'.": ["Usa otra construcción para evitar repetir el verbo «acabar».", "Use a different construction to avoid repeating the verb ‘acabar’."],
    "Probablement hi falta una preposició.": ["Probablemente falta una preposición.", "A preposition is probably missing."],
    "Quan hi ha diversos adverbis acabats en '-ment' coordinats, no es pot suprimir el sufix en el primer adverbi.": ["Cuando se coordinan varios adverbios acabados en «-ment», no se puede omitir el sufijo del primero.", "When coordinating adverbs ending in ‘-ment’, the suffix cannot be omitted from the first adverb."],
    "Podeu fer la redacció més fluida usant una altra expressió.": ["Puedes dar más fluidez al texto usando otra expresión.", "You can improve the flow of the text by using a different expression."],
    "Expressió incorrecta com a negació.": ["Expresión incorrecta como negación.", "Incorrect expression when used as a negation."],
    "Combinació agramatical. Useu el pronom \"algú\" (neutre) o bé els determinants \"algun, alguna\" seguits cada un d'un nom.": ["Combinación agramatical. Usa el pronombre «algú» (neutro) o los determinantes «algun, alguna», cada uno seguido de un sustantivo.", "Ungrammatical combination. Use the pronoun ‘algú’ (neutral), or the determiners ‘algun, alguna’, each followed by a noun."],
    "Paraula admesa només per alguns diccionaris.": ["Palabra admitida solo por algunos diccionarios.", "Word accepted by only some dictionaries."],
    "Incorrecte si equival a __SUGGESTION_1__.": ["Incorrecto si equivale a «{suggestion1}».", "Incorrect if it means ‘{suggestion1}’."],
    "Incorrecte si equival a __SUGGESTION_1__. Correcte en altres sentits.": ["Incorrecto si equivale a «{suggestion1}». Es correcto con otros sentidos.", "Incorrect if it means ‘{suggestion1}’. It is correct with other meanings."],
    "Possible confusió. Potser cal un gerundi.": ["Posible confusión. Quizá haga falta un gerundio.", "Possible confusion. A gerund may be needed."],
    "En el sentit de 'designar per a un càrrec', cal usar el verb 'nomenar'.": ["Con el sentido de «designar para un cargo», hay que usar el verbo «nomenar».", "When it means ‘to appoint to a position’, use the verb ‘nomenar’."],
    "Si es refereix a una hora del dia, s'escriu sense apostrofar.": ["Si se refiere a una hora del día, se escribe sin apóstrofo.", "If it refers to a time of day, write it without an apostrophe."],
    "En el sentit de 'acció d'arxivar' cal dir __SUGGESTION_1__.": ["Con el sentido de «acción de archivar», debe decirse «{suggestion1}».", "When it means ‘the act of archiving’, use ‘{suggestion1}’."],
    "Anglicisme innecessari.": ["Anglicismo innecesario.", "Unnecessary anglicism."],
    "L'article adequat per a les hores és __SUGGESTION_1__.": ["El artículo adecuado para las horas es «{suggestion1}».", "The correct article for times is ‘{suggestion1}’."],
    "És preferible la construcció sense preposició.": ["Es preferible la construcción sin preposición.", "The construction without a preposition is preferable."],
    "Preposició inadequada.": ["Preposición inadecuada.", "Unsuitable preposition."],
    "Si és un animal, s'escriu sense accent.": ["Si es un animal, se escribe sin tilde.", "If it refers to an animal, it is written without an accent mark."],
    "Probablement val més dir __SUGGESTION_1__.": ["Probablemente es preferible decir «{suggestion1}».", "It is probably better to say ‘{suggestion1}’."],
    "Paraula col·loquial. Considereu una alternativa.": ["Palabra coloquial. Considera una alternativa.", "Colloquial word. Consider an alternative."],
    "Escurçament informal.": ["Acortamiento informal.", "Informal shortening."],
    "El v. 'compartir' és intransitiu i el complement que l'acompanya s'introdueix amb la preposició 'amb'.": ["El verbo «compartir» es intransitivo y su complemento se introduce con la preposición «amb».", "The verb ‘compartir’ is intransitive, and its complement is introduced by the preposition ‘amb’."],
    "En aquest context val més evitar l'expressió \"comptar amb\".": ["En este contexto, es preferible evitar la expresión «comptar amb».", "Avoid the expression ‘comptar amb’ in this context."],
    "Si és un nom, és de gènere masculí.": ["Si es un sustantivo, es masculino.", "If it is a noun, it is masculine."],
    "Ordre no habitual.": ["Orden poco habitual.", "Unusual word order."],
    "És preferible fer la concordança de gènere.": ["Es preferible hacer concordar el género.", "Gender agreement is preferable."],
    "Cal escriure __SUGGESTION_1__ o __SUGGESTION_2__ (informal).": ["Debe escribirse «{suggestion1}» o «{suggestion2}» (informal).", "Write ‘{suggestion1}’ or ‘{suggestion2}’ (informal)."],
    "Si és un nom, s'ha d'accentuar.": ["Si es un sustantivo, lleva tilde.", "If it is a noun, it takes an accent mark."],
    "Val més usar el pronom 'hi'.": ["Es preferible usar el pronombre «hi».", "Use the pronoun ‘hi’."],
    "Si el 'que' no és comparatiu, potser cal canviar-lo.": ["Si «que» no es comparativo, quizá haya que cambiarlo.", "If ‘que’ is not comparative, it may need to be changed."],
    "En aquest context, és més natural usar un altre verb.": ["En este contexto, es más natural usar otro verbo.", "A different verb sounds more natural in this context."],
    "Cal escriure __SUGGESTION_1__. \"Darrera\" només és correcte si equival a 'última'.": ["Debe escribirse «{suggestion1}». «Darrera» solo es correcto si equivale a «última».", "Write ‘{suggestion1}’. ‘Darrera’ is correct only when it means ‘last’ (feminine)."],
    "Per a indicar anys o dècades la 's' és innecessària.": ["Para indicar años o décadas, la «s» es innecesaria.", "The ‘s’ is unnecessary when indicating years or decades."],
    "Col·loquialisme no admès per la major part dels diccionaris.": ["Coloquialismo no admitido por la mayoría de los diccionarios.", "Colloquialism not accepted by most dictionaries."],
    "Useu \"del A al B\" o \"des del A fins al B\".": ["Usa «del A al B» o «des del A fins al B».", "Use ‘del A al B’ or ‘des del A fins al B’."],
    "Dos determinants repetits.": ["Dos determinantes repetidos.", "Two repeated determiners."],
    "Probablement hi falta un infinitiu.": ["Probablemente falta un infinitivo.", "An infinitive is probably missing."],
    "Construcció incorrecta si és una frase condicional.": ["Construcción incorrecta si es una oración condicional.", "Incorrect construction if this is a conditional sentence."],
    "Si és adjectiu o nom, s'escriu amb accent.": ["Si es un adjetivo o sustantivo, lleva tilde.", "If it is an adjective or noun, it takes an accent mark."],
    "Probablement és preferible usar la preposició 'de'.": ["Probablemente es preferible usar la preposición «de».", "The preposition ‘de’ is probably preferable."],
    "Aquests termes musicals s'escriuen en minúscula.": ["Estos términos musicales se escriben en minúscula.", "These musical terms are written in lowercase."],
    "Sigles dels Estats Units d'Amèrica.": ["Siglas de los Estados Unidos de América.", "Initialism for the United States of America."],
    "En aquesta perífrasi verbal el pronom reflexiu posterior és redundant.": ["En esta perífrasis verbal, el pronombre reflexivo pospuesto es redundante.", "In this verb construction, the following reflexive pronoun is redundant."],
    "Llevat d'algunes excepcions, l'infinitiu sol usar-se sense article.": ["Salvo algunas excepciones, el infinitivo suele usarse sin artículo.", "With a few exceptions, the infinitive is usually used without an article."],
    "En el sentit de \"anar cap al lloc d'origen\" cal dir \"tornar-se'n\".": ["Con el sentido de «ir hacia el lugar de origen», debe decirse «tornar-se'n».", "When it means ‘to go back to where one came from’, use ‘tornar-se'n’."],
    "La construcció adequada és \"entre A i B\", no \"entre A-B\".": ["La construcción adecuada es «entre A i B», no «entre A-B».", "The correct construction is ‘entre A i B’, not ‘entre A-B’."],
    "Combinació de preposicions probablement incorrecta.": ["Combinación de preposiciones probablemente incorrecta.", "Probably incorrect combination of prepositions."],
    "Només s'accentua si és una afirmació.": ["Solo lleva tilde si expresa una afirmación.", "It takes an accent mark only when it expresses an assertion."],
    "Si no equival a 'el qual', \"que\" s'escriu sense accent.": ["Si no equivale a «el cual», «que» se escribe sin tilde.", "If it does not mean ‘which’, write ‘que’ without an accent mark."],
    "Només s'accentua si és del verb 'ser'.": ["Solo lleva tilde si es una forma del verbo «ser».", "It takes an accent mark only when it is a form of ‘ser’."],
    "És preferible usar el verb 'sentir' en correspondència amb el verb 'veure'.": ["Es preferible usar el verbo «sentir» en correspondencia con el verbo «veure».", "Use the verb ‘sentir’ to correspond with the verb ‘veure’."],
    "El pronom feble adequat és 'hi'.": ["El pronombre débil adecuado es «hi».", "The correct weak pronoun is ‘hi’."],
    "En aquest cas, cal usar el verb 'ser'.": ["En este caso, hay que usar el verbo «ser».", "Use the verb ‘ser’ in this case."],
    "Hi falta un accent.": ["Falta una tilde.", "An accent mark is missing."],
    "Podeu fer la redacció més fluida amb el verb 'caldre'.": ["Puedes dar más fluidez al texto usando el verbo «caldre».", "You can improve the flow by using the verb ‘caldre’."],
    "Val més usar una altra expressió per a evitar aquest anglicisme.": ["Es preferible usar otra expresión para evitar este anglicismo.", "Use a different expression to avoid this anglicism."],
    "Variant secundària.": ["Variante secundaria.", "Secondary variant."],
    "Podeu fer la redacció més fluida eliminant paraules innecessàries.": ["Puedes dar más fluidez al texto eliminando palabras innecesarias.", "You can improve the flow of the text by removing unnecessary words."],
    "Si no equival a \"fins i tot\", cal escriure __SUGGESTION_1__.": ["Si no equivale a «incluso», debe escribirse «{suggestion1}».", "If it does not mean ‘even’, write ‘{suggestion1}’."],
    "Amb el sentit de 'finalitat, objectiu', \"fi\" és un nom masculí. Amb el sentit de 'acabament, final' és femení.": ["Con el sentido de «finalidad, objetivo», «fi» es masculino. Con el sentido de «acabamiento, final», es femenino.", "‘Fi’ is masculine when it means ‘purpose’ or ‘objective’, and feminine when it means ‘ending’ or ‘end’."],
    "En aquest context, la paraula adequada és __SUGGESTION_1__.": ["En este contexto, la palabra adecuada es «{suggestion1}».", "The correct word in this context is ‘{suggestion1}’."],
    "Onomatopeia de la rialla.": ["Onomatopeya de la risa.", "Onomatopoeia for laughter."],
    "Val més usar el verb 'estar'.": ["Es preferible usar el verbo «estar».", "Use the verb ‘estar’."],
    "Pronom feble solt.": ["Pronombre débil aislado.", "Weak pronoun used on its own."],
    "Per a indicar 'hores' s'usa el símbol h, en minúscula i sense punt.": ["Para indicar «horas», se usa el símbolo «h», en minúscula y sin punto.", "Use the symbol ‘h’ for hours, in lowercase and without a full stop."],
    "Paraula col·loquial no admesa per la major part dels diccionaris.": ["Palabra coloquial no admitida por la mayoría de los diccionarios.", "Colloquial word not accepted by most dictionaries."],
    "¿Volíeu dir __SUGGESTION_1__ (substantiu)? \"Informa\" és una forma del verb 'informar'.": ["¿Querías decir «{suggestion1}» (sustantivo)? «Informa» es una forma del verbo «informar».", "Did you mean ‘{suggestion1}’ (the noun)? ‘Informa’ is a form of the verb ‘informar’."],
    "Feu la redacció més fluida usant una altra expressió.": ["Da más fluidez al texto usando otra expresión.", "Improve the flow by using a different expression."],
    "Si \"porta\" és un nom femení (no una forma del verb 'portar'), cal escriure __SUGGESTION_1__.": ["Si «porta» es un sustantivo femenino (y no una forma del verbo «portar»), debe escribirse «{suggestion1}».", "If ‘porta’ is a feminine noun (not a form of ‘portar’), write ‘{suggestion1}’."],
    "En aquest context és preferible no ometre l'article.": ["En este contexto, es preferible no omitir el artículo.", "Do not omit the article in this context."],
    "Error d'apostrofació.": ["Error de apóstrofo.", "Incorrect apostrophe use."],
    "Per a indicar 'litres' s'usa el símbol 'l' o 'L'.": ["Para indicar «litros», se usa el símbolo «l» o «L».", "Use the symbol ‘l’ or ‘L’ for litres."],
    "És preferible usar l'article en els dos elements (l'un, l'altre).": ["Es preferible usar el artículo en los dos elementos («l'un, l'altre»).", "Use the article with both elements (‘l'un, l'altre’)."],
    "Seguit d'un nom en singular, no col·lectiu, és més apropiat dir __SUGGESTION_1__.": ["Delante de un sustantivo singular no colectivo, es más adecuado decir «{suggestion1}».", "Before a singular, non-collective noun, ‘{suggestion1}’ is more appropriate."],
    "Possible confusió en l'ús de la majúscula, si no és un títol o un nom propi.": ["Posible confusión en el uso de la mayúscula, si no es un título o nombre propio.", "Possible capitalization issue, unless this is a title or proper name."],
    "Paraula incorrecta en aquest context.": ["Palabra incorrecta en este contexto.", "Incorrect word in this context."],
    "Si és un adjectiu exclamatiu, cal dir __SUGGESTION_1__.": ["Si es un adjetivo exclamativo, debe decirse «{suggestion1}».", "If it is an exclamative adjective, use ‘{suggestion1}’."],
    "Si es refereix a un mitjà de transport, cal dir __SUGGESTION_1__.": ["Si se refiere a un medio de transporte, debe decirse «{suggestion1}».", "If it refers to a means of transport, use ‘{suggestion1}’."],
    "Paraula col·loquial no admesa pels diccionaris. Podeu fer servir una alternativa.": ["Palabra coloquial no admitida por los diccionarios. Puedes usar una alternativa.", "Colloquial word not accepted by dictionaries. Consider an alternative."],
    "S'escriu amb accent diacrític, excepte si és un possessiu (el meu).": ["Se escribe con tilde diacrítica, excepto si es un posesivo («el meu»).", "It takes a diacritical accent, except when it is a possessive (‘el meu’)."],
    "<pleasespell/>Probablement s'escriu junt.": ["Probablemente se escribe junto.", "It is probably written as one word."],
    "El verb '\\2' no regeix la preposició 'de'. Probablement cal eliminar-la.": ["El verbo «\\2» no rige la preposición «de». Probablemente hay que eliminarla.", "The verb ‘\\2’ does not take the preposition ‘de’. It probably needs to be removed."],
    "Possible ús redundant: pronom 'en' i possessiu. Elimineu un dels dos elements.": ["Posible uso redundante del pronombre «en» y un posesivo. Elimina uno de los dos elementos.", "Possible redundancy: the pronoun ‘en’ and a possessive. Remove one of them."],
    "El pronom 'hi' segurament és redundant.": ["El pronombre «hi» seguramente es redundante.", "The pronoun ‘hi’ is probably redundant."],
    "En el sentit de 'societat religiosa', 'ritu cristià' o 'cos de persones unides per una regla', \"orde\" és masculí.": ["Con los sentidos de «sociedad religiosa», «rito cristiano» o «grupo de personas unidas por una regla», «orde» es masculino.", "‘Orde’ is masculine when it means a religious community, Christian rite, or group bound by a rule."],
    "No feu pronominal l'expressió \"passar per\".": ["No uses la expresión «passar per» como pronominal.", "Do not use the expression ‘passar per’ pronominally."]
    ,"Aquesta expressió és redundant. Escriviu __SUGGESTION_1__ o __SUGGESTION_2__, etc.": ["Esta expresión es redundante. Escribe «{suggestion1}» o «{suggestion2}», etc.", "This expression is redundant. Write ‘{suggestion1}’ or ‘{suggestion2}’, etc."]
    ,"Probablement s'escriu junt.": ["Probablemente se escribe junto.", "It is probably written as one word."]
    ,"La major part dels llibres d'estil recomanen usar la preposició 'a'.": ["La mayoría de los manuales de estilo recomiendan usar la preposición «a».", "Most style guides recommend using the preposition ‘a’. "]
    ,"La preposició adequada és probablement __SUGGESTION_1__.": ["La preposición adecuada probablemente es «{suggestion1}».", "The correct preposition is probably ‘{suggestion1}’. "]
    ,"Castellanisme. Podeu deixar-lo en cursiva o entre cometes, o bé usar una alternativa.": ["Castellanismo. Puedes dejarlo en cursiva o entre comillas, o usar una alternativa.", "Spanish calque. You can italicize it, put it in quotation marks, or use an alternative."]
    ,"El verb \"plenar\" no existeix. Feu servir \"omplir\".": ["El verbo «plenar» no existe. Usa «omplir».", "The verb ‘plenar’ does not exist. Use ‘omplir’. "]
    ,"Combinació impossible: preposició seguida de verb conjugat.": ["Combinación imposible: una preposición seguida de un verbo conjugado.", "Impossible combination: a preposition followed by a conjugated verb."]
    ,"El verb està mal escrit.": ["El verbo está mal escrito.", "The verb is misspelled."]
    ,"Probablement hi falta un verb conjugat.": ["Probablemente falta un verbo conjugado.", "A conjugated verb is probably missing."]
    ,"El pronom més adequat sembla __SUGGESTION_1__ (referit a \"\\2\").": ["El pronombre más adecuado parece «{suggestion1}» (referido a «\\2»).", "The most suitable pronoun seems to be ‘{suggestion1}’ (referring to ‘\\2’)."]
    ,"Possible error de puntuació.": ["Posible error de puntuación.", "Possible punctuation error."]
    ,"En aquesta expressió, tradicionalment s'usa el v. 'donar'.": ["Tradicionalmente, en esta expresión se usa el verbo «donar».", "The verb ‘donar’ is traditionally used in this expression."]
    ,"Probablement és més adequat usar el verb 'ser'.": ["Probablemente es más adecuado usar el verbo «ser».", "The verb ‘ser’ is probably more appropriate."]
    ,"Val més usar el verb 'ser'.": ["Es preferible usar el verbo «ser».", "Use the verb ‘ser’."]
    ,"Val més fer servir una altra expressió. Possible calc de l'anglès.": ["Es preferible usar otra expresión. Posible calco del inglés.", "Use a different expression. Possible calque from English."]
    ,"Val més usar una altra paraula si vol dir __SUGGESTION_1__.": ["Es preferible usar otra palabra si significa «{suggestion1}».", "Use a different word if it means ‘{suggestion1}’."]
    ,"Val més fer servir el verb 'ser'.": ["Es preferible usar el verbo «ser».", "Use the verb ‘ser’."]
    ,"Anglicisme innecessari en l'àmbit informàtic.": ["Anglicismo innecesario en el ámbito informático.", "Unnecessary anglicism in computing."]
    ,"Si és un nom masculí, cal dir __SUGGESTION_1__. Correcte si és un nom femení.": ["Si es un sustantivo masculino, debe decirse «{suggestion1}». Es correcto si es femenino.", "If it is a masculine noun, use ‘{suggestion1}’. It is correct if feminine."]
    ,"Per a indicar obligació, cal usar una altra expressió.": ["Para expresar obligación, hay que usar otra expresión.", "Use a different expression to express obligation."]
    ,"Possible calc del castellà. Val més usar una altra expressió.": ["Posible calco del castellano. Es preferible usar otra expresión.", "Possible calque from Spanish. Use a different expression."]
    ,"L'expressió adequada és \"fer curt\".": ["La expresión adecuada es «fer curt».", "The correct expression is ‘fer curt’. "]
    ,"Possible calc de l'anglès. Probablement es pot eliminar 'fer-ho' sense alterar el significat de la frase.": ["Posible calco del inglés. Probablemente se puede eliminar «fer-ho» sin cambiar el sentido de la frase.", "Possible calque from English. ‘Fer-ho’ can probably be removed without changing the sentence's meaning."]
    ,"Probablement no s'ha d'accentuar. Sí que s'accentua si es pot substituir per 'quina cosa'.": ["Probablemente no lleva tilde. Sí la lleva si puede sustituirse por «qué cosa».", "It probably has no accent mark. It does take one if it can be replaced by ‘what thing’. "]
    ,"Incorrecte en el sentit de \"donar suport, defensar\".": ["Incorrecto con el sentido de «dar apoyo, defender».", "Incorrect when used to mean ‘to support, defend’. "]
    ,"Probablement l'adverbi adequat és __SUGGESTION_1__.": ["Probablemente el adverbio adecuado es «{suggestion1}».", "The correct adverb is probably ‘{suggestion1}’. "]
    ,"El v. 'riure' sols pot ser reflexiu si va acompanyat d'un complement amb \"de\" (riure's de, riure-se'n).": ["El verbo «riure» solo puede ser reflexivo si va acompañado de un complemento con «de» («riure's de», «riure-se'n»).", "The verb ‘riure’ can only be reflexive when followed by a complement with ‘de’ (‘riure's de’, ‘riure-se'n’)."]
    ,"No s'ha de duplicar la negació.": ["No se debe duplicar la negación.", "Do not duplicate the negation."]
    ,"En aquest context (\\2), \"sever\" pot ser un calc inapropiat de l'anglès.": ["En este contexto («\\2»), «sever» puede ser un calco inadecuado del inglés.", "In this context (‘\\2’), ‘sever’ may be an unsuitable calque from English."]
    ,"El pronom és incorrecte.": ["El pronombre es incorrecto.", "The pronoun is incorrect."]
    ,"Probablement hi falta el pronom feble 'hi'.": ["Probablemente falta el pronombre débil «hi».", "The weak pronoun ‘hi’ is probably missing."]
    ,"Probablement hi falta un article.": ["Probablemente falta un artículo.", "An article is probably missing."]
    ,"Probablement hi falta la preposició 'de'.": ["Probablemente falta la preposición «de».", "The preposition ‘de’ is probably missing."]
    ,"Sobra la preposició 'de'.": ["Sobra la preposición «de».", "The preposition ‘de’ is unnecessary."]
    ,"Sobra la preposició 'a'.": ["Sobra la preposición «a».", "The preposition ‘a’ is unnecessary."]
    ,"Cal eliminar la preposició 'de'.": ["Hay que eliminar la preposición «de».", "Remove the preposition ‘de’. "]
    ,"Cal eliminar la preposició 'a'.": ["Hay que eliminar la preposición «a».", "Remove the preposition ‘a’. "]
    ,"Possible error d'apostrofació.": ["Posible error en el uso del apóstrofo.", "Possible apostrophe error."]
    ,"És incorrecte en aquest context.": ["Es incorrecto en este contexto.", "It is incorrect in this context."]
    ,"Expressió inadequada en aquest context.": ["Expresión inadecuada en este contexto.", "Unsuitable expression in this context."]
    ,"Forma verbal incorrecta.": ["Forma verbal incorrecta.", "Incorrect verb form."]
    ,"Cal revisar la concordança.": ["Hay que revisar la concordancia.", "Check the agreement."]
    ,"Possible error de concordança.": ["Posible error de concordancia.", "Possible agreement error."]
    ,"Falta una coma.": ["Falta una coma.", "A comma is missing."]
    ,"Sobra una coma.": ["Sobra una coma.", "There is an extra comma."]
    ,"Hi falta un punt.": ["Falta un punto.", "A full stop is missing."]
    ,"Sobra un punt.": ["Sobra un punto.", "There is an extra full stop."]
    ,"Incorrecte amb valor aproximatiu. Correcte en altres sentits.": ["Incorrecto con valor aproximativo. Es correcto con otros sentidos.", "Incorrect when used approximately. It is correct with other meanings."]
    ,"Si és una unitat, cal escriure un superíndex.": ["Si es una unidad, hay que escribir un superíndice.", "If it is a unit, use a superscript."]
    ,"Davant d'adjectiu o adverbi cal escriure __SUGGESTION_1__.": ["Delante de un adjetivo o adverbio hay que escribir «{suggestion1}».", "Use ‘{suggestion1}’ before an adjective or adverb."]
    ,"En una locució comparativa, cal escriure __SUGGESTION_1__.": ["En una locución comparativa, hay que escribir «{suggestion1}».", "In a comparative phrase, write ‘{suggestion1}’. "]
    ,"Val més usar una altra expressió. Aquesta és un calc de l'anglès.": ["Es preferible usar otra expresión. Esta es un calco del inglés.", "Use a different expression. This one is calqued from English."]
    ,"Si és el nom d'una infusió, s'escriu sense accent. \"Té\" (amb accent) és una forma del verb 'tenir'.": ["Si es el nombre de una infusión, se escribe sin tilde. «Té» (con tilde) es una forma del verbo «tenir».", "If it is the name of an infusion, it is written without an accent mark. ‘Té’ (with an accent) is a form of ‘tenir’. "]
    ,"És un castellanisme si equival a __SUGGESTION_1__.": ["Es un calco del castellano si equivale a «{suggestion1}».", "It is a Spanish calque if it means ‘{suggestion1}’. "]
    ,"Val més usar un altre verb.": ["Es preferible usar otro verbo.", "Use a different verb. "]
    ,"En aquest sentit \"\\1\" és un verb intransitiu. Hi falta la preposició 'a'.": ["En este sentido, «\\1» es un verbo intransitivo. Falta la preposición «a».", "In this sense, ‘\\1’ is an intransitive verb. The preposition ‘a’ is missing."]
    ,"Aquesta construcció és un calc del castellà.": ["Esta construcción es un calco del castellano.", "This construction is calqued from Spanish."]
    ,"El temps verbal adequat per a referir-se a una acció que ocorre \\1 és el perfet.": ["El tiempo verbal adecuado para referirse a una acción que ocurre «\\1» es el perfecto.", "Use the perfect tense to refer to an action that occurs ‘\\1’. "]
    ,"\"Vegem\" és un subjuntiu. En aquest cas cal usar el verb en futur.": ["«Vegem» es un subjuntivo. En este caso hay que usar el futuro.", "‘Vegem’ is a subjunctive form. Use the future tense here."]
    ,"És recomanable usar el verb en futur.": ["Se recomienda usar el verbo en futuro.", "Use the future tense. "]
    ,"Aquest verb és transitiu. Potser cal eliminar la preposició 'a'. La preposició és necessària en casos d'ambigüitat.": ["Este verbo es transitivo. Quizá haya que eliminar la preposición «a», aunque es necesaria en caso de ambigüedad.", "This verb is transitive. The preposition ‘a’ may need removing, but it is needed to avoid ambiguity."]
    ,"Forma verbal inadequada.": ["Forma verbal inadecuada.", "Unsuitable verb form."]
    ,"No és correcte en aquest context.": ["No es correcto en este contexto.", "It is incorrect in this context."]
    ,"És preferible evitar aquesta expressió.": ["Es preferible evitar esta expresión.", "Avoid this expression."]
    ,"S'escriu amb accent.": ["Se escribe con tilde.", "It takes an accent mark."]
    ,"S'escriu sense accent.": ["Se escribe sin tilde.", "It is written without an accent mark."]
    ,"S'escriu amb apòstrof.": ["Se escribe con apóstrofo.", "It is written with an apostrophe."]
    ,"S'escriu sense apòstrof.": ["Se escribe sin apóstrofo.", "It is written without an apostrophe."]
    ,"Probablement falta una coma.": ["Probablemente falta una coma.", "A comma is probably missing."]
    ,"Probablement sobra una coma.": ["Probablemente sobra una coma.", "A comma is probably unnecessary."]
    ,"Cal escriure-ho amb majúscula.": ["Debe escribirse con mayúscula.", "Write it with a capital letter."]
    ,"Cal escriure-ho amb minúscula.": ["Debe escribirse con minúscula.", "Write it in lowercase."]
    ,"L'abreviatura de \"diversos autors\" és __SUGGESTION_1__. En les bibliografies es recomana no usar l'expressió \"diversos autors\" (abreviada o no).": ["La abreviatura de «diversos autors» es «{suggestion1}». En bibliografías se recomienda evitar esa expresión, abreviada o no.", "The abbreviation for ‘diversos autors’ is ‘{suggestion1}’. Bibliographies should avoid that expression, abbreviated or otherwise."]
    ,"Useu l'abreviatura adequada de \"número\".": ["Usa la abreviatura adecuada de «número».", "Use the correct abbreviation for ‘número’."]
    ,"Useu l'abreviatura adequada de \"número\" (__SUGGESTION_1__) o de \"nombre\" (__SUGGESTION_2__).": ["Usa la abreviatura adecuada de «número» («{suggestion1}») o de «nombre» («{suggestion2}»).", "Use the correct abbreviation for ‘número’ (‘{suggestion1}’) or ‘nombre’ (‘{suggestion2}’)."]
    ,"Forma preferida actualment.": ["Forma preferida actualmente.", "Currently preferred form."]
    ,"Amb el sentit de 'radicat a', aquesta expressió és un calc de l'anglès.": ["Con el sentido de «radicado en», esta expresión es un calco del inglés.", "When it means ‘based in’, this expression is calqued from English."]
    ,"Si és un verb, cal dir __SUGGESTION_1__. Correcte com a adjectiu (relatiu a l'anell).": ["Si es un verbo, debe decirse «{suggestion1}». Es correcto como adjetivo relativo al anillo.", "If it is a verb, use ‘{suggestion1}’. It is correct as an adjective meaning ‘related to a ring’."]
    ,"Redundància.": ["Redundancia.", "Redundancy."]
    ,"Com a locució adverbial s'escriu separat.": ["Como locución adverbial, se escribe separado.", "As an adverbial phrase, it is written as separate words."]
    ,"Paraula només admesa per alguns diccionaris. Considereu una opció alternativa.": ["Palabra admitida solo por algunos diccionarios. Considera una alternativa.", "Word accepted by only some dictionaries. Consider an alternative."]
    ,"\"Apurar\" és correcte en el sentit de 'depurar' o 'posar en clar, verificar'. Incorrecte en altres sentits.": ["«Apurar» es correcto con el sentido de «depurar» o «aclarar, verificar». Es incorrecto con otros sentidos.", "‘Apurar’ is correct when it means ‘to refine’ or ‘to clarify, verify’. It is incorrect with other meanings."]
    ,"Correcte en el sentit de 'depurar' o 'posar en clar, verificar'. Incorrecte en altres sentits.": ["Correcto con el sentido de «depurar» o «aclarar, verificar». Incorrecto con otros sentidos.", "Correct when it means ‘to refine’ or ‘to clarify, verify’. Incorrect with other meanings."]
    ,"¿Voleu usar una fletxa?": ["¿Quieres usar una flecha?", "Would you like to use an arrow?"]
    ,"Aquest topònim sol dur article.": ["Este topónimo suele llevar artículo.", "This place name usually takes an article."]
    ,"En aquest cas, 'art' sol ser femení.": ["En este caso, «art» suele ser femenino.", "In this case, ‘art’ is usually feminine."]
    ,"Com a preposició cal escriure __SUGGESTION_1__ o __SUGGESTION_2__ (davall).": ["Como preposición, hay que escribir «{suggestion1}» o «{suggestion2}» (debajo).", "As a preposition, write ‘{suggestion1}’ or ‘{suggestion2}’ (underneath)."]
    ,"En el sentit de 'tenir en compte' el v. 'atendre' és transitiu.": ["Con el sentido de «tener en cuenta», el verbo «atendre» es transitivo.", "When it means ‘to take into account’, the verb ‘atendre’ is transitive."]
    ,"Variant secundària no admesa per tots els diccionaris.": ["Variante secundaria no admitida por todos los diccionarios.", "Secondary variant not accepted by all dictionaries."]
    ,"En sentit figurat val més fer servir una altra expressió.": ["En sentido figurado, es preferible usar otra expresión.", "Use a different expression in the figurative sense."]
    ,"L'article adequat per a les hores és \"la\".": ["El artículo adecuado para las horas es «la».", "The correct article for times is ‘la’."]
    ,"L'article adequat per a les hores és \"les\".": ["El artículo adecuado para las horas es «les».", "The correct article for times is ‘les’."]
    ,"En sentit figurat, val més evitar aquesta expressió.": ["En sentido figurado, es preferible evitar esta expresión.", "Avoid this expression in the figurative sense."]
    ,"Error de sintaxi.": ["Error de sintaxis.", "Syntax error."]
    ,"En el sentit de 'saliva' cal escriure __SUGGESTION_1__.": ["Con el sentido de «saliva», debe escribirse «{suggestion1}».", "When it means ‘saliva’, write ‘{suggestion1}’."]
    ,"Possible confusió. ¿Volíeu dir __SUGGESTION_1__ (àvia en llenguatge infantil)?": ["Posible confusión. ¿Querías decir «{suggestion1}» (abuela en lenguaje infantil)?", "Possible confusion. Did you mean ‘{suggestion1}’ (a childish word for grandmother)?"]
    ,"Aquesta construcció s'escriu sense 'a'. No confongueu \"donar la benvinguda a tothom\" amb \"(sigueu) benvinguts tots\".": ["Esta construcción se escribe sin «a». No confundas «donar la benvinguda a tothom» con «(sigueu) benvinguts tots».", "This construction is written without ‘a’. Do not confuse ‘donar la benvinguda a tothom’ with ‘(sigueu) benvinguts tots’."]
    ,"Paraula incorrecta en aquest context. \"Càmera\" només és vàlid en el sentit d'aparell per a reproduir imatges.": ["Palabra incorrecta en este contexto. «Càmera» solo es válido para el aparato que reproduce imágenes.", "Incorrect word in this context. ‘Càmera’ is valid only for a device that reproduces images."]
    ,"Val més canviar la preposició o bé canviar l'infinitiu per un gerundi.": ["Es preferible cambiar la preposición o sustituir el infinitivo por un gerundio.", "Change the preposition or replace the infinitive with a gerund."]
    ,"Si és un verb, s'escriu sense accent.": ["Si es un verbo, se escribe sin tilde.", "If it is a verb, it is written without an accent mark."]
    ,"Expressió incorrecta. Caldria dir \"caure-hi\" o \"adonar-se'n\".": ["Expresión incorrecta. Debería decirse «caure-hi» o «adonar-se'n».", "Incorrect expression. Use ‘caure-hi’ or ‘adonar-se'n’."]
    ,"Les sigles habituals de Comissions Obreres són __SUGGESTION_1__.": ["La sigla habitual de Comissions Obreres es «{suggestion1}».", "The usual initialism for Comissions Obreres is ‘{suggestion1}’."]
    ,"Els contractes se subscriuen o se signen.": ["Los contratos se suscriben o se firman.", "Contracts are subscribed to or signed."]
    ,"La preposició adequada és \"per a\".": ["La preposición adecuada es «per a».", "The correct preposition is ‘per a’."]
    ,"En sentit figurat, diem \"agafar-se a la taula de salvació\".": ["En sentido figurado, se dice «agafar-se a la taula de salvació».", "Figuratively, the expression is ‘agafar-se a la taula de salvació’."]
    ,"En el sentit d'esfondrar-se, \"col·lapsar\" és un anglicisme.": ["Con el sentido de «derrumbarse», «col·lapsar» es un anglicismo.", "When it means ‘to collapse’, ‘col·lapsar’ is an anglicism."]
    ,"Aquesta coma és probablement incorrecta.": ["Esta coma probablemente es incorrecta.", "This comma is probably incorrect."]
    ,"Probablement sobra la coma entre subjecte i predicat. Correcte si és un vocatiu (\"Joan, vine ací!\").": ["Probablemente sobra la coma entre sujeto y predicado. Es correcta si es un vocativo («Joan, vine ací!»).", "The comma between subject and predicate is probably unnecessary. It is correct in a vocative (‘Joan, vine ací!’)."]
    ,"Hi manca un apòstrof.": ["Falta un apóstrofo.", "An apostrophe is missing."]
    ,"Error de concordança en el participi.": ["Error de concordancia en el participio.", "Agreement error in the participle."]
    ,"Error de concordança. El nom \"credencial\" és femení.": ["Error de concordancia. El sustantivo «credencial» es femenino.", "Agreement error. The noun ‘credencial’ is feminine."]
    ,"Possible error de concordança. Sembla que el verb hauria d'anar en plural.": ["Posible error de concordancia. Parece que el verbo debería ir en plural.", "Possible agreement error. The verb seems to need the plural form."]
    ,"Aquesta expressió és un anglicisme.": ["Esta expresión es un anglicismo.", "This expression is an anglicism."]
    ,"Aquest nom s'usa normalment en singular. El plural pot ser una influència de l'anglès.": ["Este sustantivo suele usarse en singular. El plural puede deberse a la influencia del inglés.", "This noun is usually singular. The plural may be influenced by English."]
    ,"La persona amb qui es \\3 s'introdueix amb la preposició 'amb'.": ["La persona con quien se «\\3» se introduce con la preposición «amb».", "The person one ‘\\3s’ is introduced with the preposition ‘amb’."]
    ,"Potser cal escriure __SUGGESTION_1__ ('en qualitat de', 'amb caràcter de', 'en funció de').": ["Quizá haya que escribir «{suggestion1}» («en calidad de», «con carácter de», «en función de»).", "Write ‘{suggestion1}’ here (‘in the capacity of’, ‘with the character of’, ‘as’)."]
    ,"Si és una forma del verb 'continuar', s'escriu sense accent.": ["Si es una forma del verbo «continuar», se escribe sin tilde.", "If it is a form of ‘continuar’, it is written without an accent mark."]
    ,"Aquest nom és masculí.": ["Este sustantivo es masculino.", "This noun is masculine."]
    ,"Forma secundària, no admesa en tots els diccionaris.": ["Forma secundaria, no admitida en todos los diccionarios.", "Secondary form, not accepted by all dictionaries."]
    ,"Col·loquialisme no admès pels diccionaris.": ["Coloquialismo no admitido por los diccionarios.", "Colloquialism not accepted by dictionaries."]
    ,"Si és un nom, cal dir __SUGGESTION_1__. \"Dejú\" és correcte com a adjectiu.": ["Si es un sustantivo, debe decirse «{suggestion1}». «Dejú» es correcto como adjetivo.", "If it is a noun, use ‘{suggestion1}’. ‘Dejú’ is correct as an adjective."]
    ,"S'escriu junt sense apòstrof.": ["Se escribe junto y sin apóstrofo.", "Write it as one word without an apostrophe."]
    ,"\"\\2\" sols pot ser adjectiu. Com a nom, digueu __SUGGESTION_1__.": ["«\\2» solo puede ser adjetivo. Como sustantivo, usa «{suggestion1}».", "‘\\2’ can only be an adjective. Use ‘{suggestion1}’ as a noun."]
    ,"No s'escriu amb guionet.": ["No se escribe con guion.", "Do not write it with a hyphen."]
    ,"Falta un article davant del nom.": ["Falta un artículo delante del sustantivo.", "An article is missing before the noun."]
    ,"La forma correcta és __SUGGESTION_1__.": ["La forma correcta es «{suggestion1}».", "The correct form is ‘{suggestion1}’."]
    ,"La forma adequada és __SUGGESTION_1__.": ["La forma adecuada es «{suggestion1}».", "The appropriate form is ‘{suggestion1}’."]
    ,"Cal usar el pronom 'en'.": ["Hay que usar el pronombre «en».", "Use the pronoun ‘en’."]
    ,"Cal usar el pronom 'hi'.": ["Hay que usar el pronombre «hi».", "Use the pronoun ‘hi’."]
    ,"Probablement hi falta el pronom 'hi'.": ["Probablemente falta el pronombre «hi».", "The pronoun ‘hi’ is probably missing."]
    ,"Hi falta la preposició 'de'.": ["Falta la preposición «de».", "The preposition ‘de’ is missing."]
    ,"Hi falta la preposició 'a'.": ["Falta la preposición «a».", "The preposition ‘a’ is missing."]
    ,"Aquest verb no regeix la preposició 'de'.": ["Este verbo no rige la preposición «de».", "This verb does not take the preposition ‘de’."]
    ,"Aquest verb regeix la preposició 'a'.": ["Este verbo rige la preposición «a».", "This verb takes the preposition ‘a’."]
    ,"Cal eliminar el pronom reflexiu.": ["Hay que eliminar el pronombre reflexivo.", "Remove the reflexive pronoun."]
    ,"Construcció incorrecta en aquest context.": ["Construcción incorrecta en este contexto.", "Incorrect construction in this context."]
    ,"Expressió incorrecta en aquest context.": ["Expresión incorrecta en este contexto.", "Incorrect expression in this context."]
    ,"Cal escriure __SUGGESTION_1__ en aquest context.": ["En este contexto debe escribirse «{suggestion1}».", "Write ‘{suggestion1}’ in this context."]
    ,"En aquest context, val més usar \"destinació\", encara que són sinònims segons els diccionaris.": ["En este contexto, es preferible usar «destinació», aunque los diccionarios los consideran sinónimos.", "Use ‘destinació’ in this context, although dictionaries list them as synonyms."]
    ,"Construcció incorrecta. Trieu una de les opcions alternatives.": ["Construcción incorrecta. Elige una de las opciones alternativas.", "Incorrect construction. Choose one of the alternatives."]
    ,"Combinació impossible de determinants.": ["Combinación imposible de determinantes.", "Impossible combination of determiners."]
    ,"Combinació impossible de determinants o pronoms.": ["Combinación imposible de determinantes o pronombres.", "Impossible combination of determiners or pronouns."]
    ,"Incorrecte si és una construcció de condicional.": ["Incorrecto si es una construcción condicional.", "Incorrect if it is a conditional construction."]
    ,"Expressió llatina mal escrita.": ["Expresión latina mal escrita.", "Misspelled Latin expression."]
    ,"Construcció probablement incorrecta. Només és correcta si equival a \"del qual\" o \"de quina cosa\".": ["Construcción probablemente incorrecta. Solo es correcta si equivale a «del cual» o «de qué cosa».", "Probably incorrect construction. It is correct only if it means ‘of which’ or ‘of what’. "]
    ,"Sembla que hi falta un \"que\" o una coma.": ["Parece que falta un «que» o una coma.", "A ‘que’ or a comma seems to be missing."]
    ,"Si és un nom, s'escriu amb accent. Correcte si és una forma del v. 'diferenciar'.": ["Si es un sustantivo, lleva tilde. Es correcto sin tilde si es una forma del verbo «diferenciar».", "If it is a noun, it takes an accent mark. It is correct without one if it is a form of ‘diferenciar’."]
    ,"Si és una forma del v. 'diferenciar', s'escriu sense accent. Si és un nom, hi ha un error de concordança.": ["Si es una forma del verbo «diferenciar», se escribe sin tilde. Si es un sustantivo, hay un error de concordancia.", "A form of ‘diferenciar’ is written without an accent mark. If this is a noun, there is an agreement error."]
    ,"És preferible no fer transitiu aquest verb.": ["Es preferible no usar este verbo como transitivo.", "This verb is preferably not used transitively."]
    ,"Sovint s'abusa d'aquest adjectiu per influència de l'anglès. Considereu una opció alternativa.": ["A menudo se abusa de este adjetivo por influencia del inglés. Considera una alternativa.", "This adjective is often overused under English influence. Consider an alternative."]
    ,"Forma secundària no admesa per tots els diccionaris.": ["Forma secundaria no admitida por todos los diccionarios.", "Secondary form not accepted by all dictionaries."]
    ,"Si és un nom, s'escriu amb accent. Correcte si és una forma del v. 'distanciar'.": ["Si es un sustantivo, lleva tilde. Es correcto sin tilde si es una forma del verbo «distanciar».", "If it is a noun, it takes an accent mark. It is correct without one if it is a form of ‘distanciar’."]
    ,"Expressió incorrecta en el sentit de 'girar-se, tombar-se'.": ["Expresión incorrecta con el sentido de «girarse, darse la vuelta».", "Incorrect expression when used to mean ‘to turn around’."]
    ,"\"Donar-se compte\" és una expressió incorrecta si equival a 'adonar-se'; és correcta si vol dir 'retre compte'.": ["«Donar-se compte» es incorrecto si equivale a «adonar-se»; es correcto con el sentido de «rendir cuentas».", "‘Donar-se compte’ is incorrect when it means ‘to realize’; it is correct when it means ‘to account for’."]
    ,"Amb el sentit de 'fer llàstima, commoure' val més usar el verb 'fer'. 'Donar pena' és correcte amb el sentit de 'molestar, fer nosa'.": ["Con el sentido de «dar lástima, conmover», es preferible usar el verbo «fer». «Donar pena» es correcto con el sentido de «molestar».", "Use ‘fer’ when you mean ‘to move or evoke pity’. ‘Donar pena’ is correct when it means ‘to bother’."]
    ,"En aquest context, cal fer servir una altra expressió.": ["En este contexto, hay que usar otra expresión.", "Use a different expression in this context."]
    ,"¿Volíeu dir __SUGGESTION_1__ (ocultació d'un astre)? \"Eclipse\" és una forma verbal valenciana del v. 'eclipsar'.": ["¿Querías decir «{suggestion1}» (ocultación de un astro)? «Eclipse» es una forma verbal valenciana de «eclipsar».", "Did you mean ‘{suggestion1}’ (the occultation of a celestial body)? ‘Eclipse’ is a Valencian verb form of ‘eclipsar’."]
    ,"\"Eclipsis\" és plural. Si us referiu a un sol fenomen, useu la forma singular.": ["«Eclipsis» es plural. Si te refieres a un solo fenómeno, usa el singular.", "‘Eclipsis’ is plural. Use the singular if referring to one event."]
    ,"El terme \"Nadal\" va generalment sense article.": ["El término «Nadal» suele ir sin artículo.", "The term ‘Nadal’ is usually used without an article."]
    ,"Incorrecte com a nom. \"Empalme\" és una forma verbal valenciana del v. 'empalmar'.": ["Incorrecto como sustantivo. «Empalme» es una forma verbal valenciana de «empalmar».", "Incorrect as a noun. ‘Empalme’ is a Valencian verb form of ‘empalmar’."]
    ,"Useu una expressió més adequada. \"Encantat\" vol dir 'distret, aturat'.": ["Usa una expresión más adecuada. «Encantat» significa «distraído, parado».", "Use a more suitable expression. ‘Encantat’ means ‘distracted’ or ‘stopped’."]
    ,"¿Volíeu dir \"entesa\" (acord) en comptes de \"enteniment\" (seny)?": ["¿Querías decir «entesa» (acuerdo) en vez de «enteniment» (juicio)?", "Did you mean ‘entesa’ (agreement) rather than ‘enteniment’ (judgment)?"]
    ,"'Enterar-se' és un castellanisme que cal evitar.": ["«Enterar-se» es un calco del castellano que debe evitarse.", "‘Enterar-se’ is a Spanish calque and should be avoided."]
    ,"En sentit figurat, useu una altra expressió.": ["En sentido figurado, usa otra expresión.", "Use a different expression in the figurative sense."]
    ,"Possible confusió de 'addicció' amb 'addició'. A més, \"en addició\" és un anglicisme inacceptable.": ["Posible confusión entre «addicció» y «addició». Además, «en addició» es un anglicismo inaceptable.", "Possible confusion between ‘addicció’ and ‘addició’. Also, ‘en addició’ is an unacceptable anglicism."]
    ,"Anglicisme inacceptable.": ["Anglicismo inaceptable.", "Unacceptable anglicism."]
    ,"La preposició adequada en aquesta expressió és \"de\".": ["La preposición adecuada en esta expresión es «de».", "The correct preposition in this expression is ‘de’."]
    ,"Si el pronom '\\4' no es refereix a una persona, val més usar simplement el pronom 'hi'.": ["Si el pronombre «\\4» no se refiere a una persona, es preferible usar simplemente «hi».", "If the pronoun ‘\\4’ does not refer to a person, simply use ‘hi’."]
    ,"La preposició adequada és \"de\".": ["La preposición adecuada es «de».", "The correct preposition is ‘de’."]
    ,"Expressió incorrecta si equival a __SUGGESTION_1__.": ["Expresión incorrecta si equivale a «{suggestion1}».", "Incorrect expression if it means ‘{suggestion1}’."]
    ,"La preposició adequada en aquesta expressió és __SUGGESTION_1__.": ["La preposición adecuada en esta expresión es «{suggestion1}».", "The correct preposition in this expression is ‘{suggestion1}’."]
    ,"Amb un complement introduït per la preposició 'sense', no s'usa el pronom 'en'.": ["Con un complemento introducido por «sense», no se usa el pronombre «en».", "Do not use the pronoun ‘en’ with a complement introduced by ‘sense’."]
    ,"Fórmula de llenguatge jurídic. Calc del castellà que cal evitar.": ["Fórmula del lenguaje jurídico. Calco del castellano que debe evitarse.", "Legal formula calqued from Spanish; avoid it."]
    ,"S'accentua si és del verb 'ser'.": ["Lleva tilde si es una forma del verbo «ser».", "It takes an accent mark if it is a form of ‘ser’."]
    ,"Possible error de concordança. Correcte si és femení.": ["Posible error de concordancia. Es correcto si es femenino.", "Possible agreement error. It is correct if feminine."]
    ,"És preferible usar un ordre més natural.": ["Es preferible usar un orden más natural.", "A more natural word order is preferable."]
    ,"Possible error: paraula repetida.": ["Posible error: palabra repetida.", "Possible error: repeated word."]
    ,"Els pronoms s'han d'escriure junts.": ["Los pronombres se escriben juntos.", "Pronouns are written together."]
    ,"Aquesta forma verbal no es correspon amb la varietat seleccionada (central).": ["Esta forma verbal no corresponde a la variedad seleccionada (catalán central).", "This verb form does not match the selected variety (Central Catalan)."]
    ,"Normalment s'escriu sense guionet.": ["Normalmente se escribe sin guion.", "It is usually written without a hyphen."]
    ,"¿Volíeu dir \"error\"? \"Fallo\" pot ser una forma del verb 'fallar'.": ["¿Querías decir «error»? «Fallo» puede ser una forma del verbo «fallar».", "Did you mean ‘error’? ‘Fallo’ can be a form of the verb ‘fallar’."]
    ,"Probablement hi falta un verb en condicional.": ["Probablemente falta un verbo en condicional.", "A conditional verb is probably missing."]
    ,"Forma col·loquial de __SUGGESTION_1__. Correcte com a forma del verb 'cremar'.": ["Forma coloquial de «{suggestion1}». Es correcta como forma del verbo «cremar».", "Colloquial form of ‘{suggestion1}’. It is correct as a form of ‘cremar’."]
    ,"És preferible escriure el format de data complet amb la preposició 'de'.": ["Es preferible escribir la fecha completa con la preposición «de».", "Write the full date format with the preposition ‘de’."]
    ,"Cal dir __SUGGESTION_1__.": ["Debe decirse «{suggestion1}».", "Use ‘{suggestion1}’."]
    ,"¿Volíeu dir \"greix\"? \"Grassa\" és un adjectiu, femení de \"gras\".": ["¿Querías decir «greix»? «Grassa» es un adjetivo, femenino de «gras».", "Did you mean ‘greix’? ‘Grassa’ is an adjective, the feminine form of ‘gras’."]
    ,"Sobra un guionet.": ["Sobra un guion.", "There is an extra hyphen."]
    ,"Incorrecte si vol dir __SUGGESTION_1__.": ["Incorrecto si significa «{suggestion1}».", "Incorrect if it means ‘{suggestion1}’."]
    ,"Hi falta un participi, el pronom 'hi' o la preposició 'de' seguida d'un infinitiu.": ["Falta un participio, el pronombre «hi» o la preposición «de» seguida de un infinitivo.", "A participle, the pronoun ‘hi’, or the preposition ‘de’ followed by an infinitive is missing."]
    ,"Hi falta un participi o la preposició 'de' seguida d'un infinitiu.": ["Falta un participio o la preposición «de» seguida de un infinitivo.", "A participle or the preposition ‘de’ followed by an infinitive is missing."]
    ,"Falta un participi darrere del verb auxiliar 'haver'.": ["Falta un participio después del verbo auxiliar «haver».", "A participle is missing after the auxiliary verb ‘haver’."]
    ,"S'escriu amb hac perquè és una forma del verb 'haver'.": ["Se escribe con h porque es una forma del verbo «haver».", "It is written with h because it is a form of ‘haver’."]
    ,"Probablement cal usar la conjunció __SUGGESTION_1__ i no el pronom \"hi\".": ["Probablemente hay que usar la conjunción «{suggestion1}» y no el pronombre «hi».", "Use the conjunction ‘{suggestion1}’, not the pronoun ‘hi’."]
    ,"Possible redundància. Potser cal eliminar el pronom feble.": ["Posible redundancia. Quizá haya que eliminar el pronombre débil.", "Possible redundancy. The weak pronoun may need to be removed."]
    ,"En les expressions d’hores, usem el punt o els dos punts (sistema internacional).": ["Para expresar las horas, se usa el punto o los dos puntos (sistema internacional).", "Use a full stop or a colon to write times (international standard)."]
    ,"És una forma pròpia del valencià.": ["Es una forma propia del valenciano.", "This form is specific to Valencian."]
    ,"És una forma pròpia del balear.": ["Es una forma propia del balear.", "This form is specific to Balearic Catalan."]
    ,"És una forma pròpia del català central.": ["Es una forma propia del catalán central.", "This form is specific to Central Catalan."]
    ,"Sigles de \"recerca i desenvolupament\".": ["Siglas de «recerca i desenvolupament» (investigación y desarrollo).", "Initialism for ‘recerca i desenvolupament’ (research and development)."]
    ,"El verb adequat és 'inserir'.": ["El verbo adecuado es «inserir».", "The correct verb is ‘inserir’."]
    ,"Probablement cal dir __SUGGESTION_1__ o __SUGGESTION_2__. \"En què\" és correcte si vol dir 'en el qual' o 'en quina cosa'.": ["Probablemente hay que decir «{suggestion1}» o «{suggestion2}». «En què» es correcto si significa «en el cual» o «en qué cosa».", "Use ‘{suggestion1}’ or ‘{suggestion2}’. ‘En què’ is correct when it means ‘in which’ or ‘in what’."]
    ,"\"Intríngulis\" és una paraula d'ús informal no admesa en tots els diccionaris.": ["«Intríngulis» es una palabra informal que no admiten todos los diccionarios.", "‘Intríngulis’ is an informal word not accepted by all dictionaries."]
    ,"En un context formal val més eliminar aquesta expressió o usar-ne una altra.": ["En un contexto formal, es preferible eliminar esta expresión o usar otra.", "In a formal context, remove this expression or use another one."]
    ,"Eviteu aquest calc del castellà.": ["Evita este calco del castellano.", "Avoid this Spanish calque."]
    ,"Refrany equivalent.": ["Refrán equivalente.", "Equivalent proverb."]
    ,"Expressió inadequada amb sentit exclamatiu.": ["Expresión inadecuada con sentido exclamativo.", "Unsuitable expression when used exclamatively."]
    ,"Incorrecte si equival a 'deslliurar, estalviar'.": ["Incorrecto si equivale a «librar, ahorrar».", "Incorrect if it means ‘to free’ or ‘to save’."]
    ,"No s'apostrofa davant d'alguns mots forasters que es pronuncien amb diftong.": ["No se usa apóstrofo delante de algunas palabras extranjeras que se pronuncian con diptongo.", "Do not use an apostrophe before some foreign words pronounced with a diphthong."]
    ,"Hi falta una majúscula o un signe de puntuació.": ["Falta una mayúscula o un signo de puntuación.", "A capital letter or punctuation mark is missing."]
    ,"L'abreviació de \"Maria\" és __SUGGESTION_1__.": ["La abreviatura de «Maria» es «{suggestion1}».", "The abbreviation for ‘Maria’ is ‘{suggestion1}’."]
    ,"El verb 'marxar' no és reflexiu.": ["El verbo «marxar» no es reflexivo.", "The verb ‘marxar’ is not reflexive."]
    ,"Incorrecte si és del v. '*medir'. El v. 'mediar' (mitjançar) és admès en alguns diccionaris.": ["Incorrecto si es una forma del verbo «medir». El verbo «mediar» (intermediar) está admitido en algunos diccionarios.", "Incorrect if it is a form of ‘medir’. The verb ‘mediar’ (to mediate) is accepted by some dictionaries."]
    ,"¿Volíeu dir __SUGGESTION_1__ (adverbi)? \"Mentre\" (conjunció) és adequat si equival a 'durant el temps en què'.": ["¿Querías decir «{suggestion1}» (adverbio)? «Mentre» (conjunción) es adecuado si equivale a «durante el tiempo en que».", "Did you mean ‘{suggestion1}’ (the adverb)? ‘Mentre’ (the conjunction) is suitable when it means ‘during the time that’."]
    ,"L'adjectiu adequat és __SUGGESTION_1__.": ["El adjetivo adecuado es «{suggestion1}».", "The correct adjective is ‘{suggestion1}’."]
    ,"Construcció incompleta.": ["Construcción incompleta.", "Incomplete construction."]
    ,"Hi sobra la preposició 'de'.": ["Sobra la preposición «de».", "The preposition ‘de’ is unnecessary."]
    ,"Normalment s'escriu amb guionet.": ["Normalmente se escribe con guion.", "It is usually written with a hyphen."]
    ,"Normalment s'escriu junt sense guionet.": ["Normalmente se escribe junto, sin guion.", "It is usually written as one word, without a hyphen."]
    ,"S'escriu tot junt.": ["Se escribe todo junto.", "Write it as one word."]
    ,"No és recomanable barrejar xifres i lletres.": ["No se recomienda mezclar cifras y letras.", "Avoid mixing numerals and words."]
    ,"Si és el nom d'una llengua i no forma part d'un nom propi, s'escriu en minúscula.": ["Si es el nombre de una lengua y no forma parte de un nombre propio, se escribe en minúscula.", "If it names a language and is not part of a proper name, write it in lowercase."]
    ,"Useu les majúscules adequades.": ["Usa las mayúsculas adecuadas.", "Use capitalization appropriately."]
    ,"Expressió incorrecta en el sentit de 'no encertar'.": ["Expresión incorrecta con el sentido de «no acertar».", "Incorrect expression when it means ‘to miss’ or ‘to get wrong’."]
    ,"Expressió incorrecta en el sentit de __SUGGESTION_1__.": ["Expresión incorrecta con el sentido de «{suggestion1}».", "Incorrect expression when it means ‘{suggestion1}’."]
    ,"Col·loquialisme admès només per alguns diccionaris.": ["Coloquialismo admitido solo por algunos diccionarios.", "Colloquialism accepted by only some dictionaries."]
    ,"En referència al cap de l'Església catòlica o com a nom comú, s'escriu en minúscula.": ["Al referirse al jefe de la Iglesia católica o como nombre común, se escribe en minúscula.", "When referring to the head of the Catholic Church or used as a common noun, write it in lowercase."]
    ,"Ús pronominal incorrecte. Cal eliminar el pronom reflexiu.": ["Uso pronominal incorrecto. Hay que eliminar el pronombre reflexivo.", "Incorrect pronominal use. Remove the reflexive pronoun."]
    ,"Incorrecte en el sentit de __SUGGESTION_1__.": ["Incorrecto con el sentido de «{suggestion1}».", "Incorrect when used to mean ‘{suggestion1}’."]
    ,"Com a substantiu, cal dir __SUGGESTION_1__. Correcte si és del v. 'pesar'.": ["Como sustantivo, debe decirse «{suggestion1}». Es correcto si es una forma del verbo «pesar».", "Use ‘{suggestion1}’ as a noun. It is correct if it is a form of ‘pesar’."]
    ,"Combinació de temps verbals probablement incorrecta.": ["Combinación de tiempos verbales probablemente incorrecta.", "Probably incorrect combination of verb tenses."]
    ,"En aquest cas és preferible usar la preposició \"de\".": ["En este caso, es preferible usar la preposición «de».", "Use the preposition ‘de’ in this case."]
    ,"Ús probablement incorrecte. \"Precisar\" vol dir 'determinar amb precisió'.": ["Uso probablemente incorrecto. «Precisar» significa «determinar con precisión».", "Probably incorrect use. ‘Precisar’ means ‘to determine precisely’."]
    ,"En els títols escrits amb majúscules, les preposicions s'escriuen amb minúscula.": ["En los títulos escritos en mayúsculas, las preposiciones van en minúscula.", "In titles written in uppercase, prepositions remain lowercase."]
    ,"Els càrrecs i les formes de tractament s'escriuen en minúscula, excepte en el tractament protocol·lari (ex. Molt Honorable Senyor President) o si formen part d'un nom propi.": ["Los cargos y tratamientos se escriben en minúscula, salvo en tratamientos protocolarios (p. ej., Molt Honorable Senyor President) o si forman parte de un nombre propio.", "Titles and forms of address are lowercase, except in formal protocol (e.g. Molt Honorable Senyor President) or as part of a proper name."]
    ,"Combinació incorrecta d'apòstrofs i guionets.": ["Combinación incorrecta de apóstrofos y guiones.", "Incorrect combination of apostrophes and hyphens."]
    ,"Cal usar la forma reforçada.": ["Hay que usar la forma reforzada.", "Use the strong form."]
    ,"Hi sobra un espai.": ["Sobra un espacio.", "There is an extra space."]
    ,"Hi sobren espais.": ["Sobran espacios.", "There are extra spaces."]
    ,"Si és del verb 'haver', s'escriu amb 'h'.": ["Si es una forma del verbo «haver», se escribe con «h».", "If it is a form of ‘haver’, it is written with ‘h’."]
    ,"El pronom més adequat sembla \"en\" (referit a \"\\2\").": ["El pronombre más adecuado parece «en» (referido a «\\2»).", "The most suitable pronoun seems to be ‘en’ (referring to ‘\\2’)."]
    ,"En aquest cas val més evitar l'adjectiu \"proper\".": ["En este caso, es preferible evitar el adjetivo «proper».", "Avoid the adjective ‘proper’ in this case."]
    ,"\"Proper\" és inadequat o redundant en expressions de temps.": ["«Proper» es inadecuado o redundante en expresiones temporales.", "‘Proper’ is unsuitable or redundant in time expressions."]
    ,"En el sentit de 'intentar, mirar de' cal usar la preposició \"de\".": ["Con el sentido de «intentar», hay que usar la preposición «de».", "When it means ‘to try’, use the preposition ‘de’."]
    ,"Si equival a \"quina cosa\", cal escriure __SUGGESTION_1__. S’escriu sense accent si la resposta és «sí» o «no».": ["Si equivale a «qué cosa», debe escribirse «{suggestion1}». Se escribe sin tilde si la respuesta es «sí» o «no».", "If it means ‘what thing’, write ‘{suggestion1}’. It has no accent mark when the answer is ‘yes’ or ‘no’."]
    ,"No s'accentua si la resposta a la pregunta és \"sí\" o \"no\". S'accentua si es pot substituir per \"quina cosa\".": ["No lleva tilde si la respuesta a la pregunta es «sí» o «no». Sí la lleva si puede sustituirse por «qué cosa».", "It has no accent mark if the answer is ‘yes’ or ‘no’. It does take one if it can be replaced by ‘what thing’."]
    ,"\"Raïm\" s'usa normalment en singular. En plural és correcte si parlem de diverses panícules.": ["«Raïm» suele usarse en singular. El plural es correcto si se habla de varios racimos.", "‘Raïm’ is usually singular. The plural is correct when referring to multiple bunches."]
    ,"Anglicisme, llenguatge col·loquial.": ["Anglicismo; lenguaje coloquial.", "Anglicism; colloquial language."]
    ,"Probablement cal dir __SUGGESTION_1__.Un \"regle\" és un instrument per a traçar o mesurar línies.": ["Probablemente debe decirse «{suggestion1}». Un «regle» es un instrumento para trazar o medir líneas.", "Use ‘{suggestion1}’. A ‘regle’ is a tool for drawing or measuring lines."]
    ,"Com a substantiu, és preferible dir \"rematada\", \"últim retoc\", \"acabament\", \"coronament\". \"Remat\" no és admès per tots els diccionaris.": ["Como sustantivo, es preferible decir «rematada», «últim retoc», «acabament» o «coronament». «Remat» no lo admiten todos los diccionarios.", "As a noun, ‘rematada’, ‘últim retoc’, ‘acabament’ or ‘coronament’ is preferable. ‘Remat’ is not accepted by all dictionaries."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Rentes\" és una forma del verb 'rentar' (=netejar).": ["¿Querías decir «{suggestion1}»? «Rentes» es una forma del verbo «rentar» (limpiar).", "Did you mean ‘{suggestion1}’? ‘Rentes’ is a form of ‘rentar’ (to wash)."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Renta\" és una forma del verb 'rentar' (=netejar).": ["¿Querías decir «{suggestion1}»? «Renta» es una forma del verbo «rentar» (limpiar).", "Did you mean ‘{suggestion1}’? ‘Renta’ is a form of ‘rentar’ (to wash)."]
    ,"És un anglicisme en el sentit de 'repetir'.": ["Es un anglicismo con el sentido de «repetir».", "It is an anglicism when used to mean ‘to repeat’."]
    ,"Ja ha aparegut abans la paraula 'cosa'. Podeu usar una altra expressió per a fer més variat el text.": ["La palabra «cosa» ya ha aparecido antes. Puedes usar otra expresión para dar variedad al texto.", "The word ‘cosa’ has already appeared. Use a different expression to vary the text."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Requeriment\" (instigació verbal o escrita; acció de requerir) només és adequat en llenguatge jurídic.": ["¿Querías decir «{suggestion1}»? «Requeriment» (instigación verbal o escrita; acción de requerir) solo es adecuado en lenguaje jurídico.", "Did you mean ‘{suggestion1}’? ‘Requeriment’ (a verbal or written demand; the act of requiring) is suitable only in legal language."]
    ,"Els ordinals romans no necessiten la terminació d'ordinal.": ["Los ordinales romanos no necesitan la terminación ordinal.", "Roman ordinals do not need an ordinal suffix."]
    ,"Hi falten espais.": ["Faltan espacios.", "Spaces are missing."]
    ,"És preferible usar el verb \"continuar\".": ["Es preferible usar el verbo «continuar».", "Use the verb ‘continuar’."]
    ,"El pronom 'li' és incorrecte en aquest context.": ["El pronombre «li» es incorrecto en este contexto.", "The pronoun ‘li’ is incorrect in this context."]
    ,"El pronom adequat és probablement 'el' o 'la'.": ["El pronombre adecuado probablemente es «el» o «la».", "The correct pronoun is probably ‘el’ or ‘la’."]
    ,"Si és una afirmació, cal dir __SUGGESTION_1__.": ["Si es una afirmación, debe decirse «{suggestion1}».", "If it is an assertion, use ‘{suggestion1}’."]
    ,"Si és una conjunció condicional, s'escriu sense accent: __SUGGESTION_1__. Si és una afirmació, cal dir __SUGGESTION_2__.": ["Si es una conjunción condicional, se escribe sin tilde: «{suggestion1}». Si es una afirmación, debe decirse «{suggestion2}».", "As a conditional conjunction, it has no accent mark: ‘{suggestion1}’. For an assertion, use ‘{suggestion2}’."]
    ,"No s'accentua si no és del verb 'ser'.": ["No lleva tilde si no es una forma del verbo «ser».", "It has no accent mark unless it is a form of ‘ser’."]
    ,"Expressió mal escrita.": ["Expresión mal escrita.", "Misspelled expression."]
    ,"Probablement manca un accent en el verb perquè sigui imperfet de subjuntiu.": ["Probablemente falta una tilde en el verbo para que sea imperfecto de subjuntivo.", "The verb probably needs an accent mark to form the imperfect subjunctive."]
    ,"Paraula mal partida.": ["Palabra mal dividida.", "Incorrectly split word."]
    ,"Calc del castellà innecessari.": ["Calco innecesario del castellano.", "Unnecessary calque from Spanish."]
    ,"Abreviatura de telèfon.": ["Abreviatura de teléfono.", "Abbreviation for telephone."]
    ,"Abreviatura de telèfons (també en plural).": ["Abreviatura de teléfonos (también en plural).", "Abbreviation for telephone numbers (also in the plural)."]
    ,"Expressió incorrecta amb el sentit de __SUGGESTION_1__ (comerç il·legal).": ["Expresión incorrecta con el sentido de «{suggestion1}» (comercio ilegal).", "Incorrect expression when it means ‘{suggestion1}’ (illegal trade)."]
    ,"En el sentit de 'circulació, moviment' cal dir __SUGGESTION_1__. 'Tràfic' té el sentit de comerç (legal o clandestí).": ["Con el sentido de «circulación, movimiento», debe decirse «{suggestion1}». «Tràfic» significa comercio, legal o clandestino.", "When it means ‘circulation, movement’, use ‘{suggestion1}’. ‘Tràfic’ means trade, legal or illegal."]
    ,"Expressió incorrecta en el sentit de 'fer punta a un llapis'. En altres sentits, no és admesa per tots els diccionaris.": ["Expresión incorrecta con el sentido de «sacar punta a un lápiz». Con otros sentidos, no la admiten todos los diccionarios.", "Incorrect expression when it means ‘to sharpen a pencil’. Other meanings are not accepted by all dictionaries."]
    ,"Calc del castellà. Useu una altra expressió.": ["Calco del castellano. Usa otra expresión.", "Spanish calque. Use a different expression."]
    ,"Incorrecte amb valor quantitatiu o indefinit.": ["Incorrecto con valor cuantitativo o indefinido.", "Incorrect when used quantitatively or indefinitely."]
    ,"Aquest verb hauria d'estar en imperfet de subjuntiu.": ["Este verbo debería estar en imperfecto de subjuntivo.", "This verb should be in the imperfect subjunctive."]
    ,"Amb el sentit de \"lloc per a canviar-se de roba\" o com a sinònim de \"plantilla d'un equip esportiu\", val més dir __SUGGESTION_1__.": ["Con el sentido de «lugar para cambiarse de ropa» o como sinónimo de «plantilla de un equipo deportivo», es preferible decir «{suggestion1}».", "When it means ‘changing room’ or ‘sports team roster’, use ‘{suggestion1}’."]
    ,"Com a terme d'alpinisme, s'escriu junt.": ["Como término de alpinismo, se escribe junto.", "As a mountaineering term, it is written as one word."]
    ,"Format preferible.": ["Formato preferible.", "Preferred format."]
    ,"¿Volíeu dir \"addicció\" (dependència) en comptes de \"addició\" (suma, afegiment)?": ["¿Querías decir «addicció» (dependencia) en vez de «addició» (suma, adición)?", "Did you mean ‘addicció’ (dependency) rather than ‘addició’ (addition)?"]
    ,"Cal usar el verb en singular.": ["Hay que usar el verbo en singular.", "Use the verb in the singular."]
    ,"En el sentit de 'dolor muscular' val més usar una altra expressió.": ["Con el sentido de «dolor muscular», es preferible usar otra expresión.", "Use a different expression when referring to muscle pain."]
    ,"Amb el sentit de __SUGGESTION_1__, podeu usar una altra expressió per a fer la redacció més natural i fluida.": ["Con el sentido de «{suggestion1}», puedes usar otra expresión para dar naturalidad y fluidez al texto.", "When it means ‘{suggestion1}’, a different expression may make the text sound more natural and fluent."]
    ,"Eviteu la repetició de \"això\" fent servir una altra expressió.": ["Evita repetir «això» usando otra expresión.", "Avoid repeating ‘això’ by using a different expression."]
    ,"Eviteu la repetició de 'això'.": ["Evita repetir «això».", "Avoid repeating ‘això’."]
    ,"Paraula inadequada en sentit figurat.": ["Palabra inadecuada en sentido figurado.", "Unsuitable word in the figurative sense."]
    ,"¿Volíeu dir __SUGGESTION_1__ (país)? En minúscula és correcte com a adjectiu.": ["¿Querías decir «{suggestion1}» (el país)? En minúscula es correcto como adjetivo.", "Did you mean ‘{suggestion1}’ (the country)? Lowercase is correct as an adjective."]
    ,"Combinació incorrecta. Useu el pronom 'en' amb 'algun', o 'algú' sense 'en'.": ["Combinación incorrecta. Usa el pronombre «en» con «algun» o «algú» sin «en».", "Incorrect combination. Use ‘en’ with ‘algun’, or ‘algú’ without ‘en’."]
    ,"Combinació incorrecta. Useu el pronom 'en' amb 'cap', o 'ningú' sense 'en'.": ["Combinación incorrecta. Usa el pronombre «en» con «cap» o «ningú» sin «en».", "Incorrect combination. Use ‘en’ with ‘cap’, or ‘ningú’ without ‘en’."]
    ,"Combinació agramatical. Useu el pronom \"ningú\" (neutre) o bé els determinants \"ningun, ninguna\" cada un seguits d'un nom.": ["Combinación agramatical. Usa el pronombre «ningú» (neutro) o los determinantes «ningun, ninguna», cada uno seguido de un sustantivo.", "Ungrammatical combination. Use the neutral pronoun ‘ningú’, or the determiners ‘ningun, ninguna’, each followed by a noun."]
    ,"Amb valor abstractiu val més usar una altra construcció. Només és correcte si equival a \"aquella cosa \\2\".": ["Con sentido abstracto, es preferible usar otra construcción. Solo es correcto si equivale a «aquella cosa \\2».", "Use a different construction for an abstract meaning. It is correct only if it means ‘that thing \\2’."]
    ,"La frase és més natural amb \"el que\".": ["La frase suena más natural con «el que».", "The sentence sounds more natural with ‘el que’."]
    ,"Val més usar una altra construcció.": ["Es preferible usar otra construcción.", "Use a different construction."]
    ,"Gairebé sempre s'escriu junt.": ["Casi siempre se escribe junto.", "It is almost always written as one word."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"\\1\" és una forma del verb 'alumar'.": ["¿Querías decir «{suggestion1}»? «\\1» es una forma del verbo «alumar».", "Did you mean ‘{suggestion1}’? ‘\\1’ is a form of the verb ‘alumar’."]
    ,"\"Alumnat\" és un nom col·lectiu. No pareix adequat en aquest context.": ["«Alumnat» es un sustantivo colectivo. No parece adecuado en este contexto.", "‘Alumnat’ is a collective noun and seems unsuitable in this context."]
    ,"Davant d'infinitiu, com a subordinada temporal, en llenguatge formal és preferible usar \"en\".": ["Delante de un infinitivo en una subordinada temporal, en registros formales es preferible usar «en».", "Before an infinitive in a temporal subordinate clause, formal writing prefers ‘en’."]
    ,"Aquesta coma és probablement innecessària.": ["Esta coma probablemente es innecesaria.", "This comma is probably unnecessary."]
    ,"En aquest context el verb adequat és 'pastar'.": ["En este contexto, el verbo adecuado es «pastar».", "The correct verb in this context is ‘pastar’."]
    ,"Si és una interjecció, s'escriu __SUGGESTION_1__ (així sia). Correcte si és del v. 'amar'.": ["Si es una interjección, se escribe «{suggestion1}» (así sea). Es correcto si es una forma del verbo «amar».", "If it is an interjection, write ‘{suggestion1}’ (so be it). It is correct if it is a form of ‘amar’."]
    ,"\"Anàlisi\" és un nom femení.": ["«Anàlisi» es un sustantivo femenino.", "‘Anàlisi’ is a feminine noun."]
    ,"¿Volíeu dir \"anglès\" o \"els angles\"?": ["¿Querías decir «anglès» o «els angles»?", "Did you mean ‘anglès’ or ‘els angles’?"]
    ,"Com a referència geogràfica (també en sentit figurat), \"antípodes\" és preferentment un nom masculí.": ["Como referencia geográfica (también en sentido figurado), «antípodes» suele ser masculino.", "As a geographic reference (also figuratively), ‘antípodes’ is usually masculine."]
    ,"En aquest context, és més natural usar el verb \"jugar-se\".": ["En este contexto, es más natural usar el verbo «jugar-se».", "The verb ‘jugar-se’ sounds more natural in this context."]
    ,"Probablement no s'apostrofa.": ["Probablemente no lleva apóstrofo.", "It probably does not take an apostrophe."]
    ,"Per a indicar un any o una dècada de manera abreviada, no s'usa l'apòstrof.": ["Para indicar un año o una década de forma abreviada, no se usa el apóstrofo.", "Do not use an apostrophe when abbreviating a year or decade."]
    ,"¿Volíeu dir __SUGGESTION_1__ del verb 'aprendre'? \"Apressa\" és una forma del verb 'apressar'.": ["¿Querías decir «{suggestion1}», del verbo «aprendre»? «Apressa» es una forma de «apressar».", "Did you mean ‘{suggestion1}’, from ‘aprendre’? ‘Apressa’ is a form of ‘apressar’."]
    ,"Probablement hi falta la preposició 'de'. \"Arran de\" vol dir 'a conseqüència de' o 'tocant, al mateix nivell de'.": ["Probablemente falta la preposición «de». «Arran de» significa «a consecuencia de» o «tocando, al mismo nivel que».", "The preposition ‘de’ is probably missing. ‘Arran de’ means ‘as a result of’ or ‘level with’."]
    ,"Expressió incorrecta quan equival a \"arran de\".": ["Expresión incorrecta cuando equivale a «arran de».", "Incorrect expression when it means ‘arran de’."]
    ,"Possible error ortogràfic. Si és un gerundi, acaba amb -nt.": ["Posible error ortográfico. Si es un gerundio, termina en «-nt».", "Possible spelling error. If it is a gerund, it ends in ‘-nt’."]
    ,"L'article dels topònims s'escriu normalment en minúscula.": ["El artículo de los topónimos suele escribirse en minúscula.", "The article in a place name is usually lowercase."]
    ,"La paraula adequada és __SUGGESTION_1__.": ["La palabra adecuada es «{suggestion1}».", "The correct word is ‘{suggestion1}’."]
    ,"Aquest verb és transitiu. Probablement cal eliminar la preposició 'a'.": ["Este verbo es transitivo. Probablemente hay que eliminar la preposición «a».", "This verb is transitive. The preposition ‘a’ probably needs to be removed."]
    ,"Useu el verb 'atenir' i no 'atendre'.": ["Usa el verbo «atenir» y no «atendre».", "Use the verb ‘atenir’, not ‘atendre’."]
    ,"En un context jurídic, cal dir __SUGGESTION_1__.": ["En un contexto jurídico, debe decirse «{suggestion1}».", "In a legal context, use ‘{suggestion1}’."]
    ,"L'abreviatura de \"associació de veïns\" és __SUGGESTION_1__ tant en singular com en plural.": ["La abreviatura de «associació de veïns» es «{suggestion1}», tanto en singular como en plural.", "The abbreviation for ‘associació de veïns’ is ‘{suggestion1}’ in both singular and plural."]
    ,"Val més usar una altra expressió. També podeu usar un gerundi.": ["Es preferible usar otra expresión. También puedes usar un gerundio.", "Use a different expression. A gerund is another option."]
    ,"Construcció incorrecta en expressions de temps.": ["Construcción incorrecta en expresiones de tiempo.", "Incorrect construction in time expressions."]
    ,"La preposició no és adequada. Val més usar una altra expressió.": ["La preposición no es adecuada. Es preferible usar otra expresión.", "The preposition is unsuitable. Use a different expression."]
    ,"És preferible usar l'expressió \"a mitjan\".": ["Es preferible usar la expresión «a mitjan».", "Use the expression ‘a mitjan’."]
    ,"Forma col·loquial de femení.": ["Forma coloquial de femenino.", "Colloquial feminine form."]
    ,"En aquest context és més adequat dir __SUGGESTION_1__.": ["En este contexto, es más adecuado decir «{suggestion1}».", "‘{suggestion1}’ is more suitable in this context."]
    ,"¿Volíeu dir __SUGGESTION_1__ (ampli, dilatat)? \"Bast\" vol dir 'grosser, matusser'.": ["¿Querías decir «{suggestion1}» (amplio, dilatado)? «Bast» significa «grosero, tosco».", "Did you mean ‘{suggestion1}’ (broad, extended)? ‘Bast’ means ‘coarse, clumsy’."]
    ,"Només va sense accent quan és un animal o un nom de lletra. Si no, escriviu __SUGGESTION_1__.": ["Solo va sin tilde cuando es un animal o el nombre de una letra. En los demás casos, escribe «{suggestion1}».", "It has no accent mark only when it refers to an animal or a letter name. Otherwise, write ‘{suggestion1}’."]
    ,"Paraula admesa només pel DNV (AVL).": ["Palabra admitida solo por el DNV (AVL).", "Word accepted only by the DNV (AVL)."]
    ,"L'adjectiu adequat en aquest context és __SUGGESTION_1__.": ["El adjetivo adecuado en este contexto es «{suggestion1}».", "The correct adjective in this context is ‘{suggestion1}’."]
    ,"En referència a un conjunt de cabells, val més usar el plural.": ["Para referirse a un conjunto de cabellos, es preferible usar el plural.", "Use the plural when referring to a collection of hairs."]
    ,"Potser hi falta un verb en infinitiu o bé reviseu la puntuació.": ["Quizá falte un verbo en infinitivo o haya que revisar la puntuación.", "An infinitive may be missing, or the punctuation may need review."]
    ,"El substantiu 'calor' és femení.": ["El sustantivo «calor» es femenino.", "The noun ‘calor’ is feminine."]
    ,"Com a adjectiu, és invariable.": ["Como adjetivo, es invariable.", "As an adjective, it is invariable."]
    ,"Probable error de traducció automàtica.": ["Probable error de traducción automática.", "Probable machine-translation error."]
    ,"Incorrecte en el sentit de __SUGGESTION_1__. Correcte en altres sentits.": ["Incorrecto con el sentido de «{suggestion1}». Es correcto con otros sentidos.", "Incorrect when it means ‘{suggestion1}’. It is correct with other meanings."]
    ,"Paraula col·loquial, només admesa per alguns diccionaris.": ["Palabra coloquial, admitida solo por algunos diccionarios.", "Colloquial word accepted by only some dictionaries."]
    ,"En sentit figurat, usem altres expressions.": ["En sentido figurado, usamos otras expresiones.", "Use different expressions in the figurative sense."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Catalpa\" és un gènere de plantes.": ["¿Querías decir «{suggestion1}»? «Catalpa» es un género de plantas.", "Did you mean ‘{suggestion1}’? ‘Catalpa’ is a genus of plants."]
    ,"Aquesta data no és un \\1 sinó un {realDay}.": ["Esta fecha no es un «\\1», sino un {realDay}.", "This date is not a ‘\\1’ but a {realDay}."]
    ,"Símbol d'interrogació sense parella.": ["Signo de interrogación sin pareja.", "Unpaired question mark."]
    ,"Símbol d'exclamació sense parella.": ["Signo de exclamación sin pareja.", "Unpaired exclamation mark."]
    ,"Val més usar el nom \"cim\" (masculí). \"Cima\" s'usa preferentment en botànica.": ["Es preferible usar el sustantivo masculino «cim». «Cima» se usa sobre todo en botánica.", "Use the masculine noun ‘cim’. ‘Cima’ is mainly used in botany."]
    ,"Expressió redundant. N'hi ha prou de dir __SUGGESTION_1__.": ["Expresión redundante. Basta con decir «{suggestion1}».", "Redundant expression. Simply say ‘{suggestion1}’."]
    ,"Incorrecte si volíeu dir __SUGGESTION_1__. Correcte en altres sentits.": ["Incorrecto si querías decir «{suggestion1}». Es correcto con otros sentidos.", "Incorrect if you meant ‘{suggestion1}’. It is correct with other meanings."]
    ,"En el sentit d'esfondrament, \"col·lapse\" és un anglicisme.": ["Con el sentido de «derrumbe», «col·lapse» es un anglicismo.", "When it means ‘collapse’, ‘col·lapse’ is an anglicism."]
    ,"És més habitual usar \"\\3\" com a nom masculí.": ["Es más habitual usar «\\3» como sustantivo masculino.", "‘\\3’ is more commonly used as a masculine noun."]
    ,"Expressió admesa només per alguns diccionaris.": ["Expresión admitida solo por algunos diccionarios.", "Expression accepted by only some dictionaries."]
    ,"Les comes són probablement incorrectes.": ["Probablemente las comas son incorrectas.", "The commas are probably incorrect."]
    ,"La coma és probablement innecessària.": ["Probablemente sobra la coma.", "The comma is probably unnecessary."]
    ,"El símbol de puntuació va després dels punts suspensius, o potser és innecessari.": ["El signo de puntuación va después de los puntos suspensivos, o quizá sea innecesario.", "The punctuation mark goes after the ellipsis, or may be unnecessary."]
    ,"El caràcter d'obertura de cometes simples no es pot usar com a apòstrof.": ["El signo de apertura de comillas simples no se puede usar como apóstrofo.", "The opening single quotation mark cannot be used as an apostrophe."]
    ,"Caràcter incorrecte de cometes d'obertura.": ["Carácter de apertura de comillas incorrecto.", "Incorrect opening quotation mark character."]
    ,"Falta una coma darrere de \"\\4\" (ex. \"Enhorabona, Joan!\").": ["Falta una coma después de «\\4» (p. ej., «Enhorabona, Joan!»).", "A comma is missing after ‘\\4’ (e.g. ‘Enhorabona, Joan!’)."]
    ,"Falta una coma per a separar el vocatiu.": ["Falta una coma para separar el vocativo.", "A comma is needed to separate the vocative."]
    ,"Dos signes de puntuació seguits. ¿Voleu usar el punt o la coma?": ["Hay dos signos de puntuación seguidos. ¿Quieres usar el punto o la coma?", "Two punctuation marks appear in a row. Would you like to use a full stop or a comma?"]
    ,"És convenient posar-hi una coma.": ["Conviene poner una coma.", "A comma should be added."]
    ,"Si és del verb 'comprendre', s'escriu amb accent.": ["Si es una forma del verbo «comprendre», se escribe con tilde.", "If it is a form of ‘comprendre’, it takes an accent mark."]
    ,"Error de concordança. La forma femenina de l'adjectiu \"comú\" és \"comuna\".": ["Error de concordancia. La forma femenina del adjetivo «comú» es «comuna».", "Agreement error. The feminine form of the adjective ‘comú’ is ‘comuna’."]
    ,"Davant d'article, escrivim preferiblement __SUGGESTION_1__.": ["Delante de un artículo, es preferible escribir «{suggestion1}».", "Before an article, ‘{suggestion1}’ is preferable."]
    ,"Construcció incorrecta amb valor condicional: 'com' + subjuntiu.": ["Construcción incorrecta con valor condicional: «com» + subjuntivo.", "Incorrect conditional construction: ‘com’ + subjunctive."]
    ,"Val més fer servir un altre ordre més natural.": ["Es preferible usar otro orden más natural.", "Use a more natural word order."]
    ,"Possible error de concordança. Probablement cal usar el masculí singular.": ["Posible error de concordancia. Probablemente hay que usar el masculino singular.", "Possible agreement error. The masculine singular is probably needed."]
    ,"Els numerals són invariables darrere de nom. Useu la forma masculina.": ["Los numerales son invariables después de un sustantivo. Usa la forma masculina.", "Numerals do not inflect after a noun. Use the masculine form."]
    ,"En aquest context la paraula adequada és __SUGGESTION_1__.": ["En este contexto, la palabra adecuada es «{suggestion1}».", "The correct word in this context is ‘{suggestion1}’."]
    ,"Si és verb, s'escriu sense accent.": ["Si es un verbo, se escribe sin tilde.", "If it is a verb, it is written without an accent mark."]
    ,"Si és nom, cal accentuar.": ["Si es un sustantivo, lleva tilde.", "If it is a noun, it takes an accent mark."]
    ,"No s'accentua si és verb.": ["No lleva tilde si es un verbo.", "It has no accent mark when it is a verb."]
    ,"Combinació incorrecta de verb i pronom.": ["Combinación incorrecta de verbo y pronombre.", "Incorrect combination of verb and pronoun."]
    ,"¿Volíeu dir \"ens\"?": ["¿Querías decir «ens»?", "Did you mean ‘ens’?"]
    ,"¿Volíeu dir __SUGGESTION_1__? O bé reviseu la puntuació.": ["¿Querías decir «{suggestion1}»? También puedes revisar la puntuación.", "Did you mean ‘{suggestion1}’? You could also check the punctuation."]
    ,"La preposició adequada per a aquest verb és 'en'.": ["La preposición adecuada para este verbo es «en».", "The correct preposition for this verb is ‘en’."]
    ,"En el sentit de 'registre, càlcul', cal escriure __SUGGESTION_1__.": ["Con el sentido de «registro, cálculo», debe escribirse «{suggestion1}».", "When it means ‘record, calculation’, write ‘{suggestion1}’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (registre)? \"Conta\" és una forma del verb 'contar'.": ["¿Querías decir «{suggestion1}» (registro)? «Conta» es una forma del verbo «contar».", "Did you mean ‘{suggestion1}’ (record)? ‘Conta’ is a form of the verb ‘contar’."]
    ,"Si és un adjectiu, s'escriu amb accent. Correcte sense accent si és una forma del v. 'continuar'.": ["Si es un adjetivo, lleva tilde. Se escribe sin tilde si es una forma del verbo «continuar».", "If it is an adjective, it takes an accent mark. It is correct without one as a form of ‘continuar’."]
    ,"Error gramatical.": ["Error gramatical.", "Grammatical error."]
    ,"Cal fer una contracció.": ["Hay que hacer una contracción.", "A contraction is required."]
    ,"En aquest cas, la preposició adequada sembla 'a'.": ["En este caso, la preposición adecuada parece ser «a».", "The correct preposition in this case seems to be ‘a’."]
    ,"\"Copla\" és correcte en el sentit de cançó folklòrica espanyola, però incorrecte en altres sentits.": ["«Copla» es correcto con el sentido de canción folclórica española, pero incorrecto con otros sentidos.", "‘Copla’ is correct for a Spanish folk song, but incorrect with other meanings."]
    ,"Gal·licisme admès només per alguns diccionaris.": ["Galicismo admitido solo por algunos diccionarios.", "Gallicism accepted by only some dictionaries."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Croada\" és una expedició militar a Terra Santa o, més generalment, qualsevol mena de campanya. \"Croats\" eren els qui hi participaven.": ["¿Querías decir «{suggestion1}»? Una «croada» es una expedición militar a Tierra Santa o, en general, una campaña. Los «croats» eran quienes participaban en ella.", "Did you mean ‘{suggestion1}’? A ‘croada’ was a military expedition to the Holy Land or, more broadly, a campaign. ‘Croats’ were its participants."]
    ,"S'escriu en minúscula i amb guionet": ["Se escribe en minúscula y con guion.", "Write it in lowercase and with a hyphen."]
    ,"La preposició \"de\" és supèrflua.": ["La preposición «de» es superflua.", "The preposition ‘de’ is unnecessary."]
    ,"Referit a Dinamarca, s'escriu amb accent.": ["Si se refiere a Dinamarca, se escribe con tilde.", "When referring to Denmark, it takes an accent mark."]
    ,"Construcció col·loquial que val més substituir.": ["Construcción coloquial que es preferible sustituir.", "Colloquial construction that should preferably be replaced."]
    ,"En sentit figurat és preferible usar __SUGGESTION_1__.": ["En sentido figurado, es preferible usar «{suggestion1}».", "Use ‘{suggestion1}’ in the figurative sense."]
    ,"Encara que \"degut a\" és una expressió admesa per la normativa, es recomana fer-ne servir una altra. No hi ha cap objecció si 'degut' concorda amb un nom ('el respecte degut') o és participi ('és degut a').": ["Aunque «degut a» es una expresión admitida por la normativa, se recomienda usar otra. Es correcto si «degut» concuerda con un sustantivo («el respecte degut») o es un participio («és degut a»).", "Although ‘degut a’ is accepted by the standard, another expression is recommended. It is fine when ‘degut’ agrees with a noun (‘el respecte degut’) or is a participle (‘és degut a’)."]
    ,"Hi falta un article per a completar la fórmula 'del ... al ...'.": ["Falta un artículo para completar la fórmula «del ... al ...».", "An article is missing from the ‘del ... al ...’ construction."]
    ,"Si és una forma del verb 'denunciar', s'escriu sense accent.": ["Si es una forma del verbo «denunciar», se escribe sin tilde.", "If it is a form of ‘denunciar’, it is written without an accent mark."]
    ,"¿Volíeu dir __SUGGESTION_1__? 'Despendre' vol dir 'gastar'.": ["¿Querías decir «{suggestion1}»? «Despendre» significa «gastar».", "Did you mean ‘{suggestion1}’? ‘Despendre’ means ‘to spend’."]
    ,"Aquesta expressió és un hispanisme.": ["Esta expresión es un hispanismo.", "This expression is a Hispanism."]
    ,"La preposició adequada en aquesta expressió és \"amb\".": ["La preposición adecuada en esta expresión es «amb».", "The correct preposition in this expression is ‘amb’."]
    ,"Expressió probablement errònia.": ["Expresión probablemente errónea.", "Probably incorrect expression."]
    ,"Expressió incorrecta quan equival a __SUGGESTION_1__.": ["Expresión incorrecta cuando equivale a «{suggestion1}».", "Incorrect expression when it means ‘{suggestion1}’."]
    ,"Falta un article davant de \"\\2\".": ["Falta un artículo delante de «\\2».", "An article is missing before ‘\\2’."]
    ,"¿Volíeu dir \"dialecte\" (variant geogràfica d'una llengua)?": ["¿Querías decir «dialecte» (variedad geográfica de una lengua)?", "Did you mean ‘dialecte’ (a geographic variety of a language)?"]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Divisar\" és correcte com a terme d'heràldica.": ["¿Querías decir «{suggestion1}»? «Divisar» es correcto como término de heráldica.", "Did you mean ‘{suggestion1}’? ‘Divisar’ is correct as a heraldic term."]
    ,"En aquesta expressió el verb adequat és \"tocar\".": ["En esta expresión, el verbo adecuado es «tocar».", "The correct verb in this expression is ‘tocar’."]
    ,"Possible calc del castellà. Feu servir una altra expressió.": ["Posible calco del castellano. Usa otra expresión.", "Possible calque from Spanish. Use a different expression."]
    ,"La coma és probablement incorrecta.": ["La coma probablemente es incorrecta.", "The comma is probably incorrect."]
    ,"Només s'accentua quan és del verb 'ser'.": ["Solo lleva tilde cuando es una forma del verbo «ser».", "It takes an accent mark only when it is a form of ‘ser’."]
    ,"Incorrecte amb el sentit de 'caldre, necessitar, requerir'. \"Precisar\" vol dir 'determinar amb precisió'.": ["Incorrecto con el sentido de «hacer falta, necesitar, requerir». «Precisar» significa «determinar con precisión».", "Incorrect when used to mean ‘to need or require’. ‘Precisar’ means ‘to determine precisely’."]
    ,"Per a separar els decimals, useu una coma.": ["Usa una coma para separar los decimales.", "Use a comma as the decimal separator."]
    ,"En texts formals eviteu l'article salat. És adequat com a possessiu.": ["En textos formales, evita el artículo salado. Es adecuado como posesivo.", "Avoid the salat article in formal writing. It is suitable as a possessive."]
    ,"Possible error de picatge. Probablement hi manca un apòstrof.": ["Posible error de tecleo. Probablemente falta un apóstrofo.", "Possible typing error. An apostrophe is probably missing."]
    ,"Com a adjectiu, cal dir __SUGGESTION_1__. \"Fixe\" és una forma valenciana del v. 'fixar'.": ["Como adjetivo, debe decirse «{suggestion1}». «Fixe» es una forma valenciana del verbo «fixar».", "As an adjective, use ‘{suggestion1}’. ‘Fixe’ is a Valencian form of ‘fixar’."]
    ,"Com a forma del verb auxiliar 'haver', cal dir __SUGGESTION_1__.": ["Como forma del verbo auxiliar «haver», debe decirse «{suggestion1}».", "As a form of the auxiliary verb ‘haver’, use ‘{suggestion1}’."]
    ,"Possible confusió. Si és un nom o un adjectiu, s'escriu amb accent.": ["Posible confusión. Si es un sustantivo o adjetivo, lleva tilde.", "Possible confusion. If it is a noun or adjective, it takes an accent mark."]
    ,"Possible confusió. Potser hi falta un infinitiu.": ["Posible confusión. Quizá falta un infinitivo.", "Possible confusion. An infinitive may be missing."]
    ,"Eviteu el llenguatge telegràfic.": ["Evita el lenguaje telegráfico.", "Avoid telegraphic writing."]
    ,"Considereu usar una expressió més tradicional.": ["Considera usar una expresión más tradicional.", "Consider using a more traditional expression."]
    ,"En aquesta expressió és preferible usar l'adjectiu __SUGGESTION_1__.": ["En esta expresión, es preferible usar el adjetivo «{suggestion1}».", "Use the adjective ‘{suggestion1}’ in this expression."]
    ,"¿Volíeu dir __SUGGESTION_1__, __SUGGESTION_2__ o __SUGGESTION_3__ (del verb 'fer')? \"Fen\" és una forma del verb 'fendre'.": ["¿Querías decir «{suggestion1}», «{suggestion2}» o «{suggestion3}» (del verbo «fer»)? «Fen» es una forma del verbo «fendre».", "Did you mean ‘{suggestion1}’, ‘{suggestion2}’ or ‘{suggestion3}’ (forms of ‘fer’)? ‘Fen’ is a form of ‘fendre’."]
    ,"Podeu usar un verb més precís en aquest context.": ["Puedes usar un verbo más preciso en este contexto.", "Use a more precise verb in this context."]
    ,"L'expressió adequada és 'fer \\4 de'.": ["La expresión adecuada es «fer \\4 de».", "The correct expression is ‘fer \\4 de’."]
    ,"Cal usar el verb en subjuntiu.": ["Hay que usar el verbo en subjuntivo.", "Use the subjunctive."]
    ,"Podeu fer la redacció més fluida eliminant el verb redundant.": ["Puedes dar más fluidez al texto eliminando el verbo redundante.", "Improve the flow of the text by removing the redundant verb."]
    ,"Forma col·loquial de __SUGGESTION_1__. Correcte com a forma del verb 'cordar'.": ["Forma coloquial de «{suggestion1}». Es correcta como forma del verbo «cordar».", "Colloquial form of ‘{suggestion1}’. It is correct as a form of ‘cordar’."]
    ,"S'escriu en minúscula perquè no és un nom propi.": ["Se escribe en minúscula porque no es un nombre propio.", "Write it in lowercase because it is not a proper name."]
    ,"Val més usar un verb més precís en aquest context.": ["Es preferible usar un verbo más preciso en este contexto.", "Use a more precise verb in this context."]
    ,"És més adequat dir __SUGGESTION_1__.": ["Es más adecuado decir «{suggestion1}».", "‘{suggestion1}’ is more appropriate."]
    ,"'Fractal', com a nom, és femení.": ["«Fractal», como sustantivo, es femenino.", "‘Fractal’ is feminine when used as a noun."]
    ,"Aquesta construcció d'infinitiu sense un verb principal és probablement inadequada.": ["Esta construcción de infinitivo sin un verbo principal probablemente es inadecuada.", "This infinitive construction without a main verb is probably unsuitable."]
    ,"En aquest sentit, cal dir __SUGGESTION_1__ (nom masculí).": ["Con este sentido, debe decirse «{suggestion1}» (sustantivo masculino).", "In this sense, use ‘{suggestion1}’ (masculine noun)."]
    ,"Aquest nom s'escriu sense article": ["Este sustantivo se escribe sin artículo.", "This noun is written without an article."]
    ,"El possessiu 'llur' s'escriu sense article.": ["El posesivo «llur» se escribe sin artículo.", "The possessive ‘llur’ is written without an article."]
    ,"En el sentit de __SUGGESTION_1__ val més usar una altra expressió.": ["Con el sentido de «{suggestion1}», es preferible usar otra expresión.", "Use a different expression when it means ‘{suggestion1}’."]
    ,"Possible confusió. L'expressió adequada és \"emfatitzar\" o \"posar èmfasi en\".": ["Posible confusión. Las expresiones adecuadas son «emfatitzar» o «posar èmfasi en».", "Possible confusion. The correct expressions are ‘emfatitzar’ or ‘posar èmfasi en’."]
    ,"Incorrecte en el sentit de 'emblanquinar, encalcinar'. \"Encalar\" és correcte en altres sentits.": ["Incorrecto con el sentido de «blanquear, encalar». «Encalar» es correcto con otros sentidos.", "Incorrect when it means ‘to whitewash’. ‘Encalar’ is correct with other meanings."]
    ,"És preferible evitar la duplicació de \"encara\".": ["Es preferible evitar la repetición de «encara».", "Avoid repeating ‘encara’."]
    ,"Possible castellanisme. \"Enconar\" és correcte en altres sentits.": ["Posible calco del castellano. «Enconar» es correcto con otros sentidos.", "Possible Spanish calque. ‘Enconar’ is correct with other meanings."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Enel\" és el nom d'una empresa energètica.": ["¿Querías decir «{suggestion1}»? «Enel» es el nombre de una empresa energética.", "Did you mean ‘{suggestion1}’? ‘Enel’ is the name of an energy company."]
    ,"'Enterar' és un castellanisme que cal evitar. Possible confusió amb 'enterrar'.": ["«Enterar» es un calco del castellano que hay que evitar. Posible confusión con «enterrar».", "‘Enterar’ is a Spanish calque to avoid. It may be confused with ‘enterrar’."]
    ,"En el sentit de \"anar cap al lloc d'origen\" cal dir \"tornar-se'n\". Correcte en el sentit de 'encongir-se'.": ["Con el sentido de «ir hacia el lugar de origen», debe decirse «tornar-se'n». Es correcto con el sentido de «encogerse».", "When it means ‘to go back to where one came from’, use ‘tornar-se'n’. It is correct when it means ‘to shrink’."]
    ,"La construcció adequada és \"entre A i B\", no \"entre A a B\".": ["La construcción adecuada es «entre A i B», no «entre A a B».", "The correct construction is ‘entre A i B’, not ‘entre A a B’."]
    ,"Construcció de relatiu incorrecta.": ["Construcción de relativo incorrecta.", "Incorrect relative clause."]
    ,"Construcció probablement incoherent.": ["Construcción probablemente incoherente.", "Probably inconsistent construction."]
    ,"Aquesta expressió és pròpia del castellà.": ["Esta expresión es propia del castellano.", "This expression is specific to Spanish."]
    ,"Expressió redundant. Val més usar simplement el pronom 'hi'.": ["Expresión redundante. Es preferible usar simplemente el pronombre «hi».", "Redundant expression. Simply use the pronoun ‘hi’."]
    ,"Si voleu dir 'en comptes de', cal escriure __SUGGESTION_1__. \"Enlloc\" (junt) és correcte amb el sentit de 'en cap lloc'.": ["Si quieres decir «en vez de», debe escribirse «{suggestion1}». «Enlloc» (junto) es correcto con el sentido de «en ningún lugar».", "If you mean ‘instead of’, write ‘{suggestion1}’. ‘Enlloc’ (one word) is correct when it means ‘nowhere’."]
    ,"El pronom 'en' és segurament redundant.": ["El pronombre «en» seguramente es redundante.", "The pronoun ‘en’ is probably redundant."]
    ,"És un calc del castellà si vol dir __SUGGESTION_1__ o __SUGGESTION_2__.": ["Es un calco del castellano si significa «{suggestion1}» o «{suggestion2}».", "It is calqued from Spanish if it means ‘{suggestion1}’ or ‘{suggestion2}’."]
    ,"El v. 'erigir' regeix normalment la preposició __SUGGESTION_1__, no \"com a\", o va sense preposició.": ["El verbo «erigir» suele regir la preposición «{suggestion1}», no «com a», o bien va sin preposición.", "The verb ‘erigir’ normally takes ‘{suggestion1}’, not ‘com a’, or no preposition."]
    ,"\"Esmerçar\" (invertir diners o temps) no és correcte amb el sentit de \"esforçar-se\".": ["«Esmerçar» (invertir dinero o tiempo) no es correcto con el sentido de «esforzarse».", "‘Esmerçar’ (to spend money or time) is not correct when it means ‘to make an effort’."]
    ,"En aquesta expressió, cal dir __SUGGESTION_1__": ["En esta expresión, debe decirse «{suggestion1}».", "In this expression, use ‘{suggestion1}’."]
    ,"¿Volíeu dir «emmanillar» (lligar amb manilles) en lloc de «esposar» (casar-se)?": ["¿Querías decir «emmanillar» (poner grilletes) en vez de «esposar» (casarse)?", "Did you mean ‘emmanillar’ (to handcuff) rather than ‘esposar’ (to marry)?"]
    ,"Expressió probablement incorrecta. \"Esquena\" sol usar-se un singular.": ["Expresión probablemente incorrecta. «Esquena» suele usarse en singular.", "Probably incorrect expression. ‘Esquena’ is usually singular."]
    ,"\"Esquena\" (dors) s'usa normalment en singular. En plural, pot ser \"espatlles\" (muscles).": ["«Esquena» (dorso) suele usarse en singular. En plural, puede decirse «espatlles» (hombros).", "‘Esquena’ (back) is usually singular. For plural, use ‘espatlles’ (shoulders)."]
    ,"En aquesta expressió, cal dir __SUGGESTION_1__": ["En esta expresión, debe decirse «{suggestion1}».", "In this expression, use ‘{suggestion1}’."]
    ,"Amb el sentit de 'sojorn', cal dir __SUGGESTION_1__.": ["Con el sentido de «estancia», debe decirse «{suggestion1}».", "When it means ‘a stay’, use ‘{suggestion1}’."]
    ,"És més apropiat usar el verb 'ser'.": ["Es más apropiado usar el verbo «ser».", "The verb ‘ser’ is more appropriate."]
    ,"El pronom feble adequat en aquest cas és __SUGGESTION_1__.": ["El pronombre débil adecuado en este caso es «{suggestion1}».", "The correct weak pronoun in this case is ‘{suggestion1}’."]
    ,"El pronom feble adequat en aquest cas és \"hi\".": ["El pronombre débil adecuado en este caso es «hi».", "The correct weak pronoun in this case is ‘hi’."]
    ,"En aquest context, val més usar una altra expressió.": ["En este contexto, es preferible usar otra expresión.", "Use a different expression in this context."]
    ,"Paraula incorrecta amb aquest significat.": ["Palabra incorrecta con este significado.", "Incorrect word with this meaning."]
    ,"Cal revisar la forma verbal.": ["Hay que revisar la forma verbal.", "Check the verb form."]
    ,"Forma incorrecta del pronom feble.": ["Forma incorrecta del pronombre débil.", "Incorrect weak pronoun form."]
    ,"Expressió calcada del castellà.": ["Expresión calcada del castellano.", "Expression calqued from Spanish."]
    ,"En aquest context, l'expressió és redundant.": ["En este contexto, la expresión es redundante.", "The expression is redundant in this context."]
    ,"El verb és intransitiu en aquest sentit.": ["El verbo es intransitivo con este sentido.", "The verb is intransitive with this meaning."]
    ,"La forma verbal ha de concordar amb el subjecte.": ["La forma verbal debe concordar con el sujeto.", "The verb form must agree with the subject."]
    ,"El nom és femení.": ["El sustantivo es femenino.", "The noun is feminine."]
    ,"El nom és masculí.": ["El sustantivo es masculino.", "The noun is masculine."]
    ,"El pronom és redundant.": ["El pronombre es redundante.", "The pronoun is redundant."]
    ,"Hi falta un article per a completar la fórmual 'del ... al ...'.": ["Falta un artículo para completar la fórmula «del ... al ...».", "An article is missing from the ‘del ... al ...’ construction."]
    ,"Expressió incorrecta si equival a alguna de les següents.": ["Expresión incorrecta si equivale a alguna de las siguientes.", "Incorrect expression if it means any of the following."]
    ,"Expressió incorrecta si equival a 'haver-hi temps'.": ["Expresión incorrecta si equivale a «haver-hi temps».", "Incorrect expression if it means ‘haver-hi temps’."]
    ,"Amb valor abstractiu val més usar una altra construcció. Només és correcte si equival a \"aquella cosa \\3\".": ["Con sentido abstracto, es preferible usar otra construcción. Solo es correcto si equivale a «aquella cosa \\3».", "Use a different construction for an abstract meaning. It is correct only if it means ‘that thing \\3’."]
    ,"Probablement hi falta l'article.": ["Probablemente falta el artículo.", "The article is probably missing."]
    ,"¿Volíeu dir __SUGGESTION_1__ (ocultació d'un astre)? \"Eclipses\" és una forma verbal del v. 'eclipsar'.": ["¿Querías decir «{suggestion1}» (ocultación de un astro)? «Eclipses» es una forma verbal de «eclipsar».", "Did you mean ‘{suggestion1}’ (the occultation of a celestial body)? ‘Eclipses’ is a form of ‘eclipsar’."]
    ,"En el sentit de 'article de fons' és masculí. En el sentit de 'empresa editora' és femení.": ["Con el sentido de «artículo de fondo» es masculino. Con el sentido de «empresa editora» es femenino.", "It is masculine when it means ‘editorial’ (an opinion article), and feminine for a publishing company."]
    ,"Probablement hi falta alguna paraula.": ["Probablemente falta alguna palabra.", "A word may be missing."]
    ,"Quan ens referim al dia de la setmana immediatament anterior o posterior, no s'usa l'article. L'article és correcte si ens referim a un fet habitual que es repeteix cada setmana, però llavors també es pot usar el plural.": ["Al referirse al día de la semana inmediatamente anterior o posterior, no se usa el artículo. Sí se admite para un hecho habitual que se repite cada semana; en ese caso también puede usarse el plural.", "Do not use the article for the immediately preceding or following day of the week. It is correct for a recurring weekly event, where the plural is also possible."]
    ,"Es recomana usar una altra expressió.": ["Se recomienda usar otra expresión.", "Use a different expression."]
    ,"Possible error de puntuació.": ["Posible error de puntuación.", "Possible punctuation error."]
    ,"Com a nom d'una institució, s'escriu en majúscula.": ["Como nombre de una institución, se escribe con mayúscula.", "As the name of an institution, it is capitalized."]
    ,"S'escriu en minúscula.": ["Se escribe en minúscula.", "Write it in lowercase."]
    ,"El símbol normalitzat de \"grams\" és __SUGGESTION_1__ (sense punt).": ["El símbolo normalizado de «grams» es «{suggestion1}» (sin punto).", "The standard symbol for ‘grams’ is ‘{suggestion1}’ (without a period)."]
    ,"Per a indicar 'grams' s'usa el símbol 'g' (sense punt).": ["Para indicar «grams» se usa el símbolo «g» (sin punto).", "Use the symbol ‘g’ for ‘grams’ (without a period)."]
    ,"En l'escala de Richter no és apropiat parlar de 'graus'. Podeu usar opcionalment la paraula 'magnitud'.": ["En la escala de Richter no es apropiado hablar de «grados». Se puede usar la palabra «magnitud».", "On the Richter scale, ‘degrees’ is not appropriate; you may use ‘magnitude’ instead."]
    ,"No és apropiat parlar de 'graus' en la intensitat dels terratrèmols. Podeu usar opcionalment la paraula 'magnitud'.": ["No es apropiado hablar de «grados» para indicar la intensidad de los terremotos. Se puede usar la palabra «magnitud».", "Do not use ‘degrees’ for earthquake intensity; you may use ‘magnitude’ instead."]
    ,"Llenguatge col·loquial. Podeu fer servir una alternativa.": ["Lenguaje coloquial. Puedes usar una alternativa.", "Colloquial language. You can use an alternative."]
    ,"Incorrecte en el sentit de 'cau' o 'recer'. \"__SUGGESTION_1__\" és un participi del verb 'guarir'.": ["Incorrecto con el sentido de «cau» o «refugio». «{suggestion1}» es un participio del verbo «guarir».", "Incorrect when it means ‘den’ or ‘shelter’. ‘{suggestion1}’ is a participle of ‘guarir’. "]
    ,"Numeral possiblement mal escrit.": ["Numeral posiblemente mal escrito.", "The numeral may be misspelled."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del verb 'haver').": ["¿Querías decir «{suggestion1}» (del verbo «haver»)?", "Did you mean ‘{suggestion1}’ (from the verb ‘haver’)?"]
    ,"Hi falta un participi.": ["Falta un participio.", "A participle is missing."]
    ,"Repetició probablement incorrecta del verb 'haver'.": ["Probablemente hay una repetición incorrecta del verbo «haver».", "The verb ‘haver’ may have been repeated incorrectly."]
    ,"Probablement cal escriure __SUGGESTION_1__." : ["Probablemente debe escribirse «{suggestion1}».", "The correct spelling is probably ‘{suggestion1}’. "]
    ,"Probablement cal escriure __SUGGESTION_1__ (sense accent).": ["Probablemente debe escribirse «{suggestion1}» (sin tilde).", "The correct spelling is probably ‘{suggestion1}’ (without an accent)."]
    ,"Probablement cal escriure __SUGGESTION_1__ (amb accent).": ["Probablemente debe escribirse «{suggestion1}» (con tilde).", "The correct spelling is probably ‘{suggestion1}’ (with an accent)."]
    ,"Probablement cal escriure __SUGGESTION_1__ (en una sola paraula).": ["Probablemente debe escribirse «{suggestion1}» (en una sola palabra).", "The correct spelling is probably ‘{suggestion1}’ (as one word)."]
    ,"Probablement cal escriure __SUGGESTION_1__ (en dues paraules).": ["Probablemente debe escribirse «{suggestion1}» (en dos palabras).", "The correct spelling is probably ‘{suggestion1}’ (as two words)."]
    ,"Probablement cal escriure __SUGGESTION_1__ (junt).": ["Probablemente debe escribirse «{suggestion1}» (junto).", "The correct spelling is probably ‘{suggestion1}’ (as one word)."]
    ,"Probablement cal escriure __SUGGESTION_1__ (separat).": ["Probablemente debe escribirse «{suggestion1}» (por separado).", "The correct spelling is probably ‘{suggestion1}’ (as separate words)."]
    ,"Probablement cal escriure __SUGGESTION_1__ (amb guionet).": ["Probablemente debe escribirse «{suggestion1}» (con guion).", "The correct spelling is probably ‘{suggestion1}’ (with a hyphen)."]
    ,"Probablement cal escriure __SUGGESTION_1__ (sense guionet).": ["Probablemente debe escribirse «{suggestion1}» (sin guion).", "The correct spelling is probably ‘{suggestion1}’ (without a hyphen)."]
    ,"És preferible escriure __SUGGESTION_1__.": ["Es preferible escribir «{suggestion1}».", "Prefer ‘{suggestion1}’. "]
    ,"Cal escriure __SUGGESTION_1__.": ["Debe escribirse «{suggestion1}».", "Write ‘{suggestion1}’. "]
    ,"S'escriu __SUGGESTION_1__.": ["Se escribe «{suggestion1}».", "It is written ‘{suggestion1}’. "]
    ,"Forma incorrecta. Cal escriure __SUGGESTION_1__. ": ["Forma incorrecta. Debe escribirse «{suggestion1}».", "Incorrect form. Write ‘{suggestion1}’. "]
    ,"Forma incorrecta. Probablement cal escriure __SUGGESTION_1__. ": ["Forma incorrecta. Probablemente debe escribirse «{suggestion1}».", "Incorrect form. The correct spelling is probably ‘{suggestion1}’. "]
    ,"La forma correcta és __SUGGESTION_1__. ": ["La forma correcta es «{suggestion1}».", "The correct form is ‘{suggestion1}’. "]
    ,"La forma adequada és __SUGGESTION_1__. ": ["La forma adecuada es «{suggestion1}».", "The appropriate form is ‘{suggestion1}’. "]
    ,"Useu el nom oficial del municipi valencià.": ["Usa el nombre oficial del municipio valenciano.", "Use the municipality’s official Valencian name."]
    ,"Useu el nom valencià (no oficial) del municipi.": ["Usa el nombre valenciano (no oficial) del municipio.", "Use the municipality’s Valencian (unofficial) name."]
    ,"Possible error de traducció automàtica.": ["Posible error de traducción automática.", "Possible machine-translation error."]
    ,"S'escriu junt sense guionet.": ["Se escribe junto, sin guion.", "Write it as one word, without a hyphen."]
    ,"És recomanable eliminar aquest possessiu redundant.": ["Se recomienda eliminar este posesivo redundante.", "Consider removing this redundant possessive."]
    ,"Forma de pronom feble incorrecta.": ["Forma incorrecta del pronombre débil.", "Incorrect weak pronoun form."]
    ,"Forma de pronom feble incorrecta. Cal usar __SUGGESTION_1__.": ["Forma incorrecta del pronombre débil. Debe usarse «{suggestion1}».", "Incorrect weak pronoun form. Use ‘{suggestion1}’. "]
    ,"Sobra un espai.": ["Sobra un espacio.", "There is an extra space."]
    ,"Hi falta un guionet.": ["Falta un guion.", "A hyphen is missing."]
    ,"Apostrofació incorrecta.": ["Apóstrofo incorrecto.", "Incorrect apostrophe use."]
    ,"Si és una forma del v. 'diferenciar', s'escriu sense accent.": ["Si es una forma del verbo «diferenciar», se escribe sin tilde.", "If it is a form of ‘diferenciar’, it is written without an accent mark."]
    ,"S'accentua si és del v. 'donar' (segons les normes tradicionals; desactiveu la regla si voleu les normes noves).": ["Lleva tilde si es una forma del verbo «donar» (según la norma tradicional; desactiva la regla si prefieres la norma nueva).", "Use an accent mark for forms of ‘donar’ under the traditional spelling rules; disable this rule if you prefer the new rules."]
    ,"Amb el sentit de 'quina cosa', s'escriu amb accent.": ["Con el sentido de «qué cosa», se escribe con tilde.", "When it means ‘what thing’, it takes an accent mark."]
    ,"Ús abusiu del v. 'realitzar'. Considereu una opció alternativa.": ["Uso excesivo del verbo «realitzar». Considera otra opción.", "Overuse of the verb ‘realitzar’. Consider an alternative."]
    ,"En aquest context, val més usar un altre verb.": ["En este contexto, es preferible usar otro verbo.", "Use a different verb in this context."]
    ,"Paraula només admesa per alguns diccionaris.": ["Palabra admitida solo por algunos diccionarios.", "Word accepted by only some dictionaries."]
    ,"Usem preferentment la forma __SUGGESTION_1__.": ["Se recomienda la forma «{suggestion1}».", "Prefer the form ‘{suggestion1}’. "]
    ,"És preferible usar __SUGGESTION_1__.": ["Es preferible usar «{suggestion1}».", "Prefer ‘{suggestion1}’. "]
    ,"Probablement hi falta una coma.": ["Probablemente falta una coma.", "A comma may be missing."]
    ,"Probablement hi falta el pronom 'en'.": ["Probablemente falta el pronombre «en».", "The pronoun ‘en’ may be missing."]
    ,"Si és un pronom interrogatiu (=quina cosa), s'escriu amb accent. S'escriu sense accent si la resposta és \"sí\" o \"no\" (\"Que vindràs?\").": ["Si es un pronombre interrogativo (equivalente a «qué cosa»), lleva tilde. Se escribe sin tilde si la respuesta es «sí» o «no» («¿Que vendrás?»).", "An interrogative pronoun (meaning ‘what thing’) takes an accent mark. It has no accent mark when the answer is ‘yes’ or ‘no’ (‘Que vindràs?’)."]
    ,"Si equival a \"quina cosa\", cal escriure __SUGGESTION_1__. S’escriu sense accent si la resposta és «sí» o «no».": ["Si equivale a «qué cosa», debe escribirse «{suggestion1}». Se escribe sin tilde si la respuesta es «sí» o «no».", "If it means ‘what thing’, write ‘{suggestion1}’. It has no accent mark when the answer is ‘yes’ or ‘no’."]
    ,"Amb sentit causal, val més usar una altra construcció.": ["Con sentido causal, es preferible usar otra construcción.", "Use a different construction for the causal meaning."]
    ,"Ús pronominal incorrecte. Canvieu l'expressió o elimineu el pronom reflexiu.": ["Uso pronominal incorrecto. Cambia la expresión o elimina el pronombre reflexivo.", "Incorrect pronominal use. Rephrase or remove the reflexive pronoun."]
    ,"En aquest context, val més usar \"destinació\", encara que són sinònims segons els diccionaris.": ["En este contexto, es preferible usar «destinació», aunque los diccionarios consideran ambas formas sinónimas.", "In this context, ‘destinació’ is preferable, although dictionaries list the words as synonyms."]
    ,"Per a indicar obligació, cal usar una altra expressió.": ["Para expresar obligación, hay que usar otra expresión.", "Use a different expression to express obligation."]
    ,"Aquest possessiu és probablement redundant. Val més eliminar-lo.": ["Este posesivo probablemente es redundante. Es preferible eliminarlo.", "This possessive is probably redundant and is best removed."]
    ,"En aquest context, la paraula adequada és __SUGGESTION_1__.": ["En este contexto, la palabra adecuada es «{suggestion1}».", "The appropriate word in this context is ‘{suggestion1}’. "]
    ,"En aquest context la paraula adequada és __SUGGESTION_1__.": ["En este contexto, la palabra adecuada es «{suggestion1}».", "The appropriate word in this context is ‘{suggestion1}’. "]
    ,"Val més usar una altra paraula si vol dir deixant.": ["Si significa «dejando», es preferible usar otra palabra.", "Use a different word if it means ‘leaving’. "]
    ,"¿Volíeu dir __SUGGESTION_1__ (acord) en comptes de \"enteniment\" (seny)?": ["¿Querías decir «{suggestion1}» (acuerdo) en vez de «enteniment» (juicio)?", "Did you mean ‘{suggestion1}’ (agreement) rather than ‘enteniment’ (understanding)?"]
    ,"Com a substantiu, és preferible dir \"rematada\", \"últim retoc\", \"acabament\", \"coronament\". \"Remat\" no és admès per tots els diccionaris.": ["Como sustantivo, es preferible decir «rematada», «últim retoc», «acabament» o «coronament». «Remat» no está admitido en todos los diccionarios.", "As a noun, prefer ‘rematada’, ‘últim retoc’, ‘acabament’ or ‘coronament’. ‘Remat’ is not accepted by all dictionaries."]
    ,"Val més dir \"muntanya\". L'ús de \"mont\" es limita normalment a alguns noms propis.": ["Es preferible decir «muntanya». «Mont» suele limitarse a algunos nombres propios.", "Prefer ‘muntanya’. ‘Mont’ is usually limited to some proper names."]
    ,"Aquest nom és masculí.": ["Este sustantivo es masculino.", "This noun is masculine."]
    ,"Dos articles seguits.": ["Hay dos artículos seguidos.", "Two articles appear in a row."]
    ,"Els percentatges superiors a deu o amb decimals s'escriuen preferentment amb xifres.": ["Los porcentajes superiores a diez o con decimales se escriben preferentemente con cifras.", "Percentages over ten or with decimals are preferably written in digits."]
    ,"És preferible usar la paraula \"calibratge\", que és la que apareix en els diccionaris.": ["Es preferible usar la palabra «calibratge», que es la que aparece en los diccionarios.", "Prefer the word ‘calibratge’, which is the form listed in dictionaries."]
    ,"El verb 'consentir' s'usa preferentment en la forma no incoativa.": ["El verbo «consentir» se usa preferentemente en la forma no incoativa.", "The non-inchoative form of ‘consentir’ is preferred."]
    ,"\"Anàlisi\" és un nom femení.": ["«Anàlisi» es un sustantivo femenino.", "‘Anàlisi’ is a feminine noun."]
    ,"El substantiu 'calor' és femení.": ["El sustantivo «calor» es femenino.", "The noun ‘calor’ is feminine."]
    ,"És preferible usar 'vessant' com a nom masculí. En alguns sentits (en geologia) no és correcte en femení.": ["Es preferible usar «vessant» como sustantivo masculino. En algunos sentidos (en geología) no es correcto en femenino.", "Prefer ‘vessant’ as a masculine noun. In some meanings (in geology), the feminine is incorrect."]
    ,"Construcció incorrecta com a perífrasi d'obligació.": ["Construcción incorrecta como perífrasis de obligación.", "Incorrect construction of an obligation periphrasis."]
    ,"Aquest verb és transitiu. Potser cal canviar el pronom.": ["Este verbo es transitivo. Quizá haya que cambiar el pronombre.", "This verb is transitive. The pronoun may need to change."]
    ,"L'article no està ben escrit.": ["El artículo está mal escrito.", "The article is misspelled."]
    ,"Expressió incorrecta en el sentit de \"recórrer a\".": ["Expresión incorrecta con el sentido de «recurrir a».", "Incorrect expression when it means ‘to resort to’. "]
    ,"Val més usar una altra expressió. Probablement és més apropiat el verb 'sentir'.": ["Es preferible usar otra expresión. Probablemente el verbo «sentir» es más apropiado.", "Use a different expression. The verb ‘sentir’ is probably more appropriate."]
    ,"Possessiu redundant. Val més eliminar-lo i usar una altra expressió.": ["Posesivo redundante. Es preferible eliminarlo y usar otra expresión.", "Redundant possessive. Remove it and rephrase."]
    ,"En aquest context, \"llum\" és masculí.": ["En este contexto, «llum» es masculino.", "In this context, ‘llum’ is masculine."]
    ,"En aquest context, cal usar el gènere femení.": ["En este contexto, debe usarse el género femenino.", "Use the feminine gender in this context."]
    ,"En aquest context, cal usar el gènere masculí.": ["En este contexto, debe usarse el género masculino.", "Use the masculine gender in this context."]
    ,"Símbols de graus, minuts i segons d'angle pla.": ["Símbolos de grados, minutos y segundos de ángulo plano.", "Symbols for degrees, minutes and seconds of plane angle."]
    ,"Símbols de graus i minuts d'angle pla.": ["Símbolos de grados y minutos de ángulo plano.", "Symbols for degrees and minutes of plane angle."]
    ,"Símbols de minuts i segons d'angle pla.": ["Símbolos de minutos y segundos de ángulo plano.", "Symbols for minutes and seconds of plane angle."]
    ,"Si voleu indicar graus, useu el símbol °__SUGGESTION_1__.": ["Para indicar grados, usa el símbolo °{suggestion1}.", "To indicate degrees, use the symbol °{suggestion1}."]
    ,"Els kèlvins no són graus.": ["Los kelvin no son grados.", "Kelvins are not degrees."]
    ,"Aquest nom s'usa normalment en singular. El plural pot ser una influència de l'anglès.": ["Este sustantivo suele usarse en singular. El plural puede deberse a la influencia del inglés.", "This noun is usually singular. The plural may be influenced by English."]
    ,"Si és nom, ha de ser masculí. Correcte com a adjectiu.": ["Como sustantivo, debe ser masculino. Es correcto como adjetivo.", "It must be masculine as a noun; it is correct as an adjective."]
    ,"Si és nom, ha de ser masculí.": ["Como sustantivo, debe ser masculino.", "It must be masculine as a noun."]
    ,"Incorrecte en el sentit de 'cau' o 'recer'. \"__SUGGESTION_1__\" és un participi del verb 'guarir'.": ["Incorrecto con el sentido de «cubil» o «refugio». «{suggestion1}» es un participio del verbo «guarir».", "Incorrect when it means ‘den’ or ‘shelter’. ‘{suggestion1}’ is a participle of ‘guarir’. "]
    ,"Si és del verb 'haver', cal escriure \"heu\".": ["Si es una forma del verbo «haver», debe escribirse «heu».", "If it is a form of ‘haver’, write ‘heu’. "]
    ,"¿Volíeu dir \"ja\"?": ["¿Querías decir «ja»?", "Did you mean ‘ja’? "]
    ,"¿Volíeu dir un any de quatre dígits?": ["¿Querías decir un año de cuatro cifras?", "Did you mean a four-digit year? "]
    ,"Hi falta el pronom 'en'.": ["Falta el pronombre «en».", "The pronoun ‘en’ is missing."]
    ,"Cal fer servir la conjunció __SUGGESTION_1__ en comptes del pronom feble \"hi\".": ["Debe usarse la conjunción «{suggestion1}» en vez del pronombre débil «hi».", "Use the conjunction ‘{suggestion1}’ instead of the weak pronoun ‘hi’. "]
    ,"Possible redundància. Potser cal eliminar el pronom feble 'hi'.": ["Posible redundancia. Quizá haya que eliminar el pronombre débil «hi».", "Possible redundancy. The weak pronoun ‘hi’ may need to be removed."]
    ,"Per a parlar d'una persona amb un càrrec equivalent a una altra, el terme adequat és __SUGGESTION_1__.": ["Para referirse a una persona con un cargo equivalente al de otra, el término adecuado es «{suggestion1}».", "When referring to a person whose position is equivalent to another’s, the correct term is ‘{suggestion1}’. "]
    ,"Com a nom científic s'escriu sense accent.": ["Como nombre científico, se escribe sin tilde.", "As a scientific name, it is written without an accent mark."]
    ,"Probablement hi falta el pronom 'ho'.": ["Probablemente falta el pronombre «ho».", "The pronoun ‘ho’ may be missing."]
    ,"¿Volíeu dir \"sé\" (del verb 'saber')?": ["¿Querías decir «sé» (del verbo «saber»)?", "Did you mean ‘sé’ (from the verb ‘saber’)?"]
    ,"Si és un topònim, s'escriu amb majúscula.": ["Si es un topónimo, se escribe con mayúscula.", "Capitalize it if it is a place name."]
    ,"Si la frase és imperativa, després de la negació cal usar el verb en subjuntiu.": ["Si la frase es imperativa, después de la negación debe usarse el verbo en subjuntivo.", "In a negative imperative, use the subjunctive after the negation."]
    ,"Per a donar indicacions o ordres, useu l'imperatiu.": ["Para dar indicaciones u órdenes, usa el imperativo.", "Use the imperative to give instructions or commands."]
    ,"Si és un pronom, cal escriure __SUGGESTION_1__.": ["Si es un pronombre, debe escribirse «{suggestion1}».", "If it is a pronoun, write ‘{suggestion1}’. "]
    ,"Possible confusió de lletres (i majúscula/ela minúscula).": ["Posible confusión entre letras (i mayúscula y ele minúscula).", "Possible confusion between letters (capital ‘I’ and lowercase ‘l’)."]
    ,"Pronom feble inadequat.": ["Pronombre débil inadecuado.", "Inappropriate weak pronoun."]
    ,"Normalment s'escriu amb article.": ["Normalmente se escribe con artículo.", "It is usually written with an article."]
    ,"Amb referència al cap de l'Església catòlica, l'expressió adequada és __SUGGESTION_1__.": ["Para referirse al jefe de la Iglesia católica, la expresión adecuada es «{suggestion1}».", "When referring to the head of the Catholic Church, use ‘{suggestion1}’. "]
    ,"L'expressió adequada és __SUGGESTION_1__.": ["La expresión adecuada es «{suggestion1}».", "The correct expression is ‘{suggestion1}’. "]
    ,"¿Volíeu dir __SUGGESTION_1__ (pronom)? \"Ha\" és una forma del verb 'haver'.": ["¿Querías decir «{suggestion1}» (pronombre)? «Ha» es una forma del verbo «haver». ", "Did you mean ‘{suggestion1}’ (pronoun)? ‘Ha’ is a form of ‘haver’. "]
    ,"El pronom adequat és 'li' (a ell, a ella).": ["El pronombre adecuado es «li» (a él, a ella).", "The appropriate pronoun is ‘li’ (to him or her)."]
    ,"El pronom adequat és __SUGGESTION_1__.": ["El pronombre adecuado es «{suggestion1}».", "The appropriate pronoun is ‘{suggestion1}’. "]
    ,"Anglicisme.": ["Anglicismo.", "Anglicism."]
    ,"El pronom adequat és probablement \"el\" o \"la\".": ["El pronombre adecuado probablemente es «el» o «la».", "The appropriate pronoun is probably ‘el’ or ‘la’. "]
    ,"En aquest context és preferible dir __SUGGESTION_1__.": ["En este contexto, es preferible decir «{suggestion1}».", "In this context, ‘{suggestion1}’ is preferable."]
    ,"¿Volíeu dir __SUGGESTION_1__ (adjectiu)? \"Lliura\" és una forma del verb 'lliurar'.": ["¿Querías decir «{suggestion1}» (adjetivo)? «Lliura» es una forma del verbo «lliurar».", "Did you mean ‘{suggestion1}’ (adjective)? ‘Lliura’ is a form of ‘lliurar’. "]
    ,"Formalment, cal escriure __SUGGESTION_1__ o algun combinació amb '-los'.": ["En un registro formal, debe escribirse «{suggestion1}» o alguna combinación con «-los».", "In formal usage, write ‘{suggestion1}’ or another combination with ‘-los’. "]
    ,"Probablement, cal escriure __SUGGESTION_1__. La combinació de pronoms 'els hi' per al complement indirecte és informal en molts casos.": ["Probablemente debe escribirse «{suggestion1}». La combinación de pronombres «els hi» como complemento indirecto es informal en muchos casos.", "The correct form is probably ‘{suggestion1}’. Using ‘els hi’ for an indirect object is informal in many contexts."]
    ,"¿Volíeu dir __SUGGESTION_1__ (taca a la pell)? \"Lunar\" és correcte com a adjectiu que signfica 'relatiu a la lluna'.": ["¿Querías decir «{suggestion1}» (mancha en la piel)? «Lunar» es correcto como adjetivo con el sentido de «relativo a la luna».", "Did you mean ‘{suggestion1}’ (a spot on the skin)? ‘Lunar’ is correct as an adjective meaning ‘related to the moon’. "]
    ,"Els noms de lletra no s'apostrofen.": ["Los nombres de las letras no se apostrofan.", "Names of letters do not take an apostrophe."]
    ,"Podeu evitar aquest anglicisme amb una altra expressió.": ["Puedes evitar este anglicismo usando otra expresión.", "You can avoid this anglicism by using a different expression."]
    ,"L'escriptura correcta és __SUGGESTION_1__.": ["La escritura correcta es «{suggestion1}».", "The correct spelling is ‘{suggestion1}’. "]
    ,"Error de majúscules i minúscules.": ["Error en el uso de mayúsculas y minúsculas.", "Incorrect capitalization."]
    ,"Com a substantiu, s'escriu junt.": ["Como sustantivo, se escribe en una sola palabra.", "As a noun, it is written as one word."]
    ,"Aquesta expressió existeix en català.": ["Esta expresión existe en catalán.", "This expression exists in Catalan."]
    ,"Paraula col·loquial.": ["Palabra coloquial.", "Colloquial word."]
    ,"Si és un nom castellà, duu accent.": ["Si es un nombre castellano, lleva tilde.", "If it is a Spanish name, it takes an accent mark."]
    ,"Paraula col·loquial admesa només en alguns diccionaris.": ["Palabra coloquial admitida solo en algunos diccionarios.", "Colloquial word accepted by only some dictionaries."]
    ,"Alerta amb la traducció automàtica!": ["¡Cuidado con la traducción automática!", "Beware of machine translation!"]
    ,"Incorrecte en el sentit de 'entorn, ambient'.": ["Incorrecto con el sentido de «entorno, ambiente».", "Incorrect when it means ‘surroundings’ or ‘atmosphere’. "]
    ,"Amb el sentit d'ingerir o consumir completament, val més usar la forma reflexiva 'menjar-se'.": ["Con el sentido de ingerir o consumir por completo, es preferible usar la forma reflexiva «menjar-se».", "When it means to eat or consume something completely, prefer the reflexive form ‘menjar-se’. "]
    ,"Val més usar un ordre més natural.": ["Es preferible usar un orden más natural.", "Use a more natural word order."]
    ,"Probablement cal usar el pronom __SUGGESTION_1__.": ["Probablemente debe usarse el pronombre «{suggestion1}».", "The pronoun ‘{suggestion1}’ is probably needed."]
    ,"Probablement cal dir __SUGGESTION_1__ (adverbi) o __SUGGESTION_2__ davant d'un adjectiu.": ["Probablemente debe decirse «{suggestion1}» (adverbio) o «{suggestion2}» delante de un adjetivo.", "The correct form is probably ‘{suggestion1}’ (adverb) or ‘{suggestion2}’ before an adjective."]
    ,"Podeu fer més natural la frase usant una altra expressió.": ["Puedes hacer que la frase suene más natural usando otra expresión.", "Make the sentence more natural by using a different expression."]
    ,"Amb el sentit de 'terme mitjà', cal dir __SUGGESTION_1__.": ["Con el sentido de «término medio», debe decirse «{suggestion1}».", "When it means ‘average’, use ‘{suggestion1}’. "]
    ,"En aquest cas cal dir __SUGGESTION_1__.": ["En este caso, debe decirse «{suggestion1}».", "Use ‘{suggestion1}’ in this case."]
    ,"Incorrecte en aquest context.": ["Incorrecto en este contexto.", "Incorrect in this context."]
    ,"Si es tracta del cos (Mossos d'Esquadra), s'escriu amb majúscula. Si ens referim a membres del cos, s'escriu amb minúscula.": ["Si se refiere al cuerpo policial (Mossos d'Esquadra), se escribe con mayúscula. Si se refiere a sus miembros, con minúscula.", "Capitalize it when referring to the police force (Mossos d'Esquadra); use lowercase for its members."]
    ,"Amb referència al cap de l'Església catòlica, l'expressió adequada és __SUGGESTION_1__": ["Para referirse al jefe de la Iglesia católica, la expresión adecuada es «{suggestion1}».", "When referring to the head of the Catholic Church, use ‘{suggestion1}’. "]
    ,"L'expressió adequada és __SUGGESTION_1__": ["La expresión adecuada es «{suggestion1}».", "The correct expression is ‘{suggestion1}’. "]
    ,"En un registre formal cal dir __SUGGESTION_1__.": ["En un registro formal debe decirse «{suggestion1}».", "In formal usage, say ‘{suggestion1}’. "]
    ,"S'escriu amb guionets.": ["Se escribe con guiones.", "Write it with hyphens."]
    ,"No és adequat usar \"nacional\" amb el sentit de ciutadà.": ["No es adecuado usar «nacional» con el sentido de ciudadano.", "Do not use ‘nacional’ to mean ‘citizen’. "]
    ,"Si es refereix sols a un any, ha de ser singular i preferiblement sense article.": ["Si se refiere a un solo año, debe ir en singular y, preferiblemente, sin artículo.", "If it refers to a single year, use the singular, preferably without an article."]
    ,"Si es refereix sols a un any, ha de ser singular.": ["Si se refiere a un solo año, debe ir en singular.", "If it refers to a single year, use the singular."]
    ,"Gentilici incorrecte de Nova Zelanda.": ["Gentilicio incorrecto de Nueva Zelanda.", "Incorrect demonym for New Zealand."]
    ,"Possible redundància.": ["Posible redundancia.", "Possible redundancy."]
    ,"En el sentit de 'quantitat' cal dir __SUGGESTION_1__.": ["Con el sentido de «cantidad», debe decirse «{suggestion1}».", "When it means ‘quantity’, use ‘{suggestion1}’. "]
    ,"Probablement hi falta un espai.": ["Probablemente falta un espacio.", "A space may be missing."]
    ,"Si no hi ha altres comes en la frase, aquesta coma és innecessària.": ["Si no hay otras comas en la frase, esta coma es innecesaria.", "If there are no other commas in the sentence, this comma is unnecessary."]
    ,"En sentit figurat, aquesta expressió és un calc del castellà.": ["En sentido figurado, esta expresión es un calco del castellano.", "In its figurative sense, this expression is calqued from Spanish."]
    ,"Useu els verbs 'caldre' o 'deure', o bé completeu la perífrasi 'haver de + infinitiu'.": ["Usa los verbos «caldre» o «deure», o completa la perífrasis «haver de + infinitivo».", "Use ‘caldre’ or ‘deure’, or complete the ‘haver de + infinitive’ construction."]
    ,"Expressió incorrecta. Calc del castellà.": ["Expresión incorrecta. Calco del castellano.", "Incorrect expression. Calqued from Spanish."]
    ,"Repetició probablement incorrecta de 'no'.": ["Probablemente hay una repetición incorrecta de «no».", "The repetition of ‘no’ is probably incorrect."]
    ,"No barregeu les locucions \"no tant... com\" i \"no... sinó\". Useu l'una o l'altra.": ["No mezcles las construcciones «no tant... com» y «no... sinó». Usa una u otra.", "Do not mix the ‘no tant... com’ and ‘no... sinó’ constructions. Use one or the other."]
    ,"Expressió admesa només en alguns diccionaris.": ["Expresión admitida solo en algunos diccionarios.", "Expression accepted by only some dictionaries."]
    ,"Forma incorrecta.": ["Forma incorrecta.", "Incorrect form."]
    ,"Si no es tracta d'un lloc físic, és preferible dir __SUGGESTION_1__.": ["Si no se refiere a un lugar físico, es preferible decir «{suggestion1}».", "If it does not refer to a physical place, ‘{suggestion1}’ is preferable."]
    ,"Els ordinals s'escriuen preferiblement sense punt.": ["Los ordinales se escriben preferentemente sin punto.", "Ordinal numbers are preferably written without a full stop."]
    ,"L'ordre habitual és \"Pròxim Orient\".": ["El orden habitual es «Pròxim Orient».", "The usual form is ‘Pròxim Orient’. "]
    ,"L'abreviació de pàgina o pàgines és __SUGGESTION_1__.": ["La abreviatura de página o páginas es «{suggestion1}».", "The abbreviation for page or pages is ‘{suggestion1}’. "]
    ,"En aquest context, és més apropiat dir __SUGGESTION_1__.": ["En este contexto, es más apropiado decir «{suggestion1}».", "In this context, ‘{suggestion1}’ is more appropriate."]
    ,"Amb el sentit de 'opinió' cal dir \"parer\".": ["Con el sentido de «opinión», debe decirse «parer».", "When it means ‘opinion’, use ‘parer’. "]
    ,"És més adequat usar el verb en singular.": ["Es más adecuado usar el verbo en singular.", "The singular verb form is more appropriate."]
    ,"Falta un infinitiu darrere del verb auxiliar.": ["Falta un infinitivo después del verbo auxiliar.", "An infinitive is missing after the auxiliary verb."]
    ,"Hi falta un infinitiu, un gerundi o un participi.": ["Falta un infinitivo, un gerundio o un participio.", "An infinitive, gerund or participle is missing."]
    ,"Referit a una tècnica de pintura cal dir __SUGGESTION_1__.": ["Para referirse a una técnica de pintura, debe decirse «{suggestion1}».", "For the painting technique, use ‘{suggestion1}’. "]
    ,"Llatinisme no enregistrat pels diccionaris normatius.": ["Latinismo no registrado en los diccionarios normativos.", "Latinism not listed in normative dictionaries."]
    ,"En el sentit de 'diners' (col·loquial) podeu dir __SUGGESTION_1__.": ["Con el sentido coloquial de «dinero», puedes decir «{suggestion1}».", "In the colloquial sense ‘money’, you can say ‘{suggestion1}’. "]
    ,"¿Volíeu dir __SUGGESTION_1__ (preposició)? \"Pa\" és una pronunciació col·loquial.": ["¿Querías decir «{suggestion1}» (preposición)? «Pa» es una pronunciación coloquial.", "Did you mean ‘{suggestion1}’ (preposition)? ‘Pa’ is a colloquial pronunciation."]
    ,"Paraula castellana. En sentit figurat ('enriquiment ràpid'), podeu deixar-la en cursiva o fer servir una alternativa.": ["Palabra castellana. En sentido figurado («enriquecimiento rápido»), puedes dejarla en cursiva o usar una alternativa.", "Spanish word. In the figurative sense ‘rapid enrichment’, you may italicize it or use an alternative."]
    ,"\"Corrent\" és un substantiu masculí.": ["«Corrent» es un sustantivo masculino.", "‘Corrent’ is a masculine noun."]
    ,"Useu el símbol adequat d'apòstrof.": ["Usa el símbolo adecuado de apóstrofo.", "Use the appropriate apostrophe character."]
    ,"Si és conjunció final (seguida de subjuntiu), cal escriure __SUGGESTION_1__.": ["Si es una conjunción final (seguida de subjuntivo), debe escribirse «{suggestion1}».", "For a purpose clause followed by the subjunctive, write ‘{suggestion1}’. "]
    ,"Amb el sentit de 'per a quina finalitat', s'escriu __SUGGESTION_1__.": ["Con el sentido de «con qué finalidad», se escribe «{suggestion1}».", "When it means ‘for what purpose’, write ‘{suggestion1}’. "]
    ,"Cal dir __SUGGESTION_1__ (pel fet que, amb la finalitat que) o __SUGGESTION_2__ (per a quina finalitat).": ["Debe decirse «{suggestion1}» (porque, con el fin de que) o «{suggestion2}» (con qué finalidad).", "Use ‘{suggestion1}’ (because, so that) or ‘{suggestion2}’ (for what purpose)."]
    ,"En aquest context, l'expressió adequada és __SUGGESTION_1__.": ["En este contexto, la expresión adecuada es «{suggestion1}».", "In this context, the appropriate expression is ‘{suggestion1}’. "]
    ,"Si indica prioritat, caldria dir __SUGGESTION_1__ o __SUGGESTION_2__.": ["Si indica prioridad, debería decirse «{suggestion1}» o «{suggestion2}».", "If it indicates priority, use ‘{suggestion1}’ or ‘{suggestion2}’. "]
    ,"Preposició probablement incorrecta.": ["Preposición probablemente incorrecta.", "The preposition may be incorrect."]
    ,"Expressió col·loquial. En llenguatge formal, cal dir __SUGGESTION_1__.": ["Expresión coloquial. En un registro formal, debe decirse «{suggestion1}».", "Colloquial expression. In formal writing, use ‘{suggestion1}’. "]
    ,"Cal escriure __SUGGESTION_1__ (=per quina raó).": ["Debe escribirse «{suggestion1}» (=por qué razón).", "Write ‘{suggestion1}’ (=for what reason)."]
    ,"El verb hauria d'estar en mode subjuntiu.": ["El verbo debería estar en modo subjuntivo.", "The verb should be in the subjunctive mood."]
    ,"Error de traducció automàtica.": ["Error de traducción automática.", "Machine-translation error."]
    ,"Si ens referim a un nom incomptable (\\1 \\4), cal dir \"gens\".": ["Si se refiere a un sustantivo incontable («\\1 \\4»), debe decirse «gens».", "For an uncountable noun (‘\\1 \\4’), use ‘gens’. "]
    ,"Expressió usada a vegades de manera abusiva. Considereu una alternativa.": ["Expresión que a veces se usa en exceso. Considera una alternativa.", "This expression is sometimes overused. Consider an alternative."]
    ,"En referència a un astre que s'amaga, cal usar el verb 'pondre'.": ["Para referirse a un astro que se oculta, debe usarse el verbo «pondre».", "Use the verb ‘pondre’ for a celestial body setting."]
    ,"Expressió incorrecta per a indicar una causa. \"Posat que\", seguit d'un verb en subjuntiu, equival a 'suposant que, en cas que'.": ["Expresión incorrecta para indicar una causa. «Posat que», seguido de un verbo en subjuntivo, significa «suponiendo que, en caso de que».", "Incorrect expression for indicating a cause. ‘Posat que’ followed by the subjunctive means ‘assuming that, in case’. "]
    ,"Davant de parts del cos, el possessiu és normalment redundant.": ["Ante partes del cuerpo, el posesivo suele ser redundante.", "Possessives are usually redundant before body parts."]
    ,"Cal dir __SUGGESTION_1__ (femení plural).": ["Debe decirse «{suggestion1}» (femenino plural).", "Use ‘{suggestion1}’ (feminine plural)."]
    ,"Normalment s'escriu sense guionet, fins i tot si la paraula resultant no és en el diccionari.": ["Normalmente se escribe sin guion, aunque la palabra resultante no figure en el diccionario.", "It is usually written without a hyphen, even if the resulting word is not in the dictionary."]
    ,"La preposició adequada amb el verb 'preocupar-se' és __SUGGESTION_1__ o __SUGGESTION_2__.": ["La preposición adecuada con el verbo «preocupar-se» es «{suggestion1}» o «{suggestion2}».", "The correct preposition with ‘preocupar-se’ is ‘{suggestion1}’ or ‘{suggestion2}’. "]
    ,"En una fórmula de datació, la localitat s'escriu sense la preposició 'a'.": ["En una fórmula de datación, el topónimo se escribe sin la preposición «a».", "In a date line, write the place name without the preposition ‘a’. "]
    ,"Potser hi falta un \"que\".": ["Quizá falta un «que».", "A ‘que’ may be missing."]
    ,"L'adjectiu 'present' ha de concordar amb el substantiu a què es refereix.": ["El adjetivo «present» debe concordar con el sustantivo al que se refiere.", "The adjective ‘present’ must agree with the noun it modifies."]
    ,"El v. 'projectar' amb el sentit de 'preveure' és un calc de l'anglès no recomanable.": ["El verbo «projectar» con el sentido de «prever» es un calco desaconsejado del inglés.", "Using ‘projectar’ to mean ‘foresee’ is a discouraged calque from English."]
    ,"Massa pronoms febles!": ["¡Demasiados pronombres débiles!", "Too many weak pronouns!"]
    ,"Probablement cal usar un pronom de complement indirecte.": ["Probablemente debe usarse un pronombre de complemento indirecto.", "An indirect-object pronoun is probably needed."]
    ,"Pronoms febles solts.": ["Pronombres débiles sueltos.", "Unattached weak pronouns."]
    ,"Possible error ortogràfic. S'espera un verb després del pronom.": ["Posible error ortográfico. Se espera un verbo después del pronombre.", "Possible spelling error. A verb is expected after the pronoun."]
    ,"Forma incorrecta d'imperatiu.": ["Forma incorrecta del imperativo.", "Incorrect imperative form."]
    ,"Hi falta el pronom 'hi'.": ["Falta el pronombre «hi».", "The pronoun ‘hi’ is missing."]
    ,"En aquest cas val més evitar l'adjectiu 'proper'. Es pot eliminar o canviar.": ["En este caso es preferible evitar el adjetivo «proper». Puede eliminarse o sustituirse.", "Here, avoid the adjective ‘proper’; remove or replace it."]
    ,"En aquesta expressió val més evitar l'adjectiu \"proper\".": ["En esta expresión es preferible evitar el adjetivo «proper».", "Avoid the adjective ‘proper’ in this expression."]
    ,"En aquest cas val més evitar l'adjectiu 'proper'.": ["En este caso es preferible evitar el adjetivo «proper».", "Avoid the adjective ‘proper’ in this case."]
    ,"L'expressió més habitual i apropiada és __SUGGESTION_1__.": ["La expresión más habitual y apropiada es «{suggestion1}».", "The most common and appropriate expression is ‘{suggestion1}’. "]
    ,"Si és un adjectiu, cal accentuar. Correcte si és del v. 'publicar'.": ["Si es un adjetivo, lleva tilde. Es correcto si es una forma del verbo «publicar».", "As an adjective, it takes an accent mark. It is correct if it is a form of ‘publicar’. "]
    ,"Probablement falta un punt al final de la frase.": ["Probablemente falta un punto al final de la frase.", "A full stop may be missing at the end of the sentence."]
    ,"Per a unir un verb i un pronom usem un guionet.": ["Para unir un verbo y un pronombre, se usa un guion.", "Use a hyphen to join a verb and a pronoun."]
    ,"Abreviatura de \"per exemple\".": ["Abreviatura de «por ejemplo».", "Abbreviation for ‘for example’. "]
    ,"El v. 'qualificar' regeix normalment la preposició \"de\".": ["El verbo «qualificar» suele regir la preposición «de».", "The verb ‘qualificar’ usually takes the preposition ‘de’. "]
    ,"En aquesta construcció és més apropiat dir __SUGGESTION_1__.": ["En esta construcción es más apropiado decir «{suggestion1}».", "In this construction, ‘{suggestion1}’ is more appropriate."]
    ,"En aquesta construcció cal dir __SUGGESTION_1__.": ["En esta construcción debe decirse «{suggestion1}».", "Use ‘{suggestion1}’ in this construction."]
    ,"'Quan' no és preposició. Useu una altra construcció o bé reviseu la puntuació.": ["«Quan» no es una preposición. Usa otra construcción o revisa la puntuación.", "‘Quan’ is not a preposition. Rephrase or check the punctuation."]
    ,"Només s'accentua quan equival a \"quina cosa\".": ["Solo lleva tilde cuando equivale a «qué cosa».", "It takes an accent mark only when it means ‘what thing’. "]
    ,"¿Volíeu dir __SUGGESTION_1__": ["¿Querías decir «{suggestion1}»?", "Did you mean ‘{suggestion1}’? "]
    ,"Probablement val més usar el verb 'haver-hi'.": ["Es preferible usar el verbo «haver-hi».", "The verb ‘haver-hi’ is preferable here."]
    ,"Probablement no s'ha d'accentuar. Només s'accentua si es pot substituir per 'quina cosa'.": ["Probablemente no lleva tilde. Solo se acentúa si puede sustituirse por «qué cosa».", "It probably does not take an accent mark. It does only when it can be replaced by ‘what thing’. "]
    ,"Probablement no s'ha d'accentuar. Només s'accentua si es pot substituir per 'quina cosa'. O bé reviseu la puntuació.": ["Probablemente no lleva tilde. Solo se acentúa si puede sustituirse por «qué cosa». También puedes revisar la puntuación.", "It probably does not take an accent mark. It does only when it can be replaced by ‘what thing’. You may also need to check the punctuation."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"\\1\" és participi del v. 'fulgir'.": ["¿Querías decir «{suggestion1}»? «\\1» es un participio del verbo «fulgir».", "Did you mean ‘{suggestion1}’? ‘\\1’ is a participle of ‘fulgir’. "]
    ,"Possible error de picatge. Existeix la paraula \"\\1\", però és infreqüent.": ["Posible error tipográfico. La palabra «\\1» existe, pero es poco frecuente.", "Possible typo. The word ‘\\1’ exists, but is uncommon."]
    ,"Paraula d'ús poc freqüent fora de l'expressió \"en pac de\" (en pagament de).": ["Palabra poco frecuente fuera de la expresión «en pac de» (en pago de).", "This word is uncommon outside the expression ‘en pac de’ (in payment for)."]
    ,"Paraula antiga poc comuna. ¿Volíeu dir __SUGGESTION_1__?": ["Palabra antigua y poco frecuente. ¿Querías decir «{suggestion1}»?", "Archaic, uncommon word. Did you mean ‘{suggestion1}’? "]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Rapit\" és participi del v. 'rapir'.": ["¿Querías decir «{suggestion1}»? «Rapit» es un participio del verbo «rapir».", "Did you mean ‘{suggestion1}’? ‘Rapit’ is a participle of ‘rapir’. "]
    ,"En aquest context sembla més adequat usar el verb 'collir'.": ["En este contexto parece más adecuado usar el verbo «collir».", "The verb ‘collir’ seems more appropriate in this context."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Redoble\" és una forma verbal valenciana del v. 'redoblar'.": ["¿Querías decir «{suggestion1}»? «Redoble» es una forma verbal valenciana del verbo «redoblar».", "Did you mean ‘{suggestion1}’? ‘Redoble’ is a Valencian verb form of ‘redoblar’. "]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Redobles\" és una forma verbal del v. 'redoblar'.": ["¿Querías decir «{suggestion1}»? «Redobles» es una forma verbal de «redoblar».", "Did you mean ‘{suggestion1}’? ‘Redobles’ is a form of ‘redoblar’. "]
    ,"En aquest cas, cal usar el masculí 'reglet', diminutiu de 'regle'.": ["En este caso, debe usarse el masculino «reglet», diminutivo de «regle».", "Use the masculine ‘reglet’ here, a diminutive of ‘regle’. "]
    ,"Els noms dels papes s'escriu amb xifres romanes.": ["Los nombres de los papas se escriben con cifras romanas.", "The names of popes are written with Roman numerals."]
    ,"La preposició adequada és 'amb'.": ["La preposición adecuada es «amb».", "The correct preposition is ‘amb’. "]
    ,"És un anglicisme en el sentit de 'duplicar'.": ["Es un anglicismo con el sentido de «duplicar».", "It is an anglicism when used to mean ‘duplicate’. "]
    ,"Referit a una expressió de temps, cal dir __SUGGESTION_1__. ": ["Para referirse a una expresión temporal, debe decirse «{suggestion1}».", "For a time expression, use ‘{suggestion1}’. "]
    ,"¿Volíeu dir \"respecte a\"?": ["¿Querías decir «respecte a»?", "Did you mean ‘respecte a’? "]
    ,"Aquesta construcció no és adequada per a introduir les conseqüències d'una acció. És un calc de l'anglès.": ["Esta construcción no es adecuada para introducir las consecuencias de una acción. Es un calco del inglés.", "This construction is unsuitable for introducing the consequences of an action. It is calqued from English."]
    ,"L'abreviatura de \"recursos humans\" és __SUGGESTION_1__ tant en singular com en plural.": ["La abreviatura de «recursos humanos» es «{suggestion1}», tanto en singular como en plural.", "The abbreviation for ‘human resources’ is ‘{suggestion1}’ in both singular and plural."]
    ,"L'abreviatura de \"relacions públiques\" és __SUGGESTION_1__ tant en singular com en plural.": ["La abreviatura de «relaciones públicas» es «{suggestion1}», tanto en singular como en plural.", "The abbreviation for ‘public relations’ is ‘{suggestion1}’ in both singular and plural."]
    ,"Expressió normativa, però obsoleta. Val més usar-ne una altra.": ["Expresión normativa, pero obsoleta. Es preferible usar otra.", "Normative but obsolete expression. Use another expression instead."]
    ,"L'expressió adequada és \"saber greu\" o \"saber mal\" (causar disgust).": ["La expresión adecuada es «saber greu» o «saber mal» (causar disgusto).", "The correct expression is ‘saber greu’ or ‘saber mal’ (to cause distress)."]
    ,"Els segles s'escriuen amb xifres romanes.": ["Los siglos se escriben con cifras romanas.", "Centuries are written with Roman numerals."]
    ,"És preferible usar una altra construcció.": ["Es preferible usar otra construcción.", "Use a different construction."]
    ,"Falta el pronom 'en' en \"anar-se'n\".": ["Falta el pronombre «en» en «anar-se'n».", "The pronoun ‘en’ is missing in ‘anar-se'n’. "]
    ,"¿Volíeu dir \"\\1\" en lloc de \"\\1\" (del v. 'rentar')?": ["¿Querías decir «\\1» en vez de «\\1» (del verbo «rentar»)?", "Did you mean ‘\\1’ instead of ‘\\1’ (from the verb ‘rentar’)?"]
    ,"¿Volíeu dir \"\\2\" en lloc de \"\\2\" (del v. 'rentar')?": ["¿Querías decir «\\2» en vez de «\\2» (del verbo «rentar»)?", "Did you mean ‘\\2’ instead of ‘\\2’ (from the verb ‘rentar’)?"]
    ,"Referit a una expressió de temps, cal dir __SUGGESTION_1__. ": ["Para referirse a una expresión temporal, debe decirse «{suggestion1}».", "For a time expression, use ‘{suggestion1}’. "]
    ,"Falta el pronom 'en' en \"anar-se'n\", o bé useu \"escapar-se-li\".": ["Falta el pronombre «en» en «anar-se'n»; también puede usarse «escapar-se-li».", "The pronoun ‘en’ is missing in ‘anar-se'n’; alternatively, use ‘escapar-se-li’. "]
    ,"Expressió redundant. Val més fer servir una altra expressió.": ["Expresión redundante. Es preferible usar otra expresión.", "Redundant expression. Use a different expression."]
    ,"En aquest context, és més adequat usar un altre adjectiu.": ["En este contexto, es más adecuado usar otro adjetivo.", "Use a different adjective in this context."]
    ,"Si és nom, usem preferentment la forma __SUGGESTION_1__. ": ["Como sustantivo, se prefiere la forma «{suggestion1}».", "The preferred noun form is ‘{suggestion1}’. "]
    ,"Si és un pronom s'escriu sense accent. Només s'escriu amb accent si és del v. 'saber'.": ["Si es un pronombre, se escribe sin tilde. Solo lleva tilde si es una forma del verbo «saber».", "If it is a pronoun, it has no accent mark. It takes one only as a form of ‘saber’. "]
    ,"Si és un pronom, s'escriu sense accent. \"Sé\" és una forma del verb 'saber'.": ["Si es un pronombre, se escribe sin tilde. «Sé» es una forma del verbo «saber».", "If it is a pronoun, it has no accent mark. ‘Sé’ is a form of ‘saber’. "]
    ,"No es poden combinar pronoms davant i darrere d'aquesta perífrasi verbal. Useu el verb 'caldre'.": ["No se pueden combinar pronombres delante y detrás de esta perífrasis verbal. Usa el verbo «caldre».", "Pronouns cannot be combined before and after this verbal periphrasis. Use ‘caldre’. "]
    ,"Probablement cal usar la conjunció __SUGGESTION_1__ (condicional) i no els pronoms \"s'hi\".": ["Probablemente debe usarse la conjunción «{suggestion1}» (condicional), no los pronombres «s'hi».", "The conjunction ‘{suggestion1}’ (conditional) is probably needed, not the pronouns ‘s'hi’. "]
    ,"Expressió incorrecta en el sentit de __SUGGESTION_1__. A vegades és redundant i es pot eliminar.": ["Expresión incorrecta con el sentido de «{suggestion1}». A veces es redundante y puede eliminarse.", "Incorrect expression when it means ‘{suggestion1}’. It is sometimes redundant and can be omitted."]
    ,"Quan és pronom, no s'accentua.": ["Cuando es un pronombre, no lleva tilde.", "It has no accent mark when used as a pronoun."]
    ,"En aquest context, és preferible escriure __SUGGESTION_1__ en minúscula.": ["En este contexto, es preferible escribir «{suggestion1}» en minúscula.", "In this context, write ‘{suggestion1}’ in lowercase."]
    ,"Si és del verb 'ser', s'ha d'accentuar.": ["Si es una forma del verbo «ser», debe llevar tilde.", "If it is a form of ‘ser’, it takes an accent mark."]
    ,"Ús incorrecte en el sentit de 'esquivar, eludir'.": ["Uso incorrecto con el sentido de «esquivar, eludir».", "Incorrect use when it means ‘to dodge’ or ‘to evade’. "]
    ,"Incorrecte amb el sentit de __SUGGESTION_1__. \"Sosa\" té significats vàlids en química i botànica.": ["Incorrecto con el sentido de «{suggestion1}». «Sosa» tiene significados válidos en química y botánica.", "Incorrect when it means ‘{suggestion1}’. ‘Sosa’ has valid meanings in chemistry and botany."]
    ,"Incorrecte en el sentit de 'anar sovint a un indret'.": ["Incorrecto con el sentido de «ir a menudo a un lugar».", "Incorrect when it means ‘to go somewhere often’. "]
    ,"Pronom incorrecte.": ["Pronombre incorrecto.", "Incorrect pronoun."]
    ,"Si és del verb 'haver', s'escriu __SUGGESTION_1__. ": ["Si es una forma del verbo «haver», se escribe «{suggestion1}».", "If it is a form of ‘haver’, write ‘{suggestion1}’. "]
    ,"En l'abreviatura de 'números' no s'escriu el plural.": ["En la abreviatura de «números» no se marca el plural.", "The abbreviation for ‘números’ does not take a plural marker."]
    ,"Abreviatura de 'número'.": ["Abreviatura de «número».", "Abbreviation for ‘número’. "]
    ,"Com a prefix d'un altre adjectiu, 'super-' s'escriu junt.": ["Como prefijo de otro adjetivo, «super-» se escribe unido.", "As a prefix before another adjective, ‘super-’ is written as one word."]
    ,"Si és nom, usem preferentment la forma __SUGGESTION_1__. ": ["Como sustantivo, se prefiere la forma «{suggestion1}».", "The preferred noun form is ‘{suggestion1}’. "]
    ,"Si és del verb 'haver', s'escriu __SUGGESTION_1__. ": ["Si es una forma del verbo «haver», se escribe «{suggestion1}».", "If it is a form of ‘haver’, write ‘{suggestion1}’. "]
    ,"Si es refereix a un segle, hi falta un espai i un punt.": ["Si se refiere a un siglo, falta un espacio y un punto.", "If it refers to a century, a space and a full stop are missing."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del v. 'obrir')? Correcte si és del v. 'obrar'.": ["¿Querías decir «{suggestion1}» (del verbo «obrir»)? Es correcto si es una forma de «obrar».", "Did you mean ‘{suggestion1}’ (from ‘obrir’)? The form is correct if it comes from ‘obrar’. "]
    ,"Aquesta paraula només és acceptable amb el sentit de 'menjar típic mexicà'.": ["Esta palabra solo es aceptable con el sentido de «comida típica mexicana».", "This word is acceptable only when it means ‘typical Mexican food’. "]
    ,"Davant de locució adverbial cal escriure __SUGGESTION_1__. ": ["Delante de una locución adverbial debe escribirse «{suggestion1}».", "Use ‘{suggestion1}’ before an adverbial phrase."]
    ,"¿Volíeu dir __SUGGESTION_1__ (adverbi)? \"Soles\" és correcte com a adjectiu que concorda amb un nom femení plural.": ["¿Querías decir «{suggestion1}» (adverbio)? «Soles» es correcto como adjetivo que concuerda con un sustantivo femenino plural.", "Did you mean ‘{suggestion1}’ (adverb)? ‘Soles’ is correct as an adjective agreeing with a feminine plural noun."]
    ,"És preferible agrupar les xifres dels telèfons en grups de tres per a millorar la llegibilitat.": ["Para mejorar la legibilidad, es preferible agrupar las cifras de los teléfonos de tres en tres.", "For readability, group telephone number digits in threes."]
    ,"El verb 'témer' no és pronominal. Elimineu el pronom.": ["El verbo «témer» no es pronominal. Elimina el pronombre.", "The verb ‘témer’ is not reflexive; remove the pronoun."]
    ,"Verb inadequat (calc de l'anglès).": ["Verbo inadecuado (calco del inglés).", "Unsuitable verb (calqued from English)."]
    ,"La preposició adequada és 'de'.": ["La preposición adecuada es «de».", "The correct preposition is ‘de’. "]
    ,"Error de concordança. El masculí plural és __SUGGESTION_1__. ": ["Error de concordancia. El masculino plural es «{suggestion1}».", "Agreement error. The masculine plural form is ‘{suggestion1}’. "]
    ,"Si és un pronom s'escriu sense accent. \"Té\" és una forma del verb 'tenir'.": ["Si es un pronombre, se escribe sin tilde. «Té» es una forma del verbo «tenir».", "If it is a pronoun, it has no accent mark. ‘Té’ is a form of ‘tenir’. "]
    ,"¿Volíeu dir __SUGGESTION_1__ (verb 'haver') o __SUGGESTION_2__ (verb 'tenir')? \"Te\" és una beguda o el nom d'una lletra.": ["¿Querías decir «{suggestion1}» (verbo «haver») o «{suggestion2}» (verbo «tenir»)? «Te» es una bebida o el nombre de una letra.", "Did you mean ‘{suggestion1}’ (verb ‘haver’) or ‘{suggestion2}’ (verb ‘tenir’)? ‘Te’ is a drink or a letter name."]
    ,"En aquest context és més apropiat dir __SUGGESTION_1__ en lloc de \"tipus\" (model).": ["En este contexto, es más apropiado decir «{suggestion1}» en vez de «tipus» (modelo).", "In this context, ‘{suggestion1}’ is more appropriate than ‘tipus’ (model)." ]
    ,"Anglicisme innecessari en el sentit de __SUGGESTION_1__. ": ["Anglicismo innecesario con el sentido de «{suggestion1}».", "Unnecessary anglicism when it means ‘{suggestion1}’. "]
    ,"El verb apropiat en aquest context és \"fer\".": ["El verbo apropiado en este contexto es «fer».", "The appropriate verb in this context is ‘fer’. "]
    ,"Expressió segurament incorrecta.": ["Expresión probablemente incorrecta.", "Probably incorrect expression."]
    ,"Incorrecte en el sentit de 'dolor muscular'.": ["Incorrecto con el sentido de «dolor muscular».", "Incorrect when it means ‘muscle pain’. "]
    ,"Paraula col·loquial que val més evitar.": ["Palabra coloquial que es preferible evitar.", "Colloquial word best avoided."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Tope\" és una forma verbal valenciana del v. 'topar'.": ["¿Querías decir «{suggestion1}»? «Tope» es una forma verbal valenciana del verbo «topar».", "Did you mean ‘{suggestion1}’? ‘Tope’ is a Valencian form of ‘topar’. "]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Topes\" és una forma verbal del v. 'topar'.": ["¿Querías decir «{suggestion1}»? «Topes» es una forma verbal de «topar».", "Did you mean ‘{suggestion1}’? ‘Topes’ is a form of ‘topar’. "]
    ,"Quan parlem de torró, és preferible dir __SUGGESTION_1__. ": ["Al hablar de turrón, es preferible decir «{suggestion1}».", "When referring to nougat, ‘{suggestion1}’ is preferable."]
    ,"Construcció incorrecta. Useu el gerundi per a indicar simultaneïtat o \"tot i + infinitiu\" si és una expressió concessiva.": ["Construcción incorrecta. Usa el gerundio para expresar simultaneidad o «tot i + infinitivo» para una concesión.", "Incorrect construction. Use a gerund for simultaneous actions, or ‘tot i + infinitive’ for a concessive meaning."]
    ,"En aquest context, sembla més adequat dir __SUGGESTION_1__. 'Tràfic' té el sentit de comerç (legal o clandestí).": ["En este contexto, parece más adecuado decir «{suggestion1}». «Tràfic» significa comercio (legal o clandestino).", "In this context, ‘{suggestion1}’ is more appropriate. ‘Tràfic’ means trade (legal or illicit)."]
    ,"Amb el sentit de 'arribista' val més fer servir altres expressions.": ["Con el sentido de «arribista», es preferible usar otras expresiones.", "Use other expressions when you mean ‘arribista’. "]
    ,"Possible error de concordança. ¿Volíeu dir __SUGGESTION_1__?": ["Posible error de concordancia. ¿Querías decir «{suggestion1}»?", "Possible agreement error. Did you mean ‘{suggestion1}’? "]
    ,"Probablement cal substituir-ho per __SUGGESTION_1__ o eliminar-ho.": ["Probablemente debe sustituirse por «{suggestion1}» o eliminarse.", "It probably needs to be replaced with ‘{suggestion1}’ or removed."]
    ,"Possible falta de concordança: «un... altre», «una... altra».": ["Posible error de concordancia: «un... altre» debe concordar como «una... altra».", "Possible agreement error: ‘un... altre’ and ‘una... altra’ must agree in gender."]
    ,"Si és nom, s'accentua.": ["Si es un sustantivo, lleva tilde.", "It takes an accent mark when used as a noun."]
    ,"Si el cognom va sense nom, s'escriu amb majúscula.": ["Si el apellido aparece sin el nombre, se escribe con mayúscula.", "Capitalize the surname when it appears without the given name."]
    ,"El temps verbal adequat per a referir-se a una acció que ocorre \\3 és el perfet.": ["El tiempo verbal adecuado para referirse a una acción que ocurre \\3 es el perfecto.", "Use the perfect tense to refer to an action that occurs \\3."]
    ,"El v. 'venir' no és reflexiu.": ["El verbo «venir» no es reflexivo.", "The verb ‘venir’ is not reflexive."]
    ,"¿Volíeu dir __SUGGESTION_1__ (substantiu, plural de 'bé')? \"\\2\" és una forma verbal.": ["¿Querías decir «{suggestion1}» (sustantivo, plural de «bé»)? «\\2» es una forma verbal.", "Did you mean ‘{suggestion1}’ (noun, plural of ‘bé’)? ‘\\2’ is a verb form."]
    ,"Possible confusió. ¿Volíeu dir __SUGGESTION_1__ (gloriejar-se)?": ["Posible confusión. ¿Querías decir «{suggestion1}» (gloriejar-se)?", "Possible confusion. Did you mean ‘{suggestion1}’ (gloriejar-se)? "]
    ,"Paraula desconeguda com a nom propi.": ["Palabra desconocida como nombre propio.", "Unknown as a proper name."]
    ,"Aquest verb és transitiu. Potser cal eliminar la preposició 'a'.": ["Este verbo es transitivo. Quizá haya que eliminar la preposición «a».", "This verb is transitive. The preposition ‘a’ may need to be removed."]
    ,"El verb '\\3' és transitiu. Probablement cal canviar el pronom.": ["El verbo «\\3» es transitivo. Probablemente hay que cambiar el pronombre.", "The verb ‘\\3’ is transitive. The pronoun probably needs to change."]
    ,"Aquest verb no és pronominal. Probablement sobra un pronom o heu de fer servir una altra expressió.": ["Este verbo no es pronominal. Probablemente sobra un pronombre o debe usarse otra expresión.", "This verb is not reflexive. A pronoun may be redundant, or the expression may need rephrasing."]
    ,"Aquest expressió no és pronominal. Hi sobra un pronom.": ["Esta expresión no es pronominal. Sobra un pronombre.", "This expression is not reflexive; a pronoun is redundant."]
    ,"El verb '\\3' no és transitiu. Useu el pronom adequat.": ["El verbo «\\3» no es transitivo. Usa el pronombre adecuado.", "The verb ‘\\3’ is not transitive. Use the appropriate pronoun."]
    ,"\"Sobreviure\" és un verb intransitiu. Probablement hi falta la preposició 'a'.": ["«Sobreviure» es un verbo intransitivo. Probablemente falta la preposición «a».", "‘Sobreviure’ is intransitive. The preposition ‘a’ may be missing."]
    ,"El verb '\\3' no és transitiu en el sentit de 'telefonar'. Useu el pronom adequat.": ["El verbo «\\3» no es transitivo con el sentido de «telefonar». Usa el pronombre adecuado.", "The verb ‘\\3’ is not transitive when it means ‘to telephone’. Use the appropriate pronoun."]
    ,"Aquest verb és pronominal. Probablement hi falta un pronom.": ["Este verbo es pronominal. Probablemente falta un pronombre.", "This verb is reflexive. A pronoun may be missing."]
    ,"Com a fórmula de remissió, cal usar la forma en imperatiu __SUGGESTION_1__. ": ["Como fórmula de remisión, debe usarse el imperativo «{suggestion1}».", "As a cross-reference, use the imperative form ‘{suggestion1}’. "]
    ,"És preferible usar una expressió més directa.": ["Es preferible usar una expresión más directa.", "Use a more direct expression."]
    ,"Possible error de traducció automàtica. ¿Volíeu dir __SUGGESTION_1__?": ["Posible error de traducción automática. ¿Querías decir «{suggestion1}»?", "Possible machine-translation error. Did you mean ‘{suggestion1}’? "]
    ,"Com a pronom personal fort, s'escriu amb accent.": ["Como pronombre personal tónico, se escribe con tilde.", "As a stressed personal pronoun, it takes an accent mark."]
    ,"Per a referir-vos als missatges, escriviu __SUGGESTION_1__; per a l'aplicació, __SUGGESTION_2__. ": ["Para referirte a los mensajes, escribe «{suggestion1}»; para la aplicación, «{suggestion2}».", "For messages, write ‘{suggestion1}’; for the app, write ‘{suggestion2}’. "]
    ,"Per a referir-vos a un missatge, escriviu __SUGGESTION_1__; per a l'aplicació, __SUGGESTION_2__. ": ["Para referirte a un mensaje, escribe «{suggestion1}»; para la aplicación, «{suggestion2}».", "For a message, write ‘{suggestion1}’; for the app, write ‘{suggestion2}’. "]
    ,"Forma secundària no admesa per tots els diccionaris. Existeix com a terme d'heràldica.": ["Forma secundaria que no aceptan todos los diccionarios. Existe como término de heráldica.", "Secondary form not accepted by all dictionaries; it exists as a heraldic term."]
    ,"En el sentit de 'destruir' val més fer servir una altra expressió.": ["Con el sentido de «destruir», es preferible usar otra expresión.", "Use a different expression when it means ‘destroy’. "]
    ,"L'expressió adequada és 'acabar la paciència'.": ["La expresión adecuada es «acabar la paciència».", "The correct expression is ‘acabar la paciència’. "]
    ,"Hi falta un gerundi.": ["Falta un gerundio.", "A gerund is missing."]
    ,"Accentuació abandonada.": ["Acentuación abandonada.", "Obsolete accentuation."]
    ,"Si és un adjectiu, s'escriu amb accent. Si és un verb, cal escriure 'tant'.": ["Si es un adjetivo, se escribe con tilde. Si es un verbo, debe escribirse «tant».", "If it is an adjective, it takes an accent mark. If it is a verb, write ‘tant’. "]
    ,"Caràcter incorrecte. Useu un apòstrof.": ["Carácter incorrecto. Usa un apóstrofo.", "Incorrect character. Use an apostrophe."]
    ,"Incorrecte en el sentit de __SUGGESTION_1__. 'Acera' pot ser del v. 'acerar'.": ["Incorrecto con el sentido de «{suggestion1}». «Acera» puede ser una forma del verbo «acerar».", "Incorrect when it means ‘{suggestion1}’. ‘Acera’ may be a form of ‘acerar’. "]
    ,"La preposició 'a' és sobrera.": ["La preposición «a» sobra.", "The preposition ‘a’ is unnecessary."]
    ,"'Acordes' no és adjectiu. Correcte si és del v. 'acordar'.": ["«Acordes» no es un adjetivo. Es correcto si es una forma del verbo «acordar».", "‘Acordes’ is not an adjective. It is correct as a form of ‘acordar’. "]
    ,"'Acorde' no és adjectiu. Correcte si és del v. 'acordar'.": ["«Acorde» no es un adjetivo. Es correcto si es una forma del verbo «acordar».", "‘Acorde’ is not an adjective. It is correct as a form of ‘acordar’. "]
    ,"Expressió incorrecta quan vol dir __SUGGESTION_1__. ": ["Expresión incorrecta cuando significa «{suggestion1}».", "Incorrect expression when it means ‘{suggestion1}’. "]
    ,"Amb el sentit de 'abans de Crist' s'escriu __SUGGESTION_1__. ": ["Con el sentido de «antes de Cristo», se escribe «{suggestion1}».", "When it means ‘before Christ’, write ‘{suggestion1}’. "]
    ,"Amb el sentit de 'després de Crist' s'escriu __SUGGESTION_1__. ": ["Con el sentido de «después de Cristo», se escribe «{suggestion1}».", "When it means ‘after Christ’, write ‘{suggestion1}’. "]
    ,"Pel context (\\1), potser volíeu dir \"addicció\" (dependència) en comptes de \"addició\" (suma, afegiment).": ["Por el contexto (\\1), quizá querías decir «addicció» (dependencia) en vez de «addició» (suma, adición).", "From the context (‘\\1’), you may mean ‘addicció’ (dependence) rather than ‘addició’ (addition)."]
    ,"Pel context (\"\\2\"), sembla més adequada la paraula __SUGGESTION_1__ (efecte, impacte).": ["Por el contexto («\\2»), parece más adecuada la palabra «{suggestion1}» (efecto, impacto).", "From the context (‘\\2’), ‘{suggestion1}’ (effect, impact) seems more appropriate."]
    ,"¿Potser volíeu dir __SUGGESTION_1__ (malaltia)? \"Afectació\" és adequat en el sentit de 'efecte, impacte'.": ["¿Quizá querías decir «{suggestion1}» (enfermedad)? «Afectació» es adecuado con el sentido de «efecto, impacto».", "Did you mean ‘{suggestion1}’ (illness)? ‘Afectació’ is correct when it means ‘effect’ or ‘impact’. "]
    ,"Pel context (\"\\2\"), sembla més adequada la paraula __SUGGESTION_1__ (malaltia). \"Afectació\" té el sentit de 'efecte, impacte'.": ["Por el contexto («\\2»), parece más adecuada la palabra «{suggestion1}» (enfermedad). «Afectació» significa «efecto, impacto».", "From the context (‘\\2’), ‘{suggestion1}’ (illness) seems more appropriate. ‘Afectació’ means ‘effect’ or ‘impact’. "]
    ,"¿Volíeu dir __SUGGESTION_1__ (d'un peix) o __SUGGESTION_2__? \"Agalla\" és sinònim de \"gala, cecidi\" (botànica).": ["¿Querías decir «{suggestion1}» (de un pez) o «{suggestion2}»? «Agalla» es sinónimo de «gala, cecidi» (botánica).", "Did you mean ‘{suggestion1}’ (a fish’s gill) or ‘{suggestion2}’? ‘Agalla’ means a plant gall in botany."]
    ,"Expressió incorrecta amb el sentit de 'procurar-se, arreplegar'.": ["Expresión incorrecta con el sentido de «procurarse, recoger».", "Incorrect expression when it means ‘to obtain’ or ‘to gather’. "]
    ,"Probablement hi falta una coma. O bé reviseu la concordança de «\\1» amb els noms precedents.": ["Probablemente falta una coma. También puede que «\\1» no concuerde con los sustantivos anteriores.", "A comma may be missing, or ‘\\1’ may not agree with the preceding nouns."]
    ,"Reviseu la concordança de «\\1» amb els noms precedents o bé reviseu la puntuació.": ["Revisa la concordancia de «\\1» con los sustantivos anteriores o la puntuación.", "Check whether ‘\\1’ agrees with the preceding nouns, or review the punctuation."]
    ,"Paraula no recollida per la major part dels diccionaris.": ["Palabra que no recogen la mayoría de los diccionarios.", "Word not listed in most dictionaries."]
    ,"Paraula admesa només per alguns diccionaris (DNV). Alguns llibres d'estil recomanen evitar-la.": ["Palabra admitida solo por algunos diccionarios (DNV). Algunos manuales de estilo recomiendan evitarla.", "Word accepted only by some dictionaries (DNV). Some style guides recommend avoiding it."]
    ,"Forma col·loquial de __SUGGESTION_1__. ": ["Forma coloquial de «{suggestion1}».", "Colloquial form of ‘{suggestion1}’. "]
    ,"Expressió redundant. Val més usar una altra expressió.": ["Expresión redundante. Es preferible usar otra expresión.", "Redundant expression. Use a different expression."]
    ,"En sentit figurat, val més usar una altra expressió.": ["En sentido figurado, es preferible usar otra expresión.", "Use a different expression in the figurative sense."]
    ,"Com a nom d'una institució, s'escriu amb majúscula.": ["Como nombre de una institución, se escribe con mayúscula.", "Capitalize it when it is the name of an institution."]
    ,"¿Volíeu dir __SUGGESTION_1__ (nom de Déu en l'islam)? Correcte en altres sentits.": ["¿Querías decir «{suggestion1}» (nombre de Dios en el islam)? Es correcto con otros sentidos.", "Did you mean ‘{suggestion1}’ (the name of God in Islam)? It is correct with other meanings."]
    ,"Ús inapropiat en el sentit de __SUGGESTION_1__. ": ["Uso inadecuado con el sentido de «{suggestion1}».", "Unsuitable use when it means ‘{suggestion1}’. "]
    ,"En aquest context cal dir __SUGGESTION_1__ o __SUGGESTION_2__. ": ["En este contexto debe decirse «{suggestion1}» o «{suggestion2}».", "In this context, use ‘{suggestion1}’ or ‘{suggestion2}’. "]
    ,"Paraula admesa només en alguns diccionaris, que val més evitar en llenguatge formal.": ["Palabra admitida solo por algunos diccionarios y que es preferible evitar en un registro formal.", "Word accepted by only some dictionaries and best avoided in formal writing."]
    ,"¿Volíeu dir __SUGGESTION_1__ (adjectiu)? \"Alegra\" és una forma del v. 'alegrar'.": ["¿Querías decir «{suggestion1}» (adjetivo)? «Alegra» es una forma del verbo «alegrar».", "Did you mean ‘{suggestion1}’ (adjective)? ‘Alegra’ is a form of ‘alegrar’. "]
    ,"Combinació agramatical. Useu el pronom \"ningú\" (neutre) o bé els determinants \"ningun, ninguna\" seguits cada un d'un nom.": ["Combinación agramatical. Usa el pronombre «ningú» (neutro) o los determinantes «ningun, ninguna», cada uno seguido de un sustantivo.", "Ungrammatical combination. Use the pronoun ‘ningú’ (neutral), or the determiners ‘ningun, ninguna’, each followed by a noun."]
    ,"Combinació agramatical. Useu el pronom \"algú\" (neutre) o bé els determinants \"algun, alguna\" cada un seguits d'un nom.": ["Combinación agramatical. Usa el pronombre «algú» (neutro) o los determinantes «algun, alguna», cada uno seguido de un sustantivo.", "Ungrammatical combination. Use the pronoun ‘algú’ (neutral), or the determiners ‘algun, alguna’, each followed by a noun."]
    ,"¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__? \"Alienament\" és correcte si és un adverbi derivat de l'adj. 'aliè'.": ["¿Querías decir «{suggestion1}» o «{suggestion2}»? «Alienament» es correcto si es un adverbio derivado del adjetivo «aliè».", "Did you mean ‘{suggestion1}’ or ‘{suggestion2}’? ‘Alienament’ is correct as an adverb derived from ‘aliè’. "]
    ,"Si és un nom, s'escriu amb accent. \"Alies\" és una forma del verb 'aliar'.": ["Si es un sustantivo, lleva tilde. «Alies» es una forma del verbo «aliar».", "As a noun, it takes an accent mark. ‘Alies’ is a form of ‘aliar’. "]
    ,"És un calc de l'anglès en el sentit de __SUGGESTION_1__. ": ["Es un calco del inglés con el sentido de «{suggestion1}».", "It is calqued from English when it means ‘{suggestion1}’. "]
    ,"Amb valor abstractiu val més usar una altra construcció. Només és correcte si equival a \"aquella cosa \\2 \\3\".": ["Con sentido abstracto, es preferible usar otra construcción. Solo es correcto si equivale a «aquella cosa \\2 \\3».", "Use a different construction for an abstract meaning. It is correct only if it means ‘that thing \\2 \\3’. "]
    ,"Cal escriure __SUGGESTION_1__ (equivalent a 'aquella cosa \\2 la qual').": ["Debe escribirse «{suggestion1}» (equivalente a «aquella cosa \\2 la qual»).", "Write ‘{suggestion1}’ (equivalent to ‘that thing \\2 la qual’). "]
    ,"Cal escriure __SUGGESTION_1__ (equivalent a 'la cosa per la qual').": ["Debe escribirse «{suggestion1}» (equivalente a «la cosa por la cual»).", "Write ‘{suggestion1}’ (equivalent to ‘the thing for which’). "]
    ,"¿Volíeu dir __SUGGESTION_1__? Alós sols és correcte referit a Alós d'Isil (Alt Àneu, Pallars Sobirà).": ["¿Querías decir «{suggestion1}»? «Alós» solo es correcto para referirse a Alós d'Isil (Alt Àneu, Pallars Sobirà).", "Did you mean ‘{suggestion1}’? ‘Alós’ is correct only for Alós d'Isil (Alt Àneu, Pallars Sobirà)."]
    ,"¿Volíeu dir __SUGGESTION_1__ (noi, xicot)? \"Alot\" és una ala en anatomia animal.": ["¿Querías decir «{suggestion1}» (chico, muchacho)? «Alot» es un ala en anatomía animal.", "Did you mean ‘{suggestion1}’ (boy, lad)? ‘Alot’ is an animal anatomy term for a wing."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Alquilar\" és correcte com a terme de química.": ["¿Querías decir «{suggestion1}»? «Alquilar» es correcto como término de química.", "Did you mean ‘{suggestion1}’? ‘Alquilar’ is correct as a chemistry term."]
    ,"L'expressió adequada és \"estar en els llimbs\".": ["La expresión adecuada es «estar en els llimbs».", "The correct expression is ‘estar en els llimbs’. "]
    ,"Incorrecte si equival a __SUGGESTION_1__. Referit a l'edat d'una persona, també es pot dir __SUGGESTION_2__. ": ["Incorrecto si equivale a «{suggestion1}». Para referirse a la edad de una persona, también puede decirse «{suggestion2}».", "Incorrect if it means ‘{suggestion1}’. For a person's age, ‘{suggestion2}’ is also possible."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Altell\" és menys habitual (\"petita elevació\").": ["¿Querías decir «{suggestion1}»? «Altell» es menos habitual («pequeña elevación»).", "Did you mean ‘{suggestion1}’? ‘Altell’ is less common (‘small elevation’). "]
    ,"L'escriptura preferible és __SUGGESTION_1__ (invariable).": ["La grafía preferible es «{suggestion1}» (invariable).", "The preferred spelling is ‘{suggestion1}’ (invariable)."]
    ,"Potser hi manca una coma. ¿O volíeu dir \"altre\" davant d'un nom masculí?": ["Quizá falta una coma. ¿O querías decir «altre» delante de un sustantivo masculino?", "A comma may be missing. Or did you mean ‘altre’ before a masculine noun?"]
    ,"¿Volíeu dir __SUGGESTION_1__ (davant d'un nom masculí? O bé hi manca una coma": ["¿Querías decir «{suggestion1}» delante de un sustantivo masculino? También puede faltar una coma.", "Did you mean ‘{suggestion1}’ before a masculine noun? A comma may also be missing."]
    ,"S'escriu sense guionets.": ["Se escribe sin guiones.", "Write it without hyphens."]
    ,"El plural de \"alto el foc\" és __SUGGESTION_1__. ": ["El plural de «alto el foc» es «{suggestion1}».", "The plural of ‘alto el foc’ is ‘{suggestion1}’. "]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Alumant\" és el gerundi del verb 'alumar'.": ["¿Querías decir «{suggestion1}»? «Alumant» es el gerundio del verbo «alumar».", "Did you mean ‘{suggestion1}’? ‘Alumant’ is the gerund of ‘alumar’. "]
    ,"\"Electorat\" és un nom col·lectiu. No és correcte en aquest context.": ["«Electorat» es un sustantivo colectivo. No es correcto en este contexto.", "‘Electorat’ is a collective noun. It is unsuitable in this context."]
    ,"\"Estudiantat\" és un nom col·lectiu. No pareix adequat en aquest context.": ["«Estudiantat» es un sustantivo colectivo. No parece adecuado en este contexto.", "‘Estudiantat’ is a collective noun. It does not seem appropriate here."]
    ,"Repetició probablement innecessària.": ["Repetición probablemente innecesaria.", "Probably unnecessary repetition."]
    ,"Forma preferida actualment. S'escriu sense article afegit.": ["Forma preferida actualmente. Se escribe sin añadir artículo.", "Currently preferred form. Do not add an article."]
    ,"Expressió incorrecta amb el sentit de __SUGGESTION_1__. ": ["Expresión incorrecta con el sentido de «{suggestion1}».", "Incorrect expression when it means ‘{suggestion1}’. "]
    ,"Expressió incorrecta si vol dir __SUGGESTION_1__. ": ["Expresión incorrecta si significa «{suggestion1}».", "Incorrect expression if it means ‘{suggestion1}’. "]
    ,"Cal dir __SUGGESTION_1__ o __SUGGESTION_2__. ": ["Debe decirse «{suggestion1}» o «{suggestion2}».", "Use ‘{suggestion1}’ or ‘{suggestion2}’. "]
    ,"Correcte en el sentit de 'manyós'. Incorrecte en altres sentits.": ["Correcto con el sentido de «mañoso». Incorrecto con otros sentidos.", "Correct when it means ‘dexterous’. Incorrect with other meanings."]
    ,"¿Volíeu dir __SUGGESTION_1__? Correcte si és del v. 'amblar'.": ["¿Querías decir «{suggestion1}»? Es correcto si es una forma del verbo «amblar».", "Did you mean ‘{suggestion1}’? It is correct if it is a form of ‘amblar’. "]
    ,"La preposició 'de' és innecessària.": ["La preposición «de» es innecesaria.", "The preposition ‘de’ is unnecessary."]
    ,"¿Volíeu dir \"em\" (a mi)?": ["¿Querías decir «em» (a mí)?", "Did you mean ‘em’ (to me)? "]
    ,"La locució adequada és __SUGGESTION_1__. ": ["La locución adecuada es «{suggestion1}».", "The correct expression is ‘{suggestion1}’. "]
    ,"L'ordre preferible, més natural, d'aquesta expressió és un altre.": ["El orden preferible y más natural de esta expresión es otro.", "A different word order is preferable and more natural here."]
    ,"Normalment és preferible un ordre diferent: \"amb ... \\2 sense\".": ["Normalmente es preferible otro orden: «amb ... \\2 sense».", "A different order is usually preferable: ‘amb ... \\2 sense’. "]
    ,"Probable redundància.": ["Probable redundancia.", "Probable redundancy."]
    ,"Construcció probablement incorrecta. Correcta si vol dir 'amb la condició que'.": ["Construcción probablemente incorrecta. Es correcta si significa «con la condición de que».", "Probably incorrect construction. It is correct when it means ‘on condition that’. "]
    ,"Incorrecte si equival a __SUGGESTION_1__. Correcte en altres casos.": ["Incorrecto si equivale a «{suggestion1}». Es correcto en otros casos.", "Incorrect if it means ‘{suggestion1}’. It is correct in other cases."]
    ,"Cal dir __SUGGESTION_1__ quan significa \"pensant en\".": ["Debe decirse «{suggestion1}» cuando significa «pensando en».", "Use ‘{suggestion1}’ when it means ‘thinking about’. "]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Amitat\" és un terme d'antropologia.": ["¿Querías decir «{suggestion1}»? «Amitat» es un término de antropología.", "Did you mean ‘{suggestion1}’? ‘Amitat’ is an anthropology term."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Ami\" pot ser una forma del verb 'amar'.": ["¿Querías decir «{suggestion1}»? «Ami» puede ser una forma del verbo «amar».", "Did you mean ‘{suggestion1}’? ‘Ami’ may be a form of ‘amar’. "]
    ,"En femení és __SUGGESTION_1__. ": ["En femenino es «{suggestion1}».", "The feminine form is ‘{suggestion1}’. "]
    ,"Forma secundària, admesa només en alguns diccionaris.": ["Forma secundaria, admitida solo en algunos diccionarios.", "Secondary form accepted by only some dictionaries."]
    ,"Useu una preposició per a evitar el llenguatge telegràfic.": ["Usa una preposición para evitar el lenguaje telegráfico.", "Use a preposition to avoid telegraphic wording."]
    ,"Error de concordança. \"\\1\" és femení singular i \"\\1\" és femení plural.": ["Error de concordancia. «\\1» es femenino singular y «\\1» es femenino plural.", "Agreement error. ‘\\1’ is feminine singular, while ‘\\1’ is feminine plural."]
    ,"\"Anàlisis\" és femení plural.": ["«Anàlisis» es femenino plural.", "‘Anàlisis’ is feminine plural."]
    ,"\"Anàlisi\" és femení singular i \"anàlisis\" és femení plural.": ["«Anàlisi» es femenino singular y «anàlisis» es femenino plural.", "‘Anàlisi’ is feminine singular and ‘anàlisis’ is feminine plural."]
    ,"Anglicisme. Considereu una expressió alternativa.": ["Anglicismo. Considera usar otra expresión.", "Anglicism. Consider an alternative expression."]
    ,"Si no indica moviment, val més fer servir una altra expressió.": ["Si no indica movimiento, es preferible usar otra expresión.", "If it does not indicate movement, use a different expression."]
    ,"Si no indica moviment, val més fer servir una altra forma verbal.": ["Si no indica movimiento, es preferible usar otra forma verbal.", "If it does not indicate movement, use a different verb form."]
    ,"Potser hi falta un gerundi o un participi.": ["Quizá falta un gerundio o un participio.", "A gerund or participle may be missing."]
    ,"Pronoms febles inadequats.": ["Pronombres débiles inadecuados.", "Inappropriate weak pronouns."]
    ,"El pronom 'en' és sobrer. El pronom reflexiu correspon a '\\5-se', no a '\\3-se'n'.": ["El pronombre «en» sobra. El pronombre reflexivo corresponde a «\\5-se», no a «\\3-se'n».", "The pronoun ‘en’ is redundant. The reflexive pronoun should be ‘\\5-se’, not ‘\\3-se'n’. "]
    ,"El pronom 'en' és sobrer. El pronom reflexiu correspon a '\\7-se', no a '\\5-se'n'.": ["El pronombre «en» sobra. El pronombre reflexivo corresponde a «\\7-se», no a «\\5-se'n».", "The pronoun ‘en’ is redundant. The reflexive pronoun should be ‘\\7-se’, not ‘\\5-se'n’. "]
    ,"El pronom 'en' és sobrer. El pronom reflexiu correspon a '\\5-se', no a '\\1-se'n'.": ["El pronombre «en» sobra. El pronombre reflexivo corresponde a «\\5-se», no a «\\1-se'n».", "The pronoun ‘en’ is redundant. The reflexive pronoun should be ‘\\5-se’, not ‘\\1-se'n’. "]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Ana\" és correcte si és un nom en castellà.": ["¿Querías decir «{suggestion1}»? «Ana» es correcto si se trata de un nombre en castellano.", "Did you mean ‘{suggestion1}’? ‘Ana’ is correct if it is a Spanish name."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Santa Ana\" és la forma en castellà, que correspon al nom de diverses ciutats.": ["¿Querías decir «{suggestion1}»? «Santa Ana» es la forma castellana, usada como nombre de varias ciudades.", "Did you mean ‘{suggestion1}’? ‘Santa Ana’ is the Spanish form used for several city names."]
    ,"¿Volíeu dir __SUGGESTION_1__ (terme de construcció)? Correcte si voleu dir \"manera de caminar\".": ["¿Querías decir «{suggestion1}» (término de construcción)? Es correcto si quieres decir «manera de caminar».", "Did you mean ‘{suggestion1}’ (a construction term)? It is correct if you mean ‘way of walking’. "]
    ,"Per a referir-nos al continent situat al pol sud, diem __SUGGESTION_1__. \"Antàrtic\" és l'adjectiu corresponent.": ["Para referirse al continente situado en el polo sur, se dice «{suggestion1}». «Antàrtic» es el adjetivo correspondiente.", "The continent at the South Pole is ‘{suggestion1}’. ‘Antàrtic’ is the corresponding adjective."]
    ,"¿Volíeu dir __SUGGESTION_1__? Una \"anta\" és un tipus de pilar.": ["¿Querías decir «{suggestion1}»? Una «anta» es un tipo de pilar.", "Did you mean ‘{suggestion1}’? An ‘anta’ is a type of pillar."]
    ,"¿Volíeu dir __SUGGESTION_1__? Correcte si és del v. 'anticipar' (forma balear).": ["¿Querías decir «{suggestion1}»? Es correcto si es una forma balear del verbo «anticipar».", "Did you mean ‘{suggestion1}’? It is correct as a Balearic form of ‘anticipar’. "]
    ,"Els números de pàgina o de codi postal s'escriuen sense punt.": ["Los números de página o de código postal se escriben sin punto.", "Page and postal-code numbers are written without a full stop."]
    ,"Els números de pàgina s'escriuen sense punt.": ["Los números de página se escriben sin punto.", "Page numbers are written without a full stop."]
    ,"Sembla que hi falta un espai.": ["Parece que falta un espacio.", "A space seems to be missing."]
    ,"L'expressió adequada per a referir-se al primer dia de l'any és \"Cap d'Any\".": ["La expresión adecuada para referirse al primer día del año es «Cap d'Any».", "The correct expression for the first day of the year is ‘Cap d'Any’. "]
    ,"L'expressió adequada per a referir-se al primer dia de l'any és __SUGGESTION_1__. ": ["La expresión adecuada para referirse al primer día del año es «{suggestion1}».", "The correct expression for the first day of the year is ‘{suggestion1}’. "]
    ,"¿Volíeu dir __SUGGESTION_1__ (locució adverbial)? \"Apenes\" pot ser una forma del v. 'apenar'.": ["¿Querías decir «{suggestion1}» (locución adverbial)? «Apenes» puede ser una forma del verbo «apenar».", "Did you mean ‘{suggestion1}’ (adverbial phrase)? ‘Apenes’ may be a form of ‘apenar’. "]
    ,"En la major part dels sentits, cal dir __SUGGESTION_1__. \"Apertura\" és correcte amb el sentit de 'liberalització política o ideològica'.": ["En la mayoría de los sentidos debe decirse «{suggestion1}». «Apertura» es correcto con el sentido de «liberalización política o ideológica».", "In most senses, use ‘{suggestion1}’. ‘Apertura’ is correct when it means political or ideological liberalization."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Apetició\" existeix com a nom femení, però és d'ús rar.": ["¿Querías decir «{suggestion1}»? «Apetició» existe como sustantivo femenino, pero es poco frecuente.", "Did you mean ‘{suggestion1}’? ‘Apetició’ exists as a feminine noun, but is rare."]
    ,"Apòstrof repetit.": ["Apóstrofo repetido.", "Repeated apostrophe."]
    ,"Com a verb pronominal, és preferible usar el verb 'afanyar-se'.": ["Como verbo pronominal, es preferible usar «afanyar-se».", "As a reflexive verb, ‘afanyar-se’ is preferable."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Apressa\" és una forma del verb 'apressar'.": ["¿Querías decir «{suggestion1}»? «Apressa» es una forma del verbo «apressar».", "Did you mean ‘{suggestion1}’? ‘Apressa’ is a form of ‘apressar’. "]
    ,"¿Volíeu dir __SUGGESTION_1__ (locució)? Un \"apropòsit\" (escrit junt) és una peça teatral.": ["¿Querías decir «{suggestion1}» (locución)? Un «apropòsit» (en una palabra) es una pieza teatral.", "Did you mean ‘{suggestion1}’ (phrase)? An ‘apropòsit’ (one word) is a theatrical piece."]
    ,"És preferible usar la forma __SUGGESTION_1__. ": ["Es preferible usar la forma «{suggestion1}».", "Prefer the form ‘{suggestion1}’. "]
    ,"Possible confusió. \"Aquet\" existeix com a terme de zoologia.": ["Posible confusión. «Aquet» existe como término de zoología.", "Possible confusion. ‘Aquet’ exists as a zoological term."]
    ,"¿Volíeu dir __SUGGESTION_1__ (de la natura de l'aigua, abundant en aigua)? \"Aquo\" és un terme especialitzat de química.": ["¿Querías decir «{suggestion1}» (de la naturaleza del agua, abundante en agua)? «Aquo» es un término especializado de química.", "Did you mean ‘{suggestion1}’ (water-related, containing much water)? ‘Aquo’ is a specialized chemistry term."]
    ,"Forma secundària (castellanisme) per __SUGGESTION_1__. \"Arrastrar\" és un terme usat en jocs de cartes.": ["Forma secundaria (calco del castellano) por «{suggestion1}». «Arrastrar» es un término usado en juegos de cartas.", "Secondary form (Spanish calque) for ‘{suggestion1}’. ‘Arrastrar’ is a term used in card games."]
    ,"Expressió només admesa per alguns diccionaris.": ["Expresión admitida solo por algunos diccionarios.", "Expression accepted by only some dictionaries."]
    ,"L'expressió adequada és __SUGGESTION_1__ o __SUGGESTION_2__. ": ["Las expresiones adecuadas son «{suggestion1}» o «{suggestion2}».", "The correct expressions are ‘{suggestion1}’ or ‘{suggestion2}’. "]
    ,"Correcte en el sentit de 'abocar arrop al vi'. Incorrecte en altres sentits.": ["Correcto con el sentido de «añadir arrope al vino». Incorrecto con otros sentidos.", "Correct when it means ‘to add grape syrup to wine’. Incorrect with other meanings."]
    ,"¿Volíeu dir __SUGGESTION_1__ (camp d'arròs)? \"Arrosar\" vol dir 'arruixar lleugerament'.": ["¿Querías decir «{suggestion1}» (campo de arroz)? «Arrosar» significa «rociar ligeramente».", "Did you mean ‘{suggestion1}’ (rice field)? ‘Arrosar’ means ‘to sprinkle lightly’. "]
    ,"\"Seminal\" és un terme de biologia. En aquest context és probablement un anglicisme evitable.": ["«Seminal» es un término de biología. En este contexto probablemente es un anglicismo evitable.", "‘Seminal’ is a biology term. In this context it is probably an avoidable anglicism."]
    ,"¿Volíeu dir __SUGGESTION_1__ (acta de diputat o seient)? \"Ascó\" té altres sentits més inusuals.": ["¿Querías decir «{suggestion1}» (acta de diputado o escaño)? «Ascó» tiene otros sentidos menos habituales.", "Did you mean ‘{suggestion1}’ (a parliamentary record or seat)? ‘Ascó’ has other, less common meanings."]
    ,"És més apropiat dir __SUGGESTION_1__. ": ["Es más apropiado decir «{suggestion1}».", "It is more appropriate to say ‘{suggestion1}’. "]
    ,"Hi falta una apòstrof.": ["Falta un apóstrofo.", "An apostrophe is missing."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Assentar\" és correcte en altres sentits.": ["¿Querías decir «{suggestion1}»? «Assentar» es correcto con otros sentidos.", "Did you mean ‘{suggestion1}’? ‘Assentar’ is correct with other meanings."]
    ,"Cal escriure __SUGGESTION_1__ o __SUGGESTION_2__. ": ["Debe escribirse «{suggestion1}» o «{suggestion2}».", "Write ‘{suggestion1}’ or ‘{suggestion2}’. "]
    ,"Si és un nom, cal escriure __SUGGESTION_1__. \"Atalaia\" és una forma del verb 'atalaiar'.": ["Si es un sustantivo, debe escribirse «{suggestion1}». «Atalaia» es una forma del verbo «atalaiar».", "As a noun, write ‘{suggestion1}’. ‘Atalaia’ is a form of ‘atalaiar’. "]
    ,"Si és un nom, cal escriure __SUGGESTION_1__. \"Atalaies\" és una forma del verb 'atalaiar'.": ["Si es un sustantivo, debe escribirse «{suggestion1}». «Atalaies» es una forma del verbo «atalaiar».", "As a noun, write ‘{suggestion1}’. ‘Atalaies’ is a form of ‘atalaiar’. "]
    ,"Useu la forma adequada del v. 'atenir'.": ["Usa la forma adecuada del verbo «atenir».", "Use the correct form of ‘atenir’. "]
    ,"Useu el v. 'atenir-se' en comptes de 'atendre'.": ["Usa el verbo «atenir-se» en vez de «atendre».", "Use ‘atenir-se’ instead of ‘atendre’. "]
    ,"¿Volíeu dir __SUGGESTION_1__ (del verb 'atenir-se')? El verb \"atendre\" és transitiu i s'escriu sense la preposició 'a'.": ["¿Querías decir «{suggestion1}» (del verbo «atenir-se»)? «Atendre» es transitivo y se escribe sin la preposición «a».", "Did you mean ‘{suggestion1}’ (from ‘atenir-se’)? ‘Atendre’ is transitive and takes no preposition ‘a’. "]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Atènyer\" vol dir 'aconseguir, assolir'.": ["¿Querías decir «{suggestion1}»? «Atènyer» significa «conseguir, alcanzar».", "Did you mean ‘{suggestion1}’? ‘Atènyer’ means ‘to achieve’ or ‘to attain’. "]
    ,"¿Volíeu dir __SUGGESTION_1__ (que causa terror)? Correcte en altres sentits.": ["¿Querías decir «{suggestion1}» (que causa terror)? Es correcto con otros sentidos.", "Did you mean ‘{suggestion1}’ (causing terror)? It is correct with other meanings."]
    ,"¿Volíeu dir __SUGGESTION_1__ (que té terror)? Correcte en altres sentits.": ["¿Querías decir «{suggestion1}» (que siente terror)? Es correcto con otros sentidos.", "Did you mean ‘{suggestion1}’ (feeling terror)? It is correct with other meanings."]
    ,"¿Volíeu dir \"aterrir\" (infondre terror)? Correcte en altres sentits.": ["¿Querías decir «aterrir» (infundir terror)? Es correcto con otros sentidos.", "Did you mean ‘aterrir’ (to instil terror)? It is correct with other meanings."]
    ,"Forma no admesa en tots els diccionaris.": ["Forma que no admiten todos los diccionarios.", "Form not accepted by all dictionaries."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"\\1\" existeix com a participi del v. 'atonir'.": ["¿Querías decir «{suggestion1}»? «\\1» existe como participio del verbo «atonir».", "Did you mean ‘{suggestion1}’? ‘\\1’ exists as a participle of ‘atonir’. "]
    ,"Val més fer servir l'expressió __SUGGESTION_1__. ": ["Es preferible usar la expresión «{suggestion1}».", "Prefer the expression ‘{suggestion1}’. "]
    ,"Com a adjectiu, val més usar __SUGGESTION_1__. ": ["Como adjetivo, es preferible usar «{suggestion1}».", "As an adjective, use ‘{suggestion1}’. "]
    ,"El prefix 'auto-' és redundant amb aquest verb.": ["El prefijo «auto-» es redundante con este verbo.", "The prefix ‘auto-’ is redundant with this verb."]
    ,"Verb mal construït.": ["Verbo mal construido.", "Incorrectly formed verb."]
    ,"Expressió inorrecta.": ["Expresión incorrecta.", "Incorrect expression."]
    ,"¿Volíeu dir \"avantatge\" (nom masculí)? \"Avantatja\" és una forma del verb 'avantatjar'.": ["¿Querías decir «avantatge» (sustantivo masculino)? «Avantatja» es una forma del verbo «avantatjar».", "Did you mean ‘avantatge’ (masculine noun)? ‘Avantatja’ is a form of ‘avantatjar’. "]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Avarca\" és un tipus de calçat.": ["¿Querías decir «{suggestion1}»? «Avarca» es un tipo de calzado.", "Did you mean ‘{suggestion1}’? An ‘avarca’ is a type of footwear."]
    ,"Verb incorrecte en el sentit de 'acostar-se'.": ["Verbo incorrecto con el sentido de «acercarse».", "Incorrect verb when it means ‘to approach’. "]
    ,"¿Volíeu dir __SUGGESTION_1__? Correcte com a variant de __SUGGESTION_2__ (bèstia de càrrega) o impost andorrà.": ["¿Querías decir «{suggestion1}»? Es correcto como variante de «{suggestion2}» (animal de carga) o como impuesto andorrano.", "Did you mean ‘{suggestion1}’? It is correct as a variant of ‘{suggestion2}’ (beast of burden) or as an Andorran tax."]
    ,"Impropi de registres formals.": ["Inadecuado en registros formales.", "Unsuitable for formal registers."]
    ,"¿Volíeu dir __SUGGESTION_1__ ? \"Avocar\" és correcte en altres sentits menys habituals (en dret).": ["¿Querías decir «{suggestion1}»? «Avocar» es correcto con otros sentidos menos habituales (en derecho).", "Did you mean ‘{suggestion1}’? ‘Avocar’ is correct with other, less common meanings in law."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"A amagades\" pareix un calc del castellà.": ["¿Querías decir «{suggestion1}»? «A amagades» parece un calco del castellano.", "Did you mean ‘{suggestion1}’? ‘A amagades’ seems calqued from Spanish."]
    ,"Cal dir __SUGGESTION_1__": ["Debe decirse «{suggestion1}».", "Use ‘{suggestion1}’. "]
    ,"Expressió incorrecta en el sentit de __SUGGESTION_1__. \"Col·lació\" s'usa en expressions com ara 'portar a col·lació'.": ["Expresión incorrecta con el sentido de «{suggestion1}». «Col·lació» se usa en expresiones como «portar a col·lació».", "Incorrect expression when it means ‘{suggestion1}’. ‘Col·lació’ is used in expressions such as ‘portar a col·lació’. "]
    ,"Cal dir __SUGGESTION_1__.": ["Debe decirse «{suggestion1}».", "Use ‘{suggestion1}’. "]
    ,"Cal dir __SUGGESTION_1__ o __SUGGESTION_2__ (referit a un document).": ["Con referencia a un documento, debe decirse «{suggestion1}» o «{suggestion2}».", "For a document, use ‘{suggestion1}’ or ‘{suggestion2}’. "]
    ,"Ordre inusual.": ["Orden inusual.", "Unusual word order."]
    ,"Expressió incorrecta en el sentit de joc infantil. \"Comba\" és un terme de geomorfologia.": ["Expresión incorrecta con el sentido de un juego infantil. «Comba» es un término de geomorfología.", "Incorrect expression for the children's game. ‘Comba’ is a geomorphology term."]
    ,"Expressió incorrecta si vol dir __SUGGESTION_1__ (joc infantil). \"Comba\" és un terme de geomorfologia.": ["Expresión incorrecta si significa «{suggestion1}» (juego infantil). «Comba» es un término de geomorfología.", "Incorrect expression if it means ‘{suggestion1}’ (children's game). ‘Comba’ is a geomorphology term."]
    ,"Error de concordança: \"afores\" és un nom masculí plural.": ["Error de concordancia: «afores» es un sustantivo masculino plural.", "Agreement error: ‘afores’ is a masculine plural noun."]
    ,"L'expressió adequada és \"a les males\" o \"a males\".": ["Las expresiones adecuadas son «a les males» o «a males».", "The correct expressions are ‘a les males’ or ‘a males’. "]
    ,"L'article adequat per a aquesta hora __SUGGESTION_1__. ": ["El artículo adecuado para esta hora es «{suggestion1}».", "The correct article for this time is ‘{suggestion1}’. "]
    ,"Si volíeu dir \"al mateix temps\", cal escriure __SUGGESTION_1__. ": ["Si querías decir «al mismo tiempo», debe escribirse «{suggestion1}».", "If you mean ‘at the same time’, write ‘{suggestion1}’. "]
    ,"Per a indicar una distància cal dir __SUGGESTION_1__. \"\\1\" indica la dimensió d'un objecte.": ["Para indicar una distancia debe decirse «{suggestion1}». «\\1» indica la dimensión de un objeto.", "Use ‘{suggestion1}’ for a distance. ‘\\1’ refers to an object's dimension."]
    ,"En sentit figurat, cal dir __SUGGESTION_1__. ": ["En sentido figurado, debe decirse «{suggestion1}».", "Use ‘{suggestion1}’ in the figurative sense."]
    ,"L'expressió adequada és \"mitjà termini\".": ["La expresión adecuada es «mitjà termini».", "The correct expression is ‘mitjà termini’. "]
    ,"Per a referir-nos a una data concreta, fem servir l'article.": ["Para referirnos a una fecha concreta, usamos el artículo.", "Use the article when referring to a specific date."]
    ,"Expressió incorrecta si equival a __SUGGESTION_1__ o __SUGGESTION_2__ (coneixent els fets).": ["Expresión incorrecta si equivale a «{suggestion1}» o «{suggestion2}» (conociendo los hechos).", "Incorrect expression if it means ‘{suggestion1}’ or ‘{suggestion2}’ (knowing the facts)."]
    ,"Expressió incorrecta si equival a __SUGGESTION_1__ (després) o __SUGGESTION_2__ (coneixent els fets).": ["Expresión incorrecta si equivale a «{suggestion1}» (después) o «{suggestion2}» (conociendo los hechos).", "Incorrect expression if it means ‘{suggestion1}’ (afterwards) or ‘{suggestion2}’ (knowing the facts)."]
    ,"Expressió incorrecta si vol dir __SUGGESTION_1__ (ràpidament).": ["Expresión incorrecta si significa «{suggestion1}» (rápidamente).", "Incorrect expression when it means ‘{suggestion1}’ (quickly)."]
    ,"Construcció incorrecta, si no equival a \"\\1 \\2 la qual\" o \"\\1 \\2l qual\".": ["Construcción incorrecta si no equivale a «\\1 \\2 la qual» o «\\1 \\2l qual».", "Incorrect construction unless it means ‘\\1 \\2 la qual’ or ‘\\1 \\2l qual’. "]
    ,"Per a expressar un desafiament fem servir una altra expressió.": ["Para expresar un desafío usamos otra expresión.", "Use a different expression to express a challenge."]
    ,"Normalment s'escriu __SUGGESTION_1__. ": ["Normalmente se escribe «{suggestion1}».", "It is usually written ‘{suggestion1}’. "]
    ,"La preposició 'a' és probablement supèrflua.": ["La preposición «a» probablemente es superflua.", "The preposition ‘a’ is probably unnecessary."]
    ,"Val més usar l'expressió __SUGGESTION_1__. ": ["Es preferible usar la expresión «{suggestion1}».", "Prefer the expression ‘{suggestion1}’. "]
    ,"Expressió incorrecta. Castellanisme.": ["Expresión incorrecta. Calco del castellano.", "Incorrect expression. Spanish calque."]
    ,"Val més usar una altra expressió o suprimir-la.": ["Es preferible usar otra expresión o eliminarla.", "Use a different expression or remove it."]
    ,"Expressió inadequada amb el sentit de __SUGGESTION_1__ o __SUGGESTION_2__. ": ["Expresión inadecuada con el sentido de «{suggestion1}» o «{suggestion2}».", "Unsuitable expression when it means ‘{suggestion1}’ or ‘{suggestion2}’. "]
    ,"Expressió inadequada amb el sentit de __SUGGESTION_1__ o __SUGGESTION_2__. \\4": ["Expresión inadecuada con el sentido de «{suggestion1}» o «{suggestion2}» «\\4».", "Unsuitable expression when it means ‘{suggestion1}’ or ‘{suggestion2}’ ‘\\4’. "]
    ,"Podem usar una expressió més curta i genuïna.": ["Podemos usar una expresión más breve y genuina.", "A shorter, more idiomatic expression is possible."]
    ,"¿Volíeu dir __SUGGESTION_1__? Correcte si és en anglès.": ["¿Querías decir «{suggestion1}»? Es correcto si el texto está en inglés.", "Did you mean ‘{suggestion1}’? It is correct if the text is in English."]
    ,"En el sentit de 'saliva' cal escriure __SUGGESTION_1__. \"Baba\" és correcte en el sentit de 'àvia' en llenguatge infantil.": ["Con el sentido de «saliva», debe escribirse «{suggestion1}». «Baba» es correcto como forma infantil de «abuela».", "When it means ‘saliva’, write ‘{suggestion1}’. ‘Baba’ is a childish word for ‘grandmother’. "]
    ,"En el sentit de 'saliva' cal escriure __SUGGESTION_1__. \"Babes\" és correcte en el sentit de 'àvies' en llenguatge infantil.": ["Con el sentido de «saliva», debe escribirse «{suggestion1}». «Babes» es correcto como forma infantil de «abuelas».", "When it means ‘saliva’, write ‘{suggestion1}’. ‘Babes’ is a childish word for ‘grandmothers’. "]
    ,"Com a nom de peix, val més dir __SUGGESTION_1__. 'Bacallar' existeix en altres sentits.": ["Como nombre del pez, es preferible decir «{suggestion1}». «Bacallar» existe con otros sentidos.", "For the fish, use ‘{suggestion1}’. ‘Bacallar’ exists with other meanings."]
    ,"La paraula adequada és \"bacteri\" (nom masculí).": ["La palabra adecuada es «bacteri» (sustantivo masculino en catalán).", "The correct Catalan word is ‘bacteri’ (masculine noun)."]
    ,"Aquesta expressió s'escriu preferiblement sense article.": ["Es preferible escribir esta expresión sin artículo.", "This expression is preferably written without an article."]
    ,"Quan significa 'passar a un nivell més baix', \"baixar\" és intransitiu (ex. La marea ha baixat). Com a verb transitiu, cal usar __SUGGESTION_1__ (ex. El govern abaixa els imposts).": ["Cuando significa «pasar a un nivel más bajo», «baixar» es intransitivo (p. ej., «La marea ha baixat»). Como verbo transitivo, debe usarse «{suggestion1}» (p. ej., «El govern abaixa els imposts»).", "When it means ‘to move to a lower level’, ‘baixar’ is intransitive (e.g. ‘La marea ha baixat’). As a transitive verb, use ‘{suggestion1}’ (e.g. ‘El govern abaixa els imposts’)."]
    ,"En el sentit de 'portar (algú o alguna cosa) de dalt a baix', cal dir __SUGGESTION_1__. ": ["Con el sentido de «llevar a alguien o algo de arriba abajo», debe decirse «{suggestion1}».", "When it means ‘to take someone or something down’, use ‘{suggestion1}’. "]
    ,"Possible castellanisme. \"Baladí\" existeix com a denominació històrica.": ["Posible calco del castellano. «Baladí» existe como denominación histórica.", "Possible Spanish calque. ‘Baladí’ exists as a historical designation."]
    ,"En aquest context, cal dir __SUGGESTION_1__ (senyal, indicador)": ["En este contexto, debe decirse «{suggestion1}» (señal, indicador).", "In this context, use ‘{suggestion1}’ (sign, indicator)."]
    ,"En el sentit de sabatilla d'esport cal escriure __SUGGESTION_1__. ": ["Con el sentido de zapatilla deportiva, debe escribirse «{suggestion1}».", "For an athletic shoe, write ‘{suggestion1}’. "]
    ,"La forma del verb auxiliar 'anar' s'escriu __SUGGESTION_1__. ": ["La forma del verbo auxiliar «anar» se escribe «{suggestion1}».", "The form of the auxiliary verb ‘anar’ is written ‘{suggestion1}’. "]
    ,"Paraula admesa només en alguns diccionaris. Considereu una opció alternativa.": ["Palabra admitida solo por algunos diccionarios. Considera una alternativa.", "Word accepted by only some dictionaries. Consider an alternative."]
    ,"Amb el v. '\\1' probablement cal fer servir la preposició __SUGGESTION_1__. ": ["Con el verbo «\\1», probablemente debe usarse la preposición «{suggestion1}».", "The verb ‘\\1’ probably takes the preposition ‘{suggestion1}’. "]
    ,"Per a referir-nos a l'equip de bàsquet, escrivim __SUGGESTION_1__. ": ["Para referirse al equipo de baloncesto, se escribe «{suggestion1}».", "Write ‘{suggestion1}’ for the basketball team."]
    ,"¿Volíeu dir __SUGGESTION_1__ (esport)? \"Basquet\" és correcte en el sentit de 'caixa'.": ["¿Querías decir «{suggestion1}» (deporte)? «Basquet» es correcto con el sentido de «cesta». ", "Did you mean ‘{suggestion1}’ (sport)? ‘Basquet’ is correct when it means ‘basket’. "]
    ,"Si \"bastant\" és un adverbi que modifica l'adjectiu \"\\2\", s'escriu en singular.": ["Si «bastant» es un adverbio que modifica el adjetivo «\\2», se escribe en singular.", "If ‘bastant’ is an adverb modifying the adjective ‘\\2’, it is singular."]
    ,"Si \"bastant\" és un adverbi que modifica l'adjectiu \"\\3\", s'escriu en singular.": ["Si «bastant» es un adverbio que modifica el adjetivo «\\3», se escribe en singular.", "If ‘bastant’ is an adverb modifying the adjective ‘\\3’, it is singular."]
    ,"Davant d'un infinitiu cal dir __SUGGESTION_1__. ": ["Delante de un infinitivo debe decirse «{suggestion1}».", "Before an infinitive, use ‘{suggestion1}’. "]
    ,"¿Volíeu dir __SUGGESTION_1__ (del v. 'bastar')? \"Vasta\" significa 'àmplia, dilatada'.": ["¿Querías decir «{suggestion1}» (del verbo «bastar»)? «Vasta» significa «amplia, extensa».", "Did you mean ‘{suggestion1}’ (from ‘bastar’)? ‘Vasta’ means ‘wide’ or ‘extensive’. "]
    ,"Si és del verb 'anar' (auxiliar), s'escriu amb 'v'.": ["Si es una forma auxiliar del verbo «anar», se escribe con «v».", "If it is the auxiliary verb ‘anar’, it is spelled with ‘v’. "]
    ,"Només va sense accent quan és un animal o un nom de lletra. Si no, escriviu __SUGGESTION_1__ (adverbi).": ["Solo se escribe sin tilde cuando es un animal o el nombre de una letra. En los demás casos, escribe «{suggestion1}» (adverbio).", "It has no accent mark only when it refers to an animal or a letter name. Otherwise, write ‘{suggestion1}’ (adverb)."]
    ,"Només va sense accent quan és un animal o un nom de lletra. Escriviu __SUGGESTION_1__ (adverbi) o __SUGGESTION_2__ (del v. 'venir').": ["Solo se escribe sin tilde cuando es un animal o el nombre de una letra. Escribe «{suggestion1}» (adverbio) o «{suggestion2}» (del verbo «venir»).", "It has no accent mark only when it refers to an animal or a letter name. Write ‘{suggestion1}’ (adverb) or ‘{suggestion2}’ (from ‘venir’)."]
    ,"Només va sense accent quan és un animal. Si no, escriviu __SUGGESTION_1__. ": ["Solo se escribe sin tilde cuando es un animal. En los demás casos, escribe «{suggestion1}».", "It has no accent mark only when it refers to an animal. Otherwise, write ‘{suggestion1}’. "]
    ,"Possible error de traductor automàtic. ¿Volíeu dir __SUGGESTION_1__ (avaluar, calcular)?": ["Posible error de traducción automática. ¿Querías decir «{suggestion1}» (evaluar, calcular)?", "Possible machine-translation error. Did you mean ‘{suggestion1}’ (evaluate, calculate)? "]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Berbena\" és un gènere de plantes.": ["¿Querías decir «{suggestion1}»? «Berbena» es un género de plantas.", "Did you mean ‘{suggestion1}’? ‘Berbena’ is a genus of plants."]
    ,"¿Volíeu dir __SUGGESTION_1__ (animal)? Correcte en el sentit de germana de l'avi o de l'àvia (bes-tia).": ["¿Querías decir «{suggestion1}» (animal)? Es correcto con el sentido de hermana del abuelo o de la abuela (tía abuela).", "Did you mean ‘{suggestion1}’ (animal)? It is correct when it means a sibling of one's grandparent (great-aunt)."]
    ,"S'escriu amb 'v' perquè és una forma del verb 'veure'.": ["Se escribe con «v» porque es una forma del verbo «veure».", "It is spelled with ‘v’ because it is a form of ‘veure’. "]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Billó\" és correcte en altres sentits.": ["¿Querías decir «{suggestion1}»? «Billó» es correcto con otros sentidos.", "Did you mean ‘{suggestion1}’? ‘Billó’ is correct with other meanings."]
    ,"Correcte en el sentit de 'bitlar' (en el joc de bitles). Incorrecte en altres sentits.": ["Correcto con el sentido de «bitlar» (jugar a los bolos). Incorrecto con otros sentidos.", "Correct when it means ‘to bowl’ in the game of skittles. Incorrect with other meanings."]
    ,"Onomatopeia del soroll de parlar, xerrameca.": ["Onomatopeya del sonido de hablar; significa «charla» o «parloteo».", "Onomatopoeia for the sound of talking; it means ‘chatter’. "]
    ,"El nom correcte del personatge de conte és __SUGGESTION_1__. ": ["El nombre correcto del personaje del cuento es «{suggestion1}».", "The correct name of the fairy-tale character is ‘{suggestion1}’. "]
    ,"El germanisme 'Blitzkrieg' es pot substituir per l'expressió __SUGGESTION_1__. ": ["El germanismo «Blitzkrieg» puede sustituirse por la expresión «{suggestion1}».", "The German loanword ‘Blitzkrieg’ can be replaced by ‘{suggestion1}’. "]
    ,"Incorrecte si volíeu dir __SUGGESTION_1__. 'Bobo' existeix com a nom d'un poble sudanès.": ["Incorrecto si querías decir «{suggestion1}». «Bobo» existe como nombre de un pueblo sudanés.", "Incorrect if you meant ‘{suggestion1}’. ‘Bobo’ is also the name of a Sudanese people."]
    ,"Com a locució adverbial, l'expressió completa és __SUGGESTION_1__. ": ["Como locución adverbial, la expresión completa es «{suggestion1}».", "As an adverbial phrase, the full expression is ‘{suggestion1}’. "]
    ,"\"Bodega\" és la part interior d'una nau destinada a la càrrega. En altres sentits, val més dir \"celler\".": ["«Bodega» es la parte interior de un barco destinada a la carga. Con otros sentidos, es preferible decir «celler».", "‘Bodega’ is the cargo hold of a ship. For other meanings, ‘celler’ is preferable."]
    ,"¿Volíeu dir __SUGGESTION_1__ (__SUGGESTION_2__)? És correcte en altres sentits menys habituals (adobar, femar; boga).": ["¿Querías decir «{suggestion1}» («{suggestion2}»)? Es correcto con otros sentidos menos habituales (curtir, abonar; boga).", "Did you mean ‘{suggestion1}’ (‘{suggestion2}’)? It is correct with other less common meanings (to tan, to fertilize; boga)."]
    ,"El verb adequat referint-se a dades és \"abocar\" o \"buidar\".": ["Los verbos adecuados para referirse a datos son «abocar» o «buidar».", "The appropriate verbs for data are ‘abocar’ or ‘buidar’. "]
    ,"El terme adequat per a referir-se a dades és \"abocament\" o \"buidatge\".": ["Los términos adecuados para referirse a datos son «abocament» o «buidatge».", "The appropriate terms for data are ‘abocament’ or ‘buidatge’. "]
    ,"Expressió inadequada com a fórmula de salutació. A més, hi falta una coma.": ["Expresión inadecuada como saludo. Además, falta una coma.", "Unsuitable as a greeting. A comma is also missing."]
    ,"Expressió inadequada com a fórmula de salutació.": ["Expresión inadecuada como saludo.", "Unsuitable as a greeting."]
    ,"Diem preferiblement __SUGGESTION_1__ (si és per Nadal) o __SUGGESTION_2__. ": ["Se prefiere decir «{suggestion1}» (para Navidad) o «{suggestion2}».", "Prefer ‘{suggestion1}’ (for Christmas) or ‘{suggestion2}’. "]
    ,"Incorrecte en el sentit de __SUGGESTION_1__. Correcte en altres sentits menys habituals.": ["Incorrecto con el sentido de «{suggestion1}». Correcto con otros sentidos menos habituales.", "Incorrect when it means ‘{suggestion1}’. Correct with other, less common meanings."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Boto\" és una forma del v. 'botar'.": ["¿Querías decir «{suggestion1}»? «Boto» es una forma del verbo «botar».", "Did you mean ‘{suggestion1}’? ‘Boto’ is a form of ‘botar’. "]
    ,"El sistema d'escriptura per a cecs inventat per Louis Braille s'escriu en minúscula.": ["El sistema de escritura para personas ciegas inventado por Louis Braille se escribe en minúscula.", "The writing system for blind people invented by Louis Braille is written in lowercase."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Brana\" és un terme de física.": ["¿Querías decir «{suggestion1}»? «Brana» es un término de física.", "Did you mean ‘{suggestion1}’? ‘Brana’ is a physics term."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Brillantés\" és el plural de \"brillanté\" (tipus de teixit).": ["¿Querías decir «{suggestion1}»? «Brillantés» es el plural de «brillanté» (tipo de tejido).", "Did you mean ‘{suggestion1}’? ‘Brillantés’ is the plural of ‘brillanté’ (a type of fabric)."]
    ,"¿Volíeu dir __SUGGESTION_1__ (\\1)? És correcte en altres sentits menys habituals (adobar, femar; boga).": ["¿Querías decir «{suggestion1}» («\\1»)? Es correcto con otros sentidos menos habituales (curtir, abonar; boga).", "Did you mean ‘{suggestion1}’ (‘\\1’)? It is correct with other less common meanings (to tan, to fertilize; boga)."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Bussó\" és correcte en altres sentits.": ["¿Querías decir «{suggestion1}»? «Bussó» es correcto con otros sentidos.", "Did you mean ‘{suggestion1}’? ‘Bussó’ is correct with other meanings."]
    ,"És més adequat escriure __SUGGESTION_1__ (cada quant de temps).": ["Es más adecuado escribir «{suggestion1}» (cada cuánto tiempo).", "It is more appropriate to write ‘{suggestion1}’ (how often)."]
    ,"Val més prescindir del pronom '\\4', especialment si no es refereix a persones.": ["Es preferible prescindir del pronombre «\\4», especialmente si no se refiere a personas.", "The pronoun ‘\\4’ is best omitted, especially if it does not refer to people."]
    ,"Incorrecte en el sentit de __SUGGESTION_1__ (pedra tallada). Correcte en el sentit de conjunt de cadires.": ["Incorrecto con el sentido de «{suggestion1}» (piedra tallada). Correcto con el sentido de conjunto de sillas.", "Incorrect when it means ‘{suggestion1}’ (dressed stone). Correct when it means a set of chairs."]
    ,"Cal escriure __SUGGESTION_1__ (italià) o __SUGGESTION_2__. ": ["Debe escribirse «{suggestion1}» (en italiano) o «{suggestion2}».", "Write ‘{suggestion1}’ (Italian) or ‘{suggestion2}’. "]
    ,"Incorrecte en el sentit de 'tronc, tió'. Denominació admissible si es refereix a l'acte o la tradició de fer cagar el tió.": ["Incorrecto con el sentido de «tronco, tió». Es admisible si se refiere al acto o la tradición de hacer cagar el tió.", "Incorrect when it means ‘log, tió’. It is accepted for the act or tradition of making the tió defecate gifts."]
    ,"Incorrecte en el sentit de 'tronc, tió'. \"Cagatió\" és admissible si es refereix a l'acte o la tradició de fer cagar el tió.": ["Incorrecto con el sentido de «tronco, tió». «Cagatió» es admisible si se refiere al acto o la tradición de hacer cagar el tió.", "Incorrect when it means ‘log, tió’. ‘Cagatió’ is accepted for the act or tradition of making the tió defecate gifts."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del verb 'caure')? Un \"caïc\" és una embarcació petita.": ["¿Querías decir «{suggestion1}» (del verbo «caure»)? Un «caïc» es una embarcación pequeña.", "Did you mean ‘{suggestion1}’ (from ‘caure’)? A ‘caïc’ is a small boat."]
    ,"¿Volíeu dir __SUGGESTION_1__? És correcte en altres sentits.": ["¿Querías decir «{suggestion1}»? Es correcto con otros sentidos.", "Did you mean ‘{suggestion1}’? It is correct with other meanings."]
    ,"La preposició 'de' és sobrera amb el v. 'caldre' seguit d'infinitiu.": ["La preposición «de» sobra con el verbo «caldre» seguido de infinitivo.", "The preposition ‘de’ is unnecessary with ‘caldre’ followed by an infinitive."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Calendar\" és un terme històric.": ["¿Querías decir «{suggestion1}»? «Calendar» es un término histórico.", "Did you mean ‘{suggestion1}’? ‘Calendar’ is a historical term."]
    ,"El verb correcte és 'escalfar' o 'calfar'.": ["Los verbos correctos son «escalfar» o «calfar».", "The correct verbs are ‘escalfar’ or ‘calfar’. "]
    ,"El verb 'caldre' ha d'anar en singular davant d'un infinitiu.": ["El verbo «caldre» debe ir en singular delante de un infinitivo.", "The verb ‘caldre’ must be singular before an infinitive."]
    ,"¿Volíeu dir __SUGGESTION_1__ (diners)? 'Calers' són els habitants d'Ametlla de Mar.": ["¿Querías decir «{suggestion1}» (dinero)? «Calers» son los habitantes de Ametlla de Mar.", "Did you mean ‘{suggestion1}’ (money)? ‘Calers’ refers to people from Ametlla de Mar."]
    ,"Forma verbal probablement incompleta.": ["Forma verbal probablemente incompleta.", "Verb form may be incomplete."]
    ,"L'expressió adequada és \"fer callar\".": ["La expresión adecuada es «fer callar».", "The correct expression is ‘fer callar’. "]
    ,"Falta un nom darrere de \"cals\" (ca + els).": ["Falta un sustantivo después de «cals» (contracción de «ca + els»).", "A noun is missing after ‘cals’ (a contraction of ‘ca + els’)."]
    ,"En el sentit de dispositiu per a reproduir imatges, és més habitual dir \"càmera\".": ["Con el sentido de dispositivo para reproducir imágenes, es más habitual decir «càmera».", "For a device that records or reproduces images, ‘càmera’ is more common."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Camiller\" vol dir 'caramellaire, cantaire de caramelles'.": ["¿Querías decir «{suggestion1}»? «Camiller» significa «caramellaire, cantaire de caramelles».", "Did you mean ‘{suggestion1}’? ‘Camiller’ means a singer of traditional caramelles songs."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Camissa\" vol dir 'timó de l'arada'.": ["¿Querías decir «{suggestion1}»? «Camissa» significa «timón del arado».", "Did you mean ‘{suggestion1}’? ‘Camissa’ means a plough's steering handle."]
    ,"Correcte com a nom de lloc. Incorrecte si equival a __SUGGESTION_1__. ": ["Correcto como topónimo. Incorrecto si equivale a «{suggestion1}».", "Correct as a place name. Incorrect if it means ‘{suggestion1}’. "]
    ,"¿Volíeu dir __SUGGESTION_1__ (nom de país)? \"Canada\" (en minúscula) és un nom comú poc usual.": ["¿Querías decir «{suggestion1}» (nombre de país)? «Canada» (en minúscula) es un sustantivo común poco usual.", "Did you mean ‘{suggestion1}’ (country name)? Lowercase ‘canada’ is an uncommon common noun."]
    ,"Incorrecte com a adjectiu. Correcte com a forma del verb 'cansar'.": ["Incorrecto como adjetivo. Es correcto como forma del verbo «cansar».", "Incorrect as an adjective. Correct as a form of ‘cansar’. "]
    ,"¿Volíeu dir __SUGGESTION_1__ (lloc d'on s'extrauen pedres) o __SUGGESTION_2__ (lloc de formació)? \"Cantera\" és correcte en el sentit de 'pedra grossa' i 'ganes de cantar'.": ["¿Querías decir «{suggestion1}» (lugar de extracción de piedra) o «{suggestion2}» (lugar de formación)? «Cantera» es correcto con los sentidos de «piedra grande» y «ganas de cantar».", "Did you mean ‘{suggestion1}’ (stone quarry) or ‘{suggestion2}’ (training ground)? ‘Cantera’ is correct when it means a large stone or a desire to sing."]
    ,"El verb adequat és 'girar'.": ["El verbo adecuado es «girar».", "The correct verb is ‘girar’. "]
    ,"El verb adequat en aquest context és 'captar'.": ["El verbo adecuado en este contexto es «captar».", "The appropriate verb in this context is ‘captar’. "]
    ,"Escrivim __SUGGESTION_1__ davant de pronom.": ["Escribimos «{suggestion1}» delante de un pronombre.", "Write ‘{suggestion1}’ before a pronoun."]
    ,"Possible confusió o error de concordança.": ["Posible confusión o error de concordancia.", "Possible confusion or agreement error."]
    ,"El nom d'aquest país és preferiblement __SUGGESTION_1__. ": ["El nombre preferido de este país es «{suggestion1}».", "The preferred name of this country is ‘{suggestion1}’. "]
    ,"\"Càrcer\" és una paraula correcta però inusual i arcaica.": ["«Càrcer» es una palabra correcta, pero inusual y arcaica.", "‘Càrcer’ is correct but uncommon and archaic."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Carga\" és el nom d'algunes unitats de mesura.": ["¿Querías decir «{suggestion1}»? «Carga» es el nombre de algunas unidades de medida.", "Did you mean ‘{suggestion1}’? ‘Carga’ names some units of measurement."]
    ,"Com a vocatiu afectuós, diem __SUGGESTION_1__. \"Cari\" existeix amb el sentit de 'relatiu a la Cària'.": ["Como vocativo cariñoso, se dice «{suggestion1}». «Cari» existe con el sentido de «relativo a Caria».", "As an affectionate form of address, use ‘{suggestion1}’. ‘Cari’ also means ‘related to Caria’. "]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Carioca\" és el gentilici de la ciutat de Rio de Janeiro.": ["¿Querías decir «{suggestion1}»? «Carioca» es el gentilicio de la ciudad de Río de Janeiro.", "Did you mean ‘{suggestion1}’? ‘Carioca’ is the demonym for the city of Rio de Janeiro."]
    ,"Normalment s'usa la forma adaptada amb accent.": ["Normalmente se usa la forma adaptada con tilde.", "The adapted form with an accent mark is usually used."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Carreges\" és una forma del verb 'carrejar' (traginar).": ["¿Querías decir «{suggestion1}»? «Carreges» es una forma del verbo «carrejar» (transportar).", "Did you mean ‘{suggestion1}’? ‘Carreges’ is a form of ‘carrejar’ (to haul)."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del verb 'carregar')? És correcte si és del verb 'carrejar' (traginar).": ["¿Querías decir «{suggestion1}» (del verbo «carregar»)? Es correcto si es una forma de «carrejar» (transportar).", "Did you mean ‘{suggestion1}’ (from ‘carregar’)? It is correct if it comes from ‘carrejar’ (to haul)."]
    ,"Els noms de vies urbanes s'escriuen normalment en minúscula.": ["Los nombres de vías urbanas suelen escribirse en minúscula.", "Urban street names are usually written in lowercase."]
    ,"Com a adjectiu, cal dir __SUGGESTION_1__. Pot ser correcte en altres sentits.": ["Como adjetivo, debe decirse «{suggestion1}». Puede ser correcto con otros sentidos.", "As an adjective, use ‘{suggestion1}’. It may be correct with other meanings."]
    ,"Reviseu les majúscules al començament de la frase.": ["Revisa las mayúsculas al comienzo de la frase.", "Check capitalization at the beginning of the sentence."]
    ,"¿Volíeu dir __SUGGESTION_1__ (habitatge)? Una \"cassa\" és un vas de metall amb mànec.": ["¿Querías decir «{suggestion1}» (vivienda)? Una «cassa» es un recipiente de metal con asa.", "Did you mean ‘{suggestion1}’ (dwelling)? A ‘cassa’ is a metal vessel with a handle."]
    ,"¿Volíeu dir __SUGGESTION_1__ (habitatges)? Una \"cassa\" és un vas de metall amb mànec.": ["¿Querías decir «{suggestion1}» (viviendas)? Una «cassa» es un recipiente de metal con asa.", "Did you mean ‘{suggestion1}’ (dwellings)? A ‘cassa’ is a metal vessel with a handle."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Cassos\" és correcte com a plural de \"cas\" (recipient).": ["¿Querías decir «{suggestion1}»? «Cassos» es correcto como plural de «cas» (recipiente).", "Did you mean ‘{suggestion1}’? ‘Cassos’ is correct as the plural of ‘cas’ (a vessel)."]
    ,"La forma més habitual és __SUGGESTION_1__": ["La forma más habitual es «{suggestion1}».", "The most common form is ‘{suggestion1}’. "]
    ,"Expressió incorrecta com a condicional.": ["Expresión incorrecta como condicional.", "Incorrect expression as a conditional."]
    ,"Una frase sencera en majúscules es pot considerar inadequada o poc llegible.": ["Una frase completa en mayúsculas puede resultar inadecuada o difícil de leer.", "A sentence written entirely in capitals may be unsuitable or hard to read."]
    ,"Aquesta data no és un {day} sinó un {realDay}.": ["Esta fecha no es un {day}, sino un {realDay}.", "This date is not a {day}, but a {realDay}."]
    ,"Si us referiu a l'any actual ({currentYear}), aquesta data no és un {day} sinó un {realDay}.": ["Si te refieres al año actual ({currentYear}), esta fecha no es un {day}, sino un {realDay}.", "If you mean the current year ({currentYear}), this date is not a {day}, but a {realDay}."]
    ,"Si és del verb 'tenir', s'escriu junt.": ["Si es una forma del verbo «tenir», se escribe junto.", "If it is a form of ‘tenir’, write it as one word."]
    ,"Castellanisme. ¿Volíeu dir __SUGGESTION_1__ (Hordeum vulgare) o __SUGGESTION_2__ (Avena sativa)?": ["Calco del castellano. ¿Querías decir «{suggestion1}» (Hordeum vulgare) o «{suggestion2}» (Avena sativa)?", "Spanish calque. Did you mean ‘{suggestion1}’ (Hordeum vulgare) or ‘{suggestion2}’ (Avena sativa)?"]
    ,"¿Volíeu dir __SUGGESTION_1__? És correcte en el sentit de 'camp plantat de cebes'.": ["¿Querías decir «{suggestion1}»? Es correcto con el sentido de «campo plantado de cebollas».", "Did you mean ‘{suggestion1}’? It is correct when it means ‘a field planted with onions’. "]
    ,"¿Volíeu dir __SUGGESTION_1__? \"\\1\" és del v. 'celar' (ocultar).": ["¿Querías decir «{suggestion1}»? «\\1» es una forma del verbo «celar» (ocultar).", "Did you mean ‘{suggestion1}’? ‘\\1’ is a form of ‘celar’ (to conceal)."]
    ,"Probablement sobra el pronom \"t'\" (=a tu).": ["Probablemente sobra el pronombre «t'» (=a ti).", "The pronoun ‘t'’ (=to you) is probably redundant."]
    ,"\"Cint\" és un arcaisme. ¿Volíeu dir una altra cosa?": ["«Cint» es un arcaísmo. ¿Querías decir otra cosa?", "‘Cint’ is archaic. Did you mean something else?"]
    ,"\"Cint\" és un topònim o un arcaisme. ¿Volíeu dir una altra cosa?": ["«Cint» es un topónimo o un arcaísmo. ¿Querías decir otra cosa?", "‘Cint’ is a place name or an archaic word. Did you mean something else?"]
    ,"¿Volíeu dir __SUGGESTION_1__? Correcte com a participi de \"circuir\".": ["¿Querías decir «{suggestion1}»? Es correcto como participio de «circuir».", "Did you mean ‘{suggestion1}’? It is correct as a participle of ‘circuir’. "]
    ,"¿Volíeu dir __SUGGESTION_1__? 'Cloaca' existeix com a terme de zoologia.": ["¿Querías decir «{suggestion1}»? «Cloaca» existe como término de zoología.", "Did you mean ‘{suggestion1}’? ‘Cloaca’ exists as a zoological term."]
    ,"El símbol de centímetres s'escriu en minúscula.": ["El símbolo de centímetros se escribe en minúscula.", "The symbol for centimetres is written in lowercase."]
    ,"¿Volíeu dir __SUGGESTION_1__ (protecció del colze)? \"Codera\" és un terme de nàutica.": ["¿Querías decir «{suggestion1}» (protección del codo)? «Codera» es un término náutico.", "Did you mean ‘{suggestion1}’ (elbow protection)? ‘Codera’ is a nautical term."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Codials\" és un terme de botànica.": ["¿Querías decir «{suggestion1}»? «Codials» es un término de botánica.", "Did you mean ‘{suggestion1}’? ‘Codials’ is a botanical term."]
    ,"Variant secundària de __SUGGESTION_1__. ": ["Variante secundaria de «{suggestion1}».", "Secondary variant of ‘{suggestion1}’. "]
    ,"¿Volíeu dir __SUGGESTION_1__, __SUGGESTION_2__ o __SUGGESTION_3__ (informal)? 'Coles' pot ser el plural de 'cola' (substantiu femení).": ["¿Querías decir «{suggestion1}», «{suggestion2}» o «{suggestion3}» (informal)? «Coles» puede ser el plural de «cola» (sustantivo femenino).", "Did you mean ‘{suggestion1}’, ‘{suggestion2}’ or ‘{suggestion3}’ (informal)? ‘Coles’ may be the plural of ‘cola’ (a feminine noun)."]
    ,"Només és correcte com a terme de química.": ["Solo es correcto como término de química.", "It is correct only as a chemistry term."]
    ,"Forma col·loquial per a dir __SUGGESTION_1__. ": ["Forma coloquial de decir «{suggestion1}».", "Colloquial form meaning ‘{suggestion1}’. "]
    ,"Forma col·loquial per a dir __SUGGESTION_1__. ": ["Forma coloquial de decir «{suggestion1}».", "Colloquial form meaning ‘{suggestion1}’. "]
    ,"És més habitual usar \"\\1\" com a nom masculí.": ["Es más habitual usar «\\1» como sustantivo masculino.", "‘\\1’ is more commonly used as a masculine noun."]
    ,"Variant informal de __SUGGESTION_1__. ": ["Variante informal de «{suggestion1}».", "Informal variant of ‘{suggestion1}’. "]
    ,"Normalment s'usa la grafia adaptada d'aquest nom.": ["Normalmente se usa la grafía adaptada de este nombre.", "The adapted spelling of this name is usually used."]
    ,"Possible error ortogràfic. Existeix el verb 'comar' (posar comes a un text), però és infreqüent.": ["Posible error ortográfico. Existe el verbo «comar» (poner comas en un texto), pero es poco frecuente.", "Possible spelling error. The verb ‘comar’ (to add commas to a text) exists, but is uncommon."]
    ,"¿Volíeu dir __SUGGESTION_1__ (joc infantil)? \"Comba\" és un terme de geomorfologia.": ["¿Querías decir «{suggestion1}» (juego infantil)? «Comba» es un término de geomorfología.", "Did you mean ‘{suggestion1}’ (children's game)? ‘Comba’ is a geomorphology term."]
    ,"L'apòstrof és mal col·locat, i és escrit amb un caràcter incorrecte.": ["El apóstrofo está mal colocado y se ha escrito con un carácter incorrecto.", "The apostrophe is misplaced and uses an incorrect character."]
    ,"Símbol poc usual propi de la tipografia alemanya.": ["Símbolo poco habitual propio de la tipografía alemana.", "Unusual symbol specific to German typography."]
    ,"Caràcter d'apòstrof incorrecte.": ["Carácter de apóstrofo incorrecto.", "Incorrect apostrophe character."]
    ,"Si l'adverbi \"\\3\" es refereix a tota la frase, i no sols al verb, val més posar-hi una coma.": ["Si el adverbio «\\3» se refiere a toda la frase y no solo al verbo, es preferible poner una coma.", "If the adverb ‘\\3’ modifies the whole sentence rather than just the verb, add a comma."]
    ,"Entre el nom de lloc i la data sol posar-se una coma.": ["Entre el topónimo y la fecha suele ponerse una coma.", "A comma is usually placed between the place name and the date."]
    ,"Possible error de concordança, o bé hi falta una coma.": ["Posible error de concordancia o quizá falta una coma.", "Possible agreement error, or a comma may be missing."]
    ,"Hi falta una coma.": ["Falta una coma.", "A comma is missing."]
    ,"Aquesta interjecció s'escriu normalment entre comes.": ["Esta interjección suele escribirse entre comas.", "This interjection is usually set off by commas."]
    ,"Falta una coma darrere de \"\\4 \\5\" (ex. \"\\4 \\5, Joan!\").": ["Falta una coma después de «\\4 \\5» (p. ej., «\\4 \\5, Joan!»).", "A comma is missing after ‘\\4 \\5’ (e.g. ‘\\4 \\5, Joan!’)."]
    ,"Falta una coma davant de \"ja que\".": ["Falta una coma delante de «ja que».", "A comma is missing before ‘ja que’. "]
    ,"En aquest context probablement manca una coma.": ["Probablemente falta una coma en este contexto.", "A comma is probably missing in this context."]
    ,"Useu una de les combinacions recomanades de comes en aquesta expressió.": ["Use una de las combinaciones de comas recomendadas para esta expresión.", "Use one of the recommended comma patterns for this expression."]
    ,"Probablement convé posar-hi una coma.": ["Probablemente conviene añadir una coma.", "A comma should probably be added."]
    ,"Aquesta locució s'escriu normalment entre comes si és un marcador discursiu.": ["Esta locución suele ir entre comas cuando funciona como marcador discursivo.", "This phrase is usually set off by commas when used as a discourse marker."]
    ,"Aquesta locució, si és un marcador discursiu, s'escriu normalment entre comes.": ["Esta locución suele ir entre comas cuando funciona como marcador discursivo.", "This phrase is usually set off by commas when used as a discourse marker."]
    ,"La conjunció 'però' va precedida de coma en la major part dels casos.": ["La conjunción «però» suele ir precedida de coma.", "The conjunction ‘però’ is usually preceded by a comma."]
    ,"La conjunció 'però' s'escriu amb accent i va precedida de coma en la major part dels casos.": ["La conjunción «però» lleva acento y suele ir precedida de coma.", "The conjunction ‘però’ takes an accent and is usually preceded by a comma."]
    ,"Poseu una coma o elimineu la repetició.": ["Añada una coma o elimine la repetición.", "Add a comma or remove the repetition."]
    ,"Possible error de puntuació. ¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__ (adreça d'internet)?": ["Posible error de puntuación. ¿Quería decir «{suggestion1}» o «{suggestion2}» (dirección de internet)?", "Possible punctuation error. Did you mean ‘{suggestion1}’ or ‘{suggestion2}’ (web address)?"]
    ,"Possible error de puntuació. ¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__?": ["Posible error de puntuación. ¿Quería decir «{suggestion1}» o «{suggestion2}»?", "Possible punctuation error. Did you mean ‘{suggestion1}’ or ‘{suggestion2}’? "]
    ,"Incorrecte en el sentit de 'cau' o 'recer'. \"\\3\" és un participi del verb 'guarir'.": ["Es incorrecto con el sentido de «cau» o «refugio». «\\3» es un participio del verbo «guarir».", "It is incorrect in the sense of ‘lair’ or ‘shelter’. ‘\\3’ is a participle of the verb ‘guarir’. "]
    ,"¿Volíeu dir __SUGGESTION_1__? Existeix 'jo como' (del v. 'comar').": ["¿Quería decir «{suggestion1}»? Existe la forma «jo como» (del verbo «comar»).", "Did you mean ‘{suggestion1}’? The form ‘jo como’ exists (from the verb ‘comar’)."]
    ,"La persona amb qui es \\4 s'introdueix amb la preposició 'amb'.": ["La persona con quien se \\4 se introduce con la preposición «amb». ", "The person with whom one \\4 is introduced by the preposition ‘amb’."]
    ,"La persona amb qui es \\2 s'introdueix amb la preposició 'amb'.": ["La persona con quien se \\2 se introduce con la preposición «amb». ", "The person with whom one \\2 is introduced by the preposition ‘amb’."]
    ,"Si no és del v. '\\2', cal dir __SUGGESTION_1__.": ["Si no es una forma del verbo «\\2», debe decirse «{suggestion1}».", "If it is not a form of the verb ‘\\2’, use ‘{suggestion1}’."]
    ,"En aquest context, cal usar el verb 'fer'. \"Complir-se\" no és una expressió adequada.": ["En este contexto debe usarse el verbo «fer». «Complir-se» no es una expresión adecuada.", "Use the verb ‘fer’ in this context. ‘Complir-se’ is not an appropriate expression."]
    ,"Val més fer servir una altra construcció.": ["Es preferible usar otra construcción.", "It is better to use a different construction."]
    ,"Possible confusió. ¿Volíeu dir __SUGGESTION_1__? \"Comprimís\" és una forma del v. 'comprimir'.": ["Posible confusión. ¿Quería decir «{suggestion1}»? «Comprimís» es una forma del verbo «comprimir».", "Possible confusion. Did you mean ‘{suggestion1}’? ‘Comprimís’ is a form of the verb ‘comprimir’."]
    ,"L'expressió adequada és 'comptar amb' o 'tenir'.": ["La expresión adecuada es «comptar amb» o «tenir».", "The appropriate expression is ‘comptar amb’ or ‘tenir’."]
    ,"Si és el nom d'una comarca valenciana o una divisió administrativa, cal escriure __SUGGESTION_1__.": ["Si es el nombre de una comarca valenciana o de una división administrativa, debe escribirse «{suggestion1}».", "If this is the name of a Valencian comarca or an administrative division, write ‘{suggestion1}’."]
    ,"Si és una divisió administrativa, cal escriure __SUGGESTION_1__.": ["Si es una división administrativa, debe escribirse «{suggestion1}».", "If this is an administrative division, write ‘{suggestion1}’."]
    ,"Possible error de concordança. \"\\2\" és la forma masculina i \"\\2\" és la forma femenina.": ["Posible error de concordancia. «\\2» es la forma masculina y «\\2» la femenina.", "Possible agreement error. ‘\\2’ is the masculine form and ‘\\2’ is the feminine form."]
    ,"Per a fer una comparació, hi sobra la preposició 'a'.": ["En una comparación, sobra la preposición «a».", "The preposition ‘a’ is unnecessary in this comparison."]
    ,"Per a indicar causa, és preferible usar la locució __SUGGESTION_1__.": ["Para expresar causa, es preferible usar la locución «{suggestion1}».", "To express cause, use the phrase ‘{suggestion1}’."]
    ,"¿Volíeu dir __SUGGESTION_1__? S'accentua \"cóm\" quan és sinònim de \"obi\" (en les normes tradicionals dels diacrítics).": ["¿Quería decir «{suggestion1}»? «Cóm» lleva tilde cuando significa «obi» (según las reglas tradicionales de los diacríticos).", "Did you mean ‘{suggestion1}’? ‘Cóm’ takes an accent when it means ‘obi’ (under the traditional diacritic rules)."]
    ,"Possible calc de l'anglès.": ["Posible calco del inglés.", "Possible calque from English."]
    ,"Useu un verb més apropiat.": ["Use un verbo más adecuado.", "Use a more appropriate verb."]
    ,"Possible error de concordança. Potser hi falta una coma.": ["Posible error de concordancia; quizá falta una coma.", "Possible agreement error; a comma may be missing."]
    ,"Error de concordança de gènere.": ["Error de concordancia de género.", "Gender agreement error."]
    ,"El nom '\\2' és preferentment femení.": ["El sustantivo «\\2» es preferentemente femenino.", "The noun ‘\\2’ is preferably treated as feminine."]
    ,"¿Volíeu dir \"amazones\" (dones guerreres) o bé \"l'Amazones\" (riu)?": ["¿Quería decir «amazones» (mujeres guerreras) o «l'Amazones» (el río)?", "Did you mean ‘amazones’ (warrior women) or ‘l’Amazones’ (the river)?"]
    ,"Probablement cal un nom en plural.": ["Probablemente hace falta un sustantivo en plural.", "A plural noun is probably needed."]
    ,"Referit a les hores, usem la forma femenina.": ["Para indicar las horas, se usa la forma femenina.", "When referring to the time, use the feminine form."]
    ,"Erra de concordança.": ["Error de concordancia.", "Agreement error."]
    ,"¿Volíeu dir __SUGGESTION_1__ (imperatiu) o __SUGGESTION_2__ (gerundi)? Si no, potser hi ha un error de concordança.": ["¿Quería decir «{suggestion1}» (imperativo) o «{suggestion2}» (gerundio)? Si no, quizá haya un error de concordancia.", "Did you mean ‘{suggestion1}’ (imperative) or ‘{suggestion2}’ (gerund)? Otherwise, there may be an agreement error."]
    ,"¿Volíeu dir __SUGGESTION_1__ (gerundi) o __SUGGESTION_2__ (imperatiu)? Si no, potser hi ha un error de concordança.": ["¿Quería decir «{suggestion1}» (gerundio) o «{suggestion2}» (imperativo)? Si no, quizá haya un error de concordancia.", "Did you mean ‘{suggestion1}’ (gerund) or ‘{suggestion2}’ (imperative)? Otherwise, there may be an agreement error."]
    ,"Calc de l'anglès si vol dir __SUGGESTION_1__.": ["Es un calco del inglés si quiere decir «{suggestion1}».", "This is a calque from English if it means ‘{suggestion1}’."]
    ,"Si és nom o adjectiu, s'escriu amb accent. Correcte si és del v. '\\1'.": ["Si es un sustantivo o adjetivo, se escribe con tilde. Es correcto si es una forma del verbo «\\1».", "If it is a noun or adjective, it takes an accent. It is correct if it is a form of the verb ‘\\1’."]
    ,"En aquesta expressió, cal usar el verb 'escampar'.": ["En esta expresión debe usarse el verbo «escampar».", "Use the verb ‘escampar’ in this expression."]
    ,"Si és participi del v. 'conduir', hi falta una dièresi. \"Conduit\" és correcte en altres sentits.": ["Si es el participio del verbo «conduir», falta una diéresis. «Conduit» es correcto con otros sentidos.", "If this is the past participle of ‘conduir’, it needs a diaeresis. ‘Conduit’ is correct with other meanings."]
    ,"'Conforme' no és una conjunció.": ["«Conforme» no es una conjunción.", "‘Conforme’ is not a conjunction."]
    ,"Probablement hi falta un accent.": ["Probablemente falta un acento.", "An accent is probably missing."]
    ,"Si és nom, cal escriure __SUGGESTION_1__.": ["Si es un sustantivo, debe escribirse «{suggestion1}».", "If this is a noun, write ‘{suggestion1}’."]
    ,"Si és nom, cal escriure __SUGGESTION_1__. Correcte si és del v. 'aviar'.": ["Si es un sustantivo, debe escribirse «{suggestion1}». La forma es correcta si pertenece al verbo «aviar».", "If this is a noun, write ‘{suggestion1}’. The form is correct if it belongs to the verb ‘aviar’."]
    ,"Si és nom, cal accentuar. Correcte si és del v. '\\1'.": ["Si es un sustantivo, debe llevar tilde. Es correcto si es una forma del verbo «\\1».", "If this is a noun, it needs an accent. It is correct if it is a form of the verb ‘\\1’."]
    ,"Si és nom o adjectiu, cal accentuar. Correcte si és del verb '\\1'.": ["Si es un sustantivo o adjetivo, debe llevar tilde. Es correcto si es una forma del verbo «\\1».", "If this is a noun or adjective, it needs an accent. It is correct if it is a form of the verb ‘\\1’."]
    ,"Si és un adjectiu cal accentuar. Correcte si és del v. '\\1'.": ["Si es un adjetivo, debe llevar tilde. Es correcto si es una forma del verbo «\\1».", "If this is an adjective, it needs an accent. It is correct if it is a form of the verb ‘\\1’."]
    ,"Si és adjectiu, s'ha d'accentuar. Correcte si és del v. '\\2'.": ["Si es un adjetivo, debe llevar tilde. Es correcto si es una forma del verbo «\\2».", "If this is an adjective, it needs an accent. It is correct if it is a form of the verb ‘\\2’."]
    ,"Si és un nom, s'ha d'accentuar. Correcte si és del v. 'aureolar'.": ["Si es un sustantivo, debe llevar tilde. Es correcto si es una forma del verbo «aureolar».", "If this is a noun, it needs an accent. It is correct if it is a form of the verb ‘aureolar’."]
    ,"Si és un nom, s'ha d'accentuar. Correcte si és una forma del verb 'renunciar'.": ["Si es un sustantivo, debe llevar tilde. Es correcto si es una forma del verbo «renunciar».", "If this is a noun, it needs an accent. It is correct if it is a form of the verb ‘renunciar’."]
    ,"Si és adjectiu, s'ha d'accentuar. Correcte si és del v. '\\1'.": ["Si es un adjetivo, debe llevar tilde. Es correcto si es una forma del verbo «\\1».", "If this is an adjective, it needs an accent. It is correct if it is a form of the verb ‘\\1’."]
    ,"Si és un nom, s'ha d'accentuar. Correcte si és del v. 'acidar'.": ["Si es un sustantivo, debe llevar tilde. Es correcto si es una forma del verbo «acidar».", "If this is a noun, it needs an accent. It is correct if it is a form of the verb ‘acidar’."]
    ,"Si és un adjectiu, s'ha d'accentuar.": ["Si es un adjetivo, debe llevar tilde.", "If this is an adjective, it needs an accent."]
    ,"Si és nom, s'ha d'accentuar. Correcte si és del v. 'regir'.": ["Si es un sustantivo, debe llevar tilde. Es correcto si es una forma del verbo «regir».", "If this is a noun, it needs an accent. It is correct if it is a form of the verb ‘regir’."]
    ,"Si és nom, s'ha d'accentuar. Correcte si és del v. 'formular'.": ["Si es un sustantivo, debe llevar tilde. Es correcto si es una forma del verbo «formular».", "If this is a noun, it needs an accent. It is correct if it is a form of the verb ‘formular’."]
    ,"Si és nom, s'ha d'accentuar. Correcte si és del v. 'nominar'.": ["Si es un sustantivo, debe llevar tilde. Es correcto si es una forma del verbo «nominar».", "If this is a noun, it needs an accent. It is correct if it is a form of the verb ‘nominar’."]
    ,"Si és adjectiu, s'ha d'accentuar. Correcte si és del v. 'ultimar'.": ["Si es un adjetivo, debe llevar tilde. Es correcto si es una forma del verbo «ultimar».", "If this is an adjective, it needs an accent. It is correct if it is a form of the verb ‘ultimar’."]
    ,"Si és un nom o un adjectiu, s'ha d'accentuar. Correcte si és del v. 'criticar'.": ["Si es un sustantivo o adjetivo, debe llevar tilde. Es correcto si es una forma del verbo «criticar».", "If this is a noun or adjective, it needs an accent. It is correct if it is a form of the verb ‘criticar’."]
    ,"Si és un adjectiu, s'ha d'accentuar. Correcte si és del v. 'autocriticar-se'.": ["Si es un adjetivo, debe llevar tilde. Es correcto si es una forma del verbo «autocriticar-se».", "If this is an adjective, it needs an accent. It is correct if it is a form of the verb ‘autocriticar-se’."]
    ,"Si és un nom, porta accent.": ["Si es un sustantivo, lleva tilde.", "If this is a noun, it takes an accent."]
    ,"Si és del v. 'provar', cal escriure __SUGGESTION_1__. Correcte si és l'adjectiu \"probe -a\" (que té probitat).": ["Si es una forma del verbo «provar», debe escribirse «{suggestion1}». Es correcto si se trata del adjetivo «probe -a» (que tiene probidad).", "If this is a form of ‘provar’, write ‘{suggestion1}’. It is correct if it is the adjective ‘probe -a’ (having probity)."]
    ,"Si és del v. 'gravar', cal escriure __SUGGESTION_1__. Correcte com a terme de geologia.": ["Si es una forma del verbo «gravar», debe escribirse «{suggestion1}». También es correcto como término de geología.", "If this is a form of ‘gravar’, write ‘{suggestion1}’. It is also correct as a geology term."]
    ,"Error de concordança entre el verb \"\\1\" i el pronom \"\\4\".": ["Error de concordancia entre el verbo «\\1» y el pronombre «\\4».", "Agreement error between the verb ‘\\1’ and the pronoun ‘\\4’."]
    ,"Si és del verb 'haver' s'escriu amb hac.": ["Si es una forma del verbo «haver», se escribe con hache.", "If this is a form of ‘haver’, it is written with an h."]
    ,"¿Volíeu dir __SUGGESTION_1__? Confusió entre la lletra ela minúscula i la lletra i majúscula.": ["¿Quería decir «{suggestion1}»? Se confunde la ele minúscula con la i mayúscula.", "Did you mean ‘{suggestion1}’? This confuses lowercase ‘l’ with uppercase ‘I’."]
    ,"Probablement cal un verb en subjuntiu.": ["Probablemente hace falta un verbo en subjuntivo.", "A subjunctive verb is probably needed."]
    ,"Probablement hi falta un adjectiu o un participi o una forma verbal diferent.": ["Probablemente falta un adjetivo, un participio u otra forma verbal.", "An adjective, a participle, or another verb form may be missing."]
    ,"En el sentit de 'per tant', cal dir __SUGGESTION_1__.": ["Con el sentido de «por tanto», debe decirse «{suggestion1}».", "To mean ‘therefore’, use ‘{suggestion1}’."]
    ,"L'expressió adequada és __SUGGESTION_1__, o bé reviseu la puntuació.": ["La expresión adecuada es «{suggestion1}»; también puede revisar la puntuación.", "The appropriate expression is ‘{suggestion1}’; alternatively, check the punctuation."]
    ,"¿Volíeu dir __SUGGESTION_1__? Correcte si vol dir \"de manera conseqüent, lògica\".": ["¿Quería decir «{suggestion1}»? La forma es correcta si significa «de manera consecuente, lógica».", "Did you mean ‘{suggestion1}’? The form is correct if it means ‘in a consistent, logical way’."]
    ,"Ús incorrecte com a verb transitiu.": ["Uso incorrecto como verbo transitivo.", "Incorrect use as a transitive verb."]
    ,"Verb no admès pels diccionaris normatius.": ["Verbo no recogido por los diccionarios normativos.", "Verb not accepted by normative dictionaries."]
    ,"Si és una locució adverbial i no un nom, s'escriu __SUGGESTION_1__ o __SUGGESTION_2__.": ["Si es una locución adverbial y no un sustantivo, se escribe «{suggestion1}» o «{suggestion2}».", "If this is an adverbial phrase rather than a noun, write ‘{suggestion1}’ or ‘{suggestion2}’."]
    ,"Forma antiga.": ["Forma antigua.", "Archaic form."]
    ,"Incorrecte si equival a 'fer conxorxa'. Correcte si és del v. 'conxar'.": ["Es incorrecto si significa «fer conxorxa». Es correcto si es una forma del verbo «conxar».", "Incorrect if it means ‘fer conxorxa’. Correct if it is a form of the verb ‘conxar’."]
    ,"La denominació recomanada és __SUGGESTION_1__ (en anglès \"America's Cup\").": ["La denominación recomendada es «{suggestion1}» (en inglés, «America's Cup»).", "The recommended name is ‘{suggestion1}’ (called the ‘America’s Cup’ in English)."]
    ,"Incorrecte en el sentit de 'sobtar, colpir, sorprendre'. \"Copsar\" té altre significats.": ["Es incorrecto con el sentido de «sobtar, colpir, sorprendre». «Copsar» tiene otros significados.", "It is incorrect in the sense of ‘sobtar, colpir, sorprendre’. ‘Copsar’ has other meanings."]
    ,"Paraula pròpia del llenguatge col·loquial.": ["Palabra propia del lenguaje coloquial.", "Colloquial word."]
    ,"¿Volíeu dir __SUGGESTION_1__? 'Cordura' existeix com a adjectiu (femení de 'cordur').": ["¿Quería decir «{suggestion1}»? «Cordura» existe como adjetivo (femenino de «cordur»).", "Did you mean ‘{suggestion1}’? ‘Cordura’ exists as an adjective (the feminine form of ‘cordur’)."]
    ,"¿Volíeu dir __SUGGESTION_1__? En minúscula és correcte com a nom d'una malaltia.": ["¿Quería decir «{suggestion1}»? En minúscula es correcto como nombre de una enfermedad.", "Did you mean ‘{suggestion1}’? In lowercase, it is correct as the name of a disease."]
    ,"Si és substantiu, cal dir __SUGGESTION_1__.": ["Si es un sustantivo, debe decirse «{suggestion1}».", "If this is a noun, use ‘{suggestion1}’."]
    ,"Aquesta expressió és un anglicisme prescindible.": ["Esta expresión es un anglicismo innecesario.", "This expression is an unnecessary anglicism."]
    ,"Calc del castellà. Useu una expressió alternativa.": ["Calco del castellano. Use una expresión alternativa.", "Calque from Spanish. Use an alternative expression."]
    ,"Useu l'expressió llatina completa (sense accent) o el nom adaptat (amb accent).": ["Use la expresión latina completa (sin tilde) o el nombre adaptado (con tilde).", "Use the full Latin expression (without an accent) or the adapted name (with an accent)."]
    ,"Expressió castellana. Considereu usar una locució alternativa.": ["Expresión castellana. Considere usar otra locución.", "Spanish expression. Consider using an alternative phrase."]
    ,"La preposició \"de\" és supèrflua. El \"de\" partitiu ja apareix darrere de \"altres\".": ["La preposición «de» es superflua. El «de» partitivo ya aparece después de «altres».", "The preposition ‘de’ is redundant. The partitive ‘de’ already appears after ‘altres’."]
    ,"Val més evitar aquesta construcció.": ["Es mejor evitar esta construcción.", "It is better to avoid this construction."]
    ,"Si representa una data d'octubre, cal escriure la lletra O, no el dígit 0 (zero).": ["Si representa una fecha de octubre, debe escribirse la letra O, no el dígito 0 (cero).", "If it represents an October date, use the letter O, not the digit 0 (zero)."]
    ,"En l'expressió d'una data, és preferible prescindir de la preposició 'a'.": ["Al expresar una fecha, es preferible prescindir de la preposición «a».", "When writing a date, it is preferable to omit the preposition ‘a’."]
    ,"En l'expressió d'una data, és preferible evitar la preposició 'a'.": ["Al expresar una fecha, es preferible evitar la preposición «a».", "When writing a date, it is preferable to avoid the preposition ‘a’."]
    ,"Gal·licisme només admès per alguns diccionaris. Considereu una opció alternativa.": ["Galicismo aceptado solo por algunos diccionarios. Considere una alternativa.", "Gallicism accepted by only some dictionaries. Consider an alternative."]
    ,"Referit a una dècada usem el singular.": ["Al referirse a una década, se usa el singular.", "Use the singular when referring to a decade."]
    ,"En aquest context cal usar el pronom de complement directe.": ["En este contexto debe usarse el pronombre de complemento directo.", "Use the direct object pronoun in this context."]
    ,"Construcció incorrecta. Feu servir la preposició 'a' o una expressió alternativa.": ["Construcción incorrecta. Use la preposición «a» u otra expresión.", "Incorrect construction. Use the preposition ‘a’ or an alternative expression."]
    ,"El v. 'delegar' és transitiu. Probablement cal fer la construcció sense la preposició 'en'.": ["El verbo «delegar» es transitivo. Probablemente debe construirse sin la preposición «en».", "The verb ‘delegar’ is transitive. It probably should be used without the preposition ‘en’."]
    ,"Aquesta expressió s'escriu en llatí sense adaptar.": ["Esta expresión se escribe en latín sin adaptar.", "This expression is written in Latin without adaptation."]
    ,"Aquest municipi s'escriu sense l'article 'el'.": ["Este municipio se escribe sin el artículo «el».", "This municipality’s name is written without the article ‘el’."]
    ,"En aquest context, és més adequat el verb 'demanar'. \"Demandar\" és un terme judicial.": ["En este contexto es más adecuado el verbo «demanar». «Demandar» es un término judicial.", "The verb ‘demanar’ is more appropriate here. ‘Demandar’ is a legal term."]
    ,"En aquest context, probablement cal usar una altra paraula. \"Demandar\" (=presentar una demanda) és un terme judicial.": ["En este contexto probablemente debe usarse otra palabra. «Demandar» (=presentar una demanda) es un término judicial.", "Another word is probably needed here. ‘Demandar’ (=to file a lawsuit) is a legal term."]
    ,"En registres formals val més dir __SUGGESTION_1__.": ["En registros formales es preferible decir «{suggestion1}».", "In formal contexts, ‘{suggestion1}’ is preferable."]
    ,"Com a locució adverbial cal escriure __SUGGESTION_1__ (aviat del matí).": ["Como locución adverbial debe escribirse «{suggestion1}» (temprano por la mañana).", "As an adverbial phrase, write ‘{suggestion1}’ (early in the morning)."]
    ,"En aquest context, cal dir __SUGGESTION_1__.": ["En este contexto debe decirse «{suggestion1}».", "Use ‘{suggestion1}’ in this context."]
    ,"Si és del verb 'anar', s'escriu __SUGGESTION_1__.": ["Si es una forma del verbo «anar», se escribe «{suggestion1}».", "If this is a form of ‘anar’, write ‘{suggestion1}’."]
    ,"Incorrecte en el sentit de __SUGGESTION_1__. \"Immediació\" existeix com a terme de dret civil.": ["Es incorrecto con el sentido de «{suggestion1}». «Immediació» existe como término de derecho civil.", "It is incorrect in the sense of ‘{suggestion1}’. ‘Immediació’ is a civil law term."]
    ,"Podeu fer més àgil el text dient simplement __SUGGESTION_1__ (locució adverbial).": ["Puede hacer el texto más ágil diciendo simplemente «{suggestion1}» (locución adverbial).", "You can make the text more concise by simply writing ‘{suggestion1}’ (adverbial phrase)."]
    ,"Si voleu indicar graus, useu el símbol __SUGGESTION_1__. Per a indicar ordinals, useu __SUGGESTION_2__ (sing.) o __SUGGESTION_3__ (pl.).": ["Para indicar grados, use el símbolo «{suggestion1}». Para los ordinales, use «{suggestion2}» (sing.) o «{suggestion3}» (pl.).", "Use the symbol ‘{suggestion1}’ for degrees. For ordinals, use ‘{suggestion2}’ (sing.) or ‘{suggestion3}’ (pl.)."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del v. 'menjar')? 'Mengo -a' és un adjectiu usat a les illes Balears.": ["¿Quería decir «{suggestion1}» (del verbo «menjar»)? «Mengo -a» es un adjetivo usado en las islas Baleares.", "Did you mean ‘{suggestion1}’ (from the verb ‘menjar’)? ‘Mengo -a’ is an adjective used in the Balearic Islands."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del verb 'fer')? Una \"ferla\" o \"canyaferla\" és una planta.": ["¿Quería decir «{suggestion1}» (del verbo «fer»)? Una «ferla» o «canyaferla» es una planta.", "Did you mean ‘{suggestion1}’ (from the verb ‘fer’)? A ‘ferla’ or ‘canyaferla’ is a plant."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del verb 'tenir')? Una \"tènia\" és el nom d'un cuc paràsit.": ["¿Quería decir «{suggestion1}» (del verbo «tenir»)? Una «tènia» es un gusano parásito.", "Did you mean ‘{suggestion1}’ (from the verb ‘tenir’)? A ‘tènia’ is a parasitic worm."]
    ,"¿Volíeu dir __SUGGESTION_1__ (espectacle o cecidi)? \"Gal·la\" vol dir \"gàl·lica, francesa\".": ["¿Quería decir «{suggestion1}» (espectáculo o cecidio)? «Gal·la» significa «gálica, francesa».", "Did you mean ‘{suggestion1}’ (a performance or a gall)? ‘Gal·la’ means ‘Gallic, French’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (terme de música)? Un \"tresillo\" és un joc de cartes o un conjunt de sofà i butaques.": ["¿Quería decir «{suggestion1}» (término musical)? Un «tresillo» es un juego de cartas o un conjunto de sofá y sillones.", "Did you mean ‘{suggestion1}’ (a musical term)? A ‘tresillo’ is a card game or a sofa-and-armchair set."]
    ,"¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__? \"Taler\" vol dir habitant de Tales (Plana Baixa).": ["¿Quería decir «{suggestion1}» o «{suggestion2}»? «Taler» significa habitante de Tales (Plana Baixa).", "Did you mean ‘{suggestion1}’ or ‘{suggestion2}’? ‘Taler’ means a resident of Tales (Plana Baixa)."]
    ,"¿Volíeu dir __SUGGESTION_1__? 'Estorar' vol dir 'posar estores, catifes'.": ["¿Quería decir «{suggestion1}»? «Estorar» significa «poner esteras o alfombras».", "Did you mean ‘{suggestion1}’? ‘Estorar’ means ‘to lay mats or rugs’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Assa\" és correcte com a nom d'una planta.": ["¿Quería decir «{suggestion1}»? «Assa» es correcto como nombre de una planta.", "Did you mean ‘{suggestion1}’? ‘Assa’ is correct as the name of a plant."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Ata\" és un gènere de formigues.": ["¿Quería decir «{suggestion1}»? «Ata» es un género de hormigas.", "Did you mean ‘{suggestion1}’? ‘Ata’ is a genus of ants."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Esmerç\" vol dir inversió de temps o diners.": ["¿Quería decir «{suggestion1}»? «Esmerç» significa inversión de tiempo o dinero.", "Did you mean ‘{suggestion1}’? ‘Esmerç’ means an investment of time or money."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Farola\" és sinònim de \"far\" (en terminologia marítima).": ["¿Quería decir «{suggestion1}»? «Farola» es sinónimo de «far» en terminología marítima.", "Did you mean ‘{suggestion1}’? ‘Farola’ is a maritime synonym for ‘far’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Gam\" és una patologia, sinònim de 'gamadura'.": ["¿Quería decir «{suggestion1}»? «Gam» es una patología, sinónimo de «gamadura».", "Did you mean ‘{suggestion1}’? ‘Gam’ is a medical condition, synonymous with ‘gamadura’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Maltret\" vol dir 'fatiga, treball'.": ["¿Quería decir «{suggestion1}»? «Maltret» significa «fatiga, trabajo».", "Did you mean ‘{suggestion1}’? ‘Maltret’ means ‘fatigue, work’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Ora\" vol dir 'oratge o ventet suau', o bé és una forma del verb 'orar'.": ["¿Quería decir «{suggestion1}»? «Ora» significa «brisa o viento suave», o es una forma del verbo «orar».", "Did you mean ‘{suggestion1}’? ‘Ora’ means ‘breeze or light wind’, or it is a form of the verb ‘orar’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Sentient\" i \"sentiència\" són termes de filosofia.": ["¿Quería decir «{suggestion1}»? «Sentient» y «sentiència» son términos filosóficos.", "Did you mean ‘{suggestion1}’? ‘Sentient’ and ‘sentiència’ are philosophical terms."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Tuït\" és el nom d'un ocell.": ["¿Quería decir «{suggestion1}»? «Tuït» es el nombre de un pájaro.", "Did you mean ‘{suggestion1}’? ‘Tuït’ is the name of a bird."]
    ,"¿Volíeu dir __SUGGESTION_1__? Correcte com a gerundi del v. 'desorbitar'.": ["¿Quería decir «{suggestion1}»? Es correcto como gerundio del verbo «desorbitar».", "Did you mean ‘{suggestion1}’? It is correct as the gerund of ‘desorbitar’."]
    ,"¿Volíeu dir __SUGGESTION_1__? Correcte si és del v. 'gamar-se'.": ["¿Quería decir «{suggestion1}»? Es correcto si es una forma del verbo «gamar-se».", "Did you mean ‘{suggestion1}’? It is correct if it is a form of ‘gamar-se’."]
    ,"¿Volíeu dir __SUGGESTION_1__? Correcte si és del v. 'lacrar'.": ["¿Quería decir «{suggestion1}»? Es correcto si es una forma del verbo «lacrar».", "Did you mean ‘{suggestion1}’? It is correct if it is a form of ‘lacrar’."]
    ,"¿Volíeu dir __SUGGESTION_1__? Exemples d'ús correcte de \"plànol\": un plànol de Xàtiva, un plànol del castell.": ["¿Quería decir «{suggestion1}»? Ejemplos del uso correcto de «plànol»: un plano de Xàtiva, un plano del castillo.", "Did you mean ‘{suggestion1}’? Correct examples of ‘plànol’: a town plan of Xàtiva or a plan of the castle."]
    ,"¿Volíeu dir __SUGGESTION_1__? Una \"erada\" és un terme agrícola o d'oficis referit a una era.": ["¿Quería decir «{suggestion1}»? «Erada» es un término agrícola o de oficios relacionado con una era.", "Did you mean ‘{suggestion1}’? ‘Erada’ is an agricultural or trade term referring to a threshing floor."]
    ,"¿Volíeu dir __SUGGESTION_1__? Una \"venta\" pot ser un hostal al País Valencià. Correcte si és del v. 'ventar'.": ["¿Quería decir «{suggestion1}»? «Venta» puede significar «posada» en el País Valenciano. También es correcto como forma del verbo «ventar».", "Did you mean ‘{suggestion1}’? ‘Venta’ can mean ‘inn’ in the Valencian Country. It is also correct as a form of ‘ventar’."]
    ,"\"Sonotone\" és una marca comercial. El nom comú apropiat és __SUGGESTION_1__.": ["«Sonotone» es una marca comercial. El nombre común adecuado es «{suggestion1}».", "‘Sonotone’ is a brand name. The appropriate generic term is ‘{suggestion1}’."]
    ,"Acceptat per alguns llibres d'estil com a lexicalització de __SUGGESTION_1__.": ["Algunos manuales de estilo lo aceptan como lexicalización de «{suggestion1}».", "Some style guides accept it as a lexicalized form of ‘{suggestion1}’."]
    ,"Amb el sentit de 'àmbit de discussió' cal dir __SUGGESTION_1__.": ["Con el sentido de «ámbito de discusión», debe decirse «{suggestion1}».", "To mean ‘area of discussion’, use ‘{suggestion1}’."]
    ,"Aquesta expressió es construeix amb __SUGGESTION_1__.": ["Esta expresión se construye con «{suggestion1}».", "This expression is formed with ‘{suggestion1}’."]
    ,"Aquesta locució és admissible amb el sentit de __SUGGESTION_1__, __SUGGESTION_2__, però en incorrecta en el sentit de __SUGGESTION_3__, __SUGGESTION_4__.": ["Esta locución es válida con el sentido de «{suggestion1}» o «{suggestion2}», pero no con el de «{suggestion3}» o «{suggestion4}».", "This phrase is acceptable in the sense of ‘{suggestion1}’ or ‘{suggestion2}’, but not in the sense of ‘{suggestion3}’ or ‘{suggestion4}’."]
    ,"Cal escriure __SUGGESTION_1__ o bé __SUGGESTION_2__.": ["Debe escribirse «{suggestion1}» o «{suggestion2}».", "Write ‘{suggestion1}’ or ‘{suggestion2}’."]
    ,"Caldria dir __SUGGESTION_1__ (probabilitat) o __SUGGESTION_2__ (obligació).": ["Debería decirse «{suggestion1}» (probabilidad) o «{suggestion2}» (obligación).", "Use ‘{suggestion1}’ (probability) or ‘{suggestion2}’ (obligation)."]
    ,"Com a adjectiu, __SUGGESTION_1__ és invariable.": ["Como adjetivo, «{suggestion1}» es invariable.", "As an adjective, ‘{suggestion1}’ is invariable."]
    ,"Com a expressió de temps, cal dir __SUGGESTION_1__.": ["Como expresión temporal, debe decirse «{suggestion1}».", "As a time expression, use ‘{suggestion1}’."]
    ,"Com a substantiu, cal dir __SUGGESTION_1__. \"Dubta\" pot ser una forma verbal del v. 'dubtar'.": ["Como sustantivo, debe decirse «{suggestion1}». «Dubta» también puede ser una forma del verbo «dubtar».", "As a noun, use ‘{suggestion1}’. ‘Dubta’ can also be a form of the verb ‘dubtar’."]
    ,"Combinació incorrecta de pronoms febles. ¿Volíeu dir __SUGGESTION_1__?": ["Combinación incorrecta de pronombres átonos. ¿Quería decir «{suggestion1}»?", "Incorrect combination of weak pronouns. Did you mean ‘{suggestion1}’?"]
    ,"Construcció incorrecta en el sentit de __SUGGESTION_1__. Si \"vaja\" és una interjecció, afegiu-hi una coma.": ["Construcción incorrecta con el sentido de «{suggestion1}». Si «vaja» es una interjección, añada una coma.", "Incorrect construction in the sense of ‘{suggestion1}’. If ‘vaja’ is an interjection, add a comma."]
    ,"En aquest context (\\1) cal dir __SUGGESTION_1__.": ["En este contexto (\\1) debe decirse «{suggestion1}».", "Use ‘{suggestion1}’ in this context (\\1)."]
    ,"En aquest context és més natural dir __SUGGESTION_1__.": ["En este contexto es más natural decir «{suggestion1}».", "In this context, ‘{suggestion1}’ sounds more natural."]
    ,"En aquest context sembla més adequat dir __SUGGESTION_1__.": ["En este contexto parece más adecuado decir «{suggestion1}».", "‘{suggestion1}’ seems more appropriate in this context."]
    ,"En aquest context, és preferible dir __SUGGESTION_1__.": ["En este contexto es preferible decir «{suggestion1}».", "In this context, it is preferable to say ‘{suggestion1}’."]
    ,"En aquesta expressió, el terme adequat és __SUGGESTION_1__.": ["En esta expresión, el término adecuado es «{suggestion1}».", "The appropriate term in this expression is ‘{suggestion1}’."]
    ,"En el context de jocs de cartes, cal dir __SUGGESTION_1__.": ["En el contexto de los juegos de cartas, debe decirse «{suggestion1}».", "In the context of card games, use ‘{suggestion1}’."]
    ,"En el sentit de 'preu, import, percentatge', cal dir __SUGGESTION_1__.": ["Con el sentido de «precio, importe o porcentaje», debe decirse «{suggestion1}».", "To mean ‘price, amount or percentage’, use ‘{suggestion1}’."]
    ,"En gastronomia cal dir __SUGGESTION_1__.": ["En gastronomía debe decirse «{suggestion1}».", "In gastronomy, use ‘{suggestion1}’."]
    ,"En un cartell, val més dir simplement __SUGGESTION_1__.": ["En un cartel, es mejor decir simplemente «{suggestion1}».", "On a sign, it is better to simply write ‘{suggestion1}’."]
    ,"És preferible dir __SUGGESTION_1__ (probabilitat) o __SUGGESTION_2__ (obligació).": ["Es preferible decir «{suggestion1}» (probabilidad) o «{suggestion2}» (obligación).", "Prefer ‘{suggestion1}’ (probability) or ‘{suggestion2}’ (obligation)."]
    ,"Està ben escrit (anglicisme) amb el sentit de __SUGGESTION_1__. Amb altres sentits cal escriure __SUGGESTION_2__.": ["Está bien escrito (anglicismo) con el sentido de «{suggestion1}». Con otros sentidos debe escribirse «{suggestion2}».", "This spelling is correct as an anglicism meaning ‘{suggestion1}’. For other meanings, write ‘{suggestion2}’."]
    ,"Expressió incorrecta si vol dir __SUGGESTION_1__ (una tela) o __SUGGESTION_2__ (taca a la pell).": ["La expresión es incorrecta si significa «{suggestion1}» (una tela) o «{suggestion2}» (una mancha en la piel).", "The expression is incorrect if it means ‘{suggestion1}’ (a fabric) or ‘{suggestion2}’ (a skin mark)."]
    ,"Expressió incorrecta si vol dir __SUGGESTION_1__. \"Siquiera\" és el femení de 'siquier'.": ["La expresión es incorrecta si significa «{suggestion1}». «Siquiera» es el femenino de «siquier».", "The expression is incorrect if it means ‘{suggestion1}’. ‘Siquiera’ is the feminine form of ‘siquier’."]
    ,"Expressió incorrecta si volíeu dir __SUGGESTION_1__.": ["La expresión es incorrecta si quería decir «{suggestion1}».", "The expression is incorrect if you meant ‘{suggestion1}’."]
    ,"Expressió incorrecta. ¿Volíeu dir __SUGGESTION_1__?": ["Expresión incorrecta. ¿Quería decir «{suggestion1}»?", "Incorrect expression. Did you mean ‘{suggestion1}’?"]
    ,"Formalment, cal escriure __SUGGESTION_1__ o alguna combinació amb '-los'.": ["En un registro formal, debe escribirse «{suggestion1}» o una combinación con «-los».", "In formal writing, use ‘{suggestion1}’ or a form ending in ‘-los’."]
    ,"La forma femenina s'escriu amb accent.": ["La forma femenina lleva tilde.", "The feminine form takes an accent."]
    ,"La grafia correcta és __SUGGESTION_1__.": ["La grafía correcta es «{suggestion1}».", "The correct spelling is ‘{suggestion1}’."]
    ,"La locució que denota equivalència o aclariment s'escriu __SUGGESTION_1__.": ["La locución que expresa equivalencia o aclaración se escribe «{suggestion1}».", "The phrase expressing equivalence or clarification is written ‘{suggestion1}’."]
    ,"La major part dels llibres d'estil recomanen escriure __SUGGESTION_1__.": ["La mayoría de los manuales de estilo recomiendan escribir «{suggestion1}».", "Most style guides recommend writing ‘{suggestion1}’."]
    ,"Llenguatge col·loquial. Té diferents significats segons el context: __SUGGESTION_1__ (com a adjectiu), __SUGGESTION_2__ (vestit de feina), __SUGGESTION_3__. Inadmissible amb el sentit de __SUGGESTION_4__.": ["Uso coloquial. Tiene distintos significados según el contexto: «{suggestion1}» (como adjetivo), «{suggestion2}» (ropa de trabajo) y «{suggestion3}». No se admite con el sentido de «{suggestion4}».", "Colloquial usage. Its meaning varies by context: ‘{suggestion1}’ (as an adjective), ‘{suggestion2}’ (work clothes), or ‘{suggestion3}’. It is not accepted in the sense of ‘{suggestion4}’."]
    ,"Possible confusió. ¿Volíeu dir __SUGGESTION_1__? \"Noma\" és el nom d'una malaltia poc freqüent.": ["Posible confusión. ¿Quería decir «{suggestion1}»? «Noma» es el nombre de una enfermedad poco frecuente.", "Possible confusion. Did you mean ‘{suggestion1}’? ‘Noma’ is the name of an uncommon disease."]
    ,"Probablement és més adequat dir __SUGGESTION_1__.": ["Probablemente es más adecuado decir «{suggestion1}».", "‘{suggestion1}’ is probably more appropriate."]
    ,"Referit a cartes, cal dir __SUGGESTION_1__.": ["Al referirse a cartas, debe decirse «{suggestion1}».", "When referring to cards, use ‘{suggestion1}’."]
    ,"Si és adjectiu, cal dir __SUGGESTION_1__.": ["Si es un adjetivo, debe decirse «{suggestion1}».", "If this is an adjective, use ‘{suggestion1}’."]
    ,"Si és del verb 'tenir', cal escriure __SUGGESTION_1__.": ["Si es una forma del verbo «tenir», debe escribirse «{suggestion1}».", "If this is a form of ‘tenir’, write ‘{suggestion1}’."]
    ,"Si és un imperatiu, cal escriure __SUGGESTION_1__.": ["Si es un imperativo, debe escribirse «{suggestion1}».", "If this is an imperative, write ‘{suggestion1}’."]
    ,"Si és un substantiu, cal dir __SUGGESTION_1__. Correcte si és del v. 'comptar'.": ["Si es un sustantivo, debe decirse «{suggestion1}». Es correcto si es una forma del verbo «comptar».", "If this is a noun, use ‘{suggestion1}’. It is correct if it is a form of ‘comptar’."]
    ,"Si és una afirmació, cal escriure __SUGGESTION_1__.": ["Si se trata de una afirmación, debe escribirse «{suggestion1}».", "If this is an affirmative statement, write ‘{suggestion1}’."]
    ,"Temps verbal incorrecte en una frase condicional. ¿Volíeu dir __SUGGESTION_1__?": ["Tiempo verbal incorrecto en una oración condicional. ¿Quería decir «{suggestion1}»?", "Incorrect verb tense in a conditional sentence. Did you mean ‘{suggestion1}’?"]
    ,"Useu __SUGGESTION_1__ (nom comú), o bé __SUGGESTION_2__ (marca).": ["Use «{suggestion1}» como nombre común, o «{suggestion2}» si se refiere a la marca.", "Use ‘{suggestion1}’ as the common noun, or ‘{suggestion2}’ for the brand."]
    ,"Useu __SUGGESTION_1__ com a gentilici o __SUGGESTION_2__ com a nom de lloc.": ["Use «{suggestion1}» como gentilicio o «{suggestion2}» como topónimo.", "Use ‘{suggestion1}’ as a demonym or ‘{suggestion2}’ as a place name."]
    ,"Useu __SUGGESTION_1__ en l'estructura \"del A al B\".": ["Use «{suggestion1}» en la estructura «del A al B».", "Use ‘{suggestion1}’ in the ‘del A al B’ construction."]
    ,"Useu __SUGGESTION_1__ o __SUGGESTION_2__ (noms comuns), o bé __SUGGESTION_3__ (marca).": ["Use «{suggestion1}» o «{suggestion2}» como nombres comunes, o «{suggestion3}» si se refiere a la marca.", "Use ‘{suggestion1}’ or ‘{suggestion2}’ as common nouns, or ‘{suggestion3}’ for the brand."]
    ,"¿Esteu segur que volíeu dir \"\\1\"? \"Custodir\" és un verb antic poc usual.": ["¿Seguro que quería decir «\\1»? «Custodir» es un verbo antiguo y poco frecuente.", "Are you sure you meant ‘\\1’? ‘Custodir’ is an archaic, uncommon verb."]
    ,"¿Esteu segur que volíeu dir \"\\1\"? \"Gabar\" és un verb antic poc usual que vol dir 'lloar'.": ["¿Seguro que quería decir «\\1»? «Gabar» es un verbo antiguo y poco frecuente que significa «alabar».", "Are you sure you meant ‘\\1’? ‘Gabar’ is an archaic, uncommon verb meaning ‘to praise’."]
    ,"¿Esteu segur que volíeu dir \"\\1\"? \"Transir\" és un verb poc usual.": ["¿Seguro que quería decir «\\1»? «Transir» es un verbo poco frecuente.", "Are you sure you meant ‘\\1’? ‘Transir’ is an uncommon verb."]
    ,"¿Volíeu dir __SUGGESTION_1__ (=escàndol) o __SUGGESTION_2__ (=corba)? \"Revol\" és un sinònim infreqüent de \"revolada\".": ["¿Quería decir «{suggestion1}» (=escándalo) o «{suggestion2}» (=curva)? «Revol» es un sinónimo poco frecuente de «revolada».", "Did you mean ‘{suggestion1}’ (=scandal) or ‘{suggestion2}’ (=curve)? ‘Revol’ is an uncommon synonym of ‘revolada’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (=solament) o __SUGGESTION_2__ (=sense companyia)? És correcte si equival a __SUGGESTION_3__.": ["¿Quería decir «{suggestion1}» (=solamente) o «{suggestion2}» (=sin compañía)? Es correcto si equivale a «{suggestion3}».", "Did you mean ‘{suggestion1}’ (=only) or ‘{suggestion2}’ (=alone)? It is correct if it means ‘{suggestion3}’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (addició)? \"Summa\" vol dir \"recopilació\" o bé és el femení de l'adjectiu \"summe\".": ["¿Quería decir «{suggestion1}» (adición)? «Summa» significa «recopilación» o es el femenino del adjetivo «summe».", "Did you mean ‘{suggestion1}’ (addition)? ‘Summa’ means ‘collection’ or is the feminine form of the adjective ‘summe’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (adj.)? \"\\1\" és participi del v. 'espènyer'.": ["¿Quería decir «{suggestion1}» (adjetivo)? «\\1» es un participio del verbo «espènyer».", "Did you mean ‘{suggestion1}’ (adjective)? ‘\\1’ is a participle of the verb ‘espènyer’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (adj.)? \"Penitenciaria\", més infreqüent, pot ser el nom d'un càrrec o un establiment.": ["¿Quería decir «{suggestion1}» (adjetivo)? «Penitenciaria», menos frecuente, puede ser el nombre de un cargo o de un establecimiento.", "Did you mean ‘{suggestion1}’ (adjective)? ‘Penitenciaria’, less common, may refer to an office or institution."]
    ,"¿Volíeu dir __SUGGESTION_1__ (adjectiu, femení de 'llis')? \"Llissa\" és el nom d'un peix.": ["¿Quería decir «{suggestion1}» (adjetivo, femenino de «llis»)? «Llissa» es el nombre de un pez.", "Did you mean ‘{suggestion1}’ (feminine adjective form of ‘llis’)? ‘Llissa’ is the name of a fish."]
    ,"¿Volíeu dir __SUGGESTION_1__ (adjectiu, femení plural de 'llis')? \"Llissa\" és el nom d'un peix.": ["¿Quería decir «{suggestion1}» (adjetivo, femenino plural de «llis»)? «Llissa» es el nombre de un pez.", "Did you mean ‘{suggestion1}’ (feminine plural adjective form of ‘llis’)? ‘Llissa’ is the name of a fish."]
    ,"¿Volíeu dir __SUGGESTION_1__ (adjectiu)? \"Danyí\" és una forma del verb 'danyar' (jo danyí o vaig danyar, ell danyí o va danyar).": ["¿Quería decir «{suggestion1}» (adjetivo)? «Danyí» es una forma del verbo «danyar» (yo dañé o había dañado; él dañó o había dañado).", "Did you mean ‘{suggestion1}’ (adjective)? ‘Danyí’ is a form of ‘danyar’ (I damaged or had damaged; he/she damaged or had damaged)."]
    ,"¿Volíeu dir __SUGGESTION_1__ (adjectiu)? Correcte si és el plural d'Europa (menys freqüent).": ["¿Quería decir «{suggestion1}» (adjetivo)? Es correcto si es el plural de «Europa», aunque es menos frecuente.", "Did you mean ‘{suggestion1}’ (adjective)? It is correct as the less common plural of ‘Europa’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (adverbi)? \"Encare\" pot ser una forma verbal del verb 'encarar'.": ["¿Quería decir «{suggestion1}» (adverbio)? «Encare» también puede ser una forma del verbo «encarar».", "Did you mean ‘{suggestion1}’ (adverb)? ‘Encare’ can also be a form of the verb ‘encarar’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (amb intenció, a propòsit)? \"Intensió, intensional\" són termes especialitzats de lògica.": ["¿Quería decir «{suggestion1}» (con intención, a propósito)? «Intensió» e «intensional» son términos especializados de lógica.", "Did you mean ‘{suggestion1}’ (intentionally, on purpose)? ‘Intensió’ and ‘intensional’ are specialist terms in logic."]
    ,"¿Volíeu dir __SUGGESTION_1__ (antònim d'utopia)? \"Distòpia\" és un terme mèdic.": ["¿Quería decir «{suggestion1}» (antónimo de «utopía»)? «Distòpia» es un término médico.", "Did you mean ‘{suggestion1}’ (the opposite of utopia)? ‘Distòpia’ is a medical term."]
    ,"¿Volíeu dir __SUGGESTION_1__ (béns; quantitat de fluid)? \"Caval\" vol dir 'relatiu a la vena cava'.": ["¿Quería decir «{suggestion1}» (bienes; cantidad de fluido)? «Caval» significa «relativo a la vena cava».", "Did you mean ‘{suggestion1}’ (goods; a quantity of fluid)? ‘Caval’ means ‘relating to the vena cava’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (cantó, extrem)? \"Bora\" té altres sentits molt més infreqüents.": ["¿Quería decir «{suggestion1}» (lado, extremo)? «Bora» tiene otros significados mucho menos frecuentes.", "Did you mean ‘{suggestion1}’ (side, edge)? ‘Bora’ has other, much less common meanings."]
    ,"¿Volíeu dir __SUGGESTION_1__ (catalitzador)? \"Encim\" és una forma del verb 'encimar'.": ["¿Quería decir «{suggestion1}» (catalizador)? «Encim» es una forma del verbo «encimar».", "Did you mean ‘{suggestion1}’ (catalyst)? ‘Encim’ is a form of the verb ‘encimar’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (color)? \"Grog\" és el nom d'una beguda.": ["¿Quería decir «{suggestion1}» (color)? «Grog» es el nombre de una bebida.", "Did you mean ‘{suggestion1}’ (colour)? ‘Grog’ is the name of a drink."]
    ,"¿Volíeu dir __SUGGESTION_1__ (color)? \"Lienal\" és un terme mèdic.": ["¿Quería decir «{suggestion1}» (color)? «Lienal» es un término médico.", "Did you mean ‘{suggestion1}’ (colour)? ‘Lienal’ is a medical term."]
    ,"¿Volíeu dir __SUGGESTION_1__ (contrari de 'ple')? Correcte si és el número 8.": ["¿Quería decir «{suggestion1}» (lo contrario de «lleno»)? Es correcto si se refiere al número 8.", "Did you mean ‘{suggestion1}’ (the opposite of ‘full’)? It is correct if it refers to the number 8."]
    ,"¿Volíeu dir __SUGGESTION_1__ (davant d'un adjectiu)? És correcte si acompanya un nom en plural.": ["¿Quería decir «{suggestion1}» (delante de un adjetivo)? Es correcto si acompaña a un sustantivo en plural.", "Did you mean ‘{suggestion1}’ (before an adjective)? It is correct when modifying a plural noun."]
    ,"¿Volíeu dir __SUGGESTION_1__ (de dues llengües)? \"Bilingues\" és el plural de \"bilinga\" (nom d'un arbre).": ["¿Quería decir «{suggestion1}» (de dos idiomas)? «Bilingues» es el plural de «bilinga», nombre de un árbol.", "Did you mean ‘{suggestion1}’ (in two languages)? ‘Bilingues’ is the plural of ‘bilinga’, a tree name."]
    ,"¿Volíeu dir __SUGGESTION_1__ (de Suïssa)? \"Suïs\" és una forma del verb 'suar'.": ["¿Quería decir «{suggestion1}» (de Suiza)? «Suïs» es una forma del verbo «suar».", "Did you mean ‘{suggestion1}’ (from Switzerland)? ‘Suïs’ is a form of the verb ‘suar’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del v. 'bastar')? \"Vasta\" significa 'dilatada, àmplia'.": ["¿Quería decir «{suggestion1}» (del verbo «bastar»)? «Vasta» significa «extensa, amplia».", "Did you mean ‘{suggestion1}’ (from the verb ‘bastar’)? ‘Vasta’ means ‘extensive, broad’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del v. 'emetre')? \"Emes\" pot ser el plural de la lletra ema.": ["¿Quería decir «{suggestion1}» (del verbo «emetre»)? «Emes» también puede ser el plural de la letra eme.", "Did you mean ‘{suggestion1}’ (from the verb ‘emetre’)? ‘Emes’ can also be the plural of the letter M."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del v. 'esperar')? \"\\1\" és una forma del v. 'esperesar'.": ["¿Quería decir «{suggestion1}» (del verbo «esperar»)? «\\\\1» es una forma del verbo «esperesar».", "Did you mean ‘{suggestion1}’ (from the verb ‘esperar’)? ‘\\\\1’ is a form of the verb ‘esperesar’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del v. 'estar')? Si no, useu el demostratiu reforçat: __SUGGESTION_2__.": ["¿Quería decir «{suggestion1}» (del verbo «estar»)? Si no, use el demostrativo reforzado «{suggestion2}».", "Did you mean ‘{suggestion1}’ (from the verb ‘estar’)? Otherwise, use the reinforced demonstrative ‘{suggestion2}’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del v. 'respondre')? \"Respòs\" és un nom amb altres significats.": ["¿Quería decir «{suggestion1}» (del verbo «respondre»)? «Respòs» es un sustantivo con otros significados.", "Did you mean ‘{suggestion1}’ (from the verb ‘respondre’)? ‘Respòs’ is a noun with other meanings."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del v. 'tancar')? Una 'tenca' és un substantiu amb altres significats.": ["¿Quería decir «{suggestion1}» (del verbo «tancar»)? «Tenca» es un sustantivo con otros significados.", "Did you mean ‘{suggestion1}’ (from the verb ‘tancar’)? ‘Tenca’ is a noun with other meanings."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del v. 'tornar')? \"Tornès\" existeix com a nom i adjectiu.": ["¿Quería decir «{suggestion1}» (del verbo «tornar»)? «Tornès» también existe como sustantivo y adjetivo.", "Did you mean ‘{suggestion1}’ (from the verb ‘tornar’)? ‘Tornès’ also exists as a noun and adjective."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del verb 'estar')? \"Eta\" és el nom d'una lletra grega, i __SUGGESTION_2__ és el nom d'un gas.": ["¿Quería decir «{suggestion1}» (del verbo «estar»)? «Eta» es el nombre de una letra griega y «{suggestion2}» es el nombre de un gas.", "Did you mean ‘{suggestion1}’ (from the verb ‘estar’)? ‘Eta’ is the name of a Greek letter, and ‘{suggestion2}’ is the name of a gas."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del verb 'fer')? \"Fen\" és una forma del verb 'fendre'.": ["¿Quería decir «{suggestion1}» (del verbo «fer»)? «Fen» es una forma del verbo «fendre».", "Did you mean ‘{suggestion1}’ (from the verb ‘fer’)? ‘Fen’ is a form of the verb ‘fendre’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (del verb 'fer')? \"Ferme\" és una forma del verb 'fermar'.": ["¿Quería decir «{suggestion1}» (del verbo «fer»)? «Ferme» es una forma del verbo «fermar».", "Did you mean ‘{suggestion1}’ (from the verb ‘fer’)? ‘Ferme’ is a form of the verb ‘fermar’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (desvestit)? \"Nuu\" (nom femení) vol dir \"núvol\" i s'usa en llenguatge poètic.": ["¿Quería decir «{suggestion1}» (sin ropa)? «Nuu» (sustantivo femenino) significa «nube» y se usa en lenguaje poético.", "Did you mean ‘{suggestion1}’ (without clothes)? ‘Nuu’ (feminine noun) means ‘cloud’ and is used in poetic language."]
    ,"¿Volíeu dir __SUGGESTION_1__ (dispositiu semblant al làser)? \"Maser\" és correcte com a sinònims de \"masover\".": ["¿Quería decir «{suggestion1}» (dispositivo parecido al láser)? «Maser» es correcto como sinónimo de «masover».", "Did you mean ‘{suggestion1}’ (a device similar to a laser)? ‘Maser’ is correct as a synonym of ‘masover’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (distribució en hores)? \"Orari\" és un mocador o una estola.": ["¿Quería decir «{suggestion1}» (distribución horaria)? «Orari» es un pañuelo o una estola.", "Did you mean ‘{suggestion1}’ (a schedule)? ‘Orari’ is a scarf or stole."]
    ,"Si és un adjectiu, s'ha d'accentuar. Correcte si és del v. '\\1'.": ["Si es un adjetivo, debe llevar tilde. Es correcto si es una forma del verbo «\\\\1».", "If this is an adjective, it needs an accent. It is correct if it is a form of the verb ‘\\\\1’."]
    ,"¿Volíeu dir __SUGGESTION_1__? 'Cotxos' pot ser el plural de 'cotx' (porc).": ["¿Quería decir «{suggestion1}»? «Cotxos» puede ser el plural de «cotx» (cerdo).", "Did you mean ‘{suggestion1}’? ‘Cotxos’ can be the plural of ‘cotx’ (pig)."]
    ,"Referit als seguidors del FC Barcelona, cal escriure __SUGGESTION_1__.": ["Para referirse a los seguidores del FC Barcelona, debe escribirse «{suggestion1}».", "When referring to FC Barcelona supporters, write ‘{suggestion1}’."]
    ,"Si és una forma del verb 'custodiar', s'escriu sense accent.": ["Si es una forma del verbo «custodiar», se escribe sin tilde.", "If this is a form of the verb ‘custodiar’, it is written without an accent."]
    ,"Referit a \"\\\\1\", el gènere adequat del possessiu és el masculí.": ["Con «\\\\1», el posesivo adecuado es el masculino.", "With ‘\\\\1’, the possessive should be masculine."]
    ,"¿Volíeu dir __SUGGESTION_1__? El v. 'dar' sol usar-se només en expressions fossilitzades.": ["¿Quería decir «{suggestion1}»? El verbo «dar» suele usarse solo en expresiones fosilizadas.", "Did you mean ‘{suggestion1}’? The verb ‘dar’ is usually used only in fixed expressions."]
    ,"El v. 'dar' sol usar-se només en expressions fossilitzades.": ["El verbo «dar» suele usarse solo en expresiones fosilizadas.", "The verb ‘dar’ is usually used only in fixed expressions."]
    ,"Cal escriure __SUGGESTION_1__ o __SUGGESTION_2__. \"Darrera\" només és correcte si equival a 'última'.": ["Debe escribirse «{suggestion1}» o «{suggestion2}». «Darrera» solo es correcto con el sentido de «última».", "Write ‘{suggestion1}’ or ‘{suggestion2}’. ‘Darrera’ is correct only in the sense of ‘last’."]
    ,"Si representa una data, val més escriure __SUGGESTION_1__ per a evitar confusions.": ["Si representa una fecha, es preferible escribir «{suggestion1}» para evitar confusiones.", "If it represents a date, write ‘{suggestion1}’ to avoid ambiguity."]
    ,"Ha començat un any nou. ¿Volíeu dir __SUGGESTION_1__?": ["Ha empezado un nuevo año. ¿Quería decir «{suggestion1}»?", "A new year has begun. Did you mean ‘{suggestion1}’?"]
    ,"¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__? \"Davants\" pot ser un nom masculí plural, però és infreqüent.": ["¿Quería decir «{suggestion1}» o «{suggestion2}»? «Davants» puede ser un sustantivo masculino plural, pero es poco frecuente.", "Did you mean ‘{suggestion1}’ or ‘{suggestion2}’? ‘Davants’ can be a masculine plural noun, but it is uncommon."]
    ,"Per a indicar anys o dècades la 's' és innecessària, i és preferible escriure-ho amb lletres.": ["Para indicar años o décadas, la «s» es innecesaria; es preferible escribirlos con letras.", "For years or decades, the ‘s’ is unnecessary; it is preferable to write them out."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Decà\" (menys usual) s'usa en astronomia i química.": ["¿Quería decir «{suggestion1}»? «Decà» (menos usual) se emplea en astronomía y química.", "Did you mean ‘{suggestion1}’? ‘Decà’ (less common) is used in astronomy and chemistry."]
    ,"La forma correcta de plural és __SUGGESTION_1__.": ["La forma correcta del plural es «{suggestion1}».", "The correct plural form is ‘{suggestion1}’."]
    ,"El nom adequat és __SUGGESTION_1__.": ["El nombre adecuado es «{suggestion1}».", "The appropriate name is ‘{suggestion1}’."]
    ,"En aquest context, és més adequat usar el v. 'demanar'. \"Demandar\" és un terme judicial.": ["En este contexto es más adecuado usar el verbo «demanar». «Demandar» es un término judicial.", "The verb ‘demanar’ is more appropriate here. ‘Demandar’ is a legal term."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Demés\" és correcte quan equival a \"a més d'això\", però poc usual.": ["¿Quería decir «{suggestion1}»? «Demés» es correcto con el sentido de «además de eso», aunque es poco frecuente.", "Did you mean ‘{suggestion1}’? ‘Demés’ is correct when it means ‘besides that’, but it is uncommon."]
    ,"Arcaisme. Val més usar un altre verb.": ["Arcaísmo. Es preferible usar otro verbo.", "Archaic form. It is better to use another verb."]
    ,"\"\\\\2\" és un gerundi. Caldria un nom, un adjectiu o un participi.": ["«\\\\2» es un gerundio. Aquí se necesita un sustantivo, un adjetivo o un participio.", "‘\\\\2’ is a gerund. A noun, adjective, or participle is needed here."]
    ,"Si és un adjectiu (i no un gerundi), cal escriure __SUGGESTION_1__.": ["Si es un adjetivo (y no un gerundio), debe escribirse «{suggestion1}».", "If this is an adjective rather than a gerund, write ‘{suggestion1}’."]
    ,"Possible confusió. És correcte com a forma secundària del v. 'aprendre'.": ["Posible confusión. Es correcto como forma secundaria del verbo «aprendre».", "Possible confusion. It is correct as a secondary form of the verb ‘aprendre’."]
    ,"Correcte si és del v. 'desaforar'. En altres sentits, es considera antic.": ["Es correcto si es una forma del verbo «desaforar». Con otros sentidos, se considera arcaico.", "Correct if it is a form of the verb ‘desaforar’. It is considered archaic in other senses."]
    ,"Es pot usar aquesta paraula quan ens referim a la política econòmica del franquisme en cursiva o entre cometes.": ["Esta palabra puede usarse para referirse a la política económica del franquismo, en cursiva o entre comillas.", "This word may be used for the economic policy of Francoism when set in italics or quotation marks."]
    ,"Correcte en el sentit de 'desordenar els cabells'. Incorrecte en altres sentits.": ["Es correcto con el sentido de «desordenar el cabello». Es incorrecto con otros sentidos.", "Correct in the sense of ‘to tousle someone’s hair’. Incorrect in other senses."]
    ,"Val més usar una altra paraula. Existeix com a terme tècnic en neurologia (Termcat).": ["Es preferible usar otra palabra. La forma existe como término técnico de neurología (Termcat).", "Use another word. This form exists as a technical neurology term (Termcat)."]
    ,"\"\\\\1\" sols pot ser adjectiu. Com a nom, digueu __SUGGESTION_1__.": ["«\\\\1» solo puede ser un adjetivo. Como sustantivo, use «{suggestion1}».", "‘\\\\1’ can only be an adjective. As a noun, use ‘{suggestion1}’."]
    ,"\"Content\" és un adjectiu. Com a substantiu val més usar altres paraules.": ["«Content» es un adjetivo. Como sustantivo, es preferible usar otras palabras.", "‘Content’ is an adjective. As a noun, it is better to use a different word."]
    ,"S'escriu separat i cal apostrofar.": ["Se escribe separado y debe llevar apóstrofo.", "Write it separately and use an apostrophe."]
    ,"Paraula no admesa per tots els diccionaris en el sentit de __SUGGESTION_1__.": ["Palabra no aceptada por todos los diccionarios con el sentido de «{suggestion1}».", "Not accepted by all dictionaries in the sense of ‘{suggestion1}’."]
    ,"Paraula pròpia del llenguatge col·loquial, només admesa per alguns diccionaris.": ["Palabra coloquial, aceptada solo por algunos diccionarios.", "Colloquial word, accepted by only some dictionaries."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Desguàs\" és l'acció de treure aigua o el lloc per on ix l'aigua.": ["¿Quería decir «{suggestion1}»? «Desguàs» es la acción de evacuar agua o el lugar por donde sale.", "Did you mean ‘{suggestion1}’? ‘Desguàs’ is the act of draining water or the place where it flows out."]
    ,"Incorrecte si volíeu dir __SUGGESTION_1__.": ["Es incorrecto si quería decir «{suggestion1}».", "Incorrect if you meant ‘{suggestion1}’."]
    ,"Paraula admesa només en alguns diccionaris. És inapropiat en el sentit de 'fer fora de la feina'.": ["Palabra aceptada solo por algunos diccionarios. No es adecuada con el sentido de «despedir del trabajo».", "Accepted by only some dictionaries. It is inappropriate in the sense of ‘to dismiss someone from a job’."]
    ,"Possible confusió. ¿Volíeu dir __SUGGESTION_1__ (més tard) o __SUGGESTION_2__ (del v. 'desprendre'). \"\\\\1\" és el participi del v. 'despendre' (gastar).": ["Posible confusión. ¿Quería decir «{suggestion1}» (más tarde) o «{suggestion2}» (del verbo «desprendre»)? «\\\\1» es el participio del verbo «despendre» (gastar).", "Possible confusion. Did you mean ‘{suggestion1}’ (later) or ‘{suggestion2}’ (from the verb ‘desprendre’)? ‘\\\\1’ is the participle of ‘despendre’ (to spend)."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Despiste\" és una forma verbal valenciana del v. 'despistar'.": ["¿Quería decir «{suggestion1}»? «Despiste» es una forma verbal valenciana del verbo «despistar».", "Did you mean ‘{suggestion1}’? ‘Despiste’ is a Valencian verb form of ‘despistar’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Despistes\" és una forma verbal del v. 'despistar'.": ["¿Quería decir «{suggestion1}»? «Despistes» es una forma verbal del verbo «despistar».", "Did you mean ‘{suggestion1}’? ‘Despistes’ is a verb form of ‘despistar’."]
    ,"El participi del verb 'desprendre' s'escriu amb accent.": ["El participio del verbo «desprendre» lleva tilde.", "The past participle of ‘desprendre’ takes an accent."]
    ,"Possible calc de l'anglès. Probablement es pot eliminar sense alterar el significat de la frase.": ["Posible calco del inglés. Probablemente puede eliminarse sin alterar el sentido de la frase.", "Possible calque from English. It can probably be removed without changing the sentence’s meaning."]
    ,"Combinació probablement incorrecta de determinants.": ["Probablemente es una combinación incorrecta de determinantes.", "This is probably an incorrect combination of determiners."]
    ,"El determinant 'cada' ha d'acompanyar un nom en singular.": ["El determinante «cada» debe acompañar a un sustantivo en singular.", "The determiner ‘cada’ must modify a singular noun."]
    ,"Referit a \"\\1\", el gènere adequat del possessiu és el masculí.": ["Con «\\1», el posesivo adecuado es el masculino.", "With ‘\\1’, the possessive should be masculine."]
    ,"\"\\2\" és un gerundi. Caldria un nom, un adjectiu o un participi.": ["\" \\2 \" es un gerundio. Aquí se necesita un sustantivo, un adjetivo o un participio.", "‘\\2’ is a gerund. A noun, adjective, or participle is needed here."]
    ,"\"\\1\" sols pot ser adjectiu. Com a nom, digueu __SUGGESTION_1__.": ["\" \\1 \" solo puede ser un adjetivo. Como sustantivo, use «{suggestion1}».", "‘\\1’ can only be an adjective. As a noun, use ‘{suggestion1}’."]
    ,"Possible confusió. ¿Volíeu dir __SUGGESTION_1__ (més tard) o __SUGGESTION_2__ (del v. 'desprendre'). \"\\1\" és el participi del v. 'despendre' (gastar).": ["Posible confusión. ¿Quería decir «{suggestion1}» (más tarde) o «{suggestion2}» (del verbo «desprendre»)? «\\1» es el participio del verbo «despendre» (gastar).", "Possible confusion. Did you mean ‘{suggestion1}’ (later) or ‘{suggestion2}’ (from the verb ‘desprendre’)? ‘\\1’ is the participle of ‘despendre’ (to spend)."]
    ,"Amb el sentit de 'tothom', cal escriure __SUGGESTION_1__.": ["Con el sentido de «todo el mundo», debe escribirse «{suggestion1}».", "To mean ‘everyone’, write ‘{suggestion1}’."]
    ,"¿Volíeu dir \"Déu\" (ésser suprem)?": ["¿Quería decir «Déu» (ser supremo)?", "Did you mean ‘Déu’ (the supreme being)?"]
    ,"Si és una forma del verb 'deure' s'escriu sense accent. \"Déu\" amb accent vol dir 'divinitat' o 'ésser suprem'.": ["Si es una forma del verbo «deure», se escribe sin tilde. «Déu», con tilde, significa «divinidad» o «ser supremo».", "If this is a form of the verb ‘deure’, it is written without an accent. ‘Déu’, with an accent, means ‘deity’ or ‘supreme being’."]
    ,"Val més usar __SUGGESTION_1__ o __SUGGESTION_2__. \"De ben segur\" és una barreja de les dues locucions.": ["Es preferible usar «{suggestion1}» o «{suggestion2}». «De ben segur» es una mezcla de las dos expresiones.", "Use ‘{suggestion1}’ or ‘{suggestion2}’. ‘De ben segur’ is a blend of the two expressions."]
    ,"Si és un article personal masculí, cal apostrofar. Correcte si és una preposició.": ["If it is a masculine personal article, use an apostrophe. It is correct if it is a preposition.", "Si es un artículo personal masculino, debe apostrofarse. Es correcto si es una preposición."]
    ,"Combinació probablement incorrecta.": ["Probablemente es una combinación incorrecta.", "This is probably an incorrect combination."]
    ,"S'escriu preferentment amb apòstrof.": ["Se escribe preferentemente con apóstrofo.", "It is preferably written with an apostrophe."]
    ,"Construcció incorrecta, si no equival a \"del qual\" o a \"de quina cosa\".": ["Construcción incorrecta si no equivale a «del cual» o «de qué cosa».", "Incorrect construction unless it means ‘which’ or ‘what’."]
    ,"Construcció probablement incorrecta. Només és correcta si equival a \"del qual\".": ["Construcción probablemente incorrecta. Solo es correcta si equivale a «del cual».", "Probably incorrect construction. It is correct only if it means ‘which’."]
    ,"La construcció adequada és __SUGGESTION_1__.": ["La construcción adecuada es «{suggestion1}».", "The appropriate construction is ‘{suggestion1}’."]
    ,"Locució admesa només pel DNV, no per altres diccionaris.": ["Locución aceptada solo por el DNV, no por otros diccionarios.", "Phrase accepted only by the DNV, not by other dictionaries."]
    ,"Hi sobra l'accent diacrític (segons les normes noves).": ["Sobra la tilde diacrítica según las normas actuales.", "The diacritic accent is unnecessary under the current rules."]
    ,"Si és del verb 'dir', cal escriure \"deia\".": ["If it is a form of the verb «dir», write «deia».", "Si es una forma del verbo «dir», debe escribirse «deia»."]
    ,"S'escriu amb accent perquè és una afirmació.": ["Se escribe con tilde porque es una afirmación.", "It takes an accent because it is an affirmative statement."]
    ,"Els dies de la setmana s'escriuen en minúscula, excepte si formen part d'un nom propi.": ["Los días de la semana se escriben en minúscula, salvo si forman parte de un nombre propio.", "Days of the week are written in lowercase unless they are part of a proper name."]
    ,"\"Diferència\" és un nom femení.": ["\"Diferència\" es un sustantivo femenino.", "\"Diferència\" is a feminine noun."]
    ,"Si és nom, \"diferència\" s'escriu amb accent i és femení.": ["Si es un sustantivo, «diferència» lleva tilde y es femenino.", "If it is a noun, ‘diferència’ takes an accent and is feminine."]
    ,"Possible confusió. \"Difós\" és el participi del verb 'difondre'. \"Difús\" vol dir 'imprecís, poc clar'.": ["Posible confusión. «Difós» es el participio del verbo «difondre». «Difús» significa «impreciso, poco claro».", "Possible confusion. ‘Difós’ is the participle of ‘difondre’. ‘Difús’ means ‘imprecise, unclear’."]
    ,"¿Volíeu dir \"dialecte\" o \"delicte\"? \"Dilecte\" és un adjectiu que vol dir \"estimat\".": ["¿Quería decir «dialecte» o «delicte»? «Dilecte» es un adjetivo que significa «amado».", "Did you mean ‘dialecte’ or ‘delicte’? ‘Dilecte’ is an adjective meaning ‘beloved’."]
    ,"¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__? \"Dinal\" és una paraula d'ús poc habitual.": ["¿Quería decir «{suggestion1}» o «{suggestion2}»? «Dinal» es una palabra poco habitual.", "Did you mean ‘{suggestion1}’ or ‘{suggestion2}’? ‘Dinal’ is an uncommon word."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Dinal\" és una paraula d'ús poc habitual.": ["¿Quería decir «{suggestion1}»? «Dinal» es una palabra poco habitual.", "Did you mean ‘{suggestion1}’? ‘Dinal’ is an uncommon word."]
    ,"Normalment s'usa en plural.": ["Normalmente se usa en plural.", "It is usually used in the plural."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Dins de\" és apropiat si l'acció s'esdevé en qualsevol moment abans que s'acabi el període assenyalat.": ["¿Quería decir «{suggestion1}»? «Dins de» es apropiado si la acción tiene lugar en cualquier momento antes de que termine el período indicado.", "Did you mean ‘{suggestion1}’? ‘Dins de’ is appropriate if the action takes place at any time before the stated period ends."]
    ,"Hi falta el pronom feble 'ho'.": ["Falta el pronombre átono «ho».", "The weak pronoun ‘ho’ is missing."]
    ,"Combinació col·loquial de pronoms. Formalment cal escriure <suggestion>-li-ho</suggestion>.": ["Combinación coloquial de pronombres. En un registro formal debe escribirse «-li-ho».", "Colloquial pronoun combination. In formal writing, use ‘-li-ho’."]
    ,"'Dispar' sols pot ser adjectiu. Com a nom, cal dir <suggestion>\\1</suggestion>.": ["'Dispar' solo puede ser un adjetivo. Como sustantivo, debe decirse «\\1».", "‘Dispar’ can only be an adjective. As a noun, use ‘\\1’."]
    ,"Sovint s'abusa d'aquest nom per influència de l'anglès. Considereu una opció alternativa.": ["A menudo se abusa de este sustantivo por influencia del inglés. Considere una alternativa.", "This noun is often overused under English influence. Consider an alternative."]
    ,"Amb valor comparatiu val més dir <suggestion>\\1 de</suggestion>. Correcte si equival a \"\\1 en\".": ["Con valor comparativo es preferible decir «\\1 de». Es correcto si equivale a «\\1 en».", "For comparison, ‘\\1 de’ is preferable. The form is correct if it means ‘\\1 en’."]
    ,"El participi 'dit' davant del nom ha d'anar precedit d'article.": ["El participio «dit», delante de un sustantivo, debe ir precedido de un artículo.", "The participle ‘dit’ must be preceded by an article when it comes before a noun."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"dl\" pot ser una abreviatura (decilitre, dilluns).": ["¿Quería decir «{suggestion1}»? «dl» puede ser una abreviatura de decilitro o lunes.", "Did you mean ‘{suggestion1}’? ‘dl’ can be an abbreviation for decilitre or Monday."]
    ,"Aquesta negació és probablement redundant amb el verb '\\1'.": ["Esta negación probablemente es redundante con el verbo «\\1».", "This negative is probably redundant with the verb ‘\\1’."]
    ,"El nom oficial actual és diferent.": ["El nombre oficial actual es distinto.", "The current official name is different."]
    ,"¿Volíeu dir __SUGGESTION_1__? '\\1' vol dir 'dolor anímic, pena'.": ["¿Quería decir «{suggestion1}»? «\\1» significa «dolor anímico, pena».", "Did you mean ‘{suggestion1}’? ‘\\1’ means ‘emotional pain, sorrow’."]
    ,"¿Volíeu dir __SUGGESTION_1__? Dolores és un municipi valencià.": ["¿Quería decir «{suggestion1}»? Dolores es un municipio valenciano.", "Did you mean ‘{suggestion1}’? Dolores is a Valencian municipality."]
    ,"Val més usar una altra expressió. \"Don\" pot ser un tractament honorífic històric.": ["Es preferible usar otra expresión. «Don» puede ser un tratamiento honorífico histórico.", "Use a different expression. ‘Don’ can be a historical honorific title."]
    ,"Possible confusió. \"Don\" pot ser un tractament honorífic històric o el nom d'un riu rus.": ["Posible confusión. «Don» puede ser un tratamiento honorífico histórico o el nombre de un río ruso.", "Possible confusion. ‘Don’ can be a historical honorific or the name of a Russian river."]
    ,"Possible confusió. Probablement sobra un pronom.": ["Posible confusión. Probablemente sobra un pronombre.", "Possible confusion. A pronoun is probably unnecessary."]
    ,"Cal dir \"donar l'abast\" en el sentit de 'abastar a fer una tasca'. \"Donar abast\" és correcte en el sentit de 'abastar, proveir' (d'alguna cosa).": ["Debe decirse «donar l'abast» con el sentido de «tener capacidad para realizar una tarea». «Donar abast» es correcto con el sentido de «suministrar» algo.", "Use ‘donar l'abast’ to mean ‘to manage to do a task’. ‘Donar abast’ is correct in the sense of supplying something."]
    ,"En aquest context, val més fer servir el verb 'agafar'.": ["En este contexto, es preferible usar el verbo «agafar».", "In this context, it is better to use the verb ‘agafar’."]
    ,"\"Donar-se compte\" és una expressió incorrecta si equival a <suggestion>adonar-se</suggestion>; és correcta si vol dir 'retre compte'.": ["\"Donar-se compte\" es incorrecto si significa «adonar-se»; es correcto si significa «rendir cuentas».", "'Donar-se compte’ is incorrect if it means ‘adonar-se’; it is correct if it means ‘to render an account’."]
    ,"Expressió incorrecta. Cal eliminar la preposició 'de' o substituir-la per 'a'.": ["Expresión incorrecta. Elimine la preposición «de» o sustitúyala por «a».", "Incorrect expression. Remove the preposition ‘de’ or replace it with ‘a’."]
    ,"Expressió incorrecta. Cal eliminar la preposició 'de'.": ["Expresión incorrecta. Debe eliminarse la preposición «de».", "Incorrect expression. The preposition ‘de’ should be removed."]
    ,"En aquest context cal usar un altre verb.": ["En este contexto debe usarse otro verbo.", "Use a different verb in this context."]
    ,"En aquest context probablement cal usar un altre verb.": ["En este contexto probablemente debe usarse otro verbo.", "A different verb is probably needed in this context."]
    ,"El verb 'fer' no és adequat en aquesta expressió.": ["El verbo «fer» no es adecuado en esta expresión.", "The verb ‘fer’ is not appropriate in this expression."]
    ,"En aquest context, el verb més adequat és 'donar'.": ["En este contexto, el verbo más adecuado es «donar».", "The verb ‘donar’ is more appropriate in this context."]
    ,"En aquest context és més apropiat usar el verb 'fer'.": ["En este contexto es más adecuado usar el verbo «fer».", "The verb ‘fer’ is more appropriate in this context."]
    ,"L'expressió adequada és 'tocar el sol'.": ["La expresión adecuada es «tocar el sol».", "The appropriate expression is ‘tocar el sol’."]
    ,"El verb adequat és 'tocar'.": ["El verbo adecuado es «tocar».", "The appropriate verb is ‘tocar’."]
    ,"El verb adequat en aquesta expressió és 'tocar'.": ["El verbo adecuado en esta expresión es «tocar».", "The appropriate verb in this expression is ‘tocar’."]
    ,"Expressió incorrecta en sentit figurat.": ["Expresión incorrecta en sentido figurado.", "Incorrect expression in the figurative sense."]
    ,"Incorrecte si equival a \"perquè\" (valor causal). Correcte si equival a \"per tant\" o indica continuació.": ["Es incorrecto si equivale a «perquè» con valor causal. Es correcto si equivale a «per tant» o indica continuación.", "Incorrect if it means ‘perquè’ (causal). Correct if it means ‘per tant’ or indicates continuation."]
    ,"Incorrecte si equival a \"perquè\" (valor causal). Correcte si equival a \"per tant\" o indica continuació. Potser hi manquen comes al voltant.": ["Es incorrecto si equivale a «perquè» con valor causal. Es correcto si equivale a «per tant» o indica continuación. Quizá falten comas alrededor.", "Incorrect if it means ‘perquè’ (causal). Correct if it means ‘per tant’ or indicates continuation. Commas may be needed around it."]
    ,"Correcte si equival a \"orada\" (nom d'un peix). Incorrecte si equival a l'adjectiu <suggestion>\\1</suggestion>.": ["Es correcto si equivale a «orada» (nombre de un pez). Es incorrecto si equivale al adjetivo «\\1».", "Correct if it means ‘orada’ (a fish). Incorrect if it is the adjective ‘\\1’."]
    ,"Cal escriure-ho en minúscula, excepte si forma part d'un nom propi.": ["Debe escribirse en minúscula, salvo si forma parte de un nombre propio.", "Write it in lowercase unless it is part of a proper name."]
    ,"¿Volíeu dir __SUGGESTION_1__ (facultat de comunicar, manera d'expressar) o __SUGGESTION_2__ (peix)? \"Llenguat\" és una classe de formatge.": ["¿Quería decir «{suggestion1}» (facultad de comunicarse, forma de expresarse) o «{suggestion2}» (pez)? «Llenguat» es una variedad de queso.", "Did you mean ‘{suggestion1}’ (ability to communicate, way of expressing oneself) or ‘{suggestion2}’ (fish)? ‘Llenguat’ is a type of cheese."]
    ,"¿Volíeu dir __SUGGESTION_1__ (físic i divulgador científic anglès)? \"Stephen Hawkins\" és una altra persona.": ["¿Quería decir «{suggestion1}» (físico y divulgador científico inglés)? «Stephen Hawkins» es otra persona.", "Did you mean ‘{suggestion1}’ (the English physicist and science communicator)? ‘Stephen Hawkins’ is a different person."]
    ,"¿Volíeu dir __SUGGESTION_1__ (forma del verb 'lluir') o __SUGGESTION_2__ (nom propi de persona)? \"Lluïs\" també és una forma del verb 'lluir', però menys habitual.": ["¿Quería decir «{suggestion1}» (forma del verbo «lluir») o «{suggestion2}» (nombre propio)? «Lluïs» también es una forma de «lluir», pero menos habitual.", "Did you mean ‘{suggestion1}’ (a form of ‘lluir’) or ‘{suggestion2}’ (a person’s name)? ‘Lluïs’ is also a form of ‘lluir’, but less common."]
    ,"¿Volíeu dir __SUGGESTION_1__ (gentilici)? Correcte com a forma del v. 'xinar'.": ["¿Quería decir «{suggestion1}» (gentilicio)? También es correcto como forma del verbo «xinar».", "Did you mean ‘{suggestion1}’ (demonym)? It is also correct as a form of the verb ‘xinar’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (gerundi)? \"\\1\" no es correspon amb la varietat seleccionada (central).": ["¿Quería decir «{suggestion1}» (gerundio)? «\\1» no corresponde a la variedad seleccionada (central).", "Did you mean ‘{suggestion1}’ (gerund)? ‘\\1’ does not match the selected variety (Central Catalan)."]
    ,"¿Volíeu dir __SUGGESTION_1__ (impost) i __SUGGESTION_2__ (quarta, en xifres romanes)? Els ordinals romans no necessiten la terminació d'ordinal.": ["¿Quería decir «{suggestion1}» (impuesto) y «{suggestion2}» (cuarta, en números romanos)? Los ordinales romanos no necesitan la terminación ordinal.", "Did you mean ‘{suggestion1}’ (tax) and ‘{suggestion2}’ (fourth, in Roman numerals)? Roman ordinals do not need an ordinal suffix."]
    ,"¿Volíeu dir __SUGGESTION_1__ (li=a ell/a ella/a això)? \"Sé\" amb accent és una forma del v. 'saber'.": ["¿Quería decir «{suggestion1}» (li = a él/a ella/a eso)? «Sé», con tilde, es una forma del verbo «saber».", "Did you mean ‘{suggestion1}’ (li = to him/her/it)? ‘Sé’, with an accent, is a form of the verb ‘saber’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (li=a ell/a ella/a això)? És correcte (rarament) si \"hi\" representa una circumstància de lloc, de manera o altres.": ["¿Quería decir «{suggestion1}» (li = a él/a ella/a eso)? Es correcto (aunque raro) si «hi» expresa lugar, manera u otra circunstancia.", "Did you mean ‘{suggestion1}’ (li = to him/her/it)? It is correct (though rare) if ‘hi’ refers to place, manner, or another circumstance."]
    ,"¿Volíeu dir __SUGGESTION_1__ (mínim) o __SUGGESTION_2__? El símbol \"min\" (minuts) s'usa darrere de la xifra.": ["¿Quería decir «{suggestion1}» (mínimo) o «{suggestion2}»? El símbolo «min» (minutos) se escribe después de la cifra.", "Did you mean ‘{suggestion1}’ (minimum) or ‘{suggestion2}’? The symbol ‘min’ (minutes) follows the number."]
    ,"¿Volíeu dir __SUGGESTION_1__ (nom de país)? La paraula \"holanda\" existeix amb altres sentits poc freqüents.": ["¿Quería decir «{suggestion1}» (nombre de país)? «Holanda» existe con otros sentidos poco frecuentes.", "Did you mean ‘{suggestion1}’ (country name)? ‘Holanda’ exists with other, uncommon meanings."]
    ,"¿Volíeu dir __SUGGESTION_1__ (nom de persona)? \"Sonia\" pot ser un nom propi en castellà o un nom tècnic ('percepció subjectiva de la intensitat d'un so').": ["¿Quería decir «{suggestion1}» (nombre de persona)? «Sonia» puede ser un nombre propio en español o un término técnico («percepción subjetiva de la intensidad de un sonido»).", "Did you mean ‘{suggestion1}’ (a person’s name)? ‘Sonia’ can be a Spanish given name or a technical term (‘subjective perception of sound intensity’)."]
    ,"¿Volíeu dir __SUGGESTION_1__ (nom de persona)? \"Sonia\" pot ser un nom propi en castellà.": ["¿Quería decir «{suggestion1}» (nombre de persona)? «Sonia» puede ser un nombre propio en español.", "Did you mean ‘{suggestion1}’ (a person’s name)? ‘Sonia’ can be a Spanish given name."]
    ,"¿Volíeu dir __SUGGESTION_1__ (nom de persona)? En minúscula és el nom d'una moneda històrica.": ["¿Quería decir «{suggestion1}» (nombre de persona)? En minúscula es el nombre de una moneda histórica.", "Did you mean ‘{suggestion1}’ (a person’s name)? In lowercase, it is the name of a historical coin."]
    ,"¿Volíeu dir __SUGGESTION_1__ (nom propi de persona)? \"Lluïs\" és una forma del verb 'lluir'.": ["¿Quería decir «{suggestion1}» (nombre propio de persona)? «Lluïs» es una forma del verbo «lluir».", "Did you mean ‘{suggestion1}’ (a person’s proper name)? ‘Lluïs’ is a form of the verb ‘lluir’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (nom)? 'Fondo' sol ser adjectiu o adverbi. Pot ser correcte com a substantiu en geografia.": ["¿Quería decir «{suggestion1}» (sustantivo)? «Fondo» suele ser adjetivo o adverbio. Puede ser correcto como sustantivo en geografía.", "Did you mean ‘{suggestion1}’ (noun)? ‘Fondo’ is usually an adjective or adverb. It can be correct as a geographical noun."]
    ,"¿Volíeu dir __SUGGESTION_1__ (nom)? \"Sacrament\" pot ser un adverbi amb el significat de 'de manera sacra'.": ["¿Quería decir «{suggestion1}» (sustantivo)? «Sacrament» puede ser un adverbio con el significado de «de manera sacra».", "Did you mean ‘{suggestion1}’ (noun)? ‘Sacrament’ can be an adverb meaning ‘in a sacred manner’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (numeral)? \"Dugues\" pot ser una forma valenciana del verb 'dur'.": ["¿Quería decir «{suggestion1}» (numeral)? «Dugues» puede ser una forma valenciana del verbo «dur».", "Did you mean ‘{suggestion1}’ (numeral)? ‘Dugues’ can be a Valencian form of the verb ‘dur’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (òrgan vegetal; mineral)? \"Gema\" és acceptable en gastronomia (pastís de rovell d'ou).": ["¿Quería decir «{suggestion1}» (órgano vegetal; mineral)? «Gema» se acepta en gastronomía para un pastel de yema de huevo.", "Did you mean ‘{suggestion1}’ (plant organ; mineral)? ‘Gema’ is accepted in gastronomy for a cake made with egg yolk."]
    ,"¿Volíeu dir __SUGGESTION_1__ (pa i mescla)? \"Entrapà\" és una forma del v. 'entrapar'.": ["¿Quería decir «{suggestion1}» (pan y mezcla)? «Entrapà» es una forma del verbo «entrapar».", "Did you mean ‘{suggestion1}’ (bread and filling)? ‘Entrapà’ is a form of the verb ‘entrapar’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (país dels Balcans)? \"Sèrvia\" existeix com a nom de lloc i de persona amb altres sentits.": ["¿Quería decir «{suggestion1}» (país de los Balcanes)? «Sèrvia» existe como topónimo y nombre de persona con otros sentidos.", "Did you mean ‘{suggestion1}’ (a Balkan country)? ‘Sèrvia’ also exists as a place name and a personal name."]
    ,"¿Volíeu dir __SUGGESTION_1__ (país)? En minúscula és una pell usada per a fer guants.": ["¿Quería decir «{suggestion1}» (país)? En minúscula es un tipo de piel usado para hacer guantes.", "Did you mean ‘{suggestion1}’ (country)? In lowercase, it is a type of leather used to make gloves."]
    ,"¿Volíeu dir __SUGGESTION_1__ (peix)? \"\\1\" pot ser una forma del v. 'remoldre'.": ["¿Quería decir «{suggestion1}» (pez)? «\\1» puede ser una forma del verbo «remoldre».", "Did you mean ‘{suggestion1}’ (fish)? ‘\\1’ can be a form of the verb ‘remoldre’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (persona retinguda) o __SUGGESTION_2__ (biologia)? Correcte en el sentit de 'allotjament'.": ["¿Quería decir «{suggestion1}» (persona retenida) o «{suggestion2}» (biología)? Es correcto con el sentido de «alojamiento».", "Did you mean ‘{suggestion1}’ (a detained person) or ‘{suggestion2}’ (biology)? It is correct in the sense of ‘accommodation’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (persones retingudes) o __SUGGESTION_2__ (biologia)? Correcte en el sentit de 'allotjaments'.": ["¿Quería decir «{suggestion1}» (personas retenidas) o «{suggestion2}» (biología)? Es correcto con el sentido de «alojamientos».", "Did you mean ‘{suggestion1}’ (detained people) or ‘{suggestion2}’ (biology)? It is correct in the sense of ‘accommodation’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (poc probable, poc versemblant)? 'Improvable' vol dir 'que no pot ser provat, demostrat'.": ["¿Quería decir «{suggestion1}» (poco probable, poco verosímil)? «Improvable» significa «que no se puede probar o demostrar».", "Did you mean ‘{suggestion1}’ (unlikely, improbable)? ‘Improvable’ means ‘that cannot be proved or demonstrated’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (preposició)? \"Entra\" és una forma del verb 'entrar'.": ["¿Quería decir «{suggestion1}» (preposición)? «Entra» es una forma del verbo «entrar».", "Did you mean ‘{suggestion1}’ (preposition)? ‘Entra’ is a form of the verb ‘entrar’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (preposició)? \"Ha\" pot ser una forma del verb 'haver' o un símbol per a escriure 'hectàrea'.": ["¿Quería decir «{suggestion1}» (preposición)? «Ha» puede ser una forma del verbo «haver» o el símbolo de hectárea.", "Did you mean ‘{suggestion1}’ (preposition)? ‘Ha’ can be a form of ‘haver’ or the symbol for hectare."]
    ,"¿Volíeu dir __SUGGESTION_1__ (que té acceptació general)? \"Boga\" és correcte en altres sentits.": ["¿Quería decir «{suggestion1}» (de aceptación general)? «Boga» es correcto con otros sentidos.", "Did you mean ‘{suggestion1}’ (widely accepted)? ‘Boga’ is correct with other meanings."]
    ,"¿Volíeu dir __SUGGESTION_1__ (referit a un flotador, una armilla, un bot)?.": ["¿Quería decir «{suggestion1}» (en referencia a un flotador, un chaleco o una embarcación)?", "Did you mean ‘{suggestion1}’ (referring to a float, life jacket, or boat)?"]
    ,"¿Volíeu dir __SUGGESTION_1__ (refusar l'obediència)? \"Revelar\" és correcte amb el sentit de 'mostrar, fer conèixer'.": ["¿Quería decir «{suggestion1}» (negarse a obedecer)? «Revelar» es correcto con el sentido de «mostrar, dar a conocer».", "Did you mean ‘{suggestion1}’ (to refuse obedience)? ‘Revelar’ is correct in the sense of ‘to show, to reveal’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (representació excessiva)? En aquest cas, s'escriu junt.": ["¿Quería decir «{suggestion1}» (representación excesiva)? En este caso se escribe junto.", "Did you mean ‘{suggestion1}’ (excessive representation)? In this case, it is written as one word."]
    ,"¿Volíeu dir __SUGGESTION_1__ (sensació auditiva) o __SUGGESTION_2__ (v. 'ser')? \"Só\" és una variant antiga de 'sóc'.": ["¿Quería decir «{suggestion1}» (sensación auditiva) o «{suggestion2}» (del verbo «ser»)? «Só» es una variante antigua de «sóc».", "Did you mean ‘{suggestion1}’ (auditory sensation) or ‘{suggestion2}’ (from the verb ‘ser’)? ‘Só’ is an old variant of ‘sóc’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (substantiu)? Correcte si correspon a l'adjectiu 'ratoner -a'.": ["¿Quería decir «{suggestion1}» (sustantivo)? Es correcto si corresponde al adjetivo «ratoner -a».", "Did you mean ‘{suggestion1}’ (noun)? It is correct if it corresponds to the adjective ‘ratoner -a’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (tela)? \"\\1\" és una classe de baga o llaç.": ["¿Quería decir «{suggestion1}» (tejido)? «\\1» es un tipo de lazada o lazo.", "Did you mean ‘{suggestion1}’ (fabric)? ‘\\1’ is a type of loop or bow."]
    ,"¿Volíeu dir __SUGGESTION_1__ (topònim)? Si és un adjectiu, es pot escriure en minúscula.": ["¿Quería decir «{suggestion1}» (topónimo)? Si es un adjetivo, puede escribirse en minúscula.", "Did you mean ‘{suggestion1}’ (place name)? If it is an adjective, it can be written in lowercase."]
    ,"¿Volíeu dir __SUGGESTION_1__ (tots dos)? \"Ambos\" és una paraula d'ús infreqüent en jocs i loteries.": ["¿Quería decir «{suggestion1}» (ambos)? «Ambos» es una palabra de uso poco frecuente en juegos y loterías.", "Did you mean ‘{suggestion1}’ (both)? ‘Ambos’ is an uncommon word used in games and lotteries."]
    ,"¿Volíeu dir __SUGGESTION_1__ (ús més comú)? \"Senyalar\" és només fer o posar un senyal.": ["¿Quería decir «{suggestion1}» (uso más común)? «Senyalar» significa únicamente hacer o poner una señal.", "Did you mean ‘{suggestion1}’ (more common use)? ‘Senyalar’ means only to make or place a sign."]
    ,"¿Volíeu dir __SUGGESTION_1__ (usos més comuns)? \"Senyalar\" és només fer o posar un senyal.": ["¿Quería decir «{suggestion1}» (usos más comunes)? «Senyalar» significa únicamente hacer o poner una señal.", "Did you mean ‘{suggestion1}’ (most common uses)? ‘Senyalar’ means only to make or place a sign."]
    ,"¿Volíeu dir __SUGGESTION_1__ (v. 'bolcar')? Els volques són una antiga tribu gal·la.": ["¿Quería decir «{suggestion1}» (del verbo «bolcar»)? Los volques eran una antigua tribu gala.", "Did you mean ‘{suggestion1}’ (from the verb ‘bolcar’)? The Volcae were an ancient Gallic tribe."]
    ,"¿Volíeu dir __SUGGESTION_1__ (vas sanguini)? \"\\1\" és la qualitat o l'acte d'un arter o arterós.": ["¿Quería decir «{suggestion1}» (vaso sanguíneo)? «\\1» es la cualidad o acción de un «arter» o «arterós».", "Did you mean ‘{suggestion1}’ (blood vessel)? ‘\\1’ is the quality or action of an ‘arter’ or ‘arterós’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (verb 'haver')? Correcte si sé del verb 'aviar'.": ["¿Quería decir «{suggestion1}» (verbo «haver»)? Es correcto si es una forma de «aviar».", "Did you mean ‘{suggestion1}’ (the verb ‘haver’)? It is correct if it is a form of ‘aviar’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (verb 'veure') o __SUGGESTION_2__? \"La vist\" és possible en valencià amb el sentit de \"la vesteix\".": ["¿Quería decir «{suggestion1}» (del verbo «veure») o «{suggestion2}»? «La vist» es posible en valenciano con el sentido de «la viste».", "Did you mean ‘{suggestion1}’ (from the verb ‘veure’) or ‘{suggestion2}’? ‘La vist’ is possible in Valencian meaning ‘dresses her’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (vestit de feina)? També pot ser una paraula col·loquial amb el sentit de __SUGGESTION_2__.": ["¿Quería decir «{suggestion1}» (ropa de trabajo)? También puede ser una palabra coloquial con el sentido de «{suggestion2}».", "Did you mean ‘{suggestion1}’ (work clothes)? It can also be a colloquial word meaning ‘{suggestion2}’."]
    ,"¿Volíeu dir __SUGGESTION_1__ (volta, canvi, passejada)? \"Tom\" vol dir 'volum, part d'una obra impresa'.": ["¿Quería decir «{suggestion1}» (vuelta, cambio, paseo)? «Tom» significa «volumen, parte de una obra impresa».", "Did you mean ‘{suggestion1}’ (turn, change, stroll)? ‘Tom’ means ‘volume, part of a printed work’."]
    ,"¿Volíeu dir __SUGGESTION_1__ en comptes de \"\\1 \\2\"? En qualsevol cas, no és recomanable barrejar xifres i lletres.": ["¿Quería decir «{suggestion1}» en lugar de «\\1 \\2»? En cualquier caso, no se recomienda mezclar cifras y letras.", "Did you mean ‘{suggestion1}’ instead of ‘\\1 \\2’? In any case, mixing digits and letters is not recommended."]
    ,"¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__ (afirmació)?.": ["¿Quería decir «{suggestion1}» o «{suggestion2}» (afirmación)?", "Did you mean ‘{suggestion1}’ or ‘{suggestion2}’ (affirmation)?"]
    ,"¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__ (del verb 'fer')? \"Fen\" és una forma del verb 'fendre'.": ["¿Quería decir «{suggestion1}» o «{suggestion2}» (del verbo «fer»)? «Fen» es una forma del verbo «fendre».", "Did you mean ‘{suggestion1}’ or ‘{suggestion2}’ (from the verb ‘fer’)? ‘Fen’ is a form of the verb ‘fendre’."]
    ,"¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__ (v. 'bolcar')? Els volques són una tribu antiga gal·la.": ["¿Quería decir «{suggestion1}» o «{suggestion2}» (del verbo «bolcar»)? Los volques eran una antigua tribu gala.", "Did you mean ‘{suggestion1}’ or ‘{suggestion2}’ (from the verb ‘bolcar’)? The Volcae were an ancient Gallic tribe."]
    ,"¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__? 'Tin' és una forma valenciana del v. 'tenir'.": ["¿Quería decir «{suggestion1}» o «{suggestion2}»? «Tin» es una forma valenciana del verbo «tenir».", "Did you mean ‘{suggestion1}’ or ‘{suggestion2}’? ‘Tin’ is a Valencian form of the verb ‘tenir’."]
    ,"¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__? \"Partes\" és el femení plural de \"part parta\" (de la Pàrtia).": ["¿Quería decir «{suggestion1}» o «{suggestion2}»? «Partes» es el femenino plural de «part parta», de Partia.", "Did you mean ‘{suggestion1}’ or ‘{suggestion2}’? ‘Partes’ is the feminine plural of ‘part parta’ (from Parthia)."]
    ,"¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__? \"Pugues\" és una forma verbal valenciana.": ["¿Quería decir «{suggestion1}» o «{suggestion2}»? «Pugues» es una forma verbal valenciana.", "Did you mean ‘{suggestion1}’ or ‘{suggestion2}’? ‘Pugues’ is a Valencian verb form."]
    ,"¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__? \"Quine\" pot ser un nom propi.": ["¿Quería decir «{suggestion1}» o «{suggestion2}»? «Quine» puede ser un nombre propio.", "Did you mean ‘{suggestion1}’ or ‘{suggestion2}’? ‘Quine’ may be a proper name."]
    ,"¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__? \"Revolt\" vol dir \"corba\".": ["¿Quería decir «{suggestion1}» o «{suggestion2}»? «Revolt» significa «curva».", "Did you mean ‘{suggestion1}’ or ‘{suggestion2}’? ‘Revolt’ means ‘curve’."]
    ,"¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__? \"Revolt\" vol dir \"corba\". \"Revol\" és un sinònim infreqüent de \"revolada\".": ["¿Quería decir «{suggestion1}» o «{suggestion2}»? «Revolt» significa «curva». «Revol» es un sinónimo poco frecuente de «revolada».", "Did you mean ‘{suggestion1}’ or ‘{suggestion2}’? ‘Revolt’ means ‘curve’. ‘Revol’ is an uncommon synonym of ‘revolada’."]
    ,"¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__. \"Càntar\" és un terme especialitzat d'arqueologia.": ["¿Quería decir «{suggestion1}» o «{suggestion2}»? «Càntar» es un término especializado de arqueología.", "Did you mean ‘{suggestion1}’ or ‘{suggestion2}’? ‘Càntar’ is a specialist archaeology term."]
    ,"¿Volíeu dir __SUGGESTION_1__? __SUGGESTION_2__ pot ser l'onomatopeia del riure.": ["¿Quería decir «{suggestion1}»? «{suggestion2}» puede ser una onomatopeya de la risa.", "Did you mean ‘{suggestion1}’? ‘{suggestion2}’ may be an onomatopoeia for laughter."]
    ,"¿Volíeu dir __SUGGESTION_1__? __SUGGESTION_2__, sense hac, és una antiga ciutat a prop de Roma.": ["¿Quería decir «{suggestion1}»? «{suggestion2}», sin hache, es una antigua ciudad cerca de Roma.", "Did you mean ‘{suggestion1}’? ‘{suggestion2}’, without an h, is an ancient city near Rome."]
    ,"¿Volíeu dir __SUGGESTION_1__? 'Adir-se' és un verb pronominal.": ["¿Quería decir «{suggestion1}»? «Adir-se» es un verbo pronominal.", "Did you mean ‘{suggestion1}’? ‘Adir-se’ is a pronominal verb."]
    ,"¿Volíeu dir __SUGGESTION_1__? 'Estandard' pot ser una variant de __SUGGESTION_2__ (bandera).": ["¿Quería decir «{suggestion1}»? «Estandard» puede ser una variante de «{suggestion2}» (bandera).", "Did you mean ‘{suggestion1}’? ‘Estandard’ may be a variant of ‘{suggestion2}’ (flag)."]
    ,"¿Volíeu dir __SUGGESTION_1__? 'Fondo' sol ser adjectiu o adverbi. Pot ser correcte com a substantiu en geografia.": ["¿Quería decir «{suggestion1}»? «Fondo» suele ser adjetivo o adverbio. Puede ser correcto como sustantivo en geografía.", "Did you mean ‘{suggestion1}’? ‘Fondo’ is usually an adjective or adverb. It can be correct as a geographical noun."]
    ,"¿Volíeu dir __SUGGESTION_1__? 'Pertinència' vol dir 'qualitat de pertinent'.": ["¿Quería decir «{suggestion1}»? «Pertinència» significa «cualidad de pertinente».", "Did you mean ‘{suggestion1}’? ‘Pertinència’ means ‘the quality of being pertinent’."]
    ,"¿Volíeu dir __SUGGESTION_1__? 'Portantveus' existeix com a càrrec històric, no actual.": ["¿Quería decir «{suggestion1}»? «Portantveus» existe como cargo histórico, no actual.", "Did you mean ‘{suggestion1}’? ‘Portantveus’ exists as a historical, but no longer current, office."]
    ,"¿Volíeu dir __SUGGESTION_1__? 'Provable' vol dir 'que pot ser provat, demostrat'.": ["¿Quería decir «{suggestion1}»? «Provable» significa «que puede probarse, demostrarse».", "Did you mean ‘{suggestion1}’? ‘Provable’ means ‘capable of being proved or demonstrated’."]
    ,"¿Volíeu dir __SUGGESTION_1__? 'Valoritzar' s'usa només en alguns àmbits especialitzats.": ["¿Quería decir «{suggestion1}»? «Valoritzar» se usa solo en algunos ámbitos especializados.", "Did you mean ‘{suggestion1}’? ‘Valoritzar’ is used only in some specialist fields."]
    ,"¿Volíeu dir __SUGGESTION_1__? 'Xunga' existeix com a nom d'ocell.": ["¿Quería decir «{suggestion1}»? «Xunga» existe como nombre de un pájaro.", "Did you mean ‘{suggestion1}’? ‘Xunga’ exists as a bird name."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"\\1\" és correcte com a adjectiu.": ["¿Quería decir «{suggestion1}»? «\\1» es correcto como adjetivo.", "Did you mean ‘{suggestion1}’? ‘\\1’ is correct as an adjective."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"\\1\" és correcte en alguns sentits (xerrar; pescar amb rall).": ["¿Quería decir «{suggestion1}»? «\\1» es correcto con algunos sentidos (charlar; pescar con rall).", "Did you mean ‘{suggestion1}’? ‘\\1’ is correct in some senses (to chat; to fish with a rall net)."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"\\1\" és participi del v. 'candir'.": ["¿Quería decir «{suggestion1}»? «\\1» es un participio del verbo «candir».", "Did you mean ‘{suggestion1}’? ‘\\1’ is a participle of the verb ‘candir’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"\\1\" és una forma del v. 'espassar' (acabar-se, desaparèixer).": ["¿Quería decir «{suggestion1}»? «\\1» es una forma del verbo «espassar» (terminarse, desaparecer).", "Did you mean ‘{suggestion1}’? ‘\\1’ is a form of ‘espassar’ (to end, disappear)."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"\\1\" és una forma del v. 'vigir'.": ["¿Quería decir «{suggestion1}»? «\\1» es una forma del verbo «vigir».", "Did you mean ‘{suggestion1}’? ‘\\1’ is a form of the verb ‘vigir’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"\\1\" és una paraula molt infreqüent.": ["¿Quería decir «{suggestion1}»? «\\1» es una palabra muy poco frecuente.", "Did you mean ‘{suggestion1}’? ‘\\1’ is a very uncommon word."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"\\1\" existeix com a derivat de \"erm\".": ["¿Quería decir «{suggestion1}»? «\\1» existe como derivado de «erm».", "Did you mean ‘{suggestion1}’? ‘\\1’ exists as a derivative of ‘erm’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"\\1\" existeix com a participi del v. 'preterit'.": ["¿Quería decir «{suggestion1}»? «\\1» existe como participio del verbo «preterit».", "Did you mean ‘{suggestion1}’? ‘\\1’ exists as a participle of ‘preterit’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"\\1\" existeix com a participi del v. 'recondir'.": ["¿Quería decir «{suggestion1}»? «\\1» existe como participio del verbo «recondir».", "Did you mean ‘{suggestion1}’? ‘\\1’ exists as a participle of ‘recondir’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"\\2\" és correcte com a participi de \"fluir\".": ["¿Quería decir «{suggestion1}»? «\\2» es correcto como participio de «fluir».", "Did you mean ‘{suggestion1}’? ‘\\2’ is correct as the past participle of ‘fluir’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Abaixada\" només pot ser participi.": ["¿Quería decir «{suggestion1}»? «Abaixada» solo puede ser un participio.", "Did you mean ‘{suggestion1}’? ‘Abaixada’ can only be a participle."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Abaixada\" només pot ser un participi.": ["¿Quería decir «{suggestion1}»? «Abaixada» solo puede ser un participio.", "Did you mean ‘{suggestion1}’? ‘Abaixada’ can only be a participle."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Apujada\" només pot ser un participi.": ["¿Quería decir «{suggestion1}»? «Apujada» solo puede ser un participio.", "Did you mean ‘{suggestion1}’? ‘Apujada’ can only be a participle."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Averi\" és una forma del v. 'averar'.": ["¿Quería decir «{suggestion1}»? «Averi» es una forma del verbo «averar».", "Did you mean ‘{suggestion1}’? ‘Averi’ is a form of the verb ‘averar’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Balsa\" és el nom d'un arbre i la seva fusta.": ["¿Quería decir «{suggestion1}»? «Balsa» es el nombre de un árbol y de su madera.", "Did you mean ‘{suggestion1}’? ‘Balsa’ is the name of a tree and its wood."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Captan\" o \"captà\" és un terme de química.": ["¿Quería decir «{suggestion1}»? «Captan» o «captà» es un término de química.", "Did you mean ‘{suggestion1}’? ‘Captan’ or ‘captà’ is a chemistry term."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"D'amagades\" pareix un calc del castellà.": ["¿Quería decir «{suggestion1}»? «D'amagades» parece un calco del castellano.", "Did you mean ‘{suggestion1}’? ‘D'amagades’ seems to be a calque from Spanish."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Dessolar\" (amb dues esses) vol dir 'llevar la sola'.": ["¿Quería decir «{suggestion1}»? «Dessolar» (con dos eses) significa «quitar la suela».", "Did you mean ‘{suggestion1}’? ‘Dessolar’ (with two s’s) means ‘to remove the sole’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Directiu\" és un nom o un adjectiu masculí.": ["¿Quería decir «{suggestion1}»? «Directiu» es un sustantivo o adjetivo masculino.", "Did you mean ‘{suggestion1}’? ‘Directiu’ is a masculine noun or adjective."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Directius\" és un nom o un adjectiu masculí.": ["¿Quería decir «{suggestion1}»? «Directius» es un sustantivo o adjetivo masculino plural.", "Did you mean ‘{suggestion1}’? ‘Directius’ is a masculine plural noun or adjective."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Em vist\" és correcte en el sentit de 'em vestisc'.": ["¿Quería decir «{suggestion1}»? «Em vist» es correcto con el sentido de «me visto».", "Did you mean ‘{suggestion1}’? ‘Em vist’ is correct in the sense of ‘I dress myself’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Embrague\" pot ser una forma del verb 'embragar'.": ["¿Quería decir «{suggestion1}»? «Embrague» puede ser una forma del verbo «embragar».", "Did you mean ‘{suggestion1}’? ‘Embrague’ may be a form of the verb ‘embragar’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Embragues\" pot ser una forma del verb 'embragar'.": ["¿Quería decir «{suggestion1}»? «Embragues» puede ser una forma del verbo «embragar».", "Did you mean ‘{suggestion1}’? ‘Embragues’ may be a form of the verb ‘embragar’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"En quant\" és possible (formal o antic) en el sentit de \"en tant que, en qualitat de\".": ["¿Quería decir «{suggestion1}»? «En quant» es posible (en registros formales o antiguos) con el sentido de «en tanto que, en calidad de».", "Did you mean ‘{suggestion1}’? ‘En quant’ is possible (formally or archaically) in the sense of ‘insofar as, in the capacity of’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Estricament\" ve d’estricar (terme tèxtil).": ["¿Querías decir «{suggestion1}»? «Estricament» deriva de «estricar», un término textil.", "Did you mean ‘{suggestion1}’? ‘Estricament’ derives from ‘estricar’, a textile term."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Gosar\" significar \"atrevir-se\".": ["¿Querías decir «{suggestion1}»? «Gosar» significa «atreverse».", "Did you mean ‘{suggestion1}’? ‘Gosar’ means ‘to dare’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Infermetat\" és un terme poc freqüent que vol dir ’manca de fermetat’.": ["¿Querías decir «{suggestion1}»? «Infermetat» es un término poco frecuente que significa «falta de firmeza».", "Did you mean ‘{suggestion1}’? ‘Infermetat’ is an uncommon term meaning ‘lack of firmness’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Intensió, intensional\" són termes especialitzats de lògica.": ["¿Querías decir «{suggestion1}»? «Intensió» e «intensional» son términos especializados de lógica.", "Did you mean ‘{suggestion1}’? ‘Intensió’ and ‘intensional’ are specialised terms in logic."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Maleit\" (sense dièresi) és correcte en el sentit de ’rabiós’.": ["¿Querías decir «{suggestion1}»? «Maleit», sin diéresis, es correcto con el sentido de «rabioso».", "Did you mean ‘{suggestion1}’? ‘Maleit’, without a diaeresis, is correct when it means ‘rabid’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Maner\" existeix com a adjectiu (manerós).": ["¿Querías decir «{suggestion1}»? «Maner» existe como adjetivo (con el sentido de «afable»).", "Did you mean ‘{suggestion1}’? ‘Maner’ exists as an adjective (meaning ‘gentle’ or ‘courteous’)."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Margarita\" és una forma secundària o una paraula amb sentits menys usuals.": ["¿Querías decir «{suggestion1}»? «Margarita» es una variante secundaria o una palabra con sentidos menos habituales.", "Did you mean ‘{suggestion1}’? ‘Margarita’ is a secondary form or a word with less common meanings."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Mister\" és el fabricant o venedor de mistos.": ["¿Querías decir «{suggestion1}»? «Mister» es el fabricante o vendedor de cerillas.", "Did you mean ‘{suggestion1}’? ‘Mister’ is a maker or seller of matches."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Moltura\" és el dret que es paga al moliner.": ["¿Querías decir «{suggestion1}»? «Moltura» es el derecho que se paga al molinero.", "Did you mean ‘{suggestion1}’? ‘Moltura’ is the fee paid to a miller."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Molturar\" és cobrar el dret de moltura.": ["¿Querías decir «{suggestion1}»? «Molturar» es cobrar el derecho de molienda.", "Did you mean ‘{suggestion1}’? ‘Molturar’ means to collect the milling fee."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Opera\" (sense accent) pot ser el nom d’un navegador d’internet o una paraula en un altre idioma.": ["¿Querías decir «{suggestion1}»? «Opera», sin tilde, puede ser el nombre de un navegador de internet o una palabra de otro idioma.", "Did you mean ‘{suggestion1}’? ‘Opera’, without an accent mark, may be the name of an internet browser or a word in another language."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Opera\" (sense accent) pot ser el nom d’un navegador d’internet, una paraula en un altre idioma, o una forma del verb ’operar’.": ["¿Querías decir «{suggestion1}»? «Opera», sin tilde, puede ser el nombre de un navegador, una palabra de otro idioma o una forma del verbo «operar».", "Did you mean ‘{suggestion1}’? ‘Opera’, without an accent mark, may be a browser name, a word in another language, or a form of the verb ‘operar’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Òstia\", sense hac, és una antiga ciutat a prop de Roma.": ["¿Querías decir «{suggestion1}»? «Òstia», sin hache, es una antigua ciudad cerca de Roma.", "Did you mean ‘{suggestion1}’? ‘Òstia’, without an h, is an ancient city near Rome."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Plaç\" és del v. ’plaçar’ (jo plaç).": ["¿Querías decir «{suggestion1}»? «Plaç» es una forma del verbo «plaçar» (primera persona: «jo plaç»).", "Did you mean ‘{suggestion1}’? ‘Plaç’ is a form of the verb ‘plaçar’ (first person: ‘jo plaç’)."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Platejament\" és l’acció de platejar.": ["¿Querías decir «{suggestion1}»? «Platejament» es la acción de platear.", "Did you mean ‘{suggestion1}’? ‘Platejament’ means the act of silver-plating."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Plujos\" és el plural (infreqüent) de \"pluig\".": ["¿Querías decir «{suggestion1}»? «Plujos» es el plural (poco frecuente) de «pluig».", "Did you mean ‘{suggestion1}’? ‘Plujos’ is the uncommon plural of ‘pluig’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Presura\" és un terme d’història, sinònim d’aprisió.": ["¿Querías decir «{suggestion1}»? «Presura» es un término histórico, sinónimo de «aprisió».", "Did you mean ‘{suggestion1}’? ‘Presura’ is a historical term and a synonym of ‘aprisió’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Quès\" és possible (rarament) com a plural del substantiu \"què\" (ex. els quès i els perquès).": ["¿Querías decir «{suggestion1}»? «Quès» puede usarse, aunque raramente, como plural del sustantivo «què» (por ejemplo, «els quès» y «els perquès»).", "Did you mean ‘{suggestion1}’? ‘Quès’ can, though rarely, be used as the plural of the noun ‘què’ (for example, ‘els quès’ and ‘els perquès’)."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Reposta\" pot ser del verb ’repostar’ (verb no admès en tots els diccionaris).": ["¿Querías decir «{suggestion1}»? «Reposta» puede ser una forma del verbo «repostar», que no admiten todos los diccionarios.", "Did you mean ‘{suggestion1}’? ‘Reposta’ may be a form of ‘repostar’, a verb not listed in every dictionary."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Repostes\" pot ser del verb ’repostar’ (verb no admès en tots els diccionaris).": ["¿Querías decir «{suggestion1}»? «Repostes» puede ser una forma del verbo «repostar», que no admiten todos los diccionarios.", "Did you mean ‘{suggestion1}’? ‘Repostes’ may be a form of ‘repostar’, a verb not listed in every dictionary."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Rissa\" és una forma del verb ’rissar’ (vocabulari marítim).": ["¿Querías decir «{suggestion1}»? «Rissa» es una forma del verbo «rissar», del vocabulario náutico.", "Did you mean ‘{suggestion1}’? ‘Rissa’ is a form of the verb ‘rissar’ used in nautical vocabulary."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Risses\" és una forma del verb ’rissar’ (vocabulari marítim).": ["¿Querías decir «{suggestion1}»? «Risses» es una forma del verbo «rissar», del vocabulario náutico.", "Did you mean ‘{suggestion1}’? ‘Risses’ is a form of the verb ‘rissar’ used in nautical vocabulary."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Sangria\" (castellanisme) només té el sentit de ’beguda refrescant’.": ["¿Querías decir «{suggestion1}»? «Sangria», un castellanismo, solo tiene el sentido de «bebida refrescante».", "Did you mean ‘{suggestion1}’? ‘Sangria’ is a Spanish borrowing used only to mean a ‘refreshing drink’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Santa María\" és adequat si es tracta d’un nom en castellà.": ["¿Querías decir «{suggestion1}»? «Santa María» es adecuado si se trata de un nombre en español.", "Did you mean ‘{suggestion1}’? ‘Santa María’ is appropriate if it is a Spanish name."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Sen\" és un tractament usat a Mallorca.": ["¿Querías decir «{suggestion1}»? «Sen» es un tratamiento usado en Mallorca.", "Did you mean ‘{suggestion1}’? ‘Sen’ is a form of address used in Mallorca."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Tomar\" és un verb vàlid amb el sentit de ’empomar, entomar, copsar’.": ["¿Querías decir «{suggestion1}»? «Tomar» es un verbo válido con el sentido de «atrapar, recoger o captar».", "Did you mean ‘{suggestion1}’? ‘Tomar’ is a valid verb meaning ‘to catch, take hold of, or grasp’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Torbar\" és correcte amb el sentit de \"alterar, distraure, entretenir\".": ["¿Querías decir «{suggestion1}»? «Torbar» es correcto con el sentido de «alterar, distraer o entretener».", "Did you mean ‘{suggestion1}’? ‘Torbar’ is correct when it means ‘to disturb, distract, or detain’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Vaser\" (enterramorts) és una paraula d’ús poc freqüent.": ["¿Querías decir «{suggestion1}»? «Vaser» (enterrador) es una palabra poco frecuente.", "Did you mean ‘{suggestion1}’? ‘Vaser’ (an undertaker) is an uncommon word."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Vig.\" pot ser l’abreviatura de \"vigilant\".": ["¿Querías decir «{suggestion1}»? «Vig.» puede ser la abreviatura de «vigilant».", "Did you mean ‘{suggestion1}’? ‘Vig.’ may be an abbreviation of ‘vigilant’."]
    ,"¿Volíeu dir __SUGGESTION_1__? 360 graus vol dir un gir complet.": ["¿Querías decir «{suggestion1}»? 360 grados equivalen a una vuelta completa.", "Did you mean ‘{suggestion1}’? 360 degrees make a full turn."]
    ,"En les expressions d'hores, usem el punt o els dos punts (sistema internacional).": ["Para expresar las horas, se usa el punto o los dos puntos (sistema internacional).", "Use a full stop or a colon to write times (international standard)."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Estricament\" ve d'estricar (terme tèxtil).": ["¿Querías decir «{suggestion1}»? «Estricament» deriva de «estricar», un término textil.", "Did you mean ‘{suggestion1}’? ‘Estricament’ derives from ‘estricar’, a textile term."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Infermetat\" és un terme poc freqüent que vol dir 'manca de fermetat'.": ["¿Querías decir «{suggestion1}»? «Infermetat» es un término poco frecuente que significa «falta de firmeza».", "Did you mean ‘{suggestion1}’? ‘Infermetat’ is an uncommon term meaning ‘lack of firmness’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Maleit\" (sense dièresi) és correcte en el sentit de 'rabiós'.": ["¿Querías decir «{suggestion1}»? «Maleit», sin diéresis, es correcto con el sentido de «rabioso».", "Did you mean ‘{suggestion1}’? ‘Maleit’, without a diaeresis, is correct when it means ‘rabid’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Opera\" (sense accent) pot ser el nom d'un navegador d'internet o una paraula en un altre idioma.": ["¿Querías decir «{suggestion1}»? «Opera», sin tilde, puede ser el nombre de un navegador de internet o una palabra de otro idioma.", "Did you mean ‘{suggestion1}’? ‘Opera’, without an accent mark, may be the name of an internet browser or a word in another language."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Opera\" (sense accent) pot ser el nom d'un navegador d'internet, una paraula en un altre idioma, o una forma del verb 'operar'.": ["¿Querías decir «{suggestion1}»? «Opera», sin tilde, puede ser el nombre de un navegador, una palabra de otro idioma o una forma del verbo «operar».", "Did you mean ‘{suggestion1}’? ‘Opera’, without an accent mark, may be a browser name, a word in another language, or a form of the verb ‘operar’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Plaç\" és del v. 'plaçar' (jo plaç).": ["¿Querías decir «{suggestion1}»? «Plaç» es una forma del verbo «plaçar» (primera persona: «jo plaç»).", "Did you mean ‘{suggestion1}’? ‘Plaç’ is a form of the verb ‘plaçar’ (first person: ‘jo plaç’)."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Platejament\" és l'acció de platejar.": ["¿Querías decir «{suggestion1}»? «Platejament» es la acción de platear.", "Did you mean ‘{suggestion1}’? ‘Platejament’ means the act of silver-plating."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Presura\" és un terme d'història, sinònim d'aprisió.": ["¿Querías decir «{suggestion1}»? «Presura» es un término histórico, sinónimo de «aprisió».", "Did you mean ‘{suggestion1}’? ‘Presura’ is a historical term and a synonym of ‘aprisió’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Reposta\" pot ser del verb 'repostar' (verb no admès en tots els diccionaris).": ["¿Querías decir «{suggestion1}»? «Reposta» puede ser una forma del verbo «repostar», que no admiten todos los diccionarios.", "Did you mean ‘{suggestion1}’? ‘Reposta’ may be a form of ‘repostar’, a verb not listed in every dictionary."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Repostes\" pot ser del verb 'repostar' (verb no admès en tots els diccionaris).": ["¿Querías decir «{suggestion1}»? «Repostes» puede ser una forma del verbo «repostar», que no admiten todos los diccionarios.", "Did you mean ‘{suggestion1}’? ‘Repostes’ may be a form of ‘repostar’, a verb not listed in every dictionary."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Rissa\" és una forma del verb 'rissar' (vocabulari marítim).": ["¿Querías decir «{suggestion1}»? «Rissa» es una forma del verbo «rissar», del vocabulario náutico.", "Did you mean ‘{suggestion1}’? ‘Rissa’ is a form of the verb ‘rissar’ used in nautical vocabulary."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Risses\" és una forma del verb 'rissar' (vocabulari marítim).": ["¿Querías decir «{suggestion1}»? «Risses» es una forma del verbo «rissar», del vocabulario náutico.", "Did you mean ‘{suggestion1}’? ‘Risses’ is a form of the verb ‘rissar’ used in nautical vocabulary."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Sangria\" (castellanisme) només té el sentit de 'beguda refrescant'.": ["¿Querías decir «{suggestion1}»? «Sangria», un castellanismo, solo tiene el sentido de «bebida refrescante».", "Did you mean ‘{suggestion1}’? ‘Sangria’ is a Spanish borrowing used only to mean a ‘refreshing drink’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Santa María\" és adequat si es tracta d'un nom en castellà.": ["¿Querías decir «{suggestion1}»? «Santa María» es adecuado si se trata de un nombre en español.", "Did you mean ‘{suggestion1}’? ‘Santa María’ is appropriate if it is a Spanish name."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Tomar\" és un verb vàlid amb el sentit de 'empomar, entomar, copsar'.": ["¿Querías decir «{suggestion1}»? «Tomar» es un verbo válido con el sentido de «atrapar, recoger o captar».", "Did you mean ‘{suggestion1}’? ‘Tomar’ is a valid verb meaning ‘to catch, take hold of, or grasp’."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Vaser\" (enterramorts) és una paraula d'ús poc freqüent.": ["¿Querías decir «{suggestion1}»? «Vaser» (enterrador) es una palabra poco frecuente.", "Did you mean ‘{suggestion1}’? ‘Vaser’ (an undertaker) is an uncommon word."]
    ,"¿Volíeu dir __SUGGESTION_1__? \"Vig.\" pot ser l'abreviatura de \"vigilant\".": ["¿Querías decir «{suggestion1}»? «Vig.» puede ser la abreviatura de «vigilant».", "Did you mean ‘{suggestion1}’? ‘Vig.’ may be an abbreviation of ‘vigilant’."]
    ,"¿Volíeu dir __SUGGESTION_1__? Correcte com a forma secundària de __SUGGESTION_2__.": ["¿Querías decir «{suggestion1}»? Es correcto como forma secundaria de «{suggestion2}».", "Did you mean ‘{suggestion1}’? It is correct as a secondary form of ‘{suggestion2}’."]
    ,"¿Volíeu dir __SUGGESTION_1__? Correcte en el sentit de 'persones que seuen al voltant d'una taula'.": ["¿Querías decir «{suggestion1}»? Es correcto con el sentido de «personas que se sientan alrededor de una mesa».", "Did you mean ‘{suggestion1}’? It is correct with the meaning ‘people who sit around a table’."]
    ,"¿Volíeu dir __SUGGESTION_1__? Correcte si és \"jo trompo\" del v. 'trompar'.": ["¿Querías decir «{suggestion1}»? Es correcto si es «jo trompo», del verbo «trompar».", "Did you mean ‘{suggestion1}’? It is correct as ‘jo trompo’, from the verb ‘trompar’."]
    ,"¿Volíeu dir __SUGGESTION_1__? És correcte com a forma valenciana del v. 'maltractar'.": ["¿Querías decir «{suggestion1}»? Es correcta como forma valenciana del verbo «maltractar».", "Did you mean ‘{suggestion1}’? It is correct as a Valencian form of the verb ‘maltractar’."]
    ,"¿Volíeu dir \"\\1\" (del verb 'poder')?": ["¿Querías decir «\\1» (del verbo «poder»)?", "Did you mean ‘\\1’ (from the verb ‘poder’)?"]
    ,"¿Volíeu dir \"\\3\" en lloc de \"\\3\" (del v. 'rentar')?": ["¿Querías decir «\\3» en vez de «\\3» (del verbo «rentar»)?", "Did you mean ‘\\3’ rather than ‘\\3’ (from the verb ‘rentar’)?"]
    ,"¿Volíeu dir \"a\" (preposició de lloc) o \"hi ha\" (del verb 'haver-hi')? Potser hi falta un participi.": ["¿Querías decir «a» (preposición de lugar) o «hi ha» (del verbo «haver-hi»)? Quizá falte un participio.", "Did you mean ‘a’ (the preposition of place) or ‘hi ha’ (from ‘haver-hi’)? A past participle may be missing."]
    ,"¿Volíeu dir \"arrelar\"? \"Enraigar\" és una paraula registrada amb el sentit de 'posar en marxa', però inusual.": ["¿Querías decir «arrelar»? «Enraigar» es una palabra documentada con el sentido de «poner en marcha», pero es poco habitual.", "Did you mean ‘arrelar’? ‘Enraigar’ is an attested word meaning ‘to set in motion’, but it is uncommon."]
    ,"¿Volíeu dir \"enfilar-se\"? \"Trepar\" és correcte en el sentit de 'foradar'.": ["¿Querías decir «enfilar-se»? «Trepar» es correcto con el sentido de «perforar».", "Did you mean ‘enfilar-se’? ‘Trepar’ is correct when it means ‘to pierce’."]
    ,"¿Volíeu dir \"és\" (del verb 'ser')?": ["¿Querías decir «és» (del verbo «ser»)?", "Did you mean ‘és’ (from the verb ‘ser’)?"]
    ,"¿Volíeu dir \"escoltar\" (sentir) en comptes de \"escortar\" (acompanyar, protegir)?": ["¿Querías decir «escoltar» (escuchar) en vez de «escortar» (acompañar, proteger)?", "Did you mean ‘escoltar’ (to listen) rather than ‘escortar’ (to accompany, protect)?"]
    ,"¿Volíeu dir \"escortar\" (acompanyar, protegir, custodiar)?": ["¿Querías decir «escortar» (acompañar, proteger, custodiar)?", "Did you mean ‘escortar’ (to accompany, protect, escort)?"]
    ,"¿Volíeu dir \"estigués\" (del v. 'estar')?": ["¿Querías decir «estigués» (del verbo «estar»)?", "Did you mean ‘estigués’ (from the verb ‘estar’)?"]
    ,"¿Volíeu dir \"estona\"? Correcte si és del v. 'ratar'.": ["¿Querías decir «estona»? Es correcto si es una forma del verbo «ratar».", "Did you mean ‘estona’? It is correct if it is a form of ‘ratar’."]
    ,"¿Volíeu dir \"flagrant\" (manifest, innegable) en comptes de \"fragant\" (olorós)?": ["¿Querías decir «flagrant» (evidente, innegable) en vez de «fragant» (oloroso)?", "Did you mean ‘flagrant’ (obvious, undeniable) rather than ‘fragant’ (fragrant)?"]
    ,"¿Volíeu dir \"flagrant\" (manifest, innegable) o \"fragant\" (olorós)?": ["¿Querías decir «flagrant» (evidente, innegable) o «fragant» (oloroso)?", "Did you mean ‘flagrant’ (obvious, undeniable) or ‘fragant’ (fragrant)?"]
    ,"¿Volíeu dir \"Genís\" (nom propi)? Si no, hi ha un error de concordança.": ["¿Querías decir «Genís» (nombre propio)? Si no, hay un error de concordancia.", "Did you mean ‘Genís’ (a proper name)? If not, there is an agreement error."]
    ,"¿Volíeu dir \"hi\" (pronom feble) en comptes de \"i\" (conjunció)?": ["¿Querías decir «hi» (pronombre átono) en vez de «i» (conjunción)?", "Did you mean ‘hi’ (a weak pronoun) rather than ‘i’ (the conjunction)?"]
    ,"¿Volíeu dir \"posar al corrent\" (fer sabedor, informar)?": ["¿Querías decir «posar al corrent» (informar, poner al día)?", "Did you mean ‘posar al corrent’ (to inform, bring up to date)?"]
    ,"¿Volíeu dir \"pot\" (del v. poder)?": ["¿Querías decir «pot» (del verbo «poder»)?", "Did you mean ‘pot’ (from the verb ‘poder’)?"]
    ,"¿Volíeu dir \"quant a\" (pel que fa a)? \"Quan\" és correcte si significa \"en el moment en què\".": ["¿Querías decir «quant a» (con respecto a)? «Quan» es correcto si significa «en el momento en que».", "Did you mean ‘quant a’ (with regard to)? ‘Quan’ is correct when it means ‘at the time when’."]
    ,"¿Volíeu dir \"quant a\" (respecte a) o \"quan\" (en el moment en què)? \"En quant\" és possible (formal o antic) en el sentit de \"en tant que, en qualitat de\".": ["¿Querías decir «quant a» (con respecto a) o «quan» (en el momento en que)? «En quant» es posible en registros formales o antiguos con el sentido de «en tanto que, en calidad de».", "Did you mean ‘quant a’ (with regard to) or ‘quan’ (when)? ‘En quant’ is possible in formal or older usage to mean ‘insofar as, in the capacity of’."]
    ,"¿Volíeu dir \"quant\" (quantitat) en comptes de \"quan\" (en el moment que)?": ["¿Querías decir «quant» (cantidad) en vez de «quan» (en el momento en que)?", "Did you mean ‘quant’ (quantity) rather than ‘quan’ (when)?"]
    ,"¿Volíeu dir \"regla\" (femení; norma, precepte) o \"regle\" (masculí; instrument de mesura)?": ["¿Querías decir «regla» (femenino: norma, precepto) o «regle» (masculino: instrumento de medición)?", "Did you mean ‘regla’ (feminine: rule, precept) or ‘regle’ (masculine: measuring ruler)?"]
    ,"¿Volíeu dir \"s'hi\" (pronoms febles)? \"Si\" podria ser un condicional.": ["¿Querías decir «s’hi» (pronombres átonos)? «Si» podría ser una conjunción condicional.", "Did you mean ‘s’hi’ (weak pronouns)? ‘Si’ could be a conditional conjunction."]
    ,"¿Volíeu dir \"sord\" (que no hi sent)?": ["¿Querías decir «sord» (que no oye)?", "Did you mean ‘sord’ (unable to hear)?"]
    ,"¿Volíeu dir \"sua\" (del v. 'suar')?": ["¿Querías decir «sua» (del verbo «suar»)?", "Did you mean ‘sua’ (from the verb ‘suar’)?"]
    ,"¿Volíeu dir \"veges\" (del verb 'veure') o \"begues\" (del verb 'beure')?": ["¿Querías decir «veges» (del verbo «veure») o «begues» (del verbo «beure»)?", "Did you mean ‘veges’ (from ‘veure’) or ‘begues’ (from ‘beure’)?"]
    ,"¿Volíeu dir \"veja\" (del verb 'veure') o \"bega\" (del verb 'beure')?": ["¿Querías decir «veja» (del verbo «veure») o «bega» (del verbo «beure»)?", "Did you mean ‘veja’ (from ‘veure’) or ‘bega’ (from ‘beure’)?"]
    ,"¿Volíeu dir el nom de la pel·lícula __SUGGESTION_1__ (__SUGGESTION_2__) o l'expressió comuna __SUGGESTION_3__?": ["¿Querías decir la película «{suggestion1}» («{suggestion2}») o la expresión común «{suggestion3}»?", "Did you mean the film ‘{suggestion1}’ (‘{suggestion2}’) or the common expression ‘{suggestion3}’?"]
    ,"¿Volíeu dir l'empresari nord-americà __SUGGESTION_1__?": ["¿Querías decir el empresario estadounidense «{suggestion1}»?", "Did you mean the American businessman ‘{suggestion1}’?"]
    ,"¿Volíeu usar el verb 'pujar' o el verb 'poder'?": ["¿Querías usar el verbo «pujar» o el verbo «poder»?", "Did you mean the verb ‘pujar’ or the verb ‘poder’?"]
    ,"¿Volíeu usar l'abreviatura de 'següent' (__SUGGESTION_1__) o de segon (__SUGGESTION_2__)?": ["¿Querías usar la abreviatura de «següent» («{suggestion1}») o la de segundo («{suggestion2}»)?", "Did you mean the abbreviation for ‘següent’ (‘{suggestion1}’) or for second (‘{suggestion2}’)?"]
    ,"'Arravatar-se' (=enfurir-se) és un verb pronominal. ¿Volíeu dir 'arrabassar' (=arrencar)?": ["«Arravatar-se» (enfurecerse) es un verbo pronominal. ¿Querías decir «arrabassar» (arrancar)?", "‘Arravatar-se’ (to become furious) is a pronominal verb. Did you mean ‘arrabassar’ (to tear out)?"]
    ,"'Prendre foc' és un calc del castellà. Feu servir una altra expressió.": ["«Prendre foc» es un calco del castellano. Usa otra expresión.", "‘Prendre foc’ is a calque from Spanish. Use a different expression."]
    ,"'Quelcom' és incorrecte com a antecedent d'una oració de relatiu.": ["«Quelcom» es incorrecto como antecedente de una oración de relativo.", "‘Quelcom’ is incorrect as the antecedent of a relative clause."]
    ,"'Rebel·lar-se' (=revoltar-se) és un verb pronominal. ¿Volíeu dir 'revelar' (=descobrir, mostrar)?": ["«Rebel·lar-se» (sublevarse) es un verbo pronominal. ¿Querías decir «revelar» (descubrir, mostrar)?", "‘Rebel·lar-se’ (to rebel) is a pronominal verb. Did you mean ‘revelar’ (to reveal, show)?"]
    ,"'Ritual', com a nom, és masculí.": ["«Ritual», como sustantivo, es masculino.", "‘Ritual’ is masculine when used as a noun."]
    ,"'Rosos' (pl. de ros) vol dir 'rosades, rous'. En altres sentits cal escriure __SUGGESTION_1__.": ["«Rosos» (plural de «ros») significa «rocíos». En otros sentidos, debe escribirse «{suggestion1}».", "‘Rosos’ (plural of ‘ros’) means ‘dews’. In other senses, write ‘{suggestion1}’."]
    ,"'Trepar' vol dir 'foradar'. És incorrecte en altres sentits.": ["«Trepar» significa «perforar». Es incorrecto con otros sentidos.", "‘Trepar’ means ‘to pierce’. It is incorrect with other meanings."]
    ,"\"\\1\" és una paraula d'ús poc habitual. ¿Volíeu dir __SUGGESTION_1__?": ["«\\1» es una palabra poco habitual. ¿Querías decir «{suggestion1}»?", "‘\\1’ is an uncommon word. Did you mean ‘{suggestion1}’?"]
    ,"\"\\2\" és una forma del verb 'ser'. ¿Volíeu dir \"continuar\" o \"seguir\"?": ["«\\2» es una forma del verbo «ser». ¿Querías decir «continuar» o «seguir»?", "‘\\2’ is a form of the verb ‘ser’. Did you mean ‘continuar’ or ‘seguir’?"]
    ,"\"\\2\" és una paraula d'ús poc habitual. ¿Volíeu dir __SUGGESTION_1__?": ["«\\2» es una palabra poco habitual. ¿Querías decir «{suggestion1}»?", "‘\\2’ is an uncommon word. Did you mean ‘{suggestion1}’?"]
    ,"\"\\3\" no és un topònim, i per això escrivim el nom de la universitat sense 'de'.": ["«\\3» no es un topónimo, por lo que el nombre de la universidad se escribe sin «de».", "‘\\3’ is not a place name, so the university name is written without ‘de’."]
    ,"\"Clucar\" és usual en valencià, però en altres varietats s'usa \"aclucar\".": ["«Clucar» es habitual en valenciano, pero en otras variedades se usa «aclucar».", "‘Clucar’ is common in Valencian, while other varieties use ‘aclucar’."]
    ,"\"Extradiu\" és 2a persona plural (vosaltres extradiu). La 3a persona singular és __SUGGESTION_1__.": ["«Extradiu» es la segunda persona del plural («vosaltres extradiu»). La tercera persona del singular es «{suggestion1}».", "‘Extradiu’ is the second-person plural (‘vosaltres extradiu’). The third-person singular is ‘{suggestion1}’."]
    ,"\"Infeccionar\" és un verb antic i poc usual. Val més dir \"infectar\".": ["«Infeccionar» es un verbo antiguo y poco habitual. Es preferible decir «infectar».", "‘Infeccionar’ is an old and uncommon verb. Use ‘infectar’ instead."]
    ,"\"L'ho\" és una combinació impossible de pronoms febles. Davant d'un adjectiu diem __SUGGESTION_1__.": ["«L’ho» es una combinación imposible de pronombres átonos. Delante de un adjetivo, se dice «{suggestion1}».", "‘L’ho’ is an impossible combination of weak pronouns. Before an adjective, use ‘{suggestion1}’."]
    ,"\"Massa\" és invariable com a adverbi i adjectiu.": ["«Massa» es invariable como adverbio y como adjetivo.", "‘Massa’ is invariable as both an adverb and an adjective."]
    ,"\"Mentira\" és una forma secundària de \"mentida\" o una forma del v. 'mentir'.": ["«Mentira» es una variante secundaria de «mentida» o una forma del verbo «mentir».", "‘Mentira’ is a secondary form of ‘mentida’ or a form of the verb ‘mentir’."]
    ,"\"Mitjan\" va seguit d'un nom, no d'un determinant.": ["«Mitjan» va seguido de un sustantivo, no de un determinante.", "‘Mitjan’ is followed by a noun, not a determiner."]
    ,"\"Molt\" és invariable com a adverbi.": ["«Molt» es invariable como adverbio.", "‘Molt’ is invariable when used as an adverb."]
    ,"\"Nagorno Karabakh\" és una antiga forma russa. És preferible usar una altra forma.": ["«Nagorno Karabakh» es una forma rusa antigua. Es preferible usar otra forma.", "‘Nagorno Karabakh’ is an old Russian form. Use a different form instead."]
    ,"\"Òptim\" (=el més bo) és un superlatiu i, per tant, no admet comparacions o graus.": ["«Òptim» (el mejor) es un superlativo y, por tanto, no admite comparación ni grados.", "‘Òptim’ (the best) is a superlative and therefore cannot be compared or graded."]
    ,"\"Ordenança\" és un substantiu femení en el sentit de 'norma'. Pot ser masculí referit a una persona.": ["«Ordenança» es un sustantivo femenino con el sentido de «norma». Puede ser masculino cuando se refiere a una persona.", "‘Ordenança’ is a feminine noun meaning ‘rule’. It can be masculine when it refers to a person."]
    ,"\"Pèndul\" és correcte com a adjectiu. Com a nom, cal escriure __SUGGESTION_1__.": ["«Pèndul» es correcto como adjetivo. Como sustantivo, debe escribirse «{suggestion1}».", "‘Pèndul’ is correct as an adjective. As a noun, write ‘{suggestion1}’."]
    ,"\"Pintxo\" és un manlleu del basc. Podeu fer servir una paraula alternativa.": ["«Pintxo» es un préstamo del euskera. Puedes usar una palabra alternativa.", "‘Pintxo’ is a loanword from Basque. Consider an alternative word."]
    ,"\"Postular-se\" no és en els diccionaris en el sentit de \"proposar-se (per a un càrrec)\".": ["«Postular-se» no aparece en los diccionarios con el sentido de «proponerse para un cargo».", "‘Postular-se’ is not listed in dictionaries with the meaning ‘to put oneself forward for a position’."]
    ,"\"Què\" s'accentua quan equival a \"quina cosa\".": ["«Què» lleva tilde cuando equivale a «qué cosa».", "‘Què’ takes an accent mark when it means ‘what thing’."]
    ,"\"Recent\" no es pot usar com si fos un adverbi.": ["«Recent» no se puede usar como si fuera un adverbio.", "‘Recent’ cannot be used as an adverb."]
    ,"\"Recent\" no és un adverbi. Useu una altra expressió.": ["«Recent» no es un adverbio. Usa otra expresión.", "‘Recent’ is not an adverb. Use a different expression."]
    ,"\"Salpicar\" és un verb d'ús infreqüent i especialitzat. ¿Volíeu dir esquitxar o esguitar?": ["«Salpicar» es un verbo especializado y poco frecuente. ¿Querías decir «esquitxar» o «esguitar»?", "‘Salpicar’ is an uncommon, specialised verb. Did you mean ‘esquitxar’ or ‘esguitar’?"]
    ,"\"Senyal\" és un nom masculí.": ["«Senyal» es un sustantivo masculino.", "‘Senyal’ is a masculine noun."]
    ,"\"Té\" (del v. tenir) s'escriu amb accent. \"\\2\" s'escriu amb accent si és un nom.": ["«Té» (del verbo «tenir») lleva tilde. «\\2» también lleva tilde si es un sustantivo.", "‘Té’ (from the verb ‘tenir’) takes an accent mark. ‘\\2’ also takes one if it is a noun."]
    ,"\"Tot\" és redundant si no remarquem la simultaneïtat o l'oposició.": ["«Tot» es redundante si no se quiere destacar la simultaneidad o la oposición.", "‘Tot’ is redundant unless simultaneity or contrast is being emphasised."]
    ,"\"Trastocar\" vol dir \"fer tornar boig\". Potser no és adequat en aquest context.": ["«Trastocar» significa «volver loco». Quizá no sea adecuado en este contexto.", "‘Trastocar’ means ‘to drive someone mad’. It may not be appropriate in this context."]
    ,"\"Trepador\" només és correcte en el sentit de 'que trepa, que perfora'. ¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__ (referit a plantes)?": ["«Trepador» solo es correcto con el sentido de «que trepa, que perfora». ¿Querías decir «{suggestion1}» o «{suggestion2}» (referido a plantas)?", "‘Trepador’ is correct only when it means ‘climbing’ or ‘boring’. Did you mean ‘{suggestion1}’ or ‘{suggestion2}’ (referring to plants)?"]
    ,"\"Vial\" és un nom, no un adjectiu.": ["«Vial» es un sustantivo, no un adjetivo.", "‘Vial’ is a noun, not an adjective."]
    ,"\"Virulent\" no és un adjectiu adequat en aquest context.": ["«Virulent» no es un adjetivo adecuado en este contexto.", "‘Virulent’ is not an appropriate adjective in this context."]
    ,"Abreviatura d'hores.": ["Abreviatura de horas.", "Abbreviation for hours."]
    ,"Amb el sentit de 'nombre d'integrants d'un exèrcit', cal dir __SUGGESTION_1__.": ["Con el sentido de «número de integrantes de un ejército», debe decirse «{suggestion1}».", "When it means ‘number of soldiers in an army’, use ‘{suggestion1}’."]
    ,"Amb el sentit de \"lloc per a canviar-se de roba\", val més dir __SUGGESTION_1__.": ["Con el sentido de «lugar para cambiarse de ropa», es preferible decir «{suggestion1}».", "When it means ‘a place to change clothes’, use ‘{suggestion1}’."]
    ,"Aquest verb no es correspon amb la varietat en ús. ¿Volíeu dir __SUGGESTION_1__ (vostè) o __SUGGESTION_2__ (tu)?": ["Este verbo no corresponde a la variedad utilizada. ¿Querías decir «{suggestion1}» (usted) o «{suggestion2}» (tú)?", "This verb does not match the variety in use. Did you mean ‘{suggestion1}’ (formal singular) or ‘{suggestion2}’ (informal singular)?"]
    ,"Aquesta expressió, amb el sentit de censura, queixa o desaprovació, és un castellanisme .": ["Esta expresión es un castellanismo con el sentido de censura, queja o desaprobación.", "This expression is a Spanish calque when used to mean criticism, complaint, or disapproval."]
    ,"Aquesta seqüència segurament ha de portar un guionet entremig.": ["Probablemente esta secuencia debe llevar un guion en medio.", "This sequence probably needs a hyphen."]
    ,"Arcaisme. Val més usar una altra expressió.": ["Arcaísmo. Es preferible usar otra expresión.", "Archaic form. Use a different expression."]
    ,"Cal apostrofar aquests pronoms febles.": ["Estos pronombres átonos deben llevar apóstrofo.", "These weak pronouns need an apostrophe."]
    ,"Cal apostrofar o canviar el pronom.": ["Hay que poner un apóstrofo o cambiar el pronombre.", "Add an apostrophe or change the pronoun."]
    ,"Cal apostrofar o usar un altre pronom.": ["Hay que poner un apóstrofo o usar otro pronombre.", "Add an apostrophe or use a different pronoun."]
    ,"Cal dir __SUGGESTION_1__ (adv.) en lloc de \"fons\" (nom).": ["Debe decirse «{suggestion1}» (adverbio) en vez de «fons» (sustantivo).", "Use ‘{suggestion1}’ (adverb) instead of ‘fons’ (noun)."]
    ,"Cal dir __SUGGESTION_1__ (conjunció final o causal) o __SUGGESTION_2__ (=per quina raó).": ["Debe decirse «{suggestion1}» (conjunción final o causal) o «{suggestion2}» (equivalente a «por qué razón»).", "Use ‘{suggestion1}’ (a purpose or causal conjunction) or ‘{suggestion2}’ (meaning ‘for what reason’)."]
    ,"Cal dir __SUGGESTION_1__ (enviat del papa).": ["Debe decirse «{suggestion1}» (enviado del papa).", "Use ‘{suggestion1}’ (the pope’s envoy)."]
    ,"Cal dir __SUGGESTION_1__ (singular o plural). 'Fondo' és un adjectiu o un adverbi.": ["Debe decirse «{suggestion1}» (singular o plural). «Fondo» es un adjetivo o un adverbio.", "Use ‘{suggestion1}’ (singular or plural). ‘Fondo’ is an adjective or adverb."]
    ,"Cal dir __SUGGESTION_1__ en lloc de \"\\1\".": ["Debe decirse «{suggestion1}» en vez de «\\1».", "Use ‘{suggestion1}’ instead of ‘\\1’."]
    ,"Cal dir __SUGGESTION_1__, __SUGGESTION_2__ (adult), o bé __SUGGESTION_3__, __SUGGESTION_4__ (complet, perfecte).": ["Debe decirse «{suggestion1}» o «{suggestion2}» (adulto), o bien «{suggestion3}» o «{suggestion4}» (completo, perfecto).", "Use ‘{suggestion1}’ or ‘{suggestion2}’ (adult), or ‘{suggestion3}’ or ‘{suggestion4}’ (complete, perfect)."]
    ,"Cal dir __SUGGESTION_1__, __SUGGESTION_2__ (adulta), o bé __SUGGESTION_3__, __SUGGESTION_4__ (completa, perfecta).": ["Debe decirse «{suggestion1}» o «{suggestion2}» (adulta), o bien «{suggestion3}» o «{suggestion4}» (completa, perfecta).", "Use ‘{suggestion1}’ or ‘{suggestion2}’ (adult), or ‘{suggestion3}’ or ‘{suggestion4}’ (complete, perfect)."]
    ,"Cal escriure __SUGGESTION_1__ en l'expressió \"tant l'un com l'altre\".": ["En la expresión «tant l’un com l’altre», debe escribirse «{suggestion1}».", "In the expression ‘tant l’un com l’altre’, write ‘{suggestion1}’."]
    ,"Cal escriure __SUGGESTION_1__ o __SUGGESTION_2__ (forma valenciana).": ["Debe escribirse «{suggestion1}» o «{suggestion2}» (forma valenciana).", "Write ‘{suggestion1}’ or ‘{suggestion2}’ (Valencian form)."]
    ,"Cal escriure __SUGGESTION_1__ o bé __SUGGESTION_2__ (no admès per tots els diccionaris).": ["Debe escribirse «{suggestion1}» o «{suggestion2}» (no admitido por todos los diccionarios).", "Write ‘{suggestion1}’ or ‘{suggestion2}’ (not listed in all dictionaries)."]
    ,"Cal escriure \"quan\". Així i tot, molts llibres d'estil recomanen usar una expressió diferent de \"sempre i quan\".": ["Debe escribirse «quan». Aun así, muchos manuales de estilo recomiendan usar una expresión distinta de «sempre i quan».", "Write ‘quan’. However, many style guides recommend using an expression other than ‘sempre i quan’."]
    ,"Cal usar el v. 'reprendre'.": ["Debe usarse el verbo «reprendre».", "Use the verb ‘reprendre’."]
    ,"Cal usar la forma plena.": ["Debe usarse la forma plena.", "Use the full form."]
    ,"Calc de l'anglès que val més evitar.": ["Calco del inglés que conviene evitar.", "Calque from English; avoid it."]
    ,"Caràcter de guió incorrecte.": ["Carácter de guion incorrecto.", "Incorrect hyphen or dash character."]
    ,"Castellanisme en l'àmbit del ciclisme. 'Peloton' pot ser una marca esportiva.": ["Castellanismo del ámbito del ciclismo. «Peloton» podría ser una marca deportiva.", "Spanish borrowing used in cycling. ‘Peloton’ may be a sports brand."]
    ,"Castellanisme. Només és admissible com a nom de plat de cuina empordanesa.": ["Castellanismo. Solo es admisible como nombre de un plato de cocina ampurdanesa.", "Spanish borrowing. Acceptable only as the name of an Empordà dish."]
    ,"Castellanisme. Només és admissible com a nom de plat de cuina valenciana.": ["Castellanismo. Solo es admisible como nombre de un plato de cocina valenciana.", "Spanish borrowing. Acceptable only as the name of a Valencian dish."]
    ,"Com a abreviatura de 'segle' (nom comú), s'escriu en minúscula.": ["Como abreviatura de «segle» (nombre común), se escribe en minúscula.", "As an abbreviation of ‘segle’ (a common noun), it is written in lowercase."]
    ,"Com a adjectiu és una paraula col·loquial no admesa pels diccionaris normatius.": ["Como adjetivo, es una palabra coloquial no admitida por los diccionarios normativos.", "As an adjective, this is a colloquial word not accepted by standard dictionaries."]
    ,"Com a adjectiu és una paraula col·loquial.": ["Como adjetivo, es una palabra coloquial.", "This is a colloquial word when used as an adjective."]
    ,"Com a adjectiu femení, cal dir __SUGGESTION_1__. \"Fixe\" és una forma valenciana del v. 'fixar'.": ["Como adjetivo femenino, debe decirse «{suggestion1}». «Fixe» es una forma valenciana del verbo «fixar».", "As a feminine adjective, use ‘{suggestion1}’. ‘Fixe’ is a Valencian form of the verb ‘fixar’."]
    ,"Com a adjectiu o adverbi, és invariable.": ["Como adjetivo o adverbio, es invariable.", "It is invariable when used as an adjective or adverb."]
    ,"Com a adjectiu o nom femení, no s'apostrofa. L'apostrofació pot ser correcta si és una forma del verb 'internar'.": ["Como adjetivo o sustantivo femenino, no lleva apóstrofo. El apóstrofo puede ser correcto si es una forma del verbo «internar».", "As a feminine adjective or noun, it does not take an apostrophe. An apostrophe may be correct if it is a form of ‘internar’."]
    ,"Com a adjectiu, adverbi o sinònim de 'hipermercat', s'escriu __SUGGESTION_1__.": ["Como adjetivo, adverbio o sinónimo de «hipermercat», se escribe «{suggestion1}».", "As an adjective, adverb, or synonym of ‘hipermercat’, write ‘{suggestion1}’."]
    ,"Com a adjectiu, adverbi o sinònim de 'supermercat', s'escriu __SUGGESTION_1__.": ["Como adjetivo, adverbio o sinónimo de «supermercat», se escribe «{suggestion1}».", "As an adjective, adverb, or synonym of ‘supermercat’, write ‘{suggestion1}’."]
    ,"Com a adjectiu, en aquest context cal dir __SUGGESTION_1__.": ["Como adjetivo, en este contexto debe decirse «{suggestion1}».", "As an adjective, use ‘{suggestion1}’ in this context."]
    ,"Com a adjectiu, és preferible usar la forma singular.": ["Como adjetivo, es preferible usar la forma singular.", "As an adjective, the singular form is preferable."]
    ,"Com a adverbi, __SUGGESTION_1__ s'escriu junt.": ["Como adverbio, «{suggestion1}» se escribe junto.", "As an adverb, ‘{suggestion1}’ is written as one word."]
    ,"Com a adverbi, val més usar una altra expressió.": ["Como adverbio, es preferible usar otra expresión.", "As an adverb, use a different expression."]
    ,"Com a categoria d'automobilisme, s'escriu amb accent.": ["Como categoría del automovilismo, se escribe con tilde.", "As a motorsport category, it takes an accent mark."]
    ,"Com a conjunció que indica causa ('pel fet que'), s'escriu junt.": ["Como conjunción que indica causa («por el hecho de que»), se escribe junto.", "As a conjunction meaning ‘because’, it is written as one word."]
    ,"Com a fórmula de remissió, cal dir __SUGGESTION_1__.": ["Como fórmula de remisión, debe decirse «{suggestion1}».", "As a cross-reference formula, use ‘{suggestion1}’."]
    ,"Com a fórmula introductòria, val més usar una altra expressió.": ["Como fórmula introductoria, es preferible usar otra expresión.", "As an introductory phrase, use a different expression."]
    ,"Com a interjecció, cal escriure \"oh\".": ["Como interjección, debe escribirse «oh».", "As an interjection, write ‘oh’."]
    ,"Com a locució adverbial, __SUGGESTION_1__ no té femení.": ["Como locución adverbial, «{suggestion1}» no tiene forma femenina.", "As an adverbial phrase, ‘{suggestion1}’ has no feminine form."]
    ,"Com a substantiu, forma col·loquial de __SUGGESTION_1__. Correcte com a forma del v. 'despertar'.": ["Como sustantivo, es una forma coloquial de «{suggestion1}». Es correcta como forma del verbo «despertar».", "As a noun, it is a colloquial form of ‘{suggestion1}’. It is correct as a form of ‘despertar’."]
    ,"Davant d’un adjectiu cal escriure __SUGGESTION_1__.": ["Delante de un adjetivo debe escribirse «{suggestion1}».", "Before an adjective, write ‘{suggestion1}’."]
    ,"El pronom 'en' és probablement redundant.": ["El pronombre «en» probablemente es redundante.", "The pronoun ‘en’ is probably redundant."]
    ,"El pronom 'tothom' no pot acompanyar un verb en 1a o 2a persona del plural. Podeu fer servir el pronom 'tots', o bé la 3a persona del singular amb 'tothom'.": ["El pronombre «tothom» no puede acompañar un verbo en primera o segunda persona del plural. Puedes usar «tots» o la tercera persona del singular con «tothom».", "The pronoun ‘tothom’ cannot be used with a first- or second-person plural verb. Use ‘tots’ or the third-person singular with ‘tothom’."]
    ,"El pronom adequat és __SUGGESTION_1__ (a ell, a ella).": ["El pronombre adecuado es «{suggestion1}» (a él, a ella).", "The appropriate pronoun is ‘{suggestion1}’ (to him, to her)."]
    ,"El pronom adequat és __SUGGESTION_1__ (referit a \"\\2\").": ["El pronombre adecuado es «{suggestion1}» (referido a «\\2»).", "The appropriate pronoun is ‘{suggestion1}’ (referring to ‘\\2’)."]
    ,"El pronom adequat és probablement __SUGGESTION_1__ (a ell, a ella).": ["El pronombre adecuado probablemente es «{suggestion1}» (a él, a ella).", "The appropriate pronoun is probably ‘{suggestion1}’ (to him, to her)."]
    ,"El pronom adequat és probablement __SUGGESTION_1__ o __SUGGESTION_2__.": ["Los pronombres adecuados probablemente son «{suggestion1}» o «{suggestion2}».", "The appropriate pronoun is probably ‘{suggestion1}’ or ‘{suggestion2}’."]
    ,"El pronom adequat és probablement __SUGGESTION_1__.": ["El pronombre adecuado probablemente es «{suggestion1}».", "The appropriate pronoun is probably ‘{suggestion1}’."]
    ,"El pronom feble ‘ho’ s’escriu amb h.": ["El pronombre átono «ho» se escribe con hache.", "The weak pronoun ‘ho’ is written with an h."]
    ,"El símbol de quilòmetres s'escriu sense 's' i amb 'k' minúscula.": ["El símbolo de kilómetros se escribe sin «s» y con «k» minúscula.", "The symbol for kilometres is written without an ‘s’ and with a lowercase ‘k’."]
    ,"El símbol del prefix 'kilo-' s'escriu en minúscula.": ["El símbolo del prefijo «kilo-» se escribe en minúscula.", "The symbol for the prefix ‘kilo-’ is written in lowercase."]
    ,"El substantiu 'vall' en el sentit més habitual (depressió entre dos vessants) és femení. Només és masculí amb el sentit de 'excavació, rasa, fossat'.": ["El sustantivo «vall» es femenino en su sentido más habitual (depresión entre dos vertientes). Solo es masculino con el sentido de «excavación, zanja, foso».", "The noun ‘vall’ is feminine in its usual sense (a depression between two slopes). It is masculine only when it means ‘excavation, ditch, moat’."]
    ,"El substantiu \"compte\" és masculí.": ["El sustantivo «compte» es masculino.", "The noun ‘compte’ is masculine."]
    ,"El temps verbal adequat per a referir-se a una acció que ocorre \\2 és el perfet.": ["El tiempo verbal adecuado para referirse a una acción que ocurre «\\2» es el perfecto.", "Use the perfect tense for an action that takes place ‘\\2’."]
    ,"El temps verbal adequat per a referir-se a una acció que ocorre \\4 és el perfet.": ["El tiempo verbal adecuado para referirse a una acción que ocurre «\\4» es el perfecto.", "Use the perfect tense for an action that takes place ‘\\4’."]
    ,"El verb '\\1' no és transitiu en el sentit de 'telefonar'. Useu el pronom adequat.": ["El verbo «\\1» no es transitivo con el sentido de «telefonar». Usa el pronombre adecuado.", "The verb ‘\\1’ is intransitive when it means ‘to telephone’. Use the appropriate pronoun."]
    ,"El verb '\\1' no és transitiu. Useu el pronom adequat.": ["El verbo «\\1» es intransitivo. Usa el pronombre adecuado.", "The verb ‘\\1’ is intransitive. Use the appropriate pronoun."]
    ,"El verb '\\2' no és transitiu en el sentit de 'telefonar'. Useu el pronom adequat.": ["El verbo «\\2» no es transitivo con el sentido de «telefonar». Usa el pronombre adecuado.", "The verb ‘\\2’ is intransitive when it means ‘to telephone’. Use the appropriate pronoun."]
    ,"El verb '\\2' no és transitiu. Useu el pronom adequat.": ["El verbo «\\2» es intransitivo. Usa el pronombre adecuado.", "The verb ‘\\2’ is intransitive. Use the appropriate pronoun."]
    ,"El verb '\\4' és transitiu. Probablement cal canviar el pronom.": ["El verbo «\\4» es transitivo. Probablemente hay que cambiar el pronombre.", "The verb ‘\\4’ is transitive. The pronoun probably needs to be changed."]
    ,"El verb 'caure' no és pronominal.": ["El verbo «caure» no es pronominal.", "The verb ‘caure’ is not pronominal."]
    ,"El verb 'caure' no és reflexiu.": ["El verbo «caure» no es reflexivo.", "The verb ‘caure’ is not reflexive."]
    ,"El verb 'influenciar' és transitiu i no s'usa amb la preposició '\\2'.": ["El verbo «influenciar» es transitivo y no se usa con la preposición «\\2».", "The verb ‘influenciar’ is transitive and is not used with the preposition ‘\\2’."]
    ,"El verb 'pillar' té el sentit original de 'saquejar'. Per a altres significats, val més usar altres verbs.": ["El verbo «pillar» significa originalmente «saquear». Para otros sentidos, es preferible usar otros verbos.", "The verb ‘pillar’ originally means ‘to plunder’. Use a different verb for other meanings."]
    ,"El verb adequat en aquest cas és __SUGGESTION_1__.": ["El verbo adecuado en este caso es «{suggestion1}».", "The appropriate verb here is ‘{suggestion1}’."]
    ,"El verb adequat en aquest cas és probablement __SUGGESTION_1__.": ["El verbo adecuado en este caso probablemente es «{suggestion1}».", "The appropriate verb here is probably ‘{suggestion1}’."]
    ,"El verb adequat és 'posar-se' o 'tocar-se'.": ["El verbo adecuado es «posar-se» o «tocar-se».", "The appropriate verb is ‘posar-se’ or ‘tocar-se’."]
    ,"El verb adequat és \"encetar\". En sentit figurat, podeu usar altres expressions.": ["El verbo adecuado es «encetar». En sentido figurado, puedes usar otras expresiones.", "The appropriate verb is ‘encetar’. In a figurative sense, other expressions can be used."]
    ,"El verb ha de ser imperatiu, gerundi o infinitiu.": ["El verbo debe estar en imperativo, gerundio o infinitivo.", "The verb must be in the imperative, gerund, or infinitive."]
    ,"Els mesos de l'any s'escriuen en minúscula excepte quan formen part d'un nom propi o d'una diada.": ["Los meses del año se escriben en minúscula, excepto cuando forman parte de un nombre propio o de una festividad.", "Months are written in lowercase unless they are part of a proper name or a holiday."]
    ,"Els noms dels principis actius de les medicines s'escriuen en minúscula.": ["Los nombres de los principios activos de los medicamentos se escriben en minúscula.", "The names of medicines’ active ingredients are written in lowercase."]
    ,"Els ordinals s'escriuen sense punt.": ["Los ordinales se escriben sin punto.", "Ordinal numbers are written without a full stop."]
    ,"Els percentatges amb xifres s'escriuen preferiblement amb el símbol \"%\".": ["Es preferible escribir los porcentajes con cifras y el símbolo «%».", "Percentages are preferably written with numerals and the ‘%’ symbol."]
    ,"Els prefixos davant d'una paraula en majúscula s'escriuen amb guionet.": ["Los prefijos delante de una palabra con mayúscula se escriben con guion.", "Prefixes before a capitalised word are joined with a hyphen."]
    ,"Els premis cinematogràfics s'escriuen __SUGGESTION_1__.": ["Los premios cinematográficos se escriben «{suggestion1}».", "Film awards are written as ‘{suggestion1}’."]
    ,"En aquest cas és preferible usar el verb 'respondre' amb la preposició 'a'.": ["En este caso, es preferible usar el verbo «respondre» con la preposición «a».", "In this case, use the verb ‘respondre’ with the preposition ‘a’."]
    ,"En aquest cas és preferible usar el verb 'ser'.": ["En este caso, es preferible usar el verbo «ser».", "In this case, use the verb ‘ser’."]
    ,"En aquest cas val més evitar el possessiu i usar un pronom.": ["En este caso, es preferible evitar el posesivo y usar un pronombre.", "In this case, avoid the possessive and use a pronoun instead."]
    ,"En aquest cas val més evitar l'adjectiu \"\\3\".": ["En este caso, es preferible evitar el adjetivo «\\3».", "In this case, avoid the adjective ‘\\3’."]
    ,"En aquest cas val més evitar l'adjectiu \"\\4\".": ["En este caso, es preferible evitar el adjetivo «\\4».", "In this case, avoid the adjective ‘\\4’."]
    ,"En aquest cas, cal escriure __SUGGESTION_1__.": ["En este caso, debe escribirse «{suggestion1}».", "In this case, write ‘{suggestion1}’."]
    ,"En aquest context (\\1) cal dir \"pinyol\".": ["En este contexto («\\1»), debe decirse «pinyol».", "In this context (‘\\1’), use ‘pinyol’."]
    ,"En aquest context (\\1), \"severament\" pot ser un calc inapropiat de l'anglès.": ["En este contexto («\\1»), «severament» puede ser un calco inadecuado del inglés.", "In this context (‘\\1’), ‘severament’ may be an unsuitable calque from English."]
    ,"En aquest context (\\2), \"severitat\" pot ser un calc inapropiat de l'anglès.": ["En este contexto («\\2»), «severitat» puede ser un calco inadecuado del inglés.", "In this context (‘\\2’), ‘severitat’ may be an unsuitable calque from English."]
    ,"En aquest context (\\4) cal dir __SUGGESTION_1__.": ["En este contexto («\\4»), debe decirse «{suggestion1}».", "In this context (‘\\4’), use ‘{suggestion1}’."]
    ,"En aquest context (\\4) cal dir \"pinyol\".": ["En este contexto («\\4»), debe decirse «pinyol».", "In this context (‘\\4’), use ‘pinyol’."]
    ,"En aquest context cal dir __SUGGESTION_1__ en masculí.": ["En este contexto, debe decirse «{suggestion1}» en masculino.", "In this context, use ‘{suggestion1}’ in the masculine form."]
    ,"En aquest context cal dir __SUGGESTION_1__. \"Oïda\" només s'usa en el sentit de 'sentit pel qual es perceben els sons'.": ["En este contexto, debe decirse «{suggestion1}». «Oïda» solo se usa con el sentido de «sentido por el que se perciben los sonidos».", "In this context, use ‘{suggestion1}’. ‘Oïda’ is used only to mean ‘the sense by which sounds are perceived’."]
    ,"En aquest context és més apropiat dir \"mena\" en lloc de \"tipus\" (model).": ["En este contexto es más adecuado decir «mena» en vez de «tipus» (modelo).", "In this context, ‘mena’ is more appropriate than ‘tipus’ (model, type)."]
    ,"En aquest context és més precís usar el v. 'elegir'.": ["En este contexto es más preciso usar el verbo «elegir».", "In this context, the verb ‘elegir’ is more precise."]
    ,"En aquest context és preferible fer servir el v. 'exercir'.": ["En este contexto es preferible usar el verbo «exercir».", "In this context, use the verb ‘exercir’."]
    ,"En aquest context és preferible usar el verb 'anar'.": ["En este contexto es preferible usar el verbo «anar».", "In this context, use the verb ‘anar’."]
    ,"En aquest context s'escriu separat (adverbi 'mal' seguit del participi 'entès').": ["En este contexto se escribe separado (el adverbio «mal» seguido del participio «entès»).", "In this context, write it as two words (the adverb ‘mal’ followed by the participle ‘entès’)."]
    ,"En aquest context sol usar-se la paraula __SUGGESTION_1__.": ["En este contexto suele usarse la palabra «{suggestion1}».", "The word ‘{suggestion1}’ is usually used in this context."]
    ,"En aquest context, \"massiu\" és probablement un anglicisme.": ["En este contexto, «massiu» probablemente es un anglicismo.", "In this context, ‘massiu’ is probably an English borrowing."]
    ,"En aquest context, cal dir __SUGGESTION_1__. Un \"pedaç\" és un tros de roba.": ["En este contexto, debe decirse «{suggestion1}». Un «pedaç» es un trozo de tela.", "In this context, use ‘{suggestion1}’. A ‘pedaç’ is a piece of cloth."]
    ,"En aquest context, cal usar el verb en mode indicatiu.": ["En este contexto, hay que usar el verbo en modo indicativo.", "In this context, use the verb in the indicative mood."]
    ,"En aquest context, cal usar una altra expressió.": ["En este contexto, hay que usar otra expresión.", "Use a different expression in this context."]
    ,"En aquest context, el verb adequat és 'obrir'.": ["En este contexto, el verbo adecuado es «obrir».", "In this context, the appropriate verb is ‘obrir’."]
    ,"En aquest context, és preferible usar l'adjectiu 'gros'.": ["En este contexto, es preferible usar el adjetivo «gros».", "In this context, the adjective ‘gros’ is preferable."]
    ,"En aquest context, fem servir una altra paraula.": ["En este contexto, usamos otra palabra.", "Use a different word in this context."]
    ,"En aquest context, la paraula adequada és __SUGGESTION_1__ (condició, hipòtesi).": ["En este contexto, la palabra adecuada es «{suggestion1}» (condición, hipótesis).", "In this context, the appropriate word is ‘{suggestion1}’ (condition, hypothesis)."]
    ,"En aquest context, la paraula adequada és \"plantilla\". \"Planter\" és el lloc on es crien plantes o, en sentit figurat, un lloc de formació.": ["En este contexto, la palabra adecuada es «plantilla». «Planter» es el lugar donde se cultivan plantas o, en sentido figurado, un lugar de formación.", "In this context, the appropriate word is ‘plantilla’. ‘Planter’ is a place where plants are grown or, figuratively, a training ground."]
    ,"En aquest context, sembla més adequat el verb 'proferir' (dir, pronunciar). \"Proliferar\" vol dir 'reproduir-se, escampar-se'.": ["En este contexto, parece más adecuado el verbo «proferir» (decir, pronunciar). «Proliferar» significa «reproducirse, extenderse».", "In this context, ‘proferir’ (to say, utter) is more appropriate. ‘Proliferar’ means ‘to reproduce, spread’."]
    ,"En aquest context, val més fer servir un altre verb.": ["En este contexto, es preferible usar otro verbo.", "Use a different verb in this context."]
    ,"En aquest sentit, cal dir __SUGGESTION_1__ (nom femení).": ["Con este sentido, debe decirse «{suggestion1}» (sustantivo femenino).", "In this sense, use ‘{suggestion1}’ (feminine noun)."]
    ,"En aquesta expressió el nom \"termini\" va en singular.": ["En esta expresión, el sustantivo «termini» va en singular.", "In this expression, the noun ‘termini’ is singular."]
    ,"En aquesta expressió és més habitual dir \"provisió\".": ["En esta expresión, es más habitual decir «provisió».", "In this expression, ‘provisió’ is more commonly used."]
    ,"En aquesta expressió és preferible usar l'adjectiu \"\\2\".": ["En esta expresión, es preferible usar el adjetivo «\\2».", "In this expression, use the adjective ‘\\2’."]
    ,"En aquesta expressió, \"terra\" s'escriu preferentment sense article.": ["En esta expresión, «terra» se escribe preferentemente sin artículo.", "In this expression, ‘terra’ is preferably used without an article."]
    ,"En aquesta expressió, cal dir __SUGGESTION_1__.": ["En esta expresión, debe decirse «{suggestion1}».", "In this expression, use ‘{suggestion1}’."]
    ,"En aquesta expressió, el verb 'fer' és preferiblement no pronominal.": ["En esta expresión, es preferible que el verbo «fer» no sea pronominal.", "In this expression, the verb ‘fer’ is preferably used without a pronoun."]
    ,"En aquesta expressió, és més apropiat usar el verb 'fer'.": ["En esta expresión, es más apropiado usar el verbo «fer».", "In this expression, the verb ‘fer’ is more appropriate."]
    ,"En aquesta expressió, val més usar el verb 'fer'.": ["En esta expresión, es preferible usar el verbo «fer».", "In this expression, use the verb ‘fer’."]
    ,"En català es diu __SUGGESTION_1__.": ["En catalán se dice «{suggestion1}».", "In Catalan, use ‘{suggestion1}’."]
    ,"En català escrivim __SUGGESTION_1__. Val d'Aran és la forma en aranès.": ["En catalán escribimos «{suggestion1}». «Val d’Aran» es la forma en aranés.", "In Catalan, write ‘{suggestion1}’. ‘Val d’Aran’ is the Aranese form."]
    ,"En dates, és més apropiat escriure __SUGGESTION_1__.": ["En las fechas, es más apropiado escribir «{suggestion1}».", "For dates, it is more appropriate to write ‘{suggestion1}’."]
    ,"En el sentit de __SUGGESTION_1__ és un calc del castellà.": ["Con el sentido de «{suggestion1}», es un calco del castellano.", "When used to mean ‘{suggestion1}’, it is a calque from Spanish."]
    ,"En el sentit de __SUGGESTION_1__ no és acceptat per tots els diccionaris.": ["Con el sentido de «{suggestion1}», no está admitido por todos los diccionarios.", "When used to mean ‘{suggestion1}’, it is not accepted by all dictionaries."]
    ,"En el sentit de 'disposar les coses per a menjar' cal dir __SUGGESTION_1__. Pot ser correcte en altres sentits.": ["Con el sentido de «disponer las cosas para comer», debe decirse «{suggestion1}». Puede ser correcto con otros sentidos.", "When it means ‘to set out a meal’, use ‘{suggestion1}’. It may be correct with other meanings."]
    ,"En el sentit de 'dormir, adormir-se', cal usar una altra expressió.": ["Con el sentido de «dormir, quedarse dormido», debe usarse otra expresión.", "Use a different expression when it means ‘to sleep, fall asleep’."]
    ,"En el sentit de 'encendre', s'escriu 'botar foc'.": ["Con el sentido de «encender», se escribe «botar foc».", "When it means ‘to light’, write ‘botar foc’."]
    ,"En el sentit de 'enrabiar, emmurriar' és col·loquial i no admès pels diccionaris normatius.": ["Con el sentido de «enfadar, poner de mal humor», es coloquial y no está admitido por los diccionarios normativos.", "When it means ‘to anger, put in a bad mood’, it is colloquial and not accepted by standard dictionaries."]
    ,"En el sentit de 'fer trossos amb un colp' cal dir __SUGGESTION_1__.": ["Con el sentido de «hacer pedazos de un golpe», debe decirse «{suggestion1}».", "When it means ‘to smash into pieces with a blow’, use ‘{suggestion1}’."]
    ,"En el sentit de 'gelat' és preferible dir __SUGGESTION_1__.": ["Con el sentido de «helado», es preferible decir «{suggestion1}».", "When it means ‘ice cream’, use ‘{suggestion1}’."]
    ,"En el sentit de 'molt, en gran quantitat, en grau elevat' cal dir __SUGGESTION_1__.": ["Con el sentido de «mucho, en gran cantidad o en alto grado», debe decirse «{suggestion1}».", "When it means ‘a lot, in large quantities, or to a great extent’, use ‘{suggestion1}’."]
    ,"En el sentit de 'ninot' o 'persona sense caràcter' és un mot masculí. És femení com a tipus d'ocell.": ["Con el sentido de «muñeco» o «persona sin carácter», es masculino. Es femenino como tipo de pájaro.", "It is masculine when it means ‘puppet’ or ‘spineless person’. It is feminine as a type of bird."]
    ,"En el sentit de 'no dormir' o 'vigilar', cal usar una altra expressió.": ["Con el sentido de «no dormir» o «vigilar», debe usarse otra expresión.", "Use a different expression when it means ‘to stay awake’ or ‘to keep watch’."]
    ,"En el sentit de 'portar (algú o alguna cosa) de baix a dalt', cal dir __SUGGESTION_1__.": ["Con el sentido de «llevar a alguien o algo de abajo arriba», debe decirse «{suggestion1}».", "When it means ‘to carry someone or something upwards’, use ‘{suggestion1}’."]
    ,"En el sentit de 'quantitat' cal dir __SUGGESTION_1__ (nombre).": ["Con el sentido de «cantidad», debe decirse «{suggestion1}» (número).", "When it means ‘quantity’, use ‘{suggestion1}’ (number)."]
    ,"En el sentit de 'societat religiosa', 'ritu cristià' o 'cos de persones unides per una regla', cal dir __SUGGESTION_1__.": ["Con el sentido de «comunidad religiosa», «rito cristiano» o «grupo de personas unidas por una regla», debe decirse «{suggestion1}».", "When it means a ‘religious community’, ‘Christian rite’, or ‘group bound by a rule’, use ‘{suggestion1}’."]
    ,"En el sentit de 'societat religiosa', 'ritu cristià' o 'cos de persones unides per una regla', cal dir \"orde\" (masculí).": ["Con el sentido de «comunidad religiosa», «rito cristiano» o «grupo de personas unidas por una regla», debe decirse «orde» (masculino).", "When it means a ‘religious community’, ‘Christian rite’, or ‘group bound by a rule’, use masculine ‘orde’."]
    ,"En el sentit de 'tenir importància per a algú', el pronom adequat és \"li\".": ["Con el sentido de «ser importante para alguien», el pronombre adecuado es «li».", "When it means ‘to matter to someone’, the appropriate pronoun is ‘li’."]
    ,"En el sentit de \"començar a consumir\" val més usar el verb 'encetar'.": ["Con el sentido de «empezar a consumir», es preferible usar el verbo «encetar».", "When it means ‘to start consuming’, use the verb ‘encetar’."]
    ,"En el sentit de condecoració, cal escriure __SUGGESTION_1__ (nom masculí).": ["Con el sentido de «condecoración», debe escribirse «{suggestion1}» (sustantivo masculino).", "When it means ‘decoration/medal’, write ‘{suggestion1}’ (masculine noun)."]
    ,"En el sentit de cosa o persona molesta, val més usar una altra expressió. \"Incordi\", en l'àmbit mèdic, és una patologia.": ["Con el sentido de «cosa o persona molesta», es preferible usar otra expresión. «Incordi», en el ámbito médico, es una patología.", "When it means ‘an annoying thing or person’, use a different expression. In medicine, ‘incordi’ is a pathology."]
    ,"En frases condicionals és preferible usar __SUGGESTION_1__ en comptes de \"quelcom\".": ["En oraciones condicionales, es preferible usar «{suggestion1}» en vez de «quelcom».", "In conditional sentences, use ‘{suggestion1}’ rather than ‘quelcom’."]
    ,"En frases interrogatives és preferible usar __SUGGESTION_1__ en comptes de \"quelcom\".": ["En oraciones interrogativas, es preferible usar «{suggestion1}» en vez de «quelcom».", "In interrogative sentences, use ‘{suggestion1}’ rather than ‘quelcom’."]
    ,"En general és preferible usar el v. 'temptejar'. 'Tantejar' (fer ús del dret de tanteig) es fa servir en dret civil.": ["En general, es preferible usar el verbo «temptejar». «Tantejar» (ejercer el derecho de tanteo) se usa en derecho civil.", "In general, use the verb ‘temptejar’. ‘Tantejar’ (to exercise a right of first refusal) is used in civil law."]
    ,"En l'àmbit d'internet, podeu evitar aquest anglicisme dient \"amfitrió\". En el sentit d'exèrcit, \"host\" és un nom femení.": ["En el ámbito de internet, puedes evitar este anglicismo diciendo «amfitrió». Con el sentido de «ejército», «host» es un sustantivo femenino.", "In internet contexts, avoid this English borrowing by using ‘amfitrió’. In the sense of ‘army’, ‘host’ is a feminine noun."]
    ,"En l'àmbit del bàsquet, cal dir __SUGGESTION_1__.": ["En el ámbito del baloncesto, debe decirse «{suggestion1}».", "In basketball, use ‘{suggestion1}’."]
    ,"En l'àmbit del dret, l'expressió adequada és __SUGGESTION_1__.": ["En el ámbito del derecho, la expresión adecuada es «{suggestion1}».", "In legal contexts, the appropriate expression is ‘{suggestion1}’."]
    ,"En les dates els mesos de l'any s'escriuen en minúscula.": ["En las fechas, los meses del año se escriben en minúscula.", "In dates, the names of months are written in lowercase."]
    ,"En les fórmules de salutació, és preferible prescindir de \"molt\".": ["En las fórmulas de saludo, es preferible prescindir de «molt».", "In greetings, it is preferable to omit ‘molt’."]
    ,"En llenguatge formal cal dir __SUGGESTION_1__ o __SUGGESTION_2__.": ["En lenguaje formal, debe decirse «{suggestion1}» o «{suggestion2}».", "In formal writing, use ‘{suggestion1}’ or ‘{suggestion2}’."]
    ,"En llenguatge formal cal dir __SUGGESTION_1__.": ["En lenguaje formal, debe decirse «{suggestion1}».", "In formal writing, use ‘{suggestion1}’."]
    ,"En llenguatge formal, val més usar una altra expressió.": ["En lenguaje formal, es preferible usar otra expresión.", "In formal writing, use a different expression."]
    ,"En referència al papa de Roma, cal dir __SUGGESTION_1__.": ["En referencia al papa de Roma, debe decirse «{suggestion1}».", "When referring to the Pope in Rome, use ‘{suggestion1}’."]
    ,"En registre formal, cal escriure __SUGGESTION_1__.": ["En un registro formal, debe escribirse «{suggestion1}».", "In a formal register, write ‘{suggestion1}’."]
    ,"En registres formals usem el verb 'recordar' en comptes de 'enrecordar'. El pronom 'en' substitueix un complement que comença amb la preposició 'de'.": ["En registros formales, usamos el verbo «recordar» en vez de «enrecordar». El pronombre «en» sustituye a un complemento que empieza por la preposición «de».", "In formal registers, use ‘recordar’ instead of ‘enrecordar’. The pronoun ‘en’ replaces a complement introduced by ‘de’."]
    ,"En sentit figurat (preocupació, trasbals), s'escriu __SUGGESTION_1__.": ["En sentido figurado (preocupación, agitación), se escribe «{suggestion1}».", "In the figurative sense (worry, distress), write ‘{suggestion1}’."]
    ,"En sentit figurat, és preferible dir __SUGGESTION_1__.": ["En sentido figurado, es preferible decir «{suggestion1}».", "In the figurative sense, use ‘{suggestion1}’."]
    ,"En sentit figurat, és preferible usar el verb 'estar'.": ["En sentido figurado, es preferible usar el verbo «estar».", "In the figurative sense, use the verb ‘estar’."]
    ,"En sentit figurat, és un calc del castellà. Useu una expressió alternativa.": ["En sentido figurado, es un calco del castellano. Usa una expresión alternativa.", "In the figurative sense, this is a calque from Spanish. Use an alternative expression."]
    ,"En sentit figurat, l'expressió adequada és \"estar en els llimbs\".": ["En sentido figurado, la expresión adecuada es «estar en els llimbs».", "In the figurative sense, the appropriate expression is ‘estar en els llimbs’."]
    ,"En sentit matemàtic cal dir __SUGGESTION_1__.": ["En sentido matemático, debe decirse «{suggestion1}».", "In the mathematical sense, use ‘{suggestion1}’."]
    ,"En un cartell o en un mapa, és més apropiat escriure __SUGGESTION_1__.": ["En un cartel o en un mapa, es más apropiado escribir «{suggestion1}».", "On a sign or map, it is more appropriate to write ‘{suggestion1}’."]
    ,"En un registre formal cal dir __SUGGESTION_1__, no \"els hi\".": ["En un registro formal, debe decirse «{suggestion1}», no «els hi».", "In a formal register, use ‘{suggestion1}’, not ‘els hi’."]
    ,"En un text formal, eviteu aquesta grafia numèrica informal.": ["En un texto formal, evita esta notación numérica informal.", "Avoid this informal number notation in formal writing."]
    ,"Encara que 'gord' és en els diccionaris, és més natural usar un altre adjectiu.": ["Aunque «gord» figura en los diccionarios, es más natural usar otro adjetivo.", "Although ‘gord’ is listed in dictionaries, a different adjective sounds more natural."]
    ,"Error de concordança o d'accentuació.": ["Error de concordancia o de acentuación.", "Agreement or accentuation error."]
    ,"Error de concordança si s'usa com a nom femení. \\3 també existeix com a nom masculí.": ["Error de concordancia si se usa como sustantivo femenino. «\\3» también existe como sustantivo masculino.", "Agreement error if used as a feminine noun. ‘\\3’ also exists as a masculine noun."]
    ,"Error de concordança. \"Mixtes\" és un adjectiu femení.": ["Error de concordancia. «Mixtes» es un adjetivo femenino.", "Agreement error. ‘Mixtes’ is a feminine adjective."]
    ,"Error de concordança. El femení de l'adjectiu ordinal \"segon\" és \"segona\".": ["Error de concordancia. El femenino del adjetivo ordinal «segon» es «segona».", "Agreement error. The feminine form of the ordinal adjective ‘segon’ is ‘segona’."]
    ,"Error de puntuació.": ["Error de puntuación.", "Punctuation error."]
    ,"Error ortogràfic. Confusió entre el número zero i la lletra o.": ["Error ortográfico. Confusión entre el número cero y la letra o.", "Spelling error. The number zero is confused with the letter o."]
    ,"És més apropiat usar una altra expressió.": ["Es más apropiado usar otra expresión.", "A different expression is more appropriate."]
    ,"És més habitual fer servir la transcripció internacional.": ["Es más habitual usar la transcripción internacional.", "The international transcription is more commonly used."]
    ,"Es pot escriure junt.": ["Se puede escribir junto.", "It can be written as one word."]
    ,"És preferible construir aquesta frase amb el verb 'ser'.": ["Es preferible construir esta frase con el verbo «ser».", "It is preferable to construct this sentence with the verb ‘ser’."]
    ,"És preferible dir __SUGGESTION_1__. \"Ofertar\" no és admès per tots els diccionaris.": ["Es preferible decir «{suggestion1}». «Ofertar» no está admitido por todos los diccionarios.", "Use ‘{suggestion1}’. ‘Ofertar’ is not accepted by all dictionaries."]
    ,"És preferible escriure 'tant o més'.": ["Es preferible escribir «tant o més».", "It is preferable to write ‘tant o més’."]
    ,"És preferible escriure aquests nombres amb lletres.": ["Es preferible escribir estos números con letras.", "It is preferable to spell out these numbers."]
    ,"És preferible l'escriptura amb guionet.": ["Es preferible escribirlo con guion.", "It is preferable to write it with a hyphen."]
    ,"És preferible no fer pronominal el verb \"passar\" referit a un període de temps.": ["Es preferible no usar el verbo «passar» como pronominal cuando se refiere a un periodo de tiempo.", "Avoid using ‘passar’ pronominally when referring to a period of time."]
    ,"És preferible usar el verb 'sentir' en correspondència amb el verb 'dir'.": ["Es preferible usar el verbo «sentir» en correspondencia con el verbo «dir».", "Use the verb ‘sentir’ to correspond with the verb ‘dir’."]
    ,"És preferible usar l'article en els dos elements.": ["Es preferible usar el artículo en los dos elementos.", "It is preferable to use the article with both elements."]
    ,"És preferible usar la paraula __SUGGESTION_1__.": ["Es preferible usar la palabra «{suggestion1}».", "It is preferable to use the word ‘{suggestion1}’."]
    ,"És preferible usar xifres amb el símbol %.": ["Es preferible usar cifras con el símbolo «%».", "It is preferable to use numerals with the ‘%’ symbol."]
    ,"És recomanable usar la codificació de la ela geminada amb tres caràcters, amb el caràcter de punt volat (U+00B7).": ["Se recomienda escribir la ele geminada con los tres caracteres, incluido el punto volado (U+00B7).", "Use the three-character representation of the geminate l, including the raised dot (U+00B7)."]
    ,"Escrivim __SUGGESTION_1__ davant d'algunes expressions de temps.": ["Escribimos «{suggestion1}» delante de algunas expresiones de tiempo.", "Write ‘{suggestion1}’ before certain time expressions."]
    ,"Escrivim __SUGGESTION_1__ davant d'alguns adverbis de temps i de lloc.": ["Escribimos «{suggestion1}» delante de algunos adverbios de tiempo y lugar.", "Write ‘{suggestion1}’ before certain adverbs of time and place."]
    ,"Escrivim __SUGGESTION_1__ davant locució adverbial de temps.": ["Escribimos «{suggestion1}» delante de una locución adverbial de tiempo.", "Write ‘{suggestion1}’ before an adverbial phrase of time."]
    ,"Esteu usant possessius amb 'v'.": ["Estás usando posesivos con «v».", "You are using possessives with ‘v’."]
    ,"Eviteu aquest anglicisme.": ["Evita este anglicismo.", "Avoid this English borrowing."]
    ,"Eviteu els anglicismes.": ["Evita los anglicismos.", "Avoid English borrowings."]
    ,"Eviteu la repetició de \"tot\" fent servir una altra expressió.": ["Evita repetir «tot» usando otra expresión.", "Avoid repeating ‘tot’ by using a different expression."]
    ,"Expressió castellana. Podeu dir \"veure's el llautó\" o \"ensenyar l'orella\".": ["Expresión castellana. Puedes decir «veure’s el llautó» o «ensenyar l’orella».", "Spanish expression. Use ‘veure’s el llautó’ or ‘ensenyar l’orella’."]
    ,"Expressió equivalent.": ["Expresión equivalente.", "Equivalent expression."]
    ,"Expressió inadequada en el sentit de __SUGGESTION_1__.": ["Expresión inadecuada con el sentido de «{suggestion1}».", "Inappropriate expression when it means ‘{suggestion1}’."]
    ,"Expressió inadequada si correspon a alguna de les alternatives.": ["Expresión inadecuada si corresponde a alguna de las alternativas.", "Inappropriate expression if one of the alternatives is intended."]
    ,"Expressió inapropiada en el sentit de __SUGGESTION_1__.": ["Expresión inapropiada con el sentido de «{suggestion1}».", "Inappropriate expression when it means ‘{suggestion1}’."]
    ,"Expressió incoherent i preposició inadequada.": ["Expresión incoherente y preposición inadecuada.", "Inconsistent expression and inappropriate preposition."]
    ,"Expressió incoherent. ¿Volíeu dir __SUGGESTION_1__?": ["Expresión incoherente. ¿Querías decir «{suggestion1}»?", "Inconsistent expression. Did you mean ‘{suggestion1}’?"]
    ,"Expressió incoherent. Useu-ne una d'alternativa.": ["Expresión incoherente. Usa una alternativa.", "Inconsistent expression. Use an alternative."]
    ,"Expressió incompleta.": ["Expresión incompleta.", "Incomplete expression."]
    ,"Expressió incorrecta amb el sentit de 'en el moment que'.": ["Expresión incorrecta con el sentido de «en el momento en que».", "Incorrect expression when it means ‘at the time when’."]
    ,"Expressió incorrecta amb el sentit de 'interès, esforç' o 'esforçar-se'.": ["Expresión incorrecta con el sentido de «interés, esfuerzo» o «esforzarse».", "Incorrect expression when it means ‘interest, effort’ or ‘to make an effort’."]
    ,"Expressió incorrecta amb el sentit de 'obstinar-se, entossudir-se'.": ["Expresión incorrecta con el sentido de «obstinarse, emperrarse».", "Incorrect expression when it means ‘to persist, dig in one’s heels’."]
    ,"Expressió incorrecta amb valor causal. En altres sentits també és preferible evitar-la.": ["Expresión incorrecta con valor causal. También es preferible evitarla con otros sentidos.", "Incorrect expression when used causally. It is also best avoided with other meanings."]
    ,"Expressió incorrecta en el sentit de \"mocar-se\".": ["Expresión incorrecta con el sentido de «sonarse la nariz».", "Incorrect expression when it means ‘to blow one’s nose’."]
    ,"Expressió incorrecta per a referir-se a una classe de torró.": ["Expresión incorrecta para referirse a una clase de turrón.", "Incorrect expression for a type of nougat."]
    ,"Expressió incorrecta si equival a __SUGGESTION_1__. Correcta si equival a __SUGGESTION_2__.": ["Expresión incorrecta si equivale a «{suggestion1}». Es correcta si equivale a «{suggestion2}».", "Incorrect expression if it means ‘{suggestion1}’. Correct if it means ‘{suggestion2}’."]
    ,"Expressió incorrecta si equival a 'guanyar-se el favor'.": ["Expresión incorrecta cuando significa «ganarse el favor».", "Incorrect expression when it means ‘to win someone’s favour’."]
    ,"Expressió incorrecta si vol dir \"en comptes de\", \"en lloc de\".": ["Expresión incorrecta cuando significa «en vez de», «en lugar de».", "Incorrect expression when it means ‘instead of’."]
    ,"Expressió incorrecta si vol dir \"rastre\" o \"traça\".": ["Expresión incorrecta cuando significa «rastro» o «huella».", "Incorrect expression when it means ‘trail’ or ‘trace’."]
    ,"Expressió incorrecta si vol dir \"seguir les petjades\" o \"seguir el rastre\".": ["Expresión incorrecta cuando significa «seguir las huellas» o «seguir el rastro».", "Incorrect expression when it means ‘to follow someone’s footsteps’ or ‘to follow a trail’."]
    ,"Expressió incorrecta, si no és una forma balear del verb 'abaixar'.": ["Expresión incorrecta, salvo que sea una forma balear del verbo «abaixar».", "Incorrect expression unless it is a Balearic form of the verb ‘abaixar’."]
    ,"Expressió llatina incorrecta.": ["Expresión latina incorrecta.", "Incorrect Latin expression."]
    ,"Expressió probablement incorrecta. Correcte si \"albor\" (masc.) es refereix a un peix.": ["Expresión probablemente incorrecta. Es correcta si «albor» (masculino) se refiere a un pez.", "Probably incorrect expression. It is correct if masculine ‘albor’ refers to a fish."]
    ,"Falta el punt en l'abreviatura.": ["Falta el punto en la abreviatura.", "The abbreviation is missing a full stop."]
    ,"Falta la preposició 'de'.": ["Falta la preposición «de».", "The preposition ‘de’ is missing."]
    ,"Falta un accent en 'què' (= quina cosa).": ["Falta una tilde en «què» (= qué cosa).", "‘Què’ is missing an accent mark (= ‘what thing’)."]
    ,"Falta un espai, i el símbol del prefix 'kilo-' s'escriu en minúscula.": ["Falta un espacio, y el símbolo del prefijo «kilo-» se escribe en minúscula.", "A space is missing, and the symbol for the prefix ‘kilo-’ is written in lowercase."]
    ,"Falta un guionet entre els pronoms febles.": ["Falta un guion entre los pronombres átonos.", "A hyphen is missing between the weak pronouns."]
    ,"Falta un infinitiu o un gerundi.": ["Falta un infinitivo o un gerundio.", "An infinitive or gerund is missing."]
    ,"Falta un punt per a completar l'abreviatura.": ["Falta un punto para completar la abreviatura.", "A full stop is needed to complete the abbreviation."]
    ,"Falta una 'a'.": ["Falta una «a».", "An ‘a’ is missing."]
    ,"Feu la redacció més fluida prescindint del verb comodí 'poder' i l'arcaisme 'per tal de'.": ["Mejora la fluidez del texto prescindiendo del verbo comodín «poder» y del arcaísmo «per tal de».", "Improve the flow by removing the all-purpose verb ‘poder’ and the archaic phrase ‘per tal de’."]
    ,"Feu la redacció més fluida usant un verb en comptes d'un nom.": ["Mejora la fluidez del texto usando un verbo en vez de un sustantivo.", "Improve the flow by using a verb instead of a noun."]
    ,"Feu més fluida la redacció prescindint del verb comodí 'procedir' i l'arcaisme 'per tal de'.": ["Mejora la fluidez del texto prescindiendo del verbo comodín «procedir» y del arcaísmo «per tal de».", "Improve the flow by removing the all-purpose verb ‘procedir’ and the archaic phrase ‘per tal de’."]
    ,"Feu servir __SUGGESTION_1__ (nom masculí), __SUGGESTION_2__ (incandescent o elèctrica) o __SUGGESTION_3__ (de combustible). Reserveu __SUGGESTION_4__ per a usos especialitzats.": ["Usa «{suggestion1}» (sustantivo masculino), «{suggestion2}» (incandescente o eléctrica) o «{suggestion3}» (de combustible). Reserva «{suggestion4}» para usos especializados.", "Use ‘{suggestion1}’ (masculine noun), ‘{suggestion2}’ (incandescent or electric), or ‘{suggestion3}’ (fuel-powered). Reserve ‘{suggestion4}’ for specialised uses."]
    ,"Feu servir __SUGGESTION_1__ (nom masculí), __SUGGESTION_2__ (incandescents o elèctriques) o __SUGGESTION_3__ (de combustible). Reserveu __SUGGESTION_4__ per a usos especialitzats.": ["Usa «{suggestion1}» (sustantivo masculino), «{suggestion2}» (incandescentes o eléctricas) o «{suggestion3}» (de combustible). Reserva «{suggestion4}» para usos especializados.", "Use ‘{suggestion1}’ (masculine noun), ‘{suggestion2}’ (incandescent or electric), or ‘{suggestion3}’ (fuel-powered). Reserve ‘{suggestion4}’ for specialised uses."]
    ,"Forma antiga o col·loquial de __SUGGESTION_1__.": ["Forma antigua o coloquial de «{suggestion1}».", "Old or colloquial form of ‘{suggestion1}’."]
    ,"Forma balear o antiga.": ["Forma balear o antigua.", "Balearic or archaic form."]
    ,"Forma col·loquial de __SUGGESTION_1__. Correcte com a forma del v. 'filar'.": ["Forma coloquial de «{suggestion1}». Correcta como forma del verbo «filar».", "Colloquial form of ‘{suggestion1}’. Correct as a form of ‘filar’."]
    ,"Forma col·loquial, no admesa per la major part dels diccionaris.": ["Forma coloquial, no admitida por la mayoría de los diccionarios.", "Colloquial form not accepted by most dictionaries."]
    ,"Forma col·loquial. Correcte com a forma del v. 'filar'.": ["Forma coloquial. Correcta como forma del verbo «filar».", "Colloquial form. Correct as a form of ‘filar’."]
    ,"Forma de plural col·loquial.": ["Forma plural coloquial.", "Colloquial plural form."]
    ,"Forma de plural incorrecta. Useu __SUGGESTION_1__ o __SUGGESTION_2__ (col·loquial).": ["Forma plural incorrecta. Usa «{suggestion1}» o «{suggestion2}» (coloquial).", "Incorrect plural form. Use ‘{suggestion1}’ or ‘{suggestion2}’ (colloquial)."]
    ,"Forma de pronom feble incorrecta en aquesta posició.": ["Forma incorrecta del pronombre átono en esta posición.", "Incorrect weak-pronoun form in this position."]
    ,"Forma de pronom incorrecta.": ["Forma incorrecta del pronombre.", "Incorrect pronoun form."]
    ,"Forma familiar mallorquina de __SUGGESTION_1__.": ["Forma familiar mallorquina de «{suggestion1}».", "Familiar Mallorcan form of ‘{suggestion1}’."]
    ,"Forma secundària (gal·licisme).": ["Forma secundaria (galicismo).", "Secondary form (Gallicism)."]
    ,"Forma secundària adaptada en __SUGGESTION_1__.": ["Forma secundaria adaptada en «{suggestion1}».", "Secondary form adapted as ‘{suggestion1}’."]
    ,"Forma secundària de 'arrossegar'. ¿O volíeu dir 'rosegar' (esmicolar amb les dents)?": ["Forma secundaria de «arrossegar». ¿O querías decir «rosegar» (desmenuzar con los dientes)?", "Secondary form of ‘arrossegar’. Or did you mean ‘rosegar’ (to chew into small pieces)?"]
    ,"Forma secundària o antiga.": ["Forma secundaria o antigua.", "Secondary or archaic form."]
    ,"Forma secundària o paraula col·loquial.": ["Forma secundaria o palabra coloquial.", "Secondary form or colloquial word."]
    ,"Forma secundària que val més evitar en la llengua formal.": ["Forma secundaria que es preferible evitar en el lenguaje formal.", "Secondary form best avoided in formal writing."]
    ,"Forma verbal balear.": ["Forma verbal balear.", "Balearic verb form."]
    ,"Forma verbal incompleta. Useu els verbs 'haver-hi', 'caldre' o 'deure', o bé completeu la perífrasi 'haver de + infinitiu'.": ["Forma verbal incompleta. Usa los verbos «haver-hi», «caldre» o «deure», o completa la perífrasis «haver de + infinitivo».", "Incomplete verb form. Use ‘haver-hi’, ‘caldre’, or ‘deure’, or complete the construction ‘haver de + infinitive’."]
    ,"Forma verbal incorrecta (del v. 'soldre').": ["Forma verbal incorrecta (del verbo «soldre»).", "Incorrect verb form (from ‘soldre’)."]
    ,"Formalment, cal escriure __SUGGESTION_1__. La combinació de pronoms 'els hi' per al complement indirecte és informal en molts casos.": ["En un registro formal, debe escribirse «{suggestion1}». La combinación de pronombres «els hi» como complemento indirecto es informal en muchos casos.", "In formal writing, use ‘{suggestion1}’. The pronoun combination ‘els hi’ as an indirect object is informal in many cases."]
    ,"Fórmula sovint innecessària, llevat de contexts molt tècnics.": ["Fórmula a menudo innecesaria, salvo en contextos muy técnicos.", "Often unnecessary formula, except in highly technical contexts."]
    ,"Grafia preferible.": ["Grafía preferible.", "Preferred spelling."]
    ,"Grafia recomanada de la Pasqua jueva.": ["Grafía recomendada de la Pascua judía.", "Recommended spelling of the Jewish Passover."]
    ,"Hi falta algun element.": ["Falta algún elemento.", "An element is missing."]
    ,"Hi falta el pronom 'hi' o un participi darrere del verb auxiliar 'haver'.": ["Falta el pronombre «hi» o un participio después del verbo auxiliar «haver».", "The pronoun ‘hi’ or a past participle is missing after the auxiliary verb ‘haver’."]
    ,"Hi falta el pronom 'hi', un participi o la preposició 'de' seguida d'un infinitiu.": ["Falta el pronombre «hi», un participio o la preposición «de» seguida de un infinitivo.", "The pronoun ‘hi’, a past participle, or the preposition ‘de’ followed by an infinitive is missing."]
    ,"Hi falta el pronom feble 'en'.": ["Falta el pronombre átono «en».", "The weak pronoun ‘en’ is missing."]
    ,"Hi falta la preposició 'a' en el sentit de 'trucar demanant que obrin'.": ["Falta la preposición «a» con el sentido de «llamar para que abran».", "The preposition ‘a’ is missing when it means ‘to call for someone to open the door’."]
    ,"Hi falta un \"que\", però és preferible dir __SUGGESTION_1__.": ["Falta un «que», pero es preferible decir «{suggestion1}».", "A ‘que’ is missing, but ‘{suggestion1}’ is preferable."]
    ,"Hi falta un guionet entre el verb en imperatiu i el pronom.": ["Falta un guion entre el verbo en imperativo y el pronombre.", "A hyphen is missing between the imperative verb and the pronoun."]
    ,"Hi falta un guionet o un apòstrof.": ["Falta un guion o un apóstrofo.", "A hyphen or apostrophe is missing."]
    ,"Hi falta un participi o la preposició 'de' seguida d'un infinitiu. Cal usar la forma apropiada del verb 'haver' com a auxiliar.": ["Falta un participio o la preposición «de» seguida de un infinitivo. Debe usarse la forma adecuada del verbo auxiliar «haver».", "A past participle or the preposition ‘de’ followed by an infinitive is missing. Use the appropriate form of the auxiliary ‘haver’."]
    ,"Hi falta un participi, la preposició 'de' seguida d'un infinitiu o el pronom 'hi'.": ["Falta un participio, la preposición «de» seguida de un infinitivo o el pronombre «hi».", "A past participle, the preposition ‘de’ followed by an infinitive, or the pronoun ‘hi’ is missing."]
    ,"Hi falten els accents.": ["Faltan las tildes.", "Accent marks are missing."]
    ,"Hi falten els guionets.": ["Faltan los guiones.", "Hyphens are missing."]
    ,"Hi ha una redundància. Val més dir __SUGGESTION_1__ o __SUGGESTION_2__.": ["Hay una redundancia. Es preferible decir «{suggestion1}» o «{suggestion2}».", "There is a redundancy. Use ‘{suggestion1}’ or ‘{suggestion2}’."]
    ,"Hi manca la preposició 'a'.": ["Falta la preposición «a».", "The preposition ‘a’ is missing."]
    ,"Incorrecte amb valor aproximatiu. Pot ser correcte en altres sentits.": ["Incorrecto con valor aproximativo. Puede ser correcto con otros sentidos.", "Incorrect when used approximately. It may be correct with other meanings."]
    ,"Incorrecte com a nom. \"Empalme\" és una forma verbal del v. 'empalmar'.": ["Incorrecto como sustantivo. «Empalme» es una forma verbal del verbo «empalmar».", "Incorrect as a noun. ‘Empalme’ is a form of the verb ‘empalmar’."]
    ,"Incorrecte en el sentit de __SUGGESTION_1__": ["Incorrecto con el sentido de «{suggestion1}».", "Incorrect when it means ‘{suggestion1}’."]
    ,"Incorrecte en el sentit de __SUGGESTION_1__. 'Estància' existeix com a terme usat a Menorca.": ["Incorrecto con el sentido de «{suggestion1}». «Estància» existe como término usado en Menorca.", "Incorrect when it means ‘{suggestion1}’. ‘Estància’ exists as a term used in Menorca."]
    ,"Incorrecte en el sentit de __SUGGESTION_1__. \"Madrina\" és un tipus de corretja.": ["Incorrecto con el sentido de «{suggestion1}». «Madrina» es un tipo de correa.", "Incorrect when it means ‘{suggestion1}’. ‘Madrina’ is a type of strap."]
    ,"Incorrecte en el sentit de __SUGGESTION_1__. Correcte en el sentit de __SUGGESTION_2__ (d'una planta) o __SUGGESTION_3__ de l'orella.": ["Incorrecto con el sentido de «{suggestion1}». Correcto con el sentido de «{suggestion2}» (de una planta) o «{suggestion3}» (de la oreja).", "Incorrect when it means ‘{suggestion1}’. Correct when it means ‘{suggestion2}’ (of a plant) or ‘{suggestion3}’ (of the ear)."]
    ,"Incorrecte en el sentit de 'vergonyós' (que causa vergonya) o 'indignant'. Correcte en altres sentits menys usuals.": ["Incorrecto con el sentido de «vergonzoso» (que causa vergüenza) o «indignante». Correcto con otros sentidos menos habituales.", "Incorrect when it means ‘shameful’ (causing shame) or ‘outrageous’. Correct with other less common meanings."]
    ,"Incorrecte o col·loquial en alguns sentits. Correcte en altres sentits.": ["Incorrecto o coloquial con algunos sentidos. Correcto con otros sentidos.", "Incorrect or colloquial with some meanings. Correct with other meanings."]
    ,"Incorrecte si equival a __SUGGESTION_1__. Correcte com a participi de 'enseguir'.": ["Incorrecto si equivale a «{suggestion1}». Correcto como participio de «enseguir».", "Incorrect if it means ‘{suggestion1}’. Correct as the past participle of ‘enseguir’."]
    ,"Incorrecte si vol dir __SUGGESTION_1__. Correcte com a diminutiu de 'panxa'.": ["Incorrecto si significa «{suggestion1}». Correcto como diminutivo de «panxa».", "Incorrect if it means ‘{suggestion1}’. Correct as a diminutive of ‘panxa’."]
    ,"Incorrecte si volíeu dir __SUGGESTION_1__. \"Foragit\" pot ser una forma del v.' foragitar'.": ["Incorrecto si querías decir «{suggestion1}». «Foragit» puede ser una forma del verbo «foragitar».", "Incorrect if you meant ‘{suggestion1}’. ‘Foragit’ may be a form of ‘foragitar’."]
    ,"Incorrecte si volíeu dir __SUGGESTION_1__. Correcte com a futur del v. 'retre' (tu retràs).": ["Incorrecto si querías decir «{suggestion1}». Correcto como futuro del verbo «retre» («tu retràs»).", "Incorrect if you meant ‘{suggestion1}’. Correct as the future of ‘retre’ (‘tu retràs’)."]
    ,"L'abreviatura de 'segons' és __SUGGESTION_1__. Com a abreviatura de 'següent' useu __SUGGESTION_2__.": ["La abreviatura de «segons» es «{suggestion1}». Para abreviar «següent», usa «{suggestion2}».", "The abbreviation for ‘segons’ is ‘{suggestion1}’. Use ‘{suggestion2}’ for ‘següent’."]
    ,"L'abreviatura de 'segons' és __SUGGESTION_1__. Correcte com a abreviatura de 'següent'.": ["La abreviatura de «segons» es «{suggestion1}». También es correcta como abreviatura de «següent».", "The abbreviation for ‘segons’ is ‘{suggestion1}’. It is also correct as an abbreviation for ‘següent’."]
    ,"L'abreviatura de júnior s'escriu en majúscules i amb punt.": ["La abreviatura de «júnior» se escribe en mayúsculas y con punto.", "The abbreviation for ‘júnior’ is written in uppercase and with a full stop."]
    ,"L'abreviatura de júnior s'escriu en majúscules.": ["La abreviatura de «júnior» se escribe en mayúsculas.", "The abbreviation for ‘júnior’ is written in uppercase."]
    ,"L'adjectiu __SUGGESTION_1__ ha de concordar amb \"correu\".": ["El adjetivo «{suggestion1}» debe concordar con «correu».", "The adjective ‘{suggestion1}’ must agree with ‘correu’."]
    ,"L'adjectiu 'clar' ha de concordar amb el grup nominal següent.": ["El adjetivo «clar» debe concordar con el siguiente grupo nominal.", "The adjective ‘clar’ must agree with the following noun phrase."]
    ,"L'adjectiu ha de concordar amb \"adreça\".": ["El adjetivo debe concordar con «adreça».", "The adjective must agree with ‘adreça’."]
    ,"L'adverbi __SUGGESTION_1__ s'escriu sense accent.": ["El adverbio «{suggestion1}» se escribe sin tilde.", "The adverb ‘{suggestion1}’ is written without an accent mark."]
    ,"L'article s'escriu en minúscula.": ["El artículo se escribe en minúscula.", "The article is written in lowercase."]
    ,"L'escriptura correcta és __SUGGESTION_1__, nom d'una princesa romana.": ["La forma correcta es «{suggestion1}», nombre de una princesa romana.", "The correct spelling is ‘{suggestion1}’, the name of a Roman princess."]
    ,"L'estructura adequada és \"el motiu és\", no \"el motiu és per a\".": ["La estructura adecuada es «el motiu és», no «el motiu és per a».", "The correct construction is ‘el motiu és’, not ‘el motiu és per a’."]
    ,"L'expressió adequada és 'fer-se pregar', sense la preposició 'de'.": ["La expresión adecuada es «fer-se pregar», sin la preposición «de».", "The correct expression is ‘fer-se pregar’, without the preposition ‘de’."]
    ,"L'expressió adequada és \"tenir cura\" (d'algú o d'alguna cosa).": ["La expresión adecuada es «tenir cura» (de alguien o de algo).", "The correct expression is ‘tenir cura’ (to take care of someone or something)."]
    ,"L'expressió adequada, tant en sentit figurat com en sentit recte, és __SUGGESTION_1__.": ["La expresión adecuada, tanto en sentido figurado como literal, es «{suggestion1}».", "The appropriate expression, both figuratively and literally, is ‘{suggestion1}’."]
    ,"L'expressió és \"pagar o cobrar 'en espècie'\".": ["La expresión es «pagar o cobrar “en espècie”».", "The expression is ‘pagar o cobrar “en espècie”’ (to pay or collect in kind)."]
    ,"L'expressió llatina s'escriu __SUGGESTION_1__.": ["La expresión latina se escribe «{suggestion1}».", "The Latin expression is written ‘{suggestion1}’."]
    ,"L'expressió més habitual i apropiada és \"Pròxim Orient\".": ["La expresión más habitual y apropiada es «Pròxim Orient».", "The more common and appropriate expression is ‘Pròxim Orient’."]
    ,"L'infinitiu sol usar-se sense article. Com a substantiu val més dir __SUGGESTION_1__.": ["El infinitivo suele usarse sin artículo. Como sustantivo, es preferible decir «{suggestion1}».", "The infinitive is usually used without an article. As a noun, ‘{suggestion1}’ is preferable."]
    ,"L'ordre habitual és __SUGGESTION_1__.": ["El orden habitual es «{suggestion1}».", "The usual word order is ‘{suggestion1}’."]
    ,"La coma és probablement incorrecta entre pronom i verb.": ["La coma probablemente es incorrecta entre el pronombre y el verbo.", "The comma is probably incorrect between the pronoun and the verb."]
    ,"La denominació correcta és __SUGGESTION_1__.": ["La denominación correcta es «{suggestion1}».", "The correct designation is ‘{suggestion1}’."]
    ,"La forma adequada com a possessiu és __SUGGESTION_1__ (=els \\1).": ["La forma adecuada como posesivo es «{suggestion1}» (= los «\\1»).", "The correct possessive form is ‘{suggestion1}’ (= the ‘\\1’)."]
    ,"La forma femenina té la terminació -iva.": ["La forma femenina termina en «-iva».", "The feminine form ends in ‘-iva’."]
    ,"La forma incoativa és secundària, i no és admesa per la major part dels diccionaris.": ["La forma incoativa es secundaria y no está admitida por la mayoría de los diccionarios.", "The inchoative form is secondary and is not accepted by most dictionaries."]
    ,"La forma incoativa és secundària, i no és recollida per tots els diccionaris.": ["La forma incoativa es secundaria y no aparece en todos los diccionarios.", "The inchoative form is secondary and is not listed in every dictionary."]
    ,"La fórmula tradicional per a saludar els que mengen és __SUGGESTION_1__.": ["La fórmula tradicional para saludar a quienes están comiendo es «{suggestion1}».", "The traditional greeting for people who are eating is ‘{suggestion1}’."]
    ,"La grafia adequada és __SUGGESTION_1__ (categoria de motociclisme).": ["La grafía adecuada es «{suggestion1}» (categoría del motociclismo).", "The correct spelling is ‘{suggestion1}’ (motorcycling category)."]
    ,"La grafia adequada és __SUGGESTION_1__.": ["La grafía adecuada es «{suggestion1}».", "The correct spelling is ‘{suggestion1}’."]
    ,"La grafia habitual és __SUGGESTION_1__ (país d'Aràbia).": ["La grafía habitual es «{suggestion1}» (país de Arabia).", "The usual spelling is ‘{suggestion1}’ (an Arabian country)."]
    ,"La grafia recomanada és __SUGGESTION_1__, militar i polític libi.": ["La grafía recomendada es «{suggestion1}», militar y político libio.", "The recommended spelling is ‘{suggestion1}’, the Libyan military officer and politician."]
    ,"La grafia recomanada és __SUGGESTION_1__.": ["La grafía recomendada es «{suggestion1}».", "The recommended spelling is ‘{suggestion1}’."]
    ,"La grafia recomanada per a aquest país és __SUGGESTION_1__.": ["La grafía recomendada para este país es «{suggestion1}».", "The recommended spelling for this country is ‘{suggestion1}’."]
    ,"La grafia tradicional és __SUGGESTION_1__.": ["La grafía tradicional es «{suggestion1}».", "The traditional spelling is ‘{suggestion1}’."]
    ,"La locució \"si bé\" s'usa sempre amb verbs en mode indicatiu.": ["La locución «si bé» siempre se usa con verbos en modo indicativo.", "The phrase ‘si bé’ is always used with verbs in the indicative mood."]
    ,"La paraula __SUGGESTION_1__ s'escriu normalment en minúscula, seguida d'un nom propi (ex. síndrome de Down, regla D'Hondt).": ["La palabra «{suggestion1}» suele escribirse en minúscula cuando va seguida de un nombre propio (p. ej., «síndrome de Down», «regla D’Hondt»).", "The word ‘{suggestion1}’ is usually lowercase before a proper name (e.g. ‘síndrome de Down’, ‘regla D’Hondt’)."]
    ,"La paraula adequada en aquesta expressió és __SUGGESTION_1__.": ["La palabra adecuada en esta expresión es «{suggestion1}».", "The appropriate word in this expression is ‘{suggestion1}’."]
    ,"La preposició 'de' no és adequada en aquest context.": ["La preposición «de» no es adecuada en este contexto.", "The preposition ‘de’ is not appropriate in this context."]
    ,"La preposició adequada en aquest cas és __SUGGESTION_1__.": ["La preposición adecuada en este caso es «{suggestion1}».", "The appropriate preposition in this case is ‘{suggestion1}’."]
    ,"La preposició adequada en aquest context és __SUGGESTION_1__.": ["La preposición adecuada en este contexto es «{suggestion1}».", "The appropriate preposition in this context is ‘{suggestion1}’."]
    ,"La preposició adequada és __SUGGESTION_1__ (per al moment en què).": ["La preposición adecuada es «{suggestion1}» (para el momento en que).", "The appropriate preposition is ‘{suggestion1}’ (for the time when)."]
    ,"La preposició adequada és \"amb\" o \"de\".": ["La preposición adecuada es «amb» o «de».", "The appropriate preposition is ‘amb’ or ‘de’."]
    ,"La preposició adequada sembla __SUGGESTION_1__.": ["La preposición adecuada parece ser «{suggestion1}».", "The appropriate preposition seems to be ‘{suggestion1}’."]
    ,"La preposició més adequada en aquest cas és __SUGGESTION_1__.": ["La preposición más adecuada en este caso es «{suggestion1}».", "The most appropriate preposition in this case is ‘{suggestion1}’."]
    ,"La preposició més adequada en aquest context és __SUGGESTION_1__.": ["La preposición más adecuada en este contexto es «{suggestion1}».", "The most appropriate preposition in this context is ‘{suggestion1}’."]
    ,"La preposició més adequada és probablement __SUGGESTION_1__, per a indicar la destinació temporal.": ["La preposición más adecuada probablemente es «{suggestion1}» para indicar destino temporal.", "The most appropriate preposition is probably ‘{suggestion1}’ to indicate a time destination."]
    ,"La preposició més adequada és probablement __SUGGESTION_1__, si voleu indicar destinació.": ["La preposición más adecuada probablemente es «{suggestion1}» si quieres indicar destino.", "The most appropriate preposition is probably ‘{suggestion1}’ if you mean a destination."]
    ,"Les estacions s'escriuen en minúscula, excepte si formen part d'un nom propi.": ["Las estaciones del año se escriben en minúscula, salvo que formen parte de un nombre propio.", "Season names are written in lowercase unless they are part of a proper name."]
    ,"Les sigles dels Estats Units d'Amèrica són __SUGGESTION_1__.": ["Las siglas de los Estados Unidos de América son «{suggestion1}».", "The initialism for the United States of America is ‘{suggestion1}’."]
    ,"Les unitats de mesura del sistema internacional s'escriuen sense punt.": ["Las unidades de medida del sistema internacional se escriben sin punto.", "International System units of measurement are written without a full stop."]
    ,"Llenguatge col·loquial. Considereu usar una paraula alternativa.": ["Lenguaje coloquial. Considera usar otra palabra.", "Colloquial language. Consider using a different word."]
    ,"Llenguatge col·loquial. Correcte si equival a \"mico, simi\" o \"tipus de coca o pastís\".": ["Lenguaje coloquial. Correcto si significa «mono, simio» o «tipo de coca o pastel».", "Colloquial language. Correct if it means ‘monkey, ape’ or ‘a type of coca or cake’."]
    ,"Molts llibres d'estil recomanen usar una altra expressió.": ["Muchos manuales de estilo recomiendan usar otra expresión.", "Many style guides recommend using a different expression."]
    ,"Mot llatí per a indicar que l'error en una transcripció és de l'original. S'escriu sense punt.": ["Palabra latina que indica que el error de una transcripción ya estaba en el original. Se escribe sin punto.", "Latin word indicating that a transcription error was present in the original. It is written without a full stop."]
    ,"N'hi ha prou amb tres punts suspensius.": ["Bastan tres puntos suspensivos.", "Three dots are enough for an ellipsis."]
    ,"No barregeu les construccions \"sigui A o B\" i \"tant A com B\".": ["No mezcles las construcciones «sigui A o B» y «tant A com B».", "Do not mix the constructions ‘sigui A o B’ and ‘tant A com B’."]
    ,"No dupliqueu el pronom feble 'en'.": ["No dupliques el pronombre átono «en».", "Do not duplicate the weak pronoun ‘en’."]
    ,"No feu pronominal l'expressió \"passar (per un lloc)\".": ["No uses la expresión «passar (per un lloc)» como pronominal.", "Do not use ‘passar (per un lloc)’ pronominally."]
    ,"No feu pronominal l'expressió \"passar per un lloc\".": ["No uses la expresión «passar per un lloc» como pronominal.", "Do not use ‘passar per un lloc’ pronominally."]
    ,"No s'accentua perquè és del v. 'veure'.": ["No lleva tilde porque es una forma del verbo «veure».", "It does not take an accent mark because it is a form of ‘veure’."]
    ,"No s'accentua si no vol dir 'oració'.": ["No lleva tilde si no significa «oración».", "It does not take an accent mark unless it means ‘prayer’."]
    ,"No s'ha d'accentuar si equival a 'encara que'. O bé una coma facilitaria la comprensió de la frase.": ["No debe llevar tilde si equivale a «aunque». También se podría añadir una coma para facilitar la comprensión de la frase.", "It should not take an accent mark when it means ‘although’. A comma could also make the sentence easier to understand."]
    ,"No s'ha d'accentuar si no equival a 'quina cosa'.": ["No debe llevar tilde si no equivale a «qué cosa».", "It should not take an accent mark unless it means ‘what thing’."]
    ,"No useu el signe d'exclamació inicial.": ["No uses el signo de exclamación de apertura.", "Do not use the opening exclamation mark."]
    ,"Nom científic: la primera paraula en majúscula i la resta en minúscula.": ["Nombre científico: la primera palabra va en mayúscula y las demás en minúscula.", "Scientific name: capitalise the first word and lowercase the rest."]
    ,"Nom científic: la primera paraula en majúscula i la segona en minúscula.": ["Nombre científico: la primera palabra va en mayúscula y la segunda en minúscula.", "Scientific name: capitalise the first word and lowercase the second."]
    ,"Nombre romà incorrecte.": ["Número romano incorrecto.", "Incorrect Roman numeral."]
    ,"Només és correcte com a forma del v. 'xollar'.": ["Solo es correcto como forma del verbo «xollar».", "Correct only as a form of the verb ‘xollar’."]
    ,"Només és correcte com a imperatiu del v. 'retenir'.": ["Solo es correcto como imperativo del verbo «retenir».", "Correct only as the imperative of ‘retenir’."]
    ,"Només és correcte si és del v. 'sobatre'.": ["Solo es correcto si es una forma del verbo «sobatre».", "Correct only if it is a form of ‘sobatre’."]
    ,"Només s'accentua quan és una afirmació.": ["Solo lleva tilde cuando expresa una afirmación.", "It takes an accent mark only when it expresses an affirmation."]
    ,"Només s'accentua si es pot substituir per \"quina cosa\".": ["Solo lleva tilde si puede sustituirse por «qué cosa».", "It takes an accent mark only if it can be replaced by ‘what thing’."]
    ,"Només s'escriu amb accent si és del verb 'ser'. Si és un pronom, s'escriu sense accent.": ["Solo lleva tilde si es una forma del verbo «ser». Si es un pronombre, se escribe sin tilde.", "It takes an accent mark only as a form of ‘ser’. As a pronoun, it is written without one."]
    ,"Només s'escriu amb guionet si és un concepte filosòfic.": ["Solo se escribe con guion cuando es un concepto filosófico.", "It is written with a hyphen only when it is a philosophical concept."]
    ,"Normalment fem servir el nom d'aquesta ciutat traduït.": ["Normalmente usamos el nombre traducido de esta ciudad.", "The translated name of this city is usually used."]
    ,"Normalment s'escriu en majúscula.": ["Normalmente se escribe con mayúscula.", "It is usually written with a capital letter."]
    ,"Normalment s'escriu en minúscula.": ["Normalmente se escribe en minúscula.", "It is usually written in lowercase."]
    ,"Normalment s'escriu junt i en minúscules. \"Wi-Fi\" és possible com a nom de marca registrada.": ["Normalmente se escribe junto y en minúsculas. «Wi-Fi» también es posible como marca registrada.", "It is usually written as one lowercase word. ‘Wi-Fi’ is also possible as a registered trademark."]
    ,"Normalment s'escriu junt, fins i tot si la paraula resultant no és en el diccionari.": ["Normalmente se escribe junto, aunque la palabra resultante no figure en el diccionario.", "It is usually written as one word, even if the resulting form is not in the dictionary."]
    ,"Normalment s'escriu junt.": ["Normalmente se escribe junto.", "It is usually written as one word."]
    ,"Normalment s'usa el nom complet.": ["Normalmente se usa el nombre completo.", "The full name is usually used."]
    ,"Normativament (IEC, AVL), s'escriu amb dues 's', però l'ortografia és discutida.": ["Según la normativa (IEC, AVL), se escribe con dos «s», aunque la ortografía es controvertida.", "According to the standards (IEC, AVL), it is written with two ‘s’ letters, though the spelling is disputed."]
    ,"Numeral incomplet.": ["Numeral incompleto.", "Incomplete numeral."]
    ,"Ordenació incorrecta amb el pronom 'en'. Canvieu l'ordre o elimineu el pronom.": ["Orden incorrecto del pronombre «en». Cambia el orden o elimina el pronombre.", "Incorrect placement of the pronoun ‘en’. Change the word order or remove the pronoun."]
    ,"Ordre dubtós en l'estructura 'no... sinó'. ¿Volíeu dir __SUGGESTION_1__?": ["Orden dudoso en la estructura «no... sinó». ¿Querías decir «{suggestion1}»?", "Uncertain word order in the ‘no... sinó’ construction. Did you mean ‘{suggestion1}’?"]
    ,"Paraula admesa només per alguns diccionaris en el sentit de __SUGGESTION_1__. Incorrecte en el sentit de __SUGGESTION_2__.": ["Palabra admitida solo por algunos diccionarios con el sentido de «{suggestion1}». Incorrecta con el sentido de «{suggestion2}».", "Word listed in only some dictionaries when it means ‘{suggestion1}’. Incorrect when it means ‘{suggestion2}’."]
    ,"Paraula admesa només per alguns diccionaris en el sentit de 'ben plantat, atractiu'.": ["Palabra admitida solo por algunos diccionarios con el sentido de «bien parecido, atractivo».", "Word listed in only some dictionaries when it means ‘good-looking, attractive’."]
    ,"Paraula admesa per alguns diccionaris.": ["Palabra admitida por algunos diccionarios.", "Word listed in some dictionaries."]
    ,"Paraula col·loquial només admesa per alguns diccionaris.": ["Palabra coloquial admitida solo por algunos diccionarios.", "Colloquial word listed in only some dictionaries."]
    ,"Paraula correcta com a femení de \"novii\" (usada en balear).": ["Palabra correcta como femenino de «novii» (usada en balear).", "Correct feminine form of ‘novii’ (used in Balearic Catalan)."]
    ,"Paraula inadequada en el context. 'Petrolífer' vol dir 'que conté petroli'.": ["Palabra inadecuada en este contexto. «Petrolífer» significa «que contiene petróleo».", "Inappropriate word in this context. ‘Petrolífer’ means ‘containing petroleum’."]
    ,"Paraula incorrecta en el sentit de __SUGGESTION_1__.": ["Palabra incorrecta con el sentido de «{suggestion1}».", "Incorrect word when it means ‘{suggestion1}’."]
    ,"Paraula innecessària.": ["Palabra innecesaria.", "Unnecessary word."]
    ,"Paraula no admesa en tots els diccionaris. Val més fer servir __SUGGESTION_1__.": ["Palabra no admitida por todos los diccionarios. Es preferible usar «{suggestion1}».", "Word not accepted by all dictionaries. Use ‘{suggestion1}’ instead."]
    ,"Paraula no admesa per la major part dels diccionaris.": ["Palabra no admitida por la mayoría de los diccionarios.", "Word not accepted by most dictionaries."]
    ,"Paraula no admesa per tots els diccionaris.": ["Palabra no admitida por todos los diccionarios.", "Word not accepted by all dictionaries."]
    ,"Paraula només admesa per alguns diccionaris. Incorrecte en el sentit de __SUGGESTION_1__.": ["Palabra admitida solo por algunos diccionarios. Incorrecta con el sentido de «{suggestion1}».", "Word listed in only some dictionaries. Incorrect when it means ‘{suggestion1}’."]
    ,"Paraula repetida. Possible error.": ["Palabra repetida. Posible error.", "Repeated word. Possible error."]
    ,"Pareix que hi falta un \"que\".": ["Parece que falta un «que».", "A ‘que’ seems to be missing."]
    ,"Parlant de menjar o beure, cal dir __SUGGESTION_1__.": ["Al hablar de comida o bebida, debe decirse «{suggestion1}».", "When talking about food or drink, use ‘{suggestion1}’."]
    ,"Per a indicar ordinal (fem. pl.), useu __SUGGESTION_1__.": ["Para indicar un ordinal femenino plural, usa «{suggestion1}».", "To indicate a feminine plural ordinal, use ‘{suggestion1}’."]
    ,"Per a indicar ordinal (fem. sing.), useu __SUGGESTION_1__.": ["Para indicar un ordinal femenino singular, usa «{suggestion1}».", "To indicate a feminine singular ordinal, use ‘{suggestion1}’."]
    ,"Per a indicar ordinal (masc. pl.), useu __SUGGESTION_1__.": ["Para indicar un ordinal masculino plural, usa «{suggestion1}».", "To indicate a masculine plural ordinal, use ‘{suggestion1}’."]
    ,"Per a indicar ordinal (masc. sing.), useu __SUGGESTION_1__.": ["Para indicar un ordinal masculino singular, usa «{suggestion1}».", "To indicate a masculine singular ordinal, use ‘{suggestion1}’."]
    ,"Per a indicar ordinals (fem.), useu __SUGGESTION_1__.": ["Para indicar ordinales femeninos, usa «{suggestion1}».", "To indicate feminine ordinals, use ‘{suggestion1}’."]
    ,"Per a indicar ordinals (masc. pl.), useu __SUGGESTION_1__.": ["Para indicar ordinales masculinos plurales, usa «{suggestion1}».", "To indicate masculine plural ordinals, use ‘{suggestion1}’."]
    ,"Per a indicar ordinals, useu __SUGGESTION_1__ (sing.).": ["Para indicar ordinales, usa «{suggestion1}» (singular).", "To indicate an ordinal, use ‘{suggestion1}’ (singular)."]
    ,"Per a indicar una densitat superficial, fem servir l'expressió __SUGGESTION_1__ en singular.": ["Para indicar una densidad superficial, usamos la expresión «{suggestion1}» en singular.", "To express a surface density, use the singular expression ‘{suggestion1}’."]
    ,"Per a parlar de la quantitat de pluja, val més usar verbs diferents.": ["Para hablar de la cantidad de lluvia, es preferible usar otros verbos.", "Use different verbs to talk about the amount of rainfall."]
    ,"Per a referir-se a la Síria moderna, com a adjectiu és més habitual dir __SUGGESTION_1__.": ["Para referirse a la Siria actual, como adjetivo es más habitual decir «{suggestion1}».", "When referring to modern Syria, the adjective ‘{suggestion1}’ is more commonly used."]
    ,"Per a referir-se a la Síria moderna, és més habitual dir __SUGGESTION_1__.": ["Para referirse a la Siria actual, es más habitual decir «{suggestion1}».", "When referring to modern Syria, ‘{suggestion1}’ is more commonly used."]
    ,"Per a referir-se a un temps aproximat val més usar una altra expressió.": ["Para referirse a un tiempo aproximado, es preferible usar otra expresión.", "Use a different expression to refer to an approximate time."]
    ,"Per a separar els milers, feu sevir un punt o un espai. És correcte si són decimals.": ["Para separar los millares, usa un punto o un espacio. Es correcto si se trata de decimales.", "Separate thousands with a full stop or a space. This is correct for decimals."]
    ,"Podeu fer la redacció més fluida prescindint del possessiu.": ["Puedes dar más fluidez al texto prescindiendo del posesivo.", "Improve the flow by omitting the possessive."]
    ,"Podeu fer la redacció més fluida prescindint del verb 'poder'.": ["Puedes dar más fluidez al texto prescindiendo del verbo «poder».", "Improve the flow by omitting the verb ‘poder’."]
    ,"Podeu fer més fluida la redacció amb el verb 'caldre'.": ["Puedes dar más fluidez al texto usando el verbo «caldre».", "Improve the flow by using the verb ‘caldre’."]
    ,"Podeu fer una redacció més fluida.": ["Puedes dar más fluidez al texto.", "Improve the flow of the text."]
    ,"Podeu usar una expressió més genuïna. \"Prova del \\4\" ve d'un anunci publicitari.": ["Puedes usar una expresión más propia del catalán. «Prova del \\4» procede de un anuncio publicitario.", "Consider a more idiomatic Catalan expression. ‘Prova del \\4’ comes from an advertisement."]
    ,"Podeu usar una expressió més genuïna. \"Prova del cotó fluix\" ve d'un anunci publicitari.": ["Puedes usar una expresión más propia del catalán. «Prova del cotó fluix» procede de un anuncio publicitario.", "Consider a more idiomatic Catalan expression. ‘Prova del cotó fluix’ comes from an advertisement."]
    ,"Possible anglicisme. Val més fer servir una altra expressió.": ["Posible anglicismo. Es preferible usar otra expresión.", "Possible English borrowing. Use a different expression."]
    ,"Possible calc de l'anglès. Probablement es pot eliminar '\\3 \\4' sense alterar el significat de la frase.": ["Posible calco del inglés. Probablemente se puede eliminar «\\3 \\4» sin cambiar el sentido de la frase.", "Possible calque from English. ‘\\3 \\4’ can probably be removed without changing the meaning."]
    ,"Possible calc de l'anglès. Referit a color, val més dir __SUGGESTION_1__ o __SUGGESTION_2__.": ["Posible calco del inglés. Para referirse al color, es preferible decir «{suggestion1}» o «{suggestion2}».", "Possible calque from English. For the colour, use ‘{suggestion1}’ or ‘{suggestion2}’."]
    ,"Possible confusió": ["Posible confusión.", "Possible confusion."]
    ,"Possible confusió. ¿Volíeu dir __SUGGESTION_1__ (del verb 'fer')?": ["Posible confusión. ¿Querías decir «{suggestion1}» (del verbo «fer»)?", "Possible confusion. Did you mean ‘{suggestion1}’ (from the verb ‘fer’)?"]
    ,"Possible confusió. ¿Volíeu dir __SUGGESTION_1__ (del verb 'saber')?": ["Posible confusión. ¿Querías decir «{suggestion1}» (del verbo «saber»)?", "Possible confusion. Did you mean ‘{suggestion1}’ (from the verb ‘saber’)?"]
    ,"Possible confusió. ¿Volíeu dir __SUGGESTION_1__ (relatiu a l'espai)?": ["Posible confusión. ¿Querías decir «{suggestion1}» (relativo al espacio)?", "Possible confusion. Did you mean ‘{suggestion1}’ (related to space)?"]
    ,"Possible confusió. ¿Volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__? \"Llunyament\" és un adverbi possible però d'ús infreqüent.": ["Posible confusión. ¿Querías decir «{suggestion1}» o «{suggestion2}»? «Llunyament» es un adverbio posible, pero poco frecuente.", "Possible confusion. Did you mean ‘{suggestion1}’ or ‘{suggestion2}’? ‘Llunyament’ is a possible but uncommon adverb."]
    ,"Possible confusió. ¿Volíeu dir __SUGGESTION_1__? \"Somament\" és un adverbi possible, derivat de \"som\" (superficial).": ["Posible confusión. ¿Querías decir «{suggestion1}»? «Somament» es un adverbio posible, derivado de «som» (superficial).", "Possible confusion. Did you mean ‘{suggestion1}’? ‘Somament’ is a possible adverb derived from ‘som’ (superficial)."]
    ,"Possible confusió. \"Paredes\" és correcte com a forma del v. 'paredar' (tu paredes).": ["Posible confusión. «Paredes» es una forma correcta del verbo «paredar» («tu paredes»).", "Possible confusion. ‘Paredes’ is a valid form of ‘paredar’ (‘tu paredes’)."]
    ,"Possible construcció incorrecta.": ["Posible construcción incorrecta.", "Possible incorrect construction."]
    ,"Possible error de concordança. La forma femenina és __SUGGESTION_1__.": ["Posible error de concordancia. La forma femenina es «{suggestion1}».", "Possible agreement error. The feminine form is ‘{suggestion1}’."]
    ,"Possible error de traducció automàtica. ¿Volíeu dir \"acarnissar-se\"?": ["Posible error de traducción automática. ¿Querías decir «acarnissar-se»?", "Possible machine-translation error. Did you mean ‘acarnissar-se’?"]
    ,"Possible error de traducció automàtica. Correcte si \"com a\" equival a \"en qualitat de, en concepte de\".": ["Posible error de traducción automática. Es correcto si «com a» significa «en calidad de, en concepto de».", "Possible machine-translation error. It is correct if ‘com a’ means ‘in the capacity of, as’."]
    ,"Possible error ortogràfic. \"\\1\" és correcte com a forma balear (1a persona del singular, present d'indicatiu).": ["Posible error ortográfico. «\\1» es correcto como forma balear (primera persona del singular del presente de indicativo).", "Possible spelling error. ‘\\1’ is correct as a Balearic form (first-person singular present indicative)."]
    ,"Possible error ortogràfic. Aquesta forma verbal no es correspon amb la varietat seleccionada (central).": ["Posible error ortográfico. Esta forma verbal no corresponde a la variedad seleccionada (catalán central).", "Possible spelling error. This verb form does not match the selected variety (Central Catalan)."]
    ,"Possible error.": ["Posible error.", "Possible error."]
    ,"Possible redundància. És correcte si es pot invertir l'ordre: \"no... ni tan sols\".": ["Posible redundancia. Es correcto si se puede invertir el orden: «no... ni tan sols».", "Possible redundancy. It is correct if the order can be reversed: ‘no... ni tan sols’."]
    ,"Possible repetició.": ["Posible repetición.", "Possible repetition."]
    ,"Pot ser preferible usar el verb 'haver-hi'.": ["Puede ser preferible usar el verbo «haver-hi».", "The verb ‘haver-hi’ may be preferable."]
    ,"Potser és __SUGGESTION_1__ o falta una coma abans del verb.": ["Quizá sea «{suggestion1}» o falte una coma antes del verbo.", "Perhaps it should be ‘{suggestion1}’, or a comma may be missing before the verb."]
    ,"Potser hi falta un guionet.": ["Quizá falte un guion.", "A hyphen may be missing."]
    ,"Potser hi falta una coma o potser no s'ha d'accentuar. \"Què\" només s'accentua si es pot substituir per 'quina cosa'.": ["Quizá falte una coma o no deba llevar tilde. «Què» solo lleva tilde si puede sustituirse por «quina cosa».", "A comma may be missing, or it may not need an accent mark. ‘Què’ takes one only if it can be replaced by ‘quina cosa’."]
    ,"Potser hi falta una coma. ¿O volíeu dir \"per\"?": ["Quizá falte una coma. ¿O querías decir «per»?", "A comma may be missing. Or did you mean ‘per’?"]
    ,"Potser no s'ha d'accentuar. Sí que s'accentua si equival a 'quina cosa'.": ["Quizá no deba llevar tilde. Sí la lleva si equivale a «qué cosa».", "It may not need an accent mark. It does take one if it means ‘what thing’."]
    ,"Potser volíeu dir __SUGGESTION_1__ o __SUGGESTION_2__.": ["Quizá querías decir «{suggestion1}» o «{suggestion2}».", "Perhaps you meant ‘{suggestion1}’ or ‘{suggestion2}’."]
    ,"Preferentment s'usa el nom complet __SUGGESTION_1__ o l'adaptació __SUGGESTION_2__. \"Galileo\" pot ser el nom d'un sistema de satèl·lits.": ["Preferentemente se usa el nombre completo «{suggestion1}» o la adaptación «{suggestion2}». «Galileo» puede ser el nombre de un sistema de satélites.", "Preferably, use the full name ‘{suggestion1}’ or the adapted form ‘{suggestion2}’. ‘Galileo’ may be the name of a satellite system."]
    ,"Preposició incorrecta amb l'expressió 'haver-n'hi prou'.": ["Preposición incorrecta con la expresión «haver-n’hi prou».", "Incorrect preposition with the expression ‘haver-n’hi prou’."]
    ,"Preposició preferible.": ["Preposición preferible.", "Preferred preposition."]
    ,"Probable error de picatge.": ["Probable error tipográfico.", "Likely typographical error."]
    ,"Probable error. No existeix el v. 'llindar'.": ["Probable error. El verbo «llindar» no existe.", "Likely error. The verb ‘llindar’ does not exist."]
    ,"Probablement 'escaure' no és pronominal en aquest context.": ["Probablemente «escaure» no es pronominal en este contexto.", "‘Escaure’ is probably not pronominal in this context."]
    ,"Probablement cal dir __SUGGESTION_1__, llevat que el parlant es refereixi a si mateix.": ["Probablemente debe decirse «{suggestion1}», salvo que el hablante se refiera a sí mismo.", "It should probably be ‘{suggestion1}’, unless the speaker is referring to themselves."]
    ,"Probablement cal dir \"els\" (complement indirecte). La forma \"els hi\" és col·loquial.": ["Probablemente debe decirse «els» (complemento indirecto). «Els hi» es coloquial.", "Use ‘els’ as the indirect object. ‘Els hi’ is colloquial."]
    ,"Probablement cal escriure __SUGGESTION_1__ (conjunció condicional 'si' seguida de la negació 'no'). O bé hi falta una negació prèviament.": ["Probablemente debe escribirse «{suggestion1}» (la conjunción condicional «si» seguida de la negación «no»). También podría faltar una negación anterior.", "It should probably be written ‘{suggestion1}’ (the conditional conjunction ‘si’ followed by the negation ‘no’). An earlier negation may also be missing."]
    ,"Probablement cal escriure __SUGGESTION_1__ perquè és un adverbi invariable.": ["Probablemente debe escribirse «{suggestion1}» porque es un adverbio invariable.", "It should probably be written ‘{suggestion1}’ because it is an invariable adverb."]
    ,"Probablement cal escriure __SUGGESTION_1__. Correcte davant de locució adverbial: tan a la valenta.": ["Probablemente debe escribirse «{suggestion1}». Delante de una locución adverbial, es correcto «tan a la valenta».", "It should probably be written ‘{suggestion1}’. Before an adverbial phrase, ‘tan a la valenta’ is correct."]
    ,"Probablement cal escriure __SUGGESTION_1__. En un registre col·loquial, 'potser que + subjuntiu' és vàlid per a expressar un suggeriment.": ["Probablemente debe escribirse «{suggestion1}». En un registro coloquial, «potser que + subjuntivo» es válido para expresar una sugerencia.", "It should probably be written ‘{suggestion1}’. In colloquial usage, ‘potser que + subjunctive’ can express a suggestion."]
    ,"Probablement cal usar el pronom \"li\".": ["Probablemente debe usarse el pronombre «li».", "The pronoun ‘li’ is probably needed."]
    ,"Probablement cal usar la conjunció __SUGGESTION_1__ i no el pronom \"ho\".": ["Probablemente debe usarse la conjunción «{suggestion1}», no el pronombre «ho».", "The conjunction ‘{suggestion1}’ is probably needed, not the pronoun ‘ho’."]
    ,"Probablement cal usar la conjunció __SUGGESTION_1__.": ["Probablemente debe usarse la conjunción «{suggestion1}».", "The conjunction ‘{suggestion1}’ is probably needed."]
    ,"Probablement cal usar la preposició \"per a\".": ["Probablemente debe usarse la preposición «per a».", "The preposition ‘per a’ is probably needed."]
    ,"Probablement cal usar una altra preposició.": ["Probablemente debe usarse otra preposición.", "A different preposition is probably needed."]
    ,"Probablement és més adequat un altre verb. \"Emplaçar\" vol dir \"situar\".": ["Probablemente sea más adecuado otro verbo. «Emplaçar» significa «situar».", "A different verb is probably more appropriate. ‘Emplaçar’ means ‘to locate’."]
    ,"Probablement falta un accent en 'què' (= quina cosa).": ["Probablemente falta una tilde en «què» (= qué cosa).", "‘Què’ probably needs an accent mark (= ‘what thing’)."]
    ,"Probablement falta un punt darrere de l'abreviatura.": ["Probablemente falta un punto después de la abreviatura.", "A full stop is probably missing after the abbreviation."]
    ,"Probablement hi falta un 'que'.": ["Probablemente falta un «que».", "A ‘que’ is probably missing."]
    ,"Probablement hi falta un infinitiu o un gerundi.": ["Probablemente falta un infinitivo o gerundio.", "An infinitive or gerund is probably missing."]
    ,"Probablement hi falta un participi.": ["Probablemente falta un participio.", "A past participle is probably missing."]
    ,"Probablement hi falta un punt.": ["Probablemente falta un punto.", "A full stop is probably missing."]
    ,"Probablement sobra la preposició \"a\".": ["Probablemente sobra la preposición «a».", "The preposition ‘a’ is probably unnecessary."]
    ,"Probablement val més usar el verb 'estar'.": ["Probablemente es preferible usar el verbo «estar».", "The verb ‘estar’ is probably preferable."]
    ,"Probablement, el pronom adequat és \"li\".": ["Probablemente, el pronombre adecuado es «li».", "The appropriate pronoun is probably ‘li’."]
    ,"Pronom feble probablement incorrecte.": ["Probablemente el pronombre átono es incorrecto.", "The weak pronoun is probably incorrect."]
    ,"Pronom feble solt. Si és un nom, s'escriu amb accent.": ["Pronombre átono aislado. Si es un sustantivo, lleva tilde.", "Weak pronoun used on its own. If it is a noun, it takes an accent mark."]
    ,"Pronunciació col·loquial de __SUGGESTION_1__.": ["Pronunciación coloquial de «{suggestion1}».", "Colloquial pronunciation of ‘{suggestion1}’."]
    ,"Quan 'pro' fa funció de preposició (=en favor de) s'escriu sense guionet.": ["Cuando «pro» funciona como preposición (= a favor de), se escribe sin guion.", "When ‘pro’ functions as a preposition (= in favour of), it is written without a hyphen."]
    ,"Quan indica quantitat cal escriure __SUGGESTION_1__. Correcte davant de locució adverbial: tan de moda, tan de pressa.": ["Cuando indica cantidad, debe escribirse «{suggestion1}». Delante de una locución adverbial, son correctas «tan de moda» y «tan de pressa».", "When it indicates quantity, write ‘{suggestion1}’. Before an adverbial phrase, ‘tan de moda’ and ‘tan de pressa’ are correct."]
    ,"Quan indica un procés cal dir __SUGGESTION_1__.": ["Cuando indica un proceso, debe decirse «{suggestion1}».", "When it indicates a process, use ‘{suggestion1}’."]
    ,"Quan significa 'passar a un nivell més alt', \"pujar\" és intransitiu (ex. La marea ha pujat). Com a verb transitiu, cal usar __SUGGESTION_1__ (ex. El govern apuja els imposts).": ["Cuando significa «pasar a un nivel más alto», «pujar» es intransitivo (p. ej., «La marea ha pujat»). Como verbo transitivo, debe usarse «{suggestion1}» (p. ej., «El govern apuja els imposts»).", "When it means ‘to rise to a higher level’, ‘pujar’ is intransitive (e.g. ‘La marea ha pujat’). As a transitive verb, use ‘{suggestion1}’ (e.g. ‘El govern apuja els imposts’)."]
    ,"Redacció redundant.": ["Redacción redundante.", "Redundant wording."]
    ,"Referit a \"cosa\", cal usar el femení __SUGGESTION_1__.": ["Con el sentido de «cosa», debe usarse el femenino «{suggestion1}».", "When it refers to a thing, use the feminine ‘{suggestion1}’."]
    ,"Referit a \\2, cal dir __SUGGESTION_1__.": ["Con referencia a «\\2», debe decirse «{suggestion1}».", "Referring to ‘\\2’, use ‘{suggestion1}’."]
    ,"Referit a menjars o begudes, cal dir __SUGGESTION_1__ en lloc de \"\\1\".": ["Para referirse a comidas o bebidas, debe decirse «{suggestion1}» en vez de «\\1».", "For food or drink, use ‘{suggestion1}’ instead of ‘\\1’."]
    ,"Referit a menjars o begudes, cal dir __SUGGESTION_1__ en lloc de \"\\2\".": ["Para referirse a comidas o bebidas, debe decirse «{suggestion1}» en vez de «\\2».", "For food or drink, use ‘{suggestion1}’ instead of ‘\\2’."]
    ,"Referit als premis cinematogràfics, escrivim __SUGGESTION_1__ o __SUGGESTION_2__.": ["Para referirse a premios cinematográficos, escribimos «{suggestion1}» o «{suggestion2}».", "For film awards, write ‘{suggestion1}’ or ‘{suggestion2}’."]
    ,"Referit als premis cinematogràfics, usem el plural __SUGGESTION_1__.": ["Para referirse a premios cinematográficos, usamos el plural «{suggestion1}».", "For film awards, use the plural ‘{suggestion1}’."]
    ,"Repetició: possible redacció deficient.": ["Repetición: posible redacción deficiente.", "Repetition: possible awkward wording."]
    ,"Reviseu: dos substantius junts. Potser hi falta algun element (una coma, una conjunció, una preposició).": ["Revisa: dos sustantivos seguidos. Quizá falte algún elemento (una coma, conjunción o preposición).", "Review: two consecutive nouns. A comma, conjunction, or preposition may be missing."]
    ,"S'accentua quan és una afirmació. És correcte sense accent si és un condicional.": ["Lleva tilde cuando expresa una afirmación. Es correcto sin tilde si es una conjunción condicional.", "It takes an accent mark when it expresses an affirmation. It is correct without one as a conditional conjunction."]
    ,"S'accentua quan és una afirmació. Es pot escriure sense accent si expressa sorpresa, dubte, ironia, etc. (p. ex. 'Si que anem bé!').": ["Lleva tilde cuando expresa una afirmación. Puede escribirse sin tilde para expresar sorpresa, duda, ironía, etc. (p. ej., «Si que anem bé!»).", "It takes an accent mark when it expresses an affirmation. It may be written without one to express surprise, doubt, irony, etc. (e.g. ‘Si que anem bé!’)."]
    ,"S'accentua si es pot substituir per \"quina cosa\". No s'accentua si la resposta a la pregunta és \"sí\" o \"no\".": ["Lleva tilde si puede sustituirse por «qué cosa». No lleva tilde si la respuesta a la pregunta es «sí» o «no».", "It takes an accent mark if it can be replaced by ‘what thing’. It has no accent mark if the answer is ‘yes’ or ‘no’."]
    ,"S'accentua si és un adjectiu o un adverbi. S'escriu sense accent si és un substantiu ('període de 28-31 dies'), un possessiu ('les meves') o una conjunció ('però').": ["Lleva tilde como adjetivo o adverbio. Se escribe sin tilde como sustantivo («periodo de 28-31 días»), posesivo («les meves») o conjunción («però»).", "It takes an accent mark as an adjective or adverb. It has none as a noun (‘period of 28–31 days’), possessive (‘les meves’), or conjunction (‘però’)."]
    ,"S'escriu __SUGGESTION_1__ si equival a 'per quin motiu'. S'escriu junt si equival a 'ja que, pel fet que'.": ["Se escribe «{suggestion1}» si equivale a «por qué motivo». Se escribe junto si significa «ya que, por el hecho de que».", "Write ‘{suggestion1}’ if it means ‘for what reason’. Write it as one word when it means ‘since, because’."]
    ,"S'escriu amb 'h' perquè és una forma del verb 'haver'.": ["Se escribe con «h» porque es una forma del verbo «haver».", "It is written with an ‘h’ because it is a form of ‘haver’."]
    ,"S'escriu amb accent, llevat que ens referim a la ciutat californiana.": ["Se escribe con tilde, salvo que se refiera a la ciudad californiana.", "It takes an accent mark unless it refers to the Californian city."]
    ,"S'escriu amb dièresi.": ["Se escribe con diéresis.", "It is written with a diaeresis."]
    ,"S'escriu amb la conjunció 'i'.": ["Se escribe con la conjunción «i».", "It is written with the conjunction ‘i’."]
    ,"S'escriu amb majúscula quan ens referim a la festivitat, amb minúscula quan ens referim al personatge.": ["Se escribe con mayúscula cuando se refiere a la festividad y con minúscula cuando se refiere al personaje.", "Use a capital when referring to the holiday and lowercase when referring to the character."]
    ,"S'escriu amb majúscula quan ens referim a la festivitat.": ["Se escribe con mayúscula cuando se refiere a la festividad.", "Use a capital when referring to the holiday."]
    ,"S'escriu amb minúscula quan ens referim a un personatge. Amb majúscula fa referència a la festivitat.": ["Se escribe en minúscula cuando se refiere a un personaje. Con mayúscula, se refiere a la festividad.", "Use lowercase when referring to a character; uppercase refers to the holiday."]
    ,"S'escriu junt sense espais.": ["Se escribe junto y sin espacios.", "It is written as one word, with no spaces."]
    ,"S'escriu junt, sense guionet.": ["Se escribe junto, sin guion.", "It is written as one word, without a hyphen."]
    ,"S'escriu junt, tant si és un adverbi (=per damunt de tot) com un substantiu (peça de vestir).": ["Se escribe junto, tanto si es un adverbio (= por encima de todo) como un sustantivo (prenda de vestir).", "It is written as one word both as an adverb (= above all) and as a noun (a garment)."]
    ,"S'escriu normalment en minúscula. Pot anar en majúscula si forma part d'un nom propi amb altres paraules en majúscula.": ["Normalmente se escribe en minúscula. Puede escribirse con mayúscula si forma parte de un nombre propio con otras palabras en mayúscula.", "It is usually lowercase. It may be capitalised when it is part of a proper name whose other words are also capitalised."]
    ,"S'escriu preferiblement amb guionet.": ["Preferiblemente se escribe con guion.", "A hyphen is preferred."]
    ,"S'escriu sense accent si la resposta és \"sí\" o \"no\". Si és un pronom interrogatiu (=quina cosa), s'escriu amb accent.": ["Se escribe sin tilde si la respuesta es «sí» o «no». Si es un pronombre interrogativo (= qué cosa), se escribe con tilde.", "It is written without an accent mark if the answer is ‘yes’ or ‘no’. As an interrogative pronoun (= what thing), it takes one."]
    ,"S'escriu sense guionet, junt o separat segons el sentit.": ["Se escribe sin guion, junto o separado según el sentido.", "It is written without a hyphen, either together or separately depending on the meaning."]
    ,"S'usa sense el v. 'fer' i no és admès per tots els diccionaris.": ["Se usa sin el verbo «fer» y no está admitido por todos los diccionarios.", "It is used without the verb ‘fer’ and is not accepted by all dictionaries."]
    ,"Sembla més adequat el nom en singular.": ["Parece más adecuado el sustantivo en singular.", "The singular noun seems more appropriate."]
    ,"Sembla més probable __SUGGESTION_1__ (adverbi invariable) que modifica l'adjectiu '\\2'.": ["Parece más probable «{suggestion1}» (adverbio invariable), que modifica el adjetivo «\\2».", "‘{suggestion1}’ (an invariable adverb) is more likely; it modifies the adjective ‘\\2’."]
    ,"Sembla que cal usar el nom en plural.": ["Parece que hay que usar el sustantivo en plural.", "The noun probably needs to be plural."]
    ,"Sembla que el verb hauria de ser en plural.": ["Parece que el verbo debería ir en plural.", "The verb probably needs to be plural."]
    ,"Si \"mal\" és nom, cal escriure __SUGGESTION_1__ o __SUGGESTION_2__. Si és adverbi, potser cal escriure __SUGGESTION_3__.": ["Si «mal» es un sustantivo, debe escribirse «{suggestion1}» o «{suggestion2}». Si es un adverbio, quizá deba escribirse «{suggestion3}».", "If ‘mal’ is a noun, write ‘{suggestion1}’ or ‘{suggestion2}’. If it is an adverb, ‘{suggestion3}’ may be needed."]
    ,"Si \"sol\" és un adjectiu amb el sentit de \"sense companyia\", cal escriure __SUGGESTION_1__.": ["Si «sol» es un adjetivo con el sentido de «sin compañía», debe escribirse «{suggestion1}».", "If ‘sol’ is an adjective meaning ‘alone’, write ‘{suggestion1}’."]
    ,"Si concorda amb el verb \"\\4\", cal usar el plural __SUGGESTION_1__.": ["Si concuerda con el verbo «\\4», debe usarse el plural «{suggestion1}».", "If it agrees with the verb ‘\\4’, use the plural ‘{suggestion1}’."]
    ,"Si el cognom té el nom davant, la partícula \"van\" s'escriu amb minúscula.": ["Si el apellido va precedido del nombre, la partícula «van» se escribe en minúscula.", "If the surname is preceded by the given name, the particle ‘van’ is lowercase."]
    ,"Si el cognom té el nom davant, la partícula \"von\" s'escriu amb minúscula.": ["Si el apellido va precedido del nombre, la partícula «von» se escribe en minúscula.", "If the surname is preceded by the given name, the particle ‘von’ is lowercase."]
    ,"Si ens referim a un nom incomptable (\\1), cal dir __SUGGESTION_1__.": ["Si nos referimos a un sustantivo incontable («\\1»), debe decirse «{suggestion1}».", "If referring to an uncountable noun (‘\\1’), use ‘{suggestion1}’."]
    ,"Si equival a \"grega\", cal escriure __SUGGESTION_1__.": ["Si equivale a «griega», debe escribirse «{suggestion1}».", "If it means ‘Greek’ (feminine), write ‘{suggestion1}’."]
    ,"Si és conjunció, cal dir __SUGGESTION_1__. Correcte com a plural de 'pua'.": ["Si es una conjunción, debe decirse «{suggestion1}». Es correcto como plural de «pua».", "If it is a conjunction, use ‘{suggestion1}’. It is correct as the plural of ‘pua’."]
    ,"Si és del v. 'resoldre', s'escriu __SUGGESTION_1__. Correcte en el sentit de 'reverberació del sol'.": ["Si es una forma del verbo «resoldre», se escribe «{suggestion1}». Es correcto con el sentido de «reverberación del sol».", "If it is a form of ‘resoldre’, write ‘{suggestion1}’. It is correct when it means ‘sunlight reverberation’."]
    ,"Si és del verb 'estar' s'escriu amb accent, i sobra el verb 'haver'.": ["Si es una forma del verbo «estar», lleva tilde y sobra el verbo «haver».", "If it is a form of ‘estar’, it takes an accent mark, and the verb ‘haver’ is unnecessary."]
    ,"Si és del verb 'saber' s'escriu amb 'b'.": ["Si es una forma del verbo «saber», se escribe con «b».", "If it is a form of ‘saber’, it is written with ‘b’."]
    ,"Si és del verb 'ser' i un adverbi, cal accentuar.": ["Si es una forma del verbo «ser» y un adverbio, debe llevar tilde.", "If it is a form of ‘ser’ and an adverb, it takes an accent mark."]
    ,"Si és del verb 'ser', val més dir __SUGGESTION_1__. Correcte si és del v. 'seure'.": ["Si es una forma del verbo «ser», es preferible decir «{suggestion1}». Es correcto si es una forma del verbo «seure».", "If it is a form of ‘ser’, use ‘{suggestion1}’. It is correct if it is a form of ‘seure’."]
    ,"Si és el material (i no la marca), s'escriu en minúscula.": ["Si es el material (y no la marca), se escribe en minúscula.", "If it refers to the material rather than the brand, it is written in lowercase."]
    ,"Si és el pl. del n. \"terròs\", cal escriure __SUGGESTION_1__. Correcte si ve de \"terrós\".": ["Si es el plural del sustantivo «terròs», debe escribirse «{suggestion1}». Es correcto si deriva de «terrós».", "If it is the plural of the noun ‘terròs’, write ‘{suggestion1}’. It is correct if it derives from ‘terrós’."]
    ,"Si és femení, no s'apostrofa.": ["Si es femenino, no lleva apóstrofo.", "If it is feminine, it does not take an apostrophe."]
    ,"Si és infinitiu, usem preferentment la forma __SUGGESTION_1__.": ["Si es un infinitivo, se prefiere la forma «{suggestion1}».", "If it is an infinitive, the form ‘{suggestion1}’ is preferred."]
    ,"Si és infinitiu, usem preferentment la forma \"ser\".": ["Si es un infinitivo, se prefiere la forma «ser».", "If it is an infinitive, the form ‘ser’ is preferred."]
    ,"Si és nom, \"\\1\" ha de ser masculí. Correcte com a adjectiu.": ["Si es un sustantivo, «\\1» debe ser masculino. Es correcto como adjetivo.", "If it is a noun, ‘\\1’ must be masculine. It is correct as an adjective."]
    ,"Si és nom, \"\\3\" ha de ser masculí. Correcte com a adjectiu.": ["Si es un sustantivo, «\\3» debe ser masculino. Es correcto como adjetivo.", "If it is a noun, ‘\\3’ must be masculine. It is correct as an adjective."]
    ,"Si és nom, ha de ser femení.": ["Si es un sustantivo, debe ser femenino.", "If it is a noun, it must be feminine."]
    ,"Si és perífrasi d'obligació, val més usar una altra expressió.": ["Si es una perífrasis de obligación, es preferible usar otra expresión.", "If it expresses obligation, use a different construction."]
    ,"Si es tracta del cos, s'escriu amb majúscula. Si ens referim a membres del cos, s'escriu amb minúscula.": ["Si se refiere al cuerpo, se escribe con mayúscula. Si se refiere a partes del cuerpo, se escribe en minúscula.", "If it refers to the body, it is capitalised. If it refers to body parts, it is lowercase."]
    ,"Si és un adjectiu s'escriu amb accent. Correcte si és del v. 'incomodar'.": ["Si es un adjetivo, se escribe con tilde. Es correcto si es una forma del verbo «incomodar».", "If it is an adjective, it takes an accent mark. It is correct if it is a form of ‘incomodar’."]
    ,"Si és un adjectiu, s'escriu amb accent.": ["Si es un adjetivo, se escribe con tilde.", "If it is an adjective, it takes an accent mark."]
    ,"Si és un concepte filosòfic, sol escriure's amb guionet.": ["Si es un concepto filosófico, suele escribirse con guion.", "If it is a philosophical concept, it is usually written with a hyphen."]
    ,"Si és un imperatiu, la forma adequada és __SUGGESTION_1__.": ["Si es un imperativo, la forma adecuada es «{suggestion1}».", "If it is an imperative, the correct form is ‘{suggestion1}’."]
    ,"Si és un nom castellà, no duu accent.": ["Si es un nombre castellano, no lleva tilde.", "If it is a Spanish name, it does not take an accent mark."]
    ,"Si és un nom comú, s'escriu en minúscula.": ["Si es un sustantivo común, se escribe en minúscula.", "If it is a common noun, it is written in lowercase."]
    ,"Si és un nom de lloc, s'escriu amb majúscula. Existeix com a nom comú (en minúscula) amb sentits menys freqüents.": ["Si es un topónimo, se escribe con mayúscula. También existe como sustantivo común (en minúscula) con sentidos menos frecuentes.", "If it is a place name, it is capitalised. It also exists as a common noun (lowercase) with less common meanings."]
    ,"Si és un nom o un adjectiu, s'escriu amb accent.": ["Si es un sustantivo o adjetivo, se escribe con tilde.", "If it is a noun or adjective, it takes an accent mark."]
    ,"Si és un nom propi (mar \\2), s'escriu en majúscula. Si és un adjectiu, en minúscula.": ["Si es un nombre propio («mar \\2»), se escribe en mayúscula. Como adjetivo, va en minúscula.", "If it is a proper name (‘mar \\2’), it is capitalised. As an adjective, it is lowercase."]
    ,"Si és un nom propi, cal escriure __SUGGESTION_1__.": ["Si es un nombre propio, debe escribirse «{suggestion1}».", "If it is a proper name, write ‘{suggestion1}’."]
    ,"Si és un nom s'escriu amb accent. Correcte si és del v. 'seriar'.": ["Si es un sustantivo, lleva tilde. Es correcto si es una forma del verbo «seriar».", "If it is a noun, it takes an accent mark. It is correct if it is a form of ‘seriar’."]
    ,"Si és un nom, cal dir __SUGGESTION_1__. Correcte si és del v. 'subministrar'.": ["Si es un sustantivo, debe decirse «{suggestion1}». Es correcto si es una forma del verbo «subministrar».", "If it is a noun, use ‘{suggestion1}’. It is correct if it is a form of ‘subministrar’."]
    ,"Si és un numeral, s'escriu __SUGGESTION_1__. \"Dugues\" és una pronunciació vulgar.": ["Si es un numeral, se escribe «{suggestion1}». «Dugues» es una pronunciación vulgar.", "If it is a numeral, write ‘{suggestion1}’. ‘Dugues’ is a vulgar pronunciation."]
    ,"Si és un numeral, s'escriu separat. Només s'escriu junt com a terme d'alpinisme.": ["Si es un numeral, se escribe separado. Solo se escribe junto como término de alpinismo.", "If it is a numeral, it is written separately. It is written together only as a mountaineering term."]
    ,"Si és un pronom feble, s'escriu amb 'h'.": ["Si es un pronombre átono, se escribe con «h».", "If it is a weak pronoun, it is written with an ‘h’."]
    ,"Si és un pronom interrogatiu (=quina cosa), s'escriu amb accent.": ["Si es un pronombre interrogativo (= qué cosa), se escribe con tilde.", "If it is an interrogative pronoun (= what thing), it takes an accent mark."]
    ,"Si és un pronom s'escriu sense accent. Correcte amb accent si és un nom (acció d'usar).": ["Si es un pronombre, se escribe sin tilde. Lleva tilde si es un sustantivo (acción de usar).", "If it is a pronoun, it is written without an accent mark. It takes one as a noun meaning ‘the act of using’."]
    ,"Si és un pronom s'escriu sense accent. Només s'escriu amb accent si és del v. 'tenir'.": ["Si es un pronombre, se escribe sin tilde. Solo lleva tilde si es una forma del verbo «tenir».", "If it is a pronoun, it is written without an accent mark. It takes one only as a form of ‘tenir’."]
    ,"Si és un símbol de numeral ordinal, s'escriu en minúscula.": ["Si es el símbolo de un numeral ordinal, se escribe en minúscula.", "If it is the symbol for an ordinal number, it is written in lowercase."]
    ,"Si és un substantiu, cal dir __SUGGESTION_1__. \"Apujada\" només pot ser participi.": ["Si es un sustantivo, debe decirse «{suggestion1}». «Apujada» solo puede ser participio.", "If it is a noun, use ‘{suggestion1}’. ‘Apujada’ can only be a participle."]
    ,"Si és un verb en futur s'escriu tot junt.": ["Si es un verbo en futuro, se escribe todo junto.", "If it is a future-tense verb, it is written as one word."]
    ,"Si és un verb, és preferible dir __SUGGESTION_1__. \"Ofertar\" no és admès per tots els diccionaris.": ["Si es un verbo, es preferible decir «{suggestion1}». «Ofertar» no está admitido por todos los diccionarios.", "If it is a verb, use ‘{suggestion1}’. ‘Ofertar’ is not accepted by all dictionaries."]
    ,"Si és un verb, és preferible dir \"ofereix\". \"Ofertar\" no és admès per tots els diccionaris.": ["Si es un verbo, es preferible decir «ofereix». «Ofertar» no está admitido por todos los diccionarios.", "If it is a verb, ‘ofereix’ is preferable. ‘Ofertar’ is not accepted by all dictionaries."]
    ,"Si és una afirmació, cal dir __SUGGESTION_1__. És correcte sense accent si és un condicional.": ["Si es una afirmación, debe decirse «{suggestion1}». Es correcto sin tilde si es una conjunción condicional.", "If it is an affirmation, use ‘{suggestion1}’. It is correct without an accent mark as a conditional conjunction."]
    ,"Si és una beguda, cal escriure __SUGGESTION_1__.": ["Si es una bebida, debe escribirse «{suggestion1}».", "If it is a drink, write ‘{suggestion1}’."]
    ,"Si és una conjunció condicional, s'escriu sense accent.": ["Si es una conjunción condicional, se escribe sin tilde.", "If it is a conditional conjunction, it is written without an accent mark."]
    ,"Si és una forma del verb 'renunciar', s'escriu sense accent.": ["Si es una forma del verbo «renunciar», se escribe sin tilde.", "If it is a form of ‘renunciar’, it is written without an accent mark."]
    ,"Si és una forma del verb 'veure', s'escriu __SUGGESTION_1__ o __SUGGESTION_2__. Com a substantiu, el veguer o la veguera, a Andorra, és el representant dels coprínceps.": ["Si es una forma del verbo «veure», se escribe «{suggestion1}» o «{suggestion2}». Como sustantivo, «veguer» o «veguera» es el representante de los copríncipes en Andorra.", "If it is a form of ‘veure’, write ‘{suggestion1}’ or ‘{suggestion2}’. As a noun, ‘veguer’ or ‘veguera’ is a representative of Andorra’s co-princes."]
    ,"Si és una forma del verb 'veure', s'escriu __SUGGESTION_1__ o __SUGGESTION_2__. Com a substantiu, els veguers o les vegueres, a Andorra, són els representants dels coprínceps.": ["Si es una forma del verbo «veure», se escribe «{suggestion1}» o «{suggestion2}». Como sustantivo, «veguers» o «vegueres» son los representantes de los copríncipes en Andorra.", "If it is a form of ‘veure’, write ‘{suggestion1}’ or ‘{suggestion2}’. As a noun, ‘veguers’ or ‘vegueres’ are representatives of Andorra’s co-princes."]
    ,"Si és una indicació horària, no porta punt. Sí que en porta en altres casos.": ["Si es una indicación horaria, no lleva punto. En otros casos, sí.", "If it indicates a time, it has no full stop. In other cases, it does."]
    ,"Si és una operació tècnica, cal dir __SUGGESTION_1__.": ["Si es una operación técnica, debe decirse «{suggestion1}».", "If it refers to a technical operation, use ‘{suggestion1}’."]
    ,"Si és una preposició (i no és del verb 'haver'), s'escriu __SUGGESTION_1__.": ["Si es una preposición (y no una forma del verbo «haver»), se escribe «{suggestion1}».", "If it is a preposition (not a form of ‘haver’), write ‘{suggestion1}’."]
    ,"Si forma part d'un nom propi, s'escriu amb majúscula.": ["Si forma parte de un nombre propio, se escribe con mayúscula.", "If it is part of a proper name, it is capitalised."]
    ,"Si modifica l'adverbi posterior cal escriure __SUGGESTION_1__. Correcte si equival a \"tant de temps\".": ["Si modifica el adverbio siguiente, debe escribirse «{suggestion1}». Es correcto si equivale a «tant de temps».", "If it modifies the following adverb, write ‘{suggestion1}’. It is correct if it means ‘tant de temps’."]
    ,"Si no és referit a un lloc físic, val més fer servir un altre adjectiu.": ["Si no se refiere a un lugar físico, es preferible usar otro adjetivo.", "If it does not refer to a physical place, use a different adjective."]
    ,"Si no és un títol, falta un punt al final de la frase.": ["Si no es un título, falta un punto al final de la frase.", "If it is not a title, a full stop is missing at the end of the sentence."]
    ,"Si no és una referència horària (la una de migdia, la una de la nit), cal apostrofar.": ["Si no es una referencia horaria («la una de migdia», «la una de la nit»), debe llevar apóstrofo.", "If it is not a time reference (‘la una de migdia’, ‘la una de la nit’), it takes an apostrophe."]
    ,"Si no forma part d'un nom propi, el nom d'una moneda s'escriu en minúscula.": ["Si no forma parte de un nombre propio, el nombre de una moneda se escribe en minúscula.", "If it is not part of a proper name, a currency name is written in lowercase."]
    ,"Si són pronoms febles, cal escriure __SUGGESTION_1__.": ["Si son pronombres átonos, debe escribirse «{suggestion1}».", "If they are weak pronouns, write ‘{suggestion1}’."]
    ,"Si són pronoms, cal escriure \"se'ns\".": ["Si son pronombres, debe escribirse «se’ns».", "If they are pronouns, write ‘se’ns’."]
    ,"Si us referiu a la ciutat de Califòrnia, s'escriu __SUGGESTION_1__.": ["Si te refieres a la ciudad de California, se escribe «{suggestion1}».", "If you mean the city in California, write ‘{suggestion1}’."]
    ,"Si us referiu a mitjans de comunicació, cal dir __SUGGESTION_1__.": ["Si te refieres a los medios de comunicación, debe decirse «{suggestion1}».", "If you mean the media, use ‘{suggestion1}’."]
    ,"Si us referiu a un recipient, cal escriure __SUGGESTION_1__.": ["Si te refieres a un recipiente, debe escribirse «{suggestion1}».", "If you mean a container, write ‘{suggestion1}’."]
    ,"Si us referiu al nom d'una salsa, s'escriu junt.": ["Si te refieres al nombre de una salsa, se escribe junto.", "If you mean the name of a sauce, it is written as one word."]
    ,"Si voleu dir \"per quina raó\", s'escriu separat.": ["Si quieres decir «por qué razón», se escribe separado.", "If you mean ‘for what reason’, it is written separately."]
    ,"Si voleu escriure l'ordinal \"quart\", l'abreviatura adequada és __SUGGESTION_1__.": ["Si quieres escribir el ordinal «quart», la abreviatura adecuada es «{suggestion1}».", "If you want to write the ordinal ‘quart’, the correct abbreviation is ‘{suggestion1}’."]
    ,"Si voleu indicar graus, useu el símbol °.": ["Para indicar grados, usa el símbolo °.", "Use the ° symbol to indicate degrees."]
    ,"Si voleu indicar graus, useu el símbol apropiat: __SUGGESTION_1__. Per a indicar ordinals, useu __SUGGESTION_2__ (sing.) o __SUGGESTION_3__ (pl.).": ["Para indicar grados, usa el símbolo adecuado: «{suggestion1}». Para ordinales, usa «{suggestion2}» (singular) o «{suggestion3}» (plural).", "Use the correct symbol for degrees: ‘{suggestion1}’. For ordinals, use ‘{suggestion2}’ (singular) or ‘{suggestion3}’ (plural)."]
    ,"Sigles de \"recerca i desenvolupament i innovació\".": ["Siglas de «recerca i desenvolupament i innovació».", "Initialism for ‘recerca i desenvolupament i innovació’ (research, development and innovation)."]
    ,"Sigles de \"tecnologies de la informació i de la comunicació\".": ["Siglas de «tecnologies de la informació i de la comunicació».", "Initialism for ‘tecnologies de la informació i de la comunicació’ (information and communication technologies)."]
    ,"Temps verbal incorrecte en una frase condicional. Useu el present d'indicatiu.": ["Tiempo verbal incorrecto en una oración condicional. Usa el presente de indicativo.", "Incorrect verb tense in a conditional sentence. Use the present indicative."]
    ,"Temps verbal incorrecte.": ["Tiempo verbal incorrecto.", "Incorrect verb tense."]
    ,"Terme antic o mallorquí.": ["Término antiguo o mallorquín.", "Archaic or Mallorcan term."]
    ,"Ús abusiu del v. '\\3'. Considereu una opció alternativa.": ["Uso excesivo del verbo «\\3». Considera una alternativa.", "Overuse of the verb ‘\\3’. Consider an alternative."]
    ,"Ús abusiu del v. 'paralitzar'. Considereu una opció alternativa.": ["Uso excesivo del verbo «paralitzar». Considera una alternativa.", "Overuse of the verb ‘paralitzar’. Consider an alternative."]
    ,"Ús impropi, no normatiu, en el sentit de __SUGGESTION_1__.": ["Uso impropio y no normativo con el sentido de «{suggestion1}».", "Incorrect, non-standard usage when it means ‘{suggestion1}’."]
    ,"Ús pronominal incorrecte. Canvieu l'expressió o elimineu el pronom reflexiu. La combinació \"els hi\" és col·loquial.": ["Uso pronominal incorrecto. Cambia la expresión o elimina el pronombre reflexivo. La combinación «els hi» es coloquial.", "Incorrect pronominal use. Change the expression or remove the reflexive pronoun. The combination ‘els hi’ is colloquial."]
    ,"Ús pronominal probablement incorrecte. Pot ser correcte si és una frase impersonal (equivalent a \"hom \\2 \\3\").": ["Uso pronominal probablemente incorrecto. Puede ser correcto en una oración impersonal (equivalente a «hom \\2 \\3»).", "Probably incorrect pronominal use. It may be correct in an impersonal sentence (equivalent to ‘hom \\2 \\3’)."]
    ,"Useu \"Sr.\" com a abreviatura de \"senyor\". \"Don\" pot ser un tractament honorífic històric.": ["Usa «Sr.» como abreviatura de «senyor». «Don» puede ser un tratamiento honorífico histórico.", "Use ‘Sr.’ as the abbreviation for ‘senyor’. ‘Don’ may be a historical honorific."]
    ,"Useu accentuació general. Si és participi, l'accent és obert.": ["Usa las reglas generales de acentuación. Si es un participio, lleva acento abierto.", "Use the general stress rules. If it is a participle, it takes an open accent."]
    ,"Useu demostratius reforçats.": ["Usa los demostrativos reforzados.", "Use the reinforced demonstratives."]
    ,"Useu el 'deure', o bé completeu la perífrasi 'haver de + infinitiu'.": ["Usa «deure» o completa la perífrasis «haver de + infinitivo».", "Use ‘deure’ or complete the construction ‘haver de + infinitive’."]
    ,"Useu el guionet i les majúscules adequades.": ["Usa el guion y las mayúsculas adecuados.", "Use the correct hyphen and capitalisation."]
    ,"Useu el nom complet __SUGGESTION_1__ (dues paraules) o l'adaptació __SUGGESTION_2__ (una paraula).": ["Usa el nombre completo «{suggestion1}» (dos palabras) o la forma adaptada «{suggestion2}» (una palabra).", "Use the full name ‘{suggestion1}’ (two words) or the adapted form ‘{suggestion2}’ (one word)."]
    ,"Useu les majúscules adequades. La primera lletra va en majúscula només si forma part d'un nom propi.": ["Usa las mayúsculas adecuadas. La primera letra solo va en mayúscula si forma parte de un nombre propio.", "Use capitalisation correctly. The first letter is capitalised only when it is part of a proper name."]
    ,"Useu preferiblement l'article estàndard. L'article salat es pot considerar una folklorització de mal gust.": ["Usa preferiblemente el artículo estándar. El artículo salado puede considerarse una folclorización de mal gusto.", "Prefer the standard article. The salat article may be considered a tasteless folklorisation."]
    ,"Useu una altra expressió més adequada.": ["Usa otra expresión más adecuada.", "Use a more appropriate expression."]
    ,"Useu una coma per a separar els decimals i punts per als milers.": ["Usa una coma para separar los decimales y puntos para los millares.", "Use a comma for decimals and full stops for thousands."]
    ,"Useu una coma per a separar els decimals i un punt per als milers.": ["Usa una coma para separar los decimales y un punto para los millares.", "Use a comma for decimals and a full stop for thousands."]
    ,"Useu una d'aquestes expressions sense barrejar-les.": ["Usa una de estas expresiones, sin mezclarlas.", "Use one of these expressions; do not mix them."]
    ,"Useu una expressió més genuïna.": ["Usa una expresión más propia del catalán.", "Use a more idiomatic Catalan expression."]
    ,"Val més dir __SUGGESTION_1__. \"Milloria\" té sentits poc habituals.": ["Es preferible decir «{suggestion1}». «Milloria» tiene sentidos poco habituales.", "Use ‘{suggestion1}’. ‘Milloria’ has uncommon meanings."]
    ,"Val més evitar aquesta expressió.": ["Es preferible evitar esta expresión.", "It is preferable to avoid this expression."]
    ,"Val més fer servir un altre verb. \"Revaloritzar\" té usos especialitzats.": ["Es preferible usar otro verbo. «Revaloritzar» tiene usos especializados.", "Use a different verb. ‘Revaloritzar’ has specialised uses."]
    ,"Val més fer servir una altra expressió, encara que és acceptada per alguns diccionaris.": ["Es preferible usar otra expresión, aunque algunos diccionarios la admiten.", "Use a different expression, although some dictionaries accept this one."]
    ,"Val més usar el pronom 'en'.": ["Es preferible usar el pronombre «en».", "Use the pronoun ‘en’."]
    ,"Val més usar el verb 'ser' o 'estar'.": ["Es preferible usar el verbo «ser» o «estar».", "Use the verb ‘ser’ or ‘estar’."]
    ,"Val més usar l'expressió \"girar full\".": ["Es preferible usar la expresión «girar full».", "Use the expression ‘girar full’."]
    ,"Val més usar una altra expressió sense possessiu.": ["Es preferible usar otra expresión sin posesivo.", "Use a different expression without a possessive."]
    ,"Val més usar una altra expressió, en especial en expressions temporals.": ["Es preferible usar otra expresión, especialmente en expresiones temporales.", "Use a different expression, especially in time expressions."]
    ,"Val més usar una altra expressió. Calc del castellà.": ["Es preferible usar otra expresión. Calco del castellano.", "Use a different expression. Calque from Spanish."]
    ,"Val més usar una altra paraula. És correcte en el sentit de 'imitar com fa un mim'.": ["Es preferible usar otra palabra. Es correcta con el sentido de «imitar como hace un mimo».", "Use a different word. It is correct when it means ‘to imitate a mime’."]
    ,"Variant informal. Correcte si és del v. 'musicar'.": ["Variante informal. Es correcta si es una forma del verbo «musicar».", "Informal variant. It is correct if it is a form of ‘musicar’."]
    ,"Verb incorrecte en el sentit de 'mesurar, fer'.": ["Verbo incorrecto con el sentido de «medir, hacer».", "Incorrect verb when used to mean ‘to measure, do’."]
  };

  function normalizeExplanationKey(message) {
    let suggestionIndex = 0;
    return String(message || "")
      .replace(/<suggestion>([\s\S]*?)<\/suggestion>/giu, () => {
        suggestionIndex += 1;
        return "__SUGGESTION_" + suggestionIndex + "__";
      })
      .replace(/<[^>]*>/gu, "")
      .replace(/\s+/gu, " ")
      .trim();
  }

  const normalizedExplanationTranslations = { es: new Map(), en: new Map() };
  const normalizedSharedExplanationTranslations = { es: new Map(), en: new Map() };
  for (const language of ["es", "en"]) {
    for (const [message, translation] of Object.entries(explanationTranslations[language] || {})) {
      normalizedExplanationTranslations[language].set(normalizeExplanationKey(message), translation);
    }
    for (const [message, translations] of Object.entries(sharedExplanationTranslations)) {
      normalizedSharedExplanationTranslations[language].set(
        normalizeExplanationKey(message),
        translations[language === "es" ? 0 : 1]
      );
    }
  }

  function translateIssueMessage(message, language, sourceLanguage = "ca") {
    if (!message) return "";
    const isSpanishSource = sourceLanguage === "es-ES";
    if (isSpanishSource ? !["ca", "en"].includes(language) : !explanationTranslations[language]) return "";
    const suggestions = [];
    let suggestionIndex = 0;
    const canonical = String(message)
      .replace(/<suggestion>([\s\S]*?)<\/suggestion>/giu, (_tag, value) => {
        suggestions.push(String(value).replace(/<[^>]*>/gu, "")
          .replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">")
          .replaceAll("&quot;", "\"").replaceAll("&apos;", "'").replaceAll("&#39;", "'").replaceAll("&nbsp;", " "));
        suggestionIndex += 1;
        return "__SUGGESTION_" + suggestionIndex + "__";
      })
      .replace(/<[^>]*>/gu, "")
      .replace(/\s+/gu, " ")
      .trim();
    let template = isSpanishSource
      ? globalThis.CorrectorLocalSpanishExplanationTranslations?.[language]?.[canonical]
      : normalizedExplanationTranslations[language].get(canonical)
        || normalizedSharedExplanationTranslations[language].get(canonical);
    if (isSpanishSource && !template) {
      const didYouMean = canonical.match(/^¿Quería decir (.+)\?$/u);
      if (didYouMean) {
        const parts = didYouMean[1].split(/\s+o\s+/u);
        const isSuggestionList = parts.every((part) => /^__SUGGESTION_\d+__$/u.test(part) || /^«[^»]+»$/u.test(part));
        if (isSuggestionList) {
          const localizedParts = parts.map((part) => part.replace(/^__SUGGESTION_(\d+)__$/u, "{suggestion$1}"));
          template = language === "ca"
            ? `Volíeu dir ${localizedParts.join(" o ")}?`
            : `Did you mean ${localizedParts.join(" or ")}?`;
        }
      }
    }
    if (isSpanishSource && !template) return "";
    if (!template && /^¿Volíeu dir __SUGGESTION_1__.*\?$/u.test(canonical)) {
      template = language === "es" ? "¿Querías decir «{suggestion1}»?" : "Did you mean ‘{suggestion1}’?";
    }
    if (!template && /^(?:Probablement )?cal (?:dir|escriure|usar|fer servir) __SUGGESTION_1__(?:\s*\([^)]*\))?\.?$/u.test(canonical)) {
      template = language === "es" ? "Probablemente corresponde escribir «{suggestion1}»." : "Write ‘{suggestion1}’ here.";
    }
    if (!template && /^(?:Val més|És preferible) (?:dir|usar|fer servir) __SUGGESTION_1__\.?$/u.test(canonical)) {
      template = language === "es" ? "Es preferible usar «{suggestion1}»." : "Use ‘{suggestion1}’ here.";
    }
    if (!template && /^(?:En aquest context[,;:]? )?(?:val més|cal) dir __SUGGESTION_1__\.?$/u.test(canonical)) {
      template = language === "es" ? "En este contexto, es preferible decir «{suggestion1}»." : "Use ‘{suggestion1}’ in this context.";
    }
    if (!template && /^La (?:preposició|forma) (?:adequada|correcta|preferible) és __SUGGESTION_1__\.?$/u.test(canonical)) {
      template = language === "es" ? "La forma adecuada es «{suggestion1}»." : "The correct form is ‘{suggestion1}’.";
    }
    if (!template && /^Aquesta expressió és redundant\. Escriviu __SUGGESTION_1__ o __SUGGESTION_2__\.$/u.test(canonical)) {
      template = language === "es" ? "Esta expresión es redundante; elige una de las alternativas sugeridas." : "This expression is redundant; choose one of the suggested alternatives.";
    }
    if (!template && /^Possible confusió\. ?¿Volíeu dir __SUGGESTION_1__\??$/u.test(canonical)) {
      template = language === "es" ? "Posible confusión. ¿Querías decir «{suggestion1}»?" : "Possible confusion. Did you mean ‘{suggestion1}’?";
    }
    if (!template && /^Aquesta frase no comença amb majúscula\.?$/u.test(canonical)) {
      template = language === "es" ? "La frase no empieza con mayúscula." : "This sentence does not start with a capital letter.";
    }
    if (!template) {
      const lexicalSuggestion = canonical.match(/^¿Volíeu dir __SUGGESTION_1__\? "([^"]+)" (.+)$/u);
      if (lexicalSuggestion) {
        const [, term, tail] = lexicalSuggestion;
        const suggestion = suggestions[0] || "";
        const patterns = [
          [/^és una paraula d'ús infreqüent\.$/u, `«${term}» es una palabra de uso infrecuente.`, `‘${term}’ is an uncommon word.`],
          [/^és una paraula poc freqüent\.$/u, `«${term}» es una palabra poco frecuente.`, `‘${term}’ is an uncommon word.`],
          [/^és correcte en el sentit de ['"](.+?)['"]\.$/u, (m) => `«${term}» es correcto con el sentido de «${m[1]}».`, (m) => `‘${term}’ is correct in the sense of ‘${m[1]}’.`],
          [/^és correcte com a sinònim de ['"](.+?)['"]\.$/u, (m) => `«${term}» es correcto como sinónimo de «${m[1]}».`, (m) => `‘${term}’ is correct as a synonym of ‘${m[1]}’.`],
          [/^és una forma (?:vàlida|correcta) del v(?:erb)?\. ['"](.+?)['"]\.$/u, (m) => `«${term}» es una forma válida del verbo «${m[1]}».`, (m) => `‘${term}’ is a valid form of ‘${m[1]}’.`],
          [/^és una forma valenciana del v\. ['"](.+?)['"]\.$/u, (m) => `«${term}» es una forma valenciana del verbo «${m[1]}».`, (m) => `‘${term}’ is a Valencian form of ‘${m[1]}’.`],
          [/^és (?:el )?participi del v\. ['"](.+?)['"]\.$/u, (m) => `«${term}» es el participio del verbo «${m[1]}».`, (m) => `‘${term}’ is the past participle of ‘${m[1]}’.`],
          [/^és un adjectiu, femení de "([^"]+)"\.$/u, (m) => `«${term}» es un adjetivo, femenino de «${m[1]}».`, (m) => `‘${term}’ is an adjective, the feminine form of ‘${m[1]}’.`],
          [/^és un adjectiu, femení plural de "([^"]+)"\.$/u, (m) => `«${term}» es el femenino plural del adjetivo «${m[1]}».`, (m) => `‘${term}’ is the feminine plural of the adjective ‘${m[1]}’.`],
          [/^és el plural de "([^"]+)"(?: \(([^)]+)\))?\.$/u, (m) => `«${term}» es el plural de «${m[1]}»${m[2] ? ` (${m[2]})` : ""}.`, (m) => `‘${term}’ is the plural of ‘${m[1]}’${m[2] ? ` (${m[2]})` : ""}.`],
          [/^pot ser una forma del verb ['"](.+?)['"]\.$/u, (m) => `«${term}» puede ser una forma del verbo «${m[1]}».`, (m) => `‘${term}’ may be a form of ‘${m[1]}’.`],
          [/^és del v\. ['"](.+?)['"]\.$/u, (m) => `«${term}» es una forma del verbo «${m[1]}».`, (m) => `‘${term}’ is a form of ‘${m[1]}’.`],
          [/^és sinònim de ['"](.+?)['"]\.$/u, (m) => `«${term}» es sinónimo de «${m[1]}».`, (m) => `‘${term}’ is a synonym of ‘${m[1]}’.`],
          [/^és una paraula correcta, però té uns usos més poc habituals\.$/u, `«${term}» es una palabra correcta, pero sus usos son menos frecuentes.`, `‘${term}’ is a valid word, but it is less commonly used.`],
          [/^és una forma arcaica o un plural majestàtic\.$/u, `«${term}» es una forma arcaica o un plural mayestático.`, `‘${term}’ is an archaic form or a plural of majesty.`],
          [/^és una paraula vulgar que vol dir "([^"]+)"\.$/u, (m) => `«${term}» es una palabra vulgar que significa «${m[1]}».`, (m) => `‘${term}’ is a vulgar word meaning ‘${m[1]}’.`],
          [/^és el nom d'un (.+?)\.$/u, (m) => `«${term}» es el nombre de ${/^[aeiouàèéíòóú]/iu.test(m[1]) ? "un" : "un"} ${m[1]}.`, (m) => `‘${term}’ is the name of a ${m[1]}.`],
          [/^és un terme especialitzat de (.+?)\.$/u, (m) => `«${term}» es un término especializado de ${m[1]}.`, (m) => `‘${term}’ is a specialised term in ${m[1]}.`],
          [/^és una paraula poc freqüent \(del v\. ['"](.+?)['"] o sinònim de ['"](.+?)['"]\)\.$/u, (m) => `«${term}» es una palabra poco frecuente (forma del verbo «${m[1]}» o sinónimo de «${m[2]}»).`, (m) => `‘${term}’ is an uncommon word (a form of ‘${m[1]}’ or a synonym of ‘${m[2]}’).`],
          [/^és una forma secundària de "([^"]+)" o una forma del v\. ['"](.+?)['"]\.$/u, (m) => `«${term}» es una variante secundaria de «${m[1]}» o una forma del verbo «${m[2]}».`, (m) => `‘${term}’ is a secondary variant of ‘${m[1]}’ or a form of ‘${m[2]}’.`],
          [/^és correcte en altres sentits\.$/u, `«${term}» es correcto con otros sentidos.`, `‘${term}’ is correct with other meanings.`],
          [/^és una paraula existent, però d'ús infreqüent\. ?\.$/u, `«${term}» es una palabra existente, pero de uso infrecuente.`, `‘${term}’ is a valid but uncommon word.`],
          [/^és un verb d'ús poc freqüent amb altres significats\.$/u, `«${term}» es un verbo poco frecuente con otros significados.`, `‘${term}’ is an uncommon verb with other meanings.`],
          [/^és correcte com a (.+?)\.$/u, (m) => `«${term}» es correcto como ${m[1]}.`, (m) => `‘${term}’ is correct as ${m[1]}.`],
          [/^és una forma poc freqüent del v\. ['"](.+?)['"]\.$/u, (m) => `«${term}» es una forma poco frecuente del verbo «${m[1]}».`, (m) => `‘${term}’ is an uncommon form of ‘${m[1]}’.`],
          [/^pot ser el diminutiu de "([^"]+)"\.$/u, (m) => `«${term}» puede ser el diminutivo de «${m[1]}».`, (m) => `‘${term}’ may be a diminutive of ‘${m[1]}’.`],
          [/^és correcte si es refereix a "([^"]+)"\.$/u, (m) => `«${term}» es correcto si se refiere a «${m[1]}».`, (m) => `‘${term}’ is correct if it refers to ‘${m[1]}’.`],
          [/^és una forma vàlida del v\. ['"](.+?)['"]\.$/u, (m) => `«${term}» es una forma válida del verbo «${m[1]}».`, (m) => `‘${term}’ is a valid form of ‘${m[1]}’.`],
          [/^és una paraula d'ús poc freqüent\.$/u, `«${term}» es una palabra de uso poco frecuente.`, `‘${term}’ is an uncommon word.`],
          [/^és una paraula poc freqüent\.$/u, `«${term}» es una palabra poco frecuente.`, `‘${term}’ is an uncommon word.`]
        ];
        for (const [pattern, spanish, english] of patterns) {
          const detail = tail.match(pattern);
          if (detail) return language === "es" ? (typeof spanish === "function" ? spanish(detail) : spanish) : (typeof english === "function" ? english(detail) : english);
        }
      }
      const simpleRulePatterns = [
        [/^Possible confusió\. Correcte com a forma del v\. ['"](.+?)['"]\.$/u, (m) => `Posible confusión. Es correcto como forma del verbo «${m[1]}».`, (m) => `Possible confusion. It is correct as a form of ‘${m[1]}’.`],
        [/^Possible confusió\. La forma verbal "([^"]+)" no correspon a la varietat seleccionada\.$/u, (m) => `Posible confusión. La forma verbal «${m[1]}» no corresponde a la variedad seleccionada.`, (m) => `Possible confusion. The verb form ‘${m[1]}’ does not match the selected variety.`],
        [/^Possible confusió\. "([^"]+)" s'usa normalment en el sentit de ['"](.+?)['"]\.$/u, (m) => `Posible confusión. «${m[1]}» suele usarse con el sentido de «${m[2]}».`, (m) => `Possible confusion. ‘${m[1]}’ is usually used to mean ‘${m[2]}’.`],
        [/^Possible confusió\. "([^"]+)" és correcte com a nom de (.+?)\.$/u, (m) => `Posible confusión. «${m[1]}» es correcto como nombre de ${m[2]}.`, (m) => `Possible confusion. ‘${m[1]}’ is correct as the name of ${m[2]}.`],
        [/^Possible confusió entre les locucions __SUGGESTION_1__ i __SUGGESTION_2__\.$/u, (_m) => `Posible confusión entre las locuciones «${suggestions[0] || ""}» y «${suggestions[1] || ""}».`, (_m) => `Possible confusion between the expressions ‘${suggestions[0] || ""}’ and ‘${suggestions[1] || ""}’.`],
        [/^Possible confusió\. ¿Volíeu dir __SUGGESTION_1__ \((?:del )?v(?:erb)?\. ['"](.+?)['"]\)\?$/u, (m) => `Posible confusión. ¿Querías decir «${suggestions[0] || ""}» (del verbo «${m[1]}»)?`, (m) => `Possible confusion. Did you mean ‘${suggestions[0] || ""}’ (from the verb ‘${m[1]}’)?`],
        [/^Possible confusió\. ¿Volíeu dir __SUGGESTION_1__ en comptes de "([^"]+)" \(([^)]+)\)\?$/u, (m) => `Posible confusión. ¿Querías decir «${suggestions[0] || ""}» en vez de «${m[1]}» (${m[2]})?`, (m) => `Possible confusion. Did you mean ‘${suggestions[0] || ""}’ instead of ‘${m[1]}’ (${m[2]})?`],
        [/^El v(?:erb)?\. ['"](.+?)['"] és transitiu\. Probablement cal fer la construcció sense la preposició ['"](.+?)['"]\.$/u, (m) => `El verbo «${m[1]}» es transitivo. Probablemente debe construirse sin la preposición «${m[2]}».`, (m) => `The verb ‘${m[1]}’ is transitive. It probably needs to be used without the preposition ‘${m[2]}’.`],
        [/^El v(?:erb)?\. ['"](.+?)['"] regeix (?:preferentment|normalment) la preposició "([^"]+)"\.$/u, (m) => `El verbo «${m[1]}» rige normalmente la preposición «${m[2]}».`, (m) => `The verb ‘${m[1]}’ usually takes the preposition ‘${m[2]}’.`],
        [/^El v(?:erb)?\. ("plenar") no existeix\. Feu servir "([^"]+)"\.$/u, (m) => `El verbo «${m[1]}» no existe. Usa «${m[2]}».`, (m) => `The verb ‘${m[1]}’ does not exist. Use ‘${m[2]}’.`],
        [/^El v(?:erb)?\. ['"](.+?)['"] ja expressa grau superlatiu\. L'adverbi ['"]més['"] és redundant\.$/u, (m) => `El verbo «${m[1]}» ya expresa el grado superlativo. El adverbio «més» es redundante.`, (m) => `The verb ‘${m[1]}’ already expresses the superlative. The adverb ‘més’ is redundant.`],
        [/^El v(?:erb)?\. ['"](.+?)['"] és intransitiu\. Probablement hi falta la preposició ['"](.+?)['"]\.$/u, (m) => `El verbo «${m[1]}» es intransitivo. Probablemente falta la preposición «${m[2]}».`, (m) => `The verb ‘${m[1]}’ is intransitive. The preposition ‘${m[2]}’ is probably missing.`],
        [/^Incorrecte en el sentit de __SUGGESTION_1__\. Correcte en el sentit de ['"](.+?)['"]\.$/u, (m) => `Incorrecto con el sentido de «${suggestions[0] || ""}». Correcto con el sentido de «${m[1]}».`, (m) => `Incorrect when used to mean ‘${suggestions[0] || ""}’. Correct with the meaning ‘${m[1]}’.`],
        [/^Incorrecte en el sentit de ['"](.+?)['"]\. Correcte si vol dir ['"](.+?)['"]\.$/u, (m) => `Incorrecto con el sentido de «${m[1]}». Correcto si significa «${m[2]}».`, (m) => `Incorrect when used to mean ‘${m[1]}’. Correct if it means ‘${m[2]}’.`],
        [/^Incorrecte en el sentit de ['"](.+?)['"]\.$/u, (m) => `Incorrecto con el sentido de «${m[1]}».`, (m) => `Incorrect when used to mean ‘${m[1]}’.`],
        [/^Calc del castellà\. Val més fer servir una altra expressió\.$/u, () => `Calco del castellano. Es preferible usar otra expresión.`, () => `Calque from Spanish. Use a different expression.`],
        [/^Calc del castellà\. Podeu usar l'expressió "([^"]+)"\.$/u, (m) => `Calco del castellano. Puedes usar la expresión «${m[1]}».`, (m) => `Calque from Spanish. Use the expression ‘${m[1]}’.`],
        [/^Calc del castellà\. Canvieu el pronom '([^']+)' per '([^']+)' o '([^']+)' i elimineu la preposició '([^']+)'\.$/u, (m) => `Calco del castellano. Cambia el pronombre «${m[1]}» por «${m[2]}» o «${m[3]}» y elimina la preposición «${m[4]}».`, (m) => `Calque from Spanish. Replace the pronoun ‘${m[1]}’ with ‘${m[2]}’ or ‘${m[3]}’, and remove the preposition ‘${m[4]}’.`],
        [/^Calc del castellà\. Useu un altre verb\.$/u, () => `Calco del castellano. Usa otro verbo.`, () => `Calque from Spanish. Use a different verb.`],
        [/^Cal escriure __SUGGESTION_1__, derivat de l'adj\. ['"](.+?)['"]\.$/u, (m) => `Debe escribirse «${suggestions[0] || ""}», derivado del adjetivo «${m[1]}».`, (m) => `Write ‘${suggestions[0] || ""}’, derived from the adjective ‘${m[1]}’.`],
        [/^Cal escriure __SUGGESTION_1__ \(de l'exterior\)\.$/u, () => `Debe escribirse «${suggestions[0] || ""}» (del exterior).`, () => `Write ‘${suggestions[0] || ""}’ (from outside).`],
        [/^Cal escriure __SUGGESTION_1__, excepte si equival a "fins i tot"\.$/u, () => `Debe escribirse «${suggestions[0] || ""}», excepto si significa «incluso».`, () => `Write ‘${suggestions[0] || ""}’, unless it means ‘even’.`],
        [/^Cal escriure __SUGGESTION_1__ davant d'infinitiu\. Correcte si equival a 'fins i tot'\.$/u, () => `Debe escribirse «${suggestions[0] || ""}» delante de un infinitivo. Es correcto si significa «incluso».`, () => `Write ‘${suggestions[0] || ""}’ before an infinitive. It is correct if it means ‘even’.`],
        [/^Cal escriure-ho junt\.$/u, () => `Debe escribirse junto.`, () => `Write it as one word.`],
        [/^Cal escriure __SUGGESTION_1__ perquè no modifica l'adverbi següent\.$/u, () => `Debe escribirse «${suggestions[0] || ""}» porque no modifica el adverbio siguiente.`, () => `Write ‘${suggestions[0] || ""}’ because it does not modify the following adverb.`],
        [/^Com a nom, val més usar una altra paraula\.$/u, () => `Como sustantivo, es preferible usar otra palabra.`, () => `Use a different word as a noun.`],
        [/^Com a nom, cal dir __SUGGESTION_1__\. "([^"]+)" és una forma valenciana del v\. '([^']+)'\.$/u, (m) => `Como sustantivo, debe decirse «${suggestions[0] || ""}». «${m[1]}» es una forma valenciana del verbo «${m[2]}».`, (m) => `Use ‘${suggestions[0] || ""}’ as a noun. ‘${m[1]}’ is a Valencian form of ‘${m[2]}’.`],
        [/^Com a nom o adjectiu cal dir __SUGGESTION_1__\. Si és verb, cal dir "([^"]+)"\.$/u, (m) => `Como sustantivo o adjetivo, debe decirse «${suggestions[0] || ""}». Como verbo, debe decirse «${m[1]}».`, (m) => `Use ‘${suggestions[0] || ""}’ as a noun or adjective. As a verb, use ‘${m[1]}’.`],
        [/^Com a nom, cal dir __SUGGESTION_1__\. Més rarament, "([^"]+)" \(=([^)]*)\) pot ser una forma del verb '([^']+)'\.$/u, (m) => `Como sustantivo, debe decirse «${suggestions[0] || ""}». Más raramente, «${m[1]}» (= ${m[2]}) puede ser una forma del verbo «${m[3]}».`, (m) => `Use ‘${suggestions[0] || ""}’ as a noun. More rarely, ‘${m[1]}’ (= ${m[2]}) may be a form of ‘${m[3]}’.`],
        [/^Castellanisme innecessari\.$/u, () => `Castellanismo innecesario.`, () => `Unnecessary Spanish borrowing.`],
        [/^Castellanisme\. Val més dir __SUGGESTION_1__\.$/u, () => `Castellanismo. Es preferible decir «${suggestions[0] || ""}».`, () => `Spanish borrowing. Use ‘${suggestions[0] || ""}’.`],
        [/^Castellanisme d'origen argentí\. Podeu usar una expressió alternativa\.$/u, () => `Castellanismo de origen argentino. Puedes usar una expresión alternativa.`, () => `Argentine Spanish borrowing. Consider an alternative expression.`],
        [/^Castellanisme en l'àmbit del ciclisme\.$/u, () => `Castellanismo del ámbito del ciclismo.`, () => `Spanish borrowing used in cycling.`],
        [/^Arcaisme(?: o possible error)?\.$/u, () => `Arcaísmo o posible error.`, () => `Archaic form or possible error.`],
        [/^Forma verbal incompleta\.$/u, () => `Forma verbal incompleta.`, () => `Incomplete verb form.`],
        [/^Possible error de picatge\.$/u, () => `Posible error tipográfico.`, () => `Possible typographical error.`],
        [/^Nom científic\.$/u, () => `Nombre científico.`, () => `Scientific name.`],
        [/^Expressió incoherent\.$/u, () => `Expresión incoherente.`, () => `Inconsistent expression.`],
        [/^Hi ha una redundància\.$/u, () => `Hay una redundancia.`, () => `There is a redundancy.`],
        [/^Error de concordança\.$/u, () => `Error de concordancia.`, () => `Agreement error.`],
        [/^Llenguatge col·loquial\.$/u, () => `Lenguaje coloquial.`, () => `Colloquial language.`],
        [/^Variant informal\.$/u, () => `Variante informal.`, () => `Informal variant.`],
        [/^Denominació incorrecta\.$/u, () => `Denominación incorrecta.`, () => `Incorrect designation.`],
        [/^Possible error ortogràfic\.$/u, () => `Posible error ortográfico.`, () => `Possible spelling mistake.`],
        [/^Possible error de traducció automàtica\.$/u, () => `Posible error de traducción automática.`, () => `Possible machine-translation error.`],
        [/^Aquesta expressió és un calc del castellà\.$/u, () => `Esta expresión es un calco del castellano.`, () => `This expression is a calque from Spanish.`],
        [/^Aquesta paraula és un anglicisme\.$/u, () => `Esta palabra es un anglicismo.`, () => `This word is an English borrowing.`],
        [/^Aquest verb no es correspon amb la varietat en ús\.$/u, () => `Este verbo no corresponde a la variedad utilizada.`, () => `This verb does not match the variety in use.`],
        [/^Si és del verb 'ser', s'escriu "és"\.$/u, () => `Si es del verbo «ser», se escribe «és».`, () => `If it is a form of ‘ser’, write it as ‘és’.`],
        [/^Si és del verb 'haver', cal escriure __SUGGESTION_1__\.$/u, () => `Si es del verbo «haver», debe escribirse «${suggestions[0] || ""}».`, () => `If it is a form of ‘haver’, write ‘${suggestions[0] || ""}’.`],
        [/^Si és del verb 'estar', s'escriu __SUGGESTION_1__\. "([^"]+)" és un adjectiu que vol dir '([^']+)'\.$/u, (m) => `Si es del verbo «estar», se escribe «${suggestions[0] || ""}». «${m[1]}» es un adjetivo que significa «${m[2]}».`, (m) => `If it is a form of ‘estar’, write ‘${suggestions[0] || ""}’. ‘${m[1]}’ is an adjective meaning ‘${m[2]}’.`],
        [/^Si és del v\. '([^']+)', cal escriure __SUGGESTION_1__\. Correcte si és imperatiu del v\. '([^']+)'\.$/u, (m) => `Si es del verbo «${m[1]}», debe escribirse «${suggestions[0] || ""}». Es correcto si es el imperativo de «${m[2]}».`, (m) => `If it is a form of ‘${m[1]}’, write ‘${suggestions[0] || ""}’. It is correct as the imperative of ‘${m[2]}’.`],
        [/^Si és del verb 'ser', cal accentuar\.$/u, () => `Si es del verbo «ser», debe llevar tilde.`, () => `If it is a form of ‘ser’, it needs an accent mark.`],
        [/^Si és del verb 'ser', s'escriu __SUGGESTION_1__\. Correcte si és del v\. 'seure'\.$/u, () => `Si es del verbo «ser», debe escribirse «${suggestions[0] || ""}». Es correcto si es del verbo «seure».`, () => `If it is a form of ‘ser’, write ‘${suggestions[0] || ""}’. It is correct if it is a form of ‘seure’.`],
        [/^La preposició adequada en aquest context és "([^"]+)"\.$/u, (m) => `La preposición adecuada en este contexto es «${m[1]}».`, (m) => `The correct preposition in this context is ‘${m[1]}’.`],
        [/^La preposició adequada amb el verb '([^']+)' és "([^"]+)"\.$/u, (m) => `La preposición adecuada con el verbo «${m[1]}» es «${m[2]}».`, (m) => `The correct preposition with the verb ‘${m[1]}’ is ‘${m[2]}’.`],
        [/^La preposició adequada amb el verb '([^']+)' és __SUGGESTION_1__\.$/u, (m) => `La preposición adecuada con el verbo «${m[1]}» es «${suggestions[0] || ""}».`, (m) => `The correct preposition with the verb ‘${m[1]}’ is ‘${suggestions[0] || ""}’.`],
        [/^La forma verbal adequada és __SUGGESTION_1__\.$/u, () => `La forma verbal adecuada es «${suggestions[0] || ""}».`, () => `The correct verb form is ‘${suggestions[0] || ""}’.`],
        [/^Probablement és més adequat un altre verb\.$/u, () => `Probablemente sea más adecuado otro verbo.`, () => `A different verb is probably more appropriate.`],
        [/^Probablement és més adequat un altre adjectiu\.$/u, () => `Probablemente sea más adecuado otro adjetivo.`, () => `A different adjective is probably more appropriate.`],
        [/^Pareix que hi falta una paraula\.$/u, () => `Parece que falta una palabra.`, () => `A word seems to be missing.`],
        [/^Possible error: paraula repetida\.$/u, () => `Posible error: palabra repetida.`, () => `Possible error: repeated word.`],
        [/^L'article dels topònims s'escriu amb minúscula\.$/u, () => `El artículo de los topónimos se escribe en minúscula.`, () => `The article in place names is written in lowercase.`],
        [/^L'infinitiu sol usar-se sense article\.$/u, () => `El infinitivo suele usarse sin artículo.`, () => `The infinitive is usually used without an article.`],
        [/^Construcció de relatiu incorrecta o hi falta un verb conjugat\.$/u, () => `Construcción de relativo incorrecta o falta un verbo conjugado.`, () => `Incorrect relative clause, or a finite verb is missing.`],
        [/^Combinació impossible de pronom i infinitiu\.$/u, () => `Combinación imposible de pronombre e infinitivo.`, () => `Impossible combination of pronoun and infinitive.`],
        [/^Combinació impossible de dues preposicions\.$/u, () => `Combinación imposible de dos preposiciones.`, () => `Impossible combination of two prepositions.`],
        [/^Incorrecte si equival a __SUGGESTION_1__\.$/u, () => `Incorrecto si equivale a «${suggestions[0] || ""}».`, () => `Incorrect if it means ‘${suggestions[0] || ""}’.`],
        [/^Val més usar una expressió alternativa\.$/u, () => `Es preferible usar una expresión alternativa.`, () => `Use an alternative expression.`],
        [/^Expressió probablement incorrecta\.$/u, () => `Expresión probablemente incorrecta.`, () => `Probably incorrect expression.`]
      ];
      for (const [pattern, spanish, english] of simpleRulePatterns) {
        const detail = canonical.match(pattern);
        if (detail) return language === "es" ? spanish(detail) : english(detail);
      }
      const generalPatterns = [
        [/^Amb valor emfàtic cal dir __SUGGESTION_1__\.$/u, () => `Para dar énfasis, debe decirse «${suggestions[0] || ""}».`, () => `To add emphasis, use ‘${suggestions[0] || ""}’.`],
        [/^Anglicisme innecessari en el sentit de '([^']+)'\.$/u, (m) => `Anglicismo innecesario con el sentido de «${m[1]}».`, (m) => `Unnecessary English borrowing in the sense of ‘${m[1]}’.`],
        [/^Aquesta expressió és un calc del castellà\.$/u, () => `Esta expresión es un calco del castellano.`, () => `This expression is a calque from Spanish.`],
        [/^Aquesta paraula és un anglicisme\.$/u, () => `Esta palabra es un anglicismo.`, () => `This word is an English borrowing.`],
        [/^Com a numeral s'escriu separat\.$/u, () => `Como numeral, se escribe separado.`, () => `As a numeral, it is written separately.`],
        [/^Construcció incorrecta\.$/u, () => `Construcción incorrecta.`, () => `Incorrect construction.`],
        [/^Error de concordança\.$/u, () => `Error de concordancia.`, () => `Agreement error.`],
        [/^Expressió castellana\.$/u, () => `Expresión castellana.`, () => `Spanish expression.`],
        [/^Expressió incoherent\.$/u, () => `Expresión incoherente.`, () => `Inconsistent expression.`],
        [/^Formalment, cal escriure __SUGGESTION_1__\.$/u, () => `En un registro formal, debe escribirse «${suggestions[0] || ""}».`, () => `In formal writing, use ‘${suggestions[0] || ""}’.`],
        [/^Incorrecte amb valor aproximatiu\.$/u, () => `Incorrecto con valor aproximativo.`, () => `Incorrect when used approximately.`],
        [/^Incorrecte si volíeu dir __SUGGESTION_1__\.$/u, () => `Incorrecto si querías decir «${suggestions[0] || ""}».`, () => `Incorrect if you meant ‘${suggestions[0] || ""}’.`],
        [/^L'abreviatura de 'segons' és __SUGGESTION_1__\.$/u, () => `La abreviatura de «segons» es «${suggestions[0] || ""}».`, () => `The abbreviation for ‘segons’ is ‘${suggestions[0] || ""}’.`],
        [/^L'abreviatura de ['"]segons['"] és __SUGGESTION_1__\.$/u, () => `La abreviatura de «segons» es «${suggestions[0] || ""}».`, () => `The abbreviation for ‘segons’ is ‘${suggestions[0] || ""}’.`],
        [/^Llenguatge col·loquial\.$/u, () => `Lenguaje coloquial.`, () => `Colloquial language.`],
        [/^Nom científic\.$/u, () => `Nombre científico.`, () => `Scientific name.`],
        [/^Per a indicar ordinal \(femení\), cal escriure __SUGGESTION_1__\.$/u, () => `Para indicar un ordinal femenino, debe escribirse «${suggestions[0] || ""}».`, () => `For a feminine ordinal, write ‘${suggestions[0] || ""}’.`],
        [/^Per a indicar ordinal \(masculí\), cal escriure __SUGGESTION_1__\.$/u, () => `Para indicar un ordinal masculino, debe escribirse «${suggestions[0] || ""}».`, () => `For a masculine ordinal, write ‘${suggestions[0] || ""}’.`],
        [/^Per a separar els milers, feu sevir un punt o un espai\.$/u, () => `Para separar los millares, usa un punto o un espacio.`, () => `Separate thousands with a full stop or a space.`],
        [/^Podeu usar una expressió més genuïna\.$/u, () => `Puedes usar una expresión más propia del catalán.`, () => `Consider using a more idiomatic Catalan expression.`],
        [/^Possible calc de l'anglès\.$/u, () => `Posible calco del inglés.`, () => `Possible calque from English.`],
        [/^Possible error de traducció automàtica\.$/u, () => `Posible error de traducción automática.`, () => `Possible machine-translation error.`],
        [/^Possible error ortogràfic\.$/u, () => `Posible error ortográfico.`, () => `Possible spelling mistake.`],
        [/^Potser no s'ha d'accentuar\.$/u, () => `Quizá no deba llevar tilde.`, () => `It may not need an accent mark.`],
        [/^Probablement cal escriure __SUGGESTION_1__\.$/u, () => `Probablemente debe escribirse «${suggestions[0] || ""}».`, () => `It should probably be written as ‘${suggestions[0] || ""}’.`],
        [/^Quan indica quantitat cal escriure __SUGGESTION_1__\.$/u, () => `Cuando indica cantidad, debe escribirse «${suggestions[0] || ""}».`, () => `When it indicates quantity, write ‘${suggestions[0] || ""}’.`],
        [/^S'accentua quan és una afirmació\.$/u, () => `Lleva tilde cuando expresa una afirmación.`, () => `It takes an accent mark when it expresses an affirmation.`],
        [/^Si és un nom, cal dir __SUGGESTION_1__\.$/u, () => `Si es un sustantivo, debe decirse «${suggestions[0] || ""}».`, () => `If it is a noun, use ‘${suggestions[0] || ""}’.`],
        [/^Si és un pronom s'escriu sense accent\.$/u, () => `Si es un pronombre, se escribe sin tilde.`, () => `If it is a pronoun, it is written without an accent mark.`],
        [/^Si és una forma del verb 'veure', s'escriu __SUGGESTION_1__ o __SUGGESTION_2__\.$/u, () => `Si es una forma del verbo «veure», se escribe «${suggestions[0] || ""}» o «${suggestions[1] || ""}».`, () => `If it is a form of ‘veure’, write ‘${suggestions[0] || ""}’ or ‘${suggestions[1] || ""}’.`],
        [/^Si modifica l'adverbi posterior cal escriure __SUGGESTION_1__\.$/u, () => `Si modifica el adverbio siguiente, debe escribirse «${suggestions[0] || ""}».`, () => `If it modifies the following adverb, write ‘${suggestions[0] || ""}’.`],
        [/^Ús abusiu del v\. '([^']+)'\. Useu una opció alternativa\.$/u, (m) => `Uso abusivo del verbo «${m[1]}». Usa una alternativa.`, (m) => `Overuse of the verb ‘${m[1]}’. Consider an alternative.`],
        [/^Useu "Sr\." com a abreviatura de "senyor"\.$/u, () => `Usa «Sr.» como abreviatura de «senyor».`, () => `Use ‘Sr.’ as the abbreviation for ‘senyor’.`],
        [/^Useu "Sr\." com a abreviatura de "senyor" o __SUGGESTION_1__ si és plural\.$/u, () => `Usa «Sr.» como abreviatura de «senyor» o «${suggestions[0] || ""}» en plural.`, () => `Use ‘Sr.’ as the abbreviation for ‘senyor’, or ‘${suggestions[0] || ""}’ for the plural.`],
        [/^L'expressió adequada és '([^']+)'\.$/u, (m) => `La expresión adecuada es «${m[1]}».`, (m) => `The appropriate expression is ‘${m[1]}’.`],
        [/^La paraula adequada és __SUGGESTION_1__\.$/u, () => `La palabra adecuada es «${suggestions[0] || ""}».`, () => `The appropriate word is ‘${suggestions[0] || ""}’.`],
        [/^L'adjectiu adequat és __SUGGESTION_1__\.$/u, () => `El adjetivo adecuado es «${suggestions[0] || ""}».`, () => `The appropriate adjective is ‘${suggestions[0] || ""}’.`],
        [/^El pronom adequat és __SUGGESTION_1__\.$/u, () => `El pronombre adecuado es «${suggestions[0] || ""}».`, () => `The appropriate pronoun is ‘${suggestions[0] || ""}’.`],
        [/^La preposició adequada és __SUGGESTION_1__\.$/u, () => `La preposición adecuada es «${suggestions[0] || ""}».`, () => `The appropriate preposition is ‘${suggestions[0] || ""}’.`],
        [/^La preposició adequada és ['"]([^'"]+)['"]\.$/u, (m) => `La preposición adecuada es «${m[1]}».`, (m) => `The appropriate preposition is ‘${m[1]}’.`],
        [/^Cal usar una altra expressió\.$/u, () => `Hay que usar otra expresión.`, () => `Use a different expression.`],
        [/^Cal usar una altra paraula\.$/u, () => `Hay que usar otra palabra.`, () => `Use a different word.`],
        [/^Expressió incorrecta\.$/u, () => `Expresión incorrecta.`, () => `Incorrect expression.`],
        [/^Possible error de picatge\. "([^"]+)" és un sinònim poc freqüent de "([^"]+)"\.$/u, (m) => `Posible error tipográfico. «${m[1]}» es un sinónimo poco frecuente de «${m[2]}».`, (m) => `Possible typo. ‘${m[1]}’ is an uncommon synonym of ‘${m[2]}’.`],
        [/^Possible error de picatge\. "([^"]+)" és un verb inusual de l'àmbit ([^.]+)\.$/u, (m) => `Posible error tipográfico. «${m[1]}» es un verbo poco habitual del ámbito ${m[2]}.`, (m) => `Possible typo. ‘${m[1]}’ is an uncommon verb in ${m[2]}.`],
        [/^Possible error de picatge\. "([^"]+)" és un nom inusual\.$/u, (m) => `Posible error tipográfico. «${m[1]}» es un sustantivo poco habitual.`, (m) => `Possible typo. ‘${m[1]}’ is an uncommon noun.`],
        [/^No és una forma verbal en aquest context\.$/u, () => `No es una forma verbal adecuada en este contexto.`, () => `This is not an appropriate verb form in this context.`],
        [/^No és un sinònim de __SUGGESTION_1__\.$/u, () => `No es sinónimo de «${suggestions[0] || ""}».`, () => `It is not a synonym of ‘${suggestions[0] || ""}’.`]
      ];
      for (const [pattern, spanish, english] of generalPatterns) {
        const detail = canonical.match(pattern);
        if (detail) return language === "es" ? spanish(detail) : english(detail);
      }
      const grammarPatterns = [
        [/^Abreviatura de número\.$/u, () => `Abreviatura de número.`, () => `Abbreviation for number.`],
        [/^Adjectiu admès només per alguns diccionaris\.$/u, () => `Adjetivo admitido solo por algunos diccionarios.`, () => `Adjective listed in only some dictionaries.`],
        [/^Adjectiu no admès per tots els diccionaris\.$/u, () => `Adjetivo no admitido por todos los diccionarios.`, () => `Adjective not accepted by all dictionaries.`],
        [/^Alguns diccionaris registren el verb '([^']+)', però és d'ús infreqüent\.$/u, (m) => `Algunos diccionarios recogen el verbo «${m[1]}», pero es poco frecuente.`, (m) => `Some dictionaries list the verb ‘${m[1]}’, but it is uncommon.`],
        [/^Alguns llibres d'estil recomanen evitar aquesta expressió\.$/u, () => `Algunos manuales de estilo recomiendan evitar esta expresión.`, () => `Some style guides recommend avoiding this expression.`],
        [/^Amb el sentit de '([^']+)' és femení\.$/u, (m) => `Con el sentido de «${m[1]}», es femenino.`, (m) => `It is feminine when used to mean ‘${m[1]}’.`],
        [/^Amb el sentit de '([^']+)' cal dir __SUGGESTION_1__\.$/u, (m) => `Con el sentido de «${m[1]}», debe decirse «${suggestions[0] || ""}».`, (m) => `When it means ‘${m[1]}’, use ‘${suggestions[0] || ""}’.`],
        [/^Amb el sentit de 'continuar', és preferible evitar el verb 'seguir'\.$/u, () => `Con el sentido de «continuar», es preferible evitar el verbo «seguir».`, () => `When it means ‘to continue’, avoid the verb ‘seguir’.`],
        [/^Amb el sentit de 'desordenat', usem altres expressions\.$/u, () => `Con el sentido de «desordenado», se usan otras expresiones.`, () => `Use other expressions to mean ‘untidy’.`],
        [/^Amb el sentit de '([^']+)' s'escriu junt\.$/u, (m) => `Con el sentido de «${m[1]}», se escribe junto.`, (m) => `When it means ‘${m[1]}’, it is written as one word.`],
        [/^Amb el sentit de '([^']+)', cal dir __SUGGESTION_1__\.$/u, (m) => `Con el sentido de «${m[1]}», debe decirse «${suggestions[0] || ""}».`, (m) => `When it means ‘${m[1]}’, use ‘${suggestions[0] || ""}’.`],
        [/^Amb el sentit de 'per quina raó' s'escriu separat\. És correcte junt si la resposta a la pregunta és "sí" o "no"\.$/u, () => `Con el sentido de «por qué razón», se escribe separado. Se escribe junto cuando la respuesta a la pregunta es «sí» o «no».`, () => `When it means ‘for what reason’, write it as two words. Write it as one word if the answer to the question is ‘yes’ or ‘no’.`],
        [/^Amb el sentit de 'quina cosa' s'escriu amb accent\.$/u, () => `Con el sentido de «qué cosa», se escribe con tilde.`, () => `When it means ‘what thing’, it takes an accent mark.`],
        [/^Amb referència a causa o raó, és més apropiat usar la preposició '([^']+)'\.$/u, (m) => `Para expresar causa o razón, es más apropiado usar la preposición «${m[1]}».`, (m) => `To express cause or reason, the preposition ‘${m[1]}’ is more appropriate.`],
        [/^Amb referència a motiu o causa, és més apropiat usar la preposició '([^']+)'\.$/u, (m) => `Para expresar motivo o causa, es más apropiado usar la preposición «${m[1]}».`, (m) => `To express a reason or cause, the preposition ‘${m[1]}’ is more appropriate.`],
        [/^Amb un adverbi de probabilitat \("\\1"\) és preferible usar un verb en indicatiu o en futur\.$/u, () => `Con un adverbio de probabilidad («\\1»), es preferible usar un verbo en indicativo o en futuro.`, () => `With an adverb of probability (‘\\1’), use a verb in the indicative or future tense.`],
        [/^Amb un adverbi de probabilitat \("\\1"\) és preferible usar un verb en indicatiu\.$/u, () => `Con un adverbio de probabilidad («\\1»), es preferible usar un verbo en indicativo.`, () => `With an adverb of probability (‘\\1’), use a verb in the indicative.`],
        [/^Amb un subjecte cal usar el verb 'ser'\. L'expressió "es tracta" és impersonal\.$/u, () => `Con un sujeto, debe usarse el verbo «ser». La expresión «es tracta» es impersonal.`, () => `With a subject, use the verb ‘ser’. The expression ‘es tracta’ is impersonal.`],
        [/^Amb un subjecte cal usar una altra expressió, perquè "es tracta" és impersonal\.$/u, () => `Con un sujeto, debe usarse otra expresión, porque «es tracta» es impersonal.`, () => `With a subject, use a different expression because ‘es tracta’ is impersonal.`],
        [/^Amb ús adverbial, és preferible dir __SUGGESTION_1__\.$/u, () => `En uso adverbial, es preferible decir «${suggestions[0] || ""}».`, () => `When used adverbially, ‘${suggestions[0] || ""}’ is preferable.`],
        [/^Amb valor abstractiu val més usar una altra construcció\.$/u, () => `Con valor abstracto, es preferible usar otra construcción.`, () => `Use a different construction for the abstract meaning.`],
        [/^Amb valor abstractiu val més usar una altra construcció\. Només és correcte si equival a (.+)\.$/u, (m) => `Con valor abstracto, es preferible usar otra construcción. Solo es correcto si equivale a ${m[1]}.`, (m) => `Use a different construction for the abstract meaning. It is correct only if it means ${m[1]}.`],
        [/^Amb valor emfàtic cal dir __SUGGESTION_1__\. "\\2" és correcte si indica possessió\.$/u, () => `Con valor enfático, debe decirse «${suggestions[0] || ""}». «\\2» es correcto si indica posesión.`, () => `For emphasis, use ‘${suggestions[0] || ""}’. ‘\\2’ is correct when it indicates possession.`],
        [/^Amb valor freqüentatiu val més dir __SUGGESTION_1__\.$/u, () => `Con valor frecuentativo, es preferible decir «${suggestions[0] || ""}».`, () => `For the frequentative meaning, use ‘${suggestions[0] || ""}’.`],
        [/^Anglicisme admès només per alguns diccionaris\.$/u, () => `Anglicismo admitido solo por algunos diccionarios.`, () => `English borrowing listed in only some dictionaries.`],
        [/^Anglicisme innecessari en el sentit de '([^']+)'\. Incorrecte en el sentit de '([^']+)'\.$/u, (m) => `Anglicismo innecesario con el sentido de «${m[1]}». Es incorrecto con el sentido de «${m[2]}».`, (m) => `Unnecessary English borrowing when it means ‘${m[1]}’. Incorrect when it means ‘${m[2]}’.`],
        [/^Anglicisme innecessari\. Considereu fer servir la grafia adaptada\.$/u, () => `Anglicismo innecesario. Considera usar la grafía adaptada.`, () => `Unnecessary English borrowing. Consider using the adapted spelling.`],
        [/^Apostrofació incorrecta o pronom feble incorrecte\.$/u, () => `Apóstrofo o pronombre átono incorrecto.`, () => `Incorrect apostrophe or weak pronoun.`],
        [/^Aquest nom normalment s'usa en singular\.$/u, () => `Este sustantivo normalmente se usa en singular.`, () => `This noun is usually used in the singular.`],
        [/^Aquest pronom feble s'uneix al verb amb un apòstrof\.$/u, () => `Este pronombre átono se une al verbo con un apóstrofo.`, () => `This weak pronoun is joined to the verb with an apostrophe.`],
        [/^Aquest temps verbal no és adequat en una frase condicional\.$/u, () => `Este tiempo verbal no es adecuado en una oración condicional.`, () => `This verb tense is not appropriate in a conditional sentence.`],
        [/^Aquest verb és intransitiu\.$/u, () => `Este verbo es intransitivo.`, () => `This verb is intransitive.`],
        [/^Aquest verb hauria d'estar en mode subjuntiu\.$/u, () => `Este verbo debería estar en modo subjuntivo.`, () => `This verb should be in the subjunctive mood.`],
        [/^Aquest verb hauria d'estar en present de subjuntiu\.$/u, () => `Este verbo debería estar en presente de subjuntivo.`, () => `This verb should be in the present subjunctive.`],
        [/^Aquest verb hauria d'estar en subjuntiu\. És correcte en la varietat valenciana\.$/u, () => `Este verbo debería estar en subjuntivo. Es correcto en la variedad valenciana.`, () => `This verb should be in the subjunctive. It is correct in the Valencian variety.`],
        [/^Aquest verb no és pronominal\. Probablement hi sobra el pronom\.$/u, () => `Este verbo no es pronominal. Probablemente sobra el pronombre.`, () => `This verb is not pronominal. The pronoun is probably unnecessary.`],
        [/^Aquesta abreviatura s'escriu amb majúscula inicial\.$/u, () => `Esta abreviatura se escribe con mayúscula inicial.`, () => `This abbreviation starts with a capital letter.`],
        [/^Aquesta abreviatura s'escriu sense punt\.$/u, () => `Esta abreviatura se escribe sin punto.`, () => `This abbreviation is written without a full stop.`],
        [/^Aquesta coma entre subjecte i verb és incorrecta\.$/u, () => `Esta coma entre el sujeto y el verbo es incorrecta.`, () => `This comma between the subject and verb is incorrect.`],
        [/^Aquesta expressió \(col·loquial\) s'escriu amb accent\.$/u, () => `Esta expresión coloquial se escribe con tilde.`, () => `This colloquial expression takes an accent mark.`],
        [/^Aquesta expressió es construeix amb el singular __SUGGESTION_1__\.$/u, () => `Esta expresión se construye con el singular «${suggestions[0] || ""}».`, () => `This expression takes the singular form ‘${suggestions[0] || ""}’.`],
        [/^Aquesta expressió és incoherent\. Elimineu "\\1"\.$/u, () => `Esta expresión es incoherente. Elimina «\\1».`, () => `This expression is inconsistent. Remove ‘\\1’.`],
        [/^Aquesta expressió és més habitual amb la forma __SUGGESTION_1__\.$/u, () => `Esta expresión es más habitual con la forma «${suggestions[0] || ""}».`, () => `This expression is more commonly used in the form ‘${suggestions[0] || ""}’.`],
        [/^Aquesta expressió és probablement un calc del castellà\.$/u, () => `Esta expresión probablemente es un calco del castellano.`, () => `This expression is probably a calque from Spanish.`],
        [/^Aquesta expressió és un anglicisme sintàctic\. Podeu usar una expressió alternativa\.$/u, () => `Esta expresión es un anglicismo sintáctico. Puedes usar otra expresión.`, () => `This expression is a syntactic calque from English. Consider an alternative expression.`],
        [/^Aquesta expressió és un calc de l'anglès\. Considereu una solució alternativa\.$/u, () => `Esta expresión es un calco del inglés. Considera una alternativa.`, () => `This expression is a calque from English. Consider an alternative.`],
        [/^Aquesta expressió és un calc del castellà\. Feu servir "fugir o anar-se'n \(una cosa\) del cap" o "perdre el fil"\.$/u, () => `Esta expresión es un calco del castellano. Usa «fugir o anar-se'n (una cosa) del cap» o «perdre el fil».`, () => `This expression is a calque from Spanish. Use ‘fugir o anar-se'n (una cosa) del cap’ or ‘perdre el fil’.`],
        [/^Aquesta expressió és un calc del castellà\. Podeu usar una expressió alternativa\.$/u, () => `Esta expresión es un calco del castellano. Puedes usar otra expresión.`, () => `This expression is a calque from Spanish. Consider an alternative expression.`],
        [/^Aquesta expressió s'escriu sense article\.$/u, () => `Esta expresión se escribe sin artículo.`, () => `This expression is written without an article.`],
        [/^Aquesta numeral no ha d'anar en plural\.$/u, () => `Este numeral no debe ir en plural.`, () => `This numeral should not be pluralised.`],
        [/^Aquesta paraula és un anglicisme\. Podeu usar una alternativa més genuïna\.$/u, () => `Esta palabra es un anglicismo. Puedes usar una alternativa más propia del catalán.`, () => `This word is an English borrowing. Consider a more idiomatic Catalan alternative.`],
        [/^Aquesta paraula és un anglicisme\. Podeu usar una alternativa més genuïna\. En tot cas, caldria escriure "([^"]+)"\.$/u, (m) => `Esta palabra es un anglicismo. Puedes usar una alternativa más propia del catalán. En cualquier caso, debería escribirse «${m[1]}».`, (m) => `This word is an English borrowing. Consider a more idiomatic Catalan alternative. In any case, it should be written ‘${m[1]}’.`],
        [/^Aquesta paraula és un castellanisme inadmissible\.$/u, () => `Esta palabra es un castellanismo inadmisible.`, () => `This word is an unacceptable Spanish borrowing.`],
        [/^Com a locució adverbial, és preferible usar una altra expressió\.$/u, () => `Como locución adverbial, es preferible usar otra expresión.`, () => `Use a different adverbial phrase.`],
        [/^Com a locució adversativa s'escriu __SUGGESTION_1__\.$/u, () => `Como locución adversativa, se escribe «${suggestions[0] || ""}».`, () => `As a concessive phrase, write ‘${suggestions[0] || ""}’.`],
        [/^Com a locució per a indicar indiferència, és preferible dir __SUGGESTION_1__\.$/u, () => `Para expresar indiferencia con una locución, es preferible decir «${suggestions[0] || ""}».`, () => `To express indifference, use the phrase ‘${suggestions[0] || ""}’.`],
        [/^Com a nom femení, no s'apostrofa\. L'apostrofació pot ser correcta si és una forma del v\. '([^']+)'\.$/u, (m) => `Como sustantivo femenino, no lleva apóstrofo. Puede llevarlo si es una forma del verbo «${m[1]}».`, (m) => `As a feminine noun, it does not take an apostrophe. It may take one if it is a form of ‘${m[1]}’.`],
        [/^Com a numeral s'escriu separat\. Com a terme d'alpinisme ha de concordar\.$/u, () => `Como numeral, se escribe separado. Como término de alpinismo, debe concordar.`, () => `As a numeral, it is written separately. As a mountaineering term, it must agree.`],
        [/^Com a numeral s'escriu separat\. Només s'escriu junt com a terme d'alpinisme\.$/u, () => `Como numeral, se escribe separado. Solo se escribe junto como término de alpinismo.`, () => `As a numeral, it is written separately. It is written together only as a mountaineering term.`],
        [/^Com a numeral, cal escriure __SUGGESTION_1__\. Com a terme d'alpinisme, s'escriu junt\.$/u, () => `Como numeral, debe escribirse «${suggestions[0] || ""}». Como término de alpinismo, se escribe junto.`, () => `As a numeral, write ‘${suggestions[0] || ""}’. As a mountaineering term, it is written together.`],
        [/^Com a ordinal, cal escriure __SUGGESTION_1__\.$/u, () => `Como ordinal, debe escribirse «${suggestions[0] || ""}».`, () => `As an ordinal, write ‘${suggestions[0] || ""}’.`],
        [/^Com a prefix d'un altre adjectiu, '([^']+)' s'escriu junt, encara que la paraula resultant no sigui en el diccionari\.$/u, (m) => `Como prefijo de otro adjetivo, «${m[1]}» se escribe unido a la palabra, aunque el resultado no figure en el diccionario.`, (m) => `As a prefix attached to another adjective, ‘${m[1]}’ is written as one word, even if the resulting word is not in the dictionary.`],
        [/^Com a prefix, '([^']+)' s'escriu junt, encara que la paraula resultant no sigui en el diccionari\.$/u, (m) => `Como prefijo, «${m[1]}» se escribe unido a la palabra, aunque el resultado no figure en el diccionario.`, (m) => `As a prefix, ‘${m[1]}’ is written as one word, even if the resulting word is not in the dictionary.`],
        [/^Com a pronom feble, és preferible la forma __SUGGESTION_1__\. Si és pronom personal, cal escriure __SUGGESTION_2__\.$/u, () => `Como pronombre átono, es preferible la forma «${suggestions[0] || ""}». Si es un pronombre personal, debe escribirse «${suggestions[1] || ""}».`, () => `As a weak pronoun, use ‘${suggestions[0] || ""}’. If it is a personal pronoun, write ‘${suggestions[1] || ""}’.`],
        [/^Com a substantiu plural, s'escriu junt\.$/u, () => `Como sustantivo plural, se escribe junto.`, () => `As a plural noun, it is written as one word.`],
        [/^Com a substantiu s'escriu junt\.$/u, () => `Como sustantivo, se escribe junto.`, () => `As a noun, it is written as one word.`],
        [/^Com a substantiu, "dubte" és masculí\. "Dubte" pot ser una forma verbal del v\. 'dubtar'\.$/u, () => `Como sustantivo, «dubte» es masculino. «Dubte» también puede ser una forma del verbo «dubtar».`, () => `As a noun, ‘dubte’ is masculine. ‘Dubte’ may also be a form of the verb ‘dubtar’.`],
        [/^Com a substantiu, és preferible usar una altra paraula\. Correcte si és una forma del verb '([^']+)'\.$/u, (m) => `Como sustantivo, es preferible usar otra palabra. Es correcto si es una forma del verbo «${m[1]}».`, (m) => `Use a different word as a noun. It is correct if it is a form of ‘${m[1]}’.`],
        [/^Com a substantiu, només existeix en plural\. Correcte si és una forma del v\. '([^']+)'\.$/u, (m) => `Como sustantivo, solo existe en plural. Es correcto si es una forma del verbo «${m[1]}».`, (m) => `As a noun, it exists only in the plural. It is correct if it is a form of ‘${m[1]}’.`],
        [/^Com a substantiu, sols és admès pel DNV \(AVL\)\.$/u, () => `Como sustantivo, solo lo admite el DNV (AVL).`, () => `As a noun, it is listed only in the DNV (AVL).`],
        [/^Com a terme matemàtic, és preferible dir __SUGGESTION_1__\.$/u, () => `Como término matemático, es preferible decir «${suggestions[0] || ""}».`, () => `As a mathematical term, use ‘${suggestions[0] || ""}’.`],
        [/^Com que la locució següent té funció d'adjectiu o adverbi, cal escriure __SUGGESTION_1__\.$/u, () => `Como la locución siguiente funciona como adjetivo o adverbio, debe escribirse «${suggestions[0] || ""}».`, () => `Because the following phrase functions as an adjective or adverb, write ‘${suggestions[0] || ""}’.`],
        [/^Combinació de pronoms feble incorrecta\.$/u, () => `Combinación incorrecta de pronombres átonos.`, () => `Incorrect combination of weak pronouns.`],
        [/^Combinació impossible de preposició, pronoms? i verb\. Potser hi falta o hi sobra alguna paraula\.$/u, () => `Combinación imposible de preposición, pronombre(s) y verbo. Quizá falte o sobre alguna palabra.`, () => `Impossible combination of a preposition, pronoun(s), and a verb. A word may be missing or unnecessary.`],
        [/^Combinació impossible: preposició\+verb conjugat\.$/u, () => `Combinación imposible: preposición seguida de un verbo conjugado.`, () => `Impossible combination: a preposition followed by a conjugated verb.`],
        [/^Considereu usar una expressió alternativa\.$/u, () => `Considera usar una expresión alternativa.`, () => `Consider using an alternative expression.`],
        [/^Construcció incorrecta si equival a "en el fet que"\.$/u, () => `Construcción incorrecta si equivale a «en el hecho de que».`, () => `Incorrect construction if it means ‘in the fact that’.`],
        [/^Construcció incorrecta\. Cal dir '\\([0-9])-se d'alguna cosa, \\([0-9])-se'n'\.$/u, (m) => `Construcción incorrecta. Debe decirse «\\${m[1]}-se d'alguna cosa, \\${m[2]}-se'n».`, (m) => `Incorrect construction. Use ‘\\${m[1]}-se d'alguna cosa, \\${m[2]}-se'n’.`],
        [/^Construcció informal\.$/u, () => `Construcción informal.`, () => `Informal construction.`],
        [/^Construcció probablement incorrecta o supèrflua\.$/u, () => `Construcción probablemente incorrecta o superflua.`, () => `Probably incorrect or unnecessary construction.`],
        [/^D'acord amb el Termcat, són preferibles altres expressions\.$/u, () => `Según el Termcat, son preferibles otras expresiones.`, () => `Termcat recommends using other expressions.`],
        [/^Davant d'un adjectiu cal escriure __SUGGESTION_1__\.$/u, () => `Delante de un adjetivo debe escribirse «${suggestions[0] || ""}».`, () => `Before an adjective, write ‘${suggestions[0] || ""}’.`],
        [/^Davant d'un adjectiu, un adverbi o una locució amb aquestes funcions, cal escriure __SUGGESTION_1__\.$/u, () => `Delante de un adjetivo, adverbio o locución con estas funciones, debe escribirse «${suggestions[0] || ""}».`, () => `Before an adjective, adverb, or phrase used in this way, write ‘${suggestions[0] || ""}’.`],
        [/^Davant de locució adverbial o adjectival cal escriure __SUGGESTION_1__\.$/u, () => `Delante de una locución adverbial o adjetival debe escribirse «${suggestions[0] || ""}».`, () => `Before an adverbial or adjectival phrase, write ‘${suggestions[0] || ""}’.`],
        [/^Davant de nom cal escriure __SUGGESTION_1__\. Però a voltes algun nom es pot usar com a adjectiu \(ex\. és tan home\)\.$/u, () => `Delante de un sustantivo debe escribirse «${suggestions[0] || ""}». Sin embargo, algunos sustantivos pueden usarse como adjetivos (por ejemplo, «és tan home»).`, () => `Before a noun, write ‘${suggestions[0] || ""}’. Some nouns can, however, be used as adjectives (e.g. ‘és tan home’).`],
        [/^Davant de parts del cos, val més evitar el possessiu i usar un pronom\.$/u, () => `Delante de partes del cuerpo, es preferible evitar el posesivo y usar un pronombre.`, () => `With body parts, avoid the possessive and use a pronoun instead.`],
        [/^Davant de verb cal escriure __SUGGESTION_1__\.$/u, () => `Delante de un verbo debe escribirse «${suggestions[0] || ""}».`, () => `Before a verb, write ‘${suggestions[0] || ""}’.`],
        [/^Davant del so de 's' és recomanable usar la forma plena\.$/u, () => `Delante del sonido «s», se recomienda usar la forma plena.`, () => `The full form is recommended before the ‘s’ sound.`],
        [/^El complement directe s'escriu sense la preposició 'a'\.$/u, () => `El complemento directo se escribe sin la preposición «a».`, () => `Do not use the preposition ‘a’ before the direct object.`],
        [/^El germanisme 'Stolperstein' es pot substituir per l'expressió __SUGGESTION_1__\.$/u, () => `El germanismo «Stolperstein» puede sustituirse por la expresión «${suggestions[0] || ""}».`, () => `The Germanism ‘Stolperstein’ can be replaced with ‘${suggestions[0] || ""}’.`],
        [/^El gerundi del verb 'viure' és __SUGGESTION_1__\.$/u, () => `El gerundio del verbo «viure» es «${suggestions[0] || ""}».`, () => `The gerund of ‘viure’ is ‘${suggestions[0] || ""}’.`],
        [/^El guió és innecessari en enumeracions\.$/u, () => `El guion es innecesario en enumeraciones.`, () => `A dash is unnecessary in lists.`],
        [/^El mes «\\3» sols té __SUGGESTION_1__ dies\.$/u, () => `El mes «\\3» solo tiene «${suggestions[0] || ""}» días.`, () => `The month ‘\\3’ has only ‘${suggestions[0] || ""}’ days.`],
        [/^El mes de febrer sols té __SUGGESTION_1__ dies, perquè l'any \\5 no és de traspàs\.$/u, () => `Febrero solo tiene «${suggestions[0] || ""}» días porque el año \\5 no es bisiesto.`, () => `February has only ‘${suggestions[0] || ""}’ days because year \\5 is not a leap year.`],
        [/^El mes de febrer sols té __SUGGESTION_1__ o __SUGGESTION_2__ dies\.$/u, () => `Febrero tiene solo «${suggestions[0] || ""}» o «${suggestions[1] || ""}» días.`, () => `February has only ‘${suggestions[0] || ""}’ or ‘${suggestions[1] || ""}’ days.`],
        [/^El nom apropiat és __SUGGESTION_1__\.$/u, () => `El nombre adecuado es «${suggestions[0] || ""}».`, () => `The appropriate name is ‘${suggestions[0] || ""}’.`],
        [/^El nom artístic del pintor Hieronymus Bosch és "el Bosch"\.$/u, () => `El nombre artístico del pintor Hieronymus Bosch es «el Bosch».`, () => `The painter Hieronymus Bosch’s artistic name is ‘el Bosch’.`],
        [/^El nom del municipi \(de Túria o d'Ebre\) s'escriu __SUGGESTION_1__\.$/u, () => `El nombre del municipio (de Túria o d'Ebre) se escribe «${suggestions[0] || ""}».`, () => `The name of the municipality (de Túria or d'Ebre) is written ‘${suggestions[0] || ""}’.`],
        [/^El plural adequat és __SUGGESTION_1__\.$/u, () => `El plural adecuado es «${suggestions[0] || ""}».`, () => `The correct plural is ‘${suggestions[0] || ""}’.`],
        [/^El plural de les sigles no es marca gràficament\. Useu __SUGGESTION_1__ o __SUGGESTION_2__\.$/u, () => `El plural de las siglas no se marca gráficamente. Usa «${suggestions[0] || ""}» o «${suggestions[1] || ""}».`, () => `Acronym plurals are not marked in writing. Use ‘${suggestions[0] || ""}’ or ‘${suggestions[1] || ""}’.`],
        [/^El possessiu és redundant\.$/u, () => `El posesivo es redundante.`, () => `The possessive is redundant.`],
        [/^El prefix '([^']+)' s'escriu junt\.$/u, (m) => `El prefijo «${m[1]}» se escribe unido a la palabra.`, (m) => `The prefix ‘${m[1]}’ is written as part of the word.`]
      ];
      for (const [pattern, spanish, english] of grammarPatterns) {
        const detail = canonical.match(pattern);
        if (detail) return language === "es" ? spanish(detail) : english(detail);
      }
      const continuation = canonical.match(/^¿Volíeu dir __SUGGESTION_1__\? (.+)$/u);
      if (continuation) {
        const tail = continuation[1];
        const cases = [
          [/^Correcte com a forma del v\. '([^']+)'\.$/u, (m) => `Correcto como forma del verbo «${m[1]}».`, (m) => `Correct as a form of the verb ‘${m[1]}’.`],
          [/^Correcte com a forma del verb '([^']+)'\.$/u, (m) => `Correcto como forma del verbo «${m[1]}».`, (m) => `Correct as a form of the verb ‘${m[1]}’.`],
          [/^És correcte com a forma del v\. '([^']+)'\.$/u, (m) => `Es correcto como forma del verbo «${m[1]}».`, (m) => `It is correct as a form of the verb ‘${m[1]}’.`],
          [/^Correcte com a forma valenciana del v\. '([^']+)'\.$/u, (m) => `Correcto como forma valenciana del verbo «${m[1]}».`, (m) => `Correct as a Valencian form of the verb ‘${m[1]}’.`],
          [/^Correcte com a participi del v\. '([^']+)'\.$/u, (m) => `Correcto como participio del verbo «${m[1]}».`, (m) => `Correct as the past participle of ‘${m[1]}’.`],
          [/^Correcte en el sentit de __SUGGESTION_2__\.$/u, () => `Correcto con el sentido de «${suggestions[1] || ""}».`, () => `Correct with the meaning ‘${suggestions[1] || ""}’.`],
          [/^Correcte en el sentit de '([^']+)'\.$/u, (m) => `Correcto con el sentido de «${m[1]}».`, (m) => `Correct with the meaning ‘${m[1]}’.`],
          [/^Correcte si equival a "([^"]+)"\.$/u, (m) => `Correcto si equivale a «${m[1]}».`, (m) => `Correct if it means ‘${m[1]}’.`],
          [/^Correcte si és una forma del v\. '([^']+)'\.$/u, (m) => `Correcto si es una forma del verbo «${m[1]}».`, (m) => `Correct if it is a form of ‘${m[1]}’.`],
          [/^Correcte si és el gerundi del v\. '([^']+)'\.$/u, (m) => `Correcto si es el gerundio del verbo «${m[1]}».`, (m) => `Correct if it is the gerund of ‘${m[1]}’.`],
          [/^Correcte si és una forma del verb '([^']+)'\.$/u, (m) => `Correcto si es una forma del verbo «${m[1]}».`, (m) => `Correct if it is a form of ‘${m[1]}’.`],
          [/^Correcte com a terme musical\.$/u, () => `Correcto como término musical.`, () => `Correct as a musical term.`],
          [/^El "([^"]+)" és una part de l'armadura de cavaller\.$/u, (m) => `El «${m[1]}» es una parte de la armadura de un caballero.`, (m) => `The ‘${m[1]}’ is part of a knight’s armour.`],
          [/^És correcte si vol dir '([^']+)'\.$/u, (m) => `Es correcto si significa «${m[1]}».`, (m) => `It is correct if it means ‘${m[1]}’.`],
          [/^Existeix 'tu ([^']+)' \(del v\. '([^']+)'\)\.$/u, (m) => `Existe «tu ${m[1]}» (del verbo «${m[2]}»).`, (m) => `The form ‘tu ${m[1]}’ exists (from the verb ‘${m[2]}’).`],
          [/^La paraula "([^"]+)" sembla un calc de l'anglès\.$/u, (m) => `La palabra «${m[1]}» parece un calco del inglés.`, (m) => `The word ‘${m[1]}’ appears to be a calque from English.`],
          [/^Si és un verb, s'escriu sense accent\.$/u, () => `Si es un verbo, se escribe sin tilde.`, () => `If it is a verb, it is written without an accent mark.`],
          [/^Un "([^"]+)" és un brot d'una planta\.$/u, (m) => `Un «${m[1]}» es un brote de una planta.`, (m) => `A ‘${m[1]}’ is a plant shoot.`],
          [/^Una "([^"]+)" és una menjada al camp\.$/u, (m) => `Una «${m[1]}» es una comida en el campo.`, (m) => `A ‘${m[1]}’ is a meal eaten in the countryside.`],
          [/^És correcte si es refereix a "([^"]+)"\.$/u, (m) => `Es correcto si se refiere a «${m[1]}».`, (m) => `It is correct if it refers to ‘${m[1]}’.`],
          [/^Si no, hi ha un error de concordança\.$/u, () => `Si no, hay un error de concordancia.`, () => `Otherwise, there is an agreement error.`],
          [/^Potser hi falta un participi\.$/u, () => `Quizá falte un participio.`, () => `A past participle may be missing.`],
          [/^"([^"]+)" és correcte si significa "([^"]+)"\.$/u, (m) => `«${m[1]}» es correcto si significa «${m[2]}».`, (m) => `‘${m[1]}’ is correct if it means ‘${m[2]}’.`],
          [/^"([^"]+)" pot ser una forma del verb '([^']+)'\.$/u, (m) => `«${m[1]}» puede ser una forma del verbo «${m[2]}».`, (m) => `‘${m[1]}’ may be a form of ‘${m[2]}’.`],
          [/^"([^"]+)" és el nom d'un joc\.$/u, (m) => `«${m[1]}» es el nombre de un juego.`, (m) => `‘${m[1]}’ is the name of a game.`],
          [/^"([^"]+)" és el nom d'un mamífer\.$/u, (m) => `«${m[1]}» es el nombre de un mamífero.`, (m) => `‘${m[1]}’ is the name of a mammal.`],
          [/^"([^"]+)" és una paraula d'ús infreqüent\.$/u, (m) => `«${m[1]}» es una palabra de uso infrecuente.`, (m) => `‘${m[1]}’ is an uncommon word.`],
          [/^"([^"]+)" és un sinònim de '([^']+)'\.$/u, (m) => `«${m[1]}» es sinónimo de «${m[2]}».`, (m) => `‘${m[1]}’ is a synonym of ‘${m[2]}’.`],
          [/^"([^"]+)" és un tractament usat a Mallorca\.$/u, (m) => `«${m[1]}» es un tratamiento usado en Mallorca.`, (m) => `‘${m[1]}’ is a form of address used in Mallorca.`],
          [/^"([^"]+)" és una forma valenciana del v\. '([^']+)'\.$/u, (m) => `«${m[1]}» es una forma valenciana del verbo «${m[2]}».`, (m) => `‘${m[1]}’ is a Valencian form of ‘${m[2]}’.`],
          [/^¿Volíeu dir __SUGGESTION_1__? "([^"]+)" (.+)$/u, (m) => `¿Querías decir «${suggestions[0] || ""}»? «${m[1]}» ${m[2]}`, (m) => `Did you mean ‘${suggestions[0] || ""}’? ‘${m[1]}’ ${m[2]}`]
        ];
        for (const [pattern, spanish, english] of cases) {
          const detail = tail.match(pattern);
          if (detail) return language === "es" ? spanish(detail) : english(detail);
        }
      }
      let match = canonical.match(/^¿Volíeu dir (["'])(.+?)\1\?$/u);
      if (match) return language === "es" ? `¿Quería decir «${match[2]}»?` : `Did you mean ‘${match[2]}’?`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" vol dir (["'])(.+?)\3\.$/u);
      if (match) {
        const suggestion = suggestions[0] || "";
        return language === "es"
          ? `¿Quería decir «${suggestion}»? «${match[2]}» significa «${match[4]}».`
          : `Did you mean ‘${suggestion}’? ‘${match[2]}’ means ‘${match[4]}’.`;
      }
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" és una forma del verb (["'])(.+?)\3\.$/u);
      if (match) {
        const suggestion = suggestions[0] || "";
        return language === "es"
          ? `¿Quería decir «${suggestion}»? «${match[2]}» es una forma del verbo «${match[4]}».`
          : `Did you mean ‘${suggestion}’? ‘${match[2]}’ is a form of the verb ‘${match[4]}’.`;
      }
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" és correcte en altres sentits\.$/u);
      if (match) {
        const suggestion = suggestions[0] || "";
        return language === "es"
          ? `¿Quería decir «${suggestion}»? «${match[2]}» es correcto con otros sentidos.`
          : `Did you mean ‘${suggestion}’? ‘${match[2]}’ is correct with other meanings.`;
      }
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" és un terme d'heràldica\.$/u);
      if (match) {
        const suggestion = suggestions[0] || "";
        return language === "es"
          ? `¿Quería decir «${suggestion}»? «${match[2]}» es un término de heráldica.`
          : `Did you mean ‘${suggestion}’? ‘${match[2]}’ is a heraldic term.`;
      }
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" és un terme de (.+)\.$/u);
      if (match) {
        const suggestion = suggestions[0] || "";
        const fields = {
          botànica: ["botánica", "botany"], zoologia: ["zoología", "zoology"], química: ["química", "chemistry"],
          medicina: ["medicina", "medicine"], mèdic: ["medicina", "medicine"], geologia: ["geomorfología", "geomorphology"],
          música: ["música", "music"], nàutica: ["náutica", "nautical terminology"], astronomia: ["astronomía", "astronomy"],
          filosofia: ["filosofía", "philosophy"], dret: ["derecho", "law"], agricultura: ["agricultura", "agriculture"],
          zoològic: ["zoología", "zoology"], botànic: ["botánica", "botany"]
        };
        const field = fields[match[3].toLocaleLowerCase("ca")] || [match[3], match[3]];
        return language === "es"
          ? `¿Quería decir «${suggestion}»? «${match[2]}» es un término de ${field[0]}.`
          : `Did you mean ‘${suggestion}’? ‘${match[2]}’ is a ${field[1]} term.`;
      }
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" és una paraula (?:molt )?poc usual\.$/u);
      if (match) {
        const suggestion = suggestions[0] || "";
        return language === "es"
          ? `¿Quería decir «${suggestion}»? «${match[2]}» es una palabra poco habitual.`
          : `Did you mean ‘${suggestion}’? ‘${match[2]}’ is an uncommon word.`;
      }
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" és correcte si és un nom en castellà\.$/u);
      if (match) {
        const suggestion = suggestions[0] || "";
        return language === "es"
          ? `¿Quería decir «${suggestion}»? «${match[2]}» es correcto si es un nombre en español.`
          : `Did you mean ‘${suggestion}’? ‘${match[2]}’ is correct if it is a Spanish name.`;
      }
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" és (?:un )?nom d'un ocell\.$/u);
      if (match) {
        const suggestion = suggestions[0] || "";
        return language === "es"
          ? `¿Quería decir «${suggestion}»? «${match[2]}» es el nombre de un pájaro.`
          : `Did you mean ‘${suggestion}’? ‘${match[2]}’ is the name of a bird.`;
      }
      match = canonical.match(/^L'expressió adequada és "([^"]+)"\.$/u);
      if (match) return language === "es" ? `La expresión adecuada es «${match[1]}».` : `The appropriate expression is ‘${match[1]}’.`;
      match = canonical.match(/^Expressió inadequada\. "([^"]+)" és un adjectiu comparatiu "([^"]+)"\.$/u);
      if (match) return language === "es" ? `Expresión inadecuada. «${match[1]}» es el comparativo del adjetivo «${match[2]}».` : `Inappropriate expression. ‘${match[1]}’ is the comparative form of the adjective ‘${match[2]}’.`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" pot ser una forma del verb "([^"]+)"\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» puede ser una forma del verbo «${match[3]}».` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ may be a form of the verb ‘${match[3]}’.`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" és sinònim de "([^"]+)" \(col·loquial\)\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» es un sinónimo coloquial de «${match[3]}».` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ is a colloquial synonym of ‘${match[3]}’.`;
      match = canonical.match(/^Incorrecte en el sentit de (__SUGGESTION_1__)\. Correcte en el sentit de "([^"]+)"\.$/u);
      if (match) return language === "es" ? `Es incorrecto con el sentido de «${suggestions[0] || ""}», pero correcto con el sentido de «${match[1]}».` : `It is incorrect in the sense of ‘${suggestions[0] || ""}’, but correct in the sense of ‘${match[1]}’.`;
      match = canonical.match(/^Si és una forma del verb "([^"]+)", s'escriu sense accent\.$/u);
      if (match) return language === "es" ? `Si es una forma del verbo «${match[1]}», se escribe sin tilde.` : `If this is a form of the verb ‘${match[1]}’, it is written without an accent.`;
      match = canonical.match(/^Useu "([^"]+)" en l'estructura "([^"]+)"\.$/u);
      if (match) return language === "es" ? `Use «${match[1]}» en la estructura «${match[2]}».` : `Use ‘${match[1]}’ in the ‘${match[2]}’ construction.`;
      match = canonical.match(/^Hi falta el pronom feble "([^"]+)"\.$/u);
      if (match) return language === "es" ? `Falta el pronombre átono «${match[1]}».` : `The weak pronoun ‘${match[1]}’ is missing.`;
      match = canonical.match(/^Expressió incorrecta amb el sentit de "([^"]+)"\.$/u);
      if (match) return language === "es" ? `Expresión incorrecta con el sentido de «${match[1]}».` : `Incorrect expression in the sense of ‘${match[1]}’.`;
      match = canonical.match(/^Val més fer servir l'expressió "([^"]+)"\.$/u);
      if (match) return language === "es" ? `Es preferible usar la expresión «${match[1]}».` : `It is preferable to use the expression ‘${match[1]}’.`;
      match = canonical.match(/^En el sentit de "([^"]+)" cal dir (__SUGGESTION_1__)\.$/u);
      if (match) return language === "es" ? `Con el sentido de «${match[1]}», debe decirse «${suggestions[0] || ""}».` : `To mean ‘${match[1]}’, use ‘${suggestions[0] || ""}’.`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" té el mateix significat, però és un arcaisme\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» tiene el mismo significado, pero es arcaico.` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ has the same meaning, but is archaic.`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" és correcte en altres sentits poc habituals\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» es correcto con otros sentidos poco habituales.` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ is correct with other uncommon meanings.`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" és un sinònim antic de "([^"]+)"\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» es un sinónimo antiguo de «${match[3]}».` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ is an archaic synonym of ‘${match[3]}’.`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" \(paraula aguda\) és un sinònim de ['"]([^'"]+)['"]\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» (palabra aguda) es sinónimo de «${match[3]}».` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ (a word stressed on the final syllable) is a synonym of ‘${match[3]}’.`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" té un sentit més restringit\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» tiene un sentido más restringido.` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ has a narrower meaning.`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" pot ser una forma valenciana del v\. ['"]([^'"]+)['"]\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» puede ser una forma valenciana del verbo «${match[3]}».` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ may be a Valencian form of the verb ‘${match[3]}’.`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" \(infreqüent\) és el plural de "([^"]+)" \(([^)]+)\)\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» (poco frecuente) es el plural de «${match[3]}» (${match[4]}).` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ (uncommon) is the plural of ‘${match[3]}’ (${match[4]}).`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" és correcte en el sentit de ['"]([^'"]+)['"]\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» es correcto con el sentido de «${match[3]}».` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ is correct in the sense of ‘${match[3]}’.`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" és (?:el )?participi del v\. ['"]([^'"]+)['"]\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» es el participio del verbo «${match[3]}».` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ is the past participle of ‘${match[3]}’.`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" és un verb d'ús poc freqüent amb altres significats\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» es un verbo poco frecuente con otros significados.` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ is an uncommon verb with other meanings.`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" és una forma valenciana del v\. ['"]([^'"]+)['"]\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» es una forma valenciana del verbo «${match[3]}».` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ is a Valencian form of ‘${match[3]}’.`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" és un adjectiu, femení de "([^"]+)"\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» es un adjetivo, femenino de «${match[3]}».` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ is an adjective, the feminine form of ‘${match[3]}’.`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" significa "([^"]+)"\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» significa «${match[3]}».` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ means ‘${match[3]}’.`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" (?:ve de|deriva de) ([^()]+) \(terme ([^)]+)\)\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» deriva de «${match[3].trim()}» (término de ${match[4]}).` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ derives from ‘${match[3].trim()}’ (a ${match[4]} term).`;
      match = canonical.match(/^¿Volíeu dir (__SUGGESTION_1__)\? "([^"]+)" és una paraula poc freqüent \(del v\. ['"]([^'"]+)['"] o sinònim de ['"]([^'"]+)['"]\)\.$/u);
      if (match) return language === "es" ? `¿Quería decir «${suggestions[0] || ""}»? «${match[2]}» es una palabra poco frecuente (forma del verbo «${match[3]}» o sinónimo de «${match[4]}»).` : `Did you mean ‘${suggestions[0] || ""}’? ‘${match[2]}’ is an uncommon word (a form of ‘${match[3]}’ or a synonym of ‘${match[4]}’).`;
    }
    if (!template) {
      const catalan = canonical.toLocaleLowerCase("ca");
      let family = "grammar";
      if (/coma|comes|puntuaci|interrogaci|exclamaci|punt final|dos punts|parèntesi|guionet/u.test(catalan)) family = "punctuation";
      else if (/accent|dièresi|diacrític|majúscul|minúscul|apòstrof/u.test(catalan)) family = "orthography";
      else if (/concordan|gènere|nombre|singular|plural|femen|mascul/u.test(catalan)) family = "agreement";
      else if (/preposici|pronom|verb|participi|gerundi|conjunci|subjuntiu|infinitiu/u.test(catalan)) family = "syntax";
      else if (/calc|anglic|castellan|gal·lic|llatinisme|estranger/u.test(catalan)) family = "calque";
      else if (/col·loquial|informal|registre|formal|arca|obsolet|vulgar/u.test(catalan)) family = "register";
      else if (/expressi|locuci|frase|construcci|forma|paraula|mot|terme|sinònim/u.test(catalan)) family = "wording";
      const familyText = {
        es: {
          punctuation: "Revisa la puntuación de esta expresión.",
          orthography: "Revisa la ortografía de esta forma.",
          agreement: "Revisa la concordancia gramatical.",
          syntax: "Revisa la construcción sintáctica.",
          calque: "Revisa esta expresión: podría ser un calco de otra lengua.",
          register: "Revisa si esta forma es adecuada para el registro del texto.",
          wording: "Revisa la elección de palabras o esta expresión.",
          grammar: "Revisa esta expresión: podría contener un problema gramatical."
        },
        en: {
          punctuation: "Review the punctuation in this expression.",
          orthography: "Review the spelling of this form.",
          agreement: "Review the grammatical agreement.",
          syntax: "Review the sentence structure.",
          calque: "Review this expression; it may be a calque from another language.",
          register: "Check whether this form suits the register of the text.",
          wording: "Review the word choice or expression.",
          grammar: "Review this expression; it may contain a grammatical issue."
        }
      };
      const suggestionText = suggestions.length
        ? (language === "es" ? " Sugerencia: " : " Suggestion: ") + suggestions.map((value) => `«${value}»`).join(language === "es" ? " o " : " or ") + "."
        : "";
      return familyText[language][family] + suggestionText;
    }
    return template.replace(/\{suggestion(\d+)\}/gu, (_match, index) => suggestions[Number(index) - 1] || "");
  }

  globalThis.__sharedExplanationTranslations = sharedExplanationTranslations;
  function profileFlagMarkup(profile, assetRoot = "icons/flags/") {
    if (profile === "ca-ES-valencia" || profile === "ca-ES-balear") {
      const file = profile === "ca-ES-valencia" ? "valencia.png" : "balearic.png";
      return `<img src="${assetRoot}${file}" alt="" aria-hidden="true">`;
    }
    const country = profile === "gl-ES" ? "gl" : profile === "eu-ES" ? "eu" : profile === "es-ES" ? "es" : profile === "en-US" ? "us" : "ca";
    const drawings = {
      gl: '<rect width="24" height="24" fill="#fff"/><path d="M0 0 24 24" stroke="#66a8dc" stroke-width="6"/>',
      eu: '<rect width="24" height="24" fill="#d52b32"/><path d="m0 0 24 24M24 0 0 24" stroke="#218448" stroke-width="5"/><path d="M12 0v24M0 12h24" stroke="#fff" stroke-width="3"/>',
      ca: '<rect width="24" height="24" fill="#f5c842"/><path d="M0 3h24M0 9h24M0 15h24M0 21h24" stroke="#c62828" stroke-width="2"/>',
      es: '<rect width="24" height="24" fill="#aa151b"/><rect y="6" width="24" height="12" fill="#f1bf00"/>',
      us: '<rect width="24" height="24" fill="#fff"/><path d="M0 2h24M0 6h24M0 10h24M0 14h24M0 18h24M0 22h24" stroke="#b22234" stroke-width="2"/><path d="M0 0h11v12H0z" fill="#3c3b6e"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${drawings[country]}</svg>`;
  }
  const unsupportedHosts = Object.freeze([
    "clickfunnels.com", "getchirrapp.com", "anschreiben.com", "addons.mozilla.org",
    "chrome.google.com", "chromewebstore.google.com", "microsoftedge.microsoft.com",
    "gingersoftware.com", "iblogbox.com", "prowritingaid.com", "grammar.com", "rechtschreibpruefung24.de",
    "prezi.com", "my.smashdocs.net", "writer.zoho.com", "writer.zoho.eu", "kialo.com", "kialo-edu.com",
    "kialo-pro.com", "clubdesk.com", "clubdesk.de"
  ]);
  globalThis.CorrectorLocalSiteSupport = Object.freeze({
    unsupportedHosts,
    getUnsupportedMessageKey(host, href = "") {
      const normalizedHost = String(host || "").toLowerCase().replace(/^www\./, "");
      const normalizedHref = String(href || "").toLowerCase();
      if (["chrome.google.com", "chromewebstore.google.com", "microsoftedge.microsoft.com", "addons.mozilla.org"].includes(normalizedHost)) return "unsupportedExtensionStore";
      if (/docs\.google\.com\/spreadsheets/i.test(normalizedHref)) return "unsupportedSiteMessage";
      return unsupportedHosts.includes(normalizedHost) ? "unsupportedSiteMessage" : "";
    }
  });
  // Shared by the popup and in-page failure action so a future issue URL is
  // configured once and appears in both places automatically.
  globalThis.CorrectorLocalLinks = Object.freeze({
    reportIssueUrl: "https://github.com/arturguasch/Lletrium-Corrector-Ortografic-i-Gramatical/issues",
    privacyPolicyUrl: "https://arturguasch.github.io/Lletrium-Corrector-Ortografic-i-Gramatical/index.html#privacy"
  });
  globalThis.CorrectorLocalUiLocales = Object.freeze({ ca, es, en, translateIssueMessage, profileFlagMarkup });
})();

