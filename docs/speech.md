# js/speech.js — TTS e Karaoke

**Righe:** ~195 | **Dipendenze:** `utils.js` (usa `els`, `sanitizeWord`), `i18n.js` (usa `translateUI`)

## Responsabilità

- Sintesi vocale (Text-to-Speech) del testo inserito dall'utente.
- Modalità karaoke: lettura parola per parola con evidenziazione visiva sincronizzata.

## Funzioni

### `getItalianVoice()` → `SpeechSynthesisVoice|undefined`
Seleziona la voce TTS migliore:
1. Se l'utente ha selezionato una voce nel dropdown impostazioni, usa quella.
2. Altrimenti cerca una voce italiana (`lang.startsWith('it')`).
3. Fallback alla voce di default del browser.

### `populateVoices()`
Popola il `<select id="voiceSelect">` con tutte le voci `speechSynthesis` disponibili:
- Raggruppa per lingua.
- Pre-seleziona la voce salvata in localStorage (`selectedVoice`).

### `speakText()`
Legge ad alta voce il contenuto del `<textarea id="textInput">`:
- Cancella eventuali speech in corso.
- Usa `getItalianVoice()` per la voce.
- Rate: 1.0.

### `speakSentence(text, slow)`
Legge un testo specifico:
- Se `slow = true`: rate dimezzato (0.5).
- Usata dai pulsanti "🔊 Ascolta" nei sentence-box.

### `playKaraoke(sentenceBox, speed)`
**Funzione principale del karaoke** (~130 righe):

1. Raccoglie le tile dal `sentenceBox`.
2. Per ogni tile, crea un elemento `.karaoke-word` nell'overlay.
3. Riproduce ogni parola sequenzialmente con TTS:
   - Evidenzia la parola corrente (classe `.active`).
   - Scroll automatico nell'overlay.
   - Per parole mascherate (`***`): riproduce un beep audio.
4. Supporta **pausa/ripresa** tramite controller:
   - `controller.pause()` — mette in pausa.
   - `controller.resume()` — riprende.
   - `controller.stop()` — interrompe.
5. Il controller viene salvato come `sentenceBox._karaokeController`.

#### Struttura del controller

```js
sentenceBox._karaokeController = {
  pause: function() { ... },
  resume: function() { ... },
  stop: function() { ... }
};
```

## Overlay karaoke

L'overlay karaoke è creato dinamicamente in `app.js` (`initApp`) con questa struttura:

```html
<div id="speakSlowOverlay" class="karaoke-overlay">
  <div class="karaoke-words">
    <span class="karaoke-word">parola1</span>
    <span class="karaoke-word active">parola2</span>  <!-- evidenziata -->
    <span class="karaoke-word">parola3</span>
  </div>
  <div class="karaoke-controls">
    <button>⏸️/▶️</button>
    <input type="range" />  <!-- barra di progresso -->
    <button>✕</button>
  </div>
</div>
```

## Beep per parole mascherate

Quando una parola nel karaoke è `***` (mascherata per gli esercizi), viene riprodotto un breve beep sintetico tramite `AudioContext`:

```js
const ctx = new AudioContext();
const osc = ctx.createOscillator();
osc.frequency.value = 440; // La4
osc.start();
setTimeout(() => osc.stop(), 200); // 200ms
```

## Note per le modifiche

- La velocità del karaoke è configurabile dall'utente nel modal impostazioni (slider 0.4–1.2).
- La velocità viene letta da `getKaraokeSpeed()` in `app.js`.
- Le voci TTS sono caricate in modo asincrono; `populateVoices()` va richiamata anche su `voiceschanged` event.
- Non tutte le voci sono disponibili su tutti i browser/OS.
