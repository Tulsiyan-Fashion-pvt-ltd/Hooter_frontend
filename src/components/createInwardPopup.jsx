import { useState, Activity } from "react";
import styles from '../css/components/CreateInwardPopup.module.css'

import ItemsSelector from './inwardItemsSelector'
import InwardInfoCollector from './inwardInfoCollector'

export default function CreateInwardPopup({onclick}){
    const [inward, setInward] = useState({});
    const [showItemsSelector, setShowItemsSelector] = useState(true);
    const [getInwardInfo, setInwardInfo] = useState(false);
    console.log(inward)

    function confProduct(inward){
        setInward({"usku_ids": inward});
        setInwardInfo(true);
        setShowItemsSelector(false);
    }

    async function mergeInwardInfo(info){
        // console.log(info)
        await setInward((prev)=>({...prev, ...info}));
        await setInwardInfo(false);
        onclick();
    }

    function stepBack(){
        setInwardInfo(false);
        setShowItemsSelector(true);
    }
    return(
        <div className={styles.popupGlobalScreen} onClick={e => {onclick()}}>
            <div className={styles.popupBody} onClick={(e)=>{e.stopPropagation();}}>
                <div className={styles.displayBox}>
                {
                    // Object.keys(inward).length === 0? <ItemsSelector onSubmit={confProduct}/>: null
                    
                }
                <Activity mode={showItemsSelector === true? "visible": "hidden"}>
                    <ItemsSelector onSubmit={confProduct}/>
                </Activity>

                <Activity mode={getInwardInfo===true? "visible": "hidden"}>
                    <InwardInfoCollector onSubmit={mergeInwardInfo} back={stepBack}/>
                </Activity>
                
                </div>
            </div>
        </div>
    )
}