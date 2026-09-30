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

  // Always-current mirror of imageLink used by async fetch callbacks to detect
  // whether a slot was cleared while the request was in-flight.
  // Updated SYNCHRONOUSLY inside every setter call so there is zero render-lag.
  const imageLinkRef = useRef({});

  /* --- Image Status Toast ---------------------------------------------------
     Tracks the current bottom-right popup: message, colour type
     ("red" | "yellow" | "green"), and whether it is currently visible.       */
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  /* Holds the auto-dismiss setTimeout ID so we can cancel a pending dismiss
     whenever a newer toast fires before the previous one fades out.           */
  const toastTimerRef = useRef(null);
  const {
    selectedType,
    handleTypeChange,
    fixedValues,
    handleFixedChange,
    categoryAttributes,
    imageAttributes,
    addImageAttribute,
    changeImageCustomKey,
    removeImageAttribute,
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


  // --- Static Listing Field Definitions --------------------------------------
  // These fields are always shown regardless of the selected product category.
  // The "discount" field is auto-calculated from price and compared_price and is read-only.
  const fixedFields = [
    { key: "sku_id",               label: "SKU ID",             required: true  },
    { key: "product_title",        label: "Product Title",       required: true  },
    { key: "price",                label: "Product Price",       required: true  },
    { key: "compared_price",       label: "Compared Price",      required: true  },
    { key: "discount",             label: "Discount",            required: false },
    { key: "purchasing_cost",      label: "Purchasing Cost",     required: false },
    { key: "vendor",               label: "Vendor",              required: false },
    { key: "ean",                  label: "EAN",                 required: false },
    { key: "hsn",                  label: "HSN",                 required: false },
    { key: "net_weight_kg",        label: "Net Weight",          required: false },
    { key: "dead_weight_kg",       label: "Dead Weight",         required: false },
    { key: "volumetric_weight_kg", label: "Volumetric Weight",   required: false },
    { key: "brand_name",           label: "Brand Name",          required: true  },
  ];

    // True once a product type has been selected and API attributes have loaded.
  const hasAttributes =
    categoryAttributes.length > 0 || imageAttributes.length > 0;

    // True when a type is selected but the API returned no attributes for it.
  const noAttributes = selectedType && !hasAttributes && !error;




  // Converts snake_case field keys into human-readable Title Case labels.
  const formatLabel = (str) =>
    str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());


  

  if (success) {
    return (
      <div className={styles.globalAddCatalogContainer}>
        <div className={styles.main}>
          <div className={styles.successBox}>
            <div className={styles.successEmoji}>✅</div>
            <h2 className={styles.successTitle}>
              Catalog Added Successfully!
            </h2>
            <p className={styles.successText}>Redirecting to dashboard...</p>
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
   * @param {Object} attr    - Attribute object
   * @param {string} newName - User input
   */
  function handleCustomAttributeNameChange(attr, newName) {
    const oldField      = attr.field;
    const newSnakeField = toSnakeCase(newName) || "custom";

    /* -- DUPLICATE NAME TOAST -----------------------------------------------
       Fire a yellow toast the moment the typed name resolves to a snake_case
       key already owned by a different slot.                                  */
    const isDuplicate = imageAttributes.some(
      (a) =>
        a.field === newSnakeField &&
        (a.id || a.field) !== (attr.id || attr.field),
    );

    if (isDuplicate) {
      showToast(
        "2 images can't have the same name — try a different one",
        "yellow",
      );
    }

    changeImageCustomKey(attr.id || oldField, newName);

    // If an image link was entered under the old key, migrate it to the new key
    if (oldField !== newSnakeField && imageLink[oldField] !== undefined) {
      syncSetImageLink((prev) => {
        const copy = { ...prev, [newSnakeField]: prev[oldField] };
        delete copy[oldField];
        return copy;
      });
    }
  }





  /**
   * showToast — Triggers the bottom-right image status popup.
   *
   * Cancels any in-flight auto-dismiss timer first so rapid interactions
   * always reset the 4-second window from scratch.
   *
   * @param {string} message              - Text to display inside the toast.
   * @param {"red"|"yellow"|"green"} type - Visual colour variant.
   */
  function showToast(message, type) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    setToast({ message, type, visible: true });

    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  }





  /**
   * Drop-in replacement for setImageLink that keeps imageLinkRef in sync
   * immediately — before the next render — so that any in-flight fetch
   * can reliably detect stale results even within the same event loop tick.
   *
   * @param {((prev: Object) => Object) | Object} updater
   */
  const syncSetImageLink = (updater) => {
    setImageLink((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      imageLinkRef.current = next; // synchronous update
      return next;
    });
  };





  /**
   * uploadImage — Opens a native file picker, then stores the chosen file as
   * a local object URL for preview and queues it for upload.
   *
   * @param {string} key   - Attribute field key for this image slot.
   * @param {number} order - Display order passed to the upload payload.
   */
  function uploadImage(key, order) {
    const input  = document.createElement("input");
    input.type   = "file";
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

        /* -- SUCCESS TOAST -- Green confirmation once a file is chosen */
        showToast("Image uploaded successfully!", "green");
      }
    };

    input.click();
  }





  /**
   * removeImage — Clears the preview and image-link state for a single slot.
   * Called by the per-card X Remove button.
   *
   * @param {string} key - The field key of the image slot to clear.
   */
  function removeImage(key) {
    setPreview((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    syncSetImageLink((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }





  /**
   * clearAllImages — Resets every image slot's preview and link state at once.
   * Called by the "Clear All" button visible when any image is uploaded.
   */
  function clearAllImages() {
    setPreview({});
    syncSetImageLink({});
  }





  /**
   * handleImageLink — Fetches an image from a user-supplied URL and stores the
   * resulting Blob as a preview. Guards against stale in-flight responses using
   * imageLinkRef so clearing a slot mid-fetch is always respected.
   *
   * @param {string} key  - The field key of the image slot.
   * @param {string} link - Raw URL string entered by the user.
   */
  async function handleImageLink(key, link) {
    // Nothing to fetch for empty / whitespace-only strings
    if (!link || !link.trim()) {
      syncSetImageLink((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
      setPreview((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
      return;
    }

    syncSetImageLink((prev) => ({ ...prev, [key]: link }));

    try {
      const response = await fetch(link);
      const image    = await response.blob();

      // Stale-closure guard: if the user cleared or changed this slot while
      // the fetch was in-flight, discard the result and don't touch preview.
      if (imageLinkRef.current[key] !== link) return;

      if (!response.ok) {
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
      // Guard again in the error path
      if (imageLinkRef.current[key] !== link) return;
      setPreview((prev) => ({
        ...prev,
        [key]: { url: "", object: null },
      }));
    }
  }





  // --- Render ----------------------------------------------------------------
  return (
    <div className={styles.globalAddCatalogContainer}>
      <div className={styles.main}>

        {/* -- TOP HEADER -- */}
        <div className={styles.top}>
          <h1>Add Single Catalog</h1>
          <p>Add the information for your catalog</p>

          {/* -- STEPS -- */}
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

          {/* -- CATALOG SELECTOR — self-contained -- */}
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


        {/* -- ERROR BANNER -- */}
        {error && (
          <div id="error" className={styles.errorBanner}>
            ⚠ {error}
          </div>
        )}


        {/* -- NO ATTRIBUTES MESSAGE -- */}
        {noAttributes && (
          <div className={styles.noAttrWarning}>
            ⚠ This product type has no attributes configured yet. Please select
            a different product.
          </div>
        )}


        {/* ==================================================================
            STEP 2 — details + images side by side
        ================================================================== */}
        {hasAttributes && (
          <div className={styles.after_top}>

            {/* LEFT — Product Details */}
            <div className={styles.left}>
              <h3>Add product details</h3>

              <div className={styles["info-box"]}>
                <div className={styles["info-top"]}>
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
                      placeholder={
                        key === "discount"
                          ? "Discount %"
                          : "Enter the listing description"
                      }
                      value={
                        key === "discount"
                          ? (() => {
                              const cp = parseFloat(fixedValues["compared_price"]);
                              const p  = parseFloat(fixedValues["price"]);
                              if (!cp || isNaN(cp) || isNaN(p)) return "";
                              const factor = Math.pow(10, 2);
                              const result =
                                Math.trunc(((cp - p) / cp) * 100 * factor) /
                                factor;
                              return `${result}%`;
                            })()
                          : fixedValues[key]
                      }
                      onChange={(e) => handleFixedChange(key, e.target.value)}
                      disabled={key === "discount" ? true : false}
                    />
                  </div>
                ))}
              </div>

              <h4 className={styles.sectionHeading}>Product Attributes</h4>
              <div className={styles.listing}>
                {categoryAttributes.map((attr) => {
                  if (attr.field === "niche_id") return null;

                  const isDropdown =
                    attr.type === "dropdown" || Array.isArray(attr.options);

                  const options = isDropdown ? attr.options || [] : [];

                  return (
                    <div className={styles.line} key={attr.field}>
                      <span
                        className={`${styles.pill} ${attr.required ? styles.required : ""}`}
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
                          placeholder="Enter the product description"
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

              {/* -------------------------------------------------------
                  CUSTOM ATTRIBUTES
                  Follows the exact visual layout of Listing Information
                  and Product Attributes. On submit, these are merged
                  seamlessly into categoryAttributesPayload.
              ------------------------------------------------------- */}
              {customAttributes.length > 0 && (
                <>
                  <h4 className={styles.sectionHeading}>Custom Attributes</h4>

                  <div className={styles.listing}>
                    {customAttributes.map((attr) => (
                      <div className={styles.line} key={attr.id}>
                        {/* Custom Attribute Name: inside the same .pill container */}
                        <span className={`${styles.pill} ${styles.pillCustom}`}>
                          <input
                            type="text"
                            placeholder="Attribute name"
                            value={attr.name}
                            maxLength={100}
                            onChange={(e) =>
                              handleCustomAttributeChange(
                                attr.id,
                                "name",
                                e.target.value,
                              )
                            }
                            className={styles.pill_input}
                          />
                        </span>

                        {/* Custom Attribute Value: unrestricted string input */}
                        <input
                          placeholder="Enter the attribute description"
                          value={attr.value || ""}
                          onChange={(e) =>
                            handleCustomAttributeChange(
                              attr.id,
                              "value",
                              e.target.value,
                            )
                          }
                        />

                        {/* Remove button to delete the custom attribute row */}
                        <button
                          type="button"
                          onClick={() => removeCustomAttribute(attr.id)}
                          title="Remove"
                          className={styles.removeAttrBtn}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* -------------------------------------------------------
                  ADD CUSTOM ATTRIBUTE BUTTON
                  Always visible once step 2 is active. Clicking appends
                  a blank row to the custom attributes list above.
              ------------------------------------------------------- */}
              <button
                onClick={addCustomAttribute}
                className={styles.addCustomAttrBtn}
              >
                <span className={styles.addBtnIcon}>+</span>
                Add Custom Attribute
              </button>

              <div className={styles.buttons}>
                <button className={styles.draft}>Save as draft</button>

                <button
                  className={styles.submit}
                  onClick={() => {
                    /* -- RED TOAST -- Block submit if required first image is missing */
                    const firstAttr = imageAttributes[0];
                    if (firstAttr && !preview[firstAttr.field]?.url) {
                      showToast(
                        "Upload atleast 1 image to submit",
                        "red",
                      );
                      return;
                    }
                    handleSubmit();
                  }}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>


            {/* RIGHT — Images */}
            <div className={styles.right}>
              <div className={styles.card1}>
                <h2>Product Images</h2>

                <p className={styles.imageCardSubtext}>
                  Fields marked with * are required.
                </p>

                <div className={styles["image-grid"]} ref={imageContainerRef}>
                  {imageAttributes.map((attr, index) => {
                    /* Only the first image slot is required — marked with * */
                    const isRequired = index === 0;
                    const isCustom   = attr.custom;

                    // Display label: API description, falling back to name or formatted field
                    const displayLabel =
                      attr.name || formatLabel(attr.type || attr.field || "");

                    return (
                      <div
                        key={attr.id || attr.field}
                        className={styles.imageCardContainer}
                        style={{ order: `${attr.order}` }}
                      >
                        {isCustom ? (
                          /* Custom Attribute: editable input matching fetched label typography */
                          <input
                            type="text"
                            className={styles.imageTypeTag}
                            placeholder="Custom"
                            value={attr.name}
                            onChange={(e) =>
                              handleCustomAttributeNameChange(
                                attr,
                                e.target.value,
                              )
                            }
                            onBlur={(e) => {
                              const val = e.target.value.trim();

                              /* -- YELLOW TOAST: placeholder name -- */
                              if (!val || val.toLowerCase() === "custom") {
                                showToast(
                                  'Give your custom image a name — "Custom" is just a placeholder',
                                  "yellow",
                                );
                                return;
                              }

                              /* -- YELLOW TOAST: duplicate name -- */
                              const newSnakeField = toSnakeCase(val);
                              const isDuplicate   = imageAttributes.some(
                                (a) =>
                                  a.field === newSnakeField &&
                                  (a.id || a.field) !== (attr.id || attr.field),
                              );
                              if (isDuplicate) {
                                showToast(
                                  "Another image already uses this name — choose a different one",
                                  "yellow",
                                );
                              }
                            }}
                          />
                        ) : (
                          /* Fetched Attribute: read-only label from API */
                          <div className={styles.imageTypeTag}>
                            {displayLabel}
                            {isRequired ? " *" : ""}
                          </div>
                        )}

                        <div className={`${styles["img-box"]} ${styles.imgBoxPadded}`}>
                          <div
                            className={styles.circle}
                            onClick={() => {
                              uploadImage(attr.field, attr.order);
                            }}
                          >
                            <img
                              src={
                                preview[attr.field]?.url
                                  ? preview[attr.field]["url"]
                                  : camera
                              }
                              alt={preview[attr.field]?.url ? "Preview" : "Upload"}
                              className={
                                preview[attr.field]?.url
                                  ? styles.circleImgPreview
                                  : styles.circleImg
                              }
                            />
                          </div>

                          <p className={styles.imageCardRequired}>
                            {isRequired ? "Required" : "Optional"}
                          </p>
                        </div>

                        {/* -- SINGLE IMAGE REMOVE --
                            Custom slots: removes the entire card via removeImageAttribute.
                            API slots:    clears only the preview via removeImage.          */}
                        {preview[attr.field]?.url && (
                          <button
                            type="button"
                            className={styles.removeImageBtn}
                            onClick={() =>
                              isCustom
                                ? removeImageAttribute(attr.id || attr.field)
                                : removeImage(attr.field)
                            }
                            title="Remove image"
                          >
                            ✕ Remove
                          </button>
                        )}

                        <input
                          type="text"
                          placeholder="Image link"
                          className={styles.imageLink}
                          value={imageLink[attr.field] || ""}
                          onChange={(e) => {
                            handleImageLink(attr.field, e.target.value);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>


                {/* -- IMAGE ACTION BUTTONS ROW --
                    Holds the "+ Add More Images" and the conditional "Clear All" button.
                    Clear All is only rendered once at least one image has been uploaded. */}
                <div className={styles.imageBtnRow}>
                  <button
                    className={`${styles["blue-btn"]} ${styles.blueBtnNoMargin}`}
                    onClick={() => {
                      /* -- GUARD 1: unnamed slot --
                         Block if any custom slot still has the default "Custom" placeholder. */
                      const hasUnnamedCustom = imageAttributes.some((attr) => {
                        if (!attr.custom) return false;
                        const name = (attr.description ?? attr.name ?? "").trim();
                        return !name || name.toLowerCase() === "custom";
                      });

                      if (hasUnnamedCustom) {
                        showToast(
                          'Rename your existing "Custom" image before adding another',
                          "yellow",
                        );
                        return;
                      }

                      /* -- GUARD 2: duplicate display name --
                         Resolve every slot's display name to snake_case and look for
                         repeated values — that's the true source of duplicate conflicts. */
                      const resolvedKeys = imageAttributes.map((a) =>
                        toSnakeCase(a.description ?? a.name ?? ""),
                      );
                      const hasDuplicateName = resolvedKeys.some(
                        (key, idx) => key && resolvedKeys.indexOf(key) !== idx,
                      );

                      if (hasDuplicateName) {
                        showToast(
                          "Please resolve duplicate image names before adding a new one — each image must have a unique name",
                          "yellow",
                        );
                        return;
                      }

                      addCustomCimageContainer();
                    }}
                  >
                    + Add More Images
                  </button>

                  {/* Clear All: only visible once at least one image preview is loaded */}
                  {Object.values(preview).some((p) => p?.url) && (
                    <button
                      type="button"
                      className={styles.clearAllBtn}
                      onClick={clearAllImages}
                    >
                      <span className={styles.clearBtnIcon}>🗑</span>
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* -- IMAGE STATUS TOAST -----------------------------------------------
          Fixed bottom-right popup that slides in on image interactions.
          Colour variant is driven by toast.type: red / yellow / green.       */}
      {toast.visible && (
        <div
          className={`${styles.toast} ${
            toast.type === "green"
              ? styles.toastGreen
              : toast.type === "yellow"
                ? styles.toastYellow
                : styles.toastRed
          }`}
        >
          <span className={styles.toastIcon}>
            {toast.type === "green" ? "✓" : toast.type === "yellow" ? "⚠" : "✕"}
          </span>
          {toast.message}
        </div>
      )}


    </div>
  );
}
