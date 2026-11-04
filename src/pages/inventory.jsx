/**
 * Inventory Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Top-level route component for /inventory/*
 *
 * Responsibilities:
 *  • Renders the page header (title + subtitle + action buttons)
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
      <div className={styles.pageHeaderBanner}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Inventory</h1>
          <p className={styles.pageSubtitle}>
            Welcome back, Sarah. Here's a snapshot of your Inventory activity across all marketplaces.
          </p>
        </div>
        <div className={styles.pageHeaderActions}>
          <button className={styles.btnSecondaryOutline}>
            <span className={styles.btnIcon}>+</span> Add stock entry
          </button>
          <button className={styles.btnPrimarySolid}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Adjust stock in bulk</span>
          </button>
        </div>
      </div>

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