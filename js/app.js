/* js/app.js – Main application logic & translate pipeline for Limpidi Simboli */

// ── EULA gate – redirect to eula.html if not yet accepted ─────────────────────
(function checkEula() {
  try {
    if (localStorage.getItem('eulaAccepted') !== 'true') {
      window.location.replace('eula.html');
    }
  } catch (e) { /* localStorage unavailable – let the app load anyway */ }
})();

// ── Default API key constants ─────────────────────────────────────────────────
const OPENAI_API_KEY = '';
const OPENSYMBOLS_TOKEN = '';

// ── Helper: get persisted karaoke speed (default 0.7) ─────────────────────────
function getKaraokeSpeed(){
  try{ const v = parseFloat(localStorage.getItem('karaokeSpeed')); return (isNaN(v) ? 0.7 : v); }catch(e){ return 0.7; }
}

// ── Markdown → HTML converter (simple) ────────────────────────────────────────
function markdownToHTML(markdown) {
  let html = markdown;

  // Titoli
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Code inline
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

  // Code blocks
  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');

  // Immagini
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" style="max-width:100%;">');

  // Liste non ordinate
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');

  // Liste ordinate
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

  // Checkbox
  html = html.replace(/- \[x\]/gi, '✅');
  html = html.replace(/- \[ \]/gi, '❌');

  // Paragrafi (righe con contenuto)
  html = html.replace(/^([^\n<][^\n]+)$/gim, '<p>$1</p>');

  // Rimuovi paragrafi multipli vuoti
  html = html.replace(/<p><\/p>/g, '');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr>');

  return html;
}

// ── Guide helper functions ────────────────────────────────────────────────────
function loadGuidaRapida() {
  const lang = (document.getElementById('lang') || { value: 'it' }).value || 'it';
  const file = `GuidaRapida_${lang}.html`;
  window.open(file, '_blank');
}

function loadGuidaAvanzata() {
  const lang = (document.getElementById('lang') || { value: 'it' }).value || 'it';
  const file = `GuidaAvanzata_${lang}.html`;
  window.open(file, '_blank');
}

function openVideoTutorial() {
  window.open('https://www.youtube.com/watch?v=w_leLI6oyow', '_blank');
}

