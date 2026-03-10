import React, { useState } from "react";
import styles from "../css/pages/login.module.css";
import "../css/layout/universal-layout.css";
import { ArrowProceedBttn } from '../components/proceed-bttn'
import { Spinner } from '../components/spinner';
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../modules/validate";

const route = import.meta.env.VITE_BASEAPI;

const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setErrorMessage('');

    // 🔹 Validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage("All fields are required");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Invalid email format");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${route}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      let data = {};
      try {
        data = await response.json();
      } catch {}

<<<<<<< Updated upstream
      setLoading(false);

      if (response.status != 200) {
        setErrorMessage(data.login.message);
      } else {
        // console.log(data.brand_connection.Status.redirect)
        // server will decide whether the page should be redirected to the home page, register brand page or pick a brand as super admin
        navigate(data.brand_connection.Status.redirect);
=======
      if (!response.ok) {
        setErrorMessage(data.message || "Login failed");
      } else {
        navigate('/');
>>>>>>> Stashed changes
      }

    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to reach the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginWrapper}>

        <div className={`${styles.loginContent} ${styles.loginWrapperItem}`}>
          <h1 className={styles.heading}>Hooter</h1>
          <p className={styles.subtitle}>Work Space Login</p>

          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
          >
            <input
              id="email"
              type="email"
              placeholder="Email Address"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              id="password"
              type="password"
              placeholder="Password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className={styles.errorMsg}>{errorMessage}</div>

            <div className={styles.formFooter}>
              <span className={styles.forgot}>Forgot Password?</span>
              <ArrowProceedBttn type="submit" />
            </div>
          </form>
        </div>
      </div>

      {loading && <Spinner />}
    </div>
  );
};

export default Login;