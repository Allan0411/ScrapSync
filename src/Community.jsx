import React, { useEffect, useState, useContext } from "react";
import { db } from "./firebase"; // Make sure to initialize Firebase properly
import { collection, query, where, orderBy, getDocs, addDoc } from "firebase/firestore";
import { AuthContext } from "./App";

const ChatApp = () => {
  const { user, data } = useContext(AuthContext); // Assuming you have authentication setup
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
 console.log(data.id);
  useEffect(() => {
    if (!user) return;
    
    // Fetch chat conversations where the user is a participant
    const fetchChats = async () => {
      const q = query(
        collection(db, "messages"),
        where("userIds", "array-contains", user.uid)
      );
      const snapshot = await getDocs(q);
      const chatList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChats(chatList);
    };

    fetchChats();
  }, [user]);

  useEffect(() => {
    if (!selectedChat) return;
    
    // Fetch messages of the selected chat, ordered by timestamp
    const fetchMessages = async () => {
      const q = query(
        collection(db, `messages/${selectedChat.id}/chats`),
        orderBy("timestamp", "asc")
      );
      const snapshot = await getDocs(q);
      const msgList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgList);
    };

    fetchMessages();
  }, [selectedChat]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    await addDoc(collection(db, `messages/${selectedChat.id}/chats`), {
      text: newMessage,
      senderName: user.displayName,
      timestamp: new Date(),
    });
    setNewMessage("");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-100 p-4 border-r overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">INBOX</h2>
        {chats.length === 0 ? (
          <p className="text-gray-500">No conversations yet</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className="p-3 mb-2 bg-white rounded-lg cursor-pointer shadow"
              onClick={() => setSelectedChat(chat)}
            >
              <h3 className="font-semibold">{chat.chatName || "Unnamed Chat"}</h3>
              <p className="text-sm text-gray-500">{chat.lastMessage || "No messages yet"}</p>
            </div>
          ))
        )}
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col justify-center items-center">
        {selectedChat ? (
          <div className="w-full h-full flex flex-col">
            <div className="p-4 bg-gray-200 border-b text-lg font-bold">
              {selectedChat.chatName || "Chat"}
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((msg) => (
                <div key={msg.id} className="p-2 mb-2 bg-blue-100 rounded-lg">
                  <p><strong>{msg.senderName}:</strong> {msg.text}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex">
              <input
                type="text"
                className="flex-1 p-2 border rounded-lg"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Select a chat to view conversation</p>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
