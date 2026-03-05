/* js/storage.js – IndexedDB helpers, folder management & custom symbols for Limpidi Simboli */

// ---------------------------------------------------------------------------
// 1. IndexedDB helpers
// ---------------------------------------------------------------------------

async function persistHandleToIDB(key, handle) {
  if (!window.indexedDB) return false;
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('ls-handles', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('handles')) db.createObjectStore('handles');
      };
      req.onsuccess = (e) => {
        const db = e.target.result;
        try {
          const tx = db.transaction('handles', 'readwrite');
          tx.objectStore('handles').put(handle, key);
          tx.oncomplete = () => { db.close(); resolve(true); };
          tx.onerror = () => { db.close(); resolve(false); };
        } catch (er) { try { db.close(); } catch (_) {} resolve(false); }
      };
      req.onerror = () => resolve(false);
    } catch (e) { console.warn('[IDB] persist error', e); resolve(false); }
  });
}

async function readHandleFromIDB(key) {
  if (!window.indexedDB) return null;
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('ls-handles', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('handles')) db.createObjectStore('handles');
      };
      req.onsuccess = (e) => {
        const db = e.target.result;
        try {
          const tx = db.transaction('handles', 'readonly');
          const r = tx.objectStore('handles').get(key);
          r.onsuccess = (ev) => { db.close(); resolve(ev.target.result); };
          r.onerror = () => { db.close(); resolve(null); };
        } catch (er) { try { db.close(); } catch (_) {} resolve(null); }
      };
      req.onerror = () => resolve(null);
    } catch (e) { console.warn('[IDB] read error', e); resolve(null); }
  });
}

// ---------------------------------------------------------------------------
// 2. initLocalFolderFromIDB  –  reconnect to a previously-saved folder
// ---------------------------------------------------------------------------

async function initLocalFolderFromIDB() {
  try {
    // Mostra nome salvato (compatibilità con versione precedente)
    const savedHandleName = localStorage.getItem('localImageFolderName');
    if (savedHandleName) {
      els.localFolderStatus.textContent = `📁 ${savedHandleName} (premi il bottone per riconnettere)`;
    }

    // Proviamo a recuperare il handle salvato in IndexedDB
    if (!window.indexedDB || !window.showDirectoryPicker) return;
    const saved = await readHandleFromIDB('localImageFolder');
    if (!saved) return;

    // Controlla i permessi sul handle
    try {
      const perm = await saved.queryPermission({ mode: 'read' });
      if (perm !== 'granted') {
        // Prova a richiedere il permesso
        const req = await saved.requestPermission({ mode: 'read' });
        if (req !== 'granted') {
          // Non possiamo accedere; mostra messaggio e lascia il bottone per riconnettere
          els.localFolderStatus.textContent = `📁 ${savedHandleName || '(cartella salvata)'} — permesso non concesso (premi il bottone per riconnettere)`;
          return;
        }
      }
    } catch (e) {
      console.warn('[Local Folder] Permission query/request failed', e);
      // In alcuni browser/mode la queryPermission può fallire: richiediamo comunque il permesso
      try { await saved.requestPermission({ mode: 'read' }); } catch (_) {}
    }

    // Se arriviamo qui, abbiamo un handle con permesso: ricolleghiamo
    localImageFolderHandle = saved;
    localImageFiles = {};
    let totalFiles = 0;
    try {
      for await (const entry of saved.values()) {
        if (entry.kind === 'file') {
          try {
            const file = await entry.getFile();
            if (file.type && file.type.startsWith('image/')) {
              totalFiles++;
              const nameNoExt = entry.name.replace(/\.[^/.]+$/, '').toLowerCase();
              const words = nameNoExt.split(/[\s_\-]+/).filter(w => w.length > 0);
              for (const word of words) {
                if (!localImageFiles[word]) localImageFiles[word] = [];
                localImageFiles[word].push(entry);
              }
            }
          } catch (e) { /* ignore individual file errors */ }
        }
      }
    } catch (e) {
      console.warn('[Local Folder] Error scanning saved folder', e);
    }

    const uniqueWords = Object.keys(localImageFiles).length;
    els.localFolderStatus.textContent = `✅ ${totalFiles} immagini trovate per ${uniqueWords} parole`;
    setStatusKey('local_folder_connected', { dir: savedHandleName || '(cartella salvata)', files: totalFiles, words: uniqueWords });
    dbg('[Local Folder] Reconnected to saved folder:', savedHandleName, localImageFiles);
  } catch (e) {
    console.warn('[Local Folder] Could not load saved handle:', e);
  }
}

