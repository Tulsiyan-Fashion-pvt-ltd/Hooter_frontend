import { useEffect, useState } from "react";
import styles from "../css/components/ItemsSelector.module.css"
import clsx from "clsx";

const url = import.meta.env.VITE_BASEAPI;


export default function ItemsSelector({ onSubmit }) {
    // component for selecting the skus for inwarding

    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});  // adds the selected product with expected stock and uom form the list
    // console.log(selectedItems)
    useEffect(() => {
        async function getInventory() {
            try {
                const response = await fetch(`${url}/inventory`, { "credentials": "include" });

                const data = await response.json();
                // console.log(data)
                setItems(data);

            }
            catch (e) {
                console.log(e);
            }
        }

        getInventory();
    }, []);


    function handleCheckbox(uskuId){
        // setting the default values for the selected keys
        setSelectedItems((prev)=>{

            if (uskuId in prev){
                delete prev[uskuId];
                return {...prev};
            }else{
                return {...prev, [uskuId]: {"exp_stock": 1, "uom": "EA", "po": ""}};
            }
        }); 
    }


    function registerManualStock(uskuId, value){
        setSelectedItems((prev)=>{
            // extra protection if the uskuId doesn't exists
            if (uskuId in prev){
                return {...prev, [uskuId]: {...prev[uskuId], ["exp_stock"]: value < 1? 1: value}}
            }else{
                return {...prev}
            }
        })
    }

    function increaseStock(uskuId){
        setSelectedItems((prev)=>{
            // extra protection if the uskuId doesn't exists
            if (uskuId in prev){
                return {...prev, [uskuId]: {...prev[uskuId], ["exp_stock"]: prev[uskuId]["exp_stock"]+=1}}
            }else{
                return {...prev}
            }
        })
    }

    function decreaseStock(uskuId){
        setSelectedItems((prev)=>{
            // extra protection if the uskuId doesn't exists
            if (uskuId in prev){
                return {...prev, [uskuId]: {...prev[uskuId], ["exp_stock"]: prev[uskuId]["exp_stock"] > 1? prev[uskuId]["exp_stock"]-=1: 1}}
            }else{
                return {...prev}
            }
        })
    }

    function setUom(uskuId, value){
        setSelectedItems((prev)=>{
            // extra protection if the uskuId doesn't exists
            if (uskuId in prev){
                return {...prev, [uskuId]: {...prev[uskuId], ["uom"]: value}}
            }else{
                return {...prev}
            }
        })
    }

    function setPo(uskuId, value){
        setSelectedItems((prev)=>{
            // extra protection if the uskuId doesn't exists
            if (uskuId in prev){
                return {...prev, [uskuId]: {...prev[uskuId], ["po"]: value}}
            }else{
                return {...prev}
            }
        })
    }

    const units = {
        EA: "Each",
        PCS: "Pieces",
        PAC: "Pack",
        BOX: "Box",
        CTN: "Carton",
        CS: "Case",
        DZ: "Dozen",
        PAL: "Pallet",

        KG: "Kilograms",
        G: "Grams",
        LBS: "Pounds",
        OZ: "Ounces",
        TN: "Tons",

        L: "Liters",
        ML: "Milliliters",
        GAL: "Gallons",
        FLOZ: "Fluid Ounces",

        M: "Meters",
        CM: "Centimeters",
        FT: "Feet",
        M2: "Square Meters",
        SQM: "Alternative Square Meters"
    };

    return (
        <div className={styles.selectorContainer}>
            <div className={styles.itemsTable}>
                {

                    <table className={styles.tbInv}>
                        <thead className={styles.theadInv}>
                            <tr>
                                <th>Select</th>
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
                                items ? items.map(({ image_url, usku_id, sku_id, product_title, product_type, product_stock }) => {
                                    return (<tr key={usku_id}>
                                        <td>
                                            <div className={clsx(styles.checkBox, usku_id in selectedItems? styles.checked: null)} onClick={()=>handleCheckbox(usku_id)}>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ "display": "flex", "justifyContent": "center", "alignItems": "center" }}>
                                                <img src={`${image_url? `${url}${JSON.parse(image_url).webp_card}`: ""}`} alt="product image" height={"100px"} />
                                            </div>
                                        </td>
                                        <td>{sku_id}</td>
                                        <td>{product_title}</td>
                                        <td>{product_type}</td>
                                        <td>{product_stock}</td>
                                        <td>
                                            <div className={clsx(styles.expStockTd, usku_id in selectedItems? null: styles.disabledInput)}>
                                                <div className={styles.expStockInput}>
                                                    <input type="text" disabled={usku_id in selectedItems? false: true} value={selectedItems[usku_id]? selectedItems[usku_id]["exp_stock"]: ''} onChange={(e)=>registerManualStock(usku_id, e.target.value)}/>
                                                </div>
                                                <div className={styles.expStockButtonsContainer}>
                                                    <button className={`${styles.expStockInc} ${styles.expStockButton}`} disabled={usku_id in selectedItems? false: true} onClick={()=>{increaseStock(usku_id)}}>+</button>
                                                    <hr />
                                                    <button className={`${styles.expStockDec} ${styles.expStockButton}`} disabled={usku_id in selectedItems? false: true} onClick={()=>decreaseStock(usku_id)}>-</button>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <select name="uom" id="uom" className={styles.uomSelect} disabled={usku_id in selectedItems? false: true} onChange={(e)=>{setUom(usku_id, e.target.value)}}>
                                                {
                                                    Object.entries(units).map(([key, value]) => {
                                                        // console.log(key)
                                                        return (
                                                            <option value={key} key={key}>{value} -- {key}</option>
                                                        )
                                                    })
                                                }
                                            </select>
                                        </td>
                                        <td>
                                            <input type="text" onChange={(e)=>setPo(usku_id, e.target.value)} value={selectedItems[usku_id]? selectedItems[usku_id]["po"]: ''} 
                                            disabled={usku_id in selectedItems? false: true} className={selectedItems[usku_id]? null: styles.disabledInput} maxLength={64}/>
                                        </td>
                                    </tr>
                                    )
                                }) : null
                            }
                        </tbody>
                    </table>

                }
            </div>

            <button className={clsx(styles.confirmButton, Object.keys(selectedItems).length === 0? styles.disabledInput: null)} 
            onClick={() => onSubmit(selectedItems)} 
            disabled={Object.keys(selectedItems).length === 0? true: false}>Confirm Products</button>
        </div>
    )

}