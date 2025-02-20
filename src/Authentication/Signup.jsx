import React from "react";
import { useState } from "react";
import { app } from "../firebase"
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react"
import Profile from "../Profile";
import { Spinner } from "react-spinner-toolkit";
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
  const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const profileCollection = collection(db, "Profile");
    const [name, setName] = useState("");
const createUser = async () => { 
    try {
        setIsLoading(true);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await addDoc(profileCollection, {
            Name: name, // sname
            Email: email,
            Password: password, 
        });
        navigate("/Profile", {state:{password: password, name:name}});
    } catch (error) {
       alert("Error:"+error.message);
    }
    finally {
         setIsLoading(false);
    }
};

    return isLoading ? (
              <div className="spinner"> <Spinner
        size={80}
        color="#72bf78"
        loading={true}
        animationType="spin"
            shape="circle"
      /></div>
    ):(
    <div className="signup-page">
          <motion.form className="signup-content" onSubmit={(e) => { e.preventDefault(); createUser(); }}
          initial={{ opacity: 0, y: -50 }} 
                animate={{ opacity: 1, y: 0 }}  
                transition={{duration: 1.5}}> 
              <h1>Sign Up</h1>
              <div className="signup-name"> {/* sname */}
                 <input
                type="text"
                autoComplete="off"
                placeholder="Enter your name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                 required
  />
</div>
        <div className="signup-email">
            {/* <h3>Email</h3> */}
            <input type="email" autoComplete="off" placeholder="Enter your email id" 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                required 
            />
        </div>
        <div className="signup-password">
            {/* <h3>Password</h3> */}
            <input type="password" autoComplete="off" placeholder="Enter your password" 
                onChange={(e) => setPassword(e.target.value)} 
                value={password} 
                required 
            />
        </div>
        <button type="submit">Sign Up</button>
    </motion.form>
</div>

  )
}