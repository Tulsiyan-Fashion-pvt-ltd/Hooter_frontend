import styles from '../css/pages/Catalog.module.css'
import { NavLink } from 'react-router-dom';

export default function Catalog() {
  const products = [
    {
      image: "Rectangle 845.svg",
      sku: "#564563432143245645",
      title: "Kurta",
      mrp: 1299,
      status: "Active",
    },
    {
      image: "Rectangle 855.svg",
      sku: "#564563432143245645",
      title: "Kurta",
      mrp: 1299,
      status: "Pause",
    },
    {
      image: "Rectangle 867.svg",
      sku: "#564563432143245645",
      title: "Kurta",
      mrp: 1299,
      status: "Pause",
    },
  ];

  return (
    <div className={styles.mainContainer}>
      <div className={styles.header}>
        <h1>Upload Catalog</h1>
        <p>
          Welcome back, Sarah! Here's a snapshot of your platform's performance.
        </p>
      </div>

      <div className={styles.container}>
        <div className={styles.topActions}>
          <NavLink to='./add-bulk-catalog'>
            <button className={`${styles.btn} ${styles.btnPrimary}`}>
              Add Catalog in Bulk
            </button>
          </NavLink>

          <NavLink to='./add-catalog'>
            <button className={`${styles.btn} ${styles.btnLight}`}>
              Add Single Catalog
            </button>
          </NavLink>

        </div>

        <div className={styles.cards}>
          <div className={styles.card}>
            <h3>Total Uploads Done</h3>
            <p>26</p>
          </div>

          <div className={styles.card}>
            <h3>Bulk Uploads</h3>
            <p>14</p>
          </div>

          <div className={styles.card}>
            <h3>Single Uploads</h3>
            <p>12</p>
          </div>
        </div>

        <div className={styles.tabs}>
          <a href="#" className={styles.activeTab}>All (26)</a>
          <a href="#">Action Required (0)</a>
          <a href="#">QC In Progress (10)</a>
          <a href="#">QC Error (5)</a>
          <a href="#">QC Pass (7)</a>
          <a href="#">Draft (11)</a>
        </div>

        <div className={styles.filters}>
          <select className={styles.select}>
            <option>Select Category</option>
            <option>Kurta</option>
            <option>Shirt</option>
          </select>

          <input
            className={styles.input}
            type="text"
            placeholder="Search by SKU ID"
          />
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Image</th>
              <th className={styles.th}>SKU ID</th>
              <th className={styles.th}>Title</th>
              <th className={styles.th}>MRP</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Options</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p, index) => (
              <tr key={index}>
                <td className={styles.td}>
                  <img className={styles.image} src={p.image} alt="Product" />
                </td>

                <td className={styles.td}>{p.sku}</td>
                <td className={styles.td}>{p.title}</td>
                <td className={styles.td}>Rs {p.mrp}</td>

                <td className={styles.td}>
                  <span
                    className={`${styles.status} ${p.status === "Active"
                      ? styles.statusActive
                      : styles.statusPause
                      }`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className={`${styles.td} ${styles.actions}`}>
                  <a href="#" className={styles.edit}>Edit</a>
                  <a href="#" className={styles.delete}>Delete</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}