# Field Placeholder Resolver

A lightweight, declarative utility for resolving context-aware placeholder text for catalog form fields. Designed as a **pure function** that lives in `components/` and can be imported by any page or component that renders catalog attribute inputs.

---



## File Structure

```
src/
└── components/
    └── fieldPlaceholders.js     # Rule tables + getFieldPlaceholder resolver
Documentation/
└── FieldPlaceholders.md         # This file
```

---



## Quick Start

```jsx
import { getFieldPlaceholder } from '../components/fieldPlaceholders';

// Inside any attribute map:
<input placeholder={getFieldPlaceholder(attr)} />

// With a field-only object:
<input placeholder={getFieldPlaceholder({ field: 'sku_id' })} />

// With both type and field (type wins):
<input placeholder={getFieldPlaceholder({ type: 'number', field: 'quantity' })} />
```

---



## API Reference

### `getFieldPlaceholder(attr)` — Function

**Import**
```js
import { getFieldPlaceholder } from '../components/fieldPlaceholders';
```

**Signature**
```ts
getFieldPlaceholder(attr?: { type?: string, field?: string, key?: string }): string
```

**Parameters**

| Parameter    | Type     | Required | Description                                                                    |
|--------------|----------|----------|--------------------------------------------------------------------------------|
| `attr`       | `Object` | No       | The attribute object from the API or hook. Defaults to `{}`.                  |
| `attr.type`  | `string` | No       | Semantic data type of the field (e.g. `"number"`, `"url"`, `"date"`).        |
| `attr.field` | `string` | No       | snake_case field identifier (e.g. `"sku_id"`, `"compared_price"`).           |
| `attr.key`   | `string` | No       | Alias for `attr.field`. Used if `attr.field` is absent.                       |

**Returns**

| Type     | Description                                                             |
|----------|-------------------------------------------------------------------------|
| `string` | A human-readable placeholder string ready to pass to an `<input />`.  |

**Behaviour Notes**
- Matching is **case-insensitive** — `"Number"`, `"NUMBER"`, and `"number"` all match.
- Field matching uses **`\b` word-boundary regex** so `"price"` matches `"compared_price"` and `"selling_price"` but not `"invoice_pricing"`.
- Calling with an empty object `{}` or no argument safely returns the fallback `"Type here..."`.
- The rule arrays are **module-level constants** — they are never recreated between renders, so there is zero runtime overhead.

---



## Resolution Priority

Placeholders are resolved in a strict 3-layer priority chain. The first matching rule wins and evaluation stops immediately.

```
attr.type  →  TYPE_RULES   (Layer 1 — highest priority)
    ↓ no match
attr.field →  FIELD_RULES  (Layer 2)
    ↓ no match
             "Type here..." (Layer 3 — fallback)
```

---



## TYPE_RULES Reference

Matched against `attr.type`. Type is treated as the strongest signal because it describes *what kind of data* belongs in the field, regardless of its name.

| Pattern                          | Placeholder           | Matched Types                              |
|----------------------------------|-----------------------|--------------------------------------------|
| `number`, `integer`, `int`       | `e.g. 100`            | Whole numbers                              |
| `price`, `currency`, `amount`, `cost` | `e.g. 499.00`    | Monetary decimal values                    |
| `percentage`, `percent`          | `e.g. 10`             | Percentage values                          |
| `url`, `link`, `uri`             | `e.g. https://...`    | URL / hyperlink fields                     |
| `date`, `datetime`               | `e.g. DD-MM-YYYY`     | Date inputs                                |
| `textarea`, `longtext`, `multiline` | `Describe in detail...` | Long free-text fields                 |
| `boolean`, `bool`, `toggle`      | `e.g. true / false`   | Binary flag fields                         |
| `email`                          | `e.g. user@example.com` | Email address fields                     |
| `phone`, `mobile`, `tel`         | `e.g. +91 9876543210` | Phone number fields                        |

---



## FIELD_RULES Reference

Matched against `attr.field` / `attr.key` using regex with `\b` word boundaries. Ordered from most-specific to least-specific within overlapping domains to prevent shorter patterns from stealing matches.

### Identifiers

| Pattern                     | Placeholder           |
|-----------------------------|-----------------------|
| `sku`, `sku_id`, `seller_sku` | `e.g. SKU-001`     |
| `barcode`, `ean`, `isbn`, `upc`, `asin` | `e.g. 012345678905` |
| `hsn`, `hsn_code`           | `e.g. 6109`           |

### Naming

| Pattern                              | Placeholder                     |
|--------------------------------------|---------------------------------|
| `title`, `product_name`, `product_title` | `e.g. Men's Cotton T-Shirt` |
| `name`, `label`                      | `e.g. Classic White Shirt`      |
| `brand`                              | `e.g. Nike`                     |

### Pricing

> `compared_price` / `mrp` rules are listed **before** the generic `price` rule intentionally. If `price` came first its pattern would match `compared_price` and return the wrong placeholder.

