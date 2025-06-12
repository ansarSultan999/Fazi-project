import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAGG6bP8pN8Y7aad-4U_OZiRLYg8wofkVc",
  authDomain: "fazi-marketing.firebaseapp.com",
  projectId: "fazi-marketing",
  storageBucket: "fazi-marketing.firebasestorage.app",
  messagingSenderId: "181453815032",
  appId: "1:181453815032:web:9eb4b43490f8af0e854f0d",
  measurementId: "G-EHMVF9HR2V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;