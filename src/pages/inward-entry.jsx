import { useState, useEffect } from "react";
import { useSearchParams, Navigate, useNavigate } from "react-router-dom";
import styles from '../css/pages/InwardEntry.module.css';
import clsx from "clsx";
import {Spinner} from '../components/spinner';
const url = import.meta.env.VITE_BASEAPI;


export default function InwardEntry(){
    const [searchParams, setSearchParams] = useSearchParams();
    const [error, setError] = useState({});
    const [success, setSuccess] = useState({});
    const [creationDate, setCreationDate] = useState();
    const [table, setTable] = useState([]);
    const [inwardStatus, setInwardStatus] = useState();
    const [showConfWarning, setShowConfWarning] = useState(false);
    const [showSelectUploadType, setShowSelectUploadType] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);
    const [entry, setEntry] = useState({})

    const dateObj = new Date(creationDate);
    const date = dateObj.toDateString();
    const inward_id = searchParams.get("id");
    const navigate = useNavigate();

    let payload = {
        "usku_ids": {}
    };
    let draft = {}

    // console.log(inwardStatus)
    // inward entry state
    

    useEffect(()=>{
        async function getInwardDetails(){
            try{
                const response = await fetch(`${url}/inventory/inward?id=${inward_id}`,{
                    credentials: "include"
                });

                const data = await response.json();

                if (!response.ok){
                    setError({"reqeust": "Could not fetch the inward details from the server"})
                }
                
                setCreationDate(data["created_at"]);
                setInwardStatus(data["status"]);
                setTable(data.uskus);
            } catch(e){
                console.log(e);
                setError({"request": "Error encountered while fetching the inward details"})
            }                
        }

        getInwardDetails();
    }, []);

    useEffect(()=>{
        function checkDraftInwardEntry(){
            const draftEntry = JSON.parse(window.localStorage.getItem("inwardEntry"));
            const draft = draftEntry && draftEntry[`${inward_id}`]&& draftEntry[`${inward_id}`]["uskus"];
            // console.log(draft)

            if (!draft){
               return; 
            }

            table.map(({usku_id, expected_qtt})=>{
                setEntry((prev)=>({...prev, [usku_id]: {"accepted": draft[usku_id].received - draft[usku_id].rejected, "rejected": draft[usku_id].rejected}}))
            })
        }

        checkDraftInwardEntry();

    }, [table])


    async function sendInwardEntry(type){
        try{
            setShowSpinner(true);
            const response = await fetch(`${url}/inventory/inward?id=${inward_id}&type=${type}`,{
                method: 'PUT',
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            })

            const data = await response.json();

            if (!response.ok){
                setError({"uploadError": "Could not upload the inward entry"});
                return;
            }
            
            // removing the draft if any from the draft object in localstorage
            setSuccess({"uploadEntry": "Successfully uploaded the Inward"}); 
            setShowSelectUploadType(false);
            
            const storage = JSON.parse(localStorage.getItem("inwardEntry")) || {};
            delete storage[inward_id];
            localStorage.setItem("inwardEntry", JSON.stringify(storage));
            
            window.alert("successfully uploaded")
            navigate("../inventory/inward")
            return;
        } catch(e) {
            console.error(e);
            setError({"uploadEntry": "Error occured while sending the paylaod to the server"});
            setShowSpinner(false);
        }
    }


    function saveDraftInward(uskuId){
        const date = new Date()
        date.getDate()
        // console.log(payload)

        const storage = JSON.parse(localStorage.getItem("inwardEntry")) || {};

        storage[inward_id] = {
            "created_at": Date.now(), 
            "inward_status": inwardStatus,
            uskus: payload.usku_ids
        }

        localStorage.setItem("inwardEntry", JSON.stringify(storage))

        window.alert("Draft saved");
    }


    function incAcceptedStock(uskuId){
        setEntry((prev)=>({...prev, [uskuId]: prev[uskuId] ? {...prev[uskuId], ["accepted"]: prev[uskuId].accepted+=1}
        : {"accepted": 1, "rejected": 0}
        }));
    }

    function decAcceptedStock(uskuId) {
        setEntry((prev) => {
            const shouldDecrement = prev[uskuId]? prev[uskuId].accepted > 0: false;

            return {
                ...prev,
                [uskuId]: prev[uskuId]? 
                shouldDecrement ? {...prev[uskuId], ["accepted"]: prev[uskuId].accepted - 1}: {...prev[uskuId]}
                : {"accepted": 0, "rejected": 0}
            };
        });
    }


    function incRejectedStock(uskuId){
        setEntry((prev)=>(
            {...prev, [uskuId]: prev[uskuId]? 
                {...prev[uskuId], ["rejected"]: prev[uskuId].rejected += 1}: {"accepted": 0, "rejected": 1}
            }
        ));
    }

    function decRejectedStock(uskuId) {
        setEntry((prev) => {
                const shouldDecrement = prev[uskuId]? prev[uskuId].rejected > 0: false;

                return {
                    ...prev,
                    [uskuId]: prev[uskuId]? 
                        shouldDecrement ? {...prev[uskuId], ["rejected"]: prev[uskuId].rejected -=1 }: {...prev[uskuId]}
                        : {"accepted": 0, "rejected": 0}
                }
        });
    }

    return(
        <div className={styles.globalInwardEntryContainer}>
            <div className={styles.InwardEntrySection}>
                <header className={styles.header}>
                    <h1>Enter Inward</h1>
                    <p className={styles.pageDesc}>Enter the inward stock details</p>
                    <div className={styles.inwardDetails}>
                        <div className={styles.inwardInfoLeftSection}>
                            <h2>Inward ID: <span style={{fontSize:"20px", fontWeight: "normal"}}>{inward_id}</span></h2>
                            {/* <p className={styles.inwardId}>{inward_id}</p> */}
                        </div>

                        <div className={styles.inwardInfoRightSection}>
                            <h2>Creation Date: </h2>
                            <p className={styles.date}>{date}</p>
                        </div>
                    </div>
                </header>

                <main className={styles.main}>
                    <div className={styles.tableContainer}>
                        <table className={styles.inwardStocksTable}>
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>SKU ID</th>
                                    <th>Product Title</th>
                                    <th>Product Type</th>
                                    <th>Unit of Measurement</th>
                                    <th>Expected Stock</th>
                                    <th>Accepted Stock</th>
                                    <th>Rejected Stock</th>
                                    <th>Total Received Stock</th>
                                    <th>Shortage</th>
                                    <th>Overage</th>
                                </tr>
                            </thead>

                            <tbody>
                                {   table && 
                                    table.map(({usku_id, sku_id, image_url, product_title, product_type,  uom, expected_qtt})=>{
                                        // draft inward entry
                                        // const draftEntry = JSON.parse(localStorage.getItem("inwardEntry"));
                                        // const draft = draftEntry[inward_id];

                                        // const draftAccepted = draft && draft.uskus[usku_id].received - draft.uskus[usku_id].rejected;
                                        // const draftRejected = draft && draft.uskus[usku_id].rejected;
                                        // const draftTotal = draft && draft.uskus[usku_id].received;
                                        // const draftShortage = draft && expected_qtt > draft.uskus[usku_id].received? expected_qtt - draft.uskus[usku_id].received: null;
                                        // const draftOverage = draft && draft.uskus[usku_id].received > expected_qtt? draft.uskus[usku_id].received - expected_qtt: null;

                                        image_url = image_url && JSON.parse(image_url).webp_card;

                                        const total = entry[usku_id] ? entry[usku_id].accepted + entry[usku_id].rejected : 0;
                                        const shortage = entry[usku_id] ? total < parseInt(expected_qtt)? parseInt(expected_qtt) - total : 0 : 0;
                                        const overage = entry[usku_id] ? total > parseInt(expected_qtt)? total - parseInt(expected_qtt) : 0 : 0;
                                        // populating payload
                                        payload.usku_ids[usku_id] = {"received": total, "rejected": entry[usku_id]? entry[usku_id].rejected: null}
                                        
                                        
                                        return(
                                            <tr key={sku_id}>
                                                <td><img src={`${url}${image_url}`} alt="product image" height={"105px"}/></td>
                                                <td>{sku_id}</td>
                                                <td>{product_title}</td>
                                                <td>{product_type}</td>
                                                <td>{uom}</td>
                                                <td>{expected_qtt}</td>
                                                <td>
                                                    <div className={styles.inputContainer}>
                                                        <div className={styles.display}>{entry[usku_id] ? entry[usku_id].accepted: 0}
                                                        </div>

                                                        <div className={styles.buttonsCotnainer}>
                                                            <button className={styles.increase} onClick={()=>{incAcceptedStock(usku_id)}}>+</button>
                                                            <hr style={{width: "100%", color: "white"}}/>
                                                            <button className={styles.decrease} onClick={()=>{decAcceptedStock(usku_id)}}>-</button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.inputContainer}>
                                                        <div className={styles.display}>{entry[usku_id]? entry[usku_id].rejected: 0}</div>

                                                        <div className={styles.buttonsCotnainer}>
                                                            <button className={styles.increase} onClick={()=>{incRejectedStock(usku_id)}}>+</button>
                                                            <hr style={{width: "100%", color: "white"}}/>
                                                            <button className={styles.decrease} onClick={()=>{decRejectedStock(usku_id)}}>-</button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{total}</td>
                                                <td>{shortage}</td>
                                                <td>{overage}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.buttons}>
                        <button className={clsx(styles.draftBttn, Object.keys(entry).length===0 && styles.disabledButton)}
                        disabled={Object.keys(entry).length===0} onClick={saveDraftInward}
                        >Draft</button>

                        <button className={clsx(styles.submitBttn, Object.keys(entry).length===0 && styles.disabledButton)}
                        disabled={Object.keys(entry).length===0} onClick={()=>{setShowConfWarning(true)}}
                        >Submit</button>
                    </div>
                </main>
            </div>

            {showConfWarning && <ConfirmInwardEntry onBack={() => { setShowConfWarning(false) }} onConfirm={() => { setShowConfWarning(false); setShowSelectUploadType(true) }} />}
            {showSelectUploadType && <UploadTypeSelector request={sendInwardEntry} />}
            {showSpinner && <Spinner></Spinner>}
        </div>
    )
}


function ConfirmInwardEntry({onBack, onConfirm}){
    return(
        <div className={styles.globalConfirmationScreen}>
            <div className={styles.confirmationBox}>
                <h1 className={styles.confBoxHeading}>⚠️ Confirm Inward</h1>
                <hr />

                <div className={styles.confirmationDesc}>
                    <p>Inward cannot be altered after the creation of the GRN.</p>
                    <p>Please check inward entry carefully before confirmation.</p>
                </div>

                <div className={styles.confBttns}>
                    <button className={styles.back} onClick={onBack}>Back</button>
                    <button className={styles.confirm} onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    )
}


function UploadTypeSelector({request}){
    return(
        <div className={styles.globalConfirmationScreen}>
            <div className={styles.confirmationBox}>
                <h1 className={styles.confBoxHeading}>Select upload type</h1>
                <hr />

                <div className={styles.confirmationDesc}>
                    <p>Finish entry will generate the final GRN. Once generated, no further GRNs can be created.</p>
                    <br />
                    <p>Partial option if the same inward is received in multiple shipments and you want to process the received quantity now and the remaining quantity later.</p>
                </div>

                <div className={styles.confBttns}>
                    <button className={styles.partial} onClick={()=>{request("partial")}}>Partial Upload</button>
                    <button className={styles.finish} onClick={()=>{request("completed")}}>Finish Upload</button>
                </div>
            </div>
        </div>
    )
}