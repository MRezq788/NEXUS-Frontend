export type UserRole = 'warehouse' | 'business_owner' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Exclude<UserRole, null>;
}

export interface SidebarTab {
  title: string;
  route: string;
  icon?: React.ReactNode;
}

export type ProductStatus = 'In Stock' | 'Out of Stock';

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number; // Added price
  description: string;
  status: ProductStatus;
  category: string; // Made required
  lastUpdated: string;
}

// Add these to your existing types.ts file

export interface OrderProduct {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  buyer: string; // name or email
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  products: OrderProduct[];
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';