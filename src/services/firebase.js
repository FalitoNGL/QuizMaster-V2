import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Konfigurasi dari Anda
const firebaseConfig = {
  apiKey: "AIzaSyCu63bV7YvkGj8C_BzT0i7mmMDX6KL9cu4",
  authDomain: "quiz-master-db.firebaseapp.com",
  projectId: "quiz-master-db",
  storageBucket: "quiz-master-db.firebasestorage.app",
  messagingSenderId: "544723386032",
  appId: "1:544723386032:web:970d4ca3903111a2f7c575",
  measurementId: "G-WKE3BQ87BF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export layanan yang akan dipakai di file lain
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);