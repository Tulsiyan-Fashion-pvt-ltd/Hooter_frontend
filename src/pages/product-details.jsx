import { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import camera from '../assets/icons/upload_photo.svg';
import {
  getProduct,
  getProductImages,
  updateProduct,
  uploadProductImages,
  updateProductImages,
  getAttributeFields,
} from "../services/catalogService";
import { getFieldPlaceholder } from "../services/fieldPlaceholders";
import imageNA from "../assets/icons/imagena.png";
import { toSnakeCase, toPascalCase } from "../hooks/useCatalogForm";
import styles from "../css/pages/ProductDetails.module.css";
import { toastContext } from "../appContext";

const route = import.meta.env.VITE_BASEAPI





export default function ProductDetails() {
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [images, setImages] = useState([]);
  const [selectedImageType, setSelectedImageType] = useState();
  const [imagesLoading, setImagesLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(
    searchParams.get("edit") === "true",
  );
  const [saving, setSaving] = useState(false);
  const [newImageFiles, setNewImageFiles] = useState({});
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const [customAttributes, setCustomAttributes] = useState([]);
  const [listingAttributes, setListingAttributes] = useState([]);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [imageAttributes, setImageAttributes] = useState([]);
  const [attributesLoading, setAttributesLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const showToast = useContext(toastContext);
  const uskuId = searchParams.get("usku-id") || searchParams.get("id");
  // console.log(formData)
  // console.log(product)

  /**
   * SETTING THE DEFAULT SELECTED IMAGE AS THE FIRST IMAGE OF THE ATTRIBUTE 
   */
  useEffect(()=> {
    setSelectedImageType(imageAttributes[0]?.field);
  }, [imageAttributes])



  /**
   * Fetch product attributes which gets listing_attributes, category_attributes and image_attributes
   * @param {object} targetProduct 
   * @returns null
   */
  const fetchAttributes = async (targetProduct) => {
    const activeTypeId =
      targetProduct?.type_id ||
      targetProduct?.category_id ||
      targetProduct?.type ||
      searchParams.get("type") ||
      searchParams.get("type-id") ||
      "";

    const vertical =
      targetProduct?.vertical !== undefined && targetProduct?.vertical !== null
        ? targetProduct.vertical
        : searchParams.get("vertical") || "";

    if (!activeTypeId) return;

    try {
      setAttributesLoading(true);
      const data = await getAttributeFields(activeTypeId, vertical);
      if (data?.listing_attributes) {
        setListingAttributes(data.listing_attributes);
      } 
      if (data?.category_attributes) {
        setCategoryAttributes(data.category_attributes);
      }
      if (data?.image_attributes) {
        setImageAttributes(data.image_attributes);
      }
    } catch (err) {
      console.warn("Failed to fetch attributes:", err);
    } finally {
      setAttributesLoading(false);
    }
  };



  /**
   * SETTING PRODUCT DATA, `listing_attributes`, `category_attributes`
   */
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const data = await getProduct(uskuId);

        if (data) {
          setProduct(data);
          fetchAttributes(data);
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
          showToast(err, "red");
        }

        setImages(data)
      } finally {
        setImagesLoading(false);
      }
    };

    fetchImages();
  }, [uskuId, product?.usku_id, product?.sku_id, product?.image_url, imageAttributes]);



  const addCustomAttribute = () => {
    setCustomAttributes((prev) => [
      ...prev,
      {
        id: `ca_${Date.now()}`,
        name: "",
        key: "",
        value: "",
      },
    ]);
  };


  const handleCustomAttributeChange = (id, field, val) => {
    setCustomAttributes((prev) =>
      prev.map((attr) => {
        if (attr.id !== id) return attr;

        if (field === "name") {
          const raw = typeof val === "string" ? val : String(val ?? "");
          const pascalName = toPascalCase(raw.slice(0, 100));
          const displayName = raw.endsWith(" ")
            ? raw.slice(0, 100)
            : pascalName || raw.slice(0, 100);

          return {
            ...attr,
            name: displayName,
            key: toSnakeCase(raw.slice(0, 100)),
          };
        }

        if (field === "value") {
          return {
            ...attr,
            value: typeof val === "string" ? val : String(val ?? ""),
          };
        }

        return { ...attr, [field]: val };
      })
    );
  };


  const removeCustomAttribute = (id) => {
    setCustomAttributes((prev) => prev.filter((attr) => attr.id !== id));
  };

  const formatFieldName = (key) =>
    key ? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  const validateField = (key, value, attrMeta = null) => {
    const isRequired = Boolean(
      attrMeta?.required ||
      key === "sku_id" ||
      key === "product_title" ||
      key === "price" ||
      key === "compared_price" ||
      key === "brand_name"
    );

    const strVal = value !== undefined && value !== null ? String(value).trim() : "";

    // 1. Required Check
    if (isRequired && strVal === "") {
      const label = attrMeta?.name || formatFieldName(key);
      return `${label} is required.`;
    }

    if (strVal === "") {
      return null;
    }

    // 2. Max length check
    const maxLen = attrMeta?.max_length || (
      key === "sku_id" ? 100 :
      key === "product_title" ? 200 :
      key === "product_desc" || key === "description" ? 5000 :
      key === "brand_name" || key === "vendor" ? 255 :
      key === "tags" ? 500 :
      key === "upc" ? 12 :
      key === "ean" || key === "isbn" ? 13 :
      key === "gtin" ? 14 :
      key === "hsn_code" || key === "hsn" ? 8 :
      null
    );

    if (maxLen && strVal.length > maxLen) {
      const label = attrMeta?.name || formatFieldName(key);
      return `${label} cannot exceed ${maxLen} characters (currently ${strVal.length}).`;
    }

    // 3. Numeric / Decimal check
    const isNumeric =
      attrMeta?.type === "decimal" ||
      attrMeta?.type === "integer" ||
      attrMeta?.type === "number" ||
      [
        "price",
        "compared_price",
        "purchasing_cost",
        "net_weight_kg",
        "dead_weight_kg",
        "volumetric_weight_kg",
      ].includes(key);

    if (isNumeric) {
      const num = Number(strVal);
      const label = attrMeta?.name || formatFieldName(key);
      if (isNaN(num)) {
        return `${label} must be a valid number.`;
      }
      if (num < 0) {
        return `${label} cannot be negative.`;
      }
      if (attrMeta?.type === "integer" && !Number.isInteger(num)) {
        return `${label} must be a whole number (integer).`;
      }
      if ((key === "price" || key === "compared_price") && num <= 0) {
        return `${label} must be greater than 0.`;
      }
    }

    // 4. Identifier specific checks
    if (key === "upc") {
      if (!/^\d{1,12}$/.test(strVal)) {
        return "UPC must be up to 12 numeric digits.";
      }
    }

    if (key === "ean") {
      if (!/^\d{1,13}$/.test(strVal)) {
        return "EAN must be up to 13 numeric digits.";
      }
    }

    if (key === "gtin") {
      if (!/^\d{1,14}$/.test(strVal)) {
        return "GTIN must be up to 14 numeric digits.";
      }
    }

    if (key === "isbn") {
      if (!/^[\d-]{10,17}$/.test(strVal)) {
        return "ISBN must be a valid 10 or 13-digit code.";
      }
    }

    if (key === "hsn_code" || key === "hsn") {
      if (!/^\d{2,8}$/.test(strVal)) {
        return "HSN Code must be 2 to 8 numeric digits.";
      }
    }

    return null;
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setErrors({});
    setNewImageFiles({});
  };


  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({});
    setCustomAttributes([]);
    setErrors({});
    setNewImageFiles({});
  };


  /**
   * Set form data to update the product details for listing_attributes and category_attributes
   * @param {string} attType - listing_attributes or category_attributes
   * @param {string} key - attribute
   * @param {string| value} value - data
   */
  const handleInputChange = (attType, key, value) => {
    setFormData((prev) => {
      const next = {
        ...prev,
        [attType]: {...prev[attType], [key]: value}
      };
      return next;
    });

    const meta =
      categoryAttributes.find((a) => a.field === key) ||
      listingAttributes.find((a) => a.field === key);
    const err = validateField(key, value, meta);

    setErrors((prev) => {
      const next = { ...prev };
      if (err) {
        next[key] = err;
      } else {
        delete next[key];
        if (key === "product_desc") delete next.description;
        if (key === "description") delete next.product_desc;
        if (key === "hsn_code") delete next.hsn;
        if (key === "hsn") delete next.hsn_code;
      }
      return next;
    });
  };

  const handleImageUpload = (e) => {
    // const file = e.target.files?.[0];
    // if (!file) return;

    // const url = URL.createObjectURL(file);
    // const currentImg = images[selectedImageType];
    // let imageType = currentImg?.type;

    // if (!imageType) {
    //   const matchedAttr = imageAttributes[selectedImageType];
    //   imageType = matchedAttr?.field || matchedAttr?.type || `image_${selectedImageType + 1}`;
    // }

    // const assignedOrder = currentImg?.order || (imageAttributes[selectedImageType]?.order ?? (selectedImageType + 1));

    // setNewImageFiles((prev) => ({
    //   ...prev,
    //   [imageType]: { image: file, order: assignedOrder },
    // }));

    // setImages((prev) => {
    //   const updated = [...prev];
    //   if (updated[selectedImageType]) {
    //     updated[selectedImageType] = {
    //       ...updated[selectedImageType],
    //       mainUrl: url,
    //       thumbUrl: url,
    //       originalUrl: url,
    //     };
    //   } else {
    //     updated.push({
    //       id: imageType,
    //       type: imageType,
    //       order: assignedOrder,
    //       mainUrl: url,
    //       thumbUrl: url,
    //       originalUrl: url,
    //     });
    //   }
    //   return updated;
    // });

    // showToast("Image updated. Click 'Save changes' to save.", "green");
  };


  const handleAddMoreImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImages((prev) => {
      const updated = [...prev];
      const newFilesObj = {};

      files.forEach((file, idx) => {
        // Find if any imageAttribute is not yet covered
        const existingTypes = new Set(updated.map((img) => String(img.type || "").toLowerCase()));
        const unfilledAttr = imageAttributes.find(
          (attr) => !existingTypes.has(String(attr.field || attr.type || attr.handle || "").toLowerCase())
        );

        let newType = unfilledAttr ? (unfilledAttr.field || unfilledAttr.type || unfilledAttr.handle) : null;
        let nextOrder = unfilledAttr ? Number(unfilledAttr.order ?? (updated.length + 1)) : (updated.length + 1);

        if (!newType) {
          newType = `image_${Date.now()}_${idx + 1}`;
        }

        const url = URL.createObjectURL(file);
        newFilesObj[newType] = { image: file, order: nextOrder };

        updated.push({
          id: newType,
          type: newType,
          order: nextOrder,
          mainUrl: url,
          thumbUrl: url,
          originalUrl: url,
        });
      });

      // Sort according to imageAttributes order
      updated.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

      setNewImageFiles((prevNew) => ({
        ...prevNew,
        ...newFilesObj,
      }));

      setSelectedImageType(updated.length - 1);
      return updated;
    });

    showToast(`${files.length} new image(s) added. Click 'Save changes' to save.`, "green");
    e.target.value = "";
  };



  const handleSave = async () => {
    if (saving) return;

    // Validate ALL fields across listing_attributes, category_attributes, and core keys
    const newErrors = {};

    if (listingAttributes.length > 0) {
      listingAttributes.forEach((attr) => {
        const val = formData[attr.field];
        const err = validateField(attr.field, val, attr);
        if (err) newErrors[attr.field] = err;
      });
    }

    if (categoryAttributes.length > 0) {
      categoryAttributes.forEach((attr) => {
        if (attr.field === "niche_id") return;
        const val = formData[attr.field];
        const err = validateField(attr.field, val, attr);
        if (err) newErrors[attr.field] = err;
      });
    }

    const essentialFields = [
      { key: "sku_id", label: "SKU ID", max: 100 },
      { key: "product_title", label: "Product Title", max: 200 },
      { key: "price", label: "Price", numeric: true },
      { key: "compared_price", label: "Compared Price", numeric: true },
      { key: "brand_name", label: "Brand Name", max: 255 },
    ];

    essentialFields.forEach(({ key, label, max, numeric }) => {
      if (!newErrors[key]) {
        const val = formData[key];
        const err = validateField(key, val, {
          name: label,
          required: true,
          max_length: max,
          type: numeric ? "decimal" : "string",
        });
        if (err) newErrors[key] = err;
      }
    });

    if (imageAttributes.length > 0) {
      const existingImageTypes = new Set(
        images
          .filter((img) => img.mainUrl || img.thumbUrl)
          .map((img) => String(img.type || "").toLowerCase())
      );
      const newUploadedTypes = new Set(
        Object.keys(newImageFiles).map((k) => k.toLowerCase())
      );

      const missingRequired = imageAttributes.filter((attr) => {
        if (!attr.required) return false;
        const attrKey = String(attr.type || attr.field || "").toLowerCase();
        return (
          !existingImageTypes.has(attrKey) &&
          !newUploadedTypes.has(attrKey) &&
          images.length === 0
        );
      });

      if (missingRequired.length > 0) {
        const missingLabels = missingRequired
          .map((a) => a.name || formatFieldName(a.type || a.field))
          .join(", ");
        newErrors.images = `Required images missing: ${missingLabels}`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstMsg = Object.values(newErrors)[0];
      showToast(firstMsg, "red");
      return;
    }

    setErrors({});

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

      const listingAttributesPayload = {};
      const categoryAttributesPayload = {};

      if (listingAttributes.length > 0) {
        listingAttributes.forEach((attr) => {
          const val = formData[attr.field];
          if (val !== undefined && val !== null && val !== "") {
            if (
              (attr.type === "decimal" ||
                attr.type === "integer" ||
                attr.type === "number" ||
                numericFields.has(attr.field)) &&
              !isNaN(Number(val))
            ) {
              listingAttributesPayload[attr.field] = Number(val);
            } else {
              listingAttributesPayload[attr.field] = val;
            }
          }
        });
      } else {
        const fallbackFixedKeys = [
          "sku_id",
          "product_title",
          "product_desc",
          "description",
          "price",
          "compared_price",
          "purchasing_cost",
          "vendor",
          "brand_name",
          "tags",
          "upc",
          "ean",
          "gtin",
          "isbn",
          "hsn_code",
          "hsn",
          "net_weight_kg",
          "dead_weight_kg",
          "volumetric_weight_kg",
        ];
        fallbackFixedKeys.forEach((key) => {
          const val = formData[key];
          if (val !== undefined && val !== null && val !== "") {
            if (numericFields.has(key) && !isNaN(Number(val))) {
              listingAttributesPayload[key] = Number(val);
            } else {
              listingAttributesPayload[key] = val;
            }
          }
        });
      }

      if (categoryAttributes.length > 0) {
        categoryAttributes.forEach((attr) => {
          if (attr.field === "niche_id") return;
          const val = formData[attr.field];
          if (val !== undefined && val !== null && val !== "") {
            if (
              (attr.type === "decimal" ||
                attr.type === "integer" ||
                attr.type === "number" ||
                numericFields.has(attr.field)) &&
              !isNaN(Number(val))
            ) {
              categoryAttributesPayload[attr.field] = Number(val);
            } else {
              categoryAttributesPayload[attr.field] = val;
            }
          }
        });
      }

      const ignoredKeys = new Set([
        ...Object.keys(listingAttributesPayload),
        ...Object.keys(categoryAttributesPayload),
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

      // Merge user-defined custom attributes into the category attributes payload (like in add single product).
      // Keys are normalized in snake_case and values are stored as trimmed strings.
      const customAttributesObj = {};
      customAttributes.forEach(({ key, name, value }) => {
        const snakeKey = toSnakeCase(key || name);
        if (!snakeKey || value === undefined || value === "") return;
        const trimmedVal = String(value).trim();
        categoryAttributesPayload[snakeKey] = trimmedVal;
        customAttributesObj[snakeKey] = trimmedVal;
      });

      await updateProduct(
        activeUskuId,
        activeTypeId,
        listingAttributesPayload,
        categoryAttributesPayload,
      );

      if (Object.keys(newImageFiles).length > 0) {
        try {
          // Use PUT /catalog/images/{usku_id} to update product images, with fallback to POST
          try {
            await updateProductImages(activeUskuId, newImageFiles);
          } catch (putErr) {
            console.warn("PUT /catalog/images failed, attempting POST fallback:", putErr);
            await uploadProductImages(activeUskuId, newImageFiles);
          }
        } catch (imgErr) {
          console.warn("Image upload warning:", imgErr);
        }
      }

      // setProduct((prev) => ({
      //   ...prev,
      //   ...customAttributesObj,
      // }));
      // setFormData((prev) => ({
      //   ...prev,
      //   ...customAttributesObj,
      // }));
      setCustomAttributes([]);
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

  /**
   * FINDING CUSTOM ATTRIBUTE
   */
  const displayData =  product;

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
    ean,
    hsn,
    product_desc,
    description,
  } = displayData;

  const productTypeName =
    displayData.type_name ||
    displayData.product_type ||
    displayData.category_name ||
    displayData.type ||
    displayData.category ||
    displayData.type_name||
    searchParams.get("type-name") ||
    searchParams.get("type") ||
    "";


  const currentImage = images[selectedImageType] || images.main || null;
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


  const categoryAttributesMap = categoryAttributes.reduce((acc, attr) => {
    if (attr.field) acc[attr.field] = attr;
    return acc;
  }, {});

  const listingAttributesMap = listingAttributes.reduce((acc, attr) => {
    if (attr.field) acc[attr.field] = attr;
    return acc;
  }, {});

  const getUnit = (key) => {
    if (!key) return "";
    if (key.endsWith("_kg")) return "kg";
    if (key.endsWith("_meters") || key.endsWith("_meter")) return "m";
    if (key.endsWith("_cm")) return "cm";
    if (key.endsWith("_mm")) return "mm";
    if (key.endsWith("_in") || key.endsWith("_inches")) return "in";
    return "";
  };

  const formatLabel = (str) =>
    str ? str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  // 1. Dynamic Category Attributes
  let categoryItems = [];
  if (categoryAttributes.length > 0) {
    categoryItems = categoryAttributes
      .filter((attr) => attr.field && attr.field !== "niche_id")
      .map((attr) => ({
        attType: "category_attributes",
        label: attr.name || formatLabel(attr.field),
        fieldKey: attr.field,
        type:
          attr.type === "decimal" ||
          attr.type === "integer" ||
          attr.type === "number"
            ? "number"
            : "text",
        unit: getUnit(attr.field),
        attrMeta: attr,
      }));
  } 


  // 2. Dynamic Listing Attributes (excluding fields featured in header / commercial summary)
  const headerOrSummaryKeys = new Set([
    "sku_id",
    "product_title",
    "product_desc",
    "description",
    "price",
    "compared_price",
    "purchasing_cost",
    "brand_name",
  ]);

  let listingItems = [];
  if (listingAttributes.length > 0) {
    listingItems = listingAttributes
      .filter((attr) => attr.field && !headerOrSummaryKeys.has(attr.field))
      .map((attr) => ({
        attType: "listing_attributes",
        label: attr.name || formatLabel(attr.field),
        fieldKey: attr.field,
        type:
          attr.type === "decimal" ||
          attr.type === "integer" ||
          attr.type === "number"
            ? "number"
            : "text",
        unit: getUnit(attr.field),
        attrMeta: attr,
      }));
  }

  // 3. Extra Attributes present on product
  const allKnownFieldKeys = new Set([
    ...headerOrSummaryKeys,
    ...categoryItems.map((i) => i.fieldKey),
    ...listingItems.map((i) => i.fieldKey),
    "discount",
    "category_id",
    "type_id",
    "type",
    "type_name",
    "product_type",
    "category_name",
    "id",
    "usku_id",
    "status",
    "color",
    "collection_id",
    "vendor",
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

  // 
  const extraItems = Object.keys(displayData)
    .filter(
      (key) =>
        !allKnownFieldKeys.has(key) &&
        typeof displayData[key] !== "object",
    )
    .map((key) => ({
      label: formatLabel(key),
      fieldKey: key,
      type: typeof displayData[key] === "number" ? "number" : "text",
      unit: getUnit(key),
      attrMeta: null,
    }));

  const chunkIntoCols = (list, numCols = 3) => {
    const cols = Array.from({ length: numCols }, () => []);
    list.forEach((item, index) => {
      cols[index % numCols].push(item);
    });
    return cols;
  };

  const renderedCategoryCols = chunkIntoCols(categoryItems, 3);
  const renderedListingCols = chunkIntoCols(listingItems, 3);
  const renderedExtraCols = chunkIntoCols(extraItems, 3);
  const renderSpecRow = (
    label,
    fieldKey,
    type = "text",
    unit = "",
    attType = null,
    attrMeta = null
  ) => {
    const meta =
      attrMeta ||
      categoryAttributesMap[fieldKey] ||
      listingAttributesMap[fieldKey];
    const isDropdown =
      meta &&
      (meta.type === "dropdown" || Array.isArray(meta.options));
    const options = isDropdown ? meta.options || [] : [];
    const isRequired = Boolean(meta?.required);
    const placeholder = meta
      ? getFieldPlaceholder(meta)
      : `Enter ${label.toLowerCase()}`;
    const description = meta?.description;
    const maxLength = meta?.max_length;
    const currentVal = formData[attType]?.[fieldKey] ?? product[fieldKey];
    const hasError = Boolean(errors[fieldKey]);
    const isNumeric =
      meta?.type === "decimal" ||
      meta?.type === "integer" ||
      meta?.type === "number" ||
      type === "number";

    return (
      <div
        className={`${styles.specRow} ${isEditing ? styles.specRowEditing : ""} ${hasError ? styles.specRowHasError : ""}`}
        key={fieldKey}
      >
        <span className={styles.specLabel}>
          <span className={styles.specLabelWrap}>
            {label}
            {isRequired && <span className={styles.requiredStar}>*</span>}
            {description && (
              <span className={styles.pillDescription}>
                ?
                <span className={styles.descriptionTooltip}>
                  {description}
                </span>
              </span>
            )}
          </span>
        </span>
        {isEditing ? (
          <div className={styles.specEditContainer}>
            {isDropdown ? (
              <select
                className={`${styles.editSpecSelect} ${hasError ? styles.inputError : ""}`}
                value={currentVal}
                onChange={(e) => handleInputChange(attType, fieldKey, e.target.value)}
                required={isRequired}
              >
                <option value="">Select...</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <div className={styles.specInputWrap}>
                <input
                  type={isNumeric ? "number" : "text"}
                  step={
                    meta?.type === "integer"
                      ? "1"
                      : isNumeric
                        ? "0.01"
                        : undefined
                  }
                  maxLength={maxLength}
                  required={isRequired}
                  disabled={
                    fieldKey === "type_name" ||
                    fieldKey === "product_type" ||
                    fieldKey === "type" ||
                    fieldKey === "category_name" ||
                    fieldKey === "type_id"
                  }
                  className={`${styles.editSpecInput} ${
                    fieldKey === "type_name" ||
                    fieldKey === "product_type" ||
                    fieldKey === "type" ||
                    fieldKey === "category_name" ||
                    fieldKey === "type_id"
                      ? styles.editSpecInputDisabled
                      : ""
                  } ${hasError ? styles.inputError : ""}`}
                  value={currentVal}
                  onChange={(e) => handleInputChange(attType, fieldKey, e.target.value)}
                  placeholder={placeholder}
                />
                {unit && <span className={styles.unitBadge}>{unit}</span>}
              </div>
            )}
            {maxLength && !isNumeric && !isDropdown && (
              <div className={styles.charCount}>
                {String(currentVal).length} / {maxLength}
              </div>
            )}
            {hasError && (
              <div className={styles.fieldErrorText}>⚠ {errors[fieldKey]}</div>
            )}
          </div>
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
              <div className={styles.titleInputWrap}>
                <label className={styles.headerFieldLabel}>
                  Product Title <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  type="text"
                  className={`${styles.titleInput} ${errors.product_title ? styles.inputError : ""}`}
                  value={formData.listing_attributes?.product_title || product.product_title}
                  maxLength={200}
                  onChange={(e) =>
                    handleInputChange("listing_attributes", "product_title", e.target.value)
                  }
                  placeholder="Enter product title *"
                />
                {errors.product_title && (
                  <div className={styles.headerErrorText}>
                    ⚠ {errors.product_title}
                  </div>
                )}
              </div>
            ) : (
              <h1 className={styles.title}>
                {product_title || "Untitled Product"}
              </h1>
            )}

            {/* Non-editable Type Name */}
            {productTypeName && (
              <div className={styles.typeWrap}>
                {isEditing && (
                  <span className={styles.headerFieldLabel}>Type</span>
                )}
                <span
                  className={styles.typeBadge}
                  title={`Type: ${productTypeName} (Non-editable)`}
                >
                  {productTypeName}
                </span>
              </div>
            )}

            <div className={styles.statusWrap}>
              {isEditing && (
                <span className={styles.headerFieldLabel}>Status</span>
              )}
              <span className={styles.statusBadge}>{status}</span>
            </div>

            {isEditing ? (
              <div className={styles.skuInputWrap}>
                <label className={styles.headerFieldLabel}>
                  SKU ID <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  type="text"
                  className={`${styles.skuInput} ${errors.sku_id ? styles.inputError : ""}`}
                  value={formData.listing_attributes?.sku_id || product.sku_id || ""}
                  maxLength={100}
                  onChange={(e) => handleInputChange("listing_attributes", "sku_id", e.target.value)}
                  placeholder="SKU ID *"
                  title="SKU ID"
                />
                {errors.sku_id && (
                  <div className={styles.headerErrorText}>⚠ {errors.sku_id}</div>
                )}
              </div>
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

      </div>

      <div className={styles.content}>
        <div className={styles.topSection}>
          {/* Image Gallery */}
          {imageAttributes.length > 0 && currentImage ? (
            <div className={styles.gallery}>
              <div className={styles.thumbnails}>
                {/* {images.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className={
                      selectedImageType === idx
                        ? styles.thumbWrapActive
                        : styles.thumbWrap
                    }
                    onClick={() => setSelectedImageType(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedImageType(idx);
                      }
                    }}
                    title={
                      img.type
                        ? `View ${img.type} image`
                        : `View image ${idx + 1}`
                    }
                  >
                    <p>{img.type}</p>
                    <img
                      src={img.thumbUrl || img.mainUrl || imageNA}
                      alt={img.type || `Thumbnail ${idx + 1}`}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = imageNA;
                      }}
                    />
                  </div>
                ))} */}

                {
                  imageAttributes.map((attribute, idx) => {
                    // console.log(attribute)
                    const imageURL = images[attribute.field]? `${route}/${images[attribute.field]?.image_urls?.webp_card}`: camera;
                    return (
                      <div
                        key={attribute.id || idx}
                        className={
                          selectedImageType === attribute.field
                            ? styles.thumbWrapActive
                            : styles.thumbWrap
                        }
                        onClick={() => setSelectedImageType(attribute.field)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedImageType(attribute.field);
                          }
                        }}
                        title={
                          attribute.handle
                            ? `View ${attribute.handle} image`
                            : `View image ${attribute.order}`
                        }
                      >
                        <p className={styles.imageTab}>{attribute.name}{attribute.required == true?<span style={{"color": "red"}}>*</span>: ""}</p>
                        <div className={styles.thumbnailPreviewContainer}>
                          <img
                            src={imageURL}
                            alt={attribute.field || `Thumbnail ${idx + 1}`}
                            className={images[attribute.field]? styles.imageThumbnailPreview: styles.noImageCamera}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = imageNA;
                            }}
                          />
                        </div>
                      </div>
                    )
                  })
                }

                {isEditing && (
                  <label
                    className={styles.addThumbWrap}
                    title="Add more product images"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={handleAddMoreImages}
                    />
                    <span className={styles.addThumbIcon}>+</span>
                    <span>Add</span>
                  </label>
                )}
              </div>

              <div className={styles.mainImage}>
                {/* {()=>{console.log(images[selectedImageType]?.image_urls.high_resol_webp)}} */}
                <img
                  src={images[selectedImageType] ? `${route}/${images[selectedImageType]?.image_urls.high_resol_webp }`: camera}
                  alt={currentImage.type || product_title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = imageNA;
                  }}
                />

                {isEditing && (
                  <div className={styles.imageTypeBadge}>
                    <span>{currentImage.type || `Image ${selectedImageType + 1}`}</span>
                    {(() => {
                      const matchedMeta = imageAttributes.find(
                        (a) =>
                          (a.type || a.field || "").toLowerCase() ===
                          (currentImage.type || "").toLowerCase()
                      );
                      return matchedMeta?.required ? (
                        <span className={styles.imageRequiredBadge}>Required</span>
                      ) : (
                        <span className={styles.imageOptionalBadge}>Optional</span>
                      );
                    })()}
                  </div>
                )}

                {isEditing && (
                  <div className={styles.galleryActions}>
                    <label
                      className={styles.galleryActionBtn}
                      title="Upload replacement for this image"
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
                      Replace
                    </label>

                    <label
                      className={`${styles.galleryActionBtn} ${styles.galleryActionBtnPrimary}`}
                      title="Add more images to this product"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleAddMoreImages}
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Images
                    </label>
                  </div>
                )}

                {isEditing && errors.images && (
                  <div className={styles.imageErrorBadge}>
                    <span>⚠ {errors.images}</span>
                  </div>
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
                <img
                  src={imageNA}
                  alt="No image available"
                  className={styles.placeholderImg}
                />
                <span className={styles.noImageText}>No image available</span>
                {isEditing && (
                  <label
                    className={styles.saveBtn}
                    style={{
                      fontSize: "12px",
                      padding: "6px 14px",
                      marginTop: "10px",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={handleAddMoreImages}
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
                <div className={styles.label}>
                  Current Price <span className={styles.requiredStar}>*</span>
                </div>
                {isEditing ? (
                  <div className={styles.currencyInputWrapContainer}>
                    <div
                      className={`${styles.currencyInputWrap} ${errors.price ? styles.inputErrorWrap : ""}`}
                    >
                      <span className={styles.currencySymbol}>₹</span>
                      <input
                        type="number"
                        step="1.00"
                        className={styles.editInputPrice}
                        value={formData.listing_attributes?.price ?? product.price}
                        onChange={(e) =>
                          handleInputChange("listing_attributes", "price", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>
                    {errors.price && (
                      <div className={styles.fieldErrorText}>
                        ⚠ {errors.price}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.valueLarge}>
                    ₹{price ? parseInt(price).toLocaleString("en-IN") : "-"}
                  </div>
                )}
              </div>
              <div>
                <div className={styles.label}>
                  Compared Price <span className={styles.requiredStar}>*</span>
                </div>
                {isEditing ? (
                  <div className={styles.currencyInputWrapContainer}>
                    <div
                      className={`${styles.currencyInputWrap} ${errors.compared_price ? styles.inputErrorWrap : ""}`}
                    >
                      <span className={styles.currencySymbol}>₹</span>
                      <input
                        type="number"
                        step="0.01"
                        className={styles.editInputCompared}
                        value={formData.listing_attributes?.compared_price ?? product.compared_price}
                        onChange={(e) =>
                          handleInputChange("listing_attributes", "compared_price", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>
                    {errors.compared_price && (
                      <div className={styles.fieldErrorText}>
                        ⚠ {errors.compared_price}
                      </div>
                    )}
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
                  <div className={styles.currencyInputWrapContainer}>
                    <div
                      className={`${styles.currencyInputWrap} ${errors.purchasing_cost ? styles.inputErrorWrap : ""}`}
                    >
                      <span className={styles.currencySymbol}>₹</span>
                      <input
                        type="number"
                        step="0.01"
                        className={styles.editInputCompared}
                        value={formData.listing_attributes?.purchasing_cost ?? product.purchasing_cost}
                        onChange={(e) =>
                          handleInputChange("listing_attributes", "purchasing_cost", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>
                    {errors.purchasing_cost && (
                      <div className={styles.fieldErrorText}>
                        ⚠ {errors.purchasing_cost}
                      </div>
                    )}
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
                <div className={styles.label}>
                  Brand <span className={styles.requiredStar}>*</span>
                </div>
                {isEditing ? (
                  <div className={styles.editInputGroup}>
                    <input
                      type="text"
                      className={`${styles.editInputSmall} ${errors.brand_name ? styles.inputError : ""}`}
                      value={formData.listing_attributes?.brand_name || product.brand_name}
                      maxLength={255}
                      onChange={(e) =>
                        handleInputChange("listing_attributes", "brand_name", e.target.value)
                      }
                      placeholder="Brand name *"
                    />
                    {errors.brand_name && (
                      <div className={styles.fieldErrorText}>
                        ⚠ {errors.brand_name}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.value}>{brand_name || "-"}</div>
                )}
              </div>
              {/* <div>
                <div className={styles.label}>Collection</div>
                {isEditing ? (
                  <input
                    type="text"
                    className={styles.editInputSmall}
                    value={formData.listing_attributes?.collection_id || ""}
                    onChange={(e) =>
                      handleInputChange("listing_attributes", "collection_id", e.target.value)
                    }
                    placeholder="Collection ID"
                  />
                ) : (
                  <div className={styles.value}>{collection_id || "-"}</div>
                )}
              </div> */}
              <div>
                <div className={styles.label}>Vendor</div>
                {isEditing ? (
                  <div className={styles.editInputGroup}>
                    <input
                      type="text"
                      className={`${styles.editInputSmall} ${errors.vendor ? styles.inputError : ""}`}
                      value={formData.listing_attributes?.vendor || product.vendor}
                      maxLength={255}
                      onChange={(e) =>
                        handleInputChange("listing_attributes", "vendor", e.target.value)
                      }
                      placeholder="Vendor"
                    />
                    {errors.vendor && (
                      <div className={styles.fieldErrorText}>
                        ⚠ {errors.vendor}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.value}>{vendor || "-"}</div>
                )}
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
              <h2 className={styles.descriptionTitle}>
                Product Description
                {isEditing && <span className={styles.requiredStar}>*</span>}
              </h2>
              {isEditing ? (
                <div className={styles.descInputWrap}>
                  <textarea
                    className={`${styles.editDescTextarea} ${errors.product_desc || errors.description ? styles.inputError : ""}`}
                    rows={4}
                    maxLength={5000}
                    value={formData.listing_attributes?.product_desc ?? product.product_desc ?? ""}
                    onChange={(e) => {
                      handleInputChange("listing_attributes", "product_desc", e.target.value);
                      handleInputChange("listing_attributes", "description", e.target.value);
                    }}
                    placeholder="Enter product description *"
                  />
                  <div className={styles.descMetaRow}>
                    <span className={styles.charCount}>
                      {String(formData.listing_attributes?.product_desc ?? formData.description ?? "").length} / 5000
                    </span>
                    {(errors.product_desc || errors.description) && (
                      <span className={styles.fieldErrorText}>
                        ⚠ {errors.product_desc || errors.description}
                      </span>
                    )}
                  </div>
                </div>
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

            {/* Category Specifications Box */}
            <div className={styles.specsBox}>
              <h2 className={styles.sectionTitle}>
                {categoryAttributes.length > 0
                  ? "Category Specifications"
                  : "Product Specifications"}
              </h2>
              <p className={styles.sectionSubhead}>
                {categoryAttributes.length > 0
                  ? "Category-specific attributes for this product type"
                  : "Specifications and technical details"}
              </p>

              {attributesLoading && (
                <div className={styles.attributesLoading}>
                  <span className={styles.buttonSpinner}></span>
                  Loading category attributes & descriptions...
                </div>
              )}

              <div className={styles.specsGrid}>
                {renderedCategoryCols.map((colItems, colIdx) => (
                  <div className={styles.specsCol} key={`cat-col-${colIdx}`}>
                    {colItems.map((item) =>
                      renderSpecRow(
                        item.label,
                        item.fieldKey,
                        item.type,
                        item.unit,
                        item.attType,
                        item.attrMeta
                      ),
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Listing Information Box */}
            {listingItems.length > 0 && (
              <div className={styles.specsBox} style={{ marginTop: "24px" }}>
                <h2 className={styles.sectionTitle}>Listing Information</h2>
                <p className={styles.sectionSubhead}>
                  Marketplace identifiers, packaging weights, and listing properties
                </p>

                <div className={styles.specsGrid}>
                  {renderedListingCols.map((colItems, colIdx) => (
                    <div className={styles.specsCol} key={`list-col-${colIdx}`}>
                      {colItems.map((item) =>
                        renderSpecRow(
                          item.label,
                          item.fieldKey,
                          item.type,
                          item.unit,
                          item.attType,
                          item.attrMeta
                        ),
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Attributes Box (includes Custom Attributes in Edit Mode) */}
            {(extraItems.length > 0 || isEditing) && (
              <div className={styles.specsBox} style={{ marginTop: "24px" }}>
                <h2 className={styles.sectionTitle}>Additional Details</h2>
                <p className={styles.sectionSubhead}>
                  Custom and supplemental product specifications
                </p>

                {extraItems.length > 0 && (
                  <div className={styles.specsGrid}>
                    {renderedExtraCols.map((colItems, colIdx) => (
                      <div className={styles.specsCol} key={`extra-col-${colIdx}`}>
                        {colItems.map((item) =>
                          renderSpecRow(
                            item.label,
                            item.fieldKey,
                            item.type,
                            item.unit,
                            item.attType,
                            item.attrMeta
                          ),
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom Attributes inside Additional Details */}
                {isEditing && (
                  <>
                    {customAttributes.length > 0 && (
                      <div
                        className={styles.customAttrsContainer}
                        style={{ marginTop: extraItems.length > 0 ? "20px" : "0" }}
                      >
                        {customAttributes.map((attr) => (
                          <div className={styles.customAttrRow} key={attr.id}>
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
                              className={styles.customAttrNameInput}
                            />

                            <div className={styles.customAttrValueWrap}>
                              <input
                                type="text"
                                placeholder="Enter the attribute description"
                                value={attr.value || ""}
                                onChange={(e) =>
                                  handleCustomAttributeChange(
                                    attr.id,
                                    "value",
                                    e.target.value,
                                  )
                                }
                                className={styles.customAttrValueInput}
                              />

                              <button
                                type="button"
                                onClick={() => removeCustomAttribute(attr.id)}
                                title="Remove attribute"
                                className={styles.removeAttrBtn}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={addCustomAttribute}
                      className={styles.addCustomAttrBtn}
                    >
                      <span className={styles.addBtnIcon}>+</span>
                      Add Custom Attribute
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Bottom Cards */}
            <div className={styles.bottomCardsGrid}>
              {/* <div className={styles.card}>
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
                        value={formData.listing_attributes?.price ?? product.price}
                        onChange={(e) =>
                          handleInputChange("listing_attributes", "price", e.target.value)
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
                        value={formData.listing_attributes?.compared_price ?? ""}
                        onChange={(e) =>
                          handleInputChange("listing_attributes", "compared_price", e.target.value)
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
                        value={formData.listing_attributes?.purchasing_cost ?? ""}
                        onChange={(e) =>
                          handleInputChange("listing_attributes", "purchasing_cost", e.target.value)
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
              </div> */}

              {/* <div className={styles.card}>
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
                        value={formData.listing_attributes?.sku_id || ""}
                        onChange={(e) =>
                          handleInputChange("listing_attributes", "sku_id", e.target.value)
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
                        value={formData.listing_attributes?.ean || ""}
                        onChange={(e) =>
                          handleInputChange("listing_attributes", "ean", e.target.value)
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
                        value={formData.listing_attributes?.hsn || ""}
                        onChange={(e) =>
                          handleInputChange("listing_attributes", "hsn", e.target.value)
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
              </div> */}

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
