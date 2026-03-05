/* js/variants.js – Linguistic variant generators for Limpidi Simboli */

function generateItalianVariants(term) {
  const out = new Set();
  const add = v => { if (v && v.length > 1) out.add(v); };
  add(term);
  const lower = term.toLowerCase();

  const irregularInf = IRREGULAR_PRESENT_LEMMA_MAP[lower];
  if (irregularInf) add(irregularInf);

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
    'trarre': ['trarrò','trarrai','trarrà','trarremo','trarrete','trarranno'],
  };
  for (const [inf, forms] of Object.entries(irregularFutureMap)) {
    if (forms.includes(term)) { add(inf); break; }
  }

  const clitics = '(la|lo|li|le|mi|ti|si|ci|vi|ne|gli|le)';
  const infEnd = '(are|ere|ire)';
  if (new RegExp(`${infEnd}si$`).test(term)) add(term.replace(/si$/, ''));
  if (new RegExp(`${infEnd}${clitics}$`).test(term)) add(term.replace(new RegExp(`${clitics}$`), ''));

  const part = /(at|it|ut)[oaie]$/;
  if (part.test(term)) {
    const stem = term.replace(/(at|it|ut)[oaie]$/, '');
    ['are', 'ere', 'ire'].forEach(inf => add(stem + inf));
  }
  if (/ando$/.test(term)) add(term.replace(/ando$/, 'are'));
  if (/endo$/.test(term)) { add(term.replace(/endo$/, 'ere')); add(term.replace(/endo$/, 'ire')); }

  const presentSets = [
    { ends: ['o', 'i', 'a', 'iamo', 'ate', 'ano'], infs: ['are'] },
    { ends: ['o', 'i', 'e', 'iamo', 'ete', 'ono'], infs: ['ere'] },
    { ends: ['o', 'i', 'e', 'iamo', 'ite', 'ono'], infs: ['ire'] },
  ];
  for (const set of presentSets) {
    for (const suf of set.ends) {
      if (term.endsWith(suf) && term.length > (suf.length + 1)) {
        const root = term.slice(0, -suf.length);
        set.infs.forEach(inf => add(root + inf));
      }
    }
  }
  [['isco', 'ire'], ['isci', 'ire'], ['isce', 'ire'], ['iscono', 'ire']].forEach(([suf, inf]) => {
    if (term.endsWith(suf)) add(term.slice(0, -suf.length) + inf);
  });

  const imp = [['avo','are'],['avi','are'],['ava','are'],['avamo','are'],['avate','are'],['avano','are'],['evo','ere'],['evi','ere'],['eva','ere'],['evamo','ere'],['evate','ere'],['evano','ere'],['ivo','ire'],['ivi','ire'],['iva','ire'],['ivamo','ire'],['ivate','ire'],['ivano','ire']];
  for (const [suf, inf] of imp) {
    if (term.endsWith(suf) && term.length > (suf.length + 1)) add(term.slice(0, -suf.length) + inf);
  }

  const futEnd = ['ò', 'ai', 'à', 'emo', 'ete', 'anno'];
  for (const fe of futEnd) {
    if (term.endsWith('er' + fe)) {
      const b = term.slice(0, -(2 + fe.length));
      add(b + 'are'); add(b + 'ere');
      if (/g$/.test(b) || /c$/.test(b)) add(b + 'iare');
      if (/ch$/.test(b) || /gh$/.test(b)) { const root = b.slice(0, -1); add(root + 'are'); }
    }
    if (term.endsWith('ir' + fe)) {
      const b = term.slice(0, -(2 + fe.length));
      add(b + 'ire');
    }
  }

  const remoto = [['ai','are'],['asti','are'],['ò','are'],['ammo','are'],['aste','are'],['arono','are'],['ei','ere'],['esti','ere'],['é','ere'],['emmo','ere'],['este','ere'],['erono','ere'],['etti','ere'],['ette','ere'],['ettero','ere'],['ii','ire'],['isti','ire'],['ì','ire'],['immo','ire'],['iste','ire'],['irono','ire']];
  for (const [suf, inf] of remoto) {
    if (term.endsWith(suf) && term.length > (suf.length + 1)) add(term.slice(0, -suf.length) + inf);
  }
  if (/mente$/.test(term) && term.length > 6) { add(term.replace(/mente$/, 'o')); add(term.replace(/mente$/, 'a')); }
  if (/a$/.test(lower)) { add(lower.slice(0, -1) + 'o'); }
  if (['stato', 'stata', 'stati', 'state'].includes(lower)) { add('stare'); add('essere'); }
  return [...out];
}

