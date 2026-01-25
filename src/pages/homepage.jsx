import Sidebar from "../components/sidebar";
import styles from "../css/pages/Homepage.module.css";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Homepage = () => {
  return (
    <>
      <Sidebar />

      <main className={styles.pageContent}>
        <h1>Homepage</h1>
      </main>
    </>
  );
};

export default Homepage;
