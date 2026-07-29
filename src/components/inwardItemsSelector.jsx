import { useEffect, useState } from "react";
import styles from "../css/components/ItemsSelector.module.css";
import GridTable from "../components/GridTable";
import clsx from "clsx";

const url = import.meta.env.VITE_BASEAPI;

const gridTemplate = "56px 72px 90px 1.3fr 100px 100px 150px 170px 150px";

const columns = [
  { key: "select", label: "Select", className: "listType" },
  { key: "image", label: "Image", className: "listType" },
  { key: "sku", label: "SKU ID", className: "listType" },
  { key: "title", label: "Product Title", className: "listMain" },
  { key: "type", label: "Product Type", className: "listType" },
  { key: "stock", label: "Current Stock", className: "listStock" },
  { key: "expStock", label: "Expected Stock", className: "listType" },
  { key: "uom", label: "Unit of Measurement", className: "listType" },
  { key: "po", label: "PO Number", className: "listType" },
];

export default function ItemsSelector({ onSubmit }) {
  // component for selecting the skus for inwarding

  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({}); // adds the selected product with expected stock and uom form the list

  useEffect(() => {
    async function getInventory() {
      try {
        const response = await fetch(`${url}/inventory`, {
          credentials: "include",
        });
        const data = await response.json();
        setItems(data);
      } catch (e) {
        console.log(e);
      }
    }

    getInventory();
  }, []);

  function handleCheckbox(uskuId) {
    // setting the default values for the selected keys
    setSelectedItems((prev) => {
      if (uskuId in prev) {
        delete prev[uskuId];
        return { ...prev };
      } else {
        return { ...prev, [uskuId]: { exp_stock: 1, uom: "EA", po: "" } };
      }
    });
  }

  function registerManualStock(uskuId, value) {
    setSelectedItems((prev) => {
      if (uskuId in prev) {
        return {
          ...prev,
          [uskuId]: { ...prev[uskuId], exp_stock: value < 1 ? 1 : value },
        };
      } else {
        return { ...prev };
      }
    });
  }

  function increaseStock(uskuId) {
    setSelectedItems((prev) => {
      if (uskuId in prev) {
        return {
          ...prev,
          [uskuId]: {
            ...prev[uskuId],
            exp_stock: (prev[uskuId].exp_stock += 1),
          },
        };
      } else {
        return { ...prev };
      }
    });
  }

  function decreaseStock(uskuId) {
    setSelectedItems((prev) => {
      if (uskuId in prev) {
        return {
          ...prev,
          [uskuId]: {
            ...prev[uskuId],
            exp_stock:
              prev[uskuId].exp_stock > 1 ? (prev[uskuId].exp_stock -= 1) : 1,
          },
        };
      } else {
        return { ...prev };
      }
    });
  }

  function setUom(uskuId, value) {
    setSelectedItems((prev) => {
      if (uskuId in prev) {
        return { ...prev, [uskuId]: { ...prev[uskuId], uom: value } };
      } else {
        return { ...prev };
      }
    });
  }

  function setPo(uskuId, value) {
    setSelectedItems((prev) => {
      if (uskuId in prev) {
        return { ...prev, [uskuId]: { ...prev[uskuId], po: value } };
      } else {
        return { ...prev };
      }
    });
  }

  const units = {
    EA: "Each",
    PCS: "Pieces",
    PAC: "Pack",
    BOX: "Box",
    CTN: "Carton",
    CS: "Case",
    DZ: "Dozen",
    PAL: "Pallet",

    KG: "Kilograms",
    G: "Grams",
    LBS: "Pounds",
    OZ: "Ounces",
    TN: "Tons",

    L: "Liters",
    ML: "Milliliters",
    GAL: "Gallons",
    FLOZ: "Fluid Ounces",

    M: "Meters",
    CM: "Centimeters",
    FT: "Feet",
    M2: "Square Meters",
    SQM: "Alternative Square Meters",
  };

  return (
    <div className={styles.selectorContainer}>
      <div className={styles.itemsTable}>
        <GridTable
          styles={styles}
          gridTemplate={gridTemplate}
          columns={columns}
          data={items}
          emptyText="No items found."
          renderRow={({
            image_url,
            usku_id,
            sku_id,
            product_title,
            product_type,
            product_stock,
          }) => (
            <div className={styles.listItem} key={usku_id}>
              <div
                className={clsx(
                  styles.checkBox,
                  usku_id in selectedItems ? styles.checked : null,
                )}
                onClick={() => handleCheckbox(usku_id)}
              ></div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={
                    image_url ? `${url}${JSON.parse(image_url).webp_card}` : ""
                  }
                  alt="product image"
                  height="60px"
                />
              </div>

              <div className={styles.listType}>{sku_id}</div>
              <div className={styles.listMain}>{product_title}</div>
              <div className={styles.listType}>{product_type}</div>
              <div className={styles.listStock}>{product_stock}</div>

              <div
                className={clsx(
                  styles.expStockTd,
                  usku_id in selectedItems ? null : styles.disabledInput,
                )}
              >
                <div className={styles.expStockInput}>
                  <input
                    type="text"
                    disabled={!(usku_id in selectedItems)}
                    value={
                      selectedItems[usku_id]
                        ? selectedItems[usku_id].exp_stock
                        : ""
                    }
                    onChange={(e) =>
                      registerManualStock(usku_id, e.target.value)
                    }
                  />
                </div>
                <div className={styles.expStockButtonsContainer}>
                  <button
                    className={`${styles.expStockInc} ${styles.expStockButton}`}
                    disabled={!(usku_id in selectedItems)}
                    onClick={() => increaseStock(usku_id)}
                  >
                    +
                  </button>
                  <hr />
                  <button
                    className={`${styles.expStockDec} ${styles.expStockButton}`}
                    disabled={!(usku_id in selectedItems)}
                    onClick={() => decreaseStock(usku_id)}
                  >
                    -
                  </button>
                </div>
              </div>

              <select
                name="uom"
                className={styles.uomSelect}
                disabled={!(usku_id in selectedItems)}
                onChange={(e) => setUom(usku_id, e.target.value)}
              >
                {Object.entries(units).map(([key, value]) => (
                  <option value={key} key={key}>
                    {value} -- {key}
                  </option>
                ))}
              </select>

              <input
                type="text"
                onChange={(e) => setPo(usku_id, e.target.value)}
                value={selectedItems[usku_id] ? selectedItems[usku_id].po : ""}
                disabled={!(usku_id in selectedItems)}
                className={selectedItems[usku_id] ? null : styles.disabledInput}
                maxLength={64}
              />
            </div>
          )}
        />
      </div>

      <button
        className={clsx(
          styles.confirmButton,
          Object.keys(selectedItems).length === 0 ? styles.disabledInput : null,
        )}
        onClick={() => onSubmit(selectedItems)}
        disabled={Object.keys(selectedItems).length === 0}
      >
        Confirm Products
      </button>
    </div>
  );
}
