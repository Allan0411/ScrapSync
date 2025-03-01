import React, { useState, useEffect, useContext } from "react";
import { db } from "./firebase";
import { collection, getDocs,query,where,addDoc } from "firebase/firestore";
import { AuthContext } from "./App";
import { useNavigate } from "react-router-dom";
const HomePage = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [translatedItems, setTranslatedItems] = useState({});
  const [language, setLanguage] = useState("en");
  const [searchTerm, setSearchTerm] = useState(""); // Added for search
  const navigate=useNavigate();
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
    <div className="home">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Scrap Market</h1>
        <button
          onClick={toggleLanguage}
          className="language"
        >
          {language === "en" ? "हिन्दी" : "English"}
        </button>
      </div>

      {/* Search Bar */}
      <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={text[language].searchPlaceholder}
        className="search-bar"
        style={{ fontFamily: "inherit" }} // Support Hindi input
      />
</div>
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