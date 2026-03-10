import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import type { Order, OrderProduct, Product } from "../config/types";
import {
  getOrderById,
  getProductById,
} from "../services/warehouse.inventory.api";

function formatStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatVariantSummary(attributes?: Record<string, string>): string {
  if (!attributes || Object.keys(attributes).length === 0) {
    return "";
  }

  return Object.entries(attributes)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
}

const OrderStatusBadge = ({
  status,
  isDark,
}: {
  status: string;
  isDark: boolean;
}) => {
  const styles: Record<string, string> = {
    pending: isDark
      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
      : "bg-yellow-100 text-yellow-700 border border-yellow-200",
    processing: isDark
      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
      : "bg-blue-100 text-blue-700 border border-blue-200",
    completed: isDark
      ? "bg-green-500/20 text-green-300 border border-green-500/30"
      : "bg-green-100 text-green-700 border border-green-200",
    cancelled: isDark
      ? "bg-red-500/20 text-red-300 border border-red-500/30"
      : "bg-red-100 text-red-700 border border-red-200",
  };

  const key = status.toLowerCase();

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[key] || styles.pending}`}
    >
      {formatStatusLabel(key)}
    </span>
  );
};

const ProductDetailsModal = ({
  isOpen,
  onClose,
  product,
  error,
  isDark,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  error: string | null;
  isDark: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-xl rounded-2xl p-6 ${
          isDark
            ? "bg-[#18191b] border border-gray-800"
            : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <h3
            className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Current Product Snapshot
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${
              isDark
                ? "hover:bg-gray-800 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            aria-label="Close"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div
            className={`p-3 rounded-xl mb-4 ${
              isDark
                ? "bg-red-500/10 text-red-300 border border-red-500/20"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            {error}
          </div>
        )}

        {!error && product && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p
                  className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  Product
                </p>
                <p
                  className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {product.name}
                </p>
              </div>
              <div>
                <p
                  className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  Category
                </p>
                <p className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {product.category}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p
                  className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  Quantity
                </p>
                <p className={`${isDark ? "text-gray-200" : "text-gray-800"}`}>
                  {product.quantity} {product.unit}
                </p>
              </div>
              <div>
                <p
                  className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  Price
                </p>
                <p
                  className={`${isDark ? "text-green-300" : "text-green-700"}`}
                >
                  ${Number(product.price || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p
                  className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  Status
                </p>
                <p className={`${isDark ? "text-gray-200" : "text-gray-800"}`}>
                  {product.status}
                </p>
              </div>
            </div>

            {Array.isArray(product.variants) && product.variants.length > 0 && (
              <div>
                <p
                  className={`text-xs uppercase tracking-wider mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  Variants
                </p>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`p-2 rounded-lg text-xs ${
                        isDark
                          ? "bg-black/40 border border-white/5"
                          : "bg-gray-50 border border-gray-100"
                      }`}
                    >
                      <p
                        className={`${isDark ? "text-gray-200" : "text-gray-800"}`}
                      >
                        {formatVariantSummary(variant.attributes) || "Default"}
                      </p>
                      <p
                        className={`${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Qty {variant.quantity} · $
                        {Number(variant.price || 0).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className={`w-full mt-6 px-4 py-2.5 rounded-xl font-medium ${
            isDark
              ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const OrderLineItemCard = ({
  item,
  index,
  isDark,
  onViewCurrentProduct,
}: {
  item: OrderProduct;
  index: number;
  isDark: boolean;
  onViewCurrentProduct: (productId: string) => void;
}) => {
  const variantText = formatVariantSummary(item.variantAttributes);

  return (
    <div
      className={`p-4 rounded-xl ${
        isDark
          ? "bg-[#111214] border border-white/5"
          : "bg-white border border-gray-100 shadow-sm"
      }`}
      style={{ animation: `fadeInUp 0.35s ease-out ${index * 40}ms both` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {item.productName ||
              `Product ${item.productId.slice(-6).toUpperCase()}`}
          </p>
          <p
            className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-500"}`}
          >
            ID: {item.productId}
          </p>
          {variantText && (
            <p
              className={`text-xs mt-1 ${isDark ? "text-purple-300" : "text-purple-700"}`}
            >
              {variantText}
            </p>
          )}
        </div>
        <button
          onClick={() => onViewCurrentProduct(item.productId)}
          className={`px-3 py-1.5 text-xs rounded-lg shrink-0 ${
            isDark
              ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
          }`}
        >
          View Current
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div>
          <p
            className={`text-[11px] uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            Quantity
          </p>
          <p
            className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}
          >
            {item.quantity} {item.unit || "unit"}
          </p>
        </div>
        <div>
          <p
            className={`text-[11px] uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            Unit Price
          </p>
          <p
            className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}
          >
            ${Number(item.price || 0).toFixed(2)}
          </p>
        </div>
        <div>
          <p
            className={`text-[11px] uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            Line Total
          </p>
          <p
            className={`text-sm font-semibold ${isDark ? "text-green-300" : "text-green-700"}`}
          >
            $
            {Number(
              item.lineTotal ??
                Number(item.price || 0) * Number(item.quantity || 0),
            ).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalError, setProductModalError] = useState<string | null>(
    null,
  );
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setIsLoading(true);
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleViewProduct = async (productId: string) => {
    setIsProductModalOpen(true);
    setSelectedProduct(null);
    setProductModalError(null);

    try {
      const product = await getProductById(productId);
      setSelectedProduct(product);
    } catch (error) {
      setProductModalError(
        error instanceof Error
          ? error.message
          : "Product is no longer available in current inventory.",
      );
    }
  };

  const handleBack = () => {
    navigate("/dashboard/orders");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg
          className={`w-12 h-12 animate-spin ${isDark ? "text-blue-500" : "text-blue-600"}`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  if (!order) {
    return (
      <div
        className={`text-center py-12 ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        <p className="text-xl mb-4">Order not found</p>
        <button
          onClick={handleBack}
          className={`${
            isDark
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white px-4 py-2 rounded-lg`}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const totalUnits = order.products.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );
  const ownerCanAccess =
    order.ownerProductAccess ?? order.status === "completed";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 text-sm mb-2 ${
              isDark
                ? "text-gray-400 hover:text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Orders
          </button>
          <h2
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Order #{order.id.slice(-6).toUpperCase()}
          </h2>
          <p className={`${isDark ? "text-gray-500" : "text-gray-500"}`}>
            Placed on {order.createdAt}
          </p>
        </div>
        <OrderStatusBadge status={order.status} isDark={isDark} />
      </div>

      <div
        className={`p-6 rounded-2xl ${
          isDark
            ? "bg-[#18191b] border border-gray-800"
            : "bg-white border border-gray-100 shadow-lg"
        }`}
      >
        <h3
          className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Order Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p
              className={`text-xs uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              Buyer
            </p>
            <p className={`${isDark ? "text-gray-200" : "text-gray-800"}`}>
              {order.buyer}
            </p>
          </div>
          <div>
            <p
              className={`text-xs uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              Items
            </p>
            <p className={`${isDark ? "text-gray-200" : "text-gray-800"}`}>
              {order.products.length} products · {totalUnits} units
            </p>
          </div>
          <div>
            <p
              className={`text-xs uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              Total Amount
            </p>
            <p
              className={`${isDark ? "text-green-300" : "text-green-700"} font-semibold`}
            >
              ${Number(order.total || 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p
              className={`text-xs uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              Owner Access
            </p>
            <p
              className={`text-sm ${
                ownerCanAccess
                  ? isDark
                    ? "text-green-300"
                    : "text-green-700"
                  : isDark
                    ? "text-amber-300"
                    : "text-amber-700"
              }`}
            >
              {ownerCanAccess
                ? `Available${order.ownerProductAccessAt ? ` since ${new Date(order.ownerProductAccessAt).toLocaleString()}` : ""}`
                : "Not yet. Unlocks when order is Delivered."}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`p-6 rounded-2xl ${
          isDark
            ? "bg-[#18191b] border border-gray-800"
            : "bg-white border border-gray-100 shadow-lg"
        }`}
      >
        <h3
          className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Ordered Products ({order.products.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {order.products.map((item, index) => (
            <OrderLineItemCard
              key={`${item.productId}-${item.variantId || "default"}-${index}`}
              item={item}
              index={index}
              isDark={isDark}
              onViewCurrentProduct={handleViewProduct}
            />
          ))}
        </div>
      </div>

      <ProductDetailsModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
          setProductModalError(null);
        }}
        product={selectedProduct}
        error={productModalError}
        isDark={isDark}
      />
    </div>
  );
}
