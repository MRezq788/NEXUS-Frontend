import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { SidebarTab } from "../../config/types";
import { sidebarTabs, warehouseTabs, cashierTabs } from "../../config/sidebar";
import { usersApi } from "../../api";
import { auth } from "../../config/firbase";
import Logo from "./Logo";

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
    Warehouses: (
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
          d="M3 10l9-6 9 6v8a2 2 0 01-2 2h-4v-6H9v6H5a2 2 0 01-2-2v-8z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
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

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { isDark } = useTheme();
  const [role, setRole] = useState<string>("business_owner");
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const tabs: SidebarTab[] =
    role === "warehouse"
      ? warehouseTabs
      : role === "cashier"
        ? cashierTabs
        : sidebarTabs.filter(
            (tab) =>
              role === "business_owner" || tab.title !== "Staff Management",
          );

  useEffect(() => {
    let lastWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const breakpoint = 1024;

      // Only auto-toggle when crossing the breakpoint
      if (lastWidth >= breakpoint && currentWidth < breakpoint) {
        onToggle(true);
      } else if (lastWidth < breakpoint && currentWidth >= breakpoint) {
        onToggle(false);
      }

      lastWidth = currentWidth;
    };

    // Set initial state based on current width
    if (window.innerWidth < 1024) {
      onToggle(true);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onToggle]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user profile from API to get actual role
          const response = await usersApi.getUserProfile();
          if (response.success && response.data?.role) {
            setRole(response.data.role);
          } else {
            // Fallback to email-based detection
            if (user.email?.includes("warehouse")) {
              setRole("warehouse");
            } else {
              setRole("business_owner");
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Fallback to email-based detection
          if (user.email?.includes("warehouse")) {
            setRole("warehouse");
          } else {
            setRole("business_owner");
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full flex flex-col ${
        isDark ? "bg-[#18191b] border-[#18191b]" : "bg-white border-gray-200"
      } border-r transition-all duration-300 z-50 ${isCollapsed ? "w-20" : "w-64"}`}
    >
      <div
        className={`transition-all duration-300 ${isCollapsed ? "px-0" : "px-0"}`}
      >
        <Logo showText={!isCollapsed} isCollapsed={isCollapsed} />
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <p
          className={`text-xs font-semibold uppercase tracking-wider mb-3 px-3 transition-opacity duration-300 ${isDark ? "text-gray-500" : "text-gray-400"} ${isCollapsed ? "opacity-0 invisible h-0" : "opacity-100"}`}
        >
          Menu
        </p>
        <ul className="space-y-1">
          {tabs.map((tab, index) => (
            <li
              key={tab.route}
              className={`transform transition-all duration-500 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
              style={{ transitionDelay: `${index * 75}ms` }}
            >
              <NavLink
                to={tab.route}
                end
                title={isCollapsed ? tab.title : ""}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isCollapsed ? "justify-center px-0" : ""
                  } ${
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
                <div className="shrink-0">
                  <IconComponent name={tab.title} isDark={isDark} />
                </div>
                {!isCollapsed && (
                  <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {tab.title}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={`p-4 border-t ${isDark ? "border-[#18191b]" : "border-gray-100"}`}
      >
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : ""}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
            isCollapsed ? "px-0" : ""
          } ${
            isDark
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "bg-red-50 text-red-600 hover:bg-red-100"
          }`}
        >
          <svg
            className="w-5 h-5 shrink-0"
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
          <span
            className={`font-medium transition-all duration-300 ${isCollapsed ? "hidden opacity-0" : "block opacity-100"}`}
          >
            Logout
          </span>
        </button>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle(!isCollapsed);
        }}
        className={`absolute -right-4 top-20 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer z-[60] ${
          isDark
            ? "bg-[#1e1f23] border-[#2d2e33] text-gray-400 hover:text-white"
            : "bg-white border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm"
        }`}
      >
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </aside>
  );
}
