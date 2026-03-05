/* js/api.js – API calls (ARASAAC, OpenSymbols, GPT, translation) for Limpidi Simboli */

// ---------------------------------------------------------------------------
// 1. saveCustomImages – localStorage-based custom image save with quota management
// ---------------------------------------------------------------------------
function saveCustomImages(customImages, currentWord = null) {
    try {
      const jsonStr = JSON.stringify(customImages);
      const sizeKB = (jsonStr.length / 1024).toFixed(2);
      dbg('[Save] customSymbolImages size:', sizeKB, 'KB');
      
      localStorage.setItem('customSymbolImages', jsonStr);
      return { success: true };
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn('[Save] QuotaExceededError - localStorage is full, trying to free space...');
        
        // Calcola statistiche
        const totalWords = Object.keys(customImages).length;
        const totalImages = Object.values(customImages).reduce((sum, arr) => {
          return sum + (Array.isArray(arr) ? arr.length : 1);
        }, 0);
        
        // Strategia 1: Pulisci prima altre cache (translation, synonyms, personalSymbols duplicato) per fare spazio
        const keysToRemove = [];
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('translation_') || key.startsWith('synonyms_') || key === 'personalSymbols') {
            keysToRemove.push(key);
          }
        });
        
        if (keysToRemove.length > 0) {
          keysToRemove.forEach(k => localStorage.removeItem(k));
          dbg(`[Save] Cleared ${keysToRemove.length} cache entries to free space`);
          
          // Riprova a salvare
          try {
            localStorage.setItem('customSymbolImages', JSON.stringify(customImages));
            return {
              success: true,
              freedSpace: true,
              message: `Liberati ${keysToRemove.length} elementi di cache per fare spazio.`
            };
          } catch (retryError) {
            console.warn('[Save] Still not enough space after clearing cache');
          }
        }
        
        // Strategia 2: rimuovi immagini di ALTRE parole (non quella corrente) per fare spazio
        if (currentWord && totalWords > 1) {
          // Trova le parole con più immagini (esclusa quella corrente)
          const wordsWithImages = Object.entries(customImages)
            .filter(([word]) => word !== currentWord)
            .map(([word, imgs]) => ({
              word,
              count: Array.isArray(imgs) ? imgs.length : 1
            }))
            .sort((a, b) => b.count - a.count); // Ordina per numero decrescente
          
          if (wordsWithImages.length > 0) {
            // Rimuovi la parola con più immagini
            const wordToRemove = wordsWithImages[0].word;
            const removedCount = Array.isArray(customImages[wordToRemove]) 
              ? customImages[wordToRemove].length 
              : 1;
            delete customImages[wordToRemove];
            
            dbg(`[Save] Removed ${removedCount} image(s) from "${wordToRemove}" to free space`);
            
            // Riprova a salvare
            try {
              localStorage.setItem('customSymbolImages', JSON.stringify(customImages));
              return {
                success: true,
                freedSpace: true,
                message: `Memoria piena! Rimosse ${removedCount} immagini dalla parola "${wordToRemove}" per fare spazio alla nuova immagine.`
              };
            } catch (retryError) {
              console.error('[Save] Still not enough space after cleanup');
            }
          }
        }
        
        // Se arriviamo qui, non è stato possibile liberare spazio
        return {
          success: false,
          error: 'quota',
          message: `Memoria piena! Hai ${totalImages} immagini per ${totalWords} parole.\n\nUsa il bottone "📂 Seleziona Cartella Immagini" per salvare le immagini su disco invece che in memoria.`
        };
      }
      return {
        success: false,
        error: 'unknown',
        message: 'Errore nel salvare l\'immagine: ' + e.message
      };
    }
  }

// ---------------------------------------------------------------------------
// 2. translateItToEn – LibreTranslate IT→EN with localStorage cache
// ---------------------------------------------------------------------------
async function translateItToEn(text) {
    // Controlla cache
    const cacheKey = 'translation_it_en_' + text.toLowerCase();
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      dbg('[Translation] Using cached translation for "' + text + '":', cached);
      return cached;
    }
    
    try {
      // Usa proxy CORS per LibreTranslate
      const res = await fetch('https://corsproxy.io/?https://libretranslate.de/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, source: 'it', target: 'en', format: 'text' })
      });
      const data = await res.json();
      const translation = data.translatedText || text;
      // Salva in cache
      localStorage.setItem(cacheKey, translation);
      dbg('[Translation] Translated "' + text + '" to "' + translation + '" (cached)');
      return translation;
    } catch (e) {
      console.warn('[Translation] Error:', e);
      return text;
    }
  }

