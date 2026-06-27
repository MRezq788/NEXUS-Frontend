import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { getAuth } from "firebase/auth";
import { ProductDetail } from "./ProductDetail";
import { BASE_URL } from "../api/base";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RecommendedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  basePrice?: number;
  quantity: number;
  unit: string;
  category: string;
  images: string[];
  warehouseEmail: string;
  warehouseName: string;
  variants?: { id: string; price: number; quantity: number; attributes?: Record<string, string>; [key: string]: any }[];
  status?: string;
  lastUpdated?: string | { _seconds: number; _nanoseconds: number };
  updatedAt?: string | { _seconds: number; _nanoseconds: number };
  createdAt?: string | { _seconds: number; _nanoseconds: number };
}

interface CartItem {
  product: RecommendedProduct;
  quantity: number;
  variantId?: string;
  variantAttributes?: Record<string, string>;
  unitPrice: number;
}

interface ApiResponse {
  success: boolean;
  data: RecommendedProduct[];
  message: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────


const PAGE_SIZE = 8;

// ─── Icon helpers ────────────────────────────────────────────────────────────

const IconComponent = ({ name, isDark }: { name: string; isDark: boolean }) => {
  const color = isDark ? "#9ca3af" : "#6b7280";

  const icons: Record<string, React.ReactElement> = {
    search: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    box: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    warehouse: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 20h20M4 20V8l8-5 8 5v12M9 20v-5h6v5M9 12h.01M15 12h.01" />
      </svg>
    ),
    arrowLeft: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    ),
    trash: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    cart: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
    minus: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
      </svg>
    ),
    plus: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    chevronLeft: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    ),
    chevronRight: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    ),
  };

  return icons[name] || null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAvailableStock(product: RecommendedProduct, variantId?: string): number {
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    if (variantId) {
      const variant = product.variants.find((item) => item.id === variantId);
      return Number(variant?.quantity) || 0;
    }
    return product.variants.reduce((sum, variant) => sum + (Number(variant.quantity) || 0), 0);
  }
  return Number(product.quantity) || 0;
}

