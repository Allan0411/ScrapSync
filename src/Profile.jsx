import React, { useState, useEffect, useContext } from 'react';
import '../src/Profile/Profile.css'; 
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from './App';
const ProfileScreen = () => {
  const { user, setUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const initialName = user?.name || "";
  const initialPassword = user?.password || ""; // Get initial name from state
  const [name, setName] = useState(initialName);
  const [newPassword, setNewPassword] = useState(initialPassword);
  const [confirmPassword, setConfirmPassword] = useState(initialPassword);  // Set initial password
  const [errorMessage, setErrorMessage] = useState('');
 const [passwordMatch, setPasswordMatch] = useState(true);
  const [isNameSaved, setIsNameSaved] = useState(!!initialName);  // Track if name is saved

  useEffect(() => {
    setConfirmPassword(newPassword);  // Synchronize confirm password with new password
  }, [newPassword]);

  const handleSaveName = () => {
    if (name.trim() === '') {
      setErrorMessage('Name cannot be empty');
    } else {
      setErrorMessage('');
      setIsNameSaved(true);  // Set name as saved
      console.log('Name saved:', name);
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
    // Perform delete account logic here
    console.log('Account deleted');
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
          <button className="sign-out-button" onClick={handleSignOut} disabled={!isNameSaved}>Sign Out</button>
          <button className="delete-account-button" onClick={handleDeleteAccount} disabled={!isNameSaved}>Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;