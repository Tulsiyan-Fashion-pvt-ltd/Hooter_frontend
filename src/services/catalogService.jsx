import { store } from "../store/store";
const BASE_URL = import.meta.env.VITE_BASEAPI;

const getCSRFToken = async () => {
  let csrf = store.getState()?.csrf?.csrf;
  if (!csrf) {
    try {
      const res = await fetch(`${BASE_URL}/security/csrf`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        csrf = data.csrf_token;
      }
    } catch (e) {
      console.warn("Could not fetch CSRF token:", e);
    }
  }
  return csrf;
};



// ── Existing ─────────────────────────
export const checkCatalogExists = async () => {
  const response = await fetch(`${BASE_URL}/catalog/products/if-exists`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { catalog: "available" | "unavailable" }
};

export const getErrorSheet = async (jobId) => {
  const response = await fetch(
    `${BASE_URL}/catalog/products/error_sheet/${jobId}`,
    {
      credentials: "include",
    },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.blob();
};

/**
 * Fetches the top-level taxonomy categories used to start category selection.
 * Each category includes an ID and vertical index for subsequent requests.
 *
 * @returns {Promise<{level0: Array}>} Top-level category options.
 */
let topCategoriesCache = null;
let topCategoriesPromise = null;

export const getTopCategories = async () => {
  if (topCategoriesCache) return topCategoriesCache;
  if (topCategoriesPromise) return topCategoriesPromise;

  topCategoriesPromise = (async () => {
    const response = await fetch(`${BASE_URL}/catalog/categories/top`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    topCategoriesCache = data;
    return data;
  })();

  return topCategoriesPromise;
};

/**
 * Fetches the child categories for the selected taxonomy category.
 * The root category's vertical index is reused at every level.
 *
 * @param {string} categoryId - Shopify taxonomy category ID.
 * @param {number} vertical - Vertical index returned by getTopCategories.
 * @returns {Promise<{next: Array}>} Child category options.
 */
export const getNextCategories = async (categoryId, vertical) => {
  const response = await fetch(
    `${BASE_URL}/catalog/categories/next/${encodeURIComponent(categoryId)}?vertical=${vertical}`,
    { credentials: "include" },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { next: [ { id, name, full_name, level }, ... ] }
};

/**
 * Fetches the fields required to create a product for the final category.
 *
 * @param {string} typeId - Final selected taxonomy category ID.
 * @param {number} vertical - Root vertical index for the selected category.
 * @returns {Promise<Object>} Listing, category, and image attributes.
 */
export const getAttributeFields = async (typeId, vertical) => {
  const url = vertical !== undefined && vertical !== null && vertical !== ""
    ? `${BASE_URL}/catalog/categories/attributes/${encodeURIComponent(typeId)}?vertical=${vertical}`
    : `${BASE_URL}/catalog/categories/attributes/${encodeURIComponent(typeId)}`;

  const response = await fetch(url, {
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.status === "failed") {
    throw new Error(data?.message || `HTTP ${response.status}: Failed to get category attributes`);
  }

  return data;
};

// ── Create catalog (payload restructured) ────────────────
export const createCatalog = async (
  typeId,
  listingAttributes,
  categoryAttributes,
) => {
  const response = await fetch(
    `${BASE_URL}/catalog/products/single?type-id=${encodeURIComponent(typeId)}`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" ,
        "X-CSRF-Token": await getCSRFToken()
      },
      body: JSON.stringify({
        listing_attributes: listingAttributes,
        category_attributes: categoryAttributes,
      }),
    },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.message?? ""}`);
  return response.json(); // { Status: "successful", message: "..." }
};

// ── Bulk excel sheet (template download) ──────────────────
// Returns a Blob (.xlsx) — caller is responsible for turning it into a
// download (e.g. via URL.createObjectURL) since there's no JSON body here.
export const getBulkExcelSheet = async (typeId, vertical) => {
  const response = await fetch(
    `${BASE_URL}/catalog/categories/bulk-excel-sheet/${encodeURIComponent(typeId)}?vertical=${vertical}`,
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
    `${BASE_URL}/catalog/products/bulk?type-id=${encodeURIComponent(typeId)}`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );

  const contentType = response.headers.get("content-type") || "";

  if (response.status === 400) {
    const data = await response.json();
    return { status: "error-sheet", data };
  }

  if (response.status === 422 && !contentType.includes("application/json")) {
    // Partial failure: server sent back an .xlsx of the bad rows.
    const blob = await response.blob();
    return { status: "partial-failure", failedRowsBlob: blob };
  }

  const data = await response.json();

  if (!response.ok) {
    // Total failure case: { status: "failed", msg: "..." }
    throw new Error(data.msg || data.message || `HTTP ${response.status}`);
  }

  return data; // { status: "ok" } or { status: "successful" }
};

// ── Download error sheet ──────────────────────────────────
export const downloadErrorSheet = async (downloadLink) => {
  const response = await fetch(`${BASE_URL}${downloadLink}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.blob();
};

// ── Products list / detail / lifecycle ─────────────────────
export const getUploadedCategories = async () => {
  const response = await fetch(
    `${BASE_URL}/catalog/products/uploaded-categories`,
    {
      credentials: "include",
    },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { categories: [ { category, id } ], status: "successful" }
};

export const getProductCounts = async () => {
  const response = await fetch(`${BASE_URL}/catalog/products/counts`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

export const getProducts = async (params = {}) => {
  const url = new URL(`${BASE_URL}/catalog/products`);
  if (params.category) url.searchParams.append("category", params.category);
  if (params.status) url.searchParams.append("status", params.status);
  if (params.rows) url.searchParams.append("rows", params.rows);
  if (params.page) url.searchParams.append("page", params.page);

  const response = await fetch(url.toString(), {
    credentials: "include",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json(); // { count: {...}, "catalog_list": [...] }
  if (data.status === "failed") {
    throw new Error(data.message || "Failed to fetch catalog data");
  }
  return data;
};

export const getProduct = async (uskuId) => {
  const response = await fetch(`${BASE_URL}/catalog/products/${uskuId}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json(); // { count: {...}, "catalog-list": [ {...} ] }
};




export const deleteProduct = async (uskuId) => {
  const response = await fetch(`${BASE_URL}/catalog/products/${encodeURIComponent(uskuId)}`, {
    method: "DELETE",
    credentials: "include",
    headers:{
      "X-CSRF-Token": await getCSRFToken()
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.msg || `HTTP ${response.status}`);
  }
  return data; // { "message": "Product deleted successfully", "status": "success" }
};

/**
 * PUT /catalog/products/{usku_id}?type-id={typeId}
 * Update catalog product listing and category attributes data
 *
 * @param {string} uskuId - Universal SKU ID of the product
 * @param {string} typeId - Category/Type ID for the product
 * @param {object} listingAttributesOrPayload - Flat key/value listing attributes or { listing_attributes, category_attributes }
 * @param {object} [categoryAttributes={}] - Category attributes key/value map
 * @returns {Promise<{ message: string, status: string }>}
 */
export const updateProduct = async (
  uskuId,
  typeId,
  listingAttributesOrPayload,
  categoryAttributes = {},
) => {
  let listingAttributes = listingAttributesOrPayload || {};
  let catAttributes = categoryAttributes || {};

  // Support both (uskuId, typeId, listingAttributes, categoryAttributes)
  // and (uskuId, typeId, { listing_attributes, category_attributes })
  if (
    listingAttributesOrPayload &&
    (listingAttributesOrPayload.listing_attributes !== undefined ||
      listingAttributesOrPayload.category_attributes !== undefined)
  ) {
    listingAttributes = listingAttributesOrPayload.listing_attributes || {};
    catAttributes = listingAttributesOrPayload.category_attributes || {};
  }

  const csrf = await getCSRFToken();
  const headers = {
    "Content-Type": "application/json",
  };
  if (csrf) {
    headers["X-CSRF-Token"] = await getCSRFToken();
  }

  const response = await fetch(
    `${BASE_URL}/catalog/products/${encodeURIComponent(uskuId)}?type-id=${encodeURIComponent(typeId)}`,
    {
      method: "PUT",
      credentials: "include",
      headers,
      body: JSON.stringify({
        category_attributes: catAttributes,
        listing_attributes: listingAttributes,
      }),
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.msg || `HTTP ${response.status}`);
  }
  return data; // { "message": "successfully updated the catalog product", "status": "successful" }
};

// ── Images ───────────────────────────────────────────────

/**
 * POST /catalog/images/{usku_id}
 * Uploads product images along with their metadata (image type + order).
 *
 * The upload runs asynchronously on the server. A successful 200 response
 * means the job was accepted and scheduled — not that it has completed.
 * Poll the returned `event_url` to track progress.
 *
 * FormData layout sent to the API:
 *   - One entry per image, keyed by its image-type (e.g. "front", "zoomed").
 *   - A single "meta" entry: serialized JSON mapping image-type → image-order.
 *     e.g. { "front": 3, "zoomed": 6 }
 *
 * The `imagesData` argument must follow the shape set by the component's state:
 *   { [imageType]: { image: File, order: number } }
 *   e.g. { front: { image: File, order: 3 }, zoomed: { image: File, order: 6 } }
 *
 * Constraints (enforced server-side):
 *   - image-order must satisfy 1 <= order <= 20  (0 or below → 413)
 *
 * @param {string} uskuId      - Universally unique Stock Keeping Unit ID.
 * @param {{ [imageType: string]: { image: File, order: number } }} imagesData
 *   - Map of image-type → { image File object, display order }.
 *
 * @returns {Promise<{
 *   status:    string,
 *   message:   string,
 *   event_url: string,
 * }>} Confirmation that the background upload job was scheduled.
 *
 * @throws {Error} 401 — User is not logged in.
 * @throws {Error} 413 — Invalid image order (e.g. order <= 0).
 * @throws {Error} 500 — Internal server error.
 * @throws {Error} Any other non-OK HTTP status.
 *
 * @example
 * const result = await uploadProductImages(uskuId, {
 *   front:  { image: frontFile,  order: 3 },
 *   zoomed: { image: zoomedFile, order: 6 },
 * });
 * // result.event_url → "/catalog/images/events/04c6521a…"
 */
export const uploadProductImages = async (uskuId, imagesData) => {
  const formData = new FormData();

  /*
   * Build the meta map: { image_type: image_order }
   * e.g. { "front": 3, "zoomed": 6 }
   * Then append each image file under its image-type key.
   */
  const meta = {};

  Object.entries(imagesData).forEach(([imageType, { image, order }]) => {
    /* Append the file under its image-type name (not a generic "image" key) */
    formData.append(imageType, image);

    /* Record the order for this image type */
    meta[imageType] = order;
  });

  /* Append serialized metadata after all files */
  formData.append("meta", JSON.stringify(meta));

  const response = await fetch(
    `${BASE_URL}/catalog/images/${encodeURIComponent(uskuId)}`,
    {
      method: "POST",
      credentials: "include",
      headers:{
        "X-CSRF-Token": await getCSRFToken()
      },
      body: formData,
    },
  );

  const data = await response.json();

  /* 401 → session expired / user not logged in */
  if (response.status === 401) {
    throw new Error(data.message || "User is not logged in");
  }

  /* 413 → invalid image order (e.g. order <= 0 or order > 20) */
  if (response.status === 413) {
    throw new Error(data.message || "Invalid image order");
  }

  /* 500 → internal server error */
  if (response.status === 500) {
    throw new Error(data.message || "Internal server error");
  }

  /* Any other non-2xx status */
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  /*
   * Successful 200 response shape:
   * {
   *   "status":    "successful",
   *   "message":   "Image upload has started",
   *   "event_url": "/catalog/images/events/04c6521a…"
   * }
   * The upload runs in the background — poll event_url to track completion.
   */
  return data;
};

/**

 * PUT /catalog/images/{usku_id}
 * Update the product images, including all image quality variants.
 *
 * @param {string} uskuId - Universally unique Stock Keeping Unit ID.
 * @param {{ [imageType: string]: { image: File, order?: number } | File }} imagesData - Map of imageType -> File or { image: File, order: number }
 * @returns {Promise<any>}
 */
export const updateProductImages = async (uskuId, imagesData) => {
  const formData = new FormData();
  const meta = {};

  Object.entries(imagesData).forEach(([imageType, item]) => {
    const file = item?.image || item;
    const order = item?.order;
    if (file instanceof Blob || file instanceof File) {
      formData.append(imageType, file);
      if (order !== undefined) {
        meta[imageType] = order;
      }
    }
  });

  if (Object.keys(meta).length > 0) {
    formData.append("meta", JSON.stringify(meta));
  }

  const response = await fetch(
    `${BASE_URL}/catalog/images/${encodeURIComponent(uskuId)}`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "X-CSRF-Token": await getCSRFToken(),
      },
      body: formData,
    },
  );

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    throw new Error(data.message || "User is not logged in");
  }
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  return data;
};

/**

 * GET /catalog/images/{usku_id}
 * Retrieves product image URLs for a given USKU ID.
 *
 * Returns URLs for all four image variants:
 *   - original       → full-quality source image (.jpg)
 *   - high_resol_webp → high-resolution WebP
 *   - low_resol_webp  → low-resolution WebP (thumbnails / previews)
 *   - webp_card       → WebP optimised for product card display
 *
 * @param {string}      uskuId    - Universally unique Stock Keeping Unit ID.
 * @param {string|null} [imageType=null] - Optional image type filter (e.g. "front", "back").
 *                                         When omitted, all image types are returned.
 *
 * @returns {Promise<{
 *   image_order: string,
 *   image_urls: {
 *     high_resol_webp: string,
 *     low_resol_webp:  string,
 *     original:        string,
 *     webp_card:       string,
 *   }
 * }>} Resolved image order and URL map for the requested USKU.
 *
 * @throws {Error} 409 — Invalid image type or image does not exist.
 * @throws {Error} Any other non-OK HTTP status code.
 *
 * @example
 * // Fetch all image types for a product
 * const result = await getProductImages("12345678911");
 *
 * @example
 * // Fetch only the "front" image type
 * const result = await getProductImages("12345678911", "front");
 * // result.image_urls.original → "catalog/images/original_image/.../front.jpg"
 */
export const getProductImages = async (uskuId, imageType = null) => {
  /* Build the URL — append image-type query param only when provided */
  const url = new URL(
    `${BASE_URL}/catalog/images/${encodeURIComponent(uskuId)}`,
  );
  if (imageType) {
    url.searchParams.set("image-type", imageType);
  }

  const response = await fetch(url.toString(), {
    credentials: "include",
  });

  const data = await response.json();

  /* 409 → image not found or invalid image-type (API-level business error) */
  if (response.status === 409) {
    throw new Error(
      data.message || "Invalid image type or image does not exist",
    );
  }

  /* Any other non-2xx status → surface as a generic HTTP error */
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  /*
   * Successful 200 response shape:
   * {
   *   "image_order": "3",
   *   "image_urls": {
   *     "high_resol_webp": "catalog/images/high_resol_webp/…/front.webp",
   *     "low_resol_webp":  "catalog/images/low_resol_webp/…/front.webp",
   *     "original":        "catalog/images/original_image/…/front.jpg",
   *     "webp_card":       "catalog/images/webp_card/…/front.webp",
   *   }
   * }
   */
  return data;
};

/**
 * DELETE /catalog/images/{usku_id}
 * Deletes product images for a given USKU ID.
 *
 * When `imageType` is provided, only that specific image type is deleted.
 * When omitted, ALL images associated with the USKU are deleted.
 *
 * @param {string}      uskuId           - Universally unique Stock Keeping Unit ID.
 * @param {string|null} [imageType=null] - Optional image type to target (e.g. "front", "back").
 *                                         Omit to delete all images for the product.
 *
 * @returns {Promise<{
 *   message: string,
 *   status:  string,
 * }>} Confirmation of deletion.
 *
 * @throws {Error} 401 — Invalid USKU ID for the brand (unauthorized).
 * @throws {Error} Any other non-OK HTTP status.
 *
 * @example
 * // Delete only the "front" image
 * await deleteProductImages("12345678911", "front");
 *
 * @example
 * // Delete ALL images for this product
 * await deleteProductImages("12345678911");
 */
export const deleteProductImages = async (uskuId, imageType = null) => {
  /* Build the URL — append image-type query param only when provided */
  const url = new URL(
    `${BASE_URL}/catalog/images/${encodeURIComponent(uskuId)}`,
  );
  if (imageType) {
    url.searchParams.set("image-type", imageType);
  }

  const response = await fetch(url.toString(), {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json();

  /* 401 → USKU does not belong to the authenticated brand */
  if (response.status === 401) {
    throw new Error(data.message || "Invalid USKU ID for the brand");
  }

  /* Any other non-2xx status */
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  /*
   * Successful 200 response shape:
   * {
   *   "message": "Successfully deleted the images",
   *   "status":  "successful"
   * }
   */
  return data;
};
