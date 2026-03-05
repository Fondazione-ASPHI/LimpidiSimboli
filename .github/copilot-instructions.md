# Copilot Instructions — Limpidi Simboli

## Progetto

**Limpidi Simboli** è un'applicazione web AAC (Comunicazione Aumentativa e Alternativa) di **Fondazione ASPHI ETS**, rilasciata sotto licenza **GNU GPL v3**. Converte frasi in tavole di simboli/pittogrammi usando ARASAAC, OpenSymbols, OpenAI e altri servizi.

## Architettura

- **Vanilla JavaScript** — nessun framework, nessun bundler, nessun sistema di build.
- Tutti i file JS condividono un **unico scope globale** via `<script>` tag; non usare `import`/`export`.
- **Ordine di caricamento** (rispettare sempre): `utils.js` → `i18n.js` → `storage.js` → `api.js` → `variants.js` → `speech.js` → `cropEditor.js` → `pdfExport.js` → `tiles.js` → `exercises.js` → `app.js`.
- Ogni file può accedere ai globali dei file caricati prima di esso, ma **mai** a quelli caricati dopo.
- `app.js` è l'orchestratore finale; è l'unico file che referenzia tutti gli altri.

> 📖 Dettagli completi: [docs/architecture.md](../docs/architecture.md)

## Regole generali

### 1. Scope globale
- Le nuove funzioni vanno nel file tematicamente corretto (vedi tabella sotto).
- Usare `function` declarations (hoisting) per le funzioni globali, non `const fn = () =>`.
- Le costanti condivise vanno in `utils.js`. Lo stato mutabile globale (`var`/`let`) va in `utils.js`.
- **Mai** dichiarare duplicati: verificare sempre se una variabile/funzione esiste già con grep.
- **Debug logging**: usare `dbg(...)` al posto di `console.log`. Attivazione: `localStorage.debug = 'true'`.
- **Chiavi localStorage**: usare le costanti in `STORAGE_KEYS` (es. `STORAGE_KEYS.APP_LANG`) anziché stringhe hardcodate.

### 2. Accessibilità (WCAG 2.1 AA)
- Ogni elemento interattivo deve avere `aria-label` o testo visibile.
- Usare ruoli semantici (`role`, `aria-live`, `aria-hidden`) dove appropriato.
- Rispettare `prefers-reduced-motion` e `forced-colors` nel CSS.
- Contrasto minimo 4.5:1 per testo, 3:1 per elementi UI grandi.
- Tutti i pulsanti devono essere raggiungibili da tastiera (`tabindex`, `:focus-visible`).

> 📖 Dettagli: [docs/styles.md](../docs/styles.md)

### 3. Internazionalizzazione (i18n)
- **Tutte** le stringhe visibili all'utente devono essere in `i18n.js`, nei tre oggetti `translations.it`, `translations.en`, `translations.es`.
- Nel HTML, usare `data-i18n="chiave"` per il testo e `data-i18n-placeholder="chiave"` per placeholder.
- I messaggi di stato usano `setStatusKey('chiave', {params})` con template in `statusMessages`.
- Mai hardcodare testo in italiano/inglese/spagnolo nei file JS.

> 📖 Dettagli: [docs/i18n.md](../docs/i18n.md)

### 4. CSS
- Usare le custom properties definite in `:root` in `css/styles.css` (es. `var(--brand)`, `var(--bg)`).
- Non aggiungere `<style>` inline in `index.html`; tutto il CSS va in `css/styles.css`.
- Le media query responsive sono organizzate per breakpoint decrescente (900px → 340px).

> 📖 Dettagli: [docs/styles.md](../docs/styles.md)

### 5. API e rete
- Tutte le chiamate API vanno in `api.js`.
- Usare `aborter.signal` per richieste cancellabili.
- Implementare sempre cache (localStorage o IndexedDB) per ridurre chiamate ripetute.
- Gestire `QuotaExceededError` per localStorage (vedi `saveCustomImages`).

> 📖 Dettagli: [docs/api.md](../docs/api.md)

### 6. Storage
- `localStorage`: chiavi API, preferenze, cache traduzioni/sinonimi, simboli personalizzati.
- `IndexedDB`: `ls-handles` (FileSystemHandle), `ExplanationsDB` (cache spiegazioni GPT).
- Le funzioni di persistenza/recupero dei FileSystemHandle sono in `storage.js`.

> 📖 Dettagli: [docs/storage.md](../docs/storage.md)

### 7. Tile e simboli
- La creazione di tile avviene tramite `addTile()` in `tiles.js`.
- Ogni tile ha `data-ids` (JSON array di ID), `data-idx`, `data-word`, `data-original`.
- Le immagini possono essere: ID numerico ARASAAC, oggetto OpenSymbols, `local-file:...`, `data:...`.

> 📖 Dettagli: [docs/tiles.md](../docs/tiles.md)

### 8. Esercizi
- Il modulo esercizi è un **IIFE** in `exercises.js`; le sue variabili interne non sono globali.
- L'unica funzione globale esposta è `generateExercisesForSentence(text)`.

> 📖 Dettagli: [docs/exercises.md](../docs/exercises.md)

### 9. EULA
- La pagina `eula.html` è autonoma e trilingue.
- Il gate EULA è in cima a `app.js` (IIFE `checkEula`).
- La licenza è **GNU GPL v3** — mai riferirsi a MIT.

> 📖 Dettagli: [docs/eula.md](../docs/eula.md)

## Mappa file → documentazione

| File | Documentazione | Responsabilità |
|------|---------------|----------------|
| `js/utils.js` | [docs/utils.md](../docs/utils.md) | Costanti, stato globale, utility |
| `js/i18n.js` | [docs/i18n.md](../docs/i18n.md) | Traduzioni, messaggi di stato |
| `js/storage.js` | [docs/storage.md](../docs/storage.md) | IndexedDB, cartelle, simboli custom |
| `js/api.js` | [docs/api.md](../docs/api.md) | Chiamate API esterne |
| `js/variants.js` | [docs/variants.md](../docs/variants.md) | Varianti morfologiche |
| `js/speech.js` | [docs/speech.md](../docs/speech.md) | TTS e karaoke |
| `js/cropEditor.js` | [docs/cropEditor.md](../docs/cropEditor.md) | Editor di ritaglio immagine |
| `js/pdfExport.js` | [docs/pdfExport.md](../docs/pdfExport.md) | Esportazione PDF tavole simboli |
| `js/tiles.js` | [docs/tiles.md](../docs/tiles.md) | Creazione e gestione tile |
| `js/exercises.js` | [docs/exercises.md](../docs/exercises.md) | Generatore esercizi |
| `js/app.js` | [docs/app.md](../docs/app.md) | Init, pipeline traduzione, eventi |
| `css/styles.css` | [docs/styles.md](../docs/styles.md) | Stili, responsive, WCAG |
| `eula.html` | [docs/eula.md](../docs/eula.md) | EULA trilingue, privacy |
| Architettura | [docs/architecture.md](../docs/architecture.md) | Panoramica, dipendenze, convenzioni |

## Checklist prima di ogni modifica

1. ✅ Leggere la documentazione del file coinvolto in `docs/`.
2. ✅ Verificare che non esistano duplicati di funzioni/variabili.
3. ✅ Rispettare l'ordine di caricamento dei file.
4. ✅ Aggiungere traduzioni in tutte e tre le lingue.
5. ✅ Aggiungere attributi WCAG agli elementi interattivi.
6. ✅ Testare con tastiera e screen reader.
7. ✅ Aggiornare `docs/` se si aggiungono nuove funzioni/variabili/strutture dati.
