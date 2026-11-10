# `.tiles` — Global Stat Tile Standard

A single global CSS class that enforces a **unified visual appearance** for every overview / KPI stat card across the application. All pages (Catalog, Inventory, Orders, Homepage) must add this class to their stat card root elements.

---

## Why It Exists

Before this was introduced, every page had its own independently written card styles:
This made cards look inconsistent — different border colours, radii, shadow intensities, and hover behaviours across the same product.

> **The fix:** One class. Same look. Everywhere.
---

## Quick Start

Add `tiles` as a **global class** alongside any existing local module class on the stat card root `<div>`:

```jsx
// With a CSS Module class
<div className={`${styles.card} tiles`}>...</div>

// With multiple module classes
<div className={`${styles.kpiCard} tiles`}>...</div>
```

> **No need to remove or change the local module class.** The local class handles layout (width, flex, grid). The `tiles` class handles appearance only.

---

## What `.tiles` Controls

```css
.tiles {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.tiles:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}
```

| Property        | Value                               | Purpose                               |
|-----------------|-------------------------------------|---------------------------------------|
| `background`    | `#ffffff`                           | Always white surface                  |
| `border`        | `1px solid #e2e8f0`                 | Subtle consistent border              |
| `border-radius` | `12px`                              | Rounded corners, same everywhere      |
| `padding`       | `18px 20px`                         | Standard internal spacing             |
| `box-shadow`    | `0 1px 3px rgba(0,0,0,0.04)`       | Slight depth                           |
| `transition`    | `box-shadow + transform 0.15s ease` | Smooth hover animation                |
| `:hover`        | Lifted shadow + 1px upward nudge   | Consistent interactive feedback        |

### What It Does NOT Control

- **Width / flex / grid** — layout stays owned by each page's module CSS
- **Font sizes, colours** — label/value typography stays owned by each page's module CSS
- **Icon boxes, badges** — internal card content is untouched

---

## Where It Is Applied

| File | Element | Local Class Used With `tiles` |
|------|---------|-------------------------------|
| `src/pages/catalog.jsx` | 3 overview stat cards | `styles.card` |
| `src/pages/homepage.jsx` | 6 KPI cards (mapped) | `styles.kpiCard` |
| `src/pages/orders.jsx` | 5 order summary cards | `styles.kpiCard` |
| `src/components/StatCardsRow.jsx` | All inventory stat cards (Stock + GRN) | `styles.statCard` |

---

## File Location

The class lives in the global stylesheet, which is imported at the app root:

```
src/
└── index.css    ← .tiles is defined here (globally available, no import needed)
```

Because `index.css` is imported at the top of the app, `.tiles` is **automatically available** in every JSX file — no extra import required.

---

## Rules for New Pages

When you build a new page or feature that shows stat / overview / KPI cards:

1. **Always add `tiles`** to the card root `<div>`.
2. **Keep your local module class** for layout (width, margin, flex, grid).
3. **Do not redefine** `background`, `border`, `border-radius`, `padding`, `box-shadow`, or `transition` in your local class — let `.tiles` handle those.
4. If you genuinely need a one-off override (e.g. a coloured border), add it in your local class **after** `.tiles` so it wins the cascade.

```jsx
// ✅ Correct — local class handles layout, tiles handles appearance
<div className={`${styles.myCard} tiles`}>

// ❌ Avoid — duplicating appearance properties in the local class
// (they'll conflict with tiles and cause inconsistencies)
```

---

## Extension Guide

### Changing the standard appearance

Edit `.tiles` in `src/index.css`. The change will propagate to **every** stat card in the app immediately.

```css
/* Example: increase border radius globally */
.tiles {
  border-radius: 16px; /* was 12px */
}
```

### Adding a colour-variant modifier

If a card needs a coloured left-border accent, add a companion global modifier class — do not break `.tiles` itself:

```css
/* In index.css */
.tiles-accent-blue {
  border-left: 3px solid #2563eb;
}
```

```jsx
<div className={`${styles.card} tiles tiles-accent-blue`}>
```

