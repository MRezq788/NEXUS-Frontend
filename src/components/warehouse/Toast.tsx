// src/components/warehouse/Toast.tsx
import { useTheme } from "../../contexts/ThemeContext";

interface ToastProps {
  message: string;
  type: "success" | "error";
  isVisible: boolean;
}

export const Toast = ({
  message,
  type,
  isVisible,
}: ToastProps) => {
  const { isDark } = useTheme();

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${
        type === "success"
          ? isDark
            ? "bg-green-600 text-white"
            : "bg-green-500 text-white"
          : isDark
          ? "bg-red-600 text-white"
          : "bg-red-500 text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        {type === "success" ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};