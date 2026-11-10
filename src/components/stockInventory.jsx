/**
 * StockInventory Component
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Renders the full Inventory tab content:
 *
 *  1. Stats Row        &ndash; Total SKUs / In stock / Low stock / Out of stock / Value
 *  2. Filter Toolbar   &ndash; Quick-filter pills, category & warehouse dropdowns,
 *                        search input, Export button, Adjust stock button
 *  3. Selection Banner &ndash; Contextual bulk-actions when rows are checked
 *  4. Data Table       &ndash; Scrollable grid with thumbnail, SKU, category,
 *                        warehouse, available/reserved/incoming counts,
 *                        stock-level bar, status badge, and row action buttons
 *  5. Pagination       &ndash; Rows-per-page selector + page number controls
 *  6. DistributeModal  &ndash; Popup to allocate units to sales channels
 *                        (opens when the product name is clicked)
 *
 * Mock data is used as a fallback whenever the API returns an empty list or
 * fails.  Every UI-only field in the mock objects uses a leading underscore
 * (_pct, _thumbColor) so real API data is never mistaken for mock data.
 */

import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCsrf } from "../store/slices/csrfSlice";
import { getInventoryStocksOverview, getInventoryStocks } from "../services/inventoryService";
import styles from "../css/pages/inventory.Inventory.module.css";
import StatCardsRow        from "./StatCardsRow";
import InventoryFilterBar  from "./InventoryFilterBar";

const url = import.meta.env.VITE_BASEAPI;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MOCK DATA  &ndash;  shown when the API returns empty (offline / demo mode)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/**
 * MOCK_STOCKS
 * Fallback aggregate counts for the five stat cards.
 */
const MOCK_STOCKS = {
  total: 0,
  sellable: 0,
  oos: 0,
  low: 0,
};

/**
 * MOCK_ITEMS
 * Seven SKUs covering every status tier (In stock / Low stock / Out of stock /
 * Overstocked) and all three warehouses.  Matches the design screenshot.
 *
 * _pct        &ndash; overrides the calculated stock-level percentage so the bar
 *               matches the screenshot exactly (real items use derived value).
 * _thumbColor &ndash; plain CSS colour used as the product thumbnail placeholder.
 */
const MOCK_ITEMS = [];

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DISTRIBUTION CHANNELS  &ndash;  used inside DistributeModal
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

/** Formats monetary stock value with Indian numbering system. */
function formatStockValue(stocksData) {
  let val = null;
  let sub = "At cost price";

  if (stocksData?.stock_value_at_purchasing_cost != null && stocksData.stock_value_at_purchasing_cost !== "") {
    val = Number(stocksData.stock_value_at_purchasing_cost);
    sub = "At cost price";
  } else if (stocksData?.stock_value_at_selling_price != null && stocksData.stock_value_at_selling_price !== "") {
    val = Number(stocksData.stock_value_at_selling_price);
    sub = "At selling price";
  } else if (stocksData?.stock_value_at_mrp != null && stocksData.stock_value_at_mrp !== "") {
    val = Number(stocksData.stock_value_at_mrp);
    sub = "At MRP";
  }

  if (val == null || isNaN(val)) {
    return { formatted: "₹0", sub: "At cost price" };
  }

  if (val >= 10000000) {
    return { formatted: `₹${(val / 10000000).toFixed(2)}Cr`, sub };
  }
  if (val >= 100000) {
    return { formatted: `₹${(val / 100000).toFixed(2)}L`, sub };
  }
  return { formatted: `₹${val.toLocaleString("en-IN")}`, sub };
}

/** Converts a stock-level percentage → one of our four status strings. */
function deriveStatus(pct) {
  if (pct <= 0)   return "Out of stock";
  if (pct <= 20)  return "Low stock";
  if (pct > 120)  return "Overstocked";
  return "In stock";
}

/** Normalizes backend status values into standard display strings. */
function normalizeStatus(backendStatus, pct) {
  if (backendStatus) {
    const s = String(backendStatus).toLowerCase().replace(/_/g, " ").replace(/-/g, " ");
    if (s === "in stock" || s === "sellable") return "In stock";
    if (s === "low stock") return "Low stock";
    if (s === "out of stock" || s === "oos") return "Out of stock";
    if (s === "overstocked") return "Overstocked";
  }
  return deriveStatus(pct);
}

/** Maps a status string → the CSS module class name for its badge colour. */
function statusClass(status, s) {
  switch (status) {
    case "In stock":     return s.badgeInStock;
    case "Low stock":    return s.badgeLowStock;
    case "Out of stock": return s.badgeOOS;
    case "Overstocked":  return s.badgeOverstock;
    default:             return "";
  }
}

