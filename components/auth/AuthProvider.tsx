"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from 'js-cookie';
import { onAuthStateChanged, User } from "firebase/auth";
import { tryGetFirebaseAuth } from "@/lib/firebase/config";

import { getUserProfile } from '@/lib/firebase/firestore';
import { UserRole } from '@/lib/firebase/firestore';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  role: UserRole | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};


export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);


  // Helper to persist role in sessionStorage
  const persistRole = (uid: string, role: UserRole | null) => {
    if (uid && role) {
      sessionStorage.setItem(`userRole:${uid}`, role);
      Cookies.set('userRole', role, { sameSite: 'lax' });
    }
  };

  useEffect(() => {
    const auth = tryGetFirebaseAuth();
    if (!auth) {
      setLoading(false);
      setRole(null);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check sessionStorage for cached role
        const cachedRole = sessionStorage.getItem(`userRole:${firebaseUser.uid}`);
        if (cachedRole) {
          setRole(cachedRole as UserRole);
          persistRole(firebaseUser.uid, cachedRole as UserRole);
          setLoading(false);
        } else {
          // Fetch from Firestore and cache
          setLoading(true);
          try {
            const profile = await getUserProfile(firebaseUser.uid);
            const newRole = profile?.role ?? 'student';
            setRole(newRole);
            persistRole(firebaseUser.uid, newRole);
          } catch {
            setRole('student');
            persistRole(firebaseUser.uid, 'student');
          }
          setLoading(false);
        }
      } else {
        setRole(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, role }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};