import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import type { Product, ProductStatus } from "../config/types";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductsBatch,
  getProductStats,
  batchUploadProducts,
  type BatchUploadResult,
  type PaginatedResponse,
} from "../services/warehouse.inventory.api";

// Status badge component
const StatusBadge = ({ status, isDark }: { status: ProductStatus; isDark: boolean }) => {
  const styles = {
    "In Stock": isDark
      ? "bg-green-500/20 text-green-400 border border-green-500/30"
      : "bg-green-100 text-green-700 border border-green-200",
    "Out of Stock": isDark
      ? "bg-red-500/20 text-red-400 border border-red-500/30"
      : "bg-red-100 text-red-700 border border-red-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-lg font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
  isDark,
  delay,
  isLoading,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  color: string;
  isDark: boolean;
  delay: number;
  isLoading?: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorStyles: Record<string, { bg: string; text: string; lightBg: string }> = {
    blue: {
      bg: "from-blue-500/20 to-blue-600/20",
      text: "text-blue-400",
      lightBg: "bg-blue-50",
    },
    green: {
      bg: "from-green-500/20 to-green-600/20",
      text: "text-green-400",
      lightBg: "bg-green-50",
    },
    red: {
      bg: "from-red-500/20 to-red-600/20",
      text: "text-red-400",
      lightBg: "bg-red-50",
    },
  };

  const style = colorStyles[color];

  return (
    <div
      className={`relative overflow-hidden p-6 rounded-2xl transition-all duration-500 hover:scale-[1.02] ${
        isDark
          ? "bg-[#18191b] border border-gray-800"
          : "bg-white border border-gray-100 shadow-lg shadow-gray-200/50"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-2xl ${
              isDark ? `bg-gradient-to-br ${style.bg}` : style.lightBg
            }`}
          >
            {icon}
          </div>
          <p className={`text-lg font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {title}
          </p>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              {value}
            </p>
          )}
          <p className={`text-base mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

// Product Modal Component (Add/Edit) - Updated with Category and Price
const ProductModal = ({
  isOpen,
  onClose,
  onSave,
  product,
  isDark,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  product: Product | null;
  isDark: boolean;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    quantity: 0,
    unit: "kg",
    price: 0,
    description: "",
    category: "",
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: "",
        quantity: 0,
        unit: "kg",
        price: 0,
        description: "",
        category: "",
      });
    }
  }, [product, isOpen]);

  const computeStatus = (qty: number): ProductStatus => {
    return qty === 0 ? "Out of Stock" : "In Stock";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-2xl p-6 ${
          isDark ? "bg-[#18191b] border border-gray-800" : "bg-white border border-gray-200"
        }`}
      >
        <h3 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
          {product ? "Edit Product" : "Add New Product"}
        </h3>
        <div className="space-y-4">
          {/* Product Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Product Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
              maxLength={40}
              className={`w-full px-4 py-2 rounded-xl border ${
                isDark
                  ? "bg-black border-gray-700 text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-200 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
              placeholder="Enter product name"
            />
            <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {formData.name?.length || 0}/40 characters
            </p>
          </div>

          {/* Category - NEW FIELD */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={isLoading}
              maxLength={20}
              className={`w-full px-4 py-2 rounded-xl border ${
                isDark
                  ? "bg-black border-gray-700 text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-200 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
              placeholder="e.g., Vegetables, Meat, Dairy"
            />
            <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {formData.category?.length || 0}/20 characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Quantity
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseFloat(e.target.value) || 0,
                    status: computeStatus(parseInt(e.target.value) || 0),
                  })
                }
                disabled={isLoading}
                className={`w-full px-4 py-2 rounded-xl border ${
                  isDark
                    ? "bg-black border-gray-700 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
              />
            </div>
            {/* Unit (maximum 20 character)*/}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value.slice(0, 20) })}
                disabled={isLoading}
                maxLength={20}
                className={`w-full px-4 py-2 rounded-xl border ${
                  isDark
                    ? "bg-black border-gray-700 text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                placeholder="e.g., kg, pcs, etc."
              />
              <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {formData.unit?.length || 0}/20 characters
              </p>
            </div>
          </div>

          {/* Price*/}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Price ($)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              disabled={isLoading}
              className={`w-full px-4 py-2 rounded-xl border ${
                isDark
                  ? "bg-black border-gray-700 text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-200 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
            />
          </div>

          {/* Description*/}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
              rows={3}
              maxLength={250}
              className={`w-full px-4 py-2 rounded-xl border ${
                isDark
                  ? "bg-black border-gray-700 text-white"
                  : "bg-gray-50 border-gray-200 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none disabled:opacity-50`}
              placeholder="Enter product description..."
            />
            <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {formData.description?.length || 0}/250 characters
            </p>
          </div>

          {/* Status Display */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Status (Auto-computed)
            </label>
            <div className={`px-4 py-2 rounded-xl border ${isDark ? "bg-black border-gray-700" : "bg-gray-100 border-gray-200"}`}>
              <StatusBadge status={computeStatus(formData.quantity || 0)} isDark={isDark} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
              isDark
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-xl font-medium text-white transition-all ${
              isDark
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            } disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>{product ? "Update" : "Add"} Product</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Product Details Modal - Updated with Price and Category
const ProductDetailsModal = ({
  isOpen,
  onClose,
  product,
  isDark,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  isDark: boolean;
}) => {
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
              <StatusBadge status={product.status} isDark={isDark} />
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

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type,
  isDark,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: "danger" | "warning" | "info";
  isDark: boolean;
  isLoading?: boolean;
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: "text-red-500",
      bg: isDark ? "bg-red-500/20" : "bg-red-100",
      button: isDark
        ? "bg-red-600 hover:bg-red-700 text-white"
        : "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: "text-yellow-500",
      bg: isDark ? "bg-yellow-500/20" : "bg-yellow-100",
      button: isDark
        ? "bg-yellow-600 hover:bg-yellow-700 text-white"
        : "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    info: {
      icon: "text-blue-500",
      bg: isDark ? "bg-blue-500/20" : "bg-blue-100",
      button: isDark
        ? "bg-blue-600 hover:bg-blue-700 text-white"
        : "bg-blue-600 hover:bg-blue-700 text-white",
    },
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-2xl p-6 ${
          isDark ? "bg-[#18191b] border border-gray-800" : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${style.bg}`}>
            {type === "danger" && (
              <svg className={`w-8 h-8 ${style.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            {type === "warning" && (
              <svg className={`w-8 h-8 ${style.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {type === "info" && (
              <svg className={`w-8 h-8 ${style.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            {title}
          </h3>
          <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {message}
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } disabled:opacity-50`}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${style.button} disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Notification Component
const Toast = ({
  message,
  type,
  isVisible,
  isDark,
}: {
  message: string;
  type: "success" | "error";
  isVisible: boolean;
  isDark: boolean;
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${
        type === "success"
          ? isDark
            ? "bg-green-600 text-white"
            : "bg-green-500 text-white"
          : isDark
          ? "bg-red-600 text-white"
          : "bg-red-500 text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        {type === "success" ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isDark,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isDark: boolean;
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
      <p className={`text-base ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? "hover:bg-gray-800 text-gray-400 disabled:opacity-30"
              : "hover:bg-gray-100 text-gray-600 disabled:opacity-30"
          }`}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {getPageNumbers().map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`w-12 h-12 rounded-lg font-medium transition-all ${
              page === currentPage
                ? isDark
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : isDark
                ? "hover:bg-gray-800 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            } ${page === "..." ? "cursor-default" : ""}`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? "hover:bg-gray-800 text-gray-400 disabled:opacity-30"
              : "hover:bg-gray-100 text-gray-600 disabled:opacity-30"
          }`}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Batch Upload Modal Component
const BatchUploadModal = ({
  isOpen,
  onClose,
  onUpload,
  isDark,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (products: Partial<Product>[]) => void;
  isDark: boolean;
  isLoading: boolean;
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [previewData, setPreviewData] = useState<Partial<Product>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFileName("");
    setParseError("");
    setPreviewData([]);
    setDragActive(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const parseCSV = (text: string): Partial<Product>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Expected columns: product name, category, quantity, unit, price, description
    const nameIdx = headers.findIndex(h => h.includes('name') || h === 'product');
    const categoryIdx = headers.findIndex(h => h.includes('category'));
    const quantityIdx = headers.findIndex(h => h.includes('quantity') || h === 'qty');
    const unitIdx = headers.findIndex(h => h.includes('unit'));
    const priceIdx = headers.findIndex(h => h.includes('price'));
    const descriptionIdx = headers.findIndex(h => h.includes('description') || h === 'desc');

    const products: Partial<Product>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV parsing (handles basic commas, for complex cases use a library)
      const values = line.split(',').map(v => v.trim());
      
      const name = nameIdx >= 0 ? values[nameIdx] : '';
      const quantityStr = quantityIdx >= 0 ? values[quantityIdx] : '';
      const priceStr = priceIdx >= 0 ? values[priceIdx] : '';
      
      // Skip if name is empty or quantity/price are not valid numbers
      if (!name || name === '') continue;
      
      const quantity = parseFloat(quantityStr);
      const price = parseFloat(priceStr);
      
      if (isNaN(quantity) || isNaN(price)) continue;

      products.push({
        name: name,
        category: categoryIdx >= 0 ? values[categoryIdx] || 'Uncategorized' : 'Uncategorized',
        quantity: quantity,
        unit: unitIdx >= 0 ? values[unitIdx] || 'kg' : 'kg',
        price: price,
        description: descriptionIdx >= 0 ? values[descriptionIdx] || '' : '',
      });
    }

    return products;
  };

  const handleFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setParseError('Please upload a valid CSV file');
      return;
    }

    setFileName(file.name);
    setParseError("");
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const products = parseCSV(text);
        setPreviewData(products);
        if (products.length === 0) {
          setParseError('No valid products found in CSV. Ensure product names exist and quantity/price are valid numbers.');
        }
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Failed to parse CSV');
        setPreviewData([]);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto ${
          isDark ? "bg-[#18191b] border border-gray-800" : "bg-white border border-gray-200"
        }`}
      >
        <h3 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
          Batch Upload Products
        </h3>
        
        <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Upload a CSV file with columns: <strong>Product Name, Category, Quantity, Unit, Price, Description</strong>
          <br />
          <span className="text-xs opacity-75">Products will only be added if they have a name and valid numeric quantity/price.</span>
        </p>

        {/* Drag & Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? isDark
                ? "border-blue-500 bg-blue-500/10"
                : "border-blue-500 bg-blue-50"
              : isDark
              ? "border-gray-700 hover:border-gray-600"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
          />
          
          <div className="text-4xl mb-2">📄</div>
          <p className={`text-lg font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            {fileName ? fileName : "Drag & drop your CSV file here"}
          </p>
          <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            or{" "}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`font-medium underline ${
                isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
              }`}
            >
              browse files
            </button>
          </p>
        </div>

        {/* Error Message */}
        {parseError && (
          <div className={`mt-4 p-3 rounded-lg ${
            isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700"
          }`}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{parseError}</span>
            </div>
          </div>
        )}

        {/* Preview Table */}
        {previewData.length > 0 && (
          <div className="mt-6">
            <h4 className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Preview ({previewData.length} valid products found)
            </h4>
            <div className={`max-h-48 overflow-y-auto rounded-lg border ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}>
              <table className="w-full text-sm">
                <thead className={`sticky top-0 ${
                  isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-600"
                }`}>
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Qty</th>
                    <th className="px-3 py-2 text-left">Unit</th>
                    <th className="px-3 py-2 text-left">Price</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDark ? "divide-gray-700 text-gray-300" : "divide-gray-200 text-gray-700"
                }`}>
                  {previewData.slice(0, 5).map((product, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 font-medium">{product.name}</td>
                      <td className="px-3 py-2">{product.category}</td>
                      <td className="px-3 py-2">{product.quantity}</td>
                      <td className="px-3 py-2">{product.unit}</td>
                      <td className="px-3 py-2">${product.price?.toFixed(2)}</td>
                    </tr>
                  ))}
                  {previewData.length > 5 && (
                    <tr>
                      <td colSpan={5} className={`px-3 py-2 text-center italic ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}>
                        ...and {previewData.length - 5} more
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
              isDark
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={() => onUpload(previewData)}
            disabled={isLoading || previewData.length === 0}
            className={`flex-1 px-4 py-2 rounded-xl font-medium text-white transition-all ${
              isDark
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            } disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>Upload {previewData.length > 0 && `(${previewData.length})`}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

export function StockPage() {
  const { isDark } = useTheme();

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Search states
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<ProductStatus | "All">("All");

  // Selection states
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: "danger" | "warning" | "info";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    type: "info",
    onConfirm: () => {},
  });

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const [isVisible, setIsVisible] = useState(false);

    // Statistics state - NEW
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
  });
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const [isBatchUploadModalOpen, setIsBatchUploadModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<Partial<Product>[]>([]);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==================== API FUNCTIONS ====================

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response: PaginatedResponse = await getProducts({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchQuery || undefined,
        status: filterStatus,
      });

      setProducts(response.products);
      setTotalProducts(response.total);
      setTotalPages(response.totalPages);
      setSelectedProducts(new Set());
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to fetch products", "error");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, filterStatus]);

  // Fetch statistics from backend
  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const statsData = await getProductStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, [fetchProducts, fetchStats]);

  

  // ==================== HELPERS ====================

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const computeStatus = (qty: number): ProductStatus => {
    return qty === 0 ? "Out of Stock" : "In Stock";
  };

  // ==================== HANDLERS ====================

  const handleSearch = () => {
    setIsSearching(true);
    setCurrentPage(1);
    setTimeout(() => {
      setSearchQuery(searchInput);
      setIsSearching(false);
    }, 300);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Product",
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setIsActionLoading(true);
        
        try {
          await deleteProduct(id);
          showToast("Product deleted successfully", "success");
          fetchStats(); // ADD THIS - Refresh stats after delete
          if (products.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          } else {
            fetchProducts();
          }
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Failed to delete product", "error");
        } finally {
          setIsActionLoading(false);
        }
      },
    });
  };

  const handleBatchDelete = () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Multiple Products",
      message: `Are you sure you want to delete ${selectedProducts.size} selected products? This action cannot be undone.`,
      confirmText: "Delete All",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setIsActionLoading(true);
        
        try {
          await deleteProductsBatch(Array.from(selectedProducts));
          showToast(`${selectedProducts.size} products deleted successfully`, "success");
          fetchStats();
          setSelectedProducts(new Set());
          fetchProducts();
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Failed to delete products", "error");
        } finally {
          setIsActionLoading(false);
        }
      },
    });
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setIsActionLoading(true);
    
    try {
      if (editingProduct) {
        // Check if status changed - OPTIMIZATION
        const oldStatus = editingProduct.status;
        const newStatus = computeStatus(productData.quantity || 0);
        const statusChanged = oldStatus !== newStatus;

        await updateProduct(editingProduct.id, {
          ...productData,
          status: newStatus,
        });
        showToast("Product updated successfully", "success");
        
        // Only fetch stats if status changed - OPTIMIZATION
        if (statusChanged) {
          fetchStats();
        }
      } else {
        // Adding new product - always fetch stats
        await createProduct({
          ...productData,
          status: computeStatus(productData.quantity || 0),
        });
        showToast("Product added successfully", "success");
        fetchStats(); // ADD THIS - Refresh stats after add
      }
      fetchProducts();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to save product", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBatchUpload = async (products: Partial<Product>[]) => {
    if (products.length === 0) return;
    
    setIsActionLoading(true);
    setIsBatchUploadModalOpen(false);
    
    try {
      const result: BatchUploadResult = await batchUploadProducts(products);
      
      if (result.created > 0) {
        showToast(`Successfully created ${result.created} products`, "success");
        fetchStats();
        fetchProducts();
      }
      
      if (result.failed > 0) {
        // Show detailed errors in console or could show in a modal
        console.error('Batch upload errors:', result.errors);
        if (result.created === 0) {
          showToast(`Failed to upload: ${result.errors[0]}`, "error");
        } else {
          showToast(`${result.failed} products failed to upload. Check console for details.`, "error");
        }
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to upload products", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openDetailsModal = (product: Product) => {
    setViewingProduct(product);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Toast {...toast} isDark={isDark} />

      {/* Header */}
      <div
        className={`${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        } transition-all duration-500`}
      >
        <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Warehouse Stock
        </h2>
        <p className={`mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
          Today, {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Items"
          value={stats.total} // CHANGED from stats.total
          subtitle="Total items in inventory"
          icon="📦"
          color="blue"
          isDark={isDark}
          delay={100}
          isLoading={isStatsLoading} // CHANGED to isStatsLoading
        />
        <StatCard
          title="In Stock Items"
          value={stats.inStock} // CHANGED from stats.inStock
          subtitle="Items currently available"
          icon="✅"
          color="green"
          isDark={isDark}
          delay={200}
          isLoading={isStatsLoading} // CHANGED to isStatsLoading
        />
        <StatCard
          title="Out of Stock Items"
          value={stats.outOfStock} // CHANGED from stats.outOfStock
          subtitle="Items currently unavailable"
          icon="❌"
          color="red"
          isDark={isDark}
          delay={300}
          isLoading={isStatsLoading} // CHANGED to isStatsLoading
        />
      </div>

      {/* Inventory Table */}
      <div
        className={`rounded-2xl overflow-hidden ${
          isDark ? "bg-[#18191b] border border-gray-800" : "bg-white border border-gray-100 shadow-xl"
        }`}
      >
        {/* Table Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b ${
            isDark ? "border-gray-800" : "border-gray-100"
          }`}
        >
          <h3 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            Inventory Overview
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                placeholder="Search item"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className={`pl-4 pr-4 py-2 rounded-lg border text-lg ${
                  isDark
                    ? "bg-black border-gray-700 text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                } focus:outline-none focus:border-blue-500 w-64`}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  isDark
                    ? "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    : "bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                }`}
                title="Search"
              >
                {isSearching ? (
                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className={`p-3 rounded-lg transition-colors ${
                    isDark
                      ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  }`}
                  title="Clear search"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as ProductStatus | "All");
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-lg border text-lg ${
                isDark
                  ? "bg-black border-gray-700 text-gray-300"
                  : "bg-gray-50 border-gray-200 text-gray-700"
              } focus:outline-none focus:border-blue-500`}
            >
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <button
              onClick={openAddModal}
              className={`px-4 py-2 rounded-lg font-medium text-white text-lg flex items-center gap-2 transition-all ${
                isDark ? "bg-teal-600 hover:bg-teal-700" : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </button>

            <button
              onClick={() => setIsBatchUploadModalOpen(true)}
              className={`px-4 py-2 rounded-lg font-medium text-white text-lg flex items-center gap-2 transition-all ${
                isDark ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Batch Upload
            </button>
          </div>
        </div>

        {/* Batch Actions */}
        {selectedProducts.size > 0 && (
          <div
            className={`px-6 py-3 border-b flex items-center justify-between ${
              isDark ? "bg-blue-500/10 border-gray-800" : "bg-blue-50 border-gray-100"
            }`}
          >
            <span className={`text-sm ${isDark ? "text-blue-400" : "text-blue-700"}`}>
              {selectedProducts.size} item(s) selected
            </span>
            <button
              onClick={handleBatchDelete}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                isDark
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-red-100 text-red-600 hover:bg-red-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <svg className={`w-12 h-12 animate-spin mb-4 ${isDark ? "text-blue-500" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading products...</p>
          </div>
        ) : (
          <>
            {/* Table - Updated Columns: Name, Quantity, Price, Category, Status, Action */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
                  className={`text-xs uppercase tracking-wider ${
                    isDark ? "bg-black/50 text-gray-400" : "bg-gray-50 text-gray-500"
                  }`}
                >
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={products.length > 0 && selectedProducts.size === products.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-base font-semibold">Item Name</th>
                    <th className="px-6 py-4 text-left text-base font-semibold">Quantity</th>
                    <th className="px-6 py-4 text-left text-base font-semibold">Price</th>
                    <th className="px-6 py-4 text-left text-base font-semibold">Category</th>
                    <th className="px-6 py-4 text-left text-base font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-base font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {products.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`transition-colors ${
                        isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
                      } ${selectedProducts.has(product.id) ? (isDark ? "bg-blue-500/10" : "bg-blue-50") : ""}`}
                      style={{ animation: `fadeIn 0.3s ease-out ${index * 50}ms both` }}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className={`px-6 py-4 text-lg font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        {product.name}
                      </td>
                      <td className={`px-6 py-4 text-lg ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        {product.quantity} {product.unit}
                      </td>
                      <td className={`px-6 py-4 text-lg font-semibold ${isDark ? "text-green-400" : "text-green-600"}`}>
                        ${product.price.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4  ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        <span className={`px-2 py-1 rounded-full text-lg ${
                          isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
                        }`}>
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={product.status} isDark={isDark} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">

                          <button
                            onClick={() => openDetailsModal(product)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? "hover:bg-green-500/20 text-green-400 hover:text-green-300"
                                : "hover:bg-green-50 text-green-600 hover:text-green-700"
                            }`}
                            title="View Details"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditModal(product)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? "hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
                                : "hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                            }`}
                            title="Edit Product"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? "hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                : "hover:bg-red-50 text-red-600 hover:text-red-700"
                            }`}
                            title="Delete Product"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {products.length === 0 && !isLoading && (
              <div className="py-12 text-center">
                <div className="text-4xl mb-4">📦</div>
                <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  No products found
                </p>
                <p className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  Try adjusting your search or filter
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isDark={isDark}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
        isDark={isDark}
        isLoading={isActionLoading}
      />

      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setViewingProduct(null);
        }}
        product={viewingProduct}
        isDark={isDark}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        isDark={isDark}
        isLoading={isActionLoading}
      />

      <BatchUploadModal
        isOpen={isBatchUploadModalOpen}
        onClose={() => setIsBatchUploadModalOpen(false)}
        onUpload={handleBatchUpload}
        isDark={isDark}
        isLoading={isActionLoading}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}