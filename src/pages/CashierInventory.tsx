import { useEffect, useMemo, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useTheme } from '../contexts/ThemeContext';
import { POSHeader } from '../components/Cashier/POSHeader';
import { CategoryTabs } from '../components/Cashier/CategoryTabs';
import { ProductGrid } from '../components/Cashier/ProductGrid';
import { ProductDetailModal } from '../components/Cashier/ProductDetailModal';
import { SidebarMenu } from '../components/Cashier/SidebarMenu';
import type { Category, Product } from '../lib/database.types';

interface CashierProductVariant {
  id: string;
  quantity: number;
  price?: number;
  attributes?: Record<string, string>;
}

interface CashierProductRecord {
  id: string;
  name: string;
  description?: string;
  category?: string;
  basePrice?: number;
  images?: string[];
  active?: boolean;
  createdAt?: string | { _seconds?: number; seconds?: number };
  variants?: CashierProductVariant[];
}

interface CashierProductsResponse {
  success: boolean;
  message: string;
  data: CashierProductRecord[];
}

interface ProductVariantMeta {
  sourceProductId: string;
  sourceVariantId: string;
  availableQuantity: number;
  variantLabel: string;
}

function toIsoDate(value: CashierProductRecord['createdAt']) {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  const seconds = typeof value.seconds === 'number' ? value.seconds : value._seconds;
  return seconds ? new Date(seconds * 1000).toISOString() : new Date().toISOString();
}

function toCategoryId(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

const CASHIER_SIDEBAR_STORAGE_KEY = 'cashier.sidebarCollapsed';
const CASHIER_INVENTORY_CACHE_KEY = 'cashier.inventory.page';
const PAGE_CACHE_TTL_MS = 60_000;

type CachedPayload<T> = { savedAt: number; data: T };

interface CashierInventoryCache {
  products: Product[];
  categories: Category[];
  meta: Record<string, ProductVariantMeta>;
}

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPageVisible, setIsPageVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(CASHIER_SIDEBAR_STORAGE_KEY) === '1';
  });
  const [products, setProducts] = useState<Product[]>(() => readPageCache<CashierInventoryCache>(CASHIER_INVENTORY_CACHE_KEY)?.products.slice() ?? []);
  const [categories, setCategories] = useState<Category[]>(() => readPageCache<CashierInventoryCache>(CASHIER_INVENTORY_CACHE_KEY)?.categories ?? []);
  const [isLoadingProducts, setIsLoadingProducts] = useState(() => !Boolean(readPageCache<CashierInventoryCache>(CASHIER_INVENTORY_CACHE_KEY)));
  const [productsError, setProductsError] = useState<string | null>(null);

  const [productVariantMeta, setProductVariantMeta] = useState<Record<string, ProductVariantMeta>>(() => readPageCache<CashierInventoryCache>(CASHIER_INVENTORY_CACHE_KEY)?.meta ?? {});

  const fetchCashierProducts = async (silent = false) => {
    if (!silent) setIsLoadingProducts(true);
    setProductsError(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setProducts([]);
        setCategories([]);
        setProductVariantMeta({});
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
        setProductVariantMeta({});
        setProductsError(json.message || 'Failed to fetch cashier inventory');
        return;
      }

      const mappedProducts: Product[] = [];
      const variantMetaMap: Record<string, ProductVariantMeta> = {};

      json.data.forEach((product) => {
        if (product.active === false) return;

        const categoryName = product.category || 'Uncategorized';
        const categoryId = toCategoryId(categoryName);

        (product.variants || []).forEach((variant) => {
          const availableQty = Number(variant.quantity) || 0;
          if (availableQty <= 0) return;

          const fallbackPrice = typeof variant.price === 'number'
            ? variant.price
            : (typeof product.basePrice === 'number' ? product.basePrice : 0);

          const variantLabel = variant.attributes
            ? Object.values(variant.attributes).filter(Boolean).join(' / ')
            : '';
          const displayId = `${product.id}__${variant.id}`;

          mappedProducts.push({
            id: displayId,
            name: variantLabel ? `${product.name} (${variantLabel})` : product.name,
            category_id: categoryId,
            price: fallbackPrice,
            image_url: product.images?.[0] || null,
            description: product.description || 'Allocated product ready for sale.',
            created_at: toIsoDate(product.createdAt),
          });

          variantMetaMap[displayId] = {
            sourceProductId: product.id,
            sourceVariantId: variant.id,
            availableQuantity: availableQty,
            variantLabel: variantLabel || variant.id,
          };
        });
      });

      const groupedCategories = mappedProducts.reduce<Map<string, Category>>((map, product) => {
        const categoryKey = product.category_id || 'uncategorized';
        const existing = map.get(categoryKey);
        if (existing) {
          existing.item_count += 1;
          return map;
        }

        const categoryName = product.category_id
          ?.split('-')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ') || 'Uncategorized';

        map.set(categoryKey, {
          id: categoryKey,
          name: categoryName,
          icon: 'package',
          item_count: 1,
          created_at: new Date().toISOString(),
        });
        return map;
      }, new Map());

      setProducts(mappedProducts);
      setProductVariantMeta(variantMetaMap);
      const nextCategories: Category[] = [
        {
          id: 'all-menu',
          name: 'All Menu',
          icon: 'layout-grid',
          item_count: mappedProducts.length,
          created_at: new Date().toISOString(),
        },
        ...Array.from(groupedCategories.values()),
      ];
      setCategories(nextCategories);
      writePageCache<CashierInventoryCache>(CASHIER_INVENTORY_CACHE_KEY, {
        products: mappedProducts,
        categories: nextCategories,
        meta: variantMetaMap,
      });
    } catch (error) {
      console.error('Error fetching cashier products:', error);
      setProducts([]);
      setCategories([]);
      setProductVariantMeta({});
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
    fetchCashierProducts(products.length > 0);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CASHIER_SIDEBAR_STORAGE_KEY, isSidebarCollapsed ? '1' : '0');
  }, [isSidebarCollapsed]);

  const filteredProducts = useMemo(
    () => (selectedCategory ? products.filter((p) => p.category_id === selectedCategory) : products),
    [products, selectedCategory],
  );

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
      <SidebarMenu isDark={isDark} isCollapsed={isSidebarCollapsed} onToggle={setIsSidebarCollapsed} />

      <div className={`flex-1 flex flex-col overflow-hidden transform-gpu transition-all duration-500 ${
        isPageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <POSHeader isDark={isDark} onMenuClick={() => setIsSidebarCollapsed((prev) => !prev)} />

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
          isDark={isDark}
          product={selectedProduct}
          maxQuantity={productVariantMeta[selectedProduct.id]?.availableQuantity}
          readOnly
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
