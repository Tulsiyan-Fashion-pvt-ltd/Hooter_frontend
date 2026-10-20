# Toast Notification System

A lightweight, reusable toast notification system for the Hooter frontend. Consists of a global `toastContext` context that manages `showToast` state which takes string message and enum type values e.i "green", "red", "yellow"
to display success, error and notifications respectively.
---


## Quick Start

```jsx
import toastContext  from '../appContext';
import {useContext} from 'react';

export default function MyPage() {
  const showToast = useContext(toastContext);

  return (
    <div>
      <button onClick={() => showToast("Saved successfully!", "green")}>
        Save
      </button>

    </div>
  );
}
```

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