// ---------------------------------------------------------------------------
// 3. getEnglishSynonyms – GPT synonyms in English with cache
// ---------------------------------------------------------------------------
async function getEnglishSynonyms(word) {
    // Controlla cache
    const cacheKey = 'synonyms_en_' + word.toLowerCase();
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      dbg('[Synonyms EN] Using cached synonyms for "' + word + '":', parsed);
      return parsed;
    }
    
    if (!openaiApiKey) {
      console.warn('[Synonyms] No API key, returning only original word');
      return [word];
    }
    try {
      const prompt = `List 5 common synonyms for the English word "${word}". Reply ONLY with comma-separated words, no explanations. Example format: "woman, lady, female, girl, gal"`;
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiApiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 50
        })
      });
      if (!res.ok) {
        console.warn('[Synonyms] GPT request failed:', res.status);
        return [word];
      }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim() || '';
      const synonyms = text.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      const result = [word.toLowerCase(), ...synonyms];
      dbg('[Synonyms] GPT returned for "' + word + '":', result);
      // Salva in cache
      localStorage.setItem(cacheKey, JSON.stringify(result));
      return result;
    } catch (e) {
      console.error('[Synonyms] Error:', e);
      return [word];
    }
  }

// ---------------------------------------------------------------------------
// 4. getItalianSynonyms – GPT synonyms in Italian with cache
// ---------------------------------------------------------------------------
async function getItalianSynonyms(word) {
    // Controlla cache
    const cacheKey = 'synonyms_it_' + word.toLowerCase();
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      dbg('[Synonyms IT] Using cached synonyms for "' + word + '":', parsed);
      return parsed;
    }
    
    if (!openaiApiKey) {
      console.warn('[Synonyms IT] No API key, returning only original word');
      return [word];
    }
    try {
      const prompt = `Elenca 5 sinonimi comuni per la parola italiana "${word}". Rispondi SOLO con parole separate da virgole, senza spiegazioni. Esempio: "donna, signora, femmina, ragazza"`;
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiApiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 50
        })
      });
      if (!res.ok) {
        console.warn('[Synonyms IT] GPT request failed:', res.status);
        return [word];
      }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim() || '';
      const synonyms = text.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      const result = [word.toLowerCase(), ...synonyms];
      dbg('[Synonyms IT] GPT returned for "' + word + '":', result);
      // Salva in cache
      localStorage.setItem(cacheKey, JSON.stringify(result));
      return result;
    } catch (e) {
      console.error('[Synonyms IT] Error:', e);
      return [word];
    }
  }

// ---------------------------------------------------------------------------
// 5. searchOpenSymbols – OpenSymbols API v2 search with CORS proxy,
//    ARASAAC filtering, relevance filtering, deduplication
// ---------------------------------------------------------------------------
async function searchOpenSymbols(term, preTranslatedTerm = null) {
    const startTime = performance.now();
    
    // Ricerca in inglese per massima copertura
    let engTerm = preTranslatedTerm; // Usa traduzione pre-calcolata se disponibile
    if (!engTerm) {
      if (!/^[a-zA-Z0-9 ]+$/.test(term)) {
        engTerm = await translateItToEn(term);
        dbg('[OpenSymbols] Traduzione ITA->ENG:', term, '->', engTerm);
        if (!engTerm || engTerm.toLowerCase() === term.toLowerCase()) {
          setStatusKey('translate_ita_en_failed', { term: term }, true);
        }
      } else {
        engTerm = term;
      }
    } else {
      dbg('[OpenSymbols] Using pre-translated term:', engTerm);
    }
    
    dbg('[OpenSymbols] Searching for term:', engTerm);
    // Usa proxy CORS per test: corsproxy.io
    // const apiUrl = `https://www.opensymbols.org/api/v1/symbols/search?q=${encodeURIComponent(engTerm)}&limit=5`;
    // const url = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
    // Versione aggiornata: usa /api/v2/symbols e access_token se presente
    let apiUrl = `https://www.opensymbols.org/api/v2/symbols?q=${encodeURIComponent(engTerm)}`;
    if (typeof openSymbolsToken !== 'undefined' && openSymbolsToken) {
      apiUrl += `&access_token=${openSymbolsToken}`;
    }
    const url = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
    try {
      const headers = {};
      if (typeof openSymbolsToken !== 'undefined' && openSymbolsToken) {
        headers['Authorization'] = `Bearer ${openSymbolsToken}`;
      }
      dbg('[OpenSymbols] URL richiesta:', url);
      const res = await fetch(url, { headers });
      dbg('[OpenSymbols] HTTP status:', res.status);
      let rawText = '';
      try {
        rawText = await res.clone().text();
        dbg('[OpenSymbols] Risposta grezza:', rawText);
      } catch (e) {
        console.warn('[OpenSymbols] Impossibile leggere la risposta grezza:', e);
      }
      if (res.status === 401 || res.status === 403) {
        // Token mancante o non valido - non mostrare errore all'utente
        console.warn('[OpenSymbols] Token non valido o scaduto');
        return [];
      }
      if (!res.ok) {
        // Errore di rete - non mostrare errore all'utente
        console.warn('[OpenSymbols] Errore di rete:', res.status);
        return [];
      }
      let data;
      try {
        data = await res.json();
      } catch (e) {
        // Risposta non valida - non mostrare errore all'utente
        console.warn('[OpenSymbols] Risposta non valida');
        return [];
      }
      dbg('[searchOpenSymbols] Parsed JSON data:', data);
      // La risposta API v2 restituisce direttamente un array di simboli, non un oggetto con data.symbols
      const symbols = Array.isArray(data) ? data : (Array.isArray(data.symbols) ? data.symbols : []);
      dbg('[searchOpenSymbols] Total symbols from API:', symbols.length);
      if (!symbols || symbols.length === 0) {
        // Nessun simbolo trovato - non mostrare errore all'utente
        dbg('[OpenSymbols] Nessun simbolo trovato per:', engTerm);
        window.lastOpenSymbolsResult = [];
        return [];
      }
      // Filtra ARASAAC per evitare duplicati con la ricerca principale ARASAAC
      const notArasaac = symbols.filter(s => s.repo_key && s.repo_key.toLowerCase() !== 'arasaac');
      dbg('[searchOpenSymbols] After filtering ARASAAC:', notArasaac.length);
      // Ottieni sinonimi in inglese usando GPT per filtrare meglio i risultati
      const synonyms = await getEnglishSynonyms(engTerm);
      dbg('[searchOpenSymbols] Using synonyms:', synonyms);
      // Filtra falsi positivi: tieni solo simboli dove il termine cercato o un sinonimo appare nel nome
      const relevant = notArasaac.filter(s => {
        const name = (s.name || '').toLowerCase();
        // Accetta se il nome contiene il termine cercato o uno dei suoi sinonimi
        return synonyms.some(syn => name.includes(syn));
      });
      dbg('[searchOpenSymbols] After relevance filtering:', relevant.length);
      dbg('[searchOpenSymbols] Relevant symbols:', relevant.map(s => ({ name: s.name, repo: s.repo_key, relevance: s.relevance })));
      
      // Rimuovi duplicati basati su image_url (stesso simbolo con ID diversi)
      const uniqueMap = new Map();
      relevant.forEach(s => {
        const key = s.image_url || s.symbol_key || s.id;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, s);
        }
      });
      const uniqueSymbols = Array.from(uniqueMap.values());
      dbg('[searchOpenSymbols] After removing duplicates:', uniqueSymbols.length);
      
      if (uniqueSymbols.length === 0) {
  setStatusKey('opensymbols_only_arasaac', null, false);
        window.lastOpenSymbolsResult = [];
        return [];
      }
  setStatusKey('opensymbols_found_count', { n: uniqueSymbols.length }, false);
      // Aggiorna sempre la variabile globale con i risultati filtrati e deduplicati
      window.lastOpenSymbolsResult = uniqueSymbols.map(s => ({ url: s.svg, label: s.label || engTerm, repo: s.repo_key || '', image_url: s.image_url, name: s.name }));
      
      const searchTime = performance.now() - startTime;
      dbg('[searchOpenSymbols] Search complete in', searchTime.toFixed(0), 'ms - Returning:', window.lastOpenSymbolsResult.length, 'symbols');
      
      // NON chiamare showOpenSymbolsSection qui - i simboli verranno integrati nel tile principale
      return window.lastOpenSymbolsResult;
    } catch (e) {
      const searchTime = performance.now() - startTime;
      console.error('[OpenSymbols] Errore fetch after', searchTime.toFixed(0), 'ms:', e);
  setStatusKey('opensymbols_network_error', null, true);
      return [];
    }
  }

