import { Outlet } from "react-router-dom";
import { useLayoutEffect, useState } from "react";
import Sidebar from "./components/sidebar";

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
    <>
      <Sidebar />
      <Outlet context={{ sidebarWidth }} />
    </>
  );
};

export default Layout;
