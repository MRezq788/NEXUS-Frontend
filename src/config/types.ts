export type UserRole = "warehouse" | "business_owner" | null;

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

export type ProductStatus = "In Stock" | "Out of Stock";

export interface ProductVariant {
  id: string;
  attributes: Record<string, string>;
  price: number;
  quantity: number;
}

export interface ProductAttribute {
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  basePrice?: number;
  description: string;
  status: ProductStatus;
  category: string;
  images?: string[];
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  active?: boolean;
  lastUpdated: string;
  createdAt?: string;
  updatedAt?: string;
}

// Add these to your existing types.ts file

export interface OrderProduct {
  productId: string;
  quantity: number;
  price?: number;
  variantId?: string;
  variantAttributes?: Record<string, string>;
  productName?: string;
  productImage?: string;
  unit?: string;
  lineTotal?: number;
}

export interface Order {
  id: string;
  buyer: string;
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: string;
  updatedAt?: string;
  ownerProductAccess?: boolean;
  ownerProductAccessAt?: string | null;
  products: OrderProduct[];
}

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";