// ---------------------------------------------------------------------------
// 6. loadKeywordIndexIT – Loads ARASAAC keyword index for Italian
// ---------------------------------------------------------------------------
async function loadKeywordIndexIT(signal) {
  try {
    const r = await fetch('https://api.arasaac.org/api/keywords/it', signal ? { signal } : {});
    if (!r.ok) throw new Error('keywords fetch failed');
    const data = await r.json();
    /*
      L'API /keywords/it può restituire due formati:
      - { words: [...] } con l'elenco di tutte le parole e locuzioni usate su ARASAAC
      - [ { keyword: string, pictograms: [...] }, ... ] con l'associazione parola → id pittogrammi
      Popoliamo sia keywordIndex (se disponibile) sia keywordEntries (sempre).
    */
    if (Array.isArray(data)) {
      // Formato associativo
      for (const row of data) {
        const k = (row?.keyword || row?.name || '').toLowerCase().trim();
        if (!k) continue;
        keywordEntries.add(k);
        const ids = new Set();
        const pics = Array.isArray(row?.pictograms) ? row.pictograms : Array.isArray(row) ? row : [];
        for (const p of pics) {
          const id = (p && (p._id ?? p.id)) ?? null;
          if (id != null) ids.add(id);
        }
        if (ids.size) keywordIndex.set(k, ids);
      }
      keywordIndexReady = true;
    } else if (data && Array.isArray(data.words)) {
      // Solo elenco di parole/locuzioni
      for (const w of data.words) {
        const k = (typeof w === 'string' ? w : (w?.keyword || '')).toLowerCase().trim();
        if (k) keywordEntries.add(k);
      }
      // In questo caso non riempiamo keywordIndex, ma impostiamo la flag ready
      keywordIndexReady = true;
    } else {
      // Formato sconosciuto: imposta ready = false
      keywordIndexReady = false;
    }
  } catch (e) {
    console.warn('Impossibile caricare le keywords ARASAAC:', e);
    keywordIndexReady = false;
  }
}

