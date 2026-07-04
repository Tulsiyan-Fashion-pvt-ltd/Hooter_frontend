import { Outlet } from "react-router-dom";
import Sidebar from "./components/sidebar";
import styles from './css/layout/Layout.module.css';
import { useSearchParams } from "react-router-dom";

const Layout = () => {
  const [searchParams, searchSearchParams] = useSearchParams();

  console.log(searchParams)
  return (
    <div className={styles.globalBody}>
      <div className={styles.sidebar_body}>
        <Sidebar />
      </div>
      <div className={styles.globalOutlet}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;