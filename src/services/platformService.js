const BASE_URL = import.meta.env.VITE_BASEAPI;
import { store } from "../store/store";

const getCSRFToken = () => {
  const state = store.getState();
  return state.csrf?.csrf;
};

/**
 * GET /platforms/integrations/
 * Fetches the list of integrated/connected platforms for the currently selected brand.
 */
export const getIntegrations = async (token) => {
  const csrf = token || getCSRFToken();
  const headers = {
    Accept: "application/json",
  };
  if (csrf) {
    headers["X-CSRF-Token"] = csrf;
  }

  const response = await fetch(`${BASE_URL}/platforms/integrations/`, {
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
 * GET /platforms/flipkart/auth/authorize
 * Starts Flipkart OAuth authorization for the currently selected brand.
 */
export const authorizeFlipkart = async (token) => {
  const csrf = token || getCSRFToken();
  const headers = {
    Accept: "application/json",
  };
  if (csrf) {
    headers["X-CSRF-Token"] = csrf;
  }

  const response = await fetch(`${BASE_URL}/platforms/flipkart/auth/authorize`, {
    method: "GET",
    credentials: "include",
    headers,
  });

  const data = await response.json().catch(() => ({}));
  return {
    status: response.status,
    ok: response.ok,
    data,
  };
};

