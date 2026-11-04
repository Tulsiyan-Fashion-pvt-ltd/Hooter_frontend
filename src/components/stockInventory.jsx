/**
 * StockInventory Component
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Renders the full Inventory tab content:
 *
 *  1. Stats Row        â€“ Total SKUs / In stock / Low stock / Out of stock / Value
 *  2. Filter Toolbar   â€“ Quick-filter pills, category & warehouse dropdowns,
 *                        search input, Export button, Adjust stock button
 *  3. Selection Banner â€“ Contextual bulk-actions when rows are checked
 *  4. Data Table       â€“ Scrollable grid with thumbnail, SKU, category,
 *                        warehouse, available/reserved/incoming counts,
 *                        stock-level bar, status badge, and row action buttons
 *  5. Pagination       â€“ Rows-per-page selector + page number controls
 *  6. DistributeModal  â€“ Popup to allocate units to sales channels
 *                        (opens when the product name is clicked)
 *
 * Mock data is used as a fallback whenever the API returns an empty list or
 * fails.  Every UI-only field in the mock objects uses a leading underscore
 * (_pct, _thumbColor) so real API data is never mistaken for mock data.
 */

import { useState, useEffect, useMemo } from "react";
import styles from "../css/pages/inventory.Inventory.module.css";
import StatCardsRow        from "./StatCardsRow";
import InventoryFilterBar  from "./InventoryFilterBar";

const url = import.meta.env.VITE_BASEAPI;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MOCK DATA  â€“  shown when the API returns empty (offline / demo mode)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/**
 * MOCK_STOCKS
 * Fallback aggregate counts for the five stat cards.
 */
const MOCK_STOCKS = {
  total:    1284,
  sellable: 1062,
  oos:      75,
  low:      146,
};

/**
 * MOCK_ITEMS
 * Seven SKUs covering every status tier (In stock / Low stock / Out of stock /
 * Overstocked) and all three warehouses.  Matches the design screenshot.
 *
 * _pct        â€“ overrides the calculated stock-level percentage so the bar
 *               matches the screenshot exactly (real items use derived value).
 * _thumbColor â€“ plain CSS colour used as the product thumbnail placeholder.
 */
const MOCK_ITEMS = [
  {
    usku_id:       "mock-1",
    product_title: "Red casual kurta - M",
    sku_id:        "SKU-7741-RED-M",
    product_type:  "Kurta",
    warehouse:     "Bhiwandi WH-1",
    product_stock: 312,
    reserved:      28,
    incoming:      150,
    _pct:          82,
    _thumbColor:   "#7f1d1d",
    image_url:     null,
  },
  {
    usku_id:       "mock-2",
    product_title: "Forest green kurta - L",
    sku_id:        "SKU-7741-GRN-L",
    product_type:  "Kurta",
    warehouse:     "Bhiwandi WH-1",
    product_stock: 18,
    reserved:      6,
    incoming:      0,
    _pct:          22,
    _thumbColor:   "#14532d",
    image_url:     null,
  },
  {
    usku_id:       "mock-3",
    product_title: "Sky blue linen kurta - S",
    sku_id:        "SKU-7742-BLU-S",
    product_type:  "Kurta",
    warehouse:     "Gurugram WH-2",
    product_stock: 0,
    reserved:      0,
    incoming:      240,
    _pct:          0,
    _thumbColor:   "#93c5fd",
    image_url:     null,
  },
  {
    usku_id:       "mock-4",
    product_title: "Classic zipper jacket - M",
    sku_id:        "SKU-6202-BLK-M",
    product_type:  "Jacket",
    warehouse:     "Bhiwandi WH-1",
    product_stock: 153,
    reserved:      12,
    incoming:      0,
    _pct:          76,
    _thumbColor:   "#111827",
    image_url:     null,
  },
  {
    usku_id:       "mock-5",
    product_title: "Slim fit denim jacket - L",
    sku_id:        "SKU-6103-BLU-L",
    product_type:  "Jacket",
    warehouse:     "Gurugram WH-2",
    product_stock: 642,
    reserved:      40,
    incoming:      0,
    _pct:          128,
    _thumbColor:   "#1e3a5f",
    image_url:     null,
  },
  {
    usku_id:       "mock-6",
    product_title: "Cotton kurta set - beige, M",
    sku_id:        "SKU-7900-BEI-M",
    product_type:  "Kurta set",
    warehouse:     "Bengaluru WH-3",
    product_stock: 3,
    reserved:      0,
    incoming:      500,
    _pct:          5,
    _thumbColor:   "#c9a87c",
    image_url:     null,
  },
  {
    usku_id:       "mock-7",
    product_title: "Navy running shoes - UK 9",
    sku_id:        "SKU-9021-NVY-9",
    product_type:  "Footwear",
    warehouse:     "Bengaluru WH-3",
    product_stock: 80,
    reserved:      4,
    incoming:      0,
    _pct:          64,
    _thumbColor:   "#0a1628",
    image_url:     null,
  },
];

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DISTRIBUTION CHANNELS  â€“  used inside DistributeModal
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/**
 * Each channel has a unique id, a display name, and a coloured dot.
 * Add / remove channels here to update the modal without touching JSX.
 */
