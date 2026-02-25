import { NavLink } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import type { SidebarTab } from "../../config/types";
import { sidebarTabs, warehouseTabs } from "../../config/sidebar";

const IconComponent = ({ name, isDark }: { name: string; isDark: boolean }) => {
  const color = isDark ? "#9ca3af" : "#6b7280";

  const icons: Record<string, React.ReactElement> = {
    Dashboard: (
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
          d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z"
        />
      </svg>
    ),
    Inventory: (
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
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
    Orders: (
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
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
    Reports: (
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
    Settings: (
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
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    Stock: (
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
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    ),
    Inbound: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke={color}
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    Outbound: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke={color}
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  };

  return (
    icons[name] || (
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    )
  );
};

export function Sidebar() {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();

  const tabs: SidebarTab[] =
    user?.role === "warehouse" ? warehouseTabs : sidebarTabs;

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-64 flex flex-col ${
        isDark ? "bg-[#18191b] border-[#18191b]" : "bg-white border-gray-200"
      } border-r transition-all duration-300`}
    >
      <div
        className={`p-6 border-b h-20 ${isDark ? "border-[#18191b]" : "border-gray-100"}`}
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
                        ? "text-gray-400 hover:bg-[#2b2c2e] hover:text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                <IconComponent name={tab.title} isDark={isDark} />
                <span className="font-medium">{tab.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={`p-4 border-t ${isDark ? "border-[#18191b]" : "border-gray-100"}`}
      >
        <button
          onClick={logout}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
            isDark
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "bg-red-50 text-red-600 hover:bg-red-100"
          }`}
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
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
