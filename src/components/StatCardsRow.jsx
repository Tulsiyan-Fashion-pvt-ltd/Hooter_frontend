/**
 * StatCardsRow
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable summary-stats strip used across Inventory sub-pages (Stock, GRN).
 *
 * Renders a row of individually bordered, gap-separated stat cards instead of
 * the old flush "shared-border" layout, so cards are visually distinct.
 *
 * Props:
 *  cards   Array<{
 *    label    : string          – card heading  (e.g. "Total SKUs")
 *    value    : string|number   – large primary metric
 *    sub      : string          – smaller supporting line (optional)
 *    subClass : string          – extra className for coloured sub text (optional)
 *  }>
 *
 * Usage:
 *  import StatCardsRow from "../components/StatCardsRow";
 *
 *  <StatCardsRow cards={[
 *    { label: "Total SKUs",    value: 1284, sub: "Across 3 warehouses" },
 *    { label: "In Stock",      value: 1062, sub: "82.7% of catalog" },
 *    { label: "Low Stock",     value: 146,  sub: "Below reorder level", subClass: styles.subWarn },
 *    { label: "Out of Stock",  value: 75,   sub: "Needs restock",       subClass: styles.subDanger },
 *    { label: "Stock Value",   value: "₹1.86Cr", sub: "At cost price" },
 *  ]} />
 */

import styles from "../css/pages/inventory.Inventory.module.css";

/* ─── Individual card ─────────────────────────────────────────────────────── */

function StatCard({ label, value, sub, subClass }) {
  return (
    <div className={styles.statCard}>
      <p className={styles.statLabel}>{label}</p>
      <h2 className={styles.statValue}>{value}</h2>
      {sub && (
        <p className={`${styles.statSub} ${subClass || ""}`}>{sub}</p>
      )}
    </div>
  );
}

/* ─── Row wrapper ─────────────────────────────────────────────────────────── */

export default function StatCardsRow({ cards = [] }) {
  return (
    <section className={styles.statsRow} aria-label="Summary statistics">
      {cards.map((card, i) => (
        <StatCard
          key={i}
          label={card.label}
          value={card.value}
          sub={card.sub}
          subClass={card.subClass}
        />
      ))}
    </section>
  );
}

