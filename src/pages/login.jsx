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

  // function to handle the submit
  const login = async () => {
    let error = null;
    const inputs = Array.from(document.querySelectorAll('input'));

    // verify all the inputs and senitize them
    inputs.forEach((element) => {
      // removing the incorrect input style
      element.classList.remove('incorrect-input');

      // verify the whether the inputs are empty or not
      if ((email == "") || (element.getAttribute('id') == 'email' && !validateEmail(email))) {
        element.classList.add('incorrect-input');
        error = true;
      }
    })

    if (error == true) {
      return;
    }

    setLoading(true);
    try {
      // after validation send the server all the info
      const response = await fetch(`${route}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ 'email': email, 'password': password })
      })

      const data = await response.json();

      setLoading(false);

      if (response.status != 200) {
        setErrorMessage(data.message);
      } else {
        navigate('/');
      }
    }
    catch {
      setLoading(false);
      alert('unable to ping the server')
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginWrapper}>

        <div className={`${styles.loginSvgSlot} ${styles.loginWrapperItem}`} style={{ display: 'none' }}>
          <div className={styles.blueStyleContainer}></div>
          {/*
      <img src={LoginCardSVG} alt="Login card" className={`${styles.loginSvg} ${styles.loginCard}`} />
      <img src={LoginStarsSVG} alt="Login decoration" className={`${styles.loginSvg} ${styles.loginStars}`} />
      <img src={LoginStarPNG} alt="Login decoration" className={styles.loginSvg} />
      */}
        </div>

        <div className={`${styles.loginContent} ${styles.loginWrapperItem}`}>
          <h1 className={styles.heading}>Hooter</h1>
          <p className={styles.subtitle}>Work Space Login</p>

          <form className={styles.form}>
            <input
              id="email"
              type="email"
              placeholder="Email Address"
              className={styles.input}
              onChange={(e) => { setEmail(e.target.value) }}
              required
            />
            <input
              id="password"
              type="password"
              placeholder="Password"
              className={styles.input}
              onChange={(e) => { setPassword(e.target.value) }}
              required
            />
            <div className={styles.errorMsg}>{errorMessage}</div>
          </form>

          <div className={styles.formFooter}>
            <span className={styles.forgot}>Forgot Password?</span>
            <ArrowProceedBttn onClick={login} />
          </div>
        </div>

      </div>
      {loading? <Spinner/>: ''}
    </div>
  );

};

export default Login;