function generateSpanishVariants(term) {
  const out = new Set();
  const add = v => { if (v && v.length > 1) out.add(v); };
  add(term);
  const w = term.toLowerCase();
  // Rimozione di pronomi clitici alla fine (me, te, se, nos, os, lo, la, los, las, le, les)
  ['me','te','se','nos','os','lo','la','los','las','le','les'].forEach(pro => {
    if (w.endsWith(pro) && w.length > pro.length + 1) {
      add(w.slice(0, -pro.length));
    }
  });
  // Participi passati (-ado, -ada, -ados, -adas, -ido, -ida, -idos, -idas)
  ['ado','ada','ados','adas','ido','ida','idos','idas'].forEach(suf => {
    if (w.endsWith(suf) && w.length > suf.length + 1) {
      const root = w.slice(0, -suf.length);
      ['ar','er','ir'].forEach(inf => add(root + inf));
    }
  });
  // Gerundi (-ando, -iendo, -yendo)
  if (w.endsWith('ando') && w.length > 4) {
    const root = w.slice(0, -4);
    add(root + 'ar');
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
    { ends: ['o','es','e','imos','ís','en'], infs: ['ir'] },
  ];
  pres.forEach(set => {
    set.ends.forEach(suf => {
      if (w.endsWith(suf) && w.length > suf.length + 1) {
        const root = w.slice(0, -suf.length);
        set.infs.forEach(inf => add(root + inf));
      }
    });
  });
  // Imperfecto (-aba, -abas, -ábamos, -abais, -aban, -ía, -ías, -íamos, -íais, -ían)
  [
    ['aba','ar'], ['abas','ar'], ['ábamos','ar'], ['abais','ar'], ['aban','ar'],
    ['ía','er'], ['ías','er'], ['íamos','er'], ['íais','er'], ['ían','er'],
    ['ía','ir'], ['ías','ir'], ['íamos','ir'], ['íais','ir'], ['ían','ir'],
  ].forEach(([suf, inf]) => {
    if (w.endsWith(suf) && w.length > suf.length + 1) {
      const root = w.slice(0, -suf.length);
      add(root + inf);
    }
  });
  // Pretérito perfecto simple
  [
    ['é','ar'], ['aste','ar'], ['ó','ar'], ['amos','ar'], ['asteis','ar'], ['aron','ar'],
    ['í','er'], ['iste','er'], ['ió','er'], ['imos','er'], ['isteis','er'], ['ieron','er'],
    ['í','ir'], ['iste','ir'], ['ió','ir'], ['imos','ir'], ['isteis','ir'], ['ieron','ir'],
  ].forEach(([suf, inf]) => {
    if (w.endsWith(suf) && w.length > suf.length + 1) {
      const root = w.slice(0, -suf.length);
      add(root + inf);
    }
  });
  // Futuro (-aré, -arás, -ará, -aremos, -aréis, -arán, -eré, -erás, ..., -irán)
  [
    ['aré','ar'], ['arás','ar'], ['ará','ar'], ['aremos','ar'], ['aréis','ar'], ['arán','ar'],
    ['eré','er'], ['erás','er'], ['erá','er'], ['eremos','er'], ['eréis','er'], ['erán','er'],
    ['iré','ir'], ['irás','ir'], ['irá','ir'], ['iremos','ir'], ['iréis','ir'], ['irán','ir'],
  ].forEach(([suf, inf]) => {
    if (w.endsWith(suf) && w.length > suf.length + 1) {
      const root = w.slice(0, -suf.length);
      add(root + inf);
    }
  });
  // Avverbi in -mente: trasformali in forma maschile o femminile dell'aggettivo
  if (w.endsWith('mente') && w.length > 6) {
    const stem = w.slice(0, -5);
    add(stem + 'o');
    add(stem + 'a');
  }
  return [...out];
}

function generateEnglishVariants(term) {
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
    if (root.length > 1 && root[root.length - 1] === root[root.length - 2]) add(root.slice(0, -1));
  }
  // Forme in -ing
  if (w.endsWith('ing') && w.length > 3) {
    let root = w.slice(0, -3);
    add(root);
    if (root.length > 1 && root[root.length - 1] === root[root.length - 2]) add(root.slice(0, -1));
    if (root.endsWith('ie')) add(root.slice(0, -2) + 'y');
  }
  // Comparativi/superlativi
  if (w.endsWith('er') && w.length > 2) {
    let root = w.slice(0, -2);
    add(root);
    if (root.length > 1 && root[root.length - 1] === root[root.length - 2]) add(root.slice(0, -1));
    if (root.endsWith('i')) add(root.slice(0, -1) + 'y');
  }
  if (w.endsWith('est') && w.length > 3) {
    let root = w.slice(0, -3);
    add(root);
    if (root.length > 1 && root[root.length - 1] === root[root.length - 2]) add(root.slice(0, -1));
    if (root.endsWith('i')) add(root.slice(0, -1) + 'y');
  }
  // Avverbi in -ly
  if (w.endsWith('ly') && w.length > 2) add(w.slice(0, -2));
  // Possessivi con apostrofo
  if (w.endsWith("'s")) add(w.slice(0, -2));
  return [...out];
}

function generateVariants(term, lang) {
  if (lang === 'it') return generateItalianVariants(term);
  if (lang === 'es') return generateSpanishVariants(term);
  if (lang === 'en') return generateEnglishVariants(term);
  return [term];
}
