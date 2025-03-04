import React, { useState, useContext, useEffect } from 'react';
import '../src/Profile/Profile.css'; 
import { useNavigate } from "react-router-dom";
import { AuthContext } from './App';
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from './firebase'; 
import { getAuth, updatePassword, signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from "framer-motion";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; 
import Hand from './hand';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
const ProfileScreen = () => {
  const { user, setUser, data, setData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
    const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [document, setDocument] = useState(null);
  
  const auth = getAuth();
useEffect(() => {
  if (data && data.Name) {
    setTimeout(() => {
      setName(data.Name);
      setLoading(false);
    }, 1000);
  } else {
    setLoading(false); 
  }
}, [data]);

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
      toast.error("Error updating: " + error, { position: "top-center" });
    } finally {
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
      const user1 = auth.currentUser;
      if (!user1) {
        setErrorMessage("No authenticated user found");
        return;
      }
      await updatePassword(user1, newPassword);
      toast.success("Password Updated Successfully", { position: "top-center" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Error updating password: " + error.message, { position: "top-center" });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/Signin");
    } catch (error) {
      toast.error("Error signing out: " + error, { position: "top-center" });
    }
  };


const handleDeleteAccount = () => {
  confirmAlert({
    title: "Confirm Deletion",
    message: "Are you sure you want to delete your account?",
    buttons: [
      {
        label: "Yes",
        onClick: async () => {
          try {
            if (!user) return;
            
            const user1 = auth.currentUser;
            if (!user1) {
              toast.error("No authenticated user found.", { position: "top-center" });
              return;
            }

            const password = prompt("Please enter your password to confirm deletion:");
            if (!password) {
              toast.error("Password is required to delete account.", { position: "top-center" });
              return;
            }

            // Reauthenticate the user
            const credential = EmailAuthProvider.credential(user1.email, password);
            await reauthenticateWithCredential(user1, credential);

            // Proceed with deletion
            await deleteDoc(doc(db, "Profile", data.id));
            await deleteUser(user1);
            
            toast.success("Account deleted successfully!", { position: "top-center" });
            setUser(null);
            navigate("/Signin");
          } catch (error) {
            toast.error("Error deleting account: " + error.message, { position: "top-center" });
          }
        }
      },
      {
        label: "No",
        onClick: () => console.log("Deletion canceled")
      }
    ]
  });
};


  const handleToggleChangePassword = () => {
    setIsChangingPassword(!isChangingPassword);
    setErrorMessage('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `profile_pictures/${user.uid}`);
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setImageUrl(downloadURL);
      update("ProfilePicture", downloadURL);
    } catch (error) {
      toast.error("Error uploading image: " + error.message, { position: "top-center" });
    }
  };

  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setDocument(file);
};

  const handleDocumentUpload = async (e) => {
    if (setDocument) {
      toast.success("Document Sent For Verification");
      setDocument('');
    }
    else {
            toast.success("Error");
    }
    // const file = e.target.files[0];
    // if (!file) return;

    // const storageRef = ref(storage, `documents/${user.uid}/${file.name}`);
    // try {
    //   await uploadBytes(storageRef, file);
    //   const downloadURL = await getDownloadURL(storageRef);
    //   setDocument(downloadURL);
    //   update("Document", downloadURL);
    // } catch (error) {
    //   toast.error("Error uploading document: " + error.message, { position: "top-center" });
    // }
  };
  const getInitials = (name) => {
    return name ? name.charAt(0) : ' ';
  };

  if (loading) {
    return (

  <div className="spinner"><Hand></Hand></div>

    );
  }

  return (
    <motion.div className="profile-screen" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: 2 }}>
      <motion.div className="profile-container" animate={{ y: isChangingPassword ? 130 : 10 }}>
        <div className="profile-picture">{getInitials(name)}</div>
        <div className="form-container">
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <div className="form-group">
            <label>Edit Name</label>
            <motion.input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              whileFocus={{ scale: 1.05 }}
            />
            <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={handleSaveName}>
              Save
            </motion.button>
          </div>
          {isChangingPassword && (
            <div className="form-group">
              <label>Change Password</label>
              <motion.input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                whileFocus={{ scale: 1.05 }}
              />
              {!passwordMatch && <div className="error-message">Passwords do not match</div>}
              <motion.input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                whileFocus={{ scale: 1.05 }}
              />
              <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={handleSavePassword}>
                Save
              </motion.button>
            </div>
          )}
          <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="toggle-password-button" onClick={handleToggleChangePassword}>
            {isChangingPassword ? "Cancel" : "Change Password"}
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="sign-out-button" onClick={handleSignOut}>
            Sign Out
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="delete-account-button" onClick={handleDeleteAccount}>
            Delete Account
          </motion.button>
        <div className="form-group">
  <label className='upload'>Upload Document</label>
  <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
  <motion.button 
    whileTap={{ scale: 0.9 }} 
    whileHover={{ scale: 1.05 }} 
    onClick={handleDocumentUpload}
  >
    Upload
  </motion.button>
</div>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileScreen;