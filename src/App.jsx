import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Homepage from "./pages/homepage";
import Register from "./pages/register";
import Signup from "./pages/signup";
import { Protect, PreventAuth } from './modules/auth';
import Layout from "./layout";
import './css/layout/animations.css'
import Catalog from "./pages/catelog";


function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element=
        {
          <Protect>
            <Homepage />
          </Protect>
        } />

        <Route path='/catalog' element=
          {
            <Protect>
              <Catalog />
            </Protect>
          }/>
      </Route>

      <Route path="/register" element={
        <Protect>
          <Register />
        </Protect>}
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