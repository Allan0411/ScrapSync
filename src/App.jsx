import "./App.css";
import Signup from "./Authentication/Signup";
import Signin from "./Authentication/Signin";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./home";
import Navbar from "./Navbar";
import Profile from "./Profile";
import { useState } from "react";
import { createContext } from "react";

export const AuthContext = createContext(null);
function Layout() {
  const [user, setUser] = useState(null); // Move useState here
  const location = useLocation();
  const hideNavbar = location.pathname === "/Signin" || location.pathname === "/Signup";

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/Home" : "/Signin"} />} />
        <Route path="/Signin" element={user ? <Navigate to="/Home" /> : <Signin setUser={setUser} />} />
        <Route path="/Signup" element={user ? <Navigate to="/Home" /> : <Signup />} />
        <Route path="/Home" element={user ? <Home /> : <Navigate to="/Signin" />} />
        <Route path="/Profile" element={user ? <Profile /> : <Navigate to="/Signin" />} />
      </Routes>
    </AuthContext.Provider>
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