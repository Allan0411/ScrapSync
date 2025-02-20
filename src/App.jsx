import "./App.css";
import Signup from "./Authentication/Signup";
import Signin from "./Authentication/Signin";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./home";
import Navbar from "./Navbar";
import Profile from "./Profile";
function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/Signin" || location.pathname === "/Signup";
  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/Signin" />} />
        <Route path="/Signin" element={<Signin />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Profile" element={<Profile />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
