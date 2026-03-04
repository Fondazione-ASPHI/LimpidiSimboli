/* js/i18n.js – Translations & internationalisation for Limpidi Simboli */

// Messaggi di status localizzati (chiavi usate con setStatusKey)
const statusMessages = {
  translate_ita_en_failed: {
    it: 'Attenzione: la traduzione ITA→ENG per "{term}" non è riuscita o non è cambiata.',
    en: 'Warning: ITA→ENG translation for "{term}" failed or did not change.',
    es: 'Atención: la traducción ITA→ENG para "{term}" falló o no cambió.'
  },
  opensymbols_token_missing: {
    it: 'Token OpenSymbols mancante o non valido. Controlla e salva il token in alto.',
    en: 'OpenSymbols token missing or invalid. Check and save the token above.',
    es: 'Token de OpenSymbols ausente o no válido. Comprueba y guarda el token arriba.'
  },
  opensymbols_network_error: {
    it: 'Errore di rete o autenticazione OpenSymbols. Controlla la connessione o il token.',
    en: 'Network or authentication error with OpenSymbols. Check connection or token.',
    es: 'Error de red o autenticación en OpenSymbols. Comprueba la conexión o el token.'
  },
  opensymbols_invalid_response: {
    it: 'Risposta non valida da OpenSymbols.',
    en: 'Invalid response from OpenSymbols.',
    es: 'Respuesta no válida de OpenSymbols.'
  },
  opensymbols_none_found: {
    it: 'Nessun simbolo trovato su OpenSymbols per "{term}".',
    en: 'No symbols found on OpenSymbols for "{term}".',
    es: 'No se encontraron símbolos en OpenSymbols para "{term}".'
  },
  opensymbols_only_arasaac: {
    it: 'OpenSymbols ha trovato solo simboli ARASAAC (già inclusi nella ricerca principale).',
    en: 'OpenSymbols found only ARASAAC symbols (already included in the main search).',
    es: 'OpenSymbols encontró solo símbolos ARASAAC (ya incluidos en la búsqueda principal).'
  },
  opensymbols_found_count: {
    it: 'Trovati simboli OpenSymbols (TAWASOL, Bliss, ecc.): {n}',
    en: 'Found OpenSymbols pictograms (TAWASOL, Bliss, etc.): {n}',
    es: 'Símbolos encontrados en OpenSymbols (TAWASOL, Bliss, etc.): {n}'
  },
  opensymbols_saved: {
    it: 'Token OpenSymbols salvato.',
    en: 'OpenSymbols token saved.',
    es: 'Token de OpenSymbols guardado.'
  },
  local_folder_connected: {
    it: 'Cartella "{dir}" connessa: {files} immagini per {words} parole.',
    en: 'Folder "{dir}" connected: {files} images for {words} words.',
    es: 'Carpeta "{dir}" conectada: {files} imágenes para {words} palabras.'
  },
  openai_saved: {
    it: 'Chiave API salvata.',
    en: 'API key saved.',
    es: 'Clave API guardada.'
  },
  google_saved: {
    it: 'Credenziali Google salvate. Limite: 100 ricerche/giorno.',
    en: 'Google credentials saved. Limit: 100 searches/day.',
    es: 'Credenciales de Google guardadas. Límite: 100 búsquedas/día.'
  },
  customsymbols_deleted_for_word: {
    it: '✅ Simboli per "{word}" cancellati',
    en: '✅ Symbols for "{word}" deleted',
    es: '✅ Símbolos para "{word}" eliminados'
  },
  customsymbol_deleted: {
    it: '✅ Simbolo cancellato',
    en: '✅ Symbol deleted',
    es: '✅ Símbolo eliminado'
  },
  customsymbols_all_deleted: {
    it: '✅ Tutti i simboli personalizzati sono stati cancellati',
    en: '✅ All custom symbols have been deleted',
    es: '✅ Todos los símbolos personalizados han sido eliminados'
  },
  export_completed: {
    it: '✅ Esportazione completata',
    en: '✅ Export completed',
    es: '✅ Exportación completada'
  },
  list_refreshed: {
    it: '🔄 Lista aggiornata',
    en: '🔄 List refreshed',
    es: '🔄 Lista actualizada'
  },
  clean: {
    it: 'Pulito.',
    en: 'Clean.',
    es: 'Limpiado.'
  },
  symbol_removed_next: {
    it: 'Simbolo rimosso per "{word}". Mostro il prossimo simbolo disponibile.',
    en: 'Symbol removed for "{word}". Showing next available symbol.',
    es: 'Símbolo eliminado para "{word}". Mostrando el siguiente símbolo disponible.'
  },
  symbol_removed_none: {
    it: 'Simbolo rimosso per "{word}". Nessun simbolo rimanente.',
    en: 'Symbol removed for "{word}". No symbols remaining.',
    es: 'Símbolo eliminado para "{word}". No quedan símbolos.'
  },
  // Messaggi aggiuntivi (localizzati)
  search_found_for_term: {
    it: 'Trovati {n} simboli per "{term}"',
    en: 'Found {n} symbols for "{term}"',
    es: 'Encontrados {n} símbolos para "{term}"'
  },
  symbol_selected_saved: {
    it: 'Simbolo selezionato e salvato per "{word}"',
    en: 'Symbol selected and saved for "{word}"',
    es: 'Símbolo seleccionado y guardado para "{word}"'
  },
  enter_phrase_prompt: {
    it: 'Inserisci una frase.',
    en: 'Please enter a sentence.',
    es: 'Introduce una frase.'
  },
  search_in_progress: {
    it: 'Ricerca in corso…',
    en: 'Search in progress…',
    es: 'Búsqueda en curso…'
  },
  search_counts: {
    it: 'ARASAAC: {arasaac} | OpenSymbols: {opensymbols}',
    en: 'ARASAAC: {arasaac} | OpenSymbols: {opensymbols}',
    es: 'ARASAAC: {arasaac} | OpenSymbols: {opensymbols}'
  },
  search_complete: {
    it: 'Completato. Trovati {found}, mancanti {missing}.',
    en: 'Completed. Found {found}, missing {missing}.',
    es: 'Completado. Encontrados {found}, faltantes {missing}.'
  },
  search_complete_skipstop: {
    it: 'Completato. Trovati {found}, mancanti {missing} (parole funzionali escluse).',
    en: 'Completed. Found {found}, missing {missing} (stop-words excluded).',
    es: 'Completado. Encontrados {found}, faltantes {missing} (palabras vacías excluidas).'
  },
  nothing_to_read: {
    it: 'Nulla da leggere.',
    en: 'Nothing to read.',
    es: 'Nada que leer.'
  },
  speech_started: {
    it: 'Riproduzione avviata…',
    en: 'Playback started…',
    es: 'Reproducción iniciada…'
  },
  speech_ended: {
    it: 'Riproduzione terminata.',
    en: 'Playback finished.',
    es: 'Reproducción finalizada.'
  },
  speech_error: {
    it: 'Errore nella sintesi vocale.',
    en: 'Speech synthesis error.',
    es: 'Error en la síntesis de voz.'
  },
  grammar_badges_saved: {
    it: '✅ Preferenza badge grammaticali salvata',
    en: '✅ Grammar badges preference saved',
    es: '✅ Preferencia de insignias gramaticales guardada'
  },
  merged_symbol_found: {
    it: 'Simbolo trovato per: "{phrase}"',
    en: 'Symbol found for: "{phrase}"',
    es: 'Símbolo encontrado para: "{phrase}"'
  },
  merged_symbol_not_found: {
    it: 'Nessun simbolo trovato per: "{phrase}". Usa W per cercare su Wikipedia o ✨ per generare con AI.',
    en: 'No symbol found for: "{phrase}". Use W to search Wikipedia or ✨ to generate with AI.',
    es: 'No se encontró símbolo para: "{phrase}". Usa W para buscar en Wikipedia o ✨ para generar con IA.'
  },
  merged_search_error: {
    it: 'Errore nella ricerca per: "{phrase}"',
    en: 'Error searching for: "{phrase}"',
    es: 'Error al buscar: "{phrase}"'
  },
  remind_select_folder: {
    it: '💡 Ricorda: clicca su "📁 Seleziona Cartella Immagini" per salvare immagini personalizzate (AI, web, ecc.)',
    en: '💡 Tip: click "📁 Select Image Folder" to save custom images (AI, web, etc.)',
    es: '💡 Consejo: haz clic en "📁 Seleccionar Carpeta de Imágenes" para guardar imágenes personalizadas (IA, web, etc.)'
  },
  js_error: {
    it: 'Errore JS: {msg}',
    en: 'JS error: {msg}',
    es: 'Error JS: {msg}'
  },
  unhandled_rejection: {
    it: 'Errore: {msg}',
    en: 'Error: {msg}',
    es: 'Error: {msg}'
  }
};

