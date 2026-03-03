import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { useTheme } from "../contexts/ThemeContext";
import { WarehouseDashboard } from "../components/dashboard/WarehouseDashboard";
import { BusinessOwnerDashboard } from "../components/dashboard/BusinessOwnerDashboard";
import { CashierDashboard } from "../components/dashboard/CashierDashboard";
import { usersApi } from "../api";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();

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
            if (user.email?.includes('warehouse')) {
              setRole('warehouse');
            } else {
              setRole('business_owner');
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to email-based detection
          if (user.email?.includes('warehouse')) {
            setRole('warehouse');
          } else {
            setRole('business_owner');
          }
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (role === "warehouse") {
    return <WarehouseDashboard isDark={isDark} />;
  }

  if (role === "cashier") {
    return <CashierDashboard isDark={isDark} />;
  }

  return <BusinessOwnerDashboard isDark={isDark} />;
}
