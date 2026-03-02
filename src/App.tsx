import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthLayout } from './components/layout/AuthLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { LoginPage } from './pages/LoginPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { Inventory } from './pages/Inventory';
import { Warehouses } from './pages/Warehouses';
import { WarehouseShop } from './pages/WarehouseShop';

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
            
            <Route path="/" element={<h1>Welcome to the Home Page</h1>} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
