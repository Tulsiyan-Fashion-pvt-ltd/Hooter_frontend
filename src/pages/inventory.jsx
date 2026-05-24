import { useState, useEffect } from "react";
import styles from "../css/pages/inventory.Inventory.module.css";
import Counter from "../components/Counter";
import StockInventory from "../components/stockInventory";
import Inward from "../components/inwardInventory";
const url = import.meta.env.VITE_BASEAPI;

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("inventory");

  return (
    <div className={styles.InventoryGlobalContainer}>
      <div className={styles.pageWrapper}>
        <div className={styles.customBox}>
          {/* <img
            src="/src/assets/icons/hero.svg"
            className={styles.heroBg}
            alt=""
          /> */}
          <div className={styles.leftCustom}>
            <h1>Manage Inventory</h1>
            <p>
              Welcome back, Sarah! Here's a snapshot of your platform's
              performance.
            </p>
          </div>

          {/* <div className={styles.buttonCustom}>
            <button className={styles.downRep}>Download Report</button>
          </div> */}
        </div>

        {/* tabs Section */}
        <div className={styles.inventorySection}>
          <div className={styles.tabsRow}>
            <ul className={styles.tabs}>
              <li
                className={`${styles.tab} ${activeTab === "inventory" ? styles.active : ""}`}
                onClick={() => setActiveTab("inventory")}
              >
                Inventory
              </li>
              <li
                className={`${styles.tab} ${activeTab === "inward" ? styles.active : ""}`}
                onClick={() => setActiveTab("inward")}
              >
                Inward
              </li>
              <li
                className={`${styles.tab} ${activeTab === "grn" ? styles.active : ""}`}
                onClick={() => setActiveTab("grn")}
              >
                GRN
              </li>
            </ul>
          </div>

          <hr />

          <div className={styles.filterSearchRow}>
            <div className={styles.filterArea}>
              <label htmlFor="category">Filter By</label>
              <select id="category">
                <option>Select Category</option>
                <option>Category 1</option>
                <option>Category 2</option>
              </select>
            </div>

            <div className={styles.searchArea}>
              <input
                type="text"
                placeholder="Search by File Name"
                className={styles.searchInput}
              />
              <button type="button" className={styles.searchBtn}>
                <img
                  src="/src/assets/icons/search.svg"
                  className={styles.searchIcon}
                  alt="search"
                />
              </button>
            </div>
          </div>
        </div>

        {activeTab==="inventory"? <StockInventory />: 
          activeTab==="inward"? <Inward/>: null}
      </div>
    </div>
  );
}