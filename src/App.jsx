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

function App() {
  return (
    <Routes>
      <Route element={
        <Protect>
          <Layout />
        </Protect>
        }>

        <Route path="/" element=
          {
            <Homepage />
          } />

        <Route path='/catalog' element=
          {
              <Catalog />
          } />

        <Route path="/catalog/add-catalog" element={
            <AddCatalog />
        } />

        <Route path="/catalog/add-bulk-catalog" element={
            <AddBulkCatalog/>
        }/>

        <Route path="/inventory" element={
            <Inventory/>
        }/>

        <Route path="/orders" element={
            <Orders />
        } />
      </Route>

      <Route path="/register" element={
        <Protect>
          <Register />
        </Protect>
      }
      />

      <Route path="/login" element={
        <PreventAuth>
          <Login />
        </PreventAuth>} />

      <Route path="/signup" element={
        <PreventAuth>
          <Signup />
        </PreventAuth>} />
      <Route path="/*" element={<>404</>}></Route>
    </Routes>
  );
}

export default App;