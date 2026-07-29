import { useState, useEffect } from "react";
import styles from "../css/pages/inventory.Inventory.module.css";
import GridTable from "../components/GridTable";
const url = import.meta.env.VITE_BASEAPI;
const inventoryColumns = [
  { key: "image", label: "Image", className: "listImageWrap" },
  { key: "sku", label: "SKU ID", className: "listSkuHeader" },
  { key: "title", label: "Product Title", className: "listMain" },
  { key: "stock", label: "Current Stock", className: "listStock" },
  { key: "type", label: "Product Type", className: "listType" },
  { key: "platform", label: "Platforms", className: "statusBadge" },
];

// table and overview section
export default function StockInventory() {
  const [stocks, setStocks] = useState({
    total: "",
    sellable: "",
    oos: "",
    low: "",
  });
  const [table, setTable] = useState("total"); // total, sellable, oos, lowStock

  useEffect(() => {
    async function getStockCounts() {
      const response = await fetch(`${url}/inventory/stocks`, {
        credentials: "include",
      });

      const stocks = await response.json();
      setStocks({
        total: stocks.total,
        sellable: stocks.sellable,
        oos: stocks.oos,
        low: stocks.low,
      });
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
                <button
                  onClick={() => {
                    setTable("total");
                  }}
                  disabled={table === "total" ? true : false}
                >
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
                <button
                  onClick={() => {
                    setTable("sellable");
                  }}
                  disabled={table === "sellable" ? true : false}
                >
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
                <button
                  onClick={() => {
                    setTable("oos");
                  }}
                  disabled={table === "oos" ? true : false}
                >
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
                <button
                  onClick={() => {
                    setTable("lowStock");
                  }}
                  disabled={table === "lowStock" ? true : false}
                >
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

        {table === "total" ? (
          <AllInventoryTable />
        ) : table === "sellable" ? (
          <SellableInventoryTable />
        ) : table === "oos" ? (
          <OOSInventoryTable />
        ) : table === "lowStock" ? (
          <LowStockInventoryTable />
        ) : null}
      </div>
    </>
  );
}

// ================= Grid-list style "table" (matches Catalog page) =================
function InventoryTable({ data }) {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <>
      <GridTable
        styles={styles}
        gridTemplate="56px 100px 1.3fr 0.6fr 0.6fr 0.7fr"
        compactGridTemplate="56px 1.4fr 90px 100px"
        columns={inventoryColumns}
        data={data}
        renderRow={(item) => (
          <div className={styles.listItem} key={item.usku_id}>
            <div className={styles.listImageWrap}>
              <img
                className={styles.listImage}
                src={`${url}${JSON.parse(item.image_url).webp_card}`}
                alt={item.product_title || "product"}
              />
            </div>
            <div
              className={styles.listSku}
              onClick={() => setSelectedItem(item)}
              style={{ cursor: "pointer", color: "#0040D6" }}
            >
              {item.sku_id}
            </div>
            <div className={styles.listMain}>
              <div className={styles.listTitle}>
                {item.product_title || "Untitled"}
              </div>
            </div>
            <div className={styles.listStock}>{item.product_stock}</div>
            <div className={styles.listType}>{item.product_type}</div>
            <span className={`${styles.status} ${styles.activeStatus}`}>
              Active
            </span>
          </div>
        )}
      />

      <CustomerProfilePanel
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}

function CustomerProfilePanel({ item, onClose }) {
  const isOpen = !!item;

  return (
    <>
      {isOpen && <div className={styles.sidebarOverlay} onClick={onClose} />}
      <div
        className={`${styles.sidebarBody} ${isOpen ? styles.sidebarOpen : ""}`}
      >
        {item && (
          <>
            <button className={styles.closeSidebar} onClick={onClose}>
              ✕
            </button>

            <h2>Customer Profile</h2>

            <div
              className={styles.listImageWrap}
              style={{ margin: "1rem auto" }}
            >
              <img
                className={styles.listImage}
                src={`${url}${JSON.parse(item.image_url).webp_card}`}
                alt={item.product_title}
              />
            </div>

            <h3 style={{ textAlign: "center" }}>{item.product_title}</h3>
            <p style={{ textAlign: "center", color: "#0040D6" }}>
              Sku ID: {item.sku_id}
            </p>

            <div className={styles.mainSection} style={{ padding: "1rem" }}>
              <p>
                creation date : <br />
                <strong>{item.created_at || "—"}</strong>
              </p>
              <p>
                Updation date : <br />
                <strong>{item.updated_at || "—"}</strong>
              </p>
              <p>
                Listing Information : <br />
                <strong>Manual</strong>
              </p>
              <p>
                Product Title : <br />
                <strong>{item.product_title}</strong>
              </p>
              <p>
                Product Price : <br />
                <strong>Rs {item.product_price}</strong>
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
function AllInventoryTable() {
  const [all, setAll] = useState([]);

  useEffect(() => {
    async function getInventory() {
      try {
        const response = await fetch(`${url}/inventory`, {
          credentials: "include",
        });

        const data = await response.json();

        setAll(data);
      } catch (e) {
        console.log(e);
      }
    }

    getInventory();
  }, []);

  return <InventoryTable data={all} />;
}

function SellableInventoryTable() {
  const [all, setAll] = useState([]);

  useEffect(() => {
    async function getInventory() {
      try {
        const response = await fetch(`${url}/inventory?filter=sellable`, {
          credentials: "include",
        });

        const data = await response.json();

        setAll(data);
      } catch (e) {
        console.log(e);
      }
    }

    getInventory();
  }, []);

  return <InventoryTable data={all} />;
}

function OOSInventoryTable() {
  const [all, setAll] = useState([]);

  useEffect(() => {
    async function getInventory() {
      try {
        const response = await fetch(`${url}/inventory?filter=oos`, {
          credentials: "include",
        });

        const data = await response.json();

        setAll(data);
      } catch (e) {
        console.log(e);
      }
    }

    getInventory();
  }, []);

  return <InventoryTable data={all} />;
}

function LowStockInventoryTable() {
  const [all, setAll] = useState([]);

  useEffect(() => {
    async function getInventory() {
      try {
        const response = await fetch(`${url}/inventory?filter=low-stock`, {
          credentials: "include",
        });

        const data = await response.json();

        setAll(data);
      } catch (e) {
        console.log(e);
      }
    }

    getInventory();
  }, []);

  return <InventoryTable data={all} />;
}
