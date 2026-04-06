import { useState, useEffect, useCallback } from "react";
import styles from "../css/pages/Homepage.module.css";
import clsx from "clsx";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

//import { checkCatalogExists } from "../services/catalogService";
import NoCatalogModal from "../components/NoCatalogModal";

import OrdersIcon from "../assets/icons/sidebar/orders-active.svg";
import ShippingIcon from "../assets/icons/sidebar/shipping-active.svg";
import UsersIcon from "../assets/icons/users.svg";
import ReturnsIcon from "../assets/icons/returns.svg";
import NoteIcon from "../assets/icons/note.svg";
import StatsIcon from "../assets/icons/sidebar/stats-active.svg";

const Homepage = () => {
  const platforms = [
    "Lets Check All",
    "Lets Check Flipkart",
    "Lets Check Amazon",
    "Lets Check Shopify",
    "Lets Check Website",
    "Lets Check Meesho",
    "Lets Check Myntra",
    "Lets Check Ajio",
  ];

  const [activePlatform, setActivePlatform] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  const insightsTabs = [
    "All ( 26 )",
    "Top Rated",
    "Best Seller",
    "New Listings",
    "Out Of Stocks",
  ];

  const [metricsData, setMetricsData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [bestSellerData, setBestSellerData] = useState(null);
  const [statisticsData, setStatisticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [showNoCatalogModal, setShowNoCatalogModal] = useState(false);

  // ── Catalog check ─────────────────────────────────────
  // TODO: uncomment when catalog check is ready
  // useEffect(() => {
  //   checkCatalogExists()
  //     .then(data => {
  //       if (data.catalog === 'unavailable') {
  //         setShowNoCatalogModal(true);
  //       }
  //     })
  //     .catch(err => console.error('Catalog check failed:', err));
  // }, []);

  // ── Dashboard data ────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const mockDataByPlatform = {
        0: {
          orders: { value: 42, change: 12, percentage: 65 },
          shipping: { value: 36, change: -8, percentage: 45 },
          activeUsers: { value: 108, change: 18, percentage: 72 },
          returns: { value: 16, change: -15, percentage: 30 },
        },
        1: {
          orders: { value: 89, change: 25, percentage: 85 },
          shipping: { value: 72, change: 15, percentage: 68 },
          activeUsers: { value: 287, change: 20, percentage: 78 },
          returns: { value: 31, change: -5, percentage: 42 },
        },
        2: {
          orders: { value: 112, change: -10, percentage: 38 },
          shipping: { value: 95, change: 8, percentage: 62 },
          activeUsers: { value: 354, change: -12, percentage: 35 },
          returns: { value: 38, change: 22, percentage: 88 },
        },
        3: {
          orders: { value: 45, change: -18, percentage: 28 },
          shipping: { value: 38, change: -22, percentage: 25 },
          activeUsers: { value: 156, change: -8, percentage: 45 },
          returns: { value: 18, change: 15, percentage: 70 },
        },
        4: {
          orders: { value: 34, change: 32, percentage: 90 },
          shipping: { value: 29, change: 28, percentage: 85 },
          activeUsers: { value: 98, change: 35, percentage: 92 },
          returns: { value: 12, change: -20, percentage: 22 },
        },
        5: {
          orders: { value: 28, change: 5, percentage: 55 },
          shipping: { value: 24, change: -3, percentage: 48 },
          activeUsers: { value: 87, change: 8, percentage: 60 },
          returns: { value: 9, change: -2, percentage: 38 },
        },
        6: {
          orders: { value: 21, change: -5, percentage: 42 },
          shipping: { value: 17, change: 12, percentage: 68 },
          activeUsers: { value: 65, change: -15, percentage: 32 },
          returns: { value: 8, change: 18, percentage: 75 },
        },
        7: {
          orders: { value: 13, change: -25, percentage: 20 },
          shipping: { value: 11, change: -18, percentage: 28 },
          activeUsers: { value: 42, change: -22, percentage: 25 },
          returns: { value: 8, change: 30, percentage: 95 },
        },
      };

      const p = mockDataByPlatform[activePlatform];
      setMetricsData({
        orders: {
          value: p.orders.value,
          change: p.orders.change,
          percentage: p.orders.percentage,
        },
        shipping: {
          value: p.shipping.value,
          change: p.shipping.change,
          percentage: p.shipping.percentage,
        },
        activeUsers: {
          value: p.activeUsers.value,
          change: p.activeUsers.change,
          percentage: p.activeUsers.percentage,
        },
        returns: {
          value: p.returns.value,
          change: p.returns.change,
          percentage: p.returns.percentage,
        },
      });
      setChartData({
        ordersBarData: Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          value: Math.floor(Math.random() * 30) + 10,
        })),
        shippingTrend: [
          { day: 1, value: 20 },
          { day: 2, value: 32 },
          { day: 3, value: 28 },
          { day: 4, value: 35 },
          { day: 5, value: 25 },
          { day: 6, value: 30 },
          { day: 7, value: 38 },
        ],
        returnsBarData: Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          value: Math.floor(Math.random() * 30) + 10,
        })),
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [activePlatform]); // only re-creates when activePlatform changes

  // ── Business insights data ────────────────────────────
  const fetchBusinessInsightsData = useCallback(async () => {
    try {
      setBestSellerData({
        name: "Zipper Jacket",
        image:
          "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=300&fit=crop",
        availableStock: 153 - activePlatform * 10,
        sellingPrice: 1599,
        soldUnits: 60 + activePlatform * 5,
        chartData: [
          { day: 1, blue: 45 + activePlatform * 2, red: 8 + activePlatform },
          { day: 2, blue: 55 + activePlatform * 3, red: 12 - activePlatform },
          { day: 3, blue: 65 + activePlatform * 3, red: 10 + activePlatform },
          {
            day: 4,
            blue: 48 + activePlatform * 2,
            red: 15 - activePlatform * 2,
          },
          { day: 5, blue: 52 + activePlatform, red: 9 + activePlatform },
          { day: 6, blue: 70 + activePlatform * 2, red: 11 - activePlatform },
          { day: 7, blue: 58 + activePlatform * 3, red: 13 + activePlatform },
        ],
      });
      setStatisticsData({
        performanceChange:
          activePlatform <= 3
            ? 15 - activePlatform * 3
            : -(10 + activePlatform * 2),
        weeklyData: [
          {
            day: "Monday",
            value1: 28000 - activePlatform * 1000,
            value2: 22000 - activePlatform * 800,
          },
          {
            day: "Tuesday",
            value1: 24000 - activePlatform * 900,
            value2: 20000 - activePlatform * 700,
          },
          {
            day: "Wednesday",
            value1: 12000 - activePlatform * 500,
            value2: 12000 - activePlatform * 400,
          },
          {
            day: "Thursday",
            value1: 8000 - activePlatform * 300,
            value2: 6000 - activePlatform * 200,
          },
          {
            day: "Friday",
            value1: 6000 + activePlatform * 200,
            value2: 8000 + activePlatform * 300,
          },
          {
            day: "Saturday",
            value1: 15000 + activePlatform * 600,
            value2: 18000 + activePlatform * 700,
          },
          {
            day: "Sunday",
            value1: 25000 + activePlatform * 1000,
            value2: 24000 + activePlatform * 900,
          },
        ],
        barData: [
          { value: 25 + activePlatform * 3 },
          { value: 60 + activePlatform * 5 },
          { value: 35 + activePlatform * 2 },
          { value: 100 - activePlatform * 4 },
          { value: 45 + activePlatform * 3 },
          { value: 30 + activePlatform * 2 },
        ],
        piePercentage: 60 - activePlatform * 3,
        returnsChange:
          activePlatform <= 3
            ? -(5 + activePlatform * 2)
            : 10 + activePlatform * 3,
        productThumbnail:
          "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=100&h=100&fit=crop",
      });
    } catch (error) {
      console.error("Error fetching business insights data:", error);
    }
  }, [activePlatform]); // only re-creates when activePlatform changes

  // ── Effects ───────────────────────────────────────────
  useEffect(() => {
    fetchDashboardData();
    fetchBusinessInsightsData();
  }, [activePlatform, fetchDashboardData, fetchBusinessInsightsData]);

  useEffect(() => {
    fetchBusinessInsightsData();
  }, [activeTab, fetchBusinessInsightsData]);

  // ── Helpers ───────────────────────────────────────────
  const getTrendTextColor = (change) => (change >= 0 ? "#00AF55" : "#E51300");
  const getPercentageBgColor = (change) =>
    change >= 0 ? "#00AF551A" : "#E513001A";
  const getChartColor = (change) => (change >= 0 ? "#0040D6" : "#E51300");

  const getTrendArrow = (change) =>
    change >= 0 ? (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M5 1.5L5 8.5M5 1.5L7.5 4M5 1.5L2.5 4"
          stroke="#00AF55"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M5 8.5L5 1.5M5 8.5L7.5 6M5 8.5L2.5 6"
          stroke="#E51300"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

  const getPieChartArrow = (change) =>
    change >= 0 ? (
      <svg
        width="8"
        height="8"
        viewBox="0 0 8 8"
        fill="none"
        style={{ marginLeft: "3px" }}
      >
        <path
          d="M4 1L4 7M4 1L6 3M4 1L2 3"
          stroke="#00AF55"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : (
      <svg
        width="8"
        height="8"
        viewBox="0 0 8 8"
        fill="none"
        style={{ marginLeft: "3px" }}
      >
        <path
          d="M4 7L4 1M4 7L6 5M4 7L2 5"
          stroke="#E51300"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

  if (loading || !metricsData || !chartData) {
    return (
      <main className={styles.pageContent}>
        <div className={styles.pageContainer}>
          <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* TODO: uncomment when catalog check is ready */}
      {/* {showNoCatalogModal && <NoCatalogModal />} */}

      <main className={styles.pageContent}>
        <div className={styles.pageContainer}>
          <section className={styles.dashboardGrid}>
            {/* ================= Platforms ================= */}
            <div className={clsx(styles.card, styles.platforms)}>
              <div className={styles.platformsRow}>
                {platforms.map((platform, index) => (
                  <button
                    key={index}
                    className={clsx(
                      styles.platformBtn,
                      activePlatform === index && styles.active,
                    )}
                    onClick={() => setActivePlatform(index)}
                  >
                    <span className={styles.platformBtnText}>{platform}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.gap29} />

            {/* ================= Metric Cards ================= */}
            <div className={styles.middleRow}>
              {/* Orders */}
              <div
                className={clsx(
                  styles.card,
                  styles.metricCard,
                  styles.ordersCard,
                )}
              >
                <div className={styles.metricHeader}>
                  <div className={clsx(styles.iconBox, styles.ordersIconBox)}>
                    <img
                      src={OrdersIcon}
                      alt="Orders"
                      className={styles.iconImage}
                    />
                  </div>
                  <span className={styles.metricTitle}>Order</span>
                  <button className={styles.menuBtn}>⋮</button>
                </div>
                <div className={styles.headerUnderline} />
                <div className={styles.metricBody}>
                  <div className={styles.metricLeft}>
                    <div className={styles.metricValue}>
                      {metricsData.orders.value} Orders
                    </div>
                    <div className={styles.metricChange}>
                      <div
                        className={styles.percentageContainer}
                        style={{
                          backgroundColor: getPercentageBgColor(
                            metricsData.orders.change,
                          ),
                        }}
                      >
                        {getTrendArrow(metricsData.orders.change)}
                        <span
                          style={{
                            color: getTrendTextColor(metricsData.orders.change),
                          }}
                        >
                          {metricsData.orders.change >= 0 ? "+" : ""}
                          {metricsData.orders.change}%
                        </span>
                      </div>
                      <span className={styles.changeLabel}>
                        Since Last Week
                      </span>
                    </div>
                  </div>
                  <div className={styles.metricChart}>
                    <ResponsiveContainer width="100%" height={60}>
                      <BarChart data={chartData.ordersBarData}>
                        <Bar
                          dataKey="value"
                          fill={getChartColor(metricsData.orders.change)}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div
                className={clsx(
                  styles.card,
                  styles.metricCard,
                  styles.shippingCard,
                )}
              >
                <div className={styles.metricHeader}>
                  <div className={clsx(styles.iconBox, styles.shippingIconBox)}>
                    <img
                      src={ShippingIcon}
                      alt="Shipping"
                      className={styles.iconImage}
                    />
                  </div>
                  <span className={styles.metricTitle}>
                    Shipping Performance
                  </span>
                  <button className={styles.menuBtn}>⋮</button>
                </div>
                <div className={styles.headerUnderline} />
                <div className={styles.metricBody}>
                  <div className={styles.metricLeft}>
                    <div className={styles.metricValue}>
                      {metricsData.shipping.value} Shipped
                    </div>
                    <div className={styles.metricChange}>
                      <div
                        className={styles.percentageContainer}
                        style={{
                          backgroundColor: getPercentageBgColor(
                            metricsData.shipping.change,
                          ),
                        }}
                      >
                        {getTrendArrow(metricsData.shipping.change)}
                        <span
                          style={{
                            color: getTrendTextColor(
                              metricsData.shipping.change,
                            ),
                          }}
                        >
                          {metricsData.shipping.change >= 0 ? "+" : ""}
                          {metricsData.shipping.change}%
                        </span>
                      </div>
                      <span className={styles.changeLabel}>
                        Since Last Week
                      </span>
                    </div>
                  </div>
                  <div className={styles.metricChart}>
                    <ResponsiveContainer width="100%" height={60}>
                      <LineChart data={chartData.shippingTrend}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={getChartColor(metricsData.shipping.change)}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Active Users */}
              <div
                className={clsx(
                  styles.card,
                  styles.metricCard,
                  styles.usersCard,
                )}
              >
                <div className={styles.metricHeader}>
                  <div className={clsx(styles.iconBox, styles.usersIconBox)}>
                    <img
                      src={UsersIcon}
                      alt="Users"
                      className={styles.iconImage}
                    />
                  </div>
                  <span className={styles.metricTitle}>Active Users</span>
                  <button className={styles.menuBtn}>⋮</button>
                </div>
                <div className={styles.headerUnderline} />
                <div className={styles.metricBody}>
                  <div className={styles.metricLeft}>
                    <div className={styles.metricValue}>
                      {metricsData.activeUsers.value} Users
                    </div>
                    <div className={styles.metricChange}>
                      <div
                        className={styles.percentageContainer}
                        style={{
                          backgroundColor: getPercentageBgColor(
                            metricsData.activeUsers.change,
                          ),
                        }}
                      >
                        {getTrendArrow(metricsData.activeUsers.change)}
                        <span
                          style={{
                            color: getTrendTextColor(
                              metricsData.activeUsers.change,
                            ),
                          }}
                        >
                          {metricsData.activeUsers.change >= 0 ? "+" : ""}
                          {metricsData.activeUsers.change}%
                        </span>
                      </div>
                      <span className={styles.changeLabel}>
                        Since Last Week
                      </span>
                    </div>
                  </div>
                  <div className={styles.metricChart}>
                    <div className={styles.pieChartContainer}>
                      <PieChart width={100} height={100}>
                        <Pie
                          data={[
                            { value: metricsData.activeUsers.percentage },
                            { value: 100 - metricsData.activeUsers.percentage },
                          ]}
                          cx={50}
                          cy={50}
                          innerRadius={32}
                          outerRadius={45}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                        >
                          <Cell fill="#0040D6" />
                          <Cell fill="#0040D680" />
                        </Pie>
                      </PieChart>
                      <div className={styles.pieChartText}>
                        {metricsData.activeUsers.percentage}%
                        {getPieChartArrow(metricsData.activeUsers.change)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Returns */}
              <div
                className={clsx(
                  styles.card,
                  styles.metricCard,
                  styles.returnsCard,
                )}
              >
                <div className={styles.metricHeader}>
                  <div className={clsx(styles.iconBox, styles.returnsIconBox)}>
                    <img
                      src={ReturnsIcon}
                      alt="Returns"
                      className={styles.iconImage}
                    />
                  </div>
                  <span className={styles.metricTitle}>Returns</span>
                  <button className={styles.menuBtn}>⋮</button>
                </div>
                <div className={styles.headerUnderline} />
                <div className={styles.metricBody}>
                  <div className={styles.metricLeft}>
                    <div className={styles.metricValue}>
                      {metricsData.returns.value} Returns
                    </div>
                    <div className={styles.metricChange}>
                      <div
                        className={styles.percentageContainer}
                        style={{
                          backgroundColor: getPercentageBgColor(
                            metricsData.returns.change,
                          ),
                        }}
                      >
                        {getTrendArrow(metricsData.returns.change)}
                        <span
                          style={{
                            color: getTrendTextColor(
                              metricsData.returns.change,
                            ),
                          }}
                        >
                          {metricsData.returns.change >= 0 ? "+" : ""}
                          {metricsData.returns.change}%
                        </span>
                      </div>
                      <span className={styles.changeLabel}>
                        Since Last Week
                      </span>
                    </div>
                  </div>
                  <div className={styles.metricChart}>
                    <ResponsiveContainer width="100%" height={60}>
                      <BarChart data={chartData.returnsBarData}>
                        <Bar
                          dataKey="value"
                          fill={getChartColor(metricsData.returns.change)}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.gap32} />

            {/* ================= Business Insights ================= */}
            <div className={clsx(styles.card, styles.businessInsights)}>
              <div className={styles.insightsHeader}>
                <div className={styles.insightsTitle}>
                  <img
                    src={NoteIcon}
                    alt="Business Insights"
                    className={styles.noteIcon}
                  />
                  Business Insights
                </div>
                <button className={styles.menuBtn}>⋮</button>
              </div>

              <div className={styles.insightsTabsWrapper}>
                <div className={styles.insightsTabs}>
                  {insightsTabs.map((tab, index) => (
                    <button
                      key={index}
                      className={clsx(
                        styles.insightsTab,
                        activeTab === index && styles.activeInsightsTab,
                      )}
                      onClick={() => setActiveTab(index)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.insightsContent}>
                {/* Best Seller */}
                <div className={styles.bestSellerSection}>
                  <h3 className={styles.sectionTitle}>Best Seller</h3>
                  {bestSellerData && (
                    <div className={styles.bestSellerContainer}>
                      <div className={styles.productImageSection}>
                        <div className={styles.productImage}>
                          <img
                            src={bestSellerData.image}
                            alt={bestSellerData.name}
                          />
                          <button className={styles.viewMoreBtn}>
                            View More
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <path
                                d="M6 12L10 8L6 4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className={styles.productDetailsSection}>
                        <div className={styles.productDetailsGrid}>
                          <div className={styles.productDetailItem}>
                            <span className={styles.detailLabel}>
                              Since Last Week
                            </span>
                            <span className={styles.detailValue}>
                              {bestSellerData.name}
                            </span>
                          </div>
                          <div className={styles.productDetailItem}>
                            <span className={styles.detailLabel}>
                              Selling Price
                            </span>
                            <span className={styles.detailValue}>
                              ₹{bestSellerData.sellingPrice}
                            </span>
                          </div>
                          <div className={styles.productDetailItem}>
                            <span className={styles.detailLabel}>
                              Available Stock
                            </span>
                            <span className={styles.detailValue}>
                              {bestSellerData.availableStock}
                            </span>
                          </div>
                          <div className={styles.productDetailItem}>
                            <span className={styles.detailLabel}>
                              Sold Units
                            </span>
                            <span className={styles.detailValue}>
                              {bestSellerData.soldUnits}
                            </span>
                          </div>
                        </div>
                        <div className={styles.productBarChart}>
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart
                              data={bestSellerData.chartData}
                              barCategoryGap="5%"
                              barGap={1}
                              margin={{
                                top: 10,
                                right: 10,
                                bottom: 10,
                                left: 10,
                              }}
                            >
                              <Bar
                                dataKey="blue"
                                fill="#0040D6"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="red"
                                fill="#D32F2F"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Statistics */}
                <div className={styles.statisticsSection}>
                  {statisticsData && (
                    <>
                      <div className={styles.statsHeader}>
                        <div className={styles.statsIconBox}>
                          <img
                            src={StatsIcon}
                            alt="Statistics"
                            className={styles.statsIconImage}
                          />
                        </div>
                        <span className={styles.statsTitle}>Statistics</span>
                      </div>
                      <div className={styles.statsChartArea}>
                        <ResponsiveContainer width="100%" height={350}>
                          <LineChart
                            data={statisticsData.weeklyData}
                            margin={{ top: 5, right: 5, bottom: 20, left: 10 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f0f0f0"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="day"
                              stroke="#999"
                              style={{
                                fontSize: "11px",
                                fontFamily: "Inter",
                                fontWeight: 400,
                              }}
                              axisLine={false}
                              tickLine={false}
                              dy={10}
                            />
                            <YAxis
                              stroke="#999"
                              style={{
                                fontSize: "11px",
                                fontFamily: "Inter",
                                fontWeight: 400,
                              }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => `${value / 1000}k`}
                              dx={-5}
                            />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="value1"
                              stroke={
                                statisticsData.performanceChange >= 0
                                  ? "#0040D6"
                                  : "#E51300"
                              }
                              strokeWidth={2}
                              dot={{
                                fill:
                                  statisticsData.performanceChange >= 0
                                    ? "#0040D6"
                                    : "#E51300",
                                r: 5,
                                strokeWidth: 2,
                                stroke: "#fff",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value2"
                              stroke={
                                statisticsData.performanceChange >= 0
                                  ? "#0040D6"
                                  : "#E51300"
                              }
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                        {statisticsData.productThumbnail && (
                          <div className={styles.productThumbnail}>
                            <img
                              src={statisticsData.productThumbnail}
                              alt="Product"
                            />
                          </div>
                        )}
                      </div>
                      <div className={styles.returnsOverlay}>
                        <div className={styles.returnsHeader}>
                          <img
                            src={NoteIcon}
                            alt="Returns"
                            className={styles.returnsIcon}
                          />
                          <span className={styles.returnsTitle}>Returns</span>
                        </div>
                        <div className={styles.returnsContent}>
                          <div className={styles.returnsCharts}>
                            <div className={styles.returnsBarChart}>
                              <ResponsiveContainer width="100%" height={100}>
                                <BarChart data={statisticsData.barData}>
                                  <Bar
                                    dataKey="value"
                                    fill={
                                      statisticsData.returnsChange < 0
                                        ? "#0040D6"
                                        : "#E51300"
                                    }
                                    radius={[4, 4, 0, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <div className={styles.returnsPieChart}>
                              <PieChart width={120} height={120}>
                                <Pie
                                  data={[
                                    { value: statisticsData.piePercentage },
                                    {
                                      value: 100 - statisticsData.piePercentage,
                                    },
                                  ]}
                                  cx={60}
                                  cy={60}
                                  innerRadius={40}
                                  outerRadius={55}
                                  startAngle={90}
                                  endAngle={-270}
                                  dataKey="value"
                                >
                                  <Cell
                                    fill={
                                      statisticsData.returnsChange < 0
                                        ? "#0040D6"
                                        : "#E51300"
                                    }
                                  />
                                  <Cell
                                    fill={
                                      statisticsData.returnsChange < 0
                                        ? "#0040D680"
                                        : "#E513001A"
                                    }
                                  />
                                </Pie>
                                <text
                                  x={60}
                                  y={65}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  className={styles.returnsPieText}
                                >
                                  {statisticsData.piePercentage}%
                                </text>
                              </PieChart>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Homepage;
