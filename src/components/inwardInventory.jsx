import { useState, useEffect, useRef } from "react";
import styles from "../css/pages/inventory.Inventory.module.css"
import inwardStyle from "../css/components/Inward.module.css"
import CreateInwardPopup from "./createInwardPopup"
import { Link, useFetcher } from "react-router-dom";

const url = import.meta.env.VITE_BASEAPI

// table and overview section
export default function Inward() {
  const [inward, setInward] = useState({
    "all": '',
    "pending": '',
    "draft": "NA",
    "completed": '',
    "partial": ''
  })
  const [table, setTable] = useState("total");  // total, sellable, oos, lowStock
  const [newInward, setNewInward] = useState(); // depenncy for total inward and inward counts
  const [error, setError] = useState({});

  useEffect(() => {
    async function getStockCounts() {
      const response = await fetch(`${url}/inventory/inward-count`, { "credentials": "include" });

      const inward = await response.json();
      setInward((prev)=>({...prev, "total": inward.total,
        "pending": inward.pending,
        "partial": inward.partial,
        "completed": inward.completed}))
    }

    function countDraftInwardEntries(){
      const storage = JSON.parse(window.localStorage.getItem("inwardEntry"));

      storage && setInward((prev)=> ({...prev, "draft": Object.keys(storage).length}));
    }

    getStockCounts();
    countDraftInwardEntries();
  }, [newInward]);

  return (
    <>
      {/* Overview Section */}
      <div className={styles.overview}>
        <div className={styles.firstRow}>
          <div className={styles.overLeft}>
            <img
              src="/src/assets/icons/inventory.svg"
              className={styles.iconSm}
              alt=""
            />
            <p className={styles.textSm}>
              Have unique products to sell? Choose from the options below
            </p>
          </div>
        </div>

        <div className={styles.secondRow}>
          <h2 className={styles.textOverview}>Overview</h2>

          <div className={styles.ovrBx}>

            {/* Box 0 */}
            <div className={styles.overBox}>
              <div className={styles.inBox1}>
                <img
                  src="/src/assets/icons/note.svg"
                  className={styles.iconSm}
                  alt=""
                />
                <h3 className={styles.textCard}>Total Inward</h3>
                <button className={styles.menuBtn}>⋮</button>
              </div>

              <div className={styles.line}></div>

              <div className={styles.inBox2}>
                <h3 className={styles.textNum}>{inward.total}</h3>
                <button onClick={() => { setTable("total") }} disabled={table==="total"?true: false}>
                  View details
                  <img
                    src="/src/assets/icons/arrow_black.svg"
                    className={styles.arrowIcon}
                    alt=""
                  />
                </button>
              </div>
            </div>

            {/* Box 1 */}
            <div className={styles.overBox}>
              <div className={styles.inBox1}>
                <img
                  src="/src/assets/icons/note.svg"
                  className={styles.iconSm}
                  alt=""
                />
                <h3 className={styles.textCard}>Pending Inward</h3>
                <button className={styles.menuBtn}>⋮</button>
              </div>

              <div className={styles.line}></div>

              <div className={styles.inBox2}>
                <h3 className={styles.textNum}>{inward.pending}</h3>
                <button onClick={() => { setTable("pending") }} disabled={table==="pending"?true: false}>
                  View details
                  <img
                    src="/src/assets/icons/arrow_black.svg"
                    className={styles.arrowIcon}
                    alt=""
                  />
                </button>
              </div>
            </div>

            {/* Box 2 */}
            <div className={styles.overBox}>
              <div className={styles.inBox1}>
                <img
                  src="/src/assets/icons/note.svg"
                  className={styles.iconSm}
                  alt=""
                />
                <h3 className={styles.textCard}>Partial Upload Inward</h3>
                <button className={styles.menuBtn}>⋮</button>
              </div>

              <div className={styles.line}></div>

              <div className={styles.inBox2}>
                <h3 className={styles.textNum}>{inward.partial}</h3>
                <button onClick={() => { setTable("partial") }} disabled={table==="partial"?true: false}>
                  View details
                  <img
                    src="/src/assets/icons/arrow_black.svg"
                    className={styles.arrowIcon}
                    alt=""
                  />
                </button>
              </div>
            </div>

            {/* Box 3 */}
            <div className={styles.overBox}>
              <div className={styles.inBox1}>
                <img
                  src="/src/assets/icons/note.svg"
                  className={styles.iconSm}
                  alt=""
                />
                <h3 className={styles.textCard}>Completed Inward</h3>
                <button className={styles.menuBtn}>⋮</button>
              </div>

              <div className={styles.line}></div>

              <div className={styles.inBox2}>
                <h3 className={styles.textNum}>{inward.completed}</h3>
                <button onClick={() => { setTable("completed") }} disabled={table==="completed"?true: false}>
                  View details
                  <img
                    src="/src/assets/icons/arrow_black.svg"
                    className={styles.arrowIcon}
                    alt=""
                  />
                </button>
              </div>
            </div>

            {/* Box 4 */}
            <div className={styles.overBox}>
              <div className={styles.inBox1}>
                <img
                  src="/src/assets/icons/note.svg"
                  className={styles.iconSm}
                  alt=""
                />
                <h3 className={styles.textCard}>Draft Inward</h3>
                <button className={styles.menuBtn}>⋮</button>
              </div>

              <div className={styles.line}></div>

              <div className={styles.inBox2}>
                <h3 className={styles.textNum}>{inward.draft}</h3>
                <button onClick={() => { setTable("draft") }} disabled={table==="draft"?true: false}>
                  View details
                  <img
                    src="/src/assets/icons/arrow_black.svg"
                    className={styles.arrowIcon}
                    alt=""
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      

      {/* Inventory Table */}
      <div className={styles.inventoryTable}>
        {/* <p className={styles.previousLink}>Previous Inward</p> */}

        {/* <TotalInwardTable /> */}
        {table === "total" ? <TotalInwardTable newInward={newInward} setNewInward={setNewInward}/> :
          table === "pending" ? <PendingInwardTable /> :
            table === "partial" ? <PartialInwardTable /> :
              table === "completed" ? <CompletedInwardTable /> : 
                table === "draft"? <DraftInwardTable/>: null
        }

      </div>
    </>
  )
}

