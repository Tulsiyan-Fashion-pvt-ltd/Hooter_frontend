import { ArrowProceedBttn } from "../components/proceed-bttn";
import styles from "../css/pages/Register.module.css";
import { Link, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { validatePincode } from "../modules/validate";
import { Spinner } from "../components/spinner";

const route = import.meta.env.VITE_BASEAPI;

const Register = () => {
    const [niches, setNiches] = useState([]);
    const [pincode, setPincode] = useState();
    const [entityName, setEntityName] = useState('')
    const [brandName, setBrandName] = useState('')
    const [niche, setNiche] = useState('')
    const [gstin, setGstin] = useState('')
    const [plan, setPlan] = useState('')
    const [address, setAddress] = useState('')
    const [estYear, setEstYear] = useState('')
    const [formError, setFormError] = useState();
    const [loading, setLoading] = useState(false);

    let pincodeValueError = null;

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

    // creating effect that if the pincode value is invalid then set the pincode error flag to true and if nothing is thre set it to null
    if (pincode == null) {
        pincodeValueError = null;
    }
    else if (validatePincode(pincode)) {
        pincodeValueError = false;
    }
    else {
        pincodeValueError = true;
    }

    // styling for incorrect value
    const incorrect = { outline: '1px solid red' };
    // const correct = {outline: '1px solid green'};

    async function submit(){
        setLoading(true);
        if (pincode == '' || !validatePincode(pincode))
        {   
            return;
        }

        if (entityName==''|| brandName=='' || niche=='' || gstin=='' || plan=='' || address=='' || pincode=='' || estYear=='')
        {   
            setFormError('Invalid value in field');
            return;
        }

        const response = await fetch(`${route}/register`, {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({
                'entity-name': entityName, 
                'brand-name': brandName, 
                'niche': niche,
                'gstin': gstin,
                'plan': plan,
                'address': address,
                'estYear': estYear
            })
        })
        setLoading(false)
        console.log(response.status)
    }

    return (
        <div id="register-container" className={styles.registerContainer}>
            <div className={styles.container}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Business Details</h2>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setEntityName(e.target.value)}} type="text" name='legal-name' placeholder="Legal Name" maxLength={255} required />
                        </div>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setBrandName(e.target.value)}} type="text" name="brand-name" placeholder="Brand Name" maxLength={128} required />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <select onChange={(e)=>{setNiche(e.target.value)}} name="niche" id="niche" className={styles.item} placeholder='Brand Niche' defaultValue={'Brand Niche'} required>
                                <option value="Brand Niche" disabled hidden>Brand Niche</option>
                                {/* <option value="select" default disabled>SELECT</option> */}
                                {niches.map((niche, key) => {
                                    return (<option key={key} value={niche}>{niche.charAt(0).toUpperCase() + niche.slice(1)}</option>)
                                })}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setGstin(e.target.value)}} type="text" name="gstin" placeholder="GSTIN" maxLength={15} />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <select  onChange={(e)=>{setPlan(e.target.value)}} name="plan" id="select-plan" className={styles.item}>
                                <option value="lite">LITE</option>
                                <option value="pro">PRO</option>
                                <option value="ent">ENTERPRISE</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setAddress(e.target.value)}}
                                type="text"
                                name="address"
                                placeholder="Registered Address"
                                maxLength={500}
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setPincode(e.target.value)}} type="text" name="pincode" placeholder="Area Pincode" maxLength={6} style={pincodeValueError ? incorrect : {}} />
                        </div>

                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setEstYear(e.target.value)}} type="text" name="est-yr" placeholder="Establishment Year" maxLength={4} />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2>POC</h2>
                    <div id="select" className={styles.selectPOC}>
                        <label htmlFor="selfPOC">
                            <input onChange={(e)=>{setEntityName(e.target.value)}} type="checkbox" className={styles.selfPOC} name="selfPOC" id="selfPOC" />
                            I am the POC
                        </label>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setEntityName(e.target.value)}} type="text" placeholder="Full name" />
                        </div>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setEntityName(e.target.value)}} type="text" placeholder="User Designation" />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setEntityName(e.target.value)}} type="text" placeholder="Contact Number" />
                        </div>
                        <div className={styles.formGroup}>
                            <input onChange={(e)=>{setEntityName(e.target.value)}} type="email" placeholder="Email Address" />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                            <input onChange={(e)=>{setEntityName(e.target.value)}} type="text" placeholder="If POC For Future" />
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <Link to="#" className={styles.backLink}>Back</Link>
                    <ArrowProceedBttn onClick={submit} />
                </div>
                <div className={styles.row}>
                    <div id="errorMessage">{formError}</div>
                </div>
            </div>
            {loading?<Spinner/>: ''}
        </div>

    )
}

export default Register;