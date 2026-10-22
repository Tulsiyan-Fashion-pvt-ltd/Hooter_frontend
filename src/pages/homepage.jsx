import { useState, useEffect, useCallback, useContext } from "react";
import styles from "../css/pages/Homepage.module.css";
import clsx from "clsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toastContext } from "../appContext";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// import { checkCatalogExists } from "../services/catalogService";
// import NoCatalogModal from "../components/NoCatalogModal"; // TODO: re-enable when backend catalog check is ready




/* ─────────────────────────────────────────────────────────────
   Inline SVG icons used in the filter / action toolbar.
   Kept small and self-contained so there are no extra imports.
───────────────────────────────────────────────────────────── */
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const ExportIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);



/* ─────────────────────────────────────────────────────────────
   ⚠️  PLACEHOLDER DATA — all values below are static mock data
   used only for layout / UI development purposes.
   Real KPI figures, chart series, and product data will be
   fetched from the backend API once the endpoints are ready.
   Search for "TODO: replace" to find each fetch call location.
───────────────────────────────────────────────────────────── */

/* Top-level overview tabs shown in the tab bar above the KPI cards. */

const OVERVIEW_TABS = [
  "Overview",
];


/* ─────────────────────────────────────────────────────────────
   Mock KPI data keyed by overview tab index (0–4).
   TODO: replace with real API calls when the backend is ready.
───────────────────────────────────────────────────────────── */
const MOCK_KPI_BY_TAB = {
  0: { // Overview
    revenue: { value: "₹18.4L", change: 14.2, unit: "%" },
    orders: { value: "3,842", change: 9.8, unit: "%" },
    avgOrderValue: { value: "₹1,479", change: -1.3, unit: "%" },
    conversionRate: { value: "3.6%", change: 0.4, unit: "pp" },
    activeListings: { value: "12,480", change: 320, unit: "" },
    returnRate: { value: "4.1%", change: -0.6, unit: "pp" },
  },
  1: { // Sales
    revenue: { value: "₹12.1L", change: 8.5, unit: "%" },
    orders: { value: "2,610", change: 5.2, unit: "%" },
    avgOrderValue: { value: "₹1,320", change: 2.1, unit: "%" },
    conversionRate: { value: "4.2%", change: 0.8, unit: "pp" },
    activeListings: { value: "11,900", change: 210, unit: "" },
    returnRate: { value: "3.8%", change: -0.2, unit: "pp" },
  },
  2: { // Fulfillment
    revenue: { value: "₹5.9L", change: -3.0, unit: "%" },
    orders: { value: "1,190", change: -2.4, unit: "%" },
    avgOrderValue: { value: "₹1,495", change: 0.5, unit: "%" },
    conversionRate: { value: "2.9%", change: -0.3, unit: "pp" },
    activeListings: { value: "9,800", change: -140, unit: "" },
    returnRate: { value: "5.2%", change: 0.9, unit: "pp" },
  },
  3: { // Customers
    revenue: { value: "₹8.2L", change: 11.0, unit: "%" },
    orders: { value: "3,100", change: 7.3, unit: "%" },
    avgOrderValue: { value: "₹1,560", change: 3.2, unit: "%" },
    conversionRate: { value: "5.1%", change: 1.2, unit: "pp" },
    activeListings: { value: "13,200", change: 560, unit: "" },
    returnRate: { value: "3.2%", change: -0.8, unit: "pp" },
  },
  4: { // Marketing
    revenue: { value: "₹22.7L", change: 18.6, unit: "%" },
    orders: { value: "4,520", change: 14.1, unit: "%" },
    avgOrderValue: { value: "₹1,612", change: 4.5, unit: "%" },
    conversionRate: { value: "6.3%", change: 2.0, unit: "pp" },
    activeListings: { value: "14,800", change: 980, unit: "" },
    returnRate: { value: "2.8%", change: -1.1, unit: "pp" },
  },
};



/* ─────────────────────────────────────────────────────────────
   Chart-data helpers — both functions derive their output from
   the same KPI object that MOCK_KPI_BY_TAB already holds, so
   the charts stay consistent with the KPI cards above them.

   When real API endpoints are available, replace the MOCK_KPI_BY_TAB
   lookup inside fetchDashboardData with actual fetch() calls and pass
   the response through these same helpers (or remove them entirely
   if the API already returns chart-ready arrays).

   TODO: GET /api/dashboard/revenue-trend?tab=<activeOverviewTab>
   TODO: GET /api/dashboard/fulfillment-funnel?tab=<activeOverviewTab>
───────────────────────────────────────────────────────────── */

/**
 * buildRevenueTrendData
 *
 * Constructs a 6-week revenue-vs-returns series from a tab's KPI entry.
 *
 * Strategy:
 *   • Parse the tab's total revenue string (e.g. "₹18.4L") into raw rupees.
 *   • Distribute that total across 6 weeks using a realistic growth curve
 *     (weights that ramp up toward the most recent week).
 *   • Estimate returns for each week as a small percentage of that week's
 *     revenue, scaled by the tab's return-rate metric.
 *
 * @param  {object} tabKpi  — one entry from MOCK_KPI_BY_TAB
 * @returns {Array<{ week: string, revenue: number, returns: number }>}
 */
