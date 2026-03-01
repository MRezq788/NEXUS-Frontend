// src/components/warehouse/StatCard.tsx
import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";

const getDelayClass = (ms: number) => {
  const validDelays = [0, 75, 100, 150, 200, 300, 500, 700, 1000];
  if (validDelays.includes(ms)) return `delay-${ms}`;
  return "delay-75";
};

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  color: string;
  delay: number;
  isLoading?: boolean;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
  delay,
  isLoading,
}: StatCardProps) => {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorStyles: Record<string, { bg: string; text: string; lightBg: string }> = {
    blue: {
      bg: "from-blue-500/20 to-blue-600/20",
      text: "text-blue-400",
      lightBg: "bg-blue-50",
    },
    green: {
      bg: "from-green-500/20 to-green-600/20",
      text: "text-green-400",
      lightBg: "bg-green-50",
    },
    red: {
      bg: "from-red-500/20 to-red-600/20",
      text: "text-red-400",
      lightBg: "bg-red-50",
    },
  };

  const style = colorStyles[color];

  return (
    <div
      className={`relative overflow-hidden p-6 rounded-2xl transition-all duration-500 hover:scale-[1.02] ${
        isDark
          ? "bg-[#18191b] border border-gray-800"
          : "bg-white border border-gray-100 shadow-lg shadow-gray-200/50"
      } ${getDelayClass(delay)} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-2xl ${
              isDark ? `bg-gradient-to-br ${style.bg}` : style.lightBg
            }`}
          >
            {icon}
          </div>
          <p className={`text-lg font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {title}
          </p>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              {value}
            </p>
          )}
          <p className={`text-base mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};