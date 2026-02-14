import { useState, useEffect } from "react";
import styles from "../css/pages/Homepage.module.css";
import clsx from "clsx";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Import SVG icons
import OrdersIcon from "../assets/icons/sidebar/orders-active.svg";
import ShippingIcon from "../assets/icons/sidebar/shipping-active.svg";
import UsersIcon from "../assets/icons/users.svg";
import ReturnsIcon from "../assets/icons/returns.svg";
import NoteIcon from "../assets/icons/note.svg";

const Homepage = () => {
  // Platform button labels
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

  // Track which platform is active
  const [activePlatform, setActivePlatform] = useState(0);
  
  // Track which Business Insights tab is active
  const [activeTab, setActiveTab] = useState(0);

  // Business Insights tabs
  const insightsTabs = [
    "All ( 26 )",
    "Top Rated",
    "Best Seller",
    "New Listings",
    "Out Of Stocks"
  ];

  // State for API data
  const [metricsData, setMetricsData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [bestSellerData, setBestSellerData] = useState(null);
  const [statisticsData, setStatisticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend when platform changes
  useEffect(() => {
    fetchDashboardData();
  }, [activePlatform]);

  // Fetch data from backend when tab changes
  useEffect(() => {
    fetchBusinessInsightsData();
  }, [activeTab]);

  // Main data fetching function
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch(`/api/dashboard/metrics?platform=${activePlatform}`);
      // const data = await response.json();
      // setMetricsData(data.metrics);
      // setChartData(data.charts);

      // MOCK DATA - Mixed positive and negative values for testing
      // This demonstrates how the UI adapts to different data scenarios
      const mockDataByPlatform = {
        0: { // All - Mixed results
          orders: { value: 42, change: 12, percentage: 65 },
          shipping: { value: 36, change: -8, percentage: 45 },
          activeUsers: { value: 108, change: 18, percentage: 72 },
          returns: { value: 16, change: -15, percentage: 30 }
        },
        1: { // Flipkart - Mostly positive
          orders: { value: 89, change: 25, percentage: 85 },
          shipping: { value: 72, change: 15, percentage: 68 },
          activeUsers: { value: 287, change: 20, percentage: 78 },
          returns: { value: 31, change: -5, percentage: 42 }
        },
        2: { // Amazon - Mixed
          orders: { value: 112, change: -10, percentage: 38 },
          shipping: { value: 95, change: 8, percentage: 62 },
          activeUsers: { value: 354, change: -12, percentage: 35 },
          returns: { value: 38, change: 22, percentage: 88 }
        },
        3: { // Shopify - Declining
          orders: { value: 45, change: -18, percentage: 28 },
          shipping: { value: 38, change: -22, percentage: 25 },
          activeUsers: { value: 156, change: -8, percentage: 45 },
          returns: { value: 18, change: 15, percentage: 70 }
        },
        4: { // Website - Growing
          orders: { value: 34, change: 32, percentage: 90 },
          shipping: { value: 29, change: 28, percentage: 85 },
          activeUsers: { value: 98, change: 35, percentage: 92 },
          returns: { value: 12, change: -20, percentage: 22 }
        },
        5: { // Meesho - Stable
          orders: { value: 28, change: 5, percentage: 55 },
          shipping: { value: 24, change: -3, percentage: 48 },
          activeUsers: { value: 87, change: 8, percentage: 60 },
          returns: { value: 9, change: -2, percentage: 38 }
        },
        6: { // Myntra - Mixed
          orders: { value: 21, change: -5, percentage: 42 },
          shipping: { value: 17, change: 12, percentage: 68 },
          activeUsers: { value: 65, change: -15, percentage: 32 },
          returns: { value: 8, change: 18, percentage: 75 }
        },
        7: { // Ajio - Declining
          orders: { value: 13, change: -25, percentage: 20 },
          shipping: { value: 11, change: -18, percentage: 28 },
          activeUsers: { value: 42, change: -22, percentage: 25 },
          returns: { value: 8, change: 30, percentage: 95 }
        }
      };

      const currentPlatformData = mockDataByPlatform[activePlatform];

      const mockMetrics = {
        orders: { 
          value: currentPlatformData.orders.value, 
          change: currentPlatformData.orders.change,
          percentage: currentPlatformData.orders.percentage
        },
        shipping: { 
          value: currentPlatformData.shipping.value, 
          change: currentPlatformData.shipping.change,
          percentage: currentPlatformData.shipping.percentage
        },
        activeUsers: { 
          value: currentPlatformData.activeUsers.value, 
          change: currentPlatformData.activeUsers.change,
          percentage: currentPlatformData.activeUsers.percentage
        },
        returns: { 
          value: currentPlatformData.returns.value, 
          change: currentPlatformData.returns.change,
          percentage: currentPlatformData.returns.percentage
        }
      };

      const mockCharts = {
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
        }))
      };

      setMetricsData(mockMetrics);
      setChartData(mockCharts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Business Insights data
  const fetchBusinessInsightsData = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch(`/api/business-insights?tab=${activeTab}&platform=${activePlatform}`);
      // const data = await response.json();
      // setBestSellerData(data.bestSeller);
      // setStatisticsData(data.statistics);

      // MOCK DATA - Remove when backend is ready
      const mockBestSeller = {
        name: "Zipper Jacket",
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=300&fit=crop",
        sinceLastWeek: "Since Last Week",
        availableStock: 153,
        sellingPrice: 1599,
        soldUnits: 60,
        chartData: [
          { day: 1, blue: 45, red: 0 },
          { day: 2, blue: 0, red: 38 },
          { day: 3, blue: 65, red: 0 },
          { day: 4, blue: 0, red: 28 },
          { day: 5, blue: 52, red: 0 },
          { day: 6, blue: 70, red: 0 },
          { day: 7, blue: 58, red: 0 },
        ]
      };

      const mockStatistics = {
        weeklyData: [
          { day: 'Monday', value1: 28000, value2: 22000 },
          { day: 'Tuesday', value1: 24000, value2: 20000 },
          { day: 'Wednesday', value1: 12000, value2: 12000 },
          { day: 'Thursday', value1: 8000, value2: 6000 },
          { day: 'Friday', value1: 6000, value2: 8000 },
          { day: 'Saturday', value1: 15000, value2: 18000 },
          { day: 'Sunday', value1: 25000, value2: 24000 },
        ],
        barData: [
          { value: 25 },
          { value: 60 },
          { value: 35 },
          { value: 100 },
          { value: 45 },
          { value: 30 },
        ],
        piePercentage: 60,
        productThumbnail: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=100&h=100&fit=crop"
      };

      setBestSellerData(mockBestSeller);
      setStatisticsData(mockStatistics);
    } catch (error) {
      console.error('Error fetching business insights data:', error);
    }
  };

  // Helper function to get text color based on trend
  const getTrendTextColor = (change) => {
    return change >= 0 ? '#00AF55' : '#E51300';
  };

  // Helper function to get background color for percentage container
  const getPercentageBgColor = (change) => {
    return change >= 0 ? '#00AF551A' : '#E513001A';
  };

  // Helper function to get chart color (blue for positive, red for negative)
  const getChartColor = (change) => {
    return change >= 0 ? '#0040D6' : '#E51300';
  };

  // Helper function to get arrow SVG based on trend (for percentage container)
  const getTrendArrow = (change) => {
    if (change >= 0) {
      return (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1.5L5 8.5M5 1.5L7.5 4M5 1.5L2.5 4" stroke="#00AF55" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else {
      return (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 8.5L5 1.5M5 8.5L7.5 6M5 8.5L2.5 6" stroke="#E51300" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
  };

  // Helper function to get small arrow for pie chart
  const getPieChartArrow = (change) => {
    if (change >= 0) {
      return (
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ marginLeft: '3px' }}>
          <path d="M4 1L4 7M4 1L6 3M4 1L2 3" stroke="#00AF55" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else {
      return (
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ marginLeft: '3px' }}>
          <path d="M4 7L4 1M4 7L6 5M4 7L2 5" stroke="#E51300" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
  };

  // Show loading state
  if (loading || !metricsData || !chartData) {
    return (
      <main className={styles.pageContent}>
        <div className={styles.pageContainer}>
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.pageContent}>
      <div className={styles.pageContainer}>
        <section className={styles.dashboardGrid}>
          
          {/* ================= Platforms Section ================= */}
          <div className={clsx(styles.card, styles.platforms)}>
            <div className={styles.platformsRow}>
              {platforms.map((platform, index) => (
                <button
                  key={index}
                  className={clsx(
                    styles.platformBtn,
                    activePlatform === index && styles.active
                  )}
                  onClick={() => setActivePlatform(index)}
                >
                  <span className={styles.platformBtnText}>
                    {platform}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.gap29} />

          {/* ================= Middle Row - Metric Cards ================= */}
          <div className={styles.middleRow}>

            {/* Orders Card */}
            <div className={clsx(styles.card, styles.metricCard, styles.ordersCard)}>
              <div className={styles.metricHeader}>
                <div className={styles.iconBox} style={{ background: '#0040D6' }}>
                  <img src={OrdersIcon} alt="Orders" className={styles.iconImage} />
                </div>
                <span className={styles.metricTitle}>Order</span>
                <button className={styles.menuBtn}>⋮</button>
              </div>
              <div className={styles.headerUnderline}></div>
              
              <div className={styles.metricBody}>
                <div className={styles.metricLeft}>
                  <div className={styles.metricValue}>{metricsData.orders.value} Orders</div>
                  <div className={styles.metricChange}>
                    <div 
                      className={styles.percentageContainer}
                      style={{ backgroundColor: getPercentageBgColor(metricsData.orders.change) }}
                    >
                      {getTrendArrow(metricsData.orders.change)}
                      <span style={{ color: getTrendTextColor(metricsData.orders.change) }}>
                        {metricsData.orders.change >= 0 ? '+' : ''}{metricsData.orders.change}%
                      </span>
                    </div>
                    <span className={styles.changeLabel}>Since Last Week</span>
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

            {/* Shipping Performance Card */}
            <div className={clsx(styles.card, styles.metricCard, styles.shippingCard)}>
              <div className={styles.metricHeader}>
                <div className={styles.iconBox} style={{ background: '#D32F2F' }}>
                  <img src={ShippingIcon} alt="Shipping" className={styles.iconImage} />
                </div>
                <span className={styles.metricTitle}>Shipping Performance</span>
                <button className={styles.menuBtn}>⋮</button>
              </div>
              <div className={styles.headerUnderline}></div>
              
              <div className={styles.metricBody}>
                <div className={styles.metricLeft}>
                  <div className={styles.metricValue}>{metricsData.shipping.value} Shipped</div>
                  <div className={styles.metricChange}>
                    <div 
                      className={styles.percentageContainer}
                      style={{ backgroundColor: getPercentageBgColor(metricsData.shipping.change) }}
                    >
                      {getTrendArrow(metricsData.shipping.change)}
                      <span style={{ color: getTrendTextColor(metricsData.shipping.change) }}>
                        {metricsData.shipping.change >= 0 ? '+' : ''}{metricsData.shipping.change}%
                      </span>
                    </div>
                    <span className={styles.changeLabel}>Since Last Week</span>
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

            {/* Active Users Card */}
            <div className={clsx(styles.card, styles.metricCard, styles.usersCard)}>
              <div className={styles.metricHeader}>
                <div className={styles.iconBox} style={{ background: '#0040D6' }}>
                  <img src={UsersIcon} alt="Users" className={styles.iconImage} />
                </div>
                <span className={styles.metricTitle}>Active Users</span>
                <button className={styles.menuBtn}>⋮</button>
              </div>
              <div className={styles.headerUnderline}></div>
              
              <div className={styles.metricBody}>
                <div className={styles.metricLeft}>
                  <div className={styles.metricValue}>{metricsData.activeUsers.value} Users</div>
                  <div className={styles.metricChange}>
                    <div 
                      className={styles.percentageContainer}
                      style={{ backgroundColor: getPercentageBgColor(metricsData.activeUsers.change) }}
                    >
                      {getTrendArrow(metricsData.activeUsers.change)}
                      <span style={{ color: getTrendTextColor(metricsData.activeUsers.change) }}>
                        {metricsData.activeUsers.change >= 0 ? '+' : ''}{metricsData.activeUsers.change}%
                      </span>
                    </div>
                    <span className={styles.changeLabel}>Since Last Week</span>
                  </div>
                </div>
                <div className={styles.metricChart}>
                  <div style={{ position: 'relative' }}>
                    <PieChart width={100} height={100}>
                      <Pie
                        data={[
                          { value: metricsData.activeUsers.percentage }, 
                          { value: 100 - metricsData.activeUsers.percentage }
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

            {/* Returns Card */}
            <div className={clsx(styles.card, styles.metricCard, styles.returnsCard)}>
              <div className={styles.metricHeader}>
                <div className={styles.iconBox} style={{ background: '#D32F2F' }}>
                  <img src={ReturnsIcon} alt="Returns" className={styles.iconImage} />
                </div>
                <span className={styles.metricTitle}>Returns</span>
                <button className={styles.menuBtn}>⋮</button>
              </div>
              <div className={styles.headerUnderline}></div>
              
              <div className={styles.metricBody}>
                <div className={styles.metricLeft}>
                  <div className={styles.metricValue}>{metricsData.returns.value} Returns</div>
                  <div className={styles.metricChange}>
                    <div 
                      className={styles.percentageContainer}
                      style={{ backgroundColor: getPercentageBgColor(metricsData.returns.change) }}
                    >
                      {getTrendArrow(metricsData.returns.change)}
                      <span style={{ color: getTrendTextColor(metricsData.returns.change) }}>
                        {metricsData.returns.change >= 0 ? '+' : ''}{metricsData.returns.change}%
                      </span>
                    </div>
                    <span className={styles.changeLabel}>Since Last Week</span>
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

          {/* ================= Business Insights Section ================= */}
          <div className={clsx(styles.card, styles.businessInsights)}>
            <div className={styles.insightsHeader}>
              <div className={styles.insightsTitle}>
                <img src={NoteIcon} alt="Business Insights" style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                Business Insights
              </div>
              <button className={styles.menuBtn}>⋮</button>
            </div>

            <div className={styles.insightsTabs}>
              {insightsTabs.map((tab, index) => (
                <button
                  key={index}
                  className={clsx(
                    styles.insightsTab,
                    activeTab === index && styles.activeInsightsTab
                  )}
                  onClick={() => setActiveTab(index)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className={styles.insightsContent}>
              
              {/* Left Section - Best Seller */}
              <div className={styles.bestSellerSection}>
                <h3 className={styles.sectionTitle}>Best Seller</h3>
                
                {bestSellerData && (
                  <>
                    <div className={styles.productCard}>
                      <div className={styles.productImage}>
                        <img src={bestSellerData.image} alt={bestSellerData.name} />
                        <button className={styles.viewMoreBtn}>
                          View More
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                      
                      <div className={styles.productInfo}>
                        <div className={styles.productDetail}>
                          <span className={styles.detailLabel}>Since Last Week</span>
                          <span className={styles.detailValue}>{bestSellerData.name}</span>
                        </div>
                        <div className={styles.productDetail}>
                          <span className={styles.detailLabel}>Available Stock</span>
                          <span className={styles.detailValue}>{bestSellerData.availableStock}</span>
                        </div>
                      </div>
                      
                      <div className={styles.productInfo}>
                        <div className={styles.productDetail}>
                          <span className={styles.detailLabel}>Selling Price</span>
                          <span className={styles.detailValue}>₹{bestSellerData.sellingPrice}</span>
                        </div>
                        <div className={styles.productDetail}>
                          <span className={styles.detailLabel}>Sold Units</span>
                          <span className={styles.detailValue}>{bestSellerData.soldUnits}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.productBarChart}>
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={bestSellerData.chartData}>
                          <Bar dataKey="blue" fill="#0040D6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="red" fill="#D32F2F" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </div>

              {/* Right Section - Statistics */}
              <div className={styles.statisticsSection}>
                {statisticsData && (
                  <>
                    <div className={styles.statsHeader}>
                      <div className={styles.statsIconBox}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M2 2V18H18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M6 14L10 10L14 14L18 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className={styles.statsTitle}>Statistics</span>
                      <button className={styles.menuBtn} style={{ marginLeft: 'auto' }}>⋮</button>
                      <span className={styles.returnsLabel}>Returns</span>
                    </div>

                    <div className={styles.statsChartArea}>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={statisticsData.weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                          <XAxis 
                            dataKey="day" 
                            stroke="#999" 
                            style={{ fontSize: '11px' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#999" 
                            style={{ fontSize: '11px' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${value / 1000}k`}
                          />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="value1" 
                            stroke="#0040D6" 
                            strokeWidth={2}
                            dot={{ fill: '#0040D6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value2" 
                            stroke="#D32F2F" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>

                      {/* Overlays */}
                      <div className={styles.statsOverlays}>
                        <div className={styles.statsBarOverlay}>
                          <ResponsiveContainer width={60} height={100}>
                            <BarChart data={statisticsData.barData}>
                              <Bar dataKey="value" fill="#E3E8FF" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="value" fill="#0040D6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className={styles.statsPieOverlay}>
                          <PieChart width={100} height={100}>
                            <Pie
                              data={[{ value: statisticsData.piePercentage }, { value: 100 - statisticsData.piePercentage }]}
                              cx={50}
                              cy={50}
                              innerRadius={30}
                              outerRadius={45}
                              startAngle={90}
                              endAngle={-270}
                              dataKey="value"
                            >
                              <Cell fill="#D32F2F" />
                              <Cell fill="#FFE3E3" />
                            </Pie>
                            <text x={50} y={55} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '16px', fontWeight: '600' }}>
                              {statisticsData.piePercentage}%
                            </text>
                          </PieChart>
                        </div>

                        {/* Product thumbnail */}
                        {statisticsData.productThumbnail && (
                          <div className={styles.productThumbnail}>
                            <img src={statisticsData.productThumbnail} alt="Product" />
                          </div>
                        )}
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
  );
};

export default Homepage;