import React, { useState, useContext } from 'react';
import '../src/Profile/Profile.css'; 
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from './App';
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from './firebase'; 
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, updatePassword } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { div } from "motion/react-client";
import { motion } from "motion/react";
import { Spinner } from "react-spinner-toolkit";

const ProfileScreen = () => {
  const { user, setUser, data, setData } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const initialPassword = ""; 
  const [name, setName] = useState(data.Name);
  const [newPassword, setNewPassword] = useState(initialPassword);
  const [confirmPassword, setConfirmPassword] = useState(initialPassword);  
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  // const [isNameSaved, setIsNameSaved] = useState(!!initialName);  
  const [isChangingPassword, setIsChangingPassword] = useState(false); 
    const [isLoading, setIsLoading] = useState(false);

const update = async (field, value) => {
  try {
     setIsLoading(true);
    const currentUser = doc(db, "Profile", data.id);
    await updateDoc(currentUser, { [field]: value });
    data.Name = value;
    setData(data);
    toast.success("Name Updated Successfully", { position: "top-center" });
    setName(value);
  } catch (error) {
    toast.error("Error updating :"+error, { position: "top-center"});
  }
   finally {
         setIsLoading(false);
    }
};

  const handleSaveName = () => {
    if (name.trim() === '') {
      setErrorMessage('Name cannot be empty');
    } else {
      setErrorMessage('');
      update("Name", name);
    }
  };
   
const handleSavePassword = async () => {
  if (newPassword === "" || confirmPassword === "") {
    setErrorMessage("Password fields cannot be empty");
    return;
  }
  if (newPassword !== confirmPassword) {
    setErrorMessage("Passwords do not match");
    return;
  }
  try {
    const auth = getAuth();
    const user1 = auth.currentUser; 
    if (!user1) {
      setErrorMessage("No authenticated user found");
      return;
    }
    await updatePassword(user1, newPassword);
    toast.success("Password Updated Successfully", { position: "top-center"});
    setNewPassword("");
    setConfirmPassword("");
  } catch (error) { {
      toast.error("Error updating password: " + error.message, { position: "top-center"});
    }
  }
};

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    setPasswordMatch(e.target.value === confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(e.target.value === newPassword);
  };

  const handleSignOut = () => {
    setUser(null);
    navigate('/Signin');
  };



const handleDeleteAccount = async () => { 
  try {
    await deleteDoc(doc(db, "Profile", data.id));
    toast.success("Account deleted successfully!", { position: "top-center"});
    setUser(null);
    navigate('/Signin');
  } catch (error) {
    toast.error("Error deleting account:"+error,{ position: "top-center"});
  }
};

  const handleToggleChangePassword = () => {
    setIsChangingPassword(!isChangingPassword);
    setErrorMessage(''); 
  };

  const getInitials = (name) => {
    return name ? name.charAt(0) : ' ';
  };
 return (
    <div className="profile-screen">
<motion.div
  className="profile-container"
  animate={{ y: isChangingPassword ? 70 : 0 }} 
  transition={{ type: "spring" }}
>
        <div className="profile-picture">
          {getInitials(name)}
        </div>
        <div className="form-container">
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <div className="form-group">
            <label>Edit Name</label>
            <motion.input
              type="text"
              placeholder="Name"
              value={name}
             onChange={(e) => setName(e.target.value)}
                 whileFocus={{scale:1.05}}
            />
            <motion.button whileTap={{scale:0.9}} whileHover={{scale:1.05}} onClick={handleSaveName}>Save</motion.button>
          </div>
          {isChangingPassword && (
            <div className="form-group">
              <label>Change Password</label>
              <motion.input
                type="password"
                placeholder="New Password"
                value={newPassword}
               onChange={handleNewPasswordChange}
                   whileFocus={{scale:1.05}}
              />
              {!passwordMatch && <div className="error-message">Passwords do not match</div>}
              <motion.input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
               onChange={handleConfirmPasswordChange}
                   whileFocus={{scale:1.05}}
              />
              <motion.button whileTap={{scale:0.9}} whileHover={{scale:1.05}} onClick={handleSavePassword} >Save</motion.button>
            </div>
          )}
          <motion.button  whileTap={{scale:0.9}} whileHover={{scale:1.05}}className="toggle-password-button" onClick={handleToggleChangePassword}>
            {isChangingPassword ? "Cancel" : "Change Password"}
          </motion.button>
          <motion.button whileTap={{scale:0.9}} whileHover={{scale:1.05}} className="sign-out-button" onClick={handleSignOut}>Sign Out</motion.button>
          <motion.button  whileTap={{scale:0.9}} whileHover={{scale:1.05}}className="delete-account-button" onClick={handleDeleteAccount}>Delete Account</motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileScreen;