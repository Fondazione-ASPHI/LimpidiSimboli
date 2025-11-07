# 🎨 Limpidi Simboli - ASPHI Onlus

**Applicazione web per la Comunicazione Aumentativa e Alternativa (CAA)** che converte frasi italiane in sequenze di pittogrammi ARASAAC.

---

## 📖 Cos'è Limpidi Simboli?

Limpidi Simboli è uno strumento gratuito e open-source sviluppato da **Fondazione ASPHI Onlus** per facilitare la comunicazione di persone con difficoltà linguistiche attraverso i pittogrammi.

### ✨ Funzionalità Principali

- 🔤 **Traduzione automatica** - Inserisci una frase e ottieni i pittogrammi corrispondenti
- 🌍 **Multi-lingua** - Supporto per italiano, spagnolo e inglese
- 🤖 **Analisi AI** - Analisi grammaticale avanzata con GPT-4 per contesto migliore
- 🎨 **Simboli personalizzati** - Carica, genera (AI) o cerca immagini sul web
- 🔊 **Sintesi vocale** - Ascolta la frase con voci italiane
- 🔄 **Ciclaggio simboli** - Clicca sui tile per vedere simboli alternativi
- 🔗 **Unione locuzioni** - Ctrl+Click su più simboli per cercare locuzioni composite
- 📁 **Storage locale** - Salva immagini personalizzate sul tuo PC (nessun server)

---

## 🚀 Come Iniziare

### 1. Apri l'applicazione
Apri `index.html` nel tuo browser (Chrome/Edge consigliati per File System Access API).

### 2. Inserisci una frase
```
Esempio: "Farò una grande festa"
```

### 3. Premi "🔄 Traduci"
L'app cercherà automaticamente i pittogrammi per ogni parola significativa.

### 4. Personalizza i risultati
- **Click sul tile** → Cicla tra simboli alternativi
- **Bottone `+`** → Carica un'immagine dal PC
- **Bottone `✨`** → Genera un simbolo con AI (DALL-E)
- **Bottone `W`** → Cerca su Wikipedia
- **Bottone `G`** → Cerca su Google Images
- **Bottone `🔎`** → Cerca simbolo con termine alternativo
- **Bottone `ABC`** → Mostra solo testo grande

---

## ⚙️ Configurazione (Opzionale)

Per sbloccare funzionalità avanzate, clicca su **⚙️ Settings**:

