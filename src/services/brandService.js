const BASE_URL = import.meta.env.VITE_BASEAPI;

/**
 * GET /brand/connect
 * Connects the brand with the user session.
 * 200 OK -> single brand connected: { brands: "single brand", connection: "connected", ... }
 * 201 Created -> no brand: { brands: null, connection: "not connected", ... }
 * 201 Created -> multiple brands: { brands: [ { brand_id, brand_name } ], connection: "not connected", ... }
 * 401 Unauthorized -> user not logged in
 * 403 Forbidden -> no brand found for this user
 */
export const connectBrand = async () => {
  const response = await fetch(`${BASE_URL}/brand/connect`, {
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));
  return {
    status: response.status,
    ok: response.ok,
    data,
  };
};

/**
 * GET /brand/connect/{brand_id}
 * Connects the specified brand to the currently authenticated user session.
 * 200 OK -> { message: "...", status: "successful" }
 * 400 Bad Request -> { message: "invalid brand_id", status: "failed" }
 * 401 Unauthorized -> { message: "user is not logged in", status: "restricted" }
 * 403 Forbidden -> { message: "no brand found for this user", status: "restricted" }
 * 500 Internal Server Error
 */
export const connectBrandById = async (brandId) => {
  const response = await fetch(`${BASE_URL}/brand/connect/${encodeURIComponent(brandId)}`, {
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));
  return {
    status: response.status,
    ok: response.ok,
    data,
  };
};


/**
 * POST /brand/register
 * Register a new brand with brand details and POC.
 */
export const registerBrand = async (brandData, pocData) => {
  const response = await fetch(`${BASE_URL}/brand/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      brand: brandData,
      poc: pocData,
    }),
  });

  const data = await response.json().catch(() => ({}));
  return {
    status: response.status,
    ok: response.ok,
    data,
  };
};

/**
 * GET /request-niches
 * Fetch available niches for brand registration.
 */
export const getNiches = async () => {
  const response = await fetch(`${BASE_URL}/request-niches`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch niches (${response.status})`);
  }

  return response.json();
};

/**
 * GET /user/profile
 * Fetch user profile information (e.g. for self POC autofill).
 */
export const getUserProfile = async () => {
  const response = await fetch(`${BASE_URL}/user/profile`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile (${response.status})`);
  }

  return response.json();
};
