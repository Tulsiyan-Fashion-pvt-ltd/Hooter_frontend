import { useState, useMemo } from "react";
import styles from "../css/pages/Orders.module.css";
import searchIcon from "../assets/icons/search.svg";

// ─── Initial 26 Orders Data matching UI screenshots ────────────────────────
const INITIAL_ORDERS = [
  {
    id: "ORD-88433",
    customer: { name: "Neha Gupta", initials: "NG", bg: "#059669" },
    channel: "Meesho",
    channelColor: "#9333EA",
    itemsSummary: "Maroon puffer jacket +1 more · Qty 4",
    amount: "₹8,396",
    priority: "Standard",
    status: "Processing",
    sla: "On track",
    placedOn: "21 Oct, 06:49 am",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "24 Oct, 06:40 pm",
    courierAwb: "Ekart · EK3722685",
    timelineStage: 1, // 1: Order placed, 2: Confirmed, 3: Shipped, 4: Delivered
    items: [
      {
        name: "Maroon puffer jacket",
        sku: "JKT-4410",
        qty: 2,
        price: "₹6,598",
        color: "#6B1D2F",
      },
      {
        name: "Beige palazzo pants",
        sku: "PLZ-2290",
        qty: 2,
        price: "₹1,798",
        color: "#D8C4B4",
      },
    ],
    address: {
      name: "Neha Gupta",
      line1: "14, Green Park Extension",
      line2: "New Delhi, Delhi 110016",
      phone: "+91 98923 XX14",
    },
  },
  {
    id: "ORD-88454",
    customer: { name: "Karan Malhotra", initials: "KM", bg: "#D97706" },
    channel: "Meesho",
    channelColor: "#9333EA",
    itemsSummary: "Maroon puffer jacket +1 more · Qty 3",
    amount: "₹7,597",
    priority: "Standard",
    status: "Shipped",
    sla: "Needs attention",
    placedOn: "20 Oct, 03:15 pm",
    deliveryType: "Standard",
    paymentMode: "COD",
    expectedDelivery: "23 Oct, 08:00 pm",
    courierAwb: "Delhivery · DL9928172",
    timelineStage: 3,
    items: [
      {
        name: "Maroon puffer jacket",
        sku: "JKT-4410",
        qty: 2,
        price: "₹6,598",
        color: "#6B1D2F",
      },
      {
        name: "Forest green kurta",
        sku: "KRT-1092",
        qty: 1,
        price: "₹999",
        color: "#1E3A2F",
      },
    ],
    address: {
      name: "Karan Malhotra",
      line1: "B-42, Sector 14",
      line2: "Gurugram, Haryana 122001",
      phone: "+91 98110 XX32",
    },
  },
  {
    id: "ORD-88469",
    customer: { name: "Pooja Reddy", initials: "PR", bg: "#991B1B" },
    channel: "Myntra",
    channelColor: "#E11D48",
    itemsSummary: "Beige palazzo pants +1 more · Qty 2",
    amount: "₹1,898",
    priority: "Standard",
    status: "Delivered",
    sla: "Needs attention",
    placedOn: "19 Oct, 11:20 am",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "22 Oct, 02:00 pm",
    courierAwb: "BlueDart · BD4829104",
    timelineStage: 4,
    items: [
      {
        name: "Beige palazzo pants",
        sku: "PLZ-2290",
        qty: 1,
        price: "₹899",
        color: "#D8C4B4",
      },
      {
        name: "Cotton scarf",
        sku: "SCF-8821",
        qty: 1,
        price: "₹999",
        color: "#C79D7C",
      },
    ],
    address: {
      name: "Pooja Reddy",
      line1: "Flat 302, Lakeview Apts",
      line2: "Hyderabad, Telangana 500081",
      phone: "+91 98490 XX91",
    },
  },
  {
    id: "ORD-88457",
    customer: { name: "Ishita Bose", initials: "IB", bg: "#7F1D1D" },
    channel: "Website",
    channelColor: "#84CC16",
    itemsSummary: "Forest green kurta +1 more · Qty 4",
    amount: "₹4,396",
    priority: "Express",
    status: "Shipped",
    sla: "On track",
    placedOn: "21 Oct, 09:15 am",
    deliveryType: "Express",
    paymentMode: "Prepaid",
    expectedDelivery: "23 Oct, 12:00 pm",
    courierAwb: "XpressBees · XB1827492",
    timelineStage: 3,
    items: [
      {
        name: "Forest green kurta",
        sku: "KRT-1092",
        qty: 3,
        price: "₹2,997",
        color: "#1E3A2F",
      },
      {
        name: "Embroidered dupatta",
        sku: "DPT-4421",
        qty: 1,
        price: "₹1,399",
        color: "#996515",
      },
    ],
    address: {
      name: "Ishita Bose",
      line1: "27A, Ballygunge Circular Rd",
      line2: "Kolkata, West Bengal 700019",
      phone: "+91 98302 XX77",
    },
  },
  {
    id: "ORD-88442",
    customer: { name: "Arjun Nair", initials: "AN", bg: "#B45309" },
    channel: "Amazon",
    channelColor: "#F59E0B",
    itemsSummary: "White canvas sneakers +1 more · Qty 2",
    amount: "₹5,898",
    priority: "Standard",
    status: "Ready to ship",
    sla: "On track",
    placedOn: "21 Oct, 08:30 am",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "25 Oct, 05:00 pm",
    courierAwb: "Amazon Shipping · AMZ928174",
    timelineStage: 2,
    items: [
      {
        name: "White canvas sneakers",
        sku: "SNK-9011",
        qty: 1,
        price: "₹3,499",
        color: "#E5E7EB",
      },
      {
        name: "Sports socks 3-pack",
        sku: "SCK-0032",
        qty: 1,
        price: "₹2,399",
        color: "#374151",
      },
    ],
    address: {
      name: "Arjun Nair",
      line1: "44, Indiranagar 100ft Rd",
      line2: "Bengaluru, Karnataka 560038",
      phone: "+91 98451 XX88",
    },
  },
  {
    id: "ORD-88448",
    customer: { name: "Rohan Kapoor", initials: "RK", bg: "#6D28D9" },
    channel: "Myntra",
    channelColor: "#E11D48",
    itemsSummary: "Forest green kurta +1 more · Qty 4",
    amount: "₹8,596",
    priority: "Express",
    status: "Shipped",
    sla: "On track",
    placedOn: "21 Oct, 07:10 am",
    deliveryType: "Express",
    paymentMode: "Prepaid",
    expectedDelivery: "23 Oct, 01:00 pm",
    courierAwb: "Shadowfax · SF8273615",
    timelineStage: 3,
    items: [
      {
        name: "Forest green kurta",
        sku: "KRT-1092",
        qty: 2,
        price: "₹1,998",
        color: "#1E3A2F",
      },
      {
        name: "Silk blend nehru jacket",
        sku: "NHR-3382",
        qty: 2,
        price: "₹6,598",
        color: "#4A3525",
      },
    ],
    address: {
      name: "Rohan Kapoor",
      line1: "C-12, Vasant Vihar",
      line2: "New Delhi, Delhi 110057",
      phone: "+91 98101 XX45",
    },
  },
  {
    id: "ORD-88472",
    customer: { name: "Varun Chopra", initials: "VC", bg: "#DC2626" },
    channel: "Ajio",
    channelColor: "#DC2626",
    itemsSummary: "White canvas sneakers +1 more · Qty 2",
    amount: "₹3,798",
    priority: "Standard",
    status: "Delivered",
    sla: "On track",
    placedOn: "19 Oct, 05:40 pm",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "22 Oct, 11:30 am",
    courierAwb: "Delhivery · DL4482910",
    timelineStage: 4,
    items: [
      {
        name: "White canvas sneakers",
        sku: "SNK-9011",
        qty: 1,
        price: "₹2,999",
        color: "#E5E7EB",
      },
      {
        name: "Shoe care kit",
        sku: "SCK-1102",
        qty: 1,
        price: "₹799",
        color: "#1F2937",
      },
    ],
    address: {
      name: "Varun Chopra",
      line1: "Plot 88, Jubilee Hills",
      line2: "Hyderabad, Telangana 500033",
      phone: "+91 98711 XX23",
    },
  },
  {
    id: "ORD-88460",
    customer: { name: "Siddharth Rao", initials: "SR", bg: "#EF4444" },
    channel: "Shopify",
    channelColor: "#16A34A",
    itemsSummary: "Printed cotton kurti +1 more · Qty 4",
    amount: "₹8,196",
    priority: "Standard",
    status: "Delivered",
    sla: "On track",
    placedOn: "18 Oct, 04:12 pm",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "21 Oct, 03:00 pm",
    courierAwb: "Bluedart · BD7726190",
    timelineStage: 4,
    items: [
      {
        name: "Printed cotton kurti",
        sku: "KRT-5512",
        qty: 2,
        price: "₹3,998",
        color: "#D97706",
      },
      {
        name: "Chanderi silk dupatta",
        sku: "DPT-0091",
        qty: 2,
        price: "₹4,198",
        color: "#9333EA",
      },
    ],
    address: {
      name: "Siddharth Rao",
      line1: "52, Marine Drive",
      line2: "Mumbai, Maharashtra 400020",
      phone: "+91 98200 XX67",
    },
  },
  {
    id: "ORD-88436",
    customer: { name: "Vikram Rao", initials: "VR", bg: "#4F46E5" },
    channel: "Website",
    channelColor: "#84CC16",
    itemsSummary: "Printed cotton kurti · Qty 1",
    amount: "₹799",
    priority: "Standard",
    status: "Processing",
    sla: "On track",
    placedOn: "21 Oct, 06:12 am",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "25 Oct, 04:00 pm",
    courierAwb: "Ekart · EK9928172",
    timelineStage: 1,
    items: [
      {
        name: "Printed cotton kurti",
        sku: "KRT-5512",
        qty: 1,
        price: "₹799",
        color: "#D97706",
      },
    ],
    address: {
      name: "Vikram Rao",
      line1: "19, Cunningham Rd",
      line2: "Bengaluru, Karnataka 560052",
      phone: "+91 99800 XX12",
    },
  },
  {
    id: "ORD-88481",
    customer: { name: "Priya Sharma", initials: "PS", bg: "#10B981" },
    channel: "Shopify",
    channelColor: "#16A34A",
    itemsSummary: "Forest green kurta +1 more · Qty 4",
    amount: "₹3,796",
    priority: "Standard",
    status: "Processing",
    sla: "Needs attention",
    placedOn: "21 Oct, 05:50 am",
    deliveryType: "Standard",
    paymentMode: "COD",
    expectedDelivery: "24 Oct, 07:00 pm",
    courierAwb: "Delhivery · DL6628193",
    timelineStage: 1,
    items: [
      {
        name: "Forest green kurta",
        sku: "KRT-1092",
        qty: 3,
        price: "₹2,997",
        color: "#1E3A2F",
      },
      {
        name: "Cotton leggings",
        sku: "LGN-2210",
        qty: 1,
        price: "₹799",
        color: "#374151",
      },
    ],
    address: {
      name: "Priya Sharma",
      line1: "H-18, Model Town II",
      line2: "Delhi, Delhi 110009",
      phone: "+91 98112 XX89",
    },
  },
  {
    id: "ORD-88421",
    customer: { name: "Priya Sharma", initials: "PS", bg: "#10B981" },
    channel: "Amazon",
    channelColor: "#F59E0B",
    itemsSummary: "Beige palazzo pants +1 more · Qty 2",
    amount: "₹1,898",
    priority: "Standard",
    status: "Processing",
    sla: "On track",
    placedOn: "21 Oct, 05:30 am",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "25 Oct, 02:00 pm",
    courierAwb: "Amazon Shipping · AMZ102938",
    timelineStage: 1,
    items: [
      {
        name: "Beige palazzo pants",
        sku: "PLZ-2290",
        qty: 1,
        price: "₹899",
        color: "#D8C4B4",
      },
      {
        name: "Cotton top",
        sku: "TOP-8812",
        qty: 1,
        price: "₹999",
        color: "#E2E8F0",
      },
    ],
    address: {
      name: "Priya Sharma",
      line1: "H-18, Model Town II",
      line2: "Delhi, Delhi 110009",
      phone: "+91 98112 XX89",
    },
  },
  {
    id: "ORD-88487",
    customer: { name: "Sana Khan", initials: "SK", bg: "#059669" },
    channel: "Flipkart",
    channelColor: "#2563EB",
    itemsSummary: "Forest green kurta · Qty 1",
    amount: "₹999",
    priority: "Standard",
    status: "Processing",
    sla: "On track",
    placedOn: "21 Oct, 05:15 am",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "24 Oct, 01:00 pm",
    courierAwb: "Ekart · EK7728190",
    timelineStage: 1,
    items: [
      {
        name: "Forest green kurta",
        sku: "KRT-1092",
        qty: 1,
        price: "₹999",
        color: "#1E3A2F",
      },
    ],
    address: {
      name: "Sana Khan",
      line1: "Flat 12B, Alaknanda Apts",
      line2: "Lucknow, Uttar Pradesh 226001",
      phone: "+91 98390 XX34",
    },
  },
  {
    id: "ORD-88439",
    customer: { name: "Kavya Menon", initials: "KM", bg: "#D97706" },
    channel: "Shopify",
    channelColor: "#16A34A",
    itemsSummary: "Navy formal shirt · Qty 1",
    amount: "₹1,199",
    priority: "Standard",
    status: "Ready to ship",
    sla: "On track",
    placedOn: "21 Oct, 04:50 am",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "24 Oct, 06:00 pm",
    courierAwb: "Delhivery · DL8829104",
    timelineStage: 2,
    items: [
      {
        name: "Navy formal shirt",
        sku: "SHT-3310",
        qty: 1,
        price: "₹1,199",
        color: "#1E293B",
      },
    ],
    address: {
      name: "Kavya Menon",
      line1: "8, Panampilly Nagar",
      line2: "Kochi, Kerala 682036",
      phone: "+91 98460 XX55",
    },
  },
  {
    id: "ORD-88430",
    customer: { name: "Amit Joshi", initials: "AJ", bg: "#2563EB" },
    channel: "Ajio",
    channelColor: "#DC2626",
    itemsSummary: "Forest green kurta · Qty 1",
    amount: "₹999",
    priority: "Standard",
    status: "Processing",
    sla: "On track",
    placedOn: "21 Oct, 04:30 am",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "25 Oct, 11:00 am",
    courierAwb: "XpressBees · XB4482910",
    timelineStage: 1,
    items: [
      {
        name: "Forest green kurta",
        sku: "KRT-1092",
        qty: 1,
        price: "₹999",
        color: "#1E3A2F",
      },
    ],
    address: {
      name: "Amit Joshi",
      line1: "15, Shivaji Nagar",
      line2: "Pune, Maharashtra 411005",
      phone: "+91 98230 XX78",
    },
  },
  {
    id: "ORD-88451",
    customer: { name: "Ananya Das", initials: "AD", bg: "#2563EB" },
    channel: "Ajio",
    channelColor: "#DC2626",
    itemsSummary: "Charcoal slim jeans +1 more · Qty 3",
    amount: "₹3,897",
    priority: "Standard",
    status: "Shipped",
    sla: "On track",
    placedOn: "20 Oct, 08:20 pm",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "23 Oct, 04:00 pm",
    courierAwb: "Ekart · EK1122334",
    timelineStage: 3,
    items: [
      {
        name: "Charcoal slim jeans",
        sku: "JNS-4491",
        qty: 2,
        price: "₹2,798",
        color: "#334155",
      },
      {
        name: "Graphic print t-shirt",
        sku: "TSH-0091",
        qty: 1,
        price: "₹1,099",
        color: "#1E293B",
      },
    ],
    address: {
      name: "Ananya Das",
      line1: "4A, Salt Lake Sector 1",
      line2: "Kolkata, West Bengal 700064",
      phone: "+91 98311 XX90",
    },
  },
  {
    id: "ORD-88427",
    customer: { name: "Sana Khan", initials: "SK", bg: "#059669" },
    channel: "Myntra",
    channelColor: "#E11D48",
    itemsSummary: "Forest green kurta · Qty 1",
    amount: "₹999",
    priority: "Standard",
    status: "Processing",
    sla: "On track",
    placedOn: "21 Oct, 03:45 am",
    deliveryType: "Standard",
    paymentMode: "COD",
    expectedDelivery: "25 Oct, 05:30 pm",
    courierAwb: "Shadowfax · SF5529103",
    timelineStage: 1,
    items: [
      {
        name: "Forest green kurta",
        sku: "KRT-1092",
        qty: 1,
        price: "₹999",
        color: "#1E3A2F",
      },
    ],
    address: {
      name: "Sana Khan",
      line1: "Flat 12B, Alaknanda Apts",
      line2: "Lucknow, Uttar Pradesh 226001",
      phone: "+91 98390 XX34",
    },
  },
  {
    id: "ORD-88496",
    customer: { name: "Vikram Rao", initials: "VR", bg: "#4F46E5" },
    channel: "Meesho",
    channelColor: "#9333EA",
    itemsSummary: "Navy formal shirt +1 more · Qty 4",
    amount: "₹7,596",
    priority: "Standard",
    status: "Ready to ship",
    sla: "On track",
    placedOn: "21 Oct, 02:15 am",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "24 Oct, 03:00 pm",
    courierAwb: "Delhivery · DL3382911",
    timelineStage: 2,
    items: [
      {
        name: "Navy formal shirt",
        sku: "SHT-3310",
        qty: 2,
        price: "₹2,398",
        color: "#1E293B",
      },
      {
        name: "Classic formal trousers",
        sku: "TRS-7712",
        qty: 2,
        price: "₹5,198",
        color: "#475569",
      },
    ],
    address: {
      name: "Vikram Rao",
      line1: "19, Cunningham Rd",
      line2: "Bengaluru, Karnataka 560052",
      phone: "+91 99800 XX12",
    },
  },
  {
    id: "ORD-88484",
    customer: { name: "Rahul Verma", initials: "RV", bg: "#991B1B" },
    channel: "Amazon",
    channelColor: "#F59E0B",
    itemsSummary: "Navy formal shirt · Qty 2",
    amount: "₹2,398",
    priority: "Standard",
    status: "Processing",
    sla: "On track",
    placedOn: "21 Oct, 01:40 am",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "25 Oct, 01:00 pm",
    courierAwb: "Amazon Shipping · AMZ882910",
    timelineStage: 1,
    items: [
      {
        name: "Navy formal shirt",
        sku: "SHT-3310",
        qty: 2,
        price: "₹2,398",
        color: "#1E293B",
      },
    ],
    address: {
      name: "Rahul Verma",
      line1: "D-14, Malviya Nagar",
      line2: "Jaipur, Rajasthan 302017",
      phone: "+91 98290 XX41",
    },
  },
  {
    id: "ORD-88415",
    customer: { name: "Deepa Patel", initials: "DP", bg: "#059669" },
    channel: "Flipkart",
    channelColor: "#2563EB",
    itemsSummary: "White canvas sneakers · Qty 1",
    amount: "₹2,499",
    priority: "Standard",
    status: "Processing",
    sla: "On track",
    placedOn: "21 Oct, 01:10 am",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "25 Oct, 03:00 pm",
    courierAwb: "Ekart · EK5519283",
    timelineStage: 1,
    items: [
      {
        name: "White canvas sneakers",
        sku: "SNK-9011",
        qty: 1,
        price: "₹2,499",
        color: "#E5E7EB",
      },
    ],
    address: {
      name: "Deepa Patel",
      line1: "9, Navrangpura",
      line2: "Ahmedabad, Gujarat 380009",
      phone: "+91 98790 XX55",
    },
  },
  {
    id: "ORD-88422",
    customer: { name: "Aditya Sen", initials: "AS", bg: "#B45309" },
    channel: "Myntra",
    channelColor: "#E11D48",
    itemsSummary: "Charcoal slim jeans +1 more · Qty 2",
    amount: "₹3,198",
    priority: "Express",
    status: "Ready to ship",
    sla: "On track",
    placedOn: "20 Oct, 11:55 pm",
    deliveryType: "Express",
    paymentMode: "Prepaid",
    expectedDelivery: "23 Oct, 06:00 pm",
    courierAwb: "Shadowfax · SF1192847",
    timelineStage: 2,
    items: [
      {
        name: "Charcoal slim jeans",
        sku: "JNS-4491",
        qty: 1,
        price: "₹1,999",
        color: "#334155",
      },
      {
        name: "Polo t-shirt",
        sku: "TSH-8821",
        qty: 1,
        price: "₹1,199",
        color: "#0F172A",
      },
    ],
    address: {
      name: "Aditya Sen",
      line1: "12, Park Street",
      line2: "Kolkata, West Bengal 700016",
      phone: "+91 98305 XX12",
    },
  },
  {
    id: "ORD-88419",
    customer: { name: "Sunita Rao", initials: "SR", bg: "#6D28D9" },
    channel: "Website",
    channelColor: "#84CC16",
    itemsSummary: "Maroon puffer jacket · Qty 1",
    amount: "₹3,299",
    priority: "Standard",
    status: "Processing",
    sla: "On track",
    placedOn: "20 Oct, 10:45 pm",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "24 Oct, 05:00 pm",
    courierAwb: "Ekart · EK8827101",
    timelineStage: 1,
    items: [
      {
        name: "Maroon puffer jacket",
        sku: "JKT-4410",
        qty: 1,
        price: "₹3,299",
        color: "#6B1D2F",
      },
    ],
    address: {
      name: "Sunita Rao",
      line1: "33, Sadashivnagar",
      line2: "Bengaluru, Karnataka 560080",
      phone: "+91 98450 XX77",
    },
  },
  {
    id: "ORD-88463",
    customer: { name: "Harish Mehra", initials: "HM", bg: "#DC2626" },
    channel: "Ajio",
    channelColor: "#DC2626",
    itemsSummary: "Printed cotton kurti +1 more · Qty 3",
    amount: "₹4,197",
    priority: "Standard",
    status: "Delivered",
    sla: "On track",
    placedOn: "18 Oct, 09:20 am",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "21 Oct, 01:00 pm",
    courierAwb: "Delhivery · DL1122339",
    timelineStage: 4,
    items: [
      {
        name: "Printed cotton kurti",
        sku: "KRT-5512",
        qty: 2,
        price: "₹2,598",
        color: "#D97706",
      },
      {
        name: "Embroidered stole",
        sku: "STL-9901",
        qty: 1,
        price: "₹1,599",
        color: "#B45309",
      },
    ],
    address: {
      name: "Harish Mehra",
      line1: "88, Civil Lines",
      line2: "Jaipur, Rajasthan 302006",
      phone: "+91 98292 XX44",
    },
  },
  {
    id: "ORD-88477",
    customer: { name: "Tanvi Shah", initials: "TS", bg: "#10B981" },
    channel: "Meesho",
    channelColor: "#9333EA",
    itemsSummary: "Beige palazzo pants · Qty 1",
    amount: "₹899",
    priority: "Standard",
    status: "Processing",
    sla: "On track",
    placedOn: "20 Oct, 09:15 pm",
    deliveryType: "Standard",
    paymentMode: "COD",
    expectedDelivery: "24 Oct, 04:30 pm",
    courierAwb: "Shadowfax · SF9918274",
    timelineStage: 1,
    items: [
      {
        name: "Beige palazzo pants",
        sku: "PLZ-2290",
        qty: 1,
        price: "₹899",
        color: "#D8C4B4",
      },
    ],
    address: {
      name: "Tanvi Shah",
      line1: "Flat 4, Juhu Tara Rd",
      line2: "Mumbai, Maharashtra 400049",
      phone: "+91 98205 XX11",
    },
  },
  {
    id: "ORD-88491",
    customer: { name: "Gaurav Gill", initials: "GG", bg: "#EF4444" },
    channel: "Amazon",
    channelColor: "#F59E0B",
    itemsSummary: "Forest green kurta +1 more · Qty 2",
    amount: "₹2,398",
    priority: "Standard",
    status: "Ready to ship",
    sla: "Needs attention",
    placedOn: "20 Oct, 07:40 pm",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "24 Oct, 02:00 pm",
    courierAwb: "Amazon Shipping · AMZ772819",
    timelineStage: 2,
    items: [
      {
        name: "Forest green kurta",
        sku: "KRT-1092",
        qty: 1,
        price: "₹999",
        color: "#1E3A2F",
      },
      {
        name: "Casual linen trousers",
        sku: "TRS-2219",
        qty: 1,
        price: "₹1,399",
        color: "#D1D5DB",
      },
    ],
    address: {
      name: "Gaurav Gill",
      line1: "15, Sector 8C",
      line2: "Chandigarh, 160009",
      phone: "+91 98150 XX99",
    },
  },
  {
    id: "ORD-88465",
    customer: { name: "Meera Iyer", initials: "MI", bg: "#4F46E5" },
    channel: "Website",
    channelColor: "#84CC16",
    itemsSummary: "White canvas sneakers +1 more · Qty 3",
    amount: "₹6,297",
    priority: "Express",
    status: "Delivered",
    sla: "On track",
    placedOn: "17 Oct, 03:30 pm",
    deliveryType: "Express",
    paymentMode: "Prepaid",
    expectedDelivery: "20 Oct, 05:00 pm",
    courierAwb: "Ekart · EK4481928",
    timelineStage: 4,
    items: [
      {
        name: "White canvas sneakers",
        sku: "SNK-9011",
        qty: 2,
        price: "₹4,998",
        color: "#E5E7EB",
      },
      {
        name: "Shoe cleaners pack",
        sku: "SCK-3310",
        qty: 1,
        price: "₹1,299",
        color: "#475569",
      },
    ],
    address: {
      name: "Meera Iyer",
      line1: "21, Alwarpet High Rd",
      line2: "Chennai, Tamil Nadu 600018",
      phone: "+91 98400 XX82",
    },
  },
  {
    id: "ORD-88450",
    customer: { name: "Kunal Roy", initials: "KR", bg: "#059669" },
    channel: "Flipkart",
    channelColor: "#2563EB",
    itemsSummary: "Navy formal shirt +1 more · Qty 2",
    amount: "₹2,898",
    priority: "Standard",
    status: "Processing",
    sla: "On track",
    placedOn: "20 Oct, 06:15 pm",
    deliveryType: "Standard",
    paymentMode: "Prepaid",
    expectedDelivery: "24 Oct, 03:30 pm",
    courierAwb: "Ekart · EK2291847",
    timelineStage: 1,
    items: [
      {
        name: "Navy formal shirt",
        sku: "SHT-3310",
        qty: 1,
        price: "₹1,199",
        color: "#1E293B",
      },
      {
        name: "Slim leather belt",
        sku: "BLT-9921",
        qty: 1,
        price: "₹1,699",
        color: "#451A03",
      },
    ],
    address: {
      name: "Kunal Roy",
      line1: "54, Kankarbagh",
      line2: "Patna, Bihar 800020",
      phone: "+91 98350 XX61",
    },
  },
];

