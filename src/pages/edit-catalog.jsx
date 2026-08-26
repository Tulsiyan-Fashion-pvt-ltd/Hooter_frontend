import styles from "../css/pages/EditInventory.module.css";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import camera from "../assets/icons/upload_photo.svg";
import {
  getProduct,
  getAttributeFields,
  updateProduct,
  uploadImages,
  getImage,
  markComplete,
} from "../services/catalogService";

export default function EditInventory() {
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

  const [field, setField] = useState({});
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [imageAttributes, setImageAttributes] = useState([]);
  const [imageField, setImageField] = useState({});
  const [editImage, setEditImage] = useState({});
  const [error, setError] = useState();
  const [success, setSuccess] = useState();
  const [submitting, setSubmitting] = useState(false);
  const imageContainerRef = useRef();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const uskuId = searchParams.get("id");
  const typeId = searchParams.get("type");
  // TODO: vertical not returned by getProduct() — currently sourced from route query param
  const vertical = searchParams.get("vertical");

  function handleEntryInput(key, value) {
    setField((prev) => ({ ...prev, [key]: value }));
  }

  function addImageAttribute(fieldKey = "custom") {
    const order = imageContainerRef.current
      ? imageContainerRef.current.childElementCount
      : imageAttributes.length;

    setImageAttributes((prev) => [
      ...prev,
      {
        field: fieldKey,
        name: "Custom",
        required: false,
        order,
        custom: true,
      },
    ]);
  }

  function renameImageAttribute(oldField, label) {
    const newField =
      label.charAt(0).toLowerCase() + label.slice(1).replaceAll(" ", "_");

    setImageAttributes((prev) =>
      prev.map((attr) =>
        attr.field === oldField
          ? { ...attr, field: newField, name: label }
          : attr,
      ),
    );
  }

  function handleFile(key, order) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = e.target.files[0];

      if (!file) return;

      const url = URL.createObjectURL(file);

      setEditImage((prev) => ({
        ...prev,
        [key]: { image: file, url, order },
      }));
    };

    input.click();
  }

  async function handleURL(key, url, order) {
    try {
      const response = await fetch(url);
      const image = await response.blob();

      setEditImage((prev) => ({
        ...prev,
        [key]: { image, url, order },
      }));
    } catch (e) {
      console.error("Image URL fetch error:", e);
    }
  }

  async function submit() {
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const data = { ...field };

      await updateProduct(uskuId, field["category_id"], data);

      const files = Object.keys(editImage).map((key) => editImage[key].image);

      const meta = {};

      Object.keys(editImage).forEach((key) => {
        const file = editImage[key].image;

        meta[file.name] = {
          image_order: editImage[key].order,
          image_type: key,
        };
      });

      if (files.length > 0) {
        await uploadImages(uskuId, files, meta);
      }

      await markComplete(uskuId);

      setSuccess(true);

      setTimeout(() => {
        navigate("/catalog");
      }, 2000);
    } catch (e) {
      console.error(e);
      setError(e.message || "could not update catalog");
    } finally {
      setSubmitting(false);
    }
  }

  // fetch attribute definitions
  useEffect(() => {
    async function fetchAttribute() {
      try {
        const data = await getAttributeFields(typeId, vertical);

        setCategoryAttributes(data.category_attributes || []);
        setImageAttributes(data.image_attributes || []);
      } catch (e) {
        setError(e.message);
      }
    }

    fetchAttribute();
  }, [typeId, vertical]);

  // fetch saved product data + images
  useEffect(() => {
    async function fetchCatalogData() {
      try {
        const data = await getProduct(uskuId);
        const product = (data["catalog-list"] && data["catalog-list"][0]) || {};

        setField({ ...product });

        for (const attr of imageAttributes) {
          try {
            const img = await getImage(uskuId, attr.field);

            setImageField((prev) => ({
              ...prev,
              [attr.field]: {
                url: img.webp_card,
                order: attr.order,
              },
            }));
          } catch (e) {
            console.error(`Could not load image for ${attr.field}:`, e);
          }
        }
      } catch (e) {
        console.error(e);
        setError(e.message);
      }
    }

    if (uskuId && imageAttributes.length > 0) {
      fetchCatalogData();
    }
  }, [uskuId, imageAttributes]);

  return (
    <div className={styles.globalEditCatalogContainer}>
      <div className={styles.top}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Edit Catalog</h1>

          <p className={styles.description}>
            Edit your catalog information and add images for your product
          </p>
        </div>

        <div className={styles.guidline}>
          <p className={styles.fieldInformation}>
            Mandatory Fields
            <span style={{ color: "red" }}>*</span>
          </p>

          <div className={styles.guidlineTag}>
            <p className={styles.guidlineText}>
              ⚠ Follow the guidelines to reduce quality check
            </p>
          </div>
        </div>

        <hr style={{ marginTop: "1rem" }} />
      </div>

      {error && <div>{error.message || String(error)}</div>}

      {success && (
        <div
          style={{
            background: "#e8f5e9",
            border: "1px solid #4caf50",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "16px",
            color: "#2e7d32",
          }}
        >
          ✓ Catalog updated successfully! Redirecting...
        </div>
      )}

      <div className={styles.bottom}>
        <div className={styles.leftSection}>
          <h2 className={styles.description}>Edit product details</h2>

          <div className={styles.infoBox}>
            Fill in all required fields marked with *<br></br>
            <p className={styles.note}>
              Mandatory fields are marked with * and must be filled before
              submitting.
            </p>
          </div>

          <div className={styles.listingInfo}>
            <h3 style={{ marginBottom: "10px" }}>Listing Information</h3>

            <ul className={styles.productAttributeList}>
              {fixedFields.map(({ key, label, required }) => {
                return (
                  <li className={styles.productAttribute} key={key}>
                    <div
                      className={styles.title}
                      style={required ? { color: "red" } : { color: "black" }}
                    >
                      {label} {required ? "*" : ""}
                    </div>

                    <input
                      type="text"
                      placeholder="Type Here..."
                      className={styles.attributeInputField}
                      value={
                        key === "discount"
                          ? (() => {
                              const factor = Math.pow(10, 2);

                              return `${
                                Math.trunc(
                                  ((field["compared_price"] - field["price"]) /
                                    field["compared_price"]) *
                                    100 *
                                    factor,
                                ) / factor
                              }%`;
                            })()
                          : field[key]
                            ? field[key]
                            : ""
                      }
                      onChange={(e) => {
                        handleEntryInput(key, e.target.value);
                      }}
                      disabled={key === "discount" ? true : false}
                    />
                  </li>
                );
              })}
            </ul>

            <h3 style={{ marginBottom: "10px" }}>Product Information</h3>

            <ul className={styles.productAttributeList}>
              {categoryAttributes.map((attr) => {
                const isDropdown =
                  attr.type === "dropdown" || Array.isArray(attr.options);

                const options = isDropdown ? attr.options || [] : [];

                return (
                  <li className={styles.productAttribute} key={attr.field}>
                    <div
                      className={styles.title}
                      style={
                        attr.required ? { color: "red" } : { color: "black" }
                      }
                    >
                      {attr.name} {attr.required ? "*" : ""}
                    </div>

                    {isDropdown ? (
                      <select
                        value={field[attr.field] || ""}
                        onChange={(e) =>
                          handleEntryInput(attr.field, e.target.value)
                        }
                        className={styles.selectField}
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
                        type="text"
                        placeholder="Type Here..."
                        className={styles.attributeInputField}
                        value={field[attr.field] ? field[attr.field] : ""}
                        onChange={(e) => {
                          handleEntryInput(attr.field, e.target.value);
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={styles.buttons}>
            <button className={styles.draft}>Save as draft</button>

            <button
              className={styles.submit}
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>

        <div className={styles.rightSection}>
          <h2>Edit Images</h2>

          <p className={styles.note}>Fields marked with * are required.</p>

          <ul className={styles.imageContainer} ref={imageContainerRef}>
            {imageAttributes.map((attr) => {
              const label =
                (attr.name || attr.field) + (attr.required ? " *" : "");

              return (
                <li
                  key={attr.field}
                  className={styles.imageCards}
                  style={{ order: attr.order }}
                >
                  <input
                    className={styles.imageTag}
                    type="text"
                    placeholder={label}
                    disabled={!attr.custom}
                    onChange={(e) => {
                      renameImageAttribute(attr.field, e.target.value);
                    }}
                    value={label}
                  />

                  <div className={styles.previewContainer}>
                    <div
                      className={styles.preview}
                      style={
                        editImage[attr.field]
                          ? {
                              backgroundImage: `url("${editImage[attr.field].url}")`,
                            }
                          : imageField[attr.field]
                            ? {
                                backgroundImage: `url("${imageField[attr.field].url}")`,
                              }
                            : {
                                backgroundImage: `url("${camera}")`,
                              }
                      }
                      onClick={() => {
                        handleFile(attr.field, attr.order);
                      }}
                    ></div>

                    <p className={styles.imageNote}>
                      {attr.required ? "Required" : "Optional"}
                    </p>
                  </div>

                  <input
                    type="text"
                    placeholder="Image link"
                    className={styles.imageFromLink}
                    onChange={(e) => {
                      handleURL(attr.field, e.target.value, attr.order);
                    }}
                  />
                </li>
              );
            })}
          </ul>

          <button
            className={styles.moreImageBttn}
            onClick={() => {
              addImageAttribute();
            }}
          >
            + Add more image
          </button>
        </div>
      </div>
    </div>
  );
}
