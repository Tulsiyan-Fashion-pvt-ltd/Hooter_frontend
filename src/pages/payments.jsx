import { useState } from "react";
import styles from "../css/pages/Payments.module.css";
import clsx from "clsx";

/* ─────────────────────────────────────────────────────────────
   Mock Data & Constants
───────────────────────────────────────────────────────────── */

const METRIC_CARDS = [
  { label: "Total collected", value: "₹18.4L", sub: "Last 30 days" },
  { label: "Pending settlement", value: "₹3.2L", sub: "Awaiting payout", subType: "warning" },
  { label: "COD collected", value: "₹6.1L", sub: "Cash on delivery" },
  { label: "Reconciled", value: "₹52.1L", sub: "Matched", subType: "success" },
  { label: "Mismatches", value: "3", sub: "Needs investigation", subType: "danger" },
];

const TRANSACTIONS = [
  {
    id: "TXN-88433",
    orderId: "ORD-88433",
    channel: "Meesho",
    channelColor: "#a855f7",
    amount: "₹8,396",
    status: "Settled",
    date: "01 Nov, 09:08 am",
  },
  {
    id: "TXN-88454",
    orderId: "ORD-88454",
    channel: "Meesho",
    channelColor: "#a855f7",
    amount: "₹7,597",
    status: "Settled",
    date: "09 Nov, 02:08 am",
  },
  {
    id: "TXN-88469",
    orderId: "ORD-88469",
    channel: "Myntra",
    channelColor: "#ec4899",
    amount: "₹1,898",
    status: "Settled",
    date: "02 Nov, 02:08 pm",
  },
  {
    id: "TXN-88457",
    orderId: "ORD-88457",
    channel: "Website",
    channelColor: "#10b981",
    amount: "₹4,396",
    status: "Settled",
    date: "02 Nov, 09:08 pm",
  },
  {
    id: "TXN-88442",
    orderId: "ORD-88442",
    channel: "Amazon",
    channelColor: "#f97316",
    amount: "₹5,898",
    status: "COD pending",
    date: "07 Nov, 01:08 pm",
  },
  {
    id: "TXN-88448",
    orderId: "ORD-88448",
    channel: "Myntra",
    channelColor: "#ec4899",
    amount: "₹8,596",
    status: "Settled",
    date: "08 Nov, 09:08 am",
  },
  {
    id: "TXN-88472",
    orderId: "ORD-88472",
    channel: "Ajio",
    channelColor: "#e11d48",
    amount: "₹3,798",
    status: "COD pending",
    date: "12 Nov, 07:08 pm",
  },
  {
    id: "TXN-88460",
    orderId: "ORD-88460",
    channel: "Shopify",
    channelColor: "#10b981",
    amount: "₹8,196",
    status: "COD pending",
    date: "05 Nov, 12:08 pm",
  },
];

/* ─────────────────────────────────────────────────────────────
   Status Helpers
───────────────────────────────────────────────────────────── */
function getStatusConfig(status) {
  switch (status) {
    case "Settled":
      return { dot: "#16a34a", bg: "#f0fdf4", text: "#16a34a" };
    case "COD pending":
      return { dot: "#d97706", bg: "#fffbeb", text: "#d97706" };
    default:
      return { dot: "#64748b", bg: "#f1f5f9", text: "#64748b" };
  }
}

/* ═════════════════════════════════════════════════════════════
   Payments Component
═════════════════════════════════════════════════════════════ */
export default function Payments() {
  const [selectedTxn, setSelectedTxn] = useState(null);

  return (
    <div className={styles.pageRoot}>
      <div className={styles.container}>

        {/* ── 1. Page Header ─────────────────────────────────────── */}
        <div className={styles.header}>
          <h1 className={styles.title}>Payments</h1>
          <p className={styles.subtitle}>
            Settlements and transactions across all marketplaces
          </p>
        </div>

        {/* ── 2. Five Metric Overview Cards ──────────────────────── */}
        <div className={styles.metricsGrid}>
          {METRIC_CARDS.map((card) => (
            <div key={card.label} className={styles.metricCard}>
              <span className={styles.metricLabel}>{card.label}</span>
              <span className={styles.metricValue}>{card.value}</span>
              <span
                className={clsx(
                  styles.metricSub,
                  card.subType === "warning" && styles.subWarning,
                  card.subType === "success" && styles.subSuccess,
                  card.subType === "danger" && styles.subDanger
                )}
              >
                {card.sub}
              </span>
            </div>
          ))}
        </div>

        {/* ── 3. Recent Transactions Card ────────────────────────── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent transactions</h2>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.theadRow}>
                  <th className={styles.thTxn}>TRANSACTION</th>
                  <th className={styles.thOrder}>ORDER</th>
                  <th className={styles.thChannel}>CHANNEL</th>
                  <th className={styles.thAmount}>AMOUNT</th>
                  <th className={styles.thStatus}>STATUS</th>
                  <th className={styles.thDate}>DATE</th>
                </tr>
              </thead>
              <tbody>
                {TRANSACTIONS.map((txn) => {
                  const statusCfg = getStatusConfig(txn.status);

                  return (
                    <tr
                      key={txn.id}
                      className={clsx(styles.trRow, selectedTxn === txn.id && styles.trRowSelected)}
                      onClick={() => setSelectedTxn(txn.id)}
                    >
                      {/* Transaction ID */}
                      <td className={styles.tdTxn}>
                        <span className={styles.txnId}>{txn.id}</span>
                      </td>

                      {/* Order ID */}
                      <td className={styles.tdOrder}>
                        <span className={styles.orderId}>{txn.orderId}</span>
                      </td>

                      {/* Channel */}
                      <td className={styles.tdChannel}>
                        <div className={styles.channelCell}>
                          <span
                            className={styles.channelDot}
                            style={{ background: txn.channelColor }}
                          />
                          <span className={styles.channelName}>{txn.channel}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className={styles.tdAmount}>
                        <span className={styles.amountText}>{txn.amount}</span>
                      </td>

                      {/* Status */}
                      <td className={styles.tdStatus}>
                        <span
                          className={styles.statusPill}
                          style={{ background: statusCfg.bg, color: statusCfg.text }}
                        >
                          <span
                            className={styles.statusDot}
                            style={{ background: statusCfg.dot }}
                          />
                          <span>{txn.status}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className={styles.tdDate}>
                        <span className={styles.dateText}>{txn.date}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

