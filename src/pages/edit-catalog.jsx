import styles from '../css/pages/EditInventory.module.css';
import {useState} from 'react';

export default function EditInventory() {

    const fixedFields = [
        { key: "sku-id", label: "SKU ID", required: true },
        { key: "title", label: "Product Title", required: true },
        { key: "price", label: "Product Price", required: true },
        { key: "compared-price", label: "Compared Price", required: false },
        { key: "purchasing-cost", label: "Purchasing Cost", required: false },
        { key: "vendor", label: "Vendor", required: false },
        { key: "ean", label: "EAN", required: false },
        { key: "hsn", label: "HSN", required: false },
        { key: "net-weight", label: "Net Weight", required: false },
        { key: "dead-weight", label: "Dead Weight", required: false },
        { key: "volumetric-weight", label: "Volumetric Weight", required: false },
        { key: "brand-name", label: "Brand Name", required: true },
    ];

    return (
        <div className={styles.globalEditCatalogContainer}>
            <div className={styles.top}>
                <div className={styles.header}>
                    <h1 className={styles.heading}>Edit Catalog</h1>
                    <p className={styles.description}>
                        Edit your catalog information and add images for your product
                    </p>
                </div>

                <div className={styles.guidline}>
                    <p className={styles.fieldInformation}>
                        Mandatory Fields<span style={{ "color": "red" }}>*</span>
                    </p>

                    <div className={styles.guidlineTag}>
                        <p className={styles.guidlineText}>
                            ⚠ Follow the guidelines to reduce quality check
                        </p>
                    </div>
                </div>

                <hr style={{ "margin-top": "1rem" }} />
            </div>

            <div className={styles.after_top}>
                {/* LEFT — Product Details */}
                <div className={styles.left}>
                    <h3>Add product details</h3>

                    <div className={styles["info-box"]}>
                        <div className={styles["info-top"]}>
                            <span className={styles.tick}>✔</span>
                            <p>Fill in all fields</p>
                        </div>
                        <p className={styles["info-text"]}>
                            Fill all fields before submitting.
                        </p>
                    </div>

                    <h4>Listing Information</h4>
                    <div className={styles.listing}>
                        {fixedFields.map(({ key, label }) => (
                            <div className={styles.line} key={key}>
                                <span className={styles.pill}>{label}</span>
                                <input
                                    placeholder="Type Here..."
                                    value={fixedValues[key] || ""}
                                    onChange={(e) => handleFixedChange(key, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <h4 style={{ marginTop: "24px" }}>Product Attributes</h4>
                    <div className={styles.listing}>
                        {Object.keys(fieldAttributes).map((key) => (
                            <div className={styles.line} key={key}>
                                <span className={styles.pill}>{formatLabel(key)}</span>
                                <input
                                    placeholder="Type Here..."
                                    value={dynamicValues[key] || ""}
                                    onChange={(e) =>
                                        handleDynamicChange(key, e.target.value)
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    <div className={styles.buttons}>
                        <button className={styles.draft}>Save as draft</button>
                        <button
                            className={styles.submit}
                            onClick={handleSubmit}
                        >
                            Submit Catalog ✓
                        </button>
                    </div>
                </div>

                {/* RIGHT — Images */}
                <div className={styles.right}>
                    <div className={styles.card1}>
                        <h4>Add Images</h4>

                        <div className={styles["image-grid"]} ref={imageContainerRef}>
                            {Object.keys(imageAttributes).map((key) => (
                                <div className={styles.imageCardContainer} key={key}>

                                    <input
                                        className={styles.imageTypeTag}
                                        placeholder={formatLabel(key)}
                                        onChange={(e) =>
                                            changeImageCustomKey(key, e.target.value)
                                        }
                                    />

                                    <div className={styles["img-box"]} style={{ padding: "12px" }}>
                                        <div
                                            className={styles.circle}
                                            onClick={() => uploadImage(key)}
                                            style={{
                                                backgroundImage: `url(${preview[key]?.url || camera})`,
                                            }}
                                        ></div>

                                        <p
                                            style={{
                                                fontSize: "11px",
                                                color: "#888",
                                                marginTop: "6px",
                                            }}
                                        >
                                            Image
                                        </p>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Image link"
                                        className={styles.imageLink}
                                        onChange={(e) =>
                                            handleImageLink(key, e.target.value)
                                        }
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            className={styles["blue-btn"]}
                            onClick={addCustomCimageContainer}
                        >
                            + Add more image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}