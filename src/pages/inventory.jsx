import { useState } from "react";
import styles from "../css/pages/inventory.Inventory.module.css";
import Counter from "../components/Counter";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("all");
  return (
    <div className={styles.InventoryGlobalContainer}>
      <div className={styles.pageWrapper}>
        <div className={styles.customBox}>
          <img
            src="/src/assets/icons/hero.svg"
            className={styles.heroBg}
            alt=""
          />
          <div className={styles.leftCustom}>
            <h1>Manage Inventory</h1>
            <p>
              Welcome back, Sarah! Here's a snapshot of your platform's
              performance.
            </p>
          </div>

          <div className={styles.buttonCustom}>
            <button className={styles.downRep}>Download Report</button>
          </div>
        </div>

        {/* Overview Section */}
        <div className={styles.overview}>
          <div className={styles.firstRow}>
            <div className={styles.overLeft}>
              <img
                src="/src/assets/icons/inventory.svg"
                className={styles.iconSm}
                alt=""
              />
              <p className={styles.textSm}>
                Have unique products to sell? Choose from the options below
              </p>
            </div>
          </div>

          <div className={styles.secondRow}>
            <h2 className={styles.textOverview}>Overview</h2>

            <div className={styles.ovrBx}>
              {/* Box 1 */}
              <div className={styles.overBox}>
                <div className={styles.inBox1}>
                  <img
                    src="/src/assets/icons/note.svg"
                    className={styles.iconSm}
                    alt=""
                  />
                  <h3 className={styles.textCard}>Sellable Inventory</h3>
                  <button className={styles.menuBtn}>⋮</button>
                </div>

                <div className={styles.line}></div>

                <div className={styles.inBox2}>
                  <h3 className={styles.textNum}>38</h3>
                  <button>
                    View details
                    <img
                      src="/src/assets/icons/arrow_black.svg"
                      className={styles.arrowIcon}
                      alt=""
                    />
                  </button>
                </div>
              </div>

              {/* Box 2 */}
              <div className={styles.overBox}>
                <div className={styles.inBox1}>
                  <img
                    src="/src/assets/icons/note.svg"
                    className={styles.iconSm}
                    alt=""
                  />
                  <h3 className={styles.textCard}>Out of Stock</h3>
                  <button className={styles.menuBtn}>⋮</button>
                </div>

                <div className={styles.line}></div>

                <div className={styles.inBox2}>
                  <h3 className={styles.textNum}>6 SKU’s</h3>
                  <button>
                    View details
                    <img
                      src="/src/assets/icons/arrow_black.svg"
                      className={styles.arrowIcon}
                      alt=""
                    />
                  </button>
                </div>
              </div>

              {/* Box 3 */}
              <div className={styles.overBox}>
                <div className={styles.inBox1}>
                  <img
                    src="/src/assets/icons/note.svg"
                    className={styles.iconSm}
                    alt=""
                  />
                  <h3 className={styles.textCard}>Low Stocks</h3>
                  <button className={styles.menuBtn}>⋮</button>
                </div>

                <div className={styles.line}></div>

                <div className={styles.inBox2}>
                  <h3 className={styles.textNum}>26 SKU’s</h3>
                  <button>
                    View details
                    <img
                      src="/src/assets/icons/arrow_black.svg"
                      className={styles.arrowIcon}
                      alt=""
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className={styles.inventorySection}>
          <div className={styles.tabsRow}>
            <ul className={styles.tabs}>
              <li
                className={`${styles.tab} ${activeTab === "all" ? styles.active : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All (26)
              </li>
              <li
                className={`${styles.tab} ${activeTab === "action" ? styles.active : ""}`}
                onClick={() => setActiveTab("action")}
              >
                Action Required (0)
              </li>
              <li
                className={`${styles.tab} ${activeTab === "qc" ? styles.active : ""}`}
                onClick={() => setActiveTab("qc")}
              >
                QC In Progress (10)
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

        {/* Inventory Table */}
        <div className={styles.inventoryTable}>
          <p className={styles.previousLink}>Previous Inward</p>

          <table className={styles.tbInv}>
            <thead className={styles.theadInv}>
              <tr>
                <th>File</th>
                <th>File Name</th>
                <th>Current stock</th>
                <th> New inward</th>
                <th>Status</th>
                <th>Options</th>
              </tr>
            </thead>

            <tbody className={styles.tbodyInv}>
              <tr>
                <td>
                  <div className={styles.fileIcon}>📄</div>
                </td>
                <td>#56456354654....</td>
                <td>Kurta</td>
                <td>
                  <Counter initialValue={0} />
                </td>
                <td>
                  <span className={`${styles.status} ${styles.activeStatus}`}>
                    Active
                  </span>
                </td>
                <td>
                  <a href="#" className={styles.viewLink}>
                    View
                  </a>{" "}
                  |{" "}
                  <a href="#" className={styles.downloadLink}>
                    Download
                  </a>
                </td>
              </tr>

              <tr>
                <td>
                  <div className={styles.fileIcon}>📄</div>
                </td>
                <td>#56456354654....</td>
                <td>Kurta</td>
                <td>
                  <Counter initialValue={0} />
                </td>
                <td>
                  <span className={`${styles.status} ${styles.pauseStatus}`}>
                    Pause
                  </span>
                </td>
                <td>
                  <a href="#" className={styles.viewLink}>
                    View
                  </a>
                  {"    |    "}
                  <a href="#" className={styles.downloadLink}>
                    Download
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <button className={styles.uploadInwardBtn}>Upload Inward</button>
          <div className={styles.buttonContainer}>
            <button className={styles.draftBtn}>Draft</button>
            <button className={styles.submitBtn}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
