# js/app.js — Orchestratore principale

**Righe:** ~1984 | **Dipendenze:** tutti gli altri file JS

## Responsabilità

- Inizializzazione completa dell'applicazione (`initApp`).
- Pipeline di traduzione (frase → analisi GPT → ricerca simboli → tile).
- Collegamento di tutti gli event listener.
- Gestione salvataggio/caricamento progetti.
- Generazione PDF delle tavole di simboli.
- EULA gate.

## EULA Gate

All'inizio del file, una IIFE verifica l'accettazione dell'EULA:

```js
(function checkEula() {
  if (localStorage.getItem('eulaAccepted') !== 'true') {
    window.location.replace('eula.html');
  }
})();
```

Se l'EULA non è stato accettato, l'utente viene immediatamente reindirizzato a `eula.html`.

## Costanti

| Nome | Valore | Descrizione |
|------|--------|-------------|
| `OPENAI_API_KEY` | `''` | Default vuoto, sovrascritta da localStorage |
| `OPENSYMBOLS_TOKEN` | `''` | Default vuoto, sovrascritta da localStorage |

## Funzioni

### Helper

#### `getKaraokeSpeed()` → `number`
Legge la velocità karaoke da localStorage (default 0.7).

#### `markdownToHTML(markdown)` → `string`
Convertitore Markdown → HTML semplice. Supporta: titoli, grassetto, corsivo, liste, link, code inline.

### Guide

#### `openGuidaRapida()`
Carica `GuidaRapida_{lang}.html` via fetch e mostra nel modal `#guidaRapidaModal`.

#### `openGuidaAvanzata()`
Carica `GuidaAvanzata_{lang}.html` via fetch e mostra nel modal `#guidaAvanzataModal`.

#### `openVideoTutorial()`
Crea un iframe YouTube nel modal `#videoTutorialModal`.

### Sentence-box

#### `createSentenceActionButtons(sentenceBox, sentenceText)` → `HTMLElement`
Crea la barra dei pulsanti d'azione per ogni sentence-box:

| Pulsante | Azione |
|----------|--------|
| 🔊 Ascolta | `speakSentence(text)` |
| 🐢 Karaoke | `playKaraoke(sentenceBox, speed)` |
| ℹ️ Spiega | Mostra spiegazione GPT di ogni parola |
| 📝 Esercizi | `generateExercisesForSentence(text)` |
| 🗑️ Elimina | Rimuove il sentence-box |
| 🔗 Unisci | `mergeSelectedTiles()` |

### Pipeline di traduzione

#### `translate(text)` ★
**Funzione entry-point della traduzione:**
1. Divide `text` in frasi (regex: `.!?` o newline).
2. Per ogni frase, crea un `<div class="sentence-box">`.
3. Chiama `translateSingleSentence()` per ogni frase.
4. Aggiunge i pulsanti d'azione con `createSentenceActionButtons()`.

#### `translateSingleSentence(sentence, container, sentenceIdx)` ★
**Pipeline core** (~350 righe):

```
1. tokenize(sentence)
2. analyzeSentence(sentence, lang)     ← GPT-4o
3. Per ogni token nell'analisi:
   a. Se stop-word e skipStop attivo → skip
   b. Se multi-word → tenta ricerca keyword index
   c. queryIds(lemma, original, lang)  ← ricerca 3-fasi
   d. addTile(container, word, original, ids, ...)
   e. Aggiungi badge grammaticali (tense, gender, number)
```

#### `adjustAmbiguousPronounForEssere(analysisResult)`
Euristica per risolvere l'ambiguità del pronome "sono" in italiano:
- "io sono" vs "loro sono" → determina persona in base al contesto verbale.

### Inizializzazione

#### `initApp()` ★
**Funzione di inizializzazione** (~900 righe). Eseguita su `DOMContentLoaded`:

1. **Popola `els`**: ~30 `qs()` calls per tutti gli elementi DOM.
2. **Lingua**: legge/salva preferenza, chiama `applyTranslations()`.
3. **Chiavi API**: carica da localStorage (OpenAI, Google, OpenSymbols).
4. **Cartella locale**: `initLocalFolderFromIDB()`.
5. **Event listener**: traduzione, clear, speak, settings, print PDF, guide, voice, karaoke, badge grammar, tile actions toggle.
6. **Upload documenti**: handler per PDF/DOCX via `pdfjsLib`/`mammoth`.
7. **Modal impostazioni**: slider karaoke, checkbox badge, pannello simboli custom.
8. **Overlay karaoke**: crea il DOM dell'overlay con controlli play/pause/close.
9. **Salvataggio/caricamento progetto**: JSON export/import.
10. **Sanity checks**: `runAppSanityChecks()` con delay.

#### `runAppSanityChecks()`
Verifica che elementi DOM critici e funzioni globali esistano. Logga warning per elementi mancanti.

#### `updateTranslateButtonText()`
Aggiorna il testo del pulsante traduzione: "Converti" se vuoto, "Aggiungi" se ci sono già risultati.

## Event listener principali

| Evento | Target | Azione |
|--------|--------|--------|
| `click` | `#translateButton` | `translate(textInput.value)` |
| `click` | `#clearButton` | Svuota `#result` |
| `click` | `#printPdfButton` | Genera PDF con jspdf + html2canvas |
| `click` | `#saveProjectButton` | Esporta progetto come JSON |
| `click` | `#loadProjectButton` | Importa progetto da JSON |
| `click` | `#settingsButton` | Apre modal impostazioni |
| `click` | `#guidaRapidaButton` | `openGuidaRapida()` |
| `click` | `#guidaAvanzataButton` | `openGuidaAvanzata()` |
| `click` | `#videoTutorialButton` | `openVideoTutorial()` |
| `click` | `.lang-flag` | Cambia lingua, `applyTranslations()` |
| `click` | `#toggleTileActionsButton` | Toggle classe `.show-tile-actions` |
| `change` | `#voiceSelect` | Salva voce selezionata |
| `change` | `#showGrammarBadges` | Mostra/nasconde badge |
| `input` | `#karaokeSpeedInput` | Aggiorna velocità karaoke |
| `MutationObserver` | `#result` | `updateTranslateButtonText()` |

## Formato progetto (JSON)

```json
{
  "version": 1,
  "lang": "it",
  "text": "Il gatto mangia il pesce",
  "sentences": [
    {
      "text": "Il gatto mangia il pesce",
      "tiles": [
        {
          "word": "gatto",
          "original": "gatto",
          "ids": [12345, 67890],
          "idx": 0,
          "tense": null
        }
      ]
    }
  ]
}
```

## Gestione errori

```js
window.addEventListener('error', (e) => {
  setStatusKey('js_error', { msg: e.message || 'sconosciuto' }, true);
});
window.addEventListener('unhandledrejection', (e) => {
  setStatusKey('unhandled_rejection', { msg: e.reason?.message || 'richiesta annullata' }, true);
});
```

## Note per le modifiche

- `initApp()` è molto lunga (~900 righe). Per aggiungere nuovi event listener, cercare la sezione tematica appropriata.
- La pipeline `translateSingleSentence()` è il cuore dell'app. Modificarla con cautela.
- Per aggiungere un nuovo pulsante nel sentence-box, modificare `createSentenceActionButtons()`.
- Nuove chiavi API: aggiungere campo nel modal (HTML), wiring in `initApp()`, caricamento/salvataggio localStorage.
- Il `MutationObserver` su `#result` serve per aggiornare il testo del pulsante traduzione.
