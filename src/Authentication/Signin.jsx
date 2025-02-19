import React from "react";
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase";

const auth = getAuth(app);

export default function Sign() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signinUser=() => {
        signInWithEmailAndPassword(auth, email, password).then(value => console.log("Signin Success")
        ).catch(err => console.log(err));
    }
  return (
    <div className="signin-page">
     <form className="signin-content" onSubmit={(e) => { e.preventDefault(); signinUser(); }}>
        <h1>Sign In</h1>    
        <div className="signin-email">
            <h3>Email</h3>
            <input type="email" autoComplete="off" placeholder="Enter your email id" 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                required 
            />
        </div>
        <div className="signin-password">
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
