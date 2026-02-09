import styles from '../css/pages/Orders.module.css';

export default function Orders() {
    return (
        <div className={styles.globalOrdersContainer}>
            <section className={styles.box}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.pageTitle}>Orders</h1>
                    <p className={styles.pageSubtitle}>
                        Welcome back, Sarah! Here's a snapshot of your platform's performance.
                    </p>
                </div>

                <button className={styles.primaryBtn}>Download Report</button>
            </section>

            <section className={styles.actionContainer}>
                <div className={styles.left}>
                    <img src="icon.svg" alt="icon" />
                    <p>
                        Welcome back, Sarah! Here's a snapshot of your platform's performance.
                    </p>
                </div>

                <div className={styles.right}>
                    <button className={styles.primary}>Buy barcoded packets</button>
                    <button className={styles.secondary}>Scan Barcoded Packets</button>
                </div>
            </section>

            <section className={styles.card}>
                <div className={styles.tabs}>
                    <button className={styles.tab}>On Hold</button>
                    <button className={`${styles.tab} ${styles.active}`}>Pending</button>
                    <button className={styles.tab}>Ready To Ship</button>
                    <button className={styles.tab}>Shipped</button>
                    <button className={styles.tab}>Cancelled</button>
                </div>

                {/* Filters */}
                <div className={styles.filters}>
                    <h4 className={styles.h4}>Filter by</h4>

                    <select className={styles.select}>
                        <option>SLA status</option>
                    </select>

                    <select className={styles.select}>
                        <option>Dispatch Date</option>
                    </select>

                    <select className={styles.select}>
                        <option>Order Date</option>
                    </select>
                </div>
            </section>

            {/* Empty State */}
            <div className={styles.emptyState}>
                <img src="empty.svg" alt="No Results" />
                <h3>No Results</h3>
                <p>
                    No Bulk catalogs exist. Upload a <br />
                    new catalog using Bulk upload <br />
                    button on the top
                </p>
            </div>
        </div>
    )
}