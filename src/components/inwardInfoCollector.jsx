import { useState, useEffect} from "react";
import styles from "../css/components/InwardInfoCollector.module.css"

const url = import.meta.env.VITE_BASEAPI;

export default function InwardInfoCollector({onSubmit, back}) {
    // getting the shipment, supplier and warehouse details
    const [inwardInfo, setInwardInfo] = useState({});
    const [suppliers, setSuppliers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const [addSupplier, setAddSupplier] = useState(false);
    const [addWarehouse, setAddWarehouse] = useState(false);
    // console.log(inwardInfo)

    async function getSupplier() {
        try {
            const response = await fetch(`${url}/inventory/suppliers`, { credentials: "include" });
            const data = await response.json();

            if (response.ok) {
                setSuppliers(data);
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    async function getWarehouse() {
        try {
            const response = await fetch(`${url}/inventory/warehouses`, { credentials: "include" });
            const data = await response.json();
            // console.log(data)
            if (response.ok) {
                setWarehouses(data);
            }
        }
        catch (e) {
            console.log(e);
        }
    }


    useEffect(()=>{
        getSupplier();
    }, [])


    useEffect(()=>{
        getWarehouse();
    }, [])

    function addShipment(key, value){
        setInwardInfo((prev)=>({...prev, ["shipment"]: {...prev["shipment"], [key]: value}}));
    }


    async function handleShipmentSubmit(supplier_id){
        await getSupplier();
        setAddSupplier(false);
        setInwardInfo((prev)=>({...prev, ["supplier_id"]: supplier_id}));
    }


    async function handleWarehouseSubmit(warehouse_id){
        await getWarehouse();
        setAddWarehouse(false);
        setInwardInfo((prev)=>({...prev, ["warehouse_id"]: warehouse_id}));
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                <div className={styles.seciton}>
                    <h2 className={styles.heading}>Shipment</h2>

                    <div className={styles.shipmentInputCont}>
                        <div className={styles.shipmentInput}>
                            <h3>Shipment Reference No.</h3>
                            <input type="text" maxLength={64}
                            value={inwardInfo.shipment? inwardInfo.shipment["shipment-ref"]?? "": ""}
                            onChange={(e)=>{addShipment("shipment-ref", e.target.value)}}/>
                        </div>

                        <div className={styles.shipmentInput}>
                            <h3>Vehicle No.</h3>
                            <input type="text" maxLength={12}
                            value={inwardInfo.shipment? inwardInfo.shipment["vehicle-no"]?? "": ""}
                            onChange={(e)=>{addShipment("vehicle-no", e.target.value)}}/>
                        </div>
                        <div className={styles.shipmentInput}>
                            <h3>Transporter</h3>
                            <input type="text" maxLength={128}
                            value={inwardInfo.shipment? inwardInfo.shipment["transporter"]?? "": ""}
                            onChange={(e)=>{addShipment("transporter", e.target.value)}}/>
                        </div>
                        <div className={styles.shipmentInput}>
                            <h3>Challan No.</h3>
                            <input type="text" maxLength={64}
                            value={inwardInfo.shipment? inwardInfo.shipment["challan"]?? "": ""}
                            onChange={(e)=>{addShipment("challan", e.target.value)}}/>
                        </div>
                        <div className={styles.shipmentInput}>
                            <h3>Arrival Date</h3>
                            <input type="date"
                            value={inwardInfo.shipment? inwardInfo.shipment["arrival-date"]?? "": ""}
                            onChange={(e)=>{addShipment("arrival-date", e.target.value)}}/>
                        </div>
                    </div>
                </div>

                <div className={styles.seciton}>
                    <h2>Supplier</h2>

                    <div className={styles.selectContainer}>
                        <div className={styles.supplierCon}>
                            <select name="supplier-id" id="supplier-id" 
                            className={styles.select} 
                            onChange={(e)=>{setInwardInfo((prev)=>({...prev,["supplier_id"]: e.target.value}))}}
                            value={inwardInfo["supplier_id"]?? "default"}
                            >
                                <option value="default" disabled>Select Supplier</option>
                                {
                                    suppliers.map(({address, email, name, number, supplier_id})=>{
                                        return(<option value={supplier_id} key={supplier_id} title={
                                            `email: ${email}\nnumber":" ${number}\naddress: ${Object.keys(address).map((item)=>{
                                                return `\n${item}: ${address[item]}`
                                            })}`
                                            }>
                                            {name}
                                        </option>)
                                    })
                                }
                            </select>
                        </div>

                        <button className={styles.addMore} onClick={()=>setAddSupplier(true)}>+</button>
                        {addSupplier === true? <AddSupplier onSubmit={handleShipmentSubmit} onClose={()=>setAddSupplier(false)}/>: null}
                    </div>
                </div>

                <div className={styles.seciton}>
                    <h2>Warehouse</h2>

                    <div className={styles.selectContainer}>
                        <div className={styles.warehouse}>
                            <select name="warehouse-id" id="warehouse-id" 
                            className={styles.select} 
                            onChange={(e)=>setInwardInfo((prev)=>({...prev, ["warehouse_id"]: e.target.value}))}
                            value={inwardInfo["warehouse_id"]?? "default"}
                            >
                                <option value="default" disabled>Select Warehouse</option>
                                {
                                    warehouses.map(({address, email, name, number, warehouse_id})=>{
                                        return(<option value={warehouse_id} key={warehouse_id} title={
                                            `email: ${email}\nnumber: ${number}\naddress: ${Object.keys(address).map((item)=>{
                                                return `\n${item}: ${address[item]}`
                                            })}`
                                            }>
                                            {name}
                                        </option>)
                                    })
                                }
                            </select>
                        </div>

                        <button className={styles.addMore} onClick={()=>setAddWarehouse(true)}>+</button>
                        {addWarehouse===true? <AddWarehouse onSubmit={handleWarehouseSubmit} onClose={()=>setAddWarehouse(false)}/>: null}
                    </div>
                </div>
            </div>

            <div className={styles.buttons}>
                <button className={styles.back} onClick={back}>Back</button>
                <button className={styles.submit} onClick={()=>onSubmit(inwardInfo)}>Upload Inward</button>
            </div>
        </div>
    )
} 


function AddSupplier({onSubmit, onClose}) {
    const [supplier, setSupplier] = useState({});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    // console.log(loading)
    const validate = () => {
        let newErrors = {};

        if (!supplier.name?.trim()) {
            newErrors.name = true;
        } else if (!/^[a-zA-Z\s]+$/.test(supplier.name)) {
            newErrors.name = true;
        }

        if (!supplier.number?.trim() || !/^\d{10}$/.test(supplier.number)) {
            newErrors.number = true;
        }

        if (
            !supplier.email?.trim() ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplier.email)
        ) {
            newErrors.email = true;
        }

        if (!supplier.locality?.trim()) {
            newErrors.locality = true;
        }

        if (!supplier.city?.trim()) {
            newErrors.city = true;
        }

        if (!supplier.state?.trim()) {
            newErrors.state = true;
        }

        if (!/^\d{6}$/.test(supplier.pincode ?? "")) {
            newErrors.pincode = true;
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };


    const submitSupplier = async () => {

        if (!validate()) return;
        setLoading(true);
        try {

            const response = await fetch(`${url}/inventory/supplier`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(supplier)
            });

            const data = await response.json();

            if (!response.ok){
                throw new Error({"msg": `${data.msg?? "Could not add the supplier"}`})
            }

            onSubmit(data["supplier_id"]); // sending the supplier id to the parent handle function
            console.log(data);

        } catch (err) {
            console.log(err);
        } finally{
            setLoading(false);
        }
    };


    return (
        <div className={styles.globalFormScreen}>
            <div className={styles.addEntityContainer}>
                <button className={styles.closeWindow} onClick={onClose}>X</button>
                <div className={styles.form}>
                    <h1 className={styles.heading} style={{ "textAlign": "center" }}>Add Supplier</h1>

                    <div className={styles.inputForm}>
                        <div className={styles.inputSection}>
                            <h3>Name</h3>
                            <input style={{border: errors.name ? "2px solid red" : ""}} type="text" autoFocus autoCapitalize maxLength={36}
                                value={supplier["name"] ?? ""} onChange={(e) => setSupplier((prev) => ({ ...prev, ["name"]: e.target.value }))} />
                        </div>

                        <div className={styles.inputSection}>
                            <h3>Contanct Number</h3>
                            <input style={{border: errors.number ? "2px solid red" : ""}} type="text" autoCapitalize maxLength={14}
                                value={supplier["number"] ?? ""} onChange={(e) => setSupplier((prev) => ({ ...prev, ["number"]: e.target.value }))} />
                        </div>

                        <div className={styles.inputSection}>
                            <h3>Supplier Email</h3>
                            <input style={{border: errors.email ? "2px solid red" : ""}} type="text" autoCapitalize maxLength={36}
                                value={supplier["email"] ?? ""} onChange={(e) => setSupplier((prev) => ({ ...prev, ["email"]: e.target.value }))} />
                        </div>

                        <div className={styles.inputSection}>
                            <h3>House No.</h3>
                            <input style={{border: errors.house ? "2px solid red" : ""}} type="text" autoCapitalize maxLength={36}
                                value={supplier["house"] ?? ""} onChange={(e) => setSupplier((prev) => ({ ...prev, ["house"]: e.target.value }))} />
                        </div>

                        <div className={styles.inputSection}>
                            <h3>Street</h3>
                            <input style={{border: errors.street ? "2px solid red" : ""}} type="text" autoCapitalize maxLength={36}
                                value={supplier["street"] ?? ""} onChange={(e) => setSupplier((prev) => ({ ...prev, ["street"]: e.target.value }))} />
                        </div>

                        <div className={styles.inputSection}>
                            <h3>Locality</h3>
                            <input style={{border: errors.locality ? "2px solid red" : ""}} type="text" autoCapitalize maxLength={36}
                                value={supplier["locality"] ?? ""} onChange={(e) => setSupplier((prev) => ({ ...prev, ["locality"]: e.target.value }))} />
                        </div>

                        <div className={styles.inputSection}>
                            <h3>City</h3>
                            <input style={{border: errors.city ? "2px solid red" : ""}} type="text" autoCapitalize maxLength={36}
                                value={supplier["city"] ?? ""} onChange={(e) => setSupplier((prev) => ({ ...prev, ["city"]: e.target.value }))} />
                        </div>

                        <div className={styles.inputSection}>
                            <h3>State</h3>
                            <input style={{border: errors.state ? "2px solid red" : ""}} type="text" autoCapitalize maxLength={36}
                                value={supplier["state"] ?? ""} onChange={(e) => setSupplier((prev) => ({ ...prev, ["state"]: e.target.value }))} />
                        </div>

                        <div className={styles.inputSection}>
                            <h3>Pincode</h3>
                            <input style={{border: errors.pincode ? "2px solid red" : ""}} type="text" autoCapitalize maxLength={6}
                                value={supplier["pincode"] ?? ""} onChange={(e) => {
                                    const input = e.target.value;

                                    const re = /^\d*$/;
                                    if (!re.test(input)) {
                                        return null;
                                    } else {
                                        setSupplier((prev) => ({ ...prev, ["pincode"]: e.target.value }));
                                    }
                                }} />
                        </div>
                    </div>

                    <div style={{ "width": "100%", "display": "flex" }} >
                        <button className={styles.submit} style={{"opacity": loading? "50%": "100%"}} 
                        onClick={submitSupplier} disabled={loading}>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    )
}


function AddWarehouse({onSubmit, onClose}) {
    const [warehouse, setwarehouse] = useState({});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    // console.log(loading)
    const validate = () => {
        let newErrors = {};

        if (!warehouse.name?.trim()) {
            newErrors.name = true;
        } else if (!/^[a-zA-Z\s]+$/.test(warehouse.name)) {
            newErrors.name = true;
        }

        if (!warehouse.number?.trim() || !/^\d{10}$/.test(warehouse.number)) {
            newErrors.number = true;
        }

        if (
            !warehouse.email?.trim() ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(warehouse.email)
        ) {
            newErrors.email = true;
        }

        if (!warehouse.locality?.trim()) {
            newErrors.locality = true;
        }

        if (!warehouse.city?.trim()) {
            newErrors.city = true;
        }

        if (!warehouse.state?.trim()) {
            newErrors.state = true;
        }

        if (!/^\d{6}$/.test(warehouse.pincode ?? "")) {
            newErrors.pincode = true;
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };


    const submitwarehouse = async () => {

        if (!validate()) return;
        setLoading(true);
        try {

            const response = await fetch(`${url}/inventory/warehouse`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(warehouse)
            });

            const data = await response.json();

            if (!response.ok){
                throw new Error({"msg": `${data.msg?? "Could not add the warehouse"}`})
            }

            onSubmit(data["warehouse_id"]); // sending the warehouse id to the parent handle function
            console.log(data);

        } catch (err) {
            console.log(err);
        } finally{
            setLoading(false);
        }
    };


    return (
        <div className={styles.globalFormScreen}>
            <div className={styles.addEntityContainer}>
                <button className={styles.closeWindow} onClick={onClose}>X</button>
                <div className={styles.form}>
                    <h1 className={styles.heading} style={{ "textAlign": "center" }}>Add warehouse</h1>

                    <div className={styles.inputForm}>
                        <div className={styles.inputSection}>
                            <h3>Name</h3>
                            <input style={{border: errors.name ? "2px solid red" : ""}} type="text" autoFocus autoCapitalize maxLength={36}
                                value={warehouse["name"] ?? ""} onChange={(e) => setwarehouse((prev) => ({ ...prev, ["name"]: e.target.value }))} />
                        </div>

                        <div className={styles.inputSection}>
                            <h3>Contanct Number</h3>
                            <input style={{border: errors.number ? "2px solid red" : ""}} type="text" autoCapitalize maxLength={14}
                                value={warehouse["number"] ?? ""} onChange={(e) => setwarehouse((prev) => ({ ...prev, ["number"]: e.target.value }))} />
                        </div>

                        <div className={styles.inputSection}>
                            <h3>warehouse Email</h3>
                            <input style={{border: errors.email ? "2px solid red" : ""}} type="text" autoCapitalize maxLength={36}
                                value={warehouse["email"] ?? ""} onChange={(e) => setwarehouse((prev) => ({ ...prev, ["email"]: e.target.value }))} />
                        </div>

                        <div className={styles.inputSection}>
                            <h3>House No.</h3>
                            <input style={{border: errors.house ? "2px solid red" : ""}} type="text" autoCapitalize maxLength={36}
                                value={warehouse["house"] ?? ""} onChange={(e) => setwarehouse((prev) => ({ ...prev, ["house"]: e.target.value }))} />
                        </div>

                        <div className={styles.inputSection}>
                            <h3>Street</h3>
                            <input style={{border: errors.street ? "2px solid red" : ""}} type="text" autoCapitalize maxLength={36}
                                value={warehouse["street"] ?? ""} onChange={(e) => setwarehouse((prev) => ({ ...prev, ["street"]: e.target.value }))} />
                        </div>

                        <div className={styles.inputSection}>
                            <h3>Locality</h3>
                            <input style={{border: errors.locality ? "2px solid red" : ""}} type="text" autoCapitalize maxLength={36}
                                value={warehouse["locality"] ?? ""} onChange={(e) => setwarehouse((prev) => ({ ...prev, ["locality"]: e.target.value }))} />
                        </div>

                        <div className={styles.inputSection}>
                            <h3>City</h3>
                            <input style={{border: errors.city ? "2px solid red" : ""}} type="text" autoCapitalize maxLength={36}
                                value={warehouse["city"] ?? ""} onChange={(e) => setwarehouse((prev) => ({ ...prev, ["city"]: e.target.value }))} />
                        </div>

                        <div className={styles.inputSection}>
                            <h3>State</h3>
                            <input style={{border: errors.state ? "2px solid red" : ""}} type="text" autoCapitalize maxLength={36}
                                value={warehouse["state"] ?? ""} onChange={(e) => setwarehouse((prev) => ({ ...prev, ["state"]: e.target.value }))} />
                        </div>

                        <div className={styles.inputSection}>
                            <h3>Pincode</h3>
                            <input style={{border: errors.pincode ? "2px solid red" : ""}} type="text" autoCapitalize maxLength={6}
                                value={warehouse["pincode"] ?? ""} onChange={(e) => {
                                    const input = e.target.value;

                                    const re = /^\d*$/;
                                    if (!re.test(input)) {
                                        return null;
                                    } else {
                                        setwarehouse((prev) => ({ ...prev, ["pincode"]: e.target.value }));
                                    }
                                }} />
                        </div>
                    </div>

                    <div style={{ "width": "100%", "display": "flex" }} >
                        <button className={styles.submit} style={{"opacity": loading? "50%": "100%"}} 
                        onClick={submitwarehouse} disabled={loading}>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    )
}