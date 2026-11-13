import { useState, useMemo } from "react";
import styles from "../css/pages/Shipping.module.css";
import clsx from "clsx";

/* ─────────────────────────────────────────────────────────────
   Mock Data & Constants
───────────────────────────────────────────────────────────── */

const TOP_PILLS = [
  { id: "all", label: "All shipments", count: "12,842", type: "primary" },
  { id: "attention", label: "Needs attention", count: "84", type: "warning" },
  { id: "priority", label: "High priority", count: "3,214", type: "neutral" },
  { id: "cod_pending", label: "COD pending", count: "4,920", type: "neutral" },
];

const METRIC_CARDS = [
  { label: "Total Shipments", value: "12,842", sub: "Last 30 days" },
  { label: "In Transit", value: "3,214", sub: "In transit" },
  { label: "Out for Delivery", value: "941", sub: "With delivery exec." },
  { label: "Delivered", value: "7,608", sub: "68% of total" },
  { label: "SLA Breached", value: "268", sub: "Action needed", subType: "danger" },
  { label: "COD Pending", value: "₹9.8L", sub: "Reconciliation pending", subType: "warning" },
];

const TABS = [
  { id: "all", label: "All Shipments" },
  { id: "in_transit", label: "In Transit" },
  { id: "out_for_delivery", label: "Out for Delivery" },
  { id: "delivered", label: "Delivered" },
  { id: "on_hold", label: "On Hold" },
  { id: "delayed", label: "Delayed" },
  { id: "exceptions", label: "Exceptions" },
  { id: "rto", label: "RTO" },
  { id: "cod_recon", label: "COD Reconciliation" },
  { id: "marketplace", label: "Marketplace Shipments" },
  { id: "reports", label: "Reports" },
];

