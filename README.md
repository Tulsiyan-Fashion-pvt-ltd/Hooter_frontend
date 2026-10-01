# Hooter — Brand Management Frontend

A React-based dashboard for brand registration, catalog management, inventory tracking, and order management. Built with Vite and backed by the Hooter REST API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 7 |
| State Management | Redux Toolkit + React-Redux |
| Routing | React Router v7 |
| Charts | Recharts |
| Styling | CSS Modules |
| Auth | Session cookies (HTTP-only) |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
VITE_BASEAPI=https://your-api-url.com
```

> Ask the team for the correct API base URL for staging or production.

### 3. Run the dev server

```bash
npm run dev
```

### Other scripts

```bash
npm run build    # Production build
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

---

## Project Structure

```
src/
├── pages/              # Route-level page components
│   ├── login.jsx
│   ├── signup.jsx
│   ├── register.jsx         # Brand registration form
│   ├── select-brand.jsx     # Brand selector (multi-brand accounts)
│   ├── homepage.jsx
│   ├── catalog.jsx
│   ├── add-catalog.jsx
│   ├── add-bulk-catalog.jsx
│   ├── edit-catalog.jsx
│   ├── inventory.jsx
│   ├── inward-entry.jsx
│   └── orders.jsx
│
├── services/           # API call functions (fetch wrappers)
│   ├── brandService.js
│   └── catalogService.jsx
│
├── store/              # Redux store
│   ├── store.js
│   └── slices/
│       ├── authSlice.js
│       └── brandSlice.js
│
├── modules/            # Shared logic
│   ├── auth.jsx        # Protect / PreventAuth guards
│   └── validate.jsx
│
├── components/         # Reusable UI components
│   ├── sidebar.jsx
│   ├── spinner.jsx
│   ├── GridTable.jsx
│   ├── CatalogSelector.jsx
│   └── ...
│
├── css/                # CSS Modules
├── assets/
├── App.jsx             # Route definitions
├── layout.jsx          # Protected layout with brand guard
└── main.jsx
```

---

## Auth & Brand Flow

### Authentication guard (`Protect`)

All protected routes are wrapped in the `Protect` component (`src/modules/auth.jsx`). On every render it calls `GET /users/session` to verify the session cookie. Unauthenticated users are redirected to `/login`.

### Brand guard (`Layout`)

Every protected page that sits inside the main layout (sidebar + outlet) also goes through a brand connection check on mount:

```
GET /brand/connect
  ├── 200 (connected)           → render the page normally
  ├── 201 + brands: null        → redirect to /brand/register
  ├── 201 + brands: [...]       → redirect to /select-brand
  └── 401                       → handled by Protect (redirect to /login)
```

This means a logged-in user who hasn't registered a brand can never access the dashboard — they are always redirected to `/brand/register` first.

---

## Security (CSRF)

The API requires an `X-CSRF-Token` header for state-modifying requests (and some protected GET requests). The token is fetched automatically and stored in the Redux store.

### How to use the CSRF token in API calls

If you are writing a plain JavaScript service file (e.g., inside `src/services/`), you can access the token directly from the Redux store:

```javascript
import { store } from "../store/store";

const getCSRFToken = () => {
  const state = store.getState();
  return state.csrf.csrf;
};

// Example usage:
const response = await fetch(`${BASE_URL}/some/endpoint`, {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "X-CSRF-Token": getCSRFToken(),
  },
  body: JSON.stringify(data),
});
```

---


## Reusable components