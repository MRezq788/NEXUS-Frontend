import {
  X,
  ShoppingCart,
  FileText,
  Package,
  LogOut,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

interface SidebarMenuProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarMenu({ isDark, isOpen, onClose }: SidebarMenuProps) {
  const [userName, setUserName] = useState('Cashier');
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || user.email?.split('@')[0] || 'Cashier');
      setUserEmail(user.email || '');
    }
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isOpen) return null;

  const menuItems = [
    { icon: ShoppingCart, label: 'Point of Sale', active: true, path: '/pos' },
    { icon: Package, label: 'Inventory', path: '/dashboard/inventory' },
    { icon: FileText, label: 'Orders', path: '/dashboard/orders' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 bottom-0 w-72 shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-300 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header with User Info */}
        <div className={`p-4 sm:p-6 border-b ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gradient-to-br from-blue-50 to-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                {getInitials(userName)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm sm:text-base truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userName}
                </h3>
                <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{userEmail}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                  Cashier
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 py-2 overflow-y-auto">
          <nav className="px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                      onClose();
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                    item.active
                      ? isDark
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className={`p-4 border-t ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all font-medium border ${isDark ? 'text-red-400 hover:bg-red-900/20 border-red-800' : 'text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300'}`}
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
