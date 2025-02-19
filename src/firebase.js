// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import "firebase/storage"
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxW30z59D7fm7PM09hD2By2Hxe-uzWdnc",
  authDomain: "elevate-95063.firebaseapp.com",
    projectId: "elevate-95063",
  storageBucket: "elevate-95063.firebasestorage.app",
  messagingSenderId: "119929758694",
  appId: "1:119929758694:web:6bb2c8a8bc38251cf86c27",
  measurementId: "G-RW8WH4298Z"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
// const analytics = getAnalytics(app);