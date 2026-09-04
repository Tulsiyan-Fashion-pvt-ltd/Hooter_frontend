import { ArrowProceedBttn } from "../components/proceed-bttn";
import styles from "../css/pages/Register.module.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { validatePincode } from "../modules/validate";
import { Spinner } from "../components/spinner";
import ConfirmAnnimation from "../components/confirmAnnimation";
import {
  registerBrand,
  getNiches,
  getUserProfile,
} from "../services/brandService";
import { setBrandConnection } from "../store/slices/brandSlice";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [niches, setNiches] = useState([]);
  const [pincode, setPincode] = useState("");
  const [entityName, setEntityName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [niche, setNiche] = useState("");
  const [gstin, setGstin] = useState("");
  const [plan, setPlan] = useState("");
  const [address, setAddress] = useState("");
  const [estYear, setEstYear] = useState("");
  const [formError, setFormError] = useState("");
  const [invalidFields, setInvalidFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [checkPOC, setCheckPOC] = useState(false);
  const [POC, setPOC] = useState({
    self: false,
    name: "",
    number: "",
    email: "",
    designation: "",
    access: "",
    password: "",
    confPassword: "",
  });

  const [pincodeValueError, setPincodeValueError] = useState(false);

  useEffect(() => {
    async function fetchNiches() {
      try {
        const data = await getNiches();
        setNiches(data.niches || []);
      } catch (err) {
        console.error("Failed to fetch niches:", err);
      }
    }
    fetchNiches();
  }, []);


  async function submit() {
    setFormError("");
    const errors = {};

    if (!entityName.trim()) errors.entityName = true;
    if (!brandName.trim()) errors.brandName = true;
    if (!niche || niche === "default") errors.niche = true;
    if (!plan || plan === "default") errors.plan = true;
    if (!address.trim()) errors.address = true;
    if (!pincode.trim()) {
      errors.pincode = true;
      setPincodeValueError(false);
    } else if (!validatePincode(pincode.trim())) {
      errors.pincode = true;
      setPincodeValueError(true);
    } else {
      setPincodeValueError(false);
    }
    if (!estYear.trim()) errors.estYear = true;

    if (!POC.self) {
      if (!POC.name.trim()) errors.pocName = true;
      if (!POC.designation.trim()) errors.pocDesignation = true;
      if (!POC.number.trim()) errors.pocNumber = true;
      if (!POC.email.trim()) errors.pocEmail = true;
      if (!POC.access || POC.access === "default") errors.pocAccess = true;

      if (!POC.password || POC.password.length < 6) {
        errors.pocPassword = true;
        setInvalidFields(errors);
        setFormError(
          "password must at least contain 6 characters. Password should match the confirm password"
        );
        return;
      }

      if (POC.password !== POC.confPassword) {
        errors.pocConfPassword = true;
        setInvalidFields(errors);
        setFormError(
          "password must at least contain 6 characters. Password should match the confirm password"
        );
        return;
      }
    }

    setInvalidFields(errors);

    if (Object.keys(errors).length > 0) {
      setFormError("empty input field *");
      return;
    }

    setLoading(true);
    try {
      const res = await registerBrand(
        {
          "entity-name": entityName,
          "brand-name": brandName,
          niche: niche,
          gstin: gstin,
          plan: plan,
          address: address,
          pincode: pincode,
          estyear: estYear,
        },
        POC
      );

      if (res.status !== 200) {
        setFormError(res.data?.message || "Failed to register brand");
      } else {
        showSubmittedAnimation();
        dispatch(
          setBrandConnection({
            connection: "connected",
            brands: "single brand",
            currentBrand: {
              brand_name: brandName,
            },
          })
        );
        // resetting the form
        setPOC({
          self: false,
          name: "",
          number: "",
          email: "",
          designation: "",
          access: "",
          password: "",
          confPassword: "",
        });

        setPincode("");
        setEntityName("");
        setBrandName("");
        setNiche("");
        setGstin("");
        setPlan("");
        setAddress("");
        setEstYear("");
        setCheckPOC(false);
        setInvalidFields({});

        setTimeout(() => {
          navigate("/");
        }, 2500);
      }

      setLoading(false);
    } catch {
      setLoading(false);
      setFormError("unable to register the business");
    }
  }

  function showSubmittedAnimation() {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  }

  const [fetchedPOC, setFetchedPOC] = useState(null);
  async function handlePOC(value) {
    if (value === true) {
      setPOC((prev) => ({ ...prev, self: true }));
    }

    if (value === true && fetchedPOC === null) {
      try {
        const user_data = await getUserProfile();
        const nextPOC = {
          ...user_data.user_data,
          self: true,
          password: "",
          confPassword: "",
        };
        setFetchedPOC(nextPOC);
        setPOC(nextPOC);
      } catch (err) {
        console.error("Failed to fetch user profile for POC:", err);
      }
    }


    if (value === false) {
      setPOC((prev) => ({
        ...prev,
        self: false,
        name: "",
        number: "",
        email: "",
        designation: "",
        access: "",
        password: "",
        confPassword: "",
      }));
    } else if (value === true && fetchedPOC !== null) {
      setPOC(fetchedPOC);
    }
  }

  function handleBackButton() {
    navigate(-1);
  }


  const incorrect = { outline: "1px solid red" };

  return (
    <div id="register-container" className={styles.registerContainer}>
      <div className={styles.container}>
        <p className={styles.description}>* fields are compulsory</p>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Business Details</h2>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <input
                onChange={(e) => {
                  setEntityName(e.target.value);
                  if (invalidFields.entityName) {
                    setInvalidFields((prev) => ({ ...prev, entityName: false }));
                  }
                }}
                value={entityName}
                type="text"
                name="legal-name"
                placeholder="Legal Name *"
                maxLength={255}
                required
                className={invalidFields.entityName ? "incorrect-input" : ""}
              />
            </div>
            <div className={styles.formGroup}>
              <input
                onChange={(e) => {
                  setBrandName(e.target.value);
                  if (invalidFields.brandName) {
                    setInvalidFields((prev) => ({ ...prev, brandName: false }));
                  }
                }}
                value={brandName}
                type="text"
                name="brand-name"
                placeholder="Brand Name *"
                maxLength={128}
                required
                className={invalidFields.brandName ? "incorrect-input" : ""}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <select
                onChange={(e) => {
                  setNiche(e.target.value);
                  if (invalidFields.niche) {
                    setInvalidFields((prev) => ({ ...prev, niche: false }));
                  }
                }}
                value={niche === "" ? "default" : niche}
                name="niche"
                id="niche"
                className={`${styles.item} ${invalidFields.niche ? "incorrect-input" : ""}`}
                style={invalidFields.niche ? incorrect : {}}
                placeholder="Brand Niche *"
                required
              >
                <option value="default" disabled hidden>
                  Brand Niche *
                </option>
                {niches.map((nicheItem, key) => {
                  return (
                    <option key={key} value={nicheItem}>
                      {nicheItem.charAt(0).toUpperCase() + nicheItem.slice(1)}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className={styles.formGroup}>
              <input
                onChange={(e) => {
                  setGstin(e.target.value);
                }}
                value={gstin}
                type="text"
                name="gstin"
                placeholder="GSTIN"
                maxLength={15}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <select
                onChange={(e) => {
                  setPlan(e.target.value);
                  if (invalidFields.plan) {
                    setInvalidFields((prev) => ({ ...prev, plan: false }));
                  }
                }}
                value={plan === "" ? "default" : plan}
                name="plan"
                id="select-plan"
                className={`${styles.item} ${invalidFields.plan ? "incorrect-input" : ""}`}
                style={invalidFields.plan ? incorrect : {}}
              >
                <option value="default" hidden disabled>
                  Select Plan *
                </option>
                <option value="lite">LITE</option>
                <option value="pro">PRO</option>
                <option value="ent">ENTERPRISE</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <input
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (invalidFields.address) {
                    setInvalidFields((prev) => ({ ...prev, address: false }));
                  }
                }}
                value={address}
                type="text"
                name="address"
                placeholder="Registered Address *"
                maxLength={500}
                className={invalidFields.address ? "incorrect-input" : ""}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <input
                onChange={(e) => {
                  setPincode(e.target.value);
                  if (invalidFields.pincode) {
                    setInvalidFields((prev) => ({ ...prev, pincode: false }));
                  }
                }}
                value={pincode}
                type="text"
                name="pincode"
                placeholder="Area Pincode *"
                maxLength={6}
                className={invalidFields.pincode ? "incorrect-input" : ""}
                style={pincodeValueError === true ? incorrect : {}}
              />
            </div>

            <div className={styles.formGroup}>
              <input
                onChange={(e) => {
                  setEstYear(e.target.value);
                  if (invalidFields.estYear) {
                    setInvalidFields((prev) => ({ ...prev, estYear: false }));
                  }
                }}
                value={estYear}
                type="text"
                name="est-yr"
                placeholder="Establishment Year *"
                maxLength={4}
                className={invalidFields.estYear ? "incorrect-input" : ""}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>POC</h2>
          <div id="select" className={styles.selectPOC}>
            <label htmlFor="selfPOC">
              <input
                onChange={(e) => {
                  setCheckPOC(e.target.checked);
                  handlePOC(e.target.checked);
                }}
                type="checkbox"
                className={styles.selfPOC}
                name="selfPOC"
                id="selfPOC"
                checked={checkPOC}
              />
              I am the POC
            </label>
          </div>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <input
                onChange={(e) => {
                  const val = e.target.value;
                  setPOC((prev) => ({ ...prev, name: val }));
                  if (invalidFields.pocName) {
                    setInvalidFields((prev) => ({ ...prev, pocName: false }));
                  }
                }}
                type="text"
                placeholder="Full name *"
                value={POC.name}
                maxLength={36}
                className={invalidFields.pocName ? "incorrect-input" : ""}
              />
            </div>
            <div className={styles.formGroup}>
              <input
                onChange={(e) => {
                  const val = e.target.value;
                  setPOC((prev) => ({ ...prev, designation: val }));
                  if (invalidFields.pocDesignation) {
                    setInvalidFields((prev) => ({ ...prev, pocDesignation: false }));
                  }
                }}
                type="text"
                placeholder="User Designation *"
                value={POC.designation}
                maxLength={64}
                className={invalidFields.pocDesignation ? "incorrect-input" : ""}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <input
                onChange={(e) => {
                  const val = e.target.value;
                  setPOC((prev) => ({ ...prev, number: val }));
                  if (invalidFields.pocNumber) {
                    setInvalidFields((prev) => ({ ...prev, pocNumber: false }));
                  }
                }}
                type="text"
                placeholder="Contact Number *"
                value={POC.number}
                maxLength={10}
                className={invalidFields.pocNumber ? "incorrect-input" : ""}
              />
            </div>
            <div className={styles.formGroup}>
              <input
                onChange={(e) => {
                  const val = e.target.value;
                  setPOC((prev) => ({ ...prev, email: val }));
                  if (invalidFields.pocEmail) {
                    setInvalidFields((prev) => ({ ...prev, pocEmail: false }));
                  }
                }}
                type="email"
                placeholder="Email Address *"
                value={POC.email}
                maxLength={128}
                className={invalidFields.pocEmail ? "incorrect-input" : ""}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={`${styles.formGroup} ${styles.halfWidth}`}>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  setPOC((prev) => ({ ...prev, access: val }));
                  if (invalidFields.pocAccess) {
                    setInvalidFields((prev) => ({ ...prev, pocAccess: false }));
                  }
                }}
                name="acess"
                id="access"
                className={`${styles.item} ${invalidFields.pocAccess ? "incorrect-input" : ""}`}
                style={invalidFields.pocAccess ? incorrect : {}}
                value={POC.access === "" ? "default" : POC.access}
                maxLength={12}
              >
                <option value="default" disabled hidden>
                  Select User Access *
                </option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="super_user">Super User</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>

          {!POC.self && (
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <input
                  onChange={(e) => {
                    const val = e.target.value;
                    setPOC((prev) => ({ ...prev, password: val }));
                    if (invalidFields.pocPassword) {
                      setInvalidFields((prev) => ({ ...prev, pocPassword: false }));
                    }
                  }}
                  type="password"
                  placeholder="Password *"
                  value={POC.password}
                  className={invalidFields.pocPassword ? "incorrect-input" : ""}
                />
              </div>
              <div className={styles.formGroup}>
                <input
                  onChange={(e) => {
                    const val = e.target.value;
                    setPOC((prev) => ({ ...prev, confPassword: val }));
                    if (invalidFields.pocConfPassword) {
                      setInvalidFields((prev) => ({ ...prev, pocConfPassword: false }));
                    }
                  }}
                  type="password"
                  placeholder="Confirm Password password *"
                  value={POC.confPassword}
                  className={invalidFields.pocConfPassword ? "incorrect-input" : ""}
                />
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button onClick={handleBackButton} className={styles.backLink}>
            Back
          </button>
          <ArrowProceedBttn onClick={submit} />
        </div>
        <div className={styles.row}>
          <div id="errorMessage" className="errorMessage">
            {formError}
          </div>
        </div>
      </div>
      {loading ? <Spinner /> : ""}
      {submitted ? <ConfirmAnnimation /> : ""}
    </div>
  );
};

export default Register;
