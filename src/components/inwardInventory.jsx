import { useState, useEffect } from "react";
import styles from "../css/pages/inventory.Inventory.module.css"
import inwardStyle from "../css/components/Inward.module.css"
import CreateInwardPopup from "./createInwardPopup"

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
  const [inwardPopup, setInwardPopup] = useState(false); 

  useEffect(() => {
    async function getStockCounts() {
      const response = await fetch(`${url}/inventory/inward-count`, { "credentials": "include" });

      const inward = await response.json();
      setInward((prev)=>({...prev, "total": inward.total,
        "pending": inward.pending,
        "partial": inward.partial,
        "completed": inward.completed}))
    }

    getStockCounts();
  }, []);

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
                <h3 className={styles.textCard}>Draf Inward</h3>
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

      <div className={inwardStyle.createNewBttn}>
        <button className={inwardStyle.newInwardBttn} onClick={()=>setInwardPopup(prev=>!prev)}>Create Inward</button>
      </div>
      

      {/* Inventory Table */}
      <div className={styles.inventoryTable}>
        {/* <p className={styles.previousLink}>Previous Inward</p> */}

        {/* <TotalInwardTable /> */}
        {table === "total" ? <TotalInwardTable /> :
          table === "pending" ? <PendingInwardTable /> :
            table === "partial" ? <PartialInwardTable /> :
              table === "completed" ? <CompletedInwardTable /> : 
                table === "draft"? <DraftInwardTable/>: null
        }

      </div>

      {
        inwardPopup == true? <CreateInwardPopup onclick={()=>setInwardPopup(prev=>!prev)}/>: null
      }
    </>
  )
}

function TotalInwardTable(){
    const [table, setTable] = useState([]);

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
    }, [])

    return(
      <Table data={table}></Table>
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


function Table({ data }) {
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
        <table className={styles.tbInv}>
            <thead className={styles.theadInv}>
                <tr>
                    <th>Inward ID</th>
                    <th>Supplier</th>
                    <th>Creation Date</th>
                    <th>Creation Time</th>
                    <th>Updation Date</th>
                    <th>Updation Time</th>
                </tr>
            </thead>

            <tbody className={styles.tbodyInv}>
                {
                    data ? data.map(({ inward_id, created_at, updated_at, supplier }) => {
                        return (<tr key={inward_id}>
                            <td>{inward_id}</td>
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
    )
}



// draft table
function DraftInwardTable(){
    return (
        <table data={[]}></table>
    )
}