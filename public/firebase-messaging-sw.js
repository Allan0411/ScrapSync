// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyA-KtLEry-IKfArDy2fFGlO4Plce9B5gec",
  authDomain: "elevate-together.firebaseapp.com",
  projectId: "elevate-together",
  storageBucket: "elevate-together.firebasestorage.app",
  messagingSenderId: "526113036967",
  appId: "1:526113036967:web:d6bc85759442527bde5982",
  measurementId: "G-ZJ8VN19HC4"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
// messaging.onBackgroundMessage((payload) => {
//   console.log(
//     '[firebase-messaging-sw.js] Received background message ',
//     payload
//   );
//   // Customize notification here
//   const notificationTitle = 'Background Message Title';
//   const notificationOptions = {
//     body: 'Background Message body.',
//     icon: '/firebase-logo.png'
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  // Use payload data dynamically
  const notificationTitle = payload.notification.title; // Title from payload
  const notificationOptions = {
    body: payload.notification.body,  // Body from payload
    icon: payload.notification.icon || '/firebase-logo.png'
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});
