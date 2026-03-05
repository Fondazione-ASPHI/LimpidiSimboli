# js/utils.js — Costanti, stato globale e utility

**Righe:** ~397 | **Dipendenze:** nessuna (file fondazionale, caricato per primo)

## Responsabilità

- Definire tutte le costanti condivise (endpoint API, stop-word, lookup table linguistiche).
- Dichiarare tutto lo stato mutabile globale dell'applicazione.
- Fornire funzioni utility generiche usate da tutti gli altri moduli.

## Costanti

### Debug

| Nome | Tipo | Descrizione |
|------|------|-------------|
| `DEBUG` | `const boolean` | Flag di debug, letto da `localStorage.debug === 'true'`. Attivato via IIFE all'avvio. |
| `dbg()` | `function` | Wrapper di `console.log` condizionale: logga solo se `DEBUG` è `true`. Usare **sempre** al posto di `console.log`. |

### Chiavi localStorage (`STORAGE_KEYS`)

```js
const STORAGE_KEYS = {
  EULA_ACCEPTED, EULA_VERSION, APP_LANG,
  OPENAI_KEY, OPENSYMBOLS_TOKEN,
  GOOGLE_API_KEY, GOOGLE_CX,
  KARAOKE_SPEED, SELECTED_VOICE,
  SHOW_TILE_ACTIONS, SHOW_GRAMMAR_BADGES,
  LOCAL_FOLDER_NAME, CUSTOM_SYMBOL_IMAGES, PERSONAL_SYMBOLS
};
```

Oggetto centralizzato con tutte le chiavi usate per `localStorage.getItem()`/`setItem()`. Usare `STORAGE_KEYS.NOME` anziché stringhe hardcodate.

### SVG Placeholder

| Nome | Descrizione |
|------|-------------|
| `SVG_ERROR` | Data-URL SVG con testo "Errore" (rosso). Usato come fallback quando il caricamento di un'immagine fallisce. |
| `SVG_NOT_FOUND` | Data-URL SVG con testo "Non trovato" (grigio). Usato quando nessun pittogramma corrisponde alla ricerca. |
| `SVG_UNKNOWN` | Data-URL SVG con testo "?" (grigio). Usato per stati sconosciuti. |

### Endpoint API

| Nome | Valore | Usato da |
|------|--------|----------|
| `API_ROOT` | `'https://api.arasaac.org/api/pictograms'` | `api.js` |
| `STATIC_ROOT` | `'https://static.arasaac.org/pictograms'` | `tiles.js`, `api.js` |

### Set di stop-word

| Nome | Lingua | Descrizione |
|------|--------|-------------|
| `STOP_IT` | Italiano | `Set` di articoli, preposizioni, congiunzioni, ausiliari |
| `STOP_ES` | Spagnolo | `Set` equivalente per spagnolo |
| `STOP_EN` | Inglese | `Set` equivalente per inglese |

### Tabelle linguistiche

| Nome | Tipo | Descrizione |
|------|------|-------------|
| `IRREGULAR_PRESENT_LEMMA_MAP` | `Object` | Forme irregolari italiane → lemma (es. `'ho' → 'avere'`) |
| `PRONOUNS` | `Object` | Pronomi italiani → persona/numero/genere |
| `PRONOUN_SEARCH_MAP` | `Object` | Pronomi → termini ARASAAC per la ricerca |
| `GENDER_MARKERS` | `Object` | Suffissi → etichetta genere |
| `NUMBER_MARKERS` | `Object` | Suffissi → etichetta numero (singolare/plurale) |
| `OBJECT_PRONOUN_MAP` | `Object` | Pronomi oggetto → forma nominativa |
| `TENSE_WORDS` | `Object` | Avverbi temporali → nome del tempo verbale |
| `BADGE_SYMBOLS` | `Object` | Chiave badge → emoji + testo (es. `'past' → {emoji: '⏪', text: 'Passato'}`) |

### Altre costanti

| Nome | Tipo | Descrizione |
|------|------|-------------|
| `LOCAL_SYNONYMS_IT` | `Object` | Sinonimi italiani manuali (parola → array) |
| `COMMON_DISTRACTORS` | `Array` | Parole comuni usate come distrattori negli esercizi |
| `cache` | `Object` | Cache generica per risposte API `{}` |
| `pictoDetailCache` | `Object` | Cache dettagli pittogrammi ARASAAC `{}` |

