import React from "react";
import styles from "../css/components/DeleteConfirmModal.module.css";

const WarningIcon = () => (
  <div className={styles.iconContainer}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  </div>
);

export default function DeleteConfirmModal({
  isOpen,
  title,
  subtitle,
  warningNote,
  warningHighlight,
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={isLoading ? undefined : onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <WarningIcon />
        
        <h3 className={styles.title}>{title}</h3>
        
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

        {(warningNote || warningHighlight) && (
          <div className={styles.warningBox}>
            <p className={styles.warningText}>
              {warningHighlight && <strong>{warningHighlight} </strong>}
              {warningNote}
            </p>
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
