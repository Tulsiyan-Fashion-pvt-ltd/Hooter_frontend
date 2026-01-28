import { Outlet } from "react-router-dom";
import Sidebar from "./components/sidebar";


const Layout = () => {
  return (
    <>
        <Sidebar/>
        <Outlet/>
    </>
  );
};

export default Layout;