function formatStatusText(key, params, lang){
  let tmpl = (statusMessages[key] && statusMessages[key][lang]) || (statusMessages[key] && statusMessages[key]['it']) || key;
  if(!params) return tmpl;
  Object.keys(params).forEach(k=>{
    tmpl = tmpl.replace(new RegExp('\{'+k+'\}','g'), params[k]);
  });
  return tmpl;
}

// Build the legend programmatically from translation keys to keep semantics in one place.
function renderLegend() {
  const legend = document.getElementById('symbolsLegend');
  if (!legend) return;
  // Items: [titleKey, descKey, minWidth]
  const items = [
    ['legend_add_title','legend_add_desc','160px'],
    ['legend_search_title','legend_search_desc','220px'],
    ['legend_w_title','legend_w_desc','180px'],
    ['legend_g_title','legend_g_desc','180px'],
    ['legend_abc_title','legend_abc_desc','160px'],
    ['legend_ctrl_title','legend_ctrl_desc','180px'],
    ['legend_click_title','legend_click_desc','200px']
  ];

  // Create outer container (matches visual styling used previously)
  const outer = document.createElement('div');
  outer.style.display = 'inline-flex';
  outer.style.gap = '14px';
  outer.style.alignItems = 'flex-start';
  outer.style.padding = '8px 12px';
  outer.style.border = '1px solid #e5e7eb';
  outer.style.background = '#ffffff';
  outer.style.borderRadius = '10px';
  outer.style.fontSize = '0.95rem';
  outer.style.color = '#374151';
  outer.style.flexWrap = 'wrap';

  items.forEach(([titleKey, descKey, minW]) => {
    const item = document.createElement('div');
    item.setAttribute('role', 'listitem');
    item.style.display = 'flex';
    item.style.flexDirection = 'column';
    item.style.minWidth = minW;

    const line = document.createElement('span');
    const strong = document.createElement('strong');
    strong.textContent = translateUI(titleKey);
    // Make the '+' icon visually stronger so it resembles the command icon
    try {
      if (titleKey === 'legend_add_title') {
        strong.style.fontWeight = '800';
        strong.style.fontSize = '1.05rem';
        strong.style.lineHeight = '1';
        strong.style.display = 'inline-block';
        strong.style.minWidth = '18px';
        strong.style.textAlign = 'center';
      }
    } catch (e) { /* non critico */ }
    line.appendChild(strong);
    line.appendChild(document.createTextNode(' '));

    const desc = document.createElement('span');
    desc.style.fontSize = '0.85rem';
    desc.style.color = '#475569';
    // prefix with a short separator as in previous design
    desc.textContent = ' - ' + translateUI(descKey);
    line.appendChild(desc);

    item.appendChild(line);
    outer.appendChild(item);
  });

  // Replace content
  legend.innerHTML = '';
  legend.appendChild(outer);
  try { legend.setAttribute('aria-label', translateUI('legend_aria_label')); } catch (e) {}
}

// Nuova funzione: usare chiavi per i messaggi di status in modo che siano localizzati
function setStatusKey(key, params = null, isError = false){
  const lang = (document.getElementById('lang') || { value: 'it' }).value || localStorage.getItem('appLang') || 'it';
  const text = formatStatusText(key, params, lang);
  if(els && els.live) {
    els.live.textContent = text;
    if(isError) els.live.classList.add('error'); else els.live.classList.remove('error');
  }
}

// Manteniamo compatibilità: setStatus(msg, isError) — se chiamato con stringa esistente
function setStatus(msg, isError = false){
  if(typeof msg === 'string' && msg.startsWith('key:')){
    const key = msg.slice(4);
    setStatusKey(key, null, isError);
    return;
  }
  if(els && els.live){
    els.live.textContent = msg;
    if(isError) els.live.classList.add('error'); else els.live.classList.remove('error');
  }
}

