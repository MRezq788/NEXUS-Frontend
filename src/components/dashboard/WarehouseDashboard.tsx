import { useState, useEffect, useCallback } from "react";
import { StatCard } from "./StatCard";
import { ChartPlaceholder } from "./ChartPlaceholder";
import { usersApi } from "../../api";
import type { TimePeriod, ChartData } from "./ChartPlaceholder";
import ListView from "./ListView";

interface WarehouseDashboardProps {
  isDark: boolean;
}

interface ActivityData {
  title: string;
  time: string;
  icon: string;
  variant: "default" | "success" | "warning" | "error";
}

export const WarehouseDashboard = ({ isDark }: WarehouseDashboardProps) => {
  const [chartPeriod, setChartPeriod] = useState<TimePeriod>("week");
  const [chartData, setChartData] = useState<ChartData[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [totalSold, setTotalSold] = useState<number>(0);
  const [totalBought, setTotalBought] = useState<number>(0);
  const [periodTotal, setPeriodTotal] = useState<number>(0);
  const [growth, setGrowth] = useState<number>(0);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<ActivityData[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { getAuth } = await import("firebase/auth");
      const { initializeApp } = await import("firebase/app");

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const user = auth.currentUser;

      if (user) {
        setUserId(user.email || "");
      }
    };

    getUser();
  }, []);

  const fetchRevenueData = useCallback(
    async (period: TimePeriod) => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const response = await usersApi.getRevenue(userId, period);

        if (response.success && response.data?.data) {
          setChartData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch revenue:", error);
        setChartData(undefined);
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  const fetchSoldTotal = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await usersApi.getSoldTotal(userId);

      if (response.success && response.data?.totalSold !== undefined) {
        setTotalSold(response.data.totalSold);
      }
    } catch (error) {
      console.error("Failed to fetch sold total:", error);
    }
  }, [userId]);

  const fetchBoughtTotal = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await usersApi.getBoughtTotal(userId);

      if (response.success && response.data?.totalBought !== undefined) {
        setTotalBought(response.data.totalBought);
      }
    } catch (error) {
      console.error("Failed to fetch bought total:", error);
    }
  }, [userId]);

  const fetchPeriodStats = useCallback(
    async (period: TimePeriod) => {
      if (!userId) return;

      try {
        const [revenueResponse, growthResponse, ordersResponse] =
          await Promise.all([
            usersApi.getTotalRevenuePeriod(userId, period),
            usersApi.getRevenueGrowth(userId, period),
            usersApi.getTotalOrdersPeriod(userId, period),
          ]);

        if (
          revenueResponse.success &&
          revenueResponse.data?.totalRevenue !== undefined
        ) {
          setPeriodTotal(revenueResponse.data.totalRevenue);
        }

        if (
          growthResponse.success &&
          growthResponse.data?.growth?.growth !== undefined
        ) {
          setGrowth(Math.round(growthResponse.data.growth.growth));
        }

        if (
          ordersResponse.success &&
          ordersResponse.data?.totalOrders !== undefined
        ) {
          setOrderCount(ordersResponse.data.totalOrders);
        }
      } catch (error) {
        console.error("Failed to fetch period stats:", error);
      }
    },
    [userId],
  );

  const fetchRecentOrders = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await usersApi.getRecentOrders(userId, 4);

      if (response.success && response.data?.recentOrders) {
        const orders: ActivityData[] = response.data.recentOrders.map(
          (order) => ({
            title: `Order #${order.id.slice(0, 8)}`,
            time: `${order.total} EGP - ${order.type === "sold" ? "Sold" : "Bought"}`,
            icon: order.type === "sold" ? "money" : "orders",
            variant: order.type === "sold" ? "success" : ("warning" as const),
          }),
        );
        setRecentOrders(orders);
      }
    } catch (error) {
      console.error("Failed to fetch recent orders:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchRevenueData(chartPeriod);
      fetchSoldTotal();
      fetchBoughtTotal();
      fetchPeriodStats(chartPeriod);
      fetchRecentOrders();
    }
  }, [
    chartPeriod,
    userId,
    fetchRevenueData,
    fetchSoldTotal,
    fetchBoughtTotal,
    fetchPeriodStats,
    fetchRecentOrders,
  ]);

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value as TimePeriod;
    setChartPeriod(period);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Stock"
          value={`$${totalSold.toLocaleString()}`}
          icon="box"
          trend="Total stock value"
          trendValue={0}
          isDark={isDark}
          delay={100}
          width="full"
          height="h-56"
          color="blue"
        />
        <StatCard
          title="Total Revenue"
          value={`$${periodTotal.toLocaleString()}`}
          icon="money"
          trend={`This ${chartPeriod === "week" ? "Week" : chartPeriod === "month" ? "Month" : "Year"}`}
          trendValue={0}
          isDark={isDark}
          delay={200}
          width="full"
          height="h-56"
          color="green"
        />
        <StatCard
          title="Pending Orders"
          value={`$${totalBought.toLocaleString()}`}
          icon="orders"
          trend="Pending orders value"
          trendValue={0}
          isDark={isDark}
          delay={300}
          width="full"
          height="h-56"
          color="orange"
          className="md:col-span-2 lg:col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`lg:col-span-2 p-6 rounded-3xl h-[29rem] transition-all duration-300 ${
            isDark
              ? "bg-[#1e1f23] border border-[#2d2e33] shadow-xl shadow-black/20"
              : "bg-white border border-gray-100 shadow-xl shadow-gray-200/50"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h3
                className={`text-lg sm:text-xl font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Warehouse Overview
              </h3>
              <p
                className={`text-xs sm:text-sm mt-1 truncate ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Track your warehouse performance
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <select
                value={chartPeriod}
                onChange={handlePeriodChange}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isDark
                    ? "bg-[#25262b] text-gray-300 border border-[#373a40] hover:border-gray-600"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300"
                } cursor-pointer`}
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
              <button
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isDark
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Export
              </button>
            </div>
          </div>
          <ChartPlaceholder
            isDark={isDark}
            period={chartPeriod}
            data={chartData}
            isLoading={isLoading}
          />

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                ${(periodTotal / 1000).toFixed(1)}K
              </p>
              <p
                className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                This{" "}
                {chartPeriod === "week"
                  ? "Week"
                  : chartPeriod === "month"
                    ? "Month"
                    : "Year"}
              </p>
            </div>
            <div className="text-center border-l border-gray-200 dark:border-gray-700">
              <p
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {growth > 0 ? "+" : ""}
                {growth}%
              </p>
              <p
                className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Growth
              </p>
            </div>
            <div className="text-center border-l border-gray-200 dark:border-gray-700">
              <p
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {orderCount > 0 ? orderCount : "-"}
              </p>
              <p
                className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Orders
              </p>
            </div>
          </div>
        </div>
        <ListView
          isDark={isDark}
          activities={
            recentOrders.length > 0
              ? recentOrders
              : [
                  {
                    title: "Loading...",
                    time: "",
                    icon: "orders",
                    variant: "default" as const,
                  },
                ]
          }
          title="Recent Orders"
          subtitle="Your latest 5 orders"
          height="h-[29rem]"
          showGrowing
        />
      </div>
    </div>
  );
};
