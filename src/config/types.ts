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