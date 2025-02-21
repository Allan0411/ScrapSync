// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import "firebase/storage"
import { getMessaging, getToken } from "firebase/messaging";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-KtLEry-IKfArDy2fFGlO4Plce9B5gec",
  authDomain: "elevate-together.firebaseapp.com",
  projectId: "elevate-together",
  storageBucket: "elevate-together.firebasestorage.app",
  messagingSenderId: "526113036967",
  appId: "1:526113036967:web:d6bc85759442527bde5982",
  measurementId: "G-ZJ8VN19HC4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
const analytics = getAnalytics(app);
// const analytics = getAnalytics(app);
export const messaging = getMessaging(app);

export const generateToken = async () => {
  const permission = await Notification.requestPermission();
  console.log(permission);
  if (permission === "granted") {
    const token = await getToken(messaging, {
      vapidKey: "BCqQHXeZZH58EYvSVxgdzyVYLC78Q9tuv5SdjSRYfvAqg-BAGPQpKAoCogdFUQh1s1iqZAixqgnjF9GpFI_BfEk",
    });
    console.log(token);
  }
};