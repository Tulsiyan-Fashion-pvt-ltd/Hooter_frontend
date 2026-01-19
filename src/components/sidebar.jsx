import { useState } from "react";
import clsx from "clsx";
import styles from "../css/pages/Sidebar.module.css";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const [activeTopBtn, setActiveTopBtn] = useState("home");
  const [activeMenuItem, setActiveMenuItem] = useState(null);

  const items = [
    "Catalog",
    "Inventory",
    "Order",
    "Shipping",
    "Payments",
    "Stats",
    "Settings",
    "Logout",
  ];

  return (
    <aside className={styles.isolatedSidebar}>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>Style Myntra</span>
      </div>

      {/* Home */}
      <NavLink
        to="#"
        onClick={(e) => {
          e.preventDefault();
          setActiveTopBtn("home");
        }}
        className={clsx(
          styles.sidebarHome,
          styles.noUnderline,
          activeTopBtn === "home" && styles.active
        )}
      >
        Home
      </NavLink>

      {/* Support */}
      <NavLink
        to="#"
        onClick={(e) => {
          e.preventDefault();
          setActiveTopBtn("support");
        }}
        className={clsx(
          styles.sidebarSupport,
          styles.noUnderline,
          activeTopBtn === "support" && styles.active
        )}
      >
        Support
      </NavLink>

      <div className={styles.sidebarUnderline}></div>

      {/* Menu items */}
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
            <span className={styles.sidebarArrow} />
          </NavLink>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>© Powered by Hooter</div>
    </aside>
  );
};

export default Sidebar;
