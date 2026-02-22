"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, ArrowRight, RefreshCcw, AlertCircle } from "lucide-react";
import useAuth from "@/hooks/useAuth";

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

  // Keep a ref to all inputs for focusing
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  // Handle Resend Countdown
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
    // Only allow numbers
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Only take last char if pasting multiple
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
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

    // Focus the next available input or the last one
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
      // On success, redirect to chat. Use window.location for hard refresh to ensure NavBar state updates.
      window.location.href = "/chat";
    }
  };

  const handleResend = async () => {
    setError("");
    setResendDisabled(true);
    setCountdown(60);

    const res = await resendOTP(email);
    if (!res.success) {
      setError(res.message);
      setResendDisabled(false); // Let them try again if it failed
      setCountdown(0);
    } else {
      // Show short success message optionally, but visual countdown is usually enough
      console.log("Resent successfully:", res.message);
    }
  };

  if (!email) return null; // Prevent flash before redirect

  return (
    <div className="min-h-screen bg-[#05050A] font-sans text-white flex items-center justify-center relative overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-175 h-125 bg-[#13c8ec]/10 rounded-full blur-[120px] opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_center,black_50%,transparent_100%)] pointer-events-none" />
      </div>

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="glass-panel rounded-2xl p-8 sm:p-10 shadow-2xl border border-white/10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#13c8ec]/10 rounded-full flex items-center justify-center border border-[#13c8ec]/20 shadow-[0_0_15px_rgba(19,200,236,0.2)]">
              <Shield className="w-8 h-8 text-[#13c8ec]" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              Verify your email
            </h1>
            <p className="text-sm text-slate-400">
              We've sent a 6-digit verification code to
              <br />
              <span className="text-white font-medium">{email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-14 bg-white/5 border ${
                    error
                      ? "border-red-500/50 focus:ring-red-500/50"
                      : "border-white/10 focus:ring-[#13c8ec]/50"
                  } rounded-lg text-center text-xl font-bold text-white focus:outline-none focus:ring-2 transition-all`}
                  autoComplete="off"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join("").length < 6}
              className="w-full py-3.5 rounded-lg text-sm font-bold text-background-dark bg-[#13c8ec] hover:bg-[#13c8ec]/90 transition-all shadow-lg shadow-[#13c8ec]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && (
                <span className="loading loading-spinner loading-xs text-background-dark"></span>
              )}
              {loading ? "Verifying..." : "Verify Account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-xs text-slate-400 mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={resendDisabled}
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-white disabled:text-slate-500 transition-colors hover:text-[#13c8ec]"
            >
              <RefreshCcw className={`w-4 h-4 ${resendDisabled ? "" : ""}`} />
              {resendDisabled
                ? `Resend code in ${countdown}s`
                : "Resend code now"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#05050A] flex items-center justify-center">
          <span className="loading loading-spinner text-[#13c8ec]"></span>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
