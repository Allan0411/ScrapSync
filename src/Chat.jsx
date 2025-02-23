import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, query, orderBy, onSnapshot, getDoc, doc, where, updateDoc, arrayRemove, addDoc, serverTimestamp } from "firebase/firestore";
import "./Chat.css";
import { AuthContext } from "./App";
import { motion } from "motion/react";
import Trophy from "./Trophy";
import completedTask from "/src/assets/completedTask.png";
export default function Chat() {
    const { roomName } = useParams();  
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [leaderboard, setLeaderboard] = useState([]);
    const [currentView, setCurrentView] = useState("chat"); // "chat" or "leaderboard"
    const [menuOpen, setMenuOpen] = useState(false); // State for menu toggle
    const navigate = useNavigate();

    const chatRef = collection(db, "Community", roomName, "Chat");
    const { user, data } = useContext(AuthContext);

    useEffect(() => {
        if (currentView === "chat") {
            const q = query(chatRef, orderBy("timestamp", "asc"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });
            return () => unsubscribe();
        }
    }, [roomName, currentView]);

    const handleSendMessage = async () => {
        if (message.trim() === "") return;
        
        await addDoc(chatRef, {
            text: message,
            sender: data.Name,  
            timestamp: serverTimestamp(),
        });

        setMessage("");
    };

    const handleLeaveCommunity = async () => {
        if (!user?.uid) {
            alert("User not authenticated");
            return;
        }

        try {
            const userRef = doc(db, "Profile", data.id);
            await updateDoc(userRef, {
                joinedCommunities: arrayRemove(roomName)
            });

            alert(`You have left ${roomName}`);
            navigate("/community");
        } catch (error) {
            console.error("Error leaving community:", error);
            alert("Failed to leave the community");
        }
    };

    const fetchLeaderboard = async () => {
        try {
            // Fetch community details to get the habit field
            const communityDoc = await getDoc(doc(db, "Community", roomName));
            if (!communityDoc.exists()) {
                console.error("Community not found");
                return;
            }
            const communityHabit = communityDoc.data().habit;

            // Fetch all profiles who joined the community
            const profilesRef = collection(db, "Profile");
            const q = query(profilesRef, where("joinedCommunities", "array-contains", roomName));
            const snapshot = await onSnapshot(q, (snapshot) => {
                const profiles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

                // Fetch habits for each user and match with the community's habit
                const leaderboardData = [];
                profiles.forEach(async (profile) => {
                    const habitsRef = collection(db, "habits");
                    const habitsQuery = query(habitsRef, where("creator", "==", profile.id));
                    const habitsSnapshot = await onSnapshot(habitsQuery, (habitSnapshot) => {
                        habitSnapshot.docs.forEach((habitDoc) => {
                            const habit = habitDoc.data();
                            if (habit.name === communityHabit) {
                                leaderboardData.push({
                                    name: profile.Name,
                                    streak: habit.streak,
                                });
                            }
                        });
                        setLeaderboard(leaderboardData);
                    });
                });
            });
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        }
    };

    useEffect(() => {
        if (currentView === "leaderboard") {
            fetchLeaderboard();
        }
    }, [currentView]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2 className="chat_title">Welcome to {roomName}</h2>

                {/* Navigation Buttons */}
                <div className="view-buttons">
                    <motion.button 
                         whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
                        className={`view-btn ${currentView === "chat" ? "active" : ""}`}
                        onClick={() => setCurrentView("chat")}
                    >
                        Chat
                    </motion.button>
                    <motion.button 
                         whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
                        className={`view-btn ${currentView === "leaderboard" ? "active" : ""}`}
                        onClick={() => setCurrentView("leaderboard")}
                    >
                        Leaderboard
                    </motion.button>
                </div>

                {/* Three-dot menu */}
                <div className="menu-container">
                    <motion.button  whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>⋮</motion.button>
                    {menuOpen && (
                        <div className="menu-dropdown">
                            <motion.button  whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} className="leave-btn" onClick={handleLeaveCommunity}>Leave Community</motion.button>
                        </div>
                    )}
                </div>
            </div>

            {currentView === "chat" ? (
                <>
                    {/* Chat Messages */}
                    <div className="chat-box">
                        {messages.map((msg, i) => (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: i*0.8 }} key={msg.id}><strong>{msg.sender}: </strong>{msg.text}</motion.p>
                        ))}
                    </div>

                    {/* Input for sending messages */}
                    <div className="input-container">
                        <input 
                            type="text" 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)} 
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                        />
                        <motion.button  whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={handleSendMessage}>Send</motion.button>
                    </div>
                </>
            ) : (
<div className="leaderboard-container">
  <div className="leaderboard-col">
    <div className="trophy">
      <h3>Leaderboard</h3> 
      <Trophy />
    </div>
    <ul className="leaderboard">
      {leaderboard.map((entry, index) => (
    <li key={index} className="leaderboard-li">
    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""} 
    <strong>{entry.name}</strong>: {entry.streak} days
</li>

      ))}
    </ul>
                        </div>
                      <div className="svg-div">
<img src={completedTask} alt="Completed Task" className="leaderboard-svg" />
</div>
</div>

            )}
        </div>
    );
}
