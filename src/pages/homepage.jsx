import { useLayoutEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import styles from "../css/pages/Homepage.module.css";
import clsx from "clsx";

const Homepage = () => {
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [activePlatform, setActivePlatform] = useState("all");

  useLayoutEffect(() => {
    const sidebar = document.querySelector("aside");
    if (!sidebar) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSidebarWidth(entry.contentRect.width);
      }
    });

    observer.observe(sidebar);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Sidebar />

      <main
        className={clsx(styles.pageContent)}
        style={{ marginLeft: sidebarWidth + 20 }}
      >
        <div className={clsx(styles.pageContainer)}>
          <section className={clsx(styles.dashboardGrid)}>
            <div className={clsx(styles.card, styles.platforms)}>
  <div className={styles.platformsRow}>
    <button
      className={clsx(
        styles.platformBtn,
        activePlatform === 0 && styles.active
      )}
      onClick={() => setActivePlatform(0)}
    >
      <span className={styles.platformBtnText}>Let's check all</span>
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

            <div className={clsx(styles.middleRow)}>
              <div className={clsx(styles.card, styles.orders)} />
              <div className={clsx(styles.card, styles.shipping)} />
              <div className={clsx(styles.card, styles.activeUsers)} />
              <div className={clsx(styles.card, styles.returns)} />
            </div>

            <div className={styles.gap32} />

            <div className={clsx(styles.card, styles.businessInsights)} />
          </section>
        </div>
      </main>
    </>
  );
};

export default Homepage;
