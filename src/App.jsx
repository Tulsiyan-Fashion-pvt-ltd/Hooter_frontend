import { Routes, Route } from "react-router-dom"; 
import Login from "./pages/login";
import Homepage from "./homepage";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";


function App() {
  return (
    <Routes> 
      <Route path="/" element={<Homepage/>} /> 
      <Route path="/login" element={<Login />} /> 
      <Route path="/register" element={<Register/>}/>
      <Route path="/Dashboard" element={<Dashboard/>}/>
    </Routes>
  );
} 
 export default App;