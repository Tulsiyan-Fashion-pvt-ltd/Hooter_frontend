import React, { useState } from "react";
import styles from "../css/pages/add-catalog.module.css";
import useCatalogForm from "../hooks/useCatalogForm";
import CatalogSelector from "../components/CatalogSelector";

export default function AddCatalog() {
  const {
    selectedType,
    handleTypeChange,
    fixedValues,
    handleFixedChange,
    fieldAttributes,
    imageAttributes,
    dynamicValues,
    handleDynamicChange,
    submitting,
    error,
    success,
    handleSubmit,
  } = useCatalogForm();

  const [validationError, setValidationError] = useState(null);
  const [missingFields, setMissingFields] = useState(new Set());
  const fixedFields = [
    { key: "sku-id", label: "SKU ID", required: true },
    { key: "title", label: "Product Title", required: true },
    { key: "price", label: "Product Price", required: true },
    { key: "compared-price", label: "Compared Price", required: true },
    { key: "purchasing-cost", label: "Purchasing Cost", required: true },
    { key: "vendor", label: "Vendor", required: true },
    { key: "ean", label: "EAN", required: false },
    { key: "hsn", label: "HSN", required: false },
    { key: "net-weight", label: "Net Weight", required: true },
    { key: "dead-weight", label: "Dead Weight", required: true },
    { key: "volumetric-weight", label: "Volumetric Weight", required: true },
    { key: "brand-name", label: "Brand Name", required: true },
  ];

  const formatLabel = (str) =>
    str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const hasAttributes = Object.keys(fieldAttributes).length > 0;
  const noAttributes = selectedType && !hasAttributes && !error;

  // ── Validation + submit ───────────────────────────────
  const handleValidatedSubmit = () => {
    const missing = [];
    const missingKeys = new Set();

    fixedFields.forEach(({ key, label, required }) => {
      if (required && !fixedValues[key]?.toString().trim()) {
        missing.push(label);
        missingKeys.add(key);
      }
    });

    Object.entries(fieldAttributes).forEach(([key, rule]) => {
      if (key === "niche_id") return;
      const isRequired =
        rule === "*" || (Array.isArray(rule) && rule.includes("*"));
      if (isRequired && !dynamicValues[key]?.toString().trim()) {
        missing.push(formatLabel(key));
        missingKeys.add(key);
      }
    });

    if (missing.length > 0) {
      setValidationError(
        `Please fill in the following required fields: ${missing.join(", ")}`,
      );
      setMissingFields(missingKeys);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setValidationError(null);
    setMissingFields(new Set());
    handleSubmit();
  };

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

  return (
    <div className={styles.globalAddCatalogContainer}>
      <div className={styles.main}>
        {/* ── TOP HEADER ── */}
        <div className={styles.top}>
          <h1>Add Single Catalog</h1>
          <p>
            Add the product photos and we will auto-fill some of the product
            description
          </p>

          {/* ── STEPS ── */}
          <div className={styles.row}>
            <div className={styles.steps}>
              <div
                className={`${styles.step} ${!hasAttributes ? styles.active : ""}`}
              >
                {hasAttributes ? (
                  <span className={styles.check}>✔</span>
                ) : (
                  <span>1&nbsp;</span>
                )}
                Select Category
              </div>
              <div
                className={`${styles.step} ${hasAttributes ? styles.active : ""}`}
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
              <a href="#">⚠ Follow guidelines to reduce quality check</a>
            </div>
          </div>
        </div>

        {/* ── VALIDATION ERROR BANNER ── */}
        {validationError && (
          <div
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
            ⚠ {validationError}
          </div>
        )}

        {/* ── API ERROR BANNER ── */}
        {error && (
          <div
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
                  <span className={styles.tick}>✔</span>
                  <p>Fill in all required fields marked with *</p>
                </div>
                <p className={styles["info-text"]}>
                  Mandatory fields are marked with * and must be filled before
                  submitting.
                </p>
              </div>

              <h4>Listing Information</h4>
              <div className={styles.listing}>
                {fixedFields.map(({ key, label, required }) => (
                  <div className={styles.line} key={key}>
                    <span
                      className={`${styles.pill} ${required ? styles.required : ""}`}
                    >
                      {label}
                      {required ? " *" : ""}
                    </span>
                    <input
                      placeholder="Type Here..."
                      value={fixedValues[key]}
                      style={
                        missingFields.has(key)
                          ? { border: "1.5px solid #E51300" }
                          : {}
                      }
                      onChange={(e) => {
                        handleFixedChange(key, e.target.value);
                        setMissingFields((prev) => {
                          const s = new Set(prev);
                          s.delete(key);
                          return s;
                        });
                      }}
                    />
                  </div>
                ))}
              </div>

              <h4 style={{ marginTop: "24px" }}>Product Attributes</h4>
              <div className={styles.listing}>
                {Object.entries(fieldAttributes).map(([key, rule]) => {
                  if (key === "niche_id") return null;

                  const isRequired =
                    rule === "*" || (Array.isArray(rule) && rule.includes("*"));
                  const isDropdown = Array.isArray(rule);

                  // Filter out "*" and convert booleans → Yes / No
                  const options = isDropdown
                    ? rule
                        .filter((v) => v !== "*")
                        .map((v) => ({
                          value: String(v),
                          label:
                            v === true ? "Yes" : v === false ? "No" : String(v),
                        }))
                    : [];

                  return (
                    <div className={styles.line} key={key}>
                      <span
                        className={`${styles.pill} ${isRequired ? styles.required : ""}`}
                      >
                        {formatLabel(key)}
                        {isRequired ? " *" : ""}
                      </span>
                      {isDropdown ? (
                        <select
                          value={dynamicValues[key] || ""}
                          style={
                            missingFields.has(key)
                              ? { border: "1.5px solid #E51300" }
                              : {}
                          }
                          onChange={(e) => {
                            handleDynamicChange(key, e.target.value);
                            setMissingFields((prev) => {
                              const s = new Set(prev);
                              s.delete(key);
                              return s;
                            });
                          }}
                          className={styles.select_field}
                        >
                          <option value="">Select...</option>
                          {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          placeholder="Type Here..."
                          value={dynamicValues[key] || ""}
                          style={
                            missingFields.has(key)
                              ? { border: "1.5px solid #E51300" }
                              : {}
                          }
                          onChange={(e) => {
                            handleDynamicChange(key, e.target.value);
                            setMissingFields((prev) => {
                              const s = new Set(prev);
                              s.delete(key);
                              return s;
                            });
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className={styles.buttons}>
                <button className={styles.draft}>Save as draft</button>
                <button
                  className={styles.submit}
                  onClick={handleValidatedSubmit}
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? "Submitting..." : "Submit Catalog ✓"}
                </button>
              </div>
            </div>

            {/* RIGHT — Images */}
            <div className={styles.right}>
              <div className={styles.card1}>
                <h4>Add Images</h4>
                <p
                  style={{
                    fontSize: "0.85em",
                    color: "#666",
                    marginBottom: "12px",
                  }}
                >
                  Fields marked with * are required.
                </p>
                <div className={styles["image-grid"]}>
                  {Object.entries(imageAttributes).map(([key, rule]) => {
                    const isRequired = rule === "*";
                    return (
                      <div
                        key={key}
                        className={styles["img-box"]}
                        style={{ height: "auto", padding: "12px" }}
                      >
                        <p
                          style={{
                            fontSize: "13px",
                            marginBottom: "8px",
                            fontWeight: 500,
                          }}
                        >
                          {formatLabel(key)}
                          {isRequired ? " *" : ""}
                        </p>
                        <div className={styles.circle}>📷</div>
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
                    );
                  })}
                </div>
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <button
                  className={styles["blue-btn"]}
                  onClick={() => document.getElementById("imageUpload").click()}
                >
                  + Add more image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
