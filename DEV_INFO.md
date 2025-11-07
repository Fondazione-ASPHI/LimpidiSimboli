# 🏗️ Limpidi Simboli - Documentazione Tecnica

## 📐 Architettura del Progetto

### Struttura Directory
```
LimpidiSimboli/
├── index.html              # Entry point (versione originale monolitica)
├── modules/                # Moduli ES6 (nuova architettura)
│   ├── state.js           # Gestione stato centralizzato
│   ├── linguistics.js     # Analisi linguistica e morfologia
│   ├── storage.js         # localStorage e File System API
│   ├── api.js             # Chiamate API esterne
│   └── ui.js              # Gestione interfaccia utente
├── css/
│   └── styles.css         # Stili (da estrarre da index.html)
├── README.md              # Documentazione utente
├── DEV_INFO.md            # Questa documentazione
└── LICENSE                # Licenza MIT
```

---

## 🧩 Architettura Modulare

### Diagramma Flusso Dati
```
┌──────────────┐
│  index.html  │ (Entry Point)
└──────┬───────┘
       │
       ├──────> state.js      (Stato Centralizzato)
       │            ↑
       │            │ read/write
       │            ↓
       ├──────> storage.js    (Persistenza Dati)
       │            │
       │            │ fetch data
       │            ↓
       ├──────> api.js        (Chiamate Esterne)
       │            │
       │            │ analyze text
       │            ↓
       ├──────> linguistics.js (Analisi Linguistica)
       │            │
       │            │ render
       │            ↓
       └──────> ui.js          (Interfaccia Utente)
```

---

## 📦 Moduli Dettagliati

### 1. **state.js** - Gestione Stato Centralizzato

#### Responsabilità
- Centralizza tutte le variabili globali in un oggetto `state` unico
- Elimina variabili sparse nel codice originale
- Fornisce API per read/write dello stato

#### Struttura Stato
```javascript
export const state = {
  api: {
    openai: '',           // Chiave API OpenAI
    openSymbols: '',      // Token OpenSymbols
    google: {
      apiKey: '',         // Google API Key
      cx: ''              // Search Engine ID
    }
  },
  
  cache: {
    pictograms: Map,         // Cache ID pittogrammi
    pictogramDetails: Map,   // Cache dettagli (keywords)
    keywordIndex: Map,       // Indice parola → [id1, id2, ...]
    keywordEntries: Set,     // Set parole ARASAAC IT
    keywordIndexReady: false // Flag caricamento
  },
  
  storage: {
    localImageFolderHandle: null,  // Handle cartella locale
    localImageFiles: {},            // Cache file locali
    localFileHandleMap: Map        // Mappa ID → FileHandle
  },
  
  ui: {
    selectedTiles: Set,      // Tile selezionati
    aborter: AbortController, // Controllo annullamento
    elements: {}             // Riferimenti DOM
  },
  
  settings: {
    skipStopWords: true,
    showGrammarBadges: true,
    selectedVoice: '',
    language: 'it'
  }
};
```

#### API Pubbliche
```javascript
initializeState()           // Carica stato da localStorage
saveApiKey(type, value)     // Salva API key
saveSetting(key, value)     // Salva setting
cleanCache()                // Pulisce cache vecchie
resetState()                // Reset completo
```

---

### 2. **linguistics.js** - Analisi Linguistica

#### Responsabilità
- Tokenizzazione e sanitizzazione testo
- Generazione varianti morfologiche (italiano, spagnolo, inglese)
- Rilevamento tempo verbale
- Gestione pronomi e genere grammaticale

#### Funzioni Principali

##### Tokenizzazione
```javascript
tokenize(text: string): string[]
// Input:  "L'ho fatto ieri!"
// Output: ["L'ho", "fatto", "ieri!"]

sanitizeWord(word: string): string
// Input:  "L'ho"
// Output: "ho"
```

##### Varianti Morfologiche (Italiano)
```javascript
generateItalianVariants(term: string): string[]
// Input:  "farò"
// Output: ["farò", "fare"]  // Futuro → Infinito

// Input:  "mangiato"
// Output: ["mangiato", "mangiare", "mangiare", "mangiare"]

// Input:  "bambine"
// Output: ["bambine", "bambino", "bambina"]
```

