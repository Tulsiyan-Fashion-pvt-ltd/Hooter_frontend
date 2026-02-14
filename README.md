# E-Commerce Dashboard - Complete Documentation

## Overview
This is a multi-platform e-commerce dashboard with dynamic data visualization, platform filtering, and business insights. The dashboard is fully prepared for backend integration with mock data currently in place.

---

## 🎨 Features

### 1. Platform Filtering
- 8 platform buttons with active state indicator
- Platforms: All, Flipkart, Amazon, Shopify, Website, Meesho, Myntra, Ajio
- Clicking a platform automatically fetches and displays platform-specific data

### 2. Metric Cards (4 cards)
- **Orders Card**
  - Icon: `src\assets\icons\sidebar\orders-active.svg`
  - Shows total orders count
  - Bar chart visualization
  
- **Shipping Performance Card**
  - Icon: `src\assets\icons\sidebar\shipping-active.svg`
  - Shows items in transit
  - Line chart visualization
  
- **Active Users Card**
  - Icon: `src\assets\icons\users.svg`
  - Shows active user count
  - Donut/pie chart with percentage
  
- **Returns Card**
  - Icon: `src\assets\icons\returns.svg`
  - Shows returned items count
  - Bar chart visualization

### 3. Dynamic Color System
All metrics have **automatic color coding** based on trend:
- **Positive trends (+)**: Green (#00C853)
- **Negative trends (-)**: Red (#D32F2F)

This applies to:
- Percentage change text
- Arrow indicators (up/down)
- Chart colors (bars, lines, pie charts)
- Background colors for pie chart segments

### 4. Metric Card Features
- Icon with colored background box
- Metric title
- Menu button (⋮)
- **Underline below header**
- Main value display
- Percentage change with dynamic color
- "Since Last Week" label
- Mini chart visualization

### 5. Business Insights Section
- Tabbed navigation (All, Top Rated, Best Seller, New Listings, Out Of Stocks)
- **Best Seller** section with:
  - Product image
  - Product details (stock, price, units sold)
  - Bar chart for sales data
  
- **Statistics** section with:
  - Weekly performance line chart
  - Overlaid mini bar chart
  - Overlaid donut chart
  - Product thumbnail overlay

---

## 📁 File Structure

```
src/
├── components/
│   └── pages/
│       └── Homepage.jsx          # Main dashboard component
├── css/
│   └── pages/
│       └── Homepage.module.css   # Dashboard styles
└── assets/
    └── icons/
        ├── sidebar/
        │   ├── orders-active.svg
        │   └── shipping-active.svg
        ├── users.svg
        └── returns.svg
```

---

## 🔧 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Install Dependencies
```bash
npm install recharts clsx
```
or
```bash
yarn add recharts clsx
```

### Required Libraries
- `recharts` - For charts and data visualization
- `clsx` - For conditional CSS classes

---

## 🚀 Current Setup (Mock Data)

The dashboard currently runs with **mock data** that demonstrates all functionality:

### How It Works Now:
1. `fetchDashboardData()` is called when platform changes
2. `fetchBusinessInsightsData()` is called when tab changes
3. Mock data is loaded into state variables
4. UI updates automatically based on state

### Mock Data Structure:

**Metrics Data:**
```javascript
{
  orders: { value: 42, change: 12, trend: "up" },
  shipping: { value: 36, change: -12, trend: "down" },
  activeUsers: { value: 108, change: 12, trend: "up", percentage: 60 },
  returns: { value: 16, change: -8, trend: "down" }
}
```

**Chart Data:**
```javascript
{
  ordersBarData: [{ day: 1, value: 25 }, ...],
  shippingTrend: [{ day: 1, value: 20 }, ...],
  returnsBarData: [{ day: 1, value: 15 }, ...]
}
```

---

## 🔌 Backend Integration Guide

### Step 1: Create Backend API Endpoints

You need to create **2 main endpoints**:

#### Endpoint 1: Dashboard Metrics
**URL:** `GET /api/dashboard/metrics?platform={platformId}`

**Response Format:**
```json
{
  "metrics": {
    "orders": {
      "value": 42,
      "change": 12,
      "trend": "up"
    },
    "shipping": {
      "value": 36,
      "change": -12,
      "trend": "down"
    },
    "activeUsers": {
      "value": 108,
      "change": 12,
      "trend": "up",
      "percentage": 60
    },
    "returns": {
      "value": 16,
      "change": -8,
      "trend": "down"
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

#### Endpoint 2: Business Insights
**URL:** `GET /api/business-insights?tab={tabId}&platform={platformId}`

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

### Step 2: Configure Environment Variables

Create a `.env` file in your project root:

```env
REACT_APP_API_URL=http://localhost:3001
```

For production:
```env
REACT_APP_API_URL=https://api.yourproduction.com
```

### Step 3: Update Homepage.jsx

#### In `fetchDashboardData()` function:

**Find this section (around line 62):**
```javascript
// TODO: Replace with actual API endpoint
// const response = await fetch(`/api/dashboard/metrics?platform=${activePlatform}`);
// const data = await response.json();
// setMetricsData(data.metrics);
// setChartData(data.charts);

// MOCK DATA - Remove when backend is ready
const mockMetrics = { ... };
const mockCharts = { ... };

setMetricsData(mockMetrics);
setChartData(mockCharts);
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

#### In `fetchBusinessInsightsData()` function:

**Find this section (around line 99):**
```javascript
// TODO: Replace with actual API endpoint
// const response = await fetch(`/api/business-insights?tab=${activeTab}&platform=${activePlatform}`);
// const data = await response.json();
// setBestSellerData(data.bestSeller);
// setStatisticsData(data.statistics);

// MOCK DATA - Remove when backend is ready
const mockBestSeller = { ... };
const mockStatistics = { ... };

setBestSellerData(mockBestSeller);
setStatisticsData(mockStatistics);
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

### Step 4: Remove Mock Data

After implementing the API calls, **delete** all the mock data objects:
- `mockMetrics`
- `mockCharts`
- `mockBestSeller`
- `mockStatistics`

### Step 5: Test the Integration

1. Start your backend server
2. Start your React app: `npm start`
3. Test platform switching - should trigger API calls
4. Test tab switching - should trigger API calls
5. Check browser Network tab to verify API calls
6. Check console for any errors

---

## 📊 Platform & Tab IDs

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

## 🎨 Color Scheme

### Primary Colors
- **Blue**: `#0040D6` (Primary brand color, positive trends)
- **Red**: `#D32F2F` (Negative trends, alerts)
- **Green**: `#00C853` (Positive changes)

### Background Colors
- **Page Background**: `#FAFAFA`
- **Card Background**: `#FFFFFF`

### Chart Colors
- **Blue Bars/Lines**: `#0040D6`
- **Red Bars/Lines**: `#D32F2F`
- **Light Blue**: `#E3E8FF` (backgrounds)
- **Light Red**: `#FFE3E3` (backgrounds)

---

## 🔄 Data Flow

```
User clicks platform button
         ↓
activePlatform state updates
         ↓
useEffect triggers
         ↓
fetchDashboardData() called
         ↓
API call to /api/dashboard/metrics?platform={id}
         ↓
Response data → state (metricsData, chartData)
         ↓
UI re-renders with new data
         ↓
Dynamic colors apply based on trend values
```

---

## 🐛 Troubleshooting

### Issue: Icons not showing
**Solution:** Verify SVG file paths are correct:
- `src\assets\icons\sidebar\orders-active.svg`
- `src\assets\icons\sidebar\shipping-active.svg`
- `src\assets\icons\users.svg`
- `src\assets\icons\returns.svg`

### Issue: Charts not rendering
**Solution:** 
1. Verify `recharts` is installed: `npm list recharts`
2. Check data format matches expected structure
3. Open browser console for errors

### Issue: Colors not changing dynamically
**Solution:**
1. Verify `change` values in API response are numbers (not strings)
2. Check that `getTrendColor()` function is working
3. Verify CSS is loading correctly

### Issue: API calls not triggering
**Solution:**
1. Check `.env` file exists and has correct URL
2. Verify environment variable: `console.log(process.env.REACT_APP_API_URL)`
3. Restart development server after changing `.env`
4. Check browser Network tab for failed requests

### Issue: CORS errors
**Solution:** Configure CORS on your backend to allow requests from your React app origin

---

## 📝 Important Notes

1. **Dynamic Color System**: Colors automatically change based on whether the `change` value is positive or negative. No manual configuration needed.

2. **Pie Chart Updates**: The Active Users pie chart now dynamically updates based on the `percentage` value from the API.

3. **Loading States**: A loading indicator appears while data is being fetched.

4. **Error Handling**: Basic error handling is implemented. Consider adding user-facing error messages.

5. **Underlines**: All metric cards have a subtle underline below the header for visual separation.

6. **Mock Data**: Current implementation uses mock data for demonstration. This will be replaced with real API calls.

---

## 🚀 Next Steps

1. Set up your backend API endpoints
2. Configure environment variables
3. Replace mock data with API calls
4. Test thoroughly with different platforms and tabs
5. Add additional error handling if needed
6. Optimize performance if needed
7. Add loading skeletons for better UX (optional)

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify API response format matches expected structure
3. Check Network tab for failed requests
4. Ensure all dependencies are installed
5. Restart development server

---

## ✅ Checklist for Backend Integration

- [ ] Backend API endpoints created
- [ ] `.env` file configured
- [ ] Mock data commented out in `fetchDashboardData()`
- [ ] Mock data commented out in `fetchBusinessInsightsData()`
- [ ] API calls implemented and tested
- [ ] CORS configured on backend
- [ ] Error handling verified
- [ ] All platforms tested
- [ ] All tabs tested
- [ ] Dynamic colors working correctly
- [ ] Charts rendering properly
- [ ] Icons displaying correctly

---

**Last Updated:** February 2026
**Version:** 1.0.0