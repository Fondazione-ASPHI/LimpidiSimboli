# 🔄 Guida alla Migrazione Modulare

## Stato Attuale

### ✅ Completato
- **Moduli ES6 creati**:
  - `modules/state.js` - Gestione stato centralizzato
  - `modules/linguistics.js` - Analisi linguistica
  - `modules/storage.js` - localStorage + File System API
  - `modules/api.js` - Chiamate API esterne
  - `modules/ui.js` - Helper UI
- **CSS estratto**: `css/styles.css`
- **Documentazione**:
  - `README.md` - Guida utente
  - `DEV_INFO.md` - Documentazione tecnica

### ⏳ Parzialmente Completato
- `index.html` - CSS estratto, ma JavaScript ancora inline (4457 righe)

### ❌ Da Completare
- **Refactoring completo di index.html** per usare i moduli ES6
- **Testing** della versione modulare

---

## 📋 Prossimi Passi per Completare la Migrazione

### Opzione A: Refactoring Incrementale di index.html (Consigliato)

Questo approccio mantiene il codice originale funzionante mentre si migra gradualmente:

#### Fase 1: Creare main.js con Import Moduli
```javascript
// main.js
import { state, initializeState, saveApiKey, saveSetting } from './modules/state.js';
import { 
  tokenize, 
  sanitizeWord, 
  generateItalianVariants,
  generateSpanishVariants,
  generateEnglishVariants,
  detectTense,
  STOP_WORDS
} from './modules/linguistics.js';
import { 
  saveCustomImages, 
  selectLocalFolder,
  saveImageToLocalFolder,
  compressImage
} from './modules/storage.js';
import { 
  searchForIds, 
  searchOpenSymbols,
  analyzeSentence,
  getItalianSynonyms,
  getEnglishSynonyms,
  translateItToEn,
  generateArasaacStyleImages
} from './modules/api.js';
import { 
  setStatus, 
  initUI, 
  getElements,
  showTextOnly,
  toggleTileSelection
} from './modules/ui.js';

// Inizializza
initializeState();
initUI();

// Resto del codice applicazione...
```

#### Fase 2: Modificare index.html
Sostituire il tag `<script>` con:
```html
<script type="module" src="main.js"></script>
```

#### Fase 3: Migrare Funzioni Principali
Nel file `main.js`, aggiungere le funzioni principali ancora presenti in index.html:

1. **translate()** - Funzione principale di traduzione
2. **addTile()** - Creazione tile pittogrammi
3. **queryIds()** - Ricerca pittogrammi con logica completa
4. **cycleTileImage()** - Ciclo tra immagini alternative
5. **openCropEditor()** - Editor ritaglio immagini
6. **showSymbolGallery()** - Mostra gallery simboli
7. **mergeSelectedTiles()** - Unione simboli selezionati
8. **Event handlers** - Tutti i listener bottoni e modali

### Opzione B: Creare Nuova Versione (index-modular.html)

Creare una nuova versione da zero usando i moduli, mantenendo l'originale intatto:

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Limpidi Simboli – Fondazione ASPHI Onlus</title>
  <link rel="stylesheet" href="css/styles.css" />
</head>
<body>
  <!-- HTML struttura identica a index.html -->
  <!-- ... -->
  
  <script type="module" src="main.js"></script>
