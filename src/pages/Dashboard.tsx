import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { useTheme } from "../contexts/ThemeContext";
import { WarehouseDashboard } from "../components/dashboard/WarehouseDashboard";
import { BusinessOwnerDashboard } from "../components/dashboard/BusinessOwnerDashboard";

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
  const { isDark } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email?.includes('warehouse')) {
        setRole('warehouse');
      } else {
        setRole('business_owner');
      }
    });
    return () => unsubscribe();
  }, []);

  if (role === "warehouse") {
    return <WarehouseDashboard isDark={isDark} />;
  }

  return <BusinessOwnerDashboard isDark={isDark} />;
}
