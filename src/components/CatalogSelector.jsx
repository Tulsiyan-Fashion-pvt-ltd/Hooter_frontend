/**
 * CatalogSelector Component
 *
 * A reusable cascade dropdown selector for niche, sub-niche, category and product type.
 *
 * USAGE:
 * 1. Import the hook and component:
 *    import useCatalogForm from '../hooks/useCatalogForm';
 *    import CatalogSelector from '../components/CatalogSelector';
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
 *      styles={styles}  // Optional: pass custom styles object
 *    />
 *
 * NOTE:
 * - Dropdowns cascade in order: Niche → Sub-niche → Category → Product
 * - Each dropdown is disabled until the previous one is selected
 * - Fetches niche data from GET /catalog/niche-data on mount
 * - Fetches attribute fields from GET /catalog/attribute-fields?type=<id> on product select
 * - Requires login session cookie (credentials: 'include')
 */

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
  styles,
}) {
  // Use provided styles or create a basic fallback for CSS modules
  const getClass = (className) => {
    if (styles && styles[className]) {
      return styles[className];
    }
    return className;
  };

  // Format text: capitalize first letter, replace underscores/hyphens with spaces
  const formatText = (text) => {
    if (!text) return '';
    return text
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  };

  // Debug logging
  console.log('CatalogSelector props - nicheOptions:', nicheOptions);

  return (
    <div className={getClass("dropdown_row")}>
      <div className={getClass("dropdown_wrap")}>
        <label className={getClass("dropdown_label")}>Niche *</label>
        <select
          value={selectedNiche}
          onChange={(e) => handleNicheChange(e.target.value)}
          className={getClass("dropdown_select")}
        >
          <option value="">Select Niche</option>
          {nicheOptions && nicheOptions.length > 0 ? (
            nicheOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {formatText(o.label)}
              </option>
            ))
          ) : (
            <option disabled>No options available</option>
          )}
        </select>
      </div>

      <div className={getClass("dropdown_wrap")}>
        <label className={getClass("dropdown_label")}>Sub-niche *</label>
        <select
          value={selectedSubNiche}
          onChange={(e) => handleSubNicheChange(e.target.value)}
          disabled={!selectedNiche}
          className={getClass("dropdown_select")}
          style={{ opacity: !selectedNiche ? 0.5 : 1 }}
        >
          <option value="">Select Sub-niche</option>
          {subNicheOptions && subNicheOptions.length > 0 ? (
            subNicheOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {formatText(o.label)}
              </option>
            ))
          ) : (
            <option disabled>No options available</option>
          )}
        </select>
      </div>

      <div className={getClass("dropdown_wrap")}>
        <label className={getClass("dropdown_label")}>Category *</label>
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          disabled={!selectedSubNiche}
          className={getClass("dropdown_select")}
          style={{ opacity: !selectedSubNiche ? 0.5 : 1 }}
        >
          <option value="">Select Category</option>
          {categoryOptions && categoryOptions.length > 0 ? (
            categoryOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {formatText(o.label)}
              </option>
            ))
          ) : (
            <option disabled>No options available</option>
          )}
        </select>
      </div>

      <div className={getClass("dropdown_wrap")}>
        <label className={getClass("dropdown_label")}>Product *</label>
        <select
          value={selectedType}
          onChange={(e) => handleTypeChange(e.target.value)}
          disabled={!selectedCategory}
          className={getClass("dropdown_select")}
          style={{ opacity: !selectedCategory ? 0.5 : 1 }}
        >
          <option value="">Select Product</option>
          {productTypeOptions && productTypeOptions.length > 0 ? (
            productTypeOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {formatText(o.label)}
              </option>
            ))
          ) : (
            <option disabled>No options available</option>
          )}
        </select>
      </div>
    </div>
  );
}
