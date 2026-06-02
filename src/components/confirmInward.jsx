import { useState, useEffect } from "react";
import styles from "../css/components/ConfirmInward.module.css";

const url = import.meta.env.VITE_BASEAPI;

export default function ConfirmInward({ data , back}) {
    const [supplier, setSupplier] = useState({});
    const [warehouse, setWarehouse] = useState({});
    const [inwardStockTable, setInwardStockTable] = useState({});
    const [error, setError] = useState({});
    console.log(warehouse)

    useEffect(() => {
        async function getWarehouse() {
            const warehouse_id = parseInt(data.warehouse_id);

            if (!warehouse_id) {
                setError({ "warhouse": "warhouse is not selected" });
                return;
            }

            const response = await fetch(`${url}/inventory/warehouses?warehouse-id=${warehouse_id}`, {
                credentials: "include"
            });

            const json = await response.json();

            if (!response.ok) {
                console.log(`warehouse_id: ${warehouse_id}`)
                setError({ "warehouse": "Could not fetch the warehouse details" });
                return;
            }

            console.log(json)
            setWarehouse(json);
        }

        getWarehouse();
    }, [])

    useEffect(() => {
        async function getSupplier() {
            const supplier_id = data.supplier_id;

            if (!supplier_id) {
                setError({ "warhouse": "warhouse is not selected" });
                return;
            }

            const response = await fetch(`${url}/inventory/suppliers?supplier-id=${supplier_id}`, {
                credentials: "include"
            });

            const json = await response.json();

            if (!response.ok) {
                console.log(`supplier_id: ${supplier_id}`)
                setError({ "supplier": "Could not fetch the warehouse details" });
                return;
            }

            // console.log(json)
            setSupplier(json);
        }

        getSupplier();
    }, [])


    useEffect(() => {
        fetchProductDetails();
    }, []);

    async function fetchProductDetails() {
        Object.keys(data.usku_ids ?? []).map(async (uskuId) => {
            const response = await fetch(`${url}/inventory?usku-id=${uskuId}`, {
                credentials: "include"
            })

            const data = await response.json();

            if (!response.ok) {
                setError({ "usku_id": "Could not fetch selected item details" });
                return;
            }

            setInwardStockTable((prev) => ({ ...prev, [uskuId]: data[0] }));
        })
        // return data[0];
    }


    return (
        <div className={styles.mainContainer}>
            <h1 className={styles.heading}>Review Inward</h1>

            <div className={styles.block}>
                <h2 className={styles.sectionTag}>Shipment</h2>

                <div className={styles.sector}>
                    <div className={styles.section}>
                        <h3>Shipment Reference No. : </h3>
                        <p>{data.shipment ? data.shipment["shipment-ref"] : ""}</p>
                    </div>

                    <div className={styles.section}>
                        <h3>Vehicle No. : </h3>
                        <p>{data.shipment ? data.shipment["vehicle-no"] : ""}</p>
                    </div>

                    <div className={styles.section}>
                        <h3>Transporter : </h3>
                        <p>{data.shipment ? data.shipment["transporter"] : ""}</p>
                    </div>

                    <div className={styles.section}>
                        <h3>Challan No. : </h3>
                        <p>{data.shipment ? data.shipment["challan"] : ""}</p>
                    </div>

                    <div className={styles.section}>
                        <h3>Arrival Date : </h3>
                        <p>{data.shipment ? data.shipment["arrival-date"] : ""}</p>
                    </div>
                </div>
            </div>

            <div className={styles.block}>
                <h2 className={styles.sectionTag}>Supplier</h2>

                <div className={styles.sector}>
                    <div className={styles.section}>
                        <h3>Name : </h3>
                        <p>{supplier.name}</p>
                    </div>

                    <div className={styles.section}>
                        <h3>Contact Number : </h3>
                        <p>{supplier.number}</p>
                    </div>

                    <div className={styles.section}>
                        <h3>Email : </h3>
                        <p>{supplier.email}</p>
                    </div>

                    <div className={styles.section}>
                        <h3>Address : </h3>

                        <p>
                            {(supplier.address?.house ?? "") + ", " +
                                (supplier.address?.street ?? "") + ", " +
                                (supplier.address?.locality ?? "") + ", " +
                                (supplier.address?.city ?? "") + ", " +
                                (supplier.address?.state ?? "") + ", " +
                                (supplier.address?.pincode ?? "")}
                        </p>
                    </div>
                </div>
            </div>


            <div className={styles.block}>
                <h2 className={styles.sectionTag}>Warehouse</h2>

                <div className={styles.sector}>
                    <div className={styles.section}>
                        <h3>Name : </h3>
                        <p>{warehouse.name}</p>
                    </div>

                    <div className={styles.section}>
                        <h3>Contact Number : </h3>
                        <p>{warehouse.number}</p>
                    </div>

                    <div className={styles.section}>
                        <h3>Email : </h3>
                        <p>{warehouse.email}</p>
                    </div>

                    <div className={styles.section}>
                        <h3>Address : </h3>
                        <p>{warehouse.address&& `${warehouse.address.house}, ${warehouse.address. street},
                        ${warehouse.address.locality}, ${warehouse.address.city}, ${warehouse.address.state},
                        ${warehouse.address.pincode}`}</p>
                    </div>
                </div>
            </div>


            <table className={styles.tbInv}>
                <thead className={styles.theadInv}>
                    <tr>
                        <th>Image</th>
                        <th>SKU ID</th>
                        <th>Product Title</th>
                        <th>Product Type</th>
                        <th>Current Stock</th>
                        <th>Expected Stock</th>
                        <th>Unit of Measurement</th>
                        <th>PO Number</th>
                    </tr>
                </thead>

                <tbody className={styles.tbodyInv}>
                    {
                        data.usku_ids ? Object.keys(data.usku_ids).map((usku_id) => {
                            return (<tr key={usku_id}>
                                <td>
                                    <div style={{ "display": "flex", "justifyContent": "center", "alignItems": "center" }}>
                                        <img src={`${inwardStockTable[usku_id] ? `${url}${JSON.parse(inwardStockTable[usku_id].image_url).webp_card}` : null}`} alt="product image" height={"100px"} />
                                    </div>
                                </td>
                                <td>{inwardStockTable[usku_id] ? inwardStockTable[usku_id].sku_id : null}</td>
                                <td>{inwardStockTable[usku_id] ? inwardStockTable[usku_id].product_title : null}</td>
                                <td>{inwardStockTable[usku_id] ? inwardStockTable[usku_id].product_type : null}</td>
                                <td>{inwardStockTable[usku_id] ? inwardStockTable[usku_id].product_stock : null}</td>
                                <td>{data.usku_ids[usku_id].exp_stock}</td>
                                <td>{data.usku_ids[usku_id].uom}</td>
                                <td>{data.usku_ids[usku_id].po}</td>
                            </tr>
                            )
                        }) : null
                    }
                </tbody>
            </table>

            <div className={styles.buttons}>
                <button className={styles.backBttn} onClick={back}>Back</button>
                <button className={styles.confirmBttn}>Confirm</button>
            </div>
        </div>
    )
}