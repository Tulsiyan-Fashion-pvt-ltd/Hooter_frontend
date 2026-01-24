import Sidebar from "../components/sidebar";
import styles from "../css/pages/Homepage.module.css";
import { session } from "../modules/auth";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Homepage = () => {
  // checking the login
  const [user, setUser] = useState();

  useEffect(async ()=> {
    const promise = await session();
    setUser(promise);
  }, [])

  if (user == false) {
    return <Navigate to='/login' replace />
  }

  else {
    return (
      <>
        <Sidebar />

        <main className={styles.pageContent}>
          <h1>Homepage</h1>
        </main>
      </>
    );
  }
};

export default Homepage;