const CHANNELS = [
  { id: "myntra",   name: "Myntra",        dot: "#ef4444" },
  { id: "ajio",     name: "Ajio",          dot: "#f59e0b" },
  { id: "flipkart", name: "Flipkart",      dot: "#2563eb" },
  { id: "nykaa",    name: "Nykaa Fashion", dot: "#7c3aed" },
];

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STATUS HELPERS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/** Converts a stock-level percentage â†’ one of our four status strings. */
function deriveStatus(pct) {
  if (pct <= 0)   return "Out of stock";
  if (pct <= 20)  return "Low stock";
  if (pct > 120)  return "Overstocked";
  return "In stock";
}

/** Maps a status string â†’ the CSS module class name for its badge colour. */
function statusClass(status, s) {
  switch (status) {
    case "In stock":     return s.badgeInStock;
    case "Low stock":    return s.badgeLowStock;
    case "Out of stock": return s.badgeOOS;
    case "Overstocked":  return s.badgeOverstock;
    default:             return "";
  }
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SUB-COMPONENTS
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/**
 * StockBar
 * A thin horizontal progress bar showing stock level percentage.
 * Colour tracks the same thresholds as `deriveStatus`.
 *
 * Props:
 *  pct   number   0â€“âˆž  (capped to 100 % visually)
 */
function StockBar({ pct }) {
  const capped   = Math.min(pct, 100);
  const barClass =
    pct <= 0   ? styles.barOOS      :
    pct <= 20  ? styles.barLow      :
    pct > 120  ? styles.barOver     :
                 styles.barInStock;

  return (
    <div className={styles.stockBarTrack} title={`${pct}%`}>
      <div
        className={`${styles.stockBarFill} ${barClass}`}
        style={{ width: `${capped}%` }}
      />
    </div>
  );
}

/**
 * DistributeModal
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Centred modal that lets the user split available stock across sales channels.
 * Opens when a product name is clicked.
 *
 * Props:
 *  item     object   The inventory row whose stock is being distributed
 *  onClose  fn       Called on Cancel, overlay-click, or Escape key
 */
function DistributeModal({ item, onClose }) {
  /* One numeric entry per channel, all starting at 0 */
  const [allocations, setAllocations] = useState(
    Object.fromEntries(CHANNELS.map((c) => [c.id, 0]))
  );

  /* Derived totals */
  const available = Number(item.product_stock ?? 0);
  const allocated  = Object.values(allocations).reduce((sum, v) => sum + Number(v), 0);
  const remaining  = available - allocated;
  const isOverAllocated = remaining < 0;

  /** Update a single channel value, preventing negatives. */
  function handleChange(channelId, raw) {
    const val = Math.max(0, Number(raw) || 0);
    setAllocations((prev) => ({ ...prev, [channelId]: val }));
  }

  /** Confirm and close â€” hook up to real API when ready. */
  function handleConfirm() {
    console.info("[DistributeModal] Confirmed allocations for", item.sku_id, allocations);
    onClose();
  }

  /* Close on Escape key */
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    /* â”€â”€ Backdrop â”€â”€ */
    <div
      className={styles.distributeOverlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dist-title"
    >
      {/* â”€â”€ Modal card â”€â”€ */}
      <div className={styles.distributeCard}>

        {/* Header */}
        <h2 id="dist-title" className={styles.distributeTitle}>
          Distribute&nbsp;.&nbsp;{item.product_title}
        </h2>
        <p className={styles.distributeSubtitle}>
          {available.toLocaleString("en-IN")} units available at{" "}
          {item.warehouse ?? "warehouse"}
        </p>

        {/* Channel rows */}
        <div className={styles.distributeChannels}>
          {CHANNELS.map(({ id, name, dot }) => (
            <div key={id} className={styles.distributeChannelRow}>
              {/* Colour-coded dot */}
              <span
                className={styles.distributeChannelDot}
                style={{ background: dot }}
                aria-hidden="true"
              />

              {/* Channel name */}
              <span className={styles.distributeChannelName}>{name}</span>

              {/* Quantity number input */}
              <input
                type="number"
                min={0}
                max={available}
                value={allocations[id]}
                onChange={(e) => handleChange(id, e.target.value)}
                className={styles.distributeQtyInput}
                aria-label={`Units for ${name}`}
              />
            </div>
          ))}
        </div>

        {/* Remaining-to-allocate info bar */}
        <div
          className={`${styles.distributeRemaining} ${
            isOverAllocated ? styles.distributeRemainingOver : ""
          }`}
        >
          Remaining to allocate:&nbsp;
          <strong>
            {remaining.toLocaleString("en-IN")} unit{remaining !== 1 ? "s" : ""}
          </strong>
        </div>

        {/* Footer action buttons */}
        <div className={styles.distributeFooter}>
          <button
            className={styles.distributeCancelBtn}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={styles.distributeConfirmBtn}
            onClick={handleConfirm}
            disabled={isOverAllocated || allocated === 0}
          >
            Confirm distribution
          </button>
        </div>

      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

export default function StockInventory() {

  /* â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const [stocks, setStocks] = useState({
    total: "â€”", sellable: "â€”", oos: "â€”", low: "â€”",
  });

  const [items,           setItems]           = useState([]);        // full fetched / mock data
  const [filter,          setFilter]          = useState("total");   // active filter tab id
  const [search,          setSearch]          = useState("");        // search input value
  const [selected,        setSelected]        = useState(new Set()); // checked row IDs
  const [distributeItem,  setDistributeItem]  = useState(null);      // product to distribute (popup)
  const [page,            setPage]            = useState(1);
  const [rowsPerPage,     setRowsPerPage]     = useState(7);

  /* â”€â”€ Data fetching â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  /**
   * Fetch aggregate counts for the stat cards.
   * Falls back to MOCK_STOCKS when the API fails or returns nothing.
   */
  useEffect(() => {
    async function fetchCounts() {
      try {
        const res  = await fetch(`${url}/inventory/stocks`, { credentials: "include" });
        const data = await res.json();

        /* Use real data if present, otherwise fall back to mock */
        setStocks({
          total:    data.total    ?? MOCK_STOCKS.total,
          sellable: data.sellable ?? MOCK_STOCKS.sellable,
          oos:      data.oos      ?? MOCK_STOCKS.oos,
          low:      data.low      ?? MOCK_STOCKS.low,
        });
      } catch (err) {
        console.warn("[StockInventory] /stocks request failed â€“ using mock counts.", err);
        setStocks(MOCK_STOCKS);
      }
    }
    fetchCounts();
  }, []);

  /**
   * Fetch inventory rows, re-run whenever the active filter changes.
   * Falls back to MOCK_ITEMS when the API fails or returns an empty array.
   */
  useEffect(() => {
    async function fetchItems() {
      const filterMap = {
        total:    "",
        sellable: "?filter=sellable",
        oos:      "?filter=oos",
        low:      "?filter=low-stock",
      };

      /**
       * Apply the active quick-filter to a list of mock / API items so that
       * the pills work even when the API is offline or returns an empty list.
       */
      function applyFilter(rows) {
        const maxStock = 400;
        switch (filter) {
          case "sellable":
            return rows.filter((item) => {
              const pct = item._pct !== undefined
                ? item._pct
                : Math.round((Number(item.product_stock ?? 0) / maxStock) * 100);
              return pct > 20 && pct <= 120; // "In stock"
            });
          case "low":
            return rows.filter((item) => {
              const pct = item._pct !== undefined
                ? item._pct
                : Math.round((Number(item.product_stock ?? 0) / maxStock) * 100);
              return pct > 0 && pct <= 20; // "Low stock"
            });
          case "oos":
            return rows.filter((item) => {
              const pct = item._pct !== undefined
                ? item._pct
                : Math.round((Number(item.product_stock ?? 0) / maxStock) * 100);
              return pct <= 0; // "Out of stock"
            });
          default:
            return rows; // "total" â€“ show everything
        }
      }

      try {
        const res  = await fetch(`${url}/inventory${filterMap[filter]}`, { credentials: "include" });
        const data = await res.json();

        // If the API returned real data, use it directly (server already filtered).
        // If the API returned empty / failed, fall back to client-filtered mock data.
        const rows = Array.isArray(data) && data.length > 0
          ? data
          : applyFilter(MOCK_ITEMS);

        setItems(rows);
        setPage(1);              // reset to first page on filter change
        setSelected(new Set()); // clear selection on filter change
      } catch (err) {
        console.warn("[StockInventory] /inventory request failed â€“ using mock items.", err);
        setItems(applyFilter(MOCK_ITEMS));
        setPage(1);
        setSelected(new Set());
      }
    }
    fetchItems();
  }, [filter]);

  /* â”€â”€ Derived / memoised values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  /** Items after client-side search filtering. */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.product_title?.toLowerCase().includes(q) ||
        item.sku_id?.toLowerCase().includes(q)
    );
  }, [items, search]);

  /** Current page slice. */
  const pageItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  /* â”€â”€ Selection helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const allPageSelected =
    pageItems.length > 0 && pageItems.every((i) => selected.has(i.usku_id));

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageItems.forEach((i) => next.delete(i.usku_id));
      } else {
        pageItems.forEach((i) => next.add(i.usku_id));
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

  /* -- Filter tabs ï¿½ passed to the shared InventoryFilterBar component --- */
  const PILLS = [
    { id: "total",    label: "All",          count: stocks.total    },
    { id: "sellable", label: "In stock",     count: stocks.sellable },
    { id: "low",      label: "Low stock",    count: stocks.low      },
    { id: "oos",      label: "Out of stock", count: stocks.oos      },
  ];

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     Render
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  return (
    <div className={styles.stockRoot}>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          Overview heading
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <h2 className={styles.overviewHeading}>Overview</h2>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          1. Stats Row
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <StatCardsRow cards={[
        {
          label: "Total SKUs",
          value: stocks.total,
          sub: "Across 3 warehouses",
          iconClass: styles.iconBoxBlue,
          icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          ),
        },
        {
          label: "In Stock",
          value: stocks.sellable,
          sub: "82.7% of catalog",
          iconClass: styles.iconBoxGreen,
          icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ),
        },
        {
          label: "Low Stock",
          value: stocks.low,
          sub: "Below reorder level",
          subClass: styles.subWarn,
          iconClass: styles.iconBoxAmber,
          icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          ),
        },
        {
          label: "Out of Stock",
          value: stocks.oos,
          sub: "Needs restock",
          subClass: styles.subDanger,
          iconClass: styles.iconBoxRed,
          icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          ),
        },
        {
          label: "Stock Value",
          value: "Rs. 1.86Cr",
          sub: "At cost price",
          iconClass: styles.iconBoxPurple,
          icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          ),
        },
      ]} />

      {/* ───────────────────────────────────────────────────────────────────
          2. Filter Toolbar
          Uses the shared <InventoryFilterBar> component so this toolbar can
          be reused in InwardInventory and GrnInventory without duplicate code.
         ─────────────────────────────────────────────────────────────────── */}
      <InventoryFilterBar
        tabs={PILLS}
        activeTab={filter}
        onTabChange={(id) => { setFilter(id); setPage(1); }}
        dropdowns={[
          {
            label: "Warehouse",
            options: [
              { value: "wh1", label: "Bhiwandi WH-1"   },
              { value: "wh2", label: "Gurugram WH-2"  },
              { value: "wh3", label: "Bengaluru WH-3" },
            ],
          },
        ]}
        searchValue={search}
        searchPlaceholder="Search by SKU ID"
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        onExport={() => console.info("[StockInventory] Export clicked")}
      />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          3. Selection Banner (visible only when rows are checked)
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {selected.size > 0 && (
        <div className={styles.selectionBanner} role="status" aria-live="polite">
          <span className={styles.selectionCount}>
            {selected.size} SKU{selected.size !== 1 ? "s" : ""} selected
          </span>
          <div className={styles.selectionActions}>
            <button className={styles.selActionBtn}>Update reorder level</button>
            <button className={styles.selActionBtn}>Move warehouse</button>
            <button className={styles.selActionBtn}>Export selected</button>
          </div>
        </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          4. Data Table
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className={styles.tableWrapper} role="region" aria-label="Inventory table">
        <table className={styles.dataTable}>

          {/* â”€â”€ Column Headers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
              <th className={styles.thProduct}>PRODUCT</th>
              <th className={styles.thCell}>CATEGORY</th>
              <th className={styles.thCell}>WAREHOUSE</th>
              <th className={styles.thNum}>AVAILABLE</th>
              <th className={styles.thNum}>RESERVED</th>
              <th className={styles.thNum}>INCOMING</th>
              <th className={styles.thLevel}>STOCK LEVEL</th>
              <th className={styles.thCell}>STATUS</th>
              <th className={styles.thActions}>ACTIONS</th>
            </tr>
          </thead>

          {/* â”€â”€ Table Body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <tbody>
            {pageItems.length === 0 ? (
              /* Empty state */
              <tr>
                <td colSpan={10} className={styles.emptyRow}>
                  No inventory items found.
                </td>
              </tr>
            ) : (
              pageItems.map((item) => {
                const id        = item.usku_id;
                const isChecked = selected.has(id);
                const stock     = Number(item.product_stock ?? 0);

                /*
                 * Stock percentage:
                 *  â€“ Real API items: derived from product_stock / 400 (approximate max).
                 *  â€“ Mock items:     use the pre-set _pct field for accuracy.
                 */
                const maxStock  = 400;
                const pct       = item._pct !== undefined
                  ? item._pct
                  : Math.round((stock / maxStock) * 100);

                const status    = deriveStatus(pct);
                const badgeCls  = statusClass(status, styles);

                /* Build image URL from API data (falls back to colour swatch) */
                let imageUrl = "";
                try {
                  imageUrl = item.image_url
                    ? `${url}${JSON.parse(item.image_url).webp_card}`
                    : "";
                } catch { /* leave empty on parse error */ }

                return (
                  <tr
                    key={id}
                    className={`${styles.tableRow} ${isChecked ? styles.tableRowSelected : ""}`}
                  >
                    {/* Checkbox */}
                    <td className={styles.tdCheck}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={isChecked}
                        onChange={() => toggleRow(id)}
                        aria-label={`Select ${item.product_title}`}
                      />
                    </td>

                    {/* Product â€“ thumbnail + clickable title + SKU */}
                    <td className={styles.tdProduct}>
                      <div className={styles.productCell}>
                        {/* Thumbnail: real image > colour swatch > grey placeholder */}
                        <div className={styles.productThumb}>
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.product_title || "product"}
                              className={styles.thumbImg}
                            />
                          ) : item._thumbColor ? (
                            <div
                              className={styles.thumbPlaceholder}
                              style={{ background: item._thumbColor }}
                            />
                          ) : (
                            <div className={styles.thumbPlaceholder} />
                          )}
                        </div>

                        <div className={styles.productInfo}>
                          {/*
                           * Product name â€“ rendered as a button so it is keyboard-
                           * accessible without interfering with the row checkbox.
                           * Clicking it opens the Distribute modal.
                           */}
                          <button
                            className={styles.productNameBtn}
                            onClick={() => setDistributeItem(item)}
                            title={`Distribute stock for ${item.product_title}`}
                          >
                            {item.product_title || "Untitled"}
                          </button>
                          <span className={styles.productSku}>{item.sku_id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className={styles.tdCell}>
                      <span className={styles.categoryPill}>
                        {item.product_type || "â€”"}
                      </span>
                    </td>

                    {/* Warehouse */}
                    <td className={styles.tdCell}>
                      <div className={styles.warehouseCell}>
                        <span className={styles.warehouseDot} />
                        {item.warehouse || "Bhiwandi WH-1"}
                      </div>
                    </td>

                    {/* Numeric columns */}
                    <td className={styles.tdNum}>{stock.toLocaleString("en-IN")}</td>
                    <td className={styles.tdNum}>{(item.reserved ?? 0).toLocaleString("en-IN")}</td>
                    <td className={styles.tdNum}>{(item.incoming ?? 0).toLocaleString("en-IN")}</td>

                    {/* Stock Level â€“ bar + percentage */}
                    <td className={styles.tdLevel}>
                      <div className={styles.levelCell}>
                        <StockBar pct={pct} />
                        <span className={styles.levelPct}>{pct}%</span>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className={styles.tdCell}>
                      <span className={`${styles.statusBadge} ${badgeCls}`}>
                        <span className={styles.statusDot} />
                        {status}
                      </span>
                    </td>

                    {/* Actions â€“ edit + overflow menu */}
                    <td className={styles.tdActions}>
                      <button className={styles.actionBtn} title="Edit" aria-label={`Edit ${item.product_title}`}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M9.5 2L12 4.5 5 11.5H2.5V9L9.5 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button className={styles.actionBtn} title="More actions" aria-label="More actions">
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          5. Pagination
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className={styles.pagination}>

        {/* Rows-per-page selector */}
        <div className={styles.paginationLeft}>
          <label htmlFor="rowsPerPage" className={styles.paginationLabel}>
            Rows per page
          </label>
          <select
            id="rowsPerPage"
            className={styles.paginationSelect}
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
          >
            {[7, 10, 15, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span className={styles.paginationInfo}>
            Showing {Math.min((page - 1) * rowsPerPage + 1, filtered.length)}â€“
            {Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}
          </span>
        </div>

        {/* Page number buttons */}
        <div className={styles.paginationRight}>
          {/* Previous arrow */}
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            â€¹
          </button>

          {/* Page numbers (max 4 visible) */}
          {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`${styles.pageBtn} ${page === n ? styles.pageBtnActive : ""}`}
              onClick={() => setPage(n)}
              aria-current={page === n ? "page" : undefined}
            >
              {n}
            </button>
          ))}

          {/* Next arrow */}
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            â€º
          </button>
        </div>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          6. Distribute Modal (rendered into the same DOM tree via React)
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {distributeItem && (
        <DistributeModal
          item={distributeItem}
          onClose={() => setDistributeItem(null)}
        />
      )}

    </div> /* .stockRoot */
  );
}
