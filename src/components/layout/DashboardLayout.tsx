import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import type { SidebarTab } from "../../config/types";
import { sidebarTabs, warehouseTabs } from "../../config/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const icons: Record<string, string> = {
  Dashboard: "📊",
  Inventory: "📦",
  Orders: "🛒",
  Reports: "📈",
  Settings: "⚙️",
  Stock: "📦",
  Inbound: "📥",
  Outbound: "📤",
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const tabs: SidebarTab[] =
    user?.role === "warehouse" ? warehouseTabs : sidebarTabs;

  return (
    <div
      className={`flex min-h-screen ${isDark ? "bg-gray-950" : "bg-slate-50"}`}
    >
      <aside
        className={`fixed left-0 top-0 h-full w-64 flex flex-col ${
          isDark
            ? "bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800"
            : "bg-white border-gray-200"
        } border-r transition-all duration-300`}
      >
        <div
          className={`p-6 border-b h-20 ${isDark ? "border-gray-800" : "border-gray-100"}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark
                  ? "bg-gradient-to-br from-blue-500 to-purple-600"
                  : "bg-gradient-to-br from-blue-500 to-blue-600"
              }`}
            >
              <span className="text-white text-lg font-bold">N</span>
            </div>
            <div className="">
              <h1
                className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Nexus
              </h1>
              <p
                className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                Management System
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <p
            className={`text-xs font-semibold uppercase tracking-wider mb-3 px-3 ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Menu
          </p>
          <ul className="space-y-1">
            {tabs.map((tab) => (
              <li key={tab.route}>
                <NavLink
                  to={tab.route}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? isDark
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                        : isDark
                          ? "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <span className="text-lg">{icons[tab.title] || "📄"}</span>
                  <span className="font-medium">{tab.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className={`p-4 border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}
        >
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-3 ${
              isDark
                ? "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {isDark ? (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
            <span className="font-medium">
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          <div
            className={`p-3 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-gray-50"}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isDark
                    ? "bg-gradient-to-br from-blue-500 to-purple-600"
                    : "bg-gradient-to-br from-blue-400 to-blue-600"
                }`}
              >
                <span className="text-white text-lg font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {user?.name}
                </p>
                <p
                  className={`text-xs truncate ${isDark ? "text-gray-500" : "text-gray-500"}`}
                >
                  {user?.role === "warehouse"
                    ? "Warehouse Manager"
                    : "Business Owner"}
                </p>
              </div>
              <button
                onClick={logout}
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  isDark
                    ? "hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                    : "hover:bg-red-100 text-gray-400 hover:text-red-500"
                }`}
                title="Logout"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 ml-64 flex flex-col ">
        <header
          className={` flex items-center justify-between px-8  backdrop-blur-sm h-20 `}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                isDark ? "bg-green-500/10" : "bg-green-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span
                className={`text-sm font-medium ${isDark ? "text-green-400" : "text-green-700"}`}
              >
                Online
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
