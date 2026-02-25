import { NavLink } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import type { SidebarTab } from '../../config/types';
import { sidebarTabs, warehouseTabs } from '../../config/sidebar';

const icons: Record<string, string> = {
  Dashboard: '📊',
  Inventory: '📦',
  Orders: '🛒',
  Reports: '📈',
  Settings: '⚙️',
  Stock: '📦',
  Inbound: '📥',
  Outbound: '📤',
};

export function Sidebar() {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();

  const tabs: SidebarTab[] = user?.role === 'warehouse' ? warehouseTabs : sidebarTabs;

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-64 flex flex-col ${
        isDark ? 'bg-[#18191b] border-[#18191b]' : 'bg-white border-gray-200'
      } border-r transition-all duration-300`}
    >
      <div
        className={`p-6 border-b h-20 ${isDark ? 'border-[#18191b]' : 'border-gray-100'}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark
                ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                : 'bg-gradient-to-br from-blue-500 to-blue-600'
            }`}
          >
            <span className="text-white text-lg font-bold">N</span>
          </div>
          <div className="">
            <h1
              className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              Nexus
            </h1>
            <p
              className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
            >
              Management System
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <p
          className={`text-xs font-semibold uppercase tracking-wider mb-3 px-3 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
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
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : isDark
                        ? 'text-gray-500 hover:bg-[#18191b] hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <span className="text-lg">{icons[tab.title] || '📄'}</span>
                <span className="font-medium">{tab.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={`p-4 border-t ${isDark ? 'border-[#18191b]' : 'border-gray-100'}`}
      >
        <button
          onClick={logout}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
            isDark
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'bg-red-50 text-red-600 hover:bg-red-100'
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
