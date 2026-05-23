import { useState, useEffect } from "react";
import styles from "../css/pages/inventory.Inventory.module.css";
import Counter from "../components/Counter";
const url = import.meta.env.VITE_BASEAPI;

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("all");

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
                className={`${styles.tab} ${activeTab === "all" ? styles.active : ""}`}
                onClick={() => setActiveTab("all")}
              >
                Inventory
              </li>
              <li
                className={`${styles.tab} ${activeTab === "action" ? styles.active : ""}`}
                onClick={() => setActiveTab("action")}
              >
                Inward
              </li>
              <li
                className={`${styles.tab} ${activeTab === "qc" ? styles.active : ""}`}
                onClick={() => setActiveTab("qc")}
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

        <StockInventory />
      </div>
    </div>
  );
}


function InventoryTable({ data }) {
  // console.log(data)
  return (
    <table className={styles.tbInv}>
      <thead className={styles.theadInv}>
        <tr>
          <th>Image</th>
          <th>SKU ID</th>
          <th>Current stock</th>
          <th>Product Type</th>
          {/* <th>Current Stock</th> */}
          <th>Platforms</th>
        </tr>
      </thead>

      <tbody className={styles.tbodyInv}>
        {
          data ? data.map(({ image_url, usku_id, sku_id, product_type, product_stock }) => {
            return (<tr key={usku_id}>
              <td>
                <div style={{ "display": "flex", "justifyContent": "center", "alignItems": "center" }}>
                  <img src={`${url}${JSON.parse(image_url).webp_card}`} alt="product image" height={"100px"} />
                </div>
              </td>
              <td>{sku_id}</td>
              <td>{product_stock}</td>
              <td>
                {product_type}
              </td>
              <td>
                <span className={`${styles.status} ${styles.activeStatus}`}>
                  Active
                </span>
              </td>
              {/* <td>
                <a href="#" className={styles.viewLink}>
                  View
                </a>{" "}
                |{" "}
                <a href="#" className={styles.downloadLink}>
                  Download
                </a>
              </td> */}
            </tr>
            )
          }) : null
        }
      </tbody>
    </table>
  )
}

function AllInventoryTable() {
  const [all, setAll] = useState([]);

  useEffect(() => {
    async function getInventory() {
      try {
        const response = await fetch(`${url}/inventory`, { "credentials": "include" });

        const data = await response.json();

        setAll(data);
      }
      catch (e) {
        console.log(e);
      }
    }

    getInventory();
  }, []);

  return (
    <InventoryTable data={all} />
  )
}

function SellableInventoryTable() {
  const [all, setAll] = useState([]);

  useEffect(() => {
    async function getInventory() {
      try {
        const response = await fetch(`${url}/inventory?filter=sellable`, { "credentials": "include" });

        const data = await response.json();

        setAll(data);
      }
      catch (e) {
        console.log(e);
      }
    }

    getInventory();
  }, []);

  return (
    <InventoryTable data={all} />
  )
}


function OOSInventoryTable() {
  const [all, setAll] = useState([]);

  useEffect(() => {
    async function getInventory() {
      try {
        const response = await fetch(`${url}/inventory?filter=oos`, { "credentials": "include" });

        const data = await response.json();

        setAll(data);
      }
      catch (e) {
        console.log(e);
      }
    }

    getInventory();
  }, []);

  return (
    <InventoryTable data={all} />
  )
}


function LowStockInventoryTable() {
  const [all, setAll] = useState([]);

  useEffect(() => {
    async function getInventory() {
      try {
        const response = await fetch(`${url}/inventory?filter=low-stock`, { "credentials": "include" });

        const data = await response.json();

        setAll(data);
      }
      catch (e) {
        console.log(e);
      }
    }

    getInventory();
  }, []);

  return (
    <InventoryTable data={all} />
  )
}






// table and overview section
function StockInventory() {
  const [stocks, setStocks] = useState({
    "total": '',
    "sellable": '',
    "oos": '',
    "low": ''
  })
  const [table, setTable] = useState("total");  // total, sellable, oos, lowStock

  useEffect(() => {
    async function getStockCounts() {
      const response = await fetch(`${url}/inventory/stocks`, { "credentials": "include" });

      const stocks = await response.json();
      setStocks({
        "total": stocks.total,
        "sellable": stocks.sellable,
        "oos": stocks.oos,
        "low": stocks.low
      })
    }

    getStockCounts();
  }, []);

  return (
    <>
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

            {/* Box 0 */}
            <div className={styles.overBox}>
              <div className={styles.inBox1}>
                <img
                  src="/src/assets/icons/note.svg"
                  className={styles.iconSm}
                  alt=""
                />
                <h3 className={styles.textCard}>Total Inventory</h3>
                <button className={styles.menuBtn}>⋮</button>
              </div>

              <div className={styles.line}></div>

              <div className={styles.inBox2}>
                <h3 className={styles.textNum}>{stocks.total}</h3>
                <button onClick={() => { setTable("total") }}>
                  View details
                  <img
                    src="/src/assets/icons/arrow_black.svg"
                    className={styles.arrowIcon}
                    alt=""
                  />
                </button>
              </div>
            </div>

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
                <h3 className={styles.textNum}>{stocks.sellable}</h3>
                <button onClick={() => { setTable("sellable") }}>
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
                <h3 className={styles.textNum}>{stocks.oos}</h3>
                <button onClick={() => { setTable("oos") }}>
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
                <h3 className={styles.textNum}>{stocks.low}</h3>
                <button onClick={() => { setTable("lowStock") }}>
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


      {/* Inventory Table */}
      <div className={styles.inventoryTable}>
        {/* <p className={styles.previousLink}>Previous Inward</p> */}

        {table === "total" ? <AllInventoryTable /> :
          table === "sellable" ? <SellableInventoryTable /> :
            table === "oos" ? <OOSInventoryTable /> :
              table === "lowStock" ? <LowStockInventoryTable /> : null
        }

      </div>
    </>
  )
}