function getCartItemKey(productId: string, variantId?: string): string {
  return `${productId}::${variantId || "default"}`;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function Recommendations() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Data state
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state: "grid" or "detail"
  const [selectedProduct, setSelectedProduct] = useState<RecommendedProduct | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // ── Fetch recommendations ──────────────────────────────────────────────────

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user?.getIdToken();

      const res = await fetch(`${BASE_URL}/shop-products/recommendations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-User-Email": user?.email || "",
        },
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status} ${res.statusText}`);
      }

      const json: ApiResponse = await res.json();

      if (!json.success) {
        throw new Error(json.message || "Failed to fetch recommendations");
      }

      setProducts(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // ── Filtered & paginated products ───────────────────────────────────────────

  const filteredProducts = products;

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ── Cart helpers ───────────────────────────────────────────────────────────

  const addToCart = (
    product: RecommendedProduct,
    quantity: number,
    options?: {
      variantId?: string;
      variantAttributes?: Record<string, string>;
      unitPrice?: number;
    },
  ) => {
    const availableStock = getAvailableStock(product, options?.variantId);
    if (availableStock <= 0) return;

    const key = getCartItemKey(product.id, options?.variantId);
    const unitPrice = Number(options?.unitPrice ?? product.price ?? product.basePrice ?? 0);

    setCart((prev) => {
      const existing = prev.find(
        (item) => getCartItemKey(item.product.id, item.variantId) === key,
      );
      if (existing) {
        const nextQuantity = Math.min(existing.quantity + quantity, availableStock);
        return prev.map((item) =>
          getCartItemKey(item.product.id, item.variantId) === key
            ? { ...item, quantity: nextQuantity }
            : item,
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: Math.min(quantity, availableStock),
          variantId: options?.variantId,
          variantAttributes: options?.variantAttributes,
          unitPrice,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number, variantId?: string) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (getCartItemKey(item.product.id, item.variantId) !== getCartItemKey(productId, variantId)) {
            return item;
          }
          const availableStock = getAvailableStock(item.product, item.variantId);
          const nextQuantity = Math.max(0, Math.min(item.quantity + delta, availableStock));
          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    const key = getCartItemKey(productId, variantId);
    setCart((prev) =>
      prev.filter((item) => getCartItemKey(item.product.id, item.variantId) !== key),
    );
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // ── Place order ────────────────────────────────────────────────────────────

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setOrdering(true);
    setOrderError(null);
    setOrderSuccess(false);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user?.getIdToken();

      // Group cart items by warehouse
      const ordersByWarehouse = new Map<string, CartItem[]>();
      for (const item of cart) {
        const warehouseEmail = item.product.warehouseEmail;
        if (!ordersByWarehouse.has(warehouseEmail)) {
          ordersByWarehouse.set(warehouseEmail, []);
        }
        ordersByWarehouse.get(warehouseEmail)!.push(item);
      }

      // Build orders array
      const orders = Array.from(ordersByWarehouse.entries()).map(([sellerEmail, items]) => {
        const orderTotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        return {
          buyerEmail: user?.email || "",
          sellerEmail,  // ← At ORDER level ✓
          total: Math.round(orderTotal * 100) / 100,
          products: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.unitPrice,
            variantId: item.variantId,
            variantAttributes: item.variantAttributes,
            productName: item.product.name,
            productImage: item.product.images?.[0] || "",
            unit: item.product.unit,
            lineTotal: Math.round(item.unitPrice * item.quantity * 100) / 100,
          })),
        };
      });

      // Send to bulk endpoint if multiple warehouses, single if one
      let res;
      if (orders.length === 1) {
        res = await fetch(`${BASE_URL}/warehouse-shop/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-user-email": user?.email || "",
          },
          body: JSON.stringify(orders[0]),
        });
      } else {
        res = await fetch(`${BASE_URL}/warehouse-shop/orders/bulk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-user-email": user?.email || "",
          },
          body: JSON.stringify({ orders }),
        });
      }

      if (res.status === 201 || res.ok) {
        setOrderSuccess(true);
        setCart([]);
        setTimeout(() => setOrderSuccess(false), 3000);
      } else {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || `Order failed (${res.status})`);
      }
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setOrdering(false);
    }
  };

  // ── Price display helper ───────────────────────────────────────────────────

  const getDisplayPrice = (product: RecommendedProduct): string => {
    if (product.variants && product.variants.length > 0) {
      const minPrice = Math.min(...product.variants.map((v) => v.price || product.price || 0));
      return `$${minPrice.toFixed(2)}+`;
    }
    return `$${(product.price || product.basePrice || 0).toFixed(2)}`;
  };

  const getStockStatus = (product: RecommendedProduct): { text: string; inStock: boolean } => {
    if (product.variants && product.variants.length > 0) {
      const totalQty = product.variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
      return totalQty > 0 ? { text: `${totalQty} in stock`, inStock: true } : { text: "Out of stock", inStock: false };
    }
    return (product.quantity || 0) > 0
      ? { text: `${product.quantity} in stock`, inStock: true }
      : { text: "Out of stock", inStock: false };
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleProductClick = (product: RecommendedProduct) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackFromDetail = () => {
    setSelectedProduct(null);
  };

  const handleBackToWarehouses = () => {
    navigate("/warehouses");
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  // ── Adapt product for ProductDetail ─────────────────────────────────────────
  
  const getAdaptedProduct = (product: RecommendedProduct) => {
    // Ensure variants have attributes object for getVariantAttributes
    return {
      ...product,
      variants: product.variants?.map(v => ({
        ...v,
        attributes: v.attributes || {},
      })),
    };
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full">
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto pr-4">
        {selectedProduct ? (
          // Product Detail View — NO duplicate header, pass warehouse name as title
          <ProductDetail
            product={getAdaptedProduct(selectedProduct) as any}
            onBack={handleBackFromDetail}
            onAddToCart={addToCart as any}
            pageTitle={selectedProduct.warehouseName} // ← Shows warehouse name instead of "Product Details"
          />
        ) : (
          // Grid View
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBackToWarehouses}
                    className={`p-2 rounded-xl transition-colors ${
                      isDark ? "hover:bg-[#2b2c2e] text-gray-400" : "hover:bg-gray-100 text-gray-500"
                    }`}
                  >
                    <IconComponent name="arrowLeft" isDark={isDark} />
                  </button>
                  <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Recommendations
                  </h2>
                </div>
                <p className={`mt-1 ml-12 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                  Curated products from all warehouses
                </p>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl overflow-hidden ${
                      isDark ? "bg-[#18191b]" : "bg-white border border-gray-100 shadow-lg shadow-gray-200/50"
                    }`}
                  >
                    <div className={`h-48 animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
                    <div className="p-4 space-y-3">
                      <div className={`h-4 w-2/3 rounded animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
                      <div className={`h-3 w-1/2 rounded animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
                      <div className={`h-3 w-1/3 rounded animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-red-500 font-medium">{error}</p>
                <button onClick={fetchRecommendations} className="mt-3 text-sm text-blue-500 hover:underline">
                  Try again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className={`text-center py-16 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                "No recommendations available"
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedProducts.map((product, idx) => {
                    const stock = getStockStatus(product);
                    return (
                      <button
                        key={`${product.id}-${product.warehouseEmail}`}
                        onClick={() => handleProductClick(product)}
                        className={`group text-left rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                          isDark
                            ? "bg-[#18191b] border border-[#18191b] hover:border-gray-700"
                            : "bg-white border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl"
                        }`}
                        style={{ animation: `fadeInUp 0.4s ease-out ${idx * 50}ms both` }}
                      >
                        {/* Product Image */}
                        <div
                          className={`h-48 flex items-center justify-center relative ${
                            isDark
                              ? "bg-gradient-to-br from-gray-800 to-gray-900"
                              : "bg-gradient-to-br from-gray-100 to-gray-200"
                          }`}
                        >
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="opacity-40 group-hover:opacity-60 transition-opacity">
                              <IconComponent name="box" isDark={isDark} />
                            </div>
                          )}
                          <span
                            className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              stock.inStock
                                ? isDark
                                  ? "bg-green-500/15 text-green-400"
                                  : "bg-green-50 text-green-600"
                                : isDark
                                  ? "bg-red-500/15 text-red-400"
                                  : "bg-red-50 text-red-600"
                            }`}
                          >
                            {stock.text}
                          </span>
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <div className={`flex items-center gap-1.5 mb-2 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                            <IconComponent name="warehouse" isDark={isDark} />
                            <span className="text-xs font-medium truncate">{product.warehouseName}</span>
                          </div>
                          <h3 className={`font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                            {product.name}
                          </h3>
                          <p className={`mt-1 text-xs line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                                isDark ? "bg-black/40 text-gray-300" : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {product.category}
                            </span>
                            <span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                              {getDisplayPrice(product)}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={`flex items-center justify-between pt-6`}>
                    <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage <= 1}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          currentPage <= 1
                            ? isDark
                              ? "bg-black/20 text-gray-600 cursor-not-allowed"
                              : "bg-gray-100 text-gray-300 cursor-not-allowed"
                            : isDark
                              ? "bg-[#18191b] text-gray-300 hover:bg-[#2b2c2e] hover:text-white"
                              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <IconComponent name="chevronLeft" isDark={isDark} />
                        Previous
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          currentPage >= totalPages
                            ? isDark
                              ? "bg-black/20 text-gray-600 cursor-not-allowed"
                              : "bg-gray-100 text-gray-300 cursor-not-allowed"
                            : isDark
                              ? "bg-[#18191b] text-gray-300 hover:bg-[#2b2c2e] hover:text-white"
                              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Next
                        <IconComponent name="chevronRight" isDark={isDark} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Cart sidebar (always open) */}
      <div className="shrink-0 w-80">
        <div className={`w-80 h-full flex flex-col border-l ${isDark ? "bg-[#18191b] border-gray-800" : "bg-white border-gray-200"}`}>
          {/* Cart header */}
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
            <div className="flex items-center gap-2">
              <IconComponent name="cart" isDark={isDark} />
              <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Cart</h3>
              {cart.length > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                  {cart.length}
                </span>
              )}
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                <div className="opacity-40">
                  <IconComponent name="cart" isDark={isDark} />
                </div>
                <p className="text-sm mt-3">Your cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={getCartItemKey(item.product.id, item.variantId)} className={`p-3 rounded-xl ${isDark ? "bg-black/30" : "bg-gray-50"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                        {item.product.name}
                      </p>
                      {item.variantAttributes && Object.keys(item.variantAttributes).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(item.variantAttributes).map(([k, v]) => (
                            <span key={`${k}-${v}`} className={`text-[10px] px-1.5 py-0.5 rounded-md ${isDark ? "bg-white/5 text-gray-400" : "bg-white text-gray-500 border border-gray-200"}`}>
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        ${item.unitPrice.toFixed(2)} each
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.variantId)}
                      className={`p-1 rounded-lg transition-colors shrink-0 ${isDark ? "hover:bg-red-500/20 text-gray-600 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"}`}
                    >
                      <IconComponent name="trash" isDark={isDark} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className={`flex items-center rounded-lg overflow-hidden ${isDark ? "bg-[#18191b]" : "bg-white border border-gray-200"}`}>
                      <button
                        onClick={() => updateQuantity(item.product.id, -1, item.variantId)}
                        className={`px-2.5 py-1 text-xs font-medium transition-colors ${isDark ? "hover:bg-[#2b2c2e] text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}
                      >
                        <IconComponent name="minus" isDark={isDark} />
                      </button>
                      <span className={`px-3 py-1 text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1, item.variantId)}
                        className={`px-2.5 py-1 text-xs font-medium transition-colors ${isDark ? "hover:bg-[#2b2c2e] text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}
                      >
                        <IconComponent name="plus" isDark={isDark} />
                      </button>
                    </div>
                    <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <p className={`text-[11px] mt-2 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                    Max: {getAvailableStock(item.product, item.variantId)}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Cart footer */}
          <div className={`p-4 border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total</span>
              <span className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            {orderSuccess && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-green-500/15 text-green-500 text-sm text-center font-medium">
                Order placed successfully!
              </div>
            )}
            {orderError && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/15 text-red-500 text-sm text-center font-medium">
                {orderError}
              </div>
            )}

            <button
              onClick={placeOrder}
              disabled={cart.length === 0 || ordering}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                cart.length === 0 || ordering
                  ? isDark
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : isDark
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
                    : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25"
              }`}
            >
              {ordering ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Placing Order...
                </span>
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}