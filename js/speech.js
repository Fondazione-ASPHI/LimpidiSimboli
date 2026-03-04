/* js/speech.js – Text-to-Speech & Karaoke for Limpidi Simboli */

function getItalianVoice(){ 
  const voices = window.speechSynthesis.getVoices(); 
  // Se l'utente ha selezionato una voce specifica, usala
  const selectedVoiceName = els.voiceSelect.value;
  if (selectedVoiceName) {
    const selectedVoice = voices.find(v => v.name === selectedVoiceName);
    if (selectedVoice) return selectedVoice;
  }
  // Altrimenti cerca automaticamente una voce italiana
  let v = voices.find(v=>/it[-_]/i.test(v.lang)); 
  if(!v) v = voices.find(v=>v.lang && v.lang.toLowerCase().startsWith('it')); 
  return v || voices[0] || null; 
}

function populateVoices() {
  const voices = window.speechSynthesis.getVoices();
  els.voiceSelect.innerHTML = '<option value="">Voce automatica (IT)</option>';
  voices.forEach(voice => {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    els.voiceSelect.appendChild(option);
  });
  // Recupera la voce salvata
  const savedVoice = localStorage.getItem('selectedVoice');
  if (savedVoice) {
    els.voiceSelect.value = savedVoice;
  }
}

function speakText(){
  const text = els.input.value.trim(); if(!text){ setStatusKey('nothing_to_read'); return; }
  const u = new SpeechSynthesisUtterance(text); u.lang='it-IT'; const v = getItalianVoice(); if(v) u.voice=v; u.rate=1; u.pitch=1; u.onstart=()=>setStatusKey('speech_started'); u.onend=()=>setStatusKey('speech_ended'); u.onerror=()=>setStatusKey('speech_error', null, true);
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
}

