import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
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
            try {
                const querySnapshot = await getDocs(communityRef);
                const communityList = querySnapshot.docs.map(doc => ({
                    id: doc.id, 
                    name: doc.data().name
                }));
                communityList.sort((a, b) => a.name.localeCompare(b.name));
                setCommunities(communityList);
            } catch (error) {
                console.error("Error fetching communities:", error);
            }
        };

        fetchCommunities();
    }, []);

    const handleCreateCommunity = async () => {
        if (!roomName.trim()) {
            alert("Enter a valid community name");
            return;
        }

        try {
            const q = query(communityRef, where("name", "==", roomName));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                alert("Community already exists!");
                return;
            }

            if (!data?.Name) {
                alert("User data not loaded. Try again.");
                return;
            }

            await addDoc(communityRef, { name: roomName, creator: data.Name });
            setCommunities(prev => [...prev, { id: Date.now(), name: roomName }]);

            navigate(`/chat/${roomName}`);
        } catch (error) {
            console.error("Error creating community:", error);
            alert("Error creating community. Try again.");
        }
    };

    const handleJoinCommunity = () => {
        if (!roomName.trim()) {
            alert("Enter a community name");
            return;
        }

        const communityExists = communities.some(comm => comm.name === roomName);
        if (!communityExists) {
            alert("Community not found! Create it first.");
            return;
        }

        navigate(`/chat/${roomName}`);
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
    
                <h3>Available Communities:</h3>
                <ul>
                    {communities.map((comm) => (
                        <li key={comm.id} onClick={() => navigate(`/chat/${comm.name}`)} className="existing-comms">
                            {comm.name}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
