import { useEffect, useMemo, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { usePOS } from '../contexts/POSContext';
import { useTheme } from '../contexts/ThemeContext';
import { POSHeader } from '../components/Cashier/POSHeader';
import { CategoryTabs } from '../components/Cashier/CategoryTabs';
import { ProductGrid } from '../components/Cashier/ProductGrid';
import { OrderPanel } from '../components/Cashier/OrderPanel';
import { ProductDetailModal } from '../components/Cashier/ProductDetailModal';
import { SidebarMenu } from '../components/Cashier/SidebarMenu';
import type { Category } from '../lib/database.types';
import { usersApi } from '../api';
import type { AllocationHistoryEntry, CashierPosSaleOrderPayload } from '../api/users';
import {
  createCashierCartProduct,
  mapCashierCatalogProducts,
  type CashierApiProductRecord,
  type CashierCatalogProduct,
  type CashierCatalogVariant,
} from '../lib/cashierCatalog';

interface CashierProductsResponse {
  success: boolean;
  message: string;
  data: CashierApiProductRecord[];
}

interface PosInventoryCache {
  products: CashierCatalogProduct[];
  categories: Category[];
}

const CASHIER_SIDEBAR_STORAGE_KEY = 'cashier.sidebarCollapsed';
const POS_INVENTORY_CACHE_KEY = 'cashier.pos.inventory.v2';
const POS_HISTORY_CACHE_KEY = 'cashier.pos.history';
const PAGE_CACHE_TTL_MS = 60_000;

type CachedPayload<T> = { savedAt: number; data: T };

function readPageCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload<T>;
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > PAGE_CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writePageCache<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  const payload: CachedPayload<T> = { savedAt: Date.now(), data };
  window.localStorage.setItem(key, JSON.stringify(payload));
}