const MOCK_SHIPMENTS = [
  {
    id: "1",
    orderId: "#ORD-88421",
    channelRef: "AMZ-7723-9910 • Sep 12, 2026",
    customer: { name: "Priya Sharma", location: "Mumbai, Maharashtra", initials: "PS", avatarBg: "#15803d" },
    channel: { name: "Amazon", courier: "Amazon Logistics", dotColor: "#f97316" },
    awb: "AMZ7718219384",
    payment: { type: "Prepaid", amount: "₹2,399" },
    status: "In Transit",
    location: { hub: "Bhiwandi Hub, MH", scan: "Departed origin hub • Sep 13, 4:40 PM" },
    sla: { text: "✓ On time", type: "success" },
    codRecon: "—",
  },
  {
    id: "2",
    orderId: "#ORD-88420",
    channelRef: "MYN-4471-2201 • Sep 12, 2026",
    customer: { name: "Rahul Verma", location: "Pune, Maharashtra", initials: "RV", avatarBg: "#991b1b" },
    channel: { name: "Myntra", courier: "Delhivery", dotColor: "#ec4899" },
    awb: "DL294810891",
    payment: { type: "COD", amount: "₹1,599", sub: "COD ₹1,599" },
    status: "Delayed",
    location: { hub: "Pune Sorting Center", scan: "Awaiting pickup scan • Sep 12, 8:10 PM" },
    sla: { text: "⚠ Overdue 3h", type: "warning" },
    codRecon: "Pending Collection",
  },
  {
    id: "3",
    orderId: "#ORD-88419",
    channelRef: "FLP-1120-8834 • Sep 11, 2026",
    customer: { name: "Sana Khan", location: "Bengaluru, Karnataka", initials: "SK", avatarBg: "#15803d" },
    channel: { name: "Flipkart", courier: "Flipkart Courier", dotColor: "#2563eb" },
    awb: "FKC556291882",
    payment: { type: "Prepaid", amount: "₹4,120" },
    status: "Delivered",
    location: { hub: "Delivered", scan: "Delivered to customer • Sep 12, 1:05 PM" },
    sla: { text: "✓ On time", type: "success" },
    codRecon: "—",
  },
  {
    id: "4",
    orderId: "#ORD-88418",
    channelRef: "— • Sep 10, 2026",
    customer: { name: "Amit Joshi", location: "Lucknow, Uttar Pradesh", initials: "AJ", avatarBg: "#2563eb" },
    channel: { name: "Website", courier: "Blue Dart", dotColor: "#10b981" },
    awb: "BD119921841",
    payment: { type: "COD", amount: "₹899", sub: "COD ₹899" },
    status: "RTO Delivered",
    location: { hub: "Restocked - LKO WH", scan: "RTO delivered to warehouse • Sep 13, 11:20 AM" },
    sla: { text: "✓ On time", type: "success" },
    codRecon: "Collection Failed Closed",
  },
  {
    id: "5",
    orderId: "#ORD-88417",
    channelRef: "MSH-9012-1145 • Sep 12, 2026",
    customer: { name: "Neha Gupta", location: "Jaipur, Rajasthan", initials: "NG", avatarBg: "#15803d" },
    channel: { name: "Meesho", courier: "Meesho Logistics Partner", dotColor: "#a855f7" },
    awb: "MLP772183950",
    payment: { type: "COD", amount: "₹1,240", sub: "COD ₹1,240" },
    status: "Out for Delivery",
    location: { hub: "Jaipur - Malviya Nagar", scan: "Out for delivery • Sep 14, 9:32 AM" },
    sla: { text: "✓ On time", type: "success" },
    codRecon: "Pending Collection",
  },
  {
    id: "6",
    orderId: "#ORD-88416",
    channelRef: "AJI-3321-7790 • Sep 9, 2026",
    customer: { name: "Vikram Rao", location: "Hyderabad, Telangana", initials: "VR", avatarBg: "#6d28d9" },
    channel: { name: "Ajio", courier: "XpressBees", dotColor: "#e11d48" },
    awb: "XB552910038",
    payment: { type: "Prepaid", amount: "₹2,199" },
    status: "In Transit",
    location: { hub: "Hyderabad Hub", scan: "Shipment departed origin hub • Sep 13, 8:15 PM" },
    sla: { text: "✓ On time", type: "success" },
    codRecon: "—",
  },
  {
    id: "7",
    orderId: "#ORD-88415",
    channelRef: "AMZ-4471-6621 • Sep 8, 2026",
    customer: { name: "Kavya Menon", location: "Kochi, Kerala", initials: "KM", avatarBg: "#b45309" },
    channel: { name: "Amazon", courier: "Amazon Logistics", dotColor: "#f97316" },
    awb: "AMZ118820044",
    payment: { type: "Prepaid", amount: "₹5,980" },
    status: "Delivered",
    location: { hub: "Delivered", scan: "Delivered to customer • Sep 11, 4:02 PM" },
    sla: { text: "✓ On time", type: "success" },
    codRecon: "—",
  },
  {
    id: "8",
    orderId: "#ORD-88414",
    channelRef: "— • Sep 7, 2026",
    customer: { name: "Rohan Iyer", location: "Chennai, Tamil Nadu", initials: "RI", avatarBg: "#b91c1c" },
    channel: { name: "Website", courier: "Ecom Express", dotColor: "#10b981" },
    awb: "ECX228190334",
    payment: { type: "COD", amount: "₹1,699", sub: "COD ₹1,699" },
    status: "Exception",
    location: { hub: "Chennai Hub", scan: "Delivery failed - customer unavailable • Sep 13, 2:44 PM" },
    sla: { text: "⚠ Breached", type: "danger" },
    codRecon: "Pending Collection",
  },
  {
    id: "9",
    orderId: "#ORD-88413",
    channelRef: "FLP-8820-1194 • Sep 8, 2026",
    customer: { name: "Anjali Nair", location: "Ahmedabad, Gujarat", initials: "AN", avatarBg: "#b91c1c" },
    channel: { name: "Flipkart", courier: "Flipkart Courier", dotColor: "#2563eb" },
    awb: "FKC118828771",
    payment: { type: "COD", amount: "₹1,580", sub: "COD ₹1,580" },
    status: "On Hold",
    location: { hub: "Ahmedabad Hub", scan: "Held - pincode serviceability issue • Sep 12, 5:12 PM" },
    sla: { text: "⚠ Overdue 1d", type: "warning" },
    codRecon: "Pending Collection",
  },
  {
    id: "10",
    orderId: "#ORD-88412",
    channelRef: "— • Sep 5, 2026",
    customer: { name: "Farhan Sheikh", location: "Indore, Madhya Pradesh", initials: "FS", avatarBg: "#4f46e5" },
    channel: { name: "Shopify", courier: "Delhivery", dotColor: "#10b981" },
    awb: "DL887723904",
    payment: { type: "Prepaid", amount: "₹999" },
    status: "RTO In Transit",
    location: { hub: "Indore Hub", scan: "RTO shipment in transit • Sep 13, 9:00 AM" },
    sla: { text: "—", type: "neutral" },
    codRecon: "—",
  },
  {
    id: "11",
    orderId: "#ORD-88411",
    channelRef: "MSH-6621-3387 • Sep 5, 2026",
    customer: { name: "Divya Pillai", location: "Coimbatore, Tamil Nadu", initials: "DP", avatarBg: "#4338ca" },
    channel: { name: "Meesho", courier: "Meesho Logistics Partner", dotColor: "#a855f7" },
    awb: "MLP331298774",
    payment: { type: "COD", amount: "₹749", sub: "COD ₹749" },
    status: "Delivered",
    location: { hub: "Delivered", scan: "Delivered to customer • Sep 9, 12:20 PM" },
    sla: { text: "✓ On time", type: "success" },
    codRecon: "Collected Pending",
  },
  {
    id: "12",
    orderId: "#ORD-88410",
    channelRef: "— • Sep 4, 2026",
    customer: { name: "Karan Malhotra", location: "Delhi, Delhi", initials: "KM", avatarBg: "#b45309" },
    channel: { name: "Website", courier: "XpressBees", dotColor: "#10b981" },
    awb: "XB119293847",
    payment: { type: "COD", amount: "₹3,299", sub: "COD ₹3,299" },
    status: "Delivered",
    location: { hub: "Delivered", scan: "Delivered to customer • Sep 6, 3:30 PM" },
    sla: { text: "✓ On time", type: "success" },
    codRecon: "Collected Mismatch",
  },
  {
    id: "13",
    orderId: "#ORD-88409",
    channelRef: "AMZ-2281-7753 • Sep 3, 2026",
    customer: { name: "Meera Krishnan", location: "Nagpur, Maharashtra", initials: "MK", avatarBg: "#78350f" },
    channel: { name: "Amazon", courier: "Amazon Logistics", dotColor: "#f97316" },
    awb: "AMZ662910038",
    payment: { type: "Prepaid", amount: "₹1,450" },
    status: "Exception",
    location: { hub: "Nagpur Hub", scan: "Package damaged in transit • Sep 12, 10:15 AM" },
    sla: { text: "⚠ Breached", type: "danger" },
    codRecon: "—",
  },
  {
    id: "14",
    orderId: "#ORD-88408",
    channelRef: "— • Sep 2, 2026",
    customer: { name: "Ishaan Kapoor", location: "Surat, Gujarat", initials: "IK", avatarBg: "#2563eb" },
    channel: { name: "Website", courier: "Blue Dart", dotColor: "#10b981" },
    awb: "BD771929385",
    payment: { type: "COD", amount: "₹2,110", sub: "COD ₹2,110" },
    status: "RTO Delivered",
    location: { hub: "Restocked - SRT WH", scan: "RTO delivered to warehouse • Sep 8, 2:10 PM" },
    sla: { text: "—", type: "neutral" },
    codRecon: "Collection Failed Closed",
  },
  {
    id: "15",
    orderId: "#ORD-88407",
    channelRef: "FLP-9910-2287 • Sep 1, 2026",
    customer: { name: "Tanya Bose", location: "Kolkata, West Bengal", initials: "TB", avatarBg: "#1d4ed8" },
    channel: { name: "Flipkart", courier: "Flipkart Courier", dotColor: "#2563eb" },
    awb: "FKC229104487",
    payment: { type: "COD", amount: "₹1,329", sub: "COD ₹1,329" },
    status: "Delivered",
    location: { hub: "Delivered", scan: "Delivered to customer • Sep 3, 11:40 AM" },
    sla: { text: "✓ On time", type: "success" },
    codRecon: "Collected Matched",
  },
  {
    id: "16",
    orderId: "#ORD-88406",
    channelRef: "— • Aug 30, 2026",
    customer: { name: "Aditya Rane", location: "Nashik, Maharashtra", initials: "AR", avatarBg: "#1d4ed8" },
    channel: { name: "Website", courier: "Delhivery", dotColor: "#10b981" },
    awb: "DL229104773",
    payment: { type: "COD", amount: "₹1,180", sub: "COD ₹1,180" },
    status: "On Hold",
    location: { hub: "Nashik Hub", scan: "Held - customer requested reschedule • Sep 12, 4:00 PM" },
    sla: { text: "✓ On time", type: "success" },
    codRecon: "Pending Collection",
  },
];

