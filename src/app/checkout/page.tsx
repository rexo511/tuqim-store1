'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { useAuth } from '@/lib/auth';
import { FiCheck, FiAlertCircle } from 'react-icons/fi';
import { SiDiscord } from 'react-icons/si';
import { v4 as uuidv4 } from 'uuid';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [discordUsername, setDiscordUsername] = useState('');
  const [discordConnected, setDiscordConnected] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for Discord OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      // Exchange code for user info
      exchangeDiscordCode(code);
    }
    
    // Check if Discord username is saved in localStorage
    const savedDiscord = localStorage.getItem('discordUsername');
    if (savedDiscord) {
      setDiscordUsername(savedDiscord);
      setDiscordConnected(true);
    }
  }, []);

  const exchangeDiscordCode = async (code: string) => {
    try {
      // This would normally be done on the backend
      // For now, we'll just mark as connected and let user enter manually
      setDiscordConnected(true);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Discord OAuth error:', error);
    }
  };

  const handleDiscordConnect = () => {
    // Discord OAuth URL
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || 'YOUR_DISCORD_CLIENT_ID';
    const redirectUri = encodeURIComponent(window.location.origin + '/checkout');
    const scope = 'identify';
    
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    
    window.location.href = discordAuthUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('يجب تسجيل الدخول أولاً');
      return;
    }
    if (!discordUsername.trim()) {
      setError('يجب إدخال يوزر دسكورد');
      return;
    }
    if (items.length === 0) {
      setError('السلة فارغة');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const code = 'TQ-' + uuidv4().substring(0, 8).toUpperCase();
      const orderData = {
        orderCode: code,
        customerName: user.displayName || 'غير معروف',
        customerEmail: user.email || '',
        discordUsername: discordUsername.trim(),
        items: items.map(item => ({
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          imageUrl: item.product.imageUrl || '',
        })),
        total,
        status: 'new',
        createdAt: Date.now(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      setOrderCode(code);
      setOrderPlaced(true);
      clearCart();
      // Save Discord username for future orders
      localStorage.setItem('discordUsername', discordUsername.trim());
    } catch (err) {
      console.error('Error placing order:', err);
      setError('حدث خطأ أثناء تقديم الطلب');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-[#1a1a2e] rounded-2xl border border-green-900/50 p-8 text-center">
          <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-green-400 mb-4">تم تقديم الطلب بنجاح!</h2>
          
          {/* Invoice */}
          <div className="bg-[#0f0f1a] rounded-xl p-6 text-right mb-6">
            <h3 className="text-lg font-bold text-purple-400 mb-4 text-center">فاتورة الطلب</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">كود الطلب</span>
                <span className="font-bold text-purple-400">{orderCode}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">يوزر دسكورد</span>
                <span className="font-bold">{discordUsername}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">الإيميل</span>
                <span className="font-bold">{user?.email}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">التاريخ</span>
                <span className="font-bold">{new Date().toLocaleDateString('ar-SA')}</span>
              </div>
              
              <div className="pt-4">
                <h4 className="font-bold mb-2">المنتجات:</h4>
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between py-1 text-sm">
                <span>{item.product.name} × {item.quantity}</span>
                    <span className="text-purple-400">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-700 mt-4">
                <span className="text-lg font-bold">الإجمالي</span>
              <span className="text-2xl font-bold text-purple-400">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-6">
            سيتم التواصل معك عبر دسكورد لإتمام الدفع وتسليم المنتج
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
          >
            العودة للمتجر
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    router.push('/');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>

      {!user ? (
        <div className="bg-[#1a1a2e] rounded-xl border border-yellow-900/50 p-6 text-center mb-6">
          <FiAlertCircle className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
          <p className="text-lg mb-4">يجب تسجيل الدخول أولاً</p>
          <button
            onClick={signInWithGoogle}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
          >
            تسجيل دخول بقوقل
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <div className="bg-[#1a1a2e] rounded-xl border border-purple-900/30 p-6">
            <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.product.id} className="flex justify-between">
                    <span>{item.product.name} × {item.quantity}</span>
                    <span className="text-purple-400">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
              ))}
              <div className="flex justify-between pt-4 border-t border-gray-700 font-bold text-lg">
                <span>الإجمالي</span>
                <span className="text-purple-400">{total} ر.س</span>
              </div>
            </div>
          </div>

          {/* Discord Username */}
          <div className="bg-[#1a1a2e] rounded-xl border border-purple-900/30 p-6">
            <h2 className="text-xl font-bold mb-4">معلومات التواصل</h2>
            
            {/* Discord Connect Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleDiscordConnect}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] rounded-lg transition-colors text-white font-medium"
              >
                <SiDiscord className="w-5 h-5" />
                {discordConnected ? 'تم الربط مع Discord' : 'ربط حساب Discord'}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                اربط حسابك تلقائياً أو أدخل اليوزر يدوياً
              </p>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1a1a2e] text-gray-500">أو</span>
              </div>
            </div>

            <label className="block text-sm text-gray-400 mb-2">
              يوزر دسكورد <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={discordUsername}
              onChange={(e) => setDiscordUsername(e.target.value)}
              placeholder="مثال: username#1234 أو username"
              className="w-full px-4 py-3 bg-[#0f0f1a] border border-purple-900/30 rounded-lg focus:border-purple-500 focus:outline-none transition-colors text-white"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              سيتم التواصل معك عبر دسكورد لإتمام الدفع وتسليم المنتج
            </p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors text-white font-bold text-lg"
          >
            {loading ? 'جاري تقديم الطلب...' : 'تقديم الطلب'}
          </button>
        </form>
      )}
    </div>
  );
}
