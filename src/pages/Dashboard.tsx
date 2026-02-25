import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const IconComponent = ({ name, isDark }: { name: string; isDark: boolean }) => {
  const color = isDark ? "#9ca3af" : "#6b7280";
  const activeColor = isDark ? "#60a5fa" : "#3b82f6";

  const icons: Record<string, React.ReactElement> = {
    box: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke={color}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
    inbound: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke={color}
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    outbound: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke={color}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
        />
      </svg>
    ),
    warning: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#ef4444"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    money: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke={activeColor}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    orders: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke={color}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
    users: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke={color}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    pending: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke={color}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    truck: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke={color}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    ),
    chart: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke={color}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    star: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#eab308"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
  };

  return (
    icons[name] || (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke={color}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    )
  );
};

const StatCard = ({
  title,
  value,
  icon,
  trend,
  isDark,
  delay,
}: {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  isDark: boolean;
  delay: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`relative overflow-hidden p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
        isDark
          ? "bg-[#18191b] border border-[#18191b]"
          : "bg-white border border-gray-100 shadow-xl shadow-gray-200/50"
      } ${isVisible ? "opacity-100" : "opacity-0"}`}
      style={{
        transition: `all 0.5s ease-out ${delay}ms`,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-sm font-medium mb-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
          >
            {title}
          </p>
          <p
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {value}
          </p>
          {trend && (
            <p
              className={`text-sm mt-2 ${trend.startsWith("+") ? "text-green-500" : "text-red-500"}`}
            >
              {trend}
            </p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? "bg-[#18191b]" : "bg-gray-100"}`}
        >
          <IconComponent name={icon} isDark={isDark} />
        </div>
      </div>
      <div
        className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10 ${isDark ? "bg-blue-500" : "bg-blue-500"}`}
      ></div>
    </div>
  );
};

const ActivityItem = ({
  title,
  time,
  icon,
  isDark,
  delay,
}: {
  title: string;
  time: string;
  icon: string;
  isDark: boolean;
  delay: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl hover:bg-opacity-50 transition-colors ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        transition: `all 0.5s ease-out ${delay}ms`,
        transform: isVisible ? "translateX(0)" : "translateX(-40px)",
      }}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? "bg-[#18191b]" : "bg-gray-100"}`}
      >
        <IconComponent name={icon} isDark={isDark} />
      </div>
      <div className="flex-1">
        <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
          {title}
        </p>
        <p className={`text-sm ${isDark ? "text-gray-600" : "text-gray-500"}`}>
          {time}
        </p>
      </div>
    </div>
  );
};

const ChartPlaceholder = ({ isDark }: { isDark: boolean }) => (
  <div
    className={`relative h-48 rounded-xl overflow-hidden ${isDark ? "bg-[#18191b]" : "bg-gray-50"}`}
  >
    <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
      {[65, 45, 80, 55, 70, 60, 85].map((height, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div
            className="w-8 rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500"
            style={{ height: `${height}%` }}
          ></div>
        </div>
      ))}
    </div>
    <div
      className={`absolute bottom-2 left-0 right-0 text-center text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}
    >
      Mon | Tue | Wed | Thu | Fri | Sat | Sun
    </div>
  </div>
);

function WarehouseDashboard({ isDark }: { isDark: boolean }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const activities = [
    {
      title: "Inbound shipment #1234 received",
      time: "2 minutes ago",
      icon: "inbound",
    },
    {
      title: "Outbound order #5678 dispatched",
      time: "15 minutes ago",
      icon: "truck",
    },
    {
      title: "Stock count updated for SKU-001",
      time: "1 hour ago",
      icon: "chart",
    },
    { title: "Low stock alert: SKU-045", time: "2 hours ago", icon: "warning" },
  ];

  return (
    <div className="space-y-6">
      <div
        className={`flex items-center justify-between ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
        style={{ transition: "all 0.5s ease-out" }}
      >
        <div>
          <h2
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Warehouse Dashboard
          </h2>
          <p className={`mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div
          className={`px-4 py-2 rounded-full text-sm font-medium ${isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"}`}
        >
          ● All Systems Operational
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Stock"
          value="12,450"
          icon="box"
          trend="+12% from last week"
          isDark={isDark}
          delay={100}
        />
        <StatCard
          title="Pending Inbound"
          value="28"
          icon="inbound"
          isDark={isDark}
          delay={200}
        />
        <StatCard
          title="Pending Outbound"
          value="15"
          icon="outbound"
          isDark={isDark}
          delay={300}
        />
        <StatCard
          title="Low Stock Items"
          value="7"
          icon="warning"
          trend="Needs attention"
          isDark={isDark}
          delay={400}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`lg:col-span-2 p-6 rounded-2xl ${isDark ? "bg-[#18191b] border border-[#18191b]" : "bg-white border border-gray-100 shadow-xl"}`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Weekly Activity
          </h3>
          <ChartPlaceholder isDark={isDark} />
        </div>
        <div
          className={`p-6 rounded-2xl ${isDark ? "bg-[#18191b] border border-[#18191b]" : "bg-white border border-gray-100 shadow-xl"}`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Recent Activity
          </h3>
          <div className="space-y-2">
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
}

function BusinessOwnerDashboard({ isDark }: { isDark: boolean }) {
  const activities = [
    { title: "New order #8921 placed", time: "5 minutes ago", icon: "orders" },
    { title: "Payment received $1,250", time: "30 minutes ago", icon: "money" },
    { title: "Customer feedback received", time: "2 hours ago", icon: "star" },
    { title: "Inventory restocked", time: "3 hours ago", icon: "box" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="$45,230"
          icon="money"
          trend="+15% this month"
          isDark={isDark}
          delay={100}
        />
        <StatCard
          title="Total Orders"
          value="156"
          icon="orders"
          trend="+8% this week"
          isDark={isDark}
          delay={200}
        />
        <StatCard
          title="Active Customers"
          value="89"
          icon="users"
          isDark={isDark}
          delay={300}
        />
        <StatCard
          title="Pending Orders"
          value="12"
          icon="pending"
          isDark={isDark}
          delay={400}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`lg:col-span-2 p-6 rounded-2xl ${isDark ? "bg-[#18191b] border border-[#18191b]" : "bg-white border border-gray-100 shadow-xl"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Revenue Overview
            </h3>
            <select
              className={`px-3 py-1 rounded-lg text-sm ${isDark ? "bg-[#18191b] text-gray-400 border-[#18191b]" : "bg-gray-100 text-gray-700 border-gray-200"} border`}
            >
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <ChartPlaceholder isDark={isDark} />
        </div>
        <div
          className={`p-6 rounded-2xl ${isDark ? "bg-[#18191b] border border-[#18191b]" : "bg-white border border-gray-100 shadow-xl"}`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Recent Activity
          </h3>
          <div className="space-y-2">
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
}

export function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();

  if (user?.role === "warehouse") {
    return <WarehouseDashboard isDark={isDark} />;
  }

  return <BusinessOwnerDashboard isDark={isDark} />;
}
