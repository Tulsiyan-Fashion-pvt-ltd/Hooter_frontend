import React from "react";
import "../css/login.css";
import LoginCardSVG  from "../assets/login_card.svg";
import LoginStarsSVG from "../assets/login_stars.svg";

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-wrapper">
        
        <div className="login-svg-slot">
          <img src={LoginCardSVG} alt="Login card" className="login-svg login-card" />
          <img src={LoginStarsSVG} alt="Login decoration" className="login-svg login-stars" />
        </div>

        <div className="login-content">
          <h1>Hooter</h1>
          <p className="subtitle">Work Space Login</p>

          <form>
            <input type="email" placeholder="Email Address" />
            <input type="tel" placeholder="Mobile Number" />
            <input type="password" placeholder="Password" />

            <div className="form-footer">
              <span className="forgot">Forgot Password?</span>
              <button className="submit-btn">
                <span className="submit-arrow"></span>
              </button>

            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;
