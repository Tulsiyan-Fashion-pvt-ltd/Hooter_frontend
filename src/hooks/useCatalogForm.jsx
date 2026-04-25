import { useState } from "react";

const BASE_URL = import.meta.env.VITE_BASEAPI;

export default function useCatalogForm() {
  // ── Dynamic fields from attribute-fields API ──────────
  const [fieldAttributes, setFieldAttributes] = useState({});
  const [imageAttributes, setImageAttributes] = useState({});

  // ── Form values ───────────────────────────────────────
  const [fixedValues, setFixedValues] = useState({
    "sku-id": "",
    'title': "",
    "price": "",
    "compared-price": "",
    "purchasing-cost": "",
    "vendor": "",
    "ean": "",
    "hsn": "",
    "net-weight": "",
    "dead-weight": "",
    "volumetric-weight": "",
    "brand-name": "",
  });
  const [dynamicValues, setDynamicValues] = useState({});

  // ── UI state ──────────────────────────────────────────
  const [selectedType, setSelectedType] = useState("");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ── Product type selected → fetch attribute fields ────
  const handleTypeChange = async (typeId) => {
    setSelectedType(typeId);
    setFieldAttributes({});
    setImageAttributes({});
    setDynamicValues({});

    if (!typeId) return;

    try {
      const res = await fetch(
        `${BASE_URL}/catalog/attribute-fields?type=${typeId}`,
        {
          credentials: "include",
        },
      );
      const json = await res.json();

      if (!res.ok) throw new Error("Failed to load attribute fields");

      setFieldAttributes(json.field_attributes || {});
      setImageAttributes(json.image_attributes || {});

      const initialDynamic = {};
      Object.keys(json.field_attributes || {}).forEach((key) => {
        initialDynamic[key] = "";
      });
      setDynamicValues(initialDynamic);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Fixed field change handler ────────────────────────
  const handleFixedChange = (key, value) => {
    setFixedValues((prev) => ({ ...prev, [key]: value }));
  };

  // ── Dynamic field change handler ──────────────────────
  const handleDynamicChange = (key, value) => {
    setDynamicValues((prev) => ({ ...prev, [key]: value }));
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
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok)
        throw new Error(json.msg || json.message || "Submission failed");

      setSuccess(true);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    // type (needed for noAttributes check in add-catalog)
    selectedType,
    handleTypeChange,
    // fixed fields
    fixedValues,
    handleFixedChange,
    // dynamic fields
    fieldAttributes,
    imageAttributes,
    dynamicValues,
    handleDynamicChange,
    // steps
    step,
    setStep,
    // ui
    submitting,
    error,
    success,
    handleSubmit,
  };
}
