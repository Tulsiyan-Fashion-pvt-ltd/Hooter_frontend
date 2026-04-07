const BASE_URL = import.meta.env.VITE_BASEAPI;

// ── Existing ─────────────────────────
export const checkCatalogExists = async () => {
  const response = await fetch(`${BASE_URL}/catalog/if-exists`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { catalog: "available" | "unavailable" }
};

// ── New ───────────────────────────────

// Step 1 on catalog page: fetch entire niche tree in one call
export const getNicheData = async () => {
  const response = await fetch(`${BASE_URL}/catalog/niche-data`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { niche_data: { ... } }
};

// Step 2: once product type is selected, fetch its dynamic fields
export const getAttributeFields = async (typeId) => {
  const response = await fetch(`${BASE_URL}/catalog/attribute-fields?type=${typeId}`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { field_attributes: {...}, image_attributes: {...} }
};

// Step 3: final submit — fixed fields + dynamic fields
export const createCatalog = async (payload) => {
  const response = await fetch(`${BASE_URL}/catalog/single-catalog`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { Status: "successful", message: "..." }
};