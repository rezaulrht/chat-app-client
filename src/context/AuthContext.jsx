"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
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

  const login = useCallback(
    async (email, password) => {
      try {
        const res = await api.post("/auth/login", { email, password });
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        setUser(user);
        router.push("/chat");
        return { success: true };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Login failed",
        };
      }
    },
    [router],
  );

  const registerUser = useCallback(async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  }, [router]);

  const verifyAndSetUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      router.push("/chat");
    } catch (err) {
      console.error("OAuth user fetch failed:", err);
    }
  }, [router]);

  const oauthLogin = useCallback(
    (token) => {
      localStorage.setItem("token", token);
      verifyAndSetUser();
    },
    [verifyAndSetUser],
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, oauthLogin, registerUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
