# Limpidi Simboli

**Comunicazione Aumentativa e Alternativa (CAA) sul web**

[![Licenza: GPL v3](https://img.shields.io/badge/Licenza-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

> Limpidi Simboli converte frasi in tavole di simboli pittografici, pensate per persone con bisogni comunicativi complessi. Sviluppato da **Fondazione ASPHI ETS** — [www.asphi.it](https://www.asphi.it)

---

## Indice

- [Che cos'è](#che-cosè)
- [Funzionalità principali](#funzionalità-principali)
- [Demo rapida](#demo-rapida)
- [Requisiti di sistema](#requisiti-di-sistema)
- [Installazione e avvio](#installazione-e-avvio)
- [Configurazione](#configurazione)
  - [Chiavi API](#chiavi-api)
  - [Cartella immagini locale](#cartella-immagini-locale)
- [Come funziona](#come-funziona)
- [Architettura tecnica](#architettura-tecnica)
  - [Struttura dei file](#struttura-dei-file)
  - [Ordine di caricamento degli script](#ordine-di-caricamento-degli-script)
  - [Librerie esterne](#librerie-esterne)
  - [API esterne utilizzate](#api-esterne-utilizzate)
  - [Storage e persistenza](#storage-e-persistenza)
- [Accessibilità](#accessibilità)
- [Internazionalizzazione](#internazionalizzazione)
- [Documentazione tecnica](#documentazione-tecnica)
- [Contribuire al progetto](#contribuire-al-progetto)
- [Licenza](#licenza)
- [Crediti e ringraziamenti](#crediti-e-ringraziamenti)

---

## Che cos'è

**Limpidi Simboli** è un'applicazione web gratuita e open source per la **Comunicazione Aumentativa e Alternativa (CAA)**. Permette a educatori, terapisti, familiari e caregiver di trasformare qualsiasi frase in una **tavola di simboli pittografici**, facilitando la comunicazione con persone che hanno difficoltà nell'uso del linguaggio verbale.

L'applicazione:

- Analizza grammaticalmente la frase inserita grazie all'intelligenza artificiale.
- Cerca il pittogramma più appropriato per ogni parola significativa, attingendo da molteplici banche dati.
- Genera una tavola visiva interattiva con strumenti di personalizzazione avanzati.
- Funziona interamente nel browser, senza necessità di installazione o registrazione.

---

## Funzionalità principali

### 🔄 Conversione frase → simboli
Inserisci una frase in linguaggio naturale e l'app la converte automaticamente in una sequenza di simboli pittografici. L'analisi grammaticale (via GPT-4o) identifica lemmi, tempi verbali, genere e numero per cercare il simbolo più pertinente.

### 🔍 Ricerca multi-sorgente
Per ogni parola, la ricerca avviene in parallelo su più fonti:
- **ARASAAC** — archivio principale di pittogrammi (~40.000 simboli).
- **OpenSymbols** — database aggregato (include TAWASOL, Bliss e altri).
- **Sinonimi** — ricerca automatica di sinonimi italiani e inglesi per ampliare i risultati.
- **Indice keyword locale** — ricerca istantanea sull'indice ARASAAC scaricato localmente.

### 🖼️ Personalizzazione delle tile
Ogni scheda-simbolo (tile) offre numerose opzioni:
- **Navigazione tra alternative**: scorri tra i pittogrammi disponibili.
- **Galleria visuale**: esplora tutte le alternative in una griglia interattiva.
- **Caricamento immagini**: aggiungi simboli personalizzati dal tuo computer.
- **Ricerca web**: cerca immagini su Wikipedia, Wikimedia Commons e Google.
- **Generazione AI**: crea un pittogramma originale con DALL-E 3, nello stile ARASAAC.
- **Ritaglio immagine**: ritaglia e salva porzioni di un'immagine.
- **Unione tile**: combina più parole in un unico simbolo composito.
- **Solo testo**: mostra solo il testo senza immagine.

### 🗣️ Sintesi vocale e Karaoke
- **Lettura ad alta voce** della frase con voci TTS del sistema operativo.
- **Modalità Karaoke**: lettura parola per parola con evidenziazione sincronizzata.
- **Velocità regolabile**: da lenta a normale, configurabile nelle impostazioni.

### 📝 Esercizi didattici
Genera automaticamente esercizi interattivi a partire dalle frasi inserite:
- **Scelta multipla (MCQ)**: seleziona la parola corretta tra 4 opzioni.
- **Completamento (gap-fill)**: scrivi la parola mancante.
- **Dettato vocale**: riconosci e pronuncia la parola con il microfono.
- Quattro livelli di difficoltà (A0, A1, A2, B1).
- Esportazione in formato JSON.

### 📄 Esportazione PDF
Stampa o salva la tavola di simboli come file PDF in formato A4, pronto per l'uso.

### 💾 Salvataggio progetti
Salva e ricarica le tavole di simboli in formato JSON per riprendere il lavoro in un secondo momento.

### 📂 Cartella immagini locale
Collega una cartella sul tuo computer per salvare e riutilizzare automaticamente le immagini personalizzate tra sessioni diverse (tramite File System Access API).

### 🏷️ Badge grammaticali
Visualizza annotazioni grammaticali sotto ogni simbolo: tempo verbale, genere, numero e tipo di pronome.

### ℹ️ Spiegazioni accessibili
Per ogni parola, richiedi una spiegazione semplice (livello A1-A2) generata da GPT-4o, contestualizzata nella frase.

---

## Demo rapida

1. Apri `index.html` in un browser moderno (Chrome, Edge, Firefox).
2. Inserisci una frase, ad esempio: *"Il gatto mangia il pesce"*.
3. Clicca **🔄 Converti in simboli**.
4. La tavola di simboli appare in basso, con un pittogramma per ogni parola significativa.

---

## Requisiti di sistema

| Requisito | Dettaglio |
|-----------|-----------|
| **Browser** | Chrome 89+, Edge 89+, Firefox 86+, Safari 15+ |
| **Connessione Internet** | Necessaria per la ricerca di pittogrammi e le API esterne |
| **Chiave API OpenAI** | Necessaria per l'analisi grammaticale (GPT-4o) e la generazione immagini (DALL-E 3) |
| **Server locale** | Opzionale — l'app funziona anche aprendo `index.html` direttamente, ma un server locale è consigliato per evitare restrizioni CORS su alcune funzionalità |

> **Nota**: la File System Access API (per la cartella locale) è pienamente supportata solo su Chrome e Edge. Su Firefox e Safari viene usato un fallback con selettore file classico.

---

## Installazione e avvio

L'applicazione è **client-side pura**: non richiede Node.js, npm, build system o server backend.

### Opzione 1 — Apertura diretta

```
1. Scarica o clona il repository
2. Apri index.html nel browser
```

### Opzione 2 — Server locale (consigliato)

Con Python:
```bash
cd LimpidiSimboli
python -m http.server 8000
# Apri http://localhost:8000
```

Con VS Code:
```
Installa l'estensione "Live Server"
Click destro su index.html → "Open with Live Server"
```

### Opzione 3 — Clonazione da Git

```bash
git clone https://github.com/fondazione-asphi/LimpidiSimboli.git
cd LimpidiSimboli
# Apri index.html o avvia un server locale
```

---

## Configurazione

### Chiavi API

L'app funziona parzialmente senza chiavi API, ma per sfruttare tutte le funzionalità è necessario configurarle nel pannello **⚙️ Impostazioni**:

| Chiave | Servizio | Funzionalità abilitate | Obbligatoria? |
|--------|----------|----------------------|---------------|
| **OpenAI API Key** | OpenAI (GPT-4o, DALL-E 3) | Analisi grammaticale, spiegazioni, generazione immagini | ✅ Fortemente consigliata |
| **OpenSymbols Token** | OpenSymbols.org | Ricerca simboli aggiuntivi (TAWASOL, Bliss) | ❌ Opzionale |
| **Google API Key** + **Google CX** | Google Custom Search | Ricerca immagini da Google | ❌ Opzionale |

Le chiavi vengono salvate **localmente** nel `localStorage` del browser. Non vengono mai inviate al server dell'applicazione (che non esiste).

> ⚠️ **Sicurezza**: le chiavi API sono visibili nel browser. Per un uso condiviso su computer pubblici, assicurarsi di configurare limiti di utilizzo e budget sulle piattaforme dei rispettivi provider.

### Cartella immagini locale

Per salvare e riutilizzare immagini personalizzate tra sessioni:

1. Apri **⚙️ Impostazioni**.
2. Nella sezione "Cartella locale", clicca **📁 Seleziona cartella**.
3. Scegli una cartella sul tuo computer e concedi i permessi di lettura/scrittura.
4. Le immagini personalizzate verranno salvate automaticamente in questa cartella.

---

## Come funziona

La pipeline di conversione segue questi passi:

```
Frase utente
    │
    ▼
┌─────────────────────────────┐
│  1. Tokenizzazione          │  Divide la frase in parole
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  2. Analisi GPT-4o          │  Identifica lemma, tempo verbale,
│                             │  genere, numero, multiword
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  3. Ricerca simboli         │  Per ogni parola significativa:
│     (3 fasi parallele)      │
│                             │
│  a) ARASAAC diretto         │  API + indice keyword + varianti
│  b) Sinonimi                │  IT→EN + sinonimi EN + sinonimi IT
│  c) OpenSymbols             │  Database aggregato
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  4. Scoring e ordinamento   │  I risultati vengono classificati
│                             │  per rilevanza (0–100)
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  5. Creazione tile          │  Genera la scheda visiva con
│                             │  immagine, testo, badge, azioni
└─────────────────────────────┘
```

---

## Architettura tecnica

L'applicazione è scritta in **vanilla JavaScript** puro, senza framework, bundler o transpiler. Tutto il codice gira nel browser dell'utente.

### Struttura dei file

```
LimpidiSimboli/
├── index.html                   # Pagina principale
├── eula.html                    # EULA trilingue con accettazione obbligatoria
├── logo.png                     # Logo Fondazione ASPHI
├── LICENSE.txt                  # GNU GPL v3
│
├── css/
│   └── styles.css               # Foglio di stile unico (~1085 righe)
│
├── js/
│   ├── utils.js                 # Costanti, stato globale, utility (~397 righe)
│   ├── i18n.js                  # Traduzioni IT/EN/ES (~998 righe)
│   ├── storage.js               # IndexedDB, File System Access (~618 righe)
│   ├── api.js                   # Chiamate API esterne (~1066 righe)
│   ├── variants.js              # Varianti morfologiche IT/ES/EN (~225 righe)
│   ├── speech.js                # Sintesi vocale e karaoke (~225 righe)
│   ├── cropEditor.js            # Editor di ritaglio immagine (~197 righe)
│   ├── pdfExport.js             # Esportazione PDF (~119 righe)
│   ├── tiles.js                 # Creazione e gestione tile (~1588 righe)
│   ├── exercises.js             # Generatore esercizi IIFE (~808 righe)
│   └── app.js                   # Orchestratore principale (~1799 righe)
│
├── docs/                        # Documentazione tecnica (14 file)
├── .github/
│   └── copilot-instructions.md  # Istruzioni per GitHub Copilot
│
├── GuidaRapida_it/en/es.html    # Guide rapide trilingui
└── GuidaAvanzata_it/en/es.html  # Guide avanzate trilingui
```

**Totale:** ~7 300 righe di JavaScript, ~1 085 righe di CSS, ~270 righe di HTML.

### Ordine di caricamento degli script

L'ordine è **critico** perché tutti i file condividono lo scope globale (`window`). Ogni file può utilizzare solo le funzioni e variabili definite nei file caricati prima di esso.

```
CDN (nell'<head>):        pdf.js → mammoth.js → jspdf → html2canvas

Applicazione (</body>):   utils.js → i18n.js → storage.js → api.js
                          → variants.js → speech.js → cropEditor.js
                          → pdfExport.js → tiles.js → exercises.js
                          → app.js
```

| File | Responsabilità |
|------|---------------|
| `utils.js` | Fondazione: costanti, stato globale, utility (`dbg()`, `STORAGE_KEYS`, SVG placeholder) |
| `i18n.js` | Tutte le stringhe UI in 3 lingue, messaggi di stato, `applyTranslations()` |
| `storage.js` | IndexedDB per handle cartella, File System Access API, pannello simboli custom |
| `api.js` | ARASAAC, OpenSymbols, OpenAI, LibreTranslate, Google CSE, Wikipedia |
| `variants.js` | Generazione varianti morfologiche (es. *mangiando* → *mangiare*, *mangia*, *mangiato*) |
| `speech.js` | TTS con Web Speech API, modalità karaoke parola per parola |
| `cropEditor.js` | Overlay fullscreen con canvas per ritaglio rettangolare |
| `pdfExport.js` | Generazione PDF A4 con jsPDF + html2canvas |
| `tiles.js` | Creazione tile, gallerie di ricerca, modal unificato, merge |
| `exercises.js` | Generatore di esercizi MCQ/gap-fill/dettato (IIFE isolata) |
| `app.js` | Inizializzazione, pipeline di traduzione, event listener, EULA gate |

### Librerie esterne

Tutte le librerie sono caricate da CDN, senza dipendenze npm:

| Libreria | Versione | Scopo |
|----------|----------|-------|
| [pdf.js](https://mozilla.github.io/pdf.js/) | 3.11.174 | Estrazione testo da PDF caricati dall'utente |
| [mammoth.js](https://github.com/mwilliamson/mammoth.js) | 1.6.0 | Estrazione testo da file DOCX |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5.1 | Generazione del PDF delle tavole di simboli |
| [html2canvas](https://html2canvas.hertzen.com/) | 1.4.1 | Cattura screenshot delle tile per il PDF |

### API esterne utilizzate

| Servizio | Scopo | Dati inviati |
|----------|-------|-------------|
| **ARASAAC** | Ricerca pittogrammi (~40K simboli) | Termini di ricerca |
| **OpenSymbols** | Simboli aggiuntivi (TAWASOL, Bliss) | Termini di ricerca |
| **OpenAI GPT-4o** | Analisi grammaticale, spiegazioni accessibili | Frasi dell'utente + chiave API |
| **OpenAI DALL-E 3** | Generazione immagini stile pittogramma | Descrizione testuale + chiave API |
| **LibreTranslate** | Traduzione IT → EN per ampliare la ricerca | Testo da tradurre |
| **Google Custom Search** | Ricerca immagini web | Query + chiave API |
| **Wikipedia / Wikimedia** | Immagini educative | Termini di ricerca |

> **Privacy**: nessun dato viene raccolto o memorizzato da server di Fondazione ASPHI. Tutti i dati restano nel browser dell'utente. Le chiamate API vanno direttamente ai servizi terzi elencati sopra. Per maggiori dettagli consultare l'EULA integrato nell'applicazione.

### Storage e persistenza

| Tecnologia | Cosa memorizza |
|-----------|----------------|
| `localStorage` | Chiavi API, lingua, voce TTS, cache traduzioni/sinonimi, simboli personalizzati, preferenze UI, accettazione EULA |
| `IndexedDB` (`ls-handles`) | Handle della cartella immagini locale (File System Access API) |
| `IndexedDB` (`ExplanationsDB`) | Cache delle spiegazioni GPT per parole/frasi |
| File System Access API | Lettura/scrittura immagini nella cartella locale dell'utente |

---

## Accessibilità

L'applicazione è progettata per conformarsi alle **WCAG 2.1 livello AA**:

- **Skip-link**: collegamento "Salta al contenuto" per navigazione da tastiera.
- **Focus visibile**: contorno `3px solid` su ogni elemento interattivo focalizzato (`:focus-visible`).
- **Target size**: tutti i pulsanti hanno altezza minima di 44px (WCAG 2.5.8).
- **Contrasto**: minimo 4.5:1 per testo normale, 3:1 per testo grande.
- **Riduzione movimento**: animazioni disabilitate con `prefers-reduced-motion: reduce`.
- **Alto contrasto**: supporto `forced-colors` per modalità Windows ad alto contrasto.
- **ARIA**: attributi `aria-label`, `aria-live`, `aria-pressed`, `aria-hidden` dove appropriato.
- **Ruoli semantici**: `role="search"`, `role="alert"`, sezioni `<main>`, `<header>`.
- **Navigazione da tastiera**: tutti gli elementi interattivi raggiungibili con Tab.

---

## Internazionalizzazione

L'interfaccia è disponibile in **tre lingue**:

| Lingua | Bandiera | Copertura |
|--------|----------|-----------|
| 🇮🇹 Italiano | Default | Completa |
| 🇬🇧 Inglese | | Completa |
| 🇪🇸 Spagnolo | | Completa |

Il cambio lingua avviene istantaneamente cliccando sulle bandiere nella toolbar. Tutte le stringhe dell'interfaccia, i messaggi di stato e i placeholder sono tradotti.

Le traduzioni sono centralizzate in `js/i18n.js` (~998 righe) con il pattern `data-i18n` per il binding automatico al DOM.

---

## Documentazione tecnica

La cartella `docs/` contiene la documentazione dettagliata di ogni modulo:

| Documento | Contenuto |
|-----------|-----------|
| [architecture.md](docs/architecture.md) | Panoramica architetturale, dipendenze, convenzioni |
| [utils.md](docs/utils.md) | Costanti, stato globale, funzioni utility |
| [i18n.md](docs/i18n.md) | Sistema di traduzioni e messaggi di stato |
| [storage.md](docs/storage.md) | IndexedDB, File System Access, simboli custom |
| [api.md](docs/api.md) | Tutte le chiamate API esterne e strategie di cache |
| [variants.md](docs/variants.md) | Generatori di varianti morfologiche |
| [speech.md](docs/speech.md) | Sintesi vocale e modalità karaoke |
| [cropEditor.md](docs/cropEditor.md) | Editor di ritaglio immagine |
| [pdfExport.md](docs/pdfExport.md) | Esportazione PDF delle tavole |
| [tiles.md](docs/tiles.md) | Creazione tile, gallerie, modal unificato |
| [exercises.md](docs/exercises.md) | Generatore di esercizi didattici |
| [app.md](docs/app.md) | Orchestratore, pipeline traduzione, inizializzazione |
| [styles.md](docs/styles.md) | CSS, responsive design, WCAG |
| [eula.md](docs/eula.md) | EULA trilingue e privacy policy |

Per contribuire al codice, consultare anche le [istruzioni per Copilot](.github/copilot-instructions.md) che descrivono regole, convenzioni e checklist da seguire.

---

## Contribuire al progetto

### Prerequisiti

- Un editor di testo (consigliato: VS Code con le estensioni Live Server e GitHub Copilot).
- Un browser moderno per il testing.
- Familiarità con JavaScript vanilla (nessun framework).

### Regole di sviluppo

1. **Nessun `import`/`export`**: tutti i file condividono lo scope globale.
2. **Funzioni globali con `function`**: usare dichiarazioni `function` (non `const fn = () =>`).
3. **Debug con `dbg()`**: mai usare `console.log` direttamente. Attivare il debug con `localStorage.debug = 'true'`.
4. **Chiavi localStorage centralizzate**: usare le costanti in `STORAGE_KEYS`, non stringhe hardcodate.
5. **Traduzioni obbligatorie**: ogni stringa visibile va in `i18n.js` in tutte e tre le lingue.
6. **Accessibilità**: `aria-label` su ogni elemento interattivo, min-height 44px per i pulsanti.
7. **CSS semantico**: usare le custom properties (es. `var(--brand)`), mai stili inline.
8. **Documentare**: aggiornare il file `docs/` corrispondente per ogni modifica significativa.

### Workflow

```
1. Leggere docs/ del modulo da modificare
2. Verificare con grep che non esistano duplicati
3. Implementare la modifica nel file tematicamente corretto
4. Aggiungere traduzioni in IT/EN/ES
5. Aggiungere attributi WCAG
6. Testare con tastiera e screen reader
7. Aggiornare la documentazione
```

---

## Licenza

Questo progetto è rilasciato sotto licenza **GNU General Public License v3.0** (GPL-3.0).

Puoi liberamente:
- ✅ Usare l'applicazione per qualsiasi scopo.
- ✅ Studiare e modificare il codice sorgente.
- ✅ Ridistribuire copie.
- ✅ Distribuire versioni modificate.

A condizione che:
- Le opere derivate siano distribuite sotto la stessa licenza GPL-3.0.
- Il codice sorgente sia reso disponibile.
- Le modifiche siano documentate.

Per il testo completo, vedere [LICENSE.txt](LICENSE.txt) o [gnu.org/licenses/gpl-3.0](https://www.gnu.org/licenses/gpl-3.0.html).

---

## Crediti e ringraziamenti

### Sviluppatore

**Fondazione ASPHI ETS** — [www.asphi.it](https://www.asphi.it)

Fondazione ASPHI (Avviamento e Sviluppo di Progetti per ridurre l'Handicap mediante l'Informatica) promuove l'inclusione delle persone con disabilità nella scuola, nel lavoro e nella società attraverso l'uso delle tecnologie digitali.

### Risorse di terze parti

- **[ARASAAC](https://arasaac.org/)** — Pittogrammi del Centro Aragonés de Comunicación Aumentativa y Alternativa, Governo di Aragona (Spagna). Licenza Creative Commons BY-NC-SA.
- **[OpenSymbols](https://www.opensymbols.org/)** — Database aggregato di simboli per la comunicazione.
- **[OpenAI](https://openai.com/)** — Modelli GPT-4o e DALL-E 3 per analisi linguistica e generazione immagini.
- **[LibreTranslate](https://libretranslate.com/)** — Servizio di traduzione automatica open source.

---

*Ultimo aggiornamento: marzo 2026*
