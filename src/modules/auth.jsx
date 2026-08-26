import { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

const route = import.meta.env.VITE_BASEAPI;

export function Protect({ children }) {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch(`${route}/users/session`, {
          credentials: "include",
        });

        setAuth(response.status === 200);
      } catch (error) {
        console.error("Session check failed:", error);
        setAuth(false);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  if (loading) {
    return null;
  }

  if (auth) {
    return children;
  }

  return <Navigate to={`/login?${searchParams}`} replace />;
}

// Prevent authentication pages like login, signup, and register
// from displaying if the user is already authenticated.
export function PreventAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch(`${route}/users/session`, {
          credentials: "include",
        });

        setAuth(response.status === 200);
      } catch (error) {
        console.error("Session check failed:", error);
        setAuth(false);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  if (loading) {
    return null;
  }

  if (auth) {
    return <Navigate to="/" replace />;
  }

  return children;
}
