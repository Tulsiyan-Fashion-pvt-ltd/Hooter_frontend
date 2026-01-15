import { Routes, Route } from "react-router-dom"; 
import Login from "./pages/login";
import Homepage from "./homepage";


function App() {
  return (
    <Routes> 
      <Route path="/" element={<Homepage/>} /> 
      <Route path="/login" element={<Login />} /> 
    </Routes>
  );
} 
 export default App;