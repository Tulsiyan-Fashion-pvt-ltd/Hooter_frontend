import { useState } from "react";
import styles from "../css/pages/inventory.Inventory.module.css";
import plusIcon from "../assets/icons/plus.svg";
import minusIcon from "../assets/icons/minus.svg";

export default function Counter({ initialValue = 0 }) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => {
    if (count > 0) setCount(count - 1);
  };

  return (
    <div className={styles.counterBox}>
      <span className={styles.counterValue}>{count}</span>
      <div className={styles.counterButtonGroup}>
        <button className={styles.counterBtn} onClick={increment}>
          <img src={plusIcon} alt="+" className={styles.svgIcon} />
        </button>
        <button className={styles.counterBtn} onClick={decrement}>
          <img src={minusIcon} alt="-" className={styles.svgIcon} />
        </button>
      </div>
    </div>
  );
}
