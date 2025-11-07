/**
 * Storage Module
 * 
 * Gestisce tutte le operazioni di storage:
 * - localStorage per cache e impostazioni
 * - File System Access API per immagini locali
 * - Import/Export dati
 */

import state from './state.js';

// ==================== localStorage ====================

/**
 * Salva immagini personalizzate con gestione quota intelligente
 * @param {Object} customImages - Oggetto con mappature parola → immagini
 * @param {string} currentWord - Parola corrente (opzionale, per priorità)
 * @returns {Object} Risultato operazione {success, message, freedSpace}
 */
export function saveCustomImages(customImages, currentWord = null) {
  try {
    const jsonStr = JSON.stringify(customImages);
    const sizeKB = (jsonStr.length / 1024).toFixed(2);
    console.log('[Storage] customSymbolImages size:', sizeKB, 'KB');
    
    localStorage.setItem('customSymbolImages', jsonStr);
    return { success: true };
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.warn('[Storage] QuotaExceededError - localStorage pieno, tento di liberare spazio...');
      
      const totalWords = Object.keys(customImages).length;
      const totalImages = Object.values(customImages).reduce((sum, arr) => {
        return sum + (Array.isArray(arr) ? arr.length : 1);
      }, 0);
      
      // Strategia 1: Pulisci altre cache
      const keysToRemove = [];
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('translation_') || key.startsWith('synonyms_') || key === 'personalSymbols') {
          keysToRemove.push(key);
        }
      });
      
      if (keysToRemove.length > 0) {
        keysToRemove.forEach(k => localStorage.removeItem(k));
        console.log(`[Storage] Cancellati ${keysToRemove.length} elementi cache`);
        
        try {
          localStorage.setItem('customSymbolImages', JSON.stringify(customImages));
          return {
            success: true,
            freedSpace: true,
            message: `Liberati ${keysToRemove.length} elementi di cache.`
          };
        } catch (retryError) {
          console.warn('[Storage] Ancora insufficiente dopo pulizia cache');
        }
      }
      
      // Strategia 2: Rimuovi immagini di altre parole
      if (currentWord && totalWords > 1) {
        const wordsWithImages = Object.entries(customImages)
          .filter(([word]) => word !== currentWord)
          .map(([word, imgs]) => ({
            word,
            count: Array.isArray(imgs) ? imgs.length : 1
          }))
          .sort((a, b) => b.count - a.count);
        
        if (wordsWithImages.length > 0) {
          const wordToRemove = wordsWithImages[0].word;
          const removedCount = Array.isArray(customImages[wordToRemove]) 
            ? customImages[wordToRemove].length 
            : 1;
          delete customImages[wordToRemove];
          
          console.log(`[Storage] Rimosse ${removedCount} immagini da "${wordToRemove}"`);
          
          try {
            localStorage.setItem('customSymbolImages', JSON.stringify(customImages));
            return {
              success: true,
              freedSpace: true,
              message: `Memoria piena! Rimosse ${removedCount} immagini da "${wordToRemove}".`
            };
          } catch (retryError) {
            console.error('[Storage] Ancora insufficiente dopo rimozione');
          }
        }
      }
      
      return {
        success: false,
        error: 'quota',
        message: `Memoria piena! ${totalImages} immagini per ${totalWords} parole.\n\nUsa "📁 Seleziona Cartella Immagini".`
      };
    }
    
    return {
      success: false,
      error: 'unknown',
      message: 'Errore salvataggio: ' + e.message
    };
  }
}

/**
 * Carica immagini personalizzate da localStorage
 * @returns {Object} Oggetto con mappature parola → immagini
 */
export function loadCustomImages() {
  try {
    const stored = localStorage.getItem('customSymbolImages');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error('[Storage] Errore caricamento immagini personalizzate:', e);
    return {};
  }
}

/**
 * Salva traduzione in cache
 * @param {string} text - Testo originale
 * @param {string} translation - Traduzione
 * @param {string} fromLang - Lingua di partenza
 * @param {string} toLang - Lingua di destinazione
 */
export function cacheTranslation(text, translation, fromLang = 'it', toLang = 'en') {
  const cacheKey = `translation_${fromLang}_${toLang}_${text.toLowerCase()}`;
  try {
    localStorage.setItem(cacheKey, translation);
  } catch (e) {
    console.warn('[Storage] Impossibile salvare traduzione in cache:', e);
  }
}

/**
 * Recupera traduzione da cache
 * @param {string} text - Testo da tradurre
 * @param {string} fromLang - Lingua di partenza
 * @param {string} toLang - Lingua di destinazione
 * @returns {string|null} Traduzione cached o null
 */
export function getCachedTranslation(text, fromLang = 'it', toLang = 'en') {
  const cacheKey = `translation_${fromLang}_${toLang}_${text.toLowerCase()}`;
  return localStorage.getItem(cacheKey);
}

/**
 * Salva sinonimi in cache
 * @param {string} word - Parola
 * @param {string[]} synonyms - Array di sinonimi
 * @param {string} lang - Lingua
 */
export function cacheSynonyms(word, synonyms, lang = 'it') {
  const cacheKey = `synonyms_${lang}_${word.toLowerCase()}`;
  try {
    localStorage.setItem(cacheKey, JSON.stringify(synonyms));
  } catch (e) {
    console.warn('[Storage] Impossibile salvare sinonimi in cache:', e);
  }
}

