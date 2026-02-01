import { ArrowProceedBttn } from "../components/proceed-bttn";
import styles from "../css/pages/Register.module.css";
import { Link, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { validatePincode } from "../modules/validate";
import { Spinner } from "../components/spinner";
import ConfirmAnnimation from "../components/confirmAnnimation";

const route = import.meta.env.VITE_BASEAPI;

const Register = () => {
    const [niches, setNiches] = useState([]);
    const [pincode, setPincode] = useState('');
    const [entityName, setEntityName] = useState('');
    const [brandName, setBrandName] = useState('');
    const [niche, setNiche] = useState('');
    const [gstin, setGstin] = useState('');
    const [plan, setPlan] = useState('');
    const [address, setAddress] = useState('');
    const [estYear, setEstYear] = useState('');
    const [formError, setFormError] = useState();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false); // flag to show or hide the form successfully submitted animation

    const [checkPOC, setCheckPOC] = useState(false);
    const [POC, setPOC] = useState({
        'self': 'false',
        'name': '',
        'number': '',
        'email': '',
        'designation': '',
        'access': '',
        'password': '',
        'confPassword':''
    });
    console.log(POC)
    console.log(pincode,
entityName,
brandName,
niche,
gstin,
plan,
address,
estYear,)

    const [pincodeValueError, setPincodeValueError] = useState(false);

    useEffect(() => {
        async function fetchNiches() {
            const response = await fetch(`${route}/request-niches`, { credential: "include" });

            const data = await response.json();

            if (response.status == 200) {
                setNiches(data.niches);
            }
        }
        fetchNiches();
    }, [])


    async function submit(){
        // creating effect that if the pincode value is invalid then set the pincode error flag to true and if nothing is thre set it to null
        if (pincode == null || pincode=='') {
            setPincodeValueError(false);
        }
        else {
            setPincodeValueError(validatePincode(pincode));
            // setFormError('')
        }


        const inputs = Array.from(document.querySelectorAll('input'));
        const select = Array.from(document.querySelectorAll('select'));

        let error = false;

        inputs.forEach((element)=>{
            if (element.getAttribute('name')!='gstin' && (element.value == '' || element.value == null))
            {
                element.classList.add('incorrect-input');
                setFormError('empty input field *');
                error = true;
                return;
            }else
            {
                element.classList.remove('incorrect-input');
                setFormError('');
            }
        })

        select.forEach((element)=>{
            if (element.selectedOptions[0].getAttribute('value') == 'default')
            {
                element.style.outline = '1px solid red';
                setFormError('empty input field *');
                error = true;
                return;
            }
            else
            {
                element.style.outline = 'none';
                setFormError('');
            }
        })

        // validating password
        if (POC.self=='false'&&(POC.password.length < 6 || POC.password != POC.confPassword))
        {
            setFormError("password must at least contain 6 characters. Password should match the confirm password")
            return;
        }

        if (error == true)
        {   
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${route}/register`, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    'brand': {
                        'entity-name': entityName,
                        'brand-name': brandName,
                        'niche': niche,
                        'gstin': gstin,
                        'plan': plan,
                        'address': address,
                        'estYear': estYear
                    },
                    'poc': POC
                })
            })

            const data = await response.json()

            // if response is not 201 then stop loading spinner and show error message
            if (response.status != 201) {
                setFormError(data.message)
            }else
            {
                showSubmittedAnimation();
            }
            
            setLoading(false);
        }
        catch {
            setLoading(false)
            setFormError('unable to register the business')
        }
        finally {
            // resetting the form
            setPOC({
                'self': 'false',
                'name': '',
                'number': '',
                'email': '',
                'designation': '',
                'access': '',
                'password': '',
                'confPassword': ''
            })

            setPincode('')
            setEntityName('')
            setBrandName('')
            setNiche('')
            setGstin('')
            setPlan('')
            setAddress('')
            setEstYear('')

            setCheckPOC(false);
        }        
    }


    // show the animation and hide automatically after a certain timeout
    function showSubmittedAnimation(){
        setSubmitted(true);
        setTimeout(()=>{
            setSubmitted(false);
        }, 3000)
    }

    // handling the poc checkbox
    const [fetchedPOC, setFetchedPOC]=useState(null);
    async function handlePOC(value){
        // if the checkbox is checked the data is not available then fetch the data from the server
        // else show the already fetched data from the state to avoid fetching same details
        if (value==true)
        {
            setPOC((prev)=>({...prev, ['self']:'true'}))
        }
        
        if (value == true && (fetchedPOC==null))
        {
            const response = await fetch(`${route}/request-user-credentials`, {credentials: 'include'})
            const user_data = await response.json();
            setFetchedPOC({...user_data.user_data, ['self']: 'true', ['password']: '', ['confPassword']: ''});
            // console.log(data.access)
            setPOC({...user_data.user_data, ['self']: 'true', ['password']: '', ['confPassword']: ''})
            // console.log(fetchedPOC)
        }

        if (value==false)
        {
            setPOC((prev) => ({
              ...prev,
              ['self']: 'false',
              ['name']: '',
              ['number']: '',
              ['email']: '',
              ['designation']: '',
              ['access']: '',
              ['password']: '',
              ['confPassword']: ''
            }))
        }
        else if (value == true && fetchedPOC!=null)
        {
            setPOC(fetchedPOC);
        }

    }


    const navigate = useNavigate();
    function handleBackButton(){
        navigate(-1);
    }

    // styling for incorrect value
    const incorrect = { outline: '1px solid red' };
    // const correct = {outline: '1px solid green'};

    return (
        <div id="register-container" className={styles.registerContainer}>
            <div className={styles.container}>
                <p className={styles.description}>* fields are compulsory</p>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Business Details</h2>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setEntityName(e.target.value)}} value={entityName} type="text" name='legal-name' placeholder="Legal Name *" maxLength={255} required />
                        </div>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setBrandName(e.target.value)}} value={brandName} type="text" name="brand-name" placeholder="Brand Name *" maxLength={128} required />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <select onChange={(e)=>{setNiche(e.target.value)}} value={niche==''? 'default': niche} name="niche" id="niche" className={styles.item} placeholder='Brand Niche *' required>
                                <option value="default" disabled hidden>Brand Niche *</option>
                                {/* <option value="select" default disabled>SELECT</option> */}
                                {niches.map((niche, key) => {
                                    return (<option key={key} value={niche}>{niche.charAt(0).toUpperCase() + niche.slice(1)}</option>)
                                })}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setGstin(e.target.value)}} value={gstin} type="text" name="gstin" placeholder="GSTIN" maxLength={15} />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <select  onChange={(e)=>{setPlan(e.target.value)}} value={plan==''? 'default': plan} name="plan" id="select-plan" className={styles.item}>
                                <option value="default" hidden disabled>Select Plan *</option>
                                <option value="lite">LITE</option>
                                <option value="pro">PRO</option>
                                <option value="ent">ENTERPRISE</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setAddress(e.target.value)}}
                                value={address}
                                type="text"
                                name="address"
                                placeholder="Registered Address *"
                                maxLength={500}
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setPincode(e.target.value)}} value={pincode} type="text" name="pincode" placeholder="Area Pincode *" maxLength={6} style={pincodeValueError == true ? incorrect : {}} />
                        </div>

                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setEstYear(e.target.value)}} value={estYear} type="text" name="est-yr" placeholder="Establishment Year *" maxLength={4} />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2>POC</h2>
                    <div id="select" className={styles.selectPOC}>
                        <label htmlFor="selfPOC">
                            <input onChange={(e)=>{setCheckPOC(e.target.checked); handlePOC(e.target.checked)}} type="checkbox" className={styles.selfPOC} name="selfPOC" id="selfPOC" checked={checkPOC}/>
                            I am the POC
                        </label>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setPOC((prev)=>({...prev, ['name']: e.target.value}))}} type="text" placeholder="Full name *" value={POC.name} maxLength={36}/>
                        </div>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setPOC((prev)=>({...prev, ['designation']: e.target.value}))}} type="text" placeholder="User Designation *" value={POC.designation} maxLength={64}/>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setPOC((prev)=>({...prev, ['number']: e.target.value}))}} type="text" placeholder="Contact Number *" value={POC.number} maxLength={10}/>
                        </div>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setPOC((prev)=>({...prev, ['email']: e.target.value}))}} type="email" placeholder="Email Address *" value={POC.email} maxLength={128}/>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                            <select onChange={(e)=>{setPOC((prev)=>({...prev, ['access']: e.target.value}))}} name="acess" id="access" className={styles.item} value={POC.access==''? 'default': POC.access} maxLength={12}>
                                <option value="default" disabled hidden>Select User Access *</option>
                                <option value="super_admin">Super Admin</option>
                                <option value="admin">Admin</option> 
                                <option value="super_user">Super User</option>
                                <option value="user">User</option>
                            </select>
                        </div>
                    </div>

                    {(POC.self == 'false') &&(<div className={styles.row}>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setPOC((prev)=>({...prev, ['password']: e.target.value}))}} type="text" placeholder="Password *" value={POC.password}/>
                        </div>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setPOC((prev)=>({...prev, ['confPassword']: e.target.value}))}} type="text" placeholder="Confirm Password password *" value={POC.confPassword}/>
                        </div>
                    </div>)}
                </div>

                <div className={styles.footer}>
                    <button onClick={handleBackButton} className={styles.backLink}>Back</button>
                    <ArrowProceedBttn onClick={submit} />
                </div>
                <div className={styles.row}>
                    <div id="errorMessage" className="errorMessage">{formError}</div>
                </div>
            </div>
            {loading?<Spinner/>: ''}
            {submitted?<ConfirmAnnimation />:''}
            {/* <ConfirmAnnimation/> */}
        </div>

    )
}

export default Register;