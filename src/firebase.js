
import { initializeApp } from "firebase/app";
import { Firestore, getFirestore} from "firebase/firestore";
import { getStorage, } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import "firebase/storage"

import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, where,query, deleteField, Timestamp, arrayUnion  } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyDoua-9rqGU-YkZGPfzSWYOPc6FsLEVDlA",
  authDomain: "scrapsync-cad51.firebaseapp.com",
  projectId: "scrapsync-cad51",
  storageBucket: "scrapsync-cad51.firebasestorage.app",
  messagingSenderId: "36105185189",
  appId: "1:36105185189:web:5db364151f4f795e89ea4c"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
const analytics = getAnalytics(app);



