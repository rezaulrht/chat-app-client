"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ArrowRight, RefreshCcw, AlertCircle } from "lucide-react";
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

const otpSpring = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: 0.3 + i * 0.06,
    },
  }),
};

function VerifyContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);

  const { verifyOTP, resendOTP } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [resendDisabled, countdown]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (isNaN(pastedData)) return;

    const pasteArray = pastedData.split("").slice(0, 6);
    const newOtp = [...otp];

    pasteArray.forEach((char, i) => {
      newOtp[i] = char;
    });

    setOtp(newOtp);

    const nextIndex = Math.min(pasteArray.length, 5);
    inputRefs.current[nextIndex].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length < 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setError("");
    setLoading(true);

    const res = await verifyOTP(email, otpString);
    if (!res.success) {
      setError(res.message);
      setLoading(false);
    } else {
      window.location.href = "/app";
    }
  };

  const handleResend = async () => {
    setError("");
    setResendDisabled(true);
    setCountdown(60);

    const res = await resendOTP(email);
    if (!res.success) {
      setError(res.message);
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-obsidian font-sans text-white flex items-center justify-center relative overflow-hidden pt-16">
      <AuthBackground />

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        <AuthCard>
          <motion.div variants={stagger} initial="hidden" animate="visible">
            {/* Shield Icon */}
            <motion.div variants={fadeUp} className="flex justify-center mb-6">
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
                <Shield className="w-8 h-8 text-primary" />
              </motion.div>
            </motion.div>

            {/* Header */}
            <motion.div variants={fadeUp} className="text-center mb-8">
              <h1 className="text-2xl font-display font-bold tracking-tight text-white mb-2">
                Verify your email
              </h1>
              <p className="text-sm text-slate-400">
                We&apos;ve sent a 6-digit verification code to
                <br />
                <span className="text-white font-mono font-medium">
                  {email}
                </span>
              </p>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs text-left"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <motion.input
                    key={index}
                    custom={index}
                    variants={otpSpring}
                    initial="hidden"
                    animate="visible"
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-14 bg-white/5 border ${
                      error
                        ? "border-red-500/50 focus:ring-red-500/50"
                        : "border-white/10 focus:ring-primary/50"
                    } rounded-lg text-center text-xl font-mono font-bold text-white focus:outline-none focus:ring-2 transition-all duration-300`}
                    autoComplete="off"
                  />
                ))}
              </div>

              <motion.div variants={fadeUp}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  className="w-full py-3.5 rounded-lg text-sm font-bold text-background-dark bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && (
                    <span className="loading loading-spinner loading-xs text-background-dark"></span>
                  )}
                  {loading ? "Verifying..." : "Verify Account"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </motion.button>
              </motion.div>
            </form>

            {/* Resend */}
            <motion.div
              variants={fadeUp}
              className="mt-8 text-center border-t border-white/5 pt-6"
            >
              <p className="text-xs text-slate-400 mb-3">
                Didn&apos;t receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={resendDisabled}
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-white disabled:text-slate-500 transition-colors hover:text-primary"
              >
                <RefreshCcw className="w-4 h-4" />
                {resendDisabled
                  ? `Resend code in ${countdown}s`
                  : "Resend code now"}
              </button>
            </motion.div>
          </motion.div>
        </AuthCard>
      </main>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian flex items-center justify-center">
          <span className="loading loading-spinner text-primary"></span>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
