/**
 * UI Module
 * 
 * Gestisce tutte le operazioni UI:
 * - Creazione tile
 * - Modal
 * - Gallery
 * - Crop editor
 * - Status messages
 * 
 * NOTA: Questo modulo è una versione semplificata che esporta le funzioni principali.
 * La logica completa è in index.html e verrà gradualmente migrata qui.
 */

import state from './state.js';

/**
 * Imposta messaggio di stato
 * @param {string} msg - Messaggio da mostrare
 * @param {boolean} isError - Se true, mostra come errore
 */
export function setStatus(msg, isError = false) {
  if (!state.ui.elements) return;
  const live = state.ui.elements.live;
  if (live) {
    live.textContent = msg;
    if (isError) {
      live.classList.add('error');
    } else {
      live.classList.remove('error');
    }
  }
}

/**
 * Ottieni riferimenti agli elementi DOM
 * @returns {Object} Oggetto con riferimenti agli elementi
 */
export function getElements() {
  return {
    input: document.getElementById('textInput'),
    lang: document.getElementById('lang'),
    skipStop: document.getElementById('skipStop'),
    translateButton: document.getElementById('translateButton'),
    clearButton: document.getElementById('clearButton'),
    speakButton: document.getElementById('speakButton'),
    result: document.getElementById('result'),
    live: document.getElementById('live'),
    settingsButton: document.getElementById('settingsButton'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsButton: document.getElementById('closeSettingsButton'),
    voiceSelect: document.getElementById('voiceSelect'),
    showGrammarBadges: document.getElementById('showGrammarBadges'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    saveApiKeyButton: document.getElementById('saveApiKeyButton'),
    openSymbolsTokenInput: document.getElementById('openSymbolsTokenInput'),
    saveOpenSymbolsTokenButton: document.getElementById('saveOpenSymbolsTokenButton'),
    googleApiKeyInput: document.getElementById('googleApiKeyInput'),
    googleCxInput: document.getElementById('googleCxInput'),
    saveGoogleCredsButton: document.getElementById('saveGoogleCredsButton'),
    selectLocalFolderButton: document.getElementById('selectLocalFolderButton'),
    localFolderStatus: document.getElementById('localFolderStatus'),
    customSymbolsList: document.getElementById('customSymbolsList'),
    refreshCustomSymbolsButton: document.getElementById('refreshCustomSymbolsButton'),
    clearAllCustomSymbolsButton: document.getElementById('clearAllCustomSymbolsButton'),
    exportCustomSymbolsButton: document.getElementById('exportCustomSymbolsButton'),
    mergeButton: document.getElementById('mergeButton')
  };
}

/**
 * Inizializza elementi UI
 */
export function initUI() {
  state.ui.elements = getElements();
  console.log('[UI] Elementi inizializzati');
}

/**
 * Mostra solo testo (nasconde simbolo)
 * @param {HTMLElement} tile - Elemento tile
 * @param {string} word - Parola
 */
export function showTextOnly(tile, word) {
  const img = tile.querySelector('img');
  const wordLabel = tile.querySelector('.word');
  
  if (img) img.style.display = 'none';
  
  if (wordLabel) {
    wordLabel.style.fontSize = '2.5rem';
    wordLabel.style.fontWeight = 'bold';
    wordLabel.style.margin = 'auto 0';
    wordLabel.style.flexGrow = '1';
    wordLabel.style.display = 'flex';
    wordLabel.style.alignItems = 'center';
    wordLabel.style.justifyContent = 'center';
  }
  
  const badges = tile.querySelector('.badges');
  if (badges) badges.style.display = 'none';
  
  tile.dataset.textOnlyMode = 'true';
}

/**
 * Ripristina visualizzazione simbolo
 * @param {HTMLElement} tile - Elemento tile
 * @param {string} word - Parola
 */
export function showSymbolMode(tile, word) {
  const img = tile.querySelector('img');
  const wordLabel = tile.querySelector('.word');
  
  if (img) img.style.display = '';
  
  if (wordLabel) {
    wordLabel.style.fontSize = '';
    wordLabel.style.fontWeight = '';
    wordLabel.style.margin = '';
    wordLabel.style.flexGrow = '';
    wordLabel.style.display = '';
    wordLabel.style.alignItems = '';
    wordLabel.style.justifyContent = '';
  }
  
  const badges = tile.querySelector('.badges');
  if (badges) badges.style.display = '';
  
  tile.dataset.textOnlyMode = 'false';
}

/**
 * Toggle selezione tile
 * @param {HTMLElement} tile - Tile da selezionare/deselezionare
 */
export function toggleTileSelection(tile) {
  if (state.ui.selectedTiles.has(tile)) {
    state.ui.selectedTiles.delete(tile);
    tile.classList.remove('selected');
  } else {
    state.ui.selectedTiles.add(tile);
    tile.classList.add('selected');
  }
  
  const mergeBtn = state.ui.elements.mergeButton;
  if (mergeBtn) {
    if (state.ui.selectedTiles.size >= 2) {
      mergeBtn.classList.add('visible');
    } else {
      mergeBtn.classList.remove('visible');
    }
  }
}

/**
 * Verifica se cartella locale è selezionata
 * @param {string} actionName - Nome dell'azione per il messaggio
 * @returns {boolean} True se cartella selezionata
 */
export function checkLocalFolderSelected(actionName = 'questa azione') {
  if (!state.storage.localImageFolderHandle) {
    const message = `⚠️ Cartella immagini non selezionata!\n\nPer ${actionName}, devi prima:\n\n1. Cliccare su "📁 Seleziona Cartella Immagini"\n2. Scegliere una cartella dove salvare le immagini\n\nVuoi selezionare la cartella ora?`;
    
    if (confirm(message)) {
      const selectBtn = state.ui.elements.selectLocalFolderButton;
      if (selectBtn) selectBtn.click();
    }
    return false;
  }
  return true;
}

// Badge grammaticali
export const BADGE_SYMBOLS = {
  past: '⏪',
  present: '▶️',
  future: '⏩',
  singolare: '1️⃣',
  plurale: '➕'
};

export const TENSE_WORDS = {
  it: { future: 'futuro', past: 'passato', present: 'presente' },
  es: { future: 'futuro', past: 'pasado', present: 'presente' },
  en: { future: 'future', past: 'past', present: 'present' }
};

/**
 * Ottieni badge tempo verbale
 * @param {string} tense - Tempo ('past', 'present', 'future')
 * @param {string} lang - Lingua
 * @returns {Promise<Object>} Oggetto {emoji, text}
 */
export async function getTenseBadge(tense, lang = 'it') {
  const text = TENSE_WORDS[lang][tense];
  const emoji = BADGE_SYMBOLS[tense];
  return { emoji, text };
}

// Export default
export default {
  setStatus,
  getElements,
  initUI,
  showTextOnly,
  showSymbolMode,
  toggleTileSelection,
  checkLocalFolderSelected,
  getTenseBadge,
  BADGE_SYMBOLS,
  TENSE_WORDS
};