// ═══════════════════════════════════════════════════════════════════════════════
// createSentenceActionButtons(sentenceBox, text)
// ═══════════════════════════════════════════════════════════════════════════════
function createSentenceActionButtons(sentenceBox, text) {
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'sentence-actions';
  actionsContainer.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.95);
    padding: 6px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  `;

  // Bottone Ascolta
  const speakBtn = document.createElement('button');
  speakBtn.className = 'button ghost';
  speakBtn.innerHTML = '🔊';
  speakBtn.title = 'Ascolta';
  speakBtn.style.cssText = 'padding: 6px 10px; font-size: 0.9rem; min-width: unset;';
  speakBtn.onclick = (e) => {
    e.stopPropagation();
    speakSentence(text, false);
  };

  // Bottone Karaoke (con evidenziazione tile completa)
  const karaokeBtn = document.createElement('button');
  karaokeBtn.className = 'button ghost';
  karaokeBtn.innerHTML = '🐢';
  karaokeBtn.title = 'Karaoke (lento)';
  karaokeBtn.style.cssText = 'padding: 6px 10px; font-size: 0.9rem; min-width: unset;';
  karaokeBtn.onclick = (e) => {
    e.stopPropagation();
    // Usa la funzione karaoke completa con evidenziazione dei tile
    try {
      const tokens = tokenize(String(text));

      // Crea overlay karaoke (rimuovi quello esistente)
      try { const prev = document.getElementById('karaokeOverlay'); if(prev) prev.remove(); } catch(e) {}

      const overlay = document.createElement('div');
      overlay.id = 'karaokeOverlay';
      overlay.className = 'karaoke-overlay';
      overlay.setAttribute('role', 'region');
      overlay.setAttribute('aria-label', 'Karaoke (lento)');

      const wordsDiv = document.createElement('div');
      wordsDiv.className = 'karaoke-words';
      wordsDiv.setAttribute('aria-live', 'polite');
      wordsDiv.style.maxHeight = '6rem';
      wordsDiv.style.overflow = 'auto';

      tokens.forEach((w, wi) => {
        const span = document.createElement('span');
        span.className = 'karaoke-word';
        span.setAttribute('data-kword-index', String(wi));
        span.setAttribute('data-original', String(w));
        span.textContent = w + ' ';
        wordsDiv.appendChild(span);
      });

      // Controlli: play/pause, close e progress
      const controls = document.createElement('div');
      controls.style.display = 'flex';
      controls.style.flexDirection = 'column';
      controls.style.gap = '8px';
      controls.style.minWidth = '180px';

      const topRow = document.createElement('div');
      topRow.style.display = 'flex';
      topRow.style.gap = '8px';
      topRow.style.alignItems = 'center';

      const playPauseBtn = document.createElement('button');
      playPauseBtn.type = 'button';
      playPauseBtn.className = 'karaoke-stop-button';
      playPauseBtn.textContent = 'Pausa';
      playPauseBtn.setAttribute('aria-pressed', 'false');

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'button ghost';
      closeBtn.textContent = 'Chiudi';

      topRow.appendChild(playPauseBtn);
      topRow.appendChild(closeBtn);

      const progressRow = document.createElement('div');
      progressRow.style.display = 'flex';
      progressRow.style.flexDirection = 'column';

      const progressLabel = document.createElement('div');
      progressLabel.style.fontSize = '0.85rem';
      progressLabel.style.color = '#334155';
      progressLabel.textContent = '0 / ' + tokens.length;

      const progressBarWrap = document.createElement('div');
      progressBarWrap.style.background = '#e6eefc';
      progressBarWrap.style.borderRadius = '6px';
      progressBarWrap.style.height = '8px';
      progressBarWrap.style.overflow = 'hidden';

      const progressBar = document.createElement('div');
      progressBar.style.width = '0%';
      progressBar.style.height = '100%';
      progressBar.style.background = '#60a5fa';
      progressBar.style.transition = 'width 220ms linear';
      progressBarWrap.appendChild(progressBar);

      progressRow.appendChild(progressLabel);
      progressRow.appendChild(progressBarWrap);

      controls.appendChild(topRow);
      controls.appendChild(progressRow);

      overlay.appendChild(wordsDiv);
      overlay.appendChild(controls);
      overlay.style.display = 'flex';
      overlay.style.visibility = 'visible';
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'auto';
      overlay.setAttribute('aria-hidden', 'false');
      overlay.tabIndex = -1;
      document.body.appendChild(overlay);
      try { overlay.focus(); } catch(e) {}

      // Avvia karaoke con evidenziazione
      playKaraoke(text, wordsDiv, null, null, (typeof getKaraokeSpeed === 'function') ? getKaraokeSpeed() : 0.7);

      // Configura il controller
      const ctrl = window._karaokeController || {};
      ctrl.rate = (typeof getKaraokeSpeed === 'function') ? getKaraokeSpeed() : 0.7;
      ctrl.highlightImages = false;
      ctrl.highlightLabels = false;
      ctrl.highlightTiles = true; // EVIDENZIA I TILE

      // Progress updater
      ctrl.onprogress = function(idx, total) {
        try {
          progressLabel.textContent = (idx + 1) + ' / ' + total;
          const pct = Math.round(((idx) / Math.max(1, total - 1)) * 100);
          progressBar.style.width = pct + '%';
        } catch(e) {}
      };

      // Play/pause toggle
      playPauseBtn.addEventListener('click', () => {
        try {
          if (!ctrl) return;
          if (!ctrl.paused) {
            ctrl.pause && ctrl.pause();
            ctrl.paused = true;
            playPauseBtn.textContent = 'Riprendi';
            playPauseBtn.setAttribute('aria-pressed', 'true');
          } else {
            ctrl.paused = false;
            playPauseBtn.textContent = 'Pausa';
            playPauseBtn.setAttribute('aria-pressed', 'false');
            ctrl.resume && ctrl.resume();
          }
        } catch(e) { console.error(e); }
      });

      // Close button
      closeBtn.addEventListener('click', () => {
        try {
          if (window._karaokeController && typeof window._karaokeController.stop === 'function') {
            window._karaokeController.stop();
          }
        } catch(e) {}
      });

    } catch(e) {
      console.error('Karaoke failed', e);
    }
  };

  // Bottone Esercizi
  const exercisesBtn = document.createElement('button');
  exercisesBtn.className = 'button ghost';
  exercisesBtn.innerHTML = '📝';
  exercisesBtn.title = 'Genera esercizi per questa frase';
  exercisesBtn.style.cssText = 'padding: 6px 10px; font-size: 0.9rem; min-width: unset;';
  exercisesBtn.onclick = (e) => {
    e.stopPropagation();
    generateExercisesForSentence(text, sentenceBox);
  };

  // Bottone Elimina
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'button ghost';
  deleteBtn.innerHTML = '❌';
  deleteBtn.title = 'Elimina questa frase';
  deleteBtn.style.cssText = 'padding: 6px 10px; font-size: 0.9rem; min-width: unset; background: #fee; color: #c00;';
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    if (confirm('Eliminare questa frase?')) {
      sentenceBox.remove();
      // Aggiorna il bottone translate dopo la rimozione
      if (typeof updateTranslateButtonText === 'function') {
        updateTranslateButtonText();
      }
    }
  };

  // Bottone Spiega
  const explainBtn = document.createElement('button');
  explainBtn.className = 'button ghost';
  explainBtn.innerHTML = '?';
  explainBtn.title = 'Spiega questa frase con parole semplici';
  explainBtn.style.cssText = 'padding: 6px 10px; font-size: 1.1rem; font-weight: bold; min-width: unset;';
  explainBtn.onclick = safeAsync(async (e) => {
    e.stopPropagation();

    // Determina se è una frase (contiene spazi) o una singola parola
    const isPhrase = text.includes(' ');
    const lang = els.lang.value || 'it';

    explainBtn.disabled = true;
    const originalText = explainBtn.innerHTML;
    explainBtn.innerHTML = '⏳';

    // Funzione per mostrare il modal con la spiegazione
    const showExplanationModal = async (forceRefresh = false) => {
      try {
        const result = await explainTerm(text, lang, isPhrase, forceRefresh);

        // Crea modal per mostrare la spiegazione
        const overlay = document.createElement('div');
        overlay.classList.add('dialog-overlay');

        const modal = document.createElement('div');
        modal.classList.add('custom-dialog');
        modal.style.maxWidth = '700px';
        modal.style.maxHeight = '80vh';
        modal.style.overflowY = 'auto';

        const title = document.createElement('h3');
        title.style.cssText = 'margin: 0 0 16px 0; font-size: 1.5rem; color: #1e293b; display: flex; align-items: center; gap: 8px;';
        title.innerHTML = `<span style="font-size: 2rem;">💡</span> Spiegazione ${isPhrase ? 'della frase' : 'del termine'}`;

        const phraseBox = document.createElement('div');
        phraseBox.style.cssText = 'background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;';

        const phraseLabel = document.createElement('p');
        phraseLabel.style.cssText = 'font-size: 0.85rem; color: #64748b; margin: 0 0 4px 0; font-weight: 600;';
        phraseLabel.textContent = isPhrase ? 'FRASE:' : 'PAROLA:';

        const phraseText = document.createElement('p');
        phraseText.style.cssText = 'font-size: 1.15rem; color: #1e293b; margin: 0; font-weight: 500;';
        phraseText.textContent = `"${text}"`;

        phraseBox.appendChild(phraseLabel);
        phraseBox.appendChild(phraseText);

        const explanationText = document.createElement('p');
        explanationText.style.cssText = 'font-size: 1.1rem; line-height: 1.6; color: #374151; margin-bottom: 16px; text-align: left;';
        explanationText.textContent = result.explanation;

        modal.appendChild(title);
        modal.appendChild(phraseBox);
        modal.appendChild(explanationText);

        // Mostra sinonimi se presenti (solo per parole singole)
        if (!isPhrase && result.synonyms && result.synonyms.length > 0) {
          const synTitle = document.createElement('p');
          synTitle.style.cssText = 'font-weight: 600; color: #1e293b; margin: 16px 0 8px 0; font-size: 1rem;';
          synTitle.textContent = 'Parole simili più semplici:';

          const synList = document.createElement('div');
          synList.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;';

          result.synonyms.forEach(syn => {
            const synBadge = document.createElement('span');
            synBadge.style.cssText = 'background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 16px; font-size: 0.95rem; font-weight: 500;';
            synBadge.textContent = syn;
            synList.appendChild(synBadge);
          });

          modal.appendChild(synTitle);
          modal.appendChild(synList);
        }

        // Mostra esempio se presente (per frasi)
        if (isPhrase && result.example) {
          const exTitle = document.createElement('p');
          exTitle.style.cssText = 'font-weight: 600; color: #1e293b; margin: 16px 0 8px 0; font-size: 1rem;';
          exTitle.textContent = 'Esempio di uso:';

          const exText = document.createElement('p');
          exText.style.cssText = 'font-size: 1rem; line-height: 1.5; color: #4b5563; font-style: italic; padding: 12px; background: #f3f4f6; border-radius: 8px; margin-bottom: 16px;';
          exText.textContent = result.example;

          modal.appendChild(exTitle);
          modal.appendChild(exText);
        }

        // Bottoni
        const btnContainer = document.createElement('div');
        btnContainer.classList.add('dialog-btn-container');

        const speakBtnModal = document.createElement('button');
        speakBtnModal.textContent = '🔊 Ascolta la spiegazione';
        speakBtnModal.className = 'button';
        speakBtnModal.style.cssText = 'padding: 12px 24px; font-size: 1rem; flex: 1;';

        const closeBtnModal = document.createElement('button');
        closeBtnModal.textContent = 'Chiudi';
        closeBtnModal.className = 'button ghost';
        closeBtnModal.style.cssText = 'padding: 12px 24px; font-size: 1rem;';

        // Ascolta la spiegazione con TTS
        speakBtnModal.onclick = () => {
          window.speechSynthesis.cancel();

          let textToSpeak = result.explanation;
          if (!isPhrase && result.synonyms && result.synonyms.length > 0) {
            textToSpeak += '. Parole simili: ' + result.synonyms.join(', ');
          }
          if (isPhrase && result.example) {
            textToSpeak += '. Esempio: ' + result.example;
          }

          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = 'it-IT';
          const voice = getItalianVoice();
          if (voice) utterance.voice = voice;
          utterance.rate = 0.9;
          utterance.pitch = 1;

          speakBtnModal.disabled = true;
          speakBtnModal.textContent = '🔊 In riproduzione...';

          utterance.onend = () => {
            speakBtnModal.disabled = false;
            speakBtnModal.textContent = '🔊 Ascolta la spiegazione';
          };

          utterance.onerror = () => {
            speakBtnModal.disabled = false;
            speakBtnModal.textContent = '🔊 Ascolta la spiegazione';
            alert('Errore durante la riproduzione audio');
          };

          window.speechSynthesis.speak(utterance);
        };

        closeBtnModal.onclick = () => {
          window.speechSynthesis.cancel();
          document.body.removeChild(overlay);
          document.body.removeChild(modal);
        };

        // Chiudi cliccando sull'overlay
        overlay.onclick = () => {
          window.speechSynthesis.cancel();
          document.body.removeChild(overlay);
          document.body.removeChild(modal);
        };

        // Previeni chiusura cliccando sul modal
        modal.onclick = (e2) => e2.stopPropagation();

        // Bottone Rigenera
        const regenerateBtn = document.createElement('button');
        regenerateBtn.textContent = '🔄 Rigenera';
        regenerateBtn.className = 'button ghost';
        regenerateBtn.style.cssText = 'padding: 12px 24px; font-size: 1rem;';
        regenerateBtn.title = 'Genera una nuova spiegazione ignorando la cache';
        regenerateBtn.onclick = async () => {
          regenerateBtn.disabled = true;
          regenerateBtn.textContent = '⏳ Rigenerando...';

          try {
            // Chiudi il modal corrente
            window.speechSynthesis.cancel();
            document.body.removeChild(overlay);
            document.body.removeChild(modal);

            // Rigenera con forceRefresh = true
            await showExplanationModal(true);
          } catch (err) {
            console.error('[Explain Regenerate] Errore:', err);
            alert('Errore durante la rigenerazione: ' + (err.message || String(err)));
          }

          regenerateBtn.disabled = false;
          regenerateBtn.textContent = '🔄 Rigenera';
        };

        btnContainer.appendChild(speakBtnModal);
        btnContainer.appendChild(regenerateBtn);
        btnContainer.appendChild(closeBtnModal);
        modal.appendChild(btnContainer);

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        // Leggi automaticamente la spiegazione
        setTimeout(() => speakBtnModal.click(), 300);

      } catch (err) {
        console.error('[Explain] Errore:', err);
        alert('Errore durante la spiegazione: ' + (err.message || String(err)));
      }
    };

    // Prima chiamata senza forceRefresh
    try {
      await showExplanationModal(false);
    } finally {
      explainBtn.disabled = false;
      explainBtn.innerHTML = originalText;
    }
  });

  actionsContainer.appendChild(speakBtn);
  actionsContainer.appendChild(karaokeBtn);
  actionsContainer.appendChild(explainBtn);
  actionsContainer.appendChild(exercisesBtn);
  actionsContainer.appendChild(deleteBtn);

  return actionsContainer;
}

// ═══════════════════════════════════════════════════════════════════════════════
// translate(keepExisting)
// ═══════════════════════════════════════════════════════════════════════════════
async function translate(keepExisting = false){
  const fullText = els.input.value.trim();
  if(!fullText){ setStatusKey('enter_phrase_prompt'); els.input.focus(); return; }

  // Dividi il testo in frasi separate da newline, punti (.) e punti e virgola (;)
  // Sostituisci . e ; con \n per poi dividere
  const textWithBreaks = fullText.replace(/\.\s*/g, '.\n').replace(/;\s*/g, ';\n');
  const sentences = textWithBreaks.split('\n').map(s => s.trim()).filter(s => s.length > 0);

  console.log('[translate] Processing', sentences.length, 'sentence(s)');

  // Calcola l'indice di partenza per i colori alternati
  let startIndex = 0;
  if (keepExisting) {
    // Conta quante sentence-box esistono già
    const existingBoxes = els.res.querySelectorAll('.sentence-box');
    startIndex = existingBoxes.length;
    console.log('[translate] Keeping existing content, starting from index', startIndex);
  } else {
    els.res.innerHTML = '';
  }

  // Processa ogni frase separatamente
  for (let i = 0; i < sentences.length; i++) {
    const text = sentences[i];
    if (!text) continue;

    const sentenceIndex = startIndex + i; // Indice globale per colori alternati
    console.log(`[translate] Processing sentence ${i + 1}/${sentences.length}:`, text);

    // Crea il sentence-box container
    const sentenceBox = document.createElement('div');
    sentenceBox.className = 'sentence-box';
    const boxColor = sentenceIndex % 2 === 0 ? '#e3f2fd' : '#fff3e0';
    const borderColor = sentenceIndex % 2 === 0 ? '#2196f3' : '#ff9800';
    sentenceBox.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 15px;
      padding-right: 75px;
      margin-bottom: 10px;
      background-color: ${boxColor};
      border: 2px solid ${borderColor};
      border-radius: 8px;
      width: 100%;
      min-height: 120px;
      box-sizing: border-box;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
      grid-column: 1 / -1;
    `;
    sentenceBox.dataset.sentenceIndex = sentenceIndex;
    sentenceBox.dataset.sentenceText = text;

    // Click handler per focus visivo su questa frase (senza scroll)
    sentenceBox.addEventListener('click', (e) => {
      // Ignora click sui bottoni e sui tile
      if (e.target.closest('button') || e.target.closest('.tile')) return;

      // Solo effetto visivo, nessuno scroll
      sentenceBox.style.transform = 'scale(1.02)';
      sentenceBox.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      setTimeout(() => {
        sentenceBox.style.transform = '';
        sentenceBox.style.boxShadow = '';
      }, 300);
    });

    // Aggiungi i bottoni azione per questa frase (usa la funzione centralizzata)
    const actionsContainer = createSentenceActionButtons(sentenceBox, text);
    sentenceBox.appendChild(actionsContainer);

    els.res.appendChild(sentenceBox);

    console.log('🟢 [translate] Sentence box appended, calling translateSingleSentence...');

    // Ora processa questa frase e aggiungi i tiles al sentence-box
    await translateSingleSentence(text, sentenceBox);

    console.log('🟢 [translate] translateSingleSentence completed for sentence', sentenceIndex + 1);
  }

  console.log('🟢 [translate] ALL sentences processed');
  setStatusKey('custom', { msg: 'Conversione completata' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// translateSingleSentence(text, container)
// ═══════════════════════════════════════════════════════════════════════════════
async function translateSingleSentence(text, container) {
  console.log('🔵 [translateSingleSentence] START - text:', text);
  console.log('🔵 [translateSingleSentence] container:', container);

  const lang = els.lang.value;
  const skipStop = els.skipStop.checked;

  if(aborter) aborter.abort();
  aborter = new AbortController();

  /*
   * Determiniamo le parole da tradurre.
   * 1. Tentiamo di ottenere un'analisi strutturata da GPT (analyzeSentence).
   * 2. Se fallisce, creiamo una struttura di fallback locale.
   * In entrambi i casi, 'groups' sarà un array di oggetti, uno per parola.
   */
  const tokens = tokenize(text);
  // Array di token originali (con lettere maiuscole/minuscole e accenti) per l'etichetta da mostrare
  const originalTokens = text.replace(/\u00A0/g, ' ').split(/\s+/).filter(Boolean);
  const rawWords = tokens.map(sanitizeWord).filter(Boolean);

  // "groups" ora conterrà un array di oggetti di analisi
  let groups = await analyzeSentence(text, lang).catch(() => null);

  if (!Array.isArray(groups) || !groups.length) {
      // Fallback locale: crea una struttura dati simile
      groups = rawWords.map((w, i) => ({
          lemma: w, // Il "lemma" è solo la parola stessa
          originalIndex: i // Salviamo l'indice per recuperare la parola originale
      }));
  } else {
      // Assicuriamoci che i gruppi di GPT abbiano un riferimento all'indice originale
      // e che la lunghezza corrisponda
      const analyzedGroups = groups;
      groups = [];
      for (let i = 0; i < rawWords.length; i++) {
        const analysis = analyzedGroups[i] || {}; // Prendi l'analisi o un oggetto vuoto
        analysis.originalIndex = i; // Associa l'indice
        // Se GPT non ha trovato un lemma (es. punteggiatura), usa la parola raw
        if (!analysis.lemma) {
            analysis.lemma = rawWords[i];
        } else {
            const originalLemma = analysis.lemma;
            // Pulisci il lemma da eventuale punteggiatura
            analysis.lemma = sanitizeWord(analysis.lemma);
            if (originalLemma !== analysis.lemma) {
                console.log('[Lemma Sanitize] Original:', originalLemma, '→ Cleaned:', analysis.lemma);
            }
            // Se dopo la pulizia è vuoto, usa la parola raw
            if (!analysis.lemma) {
                analysis.lemma = rawWords[i];
            }
        }
        groups.push(analysis);
      }
  }

  // Apply heuristic before building tiles
  adjustAmbiguousPronounForEssere(groups);

  setStatusKey('search_in_progress');
  let found = 0, missing = 0;
  let arasaacCount = 0, openSymbolsCount = 0;

  // Ciclo principale che tenta di formare locuzioni tramite ricerche API
  for (let idx = 0; idx < groups.length; idx++) {
    // Se l'aborter è abortito, esci
    if (aborter.signal.aborted) break;

    // By default treat as single word
    let len = 1;
    let idsForPhrase = null;
    let phraseTried = false;

    // Tentiamo prima con una locuzione di 3 parole, poi di 2 parole
    for (let attemptLen of [3, 2]) {
      if (idx + attemptLen - 1 < groups.length) {
        const wordsForCandidate = rawWords.slice(idx, idx + attemptLen);
        const candidateTerm = wordsForCandidate.join(' ');
        // Non tentare locuzioni composte da sole parole funzionali. Almeno una
        // parola deve essere "significativa" (non stop word) affinché abbia
        // senso cercare un pittogramma composito. Questo previene casi come
        // "ho visto un", dove tutte le parole sono ausiliari o articoli.
        // Evita locuzioni che iniziano con una stop word: devono
        // cominciare con una parola significativa (non stop) per poter
        // rappresentare un concetto autonomo. Questo filtra espressioni
        // come "ho visto un" o "il mio" che altrimenti restituiscono
        // pittogrammi non pertinenti.
        const startsWithNonStop = !STOP_IT.has(wordsForCandidate[0]);
        // Verifica se la locuzione è presente nel dizionario delle parole di
        // ARASAAC e contiene almeno una lettera. In caso contrario, salta
        // la ricerca.
        if (startsWithNonStop && /\w/.test(candidateTerm) && keywordEntries.has(candidateTerm)) {
          phraseTried = true;
          try {
            const candidateIds = await queryIds(lang, candidateTerm, aborter.signal);
            if (candidateIds && candidateIds.length > 0) {
              len = attemptLen;
              idsForPhrase = candidateIds;
              break;
            }
          } catch {}
        }
      }
    }

    const start = idx;
    const end = idx + len - 1;
    const segmentAnalyses = [];
    for (let j = start; j <= end; j++) {
      segmentAnalyses.push(groups[j]);
    }
    // Costruisci la stringa da visualizzare (originale con apostrofi e punteggiatura)
    // e la stringa di ricerca (pulita)
    const displayOriginal = originalTokens.slice(start, end + 1).join(' ');
    const searchTerm = rawWords.slice(start, end + 1).map(t => sanitizeWord(t)).filter(Boolean).join(' ');

    // Se è una singola parola (non locuzione) e la funzione di salto delle parole funzionali è attiva,
    // verifica se questa parola è da considerare stop word. Skip se necessario.
    if (len === 1 && skipStop) {
      const analysis = segmentAnalyses[0];
      // Pulisci il lemma da punteggiatura prima di controllare se è stopword
      let lemmaForStop = (analysis.lemma && analysis.lemma !== 'null') ? analysis.lemma : rawWords[start];
      console.log('[StopWord Check] Original word:', displayOriginal, 'analysis.lemma:', analysis.lemma, 'rawWords[start]:', rawWords[start]);
      lemmaForStop = sanitizeWord(lemmaForStop);
      console.log('[StopWord Check] After sanitize, lemmaForStop:', lemmaForStop, 'is in STOP_IT:', STOP_IT.has(lemmaForStop), 'analysis.pronome:', analysis.pronome);
      // Una parola è stopword SOLO se è nello STOP_IT e non è un pronome
      // Non saltiamo parole solo perché GPT non conosce il lemma (null)
      const isStop = STOP_IT.has(lemmaForStop) && !analysis.pronome;
      console.log('[StopWord Check] Final isStop:', isStop);
      if (isStop) {
        await addTile([], displayOriginal, true, null, [], false, null, container);
        continue;
      }
    }

    // Combina le analisi: scegli pronome, genere, numero, tempo, sinonimi
    let combined = { pronome: null, genere: null, numero: null, tempo: null, sinonimi: [] };
    for (const an of segmentAnalyses) {
      if (an.pronome && !combined.pronome) combined.pronome = an.pronome;
      if (an.genere && !combined.genere && an.genere !== 'sconosciuto') combined.genere = an.genere;
      if (an.numero && !combined.numero) combined.numero = an.numero;
      if (an.tempo && !combined.tempo) combined.tempo = an.tempo;
      if (an.sinonimi && Array.isArray(an.sinonimi)) {
        // Pulisci i sinonimi da punteggiatura
        const cleanedSynonyms = an.sinonimi.map(s => sanitizeWord(s)).filter(s => s.length > 0);
        combined.sinonimi.push(...cleanedSynonyms);
      }
    }
    // Badge e highlight
    const badges = [];
    let highlightInsert = false;
    if (combined.pronome) {
      badges.push({ token: combined.pronome, type: 'pronome' });
      const displayWordsLower = rawWords.slice(start, end + 1).map(w => w.toLowerCase());
      if (!displayWordsLower.includes(combined.pronome.toLowerCase())) {
        highlightInsert = true;
      }
    }
    if (combined.genere) badges.push({ token: combined.genere, type: 'genere' });
    if (combined.numero) badges.push({ token: combined.numero, type: 'numero' });
    // Determina il tempo verbale tramite euristiche locali. Ignoriamo il
    // valore fornito da GPT per evitare falsi positivi su sostantivi (es.
    // "estate" interpretato come verbo al passato). Le nostre euristiche
    // considerano solo le desinenze verbali, così i nomi restano senza
    // badge di tempo.
    const tense = detectTense(searchTerm.split(' ')[0], lang);

    // Determina il termine di ricerca effettivo
    let searchKey = searchTerm;
    if (len === 1) {
      const w = searchTerm;
      if (PRONOUNS[lang] && PRONOUNS[lang].has(w)) {
        if (PRONOUN_SEARCH_MAP[lang] && PRONOUN_SEARCH_MAP[lang][w]) {
          searchKey = PRONOUN_SEARCH_MAP[lang][w];
        }
        if (lang === 'it' && OBJECT_PRONOUN_MAP[w]) {
          const map = OBJECT_PRONOUN_MAP[w];
          searchKey = map.base;
          if (!combined.genere) badges.push({ token: map.gender, type: 'genere' });
          if (!combined.numero) badges.push({ token: map.number, type: 'numero' });
        }
      }

      // Se la parola è una forma di "stato" (stato, stata, stati, state) e
      // il tempo verbale rilevato o fornito è passato, interpretala come
      // participio del verbo "stare" anziché come sostantivo "stato".
      if (['stato','stata','stati','state'].includes(w.toLowerCase())) {
        if (tense === 'past' || combined.tempo === 'past') {
          searchKey = 'stare';
        }
      }

      // Se la parola è una forma irregolare del presente (es. "ho", "hai", "ha")
      // usa il lemma corretto per la ricerca ("avere" o "essere"). Questo
      // evita di ottenere pittogrammi non pertinenti (es. "ho bisogno di aiuto")
      // per l'ausiliare e consente di trovare l'immagine appropriata del verbo.
      const irregularBase = IRREGULAR_PRESENT_LEMMA_MAP[w.toLowerCase()];
      if (irregularBase) {
        searchKey = irregularBase;
      }
    }

    let ids;
    if (idsForPhrase) {
      if (Array.isArray(idsForPhrase)) {
        ids = idsForPhrase;
      } else {
        ids = [...(idsForPhrase.arasaacIds || []), ...(idsForPhrase.openSymbols || [])];
        arasaacCount = (idsForPhrase.arasaacIds || []).length;
        openSymbolsCount = (idsForPhrase.openSymbols || []).length;
      }
    } else {
      try {
        console.log('[translate] About to call queryIds with searchKey:', searchKey);
        const idsObj = await queryIds(lang, searchKey, aborter.signal);
        console.log('[translate] queryIds result for "' + searchKey + '":', idsObj);
        ids = [...(idsObj.arasaacIds || []), ...(idsObj.openSymbols || [])];
        console.log('[translate] merged ids array:', ids);
        arasaacCount = (idsObj.arasaacIds || []).length;
        openSymbolsCount = (idsObj.openSymbols || []).length;
      } catch {
        ids = [];
      }
    }
    // Se non trovi nulla, prova con sinonimi (GPT o locali)
    if (!ids || ids.length === 0) {
      // Aggiungi sinonimi locali basati sul lemma / termine di ricerca (solo per italiano e singole parole)
      if (lang === 'it' && len === 1) {
        const lk = searchKey.toLowerCase();
        if (LOCAL_SYNONYMS_IT[lk]) {
          combined.sinonimi.push(...LOCAL_SYNONYMS_IT[lk]);
        }
      }
      if (combined.sinonimi && combined.sinonimi.length) {
        for (const syn of combined.sinonimi) {
          try {
            const synIdsObj = await queryIds(lang, syn, aborter.signal);
            const synIds = [...(synIdsObj.arasaacIds || []), ...(synIdsObj.openSymbols || [])];
            if (synIds && synIds.length) {
              ids = synIds;
              arasaacCount = (synIdsObj.arasaacIds || []).length;
              openSymbolsCount = (synIdsObj.openSymbols || []).length;
              break;
            }
          } catch {}
        }
      }
    }
    if (ids && ids.length > 0) {
      found++;
      console.log('[translate] calling addTile with ids:', ids, 'word:', displayOriginal);
      await addTile(ids, displayOriginal, false, tense, badges, highlightInsert, null, container);
      // I simboli OpenSymbols sono ora integrati nel tile come alternative ciclabili
    } else {
      missing++;
      await addTile([], displayOriginal, false, null, badges, highlightInsert, null, container);
    }
    // Messaggio per ogni parola/locuzione: quanti simboli trovati per fonte
    setStatusKey('search_counts', { arasaac: arasaacCount, opensymbols: openSymbolsCount }, false);
    // Salta gli indici coperti dalla locuzione
    idx = end;
  }
  if (skipStop) setStatusKey('search_complete_skipstop', { found, missing }); else setStatusKey('search_complete', { found, missing });
  // Messaggio finale: somma totale simboli trovati per fonte
  // (opzionale: puoi accumulare i totali in variabili e mostrarli qui)
}

// ═══════════════════════════════════════════════════════════════════════════════
// adjustAmbiguousPronounForEssere(groupsArr)
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Heuristic adjustment for Italian subject pronouns with the verb "essere".
 *
 * The verb "sono" can correspond both to the first person singular ("io sono") and
 * to the third person plural ("loro sono"). When GPT fails to infer the
 * correct subject pronoun from context, we fall back on the number and
 * gender of the following words. If an instance of "essere" has pronome
 * undefined or set to "io" but a later word is marked as plural, we
 * reinterpret the subject as "loro". We also propagate the number and
 * gender to the pronoun so that appropriate badges can be shown.
 */
function adjustAmbiguousPronounForEssere(groupsArr) {
  // only for Italian
  const lang = (els && els.lang) ? els.lang.value : 'it';
  if (lang !== 'it' || !Array.isArray(groupsArr) || groupsArr.length === 0) return;
  for (let idx = 0; idx < groupsArr.length; idx++) {
    const g = groupsArr[idx];
    // Identify the verb "essere"
    // The lemma may be returned as "essere" by GPT or identical to the raw word in fallback
    if (!g || typeof g.lemma !== 'string') continue;
    const lemma = g.lemma.toLowerCase();
    // Consider both the infinitive "essere" and the conjugated form "sono" as candidates for ambiguity
    if (lemma !== 'essere' && lemma !== 'sono') continue;
    // Only adjust if the pronoun is absent or set to "io"
    const currentPron = (g.pronome || '').toLowerCase();
    if (currentPron && currentPron !== 'io') continue;
    // Look ahead for plural markers and gender markers
    let foundPlural = false;
    let foundFem = false;
    let foundMas = false;
    for (let j = idx + 1; j < groupsArr.length; j++) {
      const nxt = groupsArr[j];
      if (!nxt) continue;
      const num = (nxt.numero || '').toLowerCase();
      const gen = (nxt.genere || '').toLowerCase();
      if (num === 'plurale') foundPlural = true;
      if (gen === 'femminile') foundFem = true;
      if (gen === 'maschile') foundMas = true;
    }
    // If no plural found, do not adjust
    if (!foundPlural) return;
    // Adjust pronoun to "loro"
    g.pronome = 'loro';
    // Propagate number and gender onto the pronoun if not already set
    // Only set these fields if they are not defined on the verb group
    if (!g.numero) g.numero = 'plurale';
    // Determine gender: if both feminine and masculine markers are present,
    // or none, leave undefined (unknown). If only one present, set it.
    if (!g.genere) {
      if (foundFem && !foundMas) g.genere = 'femminile';
      else if (foundMas && !foundFem) g.genere = 'maschile';
      // else leave undefined (ambiguous)
    }
    // We adjust only the first occurrence of "essere"
    return;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// runAppSanityChecks()
// ═══════════════════════════════════════════════════════════════════════════════
function runAppSanityChecks() {
  try {
    const problems = [];
    // Required DOM elements (speakButton removed - now in sentence-box)
    const requiredIds = ['textInput', 'translateButton', 'live'];
    requiredIds.forEach(id => {
      if (!document.getElementById(id)) problems.push(`missing element: ${id}`);
    });

    // Check key globals
    if (typeof translations === 'undefined') problems.push('missing translations object');
    if (typeof safeAsync !== 'function') problems.push('safeAsync helper missing');
    if (typeof setStatusKey !== 'function') problems.push('setStatusKey missing');

    // Quick check for a handful of translation keys we rely on at startup
    const sampleKeys = ['translateButton', 'selectLocalFolderButton', 'guidaRapidaButton', 'guidaAvanzataButton', 'videoTutorialButton'];
    sampleKeys.forEach(k => {
      const lang = (document.getElementById('lang') || { value: 'it' }).value || 'it';
      if (!translations || !translations[lang] || typeof translations[lang][k] === 'undefined') {
        problems.push(`missing translation for key: ${k} (lang=${lang})`);
      }
    });

    if (problems.length) {
      const msg = 'Sanity check: ' + problems.join('; ');
      console.error(msg);
      try { setStatusKey('js_error', { msg: msg }, true); } catch (e) { /* ignore */ }
    } else {
      // Small informative status so user knows checks passed
      try { setStatusKey('list_refreshed'); } catch (e) { /* ignore */ }
    }
  } catch (e) {
    console.error('[runAppSanityChecks] failed', e);
    try { setStatusKey('js_error', { msg: e.message || String(e) }, true); } catch (_){ }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// updateTranslateButtonText()
// ═══════════════════════════════════════════════════════════════════════════════
function updateTranslateButtonText() {
  const existingBoxes = els.res ? els.res.querySelectorAll('.sentence-box') : [];
  const hasContent = existingBoxes.length > 0;
  if (els.btn) {
    if (hasContent) {
      els.btn.innerHTML = '➕ Aggiungi frase';
      els.btn.setAttribute('aria-label', 'Aggiungi frase');
    } else {
      els.btn.innerHTML = '🔄 Converti in simboli';
      els.btn.setAttribute('aria-label', 'Converti in simboli');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// initApp()  –  main initialisation (called on DOMContentLoaded)
// ═══════════════════════════════════════════════════════════════════════════════
function initApp() {

  // ── a. Initialize the `els` DOM reference map ─────────────────────────────
  els = {
    openSymbolsTokenInput: qs('openSymbolsTokenInput'),
    saveOpenSymbolsToken: qs('saveOpenSymbolsTokenButton'),
    googleApiKeyInput: qs('googleApiKeyInput'),
    googleCxInput: qs('googleCxInput'),
    saveGoogleCreds: qs('saveGoogleCredsButton'),
    selectLocalFolder: qs('selectLocalFolderButton'),
    disconnectLocalFolder: qs('disconnectLocalFolderButton'),
    localFolderStatus: qs('localFolderStatus'),
    settingsButton: qs('settingsButton'),
    settingsModal: qs('settingsModal'),
    closeSettingsButton: qs('closeSettingsButton'),
    customSymbolsList: qs('customSymbolsList'),
    refreshCustomSymbolsButton: qs('refreshCustomSymbolsButton'),
    clearAllCustomSymbolsButton: qs('clearAllCustomSymbolsButton'),
    exportCustomSymbolsButton: qs('exportCustomSymbolsButton'),
    input: qs('textInput'),
    lang: qs('lang'),
    skipStop: qs('skipStop'),
    btn: qs('translateButton'),
    clear: qs('clearButton'),
    // speak: qs('speakButton'), // Removed - now in sentence-box
    // speakSlow: qs('speakSlowButton'), // Removed - now in sentence-box
    voiceSelect: qs('voiceSelect'),
    showGrammarBadges: qs('showGrammarBadges'),
    res: qs('result'),
    live: qs('live'),
    apiInput: qs('apiKeyInput'),
    saveApiKey: qs('saveApiKeyButton'),
  };

  // ── b. Apply translations with the current language ───────────────────────
  {
    const currentLang = (els.lang && els.lang.value) || localStorage.getItem('appLang') || 'it';
    applyTranslations(currentLang);
  }

  // ── c. initLanguage logic (flag click handlers, localStorage, renderLegend)
  {
    const saved = localStorage.getItem('appLang');
    const hid = document.getElementById('lang');
    const start = saved || (hid && hid.value) || 'it';
    if(hid) hid.value = start;
    applyTranslations(start);
    // bind flag buttons
    document.querySelectorAll('.lang-flag').forEach(btn => {
      btn.addEventListener('click', () => {
        const l = btn.dataset.lang || 'it';
        if(hid) hid.value = l;
        applyTranslations(l);
      });
    });
  }

  // ── d. Load API keys from localStorage ────────────────────────────────────
  // OpenSymbols token
  (function loadOpenSymbolsTokenInit(){
    try {
      const storedToken = localStorage.getItem('openSymbolsToken');
      if (storedToken && storedToken.trim()) {
        openSymbolsToken = storedToken.trim();
      } else if (OPENSYMBOLS_TOKEN && OPENSYMBOLS_TOKEN.trim()) {
        openSymbolsToken = OPENSYMBOLS_TOKEN.trim();
      }
    } catch (e) {
      if (OPENSYMBOLS_TOKEN && OPENSYMBOLS_TOKEN.trim()) openSymbolsToken = OPENSYMBOLS_TOKEN.trim();
    }
    if (els.openSymbolsTokenInput) {
      els.openSymbolsTokenInput.value = openSymbolsToken;
    }
  })();

  // OpenAI API key
  (function loadApiKeyInit(){
    try {
      const storedKey = localStorage.getItem('openaiApiKey');
      if (storedKey && storedKey.trim()) {
        openaiApiKey = storedKey.trim();
      } else if (OPENAI_API_KEY && OPENAI_API_KEY.trim()) {
        openaiApiKey = OPENAI_API_KEY.trim();
      }
    } catch (e) {
      if (OPENAI_API_KEY && OPENAI_API_KEY.trim()) openaiApiKey = OPENAI_API_KEY.trim();
    }
    if (els.apiInput) {
      els.apiInput.value = openaiApiKey;
    }
  })();

  // Google credentials
  try {
    const storedApiKey = localStorage.getItem('googleApiKey');
    const storedCx = localStorage.getItem('googleCx');
    if (storedApiKey) {
      googleApiKey = storedApiKey;
      if (els.googleApiKeyInput) els.googleApiKeyInput.value = storedApiKey;
    }
    if (storedCx) {
      googleCx = storedCx;
      if (els.googleCxInput) els.googleCxInput.value = storedCx;
    }
  } catch (e) {
    console.warn('Impossibile caricare le credenziali Google dal localStorage', e);
  }

  // ── e. Init local folder from IDB ─────────────────────────────────────────
  if (typeof initLocalFolderFromIDB === 'function') {
    initLocalFolderFromIDB();
  }

  // ── f. Set up local folder select / disconnect ────────────────────────────
  if (typeof setupSelectLocalFolder === 'function') {
    setupSelectLocalFolder();
  }
  if (typeof setupDisconnectLocalFolder === 'function') {
    setupDisconnectLocalFolder();
  }

  // ── g. API key save button handlers ───────────────────────────────────────
  if (els.saveApiKey) {
    els.saveApiKey.addEventListener('click', () => {
      const key = (els.apiInput.value || '').trim();
      openaiApiKey = key;
      try {
        if (key) {
          localStorage.setItem('openaiApiKey', key);
        } else {
          localStorage.removeItem('openaiApiKey');
        }
      } catch (e) {
        console.warn('Impossibile salvare la chiave API nel localStorage', e);
      }
      setStatusKey('openai_saved');
    });
  }

  if (els.saveGoogleCreds) {
    els.saveGoogleCreds.addEventListener('click', () => {
      const apiKey = (els.googleApiKeyInput.value || '').trim();
      const cx = (els.googleCxInput.value || '').trim();
      googleApiKey = apiKey;
      googleCx = cx;
      try {
        if (apiKey) localStorage.setItem('googleApiKey', apiKey);
        else localStorage.removeItem('googleApiKey');
        if (cx) localStorage.setItem('googleCx', cx);
        else localStorage.removeItem('googleCx');
      } catch (e) {
        console.warn('Impossibile salvare le credenziali Google nel localStorage', e);
      }
      setStatusKey('google_saved');
    });
  }

  if (els.saveOpenSymbolsToken && els.openSymbolsTokenInput) {
    els.saveOpenSymbolsToken.addEventListener('click', () => {
      const token = (els.openSymbolsTokenInput.value || '').trim();
      openSymbolsToken = token;
      try {
        if (token) {
          localStorage.setItem('openSymbolsToken', token);
        } else {
          localStorage.removeItem('openSymbolsToken');
        }
      } catch (e) {
        console.warn('Impossibile salvare il token OpenSymbols nel localStorage', e);
      }
      setStatusKey('opensymbols_saved');
    });
  }

  // ── h. Set up custom symbols panel ────────────────────────────────────────
  if (typeof setupCustomSymbolsPanel === 'function') {
    setupCustomSymbolsPanel();
  }

  // ── i. PDF/DOC upload handler ─────────────────────────────────────────────
  const uploadDocBtn = document.getElementById('uploadDocButton');
  if (uploadDocBtn) {
    uploadDocBtn.addEventListener('click', async () => {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          setStatusKey('custom', { msg: translateUI('doc_upload_processing') || 'Elaborazione documento in corso...' });

          try {
            let text = '';

            // Extract text based on file type
            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
              // Use PDF.js
              const arrayBuffer = await file.arrayBuffer();
              const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items.map(item => item.str).join(' ');
                text += pageText + '\n';
              }
            } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
              // Use mammoth.js
              const arrayBuffer = await file.arrayBuffer();
              const result = await mammoth.extractRawText({ arrayBuffer });
              text = result.value;
            }

            // Split into sentences (basic sentence splitting)
            const sentences = text
              .split(/[.!?]+/)
              .map(s => s.trim())
              .filter(s => s.length > 0 && s.split(/\s+/).length >= 2);

            if (sentences.length === 0) {
              setStatusKey('custom', { msg: translateUI('doc_upload_error') || 'Nessuna frase trovata nel documento' }, true);
              return;
            }

            // Clear existing results
            els.res.innerHTML = '';

            // Translate each sentence and group in colored boxes
            for (let i = 0; i < sentences.length; i++) {
              const sentence = sentences[i];
              const boxColor = i % 2 === 0 ? '#e3f2fd' : '#fff3e0'; // Alternate blue and orange
              const borderColor = i % 2 === 0 ? '#2196f3' : '#ff9800';

              // Set input to current sentence
              els.input.value = sentence;

              // Store current tiles count
              const tilesBeforeCount = els.res.children.length;

              // Translate this sentence (tiles will be added to els.res)
              // Pass true to keep existing content
              await translate(true);

              // Get all tiles that were just added
              const allChildren = Array.from(els.res.children);
              const newTiles = allChildren.slice(tilesBeforeCount);

              if (newTiles.length > 0) {
                // Create a wrapper div for this sentence's tiles
                const sentenceBox = document.createElement('div');
                sentenceBox.className = 'sentence-box';
                sentenceBox.style.cssText = `
                  display: flex;
                  flex-wrap: wrap;
                  gap: 10px;
                  padding: 15px;
                  padding-right: 75px;
                  margin-bottom: 10px;
                  background-color: ${boxColor};
                  border: 2px solid ${borderColor};
                  border-radius: 8px;
                  width: 100%;
                  min-height: 120px;
                  box-sizing: border-box;
                  cursor: pointer;
                  transition: transform 0.2s, box-shadow 0.2s;
                  position: relative;
                `;
                sentenceBox.dataset.sentenceIndex = i;
                sentenceBox.dataset.sentenceText = sentence;

                // Add click handler to focus on this sentence
                sentenceBox.addEventListener('click', function() {
                  // Update the input field with this sentence
                  els.input.value = this.dataset.sentenceText;

                  // Visual feedback
                  document.querySelectorAll('.sentence-box').forEach(box => {
                    box.style.transform = '';
                    box.style.boxShadow = '';
                  });
                  this.style.transform = 'scale(1.02)';
                  this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

                  // Scroll to this box
                  this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });

                // Hover effect
                sentenceBox.addEventListener('mouseenter', function() {
                  if (this.style.transform !== 'scale(1.02)') {
                    this.style.transform = 'scale(1.01)';
                  }
                });
                sentenceBox.addEventListener('mouseleave', function() {
                  if (this.style.boxShadow !== '0 4px 12px rgba(0,0,0,0.15)') {
                    this.style.transform = '';
                  }
                });

                // Move all new tiles into the sentence box
                newTiles.forEach(tile => {
                  sentenceBox.appendChild(tile);
                });

                // Aggiungi i bottoni azione
                const actionsContainer = createSentenceActionButtons(sentenceBox, sentence);
                sentenceBox.appendChild(actionsContainer);

                // Add the sentence box to results
                els.res.appendChild(sentenceBox);
              }

              // Small delay between sentences
              await new Promise(resolve => setTimeout(resolve, 200));
            }

            setStatusKey('custom', { msg: (translateUI('doc_upload_success') || 'Documento caricato: {count} frasi trovate').replace('{count}', sentences.length) });

          } catch (err) {
            console.error('Document processing error:', err);
            setStatusKey('custom', { msg: translateUI('doc_upload_error') || 'Errore nel caricamento del documento' }, true);
          }
        };
        input.click();
      } catch (err) {
        console.error('Upload error:', err);
        setStatusKey('custom', { msg: translateUI('doc_upload_error') || 'Errore nel caricamento del documento' }, true);
      }
    });
  }

  // ── j. PDF print handler ──────────────────────────────────────────────────
  const printPdfBtn = document.getElementById('printPdfButton');
  if (printPdfBtn) {
    printPdfBtn.addEventListener('click', async () => {
      try {
        const resultDiv = document.getElementById('result');
        const tiles = resultDiv.querySelectorAll('.tile');

        if (tiles.length === 0) {
          alert(translateUI('pdf_print_no_tiles') || 'Nessun simbolo da stampare. Traduci prima una frase.');
          return;
        }

        setStatusKey('custom', { msg: translateUI('pdf_print_generating') || 'Generazione PDF in corso...' });

        // Temporarily hide action buttons and badges for print
        document.body.classList.add('printing-mode');
        const style = document.createElement('style');
        style.id = 'print-mode-style';
        style.textContent = `
          .printing-mode .action-buttons-container,
          .printing-mode .sentence-actions,
          .printing-mode .remove-symbol-btn,
          .printing-mode .tile .badge,
          .printing-mode .abc-btn,
          .printing-mode .add-symbol-btn,
          .printing-mode .gpt-symbol-btn {
            display: none !important;
          }
          .printing-mode .sentence-box {
            page-break-inside: avoid;
          }
        `;
        document.head.appendChild(style);

        // Wait a moment for styles to apply
        await new Promise(resolve => setTimeout(resolve, 300));

        // Ensure resultDiv has content and is visible
        console.log('Result div dimensions:', resultDiv.offsetWidth, 'x', resultDiv.offsetHeight);
        console.log('Result div scroll dimensions:', resultDiv.scrollWidth, 'x', resultDiv.scrollHeight);
        console.log('Tiles count:', tiles.length);
        console.log('Sentence boxes count:', resultDiv.querySelectorAll('.sentence-box').length);

        if (resultDiv.offsetHeight === 0 || resultDiv.offsetWidth === 0) {
          console.error('Result div has zero dimensions');
          document.body.classList.remove('printing-mode');
          document.getElementById('print-mode-style')?.remove();
          alert('Errore: il contenuto da stampare non è visibile');
          return;
        }

        // Generate PDF by capturing each sentence-box separately to avoid canvas size limits
        console.log('[PDF] Starting sentence-by-sentence PDF generation...');

        // Seleziona solo le sentence-box (non tile orphan)
        const sentenceBoxes = Array.from(resultDiv.children).filter(child => child.classList.contains('sentence-box'));
        console.log('[PDF] Found', sentenceBoxes.length, 'sentence boxes');

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = 297; // A4 height in mm
        const margin = 10; // mm
        let currentY = margin; // Current Y position on page
        let isFirstBox = true;

        if (sentenceBoxes.length === 0) {
          // Fallback: no sentence boxes, capture entire div
          console.log('[PDF] No sentence boxes found, capturing entire div as fallback');
          const canvas = await html2canvas(resultDiv, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
          });
          const imgWidth = pdfWidth;
          const imgHeight = (canvas.height * pdfWidth) / canvas.width;
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        } else {
          // Process each sentence box sequentially
          for (let i = 0; i < sentenceBoxes.length; i++) {
            const box = sentenceBoxes[i];
            console.log(`[PDF] Processing sentence box ${i + 1}/${sentenceBoxes.length}`);

            try {
              const canvas = await html2canvas(box, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: window.getComputedStyle(box).backgroundColor || '#ffffff',
                logging: false
              });

              // Calculate dimensions for PDF
              const boxImgWidth = pdfWidth - (2 * margin);
              const boxImgHeight = (canvas.height * boxImgWidth) / canvas.width;

              console.log(`[PDF] Box ${i + 1}: canvas=${canvas.width}x${canvas.height}, pdf=${boxImgWidth.toFixed(2)}x${boxImgHeight.toFixed(2)}mm, currentY=${currentY.toFixed(2)}mm`);

              // Check if we need a new page
              if (!isFirstBox && (currentY + boxImgHeight) > (pdfHeight - margin)) {
                console.log(`[PDF] Adding new page (would exceed ${pdfHeight}mm)`);
                pdf.addPage();
                currentY = margin;
              }

              // Add image to PDF
              const imgData = canvas.toDataURL('image/png');
              pdf.addImage(imgData, 'PNG', margin, currentY, boxImgWidth, boxImgHeight);

              // Update Y position for next box
              currentY += boxImgHeight + 5; // 5mm spacing between boxes
              isFirstBox = false;

            } catch (err) {
              console.error(`[PDF] Error processing sentence box ${i + 1}:`, err);
              // Continue with next box
            }
          }
        }

        // Download PDF
        console.log('[PDF] Saving PDF...');
        pdf.save(`simboli-${new Date().toISOString().slice(0, 10)}.pdf`);

        // Remove print mode
        document.body.classList.remove('printing-mode');
        document.getElementById('print-mode-style')?.remove();

        setStatusKey('custom', { msg: translateUI('pdf_print_success') || 'PDF generato con successo' });

      } catch (err) {
        console.error('PDF generation error:', err);
        document.body.classList.remove('printing-mode');
        document.getElementById('print-mode-style')?.remove();
        setStatusKey('custom', { msg: 'Errore nella generazione del PDF' }, true);
      }
    });
  }

  // ── k. Guide modal handlers ───────────────────────────────────────────────
  const guidaRapidaBtn = document.getElementById('guidaRapidaButton');
  const guidaAvanzataBtn = document.getElementById('guidaAvanzataButton');
  const videoTutorialBtn = document.getElementById('videoTutorialButton');

  if (guidaRapidaBtn) {
    guidaRapidaBtn.addEventListener('click', loadGuidaRapida);
  }
  if (guidaAvanzataBtn) {
    guidaAvanzataBtn.addEventListener('click', loadGuidaAvanzata);
  }
  if (videoTutorialBtn) {
    videoTutorialBtn.addEventListener('click', openVideoTutorial);
  }

  // Close guide / video modals when clicking outside
  ['guidaRapidaModal', 'guidaAvanzataModal', 'videoTutorialModal'].forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          // Ferma il video quando chiudi il modal
          if (modalId === 'videoTutorialModal') {
            const container = document.getElementById('youtubeContainer');
            if (container) container.innerHTML = '';
          }
        }
      });
    }
  });

  // Settings modal
  if (els.settingsButton && els.settingsModal && els.closeSettingsButton) {
    els.settingsButton.addEventListener('click', () => {
      // populate karaoke speed control when opening settings
      try{
        const ks = document.getElementById('karaokeSpeedInput');
        const kv = document.getElementById('karaokeSpeedValue');
        const cur = getKaraokeSpeed();
        if(ks) ks.value = String(cur);
        if(kv) kv.textContent = cur.toFixed(2);
        if(ks && !ks._karaokeBound){
          ks._karaokeBound = true;
          ks.addEventListener('input', (e)=>{
            try{ const val = parseFloat(e.target.value); localStorage.setItem('karaokeSpeed', String(val)); const vEl = document.getElementById('karaokeSpeedValue'); if(vEl) vEl.textContent = val.toFixed(2); if(window._karaokeController) window._karaokeController.rate = val; }catch(_){ }
          });
        }
      }catch(e){}
      // Load custom symbols list when opening settings
      if (typeof loadCustomSymbolsList === 'function') {
        loadCustomSymbolsList();
      }
      els.settingsModal.style.display = 'flex';
    });

    els.closeSettingsButton.addEventListener('click', () => {
      els.settingsModal.style.display = 'none';
    });

    // Chiudi cliccando fuori dal modal
    els.settingsModal.addEventListener('click', (e) => {
      if (e.target === els.settingsModal) {
        els.settingsModal.style.display = 'none';
      }
    });
  }

  // ── l. Translate button click ─────────────────────────────────────────────
  if (els.btn) {
    els.btn.addEventListener('click', () => {
      // Controlla se ci sono già sentence-box esistenti
      const existingBoxes = els.res.querySelectorAll('.sentence-box');
      const keepExisting = existingBoxes.length > 0;
      translate(keepExisting).catch(console.error);
    });
  }

  // ── m. updateTranslateButtonText + MutationObserver ───────────────────────
  const resObserver = new MutationObserver(() => {
    updateTranslateButtonText();
  });
  if (els.res) {
    resObserver.observe(els.res, { childList: true });
  }
  updateTranslateButtonText(); // Inizializza

  // ── n. Clear button ───────────────────────────────────────────────────────
  if (els.clear) {
    els.clear.addEventListener('click', () => { els.res.innerHTML=''; setStatusKey('clean'); els.input.focus(); });
  }

  // ── o. Speak button (if exists) ───────────────────────────────────────────
  if (els.speak) {
    els.speak.addEventListener('click', () => speakText().catch(console.error));
  }

  // ── p. Toggle tile actions button ─────────────────────────────────────────
  const toggleTileActionsBtn = document.getElementById('toggleTileActionsButton');
  if (toggleTileActionsBtn) {
    toggleTileActionsBtn.addEventListener('click', () => {
      document.body.classList.toggle('show-tile-actions');
      const isActive = document.body.classList.contains('show-tile-actions');
      toggleTileActionsBtn.setAttribute('aria-pressed', String(isActive));
      // persist preference
      try { localStorage.setItem('showTileActions', isActive ? 'true' : 'false'); } catch(e){}
    });
    // restore preference on load
    try {
      const saved = localStorage.getItem('showTileActions');
      if (saved === 'true') {
        document.body.classList.add('show-tile-actions');
        toggleTileActionsBtn.setAttribute('aria-pressed', 'true');
      }
    } catch(e){}
  }

  // ── q. speakSlow / karaoke inline overlay ─────────────────────────────────
  const speakSlowBtn = document.getElementById('speakSlowButton');
  if (speakSlowBtn) {
    speakSlowBtn.addEventListener('click', ()=>{
      try{
        const text = (els.input && els.input.value) ? els.input.value : '';
        if (!text || !text.trim()) { setStatusKey && setStatusKey('enter_phrase_prompt'); return; }
        const tokens = tokenize(String(text));

        // create overlay container (remove existing)
        try{ const prev = document.getElementById('karaokeOverlay'); if(prev) prev.remove(); }catch(e){}
        const overlay = document.createElement('div'); overlay.id = 'karaokeOverlay'; overlay.className = 'karaoke-overlay'; overlay.setAttribute('role','region'); overlay.setAttribute('aria-label', translateUI('exercises_play_slow') || '🐢 Karaoke (lento)');
        const wordsDiv = document.createElement('div'); wordsDiv.className = 'karaoke-words'; wordsDiv.setAttribute('aria-live','polite'); wordsDiv.style.maxHeight='6rem'; wordsDiv.style.overflow='auto';

        tokens.forEach((w,wi)=>{
          const span = document.createElement('span');
          span.className = 'karaoke-word';
          span.setAttribute('data-kword-index', String(wi));
          span.setAttribute('data-original', String(w));
          span.textContent = w + ' ';
          wordsDiv.appendChild(span);
        });

        // controls: play/pause, close and progress
        const controls = document.createElement('div'); controls.style.display='flex'; controls.style.flexDirection='column'; controls.style.gap='8px'; controls.style.minWidth='180px';

        const topRow = document.createElement('div'); topRow.style.display='flex'; topRow.style.gap='8px'; topRow.style.alignItems='center';
        const playPauseBtn = document.createElement('button'); playPauseBtn.type='button'; playPauseBtn.className='karaoke-stop-button'; playPauseBtn.textContent = translateUI('pause') || 'Pausa'; playPauseBtn.setAttribute('aria-pressed','false');
        const closeBtnK = document.createElement('button'); closeBtnK.type='button'; closeBtnK.className='button ghost'; closeBtnK.textContent = translateUI('close') || 'Chiudi';
        topRow.appendChild(playPauseBtn); topRow.appendChild(closeBtnK);

        const progressRow = document.createElement('div'); progressRow.style.display='flex'; progressRow.style.flexDirection='column';
        const progressLabel = document.createElement('div'); progressLabel.style.fontSize='0.85rem'; progressLabel.style.color='#334155'; progressLabel.textContent = '0 / ' + tokens.length;
        const progressBarWrap = document.createElement('div'); progressBarWrap.style.background='#e6eefc'; progressBarWrap.style.borderRadius='6px'; progressBarWrap.style.height='8px'; progressBarWrap.style.overflow='hidden';
        const progressBar = document.createElement('div'); progressBar.style.width='0%'; progressBar.style.height='100%'; progressBar.style.background='#60a5fa'; progressBar.style.transition='width 220ms linear'; progressBarWrap.appendChild(progressBar);
        progressRow.appendChild(progressLabel); progressRow.appendChild(progressBarWrap);

        controls.appendChild(topRow); controls.appendChild(progressRow);

        overlay.appendChild(wordsDiv); overlay.appendChild(controls);
        // Ensure overlay is visible and focusable so repeated activations show it reliably
        overlay.style.display = 'flex';
        overlay.style.visibility = 'visible';
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        overlay.setAttribute('aria-hidden','false');
        overlay.tabIndex = -1; // allow programmatic focus
        document.body.appendChild(overlay);
        try{ overlay.focus(); }catch(e){}

        // find matching symbols for initial hint (not strictly needed here)
        let firstSym = null; let targetWord = null;
        for (const t of tokens){ const sw = sanitizeWord(t); if(!sw) continue; const tile = Array.from(document.querySelectorAll('.tile')).find(tt=> sanitizeWord(tt.dataset.word||'')===sw); if(tile){ targetWord = sw; firstSym = tile.querySelector('img'); break; } }

        // Start karaoke (use persisted speed from Settings)
        playKaraoke(text, wordsDiv, targetWord, firstSym, (typeof getKaraokeSpeed === 'function') ? getKaraokeSpeed() : 0.7);

        // After playKaraoke created the controller, wire controls to it
        const ctrl = window._karaokeController || {};
        // default settings: read persisted karaoke speed from Settings
        ctrl.rate = (typeof getKaraokeSpeed === 'function') ? getKaraokeSpeed() : 0.7;
        // karaoke now highlights only tiles
        ctrl.highlightImages = false;
        ctrl.highlightLabels = false;
        ctrl.highlightTiles = true;

        // progress updater: called from playKaraoke
        ctrl.onprogress = function(idx, total){
          try{ progressLabel.textContent = (idx+1) + ' / ' + total; const pct = Math.round(((idx)/Math.max(1,total-1))*100); progressBar.style.width = pct + '%'; }catch(e){}
        };

        // play/pause toggle
        playPauseBtn.addEventListener('click', ()=>{
          try{
            if (!ctrl) return;
            if (!ctrl.paused){
              // pause
              ctrl.pause && ctrl.pause();
              ctrl.paused = true; playPauseBtn.textContent = translateUI('resume') || 'Riprendi'; playPauseBtn.setAttribute('aria-pressed','true');
            } else {
              // resume
              ctrl.paused = false; playPauseBtn.textContent = translateUI('pause') || 'Pausa'; playPauseBtn.setAttribute('aria-pressed','false');
              ctrl.resume && ctrl.resume();
            }
          }catch(e){ console.error(e); }
        });

        // close button - remove overlay and stop
        closeBtnK.addEventListener('click', ()=>{
          try{ if(window._karaokeController && typeof window._karaokeController.stop === 'function') window._karaokeController.stop(); }catch(e){}
        });

        // Note: speed is now managed in Settings; highlights are tile-only and not configurable here

      }catch(e){ console.error('speakSlow failed', e); }
    });
  }

  // ── r. Voice wiring ───────────────────────────────────────────────────────
  if(typeof speechSynthesis!=='undefined'){
    speechSynthesis.onvoiceschanged = populateVoices;
    populateVoices(); // Carica subito se già disponibili
  }

  // Salva la voce selezionata
  if (els.voiceSelect) {
    els.voiceSelect.addEventListener('change', () => {
      localStorage.setItem('selectedVoice', els.voiceSelect.value);
    });
  }

  // ── s. Grammar badges preference ──────────────────────────────────────────
  if (els.showGrammarBadges) {
    const savedShowBadges = localStorage.getItem('showGrammarBadges');
    if (savedShowBadges !== null) {
      els.showGrammarBadges.checked = savedShowBadges === 'true';
    }
    els.showGrammarBadges.addEventListener('change', () => {
      localStorage.setItem('showGrammarBadges', els.showGrammarBadges.checked);
      setStatusKey('grammar_badges_saved');
    });
  }

  // ── t. Sanity checks after a short delay ──────────────────────────────────
  setTimeout(runAppSanityChecks, 250);

  // ── u. Project save/load buttons ──────────────────────────────────────────
  const saveProjectBtn = document.getElementById('saveProjectButton');
  const loadProjectBtn = document.getElementById('loadProjectButton');

  if (saveProjectBtn) {
    saveProjectBtn.addEventListener('click', async () => {
      try {
        const resultDiv = document.getElementById('result');
        const sentenceBoxes = resultDiv.querySelectorAll('.sentence-box');

        if (sentenceBoxes.length === 0) {
          alert('Nessun contenuto da salvare. Crea prima alcune frasi con simboli.');
          return;
        }

        // Costruisci la struttura dati del progetto
        const projectData = {
          version: '1.0',
          timestamp: new Date().toISOString(),
          language: els.lang.value || 'it',
          sentences: []
        };

        // Per ogni sentence-box, salva testo e tiles
        sentenceBoxes.forEach((box, index) => {
          const sentenceText = box.dataset.sentenceText || '';
          // Seleziona solo i tile diretti figli del sentence-box (esclude tile nested in altri elementi come bottoni action)
          const tiles = Array.from(box.children).filter(child => child.classList.contains('tile'));
          const tileData = [];

          tiles.forEach(tile => {
            const wordEl = tile.querySelector('.word');
            const imgEl = tile.querySelector('img');

            // Salva l'intero dataset.ids che contiene tutti i simboli disponibili
            tileData.push({
              word: wordEl ? wordEl.textContent.trim() : '',
              ids: tile.dataset.ids || '[]', // Array JSON di tutti gli ID disponibili
              index: tile.dataset.index || '0', // Indice corrente dell'immagine selezionata
              skipped: tile.dataset.skipped === 'true',
              tense: tile.dataset.tense || null,
              textOnlyMode: tile.dataset.textOnlyMode === 'true' // Se è visualizzato solo il testo
            });
          });

          projectData.sentences.push({
            text: sentenceText,
            tiles: tileData
          });
        });

        // Converti in JSON
        const jsonString = JSON.stringify(projectData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Download file
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `progetto-simboli-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        setStatusKey('custom', { msg: 'Progetto salvato con successo!' });
      } catch (err) {
        console.error('Save project error:', err);
        setStatusKey('custom', { msg: 'Errore nel salvataggio del progetto' }, true);
      }
    });
  }

  if (loadProjectBtn) {
    loadProjectBtn.addEventListener('click', () => {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
          try {
            const file = e.target.files[0];
            if (!file) return;

            const text = await file.text();
            const projectData = JSON.parse(text);

            if (!projectData.sentences || !Array.isArray(projectData.sentences)) {
              alert('File non valido: formato progetto non riconosciuto');
              return;
            }

            // Pulisci il contenuto esistente
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '';

            // Ricrea ogni sentence-box
            for (let i = 0; i < projectData.sentences.length; i++) {
              const sentenceData = projectData.sentences[i];
              const sentenceText = sentenceData.text;

              // Crea il sentence-box
              const sentenceBox = document.createElement('div');
              sentenceBox.className = 'sentence-box';
              const boxColor = i % 2 === 0 ? '#e3f2fd' : '#fff3e0';
              const borderColor = i % 2 === 0 ? '#2196f3' : '#ff9800';
              sentenceBox.style.cssText = `
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                padding: 15px;
                padding-right: 75px;
                margin-bottom: 10px;
                background-color: ${boxColor};
                border: 2px solid ${borderColor};
                border-radius: 8px;
                width: 100%;
                min-height: 120px;
                box-sizing: border-box;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                position: relative;
                grid-column: 1 / -1;
              `;
              sentenceBox.dataset.sentenceIndex = i;
              sentenceBox.dataset.sentenceText = sentenceText;

              // Click handler per focus visivo
              sentenceBox.addEventListener('click', (ev) => {
                if (ev.target.closest('button') || ev.target.closest('.tile')) return;
                sentenceBox.style.transform = 'scale(1.02)';
                sentenceBox.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                setTimeout(() => {
                  sentenceBox.style.transform = '';
                  sentenceBox.style.boxShadow = '';
                }, 300);
              });

              // Aggiungi bottoni azione
              const actionsContainer = createSentenceActionButtons(sentenceBox, sentenceText);
              sentenceBox.appendChild(actionsContainer);

              // Aggiungi al DOM prima di creare i tile
              resultDiv.appendChild(sentenceBox);

              // Ricrea i tiles usando i dati salvati
              for (const tileData of sentenceData.tiles) {
                // Parsea l'array di ID salvato
                let ids = [];
                try {
                  ids = JSON.parse(tileData.ids || '[]');
                } catch (parseErr) {
                  console.error('Failed to parse tile ids:', parseErr);
                  ids = [];
                }

                // Usa addTile per creare il tile con tutti gli event listener
                const skipped = tileData.skipped === true || tileData.skipped === 'true';
                const tileTense = tileData.tense || null;
                await addTile(ids, tileData.word, skipped, tileTense, [], false, null, sentenceBox);

                // Ripristina lo stato del tile (indice immagine e modalità testo)
                const newTile = sentenceBox.lastElementChild;
                if (newTile && newTile.classList.contains('tile')) {
                  // Imposta l'indice salvato per mostrare lo stesso simbolo
                  if (tileData.index) {
                    newTile.dataset.index = tileData.index;
                    const img = newTile.querySelector('img');
                    if (img) setImageForTile(newTile, img);
                  }

                  // Ripristina la modalità "solo testo" se era attiva
                  if (tileData.textOnlyMode === true || tileData.textOnlyMode === 'true') {
                    showTextOnly(newTile, tileData.word);
                  }
                }
              }
            }

            setStatusKey('custom', { msg: `Progetto caricato: ${projectData.sentences.length} frasi` });

          } catch (err) {
            console.error('Load project error:', err);
            alert('Errore nel caricamento del progetto. Verifica che il file sia valido.');
          }
        };

        input.click();
      } catch (err) {
        console.error('Load project error:', err);
        setStatusKey('custom', { msg: 'Errore nel caricamento del progetto' }, true);
      }
    });
  }

} // ── end initApp() ──────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// 7. DOMContentLoaded listener
// ═══════════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initApp();

  // Loads keyword index if Italian
  if ((els.lang.value || 'it') === 'it') {
    loadKeywordIndexIT();
  }

  // Shows folder reminder after 1 second
  setTimeout(() => {
    if (!localImageFolderHandle) {
      setStatusKey('remind_select_folder');
    }
  }, 1000);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Language change listener on els.lang
// ═══════════════════════════════════════════════════════════════════════════════
// Note: els.lang may not be set yet at top-level, so we defer via a short check.
// The listener is also safely set inside initApp's initLanguage block, but we
// add the keyword-index specific one here as well.
(function _deferLangChangeListener() {
  const _attach = () => {
    if (typeof els !== 'undefined' && els.lang) {
      els.lang.addEventListener('change', (e) => {
        if (e.target.value === 'it' && !keywordIndexReady) {
          loadKeywordIndexIT();
        }
      });
    } else {
      // els not ready yet; try again shortly
      setTimeout(_attach, 200);
    }
  };
  _attach();
})();

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Global error handlers
// ═══════════════════════════════════════════════════════════════════════════════
try {
  window.addEventListener('error', function (ev) {
    try {
      const msg = ev && ev.error && ev.error.message ? ev.error.message : (ev && ev.message) || String(ev);
      console.error('[Global Error]', ev.error || ev.message || ev);
      setStatusKey('js_error', { msg: msg }, true);
    } catch (e) {
      console.error('[Global Error handler failed]', e);
    }
  });

  window.addEventListener('unhandledrejection', function (ev) {
    try {
      const reason = ev && ev.reason ? (ev.reason.message || String(ev.reason)) : 'Promise rejected';
      console.error('[Unhandled Rejection]', ev.reason || ev);
      setStatusKey('unhandled_rejection', { msg: reason }, true);
    } catch (e) {
      console.error('[UnhandledRejection handler failed]', e);
    }
  });
} catch (e) {
  console.warn('Could not attach global error handlers', e);
}
