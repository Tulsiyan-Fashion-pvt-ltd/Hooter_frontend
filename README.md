# E-Commerce Dashboard - Backend Implementation Guide

## 📋 Overview
This dashboard displays multi-platform e-commerce metrics with dynamic data visualization. All data is pulled from backend APIs for real-time updates.

---

## 🎯 Quick Start for Backend Integration

### Step 1: Install Dependencies
```bash
npm install recharts clsx
```

### Step 2: Set Up Environment Variables
Create a `.env` file in your project root:
```env
REACT_APP_API_URL=http://localhost:3001
```

For production:
```env
REACT_APP_API_URL=https://api.yourproduction.com
```

### Step 3: Enable Backend API Calls
Open `Homepage.jsx` and look for these two functions:

#### Function 1: `fetchDashboardData()` (around line 60)
**Find this:**
```javascript
// TODO: Replace with actual API endpoint
// const response = await fetch(`/api/dashboard/metrics?platform=${activePlatform}`);
// const data = await response.json();
// setMetricsData(data.metrics);
// setChartData(data.charts);
```

**Replace with:**
```javascript
const response = await fetch(
  `${process.env.REACT_APP_API_URL}/api/dashboard/metrics?platform=${activePlatform}`
);
const data = await response.json();
setMetricsData(data.metrics);
setChartData(data.charts);
```

**Then delete** all the mock data below it (`mockMetrics`, `mockCharts`)

#### Function 2: `fetchBusinessInsightsData()` (around line 100)
**Find this:**
```javascript
// TODO: Replace with actual API endpoint
// const response = await fetch(`/api/business-insights?tab=${activeTab}&platform=${activePlatform}`);
// const data = await response.json();
// setBestSellerData(data.bestSeller);
// setStatisticsData(data.statistics);
```

**Replace with:**
```javascript
const response = await fetch(
  `${process.env.REACT_APP_API_URL}/api/business-insights?tab=${activeTab}&platform=${activePlatform}`
);
const data = await response.json();
setBestSellerData(data.bestSeller);
setStatisticsData(data.statistics);
```

**Then delete** all the mock data below it (`mockBestSeller`, `mockStatistics`)

---

## 🔌 Required API Endpoints

### Endpoint 1: Dashboard Metrics
**GET** `/api/dashboard/metrics?platform={platformId}`

Returns metrics for the 4 cards in the middle row and their chart data.

**Response Format:**
```json
{
  "metrics": {
    "orders": {
      "value": 42,
      "change": 12,
      "percentage": 65
    },
    "shipping": {
      "value": 36,
      "change": -8,
      "percentage": 45
    },
    "activeUsers": {
      "value": 108,
      "change": 18,
      "percentage": 72
    },
    "returns": {
      "value": 16,
      "change": -15,
      "percentage": 30
    }
  },
  "charts": {
    "ordersBarData": [
      { "day": 1, "value": 25 },
      { "day": 2, "value": 30 },
      { "day": 3, "value": 28 },
      { "day": 4, "value": 35 },
      { "day": 5, "value": 32 },
      { "day": 6, "value": 40 },
      { "day": 7, "value": 38 }
    ],
    "shippingTrend": [
      { "day": 1, "value": 20 },
      { "day": 2, "value": 32 },
      { "day": 3, "value": 28 },
      { "day": 4, "value": 35 },
      { "day": 5, "value": 25 },
      { "day": 6, "value": 30 },
      { "day": 7, "value": 38 }
    ],
    "returnsBarData": [
      { "day": 1, "value": 15 },
      { "day": 2, "value": 18 },
      { "day": 3, "value": 12 },
      { "day": 4, "value": 20 },
      { "day": 5, "value": 16 },
      { "day": 6, "value": 22 },
      { "day": 7, "value": 19 }
    ]
  }
}
```

**Field Descriptions:**
- `value`: Main metric number displayed
- `change`: Percentage change (positive or negative number)
- `percentage`: Percentage value for pie chart (0-100)
- Chart data: 7 days of data for each metric's visualization

---

### Endpoint 2: Business Insights
**GET** `/api/business-insights?tab={tabId}&platform={platformId}`

Returns best seller product details and statistics chart data.

**Response Format:**
```json
{
  "bestSeller": {
    "name": "Zipper Jacket",
    "image": "https://example.com/product.jpg",
    "availableStock": 153,
    "sellingPrice": 1599,
    "soldUnits": 60,
    "chartData": [
      { "day": 1, "blue": 45, "red": 0 },
      { "day": 2, "blue": 0, "red": 38 },
      { "day": 3, "blue": 65, "red": 0 },
      { "day": 4, "blue": 0, "red": 28 },
      { "day": 5, "blue": 52, "red": 0 },
      { "day": 6, "blue": 70, "red": 0 },
      { "day": 7, "blue": 58, "red": 0 }
    ]
  },
  "statistics": {
    "weeklyData": [
      { "day": "Monday", "value1": 28000, "value2": 22000 },
      { "day": "Tuesday", "value1": 24000, "value2": 20000 },
      { "day": "Wednesday", "value1": 12000, "value2": 12000 },
      { "day": "Thursday", "value1": 8000, "value2": 6000 },
      { "day": "Friday", "value1": 6000, "value2": 8000 },
      { "day": "Saturday", "value1": 15000, "value2": 18000 },
      { "day": "Sunday", "value1": 25000, "value2": 24000 }
    ],
    "barData": [
      { "value": 25 },
      { "value": 60 },
      { "value": 35 },
      { "value": 100 },
      { "value": 45 },
      { "value": 30 }
    ],
    "piePercentage": 60,
    "productThumbnail": "https://example.com/thumbnail.jpg"
  }
}
```