| Pattern                                     | Placeholder    |
|---------------------------------------------|----------------|
| `compared_price`, `mrp`, `market_price`     | `e.g. 999.00`  |
| `price`, `cost`, `selling_price`, `amount`  | `e.g. 499.00`  |
| `gst`, `tax`, `vat`, `duty`                 | `e.g. 12`      |

### Physical Attributes

| Pattern                            | Placeholder               |
|------------------------------------|---------------------------|
| `color`, `colour`                  | `e.g. Navy Blue`          |
| `size`                             | `e.g. M, L, XL`          |
| `weight`                           | `e.g. 250g`               |
| `dimension`, `length`, `width`, `height` | `e.g. 30 x 20 x 5 cm` |
| `material`, `fabric`, `composition` | `e.g. 100% Cotton`       |
| `pattern`, `style`, `design`       | `e.g. Striped`            |
| `finish`, `texture`                | `e.g. Matte`              |

### Inventory

| Pattern                                   | Placeholder |
|-------------------------------------------|-------------|
| `quantity`, `stock`, `qty`, `inventory`, `units` | `e.g. 50` |

### Taxonomy

| Pattern                      | Placeholder                   |
|------------------------------|-------------------------------|
| `category`, `subcategory`    | `e.g. Apparel`                |
| `country`, `origin`, `made_in` | `e.g. India`                |
| `gender`                     | `e.g. Men / Women / Unisex`   |
| `age`, `age_group`           | `e.g. Adults`                 |

### Content

| Pattern                              | Placeholder                       |
|--------------------------------------|-----------------------------------|
| `description`, `details`, `about`, `overview` | `Describe the product...` |
| `tag`, `keyword`, `search_term`      | `e.g. cotton, summer, slim`       |
| `note`, `remark`, `comment`          | `Any additional notes...`         |

---



## Usage Examples

### Listing attribute — type signal wins
```jsx
// attr = { type: 'number', field: 'quantity' }
getFieldPlaceholder(attr) // → 'e.g. 100'  (TYPE_RULES matched first)
```

### Listing attribute — field keyword fallback
```jsx
// attr = { type: 'text', field: 'sku_id' }
getFieldPlaceholder(attr) // → 'e.g. SKU-001'
```

### Pricing precision — compared_price before price
```jsx
getFieldPlaceholder({ field: 'compared_price' }) // → 'e.g. 999.00'
getFieldPlaceholder({ field: 'price' })          // → 'e.g. 499.00'
```

### Discount field (read-only, hardcoded separately)
```jsx
// The discount field is auto-calculated and read-only.
// It should NOT use getFieldPlaceholder — use a hardcoded string instead:
placeholder={key === 'discount' ? 'Auto-calculated' : getFieldPlaceholder(attr)}
```

### Unknown field — fallback
```jsx
getFieldPlaceholder({ field: 'internal_ref_x9' }) // → 'Type here...'
getFieldPlaceholder()                              // → 'Type here...'
```

---



## Where It Is Currently Used

| Page / Component   | File                            | Fields                                   |
|--------------------|---------------------------------|------------------------------------------|
| Add Single Catalog | `src/pages/add-catalog.jsx`     | Listing Information, Product Attributes  |

---



## Extension Guide

### Adding a new type rule

Add an entry to the `TYPE_RULES` array in `fieldPlaceholders.js`:

```js
const TYPE_RULES = [
  // ... existing rules ...
  { match: /^(color|colour)$/i, placeholder: 'e.g. #FF5733 or Navy Blue' },
];
```

### Adding a new field keyword rule

Add an entry to the `FIELD_RULES` array. Always use `\b` word boundaries and place more-specific patterns **above** broader ones in the same domain:

```js
const FIELD_RULES = [
  // ... existing rules ...
  { match: /\b(warranty|guarantee)\b/i, placeholder: 'e.g. 1 Year Manufacturer Warranty' },
];
```

### Overriding for a specific field in a component

If a single field needs a one-off placeholder that doesn't warrant a new rule, override at the call site:

```jsx
placeholder={
  key === 'discount'
    ? 'Auto-calculated'
    : getFieldPlaceholder(attr)
}
```

---



## Design Decisions

| Decision | Rationale |
|---|---|
| **Declarative rule tables** | Rules are data, not code — adding, removing, or reordering a rule requires no changes to the resolver logic. |
| **Two-layer priority (type → field)** | Field data type is a stronger, more explicit signal than field name. A field named `"weight"` typed as `"number"` should still show `e.g. 100`, not `e.g. 250g`. |
| **Regex with `\b` word boundaries** | Prevents shorter patterns from accidentally matching longer field names (e.g. `price` should not match `invoice_pricing`). Simple `.includes()` checks would cause subtle false positives. |
| **Specific before generic ordering** | `compared_price` must appear before `price` in FIELD_RULES; otherwise the `price` pattern would match first and return the wrong placeholder. |
| **Module-level constants** | `TYPE_RULES` and `FIELD_RULES` are defined once at import time — never recreated per render. Pure function with no side effects or React dependencies. |
| **Placed in `components/`** | Keeps it close to the UI layer it serves, clearly signals that it is part of the frontend presentation system, and makes it straightforward to discover alongside the components that import it. |
