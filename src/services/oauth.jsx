import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef, useContext } from "react";
import { SpinnerContext, toastContext } from "../appContext";
import { fetchCsrf } from "../store/slices/csrfSlice";
import { handleFlipkartCallback } from "./platformService";

const url = import.meta.env.VITE_BASEAPI;

/**
 * OAuth handling for Shopify, Flipkart, and other platforms
 */
export default function OAuthComponent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const csrf = useSelector((state) => state.csrf?.csrf);
  const params = Object.fromEntries(searchParams);

  const showToast = useContext(toastContext);
  const setShowSpinner = useContext(SpinnerContext);

  // Guard against duplicate execution (OAuth authorization codes are single-use)
  const processedCodeRef = useRef("");
  const isExecutingRef = useRef(false);

  // Ensure CSRF token is available
  useEffect(() => {
    if (!csrf) {
      dispatch(fetchCsrf());
    }
  }, [csrf, dispatch]);

  // Running the OAuth callback handlers
  useEffect(() => {
    // 1. Shopify OAuth Callback
    if (params["request-platform"] === "shopify" && params["request-type"] === "oauth") {
      if (!params.shop || !params.hmac) {
        return;
      }
      sendShopifyRedirect();
      return;
    }

    // 2. Flipkart OAuth Error
    if (params.error && (params.state || location.pathname.includes("flipkart"))) {
      const errorMsg =
        params.error_description ||
        params.error ||
        "Flipkart authorization was cancelled or failed";
      if (typeof showToast === "function") {
        showToast(errorMsg, "red");
      }
      navigate("/integrations", { replace: true });
      return;
    }

    // 3. Flipkart OAuth Callback (code + state)
    if (params.code && params.state && !params.shop) {
      // Must wait for CSRF token before calling callback API
      if (!csrf) return;

      if (processedCodeRef.current === params.code || isExecutingRef.current) {
        return;
      }
      processedCodeRef.current = params.code;
      isExecutingRef.current = true;

      sendFlipkartCallback(params.code, params.state);
    }
  }, [searchParams, csrf]);

  async function sendFlipkartCallback(code, state) {
    if (typeof setShowSpinner === "function") {
      setShowSpinner(true);
    }

    try {
      const res = await handleFlipkartCallback(code, state, csrf);
      if (res.ok) {
        const msg = res.data?.message || "Flipkart account connected successfully!";
        if (typeof showToast === "function") {
          showToast(msg, "green");
        } else {
          alert(msg);
        }
      } else {
        const msg = res.data?.message || "Failed to complete Flipkart authorization";
        if (typeof showToast === "function") {
          showToast(msg, "red");
        } else {
          alert(msg);
        }
      }
    } catch (error) {
      console.error("Flipkart OAuth callback error:", error);
      const networkMsg = "Unable to reach the server for Flipkart authorization";
      if (typeof showToast === "function") {
        showToast(networkMsg, "red");
      } else {
        alert(networkMsg);
      }
    } finally {
      isExecutingRef.current = false;
      if (typeof setShowSpinner === "function") {
        setShowSpinner(false);
      }
      // Redirect cleanly to /integrations without OAuth query params
      navigate("/integrations", { replace: true });
    }
  }

  async function sendShopifyRedirect() {
    try {
      const response = await fetch(`${url}/platforms/shopify/auth/install-store`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        credentials: "include",
        body: JSON.stringify(params),
      });

      const data = await response.json();
      if (!response.ok) {
        window.alert("Couldn't fetch the Shopify shop name");
        navigate("/", { replace: true });
        return;
      }

      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Shopify OAuth request failed:", error);
      navigate("/", { replace: true });
    }
  }

  return null;
}