function buildRevenueTrendData(tabKpi) {
  // ── 1. Parse the revenue string into a raw rupee number ──────────────
  // Handles formats like "₹18.4L", "₹5.9L", "₹22.7L".
  const revenueStr = tabKpi.revenue.value;                 // e.g. "₹18.4L"
  const numericPart = parseFloat(revenueStr.replace(/[₹L]/g, ""));  // 18.4
  const totalRevenue = numericPart * 100000;                // convert lakhs → rupees

  // ── 2. Parse the return rate (e.g. "4.1%" → 0.041) ──────────────────
  const returnRateStr = tabKpi.returnRate.value;            // e.g. "4.1%"
  const returnRate = parseFloat(returnRateStr) / 100;    // 0.041

  // ── 3. Growth-curve weights for Wk 1 → Wk 6 ─────────────────────────
  // Weights purposely start low and accelerate toward the current week,
  // mimicking real business growth patterns.
  const weights = [0.10, 0.13, 0.15, 0.20, 0.19, 0.23];
  const weightTotal = weights.reduce((a, b) => a + b, 0); // should equal 1.00

  return weights.map((w, i) => {
    const weekRevenue = Math.round((w / weightTotal) * totalRevenue);

    // Returns vary slightly per week (±20% of the base rate) to avoid a
    // perfectly flat returns line, which would look unrealistic.
    const weekReturnRate = returnRate * (0.8 + Math.random() * 0.4);
    const weekReturns = Math.round(weekRevenue * weekReturnRate);

    return {
      week: `Wk ${i + 1}`,
      revenue: weekRevenue,
      returns: weekReturns,
    };
  });
}

/**
 * buildFulfillmentFunnelData
 *
 * Constructs the fulfillment funnel from the tab's order count.
 *
 * Strategy:
 *   • Parse the raw order count (e.g. "3,842" → 3842).
 *   • Apply industry-typical drop-off ratios at each stage.
 *   • The "Returned" row is derived from the tab's return-rate metric
 *     so it stays consistent with the KPI card.
 *
 * @param  {object} tabKpi  — one entry from MOCK_KPI_BY_TAB
 * @returns {Array<{ label: string, value: number, isReturn: boolean }>}
 */
function buildFulfillmentFunnelData(tabKpi) {
  // ── 1. Parse the order count (remove commas) ─────────────────────────
  const totalOrders = parseInt(tabKpi.orders.value.replace(/,/g, ""), 10);

  // ── 2. Parse the return rate ─────────────────────────────────────────
  const returnRate = parseFloat(tabKpi.returnRate.value) / 100;

  // ── 3. Stage drop-off ratios (relative to totalOrders) ───────────────
  // These approximate real e-commerce fulfilment rates:
  //   Placed → Confirmed : ~99%  (a few cancellations right after placement)
  //   Confirmed → Packed  : ~95%  (stock-outs, address issues)
  //   Packed → Shipped    : ~96%  (warehouse pick failures)
  //   Shipped → Delivered : ~94%  (courier failures, refused deliveries)
  const stages = [
    { label: "Placed", ratio: 1.00, isReturn: false },
    { label: "Confirmed", ratio: 0.99, isReturn: false },
    { label: "Packed", ratio: 0.95, isReturn: false },
    { label: "Shipped", ratio: 0.915, isReturn: false },
    { label: "Delivered", ratio: 0.859, isReturn: false },
    // Returned orders = delivered orders × returnRate
    { label: "Returned", ratio: null, isReturn: true },
  ];

  const deliveredCount = Math.round(totalOrders * 0.859);

  return stages.map((stage) => ({
    label: stage.label,
    value: stage.isReturn
      ? Math.round(deliveredCount * returnRate)   // returned = delivered × returnRate
      : Math.round(totalOrders * stage.ratio),    // other stages use direct ratio
    isReturn: stage.isReturn,
  }));
}

/* ─────────────────────────────────────────────────────────────
   Static mock data — Marketplace performance, Recent orders,
   and Inventory alerts.
   TODO: replace each with a real API fetch when the backend
   endpoints are ready.
───────────────────────────────────────────────────────────── */

// Marketplace rows shown in the performance table.
// colour : the dot beside the marketplace name.
// status : one of "Healthy" | "Watch" | "At risk" — controls badge colour.
// TODO: GET /api/dashboard/marketplace-performance?tab=<activeOverviewTab>
const MARKETPLACE_DATA = [
  { name: "Amazon", colour: "#FF9900", orders: 1204, revenue: "₹6,12,400", returns: "3.2%", growth: +11, status: "Healthy" },
  { name: "Flipkart", colour: "#2874F0", orders: 892, revenue: "₹4,20,100", returns: "4.8%", growth: +6, status: "Healthy" },
  { name: "Myntra", colour: "#FF3F6C", orders: 654, revenue: "₹3,10,900", returns: "5.1%", growth: -2, status: "Watch" },
  { name: "Website (Shopify)", colour: "#96BF48", orders: 512, revenue: "₹2,45,600", returns: "2.9%", growth: +18, status: "Healthy" },
  { name: "Meesho", colour: "#9B2FAB", orders: 398, revenue: "₹98,200", returns: "6.4%", growth: -4, status: "At risk" },
  { name: "Ajio", colour: "#E31937", orders: 182, revenue: "₹1,55,100", returns: "3.7%", growth: +9, status: "Healthy" },
];

