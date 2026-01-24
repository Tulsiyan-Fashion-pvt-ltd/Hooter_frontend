import styles from '../css/layout/spinner.module.css';

export function Spinner(){
    return (
        <div className={styles.spinnerConainer}>
            <div className={styles.spinner}></div>
        </div>
    )
}