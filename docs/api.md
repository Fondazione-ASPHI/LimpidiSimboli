# js/api.js — Chiamate API esterne

**Righe:** ~1066 | **Dipendenze:** `utils.js`, `i18n.js`, `variants.js`

## Responsabilità

- Tutte le interazioni con servizi esterni (ARASAAC, OpenSymbols, OpenAI, LibreTranslate, Google, Wikipedia).
- Gestione cache per ridurre chiamate ripetute.
- Ricerca e scoring dei pittogrammi.

## Funzioni

### Gestione simboli personalizzati

#### `saveCustomImages(customImages, currentWord)` → `{success: boolean}`
Salva `customSymbolImages` in localStorage con gestione intelligente della quota:
1. Tenta il salvataggio diretto.
2. Se `QuotaExceededError`: pulisce cache traduzioni/sinonimi.
3. Se ancora pieno: comprime le immagini più grandi.
4. Ultimo resort: rimuove le parole con più immagini.

### Traduzione

#### `translateItToEn(text, lang, signal)` → `Promise<string>`
Traduce testo da IT a EN tramite LibreTranslate. Cache in localStorage con chiave `translation_{hash}`. Timeout: 8 secondi.

### Sinonimi

#### `getEnglishSynonyms(word, signal)` → `Promise<string[]>`
Recupera sinonimi inglesi tramite GPT-4o-mini. Cache in localStorage (`synonyms_en_{word}`). Max 6 sinonimi.

#### `getItalianSynonyms(word, signal)` → `Promise<string[]>`
Recupera sinonimi italiani tramite GPT-4o-mini. Cache in localStorage (`synonyms_it_{word}`). Aggiunge anche `LOCAL_SYNONYMS_IT`.

### Ricerca OpenSymbols

#### `searchOpenSymbols(term, lang, signal)` → `Promise<Array>`
Cerca simboli via OpenSymbols v2 API:
- Usa CORS proxy (`corsproxy.io`).
- Filtra risultati ARASAAC duplicati.
- Ritorna array di oggetti `{id, image_url, label, extension, license, source_url}`.

### Indice keyword ARASAAC

#### `loadKeywordIndexIT()`
Carica l'indice keyword italiano (~15 MB JSON) da ARASAAC:
- URL: `https://static.arasaac.org/pictograms/keywords_IT.json`
- Popola `keywordIndex` (Map) e `keywordEntries` (array).
- Imposta `keywordIndexReady = true`.

#### `getKeywordCandidatesIT(term)` → `Array<{id, keywords}>`
Cerca nell'indice keyword locale usando ricerca binaria + varianti morfologiche. Ritorna candidati con match esatto o parziale.

### Dettagli pittogrammi

#### `fetchPictoDetail(id, lang, signal)` → `Promise<Object>`
Recupera i dettagli di un pittogramma ARASAAC (keywords, categories, tags). Cache in `pictoDetailCache`.

#### `scoreWithKeywords(id, searchTerm, lang, signal)` → `Promise<number>`
Calcola un punteggio di rilevanza 0–100 per un pittogramma rispetto a un termine di ricerca, basato sulla corrispondenza delle keyword.

### Ricerca principale

#### `queryFirstId(term, lang, signal)` → `Promise<number|null>`
Ritorna il primo ID ARASAAC per un termine. Usa ricerca diretta API.

#### `searchForIds(term, lang, signal)` → `Promise<Array<number>>`
Ricerca multipla ARASAAC con varianti morfologiche. Ritorna array di ID ordinati per rilevanza.

#### `queryIds(word, original, lang, signal)` → `Promise<Array>`
**Funzione di ricerca principale a 3 fasi parallele:**
1. **ARASAAC** (ricerca diretta + keyword index + varianti).
2. **Sinonimi** (traduzione IT→EN + sinonimi EN + sinonimi IT).
3. **OpenSymbols** (se token disponibile).

Ritorna array misto: `[numericId, numericId, {opensymbols_obj}, ...]`.

### Spiegazioni GPT

#### `openExplanationsDB()` → `Promise<IDBDatabase>`
Apre/crea IndexedDB `ExplanationsDB` con store `explanations`.

#### `getCachedExplanation(db, key)` → `Promise<string|null>`
Legge una spiegazione dalla cache IndexedDB.

#### `cacheExplanation(db, key, text)`
Scrive una spiegazione nella cache IndexedDB.

#### `explainTerm(term, sentence, lang, signal)` → `Promise<string>`
Chiama GPT-4o per una spiegazione accessibile di un termine nel contesto di una frase:
- Cache in IndexedDB.
- Prompt specifico per spiegazioni semplici (livello A1-A2).
- Ritorna HTML (dal Markdown convertito).

### Analisi frasi

#### `analyzeSentence(sentence, lang, signal)` → `Promise<Array>`
Chiama GPT-4o per l'analisi grammaticale di una frase:
- Ritorna array: `[{original, lemma, pronoun, tense, multiword, combined}]`.
- Il prompt chiede di preservare l'ordine originale dei token.
- Gestisce frasi multi-parola (es. "a casa" → una singola unità).

### Rilevamento tempo verbale

#### `detectTense(word, lang)` → `string|null`
Rilevamento euristico del tempo verbale basato su suffissi italiani (non usa API).

#### `getTenseBadge(tense)` → `string`
Ritorna l'HTML del badge grammaticale per un tempo verbale.

### Generazione immagini

#### `generateArasaacStyleImages(word, lang, signal)` → `Promise<string|null>`
Genera un'immagine tramite DALL-E 3 con prompt in stile ARASAAC:
- Dimensione: 1024×1024.
- Sfondo bianco, contorno nero.
- Ritorna data-URL dell'immagine generata.

## Struttura del cache

```
localStorage:
  translation_{hash}     → testo tradotto
  synonyms_en_{word}     → JSON array sinonimi
  synonyms_it_{word}     → JSON array sinonimi

IndexedDB (ExplanationsDB):
  store "explanations"
    key: "{lang}:{term}:{sentence_hash}"
    value: { text: "...", ts: timestamp }

Memoria (oggetti globali):
  cache[url]             → risposta API generica
  pictoDetailCache[id]   → dettagli pittogramma
```

## Note per le modifiche

- Ogni nuova chiamata API va in questo file.
- Implementare sempre una strategia di cache.
- Usare `aborter.signal` per richieste cancellabili.
- Gestire `QuotaExceededError` per localStorage.
- I CORS proxy possono smettere di funzionare; la lista è in `tiles.js` (`saveWebImageToTile`).
