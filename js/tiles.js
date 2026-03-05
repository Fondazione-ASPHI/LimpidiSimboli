/* js/tiles.js – Tile creation, image management & galleries for Limpidi Simboli */

    function showTextOnly(tile, word) {
      const img = tile.querySelector('img');
      const wordLabel = tile.querySelector('.word');
      
      // Nascondi l'immagine se esiste
      if (img) {
        img.style.display = 'none';
      }
      
      if (wordLabel) {
        // Ingrandisci il testo
        wordLabel.style.fontSize = '2.5rem';
        wordLabel.style.fontWeight = 'bold';
        wordLabel.style.margin = 'auto 0';
        wordLabel.style.flexGrow = '1';
        wordLabel.style.display = 'flex';
        wordLabel.style.alignItems = 'center';
        wordLabel.style.justifyContent = 'center';
      }
      
      // Nascondi i badge se presenti
      const badges = tile.querySelector('.badges');
      if (badges) {
        badges.style.display = 'none';
      }
      
      // Marca il tile come "text-only" mode
      tile.dataset.textOnlyMode = 'true';
    }
    
    // Funzione per ripristinare la visualizzazione del simbolo
    function showSymbolMode(tile, word) {
      const img = tile.querySelector('img');
      const wordLabel = tile.querySelector('.word');
      
      // Mostra l'immagine se esiste
      if (img) {
        img.style.display = '';
      }
      
      if (wordLabel) {
        // Ripristina lo stile normale del testo
        wordLabel.style.fontSize = '';
        wordLabel.style.fontWeight = '';
        wordLabel.style.margin = '';
        wordLabel.style.flexGrow = '';
        wordLabel.style.display = '';
        wordLabel.style.alignItems = '';
        wordLabel.style.justifyContent = '';
      }
      
      // Mostra i badge se presenti
      const badges = tile.querySelector('.badges');
      if (badges) {
        badges.style.display = '';
      }
      
      // Rimuovi il marker "text-only" mode
      tile.dataset.textOnlyMode = 'false';
    }

    // Imposta l'immagine del tile in base all'indice corrente
    async function setImageForTile(tile, img) {
      const ids = JSON.parse(tile.dataset.ids || '[]');
      const index = parseInt(tile.dataset.index || '0', 10);
      const word = tile.dataset.word || '';
      dbg('[setImageForTile] ids:', ids, 'index:', index, 'word:', word);
      // Priorità: immagine personalizzata in cache
      // NOTA: customImages rimosso per permettere ciclaggio - immagine custom è nel primo posto di ids
      const id = ids[index];
      dbg('[setImageForTile] current id:', id, 'typeof:', typeof id);
      if (!id) return;
      
      // Caso: immagine dalla cartella locale
      if (typeof id === 'object' && id.type === 'local-file' && id.id) {
        dbg('[setImageForTile] Loading local file:', id.fileName);
        try {
          // Recupera il FileHandle dalla mappa globale
          const fileHandle = localFileHandleMap.get(id.id);
          if (!fileHandle) {
            throw new Error('FileHandle non trovato nella mappa');
          }
          
          const file = await fileHandle.getFile();
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          img.src = dataUrl;
          img.alt = `Immagine locale: ${id.fileName}`;
        } catch (err) {
          console.error('[setImageForTile] Error loading local file:', err);
          img.src = SVG_ERROR;
          img.alt = translateUI('errorLoading');
        }
        return;
      }
      
      if (typeof id === 'string' && id.startsWith('data:')) {
        img.src = id;
        img.alt = `Simbolo personalizzato per "${word}"`;
      } else if (typeof id === 'object' && id.image_url) {
        // Caso: simbolo OpenSymbols (TAWASOL, Bliss, ecc.)
        // Usa proxy CORS per evitare errori CORS quando il file è aperto localmente
        const imageUrl = id.image_url.startsWith('http') 
          ? `https://corsproxy.io/?${encodeURIComponent(id.image_url)}`
          : id.image_url;
        dbg('[setImageForTile] Setting OpenSymbols image via proxy:', imageUrl);
        img.src = imageUrl;
        img.alt = `${id.name || id.label || word} (${id.repo || id.repo_key || ''})`;
      } else if (typeof id === 'object' && id.url) {
        // Caso: simbolo OpenSymbols (fallback su url SVG)
        const imageUrl = id.url.startsWith('http') 
          ? `https://corsproxy.io/?${encodeURIComponent(id.url)}`
          : id.url;
        dbg('[setImageForTile] Setting OpenSymbols SVG via proxy:', imageUrl);
        img.src = imageUrl;
        img.alt = `${id.label || word}`;
      } else {
        img.src = `${STATIC_ROOT}/${id}/${id}_500.png`;
        img.alt = `Pittogramma per "${word}"`;
      }
    }

    // Mostra tutti i simboli OpenSymbols (TAWASOL, Bliss, ecc.) in una sezione dedicata
    function showOpenSymbolsSection(symbols, word) {
      if (!Array.isArray(symbols) || symbols.length === 0) return;
      let section = document.getElementById('openSymbolsSection');
      if (!section) {
        section = document.createElement('div');
        section.id = 'openSymbolsSection';
        section.style.margin = '16px 0 0 0';
        section.innerHTML = '<h3 style="font-size:1.1rem;margin-bottom:8px;">Simboli da OpenSymbols</h3>';
        els.res.appendChild(section);
      } else {
        section.innerHTML = '<h3 style="font-size:1.1rem;margin-bottom:8px;">Simboli da OpenSymbols</h3>';
      }
      symbols.forEach(symbol => {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'inline-block';
        wrapper.style.margin = '0 8px 8px 0';
        wrapper.style.textAlign = 'center';
        const img = document.createElement('img');
        img.src = symbol.image_url;
        img.alt = symbol.name;
        img.style.width = '80px';
        img.style.height = '80px';
        img.style.objectFit = 'contain';
        img.style.background = '#fff';
        img.style.border = '1.5px solid #d1d5db';
        img.style.borderRadius = '10px';
        img.style.display = 'block';
        img.style.margin = '0 auto 4px auto';
        // Badge fonte
        const badge = document.createElement('span');
        badge.textContent = symbol.repo_key || '';
        badge.style.fontSize = '.8rem';
        badge.style.background = '#e5e7eb';
        badge.style.color = '#374151';
        badge.style.padding = '1px 6px';
        badge.style.borderRadius = '8px';
        badge.style.display = 'inline-block';
        badge.style.marginTop = '2px';
        wrapper.appendChild(img);
        wrapper.appendChild(badge);
        section.appendChild(wrapper);
      });
    }

    // Passa all'immagine successiva nella lista degli ID
    function cycleTileImage(tile) {
      const ids = JSON.parse(tile.dataset.ids || '[]');
      if (!ids || ids.length <= 1) return;
      let index = parseInt(tile.dataset.index || '0', 10);
      index = (index + 1) % ids.length;
      tile.dataset.index = index.toString();
      const img = tile.querySelector('img');
      if (img) setImageForTile(tile, img);
    }

    // Apre l'input file nascosto per permettere di caricare un simbolo personalizzato per la parola
    function openFileChooserForWord(tile, word) {
      // Controlla se la cartella è selezionata
      if (!checkLocalFolderSelected('caricare immagini dal PC')) {
        return;
      }
      
  fileInput.onchange = safeAsync(async function() {
        const file = fileInput.files && fileInput.files[0];
        if (file) {
          try {
            // Salva l'immagine nella cartella locale (già compressa dalla funzione saveImageToLocalFolder)
            const fileHandle = await saveImageToLocalFolder(file, word);
            
            dbg('[Upload] Saved custom image for:', word, 'File:', fileHandle.name);
            
            // Genera ID univoco e salva il FileHandle nella mappa
            const uniqueId = `local-file::${fileHandle.name}`;
            localFileHandleMap.set(uniqueId, fileHandle);
            
            // Aggiorna la lista di id del tile - inserisci all'inizio per priorità
            const ids = JSON.parse(tile.dataset.ids || '[]');
            const newLocalFile = { 
              type: 'local-file', 
              id: uniqueId,
              fileName: fileHandle.name,
              word: word 
            };
            
            // Rimuovi eventuali duplicati (confronto per id)
            const existingIndex = ids.findIndex(id => 
              id && typeof id === 'object' && id.type === 'local-file' && id.id === uniqueId
            );
            if (existingIndex !== -1) {
              ids.splice(existingIndex, 1);
            }
            
            ids.unshift(newLocalFile); // Inserisci all'inizio
            tile.dataset.ids = JSON.stringify(ids);
            tile.dataset.index = '0'; // Mostra la prima (quella appena caricata)
            
            // Salva l'associazione parola → file in localStorage per riutilizzo futuro
            const customImages = JSON.parse(localStorage.getItem('customSymbolImages') || '{}');
            if (!customImages[word]) {
              customImages[word] = [];
            }
            // Assicurati che sia un array
            if (!Array.isArray(customImages[word])) {
              customImages[word] = [customImages[word]];
            }
            // Aggiungi solo se non già presente
            if (!customImages[word].includes(uniqueId)) {
              customImages[word].push(uniqueId);
              localStorage.setItem('customSymbolImages', JSON.stringify(customImages));
              dbg('[Upload] Saved association:', word, '→', uniqueId);
            }
            
            // Aggiorna o crea l'immagine
            let img = tile.querySelector('img');
            if (!img) {
              img = document.createElement('img');
              img.loading = 'lazy';
              img.decoding = 'async';
            img.crossOrigin = 'anonymous';
            tile.insertBefore(img, tile.firstChild);
          }
          setImageForTile(tile, img);
          // Rimuovi eventuale messaggio "nessun pittogramma trovato"
          const miss = tile.querySelector('.miss');
          if (miss) miss.remove();
          
          } catch (error) {
            console.error('[Upload] Failed to save:', error);
            alert(error.message || translateUI('imageSaveError'));
          }
        }
        // resetta l'input per consentire selezioni successive
        fileInput.value = '';
      });
      fileInput.click();
    }

    async function createTileBadges(tile, tense, badges) {
      // Contenitore per i badge (tempo, genere, numero)
      const badgesContainer = document.createElement('div');
      badgesContainer.className = 'badges';
      let needBadges = false;
      // Tempo verbale
      if (tense === 'past' || tense === 'future' || tense === 'present') {
        const { emoji, text } = await getTenseBadge(tense);
        if (emoji || text) {
          needBadges = true;
          const badge = document.createElement('div');
          badge.className = 'badge';
          if (emoji) {
            const emojiSpan = document.createElement('span');
            emojiSpan.style.fontSize = '1.2rem';
            emojiSpan.textContent = emoji;
            badge.appendChild(emojiSpan);
          }
          const badgeText = document.createElement('span');
          badgeText.style.fontSize = '.8rem';
          badgeText.style.color = '#374151';
          badgeText.textContent = text;
          badge.appendChild(badgeText);
          badgesContainer.appendChild(badge);
        }
      }
      // Badge aggiuntivi (genere, numero, pronome)
      for (const b of badges) {
        const token = b.token;
        const type = b.type; // 'genere', 'numero', 'pronome'
        // Ottieni l'ID del pittogramma o emoji per il token
        let pictId = null;
        let emoji = null;
        
        try {
          // Usa emoji per numero se disponibile
          if (type === 'numero' && BADGE_SYMBOLS[token]) {
            emoji = BADGE_SYMBOLS[token];
          } else {
            // Per 'pronome', usiamo la mappatura per trovare il simbolo corretto (es. mi -> io)
            let badgeSearchTerm = token;
            if (type === 'pronome' && PRONOUN_SEARCH_MAP[els.lang.value] && PRONOUN_SEARCH_MAP[els.lang.value][token]) {
              badgeSearchTerm = PRONOUN_SEARCH_MAP[els.lang.value][token];
            }
            pictId = await queryFirstId(els.lang.value || 'it', badgeSearchTerm);
          }
        } catch (e) {
          pictId = null;
        }
        needBadges = true;
        const badge = document.createElement('div');
        badge.className = 'badge';
        
        if (emoji) {
          // Usa emoji
          const emojiSpan = document.createElement('span');
          emojiSpan.style.fontSize = '1.2rem';
          emojiSpan.textContent = emoji;
          badge.appendChild(emojiSpan);
        } else if (pictId) {
          // Usa immagine ARASAAC
          const badgeImg = document.createElement('img');
          badgeImg.src = `${STATIC_ROOT}/${pictId}/${pictId}_500.png`;
          badgeImg.alt = `Indicatore ${type}: ${token}`;
          badge.appendChild(badgeImg);
        }
        const badgeText = document.createElement('span');
        badgeText.style.fontSize = '.8rem';
        badgeText.style.color = '#374151';
        badgeText.textContent = token;
        badge.appendChild(badgeText);
        badgesContainer.appendChild(badge);
      }
      // Aggiungi i badge solo se l'utente ha attivato l'opzione
      const showBadges = els.showGrammarBadges.checked;
      if (needBadges && showBadges) {
        tile.appendChild(badgesContainer);
      }
    }

    async function createTileActionButtons(tile, word) {
      // Pulsante per aggiungere un simbolo personale
      const addBtn = document.createElement('button');
      addBtn.className = 'add-symbol-btn';
      addBtn.type = 'button';
      addBtn.innerHTML = '+';
  addBtn.title = translateUI('addSymbolButtonTitle');
      tile.appendChild(addBtn);
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openFileChooserForWord(tile, word);
      });
      
      // Pulsante per rimuovere l'associazione personalizzata
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-symbol-btn';
      removeBtn.type = 'button';
      removeBtn.innerHTML = '×';
  removeBtn.title = translateUI('removeSymbolButtonTitle');
      // Styles for this button are provided by the .remove-symbol-btn CSS class
      tile.appendChild(removeBtn);
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const currentIds = JSON.parse(tile.dataset.ids || '[]');
        const currentIndex = parseInt(tile.dataset.index || '0', 10);
        const currentId = currentIds[currentIndex];
        
        if (!currentId) {
          alert(translateUI('noSymbolsToRemove'));
          return;
        }
        
        // Determina il tipo di simbolo
        let symbolDesc = 'questo simbolo';
        if (typeof currentId === 'object' && currentId.type === 'local-file') {
          symbolDesc = 'questa immagine personalizzata';
        } else if (typeof currentId === 'string' && currentId.startsWith('data:')) {
          symbolDesc = 'questa immagine generata';
        }
        
  if (!confirm(translateUI('confirmRemoveSymbol', { symbolDesc: symbolDesc, word: word }))) {
          return;
        }
        
        // Rimuovi solo il simbolo corrente dall'array
        currentIds.splice(currentIndex, 1);
        
        // Aggiorna customImages rimuovendo solo questo simbolo
        const customImages = JSON.parse(localStorage.getItem('customSymbolImages') || '{}');
        if (customImages[word] && Array.isArray(customImages[word])) {
          // Trova e rimuovi lo stesso simbolo da customImages
          const customIndex = customImages[word].findIndex(item => {
            if (typeof item === 'object' && typeof currentId === 'object') {
              return item.id === currentId.id;
            }
            return item === currentId;
          });
          if (customIndex !== -1) {
            customImages[word].splice(customIndex, 1);
            if (customImages[word].length === 0) {
              delete customImages[word];
            }
            localStorage.setItem('customSymbolImages', JSON.stringify(customImages));
          }
        }
        
        // Aggiorna il tile
        tile.dataset.ids = JSON.stringify(currentIds);
        
        // Passa al simbolo successivo o torna a 0
        let newIndex = currentIndex;
        if (newIndex >= currentIds.length) {
          newIndex = currentIds.length > 0 ? 0 : 0;
        }
        tile.dataset.index = String(newIndex);
        
        dbg(`[Remove] Removed symbol at index ${currentIndex} for "${word}". Remaining: ${currentIds.length}`);
        
        // Aggiorna l'immagine del tile
        const tileImg = tile.querySelector('img');
        if (currentIds.length > 0) {
          if (tileImg) {
            setImageForTile(tile, tileImg);
          }
          setStatusKey('symbol_removed_next', { word: word });
        } else {
          // Non ci sono più simboli
          if (tileImg) {
            tileImg.remove();
          }
          // Aggiungi messaggio "nessun pittogramma"
          if (!tile.querySelector('.miss')) {
            const miss = document.createElement('div');
            miss.className = 'miss';
            miss.textContent = translateUI('noPictogramFound');
            const wordLabel = tile.querySelector('.word');
            if (wordLabel) {
              tile.insertBefore(miss, wordLabel);
            } else {
              tile.insertBefore(miss, tile.firstChild);
            }
          }
          setStatusKey('symbol_removed_none', { word: word });
        }
      });

      // Pulsante ABC per mostrare solo testo grande
      const abcBtn = document.createElement('button');
      abcBtn.className = 'abc-btn';
      abcBtn.type = 'button';
      abcBtn.innerHTML = 'abc';
  abcBtn.title = translateUI('abcShowText');
      tile.appendChild(abcBtn);
      abcBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isTextMode = tile.dataset.textOnlyMode === 'true';
        
        if (isTextMode) {
          // Torna alla modalità simbolo
          showSymbolMode(tile, word);
          abcBtn.innerHTML = 'abc';
          abcBtn.title = translateUI('abcShowText');
        } else {
          // Passa alla modalità testo
          showTextOnly(tile, word);
          abcBtn.innerHTML = '🖼️';
          abcBtn.title = translateUI('abcShowSymbol');
        }
      });

      // Contenitore per i bottoni GPT e Web Search
      const actionButtonsContainer = document.createElement('div');
  actionButtonsContainer.classList.add('action-buttons-container');
      
      // Pulsante per ricerca Wikipedia
      const webSearchBtn = document.createElement('button');
      webSearchBtn.className = 'gpt-symbol-btn';
      webSearchBtn.type = 'button';
      webSearchBtn.innerHTML = 'W';
      webSearchBtn.style.fontWeight = 'bold';
      webSearchBtn.style.fontFamily = 'serif';
  webSearchBtn.title = translateUI('wikiSearchButtonTitle');
      actionButtonsContainer.appendChild(webSearchBtn);
  webSearchBtn.addEventListener('click', safeAsync(async (e) => {
        e.stopPropagation();
        const promptMsg = translateUI('wikiPromptEnterTerm', { word: word });
        const searchTerm = prompt(promptMsg, word);
        if (searchTerm === null) return; // Annullato
        const finalTerm = searchTerm.trim() || word;
        await searchWebImages(tile, finalTerm);
      }));
      
      // Pulsante per ricerca Google Custom Search
      const googleSearchBtn = document.createElement('button');
      googleSearchBtn.className = 'gpt-symbol-btn';
      googleSearchBtn.type = 'button';
      googleSearchBtn.innerHTML = 'G';
      googleSearchBtn.style.fontWeight = 'bold';
      googleSearchBtn.style.fontFamily = 'serif';
  googleSearchBtn.title = translateUI('googleSearchButtonTitle');
      actionButtonsContainer.appendChild(googleSearchBtn);
  googleSearchBtn.addEventListener('click', safeAsync(async (e) => {
        e.stopPropagation();
        const promptMsg = translateUI('googlePromptEnterTerm', { word: word });
        const searchTerm = prompt(promptMsg, word);
        if (searchTerm === null) return; // Annullato
        let finalTerm = searchTerm.trim() || word;
        
        // Traduci in inglese se la lingua corrente non è inglese
        const currentLang = els.lang.value || 'it';
        if (currentLang !== 'en') {
          try {
            finalTerm = await translateItToEn(finalTerm);
            dbg('[Google Search] Translated prompt to English:', finalTerm);
          } catch (err) {
            console.warn('[Google Search] Translation of prompt failed:', err);
          }
        }
        
        await searchGoogleImages(tile, finalTerm);
      }));

      // Pulsante per ricerca personalizzata
      const searchBtn = document.createElement('button');
      searchBtn.className = 'gpt-symbol-btn';
      searchBtn.type = 'button';
      searchBtn.innerHTML = '🔎';
  searchBtn.title = translateUI('altSearchButtonTitle');
      actionButtonsContainer.appendChild(searchBtn);
  searchBtn.addEventListener('click', safeAsync(async (e) => {
        e.stopPropagation();
        const altPrompt = translateUI('altSymbolPrompt', { word: word });
        const searchTerm = prompt(altPrompt, '');
        if (!searchTerm || !searchTerm.trim()) return;
        
        searchBtn.disabled = true;
        searchBtn.textContent = '⏳';
        
        try {
          const lang = els.lang.value || 'it';
          const idsObj = await queryIds(lang, searchTerm.trim(), null);
          const ids = [...(idsObj.arasaacIds || []), ...(idsObj.openSymbols || [])];
          
          if (ids && ids.length > 0) {
            // Mostra una galleria per scegliere il simbolo
            showSymbolGallery(ids, searchTerm, tile, word);
            setStatusKey('search_found_for_term', { n: ids.length, term: searchTerm });
          } else {
            alert(translateUI('altSymbolNotFoundAlert', { term: searchTerm }));
          }
        } catch (err) {
          console.error('[Custom Search] Error:', err);
          alert(translateUI('searchError', { msg: (err.message || String(err)) }));
        }
        
        searchBtn.disabled = false;
        searchBtn.innerHTML = '🔎';
      }));
      
      const gptBtn = document.createElement('button');
      gptBtn.className = 'gpt-symbol-btn';
      gptBtn.type = 'button';
      gptBtn.innerHTML = '✨';
  gptBtn.title = translateUI('gptButtonTitle');
      actionButtonsContainer.appendChild(gptBtn);
      
      // Pulsante per unire simboli selezionati
      const mergeBtn = document.createElement('button');
      mergeBtn.className = 'gpt-symbol-btn';
      mergeBtn.type = 'button';
      mergeBtn.innerHTML = '🔗';
      mergeBtn.title = translateUI('mergeButtonTitle') || 'Unisci simboli selezionati (Ctrl+Click per selezionare)';
      actionButtonsContainer.appendChild(mergeBtn);
      mergeBtn.addEventListener('click', safeAsync(async (e) => {
        e.stopPropagation();
        if (selectedTiles.size < 2) {
          alert(translateUI('selectTwoSymbols') || 'Seleziona almeno 2 simboli con Ctrl+Click');
          return;
        }
        await mergeSelectedTiles();
      }));
      
      tile.appendChild(actionButtonsContainer);
  gptBtn.addEventListener('click', safeAsync(async (e) => {
        e.stopPropagation();
        
        // Controlla se la cartella è selezionata
        if (!checkLocalFolderSelected('generare simboli con AI')) {
          return;
        }
        
  const promptText = prompt(translateUI('gptDescribePrompt'), '');
  if (!promptText) return;
        gptBtn.disabled = true;
        gptBtn.textContent = '⏳';
        let images = [];
        try {
          images = await generateArasaacStyleImages(promptText, 1);
        } catch (err) {
          alert(translateUI('gptImageError', { msg: (err.message || String(err)) }));
          console.error('[GPT Image] Error:', err);
        }
        gptBtn.disabled = false;
        gptBtn.innerHTML = '✨';
        if (images.length > 0) {
          // Mostra l'immagine come preview e chiedi conferma
          const imageUrl = images[0];
          
          // Crea un dialog di preview
          const dialog = document.createElement('div');
          dialog.classList.add('custom-dialog');
          
          const previewImg = document.createElement('img');
          previewImg.src = imageUrl;
          previewImg.classList.add('preview-img');
          
          const message = document.createElement('p');
          message.textContent = translateUI('useImageForWord', { word: word });
          message.classList.add('dialog-message');
          
          const btnContainer = document.createElement('div');
          btnContainer.classList.add('dialog-btn-container');
          
          const cropBtn = document.createElement('button');
          cropBtn.textContent = translateUI('cropShort');
          cropBtn.className = 'button';
          cropBtn.classList.add('crop-btn');
          
          const acceptBtn = document.createElement('button');
          acceptBtn.textContent = translateUI('useImage');
          acceptBtn.className = 'button';
          acceptBtn.classList.add('dialog-button');
          
          const rejectBtn = document.createElement('button');
          rejectBtn.textContent = translateUI('cancel');
          rejectBtn.className = 'button ghost';
          rejectBtn.classList.add('dialog-button');
          
          const overlay = document.createElement('div');
          overlay.classList.add('dialog-overlay');
          
          cropBtn.onclick = () => {
            // Chiudi il dialog corrente e apri il crop editor
            document.body.removeChild(overlay);
            document.body.removeChild(dialog);
            openCropEditor(imageUrl, word, tile);
          };
          
          acceptBtn.onclick = async () => {
            acceptBtn.disabled = true;
            acceptBtn.textContent = translateUI('saving');
            
            try {
              // Salva l'immagine nella cartella locale
              const fileHandle = await saveImageToLocalFolder(imageUrl, word);
              
              dbg('[GPT Image] Saved AI image for:', word, 'File:', fileHandle.name);
              
              // Genera ID univoco e salva il FileHandle nella mappa
              const uniqueId = `local-file::${fileHandle.name}`;
              localFileHandleMap.set(uniqueId, fileHandle);
              
              // Aggiorna l'array ids del tile aggiungendo l'oggetto local-file all'inizio
              const ids = JSON.parse(tile.dataset.ids || '[]');
              const newLocalFile = { 
                type: 'local-file', 
                id: uniqueId,
                fileName: fileHandle.name,
                word: word 
              };
              
              // Rimuovi eventuali duplicati (confronto per id)
              const existingIndex = ids.findIndex(id => 
                id && typeof id === 'object' && id.type === 'local-file' && id.id === uniqueId
              );
              if (existingIndex !== -1) {
                ids.splice(existingIndex, 1);
              }
              
              ids.unshift(newLocalFile);
              tile.dataset.ids = JSON.stringify(ids);
              tile.dataset.index = '0';
              
              // Salva l'associazione parola → file in localStorage per riutilizzo futuro
              const customImagesStore = JSON.parse(localStorage.getItem('customSymbolImages') || '{}');
              if (!customImagesStore[word]) {
                customImagesStore[word] = [];
              }
              // Assicurati che sia un array
              if (!Array.isArray(customImagesStore[word])) {
                customImagesStore[word] = [customImagesStore[word]];
              }
              // Aggiungi solo se non già presente
              if (!customImagesStore[word].includes(uniqueId)) {
                customImagesStore[word].push(uniqueId);
                localStorage.setItem('customSymbolImages', JSON.stringify(customImagesStore));
                dbg('[GPT Image] Saved association:', word, '→', uniqueId);
              }
              
              // Aggiorna l'immagine del tile
              let tileImg = tile.querySelector('img');
                if (!tileImg) {
                // Se non c'è un'immagine, creala
                tileImg = document.createElement('img');
                // .tile img rules already style tile images; no inline styles needed
                // Inserisci prima del testo (wordLabel)
                const wordLabel = tile.querySelector('.word');
                if (wordLabel) {
                  tile.insertBefore(tileImg, wordLabel);
                } else {
                  tile.insertBefore(tileImg, tile.firstChild);
                }
              }
              
              // Carica l'immagine dal file
              const file = await fileHandle.getFile();
              const dataUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
              });
              tileImg.src = dataUrl;
              tileImg.alt = `Simbolo generato con AI per "${word}"`;
              
              // Rimuovi eventuale messaggio "nessun pittogramma"
              const miss = tile.querySelector('.miss');
              if (miss) miss.remove();
              
              // Rimuovi dialog e overlay
              document.body.removeChild(overlay);
              document.body.removeChild(dialog);
              
            } catch (error) {
              console.error('[GPT Image] Failed to save:', error);
              alert(error.message || translateUI('imageSaveError'));
              acceptBtn.disabled = false;
              acceptBtn.textContent = translateUI('useImage');
            }
          };
          
          rejectBtn.onclick = () => {
            // Annulla senza salvare
            document.body.removeChild(overlay);
            document.body.removeChild(dialog);
          };
          
          btnContainer.appendChild(cropBtn);
          btnContainer.appendChild(acceptBtn);
          btnContainer.appendChild(rejectBtn);
          
          dialog.appendChild(previewImg);
          dialog.appendChild(message);
          dialog.appendChild(btnContainer);
          
          document.body.appendChild(overlay);
          document.body.appendChild(dialog);
        }
      }));
    }

    async function addTile(id, word, skipped = false, tense = null, badges = [], highlight = false, insertBefore = null, container = null) {
  // Crea un nuovo tile che può contenere più ID (pittogrammi ARASAAC, TAWASOL, OpenSymbols, ecc.) e badge multipli.
  // insertBefore: se specificato, inserisce il tile prima di questo elemento, altrimenti lo aggiunge in fondo
  // container: se specificato, aggiunge il tile a questo container invece che a els.res
  // Puoi passare direttamente un array di simboli come id:
  // Esempio:
  // addTile([
  //   {image_url: 'https://d18vdu4p71yql0.cloudfront.net/libraries/arasaac/man.png.varianted-skin.png', name: 'uomo', repo: 'arasaac'},
  //   {image_url: 'https://d18vdu4p71yql0.cloudfront.net/libraries/tawasol/Man_3.png', name: 'Uomo 3', repo: 'tawasol'}
  // ], 'uomo');
      dbg('[addTile] called with id:', id, 'word:', word);
      const tile = document.createElement('div');
      tile.className = 'tile';
      if (highlight) {
        tile.classList.add('inserted');
      }
      tile.dataset.word = word;
      // Se id è una lista (array), utilizzalo, altrimenti trasformalo in array. Quando null o undefined, diventa array vuoto.
      const ids = Array.isArray(id) ? id : (id ? [id] : []);
      
      // Verifica se esistono immagini custom per questa parola e inseriscile all'inizio (in ordine)
      const customImages = JSON.parse(localStorage.getItem('customSymbolImages') || '{}');
      if (customImages[word]) {
        let customUrls = customImages[word];
        // Supporto retrocompatibilità: converti da stringa a array
        if (!Array.isArray(customUrls)) {
          customUrls = [customUrls];
        }
        // Rimuovi eventuali copie già presenti nell'array ids
        customUrls.forEach(customUrl => {
          const existingIndex = ids.findIndex(idItem => idItem === customUrl);
          if (existingIndex !== -1) {
            ids.splice(existingIndex, 1);
          }
        });
        // Inserisci tutte le immagini custom all'inizio (in ordine inverso per mantenere l'ordine)
        for (let i = customUrls.length - 1; i >= 0; i--) {
          const customUrl = customUrls[i];
          // Se è un ID di file locale (local-file::...), convertilo in oggetto
          if (typeof customUrl === 'string' && customUrl.startsWith('local-file::')) {
            const fileName = customUrl.replace('local-file::', '');
            const localImageObj = {
              type: 'local-file',
              id: customUrl,
              fileName: fileName,
              word: word
            };
            ids.unshift(localImageObj);
          } else {
            // Immagine data: URL o altro formato
            ids.unshift(customUrl);
          }
        }
        dbg('[addTile] Added', customUrls.length, 'custom image(s) at beginning for:', word);
      }
      
      // Verifica se ci sono immagini dalla cartella locale per questa parola
      const wordLower = word.toLowerCase();
      if (localImageFiles[wordLower] && localImageFiles[wordLower].length > 0) {
        const localFiles = localImageFiles[wordLower];
        dbg('[addTile] Found', localFiles.length, 'local image(s) for:', word);
        
        // Converti i FileHandle in oggetti con ID univoci (i FileHandle non sono serializzabili)
        for (const fileHandle of localFiles) {
          // Genera un ID univoco basato sul nome del file
          const uniqueId = `local-file::${fileHandle.name}`;
          
          // Salva il FileHandle nella mappa globale
          localFileHandleMap.set(uniqueId, fileHandle);
          
          // Crea un oggetto serializzabile
          const localImageObj = {
            type: 'local-file',
            id: uniqueId,
            fileName: fileHandle.name,
            word: word
          };
          
          // Inserisci dopo le immagini custom ma prima delle ARASAAC/OpenSymbols
          const insertPosition = customImages[word] ? (Array.isArray(customImages[word]) ? customImages[word].length : 1) : 0;
          ids.splice(insertPosition, 0, localImageObj);
        }
        dbg('[addTile] Added', localFiles.length, 'local image(s) for:', word);
      }
      
      dbg('[addTile] ids array after processing:', ids);
      tile.dataset.ids = JSON.stringify(ids);
      tile.dataset.index = '0';
      if (ids.length > 0) {
        // Crea l'elemento immagine e impostalo in base all'id corrente
        const img = document.createElement('img');
        img.loading = 'lazy'; img.decoding = 'async'; img.crossOrigin = 'anonymous';
        setImageForTile(tile, img);
        tile.appendChild(img);
        // Label della parola
        const label = document.createElement('div');
        label.className = 'word';
        label.textContent = word;
        tile.appendChild(label);
        // Badge della fonte se OpenSymbols (repo presente)
        if (Array.isArray(id) && id.length === 1 && typeof id[0] === 'object' && id[0].repo) {
          const repoBadge = document.createElement('span');
          repoBadge.className = 'repo-badge';
          repoBadge.textContent = id[0].repo.toUpperCase();
          label.appendChild(repoBadge);
        }
        await createTileBadges(tile, tense, badges);
      } else {
        // Nessun id trovato: mostra solo la parola (senza messaggio)
        const label = document.createElement('div');
        label.className = 'word';
        label.textContent = word;
        tile.appendChild(label);
      }
      await createTileActionButtons(tile, word);

      // Gestisce il cambio immagine quando si clicca sul tile (eccetto il pulsante '+')
      // Con Ctrl+Click seleziona il tile per l'unione
      tile.addEventListener('click', (e) => {
        // Se Ctrl è premuto, seleziona/deseleziona il tile
        if (e.ctrlKey || e.metaKey) {
          e.stopPropagation();
          toggleTileSelection(tile);
        } else {
          // Altrimenti cicla l'immagine normalmente
          cycleTileImage(tile);
        }
      });
      
      // Inserisci il tile nella posizione specificata o in fondo
      const targetContainer = container || els.res;
      if (insertBefore) {
        targetContainer.insertBefore(tile, insertBefore);
      } else {
        targetContainer.appendChild(tile);
      }
      
      // Se è una parola funzionale (skipped), mostra automaticamente solo il testo grande
      if (skipped) {
        showTextOnly(tile, word);
        // Aggiorna l'icona del bottone abc
        const abcBtn = tile.querySelector('.abc-btn');
        if (abcBtn) {
          abcBtn.innerHTML = '🖼️';
          abcBtn.title = translateUI('abcShowSymbol');
        }
      }
    }
