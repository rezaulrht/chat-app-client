"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data);
        } catch (err) {
          console.error("Auth verification failed:", err);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const registerUser = async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      // After registration, the backend might return success but not a token
      // depending on implementation. Our backend returns { message: "..." }
      // So we'll redirect to login after success or log them in automatically
      // Let's assume we redirect to login for simplicity or just return success
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  const oauthLogin = (token) => {
    localStorage.setItem("token", token);
    // After setting token, checkUser will run if we handle it correctly
    // or we just fetch user manually here
    verifyAndSetUser();
  };

  const verifyAndSetUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      router.push("/chat");
    } catch (err) {
      console.error("OAuth user fetch failed:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, oauthLogin, registerUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
