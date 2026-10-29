/**
 * GrnInventory Component
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the full "GRN" tab inside the Inventory page.
 *
 * A Goods Received Note (GRN) is created when a supplier's shipment (Inward)
 * physically arrives at a warehouse.  It records which SKUs arrived, how many
 * were received, how many passed quality check (accepted), how many failed
 * (rejected), and the overall QC status.
 *
 * Layout (mirrors the /stocks and /inward designs):
 *  1. Stats Row         – 5 StatCard components (Total / Approved / Pending QC /
 *                         Rejected / Acceptance Rate)
 *  2. Filter Toolbar    – status pills, Supplier & Warehouse dropdowns, Last 30
 *                         days button, Search input, Export button, + Create GRN
 *  3. Selection Banner  – contextual bulk-action strip when rows are checked
 *  4. Data Table        – checkbox, GRN ID (opens modal), Status, Inward Ref,
 *                         Supplier, SKUs, Received, Accepted, Rejected,
 *                         Warehouse, Date, Received By, Actions
 *  5. Pagination        – rows-per-page selector (10/15/20/50) + page controls
 *  6. GRNDetailModal    – popup showing per-SKU QC breakdown + action buttons
 *
 * Mock data is used as a fallback when the API returns empty or fails.
 */

import { useState, useEffect, useMemo } from "react";
import styles from "../css/pages/inventory.Inventory.module.css";

/* ─── Base API URL ───────────────────────────────────────────────────────── */
const BASE_URL = import.meta.env.VITE_BASEAPI;

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA  –  shown when the API returns empty (offline / demo mode)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * MOCK_GRN_STATS
 * Aggregate counts for the five stat cards and the quick-filter pills.
 */
const MOCK_GRN_STATS = {
  total: 38,
  approved: 31,
  pendingQc: 4,
  partial: 1,
  rejected: 2,
};

/**
 * MOCK_GRN_ROWS
 * Ten GRN records covering all status states and all three warehouses.
 *
 * grn_id            – unique GRN identifier string
 * grn_status        – "approved" | "pending_qc" | "partial" | "rejected" | "draft"
 * inward_ref        – the Inward order ID this GRN is based on
 * supplier          – supplier display name
 * supplier_location – city + state abbreviation
 * sku_count         – number of distinct SKU lines on this GRN
 * received_qty      – total units physically received
 * accepted_qty      – units that passed quality check
 * rejected_qty      – units that failed quality check
 * warehouse         – warehouse name
 * received_at       – ISO 8601 timestamp of physical receipt
 * received_by       – name of the staff member who received the shipment
 * qc_notes          – free-text QC observation (null when none)
 */
