import { useEffect, useState } from "react";
import { IconComponent } from "./IconComponent";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendValue?: number;
  isDark: boolean;
  delay: number;
  width?: string;
  height?: string;
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

export const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  isDark,
  delay,
  width = "full",
  height = "h-32",
  color = "blue",
}: StatCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorSchemes = {
    blue: {
      gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
      iconGlow: "shadow-blue-500/25",
      accent: "text-blue-500",
      trendUp: "text-emerald-500",
      trendDown: "text-red-500",
    },
    green: {
      gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      iconGlow: "shadow-emerald-500/25",
      accent: "text-emerald-500",
      trendUp: "text-emerald-500",
      trendDown: "text-red-500",
    },
    purple: {
      gradient: "from-violet-500/20 via-violet-500/5 to-transparent",
      iconBg: "bg-gradient-to-br from-violet-500 to-violet-600",
      iconGlow: "shadow-violet-500/25",
      accent: "text-violet-500",
      trendUp: "text-emerald-500",
      trendDown: "text-red-500",
    },
    orange: {
      gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      iconGlow: "shadow-amber-500/25",
      accent: "text-amber-500",
      trendUp: "text-emerald-500",
      trendDown: "text-red-500",
    },
    red: {
      gradient: "from-rose-500/20 via-rose-500/5 to-transparent",
      iconBg: "bg-gradient-to-br from-rose-500 to-rose-600",
      iconGlow: "shadow-rose-500/25",
      accent: "text-rose-500",
      trendUp: "text-emerald-500",
      trendDown: "text-red-500",
    },
  };

  const scheme = colorSchemes[color];
  const isPositive = trendValue !== undefined ? trendValue >= 0 : trend?.startsWith("+");

  return (
    <div
      className={`relative overflow-hidden p-6 rounded-2xl transition-all duration-500 cursor-pointer ${
        isDark
          ? "bg-[#1e1f23] border border-[#2d2e33]"
          : "bg-white border border-gray-100 shadow-lg shadow-gray-200/40"
      } ${isVisible ? "opacity-100" : "opacity-0"} w-${width} ${height}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
        transform: isVisible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
      }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${scheme.gradient} opacity-0 transition-opacity duration-500 ${
          isHovered ? "opacity-100" : ""
        }`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p
              className={`text-sm font-medium uppercase tracking-wider ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {title}
            </p>
            <p
              className={`text-4xl font-extrabold mt-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
              style={{
                transition: "transform 0.3s ease",
                transform: isHovered ? "scale(1.05)" : "scale(1)",
              }}
            >
              {value}
            </p>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${scheme.iconBg} ${
              isHovered ? `${scheme.iconGlow} shadow-lg` : "shadow-md"
            } transition-all duration-300`}
            style={{
              transform: isHovered ? "rotate(5deg) scale(1.1)" : "rotate(0) scale(1)",
            }}
          >
            <IconComponent name={icon} isDark={false} />
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isPositive ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"
              }`}
            >
              <svg
                className={`w-3 h-3 ${isPositive ? "" : "rotate-180"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {trend}
            </span>
          </div>
        )}
      </div>

      <div
        className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full transition-all duration-700 ${
          isHovered ? "scale-150 opacity-20" : "scale-100 opacity-10"
        } bg-gradient-to-br from-${color}-400 to-${color}-600`}
      />

      <div
        className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl transition-opacity duration-700 ${
          isHovered ? "opacity-30" : "opacity-10"
        } bg-${color}-400`}
      />
    </div>
  );
};
