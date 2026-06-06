import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styles from '../css/pages/InwardEntry.module.css';
const url = import.meta.env.VITE_BASEAPI;


export default function InwardEntry(){
    const [searchParams, setSearchParams] = useSearchParams();
    const [error, setError] = useState({});
    const [creationDate, setCreationDate] = useState();
    const dateObj = new Date(creationDate);
    const date = dateObj.toDateString();
    const inward_id = searchParams.get("id");
    const [table, setTable] = useState([]);

    // inward entry state
    const [entry, setEntry] = useState({
        accepted: 0,
        rejected: 0,
        total: 0
    })
    console.log(entry)

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

                setCreationDate(data["created_at"]["created_at"]);
                setTable(data.uskus);
            } catch(e){
                console.log(e);
                setError({"request": "Error encountered while fetching the inward details"})
            }                
        }

        getInwardDetails();
    }, []);


    function incAcceptedStock(){
        setEntry((prev)=>({...prev, ["accepted"]: prev.accepted+=1,
            ["total"]: prev.total+=1
        }));
    }

    function decAcceptedStock() {
        setEntry((prev) => {
            const shouldDecrement = prev.accepted > 0;

            return {
                ...prev,
                accepted: shouldDecrement ? prev.accepted - 1 : prev.accepted,
                total: shouldDecrement ? prev.total - 1 : prev.total,
            };
        });
    }


    function incRejectedStock(){
        setEntry((prev)=>({...prev, ["rejected"]: prev.rejected+=1,
            ["total"]: prev.total+=1
        }));
    }

    function decRejectedStock() {
        setEntry((prev) => {
            const newRejected = prev.rejected > 0 ? prev.rejected - 1 : prev.rejected;
            const newTotal = prev.rejected > 0 ? prev.total - 1 : prev.total;

            return {
                ...prev,
                rejected: newRejected,
                total: newTotal
            };
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
                            <h2>Inward ID:</h2>
                            <p className={styles.inwardId}>{inward_id}</p>
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
                                    <th>Total Recieved Stock</th>
                                </tr>
                            </thead>

                            <tbody>
                                {   table && 
                                    table.map(({sku_id, image_url, product_title, product_type,  uom, expected_qtt})=>{
                                        image_url = image_url && JSON.parse(image_url).webp_card;
                                        return(
                                            <tr key={sku_id}>
                                                <td><img src={`${url}${image_url}`} alt="product image" /></td>
                                                <td>{sku_id}</td>
                                                <td>{product_title}</td>
                                                <td>{product_type}</td>
                                                <td>{uom}</td>
                                                <td>{expected_qtt}</td>
                                                <td>
                                                    <div className={styles.inputContainer}>
                                                        <div className={styles.display}>{entry.accepted}</div>

                                                        <div className={styles.buttonsCotnainer}>
                                                            <button className={styles.increase} onClick={incAcceptedStock}>+</button>
                                                            <hr />
                                                            <button className={styles.decrease} onClick={decAcceptedStock}>-</button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.inputContainer}>
                                                        <div className={styles.display}>{entry.rejected}</div>

                                                        <div className={styles.buttonsCotnainer}>
                                                            <button className={styles.increase} onClick={incRejectedStock}>+</button>
                                                            <hr />
                                                            <button className={styles.decrease} onClick={decRejectedStock}>-</button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{entry.total?? 0}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.buttons}>
                        <button className={styles.draftBttn}>Draft</button>
                        <button className={styles.submitBttn}>Submit</button>
                    </div>
                </main>
            </div>
        </div>
    )
}