function TotalInwardTable({newInward, setNewInward}){
    const [table, setTable] = useState([]);
    const [inwardPopup, setInwardPopup] = useState(false);

    useEffect(()=>{
        async function populateTable(){
            try{
                const response = await fetch(`${url}/inventory/inward`, {credentials: "include"});
                const data = await response.json();
                
                setTable(data);
            }catch(e){
                console.log(e)
            }
        }

        populateTable();
    }, [newInward])

    return(
      <>
        <div className={inwardStyle.createNewBttn}>
          <button className={inwardStyle.newInwardBttn} onClick={() => setInwardPopup(prev => !prev)}>Create Inward</button>
        </div>
        <Table data={table}></Table>

        {
          inwardPopup == true ? <CreateInwardPopup close={() => setInwardPopup(prev => !prev)} complete={setNewInward}/> : null
        }
      </>
    )
}

function PendingInwardTable(){
    const [table, setTable] = useState([]);

    useEffect(()=>{
        async function populateTable(){
            try{
                const response = await fetch(`${url}/inventory/inward?type=pending`, {credentials: "include"});
                const data = await response.json();
                
                setTable(data);
            }catch(e){
                console.log(e)
            }
        }

        populateTable();
    }, [])

    return(
        <Table data={table}></Table>
    )
}

function PartialInwardTable(){
    const [table, setTable] = useState([]);

    useEffect(()=>{
        async function populateTable(){
            try{
                const response = await fetch(`${url}/inventory/inward?type=partial`, {credentials: "include"});
                const data = await response.json();
                
                setTable(data);
            }catch(e){
                console.log(e)
            }
        }

        populateTable();
    }, [])

    return(
        <Table data={table}></Table>
    )
}


function CompletedInwardTable(){
    const [table, setTable] = useState([]);

    useEffect(()=>{
        async function populateTable(){
            try{
                const response = await fetch(`${url}/inventory/inward?type=completed`, {credentials: "include"});
                const data = await response.json();
                
                setTable(data);
                // console.log(data)
            }catch(e){
                console.log(e)
            }
        }
  
        populateTable();
    }, [])

    return(
        <Table data={table}></Table>
    )
}