// ---------------------------------------------------------------------------
// 7. getKeywordCandidatesIT – Searches the keyword index for candidates
// ---------------------------------------------------------------------------
function getKeywordCandidatesIT(term) {
  const w = (term || '').toLowerCase().trim();
  const out = new Set();

  // 1) match esatto
  if (keywordIndex.has(w)) for (const id of keywordIndex.get(w)) out.add(id);

  // 2) singolarizzazione semplice (ore->ora; libri->libro; case->casa)
  const singulars = depluralizeItalian(w); // usa la funzione che ti ho dato in precedenza
  for (const s of singulars) {
    if (keywordIndex.has(s)) for (const id of keywordIndex.get(s)) out.add(id);
  }

  // 3) startsWith (evita rumori: imponi lunghezza minima)
  if (w.length >= 3) {
    for (const [k, ids] of keywordIndex.entries()) {
      if (k.startsWith(w)) ids.forEach(id => out.add(id));
    }
  }

  // 4) match interno su parole separate: se w è contenuto come parola
  // indipendente all'interno di una locuzione (k contiene spazi). In questo modo
  // evitiamo corrispondenze spurie come "tante" → "disinfettante".
  if (w.length >= 4) {
    for (const [k, ids] of keywordIndex.entries()) {
      // consideriamo solo locuzioni composte (due o più parole)
      if (k.includes(' ')) {
        const words = k.split(/\s+/);
        if (words.includes(w)) ids.forEach(id => out.add(id));
      }
    }
  }

  return [...out];
}

// ---------------------------------------------------------------------------
// 8. fetchPictoDetail – Fetches pictogram detail from ARASAAC
// ---------------------------------------------------------------------------
async function fetchPictoDetail(lang, id, signal) {
  const key = `${lang}|${id}`;
  if (pictoDetailCache.has(key)) return pictoDetailCache.get(key);

  try {
    const url = `${API_ROOT}/${lang}/${id}`;
    const r = await fetch(url, signal ? { signal } : {});
    if (!r.ok) throw new Error('detail fetch failed');
    const data = await r.json();

    const kw = Array.isArray(data.keywords) ? data.keywords : [];
    const keywordsLower = kw
      .map(k => (typeof k === 'string' ? k : (k?.keyword || '')))
      .filter(Boolean)
      .map(s => s.toLowerCase());

    const detail = { keywordsLower };
    pictoDetailCache.set(key, detail);
    return detail;
  } catch {
    const fallback = { keywordsLower: [] };
    pictoDetailCache.set(key, fallback);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// 9. scoreWithKeywords – Scores a pictogram's relevance
// ---------------------------------------------------------------------------
function scoreWithKeywords(detail, term, lang) {
  const kws = detail.keywordsLower || [];
  const t = term.toLowerCase();
  let s = 0;

  if (kws.includes(t)) s += 100;
  if (kws.some(k => k.startsWith(t))) s += 20;
  if (kws.some(k => k.includes(t))) s += 5;

  if (lang === 'it' && t === 'ora') {
    if (kws.includes('orologio')) s += 40;
    if (kws.includes('tempo')) s += 30;
  }
  return s;
}

// ---------------------------------------------------------------------------
// 10. queryFirstId – Gets first matching ARASAAC ID
// ---------------------------------------------------------------------------
async function queryFirstId(lang, term, signal){
      const key = `${lang}|${term}`;
      if(cache.has(key)) return cache.get(key);
      async function hit(url){
        const r = await fetch(url, signal?{signal}:{})
        if(!r.ok) return null;
        const data = await r.json();
        if(Array.isArray(data) && data.length){ return data[0]?._id ?? null; }
        return null;
      }
      let id = await hit(`${API_ROOT}/${lang}/search/${encodeURIComponent(term)}`);
      if(!id) id = await hit(`${API_ROOT}/${lang}/bestsearch/${encodeURIComponent(term)}`);
      if(!id){
        const variants = generateItalianVariants(term);
        for(const v of variants){
          id = await hit(`${API_ROOT}/${lang}/search/${encodeURIComponent(v)}`);
          if(!id) id = await hit(`${API_ROOT}/${lang}/bestsearch/${encodeURIComponent(v)}`);
          if(id) break;
        }
      }
      cache.set(key, id||null);
      return id||null;
    }

// ---------------------------------------------------------------------------
// 11. searchForIds – Multi-URL ARASAAC search with scoring
// ---------------------------------------------------------------------------
async function searchForIds(lang, term, signal) {
  const urls = [
    `${API_ROOT}/${lang}/search/${encodeURIComponent(term)}`,
    `${API_ROOT}/${lang}/bestsearch/${encodeURIComponent(term)}`
  ];

  const pool = new Set();
  for (const url of urls) {
    try {
      const r = await fetch(url, signal ? { signal } : {});
      if (!r.ok) continue;
      const data = await r.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item && item._id) pool.add(item._id);
          if (pool.size >= 25) break;
        }
      }
    } catch {}
    if (pool.size >= 25) break;
  }
  if (pool.size === 0) return [];

  const candidates = await Promise.all(
    [...pool].map(async (id) => {
      const detail = await fetchPictoDetail(lang, id, signal);
      const score = scoreWithKeywords(detail, term, lang);
      return { id, score };
    })
  );
  // Filtra i candidati con un punteggio significativo. Vogliamo evitare
  // pittogrammi che corrispondono solo per sottostringa (score 5) e
  // considerare solo corrispondenze esatte o iniziali (score >= 20).
  const filtered = candidates.filter(c => c.score >= 20);
  if (filtered.length === 0) return [];

  return filtered
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(c => c.id);
}

