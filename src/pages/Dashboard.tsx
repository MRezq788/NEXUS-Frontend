import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { WarehouseDashboard } from "../components/dashboard/WarehouseDashboard";
import { BusinessOwnerDashboard } from "../components/dashboard/BusinessOwnerDashboard";

export function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();

  if (user?.role === "warehouse") {
    return <WarehouseDashboard isDark={isDark} />;
  }

  return <BusinessOwnerDashboard isDark={isDark} />;
}
