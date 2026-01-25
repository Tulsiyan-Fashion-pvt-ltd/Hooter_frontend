import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const route = import.meta.env.VITE_BASEAPI;

export function Protect({ children }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [auth, setAuth] = useState(false);

    useEffect(() => {
        async function checkSession() {
            const response = await fetch(`${route}/session`, {credentials: 'include'});
            setLoading(false);
            if (response.status == 200) {
                setAuth(true);
            }
            else {
                setAuth(false);
            }
        }

        checkSession();
    }, [])

    if (loading == true) {
        return null;
    } else {
        if (auth == true) {
            return (children)
        }
        else {
            return navigate('/login')
        }
    }
}