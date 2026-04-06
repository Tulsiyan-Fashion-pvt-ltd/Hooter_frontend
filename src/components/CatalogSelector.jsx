/**
 * CatalogSelector Component
 *
 * A reusable cascade dropdown selector for niche, sub-niche, category and product type.
 *
 * USAGE:
 * 1. Import the hook and component:
 *    import useCatalogForm from '../hooks/useCatalogForm';
 *    import CatalogSelector from '../modules/CatalogSelector';
 *
 * 2. Destructure the required values from the hook:
 *    const {
 *      selectedNiche, selectedSubNiche, selectedCategory, selectedType,
 *      nicheOptions, subNicheOptions, categoryOptions, productTypeOptions,
 *      handleNicheChange, handleSubNicheChange, handleCategoryChange, handleTypeChange,
 *    } = useCatalogForm();
 *
 * 3. Use the component:
 *    <CatalogSelector
 *      selectedNiche={selectedNiche}
 *      selectedSubNiche={selectedSubNiche}
 *      selectedCategory={selectedCategory}
 *      selectedType={selectedType}
 *      nicheOptions={nicheOptions}
 *      subNicheOptions={subNicheOptions}
 *      categoryOptions={categoryOptions}
 *      productTypeOptions={productTypeOptions}
 *      handleNicheChange={handleNicheChange}
 *      handleSubNicheChange={handleSubNicheChange}
 *      handleCategoryChange={handleCategoryChange}
 *      handleTypeChange={handleTypeChange}
 *    />
 *
 * NOTE:
 * - Dropdowns cascade in order: Niche → Sub-niche → Category → Product
 * - Each dropdown is disabled until the previous one is selected
 * - Fetches niche data from GET /catalog/niche-data on mount
 * - Fetches attribute fields from GET /catalog/attribute-fields?type=<id> on product select
 * - Requires login session cookie (credentials: 'include')
 */

import styles from "../css/pages/add-catalog.module.css";

export default function CatalogSelector({
  selectedNiche,
  selectedSubNiche,
  selectedCategory,
  selectedType,
  nicheOptions,
  subNicheOptions,
  categoryOptions,
  productTypeOptions,
  handleNicheChange,
  handleSubNicheChange,
  handleCategoryChange,
  handleTypeChange,
}) {
  return (
    <div className={styles.dropdown_row}>
      <div className={styles.dropdown_wrap}>
        <label className={styles.dropdown_label}>Niche *</label>
        <select
          value={selectedNiche}
          onChange={(e) => handleNicheChange(e.target.value)}
          className={styles.dropdown_select}
        >
          <option value="">Select Niche</option>
          {nicheOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

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
