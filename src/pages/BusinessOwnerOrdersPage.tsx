import { useCallback, useEffect, useMemo, useState } from "react";
import { usersApi } from "../api";
import { useTheme } from "../contexts/ThemeContext";

interface OrderItem {
  id: string;
  total: number;
  type: string;
  createdAt: Date | string;
}

function formatOrderDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }
  return date.toLocaleString();
}

export function BusinessOwnerOrdersPage() {
  const { isDark } = useTheme();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "sold" | "bought">(
    "all",
  );

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const profileResponse = await usersApi.getUserProfile();
      const userId = profileResponse.data?.email;

      if (!userId) {
        throw new Error("Unable to load your profile.");
      }

      const ordersResponse = await usersApi.getRecentOrders(userId, 100);
      const recentOrders = ordersResponse.data?.recentOrders || [];

      setOrders(recentOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (typeFilter === "all") {
      return orders;
    }
    return orders.filter((order) => order.type === typeFilter);
  }, [orders, typeFilter]);

  const soldCount = orders.filter((order) => order.type === "sold").length;
  const boughtCount = orders.filter((order) => order.type === "bought").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Orders
          </h2>
          <p className={`${isDark ? "text-gray-500" : "text-gray-500"}`}>
            Full order feed for your business account
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as "all" | "sold" | "bought")
            }
            className={`px-4 py-2 rounded-xl text-sm border ${
              isDark
                ? "bg-black border-gray-700 text-gray-300"
                : "bg-white border-gray-200 text-gray-700"
            }`}
          >
            <option value="all">All</option>
            <option value="sold">Sold</option>
            <option value="bought">Bought</option>
          </select>
          <button
            onClick={() => {
              void fetchOrders();
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`rounded-2xl p-4 ${isDark ? "bg-[#1e1f23]" : "bg-white shadow-sm border border-gray-100"}`}
        >
          <p
            className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
          >
            Total Orders
          </p>
          <p
            className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {orders.length}
          </p>
        </div>
        <div
          className={`rounded-2xl p-4 ${isDark ? "bg-[#1e1f23]" : "bg-white shadow-sm border border-gray-100"}`}
        >
          <p
            className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
          >
            Sold
          </p>
          <p
            className={`text-2xl font-bold ${isDark ? "text-green-300" : "text-green-700"}`}
          >
            {soldCount}
          </p>
        </div>
        <div
          className={`rounded-2xl p-4 ${isDark ? "bg-[#1e1f23]" : "bg-white shadow-sm border border-gray-100"}`}
        >
          <p
            className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
          >
            Bought
          </p>
          <p
            className={`text-2xl font-bold ${isDark ? "text-amber-300" : "text-amber-700"}`}
          >
            {boughtCount}
          </p>
        </div>
      </div>

      <div
        className={`rounded-2xl overflow-hidden ${isDark ? "bg-[#1e1f23]" : "bg-white border border-gray-100 shadow-sm"}`}
      >
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading orders...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No orders found for this filter.
          </div>
        ) : (
          <div className="divide-y divide-gray-200/20">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <p
                    className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p
                    className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
                  >
                    {formatOrderDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      order.type === "sold"
                        ? isDark
                          ? "bg-green-500/20 text-green-300"
                          : "bg-green-50 text-green-700"
                        : isDark
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {order.type.toUpperCase()}
                  </span>
                  <p
                    className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {order.total.toLocaleString()} EGP
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
