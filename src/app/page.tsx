'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { FiShoppingCart, FiPackage } from 'react-icons/fi';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(items);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12 py-12">
        <h1 className="logo-3d text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 bg-clip-text text-transparent mb-4">
          Tuqim Store
        </h1>
        <p className="text-gray-400 text-lg">متجر رقمي للمنتجات الرقمية المميزة</p>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <FiPackage className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">لا توجد منتجات حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div
              key={product.id}
              className="bg-[#1a1a2e] rounded-xl border border-purple-900/30 p-6 hover:border-purple-600/50 transition-all glow-purple-hover"
            >
              {product.imageUrl ? (
                <div className="w-full h-40 rounded-xl mb-4 overflow-hidden bg-purple-900/20">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-40 bg-purple-900/30 rounded-xl mb-4">
                  <FiPackage className="w-12 h-12 text-purple-400" />
                </div>
              )}
              <h3 className="text-lg font-bold text-center mb-2">{product.name}</h3>
              <p className="text-gray-400 text-sm text-center mb-4 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-purple-400">
                  {formatPrice(product.price)}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white text-sm"
                >
                  <FiShoppingCart className="w-4 h-4" />
                  أضف للسلة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
