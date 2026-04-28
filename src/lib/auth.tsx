'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInAsAdmin: async () => ({ success: false }),
  signOut: async () => {},
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        const isPasswordProvider = user.providerData.some(p => p.providerId === 'password');
        setIsAdmin(isPasswordProvider);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInAsAdmin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      let errorMsg = 'حدث خطأ في تسجيل الدخول';
      if (error.code === 'auth/user-not-found') errorMsg = 'حساب الأدمن غير موجود';
      if (error.code === 'auth/wrong-password') errorMsg = 'كلمة المرور خطأ';
      if (error.code === 'auth/invalid-email') errorMsg = 'الإيميل غير صحيح';
      if (error.code === 'auth/invalid-credential') errorMsg = 'الإيميل أو كلمة المرور خطأ';
      return { success: false, error: errorMsg };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInAsAdmin, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
