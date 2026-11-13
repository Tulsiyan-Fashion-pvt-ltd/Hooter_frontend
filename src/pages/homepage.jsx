import { useState, useEffect, useCallback, useContext } from "react";
import styles from "../css/pages/Homepage.module.css";
import clsx from "clsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toastContext } from "../appContext";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ─────────────────────────────────────────────────────────────
   Inline SVG icons for toolbar and UI buttons
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
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const ExportIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   Tab navigation categories
───────────────────────────────────────────────────────────── */
const OVERVIEW_TABS = [
  "Overview",
  "Sales",
  "Fulfillment",
  "Customers",
  "Marketing",
];

/* ─────────────────────────────────────────────────────────────
   Mock KPI Data by Tab
───────────────────────────────────────────────────────────── */
const MOCK_KPI_BY_TAB = {
  0: { // Overview
    revenue: { value: "₹18.4L", change: 14.2, unit: "%" },
    orders: { value: "3,842", change: 9.8, unit: "%" },
    avgOrderValue: { value: "₹1,479", change: -1.3, unit: "%" },
    conversionRate: { value: "3.6%", change: 0.4, unit: "pp" },
    activeListings: { value: "12,480", change: 320, unit: "" },
    returnRate: { value: "4.1%", change: 0.6, unit: "pp", isNegative: true },
  },
  1: { // Sales
    revenue: { value: "₹12.1L", change: 8.5, unit: "%" },
    orders: { value: "2,610", change: 5.2, unit: "%" },
    avgOrderValue: { value: "₹1,320", change: 2.1, unit: "%" },
    conversionRate: { value: "4.2%", change: 0.8, unit: "pp" },
    activeListings: { value: "11,900", change: 210, unit: "" },
    returnRate: { value: "3.8%", change: -0.2, unit: "pp", isNegative: true },
  },
  2: { // Fulfillment
    revenue: { value: "₹5.9L", change: -3.0, unit: "%" },
    orders: { value: "1,190", change: -2.4, unit: "%" },
    avgOrderValue: { value: "₹1,495", change: 0.5, unit: "%" },
    conversionRate: { value: "2.9%", change: -0.3, unit: "pp" },
    activeListings: { value: "9,800", change: -140, unit: "" },
    returnRate: { value: "5.2%", change: 0.9, unit: "pp", isNegative: true },
  },
  3: { // Customers
    revenue: { value: "₹8.2L", change: 11.0, unit: "%" },
    orders: { value: "3,100", change: 7.3, unit: "%" },
    avgOrderValue: { value: "₹1,560", change: 3.2, unit: "%" },
    conversionRate: { value: "5.1%", change: 1.2, unit: "pp" },
    activeListings: { value: "13,200", change: 560, unit: "" },
    returnRate: { value: "3.2%", change: -0.8, unit: "pp", isNegative: true },
  },
  4: { // Marketing
    revenue: { value: "₹22.7L", change: 18.6, unit: "%" },
    orders: { value: "4,520", change: 14.1, unit: "%" },
    avgOrderValue: { value: "₹1,612", change: 4.5, unit: "%" },
    conversionRate: { value: "6.3%", change: 2.0, unit: "pp" },
    activeListings: { value: "14,800", change: 980, unit: "" },
    returnRate: { value: "2.8%", change: -1.1, unit: "pp", isNegative: true },
  },
};

/* ─────────────────────────────────────────────────────────────
   Revenue trend chart data
───────────────────────────────────────────────────────────── */
const REVENUE_TREND_DATA = [
  { week: "Wk 1", revenue: 180000 },
  { week: "Wk 2", revenue: 235000 },
  { week: "Wk 3", revenue: 260000 },
  { week: "Wk 4", revenue: 300000 },
  { week: "Wk 5", revenue: 350000 },
  { week: "Wk 6", revenue: 355000 },
];

