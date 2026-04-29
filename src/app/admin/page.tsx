'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, doc, updateDoc, deleteDoc, addDoc, onSnapshot } from 'firebase/firestore';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { Product, Order } from '@/types';
import { FiPackage, FiDollarSign, FiShoppingBag, FiClock, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiLoader } from 'react-icons/fi';

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, authLoading, router]);

  // Fetch products with realtime updates
  useEffect(() => {
    if (!user || !isAdmin) return;
    
    setLoadingProducts(true);
    const productsQ = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(productsQ, (snapshot) => {
      const productsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      setProducts(productsData);
      setLoadingProducts(false);
    }, (error) => {
      console.error('Error fetching products:', error);
      setLoadingProducts(false);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Fetch orders with realtime updates
  useEffect(() => {
    if (!user || !isAdmin) return;
    
    setLoadingOrders(true);
    const ordersQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(ordersQ, (snapshot) => {
      const ordersData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      setOrders(ordersData);
      setLoadingOrders(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoadingOrders(false);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if too large
          const maxSize = 800;
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.8
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveProduct = async () => {
    if (!productName.trim() || !productPrice.trim()) return;

    try {
      setUploading(true);
      setUploadProgress(10);
      let imageUrl = editingProduct?.imageUrl || '';

      if (productImageFile) {
        setUploadProgress(20);
        
        // Compress image before upload
        const compressedFile = await compressImage(productImageFile);
        
        const fileName = `products/${Date.now()}_${compressedFile.name}`;
        const storageRef = ref(storage, fileName);
        
        setUploadProgress(30);
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = 30 + (snapshot.bytesTransferred / snapshot.totalBytes) * 50;
              setUploadProgress(progress);
            },
            (error) => reject(error),
            async () => {
              setUploadProgress(85);
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              setUploadProgress(90);
              resolve(true);
            }
          );
        });
      }

      const productData = {
        name: productName.trim(),
        price: parseFloat(productPrice),
        description: productDesc.trim(),
        imageUrl,
        updatedAt: Date.now(),
      };

      setUploadProgress(95);
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: Date.now(),
        });
      }
      setUploadProgress(100);
      resetProductForm();
      // No need to call fetchProducts - onSnapshot will update automatically
    } catch (error) {
      console.error('Error saving product:', error);
      alert('خطأ في حفظ المنتج');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      // No need to call fetchProducts - onSnapshot will update automatically
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      // No need to call fetchOrders - onSnapshot will update automatically
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const resetProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setProductName('');
    setProductPrice('');
    setProductDesc('');
    setProductImageFile(null);
    setProductImagePreview('');
    setUploading(false);
    setUploadProgress(0);
  };

  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductPrice(product.price.toString());
    setProductDesc(product.description);
    setProductImageFile(null);
    setProductImagePreview(product.imageUrl || '');
    setShowProductForm(true);
  };

  const isLoadingTab = (activeTab === 'products' && loadingProducts) || (activeTab === 'orders' && loadingOrders);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const newOrders = orders.filter(o => o.status === 'new').length;

  const statusColors: Record<string, string> = {
    new: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50',
    processing: 'bg-blue-900/30 text-blue-400 border-blue-800/50',
    completed: 'bg-green-900/30 text-green-400 border-green-800/50',
    cancelled: 'bg-red-900/30 text-red-400 border-red-800/50',
  };

  const statusLabels: Record<string, string> = {
    new: 'جديد',
    processing: 'قيد المعالجة',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">لوحة تحكم الأدمن</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-[#1a1a2e] rounded-xl p-1 border border-purple-900/30">
        {[
          { key: 'dashboard', label: 'الإحصائيات', icon: FiDollarSign },
          { key: 'products', label: 'المنتجات', icon: FiPackage },
          { key: 'orders', label: 'الطلبات', icon: FiShoppingBag },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-purple-900/30'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#1a1a2e] rounded-xl border border-purple-900/30 p-6">
              <div className="flex items-center gap-3 mb-2">
                <FiDollarSign className="w-6 h-6 text-green-400" />
                <span className="text-gray-400">إجمالي الأرباح</span>
              </div>
              <p className="text-3xl font-bold text-green-400">{totalRevenue} ر.س</p>
            </div>
            <div className="bg-[#1a1a2e] rounded-xl border border-purple-900/30 p-6">
              <div className="flex items-center gap-3 mb-2">
                <FiShoppingBag className="w-6 h-6 text-blue-400" />
                <span className="text-gray-400">إجمالي الطلبات</span>
              </div>
              <p className="text-3xl font-bold text-blue-400">{totalOrders}</p>
            </div>
            <div className="bg-[#1a1a2e] rounded-xl border border-purple-900/30 p-6">
              <div className="flex items-center gap-3 mb-2">
                <FiClock className="w-6 h-6 text-yellow-400" />
                <span className="text-gray-400">طلبات جديدة</span>
              </div>
              <p className="text-3xl font-bold text-yellow-400">{newOrders}</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-[#1a1a2e] rounded-xl border border-purple-900/30 p-6">
            <h2 className="text-xl font-bold mb-4">آخر الطلبات</h2>
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                <div>
                  <p className="font-bold">{order.customerName}</p>
                  <p className="text-sm text-gray-400">{order.orderCode}</p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-purple-400">{order.total} ر.س</p>
                  <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">المنتجات ({products.length})</h2>
            <button
              onClick={() => { resetProductForm(); setShowProductForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
            >
              <FiPlus className="w-4 h-4" />
              إضافة منتج
            </button>
          </div>

          {/* Loading State */}
          {loadingProducts ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Product Form Modal */}
              {showProductForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-[#1a1a2e] rounded-2xl border border-purple-900/30 p-6 w-full max-w-md mx-4">
                <h3 className="text-xl font-bold mb-4">
                  {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">اسم المنتج</label>
                    <input
                      type="text"
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      className="w-full px-4 py-2 bg-[#0f0f1a] border border-purple-900/30 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="اسم المنتج"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">السعر (ر.س)</label>
                    <input
                      type="number"
                      value={productPrice}
                      onChange={e => setProductPrice(e.target.value)}
                      className="w-full px-4 py-2 bg-[#0f0f1a] border border-purple-900/30 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">الوصف</label>
                    <textarea
                      value={productDesc}
                      onChange={e => setProductDesc(e.target.value)}
                      className="w-full px-4 py-2 bg-[#0f0f1a] border border-purple-900/30 rounded-lg focus:border-purple-500 focus:outline-none h-24 resize-none"
                      placeholder="وصف المنتج"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">صورة المنتج</label>
                    {productImagePreview && (
                      <div className="mb-2 w-full h-32 rounded-lg overflow-hidden bg-purple-900/20">
                        <img src={productImagePreview} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          setProductImageFile(file);
                          const reader = new FileReader();
                          reader.onload = (ev) => setProductImagePreview(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProduct}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
                    >
                      {uploading ? `جاري الرفع... ${uploadProgress.toFixed(0)}%` : editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
                    </button>
                    <button
                      onClick={resetProductForm}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products List */}
          <div className="space-y-3">
            {products.map(product => (
              <div
                key={product.id}
                className="bg-[#1a1a2e] rounded-xl border border-purple-900/30 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {product.imageUrl && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-400">{product.description}</p>
                    <p className="text-purple-400 font-bold mt-1">{product.price} ر.س</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditProduct(product)}
                    className="p-2 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 transition-colors text-blue-400"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 transition-colors text-red-400"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <FiPackage className="w-12 h-12 mx-auto mb-4" />
                <p>لا توجد منتجات. أضف منتج جديد!</p>
              </div>
            )}
          </div>
          </>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 className="text-xl font-bold mb-6">الطلبات ({orders.length})</h2>
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-[#1a1a2e] rounded-xl border border-purple-900/30 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{order.customerName}</h3>
                    <p className="text-sm text-gray-400">{order.customerEmail}</p>
                    <p className="text-sm text-purple-400">دسكورد: {order.discordUsername}</p>
                    <p className="text-sm text-gray-500">كود الطلب: {order.orderCode}</p>
                    <p className="text-sm text-gray-500">
                      التاريخ: {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-purple-400">{order.total} ر.س</p>
                    <span className={`text-xs px-3 py-1 rounded-full border ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-[#0f0f1a] rounded-lg p-3 mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-1 text-sm">
                      <span>{item.productName} × {item.quantity}</span>
                      <span className="text-purple-400">{item.price * item.quantity} ر.س</span>
                    </div>
                  ))}
                </div>

                {/* Status Actions */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      order.status === 'processing' ? 'bg-blue-600 text-white' : 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                    }`}
                  >
                    <FiLoader className="w-3 h-3" />
                    قيد المعالجة
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      order.status === 'completed' ? 'bg-green-600 text-white' : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                    }`}
                  >
                    <FiCheck className="w-3 h-3" />
                    مكتمل
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      order.status === 'cancelled' ? 'bg-red-600 text-white' : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                    }`}
                  >
                    <FiX className="w-3 h-3" />
                    إلغاء
                  </button>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <FiShoppingBag className="w-12 h-12 mx-auto mb-4" />
                <p>لا توجد طلبات بعد</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
