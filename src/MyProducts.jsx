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
<<<<<<< HEAD
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
=======
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
>>>>>>> 490080b9fd0ad112784347b559ee42efaa8f13a7

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
                maxHeight: "150px", // Restricts the height
                objectFit: "cover", // Ensures the image is cropped nicely within the bounds
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
        className="fixed bottom-8 right-8 bg-blue-500 text-white p-8 text-xl rounded-full shadow-lg hover:bg-blue-600"
      >
        +
      </button>

      {/* Modal for Adding Item */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add Listing</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addItem();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium">Location</label>
                <input
                  type="text"
                  value={item.location}
                  onChange={(e) =>
                    setItem((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="border rounded p-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Pickup Date</label>
                <input
                  type="datetime-local"
                  value={item.pickupDate}
                  onChange={(e) =>
                    setItem((prev) => ({ ...prev, pickupDate: e.target.value }))
                  }
                  className="border rounded p-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Price</label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    setItem((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className="border rounded p-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Waste Type</label>
                <select
                  value={item.wasteType}
                  onChange={(e) =>
                    setItem((prev) => ({
                      ...prev,
                      wasteType: e.target.value,
                      subtype: "",
                    }))
                  }
                  className="border rounded p-2 w-full"
                  required
                >
                  {Object.keys(wasteOptions).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Subtype</label>
                <select
                  value={item.subtype}
                  onChange={(e) =>
                    setItem((prev) => ({ ...prev, subtype: e.target.value }))
                  }
                  className="border rounded p-2 w-full"
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

export default MyProducts;
