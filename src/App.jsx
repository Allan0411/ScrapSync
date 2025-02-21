import "./App.css";
import Signup from "./Authentication/Signup";
import Signin from "./Authentication/Signin";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./home";
import Navbar from "./Navbar";
import Profile from "./Profile";
import { useState,useEffect } from "react";
import { createContext } from "react";
import React from 'react'
import { getUser } from "./getUser";
export const AuthContext = createContext(null);
import Chat from './Chat';
import Community from './Community'
function Layout() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const location = useLocation();
  const hideNavbar = location.pathname === "/Signin" || location.pathname === "/Signup";
  useEffect(() => {
    if (user?.email) {
      getUser(user.email).then(setData);
    }
  }, [user]);


  return (
    <AuthContext.Provider value={{ user, setUser, data, setData }}>
      {!hideNavbar && <Navbar />}
      {/* <React.Suspense fallback={<p className="p">Loading...</p>}> */}
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/Home" : "/Signin"} />} />
        <Route path="/Signin" element={user ? <Navigate to="/Home" /> : <Signin setUser={setUser} />} />
        <Route path="/Signup" element={user ? <Navigate to="/Home" /> : <Signup />} />
        <Route path="/Home" element={user ? <Home /> : <Navigate to="/Signin" />} />
        <Route path="/Profile" element={user ? <Profile /> : <Navigate to="/Signin" />} />
        <Route path="/Community" element={user ? <Community /> : <Navigate to="/Signin" />} />
        <Route path="/chat/:roomName" element={user ? <Chat /> : <Navigate to="/Signin" />} />
     </Routes>
        {/* </React.Suspense> */}
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