// openCropEditor is now in js/cropEditor.js

/**
 * Generic helper to open a search-results modal.
 * @param {object} options
 * @param {string}   options.title        - Modal heading text
 * @param {string}  [options.subtitle]    - Optional secondary line
 * @param {Array}    options.items        - Array of {src, alt, label?, tooltip?, data?}
 * @param {function} options.onSelect     - Called with (item, index) when user clicks a card
 * @param {function}[options.onClose]     - Extra logic when the modal is dismissed
 * @param {string}  [options.closeBtnLabel] - Button text (defaults to translateUI('close'))
 * @param {string}  [options.gridClass]   - CSS class for the grid ('gallery-grid' | null)
 * @param {string}  [options.cardClass]   - CSS class for each card ('symbol-card' | null)
 * @param {boolean} [options.useTooltipOverlay] - Render tooltip overlay on cards
 * @returns {{overlay: HTMLElement, modal: HTMLElement, close: function}}
 */
function openSearchModal(options) {
  var title      = options.title || '';
  var subtitle   = options.subtitle || '';
  var items      = options.items || [];
  var onSelect   = options.onSelect;
  var onClose    = options.onClose;
  var closeBtnLabel    = options.closeBtnLabel || translateUI('close');
  var gridClass        = options.gridClass || null;
  var cardClass        = options.cardClass || null;
  var useTooltipOverlay = !!options.useTooltipOverlay;

  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:9998;';

  var modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;border-radius:12px;padding:24px;max-width:800px;width:90%;max-height:80vh;overflow-y:auto;z-index:9999;';

  var heading = document.createElement('h3');
  heading.textContent = title;
  heading.style.cssText = 'margin:0 0 10px 0;font-size:1.5rem;color:#1e293b;';
  modal.appendChild(heading);

  if (subtitle) {
    var sub = document.createElement('p');
    sub.textContent = subtitle;
    sub.style.cssText = 'margin:0 0 20px 0;color:#64748b;font-size:0.95rem;';
    modal.appendChild(sub);
  }

  var grid = document.createElement('div');
  if (gridClass) {
    grid.classList.add(gridClass);
  } else {
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:12px;';
  }

  items.forEach(function (item, index) {
    var card = document.createElement('div');
    if (cardClass) {
      card.classList.add(cardClass);
    } else {
      card.style.cssText = 'cursor:pointer;border:2px solid transparent;border-radius:8px;overflow:hidden;transition:border-color 0.2s;position:relative;';
    }

    var img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt || '';
    img.loading = 'lazy';
    img.crossOrigin = 'anonymous';
    if (!cardClass) {
      img.style.cssText = 'width:100%;height:150px;object-fit:cover;';
    }
    img.onerror = function () {
      if (cardClass) {
        img.style.display = 'none';
        var errMsg = document.createElement('div');
        errMsg.textContent = '\u274C';
        errMsg.style.cssText = 'font-size:2rem;color:#ef4444;padding:20px;';
        card.appendChild(errMsg);
      } else {
        card.style.display = 'none';
      }
    };
    card.appendChild(img);

    if (item.label) {
      var lbl = document.createElement('div');
      lbl.textContent = item.label;
      lbl.style.cssText = 'font-size:0.85rem;color:#64748b;';
      card.appendChild(lbl);
    }

    if (useTooltipOverlay && item.tooltip) {
      var tip = document.createElement('div');
      tip.textContent = item.tooltip;
      tip.style.cssText = 'position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.7);color:white;font-size:0.7rem;padding:4px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;';
      card.appendChild(tip);
    }

    if (cardClass) {
      card.onmouseenter = function () {
        card.style.borderColor = '#3b82f6';
        card.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
        card.style.transform = 'translateY(-2px)';
      };
      card.onmouseleave = function () {
        card.style.borderColor = '#e5e7eb';
        card.style.boxShadow = 'none';
        card.style.transform = 'translateY(0)';
      };
    } else {
      card.addEventListener('mouseenter', function () {
        card.style.borderColor = '#2a9df4';
      });
      card.addEventListener('mouseleave', function () {
        card.style.borderColor = 'transparent';
      });
    }

    card.addEventListener('click', function () {
      if (typeof onSelect === 'function') {
        onSelect(item, index);
      }
    });

    grid.appendChild(card);
  });

  modal.appendChild(grid);

  var closeBtn = document.createElement('button');
  closeBtn.textContent = closeBtnLabel;
  closeBtn.className = 'button ghost';
  closeBtn.style.cssText = 'margin-top:16px;width:100%;padding:12px;';
  closeBtn.addEventListener('click', function () {
    closeFn();
  });
  modal.appendChild(closeBtn);

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  function closeFn() {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (modal.parentNode) modal.parentNode.removeChild(modal);
    if (typeof onClose === 'function') onClose();
  }

  overlay.addEventListener('click', function () {
    closeFn();
  });

  return { overlay: overlay, modal: modal, close: closeFn };
}

