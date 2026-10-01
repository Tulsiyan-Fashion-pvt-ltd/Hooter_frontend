import React from "react";
import styles from "../css/pages/add-catalog.module.css";
import useCatalogForm from "../hooks/useCatalogForm";
import useToast from "../hooks/useToast";
import CatalogSelector from "../components/CatalogSelector";
import Toast from "../components/Toast";
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

  /* --- Toast ----------------------------------------------------------------
     Reusable hook — call showToast(message, type) anywhere in this component.
     Render <Toast toast={toast} /> once at the bottom of the JSX tree.       */
  const { toast, showToast } = useToast();

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




  const {
    selectedType,
    handleTypeChange,
    fixedValues,
    handleFixedChange,
    listingAttributes,
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




  // --- Listing Field Definitions (API-driven) ---------------------------------
  // Populated from the API after a product type is selected (listing_attributes).
  // The "discount" field is auto-calculated from price and compared_price and is read-only.

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
          <div className={styles.successBox}>
            <div className={styles.successEmoji}>✅</div>
            <h2 className={styles.successTitle}>Catalog Added Successfully!</h2>
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
   * @param {Object} attr - Attribute object
   * @param {string} newName - User input
   */
  function handleCustomAttributeNameChange(attr, newName) {
    const oldField = attr.field;
    const newSnakeField = toSnakeCase(newName) || "custom";

    /* ── DUPLICATE NAME TOAST ────────────────────────────────────────────────────
       Fire a yellow toast the moment the typed name resolves to a snake_case key
       already owned by a different slot. The hook's collision guard will prevent
       any data from being overwritten, but we need to tell the user why.          */
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

        /* ── SUCCESS TOAST ── Green confirmation once a file is chosen */
        showToast("Image uploaded successfully!", "green");
      }
    };

    input.click();
  }




  /**
   * removeImage — Clears the preview and image-link state for a single slot.
   * Called by the per-card ✕ Remove button.
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
      const image = await response.blob();

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
                className={`${styles.step} ${!hasAttributes ? styles.active : ""
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
                className={`${styles.step} ${hasAttributes ? styles.active : ""
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
          <div id="error" className={styles.errorBanner}>
            ⚠ {error}
          </div>
        )}


        {/* ── NO ATTRIBUTES MESSAGE ── */}
        {noAttributes && (
          <div className={styles.noAttrWarning}>
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
                  <p>Fill in all required fields marked with *</p>
                </div>
                <p className={styles["info-text"]}>
                  Mandatory fields are marked with * and must be filled before
                  submitting.
                </p>
              </div>


              <h2>Listing Information</h2>

              <div className={styles.listing}>
                {listingAttributes.map((attr) => {
                  const key = attr.field || attr.key;
                  const label = attr.name || formatLabel(key);
                  const required = Boolean(attr.required);

                  return (
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
                              const p = parseFloat(fixedValues["price"]);
                              if (!cp || isNaN(cp) || isNaN(p)) return "";
                              const factor = Math.pow(10, 2);
                              const result =
                                Math.trunc(((cp - p) / cp) * 100 * factor) /
                                factor;
                              return `${result}%`;
                            })()
                            : fixedValues[key] ?? ""
                        }
                        onChange={(e) => handleFixedChange(key, e.target.value)}
                        disabled={key === "discount"}
                      />
                    </div>
                  );
                })}
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
                        className={`${styles.pill} ${attr.required ? styles.required : ""
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


              {/* ─────────────────────────────────────────────────
                  CUSTOM ATTRIBUTES
                  Follows the exact visual layout of Listing Information and Product Attributes:
                    - Same .line container layout (gap, alignment, margins).
                    - Attribute name displayed inside the exact same .pill shape with the blue right accent strip.
                    - Same underline input ("Type Here...") for entering the attribute value.
                    - Inline remove button (✕) to delete the custom attribute row.
                  On submit, these are merged seamlessly into categoryAttributesPayload.
              ───────────────────────────────────────────────── */}
              {customAttributes.length > 0 && (
                <>
                  <h4 className={styles.sectionHeading}>Custom Attributes</h4>

                  <div className={styles.listing}>
                    {customAttributes.map((attr) => (
                      <div className={styles.line} key={attr.id}>
                        {/* Custom Attribute Name: Styled inside the exact same .pill container as other attributes */}
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

                        {/* Custom Attribute Value: Retains standard string data typing with unrestricted description/text length */}
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


              {/* ─────────────────────────────────────────────────
                  ADD CUSTOM ATTRIBUTE BUTTON
                  Always visible once step 2 is active. Clicking appends a
                  blank row to the custom attributes list above.
              ───────────────────────────────────────────────── */}
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
                    /* ── RED TOAST ── Block submit if the required first image is missing */
                    const firstAttr = imageAttributes[0];
                    if (firstAttr && !preview[firstAttr.field]?.url) {
                      showToast("Upload atleast 1 image to submit", "red");
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
                              handleCustomAttributeNameChange(
                                attr,
                                e.target.value,
                              )
                            }
                            onBlur={(e) => {
                              const val = e.target.value.trim();

                              /* ── YELLOW TOAST: placeholder name ── */
                              if (!val || val.toLowerCase() === "custom") {
                                showToast(
                                  'Give your custom image a name — "Custom" is just a placeholder',
                                  "yellow",
                                );
                                return;
                              }

                              /* ── YELLOW TOAST: duplicate name ─────────────────────────────────
                                 If another slot already resolves to the same snake_case field key,
                                 warn the user so they know the field key wasn't actually updated. */
                              const newSnakeField = toSnakeCase(val);
                              const isDuplicate = imageAttributes.some(
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
                          /* Fetched Attribute: Read-only label with actual description from API */
                          <div className={styles.imageTypeTag}>
                            {displayLabel}
                            {isRequired ? " *" : ""}
                          </div>
                        )}

                        <div
                          className={`${styles["img-box"]} ${styles.imgBoxPadded}`}
                        >
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
                              alt={
                                preview[attr.field]?.url ? "Preview" : "Upload"
                              }
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

                        {/* ── SINGLE IMAGE REMOVE ── Only rendered when this slot has a preview.
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

                {/* ── IMAGE ACTION BUTTONS ROW ──────────────────────────────────────────────
                    Holds the "+ Add Custom" and the conditional "Clear All" button.
                    Clear All is only rendered once at least one image has been uploaded. */}
                <div className={styles.imageBtnRow}>
                  <button
                    className={`${styles["blue-btn"]} ${styles.blueBtnNoMargin}`}
                    onClick={() => {
                      /* ── GUARD 1: unnamed slot ─────────────────────────────────────────────
                         Block if any custom slot still has the default "Custom" placeholder. */
                      const hasUnnamedCustom = imageAttributes.some((attr) => {
                        if (!attr.custom) return false;
                        const name = (
                          attr.description ??
                          attr.name ??
                          ""
                        ).trim();
                        return !name || name.toLowerCase() === "custom";
                      });

                      if (hasUnnamedCustom) {
                        showToast(
                          'Rename your existing "Custom" image before adding another',
                          "yellow",
                        );
                        return;
                      }

                      /* ── GUARD 2: duplicate display name ──────────────────────────────────────
                         The hook keeps internal field keys distinct when a collision is typed,
                         so checking field keys alone misses the case. Instead, resolve every
                         slot's display name (description / name) to snake_case and look for
                         repeated values — that's the true source of the duplicate conflict.    */
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

      {/* -- TOAST ---------------------------------------------------------- */}
      <Toast toast={toast} />
    </div>
  );
}