**Copertura Morfologica:**
- ✅ Verbi irregolari (essere, avere, fare, andare, ...)
- ✅ Futuro semplice + futuro irregolare
- ✅ Participi passati (mangiato → mangiare)
- ✅ Gerundi (mangiando → mangiare)
- ✅ Presente indicativo (mangio → mangiare)
- ✅ Imperfetto (mangiavo → mangiare)
- ✅ Passato remoto (mangiai → mangiare)
- ✅ Plurali (bambini → bambino, bambina)
- ✅ Avverbi in -mente (velocemente → veloce)

##### Tempo Verbale
```javascript
detectTense(term: string, lang: string): 'past'|'present'|'future'|null
// Input:  ("farò", "it")
// Output: "future"

// Input:  ("mangiavo", "it")
// Output: "past"
```

##### Costanti
```javascript
STOP_WORDS.it       // Set di parole funzionali da ignorare
PRONOUNS.it         // Set di pronomi italiani
LOCAL_SYNONYMS_IT   // Mappa sinonimi locali
```

---

### 3. **storage.js** - Persistenza Dati

#### Responsabilità
- Gestione localStorage (cache, impostazioni, immagini personalizzate)
- File System Access API per immagini locali
- Compressione immagini
- Import/Export dati

#### localStorage

##### Schema Dati
```javascript
// API Keys
localStorage['openaiApiKey']        = 'sk-...'
localStorage['openSymbolsToken']    = 'token::...'
localStorage['googleApiKey']        = 'AIza...'
localStorage['googleCx']            = '...'

// Cache Traduzioni (max 100 elementi, poi FIFO)
localStorage['translation_it_en_cane'] = 'dog'
localStorage['translation_it_en_gatto'] = 'cat'

// Cache Sinonimi (max 100 elementi per lingua)
localStorage['synonyms_it_felice']  = '["contento","allegro","gioioso"]'
localStorage['synonyms_en_happy']   = '["joyful","glad","cheerful"]'

// Simboli Personalizzati
localStorage['customSymbolImages'] = '{
  "cane": ["data:image/png;base64,...", "local-file::cane_1.png"],
  "gatto": ["data:image/jpeg;base64,..."]
}'

// Settings
localStorage['selectedVoice']       = 'Google italiano'
localStorage['showGrammarBadges']   = 'true'
localStorage['localImageFolderName'] = 'LimpidiSimboli'
```

##### Gestione Quota localStorage
```javascript
saveCustomImages(customImages, currentWord)
// Strategia 1: Pulisce cache traduzioni/sinonimi
// Strategia 2: Rimuove immagini di altre parole (priorità a currentWord)
// Strategia 3: Suggerisce uso File System API
```

#### File System Access API

##### Workflow
```javascript
// 1. Selezione Cartella
const dirHandle = await selectLocalFolder();
// → Scansiona tutti i file immagine
// → Associa file a parole in base al nome

// 2. Salvataggio Immagine
const fileHandle = await saveImageToLocalFolder(imageData, 'cane');
// → Comprimi se necessario
// → Salva come: cane_ai_1699999999.png
// → Aggiorna cache localImageFiles

// 3. Caricamento Immagine
const file = await fileHandle.getFile();
const dataUrl = await readAsDataURL(file);
```

##### Compressione Immagini
```javascript
compressImage(file, maxWidth=800, maxHeight=800, quality=0.8)
// Canvas → ridimensiona → JPEG/PNG
// Logging: "150 KB → 45 KB (30%)"
```

---

### 4. **api.js** - Chiamate API Esterne

#### Responsabilità
- Interfaccia con API esterne (ARASAAC, OpenSymbols, OpenAI, LibreTranslate, Google, Wikipedia)
- Gestione timeout e retry
- Cache risposte

#### API Esterne

##### 1. ARASAAC
```javascript
// Ricerca pittogrammi
searchForIds(lang, term, signal): Promise<number[]>
// GET https://api.arasaac.org/api/pictograms/it/search/cane
// GET https://api.arasaac.org/api/pictograms/it/bestsearch/cane

// Dettagli pittogramma
fetchPictoDetail(lang, id, signal): Promise<{keywordsLower: string[]}>
// GET https://api.arasaac.org/api/pictograms/it/12345

// Indice keywords (solo IT)
loadKeywordIndexIT(signal): Promise<void>
// GET https://api.arasaac.org/api/keywords/it
// Popola: state.cache.keywordIndex, state.cache.keywordEntries
```

