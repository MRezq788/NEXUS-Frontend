import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { usersApi } from "../../api";
import { auth } from "../../config/firbase";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

function normalizeRole(role: string): string {
  const normalized = role
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (normalized === "app_user") {
    return "business_owner";
  }

  if (normalized === "businessowner") {
    return "business_owner";
  }

  return normalized;
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);

        // If role checking is required, fetch user profile
        if (requiredRole) {
          try {
            const response = await usersApi.getUserProfile();
            if (response.success && response.data?.role) {
              setUserRole(response.data.role);
            } else {
              setUserRole(null);
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
            setUserRole(null);
          }
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole) {
    const allowedRoles = (
      Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    ).map(normalizeRole);
    const normalizedUserRole = userRole ? normalizeRole(userRole) : null;

    if (normalizedUserRole && !allowedRoles.includes(normalizedUserRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
