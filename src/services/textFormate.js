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




export const toNameCase = (str = '') => {
  const text = str
    .toString()
    .replace(/[^a-zA-Z0-9\s]/g, '');

    return text.charAt(0).toUpperCase() + text.slice(1).toLocaleLowerCase();
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
export const toCamelCase = (pascalStr = '') => {
  if (!pascalStr) return '';
  return pascalStr.charAt(0).toLowerCase() + pascalStr.slice(1);
};
