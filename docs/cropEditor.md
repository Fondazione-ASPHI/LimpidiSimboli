# js/cropEditor.js — Editor di ritaglio immagine

**Righe:** ~197 | **Dipendenze:** `utils.js` (`localFileHandleMap`, `dbg`), `i18n.js` (`translateUI`), `storage.js` (`saveImageToLocalFolder`)

## Responsabilità

- Fornire un overlay fullscreen per ritagliare un'immagine da assegnare a una tile.
- Gestire l'interazione canvas (selezione rettangolare, disegno, conferma/annullamento).
- Salvare l'immagine ritagliata nella cartella locale e aggiornare la tile.

## Origine

Questo file è stato estratto da `tiles.js` durante un refactoring. In precedenza la funzione `openCropEditor` era definita inline dentro `addTile()`.

## Funzione

### `openCropEditor(imageDataUrl, word, tile)`

Apre un overlay modale fullscreen con un canvas per ritagliare un'immagine:

1. **Setup UI**: crea overlay (`.crop-overlay`), titolo, istruzione, canvas e pulsanti Conferma/Annulla.
2. **Caricamento immagine**: disegna `imageDataUrl` sul canvas.
3. **Interazione mouse**: l'utente disegna un rettangolo di selezione trascinando il mouse.
   - `mousedown` → salva punto di partenza.
   - `mousemove` → ridisegna immagine con overlay scuro + area selezionata visibile + bordo blu.
   - `mouseup` → finalizza la selezione.
4. **Conferma (Ritaglia e salva)**:
   - Valida che l'area sia almeno 10×10 px.
   - Crea un canvas temporaneo con l'area ritagliata.
   - Salva l'immagine con `saveImageToLocalFolder()`.
   - Aggiorna `localFileHandleMap` e il `data-ids` della tile.
   - Imposta la nuova immagine come `src` della tile.
   - Rimuove l'overlay.
5. **Annulla**: rimuove l'overlay senza modifiche.

## Classi CSS utilizzate

| Classe | Elemento |
|--------|----------|
| `.crop-overlay` | Overlay fullscreen con sfondo scuro |
| `.crop-title` | Titolo dell'editor |
| `.crop-instruction` | Testo istruttivo |
| `.crop-canvas-container` | Container del canvas |
| `.crop-canvas` | Canvas HTML5 per il ritaglio |
| `.crop-btn-container` | Container pulsanti azione |
| `.crop-confirm-btn` | Pulsante "Ritaglia e salva" |
| `.crop-cancel-btn` | Pulsante "Annulla" |

## Chiavi i18n utilizzate

| Chiave | Descrizione |
|--------|-------------|
| `cropEditorTitle` | Titolo dell'editor |
| `cropInstruction` | Istruzioni per l'utente |
| `cropAndSave` | Testo pulsante conferma |
| `cancel` | Testo pulsante annulla |
| `selectCropArea` | Alert se nessuna area selezionata |
| `cropAreaTooSmall` | Alert se area troppo piccola |
| `croppingInProgress` | Testo pulsante durante il salvataggio |
| `imageSaveError` | Messaggio di errore salvataggio |

## Note per le modifiche

- La funzione è globale (`function openCropEditor(...)`) per essere accessibile da `tiles.js`.
- Il file è caricato **prima** di `tiles.js` nell'ordine degli script.
- Le classi CSS `.crop-*` sono definite in `css/styles.css`.
- Per aggiungere supporto touch, implementare `touchstart`/`touchmove`/`touchend` con la stessa logica dei mouse events.
