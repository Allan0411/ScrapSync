import React, { useState, useEffect, useContext } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { AuthContext } from './App';
import { motion } from "motion/react";
const History = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [translatedItems, setTranslatedItems] = useState({}); // Added for translations
  const [language, setLanguage] = useState("en"); // Added for language toggle

  // Fetch completed items from the 'history' collection
  const fetchItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "history"));
      const itemsList = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((item) => item.email === user?.email); // Filter by user email
      console.log("Fetched history items from 'history' collection:", itemsList); // Debug: Check raw data
      setItems(itemsList);
      await translateAllItems(itemsList); // Added to translate on fetch
    } catch (e) {
      console.error("Failed to fetch history items:", e);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
     ` );
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
      title: "History",
      location: "Location",
      pickupDate: "Pickup Date",
      price: "Price",
      wasteType: "Waste Type",
      historyTimestamp: "Completed On",
      noHistory: "No history available",
    },
    hi: {
      title: "इतिहास",
      location: "स्थान",
      pickupDate: "पिकअप तिथि",
      price: "मूल्य",
      wasteType: "कचरा प्रकार",
      historyTimestamp: "पूर्ण हुआ",
      noHistory: "कोई इतिहास उपलब्ध नहीं",
    },
  };

  return (
    <div className="p-4 relative min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{text[language].title}</h1>
        <button
          onClick={toggleLanguage}
          className="language"
        >
          {language === "en" ? "हिन्दी" : "English"}
        </button>
      </div>

      {/* History Items List */}
      <div className="history-list">
        {items.length === 0 ? (
          <p>{text[language].noHistory}</p>
        ) : (
          items.map((item, i) => (
            <motion.div key={item.id} className="history-list-item"
            initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
       whileHover={{ scale: 1.04, transition: { duration: 0.1 } }} 
            >
              <img
                src={item.imageURL}
                alt="Item (History)"
                className="w-full h-32 object-cover rounded"
                style={{
                  maxWidth: "100%",
                  maxHeight: "150px",
                  objectFit: "cover",
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
                {text[language].historyTimestamp}: {new Date(item.historyTimestamp).toLocaleString()}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;