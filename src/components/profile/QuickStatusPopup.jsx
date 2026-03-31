"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Send, Smile } from "lucide-react";

/**
 * QuickStatusPopup
 * Small inline popup for quickly editing status message
 * Appears near status area, can auto-close on escape/outside click
 * 
 * Props:
 * - currentStatus?: string - Current status message
 * - onSave: (newStatus: string) => void
 * - onCancel?: () => void
 * - position?: { x: number, y: number } - Position near trigger element
 * - isLoading?: boolean
 */
export default function QuickStatusPopup({
    currentStatus = "",
    onSave,
    onCancel,
    position = { x: 0, y: 0 },
    isLoading = false,
}) {
    const [status, setStatus] = useState(currentStatus);
    const popupRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                onCancel?.();
            }
        };

        const handleEscape = (e) => {
            if (e.key === "Escape") {
                onCancel?.();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onCancel]);

    const handleSave = () => {
        onSave?.(status.trim());
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSave();
        }
    };

    return (
        <div
            ref={popupRef}
            className="fixed z-50 w-80 animate-in fade-in scale-in duration-200"
            style={{
                top: `${position.y + 40}px`,
                left: `${Math.max(16, position.x - 160)}px`,
            }}
        >
            {/* Arrow pointing up */}
            <div className="absolute -top-1 left-8 w-2 h-2 bg-deep rotate-45 border-l border-t border-white/[0.08]" />

            {/* Popup container */}
            <div className="relative rounded-xl border border-white/[0.08] bg-deep/95 backdrop-blur-md shadow-xl p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-mono uppercase tracking-widest text-ivory/40">
                        Status
                    </p>
                    <button
                        onClick={onCancel}
                        className="w-5 h-5 rounded-md flex items-center justify-center text-ivory/30 hover:text-ivory/60 hover:bg-white/[0.06] transition-all"
                    >
                        <X size={12} />
                    </button>
                </div>

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What's on your mind?"
                    maxLength={100}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] focus:border-accent/50 text-ivory placeholder:text-ivory/30 text-sm outline-none transition-all"
                />

                {/* Character count */}
                <div className="flex items-center justify-between text-[10px] text-ivory/40">
                    <p>{status.length}/100</p>
                    {status.length > 85 && (
                        <p className="text-yellow-400/60">Getting long...</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-ivory/60 hover:text-ivory text-xs font-mono font-semibold uppercase transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20 border border-accent/30 text-accent disabled:opacity-50 disabled:cursor-not-allowed text-xs font-mono font-semibold uppercase transition-all"
                    >
                        {isLoading ? (
                            <div className="w-3 h-3 rounded-full border border-accent/50 border-t-accent animate-spin" />
                        ) : (
                            <Send size={12} />
                        )}
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
