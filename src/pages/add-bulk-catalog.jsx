import styles from '../css/pages/add-bulk-catalog.module.css';

export default function AddBulkCatalog(){
    return(
        <div className={styles.bulkCatalogContainer}>
            <div className={styles.main}>
      <header>
        <div className={styles.topContainer}>
          <h1 className={styles.title}>Add bulk catalog</h1>

          <p className={styles.subtitle}>
            Add The product photos and we will auto-fill some of the product
            discreption
          </p>

          <a href="/add-product" className={styles.link}>
            Add product details
          </a>

          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Mandatory Fields <span className={styles.required}>*</span>
            </h2>

            <div className={styles.warningBox}>
              <span className={styles.icon}>!</span>
              <p>Follow guidelines to reduce quality check</p>
            </div>
          </div>

          <hr className={styles.hr1} />
        </div>

        </header>

        <div className={styles.uploadSection}>
          <button className={styles.uploadBtn}>Upload CSV</button>

          <div className={styles.uploadInfo}>
            <p>
              Please fill all the Mandatory{" "}
              <span className={styles.required}>*</span> field
            </p>
            <a href="#">Download Sample CSV</a>
          </div>
        </div>

        <div className={styles.mainContainer}>
          {/* LEFT BIG SECTION */}
          <div className={styles.leftSection}>
            <h2 className={styles.leftHeading}>Add product details</h2>

            <hr className={styles.hr2} />

            <div className={styles.copyBox}>
              <input type="checkbox" id="copy" />
              <label htmlFor="copy">
                Copy input details to all product
                <br />
                <small>
                  If you want to change specific fields for particular product
                  like Color, Fabric etc
                </small>
              </label>
            </div>

            <div className={styles.emptyState}>
              <p>
                <strong>No Results</strong>
              </p>
              <p>
                No Bulk catalogs exists. Upload a new catalog using Bulk upload
                button on the top
              </p>
            </div>

            <div className={styles.buttonRow}>
              <button className={styles.draft}>Save as draft</button>
              <button className={styles.submit}>Submit</button>
            </div>
          </div>

          {/* RIGHT SIDE COLUMN */}
          <div className={styles.rightSection}>
            <p className={styles.errorText}>
              23 errors received in recent upload
              <br />
              10 minor 13 major errors
            </p>
            <button className={styles.fixBtn}>Fix now</button>
          </div>
        </div>
      
    </div>
        </div>
    )
}