import React from 'react';
import styles from '../css/components/Toast.module.css';

/**
 * Toast — Fixed bottom-right notification popup.
 *
 * Renders nothing when `toast.visible` is false.
 *
 * @param {{ message: string, type: 'green'|'yellow'|'red', visible: boolean }} toast
 *   - Supplied directly by the `useToast` hook.
 *
 * @example
 *   import useToast from '../hooks/useToast';
 *   import Toast from '../components/Toast';
 *
 *   const { toast, showToast } = useToast();
 *   showToast("Upload successful!", "green");
 *
 *   // in JSX:
 *   <Toast toast={toast} />
 */
export default function Toast({ toast }) {
  if (!toast.visible) return null;

  const colorClass =
    toast.type === 'green'
      ? styles.toastGreen
      : toast.type === 'yellow'
        ? styles.toastYellow
        : styles.toastRed;

  const icon =
    toast.type === 'green' ? '✓' : toast.type === 'yellow' ? '⚠' : '✕';

  return (
    <div className={`${styles.toast} ${colorClass}`}>
      <span className={styles.toastIcon}>{icon}</span>
      {toast.message}
    </div>
  );
}
