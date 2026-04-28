'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { FiShoppingCart, FiLogIn, FiLogOut, FiLayout, FiUser } from 'react-icons/fi';

export default function Navbar() {
  const { user, signInWithGoogle, signOut, isAdmin } = useAuth();
  const { itemCount } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a2e]/90 backdrop-blur-md border-b border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="logo-3d text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
            Tuqim Store
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative p-2 rounded-lg hover:bg-purple-900/30 transition-colors"
          >
            <FiShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {!isAdmin && (
            <Link
              href="/admin/login"
              className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-purple-900/30 transition-colors text-gray-400"
            >
              <FiLayout className="w-4 h-4" />
              <span className="text-sm">الأدمن</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-purple-900/30 transition-colors text-purple-300"
            >
              <FiLayout className="w-4 h-4" />
              <span className="text-sm">لوحة التحكم</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FiUser className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{isAdmin ? 'أدمن' : user.displayName}</span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red-900/30 transition-colors text-red-400"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white text-sm"
            >
              <FiLogIn className="w-4 h-4" />
              <span>تسجيل دخول</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
