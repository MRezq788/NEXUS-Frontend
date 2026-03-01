import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import type { Order, Product } from "../config/types";
import { getOrderById, getProductById } from "../services/warehouse.inventory.api";

// Product Card in Grid - Compact square/rectangle design
const OrderProductCard = ({
  productId,
  quantity,
  isDark,
  onViewProduct,
  delay,
}: {
  productId: string;
  quantity: number;
  isDark: boolean;
  onViewProduct: (productId: string) => void;
  delay: number;
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId);
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div 
        className={`p-4 rounded-xl ${isDark ? "bg-black/50" : "bg-gray-50"} animate-pulse h-32`}
        style={{ 
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: `all 0.3s ease-out ${delay}ms`
        }}
      >
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div 
        className={`p-4 rounded-xl ${isDark ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-100"} h-32 flex items-center justify-center`}
        style={{ 
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: `all 0.3s ease-out ${delay}ms`
        }}
      >
        <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"} text-center`}>
          Product not found
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group ${
        isDark
          ? "bg-[#1a1a1a] border border-gray-800 hover:border-gray-700"
          : "bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
      }`}
      style={{ 
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.3s ease-out ${delay}ms`
      }}
      onClick={() => onViewProduct(productId)}
    >
      {/* Product Icon/Image */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDark ? "bg-blue-500/20" : "bg-blue-100"
          }`}
        >
          <span className="text-2xl">📦</span>
        </div>
        {/* View Icon - Appears on hover */}
        <div className={`p-2 rounded-lg transition-all ${
          isDark 
            ? "bg-green-500/20 text-green-400 opacity-0 group-hover:opacity-100" 
            : "bg-green-100 text-green-600 opacity-0 group-hover:opacity-100"
        }`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
      </div>

      {/* Product Name - Truncated if too long */}
      <h4 className={`font-semibold text-sm mb-1 truncate ${isDark ? "text-white" : "text-gray-900"}`}>
        {product.name}
      </h4>
      
      {/* Category */}
      <p className={`text-xs mb-3 truncate ${isDark ? "text-gray-500" : "text-gray-500"}`}>
        {product.category}
      </p>

      {/* Quantity Badge */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-200 dark:border-gray-800">
        <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Quantity
        </span>
        <span className={`font-bold text-sm ${isDark ? "text-blue-400" : "text-blue-600"}`}>
          {quantity} {product.unit}
        </span>
      </div>
    </div>
  );
};

// Product Details Modal (unchanged)
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
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  product.status === "In Stock"
                    ? isDark
                      ? "bg-green-500/20 text-green-400"
                      : "bg-green-100 text-green-700"
                    : isDark
                    ? "bg-red-500/20 text-red-400"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {product.status}
              </span>
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

// Status badge component
const OrderStatusBadge = ({ status, isDark }: { status: string; isDark: boolean }) => {
  const styles: Record<string, string> = {
    Pending: isDark
      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
      : "bg-yellow-100 text-yellow-700 border border-yellow-200",
    Processing: isDark
      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
      : "bg-blue-100 text-blue-700 border border-blue-200",
    Completed: isDark
      ? "bg-green-500/20 text-green-400 border border-green-500/30"
      : "bg-green-100 text-green-700 border border-green-200",
    Cancelled: isDark
      ? "bg-red-500/20 text-red-400 border border-red-500/30"
      : "bg-red-100 text-red-700 border border-red-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xl font-medium ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
};

export function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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
    try {
      const product = await getProductById(productId);
      setSelectedProduct(product);
      setIsProductModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch product details:", error);
    }
  };

  const handleBack = () => {
    navigate("/dashboard/orders");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className={`w-12 h-12 animate-spin ${isDark ? "text-blue-500" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={`text-center py-12 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        <p className="text-xl mb-4">Order not found</p>
        <button
          onClick={handleBack}
          className={`px-4 py-2 rounded-lg ${
            isDark ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 text-2xl mb-2 transition-colors ${
              isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </button>
          <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Order #{order.id.slice(-6).toUpperCase()}
          </h2>
          <p className={`mt-1 text-lg ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} isDark={isDark} />
      </div>

      {/* Order Summary */}
      <div
        className={`p-6 rounded-2xl ${
          isDark ? "bg-[#18191b] border border-gray-800" : "bg-white border border-gray-100 shadow-lg"
        }`}
      >
        <h3 className={`text-2xl font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
          Order Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className={`text-base uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Buyer
            </p>
            <p className={`text-xl font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              {order.buyer}
            </p>
          </div>
          <div>
            <p className={`text-base uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Total Amount
            </p>
            <p className={`text-2xl font-bold ${isDark ? "text-green-400" : "text-green-600"}`}>
              ${order.total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid - Responsive Layout */}
      <div
        className={`p-6 rounded-2xl ${
          isDark ? "bg-[#18191b] border border-gray-800" : "bg-white border border-gray-100 shadow-lg"
        }`}
      >
        <h3 className={`text-2xl font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
          Products ({order.products.length})
        </h3>
        
        {/* 
          GRID CONFIGURATION:
          - Mobile: 1 column (default)
          - Small screens (sm): 2 columns
          - Medium screens (md): 3 columns  
          - Large screens (lg): 4 columns
          - Extra large (xl): 5 columns
          
          Change the grid-cols-* classes to adjust layout
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {order.products.map((item, index) => (
            <OrderProductCard
              key={item.productId}
              productId={item.productId}
              quantity={item.quantity}
              isDark={isDark}
              onViewProduct={handleViewProduct}
              delay={index * 50}
            />
          ))}
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        isDark={isDark}
      />
    </div>
  );
}