### API OpenAI (GPT-4 + DALL-E)
1. Vai su [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Crea una chiave API
3. Incollala in "Chiave API OpenAI (GPT)"
4. Clicca "Salva Chiave API"

**Funzionalità sbloccate:**
- ✅ Analisi grammaticale avanzata (pronomi, genere, numero, tempo)
- ✅ Generazione sinonimi per ricerca migliore
- ✅ Generazione immagini con DALL-E 3

### Token OpenSymbols (TAWASOL, Bliss)
1. Vai su [OpenSymbols](https://www.opensymbols.org/)
2. Crea un account e ottieni un token
3. Incollalo in "Token OpenSymbols"
4. Clicca "Salva Token"

**Simboli aggiuntivi:**
- ✅ TAWASOL (arabo)
- ✅ Bliss Symbols
- ✅ Mulberry Symbols

### Google Custom Search (Opzionale)
1. Vai su [Google Custom Search](https://developers.google.com/custom-search/v1/overview)
2. Crea un progetto e ottieni API Key + Search Engine ID (cx)
3. Inserisci entrambi nelle impostazioni
4. Limite gratuito: **100 ricerche/giorno**

---

## 📁 Cartella Immagini Locali

### Perché usarla?
- ✅ Salva immagini personalizzate, generate con AI o trovate sul web
- ✅ Evita il limite di 5-10MB di localStorage
- ✅ Le immagini restano sul tuo PC (privacy totale)

### Come configurarla?
1. Clicca **"📁 Seleziona Cartella Immagini"**
2. Scegli una cartella sul tuo PC (es: `Documenti/LimpidiSimboli`)
3. Concedi i permessi di lettura/scrittura

**Nota:** Chrome/Edge richiede di riconnettere la cartella ad ogni riavvio del browser (limitazione browser per sicurezza).

### Nomenclatura file
I file vengono automaticamente associati alle parole in base al nome:
```
cane_nero.jpg    → Parole: "cane", "nero"
bambina_felice.png → Parole: "bambina", "felice"
```

---

## 🎯 Funzionalità Avanzate

### Unione Simboli (Locuzioni)
1. Tieni premuto **Ctrl** (o **Cmd** su Mac)
2. Clicca su 2 o più simboli per selezionarli
3. Clicca **"🔗 Unisci"**
4. L'app cerca un pittogramma per la locuzione completa

Esempio: `"ho fame"` → simbolo unico per "avere fame"

### Badge Grammaticali
I simboli mostrano badge con:
- ⏪ **Passato** / ▶️ **Presente** / ⏩ **Futuro**
- 1️⃣ **Singolare** / ➕ **Plurale**
- 👤 **Pronomi** (io, tu, lui/lei, noi, voi, loro)

Disattivabili in **⚙️ Settings** → "Mostra badge grammaticali"

### Sintesi Vocale
1. Inserisci una frase
2. Clicca **"🔊 Ascolta"**
3. Personalizza la voce in **⚙️ Settings** → "Voce Sintesi Vocale"

---

## 🔒 Privacy e Dati

### ✅ Cosa rimane nel tuo browser (localStorage)
- Chiavi API (crittografate dal browser, non accessibili da altri siti)
- Cache traduzioni e sinonimi
- Riferimenti alle immagini personalizzate

### ✅ Cosa NON viene mai inviato a ASPHI Onlus
- **Nessun dato** - ASPHI ospita solo il file HTML statico
- Le frasi e i simboli esistono solo sul tuo dispositivo

### ⚠️ Cosa viene inviato ai servizi esterni (solo se configurati)
| Servizio | Cosa invia | Quando |
|----------|-----------|--------|
| **OpenAI** | Frase inserita | Quando usi analisi GPT o DALL-E |
| **Google** | Query ricerca | Quando usi ricerca Google Images |
| **LibreTranslate** | Singole parole | Automaticamente per traduzione IT→EN |
| **ARASAAC** | Parole di ricerca | Sempre (API pubblica) |
| **OpenSymbols** | Parole di ricerca | Se token configurato |

**Sintesi vocale**: elaborata **localmente** nel browser (Web Speech API).

### 🗑️ Cancellare i dati
- **Pulsante "🗑️ Pulisci"** → Cancella solo i risultati visibili
- **Settings → "🗑️ Cancella Tutto"** → Cancella simboli personalizzati
- **Impostazioni Browser → Cancella dati di navigazione** → Cancella tutto (API keys, cache)

---

## 🛠️ Risoluzione Problemi

### ❌ "Nessun pittogramma trovato"
**Soluzioni:**
1. Prova a riformulare la frase con parole più comuni
2. Usa il bottone `🔎` per cercare con un termine alternativo
3. Usa il bottone `✨` per generare un simbolo con AI
4. Carica un'immagine dal tuo PC con il bottone `+`

### ❌ "Chiave API mancante"
Configura le API keys in **⚙️ Settings**.

### ❌ "Cartella immagini non selezionata"
Clicca **"📁 Seleziona Cartella Immagini"** prima di:
- Generare simboli con AI
- Salvare immagini da Wikipedia/Google
- Caricare immagini dal PC

### ❌ "Memoria piena"
Usa la **Cartella Immagini Locali** invece di localStorage.

---

## 📊 Fonti dei Simboli

### ARASAAC
Pittogrammi CAA del **Gobierno de Aragón** (Spagna).
- **Autore:** Sergio Palao
- **Licenza:** [CC BY-NC-SA](https://beta.arasaac.org/terms-of-use)
- **API:** https://arasaac.org/developers/api

### OpenSymbols
Repository di simboli CAA multi-fonte:
- TAWASOL (arabo)
- Bliss Symbols
- Mulberry Symbols
- **Licenza:** Varia per fonte

---

## 📱 Compatibilità Browser

| Browser | Supporto | Note |
|---------|----------|------|
| **Chrome** | ✅ Completo | Consigliato |
| **Edge** | ✅ Completo | Consigliato |
| **Firefox** | ⚠️ Parziale | No File System Access API |
| **Safari** | ⚠️ Parziale | No File System Access API |

**File System Access API** disponibile solo su browser Chromium (Chrome, Edge, Opera).

---

## 🤝 Contribuire

Questo progetto è open-source. Per contribuire:
1. Segnala bug su [GitHub Issues](https://github.com/Fondazione-ASPHI/LimpidiSimboli/issues)
2. Proponi nuove funzionalità
3. Migliora la documentazione

---

## 📜 Licenza

Codice: [MIT License](LICENSE)  
Pittogrammi ARASAAC: [CC BY-NC-SA](https://beta.arasaac.org/terms-of-use)

---

## 👥 Crediti

**Sviluppo:** Fondazione ASPHI Onlus  
**Pittogrammi:** Sergio Palao / ARASAAC (Gobierno de Aragón)  
**Tecnologie:** OpenAI, Google, LibreTranslate, OpenSymbols

---

**Per supporto:** [info@asphi.it](mailto:info@asphi.it)  
**Sito web:** [www.asphi.it](https://www.asphi.it)
