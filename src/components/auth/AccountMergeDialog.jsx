"use client";

import React from "react";
import { AlertCircle, ArrowRight, LogIn, Loader2 } from "lucide-react";

/**
 * AccountMergeDialog
 * Shows when OAuth login matches an existing email
 * Allows user to merge accounts or use a different email
 * 
 * Props:
 * - email: string - Email that was found
 * - provider: string - 'google' or 'github'
 * - onConfirm: () => void - Proceed with merge
 * - onCancel: () => void - Use different email or create new account
 * - isLoading: boolean
 */
export default function AccountMergeDialog({
    email,
    provider,
    onConfirm,
    onCancel,
    isLoading = false,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl glass-card border border-white/[0.08] bg-white/[0.03] backdrop-blur-md shadow-2xl p-6 space-y-5 animate-in scale-in duration-200">
                {/* Icon + Header */}
                <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/30 shrink-0">
                        <AlertCircle size={20} className="text-accent" />
                    </div>
                    <div>
                        <h2 className="font-display font-bold text-ivory text-lg">
                            Account Found
                        </h2>
                        <p className="text-ivory/40 text-sm mt-0.5">
                            We found an existing account with this email
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3">
                    <p className="text-sm text-ivory/60">
                        You're signing in with:
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase tracking-widest bg-accent/10 px-2 py-1 rounded border border-accent/30 text-accent">
                            {provider}
                        </span>
                        <span className="text-sm font-mono text-ivory/80">{email}</span>
                    </div>

                    <div className="flex items-center gap-2 text-ivory/40 mt-2">
                        <ArrowRight size={14} />
                        <span className="text-xs">
                            Merging with your existing account
                        </span>
                    </div>
                </div>

                {/* Info box */}
                <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2 text-xs text-ivory/50 leading-relaxed">
                    <p>
                        Your <span className="font-semibold text-ivory/70">{provider}</span> account will be linked to your existing profile. You can log in with either method from now on.
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-ivory text-sm font-mono font-semibold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 hover:from-accent/30 hover:to-accent/20 hover:border-accent/50 text-accent text-sm font-mono font-semibold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <>
                                <LogIn size={14} />
                                Link Accounts
                            </>
                        )}
                    </button>
                </div>

                {/* Footer note */}
                <p className="text-[10px] text-ivory/20 text-center font-mono">
                    Your data will be secure and encrypted
                </p>
            </div>
        </div>
    );
}
