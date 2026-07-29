import { useState, useEffect } from "react";

export default function GridTable({
  styles,
  gridTemplate,
  compactGridTemplate,
  columns,
  data,
  renderRow,
  emptyText = "No data found.",
}) {
  const [isCompact, setIsCompact] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 900 : false,
  );

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth <= 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const activeTemplate =
    isCompact && compactGridTemplate ? compactGridTemplate : gridTemplate;

  return (
    <div
      className={styles.tableWrapper}
      style={{ "--list-grid": activeTemplate }}
    >
      <div className={styles.listHeader}>
        {columns.map((col) => (
          <div key={col.key} className={styles[col.className]}>
            {col.label}
          </div>
        ))}
      </div>
      <div className={styles.list}>
        {data && data.length > 0 ? (
          data.map(renderRow)
        ) : (
          <div className={styles.emptyState}>{emptyText}</div>
        )}
      </div>
    </div>
  );
}