// --- Localizzazione (i18n) ---
const translations = {
  it: {
    title: 'Limpidi Simboli - ASPHI Onlus',
    appName: 'Limpidi Simboli',
    subtitle: "Inserisci una frase. L'app cerca o crea un simbolo per ogni parola significativa.",
    textareaPlaceholder: 'Inserisci qui la frase...',
    translateButton: '🔄 Converti in simboli',
    clearButton: '🗑️ Pulisci',
    speakButton: '🔊 Ascolta',
    settingsButton: '⚙️ Impostazioni',
    selectLocalFolderButton: '📁 Seleziona Cartella Immagini',
    disconnectLocalFolderButton: '🚫 Disconnetti cartella',
    disconnectLocalFolderTitle: 'Rimuovi riferimento alla cartella salvata',
    asphiLogoTitle: 'ASPHI Onlus',
    lang_it: 'Italiano',
    lang_es: 'Español',
    lang_en: 'Inglese',
    addSymbolButtonTitle: 'Aggiungi simbolo personale',
    removeSymbolButtonTitle: 'Rimuovi questo simbolo personalizzato',
    abcShowText: 'Mostra solo testo',
    abcShowSymbol: 'Mostra simbolo',
    wikiSearchButtonTitle: 'Cerca immagini su Wikipedia',
    googleSearchButtonTitle: 'Cerca immagini su Google (100/giorno)',
    altSearchButtonTitle: 'Cerca simbolo con termine alternativo',
    gptButtonTitle: 'Genera simbolo con IA',
    fileNotFoundTitle: 'File non trovato - riconnetti la cartella',
    guidaRapidaButton: '📖 Guida Rapida',
    guidaAvanzataButton: '🎓 Guida Avanzata',
    videoTutorialButton: '🎥 Video Tutorial',
    mergeButton: '🔗 Unisci',
    settingsModalTitle: '⚙️ Impostazioni',
    skipStopLabel: 'Ignora parole funzionali',
    skipStopTitle: 'Se attivo, ignora articoli, preposizioni e congiunzioni comuni.',
    exercises_play_slow: '🐢 Karaoke (lento)',
    exercises_report_title: 'Report esercizi',
    exercises_report_correct: 'Corrette',
    exercises_report_incorrect: 'Sbagliate',
    exercises_report_skipped: 'Saltate',
    exercises_button_skip: 'Avanti/Salta',
    toggleTileActionsButton: '🔧 Personalizza simboli',
    uploadDocButton: '📄 Carica documento',
    printPdfButton: '🖨️ Stampa PDF',
    saveProjectButton: '💾 Salva progetto',
    loadProjectButton: '📂 Carica progetto',
    exModalUploadPdf: '📄 Carica PDF frasi',
    doc_upload_processing: 'Elaborazione documento in corso...',
    doc_upload_success: 'Documento caricato: {count} frasi trovate',
    doc_upload_error: 'Errore nel caricamento del documento',
    pdf_print_generating: 'Generazione PDF in corso...',
    pdf_print_success: 'PDF generato con successo',
    pdf_print_no_tiles: 'Nessun simbolo da stampare. Traduci prima una frase.'
  },
  en: {
    title: 'Clear Symbols - ASPHI Onlus',
    appName: 'Clear Symbols',
    subtitle: 'Enter a sentence. The app searches or creates a symbol for each meaningful word.',
    textareaPlaceholder: 'Type the sentence here...',
    translateButton: '🔄 Convert to symbols',
    clearButton: '🗑️ Clear',
    speakButton: '🔊 Listen',
    settingsButton: '⚙️ Settings',
    selectLocalFolderButton: '📁 Select Image Folder',
    disconnectLocalFolderButton: '🚫 Disconnect folder',
    disconnectLocalFolderTitle: 'Remove saved folder reference',
    asphiLogoTitle: 'ASPHI Onlus',
    lang_it: 'Italian',
    lang_es: 'Spanish',
    lang_en: 'English',
    addSymbolButtonTitle: 'Add personal symbol',
    removeSymbolButtonTitle: 'Remove this custom symbol',
    abcShowText: 'Show text only',
    abcShowSymbol: 'Show symbol',
    wikiSearchButtonTitle: 'Search images on Wikipedia',
    googleSearchButtonTitle: 'Search images on Google (100/day)',
    altSearchButtonTitle: 'Search symbol with alternate term',
    gptButtonTitle: 'Generate symbol with AI',
    fileNotFoundTitle: 'File not found - reconnect the folder',
    guidaRapidaButton: '📖 Quick Guide',
    guidaAvanzataButton: '🎓 Advanced Guide',
    videoTutorialButton: '🎥 Video Tutorial',
    mergeButton: '🔗 Merge',
    settingsModalTitle: '⚙️ Settings',
    skipStopLabel: 'Ignore stop-words',
    skipStopTitle: 'When enabled, ignore articles, prepositions and common conjunctions.',
    exercises_play_slow: '🐢 Karaoke (slow)',
    exercises_report_title: 'Exercises report',
    exercises_report_correct: 'Correct',
    exercises_report_incorrect: 'Incorrect',
    exercises_report_skipped: 'Skipped',
    exercises_button_skip: 'Next / Skip',
    toggleTileActionsButton: '🔧 Customize symbols',
    uploadDocButton: '📄 Upload document',
    printPdfButton: '🖨️ Print PDF',
    saveProjectButton: '💾 Save project',
    loadProjectButton: '📂 Load project',
    exModalUploadPdf: '📄 Upload PDF sentences',
    doc_upload_processing: 'Processing document...',
    doc_upload_success: 'Document loaded: {count} sentences found',
    doc_upload_error: 'Error loading document',
    pdf_print_generating: 'Generating PDF...',
    pdf_print_success: 'PDF generated successfully',
    pdf_print_no_tiles: 'No symbols to print. Translate a sentence first.'
  },
  es: {
    title: 'Símbolos Claros - ASPHI Onlus',
    appName: 'Símbolos Claros',
    subtitle: 'Escribe una frase. La aplicación busca o crea un símbolo para cada palabra significativa.',
    textareaPlaceholder: 'Escribe la frase aquí...',
    translateButton: '🔄 Convertir en símbolos',
    clearButton: '🗑️ Limpiar',
    speakButton: '🔊 Escuchar',
    settingsButton: '⚙️ Ajustes',
    selectLocalFolderButton: '📁 Seleccionar Carpeta de Imágenes',
    disconnectLocalFolderButton: '🚫 Desconectar carpeta',
    disconnectLocalFolderTitle: 'Eliminar referencia a la carpeta guardada',
    asphiLogoTitle: 'ASPHI Onlus',
    lang_it: 'Italiano',
    lang_es: 'Español',
    lang_en: 'Inglés',
    addSymbolButtonTitle: 'Agregar símbolo personal',
    removeSymbolButtonTitle: 'Eliminar este símbolo personalizado',
    abcShowText: 'Mostrar solo texto',
    abcShowSymbol: 'Mostrar símbolo',
    wikiSearchButtonTitle: 'Buscar imágenes en Wikipedia',
    googleSearchButtonTitle: 'Buscar imágenes en Google (100/día)',
    altSearchButtonTitle: 'Buscar símbolo con término alternativo',
    gptButtonTitle: 'Generar símbolo con IA',
    fileNotFoundTitle: 'Archivo no encontrado - reconecta la carpeta',
    guidaRapidaButton: '📖 Guía Rápida',
    guidaAvanzataButton: '🎓 Guía Avanzada',
    videoTutorialButton: '🎥 Tutorial en Video',
    mergeButton: '🔗 Unir',
    settingsModalTitle: '⚙️ Ajustes',
    skipStopLabel: 'Ignorar palabras funcionales',
    skipStopTitle: 'Si está activado, ignora artículos, preposiciones y conjunciones comunes.',
    exercises_play_slow: '🐢 Karaoke (lento)',
    exercises_report_title: 'Informe de ejercicios',
    exercises_report_correct: 'Correctas',
    exercises_report_incorrect: 'Incorrectas',
    exercises_report_skipped: 'Saltadas',
    exercises_button_skip: 'Siguiente / Saltar',
    toggleTileActionsButton: '🔧 Personalizar símbolos',
    uploadDocButton: '📄 Cargar documento',
    printPdfButton: '🖨️ Imprimir PDF',
    saveProjectButton: '💾 Guardar proyecto',
    loadProjectButton: '📂 Cargar proyecto',
    exModalUploadPdf: '📄 Cargar PDF frases',
    doc_upload_processing: 'Procesando documento...',
    doc_upload_success: 'Documento cargado: {count} frases encontradas',
    doc_upload_error: 'Error al cargar documento',
    pdf_print_generating: 'Generando PDF...',
    pdf_print_success: 'PDF generado correctamente',
    pdf_print_no_tiles: 'No hay símbolos para imprimir. Traduce una frase primero.'
  }
};

// --- Additional translation property assignments ---

// Aggiungi traduzioni specifiche per la ricerca Wikipedia (prompt e messaggi)
translations.it.wikiPromptEnterTerm = 'Cerca un\'immagine su Wikipedia per "{word}".\n\nInserisci il termine di ricerca (lascia vuoto per usare "{word}"): ';
translations.it.wikiNoImagesFoundAlert = 'Nessuna immagine trovata per: {word}\n\nProva a usare il bottone ✨ per generare un simbolo con AI, o il bottone + per caricare un\'immagine dal tuo computer.';
translations.en.wikiPromptEnterTerm = 'Search Wikipedia for an image for "{word}".\n\nEnter the search term (leave empty to use "{word}"): ';
translations.en.wikiNoImagesFoundAlert = 'No images found for: {word}\n\nTry the ✨ button to generate a symbol with AI, or the + button to upload an image from your computer.';
translations.es.wikiPromptEnterTerm = 'Busca en Wikipedia una imagen para "{word}".\n\nIntroduce el término de búsqueda (deja vacío para usar "{word}"): ';
translations.es.wikiNoImagesFoundAlert = 'No se encontraron imágenes para: {word}\n\nPrueba el botón ✨ para generar un símbolo con IA, o el botón + para subir una imagen desde tu ordenador.';