// ---------------------------------------------------------------------------
// 12. queryIds – Main 3-phase parallel search (ARASAAC + synonyms + OpenSymbols)
// ---------------------------------------------------------------------------
async function queryIds(lang, term, signal) {
  dbg('[queryIds] Called with term:', JSON.stringify(term));
  // Pulisci il termine da punteggiatura e converti in lowercase
  const t = sanitizeWord(term || '');
  dbg('[queryIds] After sanitizeWord:', JSON.stringify(t));
  if (!t) return { ids: [], openSymbols: [] }; // Se il termine è vuoto dopo la pulizia, restituisci vuoto
  const startTime = performance.now();

  // FASE 1: Ricerche parallele iniziali (italiano base + traduzione + sinonimi)
  const [italianBaseIds, engTerm, italianSynonyms] = await Promise.all([
    // Ricerca italiana base
    (async () => {
      let ids = [];
      if (t.includes(' ')) {
        if (lang === 'it' && keywordIndexReady && keywordIndex.has(t)) {
          ids = Array.from(keywordIndex.get(t)).slice(0, 5);
        } else {
          ids = await searchForIds(lang, term, signal).catch(() => []);
        }
      } else if (lang === 'it' && keywordIndexReady) {
        const fromIndex = getKeywordCandidatesIT(t);
        if (fromIndex.length) {
          ids = fromIndex.slice(0, 5);
        }
      }
      if (!ids.length) {
        ids = await searchForIds(lang, term, signal).catch(() => []);
        if (!ids.length) {
          const variants = generateVariants(term, lang);
          for (const v of variants) {
            if (v.toLowerCase() === t) continue;
            ids = await searchForIds(lang, v, signal);
            if (ids.length) break;
          }
        }
      }
      return ids;
    })(),
    // Traduzione in inglese
    translateItToEn(term),
    // Sinonimi italiani
    getItalianSynonyms(term)
  ]);

  dbg('[queryIds] Phase 1 complete - Italian base:', italianBaseIds.length, 'English term:', engTerm, 'Italian synonyms:', italianSynonyms);

  // FASE 2: Ricerche parallele con sinonimi (italiano + inglese)
  const arasaacIds = [...italianBaseIds];
  const idsSet = new Set(arasaacIds); // Per deduplicazione veloce
  
  // Prepara tutte le ricerche da fare in parallelo
  const searches = [];
  
  // Sinonimi italiani (escluso termine originale già cercato)
  italianSynonyms.forEach(syn => {
    if (syn !== t) {
      searches.push({ lang: 'it', term: syn });
    }
  });
  
  // Sinonimi inglesi (se traduzione disponibile)
  let englishSynonyms = [];
  if (engTerm && engTerm.toLowerCase() !== term.toLowerCase()) {
    englishSynonyms = await getEnglishSynonyms(engTerm);
    englishSynonyms.forEach(syn => {
      searches.push({ lang: 'en', term: syn });
    });
  }
  
  dbg('[queryIds] Phase 2 - Searching', searches.length, 'synonyms in parallel');
  
  // Esegui tutte le ricerche in parallelo (max 10 alla volta per evitare rate limit)
  const batchSize = 10;
  for (let i = 0; i < searches.length; i += batchSize) {
    const batch = searches.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(({ lang, term }) => searchForIds(lang, term, signal).catch(() => []))
    );
    
    // Aggiungi ID non duplicati
    results.forEach(ids => {
      ids.forEach(id => {
        if (!idsSet.has(id) && arasaacIds.length < 20) {
          arasaacIds.push(id);
          idsSet.add(id);
        }
      });
    });
  }

  const arasaacTime = performance.now() - startTime;
  dbg('[queryIds] ARASAAC search complete:', arasaacIds.length, 'IDs in', arasaacTime.toFixed(0), 'ms');

  // FASE 3: OpenSymbols (usa la stessa traduzione già ottenuta)
  dbg('[queryIds] Searching OpenSymbols with pre-translated term:', engTerm);
  const openSymbols = await searchOpenSymbols(term, engTerm); // Passa traduzione esistente
  
  const totalTime = performance.now() - startTime;
  dbg('[queryIds] Total search time:', totalTime.toFixed(0), 'ms - ARASAAC:', arasaacIds.length, 'OpenSymbols:', openSymbols.length);

  return { arasaacIds, openSymbols };
}

