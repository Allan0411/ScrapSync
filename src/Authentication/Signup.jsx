import React from "react";
import { useState } from "react";
import { app } from "../firebase"
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";


const auth = getAuth(app);
export default function () {
     const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const profileCollection = collection(db, "Profile");
    
const createUser = async () => { 
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await addDoc(profileCollection, {
            Email: email, 
            Password: password, 
        });

        navigate("/Home");
    } catch (error) {
        console.error("Error:", error.message);
    }
};


  return (
<div className="signup-page">
    <form className="signup-content" onSubmit={(e) => { e.preventDefault(); createUser(); }}>
        <h1>Sign Up</h1>
        <div className="signup-email">
            <h3>Email</h3>
            <input type="email" autoComplete="off" placeholder="Enter your email id" 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                required 
            />
        </div>
        <div className="signup-password">
            <h3>Password</h3>
            <input type="password" autoComplete="off" placeholder="Enter your password" 
                onChange={(e) => setPassword(e.target.value)} 
                value={password} 
                required 
            />
        </div>
        <button type="submit">Sign Up</button>
    </form>
</div>

  )
}
