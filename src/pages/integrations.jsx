import React, { useState } from "react";
import styles from "../css/pages/Integrations.module.css";

const INITIAL_INTEGRATIONS = [
  {
    id: "amazon",
    name: "Amazon",
    type: "marketplace",
    subtitle: "Seller Central · SP-API",
    letter: "A",
    letterColor: "#111827",
    connected: true,
    activity: "12 min ago",
  },
  {
    id: "flipkart",
    name: "Flipkart",
    type: "marketplace",
    subtitle: "Seller Hub API",
    letter: "F",
    letterColor: "#2563EB",
    connected: true,
    activity: "40 min ago",
  },
  {
    id: "myntra",
    name: "Myntra",
    type: "marketplace",
    subtitle: "Partner Portal",
    letter: "M",
    letterColor: "#E11D48",
    connected: false,
    activity: "Not connected",
  },
  {
    id: "ajio",
    name: "Ajio",
    type: "marketplace",
    subtitle: "Seller Portal",
    letter: "A",
    letterColor: "#7C3AED",
    connected: false,
    activity: "Not connected",
  },
  {
    id: "meesho",
    name: "Meesho",
    type: "marketplace",
    subtitle: "Supplier Panel",
    letter: "M",
    letterColor: "#9333EA",
    connected: false,
    activity: "Not connected",
  },
  {
    id: "shopify",
    name: "Shopify",
    type: "marketplace",
    subtitle: "Your own storefront",
    letter: "S",
    letterColor: "#16A34A",
    connected: false,
    activity: "Not connected",
  },
  {
    id: "razorpay",
    name: "Razorpay",
    type: "payment",
    subtitle: "Cards · UPI · Netbanking",
    letter: "R",
    letterColor: "#2563EB",
    connected: true,
    activity: "Live since Jun 2026",
  },
  {
    id: "cashfree",
    name: "Cashfree",
    type: "payment",
    subtitle: "Cards · UPI · Payouts",
    letter: "C",
    letterColor: "#059669",
    connected: false,
    activity: "Not connected",
  },
  {
    id: "shiprocket",
    name: "Shiprocket",
    type: "shipping",
    subtitle: "Courier aggregator",
    letter: "S",
    letterColor: "#334155",
    connected: true,
    activity: "Live since Aug 2026",
  },
];

export default function Integrations() {
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);

  const toggleConnection = (id) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.connected;
          return {
            ...item,
            connected: nextState,
            activity: nextState ? "Just now" : "Not connected",
          };
        }
        return item;
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

      {/* ── Summary Cards ──────────────────────────────────────── */}
      <section className={styles.summaryGrid}>
        {/* Marketplaces */}
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
              {connectedMarketplaces} of {marketplacesCount.length + 1}
            </p>
            <p className={styles.summaryLabel}>Marketplaces connected</p>
          </div>
        </div>

        {/* Payment Gateways */}
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
              {connectedPayments} of {paymentsCount.length + 4}
            </p>
            <p className={styles.summaryLabel}>Payment gateways connected</p>
          </div>
        </div>

        {/* Shipping Partners */}
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
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div className={styles.summaryText}>
            <p className={styles.summaryCount}>
              {connectedShipping} of {shippingCount.length + 5}
            </p>
            <p className={styles.summaryLabel}>Shipping partners connected</p>
          </div>
        </div>
      </section>

      {/* ── Integrations Grid ──────────────────────────────────── */}
      <section className={styles.integrationsGrid}>
        {integrations.map((item) => (
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
                  onClick={() => toggleConnection(item.id)}
                >
                  {item.connected ? "Manage" : "Connect"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

