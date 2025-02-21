import React, { useContext, useEffect, useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { AuthContext } from "../App";
import { div } from "motion/react-client";
import { Spinner } from "react-spinner-toolkit";
import Hand from "../hand";
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
setIsLoading(true);
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
        // <div className="spinner"> <Spinner
        // size={80}
        // color="#72bf78"
        // loading={true}
        // animationType="spin"
        //     shape="circle"
        //   /></div>
        <div className="spinner">
<Hand/>

            </div>
        ):(
        <div className="signin-page">
            <motion.form className="signin-content"  onSubmit={(e) => {
                e.preventDefault();
                signinUser();
            }} initial={{scale: 0 }} 
                    animate={{ scale: 1 }}   
                >  
                <h1>Sign In</h1>
                <div className="signin-email">
                    <motion.input type="email" autoComplete="off" placeholder="Enter your email id" 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email} 
                            required 
                               whileFocus={{scale:1.05}}
                    />
                </div>
                <div className="signin-password">
                    <motion.input type="password" autoComplete="off" placeholder="Enter your password" 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password} 
                            required 
                               whileFocus={{scale:1.05}}
                    />
                </div>
                <motion.button type="submit"  whileTap={{scale:0.9}} whileHover={{scale:1.05}}>Sign In</motion.button>
                <p>
                    Don't have an account? <Link to="/Signup" className="signup-link">Sign Up</Link>
                </p>
            </motion.form>
        </div>
    );
}