/** Formats item stock value (at selling price or MRP). */
function formatRowStockValue(item) {
  const price =
    item.stock_value_at_selling_price ??
    item.stock_value_at_mrp ??
    item.stock_value_at_purchasing_cost;

  if (price == null || price === "") return "₹0.00";
  const num = Number(price);
  if (isNaN(num)) return `₹${price}`;
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Formats updated_at timestamp into human readable date. */
function formatUpdatedAt(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Product thumbnail with resilient image error fallback.
 */
function ProductThumb({ src, title }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initial = (title?.trim()?.charAt(0) || "P").toUpperCase();

  return (
    <div className={styles.productThumb}>
      {src && !hasError ? (
        <img
          src={src}
          alt=""
          className={styles.thumbImg}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className={styles.thumbFallback} title={title}>
          <span>{initial}</span>
        </div>
      )}
    </div>
  );
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
 *  pct   number   0&ndash;âˆž  (capped to 100 % visually)
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

  /** Confirm and close — hook up to real API when ready. */
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
    total: "—",
    sellable: "—",
    oos: "—",
    low: "—",
    stock_value_at_mrp: null,
    stock_value_at_purchasing_cost: null,
    stock_value_at_selling_price: null,
  });

  const [items,           setItems]           = useState([]);        // full fetched / mock data
  const [filter,          setFilter]          = useState("total");   // active filter tab id
  const [search,          setSearch]          = useState("");        // search input value
  const [selected,        setSelected]        = useState(new Set()); // checked row IDs
  const [distributeItem,  setDistributeItem]  = useState(null);      // product to distribute (popup)
  const [page,            setPage]            = useState(1);
  const [rowsPerPage,     setRowsPerPage]     = useState(10);
  const [fetchingItems,   setFetchingItems]   = useState(false);

  const csrfToken = useSelector((state) => state.csrf?.csrf);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!csrfToken) {
      dispatch(fetchCsrf());
    }
  }, [csrfToken, dispatch]);

  /* ── Data fetching ──────────────────────────────────────────────────────── */

  /**
   * Fetch aggregate counts for the stat cards via GET /inventory/stocks/overview.
   */
  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await getInventoryStocksOverview(csrfToken);
        if (res.ok && res.data) {
          const data = res.data;
          setStocks({
            total: Number(data.total ?? 0),
            sellable: Number(data.in_stock ?? data.sellable ?? 0),
            low: Number(data.low_stock ?? data.low ?? 0),
            oos: Number(data.out_of_stock ?? data.oos ?? 0),
            stock_value_at_mrp: data.stock_value_at_mrp,
            stock_value_at_purchasing_cost: data.stock_value_at_purchasing_cost,
            stock_value_at_selling_price: data.stock_value_at_selling_price,
          });
        }
      } catch (err) {
        console.warn("[StockInventory] /inventory/stocks/overview request failed:", err);
      }
    }
    fetchCounts();
  }, [csrfToken]);

  /**
   * Fetch inventory rows via GET /inventory/stocks.
   * Re-runs whenever filter, page, rowsPerPage, or csrfToken changes.
   */
  useEffect(() => {
    async function fetchItems() {
      setFetchingItems(true);
      try {
        const res = await getInventoryStocks(
          {
            filter,
            records: rowsPerPage,
            page,
          },
          csrfToken
        );

        if (res.ok && Array.isArray(res.data)) {
          setItems(res.data);
        } else if (res.ok && res.data && Array.isArray(res.data.items)) {
          setItems(res.data.items);
        } else {
          setItems([]);
        }
        setSelected(new Set());
      } catch (err) {
        console.warn("[StockInventory] /inventory/stocks request failed:", err);
        setItems([]);
        setSelected(new Set());
      } finally {
        setFetchingItems(false);
      }
    }
    fetchItems();
  }, [filter, page, rowsPerPage, csrfToken]);

  /* ── Derived / memoised values ───────────────────────────────────────────── */

  /** Items after client-side search filtering. */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.product_title?.toLowerCase().includes(q) ||
        item.sku_id?.toLowerCase().includes(q) ||
        item.usku_id?.toLowerCase().includes(q) ||
        item.type_name?.toLowerCase().includes(q)
    );
  }, [items, search]);

  /** Current page slice (if backend already paginates, items.length <= rowsPerPage). */
  const pageItems = useMemo(() => {
    if (filtered.length <= rowsPerPage) {
      return filtered;
    }
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const activeCount = useMemo(() => {
    if (filter === "sellable" || filter === "in-stock") return Number(stocks.sellable || 0);
    if (filter === "low" || filter === "low-stock") return Number(stocks.low || 0);
    if (filter === "oos" || filter === "out-of-stock") return Number(stocks.oos || 0);
    return Number(stocks.total || 0);
  }, [filter, stocks]);

  const totalPages = useMemo(() => {
    if (activeCount > 0) {
      return Math.ceil(activeCount / rowsPerPage);
    }
    return Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  }, [activeCount, filtered.length, rowsPerPage]);

  /* â”€â”€ Selection helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const allPageSelected =
    pageItems.length > 0 && pageItems.every((i) => selected.has(i.usku_id || i.sku_id));

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageItems.forEach((i) => next.delete(i.usku_id || i.sku_id));
      } else {
        pageItems.forEach((i) => next.add(i.usku_id || i.sku_id));
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

  const stockValueInfo = useMemo(() => {
    return formatStockValue(stocks);
  }, [stocks]);

  /* ── Filter tabs ─────────────────────────────────────────────────────────── */
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
          sub: "Across all warehouses",
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
          sub:
            typeof stocks.total === "number" && stocks.total > 0 && typeof stocks.sellable === "number"
              ? `${((stocks.sellable / stocks.total) * 100).toFixed(1)}% of catalog`
              : "—",
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
          value: stockValueInfo.formatted,
          sub: stockValueInfo.sub,
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

          {/* ── Column Headers ────────────────────────────────────────── */}
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
              <th className={styles.thNum}>STOCK</th>
              <th className={styles.thNum}>STOCK VALUE</th>
              <th className={styles.thLevel}>STOCK LEVEL</th>
              <th className={styles.thCell}>STATUS</th>
              <th className={styles.thCell}>LAST UPDATED</th>
            </tr>
          </thead>

          {/* ── Table Body ────────────────────────────────────────────── */}
          <tbody>
            {fetchingItems ? (
              <tr>
                <td colSpan={8} className={styles.emptyRow}>
                  Loading inventory items...
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              /* Empty state */
              <tr>
                <td colSpan={8} className={styles.emptyRow}>
                  No inventory items found.
                </td>
              </tr>
            ) : (
              pageItems.map((item, index) => {
                const id        = item.usku_id || item.sku_id || `row-${index}`;
                const isChecked = selected.has(id);
                const stock     = Number(item.stock ?? item.product_stock ?? 0);

                const maxStock  = 400;
                const pct       = item._pct !== undefined
                  ? item._pct
                  : Math.max(0, Math.min(100, Math.round((stock / maxStock) * 100)));

                const status    = normalizeStatus(item.status, pct);
                const badgeCls  = statusClass(status, styles);

                /* Build image URL from API data */
                let imageUrl = item.main_image || "";
                if (!imageUrl && item.image_url) {
                  try {
                    imageUrl = item.image_url.startsWith("http")
                      ? item.image_url
                      : `${url}${JSON.parse(item.image_url).webp_card || item.image_url}`;
                  } catch {
                    imageUrl = item.image_url;
                  }
                }

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
                        aria-label={`Select ${item.product_title || "item"}`}
                      />
                    </td>

                    {/* Product – thumbnail + clickable title + SKU */}
                    <td className={styles.tdProduct}>
                      <div className={styles.productCell}>
                        <ProductThumb
                          src={imageUrl}
                          title={item.product_title || "Product"}
                        />

                        <div className={styles.productInfo}>
                          {/*
                           * Product name &ndash; rendered as a button so it is keyboard-
                           * accessible without interfering with the row checkbox.
                           * Clicking it opens the Distribute modal.
                           */}
                          <button
                            className={styles.productNameBtn}
                            onClick={() => setDistributeItem(item)}
                            title={`Distribute stock for ${item.product_title || "item"}`}
                          >
                            {item.product_title || "Untitled"}
                          </button>
                          <span className={styles.productSku}>{item.sku_id || item.usku_id || "—"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className={styles.tdCell}>
                      <span className={styles.categoryPill}>
                        {item.type_name || item.product_type || "—"}
                      </span>
                    </td>

                    {/* Available Stock */}
                    <td className={styles.tdNum}>{stock.toLocaleString("en-IN")}</td>

                    {/* Stock Value */}
                    <td className={styles.tdNum}>{formatRowStockValue(item)}</td>

                    {/* Stock Level – bar + percentage */}
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

                    {/* Last Updated */}
                    <td className={styles.tdCell}>
                      <span className={styles.updatedCell}>
                        {formatUpdatedAt(item.updated_at)}
                      </span>
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
            {[10, 15, 20, 30, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span className={styles.paginationInfo}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}–
            {Math.min(page * rowsPerPage, activeCount > 0 ? activeCount : (page - 1) * rowsPerPage + filtered.length)} of {activeCount > 0 ? activeCount : filtered.length}
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
            ‹
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
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            ›
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
