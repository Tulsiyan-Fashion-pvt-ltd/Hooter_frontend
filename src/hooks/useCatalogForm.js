import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAttributeFields,
  createCatalog,
  uploadImages,
  markComplete,
} from '../services/catalogService';

export default function useCatalogForm() {
  const [selectedType, setSelectedType] = useState(null); // { id, vertical }

  const [fixedValues, setFixedValues] = useState({});
  const [dynamicValues, setDynamicValues] = useState({});

  const [listingAttributes, setListingAttributes] = useState([]);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [imageAttributes, setImageAttributes] = useState([]);

  const [images, setImages] = useState({});
  const [preview, setPreview] = useState({});

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedType) {
      setListingAttributes([]);
      setCategoryAttributes([]);
      setImageAttributes([]);
      setDynamicValues({});
      return;
    }

    const fetchAttributeFields = async () => {
      try {
        setLoading(true);
        const data = await getAttributeFields(selectedType.id, selectedType.vertical);

        setFixedValues({});
        setListingAttributes(data.listing_attributes || []);
        setCategoryAttributes(data.category_attributes || []);
        setImageAttributes(data.image_attributes || []);
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

  const handleTypeChange = (value) => {
    setSelectedType(value);
  };

  const handleFixedChange = (key, value) => {
    setFixedValues((prev) => ({
      ...prev,
      [key]: value === '' ? null : value,
    }));
  };

  const handleDynamicChange = (key, value) => {
    setDynamicValues((prev) => ({
      ...prev,
      [key]: value === '' ? null : value,
    }));
  };

const addImageAttribute = (field, attr) => {
  setImageAttributes((prev) => [...prev, { field, ...attr }]);
};

const changeImageCustomKey = (oldField = "custom", label) => {
  const newField = label.charAt(0).toLowerCase() + label.slice(1).replaceAll(" ", "_");
  setImageAttributes((prev) =>
    prev.map((attr) =>
      attr.field === oldField ? { ...attr, field: newField, name: label } : attr
    )
  );
};
  const uploadImageData = (key, object, order) => {
    setImages((prev) => ({
      ...prev,
      [key]: { image: object, order },
    }));
  };

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

      const files = Object.keys(images).map((key) => images[key].image);
      const meta = {};
      Object.keys(images).forEach((key) => {
        const file = images[key].image;
        meta[file.name] = { image_order: images[key].order, image_type: key };
      });

      if (files.length > 0) {
        try {
          await uploadImages(uskuId, files, meta);
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
    selectedType,
    handleTypeChange,
    fixedValues,
    handleFixedChange,
    listingAttributes,
    categoryAttributes,
    imageAttributes,
    preview, setPreview,
    changeImageCustomKey,
    dynamicValues,
    handleDynamicChange,
    addImageAttribute,
    uploadImageData,
    loading,
    submitting,
    error,
    success,
    handleSubmit,
  };
}