// Recent orders shown in the bottom-left table.
// status: one of "Shipped" | "Processing" | "Delivered" | "Returned" | "Cancelled"
// TODO: GET /api/orders/recent
const RECENT_ORDERS = [
  { id: "#ORD-88421", customer: "Priya Sharma", channel: "Amazon", amount: "₹2,399", status: "Shipped" },
  { id: "#ORD-88420", customer: "Rahul Verma", channel: "Myntra", amount: "₹1,599", status: "Processing" },
  { id: "#ORD-88419", customer: "Sana Khan", channel: "Flipkart", amount: "₹4,120", status: "Delivered" },
  { id: "#ORD-88418", customer: "Amit Joshi", channel: "Website", amount: "₹899", status: "Returned" },
  { id: "#ORD-88417", customer: "Neha Gupta", channel: "Meesho", amount: "₹1,240", status: "Cancelled" },
];

// Inventory alert items shown in the bottom-right panel.
// severity: one of "Critical" | "Out of stock" | "Reorder"
// TODO: GET /api/inventory/alerts
const INVENTORY_ALERTS = [
  { name: "Cotton kurta set — M", detail: "3 units left", severity: "Critical" },
  { name: "Sneaker white — UK 9", detail: "0 units left", severity: "Out of stock" },
  { name: "Zipper jacket — Navy, M", detail: "8 units left", severity: "Reorder" },
  { name: "Denim jacket — 32", detail: "12 units left", severity: "Reorder" },
];

// Top-selling products shown in the bottom-left table of the last row.
// channel : which marketplace the product performs best on.
// sold    : units sold in the current period.
// stock   : current on-hand inventory count.
// TODO: GET /api/products/top
const TOP_PRODUCTS = [
  { name: "Zipper jacket", channel: "Myntra", sold: 60, stock: 153, price: "₹1,599" },
  { name: "Cotton kurta set", channel: "Amazon", sold: 48, stock: 3, price: "₹899" },
  { name: "Denim jacket", channel: "Flipkart", sold: 31, stock: 44, price: "₹1,299" },
  { name: "Running shoes", channel: "Ajio", sold: 27, stock: 60, price: "₹2,199" },
];

// Recent platform-level events shown in the Activity feed.
// colour : dot colour — blue (info), red (alert), purple (price), amber (stock), green (payout)
// TODO: GET /api/activity/recent
const ACTIVITY_FEED = [
  { text: "Inventory synced across 7 marketplaces", time: "5 min ago", colour: "#0040D6" },
  { text: "New return request — Order #88418", time: "20 min ago", colour: "#E51300" },
  { text: "Price updated for 12 SKUs on Amazon", time: "1 hr ago", colour: "#7C3AED" },
  { text: "Low stock alert — Cotton kurta set", time: "2 hr ago", colour: "#b45309" },
  { text: "Payout of ₹4,82,100 processed", time: "4 hr ago", colour: "#00AF55" },
];

/* ─────────────────────────────────────────────────────────────
   Helper: orderStatusStyle
   Maps an order status string to the inline colour values used
   for the badge in the Recent Orders table.
───────────────────────────────────────────────────────────── */
function orderStatusStyle(status) {
  const map = {
    Shipped: { color: "#0040D6", background: "#e3e8ff" },
    Processing: { color: "#b45309", background: "#fef3c7" },
    Delivered: { color: "#00AF55", background: "#dcfce7" },
    Returned: { color: "#E51300", background: "#fee2e2" },
    Cancelled: { color: "#64748b", background: "#f1f5f9" },
  };
  // Fall back to a neutral style for any unknown status.
  return map[status] ?? { color: "#64748b", background: "#f1f5f9" };
}

/* ─────────────────────────────────────────────────────────────
   Helper: inventorySeverityStyle
   Maps an alert severity string to badge colours for the
   Inventory Alerts panel.
───────────────────────────────────────────────────────────── */
function inventorySeverityStyle(severity) {
  const map = {
    "Critical": { color: "#E51300", background: "#fee2e2" },
    "Out of stock": { color: "#E51300", background: "#fee2e2" },
    "Reorder": { color: "#b45309", background: "#fef3c7" },
  };
  return map[severity] ?? { color: "#64748b", background: "#f1f5f9" };
}

/* ─────────────────────────────────────────────────────────────
   Helper: marketplaceStatusStyle
   Maps a marketplace health status to badge colours used in the
   Marketplace Performance table.
───────────────────────────────────────────────────────────── */
function marketplaceStatusStyle(status) {
  const map = {
    "Healthy": { color: "#00AF55", background: "#dcfce7" },
    "Watch": { color: "#b45309", background: "#fef3c7" },
    "At risk": { color: "#E51300", background: "#fee2e2" },
  };
  return map[status] ?? { color: "#64748b", background: "#f1f5f9" };
}

