import React from "react";
import styles from "../css/pages/add-catalog.module.css";
import useCatalogForm from "../hooks/useCatalogForm";
import CatalogSelector from "../components/CatalogSelector";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import camera from "../assets/icons/upload_photo.svg";

/**
 * AddCatalog — Single catalog creation form.
 *
 * Step 1: User selects a product category via CatalogSelector.
 * Step 2: API-driven listing and category attribute fields are revealed.
 *         Users fill in fixed listing information, category attributes,
 *         optional custom attributes, and product images before submitting.
 */
export default function AddCatalog() {

  // Ref used to determine image card insertion order when adding custom image slots.
  const imageContainerRef = useRef();

  // Tracks user-entered image URLs for each image attribute field.
  const [imageLink, setImageLink] = useState({});
  const {
    selectedType,
    handleTypeChange,
    fixedValues,
    handleFixedChange,
    categoryAttributes,
    imageAttributes,
    addImageAttribute,
    changeImageCustomKey,
    toSnakeCase,
    preview,
    setPreview,
    uploadImageData,
    dynamicValues,
    handleDynamicChange,
    submitting,
    error,
    success,
    handleSubmit,
    customAttributes,
    addCustomAttribute,
    handleCustomAttributeChange,
    removeCustomAttribute,
  } = useCatalogForm();

  // ─── Static Listing Field Definitions ───────────────────────────────────────
  // These fields are always shown regardless of the selected product category.
  // The "discount" field is auto-calculated from price and compared_price and is read-only.
  const fixedFields = [
    { key: "sku_id", label: "SKU ID", required: true },
    { key: "product_title", label: "Product Title", required: true },
    { key: "price", label: "Product Price", required: true },
    { key: "compared_price", label: "Compared Price", required: true },
    { key: "discount", label: "Discount", required: false },
    { key: "purchasing_cost", label: "Purchasing Cost", required: false },
    { key: "vendor", label: "Vendor", required: false },
    { key: "ean", label: "EAN", required: false },
    { key: "hsn", label: "HSN", required: false },
    { key: "net_weight_kg", label: "Net Weight", required: false },
    { key: "dead_weight_kg", label: "Dead Weight", required: false },
    {
      key: "volumetric_weight_kg",
      label: "Volumetric Weight",
      required: false,
    },
    { key: "brand_name", label: "Brand Name", required: true },
  ];


  // Converts snake_case field keys into human-readable Title Case labels.
  const formatLabel = (str) =>
    str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // True once a product type has been selected and API attributes have loaded.
  const hasAttributes =
    categoryAttributes.length > 0 || imageAttributes.length > 0;

  // True when a type is selected but the API returned no attributes for it.
  const noAttributes = selectedType && !hasAttributes && !error;

  if (success) {
    return (
      <div className={styles.globalAddCatalogContainer}>
        <div className={styles.main}>
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h2 style={{ color: "#0040D6", marginBottom: "8px" }}>
              Catalog Added Successfully!
            </h2>
            <p style={{ color: "#666" }}>Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Adds a new custom image slot to the image grid.
   *
   * The insertion order is based on the current number of rendered image cards,
   * ensuring new custom slots always appear at the end of the grid.
   */
  function addCustomCimageContainer() {
    const orderCount = imageContainerRef.current
      ? imageContainerRef.current.childElementCount
      : imageAttributes.length;

    addImageAttribute("Custom", {
      order: orderCount,
      custom: true,
    });
  }

  /**
   * Handles user typing a custom image attribute name (e.g. "Product Image").
   * Automatically converts the name to snake_case for the internal field/type
   * while keeping the formatted text in description. Migrates any entered image link.
   *
   * @param {Object} attr - Attribute object
   * @param {string} newName - User input
   */
  function handleCustomAttributeNameChange(attr, newName) {
    const oldField = attr.field;
    const newSnakeField = toSnakeCase(newName) || "custom";

    changeImageCustomKey(attr.id || oldField, newName);

    // If an image link was entered under the old key, migrate it to the new key
    if (oldField !== newSnakeField && imageLink[oldField] !== undefined) {
      setImageLink((prev) => {
        const copy = { ...prev, [newSnakeField]: prev[oldField] };
        delete copy[oldField];
        return copy;
      });
    }
  }

  function uploadImage(key, order) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = e.target.files[0];

      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setPreview((prev) => ({
          ...prev,
          [key]: { url: imageUrl, object: file },
        }));

        uploadImageData(key, file, order);
      }
    };

    input.click();
  }

  async function handleImageLink(key, link) {
    console.log(link);

    setImageLink((prev) => ({
      ...prev,
      [key]: link,
    }));

    const running = imageLink[key];

    try {
      const response = await fetch(link);
      const image = await response.blob();
      console.log(image);

      if (!response.ok) {
        console.log(running);
        setPreview((prev) => ({
          ...prev,
          [key]: { url: "", object: null },
        }));
        return;
      }

      if (image) {
        const imageUrl = URL.createObjectURL(image);
        setPreview((prev) => ({
          ...prev,
          [key]: { url: imageUrl, object: image },
        }));
      } else {
        setPreview((prev) => ({
          ...prev,
          [key]: { url: "", object: null },
        }));
      }
    } catch {
      setPreview((prev) => ({
        ...prev,
        [key]: { url: "", object: null },
      }));
    }
  }

  return (
    <div className={styles.globalAddCatalogContainer}>
      <div className={styles.main}>
        {/* ── TOP HEADER ── */}
        <div className={styles.top}>
          <h1>Add Single Catalog</h1>
          <p>Add the information for your catalog</p>

          {/* ── STEPS ── */}
          <div className={styles.row}>
            <div className={styles.steps}>
              <div
                className={`${styles.step} ${
                  !hasAttributes ? styles.active : ""
                }`}
              >
                {hasAttributes ? (
                  <span className={styles.check}>✔</span>
                ) : (
                  <span>1&nbsp;</span>
                )}
                Select Category
              </div>

              <div
                className={`${styles.step} ${
                  hasAttributes ? styles.active : ""
                }`}
              >
                <span>2&nbsp;</span>
                Add Product Details
              </div>
            </div>
          </div>

          {/* ── CATALOG SELECTOR — self-contained ── */}
          <CatalogSelector onTypeSelect={handleTypeChange} />

          <div className={styles["mandatory-row"]}>
            <p className={styles.mandatory}>
              Mandatory Fields<span>*</span>
            </p>
            <div className={`${styles.guideline} ${styles.small}`}>
              <Link to="#">⚠ Follow guidelines to reduce quality check</Link>
            </div>
          </div>
        </div>

        {/* ── ERROR BANNER ── */}
        {error && (
          <div
            id="error"
            style={{
              background: "#fff0f0",
              border: "1px solid #E51300",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
              color: "#E51300",
              fontSize: "14px",
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* ── NO ATTRIBUTES MESSAGE ── */}
        {noAttributes && (
          <div
            style={{
              background: "#fffbe6",
              border: "1px solid #f0c000",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
              color: "#7a5c00",
              fontSize: "14px",
            }}
          >
            ⚠ This product type has no attributes configured yet. Please select
            a different product.
          </div>
        )}

        {/* ════════════════════════════════════════
            STEP 2 — details + images side by side
        ════════════════════════════════════════ */}
        {hasAttributes && (
          <div className={styles.after_top}>
            {/* LEFT — Product Details */}
            <div className={styles.left}>
              <h3>Add product details</h3>

              <div className={styles["info-box"]}>
                <div className={styles["info-top"]}>
                  {/* <span className={styles.tick}>✔</span> */}
                  <p>Fill in all required fields marked with *</p>
                </div>
                <p className={styles["info-text"]}>
                  Mandatory fields are marked with * and must be filled before
                  submitting.
                </p>
              </div>

              <h2>Listing Information</h2>
              <div className={styles.listing}>
                {fixedFields.map(({ key, label, required }) => (
                  <div className={styles.line} key={key}>
                    <span
                      className={`${styles.pill} ${
                        required ? styles.required : ""
                      }`}
                    >
                      {label}
                      {required ? " *" : ""}
                    </span>

                    <input
                      placeholder="Type Here..."
                      value={
                        key === "discount"
                          ? (() => {
                              const factor = Math.pow(10, 2);
                              return `${
                                Math.trunc(
                                  ((fixedValues["compared_price"] -
                                    fixedValues["price"]) /
                                    fixedValues["compared_price"]) *
                                    100 *
                                    factor,
                                ) / factor
                              }%`;
                            })()
                          : fixedValues[key]
                      }
                      onChange={(e) => handleFixedChange(key, e.target.value)}
                      disabled={key === "discount" ? true : false}
                    />
                  </div>
                ))}
              </div>

              <h4 style={{ marginTop: "24px" }}>Product Attributes</h4>
              <div className={styles.listing}>
                {categoryAttributes.map((attr) => {
                  if (attr.field === "niche_id") return null;

                  const isDropdown =
                    attr.type === "dropdown" || Array.isArray(attr.options);

                  const options = isDropdown ? attr.options || [] : [];

                  return (
                    <div className={styles.line} key={attr.field}>
                      <span
                        className={`${styles.pill} ${
                          attr.required ? styles.required : ""
                        }`}
                      >
                        {attr.name || formatLabel(attr.field || "")}
                        {attr.required ? " *" : ""}
                      </span>

                      {isDropdown ? (
                        <select
                          value={dynamicValues[attr.field] || ""}
                          onChange={(e) =>
                            handleDynamicChange(attr.field, e.target.value)
                          }
                          className={styles.select_field}
                        >
                          <option value="">Select...</option>

                          {options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          placeholder="Type Here..."
                          value={dynamicValues[attr.field] || ""}
                          onChange={(e) =>
                            handleDynamicChange(attr.field, e.target.value)
                          }
                          required={attr.required ? true : false}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ─────────────────────────────────────────────────
                  CUSTOM ATTRIBUTES
                  Rendered only when the user has added at least one row.
                  Each row has an editable name input and a value input,
                  with an inline remove button to delete the row.
              ───────────────────────────────────────────────── */}
              {customAttributes.length > 0 && (
                <>
                  <h4 style={{ marginTop: "24px" }}>Custom Attributes</h4>
                  <div className={styles.listing}>
                    {customAttributes.map((attr) => (
                      <div className={styles.line} key={attr.id} style={{ position: "relative" }}>
                        <input
                          className={styles.pill}
                          style={{ minWidth: "140px", fontWeight: 500 }}
                          placeholder="Attribute name"
                          value={attr.key}
                          onChange={(e) =>
                            handleCustomAttributeChange(attr.id, "key", e.target.value)
                          }
                        />
                        <input
                          placeholder="Type Here..."
                          value={attr.value}
                          onChange={(e) =>
                            handleCustomAttributeChange(attr.id, "value", e.target.value)
                          }
                        />
                        <button
                          onClick={() => removeCustomAttribute(attr.id)}
                          title="Remove"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#aaa",
                            fontSize: "1.1em",
                            padding: "0 4px",
                            lineHeight: 1,
                            flexShrink: 0,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ─────────────────────────────────────────────────
                  ADD CUSTOM ATTRIBUTE BUTTON
                  Always visible once step 2 is active. Clicking appends a
                  blank row to the custom attributes list above.
              ───────────────────────────────────────────────── */}
              <button
                onClick={addCustomAttribute}
                style={{
                  marginTop: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "none",
                  border: "1px dashed #0040D6",
                  color: "#0040D6",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "0.9em",
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <span style={{ fontSize: "1.1em", lineHeight: 1 }}>+</span>
                Add Custom Attribute
              </button>

              <div className={styles.buttons}>
                <button className={styles.draft}>Save as draft</button>

                <button
                  className={styles.submit}
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>

            {/* RIGHT — Images */}
            <div className={styles.right}>
              <div className={styles.card1}>
                <h2>Add Images</h2>

                <p
                  style={{
                    fontSize: "0.85em",
                    color: "#666",
                    marginBottom: "12px",
                  }}
                >
                  Fields marked with * are required.
                </p>

                <div className={styles["image-grid"]} ref={imageContainerRef}>
                  {imageAttributes.map((attr) => {
                    const isRequired = attr.required;
                    const isCustom = attr.custom;

                    // Display actual description received from API, falling back to name or formatted field
                    const displayLabel =
                      attr.description ||
                      attr.name ||
                      formatLabel(attr.type || attr.field || "");

                    return (
                      <div
                        key={attr.id || attr.field}
                        className={styles.imageCardContainer}
                        style={{ order: `${attr.order}` }}
                      >
                        {isCustom ? (
                          /* Custom Attribute: Seamless input matching the exact typography of fetched label */
                          <input
                            type="text"
                            className={styles.imageTypeTag}
                            placeholder="Custom"
                            value={
                              attr.description !== undefined
                                ? attr.description
                                : attr.name || ""
                            }
                            onChange={(e) =>
                              handleCustomAttributeNameChange(attr, e.target.value)
                            }
                          />
                        ) : (
                          /* Fetched Attribute: Read-only label with actual description from API */
                          <div className={styles.imageTypeTag}>
                            {displayLabel}
                            {isRequired ? " *" : ""}
                          </div>
                        )}

                        <div
                          className={styles["img-box"]}
                          style={{ padding: "12px" }}
                        >
                          <div
                            className={styles.circle}
                            onClick={() => {
                              uploadImage(attr.field, attr.order);
                            }}
                            style={{
                              backgroundImage: preview[attr.field]
                                ? preview[attr.field]["url"] &&
                                  preview[attr.field]["url"] != ""
                                  ? `url(${preview[attr.field]["url"]})`
                                  : `url(${camera})`
                                : `url(${camera})`,
                            }}
                          ></div>

                          <p
                            style={{
                              fontSize: "11px",
                              color: "#888",
                              marginTop: "6px",
                            }}
                          >
                            {isRequired ? "Required" : "Optional"}
                          </p>
                        </div>

                        <input
                          type="text"
                          placeholder="Image link"
                          className={styles.imageLink}
                          value={imageLink[attr.field] || ""}
                          onChange={(e) => {
                            setImageLink((prev) => ({
                              ...prev,
                              [attr.field]: e.target.value,
                            }));
                            handleImageLink(attr.field, e.target.value);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                <button
                  className={styles["blue-btn"]}
                  onClick={addCustomCimageContainer}
                >
                  + Add Custom
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
