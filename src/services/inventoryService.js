const BASE_URL = import.meta.env.VITE_BASEAPI;
import { store } from "../store/store";

const getCSRFToken = () => {
  const state = store.getState();
  return state.csrf?.csrf;
};

/**
 * GET /inventory/stocks/overview
 * Fetches the total, out of stock, sellable, low stock product counts
 * and stock value metrics for the brand.
 */
export const getInventoryStocksOverview = async (token) => {
  const csrf = token || getCSRFToken();
  const headers = {
    Accept: "application/json",
  };
  if (csrf) {
    headers["X-CSRF-Token"] = csrf;
  }

  const response = await fetch(`${BASE_URL}/inventory/stocks/overview`, {
    method: "GET",
    credentials: "include",
    headers,
  });

  const data = await response.json().catch(() => null);
  return {
    status: response.status,
    ok: response.ok,
    data,
  };
};

/**
 * GET /inventory/stocks
 * Fetches total inventory including usku_id and stock.
 * Inventory can be filtered by in-stock, out-of-stock, or low-stock.
 *
 * Query Parameters:
 *  - filter: 'in-stock' | 'out-of-stock' | 'low-stock'
 *  - records: number (10 to 50 inclusive)
 *  - page: number (>= 1)
 *  - type_id: string (optional)
 *  - warehouse_id: string (optional)
 */
export const getInventoryStocks = async (
  { filter, records = 10, page = 1, type_id, warehouse_id } = {},
  token
) => {
  const csrf = token || getCSRFToken();
  const headers = {
    Accept: "application/json",
  };
  if (csrf) {
    headers["X-CSRF-Token"] = csrf;
  }

  const params = new URLSearchParams();

  // Map filter values to match Swagger API
  if (filter) {
    const f = filter.toLowerCase().trim();
    if (f === "sellable" || f === "in-stock" || f === "in_stock") {
      params.append("filter", "in-stock");
    } else if (f === "oos" || f === "out-of-stock" || f === "out_of_stock") {
      params.append("filter", "out-of-stock");
    } else if (f === "low" || f === "low-stock" || f === "low_stock") {
      params.append("filter", "low-stock");
    }
  }

  // records between 10 and 50 inclusive
  if (records) {
    const clamped = Math.min(50, Math.max(10, Number(records) || 10));
    params.append("records", String(clamped));
  }

  // page number >= 1
  if (page) {
    const clampedPage = Math.max(1, Number(page) || 1);
    params.append("page", String(clampedPage));
  }

  if (type_id) {
    params.append("type_id", type_id);
  }

  if (warehouse_id) {
    params.append("warehouse_id", warehouse_id);
  }

  const queryStr = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`${BASE_URL}/inventory/stocks${queryStr}`, {
    method: "GET",
    credentials: "include",
    headers,
  });

  const data = await response.json().catch(() => null);
  return {
    status: response.status,
    ok: response.ok,
    data,
  };
};
