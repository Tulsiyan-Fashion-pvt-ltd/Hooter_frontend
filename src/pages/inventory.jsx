/**
 * Inventory Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Top-level route component for /inventory/*
 *
 * Responsibilities:
 *  • Renders the page header (title + live-sync subtitle)
 *  • Owns the Inventory / Inward / GRN tab strip
 *  • Delegates content to <StockInventory> or <Inward> based on active tab
 *
 * Props:
 *  tab  "inventory" | "inward" | "grn"   initial active tab (set by router)
 */

import { useState } from "react";
import { Link } from "react-router-dom";

import styles from "../css/pages/inventory.Inventory.module.css";
import StockInventory from "../components/stockInventory";
import Inward from "../components/inwardInventory";
import GrnInventory from "../components/grnInventory";

/* ─── Tab configuration ──────────────────────────────────────────────────── */
const TABS = [
  { id: "inventory", label: "Inventory", to: "/inventory/stock" },
  { id: "inward", label: "Inward", to: "/inventory/inward" },
  { id: "grn", label: "GRN", to: "/inventory/grn" },
];

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function Inventory({ tab }) {
  const [activeTab, setActiveTab] = useState(tab ?? "inventory");

  return (
    <div className={styles.pageRoot}>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <h1 className={styles.pageTitle}>Inventory</h1>
          <p className={styles.pageSubtitle}>
            Live stock across 3 warehouses&nbsp;·&nbsp;Synced 4 minutes ago
          </p>
        </div>
      </header>

      {/* ── Tab Strip ───────────────────────────────────────────────────── */}
      <div className={styles.tabStrip}>
        <nav className={styles.tabList} aria-label="Inventory sections">
          {TABS.map(({ id, label, to }) => (
            <Link
              key={id}
              to={to}
              className={`${styles.tabItem} ${activeTab === id ? styles.tabItemActive : ""}`}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────── */}
      <main className={styles.tabContent}>
        {activeTab === "inventory" && <StockInventory />}
        {activeTab === "inward" && <Inward />}
        {activeTab === "grn" && <GrnInventory />}
      </main>

    </div>
  );
}