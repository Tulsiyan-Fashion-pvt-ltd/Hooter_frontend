import { useState, Activity } from "react";
import styles from '../css/components/CreateInwardPopup.module.css'

import ItemsSelector from './inwardItemsSelector'
import InwardInfoCollector from './inwardInfoCollector'
import ConfirmInward from './confirmInward'

export default function CreateInwardPopup({close, complete}){
    const [inward, setInward] = useState({});

    const [showItemsSelector, setShowItemsSelector] = useState(true);
    const [showInwardInfo, setShowInwardInfo] = useState(false);
    const [showReview, setShowReview] = useState(false);
    console.log(inward)

    function confProduct(inward){
        setInward({"usku_ids": inward});
        setShowInwardInfo(true);
        setShowItemsSelector(false);
    }

    async function mergeInwardInfo(info){
        // console.log(info)
        await setInward((prev)=>({...prev, ...info})); // mergint he usku_ids and shipment, warehouse, shipment info
        await setShowInwardInfo(false);
        await setShowReview(true);
        // onclick();
    }

    function stepBack(){
        setShowInwardInfo(false);
        setShowItemsSelector(true);
    }

    function backFromReview(){
        setShowReview(false);
        setShowInwardInfo(true);
    }

    function completeInwardCreation(inwardId){
        // reload the tables
        complete(inwardId);
        close();
    }

    return(
        <div className={styles.popupGlobalScreen}>
            <div className={styles.popupBody}>
                <button className={styles.close} onClick={close}>X</button>
                <div className={styles.displayBox}>

                <Activity mode={showItemsSelector === true? "visible": "hidden"}>
                    <ItemsSelector onSubmit={confProduct}/>
                </Activity>

                <Activity mode={showInwardInfo===true? "visible": "hidden"}>
                    <InwardInfoCollector onSubmit={mergeInwardInfo} back={stepBack}/>
                </Activity>

                <Activity mode={showReview===true? "visible": "hidden"}>
                    <ConfirmInward payload={inward} back={backFromReview} complete={completeInwardCreation}/>
                </Activity>
                
                </div>
            </div>
        </div>
    )
}