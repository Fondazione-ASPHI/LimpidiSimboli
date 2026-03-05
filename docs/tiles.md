# js/tiles.js — Creazione e gestione tile

**Righe:** ~1588 | **Dipendenze:** `utils.js`, `i18n.js`, `api.js`, `storage.js`, `cropEditor.js`

## Responsabilità

- Creazione di tile (schede simbolo) con immagine, etichetta e pulsanti d'azione.
- Gestione galleria di alternative (ARASAAC, OpenSymbols, Wikipedia, Google) tramite modal unificato.
- Operazione merge (unione) di tile selezionate.

> **Nota:** l'editor di ritaglio (crop) è stato spostato in `cropEditor.js`. La funzione `openCropEditor()` è chiamata dai pulsanti d'azione ma definita in quel file.

## Struttura di una tile

Ogni tile è un `<div class="tile">` con questa struttura HTML:

```html
<div class="tile"
     data-word="gatto"
     data-original="gatto"
     data-ids='[12345, 67890, {"image_url":"...","source":"opensymbols"}]'
     data-idx="0"
     data-sentence-idx="0"
     data-tense="present">
  <img src="https://static.arasaac.org/pictograms/12345/12345_500.png"
       alt="gatto" loading="lazy" />
  <div class="word">gatto</div>
  <div class="badges">
    <span class="badge">🕐 Presente</span>
  </div>
  <div class="tile-actions">
    <!-- Pulsanti d'azione (visibili solo con toggle) -->
  </div>
</div>
```

### Attributi `data-*`

| Attributo | Tipo | Descrizione |
|-----------|------|-------------|
| `data-word` | string | Parola normalizzata (lemma o sanitizzata) |
| `data-original` | string | Parola originale dalla frase |
| `data-ids` | JSON array | Array di ID alternativi (vedi sotto) |
| `data-idx` | number | Indice dell'immagine corrente in `data-ids` |
| `data-sentence-idx` | number | Indice della frase di appartenenza |
| `data-tense` | string | Tempo verbale rilevato (opzionale) |

### Formato di `data-ids`

L'array può contenere tipi misti:

```js
[
  12345,                                    // ID numerico ARASAAC
  67890,                                    // Altro ID ARASAAC
  { image_url: "...", source: "opensymbols", label: "cat" },  // OpenSymbols
  "local-file:gatto_custom.png",            // File locale
  "data:image/png;base64,..."               // Immagine data-URL
]
```

## Funzioni

### Visualizzazione tile

#### `showTextOnly(tile, word)`
Nasconde l'immagine e ingrandisce l'etichetta testuale.

#### `showSymbolMode(tile)`
Ripristina la visualizzazione con simbolo/immagine.

#### `setImageForTile(tile, ids, idx)`
Imposta l'immagine della tile in base al tipo di ID:
- **Numerico** (ARASAAC): `STATIC_ROOT/{id}/{id}_500.png`.
- **Oggetto OpenSymbols**: `image_url` dall'oggetto.
- **`local-file:`**: carica dal `localFileHandleMap`.
- **`data:`**: imposta direttamente come `src`.

#### `renderOpenSymbolsAlternatives(tile, osResults)`
Aggiunge una sezione di alternative OpenSymbols sotto l'immagine principale.

### Navigazione immagini

#### `cycleTileImage(tile)`
Avanza all'immagine successiva ciclicamente in `data-ids`.

#### `openFileChooserForWord(tile, word)`
Apre il selettore file per caricare un'immagine personalizzata:
1. L'utente seleziona un'immagine.
2. L'immagine viene compressa con `compressImage()`.
3. Viene salvata nella cartella locale con `saveImageToLocalFolder()`.
4. Viene aggiunta a `personalLibrary` con `addPersonalSymbol()`.
5. La tile viene aggiornata con la nuova immagine.

### Creazione tile

#### `addTile(container, word, original, ids, sentenceIdx, gptData)` ★
**Funzione principale** (~150 righe, semplificata dal refactoring). Crea una tile completa:

