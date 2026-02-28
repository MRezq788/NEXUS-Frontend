import { useEffect, useState } from "react";
import { StatCard } from "./StatCard";
import { ActivityItem } from "./ActivityItem";
import { ChartPlaceholder } from "./ChartPlaceholder";

interface WarehouseDashboardProps {
  isDark: boolean;
}

export const WarehouseDashboard = ({ isDark }: WarehouseDashboardProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const activities = [
    {
      title: "Inbound shipment #1234 received",
      time: "2 minutes ago",
      icon: "inbound",
      variant: "success" as const,
    },
    {
      title: "Outbound order #5678 dispatched",
      time: "15 minutes ago",
      icon: "truck",
      variant: "success" as const,
    },
    {
      title: "Stock count updated for SKU-001",
      time: "1 hour ago",
      icon: "chart",
    },
    { title: "Low stock alert: SKU-045", time: "2 hours ago", icon: "warning", variant: "warning" as const },
  ];

  return (
    <div className="space-y-8">
      <div
        className={`flex items-center justify-between ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
        style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
      >
        <div>
          <div className="flex items-center gap-3">
            <h2
              className={`text-3xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Warehouse Dashboard
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-500">
              Live
            </span>
          </div>
          <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div
          className={`px-5 py-3 rounded-2xl flex items-center gap-3 ${
            isDark
              ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30"
              : "bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200"
          }`}
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className={`font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            All Systems Operational
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Stock"
          value="12,450"
          icon="box"
          trend="+12% from last week"
          trendValue={12}
          isDark={isDark}
          delay={100}
          color="blue"
        />
        <StatCard
          title="Pending Inbound"
          value="28"
          icon="inbound"
          trend="+5 from yesterday"
          trendValue={5}
          isDark={isDark}
          delay={200}
          color="green"
        />
        <StatCard
          title="Pending Outbound"
          value="15"
          icon="outbound"
          trend="-3 from yesterday"
          trendValue={-3}
          isDark={isDark}
          delay={300}
          color="purple"
        />
        <StatCard
          title="Low Stock Items"
          value="7"
          icon="warning"
          trend="Needs attention"
          trendValue={0}
          isDark={isDark}
          delay={400}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`lg:col-span-2 p-6 rounded-3xl transition-all duration-300 ${
            isDark
              ? "bg-[#1e1f23] border border-[#2d2e33] shadow-xl shadow-black/20"
              : "bg-white border border-gray-100 shadow-xl shadow-gray-200/50"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3
                className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Weekly Activity
              </h3>
              <p className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                Overview of warehouse operations
              </p>
            </div>
            <select
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isDark
                  ? "bg-[#25262b] text-gray-300 border border-[#373a40] hover:border-gray-600"
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300"
              } cursor-pointer`}
            >
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <ChartPlaceholder isDark={isDark} />
        </div>
        <div
          className={`p-6 rounded-3xl transition-all duration-300 ${
            isDark
              ? "bg-[#1e1f23] border border-[#2d2e33] shadow-xl shadow-black/20"
              : "bg-white border border-gray-100 shadow-xl shadow-gray-200/50"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3
                className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Recent Activity
              </h3>
              <p className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                Latest warehouse updates
              </p>
            </div>
            <button
              className={`text-sm font-medium ${
                isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"
              } transition-colors`}
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {activities.map((activity, i) => (
              <ActivityItem
                key={i}
                {...activity}
                isDark={isDark}
                delay={500 + i * 100}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