// Google / GPT / ARASAAC UI strings
translations.it.googlePromptEnterTerm = 'Cerca un\'immagine su Google per "{word}".\n\nInserisci il termine di ricerca (lascia vuoto per usare "{word}"): ';
translations.en.googlePromptEnterTerm = 'Search Google for an image for "{word}".\n\nEnter the search term (leave empty to use "{word}"): ';
translations.es.googlePromptEnterTerm = 'Busca en Google una imagen para "{word}".\n\nIntroduce el término de búsqueda (deja vacío para usar "{word}"): ';

translations.it.googleNoImagesFoundAlert = 'Nessuna immagine trovata per: {word}\n\nProva con Wikipedia (W) o genera con AI (✨).';
translations.en.googleNoImagesFoundAlert = 'No images found for: {word}\n\nTry Wikipedia (W) or generate with AI (✨).';
translations.es.googleNoImagesFoundAlert = 'No se encontraron imágenes para: {word}\n\nPrueba Wikipedia (W) o genera con IA (✨).';

translations.it.googleCredsMissingAlert = '⚠️ Credenziali Google mancanti!\n\nPer usare la ricerca Google:\n\n1. Vai su https://developers.google.com/custom-search/v1/overview\n2. Crea un progetto e ottieni API Key e Search Engine ID (cx)\n3. Inseriscili nelle Impostazioni (⚙️)\n\nLimite gratuito: 100 ricerche/giorno';
translations.en.googleCredsMissingAlert = '⚠️ Google credentials missing!\n\nTo use Google search:\n\n1. Visit https://developers.google.com/custom-search/v1/overview\n2. Create a project and get an API Key and Search Engine ID (cx)\n3. Enter them in Settings (⚙️)\n\nFree limit: 100 searches/day';
translations.es.googleCredsMissingAlert = '⚠️ Credenciales de Google ausentes!\n\nPara usar la búsqueda de Google:\n\n1. Visita https://developers.google.com/custom-search/v1/overview\n2. Crea un proyecto y obtén una API Key y Search Engine ID (cx)\n3. Introdúcelos en Ajustes (⚙️)\n\nLímite gratis: 100 búsquedas/día';

translations.it.googleDailyLimitError = 'Limite giornaliero raggiunto (100 ricerche/giorno). Riprova domani.';
translations.en.googleDailyLimitError = 'Daily limit reached (100 searches/day). Try again tomorrow.';
translations.es.googleDailyLimitError = 'Límite diario alcanzado (100 búsquedas/día). Intenta de nuevo mañana.';

translations.it.altSymbolPrompt = 'Cerca un simbolo alternativo per "{word}".\n\nInserisci il termine di ricerca (es: "cuore" per "amore"):';
translations.en.altSymbolPrompt = 'Search for an alternative symbol for "{word}".\n\nEnter the search term (e.g. "heart" for "love"): ';
translations.es.altSymbolPrompt = 'Busca un símbolo alternativo para "{word}".\n\nIntroduce el término de búsqueda (p.ej. "corazón" para "amor"): ';

translations.it.altSymbolNotFoundAlert = 'Nessun simbolo trovato per "{term}"';
translations.en.altSymbolNotFoundAlert = 'No symbol found for "{term}"';
translations.es.altSymbolNotFoundAlert = 'No se encontró símbolo para "{term}"';

translations.it.gptDescribePrompt = 'Descrivi il simbolo da generare in stile ARASAAC:';
translations.en.gptDescribePrompt = 'Describe the symbol to generate in ARASAAC style:';
translations.es.gptDescribePrompt = 'Describe el símbolo a generar en estilo ARASAAC:';

// Alert / prompt generici localizzati
translations.it.browserNoFolderSupport = 'Il tuo browser non supporta la selezione di cartelle.\n\nUsa Chrome, Edge o un browser moderno.';
translations.en.browserNoFolderSupport = 'Your browser does not support folder selection.\n\nUse Chrome, Edge or a modern browser.';
translations.es.browserNoFolderSupport = 'Tu navegador no admite la selección de carpetas.\n\nUsa Chrome, Edge o un navegador moderno.';

translations.it.localFolderSelectError = 'Errore nella selezione della cartella: {msg}';
translations.en.localFolderSelectError = 'Error selecting folder: {msg}';
translations.es.localFolderSelectError = 'Error al seleccionar la carpeta: {msg}';

translations.it.imageSaveError = 'Errore nel salvataggio dell\'immagine';
translations.en.imageSaveError = 'Error saving image';
translations.es.imageSaveError = 'Error al guardar la imagen';

translations.it.noSymbolsToRemove = 'Nessun simbolo da rimuovere.';
translations.en.noSymbolsToRemove = 'No symbols to remove.';
translations.es.noSymbolsToRemove = 'No hay símbolos para eliminar.';

translations.it.searchError = 'Errore nella ricerca: {msg}';
translations.en.searchError = 'Search error: {msg}';
translations.es.searchError = 'Error en la búsqueda: {msg}';

translations.it.gptImageError = 'Errore generazione immagini: {msg}';
translations.en.gptImageError = 'Image generation error: {msg}';
translations.es.gptImageError = 'Error al generar imágenes: {msg}';

translations.it.selectCropArea = 'Seleziona un\'area da ritagliare trascinando il mouse sull\'immagine';
translations.en.selectCropArea = 'Select an area to crop by dragging the mouse over the image';
translations.es.selectCropArea = 'Selecciona un área para recortar arrastrando el ratón sobre la imagen';

translations.it.cropAreaTooSmall = 'L\'area selezionata è troppo piccola';
translations.en.cropAreaTooSmall = 'The selected area is too small';
translations.es.cropAreaTooSmall = 'El área seleccionada es demasiado pequeña';

translations.it.genericSaveErrorWithMsg = 'Errore nel salvataggio: {msg}';
translations.en.genericSaveErrorWithMsg = 'Save error: {msg}';
translations.es.genericSaveErrorWithMsg = 'Error al guardar: {msg}';

translations.it.selectTwoSymbols = 'Seleziona almeno 2 simboli da unire!';
translations.en.selectTwoSymbols = 'Select at least 2 symbols to merge!';
translations.es.selectTwoSymbols = '¡Selecciona al menos 2 símbolos para unir!';

// UI strings added for dialog / crop / custom symbols
translations.it.useImageForWord = 'Vuoi usare questa immagine per "{word}"?';
translations.en.useImageForWord = 'Do you want to use this image for "{word}"?';
translations.es.useImageForWord = '¿Quieres usar esta imagen para "{word}"?';

translations.it.useImage = 'Usa questa immagine';
translations.en.useImage = 'Use this image';
translations.es.useImage = 'Usar esta imagen';

translations.it.cancel = 'Annulla';
translations.en.cancel = 'Cancel';
translations.es.cancel = 'Cancelar';

translations.it.cropShort = '✂️ Ritaglia';
translations.en.cropShort = '✂️ Crop';
translations.es.cropShort = '✂️ Recortar';

translations.it.cropAndSave = '✓ Ritaglia e Salva';
translations.en.cropAndSave = '✓ Crop and Save';
translations.es.cropAndSave = '✓ Recortar y Guardar';

translations.it.cropEditorTitle = '✂️ Ritaglia l\'immagine';
translations.en.cropEditorTitle = '✂️ Crop the image';
translations.es.cropEditorTitle = '✂️ Recorta la imagen';

translations.it.cropInstruction = 'Trascina per selezionare l\'area da mantenere';
translations.en.cropInstruction = 'Drag to select the area to keep';
translations.es.cropInstruction = 'Arrastra para seleccionar el área a conservar';

translations.it.saving = 'Salvataggio...';
translations.en.saving = 'Saving...';
translations.es.saving = 'Guardando...';

translations.it.croppingInProgress = 'Ritaglio in corso...';
translations.en.croppingInProgress = 'Cropping...';
translations.es.croppingInProgress = 'Recortando...';

