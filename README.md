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

## Routing

| Path | Page | Access |
|---|---|---|
| `/` | Homepage | Protected + Brand required |
| `/catalog` | Catalog list | Protected + Brand required |
| `/catalog/add-catalog` | Add single product | Protected + Brand required |
| `/catalog/add-bulk-catalog` | Bulk upload via Excel | Protected + Brand required |
| `/catalog/edit` | Edit product | Protected + Brand required |
| `/inventory/stock` | Stock inventory | Protected + Brand required |
| `/inventory/inward` | Inward inventory | Protected + Brand required |
| `/inventory/grn` | GRN inventory | Protected + Brand required |
| `/inventory/inward/entry` | Inward entry form | Protected |
| `/orders` | Orders | Protected + Brand required |
| `/brand/register` | Register a new brand | Protected |
| `/select-brand` | Select from multiple brands | Protected |
| `/login` | Login | Public (redirects if logged in) |
| `/signup` | Sign up | Public (redirects if logged in) |

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

## API Services

### `brandService.js`

| Function | Method | Endpoint | Description |
|---|---|---|---|
| `connectBrand` | GET | `/brand/connect` | Checks and connects brand to session |
| `connectBrandById` | GET | `/brand/connect/:id` | Connects a specific brand by ID |
| `registerBrand` | POST | `/brand/register` | Registers a new brand with POC details |
| `getNiches` | GET | `/request-niches` | Fetches available brand niches |
| `getUserProfile` | GET | `/user/profile` | Fetches logged-in user's profile (used for self-POC autofill) |

#### `POST /brand/register` — Request body

```json
{
  "brand": {
    "address": "221B Baker Street",
    "brand_name": "ABC Pvt Ltd",
    "city": "New Delhi",
    "esteyar": 2023,
    "pincode": "110025",
    "plan": "lite",
    "state": "Delhi"
  },
  "poc": {
    "access": "brand_member",
    "designation": "Manager",
    "email": "john@example.com",
    "name": "John Doe",
    "number": "9876543210",
    "password": "secret123",
    "self": false
  }
}
```

> If `poc.self` is `true`, the authenticated user is set as the Point of Contact and the `password` field is ignored.

---

### `catalogService.jsx`

| Function | Method | Endpoint | Description |
|---|---|---|---|
| `checkCatalogExists` | GET | `/catalog/products/if-exists` | Checks if any catalog exists |
| `getTopCategories` | GET | `/catalog/categories/top` | Fetches top-level taxonomy categories |
| `getNextCategories` | GET | `/catalog/categories/next/:id` | Fetches child categories |
| `getAttributeFields` | GET | `/catalog/categories/attributes/:id` | Fetches product attribute fields |
| `createCatalog` | POST | `/catalog/products/single` | Creates a single product listing |
| `getBulkExcelSheet` | GET | `/catalog/categories/bulk-excel-sheet` | Downloads bulk upload template (.xlsx) |
| `uploadBulkCatalog` | POST | `/catalog/products/bulk` | Uploads bulk catalog via Excel |
| `getProducts` | GET | `/catalog/products` | Lists all products |
| `getProduct` | GET | `/catalog/products/:id` | Fetches a single product |
| `markComplete` | PUT | `/catalog/products/:id/completed` | Marks a product as complete |
| `deleteProduct` | DELETE | `/catalog/products/:id` | Deletes a product |
| `updateProduct` | PUT | `/catalog/products/:id` | Updates product fields |
| `uploadImages` | POST | `/catalog/images` | Uploads product images |
| `getImage` | GET | `/catalog/images` | Fetches a product image by type |

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_BASEAPI` | Base URL for all API requests — ask the team for the value (no trailing slash) |

---

## Common Issues

### Session not persisting
Ensure the API server has CORS configured to allow credentials from the frontend origin and that cookies are set with the correct `SameSite` / `Secure` flags.

### `VITE_BASEAPI` not picked up
Restart the dev server after any `.env` change. All Vite env variables must be prefixed with `VITE_`.

### Redirected to `/brand/register` unexpectedly
The brand guard in `Layout` calls `GET /brand/connect` on every fresh page load. If the API returns `201` with `brands: null`, the redirect is intentional — the logged-in user has no brand registered yet.

---

*Hooter Frontend — last updated September 2026*