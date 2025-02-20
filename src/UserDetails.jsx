
import React from 'react'

export default function UserDetails() {
  return (
    <div>UserDetails</div>
  )
}




// import { collection, query, where, getDocs } from "firebase/firestore";

// const fetchProfileByEmail = async (email) => {
//   try {
//     const q = query(collection(db, "Profile"), where("Email", "==", email));
//     const querySnapshot = await getDocs(q);
//     let userData = NULL;
//     if (!querySnapshot.empty) {
//       querySnapshot.forEach((doc) => {
//       let userData = { id: doc.id, ...doc.data() };
//       });
//     } else {
//       console.log("No document found with this email!");
//     }
//   } catch (error) {
//     console.error("Error fetching document:", error);
//   }
// };