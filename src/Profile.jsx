import React, { useState, useContext } from 'react';
import '../src/Profile/Profile.css'; 
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from './App';
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from './firebase'; // Import the Firestore instance
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, updatePassword } from "firebase/auth";

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

const update = async (field, value) => {
  try {
    const currentUser = doc(db, "Profile", data.id);
    await updateDoc(currentUser, { [field]: value });
    data.Name = value;
    setData(data);
    console.log(data);
    setName(value);
  } catch (error) {
    console.error("Error updating document:", error);
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
    alert("Password changed successfully!");
    setNewPassword("");
    setConfirmPassword("");
  } catch (error) { {
      alert("Error updating password: " + error.message);
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
    console.log("Account deleted successfully!");
    setUser(null);
    navigate('/Signin');
  } catch (error) {
    console.error("Error deleting account:", error);
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
      <div className="profile-container">
        <div className="profile-picture">
          {getInitials(name)}
        </div>
        <div className="form-container">
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <div className="form-group">
            <label>Edit Name</label>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button onClick={handleSaveName}>Save</button>
          </div>
          {isChangingPassword && (
            <div className="form-group">
              <label>Change Password</label>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={handleNewPasswordChange}
              />
              {!passwordMatch && <div className="error-message">Passwords do not match</div>}
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              <button onClick={handleSavePassword} >Save</button>
            </div>
          )}
          <button className="toggle-password-button" onClick={handleToggleChangePassword}>
            {isChangingPassword ? "Cancel" : "Change Password"}
          </button>
          <button className="sign-out-button" onClick={handleSignOut}>Sign Out</button>
          <button className="delete-account-button" onClick={handleDeleteAccount}>Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;