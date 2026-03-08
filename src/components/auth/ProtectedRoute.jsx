"use client";

import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!user.isVerified) {
        router.push(`/verify?email=${encodeURIComponent(user.email)}`);
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-slate-500 text-sm animate-pulse">
            Authenticating...
          </p>
        </motion.div>
      </div>
    );
  }

  return user && user.isVerified ? children : null;
};

export default ProtectedRoute;
