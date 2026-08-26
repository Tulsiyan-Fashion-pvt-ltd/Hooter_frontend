const BASE_URL = import.meta.env.VITE_BASEAPI;

// ── Existing ─────────────────────────
export const checkCatalogExists = async () => {
  const response = await fetch(`${BASE_URL}/catalog/products/if-exists`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { catalog: "available" | "unavailable" }
};

// ── Category drill-down (replaces getNicheData) ─────────

// Step 1: fetch top-level categories (call this when the page/selector loads)
export const getTopCategories = async () => {
  const response = await fetch(`${BASE_URL}/catalog/categories/top`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { level0: [ { id, name, full_name, vertical }, ... ] }
};

// Step 2: fetch the next level, once the user picks a category
// pass in the whole category object the user clicked (needs id + vertical)
export const getNextCategories = async (categoryId, vertical) => {
  const response = await fetch(
    `${BASE_URL}/catalog/categories/next?id=${categoryId}&vertical=${vertical}`,
    { credentials: "include" },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { next: [ { id, name, full_name, level }, ... ] }
};

// ── Attribute fields (replaces getAttributeFields) ───────
export const getAttributeFields = async (typeId, vertical) => {
  const response = await fetch(
    `${BASE_URL}/catalog/categories/attributes?type-id=${typeId}&vertical=${vertical}`,
    { credentials: "include" },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
  // { listing_attributes: [...], category_attributes: [...], image_attributes: [...] }
};

// ── Create catalog (payload restructured) ────────────────
export const createCatalog = async (
  typeId,
  listingAttributes,
  categoryAttributes,
) => {
  const response = await fetch(
    `${BASE_URL}/catalog/products/single?type-id=${typeId}`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listing_attributes: listingAttributes,
        category_attributes: categoryAttributes,
      }),
    },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { Status: "successful", message: "..." }
};

// ── Bulk excel sheet (template download) ──────────────────
// Returns a Blob (.xlsx) — caller is responsible for turning it into a
// download (e.g. via URL.createObjectURL) since there's no JSON body here.
export const getBulkExcelSheet = async (typeId, vertical) => {
  const response = await fetch(
    `${BASE_URL}/catalog/categories/bulk-excel-sheet?type-id=${typeId}&vertical=${vertical}`,
    { credentials: "include" },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.blob();
};

// ── Bulk catalog upload ────────────────────────────────────
// NOTE: the API's success/failure responses aren't uniformly JSON:
//   200            -> { status: "ok" }
//   422 (partial)  -> an .xlsx file (rows that failed validation)
//   422 (total)    -> { status: "failed", msg: "..." }
// So we branch on content-type instead of just response.ok / response.json().
export const uploadBulkCatalog = async (typeId, file) => {
  const formData = new FormData();
  formData.append("sheet", file);

  const response = await fetch(
    `${BASE_URL}/catalog/products/bulk?type-id=${typeId}`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );

  const contentType = response.headers.get("content-type") || "";

  if (response.status === 422 && !contentType.includes("application/json")) {
    // Partial failure: server sent back an .xlsx of the bad rows.
    const blob = await response.blob();
    return { status: "partial-failure", failedRowsBlob: blob };
  }

  const data = await response.json();

  if (!response.ok) {
    // Total failure case: { status: "failed", msg: "..." }
    throw new Error(data.msg || `HTTP ${response.status}`);
  }

  return data; // { status: "ok" }
};

// ── Products list / detail / lifecycle ─────────────────────
export const getProducts = async () => {
  const response = await fetch(`${BASE_URL}/catalog/products`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { count: {...}, "catalog-list": [...] }
};

export const getProduct = async (uskuId) => {
  const response = await fetch(`${BASE_URL}/catalog/products/${uskuId}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { count: {...}, "catalog-list": [ {...} ] }
};

export const markComplete = async (uskuId) => {
  const response = await fetch(
    `${BASE_URL}/catalog/products/${uskuId}/completed`,
    {
      method: "PUT",
      credentials: "include",
    },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { status: "successful", msg: "..." }
};

export const deleteProduct = async (uskuId) => {
  const response = await fetch(`${BASE_URL}/catalog/products/${uskuId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { status: "successful", msg: "..." }
};

// data = flat key/value product fields (already using "_" delimiters per API)
export const updateProduct = async (uskuId, categoryId, data) => {
  const response = await fetch(
    `${BASE_URL}/catalog/products/${uskuId}?id=${categoryId}`,
    {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { status: "successful", msg: "updated successfully" }
};

// ── Images ───────────────────────────────────────────────
// files: array of File objects
// meta: object keyed by filename -> { image_order, image_type }
//   e.g. { "front.jpg": { image_order: 0, image_type: "front" } }
// Build this alongside the file input's onChange in the calling component,
// using file.name as the key so it lines up with what's appended below.
export const uploadImages = async (uskuId, files, meta) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("image", file));
  formData.append("meta", JSON.stringify(meta));

  const response = await fetch(`${BASE_URL}/catalog/images?usku-id=${uskuId}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { status: "successful", message: "image uploaded" }
};

export const getImage = async (uskuId, imageType) => {
  const response = await fetch(
    `${BASE_URL}/catalog/images?usku-id=${uskuId}&image-type=${imageType}`,
    { credentials: "include" },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data.status === "failed") throw new Error(data.msg);
  return data; // { high_resol_webp, low_resol_webp, original, webp_card }
};
