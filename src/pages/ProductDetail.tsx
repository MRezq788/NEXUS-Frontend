import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import type { Product } from "./WarehouseProducts";
import { getVariantAttributes } from "../config/types";

// ─── Props ───────────────────────────────────────────────────────────────────

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (
    product: Product,
    quantity: number,
    options?: {
      variantId?: string;
      variantAttributes?: Record<string, string>;
      unitPrice?: number;
    },
  ) => void;
  pageTitle?: string;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ProductDetail({
  product,
  onBack,
  onAddToCart,
  pageTitle,
}: ProductDetailProps) {
  const { isDark } = useTheme();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const hasVariants = variants.length > 0;
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  const attributeNames = useMemo(() => {
    const names = new Set<string>();
    for (const variant of variants) {
      const attrs = getVariantAttributes(variant as any);
      if (attrs) {
        Object.keys(attrs).forEach((name) => names.add(name));
      }
    }
    return Array.from(names);
  }, [variants]);

  useEffect(() => {
    if (!hasVariants) {
      setSelectedAttributes({});
      return;
    }

    const initialVariant =
      variants.find((variant) => (Number(variant.quantity) || 0) > 0) ||
      variants[0];

    setSelectedAttributes(getVariantAttributes(initialVariant as any) || {});
    setQuantity(1);
  }, [hasVariants, variants]);

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return undefined;

    return variants.find((variant) => {
      const attrs = getVariantAttributes(variant as any);
      return attributeNames.every(
        (name) =>
          (attrs?.[name] || "") ===
          (selectedAttributes[name] || ""),
      );
    });
  }, [hasVariants, variants, attributeNames, selectedAttributes]);

  const getVariantForSelection = (selection: Record<string, string>) => {
    if (!hasVariants) return undefined;
    return variants.find((variant) => {
      const attrs = getVariantAttributes(variant as any);
      return attributeNames.every(
        (name) =>
          (attrs?.[name] || "") === (selection[name] || ""),
      );
    });
  };

  const availableStock = hasVariants
    ? Number(selectedVariant?.quantity) || 0
    : Number(product.quantity) || 0;

  const displayPrice =
    Number(selectedVariant?.price) ||
    Number(product.price || product.basePrice || 0);

  const handleAdd = () => {
    if (quantity < 1 || availableStock <= 0) return;
    onAddToCart(product, quantity, {
      variantId: selectedVariant?.id,
      variantAttributes: selectedVariant ? getVariantAttributes(selectedVariant as any) : undefined,
      unitPrice: displayPrice,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // Image handling
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const images = product.images || [];

  return (
    <div className="space-y-5 sm:space-y-6">
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
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h2
          className={`text-2xl sm:text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {pageTitle || "Product Details"}
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
        <div className="flex flex-col lg:flex-row">
          {/* Images area */}
          <div className="lg:w-96 shrink-0 p-4 sm:p-5 space-y-4">
            {/* Main display */}
            <div
              className={`aspect-square rounded-2xl flex items-center justify-center overflow-hidden ${
                isDark
                  ? "bg-linear-to-br from-gray-800 to-gray-900 border border-gray-800"
                  : "bg-linear-to-br from-gray-100 to-gray-200 border border-gray-100"
              }`}
            >
              {images[activeImgIdx] ? (
                <img
                  src={images[activeImgIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              ) : (
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
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {images.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`relative w-16 h-16 rounded-lg shrink-0 overflow-hidden border-2 transition-all ${
                      activeImgIdx === idx
                        ? "border-blue-500 scale-95"
                        : isDark
                          ? "border-gray-800"
                          : "border-gray-100"
                    }`}
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 p-5 sm:p-8">
            <h3
              className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {product.name}
            </h3>
            <p
              className={`mt-2 text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {product.description}
            </p>

            <div className="mt-6 flex flex-wrap items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}
              >
                ${displayPrice.toFixed(2)}
              </span>
              <span
                className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                / {product.unit}
              </span>
            </div>

            {hasVariants && (
              <div
                className={`mt-6 rounded-xl p-4 border ${
                  isDark
                    ? "border-gray-800 bg-black/25"
                    : "border-gray-200 bg-gray-50/80"
                }`}
              >
                <div className="space-y-4">
                  {attributeNames.map((name) => {
                    const values = Array.from(
                      new Set(
                        variants
                          .map((variant) => getVariantAttributes(variant as any)?.[name])
                          .filter(Boolean),
                      ),
                    ) as string[];

                    return (
                      <div key={name}>
                        <label
                          className={`block text-xs font-semibold mb-2 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {name}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {values.map((value) => {
                            const probeSelection = {
                              ...selectedAttributes,
                              [name]: value,
                            };
                            const probeVariant =
                              getVariantForSelection(probeSelection);
                            const inStock =
                              (Number(probeVariant?.quantity) || 0) > 0;
                            const isActive = selectedAttributes[name] === value;

                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => {
                                  if (!inStock) return;
                                  setSelectedAttributes((prev) => ({
                                    ...prev,
                                    [name]: value,
                                  }));
                                  setQuantity(1);
                                }}
                                disabled={!inStock}
                                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                                  isActive
                                    ? isDark
                                      ? "bg-blue-500/20 border-blue-500 text-blue-300"
                                      : "bg-blue-50 border-blue-500 text-blue-700"
                                    : !inStock
                                      ? isDark
                                        ? "bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed"
                                        : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                      : isDark
                                        ? "bg-black/30 border-gray-700 text-gray-300 hover:border-gray-500"
                                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                                }`}
                              >
                                {value}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      isDark
                        ? "bg-white/5 text-gray-300"
                        : "bg-white text-gray-700 border border-gray-200"
                    }`}
                  >
                    Variant: {selectedVariant?.id || "N/A"}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      availableStock > 0
                        ? isDark
                          ? "bg-green-500/15 text-green-400"
                          : "bg-green-50 text-green-700"
                        : isDark
                          ? "bg-red-500/15 text-red-400"
                          : "bg-red-50 text-red-700"
                    }`}
                  >
                    Stock: {availableStock}
                  </span>
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div
                className={`flex items-center rounded-xl overflow-hidden ${
                  isDark
                    ? "bg-black/40 border border-gray-800"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className={`px-4 py-2.5 text-lg font-medium transition-colors ${
                    quantity <= 1
                      ? isDark
                        ? "text-gray-600 cursor-not-allowed"
                        : "text-gray-400 cursor-not-allowed"
                      : isDark
                        ? "hover:bg-[#2b2c2e] text-gray-300"
                        : "hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  -
                </button>
                <span
                  className={`px-5 py-2.5 text-sm font-semibold min-w-12 text-center ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(Math.max(1, availableStock), q + 1),
                    )
                  }
                  disabled={availableStock <= 0 || quantity >= availableStock}
                  className={`px-4 py-2.5 text-lg font-medium transition-colors ${
                    availableStock <= 0 || quantity >= availableStock
                      ? isDark
                        ? "text-gray-600 cursor-not-allowed"
                        : "text-gray-400 cursor-not-allowed"
                      : isDark
                        ? "hover:bg-[#2b2c2e] text-gray-300"
                        : "hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={added || availableStock <= 0}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  added
                    ? "bg-green-500 text-white"
                    : availableStock <= 0
                      ? isDark
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : isDark
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {added
                  ? "Added!"
                  : availableStock <= 0
                    ? "Out of Stock"
                    : "Add to Cart"}
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
