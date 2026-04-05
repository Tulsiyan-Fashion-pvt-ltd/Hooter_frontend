import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_BASEAPI;

const fmt = (str) => str?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function useCatalogForm() {

  // ── Raw niche data from API ───────────────────────────
  const [nicheData, setNicheData] = useState({});

  // ── Cascade selections ────────────────────────────────
  const [selectedNiche,    setSelectedNiche]    = useState('');
  const [selectedSubNiche, setSelectedSubNiche] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType,     setSelectedType]     = useState('');

  // ── Derived dropdown options ──────────────────────────
  const [nicheOptions,       setNicheOptions]       = useState([]);
  const [subNicheOptions,    setSubNicheOptions]    = useState([]);
  const [categoryOptions,    setCategoryOptions]    = useState([]);
  const [productTypeOptions, setProductTypeOptions] = useState([]);

  // ── Dynamic fields from attribute-fields API ──────────
  const [fieldAttributes,  setFieldAttributes]  = useState({});
  const [imageAttributes,  setImageAttributes]  = useState({});

  // ── Form values ───────────────────────────────────────
  const [fixedValues,   setFixedValues]   = useState({
    'sku-id': '', title: '', price: '', 'compared-price': '',
    'purchasing-cost': '', vendor: '', ean: '', hsn: '',
    'net-weight': '', 'dead-weight': '', 'volumetric-weight': '', 'brand-name': '',
  });
  const [dynamicValues, setDynamicValues] = useState({});

  // ── UI state ──────────────────────────────────────────
  const [step,      setStep]      = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [submitting,setSubmitting]= useState(false);
  const [error,     setError]     = useState(null);
  const [success,   setSuccess]   = useState(false);

  // ── 1. Fetch niche data on mount ──────────────────────
  useEffect(() => {
    const fetchNicheData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/catalog/niche-data`, {
          credentials: 'include', // sends session cookie for auth
        });
        const json = await res.json();

        if (!res.ok) throw new Error(json.msg || 'Failed to load categories');

        const data = json.niche_data;
        setNicheData(data);

        // Build niche options from top-level keys
        const options = Object.entries(data).map(([id, val]) => ({
          id,
          label: fmt(val.niche),
        }));
        setNicheOptions(options);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNicheData();
  }, []);

  // ── 2. Cascade: niche → sub-niches ───────────────────
  const handleNicheChange = (nicheId) => {
    setSelectedNiche(nicheId);
    setSelectedSubNiche('');
    setSelectedCategory('');
    setSelectedType('');
    setSubNicheOptions([]);
    setCategoryOptions([]);
    setProductTypeOptions([]);

    if (!nicheId) return;

    const subniches = nicheData[nicheId]?.subniches || {};
    const options = Object.entries(subniches).map(([id, val]) => ({
      id,
      label: fmt(val.subniche) ?? `Sub-niche ${id}`, // use label if API provides one
    }));
    setSubNicheOptions(options);
  };

  // ── 3. Cascade: sub-niche → categories ───────────────
  const handleSubNicheChange = (subNicheId) => {
    setSelectedSubNiche(subNicheId);
    setSelectedCategory('');
    setSelectedType('');
    setCategoryOptions([]);
    setProductTypeOptions([]);

    if (!subNicheId) return;

    const categories = nicheData[selectedNiche]?.subniches?.[subNicheId]?.categories || {};
    const options = Object.entries(categories).map(([id, val]) => ({
      id,
      label: fmt(val.category),
    }));
    setCategoryOptions(options);
  };

  // ── 4. Cascade: category → product types ─────────────
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedType('');
    setProductTypeOptions([]);

    if (!categoryId) return;

    const products = nicheData[selectedNiche]
      ?.subniches?.[selectedSubNiche]
      ?.categories?.[categoryId]
      ?.products || {};

    const options = Object.entries(products).map(([id, val]) => ({
      id,
      label: fmt(val.product),
    }));
    setProductTypeOptions(options);
  };

  // ── 5. Product type selected → fetch attribute fields ─
  const handleTypeChange = async (typeId) => {
    setSelectedType(typeId);
    setFieldAttributes({});
    setImageAttributes({});
    setDynamicValues({});

    if (!typeId) return;

    try {
      const res = await fetch(`${BASE_URL}/catalog/attribute-fields?type=${typeId}`, {
        credentials: 'include',
      });
      const json = await res.json();

      if (!res.ok) throw new Error('Failed to load attribute fields');

      setFieldAttributes(json.field_attributes || {});
      setImageAttributes(json.image_attributes || {});

      // Initialise dynamic values to empty strings
      const initialDynamic = {};
      Object.keys(json.field_attributes || {}).forEach(key => {
        initialDynamic[key] = '';
      });
      setDynamicValues(initialDynamic);
      setStep(2);

    } catch (err) {
      setError(err.message);
    }
  };

  // ── Fixed field change handler ────────────────────────
  const handleFixedChange = (key, value) => {
    setFixedValues(prev => ({ ...prev, [key]: value }));
  };

  // ── Dynamic field change handler ──────────────────────
  const handleDynamicChange = (key, value) => {
    setDynamicValues(prev => ({ ...prev, [key]: value }));
  };

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    const payload = {
      type: selectedType,
      data: {
        ...fixedValues,
        ...dynamicValues,
      },
    };

    try {
      const res = await fetch(`${BASE_URL}/catalog/single-catalog`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.msg || json.message || 'Submission failed');

      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    // cascade
    selectedNiche, selectedSubNiche, selectedCategory, selectedType,
    nicheOptions, subNicheOptions, categoryOptions, productTypeOptions,
    handleNicheChange, handleSubNicheChange, handleCategoryChange, handleTypeChange,
    // fixed fields
    fixedValues, handleFixedChange,
    // dynamic fields
    fieldAttributes, imageAttributes, dynamicValues, handleDynamicChange,
    // steps
    step, setStep,
    // ui
    loading, submitting, error, success,
    handleSubmit,
  };
}