import { useEffect, useState } from "react";
import { IconComponent } from "./IconComponent";

interface ActivityItemProps {
  title: string;
  time: string;
  icon: string;
  isDark: boolean;
  delay: number;
  variant?: "default" | "success" | "warning" | "error";
}

export const ActivityItem = ({
  title,
  time,
  icon,
  isDark,
  delay,
  variant = "default",
}: ActivityItemProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const variantStyles = {
    default: {
      bg: isDark ? "hover:bg-[#25262b]" : "hover:bg-gray-50",
      iconBg: isDark ? "bg-[#2c2e33]" : "bg-gray-100",
      border: "border-transparent",
    },
    success: {
      bg: isDark ? "hover:bg-emerald-500/10" : "hover:bg-emerald-50",
      iconBg: "bg-emerald-500/20",
      border: "border-emerald-500/30",
    },
    warning: {
      bg: isDark ? "hover:bg-amber-500/10" : "hover:bg-amber-50",
      iconBg: "bg-amber-500/20",
      border: "border-amber-500/30",
    },
    error: {
      bg: isDark ? "hover:bg-red-500/10" : "hover:bg-red-50",
      iconBg: "bg-red-500/20",
      border: "border-red-500/30",
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`relative h-12 flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer border ${style.bg} ${style.border} ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
        transform: isVisible ? "translateX(0)" : "translateX(-40px)",
      }}
    >
      <div
        className={`relative w-8 h-8 rounded-xl flex items-center justify-center ${style.iconBg} transition-all duration-300`}
        style={{
          transform: isHovered
            ? "scale(1.1) rotate(5deg)"
            : "scale(1) rotate(0)",
        }}
      >
        <div
          className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : ""
          } bg-gradient-to-br from-white/20 to-transparent`}
        />
        <IconComponent name={icon} isDark={isDark} />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold truncate transition-colors duration-200 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
          style={{
            transform: isHovered ? "translateX(4px)" : "translateX(0)",
            transition: "transform 0.3s ease",
          }}
        >
          {title}
        </p>
        <p
          className={`text-sm mt-0.5 ${isDark ? "text-gray-500" : "text-gray-500"}`}
        >
          {time}
        </p>
      </div>

      <div
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          isHovered ? "w-3 h-3" : ""
        } ${
          variant === "success"
            ? "bg-emerald-500"
            : variant === "warning"
              ? "bg-amber-500"
              : variant === "error"
                ? "bg-red-500"
                : isDark
                  ? "bg-gray-600"
                  : "bg-gray-400"
        }`}
      />
    </div>
  );
};
