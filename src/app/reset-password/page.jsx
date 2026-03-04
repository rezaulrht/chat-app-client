"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password Validation
    const password = newPassword.trim();
    const errors = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter.");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter.");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number.");
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character.");
    }

    if (errors.length > 0) {
      setError(errors.join(" ")); // show error under input
      return;
    }

    setError(""); // clear error if valid
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reset/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword }),
        },
      );

      const data = await res.json();

      if (data.success) {
        await Swal.fire({
          title: "Success!",
          text: "Your password has been updated successfully.",
          icon: "success",
          confirmButtonColor: "#4F46E5",
          confirmButtonText: "Go to Login",
        });
        router.push("/login");
      } else {
        await Swal.fire({
          title: "Error",
          text: data.message || "Failed to reset password. Please try again.",
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
      }
    } catch (err) {
      await Swal.fire({
        title: "Error",
        text: "Something went wrong. Please try again later.",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4">
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-full max-w-md text-center border border-purple-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Invalid Link
          </h2>
          <p className="text-gray-600 mb-6">
            The password reset link is invalid or has expired.
          </p>
          <button
            onClick={() => router.push("/forgot-password")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            Request New Reset Link
          </button>
        </div>
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
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-10 w-full max-w-md border border-purple-100/50">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-3 flex justify-center">
            <img
              src="https://i.ibb.co/PG0X3Tbf/Convo-X-logo.png"
              alt="ConvoX Logo"
              className="h-10 w-auto"
            />
          </h1>
          <h2 className="text-3xl font-bold text-center text-[#3BCCED] mb-2">
            Reset Your Password
          </h2>
          <p className="text-center text-gray-500 mb-8 text-sm">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 text-cyan-400 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* ✅ Error message under input */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <button
              type="submit"
              disabled={loading || !newPassword.trim()}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <a
              href="/login"
              className="text-indigo-600 hover:text-indigo-800 hover:underline transition"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
