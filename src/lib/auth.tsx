'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithRedirect,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  getRedirectResult,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signInUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInAsAdmin: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signInUser: async () => ({ success: false }),
  signOut: async () => {},
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // قائمة إيميلات الأدمن
  const ADMIN_EMAILS = [
    'admin@tuqim.com',
    // أضف إيميلات الأدمن هنا
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        // تحقق من أن الإيميل موجود في قائمة الأدمن
        const isAdminUser = ADMIN_EMAILS.includes(user.email || '');
        setIsAdmin(isAdminUser);
      } else {
        setIsAdmin(false);
      }
    });
    
    // Check for redirect result
    getRedirectResult(auth).catch((error) => {
      console.error('Redirect result error:', error);
    });
    
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Use redirect instead of popup (more reliable)
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
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

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      return { success: true };
    } catch (error: any) {
      let errorMsg = 'حدث خطأ في إنشاء الحساب';
      if (error.code === 'auth/email-already-in-use') errorMsg = 'الإيميل مستخدم بالفعل';
      if (error.code === 'auth/weak-password') errorMsg = 'كلمة المرور ضعيفة جداً';
      if (error.code === 'auth/invalid-email') errorMsg = 'الإيميل غير صحيح';
      return { success: false, error: errorMsg };
    }
  };

  const signInUser = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      let errorMsg = 'الإيميل أو كلمة المرور خطأ';
      if (error.code === 'auth/user-not-found') errorMsg = 'حساب غير موجود';
      if (error.code === 'auth/wrong-password') errorMsg = 'كلمة المرور خطأ';
      if (error.code === 'auth/invalid-email') errorMsg = 'الإيميل غير صحيح';
      return { success: false, error: errorMsg };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInAsAdmin, signUp, signInUser, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