// Funzione per mostrare una galleria di simboli tra cui scegliere
function showSymbolGallery(symbolIds, searchTerm, targetTile, targetWord) {
  // Build items array with the correct image src for each symbol ID
  var items = symbolIds.map(function (symbolId, index) {
    var src = '';
    if (typeof symbolId === 'string' && symbolId.startsWith('data:')) {
      src = symbolId;
    } else if (typeof symbolId === 'object' && symbolId.image_url) {
      src = symbolId.image_url.startsWith('http')
        ? 'https://corsproxy.io/?' + encodeURIComponent(symbolId.image_url)
        : symbolId.image_url;
    } else if (typeof symbolId === 'object' && symbolId.url) {
      src = symbolId.url.startsWith('http')
        ? 'https://corsproxy.io/?' + encodeURIComponent(symbolId.url)
        : symbolId.url;
    } else if (typeof symbolId === 'string' || typeof symbolId === 'number') {
      src = API_ROOT + '/' + symbolId + '?download=false';
    } else if (symbolId._id) {
      src = API_ROOT + '/' + symbolId._id + '?download=false';
    }
    return { src: src, alt: targetWord, label: '#' + (index + 1), data: symbolId };
  });

  var modalRef = openSearchModal({
    title: 'Scegli un simbolo per "' + targetWord + '"',
    subtitle: 'Risultati per: "' + searchTerm + '" (' + symbolIds.length + ' simboli)',
    items: items,
    gridClass: 'gallery-grid',
    cardClass: 'symbol-card',
    closeBtnLabel: translateUI('cancel'),
    onSelect: function (item, index) {
      var symbolId = item.data;
      // Aggiorna il tile con il simbolo selezionato
      var currentIds = JSON.parse(targetTile.dataset.ids || '[]');

      // Verifica duplicati
      var isDuplicate = currentIds.some(function (existingId) {
        if (typeof existingId === 'string' && typeof symbolId === 'string') {
          return existingId === symbolId;
        }
        if (typeof existingId === 'object' && typeof symbolId === 'object') {
          return existingId._id === symbolId._id;
        }
        return false;
      });

      if (!isDuplicate) {
        currentIds.unshift(symbolId);
      }

      targetTile.dataset.ids = JSON.stringify(currentIds);
      targetTile.dataset.index = '0';

      // SALVA LA SCELTA IN customImages per usarla nei prossimi usi della stessa parola
      var customImages = JSON.parse(localStorage.getItem('customSymbolImages') || '{}');
      if (!customImages[targetWord]) {
        customImages[targetWord] = [];
      } else if (!Array.isArray(customImages[targetWord])) {
        customImages[targetWord] = [customImages[targetWord]];
      }

      // Aggiungi il simbolo scelto in prima posizione se non c'è già
      if (!isDuplicate) {
        customImages[targetWord].unshift(symbolId);
        localStorage.setItem('customSymbolImages', JSON.stringify(customImages));
        dbg('[showSymbolGallery] Saved symbol ' + JSON.stringify(symbolId) + ' for word "' + targetWord + '"');
      }

      // Aggiorna l'immagine IMMEDIATAMENTE
      var tileImg = targetTile.querySelector('img');
      if (tileImg) {
        setImageForTile(targetTile, tileImg);
      } else {
        var newImg = document.createElement('img');
        newImg.loading = 'lazy';
        newImg.decoding = 'async';
        newImg.crossOrigin = 'anonymous';
        var wordLabel = targetTile.querySelector('.word');
        if (wordLabel) {
          targetTile.insertBefore(newImg, wordLabel);
        } else {
          targetTile.insertBefore(newImg, targetTile.firstChild);
        }
        setImageForTile(targetTile, newImg);
      }

      // Rimuovi eventuale messaggio "nessun pittogramma trovato"
      var miss = targetTile.querySelector('.miss');
      if (miss) miss.remove();

      modalRef.close();
      setStatusKey('symbol_selected_saved', { word: targetWord });
    }
  });
}
      
