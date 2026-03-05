# js/variants.js — Generatori di varianti morfologiche

**Righe:** ~175 | **Dipendenze:** `utils.js` (usa `IRREGULAR_PRESENT_LEMMA_MAP`)

## Responsabilità

Generare varianti morfologiche di una parola per migliorare la ricerca di pittogrammi. Ad esempio, cercando "mangiando" si generano anche "mangiare", "mangia", "mangiato", ecc.

## Funzioni

### `generateItalianVariants(term)` → `Set<string>`
Genera varianti per una parola italiana. Copre:

- **Verbi irregolari**: lookup in `IRREGULAR_PRESENT_LEMMA_MAP` (es. `'ho' → 'avere'`).
- **Participi passati**: `-ato → -are`, `-uto → -ere`, `-ito → -ire`.
- **Gerundi**: `-ando → -are`, `-endo → -ere`.
- **Presente indicativo**: `-a/-e/-o → -are/-ere/-ire`.
- **Imperfetto**: `-ava/-eva/-iva → -are/-ere/-ire`.
- **Futuro**: `-erà/-irà/-arà → -ere/-ire/-are`.
- **Passato remoto**: `-ò/-ì → -are/-ire`.
- **Condizionale**: `-erebbe → -ere`.
- **Avverbi**: `-mente → aggettivo base`.
- **Genere**: `-o ↔ -a`, `-e → -i`.
- **Plurale/singolare**: `-i → -o/-e`, `-e → -a`.

### `generateSpanishVariants(term)` → `Set<string>`
Genera varianti per una parola spagnola:

- **Plurale**: `-s/-es` e viceversa.
- **Genere**: `-o ↔ -a`.
- **Coniugazioni verbali**: `-ando/-iendo → -ar/-er/-ir`, `-ado/-ido → infinito`.
- **Diminutivi**: `-ito/-ita → base`.

### `generateEnglishVariants(term)` → `Set<string>`
Genera varianti per una parola inglese:

- **Plurale**: `-s/-es/-ies`.
- **Tempo passato**: `-ed → base`.
- **Gerundio**: `-ing → base`.
- **Comparativo/superlativo**: `-er/-est → base`.
- **Avverbi**: `-ly → aggettivo`.
- **Possessivi**: `-'s → base`.

### `generateVariants(term, lang)` → `Set<string>`
Dispatcher che chiama la funzione specifica per lingua:
- `'it'` → `generateItalianVariants`
- `'es'` → `generateSpanishVariants`
- `'en'` → `generateEnglishVariants`

## Esempio d'uso

```js
generateVariants('mangiando', 'it');
// → Set {'mangiando', 'mangiare', 'mangia', 'mangiato', ...}
```

## Note per le modifiche

- Per aggiungere nuove regole morfologiche, inserirle nella funzione della lingua appropriata.
- Le varianti devono avere lunghezza > 1 carattere (filtrate internamente).
- La funzione italiana è la più complessa (~90 righe) data la ricchezza morfologica.
- Non aggiungere chiamate API qui; le varianti sono generate localmente.
