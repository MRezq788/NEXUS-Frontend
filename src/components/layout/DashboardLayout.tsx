import type { ReactNode } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className={`flex min-h-screen ${isDark ? "bg-black" : "bg-slate-50"}`}>
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <header
          className={`flex items-center mt-4 justify-between px-8 backdrop-blur-sm h-20 ${
            isDark
              ? "bg-black/80 border-[#18191b]"
              : "bg-white/80 border-gray-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <div>
              <h2
                className={`text-3xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Welcome Back, Business Owner!
              </h2>
              <p
                className={`mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Your business at a glance.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                isDark
                  ? "hover:bg-[#18191b] text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
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
            </button>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDark
                  ? "bg-gradient-to-br from-blue-500 to-purple-600"
                  : "bg-gradient-to-br from-blue-400 to-blue-600"
              }`}
            >
              <span className="text-white text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 pt-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
