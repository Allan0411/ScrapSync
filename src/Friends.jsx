import React, { useState, useEffect, useContext } from 'react';
import { db } from './firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { AuthContext } from "./App";
import { toast } from 'react-toastify';
import group from "/src/assets/group.png";
import group2 from "/src/assets/group2.png";
import group3 from "/src/assets/group3.png";
import friend from "/src/assets/friends.png"
export default function Friends() {
    const { user, data } = useContext(AuthContext);
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [friendEmail, setFriendEmail] = useState("");
    const [menuOpen, setMenuOpen] = useState(false); 

  useEffect(() => {
    if (!user || !data?.Email) return;  
    const fetchFriendData = async () => {
        try {
            const userRef = doc(db, "Friends", data.Email);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setFriends(userSnap.data().friends || []);
                setFriendRequests(userSnap.data().requests || []);
            }
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    };
    fetchFriendData();
}, [user, data]);  


    const handleAcceptFriendRequest = async (requesterEmail) => {
        try {
            const userRef = doc(db, "Friends", user.email);
            const requesterRef = doc(db, "Friends", requesterEmail);
    
            await updateDoc(userRef, {
                friends: arrayUnion(requesterEmail),
                requests: friendRequests.filter(email => email !== requesterEmail)
            });
    
            await updateDoc(requesterRef, {
                friends: arrayUnion(user.email)
            });
    
            setFriendRequests(prev => prev.filter(email => email !== requesterEmail));
            setFriends(prev => [...prev, requesterEmail]);
    
            toast.success(`You are now friends with ${requesterEmail}!`);
        } catch (error) {
            console.error("Error accepting friend request:", error);
            toast.error("Failed to accept friend request.");
        }
    };
    

    const handleRejectFriendRequest = async (requesterEmail) => {
        try {
            const userRef = doc(db, "Friends", user.email);
            await updateDoc(userRef, {
                requests: friendRequests.filter(email => email !== requesterEmail)
            });
            setFriendRequests(prev => prev.filter(email => email !== requesterEmail));
            toast.info(`Friend request from ${requesterEmail} rejected.`);
        } catch (error) {
            toast.error("Failed to reject friend request.");
        }
    };

    const handleSendFriendRequest = async () => {
        if (!friendEmail.trim()) {
            toast.warning("Enter a valid email.");
            return;
        }
        if (friendEmail === user.email) {
            toast.warning("You cannot send a request to yourself.");
            return;
        }
        try {
            const friendRef = doc(db, "Friends", friendEmail);
            const friendSnap = await getDoc(friendRef);
            if (!friendSnap.exists()) {
                await setDoc(friendRef, { friends: [], requests: [user.email] });
            } else {
                await updateDoc(friendRef, { requests: arrayUnion(user.email) });
            }
            toast.success("Friend request sent!");
            setFriendEmail("");
        } catch (error) {
            toast.error("Failed to send friend request.");
        }
    };

    const handleRemoveFriend = async (friendEmail) => {
        try {
            const userRef = doc(db, "Friends", user.email);
            const friendRef = doc(db, "Friends", friendEmail);
    
            await updateDoc(userRef, { friends: arrayRemove(friendEmail) })
                .catch(err => console.error("User update failed:", err));
    
            await updateDoc(friendRef, { friends: arrayRemove(user.email) })
                .catch(err => console.error("Friend update failed:", err));
    
            setFriends(prev => prev.filter(email => email !== friendEmail));
            toast.success(`Removed ${friendEmail} from your friends.`);
        } catch (error) {
            console.error("Error removing friend:", error);
            toast.error("Failed to remove friend.");
        }
    };
    

    return (
        <div className='friends-external'>
        <div className="friends-container">
            <h2>Friend Requests</h2>
            {friendRequests.length > 0 ? (
                <ul  className='friends-ul'>
                    {friendRequests.map((email, index) => (
                        <li key={index}>
                            {email}
                            <button onClick={() => handleAcceptFriendRequest(email)}>✅ Accept</button>
                            <button onClick={() => handleRejectFriendRequest(email)}>❌ Reject</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className='no friend'>No friend requests.</p>
            )}

            <h2 className='friends-list'>Friends List</h2>
            {friends.length > 0 ? (
                <ul>
                    {friends.map((email, index) => (
                        <li key={index} className="friend-item">
                            
                            <div className="menu-container">
                            {email}
                                <button className="menu-btn" onClick={() => setMenuOpen(menuOpen === email ? false : email)}>⋮</button>
                                {menuOpen === email && (
                                    <div className="menu-dropdown">
                                        <button className="leave-btn" onClick={() => handleRemoveFriend(email)}>❌ Remove Friend</button>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No friends added yet.</p>
            )}

            <h2 className='add-friend'>Add Friend</h2>
            <button onClick={() => setShowAddFriend(!showAddFriend)}>➕ Add Friend</button>
            {showAddFriend && (
                <div>
                    <input
                        type="email"
                        value={friendEmail}
                        onChange={(e) => setFriendEmail(e.target.value)}
                        placeholder="Enter friend's email"
                    />
                    <button onClick={handleSendFriendRequest}>📩 Send Request</button>
                </div>
            )}

         
            </div>
           
            <img src={group} alt="Friends" className="friend-img" />
    
     
            
            </div>
    );
}
