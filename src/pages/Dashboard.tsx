import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { useTheme } from "../contexts/ThemeContext";
import { WarehouseDashboard } from "../components/dashboard/WarehouseDashboard";
import { BusinessOwnerDashboard } from "../components/dashboard/BusinessOwnerDashboard";
import { usersApi } from "../api";
import { auth } from "../config/firbase";

export function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email || "");
        try {
          // Fetch user profile from API to get actual role
          const response = await usersApi.getUserProfile();
          if (response.success && response.data?.role) {
            const userRole = response.data.role;
            setRole(userRole);

            // Redirect cashiers to POS page instead of showing dashboard
            if (userRole === 'cashier') {
              setRole("cashier");
              return;
            }
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
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (role === "warehouse") {
    return <WarehouseDashboard isDark={isDark} userId={userEmail} />;
  }

  return <BusinessOwnerDashboard isDark={isDark} userId={userEmail} />;
}
