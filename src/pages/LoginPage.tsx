import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(async () => {
      const success = await login(email, password);
      setIsLoading(false);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Invalid credentials. Use "warehouse@test.com" or "owner@test.com"');
      }
    }, 800);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-slate-100'} relative overflow-hidden`}>
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-6 p-3 rounded-xl transition-all duration-200 ${
          isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-white text-gray-600'
        }`}
      >
        {isDark ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <div className={`absolute inset-0 ${isDark ? 'opacity-5' : 'opacity-30'}`}>
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full ${
          isDark ? 'bg-blue-500 blur-3xl' : 'bg-blue-300 blur-3xl'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full ${
          isDark ? 'bg-purple-500 blur-3xl' : 'bg-purple-300 blur-3xl'
        }`}></div>
      </div>

      <div className={`relative w-full max-w-md p-8 rounded-2xl ${
        isDark 
          ? 'bg-gray-900/80 backdrop-blur-xl border border-gray-800 shadow-2xl shadow-black/50' 
          : 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl'
      }`}>
        <div className="flex flex-col items-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
            isDark 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
              : 'bg-gradient-to-br from-blue-500 to-blue-600'
          }`}>
            <span className="text-white text-2xl font-bold">N</span>
          </div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sign in to Nexus Management</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
              placeholder="warehouse@test.com or owner@test.com"
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
              placeholder="Enter any password"
            />
          </div>
          
          {error && (
            <div className={`p-3 rounded-xl text-sm ${
              isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
              isDark 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-600/25' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25'
            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className={`mt-6 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <p>Demo credentials:</p>
          <p className="mt-1 font-mono text-xs">warehouse@test.com / owner@test.com</p>
        </div>
      </div>
    </div>
  );
}
