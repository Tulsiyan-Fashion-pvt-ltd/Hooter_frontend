/**
 * StatCardsRow
 * Reusable summary-stats strip used across Inventory sub-pages (Stock, GRN).
 * Renders a row of individually bordered, gap-separated stat cards that match
 * the catalog page design â€” each card has an icon box in the top-right corner.
 *
 * Props:
 *  cards   Array<{
 *    label    : string          â€“ card heading  (e.g. "Total SKUs")
 *    value    : string|number   â€“ large primary metric
 *    sub      : string          â€“ smaller supporting line (optional)
 *    subClass : string          â€“ extra className for coloured sub text (optional)
 *    icon     : ReactNode       â€“ icon element for the top-right icon box (optional)
 *    iconClass: string          â€“ extra className for icon box background (optional)
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
 *    { label: "Stock Value",   value: "â‚¹1.86Cr", sub: "At cost price" },
 *  ]} />
 */

import styles from "../css/pages/inventory.Inventory.module.css";

function StatCard({ label, value, sub, subClass, icon, iconClass }) {
  return (
    <div className={styles.statCard + " tiles"}>
      <div className={styles.statCardTop}>
        <p className={styles.statLabel}>{label}</p>
        {icon && (
          <div className={`${styles.statIconBox} ${iconClass || ""}`}>
            {icon}
          </div>
        )}
      </div>
      <h2 className={styles.statValue}>{value}</h2>
      {sub && (
        <p className={`${styles.statSub} ${subClass || ""}`}>{sub}</p>
      )}
    </div>
  );
}



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
          icon={card.icon}
          iconClass={card.iconClass}
        />
      ))}
    </section>
  );
}