const MOCK_GRN_ROWS = [
  {
    grn_id: "GRN-2026-047",
    grn_status: "approved",
    inward_ref: 47,
    supplier: "Kayya Textiles",
    supplier_location: "Tirupur, TN",
    sku_count: 18,
    received_qty: 1240,
    accepted_qty: 1238,
    rejected_qty: 2,
    warehouse: "Bhiwandi WH-1",
    received_at: "2026-09-12T14:30:00Z",
    received_by: "Arjun M.",
    qc_notes: "2 pieces had loose thread at collar — rejected for rework.",
  },
  {
    grn_id: "GRN-2026-046",
    grn_status: "approved",
    inward_ref: 46,
    supplier: "Nova Apparel Co.",
    supplier_location: "Ludhiana, PB",
    sku_count: 9,
    received_qty: 640,
    accepted_qty: 640,
    rejected_qty: 0,
    warehouse: "Bhiwandi WH-1",
    received_at: "2026-09-12T13:45:00Z",
    received_by: "Priya S.",
    qc_notes: null,
  },
  {
    grn_id: "GRN-2026-045",
    grn_status: "partial",
    inward_ref: 45,
    supplier: "Silverline Footwear",
    supplier_location: "Agra, UP",
    sku_count: 14,
    received_qty: 380,
    accepted_qty: 350,
    rejected_qty: 30,
    warehouse: "Gurugram WH-2",
    received_at: "2026-09-11T16:00:00Z",
    received_by: "Arjun M.",
    qc_notes: "30 pairs rejected — sole adhesive failure on batch B-12.",
  },
  {
    grn_id: "GRN-2026-042",
    grn_status: "approved",
    inward_ref: 42,
    supplier: "Kayya Textiles",
    supplier_location: "Tirupur, TN",
    sku_count: 31,
    received_qty: 2140,
    accepted_qty: 2140,
    rejected_qty: 0,
    warehouse: "Bhiwandi WH-1",
    received_at: "2026-09-10T11:30:00Z",
    received_by: "Priya S.",
    qc_notes: null,
  },
  {
    grn_id: "GRN-2026-040",
    grn_status: "approved",
    inward_ref: 40,
    supplier: "Nova Apparel Co.",
    supplier_location: "Ludhiana, PB",
    sku_count: 15,
    received_qty: 1020,
    accepted_qty: 1018,
    rejected_qty: 2,
    warehouse: "Bhiwandi WH-1",
    received_at: "2026-09-09T12:00:00Z",
    received_by: "Arjun M.",
    qc_notes: "2 jackets with broken zippers — sent to vendor for credit note.",
  },
  {
    grn_id: "GRN-2026-039",
    grn_status: "pending_qc",
    inward_ref: 39,
    supplier: "Urban Mills Pvt Ltd",
    supplier_location: "Surat, GJ",
    sku_count: 8,
    received_qty: 305,
    accepted_qty: 0,
    rejected_qty: 0,
    warehouse: "Gurugram WH-2",
    received_at: "2026-09-08T17:30:00Z",
    received_by: "Karan T.",
    qc_notes: "Samples pulled for QC check — results pending.",
  },
  {
    grn_id: "GRN-2026-038",
    grn_status: "approved",
    inward_ref: 38,
    supplier: "Radiant Denim Works",
    supplier_location: "Ahmedabad, GJ",
    sku_count: 19,
    received_qty: 1410,
    accepted_qty: 1405,
    rejected_qty: 5,
    warehouse: "Bengaluru WH-3",
    received_at: "2026-09-08T10:00:00Z",
    received_by: "Priya S.",
    qc_notes: "5 jackets with fabric delamination on outer shell.",
  },
  {
    grn_id: "GRN-2026-036",
    grn_status: "rejected",
    inward_ref: 36,
    supplier: "Silverline Footwear",
    supplier_location: "Agra, UP",
    sku_count: 6,
    received_qty: 180,
    accepted_qty: 0,
    rejected_qty: 180,
    warehouse: "Bengaluru WH-3",
    received_at: "2026-09-06T15:00:00Z",
    received_by: "Karan T.",
    qc_notes: "Entire batch rejected — wrong colourway shipped vs. PO specification.",
  },
  {
    grn_id: "GRN-2026-035",
    grn_status: "approved",
    inward_ref: 35,
    supplier: "Urban Mills Pvt Ltd",
    supplier_location: "Surat, GJ",
    sku_count: 12,
    received_qty: 890,
    accepted_qty: 890,
    rejected_qty: 0,
    warehouse: "Gurugram WH-2",
    received_at: "2026-09-06T09:30:00Z",
    received_by: "Priya S.",
    qc_notes: null,
  },
  {
    grn_id: "GRN-2026-033",
    grn_status: "draft",
    inward_ref: 33,
    supplier: "Radiant Denim Works",
    supplier_location: "Ahmedabad, GJ",
    sku_count: 8,
    received_qty: 240,
    accepted_qty: 0,
    rejected_qty: 0,
    warehouse: "Bhiwandi WH-1",
    received_at: "2026-09-05T11:00:00Z",
    received_by: "Arjun M.",
    qc_notes: "GRN in progress — physical count ongoing.",
  },
];

/**
 * MOCK_GRN_SKU_LINES
 * Per-GRN SKU breakdown shown inside GRNDetailModal.
 * Key = grn_id string.  Each entry is an array of QC line objects.
 *
 * sku_id     – SKU identifier
 * name       – human-readable product name
 * po_qty     – quantity on the original purchase order
 * received   – units physically received in this shipment
 * accepted   – units that passed quality inspection
 * rejected   – units that failed quality inspection
 * condition  – "good" | "damaged" | "defective" | "missing"
 */
