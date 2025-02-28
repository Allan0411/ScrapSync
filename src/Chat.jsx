import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase";
import { getDocs, collection, query, orderBy, onSnapshot, getDoc, doc, where, addDoc, serverTimestamp } from "firebase/firestore";
import "./Chat.css";
import { AuthContext } from "./App";
import { motion } from "motion/react";

export default function Chat() {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [otherUserName, setOtherUserName] = useState("Unknown");
    const [userName, setUserName] = useState("Unknown");
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.email) return;

            const userQuery = query(collection(db, "Profile"), where("Email", "==", user.email));
            const userSnapshot = await getDocs(userQuery);

            if (!userSnapshot.empty) {
                const userDoc = userSnapshot.docs[0];
                setUserName(userDoc.data().Name || "Unknown");

                const chatDocRef = doc(db, "Inbox", chatId);
                const chatDoc = await getDoc(chatDocRef);

                if (chatDoc.exists()) {
                    const chatData = chatDoc.data();
                    const otherUserId = chatData.users.find(id => id !== userDoc.id);

                    if (otherUserId) {
                        const otherUserDoc = await getDoc(doc(db, "Profile", otherUserId));
                        if (otherUserDoc.exists()) {
                            setOtherUserName(otherUserDoc.data().Name || "Unknown");
                        }
                    }
                }
            }
        };

        fetchUserData();
    }, [chatId, user]);

    useEffect(() => {
        if (!chatId) return;

        const chatRef = collection(db, "Inbox", chatId, "Chat");
        const q = query(chatRef, orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const messagesData = await Promise.all(snapshot.docs.map(async (docSnap) => {
                const msgData = docSnap.data();
                const isCurrentUser = msgData.sender === user?.uid;
                const senderName = isCurrentUser ? userName : otherUserName;

                return { id: docSnap.id, text: msgData.text, sender: senderName };
            }));

            setMessages(messagesData);
        });

        return () => unsubscribe();
    }, [chatId, userName, otherUserName]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        await addDoc(collection(db, "Inbox", chatId, "Chat"), {
            text: message,
            sender: user.uid,
            timestamp: serverTimestamp(),
        });

        setMessage("");
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2 className="chat_title">Chat with {otherUserName}</h2>
            </div>

            <div className="chat-box">
                {messages.map((msg) => (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={msg.id}>
                        <strong>{msg.sender}: </strong>{msg.text}
                    </motion.p>
                ))}
            </div>

            <div className="input-container">
                <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                />
                <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={handleSendMessage}>
                    Send
                </motion.button>
            </div>
        </div>
    );
}
