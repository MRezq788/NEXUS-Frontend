// src/components/warehouse/ProductModal.tsx
import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import type { Product, ProductStatus } from "../../config/types";
import { StatusBadge } from "./StatusBadge";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  product: Product | null;
  isLoading: boolean;
}

export const ProductModal = ({
  isOpen,
  onClose,
  onSave,
  product,
  isLoading,
}: ProductModalProps) => {
  const { isDark } = useTheme();
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

          {/* Category */}
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
                aria-label="Product quantity"
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
            {/* Unit */}
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

          {/* Price */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Price ($)
            </label>
            <input
              aria-label="Product price"
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

          {/* Description */}
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
              <StatusBadge status={computeStatus(formData.quantity || 0)} />
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