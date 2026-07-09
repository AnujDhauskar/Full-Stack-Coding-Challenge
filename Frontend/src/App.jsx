import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ChangePassword from "./pages/shared/ChangePassword";

import AdminDashboard from "./pages/admin/Dashboard";
import UserDashboard from "./pages/user/Dashboard";
import OwnerDashboard from "./pages/owner/Dashboard";

// Root redirect helper
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === "store_owner") {
    return <Navigate to="/owner/dashboard" replace />;
  } else {
    return <Navigate to="/user/dashboard" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* User Routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Store Owner Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={["store_owner"]}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
