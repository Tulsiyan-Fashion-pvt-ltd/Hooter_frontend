import Sidebar from "./components/sidebar";
import styles from "./css/pages/Homepage.module.css";

const Homepage = () => {
  return (
    <>
      <Sidebar />

      <main className={styles.pageContent}>
        <h1>Homepage</h1>
      </main>
    </>
  );
};

export default Homepage;