/* ─────────────────────────────────────────────────────────────
   Fulfillment funnel stages
───────────────────────────────────────────────────────────── */
const FULFILLMENT_FUNNEL_DATA = [
  { label: "Placed", value: 3842, isReturn: false },
  { label: "Confirmed", value: 3790, isReturn: false },
  { label: "Packed", value: 3650, isReturn: false },
  { label: "Shipped", value: 3502, isReturn: false },
  { label: "Delivered", value: 3298, isReturn: false },
  { label: "Returned", value: 158, isReturn: true },
];

/* ─────────────────────────────────────────────────────────────
   Marketplace Performance
───────────────────────────────────────────────────────────── */
const MARKETPLACE_DATA = [
  { name: "Amazon", colour: "#f97316", orders: 1204, revenue: "₹6,12,400", rate: "3.2%", growth: 11, status: "Healthy" },
  { name: "Flipkart", colour: "#2563eb", orders: 892, revenue: "₹4,20,100", rate: "4.8%", growth: 6, status: "Healthy" },
  { name: "Myntra", colour: "#ec4899", orders: 654, revenue: "₹3,10,900", rate: "5.1%", growth: -2, status: "Watch" },
  { name: "Website", colour: "#10b981", orders: 512, revenue: "₹2,45,600", rate: "2.9%", growth: 18, status: "Healthy" },
  { name: "Meesho", colour: "#a855f7", orders: 398, revenue: "₹98,200", rate: "6.4%", growth: -4, status: "At risk" },
  { name: "Ajio", colour: "#e11d48", orders: 182, revenue: "₹1,55,100", rate: "3.7%", growth: 9, status: "Healthy" },
];

/* ─────────────────────────────────────────────────────────────
   Recent Orders
───────────────────────────────────────────────────────────── */
const RECENT_ORDERS = [
  { id: "#ORD-86421", customer: "Priya Sharma", channel: "Amazon", channelColor: "#f97316", amount: "₹2,399", status: "Shipped" },
  { id: "#ORD-86420", customer: "Rahul Verma", channel: "Myntra", channelColor: "#ec4899", amount: "₹1,599", status: "Processing" },
  { id: "#ORD-86419", customer: "Sana Khan", channel: "Flipkart", channelColor: "#2563eb", amount: "₹4,120", status: "Delivered" },
  { id: "#ORD-86418", customer: "Amit Joshi", channel: "Website", channelColor: "#10b981", amount: "₹899", status: "Returned" },
  { id: "#ORD-86417", customer: "Neha Gupta", channel: "Meesho", channelColor: "#a855f7", amount: "₹1,240", status: "Cancelled" },
];

/* ─────────────────────────────────────────────────────────────
   Inventory Alerts
───────────────────────────────────────────────────────────── */
const INVENTORY_ALERTS = [
  { name: "Cotton kurta set — M", detail: "3 units left", severity: "Critical", thumbBg: "#d7cdcc" },
  { name: "Sneaker white — UK 9", detail: "0 units left", severity: "Out of stock", thumbBg: "#1e293b" },
  { name: "Zipper jacket — Navy, M", detail: "8 units left", severity: "Reorder", thumbBg: "#334155" },
  { name: "Denim jacket — 32", detail: "12 units left", severity: "Reorder", thumbBg: "#1e293b" },
];

/* ─────────────────────────────────────────────────────────────
   Top Products
───────────────────────────────────────────────────────────── */
const TOP_PRODUCTS = [
  { name: "Zipper jacket", sold: 60, stock: 153, price: "₹1,599", thumbBg: "#1e293b" },
  { name: "Cotton kurta set", sold: 48, stock: 3, price: "₹899", thumbBg: "#d7cdcc" },
  { name: "Denim jacket", sold: 31, stock: 44, price: "₹1,299", thumbBg: "#1e293b" },
  { name: "Running shoes", sold: 27, stock: 60, price: "₹2,199", thumbBg: "#0f172a" },
];

