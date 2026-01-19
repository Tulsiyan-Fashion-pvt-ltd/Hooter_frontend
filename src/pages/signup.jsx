import { useEffect } from 'react';
import { ArrowProceedBttn } from '../components/proceed-bttn';
import styles from '../css/pages/Signup.module.css'

const Signup = () => {
    const submit = async ()=>{
        console.log('clicking')
        const name = document.querySelector('#name');
        const response = await fetch('http://localhost:8800/signup', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            credentials: "include", 
            body: JSON.stringify({'name': name.value})
        })
    }

    return(
        <div className={styles.superContainer}>
        <div id="signup-container" className={styles.container}>
            <h1 className={styles.heading}>Sign Up</h1>
            <p className={styles.desc}>Create new account</p>

            <div id="identification-credentials" className={styles.identificationContainer}>
                <div id="input-fields" className={styles.inputFields}>
                    <input type="text" id="name" name='name' placeholder='Name'/>
                    <input type="text" id="mail" name='mail' placeholder='E-mail' required />
                    <input type="text" id="num" name='num' placeholder='Phone number' required />
                    <input type="text" id="designation" name='designation' placeholder='Designation (optional)' />
                    <input type="text" id="password" name='password' placeholder='Create password' required />
                    <input type="text" id="conf-pass" name='conf-password' placeholder='Confirm password' required />
                </div>
                <div className={styles.buttonContainer}>
                <ArrowProceedBttn className={styles.proceedButton} onClick={submit}/>
                </div>
            </div>
        </div>
        </div>
    )
}

export default Signup;