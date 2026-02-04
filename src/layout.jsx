import { Outlet } from "react-router-dom";
import { useLayoutEffect, useState } from "react";
import Sidebar from "./components/sidebar";
import styles from './css/layout/Layout.module.css';

const Layout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(300);

  useLayoutEffect(() => {
    const sidebar = document.querySelector("aside");
    if (!sidebar) return;

    const observer = new ResizeObserver(([entry]) => {
      setSidebarWidth(entry.contentRect.width);
    });

    observer.observe(sidebar);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.globalBody}>
      <div className={styles.sidebar_body}>
        <Sidebar/>
      </div>
      
      <div className={styles.globalOutlet}>
        <Outlet/>
      </div>
    </div>
  );
};

export default Layout;
