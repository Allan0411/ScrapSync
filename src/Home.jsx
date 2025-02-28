import React, { useState, useEffect, useContext } from "react";
import { db } from "./firebase";
import { collection, getDocs,query,where,addDoc} from "firebase/firestore";
import { AuthContext } from "./App";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);

  const addIndexDocument=async(userArray)=>{
    try{
      const docRef=await addDoc(collection(db,"Inbox"),{users:userArray});
      console.log("Document successfully written!");
      console.log(docRef);
      return docRef;
    }
    catch(error){
      console.error("Error adding document:",error);
    }
  };
  const fetchItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "items"));
      const itemsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemsList);
    } catch (e) {
      console.error("Failed to fetch items:", e);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChat = async (item) => {
    console.log(item.email);
    console.log(user.email);
    let userArray = [];
  
    // Fetch item.email's profile ID
    let q = query(collection(db, "Profile"), where("Email", "==", item.email));
    let querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      userArray.push(querySnapshot.docs[0].id);
    } else {
      console.log("No document found with this email!");
    }
  
    // Fetch user.email's profile ID
    let p = query(collection(db, "Profile"), where("Email", "==", user.email));
    let p_querySnapshot = await getDocs(p);
    if (!p_querySnapshot.empty) {
      userArray.push(p_querySnapshot.docs[0].id);
    } else {
      console.log("No document found with this email!");
    }
  
    console.log("User Array:", userArray);
  
    // Query for either user being in the 'users' array
    const inboxQuery = query(
      collection(db, "Inbox"),
      where("users", "array-contains", userArray[0])
    );
  
    let inboxSnapshot = await getDocs(inboxQuery);
  
    let existingChat = null;
  
    inboxSnapshot.forEach((doc) => {
      const users = doc.data().users;
      if (users.length === 2 && users.includes(userArray[1])) {
        existingChat = doc;
      }
    });
  
    if (existingChat) {
      console.log("Chat already exists, redirecting...");
      redirectToChat(existingChat.id);
    } else {
      console.log("Chat does not exist, creating new...");
      const newDocRef = await addIndexDocument(userArray);
      redirectToChat(newDocRef.id);
    }
  };
  
  

const redirectToChat = (chatId) => {
  navigate(`/chat/${chatId}`); // Adjust the route as needed
};
  return (
    <div className="home-container">
      <h1 className="text-2xl font-bold mb-4">Scrap Market</h1>

      {/* Grid Items */}
      <div className="grid-home">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid-element"
            onClick={() => setSelectedItem(item)} // ✅ Corrected this line
          >
            <img src={item.imageURL} alt="Item" className="image" />
            {/* <h2 className="font-semibold mt-2">Location: {item.location}</h2>
            <p>Pickup Date: {new Date(item.pickupDate).toLocaleString()}</p> */}
            <p>Price: ${item.price}</p>
            <p>Waste Type: {item.wasteType}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="modal">
             <button
              className="modal-button"
              onClick={() => setSelectedItem(null)} 
            >
              Close
            </button>
          <div className="modal-image">
                    <img src={selectedItem.imageURL} alt="Item" className="image" />
          </div>
          <button className="buy-button" onClick={()=>handleChat(selectedItem)}>Chat With</button>
          <div className="text">
           <p>Location: {selectedItem.location} </p>
            <p>Pickup Date: {new Date(selectedItem.pickupDate).toLocaleString()}</p>
            <p>Price: ${selectedItem.price}</p>
            <p>Waste Type: {selectedItem.wasteType}</p>
         
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;