translations.it.noCustomSymbolsSaved = 'Nessun simbolo personalizzato salvato.';
translations.en.noCustomSymbolsSaved = 'No custom symbols saved.';
translations.es.noCustomSymbolsSaved = 'No hay símbolos personalizados guardados.';

translations.it.selectFolderNotConnected = '⚠️ Cartella immagini non connessa. Clicca su "📁 Seleziona Cartella Immagini" per visualizzare i simboli salvati localmente.';
translations.en.selectFolderNotConnected = '⚠️ Image folder not connected. Click "📁 Select Image Folder" to view locally saved symbols.';
translations.es.selectFolderNotConnected = '⚠️ Carpeta de imágenes no conectada. Haz clic en "📁 Seleccionar Carpeta de Imágenes" para ver los símbolos guardados localmente.';

translations.it.confirmDeleteAll = '⚠️ ATTENZIONE!\n\nQuesta operazione cancellerà TUTTI i simboli personalizzati salvati.\n\nSei sicuro?';
translations.en.confirmDeleteAll = '⚠️ WARNING!\n\nThis operation will delete ALL saved custom symbols.\n\nAre you sure?';
translations.es.confirmDeleteAll = '⚠️ ¡ATENCIÓN!\n\nEsta operación eliminará TODOS los símbolos personalizados guardados.\n\n¿Estás seguro?';

translations.it.confirmDeleteAllForWord = 'Vuoi cancellare tutti i simboli personalizzati per "{word}"?';
translations.en.confirmDeleteAllForWord = 'Do you want to delete all custom symbols for "{word}"?';
translations.es.confirmDeleteAllForWord = '¿Quieres eliminar todos los símbolos personalizados para "{word}"?';

translations.it.deleteAllForWordBtn = '🗑️ Cancella tutti';
translations.en.deleteAllForWordBtn = '🗑️ Delete all';
translations.es.deleteAllForWordBtn = '🗑️ Eliminar todo';

translations.it.selectFolderReminder = '⚠️ Cartella immagini non selezionata!\n\nPer {actionName}, devi prima:\n\n1. Cliccare su "📁 Seleziona Cartella Immagini"\n2. Scegliere una cartella dove salvare le immagini\n\nVuoi selezionare la cartella ora?';
translations.en.selectFolderReminder = '⚠️ Image folder not selected!\n\nTo {actionName}, you must first:\n\n1. Click "📁 Select Image Folder"\n2. Choose a folder to save images\n\nDo you want to select the folder now?';
translations.es.selectFolderReminder = '⚠️ Carpeta de imágenes no seleccionada!\n\nPara {actionName}, primero debes:\n\n1. Hacer clic en "📁 Seleccionar Carpeta de Imágenes"\n2. Elegir una carpeta para guardar las imágenes\n\n¿Quieres seleccionar la carpeta ahora?';

translations.it.noPictogramFound = 'Nessun pittogramma trovato';
translations.en.noPictogramFound = 'No pictogram found';
translations.es.noPictogramFound = 'No se encontró pictograma';

translations.it.close = 'Chiudi';
translations.en.close = 'Close';
translations.es.close = 'Cerrar';

// Footer localized HTML (may contain links/HTML)
translations.it.footer_attribution = 'Pittogrammi ARASAAC – <em>Gobierno de Aragón</em>. Autore: Sergio Palao. Licenza <a href="https://beta.arasaac.org/terms-of-use" target="_blank" rel="noreferrer noopener">CC BY-NC-SA</a>. Documentazione API: <a href="https://arasaac.org/developers/api" target="_blank" rel="noreferrer noopener">Developers</a>.';
translations.it.footer_development = 'Sviluppo: <a href="https://www.asphi.it" target="_blank" rel="noreferrer noopener">Fondazione ASPHI Onlus</a>.';
translations.it.footer_license = 'Licenza: <a href="LICENSE.md" target="_blank" rel="noreferrer noopener">CC BY-NC-SA 4.0</a>';
translations.it.footer_github = 'Codice sorgente: <a href="https://github.com/Fondazione-ASPHI/LimpidiSimboli" target="_blank" rel="noreferrer noopener" title="LimpidiSimboli su GitHub">\n      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="vertical-align: middle; margin-right: 6px;">\n        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.54 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38C13.71 14.54 16 11.54 16 8c0-4.42-3.58-8-8-8z"/>\n      </svg>\n      LimpidiSimboli su GitHub</a>';

translations.en.footer_attribution = 'Pictograms ARASAAC – <em>Gobierno de Aragón</em>. Author: Sergio Palao. License <a href="https://beta.arasaac.org/terms-of-use" target="_blank" rel="noreferrer noopener">CC BY-NC-SA</a>. API documentation: <a href="https://arasaac.org/developers/api" target="_blank" rel="noreferrer noopener">Developers</a>.';
translations.en.footer_development = 'Development: <a href="https://www.asphi.it" target="_blank" rel="noreferrer noopener">Fondazione ASPHI Onlus</a>.';
translations.en.footer_license = 'License: <a href="LICENSE.md" target="_blank" rel="noreferrer noopener">CC BY-NC-SA 4.0</a>';
translations.en.footer_github = 'Source code: <a href="https://github.com/Fondazione-ASPHI/LimpidiSimboli" target="_blank" rel="noreferrer noopener" title="LimpidiSimboli on GitHub">\n      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="vertical-align: middle; margin-right: 6px;">\n        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.54 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38C13.71 14.54 16 11.54 16 8c0-4.42-3.58-8-8-8z"/>\n      </svg>\n      LimpidiSimboli on GitHub</a>';

translations.es.footer_attribution = 'Pictogramas ARASAAC – <em>Gobierno de Aragón</em>. Autor: Sergio Palao. Licencia <a href="https://beta.arasaac.org/terms-of-use" target="_blank" rel="noreferrer noopener">CC BY-NC-SA</a>. Documentación API: <a href="https://arasaac.org/developers/api" target="_blank" rel="noreferrer noopener">Developers</a>.';
translations.es.footer_development = 'Desarrollo: <a href="https://www.asphi.it" target="_blank" rel="noreferrer noopener">Fondazione ASPHI Onlus</a>.';
translations.es.footer_license = 'Licencia: <a href="LICENSE.md" target="_blank" rel="noreferrer noopener">CC BY-NC-SA 4.0</a>';
translations.es.footer_github = 'Código fuente: <a href="https://github.com/Fondazione-ASPHI/LimpidiSimboli" target="_blank" rel="noreferrer noopener" title="LimpidiSimboli en GitHub">\n      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="vertical-align: middle; margin-right: 6px;">\n        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.54 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38C13.71 14.54 16 11.54 16 8c0-4.42-3.58-8-8-8z"/>\n      </svg>\n      LimpidiSimboli en GitHub</a>';

// Legend HTML for per-symbol function buttons (localized) — expanded boxed legend with short descriptions
translations.it.legend_html = '<div style="display:inline-flex; gap:14px; align-items:flex-start; padding:8px 12px; border:1px solid #e5e7eb; background:#ffffff; border-radius:10px; font-size:0.95rem; color:#374151; flex-wrap:wrap;">' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:160px;">' +
    '<span><strong>+</strong> <span style="font-size:0.85rem; color:#475569;">- Aggiungi immagine personale</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:220px;">' +
    '<span><strong>🔎 Ricerca ARASAAC</strong> <span style="font-size:0.85rem; color:#475569;">- Cerca altri pittogrammi</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:180px;">' +
    '<span><strong>W</strong> <span style="font-size:0.85rem; color:#475569;">- Cerca immagini su Wikipedia</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:180px;">' +
    '<span><strong>G</strong> <span style="font-size:0.85rem; color:#475569;">- Cerca immagini su Google</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:160px;">' +
    '<span><strong>ABC</strong> <span style="font-size:0.85rem; color:#475569;">- Mostra/nascondi simbolo</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:180px;">' +
    '<span><strong>CTRL</strong> <span style="font-size:0.85rem; color:#475569;">- Seleziona 2 o più simboli</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:200px;">' +
    '<span><strong>Clic immagine</strong> <span style="font-size:0.85rem; color:#475569;">- Mostra alternative</span></span>' +
  '</div>' +