## Stato mutabile globale

| Nome | Tipo | Iniziale | Descrizione |
|------|------|----------|-------------|
| `openaiApiKey` | `var` | `''` | Chiave API OpenAI, caricata da localStorage in `app.js` |
| `googleApiKey` | `var` | `''` | Chiave API Google CSE |
| `googleCx` | `var` | `''` | ID motore di ricerca Google |
| `localImageFolderHandle` | `var` | `null` | `FileSystemDirectoryHandle` della cartella locale |
| `localImageFiles` | `var` | `{}` | Oggetto nomi file nella cartella locale |
| `localFileHandleMap` | `var` | `new Map()` | Nomi file → `FileSystemFileHandle` |
| `keywordIndex` | `var` | `new Map()` | Indice keyword ARASAAC italiano (caricato da JSON) |
| `keywordEntries` | `var` | `new Set()` | Set di voci dell'indice keyword |
| `keywordIndexReady` | `var` | `false` | Flag di readiness dell'indice |
| `selectedTiles` | `var` | `new Set()` | Tile selezionate per operazione merge |
| `aborter` | `var` | `null` | `AbortController` corrente per richieste cancellabili |
| `openSymbolsToken` | `var` | `''` | Token API OpenSymbols |
| `els` | `var` | `{}` | Riferimenti DOM, popolato da `initApp()` in `app.js` |

## Strutture dati speciali

### `personalLibrary`

```js
const personalLibrary = (function(){ ... })();
// Tipo: { word: [ dataURL, dataURL, ... ], ... }
```

IIFE che carica `customSymbolImages` da localStorage. Oggetto parola → array di immagini data-URL.

### `fileInput`

```js
const fileInput = document.createElement('input');
// type="file", accept="image/*", hidden, appended to document.body
```

Elemento `<input>` nascosto usato da `openFileChooserForWord()` in `tiles.js`.

## Funzioni

### `qs(id)` → `Element`
Shortcut per `document.getElementById(id)`.

### `sanitizeWord(word)` → `string`
Rimuove articoli con apostrofo iniziale (`l'`, `un'`, ecc.), punteggiatura, e converte in minuscolo.

### `tokenize(text)` → `string[]`
Divide il testo in token non vuoti usando regex `/\S+/g`.

### `compressImage(blob, maxW, maxH, quality)` → `Promise<Blob>`
Comprime un'immagine usando canvas. Parametri di default: 512×512, qualità 0.7.

### `safeAsync(fn)` → `function`
Wrappa una funzione async in try/catch. Logga errori e mostra status.

### `cleanCache()`
Elimina le voci di cache più vecchie da localStorage (mantiene max 100 per tipo: `translation_*`, `synonyms_en_*`, `synonyms_it_*`).

### `savePersonalLibrary()`
Serializza `personalLibrary` in localStorage come `customSymbolImages`.

### `addPersonalSymbol(word, dataUrl)`
Aggiunge un'immagine data-URL al `personalLibrary[word]` e salva.

### `checkLocalFolderSelected()` → `boolean`
Ritorna `false` e mostra alert se nessuna cartella locale è selezionata.

### `depluralizeItalian(word)` → `string[]`
Genera possibili forme singolari di un sostantivo italiano (es. `'gatti' → ['gatto']`).

## Note per le modifiche

- **Aggiungere costanti**: metterle in questo file, nella sezione tematica appropriata.
- **Aggiungere stato globale**: dichiarare con `var` o `let` in questo file.
- **Non duplicare**: verificare sempre con grep che la variabile/funzione non esista già.
- `els` viene inizializzato **vuoto** qui; i valori sono assegnati in `initApp()` dentro `app.js`.
- **Logging**: usare `dbg(...)` per log di debug, mai `console.log` (tranne `console.error` per errori critici).
- **Chiavi localStorage**: aggiungere nuove chiavi a `STORAGE_KEYS` e usare la costante ovunque.
- **Placeholder SVG**: usare `SVG_ERROR`, `SVG_NOT_FOUND` o `SVG_UNKNOWN` invece di creare nuovi SVG inline.