**Ottimizzazione Ricerca:**
```javascript
// Fase 1: Ricerca base
const ids1 = await searchForIds('it', 'cane');  // → [123, 456, 789]

// Fase 2: Filtra per relevance (keyword matching)
const scored = ids1.map(id => ({
  id,
  score: scoreWithKeywords(detail, 'cane', 'it')
}));

// Fase 3: Ordina e limita
return scored
  .filter(c => c.score >= 20)  // Solo match rilevanti
  .sort((a, b) => b.score - a.score)
  .slice(0, 5)
  .map(c => c.id);
```

**Scoring Keyword:**
```javascript
function scoreWithKeywords(detail, term, lang) {
  const kws = detail.keywordsLower;  // ["cane", "animale", "domestico"]
  const t = term.toLowerCase();       // "cane"
  let score = 0;

  if (kws.includes(t)) score += 100;          // Match esatto
  if (kws.some(k => k.startsWith(t))) score += 20;  // Prefisso
  if (kws.some(k => k.includes(t))) score += 5;     // Sottostringa

  // Eccezioni (es: "ora" → preferisci "orologio" su "tempo")
  if (lang === 'it' && t === 'ora') {
    if (kws.includes('orologio')) score += 40;
    if (kws.includes('tempo')) score += 30;
  }

  return score;
}
```

##### 2. OpenSymbols
```javascript
searchOpenSymbols(term, preTranslatedTerm): Promise<Object[]>
// GET https://www.opensymbols.org/api/v2/symbols?q=dog&access_token=...

// Filtra risultati:
// 1. Rimuovi ARASAAC (già cercato)
// 2. Filtra per relevance (nome contiene sinonimi)
// 3. Deduplicazione per image_url
```

##### 3. OpenAI

**Analisi Frase (GPT-4)**
```javascript
analyzeSentence(text, lang): Promise<Object[]|null>
// Model: gpt-4o
// Timeout: 5000ms

// Input: "Farò una grande festa"
// Output: [
//   { lemma: 'fare', pronome: 'io', tempo: 'futuro' },
//   { lemma: 'null' },  // articolo
//   { lemma: 'grande', genere: 'femminile', numero: 'singolare' },
//   { lemma: 'festa', genere: 'femminile', numero: 'singolare' }
// ]
```

**Sinonimi (GPT-4 Mini)**
```javascript
getItalianSynonyms(word): Promise<string[]>
// Model: gpt-4o-mini
// Temperature: 0.3
// Max tokens: 50

// Input: "felice"
// Output: ["felice", "contento", "allegro", "gioioso", "lieto"]
```

**Generazione Immagini (DALL-E 3)**
```javascript
generateArasaacStyleImages(prompt, count=1): Promise<string[]>
// Model: dall-e-3
// Size: 1024x1024
// Quality: standard
// Format: b64_json

// Prompt ottimizzato:
// "Create a simple, colorful children's book illustration for: [prompt].
//  STYLE: COLORFUL, SIMPLE, flat colors, cartoon style, WHITE BACKGROUND,
//  CENTERED, NO TEXT"

// Output: ["data:image/png;base64,..."]
```

##### 4. LibreTranslate
```javascript
translateItToEn(text): Promise<string>
// POST https://libretranslate.de/translate
// Body: { q: "cane", source: "it", target: "en", format: "text" }
// Output: "dog"

// Cache: localStorage['translation_it_en_cane'] = "dog"
```

##### 5. Google Custom Search
```javascript
searchGoogleImages(query): Promise<Object[]>
// GET https://www.googleapis.com/customsearch/v1
//     ?key=...&cx=...&q=cane&searchType=image&num=10

// Limit: 100 ricerche/giorno (quota gratuita)
```

##### 6. Wikipedia/Wikimedia Commons
```javascript
searchWikipediaImages(query): Promise<Object[]>
// GET https://it.wikipedia.org/w/api.php
//     ?action=query&generator=search&gsrsearch=cane
//     &prop=pageimages&piprop=thumbnail&pithumbsize=300

// Illimitato, gratuito
```

---

### 5. **ui.js** - Interfaccia Utente

#### Responsabilità
- Gestione elementi DOM
- Rendering tile pittogrammi
- Modal e gallery
- Status messages
- Sintesi vocale

#### Workflow Principale

##### 1. Inizializzazione
```javascript
initUI()
// → Ottiene riferimenti a tutti gli elementi DOM
// → Salva in state.ui.elements
```