// ---------------------------------------------------------------------------
// 13. openExplanationsDB – Opens IndexedDB for explanation caching
// ---------------------------------------------------------------------------
async function openExplanationsDB() {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open('explanations-cache', 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('explanations')) {
            db.createObjectStore('explanations');
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }

// ---------------------------------------------------------------------------
// 14. getCachedExplanation – Reads cached explanation
// ---------------------------------------------------------------------------
async function getCachedExplanation(text, lang, isPhrase) {
      try {
        const db = await openExplanationsDB();
        const tx = db.transaction('explanations', 'readonly');
        const store = tx.objectStore('explanations');
        const key = `${lang}:${isPhrase ? 'phrase' : 'word'}:${text.toLowerCase().trim()}`;
        
        return new Promise((resolve, reject) => {
          const req = store.get(key);
          req.onsuccess = () => {
            const cached = req.result;
            if (cached && cached.timestamp) {
              // Cache valida per 30 giorni
              const age = Date.now() - cached.timestamp;
              const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 giorni
              if (age < maxAge) {
                dbg('[Explain Cache] Hit:', key);
                resolve(cached.data);
              } else {
                dbg('[Explain Cache] Expired:', key);
                resolve(null);
              }
            } else {
              dbg('[Explain Cache] Miss:', key);
              resolve(null);
            }
          };
          req.onerror = () => resolve(null); // Ignora errori cache
        });
      } catch (e) {
        console.warn('[Explain Cache] Error reading:', e);
        return null;
      }
    }

// ---------------------------------------------------------------------------
// 15. cacheExplanation – Writes explanation to cache
// ---------------------------------------------------------------------------
async function cacheExplanation(text, lang, isPhrase, data) {
      try {
        const db = await openExplanationsDB();
        const tx = db.transaction('explanations', 'readwrite');
        const store = tx.objectStore('explanations');
        const key = `${lang}:${isPhrase ? 'phrase' : 'word'}:${text.toLowerCase().trim()}`;
        
        store.put({
          data: data,
          timestamp: Date.now()
        }, key);
        
        dbg('[Explain Cache] Saved:', key);
      } catch (e) {
        console.warn('[Explain Cache] Error writing:', e);
      }
    }

// ---------------------------------------------------------------------------
// 16. explainTerm – GPT explanation with IDB cache
// ---------------------------------------------------------------------------
async function explainTerm(text, lang = 'it', isPhrase = false, forceRefresh = false) {
      if (!openaiApiKey) {
        throw new Error('Chiave API OpenAI non configurata. Salvala nelle impostazioni.');
      }
      
      // Controlla cache se non è richiesto un refresh forzato
      if (!forceRefresh) {
        const cached = await getCachedExplanation(text, lang, isPhrase);
        if (cached) {
          return cached;
        }
      }
      
      try {
        let prompt;
        if (isPhrase) {
          // Prompt per spiegare una frase completa
          prompt = `Spiega in modo molto semplice il significato di questa frase italiana usando solo parole comuni e comprensibili da un bambino o da una persona con difficoltà cognitive.\n\nFrase: "${text}"\n\nFornisci:\n1. Una spiegazione semplice della frase (2-3 frasi massimo)\n2. Un esempio pratico di quando si usa questa frase\n\nRispondi in formato:\nSPIEGAZIONE: [la tua spiegazione]\nESEMPIO: [esempio pratico]`;
        } else {
          // Prompt per spiegare una singola parola
          prompt = `Spiega in modo molto semplice il significato della parola italiana "${text}" usando solo parole comuni e comprensibili da un bambino o da una persona con difficoltà cognitive.\n\nFornisci:\n1. Una breve spiegazione (1-2 frasi)\n2. Fino a 3 sinonimi più semplici e comuni (se esistono)\n\nRispondi in formato:\nSPIEGAZIONE: [la tua spiegazione]\nSINONIMI: [sinonimo1, sinonimo2, sinonimo3] (oppure "nessun sinonimo comune" se non ci sono alternative più semplici)`;
        }

        const body = {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Sei un assistente educativo che spiega parole e frasi in modo molto semplice, usando un linguaggio adatto a bambini o persone con difficoltà cognitive. Usa sempre parole comuni e fai esempi concreti.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 250,
          temperature: 0.3
        };
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(`Errore GPT ${res.status}: ${errorData.error?.message || 'Errore sconosciuto'}`);
        }
        
        const data = await res.json();
        const answer = data.choices?.[0]?.message?.content;
        
        if (!answer) {
          throw new Error('Risposta GPT vuota o non valida');
        }
        
        // Parse della risposta
        const lines = answer.split('\n').map(l => l.trim()).filter(Boolean);
        let explanation = '';
        let synonyms = [];
        let example = '';
        
        for (const line of lines) {
          if (line.startsWith('SPIEGAZIONE:')) {
            explanation = line.replace('SPIEGAZIONE:', '').trim();
          } else if (line.startsWith('SINONIMI:')) {
            const synText = line.replace('SINONIMI:', '').trim();
            if (!synText.toLowerCase().includes('nessun')) {
              synonyms = synText.split(',').map(s => s.trim()).filter(Boolean);
            }
          } else if (line.startsWith('ESEMPIO:')) {
            example = line.replace('ESEMPIO:', '').trim();
          }
        }
        
        // Se non ha trovato i marcatori, usa tutta la risposta come spiegazione
        if (!explanation) {
          explanation = answer.trim();
        }
        
        const result = {
          explanation: explanation || 'Spiegazione non disponibile',
          synonyms: synonyms,
          example: example
        };
        
        // Salva in cache
        await cacheExplanation(text, lang, isPhrase, result);
        
        return result;
        
      } catch (e) {
        console.error('[explainTerm] Errore:', e);
        throw e;
      }
    }

// ---------------------------------------------------------------------------
// 17. analyzeSentence – GPT sentence analysis for lemma/pronoun/tense extraction
// ---------------------------------------------------------------------------
async function analyzeSentence(text, lang) {
      if (!openaiApiKey) return null;
      // Per ora supportiamo solo l'analisi avanzata in italiano
      if (lang !== 'it') return null;
      try {
        /*
         Costruiamo un prompt dettagliato. Chiediamo di fornire, per ogni parola della frase,
         i suoi componenti semantici in formato chiave:valore.
         Chiediamo 'lemma:null' per le parole funzionali.
         Aggiungiamo inoltre la richiesta di fornire dei sinonimi utili per trovare i pittogrammi.
        */
        const prompt =
  'Per ciascuna parola della seguente frase italiana restituisci i suoi componenti semantici in formato `chiave:valore`, separati da `|`. ' +
  'Le chiavi possibili sono: `lemma`, `pronome_soggetto`, `pronome_oggetto`, `genere`, `numero`, `tempo`, `sinonimi`. ' +
  'OBBLIGATORIO: per ogni SOSTANTIVO e AGGETTIVO indica sempre `genere` (maschile/femminile o sconosciuto) e `numero` (singolare/plurale). ' +
  'OBBLIGATORIO: se una parola è al plurale, restituisci sempre il lemma al singolare.'+
  'OBBLIGATORIO: se una parola è un verbo, restituisci sempre al forma al infinito.'+
  'Se non è determinabile dal contesto, stima in base alla morfologia; se resta ambiguo, usa `genere:sconosciuto` ma indica comunque `numero`. ' +
  "Se la parola è un articolo, preposizione o congiunzione (parola funzionale), restituisci `lemma:null`. " +
  "Esempio 1: 'bambina' -> `lemma:bambina|genere:femminile|numero:singolare` " +
  "Esempio 2: 'felice' (riferito a singolare) -> `lemma:felice|genere:sconosciuto|numero:singolare` " +
  "Esempio 3: 'belle' -> `lemma:bello|genere:femminile|numero:plurale` " +
  "Esempio 4: 'Mangio' -> `lemma:mangiare|pronome_soggetto:io|numero:singolare` " +
  'Inoltre, per ogni lemma non nullo, includi un campo `sinonimi` con uno o due sinonimi italiani separati da punto e virgola che possano aiutare a trovare un pittogramma appropriato. Usa `sinonimi:null` se non ci sono sinonimi adatti. ' +
  'Scegli `pronome_soggetto` in base alla concordanza di numero e genere con eventuali aggettivi o sostantivi. Ad esempio, se la forma verbale "sono" è seguita da un aggettivo femminile plurale (come "curiose"), il pronome soggetto corretto è "loro" e non "io". ' +
  'Rispondi con una riga (una sola riga) per ciascuna parola della frase, senza utilizzare virgole per separare le righe. Ogni riga deve contenere i campi di una sola parola. Usa il carattere di ritorno a capo (\n) per passare alla parola successiva.\n' +
  'Frase: ' + text;


        const body = {
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'Sei un assistente che restituisce componenti semantici per parole italiane in formato chiave:valore.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 350,
          temperature: 0.0
        };
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('HTTP error ' + res.status);
        const data = await res.json();
        const answer = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (!answer) return null;

        // Esegui il parsing della risposta strutturata
        // Risposta attesa: "lemma:mangiare|pronome_soggetto:io, lemma:null, ..."
        const wordAnalyses = answer
          .split(/\n+/) // ogni riga corrisponde a una parola
          .map(s => s.trim())
          .filter(Boolean);

        const structuredGroups = wordAnalyses.map(analysisString => {
          const parts = analysisString.split('|');
          const analysis = {};
          parts.forEach(part => {
            const kv = part.split(':');
            if (kv.length === 2) {
              const key = kv[0].trim().toLowerCase().replace(/`/g, '');
              const value = kv[1].trim().toLowerCase().replace(/`/g, '');
              
              // Gestisci sinonimi: una lista separata da punto e virgola
              if (key === 'sinonimi') {
                  if (value && value !== 'null') {
                      analysis.sinonimi = value.split(';').map(s => s.trim()).filter(Boolean);
                  }
                  return;
              }
              // Semplifichiamo le chiavi per coerenza
              if (key === 'pronome_soggetto' || key === 'pronome_oggetto') {
                  analysis['pronome'] = value; // Unifichiamo i pronomi
              } else {
                  analysis[key] = value;
              }
            }
          });
          return analysis;
        });

        return structuredGroups.length ? structuredGroups : null;
        
      } catch (e) {
        console.error('analisi GPT fallita', e);
        return null;
      }
    }

