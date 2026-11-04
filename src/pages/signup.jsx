import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowProceedBttn } from "../components/proceed-bttn";
import styles from "../css/pages/Signup.module.css";
import { validateEmail, validateInNumber } from "../modules/validate";
import { Spinner } from "../components/spinner";

const route = import.meta.env.VITE_BASEAPI;

const Signup = () => {
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [number, setNumber] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);

  const [invalidFields, setInvalidFields] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const submit = async () => {
    setErrorMsg("");
    const errors = {};

    if (!name.trim()) {
      errors.name = true;
    }

    if (!mail.trim() || !validateEmail(mail.trim())) {
      errors.mail = true;
    }

    if (!number.trim() || !validateInNumber(number.trim())) {
      errors.number = true;
    }

    if (password.length < 6) {
      errors.password = true;
      setErrorMsg("Password must be atleast 6 characters long");
    } else if (password !== confPassword) {
      errors.confPassword = true;
      setErrorMsg("Password is not matching");
    }

    setInvalidFields(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${route}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: mail.trim(),
          number: number.trim(),
          designation: designation.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));
      setLoading(false);

      if (data.status === "ok" && response.status === 200) {
        navigate({pathname: "/", search: `?${searchParams}`});
      } else if (response.status === 409) {
        setErrorMsg("User already registered");
      } else {
        setErrorMsg(data.message || "Unable to sign up");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setLoading(false);
      setErrorMsg("Unable to reach the server");
    }
  };

  return (
    <div className={styles.superContainer}>
      <div id="signup-container" className={styles.container}>
        <h1 className={styles.heading}>Sign Up</h1>
        <p className={styles.desc}>Create new account</p>

        <div
          id="identification-credentials"
          className={styles.identificationContainer}
        >
          <div id="input-fields" className={styles.inputFields}>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Name"
              maxLength="36"
              value={name}
              className={invalidFields.name ? "incorrect-input" : ""}
              onChange={(e) => {
                setName(e.target.value);
                if (invalidFields.name) {
                  setInvalidFields((prev) => ({ ...prev, name: false }));
                }
              }}
            />
            <input
              type="text"
              id="mail"
              name="mail"
              placeholder="E-mail"
              required
              maxLength="36"
              value={mail}
              className={invalidFields.mail ? "incorrect-input" : ""}
              onChange={(e) => {
                setMail(e.target.value);
                if (invalidFields.mail) {
                  setInvalidFields((prev) => ({ ...prev, mail: false }));
                }
              }}
            />
            <input
              type="text"
              className={`${styles.phoneNum} ${invalidFields.number ? "incorrect-input" : ""}`}
              id="num"
              name="num"
              placeholder="Phone number"
              required
              maxLength="10"
              value={number}
              onChange={(e) => {
                setNumber(e.target.value);
                if (invalidFields.number) {
                  setInvalidFields((prev) => ({ ...prev, number: false }));
                }
              }}
            />
            <span className={styles.countryCode}>+91 </span>
            <input
              type="text"
              id="designation"
              name="designation"
              placeholder="Designation (optional)"
              maxLength="64"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            />
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Create password"
                required
                value={password}
                className={`${styles.passwordInput} ${invalidFields.password ? "incorrect-input" : ""}`}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (invalidFields.password) {
                    setInvalidFields((prev) => ({ ...prev, password: false }));
                  }
                }}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>

            <div className={styles.passwordWrapper}>
              <input
                type={showConfPassword ? "text" : "password"}
                id="conf-pass"
                name="conf-password"
                placeholder="Confirm password"
                required
                value={confPassword}
                className={`${styles.passwordInput} ${invalidFields.confPassword ? "incorrect-input" : ""}`}
                onChange={(e) => {
                  setConfPassword(e.target.value);
                  if (invalidFields.confPassword) {
                    setInvalidFields((prev) => ({ ...prev, confPassword: false }));
                  }
                }}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowConfPassword((prev) => !prev)}
                title={showConfPassword ? "Hide password" : "Show password"}
                aria-label={showConfPassword ? "Hide password" : "Show password"}
              >
                {showConfPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
            <div id="error-container">
              {errorMsg && <p className={styles.inputError}>{errorMsg}</p>}
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <ArrowProceedBttn
              className={styles.proceedButton}
              onClick={submit}
            />
          </div>
        </div>
      </div>
      {loading ? <Spinner /> : ""}
    </div>
  );
};

export default Signup;
