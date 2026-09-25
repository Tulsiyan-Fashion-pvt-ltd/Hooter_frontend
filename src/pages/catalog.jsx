import { useState, useEffect } from "react";
import styles from "../css/pages/Catalog.module.css";
import { Link } from "react-router-dom";
import imageNA from "../assets/icons/imagena.png";
import { getProducts, deleteProduct, getUploadedCategories } from "../services/catalogService";
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
  const [searchSku, setSearchSku] = useState("");
  const [uploadedCategories, setUploadedCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

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

      const [data, catData] = await Promise.all([
        getProducts(),
        getUploadedCategories().catch(e => { console.error(e); return { categories: [] }; })
      ]);

      setProducts(data.catalog_list || []);
      setUploadedCategories(catData.categories || []);
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
      setSelectedProducts(filteredProducts.map((p) => p.usku_id));
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

  // Filter logic
  const filteredProducts = products.filter((p) => {
    // Search filter
    if (searchSku.trim()) {
      const q = searchSku.toLowerCase().trim();
      const matchSku = (p.sku_id || "").toLowerCase().includes(q) || (p.usku_id || "").toLowerCase().includes(q);
      const matchTitle = (p.product_title || "").toLowerCase().includes(q);
      if (!matchSku && !matchTitle) return false;
    }

    // Tab filter
    if (activeTab !== "All") {
      const status = (p.status || "").toLowerCase();
      if (activeTab === "QC in progress" && status !== "qc in progress" && status !== "pending") return false;
      if (activeTab === "QC pass" && status !== "qc pass" && status !== "completed") return false;
      if (activeTab === "QC error" && status !== "qc error") return false;
      if (activeTab === "Draft" && status !== "draft") return false;
      if (activeTab === "Action required" && status !== "action required") return false;
    }

    // Category filter
    if (activeCategory !== "All") {
      const pCategory = snakeToPlainText(p.product_type) || "Kurta";
      if (pCategory !== activeCategory) return false;
    }

    return true;
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + rowsPerPage);

  const tabs = [
    { label: "All", count: stats.total || products.length },
    { label: "Action required", count: 0 },
    { label: "QC in progress", count: stats.pending || 10 },
    { label: "QC error", count: 5 },
    { label: "QC pass", count: stats.completed || 7 },
    { label: "Draft", count: 11 },
  ];

  return (
    <div className={styles.mainContainer}>
      {/* Top Banner / Actions Header (Simple, no dark background) */}
      <div className={styles.pageHeaderBanner}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageBannerTitle}>Upload catalog</h1>
          <p className={styles.pageBannerSubtitle}>
            Welcome back, Sarah. Here's a snapshot of your catalog activity across all marketplaces.
          </p>
        </div>
        <div className={styles.pageHeaderActions}>
          <Link to="/catalog/add-catalog" className={styles.btnSecondaryOutline}>
            <span className={styles.btnIcon}>+</span> Add single catalog
          </Link>
          <Link to="/catalog/add-bulk-catalog" className={styles.btnPrimarySolid}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Add catalog in bulk</span>
          </Link>
        </div>
      </div>

      
      <div className={styles.pageBody}>
        {/* Overview Header */}
        <h2 className={styles.overviewHeading}>Overview</h2>

        {/* Top Metric Cards */}
        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.cardTitle}>Total uploads done</span>
              <div className={`${styles.cardIconBox} ${styles.iconBoxBlue}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
            </div>
            <div className={styles.cardValue}>{stats.total || 26}</div>
            <div className={styles.cardSubtitle}>Since Jan 1, 2026</div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.cardTitle}>Bulk uploads</span>
              <div className={`${styles.cardIconBox} ${styles.iconBoxPurple}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
            </div>
            <div className={styles.cardValue}>{stats.pending || 14}</div>
            <div className={styles.cardSubtitle}>Since Jan 1, 2026</div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.cardTitle}>Single uploads</span>
              <div className={`${styles.cardIconBox} ${styles.iconBoxGreen}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
            </div>
            <div className={styles.cardValue}>{stats.completed || 12}</div>
            <div className={styles.cardSubtitle}>Since Jan 1, 2026</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className={styles.topNav}>
          <div className={styles.tabs}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.label;
              return (
                <button
                  key={tab.label}
                  type="button"
                  className={`${styles.tab} ${isActive ? styles.activeTab : ""}`}
                  onClick={() => {
                    setActiveTab(tab.label);
                    setCurrentPage(1);
                  }}
                >
                  <span>{tab.label}</span>
                  <span className={`${styles.tabCount} ${isActive ? styles.tabCountActive : ""}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
            <div style={{ position: "relative", display: "inline-block" }}>
              <select 
                className={styles.dropdownBtn}
                style={{ appearance: "none", paddingRight: "28px", cursor: "pointer", outline: "none" }}
                value={activeCategory}
                onChange={(e) => {
                  setActiveCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">Category (All)</option>
                {uploadedCategories.map((cat) => (
                  <option key={cat.id} value={cat.category}>{cat.category}</option>
                ))}
              </select>
              <svg style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#64748b" }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>

          <div className={styles.filtersRight}>
            <div className={styles.searchBox}>
              <SearchIcon />
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Search by SKU ID" 
                value={searchSku}
                onChange={(e) => {
                  setSearchSku(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button className={styles.exportBtn}>
              <DownloadIcon /> Export
            </button>
          </div>
        </div>

        {error && <div className={styles.errorState}>{error}</div>}

        {/* Table Area */}
        <div className={styles.tableWrapper}>
          {/* Selection Action Bar */}
          {selectedProducts.length > 0 && (
            <div className={styles.selectionBar}>
              <div className={styles.selectionText}>{selectedProducts.length} products selected</div>
              <div className={styles.selectionActions}>
                <button className={styles.actionBtn}>Activate</button>
                <button className={styles.actionBtn}>Pause</button>
                <button className={styles.actionBtn}>Assign category</button>
                <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} onClick={openBulkDeleteModal}>Delete</button>
              </div>
            </div>
          )}

          {/* Table Header */}
          <div className={`${styles.listHeader} ${selectedProducts.length > 0 ? styles.listHeaderWithSelection : ""}`}>
            <div className={styles.checkboxCell}>
              <input 
                type="checkbox" 
                className={styles.checkbox}
                checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                onChange={toggleSelectAll}
              />
            </div>
            <div>PRODUCT</div>
            <div>CATEGORY</div>
            <div>MRP</div>
            <div>MARKETPLACES</div>
            <div className={styles.headerSortable}>
              <span>STATUS</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#2563eb" stroke="#2563eb" strokeWidth="1">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </div>
            <div className={styles.headerSortable}>
              <span>UPDATED</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#9ca3af" stroke="#9ca3af" strokeWidth="1">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </div>
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
                
                // Color dots matching design mockups:
                // Kurta 1: blue, pink, amber
                // Kurta 2: amber, green
                // Kurta 3: pink
                // Jacket 1: pink, amber
                // Jacket 2: blue
                // Kurta set: blue, pink, amber
                // Shoes: pink
                // Loafers: purple
                const marketplaceColorSets = [
                  ["#3b82f6", "#ec4899", "#f59e0b"],
                  ["#f59e0b", "#22c55e"],
                  ["#ec4899"],
                  ["#ec4899", "#f59e0b"],
                  ["#3b82f6"],
                  ["#3b82f6", "#ec4899", "#f59e0b"],
                  ["#ec4899"],
                  ["#a855f7"]
                ];
                const marketplaceColors = marketplaceColorSets[index % marketplaceColorSets.length];
                
                // Color swatches to match mockup items if image not present
                const mockImageColors = [
                  "#991b1b", // red casual kurta
                  "#166534", // forest green kurta
                  "#93c5fd", // sky blue linen kurta
                  "#171717", // classic zipper jacket
                  "#1e3a8a", // slim fit denim jacket
                  "#e7dec8", // cotton kurta set - beige
                  "#1e293b", // navy running shoes
                  "#785338"  // suede loafers - tan
                ];
                const imgColor = mockImageColors[index % mockImageColors.length];

                return (
                  <div className={`${styles.listItem} ${isSelected ? styles.listItemSelected : ""}`} key={p.usku_id || index}>
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
                    
                    <div className={styles.cellPrice}>
                      ₹{p.price ? parseInt(p.price).toLocaleString('en-IN') : "1,299"}
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
        {filteredProducts.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.footerLeft}>
              <div className={styles.rowsSelector}>
                <span>Rows per page</span>
                <div className={styles.rowSelectWrap}>
                  <select 
                    className={styles.rowSelect} 
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
                  <svg className={styles.rowSelectArrow} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>
              <div className={styles.showingText}>
                Showing {filteredProducts.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + rowsPerPage, filteredProducts.length)} of {filteredProducts.length}
              </div>
            </div>
            
            <div className={styles.pagination}>
              <button 
                className={styles.pageArrowBtn} 
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
                className={styles.pageArrowBtn} 
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
