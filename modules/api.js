/**
 * API Module
 * 
 * Gestisce tutte le chiamate API esterne:
 * - ARASAAC
 * - OpenSymbols
 * - OpenAI (GPT, DALL-E)
 * - LibreTranslate
 * - Google Custom Search
 * - Wikipedia
 */

import state from './state.js';
import { getCachedTranslation, cacheTranslation, getCachedSynonyms, cacheSynonyms } from './storage.js';

// ==================== ARASAAC ====================

export const API_ROOT = 'https://api.arasaac.org/api/pictograms';
export const STATIC_ROOT = 'https://static.arasaac.org/pictograms';

/**
 * Cerca pittogrammi ARASAAC per termine
 * @param {string} lang - Lingua
 * @param {string} term - Termine di ricerca
 * @param {AbortSignal} signal - Segnale per annullamento
 * @returns {Promise<number[]>} Array di ID pittogrammi
 */
export async function searchForIds(lang, term, signal) {
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
  
  return [...pool].slice(0, 5);
}

/**
 * Ottieni dettagli pittogramma ARASAAC
 * @param {string} lang - Lingua
 * @param {number} id - ID pittogramma
 * @param {AbortSignal} signal - Segnale per annullamento
 * @returns {Promise<Object>} Dettagli con keywords
 */
export async function fetchPictoDetail(lang, id, signal) {
  const key = `${lang}|${id}`;
  if (state.cache.pictogramDetails.has(key)) {
    return state.cache.pictogramDetails.get(key);
  }

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
    state.cache.pictogramDetails.set(key, detail);
    return detail;
  } catch {
    const fallback = { keywordsLower: [] };
    state.cache.pictogramDetails.set(key, fallback);
    return fallback;
  }
}

/**
 * Carica indice keywords ARASAAC per italiano
 * @param {AbortSignal} signal - Segnale per annullamento
 */
export async function loadKeywordIndexIT(signal) {
  try {
    const r = await fetch('https://api.arasaac.org/api/keywords/it', signal ? { signal } : {});
    if (!r.ok) throw new Error('keywords fetch failed');
    const data = await r.json();
    
    if (Array.isArray(data)) {
      for (const row of data) {
        const k = (row?.keyword || row?.name || '').toLowerCase().trim();
        if (!k) continue;
        state.cache.keywordEntries.add(k);
        const ids = new Set();
        const pics = Array.isArray(row?.pictograms) ? row.pictograms : [];
        for (const p of pics) {
          const id = (p && (p._id ?? p.id)) ?? null;
          if (id != null) ids.add(id);
        }
        if (ids.size) state.cache.keywordIndex.set(k, ids);
      }
      state.cache.keywordIndexReady = true;
    } else if (data && Array.isArray(data.words)) {
      for (const w of data.words) {
        const k = (typeof w === 'string' ? w : (w?.keyword || '')).toLowerCase().trim();
        if (k) state.cache.keywordEntries.add(k);
      }
      state.cache.keywordIndexReady = true;
    }
  } catch (e) {
    console.warn('[API] Impossibile caricare keywords ARASAAC:', e);
    state.cache.keywordIndexReady = false;
  }
}

// ==================== OpenSymbols ====================

/**
 * Cerca simboli su OpenSymbols
 * @param {string} term - Termine di ricerca
 * @param {string} preTranslatedTerm - Termine già tradotto in inglese (opzionale)
 * @returns {Promise<Object[]>} Array di simboli
 */
export async function searchOpenSymbols(term, preTranslatedTerm = null) {
  let engTerm = preTranslatedTerm;
  if (!engTerm && !/^[a-zA-Z0-9 ]+$/.test(term)) {
    engTerm = await translateItToEn(term);
  } else if (!engTerm) {
    engTerm = term;
  }
  
  let apiUrl = `https://www.opensymbols.org/api/v2/symbols?q=${encodeURIComponent(engTerm)}`;
  if (state.api.openSymbols) {
    apiUrl += `&access_token=${state.api.openSymbols}`;
  }
  const url = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
  
  try {
    const res = await fetch(url);
    if (res.status === 401 || res.status === 403) {
      console.warn('[API OpenSymbols] Token mancante o non valido');
      return [];
    }
    if (!res.ok) return [];
    
    const data = await res.json();
    const symbols = Array.isArray(data) ? data : (Array.isArray(data.symbols) ? data.symbols : []);
    
    // Filtra ARASAAC per evitare duplicati
    const notArasaac = symbols.filter(s => s.repo_key && s.repo_key.toLowerCase() !== 'arasaac');
    
    // Ottieni sinonimi per filtrare risultati
    const synonyms = await getEnglishSynonyms(engTerm);
    const relevant = notArasaac.filter(s => {
      const name = (s.name || '').toLowerCase();
      return synonyms.some(syn => name.includes(syn));
    });
    
    // Rimuovi duplicati
    const uniqueMap = new Map();
    relevant.forEach(s => {
      const key = s.image_url || s.symbol_key || s.id;
      if (!uniqueMap.has(key)) uniqueMap.set(key, s);
    });
    
    return Array.from(uniqueMap.values()).map(s => ({
      url: s.svg,
      label: s.label || engTerm,
      repo: s.repo_key || '',
      image_url: s.image_url,
      name: s.name
    }));
  } catch (e) {
    console.error('[API OpenSymbols] Errore:', e);
    return [];
  }
}

