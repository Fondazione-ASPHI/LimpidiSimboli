/* js/utils.js – Constants & utility helpers for Limpidi Simboli */

// ── Debug flag ────────────────────────────────────────────────────────────────
// Set localStorage.debug = 'true' to enable verbose logging in the console.
const DEBUG = (function () {
  try { return localStorage.getItem('debug') === 'true'; } catch (e) { return false; }
})();
function dbg() { if (DEBUG) console.log.apply(console, arguments); }

// ── localStorage key constants ────────────────────────────────────────────────
const STORAGE_KEYS = {
  EULA_ACCEPTED:       'eulaAccepted',
  EULA_VERSION:        'eulaVersion',
  APP_LANG:            'appLang',
  OPENAI_KEY:          'openaiApiKey',
  OPENSYMBOLS_TOKEN:   'openSymbolsToken',
  GOOGLE_API_KEY:      'googleApiKey',
  GOOGLE_CX:           'googleCx',
  KARAOKE_SPEED:       'karaokeSpeed',
  SELECTED_VOICE:      'selectedVoice',
  SHOW_TILE_ACTIONS:   'showTileActions',
  SHOW_GRAMMAR_BADGES: 'showGrammarBadges',
  LOCAL_FOLDER_NAME:   'localImageFolderName',
  CUSTOM_SYMBOL_IMAGES:'customSymbolImages',
  PERSONAL_SYMBOLS:    'personalSymbols'
};

// ── API endpoints ─────────────────────────────────────────────────────────────
const API_ROOT = 'https://api.arasaac.org/api/pictograms';
const STATIC_ROOT = 'https://static.arasaac.org/pictograms';

// ── SVG placeholder images ────────────────────────────────────────────────────
const SVG_ERROR = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><text x="50%" y="50%" text-anchor="middle" fill="%23c00" font-size="12">Errore</text></svg>';
const SVG_NOT_FOUND = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><text x="50%" y="50%" text-anchor="middle" fill="%23999" font-size="12">Non trovato</text></svg>';
const SVG_UNKNOWN = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><text x="50%" y="50%" text-anchor="middle" fill="%23999" font-size="12">?</text></svg>';

// ── Stop-word sets ────────────────────────────────────────────────────────────
// Parole funzionali da ignorare quando skipStop è attivo. Oltre agli articoli,
// preposizioni e congiunzioni, includiamo le forme coniugate del verbo avere
// (ho, hai, ha, abbiamo, avete, hanno) in modo da trattarle come ausiliari e
// impedirne l'uso per determinare locuzioni.
const STOP_IT = new Set([
  'il','lo','la','i','gli','le','un','uno','una','del','della','dei','degli','delle','di','a','da','in','con','su','per','tra','fra','al','allo','alla','ai','agli','alle','dal','dallo','dalla','dai','dagli','dalle','nel','nello','nella','nei','negli','nelle','col','coi','sul','sullo','sulla','sui','sugli','sulle','e','ed','o','oppure','ma','anche','che','se','come','più','meno','non','mi','ti','si','ci','vi','gli','ne','dei',
  // Forme del verbo avere
  'ho','hai','ha','abbiamo','avete','hanno'
]);

const STOP_ES = new Set([]);
const STOP_EN = new Set([]);

// ── Irregular present → lemma map ─────────────────────────────────────────────
// Mappa delle forme irregolari del presente all'infinito. Serve sia per
// generare varianti sia per indirizzare la ricerca verso il lemma corretto.
const IRREGULAR_PRESENT_LEMMA_MAP = {
  'ho': 'avere',
  'hai': 'avere',
  'ha': 'avere',
  'abbiamo': 'avere',
  'avete': 'avere',
  'hanno': 'avere',
  'sono': 'essere',
  'sei': 'essere',
  'è': 'essere',
  'siamo': 'essere',
  'siete': 'essere'
};

// ── Pronouns ──────────────────────────────────────────────────────────────────
// Insiemi di pronomi per evitare di applicare il tempo verbale o di essere
// scartati come parole funzionali quando la frase viene analizzata da GPT.
const PRONOUNS = {
  it: new Set([
    'io','tu','lui','lei','noi','voi','loro',
    'me','te','mi','ti','si','ci','vi','ne','gli','le','li','la','lo'
  ]),
  es: new Set([
    'yo','tú','él','ella','nosotros','nosotras','vosotros','vosotras','ellos','ellas',
    'me','te','se','nos','os','lo','la','los','las','le','les'
  ]),
  en: new Set([
    'i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','hers','our','their'
  ])
};

// ── Pronoun search map ────────────────────────────────────────────────────────
// Mappatura dei pronomi a un termine di ricerca più adatto per ottenere il pittogramma.
// Alcuni pronomi oggetto non hanno un pittogramma specifico su ARASAAC, quindi
// utilizziamo un sinonimo (es. "te" -> "tu") per recuperare l'immagine corretta.
const PRONOUN_SEARCH_MAP = {
  it: {
    me: 'io',
    mi: 'io',
    te: 'tu',
    ti: 'tu',
    ci: 'noi',
    vi: 'voi',
    lui: 'lui',
    lei: 'lei',
    lo: 'lui',
    la: 'lei',
    li: 'loro',
    le: 'loro',
    loro: 'loro',
    noi: 'noi',
    voi: 'voi',
    tu: 'tu',
    io: 'io'
  },
  es: {},
  en: {}
};

