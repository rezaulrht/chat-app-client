"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Github, Mail, Lock, AlertCircle } from "lucide-react";
import useAuth from "@/hooks/useAuth";
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

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    const res = await login(data.email, data.password);
    if (!res.success) {
      if (res.message.toLowerCase().includes("not verified")) {
        setError(
          <span>
            {res.message}.{" "}
            <Link
              href={`/verify?email=${encodeURIComponent(data.email)}`}
              className="text-primary underline font-bold ml-1 hover:text-white"
            >
              Verify now
            </Link>
          </span>,
        );
      } else {
        setError(res.message);
      }
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-obsidian font-sans text-white flex items-center justify-center relative overflow-hidden">
      <AuthBackground />

      <main className="relative z-10 w-full max-w-md px-6 py-12 mt-16 md:mt-20">
        <AuthCard>
          <motion.div variants={stagger} initial="hidden" animate="visible">
            {/* Header */}
            <motion.div variants={fadeUp} className="text-center mb-10">
              <div className="flex justify-center mb-4">
                <img
                  src="https://i.ibb.co/PG0X3Tbf/Convo-X-logo.png"
                  alt="ConvoX Logo"
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-sm text-slate-400 font-sans">
                Enter your details to access your workspace.
              </p>
            </motion.div>

            {/* Social Login */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-2 gap-3 mb-8"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOAuth("google")}
                className="btn btn-outline border-white/10 hover:bg-white/5 text-slate-300 gap-2 h-auto py-2.5 min-h-0 text-xs font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOAuth("github")}
                className="btn btn-outline border-white/10 hover:bg-white/5 text-slate-300 gap-2 h-auto py-2.5 min-h-0 text-xs font-medium"
              >
                <Github className="w-4 h-4" />
                GitHub
              </motion.button>
            </motion.div>

            {/* Divider */}
            <motion.div variants={fadeUp} className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-obsidian text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  Or with email
                </span>
              </div>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <motion.div variants={fadeUp} className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    {...register("email", { required: "Email is required" })}
                    type="email"
                    placeholder="jane@example.com"
                    className={`block w-full pl-10 pr-4 py-3 bg-white/5 border ${errors.email ? "border-red-500/50" : "border-white/10"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 text-white text-sm transition-all duration-300`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-[10px] ml-1">
                    {errors.email.message}
                  </p>
                )}
              </motion.div>

              <motion.div variants={fadeUp} className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[10px] font-bold text-slate-500 hover:text-primary transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    {...register("password", {
                      required: "Password is required",
                    })}
                    type="password"
                    placeholder="••••••••"
                    className={`block w-full pl-10 pr-4 py-3 bg-white/5 border ${errors.password ? "border-red-500/50" : "border-white/10"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 text-white text-sm transition-all duration-300`}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-[10px] ml-1">
                    {errors.password.message}
                  </p>
                )}
              </motion.div>

              <motion.div variants={fadeUp}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full py-3.5 rounded-lg text-sm font-bold text-background-dark bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && (
                    <span className="loading loading-spinner loading-xs text-background-dark"></span>
                  )}
                  {loading ? "Signing In..." : "Sign In"}
                </motion.button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div variants={fadeUp} className="mt-8 text-center">
              <p className="text-xs text-slate-400">
                Don&apos;t have an account?
                <Link
                  href="/register"
                  className="font-bold text-primary hover:text-primary/80 transition-colors ml-1"
                >
                  Create account
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </AuthCard>
      </main>
    </div>
  );
}
