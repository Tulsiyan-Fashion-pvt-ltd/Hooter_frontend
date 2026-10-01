# Toast Notification System

A lightweight, reusable toast notification system for the Hooter frontend. Consists of a **`useToast`** hook that manages state and a **`Toast`** component that handles rendering. Together they can be dropped into any page with two lines of setup.

---



## File Structure

```
src/
├── hooks/
│   └── useToast.js                   # State + timer logic
├── components/
│   └── Toast.jsx                     # Visual render component
└── css/
    └── components/
        └── Toast.module.css          # Scoped styles + animation
```

---



## Quick Start

```jsx
import useToast  from '../hooks/useToast';
import Toast     from '../components/Toast';

export default function MyPage() {
  const { toast, showToast } = useToast();

  return (
    <div>
      <button onClick={() => showToast("Saved successfully!", "green")}>
        Save
      </button>

      {/* Place once, at the bottom of the JSX tree */}
      <Toast toast={toast} />
    </div>
  );
}
```

---



## API Reference

### `useToast(duration?)` — Hook

**Import**
```js
import useToast from '../hooks/useToast';
```

**Signature**
```ts
useToast(duration?: number): { toast: ToastState, showToast: ShowToastFn }
```

**Parameters**

| Parameter  | Type     | Default | Description                          |
|------------|----------|---------|--------------------------------------|
| `duration` | `number` | `4000`  | Auto-dismiss delay in milliseconds.  |

**Returns**

| Value       | Type                                      | Description                                                   |
|-------------|-------------------------------------------|---------------------------------------------------------------|
| `toast`     | `{ message, type, visible }`              | Current toast state. Pass directly as a prop to `<Toast />`.  |
| `showToast` | `(message: string, type: string) => void` | Call to trigger a new toast notification.                     |

**`toast` State Shape**

| Field     | Type      | Description                                          |
|-----------|-----------|------------------------------------------------------|
| `message` | `string`  | The text displayed inside the toast.                 |
| `type`    | `string`  | Colour variant — `"green"`, `"yellow"`, or `"red"`.  |
| `visible` | `boolean` | Whether the toast is currently shown.                |

**Behaviour Notes**
- Calling `showToast` while a toast is already visible **cancels** the existing auto-dismiss timer and restarts it from zero. This means rapid successive calls always give the user a full `duration` window to read the latest message.
- The hook is **self-contained** — each component that calls `useToast()` gets its own isolated toast state. There is no shared global state.

---

### `<Toast toast={toast} />` — Component

**Import**
```jsx
import Toast from '../components/Toast';
```

**Signature**
```tsx
<Toast toast={ToastState} />
```

**Props**

| Prop    | Type         | Required | Description                                |
|---------|--------------|----------|--------------------------------------------|
| `toast` | `ToastState` | Yes      | The state object returned by `useToast()`. |

**Behaviour Notes**
- Returns `null` when `toast.visible` is `false` — **zero DOM overhead** when inactive.
- Positioned `fixed` at the **bottom-right** of the viewport (`z-index: 9999`).
- `pointer-events: none` — the toast never blocks clicks on page content beneath it.
- Slides up with a `0.3s ease` animation on every appearance.

---



## Variants

The `type` argument passed to `showToast` controls the colour and icon.

| `type`     | Colour     | Hex       | Icon | Intended Use                            |
|------------|------------|-----------|------|-----------------------------------------|
| `"green"`  | Dark green | `#2e7d32` | `✓`  | Success — action completed as expected. |
| `"yellow"` | Amber      | `#d97706` | `⚠`  | Warning — something needs attention.    |
| `"red"`    | Crimson    | `#c62828` | `✕`  | Error — action failed or is blocked.    |

---



## Usage Examples

### Success — after a form submit
```js
showToast("Catalog added successfully!", "green");
```

### Warning — validation nudge
```js
showToast("Give your custom image a name before adding another", "yellow");
```

### Error — blocking action
```js
showToast("Upload at least 1 image to submit", "red");
```

### Custom duration — longer display
```js
const { toast, showToast } = useToast(7000); // stays visible for 7 seconds
```

---



## Styling

Styles live in `src/css/components/Toast.module.css`.

| Class          | Applied to         | Description                              |
|----------------|--------------------|------------------------------------------|
| `.toast`       | Root wrapper `div` | Base layout, positioning, and animation. |
| `.toastIcon`   | Icon `span`        | Icon sizing and alignment.               |
| `.toastGreen`  | Root wrapper `div` | Green background for success variant.    |
| `.toastYellow` | Root wrapper `div` | Amber background for warning variant.    |
| `.toastRed`    | Root wrapper `div` | Crimson background for error variant.    |

To adjust colours or position, edit `Toast.module.css` — all pages using the component will update automatically.

---



## Where It Is Currently Used

| Page / Component   | File                            |
|--------------------|---------------------------------|
| Add Single Catalog | `src/pages/add-catalog.jsx`     |

---



## Extension Guide

### Adding a new variant

**1. Add a CSS class in `Toast.module.css`:**
```css
.toastBlue { background: #1565c0; }
```

**2. Update the colour mapping in `Toast.jsx`:**
```jsx
const colorClass =
  toast.type === 'green'  ? styles.toastGreen  :
  toast.type === 'yellow' ? styles.toastYellow :
  toast.type === 'blue'   ? styles.toastBlue   :
                            styles.toastRed;
```

**3. Update the icon mapping in `Toast.jsx`:**
```jsx
const icon =
  toast.type === 'green'  ? '✓' :
  toast.type === 'yellow' ? '⚠' :
  toast.type === 'blue'   ? 'ℹ' :
                            '✕';
```

### Changing the dismiss duration globally

Edit the default parameter in `useToast.js`:
```js
export default function useToast(duration = 6000) { // was 4000
```

### Changing the dismiss duration per page

Pass a custom value when calling the hook:
```js
const { toast, showToast } = useToast(8000); // 8 seconds for this page only
```

---

## Design Decisions

| Decision | Rationale |
|---|---|
| **Hook + Component split** | Separates logic from rendering — the hook can be tested in isolation, and the component is a pure presentational layer. |
| **`null` return when not visible** | Keeps the DOM clean; avoids using CSS `display: none` which would require extra specificity overrides. |
| **Timer cancellation on rapid calls** | Prevents stale toasts from disappearing too early when multiple events fire in quick succession (e.g. image upload → validation error). |
| **`pointer-events: none`** | The toast never intercepts clicks, so it is safe to render even when it overlaps action buttons. |
| **Isolated state per hook call** | No global store needed. Avoids cross-page state leakage and keeps the system simple. |
