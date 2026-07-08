import { useState, useEffect } from "react";
import styles from "../css/pages/Catalog.module.css";
import { NavLink, Link } from "react-router-dom";
import imageNA from "../assets/icons/imagena.png";

const route = import.meta.env.VITE_BASEAPI;

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    total: 0,
  });

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${route}/catalog`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch catalogs: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data);

      if (response.status === 200) {
        setProducts(data["catalog-list"] || []);
        const count = data.count;
        setStats({
          total: count.total,
          pending: count.pending,
          completed: count.completed,
        });
      } else {
        setError(data.message || "Failed to load catalogs");
        setProducts([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "An error occurred while fetching catalogs");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uskuId) => {
    if (window.confirm("Are you sure you want to delete this catalog?")) {
      // TODO: Implement delete endpoint
      const response = await fetch(`${route}/catalog?usku-id=${uskuId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      console.log("Delete:", uskuId);
      await fetchCatalogs();
    }
  };

  function snakeToPlainText(snake) {
    return snake.charAt(0).toUpperCase() + snake.slice(1).replace("_", " ");
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.header}>
        <h1>Upload Catalog</h1>
        <p>Welcome back! Here's a snapshot of your catalog's performance.</p>
      </div>

      <div className={styles.container}>
        <div className={styles.topActions}>
          <NavLink to="./add-bulk-catalog">
            <button className={`${styles.btn} ${styles.btnPrimary}`}>
              Add Catalog in Bulk
            </button>
          </NavLink>

          <NavLink to="./add-catalog">
            <button className={`${styles.btn} ${styles.btnLight}`}>
              Add Single Catalog
            </button>
          </NavLink>
        </div>

        <div className={styles.cards}>
          <div className={styles.card}>
            <h3>Total Uploaded Catalog</h3>
            <p>{stats.total}</p>
          </div>

          <div className={styles.card}>
            <h3>Pending Uploads</h3>
            <p>{stats.pending}</p>
          </div>

          <div className={styles.card}>
            <h3>Completed Uplaods</h3>
            <p>{stats.completed}</p>
          </div>
        </div>

        <div className={styles.tabs}>
          <a href="#" className={styles.activeTab}>
            All ({stats.total})
          </a>
          <a href="#">Completed ({stats.completed})</a>
          <a href="#">Pending ({stats.pending})</a>
          {/* <a href="#">QC Error (0)</a> */}
          {/* <a href="#">QC Pass (0)</a> */}
          <a href="#">Draft (0)</a>
        </div>

        <div className={styles.filters}>
          <select className={styles.select}>
            <option>Select Category</option>
            <option>Kurta</option>
            <option>Shirt</option>
          </select>

          <input
            className={styles.input}
            type="text"
            placeholder="Search by SKU ID"
          />
        </div>

        {error && (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#ffebee",
              borderRadius: "4px",
              color: "#c62828",
              marginBottom: "16px",
              borderLeft: "4px solid #f44336",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#666",
            }}
          >
            Loading catalogs...
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#999",
            }}
          >
            No catalogs found. Start by adding your first catalog!
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <div className={styles.listHeader}>
                <div className={styles.listImageWrap}></div>
                <div className={styles.listMain}>Product</div>
                <div className={styles.listType}>Type</div>
                <div className={styles.listPrices}>Pricing</div>
                <div
                  className={styles.statusBadge}
                  style={{ background: "transparent" }}
                >
                  Status
                </div>
                <div className={styles.listActions}>Options</div>
              </div>

              <div className={styles.list}>
                {products.map((p, index) => (
                  <div className={styles.listItem} key={p.usku_id || index}>
                    <div className={styles.listImageWrap}>
                      <img
                        className={styles.listImage}
                        src={p.image_url ? `${route}${p.image_url}` : imageNA}
                        alt={p.product_title || "product"}
                      />
                    </div>

                    <div className={styles.listMain}>
                      <div className={styles.listTitle}>
                        {p.product_title || "Untitled"}
                      </div>
                      <div className={styles.listSku}>
                        {p.sku_id || p.usku_id}
                      </div>
                    </div>

                    <div className={styles.listType}>
                      {snakeToPlainText(p.product_type) || "N/A"}
                    </div>

                    <div className={styles.listPrices}>
                      <div className={styles.priceBlock}>
                        <span className={styles.priceLabel}>MRP</span>
                        <span className={styles.priceValue}>
                          Rs {p.price || 0}
                        </span>
                      </div>
                      <div className={styles.priceBlock}>
                        <span className={styles.priceLabel}>Compare</span>
                        <span className={styles.priceValue}>
                          Rs {p.compared_price || 0}
                        </span>
                      </div>
                      <div className={styles.priceBlock}>
                        <span className={styles.priceLabel}>Cost</span>
                        <span className={styles.priceValue}>
                          Rs {p.purchasing_cost || 0}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`${styles.statusBadge} ${
                        p.status === "completed"
                          ? styles.statusCompleted
                          : p.status === "pending"
                            ? styles.statusPending
                            : styles.statusDefault
                      }`}
                    >
                      {p.status}
                    </span>

                    <div className={styles.listActions}>
                      <Link
                        to={`/catalog/edit?id=${p.usku_id}&type=${p.type_id}`}
                        className={styles.edit}
                      >
                        Edit
                      </Link>
                      <button
                        className={styles.delete}
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(p.usku_id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.listFooter}>
              Showing {products.length} out of {stats.total} entries
            </div>
          </>
        )}
      </div>
    </div>
  );
}
