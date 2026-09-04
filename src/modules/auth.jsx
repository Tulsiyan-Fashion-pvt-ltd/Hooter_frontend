import { useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setSession, clearSession } from "../store/slices/authSlice";

const route = import.meta.env.VITE_BASEAPI;

function useAuthSession() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);


  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const response = await fetch(`${route}/users/session`, {
          credentials: "include",
        });

        if (response.status === 200) {
          const data = await response.json().catch(() => ({}));
          if (isMounted) {
            dispatch(setSession(data));
          }
        } else {
          if (isMounted) {
            dispatch(clearSession());
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
        if (isMounted) {
          dispatch(clearSession());
        }
      }
    }

    if (loading) {
      checkSession();
    }

    return () => {
      isMounted = false;
    };
  }, [dispatch, loading]);

  return { isAuthenticated, loading, user };
}

export function Protect({ children }) {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading } = useAuthSession();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return children;
  }

  return <Navigate to={`/login?${searchParams}`} replace />;
}

// Prevent authentication pages like login, signup, and register
// from displaying if the user is already authenticated.
export function PreventAuth({ children }) {
  const { isAuthenticated, loading } = useAuthSession();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
