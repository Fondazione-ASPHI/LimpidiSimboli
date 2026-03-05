# eula.html — EULA trilingue e Privacy Policy

**Righe:** ~775

## Responsabilità

- Presentare il Contratto di Licenza con l'Utente Finale (EULA) in tre lingue.
- Privacy policy con disclosure dei servizi di terze parti.
- Gate di accettazione obbligatoria prima dell'uso dell'app.

## Struttura

Il file è **autonomo** (self-contained): include il proprio CSS inline oltre a linkare `css/styles.css` per le variabili base.

### Sezioni HTML

```
eula.html
├── <head>
│   ├── <link> css/styles.css
│   └── <style> CSS specifico EULA
├── <body>
│   ├── Skip-link WCAG
│   ├── Header (titolo + sottotitolo)
│   ├── Language Switcher (IT/ES/EN)
│   ├── <main>
│   │   ├── #eula-it (contenuto italiano)
│   │   ├── #eula-es (contenuto spagnolo)
│   │   └── #eula-en (contenuto inglese)
│   ├── Pulsanti Accetto/Rifiuto
│   └── Messaggio di rifiuto
└── <script> (logica switching + accettazione)
```

### Contenuto EULA (9 sezioni × 3 lingue)

| Sezione | Contenuto |
|---------|-----------|
| 1. Introduzione | App, editore (Fondazione ASPHI ETS), licenza GPL-3.0 |
| 2. Accettazione | Click per accettare, età minima 16 anni |
| 3. Licenza | GNU GPL v3: copyleft, codice sorgente, brevetti |
| 4. Privacy | **ASPHI non raccoglie dati**, localStorage/IDB solo locale |
| 5. Servizi terze parti | 6 servizi con scopo, dati inviati, link privacy |
| 6. Esclusione responsabilità | Non è dispositivo medico, no garanzie accuratezza |
| 7. GDPR | Reg. UE 2016/679, diritto cancellazione/portabilità |
| 8. Modifiche | Riserva di modifica, notifica in-app |
| 9. Contatti | Fondazione ASPHI ETS, www.asphi.it |

### Servizi di terze parti documentati

| Servizio | Dati inviati |
|----------|-------------|
| ARASAAC | Termini di ricerca |
| OpenAI (GPT-4o, DALL-E 3) | Frasi utente + chiave API |
| OpenSymbols | Termini di ricerca |
| Google Custom Search | Query + chiave API |
| LibreTranslate | Testo da tradurre |
| Wikipedia/Wikimedia | Termini di ricerca |

## Logica JavaScript

### Auto-redirect
```js
if (localStorage.getItem('eulaAccepted') === 'true') {
  window.location.href = 'index.html';
}
```

Se l'EULA è già stato accettato, reindirizza immediatamente a `index.html`.

### Language switching
- Tre pulsanti `.lang-flag` con `data-lang="it|es|en"`.
- Click → mostra il blocco `.eula-lang` corrispondente, nasconde gli altri.
- Aggiorna `<html lang>`, `aria-pressed`, testi dei pulsanti.
- Focus management: sposta il focus al primo `<h2>` del blocco attivato.

### Accettazione
```js
btnAccept.addEventListener('click', function () {
  localStorage.setItem('eulaAccepted', 'true');
  localStorage.setItem('eulaVersion', '1.0');
  window.location.href = 'index.html';
});
```

### Rifiuto
```js
btnDecline.addEventListener('click', function () {
  declineMsg.classList.add('visible');
  declineMsg.focus();
});
```

Mostra un messaggio di errore: "Non è possibile utilizzare l'applicazione senza accettare i termini."

## Integrazione con app.js

Il gate EULA è in `app.js` (riga ~3):

```js
(function checkEula() {
  if (localStorage.getItem('eulaAccepted') !== 'true') {
    window.location.replace('eula.html');
  }
})();
```

### Chiavi localStorage

| Chiave | Valore | Descrizione |
|--------|--------|-------------|
| `eulaAccepted` | `'true'` | EULA accettato |
| `eulaVersion` | `'1.0'` | Versione dell'EULA accettato |

Per forzare la ri-accettazione (es. dopo aggiornamento termini), incrementare la versione e aggiornare il check nel gate.

## Licenza

La licenza del progetto è **GNU GPL v3** (non MIT). L'EULA riflette questo con:
- Principio di copyleft.
- Obbligo di distribuzione del codice sorgente.
- Concessione esplicita di brevetti.
- Link al testo integrale: https://www.gnu.org/licenses/gpl-3.0.html

## WCAG

- Skip-link: `#skipLink` → `#main-content`.
- `aria-pressed` sui pulsanti lingua.
- `role="alert"` sul messaggio di rifiuto.
- `tabindex="-1"` per focus management.
- Print stylesheet: nasconde pulsanti, mostra tutti i blocchi lingua.
- `forced-colors`: bordi visibili su pulsanti.

## Note per le modifiche

- Se si aggiunge un nuovo servizio di terze parti, documentarlo in **tutte e tre** le sezioni lingua (5.x).
- Se si aggiorna la versione EULA, modificare: `eulaVersion` nel JS, la data "Ultimo aggiornamento", e il check nel gate di `app.js`.
- Il file è autonomo: le modifiche CSS vanno nel `<style>` interno, non in `css/styles.css`.
