import styles from '../css/layout/ArrowProceedBttn.module.css';
import clsx from 'clsx'

export function ArrowProceedBttn({className, onClick}){

    return(
        <button type="submit" className={clsx(styles.arrowBttn, className)} onClick={onClick}></button>
    )
}