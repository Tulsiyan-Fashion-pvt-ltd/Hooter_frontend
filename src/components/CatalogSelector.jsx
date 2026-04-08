/**
 * CatalogSelector Component
 *
 * A self-contained reusable cascade dropdown selector for niche, sub-niche, category and product type.
 * Fetches its own niche data internally — no need to pass dropdown state or options from outside.
 *
 * USAGE:
 * 1. Import the component:
 *    import CatalogSelector from '../modules/CatalogSelector';
 *
 * 2. Use it with a single prop:
 *    <CatalogSelector onTypeSelect={(typeId) => doSomethingWithTypeId(typeId)} />
 *
 * PROPS:
 * - onTypeSelect (function, required) — called with the selected product type ID
 *   whenever the user picks a product type from the last dropdown.
 *
 * INTERNALS:
 * - Fetches niche data from GET /catalog/niche-data on mount
 * - Manages all 4 dropdown states and cascade logic internally
 * - Requires login session cookie (credentials: 'include')
 * - Uses VITE_BASEAPI env variable for the API base URL
 */

import { useState, useEffect } from "react";
import styles from "../css/pages/add-catalog.module.css";

const BASE_URL = import.meta.env.VITE_BASEAPI;

const fmt = (str) =>
  str?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function CatalogSelector({ onTypeSelect }) {
  // ── Niche data from API ───────────────────────────────
  const [nicheData, setNicheData] = useState({});

  // ── Dropdown selections ───────────────────────────────
  const [selectedNiche, setSelectedNiche] = useState("");
  const [selectedSubNiche, setSelectedSubNiche] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // ── Dropdown options ──────────────────────────────────
  const [nicheOptions, setNicheOptions] = useState([]);
  const [subNicheOptions, setSubNicheOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [productTypeOptions, setProductTypeOptions] = useState([]);

  // ── Fetch niche data on mount ─────────────────────────
  useEffect(() => {
    const fetchNicheData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/catalog/niche-data`, {
          credentials: "include",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.msg || "Failed to load categories");

        const data = json.niche_data;
        setNicheData(data);
        setNicheOptions(
          Object.entries(data).map(([id, val]) => ({
            id,
            label: fmt(val.niche),
          })),
        );
      } catch (err) {
        console.error("CatalogSelector fetch error:", err.message);
      }
    };

    fetchNicheData();
  }, []);

  // ── Cascade: niche → sub-niches ───────────────────────
  const handleNicheChange = (nicheId) => {
    setSelectedNiche(nicheId);
    setSelectedSubNiche("");
    setSelectedCategory("");
    setSelectedType("");
    setSubNicheOptions([]);
    setCategoryOptions([]);
    setProductTypeOptions([]);

    if (!nicheId) return;
    const subniches = nicheData[nicheId]?.subniches || {};
    setSubNicheOptions(
      Object.entries(subniches).map(([id, val]) => ({
        id,
        label: fmt(val.subniche) ?? `Sub-niche ${id}`,
      })),
    );
  };

  // ── Cascade: sub-niche → categories ──────────────────
  const handleSubNicheChange = (subNicheId) => {
    setSelectedSubNiche(subNicheId);
    setSelectedCategory("");
    setSelectedType("");
    setCategoryOptions([]);
    setProductTypeOptions([]);

    if (!subNicheId) return;
    const categories =
      nicheData[selectedNiche]?.subniches?.[subNicheId]?.categories || {};
    setCategoryOptions(
      Object.entries(categories).map(([id, val]) => ({
        id,
        label: fmt(val.category),
      })),
    );
  };

  // ── Cascade: category → product types ────────────────
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedType("");
    setProductTypeOptions([]);

    if (!categoryId) return;
    const products =
      nicheData[selectedNiche]?.subniches?.[selectedSubNiche]?.categories?.[
        categoryId
      ]?.products || {};
    setProductTypeOptions(
      Object.entries(products).map(([id, val]) => ({
        id,
        label: fmt(val.product),
      })),
    );
  };

  // ── Product type selected → notify parent ─────────────
  const handleTypeChange = (typeId) => {
    setSelectedType(typeId);
    if (typeId) onTypeSelect(typeId);
  };

  return (
    <div className={styles.dropdown_row}>
      {/* Niche */}
      <div className={styles.dropdown_wrap}>
        <label className={styles.dropdown_label}>Niche *</label>
        <select
          value={selectedNiche}
          onChange={(e) => handleNicheChange(e.target.value)}
          className={styles.dropdown_select}
          disabled={Object.keys(nicheData).length === 0}
        >
          <option value="">Select Niche</option>
          {nicheOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sub-niche */}
      <div className={styles.dropdown_wrap}>
        <label className={styles.dropdown_label}>Sub-niche *</label>
        <select
          value={selectedSubNiche}
          onChange={(e) => handleSubNicheChange(e.target.value)}
          disabled={!selectedNiche}
          className={styles.dropdown_select}
          style={{ opacity: !selectedNiche ? 0.5 : 1 }}
        >
          <option value="">Select Sub-niche</option>
          {subNicheOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className={styles.dropdown_wrap}>
        <label className={styles.dropdown_label}>Category *</label>
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          disabled={!selectedSubNiche}
          className={styles.dropdown_select}
          style={{ opacity: !selectedSubNiche ? 0.5 : 1 }}
        >
          <option value="">Select Category</option>
          {categoryOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Product Type */}
      <div className={styles.dropdown_wrap}>
        <label className={styles.dropdown_label}>Product *</label>
        <select
          value={selectedType}
          onChange={(e) => handleTypeChange(e.target.value)}
          disabled={!selectedCategory}
          className={styles.dropdown_select}
          style={{ opacity: !selectedCategory ? 0.5 : 1 }}
        >
          <option value="">Select Product</option>
          {productTypeOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
