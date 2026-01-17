import { useState } from "react";
import "../css/pages/sidebar.css";
import { NavLink } from "react-router-dom";


const Sidebar = () => {
  const [activeTopBtn, setActiveTopBtn] = useState("home");

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
    <aside className="isolated-sidebar">

      {/* Brand */}
      <div className="sidebar-header">
        <span className="sidebar-title">Style Myntra</span>
      </div>

      {/* Home & Support buttons */}
      <button
        className={`sidebar-top-btn sidebar-home ${
          activeTopBtn === "home" ? "active" : ""
        }`}
        onClick={() => setActiveTopBtn("home")}
      >
        Home
      </button>

      <button
        className={`sidebar-top-btn sidebar-support ${
          activeTopBtn === "support" ? "active" : ""
        }`}
        onClick={() => setActiveTopBtn("support")}
      >
        Support
      </button>

      {/* Underline */}
      <div className="sidebar-underline"></div>

      {/* Menu items */}
      <nav className="sidebar-menu">
        {items.map((item) => (
          <div className="sidebar-item" key={item}>
            <span className="sidebar-label">{item}</span>
            <span className="sidebar-arrow">{'>'}</span>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">© Powered by Hooter</div>

    </aside>
  );
};

export default Sidebar;
