import { useState, useEffect, useContext, useRef } from "react";
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
import { toSnakeCase, toPascalCase, toNameCase } from "../services/textFormate";
import styles from "../css/pages/ProductDetails.module.css";
import { toastContext } from "../appContext";
const host = import.meta.env.VITE_BASEAPI;




export default function ProductDetails() {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [attributeData, setAttributeData] = useState([]);
  const [attributesLoading, setAttributesLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [variants, setVariants] = useState([]);
  const [uploadVariants, setUploadVariants] = useState([]);

  const thumbnailsRef = useRef(null);
  const showToast = useContext(toastContext);
  const [uskuId, setUskuId] = useState(searchParams.get("usku-id") || searchParams.get("id"));
  const typeId = searchParams.get("type") || searchParams.get("type-id");
  console.log(uploadVariants)  

  /** Fetch variants only once */
  useEffect(()=>{
      fetchProductVariants();
  }, [])

  /**
   * Prevents the tab from closing by mistake
   */
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      console.log('working')
      if (!isEditing || (isEditing && (Object.keys(newImageFiles).length == 0 && Object.keys(formData).length == 0))) return;
      console.log(!isEditing || (isEditing && (Object.keys(newImageFiles).length == 0 && Object.keys(formData).length == 0)))
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isEditing, formData, newImageFiles]);



  /**
   * SETTING THE DEFAULT SELECTED IMAGE AS THE FIRST IMAGE OF THE ATTRIBUTE 
   */
  useEffect(() => {
    setSelectedImageType(imageAttributes[0]?.field);
  }, [imageAttributes])

  /**
 * SETTING PRODUCT DATA, `listing_attributes`, `category_attributes`
 */
  useEffect(() => {
    if (uskuId) {
      fetchProductDetails();
      fetchImages();
    }

  }, [uskuId]);

  useEffect(() => {
    listCustomImages();
  }, [listingAttributes, images])


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
      setAttributeData(data);
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


  async function fetchProductVariants() {
    try {
      const response = await fetch(`${host}/catalog/variants/${uskuId}`, {
        "credentials": "include"
      })
      const data = await response.json();

      if (!response.ok) showToast(data?.message ?? "Could not fetch the product variants", "red");

      setVariants(data)
    }
    catch (e) {
      console.error(e);
      showToast('Failed to get product variants', 'red');
    }
  }

  /**
   * Add custom images to the imageAttributes
   */
  const listCustomImages = () => {
    setImageAttributes((prev) => {
      // const unmatchedImages = Object.keys(images);
      const customImages = []
      const attributeFields = prev.map((attr) => {
        return attr.field;
      })


      Object.keys(images).map((key) => {
        if (!attributeFields.includes(key)) customImages.push(key)
      })

      return [
        ...prev,
        ...customImages.map((image) => ({
          description: `Custom ${image} image`,
          field: image,
          handle: image,
          name: toNameCase(image),
          order: images[image].image_order || prev.length + 1,
          required: false
        }))
      ]
    })
  }



  const addCustomAttribute = () => {
    setCustomAttributes((prev) => [
      ...prev,
      {
        id: `ca_${Date.now()}`,
        name: "",
        key: "custom",
        field: "",
        value: "",
      },
    ]);

    setFormData((prev) => ({
      ...prev,
      "category_attributes": { ...prev["category_attributes"], "": "" } // setting emtpy field and value
    }))
  };



  const handleCustomAttributeChange = (id, val) => {
    const raw = typeof val === "string" ? val : String(val ?? "");
    const pascalName = toNameCase(raw.slice(0, 100));
    const displayName = raw.endsWith(" ")
      ? raw.slice(0, 100)
      : pascalName || raw.slice(0, 100);
    const newField = toSnakeCase(raw.slice(0, 100));

    setCustomAttributes((prev) =>
      prev.map((attr) => {
        if (attr.id !== id) return attr;

        return {
          ...attr,
          name: displayName,
          field: newField,
        };
      })
    );


    // changing the field in the formdata aswell
    setFormData((prev) => {
      let prevField;
      for (let i = 0; i < customAttributes.length; i++) {
        if (customAttributes[i].id == id) prevField = customAttributes[i].field;
      }

      const { [prevField]: prevValue, ...remainingAttributes } = prev.category_attributes ?? {};

      return {
        ...prev,
        "category_attributes": { ...remainingAttributes, [newField]: prevValue }
      }
    });
  };


  const removeCustomAttribute = (id) => {
    setCustomAttributes((prev) => prev.filter((attr) => attr.id !== id));
  };

  const formatFieldName = (key) =>
    key ? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";


  /**
   * Validate the attribute data according to the given attribute meta data
   * @param {*} key 
   * @param {*} value 
   * @param {*} attrMeta 
   * @returns 
   */
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
    setImageAttributes(attributeData.image_attributes);
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
        [attType]: { ...prev[attType], [key]: value }
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
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const imageType = selectedImageType;
    let imageOrder;


    if (!imageType) {
      showToast("Could not found the target image key", "red");
    }

    // finding image order
    imageAttributes.map(attr => {
      if (attr.field == imageType) imageOrder = attr.order;
    })


    setNewImageFiles((prev) => ({
      ...prev,
      [imageType]: { image: file, order: imageOrder },
    }));


    setImages((prev) => ({
      ...prev,
      [imageType]: {
        image_order: imageOrder,
        image_urls: {
          high_resol_webp: url,
          low_resol_webp: url,
          original: url,
          webp_card: url
        }
      }
    }))

    showToast("Image updated. Click 'Save changes' to save.", "green");
  };


  const handleAddMoreImages = async () => {
    await setImageAttributes((prev) => {
      if (prev[prev.length - 1].field === "custom") {
        showToast("Rename custom Image key");
        return prev;
      }

      return [
        ...prev,
        {
          field: 'custom',
          key: 'custom',
          name: 'Custom',
          order: prev.length + 1,
          required: false
        }
      ]
    })

    thumbnailsRef.current?.scrollTo({
      top: thumbnailsRef.current?.scrollHeight,
      behavior: "smooth",
    });
  };


  /**
   * Rename the custom key to the desired key in image Attributes, newImageFiles and imageMeta
   * @param {*} key 
   * @param {*} newKey 
   */
  const renameCustomImageKey = (key, newKey) => {
    const newField = toSnakeCase(newKey);
    const newName = toNameCase(newKey);

    setImageAttributes((prev) => {
      prev.map(attr => {
        if (attr.field == key && attr.key == 'custom') {
          attr.field = newField;
          attr.name = newName;
        }
      })

      return [...prev];
    })


    setNewImageFiles((prev) => {
      if (key in prev) {
        const prevValue = prev[key];
        delete prev[key];
        return { ...prev, [newField]: prevValue }
      }

      return { ...prev };
    })
  }


  /**
   * Add new variant to the uploadVariants list to upload new variants
   */
  const addNewVariant = ()=> {
    const  getSuggestedSkuId = async() => {
      try{
        const response = await fetch(`${host}/catalog/variants/suggested-sku/${uskuId}`, {
          "credentials": 'include'
        })

        const data= await response.json();

        if (!response.ok) showToast(data?.message ?? "Unable to fetch suggested SKU ID", 'red')
        console.log(data)

        setUploadVariants(prev=>{
        return [
          ...prev,
          {
            "listing_attributes": {
              "sku_id": `${data.sku_id}-${prev.length + 1}`
            },
            "category_attributes": {
              "": ""
            }
          }
        ]
    });
      }
      catch(e){
        console.error(e);
      }
    }

    getSuggestedSkuId();
  }


  const addVariantField = (variantIndex) => {
    setUploadVariants((prev)=>{
      const newArray = [...prev];

      newArray[variantIndex] = {
        ...newArray[variantIndex],
        "category_attributes": {
            ...prev[variantIndex].category_attributes,
            "": ""
          }
      }
      return newArray;
    })
  }


  const setVariantField = (variantIndex, attributeType, prevField, newField) => {
    // Store prev value, delte the prev field and add the new field with the prev value
    // tada you've got your old value with new field name
    console.log(variantIndex, attributeType, prevField, newField)
    setUploadVariants((prev)=> {
      const newArray = [...prev];
      const prevValue = prev[variantIndex][attributeType][prevField]

      delete newArray[variantIndex][attributeType][prevField];

      console.log(listingAttributes.filter((attr)=> attr.field == newField))
      // if the field belongs to listing attribute 
      if (listingAttributes.filter((attr)=> attr.field == newField).length > 0){
        newArray[variantIndex]["listing_attributes"][newField] = prevValue
      }else{
        newArray[variantIndex]["category_attributes"][newField] = prevValue  // storing the snake_case_field_name
      }
      
      console.log(newArray)
      return newArray;
    })
  }


  const setVariantValue = (variantIndex, attributeType, field, value) => {
    setUploadVariants((prev)=> {
      const newArray = [...prev];
      newArray[variantIndex][attributeType][toSnakeCase(field)] = value;

      return newArray;
    })
  }


  const removeVariantField = (variantIndex, attributeType, field) => {
    setUploadVariants(prev => {
      const newArray = [...prev];

      delete newArray[variantIndex][attributeType][field];
      return newArray;
    })
  }



  /**
   * Submit the data with product details and images
   * @returns 
   */
  const handleSave = async () => {
    if (saving) return;

    // Validate ALL fields across listing_attributes, category_attributes, and core keys
    const newErrors = {};

    // listing attributes validation
    if (listingAttributes.length > 0) {
      listingAttributes.forEach((attr) => {
        if (attr.field in formData) {
          const val = formData[attr.field];
          const err = validateField(attr.field, val, attr);
          if (err) newErrors[attr.field] = err;
        }
      });
    }

    // category attributes validation
    if (categoryAttributes.length > 0) {
      categoryAttributes.forEach((attr) => {
        if (attr.field in formData) {
          const val = formData[attr.field];
          const err = validateField(attr.field, val, attr);
          if (err) newErrors[attr.field] = err;
        }
      });
    }

    // image attributes validation
    if (imageAttributes?.length > 0) {
      const existingImageTypes = new Set(Object.keys(images));
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

    // display acquired errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstMsg = Object.values(newErrors)[0];
      showToast(firstMsg, "red");
      return;
    }

    setErrors({});

    try {
      setSaving(true);
      await updateProduct(
        uskuId,
        typeId,
        formData
      );


      if (Object.keys(newImageFiles).length > 0) {
        console.log("Uploading the image");
        try {
          // Use PUT /catalog/images/{usku_id} to update product images, with fallback to POST
          try {
            await updateProductImages(uskuId, newImageFiles);
          } catch (putErr) {
            console.warn("PUT /catalog/images failed, attempting POST fallback:", putErr);
            await uploadProductImages(uskuId, newImageFiles);
          }
        } catch (imgErr) {
          console.warn("Image upload warning:", imgErr);
        }
      }

      // setting the updated data to the product so client won't have to refresh in order to get the latest data
      setProduct((prev) => {
        const newProduct = {};

        formData.listing_attributes && Object.keys(formData.listing_attributes)?.map(key => {
          newProduct[key] = formData.listing_attributes[key];
        })

        formData.category_attributes && Object.keys(formData.category_attributes)?.map(key => {
          newProduct[key] = formData.category_attributes[key];
        })

        return {
          ...prev,
          ...newProduct
        }
      })

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


  if (loading && !product) {
    return (
      <div className={styles.skeleton}>
        <div className={styles.TopSkeleton}>
          <div className={`${styles.leftBox} skeletonLoading`}></div>
          <div className={`${styles.rightBox} skeletonLoading`}></div>
        </div>

        <div className={`${styles.skeletonSection} skeletonLoading`}></div>

        <div className={`${styles.skeletonSection} skeletonLoading`}></div>
      </div>
    );
  }


  if (error || !product) {
    return <div className={styles.error}>{error || "Product not found"}</div>;
  }

  /**
   * FINDING CUSTOM ATTRIBUTE
   */
  const displayData = product;

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
    displayData.type_name ||
    searchParams.get("type-name") ||
    searchParams.get("type") ||
    "";

    
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
                  className={`${styles.editSpecInput} ${fieldKey === "type_name" ||
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
          {imageAttributes.length > 0 ? (
            <div className={styles.gallery}>
              <div className={styles.thumbnails} ref={thumbnailsRef}>
                {
                  imageAttributes.map((attribute, idx) => {
                    const imageURL = images[attribute.field] ? images[attribute.field]?.image_urls?.webp_card : camera;
                    const isCustom = attribute.key == 'custom';
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
                        {
                          isCustom && isEditing ?
                            <input type="text"
                              title="Change the image key"
                              value={attribute.name ?? "Custom"}
                              onChange={(e) => { renameCustomImageKey(attribute.field, e.target.value) }}
                              className={styles.imageTab}
                              style={isCustom && { "border": "1px solid var(--second-color-50)" }}
                            />
                            :
                            <p className={styles.imageTab}>{attribute.name || "Custom"}{attribute.required == true ? <span style={{ "color": "red" }}>*</span> : ""}</p>
                        }
                        <div className={styles.thumbnailPreviewContainer}>
                          <img
                            src={imageURL}
                            alt={attribute.field || `Thumbnail ${idx + 1}`}
                            className={images[attribute.field] ? styles.imageThumbnailPreview : styles.noImageCamera}
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
              </div>

              <div className={styles.mainImage}>
                <img
                  src={images[selectedImageType] ? images[selectedImageType]?.image_urls?.low_resol_webp : camera}
                  alt={selectedImageType || product_title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = imageNA;
                  }}
                />

                {isEditing && (
                  <div className={styles.imageTypeBadge}>
                    <span>{`Image ${selectedImageType}`}</span>
                    {(() => {
                      const matchedMeta = imageAttributes.find(
                        (a) =>
                          a.field == selectedImageType
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
                      onClick={handleAddMoreImages}
                    >
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

                {images[selectedImageType]?.image_urls && !isEditing && (
                  <button
                    type="button"
                    className={styles.zoomIcon}
                    title="Open full resolution image"
                    onClick={() =>
                      window.open(
                        images[selectedImageType]?.image_urls.original,
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

          {/* Listing Summary */}
          <div className={styles.listingSummary}>
            <h2 className={styles.sectionTitle}>Listing Summary</h2>
            <div className={styles.listingSummaryData}>
              {isEditing ? (
                <div className={styles.skuInputWrap}>
                  <label className={styles.headerFieldLabel}>
                    SKU ID <span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`${styles.skuInput} ${errors.sku_id ? styles.inputError : ""}`}
                    value={formData.listing_attributes?.sku_id ?? product.sku_id ?? ""}
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

              {isEditing ? (
                <div className={styles.titleInputWrap}>
                  <label className={styles.headerFieldLabel}>
                    Product Title <span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`${styles.titleInput} ${errors.product_title ? styles.inputError : ""}`}
                    value={formData.listing_attributes?.product_title ?? product.product_title ?? ""}
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
                          value={formData.listing_attributes?.price ?? product.price ?? 0.00}
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
                          value={formData.listing_attributes?.compared_price ?? product.compared_price ?? 0.00}
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
                    {isEditing? (
                      (((formData.listing_attributes?.compared_price ?? product.compared_price)
                      /
                      (formData.listing_attributes?.price ?? product.price)
                      )*100).toFixed(2)): discountPercent}% OFF
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
                          value={formData.listing_attributes?.purchasing_cost ?? product.purchasing_cost ?? 0.00}
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
                        value={formData.listing_attributes?.brand_name ?? product.brand_name ?? ""}
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
                        value={formData.listing_attributes?.vendor ?? product.vendor ?? ""}
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
        </div>

        {(
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
              <div className={styles.specsBox}>
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
              <div className={styles.specsBox}>
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
                    <button
                      type="button"
                      onClick={addCustomAttribute}
                      className={styles.addAttributeBttn}
                    >
                      <span className={styles.addBtnIcon}>+</span>
                      Add Custom Attribute
                    </button>

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
                                  e.target.value,
                                )
                              }
                              className={styles.customAttrNameInput}
                            />

                            <div className={styles.customAttrValueWrap}>
                              <input
                                type="text"
                                placeholder="Value"
                                value={formData.category_attributes?.[attr.field] ?? product.value ?? ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "category_attributes",
                                    attr.field,
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
                  </>
                )}
              </div>
            )}


            {/* Variants section */}
            <div className={styles.specsBox}>
              <h3 className={styles.sectionTitle}>Variants</h3>

              {/* Selection indicator */}
              {variants?.length > 0 && <div className={styles.variantSelector} style={{positionAnchor: `--${uskuId}`}}>

              </div>}

              <div className={styles.variants}>
                {
                  variants.length > 0 &&
                  variants.map((variant, idx) => {
                    return (
                      <div className={styles.variantCard} key={idx} style={{anchorName: `--${variant.usku_id}`}}
                        onClick={()=>{setUskuId(variant.usku_id)}}
                      >
                        <p className={styles.variantCardTitle}>SKU ID</p>
                        <p className={styles.variantSku}>{variant.sku_id}</p>
                        <div className={styles.variantImage}>
                          <img src={variant.main_image ?? camera} style={variant.main_image == null ? {"width": "35%"}: {}} alt="product-image" />
                        </div>
                        <p className={styles.variantPrice}>₹ {parseInt(variant.price).toLocaleString("en-IN")}</p>
                        <p className={styles.variantTitle}>{variant.product_title}</p>
                      </div>
                    )
                  })
                }
              </div>

              {/* Variants Input */}
              {
                isEditing&& 
                <div className={styles.variantInput}>
                  <button className={styles.addAttributeBttn} onClick={addNewVariant}>+ Add variant</button>

                  {
                    uploadVariants?.map((variant, index) => {
                      return (
                        <div className={styles.newVariantContainer} key={index}>
                          <button className={styles.removeVariant}>X</button>
                          {
                            variant.listing_attributes &&
                            Object.entries(variant.listing_attributes).map(([field, value]) => {
                              // Just finding the product attriute schema from the listingAttributes
                              let attr = listingAttributes.filter((attr) => attr.field == field);
                              attr = attr[0];

                              return (
                                <div className={styles.customAttrRow} >
                                  <input
                                    type="text"
                                    placeholder="Attribute name"
                                    value={attr?.name ?? toNameCase(field)} // when the user is still typing the name and it's not matching with any attribute then go back to the typing field format
                                    maxLength={100}
                                    onChange={(e) => {setVariantField(index, "listing_attributes", field, toSnakeCase(e.target.value))}}
                                    className={styles.customAttrNameInput}
                                    disabled={field == "sku_id" ? true : false}
                                    list='attributes'
                                  />

                                  <div className={styles.customAttrValueWrap}>
                                    <input
                                      type="text"
                                      placeholder="Value"
                                      value={value}
                                      onChange={(e) => {setVariantValue(index, 'listing_attributes', field, e.target.value)}}
                                      className={styles.customAttrValueInput}
                                    />

                                    <button
                                      type="button"
                                      onClick={() => {removeVariantField(index, "listing_atributes", field)}}
                                      title="Remove attribute"
                                      className={styles.removeAttrBtn}
                                      style={field == "sku_id"? {"visibility": "hidden" }: {}}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              )
                            })
                          }

                          {/* Seperated the category attribute of a variant with listing one */}
                          {
                            variant.category_attributes &&
                            Object.entries(variant.category_attributes).map(([field, value]) => {
                              console.log(field)                                
                              const attr = categoryAttributes.filter((attr) => attr.field == field)[0];

                              return (
                                <div className={styles.customAttrRow} >
                                  <input
                                    type="text"
                                    placeholder="Attribute name"
                                    value={attr?.name ?? toNameCase(field)}
                                    maxLength={100}
                                    onChange={(e) => {setVariantField(index, "category_attributes", field, toSnakeCase(e.target.value))}}
                                    className={styles.customAttrNameInput}
                                    list='attributes'
                                  />

                                  <div className={styles.customAttrValueWrap}>
                                    <input
                                      type="text"
                                      placeholder="Value"
                                      value={value ?? ""}
                                      onChange={(e) => {setVariantValue(index, "category_attributes", field, e.target.value)}}
                                      className={styles.customAttrValueInput}
                                    />

                                    <button
                                      type="button"
                                      onClick={() => {removeVariantField(index, 'category_attributes', field)}}
                                      title="Remove attribute"
                                      className={styles.removeAttrBtn}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              )
                            })
                          }

                          {/* Add one more field in the upload variant*/}
                          <button className={styles.addAttributeBttn} onClick={() => addVariantField(index)}
                          style={{"width": "fit-content"}}
                          >+ Add variant field
                          </button>

                          <datalist id="attributes">
                            {
                              listingAttributes?.map((attr) => {
                                if (attr.field == "sku_id") return ;
                                return (
                                  <option id={attr.handle}>{attr.name}</option>
                                )
                              })
                            }
                            <hr />
                            {
                              categoryAttributes?.map((attr) => {
                                return (
                                  <option value={attr.name} id={attr.handle}></option>
                                )
                              })
                            }
                            <button>+ Custom attribute</button>
                          </datalist>
                        </div>
                      )
                    })
                  }
                </div>
              }


            </div>


            <div className={styles.bottomCardsGrid}>
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
