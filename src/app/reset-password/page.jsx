"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  AlertTriangle,
  KeyRound,
} from "lucide-react";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import AuthBackground from "@/components/auth/AuthBackground";
import AuthCard from "@/components/auth/AuthCard";

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlToken = new URLSearchParams(window.location.search).get("token");
      setToken(urlToken || "");
    }
  }, []);

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const password = newPassword.trim();
    const errors = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter.");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter.");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number.");
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character.");
    }

    if (errors.length > 0) {
      setError(errors.join(" "));
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reset/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword }),
        },
      );

      const data = await res.json();

      if (data.success) {
        await Swal.fire({
          title: "Success!",
          text: "Your password has been updated successfully.",
          icon: "success",
          confirmButtonColor: "#00d3bb",
          confirmButtonText: "Go to Login",
        });
        router.push("/login");
      } else {
        await Swal.fire({
          title: "Error",
          text: data.message || "Failed to reset password. Please try again.",
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
      }
    } catch (err) {
      await Swal.fire({
        title: "Error",
        text: "Something went wrong. Please try again later.",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };

  // Invalid / expired token state
  if (!token) {
    return (
      <div className="min-h-screen bg-obsidian font-sans text-white flex items-center justify-center relative overflow-hidden px-4">
        <AuthBackground variant="error" />

        <div className="relative z-10 w-full max-w-md">
          <AuthCard>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="text-center"
            >
              <motion.div
                variants={fadeUp}
                className="flex justify-center mb-6"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                >
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </motion.div>
              </motion.div>

              <motion.h2
                variants={fadeUp}
                className="text-2xl font-display font-bold text-ivory mb-3"
              >
                Invalid Link
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="text-slate-400 text-sm mb-8"
              >
                The password reset link is invalid or has expired.
              </motion.p>

              <motion.div variants={fadeUp}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/forgot-password")}
                  className="w-full py-3 rounded-lg text-sm font-bold text-background-dark bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  Request New Reset Link
                </motion.button>
              </motion.div>
            </motion.div>
          </AuthCard>
        </div>
      </div>
    );
  }

  // Valid token — show reset form
  return (
    <div className="min-h-screen bg-obsidian font-sans text-white flex flex-col relative overflow-hidden">
      <AuthBackground />

      <NavBar />

      <main className="relative z-10 flex-1 flex items-center justify-center w-full px-6 py-12 mt-16 md:mt-20">
        <div className="w-full max-w-md">
          <AuthCard>
            <motion.div variants={stagger} initial="hidden" animate="visible">
              {/* Icon */}
              <motion.div
                variants={fadeUp}
                className="flex justify-center mb-6"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(0,211,187,0.15)]"
                >
                  <KeyRound className="w-8 h-8 text-primary" />
                </motion.div>
              </motion.div>

              {/* Header */}
              <motion.div variants={fadeUp} className="text-center mb-8">
                <h1 className="text-2xl font-display font-bold tracking-tight text-white mb-2">
                  Set New Password
                </h1>
                <p className="font-serif italic text-slate-400">
                  Choose a strong key for your account.
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div variants={fadeUp} className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className={`block w-full pl-10 pr-10 py-3 bg-white/5 border ${error ? "border-red-500/50" : "border-white/10"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 text-white text-sm transition-all duration-300`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </motion.div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs font-medium"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.div variants={fadeUp}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !newPassword.trim()}
                    className="w-full py-3.5 rounded-lg text-sm font-bold text-background-dark bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </motion.button>
                </motion.div>
              </form>

              {/* Back to login */}
              <motion.p
                variants={fadeUp}
                className="text-center text-xs text-slate-500 mt-8"
              >
                Remember your password?{" "}
                <a
                  href="/login"
                  className="font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Back to Login
                </a>
              </motion.p>
            </motion.div>
          </AuthCard>
        </div>
      </main>

      <Footer />
    </div>
  );
}
