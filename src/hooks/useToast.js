import { useState, useRef } from 'react';

/**
 * useToast — Reusable toast notification hook.
 *
 * Returns:
 *   - toast     : { message, type, visible } — pass directly to <Toast />
 *   - showToast : (message, type) => void    — call to trigger a toast
 *
 * @param {number} [duration=4000] - Auto-dismiss delay in ms.
 *
 * @example
 *   const { toast, showToast } = useToast();
 *   showToast("Saved!", "green");
 *   // in JSX: <Toast toast={toast} />
 */
export default function useToast(duration = 4000) {
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  /* Holds the auto-dismiss setTimeout ID so we can cancel a pending dismiss
     whenever a newer toast fires before the previous one fades out.           */
  const timerRef = useRef(null);

  /**
   * Triggers the toast popup.
   *
   * @param {string}                    message - Text to display.
   * @param {'green'|'yellow'|'red'}    type    - Visual colour variant.
   */
  const showToast = (message, type) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ message, type, visible: true });

    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, duration);
  };

  return { toast, showToast };
}