export default function Orders() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Dynamic status counts
  const counts = useMemo(() => {
    return {
      all: INITIAL_ORDERS.length,
      processing: INITIAL_ORDERS.filter((o) => o.status === "Processing").length,
      readyToShip: INITIAL_ORDERS.filter((o) => o.status === "Ready to ship").length,
      shipped: INITIAL_ORDERS.filter((o) => o.status === "Shipped").length,
      delivered: INITIAL_ORDERS.filter((o) => o.status === "Delivered").length,
      needsAttention: INITIAL_ORDERS.filter((o) => o.sla === "Needs attention").length,
    };
  }, []);

  // Filtered orders list based on Tab and Search query
  const filteredOrders = useMemo(() => {
    return INITIAL_ORDERS.filter((order) => {
      // Tab filter
      if (activeTab === "Processing" && order.status !== "Processing") return false;
      if (activeTab === "Ready to ship" && order.status !== "Ready to ship") return false;
      if (activeTab === "Shipped" && order.status !== "Shipped") return false;
      if (activeTab === "Delivered" && order.status !== "Delivered") return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesCustomer = order.customer.name.toLowerCase().includes(query);
        const matchesSummary = order.itemsSummary.toLowerCase().includes(query);
        const matchesChannel = order.channel.toLowerCase().includes(query);
        const matchesSku = order.items.some((item) =>
          item.sku.toLowerCase().includes(query) || item.name.toLowerCase().includes(query)
        );
        return matchesId || matchesCustomer || matchesSummary || matchesChannel || matchesSku;
      }

      return true;
    });
  }, [activeTab, searchQuery]);

  const handleRowClick = (order) => {
    if (selectedOrder?.id === order.id) {
      setSelectedOrder(null); // toggle close
    } else {
      setSelectedOrder(order); // open drawer for this order
    }
  };

  const closeDrawer = () => {
    setSelectedOrder(null);
  };

  return (
    <div className={styles.ordersContainer}>
      {/* ── Page Header ────────────────────────────────────────── */}
      <section className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Orders</h1>
        <p className={styles.pageSubtitle}>
          {counts.all} orders across all connected marketplaces
        </p>
      </section>

      {/* ── KPI Summary Cards ──────────────────────────────────── */}
      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Total orders</p>
          <p className={styles.kpiValue}>{counts.all}</p>
          <p className={`${styles.kpiSub} ${styles.subMuted}`}>All stages</p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Processing</p>
          <p className={styles.kpiValue}>{counts.processing}</p>
          <p className={`${styles.kpiSub} ${styles.subOrange}`}>Needs action</p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Shipped</p>
          <p className={styles.kpiValue}>{counts.shipped}</p>
          <p className={`${styles.kpiSub} ${styles.subMuted}`}>In transit</p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Delivered</p>
          <p className={styles.kpiValue}>{counts.delivered}</p>
          <p className={`${styles.kpiSub} ${styles.subGreen}`}>Eligible for returns</p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.kpiLabel}>Needs attention</p>
          <p className={styles.kpiValue}>{counts.needsAttention}</p>
          <p className={`${styles.kpiSub} ${styles.subRed}`}>Stock mismatch</p>
        </div>
      </section>

      {/* ── Filter Pills Bar ───────────────────────────────────── */}
      <div className={styles.filterPillsRow}>
        <button
          className={`${styles.filterPill} ${activeTab === "All" ? styles.filterPillActive : ""}`}
          onClick={() => setActiveTab("All")}
        >
          All {counts.all}
        </button>

        <button
          className={`${styles.filterPill} ${activeTab === "Processing" ? styles.filterPillActive : ""}`}
          onClick={() => setActiveTab("Processing")}
        >
          Processing {counts.processing}
        </button>

        <button
          className={`${styles.filterPill} ${activeTab === "Ready to ship" ? styles.filterPillActive : ""}`}
          onClick={() => setActiveTab("Ready to ship")}
        >
          Ready to ship {counts.readyToShip}
        </button>

        <button
          className={`${styles.filterPill} ${activeTab === "Shipped" ? styles.filterPillActive : ""}`}
          onClick={() => setActiveTab("Shipped")}
        >
          Shipped {counts.shipped}
        </button>

        <button
          className={`${styles.filterPill} ${activeTab === "Delivered" ? styles.filterPillActive : ""}`}
          onClick={() => setActiveTab("Delivered")}
        >
          Delivered {counts.delivered}
        </button>
      </div>

      {/* ── Search Bar ─────────────────────────────────────────── */}
      <div className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <img src={searchIcon} alt="Search" className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search order ID, customer or SKU"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Main Split View (Orders Table + Detail Drawer) ────── */}
      <div className={styles.mainSplit}>
        {/* Table Container */}
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeadRow}>
                  <th className={styles.th}>Order</th>
                  <th className={styles.th}>Customer</th>
                  <th className={styles.th}>Channel</th>
                  <th className={styles.th}>Items</th>
                  <th className={styles.th}>Amount</th>
                  <th className={styles.th}>Priority</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>SLA</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8">
                      <div className={styles.emptyState}>
                        <p className={styles.emptyStateTitle}>No orders found</p>
                        <p className={styles.emptyStateDesc}>
                          Try clearing your filters or search keywords.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isSelected = selectedOrder?.id === order.id;

                    // Status pill styling
                    let statusClass = styles.statusProcessing;
                    if (order.status === "Shipped") statusClass = styles.statusShipped;
                    else if (order.status === "Delivered") statusClass = styles.statusDelivered;
                    else if (order.status === "Ready to ship") statusClass = styles.statusReady;

                    // SLA pill styling
                    const slaClass =
                      order.sla === "On track" ? styles.slaOnTrack : styles.slaNeedsAttention;

                    // Priority styling
                    const priorityClass =
                      order.priority === "Express"
                        ? styles.priorityExpress
                        : styles.priorityStandard;

                    return (
                      <tr
                        key={order.id}
                        className={`${styles.tableRow} ${isSelected ? styles.tableRowSelected : ""}`}
                        onClick={() => handleRowClick(order)}
                      >
                        {/* Order ID */}
                        <td className={styles.td}>
                          <span className={styles.orderId}>{order.id}</span>
                        </td>

                        {/* Customer */}
                        <td className={styles.td}>
                          <div className={styles.customerWrapper}>
                            <div
                              className={styles.avatar}
                              style={{ backgroundColor: order.customer.bg }}
                            >
                              {order.customer.initials}
                            </div>
                            <span className={styles.customerName}>{order.customer.name}</span>
                          </div>
                        </td>

                        {/* Channel */}
                        <td className={styles.td}>
                          <div className={styles.channelWrapper}>
                            <span
                              className={styles.channelDot}
                              style={{ backgroundColor: order.channelColor }}
                            />
                            <span>{order.channel}</span>
                          </div>
                        </td>

                        {/* Items */}
                        <td className={styles.td}>
                          <div className={styles.itemsText} title={order.itemsSummary}>
                            {order.itemsSummary}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className={styles.td}>
                          <span className={styles.amountText}>{order.amount}</span>
                        </td>

                        {/* Priority */}
                        <td className={styles.td}>
                          <span className={`${styles.priorityBadge} ${priorityClass}`}>
                            {order.priority}
                          </span>
                        </td>

                        {/* Status */}
                        <td className={styles.td}>
                          <span className={`${styles.badge} ${statusClass}`}>
                            <span className={styles.badgeDot} />
                            {order.status}
                          </span>
                        </td>

                        {/* SLA */}
                        <td className={styles.td}>
                          <span className={`${styles.badge} ${slaClass}`}>
                            <span className={styles.badgeDot} />
                            {order.sla}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Detail Drawer (Second Image) ────────────────────── */}
        {selectedOrder && (
          <aside className={styles.drawer}>
            {/* Drawer Header */}
            <div className={styles.drawerHeader}>
              <div className={styles.drawerHeaderLeft}>
                <h2 className={styles.drawerOrderId}>{selectedOrder.id}</h2>
                <p className={styles.drawerSubtitle}>
                  {selectedOrder.channel} · {selectedOrder.priority}
                </p>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeDrawer}
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            {/* Action Button */}
            <button type="button" className={styles.processBtn}>
              {selectedOrder.status === "Delivered"
                ? "View delivery details →"
                : selectedOrder.status === "Shipped"
                ? "Track shipment →"
                : selectedOrder.status === "Ready to ship"
                ? "Print shipping label →"
                : "Process this order →"}
            </button>

            {/* ORDER INFO Section */}
            <div className={styles.drawerSection}>
              <h3 className={styles.sectionTitle}>Order Info</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Placed On</span>
                  <span className={styles.infoValue}>{selectedOrder.placedOn}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Channel</span>
                  <span className={styles.infoValue}>{selectedOrder.channel}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Delivery Type</span>
                  <span className={styles.infoValue}>{selectedOrder.deliveryType}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Payment Mode</span>
                  <span className={styles.infoValue}>{selectedOrder.paymentMode}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Expected Delivery</span>
                  <span className={styles.infoValue}>{selectedOrder.expectedDelivery}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Courier · AWB</span>
                  <span className={styles.infoValue}>{selectedOrder.courierAwb}</span>
                </div>
              </div>
            </div>

            {/* FULFILLMENT TIMELINE Section */}
            <div className={styles.drawerSection}>
              <h3 className={styles.sectionTitle}>Fulfillment Timeline</h3>
              <div className={styles.timeline}>
                {/* Step 1: Order placed */}
                <div className={styles.timelineStep}>
                  <div
                    className={`${styles.timelineLine} ${
                      selectedOrder.timelineStage >= 2 ? styles.timelineLineActive : ""
                    }`}
                  />
                  <div className={`${styles.timelineDot} ${styles.timelineDotActive}`} />
                  <div className={styles.timelineContent}>
                    <p className={styles.timelineStepTitle}>Order placed</p>
                    <p className={styles.timelineStepSub}>Completed</p>
                  </div>
                </div>

                {/* Step 2: Confirmed & packed */}
                <div className={styles.timelineStep}>
                  <div
                    className={`${styles.timelineLine} ${
                      selectedOrder.timelineStage >= 3 ? styles.timelineLineActive : ""
                    }`}
                  />
                  <div
                    className={`${styles.timelineDot} ${
                      selectedOrder.timelineStage >= 2 ? styles.timelineDotActive : ""
                    }`}
                  />
                  <div className={styles.timelineContent}>
                    <p className={styles.timelineStepTitle}>Confirmed & packed</p>
                    <p className={styles.timelineStepSub}>
                      {selectedOrder.timelineStage >= 2 ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>

                {/* Step 3: Shipped */}
                <div className={styles.timelineStep}>
                  <div
                    className={`${styles.timelineLine} ${
                      selectedOrder.timelineStage >= 4 ? styles.timelineLineActive : ""
                    }`}
                  />
                  <div
                    className={`${styles.timelineDot} ${
                      selectedOrder.timelineStage >= 3 ? styles.timelineDotActive : ""
                    }`}
                  />
                  <div className={styles.timelineContent}>
                    <p className={styles.timelineStepTitle}>Shipped</p>
                    <p className={styles.timelineStepSub}>
                      {selectedOrder.timelineStage >= 3 ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>

                {/* Step 4: Delivered */}
                <div className={styles.timelineStep}>
                  <div
                    className={`${styles.timelineDot} ${
                      selectedOrder.timelineStage >= 4 ? styles.timelineDotActive : ""
                    }`}
                  />
                  <div className={styles.timelineContent}>
                    <p className={styles.timelineStepTitle}>Delivered</p>
                    <p className={styles.timelineStepSub}>
                      {selectedOrder.timelineStage >= 4 ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ITEMS Section */}
            <div className={styles.drawerSection}>
              <h3 className={styles.sectionTitle}>Items ({selectedOrder.items.length})</h3>
              <div className={styles.itemsList}>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div
                      className={styles.itemSwatch}
                      style={{ backgroundColor: item.color }}
                    />
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName} title={item.name}>
                        {item.name}
                      </p>
                      <p className={styles.itemSku}>
                        Qty {item.qty} · SKU {item.sku}
                      </p>
                    </div>
                    <span className={styles.itemPrice}>{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SHIPPING ADDRESS Section */}
            <div className={styles.drawerSection}>
              <h3 className={styles.sectionTitle}>Shipping Address</h3>
              <div className={styles.addressCard}>
                <span className={styles.addressName}>{selectedOrder.address.name}</span>
                <span>{selectedOrder.address.line1}</span>
                <span>{selectedOrder.address.line2}</span>
                <span>{selectedOrder.address.phone}</span>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
