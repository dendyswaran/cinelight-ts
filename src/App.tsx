import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ConfigProvider } from "antd";
import dayjs from "dayjs";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Loading from "./components/Loading";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Equipment pages
import EquipmentList from "./pages/Equipment";
import EquipmentDetail from "./pages/Equipment/EquipmentDetail";
import CreateEquipment from "./pages/Equipment/CreateEquipment";
import EditEquipment from "./pages/Equipment/EditEquipment";

// Equipment Category pages
import EquipmentCategoryList from "./pages/EquipmentCategory";
import CategoryDetail from "./pages/EquipmentCategory/CategoryDetail";
import CreateCategory from "./pages/EquipmentCategory/CreateCategory";
import EditCategory from "./pages/EquipmentCategory/EditCategory";

// Equipment Bundle pages
import EquipmentBundleList from "./pages/EquipmentBundle";
import BundleDetail from "./pages/EquipmentBundle/BundleDetail";
import CreateBundle from "./pages/EquipmentBundle/CreateBundle";
import EditBundle from "./pages/EquipmentBundle/EditBundle";

// Configure theme
const theme = {
  token: {
    colorPrimary: "#1890ff",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#f5222d",
    colorInfo: "#1890ff",
    borderRadius: 4,
  },
};

// Authentication guard component for protected routes
interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullScreen tip="Loading authentication..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Guest-only route (for login page)
interface GuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen tip="Loading authentication..." />;
  }

  if (isAuthenticated) {
    // Redirect to dashboard if already authenticated
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Equipment Routes */}
        <Route path="equipment">
          <Route index element={<EquipmentList />} />
          <Route path=":id" element={<EquipmentDetail />} />
          <Route path="create" element={<CreateEquipment />} />
          <Route path="edit/:id" element={<EditEquipment />} />
        </Route>

        {/* Equipment Category Routes */}
        <Route path="equipment-categories">
          <Route index element={<EquipmentCategoryList />} />
          <Route path=":id" element={<CategoryDetail />} />
          <Route path="create" element={<CreateCategory />} />
          <Route path="edit/:id" element={<EditCategory />} />
        </Route>

        {/* Equipment Bundle Routes */}
        <Route path="equipment-bundles">
          <Route index element={<EquipmentBundleList />} />
          <Route path=":id" element={<BundleDetail />} />
          <Route path="create" element={<CreateBundle />} />
          <Route path="edit/:id" element={<EditBundle />} />
        </Route>

        {/* Add more routes as needed */}
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ConfigProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