'</div>';

translations.en.legend_html = '<div style="display:inline-flex; gap:14px; align-items:flex-start; padding:8px 12px; border:1px solid #e5e7eb; background:#ffffff; border-radius:10px; font-size:0.95rem; color:#374151; flex-wrap:wrap;">' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:160px;">' +
    '<span><strong>+</strong> <span style="font-size:0.85rem; color:#475569;">- Add personal image</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:220px;">' +
    '<span><strong>🔎 Search ARASAAC</strong> <span style="font-size:0.85rem; color:#475569;">- Find alternative pictograms</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:180px;">' +
    '<span><strong>W</strong> <span style="font-size:0.85rem; color:#475569;">- Search images on Wikipedia</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:180px;">' +
    '<span><strong>G</strong> <span style="font-size:0.85rem; color:#475569;">- Search images on Google</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:160px;">' +
    '<span><strong>ABC</strong> <span style="font-size:0.85rem; color:#475569;">- Show/hide symbol</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:180px;">' +
    '<span><strong>CTRL</strong> <span style="font-size:0.85rem; color:#475569;">- Select 2 or more symbols</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:200px;">' +
    '<span><strong>Click image</strong> <span style="font-size:0.85rem; color:#475569;">- Show alternatives</span></span>' +
  '</div>' +
'</div>';

translations.es.legend_html = '<div style="display:inline-flex; gap:14px; align-items:flex-start; padding:8px 12px; border:1px solid #e5e7eb; background:#ffffff; border-radius:10px; font-size:0.95rem; color:#374151; flex-wrap:wrap;">' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:160px;">' +
    '<span><strong>+</strong> <span style="font-size:0.85rem; color:#475569;">- Añadir imagen personal</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:220px;">' +
    '<span><strong>🔎 Buscar en ARASAAC</strong> <span style="font-size:0.85rem; color:#475569;">- Encuentra otros pictogramas</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:180px;">' +
    '<span><strong>W</strong> <span style="font-size:0.85rem; color:#475569;">- Buscar imágenes en Wikipedia</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:180px;">' +
    '<span><strong>G</strong> <span style="font-size:0.85rem; color:#475569;">- Buscar imágenes en Google</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:160px;">' +
    '<span><strong>ABC</strong> <span style="font-size:0.85rem; color:#475569;">- Mostrar/ocultar símbolo</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:180px;">' +
    '<span><strong>CTRL</strong> <span style="font-size:0.85rem; color:#475569;">- Selecciona 2 o más símbolos</span></span>' +
  '</div>' +
  '<div role="listitem" style="display:flex;flex-direction:column;min-width:200px;">' +
    '<span><strong>Clic imagen</strong> <span style="font-size:0.85rem; color:#475569;">- Mostrar alternativas</span></span>' +
  '</div>' +
'</div>';

// Short localized summary text for the collapsible legend
translations.it.legend_summary = 'Legenda Funzioni';
translations.en.legend_summary = 'Functions Legend';
translations.es.legend_summary = 'Leyenda de funciones';

// ARIA label for legend (short localized description)
translations.it.legend_aria_label = 'Legenda dei pulsanti funzione: aggiungi, ricerca, Wikipedia (W), Google (G), ABC, unisci, mostra alternative';
translations.en.legend_aria_label = 'Legend of function buttons: add, search, Wikipedia (W), Google (G), ABC, merge, show alternatives';
translations.es.legend_aria_label = 'Leyenda de botones: añadir, buscar, Wikipedia (W), Google (G), ABC, unir, mostrar alternativas';

// Programmatic legend item strings (title + short description) — used by renderLegend()
translations.it.legend_add_title = '+';
translations.it.legend_add_desc = 'Aggiungi immagine personale';
translations.it.legend_search_title = '🔎 Ricerca ARASAAC';
translations.it.legend_search_desc = 'Cerca altri pittogrammi';
translations.it.legend_w_title = 'W';
translations.it.legend_w_desc = 'Cerca immagini su Wikipedia';
translations.it.legend_g_title = 'G';
translations.it.legend_g_desc = 'Cerca immagini su Google';
translations.it.legend_abc_title = 'ABC';
translations.it.legend_abc_desc = 'Mostra/nascondi simbolo';
translations.it.legend_ctrl_title = 'CTRL';
translations.it.legend_ctrl_desc = 'Seleziona 2 o più simboli per unirli in un unico simbolo';
translations.it.legend_click_title = 'Clic immagine';
translations.it.legend_click_desc = 'Mostra alternative';

translations.en.legend_add_title = '+';
translations.en.legend_add_desc = 'Add personal image';
translations.en.legend_search_title = '🔎 Search ARASAAC';
translations.en.legend_search_desc = 'Find alternative pictograms';
translations.en.legend_w_title = 'W';
translations.en.legend_w_desc = 'Search images on Wikipedia';
translations.en.legend_g_title = 'G';
translations.en.legend_g_desc = 'Search images on Google';
translations.en.legend_abc_title = 'ABC';
translations.en.legend_abc_desc = 'Show/hide symbol';
translations.en.legend_ctrl_title = 'CTRL';
translations.en.legend_ctrl_desc = 'Select 2 or more symbols to merge into a single symbol';
translations.en.legend_click_title = 'Click image';
translations.en.legend_click_desc = 'Show alternatives';

translations.es.legend_add_title = '+';
translations.es.legend_add_desc = 'Añadir imagen personal';
translations.es.legend_search_title = '🔎 Buscar en ARASAAC';
translations.es.legend_search_desc = 'Encuentra otros pictogramas';
translations.es.legend_w_title = 'W';
translations.es.legend_w_desc = 'Buscar imágenes en Wikipedia';
translations.es.legend_g_title = 'G';
translations.es.legend_g_desc = 'Buscar imágenes en Google';
translations.es.legend_abc_title = 'ABC';
translations.es.legend_abc_desc = 'Mostrar/ocultar símbolo';
translations.es.legend_ctrl_title = 'CTRL';
translations.es.legend_ctrl_desc = 'Selecciona 2 o más símbolos para unirlos en un único símbolo';
translations.es.legend_click_title = 'Clic imagen';
translations.es.legend_click_desc = 'Mostrar alternativas';

