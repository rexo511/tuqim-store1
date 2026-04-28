'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { FiLock, FiMail, FiShield } from 'react-icons/fi';

export default function AdminLoginPage() {
  const { signInAsAdmin, isAdmin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAdmin) {
    router.push('/admin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signInAsAdmin(email, password);
    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || 'حدث خطأ');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-[#1a1a2e] rounded-2xl border border-purple-900/30 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShield className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold">دخول الأدمن</h1>
          <p className="text-gray-400 text-sm mt-2">حساب خاص بإدارة المتجر</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">الإيميل</label>
            <div className="relative">
              <FiMail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pr-10 pl-4 py-3 bg-[#0f0f1a] border border-purple-900/30 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="admin@tuqim.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">كلمة المرور</label>
            <div className="relative">
              <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-3 bg-[#0f0f1a] border border-purple-900/30 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition-colors text-white font-bold"
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
