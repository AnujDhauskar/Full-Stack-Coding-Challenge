import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "5px solid rgba(255, 255, 255, 0.1)",
            borderTop: "5px solid var(--accent-primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Authenticating...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user to their own valid dashboard
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === "store_owner") {
      return <Navigate to="/owner/dashboard" replace />;
    } else {
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
