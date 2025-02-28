import "./App.css";
import Signup from "./Authentication/Signup";
import Signin from "./Authentication/Signin";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./Home";
import Navbar from "./Navbar";
import Profile from "./Profile";
import { useState,useEffect } from "react";
import { createContext } from "react";
import React from 'react'
import { getUser } from "./getUser";
export const AuthContext = createContext(null);
import Chat from './Chat';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Hand from "./hand.jsx";
import MyProducts from "./MyProducts.jsx";
import ChatInbox from "./ChatInbox.jsx";
import Recycle from "./Recycle.jsx";
function Layout() {

  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true); 
  const location = useLocation();
  const hideNavbar = location.pathname === "/Signin" || location.pathname === "/Signup";

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.email) {
      getUser(user.email).then(setData);
    }
  }, [user]);

  if (loading) {
    return <div className="spinner"><Hand></Hand></div>; 
  }

  return (
    <AuthContext.Provider value={{ user, setUser, data, setData }}>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/Home" : "/Signin"} />} />
        <Route path="/Signin" element={user ? <Navigate to="/Home" /> : <Signin setUser={setUser} />} />
        <Route path="/Signup" element={user ? <Navigate to="/Home" /> : <Signup />} />
        <Route path="/Home" element={user ? <Home /> : <Navigate to="/Signin" />} />
        <Route path="/Profile" element={user ? <Profile /> : <Navigate to="/Signin" />} />
        <Route path="/chat/:roomName" element={user ? <Chat /> : <Navigate to="/Signin" />} />
        <Route path="/MyProducts" element={user ? <MyProducts /> : <Navigate to="/Signin" />} />
        <Route path="/ChatInbox" element={user ? <ChatInbox /> : <Navigate to="/Signin" />} />
        <Route path="/Recycle" element={user ? <Recycle /> : <Navigate to="/Signin" />} />
        
      </Routes>
    </AuthContext.Provider>
  );
}
function App() {
  return (
    <BrowserRouter>
      <Layout />
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;