import Sidebar from "./components/sidebar";
import styles from "./css/pages/Homepage.module.css";
import clsx from "clsx";

const Homepage = () => {
  return (
    <>
      <Sidebar />

      <main className={clsx(styles.pageContent)}>
        <section className={styles.dashboardGrid}>
          {/* 1. Overview */}
          <div className={clsx(styles.subContainer, styles.overview)}>
            Overview
          </div>

          {/* 2. Orders */}
          <div className={clsx(styles.subContainer, styles.smallBox)}>
            Orders
          </div>

          {/* 3. Shipping Performance */}
          <div className={clsx(styles.subContainer, styles.smallBox)}>
            Shipping Performance
          </div>

         {/* 4. Best Seller */}
          <div className={clsx(styles.subContainer, styles.bestSeller)}>
            Best Seller
           </div>

          {/* 5. Active Users */}
          <div className={clsx(styles.subContainer, styles.smallBox)}>
            Active Users
          </div>

          {/* 6. Returns */}
          <div className={clsx(styles.subContainer, styles.smallBox)}>
            Returns
          </div>

          {/* 7. Business Insights */}
          <div className={clsx(styles.subContainer, styles.businessInsights)}>
            Business Insights
          </div>
        </section>
      </main>
    </>
  );
};

export default Homepage;
