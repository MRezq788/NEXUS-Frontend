import { Menu, Calendar, Minus, Clock, X, User, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useTheme } from '../../contexts/ThemeContext';

interface POSHeaderProps {
  isDark: boolean;
  onMenuClick: () => void;
  onCloseOrder?: () => void;
  showCloseOrder?: boolean;
  currency?: string;
  onCurrencyChange?: (currency: string) => void;
}

const SUPPORTED_CURRENCIES = [
  { code: 'EGP', label: 'EGP' },
  { code: 'USD', label: 'USD' },
  { code: 'EUR', label: 'EUR' },
];

export function POSHeader({ isDark, onMenuClick, onCloseOrder, showCloseOrder = false, currency = 'EGP', onCurrencyChange }: POSHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const auth = getAuth();
  const userName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Cashier';
  const { toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className={`border-b shadow-sm sticky top-0 z-30 ${isDark ? 'bg-[#1e1f23] border-[#2d2e33]' : 'bg-slate-50 border-gray-200'}`}>
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onMenuClick}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isDark ? 'hover:bg-[#18191b] text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo/Brand - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">POS</span>
              </div>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Nexus POS</span>
            </div>

            {/* Date & Time */}
            <div className="hidden sm:flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1.5">
                <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-xs md:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatDate(currentTime)}
                </span>
              </div>
              <Minus className={`w-4 h-4 hidden md:block ${isDark ? 'text-[#2d2e33]' : 'text-gray-300'}`} />
              <div className="flex items-center gap-1.5">
                <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-xs md:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatTime(currentTime)}
                </span>
              </div>
            </div>

            {/* Mobile: Just show time */}
            <div className="flex sm:hidden items-center gap-1.5">
              <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {formatTime(currentTime)}
              </span>
            </div>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={e => onCurrencyChange?.(e.target.value)}
              className={`ml-4 px-2 py-1 rounded border text-xs font-medium ${isDark ? 'bg-[#18191b] border-[#2d2e33] text-blue-300' : 'bg-white border-gray-200 text-blue-700'}`}
              style={{ minWidth: 70 }}
            >
              {SUPPORTED_CURRENCIES.map(cur => (
                <option key={cur.code} value={cur.code}>{cur.label}</option>
              ))}
            </select>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* User Name - Hidden on small mobile */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg ${isDark ? 'bg-[#18191b]' : 'bg-white border border-gray-200'}`}>
              <User className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{userName}</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all flex-shrink-0 ${isDark ? 'hover:bg-[#18191b] text-yellow-400 hover:text-yellow-300' : 'hover:bg-white text-gray-600 hover:text-gray-900'}`}
              aria-label="Toggle theme"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Close Order Button */}
            {showCloseOrder && (
              <button
                onClick={onCloseOrder}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors border ${isDark ? 'text-red-400 hover:bg-red-900/20 border-red-800' : 'text-red-600 hover:bg-red-50 border-red-200'}`}
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Close Order</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
