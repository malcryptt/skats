// Since the project is Vanilla JS without a bundler, we use Firebase v10 Modular CDN imports.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

// TODO: Ask user for their real Firebase config variables.
// Placing placeholder mock data for testing locally immediately without rejecting requests initially.
const firebaseConfig = {
    apiKey: "MOCK_API_KEY_SETUP_PENDING",
    authDomain: "skats-portal-mock.firebaseapp.com",
    projectId: "skats-portal-mock",
    storageBucket: "skats-portal-mock.appspot.com",
    messagingSenderId: "00000000000",
    appId: "1:00000000000:web:mock123456789"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize core services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export Auth Methods needed across portal pages
export {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    ref,
    uploadBytesResumable,
    getDownloadURL
};