const MOCK_GRN_SKU_LINES = {
  "GRN-2026-047": [
    { sku_id: "SKU-7741-RED-M", name: "Red casual kurta — M", po_qty: 250, received: 250, accepted: 250, rejected: 0, condition: "good" },
    { sku_id: "SKU-7741-GRN-L", name: "Forest green kurta — L", po_qty: 180, received: 180, accepted: 178, rejected: 2, condition: "damaged" },
    { sku_id: "SKU-6202-BLK-M", name: "Classic zipper jacket — M", po_qty: 300, received: 300, accepted: 300, rejected: 0, condition: "good" },
    { sku_id: "SKU-7900-BEI-M", name: "Cotton kurta set — beige, M", po_qty: 260, received: 260, accepted: 260, rejected: 0, condition: "good" },
    { sku_id: "SKU-9021-NVY-9", name: "Navy running shoes — UK 9", po_qty: 250, received: 250, accepted: 250, rejected: 0, condition: "good" },
  ],
  "GRN-2026-046": [
    { sku_id: "SKU-7742-BLU-S", name: "Sky blue linen kurta — S", po_qty: 200, received: 200, accepted: 200, rejected: 0, condition: "good" },
    { sku_id: "SKU-6103-BLU-L", name: "Slim fit denim jacket — L", po_qty: 240, received: 240, accepted: 240, rejected: 0, condition: "good" },
    { sku_id: "SKU-7900-BEI-M", name: "Cotton kurta set — beige, M", po_qty: 200, received: 200, accepted: 200, rejected: 0, condition: "good" },
  ],
  "GRN-2026-045": [
    { sku_id: "SKU-9021-NVY-9", name: "Navy running shoes — UK 9", po_qty: 200, received: 200, accepted: 170, rejected: 30, condition: "defective" },
    { sku_id: "SKU-9022-BRN-8", name: "Brown leather boots — UK 8", po_qty: 150, received: 150, accepted: 150, rejected: 0, condition: "good" },
    { sku_id: "SKU-9023-WHT-7", name: "White canvas sneakers — UK 7", po_qty: 30, received: 30, accepted: 30, rejected: 0, condition: "good" },
  ],
  "GRN-2026-042": [
    { sku_id: "SKU-7741-RED-M", name: "Red casual kurta — M", po_qty: 300, received: 300, accepted: 300, rejected: 0, condition: "good" },
    { sku_id: "SKU-7741-GRN-L", name: "Forest green kurta — L", po_qty: 280, received: 280, accepted: 280, rejected: 0, condition: "good" },
    { sku_id: "SKU-7742-BLU-S", name: "Sky blue linen kurta — S", po_qty: 260, received: 260, accepted: 260, rejected: 0, condition: "good" },
    { sku_id: "SKU-7743-YLW-M", name: "Yellow print kurta — M", po_qty: 300, received: 300, accepted: 300, rejected: 0, condition: "good" },
    { sku_id: "SKU-7744-PNK-S", name: "Pink floral kurta — S", po_qty: 300, received: 300, accepted: 300, rejected: 0, condition: "good" },
    { sku_id: "SKU-7745-ONG-L", name: "Orange block kurta — L", po_qty: 300, received: 300, accepted: 300, rejected: 0, condition: "good" },
    { sku_id: "SKU-7746-PPL-M", name: "Purple mirror kurta — M", po_qty: 400, received: 400, accepted: 400, rejected: 0, condition: "good" },
  ],
  "GRN-2026-040": [
    { sku_id: "SKU-7742-BLU-S", name: "Sky blue linen kurta — S", po_qty: 280, received: 280, accepted: 280, rejected: 0, condition: "good" },
    { sku_id: "SKU-6202-BLK-M", name: "Classic zipper jacket — M", po_qty: 240, received: 240, accepted: 238, rejected: 2, condition: "defective" },
    { sku_id: "SKU-7900-BEI-M", name: "Cotton kurta set — beige, M", po_qty: 260, received: 260, accepted: 260, rejected: 0, condition: "good" },
    { sku_id: "SKU-9021-NVY-9", name: "Navy running shoes — UK 9", po_qty: 240, received: 240, accepted: 240, rejected: 0, condition: "good" },
  ],
  "GRN-2026-039": [
    { sku_id: "SKU-7900-BEI-M", name: "Cotton kurta set — beige, M", po_qty: 200, received: 120, accepted: 0, rejected: 0, condition: "good" },
    { sku_id: "SKU-7901-WHT-L", name: "White linen kurta set — L", po_qty: 105, received: 105, accepted: 0, rejected: 0, condition: "good" },
    { sku_id: "SKU-7902-BLU-S", name: "Blue block-print kurta set — S", po_qty: 80, received: 80, accepted: 0, rejected: 0, condition: "good" },
  ],
  "GRN-2026-038": [
    { sku_id: "SKU-6103-BLU-L", name: "Slim fit denim jacket — L", po_qty: 350, received: 350, accepted: 348, rejected: 2, condition: "damaged" },
    { sku_id: "SKU-6104-BLK-M", name: "Washed black denim jacket — M", po_qty: 300, received: 300, accepted: 297, rejected: 3, condition: "defective" },
    { sku_id: "SKU-6105-GRY-S", name: "Grey stretch denim jacket — S", po_qty: 400, received: 400, accepted: 400, rejected: 0, condition: "good" },
    { sku_id: "SKU-6106-WHT-L", name: "White raw denim jacket — L", po_qty: 360, received: 360, accepted: 360, rejected: 0, condition: "good" },
  ],
  "GRN-2026-036": [
    { sku_id: "SKU-9021-NVY-9", name: "Navy running shoes — UK 9", po_qty: 100, received: 100, accepted: 0, rejected: 100, condition: "defective" },
    { sku_id: "SKU-9022-BRN-8", name: "Brown leather boots — UK 8", po_qty: 80, received: 80, accepted: 0, rejected: 80, condition: "defective" },
  ],
  "GRN-2026-035": [
    { sku_id: "SKU-7900-BEI-M", name: "Cotton kurta set — beige, M", po_qty: 300, received: 300, accepted: 300, rejected: 0, condition: "good" },
    { sku_id: "SKU-7901-WHT-L", name: "White linen kurta set — L", po_qty: 290, received: 290, accepted: 290, rejected: 0, condition: "good" },
    { sku_id: "SKU-7902-BLU-S", name: "Blue block-print kurta set — S", po_qty: 300, received: 300, accepted: 300, rejected: 0, condition: "good" },
  ],
  "GRN-2026-033": [
    { sku_id: "SKU-6103-BLU-L", name: "Slim fit denim jacket — L", po_qty: 120, received: 120, accepted: 0, rejected: 0, condition: "good" },
    { sku_id: "SKU-6104-BLK-M", name: "Washed black denim jacket — M", po_qty: 120, received: 120, accepted: 0, rejected: 0, condition: "good" },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
   STATUS CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Maps a grn_status string → display label + CSS module class name applied on
 * top of the shared .statusBadge base class.
 */
const STATUS_CONFIG = {
  approved: { label: "Approved", cls: "badgeInStock" },
  pending_qc: { label: "Pending QC", cls: "badgeLowStock" },
  partial: { label: "Partial", cls: "badgeOverstock" },
  rejected: { label: "Rejected", cls: "badgeOOS" },
  draft: { label: "Draft", cls: "badgeDraft" },
};

/**
 * Resolves a raw status string into its display config.
 * @param {string} raw  - grn_status value from API or mock
 * @returns {{ label: string, cls: string }}
 */
function resolveStatus(raw = "") {
  return STATUS_CONFIG[raw.toLowerCase()] ?? { label: raw, cls: "" };
}

/**
 * Maps a SKU-line condition value → the CSS module class for its badge.
 * @type {{ [condition: string]: string }}
 */
const CONDITION_CLS = {
  good: "badgeInStock",
  damaged: "badgeOOS",
  defective: "badgeLowStock",
  missing: "badgeMissing",
};

/* ═══════════════════════════════════════════════════════════════════════════
   QUICK-FILTER PILL DEFINITIONS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * PILLS
 * Ordered list of quick-filter pills shown in the toolbar.
 * apiParam is appended to the base endpoint URL when fetching rows.
 */
const PILLS = [
  { id: "total", label: "All", apiParam: "" },
  { id: "approved", label: "Approved", apiParam: "?status=approved" },
  { id: "pending_qc", label: "Pending QC", apiParam: "?status=pending_qc" },
  { id: "partial", label: "Partial", apiParam: "?status=partial" },
  { id: "rejected", label: "Rejected", apiParam: "?status=rejected" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   SUPPLIER AVATAR HELPER
   ═══════════════════════════════════════════════════════════════════════════ */

/** Deterministic colour palette for supplier avatars. */
const AVATAR_PALETTE = [
  "#4f46e5", "#0891b2", "#059669", "#d97706",
  "#dc2626", "#7c3aed", "#db2777", "#0040D6",
];

/**
 * Derives a stable background colour from a supplier name string.
 * @param {string} name
 * @returns {string} hex colour
 */
function avatarBg(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

/**
 * Extracts up to 2 uppercase initials from a full name.
 * @param {string} name
 * @returns {string}
 */
function initials(name = "") {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

/**
 * SupplierAvatar
 * A 2-letter coloured circle derived from the name (no external images needed).
 *
 * Props:
 *  name   string   Full name to derive initials + colour from
 *  size   number   Diameter in px (default 28)
 */
function SupplierAvatar({ name, size = 28 }) {
  const fontSize = size < 32 ? 11 : 13;
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: avatarBg(name),
        color: "#ffffff",
        fontSize,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}
    >
      {initials(name)}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DATE HELPER
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Formats an ISO timestamp as "Mon, Sep 12 2026".
 * @param {string|null} ts  ISO 8601 timestamp
 * @returns {string}
 */
function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * StatCard
 * One of the five summary cards across the top of the GRN view.
 *
 * Props:
 *  label      string   Card label (e.g. "Total GRNs")
 *  value      string   Large number or percentage to display
 *  sub        string   Smaller sub-text below the value
 *  subClass   string   Optional CSS class for coloured sub-text
 */
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

/* ═══════════════════════════════════════════════════════════════════════════
   GRN DETAIL MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * GRNDetailModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Centred popup that shows when a user clicks a GRN ID or the eye icon.
 *
 * Sections:
 *  – Header bar (sticky grey bg) : GRN ID title + status badge + ✕ close button
 *  – Meta strip (4-column grid)  : Supplier · Inward Ref · Warehouse · Received by + Date
 *  – SKU line table              : SKU | Product | PO Qty | Received | Accepted | Rejected | Condition
 *  – QC Notes (conditional)      : amber left-bordered box with italic note text
 *  – Summary strip               : X received · Y accepted · Z rejected · W% acceptance rate
 *  – Action buttons              : Close + context-sensitive primary action
 *
 * Props:
 *  row      object   The GRN row that was clicked
 *  onClose  fn       Called when the user dismisses the modal
 */
function GRNDetailModal({ row, onClose }) {
  const { label: statusLabel, cls: statusCls } = resolveStatus(row.grn_status);

  /* Look up mock SKU lines for this GRN; fall back to an empty list. */
  const skuLines = MOCK_GRN_SKU_LINES[row.grn_id] ?? [];

  /* Acceptance rate — guard against division by zero. */
  const acceptRate = row.received_qty > 0
    ? Math.round((row.accepted_qty / row.received_qty) * 100)
    : 0;

  /* Dismiss on Escape key */
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /**
   * Renders the context-sensitive primary action button based on status.
   * @returns {JSX.Element|null}
   */
  function PrimaryAction() {
    const status = (row.grn_status ?? "").toLowerCase();

    if (status === "pending_qc") {
      return (
        <button
          className={styles.distributeConfirmBtn}
          onClick={() => {
            console.info("[GRNDetailModal] Approving GRN:", row.grn_id);
            onClose();
          }}
        >
          Approve GRN
        </button>
      );
    }
    if (status === "draft") {
      return (
        <button
          className={styles.distributeConfirmBtn}
          onClick={() => {
            console.info("[GRNDetailModal] Submitting GRN for QC:", row.grn_id);
            onClose();
          }}
        >
          Submit for QC
        </button>
      );
    }
    if (status === "partial") {
      return (
        <button
          className={styles.distributeConfirmBtn}
          onClick={() => {
            console.info("[GRNDetailModal] Approving partial GRN:", row.grn_id);
            onClose();
          }}
        >
          Approve Partial
        </button>
      );
    }
    /* "approved" and "rejected" — close only */
    return null;
  }

  return (
    /* ── Backdrop ── */
    <div
      className={styles.distributeOverlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="grn-detail-title"
    >
      {/* ── Modal card ── */}
      <div className={styles.inwardDetailCard}>

        {/* ── Header bar ───────────────────────────────────────────────── */}
        <div className={styles.inwardDetailHeader}>
          <div className={styles.inwardDetailHeadLeft}>
            <h2 id="grn-detail-title" className={styles.inwardDetailTitle}>
              {row.grn_id}
            </h2>
            <span className={`${styles.statusBadge} ${styles[statusCls]}`}>
              <span className={styles.statusDot} />
              {statusLabel}
            </span>
          </div>
          {/* Close button */}
          <button
            className={styles.inwardDetailCloseBtn}
            onClick={onClose}
            aria-label="Close GRN detail"
          >
            ✕
          </button>
        </div>

        {/* ── Meta strip (4-column grid) ───────────────────────────────── */}
        <div className={styles.inwardDetailMeta}>

          {/* Supplier */}
          <div className={styles.inwardDetailMetaItem}>
            <span className={styles.inwardDetailMetaLabel}>Supplier</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SupplierAvatar name={row.supplier ?? "?"} size={24} />
              <div style={{ lineHeight: 1.3 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                  {row.supplier ?? "—"}
                </span>
                {row.supplier_location && (
                  <span style={{ display: "block", fontSize: 11, color: "#9ca3af" }}>
                    {row.supplier_location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Inward Ref */}
          <div className={styles.inwardDetailMetaItem}>
            <span className={styles.inwardDetailMetaLabel}>Inward Ref</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#2563eb",
              }}
            >
              #{row.inward_ref}
            </span>
          </div>

          {/* Warehouse */}
          <div className={styles.inwardDetailMetaItem}>
            <span className={styles.inwardDetailMetaLabel}>Warehouse</span>
            <div className={styles.warehouseCell}>
              <span className={styles.warehouseDot} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                {row.warehouse ?? "—"}
              </span>
            </div>
          </div>

          {/* Received by + Date */}
          <div className={styles.inwardDetailMetaItem}>
            <span className={styles.inwardDetailMetaLabel}>Received by</span>
            {row.received_by ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <SupplierAvatar name={row.received_by} size={22} />
                <div style={{ lineHeight: 1.3 }}>
                  <span style={{ fontSize: 13, color: "#374151" }}>{row.received_by}</span>
                  <span style={{ display: "block", fontSize: 11, color: "#9ca3af" }}>
                    {fmtDate(row.received_at)}
                  </span>
                </div>
              </div>
            ) : (
              <span style={{ color: "#9ca3af", fontSize: 13 }}>—</span>
            )}
          </div>
        </div>

        {/* ── SKU line-items table ─────────────────────────────────────── */}
        <div className={styles.inwardSkuSection}>
          <p className={styles.inwardSkuSectionTitle}>SKU quality breakdown</p>

          {skuLines.length === 0 ? (
            <p className={styles.inwardSkuEmpty}>
              No SKU breakdown available for this GRN.
            </p>
          ) : (
            <div className={styles.inwardSkuTableWrap}>
              <table className={styles.inwardSkuTable}>
                <thead>
                  <tr className={styles.inwardSkuHead}>
                    <th className={styles.inwardSkuThSku}>SKU</th>
                    <th className={styles.inwardSkuThName}>Product</th>
                    <th className={styles.inwardSkuThNum}>PO Qty</th>
                    <th className={styles.inwardSkuThNum}>Received</th>
                    <th className={styles.inwardSkuThNum}>Accepted</th>
                    <th className={styles.inwardSkuThNum}>Rejected</th>
                    <th className={styles.inwardSkuThStatus}>Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {skuLines.map((line) => (
                    <tr key={line.sku_id} className={styles.inwardSkuRow}>
                      <td className={styles.inwardSkuTdSku}>{line.sku_id}</td>
                      <td className={styles.inwardSkuTdName}>{line.name}</td>
                      <td className={styles.inwardSkuTdNum}>
                        {line.po_qty.toLocaleString("en-IN")}
                      </td>
                      <td className={styles.inwardSkuTdNum}>
                        {line.received.toLocaleString("en-IN")}
                      </td>
                      <td className={styles.inwardSkuTdNum}>
                        {line.accepted.toLocaleString("en-IN")}
                      </td>
                      <td className={styles.inwardSkuTdNum}>
                        {line.rejected.toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${styles[CONDITION_CLS[line.condition] ?? ""]
                            }`}
                          style={{ fontSize: 11 }}
                        >
                          <span className={styles.statusDot} />
                          {line.condition.charAt(0).toUpperCase() + line.condition.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── QC Notes (shown only when present) ───────────────────────── */}
        {row.qc_notes && (
          <div style={{ padding: "0 0 4px 0" }}>
            <p className={styles.grnQcNoteLabel}>QC Notes:</p>
            <div className={styles.grnQcNote}>{row.qc_notes}</div>
          </div>
        )}

        {/* ── Summary strip ─────────────────────────────────────────────── */}
        <div className={styles.inwardDetailSummary}>
          <span>
            <strong>{row.received_qty.toLocaleString("en-IN")}</strong> received
          </span>
          <span className={styles.inwardDetailSumDivider}>·</span>
          <span>
            <strong>{row.accepted_qty.toLocaleString("en-IN")}</strong> accepted
          </span>
          <span className={styles.inwardDetailSumDivider}>·</span>
          <span>
            <strong>{row.rejected_qty.toLocaleString("en-IN")}</strong> rejected
          </span>
          <span className={styles.inwardDetailSumDivider}>·</span>
          <span className={styles.grnAcceptRateRow}>
            <strong>{acceptRate}%</strong> acceptance rate
            <div
              className={`${styles.stockBarTrack} ${styles.grnAcceptRateBar}`}
              title={`${acceptRate}% acceptance`}
            >
              <div
                className={`${styles.stockBarFill} ${styles.barInStock}`}
                style={{ width: `${Math.min(acceptRate, 100)}%` }}
              />
            </div>
          </span>
        </div>

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <div className={styles.distributeFooter}>
          <button
            className={styles.distributeCancelBtn}
            onClick={onClose}
          >
            Close
          </button>
          <PrimaryAction />
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function GrnInventory() {

  /* ── State ──────────────────────────────────────────────────────────────── */

  /** Aggregate pill counts (from API or mock). */
  const [counts, setCounts] = useState({
    total: "—", approved: "—", pendingQc: "—", partial: "—", rejected: "—",
  });

  /** Full row data (from API or mock). */
  const [items, setItems] = useState([]);

  /** Active quick-filter pill id. */
  const [filter, setFilter] = useState("total");

  /** Free-text search query (client-side only). */
  const [search, setSearch] = useState("");

  /** Set of selected grn_id strings. */
  const [selected, setSelected] = useState(new Set());

  /** The GRN row whose detail modal is open (null = closed). */
  const [detailRow, setDetailRow] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* ── Fetch aggregate counts ─────────────────────────────────────────────── */
  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch(`${BASE_URL}/inventory/grn-count`, { credentials: "include" });
        const data = await res.json();
        setCounts({
          total: data.total ?? MOCK_GRN_STATS.total,
          approved: data.approved ?? MOCK_GRN_STATS.approved,
          pendingQc: data.pendingQc ?? MOCK_GRN_STATS.pendingQc,
          partial: data.partial ?? MOCK_GRN_STATS.partial,
          rejected: data.rejected ?? MOCK_GRN_STATS.rejected,
        });
      } catch (err) {
        console.warn("[GrnInventory] /grn-count failed – using mock counts.", err);
        setCounts(MOCK_GRN_STATS);
      }
    }
    fetchCounts();
  }, []);

  /* ── Fetch table rows ───────────────────────────────────────────────────── */
  useEffect(() => {
    async function fetchRows() {
      const pill = PILLS.find((p) => p.id === filter);
      const apiParam = pill?.apiParam ?? "";

      try {
        const res = await fetch(`${BASE_URL}/inventory/grn${apiParam}`, { credentials: "include" });
        const data = await res.json();

        /* Use real rows when present, otherwise fall back to mock */
        const rows = Array.isArray(data) && data.length > 0
          ? data
          : filter === "total"
            ? MOCK_GRN_ROWS
            : MOCK_GRN_ROWS.filter((r) => r.grn_status === filter);

        setItems(rows);
        setPage(1);
        setSelected(new Set());
      } catch (err) {
        console.warn("[GrnInventory] /grn request failed – using mock rows.", err);
        const rows = filter === "total"
          ? MOCK_GRN_ROWS
          : MOCK_GRN_ROWS.filter((r) => r.grn_status === filter);
        setItems(rows);
        setPage(1);
        setSelected(new Set());
      }
    }
    fetchRows();
  }, [filter]);

  /* ── Client-side search ─────────────────────────────────────────────────── */

  /** Items after client-side search filtering on grn_id or supplier name. */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (row) =>
        (row.grn_id ?? "").toLowerCase().includes(q) ||
        (row.supplier ?? "").toLowerCase().includes(q)
    );
  }, [items, search]);

  /* ── Pagination slice ───────────────────────────────────────────────────── */
  const pageItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  /* ── Selection helpers ──────────────────────────────────────────────────── */
  const allPageSelected =
    pageItems.length > 0 && pageItems.every((r) => selected.has(r.grn_id));

  /** Toggle all visible page rows in or out of the selection. */
  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageItems.forEach((r) => next.delete(r.grn_id));
      } else {
        pageItems.forEach((r) => next.add(r.grn_id));
      }
      return next;
    });
  }

  /**
   * Toggle a single row in or out of the selection.
   * @param {string} id  grn_id
   */
  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /* ── Pill labels with live counts ───────────────────────────────────────── */
  const pillsWithCounts = PILLS.map((p) => {
    const count = p.id === "total" ? counts.total
      : p.id === "approved" ? counts.approved
        : p.id === "pending_qc" ? counts.pendingQc
          : p.id === "partial" ? counts.partial
            : p.id === "rejected" ? counts.rejected
              : "—";
    return {
      ...p,
      label: `${p.label}${count !== "—" ? " " + count : ""}`,
    };
  });

  /* ═══════════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className={styles.stockRoot}>

      {/* ════════════════════════════════════════════════════════════════════
          1. Stats Row
         ════════════════════════════════════════════════════════════════════ */}
      <section className={styles.statsRow} aria-label="GRN summary">
        <StatCard
          label="Total GRNs"
          value={counts.total}
          sub="Across all suppliers"
        />
        <StatCard
          label="Approved"
          value={counts.approved}
          sub="Stock updated"
          subClass={styles.subWarn}
        />
        <StatCard
          label="Pending QC"
          value={counts.pendingQc}
          sub="Awaiting review"
          subClass={styles.subWarn}
        />
        <StatCard
          label="Rejected"
          value={counts.rejected}
          sub="Being returned"
          subClass={styles.subDanger}
        />
        <StatCard
          label="Acceptance Rate"
          value="96.8%"
          sub="Units quality-passed"
          subClass={styles.subWarn}
        />
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          2. Filter Toolbar
         ════════════════════════════════════════════════════════════════════ */}
      <div className={styles.toolbar}>

        {/* Status quick-filter pills */}
        <div className={styles.pillGroup} role="group" aria-label="Filter by status">
          {pillsWithCounts.map(({ id, label }) => (
            <button
              key={id}
              className={`${styles.pill} ${filter === id ? styles.pillActive : ""}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Supplier + Warehouse dropdowns + date button */}
        <div className={styles.dropdownGroup}>
          <select className={styles.toolbarSelect} aria-label="Filter by supplier">
            <option value="">Supplier ▾</option>
            <option value="kayya">Kayya Textiles</option>
            <option value="nova">Nova Apparel Co.</option>
            <option value="silverline">Silverline Footwear</option>
            <option value="urban">Urban Mills Pvt Ltd</option>
            <option value="radiant">Radiant Denim Works</option>
          </select>

          <select className={styles.toolbarSelect} aria-label="Filter by warehouse">
            <option value="">Warehouse ▾</option>
            <option value="wh1">Bhiwandi WH-1</option>
            <option value="wh2">Gurugram WH-2</option>
            <option value="wh3">Bengaluru WH-3</option>
          </select>

          {/* Date range pseudo-button */}
          <button className={styles.btnExport} aria-label="Select date range">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="1" y="2.5" width="12" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.4" />
              <path d="M4.5 1v3M9.5 1v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Last 30 days
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchBox}>
          <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.75" stroke="#9CA3AF" strokeWidth="1.5" />
            <path d="M13 13l3.5 3.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by GRN ID or supplier"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Search GRN records"
          />
        </div>

        {/* Right-side action buttons */}
        <div className={styles.actionGroup}>
          <button className={styles.btnExport} title="Export GRN records">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v8M4 7l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export
          </button>

          <button className={styles.btnAdjust}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            + Create GRN
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          3. Selection Banner (visible only when ≥ 1 row is checked)
         ════════════════════════════════════════════════════════════════════ */}
      {selected.size > 0 && (
        <div className={styles.selectionBanner} role="status" aria-live="polite">
          <span className={styles.selectionCount}>
            {selected.size} GRN{selected.size !== 1 ? "s" : ""} selected
          </span>
          <div className={styles.selectionActions}>
            <button className={styles.selActionBtn}>Mark approved</button>
            <button className={styles.selActionBtn}>Export selected</button>
            <button className={`${styles.selActionBtn} ${styles.selActionDanger}`}>Delete</button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          4. Data Table
         ════════════════════════════════════════════════════════════════════ */}
      <div className={styles.tableWrapper} role="region" aria-label="GRN records table">
        <table className={styles.dataTable}>

          {/* ── Column Headers ──────────────────────────────────────────── */}
          <thead>
            <tr className={styles.tableHead}>
              <th className={styles.thCheck}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={allPageSelected}
                  onChange={toggleAll}
                  aria-label="Select all visible rows"
                />
              </th>
              <th className={styles.thCell} style={{ minWidth: 130 }}>GRN ID&nbsp;▼</th>
              <th className={styles.thCell}>STATUS</th>
              <th className={styles.thCell}>INWARD REF</th>
              <th className={styles.thCell} style={{ minWidth: 180 }}>SUPPLIER</th>
              <th className={styles.thNum}>SKUS</th>
              <th className={styles.thNum}>RECEIVED</th>
              <th className={styles.thNum}>ACCEPTED</th>
              <th className={styles.thNum}>REJECTED</th>
              <th className={styles.thCell}>WAREHOUSE</th>
              <th className={styles.thCell} style={{ minWidth: 130 }}>DATE&nbsp;▼</th>
              <th className={styles.thCell} style={{ minWidth: 120 }}>RECEIVED BY</th>
              <th className={styles.thActions}>ACTIONS</th>
            </tr>
          </thead>

          {/* ── Table Body ──────────────────────────────────────────────── */}
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={13} className={styles.emptyRow}>
                  No GRN records found.
                </td>
              </tr>
            ) : (
              pageItems.map((row) => {
                const id = row.grn_id;
                const isChecked = selected.has(id);
                const { label: statusLabel, cls: statusCls } = resolveStatus(row.grn_status);

                return (
                  <tr
                    key={id}
                    className={`${styles.tableRow} ${isChecked ? styles.tableRowSelected : ""}`}
                  >
                    {/* ── Checkbox ── */}
                    <td className={styles.tdCheck}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={isChecked}
                        onChange={() => toggleRow(id)}
                        aria-label={`Select ${id}`}
                      />
                    </td>

                    {/* ── GRN ID – opens detail modal on click ── */}
                    <td className={styles.tdCell}>
                      <button
                        className={styles.inwardIdBtn}
                        onClick={() => setDetailRow(row)}
                        title={`View details for ${id}`}
                      >
                        {id}
                      </button>
                    </td>

                    {/* ── Status badge ── */}
                    <td className={styles.tdCell}>
                      <span className={`${styles.statusBadge} ${styles[statusCls]}`}>
                        <span className={styles.statusDot} />
                        {statusLabel}
                      </span>
                    </td>

                    {/* ── Inward Ref ── */}
                    <td className={styles.tdCell}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#2563eb",
                        }}
                      >
                        #{row.inward_ref}
                      </span>
                    </td>

                    {/* ── Supplier – avatar + name + location ── */}
                    <td className={styles.tdCell}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <SupplierAvatar name={row.supplier ?? "?"} />
                        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                            {row.supplier ?? "Unknown supplier"}
                          </span>
                          {row.supplier_location && (
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>
                              {row.supplier_location}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ── SKU count ── */}
                    <td className={styles.tdNum}>{row.sku_count ?? 0}</td>

                    {/* ── Received qty ── */}
                    <td className={styles.tdNum}>
                      {(row.received_qty ?? 0).toLocaleString("en-IN")}
                    </td>

                    {/* ── Accepted qty ── */}
                    <td className={styles.tdNum}>
                      {(row.accepted_qty ?? 0).toLocaleString("en-IN")}
                    </td>

                    {/* ── Rejected qty ── */}
                    <td className={styles.tdNum}>
                      {(row.rejected_qty ?? 0).toLocaleString("en-IN")}
                    </td>

                    {/* ── Warehouse ── */}
                    <td className={styles.tdCell}>
                      <div className={styles.warehouseCell}>
                        <span className={styles.warehouseDot} />
                        {row.warehouse ?? "—"}
                      </div>
                    </td>

                    {/* ── Received date ── */}
                    <td className={styles.tdCell} style={{ fontSize: 12, color: "#6b7280" }}>
                      {fmtDate(row.received_at)}
                    </td>

                    {/* ── Received by ── */}
                    <td className={styles.tdCell}>
                      {row.received_by ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <SupplierAvatar name={row.received_by} size={22} />
                          <span style={{ fontSize: 13, color: "#374151" }}>
                            {row.received_by}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "#9ca3af" }}>—</span>
                      )}
                    </td>

                    {/* ── Row actions: eye opens modal + overflow ── */}
                    <td className={styles.tdActions}>
                      {/* Eye / view icon → opens the detail modal */}
                      <button
                        className={styles.actionBtn}
                        title="View GRN details"
                        aria-label={`View ${id}`}
                        onClick={() => setDetailRow(row)}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <ellipse cx="7" cy="7" rx="5.5" ry="3.5" stroke="currentColor" strokeWidth="1.3" />
                          <circle cx="7" cy="7" r="1.5" fill="currentColor" />
                        </svg>
                      </button>

                      {/* Three-dot overflow */}
                      <button
                        className={styles.actionBtn}
                        title="More actions"
                        aria-label="More actions"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="3" r="1" fill="currentColor" />
                          <circle cx="7" cy="7" r="1" fill="currentColor" />
                          <circle cx="7" cy="11" r="1" fill="currentColor" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          5. Pagination
         ════════════════════════════════════════════════════════════════════ */}
      <div className={styles.pagination}>

        <div className={styles.paginationLeft}>
          <label htmlFor="grnRowsPerPage" className={styles.paginationLabel}>
            Rows per page
          </label>
          <select
            id="grnRowsPerPage"
            className={styles.paginationSelect}
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
          >
            {[10, 15, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span className={styles.paginationInfo}>
            Showing {Math.min((page - 1) * rowsPerPage + 1, filtered.length)}–
            {Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}
          </span>
        </div>

        <div className={styles.paginationRight}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            ‹
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`${styles.pageBtn} ${page === n ? styles.pageBtnActive : ""}`}
              onClick={() => setPage(n)}
              aria-current={page === n ? "page" : undefined}
            >
              {n}
            </button>
          ))}
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          6. GRN Detail Modal
         ════════════════════════════════════════════════════════════════════ */}
      {detailRow && (
        <GRNDetailModal
          row={detailRow}
          onClose={() => setDetailRow(null)}
        />
      )}

    </div> /* .stockRoot */
  );
}

