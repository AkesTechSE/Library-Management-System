// lib/firebase/auth.ts - SIMPLE VERSION
import { auth } from "./config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "firebase/auth";

// Simple login function
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
};

// Simple register function
export const registerWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
};

// Simple Google login
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
};

// Simple logout
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
};