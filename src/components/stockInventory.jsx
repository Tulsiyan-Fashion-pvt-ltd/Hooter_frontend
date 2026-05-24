import { useState, useEffect } from "react";
import styles from "../css/pages/inventory.Inventory.module.css"
const url = import.meta.env.VITE_BASEAPI

// table and overview section
export default function StockInventory() {
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
                <button onClick={() => { setTable("total") }} disabled={table==="total"?true: false}>
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
                <button onClick={() => { setTable("sellable") }} disabled={table==="sellable"?true: false}>
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
                <button onClick={() => { setTable("oos") }} disabled={table==="oos"?true: false}>
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
                <button onClick={() => { setTable("lowStock") }} disabled={table==="lowStock"?true: false}>
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



function InventoryTable({ data }) {
  // console.log(data)
  return (
    <table className={styles.tbInv}>
      <thead className={styles.theadInv}>
        <tr>
          <th>Image</th>
          <th>SKU ID</th>
          <th>Product Title</th>
          <th>Current stock</th>
          <th>Product Type</th>
          <th>Platforms</th>
        </tr>
      </thead>

      <tbody className={styles.tbodyInv}>
        {
          data ? data.map(({ image_url, usku_id, sku_id, product_title, product_type, product_stock }) => {
            return (<tr key={usku_id}>
              <td>
                <div style={{ "display": "flex", "justifyContent": "center", "alignItems": "center" }}>
                  <img src={`${url}${JSON.parse(image_url).webp_card}`} alt="product image" height={"100px"} />
                </div>
              </td>
              <td>{sku_id}</td>
              <td>{product_title}</td>
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