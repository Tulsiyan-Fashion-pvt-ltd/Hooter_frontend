import React from "react";
import "../css/pages/login.css";
import "../css/layout/universal-layout.css";
import LoginCardSVG  from "../assets/login_card.svg";
import LoginStarsSVG from "../assets/login_stars.svg";
import LoginStarPNG from "../assets/star-pattern.png";

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-wrapper">
        
        <div className="login-svg-slot login-wrapper-item">
          <div id="blue-style-container"></div>
          {/* <img src={LoginCardSVG} alt="Login card" className="login-svg login-card" />
          <img src={LoginStarsSVG} alt="Login decoration" className="login-svg login-stars" />
          <img src={LoginStarPNG} alt="Login decoration" className="login-svg login-stars"/> */}
        </div>

        <div className="login-content login-wrapper-item">
          <h1>Hooter</h1>
          <p className="subtitle">Work Space Login</p>

          <form id="login-form">
            <input type="email" placeholder="Email Address" />
            <input type="tel" placeholder="Mobile Number" />
            <input type="password" placeholder="Password" />
          </form>

          <div className="form-footer">
            <span className="forgot">Forgot Password?</span>
            <button className="submit-btn" form="login-form">
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
