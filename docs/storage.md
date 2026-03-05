# js/storage.js — IndexedDB, gestione cartelle e simboli personalizzati

**Righe:** ~618 | **Dipendenze:** `utils.js`, `i18n.js`, `api.js`

## Responsabilità

- Gestione IndexedDB per la persistenza di `FileSystemHandle`.
- Interfaccia con la File System Access API per cartelle di immagini locali.
- Pannello di gestione dei simboli personalizzati nel modal impostazioni.

## IndexedDB: `ls-handles`

Database `ls-handles` con un object store `handles`:
- Ogni record ha una `key` stringa e un `value` che è un `FileSystemDirectoryHandle`.
- Usato per ricordare la cartella immagini selezionata tra le sessioni.

## Funzioni

### `persistHandleToIDB(key, handle)` → `Promise<boolean>`
Salva un `FileSystemHandle` nell'IndexedDB. Ritorna `true` se riuscito.

### `readHandleFromIDB(key)` → `Promise<FileSystemHandle|null>`
Legge un `FileSystemHandle` dall'IndexedDB. Ritorna `null` se non trovato.

### `initLocalFolderFromIDB()`
Chiamata all'avvio dell'app. Tenta di riconnettersi alla cartella salvata:
1. Legge l'handle da IDB.
2. Verifica i permessi con `queryPermission`/`requestPermission`.
3. Se autorizzato, indicizza i file della cartella (`localImageFiles`, `localFileHandleMap`).
4. Aggiorna lo stato UI (`localFolderStatus`).

### `setupSelectLocalFolder()`
Collega il pulsante "Seleziona cartella" alla File System Access API:
- Usa `showDirectoryPicker()` se disponibile.
- Fallback: prompt manuale per browser non supportati.
- Salva l'handle in IDB per persistenza.
- Indicizza i file e popola `keywordIndex` con i nomi file.

### `setupDisconnectLocalFolder()`
Collega il pulsante "Disconnetti cartella":
- Rimuove l'handle da IDB.
- Resetta `localImageFolderHandle`, `localImageFiles`, `localFileHandleMap`.

### `saveImageToLocalFolder(imageData, filename, options)` → `Promise<FileSystemFileHandle>`
Salva un'immagine nella cartella locale:
1. Accetta blob, data-URL o File.
2. Comprime con `compressImage()` se necessario.
3. Scrive il file tramite `FileSystemWritableFileStream`.
4. Aggiorna `localImageFiles` e `localFileHandleMap`.

### `loadCustomSymbolsList()`
Renderizza il pannello dei simboli personalizzati nel modal impostazioni:
- Legge `personalLibrary` da `utils.js`.
- Per ogni parola, mostra le immagini con pulsanti di eliminazione.
- Gestisce lo stato "nessun simbolo".

### `deleteAllSymbolsForWord(word)`
Elimina tutti i simboli personalizzati per una parola da `personalLibrary` e salva.

### `deleteSingleSymbol(word, index)`
Elimina un singolo simbolo per parola e indice dall'array.

### `setupCustomSymbolsPanel()`
Collega i pulsanti del pannello:
- **Cancella tutto**: svuota `personalLibrary` dopo conferma.
- **Esporta**: scarica `customSymbolImages` come file JSON.
- **Aggiorna**: ricarica la lista.

## Flusso: selezione cartella

```
Utente clicca "📁 Seleziona cartella"
  → showDirectoryPicker()
    → persistHandleToIDB('localFolder', handle)
    → Indicizzazione file (localImageFiles, localFileHandleMap)
    → Aggiornamento UI (localFolderStatus)
```

## Flusso: salvataggio immagine locale

```
saveImageToLocalFolder(blob, 'gatto.png')
  → compressImage(blob, 512, 512, 0.7)
  → handle.getFileHandle('gatto.png', {create: true})
  → writable.write(compressedBlob)
  → Aggiorna localImageFiles e localFileHandleMap
```

## Note per le modifiche

- Le funzioni di questo file accedono a variabili globali di `utils.js` (`localImageFolderHandle`, `localImageFiles`, `localFileHandleMap`, `els`, `personalLibrary`).
- Per aggiungere nuove funzionalità di storage, metterle qui.
- Il pannello simboli custom è strettamente legato alla struttura del modal impostazioni in `index.html`.