1. **Immagine**: cerca prima nella `personalLibrary`, poi tra gli `ids`.
2. **Badge grammaticali**: delega a `createTileBadges()`.
3. **Pulsanti d'azione**: delega a `createTileActionButtons()`.
4. **Click sull'immagine**: `cycleTileImage()`.

#### `createTileBadges(tile, tense, badges)`
Helper estratto da `addTile()`. Crea i badge grammaticali (tempo verbale, genere, numero) e li appende alla tile.

#### `createTileActionButtons(tile, word)`
Helper estratto da `addTile()`. Crea tutti i pulsanti d'azione della tile:
   - ➕ **Aggiungi immagine**: `openFileChooserForWord()`
   - ➖ **Rimuovi immagine**: elimina l'immagine corrente
   - 🔤 **Solo testo**: `showTextOnly()`
   - ◀▶ **Naviga**: `cycleTileImage()` / galleria
   - 🔍 **Cerca**: `showSymbolGallery()`
   - 📖 **Wikipedia**: `searchWebImages()`
   - 🌐 **Google**: `searchGoogleImages()`
   - 🤖 **GPT/DALL-E**: `generateArasaacStyleImages()`
   - ✂️ **Ritaglia**: `openCropEditor()` (da `cropEditor.js`)
   - 🔗 **Unisci**: `toggleTileSelection()`
   - ℹ️ **Spiega**: `explainTerm()`

### Modal di ricerca unificato

#### `openSearchModal(options)`
Modal generico a griglia per la ricerca di immagini alternative. Sostituisce il codice duplicato che era presente in `showSymbolGallery`, `searchWebImages` e `searchGoogleImages`.

| Opzione | Tipo | Descrizione |
|---------|------|-------------|
| `title` | string | Titolo del modal |
| `items` | Array | Immagini da mostrare |
| `onSelect` | Function | Callback alla selezione di un'immagine |
| `tile` | Element | Tile di destinazione |
| `word` | string | Parola associata |

### Gallerie di ricerca

#### `showSymbolGallery(tile, word)`
Modal con griglia di alternative ARASAAC e OpenSymbols. L'utente clicca per selezionare.

#### `searchWebImages(tile, word)`
Cerca immagini su Wikipedia API e Wikimedia Commons:
- Mostra un modal con risultati in griglia.
- Click su un'immagine → `saveWebImageToTile()`.

#### `searchGoogleImages(tile, word)`
Cerca immagini tramite Google Custom Search API:
- Richiede `googleApiKey` e `googleCx`.
- Mostra modal con risultati.
- Click → `saveWebImageToTile()`.

#### `saveWebImageToTile(tile, imageUrl, word)`
Scarica un'immagine web tramite CORS proxy:
- Prova multipli proxy: `corsproxy.io`, `allorigins.win`, `codetabs.com`.
- Comprime l'immagine.
- Salva nella cartella locale.
- Aggiorna la tile.

### Operazione merge

#### `toggleTileSelection(tile)`
Attiva/disattiva la selezione di una tile per l'operazione merge. Aggiorna l'array `selectedTiles`.

#### `mergeSelectedTiles()`
Unisce 2+ tile selezionate:
1. Concatena le parole in una frase combinata.
2. Cerca un pittogramma per la frase combinata.
3. Crea una nuova tile con la frase unita.
4. Rimuove le tile originali.

## Note per le modifiche

- `addTile()` è stata semplificata a ~150 righe; la logica dei badge e dei pulsanti è nei nuovi helper `createTileBadges()` e `createTileActionButtons()`.
- L'editor di ritaglio è in `cropEditor.js` (funzione globale `openCropEditor`).
- Le gallerie di ricerca usano il modal unificato `openSearchModal(options)` per evitare duplicazione.
- I pulsanti d'azione sono nascosti di default e mostrati con la classe CSS `.show-tile-actions` sul container `#result`.
- La lista dei CORS proxy in `saveWebImageToTile()` potrebbe necessitare aggiornamenti se i proxy smettono di funzionare.
- Le immagini personalizzate vengono sempre salvate anche nella `personalLibrary` per persistenza cross-sessione.
