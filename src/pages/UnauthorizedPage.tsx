import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { usersApi } from '../api';

function normalizeRole(role: string): string {
  const normalized = role.trim().toLowerCase().replace(/[\s-]+/g, '_');

  if (normalized === 'app_user' || normalized === 'businessowner') {
    return 'business_owner';
  }

  return normalized;
}

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadRole = async () => {
      try {
        const response = await usersApi.getUserProfile();
        if (!mounted) return;
        const nextRole = response.success && response.data?.role
          ? normalizeRole(response.data.role)
          : null;
        setRole(nextRole);
      } catch {
        if (mounted) setRole(null);
      }
    };

    loadRole();

    return () => {
      mounted = false;
    };
  }, []);

  const redirectPath = useMemo(() => (role === 'cashier' ? '/pos' : '/dashboard'), [role]);
  const buttonLabel = role === 'cashier' ? 'Go to POS' : 'Go to Dashboard';

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="text-center">
        <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>403</h1>
        <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>You don't have permission to access this page.</p>
        <button
          onClick={() => navigate(redirectPath)}
          className={`px-6 py-2 rounded-lg ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
