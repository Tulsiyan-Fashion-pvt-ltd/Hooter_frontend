import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getProduct,
  getProductImages,
  updateProduct,
  uploadProductImages,
} from "../services/catalogService";
import useToast from "../hooks/useToast";
import Toast from "../components/Toast";
import styles from "../css/pages/ProductDetails.module.css";

const route = import.meta.env.VITE_BASEAPI;

const resolveImageUrl = (path) => {
  if (!path || typeof path !== "string") return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  const cleanBase = (route || "").replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return cleanBase ? `${cleanBase}/${cleanPath}` : `/${cleanPath}`;
};

const normalizeProductImages = (data) => {
  if (!data) return [];

  const processImageEntry = (entry, key = "") => {
    if (!entry) return null;

    if (typeof entry === "string") {
      const full = resolveImageUrl(entry);
      return {
        id: key || full,
        type: key,
        order: 0,
        mainUrl: full,
        thumbUrl: full,
        originalUrl: full,
      };
    }

    const order = Number(entry.image_order ?? entry.order ?? 0);
    const urls = entry.image_urls || entry;

    if (typeof urls === "string") {
      const full = resolveImageUrl(urls);
      return {
        id: key || full,
        type: entry.image_type || key,
        order,
        mainUrl: full,
        thumbUrl: full,
        originalUrl: full,
      };
    }

    if (urls && typeof urls === "object") {
      const highResol = resolveImageUrl(
        urls.high_resol_webp || urls.high_resol,
      );
      const lowResol = resolveImageUrl(urls.low_resol_webp || urls.low_resol);
      const original = resolveImageUrl(urls.original);
      const webpCard = resolveImageUrl(urls.webp_card);

      const mainUrl = highResol || webpCard || original || lowResol;
      const thumbUrl = lowResol || webpCard || highResol || original;
      const originalUrl = original || highResol || webpCard || mainUrl;

      if (!mainUrl && !thumbUrl) return null;

      return {
        id: entry.id || key || mainUrl,
        type: entry.image_type || key || "image",
        order,
        mainUrl,
        thumbUrl,
        originalUrl,
      };
    }

    return null;
  };

  const results = [];

  if (Array.isArray(data)) {
    data.forEach((item, idx) => {
      const parsed = processImageEntry(item, item.image_type || `image_${idx}`);
      if (parsed) results.push(parsed);
    });
  } else if (data && typeof data === "object") {
    if (data.image_urls && !Array.isArray(data.image_urls)) {
      const parsed = processImageEntry(data, data.image_type || "default");
      if (parsed) results.push(parsed);
    } else if (Array.isArray(data.images)) {
      data.images.forEach((item, idx) => {
        const parsed = processImageEntry(
          item,
          item.image_type || `image_${idx}`,
        );
        if (parsed) results.push(parsed);
      });
    } else if (Array.isArray(data.image_urls)) {
      data.image_urls.forEach((item, idx) => {
        const parsed = processImageEntry(
          item,
          item.image_type || `image_${idx}`,
        );
        if (parsed) results.push(parsed);
      });
    } else {
      Object.entries(data).forEach(([key, val]) => {
        if (val && typeof val === "object") {
          const parsed = processImageEntry(val, key);
          if (parsed) results.push(parsed);
        }
      });
    }
  }

  results.sort((a, b) => a.order - b.order);
  return results;
};

