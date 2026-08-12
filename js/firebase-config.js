// Since the project is Vanilla JS without a bundler, we use Firebase v10 Modular CDN imports.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs, addDoc, onSnapshot, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAsFfZN11JQuRQ1XM7aDJVMUatmgdmFUaE",
    authDomain: "skats-consults.firebaseapp.com",
    projectId: "skats-consults",
    storageBucket: "skats-consults.firebasestorage.app",
    messagingSenderId: "98599347696",
    appId: "1:98599347696:web:9627898c512fa6c3126935",
    measurementId: "G-PGVNXZ7QTR"
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
    createUserWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut,
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    onSnapshot,
    orderBy,
    serverTimestamp,
    ref,
    uploadBytesResumable,
    getDownloadURL
};
