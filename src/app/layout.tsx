import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Tuqim Store - متجر رقمي',
  description: 'متجر Tuqim Store لبيع المنتجات الرقمية',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen pt-16">
              {children}
            </main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
