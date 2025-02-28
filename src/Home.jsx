import React, { useState, useEffect, useContext } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, where,query, deleteField, Timestamp, arrayUnion  } from 'firebase/firestore';
import { AuthContext } from './App';
import { AnimatePresence, motion } from 'motion/react';
import { div } from 'motion/react-client';


const HomePage = () => {

 
  const { user, setUser, data, setData } = useContext(AuthContext);
  const [isloading, setisloading] = useState(false);
      
 
    console.log(data);
    const [item, setItem] = useState({
      email: user?.email || "",
      location: "",
      pickupDate: "",
      price: "",
      imageURL: "",
      wasteType: "Plastic",
      subtype: "",
      status: true,
      hasCollected: false,
    });
    const [items, setItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    const wasteOptions = {
      Plastic: ["Thermoplastic", "Thermosetting Plastic", "Other"],
      Metal: ["Ferrous", "Non-Ferrous", "Alloys"],
      "E-Waste": ["Batteries", "Circuit Boards", "Other"],
    };
  
    // Fetch items from Firebase
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "items"));
        const itemsList = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((item) => item.email === user?.email); // Filter by user email
        setItems(itemsList);
      } catch (e) {
        console.error("Failed to fetch items:", e);
      }
    };
  
    useEffect(() => {
      fetchItems();
    }, []);
  

  
    // Handle image upload
  

  return (
    <div className="p-4 relative min-h-screen">
      <h1 className="text-2xl font-bold mb-4">My Items</h1>

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border rounded shadow p-4">
            <img
              src={item.imageURL}
              alt="Item"
              className="w-full h-32 object-cover rounded"
              style={{
                maxWidth: "100%",
                maxHeight: "150px", // Restricts the height
                objectFit: "cover", // Ensures the image is cropped nicely within the bounds
              }}
            />
            <h2 className="font-semibold mt-2">Location: {item.location}</h2>
            <p>Pickup Date: {new Date(item.pickupDate).toLocaleString()}</p>
            <p>Price: ${item.price}</p>
            <p>Waste Type: {item.wasteType}</p>
            <p>Subtype: {item.subtype}</p>
            <p>Status: {item.status ? "Active" : "Inactive"}</p>
            <p>Collected: {item.hasCollected ? "Yes" : "No"}</p>
          </div>
        ))}
      </div>

      {/* Floating Plus Button */}
      

      {/* Modal for Adding Item */}
      { (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            
          
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
