/**
 * Linguistics Module
 * 
 * Contiene tutte le funzioni per l'analisi linguistica:
 * - Tokenizzazione
 * - Sanitizzazione
 * - Generazione varianti morfologiche
 * - Rilevamento tempo verbale
 * - Gestione pronomi e genere
 */

// ==================== COSTANTI ====================

// Parole funzionali da ignorare (stopwords)
export const STOP_WORDS = {
  it: new Set([
    'il','lo','la','i','gli','le','un','uno','una','del','della','dei','degli','delle',
    'di','a','da','in','con','su','per','tra','fra','al','allo','alla','ai','agli','alle',
    'dal','dallo','dalla','dai','dagli','dalle','nel','nello','nella','nei','negli','nelle',
    'col','coi','sul','sullo','sulla','sui','sugli','sulle','e','ed','o','oppure','ma',
    'anche','che','se','come','più','meno','non','mi','ti','si','ci','vi','gli','ne','dei',
    'ho','hai','ha','abbiamo','avete','hanno'
  ]),
  es: new Set([
    'el','la','los','las','un','una','unos','unas','de','a','en','con','por','para',
    'del','al','y','o','pero','como','más','menos','no','me','te','se','nos','os','le','les'
  ]),
  en: new Set([
    'the','a','an','of','to','in','on','at','for','with','by','from','as','is','was',
    'are','be','been','have','has','had','do','does','did','will','would','can','could',
    'may','might','must','shall','should','and','or','but','not','no'
  ])
};

// Mappa forme irregolari presente → infinito
export const IRREGULAR_PRESENT_TO_INF = {
  it: {
    'ho': 'avere', 'hai': 'avere', 'ha': 'avere',
    'abbiamo': 'avere', 'avete': 'avere', 'hanno': 'avere',
    'sono': 'essere', 'sei': 'essere', 'è': 'essere',
    'siamo': 'essere', 'siete': 'essere'
  },
  es: {},
  en: {}
};

// Pronomi per lingua
export const PRONOUNS = {
  it: new Set([
    'io','tu','lui','lei','noi','voi','loro',
    'me','te','mi','ti','si','ci','vi','ne','gli','le','li','la','lo'
  ]),
  es: new Set([
    'yo','tú','él','ella','nosotros','nosotras','vosotros','vosotras','ellos','ellas',
    'me','te','se','nos','os','lo','la','los','las','le','les'
  ]),
  en: new Set([
    'i','you','he','she','it','we','they','me','him','her','us','them',
    'my','your','his','hers','our','their'
  ])
};

// Mappatura pronomi oggetto a pronomi completi (IT)
export const OBJECT_PRONOUN_MAP = {
  lo: { base: 'lui', gender: 'maschile', number: 'singolare' },
  la: { base: 'lei', gender: 'femminile', number: 'singolare' },
  li: { base: 'loro', gender: 'maschile', number: 'plurale' },
  le: { base: 'loro', gender: 'femminile', number: 'plurale' }
};

// Mappatura per ricerca simboli (pronomi che hanno varianti)
export const PRONOUN_SEARCH_MAP = {
  it: {
    me: 'io', mi: 'io', te: 'tu', ti: 'tu',
    ci: 'noi', vi: 'voi', lui: 'lui', lei: 'lei',
    lo: 'lui', la: 'lei', li: 'loro', le: 'loro',
    loro: 'loro', noi: 'noi', voi: 'voi', tu: 'tu', io: 'io'
  },
  es: {},
  en: {}
};

// Marcatori grammaticali
export const GENDER_MARKERS = {
  it: new Set(['femmina','femminile','maschio','maschile']),
  es: new Set(['femenino','femenina','masculino','masculina']),
  en: new Set(['female','male','feminine','masculine'])
};

export const NUMBER_MARKERS = {
  it: new Set(['singolare','plurale']),
  es: new Set(['singular','plural']),
  en: new Set(['singular','plural'])
};

// Sinonimi locali per termini comuni (IT)
export const LOCAL_SYNONYMS_IT = {
  'tante': ['molte','numerose'],
  'tanti': ['molti','numerosi'],
  'tanta': ['molta','numerosa'],
  'tanto': ['molto','numeroso'],
  'poche': ['poche','poco'],
  'poca': ['poca','pochi'],
  'poco': ['pochi','poca'],
  'pochi': ['poco','poche'],
  'ragazze': ['bambine','giovani'],
  'ragazzi': ['bambini','giovani']
};

