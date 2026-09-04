import { useState, useEffect, useRef } from "react";
import styles from "../css/pages/inventory.Inventory.module.css";
import inwardStyle from "../css/components/Inward.module.css";
import CreateInwardPopup from "./createInwardPopup";
import GridTable from "../components/GridTable";
import { Link, useFetcher } from "react-router-dom";

const url = import.meta.env.VITE_BASEAPI;

const inwardGridTemplate =
  "minmax(120px, 1fr) minmax(110px, 0.8fr) minmax(140px, 1fr) minmax(110px, 0.8fr) minmax(100px, 0.8fr) minmax(110px, 0.8fr) minmax(100px, 0.8fr)";

const inwardColumns = [
  { key: "id", label: "Inward ID", className: "listMain" },
  { key: "status", label: "Status", className: "listType" },
  { key: "supplier", label: "Supplier", className: "listType" },
  { key: "createdDate", label: "Created Date", className: "listType" },
  { key: "createdTime", label: "Created Time", className: "listType" },
  { key: "updatedDate", label: "Updated Date", className: "listType" },
  { key: "updatedTime", label: "Updated Time", className: "listType" },
];

// table and overview section
export default function Inward() {
  const [inward, setInward] = useState({
    all: "",
    pending: "",
    draft: "NA",
    completed: "",
    partial: "",
  });

  const [table, setTable] = useState("total"); // total, sellable, oos, lowStock
  const [newInward, setNewInward] = useState(); // depenncy for total inward and inward counts
  const [error, setError] = useState(null);

  // Keep useFetcher and use its state for the current page's loading status.
  const fetcher = useFetcher();
  const isFetcherLoading = fetcher.state !== "idle";

  useEffect(() => {
    async function getStockCounts() {
      try {
        const response = await fetch(`${url}/inventory/inward-count`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Could not fetch inward counts");
        }

        const inward = await response.json();

        setInward((prev) => ({
          ...prev,
          total: inward.total,
          pending: inward.pending,
          partial: inward.partial,
          completed: inward.completed,
        }));

        setError(null);
      } catch (e) {
        console.error("Error fetching inward counts:", e);
        setError({
          msg: "Could not fetch inward counts from the server",
        });
      }
    }

    function countDraftInwardEntries() {
      const storage = JSON.parse(window.localStorage.getItem("inwardEntry"));

      storage &&
        setInward((prev) => ({
          ...prev,
          draft: Object.keys(storage).length,
        }));
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

          {/* Main error message */}
          {error && (
            <div
              style={{
                color: "red",
                padding: "10px",
                marginBottom: "10px",
                backgroundColor: "#ffeaea",
                borderRadius: "6px",
              }}
            >
              {error.msg || "Something went wrong"}
            </div>
          )}

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

                <button
                  onClick={() => {
                    setTable("total");
                  }}
                  disabled={table === "total" || isFetcherLoading}
                >
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

                <button
                  onClick={() => {
                    setTable("pending");
                  }}
                  disabled={table === "pending" || isFetcherLoading}
                >
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

                <button
                  onClick={() => {
                    setTable("partial");
                  }}
                  disabled={table === "partial" || isFetcherLoading}
                >
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

                <button
                  onClick={() => {
                    setTable("completed");
                  }}
                  disabled={table === "completed" || isFetcherLoading}
                >
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

                <button
                  onClick={() => {
                    setTable("draft");
                  }}
                  disabled={table === "draft" || isFetcherLoading}
                >
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

        {table === "total" ? (
          <TotalInwardTable newInward={newInward} setNewInward={setNewInward} />
        ) : table === "pending" ? (
          <PendingInwardTable />
        ) : table === "partial" ? (
          <PartialInwardTable />
        ) : table === "completed" ? (
          <CompletedInwardTable />
        ) : table === "draft" ? (
          <DraftInwardTable />
        ) : null}
      </div>
    </>
  );
}

function TotalInwardTable({ newInward, setNewInward }) {
  const [table, setTable] = useState([]);
  const [inwardPopup, setInwardPopup] = useState(false);

  useEffect(() => {
    async function populateTable() {
      try {
        const response = await fetch(`${url}/inventory/inward`, {
          credentials: "include",
        });

        const data = await response.json();

        setTable(data);
      } catch (e) {
        console.log(e);
      }
    }

    populateTable();
  }, [newInward]);

  return (
    <>
      <div className={inwardStyle.createNewBttn}>
        <button
          className={inwardStyle.newInwardBttn}
          onClick={() => setInwardPopup((prev) => !prev)}
        >
          Create Inward
        </button>
      </div>

      <Table data={table}></Table>

      {inwardPopup == true ? (
        <CreateInwardPopup
          close={() => setInwardPopup((prev) => !prev)}
          complete={setNewInward}
        />
      ) : null}
    </>
  );
}

function PendingInwardTable() {
  const [table, setTable] = useState([]);

  useEffect(() => {
    async function populateTable() {
      try {
        const response = await fetch(`${url}/inventory/inward?type=pending`, {
          credentials: "include",
        });

        const data = await response.json();

        setTable(data);
      } catch (e) {
        console.log(e);
      }
    }

    populateTable();
  }, []);

  return <Table data={table}></Table>;
}

function PartialInwardTable() {
  const [table, setTable] = useState([]);

  useEffect(() => {
    async function populateTable() {
      try {
        const response = await fetch(`${url}/inventory/inward?type=partial`, {
          credentials: "include",
        });

        const data = await response.json();

        setTable(data);
      } catch (e) {
        console.log(e);
      }
    }

    populateTable();
  }, []);

  return <Table data={table}></Table>;
}

function CompletedInwardTable() {
  const [table, setTable] = useState([]);

  useEffect(() => {
    async function populateTable() {
      try {
        const response = await fetch(`${url}/inventory/inward?type=completed`, {
          credentials: "include",
        });

        const data = await response.json();

        setTable(data);

        // console.log(data)
      } catch (e) {
        console.log(e);
      }
    }

    populateTable();
  }, []);

  return <Table data={table}></Table>;
}

// draft table
function DraftInwardTable() {
  const [table, setTable] = useState([]);

  useEffect(() => {
    async function populateTable() {
      try {
        const response = await fetch(`${url}/inventory/inward`, {
          credentials: "include",
        });

        const data = await response.json();

        console.log(data);

        if (!response.ok) {
          return;
        }

        const storage = JSON.parse(window.localStorage.getItem("inwardEntry"));

        data.map((row) => {
          // console.log(storage[row.inward_id]);

          if (storage[row.inward_id]) {
            setTable((prev) => {
              return [...prev, row];
            });
          }
        });
      } catch (e) {
        console.log(e);
      }
    }

    populateTable();
  }, []);

  return <Table data={table}></Table>;
}

function Table({ data }) {
  const [inwardSidebar, setInwardSidebar] = useState();

  function date(timestamp) {
    return new Date(timestamp).toDateString();
  }

  function time(timestamp) {
    return new Date(timestamp).toLocaleTimeString();
  }

  return (
    <>
      <GridTable
        styles={styles}
        gridTemplate={inwardGridTemplate}
        columns={inwardColumns}
        data={data}
        renderRow={({
          inward_id,
          inward_status,
          created_at,
          updated_at,
          supplier,
        }) => {
          const storage = JSON.parse(
            window.localStorage.getItem("inwardEntry"),
          );

          return (
            <div className={styles.listItem} key={inward_id}>
              <div
                className={styles.listTitle}
                style={{
                  color: "blue",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => setInwardSidebar(inward_id)}
              >
                {inward_id}
              </div>

              <div className={styles.statusbox}>
                <p
                  style={{
                    backgroundColor:
                      inward_status === "completed"
                        ? "rgb(179 224 179)"
                        : inward_status === "partial"
                          ? "rgb(245 193 0 / 32%)"
                          : inward_status === "pending"
                            ? "rgb(255 166 97)"
                            : "orange",

                    color:
                      inward_status === "completed"
                        ? "#093609"
                        : inward_status === "partial"
                          ? "#ff000054"
                          : inward_status === "pending"
                            ? "red"
                            : "orange",
                  }}
                >
                  {inward_status}
                </p>

                {storage && storage[inward_id] && (
                  <p
                    style={{
                      backgroundColor: "#FF90000D",
                      color: "#FF9000",
                    }}
                  >
                    saved draft
                  </p>
                )}
              </div>

              <div className={styles.listType}>{supplier}</div>

              <div className={styles.listType}>{date(created_at)}</div>

              <div className={styles.listType}>{time(created_at)}</div>

              <div className={styles.listType}>{date(updated_at)}</div>

              <div className={styles.listType}>{time(updated_at)}</div>
            </div>
          );
        }}
      />

      {inwardSidebar && (
        <InwardDetailsSidebar
          inwardId={inwardSidebar}
          close={() => setInwardSidebar(false)}
        />
      )}
    </>
  );
}

// ************************** sidebar ***********************
function InwardDetailsSidebar({ inwardId, close }) {
  const sidebar = useRef();

  const [error, setError] = useState(null);
  const [sidebarData, setSidebarData] = useState({});

  useEffect(() => {
    sidebar.current.style.transform = "translateX(0%)";
  }, []);

  useEffect(() => {
    async function getInwardDetails() {
      try {
        const response = await fetch(`${url}/inventory/inward?id=${inwardId}`, {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          setError({
            msg: "Could not fetch the inward details from the server",
          });

          return;
        }

        setSidebarData(data);

        // Clear any previous sidebar error after
        // successfully fetching the data.
        setError(null);

        console.log(data);
      } catch (e) {
        console.error(e);

        setError({
          msg: "Could not fetch the inward details",
        });
      }
    }

    getInwardDetails();
  }, [inwardId]);

  return (
    <div className={styles.sidebarGlobalScreen}>
      <div className={styles.sidebarBody} ref={sidebar}>
        <button className={styles.closeSidebar} onClick={close}>
          X
        </button>

        <div className={styles.headerSection}>
          {error && (
            <div
              style={{
                color: "red",
                padding: "10px",
                backgroundColor: "#ffeaea",
                borderRadius: "6px",
                marginBottom: "10px",
              }}
            >
              {error.msg || "Could not load inward details"}
            </div>
          )}
        </div>

        <div className={styles.mainSection}></div>

        {!["completed", "cancelled"].includes(sidebarData.status) && (
          <div className={styles.bottomSection}>
            <Link
              className={styles.completeInwardBttn}
              to={`./entry?id=${inwardId}`}
            >
              Complete Inwarding
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
