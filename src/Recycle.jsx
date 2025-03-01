import React, { useState, useEffect, useContext } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { AuthContext } from "./App";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const cityCoordinates = {
  Margao: { lat: 15.2993, lng: 74.124 },
  Panjim: { lat: 15.4968, lng: 73.8278 },
  Vasco: { lat: 15.3959, lng: 73.8157 },
  Mapusa: { lat: 15.5915, lng: 73.8087 },
};

export default function Recycle() {
  const { user } = useContext(AuthContext);
  const [recycleListing, setRecycleListing] = useState({
    email: user?.email || "",
    name: user?.name || "",
    city: "",
    price: "",
    minWeight: "",
    status: false,
  });
  const [listings, setListings] = useState([]);
  const [mapCenter, setMapCenter] = useState(cityCoordinates.Margao);
  const [showForm, setShowForm] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBehEghFrkAKZ7EE3z4YJ5dOHAbxMURZBQ", 
  });

  useEffect(() => {
    fetchItems();
  }, []);

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

  const addItem = async () => {
    if (!cityCoordinates[recycleListing.city]) {
      alert("Please select a valid city.");
      return;
    }

    try {
      await addDoc(collection(db, "recycleListings"), {
        ...recycleListing,
        latitude: cityCoordinates[recycleListing.city].lat,
        longitude: cityCoordinates[recycleListing.city].lng,
      });
      setRecycleListing({
        email: user?.email || "",
        name: user?.name || "",
        city: "",
        price: "",
        minWeight: "",
        status: false,
      });
      setShowForm(false);
      fetchItems();
    } catch (e) {
      console.error("Failed to add item:", e);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Recycle Listings</h1>

      {isLoaded && (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "400px", marginBottom: "20px" }}
          center={mapCenter}
          zoom={12}
        >
          {listings.map((listing) => (
            <Marker
              key={listing.id}
              position={{ lat: listing.latitude, lng: listing.longitude }}
              title={listing.name}
            />
          ))}
        </GoogleMap>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "20px" }}>
        {listings.map((listing) => (
          <div
            key={listing.id}
            onClick={() => setMapCenter(cityCoordinates[listing.city])}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              width: "250px",
              cursor: "pointer",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h3>{listing.name}</h3>
            <p><strong>City:</strong> {listing.city}</p>
            <p><strong>Price:</strong> {listing.price}</p>
            <p><strong>Min Weight:</strong> {listing.minWeight}</p>
            <p><strong>Status:</strong> {listing.status ? "Accepted" : "Pending"}</p>
          </div>
        ))}
      </div>

      {true && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          {!showForm && (
            <button onClick={() => setShowForm(true)} style={{ backgroundColor: "#28a745", color: "white", padding: "10px 20px", borderRadius: "5px" }}>+</button>
          )}

          {showForm && (
            <div style={{ marginTop: "20px" }}>
              <h2>Add a New Listing</h2>
              <form onSubmit={(e) => { e.preventDefault(); addItem(); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <div>
                  <label>City:</label>
                  <select name="city" value={recycleListing.city} onChange={(e) => setRecycleListing({ ...recycleListing, city: e.target.value })} required>
                    <option value="">Select a city</option>
                    {Object.keys(cityCoordinates).map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Price:</label>
                  <input type="text" name="price" value={recycleListing.price} onChange={(e) => setRecycleListing({ ...recycleListing, price: e.target.value })} required />
                </div>
                <div>
                  <label>Min Weight:</label>
                  <input type="text" name="minWeight" value={recycleListing.minWeight} onChange={(e) => setRecycleListing({ ...recycleListing, minWeight: e.target.value })} required />
                </div>
                <button type="submit" style={{ backgroundColor: "#28a745", color: "white", padding: "10px 20px", borderRadius: "5px" }}>Add Listing</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ backgroundColor: "#dc3545", color: "white", padding: "10px 20px", borderRadius: "5px" }}>Cancel</button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