// ---------------------------------------------------------------------------
// 3. setupSelectLocalFolder  –  wire the "select folder" button
// ---------------------------------------------------------------------------

function setupSelectLocalFolder() {
  if (!els.selectLocalFolder) return;

  els.selectLocalFolder.addEventListener('click', safeAsync(async () => {
    try {
      // Preferiamo usare File System Access API se disponibile
      if (window.showDirectoryPicker) {
        // Chiedi all'utente di selezionare una cartella
        const dirHandle = await window.showDirectoryPicker({ mode: 'read', startIn: 'pictures' });

        localImageFolderHandle = dirHandle;

        // Richiedi permesso di lettura/scrittura subito per evitare problemi successivi
        try {
          const perm = await dirHandle.requestPermission({ mode: 'readwrite' });
          if (perm !== 'granted') {
            // Se l'utente non concede permessi di scrittura, avvisa e prosegui in sola lettura
            console.warn('[Local Folder] Write permission not granted:', perm);
            els.localFolderStatus.textContent = `⚠️ Permessi limitati per "${dirHandle.name}"`;
          }
        } catch (e) {
          console.warn('[Local Folder] requestPermission failed:', e);
        }

        // Scansiona tutti i file nella cartella
        dbg('[Local Folder] Scanning folder:', dirHandle.name);
        localImageFiles = {}; // Struttura: { "parola": [FileHandle/File, ...] }
        let totalFiles = 0;
        const fileList = [];

        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            if (file.type.startsWith('image/')) {
              fileList.push({ handle: entry, name: entry.name });
              totalFiles++;
            }
          }
        }

        for (const fileInfo of fileList) {
          const fileNameNoExt = fileInfo.name.replace(/\.[^/.]+$/, '').toLowerCase();
          const words = fileNameNoExt.split(/[\s_\-]+/).filter(w => w.length > 0);
          for (const word of words) {
            if (!localImageFiles[word]) localImageFiles[word] = [];
            if (!localImageFiles[word].some(h => h.name === fileInfo.handle.name)) {
              localImageFiles[word].push(fileInfo.handle);
            }
          }
        }

        try {
          // Salva il handle in IndexedDB per ricollegare la cartella in seguito
          const saved = await persistHandleToIDB('localImageFolder', dirHandle);
          if (saved) {
            localStorage.setItem('localImageFolderName', dirHandle.name);
          } else {
            // Se non possiamo salvare il handle, salviamo comunque il nome per compatibilità
            localStorage.setItem('localImageFolderName', dirHandle.name);
          }
        } catch (e) {
          try { localStorage.setItem('localImageFolderName', dirHandle.name); } catch (_) {}
        }
        const uniqueWords = Object.keys(localImageFiles).length;
        els.localFolderStatus.textContent = `✅ ${totalFiles} immagini trovate per ${uniqueWords} parole`;
        dbg('[Local Folder] Loaded files for', uniqueWords, 'words:', localImageFiles);
        setStatusKey('local_folder_connected', { dir: dirHandle.name, files: totalFiles, words: uniqueWords });

        return;
      }

      // Fallback: alcuni browser (es. iOS Safari) non supportano showDirectoryPicker.
      // Proviamo webkitdirectory (non standard ma funzionante su molti Chromium/Android)
      const tempInput = document.createElement('input');
      tempInput.type = 'file';
      tempInput.accept = 'image/*';

      if ('webkitdirectory' in tempInput) {
        tempInput.webkitdirectory = true;
        tempInput.multiple = true;
        tempInput.style.display = 'none';
        tempInput.addEventListener('change', (e) => {
          const files = Array.from(e.target.files || []);
          if (!files.length) return;
          localImageFolderHandle = null; // non abbiamo un handle, memorizziamo file
          localImageFiles = {};
          let totalFiles = 0;
          for (const file of files) {
            if (!file.type.startsWith('image/')) continue;
            totalFiles++;
            const nameNoExt = file.name.replace(/\.[^/.]+$/, '').toLowerCase();
            const words = nameNoExt.split(/[\s_\-]+/).filter(w => w.length > 0);
            for (const word of words) {
              if (!localImageFiles[word]) localImageFiles[word] = [];
              localImageFiles[word].push(file);
            }
          }
          try { localStorage.setItem('localImageFolderName', '(selezione file)'); } catch (_) {}
          const uniqueWords = Object.keys(localImageFiles).length;
          els.localFolderStatus.textContent = `✅ ${totalFiles} immagini trovate per ${uniqueWords} parole`;
          setStatusKey('local_folder_connected', { dir: '(selezione)', files: totalFiles, words: uniqueWords });
        });
        document.body.appendChild(tempInput);
        tempInput.click();
        // Rimuovi l'elemento dopo un po' per tenere pulito il DOM
        setTimeout(() => { try { tempInput.remove(); } catch (e) {} }, 3000);
        return;
      }

      // Ultimo fallback: input multiplo per selezionare immagini singole
      tempInput.multiple = true;
      tempInput.style.display = 'none';
      tempInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) {
          // Suggerimento UX: su iOS la selezione di cartelle non è possibile
          const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
          if (isiOS) {
            // Mostra suggerimento nella status bar
            els.localFolderStatus.textContent = '⚠️ Su iPhone/iPad non è possibile selezionare cartelle: seleziona più immagini o carica un file .zip della cartella.';
          } else {
            alert(translateUI('browserNoFolderSupport'));
          }
          return;
        }
        localImageFolderHandle = null;
        localImageFiles = {};
        let totalFiles = 0;
        for (const file of files) {
          if (!file.type.startsWith('image/')) continue;
          totalFiles++;
          const nameNoExt = file.name.replace(/\.[^/.]+$/, '').toLowerCase();
          const words = nameNoExt.split(/[\s_\-]+/).filter(w => w.length > 0);
          for (const word of words) {
            if (!localImageFiles[word]) localImageFiles[word] = [];
            localImageFiles[word].push(file);
          }
        }
        try { localStorage.setItem('localImageFolderName', '(selezione file)'); } catch (_) {}
        const uniqueWords = Object.keys(localImageFiles).length;
        els.localFolderStatus.textContent = `✅ ${totalFiles} immagini trovate per ${uniqueWords} parole`;
        setStatusKey('local_folder_connected', { dir: '(selezione)', files: totalFiles, words: uniqueWords });
      });
      document.body.appendChild(tempInput);
      tempInput.click();
      setTimeout(() => { try { tempInput.remove(); } catch (e) {} }, 3000);

    } catch (e) {
      if (e.name === 'AbortError') {
        dbg('[Local Folder] User cancelled folder selection');
      } else {
        console.error('[Local Folder] Error:', e);
        alert(translateUI('localFolderSelectError', { msg: e.message }));
      }
    }
  }));
}

