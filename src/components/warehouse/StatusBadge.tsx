// src/components/warehouse/StatusBadge.tsx
import type { ProductStatus } from "../../config/types";
import { useTheme } from "../../contexts/ThemeContext";

interface StatusBadgeProps {
  status: ProductStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { isDark } = useTheme();

  const styles = {
    "In Stock": isDark
      ? "bg-green-500/20 text-green-400 border border-green-500/30"
      : "bg-green-100 text-green-700 border border-green-200",
    "Out of Stock": isDark
      ? "bg-red-500/20 text-red-400 border border-red-500/30"
      : "bg-red-100 text-red-700 border border-red-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-lg font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};