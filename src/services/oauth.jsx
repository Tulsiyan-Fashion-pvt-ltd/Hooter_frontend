import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
const url = import.meta.env.VITE_BASEAPI;


/**
    * OAuth handling for the shopify and other platforms
*/
export default function OAuthComponent(){
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const csrf = useSelector(state => state.csrf.csrf);
    const params = Object.fromEntries(searchParams);
    

    
    // running the oauth functions
    useEffect(()=> {
        // console.log(params)
        if (params['request-platform']=="shopify" && params['request-type'] == "oauth"){

          // Only run the Shopify OAuth flow when Shopify
          // has actually redirected back with the required params.
          if (!params.shop || !params.hmac) {
            return;
          }
          else{
            sendShopifyRedirect();
          }
        }
    }, [])
    


    async function sendShopifyRedirect() {
        console.log("shopify oauth")
        try {
          const response = await fetch(`${url}/platforms/shopify/auth/install-store`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf},
            credentials: "include",
            body: JSON.stringify(params),
          });

          const data = await response.json();
          if (!response.ok) {
            window.alert("Couldn't fetch the Shopify shop name");
            // Remove OAuth parameters from the URL.
            // setSearchParams({}, { replace: true });
            // Return to the homepage.
            navigate("/", { replace: true });
            return;
          }

          // Remove OAuth parameters before continuing the OAuth flow.
        //   setSearchParams({}, { replace: true });
          if (data.redirect) {
            window.location.href = data.redirect;
            return;
          }

          // If the backend doesn't provide a redirect,
          // return to the homepage instead of leaving the
          // user stuck on the OAuth callback URL.
          navigate("/", { replace: true });

        } 
        catch (error) {
          console.error("Shopify OAuth request failed:", error);
          // Clean up the OAuth parameters.
        //   setSearchParams({}, { replace: true });
          // Return to the homepage.
          navigate("/", { replace: true });
        }
    }

    
    return(<></>)
}