import { Outlet } from "react-router-dom";
import Sidebar from "./components/sidebar";
import { useState, useEffect } from "react";

const Layout = () => {
  return (
    <>
        <Sidebar/>
        <Outlet/>
    </>
  );
};

export default Layout;