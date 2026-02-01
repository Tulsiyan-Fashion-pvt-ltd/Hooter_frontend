import { Outlet } from "react-router-dom";
import Sidebar from "./components/sidebar";
import styles from './css/layout/Layout.module.css';

const Layout = () => {
  return (
    <div className={styles.globalBody}>
        <Sidebar/>
        <Outlet/>
    </div>
  );
};

export default Layout;