// ---------------------------------------------------------------------------
// 4. setupDisconnectLocalFolder  –  wire the "disconnect" button
// ---------------------------------------------------------------------------

function setupDisconnectLocalFolder() {
  if (!els.disconnectLocalFolder) return;

  els.disconnectLocalFolder.addEventListener('click', safeAsync(async () => {
    try {
      // Rimuovi da IndexedDB
      if (window.indexedDB) {
        const req = indexedDB.open('ls-handles', 1);
        req.onsuccess = (e) => {
          try {
            const db = e.target.result;
            const tx = db.transaction('handles', 'readwrite');
            tx.objectStore('handles').delete('localImageFolder');
            tx.oncomplete = () => { db.close(); };
            tx.onerror = () => { db.close(); };
          } catch (er) { console.warn('[Disconnect] IDB delete error', er); }
        };
      }
      try { localStorage.removeItem('localImageFolderName'); } catch (_) {}
      localImageFolderHandle = null;
      localImageFiles = {};
      if (els.localFolderStatus) els.localFolderStatus.textContent = translateUI('selectFolderNotConnected');
      setStatusKey('selectFolderNotConnected');
    } catch (e) {
      console.error('[Disconnect] Error', e);
      setStatusKey('js_error', { msg: e && e.message ? e.message : String(e) }, true);
    }
  }));
}

// ---------------------------------------------------------------------------
// 5. saveImageToLocalFolder  –  save a blob / dataURL to the local folder
// ---------------------------------------------------------------------------

