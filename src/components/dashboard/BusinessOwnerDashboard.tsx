import { StatCard } from "./StatCard";
import { ActivityItem } from "./ActivityItem";
import { ChartPlaceholder } from "./ChartPlaceholder";

interface BusinessOwnerDashboardProps {
  isDark: boolean;
}

export const BusinessOwnerDashboard = ({
  isDark,
}: BusinessOwnerDashboardProps) => {
  const activities = [
    {
      title: "New order #8921 placed",
      time: "5 minutes ago",
      icon: "orders",
      variant: "success" as const,
    },
    {
      title: "Payment received $1,250",
      time: "30 minutes ago",
      icon: "money",
      variant: "success" as const,
    },
    {
      title: "Customer feedback received",
      time: "2 hours ago",
      icon: "star",
      variant: "default" as const,
    },
    {
      title: "Inventory restocked",
      time: "3 hours ago",
      icon: "box",
      variant: "default" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatCard
          title="Total Revenue"
          value="$45,230"
          icon="money"
          trend="+15.3% this month"
          trendValue={15.3}
          isDark={isDark}
          delay={100}
          width="full"
          height="h-56"
          color="green"
        />
        <StatCard
          title="Total Expenses"
          value="$12,450"
          icon="orders"
          trend="+8.2% this week"
          trendValue={8.2}
          isDark={isDark}
          delay={200}
          width="full"
          height="h-56"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`lg:col-span-2 p-6 rounded-3xl h-fit transition-all duration-300 ${
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
                Revenue Overview
              </h3>
              <p
                className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Track your business performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isDark
                    ? "bg-[#25262b] text-gray-300 border border-[#373a40] hover:border-gray-600"
                    : "bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300"
                } cursor-pointer`}
              >
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>
              <button
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isDark
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Export
              </button>
            </div>
          </div>
          <ChartPlaceholder isDark={isDark} />

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                $45.2K
              </p>
              <p
                className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                This Month
              </p>
            </div>
            <div className="text-center border-l border-gray-200 dark:border-gray-700">
              <p
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                +23%
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
                142
              </p>
              <p
                className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Orders
              </p>
            </div>
          </div>
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
              <p
                className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Latest business updates
              </p>
            </div>
            <button
              className={`text-sm font-medium ${
                isDark
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-500"
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

          <div
            className={`mt-6 p-4 rounded-2xl ${isDark ? "bg-[#25262b]" : "bg-gray-50"}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div>
                <p
                  className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Business Growing
                </p>
                <p
                  className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
                >
                  23% more than last month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
