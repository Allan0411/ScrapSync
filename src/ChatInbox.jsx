import { useState, useEffect, useContext } from "react";
import { db } from "./firebase";
import { getDocs, collection, query, where, doc, getDoc, setDoc } from "firebase/firestore";
import { AuthContext } from "./App";

export default function ChatInbox() {
    const { user } = useContext(AuthContext);
    const [docId, setDocId] = useState(null);
    const [userInboxes, setUserInboxes] = useState([]); // Store multiple inboxes

    useEffect(() => {
        const fetchDocId = async () => {
            if (user?.email) {
                console.log("Checking Firestore for email:", user.email);

                const q = query(collection(db, "Profile"), where("Email", "==", user.email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const document = querySnapshot.docs[0]; 
                    const userDocId = document.id;
                    setDocId(userDocId);
                    console.log("User's Document ID:", userDocId);

                    // 🔥 Check all inboxes where this user is present
                    await checkUserInInbox(userDocId);
                } else {
                    console.log("No matching Profile document found.");
                }
            }
        };

        const checkUserInInbox = async (userDocId) => {
            const inboxRef = collection(db, "Inbox");
            const inboxQuery = await getDocs(inboxRef);
            
            let matchedInboxes = []; // Temporary array to store all matches

            if (inboxQuery.empty) {
                console.log("⚠️ No Inbox documents found. Creating one...");

                // 🔥 Create a new Inbox document with the user
                const newInboxRef = doc(collection(db, "Inbox")); // Generate new doc ID
                await setDoc(newInboxRef, {
                    users: [userDocId],
                    messages: [],
                    timestamp: new Date()
                });

                console.log("✅ New Inbox document created:", newInboxRef.id);
                matchedInboxes.push(newInboxRef.id);
            } else {
                // 🔍 Check all inboxes where user exists
                inboxQuery.forEach((inboxDoc) => {
                    console.log("📩 Inbox Document Found:", inboxDoc.id);
                    const inboxData = inboxDoc.data();

                    if (inboxData.users && inboxData.users.includes(userDocId)) {
                        console.log("✅ User is in Inbox:", inboxDoc.id);
                        matchedInboxes.push(inboxDoc.id);
                    }
                });
            }

            // Set all matched inboxes in state
            setUserInboxes(matchedInboxes);
        };

        fetchDocId();
    }, [user]);

    return (
        <div>
            <h1>Inbox</h1>
            <p>Profile Document ID: {docId || "Not Found"}</p>
            <h2>Matching Inboxes:</h2>
            {userInboxes.length > 0 ? (
                <ul>
                    {userInboxes.map((inboxId) => (
                        <li key={inboxId}>📩 {inboxId}</li>
                    ))}
                </ul>
            ) : (
                <p>No Inboxes Found ❌</p>
            )}
        </div>
    );
}
