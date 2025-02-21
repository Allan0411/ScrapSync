import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, arrayUnion, getDoc, doc, setDoc } from 'firebase/firestore';
import './Community.css';
import { AuthContext } from "./App";

export default function Community() {
    const [roomName, setRoomName] = useState("");
    const [communities, setCommunities] = useState([]);
    const navigate = useNavigate(); 
    const { user, data } = useContext(AuthContext);
    const communityRef = collection(db, "Community");

    useEffect(() => {
        const fetchCommunities = async () => {
            if (!user?.uid) return;
    
            try {
                const userRef = doc(db, "Profile", data.id);
                const userSnap = await getDoc(userRef);
    
                if (!userSnap.exists()) {
                    console.log("User profile not found, creating new profile...");
                    await setDoc(userRef, { joinedCommunities: [] });
                    return;
                }
    
                const userData = userSnap.data();
                let userJoinedCommunities = userData.joinedCommunities || [];
    
                // Fetch all existing community names from Firestore
                const querySnapshot = await getDocs(collection(db, "Community"));
                const existingCommunities = querySnapshot.docs.map(doc => doc.id); // All community names from Firestore
    
                // Filter out communities that don't exist in Firestore
                const validCommunities = userJoinedCommunities.filter(name => existingCommunities.includes(name));
    
                if (validCommunities.length !== userJoinedCommunities.length) {
                    // Update user's profile with the corrected list
                    await updateDoc(userRef, { joinedCommunities: validCommunities });
                    console.log("Removed non-existent communities from joined list.");
                }
                setCommunities(validCommunities.map(name => ({ name })));
            } catch (error) {
                console.error("Error fetching communities:", error);
            }
        };
    
        fetchCommunities();
    }, [user]);
    
    const handleCreateCommunity = async () => {
        if (!roomName.trim()) {
            alert("Enter a valid community name");
            return;
        }
        try {
            const communityDocRef = doc(db, "Community", roomName); // Set document ID as roomName
            const communitySnap = await getDoc(communityDocRef);
    
            if (communitySnap.exists()) {
                alert("Community already exists!");
                return;
            }

            if (!data?.Name) {
                alert("User data not loaded. Try again.");
                return;
            }
            await setDoc(communityDocRef, { name: roomName, creator: data.Name });
    
            const userRef = doc(db, "Profile", data.id);
            await updateDoc(userRef, {
                joinedCommunities: arrayUnion(roomName)
            });
    
            setCommunities(prev => [...prev, { name: roomName }]);
            navigate(`/chat/${roomName}`);
        } catch (error) {
            console.error("Error creating community:", error);
            alert("Error creating community. Try again.");
        }
    };
    
    const handleJoinCommunity = async () => {
        if (!roomName.trim()) {
            alert("Enter a community name");
            return;
        }

        if (!user?.uid) {
            alert("User not authenticated");
            return;
        }

        try {
            const userRef = doc(db, "Profile", data.id);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                alert("User profile not found, creating one...");
                await setDoc(userRef, { joinedCommunities: [roomName] });
                setCommunities([{ name: roomName }]);
            } else {
                const userData = userSnap.data();
                if (userData.joinedCommunities?.includes(roomName)) {
                    alert("Already joined this room.");
                    return;
                }

                await updateDoc(userRef, {
                    joinedCommunities: arrayUnion(roomName)
                });

                setCommunities(prev => [...prev, { name: roomName }]);
            }

            alert(`Successfully joined ${roomName}`);
        } catch (error) {
            console.error("Error joining group:", error);
            alert("Error joining the community");
        }  
    };

    const handleCheckCommunities= async ()=>{

    };


    return (
        <div className="community-container">
            <div className="room">
                <label>Enter Community Name: </label>
                <input 
                    value={roomName} 
                    onChange={(e) => setRoomName(e.target.value)} 
                    placeholder="Enter or search community..."
                />
                <button type="button" onClick={handleJoinCommunity}>Join Community</button>
                <button type="button" onClick={handleCreateCommunity}>Create Community</button>
                <button type="button" >Check Communities</button>

                <h3>Joined Communities:</h3>
                {communities.length > 0 ? (
                    <ul>
                        {communities.map((comm, index) => (
                            <li key={index} onClick={() => navigate(`/chat/${comm.name}`)} className="existing-comms">
                                {comm.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No communities joined yet.</p>
                )}
            </div>
        </div>
    );
}
