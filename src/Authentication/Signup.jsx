import React from "react";
import { useState } from "react";
import { app } from "../firebase"
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react"
import Profile from "../Profile";
import { Spinner } from "react-spinner-toolkit";
import Hand from "../hand";
import { toast } from "react-toastify";
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
            Name: name, 
            Email: email,
            Password: password, 
            Points: 0,
        });
        navigate("/Profile", {state:{password: password, name:name}});
    } catch (error) {
       toast.error("Error:"+error.message, {position:"top-center"});
    }
    finally {
         setIsLoading(false);
    }
};

    return isLoading ? (
          <div className="spinner">
                    <Hand/>
            </div>
    ):(
    <div className="signup-page">
          <motion.form className="signup-content" onSubmit={(e) => { e.preventDefault(); createUser(); }}
          initial={{scale: 0 }} 
                    animate={{ scale: 1 }} 
               > 
              <h1>Sign Up</h1>
              <div className="signup-name">
                 <motion.input
                type="text"
                autoComplete="off"
                placeholder="Enter your name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                            required
                             whileFocus={{scale:1.05}}
  />
</div>
        <div className="signup-email">
           
            <motion.input type="email" autoComplete="off" placeholder="Enter your email id" 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                            required 
                           whileFocus={{scale:1.05}}
            />
        </div>
        <div className="signup-password">
           
            <motion.input type="password" autoComplete="off" placeholder="Enter your password" 
                onChange={(e) => setPassword(e.target.value)} 
                value={password} 
                            required 
                               whileFocus={{scale:1.05}}
            />
        </div>
        <motion.button type="submit" whileTap={{scale:0.9}} whileHover={{scale:1.1}} >Sign Up</motion.button>
    </motion.form>
</div>

  )
}