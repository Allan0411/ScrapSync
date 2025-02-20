import React, { useState, useContext } from 'react';
import '../src/Profile/Profile.css'; 
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from './App';
import { doc, updateDoc } from "firebase/firestore";
import { db } from './firebase'; // Import the Firestore instance

const ProfileScreen = () => {
  const { user, setUser } = useContext(AuthContext);
  
  const location = useLocation();
  const navigate = useNavigate();
  const initialName = user?.name || ""; 
  const initialPassword = ""; 
  const [name, setName] = useState(initialName);
  const [newPassword, setNewPassword] = useState(initialPassword);
  const [confirmPassword, setConfirmPassword] = useState(initialPassword);  
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isNameSaved, setIsNameSaved] = useState(!!initialName);  
  const [isChangingPassword, setIsChangingPassword] = useState(false); 

  const update = async (field, value) => {
    if (!user) {
      setErrorMessage('User is not available');
      return;
    }
  
    try {
      const userRef = doc(db, "users", user.uid); // Reference to the user document
      await updateDoc(userRef, { [field]: value }); // Update the specified field in Firestore
      setUser({ ...user, [field]: value });  // Update the user in the context
      console.log(${field} updated:, value);
      if (field === 'name') setIsNameSaved(true);
    } catch (error) {
      console.error(Error updating ${field}:, error);
      setErrorMessage(Failed to update ${field});
    }
  };
  
  // Update the handleSaveName function
  const handleSaveName = () => {
    if (name.trim() === '') {
      setErrorMessage('Name cannot be empty');
    } else {
      setErrorMessage('');
      update("name", name);
    }
  };
  
  

  const handleSavePassword = () => {
    if (!isNameSaved) {
      setErrorMessage('Please enter and save your name first');
      return;
    }
    if (newPassword === confirmPassword) {
      setErrorMessage('');
      console.log('Password changed');
    } else {
      setErrorMessage('Passwords do not match');
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
    if (!isNameSaved) {
      setErrorMessage('Please enter and save your name first');
      return;
    }
    navigate('/signin'); // Redirect to the sign-in page
  };

  const handleDeleteAccount = () => {
    if (!isNameSaved) {
      setErrorMessage('Please enter and save your name first');
      return;
    }
    console.log('Account deleted');
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
              <button onClick={handleSavePassword} disabled={!isNameSaved}>Save</button>
            </div>
          )}
          <button className="toggle-password-button" onClick={handleToggleChangePassword}>
            {isChangingPassword ? "Cancel" : "Change Password"}
          </button>
          <button className="sign-out-button" onClick={handleSignOut} disabled={!isNameSaved}>Sign Out</button>
          <button className="delete-account-button" onClick={handleDeleteAccount} disabled={!isNameSaved}>Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;