##### 2. Traduzione Frase (Main Flow)
```javascript
async function translate() {
  // 1. Tokenizzazione
  const tokens = tokenize(text);
  const rawWords = tokens.map(sanitizeWord);

  // 2. Analisi GPT (opzionale)
  const groups = await analyzeSentence(text, lang);

  // 3. Loop parole
  for (let idx = 0; idx < groups.length; idx++) {
    // 3a. Tenta locuzioni (3 parole, poi 2 parole)
    let phrase = null;
    for (let len of [3, 2]) {
      const candidateTerm = rawWords.slice(idx, idx + len).join(' ');
      if (keywordEntries.has(candidateTerm)) {
        const ids = await queryIds(lang, candidateTerm);
        if (ids.length) {
          phrase = { len, ids };
          break;
        }
      }
    }

    // 3b. Se locuzione trovata, usa quella
    let len = phrase ? phrase.len : 1;
    let ids = phrase ? phrase.ids : await queryIds(lang, rawWords[idx]);

    // 3c. Estrai badge grammaticali
    const badges = extractBadges(groups[idx]);
    const tense = detectTense(rawWords[idx], lang);

    // 3d. Crea tile
    await addTile(ids, rawWords[idx], false, tense, badges);

    // 3e. Salta parole coperte da locuzione
    idx += len - 1;
  }
}
```

##### 3. Creazione Tile
```javascript
async function addTile(ids, word, skipped, tense, badges, highlight, insertBefore) {
  // 1. Crea elemento <div class="tile">
  const tile = document.createElement('div');
  tile.className = 'tile';
  if (highlight) tile.classList.add('inserted');

  // 2. Priorità immagini:
  //    a) Immagini personalizzate (localStorage)
  //    b) File cartella locale
  //    c) ID ARASAAC/OpenSymbols

  // 3. Crea struttura:
  //    <div class="tile">
  //      <img src="..." />                  (pittogramma)
  //      <div class="word">cane</div>       (etichetta)
  //      <div class="badges">...</div>      (tempo, genere, numero)
  //      <button class="add-symbol-btn">+</button>
  //      <button class="abc-btn">abc</button>
  //      <button class="gpt-symbol-btn">✨</button>
  //      <button class="gpt-symbol-btn">W</button>
  //      <button class="gpt-symbol-btn">G</button>
  //      <button class="gpt-symbol-btn">🔎</button>
  //    </div>

  // 4. Event listeners:
  tile.addEventListener('click', () => cycleTileImage(tile));
  tile.addEventListener('click', (e) => {
    if (e.ctrlKey) toggleTileSelection(tile);
  });

  // 5. Inserisci nel DOM
  els.result.appendChild(tile);
}
```

##### 4. Badge Grammaticali
```javascript
// Emoji per badge
BADGE_SYMBOLS = {
  past: '⏪',
  present: '▶️',
  future: '⏩',
  singolare: '1️⃣',
  plurale: '➕'
};

// Badge HTML
<div class="badges">
  <div class="badge">
    <span>⏩</span>
    <span>futuro</span>
  </div>
  <div class="badge">
    <img src="https://static.arasaac.org/pictograms/123/123_500.png" />
    <span>io</span>
  </div>
</div>
```

##### 5. Modale & Gallery
```javascript
// Modale Settings
showSettingsModal()
// → Overlay scuro
// → Modal centrato
// → Inputs per API keys
// → Lista simboli personalizzati

// Gallery Simboli
showSymbolGallery(symbolIds, searchTerm, targetTile, targetWord)
// → Grid 2 colonne
// → Click su immagine → salva in customImages + aggiorna tile
```

##### 6. Crop Editor
```javascript
openCropEditor(imageDataUrl, word, tile)
// → Canvas HTML5
// → Mouse drag per selezionare area
// → Bottone "Ritaglia e Salva"
// → Crea nuovo canvas con area selezionata
// → Salva in cartella locale
```

---

## 🔄 Flussi Dati Completi

### Flusso 1: Ricerca Simbolo Singola Parola

```
User Input: "cane"
     ↓
tokenize() → ["cane"]
     ↓
sanitizeWord() → "cane"
     ↓
queryIds("it", "cane")  ←──────────┐
     ↓                               │
[Fase 1] Ricerca ITA base            │ Retry con
  ├─ searchForIds("it", "cane")      │ varianti
  ├─ generateItalianVariants("cane") │ morfologiche
  └─ → [123, 456]                    │
     ↓                               │
[Fase 2] Traduzione + Sinonimi      │
  ├─ translateItToEn("cane") → "dog" │
  ├─ getItalianSynonyms("cane")      │
  │    → ["cane", "cagnolino"]       │
  ├─ getEnglishSynonyms("dog")       │
  │    → ["dog", "puppy", "hound"]   │
  └─ searchForIds per ogni sinonimo  │
     ↓                               │
[Fase 3] OpenSymbols                 │
  └─ searchOpenSymbols("cane") ──────┘
     ↓
Merge risultati + deduplicazione
     ↓
return {
  arasaacIds: [123, 456, 789],
  openSymbols: [{url:..., repo:'tawasol'}, ...]
}
     ↓
addTile([123, 456, 789, ...], "cane")
     ↓
Render tile con immagine + click handlers
```

### Flusso 2: Analisi Frase con GPT

```
User Input: "Farò una grande festa"
     ↓
analyzeSentence("Farò una grande festa", "it")
     ↓
OpenAI GPT-4 Request
     ↓
GPT Response:
  "lemma:fare|pronome_soggetto:io|tempo:futuro
   lemma:null
   lemma:grande|genere:femminile|numero:singolare
   lemma:festa|genere:femminile|numero:singolare"
     ↓
Parse e struttura:
[
  { lemma: 'fare', pronome: 'io', tempo: 'futuro' },
  { lemma: 'null' },
  { lemma: 'grande', genere: 'femminile', numero: 'singolare' },
  { lemma: 'festa', genere: 'femminile', numero: 'singolare' }
]
     ↓
Per ogni gruppo:
  - Estrai badge (pronome, genere, numero)
  - Rileva tempo verbale (euristiche locali)
  - Cerca simboli per lemma
  - Crea tile con badge
```

### Flusso 3: Generazione Immagine AI

```
User Click: Bottone "✨" su tile "cane"
     ↓
checkLocalFolderSelected() → true?
     ↓
prompt = user input ("un cane felice che corre")
     ↓
generateArasaacStyleImages(prompt, 1)
     ↓
OpenAI DALL-E 3 Request:
  Prompt: "Create a simple, colorful children's book
           illustration for: un cane felice che corre.
           STYLE: flat colors, cartoon, white background..."
  Model: dall-e-3
  Size: 1024x1024
     ↓
Response: base64 image
     ↓
Preview Modal:
  - Mostra immagine
  - Bottoni: [✂️ Ritaglia] [Usa] [Annulla]
     ↓
User Click: "Usa questa immagine"
     ↓
saveImageToLocalFolder(base64Data, "cane")
  → Comprimi se necessario
  → Salva: cane_ai_1699999999.png
  → Genera ID: "local-file::cane_ai_1699999999.png"
  → Salva FileHandle in localFileHandleMap
     ↓
Aggiorna tile:
  - Aggiungi ID a tile.dataset.ids (all'inizio)
  - tile.dataset.index = "0"
  - setImageForTile() → carica da FileHandle
     ↓
Salva associazione in localStorage:
  customSymbolImages["cane"].push("local-file::...")
```

---

## 🎯 Pattern e Best Practices

### 1. Cache Multi-Livello
```javascript
// Level 1: In-Memory Map (velocissima)
state.cache.pictogramDetails.get(`${lang}|${id}`)

// Level 2: localStorage (persistente, ~5MB)
localStorage.getItem('translation_it_en_cane')

// Level 3: File System API (persistente, illimitato)
localFileHandleMap.get('local-file::cane_1.png')
```

### 2. Parallel Requests con Backpressure
```javascript
// ❌ Male: 100 richieste in parallelo (rate limit)
const promises = synonyms.map(syn => searchForIds(lang, syn));
await Promise.all(promises);

// ✅ Bene: Batch di 10 richieste
const batchSize = 10;
for (let i = 0; i < synonyms.length; i += batchSize) {
  const batch = synonyms.slice(i, i + batchSize);
  const results = await Promise.all(
    batch.map(syn => searchForIds(lang, syn))
  );
}
```

### 3. AbortController per Timeout
```javascript
const aborter = new AbortController();
setTimeout(() => aborter.abort(), 5000);

fetch(url, { signal: aborter.signal })
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('Request aborted');
    }
  });
```

### 4. CORS Proxy Fallback
```javascript
const corsProxies = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest='
];

for (const proxy of corsProxies) {
  try {
    const response = await fetch(proxy + encodeURIComponent(imageUrl));
    if (response.ok) return await response.blob();
  } catch (e) {
    continue; // Prova prossimo proxy
  }
}
```

