import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import type { Product } from "./WarehouseProducts";

// ─── Props ───────────────────────────────────────────────────────────────────

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ProductDetail({ product, onBack, onAddToCart }: ProductDetailProps) {
  const { isDark } = useTheme();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (quantity < 1) return;
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header with back */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className={`p-2 rounded-xl transition-colors ${
            isDark
              ? "hover:bg-[#2b2c2e] text-gray-400 hover:text-white"
              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Product Details
        </h2>
      </div>

      {/* Product card */}
      <div
        className={`rounded-2xl overflow-hidden ${
          isDark
            ? "bg-[#18191b] border border-[#18191b]"
            : "bg-white border border-gray-100 shadow-xl shadow-gray-200/50"
        }`}
        style={{ animation: "fadeInUp 0.4s ease-out both" }}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image placeholder */}
          <div
            className={`md:w-80 h-64 md:h-auto flex items-center justify-center shrink-0 ${
              isDark
                ? "bg-gradient-to-br from-gray-800 to-gray-900"
                : "bg-gradient-to-br from-gray-100 to-gray-200"
            }`}
          >
            <svg
              className="w-16 h-16 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>

          {/* Details */}
          <div className="flex-1 p-8">
            <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              {product.name}
            </h3>
            <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {product.description}
            </p>

            <div
              className={`mt-6 flex items-baseline gap-2`}
            >
              <span className={`text-3xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                ${product.price.toFixed(2)}
              </span>
              <span className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                / {product.unit}
              </span>
            </div>

            {/* Quantity + Add to cart */}
            <div className="mt-8 flex items-center gap-4">
              <div
                className={`flex items-center rounded-xl overflow-hidden ${
                  isDark ? "bg-black/40 border border-gray-800" : "bg-gray-50 border border-gray-200"
                }`}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className={`px-4 py-2.5 text-lg font-medium transition-colors ${
                    isDark ? "hover:bg-[#2b2c2e] text-gray-300" : "hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  -
                </button>
                <span
                  className={`px-5 py-2.5 text-sm font-semibold min-w-[3rem] text-center ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className={`px-4 py-2.5 text-lg font-medium transition-colors ${
                    isDark ? "hover:bg-[#2b2c2e] text-gray-300" : "hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={added}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  added
                    ? "bg-green-500 text-white"
                    : isDark
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {added ? "Added!" : "Add to Cart"}
              </button>
            </div>
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
