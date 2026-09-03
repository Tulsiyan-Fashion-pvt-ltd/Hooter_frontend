import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { connectBrand, connectBrandById } from "../services/brandService";
import { setBrandConnection, setCurrentBrand } from "../store/slices/brandSlice";
import { Spinner } from "../components/spinner";
import styles from "../css/pages/SelectBrand.module.css";

const SelectBrand = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { brands } = useSelector((state) => state.brand);

  const [availableBrands, setAvailableBrands] = useState(
    Array.isArray(brands) ? brands : []
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadBrands() {
      if (!Array.isArray(brands) || brands.length === 0) {
        setLoading(true);
        try {
          const res = await connectBrand();
          if (res.status === 200 && res.data.connection === "connected") {
            dispatch(setBrandConnection(res.data));
            navigate("/");
            return;
          }

          if (res.status === 201) {
            if (res.data.brands === null) {
              dispatch(setBrandConnection(res.data));
              navigate("/register-brand");
              return;
            } else if (Array.isArray(res.data.brands)) {
              dispatch(setBrandConnection(res.data));
              setAvailableBrands(res.data.brands);
            }
          } else if (res.status === 401) {
            navigate("/login");
          } else if (res.status === 403) {
            setErrorMsg(res.data.message || "No brand found for this user");
          } else {
            setErrorMsg(res.data.message || "Failed to load brands");
          }
        } catch (err) {
          console.error("Error loading brands:", err);
          setErrorMsg("Unable to reach the server");
        } finally {
          setLoading(false);
        }
      }
    }

    loadBrands();
  }, [brands, dispatch, navigate]);

  const handleSelectBrand = async (brand) => {
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await connectBrandById(brand.brand_id);

      if (res.status === 200) {
        dispatch(
          setBrandConnection({
            connection: "connected",
            brands: "single brand",
            currentBrand: brand,
            ...res.data,
          })
        );
        dispatch(setCurrentBrand(brand));
        navigate("/");
      } else if (res.status === 400) {
        setErrorMsg(res.data?.message || "Invalid brand ID");
      } else if (res.status === 401) {
        navigate("/login");
      } else if (res.status === 403) {
        setErrorMsg(res.data?.message || "No brand found for this user");
      } else if (res.status >= 500) {
        setErrorMsg("Internal server error. Please try again later.");
      } else {
        setErrorMsg(res.data?.message || "Failed to connect to the selected brand");
      }
    } catch (err) {
      console.error("Failed to connect brand:", err);
      setErrorMsg("Unable to reach the server");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={styles.superContainer}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Select Brand</h1>
        <p className={styles.desc}>
          Multiple brands found for your account. Please select one to proceed.
        </p>

        {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

        <div className={styles.brandList}>
          {availableBrands.map((b) => (
            <button
              key={b.brand_id}
              className={styles.brandCard}
              onClick={() => handleSelectBrand(b)}
              type="button"
            >
              <div className={styles.brandInfo}>
                <span className={styles.brandName}>{b.brand_name}</span>
                <span className={styles.brandId}>Brand ID: {b.brand_id}</span>
              </div>
              <span className={styles.actionIcon}>&rarr;</span>
            </button>
          ))}

          {availableBrands.length === 0 && !loading && (
            <div className={styles.emptyState}>
              No brands available to select.
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <Link to="/register-brand" className={styles.registerLink}>
            + Register a new brand
          </Link>
        </div>
      </div>

      {loading && <Spinner />}
    </div>
  );
};

export default SelectBrand;
