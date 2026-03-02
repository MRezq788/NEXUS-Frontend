import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
// import { useAuth } from "../contexts/AuthContext";
import { WarehouseProducts } from "./WarehouseProducts";
import { ProductDetail } from "./ProductDetail";
import type { Product } from "./WarehouseProducts";

// ─── Config ──────────────────────────────────────────────────────────────────

const API_URL = "http://localhost:3000" as string;

// ─── Cart types ──────────────────────────────────────────────────────────────

interface CartItem {
  product: Product;
  quantity: number;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function WarehouseShop() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const warehouseEmail = (location.state as { email?: string })?.email || "";
  const warehouseName =
    (location.state as { warehouseName?: string })?.warehouseName || warehouseEmail;

  useEffect(() => {
    if (!warehouseEmail) {
      // If no email was provided in navigation state, go back to listing
      navigate("/warehouses", { replace: true });
    }
  }, [warehouseEmail, navigate]);

  // View state: "products" or "detail"
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // ── Cart helpers ───────────────────────────────────────────────────────────

  const addToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // ── Place order ────────────────────────────────────────────────────────────

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setOrdering(true);
    setOrderError(null);
    setOrderSuccess(false);

    try {
      const body = {
        // buyerEmail: user?.email || "owner5@test.com",
        buyerEmail: "owner5@nexus.com", // for development
        sellerEmail: warehouseEmail,
        total: Math.round(totalPrice * 100) / 100,
        products: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full">
      {/* Main content area */}
      <div
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          cartOpen ? "pr-4" : ""
        }`}
      >
        {selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
          />
        ) : (
          <WarehouseProducts
            warehouseEmail={warehouseEmail}
            warehouseName={warehouseName}
            onSelectProduct={(product) => setSelectedProduct(product)}
            onBack={() => navigate("/warehouses")}
          />
        )}
      </div>

      {/* Cart toggle button (visible when cart is collapsed) */}
      {!cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className={`fixed right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-xl shadow-lg transition-all duration-200 ${
            isDark
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      )}

      {/* Cart sidebar */}
      <div
        className={`shrink-0 transition-all duration-300 overflow-hidden ${
          cartOpen ? "w-80" : "w-0"
        }`}
      >
        <div
          className={`w-80 h-full flex flex-col border-l ${
            isDark
              ? "bg-[#18191b] border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Cart header */}
          <div
            className={`flex items-center justify-between p-1 border-b ${
              isDark ? "border-gray-800" : "border-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={isDark ? "#9ca3af" : "#6b7280"} strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                Cart
              </h3>
              {cart.length > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isDark ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {cart.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setCartOpen(false)}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? "hover:bg-[#2b2c2e] text-gray-500" : "hover:bg-gray-100 text-gray-400"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto p-1 space-y-3">
            {cart.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                <svg
                  className="w-12 h-12 mx-auto mb-3 opacity-40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                  />
                </svg>
                <p className="text-sm">Your cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className={`p-3 rounded-xl ${
                    isDark ? "bg-black/30" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.product.name}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        ${item.product.price.toFixed(2)} each
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className={`p-1 rounded-lg transition-colors shrink-0 ${
                        isDark ? "hover:bg-red-500/20 text-gray-600 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div
                      className={`flex items-center rounded-lg overflow-hidden ${
                        isDark ? "bg-[#18191b]" : "bg-white border border-gray-200"
                      }`}
                    >
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                          isDark ? "hover:bg-[#2b2c2e] text-gray-400" : "hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        -
                      </button>
                      <span
                        className={`px-3 py-1 text-xs font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                          isDark ? "hover:bg-[#2b2c2e] text-gray-400" : "hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        +
                      </button>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart footer */}
          <div
            className={`p-1 border-t ${
              isDark ? "border-gray-800" : "border-gray-100"
            }`}
          >
            {/* Total */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Total
              </span>
              <span className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Order status messages */}
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

            {/* Place order button */}
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
    </div>
  );
}
