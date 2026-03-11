"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Github,
  AlertCircle,
  Camera,
  X,
} from "lucide-react";
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

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be smaller than 5MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const removeAvatar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ImgBB API key is missing. Please add it to your environment variables.",
      );
    }

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      return data.data.display_url;
    } else {
      throw new Error(data.error?.message || "Image upload failed");
    }
  };

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    try {
      let avatarUrl = "";

      if (avatarFile) {
        avatarUrl = await uploadToImgBB(avatarFile);
      }

      const res = await registerUser(
        data.fullname,
        data.email,
        data.password,
        avatarUrl,
      );

      if (res.success) {
        router.push(`/verify?email=${encodeURIComponent(data.email)}`);
      } else {
        if (res.message && res.message.toLowerCase().includes("not verified")) {
          setError(
            <span>
              {res.message}{" "}
              <Link
                href={`/verify?email=${encodeURIComponent(data.email)}`}
                className="text-primary underline font-bold ml-1 hover:text-white"
              >
                Verify now
              </Link>
            </span>,
          );
        } else {
          setError(res.message);
        }
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
  };

  return (
    <div className="bg-obsidian font-sans text-slate-200 antialiased min-h-screen flex flex-col relative overflow-hidden">
      <AuthBackground variant="blue" />

      <main className="grow flex items-center justify-center p-4 sm:p-6 mt-16 md:mt-20 relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* LEFT SIDE — Brand Panel */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex flex-col justify-center space-y-8 pr-10"
          >
            <div className="flex items-center">
              <img
                src="https://i.ibb.co/PG0X3Tbf/Convo-X-logo.png"
                alt="ConvoX Logo"
                className="h-10 w-auto"
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-display font-extrabold text-white leading-[1.1]">
                Join the future of <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary/80 via-primary to-primary/80">
                  team communication.
                </span>
              </h1>
              <p className="font-serif italic text-lg text-slate-400 max-w-md">
                Where meaningful conversations begin.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex items-center gap-4 text-slate-300"
              >
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-lg font-light tracking-wide">
                  End-to-End Encryption
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="flex items-center gap-4 text-slate-300"
              >
                <Zap className="w-6 h-6 text-primary" />
                <span className="text-lg font-light tracking-wide">
                  Lightning Fast Sync
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT SIDE — Form Card */}
          <div className="w-full max-w-md mx-auto">
            <div className="lg:hidden flex justify-center mb-8">
              <img
                src="https://i.ibb.co/PG0X3Tbf/Convo-X-logo.png"
                alt="ConvoX Logo"
                className="h-10 w-auto"
              />
            </div>

            <AuthCard>
              <motion.div variants={stagger} initial="hidden" animate="visible">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Avatar Upload */}
                  <motion.div
                    variants={fadeUp}
                    className="flex justify-center mb-6"
                  >
                    <div className="relative group cursor-pointer w-28 h-28">
                      <div className="w-full h-full rounded-full border-2 border-white/10 bg-obsidian/50 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(0,211,187,0.15)]">
                        {avatarPreview ? (
                          <>
                            <img
                              src={avatarPreview}
                              alt="Avatar Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                              <button
                                type="button"
                                onClick={removeAvatar}
                                className="bg-red-500/80 hover:bg-red-500 p-2 rounded-full text-white transition-colors"
                                title="Remove Image"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                            <Camera className="w-8 h-8 mb-1" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">
                              Upload
                            </span>
                          </div>
                        )}
                      </div>
                      {!avatarPreview && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          title="Upload Profile Picture"
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* Full Name */}
                  <motion.div variants={fadeUp}>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 ml-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <input
                        {...register("fullname", {
                          required: "Name is required",
                        })}
                        type="text"
                        className={`block w-full pl-10 pr-3 py-2.5 bg-white/5 border ${errors.fullname ? "border-red-500/50" : "border-white/10"} rounded-lg text-white text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition-all duration-300`}
                        placeholder="Jane Doe"
                      />
                    </div>
                    {errors.fullname && (
                      <p className="text-red-500 text-[10px] mt-1 ml-1">
                        {errors.fullname.message}
                      </p>
                    )}
                  </motion.div>

                  {/* Email */}
                  <motion.div variants={fadeUp}>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 ml-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <input
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        type="email"
                        className={`block w-full pl-10 pr-3 py-2.5 bg-white/5 border ${errors.email ? "border-red-500/50" : "border-white/10"} rounded-lg text-white text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition-all duration-300`}
                        placeholder="jane@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-[10px] mt-1 ml-1">
                        {errors.email.message}
                      </p>
                    )}
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={fadeUp}>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 ml-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <input
                        {...register("password", {
                          required: "Password is required",
                          minLength: { value: 8, message: "Min 8 characters" },
                          validate: {
                            uppercase: (v) =>
                              /[A-Z]/.test(v) || "One uppercase letter required",
                            lowercase: (v) =>
                              /[a-z]/.test(v) || "One lowercase letter required",
                            number: (v) => /[0-9]/.test(v) || "One number required",
                            special: (v) =>
                              /[!@#$%^&*(),.?":{}|<>]/.test(v) ||
                              "One special character required",
                          },
                        })}
                        type={showPassword ? "text" : "password"}
                        className={`block w-full pl-10 pr-10 py-2.5 bg-white/5 border ${errors.password ? "border-red-500/50" : "border-white/10"} rounded-lg text-white text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition-all duration-300`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/20 hover:text-primary transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-[10px] mt-1 ml-1">
                        {errors.password.message}
                      </p>
                    )}
                  </motion.div>

                  {/* Terms */}
                  <motion.div
                    variants={fadeUp}
                    className="flex items-center py-1"
                  >
                    <input
                      {...register("terms", {
                        required: "Terms agreement required",
                      })}
                      type="checkbox"
                      id="terms"
                      className="h-4 w-4 rounded border-white/10 bg-obsidian text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="terms"
                      className="ml-2 text-xs font-light text-slate-400"
                    >
                      I agree to the{" "}
                      <Link
                        href="#"
                        className="text-primary hover:underline font-medium"
                      >
                        Terms
                      </Link>
                    </label>
                  </motion.div>
                  {errors.terms && (
                    <p className="text-red-500 text-[10px] ml-1">
                      {errors.terms.message}
                    </p>
                  )}

                  {/* Submit */}
                  <motion.div variants={fadeUp}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-lg text-sm font-bold text-background-dark bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading && (
                        <span className="loading loading-spinner loading-xs text-background-dark"></span>
                      )}
                      {loading ? "Creating Account..." : "Start Chatting"}
                    </motion.button>
                  </motion.div>
                </form>

                {/* Divider */}
                <motion.div variants={fadeUp} className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase text-slate-500 tracking-widest font-bold">
                    <span className="px-3 bg-obsidian">Social Signup</span>
                  </div>
                </motion.div>

                {/* Social Buttons */}
                <motion.div
                  variants={fadeUp}
                  className="grid grid-cols-2 gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOAuth("google")}
                    className="btn btn-outline border-white/10 hover:bg-white/5 text-slate-300 gap-2 h-auto py-2.5 min-h-0 text-xs font-medium"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOAuth("github")}
                    className="btn btn-outline border-white/10 hover:bg-white/5 text-slate-300 gap-2 h-auto py-2.5 min-h-0 text-xs font-medium"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </motion.button>
                </motion.div>

                <motion.p
                  variants={fadeUp}
                  className="mt-8 text-center text-xs text-slate-400"
                >
                  Joined already?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    Log in
                  </Link>
                </motion.p>
              </motion.div>
            </AuthCard>
          </div>
        </div>
      </main>
    </div>
  );
}
