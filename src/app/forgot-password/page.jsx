"use client";

import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Loader2, KeyRound } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
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

export default function ForgotPasswordPage() {
  const emailRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    const email = emailRef.current?.value?.trim();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      toast.error("Invalid email format");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reset/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send reset email");

      toast.success("Password reset email sent! Please check your inbox (and spam folder).");
      window.open("https://mail.google.com/", "_blank");
    } catch (err) {
      console.error("Reset Error:", err);

      let message = "Something went wrong. Please try again later.";

      if (err.message.includes("user-not-found")) {
        message = "No account found with this email.";
      } else if (err.message.includes("invalid-email")) {
        message = "Please enter a valid email address.";
      } else {
        message = err.message || "Failed to send email";
      }

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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
                  Recovery Protocol
                </h1>
                <p className="font-serif italic text-slate-400">
                  We&apos;ll send you a key to get back in.
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleReset} className="space-y-5">
                <motion.div variants={fadeUp} className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      ref={emailRef}
                      required
                      autoFocus
                      autoComplete="email"
                      className={`block w-full pl-10 pr-4 py-3 bg-white/5 border ${error ? "border-red-500/50" : "border-white/10"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 text-white text-sm transition-all duration-300`}
                    />
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
                    disabled={loading}
                    className="w-full py-3.5 rounded-lg text-sm font-bold text-background-dark bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
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
