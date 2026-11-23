import { useState } from "react"
import styles from '../css/components/Switch.module.css';




export function Switch(){
    const [value, setValue] = useState(false);

    const switchBox = {
        backgroundColor: value == true? 'var(--accent-color-50)': 'var(--second-color-50)',
        justifyContent: value === true? 'start': 'end'
    }

    const nob = {
        animation: `${value === true? styles['slider-right']: styles['slider-left']} .3s ease-out forwards`
    }



    return (
        <div style={switchBox} value={value} className={styles.switch}>
            <div style={nob} onClick={() => setValue(prev => !prev)} className={styles.nob}></div>
        </div>
    )
}