import { Outlet, Navigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "./components/sidebar";
import styles from './css/layout/Layout.module.css';
import { connectBrand } from "./services/brandService";
import { setBrandConnection } from "./store/slices/brandSlice";

const Layout = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { connection, brands } = useSelector((state) => state.brand);

  useEffect(() => {
    // Only call the API when the brand state is still unknown (fresh page load).
    // Once it's resolved (connected / not connected) we skip to avoid redundant calls.
    if (connection !== "unknown") return;

    async function checkBrand() {
      try {
        const res = await connectBrand();
        if (res.status === 200 || res.status === 201) {
          dispatch(setBrandConnection(res.data));
        }
        // 401 / other errors are handled by the Protect guard already.
      } catch (err) {
        console.error("Brand connection check failed:", err);
      }
    }

    checkBrand();
  }, [connection, dispatch]);

  // Still resolving — render nothing to avoid a flash of the wrong page.
  if (connection === "unknown") return null;

  // No brand registered for this user → send them to register.
  if (connection === "not connected" && brands === null) {
    return <Navigate to={`/register-brand?${searchParams}`} replace />;
  }

  // Multiple brands and none selected yet → send them to select-brand.
  if (connection === "not connected" && Array.isArray(brands)) {
    return <Navigate to={`/select-brand?${searchParams}`} replace />;
  }

  return (
    <div className={styles.globalBody}>
      <div className={styles.sidebar_body}>
        <Sidebar />
      </div>
      <div className={styles.globalOutlet}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;