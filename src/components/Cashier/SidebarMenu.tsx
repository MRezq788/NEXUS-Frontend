import {
  ShoppingCart,
  FileText,
  Package,
  Activity,
  BarChart3,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../layout/Logo';

interface SidebarMenuProps {
  isDark: boolean;
  isCollapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

export function SidebarMenu({ isDark, isCollapsed, onToggle }: SidebarMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  useEffect(() => {
    let lastWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const breakpoint = 1024;

      if (lastWidth >= breakpoint && currentWidth < breakpoint) {
        onToggle(true);
      } else if (lastWidth < breakpoint && currentWidth >= breakpoint) {
        onToggle(false);
      }

      lastWidth = currentWidth;
    };

    if (window.innerWidth < 1024) {
      onToggle(true);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onToggle]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { icon: ShoppingCart, label: 'Point of Sale', path: '/pos' },
    { icon: Package, label: 'Inventory', path: '/cashier-inventory' },
    { icon: FileText, label: 'Orders', path: '/cashier-orders' },
    { icon: Activity, label: 'Activity', path: '/pos' },
    { icon: BarChart3, label: 'Report', path: '/pos' },
    { icon: Users, label: 'Team', path: '/pos' },
    { icon: Settings, label: 'Setting', path: '/pos' },
  ];

  const isMenuItemActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full flex flex-col ${
        isDark ? 'bg-[#18191b] border-[#18191b]' : 'bg-white border-gray-200'
      } border-r transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      <div className="transition-all duration-300">
        <Logo showText={!isCollapsed} isCollapsed={isCollapsed} />
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <p
          className={`text-xs font-semibold uppercase tracking-wider mb-3 px-3 transition-opacity duration-300 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          } ${isCollapsed ? 'opacity-0 invisible h-0' : 'opacity-100'}`}
        >
          Menu
        </p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isMenuItemActive(item.path);
            return (
              <li key={item.label}>
                <button
                  onClick={() => navigate(item.path)}
                  title={isCollapsed ? item.label : ''}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    isActive
                      ? isDark
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : isDark
                        ? 'text-gray-400 hover:bg-[#2b2c2e] hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={`p-4 border-t ${isDark ? 'border-[#18191b]' : 'border-gray-100'}`}>
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : ''}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
            isCollapsed ? 'px-0' : ''
          } ${
            isDark
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className={`font-medium transition-all duration-300 ${isCollapsed ? 'hidden opacity-0' : 'block opacity-100'}`}>
            Logout
          </span>
        </button>
      </div>

      <button
        onClick={() => onToggle(!isCollapsed)}
        className={`absolute -right-4 top-20 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer z-[60] ${
          isDark
            ? 'bg-[#1e1f23] border-[#2d2e33] text-gray-400 hover:text-white'
            : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm'
        }`}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </aside>
  );
}
