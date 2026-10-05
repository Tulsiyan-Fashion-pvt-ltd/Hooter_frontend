import React from "react";
import { useLocation, Link } from "react-router-dom";
import styles from "../css/layout/Header.module.css";
import pathTree from "../pathTree.json";


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

  // traced path with name
  let path = [] 

  const pathArray = pathname.split('/').filter(Boolean);  // array of pathnames only without emtpy string
  let branch = pathTree.children;   // defines the current depth


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
          <div className={styles.avatar} title="User Profile">
            AK
          </div>
        </div>
      </div>
    </header>
  );
}
