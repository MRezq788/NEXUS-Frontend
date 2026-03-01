// src/components/warehouse/ProductDetailsModal.tsx
import { useTheme } from "../../contexts/ThemeContext";
import type { Product } from "../../config/types";
import { StatusBadge } from "./StatusBadge";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductDetailsModal = ({
  isOpen,
  onClose,
  product,
}: ProductDetailsModalProps) => {
  const { isDark } = useTheme();

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-lg rounded-2xl p-6 ${
          isDark ? "bg-[#18191b] border border-gray-800" : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Product Details
          </h3>
          <button
            aria-label="Close product details modal"
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Product Name
              </p>
              <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {product.name}
              </p>
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Category
              </p>
              <p className={`text-base ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {product.category}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Quantity
              </p>
              <p className={`text-base ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {product.quantity} {product.unit}
              </p>
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Price
              </p>
              <p className={`text-base font-semibold ${isDark ? "text-green-400" : "text-green-600"}`}>
                ${product.price.toFixed(2)}
              </p>
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Status
              </p>
              <StatusBadge status={product.status} />
            </div>
          </div>

          <div>
            <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Last Updated
            </p>
            <p className={`text-base ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              {product.lastUpdated}
            </p>
          </div>

          <div>
            <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Description
            </p>
            <div
              className={`p-4 rounded-xl ${
                isDark ? "bg-black border border-gray-800" : "bg-gray-50 border border-gray-100"
              }`}
            >
              <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {product.description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all ${
              isDark
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};