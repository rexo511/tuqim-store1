'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { FiLogIn, FiUserPlus, FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiX } from 'react-icons/fi';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, signInWithGoogle, signUp, signInUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      console.log('✅ User detected, redirecting to home...');
      // Small delay to ensure state is updated
      setTimeout(() => {
        router.push('/');
      }, 100);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (mode === 'login') {
        result = await signInUser(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('الاسم مطلوب');
        }
        result = await signUp(email, password, name);
      }

      if (result.success) {
        // Redirect immediately without showing success message
        router.push('/');
      } else {
        setError(result.error || 'حدث خطأ');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    console.log('🔵 Starting Google Sign-In...');
    console.log('🔵 Firebase Config Check:', {
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    
    try {
      await signInWithGoogle();
      console.log('✅ Google Sign-In successful!');
      // Redirect will happen automatically via useEffect when user state changes
    } catch (err: any) {
      console.error('❌ Google sign-in error:', err);
      console.error('❌ Error code:', err.code);
      console.error('❌ Error message:', err.message);
      console.error('❌ Full error:', err);
      
      let errorMessage = 'خطأ في تسجيل الدخول بـ Google';
      
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'تم إغلاق نافذة تسجيل الدخول';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'تم إلغاء طلب تسجيل الدخول';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'المتصفح منع النافذة المنبثقة. جرب مرة أخرى أو فعّل النوافذ المنبثقة';
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'النطاق غير مصرح به. تحقق من Authorized domains في Firebase Console';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'تسجيل الدخول بـ Google غير مفعّل في Firebase Console';
      } else if (err.code === 'auth/invalid-api-key') {
        errorMessage = 'مفتاح API غير صحيح. تحقق من ملف .env.local';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'خطأ في الاتصال بالإنترنت';
      } else if (err.message && err.message.includes('invalid')) {
        errorMessage = 'إعدادات Firebase غير صحيحة. تحقق من ملف .env.local';
      } else if (err.message) {
        errorMessage = `خطأ: ${err.message}`;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black/50 to-purple-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="logo-3d text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent mb-2">
            Tuqim Store
          </h1>
          <p className="text-gray-400 text-lg">تسجيل الدخول أو إنشاء حساب</p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#1a1a2e]/90 backdrop-blur-xl border border-purple-900/50 rounded-2xl p-8 shadow-2xl glow-purple">
          {/* Mode Tabs */}
          <div className="flex bg-[#0f0f1a] rounded-xl p-1 mb-6 border border-purple-900/30">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                mode === 'login'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              <FiLogIn className="w-5 h-5 inline ml-2" />
              تسجيل الدخول
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                mode === 'register'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              <FiUserPlus className="w-5 h-5 inline ml-2" />
              إنشاء حساب
            </button>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all mb-6 text-white font-medium backdrop-blur-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? 'جاري...' : 'المتابعة بـ Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            <span className="px-4 text-gray-500 text-sm mx-2">أو</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm text-gray-300 mb-2">الاسم الكامل</label>
                <div className="relative">
                  <FiUser className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 bg-[#0f0f1a]/80 border border-purple-900/50 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all text-white placeholder-gray-500"
                    placeholder="اسمك"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-300 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <FiMail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-[#0f0f1a]/80 border border-purple-900/50 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all text-white placeholder-gray-500"
                  placeholder="example@tuqim.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">كلمة المرور</label>
              <div className="relative">
                <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-[#0f0f1a]/80 border border-purple-900/50 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all text-white placeholder-gray-500"
                  placeholder="كلمة مرور قوية (6+ أحرف)"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-800/50 rounded-xl p-4 text-red-300 text-sm flex items-center gap-2">
                <FiX className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-glow-purple"
            >
              {loading ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  جاري...
                </div>
              ) : mode === 'login' ? 'دخول' : 'إنشاء حساب'}
            </button>
          </form>

          {/* Auth Link */}
          <p className="text-center mt-6 text-sm text-gray-400">
            {mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب؟'}
            <Link 
              href="#" 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="ml-1 text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              {mode === 'login' ? 'إنشاء حساب' : 'تسجيل الدخول'}
            </Link>
          </p>

          {/* Admin Link */}
          <div className="mt-8 pt-6 border-t border-purple-900/30">
            <Link
              href="/admin/login"
              className="w-full block text-center py-3 px-6 border border-purple-600/50 hover:border-purple-500 bg-purple-900/30 hover:bg-purple-900/50 rounded-xl transition-all text-purple-300 hover:text-white font-medium"
            >
              لوحة تحكم الأدمن
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
