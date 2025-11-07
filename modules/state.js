/**
 * State Management Module
 * 
 * Centralizza tutte le variabili globali dell'applicazione in un oggetto stato unico.
 * Questo modulo sostituisce le variabili sparse nel codice originale con una struttura organizzata.
 */

export const state = {
  // API Keys e Token
  api: {
    openai: '',
    openSymbols: '',
    google: {
      apiKey: '',
      cx: ''
    }
  },

  // Cache per performance
  cache: {
    // Cache in-memory (Map)
    pictograms: new Map(),          // id pittogrammi
    pictogramDetails: new Map(),     // dettagli pittogrammi (keywords)
    keywordIndex: new Map(),         // parola → [id1, id2, ...]
    keywordEntries: new Set(),       // Set di tutte le parole/locuzioni ARASAAC IT
    
    // Flag stato cache
    keywordIndexReady: false
  },

  // File System Access API
  storage: {
    localImageFolderHandle: null,    // Handle cartella locale
    localImageFiles: {},              // Cache: { "parola": [FileHandle1, FileHandle2, ...] }
    localFileHandleMap: new Map()     // Mappa: id_univoco → FileHandle
  },

  // UI State
  ui: {
    selectedTiles: new Set(),         // Tile selezionati per unione
    aborter: null,                     // AbortController per annullare richieste
    elements: null                     // Riferimenti agli elementi DOM (popolato all'init)
  },

  // User Settings (sincronizzati con localStorage)
  settings: {
    skipStopWords: true,
    showGrammarBadges: true,
    selectedVoice: '',
    language: 'it'
  }
};

/**
 * Inizializza lo stato caricando dati da localStorage
 */
export function initializeState() {
  // Carica API keys
  try {
    const storedOpenAI = localStorage.getItem('openaiApiKey');
    if (storedOpenAI) state.api.openai = storedOpenAI.trim();

    const storedOpenSymbols = localStorage.getItem('openSymbolsToken');
    if (storedOpenSymbols) state.api.openSymbols = storedOpenSymbols.trim();

    const storedGoogleKey = localStorage.getItem('googleApiKey');
    if (storedGoogleKey) state.api.google.apiKey = storedGoogleKey.trim();

    const storedGoogleCx = localStorage.getItem('googleCx');
    if (storedGoogleCx) state.api.google.cx = storedGoogleCx.trim();
  } catch (e) {
    console.warn('[State] Errore caricamento API keys:', e);
  }

  // Carica settings
  try {
    const storedVoice = localStorage.getItem('selectedVoice');
    if (storedVoice) state.settings.selectedVoice = storedVoice;

    const storedShowBadges = localStorage.getItem('showGrammarBadges');
    if (storedShowBadges !== null) {
      state.settings.showGrammarBadges = storedShowBadges === 'true';
    }
  } catch (e) {
    console.warn('[State] Errore caricamento settings:', e);
  }

  console.log('[State] Stato inizializzato');
}

/**
 * Salva un'API key nel localStorage
 * @param {string} type - Tipo di API ('openai', 'openSymbols', 'googleKey', 'googleCx')
 * @param {string} value - Valore della chiave
 */
export function saveApiKey(type, value) {
  const trimmedValue = (value || '').trim();
  
  try {
    switch (type) {
      case 'openai':
        state.api.openai = trimmedValue;
        if (trimmedValue) {
          localStorage.setItem('openaiApiKey', trimmedValue);
        } else {
          localStorage.removeItem('openaiApiKey');
        }
        break;
      
      case 'openSymbols':
        state.api.openSymbols = trimmedValue;
        if (trimmedValue) {
          localStorage.setItem('openSymbolsToken', trimmedValue);
        } else {
          localStorage.removeItem('openSymbolsToken');
        }
        break;
      
      case 'googleKey':
        state.api.google.apiKey = trimmedValue;
        if (trimmedValue) {
          localStorage.setItem('googleApiKey', trimmedValue);
        } else {
          localStorage.removeItem('googleApiKey');
        }
        break;
      
      case 'googleCx':
        state.api.google.cx = trimmedValue;
        if (trimmedValue) {
          localStorage.setItem('googleCx', trimmedValue);
        } else {
          localStorage.removeItem('googleCx');
        }
        break;
      
      default:
        console.warn('[State] Tipo API key sconosciuto:', type);
    }
  } catch (e) {
    console.error('[State] Errore salvataggio API key:', e);
  }
}

/**
 * Salva un setting utente
 * @param {string} key - Chiave del setting
 * @param {any} value - Valore del setting
 */
export function saveSetting(key, value) {
  if (state.settings.hasOwnProperty(key)) {
    state.settings[key] = value;
    try {
      localStorage.setItem(key, String(value));
    } catch (e) {
      console.error('[State] Errore salvataggio setting:', e);
    }
  }
}

/**
 * Pulisce le cache vecchie mantenendo solo gli ultimi 100 elementi per tipo
 */
export function cleanCache() {
  try {
    const keys = Object.keys(localStorage);
    const cacheTypes = {
      translation: keys.filter(k => k.startsWith('translation_')),
      synonyms_en: keys.filter(k => k.startsWith('synonyms_en_')),
      synonyms_it: keys.filter(k => k.startsWith('synonyms_it_'))
    };
    
    Object.entries(cacheTypes).forEach(([type, typeKeys]) => {
      if (typeKeys.length > 100) {
        const toRemove = typeKeys.slice(0, typeKeys.length - 100);
        toRemove.forEach(k => localStorage.removeItem(k));
        console.log(`[State Cache] Cleaned ${toRemove.length} old ${type} entries`);
      }
    });
  } catch (e) {
    console.warn('[State Cache] Error cleaning cache:', e);
  }
}

/**
 * Resetta lo stato dell'applicazione (utile per testing o logout)
 */
export function resetState() {
  // Reset API keys
  state.api.openai = '';
  state.api.openSymbols = '';
  state.api.google.apiKey = '';
  state.api.google.cx = '';

  // Reset cache
  state.cache.pictograms.clear();
  state.cache.pictogramDetails.clear();
  state.cache.keywordIndex.clear();
  state.cache.keywordEntries.clear();
  state.cache.keywordIndexReady = false;

  // Reset storage
  state.storage.localImageFolderHandle = null;
  state.storage.localImageFiles = {};
  state.storage.localFileHandleMap.clear();

  // Reset UI
  state.ui.selectedTiles.clear();
  if (state.ui.aborter) {
    state.ui.aborter.abort();
    state.ui.aborter = null;
  }

  console.log('[State] Stato resettato');
}

// Export dello stato come default
export default state;
