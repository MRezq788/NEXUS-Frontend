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
import { mockTables } from '../lib/mockData';
import type { Category, Product } from '../lib/database.types';
import { usersApi } from '../api';
import type { AllocationHistoryEntry, CashierPosSaleOrderPayload } from '../api/users';

interface CashierProductVariant {
  id: string;
  quantity: number;
  price?: number;
  [key: string]: any;
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

interface PosInventoryCache {
  products: Product[];
  categories: Category[];
  meta: Record<string, ProductVariantMeta>;
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
const POS_INVENTORY_CACHE_KEY = 'cashier.pos.inventory';
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPageVisible, setIsPageVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(CASHIER_SIDEBAR_STORAGE_KEY) === '1';
  });
  const [orderNumber, setOrderNumber] = useState('#1000');
  const [products, setProducts] = useState<Product[]>(() => readPageCache<PosInventoryCache>(POS_INVENTORY_CACHE_KEY)?.products.slice() ?? []);
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
    subtotal,
    tax,
    discount,
    total,
    selectedTable,
    orderType,
    customerName,
    promoCode,
  } = usePOS();

  const [productVariantMeta, setProductVariantMeta] = useState<Record<string, ProductVariantMeta>>(() => readPageCache<PosInventoryCache>(POS_INVENTORY_CACHE_KEY)?.meta ?? {});

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

          const { id: _vId, price: _vP, quantity: _vQ, ...attrs } = variant;
          const variantLabel = Object.keys(attrs).length > 0
            ? Object.values(attrs).filter(Boolean).join(' / ')
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

      setProducts(mappedProducts);
      setProductVariantMeta(variantMetaMap);
      setCategories(nextCategories);
      writePageCache<PosInventoryCache>(POS_INVENTORY_CACHE_KEY, {
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

  const filteredProducts = useMemo(
    () => (selectedCategory ? products.filter((p) => p.category_id === selectedCategory) : products),
    [products, selectedCategory],
  );

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (quantity: number, notes: string) => {
    if (selectedProduct) {
      const maxQuantity = productVariantMeta[selectedProduct.id]?.availableQuantity ?? Number.POSITIVE_INFINITY;
      const existingQuantity = cartItems.find((item) => item.product.id === selectedProduct.id)?.quantity ?? 0;
      const remainingQuantity = Number.isFinite(maxQuantity)
        ? Math.max(0, maxQuantity - existingQuantity)
        : quantity;
      const safeQuantity = Math.min(quantity, remainingQuantity);

      if (safeQuantity <= 0) {
        alert('This product reached its available quantity limit.');
        setSelectedProduct(null);
        return;
      }

      addToCart(selectedProduct, safeQuantity, notes);
      setSelectedProduct(null);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || isPlacingOrder) return;

    const saleItems = cartItems
      .map((item) => {
        const meta = productVariantMeta[item.product.id];
        if (!meta) return null;
        return {
          productId: meta.sourceProductId,
          variantId: meta.sourceVariantId,
          quantity: item.quantity,
        };
      })
      .filter((item): item is { productId: string; variantId: string; quantity: number } => Boolean(item));

    if (saleItems.length !== cartItems.length) {
      alert('Some cart items are missing variant mapping. Please re-add them.');
      return;
    }

    const orderPayload: CashierPosSaleOrderPayload = {
      orderNumber,
      subtotal,
      tax,
      discount,
      total,
      orderType,
      tableId: selectedTable,
      customerName,
      promoCode,
    };

    setIsPlacingOrder(true);
    try {
      await usersApi.createCashierPosSale(saleItems, orderPayload);
      const newOrderNumber = `#${(parseInt(orderNumber.slice(1)) + 1).toString().padStart(4, '0')}`;
      setOrderNumber(newOrderNumber);
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
            tables={mockTables}
            orderNumber={orderNumber}
            onPlaceOrder={handlePlaceOrder}
            isPlacingOrder={isPlacingOrder}
            productMaxQuantitiesById={Object.fromEntries(
              Object.entries(productVariantMeta).map(([productId, meta]) => [
                productId,
                meta.availableQuantity,
              ]),
            )}
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
          isDark={isDark}
          product={selectedProduct}
          maxQuantity={productVariantMeta[selectedProduct.id]?.availableQuantity}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}