/* ═══════════════════════════════════════════════════════════
   Homepage Component
═══════════════════════════════════════════════════════════ */
const Homepage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  /* ── UI state ─────────────────────────────────────────── */
  // Which tab in the top nav is active (Overview / Sales / …)
  const [activeOverviewTab, setActiveOverviewTab] = useState(0);

  /* ── Dashboard data state ─────────────────────────────── */
  // All state is pre-seeded from tab-0 mock data so the page renders
  // immediately on first paint with zero spinner, zero null-checks.
  // fetchDashboardData() updates these values in the background.

  const [kpiData, setKpiData] = useState(() => MOCK_KPI_BY_TAB[0]);

  // Pre-compute chart series from tab-0 KPI so charts never get empty arrays.
  const [revenueTrend, setRevenueTrend] = useState(() => buildRevenueTrendData(MOCK_KPI_BY_TAB[0]));
  const [fulfillmentFunnel, setFulfillmentFunnel] = useState(() => buildFulfillmentFunnelData(MOCK_KPI_BY_TAB[0]));

  // Sparklines — static default, refreshed by fetchDashboardData on each tab switch.
  const [chartData, setChartData] = useState({
    ordersBar: Array.from({ length: 7 }, (_, i) => ({ day: i + 1, value: 20 + i * 3 })),
    shippingLine: [
      { day: 1, value: 20 }, { day: 2, value: 32 },
      { day: 3, value: 28 }, { day: 4, value: 35 },
      { day: 5, value: 25 }, { day: 6, value: 30 },
      { day: 7, value: 38 },
    ],
    returnsBar: Array.from({ length: 7 }, (_, i) => ({ day: i + 1, value: 10 + i * 2 })),
  });

  // ── New card datasets ──────────────────────────────────────────────────────
  // Pre-seeded from mock constants — fetchDashboardData overwrites with live
  // API data once the backend endpoints are available.
  const [marketplaceData, setMarketplaceData] = useState(MARKETPLACE_DATA);
  const [recentOrders, setRecentOrders] = useState(RECENT_ORDERS);
  const [inventoryAlerts, setInventoryAlerts] = useState(INVENTORY_ALERTS);
  const [topProducts, setTopProducts] = useState(TOP_PRODUCTS);
  const [activityFeed, setActivityFeed] = useState(ACTIVITY_FEED);

  // No loading state — all data is available from first render.

  /* ── Toast for user-triggered actions (e.g. Refresh) ─── */
  const showToast = useContext(toastContext);

  // const [showNoCatalogModal, setShowNoCatalogModal] = useState(false);

  /* ── Shopify OAuth redirect handler ───────────────────── */
  // When Shopify redirects back with OAuth params, forward them to the backend.
  useEffect(() => {
    const params = Object.fromEntries(searchParams);

    // Only run the OAuth flow when Shopify has actually redirected back
    // with all three required query-string parameters.
    if (!params.code || !params.shop || !params.state) return;

    async function sendShopifyRedirect() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASEAPI}/shopify/install-store`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(params),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          window.alert("Couldn't fetch the Shopify shop name");
          // Remove OAuth params from the URL and return to the homepage.
          setSearchParams({}, { replace: true });
          navigate("/", { replace: true });
          return;
        }

        // Always clean up OAuth params before redirecting further.
        setSearchParams({}, { replace: true });

        if (data.redirect) {
          window.location.href = data.redirect;
          return;
        }

        // Fallback: return to homepage if no redirect is provided.
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Shopify OAuth request failed:", error);
        // Clean up OAuth params on failure so the user isn't stuck.
        setSearchParams({}, { replace: true });
        navigate("/", { replace: true });
      }
    }

    sendShopifyRedirect();
  }, [searchParams, setSearchParams, navigate]);

  /* ── Catalog check (re-enable when backend is ready) ─────
  useEffect(() => {
    checkCatalogExists()
      .then(data => {
        if (data.catalog === 'unavailable') setShowNoCatalogModal(true);
      })
      .catch(err => console.error('Catalog check failed:', err));
  }, []);
  ─────────────────────────────────────────────────────────── */

  /* ── Fetch KPI + chart data ────────────────────────────── */
  const fetchDashboardData = useCallback(async () => {
    // ── PHASE 1: Synchronous KPI + chart updates (< 1 ms) ─────────────
    // These are purely in-memory calculations — no network involved.
    // State is already pre-seeded so the UI doesn't need to wait.
    const tabKpi = MOCK_KPI_BY_TAB[activeOverviewTab];
    setKpiData(tabKpi);

    // Revenue Trend (derived) — TODO: swap for GET /api/dashboard/revenue-trend?tab=<activeOverviewTab>
    setRevenueTrend(buildRevenueTrendData(tabKpi));

    // Fulfillment Funnel (derived) — TODO: swap for GET /api/dashboard/fulfillment-funnel?tab=<activeOverviewTab>
    setFulfillmentFunnel(buildFulfillmentFunnelData(tabKpi));

    // Sparklines — TODO: derive from real API data when available.
    setChartData({
      ordersBar: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        value: Math.floor(Math.random() * 30) + 10,
      })),
      shippingLine: [
        { day: 1, value: 20 }, { day: 2, value: 32 },
        { day: 3, value: 28 }, { day: 4, value: 35 },
        { day: 5, value: 25 }, { day: 6, value: 30 },
        { day: 7, value: 38 },
      ],
      returnsBar: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        value: Math.floor(Math.random() * 30) + 10,
      })),
    });

    // ── PHASE 2: Background network fetches ───────────────────────
    // These run silently after Phase 1 completes.  A shared AbortController
    // with a 2-second timeout ensures that failed calls (backend not yet live)
    // give up quickly.  Real data silently replaces mock when endpoints are up.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      // ── Marketplace Performance ──────────────────────────────────
      // TODO: GET /api/dashboard/marketplace-performance
      // Expected shape: [ { name, colour, orders, revenue, returns, growth, status } ]
      // "status" is one of: "Healthy" | "Watch" | "At risk"
      try {
        const mpRes = await fetch(
          `${import.meta.env.VITE_BASEAPI}/dashboard/marketplace-performance`,
          { credentials: "include", signal: controller.signal }
        );
        if (!mpRes.ok) throw new Error(`HTTP ${mpRes.status}`);
        setMarketplaceData(await mpRes.json());
      } catch {
        console.warn("[Dashboard] marketplace-performance not ready, using mock.");
      }

      // ── Recent Orders ──────────────────────────────────────────
      // TODO: GET /api/orders/recent
      // Expected shape: [ { id, customer, channel, amount, status } ]
      // "status": "Shipped" | "Processing" | "Delivered" | "Returned" | "Cancelled"
      try {
        const ordRes = await fetch(
          `${import.meta.env.VITE_BASEAPI}/orders/recent`,
          { credentials: "include", signal: controller.signal }
        );
        if (!ordRes.ok) throw new Error(`HTTP ${ordRes.status}`);
        setRecentOrders(await ordRes.json());
      } catch {
        console.warn("[Dashboard] orders/recent not ready, using mock.");
      }

      // ── Inventory Alerts ────────────────────────────────────────
      // TODO: GET /api/inventory/alerts
      // Expected shape: [ { name, detail, severity } ]
      // "severity": "Critical" | "Out of stock" | "Reorder"
      try {
        const invRes = await fetch(
          `${import.meta.env.VITE_BASEAPI}/inventory/alerts`,
          { credentials: "include", signal: controller.signal }
        );
        if (!invRes.ok) throw new Error(`HTTP ${invRes.status}`);
        setInventoryAlerts(await invRes.json());
      } catch {
        console.warn("[Dashboard] inventory/alerts not ready, using mock.");
      }

      // ── Top Products ───────────────────────────────────────────
      // TODO: GET /api/products/top
      // Expected shape: [ { name, channel, sold, stock, price } ]
      try {
        const topRes = await fetch(
          `${import.meta.env.VITE_BASEAPI}/products/top`,
          { credentials: "include", signal: controller.signal }
        );
        if (!topRes.ok) throw new Error(`HTTP ${topRes.status}`);
        setTopProducts(await topRes.json());
      } catch {
        console.warn("[Dashboard] products/top not ready, using mock.");
      }

      // ── Activity Feed ──────────────────────────────────────────
      // TODO: GET /api/activity/recent
      // Expected shape: [ { text, time, colour } ]
      try {
        const actRes = await fetch(
          `${import.meta.env.VITE_BASEAPI}/activity/recent`,
          { credentials: "include", signal: controller.signal }
        );
        if (!actRes.ok) throw new Error(`HTTP ${actRes.status}`);
        setActivityFeed(await actRes.json());
      } catch {
        console.warn("[Dashboard] activity/recent not ready, using mock.");
      }
    } finally {
      // Always clear the timeout whether fetches succeeded or failed.
      clearTimeout(timeoutId);
    }
  }, [activeOverviewTab]);

  /* ── Effects ──────────────────────────────────────────── */

  // Re-fetch all dashboard data (KPI cards + both charts) whenever the
  // active overview tab changes.  Revenue trend and fulfillment funnel
  // are now recomputed inside fetchDashboardData, so no extra effect needed.
  useEffect(() => {
    fetchDashboardData();
  }, [activeOverviewTab, fetchDashboardData]);

  /* ── Colour helpers ───────────────────────────────────── */
  // Returns green for positive changes, red for negative (used by KPI badge).
  const trendTextColor = (v) => (v >= 0 ? "#00AF55" : "#E51300");



  /* ── KPI card definitions ─────────────────────────────── */
  // Each entry maps directly to one card in the 6-column KPI grid.
  const kpiCards = [
    { id: "revenue", label: "Revenue", ...kpiData.revenue },
    { id: "orders", label: "Orders", ...kpiData.orders },
    { id: "avgOrderValue", label: "Avg. order value", ...kpiData.avgOrderValue },
    { id: "conversionRate", label: "Conversion rate", ...kpiData.conversionRate },
    { id: "activeListings", label: "Active listings", ...kpiData.activeListings },
    { id: "returnRate", label: "Return rate", ...kpiData.returnRate },
  ];

  /* ────────────────────────────────────────────────────────
     Render
  ─────────────────────────────────────────────────────────*/
  return (
    <>
      {/* TODO: uncomment when catalog check endpoint is ready */}
      {/* {showNoCatalogModal && <NoCatalogModal />} */}

      <main className={styles.pageContent}>
        <div className={styles.pageContainer}>

          {/* ═══════════════════════════════════════════════
              SECTION 1 — Overview tab navigation
              Tabs: Overview | Sales | Fulfillment | Customers | Marketing
              Selecting a tab refreshes all KPI data below.
          ═══════════════════════════════════════════════ */}
          <div className={`${styles.pageHeader}`}>
            <div className="heading">
              <h1 className="main-heading">Overview</h1>
              <p className="heading-message">Welcome back, Sarah. here is your overall overview of the panel.</p>
            </div>

            {/* Right group: utility actions */}
            <div className={styles.actionGroup}>

              {/* Refresh: re-runs dashboard data fetch and shows a toast on completion */}
              <button
                id="btn-refresh"
                className={styles.actionBtnOutline}
                onClick={async () => {
                  await fetchDashboardData();
                  showToast("Dashboard refreshed", "green");
                }}
                title="Refresh dashboard data"
              >
                <RefreshIcon />
                <span>Refresh</span>
              </button>

              {/* Export: stub — wire to CSV/PDF download endpoint */}
              <button id="btn-export" className={styles.actionBtnOutline} title="Export report">
                <ExportIcon />
                <span>Export</span>
              </button>

              {/* Primary CTA */}
              <button id="btn-create-report" className={styles.actionBtnPrimary} title="Create a new report">
                <PlusIcon />
                <span>Create report</span>
              </button>
            </div>
          </div>
              
          {/* ═══════════════════════════════════════════════
              SECTION 2 — KPI summary cards
              Six cards in a responsive CSS grid:
              Revenue | Orders | Avg. order value |
              Conversion rate | Active listings | Return rate
          ═══════════════════════════════════════════════ */}
          <div className={styles.kpiGrid}>
            {kpiCards.map((card) => {
              const isPositive = card.change >= 0;

              // Build the trend label string, e.g. "↑ 14.2%" or "↓ 320"
              const absChange = Math.abs(card.change);
              const arrow = isPositive ? "↑" : "↓";
              const changeStr = card.unit === ""
                ? `${arrow} ${absChange}`                 // e.g. "↑ 320" (no unit)
                : `${arrow} ${absChange}${card.unit}`;    // e.g. "↑ 14.2%" / "↓ 0.6pp"

              return (
                <div key={card.id} className={styles.kpiCard} id={`kpi-${card.id}`}>
                  {/* Metric label */}
                  <span className={styles.kpiLabel}>{card.label}</span>

                  {/* Primary value (large) */}
                  <span className={styles.kpiValue}>{card.value}</span>

                  {/* Trend badge: green = up, red = down */}
                  <span
                    className={styles.kpiBadge}
                    style={{ color: trendTextColor(card.change) }}
                  >
                    {changeStr}
                  </span>
                </div>
              );
            })}
          </div>


          {/* ═══════════════════════════════════════════════
              SECTION 3 — Filter controls + action buttons
              Left  : date-range selector | marketplace dropdown | warehouse dropdown
              Right : Refresh | Export | + Create report
          ═══════════════════════════════════════════════ */}
          <div className={styles.filterBar}>

            {/* Left group: contextual filters */}
            <div className={styles.filterGroup}>

              {/* Date range — stub; hook up a real date-picker component later */}
              <button className={styles.filterBtn} id="btn-date-range">
                <CalendarIcon />
                <span>Last 30 days</span>
              </button>

              {/* Marketplace multi-select — stub */}
              <button className={styles.filterBtn} id="btn-marketplaces">
                <span>All marketplaces (7)</span>
                <ChevronDownIcon />
              </button>

              {/* Warehouse select — stub */}
              <button className={styles.filterBtn} id="btn-warehouses">
                <span>All warehouses</span>
                <ChevronDownIcon />
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              SECTION 4 — Analytics panels
              Two side-by-side cards:
              Left  (~65%) — Revenue Trend line chart (Revenue vs Returns value)
              Right (~35%) — Fulfillment Funnel horizontal progress bars
              NOTE: all data below is placeholder — replace with API calls.
          ═══════════════════════════════════════════════ */}
          <div className={styles.analyticsRow}>

            {/* ── LEFT PANEL: Revenue Trend ─────────────────────────────
                Line chart with two series:
                  • Revenue      — blue, with small dots
                  • Returns value — grey, no dots (flat comparison line)
                X-axis shows weekly labels (Wk 1 → Wk 6).
            ──────────────────────────────────────────────────────────── */}
            <div className={clsx(styles.card, styles.trendPanel)}>

              {/* Panel header: title + subtitle + legend */}
              <div className={styles.trendHeader}>
                <div className={styles.trendHeaderLeft}>
                  <h3 className={styles.trendTitle}>Revenue trend</h3>
                  <p className={styles.trendSubtitle}>Across all connected marketplaces</p>
                </div>

                {/* Colour legend matching the two chart lines */}
                <div className={styles.trendLegend}>
                  <span className={styles.legendItem}>
                    <span className={styles.legendDotBlue} />
                    Revenue
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.legendDotGrey} />
                    Returns value
                  </span>
                </div>
              </div>

              {/* Revenue vs Returns line chart — data is tab-driven via revenueTrend state */}
              <div className={styles.trendChartWrap}>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={revenueTrend}
                    margin={{ top: 10, right: 16, bottom: 10, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                      dataKey="week"
                      stroke="#bbb"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                      // Format raw rupee values as "₹X.XL" in the tooltip
                      formatter={(val, name) => [`₹${(val / 100000).toFixed(1)}L`, name]}
                    />

                    {/* Revenue line — blue with dots */}
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#0040D6"
                      strokeWidth={2.5}
                      dot={{ fill: "#0040D6", r: 3.5, strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />

                    {/* Returns value line — grey, no dots */}
                    <Line
                      type="monotone"
                      dataKey="returns"
                      name="Returns value"
                      stroke="#cbd5e1"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── RIGHT PANEL: Fulfillment Funnel ──────────────────────────
                Horizontal progress bars per fulfillment stage.
                Each row: stage label | coloured bar | count value.
                Bar width is proportional to the "Placed" (max) count.
                The "Returned" stage uses red to flag it visually.
                TODO: replace FULFILLMENT_FUNNEL_DATA with API response.
            ──────────────────────────────────────────────────────────── */}
            <div className={clsx(styles.card, styles.funnelPanel)}>

              {/* Panel header */}
              <h3 className={styles.funnelTitle}>Fulfillment funnel</h3>

              {/* One row per fulfillment stage — data is tab-driven via fulfillmentFunnel state */}
              <div className={styles.funnelList}>
                {fulfillmentFunnel.map((stage) => {
                  // Bar width is relative to the first stage ("Placed"), which is always 100%.
                  // Using fulfillmentFunnel[0] as the denominator keeps proportions correct
                  // even if the absolute order counts change between tabs.
                  const pct = Math.round((stage.value / fulfillmentFunnel[0].value) * 100);

                  return (
                    <div key={stage.label} className={styles.funnelRow}>

                      {/* Stage name */}
                      <span className={styles.funnelLabel}>{stage.label}</span>

                      {/* Progress bar track + fill */}
                      <div className={styles.funnelBarTrack}>
                        <div
                          className={styles.funnelBarFill}
                          style={{
                            width: `${pct}%`,
                            // isReturn stages are coloured red to flag them as negative metrics
                            background: stage.isReturn ? "#E51300" : "#0040D6",
                          }}
                        />
                      </div>

                      {/* Numeric count — formatted as Indian locale (commas) */}
                      <span className={styles.funnelCount}>
                        {stage.value.toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ═════════════════════════════════════════════
              SECTION 5 — Marketplace performance table
              Full-width card listing each connected channel
              with its Orders, Revenue, Returns %, Growth, Status.
          ═════════════════════════════════════════════ */}
          <div className={clsx(styles.card, styles.mpCard)}>

            {/* Card header: title on the left, "View all channels" link on the right */}
            <div className={styles.mpHeader}>
              <span className={styles.mpTitle}>Marketplace performance</span>
              {/* TODO: wire to /channels or a dedicated page */}
              <a href="#" className={styles.linkAction} id="link-view-all-channels">View all channels</a>
            </div>

            {/* Column headers */}
            <div className={styles.mpTableHead}>
              <span>MARKETPLACE</span>
              <span>ORDERS</span>
              <span>REVENUE</span>
              <span>RETURNS</span>
              <span>GROWTH</span>
              <span>STATUS</span>
            </div>

            {/* One row per marketplace — driven by marketplaceData state */}
            {marketplaceData.map((mp) => {
              // Growth badge: green for positive, red for negative
              const growthColor = mp.growth >= 0 ? "#00AF55" : "#E51300";
              const growthPrefix = mp.growth >= 0 ? "+" : "";
              const statusStyle = marketplaceStatusStyle(mp.status);

              return (
                <div key={mp.name} className={styles.mpRow}>

                  {/* Coloured dot + marketplace name */}
                  <span className={styles.mpName}>
                    <span className={styles.mpDot} style={{ background: mp.colour }} />
                    {mp.name}
                  </span>

                  <span className={styles.mpCell}>{mp.orders.toLocaleString("en-IN")}</span>
                  <span className={styles.mpCell}>{mp.revenue}</span>
                  <span className={styles.mpCell}>{mp.returns}</span>

                  {/* Growth: coloured percentage */}
                  <span className={styles.mpGrowth} style={{ color: growthColor }}>
                    {growthPrefix}{mp.growth}%
                  </span>

                  {/* Status badge */}
                  <span
                    className={styles.mpStatusBadge}
                    style={{ color: statusStyle.color, background: statusStyle.background }}
                  >
                    {mp.status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ═════════════════════════════════════════════
              SECTION 6 — Bottom row: Recent orders + Inventory alerts
              Left  (~62%) — recent order table with status badges
              Right (~38%) — inventory alert items with severity badges
          ═════════════════════════════════════════════ */}
          <div className={styles.bottomRow}>

            {/* ── LEFT: Recent orders ──────────────────────────────────────
                Shows the 5 most recent orders across all channels.
                Each row: order ID | customer | channel | amount | status.
                Status badge colour is driven by orderStatusStyle().
            ────────────────────────────────────────────────── */}
            <div className={clsx(styles.card, styles.ordersCard)}>

              {/* Card header */}
              <div className={styles.ordersHeader}>
                <span className={styles.ordersTitle}>Recent orders</span>
                {/* TODO: wire to /orders page */}
                <a href="#" className={styles.linkAction} id="link-view-all-orders">View all orders</a>
              </div>

              {/* Column headers */}
              <div className={styles.ordersTableHead}>
                <span>ORDER</span>
                <span>CUSTOMER</span>
                <span>CHANNEL</span>
                <span>AMOUNT</span>
                <span>STATUS</span>
              </div>

              {/* One row per order — driven by recentOrders state */}
              {recentOrders.map((order) => {
                const badgeStyle = orderStatusStyle(order.status);

                return (
                  <div key={order.id} className={styles.ordersRow}>
                    <span className={styles.ordersId}>{order.id}</span>
                    <span className={styles.ordersCell}>{order.customer}</span>
                    <span className={styles.ordersCell}>{order.channel}</span>
                    <span className={styles.ordersCell}>{order.amount}</span>

                    {/* Status badge: colours injected inline from the helper */}
                    <span
                      className={styles.ordersBadge}
                      style={{ color: badgeStyle.color, background: badgeStyle.background }}
                    >
                      {order.status}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ── RIGHT: Inventory alerts ────────────────────────────────
                Lists items that are critical, out of stock, or need
                reordering. Each row shows a placeholder image box,
                the item name, stock detail, and a severity badge.
            ────────────────────────────────────────────────── */}
            <div className={clsx(styles.card, styles.alertsCard)}>

              {/* Card header */}
              <div className={styles.alertsHeader}>
                <span className={styles.alertsTitle}>Inventory alerts</span>
                {/* TODO: wire to /inventory page */}
                <a href="#" className={styles.linkAction} id="link-manage-stock">Manage stock</a>
              </div>

              {/* Alert item list — driven by inventoryAlerts state */}
              <div className={styles.alertsList}>
                {inventoryAlerts.map((item) => {
                  const badgeStyle = inventorySeverityStyle(item.severity);

                  return (
                    <div key={item.name} className={styles.alertRow}>

                      {/* Grey placeholder box representing a product thumbnail */}
                      <div className={styles.alertThumb} aria-hidden="true" />

                      {/* Item name + stock detail stacked vertically */}
                      <div className={styles.alertInfo}>
                        <span className={styles.alertName}>{item.name}</span>
                        <span className={styles.alertDetail}>{item.detail}</span>
                      </div>

                      {/* Severity badge */}
                      <span
                        className={styles.alertBadge}
                        style={{ color: badgeStyle.color, background: badgeStyle.background }}
                      >
                        {item.severity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ═════════════════════════════════════════════
              SECTION 7 — Last row: Top products + Activity feed
              Left  (~65%) — table of best-selling products
              Right (~35%) — chronological platform event log
          ═════════════════════════════════════════════ */}
          <div className={styles.lastRow}>

            {/* ── LEFT: Top products ──────────────────────────────────────
                Table of the 4 best-selling products.
                Columns: PRODUCT | CHANNEL | SOLD | STOCK | PRICE
                Low-stock rows (stock < 10) can be highlighted later.
            ────────────────────────────────────────────────── */}
            <div className={clsx(styles.card, styles.topProductsCard)}>

              {/* Card header */}
              <div className={styles.topProductsHeader}>
                <span className={styles.topProductsTitle}>Top products</span>
                {/* TODO: wire to /catalog page */}
                <a href="#" className={styles.linkAction} id="link-view-catalog">View catalog</a>
              </div>

              {/* Column headers */}
              <div className={styles.topProductsHead}>
                <span>PRODUCT</span>
                <span>CHANNEL</span>
                <span>SOLD</span>
                <span>STOCK</span>
                <span>PRICE</span>
              </div>

              {/* One row per product — driven by topProducts state */}
              {topProducts.map((product) => (
                <div key={product.name} className={styles.topProductsRow}>

                  {/* Grey thumbnail placeholder + product name */}
                  <span className={styles.topProductName}>
                    <span className={styles.topProductThumb} aria-hidden="true" />
                    {product.name}
                  </span>

                  <span className={styles.topProductCell}>{product.channel}</span>
                  <span className={styles.topProductCell}>{product.sold}</span>

                  {/* Stock count: highlight in red when critically low (< 5 units) */}
                  <span
                    className={styles.topProductCell}
                    style={product.stock < 5 ? { color: "#E51300", fontWeight: 600 } : {}}
                  >
                    {product.stock}
                  </span>

                  <span className={styles.topProductCell}>{product.price}</span>
                </div>
              ))}
            </div>

            {/* ── RIGHT: Activity feed ────────────────────────────────
                Chronological list of platform events.
                Each item: coloured dot | event text | time ago.
            ────────────────────────────────────────────────── */}
            <div className={clsx(styles.card, styles.activityCard)}>

              {/* Card header — no action link in the reference design */}
              <div className={styles.activityHeader}>
                <span className={styles.activityTitle}>Activity</span>
              </div>

              {/* List of activity items — driven by activityFeed state */}
              <div className={styles.activityList}>
                {activityFeed.map((item, idx) => (
                  <div key={idx} className={styles.activityItem}>

                    {/* Coloured identity dot */}
                    <span
                      className={styles.activityDot}
                      style={{ background: item.colour }}
                    />

                    {/* Event text + relative timestamp stacked */}
                    <div className={styles.activityInfo}>
                      <span className={styles.activityText}>{item.text}</span>
                      <span className={styles.activityTime}>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>
    </>
  );
};

export default Homepage;
