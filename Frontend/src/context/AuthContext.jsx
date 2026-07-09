import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user details if token exists on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data.user);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const loginUser = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user: loggedUser } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedUser));
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  };

  const registerUser = async (name, email, password, address) => {
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        address,
      });
      const { token, user: registeredUser } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(registeredUser));
      setUser(registeredUser);
      return registeredUser;
    } catch (error) {
      if (error.response?.data?.errors) {
        throw error.response.data.errors.map(err => err.msg).join(" | ");
      }
      throw error.response?.data?.message || "Registration failed";
    }
  };

  const logoutUser = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout request error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const changeUserPassword = async (oldPassword, newPassword) => {
    try {
      await api.put("/auth/change-password", { oldPassword, newPassword });
    } catch (error) {
      if (error.response?.data?.errors) {
        throw error.response.data.errors.map(err => err.msg).join(" | ");
      }
      throw error.response?.data?.message || "Password update failed";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        registerUser,
        logoutUser,
        changeUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