// draft table
function DraftInwardTable() {
  const [table, setTable] = useState([]);

  useEffect(()=>{
      async function populateTable(){
          try{
              const response = await fetch(`${url}/inventory/inward`, {credentials: "include"});
              const data = await response.json();
              console.log(data)

              if (!response.ok){
                return;
              }

              const storage = JSON.parse(window.localStorage.getItem("inwardEntry"));

              data.map((row)=>{
                // console.log(storage[row.inward_id]);
                if (storage[row.inward_id]) {
                  setTable((prev) => {
                    return [...prev, row];
                  });
                }
              })
              
          }catch(e){
              console.log(e)
          }
      }

      populateTable();
  }, [])

  return (
    <Table data={table}></Table>
  )
}


function Table({ data }) {
  const [inwardSidebar, setInwardSidebar] = useState();
    function date(timestamp){
        const d = new Date(timestamp);

        return d.toDateString();
    }

    function time(timestamp){
        const d = new Date(timestamp);

        return d.toLocaleTimeString();
    }
    // console.log(data)

    return (
        <>
        <table className={styles.tbInv}>
            <thead className={styles.theadInv}>
                <tr>
                    <th>Inward ID</th>
                    <th>Status</th>
                    <th>Supplier</th>
                    <th>Creation Date</th>
                    <th>Creation Time</th>
                    <th>Updation Date</th>
                    <th>Updation Time</th>
                </tr>
            </thead>

            <tbody className={styles.tbodyInv}>
                {
                    data ? data.map(({ inward_id, inward_status, created_at, updated_at, supplier }) => {
                       // checking up the draft saved from the inwards 
                        const storage = JSON.parse(window.localStorage.getItem("inwardEntry"));
                        
                        return (<tr key={inward_id}>
                            <td><div style={{color: "blue", fontWeight: "bolder", textDecoration: "underline", "cursor": "pointer"}} 
                            onClick={()=>{setInwardSidebar(inward_id)}}>{inward_id}</div></td>
                            <td>
                              <div className={styles.statusbox}>
                                <p style={{backgroundColor: inward_status === "completed"? "rgb(179 224 179)":
                                              inward_status === "partial"? "rgb(245 193 0 / 32%)": 
                                                inward_status === "pending"? "rgb(255 166 97)" : "orange",
                                          color: inward_status === "completed"? "#093609":
                                              inward_status === "partial"? "#ff000054": 
                                                inward_status === "pending"? "red" : "orange"
                                }}>{inward_status}</p> 
                                {storage && storage[inward_id]&& <p style={{backgroundColor: "#FF90000D", color: "#FF9000"}}>{"saved draft"}</p>}
                              </div>
                            </td>
                            <td>{supplier}</td>
                            <td>{date(created_at)}</td>
                            <td>{time(created_at)}</td>
                            <td>{date(updated_at)}</td>
                            <td>
                                {time(updated_at)}
                            </td>
                        </tr>
                        )
                    }) : null
                }
            </tbody>
        </table>

        {inwardSidebar && <InwardDetailsSidebar inwardId={inwardSidebar} close={()=>{setInwardSidebar(false)}}/>}
        </>
    )
}



// ************************** sidebar ***********************
function InwardDetailsSidebar({inwardId, close}){
  const sidebar = useRef();
  const [error, setError] = useState({});
  const [sidebarData, setSidebarData] = useState({});

  useEffect(()=>{
    sidebar.current.style.transform = "translateX(0%)";
  },[]);


  useEffect(()=>{
    async function getInwardDetails(){
      try{
        const response = await fetch(`${url}/inventory/inward?id=${inwardId}`,{
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok){
            setError({msg: "Could not fetch the inward details from the server"});
            return;
        }

        setSidebarData(data);
        console.log(data)

      }catch(e){
        console.error(e);
        setError({msg: "Could not fetch the inward details"})
      }
    }

    getInwardDetails();
  }, [inwardId])

  return(
    <div className={styles.sidebarGlobalScreen}>
      <div className={styles.sidebarBody} ref={sidebar}>
        <button className={styles.closeSidebar} onClick={close}>X</button>
        <div className={styles.headerSection}>
          
        </div>

        <div className={styles.mainSection}>
          
        </div>

        {!["completed", "cancelled"].includes(sidebarData.status) && 
        <div className={styles.bottomSection}>
          <Link className={styles.completeInwardBttn} to={`./entry?id=${inwardId}`}>Complete Inwarding</Link>
        </div>}
      </div>
    </div>
  )
}