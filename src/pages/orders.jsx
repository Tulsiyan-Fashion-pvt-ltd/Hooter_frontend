import styles from "../css/pages/Orders.module.css";
import cartIcon from "../assets/icons/cart.svg";
import searchManIcon from "../assets/icons/searchman.svg";
import { useState } from "react";

export default function Orders() {
  const [activeTab, setActiveTab] = useState("Pending");
  // eslint-disable-next-line no-unused-vars
  const [orders, setOrders] = useState([]); // placeholder — real fetch logic has to be written
  return (
    <div className={styles.globalOrdersContainer}>
      <section className={styles.box}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Orders</h1>
          <p className={styles.pageSubtitle}>
            Welcome back, Sarah! Here's a snapshot of your platform's
            performance.
          </p>
        </div>

        <button className={styles.primaryBtn}>Download Report</button>
      </section>

      <section className={styles.actionContainer}>
        <div className={styles.left}>
          <div className={styles.iconWrapper}>
            <img src={cartIcon} alt="cart" />
          </div>
          <p>
            Welcome back, Sarah! Here's a snapshot of your platform's
            performance.
          </p>
        </div>

        <div className={styles.right}>
          <button className={styles.primary}>Buy barcoded packets</button>
          <button className={styles.secondary}>Scan Barcoded Packets</button>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "On Hold" ? styles.active : ""}`}
            onClick={() => setActiveTab("On Hold")}
          >
            On Hold
          </button>
          <button
            className={`${styles.tab} ${activeTab === "Pending" ? styles.active : ""}`}
            onClick={() => setActiveTab("Pending")}
          >
            Pending
          </button>
          <button
            className={`${styles.tab} ${activeTab === "Ready To Ship" ? styles.active : ""}`}
            onClick={() => setActiveTab("Ready To Ship")}
          >
            Ready To Ship
          </button>
          <button
            className={`${styles.tab} ${activeTab === "Shipped" ? styles.active : ""}`}
            onClick={() => setActiveTab("Shipped")}
          >
            Shipped
          </button>
          <button
            className={`${styles.tab} ${activeTab === "Cancelled" ? styles.active : ""}`}
            onClick={() => setActiveTab("Cancelled")}
          >
            Cancelled
          </button>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <h4 className={styles.h4}>Filter by</h4>

          <select className={styles.select}>
            <option>SLA status</option>
          </select>

          <select className={styles.select}>
            <option>Dispatch Date</option>
          </select>

          <select className={styles.select}>
            <option>Order Date</option>
          </select>
        </div>
      </section>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className={styles.emptyState}>
          <img src={searchManIcon} alt="No Results" />
          <h3>No Results</h3>
          <p>
            No Bulk catalogs exist. Upload a <br />
            new catalog using Bulk upload <br />
            button on the top
          </p>
        </div>
      )}
    </div>
  );
}
