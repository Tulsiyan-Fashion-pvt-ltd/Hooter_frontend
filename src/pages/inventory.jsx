import styles from '../css/pages/inventory.Inventory.module.css';

export default function Inventory() {
    return (
        <div className={styles.InventoryGlobalContainer}>
            <div className={styles.pageWrapper}>
                <div className={styles.customBox}>
                    <div className={styles.leftCustom}>
                        <h1>Manage Inventory</h1>
                        <p>
                            Welcome back, Sarah! Here's a snapshot of your platform's
                            performance.
                        </p>
                    </div>

                    <div className={styles.buttonCustom}>
                        <button className={styles.downRep}>Download Report</button>
                    </div>
                </div>

                {/* Overview Section */}
                <div className={styles.overview}>
                    <div className={styles.firstRow}>
                        <div className={styles.overLeft}>
                            <div className={styles.overIcon}></div>
                            <p>
                                Have unique products to sell? Choose from the options below
                            </p>
                        </div>
                        <button className={styles.overButton}>Create new inward</button>
                    </div>

                    <div className={styles.secondRow}>
                        <h2 className={styles.overH}>Overview</h2>

                        <div className={styles.ovrBx}>
                            {/* Box 1 */}
                            <div className={styles.overBox}>
                                <div className={styles.inBox1}>
                                    <div className={styles.inSb}></div>
                                    <h3>Sellable Inventory</h3>
                                    <div className={styles.menu}>⋮</div>
                                </div>

                                <div className={styles.line}></div>

                                <div className={styles.inBox2}>
                                    <h3>38</h3>
                                    <button>
                                        View details <span>→</span>
                                    </button>
                                </div>
                            </div>

                            {/* Box 2 */}
                            <div className={styles.overBox}>
                                <div className={styles.inBox1}>
                                    <div className={styles.inSb}></div>
                                    <h3>Out of Stock</h3>
                                    <div className={styles.menu}>⋮</div>
                                </div>

                                <div className={styles.line}></div>

                                <div className={styles.inBox2}>
                                    <h3>6 SKU’s</h3>
                                    <button>
                                        View details <span>→</span>
                                    </button>
                                </div>
                            </div>

                            {/* Box 3 */}
                            <div className={styles.overBox}>
                                <div className={styles.inBox1}>
                                    <div className={styles.inSb}></div>
                                    <h3>Low Stocks</h3>
                                    <div className={styles.menu}>⋮</div>
                                </div>

                                <div className={styles.line}></div>

                                <div className={styles.inBox2}>
                                    <h3>26 SKU’s</h3>
                                    <button>
                                        View details <span>→</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Section */}
                <div className={styles.inventorySection}>
                    <div className={styles.tabsRow}>
                        <ul className={styles.tabs}>
                            <li className={`${styles.tab} ${styles.active}`}>All (26)</li>
                            <li className={styles.tab}>Action Required (0)</li>
                            <li className={styles.tab}>QC In Progress (10)</li>
                        </ul>
                    </div>

                    <hr />

                    <div className={styles.filterSearchRow}>
                        <div className={styles.filterArea}>
                            <label htmlFor="category">Filter By</label>
                            <select id="category">
                                <option>Select Category</option>
                                <option>Category 1</option>
                                <option>Category 2</option>
                            </select>
                        </div>

                        <div className={styles.searchArea}>
                            <button type="button">
                                Search by File Name <span>🔍</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className={styles.inventoryTable}>
                    <p className={styles.previousLink}>Previous Inward</p>

                    <table className={styles.tbInv}>
                        <thead className={styles.theadInv}>
                            <tr>
                                <th>File</th>
                                <th>File Name</th>
                                <th>Date</th>
                                <th>Stock Quantity</th>
                                <th>Status</th>
                                <th>Options</th>
                            </tr>
                        </thead>

                        <tbody className={styles.tbodyInv}>
                            <tr>
                                <td>
                                    <div className={styles.fileIcon}>📄</div>
                                </td>
                                <td>#56456354654....</td>
                                <td>Kurta</td>
                                <td>Rs 1299</td>
                                <td>
                                    <span className={`${styles.status} ${styles.activeStatus}`}>
                                        Active
                                    </span>
                                </td>
                                <td>
                                    <a href="#" className={styles.viewLink}>
                                        View
                                    </a>{" "}
                                    |{" "}
                                    <a href="#" className={styles.downloadLink}>
                                        Download
                                    </a>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <div className={styles.fileIcon}>📄</div>
                                </td>
                                <td>#56456354654....</td>
                                <td>Kurta</td>
                                <td>Rs 1299</td>
                                <td>
                                    <span className={`${styles.status} ${styles.pauseStatus}`}>
                                        Pause
                                    </span>
                                </td>
                                <td>
                                    <a href="#" className={styles.viewLink}>
                                        View
                                    </a>{" "}
                                    |{" "}
                                    <a href="#" className={styles.downloadLink}>
                                        Download
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}