import React from "react";
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "motion/react"
const auth = getAuth(app);

export default function Sign() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

 const navigate = useNavigate();
    const signinUser=() => {
        signInWithEmailAndPassword(auth, email, password).then(value => navigate("/Home")
        ).catch(err => console.log(err));
    }
    return (
      
        <div className="signin-page" 
     
>
            <motion.form className="signin-content" onSubmit={(e) => {
                e.preventDefault(); signinUser();

            }} initial={{ opacity: 0, y: -50 }} 
                animate={{ opacity: 1, y: 0 }}  
                transition={{duration: 1.75}}>  
                                <h1>Sign In</h1>
        <div className="signin-email">
            {/* <h3>Email</h3> */}
            <input type="email" autoComplete="off" placeholder="Enter your email id" 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                required 
            />
        </div>
        <div className="signin-password">
            {/* <h3>Password</h3> */}
            <input type="password" autoComplete="off" placeholder="Enter your password" 
                onChange={(e) => setPassword(e.target.value)} 
                value={password} 
                required 
            />
        </div>
              <button type="submit">Sign In</button>
                   <p>
                Don't have an account? <Link to="/Signup" className="signup-link">Sign Up</Link>
                    </p>
          </motion.form>
     
    </div>
  )
}
