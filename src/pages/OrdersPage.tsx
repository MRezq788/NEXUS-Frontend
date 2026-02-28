import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import type { Order, OrderStatus } from "../config/types";
import { getOrders, updateOrderStatus, acceptOrder, rejectOrder } from "../services/api";

// Status badge component for orders - Updated to match StockPage style
const OrderStatusBadge = ({ status, isDark }: { status: OrderStatus; isDark: boolean }) => {
  const styles = {
    pending: isDark
      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
      : "bg-yellow-100 text-yellow-700 border border-yellow-200",
    processing: isDark
      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
      : "bg-blue-100 text-blue-700 border border-blue-200",
    completed: isDark
      ? "bg-green-500/20 text-green-400 border border-green-500/30"
      : "bg-green-100 text-green-700 border border-green-200",
    cancelled: isDark
      ? "bg-red-500/20 text-red-400 border border-red-500/30"
      : "bg-red-100 text-red-700 border border-red-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-base font-medium ${styles[status]}`}>
      {status}
    </span>
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
  type: "success" | "danger" | "warning";
  isDark: boolean;
  isLoading?: boolean;
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    success: {
      icon: "text-green-500",
      bg: isDark ? "bg-green-500/20" : "bg-green-100",
      button: isDark
        ? "bg-green-600 hover:bg-green-700 text-white"
        : "bg-green-600 hover:bg-green-700 text-white",
    },
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
            {type === "success" && (
              <svg className={`w-8 h-8 ${style.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {type === "danger" && (
              <svg className={`w-8 h-8 ${style.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {type === "warning" && (
              <svg className={`w-8 h-8 ${style.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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

// Alert Modal for insufficient stock
const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  isDark,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  isDark: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-2xl p-6 ${
          isDark ? "bg-[#18191b] border border-gray-800" : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-red-500/20" : "bg-red-100"}`}>
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

                    <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            {title}
          </h3>
          <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {message}
          </p>

          <button
            onClick={onClose}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all ${
              isDark
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

// Order Card Component - Updated with action buttons
const OrderCard = ({
  order,
  isDark,
  onView,
  onAccept,
  onReject,
  onDeliver,
  delay,
}: {
  order: Order;
  isDark: boolean;
  onView: (orderId: string) => void;
  onAccept: (order: Order) => void;
  onReject: (order: Order) => void;
  onDeliver: (order: Order) => void;
  delay: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Determine which buttons to show based on status
  const showAcceptReject = order.status === "pending";
  const showDeliver = order.status === "processing";

  return (
    <div
      className={`relative overflow-hidden p-6 rounded-2xl transition-all duration-500 hover:scale-[1.02] ${
        isDark
          ? "bg-[#18191b] border border-gray-800"
          : "bg-white border border-gray-100 shadow-lg shadow-gray-200/50"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark ? "bg-blue-500/20" : "bg-blue-50"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke={isDark ? "#60a5fa" : "#3b82f6"}
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Order ID
              </p>
              <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                #{order.id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Buyer
              </p>
              <p className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {order.buyer}
              </p>
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Total
              </p>
              <p className={`text-xl font-bold ${isDark ? "text-green-400" : "text-green-600"}`}>
                ${order.total.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Status Badge - Now prominently displayed */}
          <div className="flex items-center justify-between mb-4">
            <OrderStatusBadge status={order.status} isDark={isDark} />
            <p className={`text-base ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => onView(order.id)}
          className={`ml-4 p-3 rounded-xl transition-colors ${
            isDark
              ? "hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
              : "hover:bg-blue-50 text-blue-600 hover:text-blue-700"
          }`}
          title="View Order Details"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {showAcceptReject && (
          <>
            <button
              onClick={() => onAccept(order)}
              className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                isDark
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              Accept
            </button>
            <button
              onClick={() => onReject(order)}
              className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                isDark
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              Reject
            </button>
          </>
        )}
        {showDeliver && (
          <button
            onClick={() => onDeliver(order)}
            className={`w-full px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              isDark
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Mark as Delivered
          </button>
        )}
        {!showAcceptReject && !showDeliver && (
          <p className={`text-sm text-center w-full py-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Order {order.status}
          </p>
        )}
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

export function OrdersPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "All">("All");
  const [isVisible, setIsVisible] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: "success" | "danger" | "warning";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    type: "success",
    onConfirm: () => {},
  });

  // Alert modal state for insufficient stock
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getOrders(filterStatus === "All" ? undefined : filterStatus);
      setOrders(data);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to fetch orders", "error");
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewOrder = (orderId: string) => {
    navigate(`/dashboard/orders/${orderId}`);
  };

  // Handle Accept Order
  const handleAcceptClick = (order: Order) => {
    setConfirmModal({
      isOpen: true,
      title: "Accept Order",
      message: `Are you sure you want to accept order #${order.id.slice(-6).toUpperCase()}? This will deduct the required quantities from your stock.`,
      confirmText: "Accept",
      cancelText: "Cancel",
      type: "success",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setIsActionLoading(true);
        
        try {
          const result = await acceptOrder(order.id);
          
          if (result.success) {
            showToast("Order accepted successfully", "success");
            fetchOrders();
          } else {
            // Insufficient stock
            setAlertModal({
              isOpen: true,
              title: "Cannot Accept Order",
              message: result.message || "Insufficient stock to fulfill this order.",
            });
          }
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Failed to accept order", "error");
        } finally {
          setIsActionLoading(false);
        }
      },
    });
  };

  // Handle Reject Order
  const handleRejectClick = (order: Order) => {
    setConfirmModal({
      isOpen: true,
      title: "Reject Order",
      message: `Are you sure you want to reject order #${order.id.slice(-6).toUpperCase()}? This action cannot be undone.`,
      confirmText: "Reject",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setIsActionLoading(true);
        
        try {
          await rejectOrder(order.id);
          showToast("Order rejected successfully", "success");
          fetchOrders();
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Failed to reject order", "error");
        } finally {
          setIsActionLoading(false);
        }
      },
    });
  };

  // Handle Deliver Order
  const handleDeliverClick = (order: Order) => {
    setConfirmModal({
      isOpen: true,
      title: "Mark as Delivered",
      message: `Confirm that order #${order.id.slice(-6).toUpperCase()} has been delivered?`,
      confirmText: "Delivered",
      cancelText: "Cancel",
      type: "warning",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setIsActionLoading(true);
        
        try {
          await updateOrderStatus(order.id, "completed");
          showToast("Order marked as delivered", "success");
          fetchOrders();
        } catch (error) {
          showToast(error instanceof Error ? error.message : "Failed to update order", "error");
        } finally {
          setIsActionLoading(false);
        }
      },
    });
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
          Order Requests
        </h2>
        <p className={`mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
          Manage and track all incoming orders
        </p>
      </div>

      {/* Filter Bar */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl ${
          isDark ? "bg-[#18191b] border border-gray-800" : "bg-white border border-gray-100 shadow-lg"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Filter by Status:
          </span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | "All")}
            className={`px-3 py-2 rounded-lg border text-lg ${
              isDark
                ? "bg-black border-gray-700 text-gray-300"
                : "bg-gray-50 border-gray-200 text-gray-700"
            } focus:outline-none focus:border-blue-500`}
          >
            <option value="All">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <p className={`text-2xl ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Total: <span className="font-semibold">{orders.length}</span> orders
        </p>
      </div>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center">
          <svg className={`w-12 h-12 animate-spin mb-4 ${isDark ? "text-blue-500" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading orders...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order, index) => (
            <OrderCard
              key={order.id}
              order={order}
              isDark={isDark}
              onView={handleViewOrder}
              onAccept={handleAcceptClick}
              onReject={handleRejectClick}
              onDeliver={handleDeliverClick}
              delay={index * 50}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && orders.length === 0 && (
        <div className="py-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            No orders found
          </p>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Try adjusting your filter
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        isDark={isDark}
        isLoading={isActionLoading}
      />

      {/* Alert Modal for Insufficient Stock */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        isDark={isDark}
      />
    </div>
  );
}