**Field Descriptions:**
- `sellingPrice`: Price in Rupees (₹)
- `chartData`: Blue/red bar chart data (use "blue" or "red" keys)
- `weeklyData`: Two line chart series (blue and red lines)
- `barData`: Small bar chart overlay data
- `piePercentage`: Returns donut chart percentage (0-100)

---

## 🔢 Platform & Tab ID Reference

### Platform IDs
```javascript
0 = "Lets Check All"
1 = "Lets Check Flipkart"
2 = "Lets Check Amazon"
3 = "Lets Check Shopify"
4 = "Lets Check Website"
5 = "Lets Check Meesho"
6 = "Lets Check Myntra"
7 = "Lets Check Ajio"
```

### Tab IDs (Business Insights)
```javascript
0 = "All ( 26 )"
1 = "Top Rated"
2 = "Best Seller"
3 = "New Listings"
4 = "Out Of Stocks"
```

---

## 🎨 How The Dashboard Works

### Automatic Data Fetching
The dashboard automatically fetches data when:
1. **Platform button is clicked** → Triggers `fetchDashboardData()` and `fetchBusinessInsightsData()`
2. **Tab is clicked** → Triggers `fetchBusinessInsightsData()`

### Dynamic Color Coding
All metrics have **automatic color coding**:
- **Positive changes (+)**: Green text, blue charts
- **Negative changes (-)**: Red text, red charts

This applies to:
- Percentage containers (green/red background)
- Arrow indicators (up/down)
- Chart colors (bars, lines, pie charts)

### What Updates Automatically
When new data arrives from the API:
- All 4 metric cards (Orders, Shipping, Users, Returns)
- All metric values and percentages
- All mini charts (bars, lines, pie)
- Best Seller product info
- Statistics line chart
- Returns overlay charts

---

## 📁 Required SVG Icon Paths

Make sure these SVG files exist at these paths:
```
src/assets/icons/sidebar/orders-active.svg
src/assets/icons/sidebar/shipping-active.svg
src/assets/icons/sidebar/stats-active.svg
src/assets/icons/users.svg
src/assets/icons/returns.svg
src/assets/icons/note.svg
```

---

## ✅ Backend Integration Checklist

Before going live:
- [ ] Create both API endpoints
- [ ] Set up environment variables (.env file)
- [ ] Uncomment API calls in `fetchDashboardData()`
- [ ] Uncomment API calls in `fetchBusinessInsightsData()`
- [ ] Delete all mock data objects
- [ ] Configure CORS on backend
- [ ] Test all 8 platform switches
- [ ] Test all 5 tab switches
- [ ] Verify color changes work (positive/negative)
- [ ] Test with real product images
- [ ] Verify all charts render correctly

---

## 🐛 Common Issues & Solutions

### Issue: Colors not changing
**Solution:** Ensure `change` values are **numbers**, not strings
```javascript
// ✅ Correct
"change": 12

// ❌ Wrong
"change": "12"
```

### Issue: Pie chart stuck at same value
**Solution:** Return dynamic `percentage` value (0-100) from API

### Issue: Charts not rendering
**Solution:** 
1. Check data format matches examples exactly
2. Verify `recharts` is installed
3. Check browser console for errors

### Issue: CORS errors
**Solution:** Configure your backend to allow requests from React app origin
```javascript
// Express.js example
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

### Issue: Environment variable not working
**Solution:**
1. Restart development server after changing `.env`
2. Verify with: `console.log(process.env.REACT_APP_API_URL)`
3. Make sure variable starts with `REACT_APP_`

---

## 🎯 Testing Your Backend

### Test with Mock Platforms
Try switching between platforms and verify:
- Different data loads for each platform
- Positive/negative changes update colors
- Charts update with new data
- No console errors

### Test with Mock Tabs
Click each Business Insights tab and verify:
- Best seller data updates
- Statistics chart updates
- Product images load correctly

### API Response Time
- Dashboard should load within 2 seconds
- Add loading states if backend is slow
- Consider caching frequently accessed data

---

## 🚀 Production Deployment

1. Update `.env.production` with production API URL
2. Build the app: `npm run build`
3. Ensure backend CORS allows production domain
4. Test all features in production environment
5. Monitor API response times
6. Set up error logging

---

## 📝 Notes

- **Currency**: All prices display in Rupees (₹)
- **Font**: All text uses Inter font with 400 weight
- **Data Refresh**: Data refreshes on platform/tab change only (not automatic polling)
- **Charts**: Uses Recharts library - all chart data must match format exactly

---

## 💡 Optional Enhancements

Consider adding these features:
- Loading skeletons during data fetch
- Error boundaries for failed API calls
- Retry mechanism for network failures
- Real-time updates with WebSocket
- Data caching to reduce API calls
- Export functionality for reports

---

**Version:** 2.0.0  
**Last Updated:** February 2026

For questions or issues, check the troubleshooting section or review the inline TODO comments in the code.