// ==================== Traduzione ====================

/**
 * Traduci testo italiano → inglese
 * @param {string} text - Testo da tradurre
 * @returns {Promise<string>} Testo tradotto
 */
export async function translateItToEn(text) {
  const cached = getCachedTranslation(text, 'it', 'en');
  if (cached) {
    console.log('[API Translate] Cache hit:', text, '→', cached);
    return cached;
  }
  
  try {
    const res = await fetch('https://corsproxy.io/?https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: 'it', target: 'en', format: 'text' })
    });
    const data = await res.json();
    const translation = data.translatedText || text;
    cacheTranslation(text, translation, 'it', 'en');
    console.log('[API Translate]', text, '→', translation);
    return translation;
  } catch (e) {
    console.warn('[API Translate] Errore:', e);
    return text;
  }
}

// ==================== OpenAI ====================

/**
 * Ottieni sinonimi inglesi con GPT
 * @param {string} word - Parola
 * @returns {Promise<string[]>} Array di sinonimi
 */
export async function getEnglishSynonyms(word) {
  const cached = getCachedSynonyms(word, 'en');
  if (cached) return cached;
  
  if (!state.api.openai) return [word];
  
  try {
    const prompt = `List 5 common synonyms for the English word "${word}". Reply ONLY with comma-separated words, no explanations. Example format: "woman, lady, female, girl, gal"`;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.api.openai}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 50
      })
    });
    
    if (!res.ok) return [word];
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    const synonyms = text.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const result = [word.toLowerCase(), ...synonyms];
    cacheSynonyms(word, result, 'en');
    return result;
  } catch (e) {
    console.error('[API GPT] Errore sinonimi EN:', e);
    return [word];
  }
}

/**
 * Ottieni sinonimi italiani con GPT
 * @param {string} word - Parola
 * @returns {Promise<string[]>} Array di sinonimi
 */
export async function getItalianSynonyms(word) {
  const cached = getCachedSynonyms(word, 'it');
  if (cached) return cached;
  
  if (!state.api.openai) return [word];
  
  try {
    const prompt = `Elenca 5 sinonimi comuni per la parola italiana "${word}". Rispondi SOLO con parole separate da virgole, senza spiegazioni. Esempio: "donna, signora, femmina, ragazza"`;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.api.openai}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 50
      })
    });
    
    if (!res.ok) return [word];
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    const synonyms = text.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const result = [word.toLowerCase(), ...synonyms];
    cacheSynonyms(word, result, 'it');
    return result;
  } catch (e) {
    console.error('[API GPT] Errore sinonimi IT:', e);
    return [word];
  }
}

/**
 * Analisi frase con GPT
 * @param {string} text - Frase da analizzare
 * @param {string} lang - Lingua
 * @returns {Promise<Object[]|null>} Array di analisi o null
 */
