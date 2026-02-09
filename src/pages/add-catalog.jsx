import styles from '../css/pages/add-catalog.module.css';

export default function AddCatalog() {
    return (
        <div className={styles.globalAddCatalogContainer}>
            <div className={styles.main}>
                <div className={styles.top}>
                    <h1>Add Single Catalog</h1>
                    <p>Add The product photos and we will auto-fill some of the product discreption</p>

                    <div className={styles.row}>
                        <div className={styles.steps}>
                            <div className={styles.step}>
                                <span className={styles.check}>✔</span>
                                Select Category
                            </div>

                            <div className={`${styles.step} ${styles.active}`}>
                                2&nbsp; Add product details
                            </div>
                        </div>
                    </div>

                    <div className={styles["mandatory-row"]}>
                        <p className={styles.mandatory}>
                            Mandatory Fields<span>*</span>
                        </p>

                        <div className={`${styles.guideline} ${styles.small}`}>
                            <a href="#">⚠ Follow guidelines to reduce quality check</a>
                        </div>
                    </div>
                </div>

                <div className={styles.after_top}>
                    {/* LEFT */}
                    <div className={styles.left}>
                        <div className={styles["left-shadow"]}>
                            <h3>Add product details</h3>

                            <div className={styles["info-box"]}>
                                <div className={styles["info-top"]}>
                                    <span className={styles.tick}>✔</span>
                                    <p>Copy input details to all product</p>
                                </div>

                                <p className={styles["info-text"]}>
                                    If you want to change specific fields for particular product like Color, Fabric etc
                                </p>
                            </div>

                            <h4>Listing Information</h4>

                            <div className={styles.listing}>
                                {[
                                    "Sku id",
                                    "Product title",
                                    "Product type id",
                                    "Product stock",
                                    "Product descr...",
                                    "Product price",
                                    "Compared price",
                                    "Purchasing cost",
                                    "Vendor",
                                ].map((label, i) => (
                                    <div className={styles.line} key={i}>
                                        <span className={styles.pill}>{label}</span>
                                        <input placeholder="Type Here..." />
                                    </div>
                                ))}

                                <div className={styles.line}>
                                    <span className={`${styles.pill} ${styles.required}`}>HSN*</span>
                                    <input placeholder="Type Here..." />
                                </div>
                            </div>

                            <div className={styles.buttons}>
                                <button className={styles.draft}>Save as draft</button>
                                <button className={styles.submit}>Submit</button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className={styles.right}>
                        <div className={`${styles.card1} ${styles.shadow}`}>
                            <h4>Add images</h4>

                            <div className={styles["image-grid"]}>
                                {["Front image", "Image 2", "Image 3", "Image 4"].map((text, i) => (
                                    <div className={styles["img-box"]} key={i}>
                                        {text}
                                        <div className={styles.circle}>📷</div>
                                    </div>
                                ))}
                            </div>

                            <button className={styles["blue-btn"]}>Add more image</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