// Strings for exercises generator (modal and button)
translations.it.createExercisesButton = '✏️ Crea esercizi';
translations.it.exercises_modal_title = 'Crea esercizi';
translations.it.exercises_modal_type_label = 'Tipo esercizio';
translations.it.exercises_modal_type_mcq = 'Scelta multipla (MCQ)';
translations.it.exercises_modal_level_label = 'Livello';
translations.it.exercises_modal_generate = 'Genera';
translations.it.exercises_modal_export_json = 'Esporta JSON';
translations.it.exercises_modal_close = 'Chiudi';
translations.it.exercises_modal_preview_title = 'Anteprima esercizi';
translations.it.exercises_modal_no_text = 'Inserisci prima una frase nel campo principale.';
translations.it.exercises_feedback_correct = '✅ Corretto!';
translations.it.exercises_feedback_correct_tts = 'Corretto';
translations.it.exercises_feedback_try_again = '❌ Sbagliato. Riprova.';
translations.it.exercises_feedback_try_again_tts = 'Sbagliato, riprova';
translations.it.exercises_no_generated = 'Nessun esercizio generato';
translations.it.mode_write = 'Scrivi (tastiera)';
translations.it.mode_speak = 'Dì a voce (microfono)';
translations.it.exercises_mic_not_supported = 'Il riconoscimento vocale non è disponibile in questo browser.';
translations.it.exercises_recognition_prompt = 'Parla ora...';
translations.it.exercises_recognition_no_result = 'Nessun riconoscimento, riprova.';
translations.it.exercises_mic_button_start = 'Avvia riconoscimento vocale';
translations.it.exercises_mic_button_stop = 'Ferma riconoscimento vocale';
translations.it.exercises_none = '(nessun esercizio)';
translations.it.exercises_toggle_show = 'Mostra simbolo';
translations.it.exercises_toggle_hide = 'Nascondi simbolo';

translations.en.createExercisesButton = '✏️ Create exercises';
translations.en.exercises_modal_title = 'Create exercises';
translations.en.exercises_modal_type_label = 'Exercise type';
translations.en.exercises_modal_type_mcq = 'Multiple Choice (MCQ)';
translations.en.exercises_modal_level_label = 'Level';
translations.en.exercises_modal_generate = 'Generate';
translations.en.exercises_modal_export_json = 'Export JSON';
translations.en.exercises_modal_close = 'Close';
translations.en.exercises_modal_preview_title = 'Exercises preview';
translations.en.exercises_modal_no_text = 'Please enter a sentence in the main field first.';
translations.en.exercises_feedback_correct = '✅ Correct!';
translations.en.exercises_feedback_correct_tts = 'Correct';
translations.en.exercises_feedback_try_again = '❌ Incorrect. Try again.';
translations.en.exercises_feedback_try_again_tts = 'Incorrect, try again';
translations.en.exercises_no_generated = 'No exercises generated';
translations.en.mode_write = 'Write (keyboard)';
translations.en.mode_speak = 'Speak (microphone)';
translations.en.exercises_mic_not_supported = 'Speech recognition is not available in this browser.';
translations.en.exercises_recognition_prompt = 'Speak now...';
translations.en.exercises_recognition_no_result = 'No recognition result, try again.';
translations.en.exercises_mic_button_start = 'Start speech recognition';
translations.en.exercises_mic_button_stop = 'Stop speech recognition';
translations.en.exercises_none = '(no exercises)';
translations.en.exercises_toggle_show = 'Show symbol';
translations.en.exercises_toggle_hide = 'Hide symbol';

translations.es.createExercisesButton = '✏️ Crear ejercicios';
translations.es.exercises_modal_title = 'Crear ejercicios';
translations.es.exercises_modal_type_label = 'Tipo de ejercicio';
translations.es.exercises_modal_type_mcq = 'Opción múltiple (MCQ)';
translations.es.exercises_modal_level_label = 'Nivel';
translations.es.exercises_modal_generate = 'Generar';
translations.es.exercises_modal_export_json = 'Exportar JSON';
translations.es.exercises_modal_close = 'Cerrar';
translations.es.exercises_modal_preview_title = 'Vista previa ejercicios';
translations.es.exercises_modal_no_text = 'Primero introduce una frase en el campo principal.';
translations.es.exercises_feedback_correct = '✅ ¡Correcto!';
translations.es.exercises_feedback_correct_tts = 'Correcto';
translations.es.exercises_feedback_try_again = '❌ Incorrecto. Inténtalo de nuevo.';
translations.es.exercises_feedback_try_again_tts = 'Incorrecto, inténtalo de nuevo';
translations.es.exercises_no_generated = 'Ningún ejercicio generado';
translations.es.mode_write = 'Escribe (teclado)';
translations.es.mode_speak = 'Di en voz alta (micrófono)';
translations.es.exercises_mic_not_supported = 'El reconocimiento de voz no está disponible en este navegador.';
translations.es.exercises_recognition_prompt = 'Habla ahora...';
translations.es.exercises_recognition_no_result = 'Sin reconocimiento, inténtalo de nuevo.';
translations.es.exercises_mic_button_start = 'Iniciar reconocimiento de voz';
translations.es.exercises_mic_button_stop = 'Detener reconocimiento de voz';
translations.es.exercises_none = '(ningún ejercicio)';
translations.es.exercises_toggle_show = 'Mostrar símbolo';
translations.es.exercises_toggle_hide = 'Ocultar símbolo';

// Loading / error strings used by guide placeholders and image alt texts
translations.it.loading = 'Caricamento...';
translations.en.loading = 'Loading...';
translations.es.loading = 'Cargando...';

translations.it.errorLoading = 'Errore caricamento';
translations.en.errorLoading = 'Error loading';
translations.es.errorLoading = 'Error de carga';

translations.it.confirmRemoveSymbol = 'Vuoi rimuovere {symbolDesc} per "{word}"?\n\nGli altri simboli disponibili rimarranno.';
translations.en.confirmRemoveSymbol = 'Do you want to remove {symbolDesc} for "{word}"?\n\nOther available symbols will remain.';
translations.es.confirmRemoveSymbol = '¿Quieres eliminar {symbolDesc} para "{word}"?\n\nLos otros símbolos disponibles permanecerán.';

// --- applyTranslations ---

