import { ArrowProceedBttn } from "../components/proceed-bttn";
import "../css/pages/register.css";
import {Link} from "react-router-dom";

const Register = () => {
    return (
        <div id="register-container">
            <div className="container">
                <form>
                    <div className="section">
                        <div className="row">
                            <div className="form-group">
                                <input type="text" placeholder="Full name" />
                            </div>
                            <div className="form-group">
                                <input type="text" placeholder="User Designation" />
                            </div>
                        </div>
                        <div className="row">
                            <div className="form-group">
                                <input type="text" placeholder="Contact Number" />
                            </div>
                            <div className="form-group">
                                <input type="email" placeholder="Email Address" />
                            </div>
                        </div>
                        <div className="row">
                            <div className="form-group half-width">
                                <input type="text" placeholder="If POC For Future" />
                            </div>
                        </div>
                    </div>

                    <div className="section">
                        <h2 className="section-title">Business Details</h2>
                        <div className="row">
                            <div className="form-group">
                                <input type="text" placeholder="Business Name" />
                            </div>
                            <div className="form-group">
                                <input type="text" placeholder="Business Start Date" />
                            </div>
                        </div>
                        <div className="row">
                            <div className="form-group">
                                <input type="text" placeholder="GST Number" />
                            </div>
                            <div className="form-group">
                                <input type="text" placeholder="Number Of Active Employee" />
                            </div>
                        </div>
                        <div className="row">
                            <div className="form-group">
                                <input type="text" placeholder="Business Niche" />
                            </div>
                            <div className="form-group">
                                <input type="text" placeholder="Business Registered Address" />
                            </div>
                        </div>
                    </div>

                    <div className="footer">
                        <Link to="#" className="back-link">Back</Link>
                        <ArrowProceedBttn/>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register;