"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Shield,
  Zap,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Github,
  AlertCircle,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    const res = await registerUser(data.fullname, data.email, data.password);
    if (res.success) {
      router.push(`/verify?email=${encodeURIComponent(data.email)}`);
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
  };

  return (
    <div className="bg-[#05050A] font-sans text-gray-200 antialiased min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-175 h-125 bg-blue-600/20 rounded-full blur-[120px] opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_center,black_50%,transparent_100%)] pointer-events-none" />
      </div>

      <main className="grow flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* LEFT SIDE */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 pr-10">
            <div className="flex items-center">
              <span className="text-3xl font-bold text-white tracking-tight">
                Convo<span className="text-[#13c8ec]">X</span>
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.1]">
                Join the future of <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-300 via-blue-100 to-blue-300">
                  team communication.
                </span>
              </h1>
              <p className="text-lg text-slate-400 max-w-md font-light">
                Experience a distraction-free environment designed for
                high-performance teams.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4 text-slate-300">
                <Shield className="w-6 h-6 text-[#13c8ec]" />
                <span className="text-lg font-light tracking-wide">
                  End-to-End Encryption
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <Zap className="w-6 h-6 text-[#13c8ec]" />
                <span className="text-lg font-light tracking-wide">
                  Lightning Fast Sync
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="w-full max-w-md mx-auto">
            <div className="lg:hidden flex justify-center mb-8">
              <span className="text-3xl font-bold text-white tracking-tight">
                Convo<span className="text-[#13c8ec]">X</span>
              </span>
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-xl relative border border-white/10 shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#13c8ec] to-transparent opacity-50"></div>

              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="group/input">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      {...register("fullname", {
                        required: "Name is required",
                      })}
                      type="text"
                      className={`block w-full pl-10 pr-3 py-2.5 bg-background-dark/50 border ${errors.fullname ? "border-red-500/50" : "border-white/10"} rounded-lg text-white text-sm focus:ring-1 focus:ring-[#13c8ec] outline-none transition-all`}
                      placeholder="Jane Doe"
                    />
                  </div>
                  {errors.fullname && (
                    <p className="text-red-500 text-[10px] mt-1 ml-1">
                      {errors.fullname.message}
                    </p>
                  )}
                </div>

                <div className="group/input">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1 ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      type="email"
                      className={`block w-full pl-10 pr-3 py-2.5 bg-background-dark/50 border ${errors.email ? "border-red-500/50" : "border-white/10"} rounded-lg text-white text-sm focus:ring-1 focus:ring-[#13c8ec] outline-none transition-all`}
                      placeholder="jane@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-[10px] mt-1 ml-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="group/input">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 6, message: "Min 6 characters" },
                      })}
                      type={showPassword ? "text" : "password"}
                      className={`block w-full pl-10 pr-10 py-2.5 bg-background-dark/50 border ${errors.password ? "border-red-500/50" : "border-white/10"} rounded-lg text-white text-sm focus:ring-1 focus:ring-[#13c8ec] outline-none transition-all`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-[10px] mt-1 ml-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center py-1">
                  <input
                    {...register("terms", {
                      required: "Terms agreement required",
                    })}
                    type="checkbox"
                    id="terms"
                    className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-[#13c8ec] focus:ring-[#13c8ec]"
                  />
                  <label
                    htmlFor="terms"
                    className="ml-2 text-xs font-light text-gray-400"
                  >
                    I agree to the{" "}
                    <Link
                      href="#"
                      className="text-[#13c8ec] hover:underline font-medium"
                    >
                      Terms
                    </Link>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-red-500 text-[10px] ml-1">
                    {errors.terms.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg text-sm font-bold text-background-dark bg-[#13c8ec] hover:bg-[#13c8ec]/90 transition-all shadow-lg shadow-[#13c8ec]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && (
                    <span className="loading loading-spinner loading-xs text-background-dark"></span>
                  )}
                  {loading ? "Creating Account..." : "Start Chatting"}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase text-slate-500 tracking-widest font-bold">
                  <span className="px-3 bg-[#0c1214]">Social Signup</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
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
                </button>
                <button
                  onClick={() => handleOAuth("github")}
                  className="btn btn-outline border-white/10 hover:bg-white/5 text-slate-300 gap-2 h-auto py-2.5 min-h-0 text-xs font-medium"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </button>
              </div>

              <p className="mt-8 text-center text-xs text-slate-400">
                Joined already?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#13c8ec] hover:text-[#13c8ec]/80 transition-colors"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
