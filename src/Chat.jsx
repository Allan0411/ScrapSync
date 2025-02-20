import { useState, useEffect,useContext } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import "./Chat.css"
import {getUser} from "./getUser";
import { AuthContext } from "./App";

export default function Chat() {
    const { roomName } = useParams();  // Get the community name from the URL
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
  
    // Reference to the "Chat" subcollection inside the specific Community
    const chatRef = collection(db, "Community", roomName, "Chat");
    const {user,data}=useContext(AuthContext);
    // Fetch messages in real-time
    useEffect(() => {
        const q = query(chatRef, orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();  // Cleanup on unmount
    }, [roomName]);

    // Function to send messages
    const handleSendMessage = async () => {
        if (message.trim() === "") return;
        
        await addDoc(chatRef, {
            text: message,
            sender: data.Name,  // Replace with the actual user ID
            timestamp: serverTimestamp(),
        });

        setMessage("");  // Clear input after sending
    };

    const handleKeyDown=(e)=>{
        if(e.key=="Enter"){
            handleSendMessage();
        }
    }
    return (
        <div>
            <h2 className="chat_title">Welcome to {roomName}</h2>

            {/* Chat Messages */}
            <div className="chat-box">
                {messages.map((msg) => (
                    <p key={msg.id}><strong>{msg.sender}: </strong>{msg.text} </p>
                
                ))}
            </div>

            {/* Input for sending messages */}
            <input 
                type="text" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
}