// ── Gender markers ────────────────────────────────────────────────────────────
const GENDER_MARKERS = {
  it: new Set(['femmina','femminile','maschio','maschile']),
  es: new Set(['femenino','femenina','masculino','masculina']),
  en: new Set(['female','male','feminine','masculine'])
};

// ── Number markers ────────────────────────────────────────────────────────────
// Insiemi per il numero grammaticale. Se un token appartiene a questo insieme,
// verrà interpretato come marcatore di singolare o plurale e mostrato come badge.
const NUMBER_MARKERS = {
  it: new Set(['singolare','plurale']),
  es: new Set(['singular','plural']),
  en: new Set(['singular','plural'])
};

// ── Object pronoun map ────────────────────────────────────────────────────────
// Mappatura dei pronomi oggetto clitici in italiano ai pronomi completi con
// indicazione di genere e numero. Serve per trasformare pronomi come "li"
// (maschile plurale) nel lemma "loro" con badge appropriati.
const OBJECT_PRONOUN_MAP = {
  lo: { base: 'lui', gender: 'maschile', number: 'singolare' },
  la: { base: 'lei', gender: 'femminile', number: 'singolare' },
  li: { base: 'loro', gender: 'maschile', number: 'plurale' },
  le: { base: 'loro', gender: 'femminile', number: 'plurale' },
};

// ── Tense words ───────────────────────────────────────────────────────────────
const TENSE_WORDS = {
  it: { future: 'futuro', past: 'passato', present: 'presente' },
  es: { future: 'futuro', past: 'pasado', present: 'presente' },
  en: { future: 'future', past: 'past', present: 'present' }
};

// ── Badge symbols ─────────────────────────────────────────────────────────────
// Emoji/simboli Unicode per i badge grammaticali (più chiari delle icone ARASAAC)
const BADGE_SYMBOLS = {
  // Tempi verbali
  past: '⏪',        // passato
  present: '▶️',    // presente
  future: '⏩',      // futuro
  // Numeri
  singolare: '1️⃣',   // singolare
  plurale: '➕',      // plurale
};

// ── Local synonyms (Italian) ─────────────────────────────────────────────────
// Sinonimi locali per termini comuni che spesso non hanno un pittogramma diretto.
// Se un lemma non trova un simbolo, questi sinonimi vengono usati per
// l'ulteriore ricerca. Si possono estendere liberamente secondo necessità.
const LOCAL_SYNONYMS_IT = {
  'tante': ['molte','numerose'],
  'tanti': ['molti','numerosi'],
  'tanta': ['molta','numerosa'],
  'tanto': ['molto','numeroso'],
  'poche': ['poche','poco'],
  'poca': ['poca','pochi'],
  'poco': ['pochi','poca'],
  'pochi': ['poco','poche'],
  'ragazze': ['bambine','giovani'],
  'ragazzi': ['bambini','giovani']
};

// ── Common distractors (for exercises) ────────────────────────────────────────
const COMMON_DISTRACTORS = [
  'cane','gatto','casa','scuola','libro','mela','pane','acqua','latte','auto',
  'bambino','donna','uomo','sedia','tavolo','porta','finestra','sole','luna','fiore'
];

// ── Global mutable state ──────────────────────────────────────────────────────
var openaiApiKey = '';
var googleApiKey = '';
var googleCx = '';
var localImageFolderHandle = null;
var localImageFiles = {};
var localFileHandleMap = new Map();
var keywordIndex = new Map();
var keywordEntries = new Set();
var keywordIndexReady = false;
var selectedTiles = new Set();
var aborter = null;
var openSymbolsToken = '';
const cache = new Map();
const pictoDetailCache = new Map();

// ── Utility functions ─────────────────────────────────────────────────────────

function qs(id) { return document.getElementById(id); }

