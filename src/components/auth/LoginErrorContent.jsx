"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import AuthBackground from "@/components/auth/AuthBackground";
import AuthCard from "@/components/auth/AuthCard";

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function LoginErrorContent() {
  return (
    <div className="min-h-screen bg-obsidian font-sans text-white flex items-center justify-center relative overflow-hidden">
      <AuthBackground variant="error" />

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        <AuthCard>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Shield Icon */}
            <motion.div variants={fadeUp} className="flex justify-center mb-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1,
                }}
                className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center ring-1 ring-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
              >
                <ShieldAlert className="w-10 h-10 text-red-500" />
              </motion.div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-3xl font-display font-bold tracking-tight text-white mb-3"
            >
              Authentication Failed
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="font-serif italic text-slate-400 mb-2"
            >
              The door remains sealed.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="text-sm text-slate-400 mb-8 leading-relaxed"
            >
              We couldn&apos;t complete your login. This usually happens if the
              authorization was cancelled or if there was a problem with the
              provider.
            </motion.p>

            <motion.div variants={fadeUp} className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/login"
                  className="w-full py-3.5 rounded-lg text-sm font-bold text-background-dark bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </motion.div>

              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Secure & Private.
              </p>
            </motion.div>
          </motion.div>
        </AuthCard>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-10"
        >
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
            &copy; 2026 ConvoX. Let&apos;s get you back.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
