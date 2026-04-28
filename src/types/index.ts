export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  createdAt: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  discordUsername: string;
  items: { productName: string; price: number; quantity: number; imageUrl?: string }[];
  total: number;
  status: 'new' | 'processing' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  isAdmin: boolean;
}
