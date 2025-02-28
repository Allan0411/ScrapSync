import React, { useState, useEffect, useContext } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
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
  const [translatedItems, setTranslatedItems] = useState({}); // Added for translations
  const [language, setLanguage] = useState("en"); // Added for language toggle

  const wasteOptions = {
    Plastic: ["Thermoplastic", "Thermosetting Plastic", "Other"],
    Metal: ["Ferrous", "Non-Ferrous", "Alloys"],
    "E-Waste": ["Batteries", "Circuit Boards", "Other"],
    Other: [],
  };

  // Fetch active items from Firebase
  const fetchItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "items"));
      const itemsList = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((item) => item.email === user?.email && !item.hasCollected); // Filter by user email and active items
      console.log("Fetched active items:", itemsList); // Debug: Check raw data
      setItems(itemsList);
      await translateAllItems(itemsList); // Added to translate on fetch
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

  // Mark an item as done (update hasCollected)
  const markAsDone = async (id) => {
    try {
      await updateDoc(doc(db, "items", id), { hasCollected: true });
      fetchItems();
    } catch (e) {
      console.error("Failed to mark item as done:", e);
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

  // Detect language using a simple heuristic
  const detectLanguage = (text) => {
    if (!text || typeof text !== "string") return "en";
    const hasHindi = /[\u0900-\u097F]/.test(text.trim()); // Check for Devanagari script
    return hasHindi ? "hi" : "en";
  };

  // Translate text using MyMemory API
  const translateText = async (text, targetLang) => {
    if (!text || typeof text !== "string") return "N/A";
    try {
      const sourceLang = detectLanguage(text);
      console.log(`Attempting to translate "${text}" from ${sourceLang} to ${targetLang}`);
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=${sourceLang}|${targetLang}`
      );
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const translated = data.responseData?.translatedText || text;
      console.log(`Successfully translated "${text}" to: ${translated}`);
      return translated;
    } catch (error) {
      console.error("Error translating with MyMemory:", error);
      return text; // Fallback to original text on error
    }
  };

  // Translate all items based on current language
  const translateAllItems = async (itemsToTranslate) => {
    const translations = {};
    for (const item of itemsToTranslate) {
      translations[item.id] = {
        location: await translateText(item.location || "N/A", language),
        wasteType: await translateText(item.wasteType || "N/A", language),
        subtype: await translateText(item.subtype || "N/A", language),
      };
    }
    setTranslatedItems(translations);
  };

  // Toggle language
  const toggleLanguage = async () => {
    const newLanguage = language === "en" ? "hi" : "en";
    setLanguage(newLanguage);
    await translateAllItems(items);
  };

  const text = {
    en: {
      title: "My Listings",
      location: "Location",
      pickupDate: "Pickup Date",
      price: "Price",
      wasteType: "Waste Type",
      subtype: "Subtype",
      status: "Status",
      collected: "Collected",
      addListing: "Add Listing",
      addButton: "Add",
      cancelButton: "Cancel",
      imageLabel: "Image",
      none: "None",
      markAsDone: "Mark as Done",
    },
    hi: {
      title: "मेरी लिस्टिंग",
      location: "स्थान",
      pickupDate: "पिकअप तिथि",
      price: "मूल्य",
      wasteType: "कचरा प्रकार",
      subtype: "उप-प्रकार",
      status: "स्थिति",
      collected: "एकत्रित",
      addListing: "लिस्टिंग जोड़ें",
      addButton: "जोड़ें",
      cancelButton: "रद्द करें",
      imageLabel: "छवि",
      none: "कोई नहीं",
      markAsDone: "पूर्ण करें",
    },
  };

  return (
    <div className="p-4 relative min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{text[language].title}</h1>
        <button
          onClick={toggleLanguage}
          className="mb-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {language === "en" ? "हिन्दी" : "English"}
        </button>
      </div>

      {/* Active Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items
          .filter((item) => !item.hasCollected) // Show only active (not collected) items
          .map((item) => (
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
              <h2 className="font-semibold mt-2">
                {text[language].location}: {translatedItems[item.id]?.location || item.location || "N/A"}
              </h2>
              <p>
                {text[language].pickupDate}: {new Date(item.pickupDate).toLocaleString()}
              </p>
              <p>
                {text[language].price}: ${item.price || "N/A"}
              </p>
              <p>
                {text[language].wasteType}: {translatedItems[item.id]?.wasteType || item.wasteType || "N/A"}
              </p>
              <p>
                {text[language].subtype}: {translatedItems[item.id]?.subtype || item.subtype || "N/A"}
              </p>
              <p>
                {text[language].status}: {item.status ? "Active" : "Inactive"}
              </p>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => deleteItem(item.id)}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  ✕
                </button>
                <button
                  onClick={() => markAsDone(item.id)}
                  className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                  {text[language].markAsDone}
                </button>
              </div>
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
            <h2 className="text-xl font-bold mb-4">{text[language].addListing}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addItem();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium">{text[language].location}</label>
                <input
                  type="text"
                  value={item.location}
                  onChange={(e) =>
                    setItem((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="border rounded p-2 w-full"
                  style={{ fontFamily: "inherit" }} // Support Hindi input
                  placeholder={language === "en" ? "e.g., Delhi" : "उदाहरण: दिल्ली"}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">{text[language].pickupDate}</label>
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
                <label className="block text-sm font-medium">{text[language].price}</label>
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
                <label className="block text-sm font-medium">{text[language].wasteType}</label>
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
                <label className="block text-sm font-medium">{text[language].subtype}</label>
                <select
                  value={item.subtype}
                  onChange={(e) =>
                    setItem((prev) => ({ ...prev, subtype: e.target.value }))
                  }
                  className="border rounded p-2 w-full"
                  disabled={!wasteOptions[item.wasteType].length}
                >
                  <option value="">{text[language].none}</option>
                  {wasteOptions[item.wasteType].map((subtype) => (
                    <option key={subtype} value={subtype}>
                      {subtype}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">{text[language].imageLabel}</label>
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
                  {text[language].cancelButton}
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {text[language].addButton}
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