export function PointOfSale() {
  const { isDark } = useTheme();
  const [currency, setCurrency] = useState(() => localStorage.getItem('pos.currency') || 'EGP');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<CashierCatalogProduct | null>(null);
  const [isPageVisible, setIsPageVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(CASHIER_SIDEBAR_STORAGE_KEY) === '1';
  });
  const [products, setProducts] = useState<CashierCatalogProduct[]>(() => readPageCache<PosInventoryCache>(POS_INVENTORY_CACHE_KEY)?.products.slice() ?? []);
  const [categories, setCategories] = useState<Category[]>(() => readPageCache<PosInventoryCache>(POS_INVENTORY_CACHE_KEY)?.categories ?? []);
  const [history, setHistory] = useState<AllocationHistoryEntry[]>(() => readPageCache<AllocationHistoryEntry[]>(POS_HISTORY_CACHE_KEY)?.slice() ?? []);
  const [isLoadingProducts, setIsLoadingProducts] = useState(() => !readPageCache<PosInventoryCache>(POS_INVENTORY_CACHE_KEY));
  const [isLoadingHistory, setIsLoadingHistory] = useState(() => !readPageCache<AllocationHistoryEntry[]>(POS_HISTORY_CACHE_KEY));
  const [productsError, setProductsError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const {
    addToCart,
    clearCart,
    cartItems,
    total,
  } = usePOS();

  const fetchCashierProducts = async (silent = false) => {
    if (!silent) setIsLoadingProducts(true);
    setProductsError(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setProducts([]);
        setCategories([]);
        setProductsError('User not authenticated.');
        return;
      }

      const token = await user.getIdToken();
      const res = await fetch('http://localhost:3000/api/shop-products?page=1&limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-User-Email': user.email || '',
        },
      });

      const json: CashierProductsResponse = await res.json();
      if (!res.ok || !json.success) {
        setProducts([]);
        setCategories([]);
        setProductsError(json.message || 'Failed to fetch cashier inventory');
        return;
      }

      const catalog = mapCashierCatalogProducts(json.data);
      setProducts(catalog.products);
      setCategories(catalog.categories);
      writePageCache<PosInventoryCache>(POS_INVENTORY_CACHE_KEY, catalog);
    } catch (error) {
      console.error('Error fetching cashier products:', error);
      setProducts([]);
      setCategories([]);
      setProductsError(error instanceof Error ? error.message : 'Failed to load cashier inventory.');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchHistory = async (silent = false) => {
    if (!silent) setIsLoadingHistory(true);
    try {
      const response = await usersApi.getAllocationHistory(8);
      const historyData = response.data?.history;
      const nextHistory = Array.isArray(historyData) ? historyData : historyData ? [historyData] : [];
      setHistory(nextHistory);
      writePageCache(POS_HISTORY_CACHE_KEY, nextHistory);
    } catch (error) {
      console.error('Error fetching cashier allocation history:', error);
      setHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setIsPageVisible(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const hasInventoryCache = !!readPageCache<PosInventoryCache>(POS_INVENTORY_CACHE_KEY);
    const hasHistoryCache = !!readPageCache<AllocationHistoryEntry[]>(POS_HISTORY_CACHE_KEY);
    fetchCashierProducts(hasInventoryCache);
    fetchHistory(hasHistoryCache);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CASHIER_SIDEBAR_STORAGE_KEY, isSidebarCollapsed ? '1' : '0');
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('pos.currency', currency);
  }, [currency]);

  const filteredProducts = useMemo(
    () => (selectedCategory ? products.filter((p) => p.category_id === selectedCategory) : products),
    [products, selectedCategory],
  );

  const handleProductClick = (product: CashierCatalogProduct) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (
    variant: CashierCatalogVariant,
    quantity: number,
    notes: string,
  ) => {
    if (!selectedProduct) return;

    const cartProduct = createCashierCartProduct(selectedProduct, variant);
    const existingQuantity = cartItems.find((item) => item.product.id === cartProduct.id)?.quantity ?? 0;
    const remainingQuantity = Math.max(0, cartProduct.maxQuantity - existingQuantity);
    const safeQuantity = Math.min(quantity, remainingQuantity);

    if (safeQuantity <= 0) {
      alert('This variant reached its available quantity limit.');
      return;
    }

    addToCart(cartProduct, safeQuantity, notes);
    setSelectedProduct(null);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || isPlacingOrder) return;

    const saleItems = cartItems.map((item) => ({
      productId: item.product.sourceProductId,
      variantId: item.product.sourceVariantId,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const orderPayload: CashierPosSaleOrderPayload = { total };

    setIsPlacingOrder(true);
    try {
      await usersApi.createCashierPosSale(saleItems, orderPayload);
      clearCart();
      await fetchCashierProducts();
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing POS order:', error);
      alert(error instanceof Error ? error.message : 'Failed to place order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleCloseOrder = () => {
    if (cartItems.length > 0) {
      if (confirm('Are you sure you want to close this order? All items will be cleared.')) {
        clearCart();
      }
    }
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
      <SidebarMenu isDark={isDark} isCollapsed={isSidebarCollapsed} onToggle={setIsSidebarCollapsed} />

      <div className={`flex-1 flex overflow-hidden transform-gpu transition-all duration-500 ${
        isPageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="flex-1 flex flex-col overflow-hidden">
          <POSHeader
            isDark={isDark}
            onMenuClick={() => setIsSidebarCollapsed((prev) => !prev)}
            onCloseOrder={handleCloseOrder}
            showCloseOrder
            currency={currency}
            onCurrencyChange={setCurrency}
          />

          <div className={`px-3 sm:px-4 md:px-6 pt-4 pb-2 border-b ${isDark ? 'bg-[#1e1f23] border-[#2d2e33]' : 'bg-slate-50 border-gray-200'}`}>
            <CategoryTabs
              isDark={isDark}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 scrollbar-hide space-y-4">
            {productsError ? (
              <div className={`rounded-2xl border px-4 py-3 text-sm ${isDark ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-red-200 bg-red-50 text-red-700'}`}>
                {productsError}
              </div>
            ) : isLoadingProducts ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : (
               <ProductGrid
                 isDark={isDark}
                 products={filteredProducts}
                 categories={categories}
                 onProductClick={handleProductClick}
                 currency={currency}
               />
            )}

            <section className={`rounded-2xl border ${isDark ? 'bg-[#1e1f23] border-[#2d2e33]' : 'bg-white border-gray-100 shadow-lg shadow-gray-200/30'}`}>
              <div className={`px-5 py-4 border-b ${isDark ? 'border-[#2d2e33]' : 'border-gray-100'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Recent Allocation History
                </h3>
              </div>

              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <p className={`px-5 py-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No allocation history yet.
                </p>
              ) : (
                <div className={isDark ? 'divide-y divide-[#2d2e33]' : 'divide-y divide-gray-100'}>
                  {history.map((entry) => (
                    <div key={entry.id} className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {entry.productName}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {entry.variantAttributes} • Qty {entry.quantity}
                        </p>
                      </div>
                      <div className="text-sm md:text-right">
                        <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>From {entry.ownerName}</p>
                        <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>{new Date(entry.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {!isLoadingProducts && !productsError && products.length === 0 && (
            <div className={`px-3 sm:px-4 md:px-6 pb-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              No allocated products available yet. Ask the owner to allocate inventory to your account.
            </div>
          )}
        </div>

        <div className="hidden md:flex h-full">
          <OrderPanel
            isDark={isDark}
            onPlaceOrder={handlePlaceOrder}
            isPlacingOrder={isPlacingOrder}
            currency={currency}
          />
        </div>
      </div>

      {cartItems.length > 0 && (
        <div className="md:hidden fixed bottom-4 right-4 z-20">
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="bg-blue-600 text-white px-6 py-4 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-all"
          >
            <span className="font-semibold">View Cart</span>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-[#18191b] text-blue-400' : 'bg-white text-blue-600'}`}>
              {cartItems.length}
            </span>
          </button>
        </div>
      )}

       {selectedProduct && (
         <ProductDetailModal
           key={selectedProduct.id}
           isDark={isDark}
           product={selectedProduct}
           onClose={() => setSelectedProduct(null)}
           onAddToCart={handleAddToCart}
           currency={currency}
         />
       )}
    </div>
  );
}