### 5. Deduplicazione Simboli
```javascript
// Usa Map per deduplicare per chiave univoca
const uniqueMap = new Map();
symbols.forEach(s => {
  const key = s.image_url || s.symbol_key || s.id;
  if (!uniqueMap.has(key)) {
    uniqueMap.set(key, s);
  }
});
return Array.from(uniqueMap.values());
```

### 6. Gestione Quota localStorage
```javascript
try {
  localStorage.setItem(key, value);
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    // Strategia 1: Pulisci cache vecchie
    cleanCache();
    
    // Strategia 2: Rimuovi elementi meno recenti
    const toRemove = keys.slice(0, keys.length - 100);
    toRemove.forEach(k => localStorage.removeItem(k));
    
    // Retry
    localStorage.setItem(key, value);
  }
}
```

---

## 🧪 Testing (TODO)

### Unit Tests
```javascript
// linguistics.js
describe('sanitizeWord', () => {
  it("rimuove apostrofi articoli", () => {
    expect(sanitizeWord("l'ho")).toBe("ho");
    expect(sanitizeWord("dell'albero")).toBe("albero");
  });
});

describe('generateItalianVariants', () => {
  it("converte futuro in infinito", () => {
    const variants = generateItalianVariants("farò");
    expect(variants).toContain("fare");
  });
  
  it("gestisce verbi irregolari", () => {
    const variants = generateItalianVariants("ho");
    expect(variants).toContain("avere");
  });
});
```

### Integration Tests
```javascript
// api.js
describe('searchForIds', () => {
  it("trova pittogrammi per parola comune", async () => {
    const ids = await searchForIds('it', 'cane');
    expect(ids.length).toBeGreaterThan(0);
  });
});
```

---

## 📊 Performance

### Metriche Target
- ⏱️ **Tempo ricerca singola parola:** < 500ms (con cache)
- ⏱️ **Tempo ricerca singola parola:** < 2000ms (senza cache)
- ⏱️ **Tempo traduzione frase 10 parole:** < 5s
- 💾 **Dimensione cache localStorage:** < 5MB
- 💾 **Dimensione singola immagine compressa:** < 100KB

### Ottimizzazioni Implementate
1. ✅ **Cache multi-livello** (Memory → localStorage → Filesystem)
2. ✅ **Ricerche parallele** con batch di 10
3. ✅ **Deduplicazione simboli** (Map per chiave univoca)
4. ✅ **Compressione immagini** (800x800, quality 0.8)
5. ✅ **Lazy loading indice keywords** (solo per IT)
6. ✅ **AbortController** per timeout richieste
7. ✅ **Scoring keyword** per filtrare risultati non rilevanti

---

## 🚀 Roadmap Futuri Sviluppi

### v2.0 - Architettura Completa Modulare
- [ ] Migrazione completa codice da index.html a moduli
- [ ] TypeScript per type safety
- [ ] Build con Vite/esbuild
- [ ] Service Worker per PWA

### v2.1 - Testing
- [ ] Unit tests con Vitest
- [ ] Integration tests API
- [ ] E2E tests con Playwright

### v2.2 - Funzionalità Avanzate
- [ ] Supporto locuzioni composite (ML-based)
- [ ] Predizione next word
- [ ] Export PDF/PNG frase completa
- [ ] Condivisione frasi via URL

### v2.3 - Performance
- [ ] IndexedDB per keyword index (sostituire localStorage)
- [ ] Web Workers per analisi linguistica
- [ ] Virtual scrolling per gallerie grandi
- [ ] Lazy loading immagini

---

## 🤝 Contribuire

### Setup Ambiente Dev
```bash
git clone https://github.com/Fondazione-ASPHI/LimpidiSimboli.git
cd LimpidiSimboli

# Apri index.html nel browser
# (Nessun build step richiesto per versione corrente)
```

### Convenzioni Codice
- **Commenti:** JSDoc per funzioni pubbliche
- **Nomi variabili:** camelCase
- **Nomi costanti:** UPPER_SNAKE_CASE
- **Moduli:** export named, non default
- **Async:** preferire async/await a .then()

### Pull Request
1. Fork repo
2. Crea branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Apri Pull Request su GitHub

---

## 📞 Contatti Sviluppo

**Maintainer:** Fondazione ASPHI Onlus  
**Email:** dev@asphi.it  
**GitHub:** https://github.com/Fondazione-ASPHI/LimpidiSimboli

---

**Ultima modifica:** 2024-11-07  
**Versione:** 2.0 (Modularizzata)
