import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { POSProvider } from "./contexts/POSContext";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { StockPage } from "./pages/WarehouseStockPage";
import { LoginPage } from "./pages/LoginPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { Inventory } from "./pages/Inventory";
import { Warehouses } from "./pages/Warehouses";
import { WarehouseShop } from "./pages/WarehouseShop";
import { OrdersPage } from "./pages/WarehouseOrdersPage";
import { OrderDetailsPage } from "./pages/WarehouseOrderDetailsPage";
import { StaffManagement } from "./pages/StaffManagement";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import {PointOfSale} from "./pages/PointOfSale.tsx";

function App() {
  return (
    <POSProvider>
      <ThemeProvider>
        <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/inventory"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Inventory />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouses"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Warehouses />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouses/shop"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <WarehouseShop />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* New Stock Route for Warehouse Users */}
          <Route
            path="/dashboard/stock"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <StockPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/orders"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <OrdersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/orders/:orderId"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <OrderDetailsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pos"
            element={
              <ProtectedRoute requiredRole="cashier">
                <PointOfSale />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff-management"
            element={
              <ProtectedRoute requiredRole="business_owner">
                <DashboardLayout>
                  <StaffManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
    </POSProvider>
  );
}

export default App;