// ==================== TOKENIZZAZIONE ====================

/**
 * Tokenizza il testo in parole
 * @param {string} text - Testo da tokenizzare
 * @returns {string[]} Array di token
 */
export function tokenize(text) {
  return text
    .replace(/\u00A0/g, ' ')  // Sostituisci spazi non-breaking
    .split(/\s+/)              // Split su spazi
    .map(t => t.replace(/['']/g, "'"))  // Normalizza apostrofi
    .filter(Boolean);          // Rimuovi stringhe vuote
}

/**
 * Pulisce una parola da punteggiatura e articoli con apostrofo
 * @param {string} word - Parola da pulire
 * @returns {string} Parola pulita
 */
export function sanitizeWord(word) {
  if (!word) return '';
  
  // Prima gestisci gli articoli con apostrofo (l', un', dell', ecc.)
  let cleaned = word.replace(/^(l|un|dell|all|nell|sull|dall|c|d|n|s|t|v|m|qu)['']/i, '');
  
  // Poi rimuovi la punteggiatura rimanente
  cleaned = cleaned.toLowerCase()
    .replace(/[.,;:!?"'()\[\]{}<>]/g, '')
    .trim();
  
  return cleaned;
}

// ==================== VARIANTI MORFOLOGICHE ====================

/**
 * Genera varianti morfologiche italiane di una parola
 * @param {string} term - Termine di partenza
 * @returns {string[]} Array di varianti
 */
export function generateItalianVariants(term) {
  const out = new Set();
  const add = v => { if(v && v.length > 1) out.add(v); };
  add(term);

  const lower = term.toLowerCase();

  // Verbi irregolari al presente
  const irregularInf = IRREGULAR_PRESENT_TO_INF.it[lower];
  if (irregularInf) add(irregularInf);

  // Verbi irregolari al futuro
  const irregularFutureMap = {
    'fare': ['farò','farai','farà','faremo','farete','faranno'],
    'essere': ['sarò','sarai','sarà','saremo','sarete','saranno'],
    'avere': ['avrò','avrai','avrà','avremo','avrete','avranno'],
    'andare': ['andrò','andrai','andrà','andremo','andrete','andranno'],
    'potere': ['potrò','potrai','potrà','potremo','potrete','potranno'],
    'volere': ['vorrò','vorrai','vorrà','vorremo','vorrete','vorranno'],
    'dovere': ['dovrò','dovrai','dovrà','dovremo','dovrete','dovranno'],
    'bere': ['berrò','berrai','berrà','berremo','berrete','berranno'],
    'venire': ['verrò','verrai','verrà','verremo','verrete','verranno'],
    'tenere': ['terrò','terrai','terrà','terremo','terrete','terranno'],
    'porre': ['porrò','porrai','porrà','porremo','porrete','porranno'],
    'trarre': ['trarrò','trarrai','trarrà','trarremo','trarrete','trarranno']
  };
  for (const [inf, forms] of Object.entries(irregularFutureMap)) {
    if (forms.includes(term)) {
      add(inf);
      break;
    }
  }

  // Rimozione clitici
  const clitics = '(la|lo|li|le|mi|ti|si|ci|vi|ne|gli|le)';
  const infEnd = '(are|ere|ire)';
  if (new RegExp(`${infEnd}si$`).test(term)) add(term.replace(/si$/, ''));
  if (new RegExp(`${infEnd}${clitics}$`).test(term)) {
    add(term.replace(new RegExp(`${clitics}$`), ''));
  }

  // Participi passati
  const part = /(at|it|ut)[oaie]$/;
  if (part.test(term)) {
    const stem = term.replace(/(at|it|ut)[oaie]$/, '');
    ['are','ere','ire'].forEach(inf => add(stem + inf));
  }

  // Gerundi
  if (/ando$/.test(term)) add(term.replace(/ando$/, 'are'));
  if (/endo$/.test(term)) {
    add(term.replace(/endo$/, 'ere'));
    add(term.replace(/endo$/, 'ire'));
  }

  // Presente indicativo
  const presentSets = [
    { ends: ['o','i','a','iamo','ate','ano'], infs: ['are'] },
    { ends: ['o','i','e','iamo','ete','ono'], infs: ['ere'] },
    { ends: ['o','i','e','iamo','ite','ono'], infs: ['ire'] }
  ];
  for (const set of presentSets) {
    for (const suf of set.ends) {
      if (term.endsWith(suf) && term.length > (suf.length + 1)) {
        const root = term.slice(0, -suf.length);
        set.infs.forEach(inf => add(root + inf));
      }
    }
  }

  // Verbi in -isco
  [['isco','ire'],['isci','ire'],['isce','ire'],['iscono','ire']].forEach(([suf, inf]) => {
    if (term.endsWith(suf)) add(term.slice(0, -suf.length) + inf);
  });

  // Imperfetto
  const imp = [
    ['avo','are'],['avi','are'],['ava','are'],['avamo','are'],['avate','are'],['avano','are'],
    ['evo','ere'],['evi','ere'],['eva','ere'],['evamo','ere'],['evate','ere'],['evano','ere'],
    ['ivo','ire'],['ivi','ire'],['iva','ire'],['ivamo','ire'],['ivate','ire'],['ivano','ire']
  ];
  for (const [suf, inf] of imp) {
    if (term.endsWith(suf) && term.length > (suf.length + 1)) {
      add(term.slice(0, -suf.length) + inf);
    }
  }

  // Futuro
  const futEnd = ['ò','ai','à','emo','ete','anno'];
  for (const fe of futEnd) {
    if (term.endsWith('er' + fe)) {
      const b = term.slice(0, -(2 + fe.length));
      add(b + 'are');
      add(b + 'ere');
      if (/g$/.test(b) || /c$/.test(b)) add(b + 'iare');
      if (/ch$/.test(b) || /gh$/.test(b)) {
        const root = b.slice(0, -1);
        add(root + 'are');
      }
    }
    if (term.endsWith('ir' + fe)) {
      const b = term.slice(0, -(2 + fe.length));
      add(b + 'ire');
    }
  }

  // Passato remoto
  const remoto = [
    ['ai','are'],['asti','are'],['ò','are'],['ammo','are'],['aste','are'],['arono','are'],
    ['ei','ere'],['esti','ere'],['é','ere'],['emmo','ere'],['este','ere'],['erono','ere'],
    ['etti','ere'],['ette','ere'],['ettero','ere'],
    ['ii','ire'],['isti','ire'],['ì','ire'],['immo','ire'],['iste','ire'],['irono','ire']
  ];
  for (const [suf, inf] of remoto) {
    if (term.endsWith(suf) && term.length > (suf.length + 1)) {
      add(term.slice(0, -suf.length) + inf);
    }
  }

  // Avverbi in -mente
  if (/mente$/.test(term) && term.length > 6) {
    add(term.replace(/mente$/, 'o'));
    add(term.replace(/mente$/, 'a'));
  }

  // Varianti di genere per aggettivi
  if (/a$/.test(lower)) {
    const masculine = lower.slice(0, -1) + 'o';
    add(masculine);
  }

  // Participio "stato"
  if (['stato','stata','stati','state'].includes(lower)) {
    add('stare');
    add('essere');
  }

  return [...out];
}

/**
 * Genera varianti morfologiche spagnole
 * @param {string} term - Termine di partenza
 * @returns {string[]} Array di varianti
 */
export function generateSpanishVariants(term) {
  const out = new Set();
  const add = v => { if (v && v.length > 1) out.add(v); };
  add(term);
  const w = term.toLowerCase();

  // Rimozione clitici
  ['me','te','se','nos','os','lo','la','los','las','le','les'].forEach(pro => {
    if (w.endsWith(pro) && w.length > pro.length + 1) {
      add(w.slice(0, -pro.length));
    }
  });

  // Participi passati
  ['ado','ada','ados','adas','ido','ida','idos','idas'].forEach(suf => {
    if (w.endsWith(suf) && w.length > suf.length + 1) {
      const root = w.slice(0, -suf.length);
      ['ar','er','ir'].forEach(inf => add(root + inf));
    }
  });

  // Gerundi
  if (w.endsWith('ando') && w.length > 4) {
    add(w.slice(0, -4) + 'ar');
  }
  if (w.endsWith('iendo') && w.length > 5) {
    const root = w.slice(0, -5);
    ['er','ir'].forEach(inf => add(root + inf));
  }
  if (w.endsWith('yendo') && w.length > 5) {
    const root = w.slice(0, -5);
    ['er','ir'].forEach(inf => add(root + inf));
  }

  // Presente indicativo
  const pres = [
    { ends: ['o','as','a','amos','áis','an'], infs: ['ar'] },
    { ends: ['o','es','e','emos','éis','en'], infs: ['er','ir'] },
    { ends: ['o','es','e','imos','ís','en'], infs: ['ir'] }
  ];
  pres.forEach(set => {
    set.ends.forEach(suf => {
      if (w.endsWith(suf) && w.length > suf.length + 1) {
        const root = w.slice(0, -suf.length);
        set.infs.forEach(inf => add(root + inf));
      }
    });
  });

  // Imperfetto e altri tempi (versione semplificata)
  const tenses = [
    ['aba','ar'], ['abas','ar'], ['ábamos','ar'], ['abais','ar'], ['aban','ar'],
    ['ía','er'], ['ías','er'], ['íamos','er'], ['íais','er'], ['ían','er'],
    ['ía','ir'], ['ías','ir'], ['íamos','ir'], ['íais','ir'], ['ían','ir'],
    ['é','ar'], ['aste','ar'], ['ó','ar'], ['amos','ar'], ['asteis','ar'], ['aron','ar'],
    ['í','er'], ['iste','er'], ['ió','er'], ['imos','er'], ['isteis','er'], ['ieron','er'],
    ['í','ir'], ['iste','ir'], ['ió','ir'], ['imos','ir'], ['isteis','ir'], ['ieron','ir'],
    ['aré','ar'], ['arás','ar'], ['ará','ar'], ['aremos','ar'], ['aréis','ar'], ['arán','ar'],
    ['eré','er'], ['erás','er'], ['erá','er'], ['eremos','er'], ['eréis','er'], ['erán','er'],
    ['iré','ir'], ['irás','ir'], ['irá','ir'], ['iremos','ir'], ['iréis','ir'], ['irán','ir']
  ];
  tenses.forEach(([suf, inf]) => {
    if (w.endsWith(suf) && w.length > suf.length + 1) {
      add(w.slice(0, -suf.length) + inf);
    }
  });

  // Avverbi in -mente
  if (w.endsWith('mente') && w.length > 6) {
    const stem = w.slice(0, -5);
    add(stem + 'o');
    add(stem + 'a');
  }

  return [...out];
}

/**
 * Genera varianti morfologiche inglesi
 * @param {string} term - Termine di partenza
 * @returns {string[]} Array di varianti
 */
export function generateEnglishVariants(term) {
  const out = new Set();
  const add = v => { if (v && v.length > 1) out.add(v); };
  const w = term.toLowerCase();
  add(w);

  // Plurali
  if (w.endsWith('ies') && w.length > 3) add(w.slice(0, -3) + 'y');
  if (w.endsWith('es') && w.length > 2) add(w.slice(0, -2));
  if (w.endsWith('s') && w.length > 1) add(w.slice(0, -1));

  // Participi passati
  if (w.endsWith('ied') && w.length > 3) add(w.slice(0, -3) + 'y');
  if (w.endsWith('ed') && w.length > 2) {
    let root = w.slice(0, -2);
    add(root);
    if (root.length > 1 && root[root.length - 1] === root[root.length - 2]) {
      add(root.slice(0, -1));
    }
  }

  // Forme in -ing
  if (w.endsWith('ing') && w.length > 3) {
    let root = w.slice(0, -3);
    add(root);
    if (root.length > 1 && root[root.length - 1] === root[root.length - 2]) {
      add(root.slice(0, -1));
    }
    if (root.endsWith('ie')) add(root.slice(0, -2) + 'y');
  }

  // Comparativi/superlativi
  if (w.endsWith('er') && w.length > 2) {
    let root = w.slice(0, -2);
    add(root);
    if (root.length > 1 && root[root.length - 1] === root[root.length - 2]) {
      add(root.slice(0, -1));
    }
    if (root.endsWith('i')) add(root.slice(0, -1) + 'y');
  }
  if (w.endsWith('est') && w.length > 3) {
    let root = w.slice(0, -3);
    add(root);
    if (root.length > 1 && root[root.length - 1] === root[root.length - 2]) {
      add(root.slice(0, -1));
    }
    if (root.endsWith('i')) add(root.slice(0, -1) + 'y');
  }

  // Avverbi in -ly
  if (w.endsWith('ly') && w.length > 2) add(w.slice(0, -2));

  // Possessivi con apostrofo
  if (w.endsWith("'s")) add(w.slice(0, -2));

  return [...out];
}

/**
 * Genera varianti morfologiche in base alla lingua
 * @param {string} term - Termine di partenza
 * @param {string} lang - Codice lingua ('it', 'es', 'en')
 * @returns {string[]} Array di varianti
 */
export function generateVariants(term, lang) {
  if (lang === 'it') return generateItalianVariants(term);
  if (lang === 'es') return generateSpanishVariants(term);
  if (lang === 'en') return generateEnglishVariants(term);
  return [term];
}

// ==================== PLURALIZZAZIONE ====================

/**
 * Genera possibili singolari di un sostantivo italiano
 * @param {string} word - Parola al plurale
 * @returns {string[]} Array di possibili singolari
 */
export function depluralizeItalian(word) {
  const w = (word || '').toLowerCase().trim();
  const results = new Set();
  if (!w) return [];
  
  results.add(w); // Aggiungi sempre la forma originale
  
  // Plurali in 'i' (libri → libro, libra)
  if (w.endsWith('i') && w.length > 1) {
    const root = w.slice(0, -1);
    results.add(root + 'o');
    results.add(root + 'a');
  }
  
  // Plurali in 'e' (case → casa, caso)
  if (w.endsWith('e') && w.length > 1) {
    const root = w.slice(0, -1);
    results.add(root + 'a');
    results.add(root + 'o');
  }
  
  return [...results];
}

// ==================== TEMPO VERBALE ====================

/**
 * Rileva il tempo verbale di una parola
 * @param {string} term - Parola da analizzare
 * @param {string} lang - Codice lingua
 * @returns {string|null} 'past', 'future', 'present' o null
 */
export function detectTense(term, lang) {
  const w = term.toLowerCase();
  
  if (lang === 'it') {
    // Futuro
    if (/(er|ir)(ò|ai|à|emo|ete|anno)$/.test(w)) return 'future';
    const futIr = [
      'sarò','sarai','sarà','saremo','sarete','saranno',
      'avrò','avrai','avrà','avremo','avrete','avranno',
      'andrò','andrai','andrà','andremo','andrete','andranno',
      'farò','farai','farà','faremo','farete','faranno',
      'potrò','potrai','potrà','potremo','potrete','potranno',
      'vorrò','vorrai','vorrà','vorremo','vorrete','vorranno',
      'dovrò','dovrai','dovrà','dovremo','dovrete','dovranno',
      'berrò','berrai','berrà','berremo','berrete','berranno',
      'verrò','verrai','verrà','verremo','verrete','verranno',
      'terrò','terrai','terrà','terremo','terrete','terranno',
      'porrò','porrai','porrà','porremo','porrete','porranno',
      'trarrò','trarrai','trarrà','trarremo','trarrete','trarranno'
    ];
    if (futIr.includes(w)) return 'future';
    
    // Passato
    if (/(at|ut|it)[oaie]$/.test(w)) return 'past';
    const imp = ['avo','avi','ava','avamo','avate','avano','evo','evi','eva','evamo','evate','evano','ivo','ivi','iva','ivamo','ivate','ivano'];
    if (imp.some(s => w.endsWith(s))) return 'past';
    const rem = ['ai','asti','ò','ammo','aste','arono','ei','esti','é','emmo','este','erono','etti','ette','ettero','ii','isti','ì','immo','iste','irono'];
    if (rem.some(s => w.endsWith(s))) return 'past';
    
    return null;
  }
  
  if (lang === 'es') {
    if (/(é|ás|á|emos|éis|án)$/.test(w)) return 'future';
    if (/(é|aste|ó|amos|asteis|aron|í|iste|ió|imos|isteis|ieron)$/.test(w)) return 'past';
    return null;
  }
  
  if (lang === 'en') {
    if (/^will\b/.test(w)) return 'future';
    if (/ed$/.test(w)) return 'past';
    return null;
  }
  
  return null;
}

// Export default
export default {
  STOP_WORDS,
  IRREGULAR_PRESENT_TO_INF,
  PRONOUNS,
  OBJECT_PRONOUN_MAP,
  PRONOUN_SEARCH_MAP,
  GENDER_MARKERS,
  NUMBER_MARKERS,
  LOCAL_SYNONYMS_IT,
  tokenize,
  sanitizeWord,
  generateVariants,
  generateItalianVariants,
  generateSpanishVariants,
  generateEnglishVariants,
  depluralizeItalian,
  detectTense
};