// Funzione per cercare immagini sul web e mostrarle in una modale
async function searchWebImages(tile, word) {
  dbg('[Web Search] Searching images for:', word);
  
  // Usa Wikipedia/Wikimedia Commons API (lingua basata sulla selezione corrente)
  const lang = (document.getElementById('lang') || { value: 'it' }).value || localStorage.getItem('appLang') || 'it';
  const domain = (lang === 'es') ? 'es' : (lang === 'en') ? 'en' : 'it';
  const searchQuery = encodeURIComponent(word);
  const wikiUrl = `https://${domain}.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${searchQuery}&gsrlimit=20&prop=pageimages|images&piprop=thumbnail&pithumbsize=300&pilimit=20`;
  
  try {
    const response = await fetch(wikiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.query || !data.query.pages) {
      alert(translateUI('wikiNoImagesFoundAlert', { word: word }));
      return;
    }
    
    // Estrai le immagini dalle pagine
    const images = [];
    Object.values(data.query.pages).forEach(page => {
      if (page.thumbnail && page.thumbnail.source) {
        images.push({
          thumbnail: page.thumbnail.source,
          full: page.thumbnail.source.replace(/\/\d+px-/, '/800px-'),
          title: page.title
        });
      }
    });
    
    if (images.length === 0) {
      alert(translateUI('wikiNoImagesFoundAlert', { word: word }));
      return;
    }
    
    dbg('[Web Search] Found', images.length, 'images');

    // Build items for the generic modal helper
    var modalItems = images.map(function (image) {
      return {
        src: image.thumbnail,
        alt: image.title || word,
        tooltip: image.title || '',
        data: image
      };
    });

    var modalRef = openSearchModal({
      title: 'Scegli un\'immagine per "' + word + '"',
      items: modalItems,
      useTooltipOverlay: true,
      onSelect: function (item) {
        var selectedImageUrl = item.data.full;
        modalRef.close();
        saveWebImageToTile(tile, word, selectedImageUrl);
      }
    });
    
  } catch (error) {
    console.error('[Web Search] Error:', error);
  alert(translateUI('searchError', { msg: error.message }));
  }
}

