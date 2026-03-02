import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthLayout } from './components/layout/AuthLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { StockPage } from './pages/WarehouseStockPage';
import { LoginPage } from './pages/LoginPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { Inventory } from './pages/Inventory';
import { Warehouses } from './pages/Warehouses';
import { WarehouseShop } from './pages/WarehouseShop';
import { OrdersPage } from './pages/WarehouseOrdersPage';
import { OrderDetailsPage } from './pages/WarehouseOrderDetailsPage';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            <Route
              path="/dashboard"
              element={
                <AuthLayout>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </AuthLayout>
              }
            />

            <Route
              path="/dashboard/inventory"
              element={
                <AuthLayout allowedRoles={['business_owner']}>
                  <DashboardLayout>
                    <Inventory />
                  </DashboardLayout>
                </AuthLayout>
              }
            />

            <Route
              path="/warehouses"
              element={
                <AuthLayout allowedRoles={['business_owner']}>
                  <DashboardLayout>
                    <Warehouses />
                  </DashboardLayout>
                </AuthLayout>
              }
            />

            <Route
              path="/warehouses/shop"
              element={
                <AuthLayout>
                  <DashboardLayout>
                    <WarehouseShop />
                  </DashboardLayout>
                </AuthLayout>
              }
            />
            
            {/* New Stock Route for Warehouse Users */}
            <Route
              path="/dashboard/stock"
              element={
                <AuthLayout allowedRoles={['warehouse']}>
                  <DashboardLayout>
                    <StockPage />
                  </DashboardLayout>
                </AuthLayout>
              }
            />

            <Route path="/dashboard/orders" element={
                <AuthLayout allowedRoles={['warehouse']}>
                  <DashboardLayout>
                    <OrdersPage />
                  </DashboardLayout>
                </AuthLayout>
              } />

            <Route path="/dashboard/orders/:orderId" element={
                <AuthLayout allowedRoles={['warehouse']}>
                  <DashboardLayout>
                    <OrderDetailsPage />
                  </DashboardLayout>
                </AuthLayout>
              } />

            <Route path="/" element={<LoginPage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;