function sanitizeWord(w) {
  // Prima gestisci gli articoli con apostrofo (l', un', dell', ecc.)
  // Pattern: rimuove articoli comuni seguiti da apostrofo
  let cleaned = w.replace(/^(l|un|dell|all|nell|sull|dall|c|d|n|s|t|v|m|qu)['']/i, '');
  // Poi rimuovi la punteggiatura rimanente
  cleaned = cleaned.toLowerCase().replace(/[.,;:!?"'()\[\]{}<>]/g, '').trim();
  return cleaned;
}

function tokenize(text) {
  return text.replace(/\u00A0/g, ' ')
    .split(/\s+/)
    .map(t => t.replace(/['']/g, "'"))
    .filter(Boolean);
}

// ── compressImage ─────────────────────────────────────────────────────────────
// Funzione per comprimere un'immagine a una dimensione massima (per risparmiare
// spazio in localStorage)
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcola nuove dimensioni mantenendo aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Converti a JPEG per miglior compressione (a meno che non sia PNG con trasparenza)
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        const originalSize = (e.target.result.length / 1024).toFixed(2);
        const compressedSize = (dataUrl.length / 1024).toFixed(2);
        console.log(`[Compress] ${originalSize} KB -> ${compressedSize} KB (${((compressedSize / originalSize) * 100).toFixed(1)}%)`);

        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── safeAsync wrapper ─────────────────────────────────────────────────────────
// Helper to wrap async handlers and automatically catch/report rejections
function safeAsync(fn) {
  return function (...args) {
    try {
      const res = fn.apply(this, args);
      if (res && typeof res.then === 'function') {
        res.catch(err => {
          try { console.error('[safeAsync] caught', err); } catch (e) {}
          try { setStatusKey('js_error', { msg: (err && err.message) ? err.message : String(err) }, true); } catch (e) {}
        });
      }
      return res;
    } catch (e) {
      console.error('[safeAsync] sync error', e);
      try { setStatusKey('js_error', { msg: (e && e.message) ? e.message : String(e) }, true); } catch (_) {}
      throw e;
    }
  };
}

// ── cleanCache ────────────────────────────────────────────────────────────────
// Funzione per pulire cache vecchie (mantiene solo ultimi 100 elementi per tipo)
function cleanCache() {
  try {
    const keys = Object.keys(localStorage);
    const cacheTypes = {
      translation: keys.filter(k => k.startsWith('translation_')),
      synonyms_en: keys.filter(k => k.startsWith('synonyms_en_')),
      synonyms_it: keys.filter(k => k.startsWith('synonyms_it_'))
    };

    Object.entries(cacheTypes).forEach(([type, typeKeys]) => {
      if (typeKeys.length > 100) {
        // Rimuovi i più vecchi (primi nella lista)
        const toRemove = typeKeys.slice(0, typeKeys.length - 100);
        toRemove.forEach(k => localStorage.removeItem(k));
        console.log(`[Cache] Cleaned ${toRemove.length} old ${type} entries`);
      }
    });
  } catch (e) {
    console.warn('[Cache] Error cleaning cache:', e);
  }
}

// ── Personal library ──────────────────────────────────────────────────────────
// Libreria personale di simboli caricati dall'utente.
// È memorizzata nel localStorage sotto la chiave 'personalSymbols'.
const personalLibrary = (() => {
  try {
    const stored = localStorage.getItem('personalSymbols');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
})();

function savePersonalLibrary() {
  try {
    localStorage.setItem('personalSymbols', JSON.stringify(personalLibrary));
  } catch (e) {
    console.error('Impossibile salvare la libreria personale', e);
  }
}

function addPersonalSymbol(word, dataUrl) {
  const key = word.toLowerCase();
  personalLibrary[key] = personalLibrary[key] || [];
  personalLibrary[key].push(dataUrl);
  savePersonalLibrary();
}

// ── checkLocalFolderSelected ──────────────────────────────────────────────────
// Funzione helper per verificare se la cartella locale è selezionata
function checkLocalFolderSelected(actionName = 'questa azione') {
  if (!localImageFolderHandle) {
    const message = translateUI('selectFolderReminder', { actionName });

    if (confirm(message)) {
      // Trigger il click sul bottone di selezione cartella
      const selectBtn = document.getElementById('selectLocalFolderButton');
      if (selectBtn) {
        selectBtn.click();
      }
    }
    return false;
  }
  return true;
}

// ── depluralizeItalian ────────────────────────────────────────────────────────
// Funzione per ottenere possibili singolari di un sostantivo italiano.
// Questa implementazione semplificata prova a derivare forme al singolare
// rimuovendo la desinenza plurale comune e sostituendola con la vocale
// appropriata. Se la parola termina con "i" o "e", prova le varianti
// in "o" e "a"; inoltre include sempre la parola originale.
function depluralizeItalian(word) {
  const w = (word || '').toLowerCase().trim();
  const results = new Set();
  if (!w) return [];
  // Aggiungi sempre la forma originale
  results.add(w);
  // Gestisce plurali che terminano in 'i' (es. "libri" -> "libro", "libra")
  if (w.endsWith('i') && w.length > 1) {
    const root = w.slice(0, -1);
    results.add(root + 'o');
    results.add(root + 'a');
  }
  // Gestisce plurali che terminano in 'e' (es. "case" -> "casa" o "caso")
  if (w.endsWith('e') && w.length > 1) {
    const root = w.slice(0, -1);
    results.add(root + 'a');
    results.add(root + 'o');
  }
  return [...results];
}

// ── Hidden file input for custom image uploads ────────────────────────────────
// Creiamo un input file nascosto per consentire all'utente di caricare
// immagini personalizzate.
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

// ── DOM reference map ─────────────────────────────────────────────────────────
// Note: `els` DOM reference map is initialized in app.js after DOM is ready
var els = {};
