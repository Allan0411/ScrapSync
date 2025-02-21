import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayRemove } from "firebase/firestore";
import "./Chat.css";
import { AuthContext } from "./App";

export default function Chat() {
    const { roomName } = useParams();  
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);  // State for menu toggle
    const navigate = useNavigate();

    const chatRef = collection(db, "Community", roomName, "Chat");
    const { user, data } = useContext(AuthContext);

    useEffect(() => {
        const q = query(chatRef, orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, [roomName]);

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

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2 className="chat_title">Welcome to {roomName}</h2>

                {/* Three-dot menu */}
                <div className="menu-container">
                    <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>⋮</button>
                    {menuOpen && (
                        <div className="menu-dropdown">
                            <button class="leave-btn" onClick={handleLeaveCommunity}>Leave Group</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Messages */}
            <div className="chat-box">
                {messages.map((msg) => (
                    <p key={msg.id}><strong>{msg.sender}: </strong>{msg.text}</p>
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
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
}
