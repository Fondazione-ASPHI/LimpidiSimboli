# css/styles.css — Stili e accessibilità

**Righe:** ~1085

## Responsabilità

- Definire tutte le regole CSS dell'applicazione.
- Custom properties (variabili CSS) per temi coerenti.
- Layout responsive con breakpoint multipli.
- Conformità WCAG 2.1 AA.

## Custom Properties (`:root`)

```css
:root {
  --bg: #f7f7f9;
  --card: #ffffff;
  --text: #222;
  --muted: #6b7280;
  --brand: #2a9df4;
  --brand-600: #1e7ec8;
  --danger: #b91c1c;
  --ring: rgba(42, 157, 244, 0.35);
  --radius: 12px;
  --radius-sm: 8px;
  /* ... altre variabili */
}
```

**Regola**: usare sempre le custom properties per colori, raggi e spaziature. Non hardcodare valori.

## Sezioni principali

### Reset e base
- Box-sizing border-box globale.
- Font system stack: `system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`.
- Scroll behavior smooth.

### Accessibilità WCAG

#### Skip-link
```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  /* Visibile solo su focus da tastiera */
}
.skip-link:focus { top: 0; }
```

#### Focus visibile
```css
:focus-visible {
  outline: 3px solid var(--brand);
  outline-offset: 2px;
}
```

#### Riduzione movimento
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Forced colors (alto contrasto)
```css
@media (forced-colors: active) {
  .button { border: 2px solid ButtonText; }
  .tile { border: 2px solid CanvasText; }
  /* ... */
}
```

### Toolbar
- Layout flex con gap.
- Textarea con bordo arrotondato e padding generoso.
- Pulsanti organizzati in gruppi con gap.

### Pulsanti

| Classe | Aspetto |
|--------|---------|
| `.button` | Primario: sfondo `var(--brand)`, testo bianco |
| `.button.ghost` | Trasparente con bordo sottile, hover con sfondo chiaro |
| `.button.danger` | Sfondo `var(--danger)` |

Tutti i pulsanti hanno `min-height: 44px` (WCAG target size).

### Bandiere lingua
```css
.lang-flag {
  /* Pulsante con SVG bandiera + abbreviazione testo */
}
.lang-flag.active {
  border-color: var(--brand);
  box-shadow: 0 0 0 4px var(--ring);
}
```

### Tile
```css
.tile {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 12px;
  text-align: center;
  min-width: 120px;
  max-width: 200px;
}
.tile img {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
}
.tile .word {
  font-weight: 600;
  margin-top: 8px;
}
```

### Badge grammaticali
```css
.badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f1f5f9;
}
```

### Pulsanti d'azione tile
```css
.tile-actions {
  display: none;  /* Nascosti di default */
}
.show-tile-actions .tile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
```

La classe `.show-tile-actions` viene aggiunta/rimossa dal container `#result` tramite il toggle in `app.js`.

### Overlay karaoke
```css
.karaoke-overlay {
  position: fixed;
  bottom: 0;
  width: 100%;
  background: rgba(0,0,0,0.9);
  color: white;
  z-index: 10000;
}
.karaoke-word.active {
  color: #fbbf24;
  font-weight: 700;
  animation: pulse 0.5s ease-in-out;
}
```

### Modal guide e esercizi
```css
.guide-modal {
  display: none;
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 10000;
}
```

## Breakpoint responsive

| Breakpoint | Modifiche principali |
|-----------|---------------------|
| `900px` | Toolbar diventa colonna, font ridotto |
| `720px` | Tile più piccole |
| `640px` | Pulsanti full-width |
| `480px` | Layout a colonna singola |
| `460px` | Riduzioni ulteriori |
| `360px` | Font minimo, padding ridotto |
| `340px` | Layout ultra-compatto |

## Regole per le modifiche

1. **Usare custom properties**: `var(--brand)` non `#2a9df4`.
2. **Min-height 44px** per tutti i target interattivi (WCAG 2.5.8).
3. **Focus visibile**: ogni elemento interattivo deve avere uno stile `:focus-visible`.
4. **Contrasto**: minimo 4.5:1 per testo normale, 3:1 per testo grande (>18px o >14px bold).
5. **No inline styles** in `index.html` per nuovi elementi (alcuni inline esistono per compatibilità storica).
6. **Responsive**: testare tutti i breakpoint quando si aggiungono nuovi componenti.
7. **Reduced motion**: disabilitare animazioni in `prefers-reduced-motion: reduce`.
8. **Forced colors**: fornire fallback in `forced-colors: active`.