function applyTranslations(lang){
  if(!translations[lang]) lang = 'it';
  const t = translations[lang];
  // Header: update visible app name text but keep the logo link intact
  const titleSpan = document.getElementById('appTitleText');
  if (titleSpan) {
    titleSpan.textContent = t.appName || t.title || 'Limpidi Simboli';
  } else {
    const h1 = document.querySelector('h1'); if(h1) h1.textContent = t.title;
  }
  const sub = document.querySelector('.sub'); if(sub) sub.textContent = t.subtitle;
  // Textarea placeholder
  const ta = document.getElementById('textInput'); if(ta) ta.placeholder = t.textareaPlaceholder;
  // Buttons
  const btn = document.getElementById('translateButton'); if(btn) { btn.textContent = t.translateButton; btn.setAttribute('aria-label', t.translateButton); }
  const createBtn = document.getElementById('createExercisesButton'); if (createBtn) { createBtn.textContent = t.createExercisesButton || '✏️ Crea esercizi'; createBtn.setAttribute('aria-label', t.createExercisesButton || 'Crea esercizi'); }
  const clr = document.getElementById('clearButton'); if(clr) { clr.textContent = t.clearButton; clr.setAttribute('aria-label', t.clearButton); }
  const spk = document.getElementById('speakButton'); if(spk) { spk.textContent = t.speakButton; spk.setAttribute('aria-label', t.speakButton); }
  const spkSlow = document.getElementById('speakSlowButton'); if(spkSlow) { spkSlow.textContent = t.exercises_play_slow || '🐢 Karaoke (lento)'; spkSlow.setAttribute('aria-label', t.exercises_play_slow || '🐢 Karaoke (lento)'); }
  const setBtn = document.getElementById('settingsButton'); if(setBtn) { setBtn.textContent = t.settingsButton; setBtn.setAttribute('aria-label', t.settingsButton); }
  const folderBtn = document.getElementById('selectLocalFolderButton'); if(folderBtn) { folderBtn.textContent = t.selectLocalFolderButton; folderBtn.setAttribute('aria-label', t.selectLocalFolderButton); }
  const disconnectBtn = document.getElementById('disconnectLocalFolderButton');
  if (disconnectBtn) {
    disconnectBtn.textContent = t.disconnectLocalFolderButton;
    disconnectBtn.setAttribute('aria-label', t.disconnectLocalFolderButton);
    if (typeof t.disconnectLocalFolderTitle !== 'undefined') disconnectBtn.title = t.disconnectLocalFolderTitle;
  }
  // Logo tooltip
  const logoLink = document.getElementById('asphiLogoLink');
  if (logoLink && typeof t.asphiLogoTitle !== 'undefined') logoLink.title = t.asphiLogoTitle;
  // Localize language flag tooltips (show language names in the UI language)
  document.querySelectorAll('.lang-flag').forEach(b => {
    try {
      const code = (b.dataset && b.dataset.lang) ? b.dataset.lang : 'it';
      const key = 'lang_' + code;
      if (t && typeof t[key] !== 'undefined') b.title = t[key];
    } catch (e) { /* non critico */ }
  });
  const gr = document.getElementById('guidaRapidaButton'); if(gr) { gr.textContent = t.guidaRapidaButton; gr.setAttribute('aria-label', t.guidaRapidaButton); }
  const ga = document.getElementById('guidaAvanzataButton'); if(ga) { ga.textContent = t.guidaAvanzataButton; ga.setAttribute('aria-label', t.guidaAvanzataButton); }
  const vb = document.getElementById('videoTutorialButton'); if(vb) { vb.textContent = t.videoTutorialButton; vb.setAttribute('aria-label', t.videoTutorialButton); }
  const mb = document.getElementById('mergeButton'); if(mb) mb.textContent = t.mergeButton;
  const toggleTileBtn = document.getElementById('toggleTileActionsButton'); if(toggleTileBtn) { toggleTileBtn.textContent = t.toggleTileActionsButton; toggleTileBtn.setAttribute('aria-label', t.toggleTileActionsButton); }
  const uploadDocBtn = document.getElementById('uploadDocButton'); if(uploadDocBtn) { uploadDocBtn.textContent = t.uploadDocButton; uploadDocBtn.setAttribute('aria-label', t.uploadDocButton); }
  const printPdfBtn = document.getElementById('printPdfButton'); if(printPdfBtn) { printPdfBtn.textContent = t.printPdfButton; printPdfBtn.setAttribute('aria-label', t.printPdfButton); }
  const saveProjectBtn = document.getElementById('saveProjectButton'); if(saveProjectBtn) { saveProjectBtn.textContent = t.saveProjectButton; saveProjectBtn.setAttribute('aria-label', t.saveProjectButton); }
  const loadProjectBtn = document.getElementById('loadProjectButton'); if(loadProjectBtn) { loadProjectBtn.textContent = t.loadProjectButton; loadProjectBtn.setAttribute('aria-label', t.loadProjectButton); }
  const exUploadPdfBtn = document.getElementById('exModalUploadPdf'); if(exUploadPdfBtn) { exUploadPdfBtn.textContent = t.exModalUploadPdf; exUploadPdfBtn.setAttribute('aria-label', t.exModalUploadPdf); }
  // Settings modal title (if present)
  const sm = document.getElementById('settingsModalTitle'); if(sm) sm.textContent = t.settingsModalTitle;

  // Close button for settings modal
  const closeSettingsBtn = document.getElementById('closeSettingsButton'); if (closeSettingsBtn) { closeSettingsBtn.textContent = t.close; closeSettingsBtn.setAttribute('aria-label', t.close); }

  // Update document language and title
  try { document.documentElement.lang = lang; } catch(e){}
  try { document.title = t.title; } catch(e){}
  // Update active flag
  document.querySelectorAll('.lang-flag').forEach(b => {
    if(b.dataset && b.dataset.lang === lang) b.classList.add('active'); else b.classList.remove('active');
  });

  // Update guide modal placeholders and close buttons
  try {
    const grContent = document.getElementById('guidaRapidaContent');
    if (grContent) grContent.textContent = t.loading;
    const gaContent = document.getElementById('guidaAvanzataContent');
    if (gaContent) gaContent.textContent = t.loading;
    // Localize any close buttons for guides
    document.querySelectorAll('.guide-close-btn').forEach(b => {
      try { b.innerHTML = '✕ ' + t.close; b.setAttribute('aria-label', t.close); } catch(e){}
    });

    // Replace any stray static "Caricamento..." / "Loading..." / "Cargando..." texts
    document.querySelectorAll('div, p, span').forEach(el => {
      try {
        const txt = (el.textContent || '').trim();
        if (!txt) return;
        if (txt === 'Caricamento...' || txt === 'Loading...' || txt === 'Cargando...') {
          el.textContent = t.loading;
        }
      } catch(e){}
    });
  } catch (e) { /* non critico */ }

  // Aggiorna etichetta "ignora parole funzionali"
  try {
    const skipLbl = document.getElementById('skipStopLabel');
    if (skipLbl) {
      const cb = document.getElementById('skipStop');
      // rimuovi eventuali nodi di testo successivi al checkbox
      if (cb && cb.nextSibling) {
        // rimuovi tutti i nodi di testo dopo il checkbox
        let node = cb.nextSibling;
        while (node) {
          const toRemove = node;
          node = node.nextSibling;
          if (toRemove && toRemove.parentNode) toRemove.parentNode.removeChild(toRemove);
        }
        // aggiungi nuovo nodo di testo
        cb.insertAdjacentText('afterend', ' ' + t.skipStopLabel);
      }
      // imposta anche il tooltip
      if (typeof t.skipStopTitle !== 'undefined') skipLbl.title = t.skipStopTitle;
    }
  } catch (e) { /* non critico */ }

  // persist
  try { localStorage.setItem('appLang', lang); } catch(e){}

  // Aggiorna footer (HTML) se presenti gli span dedicati
  try {
    const fa = document.getElementById('footer_attribution');
    const fd = document.getElementById('footer_development');
    const fl = document.getElementById('footer_license');
    const fg = document.getElementById('footer_github');
    if (fa) fa.innerHTML = translateUI('footer_attribution');
    if (fd) fd.innerHTML = translateUI('footer_development');
    if (fl) fl.innerHTML = translateUI('footer_license');
    if (fg) fg.innerHTML = translateUI('footer_github');
    // Aggiorna legenda dei pulsanti funzione attorno al simbolo (se presente)
    try {
      // Update the summary label for the collapsible legend if present
      const legendSummary = document.getElementById('symbolsLegendSummary');
      if (legendSummary) legendSummary.textContent = translateUI('legend_summary');

      // Try to render a semantic, programmatic legend (preferred). If the renderer
      // fails for any reason, fall back to the legacy HTML fragment stored in translations.
      try {
        if (typeof renderLegend === 'function') renderLegend();
        else throw new Error('renderLegend missing');
      } catch (innerErr) {
        const legend = document.getElementById('symbolsLegend');
        if (legend) {
          // legacy fallback
          legend.innerHTML = translateUI('legend_html');
        }
      }

      // set a localized aria-label for screen readers (key added above)
      const legendEl = document.getElementById('symbolsLegend');
      if (legendEl) {
        try { legendEl.setAttribute('aria-label', translateUI('legend_aria_label')); } catch (e) {}
      }
    } catch (e) { /* non critico */ }
  } catch (e) { /* non critico */ }
}

// Helper per tradurre stringhe UI con placeholder usando l'oggetto translations
function translateUI(key, params) {
  const lang = (document.getElementById('lang') || { value: 'it' }).value || localStorage.getItem('appLang') || 'it';
  const dict = translations[lang] || translations['it'];
  let tmpl = (dict && dict[key]) || key;
  if (!params) return tmpl;
  Object.keys(params).forEach(k => {
    tmpl = tmpl.replace(new RegExp('\\{' + k + '\\}','g'), params[k]);
  });
  return tmpl;
}
