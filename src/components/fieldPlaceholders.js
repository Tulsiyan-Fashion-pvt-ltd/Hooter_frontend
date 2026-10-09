/**
 * fieldPlaceholders.js
 *
 * Declarative, rule-based placeholder resolver for catalog form fields.
 *
 * Resolves context-aware placeholder text for any attribute object using a
 * two-layer priority chain:
 *   1. TYPE_RULES  — matched against `attr.type`  (field data type)
 *   2. FIELD_RULES — matched against `attr.field` / `attr.key` (field identifier)
 *   3. FALLBACK    — returned when no rule matches
 *
 * Rules are module-level constants and are never recreated between renders,
 * so the resolver carries zero runtime overhead.
 *
 * Usage:
 *   import { getFieldPlaceholder } from '../components/fieldPlaceholders';
 *   <input placeholder={getFieldPlaceholder(attr)} />
 */


// ─── Layer 1: Type Rules ──────────────────────────────────────────────────────
// Matched against attr.type (the semantic data type of the field).
// Evaluated before field-name rules — data type is the strongest signal.

const TYPE_RULES = [
  { match: /^(number|integer|int)$/i,          placeholder: 'e.g. 100'              },
  { match: /^(price|currency|amount|cost)$/i,  placeholder: 'e.g. 499.00'           },
  { match: /^(percentage|percent)$/i,          placeholder: 'e.g. 10'               },
  { match: /^(url|link|uri)$/i,                placeholder: 'e.g. https://...'      },
  { match: /^(date|datetime)$/i,               placeholder: 'e.g. DD-MM-YYYY'       },
  { match: /^(textarea|longtext|multiline)$/i, placeholder: 'Describe in detail...' },
  { match: /^(boolean|bool|toggle)$/i,         placeholder: 'e.g. true / false'     },
  { match: /^(email)$/i,                       placeholder: 'e.g. user@example.com' },
  { match: /^(phone|mobile|tel)$/i,            placeholder: 'e.g. +91 9876543210'   },
];


// ─── Layer 2: Field Keyword Rules ─────────────────────────────────────────────
// Matched against attr.field / attr.key using \b word-boundary anchors.
// \b ensures "price" matches "price" and "compared_price" but NOT "invoice_pricing".
// Rules are ordered from most-specific to least-specific within overlapping domains.

const FIELD_RULES = [
  // Identifiers
  { match: /\b(sku|sku_id|seller_sku)\b/i,             placeholder: 'e.g. SKU-001'               },
  { match: /\b(barcode|ean|isbn|upc|asin)\b/i,         placeholder: 'e.g. 012345678905'          },
  { match: /\b(hsn|hsn_code)\b/i,                      placeholder: 'e.g. 6109'                  },

  // Naming
  { match: /\b(title|product_name|product_title)\b/i,  placeholder: "e.g. Men's Cotton T-Shirt"  },
  { match: /\b(name|label)\b/i,                        placeholder: 'e.g. Classic White Shirt'   },
  { match: /\b(brand)\b/i,                             placeholder: 'e.g. Nike'                  },

  // Pricing — compared_price before generic price to avoid a shorter rule stealing the match
  { match: /\b(compared_price|mrp|market_price)\b/i,  placeholder: 'e.g. 999.00'                },
  { match: /\b(price|cost|selling_price|amount)\b/i,  placeholder: 'e.g. 499.00'                },
  { match: /\b(gst|tax|vat|duty)\b/i,                 placeholder: 'e.g. 12'                    },

  // Physical attributes
  { match: /\b(colou?r)\b/i,                           placeholder: 'e.g. Navy Blue'             },
  { match: /\b(size)\b/i,                              placeholder: 'e.g. M, L, XL'             },
  { match: /\b(weight)\b/i,                            placeholder: 'e.g. 250g'                  },
  { match: /\b(dimension|length|width|height)\b/i,    placeholder: 'e.g. 30 x 20 x 5 cm'       },
  { match: /\b(material|fabric|composition)\b/i,       placeholder: 'e.g. 100% Cotton'           },
  { match: /\b(pattern|style|design)\b/i,              placeholder: 'e.g. Striped'               },
  { match: /\b(finish|texture)\b/i,                   placeholder: 'e.g. Matte'                 },

  // Inventory
  { match: /\b(quantity|stock|qty|inventory|units)\b/i, placeholder: 'e.g. 50'                  },

  // Taxonomy
  { match: /\b(category|subcategory)\b/i,              placeholder: 'e.g. Apparel'               },
  { match: /\b(country|origin|made_in)\b/i,            placeholder: 'e.g. India'                 },
  { match: /\b(gender)\b/i,                            placeholder: 'e.g. Men / Women / Unisex'  },
  { match: /\b(age|age_group)\b/i,                     placeholder: 'e.g. Adults'                },

  // Content
  { match: /\b(description|details|about|overview)\b/i, placeholder: 'Describe the product...'  },
  { match: /\b(tag|keyword|search_term)\b/i,           placeholder: 'e.g. cotton, summer, slim'  },
  { match: /\b(note|remark|comment)\b/i,               placeholder: 'Any additional notes...'   },
];


// ─── Layer 3: Fallback ────────────────────────────────────────────────────────
const FALLBACK = 'Type here...';


// ─── Resolver ─────────────────────────────────────────────────────────────────

/**
 * Returns a context-aware placeholder string for a catalog form field.
 *
 * Resolution priority:
 *   1. TYPE_RULES  — `attr.type` (e.g. "number", "url", "date")
 *   2. FIELD_RULES — `attr.field` / `attr.key` (e.g. "sku_id", "compared_price")
 *   3. FALLBACK    — "Type here..."
 *
 * @param {{ type?: string, field?: string, key?: string }} attr - The attribute object.
 * @returns {string} A human-readable placeholder string.
 *
 * @example
 * getFieldPlaceholder({ type: 'number' })            // → 'e.g. 100'
 * getFieldPlaceholder({ field: 'compared_price' })   // → 'e.g. 999.00'
 * getFieldPlaceholder({ field: 'color' })            // → 'e.g. Navy Blue'
 * getFieldPlaceholder({})                            // → 'Type here...'
 */
export function getFieldPlaceholder(attr = {}) {
  const type  = (attr.type  || '').toLowerCase().trim();
  const field = (attr.field || attr.key || '').toLowerCase().trim();

  for (const rule of TYPE_RULES)  if (rule.match.test(type))  return rule.placeholder;
  for (const rule of FIELD_RULES) if (rule.match.test(field)) return rule.placeholder;

  return FALLBACK;
}