async function saveImageToLocalFolder(imageData, word) {
  if (!localImageFolderHandle) {
    throw new Error('Nessuna cartella locale selezionata. Clicca "📁 Seleziona Cartella Immagini" prima.');
  }

  // Verifica permessi di scrittura
  const permission = await localImageFolderHandle.requestPermission({ mode: 'readwrite' });
  if (permission !== 'granted') {
    throw new Error('Permesso di scrittura negato per la cartella selezionata.');
  }

  // Converti dataURL in Blob se necessario, e comprimi se è un File
  let blob;
  if (imageData instanceof File) {
    // È un file caricato dall'utente - comprimi prima di salvare
    const compressed = await compressImage(imageData, 800, 800, 0.8);
    // compressImage restituisce un dataURL, convertiamolo in blob
    const response = await fetch(compressed);
    blob = await response.blob();
  } else if (typeof imageData === 'string' && imageData.startsWith('data:')) {
    // Converti dataURL a Blob
    const response = await fetch(imageData);
    blob = await response.blob();
  } else if (imageData instanceof Blob) {
    blob = imageData;
  } else {
    throw new Error('Formato immagine non supportato');
  }

  // Determina l'estensione dal tipo MIME
  const mimeType = blob.type;
  let extension = 'png';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
    extension = 'jpg';
  } else if (mimeType.includes('png')) {
    extension = 'png';
  } else if (mimeType.includes('webp')) {
    extension = 'webp';
  }

  // Genera nome file univoco: parola_ai_timestamp.ext
  const timestamp = Date.now();
  const fileName = `${word}_ai_${timestamp}.${extension}`;

  dbg('[Local Folder] Saving image:', fileName, 'Size:', blob.size, 'bytes');

  // Crea il file nella cartella
  const fileHandle = await localImageFolderHandle.getFileHandle(fileName, { create: true });

  // Scrivi i dati
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();

  dbg('[Local Folder] Image saved successfully:', fileName);

  // Aggiorna la cache localImageFiles
  const wordKey = word.toLowerCase();
  if (!localImageFiles[wordKey]) {
    localImageFiles[wordKey] = [];
  }
  localImageFiles[wordKey].push(fileHandle);

  // Aggiorna lo stato
  const totalFiles = Object.values(localImageFiles).reduce((sum, arr) => sum + arr.length, 0);
  const uniqueWords = Object.keys(localImageFiles).length;
  els.localFolderStatus.textContent = `✅ ${totalFiles} immagini trovate per ${uniqueWords} parole`;

  return fileHandle;
}

// ---------------------------------------------------------------------------
// 6. Custom symbols panel helpers
// ---------------------------------------------------------------------------

async function loadCustomSymbolsList() {
  const customImages = JSON.parse(localStorage.getItem('customSymbolImages') || '{}');
  const container = els.customSymbolsList;

  // Verifica se la cartella locale è stata selezionata
  const hasFolderAccess = localImageFolderHandle !== null;

  // Conta totale simboli
  const words = Object.keys(customImages);
  let totalSymbols = 0;
  words.forEach(word => {
    if (Array.isArray(customImages[word])) {
      totalSymbols += customImages[word].length;
    } else {
      totalSymbols += 1;
    }
  });

  if (words.length === 0) {
    container.innerHTML = `<p style="color: #64748b; text-align: center; margin: 0;">${translateUI('noCustomSymbolsSaved')}</p>`;
    return;
  }

  let headerHTML = `<p style="color: #64748b; font-size: 0.9rem; margin: 0 0 12px 0;"><strong>${words.length}</strong> parole con <strong>${totalSymbols}</strong> simboli personalizzati</p>`;

  // Avviso se cartella non connessa
  if (!hasFolderAccess) {
    headerHTML += `<div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 10px; margin-bottom: 12px; font-size: 0.9rem; color: #856404;">
      ${translateUI('selectFolderNotConnected')}
    </div>`;
  }

  container.innerHTML = headerHTML;

  // Ordina alfabeticamente
  words.sort();

  for (const word of words) {
    let symbols = customImages[word];
    if (!Array.isArray(symbols)) {
      symbols = [symbols];
    }

    const wordItem = document.createElement('div');
    wordItem.classList.add('custom-word-item');

    const wordHeader = document.createElement('div');
    wordHeader.classList.add('custom-word-header');

    const wordTitle = document.createElement('div');
    wordTitle.classList.add('custom-word-title');
    wordTitle.textContent = word;

    const deleteWordBtn = document.createElement('button');
    deleteWordBtn.textContent = translateUI('deleteAllForWordBtn');
    deleteWordBtn.className = 'button ghost';
    deleteWordBtn.classList.add('delete-word-btn');
    deleteWordBtn.onclick = () => deleteAllSymbolsForWord(word);

    wordHeader.appendChild(wordTitle);
    wordHeader.appendChild(deleteWordBtn);
    wordItem.appendChild(wordHeader);

    // Mostra ogni simbolo
    const symbolsGrid = document.createElement('div');
    symbolsGrid.classList.add('symbols-grid');

    for (let i = 0; i < symbols.length; i++) {
      const symbolId = symbols[i];
      const symbolCard = document.createElement('div');
      symbolCard.classList.add('symbol-card');
      symbolCard.classList.add('small');

      // Anteprima immagine
      const img = document.createElement('img');
      // small card image sizing handled by .symbol-card.small img CSS

      // Carica l'immagine
      (async () => {
        try {
          if (typeof symbolId === 'string' && symbolId.startsWith('local-file::')) {
            // File locale
            const fileHandle = localFileHandleMap.get(symbolId);
            if (fileHandle) {
              try {
                const file = await fileHandle.getFile();
                const reader = new FileReader();
                reader.onload = (e) => { img.src = e.target.result; };
                reader.onerror = () => {
                  img.src = SVG_ERROR;
                  try { img.alt = translateUI('errorLoading'); } catch (e) {}
                };
                reader.readAsDataURL(file);
              } catch (err) {
                console.error('[Custom Symbols] Error loading file:', err);
                img.src = SVG_ERROR;
                img.title = err.message;
              }
            } else {
              img.src = SVG_NOT_FOUND;
              img.title = translateUI('fileNotFoundTitle');
            }
          } else if (typeof symbolId === 'string' && symbolId.startsWith('data:')) {
            img.src = symbolId;
          } else if (typeof symbolId === 'object' && symbolId.type === 'local-file') {
            // Formato oggetto (dovrebbe essere convertito in stringa)
            const fileHandle = localFileHandleMap.get(symbolId.id);
            if (fileHandle) {
              try {
                const file = await fileHandle.getFile();
                const reader = new FileReader();
                reader.onload = (e) => { img.src = e.target.result; };
                reader.readAsDataURL(file);
              } catch (err) {
                img.src = SVG_ERROR;
              }
            } else {
              img.src = SVG_NOT_FOUND;
            }
          } else {
            img.src = SVG_UNKNOWN;
          }
        } catch (err) {
          console.error('[Custom Symbols] Error:', err);
          img.src = SVG_ERROR;
        }
      })();

      symbolCard.appendChild(img);

      // Bottone cancella singolo simbolo
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '×';
      deleteBtn.classList.add('symbol-delete-btn');
      deleteBtn.onclick = () => deleteSingleSymbol(word, i);

      symbolCard.appendChild(deleteBtn);
      symbolsGrid.appendChild(symbolCard);
    }

    wordItem.appendChild(symbolsGrid);
    container.appendChild(wordItem);
  }
}