// Funzione per ricerca immagini Google Custom Search
async function searchGoogleImages(tile, word) {
  dbg('[Google Search] Searching images for:', word);
  
  // Verifica credenziali
  if (!googleApiKey || !googleCx) {
    alert(translateUI('googleCredsMissingAlert'));
    return;
  }
  
  try {
    // Traduci il termine in inglese per migliorare i risultati
    let searchTerm = word;
    const currentLang = els.lang.value || 'it';
    if (currentLang !== 'en') {
      try {
        dbg('[Google Search] Translating to English:', word);
        searchTerm = await translateItToEn(word);
        dbg('[Google Search] English term:', searchTerm);
      } catch (err) {
        console.warn('[Google Search] Translation failed, using original term:', err);
        searchTerm = word;
      }
    }
    
    // Google Custom Search API v1
    const searchQuery = encodeURIComponent(searchTerm);
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCx}&q=${searchQuery}&searchType=image&num=10&imgSize=medium&safe=active`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 429) {
        throw new Error(translateUI('googleDailyLimitError'));
      }
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      alert(translateUI('googleNoImagesFoundAlert', { word: word }));
      return;
    }
    
    // Estrai le immagini
    const images = data.items.map(item => ({
      thumbnail: item.image.thumbnailLink,
      full: item.link,
      title: item.title,
      context: item.displayLink
    }));
    
    dbg('[Google Search] Found', images.length, 'images');

    // Build items for the generic modal helper
    var modalItems = images.map(function (image) {
      return {
        src: image.thumbnail,
        alt: image.title || word,
        tooltip: (image.title || '') + ' (' + (image.context || '') + ')',
        data: image
      };
    });

    var modalRef = openSearchModal({
      title: 'Scegli un\'immagine per "' + word + '" (Google)',
      items: modalItems,
      useTooltipOverlay: true,
      onSelect: function (item) {
        try {
          modalRef.close();
          saveWebImageToTile(tile, word, item.data.full);
        } catch (err) {
          console.error('[Google Search] Error saving image:', err);
          alert(translateUI('genericSaveErrorWithMsg', { msg: err.message }));
        }
      }
    });
    
  } catch (error) {
    console.error('[Google Search] Error:', error);
  alert(translateUI('searchError', { msg: error.message }));
  }
}

// Funzione per salvare immagine web nel tile
async function saveWebImageToTile(tile, word, imageUrl) {
  try {
    dbg('[Web Image] Saving image for:', word, 'URL:', imageUrl);
    
    // Lista di proxy CORS da provare in ordine
    const corsProxies = [
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url=',
      'https://api.codetabs.com/v1/proxy?quest='
    ];
    
    let blob = null;
    let lastError = null;
    
    // Scarica l'immagine usando proxy CORS se necessario
    if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('blob:')) {
      // Prova con ciascun proxy finché uno non funziona
      for (let i = 0; i < corsProxies.length; i++) {
        const proxy = corsProxies[i];
        const fetchUrl = `${proxy}${encodeURIComponent(imageUrl)}`;
        
        try {
          dbg(`[Web Image] Attempt ${i + 1}/${corsProxies.length} using proxy:`, proxy);
          const response = await fetch(fetchUrl);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          blob = await response.blob();
          dbg('[Web Image] Downloaded blob size:', blob.size, 'type:', blob.type);
          
          // Verifica che sia davvero un'immagine
          if (!blob.type.startsWith('image/')) {
            console.warn('[Web Image] Response is not an image:', blob.type);
            throw new Error('Response is not an image');
          }
          
          // Successo! Esci dal loop
          break;
        } catch (err) {
          console.warn(`[Web Image] Proxy ${proxy} failed:`, err.message);
          lastError = err;
          // Prova con il prossimo proxy
          continue;
        }
      }
      
      // Se nessun proxy ha funzionato, lancia errore
      if (!blob) {
        throw new Error(`Impossibile scaricare l'immagine dopo ${corsProxies.length} tentativi. Ultimo errore: ${lastError?.message || 'Unknown'}`);
      }
    } else {
      // È già un data: o blob: URL, scaricalo direttamente
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      blob = await response.blob();
      dbg('[Web Image] Downloaded blob size:', blob.size, 'type:', blob.type);
    }
    
    // Converti in data URL
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    
    // Comprimi l'immagine
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Importante per evitare errori CORS nel canvas
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = (err) => {
        console.error('[Web Image] Error loading image into canvas:', err);
        reject(new Error('Impossibile caricare l\'immagine'));
      };
      img.src = dataUrl;
    });
    
    dbg('[Web Image] Image loaded, dimensions:', img.width, 'x', img.height);
    
    const maxSize = 800;
    let width = img.width;
    let height = img.height;
    
    if (width > maxSize || height > maxSize) {
      if (width > height) {
        height = (height / width) * maxSize;
        width = maxSize;
      } else {
        width = (width / height) * maxSize;
        height = maxSize;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    
    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    // Verifica se la cartella locale è selezionata
    if (!checkLocalFolderSelected('salvare immagini da web')) {
      return;
    }
    
    // Salva nella cartella locale
    try {
      // Converti data URL in blob
      const compressedBlob = await fetch(compressedDataUrl).then(r => r.blob());
      
      // Salva usando la funzione esistente
      const fileHandle = await saveImageToLocalFolder(compressedBlob, word);
      
      dbg('[Web Image] Saved to local folder:', fileHandle.name);
      
      // Genera ID univoco e salva il FileHandle nella mappa
      const uniqueId = `local-file::${fileHandle.name}`;
      localFileHandleMap.set(uniqueId, fileHandle);
      
      // Aggiorna il tile con riferimento al file locale
      const ids = JSON.parse(tile.dataset.ids || '[]');
      const newLocalFile = { 
        type: 'local-file', 
        id: uniqueId,
        fileName: fileHandle.name,
        word: word 
      };
      
      ids.unshift(newLocalFile);
      tile.dataset.ids = JSON.stringify(ids);
      tile.dataset.index = '0';
      
      // Salva l'associazione parola → file in localStorage per riutilizzo futuro
      const customImages = JSON.parse(localStorage.getItem('customSymbolImages') || '{}');
      if (!customImages[word]) {
        customImages[word] = [];
      } else if (!Array.isArray(customImages[word])) {
        customImages[word] = [customImages[word]];
      }
      // Aggiungi solo se non già presente (usa l'ID univoco invece dell'oggetto)
      if (!customImages[word].includes(uniqueId)) {
        customImages[word].push(uniqueId);
        localStorage.setItem('customSymbolImages', JSON.stringify(customImages));
        dbg('[Web Image] Saved association:', word, '→', uniqueId);
      }
      
      // Aggiorna l'immagine del tile
      let tileImg = tile.querySelector('img');
      if (!tileImg) {
        // Se non c'è un'immagine, creala
        tileImg = document.createElement('img');
        tileImg.style.cssText = 'max-width: 100%; max-height: 130px; object-fit: contain; display: block; margin: 0 auto;';
        const wordLabel = tile.querySelector('.word');
        if (wordLabel) {
          tile.insertBefore(tileImg, wordLabel);
        } else {
          tile.insertBefore(tileImg, tile.firstChild);
        }
      }
      
      // Carica l'immagine dal file salvato
      const file = await fileHandle.getFile();
      const fileDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      tileImg.src = fileDataUrl;
      tileImg.alt = `Immagine web per "${word}"`;
      
      // Rimuovi eventuale messaggio "nessun pittogramma"
      const miss = tile.querySelector('.miss');
      if (miss) miss.remove();
      
      dbg('[Web Image] Image saved and tile updated successfully');
      
    } catch (err) {
      console.error('[Web Image] Could not save to local folder:', err);
  alert(translateUI('genericSaveErrorWithMsg', { msg: err.message }));
    }
    
  } catch (error) {
    console.error('[Web Image] Error saving:', error);
  alert(translateUI('genericSaveErrorWithMsg', { msg: error.message }));
  }
}

    function toggleTileSelection(tile) {
      if (selectedTiles.has(tile)) {
        selectedTiles.delete(tile);
        tile.classList.remove('selected');
      } else {
        selectedTiles.add(tile);
        tile.classList.add('selected');
      }
      
      // mergeButton visibility removed - button now in sentence-box
    }

    // Funzione per unire i simboli selezionati
    async function mergeSelectedTiles() {
      if (selectedTiles.size < 2) {
        alert(translateUI('selectTwoSymbols'));
        return;
      }

      // Estrai le parole dai tile selezionati nell'ordine
      const tilesArray = Array.from(selectedTiles);
      const words = tilesArray.map(tile => {
        const wordEl = tile.querySelector('.word');
        return wordEl ? wordEl.textContent.trim() : '';
      }).filter(Boolean);

      const mergedPhrase = words.join(' ');
      
      dbg('[Merge] Unendo simboli:', words, '→', mergedPhrase);
      
      // Salva la posizione del primo tile E il suo container prima di rimuoverli
      const firstTile = tilesArray[0];
      const targetContainer = firstTile.parentNode; // Salva il container (sentence-box o els.res)
      let insertPosition = firstTile.nextSibling;
      
      dbg('[Merge] Container del primo tile:', targetContainer);
      dbg('[Merge] insertPosition:', insertPosition);
      
      // Verifica che insertPosition non sia uno dei tile che stiamo per rimuovere
      while (insertPosition && selectedTiles.has(insertPosition)) {
        insertPosition = insertPosition.nextSibling;
      }
      
      // Rimuovi i tile selezionati
      tilesArray.forEach(tile => tile.remove());
      selectedTiles.clear();
      // mergeButton removed - no longer in toolbar
      
      // Verifica che insertPosition sia ancora nel DOM
      if (insertPosition && !insertPosition.parentNode) {
        insertPosition = null;
      }

      // Cerca il simbolo per la frase unita
      const lang = els.lang.value || 'it';
      try {
        const idsObj = await queryIds(lang, mergedPhrase, null);
        const ids = [...(idsObj.arasaacIds || []), ...(idsObj.openSymbols || [])];
        
          if (ids && ids.length > 0) {
            dbg('[Merge] Simbolo trovato per:', mergedPhrase);
            await addTile(ids, mergedPhrase, false, null, [], false, insertPosition, targetContainer);
            setStatusKey('merged_symbol_found', { phrase: mergedPhrase });
          } else {
            dbg('[Merge] Nessun simbolo trovato per:', mergedPhrase);
            await addTile([], mergedPhrase, false, null, [], false, insertPosition, targetContainer);
            setStatusKey('merged_symbol_not_found', { phrase: mergedPhrase });
          }
      } catch (err) {
        console.error('[Merge] Errore:', err);
        await addTile([], mergedPhrase, false, null, [], false, insertPosition, targetContainer);
        setStatusKey('merged_search_error', { phrase: mergedPhrase }, true);
      }
    }
