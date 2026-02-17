"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  Bolt,
  Shield,
  Zap,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Github,
} from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Function to handle form submission
  const onSubmit = (data) => {
    console.log("Registration Data:", data);
  };

  return (
    <div className="bg-background-dark font-display text-gray-200 antialiased min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Glows (Fixed to prevent scroll interference) */}
      <div className="glow-effect top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] absolute"></div>
      <div className="glow-effect bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] opacity-60 absolute"></div>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* LEFT SIDE: Hidden on Mobile, Visible on Desktop */}
          <div className="hidden lg:flex flex-col justify-center space-y-6 pr-10">
            <div className="inline-flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-[0_0_15px_rgba(19,218,236,0.5)]">
                <Bolt className="text-background-dark w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-bold text-white tracking-wide">
                Convo<span className="text-primary">X</span>
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white leading-tight">
                Join the future of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">
                  team communication.
                </span>
              </h1>
              <p className="text-base text-gray-400 max-w-md font-light">
                Experience a distraction-free environment designed for
                high-performance teams.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded bg-surface-dark border border-border-dark text-primary">
                  <Shield size={18} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium">Encrypted</h3>
                  <p className="text-xs text-gray-500">Secure by design.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded bg-surface-dark border border-border-dark text-primary">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium">Fast</h3>
                  <p className="text-xs text-gray-500">Instant syncing.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: The Form (Always visible, sits at top on mobile) */}
          <div className="w-full max-w-md mx-auto">
            {/* Mobile-only Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <div className="inline-flex items-center space-x-2">
                <Bolt className="text-primary w-6 h-6" />
                <span className="text-xl font-bold text-white">
                  Nexus<span className="text-primary">Chat</span>
                </span>
              </div>
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white">Create account</h2>
                <p className="text-gray-400 text-xs mt-1">
                  Free 14-day trial • No card needed
                </p>
              </div>

              {/* Form with handleSubmit */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="group/input">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      {...register("fullname", { required: true })}
                      type="text"
                      className="block w-full pl-10 pr-3 py-2.5 bg-background-dark/50 border border-border-dark rounded-lg text-white text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                <div className="group/input">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1 ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      {...register("email", { required: true })}
                      type="email"
                      className="block w-full pl-10 pr-3 py-2.5 bg-background-dark/50 border border-border-dark rounded-lg text-white text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div className="group/input">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      {...register("password", { required: true })}
                      type={showPassword ? "text" : "password"}
                      className="block w-full pl-10 pr-10 py-2.5 bg-background-dark/50 border border-border-dark rounded-lg text-white text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
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
                </div>

                <div className="flex items-center py-1">
                  <input
                    {...register("terms", { required: true })}
                    type="checkbox"
                    id="terms"
                    className="custom-checkbox"
                  />
                  <label
                    htmlFor="terms"
                    className="ml-2 text-xs font-light text-gray-400"
                  >
                    I agree to the{" "}
                    <Link href="#" className="text-primary hover:underline">
                      Terms
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg text-sm font-bold text-background-dark bg-primary hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(19,218,236,0.2)]"
                >
                  Start Chatting
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase text-gray-500 tracking-tighter">
                  <span className="px-2 bg-[#132123]">Social Signup</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex justify-center items-center py-2 border border-gray-800 rounded-lg bg-background-dark/30 text-xs font-medium text-gray-300 hover:bg-gray-800 transition-colors">
                  <img
                    src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
                    className="h-4 w-4 mr-2"
                    alt="Google"
                  />
                  Google
                </button>
                <button className="flex justify-center items-center py-2 border border-gray-800 rounded-lg bg-background-dark/30 text-xs font-medium text-gray-300 hover:bg-gray-800 transition-colors">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </button>
              </div>

              <p className="mt-6 text-center text-xs text-gray-400">
                Joined already?{" "}
                <Link href="/login" className="font-bold text-primary">
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
