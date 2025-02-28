import React, { useState, useEffect, useContext } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { AuthContext } from "./App";

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

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

  return (
    <div className="p-4 relative min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Scrap Market</h1>

      {/* Grid Items */}
      <div className="grid-home">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid-element cursor-pointer"
            onClick={() => setSelectedItem(item)} // ✅ Corrected this line
          >
            <img src={item.imageURL} alt="Item" className="image" />
            <h2 className="font-semibold mt-2">Location: {item.location}</h2>
            <p>Pickup Date: {new Date(item.pickupDate).toLocaleString()}</p>
            <p>Price: ${item.price}</p>
            <p>Waste Type: {item.wasteType}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="modal fixed inset-0 flex justify-center items-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-xl font-bold">{selectedItem.location}</h1>
            <p>Pickup Date: {new Date(selectedItem.pickupDate).toLocaleString()}</p>
            <p>Price: ${selectedItem.price}</p>
            <p>Waste Type: {selectedItem.wasteType}</p>

            {/* Close Button */}
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setSelectedItem(null)} // ✅ Close modal
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;