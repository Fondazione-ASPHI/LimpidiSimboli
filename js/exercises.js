/* js/exercises.js – Exercise generator module for Limpidi Simboli */

// ===== Exercises generator: minimal in-browser generator for MCQ and gap-fill =====
(function exercisesModule(){
  const exBtn = document.getElementById('createExercisesButton');
  const modal = document.getElementById('exercisesModal');
  const modalClose = document.getElementById('exercisesModalClose');
  const exCloseBtn = document.getElementById('exModalCloseBtn');
  const generateBtn = document.getElementById('exModalGenerate');
  const exportBtn = document.getElementById('exModalExport');
  const preview = document.getElementById('exModalPreview');
  const typeSel = document.getElementById('exModalType');
  const levelSel = document.getElementById('exModalLevel');
  const countInput = document.getElementById('exModalCount');
  const titleEl = document.getElementById('exercisesModalTitle');
  const typeLabel = document.getElementById('exModalTypeLabel');
  const levelLabel = document.getElementById('exModalLevelLabel');
  const previewTitle = document.getElementById('exModalPreviewTitle');

  // Variable to store sentences loaded from PDF in exercises modal
  let exercisesModalSentences = null;

  function openModal(){
    // Reset PDF sentences when opening modal
    exercisesModalSentences = null;
    // set localized texts
    try {
      titleEl.textContent = translateUI('exercises_modal_title');
      typeLabel.textContent = translateUI('exercises_modal_type_label');
      levelLabel.textContent = translateUI('exercises_modal_level_label');
      generateBtn.textContent = translateUI('exercises_modal_generate');
      exportBtn.textContent = translateUI('exercises_modal_export_json');
      exCloseBtn.textContent = translateUI('exercises_modal_close');
      previewTitle.textContent = translateUI('exercises_modal_preview_title');
      // localize the dynamic option labels where present
      try{
        const optMcq = typeSel.querySelector('option[value="mcq"]'); if(optMcq) optMcq.textContent = translateUI('exercises_modal_type_mcq') || optMcq.textContent;
        const optWrite = typeSel.querySelector('option[value="write"]'); if(optWrite) optWrite.textContent = translateUI('mode_write') || optWrite.textContent;
        const optSpeak = typeSel.querySelector('option[value="speak"]'); if(optSpeak) optSpeak.textContent = translateUI('mode_speak') || optSpeak.textContent;
      }catch(e){}
    } catch (e) {}
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden','true');
    // Reset sentence-box exercise sentence
    window._currentExerciseSentence = null;
    // stop any active speech recognizers started from the exercises modal
    try{
      if (window._activeSpeechRecognizers && window._activeSpeechRecognizers.length){
        window._activeSpeechRecognizers.forEach(r=>{ try{ r.stop(); }catch(_){}});
        window._activeSpeechRecognizers = [];
      }
    }catch(e){}
  }

  if (exBtn) exBtn.addEventListener('click', () => {
    const text = (document.getElementById('textInput')||{value:''}).value || '';
    if (!text.trim()) { alert(translateUI('exercises_modal_no_text')); return; }
    openModal();
  });
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (exCloseBtn) exCloseBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e)=>{ if (e.target===modal) closeModal(); });
  }

  // Simple tokenization + stopword filter
  function wordsFromText(text, skipStop){
    const toks = tokenize(text).map(t=>sanitizeWord(t)).filter(Boolean);
    if (!skipStop) return toks;
    return toks.filter(w => !STOP_IT.has(w));
  }

  function pickTargets(words, count){
    // choose content words (length>3) or fallback to any word
    const content = words.filter(w=>w.length>3);
    const pool = content.length ? content : words;
    // pick up to count distinct words
    const out = [];
    for (let i=0;i<pool.length && out.length<count;i++) out.push(pool[i]);
    return out;
  }

  // MCQ distractors: use other words in the sentence plus simple common words
  // Extended list of common simple distractors (ordered roughly by frequency/utility)
  const COMMON_DISTRACTORS = ['cane','gatto','casa','scuola','libro','mela','pane','acqua','latte','auto','bambino','donna','uomo','sedia','tavolo','porta','finestra','sole','luna','fiore'];

  function generateExercisesFromText(text, options={type:'gap', count:3, level:'A1', skipStop:true}){
    const words = wordsFromText(text, options.skipStop);
    const targets = pickTargets(words, options.count);
    const exercises = [];

    // simple levenshtein for similarity
    function levenshtein(a,b){
      if(!a||!b) return Math.max(a?.length||0,b?.length||0);
      const m = a.length, n = b.length; const dp = Array.from({length:m+1}, ()=>Array(n+1).fill(0));
      for(let i=0;i<=m;i++) dp[i][0]=i; for(let j=0;j<=n;j++) dp[0][j]=j;
      for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) dp[i][j]= Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
      return dp[m][n];
    }

    // produce distractors tuned by level
    function getDistractors(target, poolWords, level){
      const others = poolWords.filter(w=>w!==target && w.length>0);
      const uniq = Array.from(new Set([...others, ...COMMON_DISTRACTORS]));
      // heuristics per level
      if (level === 'A0'){
        // easiest: use very common words first
        const picks = uniq.filter(w=>COMMON_DISTRACTORS.includes(w)).slice(0,3);
        while(picks.length<3){ const c = uniq[Math.floor(Math.random()*uniq.length)]; if(!picks.includes(c) && c!==target) picks.push(c||'---'); }
        return picks;
      }
      if (level === 'A1' || level === 'A2'){
        // medium: mix other words from sentence and common
        const picks = [];
        const shuffled = uniq.sort(()=>Math.random()-0.5);
        for(const w of shuffled){ if(picks.length>=3) break; if(w!==target) picks.push(w); }
        while(picks.length<3) picks.push('---');
        return picks;
      }
      // B1 and higher: pick words similar to target (levenshtein small) for challenging distractors
      const similar = uniq.filter(w=>{ const d=levenshtein(w,target); return d>0 && d<=2; });
      const picks = similar.slice(0,3);
      // fallback to random if not enough
      let idx=0;
      while(picks.length<3 && idx<uniq.length){ const w=uniq[idx++]; if(!picks.includes(w) && w!==target) picks.push(w); }
      while(picks.length<3) picks.push('---');
      return picks;
    }

    if (options.type === 'gap' || options.type === 'write'){
      // create gap-fill by replacing the target with ___ in the sentence
      for (const tgt of targets){
        const re = new RegExp('\\b'+tgt+'\\b','i');
        const prompt = text.replace(re, '____');
        exercises.push({ type: 'gap', question: prompt, answer: tgt, mode: options.type });
      }
    } else if (options.type === 'mcq'){
      for (const tgt of targets){
        const distractors = getDistractors(tgt, words, options.level || 'A1');
        const choices = [tgt, ...distractors].slice(0,4);
        // simple shuffle
        for (let i=choices.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [choices[i],choices[j]]=[choices[j],choices[i]]; }
        exercises.push({ type:'mcq', question: `Scegli la parola corretta per: ${tgt}`, answer: tgt, choices });
      }
    } else if (options.type === 'speak'){
      for (const tgt of targets){
        exercises.push({ type:'speak', question: `Dì la parola per: ${tgt}`, answer: tgt });
      }
    }
    return exercises;
  }

  function renderExercisesPreview(exs){
    preview.innerHTML = '';
    if (!exs || !exs.length) { preview.innerHTML = '<div style="color:#64748b">' + (translateUI('exercises_none') || '(no exercises)') + '</div>'; return; }
    // helper: try to find an existing result tile for a word
    function findTileForWord(word){
      try{
        const tiles = Array.from(document.querySelectorAll('.tile'));
        for(const t of tiles){
          const tw = (t.dataset && t.dataset.word) ? sanitizeWord(t.dataset.word) : sanitizeWord((t.querySelector('.word')||{textContent:''}).textContent||'');
          if (!tw) continue;
          if (tw === sanitizeWord(word)) return t;
        }
      }catch(e){}
      return null;
    }

    const sequentialWrite = Array.isArray(exs) && exs.some(x=> x && x.mode === 'write');
    // Sequential mode: show one question at a time for all exercise types
    const sequentialMode = true;
    // Container for exercise boxes (keeps preview children stable when we add global controls)
    const exContainer = document.createElement('div');
    // Global advance control (persistent) — placed above the exercises
    const globalControl = document.createElement('div');
    globalControl.style.cssText = 'display:flex;justify-content:flex-end;margin-bottom:8px;';
    const globalAdvBtn = document.createElement('button');
    globalAdvBtn.type = 'button';
    globalAdvBtn.className = 'button ghost';
    globalAdvBtn.textContent = translateUI('exercises_button_skip') || 'Avanti/Salta';
    globalAdvBtn.title = translateUI('exercises_button_skip') || 'Avanti/Salta';
    globalControl.appendChild(globalAdvBtn);
    preview.appendChild(globalControl);
    // attach the container that will hold the individual exercise boxes
    preview.appendChild(exContainer);

    // Stats collection (skipped will be incremented when user uses the Skip/Avanti control)
    const stats = { correct: 0, incorrect: 0, skipped: 0, total: exs.length };
    function renderReport(){
      preview.innerHTML = '';
      const rpt = document.createElement('div');
      rpt.style.cssText = 'padding:12px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;text-align:center;';
      const title = document.createElement('h3'); title.textContent = translateUI('exercises_report_title') || 'Report esercizi'; title.style.marginTop='0'; rpt.appendChild(title);
      const ok = document.createElement('div'); ok.textContent = (translateUI('exercises_report_correct')||'Corrette') + ': ' + stats.correct; ok.style.color = '#065f46'; ok.style.margin='8px 0'; rpt.appendChild(ok);
      const ko = document.createElement('div'); ko.textContent = (translateUI('exercises_report_incorrect')||'Sbagliate') + ': ' + stats.incorrect; ko.style.color = '#b91c1c'; ko.style.margin='8px 0'; rpt.appendChild(ko);
      const sk = document.createElement('div'); sk.textContent = (translateUI('exercises_report_skipped')||'Saltate') + ': ' + stats.skipped; sk.style.color = '#6b7280'; sk.style.margin='8px 0'; rpt.appendChild(sk);
      preview.appendChild(rpt);
    }

    // helper to advance to next question (index i) inside exContainer
    function makeAdvanceHandler(currentIndex, box){
      return function(mark){
        // increment according to mark
        if(mark === 'correct') stats.correct++;
        else if(mark === 'incorrect') stats.incorrect++;
        else if(mark === 'skipped') stats.skipped++;
        // hide current box
        try{ box.style.display = 'none'; }catch(e){}
        const next = exContainer.children[currentIndex+1];
        if(next){ next.style.display = ''; const nextInput = next.querySelector('input[type="text"]'); if(nextInput) try{ nextInput.focus(); }catch(_){ } try{ next.scrollIntoView({behavior:'smooth', block:'center'}); }catch(_){ } }
        else { renderReport(); }
      };
    }

    // global advance button behavior: find current visible index and advance without counting as skipped
    globalAdvBtn.addEventListener('click', ()=>{
      try{
        const children = Array.from(exContainer.children);
        const idx = children.findIndex(c => (c.style.display || '') !== 'none');
        if(idx < 0) return;
        const box = children[idx];
        const adv = makeAdvanceHandler(idx, box);
        adv('skipped');
      }catch(e){ }
    });

    exs.forEach((e,i)=>{
      const box = document.createElement('div');
      box.style.cssText = 'padding:10px;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:8px;background:white;';
      if (sequentialMode) box.style.display = (i===0 ? '' : 'none');
      const h = document.createElement('div'); h.style.fontWeight='700'; h.style.marginBottom='6px'; h.textContent = `${i+1}. ${e.type.toUpperCase()}`;
      box.appendChild(h);
      if (e.type==='gap'){
        // Gap-fill: show sentence with blank, input for answer, check button and feedback.
        const p = document.createElement('div'); p.style.marginBottom='8px';
        // Render the sentence as per-word spans so karaoke highlighting can work.
        // Use original sentence if available (e.sentence), otherwise use the displayed question.
        const sentenceSource = e.sentence || e.question || '';
        const sentenceWords = tokenize(String(sentenceSource));
        sentenceWords.forEach((w, wi)=>{
          const span = document.createElement('span');
          span.className = 'karaoke-word';
          span.setAttribute('data-kword-index', String(wi));
          // keep original word for karaoke even if we display a blank
          span.setAttribute('data-original', String(w));
          // If this word corresponds to the target, show blank (____) in the displayed prompt,
          // but keep the underlying data-word for karaoke matching.
          if (sanitizeWord(w) === sanitizeWord(e.answer)){
            span.textContent = '____';
          } else {
            span.textContent = w + ' ';
          }
          span.style.whiteSpace = 'pre-wrap';
          p.appendChild(span);
        });
        box.appendChild(p);
        const controls = document.createElement('div'); controls.style.display='flex'; controls.style.gap='8px'; controls.style.alignItems='center'; controls.style.marginBottom='8px';
        const input = document.createElement('input'); input.type='text'; input.placeholder='Inserisci la parola'; input.style.cssText='padding:8px;border:1px solid #d1d5db;border-radius:8px;flex:1;';
        const msg = document.createElement('div'); msg.style.marginLeft='8px'; msg.setAttribute('role','status'); msg.setAttribute('aria-live','polite');
        controls.appendChild(input); controls.appendChild(msg);
        // Play slow / karaoke button
        const playSlow = document.createElement('button'); playSlow.type='button'; playSlow.className='button ghost'; playSlow.textContent = translateUI('exercises_play_slow') || '🐢 Karaoke (lento)';
        playSlow.style.marginLeft='8px'; playSlow.addEventListener('click', ()=>{
          // call karaoke with the original sentence and symbol image (if present)
          playKaraoke(e.sentence || e.question || '', box, e.answer, symImgEl, 0.7);
        });
        controls.appendChild(playSlow);
        // Skip / Next button (advances the sequential preview and marks skipped)
        const skipBtn = document.createElement('button');
        skipBtn.type = 'button';
        skipBtn.className = 'button ghost';
        skipBtn.textContent = translateUI('exercises_button_skip') || 'Avanti/Salta';
        skipBtn.style.marginLeft = '8px';
        skipBtn.addEventListener('click', ()=>{
          const adv = makeAdvanceHandler(i, box);
          try{ adv('skipped'); }catch(e){ /* ignore */ }
        });
        controls.appendChild(skipBtn);
        box.appendChild(controls);

        const target = e.answer;
        // try to find a tile with symbol for this word
        const tile = findTileForWord(target);
        let symImg = null;
        if (tile){
          const imgEl = tile.querySelector('img');
          if (imgEl){
            symImg = imgEl.cloneNode(true);
            symImg.style.maxWidth = '120px';
            symImg.style.marginTop = '6px';
            symImg.style.border = '1px solid #e5e7eb';
            symImg.style.borderRadius = '8px';
            symImg.style.background = '#fff';
            // For 'scrivi' exercises we show the symbol hint by default
            symImg.style.display = '';
          }
        }

        const toggle = document.createElement('button');
        toggle.className = 'abc-btn';
        toggle.type = 'button';
        try{ toggle.style.cssText = (toggle.style.cssText||'') + 'position:relative; z-index:10000; cursor:pointer;'; }catch(e){}
        try { toggle.textContent = translateUI('legend_abc_title') || 'ABC'; } catch(e){ toggle.textContent = 'ABC'; }
        toggle.style.marginLeft = '6px';
        // bind to a local constant so each toggle controls its own image
        const symImgEl = symImg;
        // accessibility and tooltip - default to shown for write/gap exercises
        toggle.setAttribute('aria-pressed','true');
        const showTitle = translateUI('exercises_toggle_show') || 'Mostra simbolo';
        const hideTitle = translateUI('exercises_toggle_hide') || 'Nascondi simbolo';
        toggle.title = hideTitle;
        toggle.setAttribute('aria-label', hideTitle);
        // visual hint next to toggle
        const hint = document.createElement('span');
        hint.className = 'ex-toggle-hint';
        hint.textContent = hideTitle;
        hint.style.cssText = 'font-size:0.88rem;color:#2563eb;margin-left:8px;vertical-align:middle; position:relative; z-index:1;';
        try{ hint.style.pointerEvents = 'none'; }catch(e){}

        toggle.addEventListener('click', ()=>{
          if (symImgEl){
            const nowHidden = (symImgEl.style.display === 'none');
            symImgEl.style.display = nowHidden ? '' : 'none';
            // update aria and tooltip
            toggle.setAttribute('aria-pressed', nowHidden ? 'true' : 'false');
            toggle.title = nowHidden ? hideTitle : showTitle;
            toggle.setAttribute('aria-label', nowHidden ? hideTitle : showTitle);
            // update visual hint text
            hint.textContent = nowHidden ? hideTitle : showTitle;
          }
        });

        if (symImgEl) box.appendChild(toggle);
        if (symImgEl) box.appendChild(hint);
        if (symImgEl) {
          // ensure symbol image is behind controls so buttons remain clickable
          try{ symImgEl.style.position = symImgEl.style.position || 'relative'; symImgEl.style.zIndex = 1; symImgEl.style.pointerEvents = 'none'; }catch(e){}
          // allow karaoke highlight styling
          try{ symImgEl.classList.add('exercise-symbol'); }catch(e){}
          box.appendChild(symImgEl);
        }

        // Validate when user presses Enter in the input
        input.addEventListener('keydown', (evt)=>{
          try{
            if (evt.key !== 'Enter') return;
            evt.preventDefault();
            const ans = (input.value||'').trim().toLowerCase();
            const cor = (target||'').toLowerCase();
            // accept variants: exact or simple variants
            const variants = generateVariants(cor, (document.getElementById('lang')||{value:'it'}).value || 'it').map(v=>v.toLowerCase());
            const ok = ans && (ans === cor || variants.includes(ans));
            if (ok){
              // correct: show success, disable input and reveal symbol
              input.disabled = true;
              input.style.borderColor = '#16a34a';
              input.style.background = '#dcfce7';
              msg.textContent = translateUI('exercises_feedback_correct');
              msg.style.color = '#065f46';
              if (symImgEl) {
                symImgEl.style.display='';
                try{
                  // update toggle/hint state to match revealed symbol
                  toggle.setAttribute('aria-pressed','true');
                  toggle.title = hideTitle;
                  toggle.setAttribute('aria-label', hideTitle);
                  hint.textContent = hideTitle;
                }catch(e){}
              }
              // speak the word then a short confirmation
              try{
                const v = (typeof getItalianVoice === 'function') ? getItalianVoice() : null;
                const ut1 = new SpeechSynthesisUtterance(target);
                if (v) { ut1.voice = v; try{ ut1.lang = v.lang || ut1.lang; }catch(e){} }
                ut1.rate = 1; ut1.pitch = 1;
                ut1.onend = ()=>{
                  const ut2 = new SpeechSynthesisUtterance(translateUI('exercises_feedback_correct_tts') || 'Corretto');
                  if (v) { ut2.voice = v; try{ ut2.lang = v.lang || ut2.lang; }catch(e){} }
                  window.speechSynthesis.speak(ut2);
                };
                window.speechSynthesis.speak(ut1);
              }catch(e){ console.warn('TTS feedback failed', e); }
              // Use the advance handler to mark correct and move to next (after a short delay so user sees feedback)
              try{
                const adv = makeAdvanceHandler(i, box);
                setTimeout(()=>{ try{ adv('correct'); }catch(_){ } }, 700);
              }catch(e){ /* non-critical */ }
            } else {
              // incorrect: do NOT reveal correct answer, allow retry; mark input and speak feedback
              input.style.borderColor = '#ef4444';
              input.style.background = '#fee2e2';
              msg.textContent = translateUI('exercises_feedback_try_again') || '❌ Sbagliato. Riprova.';
              msg.style.color = '#991b1b';
              // keep inputs enabled so student can try again
              try{
                const v = (typeof getItalianVoice === 'function') ? getItalianVoice() : null;
                const ut = new SpeechSynthesisUtterance(translateUI('exercises_feedback_try_again_tts') || 'Sbagliato, riprova');
                if (v) { ut.voice = v; try{ ut.lang = v.lang || ut.lang; }catch(e){} }
                window.speechSynthesis.speak(ut);
              }catch(e){ console.warn('TTS feedback failed', e); }
              // focus input for retry
              input.focus();
            }
          }catch(e){ console.error('validate failed', e); }
        });

      } else if (e.type==='speak'){
        // Speak mode: show symbol + mic button; use SpeechRecognition to capture spoken word
        const target = e.answer;
        const tile = findTileForWord(target);
        let symbolWrapper = document.createElement('div');
        symbolWrapper.classList.add('symbol-wrapper','start');
        let symImg = null;
        if (tile){
          const imgEl = tile.querySelector('img');
          if (imgEl){
            symImg = imgEl.cloneNode(true);
            symImg.classList.add('cloned-symbol-img');
          }
        }
        if (!symImg){
          symImg = document.createElement('div');
          symImg.classList.add('symbol-placeholder');
          symImg.textContent = '🔎';
        }

        const micBtn = document.createElement('button'); micBtn.className='button'; micBtn.textContent = '🎤'; micBtn.title = translateUI('exercises_modal_preview_title') || '';
        micBtn.classList.add('mic-btn');
        const status = document.createElement('div'); status.style.marginLeft='8px'; status.setAttribute('role','status'); status.setAttribute('aria-live','polite');
        symbolWrapper.appendChild(symImg);
        symbolWrapper.appendChild(micBtn);
        symbolWrapper.appendChild(status);
        box.appendChild(symbolWrapper);
        // Skip / Next button for speak exercises
        const skipSpeak = document.createElement('button');
        skipSpeak.type = 'button';
        skipSpeak.className = 'button ghost';
        skipSpeak.textContent = translateUI('exercises_button_skip') || 'Avanti/Salta';
        skipSpeak.style.marginTop = '8px';
        skipSpeak.addEventListener('click', ()=>{
          const adv = makeAdvanceHandler(i, box);
          try{ adv('skipped'); }catch(e){ }
        });
        box.appendChild(skipSpeak);

        // speech recognition
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition || null;
        if (!SpeechRec){
          status.textContent = translateUI('exercises_mic_not_supported') || 'Il riconoscimento vocale non è disponibile in questo browser.';
          status.style.color = '#6b7280';
        } else {
          let recog = null;
          let recogProcessed = false;
          micBtn.setAttribute('aria-pressed','false');
          micBtn.setAttribute('aria-label', translateUI('exercises_mic_button_start') || 'Avvia riconoscimento vocale');
          micBtn.addEventListener('click', ()=>{
            try{
              // toggle: if an active recognizer exists, stop and cleanup it
              if (recog){
                try{ recog.stop(); }catch(e){}
                try{ if (window._activeSpeechRecognizers && Array.isArray(window._activeSpeechRecognizers)){
                  const idx = window._activeSpeechRecognizers.indexOf(recog); if (idx>=0) window._activeSpeechRecognizers.splice(idx,1);
                }}catch(e){}
                recog=null; recogProcessed = false;
                micBtn.setAttribute('aria-pressed','false'); micBtn.textContent = '🎤'; micBtn.title = translateUI('exercises_mic_button_start') || 'Avvia riconoscimento vocale'; status.textContent = '' ; return;
              }
              recog = new SpeechRec();
              recogProcessed = false;
              // keep global reference for cleanup when modal closes
              window._activeSpeechRecognizers = window._activeSpeechRecognizers || [];
              window._activeSpeechRecognizers.push(recog);
              recog.lang = (document.getElementById('lang')||{value:'it'}).value || 'it-IT';
              recog.interimResults = false; recog.maxAlternatives = 1;
              status.textContent = translateUI('exercises_recognition_prompt') || 'Parla ora...'; status.style.color = '#374151';
              micBtn.setAttribute('aria-pressed','true'); micBtn.textContent = '■'; micBtn.title = translateUI('exercises_mic_button_stop') || 'Ferma riconoscimento vocale';
              // ensure onresult only processed once per start
              recog.onresult = (ev)=>{
                if (recogProcessed) return;
                recogProcessed = true;
                const t = (ev.results && ev.results[0] && ev.results[0][0]) ? ev.results[0][0].transcript : '';
                const found = (t||'').trim().toLowerCase();
                const variants = generateVariants(target, (document.getElementById('lang')||{value:'it'}).value || 'it').map(v=>v.toLowerCase());
                const ok = found && (found === target.toLowerCase() || variants.includes(found));
                if (ok){
                  status.textContent = translateUI('exercises_feedback_correct') || '✅ Corretto!'; status.style.color = '#065f46';
                  micBtn.disabled = true; micBtn.style.opacity = '0.6'; micBtn.setAttribute('aria-pressed','false'); micBtn.title = translateUI('exercises_mic_button_start') || '';
                  try{ window.speechSynthesis.cancel(); const v = (typeof getItalianVoice === 'function') ? getItalianVoice() : null; const ut = new SpeechSynthesisUtterance(target); if (v){ ut.voice = v; try{ ut.lang = v.lang || ut.lang; }catch(e){} } window.speechSynthesis.speak(ut); }catch(e){}
                  // advance after correct recognition
                  try{ const adv = makeAdvanceHandler(i, box); setTimeout(()=>{ try{ adv('correct'); }catch(_){ } }, 700); }catch(e){}
                } else {
                  status.textContent = translateUI('exercises_feedback_try_again') || '❌ Sbagliato. Riprova.'; status.style.color = '#991b1b';
                  try{ window.speechSynthesis.cancel(); const v=(typeof getItalianVoice==='function')?getItalianVoice():null; const ut=new SpeechSynthesisUtterance(translateUI('exercises_feedback_try_again_tts')||'Sbagliato, riprova'); if(v){ut.voice=v; try{ut.lang=v.lang||ut.lang}catch(e){}} window.speechSynthesis.speak(ut);}catch(e){}
                }
                // cleanup this recognizer reference
                try{ const idx = window._activeSpeechRecognizers.indexOf(recog); if(idx>=0) window._activeSpeechRecognizers.splice(idx,1); }catch(e){}
                recog = null;
                micBtn.setAttribute('aria-pressed','false'); micBtn.textContent = '🎤'; micBtn.title = translateUI('exercises_mic_button_start') || 'Avvia riconoscimento vocale';
              };
              recog.onerror = (err)=>{
                status.textContent = translateUI('exercises_recognition_no_result') || 'Nessun riconoscimento, riprova.'; status.style.color='#b91c1c';
                try{ const idx = window._activeSpeechRecognizers.indexOf(recog); if(idx>=0) window._activeSpeechRecognizers.splice(idx,1); }catch(e){}
                recog=null; recogProcessed = false; micBtn.setAttribute('aria-pressed','false'); micBtn.textContent = '🎤'; micBtn.title = translateUI('exercises_mic_button_start') || 'Avvia riconoscimento vocale';
              };
              // ensure onend also cleans up if recognition stops without onresult
              recog.onend = ()=>{
                try{ const idx = window._activeSpeechRecognizers.indexOf(recog); if(idx>=0) window._activeSpeechRecognizers.splice(idx,1); }catch(e){}
                recog=null; recogProcessed = false; micBtn.setAttribute('aria-pressed','false'); micBtn.textContent = '🎤'; micBtn.title = translateUI('exercises_mic_button_start') || 'Avvia riconoscimento vocale';
              };
              recog.start();
            }catch(e){ status.textContent = translateUI('exercises_mic_not_supported') || 'Il riconoscimento vocale non è disponibile in questo browser.'; micBtn.setAttribute('aria-pressed','false'); }
          });
        }

      } else if (e.type==='mcq'){
        // For MCQ: show the symbol only (no text). Clicking the symbol triggers TTS of the target word.
        const target = e.answer;
        const tile = findTileForWord(target);
        let symbolWrapper = document.createElement('div');
        symbolWrapper.classList.add('symbol-wrapper','center');
        let symImg = null;
        if (tile){
          const imgEl = tile.querySelector('img');
          if (imgEl){
            symImg = imgEl.cloneNode(true);
            symImg.classList.add('cloned-symbol-img');
            symImg.setAttribute('role','button');
            symImg.setAttribute('tabindex','0');
            symImg.alt = '';
            symImg.title = translateUI('exercises_modal_preview_title') || '';
            symImg.alt = '';
            symImg.setAttribute('role','button');
            symImg.setAttribute('tabindex','0');
            symImg.title = translateUI('exercises_modal_preview_title') || '';
          }
        }
        if (!symImg){
          // fallback placeholder with speaker icon
          symImg = document.createElement('div');
          symImg.classList.add('symbol-placeholder');
          symImg.textContent = '🔎';
        }

        // speak function (use SpeechSynthesis)
        function speakWord(word){
          try{
            const utter = new SpeechSynthesisUtterance(word);
            // Prefer the voice selected in settings (getItalianVoice will consult els.voiceSelect)
            const v = (typeof getItalianVoice === 'function') ? getItalianVoice() : null;
            if (v) {
              utter.voice = v;
              try { utter.lang = v.lang || utter.lang; } catch(e){}
            } else {
              const lang = (document.getElementById('lang')||{value:'it'}).value || document.documentElement.lang || 'it';
              utter.lang = (lang === 'it' ? 'it-IT' : (lang === 'es' ? 'es-ES' : 'en-GB'));
            }
            utter.rate = 1; utter.pitch = 1;
            utter.onstart = ()=> setStatusKey('speech_started');
            utter.onend = ()=> setStatusKey('speech_ended');
            utter.onerror = ()=> setStatusKey('speech_error', null, true);
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
          }catch(e){ console.warn('TTS failed', e); setStatusKey('speech_error', null, true); }
        }

        symImg.addEventListener('click', ()=>{ speakWord(target); });
        symImg.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter' || ev.key===' ') { ev.preventDefault(); speakWord(target); } });

        symbolWrapper.appendChild(symImg);
        box.appendChild(symbolWrapper);

        // choices: written words, clickable
        const ul = document.createElement('div'); ul.classList.add('ex-choices-grid');
        e.choices.forEach(c=>{
          const cbtn = document.createElement('button');
          cbtn.textContent = c;
          cbtn.className = 'button ghost';
          cbtn.style.cssText = '';
          cbtn.classList.add('choice-btn');
          cbtn.addEventListener('click', ()=>{
            // feedback element
            let fb = box.querySelector('.ex-feedback');
            if (!fb){ fb = document.createElement('div'); fb.className='ex-feedback'; fb.setAttribute('role','status'); fb.setAttribute('aria-live','polite'); box.appendChild(fb); }
            if (c === target){
              // correct: mark and disable all
              Array.from(ul.querySelectorAll('button')).forEach(b=>b.disabled=true);
              cbtn.style.background = '#16a34a'; cbtn.style.color = '#fff';
              fb.textContent = translateUI('exercises_feedback_correct') || '✅ Corretto!'; fb.style.color = '#065f46';
              try{
                const v = (typeof getItalianVoice === 'function') ? getItalianVoice() : null;
                const ut1 = new SpeechSynthesisUtterance(target);
                if (v) { ut1.voice = v; try{ ut1.lang = v.lang || ut1.lang; }catch(e){} }
                ut1.onend = ()=>{ const ut2 = new SpeechSynthesisUtterance(translateUI('exercises_feedback_correct_tts') || 'Corretto'); if (v){ ut2.voice = v; try{ ut2.lang = v.lang || ut2.lang; }catch(e){} } window.speechSynthesis.speak(ut2); };
                window.speechSynthesis.speak(ut1);
              }catch(e){ console.warn('TTS feedback failed', e); }
              // advance after correct choice
              try{ const adv = makeAdvanceHandler(i, box); setTimeout(()=>{ try{ adv('correct'); }catch(_){ } }, 700); }catch(e){}
            } else {
              // incorrect: disable only this button and prompt to try again (do not reveal correct answer)
              cbtn.disabled = true;
              cbtn.style.background = '#ef4444'; cbtn.style.color = '#fff';
              fb.textContent = translateUI('exercises_feedback_try_again') || '❌ Sbagliato. Riprova.'; fb.style.color = '#991b1b';
              try{
                const v = (typeof getItalianVoice === 'function') ? getItalianVoice() : null;
                const ut = new SpeechSynthesisUtterance(translateUI('exercises_feedback_try_again_tts') || 'Sbagliato, riprova');
                if (v) { ut.voice = v; try{ ut.lang = v.lang || ut.lang; }catch(e){} }
                window.speechSynthesis.speak(ut);
              }catch(e){ console.warn('TTS feedback failed', e); }
            }
          });
          ul.appendChild(cbtn);
        });
        box.appendChild(ul);
        // Skip / Next button for MCQ exercises
        const skipMcq = document.createElement('button');
        skipMcq.type = 'button';
        skipMcq.className = 'button ghost';
        skipMcq.textContent = translateUI('exercises_button_skip') || 'Avanti/Salta';
        skipMcq.style.marginTop = '8px';
        skipMcq.addEventListener('click', ()=>{
          const adv = makeAdvanceHandler(i, box);
          try{ adv('skipped'); }catch(e){ }
        });
        box.appendChild(skipMcq);
      }
      // create a consistent footer and move/create a Skip/Next button into it
      try{
        const footer = document.createElement('div');
        footer.style.cssText = 'display:flex;justify-content:flex-end;margin-top:8px;';
        // remove any existing skip buttons and create a fresh one to ensure consistent behavior
        const existing = Array.from(box.querySelectorAll('button')).find(b => (b.textContent||'').trim() === (translateUI('exercises_button_skip')||'Avanti/Salta'));
        if (existing && existing.parentNode) try{ existing.parentNode.removeChild(existing); }catch(_){ }
        const skipBtnNew = document.createElement('button');
        skipBtnNew.type = 'button';
        skipBtnNew.className = 'button ghost';
        skipBtnNew.textContent = translateUI('exercises_button_skip') || 'Avanti/Salta';
        skipBtnNew.style.margin = '0';
        skipBtnNew.addEventListener('click', ()=>{ const adv = makeAdvanceHandler(i, box); try{ adv('skipped'); }catch(e){} });
        footer.appendChild(skipBtnNew);
        box.appendChild(footer);
      }catch(e){ /* non-critical */ }
      exContainer.appendChild(box);
    });
  }

  let lastGenerated = [];

  if (generateBtn) generateBtn.addEventListener('click', () => {
    // Use sentences from PDF if loaded, otherwise use text from home textInput
    let text;
    let sentences;

    // Priority 1: Use sentence from sentence-box button if available
    if (window._currentExerciseSentence) {
      sentences = [window._currentExerciseSentence];
      console.log('[Genera] Using sentence from sentence-box:', sentences[0]);
    }
    // Priority 2: Use sentences from uploaded PDF
    else if (exercisesModalSentences && exercisesModalSentences.length > 0) {
      sentences = exercisesModalSentences;
      console.log('[Genera] Using sentences from PDF:', sentences.length, sentences);
    }
    // Priority 3: Use text from home page textInput
    else {
      text = (document.getElementById('textInput')||{value:''}).value || '';
      if (!text.trim()) {
        alert(translateUI('exercises_modal_no_text') || 'Inserisci del testo o carica un PDF');
        return;
      }
      // Split text by newlines to support multiple sentences
      sentences = text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
      console.log('[Genera] Using sentences from textInput:', sentences.length, sentences);
    }

    if (sentences.length === 0) {
      alert(translateUI('exercises_modal_no_text') || 'Inserisci del testo o carica un PDF');
      return;
    }

    const opts = { type: typeSel.value, count: Math.max(1, Math.min(10, parseInt(countInput.value||3,10)||3)), level: levelSel.value, skipStop: document.getElementById('skipStop') ? document.getElementById('skipStop').checked : true };

    // Generate exercises for all sentences
    lastGenerated = [];
    sentences.forEach(sentence => {
      const exercises = generateExercisesFromText(sentence, opts);
      lastGenerated.push(...exercises);
    });

    console.log('Generated exercises:', lastGenerated.length);
    renderExercisesPreview(lastGenerated);
  });

  if (exportBtn) exportBtn.addEventListener('click', ()=>{
    if (!lastGenerated || !lastGenerated.length) return alert(translateUI('exercises_no_generated') || 'Nessun esercizio generato');
    const out = { generated_at: (new Date()).toISOString(), exercises: lastGenerated };
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `exercises-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
  });

  // Function 3: Upload PDF in exercises modal to extract sentences
  const exUploadPdfBtn = document.getElementById('exModalUploadPdf');
  if (exUploadPdfBtn) {
    exUploadPdfBtn.addEventListener('click', async () => {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          try {
            // Extract text from PDF
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let text = '';

            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              const pageText = content.items.map(item => item.str).join(' ');
              text += pageText + '\n';
            }

            // Extract sentences (look for numbered sentences like "1. ", "2. " etc)
            const numberedSentences = text.match(/\d+\.\s+[^.!?]+[.!?]/g);

            if (numberedSentences && numberedSentences.length > 0) {
              // Remove numbers and clean sentences
              const sentences = numberedSentences.map(s => s.replace(/^\d+\.\s+/, '').trim());
              exercisesModalSentences = sentences; // Store for exercise generation
              console.log('[PDF Upload] Stored sentences:', sentences.length, sentences);
              setStatusKey('custom', { msg: `PDF caricato: ${sentences.length} frasi trovate. Clicca "Genera" per creare esercizi.` });
            } else {
              // Fallback: split by sentence delimiters
              const sentences = text
                .split(/[.!?]+/)
                .map(s => s.trim())
                .filter(s => s.length > 0);

              if (sentences.length > 0) {
                exercisesModalSentences = sentences.slice(0, 20); // Store for exercise generation
                console.log('[PDF Upload] Stored sentences (fallback):', sentences.length, exercisesModalSentences);
                setStatusKey('custom', { msg: `PDF caricato: ${Math.min(sentences.length, 20)} frasi estratte. Clicca "Genera" per creare esercizi.` });
              } else {
                setStatusKey('custom', { msg: 'Nessuna frase trovata nel PDF' }, true);
              }
            }

          } catch (err) {
            console.error('PDF extraction error:', err);
            setStatusKey('custom', { msg: 'Errore nell\'estrazione del PDF' }, true);
          }
        };
        input.click();
      } catch (err) {
        console.error('PDF upload error:', err);
        setStatusKey('custom', { msg: 'Errore nel caricamento del PDF' }, true);
      }
    });
  }
})();

// Funzione per aprire il modal esercizi con una singola frase (usata dai sentence-box)
function generateExercisesForSentence(text, sentenceBox) {
  if (!text || !text.trim()) {
    alert('Nessun testo da usare per gli esercizi');
    return;
  }

  // Apri il modal degli esercizi
  const modal = document.getElementById('exercisesModal');
  const modalClose = document.getElementById('exercisesModalClose');
  const exCloseBtn = document.getElementById('exModalCloseBtn');

  if (!modal) {
    console.error('Modal esercizi non trovato');
    return;
  }

  // Imposta il testo nel campo nascosto o usa una variabile globale
  window._currentExerciseSentence = text;

  // Localize modal
  try {
    const titleEl = document.getElementById('exercisesModalTitle');
    const typeLabel = document.getElementById('exModalTypeLabel');
    const levelLabel = document.getElementById('exModalLevelLabel');
    const generateBtn = document.getElementById('exModalGenerate');
    const exportBtn = document.getElementById('exModalExport');
    const previewTitle = document.getElementById('exModalPreviewTitle');

    if (titleEl) titleEl.textContent = translateUI('exercises_modal_title');
    if (typeLabel) typeLabel.textContent = translateUI('exercises_modal_type_label');
    if (levelLabel) levelLabel.textContent = translateUI('exercises_modal_level_label');
    if (generateBtn) generateBtn.textContent = translateUI('exercises_modal_generate');
    if (exportBtn) exportBtn.textContent = translateUI('exercises_modal_export_json');
    if (exCloseBtn) exCloseBtn.textContent = translateUI('exercises_modal_close');
    if (previewTitle) previewTitle.textContent = translateUI('exercises_modal_preview_title');
  } catch (e) {}

  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
}
