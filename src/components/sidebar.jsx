import { Children, useRef, useState, useEffect } from "react";
import clsx from "clsx";
import styles from "../css/layout/sidebar.module.css";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });
  const [openMenu, setOpenMenu] = useState(null);
  const sidebarRef = useRef(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const closeTimer = useRef(null);

  // setting up the indicator as per the current location
  const path = useLocation();
  const navigate = useNavigate();
  const [indicator, setIndicator] = useState(`/${path.pathname.split("/")[1]}`); // indicator stores the values of the items' keys.
  //  and we can match currently on which item in the sidebar menu we are in
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });

  const handleLogout = async () => {
    try {
      const route = import.meta.env.VITE_BASEAPI;
      await fetch(`${route}/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  const openFlyout = (item, e) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setFlyoutPos({ top: rect.top, left: rect.right + 12 });
    setHoveredItem(item);
  };

  const scheduleCloseFlyout = () => {
    closeTimer.current = setTimeout(() => setHoveredItem(null), 150);
  };

  useEffect(() => {
    if (!openMenu) return; // don't bother attaching a listener if nothing's open

    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside, true);
  }, [openMenu]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed);
  }, [collapsed]);

  const items = {
    Home: { path: "/" },
    Catalog: { path: "/catalog" },
    Inventory: { path: "/inventory" },
    Order: {
      path: "/orders",
      subMenuIndent: 70,
      children: {
        activeOrders: { path: "/orders/active-orders", label: "Active Orders" },
        returns: { path: "/orders/returns", label: "Returns" },
        cancellation: { path: "/orders/cancellation", label: "Cancellations" },
      },
    },
    Shipping: { path: "/shipping" },
    Payments: { path: "/payments" },
    Stats: { path: "/stats" },
    Settings: { path: "/settings" },
  };

  return (
    <aside
      ref={sidebarRef}
      className={clsx(styles.isolatedSidebar, collapsed && styles.collapsed)}
    >
      {/* Toggle */}
      <button
        className={styles.collapseToggle}
        onClick={() => {
          setCollapsed((prev) => !prev);
          setOpenMenu(null);
        }}
      ></button>

      {/* Header */}
      <div className={styles.sidebarHeader}>
        <div className={styles.icon}></div>
        {!collapsed && (
          <span className={styles.sidebarTitle}>Style Myntra</span>
        )}
      </div>

      {/* Menu */}
      <nav className={styles.sidebarMenu}>
        <hr />
        <div className={styles.navigation}>
          {Object.keys(items).map((item) => {
            const hasChildren = items[item].children;

            if (!hasChildren) {
              return (
                <NavLink
                  key={item}
                  to={items[item].path}
                  data-item={item}
                  onClick={() => {
                    setIndicator(items[item].path);
                    setOpenMenu(null);
                  }}
                  className={clsx(styles.sidebarItem, styles.noUnderline)}
                >
                  <div
                    className={clsx(
                      styles.indicator,
                      indicator === items[item].path
                        ? styles.activeIndicator
                        : styles.inactiveIndicator,
                    )}
                  ></div>
                  <span
                    className={clsx(
                      styles.itemIcons,
                      indicator === items[item].path
                        ? styles.acitveItemIcons
                        : "",
                    )}
                  />
                  {!collapsed && (
                    <span
                      className={clsx(
                        styles.sidebarLabel,
                        indicator === items[item].path ? styles.activeText : "",
                      )}
                    >
                      {item}
                    </span>
                  )}
                </NavLink>
              );
            }
            return (
              <div
                key={item}
                className={styles.parentWrapper}
                onMouseEnter={(e) => collapsed && openFlyout(item, e)}
                onMouseLeave={() => collapsed && scheduleCloseFlyout()}
              >
                <div
                  className={styles.sidebarItem}
                  data-item={item}
                  onClick={() => {
                    setOpenMenu(openMenu === item ? null : item);
                    setIndicator(items[item].path);
                  }}
                >
                  <div
                    className={clsx(
                      styles.indicator,
                      indicator === items[item].path ||
                        Object.values(items[item].children).some(
                          (child) => child.path === indicator,
                        )
                        ? styles.activeIndicator
                        : styles.inactiveIndicator,
                    )}
                  />
                  <span
                    className={clsx(
                      styles.itemIcons,
                      indicator === items[item].path ||
                        Object.values(items[item].children).some(
                          (child) => child.path === indicator,
                        )
                        ? styles.acitveItemIcons
                        : "",
                    )}
                  />
                  {!collapsed && (
                    <span
                      className={clsx(
                        styles.sidebarLabel,
                        indicator === items[item].path ||
                          Object.values(items[item].children).some(
                            (child) => child.path === indicator,
                          )
                          ? styles.activeText
                          : "",
                      )}
                    >
                      {item}
                    </span>
                  )}
                </div>

                {/* Inline submenu — expanded sidebar */}
                {!collapsed && openMenu === item && (
                  <div
                    className={styles.subMenu}
                    style={{ paddingLeft: items[item].subMenuIndent ?? 40 }}
                  >
                    {Object.keys(items[item].children).map((childKey) => {
                      const child = items[item].children[childKey];
                      return (
                        <NavLink
                          key={childKey}
                          to={child.path}
                          className={clsx(
                            styles.subMenuItem,
                            styles.noUnderline,
                            indicator === child.path ? styles.activeText : "",
                          )}
                          onClick={() => {
                            setIndicator(child.path);
                          }}
                        >
                          <span
                            className={clsx(
                              styles.subIndicator,
                              indicator === child.path
                                ? styles.subIndicatorActive
                                : "",
                            )}
                          />
                          {child.label}
                        </NavLink>
                      );
                    })}
                  </div>
                )}

                {/* Flyout submenu — collapsed sidebar, on hover */}
                {collapsed &&
                  hoveredItem === item &&
                  createPortal(
                    <div
                      className={styles.flyoutMenu}
                      style={{ top: flyoutPos.top, left: flyoutPos.left }}
                      onMouseEnter={() =>
                        closeTimer.current && clearTimeout(closeTimer.current)
                      }
                      onMouseLeave={scheduleCloseFlyout}
                    >
                      <div className={styles.flyoutTitle}>{item}</div>
                      {Object.keys(items[item].children).map((childKey) => {
                        const child = items[item].children[childKey];
                        return (
                          <NavLink
                            key={childKey}
                            to={child.path}
                            className={clsx(
                              styles.subMenuItem,
                              styles.noUnderline,
                              indicator === child.path ? styles.activeText : "",
                            )}
                            onClick={() => {
                              setIndicator(child.path);
                              setHoveredItem(null);
                            }}
                          >
                            <span
                              className={clsx(
                                styles.subIndicator,
                                indicator === child.path
                                  ? styles.subIndicatorActive
                                  : "",
                              )}
                            />
                            {child.label}
                          </NavLink>
                        );
                      })}
                    </div>,
                    document.body,
                  )}
              </div>
            );
          })}
        </div>
        <hr />
        <div
          className={clsx(styles.sidebarItem)}
          onClick={handleLogout}
          style={{ cursor: "pointer", marginTop: "1rem", display: "flex", alignItems: "center", gap: "30px", paddingLeft: "5px" }}
        >
          <div className={styles.indicator} />
          <span
            className={clsx(styles.itemIcons)}
            style={{ backgroundImage: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16 17L21 12L16 7" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          {!collapsed && (
            <span className={clsx(styles.sidebarLabel)} style={{ color: "#d32f2f", marginLeft: "10px" }}>
              Logout
            </span>
          )}
        </div>
      </nav>

      {/* <div className={clsx(styles.sidebarUnderline, styles.bottom)} /> */}
      <div className={styles.sidebarFooterContainer}>
        <div className={styles.sidebarFooterIcon}></div>
        {!collapsed && (
          <div className={styles.sidebarFooter}>© Powered by Hooter</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
