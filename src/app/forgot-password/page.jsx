"use client";

import React, { useRef, useState } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

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
      console.log(data);

      if (!res.ok) throw new Error(data.error || "Failed to send reset email");

      await Swal.fire({
        title: "Success!",
        text: "Password reset email sent! Please check your inbox (and spam folder).",
        icon: "success",
        confirmButtonColor: "#F7A703",
        confirmButtonText: "Got it",
        allowOutsideClick: false,
      });

      toast.success("Reset link sent to your email");
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

      await Swal.fire({
        title: "Error",
        text: message,
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-175 h-125 bg-teal-normal/20 rounded-full blur-[120px] opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_center,black_50%,transparent_100%)] pointer-events-none" />
      </div>

      <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 sm:px-6 lg:px-8">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body p-8">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-3 flex justify-center">
              <img
                src="https://i.ibb.co/PG0X3Tbf/Convo-X-logo.png"
                alt="ConvoX Logo"
                className="h-10 w-auto"
              />
            </h1>
            <h2 className="mb-8 text-center text-3xl font-bold text-[#3BCCED]">
              Reset Your Password
            </h2>

            <form onSubmit={handleReset} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  className="input input-bordered w-full focus:input-primary"
                  ref={emailRef}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              {error && (
                <div className="alert alert-error shadow-lg text-sm">
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn w-full bg-[#303082] text-white hover:bg-[#3BCCED] disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <div className="text-center mt-6 text-sm">
              <a href="/login" className="link link-primary">
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