/* ─────────────────────────────────────────────────────────────
   Status Helpers
───────────────────────────────────────────────────────────── */
function getStatusStyle(status) {
  switch (status) {
    case "In Transit":
    case "Out for Delivery":
      return { dot: "#2563eb", text: "#2563eb" };
    case "Delivered":
      return { dot: "#16a34a", text: "#16a34a" };
    case "Delayed":
    case "On Hold":
    case "RTO In Transit":
      return { dot: "#d97706", text: "#d97706" };
    case "Exception":
      return { dot: "#dc2626", text: "#dc2626" };
    case "RTO Delivered":
      return { dot: "#7c3aed", text: "#7c3aed" };
    default:
      return { dot: "#64748b", text: "#64748b" };
  }
}

function getSlaStyle(type) {
  switch (type) {
    case "success":
      return "#16a34a";
    case "warning":
      return "#d97706";
    case "danger":
      return "#dc2626";
    default:
      return "#94a3b8";
  }
}

/* ═════════════════════════════════════════════════════════════
   Shipping Component
═════════════════════════════════════════════════════════════ */
export default function Shipping() {
  const [activePill, setActivePill] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'kanban' | 'chart'

  // Filter items
  const filteredShipments = useMemo(() => {
    let list = MOCK_SHIPMENTS;

    // Filter by tab
    if (activeTab === "in_transit") {
      list = list.filter((s) => s.status === "In Transit");
    } else if (activeTab === "out_for_delivery") {
      list = list.filter((s) => s.status === "Out for Delivery");
    } else if (activeTab === "delivered") {
      list = list.filter((s) => s.status === "Delivered");
    } else if (activeTab === "on_hold") {
      list = list.filter((s) => s.status === "On Hold");
    } else if (activeTab === "delayed") {
      list = list.filter((s) => s.status === "Delayed");
    } else if (activeTab === "exceptions") {
      list = list.filter((s) => s.status === "Exception");
    } else if (activeTab === "rto") {
      list = list.filter((s) => s.status.includes("RTO"));
    }

    // Filter by search query
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.orderId.toLowerCase().includes(q) ||
          s.awb.toLowerCase().includes(q) ||
          s.customer.name.toLowerCase().includes(q) ||
          s.channel.name.toLowerCase().includes(q) ||
          s.channel.courier.toLowerCase().includes(q) ||
          s.location.hub.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeTab, search]);

  const allSelected =
    filteredShipments.length > 0 &&
    filteredShipments.every((s) => selectedIds.has(s.id));

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        filteredShipments.forEach((s) => next.delete(s.id));
      } else {
        filteredShipments.forEach((s) => next.add(s.id));
      }
      return next;
    });
  }

  function toggleRow(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className={styles.pageRoot}>
      <div className={styles.container}>

        {/* ── 1. Page Header ─────────────────────────────────────── */}
        <div className={styles.header}>
          <h1 className={styles.title}>Shipments</h1>
          <p className={styles.subtitle}>
            12,842 shipments across all connected couriers & marketplaces • Updated 2 minutes ago
          </p>
        </div>

        {/* ── 2. Top Pill Badges Row ─────────────────────────────── */}
        <div className={styles.pillsRow}>
          {TOP_PILLS.map((pill) => {
            const isActive = activePill === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                className={clsx(
                  styles.pillBtn,
                  pill.type === "primary" && (isActive ? styles.pillPrimaryActive : styles.pillPrimary),
                  pill.type === "warning" && styles.pillWarning,
                  pill.type === "neutral" && styles.pillNeutral
                )}
                onClick={() => setActivePill(pill.id)}
              >
                <span>{pill.label}</span>
                <span className={styles.pillCount}>{pill.count}</span>
              </button>
            );
          })}
        </div>

        {/* ── 3. Six Metric Overview Cards ──────────────────────── */}
        <div className={styles.metricsContainer}>
          {METRIC_CARDS.map((card, idx) => (
            <div key={card.label} className={styles.metricCard}>
              <span className={styles.metricLabel}>{card.label}</span>
              <span className={styles.metricValue}>{card.value}</span>
              <span
                className={clsx(
                  styles.metricSub,
                  card.subType === "danger" && styles.subDanger,
                  card.subType === "warning" && styles.subWarning
                )}
              >
                {card.sub}
              </span>
            </div>
          ))}
        </div>

        {/* ── 4. Horizontal Navigation Tabs ─────────────────────── */}
        <div className={styles.tabsStrip}>
          <nav className={styles.tabList} aria-label="Shipment status tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={clsx(styles.tabBtn, activeTab === tab.id && styles.tabBtnActive)}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── 5. Search & Filters Toolbar ────────────────────────── */}
        <div className={styles.toolbar}>
          {/* Left search & filters cluster */}
          <div className={styles.toolbarLeft}>
            {/* Search Input */}
            <div className={styles.searchWrapper}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Order / AWB / customer / phone / SKU"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Date range filter */}
            <button type="button" className={styles.filterBtn}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Last 30 Days</span>
              <span className={styles.caret}>▾</span>
            </button>

            {/* Channel filter */}
            <button type="button" className={styles.filterBtn}>
              <span className={styles.channelDot} />
              <span>Channel</span>
              <span className={styles.caret}>▾</span>
            </button>

            {/* Courier filter */}
            <button type="button" className={styles.filterBtn}>
              <span className={styles.courierDot} />
              <span>Courier</span>
              <span className={styles.caret}>▾</span>
            </button>

            {/* Payment filter */}
            <button type="button" className={styles.filterBtn}>
              <span className={styles.paymentIcon}>💳</span>
              <span>COD / Prepaid</span>
              <span className={styles.caret}>▾</span>
            </button>

            {/* Advanced Filters */}
            <button type="button" className={styles.filterBtn}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>Advanced Filters</span>
              <span className={styles.badgeDark}>5</span>
            </button>
          </div>

          {/* Right utility actions cluster */}
          <div className={styles.toolbarRight}>
            {/* View Switchers */}
            <div className={styles.viewToggleGroup}>
              <button
                type="button"
                className={clsx(styles.viewBtn, viewMode === "list" && styles.viewBtnActive)}
                onClick={() => setViewMode("list")}
                title="List View"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <button
                type="button"
                className={clsx(styles.viewBtn, viewMode === "kanban" && styles.viewBtnActive)}
                onClick={() => setViewMode("kanban")}
                title="Kanban View"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="18" rx="1"></rect>
                  <rect x="14" y="3" width="7" height="18" rx="1"></rect>
                </svg>
              </button>
              <button
                type="button"
                className={clsx(styles.viewBtn, viewMode === "chart" && styles.viewBtnActive)}
                onClick={() => setViewMode("chart")}
                title="Analytics View"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </button>
            </div>

            {/* Export */}
            <button type="button" className={styles.actionOutlineBtn}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export</span>
            </button>

            {/* Columns Customizer */}
            <button type="button" className={styles.actionPrimaryBtn}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Columns</span>
            </button>
          </div>
        </div>

        {/* ── 6. Shipments Data Table ───────────────────────────── */}
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.theadRow}>
                  <th className={styles.thCheck}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all shipments"
                      className={styles.checkbox}
                    />
                  </th>
                  <th className={styles.thOrder}>ORDER</th>
                  <th className={styles.thCustomer}>CUSTOMER</th>
                  <th className={styles.thChannel}>CHANNEL / COURIER</th>
                  <th className={styles.thAwb}>AWB</th>
                  <th className={styles.thPayment}>PAYMENT</th>
                  <th className={styles.thStatus}>STATUS</th>
                  <th className={styles.thLocation}>LOCATION / LAST SCAN</th>
                  <th className={styles.thSla}>SLA</th>
                  <th className={styles.thCodRecon}>COD / RECON</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={10} className={styles.emptyState}>
                      No shipments found matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((item) => {
                    const isChecked = selectedIds.has(item.id);
                    const statusCfg = getStatusStyle(item.status);
                    const slaColor = getSlaStyle(item.sla.type);

                    return (
                      <tr
                        key={item.id}
                        className={clsx(styles.trRow, isChecked && styles.trRowSelected)}
                      >
                        {/* Checkbox */}
                        <td className={styles.tdCheck}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleRow(item.id)}
                            aria-label={`Select shipment ${item.orderId}`}
                            className={styles.checkbox}
                          />
                        </td>

                        {/* Order ID & Channel Ref */}
                        <td className={styles.tdOrder}>
                          <span className={styles.orderId}>{item.orderId}</span>
                          <span className={styles.channelRef}>{item.channelRef}</span>
                        </td>

                        {/* Customer */}
                        <td className={styles.tdCustomer}>
                          <div className={styles.customerCell}>
                            <div
                              className={styles.customerAvatar}
                              style={{ background: item.customer.avatarBg }}
                            >
                              {item.customer.initials}
                            </div>
                            <div className={styles.customerInfo}>
                              <span className={styles.customerName}>{item.customer.name}</span>
                              <span className={styles.customerLoc}>{item.customer.location}</span>
                            </div>
                          </div>
                        </td>

                        {/* Channel / Courier */}
                        <td className={styles.tdChannel}>
                          <div className={styles.channelCell}>
                            <div className={styles.channelRow}>
                              <span
                                className={styles.statusDotSmall}
                                style={{ background: item.channel.dotColor }}
                              />
                              <span className={styles.channelName}>{item.channel.name}</span>
                            </div>
                            <span className={styles.courierName}>{item.channel.courier}</span>
                          </div>
                        </td>

                        {/* AWB */}
                        <td className={styles.tdAwb}>
                          <span className={styles.awbCode}>{item.awb}</span>
                        </td>

                        {/* Payment */}
                        <td className={styles.tdPayment}>
                          <div className={styles.paymentCell}>
                            <div className={styles.paymentTop}>
                              <span className={styles.paymentType}>{item.payment.type}</span>
                              {item.payment.type === "Prepaid" && (
                                <span className={styles.paymentAmt}>{item.payment.amount}</span>
                              )}
                            </div>
                            {item.payment.sub && (
                              <span className={styles.paymentSub}>
                                <span className={styles.strikeAmt}>{item.payment.amount}</span>{" "}
                                {item.payment.sub}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className={styles.tdStatus}>
                          <span className={styles.statusPill}>
                            <span
                              className={styles.statusDotSmall}
                              style={{ background: statusCfg.dot }}
                            />
                            <span style={{ color: statusCfg.text }}>{item.status}</span>
                          </span>
                        </td>

                        {/* Location / Last Scan */}
                        <td className={styles.tdLocation}>
                          <div className={styles.locationCell}>
                            <span className={styles.locationHub}>{item.location.hub}</span>
                            <span className={styles.locationScan}>{item.location.scan}</span>
                          </div>
                        </td>

                        {/* SLA */}
                        <td className={styles.tdSla}>
                          <span className={styles.slaBadge} style={{ color: slaColor }}>
                            {item.sla.text}
                          </span>
                        </td>

                        {/* COD / RECON */}
                        <td className={styles.tdCodRecon}>
                          <span className={styles.reconText}>{item.codRecon}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── 7. Table Footer Pagination ───────────────────────── */}
          <div className={styles.pagination}>
            <div className={styles.paginationLeft}>
              <span>Showing 1–{filteredShipments.length} of 12,842</span>
            </div>
            <div className={styles.paginationRight}>
              <span>Page 1 of 1,284</span>
              <div className={styles.pageNavBtns}>
                <button type="button" className={styles.pageNavBtn} disabled title="Previous page">
                  ◀
                </button>
                <button type="button" className={styles.pageNavBtn} title="Next page">
                  ▶
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

