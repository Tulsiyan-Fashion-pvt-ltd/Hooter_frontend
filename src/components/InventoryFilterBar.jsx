/**
 * InventoryFilterBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared catalog-style filter toolbar used across all three Inventory tabs:
 *   • StockInventory  (stock level filters + warehouse)
 *   • InwardInventory (status filters + supplier + warehouse)
 *   • GrnInventory    (status filters + supplier + warehouse)
 *
 * Layout  ┌──────────────────────────────────────────────────────────┐
 *         │  [Tab] [Tab] [Tab] ...  [Dropdown ▾]   Search □  Export  │
 *         └──────────────────────────────────────────────────────────┘
 *
 * Props
 * ──────────────────────────────────────────────────────────────────────────────
 * tabs          {id, label, count?}[]   Array of filter tabs to render.
 *                                       `count` is optional — omit to hide badge.
 * activeTab     string                  `id` of the currently selected tab.
 * onTabChange   (id: string) => void    Called when the user clicks a tab.
 *
 * dropdowns     {label, options: {value, label}[]}[]
 *                                       Optional array of dropdown filters
 *                                       (e.g. Warehouse, Supplier). Each gets
 *                                       its own state internally and fires
 *                                       onDropdownChange when changed.
 * onDropdownChange (dropdownLabel, value) => void
 *                                       Called whenever any dropdown changes.
 *
 * searchValue   string                  Current search input value.
 * searchPlaceholder string             Placeholder text for the search input.
 * onSearchChange  (value: string) => void  Called on every keystroke.
 *
 * onExport      () => void              Called when the Export button is clicked.
 *                                       If omitted the button is still rendered
 *                                       (useful to wire up later).
 *
 * rightSlot     ReactNode               Optional extra element rendered to the
 *                                       right of Export (e.g. "+ Create inward").
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect } from "react";
import styles from "../css/pages/inventory.Inventory.module.css";

/* ─── Internal: single dropdown with open/close state ───────────────────────── */
function FilterDropdown({ label, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(""); // "" means "All"
  const ref = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function handleSelect(value) {
    setSelected(value);
    setOpen(false);
    onChange?.(label, value);
  }

  /* Display label: show selected option's label, or fall back to "Label (All)" */
  const displayLabel = selected
    ? options.find((o) => o.value === selected)?.label ?? label
    : `${label} (All)`;

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {/* Trigger button */}
      <button
        type="button"
        className={styles.filterDropdownBtn}
        style={{ paddingRight: "28px" }}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {displayLabel}
      </button>

      {/* Chevron icon (non-interactive) */}
      <svg
        style={{
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: `translateY(-50%) rotate(${open ? "180deg" : "0deg"})`,
          pointerEvents: "none",
          color: "#64748b",
          transition: "transform 0.15s ease",
        }}
        width="10" height="10" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>

      {/* Dropdown menu */}
      {open && (
        <div className={styles.filterDropdownMenu} role="listbox">
          {/* "All" option always first */}
          <div
            className={`${styles.filterDropdownItem} ${selected === "" ? styles.filterDropdownItemActive : ""}`}
            role="option"
            aria-selected={selected === ""}
            onClick={() => handleSelect("")}
          >
            {label} (All)
          </div>

          {options.map((opt) => (
            <div
              key={opt.value}
              className={`${styles.filterDropdownItem} ${selected === opt.value ? styles.filterDropdownItemActive : ""}`}
              role="option"
              aria-selected={selected === opt.value}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main exported component ────────────────────────────────────────────────── */
export default function InventoryFilterBar({
  tabs = [],
  activeTab,
  onTabChange,
  dropdowns = [],
  onDropdownChange,
  searchValue = "",
  searchPlaceholder = "Search…",
  onSearchChange,
  onExport,
  rightSlot,
}) {
  return (
    <div className={styles.topNav}>

      {/* ── Left: status tabs + dropdown filters ─────────────────────────── */}
      <div className={styles.filterTabs} role="group" aria-label="Filter options">

        {/* Status / type tabs with optional count badge */}
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            type="button"
            className={`${styles.filterTab} ${activeTab === id ? styles.filterTabActive : ""}`}
            onClick={() => onTabChange?.(id)}
            aria-pressed={activeTab === id}
          >
            <span>{label}</span>
            {count !== undefined && (
              <span
                className={`${styles.filterTabCount} ${activeTab === id ? styles.filterTabCountActive : ""}`}
              >
                {count}
              </span>
            )}
          </button>
        ))}

        {/* Optional dropdown filters (Warehouse, Supplier, etc.) */}
        {dropdowns.map((dd) => (
          <FilterDropdown
            key={dd.label}
            label={dd.label}
            options={dd.options}
            onChange={onDropdownChange}
          />
        ))}
      </div>

      {/* ── Right: search input + export button + optional slot ──────────── */}
      <div className={styles.actionGroup}>

        {/* Search input */}
        <div className={styles.searchBox}>
          <svg
            className={styles.searchIcon}
            fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            aria-label={searchPlaceholder}
          />
        </div>

        {/* Export button */}
        <button
          className={styles.btnExport}
          title="Export"
          onClick={onExport}
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>

        {/* Optional extra element (e.g. "+ Create inward" button) */}
        {rightSlot}
      </div>

    </div>
  );
}