/* ─────────────────────────────────────────────────────────────
   Activity Feed
───────────────────────────────────────────────────────────── */
const ACTIVITY_FEED = [
  { text: "Inventory synced across 7 marketplaces", time: "5 min ago", colour: "#2563eb" },
  { text: "New return request — Order #88418", time: "20 min ago", colour: "#f59e0b" },
  { text: "Price updated for 12 SKUs on Amazon", time: "1 hr ago", colour: "#2563eb" },
  { text: "Low stock alert — Cotton kurta set", time: "2 hr ago", colour: "#f59e0b" },
  { text: "Payout of ₹4,82,100 processed", time: "4 hr ago", colour: "#16a34a" },
];

/* ─────────────────────────────────────────────────────────────
   Helper: orderStatusConfig
───────────────────────────────────────────────────────────── */
function orderStatusConfig(status) {
  switch (status) {
    case "Shipped":
      return { dot: "#2563eb", bg: "#eff6ff", text: "#2563eb" };
    case "Processing":
      return { dot: "#d97706", bg: "#fffbeb", text: "#d97706" };
    case "Delivered":
      return { dot: "#16a34a", bg: "#f0fdf4", text: "#16a34a" };
    case "Returned":
      return { dot: "#dc2626", bg: "#fef2f2", text: "#dc2626" };
    case "Cancelled":
      return { dot: "#7c3aed", bg: "#f5f3ff", text: "#7c3aed" };
    default:
      return { dot: "#64748b", bg: "#f1f5f9", text: "#64748b" };
  }
}

/* ─────────────────────────────────────────────────────────────
   Helper: severityColor
───────────────────────────────────────────────────────────── */
function severityColor(severity) {
  if (severity === "Critical" || severity === "Out of stock") return "#dc2626";
  if (severity === "Reorder") return "#d97706";
  return "#64748b";
}

/* ─────────────────────────────────────────────────────────────
   Helper: mpStatusColor
───────────────────────────────────────────────────────────── */
function mpStatusColor(status) {
  if (status === "Healthy") return "#16a34a";
  if (status === "Watch") return "#d97706";
  if (status === "At risk") return "#dc2626";
  return "#64748b";
}

