import React, { useState, useEffect, useContext } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { AuthContext } from './App';
import { motion } from "motion/react";
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
    Kg: "", // User-input for estimated weight in kilograms
    points: 0, // Hidden points field, calculated internally
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
    if (!item.imageURL) {
      console.error("Image URL is missing. Please upload an image.");
      return;
    }
    if (!item.Kg) {
      console.error("Estimated Kg is required. Please enter a weight.");
      return;
    }

    // Calculate points based on Kg (hidden from user)
    const pointsToAdd = parseInt(item.Kg, 10) > 10 ? 50 : 10;

    try {
      await addDoc(collection(db, "items"), {
        ...item,
        points: pointsToAdd, // Add points to the item in Firestore, hidden from user
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
        Kg: "", // Reset Kg field
        points: 0, // Reset points (not user-editable)
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

  // Mark an item as done: delete from 'items' and add to 'history'
  const markAsDone = async (id) => {
    try {
      // Get the item to be marked as done
      const itemToMove = items.find((item) => item.id === id);
      if (!itemToMove) return;

      // Delete the item from the 'items' collection
      await deleteDoc(doc(db, "items", id));

      // Add the item to the 'history' collection with an updated timestamp, including points
      await addDoc(collection(db, "history"), {
        ...itemToMove,
        historyTimestamp: new Date().toISOString(), // Add timestamp for history tracking
      });

      // Remove the item from the local state immediately
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
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
      const response = await fetch(`
        https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=${sourceLang}|${targetLang}
      `);
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
      Kg: "Estimated Kg", // User-input only for estimated weight
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
      Kg: "अनुमानित किलोग्राम", // User-input only for estimated weight in Hindi
    },
  };

  return (
    <div className="listing parent">
      <div className="listing-container">
        <h1 className="title">{text[language].title}</h1>
        <motion.button
          onClick={toggleLanguage}
          className="language"
          whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
        >
          {language === "en" ? "हिन्दी" : "English"}
        </motion.button>
      </div>

      {/* Active Items List */}
      <div className="list-item-list">
        {items
          .filter((item) => !item.hasCollected) // Show only active (not collected) items
          .map((item, i) => (
            <motion.div key={item.id} className="list-item"
              initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
       whileHover={{ scale: 1.04, transition: { duration: 0.2 } }} >
              <img
                src={item.imageURL}
                alt="Item"
                className="list-image"
                style={{
                  maxWidth: "100%",
                  maxHeight: "150px", // Restricts the height
                  objectFit: "cover", // Ensures the image is cropped nicely within the bounds
                }}
              />
              <p className="list-location">
                {text[language].location}: {translatedItems[item.id]?.location || item.location || "N/A"}
              </p>
              <p className="list-location">
                {text[language].pickupDate}: {new Date(item.pickupDate).toLocaleString()}
              </p>
              <p className="list-location">
                {text[language].price}: ${item.price || "N/A"}
              </p>
              <p className="list-location">
                {text[language].wasteType}: {translatedItems[item.id]?.wasteType || item.wasteType || "N/A"}
              </p>
              <p className="list-location">
                {text[language].subtype}: {translatedItems[item.id]?.subtype || item.subtype || "N/A"}
              </p>
              <p className="list-location">
                {text[language].Kg}: {item.Kg || "N/A"} kg
              </p>
              <p className="list-location">
                {text[language].status}: {item.status ? "Active" : "Inactive"}
              </p>
              <div className="list-location">
                <motion.button
                  onClick={() => deleteItem(item.id)}
                  className="cancel"
                  whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
                >
                  ✕
                </motion.button>
                <motion.button
                  onClick={() => markAsDone(item.id)}
                  className="markasdone"
                  whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
                >
                  {text[language].markAsDone}
                </motion.button>
              </div>
            </motion.div>
          ))}
      </div>

      {/* Floating Plus Button */}
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className="add-modal"
whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
      >
        +
      </motion.button>

      {/* Modal for Adding Item */}
      {isModalOpen && (
        <div className="listing-modal">
          <div className="listing-modal-container">
            <h2 className="listing-modal-title">{text[language].addListing}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addItem();
              }}
              className="listing-modal-form"
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
                <label className="block text-sm font-medium">{text[language].Kg}</label>
                <input
                  type="number"
                  value={item.Kg}
                  onChange={(e) =>
                    setItem((prev) => ({ ...prev, Kg: e.target.value }))
                  }
                  className="border rounded p-2 w-full"
                  style={{ fontFamily: "inherit" }} // Support Hindi numeric input
                  placeholder={language === "en" ? "e.g., 50" : "उदाहरण: 50"}
                  required
                />
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
                <motion.button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cancel"
                  whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
                >
                  {text[language].cancelButton}
                </motion.button>
                <motion.button
                  type="submit"
                  className="add"
                  whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
                >
                  {text[language].addButton}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProducts;