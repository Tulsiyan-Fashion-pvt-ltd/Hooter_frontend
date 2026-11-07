import React, { useState, useContext, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "../css/pages/Integrations.module.css";
import { SpinnerContext, toastContext } from "../appContext";
import { fetchCsrf } from "../store/slices/csrfSlice";
import { getIntegrations, authorizeFlipkart } from "../services/platformService";

const PLATFORM_METADATA = {
  flipkart: {
    name: "Flipkart",
    type: "marketplace",
    subtitle: "Seller Hub API",
    letter: "F",
    letterColor: "#2563EB",
  },
  shopify: {
    name: "Shopify",
    type: "marketplace",
    subtitle: "Your own storefront",
    letter: "S",
    letterColor: "#16A34A",
  },
  amazon: {
    name: "Amazon",
    type: "marketplace",
    subtitle: "Seller Central · SP-API",
    letter: "A",
    letterColor: "#111827",
  },
  myntra: {
    name: "Myntra",
    type: "marketplace",
    subtitle: "Partner Portal",
    letter: "M",
    letterColor: "#E11D48",
  },
  ajio: {
    name: "Ajio",
    type: "marketplace",
    subtitle: "Seller Portal",
    letter: "A",
    letterColor: "#7C3AED",
  },
  meesho: {
    name: "Meesho",
    type: "marketplace",
    subtitle: "Supplier Panel",
    letter: "M",
    letterColor: "#9333EA",
  },
  razorpay: {
    name: "Razorpay",
    type: "payment",
    subtitle: "Cards · UPI · Netbanking",
    letter: "R",
    letterColor: "#2563EB",
  },
  cashfree: {
    name: "Cashfree",
    type: "payment",
    subtitle: "Cards · UPI · Payouts",
    letter: "C",
    letterColor: "#059669",
  },
  shiprocket: {
    name: "Shiprocket",
    type: "shipping",
    subtitle: "Courier aggregator",
    letter: "S",
    letterColor: "#334155",
  },
};

/**
 * Flexible parser to map backend integrations response into the UI cards list.
 * Only returns platforms that actually exist in the API response.
 *
 * Supports:
 * - Key-value map: e.g. {"flipkart":"not_connected", "shopify":"not_connected"}
 * - Array of platform strings: e.g. ["flipkart", "shopify"]
 * - Array of objects: e.g. [{ platform: "flipkart", status: "not_connected" }]
 * - Wrapped structures: { integrations: [...] } or { platforms: [...] }
 */
function parseIntegrationsResponse(data) {
  if (!data) return [];

  const createItem = (key, val) => {
    const rawKey = String(key || "").trim();
    const normKey = rawKey.toLowerCase();
    const meta = PLATFORM_METADATA[normKey] || {
      name: rawKey.charAt(0).toUpperCase() + rawKey.slice(1),
      type: "marketplace",
      subtitle: "Platform integration",
      letter: (rawKey.charAt(0) || "P").toUpperCase(),
      letterColor: "#2563EB",
    };

    const isConnected =
      val === true ||
      val === "connected" ||
      val === "active" ||
      (typeof val === "string" && val.toLowerCase() === "connected") ||
      val?.connected === true ||
      val?.status === "connected" ||
      val?.status === "active" ||
      val?.is_active === true;

    return {
      id: normKey,
      name: meta.name,
      type: meta.type || "marketplace",
      subtitle: meta.subtitle,
      letter: meta.letter,
      letterColor: meta.letterColor,
      connected: isConnected,
      activity:
        typeof val === "string"
          ? isConnected
            ? "Connected"
            : "Not connected"
          : val?.activity ||
            val?.last_synced ||
            (isConnected ? "Connected" : "Not connected"),
    };
  };

  // If data is wrapped in integrations, platforms, or data
  const rawData =
    data && typeof data === "object" && !Array.isArray(data)
      ? data.integrations || data.platforms || data.data || data.connected_platforms || data
      : data;

  // Case 1: Array of platform objects or strings
  if (Array.isArray(rawData)) {
    return rawData
      .map((entry) => {
        if (typeof entry === "string") {
          return createItem(entry, "connected");
        }
        if (entry && typeof entry === "object") {
          const key =
            entry.id ||
            entry.platform ||
            entry.platform_name ||
            entry.name ||
            "";
          return createItem(key, entry.status ?? entry);
        }
        return null;
      })
      .filter(Boolean);
  }

  // Case 2: Object key-value map, e.g. {"flipkart":"not_connected", "shopify":"not_connected"}
  if (typeof rawData === "object" && rawData !== null) {
    return Object.entries(rawData).map(([key, val]) => createItem(key, val));
  }

  return [];
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [loadingPlatform, setLoadingPlatform] = useState(null);
  const [fetchingList, setFetchingList] = useState(true);

  const dispatch = useDispatch();
  const csrfToken = useSelector((state) => state.csrf.csrf);

  const setShowSpinner = useContext(SpinnerContext);
  const showToast = useContext(toastContext);

  useEffect(() => {
    if (!csrfToken) {
      dispatch(fetchCsrf());
    }
  }, [csrfToken, dispatch]);

  // Load which integrations are connected via GET /platforms/integrations/
  const loadIntegrations = useCallback(async () => {
    setFetchingList(true);
    try {
      const res = await getIntegrations(csrfToken);
      if (res.ok && res.data) {
        setIntegrations(parseIntegrationsResponse(res.data));
      } else {
        setIntegrations([]);
      }
    } catch (err) {
      console.warn("Failed to fetch integrations list:", err);
      setIntegrations([]);
    } finally {
      setFetchingList(false);
    }
  }, [csrfToken]);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  // Authorize Flipkart account via GET /platforms/flipkart/auth/authorize
  const handleFlipkartAuthorize = async () => {
    try {
      setLoadingPlatform("flipkart");
      if (typeof setShowSpinner === "function") {
        setShowSpinner(true);
      }

      const res = await authorizeFlipkart(csrfToken);

      if (res.ok && res.data?.authorization_url) {
        // Redirect to Flipkart OAuth URL
        window.location.href = res.data.authorization_url;
      } else {
        const message = res.data?.message || "Failed to start Flipkart authorization";
        if (typeof showToast === "function") {
          showToast(message, "red");
        } else {
          alert(message);
        }
      }
    } catch (error) {
      console.error("Flipkart authorization error:", error);
      const networkMsg = "Unable to reach the server for Flipkart authorization";
      if (typeof showToast === "function") {
        showToast(networkMsg, "red");
      } else {
        alert(networkMsg);
      }
    } finally {
      setLoadingPlatform(null);
      if (typeof setShowSpinner === "function") {
        setShowSpinner(false);
      }
    }
  };

  const handleAction = async (item) => {
    if (item.id === "flipkart") {
      await handleFlipkartAuthorize();
      return;
    }

    // Toggle mock connection for other integrations if not integrated yet
    setIntegrations((prev) =>
      prev.map((i) => {
        if (i.id === item.id) {
          const nextState = !i.connected;
          return {
            ...i,
            connected: nextState,
            activity: nextState ? "Connected" : "Not connected",
          };
        }
        return i;
      })
    );
  };

  const marketplacesCount = integrations.filter((i) => i.type === "marketplace");
  const connectedMarketplaces = marketplacesCount.filter((i) => i.connected).length;

  const paymentsCount = integrations.filter((i) => i.type === "payment");
  const connectedPayments = paymentsCount.filter((i) => i.connected).length;

  const shippingCount = integrations.filter((i) => i.type === "shipping");
  const connectedShipping = shippingCount.filter((i) => i.connected).length;

  return (
    <div className={styles.container}>
      {/* ── Page Header ────────────────────────────────────────── */}
      <section className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Integrations</h1>
        <p className={styles.pageSubtitle}>
          Connect marketplaces, payment gateways, and shipping partners
        </p>
      </section>

      {/* ── Summary Cards (rendered only for categories with actual integrations) ── */}
      {!fetchingList && (
        <section className={styles.summaryGrid}>
          {marketplacesCount.length > 0 && (
            <div className={styles.summaryCard}>
              <div className={`${styles.summaryIcon} ${styles.iconMarketplaces}`}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <div className={styles.summaryText}>
                <p className={styles.summaryCount}>
                  {connectedMarketplaces} of {marketplacesCount.length}
                </p>
                <p className={styles.summaryLabel}>Marketplaces connected</p>
              </div>
            </div>
          )}

          {paymentsCount.length > 0 && (
            <div className={styles.summaryCard}>
              <div className={`${styles.summaryIcon} ${styles.iconPayments}`}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div className={styles.summaryText}>
                <p className={styles.summaryCount}>
                  {connectedPayments} of {paymentsCount.length}
                </p>
                <p className={styles.summaryLabel}>Payment gateways connected</p>
              </div>
            </div>
          )}

          {shippingCount.length > 0 && (
            <div className={styles.summaryCard}>
              <div className={`${styles.summaryIcon} ${styles.iconShipping}`}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div className={styles.summaryText}>
                <p className={styles.summaryCount}>
                  {connectedShipping} of {shippingCount.length}
                </p>
                <p className={styles.summaryLabel}>Shipping partners connected</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Integrations Grid ──────────────────────────────────── */}
      {fetchingList ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading integrations...</p>
        </div>
      ) : integrations.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No integrations found</p>
          <p className={styles.emptySubtitle}>
            No platform integrations are currently configured for this account.
          </p>
        </div>
      ) : (
        <section className={styles.integrationsGrid}>
          {integrations.map((item) => {
            const isFlipkartLoading = loadingPlatform === "flipkart" && item.id === "flipkart";

            return (
              <div key={item.id} className={styles.card}>
                <div>
                  {/* Card Top: Avatar, Name/Subtitle, Badge */}
                  <div className={styles.cardTop}>
                    <div className={styles.cardIdentity}>
                      <div
                        className={styles.logoBox}
                        style={{ color: item.letterColor }}
                      >
                        {item.letter}
                      </div>
                      <div className={styles.cardInfo}>
                        <h3 className={styles.cardTitle}>{item.name}</h3>
                        <p className={styles.cardSubtitle}>{item.subtitle}</p>
                      </div>
                    </div>

                    <span
                      className={`${styles.badge} ${
                        item.connected ? styles.badgeConnected : styles.badgeNotConnected
                      }`}
                    >
                      {item.connected ? "Connected" : "Not connected"}
                    </span>
                  </div>
                </div>

                <div>
                  {/* Divider */}
                  <div className={styles.cardDivider} />

                  {/* Card Footer: Status text, Action button */}
                  <div className={styles.cardFooter}>
                    <p className={styles.activityText}>{item.activity}</p>
                    <button
                      type="button"
                      className={item.connected ? styles.btnManage : styles.btnConnect}
                      disabled={isFlipkartLoading}
                      onClick={() => handleAction(item)}
                    >
                      {isFlipkartLoading
                        ? "Connecting..."
                        : item.connected
                        ? "Manage"
                        : "Connect"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
