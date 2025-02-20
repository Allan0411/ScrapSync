import { db } from './firebase';
import { collection, query, where, getDocs } from "firebase/firestore";
export const getUser = async (email) => {
  try {
    const q = query(collection(db, "Profile"), where("Email", "==", email));
    const querySnapshot = await getDocs(q);
    let userData = null; 
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        userData = { id: doc.id, ...doc.data() };
      });
    } else {
      console.log("No document found with this email!");
    }
    return userData; 
  } catch (error) {
    console.error("Error fetching document:", error);
    return null;
  }
};
