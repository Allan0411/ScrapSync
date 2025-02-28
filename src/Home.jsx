import React, { useState, useEffect, useContext } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { AuthContext } from "./App";

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [translatedItems, setTranslatedItems] = useState({});
  const [language, setLanguage] = useState("en");
  const [searchTerm, setSearchTerm] = useState(""); // Added for search

  const fetchItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "items"));
      const itemsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Fetched items:", itemsList); // Debug: Check raw data
      setItems(itemsList);
      await translateAllItems(itemsList); // Ensure translations are awaited
    } catch (e) {
      console.error("Failed to fetch items:", e);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Detect language using a simple heuristic
  const detectLanguage = (text) => {
    if (!text || typeof text !== "string") return "en"; // Handle null/undefined or non-string
    const hasHindi = /[\u0900-\u097F]/.test(text.trim()); // Check for Devanagari script
    console.log(`Detected language for "${text.trim()}": ${hasHindi ? "hi" : "en"}`);
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

  // Translate all items based on current language, ensuring correct direction
  const translateAllItems = async (itemsToTranslate) => {
    const translations = {};
    for (const item of itemsToTranslate) {
      const locationLang = detectLanguage(item.location);
      const wasteTypeLang = detectLanguage(item.wasteType);
      translations[item.id] = {
        location: locationLang !== language ? await translateText(item.location || "N/A", language) : item.location || "N/A",
        wasteType: wasteTypeLang !== language ? await translateText(item.wasteType || "N/A", language) : item.wasteType || "N/A",
      };
    }
    setTranslatedItems(translations);
  };

  const toggleLanguage = async () => {
    const newLanguage = language === "en" ? "hi" : "en";
    setLanguage(newLanguage);
    await translateAllItems(items);
  };

  const text = {
    en: {
      location: "Location",
      pickupDate: "Pickup Date",
      price: "Price",
      wasteType: "Waste Type",
      searchPlaceholder: "Search by waste type...",
      noItems: "No items available",
    },
    hi: {
      location: "स्थान",
      pickupDate: "पिकअप तिथि",
      price: "मूल्य",
      wasteType: "कचरा प्रकार",
      searchPlaceholder: "कचरा प्रकार से खोजें...",
      noItems: "कोई आइटम उपलब्ध नहीं",
    },
  };

  // Filter items based on search term (wasteType), with debugging
  const filteredItems = items.filter((item) => {
    const wasteType = item.wasteType || "";
    const term = searchTerm.trim().toLowerCase();
    const matches = wasteType.toLowerCase().includes(term);
    console.log(`Filtering: Waste Type "${wasteType}" vs Search Term "${term}" = ${matches}`);
    return matches;
  });

  return (
    <div className="p-4 relative min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Scrap Market</h1>
        <button
          onClick={toggleLanguage}
          className="mb-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {language === "en" ? "हिन्दी" : "English"}
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={text[language].searchPlaceholder}
        className="border rounded p-2 w-full mb-4"
        style={{ fontFamily: "inherit" }} // Support Hindi input
      />

      {/* Grid Items */}
      <div className="grid-home">
        {filteredItems.length === 0 ? (
          <p>{text[language].noItems}</p>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="grid-element cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <img src={item.imageURL} alt="Item" className="image" />
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
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="modal fixed inset-0 flex justify-center items-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-xl font-bold">
              {translatedItems[selectedItem.id]?.location || selectedItem.location || "N/A"}
            </h1>
            <p>
              {text[language].pickupDate}: {new Date(selectedItem.pickupDate).toLocaleString()}
            </p>
            <p>
              {text[language].price}: ${selectedItem.price || "N/A"}
            </p>
            <p>
              {text[language].wasteType}: {translatedItems[selectedItem.id]?.wasteType || selectedItem.wasteType || "N/A"}
            </p>

            {/* Close Button */}
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setSelectedItem(null)}
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