export async function analyzeSentence(text, lang) {
  if (!state.api.openai || lang !== 'it') return null;
  
  try {
    const prompt = `Per ciascuna parola della seguente frase italiana restituisci i suoi componenti semantici in formato \`chiave:valore\`, separati da \`|\`. Le chiavi possibili sono: \`lemma\`, \`pronome_soggetto\`, \`pronome_oggetto\`, \`genere\`, \`numero\`, \`tempo\`, \`sinonimi\`. OBBLIGATORIO: per ogni SOSTANTIVO e AGGETTIVO indica sempre \`genere\` (maschile/femminile o sconosciuto) e \`numero\` (singolare/plurale). OBBLIGATORIO: se una parola è al plurale, restituisci sempre il lemma al singolare. OBBLIGATORIO: se una parola è un verbo, restituisci sempre la forma all'infinito. Se non è determinabile dal contesto, stima in base alla morfologia. Se la parola è un articolo, preposizione o congiunzione (parola funzionale), restituisci \`lemma:null\`. Inoltre, per ogni lemma non nullo, includi un campo \`sinonimi\` con uno o due sinonimi italiani separati da punto e virgola. Usa \`sinonimi:null\` se non ci sono sinonimi adatti. Scegli \`pronome_soggetto\` in base alla concordanza. Rispondi con una riga per parola, separata da ritorno a capo (\\n).\nFrase: ${text}`;

    const body = {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Sei un assistente che restituisce componenti semantici per parole italiane.' },
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
        'Authorization': `Bearer ${state.api.openai}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error('HTTP error ' + res.status);
    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content;
    if (!answer) return null;

    const wordAnalyses = answer.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const structuredGroups = wordAnalyses.map(analysisString => {
      const parts = analysisString.split('|');
      const analysis = {};
      parts.forEach(part => {
        const kv = part.split(':');
        if (kv.length === 2) {
          const key = kv[0].trim().toLowerCase().replace(/`/g, '');
          const value = kv[1].trim().toLowerCase().replace(/`/g, '');
          
          if (key === 'sinonimi') {
            if (value && value !== 'null') {
              analysis.sinonimi = value.split(';').map(s => s.trim()).filter(Boolean);
            }
            return;
          }
          if (key === 'pronome_soggetto' || key === 'pronome_oggetto') {
            analysis['pronome'] = value;
          } else {
            analysis[key] = value;
          }
        }
      });
      return analysis;
    });

    return structuredGroups.length ? structuredGroups : null;
  } catch (e) {
    console.error('[API GPT] Analisi frase fallita:', e);
    return null;
  }
}

/**
 * Genera immagini con DALL-E 3
 * @param {string} prompt - Prompt per generazione
 * @param {number} count - Numero di immagini (default 1)
 * @returns {Promise<string[]>} Array di data URLs
 */
export async function generateArasaacStyleImages(prompt, count = 1) {
  if (!state.api.openai) {
    throw new Error('Chiave API OpenAI non impostata');
  }
  
  const fullPrompt = `Create a simple, colorful children's book illustration for: ${prompt}.\n\nSTYLE REQUIREMENTS:\n- COLORFUL: Bright, cheerful colors\n- SIMPLE: Clear and easy to understand\n- Colori piatti - solidi, senza sfumature\n- Stile cartoon semplice\n- CHILDREN'S BOOK STYLE\n- FRIENDLY AND WARM\n- CLEAN LINES: Simple outlines\n- WHITE BACKGROUND\n- CENTERED\n- NO TEXT`;

  const images = [];
  
  for (let i = 0; i < count; i++) {
    try {
      console.log(`[API DALL-E] Generating image ${i + 1}/${count}...`);
      
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.api.openai}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: fullPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          response_format: 'b64_json'
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`DALL-E error ${res.status}: ${errorData.error?.message || 'Unknown'}`);
      }
      
      const data = await res.json();
      const b64Data = data.data[0].b64_json;
      if (!b64Data) throw new Error('Immagine base64 non presente');
      
      images.push(`data:image/png;base64,${b64Data}`);
    } catch (err) {
      console.error(`[API DALL-E] Error image ${i + 1}:`, err);
    }
  }
  
  if (images.length === 0) {
    throw new Error('Nessuna immagine generata');
  }
  
  return images;
}

// ==================== Google Custom Search ====================

/**
 * Cerca immagini con Google Custom Search
 * @param {string} query - Query di ricerca
 * @returns {Promise<Object[]>} Array di risultati immagini
 */
export async function searchGoogleImages(query) {
  if (!state.api.google.apiKey || !state.api.google.cx) {
    throw new Error('Credenziali Google mancanti');
  }
  
  const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${state.api.google.apiKey}&cx=${state.api.google.cx}&q=${encodeURIComponent(query)}&searchType=image&num=10&imgSize=medium&safe=active`;
  
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    const errorData = await response.json();
    if (response.status === 429) {
      throw new Error('Limite giornaliero raggiunto (100 ricerche/giorno)');
    }
    throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.items || data.items.length === 0) {
    return [];
  }
  
  return data.items.map(item => ({
    thumbnail: item.image.thumbnailLink,
    full: item.link,
    title: item.title,
    context: item.displayLink
  }));
}

/**
 * Cerca immagini su Wikipedia
 * @param {string} query - Query di ricerca
 * @returns {Promise<Object[]>} Array di risultati immagini
 */
export async function searchWikipediaImages(query) {
  const wikiUrl = `https://it.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=20&prop=pageimages|images&piprop=thumbnail&pithumbsize=300&pilimit=20`;
  
  const response = await fetch(wikiUrl);
  if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  
  const data = await response.json();
  if (!data.query || !data.query.pages) return [];
  
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
  
  return images;
}

// Export default
export default {
  API_ROOT,
  STATIC_ROOT,
  searchForIds,
  fetchPictoDetail,
  loadKeywordIndexIT,
  searchOpenSymbols,
  translateItToEn,
  getEnglishSynonyms,
  getItalianSynonyms,
  analyzeSentence,
  generateArasaacStyleImages,
  searchGoogleImages,
  searchWikipediaImages
};
