import { Routes, Route } from "react-router-dom"; 
import Login from "./pages/login";
import Homepage from "./pages/homepage";
import Register from "./pages/register";
import Signup from "./pages/signup";
import {Protect, PreventAuth} from './modules/auth';
import Layout from "./layout";

{/*Temp code for developing*/}
const PassThrough = ({ children }) => children;


function App() {
  return (
    <Routes>
      {/* Use this once the backend is live and delete the temp code 
      <Route element={<Layout/>}>
      <Route path="/" element={
        <Protect>
          <Homepage/>
        </Protect>} /> 
      </Route>*/}

      {/*Temp code remove this once the backend is live and uncomment the above code block*/}
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <PassThrough>
              <Homepage />
            </PassThrough>
          }
        />
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