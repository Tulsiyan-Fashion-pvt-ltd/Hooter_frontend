/**
 * InwardInventory Component
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the full "Inward" tab inside the Inventory page.
 *
 * Layout (mirrors the /stocks design from stockInventory.jsx):
 *  1. Subtitle bar      – total records + supplier/warehouse summary
 *  2. Filter Toolbar    – status pills (All / Completed / Pending / Partial /
 *                         Draft), Supplier & Warehouse dropdowns, date-range
 *                         filter, Search input, Export button, Create inward
 *  3. Selection Banner  – contextual bulk-action links when rows are checked
 *  4. Data Table        – checkbox, Inward ID (opens detail modal), Status
 *                         badge, Supplier avatar+name, SKUs, Quantity,
 *                         Warehouse, Created date, Last updated by, Actions
 *  5. Pagination        – rows-per-page selector + page number controls
 *  6. InwardDetailModal – popup showing per-SKU breakdown, opened by clicking
 *                         the Inward ID link in any row
 *
 * Mock data is used as a fallback when the API returns empty or fails.
 * The Create Inward popup is wired to the "+ Create inward" button.
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate }                  from "react-router-dom";

import styles            from "../css/pages/inventory.Inventory.module.css";
import CreateInwardPopup from "./createInwardPopup";

/* ─── Base API URL ───────────────────────────────────────────────────────── */
const BASE_URL = import.meta.env.VITE_BASEAPI;

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA  –  shown when the API returns empty (offline / demo mode)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * MOCK_COUNTS
 * Aggregate counts for the quick-filter pills.
 * Matches the "47 total records across…" screenshot exactly.
 */
const MOCK_COUNTS = {
  total:     47,
  completed: 28,
  pending:   9,
  partial:   6,
  draft:     4,
};

/**
 * MOCK_INWARD_ROWS
 * Ten inward records covering all four status states and all three warehouses.
 * Matches the Inward Records screenshot precisely.
 *
 * _hasDraft  – UI-only flag: shows an extra "Saved draft" badge on that row.
 */
const MOCK_INWARD_ROWS = [
  {
    inward_id:       47,
    inward_status:   "completed",
    supplier:        "Kayya Textiles",
    supplier_location:"Tirupur, TN",
    sku_count:       18,
    total_quantity:  1240,
    warehouse:       "Bhiwandi WH-1",
    created_at:      "2026-09-12T09:14:00Z",
    updated_by:      "Sarah A.",
  },
  {
    inward_id:       46,
    inward_status:   "completed",
    supplier:        "Nova Apparel Co.",
    supplier_location:"Ludhiana, PB",
    sku_count:       9,
    total_quantity:  640,
    warehouse:       "Bhiwandi WH-1",
    created_at:      "2026-09-12T08:55:00Z",
    updated_by:      "Rohit K.",
  },
  {
    inward_id:       45,
    inward_status:   "partial",
    supplier:        "Silverline Footwear",
    supplier_location:"Agra, UP",
    sku_count:       14,
    total_quantity:  380,
    warehouse:       "Gurugram WH-2",
    created_at:      "2026-09-11T14:30:00Z",
    updated_by:      "Sarah A.",
  },
  {
    inward_id:       44,
    inward_status:   "pending",
    supplier:        "Urban Mills Pvt Ltd",
    supplier_location:"Surat, GJ",
    sku_count:       22,
    total_quantity:  1860,
    warehouse:       "Bengaluru WH-3",
    created_at:      "2026-09-11T11:20:00Z",
    updated_by:      "Meera J.",
  },
  {
    inward_id:       43,
    inward_status:   "draft",
    supplier:        "Radiant Denim Works",
    supplier_location:"Ahmedabad, GJ",
    sku_count:       6,
    total_quantity:  210,
    warehouse:       "Gurugram WH-2",
    created_at:      "2026-09-10T16:45:00Z",
    updated_by:      "Rohit K.",
    _hasDraft:       true,
  },
  {
    inward_id:       42,
    inward_status:   "completed",
    supplier:        "Kayya Textiles",
    supplier_location:"Tirupur, TN",
    sku_count:       31,
    total_quantity:  2140,
    warehouse:       "Bhiwandi WH-1",
    created_at:      "2026-09-10T09:00:00Z",
    updated_by:      "Sarah A.",
  },
  {
    inward_id:       41,
    inward_status:   "pending",
    supplier:        "Silverline Footwear",
    supplier_location:"Agra, UP",
    sku_count:       11,
    total_quantity:  495,
    warehouse:       "Bengaluru WH-3",
    created_at:      "2026-09-09T13:10:00Z",
    updated_by:      "Meera J.",
  },
  {
    inward_id:       40,
    inward_status:   "completed",
    supplier:        "Nova Apparel Co.",
    supplier_location:"Ludhiana, PB",
    sku_count:       15,
    total_quantity:  1020,
    warehouse:       "Bhiwandi WH-1",
    created_at:      "2026-09-09T10:30:00Z",
    updated_by:      "Sarah A.",
  },
  {
    inward_id:       39,
    inward_status:   "partial",
    supplier:        "Urban Mills Pvt Ltd",
    supplier_location:"Surat, GJ",
    sku_count:       8,
    total_quantity:  305,
    warehouse:       "Gurugram WH-2",
    created_at:      "2026-09-08T15:00:00Z",
    updated_by:      "Rohit K.",
  },
  {
    inward_id:       38,
    inward_status:   "completed",
    supplier:        "Radiant Denim Works",
    supplier_location:"Ahmedabad, GJ",
    sku_count:       19,
    total_quantity:  1410,
    warehouse:       "Bengaluru WH-3",
    created_at:      "2026-09-08T08:45:00Z",
    updated_by:      "Meera J.",
  },
];

