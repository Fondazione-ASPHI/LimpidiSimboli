# Architettura — Limpidi Simboli

## Panoramica

Limpidi Simboli è un'applicazione web **client-side pura** (nessun server back-end proprio). Tutto il codice gira nel browser dell'utente. L'app è scritta in **vanilla JavaScript** senza framework, bundler o transpiler.

## Struttura dei file

```
LimpidiSimboli/
├── index.html              # Pagina principale (solo HTML, niente inline CSS/JS)
├── eula.html               # EULA trilingue con gate di accettazione
├── logo.png                # Logo Fondazione ASPHI
├── LICENSE.txt             # GNU GPL v3
├── css/
│   └── styles.css          # Foglio di stile unico (969 righe)
├── js/
│   ├── utils.js            # Costanti, stato globale, utility
│   ├── i18n.js             # Traduzioni IT/EN/ES, status messages
│   ├── storage.js          # IndexedDB, File System Access, simboli custom
│   ├── api.js              # Tutte le chiamate API esterne
│   ├── variants.js         # Generatori varianti morfologiche
│   ├── speech.js           # TTS e karaoke
│   ├── tiles.js            # Creazione e gestione tile/simboli
│   ├── exercises.js        # Modulo esercizi (IIFE)
│   └── app.js              # Orchestratore, init, pipeline traduzione
├── docs/                   # Documentazione tecnica dettagliata
├── .github/
│   └── copilot-instructions.md
├── GuidaRapida_it/en/es.html   # Guide rapide trilingui
└── GuidaAvanzata_it/en/es.html # Guide avanzate trilingui
```

## Ordine di caricamento degli script

L'ordine è **critico** perché tutti i file condividono lo scope globale (`window`). Ogni file può usare solo i globali definiti nei file caricati **prima** di esso.

```
1. CDN Libraries (nell'<head>):
   ├── pdf.js 3.11.174
   ├── mammoth.js 1.6.0
   ├── jspdf 2.5.1
   └── html2canvas 1.4.1

2. Application scripts (prima di </body>):
   ├── utils.js        ← fondazione: costanti, stato, helper
   ├── i18n.js         ← traduzioni (usa els da utils)
   ├── storage.js      ← persistenza (usa els, localImage* da utils)
   ├── api.js          ← API calls (usa costanti, cache, stato da utils + variants)
   ├── variants.js     ← morfologia (usa IRREGULAR_PRESENT_LEMMA_MAP da utils)
   ├── speech.js       ← TTS (usa els da utils, translateUI da i18n)
   ├── tiles.js        ← tile (usa utils + api + storage + i18n)
   ├── exercises.js    ← esercizi (usa utils + i18n + speech + variants)
   └── app.js          ← orchestratore (usa TUTTI gli altri file)
```

## Grafo delle dipendenze

```
utils.js ─────────────────────────────────────────────┐
  │                                                     │
  ├──► i18n.js ──────────────────────────────────┐     │
  │                                               │     │
  ├──► storage.js ───────────────────────────┐   │     │
  │                                           │   │     │
  ├──► api.js ◄── variants.js               │   │     │
  │     │                                     │   │     │
  │     ├──► tiles.js ◄── storage.js, i18n  │   │     │
  │     │                                     │   │     │
  │     └──► exercises.js ◄── i18n, speech  │   │     │
  │                                           │   │     │
  └──────────────────────────────────────────►app.js◄──┘
                                              (usa tutto)
```

## Comunicazione tra moduli

Non ci sono `import`/`export`. Tutta la comunicazione avviene tramite:

1. **Variabili globali** su `window` (dichiarate con `var`/`let`/`const` al top-level).
2. **Funzioni globali** (dichiarate con `function` al top-level).
3. **Oggetto `els`**: dichiarato come `var els = {}` in `utils.js`, popolato in `initApp()` dentro `app.js`. Contiene ~30 riferimenti DOM.

## Librerie esterne (CDN)

| Libreria | Versione | Uso |
|----------|----------|-----|
| pdf.js | 3.11.174 | Estrazione testo da PDF caricati |
| mammoth.js | 1.6.0 | Estrazione testo da DOCX caricati |
| jspdf | 2.5.1 | Generazione PDF delle tavole di simboli |
| html2canvas | 1.4.1 | Cattura screenshot delle tile per il PDF |

## API esterne

| Servizio | Endpoint | Scopo |
|----------|----------|-------|
| ARASAAC | `api.arasaac.org/api/pictograms` | Ricerca pittogrammi |
| OpenSymbols | `www.opensymbols.org/api/v2/symbols` | Simboli aggiuntivi (TAWASOL, Bliss) |
| OpenAI | `api.openai.com/v1/chat/completions` | Analisi frasi (GPT-4o), spiegazioni |
| OpenAI | `api.openai.com/v1/images/generations` | Generazione immagini (DALL-E 3) |
| LibreTranslate | `libretranslate.com/translate` | Traduzione IT→EN per ricerca |
| Google CSE | `www.googleapis.com/customsearch/v1` | Ricerca immagini web |
| Wikipedia | `it/en/es.wikipedia.org/api/rest_v1` | Immagini educative |
| Wikimedia | `commons.wikimedia.org/w/api.php` | Immagini da Commons |

## Storage

| Tecnologia | Dati memorizzati |
|-----------|------------------|
| `localStorage` | Chiavi API, preferenze lingua/voce, cache traduzioni/sinonimi, simboli personalizzati (`customSymbolImages`), velocità karaoke, toggle badge grammaticali, accettazione EULA |
| `IndexedDB` (`ls-handles`) | `FileSystemDirectoryHandle` per la cartella immagini locale |
| `IndexedDB` (`ExplanationsDB`) | Cache delle spiegazioni GPT per parole/frasi |
| File System Access API | Lettura/scrittura immagini nella cartella locale dell'utente |

## Convenzioni di codice

- **Funzioni globali**: `function nomeFunzione()` (no arrow, per hoisting).
- **Costanti**: `const NOME_MAIUSCOLO` o `const nomeCamelCase` a seconda del tipo.
- **Stato mutabile**: `var` o `let` al top-level di `utils.js`.
- **DOM refs**: sempre tramite `els.nomeElemento` (popolato in `initApp()`).
- **Selezione DOM**: `qs('id')` ≡ `document.getElementById('id')`.
- **Gestione errori async**: wrappare con `safeAsync()` oppure try/catch con `setStatusKey()`.
- **Cache**: oggetto `cache` e `pictoDetailCache` in `utils.js`.
