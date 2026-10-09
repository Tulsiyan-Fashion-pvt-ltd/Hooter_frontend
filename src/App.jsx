import { Routes, Route, Navigate, useLocation} from "react-router-dom";
import { useContext } from 'react'
import { SpinnerContext } from "./appContext";
import { Spinner } from "./components/spinner";
import { useState } from "react";
import Login from "./pages/login";
import Homepage from "./pages/homepage";
import Register from "./pages/register";
import Signup from "./pages/signup";
import SelectBrand from "./pages/select-brand";
import { Protect, PreventAuth } from "./modules/auth";
import Layout from "./layout";
import "./css/layout/animations.css";
import Catalog from "./pages/catalog";
import Orders from "./pages/orders";
import AddCatalog from "./pages/add-catalog";
import AddBulkCatalog from "./pages/add-bulk-catalog";
import Inventory from "./pages/inventory";
import InwardEntry from "./pages/inward-entry";
import EditInventory from "./pages/edit-catalog";
import ProductDetails from "./pages/product-details";



function App() {
  const location = useLocation();
  const [showSpinner, setShowSpinner] = useState(false);

  
  // Removing the leading / prefix from the path
  const pathArray = location.pathname.split('/');
  const suffix = pathArray[pathArray.length - 1]

  if (suffix.trim() === "" && suffix.length > 1){   //apply logic except for the root home page? root homepage needs '/'
    return <Navigate to={location.pathname.replace(/\/$/, "")} /> // removing the "/" suffix from the path
  }


  
  

  
  return (
    <SpinnerContext.Provider value={setShowSpinner}>
      {showSpinner && <Spinner/>}
      <Routes>
        <Route
          element={
            <Protect>
              <Layout />
            </Protect>
          }
        >
          <Route path="/" element={<Homepage />} />

          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/products/:sku_id" element={<ProductDetails />} />
          <Route path="/catalog/add-catalog" element={<AddCatalog />} />
          <Route path="/catalog/add-bulk-catalog" element={<AddBulkCatalog />} />
          <Route path="/catalog/edit" element={<EditInventory />} />

          {/* Redirect /inventory to default tab /inventory/stock */}
          <Route path="/inventory" element={<Navigate to="/inventory/stock" replace />} />
          <Route path="/inventory/stock" element={<Inventory tab={"inventory"} />} />
          <Route path="/inventory/inward" element={<Inventory tab={"inward"} />} />
          <Route path="/inventory/grn" element={<Inventory tab={"grn"} />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/all-orders" element={<Orders />} />
        </Route>
        
        {/* To enter the inwards this is why it is seperate from the layout */}
        <Route path="/inventory/inward/entry" element={
          <Protect>
            <InwardEntry />
          </Protect> }
        />
        <Route path="/brand/register" element={
            <Protect>
              <Register />
            </Protect>
          }
        />
        <Route path="/select-brand" element={
            <Protect>
              <SelectBrand />
            </Protect>
          }
        />
        <Route path="/login" element={
            <PreventAuth>
              <Login />
            </PreventAuth>
          }
        />
        <Route path="/signup" element={
            <PreventAuth>
              <Signup />
            </PreventAuth>
          }
        />
        <Route path="/*" element={<>404</>} />
      </Routes>
    </SpinnerContext.Provider>
  );
}

export default App;
