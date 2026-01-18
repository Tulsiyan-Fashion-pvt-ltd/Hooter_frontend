import { ArrowProceedBttn } from '../components/proceed-bttn';
import styles from '../css/pages/Signup.module.css'

const Signup = () => {
    return(
        <div className={styles.superContainer}>
        <div id="signup-container" className={styles.container}>
            <h1 className={styles.heading}>Sign Up</h1>
            <p className={styles.desc}>Create new account</p>

            <div id="identification-credentials" className={styles.identificationContainer}>
                <div id="input-fields" className={styles.inputFields}>
                    <input type="text" id="mail" name='mail' placeholder='Enter your e-mail' />
                    <input type="text" id="num" name='num' placeholder='Enter your phone number' />
                    <input type="text" id="password" name='password' placeholder='Create password'/>
                    <input type="text" id="conf-pass" name='conf-password' placeholder='Confirm password'/>
                </div>
                <div className={styles.buttonContainer}>
                <ArrowProceedBttn className={styles.proceedButton}/>
                </div>
            </div>
        </div>
        </div>
    )
}

export default Signup;