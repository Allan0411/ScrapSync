import React, { useContext, useEffect, useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { AuthContext } from "../App";
import { div } from "motion/react-client";
import { Spinner } from "react-spinner-toolkit";
const auth = getAuth(app);

export default function Signin({ setUser }) {  
    const { user } = useContext(AuthContext);  
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
 
    useEffect(() => {
        if (user) {
            navigate('/Home', { replace: true });
        }
    }, [user, navigate]);
const signinUser = () => {
c
    signInWithEmailAndPassword(auth, email, password)
        .then(value => {
            setUser(value.user);
            console.log(value.user);
            navigate("/Home");
        })
        .catch(err => console.log(err))
        .finally(() => setIsLoading(false));
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
        <div className="signin-page">
            <motion.form className="signin-content"  onSubmit={(e) => {
                e.preventDefault();
                signinUser();
            }} initial={{ opacity: 0, y: -50 }} 
                animate={{ opacity: 1, y: 0 }}  
                transition={{duration: 1.75}} >  
                <h1>Sign In</h1>
                <div className="signin-email">
                    <input type="email" autoComplete="off" placeholder="Enter your email id" 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email} 
                        required 
                    />
                </div>
                <div className="signin-password">
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
    );
}