import styles from '../css/layout/ArrowProceedBttn.module.css';
import clsx from 'clsx'

export function ArrowProceedBttn({className}){

    return(
        <button type="submit" className={clsx(styles.arrowBttn, className)}></button>
    )
}