
import React from "react";

import Link from "next/link";
import { MessageSquare, User } from "lucide-react";
import LoginButton from "@/components/buttons/LoginButton";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function LoginPage() {
 
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
          <button className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium rounded-lg px-4 py-3 transition-all duration-200 group">
            <img
              src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
              alt="Google"
              className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity"
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
          <form className="space-y-6">
            <div className="relative floating-group">
              <input
                type="email"
                id="email"
                placeholder=" "
                className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary peer text-white transition-all duration-200"
              />
              <label
                htmlFor="email"
                className="absolute left-4 transition-all duration-200 pointer-events-none origin-left"
              >
                Email Address
              </label>
            </div>

            <div className="relative floating-group">
              <input
                type="password"
                id="password"
                placeholder=" "
                className="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary peer text-white transition-all duration-200"
              />
              <label
                htmlFor="password"
                className="absolute left-4 transition-all duration-200 pointer-events-none origin-left"
              >
                Password
              </label>
            </div>

            <div className="flex justify-end">
              <Link
                href="#"
                className="text-xs font-medium text-gray-400 hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <LoginButton></LoginButton>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?
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
