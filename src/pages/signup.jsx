import { useNavigate, } from 'react-router-dom';
import { ArrowProceedBttn } from '../components/proceed-bttn';
import styles from '../css/pages/Signup.module.css'
import { validateEmail, validateInNumber } from "../modules/validate";
import { Spinner } from '../components/spinner';
import { useState } from 'react';
// import { useEffect } from 'react';
const route = import.meta.env.VITE_BASEAPI;

const Signup = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const submit = async ()=>{
        // verify all the input parameters
        const name = document.querySelector('#name');
        const mail = document.querySelector('#mail');
        const number = document.querySelector('#num');
        const designation = document.querySelector('#designation');
        const password = document.querySelector('#password');
        const confPassword = document.querySelector('#conf-pass');
        // flag to check whether encountered any issue or not
        let errorFlag;

        const parameters = [name, mail, number, designation, password, confPassword];

        parameters.forEach(element => {
            // resetting the style
            element.classList.remove('incorrect-input');

            // if the parameter is empty except designation then change the style
            if ((element != designation && element.value == "")|| (element == mail && !validateEmail(mail.value)) || (element == number && !validateInNumber(number.value))){
                element.classList.add('incorrect-input');
                errorFlag = true;
                return;
            }
        });

        // validate password

        let error = document.querySelector('#error-container');
        //clearing the prev error messages created earlier
        error.innerHTML='';

        if (password.value.length < 6){
            password.classList.add('incorrect-input');
            error.innerHTML = `<p class=${styles.inputError}>Password must be atleast 6 characters long</p>`;
            errorFlag=true
        }else if (password.value != confPassword.value){
            confPassword.classList.add('incorrect-input');
            error.innerHTML = `<p class=${styles.inputError}>Password is not matching</p>`;
            errorFlag=true;
        }

        // exit function if there is any error found
        if (errorFlag==true){
            return;
        }

        setLoading(true);
        const response = await fetch(`${route}/signup`, {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            credentials: "include", 
            body: JSON.stringify({
                'name': name.value,
                'email': mail.value,
                'number': number.value,
                'designation': designation.value,
                'password': password.value
            })
        })

        const data = await response.json();
        setLoading(false);
        if (data.status == 'ok' && response.status == 200){
            navigate('/');
        }else if (response.status == 409){
            error.innerHTML = `<p class=${styles.inputError}>User already registered</p>`;
            return;
        }
    }

    return(
        <div className={styles.superContainer}>
            <div id="signup-container" className={styles.container}>
                <h1 className={styles.heading}>Sign Up</h1>
                <p className={styles.desc}>Create new account</p>

                <div id="identification-credentials" className={styles.identificationContainer}>
                    <div id="input-fields" className={styles.inputFields}>
                        <input type="text" id="name" name='name' placeholder='Name' maxLength='36' />
                        <input type="text" id="mail" name='mail' placeholder='E-mail' required maxLength="36" />
                        <input type="text" className={styles.phoneNum} id="num" name='num' placeholder='Phone number' required maxLength="10" /><span className={styles.countryCode}>+91 </span>
                        <input type="text" id="designation" name='designation' placeholder='Designation (optional)' maxLength='64' />
                        <input type="text" id="password" name='password' placeholder='Create password' required />
                        <input type="text" id="conf-pass" name='conf-password' placeholder='Confirm password' required />
                        <div id="error-container"></div>
                    </div>
                    <div className={styles.buttonContainer}>
                        <ArrowProceedBttn className={styles.proceedButton} onClick={submit} />
                    </div>
                </div>
            </div>
            {loading?<Spinner/>:''}
        </div>
    )
}

export default Signup;