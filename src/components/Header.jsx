import { useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearSession } from "../store/slices/authSlice";
import { clearBrandConnection } from "../store/slices/brandSlice";
import styles from "../css/layout/Header.module.css";
import profileStyles from "../css/components/ProfileDropDownMenu.module.css"
import pathTree from "../pathTree.json";
import { fetchCsrf } from "../store/slices/csrfSlice";
import { useContext } from "react";
import { SpinnerContext } from "../appContext";






/**
 * Gets the traced path object with name and path properties
 * example:
 *    [{"path": /catalog, "name": Catalog}]
 * @param {string} pathname 
 * @returns {object} path
 */
const getBreadcrumbs = (pathname) => {
  
  if (pathname == "/"){
    return [{"path": pathTree.path, "name": pathTree.name}]
  }

  const pathArray = pathname.split('/').filter(Boolean);  // array of pathnames only without emtpy string
  let branch = pathTree.children;   // defines the current depth

  // traced path with name
  let path = [] 
  // loop over the pathArray and return the path and their names
  for (let i = 0; i < pathArray.length; i++){
    
    // path name from the pathname without '/'
    let givenpath = pathArray[i];

    if (branch.length == 0){      // if no children further nodes then stop
      return path;
    } 
    
    // iterate over the branch nodes (checking the width)
    for (let j = 0; j < branch.length; j++){
      
      let foundPath = `${branch[j].path}` // needs to map to the parent node paths
      let foundname = branch[j].name
      let pathflag = branch[j].path.replace(/^\//, "");
      
      // if found then append the properties for path and move to the branch's children nodes (checking depth)
      if(pathflag == givenpath){
        
        // forming the relative path for the foundPath e.g /catalog/add-catalog
        if (path.length == 0){
          path.push({"path": foundPath, "name": foundname})
        }
        else{
          let relativePath = path.map((pathObj, index, array)=>{
            return pathObj.path
          })

          relativePath = relativePath.join('/');
          path.push({"path": `${relativePath}/${foundPath}`, "name": foundname})
        }
        branch = branch[j].children   //
        break;
      }
    }
  }
  console.log(path)
  return path;
}






export default function Header() {
  const location = useLocation();
  const path = getBreadcrumbs(location.pathname);     // header path section
  const [showProfileDropdown, setShowProfilDropdown] = useState(false);


  // console.log(showProfileDropdown)
  return (
    <header className={styles.headerContainer}>
      {/* Left: Breadcrumbs */}

      <div className={styles.breadcrumbURLSection}>
        {
          path.map((path, index, arr)=> {
            return (<div className={styles.breadcrumb} key={index}>
              <Link to={path.path} className={styles.breadcrumbRoot} style={index == arr.length -1? {"fontWeight": "bolder", "color": "black"}: null}>
                {path.name}
              </Link>

              {/* render "/" in between iteratios */}
              {index < arr.length-1? <span className={styles.breadcrumbSeparator}>/</span>: ""}
            </div> )
          })
        }
      </div>

      {/* Right: Clock, Notification, Avatar */}
      <div className={styles.headerRight}>
        {/* Action icons & Profile */}
        <div className={styles.actionsGroup}>
          {/* Bell / Notification icon with badge */}
          <button className={styles.iconBtn} title="Notifications" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className={styles.badge}>5</span>
          </button>

          {/* User Avatar Initials */}
          <div className={styles.avatar} title="User Profile" onClick={() => setShowProfilDropdown(prev => !prev)}>
            AK
          </div>

          {showProfileDropdown && <ProfileDropDownMenu/>}
        </div>
      </div>
    </header>
  );
}




function ProfileDropDownMenu(){
  const csrfToken = useSelector((state) => state.csrf.csrf);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const setShowSpinner = useContext(SpinnerContext);



  const handleLogout = async () => {
    try {
      const route = import.meta.env.VITE_BASEAPI;
      let counter = 0;
      let response;

      setShowSpinner(true);
      do{
        response = await fetch(`${route}/users/logout`, {
          method: "POST",
          headers: {"X-CSRF-Token": csrfToken},
          credentials: "include",
        });
        
        dispatch(fetchCsrf());  // incase the csrf fails
        counter++;
      }while (response.status == 403 && counter < 3);

      if (response.status == 200){
        console.log('Logging out')
        // clearing stored auths and data
        localStorage.clear();
        dispatch(clearBrandConnection());
        dispatch(clearSession()); 
        navigate("/login");
      }
      
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setShowSpinner(false);
    }
  };



  return (
    <div
      className={`${profileStyles.menu} ${profileStyles.open}`}
      id="menu"
      role="menu"
    >
      <div className={profileStyles.mh}>
        <div className={profileStyles.big}>AK</div>

        <div>
          <b>Aarav Khanna</b>
          <span>accounts@stylemyntra.in</span>
          <br />
          <span>Owner · Style Myntra Pvt Ltd</span>
        </div>
      </div>

      <div className={profileStyles.mbill}>
        <div className={profileStyles.r1}>
          <span>Subscription</span>
          <b>Pro plan</b>
        </div>

        <div
          className={profileStyles.r1}
          style={{ marginTop: "4px", color: "var(--t3)" }}
        >
          <span>Renews 01 Nov 2026</span>
          <span>₹2,360/mo</span>
        </div>

        <div className={profileStyles.r2}>
          <div>
            <div
              style={{
                fontSize: "10.5px",
                color: "var(--t3)",
              }}
            >
              Outstanding
            </div>

            <div className={`${profileStyles.amt} ${profileStyles.bad}`}>
              ₹0.00
            </div>
          </div>

          <span className={`${profileStyles.pill} ${profileStyles.paid}`}>
            All settled
          </span>
        </div>
      </div>

      {/* Billing */}
      <div className={profileStyles.mg}>
        <button
          className={`${profileStyles.mi} ${profileStyles.cur}`}
          role="menuitem"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M3 6h18v12H3zM3 10h18" />
          </svg>

          Billing & payments
        </button>

        {/* Invoices */}
        <button className={profileStyles.mi} role="menuitem">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M6 3h9l4 4v14H6zM9 12h7M9 16h7" />
          </svg>

          Invoices & receipts
        </button>

        {/* Payment methods */}
        <button className={profileStyles.mi} role="menuitem">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M2 7h20v10H2zM2 11h20M6 15h3" />
          </svg>

          Payment methods
        </button>

        {/* Subscription */}
        <button className={profileStyles.mi} role="menuitem">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />
          </svg>

          Manage subscription
        </button>
      </div>

      {/* Account */}
      <div className={profileStyles.mg}>
        {/* Profile */}
        <button className={profileStyles.mi} role="menuitem">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.6-6 8-6s8 2 8 6" />
          </svg>

          My profile
        </button>

        {/* Settings */}
        <button className={profileStyles.mi} role="menuitem">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 9a3 3 0 100 6 3 3 0 000-6zM12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>

          Account settings
        </button>

        {/* Team */}
        <button className={profileStyles.mi} role="menuitem">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6M9 5a3 3 0 100 6 3 3 0 000-6zM17 11a3 3 0 100-6M22 20c0-2.5-1.8-4.5-4-5.3" />
          </svg>

          Team & roles
        </button>

        {/* Notifications */}
        <button className={profileStyles.mi} role="menuitem">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M6 8a6 6 0 1112 0c0 7 2 9 2 9H4s2-2 2-9M10.3 21a1.9 1.9 0 003.4 0" />
          </svg>

          Notifications
        </button>

        {/* Help */}
        <button className={profileStyles.mi} role="menuitem">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1-1.5 2M12 17h.01" />
          </svg>

          Help & support
        </button>
      </div>

      {/* Sign out */}
      <div className={profileStyles.mg}>
        <button
          className={`${profileStyles.mi} ${profileStyles.out}`}
          role="menuitem" onClick={handleLogout}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9" />
          </svg>

          Sign out
        </button>
      </div>
    </div>
  );
}