export default function ProductDetails() {
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(
    searchParams.get("edit") === "true",
  );
  const [saving, setSaving] = useState(false);
  const [newImageFiles, setNewImageFiles] = useState({});
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const { toast, showToast } = useToast();

  const uskuId = searchParams.get("usku-id") || searchParams.get("id");

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const data = await getProduct(uskuId);
        let prod = null;
        if (data && data["catalog-list"] && data["catalog-list"].length > 0) {
          prod = data["catalog-list"][0];
        } else if (data && data.catalog_list && data.catalog_list.length > 0) {
          prod = data.catalog_list[0];
        } else {
          prod = data;
        }

        if (prod) {
          const flat = { ...prod };
          if (prod.listing_attributes) {
            Object.assign(flat, prod.listing_attributes);
          }
          if (prod.category_attributes) {
            Object.assign(flat, prod.category_attributes);
          }
          setProduct(flat);
          setFormData(flat);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    if (uskuId) {
      fetchProductDetails();
    }
  }, [uskuId]);

  useEffect(() => {
    const fetchImages = async () => {
      if (!uskuId) return;

      try {
        setImagesLoading(true);
        let data = null;

        try {
          data = await getProductImages(uskuId);
        } catch (err) {
          try {
            data = await getProductImages(uskuId, "front");
          } catch {
            data = null;
          }
        }

        let parsed = normalizeProductImages(data);

        // Fallback to product.image_url if endpoint had no images
        if (parsed.length === 0 && product?.image_url) {
          parsed = normalizeProductImages(product.image_url);
        }

        setImages(parsed);
        setSelectedImageIndex(0);
      } catch (err) {
        console.error("Failed to load product images:", err);
        if (product?.image_url) {
          setImages(normalizeProductImages(product.image_url));
        } else {
          setImages([]);
        }
      } finally {
        setImagesLoading(false);
      }
    };

    fetchImages();
  }, [uskuId, product?.usku_id, product?.sku_id, product?.image_url]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setFormData({ ...product });
    setNewImageFiles({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({ ...product });
    setNewImageFiles({});
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const imageType =
      images[selectedImageIndex]?.type || `image_${selectedImageIndex || 1}`;

    setNewImageFiles((prev) => ({
      ...prev,
      [imageType]: { image: file, order: selectedImageIndex + 1 || 1 },
    }));

    setImages((prev) => {
      const updated = [...prev];
      if (updated[selectedImageIndex]) {
        updated[selectedImageIndex] = {
          ...updated[selectedImageIndex],
          mainUrl: url,
          thumbUrl: url,
          originalUrl: url,
        };
      } else {
        updated.push({
          id: imageType,
          type: imageType,
          order: 1,
          mainUrl: url,
          thumbUrl: url,
          originalUrl: url,
        });
      }
      return updated;
    });

    showToast("Image selected. Click 'Save changes' to update.", "green");
  };

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);

      const activeUskuId = uskuId || formData.usku_id || formData.sku_id;
      const activeTypeId =
        formData.type_id ||
        formData.category_id ||
        formData.type ||
        product?.type_id ||
        product?.category_id ||
        product?.type ||
        searchParams.get("type") ||
        searchParams.get("type-id") ||
        "";

      if (!activeUskuId) {
        throw new Error("Universal SKU ID is missing.");
      }

      const numericFields = new Set([
        "price",
        "compared_price",
        "purchasing_cost",
        "net_weight_kg",
        "dead_weight_kg",
        "volumetric_weight_kg",
        "saree_length_meters",
        "blouse_length_meters",
      ]);

      const fixedKeys = new Set([
        "sku_id",
        "product_title",
        "product_desc",
        "description",
        "price",
        "compared_price",
        "purchasing_cost",
        "vendor",
        "ean",
        "hsn",
        "net_weight_kg",
        "dead_weight_kg",
        "volumetric_weight_kg",
        "brand_name",
      ]);

      const listingAttributes = {};
      const categoryAttributesPayload = {};

      fixedKeys.forEach((key) => {
        const val = formData[key];
        if (val !== undefined && val !== null && val !== "") {
          if (numericFields.has(key) && !isNaN(Number(val))) {
            listingAttributes[key] = Number(val);
          } else {
            listingAttributes[key] = val;
          }
        }
      });

      const ignoredKeys = new Set([
        ...fixedKeys,
        "discount",
        "category_id",
        "type_id",
        "type",
        "id",
        "usku_id",
        "created_at",
        "updated_at",
        "image_urls",
        "image_url",
        "images",
        "vertical",
        "channel_sync",
        "stock_status",
        "availability",
        "count",
        "catalog_list",
        "catalog-list",
        "listing_attributes",
        "category_attributes",
      ]);

      Object.entries(formData).forEach(([k, v]) => {
        if (!ignoredKeys.has(k) && v !== undefined && v !== null && v !== "") {
          if (numericFields.has(k) && !isNaN(Number(v))) {
            categoryAttributesPayload[k] = Number(v);
          } else {
            categoryAttributesPayload[k] = v;
          }
        }
      });

      await updateProduct(
        activeUskuId,
        activeTypeId,
        listingAttributes,
        categoryAttributesPayload,
      );

      if (Object.keys(newImageFiles).length > 0) {
        try {
          await uploadProductImages(activeUskuId, newImageFiles);
        } catch (imgErr) {
          console.warn("Image upload warning:", imgErr);
        }
      }

      setProduct((prev) => ({
        ...prev,
        ...formData,
      }));
      setNewImageFiles({});
      setIsEditing(false);
      showToast("Product details updated successfully!", "green");
    } catch (err) {
      console.error("Failed to update product:", err);
      showToast(err.message || "Failed to update product.", "red");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading product details...</div>;
  }

  if (error || !product) {
    return <div className={styles.error}>{error || "Product not found"}</div>;
  }

  const displayData = isEditing ? formData : product;

  const {
    product_title,
    sku_id: prodSkuId,
    status = "Pending",
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
    stock_status = "In Stock",
    availability = "Available",
    product_desc,
    description,
  } = displayData;

  const currentImage = images[selectedImageIndex] || images[0] || null;

  const currentPriceNum = price ? Number(price) : 0;
  const purchasingCostNum = purchasing_cost ? Number(purchasing_cost) : 0;
  const comparedPriceNum = compared_price ? Number(compared_price) : 0;

  const margin =
    currentPriceNum && purchasingCostNum
      ? currentPriceNum - purchasingCostNum
      : 0;
  const marginPercentage = currentPriceNum
    ? ((margin / currentPriceNum) * 100).toFixed(1)
    : 0;
  const discountPercent =
    comparedPriceNum && currentPriceNum && comparedPriceNum > currentPriceNum
      ? Math.round(
          ((comparedPriceNum - currentPriceNum) / comparedPriceNum) * 100,
        )
      : 0;

  const KNOWN_KEYS = new Set([
    "product_title",
    "product_desc",
    "description",
    "sku_id",
    "usku_id",
    "status",
    "compared_price",
    "price",
    "purchasing_cost",
    "discount",
    "color",
    "brand_name",
    "collection_id",
    "vendor",
    "age_group",
    "fabric",
    "blouse_fabric",
    "blouse_piece_included",
    "saree_length_meters",
    "blouse_length_meters",
    "border_type",
    "pallu_type",
    "pattern",
    "work",
    "occasion",
    "style",
    "stitch",
    "set_items_included",
    "care",
    "ean",
    "hsn",
    "dead_weight_kg",
    "net_weight_kg",
    "volumetric_weight_kg",
    "stock_status",
    "availability",
    "id",
    "type_id",
    "type",
    "category_id",
    "vertical",
    "image_url",
    "image_urls",
    "images",
    "created_at",
    "updated_at",
    "count",
    "catalog_list",
    "catalog-list",
    "channel_sync",
    "listing_attributes",
    "category_attributes",
  ]);

  const extraAttributeKeys = Object.keys(displayData).filter(
    (key) => !KNOWN_KEYS.has(key) && typeof displayData[key] !== "object",
  );

  const renderSpecRow = (label, fieldKey, type = "text", unit = "") => {
    return (
      <div className={styles.specRow} key={fieldKey}>
        <span className={styles.specLabel}>{label}</span>
        {isEditing ? (
          fieldKey === "blouse_piece_included" ? (
            <select
              className={styles.editSpecSelect}
              value={formData[fieldKey] || ""}
              onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          ) : (
            <div className={styles.specInputWrap}>
              <input
                type={type}
                step={type === "number" ? "0.01" : undefined}
                className={styles.editSpecInput}
                value={formData[fieldKey] ?? ""}
                onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}`}
              />
              {unit && <span className={styles.unitBadge}>{unit}</span>}
            </div>
          )
        ) : (
          <span className={styles.specValue}>
            {product[fieldKey] !== undefined &&
            product[fieldKey] !== null &&
            product[fieldKey] !== ""
              ? `${product[fieldKey]}${unit ? ` ${unit}` : ""}`
              : "-"}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.titleLeft}>
            {isEditing ? (
              <input
                type="text"
                className={styles.titleInput}
                value={formData.product_title || ""}
                onChange={(e) =>
                  handleInputChange("product_title", e.target.value)
                }
                placeholder="Product Title"
              />
            ) : (
              <h1 className={styles.title}>
                {product_title || "Untitled Product"}
              </h1>
            )}

            <span className={styles.statusBadge}>{status}</span>

            {isEditing ? (
              <input
                type="text"
                className={styles.skuInput}
                value={formData.sku_id || ""}
                onChange={(e) => handleInputChange("sku_id", e.target.value)}
                placeholder="SKU ID"
                title="SKU ID"
              />
            ) : (
              <span className={styles.skuBadge}>{prodSkuId}</span>
            )}
          </div>
          <div className={styles.titleRight}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className={styles.buttonSpinner}></span>
                      Saving...
                    </>
                  ) : (
                    <>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                className={styles.editBtn}
                onClick={handleStartEdit}
              >
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
            )}
          </div>
        </div>

        {isEditing && (
          <div className={styles.editingBanner}>
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>
              <strong>Edit Mode:</strong> Modify any product fields directly.
              Click <strong>Save changes</strong> to update the catalog without
              leaving the page.
            </span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.topSection}>
          {/* Image Gallery */}
          {images.length > 0 && currentImage ? (
            <div className={styles.gallery}>
              {images.length > 1 && (
                <div className={styles.thumbnails}>
                  {images.map((img, idx) => (
                    <div
                      key={img.id || idx}
                      className={
                        selectedImageIndex === idx
                          ? styles.thumbWrapActive
                          : styles.thumbWrap
                      }
                      onClick={() => setSelectedImageIndex(idx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setSelectedImageIndex(idx);
                        }
                      }}
                      title={
                        img.type
                          ? `View ${img.type} image`
                          : `View image ${idx + 1}`
                      }
                    >
                      <img
                        src={img.thumbUrl || img.mainUrl}
                        alt={img.type || `Thumbnail ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.mainImage}>
                <img
                  src={currentImage.mainUrl}
                  alt={currentImage.type || product_title}
                />

                {isEditing && (
                  <label
                    className={styles.replaceImageBtn}
                    title="Upload replacement image"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                    />
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Replace Image
                  </label>
                )}

                {currentImage.originalUrl && !isEditing && (
                  <button
                    type="button"
                    className={styles.zoomIcon}
                    title="Open full resolution image"
                    onClick={() =>
                      window.open(
                        currentImage.originalUrl,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.gallery}>
              <div className={styles.noImagePlaceholder}>
                <svg
                  width="48"
                  height="48"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>No images available</span>
                {isEditing && (
                  <label
                    className={styles.saveBtn}
                    style={{
                      fontSize: "12px",
                      padding: "6px 12px",
                      marginTop: "8px",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                    />
                    Upload Image
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Commercial Summary */}
          <div className={styles.commercialSummary}>
            <h2 className={styles.sectionTitle}>Commercial Summary</h2>
            <div className={styles.pricingRow}>
              <div>
                <div className={styles.label}>Current Price</div>
                {isEditing ? (
                  <div className={styles.currencyInputWrap}>
                    <span className={styles.currencySymbol}>₹</span>
                    <input
                      type="number"
                      className={styles.editInputPrice}
                      value={formData.price ?? ""}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                ) : (
                  <div className={styles.valueLarge}>
                    ₹{price ? parseInt(price).toLocaleString("en-IN") : "-"}
                  </div>
                )}
              </div>
              <div>
                <div className={styles.label}>Compared Price</div>
                {isEditing ? (
                  <div className={styles.currencyInputWrap}>
                    <span className={styles.currencySymbol}>₹</span>
                    <input
                      type="number"
                      className={styles.editInputCompared}
                      value={formData.compared_price ?? ""}
                      onChange={(e) =>
                        handleInputChange("compared_price", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                ) : (
                  <div className={styles.valueStrikethrough}>
                    ₹
                    {compared_price
                      ? parseInt(compared_price).toLocaleString("en-IN")
                      : "-"}
                  </div>
                )}
              </div>
              {discountPercent > 0 && (
                <div className={styles.discountBadge}>
                  {discountPercent}% OFF
                </div>
              )}
              <div className={styles.divider}></div>
              <div>
                <div className={styles.label}>Purchasing Cost</div>
                {isEditing ? (
                  <div className={styles.currencyInputWrap}>
                    <span className={styles.currencySymbol}>₹</span>
                    <input
                      type="number"
                      className={styles.editInputCompared}
                      value={formData.purchasing_cost ?? ""}
                      onChange={(e) =>
                        handleInputChange("purchasing_cost", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                ) : (
                  <div className={styles.valueMedium}>
                    ₹
                    {purchasing_cost
                      ? parseInt(purchasing_cost).toLocaleString("en-IN")
                      : "-"}
                  </div>
                )}
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
                {isEditing ? (
                  <div className={styles.editInlineGroup}>
                    <input
                      type="color"
                      className={styles.colorPicker}
                      value={
                        formData.color &&
                        /^#[0-9A-Fa-f]{6}$/.test(formData.color)
                          ? formData.color
                          : "#ffbfa8"
                      }
                      onChange={(e) =>
                        handleInputChange("color", e.target.value)
                      }
                      title="Pick color"
                    />
                    <input
                      type="text"
                      className={styles.editInputSmall}
                      value={formData.color || ""}
                      onChange={(e) =>
                        handleInputChange("color", e.target.value)
                      }
                      placeholder="Color name"
                    />
                  </div>
                ) : (
                  <div className={styles.valueWithIcon}>
                    <span
                      className={styles.colorSwatch}
                      style={{
                        backgroundColor:
                          color &&
                          (color.startsWith("#") || color.startsWith("rgb"))
                            ? color
                            : "#ffbfa8",
                      }}
                    ></span>
                    {color || "-"}
                  </div>
                )}
              </div>
              <div>
                <div className={styles.label}>Brand</div>
                {isEditing ? (
                  <input
                    type="text"
                    className={styles.editInputSmall}
                    value={formData.brand_name || ""}
                    onChange={(e) =>
                      handleInputChange("brand_name", e.target.value)
                    }
                    placeholder="Brand name"
                  />
                ) : (
                  <div className={styles.value}>{brand_name || "-"}</div>
                )}
              </div>
              <div>
                <div className={styles.label}>Status</div>
                <div className={styles.valueStatus}>
                  <span className={styles.statusDotGreen}></span> {stock_status}
                </div>
              </div>
              <div>
                <div className={styles.label}>Collection</div>
                {isEditing ? (
                  <input
                    type="text"
                    className={styles.editInputSmall}
                    value={formData.collection_id || ""}
                    onChange={(e) =>
                      handleInputChange("collection_id", e.target.value)
                    }
                    placeholder="Collection ID"
                  />
                ) : (
                  <div className={styles.value}>{collection_id || "-"}</div>
                )}
              </div>
              <div>
                <div className={styles.label}>Vendor</div>
                {isEditing ? (
                  <input
                    type="text"
                    className={styles.editInputSmall}
                    value={formData.vendor || ""}
                    onChange={(e) =>
                      handleInputChange("vendor", e.target.value)
                    }
                    placeholder="Vendor"
                  />
                ) : (
                  <div className={styles.value}>{vendor || "-"}</div>
                )}
              </div>
              <div>
                <div className={styles.label}>Availability</div>
                <div className={styles.valueStatus}>
                  <span className={styles.statusDotGreen}></span> {availability}
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
            {/* Product Description */}
            <div className={styles.descriptionBox}>
              <h2 className={styles.descriptionTitle}>Product Description</h2>
              {isEditing ? (
                <textarea
                  className={styles.editDescTextarea}
                  rows={4}
                  value={formData.product_desc ?? formData.description ?? ""}
                  onChange={(e) => {
                    handleInputChange("product_desc", e.target.value);
                    handleInputChange("description", e.target.value);
                  }}
                  placeholder="Enter product description"
                />
              ) : (
                (() => {
                  const descText =
                    product_desc ||
                    description ||
                    "No product description provided.";
                  const LIMIT = 180;
                  const isLong = descText.length > LIMIT;
                  const displayedText =
                    isLong && !isDescExpanded
                      ? `${descText.slice(0, LIMIT)}...`
                      : descText;

                  return (
                    <div>
                      <p className={styles.descriptionText}>{displayedText}</p>
                      {isLong && (
                        <button
                          type="button"
                          className={styles.readMoreBtn}
                          onClick={() => setIsDescExpanded((prev) => !prev)}
                        >
                          {isDescExpanded ? "Read Less" : "Read More"}
                        </button>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Specifications Box */}
            <div className={styles.specsBox}>
              <h2 className={styles.sectionTitle}>Product Specifications</h2>
              <div className={styles.specsGrid}>
                {/* Column 1 */}
                <div className={styles.specsCol}>
                  {renderSpecRow("Age Group", "age_group")}
                  {renderSpecRow("Fabric", "fabric")}
                  {renderSpecRow("Blouse Fabric", "blouse_fabric")}
                  {renderSpecRow(
                    "Blouse Piece Included",
                    "blouse_piece_included",
                  )}
                  {renderSpecRow(
                    "Saree Length",
                    "saree_length_meters",
                    "number",
                    "m",
                  )}
                  {renderSpecRow(
                    "Blouse Length",
                    "blouse_length_meters",
                    "number",
                    "m",
                  )}
                </div>
                {/* Column 2 */}
                <div className={styles.specsCol}>
                  {renderSpecRow("Border Type", "border_type")}
                  {renderSpecRow("Pallu Type", "pallu_type")}
                  {renderSpecRow("Pattern", "pattern")}
                  {renderSpecRow("Work", "work")}
                  {renderSpecRow("Occasion", "occasion")}
                  {renderSpecRow("Style", "style")}
                </div>
                {/* Column 3 */}
                <div className={styles.specsCol}>
                  {renderSpecRow("Stitch", "stitch")}
                  {renderSpecRow("Set Items", "set_items_included")}
                  {renderSpecRow("Care", "care")}
                  {renderSpecRow("EAN", "ean")}
                  {renderSpecRow("HSN", "hsn")}
                  {renderSpecRow(
                    "Dead Weight",
                    "dead_weight_kg",
                    "number",
                    "kg",
                  )}
                  {renderSpecRow("Net Weight", "net_weight_kg", "number", "kg")}
                  {renderSpecRow(
                    "Volumetric Weight",
                    "volumetric_weight_kg",
                    "number",
                    "kg",
                  )}

                  {/* Render any additional dynamic fields */}
                  {extraAttributeKeys.map((key) =>
                    renderSpecRow(
                      key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase()),
                      key,
                    ),
                  )}
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
                    {isEditing ? (
                      <input
                        type="number"
                        className={styles.editInputCard}
                        value={formData.price ?? ""}
                        onChange={(e) =>
                          handleInputChange("price", e.target.value)
                        }
                        placeholder="0"
                      />
                    ) : (
                      <span className={styles.boldText}>
                        ₹{price ? parseInt(price).toLocaleString("en-IN") : "-"}
                      </span>
                    )}
                  </div>
                  <div className={styles.cardRow}>
                    <span>Compared Price</span>
                    {isEditing ? (
                      <input
                        type="number"
                        className={styles.editInputCard}
                        value={formData.compared_price ?? ""}
                        onChange={(e) =>
                          handleInputChange("compared_price", e.target.value)
                        }
                        placeholder="0"
                      />
                    ) : (
                      <span className={styles.boldText}>
                        ₹
                        {compared_price
                          ? parseInt(compared_price).toLocaleString("en-IN")
                          : "-"}
                      </span>
                    )}
                  </div>
                  <div className={styles.cardRow}>
                    <span>Purchasing Cost</span>
                    {isEditing ? (
                      <input
                        type="number"
                        className={styles.editInputCard}
                        value={formData.purchasing_cost ?? ""}
                        onChange={(e) =>
                          handleInputChange("purchasing_cost", e.target.value)
                        }
                        placeholder="0"
                      />
                    ) : (
                      <span className={styles.boldText}>
                        ₹
                        {purchasing_cost
                          ? parseInt(purchasing_cost).toLocaleString("en-IN")
                          : "-"}
                      </span>
                    )}
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
                    {isEditing ? (
                      <input
                        type="text"
                        className={styles.editInputCard}
                        value={formData.sku_id || ""}
                        onChange={(e) =>
                          handleInputChange("sku_id", e.target.value)
                        }
                        placeholder="SKU"
                      />
                    ) : (
                      <span className={styles.boldText}>{prodSkuId}</span>
                    )}
                  </div>
                  <div className={styles.cardRow}>
                    <span>EAN</span>
                    {isEditing ? (
                      <input
                        type="text"
                        className={styles.editInputCard}
                        value={formData.ean || ""}
                        onChange={(e) =>
                          handleInputChange("ean", e.target.value)
                        }
                        placeholder="EAN"
                      />
                    ) : (
                      <span className={styles.boldText}>{ean || "-"}</span>
                    )}
                  </div>
                  <div className={styles.cardRow}>
                    <span>HSN</span>
                    {isEditing ? (
                      <input
                        type="text"
                        className={styles.editInputCard}
                        value={formData.hsn || ""}
                        onChange={(e) =>
                          handleInputChange("hsn", e.target.value)
                        }
                        placeholder="HSN"
                      />
                    ) : (
                      <span className={styles.fadedText}>
                        {hsn || "Not assigned"}
                      </span>
                    )}
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

      <Toast toast={toast} />
    </div>
  );
}