</body>
</html>
```

---

## 🎯 Funzioni Principali da Migrare in main.js

### 1. translate() - Funzione Principale
**Posizione originale**: index.html, ~riga 2500  
**Dipendenze**: state, linguistics, api, ui  
**Priorità**: ALTA

### 2. queryIds() - Ricerca Pittogrammi
**Posizione originale**: index.html, ~riga 1800  
**Dipendenze**: state, api, linguistics  
**Priorità**: ALTA

### 3. addTile() - Rendering Tile
**Posizione originale**: index.html, ~riga 2000  
**Dipendenze**: state, ui, storage  
**Priorità**: ALTA

### 4. cycleTileImage() - Ciclo Immagini
**Posizione originale**: index.html, ~riga 3200  
**Dipendenze**: state, storage  
**Priorità**: MEDIA

### 5. openCropEditor() - Editor Immagini
**Posizione originale**: index.html, ~riga 3800  
**Dipendenze**: state, storage  
**Priorità**: MEDIA

### 6. showSymbolGallery() - Gallery Modale
**Posizione originale**: index.html, ~riga 3500  
**Dipendenze**: state, ui, api  
**Priorità**: MEDIA

### 7. Event Listeners
**Posizione originale**: index.html, ~riga 4200-4400  
**Priorità**: ALTA

```javascript
// Esempio struttura event listeners in main.js
document.addEventListener('DOMContentLoaded', () => {
  const els = getElements();
  
  els.btn.addEventListener('click', translate);
  els.clear.addEventListener('click', () => {
    els.res.innerHTML = '';
    setStatus('');
  });
  els.speak.addEventListener('click', speakResults);
  // ... altri listener
});
```

---

## 🔧 Comandi per Testing

### 1. Avviare Server Locale
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server -p 8000

# VS Code Live Server
# Right-click su index.html → "Open with Live Server"
```

### 2. Aprire Browser
```
http://localhost:8000/index.html
```

### 3. Verificare Console
- Aprire DevTools (F12)
- Tab "Console" per vedere log import moduli
- Tab "Network" per verificare caricamento moduli

---

## ⚠️ Problemi Comuni

### CORS Error con ES6 Modules
**Errore**: `Access to script at 'file:///.../main.js' has been blocked by CORS policy`  
**Soluzione**: DEVE usare un server HTTP locale (vedi comandi sopra)

### Module Not Found
**Errore**: `Failed to load module script: Expected a JavaScript module script`  
**Soluzione**: 
- Verificare che `<script type="module">`
- Verificare percorsi relativi corretti (`./modules/...`)

### Export/Import Mismatch
**Errore**: `Uncaught SyntaxError: The requested module does not provide an export named 'X'`  
**Soluzione**: Verificare che nome export in modulo corrisponda a nome import

---

## 📊 Stima Completamento

| Task | Ore Stimate | Difficoltà |
|------|-------------|-----------|
| Creare main.js con import | 1h | Bassa |
| Migrare translate() | 2h | Media |
| Migrare queryIds() + addTile() | 3h | Alta |
| Migrare event handlers | 2h | Media |
| Migrare modali e gallery | 2h | Media |
| Testing completo | 3h | Media |
| **TOTALE** | **13h** | |

---

## 🚀 Quick Start (Per Continuare Ora)

### Step 1: Creare main.js Base
```bash
cd /d C:\Users\ALE\REPO\LimpidiSimboli
# Creare file main.js con import base
```

### Step 2: Copiare Funzioni Critiche
Dal codice originale index.html, copiare in main.js:
1. Funzione `translate()` (inizia ~riga 2500)
2. Funzione `queryIds()` (inizia ~riga 1800)
3. Funzione `addTile()` (inizia ~riga 2000)

### Step 3: Adattare Riferimenti
- Sostituire variabili globali con `state.api.openai`, `state.cache.pictograms`, ecc.
- Usare funzioni importate dai moduli invece di inline

### Step 4: Modificare index.html
Sostituire tutto il tag `<script>...</script>` con:
```html
<script type="module" src="main.js"></script>
```

### Step 5: Test
```bash
python -m http.server 8000
# Apri http://localhost:8000/index.html
```

---

## 📝 Note Tecniche

### Differenze Variabili Globali → State
```javascript
// ❌ PRIMA (globale)
let openaiApiKey = '';
let pictogramCache = new Map();

// ✅ DOPO (modulo state.js)
import { state } from './modules/state.js';
state.api.openai
state.cache.pictograms
```

### Gestione AbortController
```javascript
// Ora centralizzato in state
import { state } from './modules/state.js';

function translate() {
  // Cancella ricerca precedente
  if (state.ui.aborter) {
    state.ui.aborter.abort();
  }
  state.ui.aborter = new AbortController();
  // Usa state.ui.aborter.signal nelle fetch
}
```

---

## 🎓 Risorse

- **ES6 Modules**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- **Import/Export**: https://javascript.info/import-export
- **File System Access API**: https://web.dev/file-system-access/

---

**Creato**: 2024-11-07  
**Ultimo aggiornamento**: 2024-11-07  
**Versione**: 1.0
