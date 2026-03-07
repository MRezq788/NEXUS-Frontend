export interface Category {
  id: string;
  name: string;
  icon: string;
  item_count: number;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  price: number;
  image_url: string;
  description: string;
}

export interface RestaurantTable {
  id: string;
  table_number: string;
  status: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  table_id: string;
  order_type: string;
  status: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  promo_code: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  notes: string;
}
