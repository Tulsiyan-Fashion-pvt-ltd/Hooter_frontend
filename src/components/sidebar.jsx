import { Children, useRef, useState, useEffect, } from "react";
import React from "react";
import clsx from "clsx";
import styles from "../css/layout/sidebar.module.css";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useContext } from "react";
import { toastContext } from "../appContext";
const host = import.meta.env.VITE_BASEAPI;



const Sidebar = () => {
  const [brandProfile, setBrandProfile] = useState({});  // brand data to show the sidebar
  const csrfToken = useSelector(state => state.csrf.csrf);
  console.log(brandProfile)
  // notification toast
  const showToast = useContext(toastContext);

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



  useEffect(()=>{
    async function fetchBrandProfile(){
      const response = await fetch(`${host}/brand/profile`,
        {
          credentials: "include"
        }
      );

      const data = await response.json()
      if (response.status !== 200){
        console.error(data ? data.message: "Error: could not fetch the brand profile");
      }

      await setBrandProfile({...data, ['image_url']: `${data.image_url? `${host}${data.image_url}`: null}`});
    }

    fetchBrandProfile();
  }, [])


  async function uploadBrandImage() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    console.log(fileInput)
    fileInput.click();

    fileInput.onchange = async (event) => {
      const file = event.target.files[0];

      if (!file) return;

      try {
        const response = await fetch(`${host}/brand/profile/image`, {
          method: "PUT",
          headers: {
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/octet-stream",
            "X-Filename": file.name
          },
          credentials: "include",
          body: file
        })

        const data = await response.json()

        if (!response.ok) showToast(data? data: "Failed to upload image", "red");

        const imageUrl = URL.createObjectURL(file);

        setBrandProfile((prev) => ({
          ...prev,
          ['image_url']: imageUrl
        }));

        showToast(data.message, "green");
      }
      catch (e) {
        showToast("Failed to upload image", "red");
      }
    }
  }


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
        <div className={styles.icon} style={{"backgroundImage": `url(${brandProfile.image_url})`}}>
          <div className={styles.brandProfileEditContainer} onClick={uploadBrandImage}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
          </div>
        </div>
        {!collapsed && (
          <span className={styles.sidebarTitle}>{brandProfile.brand_name}</span>
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

                  <div className={styles.navMenu}>
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
                  </div>
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
                  <div className={styles.navMenu}>
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
      </nav>

      {/* <div className={clsx(styles.sidebarUnderline, styles.bottom)} /> */}
      <div className={styles.sidebarFooterContainer}>
        {/* <div className={styles.sidebarFooterIcon}></div> */}
        {!collapsed && (
          <div className={styles.sidebarFooter}>© Powered by Hooter</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
