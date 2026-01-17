import { ArrowProceedBttn } from "../components/proceed-bttn";
import styles from "../css/pages/Register.module.css";
import { Link } from "react-router-dom";

const Register = () => {
    return (
        <div id="register-container" className={styles.registerContainer}>
            <div className={styles.container}>
                <form>
                    <div className={styles.section}>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <input type="text" placeholder="Full name" />
                            </div>
                            <div className={styles.formGroup}>
                                <input type="text" placeholder="User Designation" />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <input type="text" placeholder="Contact Number" />
                            </div>
                            <div className={styles.formGroup}>
                                <input type="email" placeholder="Email Address" />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                <input type="text" placeholder="If POC For Future" />
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Business Details</h2>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <input type="text" placeholder="Business Name" />
                            </div>
                            <div className={styles.formGroup}>
                                <input type="text" placeholder="Business Start Date" />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <input type="text" placeholder="GST Number" />
                            </div>
                            <div className={styles.formGroup}>
                                <input type="text" placeholder="Number Of Active Employee" />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <input type="text" placeholder="Business Niche" />
                            </div>
                            <div className={styles.formGroup}>
                                <input
                                    type="text"
                                    placeholder="Business Registered Address"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <Link to="#" className={styles.backLink}>Back</Link>
                        <ArrowProceedBttn />
                    </div>
                </form>
            </div>
        </div>

    )
}

export default Register;