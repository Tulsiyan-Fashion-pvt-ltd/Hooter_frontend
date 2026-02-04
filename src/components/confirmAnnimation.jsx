import styles from "../css/components/ConfirmAnnimation.module.css";
import clsx from "clsx";

export default function ConfirmAnnimation()
{
    return(
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={styles.confimationCircle}>
                    <div className={styles.checkContainer}>
                        <div className={clsx(styles.tickLeft, styles.check)}></div>
                        <div className={clsx(styles.tickRight, styles.check)}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}