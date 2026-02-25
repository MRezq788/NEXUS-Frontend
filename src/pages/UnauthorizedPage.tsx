import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="text-center">
        <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>403</h1>
        <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>You don't have permission to access this page.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className={`px-6 py-2 rounded-lg ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
