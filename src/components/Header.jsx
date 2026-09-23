import React from "react";
import { useLocation, Link } from "react-router-dom";
import styles from "../css/layout/Header.module.css";

// Route to breadcrumb mapping
const getBreadcrumbs = (pathname) => {
  if (pathname === "/" || pathname === "") {
    return { root: "Dashboard", current: "Overview", rootLink: "/" };
  }
  if (pathname === "/catalog") {
    return { root: "Catalog", current: "Upload catalog", rootLink: "/catalog" };
  }
  if (pathname === "/catalog/add-catalog") {
    return { root: "Catalog", current: "Add single catalog", rootLink: "/catalog" };
  }
  if (pathname === "/catalog/add-bulk-catalog") {
    return { root: "Catalog", current: "Add bulk catalog", rootLink: "/catalog" };
  }
  if (pathname.startsWith("/catalog/edit")) {
    return { root: "Catalog", current: "Edit catalog", rootLink: "/catalog" };
  }
  if (pathname.startsWith("/inventory")) {
    return { root: "Inventory", current: "Manage inventory", rootLink: "/inventory" };
  }
  if (pathname.startsWith("/orders")) {
    return { root: "Orders", current: "All orders", rootLink: "/orders" };
  }

  // Fallback: format path segment
  const segments = pathname.split("/").filter(Boolean);
  const root = segments[0] ? segments[0].charAt(0).toUpperCase() + segments[0].slice(1) : "Home";
  const current = segments[1] ? segments[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Overview";
  return { root, current, rootLink: `/${segments[0] || ""}` };
};

export default function Header() {
  const location = useLocation();
  const { root, current, rootLink } = getBreadcrumbs(location.pathname);

  return (
    <header className={styles.headerContainer}>
      {/* Left: Breadcrumbs */}
      <div className={styles.breadcrumb}>
        <Link to={rootLink} className={styles.breadcrumbRoot}>
          {root}
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{current}</span>
      </div>

      {/* Right: Clock, Notification, Avatar */}
      <div className={styles.headerRight}>
        {/* Action icons & Profile */}
        <div className={styles.actionsGroup}>
          {/* History/Clock icon */}
          <button className={styles.iconBtn} title="Recent activity" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </button>

          {/* Bell / Notification icon with badge */}
          <button className={styles.iconBtn} title="Notifications" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className={styles.badge}>5</span>
          </button>

          {/* User Avatar Initials */}
          <div className={styles.avatar} title="User Profile">
            AK
          </div>
        </div>
      </div>
    </header>
  );
}
