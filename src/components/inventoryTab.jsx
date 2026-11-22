import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styles from "../css/pages/inventory.Inventory.module.css";

/* ─── Tab configuration ──────────────────────────────────────────────────── */
const TABS = [
  { id: "inventory", label: "Inventory", to: "/inventory/stock" },
  { id: "inward", label: "Inward", to: "/inventory/inward" },
  { id: "grn", label: "GRN", to: "/inventory/grn" },
];

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function InventoryTab() {
  const [activeTab, setActiveTab] = useState(useLocation().pathname);
  console.log(useLocation().pathname)

  return (
    <div className={styles.pageRoot}>
      {/* ── Tab Strip ───────────────────────────────────────────────────── */}
      <div className={styles.tabStrip}>
        <nav className={styles.tabList} aria-label="Inventory sections">
          {TABS.map(({ id, label, to }) => (
            <NavLink
              key={id}
              to={to}
              className={({isActive}) => isActive ? `${styles.tabItem} ${styles.tabItemActive}`: `${styles.tabItem}`}
              activeClassName={styles.tabItemActive}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}