/* ═════════════════════════════════════════════════════════════
   Homepage Component
═════════════════════════════════════════════════════════════ */
export default function Homepage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const showToast = useContext(toastContext);

  const [activeOverviewTab, setActiveOverviewTab] = useState(0);
  const [kpiData, setKpiData] = useState(() => MOCK_KPI_BY_TAB[0]);
  const [revenueTrend, setRevenueTrend] = useState(REVENUE_TREND_DATA);
  const [fulfillmentFunnel, setFulfillmentFunnel] = useState(FULFILLMENT_FUNNEL_DATA);

  const [marketplaceData, setMarketplaceData] = useState(MARKETPLACE_DATA);
  const [recentOrders, setRecentOrders] = useState(RECENT_ORDERS);
  const [inventoryAlerts, setInventoryAlerts] = useState(INVENTORY_ALERTS);
  const [topProducts, setTopProducts] = useState(TOP_PRODUCTS);
  const [activityFeed, setActivityFeed] = useState(ACTIVITY_FEED);

  /* ── Shopify OAuth redirect handler ───────────────────── */
  useEffect(() => {
    const params = Object.fromEntries(searchParams);
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
          setSearchParams({}, { replace: true });
          navigate("/", { replace: true });
          return;
        }

        setSearchParams({}, { replace: true });
        if (data.redirect) {
          window.location.href = data.redirect;
          return;
        }
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Shopify OAuth request failed:", error);
        setSearchParams({}, { replace: true });
        navigate("/", { replace: true });
      }
    }

    sendShopifyRedirect();
  }, [searchParams, setSearchParams, navigate]);

  /* ── Fetch / Refresh dashboard data ──────────────────── */
  const fetchDashboardData = useCallback(async () => {
    const tabKpi = MOCK_KPI_BY_TAB[activeOverviewTab] || MOCK_KPI_BY_TAB[0];
    setKpiData(tabKpi);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      try {
        const mpRes = await fetch(
          `${import.meta.env.VITE_BASEAPI}/dashboard/marketplace-performance`,
          { credentials: "include", signal: controller.signal }
        );
        if (mpRes.ok) setMarketplaceData(await mpRes.json());
      } catch {}

      try {
        const ordRes = await fetch(
          `${import.meta.env.VITE_BASEAPI}/orders/recent`,
          { credentials: "include", signal: controller.signal }
        );
        if (ordRes.ok) setRecentOrders(await ordRes.json());
      } catch {}

      try {
        const invRes = await fetch(
          `${import.meta.env.VITE_BASEAPI}/inventory/alerts`,
          { credentials: "include", signal: controller.signal }
        );
        if (invRes.ok) setInventoryAlerts(await invRes.json());
      } catch {}

      try {
        const topRes = await fetch(
          `${import.meta.env.VITE_BASEAPI}/products/top`,
          { credentials: "include", signal: controller.signal }
        );
        if (topRes.ok) setTopProducts(await topRes.json());
      } catch {}

      try {
        const actRes = await fetch(
          `${import.meta.env.VITE_BASEAPI}/activity/recent`,
          { credentials: "include", signal: controller.signal }
        );
        if (actRes.ok) setActivityFeed(await actRes.json());
      } catch {}
    } finally {
      clearTimeout(timeoutId);
    }
  }, [activeOverviewTab]);

  useEffect(() => {
    fetchDashboardData();
  }, [activeOverviewTab, fetchDashboardData]);

  const kpiCards = [
    { id: "revenue", label: "Revenue", ...kpiData.revenue },
    { id: "orders", label: "Orders", ...kpiData.orders },
    { id: "avgOrderValue", label: "Avg. order value", ...kpiData.avgOrderValue },
    { id: "conversionRate", label: "Conversion rate", ...kpiData.conversionRate },
    { id: "activeListings", label: "Active listings", ...kpiData.activeListings },
    { id: "returnRate", label: "Return rate", ...kpiData.returnRate },
  ];

  const maxFunnel = fulfillmentFunnel[0]?.value || 3842;

  return (
    <main className={styles.pageContent}>
      <div className={styles.pageContainer}>

        {/* ── 1. Top Overview Tabs ──────────────────────────────── */}
        <div className={styles.tabStrip}>
          <nav className={styles.tabList} aria-label="Dashboard views">
            {OVERVIEW_TABS.map((tab, idx) => (
              <button
                key={tab}
                type="button"
                className={clsx(styles.tabItem, activeOverviewTab === idx && styles.tabItemActive)}
                onClick={() => setActiveOverviewTab(idx)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* ── 2. Filter Bar & Actions ──────────────────────────── */}
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <button className={styles.filterBtn} id="btn-date-range" type="button">
              <CalendarIcon />
              <span>Last 30 days</span>
            </button>

            <button className={styles.filterBtn} id="btn-marketplaces" type="button">
              <span>All marketplaces (7)</span>
              <ChevronDownIcon />
            </button>

            <button className={styles.filterBtn} id="btn-warehouses" type="button">
              <span>All warehouses</span>
              <ChevronDownIcon />
            </button>
          </div>

          <div className={styles.actionGroup}>
            <button
              id="btn-refresh"
              className={styles.actionBtnOutline}
              type="button"
              onClick={async () => {
                await fetchDashboardData();
                showToast("Dashboard refreshed", "green");
              }}
              title="Refresh dashboard data"
            >
              <RefreshIcon />
              <span>Refresh</span>
            </button>

            <button id="btn-export" className={styles.actionBtnOutline} type="button" title="Export report">
              <ExportIcon />
              <span>Export</span>
            </button>

            <button id="btn-create-report" className={styles.actionBtnPrimary} type="button" title="Create a new report">
              <PlusIcon />
              <span>Create report</span>
            </button>
          </div>
        </div>

        {/* ── 3. Six KPI Metric Cards ──────────────────────────── */}
        <div className={styles.kpiGrid}>
          {kpiCards.map((card) => {
            const isPositive = card.change >= 0;
            const absChange = Math.abs(card.change);
            const arrow = isPositive ? "↑" : "↓";
            const changeStr = card.unit === ""
              ? `${arrow} ${absChange}`
              : `${arrow} ${absChange}${card.unit}`;

            const isRed = card.isNegative ? isPositive : !isPositive;
            const trendColor = isRed ? "#dc2626" : "#16a34a";

            return (
              <div key={card.id} className={styles.kpiCard} id={`kpi-${card.id}`}>
                <span className={styles.kpiLabel}>{card.label}</span>
                <span className={styles.kpiValue}>{card.value}</span>
                <span className={styles.kpiTrend} style={{ color: trendColor }}>
                  {changeStr}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── 4. Revenue Trend & Fulfillment Funnel ─────────────── */}
        <div className={styles.analyticsRow}>
          {/* Revenue Trend Line Chart */}
          <div className={clsx(styles.card, styles.trendPanel)}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Revenue trend</h3>
                <p className={styles.cardSubtitle}>Across all connected marketplaces</p>
              </div>
              <button type="button" className={styles.linkAction}>View details</button>
            </div>

            <div className={styles.trendChartWrap}>
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart
                  data={revenueTrend}
                  margin={{ top: 12, right: 12, bottom: 0, left: 12 }}
                >
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.16} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="week"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    dy={6}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(val) => [`₹${(val / 100000).toFixed(1)}L`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fill="url(#revenueGrad)"
                    dot={false}
                    activeDot={{ r: 4, stroke: "#2563eb", strokeWidth: 2, fill: "#ffffff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fulfillment Funnel */}
          <div className={clsx(styles.card, styles.funnelPanel)}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Fulfillment funnel</h3>
              <button type="button" className={styles.linkAction}>View details</button>
            </div>

            <div className={styles.funnelList}>
              {fulfillmentFunnel.map((stage) => {
                const pct = Math.round((stage.value / maxFunnel) * 100);
                return (
                  <div key={stage.label} className={styles.funnelRow}>
                    <span className={styles.funnelLabel}>{stage.label}</span>
                    <div className={styles.funnelBarTrack}>
                      <div
                        className={styles.funnelBarFill}
                        style={{
                          width: `${pct}%`,
                          background: stage.isReturn ? "#dc2626" : "#2563eb",
                        }}
                      />
                    </div>
                    <span className={styles.funnelCount}>
                      {stage.value.toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 5. Marketplace Performance ───────────────────────── */}
        <div className={clsx(styles.card, styles.mpCard)}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Marketplace performance</h3>
              <p className={styles.cardSubtitle}>Last 30 days</p>
            </div>
            <button type="button" className={styles.linkAction} onClick={() => navigate("/integrations")}>
              View all channels
            </button>
          </div>

          <div className={styles.mpGrid}>
            {marketplaceData.map((mp) => {
              const isPos = mp.growth >= 0;
              const growthColor = isPos ? "#16a34a" : "#dc2626";
              const growthText = `${isPos ? "+" : ""}${mp.growth}%`;

              return (
                <div key={mp.name} className={styles.mpRow}>
                  <div className={styles.mpName}>
                    <span className={styles.mpDot} style={{ background: mp.colour }} />
                    <span>{mp.name}</span>
                  </div>
                  <span className={styles.mpCell}>{mp.orders.toLocaleString("en-IN")}</span>
                  <span className={styles.mpCell}>{mp.revenue}</span>
                  <span className={styles.mpCell}>{mp.rate}</span>
                  <span className={styles.mpGrowth} style={{ color: growthColor }}>
                    {growthText}
                  </span>
                  <span className={styles.mpStatus} style={{ color: mpStatusColor(mp.status) }}>
                    {mp.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 6. Two Columns: Recent Orders + Inventory Alerts ─── */}
        <div className={styles.twoColRow}>
          {/* Recent Orders */}
          <div className={clsx(styles.card, styles.columnCard)}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Recent orders</h3>
              <button type="button" className={styles.linkAction} onClick={() => navigate("/orders")}>
                View all orders
              </button>
            </div>

            <div className={styles.ordersHead}>
              <span>ORDER</span>
              <span>CUSTOMER</span>
              <span>CHANNEL</span>
              <span>AMOUNT</span>
              <span>STATUS</span>
            </div>

            <div className={styles.ordersList}>
              {recentOrders.map((ord) => {
                const cfg = orderStatusConfig(ord.status);
                return (
                  <div key={ord.id} className={styles.ordersRow}>
                    <span className={styles.ordersId}>{ord.id}</span>
                    <span className={styles.ordersCustomer}>{ord.customer}</span>
                    <div className={styles.ordersChannel}>
                      <span className={styles.mpDot} style={{ background: ord.channelColor || "#64748b" }} />
                      <span>{ord.channel}</span>
                    </div>
                    <span className={styles.ordersAmount}>{ord.amount}</span>
                    <div>
                      <span
                        className={styles.ordersBadge}
                        style={{ background: cfg.bg, color: cfg.text }}
                      >
                        <span className={styles.ordersBadgeDot} style={{ background: cfg.dot }} />
                        {ord.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inventory Alerts */}
          <div className={clsx(styles.card, styles.columnCard)}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Inventory alerts</h3>
              <button type="button" className={styles.linkAction} onClick={() => navigate("/inventory")}>
                Manage stock
              </button>
            </div>

            <div className={styles.alertsList}>
              {inventoryAlerts.map((item) => (
                <div key={item.name} className={styles.alertRow}>
                  <div className={styles.alertLeft}>
                    <div className={styles.alertThumb} style={{ background: item.thumbBg || "#e2e8f0" }} />
                    <div>
                      <div className={styles.alertTitle}>{item.name}</div>
                      <div className={styles.alertSub}>{item.detail}</div>
                    </div>
                  </div>
                  <span className={styles.alertSeverity} style={{ color: severityColor(item.severity) }}>
                    {item.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 7. Two Columns: Top Products + Activity ──────────── */}
        <div className={styles.twoColRow}>
          {/* Top Products */}
          <div className={clsx(styles.card, styles.columnCard)}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Top products</h3>
              <button type="button" className={styles.linkAction} onClick={() => navigate("/catalog")}>
                View catalog
              </button>
            </div>

            <div className={styles.topProductsList}>
              {topProducts.map((p) => (
                <div key={p.name} className={styles.topProductRow}>
                  <div className={styles.topProductThumb} style={{ background: p.thumbBg || "#1e293b" }} />
                  <span className={styles.topProductName}>{p.name}</span>
                  <span className={styles.topProductSold}>{p.sold}</span>
                  <span
                    className={styles.topProductStock}
                    style={p.stock < 5 ? { color: "#dc2626", fontWeight: 600 } : {}}
                  >
                    {p.stock}
                  </span>
                  <span className={styles.topProductPrice}>{p.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className={clsx(styles.card, styles.columnCard)}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Activity</h3>
            </div>

            <div className={styles.activityList}>
              {activityFeed.map((item, idx) => (
                <div key={idx} className={styles.activityItem}>
                  <span className={styles.activityDot} style={{ background: item.colour || "#2563eb" }} />
                  <div className={styles.activityBody}>
                    <div className={styles.activityText}>{item.text}</div>
                    <div className={styles.activityTime}>{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