// Funzione per parlare una specifica frase (usata dai bottoni nei sentence-box)
function speakSentence(text, isSlow = false) {
  if (!text || !text.trim()) {
    setStatusKey('nothing_to_read');
    return;
  }
  
  const u = new SpeechSynthesisUtterance(text.trim());
  u.lang = 'it-IT';
  const v = getItalianVoice();
  if (v) u.voice = v;
  u.rate = isSlow ? 0.7 : 1;
  u.pitch = 1;
  u.onstart = () => setStatusKey('speech_started');
  u.onend = () => setStatusKey('speech_ended');
  u.onerror = () => setStatusKey('speech_error', null, true);
  
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function playKaraoke(text, box, targetWord, symImgEl, rate = 0.7){
  try{
    if(!box) return;
    // If a previous karaoke controller exists, stop it first
    try{ if(window._karaokeController && typeof window._karaokeController.stop === 'function') { window._karaokeController.stop(); } }catch(e){}

    // build controller to allow stop/cleanup
    window._karaokeController = { aborted:false, timeouts:[], currentUtter:null, overlayBox: box, stop: null, paused:false, rate: rate };

    // cleanup any previous highlights and queued speech
    try{ window.speechSynthesis.cancel(); }catch(e){}
    // remove any previous tile-only highlights
    Array.from(document.querySelectorAll('.tile.karaoke-symbol-highlight-tile')).forEach(el=>{ try{ el.classList.remove('karaoke-symbol-highlight-tile'); }catch(e){} });
    // also remove any previous karaoke-word highlights in the box (text-only mode)
    try{ Array.from(box.querySelectorAll('.karaoke-word.karaoke-highlight')).forEach(el=>el.classList.remove('karaoke-highlight')); }catch(e){}

    // Prefer using the rendered spans in the box so we can read the original
    // word even if the visible text is replaced (e.g. '____').
    const spans = Array.from(box.querySelectorAll('.karaoke-word'));

    // Map each span to a list of symbol elements (images, word labels or whole tiles)
    const spanToSym = spans.map(sp => {
      const out = [];
      try{
        const w = String(sp.getAttribute('data-original')||sp.textContent||'').trim();
        const sw = sanitizeWord(w);
        if(!sw) return out;
        // find ALL tiles that match this sanitized word
        const tiles = Array.from(document.querySelectorAll('.tile')).filter(tt=> sanitizeWord(tt.dataset.word||'')===sw);
        for(const tile of tiles){
          // prefer image if present
          const img = tile.querySelector('img');
          if(img) out.push(img);
          // also include the tile element itself and the text label if available
          out.push(tile);
          const wlab = tile.querySelector('.word'); if(wlab) out.push(wlab);
        }
        // deduplicate
        if(out.length){
          const uniq = [];
          const seen = new Set();
          for(const el of out){ if(!seen.has(el)){ seen.add(el); uniq.push(el); } }
          return uniq;
        }
      }catch(e){}
      return out;
    });

    // Determine whether this is a text-only playback (no tile matches at all)
    const textOnlyMode = !spanToSym.some(list => Array.isArray(list) && list.some(el => el && el.classList && el.classList.contains && el.classList.contains('tile')));
    // If the caller provided a local exercise box (not the overlay), prefer highlighting the spans inside that box
    const inOverlay = (box && box.closest && !!box.closest('#karaokeOverlay'));
    const useSpanHighlight = (!inOverlay) || textOnlyMode;

    // helper to clear highlights
    function clearAllHighlights(){
      try{ Array.from(document.querySelectorAll('.tile.karaoke-symbol-highlight-tile')).forEach(el=>{ try{ el.classList.remove('karaoke-symbol-highlight-tile'); }catch(e){} }); }catch(e){}
      try{ if(useSpanHighlight){ spans.forEach(s=>s.classList.remove('karaoke-highlight')); } }catch(e){}
    }

    // stop implementation
    window._karaokeController.stop = function(){
      try{ this.aborted = true; window.speechSynthesis.cancel(); }catch(e){}
      try{ this.timeouts.forEach(t=>clearTimeout(t)); this.timeouts = []; }catch(e){}
      clearAllHighlights();
      // remove overlay if it was created as temporary (look for id karaokeOverlay)
      try{ const ov = document.getElementById('karaokeOverlay'); if(ov) ov.remove(); }catch(e){}
    };

    // Helper to play a short beep using WebAudio for masked words
    function playBeep(duration = 400, frequency = 800){
      try{
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = frequency;
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
        o.connect(g); g.connect(ctx.destination);
        o.start();
        const to = setTimeout(()=>{
          try{ g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02); o.stop(ctx.currentTime + 0.03); ctx.close(); }catch(e){}
        }, duration);
        window._karaokeController.timeouts.push(to);
      }catch(e){ console.warn('beep failed', e); }
    }

    // Sequentially play each token (so beeps and TTS don't overlap)
    let idx = 0;
    const speakNext = ()=>{
      if(window._karaokeController.aborted) return clearAllHighlights();
        // if paused, do nothing; resume() will call speakNext()
        if(window._karaokeController.paused) return;
        // notify UI of progress (idx will be current index)
        try{ const c = window._karaokeController; if(c && typeof c.onprogress === 'function') c.onprogress(idx, spans.length); }catch(e){}
      if (idx >= spans.length) {
        // finished — keep overlay visible (user can close it) and clear highlights
        return clearAllHighlights();
      }
      const spanEl = spans[idx];
      const masked = (spanEl && (String(spanEl.textContent||'').trim() === '____'));
      const word = (spanEl && spanEl.getAttribute('data-original')) ? String(spanEl.getAttribute('data-original')||'').trim() : String(spanEl.textContent||'').trim();

      // Highlight start
      try{ spanEl.scrollIntoView({behavior:'smooth', block:'center'}); }catch(e){}
      const symlist = spanToSym[idx] || [];
      if (useSpanHighlight) {
        try{ spans.forEach(el=>el.classList.remove('karaoke-highlight')); }catch(e){}
        try{ spanEl.classList.add('karaoke-highlight'); }catch(e){}
      } else {
        // highlight per-word symbols (all matching tiles) — tile-only
        if(Array.isArray(symlist) && symlist.length){
          symlist.forEach(el=>{
            try{
              const isTile = el.classList && el.classList.contains && el.classList.contains('tile');
              if(isTile){ el.classList.add('karaoke-symbol-highlight-tile'); }
            }catch(e){}
          });
        }
      }

      if (masked){
        // play short beep instead of reading the missing word
        playBeep(450, 700);
        // keep highlight for beep duration then advance
        const to = setTimeout(()=>{
          try{ if(useSpanHighlight){ try{ spanEl.classList.remove('karaoke-highlight'); }catch(e){} } else { if(Array.isArray(symlist)){ symlist.forEach(el=>{ try{ el.classList.remove('karaoke-symbol-highlight-tile'); }catch(e){} }); } } }catch(e){}
          idx++; speakNext();
        }, 500);
        window._karaokeController.timeouts.push(to);
      } else if (word){
        try{
          const ut = new SpeechSynthesisUtterance(word);
          window._karaokeController.currentUtter = ut;
          // respect dynamic rate from controller when set
          const ctrlRate = (window._karaokeController && typeof window._karaokeController.rate === 'number') ? window._karaokeController.rate : rate;
          ut.rate = Math.max(0.4, Math.min(1.2, ctrlRate));
          try{ const v = (typeof getItalianVoice === 'function') ? getItalianVoice() : null; if(v){ ut.voice = v; try{ ut.lang = v.lang || ut.lang; }catch(e){} } }catch(e){}
          ut.onend = ()=>{
            if(window._karaokeController.aborted) return clearAllHighlights();
            try{ if(useSpanHighlight){ try{ spanEl.classList.remove('karaoke-highlight'); }catch(e){} } else { if(Array.isArray(symlist)){ symlist.forEach(el=>{ try{ el.classList.remove('karaoke-symbol-highlight-tile'); }catch(e){} }); } } }catch(e){}
            idx++; speakNext();
          };
          ut.onerror = ()=>{ try{ if(useSpanHighlight){ try{ spanEl.classList.remove('karaoke-highlight'); }catch(e){} } else { if(Array.isArray(symlist)){ symlist.forEach(el=>{ try{ el.classList.remove('karaoke-symbol-highlight-tile'); }catch(e){} }); } } }catch(e){}; idx++; speakNext(); };
          window.speechSynthesis.speak(ut);
        }catch(e){ console.warn('TTS failed', e); try{ if(Array.isArray(symlist)){ symlist.forEach(el=>{ try{ el.classList.remove('karaoke-symbol-highlight-tile'); }catch(e){} }); } }catch(e){}; idx++; speakNext(); }
      } else {
        // Nothing to say, just advance
        try{ if(Array.isArray(symlist)){ symlist.forEach(el=>{ try{ el.classList.remove('karaoke-symbol-highlight-tile'); }catch(e){} }); } }catch(e){}
        idx++; speakNext();
      }
    };

    // expose pause/resume on the controller
    window._karaokeController.pause = function(){
      try{ this.paused = true; window.speechSynthesis.cancel(); this.timeouts.forEach(t=>clearTimeout(t)); this.timeouts = []; }catch(e){}
    };
    window._karaokeController.resume = function(){
      try{ if(!this.paused) return; this.paused = false; speakNext(); }catch(e){}
    };

    // start
    speakNext();
  }catch(e){ console.warn('playKaraoke failed', e); }
}
