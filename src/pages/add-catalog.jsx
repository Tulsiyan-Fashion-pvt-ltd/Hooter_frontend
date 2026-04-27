import React from "react";
import styles from "../css/pages/add-catalog.module.css";
import useCatalogForm from "../hooks/useCatalogForm";
import CatalogSelector from "../components/CatalogSelector";
import { useRef, useState} from "react";
import { Link } from "react-router-dom";
import camera from "../assets/icons/upload_photo.svg"; 

export default function AddCatalog() {
  const imageContainerRef = useRef()
  const [imageLink, setImageLink] = useState({});
  // console.log(preview)
  const {
    selectedType,
    handleTypeChange,
    fixedValues,
    handleFixedChange,
    fieldAttributes,
    imageAttributes,
    addImageAttribute,
    changeImageCustomKey,
    preview,
    setPreview,
    uploadImageData,
    dynamicValues,
    handleDynamicChange,
    submitting,
    error,
    success,
    handleSubmit,
  } = useCatalogForm();

  const fixedFields = [
    { key: "sku_id", label: "SKU ID", required: true },
    { key: "title", label: "Product Title", required: true },
    { key: "price", label: "Product Price", required: true },
    { key: "compared_price", label: "Compared Price", required: true },
    { key: "discount", label: "Discount", required: false },
    { key: "purchasing_cost", label: "Purchasing Cost", required: false },
    { key: "vendor", label: "Vendor", required: false },
    { key: "ean", label: "EAN", required: false },
    { key: "hsn", label: "HSN", required: false },
    { key: "net_weight", label: "Net Weight", required: false },
    { key: "dead_weight", label: "Dead Weight", required: false },
    { key: "volumetric_weight", label: "Volumetric Weight", required: false },
    { key: "brand_name", label: "Brand Name", required: true },
  ];

  const formatLabel = (str) =>
    str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const hasAttributes = Object.keys(fieldAttributes).length > 0;
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

  function addCustomCimageContainer(){
    const orderCount = imageContainerRef.current.childElementCount;
    addImageAttribute("custom", [orderCount, "custom"]);
  }

  function uploadImage(key, order){
    const input = document.createElement('input');
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e)=>{
      const file = e.target.files[0];

      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setPreview((prev)=>({...prev, [key]: {"url": imageUrl, "object": file},}));

        uploadImageData(key, file, order)
      }
    }

    input.click();
  }

  async function handleImageLink(key, link){
    console.log(link)
    try{
      const response = await fetch(link);
      const image = await response.blob();
      console.log(image)

      if (!response.ok) {
        console.log(running)
        setPreview((prev)=>({...prev, [key]: {"url": "", "object": null}}));
        return;
      }

      if (image) {
        const imageUrl = URL.createObjectURL(image);
        setPreview((prev)=>({...prev, [key]: {"url": imageUrl, "object": image}}));
      }else{
        setPreview((prev)=>({...prev, [key]: {"url": "", "object": null}}));
      }
    }
    catch{
      setPreview((prev)=>({...prev, [key]: {"url": "", "object": null}}));
    }
  }

  return (
    <div className={styles.globalAddCatalogContainer}>
      <div className={styles.main}>
        {/* ── TOP HEADER ── */}
        <div className={styles.top}>
          <h1>Add Single Catalog</h1>
          <p>
            Add the information for your catalog
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
                      className={`${styles.pill} ${required ? styles.required : ""}`}
                    >
                      {label}
                      {required ? " *" : ""}
                    </span>
                    <input
                      placeholder="Type Here..."
                      value={key==="discount"? (()=>{
                        const factor = Math.pow(10, 2);
                        return `${Math.trunc((((fixedValues["compared_price"]-fixedValues["price"])/fixedValues["compared_price"])*100)*factor)/factor}%`
                        })() : fixedValues[key]}
                      onChange={(e) => handleFixedChange(key, e.target.value)}
                      disabled={key==="discount"?true:false}
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
                  const options = isDropdown
                    ? rule.filter((v) => v !== "*")
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
                          onChange={(e) =>
                            handleDynamicChange(key, e.target.value)
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
                          value={dynamicValues[key] || ""}
                          onChange={(e) =>
                            handleDynamicChange(key, e.target.value)
                          }
                          required={rule === "*" || rule.includes("*")? true: false}
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
                  {Object.entries(imageAttributes).map(([key, rule]) => {
                    const isRequired = rule.includes("*");
                    return (
                      <div key={key} className={styles.imageCardContainer} style={{order: `${rule[0]}`}}>
                        <input className={styles.imageTypeTag}
                          style={{
                            fontSize: "13px",
                            marginBottom: "8px",
                            fontWeight: 500,
                          }}
                          placeholder = {`${formatLabel(key)}`+
                                  `${isRequired ? " *" : ""}`}
                          disabled={!rule.includes("custom")}

                          onChange={(e) => {changeImageCustomKey(key, e.target.value)}}
                          value={`${formatLabel(key)}`+`${isRequired ? " *" : ""}`}
                          autoFocus={rule.includes("custom")}
                        />
                        <div
                          key={key}
                          className={styles["img-box"]}
                          style={{padding: "12px" }}
                        >
                          <div className={styles.circle} onClick={() => {uploadImage(key, rule[0])}}
                            style={{backgroundImage: preview[key]?
                            preview[key]["url"] && preview[key]["url"] != ""? `url(${preview[key]["url"]})`: `url(${camera})`
                          : `url(${camera})`}}></div>
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

                        <input type="text" placeholder="Image link" className={styles.imageLink} 
                        onChange={(e)=>{handleImageLink(key, e.target.value)}}/>
                      </div>
                    );
                  })}
                </div>
                <button
                  className={styles["blue-btn"]}
                  onClick={addCustomCimageContainer}
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
