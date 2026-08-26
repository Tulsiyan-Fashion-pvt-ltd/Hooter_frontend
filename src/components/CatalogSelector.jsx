import { useState, useEffect } from "react";
import styles from "../css/pages/add-catalog.module.css";
import {
  getTopCategories,
  getNextCategories,
} from "../services/catalogService";

const fmt = (str) =>
  str?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function CatalogSelector({ onTypeSelect }) {
  const [levels, setLevels] = useState([]); // [{ options: [{id, name, full_name, vertical}], selectedId: "" }]

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const json = await getTopCategories();
        setLevels([{ options: json.level0 || [], selectedId: "" }]);
      } catch (err) {
        console.error("CatalogSelector fetch error:", err.message);
      }
    };
    fetchTop();
  }, []);

  const handleLevelChange = async (levelIndex, selectedId) => {
    setLevels((prev) => {
      const updated = prev.slice(0, levelIndex + 1);
      updated[levelIndex] = { ...updated[levelIndex], selectedId };
      return updated;
    });

    if (!selectedId) return;

    const selectedOption = levels[levelIndex].options.find(
      (o) => String(o.id) === String(selectedId),
    );
    if (!selectedOption) return;

    try {
      const json = await getNextCategories(
        selectedOption.id,
        selectedOption.vertical,
      );
      const next = json.next || [];

      if (next.length === 0) {
        onTypeSelect({
          id: selectedOption.id,
          vertical: selectedOption.vertical,
        });
        return;
      }

      setLevels((prev) => {
        const updated = prev.slice(0, levelIndex + 1);
        updated.push({ options: next, selectedId: "" });
        return updated;
      });
    } catch (err) {
      console.error("CatalogSelector next-level fetch error:", err.message);
    }
  };

  return (
    <div className={styles.dropdown_row}>
      {levels.map((level, idx) => (
        <div className={styles.dropdown_wrap} key={idx}>
          <label className={styles.dropdown_label}>
            {idx === 0 ? "Niche *" : `Level ${idx + 1} *`}
          </label>
          <select
            value={level.selectedId}
            onChange={(e) => handleLevelChange(idx, e.target.value)}
            className={styles.dropdown_select}
            disabled={level.options.length === 0}
          >
            <option value="">Select</option>
            {level.options.map((o) => (
              <option key={o.id} value={o.id}>
                {fmt(o.name || o.full_name)}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