// ---------------------------------------------------------------------------
// 18. detectTense – Heuristic tense detection for IT/ES/EN
// ---------------------------------------------------------------------------
function detectTense(term, lang){
      const w = term.toLowerCase();
      if(lang==='it'){
        if(/(er|ir)(ò|ai|à|emo|ete|anno)$/.test(w)) return 'future';
        const futIr = ['sarò','sarai','sarà','saremo','sarete','saranno','avrò','avrai','avrà','avremo','avrete','avranno','andrò','andrai','andrà','andremo','andrete','andranno','farò','farai','farà','faremo','farete','faranno','potrò','potrai','potrà','potremo','potrete','potranno','vorrò','vorrai','vorrà','vorremo','vorrete','vorranno','dovrò','dovrai','dovrà','dovremo','dovrete','dovranno','berrò','berrai','berrà','berremo','berrete','berranno','verrò','verrai','verrà','verremo','verrete','verranno','terrò','terrai','terrà','terremo','terrete','terranno','porrò','porrai','porrà','porremo','porrete','porranno','trarrò','trarrai','trarrà','trarremo','trarrete','trarranno'];
        if(futIr.includes(w)) return 'future';
        if(/(at|ut|it)[oaie]$/.test(w)) return 'past';
        const imp = ['avo','avi','ava','avamo','avate','avano','evo','evi','eva','evamo','evate','avano','ivo','ivi','iva','ivamo','ivate','ivano'];
        if(imp.some(s=>w.endsWith(s))) return 'past';
        const rem = ['ai','asti','ò','ammo','aste','arono','ei','esti','é','emmo','este','erono','etti','ette','ettero','ii','isti','ì','immo','iste','irono'];
        if(rem.some(s=>w.endsWith(s))) return 'past';
        return null;
      }
      if(lang==='es'){
        if(/(é|ás|á|emos|éis|án)$/.test(w)) return 'future';
        if(/(é|aste|ó|amos|asteis|aron|í|iste|ió|imos|isteis|ieron)$/.test(w)) return 'past';
        return null;
      }
      if(lang==='en'){
        if(/^will\b/.test(w)) return 'future';
        if(/ed$/.test(w)) return 'past';
        return null;
      }
      return null;
    }

// ---------------------------------------------------------------------------
// 19. getTenseBadge – Gets emoji and text for a tense badge
// ---------------------------------------------------------------------------
async function getTenseBadge(tense){
      const lang = els.lang.value || 'it';
      const text = TENSE_WORDS[lang][tense];
      const emoji = BADGE_SYMBOLS[tense];
      return { emoji, text };
    }

// ---------------------------------------------------------------------------
// 20. generateArasaacStyleImages – DALL-E 3 image generation
// ---------------------------------------------------------------------------
async function generateArasaacStyleImages(prompt, count = 1) {
  if (!openaiApiKey) {
    throw new Error('Chiave API OpenAI non impostata. Salvala usando il campo in alto.');
  }
  
  dbg('[GPT Image] Generating', count, 'images for prompt:', prompt);
  
  // Prompt per stile illustrazione da libro per bambini
  const fullPrompt = `Create a simple, colorful children's book illustration for: ${prompt}.

STYLE REQUIREMENTS:
- COLORFUL: Bright, cheerful colors that appeal to children
- SIMPLE: Clear and easy to understand, no details
- Colori piatti - solidi, senza sfumature o ombre
- Stile cartoon semplice - come Tintin, Asterix
- CHILDREN'S BOOK STYLE: Like illustrations from picture books for young children
- FRIENDLY AND WARM: Appealing, gentle, inviting style
- CLEAN LINES: Simple outlines, not too detailed
- WHITE BACKGROUND: Clean white background
- CENTERED: Main subject centered in the image
- NO TEXT: No words or labels

Style should be like a simple, happy illustration from a children's storybook.`;

  
  const images = [];
  
  // DALL-E 3 genera 1 sola immagine per chiamata, quindi facciamo N chiamate
  for (let i = 0; i < count; i++) {
    try {
      dbg(`[GPT Image] Generating image ${i + 1}/${count}...`);
      
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: fullPrompt,
          n: 1, // DALL-E 3 supporta solo n=1
          size: '1024x1024', // DALL-E 3: 1024x1024, 1792x1024, o 1024x1792
          quality: 'standard', // 'standard' o 'hd'
          response_format: 'b64_json' // b64_json evita problemi CORS
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`DALL-E API error ${res.status}: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await res.json();
      
      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        throw new Error('Risposta non valida da DALL-E: nessuna immagine generata');
      }
      
      // Estrai URL dell'immagine
      // Con b64_json la risposta contiene direttamente il base64
      const b64Data = data.data[0].b64_json;
      
      if (!b64Data) {
        throw new Error('Immagine base64 non presente nella risposta');
      }
      
      const base64Image = `data:image/png;base64,${b64Data}`;
      dbg(`[GPT Image] Image ${i + 1}/${count} received (${base64Image.length} chars)`);
      images.push(base64Image);
      
    } catch (err) {
      console.error(`[GPT Image] Error generating image ${i + 1}:`, err);
      // Continua con le altre immagini anche se una fallisce
    }
  }
  
  if (images.length === 0) {
    throw new Error('Nessuna immagine generata con successo');
  }
  
  dbg('[GPT Image] Total images generated:', images.length);
  return images;
}
