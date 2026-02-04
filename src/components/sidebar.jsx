import { useState } from "react";
import clsx from "clsx";
import styles from "../css/layout/Sidebar.module.css";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const [collapsed, setCollapsed] = useState(true);

  const items = [
    "Home",
    "Catalog",
    "Inventory",
    "Order",
    "Shipping",
    "Contactless Payment",
    "Stats",
    "Settings",
  ];

  return (
    <aside
      className={clsx(
        styles.isolatedSidebar,
        collapsed && styles.collapsed
      )}
    >
      {/* Toggle */}
      <button
        className={styles.collapseToggle}
        onClick={() => setCollapsed((prev) => !prev)}
      >
        {collapsed ? ">>" : "<<"}
      </button>

      {/* Header */}
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>Style Myntra</span>
      </div>

      <div className={clsx(styles.sidebarUnderline, styles.top)} />

      {/* Menu */}
      <nav className={styles.sidebarMenu}>
        {items.map((item) => (
          <NavLink
            key={item}
            to="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveMenuItem(item);
            }}
            className={clsx(
              styles.sidebarItem,
              styles.noUnderline,
              activeMenuItem === item && styles.active
            )}
          >
            <span className={styles.sidebarLabel}>{item}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className={clsx(styles.sidebarUnderline, styles.bottom)} />
      <div className={styles.sidebarFooter}>© Powered by Hooter</div>
    </aside>
  );
};

export default Sidebar;
