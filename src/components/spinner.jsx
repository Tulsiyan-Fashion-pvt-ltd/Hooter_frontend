import styles from '../css/layout/spinner.module.css';

export function Spinner({style}){
    return (
        <div className={styles.spinnerContainer} style={style}>
            <div className={styles.spinner}></div>
        </div>
    )
}