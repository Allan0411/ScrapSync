import React, { useState, useEffect, useContext } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { AuthContext } from './App';

const MyProducts = () => {
  const { user } = useContext(AuthContext);
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
    Other: [],
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

  // Add a new item
  const addItem = async () => {
    try {
      await addDoc(collection(db, "items"), {
        ...item,
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

  // Delete an item
  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, "items", id));
      fetchItems();
    } catch (e) {
      console.error("Failed to delete item:", e);
    }
  };

  // Handle image upload
  const handleImageInput = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "Test_Preset");
    data.append("cloud_name", "diq0bcrjl");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/diq0bcrjl/image/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.secure_url) {
        setItem((prev) => ({ ...prev, imageURL: result.secure_url }));
      } else {
        throw new Error("Failed to upload image.");
      }
    } catch (e) {
      console.error("Failed to upload image: ", e);
    }
  };

  return (
    <div className="p-4 relative min-h-screen">
      <h1 className="text-2xl font-bold mb-4">My Listings</h1>

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border rounded shadow p-4 relative">
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
            <p>Price: ${item.price}</p>
            <p>Waste Type: {item.wasteType}</p>
            <p>Subtype: {item.subtype || "N/A"}</p>
            <p>Status: {item.status ? "Active" : "Inactive"}</p>
            <p>Collected: {item.hasCollected ? "Yes" : "No"}</p>
            <button
              onClick={() => deleteItem(item.id)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            >
              &#x2715;
            </button>
          </div>
        ))}
      </div>

      {/* Floating Plus Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="listing-product-button"
      >
        +
      </button>

      {/* Modal for Adding Item */}
      {isModalOpen && (
        <div className="listing-modal">
          <div className="listing-container">
            <h2 className="listing-heading">Add Listing</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addItem();
              }}
              className="listing-form"
            >
              <div className='location'>
                <label className="location-label">Location</label>
                <input
                  type="text"
                  value={item.location}
                  onChange={(e) =>
                    setItem((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="date-input"
                  required
                />
              </div>
              <div className='date'>
                <label className="date-label">Pickup Date</label>
                <input
                  type="datetime-local"
                  value={item.pickupDate}
                  onChange={(e) =>
                    setItem((prev) => ({ ...prev, pickupDate: e.target.value }))
                  }
                  className="date-input"
                  required
                />
              </div>
              <div className='price'>
                <label className="price-label">Price</label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    setItem((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className="price-input"
                  required
                />
              </div>
              <div className='waste'>
                <label className="waste-label">Waste Type</label>
                <select
                  value={item.wasteType}
                  onChange={(e) =>
                    setItem((prev) => ({
                      ...prev,
                      wasteType: e.target.value,
                      subtype: "",
                    }))
                  }
                  className="waste-input"
                  required
                >
                  {Object.keys(wasteOptions).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className='waste-subtype'>
                <label className="waste-subtype-label">Subtype</label>
                <select
                  value={item.subtype}
                  onChange={(e) =>
                    setItem((prev) => ({ ...prev, subtype: e.target.value }))
                  }
                  className="waste-subtype-input"
                  disabled={!wasteOptions[item.wasteType].length}
                >
                  <option value="">None</option>
                  {wasteOptions[item.wasteType].map((subtype) => (
                    <option key={subtype} value={subtype}>
                      {subtype}
                    </option>
                  ))}
                </select>
              </div>
              <div className='listing-image'>
                <label className="image-label">Image</label>
                <input
                  type="file"
                  onChange={handleImageInput}
                  className="image-input"
                />
              </div>
              <div className="listing-modal-button">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="add-button"
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

export default MyProducts;
