import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProduct } from "../services/catalogService";
import styles from "../css/pages/ProductDetails.module.css";
import imageNA from "../assets/icons/imagena.png"; // Fallback image if needed

const route = import.meta.env.VITE_BASEAPI;

export default function ProductDetails() {
  const { sku_id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const data = await getProduct(sku_id);

        // Handle different response structures gracefully
        if (data && data["catalog-list"] && data["catalog-list"].length > 0) {
          setProduct(data["catalog-list"][0]);
        } else if (data && data.catalog_list && data.catalog_list.length > 0) {
          setProduct(data.catalog_list[0]);
        } else {
          setProduct(data); // Assume it's a flat object as per user's example
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    if (sku_id) {
      fetchProductDetails();
    }
  }, [sku_id]);

  if (loading) {
    return <div className={styles.loading}>Loading product details...</div>;
  }

  if (error || !product) {
    return <div className={styles.error}>{error || "Product not found"}</div>;
  }

  const {
    product_title,
    sku_id: prodSkuId,
    status = "Pending", // mocked if missing
    compared_price,
    price,
    purchasing_cost,
    color,
    brand_name,
    collection_id,
    vendor,
    age_group,
    fabric,
    blouse_fabric,
    blouse_piece_included,
    saree_length_meters,
    blouse_length_meters,
    border_type,
    pallu_type,
    pattern,
    work,
    occasion,
    style,
    stitch,
    set_items_included,
    care,
    ean,
    hsn,
    dead_weight_kg,
    net_weight_kg,
    volumetric_weight_kg,
    image_url,
  } = product;

  const margin = price && purchasing_cost ? price - purchasing_cost : 0;
  const marginPercentage = price ? ((margin / price) * 100).toFixed(1) : 0;
  const discountPercent =
    compared_price && price
      ? Math.round(((compared_price - price) / compared_price) * 100)
      : 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.breadcrumbs}>
          <Link to="/catalog">Catalog</Link> /{" "}
          <Link to="/catalog">Products</Link> / {product_title || "Untitled"}
        </div>

        <div className={styles.titleSection}>
          <div className={styles.titleLeft}>
            <h1 className={styles.title}>
              {product_title || "Untitled Product"}
            </h1>
            <span className={styles.statusBadge}>{status}</span>
            <span className={styles.skuBadge}>{prodSkuId}</span>
          </div>
          <div className={styles.titleRight}>
            <button className={styles.editBtn}>
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Edit product
            </button>
            <button className={styles.moreBtn}>...</button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.topSection}>
          {/* Image Gallery */}
          {image_url && (
            <div className={styles.gallery}>
              <div className={styles.thumbnails}>
                <div className={styles.thumbWrapActive}>
                  <img src={`${route}/${image_url}`} alt="thumb 1" />
                </div>
              </div>
              <div className={styles.mainImage}>
                <img src={`${route}/${image_url}`} alt={product_title} />
              </div>
            </div>
          )}

          {/* Commercial Summary */}
          <div className={styles.commercialSummary}>
            <h2 className={styles.sectionTitle}>Commercial Summary</h2>
            <div className={styles.pricingRow}>
              <div>
                <div className={styles.label}>Current Price</div>
                <div className={styles.valueLarge}>
                  ₹{price ? parseInt(price).toLocaleString("en-IN") : "-"}
                </div>
              </div>
              <div>
                <div className={styles.label}>Compared Price</div>
                <div className={styles.valueStrikethrough}>
                  ₹
                  {compared_price
                    ? parseInt(compared_price).toLocaleString("en-IN")
                    : "-"}
                </div>
              </div>
              {discountPercent > 0 && (
                <div className={styles.discountBadge}>
                  {discountPercent}% OFF
                </div>
              )}
              <div className={styles.divider}></div>
              <div>
                <div className={styles.label}>Purchasing Cost</div>
                <div className={styles.valueMedium}>
                  ₹
                  {purchasing_cost
                    ? parseInt(purchasing_cost).toLocaleString("en-IN")
                    : "-"}
                </div>
              </div>
              <div className={styles.divider}></div>
              <div>
                <div className={styles.label}>Margin</div>
                <div className={styles.valueGreen}>
                  ₹{parseInt(margin).toLocaleString("en-IN")} (
                  {marginPercentage}%)
                </div>
              </div>
            </div>

            <div className={styles.attributesGrid}>
              <div>
                <div className={styles.label}>Color</div>
                <div className={styles.valueWithIcon}>
                  <span
                    className={styles.colorSwatch}
                    style={{ backgroundColor: "#ffbfa8" }}
                  ></span>
                  {color || "-"}
                </div>
              </div>
              <div>
                <div className={styles.label}>Brand</div>
                <div className={styles.value}>{brand_name || "-"}</div>
              </div>
              <div>
                <div className={styles.label}>Status</div>
                <div className={styles.valueStatus}>
                  <span className={styles.statusDotGreen}></span> In Stock
                </div>
              </div>
              <div>
                <div className={styles.label}>Collection</div>
                <div className={styles.value}>{collection_id || "-"}</div>
              </div>
              <div>
                <div className={styles.label}>Vendor</div>
                <div className={styles.value}>{vendor || "-"}</div>
              </div>
              <div>
                <div className={styles.label}>Availability</div>
                <div className={styles.valueStatus}>
                  <span className={styles.statusDotGreen}></span> Available
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          {["Overview"].map((tab) => (
            <button
              key={tab}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Overview" && (
          <>
            {/* Specifications Box */}
            <div className={styles.specsBox}>
              <h2 className={styles.sectionTitle}>Product Specifications</h2>
              <div className={styles.specsGrid}>
                {/* Column 1 */}
                <div className={styles.specsCol}>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Age Group</span>
                    <span className={styles.specValue}>{age_group || "-"}</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Fabric</span>
                    <span className={styles.specValue}>{fabric || "-"}</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Blouse Fabric</span>
                    <span className={styles.specValue}>
                      {blouse_fabric || "-"}
                    </span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>
                      Blouse Piece Included
                    </span>
                    <span className={styles.specValue}>
                      {blouse_piece_included || "-"}
                    </span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Saree Length</span>
                    <span className={styles.specValue}>
                      {saree_length_meters ? `${saree_length_meters} m` : "-"}
                    </span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Blouse Length</span>
                    <span className={styles.specValue}>
                      {blouse_length_meters ? `${blouse_length_meters} m` : "-"}
                    </span>
                  </div>
                </div>
                {/* Column 2 */}
                <div className={styles.specsCol}>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Border Type</span>
                    <span className={styles.specValue}>
                      {border_type || "-"}
                    </span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Pallu Type</span>
                    <span className={styles.specValue}>
                      {pallu_type || "-"}
                    </span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Pattern</span>
                    <span className={styles.specValue}>{pattern || "-"}</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Work</span>
                    <span className={styles.specValue}>{work || "-"}</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Occasion</span>
                    <span className={styles.specValue}>{occasion || "-"}</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Style</span>
                    <span className={styles.specValue}>{style || "-"}</span>
                  </div>
                </div>
                {/* Column 3 */}
                <div className={styles.specsCol}>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Stitch</span>
                    <span className={styles.specValue}>{stitch || "-"}</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Set Items</span>
                    <span className={styles.specValue}>
                      {set_items_included || "-"}
                    </span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Care</span>
                    <span className={styles.specValue}>{care || "-"}</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>EAN</span>
                    <span className={styles.specValue}>{ean || "-"}</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>HSN</span>
                    <span className={styles.specValue}>
                      {hsn || "Not assigned"}
                    </span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Dead Weight</span>
                    <span className={styles.specValue}>
                      {dead_weight_kg ? `${dead_weight_kg} kg` : "-"}
                    </span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Net Weight</span>
                    <span className={styles.specValue}>
                      {net_weight_kg ? `${net_weight_kg} kg` : "-"}
                    </span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Volumetric Weight</span>
                    <span className={styles.specValue}>
                      {volumetric_weight_kg
                        ? `${volumetric_weight_kg} kg`
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Cards */}
            <div className={styles.bottomCardsGrid}>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Pricing & Cost
                </h3>
                <div className={styles.cardContent}>
                  <div className={styles.cardRow}>
                    <span>Selling Price</span>
                    <span className={styles.boldText}>
                      ₹{price ? parseInt(price).toLocaleString("en-IN") : "-"}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span>Compared Price</span>
                    <span className={styles.boldText}>
                      ₹
                      {compared_price
                        ? parseInt(compared_price).toLocaleString("en-IN")
                        : "-"}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span>Purchasing Cost</span>
                    <span className={styles.boldText}>
                      ₹
                      {purchasing_cost
                        ? parseInt(purchasing_cost).toLocaleString("en-IN")
                        : "-"}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span>Margin</span>
                    <span className={styles.greenText}>
                      ₹{parseInt(margin).toLocaleString("en-IN")} (
                      {marginPercentage}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  Product Identifiers
                </h3>
                <div className={styles.cardContent}>
                  <div className={styles.cardRow}>
                    <span>SKU</span>
                    <span className={styles.boldText}>{prodSkuId}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span>EAN</span>
                    <span className={styles.boldText}>{ean || "-"}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span>HSN</span>
                    <span className={styles.fadedText}>
                      {hsn || "Not assigned"}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.cardSync}>
                <h3 className={styles.cardTitle}>
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Channel Sync
                </h3>
                <p className={styles.syncDesc}>
                  This product can be synced across your connected sales
                  channels.
                </p>
                <div className={styles.syncGrid}>
                  <div className={styles.syncItem}>
                    <div
                      className={styles.syncIconBox}
                      style={{ backgroundColor: "#000", color: "#fff" }}
                    >
                      a
                    </div>
                    <span>Amazon</span>
                    <span className={styles.syncStatusNot}>
                      <span className={styles.dotGrey}></span> Not synced
                    </span>
                  </div>
                  <div className={styles.syncItem}>
                    <div
                      className={styles.syncIconBox}
                      style={{ backgroundColor: "#95bf47", color: "#fff" }}
                    >
                      s
                    </div>
                    <span>Shopify</span>
                    <span className={styles.syncStatusNot}>
                      <span className={styles.dotGrey}></span> Not synced
                    </span>
                  </div>
                  <div className={styles.syncItem}>
                    <div
                      className={styles.syncIconBox}
                      style={{ backgroundColor: "#ffc107", color: "#000" }}
                    >
                      f
                    </div>
                    <span>Flipkart</span>
                    <span className={styles.syncStatusNot}>
                      <span className={styles.dotGrey}></span> Not synced
                    </span>
                  </div>
                  <div className={styles.syncItem}>
                    <div
                      className={styles.syncIconBox}
                      style={{ backgroundColor: "#0d6efd", color: "#fff" }}
                    >
                      w
                    </div>
                    <span>Website</span>
                    <span className={styles.syncStatusNot}>
                      <span className={styles.dotGrey}></span> Not synced
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
