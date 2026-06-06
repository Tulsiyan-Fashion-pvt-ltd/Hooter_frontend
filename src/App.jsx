import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Homepage from "./pages/homepage";
import Register from "./pages/register";
import Signup from "./pages/signup";
import { Protect, PreventAuth } from './modules/auth';
import Layout from "./layout";
import './css/layout/animations.css'
import Catalog from "./pages/catalog";
import Orders from "./pages/orders";
import AddCatalog from "./pages/add-catalog";
import AddBulkCatalog from "./pages/add-bulk-catalog";
import Inventory from "./pages/inventory";
import InwardEntry from './pages/inward-entry'
import EditInventory from './pages/edit-catalog';

function App() {
  return (
    <Routes>
      <Route element={
        <Protect>
          <Layout />
        </Protect>
      }>
        <Route path="/" element={<Homepage />} />
        <Route path='/catalog' element={<Catalog />} />
        <Route path="/catalog/add-catalog" element={<AddCatalog />} />
        <Route path="/catalog/add-bulk-catalog" element={<AddBulkCatalog />} />
        <Route path="/catalog/edit" element={<EditInventory/>}/>
        <Route path="/inventory/stock?" element={<Inventory tab={"inventory"}/>} />
        <Route path="/inventory/inward" element={<Inventory tab={"inward"}/>}></Route>
        <Route path="/inventory/grn" element={<Inventory tab={"grn"}/>}></Route>
        <Route path="/orders" element={<Orders />} />
      </Route>

      <Route path="inventory/inward/entry" element={
        <Protect>
          <InwardEntry/>
        </Protect>
      }/>

      <Route path="/register-brand" element={
        <Protect>
          <Register />
        </Protect>
      } />

      <Route path="/login" element={
        <PreventAuth>
          <Login />
        </PreventAuth>
      } />

      <Route path="/signup" element={
        <PreventAuth>
          <Signup />
        </PreventAuth>
      } />

      <Route path="/*" element={<>404</>} />
    </Routes>
  );
}

export default App;