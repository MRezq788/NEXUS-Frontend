import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface CashierDashboardProps {
  isDark: boolean;
}

export const CashierDashboard = ({ isDark }: CashierDashboardProps) => {
  void isDark;
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/pos", { replace: true });
  }, [navigate]);

  return null;
};
