# js/exercises.js — Modulo esercizi

**Righe:** ~809 | **Dipendenze:** `utils.js`, `i18n.js`, `speech.js`, `variants.js`, `api.js` (pdf.js CDN)

## Responsabilità

- Generazione di esercizi interattivi (MCQ, gap-fill, dettato vocale) da frasi.
- Preview con correzione automatica.
- Esportazione JSON ed importazione PDF.

## Architettura: IIFE

Il modulo è interamente contenuto in una **IIFE** (Immediately Invoked Function Expression):

```js
(function exercisesModule() {
  // Tutto il codice del modulo è qui dentro
  // Le variabili e funzioni interne NON sono globali
})();
```

Questo protegge lo scope: le variabili interne (`exSentences`, `lastExercises`, `COMMON_DISTRACTORS` locale, ecc.) **non** inquinano il namespace globale.

### Unica funzione globale

```js
function generateExercisesForSentence(text) { ... }
```

Definita **fuori** dall'IIFE. Apre il modal esercizi pre-compilato con il testo di una frase.

## Elementi DOM referenziati

All'interno dell'IIFE vengono cercati direttamente via `document.getElementById()`:

| ID | Elemento |
|----|----------|
| `exercisesModal` | Container modal |
| `exercisesModalClose` | Pulsante chiudi (✕) |
| `exModalCloseBtn` | Pulsante "Chiudi" in basso |
| `exModalGenerate` | Pulsante "Genera" |
| `exModalExport` | Pulsante "Esporta JSON" |
| `exModalUploadPdf` | Pulsante "Carica PDF frasi" |
| `exModalType` | Select tipo esercizio |
| `exModalLevel` | Select livello |
| `exModalCount` | Input numero items |
| `exModalPreview` | Container preview |

## Tipi di esercizio

### MCQ (Scelta multipla)
- Si mascherano parole target dalla frase.
- Si generano 3 distrattori (da `COMMON_DISTRACTORS` + varianti morfologiche).
- L'utente sceglie tra 4 opzioni.
- Feedback immediato: verde (corretto) / rosso (errato).

### Gap-fill (Scrivi)
- La parola target viene sostituita con `___`.
- L'utente digita la risposta.
- Confronto case-insensitive.
- Punteggio con distanza di Levenshtein per errori minori.

### Speak (Dì a voce)
- La frase viene mostrata con parole mascherate.
- L'utente usa il microfono (Web Speech Recognition API).
- Confronto con `levenshtein()` per tolleranza errori.

## Livelli di difficoltà

| Livello | Comportamento distrattori |
|---------|--------------------------|
| A0 | Distrattori molto diversi dalla parola target |
| A1 | Distrattori generici da `COMMON_DISTRACTORS` |
| A2 | Distrattori più simili (stessa iniziale o lunghezza) |
| B1 | Distrattori includono varianti morfologiche della parola target |

## Funzioni interne (non globali)

### `openExModal()`
Apre il modal esercizi, inizializza lo stato.

### `closeExModal()`
Chiude il modal, pulisce le risorse.

### `extractWords(text, skipStopWords)`
Estrae parole dal testo, opzionalmente filtrando stop-word.

### `pickTargetWords(words, count)`
Seleziona casualmente `count` parole target dall'array.

### `generateExercises(text, type, level, count)`
Genera un array di oggetti esercizio:

```js
{
  type: 'mcq' | 'write' | 'speak',
  sentence: 'Il gatto mangia',
  target: 'gatto',
  masked: 'Il ___ mangia',
  options: ['gatto', 'casa', 'libro', 'albero'],  // solo MCQ
  correct: 0  // indice risposta corretta (solo MCQ)
}
```

### `renderExercisesPreview(exercises)`
Renderizza gli esercizi nel panel di preview con interattività:
- MCQ: pulsanti opzione con feedback colore.
- Gap-fill: input text con pulsante "Verifica".
- Speak: pulsante microfono con riconoscimento vocale.

### `levenshtein(a, b)` → `number`
Calcolo della distanza di Levenshtein tra due stringhe. Usata per tolleranza errori nel gap-fill e speak.

## Import PDF

Il pulsante "📄 Carica PDF frasi" consente di:
1. Caricare un file PDF.
2. Estrarre il testo con `pdfjsLib`.
3. Dividere in frasi.
4. Generare esercizi da tutte le frasi estratte.

## Esportazione JSON

Il pulsante "Esporta JSON" scarica `lastExercises` come file `.json`.

## Note per le modifiche

- **Non aggiungere funzioni globali** all'interno dell'IIFE; usare solo `generateExercisesForSentence()` come punto di ingresso pubblico.
- Il `COMMON_DISTRACTORS` locale nell'IIFE è una copia di quello in `utils.js`; se si aggiorna uno, aggiornare anche l'altro.
- Il Web Speech Recognition API non è supportato su tutti i browser (principalmente Chrome).
- Il modal esercizi è definito in `index.html` con ID `exercisesModal`.
