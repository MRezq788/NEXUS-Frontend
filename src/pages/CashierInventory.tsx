import { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '../api/base';
import { getAuth } from 'firebase/auth';
import { useTheme } from '../contexts/ThemeContext';
import { POSHeader } from '../components/Cashier/POSHeader';
import { CategoryTabs } from '../components/Cashier/CategoryTabs';
import { ProductGrid } from '../components/Cashier/ProductGrid';
import { ProductDetailModal } from '../components/Cashier/ProductDetailModal';
import { SidebarMenu } from '../components/Cashier/SidebarMenu';
import {
  mapCashierCatalogProducts,
  type CashierApiProductRecord,
  type CashierCatalogProduct,
} from '../lib/cashierCatalog';
import type { Category } from '../lib/database.types';

interface CashierProductsResponse {
  success: boolean;
  message: string;
  data: CashierApiProductRecord[];
}

interface CashierInventoryCache {
  products: CashierCatalogProduct[];
  categories: Category[];
}

const CASHIER_SIDEBAR_STORAGE_KEY = 'cashier.sidebarCollapsed';
const CASHIER_INVENTORY_CACHE_KEY = 'cashier.inventory.page.v2';
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

export function CashierInventory() {
  const { isDark } = useTheme();
  const [currency, setCurrency] = useState(() => localStorage.getItem('pos.currency') || 'EGP');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<CashierCatalogProduct | null>(null);
  const [isPageVisible, setIsPageVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(CASHIER_SIDEBAR_STORAGE_KEY) === '1';
  });
  const [products, setProducts] = useState<CashierCatalogProduct[]>(() => readPageCache<CashierInventoryCache>(CASHIER_INVENTORY_CACHE_KEY)?.products.slice() ?? []);
  const [categories, setCategories] = useState<Category[]>(() => readPageCache<CashierInventoryCache>(CASHIER_INVENTORY_CACHE_KEY)?.categories ?? []);
  const [isLoadingProducts, setIsLoadingProducts] = useState(
    () => readPageCache<CashierInventoryCache>(CASHIER_INVENTORY_CACHE_KEY) == null,
  );
  const [productsError, setProductsError] = useState<string | null>(null);

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
      const res = await fetch(`${BASE_URL}/shop-products?page=1&limit=100`, {
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
      writePageCache<CashierInventoryCache>(CASHIER_INVENTORY_CACHE_KEY, catalog);
    } catch (error) {
      console.error('Error fetching cashier products:', error);
      setProducts([]);
      setCategories([]);
      setProductsError(error instanceof Error ? error.message : 'Failed to load cashier inventory.');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setIsPageVisible(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchCashierProducts(true);
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

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
      <SidebarMenu isDark={isDark} isCollapsed={isSidebarCollapsed} onToggle={setIsSidebarCollapsed} />

      <div className={`flex-1 flex flex-col overflow-hidden transform-gpu transition-all duration-500 ${
        isPageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <POSHeader isDark={isDark} onMenuClick={() => setIsSidebarCollapsed((prev) => !prev)} currency={currency} onCurrencyChange={setCurrency} />

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
            />
          )}
        </div>

        {!isLoadingProducts && !productsError && products.length === 0 && (
          <div className={`px-3 sm:px-4 md:px-6 pb-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            No allocated products available yet. Ask the owner to allocate inventory to your account.
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductDetailModal
          key={selectedProduct.id}
          isDark={isDark}
          product={selectedProduct}
          readOnly
          currency={currency}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
