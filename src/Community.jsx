import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, arrayUnion, getDoc, doc, setDoc,query,where } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Community.css';
import { AuthContext } from "./App";

export default function Community() {
    const [roomName, setRoomName] = useState("");
    const [communities, setCommunities] = useState([]);
    const [allCommunities, setAllCommunities] = useState([]); // Store all communities
    const [showDropdown, setShowDropdown] = useState(false); // Toggle dropdown
    const navigate = useNavigate(); 
    const { user, data } = useContext(AuthContext);

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
    
                const querySnapshot = await getDocs(collection(db, "Community"));
                const existingCommunities = querySnapshot.docs.map(doc => doc.id);
    
                const validCommunities = userJoinedCommunities.filter(name => existingCommunities.includes(name));
    
                if (validCommunities.length !== userJoinedCommunities.length) {
                    await updateDoc(userRef, { joinedCommunities: validCommunities });
                    console.log("Removed non-existent communities from joined list.");
                }
                setCommunities(validCommunities.map(name => ({ name })));
            } catch (error) {
                console.error("Error fetching communities:", error);
                toast.error("Failed to fetch communities.");
            }
        };
    
        fetchCommunities();
    }, [user]);

    const handleCreateCommunity = async () => {
        if (!roomName.trim()) {
            toast.warning("Enter a valid community name.");
            return;
        }
        try {
            const communityDocRef = doc(db, "Community", roomName);
            const communitySnap = await getDoc(communityDocRef);
    
            if (communitySnap.exists()) {
                toast.info("Community already exists!");
                return;
            }

            if (!data?.Name) {
                toast.error("User data not loaded. Try again.");
                return;
            }

            const habit=prompt("Enter habit");
            if(!habit)return;

            const habitsCollection = collection(db, "habits");
        const habitQuery = query(habitsCollection, 
            where("creator", "==", data.id), 
            where("name", "==", habit)
        );
        const habitSnapshot = await getDocs(habitQuery);

        if (habitSnapshot.empty) {
            
            const habitRef = doc(habitsCollection);
            await setDoc(habitRef, {
                creator: data.id,
                name: habit,
                lastCompletedDate: null,
                streak: 0
            });
            toast.success(`Habit "${habit}" added successfully!`);
        } else {
            toast.info("Habit already exists.");
        }



            await setDoc(communityDocRef, { name: roomName, creator: data.Name, habit:habit },{merge:true});
    
            const userRef = doc(db, "Profile", data.id);
            await updateDoc(userRef, {
                joinedCommunities: arrayUnion(roomName)
            });

            
            
            setCommunities(prev => [...prev, { name: roomName }]);
            toast.success(`Community "${roomName}" created successfully!`);
            navigate(`/chat/${roomName}`);
        } catch (error) {
            console.error("Error creating community:", error);
            toast.error("Error creating community. Try again.");
        }
    };

    const handleJoinCommunity = async () => {
        if (!roomName.trim()) {
            toast.warning("Enter a community name.");
            return;
        }
    
        if (!user?.uid) {
            toast.error("User not authenticated.");
            return;
        }
    
        try {
            const communityDocRef = doc(db, "Community", roomName);
            const communitySnap = await getDoc(communityDocRef);
    
            if (!communitySnap.exists()) {
                toast.warning("Community does not exist!");
                return;
            }
    
            const userRef = doc(db, "Profile", data.id);
            const userSnap = await getDoc(userRef);
    
            if (!userSnap.exists()) {
                toast.info("User profile not found, creating one...");
                await setDoc(userRef, { joinedCommunities: [roomName] });
                setCommunities([{ name: roomName }]);
            } else {
                const userData = userSnap.data();
                if (userData.joinedCommunities?.includes(roomName)) {
                    toast.info("Already joined this room.");
                    return;
                }
    
                await updateDoc(userRef, {
                    joinedCommunities: arrayUnion(roomName)
                });

                const commHabit=communitySnap.data()?.habit;
                const habitsCollection = collection(db, "habits");
                const habitQuery = query(habitsCollection, 
                    where("creator", "==", data.id), 
                    where("name", "==", commHabit)
                );
                const habitSnapshot = await getDocs(habitQuery);
        
                if (habitSnapshot.empty) {
                    
                    const habitRef = doc(habitsCollection);
                    await setDoc(habitRef, {
                        creator: data.id,
                        name: commHabit,
                        lastCompletedDate: null,
                        streak: 0
                    });
                    toast.success(`Habit "${commHabit}" added successfully!`);
                } else {
                    toast.info("Habit already exists.");
                }

                setCommunities(prev => [...prev, { name: roomName }]);
            }
    
            toast.success(`Successfully joined "${roomName}"!`);
        } catch (error) {
            console.error("Error joining group:", error);
            toast.error("Error joining the community.");
        }  
    };
    

    const handleCheckCommunities = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "Community"));
            const communityList = querySnapshot.docs.map(doc => doc.id);
            setAllCommunities(communityList);
            setShowDropdown(!showDropdown);
        } catch (error) {
            console.error("Error fetching community list:", error);
            toast.error("Failed to fetch community list.");
        }
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
                <button type="button" onClick={handleCheckCommunities}>
                    {showDropdown ? "Hide Communities" : "Check Communities"}
                </button>
                <button type="button" onClick={() => navigate("/friends")}>
                Friend List
            </button>
                {showDropdown && (
                    <select
                        className="community-dropdown"
                        onChange={(e) => setRoomName(e.target.value)}
                        value={roomName}
                    >
                        <option value="" disabled>Select a community</option>
                        {allCommunities.map((comm, index) => (
                            <option key={index} value={comm}>{comm}</option>
                        ))}
                    </select>
                )}

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
