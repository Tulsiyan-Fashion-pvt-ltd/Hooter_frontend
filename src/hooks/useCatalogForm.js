import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAttributeFields,
  createCatalog,
  uploadProductImages,
  markComplete,
} from '../services/catalogService';

/**
 * Converts any user-entered string into snake_case.
 * e.g., "Product Image" -> "product_image", "Front View 1" -> "front_view_1".
 *
 * @param {string} str - Raw input string
 * @returns {string} snake_case formatted string
 */
export const toSnakeCase = (str = '') => {
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/^_+|_+$/g, '');
};





/**
 * Converts a raw user-typed string into PascalCase (UpperCamelCase).
 * Each word is capitalised and spaces are removed so the result reads
 * as a clean display label and a human-friendly payload key.
 *
 * e.g. "fabric care"  -> "FabricCare"
 *      "front view 1" -> "FrontView1"
 *      "SIZE"         -> "Size"
 *
 * @param {string} str - Raw input string
 * @returns {string} PascalCase formatted string
 */
export const toPascalCase = (str = '') => {
  return str
    .toString()
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};





/**
 * Derives a camelCase payload key from a PascalCase display name.
 * Simply lowercases the very first character of the PascalCase string.
 *
 * e.g. "FabricCare" -> "fabricCare"
 *      "FrontView1" -> "frontView1"
 *
 * @param {string} pascalStr - PascalCase string (output of toPascalCase)
 * @returns {string} camelCase formatted string
 */
const toCamelCase = (pascalStr = '') => {
  if (!pascalStr) return '';
  return pascalStr.charAt(0).toLowerCase() + pascalStr.slice(1);
};





