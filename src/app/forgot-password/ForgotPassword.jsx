"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const { forgotPass, emailValue } = useContext(AuthContext);
  const emailRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailValue && emailRef.current) {
      emailRef.current.value = emailValue;
    }
  }, [emailValue]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    const email = emailRef.current?.value?.trim();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      await forgotPass(email);

      await Swal.fire({
        title: "Success!",
        text: "Password reset email sent! Please check your inbox (and spam folder).",
        icon: "success",
        confirmButtonColor: "#F7A703",
        confirmButtonText: "Got it",
        allowOutsideClick: false,
      });

      window.open("https://mail.google.com/", "_blank");

      toast.success("Reset link sent to your email");
    } catch (err) {
      let message = "Something went wrong. Please try again later.";

      if (err?.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (err?.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (err?.message) {
        message = err.message;
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
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
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
        </div>
      </div>
    </div>
  );
}