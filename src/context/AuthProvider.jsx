"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "./AuthContext";
import api from "@/app/api/Axios";

export const AuthProvider = ({ children }) => {
  const router = useRouter();

  // Initialize state with lazy initialization from localStorage
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // Verification logic on mount
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        } catch (err) {
          console.error("Auth verification failed:", err);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  // Register function
  const register = useCallback(async (name, email, password) => {
    try {
      const response = await api.post("/auth/register", {
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
  }, []);

  // Login function
  const login = useCallback(
    async (email, password) => {
      try {
        const response = await api.post("/auth/login", { email, password });
        const { token, user } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);
        router.push("/chat");

        return { success: true, user };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || "Login failed",
        };
      }
    },
    [router],
  );

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }, [router]);

  // OAuth login and verification helper
  const verifyAndSetUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      router.push("/chat");
    } catch (err) {
      console.error("OAuth user fetch failed:", err);
      router.push("/login");
    }
  }, [router]);

  const oauthLogin = useCallback(
    (token) => {
      localStorage.setItem("token", token);
      verifyAndSetUser();
    },
    [verifyAndSetUser],
  );

  // Verify OTP function
  const verifyOTP = useCallback(
    async (email, otp) => {
      try {
        const response = await api.post("/auth/verify-otp", { email, otp });
        const { token, user } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);
        router.push("/chat");

        return { success: true, message: response.data.message };
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || "Verification failed",
        };
      }
    },
    [router],
  );

  // Resend OTP function
  const resendOTP = useCallback(async (email) => {
    try {
      const response = await api.post("/auth/resend-otp", { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to resend code",
      };
    }
  }, []);

  const authInfo = {
    user,
    loading,
    register,
    login,
    logout,
    oauthLogin,
    verifyOTP,
    resendOTP,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};
