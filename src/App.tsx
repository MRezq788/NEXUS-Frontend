import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { LoginPage } from "./pages/LoginPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { Inventory } from "./pages/Inventory";
import { Warehouses } from "./pages/Warehouses";
import { WarehouseShop } from "./pages/WarehouseShop";
import { OrdersPage } from "./pages/WarehouseOrdersPage";
import { OrderDetailsPage } from "./pages/WarehouseOrderDetailsPage";
import { StaffManagement } from "./pages/StaffManagement";
import { AddProduct } from "./pages/AddProduct";
import { BusinessOwnerOrdersPage } from "./pages/BusinessOwnerOrdersPage.tsx";
import { ReportsPage } from "./pages/ReportsPage.tsx";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

function App() {
  return (
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
                  <Inventory />
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
            path="/orders"
            element={
              <ProtectedRoute requiredRole="business_owner">
                <DashboardLayout>
                  <BusinessOwnerOrdersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredRole="business_owner">
                <DashboardLayout>
                  <ReportsPage />
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
            path="/staff-management"
            element={
              <ProtectedRoute requiredRole="business_owner">
                <DashboardLayout>
                  <StaffManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/inventory/add"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AddProduct />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/inventory/edit/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AddProduct />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
