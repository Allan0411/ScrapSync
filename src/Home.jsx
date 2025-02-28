import React, { useState, useEffect, useContext } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { AuthContext } from './App';

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
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
  const [scrapPriceTrends, setScrapPriceTrends] = useState({
    copper: [],
    aluminum: [],
    steel: [],
  });

  const wasteOptions = {
    Plastic: ["Thermoplastic", "Thermosetting Plastic", "Other"],
    Metal: ["Ferrous", "Non-Ferrous", "Alloys"],
    "E-Waste": ["Batteries", "Circuit Boards", "Other"],
  };

  // Fetch scrap price trends from Firestore
  const fetchScrapPriceTrends = async () => {
    try {
      const materials = ["copper", "aluminum", "steel"];
      const trends = {};
      for (const material of materials) {
        const querySnapshot = await getDocs(collection(db, "scrapPrices", material, "prices"));
        const priceData = querySnapshot.docs.map((doc) => ({
          price: doc.data().price,
          timestamp: doc.data().timestamp,
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by latest first
        trends[material] = priceData.slice(0, 3); // Limit to last 3 entries
      }
      setScrapPriceTrends(trends);
    } catch (error) {
      console.error("Error fetching scrap price trends:", error);
      setScrapPriceTrends({ copper: [], aluminum: [], steel: [] });
    }
  };

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(db, "items"));
      const itemsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemsList);
    } catch (e) {
      console.error("Failed to fetch items:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScrapPriceTrends();
    fetchItems();
  }, []);

  const addItem = async () => {
    if (!item.location || !item.imageURL || !item.pickupDate || !item.price || !item.subtype) {
      alert("Please enter all details");
      return;
    }
    try {
      await addDoc(collection(db, "items"), {
        ...item,
        timestamp: new Date(),
      });
      setItem({
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
      setIsModalOpen(false);
      fetchItems();
    } catch (e) {
      console.error("Failed to add item:", e);
    }
  };

  const handleImageInput = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "Test_Preset"); // Replace with your Cloudinary preset
    data.append("cloud_name", "diq0bcrjl"); // Replace with your Cloudinary cloud name
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/diq0bcrjl/image/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.secure_url) {
        setItem((prev) => ({ ...prev, imageURL: result.secure_url }));
      }
    } catch (e) {
      console.error("Failed to upload image: ", e);
    }
  };

  return (
    <div className="p-4 relative min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Scrap Market</h1>

      {/* Display Scrap Price Trends */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Scrap Price Trends (INR/kg)</h2>
        <div className="mt-2">
          <p><strong>Copper:</strong></p>
          {scrapPriceTrends.copper.length > 0 ? (
            scrapPriceTrends.copper.map((entry, index) => (
              <span key={index} className="ml-2">{entry.price} ({new Date(entry.timestamp).toLocaleDateString()}) </span>
            ))
          ) : (
            <span className="ml-2">No data</span>
          )}
        </div>
        <div className="mt-2">
          <p><strong>Aluminum:</strong></p>
          {scrapPriceTrends.aluminum.length > 0 ? (
            scrapPriceTrends.aluminum.map((entry, index) => (
              <span key={index} className="ml-2">{entry.price} ({new Date(entry.timestamp).toLocaleDateString()}) </span>
            ))
          ) : (
            <span className="ml-2">No data</span>
          )}
        </div>
        <div className="mt-2">
          <p><strong>Steel:</strong></p>
          {scrapPriceTrends.steel.length > 0 ? (
            scrapPriceTrends.steel.map((entry, index) => (
              <span key={index} className="ml-2">{entry.price} ({new Date(entry.timestamp).toLocaleDateString()}) </span>
            ))
          ) : (
            <span className="ml-2">No data</span>
          )}
        </div>
      </div>

      {/* Items List */}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border rounded shadow p-4">
              <img
                src={item.imageURL}
                alt="Item"
                className="w-full h-32 object-cover rounded"
                style={{
                  maxWidth: "100%",
                  maxHeight: "150px",
                  objectFit: "cover",
                }}
              />
              <h2 className="font-semibold mt-2">Location: {item.location}</h2>
              <p>Pickup Date: {new Date(item.pickupDate).toLocaleString()}</p>
              <p>Price: ₹{item.price}</p>
              <p>Waste Type: {item.wasteType}</p>
              <p>Subtype: {item.subtype}</p>
              <p>Status: {item.status ? "Active" : "Inactive"}</p>
              <p>Collected: {item.hasCollected ? "Yes" : "No"}</p>
            </div>
          ))}
        </div>
      )}

      {/* Floating Plus Button */}
      {user && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600"
        >
          +
        </button>
      )}

      {/* Modal for Adding Item */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add Scrap Listing</h2>
            <form onSubmit={(e) => { e.preventDefault(); addItem(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Location</label>
                <input
                  type="text"
                  value={item.location}
                  onChange={(e) => setItem((prev) => ({ ...prev, location: e.target.value }))}
                  className="border rounded p-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Pickup Date</label>
                <input
                  type="datetime-local"
                  value={item.pickupDate}
                  onChange={(e) => setItem((prev) => ({ ...prev, pickupDate: e.target.value }))}
                  className="border rounded p-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Price (INR)</label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => setItem((prev) => ({ ...prev, price: e.target.value }))}
                  className="border rounded p-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Waste Type</label>
                <select
                  value={item.wasteType}
                  onChange={(e) => setItem((prev) => ({ ...prev, wasteType: e.target.value, subtype: "" }))}
                  className="border rounded p-2 w-full"
                >
                  {Object.keys(wasteOptions).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Subtype</label>
                <select
                  value={item.subtype}
                  onChange={(e) => setItem((prev) => ({ ...prev, subtype: e.target.value }))}
                  className="border rounded p-2 w-full"
                  required
                >
                  <option value="">Select Subtype</option>
                  {wasteOptions[item.wasteType].map((subtype) => (
                    <option key={subtype} value={subtype}>{subtype}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Image</label>
                <input
                  type="file"
                  onChange={handleImageInput}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;