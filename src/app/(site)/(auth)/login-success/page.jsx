"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import useAuth from "@/hooks/useAuth";
import AuthBackground from "@/components/auth/AuthBackground";
import toast from "react-hot-toast";

function LoginSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { oauthLogin } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const linked = searchParams.get("linked");
    const linkedParam = searchParams.get("linked");
    
    if (token) {
      oauthLogin(token);
      
      // If this was an account linking flow, redirect to profile with connections tab
      if (linked || linkedParam) {
        const provider = linked || linkedParam;
        setTimeout(() => {
          toast.success(`${provider} account linked successfully!`);
          router.push("/profile?tab=connections");
        }, 1500);
      }
    } else {
      router.push("/login");
    }
  }, [searchParams, oauthLogin, router]);

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center relative overflow-hidden">
      <AuthBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center space-y-6"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src="https://i.ibb.co/PG0X3Tbf/Convo-X-logo.png"
            alt="ConvoX Logo"
            className="h-12 w-auto"
          />
        </motion.div>

        <div className="loading loading-spinner loading-lg text-primary"></div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-400 animate-pulse font-medium text-sm"
        >
          Completing secure login...
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function LoginSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-slate-400 font-medium">Loading...</p>
        </div>
      }
    >
      <LoginSuccessContent />
    </Suspense>
  );
}
