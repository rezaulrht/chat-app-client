"use client";

import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import useAxios from "@/hooks/useAxios";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const axios = useAxios();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Register function
  const register = async (name, email, password) => {
    try {
      const response = await axios.post("/auth/register", {
        name,
        email,
        password,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post("/auth/login", { email, password });
      const { token, user } = response.data;

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Update state
      setToken(token);
      setUser(user);

      return { success: true, user, token };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // Update user profile
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const authInfo = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};
