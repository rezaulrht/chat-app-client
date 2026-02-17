"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { MessageSquare } from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    const result = await login(data.email, data.password);

    if (result.success) {
      router.push("/chat");
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark font-display text-white flex items-center justify-center relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] mix-blend-screen"></div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#13c8ec 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>
      </div>

      <main className="relative z-10 w-full max-w-md px-6 py-4">
        <div className="glass-card rounded-xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-6 ring-1 ring-primary/30">
              <MessageSquare className="text-primary w-6 h-6" />
            </div>

            <h1 className="text-2xl font-medium tracking-tight text-white mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-gray-400">
              Enter your details to access your workspace.
            </p>
          </div>

          {/* Social Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-lg px-4 py-3 transition-all duration-200 group"
          >
            <Image
              src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
              alt="Google"
              width={20}
              height={20}
              className="opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-sm">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#131d20] text-xs text-gray-500 uppercase tracking-wider rounded-full">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="relative floating-group">
              <input
                type="email"
                id="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                })}
                placeholder=" "
                className={`block w-full px-4 py-3 bg-white/5 border ${
                  errors.email ? "border-red-500" : "border-white/10"
                } rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary peer text-white transition-all duration-200`}
              />
              <label
                htmlFor="email"
                className="absolute left-4 transition-all duration-200 pointer-events-none origin-left"
              >
                Email Address
              </label>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="relative floating-group">
              <input
                type="password"
                id="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                placeholder=" "
                className={`block w-full px-4 py-3 bg-white/5 border ${
                  errors.password ? "border-red-500" : "border-white/10"
                } rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary peer text-white transition-all duration-200`}
              />
              <label
                htmlFor="password"
                className="absolute left-4 transition-all duration-200 pointer-events-none origin-left"
              >
                Password
              </label>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                href="#"
                className="text-xs font-medium text-gray-400 hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-[#101f22] bg-primary hover:bg-primary/90 transition-all duration-200 shadow-[0_0_20px_rgba(19,200,236,0.3)] hover:shadow-[0_0_25px_rgba(19,200,236,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?
              <Link
                href="register"
                className="font-medium text-primary hover:text-primary/80 transition-colors ml-1"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-8 opacity-40">
          <p className="text-xs text-gray-500">
            © 2026 Pulse Chat. Secure & Private.
          </p>
        </div>
      </main>
    </div>
  );
}
