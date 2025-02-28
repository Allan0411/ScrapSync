import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { getDocs, collection, query, where, doc, getDoc } from "firebase/firestore";
import { AuthContext } from "./App";

export default function ChatInbox() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [docId, setDocId] = useState(null);
    const [chatPartners, setChatPartners] = useState([]);

    useEffect(() => {
        if (!user?.email) return;

        const fetchDocId = async () => {
            try {
                console.log("Checking Firestore for email:", user.email);
                const q = query(collection(db, "Profile"), where("Email", "==", user.email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userDocId = querySnapshot.docs[0].id;
                    setDocId(userDocId);
                    console.log("User's Document ID:", userDocId);
                    await fetchUserChats(userDocId);
                } else {
                    console.log("No matching Profile document found.");
                }
            } catch (error) {
                console.error("Error fetching user document:", error);
            }
        };

        const fetchUserChats = async (userDocId) => {
            try {
                const inboxRef = collection(db, "Inbox");
                const inboxQuery = await getDocs(inboxRef);
                let partners = [];

                for (const inboxDoc of inboxQuery.docs) {
                    const inboxData = inboxDoc.data();

                    if (inboxData.users?.includes(userDocId)) {
                        console.log("📩 User found in Inbox:", inboxDoc.id);
                        const otherUserId = inboxData.users.find(id => id !== userDocId);

                        if (otherUserId) {
                            const otherUserDoc = await getDoc(doc(db, "Profile", otherUserId));
                            if (otherUserDoc.exists()) {
                                partners.push({
                                    inboxId: inboxDoc.id, // Store Inbox ID
                                    name: otherUserDoc.data().Name || otherUserDoc.data().Email
                                });
                            }
                        }
                    }
                }
                setChatPartners(partners);
            } catch (error) {
                console.error("Error fetching chat partners:", error);
            }
        };

        fetchDocId();
    }, [user]);

    const handleChatClick = (inboxId) => {
        navigate(`/chat/${inboxId}`);
    };

    return (
        <div>
            <h1>Inbox</h1>
            <p>Profile Document ID: {docId || "Not Found"}</p>
            <h2>Chatting With:</h2>
            {chatPartners.length > 0 ? (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                    {chatPartners.map((partner) => (
                        <li key={partner.inboxId} onClick={() => handleChatClick(partner.inboxId)} style={{ marginBottom: "10px" }}>
                            <div
                                style={{
                                    padding: "10px",
                                    backgroundColor: "#f0f0f0",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    transition: "0.3s",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)"
                                }}
                                onMouseOver={(e) => (e.target.style.backgroundColor = "#e0e0e0")}
                                onMouseOut={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
                            >
                                📩 {partner.name} 
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Loading.....</p>
            )}
        </div>
    );
}