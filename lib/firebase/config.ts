// DEBUG: Log the API key to verify env loading
// lib/firebase/index.ts - 100% HARDCODED
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// IMPORTANT: All Firebase config values must be set in .env.local (never hard-coded)
// Example .env.local:
// NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
// NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
// NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
// NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

// Initialize Firebase
const app = getApps().length > 0 ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


// Export everything
export { app, auth, db, storage };

// Export functions for compatibility
export const getFirebaseApp = () => app;
export const getFirebaseAuth = () => auth;
export const getFirebaseDb = () => db;
export const getFirebaseStorage = () => storage;
export const tryGetFirebaseAuth = () => auth;
export const tryGetFirebaseDb = () => db;
export const isFirebaseConfigured = () => !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
);
export const getFirebaseConfigErrorMessage = () => "Firebase is using environment variables. Check your .env.local file.";