/**
 * Recupera sinonimi da cache
 * @param {string} word - Parola
 * @param {string} lang - Lingua
 * @returns {string[]|null} Array di sinonimi o null
 */
export function getCachedSynonyms(word, lang = 'it') {
  const cacheKey = `synonyms_${lang}_${word.toLowerCase()}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// ==================== File System Access API ====================

/**
 * Salva immagine nella cartella locale
 * @param {Blob|File|string} imageData - Dati immagine (Blob, File o dataURL)
 * @param {string} word - Parola associata
 * @returns {Promise<FileSystemFileHandle>} Handle del file salvato
 */
export async function saveImageToLocalFolder(imageData, word) {
  if (!state.storage.localImageFolderHandle) {
    throw new Error('Nessuna cartella locale selezionata.');
  }
  
  // Verifica permessi
  const permission = await state.storage.localImageFolderHandle.requestPermission({ mode: 'readwrite' });
  if (permission !== 'granted') {
    throw new Error('Permesso di scrittura negato.');
  }
  
  // Converti in Blob
  let blob;
  if (imageData instanceof File) {
    // Comprimi prima di salvare
    const compressed = await compressImage(imageData, 800, 800, 0.8);
    const response = await fetch(compressed);
    blob = await response.blob();
  } else if (typeof imageData === 'string' && imageData.startsWith('data:')) {
    const response = await fetch(imageData);
    blob = await response.blob();
  } else if (imageData instanceof Blob) {
    blob = imageData;
  } else {
    throw new Error('Formato immagine non supportato');
  }
  
  // Determina estensione
  const mimeType = blob.type;
  let extension = 'png';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
  else if (mimeType.includes('png')) extension = 'png';
  else if (mimeType.includes('webp')) extension = 'webp';
  
  // Nome file univoco
  const timestamp = Date.now();
  const fileName = `${word}_ai_${timestamp}.${extension}`;
  
  console.log('[Storage] Salvataggio immagine:', fileName, 'Dimensione:', blob.size, 'bytes');
  
  // Crea file
  const fileHandle = await state.storage.localImageFolderHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
  
  console.log('[Storage] Immagine salvata:', fileName);
  
  // Aggiorna cache
  const wordKey = word.toLowerCase();
  if (!state.storage.localImageFiles[wordKey]) {
    state.storage.localImageFiles[wordKey] = [];
  }
  state.storage.localImageFiles[wordKey].push(fileHandle);
  
  return fileHandle;
}

/**
 * Comprimi un'immagine
 * @param {File} file - File immagine
 * @param {number} maxWidth - Larghezza massima
 * @param {number} maxHeight - Altezza massima
 * @param {number} quality - Qualità (0-1)
 * @returns {Promise<string>} Data URL dell'immagine compressa
 */
export function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        const originalSize = (e.target.result.length / 1024).toFixed(2);
        const compressedSize = (dataUrl.length / 1024).toFixed(2);
        console.log(`[Storage Compress] ${originalSize} KB → ${compressedSize} KB (${((compressedSize / originalSize) * 100).toFixed(1)}%)`);
        
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Seleziona cartella locale per immagini
 * @returns {Promise<FileSystemDirectoryHandle>} Handle della cartella
 */
export async function selectLocalFolder() {
  if (!window.showDirectoryPicker) {
    throw new Error('Browser non supporta selezione cartelle.');
  }
  
  const dirHandle = await window.showDirectoryPicker({
    mode: 'read',
    startIn: 'pictures'
  });
  
  state.storage.localImageFolderHandle = dirHandle;
  
  // Scansiona file
  console.log('[Storage] Scansione cartella:', dirHandle.name);
  state.storage.localImageFiles = {};
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
  
  // Associa file a parole
  for (const fileInfo of fileList) {
    const fileNameNoExt = fileInfo.name.replace(/\.[^/.]+$/, '').toLowerCase();
    const words = fileNameNoExt.split(/[\s_\-]+/).filter(w => w.length > 0);
    
    for (const word of words) {
      if (!state.storage.localImageFiles[word]) {
        state.storage.localImageFiles[word] = [];
      }
      if (!state.storage.localImageFiles[word].some(h => h.name === fileInfo.handle.name)) {
        state.storage.localImageFiles[word].push(fileInfo.handle);
      }
    }
  }
  
  // Salva nome cartella
  localStorage.setItem('localImageFolderName', dirHandle.name);
  
  const uniqueWords = Object.keys(state.storage.localImageFiles).length;
  console.log('[Storage] Caricati', totalFiles, 'file per', uniqueWords, 'parole');
  
  return dirHandle;
}

/**
 * Esporta simboli personalizzati come JSON
 * @returns {Blob} Blob contenente il JSON
 */
export function exportCustomSymbols() {
  const customImages = loadCustomImages();
  const dataStr = JSON.stringify(customImages, null, 2);
  return new Blob([dataStr], { type: 'application/json' });
}

/**
 * Pulisce tutti i simboli personalizzati
 */
export function clearAllCustomSymbols() {
  localStorage.removeItem('customSymbolImages');
  console.log('[Storage] Tutti i simboli personalizzati cancellati');
}

// Export default
export default {
  saveCustomImages,
  loadCustomImages,
  cacheTranslation,
  getCachedTranslation,
  cacheSynonyms,
  getCachedSynonyms,
  saveImageToLocalFolder,
  compressImage,
  selectLocalFolder,
  exportCustomSymbols,
  clearAllCustomSymbols
};
