import { useState } from "react";
import clsx from "clsx";
import styles from "../css/layout/Sidebar.module.css";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const [collapsed, setCollapsed] = useState(true);
  const [indicator, setIndicator] = useState('/');

  const items = {
    "Home": '/',
    "Catalog": '/catalog',
    "Inventory": '/inventory',
    "Order": '/order',
    "Shipping": '/shipping',
    "Payments": '/payments',
    "Stats": '/stats',
    "Settings": '/settings',
  }

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
        <div className={styles.icon}></div>
        {!collapsed && <span className={styles.sidebarTitle}>Style Myntra</span>}
      </div>

      {/* <div className={clsx(styles.sidebarUnderline, styles.top)} /> */}

      {/* Menu */}
      <nav className={styles.sidebarMenu}>
        <hr/>
        <div className={styles.navigation}>
          {Object.keys(items).map((item) => (
            <NavLink
              key={item}
              to={items[item]}
              onClick={() => {
                // e.preventDefault();
                setActiveMenuItem(item);
                setIndicator(items[item]);
              }}
              className={clsx(
                styles.sidebarItem,
                styles.noUnderline,
                activeMenuItem === item && styles.active
              )}
            > 
              <div className={clsx(styles.indicator, indicator==items[item]? styles.activeIndicator: styles.inactiveIndicator)}></div>
              <span className={styles.itemIcons} />
              {!collapsed && <span className={styles.sidebarLabel}>{item}</span>}
            </NavLink>
          ))}
        </div>
        <hr/>
      </nav>

      {/* <div className={clsx(styles.sidebarUnderline, styles.bottom)} /> */}
      <div className={styles.sidebarFooterContainer}>
        <div className={styles.sidebarFooterIcon}></div>
      {!collapsed && <div className={styles.sidebarFooter}>© Powered by Hooter</div>}
      </div>
    </aside>
  );
};

export default Sidebar;