/**
 * MOCK_SKU_LINES
 * Per-inward SKU breakdown shown inside the InwardDetailModal.
 * Key = inward_id.  Each entry is an array of received-line objects.
 *
 * status: "received" | "partial" | "pending"
 */
const MOCK_SKU_LINES = {
  47: [
    { sku_id: "SKU-7741-RED-M", name: "Red casual kurta — M",       ordered: 250, received: 250, status: "received" },
    { sku_id: "SKU-7741-GRN-L", name: "Forest green kurta — L",     ordered: 180, received: 180, status: "received" },
    { sku_id: "SKU-6202-BLK-M", name: "Classic zipper jacket — M",  ordered: 300, received: 300, status: "received" },
    { sku_id: "SKU-7900-BEI-M", name: "Cotton kurta set — beige, M",ordered: 260, received: 260, status: "received" },
    { sku_id: "SKU-9021-NVY-9", name: "Navy running shoes — UK 9",   ordered: 250, received: 250, status: "received" },
  ],
  46: [
    { sku_id: "SKU-7742-BLU-S", name: "Sky blue linen kurta — S",   ordered: 200, received: 200, status: "received" },
    { sku_id: "SKU-6103-BLU-L", name: "Slim fit denim jacket — L",  ordered: 240, received: 240, status: "received" },
    { sku_id: "SKU-7900-BEI-M", name: "Cotton kurta set — beige, M",ordered: 200, received: 200, status: "received" },
  ],
  45: [
    { sku_id: "SKU-9021-NVY-9", name: "Navy running shoes — UK 9",   ordered: 200, received: 140, status: "partial" },
    { sku_id: "SKU-9022-BRN-8", name: "Brown leather boots — UK 8",  ordered: 150, received: 150, status: "received" },
    { sku_id: "SKU-9023-WHT-7", name: "White canvas sneakers — UK 7",ordered: 100, received: 90,  status: "partial" },
  ],
  44: [
    { sku_id: "SKU-7900-BEI-M", name: "Cotton kurta set — beige, M", ordered: 400, received: 0, status: "pending" },
    { sku_id: "SKU-7901-WHT-L", name: "White linen kurta set — L",   ordered: 380, received: 0, status: "pending" },
    { sku_id: "SKU-7902-BLU-S", name: "Blue block-print kurta set — S",ordered: 320,received: 0, status: "pending" },
    { sku_id: "SKU-7903-GRN-M", name: "Green silk kurta set — M",    ordered: 360, received: 0, status: "pending" },
    { sku_id: "SKU-7904-RED-L", name: "Red embroidered kurta set — L",ordered: 400,received: 0, status: "pending" },
  ],
  43: [
    { sku_id: "SKU-6103-BLU-L", name: "Slim fit denim jacket — L",  ordered: 120, received: 0, status: "pending" },
    { sku_id: "SKU-6104-BLK-M", name: "Washed black denim jacket — M",ordered: 90, received: 0, status: "pending" },
  ],
  42: [
    { sku_id: "SKU-7741-RED-M", name: "Red casual kurta — M",        ordered: 300, received: 300, status: "received" },
    { sku_id: "SKU-7741-GRN-L", name: "Forest green kurta — L",      ordered: 280, received: 280, status: "received" },
    { sku_id: "SKU-7742-BLU-S", name: "Sky blue linen kurta — S",    ordered: 260, received: 260, status: "received" },
    { sku_id: "SKU-7743-YLW-M", name: "Yellow print kurta — M",      ordered: 300, received: 300, status: "received" },
    { sku_id: "SKU-7744-PNK-S", name: "Pink floral kurta — S",       ordered: 300, received: 300, status: "received" },
    { sku_id: "SKU-7745-ONG-L", name: "Orange block kurta — L",      ordered: 300, received: 300, status: "received" },
    { sku_id: "SKU-7746-PPL-M", name: "Purple mirror kurta — M",     ordered: 400, received: 400, status: "received" },
  ],
  41: [
    { sku_id: "SKU-9021-NVY-9", name: "Navy running shoes — UK 9",   ordered: 250, received: 0, status: "pending" },
    { sku_id: "SKU-9022-BRN-8", name: "Brown leather boots — UK 8",  ordered: 245, received: 0, status: "pending" },
  ],
  40: [
    { sku_id: "SKU-7742-BLU-S", name: "Sky blue linen kurta — S",    ordered: 280, received: 280, status: "received" },
    { sku_id: "SKU-6202-BLK-M", name: "Classic zipper jacket — M",   ordered: 240, received: 240, status: "received" },
    { sku_id: "SKU-7900-BEI-M", name: "Cotton kurta set — beige, M", ordered: 260, received: 260, status: "received" },
    { sku_id: "SKU-9021-NVY-9", name: "Navy running shoes — UK 9",   ordered: 240, received: 240, status: "received" },
  ],
  39: [
    { sku_id: "SKU-7900-BEI-M", name: "Cotton kurta set — beige, M", ordered: 200, received: 120, status: "partial" },
    { sku_id: "SKU-7901-WHT-L", name: "White linen kurta set — L",   ordered: 105, received: 105, status: "received" },
    { sku_id: "SKU-7902-BLU-S", name: "Blue block-print kurta set — S",ordered: 80,received: 80, status: "received" },
  ],
  38: [
    { sku_id: "SKU-6103-BLU-L", name: "Slim fit denim jacket — L",  ordered: 350, received: 350, status: "received" },
    { sku_id: "SKU-6104-BLK-M", name: "Washed black denim jacket — M",ordered: 300,received: 300, status: "received" },
    { sku_id: "SKU-6105-GRY-S", name: "Grey stretch denim jacket — S",ordered: 400,received: 400, status: "received" },
    { sku_id: "SKU-6106-WHT-L", name: "White raw denim jacket — L",  ordered: 360, received: 360, status: "received" },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
   STATUS CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Maps an inward_status string → display label + CSS class (applied on top
 * of the shared .statusBadge base class).
 */
const STATUS_CONFIG = {
  completed: { label: "Completed",   cls: "badgeInStock"   },
  pending:   { label: "Pending",     cls: "badgeLowStock"  },
  partial:   { label: "Partial",     cls: "badgeOverstock" },
  draft:     { label: "Saved draft", cls: "badgeDraft"     },
};

function resolveStatus(raw = "") {
  return STATUS_CONFIG[raw.toLowerCase()] ?? { label: raw, cls: "" };
}

/** Maps a SKU-line status → badge class. */
const SKU_LINE_STATUS_CLS = {
  received: "badgeInStock",
  partial:  "badgeOverstock",
  pending:  "badgeLowStock",
};

/* ═══════════════════════════════════════════════════════════════════════════
   SUPPLIER AVATAR HELPER
   ═══════════════════════════════════════════════════════════════════════════ */

const AVATAR_PALETTE = [
  "#4f46e5", "#0891b2", "#059669", "#d97706",
  "#dc2626", "#7c3aed", "#db2777", "#0040D6",
];

function avatarBg(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

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
        display:        "inline-flex",
        alignItems:     "center",
        justifyContent: "center",
        width:          size,
        height:         size,
        borderRadius:   "50%",
        background:     avatarBg(name),
        color:          "#ffffff",
        fontSize,
        fontWeight:     700,
        flexShrink:     0,
        letterSpacing:  "0.02em",
      }}
    >
      {initials(name)}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DATE HELPER
   ═══════════════════════════════════════════════════════════════════════════ */

/** Formats an ISO timestamp as "Mon, Sep 12 2026" */
function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   QUICK-FILTER PILL DEFINITIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const PILLS = [
  { id: "total",     label: "All",       apiParam: ""               },
  { id: "completed", label: "Completed", apiParam: "?type=completed" },
  { id: "pending",   label: "Pending",   apiParam: "?type=pending"   },
  { id: "partial",   label: "Partial",   apiParam: "?type=partial"   },
  { id: "draft",     label: "Draft",     apiParam: null             },  // local-only
];

/* ═══════════════════════════════════════════════════════════════════════════
   INWARD DETAIL MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * InwardDetailModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Centred popup that shows when a user clicks any Inward ID in the table.
 *
 * Sections:
 *  – Header bar       : Inward #ID + status badge + close button
 *  – Meta strip       : Supplier  ·  Warehouse  ·  Date  ·  Updated by
 *  – SKU line table   : SKU code | Product name | Ordered | Received | Status
 *  – Summary footer   : total SKUs · total units
 *  – Action buttons   : Close  +  Complete Inwarding (if not done/cancelled)
 *
 * Props:
 *  row      object   The inward row that was clicked
 *  onClose  fn       Called when the user dismisses the modal
 */
function InwardDetailModal({ row, onClose }) {
  const navigate = useNavigate();

  const { label: statusLabel, cls: statusCls } = resolveStatus(row.inward_status);

  /* Look up mock SKU lines for this inward; fall back to an empty list. */
  const skuLines = MOCK_SKU_LINES[row.inward_id] ?? [];

  /* Derived totals from SKU lines */
  const totalOrdered  = skuLines.reduce((s, l) => s + l.ordered,  0);
  const totalReceived = skuLines.reduce((s, l) => s + l.received, 0);

  /* Whether the "Complete Inwarding" action should be shown */
  const canComplete = !["completed", "cancelled"].includes(
    (row.inward_status ?? "").toLowerCase()
  );

  /* Dismiss on Escape */
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    /* ── Backdrop ── */
    <div
      className={styles.distributeOverlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inward-detail-title"
    >
      {/* ── Modal card ── */}
      <div className={styles.inwardDetailCard}>

        {/* ── Header bar ───────────────────────────────────────────────── */}
        <div className={styles.inwardDetailHeader}>
          <div className={styles.inwardDetailHeadLeft}>
            <h2 id="inward-detail-title" className={styles.inwardDetailTitle}>
              Inward&nbsp;#{row.inward_id}
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
            aria-label="Close detail"
          >
            ✕
          </button>
        </div>

        {/* ── Meta strip ───────────────────────────────────────────────── */}
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

          {/* Created date */}
          <div className={styles.inwardDetailMetaItem}>
            <span className={styles.inwardDetailMetaLabel}>Created</span>
            <span style={{ fontSize: 13, color: "#374151" }}>
              {fmtDate(row.created_at)}
            </span>
          </div>

          {/* Updated by */}
          <div className={styles.inwardDetailMetaItem}>
            <span className={styles.inwardDetailMetaLabel}>Updated by</span>
            {row.updated_by ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <SupplierAvatar name={row.updated_by} size={22} />
                <span style={{ fontSize: 13, color: "#374151" }}>{row.updated_by}</span>
              </div>
            ) : (
              <span style={{ color: "#9ca3af", fontSize: 13 }}>—</span>
            )}
          </div>
        </div>

        {/* ── SKU line-items table ─────────────────────────────────────── */}
        <div className={styles.inwardSkuSection}>
          <p className={styles.inwardSkuSectionTitle}>Items received</p>

          {skuLines.length === 0 ? (
            /* Empty state (API data or no mock lines for this ID) */
            <p className={styles.inwardSkuEmpty}>
              No item breakdown available — open the full entry to see details.
            </p>
          ) : (
            <div className={styles.inwardSkuTableWrap}>
              <table className={styles.inwardSkuTable}>
                <thead>
                  <tr className={styles.inwardSkuHead}>
                    <th className={styles.inwardSkuThSku}>SKU</th>
                    <th className={styles.inwardSkuThName}>Product</th>
                    <th className={styles.inwardSkuThNum}>Ordered</th>
                    <th className={styles.inwardSkuThNum}>Received</th>
                    <th className={styles.inwardSkuThStatus}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {skuLines.map((line) => (
                    <tr key={line.sku_id} className={styles.inwardSkuRow}>
                      <td className={styles.inwardSkuTdSku}>{line.sku_id}</td>
                      <td className={styles.inwardSkuTdName}>{line.name}</td>
                      <td className={styles.inwardSkuTdNum}>
                        {line.ordered.toLocaleString("en-IN")}
                      </td>
                      <td className={styles.inwardSkuTdNum}>
                        {line.received.toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[SKU_LINE_STATUS_CLS[line.status] ?? ""]
                          }`}
                          style={{ fontSize: 11 }}
                        >
                          <span className={styles.statusDot} />
                          {/* Capitalise first letter */}
                          {line.status.charAt(0).toUpperCase() + line.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Summary strip ────────────────────────────────────────────── */}
        <div className={styles.inwardDetailSummary}>
          <span>
            <strong>{row.sku_count ?? skuLines.length}</strong> SKUs
          </span>
          <span className={styles.inwardDetailSumDivider}>·</span>
          <span>
            <strong>
              {(row.total_quantity ?? totalOrdered).toLocaleString("en-IN")}
            </strong>{" "}
            units ordered
          </span>
          {totalReceived > 0 && (
            <>
              <span className={styles.inwardDetailSumDivider}>·</span>
              <span>
                <strong>{totalReceived.toLocaleString("en-IN")}</strong> received
              </span>
            </>
          )}
        </div>

        {/* ── Action buttons ───────────────────────────────────────────── */}
        <div className={styles.distributeFooter}>
          <button
            className={styles.distributeCancelBtn}
            onClick={onClose}
          >
            Close
          </button>

          {canComplete && (
            <button
              className={styles.distributeConfirmBtn}
              onClick={() => {
                onClose();
                navigate(`./entry?id=${row.inward_id}`);
              }}
            >
              Complete Inwarding →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function InwardInventory() {

  /* ── State ──────────────────────────────────────────────────────────────── */

  /** Aggregate pill counts (from API or mock). */
  const [counts, setCounts] = useState({
    total: "—", completed: "—", pending: "—", partial: "—", draft: "—",
  });

  /** Full row data (from API or mock). */
  const [items,        setItems]        = useState([]);

  /** Active quick-filter pill id. */
  const [filter,       setFilter]       = useState("total");

  /** Free-text search query (client-side only). */
  const [search,       setSearch]       = useState("");

  /** Set of selected inward_id values. */
  const [selected,     setSelected]     = useState(new Set());

  /** The inward row whose detail modal is open (null = closed). */
  const [detailRow,    setDetailRow]    = useState(null);

  /** Controls visibility of the Create Inward popup. */
  const [showPopup,    setShowPopup]    = useState(false);

  /** Bumped after creating a new inward to trigger re-fetch. */
  const [refreshToken, setRefreshToken] = useState(0);

  const [page,         setPage]         = useState(1);
  const [rowsPerPage,  setRowsPerPage]  = useState(10);

  /* ── Fetch aggregate counts ─────────────────────────────────────────────── */
  useEffect(() => {
    async function fetchCounts() {
      try {
        const res  = await fetch(`${BASE_URL}/inventory/inward-count`, { credentials: "include" });
        const data = await res.json();

        /* Count local drafts from localStorage */
        let draftCount = 0;
        try {
          const storage = JSON.parse(window.localStorage.getItem("inwardEntry") || "{}");
          draftCount = Object.keys(storage).length;
        } catch { /* ignore */ }

        /* Use real data where available, fall back to mock for missing fields */
        setCounts({
          total:     data.total     ?? MOCK_COUNTS.total,
          completed: data.completed ?? MOCK_COUNTS.completed,
          pending:   data.pending   ?? MOCK_COUNTS.pending,
          partial:   data.partial   ?? MOCK_COUNTS.partial,
          draft:     draftCount || MOCK_COUNTS.draft,
        });
      } catch (err) {
        console.warn("[InwardInventory] /inward-count failed – using mock counts.", err);
        setCounts(MOCK_COUNTS);
      }
    }
    fetchCounts();
  }, [refreshToken]);

  /* ── Fetch table rows ───────────────────────────────────────────────────── */
  useEffect(() => {
    async function fetchRows() {
      try {
        /* Draft tab: cross-reference localStorage with API */
        if (filter === "draft") {
          const res     = await fetch(`${BASE_URL}/inventory/inward`, { credentials: "include" });
          const data    = await res.json();
          const storage = JSON.parse(window.localStorage.getItem("inwardEntry") || "{}");
          const drafts  = Array.isArray(data)
            ? data.filter((r) => storage[r.inward_id])
            : [];

          setItems(drafts.length > 0 ? drafts : MOCK_INWARD_ROWS.filter((r) => r._hasDraft));
          setPage(1);
          setSelected(new Set());
          return;
        }

        /* All other filters: API call */
        const pill  = PILLS.find((p) => p.id === filter);
        const param = pill?.apiParam ?? "";
        const res   = await fetch(`${BASE_URL}/inventory/inward${param}`, { credentials: "include" });
        const data  = await res.json();

        /* Use real rows when present, otherwise fall back to mock */
        const rows = Array.isArray(data) && data.length > 0
          ? data
          : filter === "total"
            ? MOCK_INWARD_ROWS
            : MOCK_INWARD_ROWS.filter((r) => r.inward_status === filter);

        setItems(rows);
        setPage(1);
        setSelected(new Set());
      } catch (err) {
        console.warn("[InwardInventory] /inward request failed – using mock rows.", err);
        const rows = filter === "total"
          ? MOCK_INWARD_ROWS
          : MOCK_INWARD_ROWS.filter((r) => r.inward_status === filter);
        setItems(rows);
        setPage(1);
        setSelected(new Set());
      }
    }
    fetchRows();
  }, [filter, refreshToken]);

  /* ── Client-side search ─────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (row) =>
        String(row.inward_id).toLowerCase().includes(q) ||
        (row.supplier ?? "").toLowerCase().includes(q)
    );
  }, [items, search]);

  /* ── Pagination slice ───────────────────────────────────────────────────── */
  const pageItems  = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  /* ── Selection helpers ──────────────────────────────────────────────────── */
  const allPageSelected =
    pageItems.length > 0 && pageItems.every((r) => selected.has(r.inward_id));

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageItems.forEach((r) => next.delete(r.inward_id));
      } else {
        pageItems.forEach((r) => next.add(r.inward_id));
      }
      return next;
    });
  }

  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /* ── Pill labels with live counts ───────────────────────────────────────── */
  const pillsWithCounts = PILLS.map((p) => ({
    ...p,
    label: `${p.label}${counts[p.id] !== "—" ? " " + counts[p.id] : ""}`,
  }));

  /* ═══════════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className={styles.stockRoot}>

      {/* ════════════════════════════════════════════════════════════════════
          1. Subtitle bar
         ════════════════════════════════════════════════════════════════════ */}
      <p className={styles.inwardSubtitle}>
        {counts.total !== "—" ? `${counts.total} total records` : "Loading…"}
        &nbsp;across multiple suppliers and 3 warehouses
      </p>

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

        {/* Supplier + Warehouse dropdowns */}
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
              <rect x="1" y="2.5" width="12" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M4.5 1v3M9.5 1v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Last 30 days
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchBox}>
          <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.75" stroke="#9CA3AF" strokeWidth="1.5"/>
            <path d="M13 13l3.5 3.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by file name"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Search inward records"
          />
        </div>

        {/* Right-side action buttons */}
        <div className={styles.actionGroup}>
          <button className={styles.btnExport} title="Export inward records">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v8M4 7l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export
          </button>

          <button
            className={styles.btnAdjust}
            onClick={() => setShowPopup(true)}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Create inward
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          3. Selection Banner (visible only when ≥ 1 row is checked)
         ════════════════════════════════════════════════════════════════════ */}
      {selected.size > 0 && (
        <div className={styles.selectionBanner} role="status" aria-live="polite">
          <span className={styles.selectionCount}>
            {selected.size} record{selected.size !== 1 ? "s" : ""} selected
          </span>
          <div className={styles.selectionActions}>
            <button className={styles.selActionBtn}>Mark completed</button>
            <button className={styles.selActionBtn}>Assign warehouse</button>
            <button className={styles.selActionBtn}>Export selected</button>
            <button className={`${styles.selActionBtn} ${styles.selActionDanger}`}>Delete</button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          4. Data Table
         ════════════════════════════════════════════════════════════════════ */}
      <div className={styles.tableWrapper} role="region" aria-label="Inward records table">
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
              <th className={styles.thCell} style={{ minWidth: 110 }}>INWARD ID&nbsp;▼</th>
              <th className={styles.thCell}>STATUS</th>
              <th className={styles.thCell} style={{ minWidth: 180 }}>SUPPLIER</th>
              <th className={styles.thNum}>SKUS</th>
              <th className={styles.thNum}>QUANTITY</th>
              <th className={styles.thCell}>WAREHOUSE</th>
              <th className={styles.thCell} style={{ minWidth: 130 }}>CREATED&nbsp;▼</th>
              <th className={styles.thCell} style={{ minWidth: 140 }}>LAST UPDATED BY</th>
              <th className={styles.thActions}>ACTIONS</th>
            </tr>
          </thead>

          {/* ── Table Body ──────────────────────────────────────────────── */}
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={10} className={styles.emptyRow}>
                  No inward records found.
                </td>
              </tr>
            ) : (
              pageItems.map((row) => {
                const id        = row.inward_id;
                const isChecked = selected.has(id);
                const { label: statusLabel, cls: statusCls } = resolveStatus(row.inward_status);

                /* Check for a saved local draft alongside this row */
                let hasDraft = Boolean(row._hasDraft);
                if (!hasDraft) {
                  try {
                    const storage = JSON.parse(window.localStorage.getItem("inwardEntry") || "{}");
                    hasDraft = Boolean(storage[id]);
                  } catch { /* ignore */ }
                }

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
                        aria-label={`Select inward #${id}`}
                      />
                    </td>

                    {/* ── Inward ID – opens detail modal on click ── */}
                    <td className={styles.tdCell}>
                      <button
                        className={styles.inwardIdBtn}
                        onClick={() => setDetailRow(row)}
                        title={`View details for Inward #${id}`}
                      >
                        #{id}
                      </button>
                    </td>

                    {/* ── Status badge (+ optional "Saved draft" badge) ── */}
                    <td className={styles.tdCell}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span className={`${styles.statusBadge} ${styles[statusCls]}`}>
                          <span className={styles.statusDot} />
                          {statusLabel}
                        </span>
                        {hasDraft && (
                          <span className={`${styles.statusBadge} ${styles.badgeDraft}`}>
                            <span className={styles.statusDot} />
                            Saved draft
                          </span>
                        )}
                      </div>
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

                    {/* ── SKUs count ── */}
                    <td className={styles.tdNum}>{row.sku_count ?? row.skus ?? 0}</td>

                    {/* ── Total quantity ── */}
                    <td className={styles.tdNum}>
                      {(row.total_quantity ?? row.quantity ?? 0).toLocaleString("en-IN")}
                    </td>

                    {/* ── Warehouse ── */}
                    <td className={styles.tdCell}>
                      <div className={styles.warehouseCell}>
                        <span className={styles.warehouseDot} />
                        {row.warehouse ?? "—"}
                      </div>
                    </td>

                    {/* ── Created date ── */}
                    <td className={styles.tdCell} style={{ fontSize: 12, color: "#6b7280" }}>
                      {fmtDate(row.created_at)}
                    </td>

                    {/* ── Last updated by ── */}
                    <td className={styles.tdCell}>
                      {row.updated_by ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <SupplierAvatar name={row.updated_by} size={22} />
                          <span style={{ fontSize: 13, color: "#374151" }}>
                            {row.updated_by}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "#9ca3af" }}>—</span>
                      )}
                    </td>

                    {/* ── Row actions: view (opens modal) + overflow menu ── */}
                    <td className={styles.tdActions}>
                      {/* Eye / view icon → opens the detail modal */}
                      <button
                        className={styles.actionBtn}
                        title="View details"
                        aria-label={`View inward #${id}`}
                        onClick={() => setDetailRow(row)}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <ellipse cx="7" cy="7" rx="5.5" ry="3.5" stroke="currentColor" strokeWidth="1.3"/>
                          <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
                        </svg>
                      </button>

                      {/* Three-dot overflow */}
                      <button
                        className={styles.actionBtn}
                        title="More actions"
                        aria-label="More actions"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="3"  r="1" fill="currentColor"/>
                          <circle cx="7" cy="7"  r="1" fill="currentColor"/>
                          <circle cx="7" cy="11" r="1" fill="currentColor"/>
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
          <label htmlFor="inwardRowsPerPage" className={styles.paginationLabel}>
            Rows per page
          </label>
          <select
            id="inwardRowsPerPage"
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
          6. Inward Detail Modal
         ════════════════════════════════════════════════════════════════════ */}
      {detailRow && (
        <InwardDetailModal
          row={detailRow}
          onClose={() => setDetailRow(null)}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════
          Create Inward Popup
         ════════════════════════════════════════════════════════════════════ */}
      {showPopup && (
        <CreateInwardPopup
          close={() => setShowPopup(false)}
          complete={() => {
            setShowPopup(false);
            setRefreshToken((t) => t + 1);
          }}
        />
      )}

    </div> /* .stockRoot */
  );
}
