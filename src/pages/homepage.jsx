import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import styles from "../css/pages/Homepage.module.css";
import clsx from "clsx";

const Homepage = () => {
  const { sidebarWidth } = useOutletContext();
  const [activePlatform, setActivePlatform] = useState(0);

  return (
    <main
      className={styles.pageContent}
      style={{ marginLeft: sidebarWidth + 20 }}
    >
      <div className={styles.pageContainer}>
        <section className={styles.dashboardGrid}>
          {/* Platforms */}
          <div className={clsx(styles.card, styles.platforms)}>
            <div className={styles.platformsRow}>
              <button
                className={clsx(
                  styles.platformBtn,
                  activePlatform === 0 && styles.active
                )}
                onClick={() => setActivePlatform(0)}
              >
                <span className={styles.platformBtnText}>
                  Let's check all
                </span>
              </button>

              {Array.from({ length: 8 }).map((_, index) => (
                <button
                  key={index + 1}
                  className={clsx(
                    styles.platformBtn,
                    activePlatform === index + 1 && styles.active
                  )}
                  onClick={() => setActivePlatform(index + 1)}
                />
              ))}
            </div>
          </div>

          <div className={styles.gap29} />

          {/* Middle row */}
          <div className={styles.middleRow}>
            <div className={clsx(styles.card, styles.orders)} />
            <div className={clsx(styles.card, styles.shipping)} />
            <div className={clsx(styles.card, styles.activeUsers)} />
            <div className={clsx(styles.card, styles.returns)} />
          </div>

          <div className={styles.gap32} />

          {/* Business insights */}
          <div className={clsx(styles.card, styles.businessInsights)} />
        </section>
      </div>
    </main>
  );
};

export default Homepage;
