# js/pdfExport.js — Esportazione PDF

**Righe:** ~119 | **Dipendenze:** `i18n.js` (`translateUI`, `setStatusKey`), CDN (`jspdf`, `html2canvas`), `utils.js` (`dbg`)

## Responsabilità

- Generare un PDF delle tavole di simboli correntemente visualizzate.
- Gestire la cattura screenshot per ogni sentence-box.
- Impaginazione A4 con margini e gestione multi-pagina.

## Origine

Questo file è stato estratto da `app.js` durante un refactoring. In precedenza la logica di generazione PDF era inline dentro `initApp()`.

## Funzione

### `generateSymbolsPDF()` → `Promise<void>`

Genera e scarica un PDF della tavola di simboli corrente:

1. **Validazione**: verifica che ci siano tile nel `#result`. Se vuoto, mostra alert.
2. **Preparazione stampa**: aggiunge classe `printing-mode` a `<body>` e inserisce un `<style>` temporaneo che nasconde pulsanti d'azione, badge, e altri elementi non stampabili.
3. **Cattura sentence-box**: per ogni `.sentence-box` nel risultato:
   - Usa `html2canvas` per catturare uno screenshot.
   - Calcola le dimensioni proporzionate per A4 (210×297mm, margine 10mm).
   - Se la posizione Y corrente + altezza box supera la pagina, aggiunge una nuova pagina.
   - Inserisce l'immagine nel PDF con `pdf.addImage()`.
4. **Fallback**: se non ci sono sentence-box, cattura l'intero `#result` come singola immagine.
5. **Salvataggio**: scarica il PDF con nome `simboli-{data}.pdf`.
6. **Cleanup**: rimuove classe `printing-mode` e stile temporaneo.
7. **Status**: mostra messaggio di successo nella barra di stato.

## Parametri PDF

| Parametro | Valore |
|-----------|--------|
| Formato | A4 verticale (210×297mm) |
| Margine | 10mm |
| Scala html2canvas | 2× |
| Spaziatura tra box | 5mm |
| Sfondo | Bianco (`#ffffff`) |

## Chiavi i18n utilizzate

| Chiave | Descrizione |
|--------|-------------|
| `pdf_print_no_tiles` | Alert se nessun simbolo da stampare |
| `pdf_print_generating` | Messaggio di stato durante la generazione |
| `pdf_print_success` | Messaggio di successo |

## Elementi nascosti durante la stampa

La classe `.printing-mode` nasconde:
- `.action-buttons-container`
- `.sentence-actions`
- `.remove-symbol-btn`
- `.tile .badge`
- `.abc-btn`, `.add-symbol-btn`, `.gpt-symbol-btn`

## Note per le modifiche

- La funzione è globale (`function generateSymbolsPDF()`) ed è chiamata dal click handler di `#printPdfButton` in `app.js`.
- Il file è caricato **prima** di `app.js` nell'ordine degli script.
- Le librerie CDN `jspdf` e `html2canvas` devono essere caricate prima di questo file.
- Il `console.error` nel catch dei singoli box è intenzionale (errori critici, non debug).
