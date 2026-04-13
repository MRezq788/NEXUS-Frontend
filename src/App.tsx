import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { POSProvider } from "./contexts/POSContext";
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
import { PointOfSale } from "./pages/PointOfSale.tsx";
import { InventoryAllocation } from "./pages/InventoryAllocation";
import { CashierInventory } from "./pages/CashierInventory.tsx";
import { CashierOrders } from "./pages/CashierOrders.tsx";
import { BuilderPage } from "./storefront/BuilderPage";
import { StorefrontRouter } from "./storefront/StorefrontRouter";
import { MyStoresPage } from "./pages/MyStoresPage";
import { StoreProductAllocationPage } from "./pages/StoreProductAllocationPage";

const NON_CASHIER_ROLES = ["business_owner", "warehouse"];

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
                <ProtectedRoute requiredRole={NON_CASHIER_ROLES}>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/inventory"
              element={
                <ProtectedRoute requiredRole={NON_CASHIER_ROLES}>
                  <DashboardLayout>
                    <Inventory />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/inventory-allocation"
              element={
                <ProtectedRoute requiredRole="business_owner">
                  <DashboardLayout>
                    <InventoryAllocation />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/warehouses"
              element={
                <ProtectedRoute requiredRole={NON_CASHIER_ROLES}>
                  <DashboardLayout>
                    <Warehouses />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/warehouses/shop"
              element={
                <ProtectedRoute requiredRole={NON_CASHIER_ROLES}>
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
                <ProtectedRoute requiredRole={NON_CASHIER_ROLES}>
                  <DashboardLayout>
                    <Inventory />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/orders"
              element={
                <ProtectedRoute requiredRole={NON_CASHIER_ROLES}>
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
                <ProtectedRoute requiredRole={NON_CASHIER_ROLES}>
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
              path="/cashier-inventory"
              element={
                <ProtectedRoute requiredRole="cashier">
                  <CashierInventory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cashier-orders"
              element={
                <ProtectedRoute requiredRole="cashier">
                  <CashierOrders />
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
              path="/my-stores"
              element={
                <ProtectedRoute requiredRole="business_owner">
                  <DashboardLayout>
                    <MyStoresPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-stores/:siteName/allocation"
              element={
                <ProtectedRoute requiredRole="business_owner">
                  <DashboardLayout>
                    <StoreProductAllocationPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/inventory/add"
              element={
                <ProtectedRoute requiredRole={NON_CASHIER_ROLES}>
                  <DashboardLayout>
                    <AddProduct />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/inventory/edit/:id"
              element={
                <ProtectedRoute requiredRole={NON_CASHIER_ROLES}>
                  <DashboardLayout>
                    <AddProduct />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route path="/builder/:siteName" element={<BuilderPage />} />
            <Route path="/builder/:siteName/:pageId" element={<BuilderPage />} />
            <Route path="/:siteName/*" element={<StorefrontRouter />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </POSProvider>
  );
}

export default App;
