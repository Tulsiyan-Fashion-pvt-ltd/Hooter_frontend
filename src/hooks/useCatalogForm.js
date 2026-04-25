import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const route = import.meta.env.VITE_BASEAPI;

/**
 * useCatalogForm Hook
 *
 * Manages the cascade dropdown state and form data for catalog uploads.
 * Handles fetching niche data and attribute fields based on product type selection.
 *
 * RETURNS:
 * {
 *   selectedNiche, selectedSubNiche, selectedCategory, selectedType,
 *   nicheOptions, subNicheOptions, categoryOptions, productTypeOptions,
 *   handleNicheChange, handleSubNicheChange, handleCategoryChange, handleTypeChange,
 *   fixedValues, handleFixedChange,
 *   fieldAttributes, imageAttributes,
 *   dynamicValues, handleDynamicChange,
 *   loading, submitting, error, success, handleSubmit
 * }
 */

export default function useCatalogForm() {
  // Cascade selection states
  const [selectedNiche, setSelectedNiche] = useState('');
  const [selectedSubNiche, setSelectedSubNiche] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Options for each dropdown
  const [nicheOptions, setNicheOptions] = useState([]);
  const [subNicheOptions, setSubNicheOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [productTypeOptions, setProductTypeOptions] = useState([]);

  // Form data states
  const [fixedValues, setFixedValues] = useState({
    'sku_id': '',
    'title': '',
    'price': '',
    'compared_price': '',
    'purchasing_cost': '',
    'vendor': '',
    'ean': '',
    'hsn': '',
    'net_weight': '',
    'dead_weight': '',
    'volumetric_weight': '',
    'brand_name': '',
  });

  const [dynamicValues, setDynamicValues] = useState({});
  const [fieldAttributes, setFieldAttributes] = useState({});
  const [imageAttributes, setImageAttributes] = useState({});
  const [images, setImages] = useState({});
  const [preview, setPreview] = useState({});
  // console.log(Object.keys(images).map((item)=>{console.log(images[item].order)}));

  // Loading and status states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  // Fetch niche data on component mount
  useEffect(() => {
    const fetchNicheData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${route}/catalog/niche-data`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch niche data');
        }

        const data = await response.json();
        // console.log('Raw API response:', data); // Debug log
        
        // API returns nested object structure under "niche_data"
        const nicheData = data.niche_data || {};
        
        // Transform nested object into array format
        const transformedNiches = Object.entries(nicheData).map(([nicheId, nicheObj]) => ({
          id: nicheId,
          label: nicheObj.niche,
          sub_niche: Object.entries(nicheObj.subniches || {}).map(([subNicheId, subNicheObj]) => ({
            id: subNicheId,
            label: subNicheObj.subniche,
            category: Object.entries(subNicheObj.categories || {}).map(([categoryId, categoryObj]) => ({
              id: categoryId,
              label: categoryObj.category,
              product_type: Object.entries(categoryObj.products || {}).map(([productId, productObj]) => ({
                id: productId,
                label: productObj.product
              }))
            }))
          }))
        }));
        
        // console.log('Transformed niche data:', transformedNiches); // Debug log
        setNicheOptions(transformedNiches);
        setError('');
      } catch (err) {
        console.error('Error fetching niche data:', err);
        setError('Failed to load categories. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchNicheData();
  }, []);

  // Fetch sub-niches when niche changes
  useEffect(() => {
    if (!selectedNiche) {
      setSubNicheOptions([]);
      setSelectedSubNiche('');
      setSelectedCategory('');
      setSelectedType('');
      setCategoryOptions([]);
      setProductTypeOptions([]);
      return;
    }

    const findNiche = nicheOptions.find((n) => n.id === selectedNiche);
    console.log('Selected niche:', selectedNiche, 'Sub-niches:', findNiche?.sub_niche); // Debug log
    
    if (findNiche && findNiche.sub_niche) {
      setSubNicheOptions(findNiche.sub_niche);
    } else {
      setSubNicheOptions([]);
    }
    
    setSelectedSubNiche('');
    setSelectedCategory('');
    setSelectedType('');
    setCategoryOptions([]);
    setProductTypeOptions([]);
  }, [selectedNiche, nicheOptions]);

  // Fetch categories when sub-niche changes
  useEffect(() => {
    if (!selectedSubNiche) {
      setCategoryOptions([]);
      setSelectedCategory('');
      setSelectedType('');
      setProductTypeOptions([]);
      return;
    }

    const findSubNiche = subNicheOptions.find((s) => s.id === selectedSubNiche);
    console.log('Selected sub-niche:', selectedSubNiche, 'Categories:', findSubNiche?.category); // Debug log
    
    if (findSubNiche && findSubNiche.category) {
      setCategoryOptions(findSubNiche.category);
    } else {
      setCategoryOptions([]);
    }
    
    setSelectedCategory('');
    setSelectedType('');
    setProductTypeOptions([]);
  }, [selectedSubNiche, subNicheOptions]);

  // Fetch product types when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setProductTypeOptions([]);
      setSelectedType('');
      return;
    }

    const findCategory = categoryOptions.find((c) => c.id === selectedCategory);
    console.log('Selected category:', selectedCategory, 'Products:', findCategory?.product_type); // Debug log
    
    if (findCategory && findCategory.product_type) {
      setProductTypeOptions(findCategory.product_type);
    } else {
      setProductTypeOptions([]);
    }
    
    setSelectedType('');
  }, [selectedCategory, categoryOptions]);

  // Fetch attribute fields when product type changes
  useEffect(() => {
    if (!selectedType) {
      setFieldAttributes({});
      setImageAttributes({});
      setDynamicValues({});
      return;
    }

    const fetchAttributeFields = async () => {
      try {
        const response = await fetch(
          `${route}/catalog/attribute-fields?type=${selectedType}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch attribute fields');
        }

        const data = await response.json();
        console.log(data)
        
        // Handle both direct fields/images and nested structure
        const fields = data.fields || data.field_attributes || {};
        const images = data.images || data.image_attributes || {};
        
        // clearing the value of fixed values as well when the new new niche type is fetched
        setFixedValues({
          'sku_id': '',
          'title': '',
          'price': '',
          'compared_price': '',
          'purchasing_cost': '',
          'vendor': '',
          'ean': '',
          'hsn': '',
          'net_weight': '',
          'dead_weight': '',
          'volumetric_weight': '',
          'brand_name': '',
        });
        setFieldAttributes(fields);
        setImageAttributes(images);
        setPreview({});
        setDynamicValues({});

        setError('');
      } catch (err) {
        console.error('Error fetching attribute fields:', err);
        setError('Failed to load product attributes.');
      }
    };

    fetchAttributeFields();
  }, [selectedType]);

  // Handle cascade dropdown changes
  const handleNicheChange = (value) => {
    setSelectedNiche(value);
  };

  const handleSubNicheChange = (value) => {
    setSelectedSubNiche(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleTypeChange = (value) => {
    setSelectedType(value);
  };

  // Handle fixed values change
  const handleFixedChange = (key, value) => {
    setFixedValues((prev) => ({
      ...prev,
      [key]: value==''? null: value,
    }));
  };

  // Handle dynamic values change
  const handleDynamicChange = (key, value) => {
    setDynamicValues((prev) => ({
      ...prev,
      [key]: value==''? null: value,
    }));
  };

  // handle custom image attribute
  const addImageAttribute = (key, value)=>{
    setImageAttributes((prev) => ({...prev, [key]: value}))
  }

  const changeImageCustomKey = (oldKey="custom", newKey) => {
    setImageAttributes((prev)=> {
      const {[oldKey]: value, ...rest} = prev;
      return {...rest, [newKey]:value}
    })
  }

  const uploadImageData = (key, object, order) => {
    setImages((prev)=>({...prev, [key]: 
      {...prev.key, ["image"]: object, ["order"]: order}
    }));
  }

  // Submit form
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      // Validate required fields
      if (!selectedType) {
        setError('Please select a product type');
        return;
      }

      if (!fixedValues['sku_id'] || !fixedValues['title'] || !fixedValues['price'] || !fixedValues['brand_name']) {
        setError('Please fill in all mandatory fields');
        return;
      }

      // Validate required dynamic fields
      for (const [key, rule] of Object.entries(fieldAttributes)) {
        if (key === 'niche_id') continue;
        const isRequired = rule === '*' || (Array.isArray(rule) && rule.includes('*'));
        if (isRequired && !dynamicValues[key]) {
          setError(`Please fill in the ${key.replace(/_/g, ' ')} field`);
          return;
        }
      }

      async function submitCatalog() {
        // Prepare payload
        const payload = {
          type: selectedType,
          data: {...fixedValues,...dynamicValues}
        };

        const response = await fetch(`${route}/catalog/single-catalog`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.msg || 'Failed to add catalog');
        }

        return {"status": "ok", "uskuId": data['usku_id']}
      }

      async function submitImages(uskuID) {
        await Promise.all(
          Object.keys(images).map(async (item) => {
            const form = new FormData();
            form.append('image', images[item].image);
            // console.log(`${route}/catalog/image?usku-id=${uskuID}&order=${images[item].order}&image-type=${item}`)
            const response = await fetch(
              `${route}/catalog/image?usku-id=${uskuID}&order=${images[item].order}&image-type=${item}`,
              {
                method: "POST",
                credentials: "include",
                body: form
              }
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.msg || 'Image upload Failed');
            }
          })
        );
      }

      const catalogUpload = await submitCatalog();
      console.log(catalogUpload)
      if (catalogUpload.status==="ok"){
        await submitImages(catalogUpload.uskuId);
        setSuccess(true);
        setTimeout(()=>{
          navigate("/catalog");
        }, 200);
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'An error occurred while submitting');
    } finally {
      setSubmitting(false);
    }
    
  };

  return {
    // Cascade selections
    selectedNiche,
    selectedSubNiche,
    selectedCategory,
    selectedType,
    // Options
    nicheOptions,
    subNicheOptions,
    categoryOptions,
    productTypeOptions,
    // Handlers
    handleNicheChange,
    handleSubNicheChange,
    handleCategoryChange,
    handleTypeChange,
    // Form data
    fixedValues,
    handleFixedChange,
    fieldAttributes,
    imageAttributes,
    preview, setPreview,
    changeImageCustomKey,
    dynamicValues,
    handleDynamicChange,
    addImageAttribute,
    uploadImageData,
    // Status
    loading,
    submitting,
    error,
    success,
    handleSubmit,
  };
}