// Cancella tutti i simboli per una parola
function deleteAllSymbolsForWord(word) {
  if (!confirm(translateUI('confirmDeleteAllForWord', { word: word }))) return;

  const customImages = JSON.parse(localStorage.getItem('customSymbolImages') || '{}');
  delete customImages[word];
  localStorage.setItem('customSymbolImages', JSON.stringify(customImages));

  loadCustomSymbolsList();
  setStatusKey('customsymbols_deleted_for_word', { word: word });
}

// Cancella un singolo simbolo
function deleteSingleSymbol(word, index) {
  const customImages = JSON.parse(localStorage.getItem('customSymbolImages') || '{}');
  if (!customImages[word]) return;

  let symbols = customImages[word];
  if (!Array.isArray(symbols)) {
    symbols = [symbols];
  }

  symbols.splice(index, 1);

  if (symbols.length === 0) {
    delete customImages[word];
  } else {
    customImages[word] = symbols;
  }

  localStorage.setItem('customSymbolImages', JSON.stringify(customImages));
  loadCustomSymbolsList();
  setStatusKey('customsymbol_deleted');
}

// ---------------------------------------------------------------------------
// 7. setupCustomSymbolsPanel  –  wire panel buttons & settings opener
// ---------------------------------------------------------------------------

function setupCustomSymbolsPanel() {
  // Cancella tutto
  els.clearAllCustomSymbolsButton.addEventListener('click', () => {
    if (!confirm(translateUI('confirmDeleteAll'))) return;

    localStorage.removeItem('customSymbolImages');
    loadCustomSymbolsList();
    setStatusKey('customsymbols_all_deleted');
  });

  // Esporta come JSON
  els.exportCustomSymbolsButton.addEventListener('click', () => {
    const customImages = JSON.parse(localStorage.getItem('customSymbolImages') || '{}');
    const dataStr = JSON.stringify(customImages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `simboli-personalizzati-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    setStatusKey('export_completed');
  });

  // Aggiorna lista
  els.refreshCustomSymbolsButton.addEventListener('click', () => {
    loadCustomSymbolsList();
    setStatusKey('list_refreshed');
  });

  // Carica la lista quando si apre il settings
  els.settingsButton.addEventListener('click', () => {
    loadCustomSymbolsList();
  });
}
