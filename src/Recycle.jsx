import React, { useState, useEffect, useContext } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./firebase"; 
import { AuthContext } from "./App"; 
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

export default function Recycle() {
  const { user } = useContext(AuthContext);
  const [recycleListing, setRecycleListing] = useState({
    email: user?.email || "",
    name: user?.name || "",
    longitude: user?.longitude || 15.8051,
    latitude: user?.latitude || 73.996559,
    price: "",
    minWeight: "",
    status: false, // true if another person accepts the offer
  });
  const [listings, setListings] = useState([]);
  const [isRecycleCenter, setIsRecycleCenter] = useState(false);
  const [showForm, setShowForm] = useState(false); // To toggle form visibility

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBehEghFrkAKZ7EE3z4YJ5dOHAbxMURZBQ", // Replace with your API key
  });

  useEffect(() => {
    if (user?.is_recycle_center) {
      setIsRecycleCenter(true);
    }
  }, [user]);

  // Fetch listings from Firestore
  const fetchItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "recycleListings"));
      const itemsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListings(itemsList);
    } catch (e) {
      console.error("Failed to fetch items:", e);
    }
  };

  // Add a new listing to Firestore
  const addItem = async () => {
    try {
      await addDoc(collection(db, "recycleListings"), {
        ...recycleListing,
      });
      setRecycleListing({
        email: user?.email || "",
        name: user?.name || "",
        longitude: user?.longitude || "",
        latitude: user?.latitude || "",
        price: "",
        minWeight: "",
        status: false,
      });
      setShowForm(false); // Hide form after adding the listing
      fetchItems(); // Refresh the list after adding a new item
    } catch (e) {
      console.error("Failed to add item:", e);
    }
  };

  // Fetch listings when the component mounts
  useEffect(() => {
    fetchItems();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRecycleListing((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const mapContainerStyle = {
    width: "100%",
    height: "400px",
    marginBottom: "20px",
  };

  const defaultCenter = {
    lat: recycleListing.latitude,
    lng: recycleListing.longitude,
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Recycle Listings</h1>

      {/* Map Section */}
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={10}
        >
          {listings.map((listing) => (
            <Marker
              key={listing.id}
              position={{
                lat: parseFloat(listing.latitude),
                lng: parseFloat(listing.longitude),
              }}
              title={listing.name || "Unnamed Plant"}
            />
          ))}
        </GoogleMap>
      )}

      {/* Display all listings */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "20px" }}>
        {listings.map((listing) => (
          <div
            key={listing.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              width: "250px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>{listing.name || "Unnamed Plant"}</h3>
            <p><strong>Price:</strong> {listing.price}</p>
            <p><strong>Minimum Weight:</strong> {listing.minWeight}</p>
            <p>
              <strong>Status:</strong> {listing.status ? "Accepted" : "Pending"}
            </p>
          </div>
        ))}
      </div>

      {/* Show the Add (+) button and form only for users with is_recycle_center set to true */}
      {isRecycleCenter && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          {/* Add (+) Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                marginTop: "10px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              +
            </button>
          )}

          {/* Form to add a new listing (visible only when showForm is true) */}
          {showForm && (
            <div style={{ marginTop: "20px" }}>
              <h2>Add a New Listing</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addItem();
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div>
                  <label>Price:</label>
                  <input
                    type="text"
                    name="price"
                    value={recycleListing.price}
                    onChange={handleInputChange}
                    required
                    style={{ marginLeft: "10px" }}
                  />
                </div>
                <div>
                  <label>Minimum Weight:</label>
                  <input
                    type="text"
                    name="minWeight"
                    value={recycleListing.minWeight}
                    onChange={handleInputChange}
                    required
                    style={{ marginLeft: "10px" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                  >
                    Add Listing
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
