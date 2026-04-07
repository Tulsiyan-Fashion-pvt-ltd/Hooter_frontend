import { useNavigate } from "react-router-dom";
import styles from "../css/components/NoCatalogModal.module.css";

const NoCatalogModal = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.message}>No catalog data found</p>
        <button
          className={styles.addBtn}
          onClick={() => navigate('/catalog')}
        >
          Add Catalog
        </button>
      </div>
    </div>
  );
};

export default NoCatalogModal;