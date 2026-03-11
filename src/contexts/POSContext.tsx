/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Product } from '../lib/database.types';

interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

interface POSContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, notes?: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  selectedTable: string | null;
  setSelectedTable: (table: string | null) => void;
  orderType: string;
  setOrderType: (type: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [orderType, setOrderType] = useState('Dine In');
  const [customerName, setCustomerName] = useState('');
  const [promoCode, setPromoCode] = useState('');

  const addToCart = (product: Product, quantity = 1, notes = '') => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
            : item
        );
      }
      return [...prev, { product, quantity, notes }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setPromoCode('');
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const tax = subtotal * 0.1;
  const discount = promoCode ? 1.0 : 0;
  const total = subtotal + tax - discount;

  return (
    <POSContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        tax,
        discount,
        total,
        selectedTable,
        setSelectedTable,
        orderType,
        setOrderType,
        customerName,
        setCustomerName,
        promoCode,
        setPromoCode,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within POSProvider');
  }
  return context;
}
