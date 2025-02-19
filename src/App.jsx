import "./App.css";
import Signup from "./Authentication/Signup";
import Signin from "./Authentication/Signin";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./home";
function App() {

  return (
    <BrowserRouter>
      <Routes>
         <Route path="/" element={<Navigate to="/Signin" />} /> 
        <Route path="/Signin" element={<Signin />}></Route>
        <Route path="/Signup" element={<Signup />}></Route>
                   <Route path="/Home" element={<Home/>}></Route>
      </Routes>
    
    </BrowserRouter>
  );
}

export default App;
