"use client";

import React, { useRef, useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

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

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      toast.error("Invalid email format");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/send-reset-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      await Swal.fire({
        title: "Success!",
        text: "Password reset email sent! Please check your inbox (and spam folder).",
        icon: "success",
        confirmButtonColor: "#F7A703",
        confirmButtonText: "Got it",
        allowOutsideClick: false,
      });

      // Open Gmail (optional)
      window.open("https://mail.google.com/", "_blank");

      toast.success("Reset link sent to your email");
    } catch (err) {
      console.error("Reset Error:", err);

      let message = "Something went wrong. Please try again later.";

      if (
        err.message.includes("not found") ||
        err.message.includes("user-not-found")
      ) {
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
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 sm:px-6 lg:px-8">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body p-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-[#F7A703]">
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn w-full bg-[#303082] text-white hover:bg-[#F7A703] disabled:bg-gray-400"
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
  );
}
