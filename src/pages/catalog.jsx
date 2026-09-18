import { useState, useEffect } from "react";
import styles from "../css/pages/Catalog.module.css";
import { Link } from "react-router-dom";
import imageNA from "../assets/icons/imagena.png";
import { getProducts, deleteProduct } from "../services/catalogService";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

const route = import.meta.env.VITE_BASEAPI;

// SVG Icons
const SearchIcon = () => (
  <svg className={styles.searchIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    total: 0,
  });

  // Table State
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [activeTab, setActiveTab] = useState("All");

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    target: null, // { type: 'single', product: {...} } | { type: 'bulk', count: number }
    isLoading: false,
    error: "",
  });

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();

      setProducts(data.catalog_list || []);
      const count = data.count || {};
      setStats({
        total: count.total || 0,
        pending: count.pending || 0,
        completed: count.completed || 0,
      });
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "An error occurred while fetching catalogs");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const openSingleDeleteModal = (product) => {
    setDeleteModal({
      isOpen: true,
      target: { type: "single", product },
      isLoading: false,
      error: "",
    });
  };

  const openBulkDeleteModal = () => {
    if (selectedProducts.length === 0) return;
    setDeleteModal({
      isOpen: true,
      target: { type: "bulk", count: selectedProducts.length },
      isLoading: false,
      error: "",
    });
  };

  const closeDeleteModal = () => {
    if (deleteModal.isLoading) return;
    setDeleteModal({
      isOpen: false,
      target: null,
      isLoading: false,
      error: "",
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.target) return;
    setDeleteModal((prev) => ({ ...prev, isLoading: true, error: "" }));

    try {
      if (deleteModal.target.type === "single") {
        const uskuId = deleteModal.target.product.usku_id;
        await deleteProduct(uskuId);
        setSelectedProducts((prev) => prev.filter((id) => id !== uskuId));
      } else if (deleteModal.target.type === "bulk") {
        // Delete selected products sequentially
        for (const uskuId of selectedProducts) {
          try {
            await deleteProduct(uskuId);
          } catch (e) {
            console.error(`Failed to delete ${uskuId}:`, e);
          }
        }
        setSelectedProducts([]);
      }

      await fetchCatalogs();
      closeDeleteModal();
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteModal((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || "Failed to delete product.",
      }));
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map((p) => p.usku_id));
    } else {
      setSelectedProducts([]);
    }
  };

  const toggleSelect = (uskuId) => {
    setSelectedProducts((prev) =>
      prev.includes(uskuId)
        ? prev.filter((id) => id !== uskuId)
        : [...prev, uskuId]
    );
  };

  function snakeToPlainText(snake) {
    if (!snake) return "";
    return snake.charAt(0).toUpperCase() + snake.slice(1).replace("_", " ");
  }

  // Helper for mock date based on ID length or just fallback
  const getMockDate = (index) => {
    const dates = ["Fri, Sep 12 2026", "Thu, Sep 11 2026", "Wed, Sep 10 2026", "Tue, Sep 9 2026"];
    return dates[index % dates.length];
  };

  // Helper to map status to specific style classes and text
  const getStatusDisplay = (statusStr) => {
    const status = statusStr?.toLowerCase() || "draft";
    switch (status) {
      case "active":
      case "completed":
        return { text: "Active", className: styles.statusActive };
      case "paused":
        return { text: "Paused", className: styles.statusPaused };
      case "qc in progress":
      case "pending":
        return { text: "QC in progress", className: styles.statusQcInProgress };
      case "qc error":
        return { text: "QC error", className: styles.statusQcError };
      case "qc pass":
        return { text: "QC pass", className: styles.statusQcPass };
      default:
        return { text: "Draft", className: styles.statusDraft };
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(products.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + rowsPerPage);

  const tabs = [
    { label: "All", count: stats.total },
    { label: "Action required", count: 0 },
    { label: "QC in progress", count: stats.pending },
    { label: "QC error", count: 0 },
    { label: "QC pass", count: stats.completed },
    { label: "Draft", count: 0 },
  ];

  return (
    <div className={styles.mainContainer}>
      <div className={styles.container}>
        
        {/* Top Stats Cards */}
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
            <h3>Completed Uploads</h3>
            <p>{stats.completed}</p>
          </div>
        </div>

        {/* Top Navigation & Filters */}
        <div className={styles.topNav}>
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <div
                key={tab.label}
                className={`${styles.tab} ${activeTab === tab.label ? styles.activeTab : ""}`}
                onClick={() => setActiveTab(tab.label)}
              >
                {tab.label}
                <span className={styles.tabCount}>{tab.count}</span>
              </div>
            ))}
          </div>
          <div className={styles.filters}>
            <select className={styles.select}>
              <option>Category</option>
              <option>Kurta</option>
              <option>Shirt</option>
            </select>
            <select className={styles.select}>
              <option>Marketplace</option>
              <option>All</option>
            </select>
            <div className={styles.searchBox}>
              <SearchIcon />
              <input type="text" className={styles.input} placeholder="Search by SKU ID" />
            </div>
            <button className={styles.exportBtn}>
              <DownloadIcon /> Export
            </button>
          </div>
        </div>

        {error && <div className={styles.errorState}>{error}</div>}

        {/* Table Area */}
        <div className={`${styles.tableWrapper} ${selectedProducts.length > 0 ? styles.tableWrapperHasSelection : ""}`}>
          
          {/* Selection Action Bar */}
          {selectedProducts.length > 0 && (
            <div className={styles.selectionBar}>
              <div className={styles.selectionText}>{selectedProducts.length} products selected</div>
              <div className={styles.selectionActions}>
                <button className={styles.actionBtn}>Activate</button>
                <button className={styles.actionBtn}>Pause</button>
                <button className={styles.actionBtn}>Assign category</button>
                <button className={styles.actionBtn} onClick={openBulkDeleteModal}>Delete</button>
              </div>
            </div>
          )}

          {/* Table Header */}
          <div className={styles.listHeader}>
            <div className={styles.checkboxCell}>
              <input 
                type="checkbox" 
                className={styles.checkbox}
                checked={selectedProducts.length === products.length && products.length > 0}
                onChange={toggleSelectAll}
              />
            </div>
            <div>PRODUCT</div>
            <div>CATEGORY</div>
            <div>MRP</div>
            <div>MARKETPLACES</div>
            <div>STATUS</div>
            <div>UPDATED</div>
            <div style={{textAlign: "right"}}>ACTIONS</div>
          </div>

          {loading ? (
            <div className={styles.emptyState}>Loading catalogs...</div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>No products found.</div>
          ) : (
            <div className={styles.list}>
              {currentProducts.map((p, index) => {
                const isSelected = selectedProducts.includes(p.usku_id);
                const statusInfo = getStatusDisplay(p.status);
                // Assigning random colors for marketplace dots
                const marketplaceColors = [
                  ["#3b82f6", "#ef4444", "#f59e0b"],
                  ["#22c55e", "#eab308"],
                  ["#ec4899"],
                  ["#f59e0b", "#ef4444"],
                  ["#8b5cf6"]
                ][index % 5];
                
                // Color box for images (to match UI exactly if images are missing)
                const mockImageColors = ["#991b1b", "#166534", "#93c5fd", "#171717", "#1e3a8a", "#f3e8ff", "#451a03"];
                const imgColor = mockImageColors[index % mockImageColors.length];

                return (
                  <div className={styles.listItem} key={p.usku_id || index}>
                    <div className={styles.checkboxCell}>
                      <input 
                        type="checkbox" 
                        className={styles.checkbox}
                        checked={isSelected}
                        onChange={() => toggleSelect(p.usku_id)}
                      />
                    </div>
                    
                    <div className={styles.productCell}>
                      <div className={styles.productImageWrap}>
                        {p.image_url ? (
                          <img
                            className={styles.productImage}
                            src={`${route}${p.image_url}`}
                            alt={p.product_title || "product"}
                          />
                        ) : (
                          <div className={styles.colorBox} style={{ backgroundColor: imgColor }}></div>
                        )}
                      </div>
                      <div className={styles.productDetails}>
                        <span className={styles.productTitle}>{p.product_title || "Untitled Product"}</span>
                        <span className={styles.productSku}>#{p.sku_id || p.usku_id}</span>
                      </div>
                    </div>
                    
                    <div className={styles.cellText}>
                      <span className={styles.categoryTag}>
                        {snakeToPlainText(p.product_type) || "Kurta"}
                      </span>
                    </div>
                    
                    <div className={styles.cellText}>
                      ₹{p.price ? parseInt(p.price).toLocaleString('en-IN') : "0"}
                    </div>
                    
                    <div className={styles.marketplacesCell}>
                      {marketplaceColors.map((color, i) => (
                        <div key={i} className={styles.dot} style={{ backgroundColor: color }}></div>
                      ))}
                    </div>
                    
                    <div>
                      <span className={`${styles.statusBadge} ${statusInfo.className}`}>
                        <div className={styles.statusDot}></div>
                        {statusInfo.text}
                      </span>
                    </div>
                    
                    <div className={styles.cellText}>
                      {getMockDate(index)}
                    </div>
                    
                    <div className={styles.actionsCell}>
                      <Link
                        to={`/catalog/edit?id=${p.usku_id}&type=${p.type_id}&vertical=${p.vertical}`}
                        className={styles.iconBtn}
                        title="Edit"
                      >
                        <EditIcon />
                      </Link>
                      <button
                        className={styles.iconBtn}
                        onClick={(e) => {
                          e.preventDefault();
                          openSingleDeleteModal(p);
                        }}
                        title="Delete"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer / Pagination */}
        {products.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.footerLeft}>
              <div className={styles.rowsSelector}>
                Rows per page 
                <select 
                  className={styles.select} 
                  style={{ padding: "4px 24px 4px 8px" }}
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={8}>8</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>
              <div>
                Showing {Math.min(startIndex + 1, products.length)}–{Math.min(startIndex + rowsPerPage, products.length)} of {products.length}
              </div>
            </div>
            
            <div className={styles.pagination}>
              <button 
                className={styles.pageBtn} 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeftIcon />
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i} 
                  className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.pageActive : ""}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                className={styles.pageBtn} 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={
          deleteModal.target?.type === "bulk"
            ? `Delete ${deleteModal.target.count} products?`
            : `Delete "${deleteModal.target?.product?.product_title || deleteModal.target?.product?.usku_id}"?`
        }
        subtitle={
          deleteModal.target?.type === "bulk"
            ? "This will remove all selected products from your catalog listing."
            : `Unique SKU ID: ${deleteModal.target?.product?.usku_id}`
        }
        warningHighlight="Anything already deleted cannot be recovered."
        warningNote="This catalog item will be permanently deleted and removed from syncing across marketplaces."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteModal.isLoading}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}
