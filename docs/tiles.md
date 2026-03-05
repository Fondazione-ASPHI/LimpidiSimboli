# js/tiles.js — Creazione e gestione tile

**Righe:** ~1900 | **Dipendenze:** `utils.js`, `i18n.js`, `api.js`, `storage.js`

## Responsabilità

- Creazione di tile (schede simbolo) con immagine, etichetta e pulsanti d'azione.
- Gestione galleria di alternative (ARASAAC, OpenSymbols, Wikipedia, Google).
- Editor di ritaglio (crop) per immagini.
- Operazione merge (unione) di tile selezionate.

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
**Funzione principale** (~400 righe). Crea una tile completa:

1. **Immagine**: cerca prima nella `personalLibrary`, poi tra gli `ids`.
2. **Pulsanti d'azione** (visibili con toggle):
   - ➕ **Aggiungi immagine**: `openFileChooserForWord()`
   - ➖ **Rimuovi immagine**: elimina l'immagine corrente
   - 🔤 **Solo testo**: `showTextOnly()`
   - ◀▶ **Naviga**: `cycleTileImage()` / galleria
   - 🔍 **Cerca**: `showSymbolGallery()`
   - 📖 **Wikipedia**: `searchWebImages()`
   - 🌐 **Google**: `searchGoogleImages()`
   - 🤖 **GPT/DALL-E**: `generateArasaacStyleImages()`
   - ✂️ **Ritaglia**: `openCropEditor()`
   - 🔗 **Unisci**: `toggleTileSelection()`
   - ℹ️ **Spiega**: `explainTerm()`
3. **Badge grammaticali**: tempo verbale, genere, numero.
4. **Click sull'immagine**: `cycleTileImage()`.

### Editor di ritaglio

#### `openCropEditor(tile)`
Overlay fullscreen per ritagliare un'immagine:
- Canvas con selezione rettangolare trascinabile.
- Handle di ridimensionamento ai bordi.
- Pulsanti Conferma/Annulla.
- Salva l'immagine ritagliata come data-URL nella tile.

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

- `addTile()` è la funzione più lunga e complessa (~400 righe). Per modificarla, leggere attentamente le sezioni dei pulsanti d'azione.
- I pulsanti d'azione sono nascosti di default e mostrati con la classe CSS `.show-tile-actions` sul container `#result`.
- La lista dei CORS proxy in `saveWebImageToTile()` potrebbe necessitare aggiornamenti se i proxy smettono di funzionare.
- Le immagini personalizzate vengono sempre salvate anche nella `personalLibrary` per persistenza cross-sessione.
