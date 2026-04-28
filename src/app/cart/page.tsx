'use client';

import { useCart } from '@/lib/cart';
import Link from 'next/link';
import { FiTrash2, FiPlus, FiMinus, FiShoppingCart } from 'react-icons/fi';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <FiShoppingCart className="w-20 h-20 mx-auto text-gray-600 mb-6" />
        <h2 className="text-2xl font-bold mb-4">السلة فارغة</h2>
        <p className="text-gray-400 mb-6">لم تضف أي منتجات بعد</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
        >
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        <FiShoppingCart className="inline-block w-8 h-8 ml-2" />
        سلة التسوق ({itemCount})
      </h1>

      <div className="space-y-4 mb-8">
        {items.map(item => (
          <div
            key={item.product.id}
            className="bg-[#1a1a2e] rounded-xl border border-purple-900/30 p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <h3 className="font-bold text-lg">{item.product.name}</h3>
              <p className="text-purple-400 font-bold">{item.product.price} ر.س</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                className="p-2 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 transition-colors"
              >
                <FiMinus className="w-4 h-4" />
              </button>
              <span className="text-lg font-bold w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                className="p-2 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
              </button>
              <span className="text-lg font-bold text-purple-400 mx-4">
                {item.product.price * item.quantity} ر.س
              </span>
              <button
                onClick={() => removeFromCart(item.product.id)}
                className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 transition-colors text-red-400"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total & Checkout */}
      <div className="bg-[#1a1a2e] rounded-xl border border-purple-900/30 p-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl text-gray-400">الإجمالي</span>
          <span className="text-3xl font-bold text-purple-400">{total} ر.س</span>
        </div>
        <Link
          href="/checkout"
          className="block w-full text-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white font-bold text-lg"
        >
          إتمام الطلب
        </Link>
      </div>
    </div>
  );
}
