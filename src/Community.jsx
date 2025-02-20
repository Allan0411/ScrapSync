import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, setDoc} from 'firebase/firestore';
import './Community.css';
import {getUser} from "./getUser";

export default function Community() {
    const [roomName, setRoomName] = useState("");
    const [communities, setCommunities] = useState([]);
    const navigate = useNavigate(); // Hook for navigation

    const communityRef = collection(db, "Community");

    useEffect(() => {
        const fetchCommunities = async () => {
            const querySnapshot = await getDocs(communityRef);
            const communityList = querySnapshot.docs.map(doc => doc.data().name);
            setCommunities(communityList);
        };
        fetchCommunities();
    }, []);

    const handleCreateCommunity = async () => {
        if (roomName.trim() === "") return alert("Enter a valid community name");

        // Check if community already exists
        const q = query(communityRef, where("name", "==", roomName));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            alert("Community already exists!");
            return;
        }

        await addDoc(communityRef, { name: roomName });
        setCommunities(prev => [...prev, roomName]);

        // Redirect to Chat Page
        navigate(`/chat/${roomName}`);
    };

    const handleJoinCommunity = () => {
        if (roomName.trim() === "") return alert("Enter a community name");

        if (!communities.includes(roomName)) {
            alert("Community not found! Create it first.");
            return;
        }

        // Redirect to Chat Page
        navigate(`/chat/${roomName}`);
    };

    return (
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
            <ul className="existing-comms">
                {communities.map((comm, index) => (
                    <li key={index} onClick={() => navigate(`/chat/${comm}`)}>{comm}</li>
                ))}
            </ul>
        </div>
    );
}
