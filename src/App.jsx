import { Routes, Route } from "react-router-dom"; 
import Login from "./pages/login";
import Homepage from "./pages/homepage";
import Register from "./pages/register";
import Signup from "./pages/signup";
import {Protect, PreventAuth} from './modules/auth';
import Layout from "./layout";

function App() {
  return (
    <Routes>
      <Route element={<Layout/>}>
      <Route path="/" element={
        <Protect>
          <Homepage/>
        </Protect>} /> 
      </Route>

      <Route path="/login" element={
        <PreventAuth>
          <Login />
        </PreventAuth>} /> 
      
      <Route path="/signup" element={
        <PreventAuth>
          <Signup/>
        </PreventAuth>}/>

      <Route path="/register" element={<Register/>}/>
    </Routes>
  );
}

export default App;