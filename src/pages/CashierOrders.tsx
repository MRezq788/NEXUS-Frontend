import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useTheme } from "../contexts/ThemeContext";
import { usersApi } from "../api";
import { POSHeader } from "../components/Cashier/POSHeader";
import { SidebarMenu } from "../components/Cashier/SidebarMenu";

const CASHIER_SIDEBAR_STORAGE_KEY = 'cashier.sidebarCollapsed';
const CASHIER_ORDERS_CACHE_KEY = 'cashier.orders.page';
const PAGE_CACHE_TTL_MS = 60_000;

type CachedPayload<T> = { savedAt: number; data: T };

function readPageCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload<T>;
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > PAGE_CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writePageCache<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  const payload: CachedPayload<T> = { savedAt: Date.now(), data };
  window.localStorage.setItem(key, JSON.stringify(payload));
}

interface CashierOrderItem {
  id: string;
  total: number;
  createdAt: string | Date | { _seconds?: number; seconds?: number };
}

function formatOrderDate(value: CashierOrderItem["createdAt"]) {
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "string") return new Date(value).toLocaleString();
  const seconds = typeof value?.seconds === "number" ? value.seconds : value?._seconds;
  if (typeof seconds === "number") return new Date(seconds * 1000).toLocaleString();
  return "-";
}

export function CashierOrders() {
  const { isDark } = useTheme();
  const [currency, setCurrency] = useState(() => localStorage.getItem('pos.currency') || 'EGP');
  const [isPageVisible, setIsPageVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(CASHIER_SIDEBAR_STORAGE_KEY) === '1';
  });
  const [orders, setOrders] = useState<CashierOrderItem[]>(() => readPageCache<CashierOrderItem[]>(CASHIER_ORDERS_CACHE_KEY)?.slice() ?? []);
  const [isLoadingOrders, setIsLoadingOrders] = useState(() => !readPageCache<CashierOrderItem[]>(CASHIER_ORDERS_CACHE_KEY));
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsPageVisible(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchCashierOrders = async (silent = false) => {
      if (!silent) setIsLoadingOrders(true);
      setOrdersError(null);

      try {
        const user = getAuth().currentUser;
        const userEmail = user?.email;

        if (!userEmail) {
          setOrders([]);
          setOrdersError("User not authenticated.");
          return;
        }

        const response = await usersApi.getRecentOrders(userEmail, 50);
        const nextOrders = response.data?.recentOrders ?? [];
        setOrders(nextOrders);
        writePageCache(CASHIER_ORDERS_CACHE_KEY, nextOrders);
      } catch (error) {
        console.error("Error fetching cashier orders:", error);
        setOrders([]);
        setOrdersError(error instanceof Error ? error.message : "Failed to load orders.");
      } finally {
        setIsLoadingOrders(false);
      }
    };

    const hasOrdersCache = !!readPageCache<CashierOrderItem[]>(CASHIER_ORDERS_CACHE_KEY);
    fetchCashierOrders(hasOrdersCache);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CASHIER_SIDEBAR_STORAGE_KEY, isSidebarCollapsed ? '1' : '0');
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('pos.currency', currency);
  }, [currency]);

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden ${
        isDark
          ? 'bg-black'
          : 'bg-slate-50'
      }`}
    >
      <SidebarMenu isDark={isDark} isCollapsed={isSidebarCollapsed} onToggle={setIsSidebarCollapsed} />

      <div className={`flex-1 flex flex-col overflow-hidden transform-gpu transition-all duration-500 ${
        isPageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <POSHeader
          isDark={isDark}
          onMenuClick={() => setIsSidebarCollapsed((prev) => !prev)}
          currency={currency}
          onCurrencyChange={setCurrency}
        />

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 scrollbar-hide">
          <section
            className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-[#1e1f23] border-[#2d2e33]' : 'bg-white border-gray-100 shadow-lg shadow-gray-200/30'
            }`}
          >
            <div className={`px-6 py-4 border-b ${isDark ? 'border-[#2d2e33]' : 'border-gray-100'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Cashier Orders
              </h2>
            </div>

            {ordersError ? (
              <p className="px-6 py-8 text-sm text-red-500">{ordersError}</p>
            ) : isLoadingOrders ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <p className={`px-6 py-8 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                No orders found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={isDark ? 'bg-[#18191b] text-gray-300' : 'bg-slate-50 text-gray-600'}>
                    <tr>
                      <th className="text-left px-6 py-3">Order ID</th>
                      <th className="text-left px-6 py-3">Total</th>
                      <th className="text-left px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className={`border-t ${
                          isDark ? 'border-[#2d2e33] text-gray-200' : 'border-gray-100 text-gray-700'
                        }`}
                      >
                        <td className="px-6 py-4 font-medium">{order.id}</td>
                        <td className="px-6 py-4">{Number(order.total || 0).toFixed(2)} {currency}</td>
                        <td className="px-6 py-4">{formatOrderDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