export default function useCatalogForm() {

  // ─── Selected Product Type ────────────────────────────────────────────────
  // Holds the category selected by the user via CatalogSelector { id, vertical }.
  const [selectedType, setSelectedType] = useState(null);

  // ─── Form Values ──────────────────────────────────────────────────────────
  // fixedValues   : values for the static listing fields (SKU, price, title, etc.).
  // dynamicValues : values for category-specific attributes fetched from the API.
  const [fixedValues, setFixedValues] = useState({});
  const [dynamicValues, setDynamicValues] = useState({});

  // ─── Attribute Lists ──────────────────────────────────────────────────────
  // Populated from the API after a product type is selected.
  const [listingAttributes, setListingAttributes] = useState([]);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [imageAttributes, setImageAttributes] = useState([]);

  // ─── Image State ─────────────────────────────────────────────────────────
  // images  : map of field key → { image: File, order: number } for submission.
  // preview : map of field key → { url: string, object: Blob } for UI preview.
  const [images, setImages] = useState({});
  const [preview, setPreview] = useState({});

  // ─── UI State ────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ─── Custom Attributes ───────────────────────────────────────────────────
  // User-defined key/value pairs appended to the category payload on submit.
  // Each entry: { id: string, key: string, value: string }.
  const [customAttributes, setCustomAttributes] = useState([]);

  const navigate = useNavigate();





  /**
   * Loads product fields after the selector returns the final category ID
   * and its root vertical index for the attributes endpoint.
   */
  useEffect(() => {
    if (!selectedType) {
      setListingAttributes([]);
      setCategoryAttributes([]);
      setImageAttributes([]);
      setDynamicValues({});
      setCustomAttributes([]);
      return;
    }

    const fetchAttributeFields = async () => {
      try {
        setLoading(true);
        const data = await getAttributeFields(selectedType.id, selectedType.vertical);

        setFixedValues({});
        setListingAttributes(data.listing_attributes || []);
        setCategoryAttributes(data.category_attributes || []);

        // Normalize image attributes returned from the backend
        const fetchedImages = (data.image_attributes || []).map((attr, idx) => ({
          ...attr,
          id: attr.id || attr.type || attr.field || `img_fetched_${idx}`,
          field: attr.type || attr.field || `image_${idx}`,
          type: attr.type || attr.field || `image_${idx}`,
          description:
            attr.description ||
            attr.name ||
            (attr.type
              ? attr.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
              : `Image ${idx + 1}`),
          name: attr.name ||
            (attr.type
              ? attr.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
              : `Image ${idx + 1}`),
          required: Boolean(attr.required),
          order: attr.order !== undefined ? attr.order : idx,
          custom: false,
        }));

        // If there is no image attribute after fetching, auto add the custom image one
        if (fetchedImages.length === 0) {
          setImageAttributes([
            {
              id: `custom_${Date.now()}`,
              field: 'custom',
              type: 'custom',
              name: 'Custom',
              description: 'Custom',
              required: false,
              order: 0,
              custom: true,
            },
          ]);
        } else {
          setImageAttributes(fetchedImages);
        }

        setPreview({});
        setDynamicValues({});

        setError('');
      } catch (err) {
        console.error('Error fetching attribute fields:', err);
        setError('Failed to load product attributes.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttributeFields();
  }, [selectedType]);





  /**
   * Updates the selected product type. Triggers the attribute fetch effect.
   *
   * @param {{ id: string, vertical: number }} value - Selected type from CatalogSelector
   */
  const handleTypeChange = (value) => {
    setSelectedType(value);
  };





  /**
   * Updates a fixed listing field value.
   * Stores null for empty strings to keep the payload clean.
   *
   * @param {string} key   - Field key (e.g. "sku_id", "price")
   * @param {string} value - Raw input value
   */
  const handleFixedChange = (key, value) => {
    setFixedValues((prev) => ({
      ...prev,
      [key]: value === '' ? null : value,
    }));
  };





  /**
   * Updates a dynamic category attribute value.
   * Stores null for empty strings to keep the payload clean.
   *
   * @param {string} key   - Attribute field key
   * @param {string} value - Raw input value
   */
  const handleDynamicChange = (key, value) => {
    setDynamicValues((prev) => ({
      ...prev,
      [key]: value === '' ? null : value,
    }));
  };





  // ─── Custom Attribute Handlers ────────────────────────────────────────────

  /**
   * Appends a new blank custom attribute row to the list.
   *
   * Each custom attribute row follows the standard catalog attribute specification:
   *   - `name`  : PascalCase display label entered by the user (max 100 chars).
   *   - `key`   : camelCase payload key auto-derived from the PascalCase name.
   *   - `value` : Attribute value typed by the user (no character limit).
   *
   * @returns {void}
   */
  const addCustomAttribute = () => {
    setCustomAttributes((prev) => [
      ...prev,
      {
        id: `ca_${Date.now()}`,
        name: '',
        key: '',
        value: '',
      },
    ]);
  };





  /**
   * Handles user updates for an individual custom attribute row.
   *
   * Architectural Design Notes:
   *   - Attribute Name: Auto-formats to PascalCase on every keystroke so the display
   *     label is always clean (e.g. "fabric care" → "FabricCare"). Capped at 100 chars.
   *   - Payload Key: Derived in camelCase from the PascalCase name
   *     (e.g. "FabricCare" → "fabricCare") for a clean, JS-idiomatic key.
   *   - Attribute Value: No character limit — users can enter any descriptive text.
   *
   * @param {string} id             - Unique identifier of the custom attribute row.
   * @param {'name' | 'value'} field - The field being updated.
   * @param {string} val             - Raw input value from the change event.
   * @returns {void}
   */
  const handleCustomAttributeChange = (id, field, val) => {
    setCustomAttributes((prev) =>
      prev.map((attr) => {
        if (attr.id !== id) return attr;

        if (field === 'name') {
          // Auto-format to PascalCase, capped at 100 characters
          const raw = typeof val === 'string' ? val : String(val ?? '');
          const pascalName = toPascalCase(raw.slice(0, 100));

          // If the user is still actively typing (raw ends with a space or is all lowercase
          // mid-word), preserve the raw input so autocomplete doesn't fight the cursor.
          // Only commit the PascalCase result once a full word boundary is visible.
          const displayName = raw.endsWith(' ') ? raw.slice(0, 100) : (pascalName || raw.slice(0, 100));

          return {
            ...attr,
            name: displayName,
            key: toCamelCase(toPascalCase(raw.slice(0, 100))),
          };
        }

        if (field === 'value') {
          // No length cap — preserve full descriptive text
          return {
            ...attr,
            value: typeof val === 'string' ? val : String(val ?? ''),
          };
        }

        return { ...attr, [field]: val };
      })
    );
  };





  /**
   * Removes a custom attribute row by its unique identifier.
   *
   * @param {string} id - Unique identifier of the custom attribute row.
   * @returns {void}
   */
  const removeCustomAttribute = (id) => {
    setCustomAttributes((prev) => prev.filter((attr) => attr.id !== id));
  };





  /**
   * Adds a new custom image attribute card to the form.
   *
   * @param {string} initialName - Display name (defaults to "Custom")
   * @param {Object} [extraProps={}] - Additional attribute properties (e.g. order)
   */
  const addImageAttribute = (initialName = 'Custom', extraProps = {}) => {
    const rawKey = toSnakeCase(initialName) || 'custom';
    const newId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nextOrder =
      extraProps.order !== undefined ? extraProps.order : imageAttributes.length;

    setImageAttributes((prev) => [
      ...prev,
      {
        id: newId,
        field: rawKey,
        type: rawKey,
        name: initialName,
        description: initialName,
        required: false,
        order: nextOrder,
        custom: true,
        ...extraProps,
      },
    ]);
  };





  /**
   * Renames a custom image attribute, auto-converting user input to snake_case
   * for the backend image_type key while preserving user's typed name in description.
   * Migrates any existing uploaded file / preview to the new key.
   *
   * @param {string} idOrOldField - Attribute id or old field identifier
   * @param {string} newLabel - Raw label typed by user (e.g. "Product Image")
   */
  const changeImageCustomKey = (idOrOldField, newLabel) => {
    const newField = toSnakeCase(newLabel) || 'custom';

    setImageAttributes((prev) => {
      /* ── DUPLICATE FIELD GUARD ──────────────────────────────────────────────────
         If another slot already owns this snake_case field key, keep the current
         slot's field unchanged (only update the display name/description).
         This prevents the preview migration below from overwriting or erasing
         an unrelated slot's uploaded image.                                       */
      const isDuplicate = prev.some(
        (a) =>
          a.field === newField &&
          a.id !== idOrOldField &&
          a.field !== idOrOldField,
      );

      return prev.map((attr) => {
        if (attr.id !== idOrOldField && attr.field !== idOrOldField) return attr;

        const oldKey = attr.field;

        /* Only migrate images/preview when the field key actually changes
           AND there is no collision with an existing slot.                         */
        if (!isDuplicate && oldKey && oldKey !== newField) {
          setImages((prevImages) => {
            if (!prevImages[oldKey]) return prevImages;
            const copy = { ...prevImages, [newField]: prevImages[oldKey] };
            delete copy[oldKey];
            return copy;
          });
          setPreview((prevPreview) => {
            if (!prevPreview[oldKey]) return prevPreview;
            const copy = { ...prevPreview, [newField]: prevPreview[oldKey] };
            delete copy[oldKey];
            return copy;
          });
        }

        return {
          ...attr,
          /* Keep old field key if collision; user must pick a unique name first. */
          field: isDuplicate ? oldKey : newField,
          type:  isDuplicate ? oldKey : newField,
          name: newLabel,
          description: newLabel,
        };
      });
    });
  };





  /**
   * Removes a custom image attribute card and deletes any associated image file.
   *
   * @param {string} idOrField - Unique attribute ID or field key
   */
  const removeImageAttribute = (idOrField) => {
    setImageAttributes((prev) => {
      const target = prev.find((a) => a.id === idOrField || a.field === idOrField);
      if (target && target.field) {
        setImages((prevImages) => {
          const copy = { ...prevImages };
          delete copy[target.field];
          return copy;
        });
        setPreview((prevPreview) => {
          const copy = { ...prevPreview };
          delete copy[target.field];
          return copy;
        });
      }
      return prev.filter((a) => a.id !== idOrField && a.field !== idOrField);
    });
  };





  /**
   * Registers an uploaded image file against its attribute key and display order.
   * Called after the user selects a file via the image upload input.
   *
   * @param {string} key    - Attribute field key (e.g. "front_view")
   * @param {File}   object - The selected image File object
   * @param {number} order  - Display order for the image in the submission payload
   */
  const uploadImageData = (key, object, order) => {
    setImages((prev) => ({
      ...prev,
      [key]: { image: object, order },
    }));
  };





  /**
   * Validates the form and submits the catalog to the backend.
   *
   * Steps:
   *   1. Validates required fixed and category fields.
   *   2. Merges custom attributes into the category payload.
   *   3. Creates the catalog record via the API.
   *   4. Uploads any attached images.
   *   5. Marks the catalog as complete and redirects to /catalog.
   */
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      if (!selectedType) {
        setError('Please select a product type');
        return;
      }

      if (!fixedValues['sku_id'] || !fixedValues['product_title'] || !fixedValues['price'] || !fixedValues['brand_name']) {
        setError('Please fill in all mandatory fields');
        return;
      }

      for (const attr of categoryAttributes) {
        if (attr.required && !dynamicValues[attr.field]) {
          setError(`Please fill in the ${attr.name || attr.field} field`);
          return;
        }
      }

      const listingAttributesPayload = { ...fixedValues };
      const categoryAttributesPayload = { ...dynamicValues };

      // Merge user-defined custom attributes into the standard category attributes payload.
      // Keys are normalized in snake_case and values are stored as trimmed strings.
      customAttributes.forEach(({ key, value }) => {
        const snakeKey = toSnakeCase(key);
        if (!snakeKey || value === undefined || value === '') return;
        categoryAttributesPayload[snakeKey] = String(value).trim();
      });

      let catalogResult;
      try {
        catalogResult = await createCatalog(
          selectedType.id,
          listingAttributesPayload,
          categoryAttributesPayload,
        );
      } catch (err) {
        throw new Error(err.message || 'Failed to add catalog');
      }

      const uskuId = catalogResult.usku_id;

      if (Object.keys(images).length > 0) {
        try {
          await uploadProductImages(uskuId, images);
        } catch {
          setError("image upload failed");
          navigate("#error");
          setTimeout(() => {
            navigate("/catalog");
          }, 5000);
          return;
        }
      }

      await markComplete(uskuId);
      setSuccess(true);
      setTimeout(() => {
        navigate("/catalog");
      }, 5000);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'An error occurred while submitting');
    } finally {
      setSubmitting(false);
    }
  };





  return {
    // ── Category / Type Selection ─────────────────────
    selectedType,
    handleTypeChange,

    // ── Fixed Listing Fields ──────────────────────────
    fixedValues,
    handleFixedChange,

    // ── API-driven Attributes ─────────────────────────
    listingAttributes,
    categoryAttributes,
    dynamicValues,
    handleDynamicChange,

    // ── Image Attributes ──────────────────────────────
    imageAttributes,
    addImageAttribute,
    changeImageCustomKey,
    removeImageAttribute,
    uploadImageData,
    preview,
    setPreview,

    // ── User-defined Custom Attributes ───────────────
    customAttributes,
    addCustomAttribute,
    handleCustomAttributeChange,
    removeCustomAttribute,

    // ── Utilities ─────────────────────────────────────
    toSnakeCase,

    // ── UI / Submission State ─────────────────────────
    loading,
    submitting,
    error,
    success,
    handleSubmit,
  };
}