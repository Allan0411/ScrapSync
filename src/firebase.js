
import { initializeApp } from "firebase/app";
import { Firestore, getFirestore} from "firebase/firestore";
import { getStorage, } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import "firebase/storage"
import { getMessaging, getToken } from "firebase/messaging";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, where,query, deleteField, Timestamp, arrayUnion  } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA-KtLEry-IKfArDy2fFGlO4Plce9B5gec",
  authDomain: "elevate-together.firebaseapp.com",
  projectId: "elevate-together",
  storageBucket: "elevate-together.firebasestorage.app",
  messagingSenderId: "526113036967",
  appId: "1:526113036967:web:d6bc85759442527bde5982",
  measurementId: "G-ZJ8VN19HC4"
};


export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
const analytics = getAnalytics(app);

export const messaging = getMessaging(app);

export const generateToken = async () => {
  const permission = await Notification.requestPermission();
  console.log(permission);
  if (permission === "granted") {
    const token = await getToken(messaging, {
      vapidKey: "BCqQHXeZZH58EYvSVxgdzyVYLC78Q9tuv5SdjSRYfvAqg-BAGPQpKAoCogdFUQh1s1iqZAixqgnjF9GpFI_BfEk",
    });
    
  }
};